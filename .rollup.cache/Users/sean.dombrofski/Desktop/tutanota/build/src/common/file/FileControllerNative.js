import { Dialog } from "../gui/base/Dialog.js";
import { assertMainOrNode, isAndroidApp, isApp, isDesktop, isElectronClient, isIOSApp, isTest } from "../api/common/Env";
import { assert, assertNotNull, promiseMap, sortableTimestamp } from "@tutao/tutanota-utils";
import { assertOnlyFileReferences } from "../api/common/utils/FileUtils";
import { CancelledError } from "../api/common/error/CancelledError";
import { FileController, zipDataFiles } from "./FileController.js";
import { ProgrammingError } from "../api/common/error/ProgrammingError.js";
import { createReferencingInstance } from "../api/common/utils/BlobUtils.js";
assertMainOrNode();
/**
 * coordinates downloads when we have access to native functionality
 */
export class FileControllerNative extends FileController {
    fileApp;
    constructor(blobFacade, guiDownload, fileApp) {
        assert(isElectronClient() || isApp() || isTest(), "Don't make native file controller when not in native");
        super(blobFacade, guiDownload);
        this.fileApp = fileApp;
    }
    async cleanUp(files) {
        assertOnlyFileReferences(files);
        if (files.length > 0) {
            for (const file of files) {
                try {
                    await this.fileApp.deleteFile(file.location);
                }
                catch (e) {
                    console.log("failed to delete file", file.location, e);
                }
            }
        }
    }
    /**
     * Does not delete temporary file in app.
     */
    async saveDataFile(file) {
        // For apps "opening" DataFile currently means saving and opening it.
        try {
            const fileReference = await this.fileApp.writeDataFile(file);
            if (isAndroidApp() || isDesktop()) {
                await this.fileApp.putFileIntoDownloadsFolder(fileReference.location, fileReference.name);
                return;
            }
            else if (isIOSApp()) {
                return this.fileApp.open(fileReference);
            }
        }
        catch (e) {
            if (e instanceof CancelledError) {
                // no-op. User cancelled file dialog
                console.log("saveDataFile cancelled");
            }
            else {
                console.warn("openDataFile failed", e);
                await Dialog.message("canNotOpenFileOnDevice_msg");
            }
        }
    }
    /** Public for testing */
    async downloadAndDecrypt(tutanotaFile) {
        return await this.blobFacade.downloadAndDecryptNative("1" /* ArchiveDataType.Attachments */, createReferencingInstance(tutanotaFile), tutanotaFile.name, assertNotNull(tutanotaFile.mimeType, "tried to call blobfacade.downloadAndDecryptNative with null mimeType"));
    }
    async writeDownloadedFiles(downloadedFiles) {
        if (isIOSApp()) {
            await this.processDownloadedFilesIOS(downloadedFiles);
        }
        else if (isDesktop()) {
            await this.processDownloadedFilesDesktop(downloadedFiles);
        }
        else if (isAndroidApp()) {
            await promiseMap(downloadedFiles, (file) => this.fileApp.putFileIntoDownloadsFolder(file.location, file.name));
        }
        else {
            throw new ProgrammingError("in filecontroller native but not in ios, android or desktop? - tried to write");
        }
    }
    async openDownloadedFiles(downloadedFiles) {
        if (isIOSApp()) {
            await this.processDownloadedFilesIOS(downloadedFiles);
        }
        else if (isDesktop() || isAndroidApp()) {
            await this.openFiles(downloadedFiles);
        }
        else {
            throw new ProgrammingError("in filecontroller native but not in ios, android or desktop? - tried to open");
        }
    }
    /**
     * for downloading multiple files on desktop. multiple files are bundled in a zip file, single files
     *
     * we could use the same strategy as on android, but
     * if the user doesn't have a default dl path selected on desktop,
     * the client will ask for a location for each file separately, so we zip them for now.
     */
    async processDownloadedFilesDesktop(downloadedFiles) {
        if (downloadedFiles.length < 1) {
            return;
        }
        console.log("downloaded files in processing", downloadedFiles);
        const dataFiles = (await promiseMap(downloadedFiles, (f) => this.fileApp.readDataFile(f.location))).filter(Boolean);
        const fileInTemp = dataFiles.length === 1
            ? downloadedFiles[0]
            : await this.fileApp.writeDataFile(await zipDataFiles(dataFiles, `${sortableTimestamp()}-attachments.zip`));
        await this.fileApp.putFileIntoDownloadsFolder(fileInTemp.location, fileInTemp.name);
    }
    // on iOS, we don't actually show downloadAll and open the attachment immediately
    // the user is presented with an option to save the file to their file system by the OS
    async processDownloadedFilesIOS(downloadedFiles) {
        await promiseMap(downloadedFiles, async (file) => {
            try {
                await this.fileApp.open(file);
            }
            finally {
                await this.fileApp.deleteFile(file.location).catch((e) => console.log("failed to delete file", file.location, e));
            }
        });
    }
    async openFiles(downloadedFiles) {
        return promiseMap(downloadedFiles, async (file) => {
            try {
                await this.fileApp.open(file);
            }
            finally {
                // on desktop, we don't get to know when the other app is done with the file, so we leave cleanup to the OS
                if (isApp())
                    await this.fileApp.deleteFile(file.location).catch((e) => console.log("failed to delete file", file.location, e));
            }
        });
    }
}
//# sourceMappingURL=FileControllerNative.js.map