import m from "mithril";
import { lang } from "../../../common/misc/LanguageViewModel.js";
import { Dialog } from "../../../common/gui/base/Dialog.js";
import { Time } from "../../../common/calendar/date/Time.js";
import { assert, assertNotNull, clamp, clone, getFromMap, getStartOfDay, incrementDate, isNotEmpty, isSameDay, isSameDayOfDate, memoized, numberRange, typedValues, } from "@tutao/tutanota-utils";
import { IconButton } from "../../../common/gui/base/IconButton.js";
import { formatDateTime, formatDateWithMonth, formatDateWithWeekday, formatMonthWithFullYear, formatTime, timeStringFromParts, } from "../../../common/misc/Formatter.js";
import { alarmIntervalToLuxonDurationLikeObject, AlarmIntervalUnit, eventEndsAfterDay, eventStartsBefore, getAllDayDateForTimezone, getEndOfDayWithZone, getEventEnd, getEventStart, getStartOfDayWithZone, getStartOfNextDayWithZone, getStartOfTheWeekOffset, getStartOfWeek, getTimeZone, getWeekNumber, incrementByRepeatPeriod, StandardAlarmInterval, } from "../../../common/calendar/date/CalendarUtils.js";
import { AccountType, CalendarAttendeeStatus, CLIENT_ONLY_CALENDARS, DEFAULT_CLIENT_ONLY_CALENDAR_COLORS, defaultCalendarColor, RepeatPeriod, } from "../../../common/api/common/TutanotaConstants.js";
import { DateTime, Duration } from "luxon";
import { CalendarViewType, cleanMailAddress, isAllDayEvent } from "../../../common/api/common/utils/CommonCalendarUtils.js";
import { ProgrammingError } from "../../../common/api/common/error/ProgrammingError.js";
import { size } from "../../../common/gui/size.js";
import { hslToHex, isColorLight, isValidColorCode, MAX_HUE_ANGLE } from "../../../common/gui/base/Color.js";
import { hasCapabilityOnGroup } from "../../../common/sharing/GroupUtils.js";
import { createAsyncDropdown } from "../../../common/gui/base/Dropdown.js";
import { ColorPickerModel } from "../../../common/gui/base/colorPicker/ColorPickerModel.js";
import { theme } from "../../../common/gui/theme.js";
export function renderCalendarSwitchLeftButton(label, click) {
    return m(IconButton, {
        title: label,
        icon: "ArrowBackward" /* Icons.ArrowBackward */,
        click,
    });
}
export function renderCalendarSwitchRightButton(label, click) {
    return m(IconButton, {
        title: label,
        icon: "ArrowForward" /* Icons.ArrowForward */,
        click,
    });
}
function weekTitle(date, weekStart) {
    const startOfTheWeekOffset = getStartOfTheWeekOffset(weekStart);
    const firstDate = getStartOfWeek(date, startOfTheWeekOffset);
    const lastDate = incrementDate(new Date(firstDate), 6);
    if (firstDate.getMonth() !== lastDate.getMonth()) {
        if (firstDate.getFullYear() !== lastDate.getFullYear()) {
            return `${lang.formats.monthShortWithFullYear.format(firstDate)} - ${lang.formats.monthShortWithFullYear.format(lastDate)}`;
        }
        return `${lang.formats.monthShort.format(firstDate)} - ${lang.formats.monthShort.format(lastDate)} ${lang.formats.yearNumeric.format(firstDate)}`;
    }
    else {
        return `${lang.formats.monthLong.format(firstDate)} ${lang.formats.yearNumeric.format(firstDate)}`;
    }
}
export function getNextFourteenDays(startOfToday) {
    let calculationDate = new Date(startOfToday);
    const days = [];
    for (let i = 0; i < 14; i++) {
        days.push(new Date(calculationDate.getTime()));
        calculationDate = incrementDate(calculationDate, 1);
    }
    return days;
}
export function calendarWeek(date, weekStart) {
    // According to ISO 8601, weeks always start on Monday. Week numbering systems for
    // weeks that do not start on Monday are not strictly defined, so we only display
    // a week number if the user's client is configured to start weeks on Monday
    if (weekStart !== "0" /* WeekStart.MONDAY */) {
        return null;
    }
    return lang.get("weekNumber_label", {
        "{week}": String(getWeekNumber(date)),
    });
}
export function calendarNavConfiguration(viewType, date, weekStart, titleType, switcher) {
    const onBack = () => switcher(viewType, false);
    const onForward = () => switcher(viewType, true);
    switch (viewType) {
        case CalendarViewType.DAY:
            return {
                back: renderCalendarSwitchLeftButton("prevDay_label", onBack),
                forward: renderCalendarSwitchRightButton("nextDay_label", onForward),
                title: titleType === "short" ? formatMonthWithFullYear(date) : formatDateWithWeekday(date),
            };
        case CalendarViewType.MONTH:
            return {
                back: renderCalendarSwitchLeftButton("prevMonth_label", onBack),
                forward: renderCalendarSwitchRightButton("nextMonth_label", onForward),
                title: formatMonthWithFullYear(date),
            };
        case CalendarViewType.WEEK:
            return {
                back: renderCalendarSwitchLeftButton("prevWeek_label", onBack),
                forward: renderCalendarSwitchRightButton("nextWeek_label", onForward),
                title: titleType === "short" ? formatMonthWithFullYear(date) : weekTitle(date, weekStart),
            };
        case CalendarViewType.AGENDA:
            return {
                back: renderCalendarSwitchLeftButton("prevDay_label", onBack),
                forward: renderCalendarSwitchRightButton("nextDay_label", onForward),
                title: titleType === "short" ? formatMonthWithFullYear(date) : formatDateWithWeekday(date),
            };
    }
}
export function askIfShouldSendCalendarUpdatesToAttendees() {
    return new Promise((resolve) => {
        let alertDialog;
        const cancelButton = {
            label: "cancel_action",
            click: () => {
                resolve("cancel");
                alertDialog.close();
            },
            type: "secondary" /* ButtonType.Secondary */,
        };
        const noButton = {
            label: "no_label",
            click: () => {
                resolve("no");
                alertDialog.close();
            },
            type: "secondary" /* ButtonType.Secondary */,
        };
        const yesButton = {
            label: "yes_label",
            click: () => {
                resolve("yes");
                alertDialog.close();
            },
            type: "primary" /* ButtonType.Primary */,
        };
        const onclose = (positive) => (positive ? resolve("yes") : resolve("cancel"));
        alertDialog = Dialog.confirmMultiple("sendUpdates_msg", [cancelButton, noButton, yesButton], onclose);
    });
}
/**
 * Map the location of a mouse click on an element to a give date, given a list of weeks
 * there should be neither zero weeks, nor zero length weeks
 */
