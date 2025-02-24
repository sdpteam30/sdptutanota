import { assertNotNull, concat } from "@tutao/tutanota-utils";
import { bitArrayToUint8Array, KeyPairType } from "@tutao/tutanota-crypto";
import { assertWorkerOrNode } from "../../common/Env.js";
assertWorkerOrNode();
/**
 * Purpose: prove to admins that the new User Group Key is authentic.
 * By deriving this key from the current User Group Key, the admin knows that it was created by someone who had access to this key,
 * that is, either the user or another admin.
 */
const userGroupKeyAuthenticationSystem = {
    deriveKey({ bindingData: { userGroupId, adminGroupId, newAdminGroupKeyVersion, newUserGroupKeyVersion, currentUserGroupKeyVersion }, sourceOfTrust }, cryptoWrapper) {
        return cryptoWrapper.deriveKeyWithHkdf({
            salt: `adminGroup: ${adminGroupId}, userGroup: ${userGroupId}, currentUserGroupKeyVersion: ${currentUserGroupKeyVersion}, newAdminGroupKeyVersion: ${newAdminGroupKeyVersion}, newUserGroupKeyVersion: ${newUserGroupKeyVersion}`,
            key: sourceOfTrust.currentUserGroupKey,
            context: "newUserGroupKeyAuthKeyForRotationAsNonAdminUser",
        });
    },
    generateAuthenticationData({ untrustedKey: { newUserGroupKey } }) {
        return bitArrayToUint8Array(newUserGroupKey);
    },
};
/**
 * Purpose: prove to users that the new Admin Group Public Key is authentic.
 * By deriving this key from the current User Group Key, the user knows that it was created either by someone who had access to this key,
 * that is, either themselves or an admin.
 */
const newAdminPubKeyAuthenticationSystem = {
    deriveKey({ bindingData: { userGroupId, adminGroupId, newAdminGroupKeyVersion, currentReceivingUserGroupKeyVersion }, sourceOfTrust }, cryptoWrapper) {
        return cryptoWrapper.deriveKeyWithHkdf({
            salt: `adminGroup: ${adminGroupId}, userGroup: ${userGroupId}, currentUserGroupKeyVersion: ${currentReceivingUserGroupKeyVersion}, newAdminGroupKeyVersion: ${newAdminGroupKeyVersion}`,
            key: sourceOfTrust.receivingUserGroupKey,
            context: "newAdminPubKeyAuthKeyForUserGroupKeyRotation",
        });
    },
    generateAuthenticationData({ untrustedKey: { newAdminPubKey: { eccPublicKey, kyberPublicKey }, }, }) {
        return concat(eccPublicKey, kyberPublicKey.raw);
    },
};
/**
 * Purpose: prove to other admins that the Distribution Public Key is authentic.
 * By deriving this key from the current Admin Group Key, the admin knows that it was created by someone who had access to this key,
 * that is, either themselves or another admin.
 */
const pubDistKeyAuthenticationSystem = {
    deriveKey({ bindingData: { adminGroupId, userGroupId, currentUserGroupKeyVersion, currentAdminGroupKeyVersion }, sourceOfTrust }, cryptoWrapper) {
        return cryptoWrapper.deriveKeyWithHkdf({
            salt: `adminGroup: ${adminGroupId}, userGroup: ${userGroupId}, currentUserGroupKeyVersion: ${currentUserGroupKeyVersion}, currentAdminGroupKeyVersion: ${currentAdminGroupKeyVersion}`,
            key: sourceOfTrust.currentAdminGroupKey,
            context: "adminGroupDistKeyPairAuthKeyForMultiAdminRotation",
        });
    },
    generateAuthenticationData({ untrustedKey: { distPubKey: { eccPublicKey, kyberPublicKey }, }, }) {
        return concat(eccPublicKey, kyberPublicKey.raw);
    },
};
/**
 * Purpose: prove to other admins that the new Admin Group Symmetric Key is authentic.
 * By deriving this key from the current User Group Key, the admin user knows that it was created either by someone who had access to this key,
 * that is, either themselves or another admin.
 */
