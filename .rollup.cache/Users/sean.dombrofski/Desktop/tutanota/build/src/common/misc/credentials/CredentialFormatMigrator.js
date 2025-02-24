import { Dialog } from "../../gui/base/Dialog.js";
import { base64ToUint8Array, mapNullable } from "@tutao/tutanota-utils";
import { CredentialEncryptionMode } from "./CredentialEncryptionMode.js";
import { lang } from "../LanguageViewModel.js";
function credentialEncryptionModeToAppLockMethod(mode) {
    switch (mode) {
        case CredentialEncryptionMode.APP_PASSWORD:
        case CredentialEncryptionMode.DEVICE_LOCK:
            return "0" /* AppLockMethod.None */;
        case CredentialEncryptionMode.BIOMETRICS:
            return "2" /* AppLockMethod.Biometrics */;
        case CredentialEncryptionMode.SYSTEM_PASSWORD:
            return "1" /* AppLockMethod.SystemPassOrBiometrics */;
    }
}
export class CredentialFormatMigrator {
    deviceConfig;
    nativeCredentialFacade;
    mobileSystemFacade;
    constructor(deviceConfig, nativeCredentialFacade, mobileSystemFacade) {
        this.deviceConfig = deviceConfig;
        this.nativeCredentialFacade = nativeCredentialFacade;
        this.mobileSystemFacade = mobileSystemFacade;
    }
    async migrate() {
        try {
            await this.migrateToNativeCredentials();
        }
        catch (e) {
            console.error(e);
            await Dialog.message(lang.makeTranslation("confirm_msg", "Could not migrate credentials"), `${e.name} ${e.message}
${e.stack}`).then(() => this.migrate());
        }
    }
    /**
     * Migrate existing credentials to native db if the migration haven't happened once. Also generate database key if missing.
     */
    async migrateToNativeCredentials() {
        if (this.nativeCredentialFacade != null && !this.deviceConfig.getIsCredentialsMigratedToNative()) {
            console.log("Migrating credentials to native");
            const allPersistedCredentials = this.deviceConfig.getCredentials().map(deviceConfigCredentialsToPersisted);
            const encryptionMode = await this.deviceConfig.getCredentialEncryptionMode();
            const credentialsKey = await this.deviceConfig.getCredentialsEncryptionKey();
            if (encryptionMode != null && credentialsKey != null) {
                if (this.mobileSystemFacade != null) {
                    await this.mobileSystemFacade.setAppLockMethod(credentialEncryptionModeToAppLockMethod(encryptionMode));
                }
                console.log("migrating credentials", allPersistedCredentials);
                await this.nativeCredentialFacade.migrateToNativeCredentials(allPersistedCredentials, encryptionMode, credentialsKey);
            }
            else {
                console.log("Skipping migration as encryption data is not there");
            }
            console.log("Stored credentials in native");
            await this.deviceConfig.clearCredentialsData();
            console.log("Cleared credentials in deviceConfig");
            this.deviceConfig.setIsCredentialsMigratedToNative(true);
        }
    }
}
function deviceConfigCredentialsToPersisted(deviceConfigCredentials) {
    return {
        credentialInfo: deviceConfigCredentials.credentialInfo,
        encryptedPassword: deviceConfigCredentials.encryptedPassword,
        encryptedPassphraseKey: mapNullable(deviceConfigCredentials.encryptedPassphraseKey, base64ToUint8Array),
        accessToken: base64ToUint8Array(deviceConfigCredentials.accessToken),
        databaseKey: mapNullable(deviceConfigCredentials.databaseKey, base64ToUint8Array),
    };
}
//# sourceMappingURL=CredentialFormatMigrator.js.map