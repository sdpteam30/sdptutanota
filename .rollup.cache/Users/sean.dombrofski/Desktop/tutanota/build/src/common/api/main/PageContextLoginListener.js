import { arrayEquals, assertNotNull, defer } from "@tutao/tutanota-utils";
/** Listener for the login events from the worker side. */
export class PageContextLoginListener {
    secondFactorHandler;
    credentialsProvider;
    loginPromise = defer();
    fullLoginFailed = false;
    constructor(secondFactorHandler, credentialsProvider) {
        this.secondFactorHandler = secondFactorHandler;
        this.credentialsProvider = credentialsProvider;
    }
    /** e.g. after temp logout */
    reset() {
        this.loginPromise = defer();
        this.fullLoginFailed = false;
    }
    waitForFullLogin() {
        return this.loginPromise.promise;
    }
    /**
     * Full login reached: any network requests can be made
     */
    async onFullLoginSuccess(_sessionType, _cacheInfo, credentials) {
        this.fullLoginFailed = false;
        // Update the credentials after the full login.
        // It is needed because we added encryptedPassphraseKey to credentials which is only
        // available after the full login which happens async.
        // First fetch encrypted credentials for the user to figure out if the credentials are stored but are also missing
        // a passphrase key, and then update if so.
        const persistedCredentials = (await this.credentialsProvider.getAllInternalCredentials()).find((a) => a.credentialInfo.userId === credentials.userId);
        if (persistedCredentials != null && this.isPassphraseKeyUpdatedNeeded(persistedCredentials, credentials)) {
            await this.credentialsProvider.replacePassword(persistedCredentials.credentialInfo, assertNotNull(credentials.encryptedPassword), assertNotNull(credentials.encryptedPassphraseKey));
        }
        this.loginPromise.resolve();
    }
    /**
     * It is possible that a KDF migration was executed by a different client. This would change the passphrase key, so we need to check if we have to update the stored one.
     * @private
     */
    isPassphraseKeyUpdatedNeeded(persistedCredentials, credentials) {
        const persistedEncryptedPassphraseKey = persistedCredentials.encryptedPassphraseKey;
        const credentialsEncryptedPassphraseKey = credentials.encryptedPassphraseKey;
        if (persistedCredentials.encryptedPassword != credentials.encryptedPassword) {
            // we only want to update the encrypted passwordKey if we changed the kdf function.
            // In this case we have the same endryptedPassword but a different password key.
            return false;
        }
        if (persistedEncryptedPassphraseKey != null && credentialsEncryptedPassphraseKey != null) {
            return !arrayEquals(persistedEncryptedPassphraseKey, credentialsEncryptedPassphraseKey);
        }
        else if (persistedEncryptedPassphraseKey == null && credentialsEncryptedPassphraseKey == null) {
            // both are null so nothing has changed.
            return false;
        }
        else {
            // one is null and the other is not
            return true;
        }
    }
    /**
     * call when the login fails for invalid session or other reasons
     */
    async onLoginFailure(reason) {
        this.fullLoginFailed = true;
        if (reason === 0 /* LoginFailReason.SessionExpired */) {
            const { reloginForExpiredSession } = await import("../../misc/ErrorHandlerImpl.js");
            await reloginForExpiredSession();
        }
    }
    /**
     * call when retrying full login
     */
    onRetryLogin() {
        this.fullLoginFailed = false;
    }
    /**
     * Shows a dialog with possibility to use second factor and with a message that the login can be approved from another client.
     */
    onSecondFactorChallenge(sessionId, challenges, mailAddress) {
        return this.secondFactorHandler.showSecondFactorAuthenticationDialog(sessionId, challenges, mailAddress);
    }
    /**
     * true if the last full login attempt failed
     * may revert to false when retrying.
     */
    getFullLoginFailed() {
        return this.fullLoginFailed;
    }
}
//# sourceMappingURL=PageContextLoginListener.js.map