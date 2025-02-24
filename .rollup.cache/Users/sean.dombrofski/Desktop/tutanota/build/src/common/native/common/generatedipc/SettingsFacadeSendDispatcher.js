/* generated file, don't edit. */
export class SettingsFacadeSendDispatcher {
    transport;
    constructor(transport) {
        this.transport = transport;
    }
    async getStringConfigValue(...args) {
        return this.transport.invokeNative("ipc", ["SettingsFacade", "getStringConfigValue", ...args]);
    }
    async setStringConfigValue(...args) {
        return this.transport.invokeNative("ipc", ["SettingsFacade", "setStringConfigValue", ...args]);
    }
    async getBooleanConfigValue(...args) {
        return this.transport.invokeNative("ipc", ["SettingsFacade", "getBooleanConfigValue", ...args]);
    }
    async setBooleanConfigValue(...args) {
        return this.transport.invokeNative("ipc", ["SettingsFacade", "setBooleanConfigValue", ...args]);
    }
    async getUpdateInfo(...args) {
        return this.transport.invokeNative("ipc", ["SettingsFacade", "getUpdateInfo", ...args]);
    }
    async registerMailto(...args) {
        return this.transport.invokeNative("ipc", ["SettingsFacade", "registerMailto", ...args]);
    }
    async unregisterMailto(...args) {
        return this.transport.invokeNative("ipc", ["SettingsFacade", "unregisterMailto", ...args]);
    }
    async integrateDesktop(...args) {
        return this.transport.invokeNative("ipc", ["SettingsFacade", "integrateDesktop", ...args]);
    }
    async unIntegrateDesktop(...args) {
        return this.transport.invokeNative("ipc", ["SettingsFacade", "unIntegrateDesktop", ...args]);
    }
    async getSpellcheckLanguages(...args) {
        return this.transport.invokeNative("ipc", ["SettingsFacade", "getSpellcheckLanguages", ...args]);
    }
    async getIntegrationInfo(...args) {
        return this.transport.invokeNative("ipc", ["SettingsFacade", "getIntegrationInfo", ...args]);
    }
    async enableAutoLaunch(...args) {
        return this.transport.invokeNative("ipc", ["SettingsFacade", "enableAutoLaunch", ...args]);
    }
    async disableAutoLaunch(...args) {
        return this.transport.invokeNative("ipc", ["SettingsFacade", "disableAutoLaunch", ...args]);
    }
    async manualUpdate(...args) {
        return this.transport.invokeNative("ipc", ["SettingsFacade", "manualUpdate", ...args]);
    }
    async changeLanguage(...args) {
        return this.transport.invokeNative("ipc", ["SettingsFacade", "changeLanguage", ...args]);
    }
}
//# sourceMappingURL=SettingsFacadeSendDispatcher.js.map