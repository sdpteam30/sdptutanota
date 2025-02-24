import m from "mithril";
import { getPasswordStrength, isSecurePassword } from "../misc/passwords/PasswordUtils.js";
import { lang } from "../misc/LanguageViewModel.js";
import { assertMainOrNode } from "../api/common/Env.js";
import { getEnabledMailAddressesForGroupInfo } from "../api/common/utils/GroupUtils.js";
import { showPasswordGeneratorDialog } from "../misc/passwords/PasswordGeneratorDialog.js";
import { theme } from "../gui/theme.js";
import { px, size } from "../gui/size.js";
import { PasswordField } from "../misc/passwords/PasswordField.js";
assertMainOrNode();
export class PasswordModel {
    usageTestController;
    logins;
    config;
    newPassword = "";
    oldPassword = "";
    repeatedPassword = "";
    passwordStrength;
    __mailValid;
    __signupFreeTest;
    __signupPaidTest;
    constructor(usageTestController, logins, config, mailValid) {
        this.usageTestController = usageTestController;
        this.logins = logins;
        this.config = config;
        this.passwordStrength = this.calculatePasswordStrength();
        this.__mailValid = mailValid;
        this.__signupFreeTest = this.usageTestController.getTest("signup.free");
        this.__signupPaidTest = this.usageTestController.getTest("signup.paid");
    }
    _checkBothValidAndSendPing() {
        if (this.getNewPasswordStatus().type === "valid" && this.getRepeatedPasswordStatus().type === "valid") {
            // Password entry (both passwords entered and valid)
            // Only the started test's (either free or paid clicked) stage is completed here
            this.__signupFreeTest?.getStage(3).complete();
            this.__signupPaidTest?.getStage(2).complete();
        }
    }
    getNewPassword() {
        return this.newPassword;
    }
    setNewPassword(newPassword) {
        if (this.__mailValid && this.__mailValid()) {
            // Email address selection finished (email address is available and clicked in password field)
            // Only the started test's (either free or paid clicked) stage is completed here
            this.__signupFreeTest?.getStage(2).complete();
            this.__signupPaidTest?.getStage(1).complete();
        }
        this.newPassword = newPassword;
        this.recalculatePasswordStrength();
    }
    /**
     * Might be needed when reserved strings change in the config
     */
    recalculatePasswordStrength() {
        this.passwordStrength = this.calculatePasswordStrength();
        this._checkBothValidAndSendPing();
    }
    getOldPassword() {
        return this.oldPassword;
    }
    setOldPassword(oldPassword) {
        this.oldPassword = oldPassword;
        this.passwordStrength = this.calculatePasswordStrength();
    }
    getRepeatedPassword() {
        return this.repeatedPassword;
    }
    setRepeatedPassword(repeatedPassword) {
        this.repeatedPassword = repeatedPassword;
        this.passwordStrength = this.calculatePasswordStrength();
        this._checkBothValidAndSendPing();
    }
    clear() {
        this.newPassword = "";
        this.oldPassword = "";
        this.repeatedPassword = "";
        this.passwordStrength = this.calculatePasswordStrength();
    }
    getErrorMessageId() {
        return (this.getErrorFromStatus(this.getOldPasswordStatus()) ??
            this.getErrorFromStatus(this.getNewPasswordStatus()) ??
            this.getErrorFromStatus(this.getRepeatedPasswordStatus()));
    }
    getOldPasswordStatus() {
        if (this.config.checkOldPassword && this.oldPassword === "") {
            return {
                type: "neutral",
                text: "oldPasswordNeutral_msg",
            };
        }
        else {
            return {
                type: "valid",
                text: "emptyString_msg",
            };
        }
    }
    getNewPasswordStatus() {
        if (this.newPassword === "") {
            return {
                type: "neutral",
                text: "password1Neutral_msg",
            };
        }
        else if (this.config.checkOldPassword && this.oldPassword === this.newPassword) {
            return {
                type: "invalid",
                text: "password1InvalidSame_msg",
            };
        }
        else if (this.isPasswordInsecure()) {
            if (this.config.enforceStrength) {
                return {
                    type: "invalid",
                    text: "password1InvalidUnsecure_msg",
                };
            }
            else {
                return {
                    type: "valid",
                    text: "password1InvalidUnsecure_msg",
                };
            }
        }
        else {
            return {
                type: "valid",
                text: "passwordValid_msg",
            };
        }
    }
    getRepeatedPasswordStatus() {
        if (this.config.hideConfirmation) {
            return {
                type: "valid",
                text: "passwordValid_msg",
            };
        }
        const repeatedPassword = this.repeatedPassword;
        const newPassword = this.newPassword;
        if (repeatedPassword === "") {
            return {
                type: "neutral",
                text: "password2Neutral_msg",
            };
        }
        else if (repeatedPassword !== newPassword) {
            return {
                type: "invalid",
                text: "password2Invalid_msg",
            };
        }
        else {
            return {
                type: "valid",
                text: "passwordValid_msg",
            };
        }
    }
    isPasswordInsecure() {
        return !isSecurePassword(this.getPasswordStrength());
    }
    getPasswordStrength() {
        return this.passwordStrength;
    }
    getErrorFromStatus(status) {
        if (!status)
            return null;
        return status.type !== "valid" ? status.text : null;
    }
    calculatePasswordStrength() {
        let reserved = this.config.reservedStrings ? this.config.reservedStrings() : [];
        if (this.logins.isUserLoggedIn()) {
            reserved = reserved
                .concat(getEnabledMailAddressesForGroupInfo(this.logins.getUserController().userGroupInfo))
                .concat(this.logins.getUserController().userGroupInfo.name);
        }
        // 80% strength is minimum. we expand it to 100%, so the password indicator if completely filled when the password is strong enough
        return getPasswordStrength(this.newPassword, reserved);
    }
}
/**
 * A form for entering a new password. Optionally it allows to enter the old password for validation and/or to repeat the new password.
 * showChangeOwnPasswordDialog() and showChangeUserPasswordAsAdminDialog() show this form as dialog.
 */
