import { _verifyType, resolveTypeReference } from "../../common/EntityFunctions";
import { SessionKeyNotFoundError } from "../../common/error/SessionKeyNotFoundError";
import { PushIdentifierTypeRef } from "../../entities/sys/TypeRefs.js";
import { ConnectionError, InternalServerError, NotAuthenticatedError, NotAuthorizedError, NotFoundError, PayloadTooLargeError, } from "../../common/error/RestError";
import { isSameTypeRef, ofClass, promiseMap, splitInChunks } from "@tutao/tutanota-utils";
import { assertWorkerOrNode } from "../../common/Env";
import { getElementId, LOAD_MULTIPLE_LIMIT, POST_MULTIPLE_LIMIT } from "../../common/utils/EntityUtils";
import { Type } from "../../common/EntityConstants.js";
import { SetupMultipleError } from "../../common/error/SetupMultipleError";
import { expandId } from "./DefaultEntityRestCache.js";
import { LoginIncompleteError } from "../../common/error/LoginIncompleteError.js";
import { isOfflineError } from "../../common/utils/ErrorUtils.js";
import { parseKeyVersion } from "../facades/KeyLoaderFacade.js";
assertWorkerOrNode();
export function typeRefToPath(typeRef) {
    return `/rest/${typeRef.app}/${typeRef.type.toLowerCase()}`;
}
/**
 * Get the behavior of the cache mode for the options
 * @param cacheMode cache mode to check, or if `undefined`, check the default cache mode ({@link CacheMode.ReadAndWrite})
 */
export function getCacheModeBehavior(cacheMode) {
    switch (cacheMode ?? 0 /* CacheMode.ReadAndWrite */) {
        case 0 /* CacheMode.ReadAndWrite */:
            return { readsFromCache: true, writesToCache: true };
        case 1 /* CacheMode.WriteOnly */:
            return { readsFromCache: false, writesToCache: true };
        case 2 /* CacheMode.ReadOnly */:
            return { readsFromCache: true, writesToCache: false };
    }
}
/**
 * Retrieves the instances from the backend (db) and converts them to entities.
 *
 * Part of this process is
 * * the decryption for the returned instances (GET) and the encryption of all instances before they are sent (POST, PUT)
 * * the injection of aggregate instances for the returned instances (GET)
 * * caching for retrieved instances (GET)
 *
 */
