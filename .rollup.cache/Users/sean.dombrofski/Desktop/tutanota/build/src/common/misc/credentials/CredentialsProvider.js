import { isAdminClient, isBrowser } from "../../api/common/Env.js";
/**
 * Main entry point to interact with credentials, i.e. storing and retrieving credentials from/to persistence.
 */
export class CredentialsProvider {
    credentialsFacade;
    sqliteCipherFacade;
    interWindowEventSender;
    constructor(credentialsFacade, sqliteCipherFacade, interWindowEventSender) {
        this.credentialsFacade = credentialsFacade;
        this.sqliteCipherFacade = sqliteCipherFacade;
        this.interWindowEventSender = interWindowEventSender;
    }
    /**
     * Stores credentials. If credentials already exist for login, they will be overwritten.
     */
    async store(credentials) {
        return this.credentialsFacade.store(credentials);
    }
    /**
     * Change the encrypted password for the stored credentials.
     */
    async replacePassword(credentials, encryptedPassword, encryptedPassphraseKey) {
        const encryptedCredentials = await this.getCredentialsByUserId(credentials.userId);
        if (encryptedCredentials == null) {
            throw new Error(`Trying to replace password for credentials but credentials are not persisted: ${credentials.userId}`);
        }
        // Encrypted password is encrypted with the session key and is the same for encrypted and decrypted credentials, no additional logic is needed.
        const newEncryptedCredentials = {
            ...encryptedCredentials,
            encryptedPassword,
            encryptedPassphraseKey,
        };
        await this.credentialsFacade.storeEncrypted(newEncryptedCredentials);
    }
    async getCredentialsInfoByUserId(userId) {
        return (await this.getCredentialsByUserId(userId))?.credentialInfo ?? null;
    }
    async getAllInternalCredentials() {
        return this.credentialsFacade.loadAll();
    }
    async getCredentialsByUserId(userId) {
        const allCredentials = await this.credentialsFacade.loadAll();
        return allCredentials.find((credential) => credential.credentialInfo.userId === userId) ?? null;
    }
    /**
     * Returns the full credentials for the userId passed in.
     * @param userId
     */
    async getDecryptedCredentialsByUserId(userId) {
        return this.credentialsFacade.loadByUserId(userId);
    }
    /**
     * Returns the stored credentials infos of all internal users, i.e. users that have a "real" tutanota account and not the ones that
     * have a secure external mailbox. The returned array will be sorted by login.
     */
    async getInternalCredentialsInfos() {
        const allCredentials = await this.credentialsFacade.loadAll();
        return allCredentials
            .filter((credential) => credential.credentialInfo.type === "internal" /* CredentialType.Internal */)
            .map((credential) => credential.credentialInfo)
            .sort((a, b) => a.login.localeCompare(b.login));
    }
    /**
     * Deletes stored credentials with specified userId.
     * No-op if credentials are not there.
     * @param opts.deleteOfflineDb whether to delete offline database. Will delete by default.
     */
    async deleteByUserId(userId, opts = { deleteOfflineDb: true }) {
        await this.interWindowEventSender?.localUserDataInvalidated(userId);
        if (opts.deleteOfflineDb) {
            await this.sqliteCipherFacade?.deleteDb(userId);
        }
        await this.credentialsFacade.deleteByUserId(userId);
    }
    /**
     * Sets the credentials encryption mode, i.e. how the intermediate key used for encrypting credentials is protected.
     * @param encryptionMode
     * @throws KeyPermanentlyInvalidatedError
     * @throws CredentialAuthenticationError
     */
    async setCredentialEncryptionMode(encryptionMode) {
        await this.credentialsFacade.setCredentialEncryptionMode(encryptionMode);
        this.interWindowEventSender?.reloadDeviceConfig();
    }
    /**
     * Returns the credentials encryption mode, i.e. how the intermediate key used for encrypting credentials is protected.
     */
    getCredentialEncryptionMode() {
        return this.credentialsFacade.getCredentialEncryptionMode();
    }
    /**
     * Returns all credentials encryption modes that are supported by the device.
     */
    async getSupportedEncryptionModes() {
        return await this.credentialsFacade.getSupportedEncryptionModes();
    }
    /**
     * Removes all stored credentials as well as any settings associated with credentials encryption.
     */
    async clearCredentials(reason) {
        console.warn("clearing all stored credentials:", reason);
        await this.credentialsFacade.clear();
    }
}
export function usingKeychainAuthenticationWithOptions() {
    return !isBrowser() && !isAdminClient();
}
//# sourceMappingURL=CredentialsProvider.js.map