export class PasswordForm {
    view({ attrs }) {
        return m("", {
            onremove: () => attrs.model.clear(),
        }, [
            attrs.model.config.checkOldPassword
                ? m(PasswordField, {
                    label: "oldPassword_label",
                    value: attrs.model.getOldPassword(),
                    status: attrs.model.getOldPasswordStatus(),
                    oninput: (input) => attrs.model.setOldPassword(input),
                    autocompleteAs: "current-password" /* Autocomplete.currentPassword */,
                    fontSize: px(size.font_size_smaller),
                })
                : null,
            m(PasswordField, {
                label: "newPassword_label",
                value: attrs.model.getNewPassword(),
                passwordStrength: attrs.model.getPasswordStrength(),
                helpLabel: () => this.renderPasswordGeneratorHelp(attrs),
                status: attrs.model.getNewPasswordStatus(),
                oninput: (input) => attrs.model.setNewPassword(input),
                autocompleteAs: "new-password" /* Autocomplete.newPassword */,
                fontSize: px(size.font_size_smaller),
            }),
            attrs.model.config.hideConfirmation
                ? null
                : m(PasswordField, {
                    label: "repeatedPassword_label",
                    value: attrs.model.getRepeatedPassword(),
                    autocompleteAs: "new-password" /* Autocomplete.newPassword */,
                    status: attrs.model.getRepeatedPasswordStatus(),
                    oninput: (input) => attrs.model.setRepeatedPassword(input),
                    fontSize: px(size.font_size_smaller),
                }),
            attrs.passwordInfoKey ? m(".small.mt-s", lang.get(attrs.passwordInfoKey)) : null,
        ]);
    }
    renderPasswordGeneratorHelp(attrs) {
        return m("button.b.mr-xs.hover.click.darkest-hover.mt-xs", {
            style: { display: "inline-block", color: theme.navigation_button_selected },
            onclick: async () => {
                attrs.model.setNewPassword(await showPasswordGeneratorDialog());
                m.redraw();
            },
        }, lang.get("generatePassphrase_action"));
    }
}
//# sourceMappingURL=PasswordForm.js.map