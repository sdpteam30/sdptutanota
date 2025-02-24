import { generateEventElementId, serializeAlarmInterval } from "../../../../common/api/common/utils/CommonCalendarUtils.js";
import { noOp, remove } from "@tutao/tutanota-utils";
import { alarmIntervalToLuxonDurationLikeObject } from "../../../../common/calendar/date/CalendarUtils.js";
import { Duration } from "luxon";
/**
 * edit the alarms set on a calendar event.
 */
export class CalendarEventAlarmModel {
    dateProvider;
    uiUpdateCallback;
    _alarms = [];
    /** we can set reminders only if we're able to edit the event on the server because we have to add them to the entity. */
    canEditReminders;
    constructor(eventType, alarms = [], dateProvider, uiUpdateCallback = noOp) {
        this.dateProvider = dateProvider;
        this.uiUpdateCallback = uiUpdateCallback;
        this.canEditReminders =
            eventType === "own" /* EventType.OWN */ || eventType === "shared_rw" /* EventType.SHARED_RW */ || eventType === "locked" /* EventType.LOCKED */ || eventType === "invite" /* EventType.INVITE */;
        this._alarms = [...alarms];
    }
    /**
     * @param trigger the interval to add.
     */
    addAlarm(trigger) {
        if (trigger == null)
            return;
        // Checks if an alarm with the same duration already exists
        const alreadyHasAlarm = this._alarms.some((e) => this.isEqualAlarms(trigger, e));
        if (alreadyHasAlarm)
            return;
        this._alarms.push(trigger);
        this.uiUpdateCallback();
    }
    /**
     * deactivate the alarm for the given interval.
     */
    removeAlarm(alarmInterval) {
        remove(this._alarms, alarmInterval);
        this.uiUpdateCallback();
    }
    removeAll() {
        this._alarms.splice(0);
    }
    addAll(alarmIntervalList) {
        this._alarms.push(...alarmIntervalList);
    }
    get alarms() {
        return this._alarms;
    }
    get result() {
        return {
            alarms: Array.from(this._alarms.values()).map((t) => this.makeNewAlarm(t)),
        };
    }
    makeNewAlarm(alarmInterval) {
        return {
            alarmIdentifier: generateEventElementId(this.dateProvider.now()),
            trigger: serializeAlarmInterval(alarmInterval),
        };
    }
    /**
     * Compares two AlarmIntervals if they have the same duration
     * eg: 60 minutes === 1 hour
     * @param alarmOne base interval
     * @param alarmTwo interval to be compared with
     * @return true if they have the same duration
     */
    isEqualAlarms(alarmOne, alarmTwo) {
        const luxonAlarmOne = Duration.fromDurationLike(alarmIntervalToLuxonDurationLikeObject(alarmOne)).shiftToAll();
        const luxonAlarmTwo = Duration.fromDurationLike(alarmIntervalToLuxonDurationLikeObject(alarmTwo)).shiftToAll();
        return luxonAlarmOne.equals(luxonAlarmTwo);
    }
}
//# sourceMappingURL=CalendarEventAlarmModel.js.map