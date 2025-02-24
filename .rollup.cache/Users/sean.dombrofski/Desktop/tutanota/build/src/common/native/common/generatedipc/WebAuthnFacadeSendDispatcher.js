/* generated file, don't edit. */
export class WebAuthnFacadeSendDispatcher {
    transport;
    constructor(transport) {
        this.transport = transport;
    }
    async register(...args) {
        return this.transport.invokeNative("ipc", ["WebAuthnFacade", "register", ...args]);
    }
    async sign(...args) {
        return this.transport.invokeNative("ipc", ["WebAuthnFacade", "sign", ...args]);
    }
    async abortCurrentOperation(...args) {
        return this.transport.invokeNative("ipc", ["WebAuthnFacade", "abortCurrentOperation", ...args]);
    }
    async isSupported(...args) {
        return this.transport.invokeNative("ipc", ["WebAuthnFacade", "isSupported", ...args]);
    }
    async canAttemptChallengeForRpId(...args) {
        return this.transport.invokeNative("ipc", ["WebAuthnFacade", "canAttemptChallengeForRpId", ...args]);
    }
    async canAttemptChallengeForU2FAppId(...args) {
        return this.transport.invokeNative("ipc", ["WebAuthnFacade", "canAttemptChallengeForU2FAppId", ...args]);
    }
}
//# sourceMappingURL=WebAuthnFacadeSendDispatcher.js.map