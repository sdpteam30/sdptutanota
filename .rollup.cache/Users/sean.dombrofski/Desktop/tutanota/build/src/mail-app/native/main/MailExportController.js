import stream from "mithril/stream";
import { GENERATED_MAX_ID, getElementId, isSameId } from "../../../common/api/common/utils/EntityUtils.js";
import { assertNotNull, delay, filterInt, isNotNull, lastThrow } from "@tutao/tutanota-utils";
import { CancelledError } from "../../../common/api/common/error/CancelledError.js";
import { FileOpenError } from "../../../common/api/common/error/FileOpenError.js";
import { isOfflineError } from "../../../common/api/common/utils/ErrorUtils.js";
import { SuspensionError } from "../../../common/api/common/error/SuspensionError";
import { ExportError } from "../../../common/api/common/error/ExportError";
import { assertMainOrNode } from "../../../common/api/common/Env";
assertMainOrNode();
const TAG = "MailboxExport";
/**
 * Controller to keep the state of mail exporting with the details.
 */
export class MailExportController {
    mailExportFacade;
    sanitizer;
    exportFacade;
    logins;
    mailboxModel;
    scheduler;
    _state = stream({ type: "idle" });
    servers;
    serverIndex = 0;
    constructor(mailExportFacade, sanitizer, exportFacade, logins, mailboxModel, scheduler) {
        this.mailExportFacade = mailExportFacade;
        this.sanitizer = sanitizer;
        this.exportFacade = exportFacade;
        this.logins = logins;
        this.mailboxModel = mailboxModel;
        this.scheduler = scheduler;
    }
    get state() {
        return this._state;
    }
    get userId() {
        return this.logins.getUserController().userId;
    }
    /**
     * Start exporting the mailbox for the user
     * @param mailboxDetail
     */
    async startExport(mailboxDetail) {
        const allMailBags = [assertNotNull(mailboxDetail.mailbox.currentMailBag), ...mailboxDetail.mailbox.archivedMailBags];
        try {
            await this.exportFacade.startMailboxExport(this.userId, mailboxDetail.mailbox._id, allMailBags[0]._id, GENERATED_MAX_ID);
        }
        catch (e) {
            if (e instanceof CancelledError) {
                console.log("Export start cancelled");
                return;
            }
            else if (e instanceof ExportError && e.data === "LockedForUser" /* ExportErrorReason.LockedForUser */) {
                this._state({ type: "locked" });
                return;
            }
            else {
                throw e;
            }
        }
        this._state({ type: "exporting", mailboxDetail: mailboxDetail, progress: 0, exportedMails: 0 });
        await this.runExport(mailboxDetail, allMailBags, GENERATED_MAX_ID);
    }
    async resumeIfNeeded() {
        const exportState = await this.exportFacade.getMailboxExportState(this.userId);
        console.log(TAG, `Export, previous state: ${exportState?.type}`);
        if (exportState) {
            if (exportState.type === "running") {
                const mailboxDetail = await this.mailboxModel.getMailboxDetailByMailboxId(exportState.mailboxId);
                if (mailboxDetail == null) {
                    console.warn(TAG, `Did not find mailbox to resume export: ${exportState.mailboxId}`);
                    await this.cancelExport();
                    return;
                }
                this._state({
                    type: "exporting",
                    mailboxDetail: mailboxDetail,
                    progress: 0,
                    exportedMails: exportState.exportedMails,
                });
                await this.resumeExport(mailboxDetail, exportState.mailBagId, exportState.mailId);
            }
            else if (exportState.type === "finished") {
                const mailboxDetail = await this.mailboxModel.getMailboxDetailByMailboxId(exportState.mailboxId);
                if (mailboxDetail == null) {
                    console.warn(TAG, `Did not find mailbox to resume export: ${exportState.mailboxId}`);
                    await this.cancelExport();
                    return;
                }
                this._state({ type: "finished", mailboxDetail: mailboxDetail });
            }
            else if (exportState.type === "locked") {
                this._state({ type: "locked" });
                this.scheduler.scheduleAfter(() => this.resumeIfNeeded(), 1000 * 60 * 5); // 5 min
            }
        }
    }
    async openExportDirectory() {
        if (this._state().type === "finished") {
            await this.exportFacade.openExportDirectory(this.userId);
        }
    }
    /**
     * When the user wants to cancel the exporting
     */
    async cancelExport() {
        this._state({ type: "idle" });
        await this.exportFacade.clearExportState(this.userId);
    }
    async resumeExport(mailboxDetail, mailbagId, mailId) {
        console.log(TAG, `Resuming export from mail bag: ${mailbagId} ${mailId}`);
        const allMailBags = [assertNotNull(mailboxDetail.mailbox.currentMailBag), ...mailboxDetail.mailbox.archivedMailBags];
        const currentMailBagIndex = allMailBags.findIndex((mb) => mb._id === mailbagId);
        const mailBags = allMailBags.slice(currentMailBagIndex);
        await this.runExport(mailboxDetail, mailBags, mailId);
    }
    async runExport(mailboxDetail, mailBags, mailId) {
        this.servers = await this.mailExportFacade.getExportServers(mailboxDetail.mailGroup);
        for (const mailBag of mailBags) {
            await this.exportMailBag(mailBag, mailId);
            if (this._state().type !== "exporting") {
                return;
            }
        }
        if (this._state().type !== "exporting") {
            return;
        }
        await this.exportFacade.endMailboxExport(this.userId);
        this._state({ type: "finished", mailboxDetail: mailboxDetail });
    }
    async exportMailBag(mailBag, startId) {
        let currentStartId = startId;
        while (true) {
            try {
                const downloadedMails = await this.mailExportFacade.loadFixedNumberOfMailsWithCache(mailBag.mails, currentStartId, this.getServerUrl());
                if (downloadedMails.length === 0) {
                    break;
                }
                const downloadedMailDetails = await this.mailExportFacade.loadMailDetails(downloadedMails);
                const attachmentInfo = await this.mailExportFacade.loadAttachments(downloadedMails, this.getServerUrl());
                for (const { mail, mailDetails } of downloadedMailDetails) {
                    if (this._state().type !== "exporting") {
                        return;
                    }
                    const mailAttachmentInfo = mail.attachments
                        .map((attachmentId) => attachmentInfo.find((attachment) => isSameId(attachment._id, attachmentId)))
                        .filter(isNotNull);
                    const attachments = await this.mailExportFacade.loadAttachmentData(mail, mailAttachmentInfo);
                    const { makeMailBundle } = await import("../../mail/export/Bundler.js");
                    const mailBundle = makeMailBundle(this.sanitizer, mail, mailDetails, attachments);
                    // can't write export if it was canceled
                    if (this._state().type !== "exporting") {
                        return;
                    }
                    try {
                        await this.exportFacade.saveMailboxExport(mailBundle, this.userId, mailBag._id, getElementId(mail));
                    }
                    catch (e) {
                        if (e instanceof FileOpenError) {
                            this._state({ type: "error", message: e.message });
                            return;
                        }
                        else {
                            throw e;
                        }
                    }
                }
                currentStartId = getElementId(lastThrow(downloadedMails));
                const currentState = this._state();
                if (currentState.type != "exporting") {
                    return;
                }
                this._state({ ...currentState, exportedMails: currentState.exportedMails + downloadedMails.length });
            }
            catch (e) {
                if (isOfflineError(e)) {
                    console.log(TAG, "Offline, will retry later");
                    await delay(1000 * 60); // 1 min
                }
                else if (e instanceof SuspensionError) {
                    const timeToWait = Math.max(filterInt(assertNotNull(e.data)), 1);
                    console.log(TAG, `Pausing for ${Math.floor(timeToWait / 1000 + 0.5)} seconds`);
                    await delay(timeToWait);
                    if (this._state().type !== "exporting") {
                        return;
                    }
                }
                else {
                    throw e;
                }
                console.log(TAG, "Trying to continue with export");
            }
        }
    }
    getServerUrl() {
        if (this.servers) {
            this.serverIndex += 1;
            if (this.serverIndex >= this.servers.length) {
                this.serverIndex = 0;
            }
            return this.servers[this.serverIndex].url;
        }
        throw new Error("No servers");
    }
}
//# sourceMappingURL=MailExportController.js.map