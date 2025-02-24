import m from "mithril";
import { stateBgFocus, stateBgHover } from "../../../common/gui/builtinThemes.js";
import { theme } from "../../../common/gui/theme.js";
import { styles } from "../../../common/gui/styles.js";
import { DefaultAnimationTime } from "../../../common/gui/animation/Animations.js";
import { px } from "../../../common/gui/size.js";
import { getDisplayEventTitle } from "../gui/CalendarGuiUtils.js";
export class CalendarAgendaItemView {
    isFocused = false;
    view({ attrs }) {
        const eventTitle = getDisplayEventTitle(attrs.event.summary);
        return m(".flex.items-center.click.plr.border-radius.pt-s.pb-s.rel.limit-width.full-width", {
            // Implement the background color via JavaScript on Desktop, so we can react to `attrs.selected`
            class: styles.isDesktopLayout() ? "hide-outline" : "state-bg",
            tabIndex: "0" /* TabIndex.Default */,
            onclick: attrs.click,
            onkeydown: (event) => attrs.keyDown(event),
            onfocus: () => (this.isFocused = true),
            onblur: () => (this.isFocused = false),
            style: {
                transition: `background ${DefaultAnimationTime}ms`,
                background: CalendarAgendaItemView.getBackground(attrs.selected ?? false, this.isFocused),
                height: attrs.height ? px(attrs.height) : undefined,
            },
        }, [
            m(".icon.circle.abs", {
                style: {
                    backgroundColor: `#${attrs.color}`,
                },
            }),
            m(".flex.col.min-width-0.pl-vpad-l", [m("p.b.m-0.text-ellipsis", eventTitle), m("", attrs.timeText)]),
        ]);
    }
    static getBackground(isSelected, isFocused) {
        if (styles.isDesktopLayout()) {
            if (isSelected) {
                return stateBgHover;
            }
            else {
                if (isFocused) {
                    return stateBgFocus;
                }
                else {
                    return theme.list_bg;
                }
            }
        }
        else {
            return undefined;
        }
    }
}
//# sourceMappingURL=CalendarAgendaItemView.js.map