/* generated file, don't edit. */
export class ExportFacadeSendDispatcher {
    transport;
    constructor(transport) {
        this.transport = transport;
    }
    async mailToMsg(...args) {
        return this.transport.invokeNative("ipc", ["ExportFacade", "mailToMsg", ...args]);
    }
    async saveToExportDir(...args) {
        return this.transport.invokeNative("ipc", ["ExportFacade", "saveToExportDir", ...args]);
    }
    async startNativeDrag(...args) {
        return this.transport.invokeNative("ipc", ["ExportFacade", "startNativeDrag", ...args]);
    }
    async checkFileExistsInExportDir(...args) {
        return this.transport.invokeNative("ipc", ["ExportFacade", "checkFileExistsInExportDir", ...args]);
    }
    async getMailboxExportState(...args) {
        return this.transport.invokeNative("ipc", ["ExportFacade", "getMailboxExportState", ...args]);
    }
    async endMailboxExport(...args) {
        return this.transport.invokeNative("ipc", ["ExportFacade", "endMailboxExport", ...args]);
    }
    async startMailboxExport(...args) {
        return this.transport.invokeNative("ipc", ["ExportFacade", "startMailboxExport", ...args]);
    }
    async saveMailboxExport(...args) {
        return this.transport.invokeNative("ipc", ["ExportFacade", "saveMailboxExport", ...args]);
    }
    async clearExportState(...args) {
        return this.transport.invokeNative("ipc", ["ExportFacade", "clearExportState", ...args]);
    }
    async openExportDirectory(...args) {
        return this.transport.invokeNative("ipc", ["ExportFacade", "openExportDirectory", ...args]);
    }
}
//# sourceMappingURL=ExportFacadeSendDispatcher.js.map