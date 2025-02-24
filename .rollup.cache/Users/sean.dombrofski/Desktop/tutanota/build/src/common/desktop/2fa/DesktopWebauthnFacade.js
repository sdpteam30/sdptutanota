export class DesktopWebauthnFacade {
    parentWindow;
    webDialogController;
    currentDialog = null;
    constructor(parentWindow, webDialogController) {
        this.parentWindow = parentWindow;
        this.webDialogController = webDialogController;
    }
    async register(challenge) {
        const { domain } = challenge;
        return this.withDialog(domain, (webauthn) => webauthn.register(challenge));
    }
    async sign(challenge) {
        const { domain } = challenge;
        return this.withDialog(domain, (webauthn) => webauthn.sign(challenge));
    }
    async canAttemptChallengeForRpId(rpId) {
        return true;
    }
    async canAttemptChallengeForU2FAppId(appId) {
        return true;
    }
    async isSupported() {
        return true;
    }
    async abortCurrentOperation() {
        try {
            ;
            (await this.currentDialog)?.cancel();
        }
        catch (ignored) {
            /* empty */
        }
    }
    async withDialog(baseDomain, request) {
        this.currentDialog = this.webDialogController.create(this.parentWindow.id, new URL(baseDomain));
        const dialog = await this.currentDialog;
        try {
            // make sure to await to get finally() to trigger in case of errors
            return await dialog.makeRequest((remote) => request(remote.WebAuthnFacade));
        }
        finally {
            this.currentDialog = null;
        }
    }
}
//# sourceMappingURL=DesktopWebauthnFacade.js.map