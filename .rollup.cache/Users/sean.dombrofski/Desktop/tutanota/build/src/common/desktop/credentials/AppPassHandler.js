import { CredentialEncryptionMode } from "../../misc/credentials/CredentialEncryptionMode.js";
import { DesktopConfigKey } from "../config/ConfigKeys.js";
import { generateKeyFromPassphraseArgon2id, KEY_LENGTH_BYTES_AES_256 } from "@tutao/tutanota-crypto";
import { base64ToUint8Array, uint8ArrayToBase64 } from "@tutao/tutanota-utils";
import { KeyPermanentlyInvalidatedError } from "../../api/common/error/KeyPermanentlyInvalidatedError.js";
import { CryptoError } from "@tutao/tutanota-crypto/error.js";
import { CancelledError } from "../../api/common/error/CancelledError.js";
export class AppPassHandler {
    crypto;
    conf;
    argon2idFacade;
    lang;
    getCurrentCommonNativeFacade;
    constructor(crypto, conf, argon2idFacade, lang, getCurrentCommonNativeFacade) {
        this.crypto = crypto;
        this.conf = conf;
        this.argon2idFacade = argon2idFacade;
        this.lang = lang;
        this.getCurrentCommonNativeFacade = getCurrentCommonNativeFacade;
    }
    async addAppPassWrapper(dataWithoutAppPassWrapper, encryptionMode) {
        if (encryptionMode === CredentialEncryptionMode.APP_PASSWORD) {
            const appPassKey = (await this.deriveKeyFromAppPass()) ?? (await this.enrollForAppPass());
            return this.crypto.aesEncryptBytes(appPassKey, dataWithoutAppPassWrapper);
        }
        else {
            // our mode is not app Pass, so the app Pass salt should not be set
            await this.conf.setVar(DesktopConfigKey.appPassSalt, null);
            return dataWithoutAppPassWrapper;
        }
    }
    async removeAppPassWrapper(dataWithAppPassWrapper, encryptionMode) {
        // our mode is not app Pass, so there is no wrapper to remove
        if (encryptionMode !== CredentialEncryptionMode.APP_PASSWORD)
            return dataWithAppPassWrapper;
        const appPassKey = await this.deriveKeyFromAppPass();
        if (appPassKey == null)
            throw new KeyPermanentlyInvalidatedError("can't remove app pass wrapper without salt");
        try {
            return this.crypto.aesDecryptBytes(appPassKey, dataWithAppPassWrapper);
        }
        catch (e) {
            if (e instanceof CryptoError) {
                const nativeFacade = await this.getCurrentCommonNativeFacade();
                //noinspection ES6MissingAwait
                nativeFacade.showAlertDialog("invalidPassword_msg");
                throw new CancelledError("app Pass verification failed");
            }
            else {
                throw e;
            }
        }
    }
    /**
     * if there is a salt stored, use it and a password prompt to derive the app Pass key.
     * if there isn't, ask for a new password, generate a salt & store it, then derive the key.
     * @return the derived 256-bit key or null if none is found
     */
    async deriveKeyFromAppPass() {
        const storedAppPassSaltB64 = await this.conf.getVar(DesktopConfigKey.appPassSalt);
        if (storedAppPassSaltB64 == null)
            return null;
        const commonNativeFacade = await this.getCurrentCommonNativeFacade();
        const pw = await this.tryWhileSaltNotChanged(commonNativeFacade.promptForPassword(this.lang.get("credentialsEncryptionModeAppPassword_label")));
        const salt = base64ToUint8Array(storedAppPassSaltB64);
        return generateKeyFromPassphraseArgon2id(await this.argon2idFacade, pw, salt);
    }
    async enrollForAppPass() {
        const newSalt = this.crypto.randomBytes(KEY_LENGTH_BYTES_AES_256);
        const commonNativeFacade = await this.getCurrentCommonNativeFacade();
        const newPw = await this.tryWhileSaltNotChanged(commonNativeFacade.promptForNewPassword(this.lang.get("credentialsEncryptionModeAppPassword_label"), null));
        const newAppPassSaltB64 = uint8ArrayToBase64(newSalt);
        await this.conf.setVar(DesktopConfigKey.appPassSalt, newAppPassSaltB64);
        return generateKeyFromPassphraseArgon2id(await this.argon2idFacade, newPw, newSalt);
    }
    async tryWhileSaltNotChanged(pwPromise) {
        const commonNativeFacade = await this.getCurrentCommonNativeFacade();
        return resolveChecked(pwPromise, new Promise((_, reject) => this.conf.once(DesktopConfigKey.appPassSalt, () => {
            reject(new CancelledError("salt changed during pw prompt"));
        })), () => commonNativeFacade.showAlertDialog("retry_action"));
    }
}
/**
 * resolve a promise, but inject another action if whileNot did reject in the meantime.
 * if whileNot did reject, the returned promise will reject as well.
 */
export async function resolveChecked(promise, whileNotRejected, otherWiseAlso) {
    let cancelled = false;
    return await Promise.race([
        promise.then((value) => {
            if (cancelled)
                otherWiseAlso();
            return value;
        }),
        whileNotRejected.catch((e) => {
            cancelled = true;
            throw e;
        }),
    ]);
}
//# sourceMappingURL=AppPassHandler.js.map