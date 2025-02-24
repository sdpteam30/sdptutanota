import { locator } from "../../../common/api/main/CommonLocator.js";
import m from "mithril";
import { SelectableRowContainer } from "../../../common/gui/SelectableRowContainer.js";
import { getTimeZone } from "../../../common/calendar/date/CalendarUtils.js";
import { styles } from "../../../common/gui/styles.js";
import { DefaultAnimationTime } from "../../../common/gui/animation/Animations.js";
import { formatEventDuration, getClientOnlyColors, getDisplayEventTitle, getEventColor, getGroupColors } from "./CalendarGuiUtils.js";
export class CalendarRow {
    domElement;
    top;
    entity;
    colors;
    selectionSetter;
    calendarIndicatorDom;
    summaryDom;
    durationDom;
    constructor(domElement) {
        this.domElement = domElement;
        this.top = 0;
        this.entity = null;
        const clientOnlyColors = getClientOnlyColors(locator.logins.getUserController().userId, locator.deviceConfig.getClientOnlyCalendars());
        const groupColors = getGroupColors(locator.logins.getUserController().userSettingsGroupRoot);
        for (let [calendarId, color] of clientOnlyColors.entries()) {
            groupColors.set(calendarId, color);
        }
        this.colors = groupColors;
    }
    update(event, selected, isInMultiSelect) {
        this.entity = event;
        this.summaryDom.innerText = getDisplayEventTitle(event.summary);
        this.calendarIndicatorDom.style.backgroundColor = `#${getEventColor(event, this.colors)}`;
        this.durationDom.innerText = formatEventDuration(this.entity, getTimeZone(), false);
        this.selectionSetter(selected, isInMultiSelect);
    }
    /**
     * Only the structure is managed by mithril. We set all contents on our own (see update) in order to avoid the vdom overhead (not negligible on mobiles)
     */
    render() {
        return m(SelectableRowContainer, {
            onSelectedChangeRef: (changer) => {
                this.selectionSetter = changer;
            },
        }, m(".flex.items-center.gap-vpad.click.border-radius", {
            class: (styles.isDesktopLayout() ? "" : "state-bg") + "limit-width full-width",
            style: {
                transition: `background ${DefaultAnimationTime}ms`,
            },
        }, [
            m("", {
                style: {
                    minWidth: "16px",
                    minHeight: "16px",
                    borderRadius: "50%",
                },
                oncreate: (vnode) => {
                    this.calendarIndicatorDom = vnode.dom;
                },
            }),
            m(".flex.col", { class: "min-width-0" }, [
                m("p.b.m-0.badge-line-height", {
                    class: "text-ellipsis",
                    oncreate: (vnode) => {
                        this.summaryDom = vnode.dom;
                    },
                }),
                m(".smaller", {
                    oncreate: (vnode) => {
                        this.durationDom = vnode.dom;
                    },
                }),
            ]),
        ]));
    }
}
export class KindaCalendarRow {
    cr;
    domElement;
    entity = null;
    constructor(dom) {
        this.cr = new CalendarRow(dom);
        this.domElement = dom;
        m.render(dom, this.cr.render());
    }
    update(item, selected, isInMultiSelect) {
        this.entity = item;
        this.cr.update(item, selected, isInMultiSelect);
    }
    render() {
        return this.cr.render();
    }
}
//# sourceMappingURL=CalendarRow.js.map