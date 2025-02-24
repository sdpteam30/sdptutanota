import m from "mithril";
import { ToggleButton } from "../../gui/base/buttons/ToggleButton.js";
import { TextField } from "../../gui/base/TextField.js";
import { CompletenessIndicator } from "../../gui/CompletenessIndicator.js";
import { isSecurePassword, scaleToVisualPasswordStrength } from "./PasswordUtils.js";
import { StatusField } from "../../gui/base/StatusField.js";
export class PasswordField {
    isPasswordRevealed = false;
    view(vnode) {
        const attrs = vnode.attrs;
        // Separate and pass the generic `TextFieldAttrs` attributes so the user can still use all of `TextFields` properties
        const { passwordStrength, status, label, ...textFieldAttrs } = attrs;
        return m(TextField, {
            ...textFieldAttrs,
            label: label === undefined ? "password_label" : label,
            autocompleteAs: attrs.autocompleteAs ? attrs.autocompleteAs : "current-password" /* Autocomplete.currentPassword */,
            type: this.isPasswordRevealed ? "text" /* TextFieldType.Text */ : "password" /* TextFieldType.Password */,
            helpLabel: () => PasswordField.renderHelpLabel(textFieldAttrs.value, passwordStrength, status, textFieldAttrs.helpLabel ?? null),
            injectionsRight: () => {
                return [
                    PasswordField.renderRevealIcon(this.isPasswordRevealed, (newValue) => (this.isPasswordRevealed = newValue)),
                    textFieldAttrs.injectionsRight ? textFieldAttrs.injectionsRight() : null,
                ];
            },
        });
    }
    static renderRevealIcon(isPasswordRevealed, onRevealToggled) {
        return m(ToggleButton, {
            title: isPasswordRevealed ? "concealPassword_action" : "revealPassword_action",
            toggled: isPasswordRevealed,
            onToggled: (value, e) => {
                onRevealToggled(value);
                e.stopPropagation();
            },
            icon: isPasswordRevealed ? "NoEye" /* Icons.NoEye */ : "Eye" /* Icons.Eye */,
            size: 1 /* ButtonSize.Compact */,
        });
    }
    static renderHelpLabel(value, strength, status, helpLabel) {
        const displayedStatus = PasswordField.parseStatusSetting(status, value, strength);
        return m(".mt-xs", [
            m(".flex.items-center", [
                strength != undefined
                    ? m(CompletenessIndicator, {
                        class: "mr-s",
                        percentageCompleted: scaleToVisualPasswordStrength(strength),
                    })
                    : null,
                displayedStatus ? m(StatusField, { status: displayedStatus }) : null,
            ]),
            helpLabel ? helpLabel() : null,
        ]);
    }
    static parseStatusSetting(status, password, strength) {
        if (status === "auto" && strength != undefined) {
            return PasswordField.getPasswordStatus(password, strength);
        }
        else if (status && typeof status !== "string") {
            return status;
        }
        else {
            return null;
        }
    }
    static getPasswordStatus(password, strength) {
        if (password === "") {
            return {
                type: "neutral",
                text: "password1Neutral_msg",
            };
        }
        else if (isSecurePassword(strength)) {
            return {
                type: "valid",
                text: "passwordValid_msg",
            };
        }
        else {
            return {
                type: "invalid",
                text: "password1InvalidUnsecure_msg",
            };
        }
    }
}
//# sourceMappingURL=PasswordField.js.map