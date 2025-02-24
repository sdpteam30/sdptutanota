import { AccessExpiredError, BadRequestError, NotAuthenticatedError } from "../api/common/error/RestError";
import { lang } from "../misc/LanguageViewModel.js";
import { getLoginErrorMessage, handleExpectedLoginError } from "../misc/LoginUtils.js";
import stream from "mithril/stream";
import { ProgrammingError } from "../api/common/error/ProgrammingError";
import { CredentialAuthenticationError } from "../api/common/error/CredentialAuthenticationError";
import { first, noOp } from "@tutao/tutanota-utils";
import { KeyPermanentlyInvalidatedError } from "../api/common/error/KeyPermanentlyInvalidatedError";
import { assertMainOrNode } from "../api/common/Env";
import { DeviceStorageUnavailableError } from "../api/common/error/DeviceStorageUnavailableError";
import { getWhitelabelRegistrationDomains } from "./LoginView.js";
import { CancelledError } from "../api/common/error/CancelledError.js";
import { credentialsToUnencrypted } from "../misc/credentials/Credentials.js";
import { isOfflineError } from "../api/common/utils/ErrorUtils.js";
assertMainOrNode();
export class LoginViewModel {
    loginController;
    credentialsProvider;
    secondFactorHandler;
    deviceConfig;
    domainConfig;
    credentialRemovalHandler;
    pushServiceApp;
    appLock;
    mailAddress;
    password;
    displayMode;
    state;
    helpText;
    savePassword;
    savedInternalCredentials;
    // visibleForTesting
    autoLoginCredentials;
    constructor(loginController, credentialsProvider, secondFactorHandler, deviceConfig, domainConfig, credentialRemovalHandler, pushServiceApp, appLock) {
        this.loginController = loginController;
        this.credentialsProvider = credentialsProvider;
        this.secondFactorHandler = secondFactorHandler;
        this.deviceConfig = deviceConfig;
        this.domainConfig = domainConfig;
        this.credentialRemovalHandler = credentialRemovalHandler;
        this.pushServiceApp = pushServiceApp;
        this.appLock = appLock;
        this.state = "NotAuthenticated" /* LoginState.NotAuthenticated */;
        this.displayMode = "form" /* DisplayMode.Form */;
        this.helpText = "emptyString_msg";
        this.mailAddress = stream("");
        this.password = stream("");
        this.autoLoginCredentials = null;
        this.savePassword = stream(false);
        this.savedInternalCredentials = [];
    }
    /**
     * This method should be called right after creation of the view model by whoever created the viewmodel. The view model will not be
     * fully functional before this method has been called!
     * @returns {Promise<void>}
     */
    async init() {
        await this.updateCachedCredentials();
    }
    async useUserId(userId) {
        this.autoLoginCredentials = await this.credentialsProvider.getCredentialsInfoByUserId(userId);
        if (this.autoLoginCredentials) {
            this.displayMode = "credentials" /* DisplayMode.Credentials */;
        }
        else {
            this.displayMode = "form" /* DisplayMode.Form */;
        }
    }
    canLogin() {
        if (this.displayMode === "credentials" /* DisplayMode.Credentials */) {
            return this.autoLoginCredentials != null || this.savedInternalCredentials.length === 1;
        }
        else if (this.displayMode === "form" /* DisplayMode.Form */) {
            return Boolean(this.mailAddress() && this.password());
        }
        else {
            return false;
        }
    }
    async useCredentials(encryptedCredentials) {
        const credentialsInfo = await this.credentialsProvider.getCredentialsInfoByUserId(encryptedCredentials.userId);
        if (credentialsInfo) {
            this.autoLoginCredentials = credentialsInfo;
            this.displayMode = "credentials" /* DisplayMode.Credentials */;
        }
    }
    async login() {
        if (this.state === "LoggingIn" /* LoginState.LoggingIn */)
            return;
        this.state = "LoggingIn" /* LoginState.LoggingIn */;
        if (this.displayMode === "credentials" /* DisplayMode.Credentials */ || this.displayMode === "deleteCredentials" /* DisplayMode.DeleteCredentials */) {
            await this.autologin();
        }
        else if (this.displayMode === "form" /* DisplayMode.Form */) {
            await this.formLogin();
        }
        else {
            throw new ProgrammingError(`Cannot login with current display mode: ${this.displayMode}`);
        }
    }
    async deleteCredentials(credentialsInfo) {
        let credentials;
        try {
            /**
             * We have to decrypt the credentials here (and hence deal with any potential errors), because :LoginController.deleteOldSession
             * expects the full credentials. The reason for this is that the accessToken contained within credentials has a double function:
             * 1. It is used as an actual access token to re-authenticate
             * 2. It is used as a session ID
             * Since we want to also delete the session from the server, we need the (decrypted) accessToken in its function as a session id.
             */
            credentials = await this.unlockAppAndGetCredentials(credentialsInfo.userId);
        }
        catch (e) {
            if (e instanceof KeyPermanentlyInvalidatedError) {
                await this.credentialsProvider.clearCredentials(e);
                await this.updateCachedCredentials();
                this.state = "NotAuthenticated" /* LoginState.NotAuthenticated */;
                return null;
            }
            else if (e instanceof CancelledError) {
                // ignore, happens if we have app pin activated and the user
                // cancels the prompt or provides a wrong password.
                return null;
            }
            else if (e instanceof CredentialAuthenticationError) {
                this.helpText = getLoginErrorMessage(e, false);
                return null;
            }
            else if (e instanceof DeviceStorageUnavailableError) {
                // We want to allow deleting credentials even if keychain fails
                await this.credentialsProvider.deleteByUserId(credentialsInfo.userId);
                await this.credentialRemovalHandler.onCredentialsRemoved(credentialsInfo);
                await this.updateCachedCredentials();
            }
            else {
                throw e;
            }
        }
        if (credentials) {
            await this.credentialsProvider.deleteByUserId(credentials.credentialInfo.userId);
            await this.credentialRemovalHandler.onCredentialsRemoved(credentials.credentialInfo);
            await this.updateCachedCredentials();
            try {
                await this.loginController.deleteOldSession(credentials, (await this.pushServiceApp?.loadPushIdentifierFromNative()) ?? null);
            }
            catch (e) {
                if (isOfflineError(e)) {
                    return "networkError";
                }
            }
        }
        return null;
    }
    /** @throws CredentialAuthenticationError */
    async unlockAppAndGetCredentials(userId) {
        await this.appLock.enforce();
        return await this.credentialsProvider.getDecryptedCredentialsByUserId(userId);
    }
    getSavedCredentials() {
        return this.savedInternalCredentials;
    }
    switchDeleteState() {
        if (this.displayMode === "deleteCredentials" /* DisplayMode.DeleteCredentials */) {
            this.displayMode = "credentials" /* DisplayMode.Credentials */;
        }
        else if (this.displayMode === "credentials" /* DisplayMode.Credentials */) {
            this.displayMode = "deleteCredentials" /* DisplayMode.DeleteCredentials */;
        }
        else {
            throw new ProgrammingError("invalid state");
        }
    }
    showLoginForm() {
        this.displayMode = "form" /* DisplayMode.Form */;
        this.helpText = "emptyString_msg";
    }
    showCredentials() {
        this.displayMode = "credentials" /* DisplayMode.Credentials */;
        this.helpText = "emptyString_msg";
    }
    shouldShowRecover() {
        return this.domainConfig.firstPartyDomain;
    }
    shouldShowSignup() {
        return this.domainConfig.firstPartyDomain || getWhitelabelRegistrationDomains().length > 0;
    }
    shouldShowAppButtons() {
        return this.domainConfig.firstPartyDomain;
    }
    async updateCachedCredentials() {
        this.savedInternalCredentials = await this.credentialsProvider.getInternalCredentialsInfos();
        this.autoLoginCredentials = null;
        if (this.savedInternalCredentials.length > 0) {
            if (this.displayMode !== "deleteCredentials" /* DisplayMode.DeleteCredentials */) {
                this.displayMode = "credentials" /* DisplayMode.Credentials */;
            }
        }
        else {
            this.displayMode = "form" /* DisplayMode.Form */;
        }
    }
    async autologin() {
        let credentials = null;
        try {
            if (this.autoLoginCredentials == null) {
                const allCredentials = await this.credentialsProvider.getInternalCredentialsInfos();
                this.autoLoginCredentials = first(allCredentials);
            }
            // we don't want to auto-login on the legacy domain, there's a banner
            // there to move people to the new domain.
            if (this.autoLoginCredentials) {
                credentials = await this.unlockAppAndGetCredentials(this.autoLoginCredentials.userId);
                if (credentials) {
                    const offlineTimeRange = this.deviceConfig.getOfflineTimeRangeDays(this.autoLoginCredentials.userId);
                    const result = await this.loginController.resumeSession(credentials, null, offlineTimeRange);
                    if (result.type == "success") {
                        await this.onLogin();
                    }
                    else {
                        this.state = "NotAuthenticated" /* LoginState.NotAuthenticated */;
                        this.helpText = "offlineLoginPremiumOnly_msg";
                    }
                }
            }
            else {
                this.state = "NotAuthenticated" /* LoginState.NotAuthenticated */;
            }
        }
        catch (e) {
            if (e instanceof NotAuthenticatedError && this.autoLoginCredentials) {
                const autoLoginCredentials = this.autoLoginCredentials;
                await this.credentialsProvider.deleteByUserId(autoLoginCredentials.userId);
                if (credentials) {
                    await this.credentialRemovalHandler.onCredentialsRemoved(credentials.credentialInfo);
                }
                await this.updateCachedCredentials();
                await this.onLoginFailed(e);
            }
            else if (e instanceof KeyPermanentlyInvalidatedError) {
                await this.credentialsProvider.clearCredentials(e);
                await this.updateCachedCredentials();
                this.state = "NotAuthenticated" /* LoginState.NotAuthenticated */;
                this.helpText = "credentialsKeyInvalidated_msg";
            }
            else if (e instanceof DeviceStorageUnavailableError) {
                // The app already shows a dialog with FAQ link so we don't have to explain
                // much here, just catching it to avoid unexpected error dialog
                this.state = "NotAuthenticated" /* LoginState.NotAuthenticated */;
                this.helpText = lang.makeTranslation("help_text", "Could not access secret storage");
            }
            else {
                await this.onLoginFailed(e);
            }
        }
        if (this.state === "AccessExpired" /* LoginState.AccessExpired */ || this.state === "InvalidCredentials" /* LoginState.InvalidCredentials */) {
            this.displayMode = "form" /* DisplayMode.Form */;
            this.mailAddress(this.autoLoginCredentials?.login ?? "");
        }
    }
    async formLogin() {
        const mailAddress = this.mailAddress();
        const password = this.password();
        const savePassword = this.savePassword();
        if (mailAddress === "" || password === "") {
            this.state = "InvalidCredentials" /* LoginState.InvalidCredentials */;
            this.helpText = "loginFailed_msg";
            return;
        }
        this.helpText = "login_msg";
        try {
            const sessionType = savePassword ? 2 /* SessionType.Persistent */ : 0 /* SessionType.Login */;
            const { credentials, databaseKey } = await this.loginController.createSession(mailAddress, password, sessionType);
            await this.onLogin();
            // enforce app lock always, even if we don't access stored credentials
            await this.appLock.enforce();
            // we don't want to have multiple credentials that
            // * share the same userId with different mail addresses (may happen if a user chooses a different alias to log in than the one they saved)
            // * share the same mail address (may happen if mail aliases are moved between users)
            const storedCredentialsToDelete = this.savedInternalCredentials.filter((c) => c.login === mailAddress || c.userId === credentials.userId);
            for (const credentialToDelete of storedCredentialsToDelete) {
                const credentials = await this.credentialsProvider.getDecryptedCredentialsByUserId(credentialToDelete.userId);
                if (credentials) {
                    await this.loginController.deleteOldSession(credentials);
                    // we handled the deletion of the offlineDb in createSession already
                    await this.credentialsProvider.deleteByUserId(credentials.credentialInfo.userId, { deleteOfflineDb: false });
                }
            }
            if (savePassword) {
                try {
                    await this.credentialsProvider.store(credentialsToUnencrypted(credentials, databaseKey));
                }
                catch (e) {
                    if (e instanceof KeyPermanentlyInvalidatedError) {
                        await this.credentialsProvider.clearCredentials(e);
                        await this.updateCachedCredentials();
                    }
                    else if (e instanceof DeviceStorageUnavailableError || e instanceof CancelledError) {
                        console.warn("will proceed with ephemeral credentials because device storage is unavailable:", e);
                    }
                    else {
                        throw e;
                    }
                }
            }
        }
        catch (e) {
            if (e instanceof DeviceStorageUnavailableError) {
                console.warn("cannot log in: failed to get credentials from device storage", e);
            }
            await this.onLoginFailed(e);
        }
        finally {
            await this.secondFactorHandler.closeWaitingForSecondFactorDialog();
        }
    }
    async onLogin() {
        this.helpText = "emptyString_msg";
        this.state = "LoggedIn" /* LoginState.LoggedIn */;
    }
    async onLoginFailed(error) {
        this.helpText = getLoginErrorMessage(error, false);
        if (error instanceof BadRequestError || error instanceof NotAuthenticatedError) {
            this.state = "InvalidCredentials" /* LoginState.InvalidCredentials */;
        }
        else if (error instanceof AccessExpiredError) {
            this.state = "AccessExpired" /* LoginState.AccessExpired */;
        }
        else {
            this.state = "UnknownError" /* LoginState.UnknownError */;
        }
        handleExpectedLoginError(error, noOp);
    }
}
//# sourceMappingURL=LoginViewModel.js.map