/* generated file, don't edit. */
export class ExternalCalendarFacadeReceiveDispatcher {
    facade;
    constructor(facade) {
        this.facade = facade;
    }
    async dispatch(method, arg) {
        switch (method) {
            case "fetchExternalCalendar": {
                const url = arg[0];
                return this.facade.fetchExternalCalendar(url);
            }
        }
    }
}
//# sourceMappingURL=ExternalCalendarFacadeReceiveDispatcher.js.map