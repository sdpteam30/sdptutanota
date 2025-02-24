import { aes256RandomKey, aesDecrypt, aesEncrypt, bytesToKyberPublicKey, decryptKey, decryptKeyPair, ENABLE_MAC, encryptEccKey, encryptKey, encryptKyberKey, generateEccKeyPair, hkdf, hmacSha256, IV_BYTE_LENGTH, KEY_LENGTH_BYTES_AES_256, keyToUint8Array, kyberPublicKeyToBytes, random, sha256Hash, uint8ArrayToKey, verifyHmacSha256, } from "@tutao/tutanota-crypto";
import { stringToUtf8Uint8Array } from "@tutao/tutanota-utils";
/**
 * This class is useful to bundle all the crypto primitives and make the code testable without using the real crypto implementations.
 */
export class CryptoWrapper {
    aes256RandomKey() {
        return aes256RandomKey();
    }
    aesDecrypt(key, encryptedBytes, usePadding) {
        return aesDecrypt(key, encryptedBytes, usePadding);
    }
    aesEncrypt(key, bytes, iv, usePadding, useMac) {
        return aesEncrypt(key, bytes, iv, usePadding, useMac);
    }
    decryptKey(encryptionKey, key) {
        return decryptKey(encryptionKey, key);
    }
    encryptEccKey(encryptionKey, privateKey) {
        return encryptEccKey(encryptionKey, privateKey);
    }
    encryptKey(encryptingKey, keyToBeEncrypted) {
        return encryptKey(encryptingKey, keyToBeEncrypted);
    }
    encryptKeyWithVersionedKey(encryptingKey, key) {
        return encryptKeyWithVersionedKey(encryptingKey, key);
    }
    generateEccKeyPair() {
        return generateEccKeyPair();
    }
    encryptKyberKey(encryptionKey, privateKey) {
        return encryptKyberKey(encryptionKey, privateKey);
    }
    kyberPublicKeyToBytes(kyberPublicKey) {
        return kyberPublicKeyToBytes(kyberPublicKey);
    }
    bytesToKyberPublicKey(encodedPublicKey) {
        return bytesToKyberPublicKey(encodedPublicKey);
    }
    encryptBytes(sk, value) {
        return encryptBytes(sk, value);
    }
    encryptString(sk, value) {
        return encryptString(sk, value);
    }
    decryptKeyPair(encryptionKey, keyPair) {
        return decryptKeyPair(encryptionKey, keyPair);
    }
    sha256Hash(data) {
        return sha256Hash(data);
    }
    deriveKeyWithHkdf({ key, salt, context }) {
        return deriveKey({
            salt,
            key,
            info: context,
            length: KEY_LENGTH_BYTES_AES_256,
        });
    }
    hmacSha256(key, data) {
        return hmacSha256(key, data);
    }
    verifyHmacSha256(key, data, tag) {
        return verifyHmacSha256(key, data, tag);
    }
}
function deriveKey({ salt, key, info, length }) {
    return uint8ArrayToKey(hkdf(sha256Hash(stringToUtf8Uint8Array(salt)), keyToUint8Array(key), stringToUtf8Uint8Array(info), length));
}
export function encryptBytes(sk, value) {
    return aesEncrypt(sk, value, random.generateRandomData(IV_BYTE_LENGTH), true, ENABLE_MAC);
}
export function encryptString(sk, value) {
    return aesEncrypt(sk, stringToUtf8Uint8Array(value), random.generateRandomData(IV_BYTE_LENGTH), true, ENABLE_MAC);
}
/**
 * Encrypts the key with the encryptingKey and return the encrypted key and the version of the encryptingKey.
 * @param encryptingKey the encrypting key.
 * @param key the key to be encrypted.
 */
export function encryptKeyWithVersionedKey(encryptingKey, key) {
    return {
        encryptingKeyVersion: encryptingKey.version,
        key: encryptKey(encryptingKey.object, key),
    };
}
//# sourceMappingURL=CryptoWrapper.js.map