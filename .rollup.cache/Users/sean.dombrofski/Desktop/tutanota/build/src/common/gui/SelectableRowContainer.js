import m from "mithril";
import { stateBgActive, stateBgHover } from "./builtinThemes.js";
import { theme } from "./theme.js";
import { styles } from "./styles.js";
import { px, size } from "./size.js";
import { DefaultAnimationTime } from "./animation/Animations.js";
import { currentNavigationType } from "../../RootView.js";
export class SelectableRowContainer {
    dom = null;
    selected = false;
    isInMultiselect = false;
    view({ attrs, children }) {
        return m(".flex.mb-xs.border-radius.pt-m.pb-m.pl.pr.ml-s", {
            style: {
                paddingTop: "14px",
                paddingBottom: "12px",
                // this is an adjustment to keep tha columns aligned, space between columns is too big otherwise.
                // this is an obscure place to put it and ideally should not be done here or should be passed down here.
                marginRight: styles.isSingleColumnLayout() ? px(size.hpad_small) : "0",
                transition: `background 200ms`,
            },
            oncreate: ({ dom }) => {
                this.dom = dom;
                this.updateDomBg();
                attrs.onSelectedChangeRef?.((selected, isInMultiselect) => {
                    this.selected = selected;
                    this.isInMultiselect = isInMultiselect;
                    this.updateDomBg();
                });
            },
            // Highlight the row when it is tabbed into
            onfocus: () => {
                if (SelectableRowContainer.isUsingKeyboard()) {
                    this.setBackground(stateBgActive);
                }
            },
            onblur: () => {
                if (SelectableRowContainer.isUsingKeyboard()) {
                    if (this.selected && !styles.isSingleColumnLayout()) {
                        this.setBackground(stateBgHover);
                    }
                    else {
                        this.setBackground(theme.list_bg);
                    }
                }
            },
            onpointerdown: () => this.setBackground(stateBgActive),
            onpointerup: this.updateDomBg,
            onpointercancel: this.updateDomBg,
            onpointerleave: this.updateDomBg,
        }, children);
    }
    setBackground(color) {
        if (this.dom)
            this.dom.style.backgroundColor = color;
    }
    static isUsingKeyboard() {
        return currentNavigationType === 0 /* PrimaryNavigationType.Keyboard */;
    }
    updateDomBg = () => {
        const isUsingKeyboard = SelectableRowContainer.isUsingKeyboard();
        // In the single column view, a row may be 'selected' by the URL still linking to a specific mail
        // So do not highlight in that case but in just multiselect mode and keyboard navigation
        const highlight = styles.isSingleColumnLayout() ? (this.isInMultiselect || isUsingKeyboard) && this.selected : this.selected;
        this.setBackground(highlight ? stateBgHover : theme.list_bg);
    };
}
export function setVisibility(dom, visible) {
    dom.style.display = visible ? "" : "none";
}
export function checkboxOpacity(dom, selected) {
    if (selected) {
        dom.classList.remove("list-checkbox");
    }
    else {
        dom.classList.add("list-checkbox");
    }
}
export function shouldAlwaysShowMultiselectCheckbox() {
    return !styles.isUsingBottomNavigation();
}
// delay by 2 frames roughly so that the browser has time to do heavy stuff with layout
export const selectableRowAnimParams = { duration: DefaultAnimationTime, easing: "ease-in-out", fill: "forwards", delay: 36 };
export const scaleXHide = "scaleX(0)";
export const scaleXShow = "scaleX(1)";
//# sourceMappingURL=SelectableRowContainer.js.map