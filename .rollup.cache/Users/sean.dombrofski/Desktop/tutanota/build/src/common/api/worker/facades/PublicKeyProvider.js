import { createPublicKeyGetIn } from "../../entities/sys/TypeRefs.js";
import { PublicKeyService } from "../../entities/sys/Services.js";
import { parseKeyVersion } from "./KeyLoaderFacade.js";
import { InvalidDataError } from "../../common/error/RestError.js";
import { CryptoError } from "@tutao/tutanota-crypto/error.js";
/**
 * Load public keys.
 * Handle key versioning.
 */
export class PublicKeyProvider {
    serviceExecutor;
    constructor(serviceExecutor) {
        this.serviceExecutor = serviceExecutor;
    }
    async loadCurrentPubKey(pubKeyIdentifier) {
        return this.loadPubKey(pubKeyIdentifier, null);
    }
    async loadVersionedPubKey(pubKeyIdentifier, version) {
        return (await this.loadPubKey(pubKeyIdentifier, version)).object;
    }
    async loadPubKey(pubKeyIdentifier, version) {
        const requestData = createPublicKeyGetIn({
            version: version ? String(version) : null,
            identifier: pubKeyIdentifier.identifier,
            identifierType: pubKeyIdentifier.identifierType,
        });
        const publicKeyGetOut = await this.serviceExecutor.get(PublicKeyService, requestData);
        const pubKeys = this.convertToVersionedPublicKeys(publicKeyGetOut);
        this.enforceRsaKeyVersionConstraint(pubKeys);
        if (version != null && pubKeys.version !== version) {
            throw new InvalidDataError("the server returned a key version that was not requested");
        }
        return pubKeys;
    }
    /**
     * RSA keys were only created before introducing key versions, i.e. they always have version 0.
     *
     * Receiving a higher version would indicate a protocol downgrade/ MITM attack, and we reject such keys.
     */
    enforceRsaKeyVersionConstraint(pubKeys) {
        if (pubKeys.version !== 0 && pubKeys.object.pubRsaKey != null) {
            throw new CryptoError("rsa key in a version that is not 0");
        }
    }
    convertToVersionedPublicKeys(publicKeyGetOut) {
        return {
            object: {
                pubRsaKey: publicKeyGetOut.pubRsaKey,
                pubKyberKey: publicKeyGetOut.pubKyberKey,
                pubEccKey: publicKeyGetOut.pubEccKey,
            },
            version: parseKeyVersion(publicKeyGetOut.pubKeyVersion),
        };
    }
}
//# sourceMappingURL=PublicKeyProvider.js.map