export function getDateFromMousePos({ x, y, targetWidth, targetHeight }, weeks) {
    assert(weeks.length > 0, "Weeks must not be zero length");
    const unitHeight = targetHeight / weeks.length;
    const currentSquareY = Math.floor(y / unitHeight);
    const week = weeks[clamp(currentSquareY, 0, weeks.length - 1)];
    assert(week.length > 0, "Week must not be zero length");
    const unitWidth = targetWidth / week.length;
    const currentSquareX = Math.floor(x / unitWidth);
    return week[clamp(currentSquareX, 0, week.length - 1)];
}
/**
 * Map the vertical position of a mouse click on an element to a time of day
 * @param y
 * @param targetHeight
 * @param hourDivision: how many times to divide the hour
 */
export function getTimeFromMousePos({ y, targetHeight }, hourDivision) {
    const sectionHeight = targetHeight / 24;
    const hour = y / sectionHeight;
    const hourRounded = Math.floor(hour);
    const minutesInc = 60 / hourDivision;
    const minute = Math.floor((hour - hourRounded) * hourDivision) * minutesInc;
    return new Time(hourRounded, minute);
}
export const SELECTED_DATE_INDICATOR_THICKNESS = 4;
export function getIconForViewType(viewType) {
    const lookupTable = {
        [CalendarViewType.DAY]: "TableSingle" /* Icons.TableSingle */,
        [CalendarViewType.WEEK]: "TableColumns" /* Icons.TableColumns */,
        [CalendarViewType.MONTH]: "Table" /* Icons.Table */,
        [CalendarViewType.AGENDA]: "ListUnordered" /* Icons.ListUnordered */,
    };
    return lookupTable[viewType];
}
export function shouldDefaultToAmPmTimeFormat() {
    return lang.code === "en";
}
/**
 * get an object representing the calendar month the given date is in.
 */
