import { modal } from "../../../../common/gui/base/Modal.js";
import m from "mithril";
import { Keys } from "../../../../common/api/common/TutanotaConstants.js";
import { DaySelector } from "./DaySelector.js";
import { animations, opacity, transform } from "../../../../common/gui/animation/Animations.js";
import { ease } from "../../../../common/gui/animation/Easing.js";
import { px } from "../../../../common/gui/size.js";
import { formatMonthWithFullYear } from "../../../../common/misc/Formatter.js";
import { incrementMonth } from "@tutao/tutanota-utils";
import { styles } from "../../../../common/gui/styles.js";
import renderSwitchMonthArrowIcon from "../../../../common/gui/base/buttons/ArrowButton.js";
export class DaySelectorPopup {
    rect;
    attrs;
    _shortcuts = [];
    dom = null;
    currentDate;
    focusedBeforeShown = null;
    /**
     * @param rect The rect with coordinates about where the popup should be rendered
     * @param attrs The attributes for the component
     */
    constructor(rect, attrs) {
        this.rect = rect;
        this.attrs = attrs;
        this.setupShortcuts();
        this.view = this.view.bind(this);
        this.currentDate = attrs.selectedDate;
    }
    view() {
        return m(".abs.elevated-bg.plr.pt-s.pb-m.border-radius.dropdown-shadow.flex.flex-column", {
            style: {
                opacity: "0",
                left: px(this.rect.left),
                top: px(this.rect.bottom),
            },
            tabIndex: 0,
            autoFocus: "true",
            oncreate: (vnode) => {
                this.dom = vnode.dom;
                animations.add(this.dom, [opacity(0, 1, true), transform("scale" /* TransformEnum.Scale */, 0.5, 1)], {
                    easing: ease.out,
                });
                // We need a little timeout to focus the modal, this will wait
                // the necessary time to the popup be visible on screen
                setTimeout(() => this.dom?.focus(), 200);
            },
        }, [
            this.renderPickerHeader(this.currentDate),
            m(".flex-grow.overflow-hidden", [
                m(DaySelector, {
                    selectedDate: this.currentDate,
                    onDateSelected: this.attrs.onDateSelected,
                    wide: true,
                    startOfTheWeekOffset: this.attrs.startOfTheWeekOffset,
                    isDaySelectorExpanded: true,
                    handleDayPickerSwipe: (isNext) => {
                        this.onMonthChange(isNext);
                        m.redraw();
                    },
                    showDaySelection: false,
                    highlightToday: this.attrs.highlightToday,
                    highlightSelectedWeek: this.attrs.highlightSelectedWeek,
                    useNarrowWeekName: styles.isSingleColumnLayout(),
                    hasEventOn: this.attrs.hasEventsOn,
                }),
            ]),
        ]);
    }
    renderPickerHeader(date) {
        return m(".flex.flex-space-between.pb-s.items-center", [
            m(".b", {
                style: {
                    fontSize: "14px",
                    marginLeft: "6px",
                },
            }, formatMonthWithFullYear(date)),
            m(".flex.items-center", [
                renderSwitchMonthArrowIcon(false, 24, () => this.onMonthChange(false)),
                renderSwitchMonthArrowIcon(true, 24, () => this.onMonthChange(true)),
            ]),
        ]);
    }
    onMonthChange(forward) {
        this.currentDate = incrementMonth(this.currentDate, forward ? 1 : -1);
    }
    // Sets the content div (.main-view) to inert, disabling the ability to be focused, this traps the
    // focus to the popup, releasing it just when the popup is closed and the inert property removed.
    turnTrapFocus(on) {
        const elementsQuery = document.getElementsByClassName("main-view");
        if (elementsQuery.length > 0) {
            const mainDiv = elementsQuery.item(0);
            if (on)
                mainDiv?.setAttribute("inert", "true");
            else
                mainDiv?.removeAttribute("inert");
        }
    }
    show() {
        this.focusedBeforeShown = document.activeElement;
        this.turnTrapFocus(true);
        modal.display(this, false);
    }
    close() {
        this.turnTrapFocus(false);
        modal.remove(this);
    }
    backgroundClick(e) {
        this.turnTrapFocus(false);
        modal.remove(this);
    }
    hideAnimation() {
        return Promise.resolve();
    }
    onClose() {
        this.close();
    }
    shortcuts() {
        return this._shortcuts;
    }
    popState(e) {
        this.turnTrapFocus(false);
        modal.remove(this);
        return false;
    }
    callingElement() {
        return this.focusedBeforeShown;
    }
    setupShortcuts() {
        const close = {
            key: Keys.ESC,
            exec: () => this.close(),
            help: "close_alt",
        };
        this._shortcuts.push(close);
    }
}
//# sourceMappingURL=DaySelectorPopup.js.map