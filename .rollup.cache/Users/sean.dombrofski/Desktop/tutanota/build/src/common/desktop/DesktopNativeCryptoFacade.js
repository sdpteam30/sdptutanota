import { base64ToBase64Url, base64ToUint8Array, stringToUtf8Uint8Array, uint8ArrayToBase64, utf8Uint8ArrayToString } from "@tutao/tutanota-utils";
import { bitArrayToUint8Array, generateKeyFromPassphraseArgon2id, uint8ArrayToKey } from "@tutao/tutanota-crypto";
import path from "node:path";
import { nonClobberingFilename } from "./PathUtils.js";
export class DesktopNativeCryptoFacade {
    fs;
    cryptoFns;
    tfs;
    argon2;
    constructor(fs, cryptoFns, tfs, argon2) {
        this.fs = fs;
        this.cryptoFns = cryptoFns;
        this.tfs = tfs;
        this.argon2 = argon2;
    }
    aesEncryptObject(encryptionKey, object) {
        const serializedObject = JSON.stringify(object);
        const encryptedBytes = this.cryptoFns.aesEncrypt(encryptionKey, stringToUtf8Uint8Array(serializedObject));
        return uint8ArrayToBase64(encryptedBytes);
    }
    aesDecryptObject(encryptionKey, serializedObject) {
        const encryptedBytes = base64ToUint8Array(serializedObject);
        const decryptedBytes = this.cryptoFns.aesDecrypt(encryptionKey, encryptedBytes, true);
        const stringObject = utf8Uint8ArrayToString(decryptedBytes);
        return JSON.parse(stringObject);
    }
    async aesEncryptFile(key, fileUri) {
        // at the moment, this is randomized if the file to be encrypted
        // was created with FileFacade.writeDataFile.
        // to make it safe in all conditions, we should re-generate a random file name.
        // we're also not checking if the file to be encrypted is actually located in
        // the temp scratch space
        const bytes = await this.fs.promises.readFile(fileUri);
        const keyBits = this.cryptoFns.bytesToKey(key);
        const encrypted = this.cryptoFns.aesEncrypt(keyBits, bytes);
        const targetDir = await this.tfs.ensureEncryptedDir();
        const writtenFileName = path.basename(fileUri);
        const filePath = path.join(targetDir, writtenFileName);
        await this.fs.promises.writeFile(filePath, encrypted);
        return {
            uri: filePath,
            unencryptedSize: bytes.length,
        };
    }
    /**
     * decrypts a file and returns the decrypted files path
     */
    async aesDecryptFile(key, encryptedFileUri) {
        const targetDir = await this.tfs.ensureUnencrytpedDir();
        const encData = await this.fs.promises.readFile(encryptedFileUri);
        const bitKey = this.cryptoFns.bytesToKey(key);
        const decData = this.cryptoFns.aesDecrypt(bitKey, encData, true);
        const filesInDirectory = await this.fs.promises.readdir(targetDir);
        // since we're working purely in scratch space until putFileIntoDownloadsFolder
        // is called, we could re-generate a random name here.
        const writtenFileName = path.basename(encryptedFileUri);
        const newFilename = nonClobberingFilename(filesInDirectory, writtenFileName);
        const decryptedFileUri = path.join(targetDir, newFilename);
        await this.fs.promises.writeFile(decryptedFileUri, decData, {
            encoding: "binary",
        });
        return decryptedFileUri;
    }
    unauthenticatedAes256DecryptKey(encryptionKey, keyToDecrypt) {
        return this.cryptoFns.unauthenticatedAesDecrypt(encryptionKey, keyToDecrypt, false);
    }
    aes256EncryptKey(encryptionKey, keyToEncrypt) {
        return this.cryptoFns.aesEncrypt(encryptionKey, keyToEncrypt, undefined, false);
    }
    aesDecryptBytes(encryptionKey, data) {
        return this.cryptoFns.aesDecrypt(encryptionKey, data, true);
    }
    aesEncryptBytes(encryptionKey, data) {
        return this.cryptoFns.aesEncrypt(encryptionKey, data, undefined, true, true);
    }
    decryptAndMapToInstance(model, instance, piSessionKey, piSessionKeyEncSessionKey) {
        const sk = this.cryptoFns.decryptKey(uint8ArrayToKey(piSessionKey), piSessionKeyEncSessionKey);
        return this.cryptoFns.decryptAndMapToInstance(model, instance, sk);
    }
    generateId(byteLength) {
        return base64ToBase64Url(uint8ArrayToBase64(this.cryptoFns.randomBytes(byteLength)));
    }
    verifySignature(pem, data, sig) {
        return this.cryptoFns.verifySignature(pem, data, sig);
    }
    generateDeviceKey() {
        return this.cryptoFns.aes256RandomKey();
    }
    randomBytes(count) {
        return this.cryptoFns.randomBytes(count);
    }
    async rsaDecrypt(privateKey, data) {
        throw new Error("not implemented for this platform");
    }
    async rsaEncrypt(publicKey, data, seed) {
        throw new Error("not implemented for this platform");
    }
    async argon2idGeneratePassphraseKey(passphrase, salt) {
        const hash = await generateKeyFromPassphraseArgon2id(await this.argon2, passphrase, salt);
        return bitArrayToUint8Array(hash);
    }
    generateKyberKeypair(seed) {
        throw new Error("not implemented for this platform");
    }
    kyberEncapsulate(publicKey, seed) {
        throw new Error("not implemented for this platform");
    }
    kyberDecapsulate(privateKey, ciphertext) {
        throw new Error("not implemented for this platform");
    }
}
//# sourceMappingURL=DesktopNativeCryptoFacade.js.map