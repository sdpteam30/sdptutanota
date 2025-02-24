import { b64UserIdHash, DbFacade } from "../../search/DbFacade.js";
import { assertNotNull, concat, downcast, isSameTypeRefByAttr, LazyLoaded, stringToUtf8Uint8Array, utf8Uint8ArrayToString } from "@tutao/tutanota-utils";
import { UserTypeRef } from "../../../entities/sys/TypeRefs.js";
import { aes256RandomKey, aesEncrypt, decryptKey, IV_BYTE_LENGTH, random, unauthenticatedAesDecrypt, } from "@tutao/tutanota-crypto";
import { Metadata } from "../../search/IndexTables.js";
import { DbError } from "../../../common/error/DbError.js";
import { checkKeyVersionConstraints } from "../KeyLoaderFacade.js";
import { encryptKeyWithVersionedKey } from "../../crypto/CryptoWrapper.js";
const VERSION = 2;
const DB_KEY_PREFIX = "ConfigStorage";
const ExternalImageListOS = "ExternalAllowListOS";
export const ConfigurationMetaDataOS = "MetaDataOS";
/** @PublicForTesting */
export async function encryptItem(item, key, iv) {
    return aesEncrypt(key, stringToUtf8Uint8Array(item), iv, true);
}
export async function decryptLegacyItem(encryptedAddress, key, iv) {
    return utf8Uint8ArrayToString(unauthenticatedAesDecrypt(key, concat(iv, encryptedAddress)));
}
/**
 * A local configuration database that can be used as an alternative to DeviceConfig:
 * Ideal for cases where the configuration values should be stored encrypted,
 * Or when the configuration is a growing list or object, which would be unsuitable for localStorage
 * Or when the configuration is only required in the Worker
 */
