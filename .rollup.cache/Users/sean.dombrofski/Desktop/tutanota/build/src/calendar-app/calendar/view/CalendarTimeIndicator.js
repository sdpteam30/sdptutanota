import m from "mithril";
import { px, size } from "../../../common/gui/size.js";
/**
 * Indicator used for indicating the current time relative to the current date in the calendar view.
 */
export class CalendarTimeIndicator {
    view({ attrs }) {
        const iconRadius = size.icon_size_small / 2;
        const leftOffset = attrs.circleLeftTangent ? 0 : -iconRadius;
        return m(".accent-bg", {
            "aria-hidden": "true",
            style: {
                height: px(size.calendar_day_event_padding),
            },
        }, m(`.circle.icon-small.accent-bg`, {
            "aria-hidden": "true",
            style: {
                translate: `${px(leftOffset)} ${px(-5)}`,
            },
        }));
    }
}
//# sourceMappingURL=CalendarTimeIndicator.js.map