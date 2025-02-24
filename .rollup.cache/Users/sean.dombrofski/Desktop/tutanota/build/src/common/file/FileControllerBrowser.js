import { assertMainOrNode } from "../api/common/Env";
import { FileController, openDataFileInBrowser, zipDataFiles } from "./FileController.js";
import { sortableTimestamp } from "@tutao/tutanota-utils";
import { assertOnlyDataFiles } from "../api/common/utils/FileUtils.js";
assertMainOrNode();
export class FileControllerBrowser extends FileController {
    constructor(blobFacade, guiDownload) {
        super(blobFacade, guiDownload);
    }
    async saveDataFile(file) {
        return openDataFileInBrowser(file);
    }
    async downloadAndDecrypt(file) {
        return this.getAsDataFile(file);
    }
    async writeDownloadedFiles(downloadedFiles) {
        if (downloadedFiles.length < 1) {
            return;
        }
        assertOnlyDataFiles(downloadedFiles);
        const fileToSave = downloadedFiles.length > 1 ? await zipDataFiles(downloadedFiles, `${sortableTimestamp()}-attachments.zip`) : downloadedFiles[0];
        return await openDataFileInBrowser(fileToSave);
    }
    async cleanUp(downloadedFiles) {
        // there is nothing to do since nothing gets saved until the browser puts it into the final location
    }
    async openDownloadedFiles(downloadedFiles) {
        // opening and downloading a file is the same thing in browser environment
        return await this.writeDownloadedFiles(downloadedFiles);
    }
}
//# sourceMappingURL=FileControllerBrowser.js.map