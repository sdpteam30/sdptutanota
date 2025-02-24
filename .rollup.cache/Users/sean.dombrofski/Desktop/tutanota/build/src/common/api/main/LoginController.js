import { assertNotNull, defer } from "@tutao/tutanota-utils";
import { assertMainOrNodeBoot } from "../common/Env";
import { getWhitelabelCustomizations } from "../../misc/WhitelabelCustomizations.js";
import { NotFoundError } from "../common/error/RestError";
import { client } from "../../misc/ClientDetector";
assertMainOrNodeBoot();
export class LoginController {
    loginFacade;
    loginListener;
    resetAppState;
    userController = null;
    // they are FeatureType but we might not be aware of newer values for it, so it is not just FeatureType
    customizations = null;
    partialLogin = defer();
    _isWhitelabel = !!getWhitelabelCustomizations(window);
    postLoginActions = [];
    fullyLoggedIn = false;
    atLeastPartiallyLoggedIn = false;
    constructor(loginFacade, loginListener, resetAppState) {
        this.loginFacade = loginFacade;
        this.loginListener = loginListener;
        this.resetAppState = resetAppState;
    }
    init() {
        this.waitForFullLogin().then(async () => {
            this.fullyLoggedIn = true;
            await this.waitForPartialLogin();
            for (const lazyAction of this.postLoginActions) {
                const action = await lazyAction();
                await action.onFullLoginSuccess({
                    sessionType: this.getUserController().sessionType,
                    userId: this.getUserController().userId,
                });
            }
        });
    }
    /**
     * create a new session and set up stored credentials and offline database, if applicable.
     * @param username the mail address being used to log in
     * @param password the password given to log in
     * @param sessionType whether to store the credentials in local storage
     * @param databaseKey if given, will use this key for the offline database. if not, will force a new database to be created and generate a key.
     */
    async createSession(username, password, sessionType, databaseKey = null) {
        const newSessionData = await this.loginFacade.createSession(username, password, client.getIdentifier(), sessionType, databaseKey);
        const { user, credentials, sessionId, userGroupInfo } = newSessionData;
        await this.onPartialLoginSuccess({
            user,
            userGroupInfo,
            sessionId,
            accessToken: credentials.accessToken,
            sessionType,
            loginUsername: username,
        }, sessionType);
        return newSessionData;
    }
    addPostLoginAction(handler) {
        this.postLoginActions.push(handler);
    }
    async onPartialLoginSuccess(initData, sessionType) {
        const { initUserController } = await import("./UserController");
        this.userController = await initUserController(initData);
        await this.loadCustomizations();
        await this._determineIfWhitelabel();
        for (const lazyHandler of this.postLoginActions) {
            const handler = await lazyHandler();
            await handler.onPartialLoginSuccess({
                sessionType,
                userId: initData.user._id,
            });
        }
        this.atLeastPartiallyLoggedIn = true;
        this.partialLogin.resolve();
    }
    async createExternalSession(userId, password, salt, kdfType, clientIdentifier, sessionType) {
        const persistentSession = sessionType === 2 /* SessionType.Persistent */;
        const { user, credentials, sessionId, userGroupInfo } = await this.loginFacade.createExternalSession(userId, password, salt, kdfType, clientIdentifier, persistentSession);
        await this.onPartialLoginSuccess({
            user,
            accessToken: credentials.accessToken,
            sessionType,
            sessionId,
            userGroupInfo,
            loginUsername: userId,
        }, 0 /* SessionType.Login */);
        return credentials;
    }
    /**
     * Resume an existing session using stored credentials, may or may not unlock a persistent local database
     * @param unencryptedCredentials The stored credentials and optional database key for the offline db
     * @param externalUserKeyDeriver The KDF type and salt to resume a session
     * @param offlineTimeRangeDays the user configured time range for their offline storage, used to initialize the offline db
     */
    async resumeSession(unencryptedCredentials, externalUserKeyDeriver, offlineTimeRangeDays) {
        const { unencryptedToCredentials } = await import("../../misc/credentials/Credentials.js");
        const credentials = unencryptedToCredentials(unencryptedCredentials);
        const resumeResult = await this.loginFacade.resumeSession(credentials, externalUserKeyDeriver ?? null, unencryptedCredentials.databaseKey ?? null, offlineTimeRangeDays ?? null);
        if (resumeResult.type === "error") {
            return resumeResult;
        }
        else {
            const { user, userGroupInfo, sessionId } = resumeResult.data;
            try {
                await this.onPartialLoginSuccess({
                    user,
                    accessToken: credentials.accessToken,
                    userGroupInfo,
                    sessionId,
                    sessionType: 2 /* SessionType.Persistent */,
                    loginUsername: credentials.login,
                }, 2 /* SessionType.Persistent */);
            }
            catch (e) {
                // Some parts of initialization can fail and we should reset the state, both on this side and the worker
                // side, otherwise login cannot be attempted again
                console.log("Error finishing login, logging out now!", e);
                await this.logout(false);
                throw e;
            }
            return { type: "success" };
        }
    }
    isUserLoggedIn() {
        return this.userController != null;
    }
    isFullyLoggedIn() {
        return this.fullyLoggedIn;
    }
    isAtLeastPartiallyLoggedIn() {
        return this.atLeastPartiallyLoggedIn;
    }
    waitForPartialLogin() {
        return this.partialLogin.promise;
    }
    async waitForFullLogin() {
        // Full login event might be received before we finish userLogin on the client side because they are done in parallel.
        // So we make sure to wait for userLogin first.
        await this.waitForPartialLogin();
        const loginListener = await this.loginListener();
        return loginListener.waitForFullLogin();
    }
    isInternalUserLoggedIn() {
        return this.isUserLoggedIn() && this.getUserController().isInternalUser();
    }
    isGlobalAdminUserLoggedIn() {
        return this.isUserLoggedIn() && this.getUserController().isGlobalAdmin();
    }
    getUserController() {
        return assertNotNull(this.userController); // only to be used after login (when user is defined)
    }
    isEnabled(feature) {
        return this.customizations != null ? this.customizations.indexOf(feature) !== -1 : false;
    }
    async loadCustomizations(cacheMode = 0 /* CacheMode.ReadAndWrite */) {
        if (this.getUserController().isInternalUser()) {
            const customer = await this.getUserController().loadCustomer(cacheMode);
            this.customizations = customer.customizations.map((f) => f.feature);
        }
    }
    /**
     * Reset login state, delete session, if not {@link SessionType.Persistent}.
     * @param sync whether to try and close the session before the window is closed
     */
    async logout(sync) {
        // make all parts of LoginController usable for another login
        if (this.userController) {
            await this.userController.deleteSession(sync);
        }
        else {
            console.log("No session to delete");
        }
        // Using this over LoginFacade.resetSession() to reset all app state that might have been already bound to
        // a user on the worker side.
        await this.resetAppState();
        this.userController = null;
        this.partialLogin = defer();
        this.fullyLoggedIn = false;
        const loginListener = await this.loginListener();
        loginListener.reset();
        this.init();
    }
    async _determineIfWhitelabel() {
        this._isWhitelabel = await this.getUserController().isWhitelabelAccount();
    }
    isWhitelabel() {
        return this._isWhitelabel;
    }
    /**
     * Deletes the session on the server.
     * @param credentials
     * @param pushIdentifier identifier associated with this device, if any, to delete PushIdentifier on the server
     */
    async deleteOldSession(credentials, pushIdentifier = null) {
        try {
            await this.loginFacade.deleteSession(credentials.accessToken, pushIdentifier);
        }
        catch (e) {
            if (e instanceof NotFoundError) {
                console.log("session already deleted");
            }
            else {
                throw e;
            }
        }
    }
    async retryAsyncLogin() {
        const loginListener = await this.loginListener();
        loginListener.onRetryLogin();
        await this.loginFacade.retryAsyncLogin();
    }
}
//# sourceMappingURL=LoginController.js.map