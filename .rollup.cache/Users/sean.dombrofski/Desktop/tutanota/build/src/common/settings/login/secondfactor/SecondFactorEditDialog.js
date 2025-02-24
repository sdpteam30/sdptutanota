import { showProgressDialog } from "../../../gui/dialogs/ProgressDialog.js";
import { SecondFactorType } from "../../../api/common/TutanotaConstants.js";
import { DropDownSelector } from "../../../gui/base/DropDownSelector.js";
import { lang } from "../../../misc/LanguageViewModel.js";
import { TextField } from "../../../gui/base/TextField.js";
import { isApp } from "../../../api/common/Env.js";
import m from "mithril";
import { copyToClipboard } from "../../../misc/ClipboardUtils.js";
import { Dialog } from "../../../gui/base/Dialog.js";
import { Icon, IconSize, progressIcon } from "../../../gui/base/Icon.js";
import { theme } from "../../../gui/theme.js";
import { assertNotNull } from "@tutao/tutanota-utils";
import { locator } from "../../../api/main/CommonLocator.js";
import * as RecoverCodeDialog from "../RecoverCodeDialog.js";
import { ProgrammingError } from "../../../api/common/error/ProgrammingError.js";
import { IconButton } from "../../../gui/base/IconButton.js";
import { NameValidationStatus, SecondFactorEditModel, SecondFactorTypeToNameTextId } from "./SecondFactorEditModel.js";
import { UserError } from "../../../api/main/UserError.js";
import { LoginButton } from "../../../gui/base/buttons/LoginButton.js";
import { NotAuthorizedError } from "../../../api/common/error/RestError";
export class SecondFactorEditDialog {
    model;
    dialog;
    constructor(model) {
        this.model = model;
        this.dialog = Dialog.createActionDialog({
            title: "add_action",
            allowOkWithReturn: true,
            child: {
                view: () => this.render(),
            },
            okAction: () => showProgressDialog("pleaseWait_msg", this.okAction()),
            allowCancel: true,
            okActionTextId: "save_action",
            cancelAction: () => this.model.abort(),
            validator: () => this.model.validationMessage(),
        });
    }
    async okAction() {
        try {
            const user = await this.model.save();
            if (user != null)
                this.finalize(user);
        }
        catch (e) {
            if (e instanceof UserError) {
                // noinspection ES6MissingAwait
                Dialog.message(lang.makeTranslation("error_msg", e.message));
            }
            else if (e instanceof NotAuthorizedError) {
                this.dialog.close();
                Dialog.message("contactFormSubmitError_msg");
                return;
            }
            else {
                throw e;
            }
        }
    }
    finalize(user) {
        this.dialog.close();
        RecoverCodeDialog.showRecoverCodeDialogAfterPasswordVerificationAndInfoDialog(user);
    }
    static async loadAndShow(entityClient, lazyUser, token) {
        const dialog = await showProgressDialog("pleaseWait_msg", this.loadWebauthnClient(entityClient, lazyUser, token));
        dialog.dialog.show();
    }
    render() {
        const optionsItems = this.model.getFactorTypesOptions().map((o) => ({
            name: lang.get(SecondFactorTypeToNameTextId[o]),
            value: o,
        }));
        const typeDropdownAttrs = {
            label: "type_label",
            selectedValue: this.model.selectedType,
            selectionChangedHandler: (newValue) => this.model.onTypeSelected(newValue),
            items: optionsItems,
            dropdownWidth: 300,
        };
        const nameFieldAttrs = {
            label: "name_label",
            helpLabel: () => this.renderHelpLabel(),
            value: this.model.name,
            oninput: (value) => this.model.onNameChange(value),
        };
        return [m(DropDownSelector, typeDropdownAttrs), m(TextField, nameFieldAttrs), this.renderTypeSpecificFields()];
    }
    renderHelpLabel() {
        return this.model.nameValidationStatus === NameValidationStatus.Valid
            ? m("", lang.get("secondFactorNameInfo_msg"))
            : m(".b.content-accent-fg", lang.get("textTooLong_msg"));
    }
    renderTypeSpecificFields() {
        switch (this.model.selectedType) {
            case SecondFactorType.totp:
                return this.renderOtpFields();
            case SecondFactorType.webauthn:
                return this.renderU2FFields();
            default:
                throw new ProgrammingError(`Invalid 2fa type: ${this.model.selectedType}`);
        }
    }
    renderU2FFields() {
        return this.model.verificationStatus === "Initial" /* VerificationStatus.Initial */
            ? null
            : m("p.flex.items-center", [m(".mr-s", this.statusIcon()), m("", this.statusMessage())]);
    }
    renderOtpFields() {
        const copyButtonAttrs = {
            title: "copy_action",
            click: () => copyToClipboard(this.model.totpKeys.readableKey),
            icon: "Clipboard" /* Icons.Clipboard */,
            size: 1 /* ButtonSize.Compact */,
        };
        return m(".mb", [
            m(TextField, {
                label: "totpSecret_label",
                helpLabel: () => lang.get(isApp() ? "totpTransferSecretApp_msg" : "totpTransferSecret_msg"),
                value: this.model.totpKeys.readableKey,
                injectionsRight: () => m(IconButton, copyButtonAttrs),
                isReadOnly: true,
            }),
            isApp()
                ? m(".pt", m(LoginButton, {
                    label: "addOpenOTPApp_action",
                    onclick: () => this.openOtpLink(),
                }))
                : this.renderOtpQrCode(),
            m(TextField, {
                label: "totpCode_label",
                value: this.model.totpCode,
                helpLabel: () => this.statusMessage(),
                autocompleteAs: "one-time-code" /* Autocomplete.oneTimeCode */,
                oninput: (newValue) => this.model.onTotpValueChange(newValue),
            }),
        ]);
    }
    renderOtpQrCode() {
        const otpInfo = this.model.otpInfo.getSync();
        if (otpInfo) {
            const qrCodeSvg = assertNotNull(otpInfo.qrCodeSvg);
            // sanitized in the model
            return m(".flex-center.pt", m.trust(qrCodeSvg));
        }
        else {
            return null;
        }
    }
    async openOtpLink() {
        const { url } = await this.model.otpInfo.getAsync();
        const successful = await locator.systemFacade.openLink(url);
        if (!successful) {
            // noinspection ES6MissingAwait
            Dialog.message("noAppAvailable_msg");
        }
    }
    static async loadWebauthnClient(entityClient, lazyUser, token) {
        const totpKeys = await locator.loginFacade.generateTotpSecret();
        const user = await lazyUser.getAsync();
        const webauthnSupported = await locator.webAuthn.isSupported();
        const model = new SecondFactorEditModel(entityClient, user, locator.webAuthn, totpKeys, webauthnSupported, locator.loginFacade, location.hostname, locator.domainConfigProvider().getCurrentDomainConfig(), m.redraw, token);
        return new SecondFactorEditDialog(model);
    }
    statusIcon() {
        switch (this.model.verificationStatus) {
            case "Progress" /* VerificationStatus.Progress */:
                return progressIcon();
            case "Success" /* VerificationStatus.Success */:
                return m(Icon, {
                    icon: "Checkmark" /* Icons.Checkmark */,
                    size: IconSize.Medium,
                    style: {
                        fill: theme.content_accent,
                    },
                });
            case "Failed" /* VerificationStatus.Failed */:
                return m(Icon, {
                    icon: "Cancel" /* Icons.Cancel */,
                    size: IconSize.Medium,
                    style: {
                        fill: theme.content_accent,
                    },
                });
            default:
                return null;
        }
    }
    statusMessage() {
        if (this.model.selectedType === SecondFactorType.webauthn) {
            return this.model.verificationStatus === "Success" /* VerificationStatus.Success */ ? lang.get("registeredU2fDevice_msg") : lang.get("unrecognizedU2fDevice_msg");
        }
        else {
            if (this.model.verificationStatus === "Success" /* VerificationStatus.Success */) {
                return lang.get("totpCodeConfirmed_msg");
            }
            else if (this.model.verificationStatus === "Failed" /* VerificationStatus.Failed */) {
                return lang.get("totpCodeWrong_msg");
            }
            else {
                return lang.get("totpCodeEnter_msg");
            }
        }
    }
}
//# sourceMappingURL=SecondFactorEditDialog.js.map