/* generated file, don't edit. */
export class NativePushFacadeSendDispatcher {
    transport;
    constructor(transport) {
        this.transport = transport;
    }
    async getPushIdentifier(...args) {
        return this.transport.invokeNative("ipc", ["NativePushFacade", "getPushIdentifier", ...args]);
    }
    async storePushIdentifierLocally(...args) {
        return this.transport.invokeNative("ipc", ["NativePushFacade", "storePushIdentifierLocally", ...args]);
    }
    async removeUser(...args) {
        return this.transport.invokeNative("ipc", ["NativePushFacade", "removeUser", ...args]);
    }
    async initPushNotifications(...args) {
        return this.transport.invokeNative("ipc", ["NativePushFacade", "initPushNotifications", ...args]);
    }
    async closePushNotifications(...args) {
        return this.transport.invokeNative("ipc", ["NativePushFacade", "closePushNotifications", ...args]);
    }
    async scheduleAlarms(...args) {
        return this.transport.invokeNative("ipc", ["NativePushFacade", "scheduleAlarms", ...args]);
    }
    async invalidateAlarmsForUser(...args) {
        return this.transport.invokeNative("ipc", ["NativePushFacade", "invalidateAlarmsForUser", ...args]);
    }
    async setExtendedNotificationConfig(...args) {
        return this.transport.invokeNative("ipc", ["NativePushFacade", "setExtendedNotificationConfig", ...args]);
    }
    async getExtendedNotificationConfig(...args) {
        return this.transport.invokeNative("ipc", ["NativePushFacade", "getExtendedNotificationConfig", ...args]);
    }
    async setReceiveCalendarNotificationConfig(...args) {
        return this.transport.invokeNative("ipc", ["NativePushFacade", "setReceiveCalendarNotificationConfig", ...args]);
    }
    async getReceiveCalendarNotificationConfig(...args) {
        return this.transport.invokeNative("ipc", ["NativePushFacade", "getReceiveCalendarNotificationConfig", ...args]);
    }
}
//# sourceMappingURL=NativePushFacadeSendDispatcher.js.map