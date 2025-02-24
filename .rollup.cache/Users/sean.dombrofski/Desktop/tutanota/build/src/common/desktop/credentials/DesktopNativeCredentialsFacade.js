import { CredentialEncryptionMode } from "../../misc/credentials/CredentialEncryptionMode.js";
import { stringToUtf8Uint8Array, utf8Uint8ArrayToString } from "@tutao/tutanota-utils";
import { bitArrayToUint8Array, uint8ArrayToBitArray } from "@tutao/tutanota-crypto";
import { KeyPermanentlyInvalidatedError } from "../../api/common/error/KeyPermanentlyInvalidatedError.js";
import { assertDesktopEncryptionMode, assertSupportedEncryptionMode, SUPPORTED_MODES } from "./CredentialCommons.js";
/**
 * Native storage will transparently encrypt and decrypt database key and access token during load and store calls.
 */
export class DesktopNativeCredentialsFacade {
    crypto;
    credentialDb;
    keychainEncryption;
    constructor(crypto, credentialDb, keychainEncryption) {
        this.crypto = crypto;
        this.credentialDb = credentialDb;
        this.keychainEncryption = keychainEncryption;
    }
    async getSupportedEncryptionModes() {
        return SUPPORTED_MODES;
    }
    async deleteByUserId(id) {
        this.credentialDb.deleteByUserId(id);
    }
    async getCredentialEncryptionMode() {
        return this.credentialDb.getCredentialEncryptionMode();
    }
    getDesktopCredentialEncryptionMode() {
        const retVal = this.credentialDb.getCredentialEncryptionMode();
        return retVal ? CredentialEncryptionMode[retVal] : null;
    }
    async loadAll() {
        return this.credentialDb.getAllCredentials();
    }
    async loadByUserId(id) {
        const credentialsKey = await this.getCredentialsEncryptionKey();
        if (credentialsKey == null) {
            throw new KeyPermanentlyInvalidatedError("Credentials key is missing, cannot decrypt credentials");
        }
        const encryptedCredentials = this.credentialDb.getCredentialsByUserId(id);
        return encryptedCredentials ? this.decryptCredentials(encryptedCredentials, credentialsKey) : null;
    }
    decryptCredentials(persistedCredentials, credentialsKey) {
        try {
            return {
                credentialInfo: persistedCredentials.credentialInfo,
                encryptedPassword: persistedCredentials.encryptedPassword,
                accessToken: utf8Uint8ArrayToString(this.crypto.aesDecryptBytes(credentialsKey, persistedCredentials.accessToken)),
                databaseKey: persistedCredentials.databaseKey ? this.crypto.aesDecryptBytes(credentialsKey, persistedCredentials.databaseKey) : null,
                encryptedPassphraseKey: persistedCredentials.encryptedPassphraseKey,
            };
        }
        catch (e) {
            throw new KeyPermanentlyInvalidatedError("Failed AES decrypt: " + e);
        }
    }
    encryptCredentials(unencryptedCredentials, credentialsEncryptionKey) {
        return {
            credentialInfo: unencryptedCredentials.credentialInfo,
            accessToken: this.crypto.aesEncryptBytes(credentialsEncryptionKey, stringToUtf8Uint8Array(unencryptedCredentials.accessToken)),
            databaseKey: unencryptedCredentials.databaseKey ? this.crypto.aesEncryptBytes(credentialsEncryptionKey, unencryptedCredentials.databaseKey) : null,
            encryptedPassphraseKey: unencryptedCredentials.encryptedPassphraseKey,
            encryptedPassword: unencryptedCredentials.encryptedPassword,
        };
    }
    async setCredentialEncryptionMode(encryptionMode) {
        assertDesktopEncryptionMode(encryptionMode);
        const decryptedKey = await this.getOrCreateCredentialEncryptionKey();
        const encryptedKey = await this.keychainEncryption.encryptUsingKeychain(bitArrayToUint8Array(decryptedKey), encryptionMode);
        this.credentialDb.setCredentialEncryptionMode(encryptionMode);
        this.credentialDb.setCredentialEncryptionKey(encryptedKey);
    }
    async store(credentials) {
        const credentialsEncryptionKey = await this.getOrCreateCredentialEncryptionKey();
        const encryptedCredentials = this.encryptCredentials(credentials, credentialsEncryptionKey);
        return this.storeEncrypted(encryptedCredentials);
    }
    async clear() {
        this.credentialDb.deleteAllCredentials();
        this.credentialDb.setCredentialEncryptionKey(null);
        this.credentialDb.setCredentialEncryptionMode(null);
    }
    async migrateToNativeCredentials(credentials, encryptionMode, credentialsKey) {
        // store persistedCredentials, key & mode
        assertSupportedEncryptionMode(encryptionMode);
        this.credentialDb.setCredentialEncryptionMode(encryptionMode);
        this.credentialDb.setCredentialEncryptionKey(credentialsKey);
        for (const credential of credentials) {
            await this.storeEncrypted(credential);
        }
    }
    async storeEncrypted(credentials) {
        this.credentialDb.store(credentials);
    }
    async getOrCreateCredentialEncryptionKey() {
        const existingKey = await this.getCredentialsEncryptionKey();
        if (existingKey != null) {
            return existingKey;
        }
        else {
            const encryptionMode = this.getDesktopCredentialEncryptionMode() ?? CredentialEncryptionMode.DEVICE_LOCK;
            const newKey = bitArrayToUint8Array(this.crypto.generateDeviceKey());
            const encryptedKey = await this.keychainEncryption.encryptUsingKeychain(newKey, encryptionMode);
            this.credentialDb.setCredentialEncryptionKey(encryptedKey);
            return uint8ArrayToBitArray(newKey);
        }
    }
    async getCredentialsEncryptionKey() {
        const encryptionMode = this.getDesktopCredentialEncryptionMode() ?? CredentialEncryptionMode.DEVICE_LOCK;
        const keyChainEncCredentialsKey = this.credentialDb.getCredentialEncryptionKey();
        if (keyChainEncCredentialsKey != null) {
            const credentialsKey = await this.keychainEncryption.decryptUsingKeychain(keyChainEncCredentialsKey, encryptionMode);
            return uint8ArrayToBitArray(credentialsKey);
        }
        else {
            return null;
        }
    }
}
//# sourceMappingURL=DesktopNativeCredentialsFacade.js.map