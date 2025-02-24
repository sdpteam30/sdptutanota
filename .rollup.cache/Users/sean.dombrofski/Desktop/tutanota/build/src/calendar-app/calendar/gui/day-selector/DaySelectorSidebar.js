import m from "mithril";
import { formatMonthWithFullYear } from "../../../../common/misc/Formatter.js";
import { incrementMonth, isSameDay } from "@tutao/tutanota-utils";
import { DaySelector } from "./DaySelector.js";
import renderSwitchMonthArrowIcon from "../../../../common/gui/base/buttons/ArrowButton.js";
export class DaySelectorSidebar {
    currentDate;
    openDate;
    constructor(vnode) {
        this.currentDate = vnode.attrs.selectedDate;
        this.openDate = vnode.attrs.selectedDate;
    }
    view(vnode) {
        if (vnode.attrs.selectedDate !== this.openDate) {
            this.currentDate = vnode.attrs.selectedDate;
            this.openDate = vnode.attrs.selectedDate;
        }
        const disableHighlight = !isSameDay(vnode.attrs.selectedDate, this.currentDate);
        return m(".plr-m.mt-form", m(".elevated-bg.pt-s.pb-m.border-radius.flex.flex-column", [
            this.renderPickerHeader(this.currentDate),
            m(".flex-grow.overflow-hidden", [
                m(DaySelector, {
                    selectedDate: this.currentDate,
                    onDateSelected: vnode.attrs.onDateSelected,
                    wide: false,
                    startOfTheWeekOffset: vnode.attrs.startOfTheWeekOffset,
                    isDaySelectorExpanded: true,
                    handleDayPickerSwipe: (isNext) => {
                        this.onMonthChange(isNext);
                        m.redraw();
                    },
                    showDaySelection: vnode.attrs.showDaySelection && !disableHighlight,
                    highlightToday: vnode.attrs.highlightToday,
                    highlightSelectedWeek: vnode.attrs.highlightSelectedWeek && !disableHighlight,
                    useNarrowWeekName: true,
                    hasEventOn: vnode.attrs.hasEventsOn,
                }),
            ]),
        ]));
    }
    renderPickerHeader(date) {
        return m(".flex.flex-space-between.pb.items-center.mlr-xs", [
            renderSwitchMonthArrowIcon(false, 24, () => this.onMonthChange(false)),
            m(".b.mlr-s", {
                style: {
                    fontSize: "14px",
                },
            }, formatMonthWithFullYear(date)),
            renderSwitchMonthArrowIcon(true, 24, () => this.onMonthChange(true)),
        ]);
    }
    onMonthChange(forward) {
        this.currentDate = incrementMonth(this.currentDate, forward ? 1 : -1);
    }
}
//# sourceMappingURL=DaySelectorSidebar.js.map