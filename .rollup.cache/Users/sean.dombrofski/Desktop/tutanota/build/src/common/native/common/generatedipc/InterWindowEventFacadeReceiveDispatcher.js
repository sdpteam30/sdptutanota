/* generated file, don't edit. */
export class InterWindowEventFacadeReceiveDispatcher {
    facade;
    constructor(facade) {
        this.facade = facade;
    }
    async dispatch(method, arg) {
        switch (method) {
            case "localUserDataInvalidated": {
                const userId = arg[0];
                return this.facade.localUserDataInvalidated(userId);
            }
            case "reloadDeviceConfig": {
                return this.facade.reloadDeviceConfig();
            }
        }
    }
}
//# sourceMappingURL=InterWindowEventFacadeReceiveDispatcher.js.map