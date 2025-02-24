import m from "mithril";
import { assertNotNull, getStartOfDay, incrementDate, isSameDayOfDate, isToday } from "@tutao/tutanota-utils";
import { DateTime } from "luxon";
import { Carousel } from "../../../../common/gui/base/Carousel.js";
import { changePeriodOnWheel, getCalendarMonth } from "../CalendarGuiUtils.js";
import { DefaultAnimationTime } from "../../../../common/gui/animation/Animations.js";
import { ExpanderPanel } from "../../../../common/gui/base/Expander.js";
import { theme } from "../../../../common/gui/theme.js";
import { px, size } from "../../../../common/gui/size.js";
import { styles } from "../../../../common/gui/styles.js";
import { hexToRGBAString } from "../../../../common/gui/base/Color.js";
/**
 *  Expandable Date picker used on single/two column layouts.
 * Displays the week, and if expanded displays the month.
 */
export class DaySelector {
    displayingDate;
    lastSelectedDate = null;
    handleDayPickerSwipe;
    constructor(vnode) {
        this.handleDayPickerSwipe = vnode.attrs.handleDayPickerSwipe;
        this.displayingDate = vnode.attrs.selectedDate || getStartOfDay(new Date());
    }
    view(vnode) {
        this.handleDayPickerSwipe = vnode.attrs.handleDayPickerSwipe;
        const selectedDate = vnode.attrs.selectedDate;
        if (selectedDate && !isSameDayOfDate(this.lastSelectedDate, selectedDate)) {
            this.lastSelectedDate = selectedDate;
            this.displayingDate = new Date(selectedDate);
            this.displayingDate.setDate(1);
        }
        let { weeks, weekdays } = getCalendarMonth(this.displayingDate, vnode.attrs.startOfTheWeekOffset, vnode.attrs.useNarrowWeekName);
        return m(".flex.flex-column", {
            onwheel: changePeriodOnWheel(this.handleDayPickerSwipe),
        }, [m(".flex-space-around", this.renderWeekDays(vnode.attrs.wide, weekdays)), this.renderDayPickerCarousel(vnode)]);
    }
    renderDayPickerCarousel(vnode) {
        const isExpanded = vnode.attrs.isDaySelectorExpanded ?? true;
        const date = vnode.attrs.selectedDate ?? new Date();
        // We need current/last/next month for the expanded date picker
        const currentMonth = getCalendarMonth(date, vnode.attrs.startOfTheWeekOffset, true);
        const lastMonth = getCalendarMonthShiftedBy(currentMonth, vnode.attrs.startOfTheWeekOffset, -1);
        const nextMonth = getCalendarMonthShiftedBy(currentMonth, vnode.attrs.startOfTheWeekOffset, 1);
        // We need current/last/next week for the collapsed date picker.
        // The week that we want to get depends on the month layout, so we are looking for it in the already computed months.
        const currentWeek = assertNotNull(findWeek(currentMonth, date));
        const beginningOfLastWeek = incrementDate(new Date(date), -7);
        // The week that we are looking for can be in both current month or the last/next one
        const lastWeek = beginningOfLastWeek < currentMonth.beginningOfMonth ? findWeek(lastMonth, beginningOfLastWeek) : findWeek(currentMonth, beginningOfLastWeek);
        const beginningOfNextWeek = incrementDate(new Date(date), 7);
        const nextWeek = beginningOfNextWeek < nextMonth.beginningOfMonth ? findWeek(currentMonth, beginningOfNextWeek) : findWeek(nextMonth, beginningOfNextWeek);
        return m(Carousel, {
            label: "date_label",
            class: "center-horizontally",
            style: {
                fontSize: px(14),
                lineHeight: px(this.getElementSize(vnode.attrs)),
            },
            slides: [
                {
                    label: isExpanded ? "prevMonth_label" : "prevWeek_label",
                    element: this.renderCarouselPage(isExpanded, vnode.attrs, lastWeek, lastMonth, true),
                },
                {
                    label: isExpanded ? "month_label" : "week_label",
                    element: this.renderCarouselPage(isExpanded, vnode.attrs, currentWeek, currentMonth, false),
                },
                {
                    label: isExpanded ? "nextMonth_label" : "nextWeek_label",
                    element: this.renderCarouselPage(isExpanded, vnode.attrs, nextWeek, nextMonth, true),
                },
            ],
            onSwipe: (isNext) => this.handleDayPickerSwipe?.(isNext),
        });
    }
    renderCarouselPage(isExpanded, attrs, week, month, hidden) {
        return [
            m("", {
                "aria-hidden": `${isExpanded}`,
                style: {
                    display: isExpanded ? "none" : "block",
                    height: isExpanded ? 0 : undefined,
                    opacity: isExpanded ? 0 : 1,
                    overflow: "clip",
                    transition: `opacity ${1.5 * DefaultAnimationTime}ms ease-in-out`,
                },
            }, this.renderExpandableWeek(week, attrs, false, attrs.isDaySelectorExpanded || hidden)),
            m(ExpanderPanel, {
                expanded: isExpanded,
            }, this.renderExpandedMonth(month, attrs, hidden)),
        ];
    }
    renderExpandedMonth(calendarMonth, attrs, hidden) {
        const { weeks } = calendarMonth;
        let weekToHighlight = -1;
        if (attrs.highlightSelectedWeek) {
            weekToHighlight = weeks.findIndex((week) => week.find((day) => day.date.getTime() === attrs.selectedDate?.getTime()));
        }
        return weeks.map((w, index) => this.renderExpandableWeek(w, attrs, weekToHighlight === index, attrs.isDaySelectorExpanded && hidden));
    }
    renderDay({ date, day, isPaddingDay }, attrs, hidden) {
        const isSelectedDay = isSameDayOfDate(date, attrs.selectedDate);
        let circleClass = "";
        let textClass = "";
        if (isSelectedDay && attrs.showDaySelection) {
            circleClass = "calendar-selected-day-circle";
            textClass = "calendar-selected-day-text";
        }
        else if (isToday(date) && attrs.highlightToday) {
            circleClass = "calendar-current-day-circle";
            textClass = "calendar-current-day-text";
        }
        const size = this.getElementSize(attrs);
        return m("button.rel.click.flex.items-center.justify-center.rel" + (isPaddingDay && attrs.isDaySelectorExpanded ? ".faded-day" : ""), {
            class: "flex-grow-shrink-0",
            "aria-hidden": `${isPaddingDay && attrs.isDaySelectorExpanded}`,
            "aria-label": date.toLocaleDateString(),
            "aria-selected": `${isSelectedDay}`,
            role: "option",
            tabIndex: hidden ? -1 : 0,
            onclick: () => attrs.onDateSelected?.(date, true),
        }, [
            m(".abs.z1.circle", {
                class: circleClass,
                style: {
                    width: px(size * 0.625),
                    height: px(size * 0.625),
                },
            }),
            m(".full-width.height-100p.center.z2", {
                class: textClass,
                style: {
                    fontSize: px(attrs.wide ? 14 : 12),
                },
            }, day),
            attrs.hasEventOn(date) ? m(".day-events-indicator", { style: styles.isDesktopLayout() ? { width: "3px", height: "3px" } : {} }) : null,
        ]);
    }
    getElementSize(attrs) {
        return attrs.wide ? 40 : 30;
    }
    renderExpandableWeek(week, attrs, highlight, hidden) {
        let style;
        if (highlight) {
            style = {
                backgroundColor: hexToRGBAString(theme.content_accent, 0.2),
                height: px(styles.isDesktopLayout() ? 19 : 25),
                borderRadius: px(styles.isDesktopLayout() ? 6 : 25),
                width: `calc(100% - ${px(size.hpad_small)})`,
            };
        }
        else {
            style = {};
        }
        return m(".flex-space-around.rel.items-center", [
            m(".abs", {
                style,
            }),
            ...week.map((d) => this.renderDay(d, attrs, hidden)),
        ]);
    }
    renderWeekDays(wide, weekdays) {
        const size = px(wide ? 40 : 24);
        const fontSize = px(14);
        return weekdays.map((wd) => m(".center", {
            "aria-hidden": "true",
            style: {
                fontSize,
                fontWeight: "bold",
                height: "20px",
                width: size,
                lineHeight: "20px",
            },
        }, wd));
    }
}
function findWeek(currentMonth, date) {
    return assertNotNull(currentMonth.weeks.find((w) => w.some((calendarDay) => date.getTime() === calendarDay.date.getTime())));
}
function getCalendarMonthShiftedBy(currentMonth, firstDayOfWeekFromOffset, plusMonths) {
    const date = DateTime.fromJSDate(currentMonth.beginningOfMonth).plus({ month: plusMonths }).toJSDate();
    return getCalendarMonth(date, firstDayOfWeekFromOffset, true);
}
//# sourceMappingURL=DaySelector.js.map