import m from "mithril";
import { px } from "../../size.js";
import { BaseButton } from "./BaseButton.js";
import { Icon, IconSize } from "../Icon.js";
import { theme } from "../../theme.js";
export default function renderSwitchMonthArrowIcon(forward, size, onClick) {
    return m(BaseButton, {
        label: forward ? "nextMonth_label" : "prevMonth_label",
        icon: m(Icon, {
            icon: forward ? "ArrowForward" /* Icons.ArrowForward */ : "Back" /* BootIcons.Back */,
            container: "div",
            class: "center-h",
            size: IconSize.Normal,
            style: {
                fill: theme.content_fg,
            },
        }),
        style: {
            width: px(size),
            height: px(size),
        },
        class: "state-bg circle",
        onclick: onClick,
    });
}
//# sourceMappingURL=ArrowButton.js.map