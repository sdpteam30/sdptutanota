/* generated file, don't edit. */
export class SearchTextInAppFacadeReceiveDispatcher {
    facade;
    constructor(facade) {
        this.facade = facade;
    }
    async dispatch(method, arg) {
        switch (method) {
            case "findInPage": {
                const searchTerm = arg[0];
                const forward = arg[1];
                const matchCase = arg[2];
                const findNext = arg[3];
                return this.facade.findInPage(searchTerm, forward, matchCase, findNext);
            }
            case "stopFindInPage": {
                return this.facade.stopFindInPage();
            }
            case "setSearchOverlayState": {
                const isFocused = arg[0];
                const force = arg[1];
                return this.facade.setSearchOverlayState(isFocused, force);
            }
        }
    }
}
//# sourceMappingURL=SearchTextInAppFacadeReceiveDispatcher.js.map