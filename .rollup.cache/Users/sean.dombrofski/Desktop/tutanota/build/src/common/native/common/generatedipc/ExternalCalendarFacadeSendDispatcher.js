/* generated file, don't edit. */
export class ExternalCalendarFacadeSendDispatcher {
    transport;
    constructor(transport) {
        this.transport = transport;
    }
    async fetchExternalCalendar(...args) {
        return this.transport.invokeNative("ipc", ["ExternalCalendarFacade", "fetchExternalCalendar", ...args]);
    }
}
//# sourceMappingURL=ExternalCalendarFacadeSendDispatcher.js.map