import { asKdfType } from "../../../common/TutanotaConstants.js";
import { createRecoverCode, RecoverCodeTypeRef } from "../../../entities/sys/TypeRefs.js";
import { assertNotNull, uint8ArrayToHex } from "@tutao/tutanota-utils";
import { assertWorkerOrNode } from "../../../common/Env.js";
import { aes256RandomKey, bitArrayToUint8Array, createAuthVerifier, createAuthVerifierAsBase64Url, decryptKey, encryptKey, } from "@tutao/tutanota-crypto";
import { parseKeyVersion } from "../KeyLoaderFacade.js";
assertWorkerOrNode();
/**
 * Facade to create, encrypt and show the recovery code.
 */
export class RecoverCodeFacade {
    userFacade;
    entityClient;
    loginFacade;
    keyLoaderFacade;
    constructor(userFacade, entityClient, loginFacade, keyLoaderFacade) {
        this.userFacade = userFacade;
        this.entityClient = entityClient;
        this.loginFacade = loginFacade;
        this.keyLoaderFacade = keyLoaderFacade;
    }
    generateRecoveryCode(currentUserGroupKey) {
        const recoveryCode = aes256RandomKey();
        return this.encryptRecoveryCode(recoveryCode, currentUserGroupKey);
    }
    encryptRecoveryCode(recoveryCode, currentUserGroupKey) {
        const userEncRecoverCode = encryptKey(currentUserGroupKey.object, recoveryCode);
        const recoverCodeEncUserGroupKey = encryptKey(recoveryCode, currentUserGroupKey.object);
        const recoveryCodeVerifier = createAuthVerifier(recoveryCode);
        return {
            userEncRecoverCode,
            userKeyVersion: currentUserGroupKey.version,
            recoverCodeEncUserGroupKey,
            hexCode: uint8ArrayToHex(bitArrayToUint8Array(recoveryCode)),
            recoveryCodeVerifier,
        };
    }
    async getRecoverCodeHex(passphrase) {
        const user = this.userFacade.getLoggedInUser();
        const passphraseKey = await this.getPassphraseKey(user, passphrase);
        const rawRecoverCode = await this.getRawRecoverCode(passphraseKey);
        return uint8ArrayToHex(bitArrayToUint8Array(rawRecoverCode));
    }
    async getRawRecoverCode(passphraseKey) {
        const user = this.userFacade.getLoggedInUser();
        const recoverCodeId = user.auth?.recoverCode;
        if (recoverCodeId == null) {
            throw new Error("Auth is missing");
        }
        const extraHeaders = {
            authVerifier: createAuthVerifierAsBase64Url(passphraseKey),
        };
        const recoveryCodeEntity = await this.entityClient.load(RecoverCodeTypeRef, recoverCodeId, { extraHeaders });
        const userGroupKey = await this.keyLoaderFacade.loadSymUserGroupKey(parseKeyVersion(recoveryCodeEntity.userKeyVersion));
        return decryptKey(userGroupKey, recoveryCodeEntity.userEncRecoverCode);
    }
    async getPassphraseKey(user, passphrase) {
        const passphraseKeyData = {
            kdfType: asKdfType(user.kdfVersion),
            passphrase,
            salt: assertNotNull(user.salt),
        };
        return await this.loginFacade.deriveUserPassphraseKey(passphraseKeyData);
    }
    async createRecoveryCode(passphrase) {
        const user = this.userFacade.getUser();
        if (user == null || user.auth == null) {
            throw new Error("Invalid state: no user or no user.auth");
        }
        const { userEncRecoverCode, userKeyVersion, recoverCodeEncUserGroupKey, hexCode, recoveryCodeVerifier } = this.generateRecoveryCode(this.userFacade.getCurrentUserGroupKey());
        const recoverPasswordEntity = createRecoverCode({
            userEncRecoverCode: userEncRecoverCode,
            userKeyVersion: String(userKeyVersion),
            recoverCodeEncUserGroupKey: recoverCodeEncUserGroupKey,
            _ownerGroup: this.userFacade.getUserGroupId(),
            verifier: recoveryCodeVerifier,
        });
        const passphraseKeyData = {
            kdfType: asKdfType(user.kdfVersion),
            passphrase,
            salt: assertNotNull(user.salt),
        };
        const pwKey = await this.loginFacade.deriveUserPassphraseKey(passphraseKeyData);
        const authVerifier = createAuthVerifierAsBase64Url(pwKey);
        await this.entityClient.setup(null, recoverPasswordEntity, {
            authVerifier,
        });
        return hexCode;
    }
}
//# sourceMappingURL=RecoverCodeFacade.js.map