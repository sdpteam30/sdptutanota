import m from "mithril";
import { Icon, IconSize } from "../Icon.js";
import { getColors } from "../Button.js";
import { BaseButton } from "./BaseButton.js";
export class ToggleButton {
    view({ attrs }) {
        return m(BaseButton, {
            label: attrs.title,
            icon: m(Icon, {
                icon: attrs.icon,
                container: "div",
                class: "center-h",
                size: IconSize.Medium,
                style: {
                    fill: getColors(attrs.colors ?? "content" /* ButtonColor.Content */).button,
                },
            }),
            class: `toggle-button state-bg ${attrs.size === 1 /* ButtonSize.Compact */ ? "compact" : ""}`,
            style: attrs.style,
            pressed: attrs.toggled,
            onclick: (e) => attrs.onToggled(!attrs.toggled, e),
        });
    }
}
//# sourceMappingURL=ToggleButton.js.map