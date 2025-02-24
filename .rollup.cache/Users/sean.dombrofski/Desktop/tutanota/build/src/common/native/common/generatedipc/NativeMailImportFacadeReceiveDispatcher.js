/* generated file, don't edit. */
export class NativeMailImportFacadeReceiveDispatcher {
    facade;
    constructor(facade) {
        this.facade = facade;
    }
    async dispatch(method, arg) {
        switch (method) {
            case "getResumableImport": {
                const mailboxId = arg[0];
                const targetOwnerGroup = arg[1];
                const unencryptedTutaCredentials = arg[2];
                const apiUrl = arg[3];
                return this.facade.getResumableImport(mailboxId, targetOwnerGroup, unencryptedTutaCredentials, apiUrl);
            }
            case "prepareNewImport": {
                const mailboxId = arg[0];
                const targetOwnerGroup = arg[1];
                const targetMailSet = arg[2];
                const filePaths = arg[3];
                const unencryptedTutaCredentials = arg[4];
                const apiUrl = arg[5];
                return this.facade.prepareNewImport(mailboxId, targetOwnerGroup, targetMailSet, filePaths, unencryptedTutaCredentials, apiUrl);
            }
            case "setProgressAction": {
                const mailboxId = arg[0];
                const importProgressAction = arg[1];
                return this.facade.setProgressAction(mailboxId, importProgressAction);
            }
            case "setAsyncErrorHook": {
                const mailboxId = arg[0];
                return this.facade.setAsyncErrorHook(mailboxId);
            }
        }
    }
}
//# sourceMappingURL=NativeMailImportFacadeReceiveDispatcher.js.map