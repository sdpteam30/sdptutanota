/* generated file, don't edit. */
export class CommonNativeFacadeSendDispatcher {
    transport;
    constructor(transport) {
        this.transport = transport;
    }
    async createMailEditor(...args) {
        return this.transport.invokeNative("ipc", ["CommonNativeFacade", "createMailEditor", ...args]);
    }
    async openMailBox(...args) {
        return this.transport.invokeNative("ipc", ["CommonNativeFacade", "openMailBox", ...args]);
    }
    async openCalendar(...args) {
        return this.transport.invokeNative("ipc", ["CommonNativeFacade", "openCalendar", ...args]);
    }
    async openContactEditor(...args) {
        return this.transport.invokeNative("ipc", ["CommonNativeFacade", "openContactEditor", ...args]);
    }
    async showAlertDialog(...args) {
        return this.transport.invokeNative("ipc", ["CommonNativeFacade", "showAlertDialog", ...args]);
    }
    async invalidateAlarms(...args) {
        return this.transport.invokeNative("ipc", ["CommonNativeFacade", "invalidateAlarms", ...args]);
    }
    async updateTheme(...args) {
        return this.transport.invokeNative("ipc", ["CommonNativeFacade", "updateTheme", ...args]);
    }
    async promptForNewPassword(...args) {
        return this.transport.invokeNative("ipc", ["CommonNativeFacade", "promptForNewPassword", ...args]);
    }
    async promptForPassword(...args) {
        return this.transport.invokeNative("ipc", ["CommonNativeFacade", "promptForPassword", ...args]);
    }
    async handleFileImport(...args) {
        return this.transport.invokeNative("ipc", ["CommonNativeFacade", "handleFileImport", ...args]);
    }
    async openSettings(...args) {
        return this.transport.invokeNative("ipc", ["CommonNativeFacade", "openSettings", ...args]);
    }
}
//# sourceMappingURL=CommonNativeFacadeSendDispatcher.js.map