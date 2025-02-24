import { getApiBaseUrl } from "../../../common/api/common/Env";
import { ImportMailStateTypeRef, MailFolderTypeRef } from "../../../common/api/entities/tutanota/TypeRefs";
import { assertNotNull, first, isEmpty } from "@tutao/tutanota-utils";
import m from "mithril";
import { elementIdPart, GENERATED_MIN_ID, isSameId } from "../../../common/api/common/utils/EntityUtils.js";
import { EstimatingProgressMonitor } from "../../../common/api/common/utils/EstimatingProgressMonitor.js";
import { ProgrammingError } from "../../../common/api/common/error/ProgrammingError.js";
import { isUpdateForTypeRef } from "../../../common/api/common/utils/EntityUpdateUtils";
import { MailImportError } from "../../../common/api/common/error/MailImportError.js";
import { showSnackBar } from "../../../common/gui/base/SnackBar.js";
import { Dialog } from "../../../common/gui/base/Dialog";
import { MailSetKind } from "../../../common/api/common/TutanotaConstants";
import { mailLocator } from "../../mailLocator";
const DEFAULT_TOTAL_WORK = 10000;
export class MailImporter {
    domainConfigProvider;
    loginController;
    mailboxModel;
    entityClient;
    credentialsProvider;
    nativeMailImportFacade;
    openSettingsHandler;
    finalisedImportStates = new Map();
    activeImport = null;
    foldersForMailbox;
    selectedTargetFolder = null;
    constructor(domainConfigProvider, loginController, mailboxModel, entityClient, eventController, credentialsProvider, nativeMailImportFacade, openSettingsHandler) {
        this.domainConfigProvider = domainConfigProvider;
        this.loginController = loginController;
        this.mailboxModel = mailboxModel;
        this.entityClient = entityClient;
        this.credentialsProvider = credentialsProvider;
        this.nativeMailImportFacade = nativeMailImportFacade;
        this.openSettingsHandler = openSettingsHandler;
        eventController.addEntityListener((updates) => this.entityEventsReceived(updates));
    }
    async getMailbox() {
        return assertNotNull(first(await this.mailboxModel.getMailboxDetails())).mailbox;
    }
    async initImportMailStates() {
        await this.checkForResumableImport();
        const importMailStatesCollection = await this.entityClient.loadAll(ImportMailStateTypeRef, (await this.getMailbox()).mailImportStates);
        for (const importMailState of importMailStatesCollection) {
            if (this.isFinalisedImport(importMailState)) {
                this.updateFinalisedImport(elementIdPart(importMailState._id), importMailState);
            }
        }
        m.redraw();
    }
    async checkForResumableImport() {
        const importFacade = assertNotNull(this.nativeMailImportFacade);
        const mailbox = await this.getMailbox();
        this.foldersForMailbox = this.getFoldersForMailGroup(assertNotNull(mailbox._ownerGroup));
        let activeImportId = null;
        if (this.activeImport === null) {
            const mailOwnerGroupId = assertNotNull(mailbox._ownerGroup);
            const userId = this.loginController.getUserController().userId;
            const unencryptedCredentials = assertNotNull(await this.credentialsProvider?.getDecryptedCredentialsByUserId(userId));
            const apiUrl = getApiBaseUrl(this.domainConfigProvider.getCurrentDomainConfig());
            this.selectedTargetFolder = this.foldersForMailbox.getSystemFolderByType(MailSetKind.ARCHIVE);
            try {
                activeImportId = await importFacade.getResumableImport(mailbox._id, mailOwnerGroupId, unencryptedCredentials, apiUrl);
            }
            catch (e) {
                if (e instanceof MailImportError)
                    this.handleError(e).catch();
                else
                    throw e;
            }
            this.listenForError(importFacade, mailbox._id).then();
        }
        if (activeImportId) {
            // we can't use the result of loadAll (see below) as that might only read from offline cache and
            // not include a new ImportMailState that was created without sending an entity event
            const importMailState = await this.entityClient.load(ImportMailStateTypeRef, activeImportId);
            const remoteStatus = parseInt(importMailState.status);
            switch (remoteStatus) {
                case 2 /* ImportStatus.Canceled */:
                case 3 /* ImportStatus.Finished */:
                    activeImportId = null;
                    this.activeImport = null;
                    this.selectedTargetFolder = this.foldersForMailbox.getSystemFolderByType(MailSetKind.ARCHIVE);
                    break;
                case 1 /* ImportStatus.Paused */:
                case 0 /* ImportStatus.Running */: {
                    let progressMonitor = this.activeImport?.progressMonitor ?? null;
                    if (!progressMonitor) {
                        const totalCount = parseInt(importMailState.totalMails);
                        const doneCount = parseInt(importMailState.failedMails) + parseInt(importMailState.successfulMails);
                        progressMonitor = this.createEstimatingProgressMonitor(totalCount);
                        progressMonitor.totalWorkDone(doneCount);
                    }
                    this.activeImport = {
                        remoteStateId: activeImportId,
                        uiStatus: 4 /* UiImportStatus.Paused */,
                        progressMonitor,
                    };
                    this.selectedTargetFolder = await this.entityClient.load(MailFolderTypeRef, importMailState.targetFolder);
                }
            }
        }
    }
    async entityEventsReceived(updates) {
        for (const update of updates) {
            if (isUpdateForTypeRef(ImportMailStateTypeRef, update)) {
                const updatedState = await this.entityClient.load(ImportMailStateTypeRef, [update.instanceListId, update.instanceId]);
                await this.newImportStateFromServer(updatedState);
            }
        }
    }
    async newImportStateFromServer(serverState) {
        const remoteStatus = parseInt(serverState.status);
        const wasUpdatedForThisImport = this.activeImport !== null && isSameId(this.activeImport.remoteStateId, serverState._id);
        if (wasUpdatedForThisImport) {
            if (isFinalisedImport(remoteStatus)) {
                this.resetStatus();
                this.updateFinalisedImport(elementIdPart(serverState._id), serverState);
            }
            else {
                const activeImport = assertNotNull(this.activeImport);
                activeImport.uiStatus = importStatusToUiImportStatus(remoteStatus);
                const newTotalWork = parseInt(serverState.totalMails);
                const newDoneWork = parseInt(serverState.successfulMails) + parseInt(serverState.failedMails);
                activeImport.progressMonitor.updateTotalWork(newTotalWork);
                activeImport.progressMonitor.totalWorkDone(newDoneWork);
                if (remoteStatus === 1 /* ImportStatus.Paused */) {
                    activeImport.progressMonitor.pauseEstimation();
                }
                else {
                    activeImport.progressMonitor.continueEstimation();
                }
            }
        }
        else {
            this.updateFinalisedImport(elementIdPart(serverState._id), serverState);
        }
        m.redraw();
    }
    createEstimatingProgressMonitor(totalWork = DEFAULT_TOTAL_WORK) {
        return new EstimatingProgressMonitor(totalWork, (_) => {
            m.redraw();
        });
    }
    isFinalisedImport(importMailState) {
        return parseInt(importMailState.status) == 3 /* ImportStatus.Finished */ || parseInt(importMailState.status) == 2 /* ImportStatus.Canceled */;
    }
    getFoldersForMailGroup(mailGroupId) {
        if (mailGroupId) {
            const folderSystem = mailLocator.mailModel.getFolderSystemByGroupId(mailGroupId);
            if (folderSystem) {
                return folderSystem;
            }
        }
        throw new Error("could not load folder list");
    }
    /// start a loop that listens to an arbitrary amount of errors that can happen during the import process.
    async listenForError(importFacade, mailboxId) {
        while (true) {
            try {
                await importFacade.setAsyncErrorHook(mailboxId);
            }
            catch (e) {
                if (e instanceof MailImportError) {
                    this.handleError(e).catch();
                    continue;
                }
                throw e;
            }
            throw new ProgrammingError("setAsyncErrorHook should never complete normally!");
        }
    }
    async handleError(err) {
        if (this.activeImport) {
            this.activeImport.uiStatus = 4 /* UiImportStatus.Paused */;
            this.activeImport.progressMonitor.pauseEstimation();
        }
        if (err.data.category == 0 /* ImportErrorCategories.ImportFeatureDisabled */) {
            await Dialog.message("mailImportErrorServiceUnavailable_msg");
        }
        else if (err.data.category == 5 /* ImportErrorCategories.ConcurrentImport */) {
            console.log("Tried to start concurrent import");
            showSnackBar({
                message: "pleaseWait_msg",
                button: {
                    label: "ok_action",
                    click: () => { },
                },
            });
        }
        else {
            console.log(`Error while importing mails, category: ${err.data.category}, source: ${err.data.source}`);
            const navigateToImportSettings = {
                label: "show_action",
                click: () => this.openSettingsHandler.openSettings("mailImport"),
            };
            showSnackBar({ message: "someMailFailedImport_msg", button: navigateToImportSettings });
        }
    }
    /**
     * Call to the nativeMailImportFacade in worker to start a mail import from .eml or .mbox files.
     * @param filePaths to the .eml/.mbox files to import mails from
     */
    async onStartBtnClick(filePaths) {
        if (isEmpty(filePaths))
            return;
        if (!this.shouldRenderStartButton())
            throw new ProgrammingError("can't change state to starting");
        const apiUrl = getApiBaseUrl(this.domainConfigProvider.getCurrentDomainConfig());
        const mailbox = await this.getMailbox();
        const mailboxId = mailbox._id;
        const mailOwnerGroupId = assertNotNull(mailbox._ownerGroup);
        const userId = this.loginController.getUserController().userId;
        const importFacade = assertNotNull(this.nativeMailImportFacade);
        const selectedTargetFolder = assertNotNull(this.selectedTargetFolder);
        const unencryptedCredentials = assertNotNull(await this.credentialsProvider?.getDecryptedCredentialsByUserId(userId));
        this.resetStatus();
        let progressMonitor = this.createEstimatingProgressMonitor();
        this.activeImport = {
            remoteStateId: [GENERATED_MIN_ID, GENERATED_MIN_ID],
            uiStatus: 0 /* UiImportStatus.Starting */,
            progressMonitor,
        };
        this.activeImport?.progressMonitor?.continueEstimation();
        m.redraw();
        try {
            this.activeImport.remoteStateId = await importFacade.prepareNewImport(mailboxId, mailOwnerGroupId, selectedTargetFolder._id, filePaths, unencryptedCredentials, apiUrl);
        }
        catch (e) {
            this.resetStatus();
            m.redraw();
            if (e instanceof MailImportError) {
                this.handleError(e).catch();
            }
            else {
                throw e;
            }
        }
        await importFacade.setProgressAction(mailboxId, 0 /* ImportProgressAction.Continue */);
    }
    async onPauseBtnClick() {
        let activeImport = assertNotNull(this.activeImport);
        if (activeImport.uiStatus !== 2 /* UiImportStatus.Running */)
            throw new ProgrammingError("can't change state to pausing");
        activeImport.uiStatus = 3 /* UiImportStatus.Pausing */;
        activeImport.progressMonitor.pauseEstimation();
        m.redraw();
        const mailboxId = (await this.getMailbox())._id;
        const nativeImportFacade = assertNotNull(this.nativeMailImportFacade);
        await nativeImportFacade.setProgressAction(mailboxId, 1 /* ImportProgressAction.Pause */);
    }
    async onResumeBtnClick() {
        if (!this.shouldRenderResumeButton())
            throw new ProgrammingError("can't change state to resuming");
        let activeImport = assertNotNull(this.activeImport);
        activeImport.uiStatus = 1 /* UiImportStatus.Resuming */;
        activeImport.progressMonitor.continueEstimation();
        m.redraw();
        const mailboxId = (await this.getMailbox())._id;
        const nativeImportFacade = assertNotNull(this.nativeMailImportFacade);
        await nativeImportFacade.setProgressAction(mailboxId, 0 /* ImportProgressAction.Continue */);
    }
    async onCancelBtnClick() {
        if (!this.shouldRenderCancelButton())
            throw new ProgrammingError("can't change state to cancelling");
        let activeImport = assertNotNull(this.activeImport);
        activeImport.uiStatus = 5 /* UiImportStatus.Cancelling */;
        activeImport.progressMonitor.pauseEstimation();
        m.redraw();
        const mailboxId = (await this.getMailbox())._id;
        const nativeImportFacade = assertNotNull(this.nativeMailImportFacade);
        await nativeImportFacade.setProgressAction(mailboxId, 2 /* ImportProgressAction.Stop */);
    }
    shouldRenderStartButton() {
        return this.activeImport === null;
    }
    shouldRenderImportStatus() {
        const activeImportStatus = this.getUiStatus();
        if (activeImportStatus === null)
            return false;
        return (activeImportStatus === 0 /* UiImportStatus.Starting */ ||
            activeImportStatus === 2 /* UiImportStatus.Running */ ||
            activeImportStatus === 3 /* UiImportStatus.Pausing */ ||
            activeImportStatus === 4 /* UiImportStatus.Paused */ ||
            activeImportStatus === 5 /* UiImportStatus.Cancelling */ ||
            activeImportStatus === 1 /* UiImportStatus.Resuming */);
    }
    shouldRenderPauseButton() {
        const activeImportStatus = this.getUiStatus();
        if (activeImportStatus === null)
            return false;
        return activeImportStatus === 2 /* UiImportStatus.Running */ || activeImportStatus === 0 /* UiImportStatus.Starting */ || activeImportStatus === 3 /* UiImportStatus.Pausing */;
    }
    shouldDisablePauseButton() {
        const activeImportStatus = this.getUiStatus();
        if (activeImportStatus === null)
            return false;
        return activeImportStatus === 3 /* UiImportStatus.Pausing */ || activeImportStatus === 0 /* UiImportStatus.Starting */;
    }
    shouldRenderResumeButton() {
        const activeImportStatus = this.getUiStatus();
        if (activeImportStatus === null)
            return false;
        return activeImportStatus === 4 /* UiImportStatus.Paused */ || activeImportStatus === 1 /* UiImportStatus.Resuming */;
    }
    shouldDisableResumeButton() {
        const activeImportStatus = this.getUiStatus();
        if (activeImportStatus === null)
            return false;
        return activeImportStatus === 1 /* UiImportStatus.Resuming */ || activeImportStatus === 0 /* UiImportStatus.Starting */;
    }
    shouldRenderCancelButton() {
        const activeImportStatus = this.getUiStatus();
        if (activeImportStatus === null)
            return false;
        return (activeImportStatus === 4 /* UiImportStatus.Paused */ ||
            activeImportStatus === 2 /* UiImportStatus.Running */ ||
            activeImportStatus === 3 /* UiImportStatus.Pausing */ ||
            activeImportStatus === 5 /* UiImportStatus.Cancelling */);
    }
    shouldDisableCancelButton() {
        const activeImportStatus = this.getUiStatus();
        return (activeImportStatus === 5 /* UiImportStatus.Cancelling */ || activeImportStatus === 3 /* UiImportStatus.Pausing */ || activeImportStatus === 0 /* UiImportStatus.Starting */);
    }
    shouldRenderProcessedMails() {
        const activeImportStatus = this.getUiStatus();
        return (this.activeImport?.progressMonitor?.totalWork != DEFAULT_TOTAL_WORK &&
            (activeImportStatus === 2 /* UiImportStatus.Running */ ||
                activeImportStatus === 1 /* UiImportStatus.Resuming */ ||
                activeImportStatus === 3 /* UiImportStatus.Pausing */ ||
                activeImportStatus === 4 /* UiImportStatus.Paused */));
    }
    getTotalMailsCount() {
        return assertNotNull(this.activeImport).progressMonitor.totalWork;
    }
    getProcessedMailsCount() {
        const progressMonitor = assertNotNull(this.activeImport).progressMonitor;
        return Math.min(Math.round(progressMonitor.workCompleted), progressMonitor.totalWork);
    }
    getProgress() {
        const progressMonitor = assertNotNull(this.activeImport).progressMonitor;
        return Math.ceil(progressMonitor.percentage());
    }
    getFinalisedImports() {
        return Array.from(this.finalisedImportStates.values());
    }
    updateFinalisedImport(importMailStateElementId, importMailState) {
        this.finalisedImportStates.set(importMailStateElementId, importMailState);
    }
    resetStatus() {
        this.activeImport?.progressMonitor?.pauseEstimation();
        this.activeImport = null;
    }
    getUiStatus() {
        return this.activeImport?.uiStatus ?? null;
    }
}
function importStatusToUiImportStatus(importStatus) {
    // We do not render ImportStatus.Finished and ImportStatus.Canceled
    // in the UI, and therefore return the corresponding previous states.
    switch (importStatus) {
        case 3 /* ImportStatus.Finished */:
            return 2 /* UiImportStatus.Running */;
        case 2 /* ImportStatus.Canceled */:
            return 5 /* UiImportStatus.Cancelling */;
        case 1 /* ImportStatus.Paused */:
            return 4 /* UiImportStatus.Paused */;
        case 0 /* ImportStatus.Running */:
            return 2 /* UiImportStatus.Running */;
    }
}
export function isFinalisedImport(remoteImportStatus) {
    return remoteImportStatus == 2 /* ImportStatus.Canceled */ || remoteImportStatus == 3 /* ImportStatus.Finished */;
}
//# sourceMappingURL=MailImporter.js.map