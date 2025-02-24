import { GroupType } from "../../common/TutanotaConstants";
import { decryptKey } from "@tutao/tutanota-crypto";
import { assertNotNull } from "@tutao/tutanota-utils";
import { ProgrammingError } from "../../common/error/ProgrammingError";
import { createWebsocketLeaderStatus } from "../../entities/sys/TypeRefs";
import { LoginIncompleteError } from "../../common/error/LoginIncompleteError";
import { isSameId } from "../../common/utils/EntityUtils.js";
import { CryptoError } from "@tutao/tutanota-crypto/error.js";
import { checkKeyVersionConstraints, parseKeyVersion } from "./KeyLoaderFacade.js";
/** Holder for the user and session-related data on the worker side. */
export class UserFacade {
    keyCache;
    cryptoWrapper;
    user = null;
    accessToken = null;
    leaderStatus;
    constructor(keyCache, cryptoWrapper) {
        this.keyCache = keyCache;
        this.cryptoWrapper = cryptoWrapper;
        this.reset();
    }
    // Login process is somehow multi-step, and we don't use a separate network stack for it. So we have to break up setters.
    // 1. We need to download user. For that we need to set access token already (to authenticate the request for the server as it is passed in headers).
    // 2. We need to get group keys. For that we need to unlock userGroupKey with userPassphraseKey
    // so this leads to this steps in UserFacade:
    // 1. Access token is set
    // 2. User is set
    // 3. UserGroupKey is unlocked
    setAccessToken(accessToken) {
        this.accessToken = accessToken;
    }
    getAccessToken() {
        return this.accessToken;
    }
    setUser(user) {
        if (this.accessToken == null) {
            throw new ProgrammingError("invalid state: no access token");
        }
        this.user = user;
    }
    unlockUserGroupKey(userPassphraseKey) {
        if (this.user == null) {
            throw new ProgrammingError("Invalid state: no user");
        }
        const userGroupMembership = this.user.userGroup;
        const currentUserGroupKey = {
            version: parseKeyVersion(userGroupMembership.groupKeyVersion),
            object: decryptKey(userPassphraseKey, userGroupMembership.symEncGKey),
        };
        this.keyCache.setCurrentUserGroupKey(currentUserGroupKey);
        this.setUserDistKey(currentUserGroupKey.version, userPassphraseKey);
    }
    setUserDistKey(currentUserGroupKeyVersion, userPassphraseKey) {
        if (this.user == null) {
            throw new ProgrammingError("Invalid state: no user");
        }
        // Why this magic + 1? Because we don't have access to the new version number when calling this function so we compute it from the current one
        const newUserGroupKeyVersion = checkKeyVersionConstraints(currentUserGroupKeyVersion + 1);
        const userGroupMembership = this.user.userGroup;
        const legacyUserDistKey = this.deriveLegacyUserDistKey(userGroupMembership.group, userPassphraseKey);
        const userDistKey = this.deriveUserDistKey(userGroupMembership.group, newUserGroupKeyVersion, userPassphraseKey);
        this.keyCache.setLegacyUserDistKey(legacyUserDistKey);
        this.keyCache.setUserDistKey(userDistKey);
    }
    /**
     * Derives a distribution key from the password key to share the new user group key of the user to their other clients (apps, web etc)
     * This is a fallback function that gets called when the output key of `deriveUserDistKey` fails to decrypt the new user group key
     * @deprecated
     * @param userGroupId user group id of the logged in user
     * @param userPasswordKey current password key of the user
     */
    deriveLegacyUserDistKey(userGroupId, userPasswordKey) {
        // we prepare a key to encrypt potential user group key rotations with
        // when passwords are changed clients are logged-out of other sessions
        // this key is only needed by the logged-in clients, so it should be reliable enough to assume that userPassphraseKey is in sync
        // we bind this to userGroupId and the domain separator userGroupKeyDistributionKey from crypto package
        // the hkdf salt does not have to be secret but should be unique per user and carry some additional entropy which sha256 ensures
        return this.cryptoWrapper.deriveKeyWithHkdf({
            salt: userGroupId,
            key: userPasswordKey,
            context: "userGroupKeyDistributionKey",
        });
    }
    /**
     * Derives a distribution to share the new user group key of the user to their other clients (apps, web etc)
     * @param userGroupId user group id of the logged in user
     * @param newUserGroupKeyVersion the new user group key version
     * @param userPasswordKey current password key of the user
     */
    deriveUserDistKey(userGroupId, newUserGroupKeyVersion, userPasswordKey) {
        return this.cryptoWrapper.deriveKeyWithHkdf({
            salt: `userGroup: ${userGroupId}, newUserGroupKeyVersion: ${newUserGroupKeyVersion}`,
            key: userPasswordKey,
            // Formerly,this was not bound to the user group key version.
            context: "versionedUserGroupKeyDistributionKey",
        });
    }
    async updateUser(user) {
        if (this.user == null) {
            throw new ProgrammingError("Update user is called without logging in. This function is not for you.");
        }
        this.user = user;
        await this.keyCache.removeOutdatedGroupKeys(user);
    }
    getUser() {
        return this.user;
    }
    /**
     * @return The map which contains authentication data for the logged-in user.
     */
    createAuthHeaders() {
        return this.accessToken
            ? {
                accessToken: this.accessToken,
            }
            : {};
    }
    getUserGroupId() {
        return this.getLoggedInUser().userGroup.group;
    }
    getAllGroupIds() {
        let groups = this.getLoggedInUser().memberships.map((membership) => membership.group);
        groups.push(this.getLoggedInUser().userGroup.group);
        return groups;
    }
    getCurrentUserGroupKey() {
        // the userGroupKey is always written after the login to this.currentUserGroupKey
        //if the user has only logged in offline this has not happened
        const currentUserGroupKey = this.keyCache.getCurrentUserGroupKey();
        if (currentUserGroupKey == null) {
            if (this.isPartiallyLoggedIn()) {
                throw new LoginIncompleteError("userGroupKey not available");
            }
            else {
                throw new ProgrammingError("Invalid state: userGroupKey is not available");
            }
        }
        return currentUserGroupKey;
    }
    getMembership(groupId) {
        let membership = this.getLoggedInUser().memberships.find((g) => isSameId(g.group, groupId));
        if (!membership) {
            throw new Error(`No group with groupId ${groupId} found!`);
        }
        return membership;
    }
    hasGroup(groupId) {
        if (!this.user) {
            return false;
        }
        else {
            return groupId === this.user.userGroup.group || this.user.memberships.some((m) => m.group === groupId);
        }
    }
    getGroupId(groupType) {
        if (groupType === GroupType.User) {
            return this.getUserGroupId();
        }
        else {
            let membership = this.getLoggedInUser().memberships.find((m) => m.groupType === groupType);
            if (!membership) {
                throw new Error("could not find groupType " + groupType + " for user " + this.getLoggedInUser()._id);
            }
            return membership.group;
        }
    }
    getGroupIds(groupType) {
        return this.getLoggedInUser()
            .memberships.filter((m) => m.groupType === groupType)
            .map((gm) => gm.group);
    }
    isPartiallyLoggedIn() {
        return this.user != null;
    }
    isFullyLoggedIn() {
        // We have userGroupKey, and we can decrypt any other key - we are good to go
        return this.keyCache.getCurrentUserGroupKey() != null;
    }
    getLoggedInUser() {
        return assertNotNull(this.user);
    }
    setLeaderStatus(status) {
        this.leaderStatus = status;
        console.log("New leader status set:", status.leaderStatus);
    }
    isLeader() {
        return this.leaderStatus.leaderStatus;
    }
    reset() {
        this.user = null;
        this.accessToken = null;
        this.keyCache.reset();
        this.leaderStatus = createWebsocketLeaderStatus({
            leaderStatus: false,
        });
    }
    updateUserGroupKey(userGroupKeyDistribution) {
        const userDistKey = this.keyCache.getUserDistKey();
        if (userDistKey == null) {
            console.log("could not update userGroupKey because distribution key is not available");
            return;
        }
        let newUserGroupKeyBytes;
        try {
            try {
                newUserGroupKeyBytes = decryptKey(userDistKey, userGroupKeyDistribution.distributionEncUserGroupKey);
            }
            catch (e) {
                if (e instanceof CryptoError) {
                    // this might be due to old encryption with the legacy derivation of the distribution key
                    // try with the legacy one instead
                    const legacyUserDistKey = this.keyCache.getLegacyUserDistKey();
                    if (legacyUserDistKey == null) {
                        console.log("could not update userGroupKey because old legacy distribution key is not available");
                        return;
                    }
                    newUserGroupKeyBytes = decryptKey(legacyUserDistKey, userGroupKeyDistribution.distributionEncUserGroupKey);
                }
                else {
                    throw e;
                }
            }
        }
        catch (e) {
            // this may happen during offline storage synchronisation when the event queue contains user group key rotation and a password change.
            // We can ignore this error as we already have the latest user group key after connecting the offline client
            console.log(`Could not decrypt userGroupKeyUpdate`, e);
            return;
        }
        const newUserGroupKey = {
            object: newUserGroupKeyBytes,
            version: parseKeyVersion(userGroupKeyDistribution.userGroupKeyVersion),
        };
        console.log(`updating userGroupKey. new version: ${userGroupKeyDistribution.userGroupKeyVersion}`);
        this.keyCache.setCurrentUserGroupKey(newUserGroupKey);
    }
}
//# sourceMappingURL=UserFacade.js.map