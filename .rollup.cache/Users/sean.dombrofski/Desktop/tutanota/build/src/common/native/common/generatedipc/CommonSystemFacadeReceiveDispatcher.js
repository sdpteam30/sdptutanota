/* generated file, don't edit. */
export class CommonSystemFacadeReceiveDispatcher {
    facade;
    constructor(facade) {
        this.facade = facade;
    }
    async dispatch(method, arg) {
        switch (method) {
            case "initializeRemoteBridge": {
                return this.facade.initializeRemoteBridge();
            }
            case "reload": {
                const query = arg[0];
                return this.facade.reload(query);
            }
            case "getLog": {
                return this.facade.getLog();
            }
        }
    }
}
//# sourceMappingURL=CommonSystemFacadeReceiveDispatcher.js.map