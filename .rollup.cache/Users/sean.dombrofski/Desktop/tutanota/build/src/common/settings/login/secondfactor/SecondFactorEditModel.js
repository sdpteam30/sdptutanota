import { createSecondFactor, GroupInfoTypeRef } from "../../../api/entities/sys/TypeRefs.js";
import { validateWebauthnDisplayName } from "../../../misc/2fa/webauthn/WebauthnClient.js";
import { assertNotNull, LazyLoaded, neverNull } from "@tutao/tutanota-utils";
import { isApp } from "../../../api/common/Env.js";
import { SecondFactorType } from "../../../api/common/TutanotaConstants.js";
import { ProgrammingError } from "../../../api/common/error/ProgrammingError.js";
import { UserError } from "../../../api/main/UserError.js";
import { htmlSanitizer } from "../../../misc/HtmlSanitizer.js";
import QRCode from "qrcode-svg";
export const DEFAULT_U2F_NAME = "U2F";
export const DEFAULT_TOTP_NAME = "TOTP";
export var NameValidationStatus;
(function (NameValidationStatus) {
    NameValidationStatus[NameValidationStatus["Valid"] = 0] = "Valid";
    NameValidationStatus[NameValidationStatus["Invalid"] = 1] = "Invalid";
})(NameValidationStatus || (NameValidationStatus = {}));
export const SecondFactorTypeToNameTextId = Object.freeze({
    [SecondFactorType.totp]: "totpAuthenticator_label",
    [SecondFactorType.u2f]: "u2fSecurityKey_label",
    [SecondFactorType.webauthn]: "u2fSecurityKey_label",
});
export class SecondFactorEditModel {
    entityClient;
    user;
    webauthnClient;
    totpKeys;
    webauthnSupported;
    loginFacade;
    hostname;
    domainConfig;
    updateViewCallback;
    token;
    totpCode = "";
    selectedType;
    name = "";
    nameValidationStatus = NameValidationStatus.Valid;
    verificationStatus = "Initial" /* VerificationStatus.Initial */;
    otpInfo;
    u2fRegistrationData = null;
    constructor(entityClient, user, webauthnClient, totpKeys, webauthnSupported, loginFacade, hostname, domainConfig, updateViewCallback, token) {
        this.entityClient = entityClient;
        this.user = user;
        this.webauthnClient = webauthnClient;
        this.totpKeys = totpKeys;
        this.webauthnSupported = webauthnSupported;
        this.loginFacade = loginFacade;
        this.hostname = hostname;
        this.domainConfig = domainConfig;
        this.updateViewCallback = updateViewCallback;
        this.token = token;
        this.selectedType = webauthnSupported ? SecondFactorType.webauthn : SecondFactorType.totp;
        this.setDefaultNameIfNeeded();
        this.otpInfo = new LazyLoaded(async () => {
            const url = await this.getOtpAuthUrl(this.totpKeys.readableKey);
            const totpQRCodeSvg = isApp()
                ? null
                : htmlSanitizer.sanitizeSVG(new QRCode({
                    height: 150,
                    width: 150,
                    content: url,
                    padding: 2,
                    // We don't want <xml> around the content, we actually enforce <svg> namespace, and we want it to be parsed as such.
                    xmlDeclaration: false,
                }).svg()).html;
            return {
                qrCodeSvg: totpQRCodeSvg,
                url,
            };
        });
        this.otpInfo.getAsync().then(() => this.updateViewCallback());
    }
    /**
     * if the user cancels the second factor creation while it's already talking to webAuthn, we want to cancel that
     * process before closing the dialog.
     */
    abort() {
        // noinspection JSIgnoredPromiseFromCall
        this.webauthnClient.abortCurrentOperation();
    }
    /**
     * validation message for use in dialog validators
     */
    validationMessage() {
        return this.nameValidationStatus === NameValidationStatus.Valid ? null : "textTooLong_msg";
    }
    /**
     * get a list of supported second factor types
     */
    getFactorTypesOptions() {
        const options = [];
        options.push(SecondFactorType.totp);
        if (this.webauthnSupported) {
            options.push(SecondFactorType.webauthn);
        }
        return options;
    }
    /**
     * call when the selected second factor type changes
     */
    onTypeSelected(newValue) {
        this.selectedType = newValue;
        this.verificationStatus = newValue === SecondFactorType.webauthn ? "Initial" /* VerificationStatus.Initial */ : "Progress" /* VerificationStatus.Progress */;
        this.setDefaultNameIfNeeded();
        this.updateNameValidation();
        if (newValue !== SecondFactorType.webauthn) {
            // noinspection JSIgnoredPromiseFromCall
            this.webauthnClient.abortCurrentOperation();
        }
    }
    /**
     * call when the display name of the second factor instance changes
     */
    onNameChange(newValue) {
        this.name = newValue;
        this.updateNameValidation();
    }
    /**
     * call when the validation code for setting up TOTP changes
     */
    async onTotpValueChange(newValue) {
        this.totpCode = newValue;
        let cleanedValue = newValue.replace(/ /g, "");
        if (cleanedValue.length === 6) {
            const expectedCode = Number(cleanedValue);
            this.verificationStatus = await this.tryCodes(expectedCode, this.totpKeys.key);
        }
        else {
            this.verificationStatus = "Progress" /* VerificationStatus.Progress */;
        }
        this.updateViewCallback();
    }
    /**
     * re-validates the input and makes the server calls to actually create a second factor
     * returns the user that the second factor was created in case any follow-up operations
     * are needed
     */
    async save() {
        this.setDefaultNameIfNeeded();
        if (this.selectedType === SecondFactorType.webauthn) {
            // Prevent starting in parallel
            if (this.verificationStatus === "Progress" /* VerificationStatus.Progress */) {
                return null;
            }
            try {
                this.u2fRegistrationData = await this.webauthnClient.register(this.user._id, this.name);
                this.verificationStatus = "Success" /* VerificationStatus.Success */;
            }
            catch (e) {
                console.log("Webauthn registration failed: ", e);
                this.u2fRegistrationData = null;
                this.verificationStatus = "Failed" /* VerificationStatus.Failed */;
                return null;
            }
        }
        this.updateViewCallback();
        if (this.selectedType === SecondFactorType.u2f) {
            throw new ProgrammingError(`invalid factor type: ${this.selectedType}`);
        }
        const sf = createSecondFactor({
            _ownerGroup: this.user._ownerGroup,
            name: this.name,
            type: this.selectedType,
            otpSecret: null,
            u2f: null,
        });
        if (this.selectedType === SecondFactorType.webauthn) {
            if (this.verificationStatus !== "Success" /* VerificationStatus.Success */) {
                throw new UserError("unrecognizedU2fDevice_msg");
            }
            else {
                sf.u2f = this.u2fRegistrationData;
            }
        }
        else if (this.selectedType === SecondFactorType.totp) {
            if (this.verificationStatus === "Failed" /* VerificationStatus.Failed */) {
                throw new UserError("totpCodeWrong_msg");
            }
            else if (this.verificationStatus === "Initial" /* VerificationStatus.Initial */ || this.verificationStatus === "Progress" /* VerificationStatus.Progress */) {
                throw new UserError("totpCodeEnter_msg");
            }
            else {
                sf.otpSecret = this.totpKeys.key;
            }
        }
        await this.entityClient.setup(assertNotNull(this.user.auth).secondFactors, sf, this.token ? { token: this.token } : undefined);
        return this.user;
    }
    /** see https://github.com/google/google-authenticator/wiki/Key-Uri-Format */
    async getOtpAuthUrl(secret) {
        const userGroupInfo = await this.entityClient.load(GroupInfoTypeRef, this.user.userGroup.groupInfo);
        const issuer = this.domainConfig.firstPartyDomain ? "Tutanota" : this.hostname;
        const account = encodeURI(issuer + ":" + neverNull(userGroupInfo.mailAddress));
        const url = new URL("otpauth://totp/" + account);
        url.searchParams.set("issuer", issuer);
        url.searchParams.set("secret", secret.replace(/ /g, ""));
        url.searchParams.set("algorithm", "SHA1");
        url.searchParams.set("digits", "6");
        url.searchParams.set("period", "30");
        return url.toString();
    }
    /**
     * re-check if the given display name is valid for the current second factor type
     */
    updateNameValidation() {
        this.nameValidationStatus =
            this.selectedType !== SecondFactorType.webauthn || validateWebauthnDisplayName(this.name)
                ? NameValidationStatus.Valid
                : NameValidationStatus.Invalid;
    }
    /**
     * empty names sometimes lead to errors, so we make sure we have something semi-sensible set in the field.
     */
    setDefaultNameIfNeeded() {
        const trimmed = this.name.trim();
        if (this.selectedType === SecondFactorType.webauthn && (trimmed === DEFAULT_TOTP_NAME || trimmed.length === 0)) {
            this.name = DEFAULT_U2F_NAME;
        }
        else if (this.selectedType === SecondFactorType.totp && (trimmed === DEFAULT_U2F_NAME || trimmed.length === 0)) {
            this.name = DEFAULT_TOTP_NAME;
        }
    }
    /**
     * check if the given validation code is the current, next or last code for the TOTP
     */
    async tryCodes(expectedCode, key) {
        const time = Math.floor(new Date().getTime() / 1000 / 30);
        // We try out 3 codes: current minute, 30 seconds before and 30 seconds after.
        // If at least one of them works, we accept it.
        const number = await this.loginFacade.generateTotpCode(time, key);
        if (number === expectedCode) {
            return "Success" /* VerificationStatus.Success */;
        }
        const number2 = await this.loginFacade.generateTotpCode(time - 1, key);
        if (number2 === expectedCode) {
            return "Success" /* VerificationStatus.Success */;
        }
        const number3 = await this.loginFacade.generateTotpCode(time + 1, key);
        if (number3 === expectedCode) {
            return "Success" /* VerificationStatus.Success */;
        }
        return "Failed" /* VerificationStatus.Failed */;
    }
}
//# sourceMappingURL=SecondFactorEditModel.js.map