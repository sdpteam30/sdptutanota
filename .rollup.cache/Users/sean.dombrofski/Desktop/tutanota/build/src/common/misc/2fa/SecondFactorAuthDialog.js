import { SecondFactorType } from "../../api/common/TutanotaConstants.js";
import { assertNotNull, getFirstOrThrow } from "@tutao/tutanota-utils";
import { createSecondFactorAuthData } from "../../api/entities/sys/TypeRefs.js";
import { AccessBlockedError, BadRequestError, LockedError, NotAuthenticatedError } from "../../api/common/error/RestError.js";
import { Dialog } from "../../gui/base/Dialog.js";
import m from "mithril";
import { SecondFactorAuthView } from "./SecondFactorAuthView.js";
import { CancelledError } from "../../api/common/error/CancelledError.js";
import { WebauthnError } from "../../api/common/error/WebauthnError.js";
import { appIdToLoginUrl } from "./SecondFactorUtils.js";
/**
 * Dialog which allows user to use second factor authentication and allows to reset second factor.
 * It will show that the login can be approved form another session and depending on what is supported it
 * might display one or more of:
 *  - WebAuthentication
 *  - TOTP
 *  - login from another domain message
 *  - lost access button
 * */
export class SecondFactorAuthDialog {
    webauthnClient;
    loginFacade;
    domainConfigProvider;
    authData;
    onClose;
    waitingForSecondFactorDialog = null;
    webauthnState = { state: "init" };
    otpState = { code: "", inProgress: false };
    /** @private */
    constructor(webauthnClient, loginFacade, domainConfigProvider, authData, onClose) {
        this.webauthnClient = webauthnClient;
        this.loginFacade = loginFacade;
        this.domainConfigProvider = domainConfigProvider;
        this.authData = authData;
        this.onClose = onClose;
    }
    /**
     * @param onClose will be called when the dialog is closed (one way or another).
     */
    static show(webauthnClient, loginFacade, domainConfigProvider, authData, onClose) {
        const dialog = new SecondFactorAuthDialog(webauthnClient, loginFacade, domainConfigProvider, authData, onClose);
        dialog.show();
        return dialog;
    }
    close() {
        if (this.waitingForSecondFactorDialog?.visible) {
            this.waitingForSecondFactorDialog?.close();
        }
        this.webauthnClient.abortCurrentOperation();
        this.waitingForSecondFactorDialog = null;
        this.onClose();
    }
    async show() {
        const u2fChallenge = this.authData.challenges.find((challenge) => challenge.type === SecondFactorType.u2f || challenge.type === SecondFactorType.webauthn);
        const otpChallenge = this.authData.challenges.find((challenge) => challenge.type === SecondFactorType.totp);
        const u2fSupported = await this.webauthnClient.isSupported();
        console.log("webauthn supported: ", u2fSupported);
        let canLoginWithU2f;
        let otherDomainLoginUrl;
        if (u2fChallenge?.u2f != null && u2fSupported) {
            const { canAttempt, cannotAttempt } = await this.webauthnClient.canAttemptChallenge(u2fChallenge.u2f);
            canLoginWithU2f = canAttempt.length !== 0;
            // If we don't have any key we can use to log in we need to show a message to attempt the login on another domain.
            if (cannotAttempt.length > 0) {
                const loginUrlString = appIdToLoginUrl(getFirstOrThrow(cannotAttempt).appId, this.domainConfigProvider);
                const loginUrl = new URL(loginUrlString);
                loginUrl.searchParams.set("noAutoLogin", "true");
                otherDomainLoginUrl = loginUrl.toString();
            }
            else {
                otherDomainLoginUrl = null;
            }
        }
        else {
            canLoginWithU2f = false;
            otherDomainLoginUrl = null;
        }
        const { mailAddress } = this.authData;
        this.waitingForSecondFactorDialog = Dialog.showActionDialog({
            title: "emptyString_msg",
            allowOkWithReturn: true,
            child: {
                view: () => {
                    return m(SecondFactorAuthView, {
                        webauthn: canLoginWithU2f
                            ? {
                                canLogin: true,
                                state: this.webauthnState,
                                doWebauthn: () => this.doWebauthn(assertNotNull(u2fChallenge)),
                            }
                            : otherDomainLoginUrl
                                ? {
                                    canLogin: false,
                                    otherDomainLoginUrl: otherDomainLoginUrl,
                                }
                                : null,
                        otp: otpChallenge
                            ? {
                                codeFieldValue: this.otpState.code,
                                inProgress: this.otpState.inProgress,
                                onValueChanged: (newValue) => (this.otpState.code = newValue),
                            }
                            : null,
                        onRecover: mailAddress ? () => this.recoverLogin(mailAddress) : null,
                    });
                },
            },
            okAction: otpChallenge ? () => this.onConfirmOtp() : null,
            cancelAction: () => this.cancel(),
        });
    }
    async onConfirmOtp() {
        this.otpState.inProgress = true;
        const authData = createSecondFactorAuthData({
            type: SecondFactorType.totp,
            session: this.authData.sessionId,
            otpCode: this.otpState.code.replace(/ /g, ""),
            u2f: null,
            webauthn: null,
        });
        try {
            await this.loginFacade.authenticateWithSecondFactor(authData);
            this.waitingForSecondFactorDialog?.close();
        }
        catch (e) {
            if (e instanceof NotAuthenticatedError) {
                Dialog.message("loginFailed_msg");
            }
            else if (e instanceof BadRequestError) {
                Dialog.message("loginFailed_msg");
            }
            else if (e in AccessBlockedError) {
                Dialog.message("loginFailedOften_msg");
                this.close();
            }
            else {
                throw e;
            }
        }
        finally {
            this.otpState.inProgress = false;
        }
    }
    async cancel() {
        this.webauthnClient.abortCurrentOperation();
        await this.loginFacade.cancelCreateSession(this.authData.sessionId);
        this.close();
    }
    async doWebauthn(u2fChallenge) {
        this.webauthnState = {
            state: "progress",
        };
        const sessionId = this.authData.sessionId;
        const challenge = assertNotNull(u2fChallenge.u2f);
        try {
            const { responseData, apiBaseUrl } = await this.webauthnClient.authenticate(challenge);
            const authData = createSecondFactorAuthData({
                type: SecondFactorType.webauthn,
                session: sessionId,
                webauthn: responseData,
                u2f: null,
                otpCode: null,
            });
            await this.loginFacade.authenticateWithSecondFactor(authData, apiBaseUrl);
        }
        catch (e) {
            if (e instanceof CancelledError) {
                this.webauthnState = {
                    state: "init",
                };
            }
            else if (e instanceof AccessBlockedError && this.waitingForSecondFactorDialog?.visible) {
                Dialog.message("loginFailedOften_msg");
                this.close();
            }
            else if (e instanceof WebauthnError) {
                console.log("Error during webAuthn: ", e);
                this.webauthnState = {
                    state: "error",
                    error: "couldNotAuthU2f_msg",
                };
            }
            else if (e instanceof LockedError) {
                this.webauthnState = {
                    state: "init",
                };
                Dialog.message("serviceUnavailable_msg");
            }
            else if (e instanceof NotAuthenticatedError) {
                this.webauthnState = {
                    state: "init",
                };
                Dialog.message("loginFailed_msg");
            }
            else {
                throw e;
            }
        }
        finally {
            m.redraw();
        }
    }
    async recoverLogin(mailAddress) {
        this.cancel();
        const dialog = await import("../../login/recover/RecoverLoginDialog");
        dialog.show(mailAddress, "secondFactor");
    }
}
//# sourceMappingURL=SecondFactorAuthDialog.js.map