export function getCalendarMonth(date, firstDayOfWeekFromOffset, weekdayNarrowFormat) {
    const weeks = [[]];
    const calculationDate = getStartOfDay(date);
    calculationDate.setDate(1);
    const beginningOfMonth = new Date(calculationDate);
    let currentYear = calculationDate.getFullYear();
    let month = calculationDate.getMonth();
    // add "padding" days
    // getDay returns the day of the week (from 0 to 6) for the specified date (with first one being Sunday)
    let firstDay;
    if (firstDayOfWeekFromOffset > calculationDate.getDay()) {
        firstDay = calculationDate.getDay() + 7 - firstDayOfWeekFromOffset;
    }
    else {
        firstDay = calculationDate.getDay() - firstDayOfWeekFromOffset;
    }
    let dayCount;
    incrementDate(calculationDate, -firstDay);
    for (dayCount = 0; dayCount < firstDay; dayCount++) {
        weeks[0].push({
            date: new Date(calculationDate),
            day: calculationDate.getDate(),
            month: calculationDate.getMonth(),
            year: calculationDate.getFullYear(),
            isPaddingDay: true,
        });
        incrementDate(calculationDate, 1);
    }
    // add actual days
    while (calculationDate.getMonth() === month) {
        if (weeks[0].length && dayCount % 7 === 0) {
            // start new week
            weeks.push([]);
        }
        const dayInfo = {
            date: new Date(currentYear, month, calculationDate.getDate()),
            year: currentYear,
            month: month,
            day: calculationDate.getDate(),
            isPaddingDay: false,
        };
        weeks[weeks.length - 1].push(dayInfo);
        incrementDate(calculationDate, 1);
        dayCount++;
    }
    // add remaining "padding" days
    while (dayCount < 42) {
        if (dayCount % 7 === 0) {
            weeks.push([]);
        }
        weeks[weeks.length - 1].push({
            day: calculationDate.getDate(),
            year: calculationDate.getFullYear(),
            month: calculationDate.getMonth(),
            date: new Date(calculationDate),
            isPaddingDay: true,
        });
        incrementDate(calculationDate, 1);
        dayCount++;
    }
    const weekdays = [];
    const weekdaysDate = new Date();
    incrementDate(weekdaysDate, -weekdaysDate.getDay() + firstDayOfWeekFromOffset); // get first day of week
    for (let i = 0; i < 7; i++) {
        weekdays.push(weekdayNarrowFormat ? lang.formats.weekdayNarrow.format(weekdaysDate) : lang.formats.weekdayShort.format(weekdaysDate));
        incrementDate(weekdaysDate, 1);
    }
    return {
        beginningOfMonth,
        weekdays,
        weeks,
    };
}
export function formatEventDuration(event, zone, includeTimezone) {
    if (isAllDayEvent(event)) {
        const startTime = getEventStart(event, zone);
        const startString = formatDateWithMonth(startTime);
        const endTime = incrementByRepeatPeriod(getEventEnd(event, zone), RepeatPeriod.DAILY, -1, zone);
        if (isSameDayOfDate(startTime, endTime)) {
            return `${lang.get("allDay_label")}, ${startString}`;
        }
        else {
            return `${lang.get("allDay_label")}, ${startString} - ${formatDateWithMonth(endTime)}`;
        }
    }
    else {
        const startString = formatDateTime(event.startTime);
        let endString;
        if (isSameDay(event.startTime, event.endTime)) {
            endString = formatTime(event.endTime);
        }
        else {
            endString = formatDateTime(event.endTime);
        }
        return `${startString} - ${endString} ${includeTimezone ? getTimeZone() : ""}`;
    }
}
export const createRepeatRuleFrequencyValues = () => {
    return [
        {
            name: lang.get("calendarRepeatIntervalNoRepeat_label"),
            value: null,
        },
        {
            name: lang.get("calendarRepeatIntervalDaily_label"),
            value: RepeatPeriod.DAILY,
        },
        {
            name: lang.get("calendarRepeatIntervalWeekly_label"),
            value: RepeatPeriod.WEEKLY,
        },
        {
            name: lang.get("calendarRepeatIntervalMonthly_label"),
            value: RepeatPeriod.MONTHLY,
        },
        {
            name: lang.get("calendarRepeatIntervalAnnually_label"),
            value: RepeatPeriod.ANNUALLY,
        },
    ];
};
export const createRepeatRuleOptions = () => {
    return [
        {
            name: "calendarRepeatIntervalNoRepeat_label",
            value: null,
        },
        {
            name: "calendarRepeatIntervalDaily_label",
            value: RepeatPeriod.DAILY,
        },
        {
            name: "calendarRepeatIntervalWeekly_label",
            value: RepeatPeriod.WEEKLY,
        },
        {
            name: "calendarRepeatIntervalMonthly_label",
            value: RepeatPeriod.MONTHLY,
        },
        {
            name: "calendarRepeatIntervalAnnually_label",
            value: RepeatPeriod.ANNUALLY,
        },
        {
            name: "custom_label",
            value: "CUSTOM",
        },
    ];
};
export const customFrequenciesOptions = [
    {
        name: { singular: "day_label", plural: "days_label" },
        value: RepeatPeriod.DAILY,
    },
    {
        name: { singular: "week_label", plural: "weeks_label" },
        value: RepeatPeriod.WEEKLY,
    },
    {
        name: { singular: "month_label", plural: "months_label" },
        value: RepeatPeriod.MONTHLY,
    },
    {
        name: { singular: "year_label", plural: "years_label" },
        value: RepeatPeriod.ANNUALLY,
    },
];
export const createCustomEndTypeOptions = () => {
    return [
        {
            name: "calendarRepeatStopConditionNever_label",
            value: "0" /* EndType.Never */,
        },
        {
            name: "calendarRepeatStopConditionOccurrences_label",
            value: "1" /* EndType.Count */,
        },
        {
            name: "calendarRepeatStopConditionDate_label",
            value: "2" /* EndType.UntilDate */,
        },
    ];
};
export const createRepeatRuleEndTypeValues = () => {
    return [
        {
            name: lang.get("calendarRepeatStopConditionNever_label"),
            value: "0" /* EndType.Never */,
        },
        {
            name: lang.get("calendarRepeatStopConditionOccurrences_label"),
            value: "1" /* EndType.Count */,
        },
        {
            name: lang.get("calendarRepeatStopConditionDate_label"),
            value: "2" /* EndType.UntilDate */,
        },
    ];
};
export const createIntervalValues = () => numberRange(1, 256).map((n) => ({ name: String(n), value: n, ariaValue: String(n) }));
export function humanDescriptionForAlarmInterval(value, locale) {
    if (value.value === 0)
        return lang.get("calendarReminderIntervalAtEventStart_label");
    return Duration.fromObject(alarmIntervalToLuxonDurationLikeObject(value)).reconfigure({ locale: locale }).toHuman();
}
export const createAlarmIntervalItems = (locale) => typedValues(StandardAlarmInterval).map((value) => {
    return {
        value,
        name: humanDescriptionForAlarmInterval(value, locale),
    };
});
export const createAttendingItems = () => [
    {
        name: lang.get("attending_label"),
        value: CalendarAttendeeStatus.ACCEPTED,
        ariaValue: lang.get("attending_label"),
    },
    {
        name: lang.get("maybeAttending_label"),
        value: CalendarAttendeeStatus.TENTATIVE,
        ariaValue: lang.get("maybeAttending_label"),
    },
    {
        name: lang.get("notAttending_label"),
        value: CalendarAttendeeStatus.DECLINED,
        ariaValue: lang.get("notAttending_label"),
    },
    {
        name: lang.get("pending_label"),
        value: CalendarAttendeeStatus.NEEDS_ACTION,
        selectable: false,
        ariaValue: lang.get("pending_label"),
    },
];
export function humanDescriptionForAlarmIntervalUnit(unit) {
    switch (unit) {
        case AlarmIntervalUnit.MINUTE:
            return lang.get("calendarReminderIntervalUnitMinutes_label");
        case AlarmIntervalUnit.HOUR:
            return lang.get("calendarReminderIntervalUnitHours_label");
        case AlarmIntervalUnit.DAY:
            return lang.get("calendarReminderIntervalUnitDays_label");
        case AlarmIntervalUnit.WEEK:
            return lang.get("calendarReminderIntervalUnitWeeks_label");
    }
}
export function timeString(date, amPm) {
    return timeStringFromParts(date.getHours(), date.getMinutes(), amPm);
}
export function timeStringInZone(date, amPm, zone) {
    const { hour, minute } = DateTime.fromJSDate(date, {
        zone,
    });
    return timeStringFromParts(hour, minute, amPm);
}
export function formatEventTime({ endTime, startTime }, showTime) {
    switch (showTime) {
        case "startTime" /* EventTextTimeOption.START_TIME */:
            return formatTime(startTime);
        case "endTime" /* EventTextTimeOption.END_TIME */:
            return ` - ${formatTime(endTime)}`;
        case "startAndEndTime" /* EventTextTimeOption.START_END_TIME */:
            return `${formatTime(startTime)} - ${formatTime(endTime)}`;
        default:
            throw new ProgrammingError(`Unknown time option: ${showTime}`);
    }
}
export function formatEventTimes(day, event, zone) {
    if (isAllDayEvent(event)) {
        return lang.get("allDay_label");
    }
    else {
        const startsBefore = eventStartsBefore(day, zone, event);
        const endsAfter = eventEndsAfterDay(day, zone, event);
        if (startsBefore && endsAfter) {
            return lang.get("allDay_label");
        }
        else {
            const startTime = startsBefore ? day : event.startTime;
            const endTime = endsAfter ? getEndOfDayWithZone(day, zone) : event.endTime;
            return formatEventTime({ startTime, endTime }, "startAndEndTime" /* EventTextTimeOption.START_END_TIME */);
        }
    }
}
export const createCustomRepeatRuleUnitValues = () => {
    return [
        {
            name: humanDescriptionForAlarmIntervalUnit(AlarmIntervalUnit.MINUTE),
            value: AlarmIntervalUnit.MINUTE,
        },
        {
            name: humanDescriptionForAlarmIntervalUnit(AlarmIntervalUnit.HOUR),
            value: AlarmIntervalUnit.HOUR,
        },
        {
            name: humanDescriptionForAlarmIntervalUnit(AlarmIntervalUnit.DAY),
            value: AlarmIntervalUnit.DAY,
        },
        {
            name: humanDescriptionForAlarmIntervalUnit(AlarmIntervalUnit.WEEK),
            value: AlarmIntervalUnit.WEEK,
        },
    ];
};
export const CALENDAR_EVENT_HEIGHT = size.calendar_line_height + 2;
export const TEMPORARY_EVENT_OPACITY = 0.7;
/**
 * Function which sorts events into the "columns" and "rows" and renders them using {@param renderer}.
 * Columns are abstract and can be actually the rows. A single column progresses in time while multiple columns can happen in parallel.
 * in one column on a single day (it will "stretch" events from the day start until the next day).
 */
