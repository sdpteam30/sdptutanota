import { createDataFile } from "../../api/common/DataFile.js";
import { fileExists } from "../PathUtils.js";
import path from "node:path";
import { DesktopConfigKey } from "../config/ConfigKeys.js";
import { Attachment, Email, MessageEditorFormat } from "@tutao/oxmsg";
import { sanitizeFilename } from "../../api/common/utils/FileUtils.js";
import { promises as fs } from "node:fs";
import { CancelledError } from "../../api/common/error/CancelledError.js";
import { ProgrammingError } from "../../api/common/error/ProgrammingError.js";
import { generateExportFileName, mailToEmlFile } from "../../../mail-app/mail/export/emlUtils.js";
import { formatSortableDate } from "@tutao/tutanota-utils";
import { FileOpenError } from "../../api/common/error/FileOpenError.js";
import { ExportError } from "../../api/common/error/ExportError";
import { elementIdPart } from "../../api/common/utils/EntityUtils";
const EXPORT_DIR = "export";
export class DesktopExportFacade {
    tfs;
    electron;
    conf;
    window;
    dragIcons;
    mailboxExportPersistence;
    fs;
    dateProvider;
    desktopExportLock;
    constructor(tfs, electron, conf, window, dragIcons, mailboxExportPersistence, fs, dateProvider, desktopExportLock) {
        this.tfs = tfs;
        this.electron = electron;
        this.conf = conf;
        this.window = window;
        this.dragIcons = dragIcons;
        this.mailboxExportPersistence = mailboxExportPersistence;
        this.fs = fs;
        this.dateProvider = dateProvider;
        this.desktopExportLock = desktopExportLock;
    }
    async checkFileExistsInExportDir(fileName) {
        return fileExists(path.join(await this.getExportDirectoryPath(), fileName));
    }
    async mailToMsg(bundle, fileName) {
        const subject = `[Tuta Mail] ${bundle.subject}`;
        const email = new Email(bundle.isDraft, bundle.isRead)
            .subject(subject)
            .bodyHtml(bundle.body)
            .bodyFormat(MessageEditorFormat.EDITOR_FORMAT_HTML)
            .sender(bundle.sender.address, bundle.sender.name)
            .tos(bundle.to)
            .ccs(bundle.cc)
            .bccs(bundle.bcc)
            .replyTos(bundle.replyTo)
            .sentOn(new Date(bundle.sentOn))
            .receivedOn(new Date(bundle.receivedOn))
            .headers(bundle.headers || "");
        for (let attachment of bundle.attachments) {
            // When the MailBundle gets passed over via the IPC it loses some of it's type information. the Uint8Arrays stored in the
            // attachment DataFiles cease to be Uint8Arrays and just because regular arrays, thus we have to remake them here.
            // Oxmsg currently doesn't accept regular arrays for binary data, only Uint8Arrays, strings and booleans
            // we could change the Oxmsg behaviour, it's kind of nice for it to be strict though.
            email.attach(new Attachment(new Uint8Array(attachment.data), attachment.name, attachment.cid || ""));
        }
        return createDataFile(fileName, "application/vnd.ms-outlook", email.msg());
    }
    async saveToExportDir(file) {
        const exportDir = await this.getExportDirectoryPath();
        const fullPath = path.join(exportDir, sanitizeFilename(file.name));
        return fs.writeFile(fullPath, file.data);
    }
    async startNativeDrag(fileNames) {
        const exportDir = await this.getExportDirectoryPath();
        const files = fileNames.map((fileName) => path.join(exportDir, fileName)).filter(fileExists);
        const exportMode = await this.conf.getVar(DesktopConfigKey.mailExportMode);
        const icon = this.dragIcons[exportMode];
        this.window._browserWindow.webContents.startDrag({
            file: "",
            files,
            icon,
        });
    }
    async startMailboxExport(userId, mailboxId, mailBagId, mailId) {
        if (this.desktopExportLock.acquireLock(userId) === 1 /* LockResult.AlreadyLocked */) {
            throw new ExportError(`Export is locked for user: ${userId}`, "LockedForUser" /* ExportErrorReason.LockedForUser */);
        }
        const previousExportState = await this.mailboxExportPersistence.getStateForUser(userId);
        if (previousExportState != null && previousExportState.type !== "finished") {
            throw new ExportError(`Export is already running for user: ${userId}`, "RunningForUser" /* ExportErrorReason.RunningForUser */);
        }
        const directory = await this.electron.dialog
            .showOpenDialog(this.window._browserWindow, {
            properties: ["openDirectory"],
        })
            .then(({ filePaths }) => filePaths[0] ?? null);
        if (directory == null) {
            this.desktopExportLock.unlock(userId);
            throw new CancelledError("Directory picking canceled");
        }
        const folderName = `TutaExport-${formatSortableDate(new Date(this.dateProvider.now()))}`;
        const fullPath = await this.pickUniqueFileName(path.join(directory, folderName));
        await this.fs.promises.mkdir(fullPath);
        await this.mailboxExportPersistence.setStateForUser({
            type: "running",
            userId,
            mailboxId,
            exportDirectoryPath: fullPath,
            mailBagId,
            mailId,
            exportedMails: 0,
        });
    }
    async pickUniqueFileName(path) {
        let counter = 0;
        let currentCandidate = path;
        while (await this.fileExists(currentCandidate)) {
            counter += 1;
            currentCandidate = path + `-${counter}`;
        }
        return currentCandidate;
    }
    async fileExists(path) {
        try {
            await this.fs.promises.stat(path);
        }
        catch (e) {
            if (e.code === "ENOENT") {
                return false;
            }
            else {
                throw e;
            }
        }
        return true;
    }
    async getMailboxExportState(userId) {
        const state = await this.mailboxExportPersistence.getStateForUser(userId);
        if (state && state.type === "running") {
            if (this.desktopExportLock.acquireLock(userId) === 1 /* LockResult.AlreadyLocked */) {
                return {
                    type: "locked",
                    userId,
                };
            }
        }
        return state;
    }
    async endMailboxExport(userId) {
        const previousExportState = await this.mailboxExportPersistence.getStateForUser(userId);
        if (previousExportState && previousExportState.type === "running") {
            await this.mailboxExportPersistence.setStateForUser({
                type: "finished",
                userId,
                exportDirectoryPath: previousExportState.exportDirectoryPath,
                mailboxId: previousExportState.mailboxId,
            });
        }
        else {
            throw new ProgrammingError("An Export was not previously running");
        }
    }
    async saveMailboxExport(bundle, userId, mailBagId, mailId) {
        const exportState = await this.mailboxExportPersistence.getStateForUser(userId);
        if (exportState == null || exportState.type !== "running") {
            throw new ProgrammingError("Export is not running");
        }
        const filename = generateExportFileName(elementIdPart(bundle.mailId), bundle.subject, new Date(bundle.sentOn), "eml");
        const fullPath = path.join(exportState.exportDirectoryPath, filename);
        const file = mailToEmlFile(bundle, filename);
        try {
            await this.fs.promises.writeFile(fullPath, file.data);
        }
        catch (e) {
            if (e.code === "ENOENT" || e.code === "EPERM") {
                throw new FileOpenError(`Could not write ${fullPath}`);
            }
            else {
                throw e;
            }
        }
        await this.mailboxExportPersistence.setStateForUser({
            type: "running",
            userId,
            mailBagId,
            mailId,
            exportDirectoryPath: exportState.exportDirectoryPath,
            mailboxId: exportState.mailboxId,
            exportedMails: exportState.exportedMails + 1,
        });
    }
    async clearExportState(userId) {
        await this.mailboxExportPersistence.clearStateForUser(userId);
        this.desktopExportLock.unlock(userId);
    }
    async openExportDirectory(userId) {
        const exportState = await this.mailboxExportPersistence.getStateForUser(userId);
        if (exportState == null || exportState.type !== "finished") {
            throw new ProgrammingError("Export is not finished");
        }
        await this.electron.shell.openPath(exportState.exportDirectoryPath);
    }
    async getExportDirectoryPath() {
        const directory = path.join(this.tfs.getTutanotaTempPath(), EXPORT_DIR);
        await fs.mkdir(directory, { recursive: true });
        return directory;
    }
}
//# sourceMappingURL=DesktopExportFacade.js.map