export class EntityRestClient {
    authDataProvider;
    restClient;
    lazyCrypto;
    instanceMapper;
    blobAccessTokenFacade;
    get _crypto() {
        return this.lazyCrypto();
    }
    constructor(authDataProvider, restClient, lazyCrypto, instanceMapper, blobAccessTokenFacade) {
        this.authDataProvider = authDataProvider;
        this.restClient = restClient;
        this.lazyCrypto = lazyCrypto;
        this.instanceMapper = instanceMapper;
        this.blobAccessTokenFacade = blobAccessTokenFacade;
    }
    async load(typeRef, id, opts = {}) {
        const { listId, elementId } = expandId(id);
        const { path, queryParams, headers, typeModel } = await this._validateAndPrepareRestRequest(typeRef, listId, elementId, opts.queryParams, opts.extraHeaders, opts.ownerKeyProvider);
        const json = await this.restClient.request(path, "GET" /* HttpMethod.GET */, {
            queryParams,
            headers,
            responseType: "application/json" /* MediaType.Json */,
            baseUrl: opts.baseUrl,
        });
        const entity = JSON.parse(json);
        const migratedEntity = await this._crypto.applyMigrations(typeRef, entity);
        const sessionKey = await this.resolveSessionKey(opts.ownerKeyProvider, migratedEntity, typeModel);
        const instance = await this.instanceMapper.decryptAndMapToInstance(typeModel, migratedEntity, sessionKey);
        return this._crypto.applyMigrationsForInstance(instance);
    }
    async resolveSessionKey(ownerKeyProvider, migratedEntity, typeModel) {
        try {
            if (ownerKeyProvider && migratedEntity._ownerEncSessionKey) {
                const ownerKey = await ownerKeyProvider(parseKeyVersion(migratedEntity._ownerKeyVersion ?? 0));
                return this._crypto.resolveSessionKeyWithOwnerKey(migratedEntity, ownerKey);
            }
            else {
                return await this._crypto.resolveSessionKey(typeModel, migratedEntity);
            }
        }
        catch (e) {
            if (e instanceof SessionKeyNotFoundError) {
                console.log(`could not resolve session key for instance of type ${typeModel.app}/${typeModel.name}`, e);
                return null;
            }
            else {
                throw e;
            }
        }
    }
    async loadRange(typeRef, listId, start, count, reverse, opts = {}) {
        const rangeRequestParams = {
            start: String(start),
            count: String(count),
            reverse: String(reverse),
        };
        const { path, headers, typeModel, queryParams } = await this._validateAndPrepareRestRequest(typeRef, listId, null, Object.assign(rangeRequestParams, opts.queryParams), opts.extraHeaders, opts.ownerKeyProvider);
        // This should never happen if type checking is not bypassed with any
        if (typeModel.type !== Type.ListElement)
            throw new Error("only ListElement types are permitted");
        const json = await this.restClient.request(path, "GET" /* HttpMethod.GET */, {
            queryParams,
            headers,
            responseType: "application/json" /* MediaType.Json */,
            baseUrl: opts.baseUrl,
            suspensionBehavior: opts.suspensionBehavior,
        });
        return this._handleLoadMultipleResult(typeRef, JSON.parse(json));
    }
    async loadMultiple(typeRef, listId, elementIds, ownerEncSessionKeyProvider, opts = {}) {
        const { path, headers } = await this._validateAndPrepareRestRequest(typeRef, listId, null, opts.queryParams, opts.extraHeaders, opts.ownerKeyProvider);
        const idChunks = splitInChunks(LOAD_MULTIPLE_LIMIT, elementIds);
        const typeModel = await resolveTypeReference(typeRef);
        const loadedChunks = await promiseMap(idChunks, async (idChunk) => {
            let queryParams = {
                ids: idChunk.join(","),
            };
            let json;
            if (typeModel.type === Type.BlobElement) {
                json = await this.loadMultipleBlobElements(listId, queryParams, headers, path, typeRef, opts.suspensionBehavior);
            }
            else {
                json = await this.restClient.request(path, "GET" /* HttpMethod.GET */, {
                    queryParams,
                    headers,
                    responseType: "application/json" /* MediaType.Json */,
                    baseUrl: opts.baseUrl,
                    suspensionBehavior: opts.suspensionBehavior,
                });
            }
            return this._handleLoadMultipleResult(typeRef, JSON.parse(json), ownerEncSessionKeyProvider);
        });
        return loadedChunks.flat();
    }
    async loadMultipleBlobElements(archiveId, queryParams, headers, path, typeRef, suspensionBehavior) {
        if (archiveId == null) {
            throw new Error("archiveId must be set to load BlobElementTypes");
        }
        const doBlobRequest = async () => {
            const blobServerAccessInfo = await this.blobAccessTokenFacade.requestReadTokenArchive(archiveId);
            const additionalRequestParams = Object.assign({}, headers, // prevent CORS request due to non standard header usage
            queryParams);
            const allParams = await this.blobAccessTokenFacade.createQueryParams(blobServerAccessInfo, additionalRequestParams, typeRef);
            return tryServers(blobServerAccessInfo.servers, async (serverUrl) => this.restClient.request(path, "GET" /* HttpMethod.GET */, {
                queryParams: allParams,
                headers: {}, // prevent CORS request due to non standard header usage
                responseType: "application/json" /* MediaType.Json */,
                baseUrl: serverUrl,
                noCORS: true,
                suspensionBehavior,
            }), `can't load instances from server `);
        };
        const doEvictToken = () => this.blobAccessTokenFacade.evictArchiveToken(archiveId);
        return doBlobRequestWithRetry(doBlobRequest, doEvictToken);
    }
    async _handleLoadMultipleResult(typeRef, loadedEntities, ownerEncSessionKeyProvider) {
        const model = await resolveTypeReference(typeRef);
        // PushIdentifier was changed in the system model v43 to encrypt the name.
        // We check here to check the type only once per array and not for each element.
        if (isSameTypeRef(typeRef, PushIdentifierTypeRef)) {
            await promiseMap(loadedEntities, (instance) => this._crypto.applyMigrations(typeRef, instance), {
                concurrency: 5,
            });
        }
        return promiseMap(loadedEntities, (instance) => {
            return this._decryptMapAndMigrate(instance, model, ownerEncSessionKeyProvider);
        }, { concurrency: 5 });
    }
    async _decryptMapAndMigrate(instance, model, ownerEncSessionKeyProvider) {
        let sessionKey;
        if (ownerEncSessionKeyProvider) {
            sessionKey = await this._crypto.decryptSessionKey(instance, await ownerEncSessionKeyProvider(getElementId(instance)));
        }
        else {
            try {
                sessionKey = await this._crypto.resolveSessionKey(model, instance);
            }
            catch (e) {
                if (e instanceof SessionKeyNotFoundError) {
                    console.log("could not resolve session key", e, e.message, e.stack);
                    sessionKey = null; // will result in _errors being set on the instance
                }
                else {
                    throw e;
                }
            }
        }
        const decryptedInstance = await this.instanceMapper.decryptAndMapToInstance(model, instance, sessionKey);
        return this._crypto.applyMigrationsForInstance(decryptedInstance);
    }
    async setup(listId, instance, extraHeaders, options) {
        const typeRef = instance._type;
        const { typeModel, path, headers, queryParams } = await this._validateAndPrepareRestRequest(typeRef, listId, null, undefined, extraHeaders, options?.ownerKey);
        if (typeModel.type === Type.ListElement) {
            if (!listId)
                throw new Error("List id must be defined for LETs");
        }
        else {
            if (listId)
                throw new Error("List id must not be defined for ETs");
        }
        const sk = await this._crypto.setNewOwnerEncSessionKey(typeModel, instance, options?.ownerKey);
        const encryptedEntity = await this.instanceMapper.encryptAndMapToLiteral(typeModel, instance, sk);
        const persistencePostReturn = await this.restClient.request(path, "POST" /* HttpMethod.POST */, {
            baseUrl: options?.baseUrl,
            queryParams,
            headers,
            body: JSON.stringify(encryptedEntity),
            responseType: "application/json" /* MediaType.Json */,
        });
        return JSON.parse(persistencePostReturn).generatedId;
    }
    async setupMultiple(listId, instances) {
        const count = instances.length;
        if (count < 1) {
            return [];
        }
        const instanceChunks = splitInChunks(POST_MULTIPLE_LIMIT, instances);
        const typeRef = instances[0]._type;
        const { typeModel, path, headers } = await this._validateAndPrepareRestRequest(typeRef, listId, null, undefined, undefined, undefined);
        if (typeModel.type === Type.ListElement) {
            if (!listId)
                throw new Error("List id must be defined for LETs");
        }
        else {
            if (listId)
                throw new Error("List id must not be defined for ETs");
        }
        const errors = [];
        const failedInstances = [];
        const idChunks = await promiseMap(instanceChunks, async (instanceChunk) => {
            try {
                const encryptedEntities = await promiseMap(instanceChunk, async (e) => {
                    const sk = await this._crypto.setNewOwnerEncSessionKey(typeModel, e);
                    return this.instanceMapper.encryptAndMapToLiteral(typeModel, e, sk);
                });
                // informs the server that this is a POST_MULTIPLE request
                const queryParams = {
                    count: String(instanceChunk.length),
                };
                const persistencePostReturn = await this.restClient.request(path, "POST" /* HttpMethod.POST */, {
                    queryParams,
                    headers,
                    body: JSON.stringify(encryptedEntities),
                    responseType: "application/json" /* MediaType.Json */,
                });
                return this.parseSetupMultiple(persistencePostReturn);
            }
            catch (e) {
                if (e instanceof PayloadTooLargeError) {
                    // If we try to post too many large instances then we get PayloadTooLarge
                    // So we fall back to posting single instances
                    const returnedIds = await promiseMap(instanceChunk, (instance) => {
                        return this.setup(listId, instance).catch((e) => {
                            errors.push(e);
                            failedInstances.push(instance);
                        });
                    });
                    return returnedIds.filter(Boolean);
                }
                else {
                    errors.push(e);
                    failedInstances.push(...instanceChunk);
                    return [];
                }
            }
        });
        if (errors.length) {
            if (errors.some(isOfflineError)) {
                throw new ConnectionError("Setup multiple entities failed");
            }
            throw new SetupMultipleError("Setup multiple entities failed", errors, failedInstances);
        }
        else {
            return idChunks.flat();
        }
    }
    async update(instance, options) {
        if (!instance._id)
            throw new Error("Id must be defined");
        const { listId, elementId } = expandId(instance._id);
        const { path, queryParams, headers, typeModel } = await this._validateAndPrepareRestRequest(instance._type, listId, elementId, undefined, undefined, options?.ownerKeyProvider);
        const sessionKey = await this.resolveSessionKey(options?.ownerKeyProvider, instance, typeModel);
        const encryptedEntity = await this.instanceMapper.encryptAndMapToLiteral(typeModel, instance, sessionKey);
        await this.restClient.request(path, "PUT" /* HttpMethod.PUT */, {
            baseUrl: options?.baseUrl,
            queryParams,
            headers,
            body: JSON.stringify(encryptedEntity),
            responseType: "application/json" /* MediaType.Json */,
        });
    }
    async erase(instance, options) {
        const { listId, elementId } = expandId(instance._id);
        const { path, queryParams, headers } = await this._validateAndPrepareRestRequest(instance._type, listId, elementId, undefined, options?.extraHeaders, undefined);
        await this.restClient.request(path, "DELETE" /* HttpMethod.DELETE */, {
            queryParams,
            headers,
        });
    }
    async _validateAndPrepareRestRequest(typeRef, listId, elementId, queryParams, extraHeaders, ownerKey) {
        const typeModel = await resolveTypeReference(typeRef);
        _verifyType(typeModel);
        if (ownerKey == undefined && !this.authDataProvider.isFullyLoggedIn() && typeModel.encrypted) {
            // Short-circuit before we do an actual request which we can't decrypt
            throw new LoginIncompleteError(`Trying to do a network request with encrypted entity but is not fully logged in yet, type: ${typeModel.name}`);
        }
        let path = typeRefToPath(typeRef);
        if (listId) {
            path += "/" + listId;
        }
        if (elementId) {
            path += "/" + elementId;
        }
        const headers = Object.assign({}, this.authDataProvider.createAuthHeaders(), extraHeaders);
        if (Object.keys(headers).length === 0) {
            throw new NotAuthenticatedError("user must be authenticated for entity requests");
        }
        headers.v = typeModel.version;
        return {
            path,
            queryParams,
            headers,
            typeModel,
        };
    }
    /**
     * for the admin area (no cache available)
     */
    entityEventsReceived(batch) {
        return Promise.resolve(batch.events);
    }
    getRestClient() {
        return this.restClient;
    }
    parseSetupMultiple(result) {
        try {
            return JSON.parse(result).map((r) => r.generatedId);
        }
        catch (e) {
            throw new Error(`Invalid response: ${result}, ${e}`);
        }
    }
}
/**
 * Tries to run the mapper action against a list of servers. If the action resolves
 * successfully, the result is returned. In case of an ConnectionError and errors
 * that might occur only for a single blob server, the next server is tried.
 * Throws in all other cases.
 */
