import m from "mithril";
import { BaseButton } from "../../../common/gui/base/buttons/BaseButton.js";
import { Icon, IconSize } from "../../../common/gui/base/Icon.js";
import { theme } from "../../../common/gui/theme.js";
/**
 * Button that has a current day number displayed in it.
 */
export class TodayIconButton {
    view({ attrs }) {
        return m(BaseButton, {
            label: "today_label",
            onclick: attrs.click,
            icon: m(Icon, {
                container: "div",
                class: "center-h svg-text-content-bg",
                size: IconSize.Medium,
                svgParameters: { date: new Date().getDate().toString() },
                icon: "Today" /* Icons.Today */,
                style: {
                    fill: theme.content_button,
                },
            }),
            class: "icon-button state-bg",
        });
    }
}
//# sourceMappingURL=TodayIconButton.js.map