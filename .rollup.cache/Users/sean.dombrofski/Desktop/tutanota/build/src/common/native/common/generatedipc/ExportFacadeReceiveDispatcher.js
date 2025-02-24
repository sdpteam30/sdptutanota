/* generated file, don't edit. */
export class ExportFacadeReceiveDispatcher {
    facade;
    constructor(facade) {
        this.facade = facade;
    }
    async dispatch(method, arg) {
        switch (method) {
            case "mailToMsg": {
                const bundle = arg[0];
                const fileName = arg[1];
                return this.facade.mailToMsg(bundle, fileName);
            }
            case "saveToExportDir": {
                const file = arg[0];
                return this.facade.saveToExportDir(file);
            }
            case "startNativeDrag": {
                const fileNames = arg[0];
                return this.facade.startNativeDrag(fileNames);
            }
            case "checkFileExistsInExportDir": {
                const fileName = arg[0];
                return this.facade.checkFileExistsInExportDir(fileName);
            }
            case "getMailboxExportState": {
                const userId = arg[0];
                return this.facade.getMailboxExportState(userId);
            }
            case "endMailboxExport": {
                const userId = arg[0];
                return this.facade.endMailboxExport(userId);
            }
            case "startMailboxExport": {
                const userId = arg[0];
                const mailboxId = arg[1];
                const mailBagId = arg[2];
                const mailId = arg[3];
                return this.facade.startMailboxExport(userId, mailboxId, mailBagId, mailId);
            }
            case "saveMailboxExport": {
                const bundle = arg[0];
                const userId = arg[1];
                const mailBagId = arg[2];
                const mailId = arg[3];
                return this.facade.saveMailboxExport(bundle, userId, mailBagId, mailId);
            }
            case "clearExportState": {
                const userId = arg[0];
                return this.facade.clearExportState(userId);
            }
            case "openExportDirectory": {
                const userId = arg[0];
                return this.facade.openExportDirectory(userId);
            }
        }
    }
}
//# sourceMappingURL=ExportFacadeReceiveDispatcher.js.map