const adminSymKeyAuthenticationSystem = {
    deriveKey({ bindingData: { adminGroupId, userGroupId, newAdminGroupKeyVersion, currentReceivingUserGroupKeyVersion }, sourceOfTrust }, cryptoWrapper) {
        return cryptoWrapper.deriveKeyWithHkdf({
            salt: `adminGroup: ${adminGroupId}, userGroup: ${userGroupId}, currentUserGroupKeyVersion: ${currentReceivingUserGroupKeyVersion}, newAdminGroupKeyVersion: ${newAdminGroupKeyVersion}`,
            key: sourceOfTrust.currentReceivingUserGroupKey,
            context: "newAdminSymKeyAuthKeyForMultiAdminRotationAsUser",
        });
    },
    generateAuthenticationData({ untrustedKey: { newAdminGroupKey } }) {
        return bitArrayToUint8Array(newAdminGroupKey);
    },
};
const systemMap = {
    USER_GROUP_KEY_TAG: userGroupKeyAuthenticationSystem,
    NEW_ADMIN_PUB_KEY_TAG: newAdminPubKeyAuthenticationSystem,
    PUB_DIST_KEY_TAG: pubDistKeyAuthenticationSystem,
    ADMIN_SYM_KEY_TAG: adminSymKeyAuthenticationSystem,
};
/**
 * Authenticates keys by deriving trust in another key using a Message Authentication Code (MAC tag).
 */
export class KeyAuthenticationFacade {
    cryptoWrapper;
    constructor(cryptoWrapper) {
        this.cryptoWrapper = cryptoWrapper;
    }
    /**
     * Computes a MAC tag using an existing key authentication system.
     * @param keyAuthenticationParams Parameters for the chosen key authentication system, containing trusted key, key to be verified, and binding data
     */
    computeTag(keyAuthenticationParams) {
        const keyAuthenticationSystem = systemMap[keyAuthenticationParams.tagType];
        const authKey = keyAuthenticationSystem.deriveKey(keyAuthenticationParams, this.cryptoWrapper);
        const authData = keyAuthenticationSystem.generateAuthenticationData(keyAuthenticationParams);
        return this.cryptoWrapper.hmacSha256(authKey, authData);
    }
    /**
     * Verifies a MAC tag using an existing key authentication system.
     * @param keyAuthenticationParams Parameters for the chosen key authentication system, containing trusted key, key to be verified, and binding data
     * @param tag The MAC tag to be verified. Must be a branded MacTag, which you can get with brandKeyMac() in most cases
     */
    verifyTag(keyAuthenticationParams, tag) {
        const keyAuthenticationSystem = systemMap[keyAuthenticationParams.tagType];
        const authKey = keyAuthenticationSystem.deriveKey(keyAuthenticationParams, this.cryptoWrapper);
        const authData = keyAuthenticationSystem.generateAuthenticationData(keyAuthenticationParams);
        this.cryptoWrapper.verifyHmacSha256(authKey, authData, tag);
    }
}
/**
 * Brands a KeyMac so that it has a branded MacTag, which can be used in authentication methods.
 */
export function brandKeyMac(keyMac) {
    return keyMac;
}
/**
 * Converts some form of public PQ keys to the PQPublicKeys type. Assumes pubEccKey and pubKyberKey exist.
 * @param kp
 */
export function asPQPublicKeys(kp) {
    return {
        keyPairType: KeyPairType.TUTA_CRYPT,
        eccPublicKey: assertNotNull(kp.pubEccKey),
        kyberPublicKey: {
            raw: assertNotNull(kp.pubKyberKey),
        },
    };
}
//# sourceMappingURL=KeyAuthenticationFacade.js.map