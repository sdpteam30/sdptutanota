import m from "mithril";
import { Icon, IconSize } from "./Icon";
import { assertMainOrNode } from "../../api/common/Env";
import { getColors } from "./Button.js";
import { BaseButton } from "./buttons/BaseButton.js";
assertMainOrNode();
export class IconButton {
    view({ attrs }) {
        return m(BaseButton, {
            label: attrs.title,
            icon: m(Icon, {
                icon: attrs.icon,
                container: "div",
                class: "center-h",
                size: attrs.size === 2 /* ButtonSize.Large */ ? IconSize.XL : IconSize.Medium,
                style: {
                    fill: getColors(attrs.colors ?? "content" /* ButtonColor.Content */).button,
                    visibility: attrs.disabled ? "hidden" : "visible",
                },
            }),
            onclick: attrs.click,
            onkeydown: attrs.onkeydown,
            class: `icon-button state-bg ${IconButton.getSizeClass(attrs.size)}`,
            disabled: attrs.disabled,
            style: {
                visibility: attrs.disabled ? "hidden" : "visible",
            },
        });
    }
    static getSizeClass(size) {
        switch (size) {
            case 1 /* ButtonSize.Compact */:
                return "compact";
            case 2 /* ButtonSize.Large */:
                return "large";
            case 0 /* ButtonSize.Normal */:
            default:
                return "";
        }
    }
}
//# sourceMappingURL=IconButton.js.map