export function layOutEvents(events, zone, renderer, layoutMode) {
    events.sort((e1, e2) => {
        const e1Start = getEventStart(e1, zone);
        const e2Start = getEventStart(e2, zone);
        if (e1Start < e2Start)
            return -1;
        if (e1Start > e2Start)
            return 1;
        const e1End = getEventEnd(e1, zone);
        const e2End = getEventEnd(e2, zone);
        if (e1End < e2End)
            return -1;
        if (e1End > e2End)
            return 1;
        return 0;
    });
    let lastEventEnding = null;
    let lastEventStart = null;
    let columns = [];
    const children = [];
    // Cache for calculation events
    const calcEvents = new Map();
    for (const e of events) {
        const calcEvent = getFromMap(calcEvents, e, () => getCalculationEvent(e, zone, layoutMode));
        // Check if a new event group needs to be started
        if (lastEventEnding != null &&
            lastEventStart != null &&
            lastEventEnding <= calcEvent.startTime.getTime() &&
            (layoutMode === 1 /* EventLayoutMode.DayBasedColumn */ || !visuallyOverlaps(lastEventStart, lastEventEnding, calcEvent.startTime))) {
            // The latest event is later than any of the event in the
            // current group. There is no overlap. Output the current
            // event group and start a new event group.
            children.push(...renderer(columns));
            columns = []; // This starts new event group.
            lastEventEnding = null;
            lastEventStart = null;
        }
        // Try to place the event inside the existing columns
        let placed = false;
        for (let i = 0; i < columns.length; i++) {
            const col = columns[i];
            const lastEvent = col[col.length - 1];
            const lastCalcEvent = getFromMap(calcEvents, lastEvent, () => getCalculationEvent(lastEvent, zone, layoutMode));
            if (!collidesWith(lastCalcEvent, calcEvent) &&
                (layoutMode === 1 /* EventLayoutMode.DayBasedColumn */ || !visuallyOverlaps(lastCalcEvent.startTime, lastCalcEvent.endTime, calcEvent.startTime))) {
                col.push(e); // push real event here not calc event
                placed = true;
                break;
            }
        }
        // It was not possible to place the event. Add a new column
        // for the current event group.
        if (!placed) {
            columns.push([e]);
        }
        // Remember the latest event end time and start time of the current group.
        // This is later used to determine if a new groups starts.
        if (lastEventEnding == null || lastEventEnding.getTime() < calcEvent.endTime.getTime()) {
            lastEventEnding = calcEvent.endTime;
        }
        if (lastEventStart == null || lastEventStart.getTime() < calcEvent.startTime.getTime()) {
            lastEventStart = calcEvent.startTime;
        }
    }
    children.push(...renderer(columns));
    return children;
}
/** get an event that can be rendered to the screen. in day view, the event is returned as-is, otherwise it's stretched to cover each day
 * it occurs on completely. */
