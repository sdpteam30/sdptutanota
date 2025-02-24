/**
 * This is a wrapper for commonly used crypto functions, easier to inject/swap implementations and test.
 */
import crypto from "node:crypto";
import { InstanceMapper } from "../api/worker/crypto/InstanceMapper";
import { aes256RandomKey, aesDecrypt, aesEncrypt, base64ToKey, decryptKey, random, uint8ArrayToKey, unauthenticatedAesDecrypt, } from "@tutao/tutanota-crypto";
// the prng throws if it doesn't have enough entropy
// it may be called very early, so we need to seed it
// we do it here because it's the first place in the dep. chain that knows it's
// in node but the last one that knows the prng implementation
const seed = () => {
    const entropy = crypto.randomBytes(128);
    random
        .addEntropy([
        {
            source: "random",
            entropy: 128 * 8,
            data: Array.from(entropy),
        },
    ])
        .then();
};
seed();
const mapper = new InstanceMapper();
export const cryptoFns = {
    aesEncrypt(key, bytes, iv, usePadding, useMac) {
        return aesEncrypt(key, bytes, iv, usePadding, useMac);
    },
    aesDecrypt(key, encryptedBytes, usePadding) {
        return aesDecrypt(key, encryptedBytes, usePadding);
    },
    unauthenticatedAesDecrypt(key, encryptedBytes, usePadding) {
        return unauthenticatedAesDecrypt(key, encryptedBytes, usePadding);
    },
    decryptKey(encryptionKey, key) {
        return decryptKey(encryptionKey, key);
    },
    bytesToKey(bytes) {
        return uint8ArrayToKey(bytes);
    },
    base64ToKey(base64) {
        return base64ToKey(base64);
    },
    /**
     * verify a signature of some data with a given PEM-encoded spki public key
     */
    verifySignature(pem, data, signature) {
        return crypto.verify("SHA512", data, pem, signature);
    },
    randomBytes(nbrOfBytes) {
        try {
            // may fail if the entropy pools are exhausted
            return random.generateRandomData(nbrOfBytes);
        }
        catch (e) {
            seed();
            return random.generateRandomData(nbrOfBytes);
        }
    },
    aes256RandomKey() {
        return aes256RandomKey();
    },
    decryptAndMapToInstance(model, instance, sk) {
        return mapper.decryptAndMapToInstance(model, instance, sk);
    },
};
//# sourceMappingURL=CryptoFns.js.map