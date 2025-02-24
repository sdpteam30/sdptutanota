import { IV_BYTE_LENGTH, keyToUint8Array } from "@tutao/tutanota-crypto";
export class AesApp {
    nativeCryptoFacade;
    random;
    constructor(nativeCryptoFacade, random) {
        this.nativeCryptoFacade = nativeCryptoFacade;
        this.random = random;
    }
    /**
     * Encrypts a file with the provided key
     * @return Returns the URI of the decrypted file. Resolves to an exception if the encryption failed.
     */
    aesEncryptFile(key, fileUrl) {
        const iv = this.random.generateRandomData(IV_BYTE_LENGTH);
        const encodedKey = keyToUint8Array(key);
        return this.nativeCryptoFacade.aesEncryptFile(encodedKey, fileUrl, iv);
    }
    /**
     * Decrypt bytes with the provided key
     * @return Returns the URI of the decrypted file. Resolves to an exception if the encryption failed.
     */
    aesDecryptFile(key, fileUrl) {
        const encodedKey = keyToUint8Array(key);
        return this.nativeCryptoFacade.aesDecryptFile(encodedKey, fileUrl);
    }
}
//# sourceMappingURL=AesApp.js.map