function getCalculationEvent(event, zone, eventLayoutMode) {
    if (eventLayoutMode === 1 /* EventLayoutMode.DayBasedColumn */) {
        const calcEvent = clone(event);
        if (isAllDayEvent(event)) {
            calcEvent.startTime = getAllDayDateForTimezone(event.startTime, zone);
            calcEvent.endTime = getAllDayDateForTimezone(event.endTime, zone);
        }
        else {
            calcEvent.startTime = getStartOfDayWithZone(event.startTime, zone);
            calcEvent.endTime = getStartOfNextDayWithZone(event.endTime, zone);
        }
        return calcEvent;
    }
    else {
        return event;
    }
}
/**
 * This function checks whether two events collide based on their start and end time
 * Assuming vertical columns with time going top-to-bottom, this would be true in these cases:
 *
 * case 1:
 * +-----------+
 * |           |
 * |           |   +----------+
 * +-----------+   |          |
 *                 |          |
 *                 +----------+
 * case 2:
 * +-----------+
 * |           |   +----------+
 * |           |   |          |
 * |           |   +----------+
 * +-----------+
 *
 * There could be a case where they are flipped vertically, but we don't have them because earlier events will be always first. so the "left" top edge will
 * always be "above" the "right" top edge.
 */
function collidesWith(a, b) {
    return a.endTime.getTime() > b.startTime.getTime() && a.startTime.getTime() < b.endTime.getTime();
}
/**
 * Due to the minimum height for events they overlap if a short event is directly followed by another event,
 * therefore, we check whether the event height is less than the minimum height.
 *
 * This does not cover all the cases but handles the case when the second event starts right after the first one.
 */
