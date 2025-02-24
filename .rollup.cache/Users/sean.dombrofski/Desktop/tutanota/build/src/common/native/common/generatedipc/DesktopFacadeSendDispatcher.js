/* generated file, don't edit. */
export class DesktopFacadeSendDispatcher {
    transport;
    constructor(transport) {
        this.transport = transport;
    }
    async print(...args) {
        return this.transport.invokeNative("ipc", ["DesktopFacade", "print", ...args]);
    }
    async showSpellcheckDropdown(...args) {
        return this.transport.invokeNative("ipc", ["DesktopFacade", "showSpellcheckDropdown", ...args]);
    }
    async openFindInPage(...args) {
        return this.transport.invokeNative("ipc", ["DesktopFacade", "openFindInPage", ...args]);
    }
    async applySearchResultToOverlay(...args) {
        return this.transport.invokeNative("ipc", ["DesktopFacade", "applySearchResultToOverlay", ...args]);
    }
    async reportError(...args) {
        return this.transport.invokeNative("ipc", ["DesktopFacade", "reportError", ...args]);
    }
    async updateTargetUrl(...args) {
        return this.transport.invokeNative("ipc", ["DesktopFacade", "updateTargetUrl", ...args]);
    }
    async openCustomer(...args) {
        return this.transport.invokeNative("ipc", ["DesktopFacade", "openCustomer", ...args]);
    }
    async addShortcuts(...args) {
        return this.transport.invokeNative("ipc", ["DesktopFacade", "addShortcuts", ...args]);
    }
    async appUpdateDownloaded(...args) {
        return this.transport.invokeNative("ipc", ["DesktopFacade", "appUpdateDownloaded", ...args]);
    }
}
//# sourceMappingURL=DesktopFacadeSendDispatcher.js.map