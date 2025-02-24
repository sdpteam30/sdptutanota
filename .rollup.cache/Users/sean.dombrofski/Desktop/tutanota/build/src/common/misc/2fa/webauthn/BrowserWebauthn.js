import { COSEAlgorithmIdentifier } from "./WebauthnTypes.js";
import { ProgrammingError } from "../../../api/common/error/ProgrammingError.js";
import { isApp } from "../../../api/common/Env.js";
import { stringToUtf8Uint8Array } from "@tutao/tutanota-utils";
import { CancelledError } from "../../../api/common/error/CancelledError.js";
import { WebauthnError } from "../../../api/common/error/WebauthnError.js";
const WEBAUTHN_TIMEOUT_MS = 60000;
/** An actual webauthn implementation in browser. */
export class BrowserWebauthn {
    api;
    /**
     * Relying Party Identifier
     * see https://www.w3.org/TR/webauthn-2/#public-key-credential-source-rpid
     */
    rpId;
    /** Backward-compatible identifier for the legacy U2F API */
    appId;
    currentOperationSignal = null;
    constructor(api, domainConfig) {
        this.api = api;
        this.rpId = domainConfig.webauthnRpId;
        this.appId = domainConfig.u2fAppId;
    }
    async canAttemptChallengeForRpId(rpId) {
        return rpId === this.rpId;
    }
    async canAttemptChallengeForU2FAppId(appId) {
        return this.appId === appId;
    }
    /**
     * test whether hardware key second factors are supported for this client
     */
    async isSupported() {
        return (!isApp() &&
            this.api != null &&
            // @ts-ignore see polyfill.js
            // We just stub BigInt in order to import cborg without issues but we can't actually use it
            !BigInt.polyfilled);
    }
    async register({ challenge, userId, name, displayName }) {
        const publicKeyCredentialCreationOptions = {
            challenge,
            rp: {
                name: "Tutanota",
                id: this.rpId,
            },
            user: {
                id: stringToUtf8Uint8Array(userId),
                name,
                displayName,
            },
            pubKeyCredParams: [
                {
                    alg: COSEAlgorithmIdentifier.ES256,
                    type: "public-key",
                },
            ],
            authenticatorSelection: {
                authenticatorAttachment: "cross-platform",
                userVerification: "discouraged",
            },
            timeout: WEBAUTHN_TIMEOUT_MS,
            attestation: "none",
        };
        this.currentOperationSignal = new AbortController();
        const credential = (await this.api.create({
            publicKey: publicKeyCredentialCreationOptions,
            signal: this.currentOperationSignal.signal,
        }));
        return {
            rpId: this.rpId,
            rawId: new Uint8Array(credential.rawId),
            attestationObject: new Uint8Array(credential.response.attestationObject),
        };
    }
    async sign({ challenge, keys }) {
        const allowCredentials = keys.map((key) => {
            return {
                id: key.id,
                type: "public-key",
            };
        });
        const publicKeyCredentialRequestOptions = {
            challenge: challenge,
            rpId: this.rpId,
            allowCredentials,
            extensions: {
                appid: this.appId,
            },
            userVerification: "discouraged",
            timeout: WEBAUTHN_TIMEOUT_MS,
        };
        let assertion;
        this.currentOperationSignal = new AbortController();
        try {
            assertion = await this.api.get({
                publicKey: publicKeyCredentialRequestOptions,
                signal: this.currentOperationSignal.signal,
            });
        }
        catch (e) {
            if (e.name === "AbortError") {
                throw new CancelledError(e);
            }
            else {
                throw new WebauthnError(e);
            }
        }
        const publicKeyCredential = assertion;
        if (publicKeyCredential == null) {
            throw new ProgrammingError("Webauthn credential could not be unambiguously resolved");
        }
        const assertionResponse = publicKeyCredential.response;
        return {
            rawId: new Uint8Array(publicKeyCredential.rawId),
            authenticatorData: new Uint8Array(assertionResponse.authenticatorData),
            signature: new Uint8Array(assertionResponse.signature),
            clientDataJSON: new Uint8Array(assertionResponse.clientDataJSON),
        };
    }
    async abortCurrentOperation() {
        this.currentOperationSignal?.abort();
        this.currentOperationSignal = null;
    }
}
//# sourceMappingURL=BrowserWebauthn.js.map