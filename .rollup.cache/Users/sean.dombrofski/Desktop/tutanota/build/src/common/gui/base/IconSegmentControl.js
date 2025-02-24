import m from "mithril";
import { Icon, IconSize } from "./Icon.js";
import { lang } from "../../misc/LanguageViewModel.js";
import { getColors } from "./Button.js";
import { px } from "../size.js";
/**
 * Selector for a few options with one option selected.
 */
export class IconSegmentControl {
    view(vnode) {
        return [
            m(".icon-segment-control.flex.items-center", {
                role: "tablist",
            }, vnode.attrs.items.map((item) => {
                const title = lang.getTranslationText(item.label);
                return m("button.icon-segment-control-item.flex.center-horizontally.center-vertically.text-ellipsis.small.state-bg.pt-xs.pb-xs", {
                    active: item.value === vnode.attrs.selectedValue ? "true" : undefined,
                    title,
                    role: "tab",
                    "aria-label": title,
                    "aria-selected": String(item.value === vnode.attrs.selectedValue),
                    onclick: () => this.onSelected(item, vnode.attrs),
                    style: {
                        maxWidth: vnode.attrs.maxItemWidth ? px(vnode.attrs.maxItemWidth) : null,
                        // need to specify explicitly because setting "background" e.g. on hover resets it
                        // we need it because stateBgHover background has transparency and when it overlaps the border it looks wrong.
                        backgroundClip: "padding-box",
                    },
                }, m(Icon, {
                    icon: item.icon,
                    container: "div",
                    class: "center-h",
                    size: IconSize.Medium,
                    style: {
                        fill: getColors("content" /* ButtonColor.Content */).button,
                    },
                }));
            })),
        ];
    }
    onSelected(item, attrs) {
        if (item.value !== attrs.selectedValue) {
            attrs.onValueSelected(item.value);
        }
    }
}
//# sourceMappingURL=IconSegmentControl.js.map