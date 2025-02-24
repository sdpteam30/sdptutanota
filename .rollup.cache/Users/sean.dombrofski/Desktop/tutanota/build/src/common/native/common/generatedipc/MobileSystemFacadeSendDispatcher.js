/* generated file, don't edit. */
export class MobileSystemFacadeSendDispatcher {
    transport;
    constructor(transport) {
        this.transport = transport;
    }
    async goToSettings(...args) {
        return this.transport.invokeNative("ipc", ["MobileSystemFacade", "goToSettings", ...args]);
    }
    async openLink(...args) {
        return this.transport.invokeNative("ipc", ["MobileSystemFacade", "openLink", ...args]);
    }
    async shareText(...args) {
        return this.transport.invokeNative("ipc", ["MobileSystemFacade", "shareText", ...args]);
    }
    async hasPermission(...args) {
        return this.transport.invokeNative("ipc", ["MobileSystemFacade", "hasPermission", ...args]);
    }
    async requestPermission(...args) {
        return this.transport.invokeNative("ipc", ["MobileSystemFacade", "requestPermission", ...args]);
    }
    async getAppLockMethod(...args) {
        return this.transport.invokeNative("ipc", ["MobileSystemFacade", "getAppLockMethod", ...args]);
    }
    async setAppLockMethod(...args) {
        return this.transport.invokeNative("ipc", ["MobileSystemFacade", "setAppLockMethod", ...args]);
    }
    async enforceAppLock(...args) {
        return this.transport.invokeNative("ipc", ["MobileSystemFacade", "enforceAppLock", ...args]);
    }
    async getSupportedAppLockMethods(...args) {
        return this.transport.invokeNative("ipc", ["MobileSystemFacade", "getSupportedAppLockMethods", ...args]);
    }
    async openMailApp(...args) {
        return this.transport.invokeNative("ipc", ["MobileSystemFacade", "openMailApp", ...args]);
    }
    async openCalendarApp(...args) {
        return this.transport.invokeNative("ipc", ["MobileSystemFacade", "openCalendarApp", ...args]);
    }
    async getInstallationDate(...args) {
        return this.transport.invokeNative("ipc", ["MobileSystemFacade", "getInstallationDate", ...args]);
    }
    async requestInAppRating(...args) {
        return this.transport.invokeNative("ipc", ["MobileSystemFacade", "requestInAppRating", ...args]);
    }
}
//# sourceMappingURL=MobileSystemFacadeSendDispatcher.js.map