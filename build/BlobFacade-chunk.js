import "./dist-chunk.js";
import { ProgrammingError } from "./ProgrammingError-chunk.js";
import { assertWorkerOrNode, isApp, isDesktop } from "./Env-chunk.js";
import "./ClientDetector-chunk.js";
import { assertNonNull, base64ToBase64Ext, clear, concat, getFirstOrThrow, groupBy, isEmpty, mapMap, neverNull, pMap, splitUint8ArrayInChunks, uint8ArrayToBase64, uint8ArrayToString } from "./dist2-chunk.js";
import { MAX_BLOB_SIZE_BYTES } from "./TutanotaConstants-chunk.js";
import "./EntityUtils-chunk.js";
import "./TypeModels-chunk.js";
import "./TypeRefs-chunk.js";
import "./TypeModels2-chunk.js";
import { createBlobReferenceTokenWrapper } from "./TypeRefs2-chunk.js";
import "./ParserCombinator-chunk.js";
import "./ErrorHandler-chunk.js";
import { HttpMethod, MediaType, resolveTypeReference } from "./EntityFunctions-chunk.js";
import "./TypeModels3-chunk.js";
import "./ModelInfo-chunk.js";
import "./ErrorUtils-chunk.js";
import { handleRestError } from "./RestError-chunk.js";
import "./SetupMultipleError-chunk.js";
import "./OutOfSyncError-chunk.js";
import "./CancelledError-chunk.js";
import "./EventQueue-chunk.js";
import { doBlobRequestWithRetry, tryServers } from "./EntityRestClient-chunk.js";
import "./SuspensionError-chunk.js";
import "./LoginIncompleteError-chunk.js";
import { CryptoError } from "./CryptoError-chunk.js";
import "./error-chunk.js";
import "./RecipientsNotFoundError-chunk.js";
import "./DbError-chunk.js";
import "./QuotaExceededError-chunk.js";
import "./DeviceStorageUnavailableError-chunk.js";
import "./MailBodyTooLargeError-chunk.js";
import "./ImportError-chunk.js";
import "./WebauthnError-chunk.js";
import "./PermissionError-chunk.js";
import "./MessageDispatcher-chunk.js";
import "./WorkerProxy-chunk.js";
import "./EntityUpdateUtils-chunk.js";
import { aesDecrypt, sha256Hash } from "./dist3-chunk.js";
import "./KeyLoaderFacade-chunk.js";
import { encryptBytes } from "./CryptoWrapper-chunk.js";
import { addParamsToUrl, isSuspensionResponse } from "./RestClient-chunk.js";
import { BlobGetInTypeRef, BlobPostOutTypeRef, BlobService, createBlobGetIn, createBlobId } from "./Services3-chunk.js";

//#region src/common/api/worker/facades/lazy/BlobFacade.ts
assertWorkerOrNode();
const BLOB_SERVICE_REST_PATH = `/rest/${BlobService.app}/${BlobService.name.toLowerCase()}`;
const TAG = "BlobFacade";
var BlobFacade = class {
	constructor(restClient, suspensionHandler, fileApp, aesApp, instanceMapper, cryptoFacade, blobAccessTokenFacade) {
		this.restClient = restClient;
		this.suspensionHandler = suspensionHandler;
		this.fileApp = fileApp;
		this.aesApp = aesApp;
		this.instanceMapper = instanceMapper;
		this.cryptoFacade = cryptoFacade;
		this.blobAccessTokenFacade = blobAccessTokenFacade;
	}
	/**
	* Encrypts and uploads binary data to the blob store. The binary data is split into multiple blobs in case it
	* is too big.
	*
	* @returns blobReferenceToken that must be used to reference a blobs from an instance. Only to be used once.
	*/
	async encryptAndUpload(archiveDataType, blobData, ownerGroupId, sessionKey) {
		const chunks = splitUint8ArrayInChunks(MAX_BLOB_SIZE_BYTES, blobData);
		const doBlobRequest = async () => {
			const blobServerAccessInfo = await this.blobAccessTokenFacade.requestWriteToken(archiveDataType, ownerGroupId);
			return pMap(chunks, async (chunk) => await this.encryptAndUploadChunk(chunk, blobServerAccessInfo, sessionKey));
		};
		const doEvictToken = () => this.blobAccessTokenFacade.evictWriteToken(archiveDataType, ownerGroupId);
		return doBlobRequestWithRetry(doBlobRequest, doEvictToken);
	}
	/**
	* Encrypts and uploads binary data stored as a file to the blob store. The binary data is split into multiple blobs in case it
	* is too big.
	*
	* @returns blobReferenceToken that must be used to reference a blobs from an instance. Only to be used once.
	*/
	async encryptAndUploadNative(archiveDataType, fileUri, ownerGroupId, sessionKey) {
		if (!isApp() && !isDesktop()) throw new ProgrammingError("Environment is not app or Desktop!");
		const chunkUris = await this.fileApp.splitFile(fileUri, MAX_BLOB_SIZE_BYTES);
		const doEvictToken = () => this.blobAccessTokenFacade.evictWriteToken(archiveDataType, ownerGroupId);
		const doBlobRequest = async () => {
			const blobServerAccessInfo = await this.blobAccessTokenFacade.requestWriteToken(archiveDataType, ownerGroupId);
			return pMap(chunkUris, async (chunkUri) => {
				return this.encryptAndUploadNativeChunk(chunkUri, blobServerAccessInfo, sessionKey);
			});
		};
		return doBlobRequestWithRetry(doBlobRequest, doEvictToken);
	}
	/**
	* Downloads multiple blobs, decrypts and joins them to unencrypted binary data.
	*
	* @param archiveDataType
	* @param referencingInstance that directly references the blobs
	* @returns Uint8Array unencrypted binary data
	*/
	async downloadAndDecrypt(archiveDataType, referencingInstance, blobLoadOptions = {}) {
		const sessionKey = await this.resolveSessionKey(referencingInstance.entity);
		const doBlobRequest = async () => {
			const blobServerAccessInfo = await this.blobAccessTokenFacade.requestReadTokenBlobs(archiveDataType, referencingInstance, blobLoadOptions);
			return this.downloadAndDecryptMultipleBlobsOfArchive(referencingInstance.blobs, blobServerAccessInfo, sessionKey, blobLoadOptions);
		};
		const doEvictToken = () => this.blobAccessTokenFacade.evictReadBlobsToken(referencingInstance);
		const blobChunks = await doBlobRequestWithRetry(doBlobRequest, doEvictToken);
		return this.concatenateBlobChunks(referencingInstance, blobChunks);
	}
	concatenateBlobChunks(referencingInstance, blobChunks) {
		const resultSize = Array.from(blobChunks.values()).reduce((sum, blob) => blob.length + sum, 0);
		const resultBuffer = new Uint8Array(resultSize);
		let offset = 0;
		for (const blob of referencingInstance.blobs) {
			const data = blobChunks.get(blob.blobId);
			assertNonNull(data, `Server did not return blob for id : ${blob.blobId}`);
			resultBuffer.set(data, offset);
			offset += data.length;
		}
		return resultBuffer;
	}
	/**
	* Downloads blobs of all {@param referencingInstances}, decrypts them and joins them to unencrypted binaries.
	* If some blobs are not found the result will contain {@code null}.
	* @returns Map from instance id to the decrypted and concatenated contents of the referenced blobs
	*/
	async downloadAndDecryptBlobsOfMultipleInstances(archiveDataType, referencingInstances, blobLoadOptions = {}) {
		const instancesByArchive = groupBy(referencingInstances, (instance) => getFirstOrThrow(instance.blobs).archiveId);
		const result = new Map();
		for (const [_, instances] of instancesByArchive.entries()) {
			const allBlobs = instances.flatMap((instance) => instance.blobs);
			const doBlobRequest = async () => {
				const accessInfo = await this.blobAccessTokenFacade.requestReadTokenMultipleInstances(archiveDataType, instances, blobLoadOptions);
				return this.downloadBlobsOfOneArchive(allBlobs, accessInfo, blobLoadOptions);
			};
			const doEvictToken = () => {
				for (const instance of instances) this.blobAccessTokenFacade.evictReadBlobsToken(instance);
			};
			const encryptedBlobsOfAllInstances = await doBlobRequestWithRetry(doBlobRequest, doEvictToken);
			for (const instance of instances) {
				const decryptedData = await this.decryptInstanceData(instance, encryptedBlobsOfAllInstances);
				result.set(instance.elementId, decryptedData);
			}
		}
		return result;
	}
	async decryptInstanceData(instance, blobs) {
		const sessionKey = await this.resolveSessionKey(instance.entity);
		const decryptedChunks = [];
		for (const blob of instance.blobs) {
			const encryptedChunk = blobs.get(blob.blobId);
			if (encryptedChunk == null) {
				console.log(TAG, `Did not find blob of the instance. blobId: ${blob.blobId}, instance: ${instance}`);
				return null;
			}
			try {
				decryptedChunks.push(aesDecrypt(sessionKey, encryptedChunk));
			} catch (e) {
				if (e instanceof CryptoError) {
					console.log(TAG, `Could not decrypt blob of the instance. blobId: ${blob.blobId}, instance: ${instance}`, e);
					return null;
				} else throw e;
			}
		}
		return concat(...decryptedChunks);
	}
	/**
	* Downloads multiple blobs, decrypts and joins them to unencrypted binary data which will be stored as a file on the
	* device.
	*
	* @param archiveDataType
	* @param referencingInstance that directly references the blobs
	* @param fileName is written to the returned FileReference
	* @param mimeType is written to the returned FileReference
	* @returns FileReference to the unencrypted binary data
	*/
	async downloadAndDecryptNative(archiveDataType, referencingInstance, fileName, mimeType) {
		if (!isApp() && !isDesktop()) throw new ProgrammingError("Environment is not app or Desktop!");
		const sessionKey = await this.resolveSessionKey(referencingInstance.entity);
		const decryptedChunkFileUris = [];
		const doBlobRequest = async () => {
			clear(decryptedChunkFileUris);
			const blobServerAccessInfo = await this.blobAccessTokenFacade.requestReadTokenBlobs(archiveDataType, referencingInstance, {});
			return pMap(referencingInstance.blobs, async (blob) => {
				decryptedChunkFileUris.push(await this.downloadAndDecryptChunkNative(blob, blobServerAccessInfo, sessionKey));
			}).catch(async (e) => {
				for (const decryptedChunkFileUri of decryptedChunkFileUris) await this.fileApp.deleteFile(decryptedChunkFileUri);
				throw e;
			});
		};
		const doEvictToken = () => this.blobAccessTokenFacade.evictReadBlobsToken(referencingInstance);
		await doBlobRequestWithRetry(doBlobRequest, doEvictToken);
		try {
			const decryptedFileUri = await this.fileApp.joinFiles(fileName, decryptedChunkFileUris);
			const size = await this.fileApp.getSize(decryptedFileUri);
			return {
				_type: "FileReference",
				name: fileName,
				mimeType,
				size,
				location: decryptedFileUri
			};
		} finally {
			for (const tmpBlobFile of decryptedChunkFileUris) await this.fileApp.deleteFile(tmpBlobFile);
		}
	}
	async resolveSessionKey(entity) {
		return neverNull(await this.cryptoFacade.resolveSessionKeyForInstance(entity));
	}
	async encryptAndUploadChunk(chunk, blobServerAccessInfo, sessionKey) {
		const encryptedData = encryptBytes(sessionKey, chunk);
		const blobHash = uint8ArrayToBase64(sha256Hash(encryptedData).slice(0, 6));
		const queryParams = await this.blobAccessTokenFacade.createQueryParams(blobServerAccessInfo, { blobHash }, BlobGetInTypeRef);
		return tryServers(blobServerAccessInfo.servers, async (serverUrl) => {
			const response = await this.restClient.request(BLOB_SERVICE_REST_PATH, HttpMethod.POST, {
				queryParams,
				body: encryptedData,
				responseType: MediaType.Json,
				baseUrl: serverUrl
			});
			return await this.parseBlobPostOutResponse(response);
		}, `can't upload to server`);
	}
	async encryptAndUploadNativeChunk(fileUri, blobServerAccessInfo, sessionKey) {
		const encryptedFileInfo = await this.aesApp.aesEncryptFile(sessionKey, fileUri);
		const encryptedChunkUri = encryptedFileInfo.uri;
		const blobHash = await this.fileApp.hashFile(encryptedChunkUri);
		return tryServers(blobServerAccessInfo.servers, async (serverUrl) => {
			return await this.uploadNative(encryptedChunkUri, blobServerAccessInfo, serverUrl, blobHash);
		}, `can't upload to server from native`);
	}
	async uploadNative(location, blobServerAccessInfo, serverUrl, blobHash) {
		if (this.suspensionHandler.isSuspended()) return this.suspensionHandler.deferRequest(() => this.uploadNative(location, blobServerAccessInfo, serverUrl, blobHash));
		const queryParams = await this.blobAccessTokenFacade.createQueryParams(blobServerAccessInfo, { blobHash }, BlobGetInTypeRef);
		const serviceUrl = new URL(BLOB_SERVICE_REST_PATH, serverUrl);
		const fullUrl = addParamsToUrl(serviceUrl, queryParams);
		const { suspensionTime, responseBody, statusCode, errorId, precondition } = await this.fileApp.upload(location, fullUrl.toString(), HttpMethod.POST, {});
		if (statusCode === 201 && responseBody != null) return this.parseBlobPostOutResponse(uint8ArrayToString("utf-8", responseBody));
else if (responseBody == null) throw new Error("no response body");
else if (isSuspensionResponse(statusCode, suspensionTime)) {
			this.suspensionHandler.activateSuspensionIfInactive(Number(suspensionTime), serviceUrl);
			return this.suspensionHandler.deferRequest(() => this.uploadNative(location, blobServerAccessInfo, serverUrl, blobHash));
		} else throw handleRestError(statusCode, ` | ${HttpMethod.POST} ${fullUrl.toString()} failed to natively upload blob`, errorId, precondition);
	}
	async parseBlobPostOutResponse(jsonData) {
		const responseTypeModel = await resolveTypeReference(BlobPostOutTypeRef);
		const instance = JSON.parse(jsonData);
		const { blobReferenceToken } = await this.instanceMapper.decryptAndMapToInstance(responseTypeModel, instance, null);
		if (blobReferenceToken == null) throw new ProgrammingError("empty blobReferenceToken not allowed for post single blob");
		return createBlobReferenceTokenWrapper({ blobReferenceToken });
	}
	async downloadAndDecryptMultipleBlobsOfArchive(blobs, blobServerAccessInfo, sessionKey, blobLoadOptions) {
		const mapWithEncryptedBlobs = await this.downloadBlobsOfOneArchive(blobs, blobServerAccessInfo, blobLoadOptions);
		return mapMap(mapWithEncryptedBlobs, (blob) => aesDecrypt(sessionKey, blob));
	}
	/**
	* Download blobs of a single archive in a single request
	* @return map from blob id to the data
	*/
	async downloadBlobsOfOneArchive(blobs, blobServerAccessInfo, blobLoadOptions) {
		if (isEmpty(blobs)) throw new ProgrammingError("Blobs are empty");
		const archiveId = getFirstOrThrow(blobs).archiveId;
		if (blobs.some((blob) => blob.archiveId !== archiveId)) throw new ProgrammingError("Must only request blobs of the same archive together");
		const getData = createBlobGetIn({
			archiveId,
			blobId: null,
			blobIds: blobs.map(({ blobId }) => createBlobId({ blobId }))
		});
		const BlobGetInTypeModel = await resolveTypeReference(BlobGetInTypeRef);
		const literalGetData = await this.instanceMapper.encryptAndMapToLiteral(BlobGetInTypeModel, getData, null);
		const body = JSON.stringify(literalGetData);
		const queryParams = await this.blobAccessTokenFacade.createQueryParams(blobServerAccessInfo, {}, BlobGetInTypeRef);
		const concatBinaryData = await tryServers(blobServerAccessInfo.servers, async (serverUrl) => {
			return await this.restClient.request(BLOB_SERVICE_REST_PATH, HttpMethod.GET, {
				queryParams,
				body,
				responseType: MediaType.Binary,
				baseUrl: serverUrl,
				noCORS: true,
				headers: blobLoadOptions.extraHeaders,
				suspensionBehavior: blobLoadOptions.suspensionBehavior
			});
		}, `can't download from server `);
		return parseMultipleBlobsResponse(concatBinaryData);
	}
	async downloadAndDecryptChunkNative(blob, blobServerAccessInfo, sessionKey) {
		const { archiveId, blobId } = blob;
		const getData = createBlobGetIn({
			archiveId,
			blobId,
			blobIds: []
		});
		const BlobGetInTypeModel = await resolveTypeReference(BlobGetInTypeRef);
		const literalGetData = await this.instanceMapper.encryptAndMapToLiteral(BlobGetInTypeModel, getData, null);
		const _body = JSON.stringify(literalGetData);
		const blobFilename = blobId + ".blob";
		return tryServers(blobServerAccessInfo.servers, async (serverUrl) => {
			return await this.downloadNative(serverUrl, blobServerAccessInfo, sessionKey, blobFilename, { _body });
		}, `can't download native from server `);
	}
	/**
	* @return the uri of the decrypted blob
	*/
	async downloadNative(serverUrl, blobServerAccessInfo, sessionKey, fileName, additionalParams) {
		if (this.suspensionHandler.isSuspended()) return this.suspensionHandler.deferRequest(() => this.downloadNative(serverUrl, blobServerAccessInfo, sessionKey, fileName, additionalParams));
		const serviceUrl = new URL(BLOB_SERVICE_REST_PATH, serverUrl);
		const url = addParamsToUrl(serviceUrl, await this.blobAccessTokenFacade.createQueryParams(blobServerAccessInfo, additionalParams, BlobGetInTypeRef));
		const { statusCode, encryptedFileUri, suspensionTime, errorId, precondition } = await this.fileApp.download(url.toString(), fileName, {});
		if (statusCode == 200 && encryptedFileUri != null) {
			const decryptedFileUrl = await this.aesApp.aesDecryptFile(sessionKey, encryptedFileUri);
			try {
				await this.fileApp.deleteFile(encryptedFileUri);
			} catch {
				console.log("Failed to delete encrypted file", encryptedFileUri);
			}
			return decryptedFileUrl;
		} else if (isSuspensionResponse(statusCode, suspensionTime)) {
			this.suspensionHandler.activateSuspensionIfInactive(Number(suspensionTime), serviceUrl);
			return this.suspensionHandler.deferRequest(() => this.downloadNative(serverUrl, blobServerAccessInfo, sessionKey, fileName, additionalParams));
		} else throw handleRestError(statusCode, ` | ${HttpMethod.GET} failed to natively download attachment`, errorId, precondition);
	}
};
function parseMultipleBlobsResponse(concatBinaryData) {
	const dataView = new DataView(concatBinaryData.buffer);
	const result = new Map();
	const blobCount = dataView.getInt32(0);
	if (blobCount === 0) return result;
	if (blobCount < 0) throw new Error(`Invalid blob count: ${blobCount}`);
	let offset = 4;
	while (offset < concatBinaryData.length) {
		const blobIdBytes = concatBinaryData.slice(offset, offset + 9);
		const blobId = base64ToBase64Ext(uint8ArrayToBase64(blobIdBytes));
		const blobSize = dataView.getInt32(offset + 15);
		const dataStartOffset = offset + 19;
		if (blobSize < 0 || dataStartOffset + blobSize > concatBinaryData.length) throw new Error(`Invalid blob size: ${blobSize}. Remaining length: ${concatBinaryData.length - dataStartOffset}`);
		const contents = concatBinaryData.slice(dataStartOffset, dataStartOffset + blobSize);
		result.set(blobId, contents);
		offset = dataStartOffset + blobSize;
	}
	if (blobCount !== result.size) throw new Error(`Parsed wrong number of blobs: ${blobCount}. Expected: ${result.size}`);
	return result;
}

