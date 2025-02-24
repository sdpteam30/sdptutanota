/* generated file, don't edit. */
export class DesktopFacadeReceiveDispatcher {
    facade;
    constructor(facade) {
        this.facade = facade;
    }
    async dispatch(method, arg) {
        switch (method) {
            case "print": {
                return this.facade.print();
            }
            case "showSpellcheckDropdown": {
                return this.facade.showSpellcheckDropdown();
            }
            case "openFindInPage": {
                return this.facade.openFindInPage();
            }
            case "applySearchResultToOverlay": {
                const result = arg[0];
                return this.facade.applySearchResultToOverlay(result);
            }
            case "reportError": {
                const errorInfo = arg[0];
                return this.facade.reportError(errorInfo);
            }
            case "updateTargetUrl": {
                const url = arg[0];
                const appPath = arg[1];
                return this.facade.updateTargetUrl(url, appPath);
            }
            case "openCustomer": {
                const mailAddress = arg[0];
                return this.facade.openCustomer(mailAddress);
            }
            case "addShortcuts": {
                const shortcuts = arg[0];
                return this.facade.addShortcuts(shortcuts);
            }
            case "appUpdateDownloaded": {
                return this.facade.appUpdateDownloaded();
            }
        }
    }
}
//# sourceMappingURL=DesktopFacadeReceiveDispatcher.js.map