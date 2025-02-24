import m from "mithril";
import { lang } from "../../misc/LanguageViewModel";
import { getElevatedBackground, theme } from "../theme";
import { noOp } from "@tutao/tutanota-utils";
import { assertMainOrNode } from "../../api/common/Env";
import { BaseButton } from "./buttons/BaseButton.js";
assertMainOrNode();
export function getColors(buttonColors) {
    switch (buttonColors) {
        case "nav" /* ButtonColor.Nav */:
            return {
                button: theme.navigation_button,
                border: theme.navigation_bg,
            };
        case "drawernav" /* ButtonColor.DrawerNav */:
            return {
                button: theme.content_button,
                border: getElevatedBackground(),
            };
        case "elevated" /* ButtonColor.Elevated */:
            return {
                button: theme.content_button,
                border: getElevatedBackground(),
            };
        case "fab" /* ButtonColor.Fab */:
            return {
                button: theme.content_button_icon_selected,
                border: getElevatedBackground(),
            };
        case "content" /* ButtonColor.Content */:
        default:
            return {
                button: theme.content_button,
                border: theme.content_bg,
            };
    }
}
/**
 * A button.
 */
export class Button {
    view({ attrs }) {
        let classes = this.resolveClasses(attrs.type);
        return m(BaseButton, {
            label: attrs.title == null ? attrs.label : attrs.title,
            text: lang.getTranslationText(attrs.label),
            class: classes.join(" "),
            style: {
                borderColor: getColors(attrs.colors).border,
            },
            onclick: attrs.click ?? noOp,
        });
    }
    resolveClasses(type) {
        let classes = [
            "limit-width",
            "noselect",
            "bg-transparent",
            "button-height",
            "text-ellipsis",
            "content-accent-fg",
            "flex",
            "items-center",
            "justify-center",
            "flash",
        ];
        if (type === "primary" /* ButtonType.Primary */) {
            classes.push("b");
        }
        else {
            classes.push("plr-button", "button-content");
        }
        return classes;
    }
}
//# sourceMappingURL=Button.js.map