function visuallyOverlaps(firstEventStart, firstEventEnd, secondEventStart) {
    // We are only interested in the height on the last day of the event because an event ending later will take up the whole column until the next day anyway.
    const firstEventStartOnSameDay = isSameDay(firstEventStart, firstEventEnd) ? firstEventStart.getTime() : getStartOfDay(firstEventEnd).getTime();
    const eventDurationMs = firstEventEnd.getTime() - firstEventStartOnSameDay;
    const eventDurationHours = eventDurationMs / (1000 * 60 * 60);
    const height = eventDurationHours * size.calendar_hour_height - size.calendar_event_border;
    return firstEventEnd.getTime() === secondEventStart.getTime() && height < size.calendar_line_height;
}
export function expandEvent(ev, columnIndex, columns) {
    let colSpan = 1;
    for (let i = columnIndex + 1; i < columns.length; i++) {
        let col = columns[i];
        for (let j = 0; j < col.length; j++) {
            let ev1 = col[j];
            if (collidesWith(ev, ev1) || visuallyOverlaps(ev.startTime, ev.endTime, ev1.startTime)) {
                return colSpan;
            }
        }
        colSpan++;
    }
    return colSpan;
}
export function getEventColor(event, groupColors) {
    return (event._ownerGroup && groupColors.get(event._ownerGroup)) ?? defaultCalendarColor;
}
export function calendarAttendeeStatusSymbol(status) {
    switch (status) {
        case CalendarAttendeeStatus.ADDED:
        case CalendarAttendeeStatus.NEEDS_ACTION:
            return "";
        case CalendarAttendeeStatus.TENTATIVE:
            return "?";
        case CalendarAttendeeStatus.ACCEPTED:
            return "✓";
        case CalendarAttendeeStatus.DECLINED:
            return "❌";
        default:
            throw new Error("Unknown calendar attendee status: " + status);
    }
}
export const iconForAttendeeStatus = Object.freeze({
    [CalendarAttendeeStatus.ACCEPTED]: "CircleCheckmark" /* Icons.CircleCheckmark */,
    [CalendarAttendeeStatus.TENTATIVE]: "CircleHelp" /* Icons.CircleHelp */,
    [CalendarAttendeeStatus.DECLINED]: "CircleReject" /* Icons.CircleReject */,
    [CalendarAttendeeStatus.NEEDS_ACTION]: "CircleHelp" /* Icons.CircleHelp */,
    [CalendarAttendeeStatus.ADDED]: "CircleHelp" /* Icons.CircleHelp */,
});
export const getGroupColors = memoized((userSettingsGroupRoot) => {
    return userSettingsGroupRoot.groupSettings.reduce((acc, { group, color }) => {
        if (!isValidColorCode("#" + color)) {
            color = defaultCalendarColor;
        }
        acc.set(group, color);
        return acc;
    }, new Map());
});
export const getClientOnlyColors = (userId, clientOnlyCalendarsInfo) => {
    const colors = new Map();
    for (const [id, _] of CLIENT_ONLY_CALENDARS) {
        const calendarId = `${userId}#${id}`;
        colors.set(calendarId, clientOnlyCalendarsInfo.get(calendarId)?.color ?? DEFAULT_CLIENT_ONLY_CALENDAR_COLORS.get(id));
    }
    return colors;
};
export const getClientOnlyCalendars = (userId, clientOnlyCalendarInfo) => {
    const userCalendars = [];
    for (const [id, key] of CLIENT_ONLY_CALENDARS) {
        const calendarId = `${userId}#${id}`;
        const calendar = clientOnlyCalendarInfo.get(calendarId);
        if (calendar) {
            userCalendars.push({
                ...calendar,
                id: calendarId,
                name: calendar.name ? calendar.name : lang.get(key),
            });
        }
    }
    return userCalendars;
};
/**
 *  find out how we ended up with this event, which determines the capabilities we have with it.
 *  for shared events in calendar where we have read-write access, we can still only view events that have
 *  attendees, because we could not send updates after we edit something
 * @param existingEvent the event in question.
 * @param calendars a list of calendars that this user has access to.
 * @param ownMailAddresses the list of mail addresses this user might be using.
 * @param userController
 */
