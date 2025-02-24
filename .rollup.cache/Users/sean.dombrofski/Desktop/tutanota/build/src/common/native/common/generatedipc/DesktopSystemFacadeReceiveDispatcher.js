/* generated file, don't edit. */
export class DesktopSystemFacadeReceiveDispatcher {
    facade;
    constructor(facade) {
        this.facade = facade;
    }
    async dispatch(method, arg) {
        switch (method) {
            case "openNewWindow": {
                return this.facade.openNewWindow();
            }
            case "focusApplicationWindow": {
                return this.facade.focusApplicationWindow();
            }
            case "sendSocketMessage": {
                const message = arg[0];
                return this.facade.sendSocketMessage(message);
            }
        }
    }
}
//# sourceMappingURL=DesktopSystemFacadeReceiveDispatcher.js.map