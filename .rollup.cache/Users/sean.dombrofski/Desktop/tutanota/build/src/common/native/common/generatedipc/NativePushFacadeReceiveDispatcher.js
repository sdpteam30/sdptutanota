/* generated file, don't edit. */
export class NativePushFacadeReceiveDispatcher {
    facade;
    constructor(facade) {
        this.facade = facade;
    }
    async dispatch(method, arg) {
        switch (method) {
            case "getPushIdentifier": {
                return this.facade.getPushIdentifier();
            }
            case "storePushIdentifierLocally": {
                const identifier = arg[0];
                const userId = arg[1];
                const sseOrigin = arg[2];
                const pushIdentifierId = arg[3];
                const pushIdentifierSessionKey = arg[4];
                return this.facade.storePushIdentifierLocally(identifier, userId, sseOrigin, pushIdentifierId, pushIdentifierSessionKey);
            }
            case "removeUser": {
                const userId = arg[0];
                return this.facade.removeUser(userId);
            }
            case "initPushNotifications": {
                return this.facade.initPushNotifications();
            }
            case "closePushNotifications": {
                const addressesArray = arg[0];
                return this.facade.closePushNotifications(addressesArray);
            }
            case "scheduleAlarms": {
                const alarms = arg[0];
                return this.facade.scheduleAlarms(alarms);
            }
            case "invalidateAlarmsForUser": {
                const userId = arg[0];
                return this.facade.invalidateAlarmsForUser(userId);
            }
            case "setExtendedNotificationConfig": {
                const userId = arg[0];
                const mode = arg[1];
                return this.facade.setExtendedNotificationConfig(userId, mode);
            }
            case "getExtendedNotificationConfig": {
                const userId = arg[0];
                return this.facade.getExtendedNotificationConfig(userId);
            }
            case "setReceiveCalendarNotificationConfig": {
                const pushIdentifier = arg[0];
                const value = arg[1];
                return this.facade.setReceiveCalendarNotificationConfig(pushIdentifier, value);
            }
            case "getReceiveCalendarNotificationConfig": {
                const pushIdentifier = arg[0];
                return this.facade.getReceiveCalendarNotificationConfig(pushIdentifier);
            }
        }
    }
}
//# sourceMappingURL=NativePushFacadeReceiveDispatcher.js.map