export class ConfigurationDatabase {
    keyLoaderFacade;
    // visible for testing
    db;
    constructor(keyLoaderFacade, userFacade, dbLoadFn = (user, keyLoaderFacade) => this.loadConfigDb(user, keyLoaderFacade)) {
        this.keyLoaderFacade = keyLoaderFacade;
        this.db = new LazyLoaded(() => {
            const user = assertNotNull(userFacade.getLoggedInUser());
            return dbLoadFn(user, keyLoaderFacade);
        });
    }
    async addExternalImageRule(address, rule) {
        const { db, metaData } = await this.db.getAsync();
        if (!db.indexingSupported)
            return;
        const encryptedAddress = await encryptItem(address, metaData.key, metaData.iv);
        return addAddressToImageList(db, encryptedAddress, rule);
    }
    async getExternalImageRule(address) {
        const { db, metaData } = await this.db.getAsync();
        if (!db.indexingSupported)
            return "0" /* ExternalImageRule.None */;
        const encryptedAddress = await encryptItem(address, metaData.key, metaData.iv);
        const transaction = await db.createTransaction(true, [ExternalImageListOS]);
        const entry = await transaction.get(ExternalImageListOS, encryptedAddress);
        let rule = "0" /* ExternalImageRule.None */;
        if (entry != null) {
            if (entry.rule != null) {
                rule = entry.rule;
            }
            else {
                // No rule set from earlier version means Allow
                await addAddressToImageList(db, encryptedAddress, "1" /* ExternalImageRule.Allow */);
                rule = "1" /* ExternalImageRule.Allow */;
            }
        }
        return rule;
    }
    async loadConfigDb(user, keyLoaderFacade) {
        const id = this.getDbId(user._id);
        const db = new DbFacade(VERSION, async (event, db, dbFacade) => {
            if (event.oldVersion === 0) {
                db.createObjectStore(ConfigurationMetaDataOS);
                db.createObjectStore(ExternalImageListOS, {
                    keyPath: "address",
                });
            }
            const metaData = (await loadEncryptionMetadata(dbFacade, id, keyLoaderFacade, ConfigurationMetaDataOS)) ||
                (await initializeDb(dbFacade, id, keyLoaderFacade, ConfigurationMetaDataOS));
            if (event.oldVersion === 1) {
                // migrate from plain, mac-and-static-iv aes256 to aes256 with mac
                const transaction = await dbFacade.createTransaction(true, [ExternalImageListOS]);
                const entries = await transaction.getAll(ExternalImageListOS);
                const { key, iv } = metaData;
                for (const entry of entries) {
                    const address = await decryptLegacyItem(new Uint8Array(downcast(entry.key)), key, iv);
                    await this.addExternalImageRule(address, entry.value.rule);
                    const deleteTransaction = await dbFacade.createTransaction(false, [ExternalImageListOS]);
                    await deleteTransaction.delete(ExternalImageListOS, entry.key);
                }
            }
        });
        const metaData = (await loadEncryptionMetadata(db, id, keyLoaderFacade, ConfigurationMetaDataOS)) ||
            (await initializeDb(db, id, keyLoaderFacade, ConfigurationMetaDataOS));
        return {
            db,
            metaData,
        };
    }
    async onEntityEventsReceived(batch) {
        const { events, groupId, batchId } = batch;
        for (const event of events) {
            if (!(event.operation === "1" /* OperationType.UPDATE */ && isSameTypeRefByAttr(UserTypeRef, event.application, event.type))) {
                continue;
            }
            const configDb = await this.db.getAsync();
            if (configDb.db.isSameDbId(this.getDbId(event.instanceId))) {
                return updateEncryptionMetadata(configDb.db, this.keyLoaderFacade, ConfigurationMetaDataOS);
            }
        }
    }
    async delete(userId) {
        const dbId = this.getDbId(userId);
        if (this.db.isLoadedOrLoading()) {
            const { db } = await this.db.getAsync();
            await db.deleteDatabase(dbId);
        }
        else {
            await DbFacade.deleteDb(dbId);
        }
    }
    getDbId(userId) {
        return `${DB_KEY_PREFIX}_${b64UserIdHash(userId)}`;
    }
}
async function decryptMetaData(keyLoaderFacade, metaData) {
    const userGroupKey = await keyLoaderFacade.loadSymUserGroupKey(metaData.userGroupKeyVersion);
    const key = decryptKey(userGroupKey, metaData.userEncDbKey);
    const iv = unauthenticatedAesDecrypt(key, metaData.encDbIv);
    return {
        key,
        iv,
    };
}
/**
 * Load the encryption key and iv from the db
 * @return { key, iv } or null if one or both don't exist
 * @VisibleForTesting
 */
export async function loadEncryptionMetadata(db, id, keyLoaderFacade, objectStoreName) {
    await db.open(id);
    const metaData = await getMetaData(db, objectStoreName);
    if (metaData != null) {
        return await decryptMetaData(keyLoaderFacade, metaData);
    }
    else {
        return null;
    }
}
/**
 * Reencrypt the DB key and IV if there is a new userGroupKey
 * @VisibleForTesting
 */
export async function updateEncryptionMetadata(db, keyLoaderFacade, objectStoreName) {
    const metaData = await getMetaData(db, objectStoreName);
    const currentUserGroupKey = keyLoaderFacade.getCurrentSymUserGroupKey();
    if (metaData == null || currentUserGroupKey.version === metaData.userGroupKeyVersion)
        return;
    const encryptionMetadata = await decryptMetaData(keyLoaderFacade, metaData);
    if (encryptionMetadata == null)
        return;
    const { key, iv } = encryptionMetadata;
    await encryptAndSaveDbKey(currentUserGroupKey, key, iv, db, objectStoreName);
}
/**
 * Helper function to get the group key version for the group key that was used to encrypt the db key. In case the version has not been written to the db we assume 0.
 * @param db the dbFacade corresponding to the object store
 * @param objectStoreName the objectStore to get the metadata from
 */