export function getEventType(existingEvent, calendars, ownMailAddresses, userController) {
    const { user, userSettingsGroupRoot } = userController;
    if (user.accountType === AccountType.EXTERNAL) {
        return "external" /* EventType.EXTERNAL */;
    }
    const existingOrganizer = existingEvent.organizer;
    const isOrganizer = existingOrganizer != null && ownMailAddresses.some((a) => cleanMailAddress(a) === existingOrganizer.address);
    if (existingEvent._ownerGroup == null) {
        if (existingOrganizer != null && !isOrganizer) {
            // OwnerGroup is not set for events from file, but we also require an organizer to treat it as an invite.
            return "invite" /* EventType.INVITE */;
        }
        else {
            // either the organizer exists and it's us, or the organizer does not exist and we can treat this as our event,
            // like for newly created events.
            return "own" /* EventType.OWN */;
        }
    }
    const calendarInfoForEvent = calendars.get(existingEvent._ownerGroup) ?? null;
    if (calendarInfoForEvent == null || calendarInfoForEvent.isExternal) {
        // event has an ownergroup, but it's not in one of our calendars. this might actually be an error.
        return "shared_ro" /* EventType.SHARED_RO */;
    }
    /**
     * if the event has a _ownerGroup, it means there is a calendar set to it
     * so, if the user is the owner of said calendar they are free to manage the event however they want
     **/
    if ((isOrganizer || existingOrganizer === null) && calendarInfoForEvent.userIsOwner) {
        return "own" /* EventType.OWN */;
    }
    if (calendarInfoForEvent.shared) {
        const canWrite = hasCapabilityOnGroup(user, calendarInfoForEvent.group, "1" /* ShareCapability.Write */);
        if (canWrite) {
            const organizerAddress = cleanMailAddress(existingOrganizer?.address ?? "");
            const wouldRequireUpdates = existingEvent.attendees != null && existingEvent.attendees.some((a) => cleanMailAddress(a.address.address) !== organizerAddress);
            return wouldRequireUpdates ? "locked" /* EventType.LOCKED */ : "shared_rw" /* EventType.SHARED_RW */;
        }
        else {
            return "shared_ro" /* EventType.SHARED_RO */;
        }
    }
    //For an event in a personal calendar there are 3 options
    if (existingOrganizer == null || existingEvent.attendees?.length === 0 || isOrganizer) {
        // 1. we are the organizer of the event or the event does not have an organizer yet
        // 2. we are not the organizer and the event does not have guests. it was created by someone we shared our calendar with (also considered our own event)
        return "own" /* EventType.OWN */;
    }
    else {
        // 3. the event is an invitation that has another organizer and/or attendees.
        return "invite" /* EventType.INVITE */;
    }
}
export function shouldDisplayEvent(e, hiddenCalendars) {
    return !hiddenCalendars.has(assertNotNull(e._ownerGroup, "event without ownerGroup in getEventsOnDays"));
}
export function daysHaveEvents(eventsOnDays) {
    return eventsOnDays.shortEventsPerDay.some(isNotEmpty) || isNotEmpty(eventsOnDays.longEvents);
}
/**
 * A handler for `onwheel` to move to a forwards or previous view based on mouse wheel movement
 * @returns a function to be used by `onwheel`
 */
