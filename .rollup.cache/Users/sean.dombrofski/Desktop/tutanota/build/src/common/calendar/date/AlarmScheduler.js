import { downcast } from "@tutao/tutanota-utils";
import { calculateAlarmTime, findNextAlarmOccurrence, getEventStartByTimes, getValidTimeZone, parseAlarmInterval } from "./CalendarUtils.js";
/**
 * knows how to translate a given calendar event with alarms into an
 * actual function call that is executed some time later (and maybe displays a notification).
 *
 * should stay independent of the way the actual notification is sent + rendered
 */
export class AlarmScheduler {
    _scheduledNotifications;
    _scheduler;
    _dateProvider;
    constructor(dateProvider, scheduler) {
        this._dateProvider = dateProvider;
        this._scheduledNotifications = new Map();
        this._scheduler = scheduler;
    }
    scheduleAlarm(event, alarmInfo, repeatRule, notificationSender) {
        const localZone = this._dateProvider.timeZone();
        if (repeatRule) {
            let repeatTimeZone = getValidTimeZone(repeatRule.timeZone, localZone);
            let calculationLocalZone = getValidTimeZone(localZone);
            const nextOccurrence = findNextAlarmOccurrence(new Date(this._dateProvider.now()), repeatTimeZone, event.startTime, event.endTime, downcast(repeatRule.frequency), Number(repeatRule.interval), downcast(repeatRule.endType) || "0" /* EndType.Never */, Number(repeatRule.endValue), repeatRule.excludedDates.map(({ date }) => date), parseAlarmInterval(alarmInfo.trigger), calculationLocalZone);
            if (nextOccurrence) {
                this._scheduleAction(alarmInfo.alarmIdentifier, nextOccurrence.alarmTime, () => {
                    notificationSender(nextOccurrence.eventTime, event.summary);
                    // Schedule next occurrence
                    this.scheduleAlarm(event, alarmInfo, repeatRule, notificationSender);
                });
            }
        }
        else {
            const eventStart = getEventStartByTimes(event.startTime, event.endTime, localZone);
            if (eventStart.getTime() > this._dateProvider.now()) {
                this._scheduleAction(alarmInfo.alarmIdentifier, calculateAlarmTime(eventStart, parseAlarmInterval(alarmInfo.trigger)), () => notificationSender(eventStart, event.summary));
            }
        }
    }
    cancelAlarm(alarmIdentifier) {
        // try to cancel single first
        this._cancelOccurrence(alarmIdentifier);
    }
    _cancelOccurrence(alarmIdentifier) {
        const timeoutId = this._scheduledNotifications.get(alarmIdentifier);
        if (timeoutId != null) {
            this._scheduler.unscheduleTimeout(timeoutId);
        }
    }
    _scheduleAction(identifier, atTime, action) {
        const scheduledId = this._scheduler.scheduleAt(action, atTime);
        this._scheduledNotifications.set(identifier, scheduledId);
    }
}
//# sourceMappingURL=AlarmScheduler.js.map