export async function getMetaData(db, objectStoreName) {
    const transaction = await db.createTransaction(true, [objectStoreName]);
    const userEncDbKey = (await transaction.get(objectStoreName, Metadata.userEncDbKey));
    const encDbIv = (await transaction.get(objectStoreName, Metadata.encDbIv));
    const userGroupKeyVersion = checkKeyVersionConstraints((await transaction.get(objectStoreName, Metadata.userGroupKeyVersion)) ?? 0); // was not written for old dbs
    if (userEncDbKey == null || encDbIv == null) {
        return null;
    }
    else {
        return {
            userEncDbKey,
            encDbIv,
            userGroupKeyVersion,
        };
    }
}
/**
 * Helper function to get the group key version for the group key that was used to encrypt the db key. In case the version has not been written to the db we assume 0.
 * @param db the dbFacade corresponding to the object store
 * @param objectStoreName the objectStore to get the metadata from
 */
export async function getIndexerMetaData(db, objectStoreName) {
    const transaction = await db.createTransaction(true, [objectStoreName]);
    const userEncDbKey = (await transaction.get(objectStoreName, Metadata.userEncDbKey));
    const encDbIv = (await transaction.get(objectStoreName, Metadata.encDbIv));
    const userGroupKeyVersion = checkKeyVersionConstraints((await transaction.get(objectStoreName, Metadata.userGroupKeyVersion)) ?? 0); // was not written for old dbs
    const mailIndexingEnabled = (await transaction.get(objectStoreName, Metadata.mailIndexingEnabled));
    const excludedListIds = (await transaction.get(objectStoreName, Metadata.excludedListIds));
    const lastEventIndexTimeMs = (await transaction.get(objectStoreName, Metadata.lastEventIndexTimeMs));
    if (userEncDbKey == null || encDbIv == null) {
        return null;
    }
    else {
        return {
            userEncDbKey,
            encDbIv,
            userGroupKeyVersion,
            mailIndexingEnabled,
            excludedListIds,
            lastEventIndexTimeMs,
        };
    }
}
async function encryptAndSaveDbKey(userGroupKey, dbKey, dbIv, db, objectStoreName) {
    const transaction = await db.createTransaction(false, [objectStoreName]); // create a new transaction to avoid timeouts and for writing
    const groupEncSessionKey = encryptKeyWithVersionedKey(userGroupKey, dbKey);
    await transaction.put(objectStoreName, Metadata.userEncDbKey, groupEncSessionKey.key);
    await transaction.put(objectStoreName, Metadata.userGroupKeyVersion, groupEncSessionKey.encryptingKeyVersion);
    await transaction.put(objectStoreName, Metadata.encDbIv, aesEncrypt(dbKey, dbIv));
}
/**
 * @caution This will clear any existing data in the database, because they key and IV will be regenerated
 * @return the newly generated key and iv for the database contents
 * @VisibleForTesting
 *
 */
export async function initializeDb(db, id, keyLoaderFacade, objectStoreName) {
    await db.deleteDatabase(id).then(() => db.open(id));
    const key = aes256RandomKey();
    const iv = random.generateRandomData(IV_BYTE_LENGTH);
    const userGroupKey = keyLoaderFacade.getCurrentSymUserGroupKey();
    await encryptAndSaveDbKey(userGroupKey, key, iv, db, objectStoreName);
    return {
        key,
        iv,
    };
}
async function addAddressToImageList(db, encryptedAddress, rule) {
    try {
        const transaction = await db.createTransaction(false, [ExternalImageListOS]);
        await transaction.put(ExternalImageListOS, null, {
            address: encryptedAddress,
            rule: rule,
        });
    }
    catch (e) {
        if (e instanceof DbError) {
            console.error("failed to add address to image list:", e.message);
            return;
        }
        throw e;
    }
}
//# sourceMappingURL=ConfigurationDatabase.js.map