//#endregion
export { BlobFacade };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmxvYkZhY2FkZS1jaHVuay5qcyIsIm5hbWVzIjpbInJlc3RDbGllbnQ6IFJlc3RDbGllbnQiLCJzdXNwZW5zaW9uSGFuZGxlcjogU3VzcGVuc2lvbkhhbmRsZXIiLCJmaWxlQXBwOiBOYXRpdmVGaWxlQXBwIiwiYWVzQXBwOiBBZXNBcHAiLCJpbnN0YW5jZU1hcHBlcjogSW5zdGFuY2VNYXBwZXIiLCJjcnlwdG9GYWNhZGU6IENyeXB0b0ZhY2FkZSIsImJsb2JBY2Nlc3NUb2tlbkZhY2FkZTogQmxvYkFjY2Vzc1Rva2VuRmFjYWRlIiwiYXJjaGl2ZURhdGFUeXBlOiBBcmNoaXZlRGF0YVR5cGUiLCJibG9iRGF0YTogVWludDhBcnJheSIsIm93bmVyR3JvdXBJZDogSWQiLCJzZXNzaW9uS2V5OiBBZXNLZXkiLCJmaWxlVXJpOiBGaWxlVXJpIiwicmVmZXJlbmNpbmdJbnN0YW5jZTogQmxvYlJlZmVyZW5jaW5nSW5zdGFuY2UiLCJibG9iTG9hZE9wdGlvbnM6IEJsb2JMb2FkT3B0aW9ucyIsImJsb2JDaHVua3M6IE1hcDxJZCwgVWludDhBcnJheT4iLCJyZWZlcmVuY2luZ0luc3RhbmNlczogQmxvYlJlZmVyZW5jaW5nSW5zdGFuY2VbXSIsInJlc3VsdDogTWFwPElkLCBVaW50OEFycmF5IHwgbnVsbD4iLCJpbnN0YW5jZTogQmxvYlJlZmVyZW5jaW5nSW5zdGFuY2UiLCJibG9iczogTWFwPElkLCBVaW50OEFycmF5PiIsImRlY3J5cHRlZENodW5rczogVWludDhBcnJheVtdIiwiZmlsZU5hbWU6IHN0cmluZyIsIm1pbWVUeXBlOiBzdHJpbmciLCJkZWNyeXB0ZWRDaHVua0ZpbGVVcmlzOiBGaWxlVXJpW10iLCJlOiBFcnJvciIsImVudGl0eTogU29tZUVudGl0eSIsImNodW5rOiBVaW50OEFycmF5IiwiYmxvYlNlcnZlckFjY2Vzc0luZm86IEJsb2JTZXJ2ZXJBY2Nlc3NJbmZvIiwibG9jYXRpb246IHN0cmluZyIsInNlcnZlclVybDogc3RyaW5nIiwiYmxvYkhhc2g6IHN0cmluZyIsImpzb25EYXRhOiBzdHJpbmciLCJibG9iczogcmVhZG9ubHkgQmxvYltdIiwiYmxvYjogQmxvYiIsImFkZGl0aW9uYWxQYXJhbXM6IERpY3QiLCJjb25jYXRCaW5hcnlEYXRhOiBVaW50OEFycmF5Il0sInNvdXJjZXMiOlsiLi4vc3JjL2NvbW1vbi9hcGkvd29ya2VyL2ZhY2FkZXMvbGF6eS9CbG9iRmFjYWRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGFkZFBhcmFtc1RvVXJsLCBpc1N1c3BlbnNpb25SZXNwb25zZSwgUmVzdENsaWVudCwgU3VzcGVuc2lvbkJlaGF2aW9yIH0gZnJvbSBcIi4uLy4uL3Jlc3QvUmVzdENsaWVudC5qc1wiXG5pbXBvcnQgeyBDcnlwdG9GYWNhZGUgfSBmcm9tIFwiLi4vLi4vY3J5cHRvL0NyeXB0b0ZhY2FkZS5qc1wiXG5pbXBvcnQge1xuXHRhc3NlcnROb25OdWxsLFxuXHRiYXNlNjRUb0Jhc2U2NEV4dCxcblx0Y2xlYXIsXG5cdGNvbmNhdCxcblx0Z2V0Rmlyc3RPclRocm93LFxuXHRncm91cEJ5LFxuXHRpc0VtcHR5LFxuXHRtYXBNYXAsXG5cdG5ldmVyTnVsbCxcblx0cHJvbWlzZU1hcCxcblx0c3BsaXRVaW50OEFycmF5SW5DaHVua3MsXG5cdHVpbnQ4QXJyYXlUb0Jhc2U2NCxcblx0dWludDhBcnJheVRvU3RyaW5nLFxufSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB7IEFyY2hpdmVEYXRhVHlwZSwgTUFYX0JMT0JfU0laRV9CWVRFUyB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vVHV0YW5vdGFDb25zdGFudHMuanNcIlxuXG5pbXBvcnQgeyBIdHRwTWV0aG9kLCBNZWRpYVR5cGUsIHJlc29sdmVUeXBlUmVmZXJlbmNlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9FbnRpdHlGdW5jdGlvbnMuanNcIlxuaW1wb3J0IHsgYXNzZXJ0V29ya2VyT3JOb2RlLCBpc0FwcCwgaXNEZXNrdG9wIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9FbnYuanNcIlxuaW1wb3J0IHR5cGUgeyBTdXNwZW5zaW9uSGFuZGxlciB9IGZyb20gXCIuLi8uLi9TdXNwZW5zaW9uSGFuZGxlci5qc1wiXG5pbXBvcnQgeyBCbG9iU2VydmljZSB9IGZyb20gXCIuLi8uLi8uLi9lbnRpdGllcy9zdG9yYWdlL1NlcnZpY2VzLmpzXCJcbmltcG9ydCB7IGFlc0RlY3J5cHQsIEFlc0tleSwgc2hhMjU2SGFzaCB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtY3J5cHRvXCJcbmltcG9ydCB0eXBlIHsgRmlsZVVyaSwgTmF0aXZlRmlsZUFwcCB9IGZyb20gXCIuLi8uLi8uLi8uLi9uYXRpdmUvY29tbW9uL0ZpbGVBcHAuanNcIlxuaW1wb3J0IHR5cGUgeyBBZXNBcHAgfSBmcm9tIFwiLi4vLi4vLi4vLi4vbmF0aXZlL3dvcmtlci9BZXNBcHAuanNcIlxuaW1wb3J0IHsgSW5zdGFuY2VNYXBwZXIgfSBmcm9tIFwiLi4vLi4vY3J5cHRvL0luc3RhbmNlTWFwcGVyLmpzXCJcbmltcG9ydCB7IEJsb2IsIEJsb2JSZWZlcmVuY2VUb2tlbldyYXBwZXIsIGNyZWF0ZUJsb2JSZWZlcmVuY2VUb2tlbldyYXBwZXIgfSBmcm9tIFwiLi4vLi4vLi4vZW50aXRpZXMvc3lzL1R5cGVSZWZzLmpzXCJcbmltcG9ydCB7IEZpbGVSZWZlcmVuY2UgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL3V0aWxzL0ZpbGVVdGlscy5qc1wiXG5pbXBvcnQgeyBoYW5kbGVSZXN0RXJyb3IgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2Vycm9yL1Jlc3RFcnJvci5qc1wiXG5pbXBvcnQgeyBQcm9ncmFtbWluZ0Vycm9yIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9lcnJvci9Qcm9ncmFtbWluZ0Vycm9yLmpzXCJcbmltcG9ydCB7IElTZXJ2aWNlRXhlY3V0b3IgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL1NlcnZpY2VSZXF1ZXN0LmpzXCJcbmltcG9ydCB7IEJsb2JHZXRJblR5cGVSZWYsIEJsb2JQb3N0T3V0LCBCbG9iUG9zdE91dFR5cGVSZWYsIEJsb2JTZXJ2ZXJBY2Nlc3NJbmZvLCBjcmVhdGVCbG9iR2V0SW4sIGNyZWF0ZUJsb2JJZCB9IGZyb20gXCIuLi8uLi8uLi9lbnRpdGllcy9zdG9yYWdlL1R5cGVSZWZzLmpzXCJcbmltcG9ydCB7IEF1dGhEYXRhUHJvdmlkZXIgfSBmcm9tIFwiLi4vVXNlckZhY2FkZS5qc1wiXG5pbXBvcnQgeyBkb0Jsb2JSZXF1ZXN0V2l0aFJldHJ5LCB0cnlTZXJ2ZXJzIH0gZnJvbSBcIi4uLy4uL3Jlc3QvRW50aXR5UmVzdENsaWVudC5qc1wiXG5pbXBvcnQgeyBCbG9iQWNjZXNzVG9rZW5GYWNhZGUgfSBmcm9tIFwiLi4vQmxvYkFjY2Vzc1Rva2VuRmFjYWRlLmpzXCJcbmltcG9ydCB7IERlZmF1bHRFbnRpdHlSZXN0Q2FjaGUgfSBmcm9tIFwiLi4vLi4vcmVzdC9EZWZhdWx0RW50aXR5UmVzdENhY2hlLmpzXCJcbmltcG9ydCB7IFNvbWVFbnRpdHkgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL0VudGl0eVR5cGVzLmpzXCJcbmltcG9ydCB7IGVuY3J5cHRCeXRlcyB9IGZyb20gXCIuLi8uLi9jcnlwdG8vQ3J5cHRvV3JhcHBlci5qc1wiXG5pbXBvcnQgeyBCbG9iUmVmZXJlbmNpbmdJbnN0YW5jZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vdXRpbHMvQmxvYlV0aWxzLmpzXCJcbmltcG9ydCB7IENyeXB0b0Vycm9yIH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS1jcnlwdG8vZXJyb3IuanNcIlxuXG5hc3NlcnRXb3JrZXJPck5vZGUoKVxuZXhwb3J0IGNvbnN0IEJMT0JfU0VSVklDRV9SRVNUX1BBVEggPSBgL3Jlc3QvJHtCbG9iU2VydmljZS5hcHB9LyR7QmxvYlNlcnZpY2UubmFtZS50b0xvd2VyQ2FzZSgpfWBcbmV4cG9ydCBjb25zdCBUQUcgPSBcIkJsb2JGYWNhZGVcIlxuXG5leHBvcnQgaW50ZXJmYWNlIEJsb2JMb2FkT3B0aW9ucyB7XG5cdGV4dHJhSGVhZGVycz86IERpY3Rcblx0c3VzcGVuc2lvbkJlaGF2aW9yPzogU3VzcGVuc2lvbkJlaGF2aW9yXG5cdC8qKiBvdmVycmlkZSBvcmlnaW4gZm9yIHRoZSByZXF1ZXN0ICovXG5cdGJhc2VVcmw/OiBzdHJpbmdcbn1cblxuLyoqXG4gKiBUaGUgQmxvYkZhY2FkZSB1cGxvYWRzIGFuZCBkb3dubG9hZHMgYmxvYnMgdG8vZnJvbSB0aGUgYmxvYiBzdG9yZS5cbiAqXG4gKiBJdCByZXF1ZXN0cyB0b2tlbnMgZnJvbSB0aGUgQmxvYkFjY2Vzc1Rva2VuU2VydmljZSBhbmQgZG93bmxvYWQgYW5kIHVwbG9hZHMgdGhlIGJsb2JzIHRvL2Zyb20gdGhlIEJsb2JTZXJ2aWNlLlxuICpcbiAqIEluIGNhc2Ugb2YgdXBsb2FkIGl0IGlzIG5lY2Vzc2FyeSB0byBtYWtlIGEgcmVxdWVzdCB0byB0aGUgQmxvYlJlZmVyZW5jZVNlcnZpY2Ugb3IgdXNlIHRoZSByZWZlcmVuY2VUb2tlbnMgcmV0dXJuZWQgYnkgdGhlIEJsb2JTZXJ2aWNlIFBVVCBpbiBzb21lIG90aGVyIHNlcnZpY2UgY2FsbC5cbiAqIE90aGVyd2lzZSwgdGhlIGJsb2JzIHdpbGwgYXV0b21hdGljYWxseSBiZSBkZWxldGVkIGFmdGVyIHNvbWUgdGltZS4gSXQgaXMgbm90IGFsbG93ZWQgdG8gcmVmZXJlbmNlIGJsb2JzIG1hbnVhbGx5IGluIHNvbWUgaW5zdGFuY2UuXG4gKi9cbmV4cG9ydCBjbGFzcyBCbG9iRmFjYWRlIHtcblx0Y29uc3RydWN0b3IoXG5cdFx0cHJpdmF0ZSByZWFkb25seSByZXN0Q2xpZW50OiBSZXN0Q2xpZW50LFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgc3VzcGVuc2lvbkhhbmRsZXI6IFN1c3BlbnNpb25IYW5kbGVyLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgZmlsZUFwcDogTmF0aXZlRmlsZUFwcCxcblx0XHRwcml2YXRlIHJlYWRvbmx5IGFlc0FwcDogQWVzQXBwLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgaW5zdGFuY2VNYXBwZXI6IEluc3RhbmNlTWFwcGVyLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgY3J5cHRvRmFjYWRlOiBDcnlwdG9GYWNhZGUsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBibG9iQWNjZXNzVG9rZW5GYWNhZGU6IEJsb2JBY2Nlc3NUb2tlbkZhY2FkZSxcblx0KSB7fVxuXG5cdC8qKlxuXHQgKiBFbmNyeXB0cyBhbmQgdXBsb2FkcyBiaW5hcnkgZGF0YSB0byB0aGUgYmxvYiBzdG9yZS4gVGhlIGJpbmFyeSBkYXRhIGlzIHNwbGl0IGludG8gbXVsdGlwbGUgYmxvYnMgaW4gY2FzZSBpdFxuXHQgKiBpcyB0b28gYmlnLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBibG9iUmVmZXJlbmNlVG9rZW4gdGhhdCBtdXN0IGJlIHVzZWQgdG8gcmVmZXJlbmNlIGEgYmxvYnMgZnJvbSBhbiBpbnN0YW5jZS4gT25seSB0byBiZSB1c2VkIG9uY2UuXG5cdCAqL1xuXHRhc3luYyBlbmNyeXB0QW5kVXBsb2FkKGFyY2hpdmVEYXRhVHlwZTogQXJjaGl2ZURhdGFUeXBlLCBibG9iRGF0YTogVWludDhBcnJheSwgb3duZXJHcm91cElkOiBJZCwgc2Vzc2lvbktleTogQWVzS2V5KTogUHJvbWlzZTxCbG9iUmVmZXJlbmNlVG9rZW5XcmFwcGVyW10+IHtcblx0XHRjb25zdCBjaHVua3MgPSBzcGxpdFVpbnQ4QXJyYXlJbkNodW5rcyhNQVhfQkxPQl9TSVpFX0JZVEVTLCBibG9iRGF0YSlcblx0XHRjb25zdCBkb0Jsb2JSZXF1ZXN0ID0gYXN5bmMgKCkgPT4ge1xuXHRcdFx0Y29uc3QgYmxvYlNlcnZlckFjY2Vzc0luZm8gPSBhd2FpdCB0aGlzLmJsb2JBY2Nlc3NUb2tlbkZhY2FkZS5yZXF1ZXN0V3JpdGVUb2tlbihhcmNoaXZlRGF0YVR5cGUsIG93bmVyR3JvdXBJZClcblx0XHRcdHJldHVybiBwcm9taXNlTWFwKGNodW5rcywgYXN5bmMgKGNodW5rKSA9PiBhd2FpdCB0aGlzLmVuY3J5cHRBbmRVcGxvYWRDaHVuayhjaHVuaywgYmxvYlNlcnZlckFjY2Vzc0luZm8sIHNlc3Npb25LZXkpKVxuXHRcdH1cblx0XHRjb25zdCBkb0V2aWN0VG9rZW4gPSAoKSA9PiB0aGlzLmJsb2JBY2Nlc3NUb2tlbkZhY2FkZS5ldmljdFdyaXRlVG9rZW4oYXJjaGl2ZURhdGFUeXBlLCBvd25lckdyb3VwSWQpXG5cblx0XHRyZXR1cm4gZG9CbG9iUmVxdWVzdFdpdGhSZXRyeShkb0Jsb2JSZXF1ZXN0LCBkb0V2aWN0VG9rZW4pXG5cdH1cblxuXHQvKipcblx0ICogRW5jcnlwdHMgYW5kIHVwbG9hZHMgYmluYXJ5IGRhdGEgc3RvcmVkIGFzIGEgZmlsZSB0byB0aGUgYmxvYiBzdG9yZS4gVGhlIGJpbmFyeSBkYXRhIGlzIHNwbGl0IGludG8gbXVsdGlwbGUgYmxvYnMgaW4gY2FzZSBpdFxuXHQgKiBpcyB0b28gYmlnLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBibG9iUmVmZXJlbmNlVG9rZW4gdGhhdCBtdXN0IGJlIHVzZWQgdG8gcmVmZXJlbmNlIGEgYmxvYnMgZnJvbSBhbiBpbnN0YW5jZS4gT25seSB0byBiZSB1c2VkIG9uY2UuXG5cdCAqL1xuXHRhc3luYyBlbmNyeXB0QW5kVXBsb2FkTmF0aXZlKFxuXHRcdGFyY2hpdmVEYXRhVHlwZTogQXJjaGl2ZURhdGFUeXBlLFxuXHRcdGZpbGVVcmk6IEZpbGVVcmksXG5cdFx0b3duZXJHcm91cElkOiBJZCxcblx0XHRzZXNzaW9uS2V5OiBBZXNLZXksXG5cdCk6IFByb21pc2U8QmxvYlJlZmVyZW5jZVRva2VuV3JhcHBlcltdPiB7XG5cdFx0aWYgKCFpc0FwcCgpICYmICFpc0Rlc2t0b3AoKSkge1xuXHRcdFx0dGhyb3cgbmV3IFByb2dyYW1taW5nRXJyb3IoXCJFbnZpcm9ubWVudCBpcyBub3QgYXBwIG9yIERlc2t0b3AhXCIpXG5cdFx0fVxuXHRcdGNvbnN0IGNodW5rVXJpcyA9IGF3YWl0IHRoaXMuZmlsZUFwcC5zcGxpdEZpbGUoZmlsZVVyaSwgTUFYX0JMT0JfU0laRV9CWVRFUylcblxuXHRcdGNvbnN0IGRvRXZpY3RUb2tlbiA9ICgpID0+IHRoaXMuYmxvYkFjY2Vzc1Rva2VuRmFjYWRlLmV2aWN0V3JpdGVUb2tlbihhcmNoaXZlRGF0YVR5cGUsIG93bmVyR3JvdXBJZClcblx0XHRjb25zdCBkb0Jsb2JSZXF1ZXN0ID0gYXN5bmMgKCkgPT4ge1xuXHRcdFx0Y29uc3QgYmxvYlNlcnZlckFjY2Vzc0luZm8gPSBhd2FpdCB0aGlzLmJsb2JBY2Nlc3NUb2tlbkZhY2FkZS5yZXF1ZXN0V3JpdGVUb2tlbihhcmNoaXZlRGF0YVR5cGUsIG93bmVyR3JvdXBJZClcblx0XHRcdHJldHVybiBwcm9taXNlTWFwKGNodW5rVXJpcywgYXN5bmMgKGNodW5rVXJpKSA9PiB7XG5cdFx0XHRcdHJldHVybiB0aGlzLmVuY3J5cHRBbmRVcGxvYWROYXRpdmVDaHVuayhjaHVua1VyaSwgYmxvYlNlcnZlckFjY2Vzc0luZm8sIHNlc3Npb25LZXkpXG5cdFx0XHR9KVxuXHRcdH1cblx0XHRyZXR1cm4gZG9CbG9iUmVxdWVzdFdpdGhSZXRyeShkb0Jsb2JSZXF1ZXN0LCBkb0V2aWN0VG9rZW4pXG5cdH1cblxuXHQvKipcblx0ICogRG93bmxvYWRzIG11bHRpcGxlIGJsb2JzLCBkZWNyeXB0cyBhbmQgam9pbnMgdGhlbSB0byB1bmVuY3J5cHRlZCBiaW5hcnkgZGF0YS5cblx0ICpcblx0ICogQHBhcmFtIGFyY2hpdmVEYXRhVHlwZVxuXHQgKiBAcGFyYW0gcmVmZXJlbmNpbmdJbnN0YW5jZSB0aGF0IGRpcmVjdGx5IHJlZmVyZW5jZXMgdGhlIGJsb2JzXG5cdCAqIEByZXR1cm5zIFVpbnQ4QXJyYXkgdW5lbmNyeXB0ZWQgYmluYXJ5IGRhdGFcblx0ICovXG5cdGFzeW5jIGRvd25sb2FkQW5kRGVjcnlwdChcblx0XHRhcmNoaXZlRGF0YVR5cGU6IEFyY2hpdmVEYXRhVHlwZSxcblx0XHRyZWZlcmVuY2luZ0luc3RhbmNlOiBCbG9iUmVmZXJlbmNpbmdJbnN0YW5jZSxcblx0XHRibG9iTG9hZE9wdGlvbnM6IEJsb2JMb2FkT3B0aW9ucyA9IHt9LFxuXHQpOiBQcm9taXNlPFVpbnQ4QXJyYXk+IHtcblx0XHRjb25zdCBzZXNzaW9uS2V5ID0gYXdhaXQgdGhpcy5yZXNvbHZlU2Vzc2lvbktleShyZWZlcmVuY2luZ0luc3RhbmNlLmVudGl0eSlcblx0XHQvLyBDdXJyZW50bHkgYXNzdW1lcyB0aGF0IGFsbCB0aGUgYmxvYnMgb2YgdGhlIGluc3RhbmNlIGFyZSBpbiB0aGUgc2FtZSBhcmNoaXZlLlxuXHRcdC8vIElmIHRoaXMgY2hhbmdlcyB3ZSBuZWVkIHRvIGdyb3VwIGJ5IGFyY2hpdmUgYW5kIGRvIHJlcXVlc3QgZm9yIGVhY2ggYXJjaGl2ZSBhbmQgdGhlbiBjb25jYXRlbmF0ZSBhbGwgdGhlIGNodW5rcy5cblx0XHRjb25zdCBkb0Jsb2JSZXF1ZXN0ID0gYXN5bmMgKCkgPT4ge1xuXHRcdFx0Y29uc3QgYmxvYlNlcnZlckFjY2Vzc0luZm8gPSBhd2FpdCB0aGlzLmJsb2JBY2Nlc3NUb2tlbkZhY2FkZS5yZXF1ZXN0UmVhZFRva2VuQmxvYnMoYXJjaGl2ZURhdGFUeXBlLCByZWZlcmVuY2luZ0luc3RhbmNlLCBibG9iTG9hZE9wdGlvbnMpXG5cdFx0XHRyZXR1cm4gdGhpcy5kb3dubG9hZEFuZERlY3J5cHRNdWx0aXBsZUJsb2JzT2ZBcmNoaXZlKHJlZmVyZW5jaW5nSW5zdGFuY2UuYmxvYnMsIGJsb2JTZXJ2ZXJBY2Nlc3NJbmZvLCBzZXNzaW9uS2V5LCBibG9iTG9hZE9wdGlvbnMpXG5cdFx0fVxuXHRcdGNvbnN0IGRvRXZpY3RUb2tlbiA9ICgpID0+IHRoaXMuYmxvYkFjY2Vzc1Rva2VuRmFjYWRlLmV2aWN0UmVhZEJsb2JzVG9rZW4ocmVmZXJlbmNpbmdJbnN0YW5jZSlcblxuXHRcdGNvbnN0IGJsb2JDaHVua3MgPSBhd2FpdCBkb0Jsb2JSZXF1ZXN0V2l0aFJldHJ5KGRvQmxvYlJlcXVlc3QsIGRvRXZpY3RUb2tlbilcblx0XHRyZXR1cm4gdGhpcy5jb25jYXRlbmF0ZUJsb2JDaHVua3MocmVmZXJlbmNpbmdJbnN0YW5jZSwgYmxvYkNodW5rcylcblx0fVxuXG5cdHByaXZhdGUgY29uY2F0ZW5hdGVCbG9iQ2h1bmtzKHJlZmVyZW5jaW5nSW5zdGFuY2U6IEJsb2JSZWZlcmVuY2luZ0luc3RhbmNlLCBibG9iQ2h1bmtzOiBNYXA8SWQsIFVpbnQ4QXJyYXk+KSB7XG5cdFx0Y29uc3QgcmVzdWx0U2l6ZSA9IEFycmF5LmZyb20oYmxvYkNodW5rcy52YWx1ZXMoKSkucmVkdWNlKChzdW0sIGJsb2IpID0+IGJsb2IubGVuZ3RoICsgc3VtLCAwKVxuXHRcdGNvbnN0IHJlc3VsdEJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KHJlc3VsdFNpemUpXG5cdFx0bGV0IG9mZnNldCA9IDBcblx0XHRmb3IgKGNvbnN0IGJsb2Igb2YgcmVmZXJlbmNpbmdJbnN0YW5jZS5ibG9icykge1xuXHRcdFx0Y29uc3QgZGF0YSA9IGJsb2JDaHVua3MuZ2V0KGJsb2IuYmxvYklkKVxuXHRcdFx0YXNzZXJ0Tm9uTnVsbChkYXRhLCBgU2VydmVyIGRpZCBub3QgcmV0dXJuIGJsb2IgZm9yIGlkIDogJHtibG9iLmJsb2JJZH1gKVxuXHRcdFx0cmVzdWx0QnVmZmVyLnNldChkYXRhLCBvZmZzZXQpXG5cdFx0XHRvZmZzZXQgKz0gZGF0YS5sZW5ndGhcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdEJ1ZmZlclxuXHR9XG5cblx0LyoqXG5cdCAqIERvd25sb2FkcyBibG9icyBvZiBhbGwge0BwYXJhbSByZWZlcmVuY2luZ0luc3RhbmNlc30sIGRlY3J5cHRzIHRoZW0gYW5kIGpvaW5zIHRoZW0gdG8gdW5lbmNyeXB0ZWQgYmluYXJpZXMuXG5cdCAqIElmIHNvbWUgYmxvYnMgYXJlIG5vdCBmb3VuZCB0aGUgcmVzdWx0IHdpbGwgY29udGFpbiB7QGNvZGUgbnVsbH0uXG5cdCAqIEByZXR1cm5zIE1hcCBmcm9tIGluc3RhbmNlIGlkIHRvIHRoZSBkZWNyeXB0ZWQgYW5kIGNvbmNhdGVuYXRlZCBjb250ZW50cyBvZiB0aGUgcmVmZXJlbmNlZCBibG9ic1xuXHQgKi9cblx0YXN5bmMgZG93bmxvYWRBbmREZWNyeXB0QmxvYnNPZk11bHRpcGxlSW5zdGFuY2VzKFxuXHRcdGFyY2hpdmVEYXRhVHlwZTogQXJjaGl2ZURhdGFUeXBlLFxuXHRcdHJlZmVyZW5jaW5nSW5zdGFuY2VzOiBCbG9iUmVmZXJlbmNpbmdJbnN0YW5jZVtdLFxuXHRcdGJsb2JMb2FkT3B0aW9uczogQmxvYkxvYWRPcHRpb25zID0ge30sXG5cdCk6IFByb21pc2U8TWFwPElkLCBVaW50OEFycmF5IHwgbnVsbD4+IHtcblx0XHQvLyBJZiBhIG1haWwgaGFzIG11bHRpcGxlIGF0dGFjaG1lbnRzLCB3ZSBjYW5ub3QgYXNzdW1lIHRoZXkgYXJlIGFsbCBvbiB0aGUgc2FtZSBhcmNoaXZlLlxuXHRcdC8vIEJ1dCBhbGwgYmxvYnMgb2YgYSBzaW5nbGUgYXR0YWNobWVudCBzaG91bGQgYmUgaW4gdGhlIHNhbWUgYXJjaGl2ZVxuXHRcdGNvbnN0IGluc3RhbmNlc0J5QXJjaGl2ZSA9IGdyb3VwQnkocmVmZXJlbmNpbmdJbnN0YW5jZXMsIChpbnN0YW5jZSkgPT4gZ2V0Rmlyc3RPclRocm93KGluc3RhbmNlLmJsb2JzKS5hcmNoaXZlSWQpXG5cblx0XHQvLyBpbnN0YW5jZSBpZCB0byBkYXRhXG5cdFx0Y29uc3QgcmVzdWx0OiBNYXA8SWQsIFVpbnQ4QXJyYXkgfCBudWxsPiA9IG5ldyBNYXAoKVxuXG5cdFx0Zm9yIChjb25zdCBbXywgaW5zdGFuY2VzXSBvZiBpbnN0YW5jZXNCeUFyY2hpdmUuZW50cmllcygpKSB7XG5cdFx0XHQvLyByZXF1ZXN0IGEgdG9rZW4gZm9yIGFsbCBpbnN0YW5jZXMgb2YgdGhlIGFyY2hpdmVcblx0XHRcdC8vIGRvd25sb2FkIGFsbCBibG9icyBmcm9tIGFsbCBpbnN0YW5jZXMgZm9yIHRoaXMgYXJjaGl2ZVxuXHRcdFx0Y29uc3QgYWxsQmxvYnMgPSBpbnN0YW5jZXMuZmxhdE1hcCgoaW5zdGFuY2UpID0+IGluc3RhbmNlLmJsb2JzKVxuXHRcdFx0Y29uc3QgZG9CbG9iUmVxdWVzdCA9IGFzeW5jICgpID0+IHtcblx0XHRcdFx0Y29uc3QgYWNjZXNzSW5mbyA9IGF3YWl0IHRoaXMuYmxvYkFjY2Vzc1Rva2VuRmFjYWRlLnJlcXVlc3RSZWFkVG9rZW5NdWx0aXBsZUluc3RhbmNlcyhhcmNoaXZlRGF0YVR5cGUsIGluc3RhbmNlcywgYmxvYkxvYWRPcHRpb25zKVxuXHRcdFx0XHRyZXR1cm4gdGhpcy5kb3dubG9hZEJsb2JzT2ZPbmVBcmNoaXZlKGFsbEJsb2JzLCBhY2Nlc3NJbmZvLCBibG9iTG9hZE9wdGlvbnMpXG5cdFx0XHR9XG5cdFx0XHRjb25zdCBkb0V2aWN0VG9rZW4gPSAoKSA9PiB7XG5cdFx0XHRcdGZvciAoY29uc3QgaW5zdGFuY2Ugb2YgaW5zdGFuY2VzKSB7XG5cdFx0XHRcdFx0dGhpcy5ibG9iQWNjZXNzVG9rZW5GYWNhZGUuZXZpY3RSZWFkQmxvYnNUb2tlbihpbnN0YW5jZSlcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Y29uc3QgZW5jcnlwdGVkQmxvYnNPZkFsbEluc3RhbmNlcyA9IGF3YWl0IGRvQmxvYlJlcXVlc3RXaXRoUmV0cnkoZG9CbG9iUmVxdWVzdCwgZG9FdmljdFRva2VuKVxuXHRcdFx0Ly8gc29ydCBibG9icyBieSB0aGUgaW5zdGFuY2Vcblx0XHRcdGZvciAoY29uc3QgaW5zdGFuY2Ugb2YgaW5zdGFuY2VzKSB7XG5cdFx0XHRcdGNvbnN0IGRlY3J5cHRlZERhdGEgPSBhd2FpdCB0aGlzLmRlY3J5cHRJbnN0YW5jZURhdGEoaW5zdGFuY2UsIGVuY3J5cHRlZEJsb2JzT2ZBbGxJbnN0YW5jZXMpXG5cdFx0XHRcdC8vIHJldHVybiBNYXAgb2YgaW5zdGFuY2UgaWQgLT4gYmxvYiBkYXRhXG5cdFx0XHRcdHJlc3VsdC5zZXQoaW5zdGFuY2UuZWxlbWVudElkLCBkZWNyeXB0ZWREYXRhKVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHRcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgZGVjcnlwdEluc3RhbmNlRGF0YShpbnN0YW5jZTogQmxvYlJlZmVyZW5jaW5nSW5zdGFuY2UsIGJsb2JzOiBNYXA8SWQsIFVpbnQ4QXJyYXk+KTogUHJvbWlzZTxVaW50OEFycmF5IHwgbnVsbD4ge1xuXHRcdC8vIGdldCB0aGUga2V5IG9mIHRoZSBpbnN0YW5jZVxuXHRcdGNvbnN0IHNlc3Npb25LZXkgPSBhd2FpdCB0aGlzLnJlc29sdmVTZXNzaW9uS2V5KGluc3RhbmNlLmVudGl0eSlcblx0XHQvLyBkZWNyeXB0IGJsb2JzIG9mIHRoZSBpbnN0YW5jZSBhbmQgY29uY2F0ZW5hdGUgdGhlbVxuXHRcdGNvbnN0IGRlY3J5cHRlZENodW5rczogVWludDhBcnJheVtdID0gW11cblx0XHRmb3IgKGNvbnN0IGJsb2Igb2YgaW5zdGFuY2UuYmxvYnMpIHtcblx0XHRcdGNvbnN0IGVuY3J5cHRlZENodW5rID0gYmxvYnMuZ2V0KGJsb2IuYmxvYklkKVxuXHRcdFx0aWYgKGVuY3J5cHRlZENodW5rID09IG51bGwpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coVEFHLCBgRGlkIG5vdCBmaW5kIGJsb2Igb2YgdGhlIGluc3RhbmNlLiBibG9iSWQ6ICR7YmxvYi5ibG9iSWR9LCBpbnN0YW5jZTogJHtpbnN0YW5jZX1gKVxuXHRcdFx0XHRyZXR1cm4gbnVsbFxuXHRcdFx0fVxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0ZGVjcnlwdGVkQ2h1bmtzLnB1c2goYWVzRGVjcnlwdChzZXNzaW9uS2V5LCBlbmNyeXB0ZWRDaHVuaykpXG5cdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdC8vIElmIGRlY3J5cHRpbmcgb25lIGNodW5rIG9mIGFuIGluc3RhbmNlIGZhaWxzIGl0IGRvZXNuJ3QgbWFrZSBzZW5zZSB0byByZXR1cm4gYW55IGRhdGEgZm9yXG5cdFx0XHRcdC8vIHRoYXQgaW5zdGFuY2Vcblx0XHRcdFx0aWYgKGUgaW5zdGFuY2VvZiBDcnlwdG9FcnJvcikge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKFRBRywgYENvdWxkIG5vdCBkZWNyeXB0IGJsb2Igb2YgdGhlIGluc3RhbmNlLiBibG9iSWQ6ICR7YmxvYi5ibG9iSWR9LCBpbnN0YW5jZTogJHtpbnN0YW5jZX1gLCBlKVxuXHRcdFx0XHRcdHJldHVybiBudWxsXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhyb3cgZVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBjb25jYXQoLi4uZGVjcnlwdGVkQ2h1bmtzKVxuXHR9XG5cblx0LyoqXG5cdCAqIERvd25sb2FkcyBtdWx0aXBsZSBibG9icywgZGVjcnlwdHMgYW5kIGpvaW5zIHRoZW0gdG8gdW5lbmNyeXB0ZWQgYmluYXJ5IGRhdGEgd2hpY2ggd2lsbCBiZSBzdG9yZWQgYXMgYSBmaWxlIG9uIHRoZVxuXHQgKiBkZXZpY2UuXG5cdCAqXG5cdCAqIEBwYXJhbSBhcmNoaXZlRGF0YVR5cGVcblx0ICogQHBhcmFtIHJlZmVyZW5jaW5nSW5zdGFuY2UgdGhhdCBkaXJlY3RseSByZWZlcmVuY2VzIHRoZSBibG9ic1xuXHQgKiBAcGFyYW0gZmlsZU5hbWUgaXMgd3JpdHRlbiB0byB0aGUgcmV0dXJuZWQgRmlsZVJlZmVyZW5jZVxuXHQgKiBAcGFyYW0gbWltZVR5cGUgaXMgd3JpdHRlbiB0byB0aGUgcmV0dXJuZWQgRmlsZVJlZmVyZW5jZVxuXHQgKiBAcmV0dXJucyBGaWxlUmVmZXJlbmNlIHRvIHRoZSB1bmVuY3J5cHRlZCBiaW5hcnkgZGF0YVxuXHQgKi9cblx0YXN5bmMgZG93bmxvYWRBbmREZWNyeXB0TmF0aXZlKFxuXHRcdGFyY2hpdmVEYXRhVHlwZTogQXJjaGl2ZURhdGFUeXBlLFxuXHRcdHJlZmVyZW5jaW5nSW5zdGFuY2U6IEJsb2JSZWZlcmVuY2luZ0luc3RhbmNlLFxuXHRcdGZpbGVOYW1lOiBzdHJpbmcsXG5cdFx0bWltZVR5cGU6IHN0cmluZyxcblx0KTogUHJvbWlzZTxGaWxlUmVmZXJlbmNlPiB7XG5cdFx0aWYgKCFpc0FwcCgpICYmICFpc0Rlc2t0b3AoKSkge1xuXHRcdFx0dGhyb3cgbmV3IFByb2dyYW1taW5nRXJyb3IoXCJFbnZpcm9ubWVudCBpcyBub3QgYXBwIG9yIERlc2t0b3AhXCIpXG5cdFx0fVxuXHRcdGNvbnN0IHNlc3Npb25LZXkgPSBhd2FpdCB0aGlzLnJlc29sdmVTZXNzaW9uS2V5KHJlZmVyZW5jaW5nSW5zdGFuY2UuZW50aXR5KVxuXHRcdGNvbnN0IGRlY3J5cHRlZENodW5rRmlsZVVyaXM6IEZpbGVVcmlbXSA9IFtdXG5cdFx0Y29uc3QgZG9CbG9iUmVxdWVzdCA9IGFzeW5jICgpID0+IHtcblx0XHRcdGNsZWFyKGRlY3J5cHRlZENodW5rRmlsZVVyaXMpIC8vIGVuc3VyZSB0aGF0IHRoZSBkZWNyeXB0ZWQgZmlsZSB1cmlzIGFyZSBlbXRweSBpbiBjYXNlIHdlIHJldHJ5IGJlY2F1c2Ugb2YgTm90QXV0aG9yaXplZCBlcnJvclxuXHRcdFx0Y29uc3QgYmxvYlNlcnZlckFjY2Vzc0luZm8gPSBhd2FpdCB0aGlzLmJsb2JBY2Nlc3NUb2tlbkZhY2FkZS5yZXF1ZXN0UmVhZFRva2VuQmxvYnMoYXJjaGl2ZURhdGFUeXBlLCByZWZlcmVuY2luZ0luc3RhbmNlLCB7fSlcblx0XHRcdHJldHVybiBwcm9taXNlTWFwKHJlZmVyZW5jaW5nSW5zdGFuY2UuYmxvYnMsIGFzeW5jIChibG9iKSA9PiB7XG5cdFx0XHRcdGRlY3J5cHRlZENodW5rRmlsZVVyaXMucHVzaChhd2FpdCB0aGlzLmRvd25sb2FkQW5kRGVjcnlwdENodW5rTmF0aXZlKGJsb2IsIGJsb2JTZXJ2ZXJBY2Nlc3NJbmZvLCBzZXNzaW9uS2V5KSlcblx0XHRcdH0pLmNhdGNoKGFzeW5jIChlOiBFcnJvcikgPT4ge1xuXHRcdFx0XHQvLyBjbGVhbnVwIGV2ZXJ5IHRlbXBvcmFyeSBmaWxlIGluIHRoZSBuYXRpdmUgcGFydCBpbiBjYXNlIGFuIGVycm9yIG9jY3VyZWQgd2hlbiBkb3dubG9hZGluZyBjaHVuXG5cdFx0XHRcdGZvciAoY29uc3QgZGVjcnlwdGVkQ2h1bmtGaWxlVXJpIG9mIGRlY3J5cHRlZENodW5rRmlsZVVyaXMpIHtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLmZpbGVBcHAuZGVsZXRlRmlsZShkZWNyeXB0ZWRDaHVua0ZpbGVVcmkpXG5cdFx0XHRcdH1cblx0XHRcdFx0dGhyb3cgZVxuXHRcdFx0fSlcblx0XHR9XG5cdFx0Y29uc3QgZG9FdmljdFRva2VuID0gKCkgPT4gdGhpcy5ibG9iQWNjZXNzVG9rZW5GYWNhZGUuZXZpY3RSZWFkQmxvYnNUb2tlbihyZWZlcmVuY2luZ0luc3RhbmNlKVxuXG5cdFx0YXdhaXQgZG9CbG9iUmVxdWVzdFdpdGhSZXRyeShkb0Jsb2JSZXF1ZXN0LCBkb0V2aWN0VG9rZW4pXG5cblx0XHQvLyBub3cgZGVjcnlwdGVkQ2h1bmtGaWxlVXJpcyBoYXMgdGhlIGNvcnJlY3Qgb3JkZXIgb2YgZG93bmxvYWRlZCBibG9icywgYW5kIHdlIG5lZWQgdG8gdGVsbCBuYXRpdmUgdG8gam9pbiB0aGVtXG5cdFx0Ly8gY2hlY2sgaWYgb3V0cHV0IGFscmVhZHkgZXhpc3RzIGFuZCByZXR1cm4gY2FjaGVkP1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBkZWNyeXB0ZWRGaWxlVXJpID0gYXdhaXQgdGhpcy5maWxlQXBwLmpvaW5GaWxlcyhmaWxlTmFtZSwgZGVjcnlwdGVkQ2h1bmtGaWxlVXJpcylcblx0XHRcdGNvbnN0IHNpemUgPSBhd2FpdCB0aGlzLmZpbGVBcHAuZ2V0U2l6ZShkZWNyeXB0ZWRGaWxlVXJpKVxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0X3R5cGU6IFwiRmlsZVJlZmVyZW5jZVwiLFxuXHRcdFx0XHRuYW1lOiBmaWxlTmFtZSxcblx0XHRcdFx0bWltZVR5cGUsXG5cdFx0XHRcdHNpemUsXG5cdFx0XHRcdGxvY2F0aW9uOiBkZWNyeXB0ZWRGaWxlVXJpLFxuXHRcdFx0fVxuXHRcdH0gZmluYWxseSB7XG5cdFx0XHRmb3IgKGNvbnN0IHRtcEJsb2JGaWxlIG9mIGRlY3J5cHRlZENodW5rRmlsZVVyaXMpIHtcblx0XHRcdFx0YXdhaXQgdGhpcy5maWxlQXBwLmRlbGV0ZUZpbGUodG1wQmxvYkZpbGUpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyByZXNvbHZlU2Vzc2lvbktleShlbnRpdHk6IFNvbWVFbnRpdHkpOiBQcm9taXNlPEFlc0tleT4ge1xuXHRcdHJldHVybiBuZXZlck51bGwoYXdhaXQgdGhpcy5jcnlwdG9GYWNhZGUucmVzb2x2ZVNlc3Npb25LZXlGb3JJbnN0YW5jZShlbnRpdHkpKVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBlbmNyeXB0QW5kVXBsb2FkQ2h1bmsoY2h1bms6IFVpbnQ4QXJyYXksIGJsb2JTZXJ2ZXJBY2Nlc3NJbmZvOiBCbG9iU2VydmVyQWNjZXNzSW5mbywgc2Vzc2lvbktleTogQWVzS2V5KTogUHJvbWlzZTxCbG9iUmVmZXJlbmNlVG9rZW5XcmFwcGVyPiB7XG5cdFx0Y29uc3QgZW5jcnlwdGVkRGF0YSA9IGVuY3J5cHRCeXRlcyhzZXNzaW9uS2V5LCBjaHVuaylcblx0XHRjb25zdCBibG9iSGFzaCA9IHVpbnQ4QXJyYXlUb0Jhc2U2NChzaGEyNTZIYXNoKGVuY3J5cHRlZERhdGEpLnNsaWNlKDAsIDYpKVxuXHRcdGNvbnN0IHF1ZXJ5UGFyYW1zID0gYXdhaXQgdGhpcy5ibG9iQWNjZXNzVG9rZW5GYWNhZGUuY3JlYXRlUXVlcnlQYXJhbXMoYmxvYlNlcnZlckFjY2Vzc0luZm8sIHsgYmxvYkhhc2ggfSwgQmxvYkdldEluVHlwZVJlZilcblxuXHRcdHJldHVybiB0cnlTZXJ2ZXJzKFxuXHRcdFx0YmxvYlNlcnZlckFjY2Vzc0luZm8uc2VydmVycyxcblx0XHRcdGFzeW5jIChzZXJ2ZXJVcmwpID0+IHtcblx0XHRcdFx0Y29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnJlc3RDbGllbnQucmVxdWVzdChCTE9CX1NFUlZJQ0VfUkVTVF9QQVRILCBIdHRwTWV0aG9kLlBPU1QsIHtcblx0XHRcdFx0XHRxdWVyeVBhcmFtczogcXVlcnlQYXJhbXMsXG5cdFx0XHRcdFx0Ym9keTogZW5jcnlwdGVkRGF0YSxcblx0XHRcdFx0XHRyZXNwb25zZVR5cGU6IE1lZGlhVHlwZS5Kc29uLFxuXHRcdFx0XHRcdGJhc2VVcmw6IHNlcnZlclVybCxcblx0XHRcdFx0fSlcblx0XHRcdFx0cmV0dXJuIGF3YWl0IHRoaXMucGFyc2VCbG9iUG9zdE91dFJlc3BvbnNlKHJlc3BvbnNlKVxuXHRcdFx0fSxcblx0XHRcdGBjYW4ndCB1cGxvYWQgdG8gc2VydmVyYCxcblx0XHQpXG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIGVuY3J5cHRBbmRVcGxvYWROYXRpdmVDaHVuayhcblx0XHRmaWxlVXJpOiBGaWxlVXJpLFxuXHRcdGJsb2JTZXJ2ZXJBY2Nlc3NJbmZvOiBCbG9iU2VydmVyQWNjZXNzSW5mbyxcblx0XHRzZXNzaW9uS2V5OiBBZXNLZXksXG5cdCk6IFByb21pc2U8QmxvYlJlZmVyZW5jZVRva2VuV3JhcHBlcj4ge1xuXHRcdGNvbnN0IGVuY3J5cHRlZEZpbGVJbmZvID0gYXdhaXQgdGhpcy5hZXNBcHAuYWVzRW5jcnlwdEZpbGUoc2Vzc2lvbktleSwgZmlsZVVyaSlcblx0XHRjb25zdCBlbmNyeXB0ZWRDaHVua1VyaSA9IGVuY3J5cHRlZEZpbGVJbmZvLnVyaVxuXHRcdGNvbnN0IGJsb2JIYXNoID0gYXdhaXQgdGhpcy5maWxlQXBwLmhhc2hGaWxlKGVuY3J5cHRlZENodW5rVXJpKVxuXG5cdFx0cmV0dXJuIHRyeVNlcnZlcnMoXG5cdFx0XHRibG9iU2VydmVyQWNjZXNzSW5mby5zZXJ2ZXJzLFxuXHRcdFx0YXN5bmMgKHNlcnZlclVybCkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gYXdhaXQgdGhpcy51cGxvYWROYXRpdmUoZW5jcnlwdGVkQ2h1bmtVcmksIGJsb2JTZXJ2ZXJBY2Nlc3NJbmZvLCBzZXJ2ZXJVcmwsIGJsb2JIYXNoKVxuXHRcdFx0fSxcblx0XHRcdGBjYW4ndCB1cGxvYWQgdG8gc2VydmVyIGZyb20gbmF0aXZlYCxcblx0XHQpXG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIHVwbG9hZE5hdGl2ZShcblx0XHRsb2NhdGlvbjogc3RyaW5nLFxuXHRcdGJsb2JTZXJ2ZXJBY2Nlc3NJbmZvOiBCbG9iU2VydmVyQWNjZXNzSW5mbyxcblx0XHRzZXJ2ZXJVcmw6IHN0cmluZyxcblx0XHRibG9iSGFzaDogc3RyaW5nLFxuXHQpOiBQcm9taXNlPEJsb2JSZWZlcmVuY2VUb2tlbldyYXBwZXI+IHtcblx0XHRpZiAodGhpcy5zdXNwZW5zaW9uSGFuZGxlci5pc1N1c3BlbmRlZCgpKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5zdXNwZW5zaW9uSGFuZGxlci5kZWZlclJlcXVlc3QoKCkgPT4gdGhpcy51cGxvYWROYXRpdmUobG9jYXRpb24sIGJsb2JTZXJ2ZXJBY2Nlc3NJbmZvLCBzZXJ2ZXJVcmwsIGJsb2JIYXNoKSlcblx0XHR9XG5cdFx0Y29uc3QgcXVlcnlQYXJhbXMgPSBhd2FpdCB0aGlzLmJsb2JBY2Nlc3NUb2tlbkZhY2FkZS5jcmVhdGVRdWVyeVBhcmFtcyhibG9iU2VydmVyQWNjZXNzSW5mbywgeyBibG9iSGFzaCB9LCBCbG9iR2V0SW5UeXBlUmVmKVxuXHRcdGNvbnN0IHNlcnZpY2VVcmwgPSBuZXcgVVJMKEJMT0JfU0VSVklDRV9SRVNUX1BBVEgsIHNlcnZlclVybClcblx0XHRjb25zdCBmdWxsVXJsID0gYWRkUGFyYW1zVG9Vcmwoc2VydmljZVVybCwgcXVlcnlQYXJhbXMpXG5cdFx0Y29uc3QgeyBzdXNwZW5zaW9uVGltZSwgcmVzcG9uc2VCb2R5LCBzdGF0dXNDb2RlLCBlcnJvcklkLCBwcmVjb25kaXRpb24gfSA9IGF3YWl0IHRoaXMuZmlsZUFwcC51cGxvYWQobG9jYXRpb24sIGZ1bGxVcmwudG9TdHJpbmcoKSwgSHR0cE1ldGhvZC5QT1NULCB7fSkgLy8gYmxvYlJlZmVyZW5jZVRva2VuIGluIHRoZSByZXNwb25zZSBib2R5XG5cblx0XHRpZiAoc3RhdHVzQ29kZSA9PT0gMjAxICYmIHJlc3BvbnNlQm9keSAhPSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5wYXJzZUJsb2JQb3N0T3V0UmVzcG9uc2UodWludDhBcnJheVRvU3RyaW5nKFwidXRmLThcIiwgcmVzcG9uc2VCb2R5KSlcblx0XHR9IGVsc2UgaWYgKHJlc3BvbnNlQm9keSA9PSBudWxsKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJubyByZXNwb25zZSBib2R5XCIpXG5cdFx0fSBlbHNlIGlmIChpc1N1c3BlbnNpb25SZXNwb25zZShzdGF0dXNDb2RlLCBzdXNwZW5zaW9uVGltZSkpIHtcblx0XHRcdHRoaXMuc3VzcGVuc2lvbkhhbmRsZXIuYWN0aXZhdGVTdXNwZW5zaW9uSWZJbmFjdGl2ZShOdW1iZXIoc3VzcGVuc2lvblRpbWUpLCBzZXJ2aWNlVXJsKVxuXHRcdFx0cmV0dXJuIHRoaXMuc3VzcGVuc2lvbkhhbmRsZXIuZGVmZXJSZXF1ZXN0KCgpID0+IHRoaXMudXBsb2FkTmF0aXZlKGxvY2F0aW9uLCBibG9iU2VydmVyQWNjZXNzSW5mbywgc2VydmVyVXJsLCBibG9iSGFzaCkpXG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IGhhbmRsZVJlc3RFcnJvcihzdGF0dXNDb2RlLCBgIHwgJHtIdHRwTWV0aG9kLlBPU1R9ICR7ZnVsbFVybC50b1N0cmluZygpfSBmYWlsZWQgdG8gbmF0aXZlbHkgdXBsb2FkIGJsb2JgLCBlcnJvcklkLCBwcmVjb25kaXRpb24pXG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBwYXJzZUJsb2JQb3N0T3V0UmVzcG9uc2UoanNvbkRhdGE6IHN0cmluZyk6IFByb21pc2U8QmxvYlJlZmVyZW5jZVRva2VuV3JhcHBlcj4ge1xuXHRcdGNvbnN0IHJlc3BvbnNlVHlwZU1vZGVsID0gYXdhaXQgcmVzb2x2ZVR5cGVSZWZlcmVuY2UoQmxvYlBvc3RPdXRUeXBlUmVmKVxuXHRcdGNvbnN0IGluc3RhbmNlID0gSlNPTi5wYXJzZShqc29uRGF0YSlcblx0XHRjb25zdCB7IGJsb2JSZWZlcmVuY2VUb2tlbiB9ID0gYXdhaXQgdGhpcy5pbnN0YW5jZU1hcHBlci5kZWNyeXB0QW5kTWFwVG9JbnN0YW5jZTxCbG9iUG9zdE91dD4ocmVzcG9uc2VUeXBlTW9kZWwsIGluc3RhbmNlLCBudWxsKVxuXHRcdC8vIGlzIG51bGwgaW4gY2FzZSBvZiBwb3N0IG11bHRpcGxlIHRvIHRoZSBCbG9iU2VydmljZSwgY3VycmVudGx5IG9ubHkgc3VwcG9ydGVkIGluIHRoZSBydXN0LXNka1xuXHRcdC8vIHBvc3Qgc2luZ2xlIGFsd2F5cyBoYXMgYSB2YWxpZCBibG9iUmVmZXJuY2VUb2tlbiB3aXRoIGNhcmRpbmFsaXR5IG9uZS5cblx0XHRpZiAoYmxvYlJlZmVyZW5jZVRva2VuID09IG51bGwpIHtcblx0XHRcdHRocm93IG5ldyBQcm9ncmFtbWluZ0Vycm9yKFwiZW1wdHkgYmxvYlJlZmVyZW5jZVRva2VuIG5vdCBhbGxvd2VkIGZvciBwb3N0IHNpbmdsZSBibG9iXCIpXG5cdFx0fVxuXHRcdHJldHVybiBjcmVhdGVCbG9iUmVmZXJlbmNlVG9rZW5XcmFwcGVyKHsgYmxvYlJlZmVyZW5jZVRva2VuIH0pXG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIGRvd25sb2FkQW5kRGVjcnlwdE11bHRpcGxlQmxvYnNPZkFyY2hpdmUoXG5cdFx0YmxvYnM6IHJlYWRvbmx5IEJsb2JbXSxcblx0XHRibG9iU2VydmVyQWNjZXNzSW5mbzogQmxvYlNlcnZlckFjY2Vzc0luZm8sXG5cdFx0c2Vzc2lvbktleTogQWVzS2V5LFxuXHRcdGJsb2JMb2FkT3B0aW9uczogQmxvYkxvYWRPcHRpb25zLFxuXHQpOiBQcm9taXNlPE1hcDxJZCwgVWludDhBcnJheT4+IHtcblx0XHRjb25zdCBtYXBXaXRoRW5jcnlwdGVkQmxvYnMgPSBhd2FpdCB0aGlzLmRvd25sb2FkQmxvYnNPZk9uZUFyY2hpdmUoYmxvYnMsIGJsb2JTZXJ2ZXJBY2Nlc3NJbmZvLCBibG9iTG9hZE9wdGlvbnMpXG5cdFx0cmV0dXJuIG1hcE1hcChtYXBXaXRoRW5jcnlwdGVkQmxvYnMsIChibG9iKSA9PiBhZXNEZWNyeXB0KHNlc3Npb25LZXksIGJsb2IpKVxuXHR9XG5cblx0LyoqXG5cdCAqIERvd25sb2FkIGJsb2JzIG9mIGEgc2luZ2xlIGFyY2hpdmUgaW4gYSBzaW5nbGUgcmVxdWVzdFxuXHQgKiBAcmV0dXJuIG1hcCBmcm9tIGJsb2IgaWQgdG8gdGhlIGRhdGFcblx0ICovXG5cdHByaXZhdGUgYXN5bmMgZG93bmxvYWRCbG9ic09mT25lQXJjaGl2ZShcblx0XHRibG9iczogcmVhZG9ubHkgQmxvYltdLFxuXHRcdGJsb2JTZXJ2ZXJBY2Nlc3NJbmZvOiBCbG9iU2VydmVyQWNjZXNzSW5mbyxcblx0XHRibG9iTG9hZE9wdGlvbnM6IEJsb2JMb2FkT3B0aW9ucyxcblx0KTogUHJvbWlzZTxNYXA8SWQsIFVpbnQ4QXJyYXk+PiB7XG5cdFx0aWYgKGlzRW1wdHkoYmxvYnMpKSB7XG5cdFx0XHR0aHJvdyBuZXcgUHJvZ3JhbW1pbmdFcnJvcihcIkJsb2JzIGFyZSBlbXB0eVwiKVxuXHRcdH1cblx0XHRjb25zdCBhcmNoaXZlSWQgPSBnZXRGaXJzdE9yVGhyb3coYmxvYnMpLmFyY2hpdmVJZFxuXHRcdGlmIChibG9icy5zb21lKChibG9iKSA9PiBibG9iLmFyY2hpdmVJZCAhPT0gYXJjaGl2ZUlkKSkge1xuXHRcdFx0dGhyb3cgbmV3IFByb2dyYW1taW5nRXJyb3IoXCJNdXN0IG9ubHkgcmVxdWVzdCBibG9icyBvZiB0aGUgc2FtZSBhcmNoaXZlIHRvZ2V0aGVyXCIpXG5cdFx0fVxuXHRcdGNvbnN0IGdldERhdGEgPSBjcmVhdGVCbG9iR2V0SW4oe1xuXHRcdFx0YXJjaGl2ZUlkLFxuXHRcdFx0YmxvYklkOiBudWxsLFxuXHRcdFx0YmxvYklkczogYmxvYnMubWFwKCh7IGJsb2JJZCB9KSA9PiBjcmVhdGVCbG9iSWQoeyBibG9iSWQ6IGJsb2JJZCB9KSksXG5cdFx0fSlcblx0XHRjb25zdCBCbG9iR2V0SW5UeXBlTW9kZWwgPSBhd2FpdCByZXNvbHZlVHlwZVJlZmVyZW5jZShCbG9iR2V0SW5UeXBlUmVmKVxuXHRcdGNvbnN0IGxpdGVyYWxHZXREYXRhID0gYXdhaXQgdGhpcy5pbnN0YW5jZU1hcHBlci5lbmNyeXB0QW5kTWFwVG9MaXRlcmFsKEJsb2JHZXRJblR5cGVNb2RlbCwgZ2V0RGF0YSwgbnVsbClcblx0XHRjb25zdCBib2R5ID0gSlNPTi5zdHJpbmdpZnkobGl0ZXJhbEdldERhdGEpXG5cdFx0Y29uc3QgcXVlcnlQYXJhbXMgPSBhd2FpdCB0aGlzLmJsb2JBY2Nlc3NUb2tlbkZhY2FkZS5jcmVhdGVRdWVyeVBhcmFtcyhibG9iU2VydmVyQWNjZXNzSW5mbywge30sIEJsb2JHZXRJblR5cGVSZWYpXG5cdFx0Y29uc3QgY29uY2F0QmluYXJ5RGF0YSA9IGF3YWl0IHRyeVNlcnZlcnMoXG5cdFx0XHRibG9iU2VydmVyQWNjZXNzSW5mby5zZXJ2ZXJzLFxuXHRcdFx0YXN5bmMgKHNlcnZlclVybCkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gYXdhaXQgdGhpcy5yZXN0Q2xpZW50LnJlcXVlc3QoQkxPQl9TRVJWSUNFX1JFU1RfUEFUSCwgSHR0cE1ldGhvZC5HRVQsIHtcblx0XHRcdFx0XHRxdWVyeVBhcmFtczogcXVlcnlQYXJhbXMsXG5cdFx0XHRcdFx0Ym9keSxcblx0XHRcdFx0XHRyZXNwb25zZVR5cGU6IE1lZGlhVHlwZS5CaW5hcnksXG5cdFx0XHRcdFx0YmFzZVVybDogc2VydmVyVXJsLFxuXHRcdFx0XHRcdG5vQ09SUzogdHJ1ZSxcblx0XHRcdFx0XHRoZWFkZXJzOiBibG9iTG9hZE9wdGlvbnMuZXh0cmFIZWFkZXJzLFxuXHRcdFx0XHRcdHN1c3BlbnNpb25CZWhhdmlvcjogYmxvYkxvYWRPcHRpb25zLnN1c3BlbnNpb25CZWhhdmlvcixcblx0XHRcdFx0fSlcblx0XHRcdH0sXG5cdFx0XHRgY2FuJ3QgZG93bmxvYWQgZnJvbSBzZXJ2ZXIgYCxcblx0XHQpXG5cdFx0cmV0dXJuIHBhcnNlTXVsdGlwbGVCbG9ic1Jlc3BvbnNlKGNvbmNhdEJpbmFyeURhdGEpXG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIGRvd25sb2FkQW5kRGVjcnlwdENodW5rTmF0aXZlKGJsb2I6IEJsb2IsIGJsb2JTZXJ2ZXJBY2Nlc3NJbmZvOiBCbG9iU2VydmVyQWNjZXNzSW5mbywgc2Vzc2lvbktleTogQWVzS2V5KTogUHJvbWlzZTxGaWxlVXJpPiB7XG5cdFx0Y29uc3QgeyBhcmNoaXZlSWQsIGJsb2JJZCB9ID0gYmxvYlxuXHRcdGNvbnN0IGdldERhdGEgPSBjcmVhdGVCbG9iR2V0SW4oe1xuXHRcdFx0YXJjaGl2ZUlkLFxuXHRcdFx0YmxvYklkLFxuXHRcdFx0YmxvYklkczogW10sXG5cdFx0fSlcblx0XHRjb25zdCBCbG9iR2V0SW5UeXBlTW9kZWwgPSBhd2FpdCByZXNvbHZlVHlwZVJlZmVyZW5jZShCbG9iR2V0SW5UeXBlUmVmKVxuXHRcdGNvbnN0IGxpdGVyYWxHZXREYXRhID0gYXdhaXQgdGhpcy5pbnN0YW5jZU1hcHBlci5lbmNyeXB0QW5kTWFwVG9MaXRlcmFsKEJsb2JHZXRJblR5cGVNb2RlbCwgZ2V0RGF0YSwgbnVsbClcblx0XHRjb25zdCBfYm9keSA9IEpTT04uc3RyaW5naWZ5KGxpdGVyYWxHZXREYXRhKVxuXG5cdFx0Y29uc3QgYmxvYkZpbGVuYW1lID0gYmxvYklkICsgXCIuYmxvYlwiXG5cblx0XHRyZXR1cm4gdHJ5U2VydmVycyhcblx0XHRcdGJsb2JTZXJ2ZXJBY2Nlc3NJbmZvLnNlcnZlcnMsXG5cdFx0XHRhc3luYyAoc2VydmVyVXJsKSA9PiB7XG5cdFx0XHRcdHJldHVybiBhd2FpdCB0aGlzLmRvd25sb2FkTmF0aXZlKHNlcnZlclVybCwgYmxvYlNlcnZlckFjY2Vzc0luZm8sIHNlc3Npb25LZXksIGJsb2JGaWxlbmFtZSwgeyBfYm9keSB9KVxuXHRcdFx0fSxcblx0XHRcdGBjYW4ndCBkb3dubG9hZCBuYXRpdmUgZnJvbSBzZXJ2ZXIgYCxcblx0XHQpXG5cdH1cblxuXHQvKipcblx0ICogQHJldHVybiB0aGUgdXJpIG9mIHRoZSBkZWNyeXB0ZWQgYmxvYlxuXHQgKi9cblx0cHJpdmF0ZSBhc3luYyBkb3dubG9hZE5hdGl2ZShcblx0XHRzZXJ2ZXJVcmw6IHN0cmluZyxcblx0XHRibG9iU2VydmVyQWNjZXNzSW5mbzogQmxvYlNlcnZlckFjY2Vzc0luZm8sXG5cdFx0c2Vzc2lvbktleTogQWVzS2V5LFxuXHRcdGZpbGVOYW1lOiBzdHJpbmcsXG5cdFx0YWRkaXRpb25hbFBhcmFtczogRGljdCxcblx0KTogUHJvbWlzZTxGaWxlVXJpPiB7XG5cdFx0aWYgKHRoaXMuc3VzcGVuc2lvbkhhbmRsZXIuaXNTdXNwZW5kZWQoKSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuc3VzcGVuc2lvbkhhbmRsZXIuZGVmZXJSZXF1ZXN0KCgpID0+IHRoaXMuZG93bmxvYWROYXRpdmUoc2VydmVyVXJsLCBibG9iU2VydmVyQWNjZXNzSW5mbywgc2Vzc2lvbktleSwgZmlsZU5hbWUsIGFkZGl0aW9uYWxQYXJhbXMpKVxuXHRcdH1cblx0XHRjb25zdCBzZXJ2aWNlVXJsID0gbmV3IFVSTChCTE9CX1NFUlZJQ0VfUkVTVF9QQVRILCBzZXJ2ZXJVcmwpXG5cdFx0Y29uc3QgdXJsID0gYWRkUGFyYW1zVG9Vcmwoc2VydmljZVVybCwgYXdhaXQgdGhpcy5ibG9iQWNjZXNzVG9rZW5GYWNhZGUuY3JlYXRlUXVlcnlQYXJhbXMoYmxvYlNlcnZlckFjY2Vzc0luZm8sIGFkZGl0aW9uYWxQYXJhbXMsIEJsb2JHZXRJblR5cGVSZWYpKVxuXHRcdGNvbnN0IHsgc3RhdHVzQ29kZSwgZW5jcnlwdGVkRmlsZVVyaSwgc3VzcGVuc2lvblRpbWUsIGVycm9ySWQsIHByZWNvbmRpdGlvbiB9ID0gYXdhaXQgdGhpcy5maWxlQXBwLmRvd25sb2FkKHVybC50b1N0cmluZygpLCBmaWxlTmFtZSwge30pXG5cdFx0aWYgKHN0YXR1c0NvZGUgPT0gMjAwICYmIGVuY3J5cHRlZEZpbGVVcmkgIT0gbnVsbCkge1xuXHRcdFx0Y29uc3QgZGVjcnlwdGVkRmlsZVVybCA9IGF3YWl0IHRoaXMuYWVzQXBwLmFlc0RlY3J5cHRGaWxlKHNlc3Npb25LZXksIGVuY3J5cHRlZEZpbGVVcmkpXG5cdFx0XHR0cnkge1xuXHRcdFx0XHRhd2FpdCB0aGlzLmZpbGVBcHAuZGVsZXRlRmlsZShlbmNyeXB0ZWRGaWxlVXJpKVxuXHRcdFx0fSBjYXRjaCB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiRmFpbGVkIHRvIGRlbGV0ZSBlbmNyeXB0ZWQgZmlsZVwiLCBlbmNyeXB0ZWRGaWxlVXJpKVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGRlY3J5cHRlZEZpbGVVcmxcblx0XHR9IGVsc2UgaWYgKGlzU3VzcGVuc2lvblJlc3BvbnNlKHN0YXR1c0NvZGUsIHN1c3BlbnNpb25UaW1lKSkge1xuXHRcdFx0dGhpcy5zdXNwZW5zaW9uSGFuZGxlci5hY3RpdmF0ZVN1c3BlbnNpb25JZkluYWN0aXZlKE51bWJlcihzdXNwZW5zaW9uVGltZSksIHNlcnZpY2VVcmwpXG5cdFx0XHRyZXR1cm4gdGhpcy5zdXNwZW5zaW9uSGFuZGxlci5kZWZlclJlcXVlc3QoKCkgPT4gdGhpcy5kb3dubG9hZE5hdGl2ZShzZXJ2ZXJVcmwsIGJsb2JTZXJ2ZXJBY2Nlc3NJbmZvLCBzZXNzaW9uS2V5LCBmaWxlTmFtZSwgYWRkaXRpb25hbFBhcmFtcykpXG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IGhhbmRsZVJlc3RFcnJvcihzdGF0dXNDb2RlLCBgIHwgJHtIdHRwTWV0aG9kLkdFVH0gZmFpbGVkIHRvIG5hdGl2ZWx5IGRvd25sb2FkIGF0dGFjaG1lbnRgLCBlcnJvcklkLCBwcmVjb25kaXRpb24pXG5cdFx0fVxuXHR9XG59XG5cbi8qKlxuICogRGVzZXJpYWxpemVzIGEgbGlzdCBvZiBCbG9iV3JhcHBlcnMgdGhhdCBhcmUgaW4gdGhlIGZvbGxvd2luZyBiaW5hcnkgZm9ybWF0XG4gKiBlbGVtZW50IFsgI2Jsb2JzIF0gWyBibG9iSWQgXSBbIGJsb2JIYXNoIF0gW2Jsb2JTaXplXSBbYmxvYl0gICAgIFsgLiAuIC4gXSAgICBbIGJsb2JOSWQgXSBbIGJsb2JOSGFzaCBdIFtibG9iTlNpemVdIFtibG9iTl1cbiAqIGJ5dGVzICAgICA0ICAgICAgICAgIDkgICAgICAgICAgNiAgICAgICAgICAgNCAgICAgICAgICBibG9iU2l6ZSAgICAgICAgICAgICAgICAgIDkgICAgICAgICAgNiAgICAgICAgICAgIDQgICAgICAgICAgIGJsb2JTaXplXG4gKlxuICogQHJldHVybiBhIG1hcCBmcm9tIGJsb2JJZCB0byB0aGUgYmluYXJ5IGRhdGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTXVsdGlwbGVCbG9ic1Jlc3BvbnNlKGNvbmNhdEJpbmFyeURhdGE6IFVpbnQ4QXJyYXkpOiBNYXA8SWQsIFVpbnQ4QXJyYXk+IHtcblx0Y29uc3QgZGF0YVZpZXcgPSBuZXcgRGF0YVZpZXcoY29uY2F0QmluYXJ5RGF0YS5idWZmZXIpXG5cdGNvbnN0IHJlc3VsdCA9IG5ldyBNYXA8SWQsIFVpbnQ4QXJyYXk+KClcblx0Y29uc3QgYmxvYkNvdW50ID0gZGF0YVZpZXcuZ2V0SW50MzIoMClcblx0aWYgKGJsb2JDb3VudCA9PT0gMCkge1xuXHRcdHJldHVybiByZXN1bHRcblx0fVxuXHRpZiAoYmxvYkNvdW50IDwgMCkge1xuXHRcdHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBibG9iIGNvdW50OiAke2Jsb2JDb3VudH1gKVxuXHR9XG5cdGxldCBvZmZzZXQgPSA0XG5cdHdoaWxlIChvZmZzZXQgPCBjb25jYXRCaW5hcnlEYXRhLmxlbmd0aCkge1xuXHRcdGNvbnN0IGJsb2JJZEJ5dGVzID0gY29uY2F0QmluYXJ5RGF0YS5zbGljZShvZmZzZXQsIG9mZnNldCArIDkpXG5cdFx0Y29uc3QgYmxvYklkID0gYmFzZTY0VG9CYXNlNjRFeHQodWludDhBcnJheVRvQmFzZTY0KGJsb2JJZEJ5dGVzKSlcblxuXHRcdGNvbnN0IGJsb2JTaXplID0gZGF0YVZpZXcuZ2V0SW50MzIob2Zmc2V0ICsgMTUpXG5cdFx0Y29uc3QgZGF0YVN0YXJ0T2Zmc2V0ID0gb2Zmc2V0ICsgMTlcblx0XHRpZiAoYmxvYlNpemUgPCAwIHx8IGRhdGFTdGFydE9mZnNldCArIGJsb2JTaXplID4gY29uY2F0QmluYXJ5RGF0YS5sZW5ndGgpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBibG9iIHNpemU6ICR7YmxvYlNpemV9LiBSZW1haW5pbmcgbGVuZ3RoOiAke2NvbmNhdEJpbmFyeURhdGEubGVuZ3RoIC0gZGF0YVN0YXJ0T2Zmc2V0fWApXG5cdFx0fVxuXHRcdGNvbnN0IGNvbnRlbnRzID0gY29uY2F0QmluYXJ5RGF0YS5zbGljZShkYXRhU3RhcnRPZmZzZXQsIGRhdGFTdGFydE9mZnNldCArIGJsb2JTaXplKVxuXHRcdHJlc3VsdC5zZXQoYmxvYklkLCBjb250ZW50cylcblx0XHRvZmZzZXQgPSBkYXRhU3RhcnRPZmZzZXQgKyBibG9iU2l6ZVxuXHR9XG5cdGlmIChibG9iQ291bnQgIT09IHJlc3VsdC5zaXplKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKGBQYXJzZWQgd3JvbmcgbnVtYmVyIG9mIGJsb2JzOiAke2Jsb2JDb3VudH0uIEV4cGVjdGVkOiAke3Jlc3VsdC5zaXplfWApXG5cdH1cblx0cmV0dXJuIHJlc3VsdFxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUEwQ0Esb0JBQW9CO01BQ1AsMEJBQTBCLFFBQVEsWUFBWSxJQUFJLEdBQUcsWUFBWSxLQUFLLGFBQWEsQ0FBQztNQUNwRixNQUFNO0lBaUJOLGFBQU4sTUFBaUI7Q0FDdkIsWUFDa0JBLFlBQ0FDLG1CQUNBQyxTQUNBQyxRQUNBQyxnQkFDQUMsY0FDQUMsdUJBQ2hCO0VBa2JGLEtBemJrQjtFQXliakIsS0F4YmlCO0VBd2JoQixLQXZiZ0I7RUF1YmYsS0F0YmU7RUFzYmQsS0FyYmM7RUFxYmIsS0FwYmE7RUFvYlosS0FuYlk7Q0FDZDs7Ozs7OztDQVFKLE1BQU0saUJBQWlCQyxpQkFBa0NDLFVBQXNCQyxjQUFrQkMsWUFBMEQ7RUFDMUosTUFBTSxTQUFTLHdCQUF3QixxQkFBcUIsU0FBUztFQUNyRSxNQUFNLGdCQUFnQixZQUFZO0dBQ2pDLE1BQU0sdUJBQXVCLE1BQU0sS0FBSyxzQkFBc0Isa0JB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