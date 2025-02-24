/* generated file, don't edit. */
export class NativeCredentialsFacadeSendDispatcher {
    transport;
    constructor(transport) {
        this.transport = transport;
    }
    async getSupportedEncryptionModes(...args) {
        return this.transport.invokeNative("ipc", ["NativeCredentialsFacade", "getSupportedEncryptionModes", ...args]);
    }
    async loadAll(...args) {
        return this.transport.invokeNative("ipc", ["NativeCredentialsFacade", "loadAll", ...args]);
    }
    async store(...args) {
        return this.transport.invokeNative("ipc", ["NativeCredentialsFacade", "store", ...args]);
    }
    async storeEncrypted(...args) {
        return this.transport.invokeNative("ipc", ["NativeCredentialsFacade", "storeEncrypted", ...args]);
    }
    async loadByUserId(...args) {
        return this.transport.invokeNative("ipc", ["NativeCredentialsFacade", "loadByUserId", ...args]);
    }
    async deleteByUserId(...args) {
        return this.transport.invokeNative("ipc", ["NativeCredentialsFacade", "deleteByUserId", ...args]);
    }
    async getCredentialEncryptionMode(...args) {
        return this.transport.invokeNative("ipc", ["NativeCredentialsFacade", "getCredentialEncryptionMode", ...args]);
    }
    async setCredentialEncryptionMode(...args) {
        return this.transport.invokeNative("ipc", ["NativeCredentialsFacade", "setCredentialEncryptionMode", ...args]);
    }
    async clear(...args) {
        return this.transport.invokeNative("ipc", ["NativeCredentialsFacade", "clear", ...args]);
    }
    async migrateToNativeCredentials(...args) {
        return this.transport.invokeNative("ipc", ["NativeCredentialsFacade", "migrateToNativeCredentials", ...args]);
    }
}
//# sourceMappingURL=NativeCredentialsFacadeSendDispatcher.js.map