import m from "mithril";
import { hasAlarmsForTheUser, isClientOnlyCalendar } from "../../../common/calendar/date/CalendarUtils";
import { CalendarEventBubble } from "./CalendarEventBubble";
import { formatEventTime, getDisplayEventTitle } from "../gui/CalendarGuiUtils.js";
import { listIdPart } from "../../../common/api/common/utils/EntityUtils.js";
export class ContinuingCalendarEventBubble {
    view({ attrs }) {
        const eventTitle = getDisplayEventTitle(attrs.event.summary);
        return m(".flex.calendar-event-container.darker-hover", [
            attrs.startsBefore
                ? m(".event-continues-right-arrow", {
                    style: {
                        "border-left-color": "transparent",
                        "border-top-color": "#" + attrs.color,
                        "border-bottom-color": "#" + attrs.color,
                        opacity: attrs.opacity,
                    },
                })
                : null,
            m(".flex-grow.overflow-hidden", m(CalendarEventBubble, {
                text: (attrs.showTime != null ? formatEventTime(attrs.event, attrs.showTime) + " " : "") + eventTitle,
                color: attrs.color,
                click: (e) => attrs.onEventClicked(attrs.event, e),
                keyDown: (e) => attrs.onEventKeyDown(attrs.event, e),
                noBorderLeft: attrs.startsBefore,
                noBorderRight: attrs.endsAfter,
                hasAlarm: hasAlarmsForTheUser(attrs.user, attrs.event),
                isAltered: attrs.event.recurrenceId != null,
                fadeIn: attrs.fadeIn,
                opacity: attrs.opacity,
                enablePointerEvents: attrs.enablePointerEvents,
                isClientOnly: isClientOnlyCalendar(listIdPart(attrs.event._id)),
            })),
            attrs.endsAfter
                ? m(".event-continues-right-arrow", {
                    style: {
                        "border-left-color": "#" + attrs.color,
                        opacity: attrs.opacity,
                    },
                })
                : null,
        ]);
    }
}
//# sourceMappingURL=ContinuingCalendarEventBubble.js.map