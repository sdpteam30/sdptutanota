import { ProgrammingError } from "../../common/error/ProgrammingError";
import { EphemeralCacheStorage } from "./EphemeralCacheStorage";
/**
 * This is necessary so that we can release offline storage mode without having to rewrite the credentials handling system. Since it's possible that
 * a desktop user might not use a persistent session, and we won't know until they try to log in, we can only decide what kind of cache storage to use at login
 * This implementation allows us to avoid modifying too much of the worker public API. Once we make this obsolete, all we will have to do is
 * remove the initialize parameter from the LoginFacade, and tidy up the WorkerLocator init
 *
 * Create a proxy to a cache storage object.
 * It will be uninitialized, and unusable until {@method CacheStorageLateInitializer.initializeCacheStorage} has been called on the returned object
 * Once it is initialized, then it is safe to use
 * @param factory A factory function to get a CacheStorage implementation when initialize is called
 * @return {CacheStorageLateInitializer} The uninitialized proxy and a function to initialize it
 */
export class LateInitializedCacheStorageImpl {
    sendError;
    offlineStorageProvider;
    _inner = null;
    constructor(sendError, offlineStorageProvider) {
        this.sendError = sendError;
        this.offlineStorageProvider = offlineStorageProvider;
    }
    get inner() {
        if (this._inner == null) {
            throw new ProgrammingError("Cache storage is not initialized");
        }
        return this._inner;
    }
    async initialize(args) {
        // We might call this multiple times.
        // This happens when persistent credentials login fails and we need to start with new cache for new login.
        const { storage, isPersistent, isNewOfflineDb } = await this.getStorage(args);
        this._inner = storage;
        return {
            isPersistent,
            isNewOfflineDb,
        };
    }
    async deInitialize() {
        this._inner?.deinit();
    }
    async getStorage(args) {
        if (args.type === "offline") {
            try {
                const storage = await this.offlineStorageProvider();
                if (storage != null) {
                    const isNewOfflineDb = await storage.init(args);
                    return {
                        storage,
                        isPersistent: true,
                        isNewOfflineDb,
                    };
                }
            }
            catch (e) {
                // Precaution in case something bad happens to offline database. We want users to still be able to log in.
                console.error("Error while initializing offline cache storage", e);
                this.sendError(e);
            }
        }
        // both "else" case and fallback for unavailable storage and error cases
        const storage = new EphemeralCacheStorage();
        await storage.init(args);
        return {
            storage,
            isPersistent: false,
            isNewOfflineDb: false,
        };
    }
    deleteIfExists(typeRef, listId, id) {
        return this.inner.deleteIfExists(typeRef, listId, id);
    }
    get(typeRef, listId, id) {
        return this.inner.get(typeRef, listId, id);
    }
    getIdsInRange(typeRef, listId) {
        return this.inner.getIdsInRange(typeRef, listId);
    }
    getLastBatchIdForGroup(groupId) {
        return this.inner.getLastBatchIdForGroup(groupId);
    }
    async getLastUpdateTime() {
        return this._inner ? this.inner.getLastUpdateTime() : { type: "uninitialized" };
    }
    getRangeForList(typeRef, listId) {
        return this.inner.getRangeForList(typeRef, listId);
    }
    isElementIdInCacheRange(typeRef, listId, id) {
        return this.inner.isElementIdInCacheRange(typeRef, listId, id);
    }
    provideFromRange(typeRef, listId, start, count, reverse) {
        return this.inner.provideFromRange(typeRef, listId, start, count, reverse);
    }
    provideMultiple(typeRef, listId, elementIds) {
        return this.inner.provideMultiple(typeRef, listId, elementIds);
    }
    getWholeList(typeRef, listId) {
        return this.inner.getWholeList(typeRef, listId);
    }
    purgeStorage() {
        return this.inner.purgeStorage();
    }
    put(originalEntity) {
        return this.inner.put(originalEntity);
    }
    putLastBatchIdForGroup(groupId, batchId) {
        return this.inner.putLastBatchIdForGroup(groupId, batchId);
    }
    putLastUpdateTime(value) {
        return this.inner.putLastUpdateTime(value);
    }
    setLowerRangeForList(typeRef, listId, id) {
        return this.inner.setLowerRangeForList(typeRef, listId, id);
    }
    setNewRangeForList(typeRef, listId, lower, upper) {
        return this.inner.setNewRangeForList(typeRef, listId, lower, upper);
    }
    setUpperRangeForList(typeRef, listId, id) {
        return this.inner.setUpperRangeForList(typeRef, listId, id);
    }
    getCustomCacheHandlerMap(entityRestClient) {
        return this.inner.getCustomCacheHandlerMap(entityRestClient);
    }
    getUserId() {
        return this.inner.getUserId();
    }
    async deleteAllOwnedBy(owner) {
        return this.inner.deleteAllOwnedBy(owner);
    }
    async deleteWholeList(typeRef, listId) {
        return this.inner.deleteWholeList(typeRef, listId);
    }
    clearExcludedData() {
        return this.inner.clearExcludedData();
    }
    /**
     * We want to lock the access to the "ranges" db when updating / reading the
     * offline available mail list ranges for each mail list (referenced using the listId)
     * @param listId the mail list that we want to lock
     */
    lockRangesDbAccess(listId) {
        return this.inner.lockRangesDbAccess(listId);
    }
    /**
     * This is the counterpart to the function "lockRangesDbAccess(listId)"
     * @param listId the mail list that we want to unlock
     */
    unlockRangesDbAccess(listId) {
        return this.inner.unlockRangesDbAccess(listId);
    }
}
//# sourceMappingURL=CacheStorageProxy.js.map