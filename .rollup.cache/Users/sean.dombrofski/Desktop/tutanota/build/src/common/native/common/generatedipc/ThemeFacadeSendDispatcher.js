/* generated file, don't edit. */
export class ThemeFacadeSendDispatcher {
    transport;
    constructor(transport) {
        this.transport = transport;
    }
    async getThemes(...args) {
        return this.transport.invokeNative("ipc", ["ThemeFacade", "getThemes", ...args]);
    }
    async setThemes(...args) {
        return this.transport.invokeNative("ipc", ["ThemeFacade", "setThemes", ...args]);
    }
    async getThemePreference(...args) {
        return this.transport.invokeNative("ipc", ["ThemeFacade", "getThemePreference", ...args]);
    }
    async setThemePreference(...args) {
        return this.transport.invokeNative("ipc", ["ThemeFacade", "setThemePreference", ...args]);
    }
    async prefersDark(...args) {
        return this.transport.invokeNative("ipc", ["ThemeFacade", "prefersDark", ...args]);
    }
}
//# sourceMappingURL=ThemeFacadeSendDispatcher.js.map