import { lang } from "../../../misc/LanguageViewModel.js";
import m from "mithril";
import { px, size } from "../../size.js";
import { BaseButton } from "./BaseButton.js";
import { theme } from "../../theme.js";
export class BannerButton {
    view({ attrs }) {
        return m(BaseButton, {
            label: attrs.text,
            text: lang.getTranslationText(attrs.text),
            class: `border-radius mr-s center ${attrs.class} ${attrs.disabled ? "disabled" : ""}`,
            style: {
                border: `2px solid ${attrs.disabled ? theme.content_button : attrs.borderColor}`,
                color: attrs.disabled ? theme.content_button : attrs.color,
                padding: px(size.hpad_button),
                minWidth: "60px",
            },
            disabled: attrs.disabled,
            onclick: attrs.click,
            icon: attrs.icon,
        });
    }
}
//# sourceMappingURL=BannerButton.js.map