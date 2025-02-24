/* generated file, don't edit. */
export class DesktopSystemFacadeSendDispatcher {
    transport;
    constructor(transport) {
        this.transport = transport;
    }
    async openNewWindow(...args) {
        return this.transport.invokeNative("ipc", ["DesktopSystemFacade", "openNewWindow", ...args]);
    }
    async focusApplicationWindow(...args) {
        return this.transport.invokeNative("ipc", ["DesktopSystemFacade", "focusApplicationWindow", ...args]);
    }
    async sendSocketMessage(...args) {
        return this.transport.invokeNative("ipc", ["DesktopSystemFacade", "sendSocketMessage", ...args]);
    }
}
//# sourceMappingURL=DesktopSystemFacadeSendDispatcher.js.map