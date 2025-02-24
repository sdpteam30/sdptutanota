import { assignEventId, checkEventValidity, getTimeZone } from "../date/CalendarUtils.js";
import { freezeMap, getFromMap, groupBy, insertIntoSortedArray } from "@tutao/tutanota-utils";
import { generateEventElementId } from "../../api/common/utils/CommonCalendarUtils.js";
import { createDateWrapper } from "../../api/entities/sys/TypeRefs.js";
import { parseCalendarEvents, parseICalendar } from "../../../calendar-app/calendar/export/CalendarParser.js";
import { lang } from "../../misc/LanguageViewModel.js";
import { assertValidURL } from "@tutao/tutanota-utils/dist/Utils.js";
export var EventImportRejectionReason;
(function (EventImportRejectionReason) {
    EventImportRejectionReason[EventImportRejectionReason["Pre1970"] = 0] = "Pre1970";
    EventImportRejectionReason[EventImportRejectionReason["Inversed"] = 1] = "Inversed";
    EventImportRejectionReason[EventImportRejectionReason["InvalidDate"] = 2] = "InvalidDate";
    EventImportRejectionReason[EventImportRejectionReason["Duplicate"] = 3] = "Duplicate";
})(EventImportRejectionReason || (EventImportRejectionReason = {}));
/** check if the event should be skipped because it's invalid or already imported. if not, add it to the map. */
function shouldBeSkipped(event, instanceIdentifierToEventMap) {
    if (!event.uid) {
        // should not happen because calendar parser will generate uids if they do not exist
        throw new Error("Uid is not set for imported event");
    }
    switch (checkEventValidity(event)) {
        case 0 /* CalendarEventValidity.InvalidContainsInvalidDate */:
            return EventImportRejectionReason.InvalidDate;
        case 1 /* CalendarEventValidity.InvalidEndBeforeStart */:
            return EventImportRejectionReason.Inversed;
        case 2 /* CalendarEventValidity.InvalidPre1970 */:
            return EventImportRejectionReason.Pre1970;
    }
    const instanceIdentifier = makeInstanceIdentifier(event);
    if (!instanceIdentifierToEventMap.has(instanceIdentifier)) {
        instanceIdentifierToEventMap.set(instanceIdentifier, event);
        return null;
    }
    else {
        return EventImportRejectionReason.Duplicate;
    }
}
/** we try to enforce that each calendar only contains each uid once, but we need to take into consideration
 * that altered instances have the same uid as their progenitor.*/
function makeInstanceIdentifier(event) {
    return `${event.uid}-${event.recurrenceId?.getTime() ?? "progenitor"}`;
}
/** sort the parsed events into the ones we want to create and the ones we want to reject (stating a rejection reason)
 * will assign event id according to the calendarGroupRoot and the long/short event status */
export function sortOutParsedEvents(parsedEvents, existingEvents, calendarGroupRoot, zone) {
    const instanceIdentifierToEventMap = new Map();
    for (const existingEvent of existingEvents) {
        if (existingEvent.uid == null)
            continue;
        instanceIdentifierToEventMap.set(makeInstanceIdentifier(existingEvent), existingEvent);
    }
    const rejectedEvents = new Map();
    const eventsForCreation = [];
    for (const [_, flatParsedEvents] of groupBy(parsedEvents, (e) => e.event.uid)) {
        let progenitor = null;
        let alteredInstances = [];
        for (const { event, alarms } of flatParsedEvents) {
            if (flatParsedEvents.length > 1)
                console.warn("[ImportExportUtils] Found events with same uid: flatParsedEvents with more than one entry", { flatParsedEvents });
            const rejectionReason = shouldBeSkipped(event, instanceIdentifierToEventMap);
            if (rejectionReason != null) {
                getFromMap(rejectedEvents, rejectionReason, () => []).push(event);
                continue;
            }
            // hashedUid will be set later in calendarFacade to avoid importing the hash function here
            const repeatRule = event.repeatRule;
            event._ownerGroup = calendarGroupRoot._id;
            if (repeatRule != null && repeatRule.timeZone === "") {
                repeatRule.timeZone = getTimeZone();
            }
            for (let alarmInfo of alarms) {
                alarmInfo.alarmIdentifier = generateEventElementId(Date.now());
            }
            assignEventId(event, zone, calendarGroupRoot);
            if (event.recurrenceId == null) {
                // the progenitor must be null here since we would have
                // rejected the second uid-progenitor event in shouldBeSkipped.
                progenitor = { event, alarms };
            }
            else {
                if (progenitor?.event.repeatRule != null) {
                    insertIntoSortedArray(createDateWrapper({ date: event.recurrenceId }), progenitor.event.repeatRule.excludedDates, (left, right) => left.date.getTime() - right.date.getTime(), () => true);
                }
                alteredInstances.push({ event, alarms });
            }
        }
        if (progenitor != null)
            eventsForCreation.push(progenitor);
        eventsForCreation.push(...alteredInstances);
    }
    return { rejectedEvents, eventsForCreation };
}
/** importer internals exported for testing */
export function parseCalendarStringData(value, zone) {
    const tree = parseICalendar(value);
    return parseCalendarEvents(tree, zone);
}
export function isIcal(iCalStr) {
    return iCalStr.trimStart().split(/\r?\n/, 1)[0] === "BEGIN:VCALENDAR";
}
export function getExternalCalendarName(iCalStr) {
    let calName = iCalStr.match(/X-WR-CALNAME:(.*)\r?\n/);
    const name = calName ? calName[1] : iCalStr.match(/PRODID:-\/\/(.*)\/\//)?.[1];
    return name ?? lang.get("noTitle_label");
}
export function checkURLString(url) {
    const assertResult = assertValidURL(url);
    if (!assertResult)
        return "invalidURL_msg";
    if (!hasValidProtocol(assertResult, ["https:"]))
        return "invalidURLProtocol_msg";
    return assertResult;
}
export function hasValidProtocol(url, validProtocols) {
    return validProtocols.includes(url.protocol);
}
export const BYRULE_MAP = freezeMap(new Map([
    ["BYMINUTE", 0 /* ByRule.BYMINUTE */],
    ["BYHOUR", 1 /* ByRule.BYHOUR */],
    ["BYDAY", 2 /* ByRule.BYDAY */],
    ["BYMONTHDAY", 3 /* ByRule.BYMONTHDAY */],
    ["BYYEARDAY", 4 /* ByRule.BYYEARDAY */],
    ["BYWEEKNO", 5 /* ByRule.BYWEEKNO */],
    ["BYMONTH", 6 /* ByRule.BYMONTH */],
    ["BYSETPOS", 7 /* ByRule.BYSETPOS */],
    ["WKST", 8 /* ByRule.WKST */],
]));
//# sourceMappingURL=ImportExportUtils.js.map