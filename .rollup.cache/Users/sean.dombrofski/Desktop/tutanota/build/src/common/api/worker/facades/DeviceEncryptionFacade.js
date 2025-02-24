import { aes256RandomKey, aesDecrypt, aesEncrypt, bitArrayToUint8Array, uint8ArrayToBitArray } from "@tutao/tutanota-crypto";
export class DeviceEncryptionFacade {
    /**
     * Generates an encryption key.
     */
    async generateKey() {
        return bitArrayToUint8Array(aes256RandomKey());
    }
    /**
     * Encrypts {@param data} using {@param deviceKey}.
     * @param deviceKey Key used for encryption
     * @param data Data to encrypt.
     */
    async encrypt(deviceKey, data) {
        return aesEncrypt(uint8ArrayToBitArray(deviceKey), data);
    }
    /**
     * Decrypts {@param encryptedData} using {@param deviceKey}.
     * @param deviceKey Key used for encryption
     * @param encryptedData Data to be decrypted.
     */
    async decrypt(deviceKey, encryptedData) {
        return aesDecrypt(uint8ArrayToBitArray(deviceKey), encryptedData);
    }
}
//# sourceMappingURL=DeviceEncryptionFacade.js.map