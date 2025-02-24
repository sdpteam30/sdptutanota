import m from "mithril";
import { createSecondFactorAuthData, SessionTypeRef } from "../../api/entities/sys/TypeRefs.js";
import { Dialog } from "../../gui/base/Dialog";
import { lang } from "../LanguageViewModel";
import { neverNull } from "@tutao/tutanota-utils";
import { NotFoundError } from "../../api/common/error/RestError";
import { isSameId } from "../../api/common/utils/EntityUtils";
import { assertMainOrNode } from "../../api/common/Env";
import { SecondFactorAuthDialog } from "./SecondFactorAuthDialog";
import { isUpdateForTypeRef } from "../../api/common/utils/EntityUpdateUtils.js";
assertMainOrNode();
/**
 * Handles showing and hiding of the following dialogs:
 * 1. Waiting for second factor approval (either token or by other client) during login
 * 2. Ask for approving the login on another client (setupAcceptOtherClientLoginListener() must have been called initially).
 *      If the dialog is visible and another client tries to login at the same time, that second login is ignored.
 */
export class SecondFactorHandler {
    eventController;
    entityClient;
    webauthnClient;
    loginFacade;
    domainConfigProvider;
    otherLoginSessionId = null;
    otherLoginDialog = null;
    otherLoginListenerInitialized = false;
    waitingForSecondFactorDialog = null;
    constructor(eventController, entityClient, webauthnClient, loginFacade, domainConfigProvider) {
        this.eventController = eventController;
        this.entityClient = entityClient;
        this.webauthnClient = webauthnClient;
        this.loginFacade = loginFacade;
        this.domainConfigProvider = domainConfigProvider;
    }
    setupAcceptOtherClientLoginListener() {
        if (this.otherLoginListenerInitialized) {
            return;
        }
        this.otherLoginListenerInitialized = true;
        this.eventController.addEntityListener((updates) => this.entityEventsReceived(updates));
    }
    async entityEventsReceived(updates) {
        for (const update of updates) {
            const sessionId = [neverNull(update.instanceListId), update.instanceId];
            if (isUpdateForTypeRef(SessionTypeRef, update)) {
                if (update.operation === "0" /* OperationType.CREATE */) {
                    let session;
                    try {
                        session = await this.entityClient.load(SessionTypeRef, sessionId);
                    }
                    catch (e) {
                        if (e instanceof NotFoundError) {
                            console.log("Failed to load session", e);
                        }
                        else {
                            throw e;
                        }
                        continue;
                    }
                    if (session.state === "3" /* SessionState.SESSION_STATE_PENDING */) {
                        if (this.otherLoginDialog != null) {
                            this.otherLoginDialog.close();
                        }
                        this.otherLoginSessionId = session._id;
                        this.showConfirmLoginDialog(session);
                    }
                }
                else if (update.operation === "1" /* OperationType.UPDATE */ && this.otherLoginSessionId && isSameId(this.otherLoginSessionId, sessionId)) {
                    let session;
                    try {
                        session = await this.entityClient.load(SessionTypeRef, sessionId);
                    }
                    catch (e) {
                        if (e instanceof NotFoundError) {
                            console.log("Failed to load session", e);
                        }
                        else {
                            throw e;
                        }
                        continue;
                    }
                    if (session.state !== "3" /* SessionState.SESSION_STATE_PENDING */ &&
                        this.otherLoginDialog &&
                        isSameId(neverNull(this.otherLoginSessionId), sessionId)) {
                        this.otherLoginDialog.close();
                        this.otherLoginSessionId = null;
                        this.otherLoginDialog = null;
                    }
                }
                else if (update.operation === "2" /* OperationType.DELETE */ && this.otherLoginSessionId && isSameId(this.otherLoginSessionId, sessionId)) {
                    if (this.otherLoginDialog) {
                        this.otherLoginDialog.close();
                        this.otherLoginSessionId = null;
                        this.otherLoginDialog = null;
                    }
                }
            }
        }
    }
    showConfirmLoginDialog(session) {
        let text;
        if (session.loginIpAddress) {
            text = lang.get("secondFactorConfirmLogin_msg", {
                "{clientIdentifier}": session.clientIdentifier,
                "{ipAddress}": session.loginIpAddress,
            });
        }
        else {
            text = lang.get("secondFactorConfirmLoginNoIp_msg", {
                "{clientIdentifier}": session.clientIdentifier,
            });
        }
        this.otherLoginDialog = Dialog.showActionDialog({
            title: "secondFactorConfirmLogin_label",
            child: {
                view: () => m(".text-break.pt", text),
            },
            okAction: async () => {
                await this.loginFacade.authenticateWithSecondFactor(createSecondFactorAuthData({
                    session: session._id,
                    type: null, // Marker for confirming another session
                    otpCode: null,
                    u2f: null,
                    webauthn: null,
                }));
                if (this.otherLoginDialog) {
                    this.otherLoginDialog.close();
                    this.otherLoginSessionId = null;
                    this.otherLoginDialog = null;
                }
            },
        });
        // close the dialog manually after 1 min because the session is not updated if the other client is closed
        let sessionId = session._id;
        setTimeout(() => {
            if (this.otherLoginDialog && isSameId(neverNull(this.otherLoginSessionId), sessionId)) {
                this.otherLoginDialog.close();
                this.otherLoginSessionId = null;
                this.otherLoginDialog = null;
            }
        }, 60 * 1000);
    }
    closeWaitingForSecondFactorDialog() {
        this.waitingForSecondFactorDialog?.close();
        this.waitingForSecondFactorDialog = null;
    }
    /**
     * @inheritDoc
     */
    async showSecondFactorAuthenticationDialog(sessionId, challenges, mailAddress) {
        if (this.waitingForSecondFactorDialog) {
            return;
        }
        this.waitingForSecondFactorDialog = SecondFactorAuthDialog.show(this.webauthnClient, this.loginFacade, this.domainConfigProvider, {
            sessionId,
            challenges,
            mailAddress,
        }, () => {
            this.waitingForSecondFactorDialog = null;
        });
    }
}
//# sourceMappingURL=SecondFactorHandler.js.map