export function changePeriodOnWheel(callback) {
    return (event) => {
        // Go to the next period if scrolling down or right
        callback(event.deltaY > 0 || event.deltaX > 0);
    };
}
export async function showDeletePopup(model, ev, receiver, onClose) {
    if (await model.isRepeatingForDeleting()) {
        createAsyncDropdown({
            lazyButtons: () => Promise.resolve([
                {
                    label: "deleteSingleEventRecurrence_action",
                    click: async () => {
                        await model.deleteSingle();
                        onClose?.();
                    },
                },
                {
                    label: "deleteAllEventRecurrence_action",
                    click: () => confirmDeleteClose(model, onClose),
                },
            ]),
            width: 300,
        })(ev, receiver);
    }
    else {
        // noinspection JSIgnoredPromiseFromCall
        confirmDeleteClose(model, onClose);
    }
}
async function confirmDeleteClose(model, onClose) {
    if (!(await Dialog.confirm("deleteEventConfirmation_msg")))
        return;
    await model.deleteAll();
    onClose?.();
}
export function getDisplayEventTitle(title) {
    return title ?? title !== "" ? title : lang.get("noTitle_label");
}
export function generateRandomColor() {
    const model = new ColorPickerModel(!isColorLight(theme.content_bg));
    return hslToHex(model.getColor(Math.floor(Math.random() * MAX_HUE_ANGLE), 2));
}
export function renderCalendarColor(selectedCalendar, groupColors) {
    const color = selectedCalendar ? groupColors.get(selectedCalendar.groupInfo.group) ?? defaultCalendarColor : null;
    return m(".mt-xs", {
        style: {
            width: "100px",
            height: "10px",
            background: color ? "#" + color : "transparent",
        },
    });
}
//# sourceMappingURL=CalendarGuiUtils.js.map