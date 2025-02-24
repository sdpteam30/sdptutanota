/* generated file, don't edit. */
export class CommonNativeFacadeReceiveDispatcher {
    facade;
    constructor(facade) {
        this.facade = facade;
    }
    async dispatch(method, arg) {
        switch (method) {
            case "createMailEditor": {
                const filesUris = arg[0];
                const text = arg[1];
                const addresses = arg[2];
                const subject = arg[3];
                const mailToUrlString = arg[4];
                return this.facade.createMailEditor(filesUris, text, addresses, subject, mailToUrlString);
            }
            case "openMailBox": {
                const userId = arg[0];
                const address = arg[1];
                const requestedPath = arg[2];
                return this.facade.openMailBox(userId, address, requestedPath);
            }
            case "openCalendar": {
                const userId = arg[0];
                return this.facade.openCalendar(userId);
            }
            case "openContactEditor": {
                const contactId = arg[0];
                return this.facade.openContactEditor(contactId);
            }
            case "showAlertDialog": {
                const translationKey = arg[0];
                return this.facade.showAlertDialog(translationKey);
            }
            case "invalidateAlarms": {
                return this.facade.invalidateAlarms();
            }
            case "updateTheme": {
                return this.facade.updateTheme();
            }
            case "promptForNewPassword": {
                const title = arg[0];
                const oldPassword = arg[1];
                return this.facade.promptForNewPassword(title, oldPassword);
            }
            case "promptForPassword": {
                const title = arg[0];
                return this.facade.promptForPassword(title);
            }
            case "handleFileImport": {
                const filesUris = arg[0];
                return this.facade.handleFileImport(filesUris);
            }
            case "openSettings": {
                const path = arg[0];
                return this.facade.openSettings(path);
            }
        }
    }
}
//# sourceMappingURL=CommonNativeFacadeReceiveDispatcher.js.map