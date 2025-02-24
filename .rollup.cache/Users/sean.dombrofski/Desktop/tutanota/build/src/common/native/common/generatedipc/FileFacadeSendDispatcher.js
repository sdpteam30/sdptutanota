/* generated file, don't edit. */
export class FileFacadeSendDispatcher {
    transport;
    constructor(transport) {
        this.transport = transport;
    }
    async open(...args) {
        return this.transport.invokeNative("ipc", ["FileFacade", "open", ...args]);
    }
    async openFileChooser(...args) {
        return this.transport.invokeNative("ipc", ["FileFacade", "openFileChooser", ...args]);
    }
    async openFolderChooser(...args) {
        return this.transport.invokeNative("ipc", ["FileFacade", "openFolderChooser", ...args]);
    }
    async deleteFile(...args) {
        return this.transport.invokeNative("ipc", ["FileFacade", "deleteFile", ...args]);
    }
    async getName(...args) {
        return this.transport.invokeNative("ipc", ["FileFacade", "getName", ...args]);
    }
    async getMimeType(...args) {
        return this.transport.invokeNative("ipc", ["FileFacade", "getMimeType", ...args]);
    }
    async getSize(...args) {
        return this.transport.invokeNative("ipc", ["FileFacade", "getSize", ...args]);
    }
    async putFileIntoDownloadsFolder(...args) {
        return this.transport.invokeNative("ipc", ["FileFacade", "putFileIntoDownloadsFolder", ...args]);
    }
    async upload(...args) {
        return this.transport.invokeNative("ipc", ["FileFacade", "upload", ...args]);
    }
    async download(...args) {
        return this.transport.invokeNative("ipc", ["FileFacade", "download", ...args]);
    }
    async hashFile(...args) {
        return this.transport.invokeNative("ipc", ["FileFacade", "hashFile", ...args]);
    }
    async clearFileData(...args) {
        return this.transport.invokeNative("ipc", ["FileFacade", "clearFileData", ...args]);
    }
    async joinFiles(...args) {
        return this.transport.invokeNative("ipc", ["FileFacade", "joinFiles", ...args]);
    }
    async splitFile(...args) {
        return this.transport.invokeNative("ipc", ["FileFacade", "splitFile", ...args]);
    }
    async writeDataFile(...args) {
        return this.transport.invokeNative("ipc", ["FileFacade", "writeDataFile", ...args]);
    }
    async readDataFile(...args) {
        return this.transport.invokeNative("ipc", ["FileFacade", "readDataFile", ...args]);
    }
}
//# sourceMappingURL=FileFacadeSendDispatcher.js.map