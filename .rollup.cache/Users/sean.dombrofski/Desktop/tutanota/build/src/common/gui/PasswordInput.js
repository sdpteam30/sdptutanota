import m from "mithril";
import { SingleLineTextField } from "./base/SingleLineTextField.js";
import { IconButton } from "./base/IconButton.js";
import { theme } from "./theme.js";
import { scaleToVisualPasswordStrength } from "../misc/passwords/PasswordUtils.js";
import { px, size } from "./size.js";
import { lang } from "../misc/LanguageViewModel.js";
export class PasswordInput {
    showPassword = false;
    view(vnode) {
        return m(".flex.flex-grow.full-width.justify-between.items-center.gap-vpad-s", [
            vnode.attrs.showStrength
                ? m("div", {
                    style: {
                        width: px(size.icon_size_medium),
                        height: px(size.icon_size_medium),
                        border: `1px solid ${theme.content_button}`,
                        borderRadius: "50%",
                        background: `conic-gradient(from .25turn, ${theme.content_button} ${scaleToVisualPasswordStrength(vnode.attrs.strength)}%, transparent 0%)`,
                    },
                })
                : null,
            m(SingleLineTextField, {
                classes: ["flex-grow"],
                ariaLabel: vnode.attrs.ariaLabel,
                type: this.showPassword ? "text" /* TextFieldType.Text */ : "password" /* TextFieldType.Password */,
                value: vnode.attrs.password,
                oninput: vnode.attrs.oninput,
                style: {
                    padding: `${px(size.vpad_xsm)} ${px(size.vpad_small)}`,
                },
                placeholder: lang.get("password_label"),
            }),
            m(IconButton, {
                size: 1 /* ButtonSize.Compact */,
                title: this.showPassword ? "concealPassword_action" : "revealPassword_action",
                icon: this.showPassword ? "NoEye" /* Icons.NoEye */ : "Eye" /* Icons.Eye */,
                click: () => (this.showPassword = !this.showPassword),
            }),
        ]);
    }
}
//# sourceMappingURL=PasswordInput.js.map