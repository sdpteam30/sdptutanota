import { lang } from "../misc/LanguageViewModel.js";
import m from "mithril";
import { theme } from "./theme.js";
import { px, size } from "./size.js";
import { BaseButton } from "./base/buttons/BaseButton.js";
/**
 * Main button used to open the creation dialog for emails,contacts and events.
 */
export class MainCreateButton {
    view(vnode) {
        return m(BaseButton, {
            label: vnode.attrs.label,
            text: lang.get(vnode.attrs.label),
            onclick: vnode.attrs.click,
            class: `full-width border-radius-big center b flash ${vnode.attrs.class}`,
            style: {
                border: `2px solid ${theme.content_accent}`,
                // matching toolbar
                height: px(size.button_height + size.vpad_xs * 2),
                color: theme.content_accent,
            },
        });
    }
}
//# sourceMappingURL=MainCreateButton.js.map