export class DesktopNativePushFacade {
    sse;
    alarmScheduler;
    alarmStorage;
    sseStorage;
    constructor(sse, alarmScheduler, alarmStorage, sseStorage) {
        this.sse = sse;
        this.alarmScheduler = alarmScheduler;
        this.alarmStorage = alarmStorage;
        this.sseStorage = sseStorage;
    }
    setReceiveCalendarNotificationConfig(userId, value) {
        throw new Error("Desktop App should NOT deal with this config");
    }
    getReceiveCalendarNotificationConfig(userId) {
        return Promise.resolve(true);
    }
    getExtendedNotificationConfig(userId) {
        return this.sseStorage.getExtendedNotificationConfig(userId);
    }
    setExtendedNotificationConfig(userId, mode) {
        return this.sseStorage.setExtendedNotificationConfig(userId, mode);
    }
    async closePushNotifications(addressesArray) {
        // only gets called in the app
        // the desktop client closes notifications on window focus
    }
    async getPushIdentifier() {
        const sseInfo = await this.sseStorage.getSseInfo();
        return sseInfo?.identifier ?? null;
    }
    async initPushNotifications() {
        // make sure that we are connected if we just received new push datap
        await this.sse.connect();
    }
    async scheduleAlarms(alarms) {
        for (const alarm of alarms) {
            await this.alarmScheduler.handleAlarmNotification(alarm);
        }
    }
    async storePushIdentifierLocally(identifier, userId, sseOrigin, pushIdentifierId, pushIdentifierSessionKey) {
        await this.sseStorage.storePushIdentifier(identifier, userId, sseOrigin);
        await this.alarmStorage.storePushIdentifierSessionKey(pushIdentifierId, pushIdentifierSessionKey);
    }
    async removeUser(userId) {
        await this.sse.removeUser(userId);
    }
    async invalidateAlarmsForUser(userId) {
        await this.alarmScheduler.unscheduleAllAlarms(userId);
    }
    async resetStoredState() {
        await this.sse.disconnect();
        await this.alarmScheduler.unscheduleAllAlarms();
        await this.sseStorage.clear();
    }
}
//# sourceMappingURL=DesktopNativePushFacade.js.map