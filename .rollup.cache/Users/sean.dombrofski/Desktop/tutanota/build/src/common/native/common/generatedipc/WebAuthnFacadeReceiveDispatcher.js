/* generated file, don't edit. */
export class WebAuthnFacadeReceiveDispatcher {
    facade;
    constructor(facade) {
        this.facade = facade;
    }
    async dispatch(method, arg) {
        switch (method) {
            case "register": {
                const challenge = arg[0];
                return this.facade.register(challenge);
            }
            case "sign": {
                const challenge = arg[0];
                return this.facade.sign(challenge);
            }
            case "abortCurrentOperation": {
                return this.facade.abortCurrentOperation();
            }
            case "isSupported": {
                return this.facade.isSupported();
            }
            case "canAttemptChallengeForRpId": {
                const rpId = arg[0];
                return this.facade.canAttemptChallengeForRpId(rpId);
            }
            case "canAttemptChallengeForU2FAppId": {
                const appId = arg[0];
                return this.facade.canAttemptChallengeForU2FAppId(appId);
            }
        }
    }
}
//# sourceMappingURL=WebAuthnFacadeReceiveDispatcher.js.map