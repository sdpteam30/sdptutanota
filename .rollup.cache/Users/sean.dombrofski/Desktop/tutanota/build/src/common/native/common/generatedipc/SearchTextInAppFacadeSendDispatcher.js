/* generated file, don't edit. */
export class SearchTextInAppFacadeSendDispatcher {
    transport;
    constructor(transport) {
        this.transport = transport;
    }
    async findInPage(...args) {
        return this.transport.invokeNative("ipc", ["SearchTextInAppFacade", "findInPage", ...args]);
    }
    async stopFindInPage(...args) {
        return this.transport.invokeNative("ipc", ["SearchTextInAppFacade", "stopFindInPage", ...args]);
    }
    async setSearchOverlayState(...args) {
        return this.transport.invokeNative("ipc", ["SearchTextInAppFacade", "setSearchOverlayState", ...args]);
    }
}
//# sourceMappingURL=SearchTextInAppFacadeSendDispatcher.js.map