export async function tryServers(servers, mapper, errorMsg) {
    let index = 0;
    let error = null;
    for (const server of servers) {
        try {
            return await mapper(server.url, index);
        }
        catch (e) {
            // InternalServerError is returned when accessing a corrupted archive, so we retry
            if (e instanceof ConnectionError || e instanceof InternalServerError || e instanceof NotFoundError) {
                console.log(`${errorMsg} ${server.url}`, e);
                error = e;
            }
            else {
                throw e;
            }
        }
        index++;
    }
    throw error;
}
/**
 * Do a blob request and retry it in case of a NotAuthorizedError, performing some cleanup before retrying.
 *
 * This is useful for blob requests to handle expired tokens, which cah occur if the requests take a long time, the client gets suspended or paused by the OS.
 * @param doBlobRequest
 * @param doEvictTokenBeforeRetry
 */
export async function doBlobRequestWithRetry(doBlobRequest, doEvictTokenBeforeRetry) {
    return doBlobRequest().catch(
    // in case one of the chunks could not be uploaded because of an invalid/expired token we upload all chunks again in order to guarantee that they are uploaded to the same archive.
    // we don't have to take care of already uploaded chunks, as they are unreferenced and will be cleaned up by the server automatically.
    ofClass(NotAuthorizedError, (e) => {
        doEvictTokenBeforeRetry();
        return doBlobRequest();
    }));
}
export function getIds(instance, typeModel) {
    if (!instance._id)
        throw new Error("Id must be defined");
    let listId = null;
    let id;
    if (typeModel.type === Type.ListElement) {
        listId = instance._id[0];
        id = instance._id[1];
    }
    else {
        id = instance._id;
    }
    return {
        listId,
        id,
    };
}
//# sourceMappingURL=EntityRestClient.js.map