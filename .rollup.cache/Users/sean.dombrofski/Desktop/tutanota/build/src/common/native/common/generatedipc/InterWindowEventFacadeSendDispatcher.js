/* generated file, don't edit. */
export class InterWindowEventFacadeSendDispatcher {
    transport;
    constructor(transport) {
        this.transport = transport;
    }
    async localUserDataInvalidated(...args) {
        return this.transport.invokeNative("ipc", ["InterWindowEventFacade", "localUserDataInvalidated", ...args]);
    }
    async reloadDeviceConfig(...args) {
        return this.transport.invokeNative("ipc", ["InterWindowEventFacade", "reloadDeviceConfig", ...args]);
    }
}
//# sourceMappingURL=InterWindowEventFacadeSendDispatcher.js.map