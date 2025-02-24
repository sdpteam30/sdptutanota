/* generated file, don't edit. */
export class NativeCredentialsFacadeReceiveDispatcher {
    facade;
    constructor(facade) {
        this.facade = facade;
    }
    async dispatch(method, arg) {
        switch (method) {
            case "getSupportedEncryptionModes": {
                return this.facade.getSupportedEncryptionModes();
            }
            case "loadAll": {
                return this.facade.loadAll();
            }
            case "store": {
                const credentials = arg[0];
                return this.facade.store(credentials);
            }
            case "storeEncrypted": {
                const credentials = arg[0];
                return this.facade.storeEncrypted(credentials);
            }
            case "loadByUserId": {
                const id = arg[0];
                return this.facade.loadByUserId(id);
            }
            case "deleteByUserId": {
                const id = arg[0];
                return this.facade.deleteByUserId(id);
            }
            case "getCredentialEncryptionMode": {
                return this.facade.getCredentialEncryptionMode();
            }
            case "setCredentialEncryptionMode": {
                const encryptionMode = arg[0];
                return this.facade.setCredentialEncryptionMode(encryptionMode);
            }
            case "clear": {
                return this.facade.clear();
            }
            case "migrateToNativeCredentials": {
                const credentials = arg[0];
                const encryptionMode = arg[1];
                const credentialsKey = arg[2];
                return this.facade.migrateToNativeCredentials(credentials, encryptionMode, credentialsKey);
            }
        }
    }
}
//# sourceMappingURL=NativeCredentialsFacadeReceiveDispatcher.js.map