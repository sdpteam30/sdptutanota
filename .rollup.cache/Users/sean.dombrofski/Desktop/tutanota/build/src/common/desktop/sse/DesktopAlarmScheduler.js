import { AlarmNotificationTypeRef } from "../../api/entities/sys/TypeRefs.js";
import { log } from "../DesktopLog";
import { elementIdPart } from "../../api/common/utils/EntityUtils";
import { resolveTypeReference } from "../../api/common/EntityFunctions";
import { base64ToUint8Array, isSameDay } from "@tutao/tutanota-utils";
import { CryptoError } from "@tutao/tutanota-crypto/error.js";
import { hasError } from "../../api/common/utils/ErrorUtils.js";
import { formatDateWithWeekdayAndTime, formatTime } from "../../misc/Formatter";
export class DesktopAlarmScheduler {
    wm;
    notifier;
    alarmStorage;
    desktopCrypto;
    alarmScheduler;
    constructor(wm, notifier, alarmStorage, desktopCrypto, alarmScheduler) {
        this.wm = wm;
        this.notifier = notifier;
        this.alarmStorage = alarmStorage;
        this.desktopCrypto = desktopCrypto;
        this.alarmScheduler = alarmScheduler;
    }
    /**
     * stores, deletes and schedules alarm notifications
     * @param an the AlarmNotification to handle
     */
    async handleAlarmNotification(an) {
        if (an.operation === "0" /* OperationType.CREATE */) {
            await this.handleCreateAlarm(an);
        }
        else if (an.operation === "2" /* OperationType.DELETE */) {
            log.debug(`deleting alarm notifications for ${an.alarmInfo.alarmIdentifier}!`);
            this.handleDeleteAlarm(an);
        }
        else {
            console.warn(`received AlarmNotification (alarmInfo identifier ${an.alarmInfo.alarmIdentifier}) with unsupported operation ${an.operation}, ignoring`);
        }
    }
    async unscheduleAllAlarms(userId = null) {
        const alarms = await this.alarmStorage.getScheduledAlarms();
        for (const alarm of alarms) {
            if (userId == null || alarm.user === userId) {
                this.cancelAlarms(alarm);
            }
        }
        return this.alarmStorage.deleteAllAlarms(userId);
    }
    /**
     * read all stored alarms and reschedule the notifications
     */
    async rescheduleAll() {
        const alarms = await this.alarmStorage.getScheduledAlarms();
        for (const alarm of alarms) {
            await this.decryptAndSchedule(alarm);
        }
    }
    async decryptAndSchedule(an) {
        for (const currentKey of an.notificationSessionKeys) {
            const pushIdentifierSessionKey = await this.alarmStorage.getPushIdentifierSessionKey(currentKey);
            if (!pushIdentifierSessionKey) {
                // this key is either not for us (we don't have the right PushIdentifierSessionKey in our local storage)
                // or we couldn't decrypt the NotificationSessionKey for some reason
                // either way, we probably can't use it.
                continue;
            }
            const decAn = await this.desktopCrypto.decryptAndMapToInstance(await resolveTypeReference(AlarmNotificationTypeRef), an, pushIdentifierSessionKey, base64ToUint8Array(currentKey.pushIdentifierSessionEncSessionKey));
            if (hasError(decAn)) {
                // some property of the AlarmNotification couldn't be decrypted with the selected key
                // throw away the key that caused the error and try the next one
                await this.alarmStorage.removePushIdentifierKey(elementIdPart(currentKey.pushIdentifier));
                continue;
            }
            // we just want to keep the key that can decrypt the AlarmNotification
            an.notificationSessionKeys = [currentKey];
            return this.scheduleAlarms(decAn);
        }
        // none of the NotificationSessionKeys in the AlarmNotification worked.
        // this is indicative of a serious problem with the stored keys.
        // therefore, we should invalidate the sseInfo and throw away
        // our pushEncSessionKeys.
        throw new CryptoError("could not decrypt alarmNotification");
    }
    handleDeleteAlarm(an) {
        this.cancelAlarms(an);
        this.alarmStorage.deleteAlarm(an.alarmInfo.alarmIdentifier);
    }
    async handleCreateAlarm(an) {
        log.debug("creating alarm notification!");
        await this.decryptAndSchedule(an);
        await this.alarmStorage.storeAlarm(an);
    }
    cancelAlarms(an) {
        this.alarmScheduler.cancelAlarm(an.alarmInfo.alarmIdentifier);
    }
    scheduleAlarms(decAn) {
        const eventInfo = {
            startTime: decAn.eventStart,
            endTime: decAn.eventEnd,
            summary: decAn.summary,
        };
        this.alarmScheduler.scheduleAlarm(eventInfo, decAn.alarmInfo, decAn.repeatRule, (eventTime, summary) => {
            const { title, body } = formatNotificationForDisplay(eventTime, summary);
            this.notifier.submitGroupedNotification(title, body, decAn.alarmInfo.alarmIdentifier, (res) => {
                if (res === "click" /* NotificationResult.Click */) {
                    this.wm.openCalendar({
                        userId: decAn.user,
                    });
                }
            });
        });
    }
}
export function formatNotificationForDisplay(eventTime, summary) {
    let dateString;
    if (isSameDay(eventTime, new Date())) {
        dateString = formatTime(eventTime);
    }
    else {
        dateString = formatDateWithWeekdayAndTime(eventTime);
    }
    const body = `${dateString} ${summary}`;
    return { body, title: body };
}
//# sourceMappingURL=DesktopAlarmScheduler.js.map