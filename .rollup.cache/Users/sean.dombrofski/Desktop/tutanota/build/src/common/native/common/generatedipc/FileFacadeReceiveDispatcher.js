/* generated file, don't edit. */
export class FileFacadeReceiveDispatcher {
    facade;
    constructor(facade) {
        this.facade = facade;
    }
    async dispatch(method, arg) {
        switch (method) {
            case "open": {
                const location = arg[0];
                const mimeType = arg[1];
                return this.facade.open(location, mimeType);
            }
            case "openFileChooser": {
                const boundingRect = arg[0];
                const filter = arg[1];
                const isFileOnly = arg[2];
                return this.facade.openFileChooser(boundingRect, filter, isFileOnly);
            }
            case "openFolderChooser": {
                return this.facade.openFolderChooser();
            }
            case "deleteFile": {
                const file = arg[0];
                return this.facade.deleteFile(file);
            }
            case "getName": {
                const file = arg[0];
                return this.facade.getName(file);
            }
            case "getMimeType": {
                const file = arg[0];
                return this.facade.getMimeType(file);
            }
            case "getSize": {
                const file = arg[0];
                return this.facade.getSize(file);
            }
            case "putFileIntoDownloadsFolder": {
                const localFileUri = arg[0];
                const fileNameToUse = arg[1];
                return this.facade.putFileIntoDownloadsFolder(localFileUri, fileNameToUse);
            }
            case "upload": {
                const fileUrl = arg[0];
                const targetUrl = arg[1];
                const method = arg[2];
                const headers = arg[3];
                return this.facade.upload(fileUrl, targetUrl, method, headers);
            }
            case "download": {
                const sourceUrl = arg[0];
                const filename = arg[1];
                const headers = arg[2];
                return this.facade.download(sourceUrl, filename, headers);
            }
            case "hashFile": {
                const fileUri = arg[0];
                return this.facade.hashFile(fileUri);
            }
            case "clearFileData": {
                return this.facade.clearFileData();
            }
            case "joinFiles": {
                const filename = arg[0];
                const files = arg[1];
                return this.facade.joinFiles(filename, files);
            }
            case "splitFile": {
                const fileUri = arg[0];
                const maxChunkSizeBytes = arg[1];
                return this.facade.splitFile(fileUri, maxChunkSizeBytes);
            }
            case "writeDataFile": {
                const file = arg[0];
                return this.facade.writeDataFile(file);
            }
            case "readDataFile": {
                const filePath = arg[0];
                return this.facade.readDataFile(filePath);
            }
        }
    }
}
//# sourceMappingURL=FileFacadeReceiveDispatcher.js.map