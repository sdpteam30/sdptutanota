/* generated file, don't edit. */
export class SqlCipherFacadeSendDispatcher {
    transport;
    constructor(transport) {
        this.transport = transport;
    }
    async openDb(...args) {
        return this.transport.invokeNative("ipc", ["SqlCipherFacade", "openDb", ...args]);
    }
    async closeDb(...args) {
        return this.transport.invokeNative("ipc", ["SqlCipherFacade", "closeDb", ...args]);
    }
    async deleteDb(...args) {
        return this.transport.invokeNative("ipc", ["SqlCipherFacade", "deleteDb", ...args]);
    }
    async run(...args) {
        return this.transport.invokeNative("ipc", ["SqlCipherFacade", "run", ...args]);
    }
    async get(...args) {
        return this.transport.invokeNative("ipc", ["SqlCipherFacade", "get", ...args]);
    }
    async all(...args) {
        return this.transport.invokeNative("ipc", ["SqlCipherFacade", "all", ...args]);
    }
    async lockRangesDbAccess(...args) {
        return this.transport.invokeNative("ipc", ["SqlCipherFacade", "lockRangesDbAccess", ...args]);
    }
    async unlockRangesDbAccess(...args) {
        return this.transport.invokeNative("ipc", ["SqlCipherFacade", "unlockRangesDbAccess", ...args]);
    }
}
//# sourceMappingURL=SqlCipherFacadeSendDispatcher.js.map