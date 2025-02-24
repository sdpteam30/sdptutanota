/* generated file, don't edit. */
export class NativeMailImportFacadeSendDispatcher {
    transport;
    constructor(transport) {
        this.transport = transport;
    }
    async getResumableImport(...args) {
        return this.transport.invokeNative("ipc", ["NativeMailImportFacade", "getResumableImport", ...args]);
    }
    async prepareNewImport(...args) {
        return this.transport.invokeNative("ipc", ["NativeMailImportFacade", "prepareNewImport", ...args]);
    }
    async setProgressAction(...args) {
        return this.transport.invokeNative("ipc", ["NativeMailImportFacade", "setProgressAction", ...args]);
    }
    async setAsyncErrorHook(...args) {
        return this.transport.invokeNative("ipc", ["NativeMailImportFacade", "setAsyncErrorHook", ...args]);
    }
}
//# sourceMappingURL=NativeMailImportFacadeSendDispatcher.js.map