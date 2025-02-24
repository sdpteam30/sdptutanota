import { getIconForViewType } from "../gui/CalendarGuiUtils.js";
import m from "mithril";
import { px, size } from "../../../common/gui/size.js";
import { lang } from "../../../common/misc/LanguageViewModel.js";
import { IconSegmentControl } from "../../../common/gui/base/IconSegmentControl.js";
import { TodayIconButton } from "./TodayIconButton.js";
import { CalendarViewType } from "../../../common/api/common/utils/CommonCalendarUtils.js";
export class CalendarDesktopToolbar {
    view({ attrs }) {
        const { navConfig } = attrs;
        return m(".flex.row.items-center.content-bg.border-radius-big.mlr-l.rel.pr.pl-vpad-m", {
            style: {
                marginLeft: `5px`,
                marginBottom: px(size.hpad_large),
            },
        }, [
            m("h1", navConfig.title),
            m(".flex.items-center.justify-center.flex-grow.height-100p", this.renderViewSelector(attrs)),
            m(".flex.pt-xs.pb-xs", [
                navConfig.back ?? m(".button-width-fixed"),
                m(".flex", m(TodayIconButton, {
                    click: attrs.onToday,
                })),
                navConfig.forward ?? m(".button-width-fixed"),
            ]),
        ]);
    }
    renderViewSelector(attrs) {
        const calendarViewValues = [
            {
                icon: getIconForViewType(CalendarViewType.AGENDA),
                label: "agenda_label",
                value: CalendarViewType.AGENDA,
            },
            {
                icon: getIconForViewType(CalendarViewType.DAY),
                label: "day_label",
                value: CalendarViewType.DAY,
            },
            {
                icon: getIconForViewType(CalendarViewType.WEEK),
                label: "week_label",
                value: CalendarViewType.WEEK,
            },
            {
                icon: getIconForViewType(CalendarViewType.MONTH),
                label: "month_label",
                value: CalendarViewType.MONTH,
            },
        ];
        // always center the segment control inside the toolbar
        return m(".abs.center-h", {
            role: "tablist",
            "aria-label": lang.get("periodOfTime_label"),
            style: {
                left: 0,
                right: 0,
                // need explicit width to center the control
                width: px(size.icon_segment_control_button_width * 4),
            },
        }, m(IconSegmentControl, {
            selectedValue: attrs.viewType,
            onValueSelected: (type) => attrs.onViewTypeSelected(type),
            items: calendarViewValues,
            maxItemWidth: 48,
        }));
    }
}
//# sourceMappingURL=CalendarDesktopToolbar.js.map