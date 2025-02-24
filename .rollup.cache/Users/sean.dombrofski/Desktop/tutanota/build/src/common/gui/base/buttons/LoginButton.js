import m from "mithril";
import { BaseButton } from "./BaseButton.js";
import { lang } from "../../../misc/LanguageViewModel.js";
export class LoginButton {
    view({ attrs }) {
        let classes = this.resolveClasses(attrs);
        return m(BaseButton, {
            label: attrs.label,
            text: lang.getTranslationText(attrs.label),
            class: classes.join(" "),
            onclick: attrs.onclick,
            disabled: attrs.disabled,
        });
    }
    resolveClasses(attrs) {
        let classes = [
            "button-content",
            "border-radius",
            "center",
            // This makes the button appear "disabled" (grey color, no hover) when disabled is set to true
            attrs.disabled ? "button-bg" : `accent-bg`,
            "flash",
            attrs.class,
        ];
        if (attrs.type === "FlexWidth" /* LoginButtonType.FlexWidth */) {
            classes.push("plr-2l");
        }
        else {
            classes.push("full-width plr-button");
        }
        return classes;
    }
}
//# sourceMappingURL=LoginButton.js.map