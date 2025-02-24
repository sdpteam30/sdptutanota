/* generated file, don't edit. */
export class CommonSystemFacadeSendDispatcher {
    transport;
    constructor(transport) {
        this.transport = transport;
    }
    async initializeRemoteBridge(...args) {
        return this.transport.invokeNative("ipc", ["CommonSystemFacade", "initializeRemoteBridge", ...args]);
    }
    async reload(...args) {
        return this.transport.invokeNative("ipc", ["CommonSystemFacade", "reload", ...args]);
    }
    async getLog(...args) {
        return this.transport.invokeNative("ipc", ["CommonSystemFacade", "getLog", ...args]);
    }
}
//# sourceMappingURL=CommonSystemFacadeSendDispatcher.js.map