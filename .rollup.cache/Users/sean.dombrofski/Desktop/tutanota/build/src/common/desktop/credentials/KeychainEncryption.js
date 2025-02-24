import { KeyPermanentlyInvalidatedError } from "../../api/common/error/KeyPermanentlyInvalidatedError.js";
import { assertSupportedEncryptionMode } from "./CredentialCommons.js";
import { CryptoError } from "@tutao/tutanota-crypto/error.js";
export class KeychainEncryption {
    appPassHandler;
    crypto;
    desktopKeyStoreFacade;
    constructor(appPassHandler, crypto, desktopKeyStoreFacade) {
        this.appPassHandler = appPassHandler;
        this.crypto = crypto;
        this.desktopKeyStoreFacade = desktopKeyStoreFacade;
    }
    async decryptUsingKeychain(encryptedDataWithAppPassWrapper, encryptionMode) {
        try {
            assertSupportedEncryptionMode(encryptionMode);
            const encryptedData = await this.appPassHandler.removeAppPassWrapper(encryptedDataWithAppPassWrapper, encryptionMode);
            const keyChainKey = await this.desktopKeyStoreFacade.getKeyChainKey();
            return this.crypto.unauthenticatedAes256DecryptKey(keyChainKey, encryptedData);
        }
        catch (e) {
            if (e instanceof CryptoError) {
                // If the key could not be decrypted it means that something went very wrong. We will probably not be able to do anything about it so just
                // delete everything.
                throw new KeyPermanentlyInvalidatedError(`Could not decrypt credentials: ${e.stack ?? e.message}`);
            }
            else {
                throw e;
            }
        }
    }
    async encryptUsingKeychain(data, encryptionMode) {
        try {
            assertSupportedEncryptionMode(encryptionMode);
            const keyChainKey = await this.desktopKeyStoreFacade.getKeyChainKey();
            const encryptedData = this.crypto.aes256EncryptKey(keyChainKey, data);
            return this.appPassHandler.addAppPassWrapper(encryptedData, encryptionMode);
        }
        catch (e) {
            if (e instanceof CryptoError) {
                // If the key could not be decrypted it means that something went very wrong. We will probably not be able to do anything about it so just
                // delete everything.
                throw new KeyPermanentlyInvalidatedError(`Could not encrypt credentials: ${e.stack ?? e.message}`);
            }
            else {
                throw e;
            }
        }
    }
}
//# sourceMappingURL=KeychainEncryption.js.map