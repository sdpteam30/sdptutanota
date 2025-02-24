import { TutanotaError } from "./dist-chunk.js";
import { ProgrammingError } from "./ProgrammingError-chunk.js";
import { assertWorkerOrNode, getWebsocketBaseUrl, isAdminClient, isAndroidApp, isApp, isBrowser, isIOSApp, isMainOrNode, isOfflineStorageAvailable, isTest } from "./Env-chunk.js";
import "./ClientDetector-chunk.js";
import { DAY_IN_MILLIS, LazyLoaded, TypeRef, arrayEquals, assertNotNull, base64ToBase64Url, base64ToUint8Array, byteArraysToBytes, bytesToByteArrays, clone, concat, debounce, deduplicate, defer, delay, downcast, first, getDayShifted, getFirstOrThrow, getFromMap, getStartOfDay, groupBy, groupByAndMap, isEmpty, isNotNull, isSameTypeRef, isSameTypeRefByAttr, lazyMemoized, neverNull, noOp, ofClass, pMap, remove, stringToUtf8Uint8Array, typedEntries, typedKeys, uint8ArrayToBase64, uint8ArrayToHex, utf8Uint8ArrayToString } from "./dist2-chunk.js";
import { AccountType, BlobAccessTokenKind, BucketPermissionType, Const, CryptoProtocolVersion, EncryptionAuthStatus, GroupKeyRotationType, GroupType, KdfType, OFFLINE_STORAGE_DEFAULT_TIME_RANGE_DAYS, OperationType, PermissionType, PublicKeyIdentifierType, SYSTEM_GROUP_MAIL_ADDRESS, asCryptoProtoocolVersion, asPublicKeyIdentifier, assertEnumValue } from "./TutanotaConstants-chunk.js";
import { AssociationType, CUSTOM_MAX_ID, Cardinality, GENERATED_MAX_ID, GENERATED_MIN_ID, Type, ValueType, constructMailSetEntryId, elementIdPart, firstBiggerThanSecond, firstBiggerThanSecondCustomId, getElementId, getListId, isSameId, listIdPart, timestampToGeneratedId } from "./EntityUtils-chunk.js";
import "./TypeModels-chunk.js";
import { CalendarEventTypeRef, CalendarEventUpdateTypeRef, CalendarGroupRootTypeRef, ContactListEntryTypeRef, ContactListGroupRootTypeRef, ContactListTypeRef, ContactTypeRef, EmailTemplateTypeRef, FileSystemTypeRef, FileTypeRef, InternalRecipientKeyDataTypeRef, KnowledgeBaseEntryTypeRef, MailBoxTypeRef, MailDetailsBlobTypeRef, MailDetailsDraftTypeRef, MailFolderTypeRef, MailSetEntryTypeRef, MailTypeRef, MailboxGroupRootTypeRef, MailboxPropertiesTypeRef, TemplateGroupRootTypeRef, TutanotaPropertiesTypeRef, UserSettingsGroupRootTypeRef, createEncryptTutanotaPropertiesData, createEntropyData, createInternalRecipientKeyData, createMail, createMailBox, createSymEncInternalRecipientKeyData } from "./TypeRefs-chunk.js";
import "./TypeModels2-chunk.js";
import { AccountingInfoTypeRef, AuditLogEntryTypeRef, BucketKeyTypeRef, BucketPermissionTypeRef, CustomerInfoTypeRef, CustomerServerPropertiesTypeRef, CustomerTypeRef, GiftCardTypeRef, GroupInfoTypeRef, GroupKeyTypeRef, GroupKeyUpdateTypeRef, GroupMemberTypeRef, GroupTypeRef, InvoiceTypeRef, KeyRotationTypeRef, MissedNotificationTypeRef, OrderProcessingAgreementTypeRef, PermissionTypeRef, PushIdentifierTypeRef, ReceivedGroupInvitationTypeRef, RecoverCodeTypeRef, SentGroupInvitationTypeRef, UserAlarmInfoTypeRef, UserGroupKeyDistributionTypeRef, UserGroupRootTypeRef, UserTypeRef, WhitelabelChildTypeRef, createAdminGroupKeyDistributionElement, createAdminGroupKeyRotationPostIn, createAdminGroupKeyRotationPutIn, createCustomerInfo, createGroupKeyRotationData, createGroupKeyRotationPostIn, createGroupKeyUpdateData, createGroupMembershipKeyData, createGroupMembershipUpdateData, createInstanceSessionKey, createKeyMac, createKeyPair, createMembershipPutIn, createPubEncKeyData, createPublicKeyGetIn, createPublicKeyPutIn, createRecoverCodeData, createUpdatePermissionKeyData, createUpdateSessionKeysPostIn, createUserGroupKeyRotationData, createUserGroupKeyRotationPostIn, createWebsocketLeaderStatus } from "./TypeRefs2-chunk.js";
import "./ParserCombinator-chunk.js";
import { Logger, replaceNativeLogger } from "./Logger-chunk.js";
import "./ErrorHandler-chunk.js";
import { HttpMethod, MediaType, modelInfos, resolveTypeReference } from "./EntityFunctions-chunk.js";
import "./TypeModels3-chunk.js";
import "./ModelInfo-chunk.js";
import { RecipientNotResolvedError, SessionKeyNotFoundError } from "./ErrorUtils-chunk.js";
import { ConnectionError, InvalidDataError, LockedError, NotAuthenticatedError, NotFoundError, PayloadTooLargeError, ServiceUnavailableError, TooManyRequestsError } from "./RestError-chunk.js";
import "./SetupMultipleError-chunk.js";
import { OutOfSyncError } from "./OutOfSyncError-chunk.js";
import "./CancelledError-chunk.js";
import "./EventQueue-chunk.js";
import { CustomCacheHandlerMap, DefaultEntityRestCache, EntityRestClient, EventBusClient, OfflineStorage, WebWorkerTransport, customIdToBase64Url, ensureBase64Ext, expandId, typeRefToPath } from "./EntityRestClient-chunk.js";
import "./SuspensionError-chunk.js";
import { LoginIncompleteError } from "./LoginIncompleteError-chunk.js";
import { CryptoError } from "./CryptoError-chunk.js";
import "./error-chunk.js";
import { RecipientsNotFoundError } from "./RecipientsNotFoundError-chunk.js";
import "./DbError-chunk.js";
import "./QuotaExceededError-chunk.js";
import "./DeviceStorageUnavailableError-chunk.js";
import "./MailBodyTooLargeError-chunk.js";
import "./ImportError-chunk.js";
import "./WebauthnError-chunk.js";
import "./PermissionError-chunk.js";
import { MessageDispatcher, Request, errorToObj } from "./MessageDispatcher-chunk.js";
import { exposeLocalDelayed, exposeRemote } from "./WorkerProxy-chunk.js";
import "./EntityUpdateUtils-chunk.js";
import { ENABLE_MAC, IV_BYTE_LENGTH, KEY_LENGTH_BYTES_AES_256, KeyPairType, ML_KEM_RAND_AMOUNT_OF_ENTROPY, aes256RandomKey, aesDecrypt, aesEncrypt, authenticatedAesDecrypt, bitArrayToUint8Array, createAuthVerifier, decapsulate, decryptKey, eccDecapsulate, eccEncapsulate, encapsulate, encryptKey, generateEccKeyPair, generateKeyFromPassphrase, generateKeyPair, getKeyLengthBytes, hexToRsaPublicKey, hkdf, isEncryptedPqKeyPairs, isPqKeyPairs, isPqPublicKey, isRsaEccKeyPair, isRsaOrRsaEccKeyPair, isRsaPublicKey, keyToBase64, keyToUint8Array, kyberPublicKeyToBytes, pqKeyPairsToPublicKeys, random, rsaDecrypt, rsaEncrypt, sha256Hash, uint8ArrayToBitArray, uint8ArrayToKey } from "./dist3-chunk.js";
import { KeyLoaderFacade, checkKeyVersionConstraints, parseKeyVersion } from "./KeyLoaderFacade-chunk.js";
import { SessionType } from "./SessionType-chunk.js";
import { AdminGroupKeyRotationService, GroupKeyRotationInfoService, GroupKeyRotationService, MembershipService, PublicKeyService, UpdatePermissionKeyService, UpdateSessionKeysService, UserGroupKeyRotationService } from "./Services-chunk.js";
import { EntityClient } from "./EntityClient-chunk.js";
import "./PageContextLoginListener-chunk.js";
import "./CredentialType-chunk.js";
import { CryptoWrapper, encryptBytes, encryptKeyWithVersionedKey } from "./CryptoWrapper-chunk.js";
import { LoginFacade } from "./LoginFacade-chunk.js";
import { RestClient } from "./RestClient-chunk.js";
import { ExportFacadeSendDispatcher, FileFacadeSendDispatcher, InterWindowEventFacadeSendDispatcher, NativeFileApp, NativePushFacadeSendDispatcher } from "./InterWindowEventFacadeSendDispatcher-chunk.js";
import { birthdayToIsoDate, oldBirthdayToBirthday } from "./BirthdayUtils-chunk.js";
import { EncryptTutanotaPropertiesService, EntropyService } from "./Services2-chunk.js";
import { compress, uncompress } from "./Compression-chunk.js";
import { DomainConfigProvider, FolderSystem, NoZoneDateProvider, SchedulerImpl } from "./FolderSystem-chunk.js";
import { BlobAccessTokenService, createBlobAccessTokenPostIn, createBlobReadData, createBlobWriteData, createInstanceId } from "./Services3-chunk.js";
import { getUserGroupMemberships } from "./GroupUtils-chunk.js";
import { KeyAuthenticationFacade, asPQPublicKeys, brandKeyMac } from "./KeyAuthenticationFacade-chunk.js";
import { isDraft, isSpamOrTrashFolder } from "./MailChecks-chunk.js";

//#region src/common/api/worker/SuspensionHandler.ts
var SuspensionHandler = class {
	_isSuspended;
	_suspendedUntil;
	_deferredRequests;
	_hasSentInfoMessage;
	_timeout;
	constructor(infoMessageHandler, systemTimeout) {
		this.infoMessageHandler = infoMessageHandler;
		this._isSuspended = false;
		this._suspendedUntil = 0;
		this._deferredRequests = [];
		this._hasSentInfoMessage = false;
		this._timeout = systemTimeout;
	}
	/**
	* Activates suspension states for the given amount of seconds. After the end of the suspension time all deferred requests are executed.
	*/
	activateSuspensionIfInactive(suspensionDurationSeconds, resourceURL) {
		if (!this.isSuspended()) {
			console.log(`Activating suspension (${resourceURL}):  ${suspensionDurationSeconds}s`);
			this._isSuspended = true;
			const suspensionStartTime = Date.now();
			this._timeout.setTimeout(async () => {
				this._isSuspended = false;
				console.log(`Suspension released after ${(Date.now() - suspensionStartTime) / 1e3}s`);
				await this._onSuspensionComplete();
			}, suspensionDurationSeconds * 1e3);
			if (!this._hasSentInfoMessage) {
				this.infoMessageHandler.onInfoMessage({
					translationKey: "clientSuspensionWait_label",
					args: {}
				});
				this._hasSentInfoMessage = true;
			}
		}
	}
	isSuspended() {
		return this._isSuspended;
	}
	/**
	* Adds a request to the deferred queue.
	* @param request
	* @returns {Promise<T>}
	*/
	deferRequest(request) {
		if (this._isSuspended) {
			const deferredObject = defer();
			this._deferredRequests.push(deferredObject);
			deferredObject.promise = deferredObject.promise.then(() => request());
			return deferredObject.promise;
		} else return request();
	}
	async _onSuspensionComplete() {
		const deferredRequests = this._deferredRequests;
		this._deferredRequests = [];
		for (let deferredRequest of deferredRequests) {
			deferredRequest.resolve(null);
			await deferredRequest.promise.catch(noOp);
		}
	}
};

//#endregion
//#region src/common/api/worker/facades/DeviceEncryptionFacade.ts
var DeviceEncryptionFacade = class {
	/**
	* Generates an encryption key.
	*/
	async generateKey() {
		return bitArrayToUint8Array(aes256RandomKey());
	}
	/**
	* Encrypts {@param data} using {@param deviceKey}.
	* @param deviceKey Key used for encryption
	* @param data Data to encrypt.
	*/
	async encrypt(deviceKey, data) {
		return aesEncrypt(uint8ArrayToBitArray(deviceKey), data);
	}
	/**
	* Decrypts {@param encryptedData} using {@param deviceKey}.
	* @param deviceKey Key used for encryption
	* @param encryptedData Data to be decrypted.
	*/
	async decrypt(deviceKey, encryptedData) {
		return aesDecrypt(uint8ArrayToBitArray(deviceKey), encryptedData);
	}
};

//#endregion
//#region src/common/native/worker/AesApp.ts
var AesApp = class {
	constructor(nativeCryptoFacade, random$1) {
		this.nativeCryptoFacade = nativeCryptoFacade;
		this.random = random$1;
	}
	/**
	* Encrypts a file with the provided key
	* @return Returns the URI of the decrypted file. Resolves to an exception if the encryption failed.
	*/
	aesEncryptFile(key, fileUrl) {
		const iv = this.random.generateRandomData(IV_BYTE_LENGTH);
		const encodedKey = keyToUint8Array(key);
		return this.nativeCryptoFacade.aesEncryptFile(encodedKey, fileUrl, iv);
	}
	/**
	* Decrypt bytes with the provided key
	* @return Returns the URI of the decrypted file. Resolves to an exception if the encryption failed.
	*/
	aesDecryptFile(key, fileUrl) {
		const encodedKey = keyToUint8Array(key);
		return this.nativeCryptoFacade.aesDecryptFile(encodedKey, fileUrl);
	}
};

//#endregion
//#region src/common/native/common/generatedipc/NativeCryptoFacadeSendDispatcher.ts
var NativeCryptoFacadeSendDispatcher = class {
	constructor(transport) {
		this.transport = transport;
	}
	async rsaEncrypt(...args) {
		return this.transport.invokeNative("ipc", [
			"NativeCryptoFacade",
			"rsaEncrypt",
			...args
		]);
	}
	async rsaDecrypt(...args) {
		return this.transport.invokeNative("ipc", [
			"NativeCryptoFacade",
			"rsaDecrypt",
			...args
		]);
	}
	async aesEncryptFile(...args) {
		return this.transport.invokeNative("ipc", [
			"NativeCryptoFacade",
			"aesEncryptFile",
			...args
		]);
	}
	async aesDecryptFile(...args) {
		return this.transport.invokeNative("ipc", [
			"NativeCryptoFacade",
			"aesDecryptFile",
			...args
		]);
	}
	async argon2idGeneratePassphraseKey(...args) {
		return this.transport.invokeNative("ipc", [
			"NativeCryptoFacade",
			"argon2idGeneratePassphraseKey",
			...args
		]);
	}
	async generateKyberKeypair(...args) {
		return this.transport.invokeNative("ipc", [
			"NativeCryptoFacade",
			"generateKyberKeypair",
			...args
		]);
	}
	async kyberEncapsulate(...args) {
		return this.transport.invokeNative("ipc", [
			"NativeCryptoFacade",
			"kyberEncapsulate",
			...args
		]);
	}
	async kyberDecapsulate(...args) {
		return this.transport.invokeNative("ipc", [
			"NativeCryptoFacade",
			"kyberDecapsulate",
			...args
		]);
	}
};

//#endregion
//#region src/common/api/worker/crypto/RsaImplementation.ts
async function createRsaImplementation(native) {
	if (isApp()) {
		const { RsaApp } = await import("./RsaApp-chunk.js");
		return new RsaApp(new NativeCryptoFacadeSendDispatcher(native), random);
	} else return new RsaWeb();
}
var RsaWeb = class {
	async encrypt(publicKey, bytes) {
		const seed = random.generateRandomData(32);
		return rsaEncrypt(publicKey, bytes, seed);
	}
	async decrypt(privateKey, bytes) {
		return rsaDecrypt(privateKey, bytes);
	}
};

//#endregion
//#region src/common/api/worker/crypto/CryptoFacade.ts
assertWorkerOrNode();
var CryptoFacade = class {
	constructor(userFacade, entityClient, restClient, serviceExecutor, instanceMapper, ownerEncSessionKeysUpdateQueue, cache, keyLoaderFacade, asymmetricCryptoFacade, publicKeyProvider, keyRotationFacade) {
		this.userFacade = userFacade;
		this.entityClient = entityClient;
		this.restClient = restClient;
		this.serviceExecutor = serviceExecutor;
		this.instanceMapper = instanceMapper;
		this.ownerEncSessionKeysUpdateQueue = ownerEncSessionKeysUpdateQueue;
		this.cache = cache;
		this.keyLoaderFacade = keyLoaderFacade;
		this.asymmetricCryptoFacade = asymmetricCryptoFacade;
		this.publicKeyProvider = publicKeyProvider;
		this.keyRotationFacade = keyRotationFacade;
	}
	async applyMigrationsForInstance(decryptedInstance) {
		const instanceType = downcast(decryptedInstance)._type;
		if (isSameTypeRef(instanceType, ContactTypeRef)) {
			const contact = downcast(decryptedInstance);
			try {
				if (!contact.birthdayIso && contact.oldBirthdayAggregate) {
					contact.birthdayIso = birthdayToIsoDate(contact.oldBirthdayAggregate);
					contact.oldBirthdayAggregate = null;
					contact.oldBirthdayDate = null;
					await this.entityClient.update(contact);
				} else if (!contact.birthdayIso && contact.oldBirthdayDate) {
					contact.birthdayIso = birthdayToIsoDate(oldBirthdayToBirthday(contact.oldBirthdayDate));
					contact.oldBirthdayDate = null;
					await this.entityClient.update(contact);
				} else if (contact.birthdayIso && (contact.oldBirthdayAggregate || contact.oldBirthdayDate)) {
					contact.oldBirthdayAggregate = null;
					contact.oldBirthdayDate = null;
					await this.entityClient.update(contact);
				}
			} catch (e) {
				if (!(e instanceof LockedError)) throw e;
			}
		}
		return decryptedInstance;
	}
	async resolveSessionKeyForInstance(instance) {
		const typeModel = await resolveTypeReference(instance._type);
		return this.resolveSessionKey(typeModel, instance);
	}
	/** Helper for the rare cases when we needed it on the client side. */
	async resolveSessionKeyForInstanceBinary(instance) {
		const key = await this.resolveSessionKeyForInstance(instance);
		return key == null ? null : bitArrayToUint8Array(key);
	}
	/** Resolve a session key an {@param instance} using an already known {@param ownerKey}. */
	resolveSessionKeyWithOwnerKey(instance, ownerKey) {
		let key = instance._ownerEncSessionKey;
		if (typeof key === "string") key = base64ToUint8Array(key);
		return decryptKey(ownerKey, key);
	}
	async decryptSessionKey(instance, ownerEncSessionKey) {
		const gk = await this.keyLoaderFacade.loadSymGroupKey(instance._ownerGroup, ownerEncSessionKey.encryptingKeyVersion);
		return decryptKey(gk, ownerEncSessionKey.key);
	}
	/**
	* Returns the session key for the provided type/instance:
	* * null, if the instance is unencrypted
	* * the decrypted _ownerEncSessionKey, if it is available
	* * the public decrypted session key, otherwise
	*
	* @param typeModel the type model of the instance
	* @param instance The unencrypted (client-side) instance or encrypted (server-side) object literal
	*/
	async resolveSessionKey(typeModel, instance) {
		try {
			if (!typeModel.encrypted) return null;
			if (instance.bucketKey) {
				const bucketKey = await this.convertBucketKeyToInstanceIfNecessary(instance.bucketKey);
				const resolvedSessionKeys = await this.resolveWithBucketKey(bucketKey, instance, typeModel);
				return resolvedSessionKeys.resolvedSessionKeyForInstance;
			} else if (instance._ownerEncSessionKey && this.userFacade.isFullyLoggedIn() && this.userFacade.hasGroup(instance._ownerGroup)) {
				const gk = await this.keyLoaderFacade.loadSymGroupKey(instance._ownerGroup, parseKeyVersion(instance._ownerKeyVersion ?? "0"));
				return this.resolveSessionKeyWithOwnerKey(instance, gk);
			} else if (instance.ownerEncSessionKey) {
				const gk = await this.keyLoaderFacade.loadSymGroupKey(this.userFacade.getGroupId(GroupType.Mail), parseKeyVersion(instance.ownerKeyVersion ?? "0"));
				return this.resolveSessionKeyWithOwnerKey(instance, gk);
			} else {
				const permissions = await this.entityClient.loadAll(PermissionTypeRef, instance._permissions);
				return await this.trySymmetricPermission(permissions) ?? await this.resolveWithPublicOrExternalPermission(permissions, instance, typeModel);
			}
		} catch (e) {
			if (e instanceof CryptoError) {
				console.log("failed to resolve session key", e);
				throw new SessionKeyNotFoundError("Crypto error while resolving session key for instance " + instance._id);
			} else throw e;
		}
	}
	/**
	* Takes a freshly JSON-parsed, unmapped object and apply migrations as necessary
	* @param typeRef
	* @param data
	* @return the unmapped and still encrypted instance
	*/
	async applyMigrations(typeRef, data) {
		if (isSameTypeRef(typeRef, GroupInfoTypeRef) && data._ownerGroup == null) return this.applyCustomerGroupOwnershipToGroupInfo(data);
else if (isSameTypeRef(typeRef, TutanotaPropertiesTypeRef) && data._ownerEncSessionKey == null) return this.encryptTutanotaProperties(data);
else if (isSameTypeRef(typeRef, PushIdentifierTypeRef) && data._ownerEncSessionKey == null) return this.addSessionKeyToPushIdentifier(data);
else return data;
	}
	/**
	* In case the given bucketKey is a literal the literal will be converted to an instance and return. In case the BucketKey is already an instance the
	* instance is returned.
	* @param bucketKeyInstanceOrLiteral The bucket key as literal or instance
	*/
	async convertBucketKeyToInstanceIfNecessary(bucketKeyInstanceOrLiteral) {
		if (this.isLiteralInstance(bucketKeyInstanceOrLiteral)) {
			const bucketKeyTypeModel = await resolveTypeReference(BucketKeyTypeRef);
			return await this.instanceMapper.decryptAndMapToInstance(bucketKeyTypeModel, bucketKeyInstanceOrLiteral, null);
		} else return bucketKeyInstanceOrLiteral;
	}
	async resolveWithBucketKey(bucketKey, instance, typeModel) {
		const instanceElementId = this.getElementIdFromInstance(instance);
		let decryptedBucketKey;
		let unencryptedSenderAuthStatus = null;
		let pqMessageSenderKey = null;
		if (bucketKey.keyGroup && bucketKey.pubEncBucketKey) {
			const { decryptedAesKey, senderIdentityPubKey } = await this.asymmetricCryptoFacade.loadKeyPairAndDecryptSymKey(bucketKey.keyGroup, parseKeyVersion(bucketKey.recipientKeyVersion), asCryptoProtoocolVersion(bucketKey.protocolVersion), bucketKey.pubEncBucketKey);
			decryptedBucketKey = decryptedAesKey;
			pqMessageSenderKey = senderIdentityPubKey;
		} else if (bucketKey.groupEncBucketKey) {
			let keyGroup;
			const groupKeyVersion = parseKeyVersion(bucketKey.recipientKeyVersion);
			if (bucketKey.keyGroup) keyGroup = bucketKey.keyGroup;
else keyGroup = neverNull(instance._ownerGroup);
			decryptedBucketKey = await this.resolveWithGroupReference(keyGroup, groupKeyVersion, bucketKey.groupEncBucketKey);
			unencryptedSenderAuthStatus = EncryptionAuthStatus.AES_NO_AUTHENTICATION;
		} else throw new SessionKeyNotFoundError(`encrypted bucket key not set on instance ${typeModel.name}`);
		const resolvedSessionKeys = await this.collectAllInstanceSessionKeysAndAuthenticate(bucketKey, decryptedBucketKey, instanceElementId, instance, typeModel, unencryptedSenderAuthStatus, pqMessageSenderKey);
		await this.ownerEncSessionKeysUpdateQueue.updateInstanceSessionKeys(resolvedSessionKeys.instanceSessionKeys, typeModel);
		const groupKey = await this.keyLoaderFacade.getCurrentSymGroupKey(instance._ownerGroup);
		this.setOwnerEncSessionKeyUnmapped(instance, encryptKeyWithVersionedKey(groupKey, resolvedSessionKeys.resolvedSessionKeyForInstance));
		return resolvedSessionKeys;
	}
	/**
	* Calculates the SHA-256 checksum of a string value as UTF-8 bytes and returns it as a base64-encoded string
	*/
	async sha256(value) {
		return uint8ArrayToBase64(sha256Hash(stringToUtf8Uint8Array(value)));
	}
	/**
	* Decrypts the given encrypted bucket key with the group key of the given group. In case the current user is not
	* member of the key group the function tries to resolve the group key using the adminEncGroupKey.
	* This is necessary for resolving the BucketKey when receiving a reply from an external Mailbox.
	* @param keyGroup The group that holds the encryption key.
	* @param groupKeyVersion the version of the key from the keyGroup
	* @param groupEncBucketKey The group key encrypted bucket key.
	*/
	async resolveWithGroupReference(keyGroup, groupKeyVersion, groupEncBucketKey) {
		if (this.userFacade.hasGroup(keyGroup)) {
			const groupKey = await this.keyLoaderFacade.loadSymGroupKey(keyGroup, groupKeyVersion);
			return decryptKey(groupKey, groupEncBucketKey);
		} else {
			const externalMailGroupId = keyGroup;
			const externalMailGroupKeyVersion = groupKeyVersion;
			const externalMailGroup = await this.entityClient.load(GroupTypeRef, externalMailGroupId);
			const externalUserGroupdId = externalMailGroup.admin;
			if (!externalUserGroupdId) throw new SessionKeyNotFoundError("no admin group on key group: " + externalMailGroupId);
			const externalUserGroupKeyVersion = parseKeyVersion(externalMailGroup.adminGroupKeyVersion ?? "0");
			const externalUserGroup = await this.entityClient.load(GroupTypeRef, externalUserGroupdId);
			const internalUserGroupId = externalUserGroup.admin;
			const internalUserGroupKeyVersion = parseKeyVersion(externalUserGroup.adminGroupKeyVersion ?? "0");
			if (!(internalUserGroupId && this.userFacade.hasGroup(internalUserGroupId))) throw new SessionKeyNotFoundError("no admin group or no membership of admin group: " + internalUserGroupId);
			const internalUserGroupKey = await this.keyLoaderFacade.loadSymGroupKey(internalUserGroupId, internalUserGroupKeyVersion);
			const currentExternalUserGroupKey = decryptKey(internalUserGroupKey, assertNotNull(externalUserGroup.adminGroupEncGKey));
			const externalUserGroupKey = await this.keyLoaderFacade.loadSymGroupKey(externalUserGroupdId, externalUserGroupKeyVersion, {
				object: currentExternalUserGroupKey,
				version: parseKeyVersion(externalUserGroup.groupKeyVersion)
			});
			const currentExternalMailGroupKey = decryptKey(externalUserGroupKey, assertNotNull(externalMailGroup.adminGroupEncGKey));
			const externalMailGroupKey = await this.keyLoaderFacade.loadSymGroupKey(externalMailGroupId, externalMailGroupKeyVersion, {
				object: currentExternalMailGroupKey,
				version: parseKeyVersion(externalMailGroup.groupKeyVersion)
			});
			return decryptKey(externalMailGroupKey, groupEncBucketKey);
		}
	}
	async addSessionKeyToPushIdentifier(data) {
		const userGroupKey = this.userFacade.getCurrentUserGroupKey();
		const typeModel = await resolveTypeReference(PushIdentifierTypeRef);
		await this.updateOwnerEncSessionKey(typeModel, data, userGroupKey, aes256RandomKey());
		return data;
	}
	async encryptTutanotaProperties(data) {
		const userGroupKey = this.userFacade.getCurrentUserGroupKey();
		const groupEncSessionKey = encryptKeyWithVersionedKey(userGroupKey, aes256RandomKey());
		this.setOwnerEncSessionKeyUnmapped(data, groupEncSessionKey, this.userFacade.getUserGroupId());
		const migrationData = createEncryptTutanotaPropertiesData({
			properties: data._id,
			symKeyVersion: String(groupEncSessionKey.encryptingKeyVersion),
			symEncSessionKey: groupEncSessionKey.key
		});
		await this.serviceExecutor.post(EncryptTutanotaPropertiesService, migrationData);
		return data;
	}
	async applyCustomerGroupOwnershipToGroupInfo(data) {
		const customerGroupMembership = assertNotNull(this.userFacade.getLoggedInUser().memberships.find((g) => g.groupType === GroupType.Customer));
		const listPermissions = await this.entityClient.loadAll(PermissionTypeRef, data._id[0]);
		const customerGroupPermission = listPermissions.find((p) => p.group === customerGroupMembership.group);
		if (!customerGroupPermission) throw new SessionKeyNotFoundError("Permission not found, could not apply OwnerGroup migration");
		const customerGroupKeyVersion = parseKeyVersion(customerGroupPermission.symKeyVersion ?? "0");
		const customerGroupKey = await this.keyLoaderFacade.loadSymGroupKey(customerGroupMembership.group, customerGroupKeyVersion);
		const versionedCustomerGroupKey = {
			object: customerGroupKey,
			version: customerGroupKeyVersion
		};
		const listKey = decryptKey(customerGroupKey, assertNotNull(customerGroupPermission.symEncSessionKey));
		const groupInfoSk = decryptKey(listKey, base64ToUint8Array(data._listEncSessionKey));
		this.setOwnerEncSessionKeyUnmapped(data, encryptKeyWithVersionedKey(versionedCustomerGroupKey, groupInfoSk), customerGroupMembership.group);
		return data;
	}
	setOwnerEncSessionKeyUnmapped(unmappedInstance, key, ownerGroup) {
		unmappedInstance._ownerEncSessionKey = uint8ArrayToBase64(key.key);
		unmappedInstance._ownerKeyVersion = key.encryptingKeyVersion.toString();
		if (ownerGroup) unmappedInstance._ownerGroup = ownerGroup;
	}
	setOwnerEncSessionKey(instance, key) {
		instance._ownerEncSessionKey = key.key;
		instance._ownerKeyVersion = key.encryptingKeyVersion.toString();
	}
	/**
	* @return Whether the {@param elementOrLiteral} is a unmapped type, as used in JSON for transport or if it's a runtime representation of a type.
	*/
	isLiteralInstance(elementOrLiteral) {
		return typeof elementOrLiteral._type === "undefined";
	}
	async trySymmetricPermission(listPermissions) {
		const symmetricPermission = listPermissions.find((p) => (p.type === PermissionType.Public_Symmetric || p.type === PermissionType.Symmetric) && p._ownerGroup && this.userFacade.hasGroup(p._ownerGroup)) ?? null;
		if (symmetricPermission) {
			const gk = await this.keyLoaderFacade.loadSymGroupKey(assertNotNull(symmetricPermission._ownerGroup), parseKeyVersion(symmetricPermission._ownerKeyVersion ?? "0"));
			return decryptKey(gk, assertNotNull(symmetricPermission._ownerEncSessionKey));
		} else return null;
	}
	/**
	* Resolves the session key for the provided instance and collects all other instances'
	* session keys in order to update them.
	*/
	async collectAllInstanceSessionKeysAndAuthenticate(bucketKey, decBucketKey, instanceElementId, instance, typeModel, encryptionAuthStatus, pqMessageSenderKey) {
		let resolvedSessionKeyForInstance = undefined;
		const instanceSessionKeys = await pMap(bucketKey.bucketEncSessionKeys, async (instanceSessionKey) => {
			const decryptedSessionKey = decryptKey(decBucketKey, instanceSessionKey.symEncSessionKey);
			const groupKey = await this.keyLoaderFacade.getCurrentSymGroupKey(instance._ownerGroup);
			const ownerEncSessionKey = encryptKeyWithVersionedKey(groupKey, decryptedSessionKey);
			const instanceSessionKeyWithOwnerEncSessionKey = createInstanceSessionKey(instanceSessionKey);
			if (instanceElementId == instanceSessionKey.instanceId) {
				resolvedSessionKeyForInstance = decryptedSessionKey;
				await this.authenticateMainInstance(typeModel, encryptionAuthStatus, pqMessageSenderKey, bucketKey.protocolVersion === CryptoProtocolVersion.TUTA_CRYPT ? parseKeyVersion(bucketKey.senderKeyVersion ?? "0") : null, instance, resolvedSessionKeyForInstance, instanceSessionKeyWithOwnerEncSessionKey, decryptedSessionKey, bucketKey.keyGroup);
			}
			instanceSessionKeyWithOwnerEncSessionKey.symEncSessionKey = ownerEncSessionKey.key;
			instanceSessionKeyWithOwnerEncSessionKey.symKeyVersion = String(ownerEncSessionKey.encryptingKeyVersion);
			return instanceSessionKeyWithOwnerEncSessionKey;
		});
		if (resolvedSessionKeyForInstance) return {
			resolvedSessionKeyForInstance,
			instanceSessionKeys
		};
else throw new SessionKeyNotFoundError("no session key for instance " + instance._id);
	}
	async authenticateMainInstance(typeModel, encryptionAuthStatus, pqMessageSenderKey, pqMessageSenderKeyVersion, instance, resolvedSessionKeyForInstance, instanceSessionKeyWithOwnerEncSessionKey, decryptedSessionKey, keyGroup) {
		const isMailInstance = isSameTypeRefByAttr(MailTypeRef, typeModel.app, typeModel.name);
		if (isMailInstance) {
			if (!encryptionAuthStatus) if (!pqMessageSenderKey) {
				const recipientGroup = assertNotNull(keyGroup, "trying to authenticate an asymmetrically encrypted message, but we can't determine the recipient's group ID");
				const currentKeyPair = await this.keyLoaderFacade.loadCurrentKeyPair(recipientGroup);
				encryptionAuthStatus = EncryptionAuthStatus.RSA_NO_AUTHENTICATION;
				if (isPqKeyPairs(currentKeyPair.object)) {
					const keyRotationFacade = this.keyRotationFacade();
					const rotatedGroups = await keyRotationFacade.getGroupIdsThatPerformedKeyRotations();
					if (!rotatedGroups.includes(recipientGroup)) encryptionAuthStatus = EncryptionAuthStatus.RSA_DESPITE_TUTACRYPT;
				}
			} else {
				const mail = this.isLiteralInstance(instance) ? await this.instanceMapper.decryptAndMapToInstance(typeModel, instance, resolvedSessionKeyForInstance) : instance;
				const senderMailAddress = mail.confidential ? mail.sender.address : SYSTEM_GROUP_MAIL_ADDRESS;
				encryptionAuthStatus = await this.tryAuthenticateSenderOfMainInstance(
					senderMailAddress,
					pqMessageSenderKey,
					// must not be null if this is a TutaCrypt message with a pqMessageSenderKey
					assertNotNull(pqMessageSenderKeyVersion)
);
			}
			instanceSessionKeyWithOwnerEncSessionKey.encryptionAuthStatus = aesEncrypt(decryptedSessionKey, stringToUtf8Uint8Array(encryptionAuthStatus));
		}
	}
	async tryAuthenticateSenderOfMainInstance(senderMailAddress, pqMessageSenderKey, pqMessageSenderKeyVersion) {
		try {
			return await this.asymmetricCryptoFacade.authenticateSender({
				identifier: senderMailAddress,
				identifierType: PublicKeyIdentifierType.MAIL_ADDRESS
			}, pqMessageSenderKey, pqMessageSenderKeyVersion);
		} catch (e) {
			console.error("Could not authenticate sender", e);
			return EncryptionAuthStatus.TUTACRYPT_AUTHENTICATION_FAILED;
		}
	}
	async resolveWithPublicOrExternalPermission(listPermissions, instance, typeModel) {
		const pubOrExtPermission = listPermissions.find((p) => p.type === PermissionType.Public || p.type === PermissionType.External) ?? null;
		if (pubOrExtPermission == null) {
			const typeName = `${typeModel.app}/${typeModel.name}`;
			throw new SessionKeyNotFoundError(`could not find permission for instance of type ${typeName} with id ${this.getElementIdFromInstance(instance)}`);
		}
		const bucketPermissions = await this.entityClient.loadAll(BucketPermissionTypeRef, assertNotNull(pubOrExtPermission.bucket).bucketPermissions);
		const bucketPermission = bucketPermissions.find((bp) => (bp.type === BucketPermissionType.Public || bp.type === BucketPermissionType.External) && pubOrExtPermission._ownerGroup === bp._ownerGroup);
		if (bucketPermission == null) throw new SessionKeyNotFoundError("no corresponding bucket permission found");
		if (bucketPermission.type === BucketPermissionType.External) return this.decryptWithExternalBucket(bucketPermission, pubOrExtPermission, instance);
else return this.decryptWithPublicBucketWithoutAuthentication(bucketPermission, instance, pubOrExtPermission, typeModel);
	}
	async decryptWithExternalBucket(bucketPermission, pubOrExtPermission, instance) {
		let bucketKey;
		if (bucketPermission.ownerEncBucketKey != null) {
			const ownerGroupKey = await this.keyLoaderFacade.loadSymGroupKey(neverNull(bucketPermission._ownerGroup), parseKeyVersion(bucketPermission.ownerKeyVersion ?? "0"));
			bucketKey = decryptKey(ownerGroupKey, bucketPermission.ownerEncBucketKey);
		} else if (bucketPermission.symEncBucketKey) {
			const userGroupKey = await this.keyLoaderFacade.loadSymUserGroupKey(parseKeyVersion(bucketPermission.symKeyVersion ?? "0"));
			bucketKey = decryptKey(userGroupKey, bucketPermission.symEncBucketKey);
		} else throw new SessionKeyNotFoundError(`BucketEncSessionKey is not defined for Permission ${pubOrExtPermission._id.toString()} (Instance: ${JSON.stringify(instance)})`);
		return decryptKey(bucketKey, neverNull(pubOrExtPermission.bucketEncSessionKey));
	}
	async decryptWithPublicBucketWithoutAuthentication(bucketPermission, instance, pubOrExtPermission, typeModel) {
		const pubEncBucketKey = bucketPermission.pubEncBucketKey;
		if (pubEncBucketKey == null) throw new SessionKeyNotFoundError(`PubEncBucketKey is not defined for BucketPermission ${bucketPermission._id.toString()} (Instance: ${JSON.stringify(instance)})`);
		const bucketEncSessionKey = pubOrExtPermission.bucketEncSessionKey;
		if (bucketEncSessionKey == null) throw new SessionKeyNotFoundError(`BucketEncSessionKey is not defined for Permission ${pubOrExtPermission._id.toString()} (Instance: ${JSON.stringify(instance)})`);
		const { decryptedAesKey } = await this.asymmetricCryptoFacade.loadKeyPairAndDecryptSymKey(bucketPermission.group, parseKeyVersion(bucketPermission.pubKeyVersion ?? "0"), asCryptoProtoocolVersion(bucketPermission.protocolVersion), pubEncBucketKey);
		const sk = decryptKey(decryptedAesKey, bucketEncSessionKey);
		if (bucketPermission._ownerGroup) {
			let bucketPermissionOwnerGroupKey = await this.keyLoaderFacade.getCurrentSymGroupKey(neverNull(bucketPermission._ownerGroup));
			await this.updateWithSymPermissionKey(typeModel, instance, pubOrExtPermission, bucketPermission, bucketPermissionOwnerGroupKey, sk).catch(ofClass(NotFoundError, () => {
				console.log("w> could not find instance to update permission");
			}));
		}
		return sk;
	}
	/**
	* Returns the session key for the provided service response:
	* * null, if the instance is unencrypted
	* * the decrypted _ownerPublicEncSessionKey, if it is available
	* @param instance The unencrypted (client-side) or encrypted (server-side) instance
	*
	*/
	async resolveServiceSessionKey(instance) {
		if (instance._ownerPublicEncSessionKey) {
			const keypair = await this.keyLoaderFacade.loadCurrentKeyPair(instance._ownerGroup);
			return (await this.asymmetricCryptoFacade.decryptSymKeyWithKeyPair(keypair.object, assertEnumValue(CryptoProtocolVersion, instance._publicCryptoProtocolVersion), base64ToUint8Array(instance._ownerPublicEncSessionKey))).decryptedAesKey;
		}
		return null;
	}
	/**
	* Creates a new _ownerEncSessionKey and assigns it to the provided entity
	* the entity must already have an _ownerGroup
	* @returns the generated key
	*/
	async setNewOwnerEncSessionKey(model, entity, keyToEncryptSessionKey) {
		if (!entity._ownerGroup) throw new Error(`no owner group set  ${JSON.stringify(entity)}`);
		if (model.encrypted) {
			if (entity._ownerEncSessionKey) throw new Error(`ownerEncSessionKey already set ${JSON.stringify(entity)}`);
			const sessionKey = aes256RandomKey();
			const effectiveKeyToEncryptSessionKey = keyToEncryptSessionKey ?? await this.keyLoaderFacade.getCurrentSymGroupKey(entity._ownerGroup);
			const encryptedSessionKey = encryptKeyWithVersionedKey(effectiveKeyToEncryptSessionKey, sessionKey);
			this.setOwnerEncSessionKey(entity, encryptedSessionKey);
			return sessionKey;
		} else return null;
	}
	async encryptBucketKeyForInternalRecipient(senderUserGroupId, bucketKey, recipientMailAddress, notFoundRecipients) {
		try {
			const pubKeys = await this.publicKeyProvider.loadCurrentPubKey({
				identifier: recipientMailAddress,
				identifierType: PublicKeyIdentifierType.MAIL_ADDRESS
			});
			if (notFoundRecipients.length !== 0) return null;
			const isExternalSender = this.userFacade.getUser()?.accountType === AccountType.EXTERNAL;
			if (pubKeys.object.pubKyberKey && isExternalSender) return this.createSymEncInternalRecipientKeyData(recipientMailAddress, bucketKey);
else return this.createPubEncInternalRecipientKeyData(bucketKey, recipientMailAddress, pubKeys, senderUserGroupId);
		} catch (e) {
			if (e instanceof NotFoundError) {
				notFoundRecipients.push(recipientMailAddress);
				return null;
			} else if (e instanceof TooManyRequestsError) throw new RecipientNotResolvedError("");
else throw e;
		}
	}
	async createPubEncInternalRecipientKeyData(bucketKey, recipientMailAddress, recipientPublicKeys, senderGroupId) {
		const pubEncBucketKey = await this.asymmetricCryptoFacade.asymEncryptSymKey(bucketKey, recipientPublicKeys, senderGroupId);
		return createInternalRecipientKeyData({
			mailAddress: recipientMailAddress,
			pubEncBucketKey: pubEncBucketKey.pubEncSymKeyBytes,
			recipientKeyVersion: pubEncBucketKey.recipientKeyVersion.toString(),
			senderKeyVersion: pubEncBucketKey.senderKeyVersion != null ? pubEncBucketKey.senderKeyVersion.toString() : null,
			protocolVersion: pubEncBucketKey.cryptoProtocolVersion
		});
	}
	async createSymEncInternalRecipientKeyData(recipientMailAddress, bucketKey) {
		const keyGroup = this.userFacade.getGroupId(GroupType.Mail);
		const externalMailGroupKey = await this.keyLoaderFacade.getCurrentSymGroupKey(keyGroup);
		return createSymEncInternalRecipientKeyData({
			mailAddress: recipientMailAddress,
			symEncBucketKey: encryptKey(externalMailGroupKey.object, bucketKey),
			keyGroup,
			symKeyVersion: String(externalMailGroupKey.version)
		});
	}
	/**
	* Updates the given public permission with the given symmetric key for faster access if the client is the leader and otherwise does nothing.
	* @param typeModel The type model of the instance
	* @param instance The unencrypted (client-side) or encrypted (server-side) instance
	* @param permission The permission.
	* @param bucketPermission The bucket permission.
	* @param permissionOwnerGroupKey The symmetric group key for the owner group on the permission.
	* @param sessionKey The symmetric session key.
	*/
	async updateWithSymPermissionKey(typeModel, instance, permission, bucketPermission, permissionOwnerGroupKey, sessionKey) {
		if (!this.isLiteralInstance(instance) || !this.userFacade.isLeader()) return;
		if (!instance._ownerEncSessionKey && permission._ownerGroup === instance._ownerGroup) return this.updateOwnerEncSessionKey(typeModel, instance, permissionOwnerGroupKey, sessionKey);
else {
			const encryptedKey = encryptKeyWithVersionedKey(permissionOwnerGroupKey, sessionKey);
			let updateService = createUpdatePermissionKeyData({
				ownerKeyVersion: String(encryptedKey.encryptingKeyVersion),
				ownerEncSessionKey: encryptedKey.key,
				permission: permission._id,
				bucketPermission: bucketPermission._id
			});
			await this.serviceExecutor.post(UpdatePermissionKeyService, updateService);
		}
	}
	/**
	* Resolves the ownerEncSessionKey of a mail. This might be needed if it wasn't updated yet
	* by the OwnerEncSessionKeysUpdateQueue but the file is already downloaded.
	* @param mainInstance the instance that has the bucketKey
	* @param childInstances the files that belong to the mainInstance
	*/
	async enforceSessionKeyUpdateIfNeeded(mainInstance, childInstances) {
		if (!childInstances.some((f) => f._ownerEncSessionKey == null)) return childInstances.slice();
		const typeModel = await resolveTypeReference(mainInstance._type);
		const outOfSyncInstances = childInstances.filter((f) => f._ownerEncSessionKey == null);
		if (mainInstance.bucketKey) {
			const bucketKey = await this.convertBucketKeyToInstanceIfNecessary(mainInstance.bucketKey);
			const resolvedSessionKeys = await this.resolveWithBucketKey(bucketKey, mainInstance, typeModel);
			await this.ownerEncSessionKeysUpdateQueue.postUpdateSessionKeysService(resolvedSessionKeys.instanceSessionKeys);
		} else console.warn("files are out of sync refreshing", outOfSyncInstances.map((f) => f._id).join(", "));
		for (const childInstance of outOfSyncInstances) await this.cache?.deleteFromCacheIfExists(FileTypeRef, getListId(childInstance), getElementId(childInstance));
		return await this.entityClient.loadMultiple(FileTypeRef, getListId(childInstances[0]), childInstances.map((childInstance) => getElementId(childInstance)));
	}
	updateOwnerEncSessionKey(typeModel, instance, ownerGroupKey, sessionKey) {
		this.setOwnerEncSessionKeyUnmapped(instance, encryptKeyWithVersionedKey(ownerGroupKey, sessionKey));
		const path = typeRefToPath(new TypeRef(typeModel.app, typeModel.name)) + "/" + (instance._id instanceof Array ? instance._id.join("/") : instance._id);
		const headers = this.userFacade.createAuthHeaders();
		headers.v = typeModel.version;
		return this.restClient.request(path, HttpMethod.PUT, {
			headers,
			body: JSON.stringify(instance),
			queryParams: { updateOwnerEncSessionKey: "true" }
		}).catch(ofClass(PayloadTooLargeError, (e) => {
			console.log("Could not update owner enc session key - PayloadTooLargeError", e);
		}));
	}
	getElementIdFromInstance(instance) {
		if (typeof instance._id === "string") return instance._id;
else {
			const idTuple = instance._id;
			return elementIdPart(idTuple);
		}
	}
};
if (!("toJSON" in Error.prototype)) Object.defineProperty(Error.prototype, "toJSON", {
	value: function() {
		const alt = {};
		for (let key of Object.getOwnPropertyNames(this)) alt[key] = this[key];
		return alt;
	},
	configurable: true,
	writable: true
});

//#endregion
//#region src/common/api/worker/crypto/InstanceMapper.ts
assertWorkerOrNode();
var InstanceMapper = class {
	/**
	* Decrypts an object literal as received from the DB and maps it to an entity class (e.g. Mail)
	* @param model The TypeModel of the instance
	* @param instance The object literal as received from the DB
	* @param sk The session key, must be provided for encrypted instances
	* @returns The decrypted and mapped instance
	*/
	decryptAndMapToInstance(model, instance, sk) {
		let decrypted = { _type: new TypeRef(model.app, model.name) };
		for (let key of Object.keys(model.values)) {
			let valueType = model.values[key];
			let value = instance[key];
			try {
				decrypted[key] = decryptValue(key, valueType, value, sk);
			} catch (e) {
				if (decrypted._errors == null) decrypted._errors = {};
				decrypted._errors[key] = JSON.stringify(e);
				console.log("error when decrypting value on type:", `[${model.app},${model.name}]`, "key:", key, e);
			} finally {
				if (valueType.encrypted) {
					if (valueType.final) decrypted["_finalEncrypted_" + key] = value;
else if (value === "") decrypted["_defaultEncrypted_" + key] = decrypted[key];
				}
			}
		}
		return pMap(Object.keys(model.associations), async (associationName) => {
			if (model.associations[associationName].type === AssociationType.Aggregation) {
				const dependency = model.associations[associationName].dependency;
				const aggregateTypeModel = await resolveTypeReference(new TypeRef(dependency || model.app, model.associations[associationName].refType));
				let aggregation = model.associations[associationName];
				if (aggregation.cardinality === Cardinality.ZeroOrOne && instance[associationName] == null) decrypted[associationName] = null;
else if (instance[associationName] == null) throw new ProgrammingError(`Undefined aggregation ${model.name}:${associationName}`);
else if (aggregation.cardinality === Cardinality.Any) return pMap(instance[associationName], (aggregate) => {
					return this.decryptAndMapToInstance(aggregateTypeModel, downcast(aggregate), sk);
				}).then((decryptedAggregates) => {
					decrypted[associationName] = decryptedAggregates;
				});
else return this.decryptAndMapToInstance(aggregateTypeModel, instance[associationName], sk).then((decryptedAggregate) => {
					decrypted[associationName] = decryptedAggregate;
				});
			} else decrypted[associationName] = instance[associationName];
		}).then(() => {
			return decrypted;
		});
	}
	encryptAndMapToLiteral(model, instance, sk) {
		if (model.encrypted && sk == null) throw new ProgrammingError(`Encrypting ${model.app}/${model.name} requires a session key!`);
		let encrypted = {};
		let i = instance;
		for (let key of Object.keys(model.values)) {
			let valueType = model.values[key];
			let value = i[key];
			let encryptedValue;
			if (valueType.encrypted && valueType.final && i["_finalEncrypted_" + key] != null) encryptedValue = i["_finalEncrypted_" + key];
else if (valueType.encrypted && (i["_finalIvs"]?.[key])?.length === 0 && isDefaultValue(valueType.type, value)) encryptedValue = "";
else if (valueType.encrypted && valueType.final && i["_finalIvs"]?.[key] != null) {
				const finalIv = i["_finalIvs"][key];
				encryptedValue = encryptValue(key, valueType, value, sk, finalIv);
			} else if (valueType.encrypted && i["_defaultEncrypted_" + key] === value) encryptedValue = "";
else encryptedValue = encryptValue(key, valueType, value, sk);
			encrypted[key] = encryptedValue;
		}
		if (model.type === Type.Aggregated && !encrypted._id) encrypted._id = base64ToBase64Url(uint8ArrayToBase64(random.generateRandomData(4)));
		return pMap(Object.keys(model.associations), async (associationName) => {
			if (model.associations[associationName].type === AssociationType.Aggregation) {
				const dependency = model.associations[associationName].dependency;
				const aggregateTypeModel = await resolveTypeReference(new TypeRef(dependency || model.app, model.associations[associationName].refType));
				let aggregation = model.associations[associationName];
				if (aggregation.cardinality === Cardinality.ZeroOrOne && i[associationName] == null) encrypted[associationName] = null;
else if (i[associationName] == null) throw new ProgrammingError(`Undefined attribute ${model.name}:${associationName}`);
else if (aggregation.cardinality === Cardinality.Any) return pMap(i[associationName], (aggregate) => {
					return this.encryptAndMapToLiteral(aggregateTypeModel, aggregate, sk);
				}).then((encryptedAggregates) => {
					encrypted[associationName] = encryptedAggregates;
				});
else return this.encryptAndMapToLiteral(aggregateTypeModel, i[associationName], sk).then((encryptedAggregate) => {
					encrypted[associationName] = encryptedAggregate;
				});
			} else encrypted[associationName] = i[associationName];
		}).then(() => {
			return encrypted;
		});
	}
};
function encryptValue(valueName, valueType, value, sk, iv = random.generateRandomData(IV_BYTE_LENGTH)) {
	if (valueName === "_id" || valueName === "_permissions") return value;
else if (value == null) if (valueType.cardinality === Cardinality.ZeroOrOne) return null;
else throw new ProgrammingError(`Value ${valueName} with cardinality ONE can not be null`);
else if (valueType.encrypted) {
		let bytes = value;
		if (valueType.type !== ValueType.Bytes) {
			const dbType = assertNotNull(convertJsToDbType(valueType.type, value));
			bytes = typeof dbType === "string" ? stringToUtf8Uint8Array(dbType) : dbType;
		}
		return uint8ArrayToBase64(aesEncrypt(assertNotNull(sk), bytes, iv, true, ENABLE_MAC));
	} else {
		const dbType = convertJsToDbType(valueType.type, value);
		if (typeof dbType === "string") return dbType;
else return uint8ArrayToBase64(dbType);
	}
}
function decryptValue(valueName, valueType, value, sk) {
	if (value == null) if (valueType.cardinality === Cardinality.ZeroOrOne) return null;
else throw new ProgrammingError(`Value ${valueName} with cardinality ONE can not be null`);
else if (valueType.cardinality === Cardinality.One && value === "") return valueToDefault(valueType.type);
else if (valueType.encrypted) {
		if (sk == null) throw new CryptoError("session key is null, but value is encrypted. valueName: " + valueName + " valueType: " + valueType);
		let decryptedBytes = aesDecrypt(sk, base64ToUint8Array(value));
		if (valueType.type === ValueType.Bytes) return decryptedBytes;
else if (valueType.type === ValueType.CompressedString) return decompressString(decryptedBytes);
else return convertDbToJsType(valueType.type, utf8Uint8ArrayToString(decryptedBytes));
	} else return convertDbToJsType(valueType.type, value);
}
/**
* Returns bytes when the type === Bytes or type === CompressedString, otherwise returns a string
* @param type
* @param value
* @returns {string|string|NodeJS.Global.Uint8Array|*}
*/
function convertJsToDbType(type, value) {
	if (type === ValueType.Bytes && value != null) return value;
else if (type === ValueType.Boolean) return value ? "1" : "0";
else if (type === ValueType.Date) return value.getTime().toString();
else if (type === ValueType.CompressedString) return compressString(value);
else return value;
}
function convertDbToJsType(type, value) {
	if (type === ValueType.Bytes) return base64ToUint8Array(value);
else if (type === ValueType.Boolean) return value !== "0";
else if (type === ValueType.Date) return new Date(parseInt(value));
else if (type === ValueType.CompressedString) return decompressString(base64ToUint8Array(value));
else return value;
}
function compressString(uncompressed) {
	return compress(stringToUtf8Uint8Array(uncompressed));
}
function decompressString(compressed) {
	if (compressed.length === 0) return "";
	const output = uncompress(compressed);
	return utf8Uint8ArrayToString(output);
}
function valueToDefault(type) {
	switch (type) {
		case ValueType.String: return "";
		case ValueType.Number: return "0";
		case ValueType.Bytes: return new Uint8Array(0);
		case ValueType.Date: return new Date(0);
		case ValueType.Boolean: return false;
		case ValueType.CompressedString: return "";
		default: throw new ProgrammingError(`${type} is not a valid value type`);
	}
}
function isDefaultValue(type, value) {
	switch (type) {
		case ValueType.String: return value === "";
		case ValueType.Number: return value === "0";
		case ValueType.Bytes: return value.length === 0;
		case ValueType.Date: return value.getTime() === 0;
		case ValueType.Boolean: return value === false;
		case ValueType.CompressedString: return value === "";
		default: throw new ProgrammingError(`${type} is not a valid value type`);
	}
}

//#endregion
//#region src/common/api/worker/rest/AdminClientDummyEntityRestCache.ts
var AdminClientDummyEntityRestCache = class {
	async entityEventsReceived(batch) {
		return batch.events;
	}
	async erase(instance) {
		throw new ProgrammingError("erase not implemented");
	}
	async load(_typeRef, _id, _opts) {
		throw new ProgrammingError("load not implemented");
	}
	async loadMultiple(typeRef, listId, elementIds) {
		throw new ProgrammingError("loadMultiple not implemented");
	}
	async loadRange(typeRef, listId, start, count, reverse) {
		throw new ProgrammingError("loadRange not implemented");
	}
	async purgeStorage() {
		return;
	}
	async setup(listId, instance, extraHeaders) {
		throw new ProgrammingError("setup not implemented");
	}
	async setupMultiple(listId, instances) {
		throw new ProgrammingError("setupMultiple not implemented");
	}
	async update(instance) {
		throw new ProgrammingError("update not implemented");
	}
	async getLastEntityEventBatchForGroup(groupId) {
		return null;
	}
	async setLastEntityEventBatchForGroup(groupId, batchId) {
		return;
	}
	async recordSyncTime() {
		return;
	}
	async timeSinceLastSyncMs() {
		return null;
	}
	async isOutOfSync() {
		return false;
	}
};

//#endregion
//#region src/common/api/worker/utils/SleepDetector.ts
const CHECK_INTERVAL = 5e3;
const SLEEP_INTERVAL = 15e3;
var SleepDetector = class {
	scheduledState = null;
	constructor(scheduler, dateProvider) {
		this.scheduler = scheduler;
		this.dateProvider = dateProvider;
	}
	start(onSleep) {
		this.stop();
		this.scheduledState = {
			scheduledId: this.scheduler.schedulePeriodic(() => this.check(), CHECK_INTERVAL),
			lastTime: this.dateProvider.now(),
			onSleep
		};
	}
	check() {
		if (this.scheduledState == null) return;
		const now = this.dateProvider.now();
		if (now - this.scheduledState.lastTime > SLEEP_INTERVAL) this.scheduledState.onSleep();
		this.scheduledState.lastTime = now;
	}
	stop() {
		if (this.scheduledState) {
			this.scheduler.unschedulePeriodic(this.scheduledState.scheduledId);
			this.scheduledState = null;
		}
	}
};

//#endregion
//#region src/common/api/worker/rest/EphemeralCacheStorage.ts
var EphemeralCacheStorage = class {
	/** Path to id to entity map. */
	entities = new Map();
	lists = new Map();
	blobEntities = new Map();
	customCacheHandlerMap = new CustomCacheHandlerMap();
	lastUpdateTime = null;
	userId = null;
	lastBatchIdPerGroup = new Map();
	init({ userId }) {
		this.userId = userId;
	}
	deinit() {
		this.userId = null;
		this.entities.clear();
		this.lists.clear();
		this.blobEntities.clear();
		this.lastUpdateTime = null;
		this.lastBatchIdPerGroup.clear();
	}
	/**
	* Get a given entity from the cache, expects that you have already checked for existence
	*/
	async get(typeRef, listId, elementId) {
		const path = typeRefToPath(typeRef);
		const typeModel = await resolveTypeReference(typeRef);
		elementId = ensureBase64Ext(typeModel, elementId);
		switch (typeModel.type) {
			case Type.Element: return clone(this.entities.get(path)?.get(elementId) ?? null);
			case Type.ListElement: return clone(this.lists.get(path)?.get(assertNotNull(listId))?.elements.get(elementId) ?? null);
			case Type.BlobElement: return clone(this.blobEntities.get(path)?.get(assertNotNull(listId))?.elements.get(elementId) ?? null);
			default: throw new ProgrammingError("must be a persistent type");
		}
	}
	async deleteIfExists(typeRef, listId, elementId) {
		const path = typeRefToPath(typeRef);
		let typeModel;
		typeModel = await resolveTypeReference(typeRef);
		elementId = ensureBase64Ext(typeModel, elementId);
		switch (typeModel.type) {
			case Type.Element:
				this.entities.get(path)?.delete(elementId);
				break;
			case Type.ListElement: {
				const cache = this.lists.get(path)?.get(assertNotNull(listId));
				if (cache != null) {
					cache.elements.delete(elementId);
					remove(cache.allRange, elementId);
				}
				break;
			}
			case Type.BlobElement:
				this.blobEntities.get(path)?.get(assertNotNull(listId))?.elements.delete(elementId);
				break;
			default: throw new ProgrammingError("must be a persistent type");
		}
	}
	addElementEntity(typeRef, id, entity) {
		getFromMap(this.entities, typeRefToPath(typeRef), () => new Map()).set(id, entity);
	}
	async isElementIdInCacheRange(typeRef, listId, elementId) {
		const typeModel = await resolveTypeReference(typeRef);
		elementId = ensureBase64Ext(typeModel, elementId);
		const cache = this.lists.get(typeRefToPath(typeRef))?.get(listId);
		return cache != null && !firstBiggerThanSecond(elementId, cache.upperRangeId) && !firstBiggerThanSecond(cache.lowerRangeId, elementId);
	}
	async put(originalEntity) {
		const entity = clone(originalEntity);
		const typeRef = entity._type;
		const typeModel = await resolveTypeReference(typeRef);
		let { listId, elementId } = expandId(originalEntity._id);
		elementId = ensureBase64Ext(typeModel, elementId);
		switch (typeModel.type) {
			case Type.Element: {
				const elementEntity = entity;
				this.addElementEntity(elementEntity._type, elementId, elementEntity);
				break;
			}
			case Type.ListElement: {
				const listElementEntity = entity;
				const listElementTypeRef = typeRef;
				listId = listId;
				await this.putListElement(listElementTypeRef, listId, elementId, listElementEntity);
				break;
			}
			case Type.BlobElement: {
				const blobElementEntity = entity;
				const blobTypeRef = typeRef;
				listId = listId;
				await this.putBlobElement(blobTypeRef, listId, elementId, blobElementEntity);
				break;
			}
			default: throw new ProgrammingError("must be a persistent type");
		}
	}
	async putBlobElement(typeRef, listId, elementId, entity) {
		const cache = this.blobEntities.get(typeRefToPath(typeRef))?.get(listId);
		if (cache == null) {
			const newCache = { elements: new Map([[elementId, entity]]) };
			getFromMap(this.blobEntities, typeRefToPath(typeRef), () => new Map()).set(listId, newCache);
		} else cache.elements.set(elementId, entity);
	}
	/** prcondition: elementId is converted to base64ext if necessary */
	async putListElement(typeRef, listId, elementId, entity) {
		const cache = this.lists.get(typeRefToPath(typeRef))?.get(listId);
		if (cache == null) {
			const newCache = {
				allRange: [elementId],
				lowerRangeId: elementId,
				upperRangeId: elementId,
				elements: new Map([[elementId, entity]])
			};
			getFromMap(this.lists, typeRefToPath(typeRef), () => new Map()).set(listId, newCache);
		} else {
			cache.elements.set(elementId, entity);
			const typeModel = await resolveTypeReference(typeRef);
			if (await this.isElementIdInCacheRange(typeRef, listId, customIdToBase64Url(typeModel, elementId))) this.insertIntoRange(cache.allRange, elementId);
		}
	}
	/** precondition: elementId is converted to base64ext if necessary */
	insertIntoRange(allRange, elementId) {
		for (let i = 0; i < allRange.length; i++) {
			const rangeElement = allRange[i];
			if (firstBiggerThanSecond(rangeElement, elementId)) {
				allRange.splice(i, 0, elementId);
				return;
			}
			if (rangeElement === elementId) return;
		}
		allRange.push(elementId);
	}
	async provideFromRange(typeRef, listId, startElementId, count, reverse) {
		const typeModel = await resolveTypeReference(typeRef);
		startElementId = ensureBase64Ext(typeModel, startElementId);
		const listCache = this.lists.get(typeRefToPath(typeRef))?.get(listId);
		if (listCache == null) return [];
		let range = listCache.allRange;
		let ids = [];
		if (reverse) {
			let i;
			for (i = range.length - 1; i >= 0; i--) if (firstBiggerThanSecond(startElementId, range[i])) break;
			if (i >= 0) {
				let startIndex = i + 1 - count;
				if (startIndex < 0) startIndex = 0;
				ids = range.slice(startIndex, i + 1);
				ids.reverse();
			} else ids = [];
		} else {
			const i = range.findIndex((id) => firstBiggerThanSecond(id, startElementId));
			ids = range.slice(i, i + count);
		}
		let result = [];
		for (let a = 0; a < ids.length; a++) result.push(clone(listCache.elements.get(ids[a])));
		return result;
	}
	async provideMultiple(typeRef, listId, elementIds) {
		const listCache = this.lists.get(typeRefToPath(typeRef))?.get(listId);
		const typeModel = await resolveTypeReference(typeRef);
		elementIds = elementIds.map((el) => ensureBase64Ext(typeModel, el));
		if (listCache == null) return [];
		let result = [];
		for (let a = 0; a < elementIds.length; a++) result.push(clone(listCache.elements.get(elementIds[a])));
		return result;
	}
	async getRangeForList(typeRef, listId) {
		const listCache = this.lists.get(typeRefToPath(typeRef))?.get(listId);
		if (listCache == null) return null;
		const typeModel = await resolveTypeReference(typeRef);
		return {
			lower: customIdToBase64Url(typeModel, listCache.lowerRangeId),
			upper: customIdToBase64Url(typeModel, listCache.upperRangeId)
		};
	}
	async setUpperRangeForList(typeRef, listId, upperId) {
		const typeModel = await resolveTypeReference(typeRef);
		upperId = ensureBase64Ext(typeModel, upperId);
		const listCache = this.lists.get(typeRefToPath(typeRef))?.get(listId);
		if (listCache == null) throw new Error("list does not exist");
		listCache.upperRangeId = upperId;
	}
	async setLowerRangeForList(typeRef, listId, lowerId) {
		const typeModel = await resolveTypeReference(typeRef);
		lowerId = ensureBase64Ext(typeModel, lowerId);
		const listCache = this.lists.get(typeRefToPath(typeRef))?.get(listId);
		if (listCache == null) throw new Error("list does not exist");
		listCache.lowerRangeId = lowerId;
	}
	/**
	* Creates a new list cache if there is none. Resets everything but elements.
	* @param typeRef
	* @param listId
	* @param lower
	* @param upper
	*/
	async setNewRangeForList(typeRef, listId, lower, upper) {
		const typeModel = await resolveTypeReference(typeRef);
		lower = ensureBase64Ext(typeModel, lower);
		upper = ensureBase64Ext(typeModel, upper);
		const listCache = this.lists.get(typeRefToPath(typeRef))?.get(listId);
		if (listCache == null) getFromMap(this.lists, typeRefToPath(typeRef), () => new Map()).set(listId, {
			allRange: [],
			lowerRangeId: lower,
			upperRangeId: upper,
			elements: new Map()
		});
else {
			listCache.lowerRangeId = lower;
			listCache.upperRangeId = upper;
			listCache.allRange = [];
		}
	}
	async getIdsInRange(typeRef, listId) {
		const typeModel = await resolveTypeReference(typeRef);
		return this.lists.get(typeRefToPath(typeRef))?.get(listId)?.allRange.map((elementId) => {
			return customIdToBase64Url(typeModel, elementId);
		}) ?? [];
	}
	async getLastBatchIdForGroup(groupId) {
		return this.lastBatchIdPerGroup.get(groupId) ?? null;
	}
	async putLastBatchIdForGroup(groupId, batchId) {
		this.lastBatchIdPerGroup.set(groupId, batchId);
	}
	purgeStorage() {
		return Promise.resolve();
	}
	async getLastUpdateTime() {
		return this.lastUpdateTime ? {
			type: "recorded",
			time: this.lastUpdateTime
		} : { type: "never" };
	}
	async putLastUpdateTime(value) {
		this.lastUpdateTime = value;
	}
	async getWholeList(typeRef, listId) {
		const listCache = this.lists.get(typeRefToPath(typeRef))?.get(listId);
		if (listCache == null) return [];
		return listCache.allRange.map((id) => clone(listCache.elements.get(id)));
	}
	getCustomCacheHandlerMap(entityRestClient) {
		return this.customCacheHandlerMap;
	}
	getUserId() {
		return assertNotNull(this.userId, "No user id, not initialized?");
	}
	async deleteAllOwnedBy(owner) {
		for (const typeMap of this.entities.values()) for (const [id, entity] of typeMap.entries()) if (entity._ownerGroup === owner) typeMap.delete(id);
		for (const cacheForType of this.lists.values()) this.deleteAllOwnedByFromCache(cacheForType, owner);
		for (const cacheForType of this.blobEntities.values()) this.deleteAllOwnedByFromCache(cacheForType, owner);
		this.lastBatchIdPerGroup.delete(owner);
	}
	async deleteWholeList(typeRef, listId) {
		this.lists.get(typeRef.type)?.delete(listId);
	}
	deleteAllOwnedByFromCache(cacheForType, owner) {
		const listIdsToDelete = [];
		for (const [listId, listCache] of cacheForType.entries()) for (const [id, element] of listCache.elements.entries()) if (element._ownerGroup === owner) {
			listIdsToDelete.push(listId);
			break;
		}
		for (const listId of listIdsToDelete) cacheForType.delete(listId);
	}
	clearExcludedData() {
		return Promise.resolve();
	}
	/**
	* We want to lock the access to the "ranges" db when updating / reading the
	* offline available mail list ranges for each mail list (referenced using the listId)
	* @param listId the mail list that we want to lock
	*/
	lockRangesDbAccess(listId) {
		return Promise.resolve();
	}
	/**
	* This is the counterpart to the function "lockRangesDbAccess(listId)"
	* @param listId the mail list that we want to unlock
	*/
	unlockRangesDbAccess(listId) {
		return Promise.resolve();
	}
};

//#endregion
//#region src/common/api/worker/rest/CacheStorageProxy.ts
var LateInitializedCacheStorageImpl = class {
	_inner = null;
	constructor(sendError, offlineStorageProvider) {
		this.sendError = sendError;
		this.offlineStorageProvider = offlineStorageProvider;
	}
	get inner() {
		if (this._inner == null) throw new ProgrammingError("Cache storage is not initialized");
		return this._inner;
	}
	async initialize(args) {
		const { storage, isPersistent, isNewOfflineDb } = await this.getStorage(args);
		this._inner = storage;
		return {
			isPersistent,
			isNewOfflineDb
		};
	}
	async deInitialize() {
		this._inner?.deinit();
	}
	async getStorage(args) {
		if (args.type === "offline") try {
			const storage$1 = await this.offlineStorageProvider();
			if (storage$1 != null) {
				const isNewOfflineDb = await storage$1.init(args);
				return {
					storage: storage$1,
					isPersistent: true,
					isNewOfflineDb
				};
			}
		} catch (e) {
			console.error("Error while initializing offline cache storage", e);
			this.sendError(e);
		}
		const storage = new EphemeralCacheStorage();
		await storage.init(args);
		return {
			storage,
			isPersistent: false,
			isNewOfflineDb: false
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
};

//#endregion
//#region src/common/api/worker/rest/ServiceExecutor.ts
assertWorkerOrNode();
var ServiceExecutor = class {
	constructor(restClient, authDataProvider, instanceMapper, cryptoFacade) {
		this.restClient = restClient;
		this.authDataProvider = authDataProvider;
		this.instanceMapper = instanceMapper;
		this.cryptoFacade = cryptoFacade;
	}
	get(service, data, params) {
		return this.executeServiceRequest(service, HttpMethod.GET, data, params);
	}
	post(service, data, params) {
		return this.executeServiceRequest(service, HttpMethod.POST, data, params);
	}
	put(service, data, params) {
		return this.executeServiceRequest(service, HttpMethod.PUT, data, params);
	}
	delete(service, data, params) {
		return this.executeServiceRequest(service, HttpMethod.DELETE, data, params);
	}
	async executeServiceRequest(service, method, requestEntity, params) {
		const methodDefinition = this.getMethodDefinition(service, method);
		if (methodDefinition.return && params?.sessionKey == null && (await resolveTypeReference(methodDefinition.return)).encrypted && !this.authDataProvider.isFullyLoggedIn()) throw new LoginIncompleteError(`Tried to make service request with encrypted return type but is not fully logged in yet, service: ${service.name}`);
		const modelVersion = await this.getModelVersion(methodDefinition);
		const path = `/rest/${service.app.toLowerCase()}/${service.name.toLowerCase()}`;
		const headers = {
			...this.authDataProvider.createAuthHeaders(),
			...params?.extraHeaders,
			v: modelVersion
		};
		const encryptedEntity = await this.encryptDataIfNeeded(methodDefinition, requestEntity, service, method, params ?? null);
		const data = await this.restClient.request(path, method, {
			queryParams: params?.queryParams,
			headers,
			responseType: MediaType.Json,
			body: encryptedEntity ?? undefined,
			suspensionBehavior: params?.suspensionBehavior,
			baseUrl: params?.baseUrl
		});
		if (methodDefinition.return) return await this.decryptResponse(methodDefinition.return, data, params);
	}
	getMethodDefinition(service, method) {
		switch (method) {
			case HttpMethod.GET: return service["get"];
			case HttpMethod.POST: return service["post"];
			case HttpMethod.PUT: return service["put"];
			case HttpMethod.DELETE: return service["delete"];
		}
	}
	async getModelVersion(methodDefinition) {
		const someTypeRef = methodDefinition.data ?? methodDefinition.return;
		if (someTypeRef == null) throw new ProgrammingError("Need either data or return for the service method!");
		const model = await resolveTypeReference(someTypeRef);
		return model.version;
	}
	async encryptDataIfNeeded(methodDefinition, requestEntity, service, method, params) {
		if (methodDefinition.data != null) {
			if (requestEntity == null || !isSameTypeRef(methodDefinition.data, requestEntity._type)) throw new ProgrammingError(`Invalid service data! ${service.name} ${method}`);
			const requestTypeModel = await resolveTypeReference(methodDefinition.data);
			if (requestTypeModel.encrypted && params?.sessionKey == null) throw new ProgrammingError("Must provide a session key for an encrypted data transfer type!: " + service);
			const encryptedEntity = await this.instanceMapper.encryptAndMapToLiteral(requestTypeModel, requestEntity, params?.sessionKey ?? null);
			return JSON.stringify(encryptedEntity);
		} else return null;
	}
	async decryptResponse(typeRef, data, params) {
		const responseTypeModel = await resolveTypeReference(typeRef);
		const instance = JSON.parse(data, (k, v) => k === "__proto__" ? undefined : v);
		const resolvedSessionKey = await this.cryptoFacade().resolveServiceSessionKey(instance);
		return this.instanceMapper.decryptAndMapToInstance(responseTypeModel, instance, resolvedSessionKey ?? params?.sessionKey ?? null);
	}
};

//#endregion
//#region src/common/api/worker/facades/UserFacade.ts
var UserFacade = class {
	user = null;
	accessToken = null;
	leaderStatus;
	constructor(keyCache, cryptoWrapper) {
		this.keyCache = keyCache;
		this.cryptoWrapper = cryptoWrapper;
		this.reset();
	}
	setAccessToken(accessToken) {
		this.accessToken = accessToken;
	}
	getAccessToken() {
		return this.accessToken;
	}
	setUser(user) {
		if (this.accessToken == null) throw new ProgrammingError("invalid state: no access token");
		this.user = user;
	}
	unlockUserGroupKey(userPassphraseKey) {
		if (this.user == null) throw new ProgrammingError("Invalid state: no user");
		const userGroupMembership = this.user.userGroup;
		const currentUserGroupKey = {
			version: parseKeyVersion(userGroupMembership.groupKeyVersion),
			object: decryptKey(userPassphraseKey, userGroupMembership.symEncGKey)
		};
		this.keyCache.setCurrentUserGroupKey(currentUserGroupKey);
		this.setUserDistKey(currentUserGroupKey.version, userPassphraseKey);
	}
	setUserDistKey(currentUserGroupKeyVersion, userPassphraseKey) {
		if (this.user == null) throw new ProgrammingError("Invalid state: no user");
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
		return this.cryptoWrapper.deriveKeyWithHkdf({
			salt: userGroupId,
			key: userPasswordKey,
			context: "userGroupKeyDistributionKey"
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
			context: "versionedUserGroupKeyDistributionKey"
		});
	}
	async updateUser(user) {
		if (this.user == null) throw new ProgrammingError("Update user is called without logging in. This function is not for you.");
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
		return this.accessToken ? { accessToken: this.accessToken } : {};
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
		const currentUserGroupKey = this.keyCache.getCurrentUserGroupKey();
		if (currentUserGroupKey == null) if (this.isPartiallyLoggedIn()) throw new LoginIncompleteError("userGroupKey not available");
else throw new ProgrammingError("Invalid state: userGroupKey is not available");
		return currentUserGroupKey;
	}
	getMembership(groupId) {
		let membership = this.getLoggedInUser().memberships.find((g) => isSameId(g.group, groupId));
		if (!membership) throw new Error(`No group with groupId ${groupId} found!`);
		return membership;
	}
	hasGroup(groupId) {
		if (!this.user) return false;
else return groupId === this.user.userGroup.group || this.user.memberships.some((m) => m.group === groupId);
	}
	getGroupId(groupType) {
		if (groupType === GroupType.User) return this.getUserGroupId();
else {
			let membership = this.getLoggedInUser().memberships.find((m) => m.groupType === groupType);
			if (!membership) throw new Error("could not find groupType " + groupType + " for user " + this.getLoggedInUser()._id);
			return membership.group;
		}
	}
	getGroupIds(groupType) {
		return this.getLoggedInUser().memberships.filter((m) => m.groupType === groupType).map((gm) => gm.group);
	}
	isPartiallyLoggedIn() {
		return this.user != null;
	}
	isFullyLoggedIn() {
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
		this.leaderStatus = createWebsocketLeaderStatus({ leaderStatus: false });
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
			} catch (e) {
				if (e instanceof CryptoError) {
					const legacyUserDistKey = this.keyCache.getLegacyUserDistKey();
					if (legacyUserDistKey == null) {
						console.log("could not update userGroupKey because old legacy distribution key is not available");
						return;
					}
					newUserGroupKeyBytes = decryptKey(legacyUserDistKey, userGroupKeyDistribution.distributionEncUserGroupKey);
				} else throw e;
			}
		} catch (e) {
			console.log(`Could not decrypt userGroupKeyUpdate`, e);
			return;
		}
		const newUserGroupKey = {
			object: newUserGroupKeyBytes,
			version: parseKeyVersion(userGroupKeyDistribution.userGroupKeyVersion)
		};
		console.log(`updating userGroupKey. new version: ${userGroupKeyDistribution.userGroupKeyVersion}`);
		this.keyCache.setCurrentUserGroupKey(newUserGroupKey);
	}
};

//#endregion
//#region src/common/api/worker/offline/StandardMigrations.ts
async function migrateAllListElements(typeRef, storage, migrations) {
	let entities = await storage.getRawListElementsOfType(typeRef);
	for (const migration of migrations) entities = entities.map(migration);
	for (const entity of entities) {
		entity._type = typeRef;
		await storage.put(entity);
	}
}
async function migrateAllElements(typeRef, storage, migrations) {
	let entities = await storage.getRawElementsOfType(typeRef);
	for (const migration of migrations) entities = entities.map(migration);
	for (const entity of entities) {
		entity._type = typeRef;
		await storage.put(entity);
	}
}
function renameAttribute(oldName, newName) {
	return function(entity) {
		entity[newName] = entity[oldName];
		delete entity[oldName];
		return entity;
	};
}
function addOwnerKeyVersion() {
	return function(entity) {
		entity["_ownerKeyVersion"] = entity["_ownerEncSessionKey"] == null ? null : "0";
		return entity;
	};
}
function removeValue(valueName) {
	return function(entity) {
		delete entity[valueName];
		return entity;
	};
}
function addValue(valueName, value) {
	return function(entity) {
		entity[valueName] = value;
		return entity;
	};
}
function changeCardinalityFromAnyToZeroOrOne(attribute) {
	return function(entity) {
		const value = entity[attribute];
		if (!Array.isArray(value)) throw new ProgrammingError("Can only migrate from cardinality ANY.");
		const length = value.length;
		if (length === 0) entity[attribute] = null;
else if (length === 1) entity[attribute] = value[0];
else throw new ProgrammingError(`not possible to migrate ANY to ZERO_OR_ONE with array length > 1. actual length: ${length}`);
		return entity;
	};
}
function deleteInstancesOfType(storage, type) {
	return storage.deleteAllOfType(type);
}

//#endregion
//#region src/common/api/worker/offline/migrations/sys-v94.ts
const sys94 = {
	app: "sys",
	version: 94,
	async migrate(storage) {
		await deleteInstancesOfType(storage, MailTypeRef);
		await deleteInstancesOfType(storage, UserTypeRef);
		await migrateAllListElements(CustomerInfoTypeRef, storage, [createCustomerInfo]);
	}
};

//#endregion
//#region src/common/api/worker/offline/migrations/tutanota-v66.ts
const tutanota66 = {
	app: "tutanota",
	version: 66,
	async migrate(storage) {
		await migrateAllListElements(MailTypeRef, storage, [createMail]);
	}
};

//#endregion
//#region src/common/api/worker/offline/migrations/sys-v92.ts
const sys92 = {
	app: "sys",
	version: 92,
	async migrate(storage) {
		await migrateAllListElements(BucketPermissionTypeRef, storage, [addProtocolVersion]);
		await migrateAllListElements(MailTypeRef, storage, [(e) => {
			if (e.bucketKey) addProtocolVersion(e.bucketKey);
			return e;
		}]);
		await deleteInstancesOfType(storage, GroupTypeRef);
		await deleteInstancesOfType(storage, UserTypeRef);
	}
};
function addProtocolVersion(entity) {
	if (entity.pubEncBucketKey) entity.protocolVersion = CryptoProtocolVersion.RSA;
else entity.protocolVersion = CryptoProtocolVersion.SYMMETRIC_ENCRYPTION;
	return entity;
}

//#endregion
//#region src/common/api/worker/offline/migrations/tutanota-v65.ts
const tutanota65 = {
	app: "tutanota",
	version: 65,
	async migrate(storage) {
		migrateAllListElements(MailTypeRef, storage, [removeValue("restrictions")]);
		migrateAllElements(MailboxGroupRootTypeRef, storage, [
			removeValue("contactFormUserContactForm"),
			removeValue("targetMailGroupContactForm"),
			removeValue("participatingContactForms")
		]);
	}
};

//#endregion
//#region src/common/api/worker/offline/migrations/sys-v91.ts
const sys91 = {
	app: "sys",
	version: 91,
	async migrate(storage) {
		await migrateAllElements(CustomerTypeRef, storage, [removeValue("contactFormUserGroups"), removeValue("contactFormUserAreaGroups")]);
	}
};

//#endregion
//#region src/common/api/worker/offline/migrations/sys-v90.ts
const sys90 = {
	app: "sys",
	version: 90,
	async migrate(storage) {
		await migrateAllListElements(CustomerInfoTypeRef, storage, [(oldCustomerInfo) => {
			if (oldCustomerInfo.customPlan) oldCustomerInfo.customPlan.contactList = false;
			return oldCustomerInfo;
		}]);
		await migrateAllElements(UserTypeRef, storage, [(user) => {
			if (!user.kdfVersion) user.kdfVersion = KdfType.Bcrypt;
			return user;
		}]);
	}
};

//#endregion
//#region src/common/api/worker/offline/migrations/tutanota-v64.ts
const tutanota64 = {
	app: "tutanota",
	version: 64,
	async migrate(storage) {
		migrateAllListElements(FileTypeRef, storage, [removeValue("data")]);
	}
};

//#endregion
//#region src/common/api/worker/offline/migrations/tutanota-v67.ts
const tutanota67 = {
	app: "tutanota",
	version: 67,
	async migrate(storage) {
		await deleteInstancesOfType(storage, ContactTypeRef);
	}
};

//#endregion
//#region src/common/api/worker/offline/migrations/sys-v96.ts
const sys96 = {
	app: "sys",
	version: 96,
	async migrate(storage) {
		const encryptedElementTypes = [
			AccountingInfoTypeRef,
			CustomerServerPropertiesTypeRef,
			InvoiceTypeRef,
			MissedNotificationTypeRef
		];
		const encryptedListElementTypes = [
			GroupInfoTypeRef,
			AuditLogEntryTypeRef,
			WhitelabelChildTypeRef,
			OrderProcessingAgreementTypeRef,
			UserAlarmInfoTypeRef,
			ReceivedGroupInvitationTypeRef,
			GiftCardTypeRef,
			PushIdentifierTypeRef
		];
		for (const type of encryptedElementTypes) await migrateAllElements(type, storage, [addOwnerKeyVersion()]);
		for (const type of encryptedListElementTypes) await migrateAllListElements(type, storage, [addOwnerKeyVersion()]);
		await migrateAllElements(GroupTypeRef, storage, [
			renameAttribute("keys", "currentKeys"),
			changeCardinalityFromAnyToZeroOrOne("currentKeys"),
			removeKeyPairVersion(),
			addValue("formerGroupKeys", null),
			addValue("pubAdminGroupEncGKey", null),
			addValue("groupKeyVersion", "0"),
			addAdminGroupKeyVersion()
		]);
		await migrateAllElements(UserTypeRef, storage, [addVersionsToGroupMemberships(), removeValue("userEncClientKey")]);
		await migrateAllListElements(ReceivedGroupInvitationTypeRef, storage, [addValue("sharedGroupKeyVersion", "0")]);
		await migrateAllElements(RecoverCodeTypeRef, storage, [addValue("userKeyVersion", "0")]);
		await migrateAllElements(UserGroupRootTypeRef, storage, [addValue("keyRotations", null)]);
	}
};
function addVersionsToGroupMemberships() {
	return function(entity) {
		const userGroupMembership = entity["userGroup"];
		userGroupMembership["groupKeyVersion"] = "0";
		userGroupMembership["symKeyVersion"] = "0";
		for (const membership of entity["memberships"]) {
			membership["groupKeyVersion"] = "0";
			membership["symKeyVersion"] = "0";
		}
		return entity;
	};
}
function addAdminGroupKeyVersion() {
	return function(entity) {
		entity["adminGroupKeyVersion"] = entity["adminGroupEncGKey"] == null ? null : "0";
		return entity;
	};
}
function removeKeyPairVersion() {
	return function(entity) {
		const currentKeys = entity["currentKeys"];
		if (currentKeys) delete currentKeys["version"];
		return entity;
	};
}

//#endregion
//#region src/common/api/worker/offline/migrations/tutanota-v69.ts
const tutanota69 = {
	app: "tutanota",
	version: 69,
	async migrate(storage) {
		const encryptedElementTypes = [
			FileSystemTypeRef,
			MailBoxTypeRef,
			ContactListTypeRef,
			TutanotaPropertiesTypeRef,
			CalendarGroupRootTypeRef,
			UserSettingsGroupRootTypeRef,
			ContactListGroupRootTypeRef,
			MailboxPropertiesTypeRef,
			TemplateGroupRootTypeRef
		];
		const encryptedListElementTypes = [
			FileTypeRef,
			ContactTypeRef,
			MailTypeRef,
			MailFolderTypeRef,
			CalendarEventTypeRef,
			CalendarEventUpdateTypeRef,
			EmailTemplateTypeRef,
			MailDetailsDraftTypeRef,
			MailDetailsBlobTypeRef,
			ContactListEntryTypeRef,
			KnowledgeBaseEntryTypeRef
		];
		for (const type of encryptedElementTypes) await migrateAllElements(type, storage, [addOwnerKeyVersion()]);
		for (const type of encryptedListElementTypes) await migrateAllListElements(type, storage, [addOwnerKeyVersion()]);
		await migrateAllListElements(MailTypeRef, storage, [addVersionsToBucketKey()]);
		await migrateAllElements(TutanotaPropertiesTypeRef, storage, [renameAttribute("groupEncEntropy", "userEncEntropy"), addValue("userKeyVersion", null)]);
		await migrateAllElements(MailBoxTypeRef, storage, [removeValue("symEncShareBucketKey")]);
	}
};
function addVersionsToBucketKey() {
	return function(entity) {
		const bucketKey = entity["bucketKey"];
		if (bucketKey != null) {
			bucketKey["recipientKeyVersion"] = "0";
			bucketKey["senderKeyVersion"] = bucketKey["protocolVersion"] === CryptoProtocolVersion.TUTA_CRYPT ? "0" : null;
			for (const instanceSessionKey of bucketKey["bucketEncSessionKeys"]) instanceSessionKey["symKeyVersion"] = "0";
		}
		return entity;
	};
}

//#endregion
//#region src/common/api/worker/offline/migrations/sys-v97.ts
const sys97 = {
	app: "sys",
	version: 97,
	async migrate(storage) {
		await migrateAllElements(CustomerTypeRef, storage, [removeValue("canceledPremiumAccount")]);
	}
};

//#endregion
//#region src/common/api/worker/offline/migrations/tutanota-v71.ts
const tutanota71 = {
	app: "tutanota",
	version: 71,
	async migrate(storage) {
		await deleteInstancesOfType(storage, UserGroupRootTypeRef);
		await deleteInstancesOfType(storage, ReceivedGroupInvitationTypeRef);
		await deleteInstancesOfType(storage, SentGroupInvitationTypeRef);
	}
};

//#endregion
//#region src/common/api/worker/offline/migrations/sys-v99.ts
const sys99 = {
	app: "sys",
	version: 99,
	async migrate(storage) {}
};

//#endregion
//#region src/common/api/worker/offline/migrations/sys-v101.ts
const sys101 = {
	app: "sys",
	version: 101,
	async migrate(storage, sqlCipherFacade) {}
};

//#endregion
//#region src/common/api/worker/offline/migrations/sys-v102.ts
const sys102 = {
	app: "sys",
	version: 102,
	async migrate(storage, sqlCipherFacade) {
		await deleteInstancesOfType(storage, UserGroupRootTypeRef);
		await deleteInstancesOfType(storage, GroupTypeRef);
		await deleteInstancesOfType(storage, UserTypeRef);
	}
};

//#endregion
//#region src/common/api/worker/offline/migrations/tutanota-v72.ts
const tutanota72 = {
	app: "tutanota",
	version: 72,
	async migrate(storage) {}
};

//#endregion
//#region src/common/api/worker/offline/migrations/sys-v103.ts
const sys103 = {
	app: "sys",
	version: 103,
	async migrate(storage, sqlCipherFacade) {
		await deleteInstancesOfType(storage, AccountingInfoTypeRef);
	}
};

//#endregion
//#region src/common/api/worker/offline/migrations/tutanota-v73.ts
const tutanota73 = {
	app: "tutanota",
	version: 73,
	async migrate(storage) {
		await migrateAllListElements(MailTypeRef, storage, [
			removeValue("body"),
			removeValue("toRecipients"),
			removeValue("ccRecipients"),
			removeValue("bccRecipients"),
			removeValue("replyTos"),
			removeValue("headers"),
			removeValue("sentDate")
		]);
		await migrateAllElements(MailBoxTypeRef, storage, [removeValue("mails")]);
		await migrateAllListElements(MailFolderTypeRef, storage, [removeValue("subFolders")]);
		await migrateAllListElements(FileTypeRef, storage, [removeValue("_owner"), removeValue("_area")]);
		await migrateAllListElements(ContactTypeRef, storage, [
			removeValue("_owner"),
			removeValue("_area"),
			removeValue("autoTransmitPassword")
		]);
	}
};

//#endregion
//#region src/common/api/worker/offline/migrations/sys-v104.ts
const sys104 = {
	app: "sys",
	version: 104,
	async migrate(storage, _) {
		await migrateAllElements(UserTypeRef, storage, [removeValue("phoneNumbers")]);
	}
};

//#endregion
//#region src/common/api/worker/offline/migrations/sys-v105.ts
const sys105 = {
	app: "sys",
	version: 105,
	async migrate(storage, _) {
		await deleteInstancesOfType(storage, PushIdentifierTypeRef);
	}
};

//#endregion
//#region src/common/api/worker/offline/migrations/sys-v106.ts
const sys106 = {
	app: "sys",
	version: 106,
	async migrate(storage) {}
};

//#endregion
//#region src/common/api/worker/offline/migrations/tutanota-v74.ts
const tutanota74 = {
	app: "tutanota",
	version: 74,
	async migrate(storage) {
		await migrateAllListElements(MailFolderTypeRef, storage, [
			addValue("isLabel", false),
			addValue("isMailSet", false),
			addValue("entries", GENERATED_MIN_ID)
		]);
		await migrateAllElements(MailBoxTypeRef, storage, [createMailBox]);
		await migrateAllListElements(MailTypeRef, storage, [createMail]);
		await deleteInstancesOfType(storage, CalendarEventTypeRef);
	}
};

//#endregion
//#region src/common/api/worker/offline/migrations/sys-v107.ts
const sys107 = {
	app: "sys",
	version: 107,
	async migrate(storage) {}
};

//#endregion
//#region src/common/api/worker/offline/migrations/tutanota-v75.ts
const tutanota75 = {
	app: "tutanota",
	version: 75,
	async migrate(storage) {
		await deleteInstancesOfType(storage, UserSettingsGroupRootTypeRef);
		const groupInfos = await storage.getRawListElementsOfType(GroupInfoTypeRef);
		for (const groupInfo of groupInfos) {
			if (groupInfo.groupType !== GroupType.User) continue;
			await storage.deleteIfExists(GroupInfoTypeRef, getListId(groupInfo), getElementId(groupInfo));
		}
		await deleteInstancesOfType(storage, AuditLogEntryTypeRef);
	}
};

//#endregion
//#region src/common/api/worker/offline/migrations/sys-v111.ts
const sys111 = {
	app: "sys",
	version: 111,
	async migrate(storage) {
		await migrateAllElements(GroupTypeRef, storage, [removeValue("pubAdminGroupEncGKey"), addValue("pubAdminGroupEncGKey", null)]);
		await migrateAllListElements(GroupKeyTypeRef, storage, [removeValue("pubAdminGroupEncGKey"), addValue("pubAdminGroupEncGKey", null)]);
	}
};

//#endregion
//#region src/common/api/worker/offline/migrations/tutanota-v76.ts
const tutanota76 = {
	app: "tutanota",
	version: 76,
	async migrate(storage) {
		await migrateAllElements(MailboxGroupRootTypeRef, storage, [removeValue("whitelistRequests")]);
	}
};

//#endregion
//#region src/common/api/worker/offline/migrations/sys-v112.ts
const sys112 = {
	app: "sys",
	version: 112,
	async migrate(storage) {
		await migrateAllElements(MailboxGroupRootTypeRef, storage, [removeValue("whitelistedDomains")]);
	}
};

//#endregion
//#region src/common/api/worker/offline/migrations/tutanota-v77.ts
const tutanota77 = {
	app: "tutanota",
	version: 77,
	async migrate(storage) {
		await migrateAllListElements(MailFolderTypeRef, storage, [removeValue("isLabel"), addValue("color", null)]);
		await deleteInstancesOfType(storage, TutanotaPropertiesTypeRef);
	}
};

//#endregion
//#region src/common/api/worker/offline/migrations/sys-v114.ts
const sys114 = {
	app: "sys",
	version: 114,
	async migrate(storage) {
		await migrateAllListElements(CustomerInfoTypeRef, storage, [addUnlimitedLabelsToPlanConfiguration()]);
	}
};
function addUnlimitedLabelsToPlanConfiguration() {
	return function addUnlimitedLabelsToPlanConfigurationMigration(entity) {
		if (entity.customPlan != null) entity.customPlan.unlimitedLabels = false;
		return entity;
	};
}

//#endregion
//#region src/common/api/worker/offline/migrations/offline2.ts
const offline2 = {
	app: "offline",
	version: 2,
	async migrate(storage, _) {
		await migrateAllElements(TutanotaPropertiesTypeRef, storage, [addValue("defaultLabelCreated", false)]);
	}
};

//#endregion
//#region src/common/api/worker/offline/migrations/sys-v115.ts
const sys115 = {
	app: "sys",
	version: 115,
	async migrate(storage) {}
};

//#endregion
//#region src/common/api/worker/offline/migrations/tutanota-v78.ts
const tutanota78 = {
	app: "tutanota",
	version: 78,
	async migrate(storage) {}
};

//#endregion
//#region src/common/api/worker/offline/migrations/sys-v116.ts
const sys116 = {
	app: "sys",
	version: 116,
	async migrate(storage) {}
};

//#endregion
//#region src/common/api/worker/offline/migrations/tutanota-v79.ts
const tutanota79 = {
	app: "tutanota",
	version: 79,
	async migrate(storage) {
		await migrateAllElements(MailBoxTypeRef, storage, [addValue("importedAttachments", GENERATED_MIN_ID), addValue("mailImportStates", GENERATED_MIN_ID)]);
	}
};

//#endregion
//#region src/common/api/worker/offline/migrations/offline3.ts
const offline3 = {
	app: "offline",
	version: 3,
	async migrate(storage, _) {
		let mailboxes = await storage.getElementsOfType(MailBoxTypeRef);
		let needsOfflineDisable = false;
		for (const mailbox of mailboxes) {
			if (mailbox.importedAttachments !== GENERATED_MIN_ID && mailbox.mailImportStates !== GENERATED_MIN_ID) continue;
			await storage.deleteIfExists(MailBoxTypeRef, null, mailbox._id);
			needsOfflineDisable = true;
		}
		if (needsOfflineDisable) {
			await deleteInstancesOfType(storage, UserSettingsGroupRootTypeRef);
			const groupInfos = await storage.getRawListElementsOfType(GroupInfoTypeRef);
			for (const groupInfo of groupInfos) {
				if (groupInfo.groupType !== GroupType.User) continue;
				await storage.deleteIfExists(GroupInfoTypeRef, getListId(groupInfo), getElementId(groupInfo));
			}
		}
	}
};

//#endregion
//#region src/common/api/worker/offline/migrations/sys-v118.ts
const sys118 = {
	app: "sys",
	version: 118,
	async migrate(storage) {
		await migrateAllListElements(CalendarEventTypeRef, storage, [(calendarEvent) => {
			if (calendarEvent.repeatRule) calendarEvent.repeatRule.advancedRules = [];
			return calendarEvent;
		}]);
	}
};

//#endregion
//#region src/common/api/worker/offline/migrations/tutanota-v80.ts
const tutanota80 = {
	app: "tutanota",
	version: 80,
	async migrate(storage) {
		await migrateAllListElements(CalendarEventTypeRef, storage, [(calendarEvent) => {
			if (calendarEvent.repeatRule) calendarEvent.repeatRule.advancedRules = [];
			return calendarEvent;
		}]);
	}
};

//#endregion
//#region src/common/api/worker/offline/migrations/storage-v11.ts
const storage11 = {
	app: "storage",
	version: 11,
	async migrate(storage) {}
};

//#endregion
//#region src/common/api/worker/offline/migrations/sys-v119.ts
const sys119 = {
	app: "sys",
	version: 119,
	async migrate(storage) {
		await deleteInstancesOfType(storage, CustomerInfoTypeRef);
	}
};

//#endregion
//#region src/common/api/worker/offline/migrations/sys-v120.ts
const sys120 = {
	app: "sys",
	version: 120,
	async migrate(storage) {
		await migrateAllListElements(GroupInfoTypeRef, storage, [removeValue("localAdmin")]);
		await migrateAllElements(GroupTypeRef, storage, [removeValue("administratedGroups")]);
	}
};

//#endregion
//#region src/common/api/worker/offline/migrations/tutanota-v83.ts
const tutanota83 = {
	app: "tutanota",
	version: 83,
	async migrate(storage) {
		await migrateAllListElements(MailFolderTypeRef, storage, [removeValue("mails"), removeValue("isMailSet")]);
	}
};

//#endregion
//#region src/common/api/worker/offline/migrations/sys-v121.ts
const sys121 = {
	app: "sys",
	version: 121,
	async migrate(storage) {}
};

//#endregion
//#region src/common/api/worker/offline/OfflineStorageMigrator.ts
const OFFLINE_STORAGE_MIGRATIONS = [
	sys90,
	tutanota64,
	sys91,
	tutanota65,
	sys92,
	tutanota66,
	sys94,
	tutanota67,
	sys96,
	tutanota69,
	sys97,
	tutanota71,
	sys99,
	sys101,
	sys102,
	tutanota72,
	sys103,
	tutanota73,
	sys104,
	sys105,
	sys106,
	tutanota74,
	tutanota75,
	sys107,
	tutanota75,
	sys111,
	tutanota76,
	sys112,
	tutanota77,
	sys114,
	offline2,
	sys115,
	tutanota78,
	sys116,
	tutanota79,
	offline3,
	sys118,
	tutanota80,
	storage11,
	sys119,
	sys120,
	tutanota83,
	sys121
];
const CURRENT_OFFLINE_VERSION = 3;
var OfflineStorageMigrator = class {
	constructor(migrations, modelInfos$1) {
		this.migrations = migrations;
		this.modelInfos = modelInfos$1;
	}
	async migrate(storage, sqlCipherFacade) {
		const meta = await storage.dumpMetadata();
		if (Object.keys(meta).length === 1 && meta.lastUpdateTime != null) throw new OutOfSyncError("Invalid DB state, missing model versions");
		const populatedMeta = await this.populateModelVersions(meta, storage);
		if (this.isDbNewerThanCurrentClient(populatedMeta)) throw new OutOfSyncError(`offline database has newer schema than client`);
		await this.runMigrations(meta, storage, sqlCipherFacade);
		await this.checkStateAfterMigrations(storage);
	}
	async checkStateAfterMigrations(storage) {
		const meta = await storage.dumpMetadata();
		for (const app of typedKeys(this.modelInfos)) {
			const compatibleSince = this.modelInfos[app].compatibleSince;
			let metaVersion = meta[`${app}-version`];
			if (metaVersion < compatibleSince) throw new ProgrammingError(`You forgot to migrate your databases! ${app}.version should be >= ${this.modelInfos[app].compatibleSince} but in db it is ${metaVersion}`);
		}
	}
	async runMigrations(meta, storage, sqlCipherFacade) {
		for (const { app, version, migrate } of this.migrations) {
			const storedVersion = meta[`${app}-version`];
			if (storedVersion < version) {
				console.log(`running offline db migration for ${app} from ${storedVersion} to ${version}`);
				await migrate(storage, sqlCipherFacade);
				console.log("migration finished");
				await storage.setStoredModelVersion(app, version);
			}
		}
	}
	async populateModelVersions(meta, storage) {
		const newMeta = { ...meta };
		for (const app of typedKeys(this.modelInfos)) await this.prepopulateVersionIfAbsent(app, this.modelInfos[app].version, newMeta, storage);
		await this.prepopulateVersionIfAbsent("offline", CURRENT_OFFLINE_VERSION, newMeta, storage);
		return newMeta;
	}
	/**
	* update the metadata table to initialize the row of the app with the given model version
	*
	* NB: mutates meta
	*/
	async prepopulateVersionIfAbsent(app, version, meta, storage) {
		const key = `${app}-version`;
		const storedVersion = meta[key];
		if (storedVersion == null) {
			meta[key] = version;
			await storage.setStoredModelVersion(app, version);
		}
	}
	/**
	* it's possible that the user installed an older client over a newer one, and we don't have backwards migrations.
	* in that case, it's likely that the client can't even understand the contents of the db.
	* we're going to delete it and not migrate at all.
	* @private
	*
	* @returns true if the database we're supposed to migrate has any higher model versions than our highest migration for that model, false otherwise
	*/
	isDbNewerThanCurrentClient(meta) {
		for (const [app, { version }] of typedEntries(this.modelInfos)) {
			const storedVersion = meta[`${app}-version`];
			if (storedVersion > version) return true;
		}
		return assertNotNull(meta[`offline-version`]) > CURRENT_OFFLINE_VERSION;
	}
};

//#endregion
//#region src/common/native/common/generatedipc/SqlCipherFacadeSendDispatcher.ts
var SqlCipherFacadeSendDispatcher = class {
	constructor(transport) {
		this.transport = transport;
	}
	async openDb(...args) {
		return this.transport.invokeNative("ipc", [
			"SqlCipherFacade",
			"openDb",
			...args
		]);
	}
	async closeDb(...args) {
		return this.transport.invokeNative("ipc", [
			"SqlCipherFacade",
			"closeDb",
			...args
		]);
	}
	async deleteDb(...args) {
		return this.transport.invokeNative("ipc", [
			"SqlCipherFacade",
			"deleteDb",
			...args
		]);
	}
	async run(...args) {
		return this.transport.invokeNative("ipc", [
			"SqlCipherFacade",
			"run",
			...args
		]);
	}
	async get(...args) {
		return this.transport.invokeNative("ipc", [
			"SqlCipherFacade",
			"get",
			...args
		]);
	}
	async all(...args) {
		return this.transport.invokeNative("ipc", [
			"SqlCipherFacade",
			"all",
			...args
		]);
	}
	async lockRangesDbAccess(...args) {
		return this.transport.invokeNative("ipc", [
			"SqlCipherFacade",
			"lockRangesDbAccess",
			...args
		]);
	}
	async unlockRangesDbAccess(...args) {
		return this.transport.invokeNative("ipc", [
			"SqlCipherFacade",
			"unlockRangesDbAccess",
			...args
		]);
	}
};

//#endregion
//#region src/common/api/worker/facades/EntropyFacade.ts
var EntropyFacade = class {
	newEntropy = -1;
	lastEntropyUpdate = Date.now();
	constructor(userFacade, serviceExecutor, random$1, lazyKeyLoaderFacade) {
		this.userFacade = userFacade;
		this.serviceExecutor = serviceExecutor;
		this.random = random$1;
		this.lazyKeyLoaderFacade = lazyKeyLoaderFacade;
	}
	/**
	* Adds entropy to the randomizer. Updated the stored entropy for a user when enough entropy has been collected.
	*/
	addEntropy(entropy) {
		try {
			return this.random.addEntropy(entropy);
		} finally {
			this.newEntropy = this.newEntropy + entropy.reduce((sum, value) => value.entropy + sum, 0);
			const now = new Date().getTime();
			if (this.newEntropy > 5e3 && now - this.lastEntropyUpdate > 3e5) {
				this.lastEntropyUpdate = now;
				this.newEntropy = 0;
				this.storeEntropy();
			}
		}
	}
	storeEntropy() {
		if (!this.userFacade.isFullyLoggedIn() || !this.userFacade.isLeader()) return Promise.resolve();
		const userGroupKey = this.userFacade.getCurrentUserGroupKey();
		const entropyData = createEntropyData({
			userEncEntropy: encryptBytes(userGroupKey.object, this.random.generateRandomData(32)),
			userKeyVersion: userGroupKey.version.toString()
		});
		return this.serviceExecutor.put(EntropyService, entropyData).catch(ofClass(LockedError, noOp)).catch(ofClass(ConnectionError, (e) => {
			console.log("could not store entropy", e);
		})).catch(ofClass(ServiceUnavailableError, (e) => {
			console.log("could not store entropy", e);
		}));
	}
	/**
	* Loads entropy from the last logout.
	*/
	async loadEntropy(tutanotaProperties) {
		if (tutanotaProperties.userEncEntropy) try {
			const keyLoaderFacade = this.lazyKeyLoaderFacade();
			const userGroupKey = await keyLoaderFacade.loadSymUserGroupKey(parseKeyVersion(tutanotaProperties.userKeyVersion ?? "0"));
			const entropy = authenticatedAesDecrypt(userGroupKey, tutanotaProperties.userEncEntropy);
			random.addStaticEntropy(entropy);
		} catch (error) {
			console.log("could not decrypt entropy", error);
		}
	}
};

//#endregion
//#region src/common/api/worker/facades/BlobAccessTokenFacade.ts
assertWorkerOrNode();
var BlobAccessTokenFacade = class {
	readCache;
	writeCache;
	constructor(serviceExecutor, authDataProvider, dateProvider) {
		this.serviceExecutor = serviceExecutor;
		this.authDataProvider = authDataProvider;
		this.readCache = new BlobAccessTokenCache(dateProvider);
		this.writeCache = new BlobAccessTokenCache(dateProvider);
	}
	/**
	* Requests a token that allows uploading blobs for the given ArchiveDataType and ownerGroup.
	* @param archiveDataType The type of data that should be stored.
	* @param ownerGroupId The ownerGroup were the data belongs to (e.g. group of type mail)
	*/
	async requestWriteToken(archiveDataType, ownerGroupId) {
		const requestNewToken = async () => {
			const tokenRequest = createBlobAccessTokenPostIn({
				archiveDataType,
				write: createBlobWriteData({ archiveOwnerGroup: ownerGroupId }),
				read: null
			});
			const { blobAccessInfo } = await this.serviceExecutor.post(BlobAccessTokenService, tokenRequest);
			return blobAccessInfo;
		};
		const key = this.makeWriteCacheKey(ownerGroupId, archiveDataType);
		return this.writeCache.getToken(key, [], requestNewToken);
	}
	makeWriteCacheKey(ownerGroupId, archiveDataType) {
		return ownerGroupId + archiveDataType;
	}
	/**
	* Remove a given write token from the cache.
	* @param archiveDataType
	* @param ownerGroupId
	*/
	evictWriteToken(archiveDataType, ownerGroupId) {
		const key = this.makeWriteCacheKey(ownerGroupId, archiveDataType);
		this.writeCache.evictArchiveOrGroupKey(key);
	}
	/**
	* Requests a token that grants read access to all blobs that are referenced by the given instances.
	* A user must be owner of the instance but must not be owner of the archive where the blobs are stored in.
	*
	* @param archiveDataType specify the data type
	* @param referencingInstances the instances that references the blobs
	* @param blobLoadOptions load options when loading blobs
	* @throws ProgrammingError if instances are not part of the same list or blobs are not part of the same archive.
	*/
	async requestReadTokenMultipleInstances(archiveDataType, referencingInstances, blobLoadOptions) {
		if (isEmpty(referencingInstances)) throw new ProgrammingError("Must pass at least one referencing instance");
		const instanceListId = referencingInstances[0].listId;
		if (!referencingInstances.every((instance) => instance.listId === instanceListId)) throw new ProgrammingError("All referencing instances must be part of the same list");
		const archiveId = this.getArchiveId(referencingInstances);
		const requestNewToken = lazyMemoized(async () => {
			const instanceIds = referencingInstances.map(({ elementId }) => createInstanceId({ instanceId: elementId }));
			const tokenRequest = createBlobAccessTokenPostIn({
				archiveDataType,
				read: createBlobReadData({
					archiveId,
					instanceListId,
					instanceIds
				}),
				write: null
			});
			const { blobAccessInfo } = await this.serviceExecutor.post(BlobAccessTokenService, tokenRequest, blobLoadOptions);
			return blobAccessInfo;
		});
		return this.readCache.getToken(archiveId, referencingInstances.map((instance) => instance.elementId), requestNewToken);
	}
	/**
	* Requests a token that grants read access to all blobs that are referenced by the given instance.
	* A user must be owner of the instance but must not be owner of the archive were the blobs are stored in.
	* @param archiveDataType specify the data type
	* @param referencingInstance the instance that references the blobs
	* @param blobLoadOptions load options when loading blobs
	*/
	async requestReadTokenBlobs(archiveDataType, referencingInstance, blobLoadOptions) {
		const archiveId = this.getArchiveId([referencingInstance]);
		const requestNewToken = async () => {
			const instanceListId = referencingInstance.listId;
			const instanceId = referencingInstance.elementId;
			const instanceIds = [createInstanceId({ instanceId })];
			const tokenRequest = createBlobAccessTokenPostIn({
				archiveDataType,
				read: createBlobReadData({
					archiveId,
					instanceListId,
					instanceIds
				}),
				write: null
			});
			const { blobAccessInfo } = await this.serviceExecutor.post(BlobAccessTokenService, tokenRequest, blobLoadOptions);
			return blobAccessInfo;
		};
		return this.readCache.getToken(archiveId, [referencingInstance.elementId], requestNewToken);
	}
	/**
	* Remove a given read blobs token from the cache.
	* @param referencingInstance
	*/
	evictReadBlobsToken(referencingInstance) {
		this.readCache.evictInstanceId(referencingInstance.elementId);
		const archiveId = this.getArchiveId([referencingInstance]);
		this.readCache.evictArchiveOrGroupKey(archiveId);
	}
	/**
	* Remove a given read blobs token from the cache.
	* @param referencingInstances
	*/
	evictReadBlobsTokenMultipleBlobs(referencingInstances) {
		this.readCache.evictAll(referencingInstances.map((instance) => instance.elementId));
		const archiveId = this.getArchiveId(referencingInstances);
		this.readCache.evictArchiveOrGroupKey(archiveId);
	}
	/**
	* Requests a token that grants access to all blobs stored in the given archive. The user must own the archive (member of group)
	* @param archiveId ID for the archive to read blobs from
	*/
	async requestReadTokenArchive(archiveId) {
		const requestNewToken = async () => {
			const tokenRequest = createBlobAccessTokenPostIn({
				archiveDataType: null,
				read: createBlobReadData({
					archiveId,
					instanceIds: [],
					instanceListId: null
				}),
				write: null
			});
			const { blobAccessInfo } = await this.serviceExecutor.post(BlobAccessTokenService, tokenRequest);
			return blobAccessInfo;
		};
		return this.readCache.getToken(archiveId, [], requestNewToken);
	}
	/**
	* Remove a given read archive token from the cache.
	* @param archiveId
	*/
	evictArchiveToken(archiveId) {
		this.readCache.evictArchiveOrGroupKey(archiveId);
	}
	getArchiveId(referencingInstances) {
		if (isEmpty(referencingInstances)) throw new ProgrammingError("Must pass at least one referencing instance");
		const archiveIds = new Set();
		for (const referencingInstance of referencingInstances) {
			if (isEmpty(referencingInstance.blobs)) throw new ProgrammingError("must pass blobs");
			for (const blob of referencingInstance.blobs) archiveIds.add(blob.archiveId);
		}
		if (archiveIds.size != 1) throw new Error(`only one archive id allowed, but was ${archiveIds}`);
		return referencingInstances[0].blobs[0].archiveId;
	}
	/**
	*
	* @param blobServerAccessInfo
	* @param additionalRequestParams
	* @param typeRef the typeRef that shall be used to determine the correct model version
	*/
	async createQueryParams(blobServerAccessInfo, additionalRequestParams, typeRef) {
		const typeModel = await resolveTypeReference(typeRef);
		return Object.assign(additionalRequestParams, {
			blobAccessToken: blobServerAccessInfo.blobAccessToken,
			v: typeModel.version
		}, this.authDataProvider.createAuthHeaders());
	}
};
/**
* Checks if the given access token can be used for another blob service requests.
* @param blobServerAccessInfo
* @param dateProvider
*/
function canBeUsedForAnotherRequest(blobServerAccessInfo, dateProvider) {
	return blobServerAccessInfo.expires.getTime() > dateProvider.now();
}
var BlobAccessTokenCache = class {
	instanceMap = new Map();
	archiveMap = new Map();
	constructor(dateProvider) {
		this.dateProvider = dateProvider;
	}
	/**
	* Get a token from the cache or from {@param loader}.
	* First will try to use the token keyed by {@param archiveOrGroupKey}, otherwise it will try to find a token valid for all of {@param instanceIds}.
	*/
	async getToken(archiveOrGroupKey, instanceIds, loader) {
		const archiveToken = archiveOrGroupKey ? this.archiveMap.get(archiveOrGroupKey) : null;
		if (archiveToken != null && canBeUsedForAnotherRequest(archiveToken, this.dateProvider)) return archiveToken;
		const tokens = deduplicate(instanceIds.map((id) => this.instanceMap.get(id) ?? null));
		const firstTokenFound = first(tokens);
		if (tokens.length != 1 || firstTokenFound == null || !canBeUsedForAnotherRequest(firstTokenFound, this.dateProvider)) {
			const newToken = await loader();
			if (archiveOrGroupKey != null && newToken.tokenKind === BlobAccessTokenKind.Archive) this.archiveMap.set(archiveOrGroupKey, newToken);
else for (const id of instanceIds) this.instanceMap.set(id, newToken);
			return newToken;
		} else return firstTokenFound;
	}
	evictInstanceId(id) {
		this.evictAll([id]);
	}
	evictArchiveOrGroupKey(id) {
		this.archiveMap.delete(id);
	}
	evictAll(ids) {
		for (const id of ids) this.instanceMap.delete(id);
	}
};

//#endregion
//#region src/common/api/worker/crypto/OwnerEncSessionKeysUpdateQueue.ts
assertWorkerOrNode();
const UPDATE_SESSION_KEYS_SERVICE_DEBOUNCE_MS = 50;
var OwnerEncSessionKeysUpdateQueue = class {
	updateInstanceSessionKeyQueue = [];
	invokeUpdateSessionKeyService;
	senderAuthStatusForMailInstance = null;
	constructor(userFacade, serviceExecutor, debounceTimeoutMs = UPDATE_SESSION_KEYS_SERVICE_DEBOUNCE_MS) {
		this.userFacade = userFacade;
		this.serviceExecutor = serviceExecutor;
		this.invokeUpdateSessionKeyService = debounce(debounceTimeoutMs, () => this.sendUpdateRequest());
	}
	/**
	* Add the ownerEncSessionKey updates to the queue and debounce the update request.
	*
	* @param instanceSessionKeys all instanceSessionKeys from one bucketKey containing the ownerEncSessionKey as symEncSessionKey
	* @param typeModel of the main instance that we are updating session keys for
	*/
	async updateInstanceSessionKeys(instanceSessionKeys, typeModel) {
		if (this.userFacade.isLeader()) {
			const groupKeyUpdateTypeModel = await resolveTypeReference(GroupKeyUpdateTypeRef);
			if (groupKeyUpdateTypeModel.id !== typeModel.id) {
				this.updateInstanceSessionKeyQueue.push(...instanceSessionKeys);
				this.invokeUpdateSessionKeyService();
			}
		}
	}
	async sendUpdateRequest() {
		const instanceSessionKeys = this.updateInstanceSessionKeyQueue;
		this.updateInstanceSessionKeyQueue = [];
		try {
			if (instanceSessionKeys.length > 0) await this.postUpdateSessionKeysService(instanceSessionKeys);
		} catch (e) {
			if (e instanceof LockedError) {
				this.updateInstanceSessionKeyQueue.push(...instanceSessionKeys);
				this.invokeUpdateSessionKeyService();
			} else {
				console.log("error during session key update:", e.name, instanceSessionKeys.length);
				throw e;
			}
		}
	}
	async postUpdateSessionKeysService(instanceSessionKeys) {
		const input = createUpdateSessionKeysPostIn({ ownerEncSessionKeys: instanceSessionKeys });
		await this.serviceExecutor.post(UpdateSessionKeysService, input);
	}
};

//#endregion
//#region src/common/api/worker/EventBusEventCoordinator.ts
var EventBusEventCoordinator = class {
	constructor(connectivityListener, mailFacade, userFacade, entityClient, eventController, configurationDatabase, keyRotationFacade, cacheManagementFacade, sendError, appSpecificBatchHandling) {
		this.connectivityListener = connectivityListener;
		this.mailFacade = mailFacade;
		this.userFacade = userFacade;
		this.entityClient = entityClient;
		this.eventController = eventController;
		this.configurationDatabase = configurationDatabase;
		this.keyRotationFacade = keyRotationFacade;
		this.cacheManagementFacade = cacheManagementFacade;
		this.sendError = sendError;
		this.appSpecificBatchHandling = appSpecificBatchHandling;
	}
	onWebsocketStateChanged(state) {
		this.connectivityListener.updateWebSocketState(state);
	}
	async onEntityEventsReceived(events, batchId, groupId) {
		await this.entityEventsReceived(events);
		await (await this.mailFacade()).entityEventsReceived(events);
		await this.eventController.onEntityUpdateReceived(events, groupId);
		if (!isTest() && !isAdminClient()) {
			const queuedBatch = {
				groupId,
				batchId,
				events
			};
			const configurationDatabase = await this.configurationDatabase();
			await configurationDatabase.onEntityEventsReceived(queuedBatch);
			this.appSpecificBatchHandling([queuedBatch]);
		}
	}
	/**
	* @param markers only phishing (not spam) marker will be sent as websocket updates
	*/
	async onPhishingMarkersReceived(markers) {
		(await this.mailFacade()).phishingMarkersUpdateReceived(markers);
	}
	onError(tutanotaError) {
		this.sendError(tutanotaError);
	}
	onLeaderStatusChanged(leaderStatus) {
		this.connectivityListener.onLeaderStatusChanged(leaderStatus);
		if (!isAdminClient()) {
			const user = this.userFacade.getUser();
			if (leaderStatus.leaderStatus && user && user.accountType !== AccountType.EXTERNAL) this.keyRotationFacade.processPendingKeyRotationsAndUpdates(user);
else this.keyRotationFacade.reset();
		}
	}
	onCounterChanged(counter) {
		this.eventController.onCountersUpdateReceived(counter);
	}
	async entityEventsReceived(data) {
		const groupKeyUpdates = [];
		const user = this.userFacade.getUser();
		if (user == null) return;
		for (const update of data) if (update.operation === OperationType.UPDATE && isSameTypeRefByAttr(UserTypeRef, update.application, update.type) && isSameId(user._id, update.instanceId)) await this.userFacade.updateUser(await this.entityClient.load(UserTypeRef, user._id));
else if ((update.operation === OperationType.CREATE || update.operation === OperationType.UPDATE) && isSameTypeRefByAttr(UserGroupKeyDistributionTypeRef, update.application, update.type) && isSameId(user.userGroup.group, update.instanceId)) await (await this.cacheManagementFacade()).tryUpdatingUserGroupKey();
else if (update.operation === OperationType.CREATE && isSameTypeRefByAttr(GroupKeyUpdateTypeRef, update.application, update.type)) groupKeyUpdates.push([update.instanceListId, update.instanceId]);
		await this.keyRotationFacade.updateGroupMemberships(groupKeyUpdates);
	}
};

//#endregion
//#region src/common/api/worker/facades/WorkerFacade.ts
var WorkerFacade = class {
	async generateSsePushIdentifer() {
		return keyToBase64(aes256RandomKey());
	}
	async getLog() {
		const global = self;
		const logger = global.logger;
		if (logger) return logger.getEntries();
else return [];
	}
	async urlify(html) {
		const { urlify } = await import("./Urlifier-chunk.js");
		return urlify(html);
	}
};

//#endregion
//#region \0wasm-loader:argon2.wasm
async function loadWasm$1(options) {
	const shouldForceFallback = options && options.forceFallback;
	if (typeof WebAssembly !== "object" || typeof WebAssembly.instantiate !== "function" || shouldForceFallback) return (() => {
		throw new TypeError("WASM is not supported");
	})();
else if (typeof process !== "undefined") {
		const { readFile } = await import("fs/promises");
		const { dirname, join } = await import("path");
		const { fileURLToPath } = await import("url");
		const __dirname = dirname(fileURLToPath(import.meta.url));
		const wasmPath = join(__dirname, "argon2.wasm");
		const wasmSource = await readFile(wasmPath);
		return (await WebAssembly.instantiate(wasmSource)).instance.exports;
	} else {
		const wasm = fetch("argon2.wasm");
		if (WebAssembly.instantiateStreaming) return (await WebAssembly.instantiateStreaming(wasm)).instance.exports;
else {
			const buffer = await (await wasm).arrayBuffer();
			return (await WebAssembly.instantiate(buffer)).instance.exports;
		}
	}
}

//#endregion
//#region src/common/api/worker/facades/Argon2idFacade.ts
assertWorkerOrNode();
var WASMArgon2idFacade = class {
	argon2 = new LazyLoaded(async () => {
		return await loadWasm$1();
	});
	async generateKeyFromPassphrase(passphrase, salt) {
		return generateKeyFromPassphrase(await this.argon2.getAsync(), passphrase, salt);
	}
};
var NativeArgon2idFacade = class {
	constructor(nativeCryptoFacade) {
		this.nativeCryptoFacade = nativeCryptoFacade;
	}
	async generateKeyFromPassphrase(passphrase, salt) {
		const hash = await this.nativeCryptoFacade.argon2idGeneratePassphraseKey(passphrase, salt);
		return uint8ArrayToBitArray(hash);
	}
};

//#endregion
//#region \0wasm-loader:liboqs.wasm
async function loadWasm(options) {
	const shouldForceFallback = options && options.forceFallback;
	if (typeof WebAssembly !== "object" || typeof WebAssembly.instantiate !== "function" || shouldForceFallback) return (() => {
		throw new TypeError("WASM is not supported");
	})();
else if (typeof process !== "undefined") {
		const { readFile } = await import("fs/promises");
		const { dirname, join } = await import("path");
		const { fileURLToPath } = await import("url");
		const __dirname = dirname(fileURLToPath(import.meta.url));
		const wasmPath = join(__dirname, "liboqs.wasm");
		const wasmSource = await readFile(wasmPath);
		return (await WebAssembly.instantiate(wasmSource)).instance.exports;
	} else {
		const wasm = fetch("liboqs.wasm");
		if (WebAssembly.instantiateStreaming) return (await WebAssembly.instantiateStreaming(wasm)).instance.exports;
else {
			const buffer = await (await wasm).arrayBuffer();
			return (await WebAssembly.instantiate(buffer)).instance.exports;
		}
	}
}

//#endregion
//#region src/common/api/worker/facades/KyberFacade.ts
assertWorkerOrNode();
var WASMKyberFacade = class {
	constructor(testWASM) {
		this.testWASM = testWASM;
	}
	liboqs = new LazyLoaded(async () => {
		if (this.testWASM) return this.testWASM;
		return await loadWasm();
	});
	async generateKeypair() {
		return generateKeyPair(await this.liboqs.getAsync(), random);
	}
	async encapsulate(publicKey) {
		return encapsulate(await this.liboqs.getAsync(), publicKey, random);
	}
	async decapsulate(privateKey, ciphertext) {
		return decapsulate(await this.liboqs.getAsync(), privateKey, ciphertext);
	}
};
var NativeKyberFacade = class {
	constructor(nativeCryptoFacade) {
		this.nativeCryptoFacade = nativeCryptoFacade;
	}
	generateKeypair() {
		return this.nativeCryptoFacade.generateKyberKeypair(random.generateRandomData(ML_KEM_RAND_AMOUNT_OF_ENTROPY));
	}
	encapsulate(publicKey) {
		return this.nativeCryptoFacade.kyberEncapsulate(publicKey, random.generateRandomData(ML_KEM_RAND_AMOUNT_OF_ENTROPY));
	}
	decapsulate(privateKey, ciphertext) {
		return this.nativeCryptoFacade.kyberDecapsulate(privateKey, ciphertext);
	}
};

//#endregion
//#region src/common/api/worker/facades/PQMessage.ts
function decodePQMessage(encoded) {
	const pqMessageParts = bytesToByteArrays(encoded, 4);
	return {
		senderIdentityPubKey: pqMessageParts[0],
		ephemeralPubKey: pqMessageParts[1],
		encapsulation: {
			kyberCipherText: pqMessageParts[2],
			kekEncBucketKey: pqMessageParts[3]
		}
	};
}
function encodePQMessage({ senderIdentityPubKey, ephemeralPubKey, encapsulation }) {
	return byteArraysToBytes([
		senderIdentityPubKey,
		ephemeralPubKey,
		encapsulation.kyberCipherText,
		encapsulation.kekEncBucketKey
	]);
}

//#endregion
//#region src/common/api/worker/facades/PQFacade.ts
var PQFacade = class {
	constructor(kyberFacade) {
		this.kyberFacade = kyberFacade;
	}
	async generateKeyPairs() {
		return {
			keyPairType: KeyPairType.TUTA_CRYPT,
			eccKeyPair: generateEccKeyPair(),
			kyberKeyPair: await this.kyberFacade.generateKeypair()
		};
	}
	async encapsulateAndEncode(senderIdentityKeyPair, ephemeralKeyPair, recipientPublicKeys, bucketKey) {
		const encapsulated = await this.encapsulate(senderIdentityKeyPair, ephemeralKeyPair, recipientPublicKeys, bucketKey);
		return encodePQMessage(encapsulated);
	}
	/**
	* @VisibleForTesting
	*/
	async encapsulate(senderIdentityKeyPair, ephemeralKeyPair, recipientPublicKeys, bucketKey) {
		const eccSharedSecret = eccEncapsulate(senderIdentityKeyPair.privateKey, ephemeralKeyPair.privateKey, recipientPublicKeys.eccPublicKey);
		const kyberEncapsulation = await this.kyberFacade.encapsulate(recipientPublicKeys.kyberPublicKey);
		const kyberCipherText = kyberEncapsulation.ciphertext;
		const kek = this.derivePQKEK(senderIdentityKeyPair.publicKey, ephemeralKeyPair.publicKey, recipientPublicKeys, kyberCipherText, kyberEncapsulation.sharedSecret, eccSharedSecret, CryptoProtocolVersion.TUTA_CRYPT);
		const kekEncBucketKey = aesEncrypt(kek, bucketKey);
		return {
			senderIdentityPubKey: senderIdentityKeyPair.publicKey,
			ephemeralPubKey: ephemeralKeyPair.publicKey,
			encapsulation: {
				kyberCipherText,
				kekEncBucketKey
			}
		};
	}
	async decapsulateEncoded(encodedPQMessage, recipientKeys) {
		const decoded = decodePQMessage(encodedPQMessage);
		return {
			decryptedSymKeyBytes: await this.decapsulate(decoded, recipientKeys),
			senderIdentityPubKey: decoded.senderIdentityPubKey
		};
	}
	/**
	* @VisibleForTesting
	*/
	async decapsulate(message, recipientKeys) {
		const kyberCipherText = message.encapsulation.kyberCipherText;
		const eccSharedSecret = eccDecapsulate(message.senderIdentityPubKey, message.ephemeralPubKey, recipientKeys.eccKeyPair.privateKey);
		const kyberSharedSecret = await this.kyberFacade.decapsulate(recipientKeys.kyberKeyPair.privateKey, kyberCipherText);
		const kek = this.derivePQKEK(message.senderIdentityPubKey, message.ephemeralPubKey, pqKeyPairsToPublicKeys(recipientKeys), kyberCipherText, kyberSharedSecret, eccSharedSecret, CryptoProtocolVersion.TUTA_CRYPT);
		return authenticatedAesDecrypt(kek, message.encapsulation.kekEncBucketKey);
	}
	derivePQKEK(senderIdentityPublicKey, ephemeralPublicKey, recipientPublicKeys, kyberCipherText, kyberSharedSecret, eccSharedSecret, cryptoProtocolVersion) {
		const context = concat(senderIdentityPublicKey, ephemeralPublicKey, recipientPublicKeys.eccPublicKey, kyberPublicKeyToBytes(recipientPublicKeys.kyberPublicKey), kyberCipherText, new Uint8Array([Number(cryptoProtocolVersion)]));
		const inputKeyMaterial = concat(eccSharedSecret.ephemeralSharedSecret, eccSharedSecret.authSharedSecret, kyberSharedSecret);
		const kekBytes = hkdf(context, inputKeyMaterial, stringToUtf8Uint8Array("kek"), KEY_LENGTH_BYTES_AES_256);
		return uint8ArrayToKey(kekBytes);
	}
};

//#endregion
//#region src/common/api/worker/facades/KeyRotationFacade.ts
assertWorkerOrNode();
let MultiAdminGroupKeyAdminActionPath = function(MultiAdminGroupKeyAdminActionPath$1) {
	MultiAdminGroupKeyAdminActionPath$1[MultiAdminGroupKeyAdminActionPath$1["WAIT_FOR_OTHER_ADMINS"] = 0] = "WAIT_FOR_OTHER_ADMINS";
	MultiAdminGroupKeyAdminActionPath$1[MultiAdminGroupKeyAdminActionPath$1["CREATE_DISTRIBUTION_KEYS"] = 1] = "CREATE_DISTRIBUTION_KEYS";
	MultiAdminGroupKeyAdminActionPath$1[MultiAdminGroupKeyAdminActionPath$1["PERFORM_KEY_ROTATION"] = 2] = "PERFORM_KEY_ROTATION";
	MultiAdminGroupKeyAdminActionPath$1[MultiAdminGroupKeyAdminActionPath$1["IMPOSSIBLE_STATE"] = 3] = "IMPOSSIBLE_STATE";
	return MultiAdminGroupKeyAdminActionPath$1;
}({});
var KeyRotationFacade = class {
	/**
	* @VisibleForTesting
	*/
	pendingKeyRotations;
	/**
	* Keeps track of which User and Team groups have performed Key Rotation (only for the current session).
	* Other group types may be included, but it is not guaranteed.
	* @private
	*/
	groupIdsThatPerformedKeyRotations;
	facadeInitializedDeferredObject;
	pendingGroupKeyUpdateIds;
	constructor(entityClient, keyLoaderFacade, pqFacade, serviceExecutor, cryptoWrapper, recoverCodeFacade, userFacade, cryptoFacade, shareFacade, groupManagementFacade, asymmetricCryptoFacade, keyAuthenticationFacade, publicKeyProvider) {
		this.entityClient = entityClient;
		this.keyLoaderFacade = keyLoaderFacade;
		this.pqFacade = pqFacade;
		this.serviceExecutor = serviceExecutor;
		this.cryptoWrapper = cryptoWrapper;
		this.recoverCodeFacade = recoverCodeFacade;
		this.userFacade = userFacade;
		this.cryptoFacade = cryptoFacade;
		this.shareFacade = shareFacade;
		this.groupManagementFacade = groupManagementFacade;
		this.asymmetricCryptoFacade = asymmetricCryptoFacade;
		this.keyAuthenticationFacade = keyAuthenticationFacade;
		this.publicKeyProvider = publicKeyProvider;
		this.pendingKeyRotations = {
			pwKey: null,
			adminOrUserGroupKeyRotation: null,
			teamOrCustomerGroupKeyRotations: [],
			userAreaGroupsKeyRotations: []
		};
		this.facadeInitializedDeferredObject = defer();
		this.pendingGroupKeyUpdateIds = [];
		this.groupIdsThatPerformedKeyRotations = new Set();
	}
	/**
	* Initialize the facade with the data it needs to perform rotations later.
	* Needs to be called during login when the password key is still available.
	* @param pwKey the user's passphrase key. May or may not be kept in memory, depending on whether a UserGroup key rotation is scheduled.
	* @param modernKdfType true if argon2id. no admin or user key rotation should be executed if false.
	*/
	async initialize(pwKey, modernKdfType) {
		const result = await this.serviceExecutor.get(GroupKeyRotationInfoService, null);
		if (result.userOrAdminGroupKeyRotationScheduled && modernKdfType) this.pendingKeyRotations.pwKey = pwKey;
		this.pendingGroupKeyUpdateIds = result.groupKeyUpdates;
		this.facadeInitializedDeferredObject.resolve();
	}
	/**
	* Processes pending key rotations and performs follow-up tasks such as updating memberships for groups rotated by another user.
	* @param user
	*/
	async processPendingKeyRotationsAndUpdates(user) {
		try {
			try {
				await this.loadPendingKeyRotations(user);
				await this.processPendingKeyRotation(user);
			} finally {
				await this.updateGroupMemberships(this.pendingGroupKeyUpdateIds);
			}
		} catch (e) {
			if (e instanceof LockedError) console.log("error when processing key rotation or group key update", e);
else throw e;
		}
	}
	/**
	* Queries the server for pending key rotations for a given user and saves them and optionally the given password key (in case an admin or user group needs to be rotated).
	*
	* Note that this function currently makes 2 server requests to load the key rotation list and check if a key rotation is needed.
	* This routine should be optimized in the future by saving a flag on the user to determine whether a key rotation is required or not.
	* @VisibleForTesting
	*/
	async loadPendingKeyRotations(user) {
		const userGroupRoot = await this.entityClient.load(UserGroupRootTypeRef, user.userGroup.group);
		if (userGroupRoot.keyRotations != null) {
			const pendingKeyRotations = await this.entityClient.loadAll(KeyRotationTypeRef, userGroupRoot.keyRotations.list);
			const keyRotationsByType = groupBy(pendingKeyRotations, (keyRotation) => keyRotation.groupKeyRotationType);
			let adminOrUserGroupKeyRotationArray = [
				keyRotationsByType.get(GroupKeyRotationType.AdminGroupKeyRotationSingleUserAccount),
				keyRotationsByType.get(GroupKeyRotationType.AdminGroupKeyRotationMultipleUserAccount),
				keyRotationsByType.get(GroupKeyRotationType.AdminGroupKeyRotationMultipleAdminAccount),
				keyRotationsByType.get(GroupKeyRotationType.User)
			].flat().filter(isNotNull);
			let customerGroupKeyRotationArray = keyRotationsByType.get(GroupKeyRotationType.Customer) || [];
			const adminOrUserGroupKeyRotation = adminOrUserGroupKeyRotationArray[0];
			this.pendingKeyRotations = {
				pwKey: this.pendingKeyRotations.pwKey,
				adminOrUserGroupKeyRotation: adminOrUserGroupKeyRotation ? adminOrUserGroupKeyRotation : null,
				teamOrCustomerGroupKeyRotations: customerGroupKeyRotationArray.concat(keyRotationsByType.get(GroupKeyRotationType.Team) || []),
				userAreaGroupsKeyRotations: keyRotationsByType.get(GroupKeyRotationType.UserArea) || []
			};
		}
	}
	/**
	* Processes the internal list of @PendingKeyRotation. Key rotations and (if existent) password keys are deleted after processing.
	* @VisibleForTesting
	*/
	async processPendingKeyRotation(user) {
		await this.facadeInitializedDeferredObject.promise;
		try {
			if (this.pendingKeyRotations.adminOrUserGroupKeyRotation && this.pendingKeyRotations.pwKey) {
				const groupKeyRotationType = assertEnumValue(GroupKeyRotationType, this.pendingKeyRotations.adminOrUserGroupKeyRotation.groupKeyRotationType);
				switch (groupKeyRotationType) {
					case GroupKeyRotationType.AdminGroupKeyRotationMultipleAdminAccount:
						await this.rotateMultipleAdminsGroupKeys(user, this.pendingKeyRotations.pwKey, this.pendingKeyRotations.adminOrUserGroupKeyRotation);
						break;
					case GroupKeyRotationType.AdminGroupKeyRotationSingleUserAccount:
					case GroupKeyRotationType.AdminGroupKeyRotationMultipleUserAccount:
						await this.rotateSingleAdminGroupKeys(user, this.pendingKeyRotations.pwKey, this.pendingKeyRotations.adminOrUserGroupKeyRotation);
						break;
					case GroupKeyRotationType.User:
						await this.rotateUserGroupKey(user, this.pendingKeyRotations.pwKey, this.pendingKeyRotations.adminOrUserGroupKeyRotation);
						break;
				}
				this.pendingKeyRotations.adminOrUserGroupKeyRotation = null;
			}
		} finally {
			this.pendingKeyRotations.pwKey = null;
		}
		const serviceData = createGroupKeyRotationPostIn({ groupKeyUpdates: [] });
		if (!isEmpty(this.pendingKeyRotations.teamOrCustomerGroupKeyRotations)) {
			const groupKeyRotationData = await this.rotateCustomerOrTeamGroupKeys(user);
			if (groupKeyRotationData != null) serviceData.groupKeyUpdates = groupKeyRotationData;
			this.pendingKeyRotations.teamOrCustomerGroupKeyRotations = [];
		}
		let invitationData = [];
		if (!isEmpty(this.pendingKeyRotations.userAreaGroupsKeyRotations)) {
			const { groupKeyRotationData, preparedReInvites } = await this.rotateUserAreaGroupKeys(user);
			invitationData = preparedReInvites;
			if (groupKeyRotationData != null) serviceData.groupKeyUpdates = serviceData.groupKeyUpdates.concat(groupKeyRotationData);
			this.pendingKeyRotations.userAreaGroupsKeyRotations = [];
		}
		if (serviceData.groupKeyUpdates.length <= 0) return;
		await this.serviceExecutor.post(GroupKeyRotationService, serviceData);
		for (const groupKeyUpdate of serviceData.groupKeyUpdates) this.groupIdsThatPerformedKeyRotations.add(groupKeyUpdate.group);
		if (!isEmpty(invitationData)) {
			const shareFacade = await this.shareFacade();
			await pMap(invitationData, (preparedInvite) => shareFacade.sendGroupInvitationRequest(preparedInvite));
		}
	}
	/**
	* @VisibleForTesting
	*/
	async rotateSingleAdminGroupKeys(user, passphraseKey, keyRotation) {
		if (hasNonQuantumSafeKeys(passphraseKey)) {
			console.log("Not allowed to rotate admin group keys with a bcrypt password key");
			return;
		}
		const currentUserGroupKey = this.keyLoaderFacade.getCurrentSymUserGroupKey();
		const adminGroupMembership = getFirstOrThrow(getUserGroupMemberships(user, GroupType.Admin));
		const currentAdminGroupKey = await this.keyLoaderFacade.getCurrentSymGroupKey(adminGroupMembership.group);
		const adminKeyRotationData = await this.prepareKeyRotationForSingleAdmin(keyRotation, user, currentUserGroupKey, currentAdminGroupKey, passphraseKey);
		await this.serviceExecutor.post(AdminGroupKeyRotationService, adminKeyRotationData.keyRotationData);
		this.groupIdsThatPerformedKeyRotations.add(user.userGroup.group);
	}
	async rotateUserAreaGroupKeys(user) {
		const currentUserGroupKey = this.keyLoaderFacade.getCurrentSymUserGroupKey();
		if (hasNonQuantumSafeKeys(currentUserGroupKey.object)) {
			console.log("Keys cannot be rotated as the encrypting keys are not pq secure");
			return {
				groupKeyRotationData: [],
				preparedReInvites: []
			};
		}
		const groupKeyUpdates = new Array();
		let preparedReInvites = [];
		for (const keyRotation of this.pendingKeyRotations.userAreaGroupsKeyRotations) {
			const { groupKeyRotationData, preparedReInvitations } = await this.prepareKeyRotationForAreaGroup(keyRotation, currentUserGroupKey, user);
			groupKeyUpdates.push(groupKeyRotationData);
			preparedReInvites = preparedReInvites.concat(preparedReInvitations);
		}
		return {
			groupKeyRotationData: groupKeyUpdates,
			preparedReInvites
		};
	}
	async rotateCustomerOrTeamGroupKeys(user) {
		const adminGroupMembership = user.memberships.find((m) => m.groupType === GroupKeyRotationType.AdminGroupKeyRotationSingleUserAccount);
		if (adminGroupMembership == null) {
			console.log("Only admin user can rotate the group");
			return;
		}
		const currentUserGroupKey = this.keyLoaderFacade.getCurrentSymUserGroupKey();
		const currentAdminGroupKey = await this.keyLoaderFacade.getCurrentSymGroupKey(adminGroupMembership.group);
		if (hasNonQuantumSafeKeys(currentUserGroupKey.object, currentAdminGroupKey.object)) {
			console.log("Keys cannot be rotated as the encrypting keys are not pq secure");
			return;
		}
		const groupKeyUpdates = new Array();
		for (const keyRotation of this.pendingKeyRotations.teamOrCustomerGroupKeyRotations) {
			const groupKeyRotationData = await this.prepareKeyRotationForCustomerOrTeamGroup(keyRotation, currentUserGroupKey, currentAdminGroupKey, user);
			groupKeyUpdates.push(groupKeyRotationData);
		}
		return groupKeyUpdates;
	}
	async prepareKeyRotationForSingleAdmin(keyRotation, user, currentUserGroupKey, currentAdminGroupKey, passphraseKey) {
		const adminGroupId = this.getTargetGroupId(keyRotation);
		const userGroupMembership = user.userGroup;
		const userGroupId = userGroupMembership.group;
		console.log(`KeyRotationFacade: rotate key for group: ${adminGroupId}, groupKeyRotationType: ${keyRotation.groupKeyRotationType}`);
		const adminGroup = await this.entityClient.load(GroupTypeRef, adminGroupId);
		const userGroup = await this.entityClient.load(GroupTypeRef, userGroupId);
		const newAdminGroupKeys = await this.generateGroupKeys(adminGroup);
		const adminKeyPair = assertNotNull(newAdminGroupKeys.encryptedKeyPair);
		const adminPubKeyMacList = await this.generatePubKeyTagsForNonAdminUsers(asPQPublicKeys(adminKeyPair), newAdminGroupKeys.symGroupKey.version, adminGroupId, assertNotNull(user.customer), userGroupId);
		const newUserGroupKeys = await this.generateGroupKeys(userGroup);
		const encryptedAdminKeys = await this.encryptGroupKeys(adminGroup, currentAdminGroupKey, newAdminGroupKeys, newAdminGroupKeys.symGroupKey);
		const encryptedUserKeys = await this.encryptUserGroupKey(userGroup, currentUserGroupKey, newUserGroupKeys, passphraseKey, newAdminGroupKeys, user);
		const membershipEncNewGroupKey = this.cryptoWrapper.encryptKeyWithVersionedKey(newUserGroupKeys.symGroupKey, newAdminGroupKeys.symGroupKey.object);
		const adminGroupKeyData = createGroupKeyRotationData({
			adminGroupEncGroupKey: assertNotNull(encryptedAdminKeys.adminGroupKeyEncNewGroupKey).key,
			adminGroupKeyVersion: String(assertNotNull(encryptedAdminKeys.adminGroupKeyEncNewGroupKey).encryptingKeyVersion),
			groupEncPreviousGroupKey: encryptedAdminKeys.newGroupKeyEncCurrentGroupKey.key,
			groupKeyVersion: String(newAdminGroupKeys.symGroupKey.version),
			group: adminGroup._id,
			keyPair: makeKeyPair(encryptedAdminKeys.keyPair),
			groupKeyUpdatesForMembers: [],
			groupMembershipUpdateData: [createGroupMembershipUpdateData({
				userId: user._id,
				userEncGroupKey: membershipEncNewGroupKey.key,
				userKeyVersion: String(membershipEncNewGroupKey.encryptingKeyVersion)
			})]
		});
		const userGroupKeyData = createUserGroupKeyRotationData({
			recoverCodeData: encryptedUserKeys.recoverCodeData,
			distributionKeyEncUserGroupKey: encryptedUserKeys.distributionKeyEncNewUserGroupKey,
			authVerifier: encryptedUserKeys.authVerifier,
			group: userGroup._id,
			userGroupEncPreviousGroupKey: encryptedUserKeys.newUserGroupKeyEncCurrentGroupKey.key,
			userGroupKeyVersion: String(newUserGroupKeys.symGroupKey.version),
			keyPair: encryptedUserKeys.keyPair,
			adminGroupEncUserGroupKey: encryptedUserKeys.newAdminGroupKeyEncNewUserGroupKey.key,
			adminGroupKeyVersion: String(encryptedUserKeys.newAdminGroupKeyEncNewUserGroupKey.encryptingKeyVersion),
			passphraseEncUserGroupKey: encryptedUserKeys.passphraseKeyEncNewUserGroupKey.key,
			pubAdminGroupEncUserGroupKey: null,
			userGroupEncAdminGroupKey: null
		});
		return {
			keyRotationData: createAdminGroupKeyRotationPostIn({
				adminGroupKeyData,
				userGroupKeyData,
				adminPubKeyMacList,
				distribution: []
			}),
			newAdminGroupKeys,
			newUserGroupKeys
		};
	}
	async generatePubKeyTagsForNonAdminUsers(newAdminPubKey, newAdminGroupKeyVersion, adminGroupId, customerId, groupToExclude) {
		const keyTags = [];
		const customer = await this.entityClient.load(CustomerTypeRef, customerId);
		const userGroupInfos = await this.entityClient.loadAll(GroupInfoTypeRef, customer.userGroups);
		let groupManagementFacade = await this.groupManagementFacade();
		for (const userGroupInfo of userGroupInfos) {
			if (isSameId(userGroupInfo.group, groupToExclude)) continue;
			const currentUserGroupKey = await groupManagementFacade.getCurrentGroupKeyViaAdminEncGKey(userGroupInfo.group);
			const tag = this.keyAuthenticationFacade.computeTag({
				tagType: "NEW_ADMIN_PUB_KEY_TAG",
				sourceOfTrust: { receivingUserGroupKey: currentUserGroupKey.object },
				untrustedKey: { newAdminPubKey },
				bindingData: {
					userGroupId: userGroupInfo.group,
					adminGroupId,
					currentReceivingUserGroupKeyVersion: currentUserGroupKey.version,
					newAdminGroupKeyVersion
				}
			});
			const publicKeyTag = createKeyMac({
				taggingGroup: userGroupInfo.group,
				tag,
				taggedKeyVersion: String(newAdminGroupKeyVersion),
				taggingKeyVersion: String(currentUserGroupKey.version)
			});
			keyTags.push(publicKeyTag);
		}
		return keyTags;
	}
	deriveAdminGroupDistributionKeyPairEncryptionKey(adminGroupId, userGroupId, currentAdminGroupKeyVersion, currentUserGroupKeyVersion, pwKey) {
		return this.cryptoWrapper.deriveKeyWithHkdf({
			salt: `adminGroup: ${adminGroupId}, userGroup: ${userGroupId}, currentUserGroupKeyVersion: ${currentUserGroupKeyVersion}, currentAdminGroupKeyVersion: ${currentAdminGroupKeyVersion}`,
			key: pwKey,
			context: "adminGroupDistributionKeyPairEncryptionKey"
		});
	}
	async prepareKeyRotationForAreaGroup(keyRotation, currentUserGroupKey, user) {
		const targetGroupId = this.getTargetGroupId(keyRotation);
		console.log(`KeyRotationFacade: rotate key for group: ${targetGroupId}, groupKeyRotationType: ${keyRotation.groupKeyRotationType}`);
		const targetGroup = await this.entityClient.load(GroupTypeRef, targetGroupId);
		const currentGroupKey = await this.keyLoaderFacade.getCurrentSymGroupKey(targetGroupId);
		const newGroupKeys = await this.generateGroupKeys(targetGroup);
		const groupEncPreviousGroupKey = this.cryptoWrapper.encryptKeyWithVersionedKey(newGroupKeys.symGroupKey, currentGroupKey.object);
		const membershipSymEncNewGroupKey = this.cryptoWrapper.encryptKeyWithVersionedKey(currentUserGroupKey, newGroupKeys.symGroupKey.object);
		const preparedReInvitations = await this.handlePendingInvitations(targetGroup, newGroupKeys.symGroupKey);
		const groupKeyUpdatesForMembers = await this.createGroupKeyUpdatesForMembers(targetGroup, newGroupKeys.symGroupKey);
		const groupKeyRotationData = createGroupKeyRotationData({
			adminGroupEncGroupKey: null,
			adminGroupKeyVersion: null,
			group: targetGroupId,
			groupKeyVersion: String(newGroupKeys.symGroupKey.version),
			groupEncPreviousGroupKey: groupEncPreviousGroupKey.key,
			keyPair: makeKeyPair(newGroupKeys.encryptedKeyPair),
			groupKeyUpdatesForMembers,
			groupMembershipUpdateData: [createGroupMembershipUpdateData({
				userId: user._id,
				userEncGroupKey: membershipSymEncNewGroupKey.key,
				userKeyVersion: String(currentUserGroupKey.version)
			})]
		});
		return {
			groupKeyRotationData,
			preparedReInvitations
		};
	}
	async prepareKeyRotationForCustomerOrTeamGroup(keyRotation, currentUserGroupKey, currentAdminGroupKey, user) {
		const targetGroupId = this.getTargetGroupId(keyRotation);
		console.log(`KeyRotationFacade: rotate key for group: ${targetGroupId}, groupKeyRotationType: ${keyRotation.groupKeyRotationType}`);
		const targetGroup = await this.entityClient.load(GroupTypeRef, targetGroupId);
		const members = await this.entityClient.loadAll(GroupMemberTypeRef, targetGroup.members);
		const ownMember = members.find((member) => member.user == user._id);
		const otherMembers = members.filter((member) => member.user != user._id);
		let currentGroupKey = await this.getCurrentGroupKey(targetGroup);
		const newGroupKeys = await this.generateGroupKeys(targetGroup);
		const encryptedGroupKeys = await this.encryptGroupKeys(targetGroup, currentGroupKey, newGroupKeys, currentAdminGroupKey);
		const groupMembershipUpdateData = new Array();
		if (ownMember) {
			const membershipSymEncNewGroupKey = this.cryptoWrapper.encryptKeyWithVersionedKey(currentUserGroupKey, newGroupKeys.symGroupKey.object);
			groupMembershipUpdateData.push(createGroupMembershipUpdateData({
				userId: user._id,
				userEncGroupKey: membershipSymEncNewGroupKey.key,
				userKeyVersion: String(currentUserGroupKey.version)
			}));
		}
		for (const member of otherMembers) {
			const userEncNewGroupKey = await this.encryptGroupKeyForOtherUsers(member.user, newGroupKeys.symGroupKey);
			let groupMembershipUpdate = createGroupMembershipUpdateData({
				userId: member.user,
				userEncGroupKey: userEncNewGroupKey.key,
				userKeyVersion: String(userEncNewGroupKey.encryptingKeyVersion)
			});
			groupMembershipUpdateData.push(groupMembershipUpdate);
		}
		return createGroupKeyRotationData({
			adminGroupEncGroupKey: encryptedGroupKeys.adminGroupKeyEncNewGroupKey ? encryptedGroupKeys.adminGroupKeyEncNewGroupKey.key : null,
			adminGroupKeyVersion: encryptedGroupKeys.adminGroupKeyEncNewGroupKey ? String(encryptedGroupKeys.adminGroupKeyEncNewGroupKey.encryptingKeyVersion) : null,
			group: targetGroupId,
			groupKeyVersion: String(newGroupKeys.symGroupKey.version),
			groupEncPreviousGroupKey: encryptedGroupKeys.newGroupKeyEncCurrentGroupKey.key,
			keyPair: makeKeyPair(encryptedGroupKeys.keyPair),
			groupKeyUpdatesForMembers: [],
			groupMembershipUpdateData
		});
	}
	async getCurrentGroupKey(targetGroup) {
		try {
			return await this.keyLoaderFacade.getCurrentSymGroupKey(targetGroup._id);
		} catch (e) {
			const groupManagementFacade = await this.groupManagementFacade();
			const currentKey = await groupManagementFacade.getGroupKeyViaAdminEncGKey(targetGroup._id, parseKeyVersion(targetGroup.groupKeyVersion));
			return {
				object: currentKey,
				version: parseKeyVersion(targetGroup.groupKeyVersion)
			};
		}
	}
	async encryptUserGroupKey(userGroup, currentUserGroupKey, newUserGroupKeys, passphraseKey, newAdminGroupKeys, user) {
		const { membershipSymEncNewGroupKey, distributionKeyEncNewUserGroupKey, authVerifier } = this.encryptUserGroupKeyForUser(passphraseKey, newUserGroupKeys, userGroup, currentUserGroupKey);
		const encryptedUserKeys = await this.encryptGroupKeys(userGroup, currentUserGroupKey, newUserGroupKeys, newAdminGroupKeys.symGroupKey);
		const recoverCodeData = await this.reencryptRecoverCodeIfExists(user, passphraseKey, newUserGroupKeys);
		return {
			newUserGroupKeyEncCurrentGroupKey: encryptedUserKeys.newGroupKeyEncCurrentGroupKey,
			newAdminGroupKeyEncNewUserGroupKey: assertNotNull(encryptedUserKeys.adminGroupKeyEncNewGroupKey),
			keyPair: assertNotNull(makeKeyPair(encryptedUserKeys.keyPair)),
			passphraseKeyEncNewUserGroupKey: membershipSymEncNewGroupKey,
			recoverCodeData,
			distributionKeyEncNewUserGroupKey,
			authVerifier
		};
	}
	async reencryptRecoverCodeIfExists(user, passphraseKey, newUserGroupKeys) {
		let recoverCodeData = null;
		if (user.auth?.recoverCode != null) {
			const recoverCodeFacade = await this.recoverCodeFacade();
			const recoverCode = await recoverCodeFacade.getRawRecoverCode(passphraseKey);
			const recoverData = recoverCodeFacade.encryptRecoveryCode(recoverCode, newUserGroupKeys.symGroupKey);
			recoverCodeData = createRecoverCodeData({
				recoveryCodeVerifier: recoverData.recoveryCodeVerifier,
				userEncRecoveryCode: recoverData.userEncRecoverCode,
				userKeyVersion: String(recoverData.userKeyVersion),
				recoveryCodeEncUserGroupKey: recoverData.recoverCodeEncUserGroupKey
			});
		}
		return recoverCodeData;
	}
	encryptUserGroupKeyForUser(passphraseKey, newUserGroupKeys, userGroup, currentGroupKey) {
		const versionedPassphraseKey = {
			object: passphraseKey,
			version: 0
		};
		const membershipSymEncNewGroupKey = this.cryptoWrapper.encryptKeyWithVersionedKey(versionedPassphraseKey, newUserGroupKeys.symGroupKey.object);
		const legacyUserDistKey = this.userFacade.deriveLegacyUserDistKey(userGroup._id, passphraseKey);
		const distributionKeyEncNewUserGroupKey = this.cryptoWrapper.encryptKey(legacyUserDistKey, newUserGroupKeys.symGroupKey.object);
		const authVerifier = createAuthVerifier(passphraseKey);
		const newGroupKeyEncCurrentGroupKey = this.cryptoWrapper.encryptKeyWithVersionedKey(newUserGroupKeys.symGroupKey, currentGroupKey.object);
		return {
			membershipSymEncNewGroupKey,
			distributionKeyEncNewUserGroupKey,
			authVerifier,
			newGroupKeyEncCurrentGroupKey
		};
	}
	async handlePendingInvitations(targetGroup, newTargetGroupKey) {
		const preparedReInvitations = [];
		const targetGroupInfo = await this.entityClient.load(GroupInfoTypeRef, targetGroup.groupInfo);
		const pendingInvitations = await this.entityClient.loadAll(SentGroupInvitationTypeRef, targetGroup.invitations);
		const sentInvitationsByCapability = groupBy(pendingInvitations, (invitation) => invitation.capability);
		const shareFacade = await this.shareFacade();
		for (const [capability, sentInvitations] of sentInvitationsByCapability) {
			const inviteeMailAddresses = sentInvitations.map((invite) => invite.inviteeMailAddress);
			const prepareGroupReInvites = async (mailAddresses) => {
				const preparedInvitation = await shareFacade.prepareGroupInvitation(newTargetGroupKey, targetGroupInfo, mailAddresses, downcast(capability));
				preparedReInvitations.push(preparedInvitation);
			};
			try {
				await prepareGroupReInvites(inviteeMailAddresses);
			} catch (e) {
				if (e instanceof RecipientsNotFoundError) {
					const notFoundRecipients = e.message.split("\n");
					const reducedInviteeAddresses = inviteeMailAddresses.filter((address) => !notFoundRecipients.includes(address));
					if (reducedInviteeAddresses.length) await prepareGroupReInvites(reducedInviteeAddresses);
				} else throw e;
			}
		}
		return preparedReInvitations;
	}
	async createGroupKeyUpdatesForMembers(group, newGroupKey) {
		const members = await this.entityClient.loadAll(GroupMemberTypeRef, group.members);
		const otherMembers = members.filter((member) => member.user != this.userFacade.getUser()?._id);
		return await this.tryCreatingGroupKeyUpdatesForMembers(group._id, otherMembers, newGroupKey);
	}
	async tryCreatingGroupKeyUpdatesForMembers(groupId, otherMembers, newGroupKey) {
		const groupKeyUpdates = new Array();
		const groupedMembers = groupBy(otherMembers, (member) => listIdPart(member.userGroupInfo));
		const membersToRemove = new Array();
		for (const [listId, members] of groupedMembers) {
			const userGroupInfos = await this.entityClient.loadMultiple(GroupInfoTypeRef, listId, members.map((member) => elementIdPart(member.userGroupInfo)));
			for (const member of members) {
				const userGroupInfoForMember = userGroupInfos.find((ugi) => isSameId(ugi._id, member.userGroupInfo));
				const memberMailAddress = assertNotNull(userGroupInfoForMember?.mailAddress);
				const bucketKey = this.cryptoWrapper.aes256RandomKey();
				const sessionKey = this.cryptoWrapper.aes256RandomKey();
				const notFoundRecipients = [];
				const senderGroupId = this.userFacade.getUserGroupId();
				const recipientKeyData = await this.cryptoFacade.encryptBucketKeyForInternalRecipient(senderGroupId, bucketKey, memberMailAddress, notFoundRecipients);
				if (recipientKeyData != null && isSameTypeRef(recipientKeyData._type, InternalRecipientKeyDataTypeRef)) {
					const keyData = recipientKeyData;
					const pubEncKeyData = createPubEncKeyData({
						recipientIdentifier: keyData.mailAddress,
						recipientIdentifierType: PublicKeyIdentifierType.MAIL_ADDRESS,
						pubEncSymKey: keyData.pubEncBucketKey,
						recipientKeyVersion: keyData.recipientKeyVersion,
						senderKeyVersion: keyData.senderKeyVersion,
						protocolVersion: keyData.protocolVersion,
						senderIdentifier: senderGroupId,
						senderIdentifierType: PublicKeyIdentifierType.GROUP_ID,
						symKeyMac: null
					});
					const groupKeyUpdateData = createGroupKeyUpdateData({
						sessionKeyEncGroupKey: this.cryptoWrapper.encryptBytes(sessionKey, bitArrayToUint8Array(newGroupKey.object)),
						sessionKeyEncGroupKeyVersion: String(newGroupKey.version),
						bucketKeyEncSessionKey: this.cryptoWrapper.encryptKey(bucketKey, sessionKey),
						pubEncBucketKeyData: pubEncKeyData
					});
					groupKeyUpdates.push(groupKeyUpdateData);
				} else membersToRemove.push(member);
			}
		}
		const groupManagementFacade = await this.groupManagementFacade();
		if (membersToRemove.length !== 0) {
			for (const member of membersToRemove) await groupManagementFacade.removeUserFromGroup(member.user, groupId);
			const reducedMembers = otherMembers.filter((member) => !membersToRemove.includes(member));
			return this.tryCreatingGroupKeyUpdatesForMembers(groupId, reducedMembers, newGroupKey);
		} else return groupKeyUpdates;
	}
	/**
	* Get the ID of the group we want to rotate the keys for.
	*/
	getTargetGroupId(keyRotation) {
		return elementIdPart(keyRotation._id);
	}
	async encryptGroupKeys(group, currentGroupKey, newKeys, adminGroupKeys) {
		const newGroupKeyEncCurrentGroupKey = this.cryptoWrapper.encryptKeyWithVersionedKey(newKeys.symGroupKey, currentGroupKey.object);
		const adminGroupKeyEncNewGroupKey = (await this.groupManagementFacade()).hasAdminEncGKey(group) ? this.cryptoWrapper.encryptKeyWithVersionedKey(adminGroupKeys, newKeys.symGroupKey.object) : null;
		return {
			newGroupKeyEncCurrentGroupKey,
			keyPair: newKeys.encryptedKeyPair,
			adminGroupKeyEncNewGroupKey
		};
	}
	async encryptGroupKeyForOtherUsers(userId, newGroupKey) {
		const groupManagementFacade = await this.groupManagementFacade();
		const user = await this.entityClient.load(UserTypeRef, userId);
		const userGroupKey = await groupManagementFacade.getGroupKeyViaAdminEncGKey(user.userGroup.group, parseKeyVersion(user.userGroup.groupKeyVersion));
		const encrypteNewGroupKey = this.cryptoWrapper.encryptKey(userGroupKey, newGroupKey.object);
		return {
			key: encrypteNewGroupKey,
			encryptingKeyVersion: parseKeyVersion(user.userGroup.groupKeyVersion)
		};
	}
	async generateGroupKeys(group) {
		const symGroupKeyBytes = this.cryptoWrapper.aes256RandomKey();
		const keyPair = await this.createNewKeyPairValue(group, symGroupKeyBytes);
		return {
			symGroupKey: {
				object: symGroupKeyBytes,
				version: checkKeyVersionConstraints(parseKeyVersion(group.groupKeyVersion) + 1)
			},
			encryptedKeyPair: keyPair
		};
	}
	/**
	* Not all groups have key pairs, but if they do we need to rotate them as well.
	*/
	async createNewKeyPairValue(groupToRotate, newSymmetricGroupKey) {
		if (groupToRotate.currentKeys) return this.generateAndEncryptPqKeyPairs(newSymmetricGroupKey);
else return null;
	}
	async generateAndEncryptPqKeyPairs(symmmetricEncryptionKey) {
		const newPqPairs = await this.pqFacade.generateKeyPairs();
		return {
			pubRsaKey: null,
			symEncPrivRsaKey: null,
			pubEccKey: newPqPairs.eccKeyPair.publicKey,
			symEncPrivEccKey: this.cryptoWrapper.encryptEccKey(symmmetricEncryptionKey, newPqPairs.eccKeyPair.privateKey),
			pubKyberKey: this.cryptoWrapper.kyberPublicKeyToBytes(newPqPairs.kyberKeyPair.publicKey),
			symEncPrivKyberKey: this.cryptoWrapper.encryptKyberKey(symmmetricEncryptionKey, newPqPairs.kyberKeyPair.privateKey)
		};
	}
	/**
	* @VisibleForTesting
	* @private
	*/
	setPendingKeyRotations(pendingKeyRotations) {
		this.pendingKeyRotations = pendingKeyRotations;
		this.facadeInitializedDeferredObject.resolve();
	}
	async reset() {
		await this.facadeInitializedDeferredObject.promise;
		this.pendingKeyRotations = {
			pwKey: null,
			adminOrUserGroupKeyRotation: null,
			teamOrCustomerGroupKeyRotations: [],
			userAreaGroupsKeyRotations: []
		};
	}
	/**
	*
	* @param groupKeyUpdateIds MUST be in the same list
	*/
	async updateGroupMemberships(groupKeyUpdateIds) {
		if (groupKeyUpdateIds.length < 1) return;
		console.log("handling group key update for groups: ", groupKeyUpdateIds);
		const groupKeyUpdateInstances = await this.entityClient.loadMultiple(GroupKeyUpdateTypeRef, listIdPart(groupKeyUpdateIds[0]), groupKeyUpdateIds.map((id) => elementIdPart(id)));
		const groupKeyUpdates = groupKeyUpdateInstances.map((update) => this.prepareGroupMembershipUpdate(update));
		const membershipPutIn = createMembershipPutIn({ groupKeyUpdates });
		return this.serviceExecutor.put(MembershipService, membershipPutIn);
	}
	prepareGroupMembershipUpdate(groupKeyUpdate) {
		const userGroupKey = this.keyLoaderFacade.getCurrentSymUserGroupKey();
		const symEncGroupKey = this.cryptoWrapper.encryptKeyWithVersionedKey(userGroupKey, uint8ArrayToKey(groupKeyUpdate.groupKey));
		return createGroupMembershipKeyData({
			group: elementIdPart(groupKeyUpdate._id),
			symEncGKey: symEncGroupKey.key,
			groupKeyVersion: groupKeyUpdate.groupKeyVersion,
			symKeyVersion: String(userGroupKey.version)
		});
	}
	/**
	* This function is responsible for upgrading the encryption keys of any user according to a GroupKeyRotation object
	* Before rotating the keys the user will check that the admin hash created by the admin and encrypted with this user
	* group key matches the hash generated by the user for this rotation.
	*
	* @param user
	* @param pwKey
	* @param userGroupKeyRotation
	* @private
	*/
	async rotateUserGroupKey(user, pwKey, userGroupKeyRotation) {
		const userGroupMembership = user.userGroup;
		const userGroupId = userGroupMembership.group;
		const currentUserGroupKey = this.keyLoaderFacade.getCurrentSymUserGroupKey();
		console.log(`KeyRotationFacade: rotate key for group: ${userGroupId}, groupKeyRotationType: ${userGroupKeyRotation.groupKeyRotationType}`);
		const userGroup = await this.entityClient.load(GroupTypeRef, userGroupId);
		const adminGroupId = assertNotNull(userGroup.admin);
		const newUserGroupKeys = await this.generateGroupKeys(userGroup);
		const { membershipSymEncNewGroupKey, distributionKeyEncNewUserGroupKey, authVerifier, newGroupKeyEncCurrentGroupKey } = this.encryptUserGroupKeyForUser(pwKey, newUserGroupKeys, userGroup, currentUserGroupKey);
		const recoverCodeData = await this.reencryptRecoverCodeIfExists(user, pwKey, newUserGroupKeys);
		let pubAdminGroupEncUserGroupKey = null;
		let adminGroupEncUserGroupKey = null;
		let userGroupEncAdminGroupKey = null;
		let adminGroupKeyVersion;
		if (userGroupKeyRotation.distEncAdminGroupSymKey != null) {
			const encryptedKeysForAdmin = await this.handleUserGroupKeyRotationAsAdmin(userGroupKeyRotation, adminGroupId, pwKey, userGroupId, currentUserGroupKey, newUserGroupKeys);
			adminGroupEncUserGroupKey = encryptedKeysForAdmin.adminGroupEncUserGroupKey;
			adminGroupKeyVersion = encryptedKeysForAdmin.adminGroupKeyVersion;
			userGroupEncAdminGroupKey = encryptedKeysForAdmin.userGroupEncAdminGroupKey;
		} else {
			const encryptedKeysForUser = await this.handleUserGroupKeyRotationAsUser(userGroupKeyRotation, currentUserGroupKey, userGroupId, adminGroupId, newUserGroupKeys);
			pubAdminGroupEncUserGroupKey = encryptedKeysForUser.pubAdminGroupEncUserGroupKey;
			adminGroupKeyVersion = String(encryptedKeysForUser.adminGroupKeyVersion);
		}
		const userGroupKeyData = createUserGroupKeyRotationData({
			userGroupKeyVersion: String(newUserGroupKeys.symGroupKey.version),
			userGroupEncPreviousGroupKey: newGroupKeyEncCurrentGroupKey.key,
			passphraseEncUserGroupKey: membershipSymEncNewGroupKey.key,
			group: userGroupId,
			distributionKeyEncUserGroupKey: distributionKeyEncNewUserGroupKey,
			keyPair: assertNotNull(makeKeyPair(newUserGroupKeys.encryptedKeyPair)),
			authVerifier,
			adminGroupKeyVersion,
			pubAdminGroupEncUserGroupKey,
			adminGroupEncUserGroupKey,
			recoverCodeData,
			userGroupEncAdminGroupKey
		});
		await this.serviceExecutor.post(UserGroupKeyRotationService, createUserGroupKeyRotationPostIn({ userGroupKeyData }));
		this.groupIdsThatPerformedKeyRotations.add(userGroupId);
	}
	async handleUserGroupKeyRotationAsUser(userGroupKeyRotation, currentUserGroupKey, userGroupId, adminGroupId, newUserGroupKeys) {
		if (userGroupKeyRotation.adminPubKeyMac == null) throw new Error("The hash encrypted by admin is not present in the user group key rotation !");
		const { taggedKeyVersion, tag, taggingKeyVersion } = brandKeyMac(userGroupKeyRotation.adminPubKeyMac);
		if (parseKeyVersion(taggingKeyVersion) !== currentUserGroupKey.version) throw new Error(`the encrypting key version in the userEncAdminPubKeyHash does not match hash: ${taggingKeyVersion} current user group key:${currentUserGroupKey.version}`);
		const currentAdminPubKeys = await this.publicKeyProvider.loadCurrentPubKey({
			identifier: adminGroupId,
			identifierType: PublicKeyIdentifierType.GROUP_ID
		});
		const adminGroupKeyVersion = parseKeyVersion(taggedKeyVersion);
		if (currentAdminPubKeys.version !== adminGroupKeyVersion) throw new Error("the public key service did not return the tagged key version to verify the admin public key");
		this.keyAuthenticationFacade.verifyTag({
			tagType: "NEW_ADMIN_PUB_KEY_TAG",
			sourceOfTrust: { receivingUserGroupKey: currentUserGroupKey.object },
			untrustedKey: { newAdminPubKey: asPQPublicKeys(currentAdminPubKeys.object) },
			bindingData: {
				userGroupId,
				adminGroupId,
				newAdminGroupKeyVersion: adminGroupKeyVersion,
				currentReceivingUserGroupKeyVersion: currentUserGroupKey.version
			}
		}, tag);
		const pubAdminGroupEncUserGroupKey = await this.encryptUserGroupKeyForAdminAsymmetrically(userGroupId, newUserGroupKeys, currentAdminPubKeys, adminGroupId, currentUserGroupKey);
		return {
			pubAdminGroupEncUserGroupKey,
			adminGroupKeyVersion: currentAdminPubKeys.version
		};
	}
	async handleUserGroupKeyRotationAsAdmin(userGroupKeyRotation, adminGroupId, pwKey, userGroupId, currentUserGroupKey, newUserGroupKeys) {
		const distEncAdminGroupSymKey = assertNotNull(userGroupKeyRotation.distEncAdminGroupSymKey, "missing new admin group key");
		const pubAdminEncGKeyAuthHash = brandKeyMac(assertNotNull(distEncAdminGroupSymKey.symKeyMac, "missing new admin group key encrypted hash"));
		if (userGroupKeyRotation.adminDistKeyPair == null || !isEncryptedPqKeyPairs(userGroupKeyRotation.adminDistKeyPair)) throw new Error("missing some required parameters for a user group key rotation as admin");
		const currentAdminGroupKeyFromMembership = await this.keyLoaderFacade.getCurrentSymGroupKey(adminGroupId);
		const adminGroupKeyDistributionKeyPairKey = this.deriveAdminGroupDistributionKeyPairEncryptionKey(adminGroupId, userGroupId, currentAdminGroupKeyFromMembership.version, currentUserGroupKey.version, pwKey);
		const adminGroupDistKeyPair = this.cryptoWrapper.decryptKeyPair(adminGroupKeyDistributionKeyPairKey, userGroupKeyRotation.adminDistKeyPair);
		const senderIdentifier = {
			identifier: assertNotNull(distEncAdminGroupSymKey.senderIdentifier),
			identifierType: asPublicKeyIdentifier(assertNotNull(distEncAdminGroupSymKey.senderIdentifierType))
		};
		const decapsulatedNewAdminGroupKey = await this.asymmetricCryptoFacade.decryptSymKeyWithKeyPairAndAuthenticate(adminGroupDistKeyPair, distEncAdminGroupSymKey, senderIdentifier);
		const versionedNewAdminGroupKey = {
			object: decapsulatedNewAdminGroupKey.decryptedAesKey,
			version: parseKeyVersion(pubAdminEncGKeyAuthHash.taggedKeyVersion)
		};
		this.keyAuthenticationFacade.verifyTag({
			tagType: "ADMIN_SYM_KEY_TAG",
			sourceOfTrust: { currentReceivingUserGroupKey: currentUserGroupKey.object },
			untrustedKey: { newAdminGroupKey: versionedNewAdminGroupKey.object },
			bindingData: {
				currentReceivingUserGroupKeyVersion: currentUserGroupKey.version,
				adminGroupId,
				userGroupId,
				newAdminGroupKeyVersion: versionedNewAdminGroupKey.version
			}
		}, pubAdminEncGKeyAuthHash.tag);
		const adminGroupEncUserGroupKey = this.cryptoWrapper.encryptKeyWithVersionedKey(versionedNewAdminGroupKey, newUserGroupKeys.symGroupKey.object).key;
		const userGroupEncAdminGroupKey = this.cryptoWrapper.encryptKeyWithVersionedKey(newUserGroupKeys.symGroupKey, versionedNewAdminGroupKey.object).key;
		const adminGroupKeyVersion = String(versionedNewAdminGroupKey.version);
		return {
			adminGroupEncUserGroupKey,
			userGroupEncAdminGroupKey,
			adminGroupKeyVersion
		};
	}
	async encryptUserGroupKeyForAdminAsymmetrically(userGroupId, newUserGroupKeys, adminPubKeys, adminGroupId, currentUserGroupKey) {
		const pqKeyPair = this.cryptoWrapper.decryptKeyPair(newUserGroupKeys.symGroupKey.object, assertNotNull(newUserGroupKeys.encryptedKeyPair));
		const pubEncSymKey = await this.asymmetricCryptoFacade.tutaCryptEncryptSymKey(newUserGroupKeys.symGroupKey.object, adminPubKeys, {
			version: newUserGroupKeys.symGroupKey.version,
			object: pqKeyPair.eccKeyPair
		});
		const tag = this.keyAuthenticationFacade.computeTag({
			tagType: "USER_GROUP_KEY_TAG",
			untrustedKey: { newUserGroupKey: newUserGroupKeys.symGroupKey.object },
			sourceOfTrust: { currentUserGroupKey: currentUserGroupKey.object },
			bindingData: {
				userGroupId,
				adminGroupId,
				newAdminGroupKeyVersion: adminPubKeys.version,
				currentUserGroupKeyVersion: currentUserGroupKey.version,
				newUserGroupKeyVersion: newUserGroupKeys.symGroupKey.version
			}
		});
		const symKeyMac = createKeyMac({
			taggingGroup: userGroupId,
			tag,
			taggedKeyVersion: String(newUserGroupKeys.symGroupKey.version),
			taggingKeyVersion: String(currentUserGroupKey.version)
		});
		return createPubEncKeyData({
			recipientIdentifier: adminGroupId,
			recipientIdentifierType: PublicKeyIdentifierType.GROUP_ID,
			pubEncSymKey: pubEncSymKey.pubEncSymKeyBytes,
			protocolVersion: pubEncSymKey.cryptoProtocolVersion,
			senderKeyVersion: pubEncSymKey.senderKeyVersion != null ? pubEncSymKey.senderKeyVersion.toString() : null,
			recipientKeyVersion: pubEncSymKey.recipientKeyVersion.toString(),
			senderIdentifier: userGroupId,
			senderIdentifierType: PublicKeyIdentifierType.GROUP_ID,
			symKeyMac
		});
	}
	async createDistributionKeyPair(pwKey, multiAdminKeyRotation) {
		let adminGroupId = getElementId(multiAdminKeyRotation);
		const currentAdminGroupKey = await this.keyLoaderFacade.getCurrentSymGroupKey(adminGroupId);
		const currentUserGroupKey = this.keyLoaderFacade.getCurrentSymUserGroupKey();
		const userGroupId = this.userFacade.getUserGroupId();
		const userGroupKey = this.keyLoaderFacade.getCurrentSymUserGroupKey();
		const adminDistKeyPairDistributionKey = this.deriveAdminGroupDistributionKeyPairEncryptionKey(adminGroupId, userGroupId, currentAdminGroupKey.version, userGroupKey.version, pwKey);
		const adminDistributionKeyPair = await this.generateAndEncryptPqKeyPairs(adminDistKeyPairDistributionKey);
		const tag = this.keyAuthenticationFacade.computeTag({
			tagType: "PUB_DIST_KEY_TAG",
			sourceOfTrust: { currentAdminGroupKey: currentAdminGroupKey.object },
			untrustedKey: { distPubKey: asPQPublicKeys(adminDistributionKeyPair) },
			bindingData: {
				userGroupId,
				adminGroupId,
				currentUserGroupKeyVersion: currentUserGroupKey.version,
				currentAdminGroupKeyVersion: currentAdminGroupKey.version
			}
		});
		const putDistributionKeyPairsOnKeyRotation = createAdminGroupKeyRotationPutIn({
			adminDistKeyPair: assertNotNull(makeKeyPair(adminDistributionKeyPair)),
			distKeyMac: createKeyMac({
				tag,
				taggedKeyVersion: "0",
				taggingGroup: adminGroupId,
				taggingKeyVersion: currentAdminGroupKey.version.toString()
			})
		});
		await this.serviceExecutor.put(AdminGroupKeyRotationService, putDistributionKeyPairsOnKeyRotation);
	}
	async rotateMultipleAdminsGroupKeys(user, passphraseKey, keyRotation) {
		const { distributionKeys, userGroupIdsMissingDistributionKeys } = await this.serviceExecutor.get(AdminGroupKeyRotationService, null);
		switch (this.decideMultiAdminGroupKeyRotationNextPathOfAction(userGroupIdsMissingDistributionKeys, user, distributionKeys)) {
			case MultiAdminGroupKeyAdminActionPath.WAIT_FOR_OTHER_ADMINS: break;
			case MultiAdminGroupKeyAdminActionPath.CREATE_DISTRIBUTION_KEYS:
				await this.createDistributionKeyPair(passphraseKey, keyRotation);
				break;
			case MultiAdminGroupKeyAdminActionPath.PERFORM_KEY_ROTATION:
				await this.performMultiAdminKeyRotation(keyRotation, user, passphraseKey, distributionKeys);
				break;
			case MultiAdminGroupKeyAdminActionPath.IMPOSSIBLE_STATE: throw new TutanotaError("MultiAdminGroupKeyAdminActionPathImpossibleStateMetError", "Impossible state met while performing multi admin key rotation");
		}
	}
	async performMultiAdminKeyRotation(keyRotation, user, passphraseKey, distributionKeys) {
		const adminGroupId = this.getTargetGroupId(keyRotation);
		const currentAdminGroupKey = await this.keyLoaderFacade.getCurrentSymGroupKey(adminGroupId);
		const currentUserGroupKey = this.keyLoaderFacade.getCurrentSymUserGroupKey();
		const { keyRotationData, newAdminGroupKeys, newUserGroupKeys } = await this.prepareKeyRotationForSingleAdmin(keyRotation, user, currentUserGroupKey, currentAdminGroupKey, passphraseKey);
		const newSymAdminGroupKey = newAdminGroupKeys.symGroupKey;
		const { symGroupKey: symUserGroupKey, encryptedKeyPair: encryptedUserKeyPair } = newUserGroupKeys;
		const generatedPrivateEccKey = this.cryptoWrapper.aesDecrypt(symUserGroupKey.object, assertNotNull(encryptedUserKeyPair?.symEncPrivEccKey), true);
		const generatedPublicEccKey = assertNotNull(encryptedUserKeyPair?.pubEccKey);
		const generatedEccKeyPair = {
			version: symUserGroupKey.version,
			object: {
				privateKey: generatedPrivateEccKey,
				publicKey: generatedPublicEccKey
			}
		};
		const groupManagementFacade = await this.groupManagementFacade();
		for (const distributionKey of distributionKeys) {
			if (isSameId(distributionKey.userGroupId, user.userGroup.group)) continue;
			const userGroupId = distributionKey.userGroupId;
			const targetUserGroupKey = await groupManagementFacade.getCurrentGroupKeyViaAdminEncGKey(userGroupId);
			const givenTag = brandKeyMac(distributionKey.pubKeyMac).tag;
			this.keyAuthenticationFacade.verifyTag({
				tagType: "PUB_DIST_KEY_TAG",
				sourceOfTrust: { currentAdminGroupKey: currentAdminGroupKey.object },
				untrustedKey: { distPubKey: asPQPublicKeys(distributionKey) },
				bindingData: {
					userGroupId,
					adminGroupId,
					currentUserGroupKeyVersion: targetUserGroupKey.version,
					currentAdminGroupKeyVersion: currentAdminGroupKey.version
				}
			}, givenTag);
			const recipientPublicDistKeys = {
				version: 0,
				object: {
					pubRsaKey: null,
					pubEccKey: distributionKey.pubEccKey,
					pubKyberKey: distributionKey.pubKyberKey
				}
			};
			const encryptedAdminGroupKeyForThisAdmin = await this.asymmetricCryptoFacade.tutaCryptEncryptSymKey(newSymAdminGroupKey.object, recipientPublicDistKeys, generatedEccKeyPair);
			const adminSymKeyTag = this.keyAuthenticationFacade.computeTag({
				tagType: "ADMIN_SYM_KEY_TAG",
				sourceOfTrust: { currentReceivingUserGroupKey: targetUserGroupKey.object },
				untrustedKey: { newAdminGroupKey: newSymAdminGroupKey.object },
				bindingData: {
					adminGroupId,
					userGroupId,
					currentReceivingUserGroupKeyVersion: currentUserGroupKey.version,
					newAdminGroupKeyVersion: newSymAdminGroupKey.version
				}
			});
			const symKeyMac = createKeyMac({
				taggingGroup: adminGroupId,
				taggedKeyVersion: String(newSymAdminGroupKey.version),
				taggingKeyVersion: String(currentAdminGroupKey.version),
				tag: adminSymKeyTag
			});
			const pubEncKeyData = createPubEncKeyData({
				recipientIdentifierType: PublicKeyIdentifierType.GROUP_ID,
				recipientIdentifier: "dummy",
				recipientKeyVersion: "0",
				pubEncSymKey: encryptedAdminGroupKeyForThisAdmin.pubEncSymKeyBytes,
				senderIdentifierType: PublicKeyIdentifierType.GROUP_ID,
				senderIdentifier: user.userGroup.group,
				senderKeyVersion: String(generatedEccKeyPair.version),
				protocolVersion: CryptoProtocolVersion.TUTA_CRYPT,
				symKeyMac
			});
			const thisAdminDistributionElement = createAdminGroupKeyDistributionElement({
				userGroupId: distributionKey.userGroupId,
				distEncAdminGroupKey: pubEncKeyData
			});
			keyRotationData.distribution.push(thisAdminDistributionElement);
		}
		await this.serviceExecutor.post(AdminGroupKeyRotationService, keyRotationData);
		this.groupIdsThatPerformedKeyRotations.add(user.userGroup.group);
	}
	/**
	* Context: multi admin group key rotation
	*
	* This utility function determines the action a given admin must take in a multi admin group key rotation scenario
	* This action can be one of these three
	* - the admin should wait for the other to create their distribution keys
	* - the admin should create their distribution keys
	* - the admin should perform the key rotation and distribute the new keys to other admins
	*
	* @param userGroupIdsMissingDistributionKeys all admin member ids that currently don't have distribution keys
	* @param adminUser the current logged-in admin user
	* @param distributionKeys the distribution keys already created (include the admins user keys)
	*
	*/
	decideMultiAdminGroupKeyRotationNextPathOfAction(userGroupIdsMissingDistributionKeys, adminUser, distributionKeys) {
		const everyoneHasDistributionKeys = userGroupIdsMissingDistributionKeys.length === 0;
		const everyoneElseHasDistributionKeysButMe = userGroupIdsMissingDistributionKeys.length === 1 && isSameId(userGroupIdsMissingDistributionKeys[0], adminUser.userGroup.group);
		const iHaveDistributionKeys = distributionKeys.some((dk) => isSameId(dk.userGroupId, adminUser.userGroup.group));
		if (everyoneElseHasDistributionKeysButMe || everyoneHasDistributionKeys) return MultiAdminGroupKeyAdminActionPath.PERFORM_KEY_ROTATION;
else if (!everyoneHasDistributionKeys && iHaveDistributionKeys) return MultiAdminGroupKeyAdminActionPath.WAIT_FOR_OTHER_ADMINS;
else if (!everyoneElseHasDistributionKeysButMe && !iHaveDistributionKeys) return MultiAdminGroupKeyAdminActionPath.CREATE_DISTRIBUTION_KEYS;
else return MultiAdminGroupKeyAdminActionPath.IMPOSSIBLE_STATE;
	}
	/**
	* Gets a list of the groups for which we have rotated keys in the session, so far.
	*/
	async getGroupIdsThatPerformedKeyRotations() {
		return Array.from(this.groupIdsThatPerformedKeyRotations.values());
	}
};
/**
* We require AES keys to be 256-bit long to be quantum-safe because of Grover's algorithm.
*/
function isQuantumSafe(key) {
	return getKeyLengthBytes(key) === KEY_LENGTH_BYTES_AES_256;
}
function hasNonQuantumSafeKeys(...keys) {
	return keys.some((key) => !isQuantumSafe(key));
}
function makeKeyPair(keyPair) {
	return keyPair != null ? createKeyPair(keyPair) : null;
}

//#endregion
//#region src/common/api/worker/facades/KeyCache.ts
var KeyCache = class {
	currentGroupKeys = new Map();
	currentUserGroupKey = null;
	userDistKey = null;
	legacyUserDistKey = null;
	setCurrentUserGroupKey(newUserGroupKey) {
		if (this.currentUserGroupKey != null && this.currentUserGroupKey.version > newUserGroupKey.version) {
			console.log("Tried to set an outdated user group key");
			return;
		}
		checkKeyVersionConstraints(newUserGroupKey.version);
		this.currentUserGroupKey = newUserGroupKey;
	}
	getCurrentUserGroupKey() {
		return this.currentUserGroupKey;
	}
	setUserDistKey(userDistKey) {
		this.userDistKey = userDistKey;
	}
	setLegacyUserDistKey(legacyUserDistKey) {
		this.legacyUserDistKey = legacyUserDistKey;
	}
	getUserDistKey() {
		return this.userDistKey;
	}
	getLegacyUserDistKey() {
		return this.legacyUserDistKey;
	}
	/**
	*
	* @param groupId MUST NOT be the user group id
	* @param keyLoader a function to load and decrypt the group key if it is not cached
	*/
	getCurrentGroupKey(groupId, keyLoader) {
		return getFromMap(this.currentGroupKeys, groupId, async () => {
			const loadedKey = await keyLoader();
			checkKeyVersionConstraints(loadedKey.version);
			return loadedKey;
		});
	}
	reset() {
		this.currentGroupKeys = new Map();
		this.currentUserGroupKey = null;
		this.userDistKey = null;
	}
	/**
	* Clears keys from the cache which are outdated or where we do no longer hava a membership.
	* An outdated user membership is ignored and should be processed by the UserGroupKeyDistribution update.
	* @param user updated user with up-to-date memberships
	*/
	async removeOutdatedGroupKeys(user) {
		const currentUserGroupKeyVersion = neverNull(this.getCurrentUserGroupKey()).version;
		const receivedUserGroupKeyVersion = parseKeyVersion(user.userGroup.groupKeyVersion);
		if (receivedUserGroupKeyVersion > currentUserGroupKeyVersion) console.log(`Received user update with new user group key version: ${currentUserGroupKeyVersion} -> ${receivedUserGroupKeyVersion}`);
		const newCurrentGroupKeyCache = new Map();
		for (const membership of user.memberships) {
			const cachedGroupKey = this.currentGroupKeys.get(membership.group);
			if (cachedGroupKey != null && parseKeyVersion(membership.groupKeyVersion) === (await cachedGroupKey).version) await getFromMap(newCurrentGroupKeyCache, membership.group, () => cachedGroupKey);
		}
		this.currentGroupKeys = newCurrentGroupKeyCache;
	}
};

//#endregion
//#region src/mail-app/workerUtils/offline/MailOfflineCleaner.ts
var MailOfflineCleaner = class {
	async cleanOfflineDb(offlineStorage, timeRangeDays, userId, now) {
		const user = await offlineStorage.get(UserTypeRef, null, userId);
		const isFreeUser = user?.accountType === AccountType.FREE;
		const timeRange = isFreeUser || timeRangeDays == null ? OFFLINE_STORAGE_DEFAULT_TIME_RANGE_DAYS : timeRangeDays;
		const daysSinceDayAfterEpoch = now / DAY_IN_MILLIS - 1;
		const timeRangeMillisSafe = Math.min(daysSinceDayAfterEpoch, timeRange) * DAY_IN_MILLIS;
		const cutoffTimestamp = now - timeRangeMillisSafe;
		const mailBoxes = await offlineStorage.getElementsOfType(MailBoxTypeRef);
		const cutoffId = timestampToGeneratedId(cutoffTimestamp);
		for (const mailBox of mailBoxes) {
			const isMailsetMigrated = mailBox.currentMailBag != null;
			const folders = await offlineStorage.getWholeList(MailFolderTypeRef, mailBox.folders.folders);
			if (isMailsetMigrated) {
				const folderSystem = new FolderSystem(folders);
				for (const mailSet of folders) if (isSpamOrTrashFolder(folderSystem, mailSet)) await this.deleteMailSetEntries(offlineStorage, mailSet.entries, CUSTOM_MAX_ID);
else {
					const customCutoffId = constructMailSetEntryId(new Date(cutoffTimestamp), GENERATED_MAX_ID);
					await this.deleteMailSetEntries(offlineStorage, mailSet.entries, customCutoffId);
				}
				const mailListIds = [mailBox.currentMailBag, ...mailBox.archivedMailBags].map((mailbag) => mailbag.mails);
				for (const mailListId of mailListIds) await this.deleteMailListLegacy(offlineStorage, mailListId, cutoffId);
			}
		}
	}
	/**
	* This method deletes mails from {@param listId} what are older than {@param cutoffId} as well as associated data.
	*
	* it's considered legacy because once we start importing mail into mail bags, maintaining mail list ranges doesn't make
	* sense anymore - mail order in a list is arbitrary at that point.
	*
	* For each mail we delete the mail, its body, headers, all references mail set entries and all referenced attachments.
	*
	* When we delete the Files, we also delete the whole range for the user's File list. We need to delete the whole
	* range because we only have one file list per mailbox, so if we delete something from the middle of it, the range
	* will no longer be valid. (this is future proofing, because as of now there is not going to be a Range set for the
	* File list anyway, since we currently do not do range requests for Files.
	*
	* We do not delete ConversationEntries because:
	*  1. They are in the same list for the whole conversation so we can't adjust the range
	*  2. We might need them in the future for showing the whole thread
	*/
	async deleteMailListLegacy(offlineStorage, listId, cutoffId) {
		await offlineStorage.lockRangesDbAccess(listId);
		try {
			await offlineStorage.updateRangeForListAndDeleteObsoleteData(MailTypeRef, listId, cutoffId);
		} finally {
			await offlineStorage.unlockRangesDbAccess(listId);
		}
		const mailsToDelete = [];
		const attachmentsToDelete = [];
		const mailDetailsBlobToDelete = [];
		const mailDetailsDraftToDelete = [];
		const mails = await offlineStorage.getWholeList(MailTypeRef, listId);
		for (let mail of mails) if (firstBiggerThanSecond(cutoffId, getElementId(mail))) {
			mailsToDelete.push(mail._id);
			for (const id of mail.attachments) attachmentsToDelete.push(id);
			if (isDraft(mail)) {
				const mailDetailsId = assertNotNull(mail.mailDetailsDraft);
				mailDetailsDraftToDelete.push(mailDetailsId);
			} else {
				const mailDetailsId = assertNotNull(mail.mailDetails);
				mailDetailsBlobToDelete.push(mailDetailsId);
			}
		}
		for (let [listId$1, elementIds] of groupByAndMap(mailDetailsBlobToDelete, listIdPart, elementIdPart).entries()) await offlineStorage.deleteIn(MailDetailsBlobTypeRef, listId$1, elementIds);
		for (let [listId$1, elementIds] of groupByAndMap(mailDetailsDraftToDelete, listIdPart, elementIdPart).entries()) await offlineStorage.deleteIn(MailDetailsDraftTypeRef, listId$1, elementIds);
		for (let [listId$1, elementIds] of groupByAndMap(attachmentsToDelete, listIdPart, elementIdPart).entries()) {
			await offlineStorage.deleteIn(FileTypeRef, listId$1, elementIds);
			await offlineStorage.deleteRange(FileTypeRef, listId$1);
		}
		await offlineStorage.deleteIn(MailTypeRef, listId, mailsToDelete.map(elementIdPart));
	}
	/**
	* delete all mail set entries of a mail set that reference some mail with a receivedDate older than
	* cutoffTimestamp. this doesn't clean up mails or their associated data because we could be breaking the
	* offline list range invariant by deleting data from the middle of a mail range. cleaning up mails is done
	* the legacy way currently even for mailset users.
	*/
	async deleteMailSetEntries(offlineStorage, entriesListId, cutoffId) {
		await offlineStorage.lockRangesDbAccess(entriesListId);
		try {
			await offlineStorage.updateRangeForListAndDeleteObsoleteData(MailSetEntryTypeRef, entriesListId, cutoffId);
		} finally {
			await offlineStorage.unlockRangesDbAccess(entriesListId);
		}
		const mailSetEntriesToDelete = [];
		const mailSetEntries = await offlineStorage.getWholeList(MailSetEntryTypeRef, entriesListId);
		for (let mailSetEntry of mailSetEntries) if (firstBiggerThanSecondCustomId(cutoffId, getElementId(mailSetEntry))) mailSetEntriesToDelete.push(mailSetEntry._id);
		await offlineStorage.deleteIn(MailSetEntryTypeRef, entriesListId, mailSetEntriesToDelete.map(elementIdPart));
	}
};

//#endregion
//#region src/common/api/worker/crypto/AsymmetricCryptoFacade.ts
assertWorkerOrNode();
var AsymmetricCryptoFacade = class {
	constructor(rsa, pqFacade, keyLoaderFacade, cryptoWrapper, serviceExecutor, publicKeyProvider) {
		this.rsa = rsa;
		this.pqFacade = pqFacade;
		this.keyLoaderFacade = keyLoaderFacade;
		this.cryptoWrapper = cryptoWrapper;
		this.serviceExecutor = serviceExecutor;
		this.publicKeyProvider = publicKeyProvider;
	}
	/**
	* Verifies whether the key that the public key service returns is the same as the one used for encryption.
	* When we have key verification we should stop verifying against the PublicKeyService but against the verified key.
	*
	* @param identifier the identifier to load the public key to verify that it matches the one used in the protocol run.
	* @param senderIdentityPubKey the senderIdentityPubKey that was used to encrypt/authenticate the data.
	* @param senderKeyVersion the version of the senderIdentityPubKey.
	*/
	async authenticateSender(identifier, senderIdentityPubKey, senderKeyVersion) {
		const publicKeys = await this.publicKeyProvider.loadVersionedPubKey(identifier, senderKeyVersion);
		return publicKeys.pubEccKey != null && arrayEquals(publicKeys.pubEccKey, senderIdentityPubKey) ? EncryptionAuthStatus.TUTACRYPT_AUTHENTICATION_SUCCEEDED : EncryptionAuthStatus.TUTACRYPT_AUTHENTICATION_FAILED;
	}
	/**
	* Decrypts the pubEncSymKey with the recipientKeyPair and authenticates it if the protocol supports authentication.
	* If the protocol does not support authentication this method will only decrypt.
	* @param recipientKeyPair the recipientKeyPair. Must match the cryptoProtocolVersion and must be of the required recipientKeyVersion.
	* @param pubEncKeyData the encrypted symKey with the metadata (versions, group identifier etc.) for decryption and authentication.
	* @param senderIdentifier the identifier for the sender's key group
	* @throws CryptoError in case the authentication fails.
	*/
	async decryptSymKeyWithKeyPairAndAuthenticate(recipientKeyPair, pubEncKeyData, senderIdentifier) {
		const cryptoProtocolVersion = asCryptoProtoocolVersion(pubEncKeyData.protocolVersion);
		const decapsulatedAesKey = await this.decryptSymKeyWithKeyPair(recipientKeyPair, cryptoProtocolVersion, pubEncKeyData.pubEncSymKey);
		if (cryptoProtocolVersion === CryptoProtocolVersion.TUTA_CRYPT) {
			const encryptionAuthStatus = await this.authenticateSender(senderIdentifier, assertNotNull(decapsulatedAesKey.senderIdentityPubKey), parseKeyVersion(assertNotNull(pubEncKeyData.senderKeyVersion)));
			if (encryptionAuthStatus !== EncryptionAuthStatus.TUTACRYPT_AUTHENTICATION_SUCCEEDED) throw new CryptoError("the provided public key could not be authenticated");
		}
		return decapsulatedAesKey;
	}
	/**
	* Decrypts the pubEncSymKey with the recipientKeyPair.
	* @param pubEncSymKey the asymmetrically encrypted session key
	* @param cryptoProtocolVersion asymmetric protocol to decrypt pubEncSymKey (RSA or TutaCrypt)
	* @param recipientKeyPair the recipientKeyPair. Must match the cryptoProtocolVersion.
	*/
	async decryptSymKeyWithKeyPair(recipientKeyPair, cryptoProtocolVersion, pubEncSymKey) {
		switch (cryptoProtocolVersion) {
			case CryptoProtocolVersion.RSA: {
				if (!isRsaOrRsaEccKeyPair(recipientKeyPair)) throw new CryptoError("wrong key type. expected rsa. got " + recipientKeyPair.keyPairType);
				const privateKey = recipientKeyPair.privateKey;
				const decryptedSymKey = await this.rsa.decrypt(privateKey, pubEncSymKey);
				return {
					decryptedAesKey: uint8ArrayToBitArray(decryptedSymKey),
					senderIdentityPubKey: null
				};
			}
			case CryptoProtocolVersion.TUTA_CRYPT: {
				if (!isPqKeyPairs(recipientKeyPair)) throw new CryptoError("wrong key type. expected TutaCrypt. got " + recipientKeyPair.keyPairType);
				const { decryptedSymKeyBytes, senderIdentityPubKey } = await this.pqFacade.decapsulateEncoded(pubEncSymKey, recipientKeyPair);
				return {
					decryptedAesKey: uint8ArrayToBitArray(decryptedSymKeyBytes),
					senderIdentityPubKey
				};
			}
			default: throw new CryptoError("invalid cryptoProtocolVersion: " + cryptoProtocolVersion);
		}
	}
	/**
	* Loads the recipient key pair in the required version and decrypts the pubEncSymKey with it.
	*/
	async loadKeyPairAndDecryptSymKey(recipientKeyPairGroupId, recipientKeyVersion, cryptoProtocolVersion, pubEncSymKey) {
		const keyPair = await this.keyLoaderFacade.loadKeypair(recipientKeyPairGroupId, recipientKeyVersion);
		return await this.decryptSymKeyWithKeyPair(keyPair, cryptoProtocolVersion, pubEncSymKey);
	}
	/**
	* Encrypts the symKey asymmetrically with the provided public keys.
	* @param symKey the symmetric key  to be encrypted
	* @param recipientPublicKeys the public key(s) of the recipient in the current version
	* @param senderGroupId the group id of the sender. will only be used in case we also need the sender's key pair, e.g. with TutaCrypt.
	*/
	async asymEncryptSymKey(symKey, recipientPublicKeys, senderGroupId) {
		const recipientPublicKey = this.extractRecipientPublicKey(recipientPublicKeys.object);
		const keyPairType = recipientPublicKey.keyPairType;
		if (isPqPublicKey(recipientPublicKey)) {
			const senderKeyPair = await this.keyLoaderFacade.loadCurrentKeyPair(senderGroupId);
			const senderEccKeyPair = await this.getOrMakeSenderIdentityKeyPair(senderKeyPair.object, senderGroupId);
			return this.tutaCryptEncryptSymKeyImpl({
				object: recipientPublicKey,
				version: recipientPublicKeys.version
			}, symKey, {
				object: senderEccKeyPair,
				version: senderKeyPair.version
			});
		} else if (isRsaPublicKey(recipientPublicKey)) {
			const pubEncSymKeyBytes = await this.rsa.encrypt(recipientPublicKey, bitArrayToUint8Array(symKey));
			return {
				pubEncSymKeyBytes,
				cryptoProtocolVersion: CryptoProtocolVersion.RSA,
				senderKeyVersion: null,
				recipientKeyVersion: recipientPublicKeys.version
			};
		}
		throw new CryptoError("unknown public key type: " + keyPairType);
	}
	/**
	* Encrypts the symKey asymmetrically with the provided public keys using the TutaCrypt protocol.
	* @param symKey the key to be encrypted
	* @param recipientPublicKeys MUST be a pq key pair
	* @param senderEccKeyPair the sender's key pair (needed for authentication)
	* @throws ProgrammingError if the recipientPublicKeys are not suitable for TutaCrypt
	*/
	async tutaCryptEncryptSymKey(symKey, recipientPublicKeys, senderEccKeyPair) {
		const recipientPublicKey = this.extractRecipientPublicKey(recipientPublicKeys.object);
		if (!isPqPublicKey(recipientPublicKey)) throw new ProgrammingError("the recipient does not have pq key pairs");
		return this.tutaCryptEncryptSymKeyImpl({
			object: recipientPublicKey,
			version: recipientPublicKeys.version
		}, symKey, senderEccKeyPair);
	}
	async tutaCryptEncryptSymKeyImpl(recipientPublicKey, symKey, senderEccKeyPair) {
		const ephemeralKeyPair = this.cryptoWrapper.generateEccKeyPair();
		const pubEncSymKeyBytes = await this.pqFacade.encapsulateAndEncode(senderEccKeyPair.object, ephemeralKeyPair, recipientPublicKey.object, bitArrayToUint8Array(symKey));
		const senderKeyVersion = senderEccKeyPair.version;
		return {
			pubEncSymKeyBytes,
			cryptoProtocolVersion: CryptoProtocolVersion.TUTA_CRYPT,
			senderKeyVersion,
			recipientKeyVersion: recipientPublicKey.version
		};
	}
	extractRecipientPublicKey(publicKeys) {
		if (publicKeys.pubRsaKey) return hexToRsaPublicKey(uint8ArrayToHex(publicKeys.pubRsaKey));
else if (publicKeys.pubKyberKey && publicKeys.pubEccKey) {
			const eccPublicKey = publicKeys.pubEccKey;
			const kyberPublicKey = this.cryptoWrapper.bytesToKyberPublicKey(publicKeys.pubKyberKey);
			return {
				keyPairType: KeyPairType.TUTA_CRYPT,
				eccPublicKey,
				kyberPublicKey
			};
		} else throw new Error("Inconsistent Keypair");
	}
	/**
	* Returns the SenderIdentityKeyPair that is either already on the KeyPair that is being passed in,
	* or creates a new one and writes it to the respective Group.
	* @param senderKeyPair
	* @param keyGroupId Id for the Group that Public Key Service might write a new IdentityKeyPair for.
	* 						This is necessary as a User might send an E-Mail from a shared mailbox,
	* 						for which the KeyPair should be created.
	*/
	async getOrMakeSenderIdentityKeyPair(senderKeyPair, keyGroupId) {
		const algo = senderKeyPair.keyPairType;
		if (isPqKeyPairs(senderKeyPair)) return senderKeyPair.eccKeyPair;
else if (isRsaEccKeyPair(senderKeyPair)) return {
			publicKey: senderKeyPair.publicEccKey,
			privateKey: senderKeyPair.privateEccKey
		};
else if (isRsaOrRsaEccKeyPair(senderKeyPair)) {
			const symGroupKey = await this.keyLoaderFacade.getCurrentSymGroupKey(keyGroupId);
			const newIdentityKeyPair = this.cryptoWrapper.generateEccKeyPair();
			const symEncPrivEccKey = this.cryptoWrapper.encryptEccKey(symGroupKey.object, newIdentityKeyPair.privateKey);
			const data = createPublicKeyPutIn({
				pubEccKey: newIdentityKeyPair.publicKey,
				symEncPrivEccKey,
				keyGroup: keyGroupId
			});
			await this.serviceExecutor.put(PublicKeyService, data);
			return newIdentityKeyPair;
		} else throw new CryptoError("unknown key pair type: " + algo);
	}
};

//#endregion
//#region src/common/api/worker/facades/PublicKeyProvider.ts
var PublicKeyProvider = class {
	constructor(serviceExecutor) {
		this.serviceExecutor = serviceExecutor;
	}
	async loadCurrentPubKey(pubKeyIdentifier) {
		return this.loadPubKey(pubKeyIdentifier, null);
	}
	async loadVersionedPubKey(pubKeyIdentifier, version) {
		return (await this.loadPubKey(pubKeyIdentifier, version)).object;
	}
	async loadPubKey(pubKeyIdentifier, version) {
		const requestData = createPublicKeyGetIn({
			version: version ? String(version) : null,
			identifier: pubKeyIdentifier.identifier,
			identifierType: pubKeyIdentifier.identifierType
		});
		const publicKeyGetOut = await this.serviceExecutor.get(PublicKeyService, requestData);
		const pubKeys = this.convertToVersionedPublicKeys(publicKeyGetOut);
		this.enforceRsaKeyVersionConstraint(pubKeys);
		if (version != null && pubKeys.version !== version) throw new InvalidDataError("the server returned a key version that was not requested");
		return pubKeys;
	}
	/**
	* RSA keys were only created before introducing key versions, i.e. they always have version 0.
	*
	* Receiving a higher version would indicate a protocol downgrade/ MITM attack, and we reject such keys.
	*/
	enforceRsaKeyVersionConstraint(pubKeys) {
		if (pubKeys.version !== 0 && pubKeys.object.pubRsaKey != null) throw new CryptoError("rsa key in a version that is not 0");
	}
	convertToVersionedPublicKeys(publicKeyGetOut) {
		return {
			object: {
				pubRsaKey: publicKeyGetOut.pubRsaKey,
				pubKyberKey: publicKeyGetOut.pubKyberKey,
				pubEccKey: publicKeyGetOut.pubEccKey
			},
			version: parseKeyVersion(publicKeyGetOut.pubKeyVersion)
		};
	}
};

//#endregion
//#region src/common/api/worker/DateProvider.ts
var LocalTimeDateProvider = class {
	getStartOfDayShiftedBy(shiftByDays) {
		return getStartOfDay(getDayShifted(new Date(), shiftByDays));
	}
};

//#endregion
//#region src/mail-app/workerUtils/worker/WorkerLocator.ts
assertWorkerOrNode();
const locator = {};
async function initLocator(worker, browserData) {
	locator._worker = worker;
	locator._browserData = browserData;
	locator.keyCache = new KeyCache();
	locator.cryptoWrapper = new CryptoWrapper();
	locator.user = new UserFacade(locator.keyCache, locator.cryptoWrapper);
	locator.workerFacade = new WorkerFacade();
	const dateProvider = new NoZoneDateProvider();
	const mainInterface = worker.getMainInterface();
	const suspensionHandler = new SuspensionHandler(mainInterface.infoMessageHandler, self);
	locator.instanceMapper = new InstanceMapper();
	locator.rsa = await createRsaImplementation(worker);
	const domainConfig = new DomainConfigProvider().getCurrentDomainConfig();
	locator.restClient = new RestClient(suspensionHandler, domainConfig);
	locator.serviceExecutor = new ServiceExecutor(locator.restClient, locator.user, locator.instanceMapper, () => locator.crypto);
	locator.entropyFacade = new EntropyFacade(locator.user, locator.serviceExecutor, random, () => locator.keyLoader);
	locator.blobAccessToken = new BlobAccessTokenFacade(locator.serviceExecutor, locator.user, dateProvider);
	const entityRestClient = new EntityRestClient(locator.user, locator.restClient, () => locator.crypto, locator.instanceMapper, locator.blobAccessToken);
	locator.native = worker;
	locator.booking = lazyMemoized(async () => {
		const { BookingFacade } = await import("./BookingFacade-chunk.js");
		return new BookingFacade(locator.serviceExecutor);
	});
	let offlineStorageProvider;
	if (isOfflineStorageAvailable() && !isAdminClient()) {
		locator.sqlCipherFacade = new SqlCipherFacadeSendDispatcher(locator.native);
		offlineStorageProvider = async () => {
			return new OfflineStorage(locator.sqlCipherFacade, new InterWindowEventFacadeSendDispatcher(worker), dateProvider, new OfflineStorageMigrator(OFFLINE_STORAGE_MIGRATIONS, modelInfos), new MailOfflineCleaner());
		};
	} else offlineStorageProvider = async () => null;
	locator.pdfWriter = async () => {
		const { PdfWriter } = await import("./PdfWriter-chunk.js");
		return new PdfWriter(new TextEncoder(), undefined);
	};
	const maybeUninitializedStorage = new LateInitializedCacheStorageImpl(async (error) => {
		await worker.sendError(error);
	}, offlineStorageProvider);
	locator.cacheStorage = maybeUninitializedStorage;
	const fileApp = new NativeFileApp(new FileFacadeSendDispatcher(worker), new ExportFacadeSendDispatcher(worker));
	let cache = null;
	if (!isAdminClient()) cache = new DefaultEntityRestCache(entityRestClient, maybeUninitializedStorage);
	locator.cache = cache ?? entityRestClient;
	locator.cachingEntityClient = new EntityClient(locator.cache);
	const nonCachingEntityClient = new EntityClient(entityRestClient);
	locator.cacheManagement = lazyMemoized(async () => {
		const { CacheManagementFacade } = await import("./CacheManagementFacade-chunk.js");
		return new CacheManagementFacade(locator.user, locator.cachingEntityClient, assertNotNull(cache));
	});
	/** Slightly annoying two-stage init: first import bulk loader, then we can have a factory for it. */
	const prepareBulkLoaderFactory = async () => {
		const { BulkMailLoader } = await import("./BulkMailLoader-chunk.js");
		return () => {
			if (isOfflineStorageAvailable()) return new BulkMailLoader(locator.cachingEntityClient, locator.cachingEntityClient, null);
else {
				const cacheStorage = new EphemeralCacheStorage();
				return new BulkMailLoader(new EntityClient(new DefaultEntityRestCache(entityRestClient, cacheStorage)), new EntityClient(entityRestClient), cacheStorage);
			}
		};
	};
	locator.bulkMailLoader = async () => {
		const factory = await prepareBulkLoaderFactory();
		return factory();
	};
	locator.indexer = lazyMemoized(async () => {
		const { Indexer } = await import("./Indexer-chunk.js");
		const { MailIndexer } = await import("./MailIndexer2-chunk.js");
		const mailFacade = await locator.mail();
		const bulkLoaderFactory = await prepareBulkLoaderFactory();
		return new Indexer(entityRestClient, mainInterface.infoMessageHandler, browserData, locator.cache, (core, db) => {
			const dateProvider$1 = new LocalTimeDateProvider();
			return new MailIndexer(core, db, mainInterface.infoMessageHandler, bulkLoaderFactory, locator.cachingEntityClient, dateProvider$1, mailFacade);
		});
	});
	if (isIOSApp() || isAndroidApp()) locator.kyberFacade = new NativeKyberFacade(new NativeCryptoFacadeSendDispatcher(worker));
else locator.kyberFacade = new WASMKyberFacade();
	locator.pqFacade = new PQFacade(locator.kyberFacade);
	locator.keyLoader = new KeyLoaderFacade(locator.keyCache, locator.user, locator.cachingEntityClient, locator.cacheManagement);
	locator.publicKeyProvider = new PublicKeyProvider(locator.serviceExecutor);
	locator.asymmetricCrypto = new AsymmetricCryptoFacade(locator.rsa, locator.pqFacade, locator.keyLoader, locator.cryptoWrapper, locator.serviceExecutor, locator.publicKeyProvider);
	locator.crypto = new CryptoFacade(locator.user, locator.cachingEntityClient, locator.restClient, locator.serviceExecutor, locator.instanceMapper, new OwnerEncSessionKeysUpdateQueue(locator.user, locator.serviceExecutor), cache, locator.keyLoader, locator.asymmetricCrypto, locator.publicKeyProvider, lazyMemoized(() => locator.keyRotation));
	locator.recoverCode = lazyMemoized(async () => {
		const { RecoverCodeFacade } = await import("./RecoverCodeFacade-chunk.js");
		return new RecoverCodeFacade(locator.user, locator.cachingEntityClient, locator.login, locator.keyLoader);
	});
	locator.share = lazyMemoized(async () => {
		const { ShareFacade } = await import("./ShareFacade-chunk.js");
		return new ShareFacade(locator.user, locator.crypto, locator.serviceExecutor, locator.cachingEntityClient, locator.keyLoader);
	});
	locator.counters = lazyMemoized(async () => {
		const { CounterFacade } = await import("./CounterFacade-chunk.js");
		return new CounterFacade(locator.serviceExecutor);
	});
	const keyAuthenticationFacade = new KeyAuthenticationFacade(locator.cryptoWrapper);
	locator.groupManagement = lazyMemoized(async () => {
		const { GroupManagementFacade } = await import("./GroupManagementFacade-chunk.js");
		return new GroupManagementFacade(locator.user, await locator.counters(), locator.cachingEntityClient, locator.serviceExecutor, locator.pqFacade, locator.keyLoader, await locator.cacheManagement(), locator.asymmetricCrypto, locator.cryptoWrapper, keyAuthenticationFacade);
	});
	locator.keyRotation = new KeyRotationFacade(locator.cachingEntityClient, locator.keyLoader, locator.pqFacade, locator.serviceExecutor, locator.cryptoWrapper, locator.recoverCode, locator.user, locator.crypto, locator.share, locator.groupManagement, locator.asymmetricCrypto, keyAuthenticationFacade, locator.publicKeyProvider);
	const loginListener = {
		onFullLoginSuccess(sessionType, cacheInfo, credentials) {
			if (!isTest() && sessionType !== SessionType.Temporary && !isAdminClient()) {
				console.log("initIndexer after log in");
				initIndexer(worker, cacheInfo, locator.keyLoader);
			}
			return mainInterface.loginListener.onFullLoginSuccess(sessionType, cacheInfo, credentials);
		},
		onLoginFailure(reason) {
			return mainInterface.loginListener.onLoginFailure(reason);
		},
		onSecondFactorChallenge(sessionId, challenges, mailAddress) {
			return mainInterface.loginListener.onSecondFactorChallenge(sessionId, challenges, mailAddress);
		}
	};
	let argon2idFacade;
	if (!isBrowser()) argon2idFacade = new NativeArgon2idFacade(new NativeCryptoFacadeSendDispatcher(worker));
else argon2idFacade = new WASMArgon2idFacade();
	locator.deviceEncryptionFacade = new DeviceEncryptionFacade();
	const { DatabaseKeyFactory } = await import("./DatabaseKeyFactory-chunk.js");
	locator.login = new LoginFacade(
		locator.restClient,
		/**
		* we don't want to try to use the cache in the login facade, because it may not be available (when no user is logged in)
		*/
		new EntityClient(locator.cache),
		loginListener,
		locator.instanceMapper,
		locator.crypto,
		locator.keyRotation,
		maybeUninitializedStorage,
		locator.serviceExecutor,
		locator.user,
		locator.blobAccessToken,
		locator.entropyFacade,
		new DatabaseKeyFactory(locator.deviceEncryptionFacade),
		argon2idFacade,
		nonCachingEntityClient,
		async (error) => {
			await worker.sendError(error);
		},
		locator.cacheManagement
);
	locator.search = lazyMemoized(async () => {
		const { SearchFacade } = await import("./SearchFacade-chunk.js");
		const indexer = await locator.indexer();
		const suggestionFacades = [indexer._contact.suggestionFacade];
		return new SearchFacade(locator.user, indexer.db, indexer._mail, suggestionFacades, browserData, locator.cachingEntityClient);
	});
	locator.userManagement = lazyMemoized(async () => {
		const { UserManagementFacade } = await import("./UserManagementFacade-chunk.js");
		return new UserManagementFacade(locator.user, await locator.groupManagement(), await locator.counters(), locator.cachingEntityClient, locator.serviceExecutor, mainInterface.operationProgressTracker, locator.login, locator.pqFacade, locator.keyLoader, await locator.recoverCode());
	});
	locator.customer = lazyMemoized(async () => {
		const { CustomerFacade } = await import("./CustomerFacade-chunk.js");
		return new CustomerFacade(locator.user, await locator.groupManagement(), await locator.userManagement(), await locator.counters(), locator.rsa, locator.cachingEntityClient, locator.serviceExecutor, await locator.booking(), locator.crypto, mainInterface.operationProgressTracker, locator.pdfWriter, locator.pqFacade, locator.keyLoader, await locator.recoverCode(), locator.asymmetricCrypto);
	});
	const aesApp = new AesApp(new NativeCryptoFacadeSendDispatcher(worker), random);
	locator.blob = lazyMemoized(async () => {
		const { BlobFacade } = await import("./BlobFacade-chunk.js");
		return new BlobFacade(locator.restClient, suspensionHandler, fileApp, aesApp, locator.instanceMapper, locator.crypto, locator.blobAccessToken);
	});
	locator.mail = lazyMemoized(async () => {
		const { MailFacade } = await import("./MailFacade-chunk.js");
		return new MailFacade(locator.user, locator.cachingEntityClient, locator.crypto, locator.serviceExecutor, await locator.blob(), fileApp, locator.login, locator.keyLoader, locator.publicKeyProvider);
	});
	const nativePushFacade = new NativePushFacadeSendDispatcher(worker);
	locator.calendar = lazyMemoized(async () => {
		const { CalendarFacade } = await import("./CalendarFacade2-chunk.js");
		return new CalendarFacade(locator.user, await locator.groupManagement(), assertNotNull(cache), nonCachingEntityClient, nativePushFacade, mainInterface.operationProgressTracker, locator.instanceMapper, locator.serviceExecutor, locator.crypto, mainInterface.infoMessageHandler);
	});
	locator.mailAddress = lazyMemoized(async () => {
		const { MailAddressFacade } = await import("./MailAddressFacade-chunk.js");
		return new MailAddressFacade(locator.user, await locator.groupManagement(), locator.serviceExecutor, nonCachingEntityClient);
	});
	const scheduler = new SchedulerImpl(dateProvider, self, self);
	locator.configFacade = lazyMemoized(async () => {
		const { ConfigurationDatabase } = await import("./ConfigurationDatabase2-chunk.js");
		return new ConfigurationDatabase(locator.keyLoader, locator.user);
	});
	const eventBusCoordinator = new EventBusEventCoordinator(mainInterface.wsConnectivityListener, locator.mail, locator.user, locator.cachingEntityClient, mainInterface.eventController, locator.configFacade, locator.keyRotation, locator.cacheManagement, async (error) => {
		await worker.sendError(error);
	}, async (queuedBatch) => {
		const indexer = await locator.indexer();
		indexer.addBatchesToQueue(queuedBatch);
		indexer.startProcessing();
	});
	locator.eventBusClient = new EventBusClient(eventBusCoordinator, cache ?? new AdminClientDummyEntityRestCache(), locator.user, locator.cachingEntityClient, locator.instanceMapper, (path) => new WebSocket(getWebsocketBaseUrl(domainConfig) + path), new SleepDetector(scheduler, dateProvider), mainInterface.progressTracker);
	locator.login.init(locator.eventBusClient);
	locator.Const = Const;
	locator.giftCards = lazyMemoized(async () => {
		const { GiftCardFacade } = await import("./GiftCardFacade-chunk.js");
		return new GiftCardFacade(locator.user, await locator.customer(), locator.serviceExecutor, locator.crypto, locator.keyLoader);
	});
	locator.contactFacade = lazyMemoized(async () => {
		const { ContactFacade } = await import("./ContactFacade-chunk.js");
		return new ContactFacade(new EntityClient(locator.cache));
	});
	locator.mailExportFacade = lazyMemoized(async () => {
		const { MailExportFacade } = await import("./MailExportFacade-chunk.js");
		const { MailExportTokenFacade } = await import("./MailExportTokenFacade-chunk.js");
		const mailExportTokenFacade = new MailExportTokenFacade(locator.serviceExecutor);
		return new MailExportFacade(mailExportTokenFacade, await locator.bulkMailLoader(), await locator.blob(), locator.crypto, locator.blobAccessToken);
	});
}
const RETRY_TIMOUT_AFTER_INIT_INDEXER_ERROR_MS = 3e4;
async function initIndexer(worker, cacheInfo, keyLoaderFacade) {
	const indexer = await locator.indexer();
	try {
		await indexer.init({
			user: assertNotNull(locator.user.getUser()),
			cacheInfo,
			keyLoaderFacade
		});
	} catch (e) {
		if (e instanceof ServiceUnavailableError) {
			console.log("Retry init indexer in 30 seconds after ServiceUnavailableError");
			await delay(RETRY_TIMOUT_AFTER_INIT_INDEXER_ERROR_MS);
			console.log("_initIndexer after ServiceUnavailableError");
			return initIndexer(worker, cacheInfo, keyLoaderFacade);
		} else if (e instanceof ConnectionError) {
			console.log("Retry init indexer in 30 seconds after ConnectionError");
			await delay(RETRY_TIMOUT_AFTER_INIT_INDEXER_ERROR_MS);
			console.log("_initIndexer after ConnectionError");
			return initIndexer(worker, cacheInfo, keyLoaderFacade);
		} else {
			worker.sendError(e);
			return;
		}
	}
	if (cacheInfo.isPersistent && cacheInfo.isNewOfflineDb) indexer.enableMailIndexing();
}
async function resetLocator() {
	await locator.login.resetSession();
	await initLocator(locator._worker, locator._browserData);
}
if (typeof self !== "undefined") self.locator = locator;

//#endregion
//#region src/mail-app/workerUtils/worker/WorkerImpl.ts
assertWorkerOrNode();
var WorkerImpl = class {
	_scope;
	_dispatcher;
	constructor(self$1) {
		this._scope = self$1;
		this._dispatcher = new MessageDispatcher(new WebWorkerTransport(this._scope), this.queueCommands(this.exposedInterface), "worker-main");
	}
	async init(browserData) {
		await initLocator(this, browserData);
		const workerScope = this._scope;
		if (workerScope && !isMainOrNode()) {
			workerScope.addEventListener("unhandledrejection", (event) => {
				this.sendError(event.reason);
			});
			workerScope.onerror = (e, source, lineno, colno, error) => {
				console.error("workerImpl.onerror", e, source, lineno, colno, error);
				if (error instanceof Error) this.sendError(error);
else {
					const err = new Error(e);
					err.lineNumber = lineno;
					err.columnNumber = colno;
					err.fileName = source;
					this.sendError(err);
				}
				return true;
			};
		}
	}
	get exposedInterface() {
		return {
			async loginFacade() {
				return locator.login;
			},
			async customerFacade() {
				return locator.customer();
			},
			async giftCardFacade() {
				return locator.giftCards();
			},
			async groupManagementFacade() {
				return locator.groupManagement();
			},
			async configFacade() {
				return locator.configFacade();
			},
			async calendarFacade() {
				return locator.calendar();
			},
			async mailFacade() {
				return locator.mail();
			},
			async shareFacade() {
				return locator.share();
			},
			async cacheManagementFacade() {
				return locator.cacheManagement();
			},
			async counterFacade() {
				return locator.counters();
			},
			async indexerFacade() {
				return locator.indexer();
			},
			async searchFacade() {
				return locator.search();
			},
			async bookingFacade() {
				return locator.booking();
			},
			async mailAddressFacade() {
				return locator.mailAddress();
			},
			async blobAccessTokenFacade() {
				return locator.blobAccessToken;
			},
			async blobFacade() {
				return locator.blob();
			},
			async userManagementFacade() {
				return locator.userManagement();
			},
			async recoverCodeFacade() {
				return locator.recoverCode();
			},
			async restInterface() {
				return locator.cache;
			},
			async serviceExecutor() {
				return locator.serviceExecutor;
			},
			async cryptoWrapper() {
				return locator.cryptoWrapper;
			},
			async publicKeyProvider() {
				return locator.publicKeyProvider;
			},
			async asymmetricCryptoFacade() {
				return locator.asymmetricCrypto;
			},
			async cryptoFacade() {
				return locator.crypto;
			},
			async cacheStorage() {
				return locator.cacheStorage;
			},
			async sqlCipherFacade() {
				return locator.sqlCipherFacade;
			},
			async random() {
				return { async generateRandomNumber(nbrOfBytes) {
					return random.generateRandomNumber(nbrOfBytes);
				} };
			},
			async eventBus() {
				return locator.eventBusClient;
			},
			async entropyFacade() {
				return locator.entropyFacade;
			},
			async workerFacade() {
				return locator.workerFacade;
			},
			async contactFacade() {
				return locator.contactFacade();
			},
			async bulkMailLoader() {
				return locator.bulkMailLoader();
			},
			async mailExportFacade() {
				return locator.mailExportFacade();
			}
		};
	}
	queueCommands(exposedWorker) {
		return {
			setup: async (message) => {
				console.error("WorkerImpl: setup was called after bootstrap! message: ", message);
			},
			testEcho: (message) => Promise.resolve({ msg: ">>> " + message.args[0].msg }),
			testError: (message) => {
				const errorTypes = {
					ProgrammingError,
					CryptoError,
					NotAuthenticatedError
				};
				let ErrorType = errorTypes[message.args[0].errorType];
				return Promise.reject(new ErrorType(`wtf: ${message.args[0].errorType}`));
			},
			reset: (message) => {
				return resetLocator();
			},
			restRequest: (message) => {
				const args = message.args;
				let [path, method, options] = args;
				options = options ?? {};
				options.headers = {
					...locator.user.createAuthHeaders(),
					...options.headers
				};
				return locator.restClient.request(path, method, options);
			},
			facade: exposeLocalDelayed(exposedWorker)
		};
	}
	invokeNative(requestType, args) {
		return this._dispatcher.postRequest(new Request("execNative", [requestType, args]));
	}
	getMainInterface() {
		return exposeRemote((request) => this._dispatcher.postRequest(request));
	}
	sendError(e) {
		return this._dispatcher.postRequest(new Request("error", [errorToObj(e)]));
	}
};

//#endregion
//#region src/mail-app/workerUtils/worker/mail-worker.ts
/**
* Receives the first message from the client and initializes the WorkerImpl to receive all future messages. Sends a response to the client on this first message.
*/
self.onmessage = function(msg) {
	const data = msg.data;
	if (data.requestType === "setup") {
		self.env = data.args[0];
		replaceNativeLogger(self, new Logger());
		Promise.resolve().then(async () => {
			const initialRandomizerEntropy = data.args[1];
			const browserData = data.args[2];
			if (initialRandomizerEntropy == null || browserData == null) throw new Error("Invalid Worker arguments");
			const workerImpl = new WorkerImpl(typeof self !== "undefined" ? self : null);
			await workerImpl.init(browserData);
			workerImpl.exposedInterface.entropyFacade().then((entropyFacade) => entropyFacade.addEntropy(initialRandomizerEntropy));
			self.postMessage({
				id: data.id,
				type: "response",
				value: {}
			});
		}).catch((e) => {
			self.postMessage({
				id: data.id,
				type: "error",
				error: JSON.stringify({
					name: "Error",
					message: e.message,
					stack: e.stack
				})
			});
		});
	} else throw new Error("worker not yet ready. Request type: " + data.requestType);
};

//#endregion
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2VyLmpzIiwibmFtZXMiOlsiaW5mb01lc3NhZ2VIYW5kbGVyOiBJbmZvTWVzc2FnZUhhbmRsZXIiLCJzeXN0ZW1UaW1lb3V0OiBTeXN0ZW1UaW1lb3V0Iiwic3VzcGVuc2lvbkR1cmF0aW9uU2Vjb25kczogbnVtYmVyIiwicmVzb3VyY2VVUkw6IFVSTCIsInJlcXVlc3Q6ICgpID0+IFByb21pc2U8YW55PiIsImRldmljZUtleTogVWludDhBcnJheSIsImRhdGE6IFVpbnQ4QXJyYXkiLCJlbmNyeXB0ZWREYXRhOiBVaW50OEFycmF5IiwibmF0aXZlQ3J5cHRvRmFjYWRlOiBOYXRpdmVDcnlwdG9GYWNhZGUiLCJyYW5kb206IFJhbmRvbWl6ZXIiLCJrZXk6IEFlc0tleSIsImZpbGVVcmw6IEZpbGVVcmkiLCJ0cmFuc3BvcnQ6IE5hdGl2ZUludGVyZmFjZSIsIm5hdGl2ZTogTmF0aXZlSW50ZXJmYWNlIiwicHVibGljS2V5OiBSc2FQdWJsaWNLZXkiLCJieXRlczogVWludDhBcnJheSIsInByaXZhdGVLZXk6IFJzYVByaXZhdGVLZXkiLCJ1c2VyRmFjYWRlOiBVc2VyRmFjYWRlIiwiZW50aXR5Q2xpZW50OiBFbnRpdHlDbGllbnQiLCJyZXN0Q2xpZW50OiBSZXN0Q2xpZW50Iiwic2VydmljZUV4ZWN1dG9yOiBJU2VydmljZUV4ZWN1dG9yIiwiaW5zdGFuY2VNYXBwZXI6IEluc3RhbmNlTWFwcGVyIiwib3duZXJFbmNTZXNzaW9uS2V5c1VwZGF0ZVF1ZXVlOiBPd25lckVuY1Nlc3Npb25LZXlzVXBkYXRlUXVldWUiLCJjYWNoZTogRGVmYXVsdEVudGl0eVJlc3RDYWNoZSB8IG51bGwiLCJrZXlMb2FkZXJGYWNhZGU6IEtleUxvYWRlckZhY2FkZSIsImFzeW1tZXRyaWNDcnlwdG9GYWNhZGU6IEFzeW1tZXRyaWNDcnlwdG9GYWNhZGUiLCJwdWJsaWNLZXlQcm92aWRlcjogUHVibGljS2V5UHJvdmlkZXIiLCJrZXlSb3RhdGlvbkZhY2FkZTogbGF6eTxLZXlSb3RhdGlvbkZhY2FkZT4iLCJkZWNyeXB0ZWRJbnN0YW5jZTogVCIsImluc3RhbmNlOiBTb21lRW50aXR5IiwiaW5zdGFuY2U6IFJlY29yZDxzdHJpbmcsIGFueT4iLCJvd25lcktleTogQWVzS2V5Iiwia2V5OiBVaW50OEFycmF5IHwgc3RyaW5nIiwib3duZXJFbmNTZXNzaW9uS2V5OiBWZXJzaW9uZWRFbmNyeXB0ZWRLZXkiLCJ0eXBlTW9kZWw6IFR5cGVNb2RlbCIsInR5cGVSZWY6IFR5cGVSZWY8VD4iLCJkYXRhOiBSZWNvcmQ8c3RyaW5nLCBhbnk+IiwiYnVja2V0S2V5SW5zdGFuY2VPckxpdGVyYWw6IFJlY29yZDxzdHJpbmcsIGFueT4iLCJidWNrZXRLZXk6IEJ1Y2tldEtleSIsImRlY3J5cHRlZEJ1Y2tldEtleTogQWVzS2V5IiwidW5lbmNyeXB0ZWRTZW5kZXJBdXRoU3RhdHVzOiBFbmNyeXB0aW9uQXV0aFN0YXR1cyB8IG51bGwiLCJwcU1lc3NhZ2VTZW5kZXJLZXk6IEVjY1B1YmxpY0tleSB8IG51bGwiLCJ2YWx1ZTogc3RyaW5nIiwia2V5R3JvdXA6IElkIiwiZ3JvdXBLZXlWZXJzaW9uOiBLZXlWZXJzaW9uIiwiZ3JvdXBFbmNCdWNrZXRLZXk6IFVpbnQ4QXJyYXkiLCJnOiBHcm91cE1lbWJlcnNoaXAiLCJ1bm1hcHBlZEluc3RhbmNlOiBVbm1hcHBlZE93bmVyR3JvdXBJbnN0YW5jZSIsImtleTogVmVyc2lvbmVkRW5jcnlwdGVkS2V5Iiwib3duZXJHcm91cD86IElkIiwiaW5zdGFuY2U6IEluc3RhbmNlIiwiZWxlbWVudE9yTGl0ZXJhbDogUmVjb3JkPHN0cmluZywgYW55PiIsImxpc3RQZXJtaXNzaW9uczogUGVybWlzc2lvbltdIiwic3ltbWV0cmljUGVybWlzc2lvbjogUGVybWlzc2lvbiB8IG51bGwiLCJkZWNCdWNrZXRLZXk6IG51bWJlcltdIiwiaW5zdGFuY2VFbGVtZW50SWQ6IHN0cmluZyIsImVuY3J5cHRpb25BdXRoU3RhdHVzOiBFbmNyeXB0aW9uQXV0aFN0YXR1cyB8IG51bGwiLCJyZXNvbHZlZFNlc3Npb25LZXlGb3JJbnN0YW5jZTogQWVzS2V5IHwgdW5kZWZpbmVkIiwicHFNZXNzYWdlU2VuZGVyS2V5OiBVaW50OEFycmF5IHwgbnVsbCIsInBxTWVzc2FnZVNlbmRlcktleVZlcnNpb246IEtleVZlcnNpb24gfCBudWxsIiwicmVzb2x2ZWRTZXNzaW9uS2V5Rm9ySW5zdGFuY2U6IG51bWJlcltdIiwiaW5zdGFuY2VTZXNzaW9uS2V5V2l0aE93bmVyRW5jU2Vzc2lvbktleTogSW5zdGFuY2VTZXNzaW9uS2V5IiwiZGVjcnlwdGVkU2Vzc2lvbktleTogbnVtYmVyW10iLCJrZXlHcm91cDogSWQgfCBudWxsIiwic2VuZGVyTWFpbEFkZHJlc3M6IHN0cmluZyIsInBxTWVzc2FnZVNlbmRlcktleTogVWludDhBcnJheSIsInBxTWVzc2FnZVNlbmRlcktleVZlcnNpb246IEtleVZlcnNpb24iLCJidWNrZXRQZXJtaXNzaW9uOiBCdWNrZXRQZXJtaXNzaW9uIiwicHViT3JFeHRQZXJtaXNzaW9uOiBQZXJtaXNzaW9uIiwibW9kZWw6IFR5cGVNb2RlbCIsImVudGl0eTogUmVjb3JkPHN0cmluZywgYW55PiIsImtleVRvRW5jcnlwdFNlc3Npb25LZXk/OiBWZXJzaW9uZWRLZXkiLCJzZW5kZXJVc2VyR3JvdXBJZDogSWQiLCJidWNrZXRLZXk6IEFlc0tleSIsInJlY2lwaWVudE1haWxBZGRyZXNzOiBzdHJpbmciLCJub3RGb3VuZFJlY2lwaWVudHM6IEFycmF5PHN0cmluZz4iLCJyZWNpcGllbnRQdWJsaWNLZXlzOiBWZXJzaW9uZWQ8UHVibGljS2V5cz4iLCJzZW5kZXJHcm91cElkOiBJZCIsInBlcm1pc3Npb246IFBlcm1pc3Npb24iLCJwZXJtaXNzaW9uT3duZXJHcm91cEtleTogVmVyc2lvbmVkS2V5Iiwic2Vzc2lvbktleTogQWVzS2V5IiwibWFpbkluc3RhbmNlOiBSZWNvcmQ8c3RyaW5nLCBhbnk+IiwiY2hpbGRJbnN0YW5jZXM6IHJlYWRvbmx5IEZpbGVbXSIsIm93bmVyR3JvdXBLZXk6IFZlcnNpb25lZEtleSIsImFsdDogUmVjb3JkPHN0cmluZywgYW55PiIsIm1vZGVsOiBUeXBlTW9kZWwiLCJpbnN0YW5jZTogUmVjb3JkPHN0cmluZywgYW55PiIsInNrOiBBZXNLZXkgfCBudWxsIiwiZGVjcnlwdGVkOiBhbnkiLCJpbnN0YW5jZTogVCIsImVuY3J5cHRlZDogUmVjb3JkPHN0cmluZywgdW5rbm93bj4iLCJ2YWx1ZU5hbWU6IHN0cmluZyIsInZhbHVlVHlwZTogTW9kZWxWYWx1ZSIsInZhbHVlOiBhbnkiLCJpdjogVWludDhBcnJheSIsInZhbHVlOiAoQmFzZTY0IHwgbnVsbCkgfCBzdHJpbmciLCJ0eXBlOiBWYWx1ZXM8dHlwZW9mIFZhbHVlVHlwZT4iLCJ2YWx1ZTogQmFzZTY0IHwgc3RyaW5nIiwidW5jb21wcmVzc2VkOiBzdHJpbmciLCJjb21wcmVzc2VkOiBVaW50OEFycmF5IiwidmFsdWU6IHVua25vd24iLCJiYXRjaDogUXVldWVkQmF0Y2giLCJpbnN0YW5jZTogVCIsIl90eXBlUmVmOiBUeXBlUmVmPFQ+IiwiX2lkOiBQcm9wZXJ0eVR5cGU8VCwgXCJfaWRcIj4iLCJfb3B0czogRW50aXR5UmVzdENsaWVudExvYWRPcHRpb25zIiwidHlwZVJlZjogVHlwZVJlZjxUPiIsImxpc3RJZDogSWQgfCBudWxsIiwiZWxlbWVudElkczogQXJyYXk8SWQ+IiwibGlzdElkOiBJZCIsInN0YXJ0OiBJZCIsImNvdW50OiBudW1iZXIiLCJyZXZlcnNlOiBib29sZWFuIiwiZXh0cmFIZWFkZXJzPzogRGljdCIsImluc3RhbmNlczogQXJyYXk8VD4iLCJncm91cElkOiBJZCIsImJhdGNoSWQ6IElkIiwic2NoZWR1bGVyOiBTY2hlZHVsZXIiLCJkYXRlUHJvdmlkZXI6IERhdGVQcm92aWRlciIsIm9uU2xlZXA6IFRodW5rIiwidHlwZVJlZjogVHlwZVJlZjxUPiIsImxpc3RJZDogSWQgfCBudWxsIiwiZWxlbWVudElkOiBJZCIsIlR5cGVJZCIsInR5cGVNb2RlbDogVHlwZU1vZGVsIiwiaWQ6IElkIiwiZW50aXR5OiBUIiwibGlzdElkOiBJZCIsIm9yaWdpbmFsRW50aXR5OiBTb21lRW50aXR5IiwidHlwZVJlZjogVHlwZVJlZjxCbG9iRWxlbWVudEVudGl0eT4iLCJlbnRpdHk6IEJsb2JFbGVtZW50RW50aXR5IiwidHlwZVJlZjogVHlwZVJlZjxMaXN0RWxlbWVudEVudGl0eT4iLCJlbnRpdHk6IExpc3RFbGVtZW50RW50aXR5IiwiYWxsUmFuZ2U6IEFycmF5PElkPiIsInN0YXJ0RWxlbWVudElkOiBJZCIsImNvdW50OiBudW1iZXIiLCJyZXZlcnNlOiBib29sZWFuIiwiaWRzOiBJZFtdIiwicmVzdWx0OiBUW10iLCJlbGVtZW50SWRzOiBJZFtdIiwidXBwZXJJZDogSWQiLCJsb3dlcklkOiBJZCIsImxvd2VyOiBJZCIsInVwcGVyOiBJZCIsImdyb3VwSWQ6IElkIiwiYmF0Y2hJZDogSWQiLCJ2YWx1ZTogbnVtYmVyIiwiZW50aXR5UmVzdENsaWVudDogRW50aXR5UmVzdENsaWVudCIsIm93bmVyOiBJZCIsImNhY2hlRm9yVHlwZTogTWFwPElkLCBMaXN0Q2FjaGUgfCBCbG9iRWxlbWVudENhY2hlPiIsIm93bmVyOiBzdHJpbmciLCJsaXN0SWRzVG9EZWxldGU6IHN0cmluZ1tdIiwibGlzdElkOiBzdHJpbmciLCJzZW5kRXJyb3I6IChlcnJvcjogRXJyb3IpID0+IFByb21pc2U8dm9pZD4iLCJvZmZsaW5lU3RvcmFnZVByb3ZpZGVyOiAoKSA9PiBQcm9taXNlPG51bGwgfCBPZmZsaW5lU3RvcmFnZT4iLCJhcmdzOiBPZmZsaW5lU3RvcmFnZUFyZ3MgfCBFcGhlbWVyYWxTdG9yYWdlQXJncyIsInN0b3JhZ2UiLCJ0eXBlUmVmOiBUeXBlUmVmPFQ+IiwibGlzdElkOiBJZCB8IG51bGwiLCJpZDogSWQiLCJsaXN0SWQ6IElkIiwiZ3JvdXBJZDogSWQiLCJzdGFydDogSWQiLCJjb3VudDogbnVtYmVyIiwicmV2ZXJzZTogYm9vbGVhbiIsImxpc3RJZDogc3RyaW5nIiwiZWxlbWVudElkczogc3RyaW5nW10iLCJvcmlnaW5hbEVudGl0eTogU29tZUVudGl0eSIsImJhdGNoSWQ6IElkIiwidmFsdWU6IG51bWJlciIsImxvd2VyOiBJZCIsInVwcGVyOiBJZCIsImVudGl0eVJlc3RDbGllbnQ6IEVudGl0eVJlc3RDbGllbnQiLCJvd25lcjogSWQiLCJyZXN0Q2xpZW50OiBSZXN0Q2xpZW50IiwiYXV0aERhdGFQcm92aWRlcjogQXV0aERhdGFQcm92aWRlciIsImluc3RhbmNlTWFwcGVyOiBJbnN0YW5jZU1hcHBlciIsImNyeXB0b0ZhY2FkZTogbGF6eTxDcnlwdG9GYWNhZGU+Iiwic2VydmljZTogUyIsImRhdGE6IFBhcmFtVHlwZUZyb21SZWY8U1tcImdldFwiXVtcImRhdGFcIl0+IiwicGFyYW1zPzogRXh0cmFTZXJ2aWNlUGFyYW1zIiwiZGF0YTogUGFyYW1UeXBlRnJvbVJlZjxTW1wicG9zdFwiXVtcImRhdGFcIl0+IiwiZGF0YTogUGFyYW1UeXBlRnJvbVJlZjxTW1wicHV0XCJdW1wiZGF0YVwiXT4iLCJkYXRhOiBQYXJhbVR5cGVGcm9tUmVmPFNbXCJkZWxldGVcIl1bXCJkYXRhXCJdPiIsInNlcnZpY2U6IEFueVNlcnZpY2UiLCJtZXRob2Q6IEh0dHBNZXRob2QiLCJyZXF1ZXN0RW50aXR5OiBFbnRpdHkgfCBudWxsIiwicGFyYW1zOiBFeHRyYVNlcnZpY2VQYXJhbXMgfCB1bmRlZmluZWQiLCJkYXRhOiBzdHJpbmcgfCB1bmRlZmluZWQiLCJtZXRob2REZWZpbml0aW9uOiBNZXRob2REZWZpbml0aW9uIiwicGFyYW1zOiBFeHRyYVNlcnZpY2VQYXJhbXMgfCBudWxsIiwidHlwZVJlZjogVHlwZVJlZjxUPiIsImRhdGE6IHN0cmluZyIsImtleUNhY2hlOiBLZXlDYWNoZSIsImNyeXB0b1dyYXBwZXI6IENyeXB0b1dyYXBwZXIiLCJhY2Nlc3NUb2tlbjogc3RyaW5nIHwgbnVsbCIsInVzZXI6IFVzZXIiLCJ1c2VyUGFzc3BocmFzZUtleTogQWVzS2V5IiwiY3VycmVudFVzZXJHcm91cEtleVZlcnNpb246IEtleVZlcnNpb24iLCJ1c2VyR3JvdXBJZDogSWQiLCJ1c2VyUGFzc3dvcmRLZXk6IEFlc0tleSIsIm5ld1VzZXJHcm91cEtleVZlcnNpb246IEtleVZlcnNpb24iLCJncm91cElkOiBJZCIsImc6IEdyb3VwTWVtYmVyc2hpcCIsImdyb3VwVHlwZTogR3JvdXBUeXBlIiwic3RhdHVzOiBXZWJzb2NrZXRMZWFkZXJTdGF0dXMiLCJ1c2VyR3JvdXBLZXlEaXN0cmlidXRpb246IFVzZXJHcm91cEtleURpc3RyaWJ1dGlvbiIsInR5cGVSZWY6IFR5cGVSZWY8VD4iLCJzdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSIsIm1pZ3JhdGlvbnM6IEFycmF5PE1pZ3JhdGlvbj4iLCJvbGROYW1lOiBzdHJpbmciLCJuZXdOYW1lOiBzdHJpbmciLCJ2YWx1ZU5hbWU6IHN0cmluZyIsInZhbHVlOiBhbnkiLCJhdHRyaWJ1dGU6IHN0cmluZyIsInR5cGU6IFR5cGVSZWY8VD4iLCJzeXM5NDogT2ZmbGluZU1pZ3JhdGlvbiIsInN0b3JhZ2U6IE9mZmxpbmVTdG9yYWdlIiwidHV0YW5vdGE2NjogT2ZmbGluZU1pZ3JhdGlvbiIsInN0b3JhZ2U6IE9mZmxpbmVTdG9yYWdlIiwic3lzOTI6IE9mZmxpbmVNaWdyYXRpb24iLCJzdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSIsImU6IE1haWwiLCJlbnRpdHk6IFQiLCJ0dXRhbm90YTY1OiBPZmZsaW5lTWlncmF0aW9uIiwic3RvcmFnZTogT2ZmbGluZVN0b3JhZ2UiLCJzeXM5MTogT2ZmbGluZU1pZ3JhdGlvbiIsInN0b3JhZ2U6IE9mZmxpbmVTdG9yYWdlIiwic3lzOTA6IE9mZmxpbmVNaWdyYXRpb24iLCJzdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSIsIm9sZEN1c3RvbWVySW5mbzogQ3VzdG9tZXJJbmZvIiwidXNlcjogVXNlciIsInR1dGFub3RhNjQ6IE9mZmxpbmVNaWdyYXRpb24iLCJzdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSIsInR1dGFub3RhNjc6IE9mZmxpbmVNaWdyYXRpb24iLCJzdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSIsInN5czk2OiBPZmZsaW5lTWlncmF0aW9uIiwic3RvcmFnZTogT2ZmbGluZVN0b3JhZ2UiLCJlbmNyeXB0ZWRFbGVtZW50VHlwZXM6IEFycmF5PFR5cGVSZWY8RWxlbWVudEVudGl0eT4+IiwiZW5jcnlwdGVkTGlzdEVsZW1lbnRUeXBlczogQXJyYXk8VHlwZVJlZjxMaXN0RWxlbWVudEVudGl0eT4+IiwidHV0YW5vdGE2OTogT2ZmbGluZU1pZ3JhdGlvbiIsInN0b3JhZ2U6IE9mZmxpbmVTdG9yYWdlIiwiZW5jcnlwdGVkRWxlbWVudFR5cGVzOiBBcnJheTxUeXBlUmVmPEVsZW1lbnRFbnRpdHk+PiIsImVuY3J5cHRlZExpc3RFbGVtZW50VHlwZXM6IEFycmF5PFR5cGVSZWY8TGlzdEVsZW1lbnRFbnRpdHk+PiIsInN5czk3OiBPZmZsaW5lTWlncmF0aW9uIiwic3RvcmFnZTogT2ZmbGluZVN0b3JhZ2UiLCJ0dXRhbm90YTcxOiBPZmZsaW5lTWlncmF0aW9uIiwic3RvcmFnZTogT2ZmbGluZVN0b3JhZ2UiLCJzeXM5OTogT2ZmbGluZU1pZ3JhdGlvbiIsInN0b3JhZ2U6IE9mZmxpbmVTdG9yYWdlIiwic3lzMTAxOiBPZmZsaW5lTWlncmF0aW9uIiwic3RvcmFnZTogT2ZmbGluZVN0b3JhZ2UiLCJzcWxDaXBoZXJGYWNhZGU6IFNxbENpcGhlckZhY2FkZSIsInN5czEwMjogT2ZmbGluZU1pZ3JhdGlvbiIsInN0b3JhZ2U6IE9mZmxpbmVTdG9yYWdlIiwic3FsQ2lwaGVyRmFjYWRlOiBTcWxDaXBoZXJGYWNhZGUiLCJ0dXRhbm90YTcyOiBPZmZsaW5lTWlncmF0aW9uIiwic3RvcmFnZTogT2ZmbGluZVN0b3JhZ2UiLCJzeXMxMDM6IE9mZmxpbmVNaWdyYXRpb24iLCJzdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSIsInNxbENpcGhlckZhY2FkZTogU3FsQ2lwaGVyRmFjYWRlIiwidHV0YW5vdGE3MzogT2ZmbGluZU1pZ3JhdGlvbiIsInN0b3JhZ2U6IE9mZmxpbmVTdG9yYWdlIiwic3lzMTA0OiBPZmZsaW5lTWlncmF0aW9uIiwic3RvcmFnZTogT2ZmbGluZVN0b3JhZ2UiLCJfOiBTcWxDaXBoZXJGYWNhZGUiLCJzeXMxMDU6IE9mZmxpbmVNaWdyYXRpb24iLCJzdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSIsIl86IFNxbENpcGhlckZhY2FkZSIsInN5czEwNjogT2ZmbGluZU1pZ3JhdGlvbiIsInN0b3JhZ2U6IE9mZmxpbmVTdG9yYWdlIiwidHV0YW5vdGE3NDogT2ZmbGluZU1pZ3JhdGlvbiIsInN0b3JhZ2U6IE9mZmxpbmVTdG9yYWdlIiwic3lzMTA3OiBPZmZsaW5lTWlncmF0aW9uIiwic3RvcmFnZTogT2ZmbGluZVN0b3JhZ2UiLCJ0dXRhbm90YTc1OiBPZmZsaW5lTWlncmF0aW9uIiwic3RvcmFnZTogT2ZmbGluZVN0b3JhZ2UiLCJzeXMxMTE6IE9mZmxpbmVNaWdyYXRpb24iLCJzdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSIsInR1dGFub3RhNzY6IE9mZmxpbmVNaWdyYXRpb24iLCJzdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSIsInN5czExMjogT2ZmbGluZU1pZ3JhdGlvbiIsInN0b3JhZ2U6IE9mZmxpbmVTdG9yYWdlIiwidHV0YW5vdGE3NzogT2ZmbGluZU1pZ3JhdGlvbiIsInN0b3JhZ2U6IE9mZmxpbmVTdG9yYWdlIiwic3lzMTE0OiBPZmZsaW5lTWlncmF0aW9uIiwic3RvcmFnZTogT2ZmbGluZVN0b3JhZ2UiLCJlbnRpdHk6IGFueSIsIm9mZmxpbmUyOiBPZmZsaW5lTWlncmF0aW9uIiwic3RvcmFnZTogT2ZmbGluZVN0b3JhZ2UiLCJfOiBTcWxDaXBoZXJGYWNhZGUiLCJzeXMxMTU6IE9mZmxpbmVNaWdyYXRpb24iLCJzdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSIsInR1dGFub3RhNzg6IE9mZmxpbmVNaWdyYXRpb24iLCJzdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSIsInN5czExNjogT2ZmbGluZU1pZ3JhdGlvbiIsInN0b3JhZ2U6IE9mZmxpbmVTdG9yYWdlIiwidHV0YW5vdGE3OTogT2ZmbGluZU1pZ3JhdGlvbiIsInN0b3JhZ2U6IE9mZmxpbmVTdG9yYWdlIiwib2ZmbGluZTM6IE9mZmxpbmVNaWdyYXRpb24iLCJzdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSIsIl86IFNxbENpcGhlckZhY2FkZSIsInN5czExODogT2ZmbGluZU1pZ3JhdGlvbiIsInN0b3JhZ2U6IE9mZmxpbmVTdG9yYWdlIiwiY2FsZW5kYXJFdmVudDogQ2FsZW5kYXJFdmVudCIsInR1dGFub3RhODA6IE9mZmxpbmVNaWdyYXRpb24iLCJzdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSIsImNhbGVuZGFyRXZlbnQ6IENhbGVuZGFyRXZlbnQiLCJzdG9yYWdlMTE6IE9mZmxpbmVNaWdyYXRpb24iLCJzdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSIsInN5czExOTogT2ZmbGluZU1pZ3JhdGlvbiIsInN0b3JhZ2U6IE9mZmxpbmVTdG9yYWdlIiwic3lzMTIwOiBPZmZsaW5lTWlncmF0aW9uIiwic3RvcmFnZTogT2ZmbGluZVN0b3JhZ2UiLCJ0dXRhbm90YTgzOiBPZmZsaW5lTWlncmF0aW9uIiwic3RvcmFnZTogT2ZmbGluZVN0b3JhZ2UiLCJzeXMxMjE6IE9mZmxpbmVNaWdyYXRpb24iLCJzdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSIsIk9GRkxJTkVfU1RPUkFHRV9NSUdSQVRJT05TOiBSZWFkb25seUFycmF5PE9mZmxpbmVNaWdyYXRpb24+IiwibWlncmF0aW9uczogUmVhZG9ubHlBcnJheTxPZmZsaW5lTWlncmF0aW9uPiIsIm1vZGVsSW5mb3M6IE1vZGVsSW5mb3MiLCJzdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSIsInNxbENpcGhlckZhY2FkZTogU3FsQ2lwaGVyRmFjYWRlIiwibWV0YTogUGFydGlhbDxPZmZsaW5lRGJNZXRhPiIsIm1ldGE6IFJlYWRvbmx5PFBhcnRpYWw8T2ZmbGluZURiTWV0YT4+IiwiYXBwOiBWZXJzaW9uTWV0YWRhdGFCYXNlS2V5IiwidmVyc2lvbjogbnVtYmVyIiwidHJhbnNwb3J0OiBOYXRpdmVJbnRlcmZhY2UiLCJ1c2VyRmFjYWRlOiBVc2VyRmFjYWRlIiwic2VydmljZUV4ZWN1dG9yOiBJU2VydmljZUV4ZWN1dG9yIiwicmFuZG9tOiBSYW5kb21pemVyIiwibGF6eUtleUxvYWRlckZhY2FkZTogbGF6eTxLZXlMb2FkZXJGYWNhZGU+IiwiZW50cm9weTogRW50cm9weURhdGFDaHVua1tdIiwidHV0YW5vdGFQcm9wZXJ0aWVzOiBUdXRhbm90YVByb3BlcnRpZXMiLCJzZXJ2aWNlRXhlY3V0b3I6IElTZXJ2aWNlRXhlY3V0b3IiLCJhdXRoRGF0YVByb3ZpZGVyOiBBdXRoRGF0YVByb3ZpZGVyIiwiZGF0ZVByb3ZpZGVyOiBEYXRlUHJvdmlkZXIiLCJhcmNoaXZlRGF0YVR5cGU6IEFyY2hpdmVEYXRhVHlwZSIsIm93bmVyR3JvdXBJZDogSWQiLCJvd25lckdyb3VwSWQ6IHN0cmluZyIsInJlZmVyZW5jaW5nSW5zdGFuY2VzOiByZWFkb25seSBCbG9iUmVmZXJlbmNpbmdJbnN0YW5jZVtdIiwiYmxvYkxvYWRPcHRpb25zOiBCbG9iTG9hZE9wdGlvbnMiLCJyZWZlcmVuY2luZ0luc3RhbmNlOiBCbG9iUmVmZXJlbmNpbmdJbnN0YW5jZSIsInJlZmVyZW5jaW5nSW5zdGFuY2VzOiBCbG9iUmVmZXJlbmNpbmdJbnN0YW5jZVtdIiwiYXJjaGl2ZUlkOiBJZCIsImJsb2JTZXJ2ZXJBY2Nlc3NJbmZvOiBCbG9iU2VydmVyQWNjZXNzSW5mbyIsImFkZGl0aW9uYWxSZXF1ZXN0UGFyYW1zOiBEaWN0IiwidHlwZVJlZjogVHlwZVJlZjxhbnk+IiwiYXJjaGl2ZU9yR3JvdXBLZXk6IElkIHwgbnVsbCIsImluc3RhbmNlSWRzOiByZWFkb25seSBJZFtdIiwibG9hZGVyOiAoKSA9PiBQcm9taXNlPEJsb2JTZXJ2ZXJBY2Nlc3NJbmZvPiIsImlkOiBJZCIsImlkczogSWRbXSIsInVzZXJGYWNhZGU6IFVzZXJGYWNhZGUiLCJzZXJ2aWNlRXhlY3V0b3I6IElTZXJ2aWNlRXhlY3V0b3IiLCJkZWJvdW5jZVRpbWVvdXRNczogbnVtYmVyIiwiaW5zdGFuY2VTZXNzaW9uS2V5czogQXJyYXk8SW5zdGFuY2VTZXNzaW9uS2V5PiIsInR5cGVNb2RlbDogVHlwZU1vZGVsIiwiY29ubmVjdGl2aXR5TGlzdGVuZXI6IFdlYnNvY2tldENvbm5lY3Rpdml0eUxpc3RlbmVyIiwibWFpbEZhY2FkZTogbGF6eUFzeW5jPE1haWxGYWNhZGU+IiwidXNlckZhY2FkZTogVXNlckZhY2FkZSIsImVudGl0eUNsaWVudDogRW50aXR5Q2xpZW50IiwiZXZlbnRDb250cm9sbGVyOiBFeHBvc2VkRXZlbnRDb250cm9sbGVyIiwiY29uZmlndXJhdGlvbkRhdGFiYXNlOiBsYXp5QXN5bmM8Q29uZmlndXJhdGlvbkRhdGFiYXNlPiIsImtleVJvdGF0aW9uRmFjYWRlOiBLZXlSb3RhdGlvbkZhY2FkZSIsImNhY2hlTWFuYWdlbWVudEZhY2FkZTogbGF6eUFzeW5jPENhY2hlTWFuYWdlbWVudEZhY2FkZT4iLCJzZW5kRXJyb3I6IChlcnJvcjogRXJyb3IpID0+IFByb21pc2U8dm9pZD4iLCJhcHBTcGVjaWZpY0JhdGNoSGFuZGxpbmc6IChxdWV1ZWRCYXRjaDogUXVldWVkQmF0Y2hbXSkgPT4gdm9pZCIsInN0YXRlOiBXc0Nvbm5lY3Rpb25TdGF0ZSIsImV2ZW50czogRW50aXR5VXBkYXRlW10iLCJiYXRjaElkOiBJZCIsImdyb3VwSWQ6IElkIiwibWFya2VyczogUmVwb3J0ZWRNYWlsRmllbGRNYXJrZXJbXSIsInR1dGFub3RhRXJyb3I6IEVycm9yIiwibGVhZGVyU3RhdHVzOiBXZWJzb2NrZXRMZWFkZXJTdGF0dXMiLCJjb3VudGVyOiBXZWJzb2NrZXRDb3VudGVyRGF0YSIsImRhdGE6IEVudGl0eVVwZGF0ZVtdIiwiZ3JvdXBLZXlVcGRhdGVzOiBJZFR1cGxlW10iLCJodG1sOiBzdHJpbmciLCJwYXNzcGhyYXNlOiBzdHJpbmciLCJzYWx0OiBVaW50OEFycmF5IiwibmF0aXZlQ3J5cHRvRmFjYWRlOiBOYXRpdmVDcnlwdG9GYWNhZGUiLCJ0ZXN0V0FTTT86IExpYk9RU0V4cG9ydHMiLCJwdWJsaWNLZXk6IEt5YmVyUHVibGljS2V5IiwicHJpdmF0ZUtleTogS3liZXJQcml2YXRlS2V5IiwiY2lwaGVydGV4dDogVWludDhBcnJheSIsIm5hdGl2ZUNyeXB0b0ZhY2FkZTogTmF0aXZlQ3J5cHRvRmFjYWRlIiwiZW5jb2RlZDogVWludDhBcnJheSIsImt5YmVyRmFjYWRlOiBLeWJlckZhY2FkZSIsInNlbmRlcklkZW50aXR5S2V5UGFpcjogRWNjS2V5UGFpciIsImVwaGVtZXJhbEtleVBhaXI6IEVjY0tleVBhaXIiLCJyZWNpcGllbnRQdWJsaWNLZXlzOiBQUVB1YmxpY0tleXMiLCJidWNrZXRLZXk6IFVpbnQ4QXJyYXkiLCJlbmNvZGVkUFFNZXNzYWdlOiBVaW50OEFycmF5IiwicmVjaXBpZW50S2V5czogUFFLZXlQYWlycyIsIm1lc3NhZ2U6IFBRTWVzc2FnZSIsInNlbmRlcklkZW50aXR5UHVibGljS2V5OiBFY2NQdWJsaWNLZXkiLCJlcGhlbWVyYWxQdWJsaWNLZXk6IEVjY1B1YmxpY0tleSIsImt5YmVyQ2lwaGVyVGV4dDogVWludDhBcnJheSIsImt5YmVyU2hhcmVkU2VjcmV0OiBVaW50OEFycmF5IiwiZWNjU2hhcmVkU2VjcmV0OiBFY2NTaGFyZWRTZWNyZXRzIiwiY3J5cHRvUHJvdG9jb2xWZXJzaW9uOiBDcnlwdG9Qcm90b2NvbFZlcnNpb24iLCJlbnRpdHlDbGllbnQ6IEVudGl0eUNsaWVudCIsImtleUxvYWRlckZhY2FkZTogS2V5TG9hZGVyRmFjYWRlIiwicHFGYWNhZGU6IFBRRmFjYWRlIiwic2VydmljZUV4ZWN1dG9yOiBJU2VydmljZUV4ZWN1dG9yIiwiY3J5cHRvV3JhcHBlcjogQ3J5cHRvV3JhcHBlciIsInJlY292ZXJDb2RlRmFjYWRlOiBsYXp5QXN5bmM8UmVjb3ZlckNvZGVGYWNhZGU+IiwidXNlckZhY2FkZTogVXNlckZhY2FkZSIsImNyeXB0b0ZhY2FkZTogQ3J5cHRvRmFjYWRlIiwic2hhcmVGYWNhZGU6IGxhenlBc3luYzxTaGFyZUZhY2FkZT4iLCJncm91cE1hbmFnZW1lbnRGYWNhZGU6IGxhenlBc3luYzxHcm91cE1hbmFnZW1lbnRGYWNhZGU+IiwiYXN5bW1ldHJpY0NyeXB0b0ZhY2FkZTogQXN5bW1ldHJpY0NyeXB0b0ZhY2FkZSIsImtleUF1dGhlbnRpY2F0aW9uRmFjYWRlOiBLZXlBdXRoZW50aWNhdGlvbkZhY2FkZSIsInB1YmxpY0tleVByb3ZpZGVyOiBQdWJsaWNLZXlQcm92aWRlciIsInB3S2V5OiBBZXMyNTZLZXkiLCJtb2Rlcm5LZGZUeXBlOiBib29sZWFuIiwidXNlcjogVXNlciIsImFkbWluT3JVc2VyR3JvdXBLZXlSb3RhdGlvbkFycmF5OiBBcnJheTxLZXlSb3RhdGlvbj4iLCJpbnZpdGF0aW9uRGF0YTogR3JvdXBJbnZpdGF0aW9uUG9zdERhdGFbXSIsInBhc3NwaHJhc2VLZXk6IEFlczI1NktleSIsImtleVJvdGF0aW9uOiBLZXlSb3RhdGlvbiIsInByZXBhcmVkUmVJbnZpdGVzOiBHcm91cEludml0YXRpb25Qb3N0RGF0YVtdIiwiY3VycmVudFVzZXJHcm91cEtleTogVmVyc2lvbmVkS2V5IiwiY3VycmVudEFkbWluR3JvdXBLZXk6IFZlcnNpb25lZEtleSIsIm5ld0FkbWluUHViS2V5OiBQUVB1YmxpY0tleXMiLCJuZXdBZG1pbkdyb3VwS2V5VmVyc2lvbjogS2V5VmVyc2lvbiIsImFkbWluR3JvdXBJZDogSWQiLCJjdXN0b21lcklkOiBJZCIsImdyb3VwVG9FeGNsdWRlOiBJZCIsImtleVRhZ3M6IEtleU1hY1tdIiwidXNlckdyb3VwSWQ6IElkIiwiY3VycmVudEFkbWluR3JvdXBLZXlWZXJzaW9uOiBLZXlWZXJzaW9uIiwiY3VycmVudFVzZXJHcm91cEtleVZlcnNpb246IG51bWJlciIsInVzZXJFbmNOZXdHcm91cEtleTogVmVyc2lvbmVkRW5jcnlwdGVkS2V5IiwidGFyZ2V0R3JvdXA6IEdyb3VwIiwidXNlckdyb3VwOiBHcm91cCIsIm5ld1VzZXJHcm91cEtleXM6IEdlbmVyYXRlZEdyb3VwS2V5cyIsIm5ld0FkbWluR3JvdXBLZXlzOiBHZW5lcmF0ZWRHcm91cEtleXMiLCJwYXNzcGhyYXNlS2V5OiBBZXNLZXkiLCJyZWNvdmVyQ29kZURhdGE6IFJlY292ZXJDb2RlRGF0YSB8IG51bGwiLCJjdXJyZW50R3JvdXBLZXk6IFZlcnNpb25lZEtleSIsInZlcnNpb25lZFBhc3NwaHJhc2VLZXk6IFZlcnNpb25lZEtleSIsIm5ld1RhcmdldEdyb3VwS2V5OiBWZXJzaW9uZWRLZXkiLCJwcmVwYXJlZFJlSW52aXRhdGlvbnM6IEFycmF5PEdyb3VwSW52aXRhdGlvblBvc3REYXRhPiIsIm1haWxBZGRyZXNzZXM6IHN0cmluZ1tdIiwiZ3JvdXA6IEdyb3VwIiwibmV3R3JvdXBLZXk6IFZlcnNpb25lZEtleSIsImdyb3VwSWQ6IElkIiwib3RoZXJNZW1iZXJzOiBHcm91cE1lbWJlcltdIiwibm90Rm91bmRSZWNpcGllbnRzOiBBcnJheTxzdHJpbmc+IiwibmV3S2V5czogR2VuZXJhdGVkR3JvdXBLZXlzIiwiYWRtaW5Hcm91cEtleXM6IFZlcnNpb25lZEtleSIsInVzZXJJZDogSWQiLCJncm91cFRvUm90YXRlOiBHcm91cCIsIm5ld1N5bW1ldHJpY0dyb3VwS2V5OiBBZXMyNTZLZXkiLCJzeW1tbWV0cmljRW5jcnlwdGlvbktleTogQWVzMjU2S2V5IiwicGVuZGluZ0tleVJvdGF0aW9uczogUGVuZGluZ0tleVJvdGF0aW9uIiwiZ3JvdXBLZXlVcGRhdGVJZHM6IElkVHVwbGVbXSIsImdyb3VwS2V5VXBkYXRlOiBHcm91cEtleVVwZGF0ZSIsInB3S2V5OiBBZXNLZXkiLCJ1c2VyR3JvdXBLZXlSb3RhdGlvbjogS2V5Um90YXRpb24iLCJwdWJBZG1pbkdyb3VwRW5jVXNlckdyb3VwS2V5OiBudWxsIHwgUHViRW5jS2V5RGF0YSIsImFkbWluR3JvdXBFbmNVc2VyR3JvdXBLZXk6IG51bGwgfCBVaW50OEFycmF5IiwidXNlckdyb3VwRW5jQWRtaW5Hcm91cEtleTogbnVsbCB8IFVpbnQ4QXJyYXkiLCJhZG1pbkdyb3VwS2V5VmVyc2lvbjogTnVtYmVyU3RyaW5nIiwiYWRtaW5QdWJLZXlzOiBWZXJzaW9uZWQ8UHVibGljS2V5cz4iLCJwcUtleVBhaXI6IFBRS2V5UGFpcnMiLCJtdWx0aUFkbWluS2V5Um90YXRpb246IEtleVJvdGF0aW9uIiwicGFzc3BocmFzZUtleTogbnVtYmVyW10iLCJkaXN0cmlidXRpb25LZXlzOiBQdWJEaXN0cmlidXRpb25LZXlbXSIsImdlbmVyYXRlZEVjY0tleVBhaXI6IFZlcnNpb25lZDxFY2NLZXlQYWlyPiIsInJlY2lwaWVudFB1YmxpY0Rpc3RLZXlzOiBWZXJzaW9uZWQ8UHVibGljS2V5cz4iLCJ0aGlzQWRtaW5EaXN0cmlidXRpb25FbGVtZW50OiBBZG1pbkdyb3VwS2V5RGlzdHJpYnV0aW9uRWxlbWVudCIsInVzZXJHcm91cElkc01pc3NpbmdEaXN0cmlidXRpb25LZXlzOiBJZFtdIiwiYWRtaW5Vc2VyOiBVc2VyIiwia2V5OiBBZXNLZXkiLCJrZXlQYWlyOiBFbmNyeXB0ZWRQcUtleVBhaXJzIHwgbnVsbCIsIm5ld1VzZXJHcm91cEtleTogVmVyc2lvbmVkS2V5IiwidXNlckRpc3RLZXk6IEFlczI1NktleSIsImxlZ2FjeVVzZXJEaXN0S2V5OiBBZXMyNTZLZXkiLCJncm91cElkOiBJZCIsImtleUxvYWRlcjogKCkgPT4gUHJvbWlzZTxWZXJzaW9uZWRLZXk+IiwidXNlcjogVXNlciIsIm9mZmxpbmVTdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSIsInRpbWVSYW5nZURheXM6IG51bWJlciB8IG51bGwiLCJ1c2VySWQ6IElkIiwibm93OiBudW1iZXIiLCJsaXN0SWQ6IElkIiwiY3V0b2ZmSWQ6IElkIiwibWFpbHNUb0RlbGV0ZTogSWRUdXBsZVtdIiwiYXR0YWNobWVudHNUb0RlbGV0ZTogSWRUdXBsZVtdIiwibWFpbERldGFpbHNCbG9iVG9EZWxldGU6IElkVHVwbGVbXSIsIm1haWxEZXRhaWxzRHJhZnRUb0RlbGV0ZTogSWRUdXBsZVtdIiwibGlzdElkIiwiZW50cmllc0xpc3RJZDogSWQiLCJtYWlsU2V0RW50cmllc1RvRGVsZXRlOiBJZFR1cGxlW10iLCJyc2E6IFJzYUltcGxlbWVudGF0aW9uIiwicHFGYWNhZGU6IFBRRmFjYWRlIiwia2V5TG9hZGVyRmFjYWRlOiBLZXlMb2FkZXJGYWNhZGUiLCJjcnlwdG9XcmFwcGVyOiBDcnlwdG9XcmFwcGVyIiwic2VydmljZUV4ZWN1dG9yOiBJU2VydmljZUV4ZWN1dG9yIiwicHVibGljS2V5UHJvdmlkZXI6IFB1YmxpY0tleVByb3ZpZGVyIiwiaWRlbnRpZmllcjogUHVibGljS2V5SWRlbnRpZmllciIsInNlbmRlcklkZW50aXR5UHViS2V5OiBVaW50OEFycmF5Iiwic2VuZGVyS2V5VmVyc2lvbjogS2V5VmVyc2lvbiIsInJlY2lwaWVudEtleVBhaXI6IEFzeW1tZXRyaWNLZXlQYWlyIiwicHViRW5jS2V5RGF0YTogUHViRW5jS2V5RGF0YSIsInNlbmRlcklkZW50aWZpZXI6IFB1YmxpY0tleUlkZW50aWZpZXIiLCJjcnlwdG9Qcm90b2NvbFZlcnNpb246IENyeXB0b1Byb3RvY29sVmVyc2lvbiIsInB1YkVuY1N5bUtleTogVWludDhBcnJheSIsInByaXZhdGVLZXk6IFJzYVByaXZhdGVLZXkiLCJyZWNpcGllbnRLZXlQYWlyR3JvdXBJZDogSWQiLCJyZWNpcGllbnRLZXlWZXJzaW9uOiBLZXlWZXJzaW9uIiwia2V5UGFpcjogQXN5bW1ldHJpY0tleVBhaXIiLCJzeW1LZXk6IEFlc0tleSIsInJlY2lwaWVudFB1YmxpY0tleXM6IFZlcnNpb25lZDxQdWJsaWNLZXlzPiIsInNlbmRlckdyb3VwSWQ6IElkIiwic2VuZGVyRWNjS2V5UGFpcjogVmVyc2lvbmVkPEVjY0tleVBhaXI+IiwicmVjaXBpZW50UHVibGljS2V5OiBWZXJzaW9uZWQ8UFFQdWJsaWNLZXlzPiIsInB1YmxpY0tleXM6IFB1YmxpY0tleXMiLCJzZW5kZXJLZXlQYWlyOiBBc3ltbWV0cmljS2V5UGFpciIsImtleUdyb3VwSWQ6IElkIiwic2VydmljZUV4ZWN1dG9yOiBJU2VydmljZUV4ZWN1dG9yIiwicHViS2V5SWRlbnRpZmllcjogUHVibGljS2V5SWRlbnRpZmllciIsInZlcnNpb246IEtleVZlcnNpb24iLCJ2ZXJzaW9uOiBLZXlWZXJzaW9uIHwgbnVsbCIsInB1YktleXM6IFZlcnNpb25lZDxQdWJsaWNLZXlzPiIsInB1YmxpY0tleUdldE91dDogUHVibGljS2V5R2V0T3V0Iiwic2hpZnRCeURheXM6IG51bWJlciIsImxvY2F0b3I6IFdvcmtlckxvY2F0b3JUeXBlIiwid29ya2VyOiBXb3JrZXJJbXBsIiwiYnJvd3NlckRhdGE6IEJyb3dzZXJEYXRhIiwiZXJyb3I6IEVycm9yIiwiY2FjaGU6IERlZmF1bHRFbnRpdHlSZXN0Q2FjaGUgfCBudWxsIiwiZGF0ZVByb3ZpZGVyIiwibG9naW5MaXN0ZW5lcjogTG9naW5MaXN0ZW5lciIsInNlc3Npb25UeXBlOiBTZXNzaW9uVHlwZSIsImNhY2hlSW5mbzogQ2FjaGVJbmZvIiwiY3JlZGVudGlhbHM6IENyZWRlbnRpYWxzIiwicmVhc29uOiBMb2dpbkZhaWxSZWFzb24iLCJzZXNzaW9uSWQ6IElkVHVwbGUiLCJjaGFsbGVuZ2VzOiBSZWFkb25seUFycmF5PENoYWxsZW5nZT4iLCJtYWlsQWRkcmVzczogc3RyaW5nIHwgbnVsbCIsImFyZ29uMmlkRmFjYWRlOiBBcmdvbjJpZEZhY2FkZSIsInF1ZXVlZEJhdGNoOiBRdWV1ZWRCYXRjaFtdIiwia2V5TG9hZGVyRmFjYWRlOiBLZXlMb2FkZXJGYWNhZGUiLCJzZWxmOiBEZWRpY2F0ZWRXb3JrZXJHbG9iYWxTY29wZSIsInNlbGYiLCJicm93c2VyRGF0YTogQnJvd3NlckRhdGEiLCJldmVudDogUHJvbWlzZVJlamVjdGlvbkV2ZW50IiwiZTogc3RyaW5nIHwgRXZlbnQiLCJuYnJPZkJ5dGVzOiBudW1iZXIiLCJleHBvc2VkV29ya2VyOiBEZWxheWVkSW1wbHM8V29ya2VySW50ZXJmYWNlPiIsIm1lc3NhZ2U6IFdvcmtlclJlcXVlc3QiLCJyZXF1ZXN0VHlwZTogc3RyaW5nIiwiYXJnczogUmVhZG9ubHlBcnJheTx1bmtub3duPiIsImU6IEVycm9yIl0sInNvdXJjZXMiOlsiLi4vc3JjL2NvbW1vbi9hcGkvd29ya2VyL1N1c3BlbnNpb25IYW5kbGVyLnRzIiwiLi4vc3JjL2NvbW1vbi9hcGkvd29ya2VyL2ZhY2FkZXMvRGV2aWNlRW5jcnlwdGlvbkZhY2FkZS50cyIsIi4uL3NyYy9jb21tb24vbmF0aXZlL3dvcmtlci9BZXNBcHAudHMiLCIuLi9zcmMvY29tbW9uL25hdGl2ZS9jb21tb24vZ2VuZXJhdGVkaXBjL05hdGl2ZUNyeXB0b0ZhY2FkZVNlbmREaXNwYXRjaGVyLnRzIiwiLi4vc3JjL2NvbW1vbi9hcGkvd29ya2VyL2NyeXB0by9Sc2FJbXBsZW1lbnRhdGlvbi50cyIsIi4uL3NyYy9jb21tb24vYXBpL3dvcmtlci9jcnlwdG8vQ3J5cHRvRmFjYWRlLnRzIiwiLi4vc3JjL2NvbW1vbi9hcGkvd29ya2VyL2NyeXB0by9JbnN0YW5jZU1hcHBlci50cyIsIi4uL3NyYy9jb21tb24vYXBpL3dvcmtlci9yZXN0L0FkbWluQ2xpZW50RHVtbXlFbnRpdHlSZXN0Q2FjaGUudHMiLCIuLi9zcmMvY29tbW9uL2FwaS93b3JrZXIvdXRpbHMvU2xlZXBEZXRlY3Rvci50cyIsIi4uL3NyYy9jb21tb24vYXBpL3dvcmtlci9yZXN0L0VwaGVtZXJhbENhY2hlU3RvcmFnZS50cyIsIi4uL3NyYy9jb21tb24vYXBpL3dvcmtlci9yZXN0L0NhY2hlU3RvcmFnZVByb3h5LnRzIiwiLi4vc3JjL2NvbW1vbi9hcGkvd29ya2VyL3Jlc3QvU2VydmljZUV4ZWN1dG9yLnRzIiwiLi4vc3JjL2NvbW1vbi9hcGkvd29ya2VyL2ZhY2FkZXMvVXNlckZhY2FkZS50cyIsIi4uL3NyYy9jb21tb24vYXBpL3dvcmtlci9vZmZsaW5lL1N0YW5kYXJkTWlncmF0aW9ucy50cyIsIi4uL3NyYy9jb21tb24vYXBpL3dvcmtlci9vZmZsaW5lL21pZ3JhdGlvbnMvc3lzLXY5NC50cyIsIi4uL3NyYy9jb21tb24vYXBpL3dvcmtlci9vZmZsaW5lL21pZ3JhdGlvbnMvdHV0YW5vdGEtdjY2LnRzIiwiLi4vc3JjL2NvbW1vbi9hcGkvd29ya2VyL29mZmxpbmUvbWlncmF0aW9ucy9zeXMtdjkyLnRzIiwiLi4vc3JjL2NvbW1vbi9hcGkvd29ya2VyL29mZmxpbmUvbWlncmF0aW9ucy90dXRhbm90YS12NjUudHMiLCIuLi9zcmMvY29tbW9uL2FwaS93b3JrZXIvb2ZmbGluZS9taWdyYXRpb25zL3N5cy12OTEudHMiLCIuLi9zcmMvY29tbW9uL2FwaS93b3JrZXIvb2ZmbGluZS9taWdyYXRpb25zL3N5cy12OTAudHMiLCIuLi9zcmMvY29tbW9uL2FwaS93b3JrZXIvb2ZmbGluZS9taWdyYXRpb25zL3R1dGFub3RhLXY2NC50cyIsIi4uL3NyYy9jb21tb24vYXBpL3dvcmtlci9vZmZsaW5lL21pZ3JhdGlvbnMvdHV0YW5vdGEtdjY3LnRzIiwiLi4vc3JjL2NvbW1vbi9hcGkvd29ya2VyL29mZmxpbmUvbWlncmF0aW9ucy9zeXMtdjk2LnRzIiwiLi4vc3JjL2NvbW1vbi9hcGkvd29ya2VyL29mZmxpbmUvbWlncmF0aW9ucy90dXRhbm90YS12NjkudHMiLCIuLi9zcmMvY29tbW9uL2FwaS93b3JrZXIvb2ZmbGluZS9taWdyYXRpb25zL3N5cy12OTcudHMiLCIuLi9zcmMvY29tbW9uL2FwaS93b3JrZXIvb2ZmbGluZS9taWdyYXRpb25zL3R1dGFub3RhLXY3MS50cyIsIi4uL3NyYy9jb21tb24vYXBpL3dvcmtlci9vZmZsaW5lL21pZ3JhdGlvbnMvc3lzLXY5OS50cyIsIi4uL3NyYy9jb21tb24vYXBpL3dvcmtlci9vZmZsaW5lL21pZ3JhdGlvbnMvc3lzLXYxMDEudHMiLCIuLi9zcmMvY29tbW9uL2FwaS93b3JrZXIvb2ZmbGluZS9taWdyYXRpb25zL3N5cy12MTAyLnRzIiwiLi4vc3JjL2NvbW1vbi9hcGkvd29ya2VyL29mZmxpbmUvbWlncmF0aW9ucy90dXRhbm90YS12NzIudHMiLCIuLi9zcmMvY29tbW9uL2FwaS93b3JrZXIvb2ZmbGluZS9taWdyYXRpb25zL3N5cy12MTAzLnRzIiwiLi4vc3JjL2NvbW1vbi9hcGkvd29ya2VyL29mZmxpbmUvbWlncmF0aW9ucy90dXRhbm90YS12NzMudHMiLCIuLi9zcmMvY29tbW9uL2FwaS93b3JrZXIvb2ZmbGluZS9taWdyYXRpb25zL3N5cy12MTA0LnRzIiwiLi4vc3JjL2NvbW1vbi9hcGkvd29ya2VyL29mZmxpbmUvbWlncmF0aW9ucy9zeXMtdjEwNS50cyIsIi4uL3NyYy9jb21tb24vYXBpL3dvcmtlci9vZmZsaW5lL21pZ3JhdGlvbnMvc3lzLXYxMDYudHMiLCIuLi9zcmMvY29tbW9uL2FwaS93b3JrZXIvb2ZmbGluZS9taWdyYXRpb25zL3R1dGFub3RhLXY3NC50cyIsIi4uL3NyYy9jb21tb24vYXBpL3dvcmtlci9vZmZsaW5lL21pZ3JhdGlvbnMvc3lzLXYxMDcudHMiLCIuLi9zcmMvY29tbW9uL2FwaS93b3JrZXIvb2ZmbGluZS9taWdyYXRpb25zL3R1dGFub3RhLXY3NS50cyIsIi4uL3NyYy9jb21tb24vYXBpL3dvcmtlci9vZmZsaW5lL21pZ3JhdGlvbnMvc3lzLXYxMTEudHMiLCIuLi9zcmMvY29tbW9uL2FwaS93b3JrZXIvb2ZmbGluZS9taWdyYXRpb25zL3R1dGFub3RhLXY3Ni50cyIsIi4uL3NyYy9jb21tb24vYXBpL3dvcmtlci9vZmZsaW5lL21pZ3JhdGlvbnMvc3lzLXYxMTIudHMiLCIuLi9zcmMvY29tbW9uL2FwaS93b3JrZXIvb2ZmbGluZS9taWdyYXRpb25zL3R1dGFub3RhLXY3Ny50cyIsIi4uL3NyYy9jb21tb24vYXBpL3dvcmtlci9vZmZsaW5lL21pZ3JhdGlvbnMvc3lzLXYxMTQudHMiLCIuLi9zcmMvY29tbW9uL2FwaS93b3JrZXIvb2ZmbGluZS9taWdyYXRpb25zL29mZmxpbmUyLnRzIiwiLi4vc3JjL2NvbW1vbi9hcGkvd29ya2VyL29mZmxpbmUvbWlncmF0aW9ucy9zeXMtdjExNS50cyIsIi4uL3NyYy9jb21tb24vYXBpL3dvcmtlci9vZmZsaW5lL21pZ3JhdGlvbnMvdHV0YW5vdGEtdjc4LnRzIiwiLi4vc3JjL2NvbW1vbi9hcGkvd29ya2VyL29mZmxpbmUvbWlncmF0aW9ucy9zeXMtdjExNi50cyIsIi4uL3NyYy9jb21tb24vYXBpL3dvcmtlci9vZmZsaW5lL21pZ3JhdGlvbnMvdHV0YW5vdGEtdjc5LnRzIiwiLi4vc3JjL2NvbW1vbi9hcGkvd29ya2VyL29mZmxpbmUvbWlncmF0aW9ucy9vZmZsaW5lMy50cyIsIi4uL3NyYy9jb21tb24vYXBpL3dvcmtlci9vZmZsaW5lL21pZ3JhdGlvbnMvc3lzLXYxMTgudHMiLCIuLi9zcmMvY29tbW9uL2FwaS93b3JrZXIvb2ZmbGluZS9taWdyYXRpb25zL3R1dGFub3RhLXY4MC50cyIsIi4uL3NyYy9jb21tb24vYXBpL3dvcmtlci9vZmZsaW5lL21pZ3JhdGlvbnMvc3RvcmFnZS12MTEudHMiLCIuLi9zcmMvY29tbW9uL2FwaS93b3JrZXIvb2ZmbGluZS9taWdyYXRpb25zL3N5cy12MTE5LnRzIiwiLi4vc3JjL2NvbW1vbi9hcGkvd29ya2VyL29mZmxpbmUvbWlncmF0aW9ucy9zeXMtdjEyMC50cyIsIi4uL3NyYy9jb21tb24vYXBpL3dvcmtlci9vZmZsaW5lL21pZ3JhdGlvbnMvdHV0YW5vdGEtdjgzLnRzIiwiLi4vc3JjL2NvbW1vbi9hcGkvd29ya2VyL29mZmxpbmUvbWlncmF0aW9ucy9zeXMtdjEyMS50cyIsIi4uL3NyYy9jb21tb24vYXBpL3dvcmtlci9vZmZsaW5lL09mZmxpbmVTdG9yYWdlTWlncmF0b3IudHMiLCIuLi9zcmMvY29tbW9uL25hdGl2ZS9jb21tb24vZ2VuZXJhdGVkaXBjL1NxbENpcGhlckZhY2FkZVNlbmREaXNwYXRjaGVyLnRzIiwiLi4vc3JjL2NvbW1vbi9hcGkvd29ya2VyL2ZhY2FkZXMvRW50cm9weUZhY2FkZS50cyIsIi4uL3NyYy9jb21tb24vYXBpL3dvcmtlci9mYWNhZGVzL0Jsb2JBY2Nlc3NUb2tlbkZhY2FkZS50cyIsIi4uL3NyYy9jb21tb24vYXBpL3dvcmtlci9jcnlwdG8vT3duZXJFbmNTZXNzaW9uS2V5c1VwZGF0ZVF1ZXVlLnRzIiwiLi4vc3JjL2NvbW1vbi9hcGkvd29ya2VyL0V2ZW50QnVzRXZlbnRDb29yZGluYXRvci50cyIsIi4uL3NyYy9jb21tb24vYXBpL3dvcmtlci9mYWNhZGVzL1dvcmtlckZhY2FkZS50cyIsIi4uL3NyYy9jb21tb24vYXBpL3dvcmtlci9mYWNhZGVzL0FyZ29uMmlkRmFjYWRlLnRzIiwiLi4vc3JjL2NvbW1vbi9hcGkvd29ya2VyL2ZhY2FkZXMvS3liZXJGYWNhZGUudHMiLCIuLi9zcmMvY29tbW9uL2FwaS93b3JrZXIvZmFjYWRlcy9QUU1lc3NhZ2UudHMiLCIuLi9zcmMvY29tbW9uL2FwaS93b3JrZXIvZmFjYWRlcy9QUUZhY2FkZS50cyIsIi4uL3NyYy9jb21tb24vYXBpL3dvcmtlci9mYWNhZGVzL0tleVJvdGF0aW9uRmFjYWRlLnRzIiwiLi4vc3JjL2NvbW1vbi9hcGkvd29ya2VyL2ZhY2FkZXMvS2V5Q2FjaGUudHMiLCIuLi9zcmMvbWFpbC1hcHAvd29ya2VyVXRpbHMvb2ZmbGluZS9NYWlsT2ZmbGluZUNsZWFuZXIudHMiLCIuLi9zcmMvY29tbW9uL2FwaS93b3JrZXIvY3J5cHRvL0FzeW1tZXRyaWNDcnlwdG9GYWNhZGUudHMiLCIuLi9zcmMvY29tbW9uL2FwaS93b3JrZXIvZmFjYWRlcy9QdWJsaWNLZXlQcm92aWRlci50cyIsIi4uL3NyYy9jb21tb24vYXBpL3dvcmtlci9EYXRlUHJvdmlkZXIudHMiLCIuLi9zcmMvbWFpbC1hcHAvd29ya2VyVXRpbHMvd29ya2VyL1dvcmtlckxvY2F0b3IudHMiLCIuLi9zcmMvbWFpbC1hcHAvd29ya2VyVXRpbHMvd29ya2VyL1dvcmtlckltcGwudHMiLCIuLi9zcmMvbWFpbC1hcHAvd29ya2VyVXRpbHMvd29ya2VyL21haWwtd29ya2VyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgRGVmZXJyZWRPYmplY3QgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB7IGRlZmVyLCBub09wIH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5pbXBvcnQgdHlwZSB7IFN5c3RlbVRpbWVvdXQgfSBmcm9tIFwiLi4vY29tbW9uL3V0aWxzL1NjaGVkdWxlci5qc1wiXG5pbXBvcnQgeyBJbmZvTWVzc2FnZUhhbmRsZXIgfSBmcm9tIFwiLi4vLi4vZ3VpL0luZm9NZXNzYWdlSGFuZGxlci5qc1wiXG5cbmV4cG9ydCBjbGFzcyBTdXNwZW5zaW9uSGFuZGxlciB7XG5cdF9pc1N1c3BlbmRlZDogYm9vbGVhblxuXHRfc3VzcGVuZGVkVW50aWw6IG51bWJlclxuXHRfZGVmZXJyZWRSZXF1ZXN0czogQXJyYXk8RGVmZXJyZWRPYmplY3Q8YW55Pj5cblx0X2hhc1NlbnRJbmZvTWVzc2FnZTogYm9vbGVhblxuXHRfdGltZW91dDogU3lzdGVtVGltZW91dFxuXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgaW5mb01lc3NhZ2VIYW5kbGVyOiBJbmZvTWVzc2FnZUhhbmRsZXIsIHN5c3RlbVRpbWVvdXQ6IFN5c3RlbVRpbWVvdXQpIHtcblx0XHR0aGlzLl9pc1N1c3BlbmRlZCA9IGZhbHNlXG5cdFx0dGhpcy5fc3VzcGVuZGVkVW50aWwgPSAwXG5cdFx0dGhpcy5fZGVmZXJyZWRSZXF1ZXN0cyA9IFtdXG5cdFx0dGhpcy5faGFzU2VudEluZm9NZXNzYWdlID0gZmFsc2Vcblx0XHR0aGlzLl90aW1lb3V0ID0gc3lzdGVtVGltZW91dFxuXHR9XG5cblx0LyoqXG5cdCAqIEFjdGl2YXRlcyBzdXNwZW5zaW9uIHN0YXRlcyBmb3IgdGhlIGdpdmVuIGFtb3VudCBvZiBzZWNvbmRzLiBBZnRlciB0aGUgZW5kIG9mIHRoZSBzdXNwZW5zaW9uIHRpbWUgYWxsIGRlZmVycmVkIHJlcXVlc3RzIGFyZSBleGVjdXRlZC5cblx0ICovXG5cdC8vIGlmIGFscmVhZHkgc3VzcGVuZGVkIGRvIHdlIHdhbnQgdG8gaWdub3JlIGluY29taW5nIHN1c3BlbnNpb25zP1xuXHRhY3RpdmF0ZVN1c3BlbnNpb25JZkluYWN0aXZlKHN1c3BlbnNpb25EdXJhdGlvblNlY29uZHM6IG51bWJlciwgcmVzb3VyY2VVUkw6IFVSTCkge1xuXHRcdGlmICghdGhpcy5pc1N1c3BlbmRlZCgpKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhgQWN0aXZhdGluZyBzdXNwZW5zaW9uICgke3Jlc291cmNlVVJMfSk6ICAke3N1c3BlbnNpb25EdXJhdGlvblNlY29uZHN9c2ApXG5cdFx0XHR0aGlzLl9pc1N1c3BlbmRlZCA9IHRydWVcblx0XHRcdGNvbnN0IHN1c3BlbnNpb25TdGFydFRpbWUgPSBEYXRlLm5vdygpXG5cblx0XHRcdHRoaXMuX3RpbWVvdXQuc2V0VGltZW91dChhc3luYyAoKSA9PiB7XG5cdFx0XHRcdHRoaXMuX2lzU3VzcGVuZGVkID0gZmFsc2Vcblx0XHRcdFx0Y29uc29sZS5sb2coYFN1c3BlbnNpb24gcmVsZWFzZWQgYWZ0ZXIgJHsoRGF0ZS5ub3coKSAtIHN1c3BlbnNpb25TdGFydFRpbWUpIC8gMTAwMH1zYClcblx0XHRcdFx0YXdhaXQgdGhpcy5fb25TdXNwZW5zaW9uQ29tcGxldGUoKVxuXHRcdFx0fSwgc3VzcGVuc2lvbkR1cmF0aW9uU2Vjb25kcyAqIDEwMDApXG5cblx0XHRcdGlmICghdGhpcy5faGFzU2VudEluZm9NZXNzYWdlKSB7XG5cdFx0XHRcdHRoaXMuaW5mb01lc3NhZ2VIYW5kbGVyLm9uSW5mb01lc3NhZ2Uoe1xuXHRcdFx0XHRcdHRyYW5zbGF0aW9uS2V5OiBcImNsaWVudFN1c3BlbnNpb25XYWl0X2xhYmVsXCIsXG5cdFx0XHRcdFx0YXJnczoge30sXG5cdFx0XHRcdH0pXG5cblx0XHRcdFx0dGhpcy5faGFzU2VudEluZm9NZXNzYWdlID0gdHJ1ZVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGlzU3VzcGVuZGVkKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLl9pc1N1c3BlbmRlZFxuXHR9XG5cblx0LyoqXG5cdCAqIEFkZHMgYSByZXF1ZXN0IHRvIHRoZSBkZWZlcnJlZCBxdWV1ZS5cblx0ICogQHBhcmFtIHJlcXVlc3Rcblx0ICogQHJldHVybnMge1Byb21pc2U8VD59XG5cdCAqL1xuXHRkZWZlclJlcXVlc3QocmVxdWVzdDogKCkgPT4gUHJvbWlzZTxhbnk+KTogUHJvbWlzZTxhbnk+IHtcblx0XHRpZiAodGhpcy5faXNTdXNwZW5kZWQpIHtcblx0XHRcdGNvbnN0IGRlZmVycmVkT2JqZWN0ID0gZGVmZXIoKVxuXG5cdFx0XHR0aGlzLl9kZWZlcnJlZFJlcXVlc3RzLnB1c2goZGVmZXJyZWRPYmplY3QpXG5cblx0XHRcdC8vIGFzc2lnbiByZXF1ZXN0IHByb21pc2UgdG8gZGVmZXJyZWQgb2JqZWN0XG5cdFx0XHRkZWZlcnJlZE9iamVjdC5wcm9taXNlID0gZGVmZXJyZWRPYmplY3QucHJvbWlzZS50aGVuKCgpID0+IHJlcXVlc3QoKSlcblx0XHRcdHJldHVybiBkZWZlcnJlZE9iamVjdC5wcm9taXNlXG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGlmIHN1c3BlbnNpb24gaXMgbm90IGFjdGl2YXRlZCB0aGVuIGltbWVkaWF0ZWx5IGV4ZWN1dGUgdGhlIHJlcXVlc3Rcblx0XHRcdHJldHVybiByZXF1ZXN0KClcblx0XHR9XG5cdH1cblxuXHRhc3luYyBfb25TdXNwZW5zaW9uQ29tcGxldGUoKSB7XG5cdFx0Y29uc3QgZGVmZXJyZWRSZXF1ZXN0cyA9IHRoaXMuX2RlZmVycmVkUmVxdWVzdHNcblx0XHR0aGlzLl9kZWZlcnJlZFJlcXVlc3RzID0gW11cblxuXHRcdC8vIGRvIHdlZSBuZWVkIHRvIGRlbGF5IHRob3NlIHJlcXVlc3RzP1xuXHRcdGZvciAobGV0IGRlZmVycmVkUmVxdWVzdCBvZiBkZWZlcnJlZFJlcXVlc3RzKSB7XG5cdFx0XHRkZWZlcnJlZFJlcXVlc3QucmVzb2x2ZShudWxsKVxuXHRcdFx0Ly8gSWdub3JlIGFsbCBlcnJvcnMgaGVyZSwgYW55IGVycm9ycyBzaG91bGQgYmUgY2F1Z2h0IGJ5IHdob2V2ZXIgaXMgaGFuZGxpbmcgdGhlIGRlZmVycmVkIHJlcXVlc3Rcblx0XHRcdGF3YWl0IGRlZmVycmVkUmVxdWVzdC5wcm9taXNlLmNhdGNoKG5vT3ApXG5cdFx0fVxuXHR9XG59XG4iLCJpbXBvcnQgeyBhZXMyNTZSYW5kb21LZXksIGFlc0RlY3J5cHQsIGFlc0VuY3J5cHQsIGJpdEFycmF5VG9VaW50OEFycmF5LCB1aW50OEFycmF5VG9CaXRBcnJheSB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtY3J5cHRvXCJcblxuZXhwb3J0IGNsYXNzIERldmljZUVuY3J5cHRpb25GYWNhZGUge1xuXHQvKipcblx0ICogR2VuZXJhdGVzIGFuIGVuY3J5cHRpb24ga2V5LlxuXHQgKi9cblx0YXN5bmMgZ2VuZXJhdGVLZXkoKTogUHJvbWlzZTxVaW50OEFycmF5PiB7XG5cdFx0cmV0dXJuIGJpdEFycmF5VG9VaW50OEFycmF5KGFlczI1NlJhbmRvbUtleSgpKVxuXHR9XG5cblx0LyoqXG5cdCAqIEVuY3J5cHRzIHtAcGFyYW0gZGF0YX0gdXNpbmcge0BwYXJhbSBkZXZpY2VLZXl9LlxuXHQgKiBAcGFyYW0gZGV2aWNlS2V5IEtleSB1c2VkIGZvciBlbmNyeXB0aW9uXG5cdCAqIEBwYXJhbSBkYXRhIERhdGEgdG8gZW5jcnlwdC5cblx0ICovXG5cdGFzeW5jIGVuY3J5cHQoZGV2aWNlS2V5OiBVaW50OEFycmF5LCBkYXRhOiBVaW50OEFycmF5KTogUHJvbWlzZTxVaW50OEFycmF5PiB7XG5cdFx0cmV0dXJuIGFlc0VuY3J5cHQodWludDhBcnJheVRvQml0QXJyYXkoZGV2aWNlS2V5KSwgZGF0YSlcblx0fVxuXG5cdC8qKlxuXHQgKiBEZWNyeXB0cyB7QHBhcmFtIGVuY3J5cHRlZERhdGF9IHVzaW5nIHtAcGFyYW0gZGV2aWNlS2V5fS5cblx0ICogQHBhcmFtIGRldmljZUtleSBLZXkgdXNlZCBmb3IgZW5jcnlwdGlvblxuXHQgKiBAcGFyYW0gZW5jcnlwdGVkRGF0YSBEYXRhIHRvIGJlIGRlY3J5cHRlZC5cblx0ICovXG5cdGFzeW5jIGRlY3J5cHQoZGV2aWNlS2V5OiBVaW50OEFycmF5LCBlbmNyeXB0ZWREYXRhOiBVaW50OEFycmF5KTogUHJvbWlzZTxVaW50OEFycmF5PiB7XG5cdFx0cmV0dXJuIGFlc0RlY3J5cHQodWludDhBcnJheVRvQml0QXJyYXkoZGV2aWNlS2V5KSwgZW5jcnlwdGVkRGF0YSlcblx0fVxufVxuIiwiaW1wb3J0IHsgQWVzS2V5LCBJVl9CWVRFX0xFTkdUSCwga2V5VG9VaW50OEFycmF5LCBSYW5kb21pemVyIH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS1jcnlwdG9cIlxuaW1wb3J0IHsgRmlsZVVyaSB9IGZyb20gXCIuLi9jb21tb24vRmlsZUFwcFwiXG5pbXBvcnQgeyBOYXRpdmVDcnlwdG9GYWNhZGUgfSBmcm9tIFwiLi4vY29tbW9uL2dlbmVyYXRlZGlwYy9OYXRpdmVDcnlwdG9GYWNhZGVcIlxuaW1wb3J0IHsgRW5jcnlwdGVkRmlsZUluZm8gfSBmcm9tIFwiLi4vY29tbW9uL2dlbmVyYXRlZGlwYy9FbmNyeXB0ZWRGaWxlSW5mb1wiXG5cbmV4cG9ydCBjbGFzcyBBZXNBcHAge1xuXHRjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IG5hdGl2ZUNyeXB0b0ZhY2FkZTogTmF0aXZlQ3J5cHRvRmFjYWRlLCBwcml2YXRlIHJlYWRvbmx5IHJhbmRvbTogUmFuZG9taXplcikge31cblxuXHQvKipcblx0ICogRW5jcnlwdHMgYSBmaWxlIHdpdGggdGhlIHByb3ZpZGVkIGtleVxuXHQgKiBAcmV0dXJuIFJldHVybnMgdGhlIFVSSSBvZiB0aGUgZGVjcnlwdGVkIGZpbGUuIFJlc29sdmVzIHRvIGFuIGV4Y2VwdGlvbiBpZiB0aGUgZW5jcnlwdGlvbiBmYWlsZWQuXG5cdCAqL1xuXHRhZXNFbmNyeXB0RmlsZShrZXk6IEFlc0tleSwgZmlsZVVybDogRmlsZVVyaSk6IFByb21pc2U8RW5jcnlwdGVkRmlsZUluZm8+IHtcblx0XHRjb25zdCBpdiA9IHRoaXMucmFuZG9tLmdlbmVyYXRlUmFuZG9tRGF0YShJVl9CWVRFX0xFTkdUSClcblx0XHRjb25zdCBlbmNvZGVkS2V5ID0ga2V5VG9VaW50OEFycmF5KGtleSlcblx0XHRyZXR1cm4gdGhpcy5uYXRpdmVDcnlwdG9GYWNhZGUuYWVzRW5jcnlwdEZpbGUoZW5jb2RlZEtleSwgZmlsZVVybCwgaXYpXG5cdH1cblxuXHQvKipcblx0ICogRGVjcnlwdCBieXRlcyB3aXRoIHRoZSBwcm92aWRlZCBrZXlcblx0ICogQHJldHVybiBSZXR1cm5zIHRoZSBVUkkgb2YgdGhlIGRlY3J5cHRlZCBmaWxlLiBSZXNvbHZlcyB0byBhbiBleGNlcHRpb24gaWYgdGhlIGVuY3J5cHRpb24gZmFpbGVkLlxuXHQgKi9cblx0YWVzRGVjcnlwdEZpbGUoa2V5OiBBZXNLZXksIGZpbGVVcmw6IEZpbGVVcmkpOiBQcm9taXNlPEZpbGVVcmk+IHtcblx0XHRjb25zdCBlbmNvZGVkS2V5ID0ga2V5VG9VaW50OEFycmF5KGtleSlcblx0XHRyZXR1cm4gdGhpcy5uYXRpdmVDcnlwdG9GYWNhZGUuYWVzRGVjcnlwdEZpbGUoZW5jb2RlZEtleSwgZmlsZVVybClcblx0fVxufVxuIiwiLyogZ2VuZXJhdGVkIGZpbGUsIGRvbid0IGVkaXQuICovXG5cbmltcG9ydCB7IE5hdGl2ZUNyeXB0b0ZhY2FkZSB9IGZyb20gXCIuL05hdGl2ZUNyeXB0b0ZhY2FkZS5qc1wiXG5cbmludGVyZmFjZSBOYXRpdmVJbnRlcmZhY2Uge1xuXHRpbnZva2VOYXRpdmUocmVxdWVzdFR5cGU6IHN0cmluZywgYXJnczogdW5rbm93bltdKTogUHJvbWlzZTxhbnk+XG59XG5leHBvcnQgY2xhc3MgTmF0aXZlQ3J5cHRvRmFjYWRlU2VuZERpc3BhdGNoZXIgaW1wbGVtZW50cyBOYXRpdmVDcnlwdG9GYWNhZGUge1xuXHRjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IHRyYW5zcG9ydDogTmF0aXZlSW50ZXJmYWNlKSB7fVxuXHRhc3luYyByc2FFbmNyeXB0KC4uLmFyZ3M6IFBhcmFtZXRlcnM8TmF0aXZlQ3J5cHRvRmFjYWRlW1wicnNhRW5jcnlwdFwiXT4pIHtcblx0XHRyZXR1cm4gdGhpcy50cmFuc3BvcnQuaW52b2tlTmF0aXZlKFwiaXBjXCIsIFtcIk5hdGl2ZUNyeXB0b0ZhY2FkZVwiLCBcInJzYUVuY3J5cHRcIiwgLi4uYXJnc10pXG5cdH1cblx0YXN5bmMgcnNhRGVjcnlwdCguLi5hcmdzOiBQYXJhbWV0ZXJzPE5hdGl2ZUNyeXB0b0ZhY2FkZVtcInJzYURlY3J5cHRcIl0+KSB7XG5cdFx0cmV0dXJuIHRoaXMudHJhbnNwb3J0Lmludm9rZU5hdGl2ZShcImlwY1wiLCBbXCJOYXRpdmVDcnlwdG9GYWNhZGVcIiwgXCJyc2FEZWNyeXB0XCIsIC4uLmFyZ3NdKVxuXHR9XG5cdGFzeW5jIGFlc0VuY3J5cHRGaWxlKC4uLmFyZ3M6IFBhcmFtZXRlcnM8TmF0aXZlQ3J5cHRvRmFjYWRlW1wiYWVzRW5jcnlwdEZpbGVcIl0+KSB7XG5cdFx0cmV0dXJuIHRoaXMudHJhbnNwb3J0Lmludm9rZU5hdGl2ZShcImlwY1wiLCBbXCJOYXRpdmVDcnlwdG9GYWNhZGVcIiwgXCJhZXNFbmNyeXB0RmlsZVwiLCAuLi5hcmdzXSlcblx0fVxuXHRhc3luYyBhZXNEZWNyeXB0RmlsZSguLi5hcmdzOiBQYXJhbWV0ZXJzPE5hdGl2ZUNyeXB0b0ZhY2FkZVtcImFlc0RlY3J5cHRGaWxlXCJdPikge1xuXHRcdHJldHVybiB0aGlzLnRyYW5zcG9ydC5pbnZva2VOYXRpdmUoXCJpcGNcIiwgW1wiTmF0aXZlQ3J5cHRvRmFjYWRlXCIsIFwiYWVzRGVjcnlwdEZpbGVcIiwgLi4uYXJnc10pXG5cdH1cblx0YXN5bmMgYXJnb24yaWRHZW5lcmF0ZVBhc3NwaHJhc2VLZXkoLi4uYXJnczogUGFyYW1ldGVyczxOYXRpdmVDcnlwdG9GYWNhZGVbXCJhcmdvbjJpZEdlbmVyYXRlUGFzc3BocmFzZUtleVwiXT4pIHtcblx0XHRyZXR1cm4gdGhpcy50cmFuc3BvcnQuaW52b2tlTmF0aXZlKFwiaXBjXCIsIFtcIk5hdGl2ZUNyeXB0b0ZhY2FkZVwiLCBcImFyZ29uMmlkR2VuZXJhdGVQYXNzcGhyYXNlS2V5XCIsIC4uLmFyZ3NdKVxuXHR9XG5cdGFzeW5jIGdlbmVyYXRlS3liZXJLZXlwYWlyKC4uLmFyZ3M6IFBhcmFtZXRlcnM8TmF0aXZlQ3J5cHRvRmFjYWRlW1wiZ2VuZXJhdGVLeWJlcktleXBhaXJcIl0+KSB7XG5cdFx0cmV0dXJuIHRoaXMudHJhbnNwb3J0Lmludm9rZU5hdGl2ZShcImlwY1wiLCBbXCJOYXRpdmVDcnlwdG9GYWNhZGVcIiwgXCJnZW5lcmF0ZUt5YmVyS2V5cGFpclwiLCAuLi5hcmdzXSlcblx0fVxuXHRhc3luYyBreWJlckVuY2Fwc3VsYXRlKC4uLmFyZ3M6IFBhcmFtZXRlcnM8TmF0aXZlQ3J5cHRvRmFjYWRlW1wia3liZXJFbmNhcHN1bGF0ZVwiXT4pIHtcblx0XHRyZXR1cm4gdGhpcy50cmFuc3BvcnQuaW52b2tlTmF0aXZlKFwiaXBjXCIsIFtcIk5hdGl2ZUNyeXB0b0ZhY2FkZVwiLCBcImt5YmVyRW5jYXBzdWxhdGVcIiwgLi4uYXJnc10pXG5cdH1cblx0YXN5bmMga3liZXJEZWNhcHN1bGF0ZSguLi5hcmdzOiBQYXJhbWV0ZXJzPE5hdGl2ZUNyeXB0b0ZhY2FkZVtcImt5YmVyRGVjYXBzdWxhdGVcIl0+KSB7XG5cdFx0cmV0dXJuIHRoaXMudHJhbnNwb3J0Lmludm9rZU5hdGl2ZShcImlwY1wiLCBbXCJOYXRpdmVDcnlwdG9GYWNhZGVcIiwgXCJreWJlckRlY2Fwc3VsYXRlXCIsIC4uLmFyZ3NdKVxuXHR9XG59XG4iLCJpbXBvcnQgdHlwZSB7IE5hdGl2ZUludGVyZmFjZSB9IGZyb20gXCIuLi8uLi8uLi9uYXRpdmUvY29tbW9uL05hdGl2ZUludGVyZmFjZVwiXG5pbXBvcnQgeyBpc0FwcCB9IGZyb20gXCIuLi8uLi9jb21tb24vRW52XCJcbmltcG9ydCB0eXBlIHsgUnNhUHJpdmF0ZUtleSwgUnNhUHVibGljS2V5IH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS1jcnlwdG9cIlxuaW1wb3J0IHsgcmFuZG9tLCByc2FEZWNyeXB0LCByc2FFbmNyeXB0IH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS1jcnlwdG9cIlxuaW1wb3J0IHsgTmF0aXZlQ3J5cHRvRmFjYWRlU2VuZERpc3BhdGNoZXIgfSBmcm9tIFwiLi4vLi4vLi4vbmF0aXZlL2NvbW1vbi9nZW5lcmF0ZWRpcGMvTmF0aXZlQ3J5cHRvRmFjYWRlU2VuZERpc3BhdGNoZXJcIlxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlUnNhSW1wbGVtZW50YXRpb24obmF0aXZlOiBOYXRpdmVJbnRlcmZhY2UpOiBQcm9taXNlPFJzYUltcGxlbWVudGF0aW9uPiB7XG5cdGlmIChpc0FwcCgpKSB7XG5cdFx0Y29uc3QgeyBSc2FBcHAgfSA9IGF3YWl0IGltcG9ydChcIi4uLy4uLy4uL25hdGl2ZS93b3JrZXIvUnNhQXBwXCIpXG5cdFx0cmV0dXJuIG5ldyBSc2FBcHAobmV3IE5hdGl2ZUNyeXB0b0ZhY2FkZVNlbmREaXNwYXRjaGVyKG5hdGl2ZSksIHJhbmRvbSlcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gbmV3IFJzYVdlYigpXG5cdH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBSc2FJbXBsZW1lbnRhdGlvbiB7XG5cdGVuY3J5cHQocHVibGljS2V5OiBSc2FQdWJsaWNLZXksIGJ5dGVzOiBVaW50OEFycmF5KTogUHJvbWlzZTxVaW50OEFycmF5PlxuXG5cdGRlY3J5cHQocHJpdmF0ZUtleTogUnNhUHJpdmF0ZUtleSwgYnl0ZXM6IFVpbnQ4QXJyYXkpOiBQcm9taXNlPFVpbnQ4QXJyYXk+XG59XG5cbmV4cG9ydCBjbGFzcyBSc2FXZWIgaW1wbGVtZW50cyBSc2FJbXBsZW1lbnRhdGlvbiB7XG5cdGFzeW5jIGVuY3J5cHQocHVibGljS2V5OiBSc2FQdWJsaWNLZXksIGJ5dGVzOiBVaW50OEFycmF5KTogUHJvbWlzZTxVaW50OEFycmF5PiB7XG5cdFx0Y29uc3Qgc2VlZCA9IHJhbmRvbS5nZW5lcmF0ZVJhbmRvbURhdGEoMzIpXG5cdFx0cmV0dXJuIHJzYUVuY3J5cHQocHVibGljS2V5LCBieXRlcywgc2VlZClcblx0fVxuXG5cdGFzeW5jIGRlY3J5cHQocHJpdmF0ZUtleTogUnNhUHJpdmF0ZUtleSwgYnl0ZXM6IFVpbnQ4QXJyYXkpOiBQcm9taXNlPFVpbnQ4QXJyYXk+IHtcblx0XHRyZXR1cm4gcnNhRGVjcnlwdChwcml2YXRlS2V5LCBieXRlcylcblx0fVxufVxuIiwiaW1wb3J0IHtcblx0YXNzZXJ0Tm90TnVsbCxcblx0YmFzZTY0VG9VaW50OEFycmF5LFxuXHRkb3duY2FzdCxcblx0aXNTYW1lVHlwZVJlZixcblx0aXNTYW1lVHlwZVJlZkJ5QXR0cixcblx0bGF6eSxcblx0bmV2ZXJOdWxsLFxuXHRvZkNsYXNzLFxuXHRwcm9taXNlTWFwLFxuXHRzdHJpbmdUb1V0ZjhVaW50OEFycmF5LFxuXHRUeXBlUmVmLFxuXHR1aW50OEFycmF5VG9CYXNlNjQsXG5cdFZlcnNpb25lZCxcbn0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5pbXBvcnQge1xuXHRBY2NvdW50VHlwZSxcblx0YXNDcnlwdG9Qcm90b29jb2xWZXJzaW9uLFxuXHRhc3NlcnRFbnVtVmFsdWUsXG5cdEJ1Y2tldFBlcm1pc3Npb25UeXBlLFxuXHRDcnlwdG9Qcm90b2NvbFZlcnNpb24sXG5cdEVuY3J5cHRpb25BdXRoU3RhdHVzLFxuXHRHcm91cFR5cGUsXG5cdFBlcm1pc3Npb25UeXBlLFxuXHRQdWJsaWNLZXlJZGVudGlmaWVyVHlwZSxcblx0U1lTVEVNX0dST1VQX01BSUxfQUREUkVTUyxcbn0gZnJvbSBcIi4uLy4uL2NvbW1vbi9UdXRhbm90YUNvbnN0YW50c1wiXG5pbXBvcnQgeyBIdHRwTWV0aG9kLCByZXNvbHZlVHlwZVJlZmVyZW5jZSB9IGZyb20gXCIuLi8uLi9jb21tb24vRW50aXR5RnVuY3Rpb25zXCJcbmltcG9ydCB0eXBlIHsgQnVja2V0S2V5LCBCdWNrZXRQZXJtaXNzaW9uLCBHcm91cE1lbWJlcnNoaXAsIEluc3RhbmNlU2Vzc2lvbktleSwgUGVybWlzc2lvbiB9IGZyb20gXCIuLi8uLi9lbnRpdGllcy9zeXMvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHtcblx0QnVja2V0S2V5VHlwZVJlZixcblx0QnVja2V0UGVybWlzc2lvblR5cGVSZWYsXG5cdGNyZWF0ZUluc3RhbmNlU2Vzc2lvbktleSxcblx0Y3JlYXRlVXBkYXRlUGVybWlzc2lvbktleURhdGEsXG5cdEdyb3VwSW5mb1R5cGVSZWYsXG5cdEdyb3VwVHlwZVJlZixcblx0UGVybWlzc2lvblR5cGVSZWYsXG5cdFB1c2hJZGVudGlmaWVyVHlwZVJlZixcbn0gZnJvbSBcIi4uLy4uL2VudGl0aWVzL3N5cy9UeXBlUmVmcy5qc1wiXG5pbXBvcnQge1xuXHRDb250YWN0LFxuXHRDb250YWN0VHlwZVJlZixcblx0Y3JlYXRlRW5jcnlwdFR1dGFub3RhUHJvcGVydGllc0RhdGEsXG5cdGNyZWF0ZUludGVybmFsUmVjaXBpZW50S2V5RGF0YSxcblx0Y3JlYXRlU3ltRW5jSW50ZXJuYWxSZWNpcGllbnRLZXlEYXRhLFxuXHRGaWxlLFxuXHRGaWxlVHlwZVJlZixcblx0SW50ZXJuYWxSZWNpcGllbnRLZXlEYXRhLFxuXHRNYWlsLFxuXHRNYWlsVHlwZVJlZixcblx0U3ltRW5jSW50ZXJuYWxSZWNpcGllbnRLZXlEYXRhLFxuXHRUdXRhbm90YVByb3BlcnRpZXNUeXBlUmVmLFxufSBmcm9tIFwiLi4vLi4vZW50aXRpZXMvdHV0YW5vdGEvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgdHlwZVJlZlRvUGF0aCB9IGZyb20gXCIuLi9yZXN0L0VudGl0eVJlc3RDbGllbnRcIlxuaW1wb3J0IHsgTG9ja2VkRXJyb3IsIE5vdEZvdW5kRXJyb3IsIFBheWxvYWRUb29MYXJnZUVycm9yLCBUb29NYW55UmVxdWVzdHNFcnJvciB9IGZyb20gXCIuLi8uLi9jb21tb24vZXJyb3IvUmVzdEVycm9yXCJcbmltcG9ydCB7IFNlc3Npb25LZXlOb3RGb3VuZEVycm9yIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9lcnJvci9TZXNzaW9uS2V5Tm90Rm91bmRFcnJvclwiXG5pbXBvcnQgeyBiaXJ0aGRheVRvSXNvRGF0ZSwgb2xkQmlydGhkYXlUb0JpcnRoZGF5IH0gZnJvbSBcIi4uLy4uL2NvbW1vbi91dGlscy9CaXJ0aGRheVV0aWxzXCJcbmltcG9ydCB0eXBlIHsgRW50aXR5LCBJbnN0YW5jZSwgU29tZUVudGl0eSwgVHlwZU1vZGVsIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9FbnRpdHlUeXBlc1wiXG5pbXBvcnQgeyBhc3NlcnRXb3JrZXJPck5vZGUgfSBmcm9tIFwiLi4vLi4vY29tbW9uL0VudlwiXG5pbXBvcnQgdHlwZSB7IEVudGl0eUNsaWVudCB9IGZyb20gXCIuLi8uLi9jb21tb24vRW50aXR5Q2xpZW50XCJcbmltcG9ydCB7IFJlc3RDbGllbnQgfSBmcm9tIFwiLi4vcmVzdC9SZXN0Q2xpZW50XCJcbmltcG9ydCB7XG5cdEFlczI1NktleSxcblx0YWVzMjU2UmFuZG9tS2V5LFxuXHRhZXNFbmNyeXB0LFxuXHRBZXNLZXksXG5cdGJpdEFycmF5VG9VaW50OEFycmF5LFxuXHRkZWNyeXB0S2V5LFxuXHRFY2NQdWJsaWNLZXksXG5cdGVuY3J5cHRLZXksXG5cdGlzUHFLZXlQYWlycyxcblx0c2hhMjU2SGFzaCxcbn0gZnJvbSBcIkB0dXRhby90dXRhbm90YS1jcnlwdG9cIlxuaW1wb3J0IHsgUmVjaXBpZW50Tm90UmVzb2x2ZWRFcnJvciB9IGZyb20gXCIuLi8uLi9jb21tb24vZXJyb3IvUmVjaXBpZW50Tm90UmVzb2x2ZWRFcnJvclwiXG5pbXBvcnQgeyBJU2VydmljZUV4ZWN1dG9yIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9TZXJ2aWNlUmVxdWVzdFwiXG5pbXBvcnQgeyBFbmNyeXB0VHV0YW5vdGFQcm9wZXJ0aWVzU2VydmljZSB9IGZyb20gXCIuLi8uLi9lbnRpdGllcy90dXRhbm90YS9TZXJ2aWNlc1wiXG5pbXBvcnQgeyBVcGRhdGVQZXJtaXNzaW9uS2V5U2VydmljZSB9IGZyb20gXCIuLi8uLi9lbnRpdGllcy9zeXMvU2VydmljZXNcIlxuaW1wb3J0IHsgVXNlckZhY2FkZSB9IGZyb20gXCIuLi9mYWNhZGVzL1VzZXJGYWNhZGVcIlxuaW1wb3J0IHsgZWxlbWVudElkUGFydCwgZ2V0RWxlbWVudElkLCBnZXRMaXN0SWQgfSBmcm9tIFwiLi4vLi4vY29tbW9uL3V0aWxzL0VudGl0eVV0aWxzLmpzXCJcbmltcG9ydCB7IEluc3RhbmNlTWFwcGVyIH0gZnJvbSBcIi4vSW5zdGFuY2VNYXBwZXIuanNcIlxuaW1wb3J0IHsgT3duZXJFbmNTZXNzaW9uS2V5c1VwZGF0ZVF1ZXVlIH0gZnJvbSBcIi4vT3duZXJFbmNTZXNzaW9uS2V5c1VwZGF0ZVF1ZXVlLmpzXCJcbmltcG9ydCB7IERlZmF1bHRFbnRpdHlSZXN0Q2FjaGUgfSBmcm9tIFwiLi4vcmVzdC9EZWZhdWx0RW50aXR5UmVzdENhY2hlLmpzXCJcbmltcG9ydCB7IENyeXB0b0Vycm9yIH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS1jcnlwdG8vZXJyb3IuanNcIlxuaW1wb3J0IHsgS2V5TG9hZGVyRmFjYWRlLCBwYXJzZUtleVZlcnNpb24gfSBmcm9tIFwiLi4vZmFjYWRlcy9LZXlMb2FkZXJGYWNhZGUuanNcIlxuaW1wb3J0IHsgZW5jcnlwdEtleVdpdGhWZXJzaW9uZWRLZXksIFZlcnNpb25lZEVuY3J5cHRlZEtleSwgVmVyc2lvbmVkS2V5IH0gZnJvbSBcIi4vQ3J5cHRvV3JhcHBlci5qc1wiXG5pbXBvcnQgeyBBc3ltbWV0cmljQ3J5cHRvRmFjYWRlIH0gZnJvbSBcIi4vQXN5bW1ldHJpY0NyeXB0b0ZhY2FkZS5qc1wiXG5pbXBvcnQgeyBQdWJsaWNLZXlQcm92aWRlciwgUHVibGljS2V5cyB9IGZyb20gXCIuLi9mYWNhZGVzL1B1YmxpY0tleVByb3ZpZGVyLmpzXCJcbmltcG9ydCB7IEtleVZlcnNpb24gfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzL2Rpc3QvVXRpbHMuanNcIlxuaW1wb3J0IHsgS2V5Um90YXRpb25GYWNhZGUgfSBmcm9tIFwiLi4vZmFjYWRlcy9LZXlSb3RhdGlvbkZhY2FkZS5qc1wiXG5cbmFzc2VydFdvcmtlck9yTm9kZSgpXG5cbi8vIFVubWFwcGVkIGVuY3J5cHRlZCBvd25lciBncm91cCBpbnN0YW5jZVxudHlwZSBVbm1hcHBlZE93bmVyR3JvdXBJbnN0YW5jZSA9IHtcblx0X293bmVyRW5jU2Vzc2lvbktleTogc3RyaW5nXG5cdF9vd25lcktleVZlcnNpb246IE51bWJlclN0cmluZ1xuXHRfb3duZXJHcm91cDogSWRcbn1cblxudHlwZSBSZXNvbHZlZFNlc3Npb25LZXlzID0ge1xuXHRyZXNvbHZlZFNlc3Npb25LZXlGb3JJbnN0YW5jZTogQWVzS2V5XG5cdGluc3RhbmNlU2Vzc2lvbktleXM6IEFycmF5PEluc3RhbmNlU2Vzc2lvbktleT5cbn1cblxuZXhwb3J0IGNsYXNzIENyeXB0b0ZhY2FkZSB7XG5cdGNvbnN0cnVjdG9yKFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgdXNlckZhY2FkZTogVXNlckZhY2FkZSxcblx0XHRwcml2YXRlIHJlYWRvbmx5IGVudGl0eUNsaWVudDogRW50aXR5Q2xpZW50LFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgcmVzdENsaWVudDogUmVzdENsaWVudCxcblx0XHRwcml2YXRlIHJlYWRvbmx5IHNlcnZpY2VFeGVjdXRvcjogSVNlcnZpY2VFeGVjdXRvcixcblx0XHRwcml2YXRlIHJlYWRvbmx5IGluc3RhbmNlTWFwcGVyOiBJbnN0YW5jZU1hcHBlcixcblx0XHRwcml2YXRlIHJlYWRvbmx5IG93bmVyRW5jU2Vzc2lvbktleXNVcGRhdGVRdWV1ZTogT3duZXJFbmNTZXNzaW9uS2V5c1VwZGF0ZVF1ZXVlLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgY2FjaGU6IERlZmF1bHRFbnRpdHlSZXN0Q2FjaGUgfCBudWxsLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkga2V5TG9hZGVyRmFjYWRlOiBLZXlMb2FkZXJGYWNhZGUsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBhc3ltbWV0cmljQ3J5cHRvRmFjYWRlOiBBc3ltbWV0cmljQ3J5cHRvRmFjYWRlLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgcHVibGljS2V5UHJvdmlkZXI6IFB1YmxpY0tleVByb3ZpZGVyLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkga2V5Um90YXRpb25GYWNhZGU6IGxhenk8S2V5Um90YXRpb25GYWNhZGU+LFxuXHQpIHt9XG5cblx0YXN5bmMgYXBwbHlNaWdyYXRpb25zRm9ySW5zdGFuY2U8VD4oZGVjcnlwdGVkSW5zdGFuY2U6IFQpOiBQcm9taXNlPFQ+IHtcblx0XHRjb25zdCBpbnN0YW5jZVR5cGUgPSBkb3duY2FzdDxFbnRpdHk+KGRlY3J5cHRlZEluc3RhbmNlKS5fdHlwZVxuXG5cdFx0aWYgKGlzU2FtZVR5cGVSZWYoaW5zdGFuY2VUeXBlLCBDb250YWN0VHlwZVJlZikpIHtcblx0XHRcdGNvbnN0IGNvbnRhY3QgPSBkb3duY2FzdDxDb250YWN0PihkZWNyeXB0ZWRJbnN0YW5jZSlcblxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0aWYgKCFjb250YWN0LmJpcnRoZGF5SXNvICYmIGNvbnRhY3Qub2xkQmlydGhkYXlBZ2dyZWdhdGUpIHtcblx0XHRcdFx0XHRjb250YWN0LmJpcnRoZGF5SXNvID0gYmlydGhkYXlUb0lzb0RhdGUoY29udGFjdC5vbGRCaXJ0aGRheUFnZ3JlZ2F0ZSlcblx0XHRcdFx0XHRjb250YWN0Lm9sZEJpcnRoZGF5QWdncmVnYXRlID0gbnVsbFxuXHRcdFx0XHRcdGNvbnRhY3Qub2xkQmlydGhkYXlEYXRlID0gbnVsbFxuXHRcdFx0XHRcdGF3YWl0IHRoaXMuZW50aXR5Q2xpZW50LnVwZGF0ZShjb250YWN0KVxuXHRcdFx0XHR9IGVsc2UgaWYgKCFjb250YWN0LmJpcnRoZGF5SXNvICYmIGNvbnRhY3Qub2xkQmlydGhkYXlEYXRlKSB7XG5cdFx0XHRcdFx0Y29udGFjdC5iaXJ0aGRheUlzbyA9IGJpcnRoZGF5VG9Jc29EYXRlKG9sZEJpcnRoZGF5VG9CaXJ0aGRheShjb250YWN0Lm9sZEJpcnRoZGF5RGF0ZSkpXG5cdFx0XHRcdFx0Y29udGFjdC5vbGRCaXJ0aGRheURhdGUgPSBudWxsXG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5lbnRpdHlDbGllbnQudXBkYXRlKGNvbnRhY3QpXG5cdFx0XHRcdH0gZWxzZSBpZiAoY29udGFjdC5iaXJ0aGRheUlzbyAmJiAoY29udGFjdC5vbGRCaXJ0aGRheUFnZ3JlZ2F0ZSB8fCBjb250YWN0Lm9sZEJpcnRoZGF5RGF0ZSkpIHtcblx0XHRcdFx0XHRjb250YWN0Lm9sZEJpcnRoZGF5QWdncmVnYXRlID0gbnVsbFxuXHRcdFx0XHRcdGNvbnRhY3Qub2xkQmlydGhkYXlEYXRlID0gbnVsbFxuXHRcdFx0XHRcdGF3YWl0IHRoaXMuZW50aXR5Q2xpZW50LnVwZGF0ZShjb250YWN0KVxuXHRcdFx0XHR9XG5cdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdGlmICghKGUgaW5zdGFuY2VvZiBMb2NrZWRFcnJvcikpIHtcblx0XHRcdFx0XHR0aHJvdyBlXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gZGVjcnlwdGVkSW5zdGFuY2Vcblx0fVxuXG5cdGFzeW5jIHJlc29sdmVTZXNzaW9uS2V5Rm9ySW5zdGFuY2UoaW5zdGFuY2U6IFNvbWVFbnRpdHkpOiBQcm9taXNlPEFlc0tleSB8IG51bGw+IHtcblx0XHRjb25zdCB0eXBlTW9kZWwgPSBhd2FpdCByZXNvbHZlVHlwZVJlZmVyZW5jZShpbnN0YW5jZS5fdHlwZSlcblx0XHRyZXR1cm4gdGhpcy5yZXNvbHZlU2Vzc2lvbktleSh0eXBlTW9kZWwsIGluc3RhbmNlKVxuXHR9XG5cblx0LyoqIEhlbHBlciBmb3IgdGhlIHJhcmUgY2FzZXMgd2hlbiB3ZSBuZWVkZWQgaXQgb24gdGhlIGNsaWVudCBzaWRlLiAqL1xuXHRhc3luYyByZXNvbHZlU2Vzc2lvbktleUZvckluc3RhbmNlQmluYXJ5KGluc3RhbmNlOiBTb21lRW50aXR5KTogUHJvbWlzZTxVaW50OEFycmF5IHwgbnVsbD4ge1xuXHRcdGNvbnN0IGtleSA9IGF3YWl0IHRoaXMucmVzb2x2ZVNlc3Npb25LZXlGb3JJbnN0YW5jZShpbnN0YW5jZSlcblx0XHRyZXR1cm4ga2V5ID09IG51bGwgPyBudWxsIDogYml0QXJyYXlUb1VpbnQ4QXJyYXkoa2V5KVxuXHR9XG5cblx0LyoqIFJlc29sdmUgYSBzZXNzaW9uIGtleSBhbiB7QHBhcmFtIGluc3RhbmNlfSB1c2luZyBhbiBhbHJlYWR5IGtub3duIHtAcGFyYW0gb3duZXJLZXl9LiAqL1xuXHRyZXNvbHZlU2Vzc2lvbktleVdpdGhPd25lcktleShpbnN0YW5jZTogUmVjb3JkPHN0cmluZywgYW55Piwgb3duZXJLZXk6IEFlc0tleSk6IEFlc0tleSB7XG5cdFx0bGV0IGtleTogVWludDhBcnJheSB8IHN0cmluZyA9IGluc3RhbmNlLl9vd25lckVuY1Nlc3Npb25LZXlcblx0XHRpZiAodHlwZW9mIGtleSA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0a2V5ID0gYmFzZTY0VG9VaW50OEFycmF5KGtleSlcblx0XHR9XG5cblx0XHRyZXR1cm4gZGVjcnlwdEtleShvd25lcktleSwga2V5KVxuXHR9XG5cblx0YXN5bmMgZGVjcnlwdFNlc3Npb25LZXkoaW5zdGFuY2U6IFJlY29yZDxzdHJpbmcsIGFueT4sIG93bmVyRW5jU2Vzc2lvbktleTogVmVyc2lvbmVkRW5jcnlwdGVkS2V5KTogUHJvbWlzZTxBZXNLZXk+IHtcblx0XHRjb25zdCBnayA9IGF3YWl0IHRoaXMua2V5TG9hZGVyRmFjYWRlLmxvYWRTeW1Hcm91cEtleShpbnN0YW5jZS5fb3duZXJHcm91cCwgb3duZXJFbmNTZXNzaW9uS2V5LmVuY3J5cHRpbmdLZXlWZXJzaW9uKVxuXHRcdHJldHVybiBkZWNyeXB0S2V5KGdrLCBvd25lckVuY1Nlc3Npb25LZXkua2V5KVxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIHNlc3Npb24ga2V5IGZvciB0aGUgcHJvdmlkZWQgdHlwZS9pbnN0YW5jZTpcblx0ICogKiBudWxsLCBpZiB0aGUgaW5zdGFuY2UgaXMgdW5lbmNyeXB0ZWRcblx0ICogKiB0aGUgZGVjcnlwdGVkIF9vd25lckVuY1Nlc3Npb25LZXksIGlmIGl0IGlzIGF2YWlsYWJsZVxuXHQgKiAqIHRoZSBwdWJsaWMgZGVjcnlwdGVkIHNlc3Npb24ga2V5LCBvdGhlcndpc2Vcblx0ICpcblx0ICogQHBhcmFtIHR5cGVNb2RlbCB0aGUgdHlwZSBtb2RlbCBvZiB0aGUgaW5zdGFuY2Vcblx0ICogQHBhcmFtIGluc3RhbmNlIFRoZSB1bmVuY3J5cHRlZCAoY2xpZW50LXNpZGUpIGluc3RhbmNlIG9yIGVuY3J5cHRlZCAoc2VydmVyLXNpZGUpIG9iamVjdCBsaXRlcmFsXG5cdCAqL1xuXHRhc3luYyByZXNvbHZlU2Vzc2lvbktleSh0eXBlTW9kZWw6IFR5cGVNb2RlbCwgaW5zdGFuY2U6IFJlY29yZDxzdHJpbmcsIGFueT4pOiBQcm9taXNlPEFlc0tleSB8IG51bGw+IHtcblx0XHR0cnkge1xuXHRcdFx0aWYgKCF0eXBlTW9kZWwuZW5jcnlwdGVkKSB7XG5cdFx0XHRcdHJldHVybiBudWxsXG5cdFx0XHR9XG5cdFx0XHRpZiAoaW5zdGFuY2UuYnVja2V0S2V5KSB7XG5cdFx0XHRcdC8vIGlmIHdlIGhhdmUgYSBidWNrZXQga2V5LCB0aGVuIHdlIG5lZWQgdG8gY2FjaGUgdGhlIHNlc3Npb24ga2V5cyBzdG9yZWQgaW4gdGhlIGJ1Y2tldCBrZXkgZm9yIGRldGFpbHMsIGZpbGVzLCBldGMuXG5cdFx0XHRcdC8vIHdlIG5lZWQgdG8gZG8gdGhpcyBCRUZPUkUgd2UgY2hlY2sgdGhlIG93bmVyIGVuYyBzZXNzaW9uIGtleVxuXHRcdFx0XHRjb25zdCBidWNrZXRLZXkgPSBhd2FpdCB0aGlzLmNvbnZlcnRCdWNrZXRLZXlUb0luc3RhbmNlSWZOZWNlc3NhcnkoaW5zdGFuY2UuYnVja2V0S2V5KVxuXHRcdFx0XHRjb25zdCByZXNvbHZlZFNlc3Npb25LZXlzID0gYXdhaXQgdGhpcy5yZXNvbHZlV2l0aEJ1Y2tldEtleShidWNrZXRLZXksIGluc3RhbmNlLCB0eXBlTW9kZWwpXG5cdFx0XHRcdHJldHVybiByZXNvbHZlZFNlc3Npb25LZXlzLnJlc29sdmVkU2Vzc2lvbktleUZvckluc3RhbmNlXG5cdFx0XHR9IGVsc2UgaWYgKGluc3RhbmNlLl9vd25lckVuY1Nlc3Npb25LZXkgJiYgdGhpcy51c2VyRmFjYWRlLmlzRnVsbHlMb2dnZWRJbigpICYmIHRoaXMudXNlckZhY2FkZS5oYXNHcm91cChpbnN0YW5jZS5fb3duZXJHcm91cCkpIHtcblx0XHRcdFx0Y29uc3QgZ2sgPSBhd2FpdCB0aGlzLmtleUxvYWRlckZhY2FkZS5sb2FkU3ltR3JvdXBLZXkoaW5zdGFuY2UuX293bmVyR3JvdXAsIHBhcnNlS2V5VmVyc2lvbihpbnN0YW5jZS5fb3duZXJLZXlWZXJzaW9uID8/IFwiMFwiKSlcblx0XHRcdFx0cmV0dXJuIHRoaXMucmVzb2x2ZVNlc3Npb25LZXlXaXRoT3duZXJLZXkoaW5zdGFuY2UsIGdrKVxuXHRcdFx0fSBlbHNlIGlmIChpbnN0YW5jZS5vd25lckVuY1Nlc3Npb25LZXkpIHtcblx0XHRcdFx0Ly8gTGlrZWx5IGEgRGF0YVRyYW5zZmVyVHlwZSwgc28gdGhpcyBpcyBhIHNlcnZpY2UuXG5cdFx0XHRcdGNvbnN0IGdrID0gYXdhaXQgdGhpcy5rZXlMb2FkZXJGYWNhZGUubG9hZFN5bUdyb3VwS2V5KFxuXHRcdFx0XHRcdHRoaXMudXNlckZhY2FkZS5nZXRHcm91cElkKEdyb3VwVHlwZS5NYWlsKSxcblx0XHRcdFx0XHRwYXJzZUtleVZlcnNpb24oaW5zdGFuY2Uub3duZXJLZXlWZXJzaW9uID8/IFwiMFwiKSxcblx0XHRcdFx0KVxuXHRcdFx0XHRyZXR1cm4gdGhpcy5yZXNvbHZlU2Vzc2lvbktleVdpdGhPd25lcktleShpbnN0YW5jZSwgZ2spXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBTZWUgUGVybWlzc2lvblR5cGUganNkb2MgZm9yIG1vcmUgaW5mbyBvbiBwZXJtaXNzaW9uc1xuXHRcdFx0XHRjb25zdCBwZXJtaXNzaW9ucyA9IGF3YWl0IHRoaXMuZW50aXR5Q2xpZW50LmxvYWRBbGwoUGVybWlzc2lvblR5cGVSZWYsIGluc3RhbmNlLl9wZXJtaXNzaW9ucylcblx0XHRcdFx0cmV0dXJuIChhd2FpdCB0aGlzLnRyeVN5bW1ldHJpY1Blcm1pc3Npb24ocGVybWlzc2lvbnMpKSA/PyAoYXdhaXQgdGhpcy5yZXNvbHZlV2l0aFB1YmxpY09yRXh0ZXJuYWxQZXJtaXNzaW9uKHBlcm1pc3Npb25zLCBpbnN0YW5jZSwgdHlwZU1vZGVsKSlcblx0XHRcdH1cblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRpZiAoZSBpbnN0YW5jZW9mIENyeXB0b0Vycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiZmFpbGVkIHRvIHJlc29sdmUgc2Vzc2lvbiBrZXlcIiwgZSlcblx0XHRcdFx0dGhyb3cgbmV3IFNlc3Npb25LZXlOb3RGb3VuZEVycm9yKFwiQ3J5cHRvIGVycm9yIHdoaWxlIHJlc29sdmluZyBzZXNzaW9uIGtleSBmb3IgaW5zdGFuY2UgXCIgKyBpbnN0YW5jZS5faWQpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBlXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFRha2VzIGEgZnJlc2hseSBKU09OLXBhcnNlZCwgdW5tYXBwZWQgb2JqZWN0IGFuZCBhcHBseSBtaWdyYXRpb25zIGFzIG5lY2Vzc2FyeVxuXHQgKiBAcGFyYW0gdHlwZVJlZlxuXHQgKiBAcGFyYW0gZGF0YVxuXHQgKiBAcmV0dXJuIHRoZSB1bm1hcHBlZCBhbmQgc3RpbGwgZW5jcnlwdGVkIGluc3RhbmNlXG5cdCAqL1xuXHRhc3luYyBhcHBseU1pZ3JhdGlvbnM8VCBleHRlbmRzIFNvbWVFbnRpdHk+KHR5cGVSZWY6IFR5cGVSZWY8VD4sIGRhdGE6IFJlY29yZDxzdHJpbmcsIGFueT4pOiBQcm9taXNlPFJlY29yZDxzdHJpbmcsIGFueT4+IHtcblx0XHRpZiAoaXNTYW1lVHlwZVJlZih0eXBlUmVmLCBHcm91cEluZm9UeXBlUmVmKSAmJiBkYXRhLl9vd25lckdyb3VwID09IG51bGwpIHtcblx0XHRcdHJldHVybiB0aGlzLmFwcGx5Q3VzdG9tZXJHcm91cE93bmVyc2hpcFRvR3JvdXBJbmZvKGRhdGEpXG5cdFx0fSBlbHNlIGlmIChpc1NhbWVUeXBlUmVmKHR5cGVSZWYsIFR1dGFub3RhUHJvcGVydGllc1R5cGVSZWYpICYmIGRhdGEuX293bmVyRW5jU2Vzc2lvbktleSA9PSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5lbmNyeXB0VHV0YW5vdGFQcm9wZXJ0aWVzKGRhdGEpXG5cdFx0fSBlbHNlIGlmIChpc1NhbWVUeXBlUmVmKHR5cGVSZWYsIFB1c2hJZGVudGlmaWVyVHlwZVJlZikgJiYgZGF0YS5fb3duZXJFbmNTZXNzaW9uS2V5ID09IG51bGwpIHtcblx0XHRcdHJldHVybiB0aGlzLmFkZFNlc3Npb25LZXlUb1B1c2hJZGVudGlmaWVyKGRhdGEpXG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBkYXRhXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEluIGNhc2UgdGhlIGdpdmVuIGJ1Y2tldEtleSBpcyBhIGxpdGVyYWwgdGhlIGxpdGVyYWwgd2lsbCBiZSBjb252ZXJ0ZWQgdG8gYW4gaW5zdGFuY2UgYW5kIHJldHVybi4gSW4gY2FzZSB0aGUgQnVja2V0S2V5IGlzIGFscmVhZHkgYW4gaW5zdGFuY2UgdGhlXG5cdCAqIGluc3RhbmNlIGlzIHJldHVybmVkLlxuXHQgKiBAcGFyYW0gYnVja2V0S2V5SW5zdGFuY2VPckxpdGVyYWwgVGhlIGJ1Y2tldCBrZXkgYXMgbGl0ZXJhbCBvciBpbnN0YW5jZVxuXHQgKi9cblx0YXN5bmMgY29udmVydEJ1Y2tldEtleVRvSW5zdGFuY2VJZk5lY2Vzc2FyeShidWNrZXRLZXlJbnN0YW5jZU9yTGl0ZXJhbDogUmVjb3JkPHN0cmluZywgYW55Pik6IFByb21pc2U8QnVja2V0S2V5PiB7XG5cdFx0aWYgKHRoaXMuaXNMaXRlcmFsSW5zdGFuY2UoYnVja2V0S2V5SW5zdGFuY2VPckxpdGVyYWwpKSB7XG5cdFx0XHQvLyBkZWNyeXB0QW5kTWFwVG9JbnN0YW5jZSBpcyBtaXNsZWFkaW5nIGhlcmUgKGl0J3Mgbm90IGdvaW5nIHRvIGJlIGRlY3J5cHRlZCksIGJ1dCB3ZSB3YW50IHRvIG1hcCB0aGUgQnVja2V0S2V5IGFnZ3JlZ2F0ZSBhbmQgaXRzIHNlc3Npb24ga2V5IGZyb21cblx0XHRcdC8vIGEgbGl0ZXJhbCB0byBhbiBpbnN0YW5jZSB0byBoYXZlIHRoZSBlbmNyeXB0ZWQga2V5cyBpbiBiaW5hcnkgZm9ybWF0IGFuZCBub3QgYXMgYmFzZSA2NC4gVGhlcmUgaXMgYWN0dWFsbHkgbm8gZGVjcnlwdGlvbiBvbmdvaW5nLCBqdXN0XG5cdFx0XHQvLyBtYXBUb0luc3RhbmNlLlxuXHRcdFx0Y29uc3QgYnVja2V0S2V5VHlwZU1vZGVsID0gYXdhaXQgcmVzb2x2ZVR5cGVSZWZlcmVuY2UoQnVja2V0S2V5VHlwZVJlZilcblx0XHRcdHJldHVybiAoYXdhaXQgdGhpcy5pbnN0YW5jZU1hcHBlci5kZWNyeXB0QW5kTWFwVG9JbnN0YW5jZShidWNrZXRLZXlUeXBlTW9kZWwsIGJ1Y2tldEtleUluc3RhbmNlT3JMaXRlcmFsLCBudWxsKSkgYXMgQnVja2V0S2V5XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGJ1Y2tldCBrZXkgd2FzIGFscmVhZHkgZGVjb2RlZFxuXHRcdFx0cmV0dXJuIGJ1Y2tldEtleUluc3RhbmNlT3JMaXRlcmFsIGFzIEJ1Y2tldEtleVxuXHRcdH1cblx0fVxuXG5cdHB1YmxpYyBhc3luYyByZXNvbHZlV2l0aEJ1Y2tldEtleShidWNrZXRLZXk6IEJ1Y2tldEtleSwgaW5zdGFuY2U6IFJlY29yZDxzdHJpbmcsIGFueT4sIHR5cGVNb2RlbDogVHlwZU1vZGVsKTogUHJvbWlzZTxSZXNvbHZlZFNlc3Npb25LZXlzPiB7XG5cdFx0Y29uc3QgaW5zdGFuY2VFbGVtZW50SWQgPSB0aGlzLmdldEVsZW1lbnRJZEZyb21JbnN0YW5jZShpbnN0YW5jZSlcblx0XHRsZXQgZGVjcnlwdGVkQnVja2V0S2V5OiBBZXNLZXlcblx0XHRsZXQgdW5lbmNyeXB0ZWRTZW5kZXJBdXRoU3RhdHVzOiBFbmNyeXB0aW9uQXV0aFN0YXR1cyB8IG51bGwgPSBudWxsXG5cdFx0bGV0IHBxTWVzc2FnZVNlbmRlcktleTogRWNjUHVibGljS2V5IHwgbnVsbCA9IG51bGxcblx0XHRpZiAoYnVja2V0S2V5LmtleUdyb3VwICYmIGJ1Y2tldEtleS5wdWJFbmNCdWNrZXRLZXkpIHtcblx0XHRcdC8vIGJ1Y2tldCBrZXkgaXMgZW5jcnlwdGVkIHdpdGggcHVibGljIGtleSBmb3IgaW50ZXJuYWwgcmVjaXBpZW50XG5cdFx0XHRjb25zdCB7IGRlY3J5cHRlZEFlc0tleSwgc2VuZGVySWRlbnRpdHlQdWJLZXkgfSA9IGF3YWl0IHRoaXMuYXN5bW1ldHJpY0NyeXB0b0ZhY2FkZS5sb2FkS2V5UGFpckFuZERlY3J5cHRTeW1LZXkoXG5cdFx0XHRcdGJ1Y2tldEtleS5rZXlHcm91cCxcblx0XHRcdFx0cGFyc2VLZXlWZXJzaW9uKGJ1Y2tldEtleS5yZWNpcGllbnRLZXlWZXJzaW9uKSxcblx0XHRcdFx0YXNDcnlwdG9Qcm90b29jb2xWZXJzaW9uKGJ1Y2tldEtleS5wcm90b2NvbFZlcnNpb24pLFxuXHRcdFx0XHRidWNrZXRLZXkucHViRW5jQnVja2V0S2V5LFxuXHRcdFx0KVxuXHRcdFx0ZGVjcnlwdGVkQnVja2V0S2V5ID0gZGVjcnlwdGVkQWVzS2V5XG5cdFx0XHRwcU1lc3NhZ2VTZW5kZXJLZXkgPSBzZW5kZXJJZGVudGl0eVB1YktleVxuXHRcdH0gZWxzZSBpZiAoYnVja2V0S2V5Lmdyb3VwRW5jQnVja2V0S2V5KSB7XG5cdFx0XHQvLyByZWNlaXZlZCBhcyBzZWN1cmUgZXh0ZXJuYWwgcmVjaXBpZW50IG9yIHJlcGx5IGZyb20gc2VjdXJlIGV4dGVybmFsIHNlbmRlclxuXHRcdFx0bGV0IGtleUdyb3VwXG5cdFx0XHRjb25zdCBncm91cEtleVZlcnNpb24gPSBwYXJzZUtleVZlcnNpb24oYnVja2V0S2V5LnJlY2lwaWVudEtleVZlcnNpb24pXG5cdFx0XHRpZiAoYnVja2V0S2V5LmtleUdyb3VwKSB7XG5cdFx0XHRcdC8vIDEuIFVzZXMgd2hlbiByZWNlaXZpbmcgY29uZmlkZW50aWFsIHJlcGxpZXMgZnJvbSBleHRlcm5hbCB1c2Vycy5cblx0XHRcdFx0Ly8gMi4gbGVnYWN5IGNvZGUgcGF0aCBmb3Igb2xkIGV4dGVybmFsIGNsaWVudHMgdGhhdCB1c2VkIHRvIGVuY3J5cHQgYnVja2V0IGtleXMgd2l0aCB1c2VyIGdyb3VwIGtleXMuXG5cdFx0XHRcdGtleUdyb3VwID0gYnVja2V0S2V5LmtleUdyb3VwXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBieSBkZWZhdWx0LCB3ZSB0cnkgdG8gZGVjcnlwdCB0aGUgYnVja2V0IGtleSB3aXRoIHRoZSBvd25lckdyb3VwS2V5IChlLmcuIHNlY3VyZSBleHRlcm5hbCByZWNpcGllbnQpXG5cdFx0XHRcdGtleUdyb3VwID0gbmV2ZXJOdWxsKGluc3RhbmNlLl9vd25lckdyb3VwKVxuXHRcdFx0fVxuXG5cdFx0XHRkZWNyeXB0ZWRCdWNrZXRLZXkgPSBhd2FpdCB0aGlzLnJlc29sdmVXaXRoR3JvdXBSZWZlcmVuY2Uoa2V5R3JvdXAsIGdyb3VwS2V5VmVyc2lvbiwgYnVja2V0S2V5Lmdyb3VwRW5jQnVja2V0S2V5KVxuXHRcdFx0dW5lbmNyeXB0ZWRTZW5kZXJBdXRoU3RhdHVzID0gRW5jcnlwdGlvbkF1dGhTdGF0dXMuQUVTX05PX0FVVEhFTlRJQ0FUSU9OXG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBTZXNzaW9uS2V5Tm90Rm91bmRFcnJvcihgZW5jcnlwdGVkIGJ1Y2tldCBrZXkgbm90IHNldCBvbiBpbnN0YW5jZSAke3R5cGVNb2RlbC5uYW1lfWApXG5cdFx0fVxuXHRcdGNvbnN0IHJlc29sdmVkU2Vzc2lvbktleXMgPSBhd2FpdCB0aGlzLmNvbGxlY3RBbGxJbnN0YW5jZVNlc3Npb25LZXlzQW5kQXV0aGVudGljYXRlKFxuXHRcdFx0YnVja2V0S2V5LFxuXHRcdFx0ZGVjcnlwdGVkQnVja2V0S2V5LFxuXHRcdFx0aW5zdGFuY2VFbGVtZW50SWQsXG5cdFx0XHRpbnN0YW5jZSxcblx0XHRcdHR5cGVNb2RlbCxcblx0XHRcdHVuZW5jcnlwdGVkU2VuZGVyQXV0aFN0YXR1cyxcblx0XHRcdHBxTWVzc2FnZVNlbmRlcktleSxcblx0XHQpXG5cblx0XHRhd2FpdCB0aGlzLm93bmVyRW5jU2Vzc2lvbktleXNVcGRhdGVRdWV1ZS51cGRhdGVJbnN0YW5jZVNlc3Npb25LZXlzKHJlc29sdmVkU2Vzc2lvbktleXMuaW5zdGFuY2VTZXNzaW9uS2V5cywgdHlwZU1vZGVsKVxuXG5cdFx0Ly8gZm9yIHN5bW1ldHJpY2FsbHkgZW5jcnlwdGVkIGluc3RhbmNlcyBfb3duZXJFbmNTZXNzaW9uS2V5IGlzIHNlbnQgZnJvbSB0aGUgc2VydmVyLlxuXHRcdC8vIGluIHRoaXMgY2FzZSBpdCBpcyBub3QgeWV0IGFuZCB3ZSBuZWVkIHRvIHNldCBpdCBiZWNhdXNlIHRoZSByZXN0IG9mIHRoZSBhcHAgZXhwZWN0cyBpdC5cblx0XHRjb25zdCBncm91cEtleSA9IGF3YWl0IHRoaXMua2V5TG9hZGVyRmFjYWRlLmdldEN1cnJlbnRTeW1Hcm91cEtleShpbnN0YW5jZS5fb3duZXJHcm91cCkgLy8gZ2V0IGN1cnJlbnQga2V5IGZvciBlbmNyeXB0aW5nXG5cdFx0dGhpcy5zZXRPd25lckVuY1Nlc3Npb25LZXlVbm1hcHBlZChcblx0XHRcdGluc3RhbmNlIGFzIFVubWFwcGVkT3duZXJHcm91cEluc3RhbmNlLFxuXHRcdFx0ZW5jcnlwdEtleVdpdGhWZXJzaW9uZWRLZXkoZ3JvdXBLZXksIHJlc29sdmVkU2Vzc2lvbktleXMucmVzb2x2ZWRTZXNzaW9uS2V5Rm9ySW5zdGFuY2UpLFxuXHRcdClcblx0XHRyZXR1cm4gcmVzb2x2ZWRTZXNzaW9uS2V5c1xuXHR9XG5cblx0LyoqXG5cdCAqIENhbGN1bGF0ZXMgdGhlIFNIQS0yNTYgY2hlY2tzdW0gb2YgYSBzdHJpbmcgdmFsdWUgYXMgVVRGLTggYnl0ZXMgYW5kIHJldHVybnMgaXQgYXMgYSBiYXNlNjQtZW5jb2RlZCBzdHJpbmdcblx0ICovXG5cdHB1YmxpYyBhc3luYyBzaGEyNTYodmFsdWU6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG5cdFx0cmV0dXJuIHVpbnQ4QXJyYXlUb0Jhc2U2NChzaGEyNTZIYXNoKHN0cmluZ1RvVXRmOFVpbnQ4QXJyYXkodmFsdWUpKSlcblx0fVxuXG5cdC8qKlxuXHQgKiBEZWNyeXB0cyB0aGUgZ2l2ZW4gZW5jcnlwdGVkIGJ1Y2tldCBrZXkgd2l0aCB0aGUgZ3JvdXAga2V5IG9mIHRoZSBnaXZlbiBncm91cC4gSW4gY2FzZSB0aGUgY3VycmVudCB1c2VyIGlzIG5vdFxuXHQgKiBtZW1iZXIgb2YgdGhlIGtleSBncm91cCB0aGUgZnVuY3Rpb24gdHJpZXMgdG8gcmVzb2x2ZSB0aGUgZ3JvdXAga2V5IHVzaW5nIHRoZSBhZG1pbkVuY0dyb3VwS2V5LlxuXHQgKiBUaGlzIGlzIG5lY2Vzc2FyeSBmb3IgcmVzb2x2aW5nIHRoZSBCdWNrZXRLZXkgd2hlbiByZWNlaXZpbmcgYSByZXBseSBmcm9tIGFuIGV4dGVybmFsIE1haWxib3guXG5cdCAqIEBwYXJhbSBrZXlHcm91cCBUaGUgZ3JvdXAgdGhhdCBob2xkcyB0aGUgZW5jcnlwdGlvbiBrZXkuXG5cdCAqIEBwYXJhbSBncm91cEtleVZlcnNpb24gdGhlIHZlcnNpb24gb2YgdGhlIGtleSBmcm9tIHRoZSBrZXlHcm91cFxuXHQgKiBAcGFyYW0gZ3JvdXBFbmNCdWNrZXRLZXkgVGhlIGdyb3VwIGtleSBlbmNyeXB0ZWQgYnVja2V0IGtleS5cblx0ICovXG5cdHByaXZhdGUgYXN5bmMgcmVzb2x2ZVdpdGhHcm91cFJlZmVyZW5jZShrZXlHcm91cDogSWQsIGdyb3VwS2V5VmVyc2lvbjogS2V5VmVyc2lvbiwgZ3JvdXBFbmNCdWNrZXRLZXk6IFVpbnQ4QXJyYXkpOiBQcm9taXNlPEFlc0tleT4ge1xuXHRcdGlmICh0aGlzLnVzZXJGYWNhZGUuaGFzR3JvdXAoa2V5R3JvdXApKSB7XG5cdFx0XHQvLyB0aGUgbG9nZ2VkLWluIHVzZXIgKG1vc3QgbGlrZWx5IGV4dGVybmFsKSBpcyBhIG1lbWJlciBvZiB0aGF0IGdyb3VwLiBUaGVuIHdlIGhhdmUgdGhlIGdyb3VwIGtleSBmcm9tIHRoZSBtZW1iZXJzaGlwc1xuXHRcdFx0Y29uc3QgZ3JvdXBLZXkgPSBhd2FpdCB0aGlzLmtleUxvYWRlckZhY2FkZS5sb2FkU3ltR3JvdXBLZXkoa2V5R3JvdXAsIGdyb3VwS2V5VmVyc2lvbilcblx0XHRcdHJldHVybiBkZWNyeXB0S2V5KGdyb3VwS2V5LCBncm91cEVuY0J1Y2tldEtleSlcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gaW50ZXJuYWwgdXNlciByZWNlaXZpbmcgYSBtYWlsIGZyb20gc2VjdXJlIGV4dGVybmFsOlxuXHRcdFx0Ly8gaW50ZXJuYWwgdXNlciBncm91cCBrZXkgLT4gZXh0ZXJuYWwgdXNlciBncm91cCBrZXkgLT4gZXh0ZXJuYWwgbWFpbCBncm91cCBrZXkgLT4gYnVja2V0IGtleVxuXHRcdFx0Y29uc3QgZXh0ZXJuYWxNYWlsR3JvdXBJZCA9IGtleUdyb3VwXG5cdFx0XHRjb25zdCBleHRlcm5hbE1haWxHcm91cEtleVZlcnNpb24gPSBncm91cEtleVZlcnNpb25cblx0XHRcdGNvbnN0IGV4dGVybmFsTWFpbEdyb3VwID0gYXdhaXQgdGhpcy5lbnRpdHlDbGllbnQubG9hZChHcm91cFR5cGVSZWYsIGV4dGVybmFsTWFpbEdyb3VwSWQpXG5cblx0XHRcdGNvbnN0IGV4dGVybmFsVXNlckdyb3VwZElkID0gZXh0ZXJuYWxNYWlsR3JvdXAuYWRtaW5cblx0XHRcdGlmICghZXh0ZXJuYWxVc2VyR3JvdXBkSWQpIHtcblx0XHRcdFx0dGhyb3cgbmV3IFNlc3Npb25LZXlOb3RGb3VuZEVycm9yKFwibm8gYWRtaW4gZ3JvdXAgb24ga2V5IGdyb3VwOiBcIiArIGV4dGVybmFsTWFpbEdyb3VwSWQpXG5cdFx0XHR9XG5cdFx0XHRjb25zdCBleHRlcm5hbFVzZXJHcm91cEtleVZlcnNpb24gPSBwYXJzZUtleVZlcnNpb24oZXh0ZXJuYWxNYWlsR3JvdXAuYWRtaW5Hcm91cEtleVZlcnNpb24gPz8gXCIwXCIpXG5cdFx0XHRjb25zdCBleHRlcm5hbFVzZXJHcm91cCA9IGF3YWl0IHRoaXMuZW50aXR5Q2xpZW50LmxvYWQoR3JvdXBUeXBlUmVmLCBleHRlcm5hbFVzZXJHcm91cGRJZClcblxuXHRcdFx0Y29uc3QgaW50ZXJuYWxVc2VyR3JvdXBJZCA9IGV4dGVybmFsVXNlckdyb3VwLmFkbWluXG5cdFx0XHRjb25zdCBpbnRlcm5hbFVzZXJHcm91cEtleVZlcnNpb24gPSBwYXJzZUtleVZlcnNpb24oZXh0ZXJuYWxVc2VyR3JvdXAuYWRtaW5Hcm91cEtleVZlcnNpb24gPz8gXCIwXCIpXG5cdFx0XHRpZiAoIShpbnRlcm5hbFVzZXJHcm91cElkICYmIHRoaXMudXNlckZhY2FkZS5oYXNHcm91cChpbnRlcm5hbFVzZXJHcm91cElkKSkpIHtcblx0XHRcdFx0dGhyb3cgbmV3IFNlc3Npb25LZXlOb3RGb3VuZEVycm9yKFwibm8gYWRtaW4gZ3JvdXAgb3Igbm8gbWVtYmVyc2hpcCBvZiBhZG1pbiBncm91cDogXCIgKyBpbnRlcm5hbFVzZXJHcm91cElkKVxuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBpbnRlcm5hbFVzZXJHcm91cEtleSA9IGF3YWl0IHRoaXMua2V5TG9hZGVyRmFjYWRlLmxvYWRTeW1Hcm91cEtleShpbnRlcm5hbFVzZXJHcm91cElkLCBpbnRlcm5hbFVzZXJHcm91cEtleVZlcnNpb24pXG5cblx0XHRcdGNvbnN0IGN1cnJlbnRFeHRlcm5hbFVzZXJHcm91cEtleSA9IGRlY3J5cHRLZXkoaW50ZXJuYWxVc2VyR3JvdXBLZXksIGFzc2VydE5vdE51bGwoZXh0ZXJuYWxVc2VyR3JvdXAuYWRtaW5Hcm91cEVuY0dLZXkpKVxuXHRcdFx0Y29uc3QgZXh0ZXJuYWxVc2VyR3JvdXBLZXkgPSBhd2FpdCB0aGlzLmtleUxvYWRlckZhY2FkZS5sb2FkU3ltR3JvdXBLZXkoZXh0ZXJuYWxVc2VyR3JvdXBkSWQsIGV4dGVybmFsVXNlckdyb3VwS2V5VmVyc2lvbiwge1xuXHRcdFx0XHRvYmplY3Q6IGN1cnJlbnRFeHRlcm5hbFVzZXJHcm91cEtleSxcblx0XHRcdFx0dmVyc2lvbjogcGFyc2VLZXlWZXJzaW9uKGV4dGVybmFsVXNlckdyb3VwLmdyb3VwS2V5VmVyc2lvbiksXG5cdFx0XHR9KVxuXG5cdFx0XHRjb25zdCBjdXJyZW50RXh0ZXJuYWxNYWlsR3JvdXBLZXkgPSBkZWNyeXB0S2V5KGV4dGVybmFsVXNlckdyb3VwS2V5LCBhc3NlcnROb3ROdWxsKGV4dGVybmFsTWFpbEdyb3VwLmFkbWluR3JvdXBFbmNHS2V5KSlcblx0XHRcdGNvbnN0IGV4dGVybmFsTWFpbEdyb3VwS2V5ID0gYXdhaXQgdGhpcy5rZXlMb2FkZXJGYWNhZGUubG9hZFN5bUdyb3VwS2V5KGV4dGVybmFsTWFpbEdyb3VwSWQsIGV4dGVybmFsTWFpbEdyb3VwS2V5VmVyc2lvbiwge1xuXHRcdFx0XHRvYmplY3Q6IGN1cnJlbnRFeHRlcm5hbE1haWxHcm91cEtleSxcblx0XHRcdFx0dmVyc2lvbjogcGFyc2VLZXlWZXJzaW9uKGV4dGVybmFsTWFpbEdyb3VwLmdyb3VwS2V5VmVyc2lvbiksXG5cdFx0XHR9KVxuXG5cdFx0XHRyZXR1cm4gZGVjcnlwdEtleShleHRlcm5hbE1haWxHcm91cEtleSwgZ3JvdXBFbmNCdWNrZXRLZXkpXG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBhZGRTZXNzaW9uS2V5VG9QdXNoSWRlbnRpZmllcihkYXRhOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogUHJvbWlzZTxSZWNvcmQ8c3RyaW5nLCBhbnk+PiB7XG5cdFx0Y29uc3QgdXNlckdyb3VwS2V5ID0gdGhpcy51c2VyRmFjYWRlLmdldEN1cnJlbnRVc2VyR3JvdXBLZXkoKVxuXG5cdFx0Ly8gc2V0IHNlc3Npb25LZXkgZm9yIGFsbG93aW5nIGVuY3J5cHRpb24gd2hlbiBvbGQgaW5zdGFuY2UgKDwgdjQzKSBpcyB1cGRhdGVkXG5cdFx0Y29uc3QgdHlwZU1vZGVsID0gYXdhaXQgcmVzb2x2ZVR5cGVSZWZlcmVuY2UoUHVzaElkZW50aWZpZXJUeXBlUmVmKVxuXHRcdGF3YWl0IHRoaXMudXBkYXRlT3duZXJFbmNTZXNzaW9uS2V5KHR5cGVNb2RlbCwgZGF0YSwgdXNlckdyb3VwS2V5LCBhZXMyNTZSYW5kb21LZXkoKSlcblx0XHRyZXR1cm4gZGF0YVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBlbmNyeXB0VHV0YW5vdGFQcm9wZXJ0aWVzKGRhdGE6IFJlY29yZDxzdHJpbmcsIGFueT4pOiBQcm9taXNlPFJlY29yZDxzdHJpbmcsIGFueT4+IHtcblx0XHRjb25zdCB1c2VyR3JvdXBLZXkgPSB0aGlzLnVzZXJGYWNhZGUuZ2V0Q3VycmVudFVzZXJHcm91cEtleSgpXG5cblx0XHQvLyBFbmNyeXB0VHV0YW5vdGFQcm9wZXJ0aWVzU2VydmljZSBjb3VsZCBiZSByZW1vdmVkIGFuZCByZXBsYWNlZCB3aXRoIGEgTWlncmF0aW9uIHRoYXQgd3JpdGVzIHRoZSBrZXlcblx0XHRjb25zdCBncm91cEVuY1Nlc3Npb25LZXkgPSBlbmNyeXB0S2V5V2l0aFZlcnNpb25lZEtleSh1c2VyR3JvdXBLZXksIGFlczI1NlJhbmRvbUtleSgpKVxuXHRcdHRoaXMuc2V0T3duZXJFbmNTZXNzaW9uS2V5VW5tYXBwZWQoZGF0YSBhcyBVbm1hcHBlZE93bmVyR3JvdXBJbnN0YW5jZSwgZ3JvdXBFbmNTZXNzaW9uS2V5LCB0aGlzLnVzZXJGYWNhZGUuZ2V0VXNlckdyb3VwSWQoKSlcblx0XHRjb25zdCBtaWdyYXRpb25EYXRhID0gY3JlYXRlRW5jcnlwdFR1dGFub3RhUHJvcGVydGllc0RhdGEoe1xuXHRcdFx0cHJvcGVydGllczogZGF0YS5faWQsXG5cdFx0XHRzeW1LZXlWZXJzaW9uOiBTdHJpbmcoZ3JvdXBFbmNTZXNzaW9uS2V5LmVuY3J5cHRpbmdLZXlWZXJzaW9uKSxcblx0XHRcdHN5bUVuY1Nlc3Npb25LZXk6IGdyb3VwRW5jU2Vzc2lvbktleS5rZXksXG5cdFx0fSlcblx0XHRhd2FpdCB0aGlzLnNlcnZpY2VFeGVjdXRvci5wb3N0KEVuY3J5cHRUdXRhbm90YVByb3BlcnRpZXNTZXJ2aWNlLCBtaWdyYXRpb25EYXRhKVxuXHRcdHJldHVybiBkYXRhXG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIGFwcGx5Q3VzdG9tZXJHcm91cE93bmVyc2hpcFRvR3JvdXBJbmZvKGRhdGE6IFJlY29yZDxzdHJpbmcsIGFueT4pOiBQcm9taXNlPFJlY29yZDxzdHJpbmcsIGFueT4+IHtcblx0XHRjb25zdCBjdXN0b21lckdyb3VwTWVtYmVyc2hpcCA9IGFzc2VydE5vdE51bGwoXG5cdFx0XHR0aGlzLnVzZXJGYWNhZGUuZ2V0TG9nZ2VkSW5Vc2VyKCkubWVtYmVyc2hpcHMuZmluZCgoZzogR3JvdXBNZW1iZXJzaGlwKSA9PiBnLmdyb3VwVHlwZSA9PT0gR3JvdXBUeXBlLkN1c3RvbWVyKSxcblx0XHQpXG5cdFx0Y29uc3QgbGlzdFBlcm1pc3Npb25zID0gYXdhaXQgdGhpcy5lbnRpdHlDbGllbnQubG9hZEFsbChQZXJtaXNzaW9uVHlwZVJlZiwgZGF0YS5faWRbMF0pXG5cdFx0Y29uc3QgY3VzdG9tZXJHcm91cFBlcm1pc3Npb24gPSBsaXN0UGVybWlzc2lvbnMuZmluZCgocCkgPT4gcC5ncm91cCA9PT0gY3VzdG9tZXJHcm91cE1lbWJlcnNoaXAuZ3JvdXApXG5cblx0XHRpZiAoIWN1c3RvbWVyR3JvdXBQZXJtaXNzaW9uKSB0aHJvdyBuZXcgU2Vzc2lvbktleU5vdEZvdW5kRXJyb3IoXCJQZXJtaXNzaW9uIG5vdCBmb3VuZCwgY291bGQgbm90IGFwcGx5IE93bmVyR3JvdXAgbWlncmF0aW9uXCIpXG5cdFx0Y29uc3QgY3VzdG9tZXJHcm91cEtleVZlcnNpb24gPSBwYXJzZUtleVZlcnNpb24oY3VzdG9tZXJHcm91cFBlcm1pc3Npb24uc3ltS2V5VmVyc2lvbiA/PyBcIjBcIilcblx0XHRjb25zdCBjdXN0b21lckdyb3VwS2V5ID0gYXdhaXQgdGhpcy5rZXlMb2FkZXJGYWNhZGUubG9hZFN5bUdyb3VwS2V5KGN1c3RvbWVyR3JvdXBNZW1iZXJzaGlwLmdyb3VwLCBjdXN0b21lckdyb3VwS2V5VmVyc2lvbilcblx0XHRjb25zdCB2ZXJzaW9uZWRDdXN0b21lckdyb3VwS2V5ID0geyBvYmplY3Q6IGN1c3RvbWVyR3JvdXBLZXksIHZlcnNpb246IGN1c3RvbWVyR3JvdXBLZXlWZXJzaW9uIH1cblx0XHRjb25zdCBsaXN0S2V5ID0gZGVjcnlwdEtleShjdXN0b21lckdyb3VwS2V5LCBhc3NlcnROb3ROdWxsKGN1c3RvbWVyR3JvdXBQZXJtaXNzaW9uLnN5bUVuY1Nlc3Npb25LZXkpKVxuXHRcdGNvbnN0IGdyb3VwSW5mb1NrID0gZGVjcnlwdEtleShsaXN0S2V5LCBiYXNlNjRUb1VpbnQ4QXJyYXkoZGF0YS5fbGlzdEVuY1Nlc3Npb25LZXkpKVxuXG5cdFx0dGhpcy5zZXRPd25lckVuY1Nlc3Npb25LZXlVbm1hcHBlZChcblx0XHRcdGRhdGEgYXMgVW5tYXBwZWRPd25lckdyb3VwSW5zdGFuY2UsXG5cdFx0XHRlbmNyeXB0S2V5V2l0aFZlcnNpb25lZEtleSh2ZXJzaW9uZWRDdXN0b21lckdyb3VwS2V5LCBncm91cEluZm9TayksXG5cdFx0XHRjdXN0b21lckdyb3VwTWVtYmVyc2hpcC5ncm91cCxcblx0XHQpXG5cdFx0cmV0dXJuIGRhdGFcblx0fVxuXG5cdHByaXZhdGUgc2V0T3duZXJFbmNTZXNzaW9uS2V5VW5tYXBwZWQodW5tYXBwZWRJbnN0YW5jZTogVW5tYXBwZWRPd25lckdyb3VwSW5zdGFuY2UsIGtleTogVmVyc2lvbmVkRW5jcnlwdGVkS2V5LCBvd25lckdyb3VwPzogSWQpIHtcblx0XHR1bm1hcHBlZEluc3RhbmNlLl9vd25lckVuY1Nlc3Npb25LZXkgPSB1aW50OEFycmF5VG9CYXNlNjQoa2V5LmtleSlcblx0XHR1bm1hcHBlZEluc3RhbmNlLl9vd25lcktleVZlcnNpb24gPSBrZXkuZW5jcnlwdGluZ0tleVZlcnNpb24udG9TdHJpbmcoKVxuXHRcdGlmIChvd25lckdyb3VwKSB7XG5cdFx0XHR1bm1hcHBlZEluc3RhbmNlLl9vd25lckdyb3VwID0gb3duZXJHcm91cFxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgc2V0T3duZXJFbmNTZXNzaW9uS2V5KGluc3RhbmNlOiBJbnN0YW5jZSwga2V5OiBWZXJzaW9uZWRFbmNyeXB0ZWRLZXkpIHtcblx0XHRpbnN0YW5jZS5fb3duZXJFbmNTZXNzaW9uS2V5ID0ga2V5LmtleVxuXHRcdGluc3RhbmNlLl9vd25lcktleVZlcnNpb24gPSBrZXkuZW5jcnlwdGluZ0tleVZlcnNpb24udG9TdHJpbmcoKVxuXHR9XG5cblx0LyoqXG5cdCAqIEByZXR1cm4gV2hldGhlciB0aGUge0BwYXJhbSBlbGVtZW50T3JMaXRlcmFsfSBpcyBhIHVubWFwcGVkIHR5cGUsIGFzIHVzZWQgaW4gSlNPTiBmb3IgdHJhbnNwb3J0IG9yIGlmIGl0J3MgYSBydW50aW1lIHJlcHJlc2VudGF0aW9uIG9mIGEgdHlwZS5cblx0ICovXG5cdHByaXZhdGUgaXNMaXRlcmFsSW5zdGFuY2UoZWxlbWVudE9yTGl0ZXJhbDogUmVjb3JkPHN0cmluZywgYW55Pik6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0eXBlb2YgZWxlbWVudE9yTGl0ZXJhbC5fdHlwZSA9PT0gXCJ1bmRlZmluZWRcIlxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyB0cnlTeW1tZXRyaWNQZXJtaXNzaW9uKGxpc3RQZXJtaXNzaW9uczogUGVybWlzc2lvbltdKTogUHJvbWlzZTxBZXNLZXkgfCBudWxsPiB7XG5cdFx0Y29uc3Qgc3ltbWV0cmljUGVybWlzc2lvbjogUGVybWlzc2lvbiB8IG51bGwgPVxuXHRcdFx0bGlzdFBlcm1pc3Npb25zLmZpbmQoXG5cdFx0XHRcdChwKSA9PlxuXHRcdFx0XHRcdChwLnR5cGUgPT09IFBlcm1pc3Npb25UeXBlLlB1YmxpY19TeW1tZXRyaWMgfHwgcC50eXBlID09PSBQZXJtaXNzaW9uVHlwZS5TeW1tZXRyaWMpICYmXG5cdFx0XHRcdFx0cC5fb3duZXJHcm91cCAmJlxuXHRcdFx0XHRcdHRoaXMudXNlckZhY2FkZS5oYXNHcm91cChwLl9vd25lckdyb3VwKSxcblx0XHRcdCkgPz8gbnVsbFxuXG5cdFx0aWYgKHN5bW1ldHJpY1Blcm1pc3Npb24pIHtcblx0XHRcdGNvbnN0IGdrID0gYXdhaXQgdGhpcy5rZXlMb2FkZXJGYWNhZGUubG9hZFN5bUdyb3VwS2V5KFxuXHRcdFx0XHRhc3NlcnROb3ROdWxsKHN5bW1ldHJpY1Blcm1pc3Npb24uX293bmVyR3JvdXApLFxuXHRcdFx0XHRwYXJzZUtleVZlcnNpb24oc3ltbWV0cmljUGVybWlzc2lvbi5fb3duZXJLZXlWZXJzaW9uID8/IFwiMFwiKSxcblx0XHRcdClcblx0XHRcdHJldHVybiBkZWNyeXB0S2V5KGdrLCBhc3NlcnROb3ROdWxsKHN5bW1ldHJpY1Blcm1pc3Npb24uX293bmVyRW5jU2Vzc2lvbktleSkpXG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBudWxsXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJlc29sdmVzIHRoZSBzZXNzaW9uIGtleSBmb3IgdGhlIHByb3ZpZGVkIGluc3RhbmNlIGFuZCBjb2xsZWN0cyBhbGwgb3RoZXIgaW5zdGFuY2VzJ1xuXHQgKiBzZXNzaW9uIGtleXMgaW4gb3JkZXIgdG8gdXBkYXRlIHRoZW0uXG5cdCAqL1xuXHRwcml2YXRlIGFzeW5jIGNvbGxlY3RBbGxJbnN0YW5jZVNlc3Npb25LZXlzQW5kQXV0aGVudGljYXRlKFxuXHRcdGJ1Y2tldEtleTogQnVja2V0S2V5LFxuXHRcdGRlY0J1Y2tldEtleTogbnVtYmVyW10sXG5cdFx0aW5zdGFuY2VFbGVtZW50SWQ6IHN0cmluZyxcblx0XHRpbnN0YW5jZTogUmVjb3JkPHN0cmluZywgYW55Pixcblx0XHR0eXBlTW9kZWw6IFR5cGVNb2RlbCxcblx0XHRlbmNyeXB0aW9uQXV0aFN0YXR1czogRW5jcnlwdGlvbkF1dGhTdGF0dXMgfCBudWxsLFxuXHRcdHBxTWVzc2FnZVNlbmRlcktleTogRWNjUHVibGljS2V5IHwgbnVsbCxcblx0KTogUHJvbWlzZTxSZXNvbHZlZFNlc3Npb25LZXlzPiB7XG5cdFx0bGV0IHJlc29sdmVkU2Vzc2lvbktleUZvckluc3RhbmNlOiBBZXNLZXkgfCB1bmRlZmluZWQgPSB1bmRlZmluZWRcblx0XHRjb25zdCBpbnN0YW5jZVNlc3Npb25LZXlzID0gYXdhaXQgcHJvbWlzZU1hcChidWNrZXRLZXkuYnVja2V0RW5jU2Vzc2lvbktleXMsIGFzeW5jIChpbnN0YW5jZVNlc3Npb25LZXkpID0+IHtcblx0XHRcdGNvbnN0IGRlY3J5cHRlZFNlc3Npb25LZXkgPSBkZWNyeXB0S2V5KGRlY0J1Y2tldEtleSwgaW5zdGFuY2VTZXNzaW9uS2V5LnN5bUVuY1Nlc3Npb25LZXkpXG5cdFx0XHRjb25zdCBncm91cEtleSA9IGF3YWl0IHRoaXMua2V5TG9hZGVyRmFjYWRlLmdldEN1cnJlbnRTeW1Hcm91cEtleShpbnN0YW5jZS5fb3duZXJHcm91cClcblx0XHRcdGNvbnN0IG93bmVyRW5jU2Vzc2lvbktleSA9IGVuY3J5cHRLZXlXaXRoVmVyc2lvbmVkS2V5KGdyb3VwS2V5LCBkZWNyeXB0ZWRTZXNzaW9uS2V5KVxuXHRcdFx0Y29uc3QgaW5zdGFuY2VTZXNzaW9uS2V5V2l0aE93bmVyRW5jU2Vzc2lvbktleSA9IGNyZWF0ZUluc3RhbmNlU2Vzc2lvbktleShpbnN0YW5jZVNlc3Npb25LZXkpXG5cdFx0XHRpZiAoaW5zdGFuY2VFbGVtZW50SWQgPT0gaW5zdGFuY2VTZXNzaW9uS2V5Lmluc3RhbmNlSWQpIHtcblx0XHRcdFx0cmVzb2x2ZWRTZXNzaW9uS2V5Rm9ySW5zdGFuY2UgPSBkZWNyeXB0ZWRTZXNzaW9uS2V5XG5cdFx0XHRcdC8vIHdlIGNhbiBvbmx5IGF1dGhlbnRpY2F0ZSBvbmNlIHdlIGhhdmUgdGhlIHNlc3Npb24ga2V5XG5cdFx0XHRcdC8vIGJlY2F1c2Ugd2UgbmVlZCB0byBjaGVjayBpZiB0aGUgY29uZmlkZW50aWFsIGZsYWcgaXMgc2V0LCB3aGljaCBpcyBlbmNyeXB0ZWQgc3RpbGxcblx0XHRcdFx0Ly8gd2UgbmVlZCB0byBkbyBpdCBoZXJlIGF0IHRoZSBsYXRlc3QgYmVjYXVzZSB3ZSBtdXN0IHdyaXRlIHRoZSBmbGFnIHdoZW4gdXBkYXRpbmcgdGhlIHNlc3Npb24ga2V5IG9uIHRoZSBpbnN0YW5jZVxuXHRcdFx0XHRhd2FpdCB0aGlzLmF1dGhlbnRpY2F0ZU1haW5JbnN0YW5jZShcblx0XHRcdFx0XHR0eXBlTW9kZWwsXG5cdFx0XHRcdFx0ZW5jcnlwdGlvbkF1dGhTdGF0dXMsXG5cdFx0XHRcdFx0cHFNZXNzYWdlU2VuZGVyS2V5LFxuXHRcdFx0XHRcdGJ1Y2tldEtleS5wcm90b2NvbFZlcnNpb24gPT09IENyeXB0b1Byb3RvY29sVmVyc2lvbi5UVVRBX0NSWVBUID8gcGFyc2VLZXlWZXJzaW9uKGJ1Y2tldEtleS5zZW5kZXJLZXlWZXJzaW9uID8/IFwiMFwiKSA6IG51bGwsXG5cdFx0XHRcdFx0aW5zdGFuY2UsXG5cdFx0XHRcdFx0cmVzb2x2ZWRTZXNzaW9uS2V5Rm9ySW5zdGFuY2UsXG5cdFx0XHRcdFx0aW5zdGFuY2VTZXNzaW9uS2V5V2l0aE93bmVyRW5jU2Vzc2lvbktleSxcblx0XHRcdFx0XHRkZWNyeXB0ZWRTZXNzaW9uS2V5LFxuXHRcdFx0XHRcdGJ1Y2tldEtleS5rZXlHcm91cCxcblx0XHRcdFx0KVxuXHRcdFx0fVxuXHRcdFx0aW5zdGFuY2VTZXNzaW9uS2V5V2l0aE93bmVyRW5jU2Vzc2lvbktleS5zeW1FbmNTZXNzaW9uS2V5ID0gb3duZXJFbmNTZXNzaW9uS2V5LmtleVxuXHRcdFx0aW5zdGFuY2VTZXNzaW9uS2V5V2l0aE93bmVyRW5jU2Vzc2lvbktleS5zeW1LZXlWZXJzaW9uID0gU3RyaW5nKG93bmVyRW5jU2Vzc2lvbktleS5lbmNyeXB0aW5nS2V5VmVyc2lvbilcblx0XHRcdHJldHVybiBpbnN0YW5jZVNlc3Npb25LZXlXaXRoT3duZXJFbmNTZXNzaW9uS2V5XG5cdFx0fSlcblxuXHRcdGlmIChyZXNvbHZlZFNlc3Npb25LZXlGb3JJbnN0YW5jZSkge1xuXHRcdFx0cmV0dXJuIHsgcmVzb2x2ZWRTZXNzaW9uS2V5Rm9ySW5zdGFuY2UsIGluc3RhbmNlU2Vzc2lvbktleXMgfVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgU2Vzc2lvbktleU5vdEZvdW5kRXJyb3IoXCJubyBzZXNzaW9uIGtleSBmb3IgaW5zdGFuY2UgXCIgKyBpbnN0YW5jZS5faWQpXG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBhdXRoZW50aWNhdGVNYWluSW5zdGFuY2UoXG5cdFx0dHlwZU1vZGVsOiBUeXBlTW9kZWwsXG5cdFx0ZW5jcnlwdGlvbkF1dGhTdGF0dXM6IEVuY3J5cHRpb25BdXRoU3RhdHVzIHwgbnVsbCxcblx0XHRwcU1lc3NhZ2VTZW5kZXJLZXk6IFVpbnQ4QXJyYXkgfCBudWxsLFxuXHRcdHBxTWVzc2FnZVNlbmRlcktleVZlcnNpb246IEtleVZlcnNpb24gfCBudWxsLFxuXHRcdGluc3RhbmNlOiBSZWNvcmQ8c3RyaW5nLCBhbnk+LFxuXHRcdHJlc29sdmVkU2Vzc2lvbktleUZvckluc3RhbmNlOiBudW1iZXJbXSxcblx0XHRpbnN0YW5jZVNlc3Npb25LZXlXaXRoT3duZXJFbmNTZXNzaW9uS2V5OiBJbnN0YW5jZVNlc3Npb25LZXksXG5cdFx0ZGVjcnlwdGVkU2Vzc2lvbktleTogbnVtYmVyW10sXG5cdFx0a2V5R3JvdXA6IElkIHwgbnVsbCxcblx0KSB7XG5cdFx0Ly8gd2Ugb25seSBhdXRoZW50aWNhdGUgbWFpbCBpbnN0YW5jZXNcblx0XHRjb25zdCBpc01haWxJbnN0YW5jZSA9IGlzU2FtZVR5cGVSZWZCeUF0dHIoTWFpbFR5cGVSZWYsIHR5cGVNb2RlbC5hcHAsIHR5cGVNb2RlbC5uYW1lKVxuXHRcdGlmIChpc01haWxJbnN0YW5jZSkge1xuXHRcdFx0aWYgKCFlbmNyeXB0aW9uQXV0aFN0YXR1cykge1xuXHRcdFx0XHRpZiAoIXBxTWVzc2FnZVNlbmRlcktleSkge1xuXHRcdFx0XHRcdC8vIFRoaXMgbWVzc2FnZSB3YXMgZW5jcnlwdGVkIHdpdGggUlNBLiBXZSBjaGVjayBpZiBUdXRhQ3J5cHQgY291bGQgaGF2ZSBiZWVuIHVzZWQgaW5zdGVhZC5cblx0XHRcdFx0XHRjb25zdCByZWNpcGllbnRHcm91cCA9IGFzc2VydE5vdE51bGwoXG5cdFx0XHRcdFx0XHRrZXlHcm91cCxcblx0XHRcdFx0XHRcdFwidHJ5aW5nIHRvIGF1dGhlbnRpY2F0ZSBhbiBhc3ltbWV0cmljYWxseSBlbmNyeXB0ZWQgbWVzc2FnZSwgYnV0IHdlIGNhbid0IGRldGVybWluZSB0aGUgcmVjaXBpZW50J3MgZ3JvdXAgSURcIixcblx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0Y29uc3QgY3VycmVudEtleVBhaXIgPSBhd2FpdCB0aGlzLmtleUxvYWRlckZhY2FkZS5sb2FkQ3VycmVudEtleVBhaXIocmVjaXBpZW50R3JvdXApXG5cdFx0XHRcdFx0ZW5jcnlwdGlvbkF1dGhTdGF0dXMgPSBFbmNyeXB0aW9uQXV0aFN0YXR1cy5SU0FfTk9fQVVUSEVOVElDQVRJT05cblx0XHRcdFx0XHRpZiAoaXNQcUtleVBhaXJzKGN1cnJlbnRLZXlQYWlyLm9iamVjdCkpIHtcblx0XHRcdFx0XHRcdGNvbnN0IGtleVJvdGF0aW9uRmFjYWRlID0gdGhpcy5rZXlSb3RhdGlvbkZhY2FkZSgpXG5cdFx0XHRcdFx0XHRjb25zdCByb3RhdGVkR3JvdXBzID0gYXdhaXQga2V5Um90YXRpb25GYWNhZGUuZ2V0R3JvdXBJZHNUaGF0UGVyZm9ybWVkS2V5Um90YXRpb25zKClcblx0XHRcdFx0XHRcdGlmICghcm90YXRlZEdyb3Vwcy5pbmNsdWRlcyhyZWNpcGllbnRHcm91cCkpIHtcblx0XHRcdFx0XHRcdFx0ZW5jcnlwdGlvbkF1dGhTdGF0dXMgPSBFbmNyeXB0aW9uQXV0aFN0YXR1cy5SU0FfREVTUElURV9UVVRBQ1JZUFRcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc3QgbWFpbCA9IHRoaXMuaXNMaXRlcmFsSW5zdGFuY2UoaW5zdGFuY2UpXG5cdFx0XHRcdFx0XHQ/ICgoYXdhaXQgdGhpcy5pbnN0YW5jZU1hcHBlci5kZWNyeXB0QW5kTWFwVG9JbnN0YW5jZSh0eXBlTW9kZWwsIGluc3RhbmNlLCByZXNvbHZlZFNlc3Npb25LZXlGb3JJbnN0YW5jZSkpIGFzIE1haWwpXG5cdFx0XHRcdFx0XHQ6IChpbnN0YW5jZSBhcyBNYWlsKVxuXHRcdFx0XHRcdGNvbnN0IHNlbmRlck1haWxBZGRyZXNzID0gbWFpbC5jb25maWRlbnRpYWwgPyBtYWlsLnNlbmRlci5hZGRyZXNzIDogU1lTVEVNX0dST1VQX01BSUxfQUREUkVTU1xuXHRcdFx0XHRcdGVuY3J5cHRpb25BdXRoU3RhdHVzID0gYXdhaXQgdGhpcy50cnlBdXRoZW50aWNhdGVTZW5kZXJPZk1haW5JbnN0YW5jZShcblx0XHRcdFx0XHRcdHNlbmRlck1haWxBZGRyZXNzLFxuXHRcdFx0XHRcdFx0cHFNZXNzYWdlU2VuZGVyS2V5LFxuXHRcdFx0XHRcdFx0Ly8gbXVzdCBub3QgYmUgbnVsbCBpZiB0aGlzIGlzIGEgVHV0YUNyeXB0IG1lc3NhZ2Ugd2l0aCBhIHBxTWVzc2FnZVNlbmRlcktleVxuXHRcdFx0XHRcdFx0YXNzZXJ0Tm90TnVsbChwcU1lc3NhZ2VTZW5kZXJLZXlWZXJzaW9uKSxcblx0XHRcdFx0XHQpXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGluc3RhbmNlU2Vzc2lvbktleVdpdGhPd25lckVuY1Nlc3Npb25LZXkuZW5jcnlwdGlvbkF1dGhTdGF0dXMgPSBhZXNFbmNyeXB0KGRlY3J5cHRlZFNlc3Npb25LZXksIHN0cmluZ1RvVXRmOFVpbnQ4QXJyYXkoZW5jcnlwdGlvbkF1dGhTdGF0dXMpKVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgdHJ5QXV0aGVudGljYXRlU2VuZGVyT2ZNYWluSW5zdGFuY2Uoc2VuZGVyTWFpbEFkZHJlc3M6IHN0cmluZywgcHFNZXNzYWdlU2VuZGVyS2V5OiBVaW50OEFycmF5LCBwcU1lc3NhZ2VTZW5kZXJLZXlWZXJzaW9uOiBLZXlWZXJzaW9uKSB7XG5cdFx0dHJ5IHtcblx0XHRcdHJldHVybiBhd2FpdCB0aGlzLmFzeW1tZXRyaWNDcnlwdG9GYWNhZGUuYXV0aGVudGljYXRlU2VuZGVyKFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWRlbnRpZmllcjogc2VuZGVyTWFpbEFkZHJlc3MsXG5cdFx0XHRcdFx0aWRlbnRpZmllclR5cGU6IFB1YmxpY0tleUlkZW50aWZpZXJUeXBlLk1BSUxfQUREUkVTUyxcblx0XHRcdFx0fSxcblx0XHRcdFx0cHFNZXNzYWdlU2VuZGVyS2V5LFxuXHRcdFx0XHRwcU1lc3NhZ2VTZW5kZXJLZXlWZXJzaW9uLFxuXHRcdFx0KVxuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdC8vIHdlIGRvIG5vdCB3YW50IHRvIGZhaWwgbWFpbCBkZWNyeXB0aW9uIGhlcmUsIGUuZy4gaW4gY2FzZSBhbiBhbGlhcyB3YXMgcmVtb3ZlZCB3ZSB3b3VsZCBnZXQgYSBwZXJtYW5lbnQgTm90Rm91bmRFcnJvci5cblx0XHRcdC8vIGluIHRob3NlIGNhc2VzIHdlIHdpbGwganVzdCBzaG93IGEgd2FybmluZyBiYW5uZXIgYnV0IHN0aWxsIHdhbnQgdG8gZGlzcGxheSB0aGUgbWFpbFxuXHRcdFx0Y29uc29sZS5lcnJvcihcIkNvdWxkIG5vdCBhdXRoZW50aWNhdGUgc2VuZGVyXCIsIGUpXG5cdFx0XHRyZXR1cm4gRW5jcnlwdGlvbkF1dGhTdGF0dXMuVFVUQUNSWVBUX0FVVEhFTlRJQ0FUSU9OX0ZBSUxFRFxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgcmVzb2x2ZVdpdGhQdWJsaWNPckV4dGVybmFsUGVybWlzc2lvbihsaXN0UGVybWlzc2lvbnM6IFBlcm1pc3Npb25bXSwgaW5zdGFuY2U6IFJlY29yZDxzdHJpbmcsIGFueT4sIHR5cGVNb2RlbDogVHlwZU1vZGVsKTogUHJvbWlzZTxBZXNLZXk+IHtcblx0XHRjb25zdCBwdWJPckV4dFBlcm1pc3Npb24gPSBsaXN0UGVybWlzc2lvbnMuZmluZCgocCkgPT4gcC50eXBlID09PSBQZXJtaXNzaW9uVHlwZS5QdWJsaWMgfHwgcC50eXBlID09PSBQZXJtaXNzaW9uVHlwZS5FeHRlcm5hbCkgPz8gbnVsbFxuXG5cdFx0aWYgKHB1Yk9yRXh0UGVybWlzc2lvbiA9PSBudWxsKSB7XG5cdFx0XHRjb25zdCB0eXBlTmFtZSA9IGAke3R5cGVNb2RlbC5hcHB9LyR7dHlwZU1vZGVsLm5hbWV9YFxuXHRcdFx0dGhyb3cgbmV3IFNlc3Npb25LZXlOb3RGb3VuZEVycm9yKGBjb3VsZCBub3QgZmluZCBwZXJtaXNzaW9uIGZvciBpbnN0YW5jZSBvZiB0eXBlICR7dHlwZU5hbWV9IHdpdGggaWQgJHt0aGlzLmdldEVsZW1lbnRJZEZyb21JbnN0YW5jZShpbnN0YW5jZSl9YClcblx0XHR9XG5cblx0XHRjb25zdCBidWNrZXRQZXJtaXNzaW9ucyA9IGF3YWl0IHRoaXMuZW50aXR5Q2xpZW50LmxvYWRBbGwoQnVja2V0UGVybWlzc2lvblR5cGVSZWYsIGFzc2VydE5vdE51bGwocHViT3JFeHRQZXJtaXNzaW9uLmJ1Y2tldCkuYnVja2V0UGVybWlzc2lvbnMpXG5cdFx0Y29uc3QgYnVja2V0UGVybWlzc2lvbiA9IGJ1Y2tldFBlcm1pc3Npb25zLmZpbmQoXG5cdFx0XHQoYnApID0+IChicC50eXBlID09PSBCdWNrZXRQZXJtaXNzaW9uVHlwZS5QdWJsaWMgfHwgYnAudHlwZSA9PT0gQnVja2V0UGVybWlzc2lvblR5cGUuRXh0ZXJuYWwpICYmIHB1Yk9yRXh0UGVybWlzc2lvbi5fb3duZXJHcm91cCA9PT0gYnAuX293bmVyR3JvdXAsXG5cdFx0KVxuXG5cdFx0Ly8gZmluZCB0aGUgYnVja2V0IHBlcm1pc3Npb24gd2l0aCB0aGUgc2FtZSBncm91cCBhcyB0aGUgcGVybWlzc2lvbiBhbmQgcHVibGljIHR5cGVcblx0XHRpZiAoYnVja2V0UGVybWlzc2lvbiA9PSBudWxsKSB7XG5cdFx0XHR0aHJvdyBuZXcgU2Vzc2lvbktleU5vdEZvdW5kRXJyb3IoXCJubyBjb3JyZXNwb25kaW5nIGJ1Y2tldCBwZXJtaXNzaW9uIGZvdW5kXCIpXG5cdFx0fVxuXG5cdFx0aWYgKGJ1Y2tldFBlcm1pc3Npb24udHlwZSA9PT0gQnVja2V0UGVybWlzc2lvblR5cGUuRXh0ZXJuYWwpIHtcblx0XHRcdHJldHVybiB0aGlzLmRlY3J5cHRXaXRoRXh0ZXJuYWxCdWNrZXQoYnVja2V0UGVybWlzc2lvbiwgcHViT3JFeHRQZXJtaXNzaW9uLCBpbnN0YW5jZSlcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRoaXMuZGVjcnlwdFdpdGhQdWJsaWNCdWNrZXRXaXRob3V0QXV0aGVudGljYXRpb24oYnVja2V0UGVybWlzc2lvbiwgaW5zdGFuY2UsIHB1Yk9yRXh0UGVybWlzc2lvbiwgdHlwZU1vZGVsKVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgZGVjcnlwdFdpdGhFeHRlcm5hbEJ1Y2tldChcblx0XHRidWNrZXRQZXJtaXNzaW9uOiBCdWNrZXRQZXJtaXNzaW9uLFxuXHRcdHB1Yk9yRXh0UGVybWlzc2lvbjogUGVybWlzc2lvbixcblx0XHRpbnN0YW5jZTogUmVjb3JkPHN0cmluZywgYW55Pixcblx0KTogUHJvbWlzZTxBZXNLZXk+IHtcblx0XHRsZXQgYnVja2V0S2V5XG5cblx0XHRpZiAoYnVja2V0UGVybWlzc2lvbi5vd25lckVuY0J1Y2tldEtleSAhPSBudWxsKSB7XG5cdFx0XHRjb25zdCBvd25lckdyb3VwS2V5ID0gYXdhaXQgdGhpcy5rZXlMb2FkZXJGYWNhZGUubG9hZFN5bUdyb3VwS2V5KFxuXHRcdFx0XHRuZXZlck51bGwoYnVja2V0UGVybWlzc2lvbi5fb3duZXJHcm91cCksXG5cdFx0XHRcdHBhcnNlS2V5VmVyc2lvbihidWNrZXRQZXJtaXNzaW9uLm93bmVyS2V5VmVyc2lvbiA/PyBcIjBcIiksXG5cdFx0XHQpXG5cdFx0XHRidWNrZXRLZXkgPSBkZWNyeXB0S2V5KG93bmVyR3JvdXBLZXksIGJ1Y2tldFBlcm1pc3Npb24ub3duZXJFbmNCdWNrZXRLZXkpXG5cdFx0fSBlbHNlIGlmIChidWNrZXRQZXJtaXNzaW9uLnN5bUVuY0J1Y2tldEtleSkge1xuXHRcdFx0Ly8gbGVnYWN5IGNhc2U6IGZvciB2ZXJ5IG9sZCBlbWFpbCBzZW50IHRvIGV4dGVybmFsIHVzZXIgd2UgdXNlZCBzeW1FbmNCdWNrZXRLZXkgb24gdGhlIGJ1Y2tldCBwZXJtaXNzaW9uLlxuXHRcdFx0Ly8gVGhlIGJ1Y2tldCBrZXkgaXMgZW5jcnlwdGVkIHdpdGggdGhlIHVzZXIgZ3JvdXAga2V5IG9mIHRoZSBleHRlcm5hbCB1c2VyLlxuXHRcdFx0Ly8gV2UgbWFpbnRhaW4gdGhpcyBjb2RlIGFzIHdlIHN0aWxsIGhhdmUgc29tZSBvbGQgQnVja2V0S2V5cyBpbiBzb21lIGV4dGVybmFsIG1haWxib3hlcy5cblx0XHRcdC8vIENhbiBiZSByZW1vdmVkIGlmIHdlIGZpbmlzaGVkIG1haWwgZGV0YWlscyBtaWdyYXRpb24gb3Igd2hlbiB3ZSBkbyBjbGVhbnVwIG9mIGV4dGVybmFsIG1haWxib3hlcy5cblx0XHRcdGNvbnN0IHVzZXJHcm91cEtleSA9IGF3YWl0IHRoaXMua2V5TG9hZGVyRmFjYWRlLmxvYWRTeW1Vc2VyR3JvdXBLZXkocGFyc2VLZXlWZXJzaW9uKGJ1Y2tldFBlcm1pc3Npb24uc3ltS2V5VmVyc2lvbiA/PyBcIjBcIikpXG5cdFx0XHRidWNrZXRLZXkgPSBkZWNyeXB0S2V5KHVzZXJHcm91cEtleSwgYnVja2V0UGVybWlzc2lvbi5zeW1FbmNCdWNrZXRLZXkpXG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBTZXNzaW9uS2V5Tm90Rm91bmRFcnJvcihcblx0XHRcdFx0YEJ1Y2tldEVuY1Nlc3Npb25LZXkgaXMgbm90IGRlZmluZWQgZm9yIFBlcm1pc3Npb24gJHtwdWJPckV4dFBlcm1pc3Npb24uX2lkLnRvU3RyaW5nKCl9IChJbnN0YW5jZTogJHtKU09OLnN0cmluZ2lmeShpbnN0YW5jZSl9KWAsXG5cdFx0XHQpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGRlY3J5cHRLZXkoYnVja2V0S2V5LCBuZXZlck51bGwocHViT3JFeHRQZXJtaXNzaW9uLmJ1Y2tldEVuY1Nlc3Npb25LZXkpKVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBkZWNyeXB0V2l0aFB1YmxpY0J1Y2tldFdpdGhvdXRBdXRoZW50aWNhdGlvbihcblx0XHRidWNrZXRQZXJtaXNzaW9uOiBCdWNrZXRQZXJtaXNzaW9uLFxuXHRcdGluc3RhbmNlOiBSZWNvcmQ8c3RyaW5nLCBhbnk+LFxuXHRcdHB1Yk9yRXh0UGVybWlzc2lvbjogUGVybWlzc2lvbixcblx0XHR0eXBlTW9kZWw6IFR5cGVNb2RlbCxcblx0KTogUHJvbWlzZTxBZXNLZXk+IHtcblx0XHRjb25zdCBwdWJFbmNCdWNrZXRLZXkgPSBidWNrZXRQZXJtaXNzaW9uLnB1YkVuY0J1Y2tldEtleVxuXHRcdGlmIChwdWJFbmNCdWNrZXRLZXkgPT0gbnVsbCkge1xuXHRcdFx0dGhyb3cgbmV3IFNlc3Npb25LZXlOb3RGb3VuZEVycm9yKFxuXHRcdFx0XHRgUHViRW5jQnVja2V0S2V5IGlzIG5vdCBkZWZpbmVkIGZvciBCdWNrZXRQZXJtaXNzaW9uICR7YnVja2V0UGVybWlzc2lvbi5faWQudG9TdHJpbmcoKX0gKEluc3RhbmNlOiAke0pTT04uc3RyaW5naWZ5KGluc3RhbmNlKX0pYCxcblx0XHRcdClcblx0XHR9XG5cdFx0Y29uc3QgYnVja2V0RW5jU2Vzc2lvbktleSA9IHB1Yk9yRXh0UGVybWlzc2lvbi5idWNrZXRFbmNTZXNzaW9uS2V5XG5cdFx0aWYgKGJ1Y2tldEVuY1Nlc3Npb25LZXkgPT0gbnVsbCkge1xuXHRcdFx0dGhyb3cgbmV3IFNlc3Npb25LZXlOb3RGb3VuZEVycm9yKFxuXHRcdFx0XHRgQnVja2V0RW5jU2Vzc2lvbktleSBpcyBub3QgZGVmaW5lZCBmb3IgUGVybWlzc2lvbiAke3B1Yk9yRXh0UGVybWlzc2lvbi5faWQudG9TdHJpbmcoKX0gKEluc3RhbmNlOiAke0pTT04uc3RyaW5naWZ5KGluc3RhbmNlKX0pYCxcblx0XHRcdClcblx0XHR9XG5cblx0XHRjb25zdCB7IGRlY3J5cHRlZEFlc0tleSB9ID0gYXdhaXQgdGhpcy5hc3ltbWV0cmljQ3J5cHRvRmFjYWRlLmxvYWRLZXlQYWlyQW5kRGVjcnlwdFN5bUtleShcblx0XHRcdGJ1Y2tldFBlcm1pc3Npb24uZ3JvdXAsXG5cdFx0XHRwYXJzZUtleVZlcnNpb24oYnVja2V0UGVybWlzc2lvbi5wdWJLZXlWZXJzaW9uID8/IFwiMFwiKSxcblx0XHRcdGFzQ3J5cHRvUHJvdG9vY29sVmVyc2lvbihidWNrZXRQZXJtaXNzaW9uLnByb3RvY29sVmVyc2lvbiksXG5cdFx0XHRwdWJFbmNCdWNrZXRLZXksXG5cdFx0KVxuXG5cdFx0Y29uc3Qgc2sgPSBkZWNyeXB0S2V5KGRlY3J5cHRlZEFlc0tleSwgYnVja2V0RW5jU2Vzc2lvbktleSlcblxuXHRcdGlmIChidWNrZXRQZXJtaXNzaW9uLl9vd25lckdyb3VwKSB7XG5cdFx0XHQvLyBpcyBub3QgZGVmaW5lZCBmb3Igc29tZSBvbGQgQWNjb3VudGluZ0luZm9zXG5cdFx0XHRsZXQgYnVja2V0UGVybWlzc2lvbk93bmVyR3JvdXBLZXkgPSBhd2FpdCB0aGlzLmtleUxvYWRlckZhY2FkZS5nZXRDdXJyZW50U3ltR3JvdXBLZXkobmV2ZXJOdWxsKGJ1Y2tldFBlcm1pc3Npb24uX293bmVyR3JvdXApKSAvLyBnZXQgY3VycmVudCBrZXkgZm9yIGVuY3J5cHRpbmdcblx0XHRcdGF3YWl0IHRoaXMudXBkYXRlV2l0aFN5bVBlcm1pc3Npb25LZXkodHlwZU1vZGVsLCBpbnN0YW5jZSwgcHViT3JFeHRQZXJtaXNzaW9uLCBidWNrZXRQZXJtaXNzaW9uLCBidWNrZXRQZXJtaXNzaW9uT3duZXJHcm91cEtleSwgc2spLmNhdGNoKFxuXHRcdFx0XHRvZkNsYXNzKE5vdEZvdW5kRXJyb3IsICgpID0+IHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhcInc+IGNvdWxkIG5vdCBmaW5kIGluc3RhbmNlIHRvIHVwZGF0ZSBwZXJtaXNzaW9uXCIpXG5cdFx0XHRcdH0pLFxuXHRcdFx0KVxuXHRcdH1cblx0XHRyZXR1cm4gc2tcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBzZXNzaW9uIGtleSBmb3IgdGhlIHByb3ZpZGVkIHNlcnZpY2UgcmVzcG9uc2U6XG5cdCAqICogbnVsbCwgaWYgdGhlIGluc3RhbmNlIGlzIHVuZW5jcnlwdGVkXG5cdCAqICogdGhlIGRlY3J5cHRlZCBfb3duZXJQdWJsaWNFbmNTZXNzaW9uS2V5LCBpZiBpdCBpcyBhdmFpbGFibGVcblx0ICogQHBhcmFtIGluc3RhbmNlIFRoZSB1bmVuY3J5cHRlZCAoY2xpZW50LXNpZGUpIG9yIGVuY3J5cHRlZCAoc2VydmVyLXNpZGUpIGluc3RhbmNlXG5cdCAqXG5cdCAqL1xuXHRhc3luYyByZXNvbHZlU2VydmljZVNlc3Npb25LZXkoaW5zdGFuY2U6IFJlY29yZDxzdHJpbmcsIGFueT4pOiBQcm9taXNlPEFlczI1NktleSB8IG51bGw+IHtcblx0XHRpZiAoaW5zdGFuY2UuX293bmVyUHVibGljRW5jU2Vzc2lvbktleSkge1xuXHRcdFx0Ly8gd2UgYXNzdW1lIHRoZSBzZXJ2ZXIgdXNlcyB0aGUgY3VycmVudCBrZXkgcGFpciBvZiB0aGUgcmVjaXBpZW50XG5cdFx0XHRjb25zdCBrZXlwYWlyID0gYXdhaXQgdGhpcy5rZXlMb2FkZXJGYWNhZGUubG9hZEN1cnJlbnRLZXlQYWlyKGluc3RhbmNlLl9vd25lckdyb3VwKVxuXHRcdFx0Ly8gd2UgZG8gbm90IGF1dGhlbnRpY2F0ZSBhcyB3ZSBjb3VsZCByZW1vdmUgZGF0YSB0cmFuc2ZlciB0eXBlIGVuY3J5cHRpb24gYWx0b2dldGhlciBhbmQgb25seSByZWx5IG9uIHRsc1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0YXdhaXQgdGhpcy5hc3ltbWV0cmljQ3J5cHRvRmFjYWRlLmRlY3J5cHRTeW1LZXlXaXRoS2V5UGFpcihcblx0XHRcdFx0XHRrZXlwYWlyLm9iamVjdCxcblx0XHRcdFx0XHRhc3NlcnRFbnVtVmFsdWUoQ3J5cHRvUHJvdG9jb2xWZXJzaW9uLCBpbnN0YW5jZS5fcHVibGljQ3J5cHRvUHJvdG9jb2xWZXJzaW9uKSxcblx0XHRcdFx0XHRiYXNlNjRUb1VpbnQ4QXJyYXkoaW5zdGFuY2UuX293bmVyUHVibGljRW5jU2Vzc2lvbktleSksXG5cdFx0XHRcdClcblx0XHRcdCkuZGVjcnlwdGVkQWVzS2V5XG5cdFx0fVxuXHRcdHJldHVybiBudWxsXG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIG5ldyBfb3duZXJFbmNTZXNzaW9uS2V5IGFuZCBhc3NpZ25zIGl0IHRvIHRoZSBwcm92aWRlZCBlbnRpdHlcblx0ICogdGhlIGVudGl0eSBtdXN0IGFscmVhZHkgaGF2ZSBhbiBfb3duZXJHcm91cFxuXHQgKiBAcmV0dXJucyB0aGUgZ2VuZXJhdGVkIGtleVxuXHQgKi9cblx0YXN5bmMgc2V0TmV3T3duZXJFbmNTZXNzaW9uS2V5KG1vZGVsOiBUeXBlTW9kZWwsIGVudGl0eTogUmVjb3JkPHN0cmluZywgYW55Piwga2V5VG9FbmNyeXB0U2Vzc2lvbktleT86IFZlcnNpb25lZEtleSk6IFByb21pc2U8QWVzS2V5IHwgbnVsbD4ge1xuXHRcdGlmICghZW50aXR5Ll9vd25lckdyb3VwKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYG5vIG93bmVyIGdyb3VwIHNldCAgJHtKU09OLnN0cmluZ2lmeShlbnRpdHkpfWApXG5cdFx0fVxuXG5cdFx0aWYgKG1vZGVsLmVuY3J5cHRlZCkge1xuXHRcdFx0aWYgKGVudGl0eS5fb3duZXJFbmNTZXNzaW9uS2V5KSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihgb3duZXJFbmNTZXNzaW9uS2V5IGFscmVhZHkgc2V0ICR7SlNPTi5zdHJpbmdpZnkoZW50aXR5KX1gKVxuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBzZXNzaW9uS2V5ID0gYWVzMjU2UmFuZG9tS2V5KClcblx0XHRcdGNvbnN0IGVmZmVjdGl2ZUtleVRvRW5jcnlwdFNlc3Npb25LZXkgPSBrZXlUb0VuY3J5cHRTZXNzaW9uS2V5ID8/IChhd2FpdCB0aGlzLmtleUxvYWRlckZhY2FkZS5nZXRDdXJyZW50U3ltR3JvdXBLZXkoZW50aXR5Ll9vd25lckdyb3VwKSlcblx0XHRcdGNvbnN0IGVuY3J5cHRlZFNlc3Npb25LZXkgPSBlbmNyeXB0S2V5V2l0aFZlcnNpb25lZEtleShlZmZlY3RpdmVLZXlUb0VuY3J5cHRTZXNzaW9uS2V5LCBzZXNzaW9uS2V5KVxuXHRcdFx0dGhpcy5zZXRPd25lckVuY1Nlc3Npb25LZXkoZW50aXR5IGFzIEluc3RhbmNlLCBlbmNyeXB0ZWRTZXNzaW9uS2V5KVxuXHRcdFx0cmV0dXJuIHNlc3Npb25LZXlcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIG51bGxcblx0XHR9XG5cdH1cblxuXHRhc3luYyBlbmNyeXB0QnVja2V0S2V5Rm9ySW50ZXJuYWxSZWNpcGllbnQoXG5cdFx0c2VuZGVyVXNlckdyb3VwSWQ6IElkLFxuXHRcdGJ1Y2tldEtleTogQWVzS2V5LFxuXHRcdHJlY2lwaWVudE1haWxBZGRyZXNzOiBzdHJpbmcsXG5cdFx0bm90Rm91bmRSZWNpcGllbnRzOiBBcnJheTxzdHJpbmc+LFxuXHQpOiBQcm9taXNlPEludGVybmFsUmVjaXBpZW50S2V5RGF0YSB8IFN5bUVuY0ludGVybmFsUmVjaXBpZW50S2V5RGF0YSB8IG51bGw+IHtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgcHViS2V5cyA9IGF3YWl0IHRoaXMucHVibGljS2V5UHJvdmlkZXIubG9hZEN1cnJlbnRQdWJLZXkoe1xuXHRcdFx0XHRpZGVudGlmaWVyOiByZWNpcGllbnRNYWlsQWRkcmVzcyxcblx0XHRcdFx0aWRlbnRpZmllclR5cGU6IFB1YmxpY0tleUlkZW50aWZpZXJUeXBlLk1BSUxfQUREUkVTUyxcblx0XHRcdH0pXG5cdFx0XHQvLyBXZSBkbyBub3QgY3JlYXRlIGFueSBrZXkgZGF0YSBpbiBjYXNlIHRoZXJlIGlzIG9uZSBub3QgZm91bmQgcmVjaXBpZW50LCBidXQgd2Ugd2FudCB0b1xuXHRcdFx0Ly8gY29sbGVjdCBBTEwgbm90IGZvdW5kIHJlY2lwaWVudHMgd2hlbiBpdGVyYXRpbmcgYSByZWNpcGllbnQgbGlzdC5cblx0XHRcdGlmIChub3RGb3VuZFJlY2lwaWVudHMubGVuZ3RoICE9PSAwKSB7XG5cdFx0XHRcdHJldHVybiBudWxsXG5cdFx0XHR9XG5cdFx0XHRjb25zdCBpc0V4dGVybmFsU2VuZGVyID0gdGhpcy51c2VyRmFjYWRlLmdldFVzZXIoKT8uYWNjb3VudFR5cGUgPT09IEFjY291bnRUeXBlLkVYVEVSTkFMXG5cdFx0XHQvLyB3ZSBvbmx5IGVuY3J5cHQgc3ltbWV0cmljIGFzIGV4dGVybmFsIHNlbmRlciBpZiB0aGUgcmVjaXBpZW50IHN1cHBvcnRzIHR1dGEtY3J5cHQuXG5cdFx0XHQvLyBDbGllbnRzIG5lZWQgdG8gc3VwcG9ydCBzeW1tZXRyaWMgZGVjcnlwdGlvbiBmcm9tIGV4dGVybmFsIHVzZXJzLiBXZSBjYW4gYWx3YXlzIGVuY3J5cHQgc3ltbWV0cmljbHkgd2hlbiBvbGQgY2xpZW50cyBhcmUgZGVhY3RpdmF0ZWQgdGhhdCBkb24ndCBzdXBwb3J0IHR1dGEtY3J5cHQuXG5cdFx0XHRpZiAocHViS2V5cy5vYmplY3QucHViS3liZXJLZXkgJiYgaXNFeHRlcm5hbFNlbmRlcikge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5jcmVhdGVTeW1FbmNJbnRlcm5hbFJlY2lwaWVudEtleURhdGEocmVjaXBpZW50TWFpbEFkZHJlc3MsIGJ1Y2tldEtleSlcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLmNyZWF0ZVB1YkVuY0ludGVybmFsUmVjaXBpZW50S2V5RGF0YShidWNrZXRLZXksIHJlY2lwaWVudE1haWxBZGRyZXNzLCBwdWJLZXlzLCBzZW5kZXJVc2VyR3JvdXBJZClcblx0XHRcdH1cblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRpZiAoZSBpbnN0YW5jZW9mIE5vdEZvdW5kRXJyb3IpIHtcblx0XHRcdFx0bm90Rm91bmRSZWNpcGllbnRzLnB1c2gocmVjaXBpZW50TWFpbEFkZHJlc3MpXG5cdFx0XHRcdHJldHVybiBudWxsXG5cdFx0XHR9IGVsc2UgaWYgKGUgaW5zdGFuY2VvZiBUb29NYW55UmVxdWVzdHNFcnJvcikge1xuXHRcdFx0XHR0aHJvdyBuZXcgUmVjaXBpZW50Tm90UmVzb2x2ZWRFcnJvcihcIlwiKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhyb3cgZVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgY3JlYXRlUHViRW5jSW50ZXJuYWxSZWNpcGllbnRLZXlEYXRhKFxuXHRcdGJ1Y2tldEtleTogQWVzS2V5LFxuXHRcdHJlY2lwaWVudE1haWxBZGRyZXNzOiBzdHJpbmcsXG5cdFx0cmVjaXBpZW50UHVibGljS2V5czogVmVyc2lvbmVkPFB1YmxpY0tleXM+LFxuXHRcdHNlbmRlckdyb3VwSWQ6IElkLFxuXHQpIHtcblx0XHRjb25zdCBwdWJFbmNCdWNrZXRLZXkgPSBhd2FpdCB0aGlzLmFzeW1tZXRyaWNDcnlwdG9GYWNhZGUuYXN5bUVuY3J5cHRTeW1LZXkoYnVja2V0S2V5LCByZWNpcGllbnRQdWJsaWNLZXlzLCBzZW5kZXJHcm91cElkKVxuXHRcdHJldHVybiBjcmVhdGVJbnRlcm5hbFJlY2lwaWVudEtleURhdGEoe1xuXHRcdFx0bWFpbEFkZHJlc3M6IHJlY2lwaWVudE1haWxBZGRyZXNzLFxuXHRcdFx0cHViRW5jQnVja2V0S2V5OiBwdWJFbmNCdWNrZXRLZXkucHViRW5jU3ltS2V5Qnl0ZXMsXG5cdFx0XHRyZWNpcGllbnRLZXlWZXJzaW9uOiBwdWJFbmNCdWNrZXRLZXkucmVjaXBpZW50S2V5VmVyc2lvbi50b1N0cmluZygpLFxuXHRcdFx0c2VuZGVyS2V5VmVyc2lvbjogcHViRW5jQnVja2V0S2V5LnNlbmRlcktleVZlcnNpb24gIT0gbnVsbCA/IHB1YkVuY0J1Y2tldEtleS5zZW5kZXJLZXlWZXJzaW9uLnRvU3RyaW5nKCkgOiBudWxsLFxuXHRcdFx0cHJvdG9jb2xWZXJzaW9uOiBwdWJFbmNCdWNrZXRLZXkuY3J5cHRvUHJvdG9jb2xWZXJzaW9uLFxuXHRcdH0pXG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIGNyZWF0ZVN5bUVuY0ludGVybmFsUmVjaXBpZW50S2V5RGF0YShyZWNpcGllbnRNYWlsQWRkcmVzczogc3RyaW5nLCBidWNrZXRLZXk6IEFlc0tleSkge1xuXHRcdGNvbnN0IGtleUdyb3VwID0gdGhpcy51c2VyRmFjYWRlLmdldEdyb3VwSWQoR3JvdXBUeXBlLk1haWwpXG5cdFx0Y29uc3QgZXh0ZXJuYWxNYWlsR3JvdXBLZXkgPSBhd2FpdCB0aGlzLmtleUxvYWRlckZhY2FkZS5nZXRDdXJyZW50U3ltR3JvdXBLZXkoa2V5R3JvdXApXG5cdFx0cmV0dXJuIGNyZWF0ZVN5bUVuY0ludGVybmFsUmVjaXBpZW50S2V5RGF0YSh7XG5cdFx0XHRtYWlsQWRkcmVzczogcmVjaXBpZW50TWFpbEFkZHJlc3MsXG5cdFx0XHRzeW1FbmNCdWNrZXRLZXk6IGVuY3J5cHRLZXkoZXh0ZXJuYWxNYWlsR3JvdXBLZXkub2JqZWN0LCBidWNrZXRLZXkpLFxuXHRcdFx0a2V5R3JvdXAsXG5cdFx0XHRzeW1LZXlWZXJzaW9uOiBTdHJpbmcoZXh0ZXJuYWxNYWlsR3JvdXBLZXkudmVyc2lvbiksXG5cdFx0fSlcblx0fVxuXG5cdC8qKlxuXHQgKiBVcGRhdGVzIHRoZSBnaXZlbiBwdWJsaWMgcGVybWlzc2lvbiB3aXRoIHRoZSBnaXZlbiBzeW1tZXRyaWMga2V5IGZvciBmYXN0ZXIgYWNjZXNzIGlmIHRoZSBjbGllbnQgaXMgdGhlIGxlYWRlciBhbmQgb3RoZXJ3aXNlIGRvZXMgbm90aGluZy5cblx0ICogQHBhcmFtIHR5cGVNb2RlbCBUaGUgdHlwZSBtb2RlbCBvZiB0aGUgaW5zdGFuY2Vcblx0ICogQHBhcmFtIGluc3RhbmNlIFRoZSB1bmVuY3J5cHRlZCAoY2xpZW50LXNpZGUpIG9yIGVuY3J5cHRlZCAoc2VydmVyLXNpZGUpIGluc3RhbmNlXG5cdCAqIEBwYXJhbSBwZXJtaXNzaW9uIFRoZSBwZXJtaXNzaW9uLlxuXHQgKiBAcGFyYW0gYnVja2V0UGVybWlzc2lvbiBUaGUgYnVja2V0IHBlcm1pc3Npb24uXG5cdCAqIEBwYXJhbSBwZXJtaXNzaW9uT3duZXJHcm91cEtleSBUaGUgc3ltbWV0cmljIGdyb3VwIGtleSBmb3IgdGhlIG93bmVyIGdyb3VwIG9uIHRoZSBwZXJtaXNzaW9uLlxuXHQgKiBAcGFyYW0gc2Vzc2lvbktleSBUaGUgc3ltbWV0cmljIHNlc3Npb24ga2V5LlxuXHQgKi9cblx0cHJpdmF0ZSBhc3luYyB1cGRhdGVXaXRoU3ltUGVybWlzc2lvbktleShcblx0XHR0eXBlTW9kZWw6IFR5cGVNb2RlbCxcblx0XHRpbnN0YW5jZTogUmVjb3JkPHN0cmluZywgYW55Pixcblx0XHRwZXJtaXNzaW9uOiBQZXJtaXNzaW9uLFxuXHRcdGJ1Y2tldFBlcm1pc3Npb246IEJ1Y2tldFBlcm1pc3Npb24sXG5cdFx0cGVybWlzc2lvbk93bmVyR3JvdXBLZXk6IFZlcnNpb25lZEtleSxcblx0XHRzZXNzaW9uS2V5OiBBZXNLZXksXG5cdCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGlmICghdGhpcy5pc0xpdGVyYWxJbnN0YW5jZShpbnN0YW5jZSkgfHwgIXRoaXMudXNlckZhY2FkZS5pc0xlYWRlcigpKSB7XG5cdFx0XHQvLyBkbyBub3QgdXBkYXRlIHRoZSBzZXNzaW9uIGtleSBpbiBjYXNlIG9mIGFuIHVuZW5jcnlwdGVkIChjbGllbnQtc2lkZSkgaW5zdGFuY2Vcblx0XHRcdC8vIG9yIGluIGNhc2Ugd2UgYXJlIG5vdCB0aGUgbGVhZGVyIGNsaWVudFxuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0aWYgKCFpbnN0YW5jZS5fb3duZXJFbmNTZXNzaW9uS2V5ICYmIHBlcm1pc3Npb24uX293bmVyR3JvdXAgPT09IGluc3RhbmNlLl9vd25lckdyb3VwKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy51cGRhdGVPd25lckVuY1Nlc3Npb25LZXkodHlwZU1vZGVsLCBpbnN0YW5jZSwgcGVybWlzc2lvbk93bmVyR3JvdXBLZXksIHNlc3Npb25LZXkpXG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGluc3RhbmNlcyBzaGFyZWQgdmlhIHBlcm1pc3Npb25zIChlLmcuIGJvZHkpXG5cdFx0XHRjb25zdCBlbmNyeXB0ZWRLZXkgPSBlbmNyeXB0S2V5V2l0aFZlcnNpb25lZEtleShwZXJtaXNzaW9uT3duZXJHcm91cEtleSwgc2Vzc2lvbktleSlcblx0XHRcdGxldCB1cGRhdGVTZXJ2aWNlID0gY3JlYXRlVXBkYXRlUGVybWlzc2lvbktleURhdGEoe1xuXHRcdFx0XHRvd25lcktleVZlcnNpb246IFN0cmluZyhlbmNyeXB0ZWRLZXkuZW5jcnlwdGluZ0tleVZlcnNpb24pLFxuXHRcdFx0XHRvd25lckVuY1Nlc3Npb25LZXk6IGVuY3J5cHRlZEtleS5rZXksXG5cdFx0XHRcdHBlcm1pc3Npb246IHBlcm1pc3Npb24uX2lkLFxuXHRcdFx0XHRidWNrZXRQZXJtaXNzaW9uOiBidWNrZXRQZXJtaXNzaW9uLl9pZCxcblx0XHRcdH0pXG5cdFx0XHRhd2FpdCB0aGlzLnNlcnZpY2VFeGVjdXRvci5wb3N0KFVwZGF0ZVBlcm1pc3Npb25LZXlTZXJ2aWNlLCB1cGRhdGVTZXJ2aWNlKVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXNvbHZlcyB0aGUgb3duZXJFbmNTZXNzaW9uS2V5IG9mIGEgbWFpbC4gVGhpcyBtaWdodCBiZSBuZWVkZWQgaWYgaXQgd2Fzbid0IHVwZGF0ZWQgeWV0XG5cdCAqIGJ5IHRoZSBPd25lckVuY1Nlc3Npb25LZXlzVXBkYXRlUXVldWUgYnV0IHRoZSBmaWxlIGlzIGFscmVhZHkgZG93bmxvYWRlZC5cblx0ICogQHBhcmFtIG1haW5JbnN0YW5jZSB0aGUgaW5zdGFuY2UgdGhhdCBoYXMgdGhlIGJ1Y2tldEtleVxuXHQgKiBAcGFyYW0gY2hpbGRJbnN0YW5jZXMgdGhlIGZpbGVzIHRoYXQgYmVsb25nIHRvIHRoZSBtYWluSW5zdGFuY2Vcblx0ICovXG5cdGFzeW5jIGVuZm9yY2VTZXNzaW9uS2V5VXBkYXRlSWZOZWVkZWQobWFpbkluc3RhbmNlOiBSZWNvcmQ8c3RyaW5nLCBhbnk+LCBjaGlsZEluc3RhbmNlczogcmVhZG9ubHkgRmlsZVtdKTogUHJvbWlzZTxGaWxlW10+IHtcblx0XHRpZiAoIWNoaWxkSW5zdGFuY2VzLnNvbWUoKGYpID0+IGYuX293bmVyRW5jU2Vzc2lvbktleSA9PSBudWxsKSkge1xuXHRcdFx0cmV0dXJuIGNoaWxkSW5zdGFuY2VzLnNsaWNlKClcblx0XHR9XG5cdFx0Y29uc3QgdHlwZU1vZGVsID0gYXdhaXQgcmVzb2x2ZVR5cGVSZWZlcmVuY2UobWFpbkluc3RhbmNlLl90eXBlKVxuXHRcdGNvbnN0IG91dE9mU3luY0luc3RhbmNlcyA9IGNoaWxkSW5zdGFuY2VzLmZpbHRlcigoZikgPT4gZi5fb3duZXJFbmNTZXNzaW9uS2V5ID09IG51bGwpXG5cdFx0aWYgKG1haW5JbnN0YW5jZS5idWNrZXRLZXkpIHtcblx0XHRcdC8vIGludm9rZSB1cGRhdGVTZXNzaW9uS2V5cyBzZXJ2aWNlIGluIGNhc2UgYSBidWNrZXQga2V5IGlzIHN0aWxsIGF2YWlsYWJsZVxuXHRcdFx0Y29uc3QgYnVja2V0S2V5ID0gYXdhaXQgdGhpcy5jb252ZXJ0QnVja2V0S2V5VG9JbnN0YW5jZUlmTmVjZXNzYXJ5KG1haW5JbnN0YW5jZS5idWNrZXRLZXkpXG5cdFx0XHRjb25zdCByZXNvbHZlZFNlc3Npb25LZXlzID0gYXdhaXQgdGhpcy5yZXNvbHZlV2l0aEJ1Y2tldEtleShidWNrZXRLZXksIG1haW5JbnN0YW5jZSwgdHlwZU1vZGVsKVxuXHRcdFx0YXdhaXQgdGhpcy5vd25lckVuY1Nlc3Npb25LZXlzVXBkYXRlUXVldWUucG9zdFVwZGF0ZVNlc3Npb25LZXlzU2VydmljZShyZXNvbHZlZFNlc3Npb25LZXlzLmluc3RhbmNlU2Vzc2lvbktleXMpXG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUud2FybihcImZpbGVzIGFyZSBvdXQgb2Ygc3luYyByZWZyZXNoaW5nXCIsIG91dE9mU3luY0luc3RhbmNlcy5tYXAoKGYpID0+IGYuX2lkKS5qb2luKFwiLCBcIikpXG5cdFx0fVxuXHRcdGZvciAoY29uc3QgY2hpbGRJbnN0YW5jZSBvZiBvdXRPZlN5bmNJbnN0YW5jZXMpIHtcblx0XHRcdGF3YWl0IHRoaXMuY2FjaGU/LmRlbGV0ZUZyb21DYWNoZUlmRXhpc3RzKEZpbGVUeXBlUmVmLCBnZXRMaXN0SWQoY2hpbGRJbnN0YW5jZSksIGdldEVsZW1lbnRJZChjaGlsZEluc3RhbmNlKSlcblx0XHR9XG5cdFx0Ly8gd2UgaGF2ZSBhIGNhY2hpbmcgZW50aXR5IGNsaWVudCwgc28gdGhpcyByZS1pbnNlcnRzIHRoZSBkZWxldGVkIGluc3RhbmNlc1xuXHRcdHJldHVybiBhd2FpdCB0aGlzLmVudGl0eUNsaWVudC5sb2FkTXVsdGlwbGUoXG5cdFx0XHRGaWxlVHlwZVJlZixcblx0XHRcdGdldExpc3RJZChjaGlsZEluc3RhbmNlc1swXSksXG5cdFx0XHRjaGlsZEluc3RhbmNlcy5tYXAoKGNoaWxkSW5zdGFuY2UpID0+IGdldEVsZW1lbnRJZChjaGlsZEluc3RhbmNlKSksXG5cdFx0KVxuXHR9XG5cblx0cHJpdmF0ZSB1cGRhdGVPd25lckVuY1Nlc3Npb25LZXkodHlwZU1vZGVsOiBUeXBlTW9kZWwsIGluc3RhbmNlOiBSZWNvcmQ8c3RyaW5nLCBhbnk+LCBvd25lckdyb3VwS2V5OiBWZXJzaW9uZWRLZXksIHNlc3Npb25LZXk6IEFlc0tleSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHRoaXMuc2V0T3duZXJFbmNTZXNzaW9uS2V5VW5tYXBwZWQoaW5zdGFuY2UgYXMgVW5tYXBwZWRPd25lckdyb3VwSW5zdGFuY2UsIGVuY3J5cHRLZXlXaXRoVmVyc2lvbmVkS2V5KG93bmVyR3JvdXBLZXksIHNlc3Npb25LZXkpKVxuXHRcdC8vIHdlIGhhdmUgdG8gY2FsbCB0aGUgcmVzdCBjbGllbnQgZGlyZWN0bHkgYmVjYXVzZSBpbnN0YW5jZSBpcyBzdGlsbCB0aGUgZW5jcnlwdGVkIHNlcnZlci1zaWRlIHZlcnNpb25cblx0XHRjb25zdCBwYXRoID0gdHlwZVJlZlRvUGF0aChuZXcgVHlwZVJlZih0eXBlTW9kZWwuYXBwLCB0eXBlTW9kZWwubmFtZSkpICsgXCIvXCIgKyAoaW5zdGFuY2UuX2lkIGluc3RhbmNlb2YgQXJyYXkgPyBpbnN0YW5jZS5faWQuam9pbihcIi9cIikgOiBpbnN0YW5jZS5faWQpXG5cdFx0Y29uc3QgaGVhZGVycyA9IHRoaXMudXNlckZhY2FkZS5jcmVhdGVBdXRoSGVhZGVycygpXG5cdFx0aGVhZGVycy52ID0gdHlwZU1vZGVsLnZlcnNpb25cblx0XHRyZXR1cm4gdGhpcy5yZXN0Q2xpZW50XG5cdFx0XHQucmVxdWVzdChwYXRoLCBIdHRwTWV0aG9kLlBVVCwge1xuXHRcdFx0XHRoZWFkZXJzLFxuXHRcdFx0XHRib2R5OiBKU09OLnN0cmluZ2lmeShpbnN0YW5jZSksXG5cdFx0XHRcdHF1ZXJ5UGFyYW1zOiB7IHVwZGF0ZU93bmVyRW5jU2Vzc2lvbktleTogXCJ0cnVlXCIgfSxcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goXG5cdFx0XHRcdG9mQ2xhc3MoUGF5bG9hZFRvb0xhcmdlRXJyb3IsIChlKSA9PiB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coXCJDb3VsZCBub3QgdXBkYXRlIG93bmVyIGVuYyBzZXNzaW9uIGtleSAtIFBheWxvYWRUb29MYXJnZUVycm9yXCIsIGUpXG5cdFx0XHRcdH0pLFxuXHRcdFx0KVxuXHR9XG5cblx0cHJpdmF0ZSBnZXRFbGVtZW50SWRGcm9tSW5zdGFuY2UoaW5zdGFuY2U6IFJlY29yZDxzdHJpbmcsIGFueT4pOiBJZCB7XG5cdFx0aWYgKHR5cGVvZiBpbnN0YW5jZS5faWQgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdHJldHVybiBpbnN0YW5jZS5faWRcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3QgaWRUdXBsZSA9IGluc3RhbmNlLl9pZCBhcyBJZFR1cGxlXG5cdFx0XHRyZXR1cm4gZWxlbWVudElkUGFydChpZFR1cGxlKVxuXHRcdH1cblx0fVxufVxuXG5pZiAoIShcInRvSlNPTlwiIGluIEVycm9yLnByb3RvdHlwZSkpIHtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KEVycm9yLnByb3RvdHlwZSBhcyBhbnksIFwidG9KU09OXCIsIHtcblx0XHR2YWx1ZTogZnVuY3Rpb24gKCkge1xuXHRcdFx0Y29uc3QgYWx0OiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge31cblx0XHRcdGZvciAobGV0IGtleSBvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0aGlzKSkge1xuXHRcdFx0XHRhbHRba2V5XSA9IHRoaXNba2V5XVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGFsdFxuXHRcdH0sXG5cdFx0Y29uZmlndXJhYmxlOiB0cnVlLFxuXHRcdHdyaXRhYmxlOiB0cnVlLFxuXHR9KVxufVxuIiwiaW1wb3J0IHsgcmVzb2x2ZVR5cGVSZWZlcmVuY2UgfSBmcm9tIFwiLi4vLi4vY29tbW9uL0VudGl0eUZ1bmN0aW9uc1wiXG5pbXBvcnQgeyBQcm9ncmFtbWluZ0Vycm9yIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9lcnJvci9Qcm9ncmFtbWluZ0Vycm9yXCJcbmltcG9ydCB0eXBlIHsgQmFzZTY0IH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5pbXBvcnQge1xuXHRhc3NlcnROb3ROdWxsLFxuXHRiYXNlNjRUb0Jhc2U2NFVybCxcblx0YmFzZTY0VG9VaW50OEFycmF5LFxuXHRkb3duY2FzdCxcblx0cHJvbWlzZU1hcCxcblx0c3RyaW5nVG9VdGY4VWludDhBcnJheSxcblx0VHlwZVJlZixcblx0dWludDhBcnJheVRvQmFzZTY0LFxuXHR1dGY4VWludDhBcnJheVRvU3RyaW5nLFxufSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB7IEFzc29jaWF0aW9uVHlwZSwgQ2FyZGluYWxpdHksIFR5cGUsIFZhbHVlVHlwZSB9IGZyb20gXCIuLi8uLi9jb21tb24vRW50aXR5Q29uc3RhbnRzLmpzXCJcbmltcG9ydCB7IGNvbXByZXNzLCB1bmNvbXByZXNzIH0gZnJvbSBcIi4uL0NvbXByZXNzaW9uXCJcbmltcG9ydCB0eXBlIHsgTW9kZWxWYWx1ZSwgVHlwZU1vZGVsIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9FbnRpdHlUeXBlc1wiXG5pbXBvcnQgeyBhc3NlcnRXb3JrZXJPck5vZGUgfSBmcm9tIFwiLi4vLi4vY29tbW9uL0VudlwiXG5pbXBvcnQgeyBhZXNEZWNyeXB0LCBhZXNFbmNyeXB0LCBBZXNLZXksIEVOQUJMRV9NQUMsIElWX0JZVEVfTEVOR1RILCByYW5kb20gfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLWNyeXB0b1wiXG5pbXBvcnQgeyBDcnlwdG9FcnJvciB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtY3J5cHRvL2Vycm9yLmpzXCJcblxuYXNzZXJ0V29ya2VyT3JOb2RlKClcblxuZXhwb3J0IGNsYXNzIEluc3RhbmNlTWFwcGVyIHtcblx0LyoqXG5cdCAqIERlY3J5cHRzIGFuIG9iamVjdCBsaXRlcmFsIGFzIHJlY2VpdmVkIGZyb20gdGhlIERCIGFuZCBtYXBzIGl0IHRvIGFuIGVudGl0eSBjbGFzcyAoZS5nLiBNYWlsKVxuXHQgKiBAcGFyYW0gbW9kZWwgVGhlIFR5cGVNb2RlbCBvZiB0aGUgaW5zdGFuY2Vcblx0ICogQHBhcmFtIGluc3RhbmNlIFRoZSBvYmplY3QgbGl0ZXJhbCBhcyByZWNlaXZlZCBmcm9tIHRoZSBEQlxuXHQgKiBAcGFyYW0gc2sgVGhlIHNlc3Npb24ga2V5LCBtdXN0IGJlIHByb3ZpZGVkIGZvciBlbmNyeXB0ZWQgaW5zdGFuY2VzXG5cdCAqIEByZXR1cm5zIFRoZSBkZWNyeXB0ZWQgYW5kIG1hcHBlZCBpbnN0YW5jZVxuXHQgKi9cblx0ZGVjcnlwdEFuZE1hcFRvSW5zdGFuY2U8VD4obW9kZWw6IFR5cGVNb2RlbCwgaW5zdGFuY2U6IFJlY29yZDxzdHJpbmcsIGFueT4sIHNrOiBBZXNLZXkgfCBudWxsKTogUHJvbWlzZTxUPiB7XG5cdFx0bGV0IGRlY3J5cHRlZDogYW55ID0ge1xuXHRcdFx0X3R5cGU6IG5ldyBUeXBlUmVmKG1vZGVsLmFwcCwgbW9kZWwubmFtZSksXG5cdFx0fVxuXG5cdFx0Zm9yIChsZXQga2V5IG9mIE9iamVjdC5rZXlzKG1vZGVsLnZhbHVlcykpIHtcblx0XHRcdGxldCB2YWx1ZVR5cGUgPSBtb2RlbC52YWx1ZXNba2V5XVxuXHRcdFx0bGV0IHZhbHVlID0gaW5zdGFuY2Vba2V5XVxuXG5cdFx0XHR0cnkge1xuXHRcdFx0XHRkZWNyeXB0ZWRba2V5XSA9IGRlY3J5cHRWYWx1ZShrZXksIHZhbHVlVHlwZSwgdmFsdWUsIHNrKVxuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRpZiAoZGVjcnlwdGVkLl9lcnJvcnMgPT0gbnVsbCkge1xuXHRcdFx0XHRcdGRlY3J5cHRlZC5fZXJyb3JzID0ge31cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGRlY3J5cHRlZC5fZXJyb3JzW2tleV0gPSBKU09OLnN0cmluZ2lmeShlKVxuXHRcdFx0XHRjb25zb2xlLmxvZyhcImVycm9yIHdoZW4gZGVjcnlwdGluZyB2YWx1ZSBvbiB0eXBlOlwiLCBgWyR7bW9kZWwuYXBwfSwke21vZGVsLm5hbWV9XWAsIFwia2V5OlwiLCBrZXksIGUpXG5cdFx0XHR9IGZpbmFsbHkge1xuXHRcdFx0XHRpZiAodmFsdWVUeXBlLmVuY3J5cHRlZCkge1xuXHRcdFx0XHRcdGlmICh2YWx1ZVR5cGUuZmluYWwpIHtcblx0XHRcdFx0XHRcdC8vIHdlIGhhdmUgdG8gc3RvcmUgdGhlIGVuY3J5cHRlZCB2YWx1ZSB0byBiZSBhYmxlIHRvIHJlc3RvcmUgaXQgd2hlbiB1cGRhdGluZyB0aGUgaW5zdGFuY2UuIHRoaXMgaXMgbm90IG5lZWRlZCBmb3IgZGF0YSB0cmFuc2ZlciB0eXBlcywgYnV0IGl0IGRvZXMgbm90IGh1cnRcblx0XHRcdFx0XHRcdGRlY3J5cHRlZFtcIl9maW5hbEVuY3J5cHRlZF9cIiArIGtleV0gPSB2YWx1ZVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAodmFsdWUgPT09IFwiXCIpIHtcblx0XHRcdFx0XHRcdC8vIHdlIGhhdmUgdG8gc3RvcmUgdGhlIGRlZmF1bHQgdmFsdWUgdG8gbWFrZSBzdXJlIHRoYXQgdXBkYXRlcyBkbyBub3QgY2F1c2UgbW9yZSBzdG9yYWdlIHVzZVxuXHRcdFx0XHRcdFx0ZGVjcnlwdGVkW1wiX2RlZmF1bHRFbmNyeXB0ZWRfXCIgKyBrZXldID0gZGVjcnlwdGVkW2tleV1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gcHJvbWlzZU1hcChPYmplY3Qua2V5cyhtb2RlbC5hc3NvY2lhdGlvbnMpLCBhc3luYyAoYXNzb2NpYXRpb25OYW1lKSA9PiB7XG5cdFx0XHRpZiAobW9kZWwuYXNzb2NpYXRpb25zW2Fzc29jaWF0aW9uTmFtZV0udHlwZSA9PT0gQXNzb2NpYXRpb25UeXBlLkFnZ3JlZ2F0aW9uKSB7XG5cdFx0XHRcdGNvbnN0IGRlcGVuZGVuY3kgPSBtb2RlbC5hc3NvY2lhdGlvbnNbYXNzb2NpYXRpb25OYW1lXS5kZXBlbmRlbmN5XG5cdFx0XHRcdGNvbnN0IGFnZ3JlZ2F0ZVR5cGVNb2RlbCA9IGF3YWl0IHJlc29sdmVUeXBlUmVmZXJlbmNlKG5ldyBUeXBlUmVmKGRlcGVuZGVuY3kgfHwgbW9kZWwuYXBwLCBtb2RlbC5hc3NvY2lhdGlvbnNbYXNzb2NpYXRpb25OYW1lXS5yZWZUeXBlKSlcblx0XHRcdFx0bGV0IGFnZ3JlZ2F0aW9uID0gbW9kZWwuYXNzb2NpYXRpb25zW2Fzc29jaWF0aW9uTmFtZV1cblxuXHRcdFx0XHRpZiAoYWdncmVnYXRpb24uY2FyZGluYWxpdHkgPT09IENhcmRpbmFsaXR5Llplcm9Pck9uZSAmJiBpbnN0YW5jZVthc3NvY2lhdGlvbk5hbWVdID09IG51bGwpIHtcblx0XHRcdFx0XHRkZWNyeXB0ZWRbYXNzb2NpYXRpb25OYW1lXSA9IG51bGxcblx0XHRcdFx0fSBlbHNlIGlmIChpbnN0YW5jZVthc3NvY2lhdGlvbk5hbWVdID09IG51bGwpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgUHJvZ3JhbW1pbmdFcnJvcihgVW5kZWZpbmVkIGFnZ3JlZ2F0aW9uICR7bW9kZWwubmFtZX06JHthc3NvY2lhdGlvbk5hbWV9YClcblx0XHRcdFx0fSBlbHNlIGlmIChhZ2dyZWdhdGlvbi5jYXJkaW5hbGl0eSA9PT0gQ2FyZGluYWxpdHkuQW55KSB7XG5cdFx0XHRcdFx0cmV0dXJuIHByb21pc2VNYXAoaW5zdGFuY2VbYXNzb2NpYXRpb25OYW1lXSwgKGFnZ3JlZ2F0ZSkgPT4ge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRoaXMuZGVjcnlwdEFuZE1hcFRvSW5zdGFuY2UoYWdncmVnYXRlVHlwZU1vZGVsLCBkb3duY2FzdDxSZWNvcmQ8c3RyaW5nLCBhbnk+PihhZ2dyZWdhdGUpLCBzaylcblx0XHRcdFx0XHR9KS50aGVuKChkZWNyeXB0ZWRBZ2dyZWdhdGVzKSA9PiB7XG5cdFx0XHRcdFx0XHRkZWNyeXB0ZWRbYXNzb2NpYXRpb25OYW1lXSA9IGRlY3J5cHRlZEFnZ3JlZ2F0ZXNcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLmRlY3J5cHRBbmRNYXBUb0luc3RhbmNlKGFnZ3JlZ2F0ZVR5cGVNb2RlbCwgaW5zdGFuY2VbYXNzb2NpYXRpb25OYW1lXSwgc2spLnRoZW4oKGRlY3J5cHRlZEFnZ3JlZ2F0ZSkgPT4ge1xuXHRcdFx0XHRcdFx0ZGVjcnlwdGVkW2Fzc29jaWF0aW9uTmFtZV0gPSBkZWNyeXB0ZWRBZ2dyZWdhdGVcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRkZWNyeXB0ZWRbYXNzb2NpYXRpb25OYW1lXSA9IGluc3RhbmNlW2Fzc29jaWF0aW9uTmFtZV1cblx0XHRcdH1cblx0XHR9KS50aGVuKCgpID0+IHtcblx0XHRcdHJldHVybiBkZWNyeXB0ZWRcblx0XHR9KVxuXHR9XG5cblx0ZW5jcnlwdEFuZE1hcFRvTGl0ZXJhbDxUPihtb2RlbDogVHlwZU1vZGVsLCBpbnN0YW5jZTogVCwgc2s6IEFlc0tleSB8IG51bGwpOiBQcm9taXNlPFJlY29yZDxzdHJpbmcsIHVua25vd24+PiB7XG5cdFx0aWYgKG1vZGVsLmVuY3J5cHRlZCAmJiBzayA9PSBudWxsKSB7XG5cdFx0XHR0aHJvdyBuZXcgUHJvZ3JhbW1pbmdFcnJvcihgRW5jcnlwdGluZyAke21vZGVsLmFwcH0vJHttb2RlbC5uYW1lfSByZXF1aXJlcyBhIHNlc3Npb24ga2V5IWApXG5cdFx0fVxuXHRcdGxldCBlbmNyeXB0ZWQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge31cblx0XHRsZXQgaSA9IGluc3RhbmNlIGFzIGFueVxuXG5cdFx0Zm9yIChsZXQga2V5IG9mIE9iamVjdC5rZXlzKG1vZGVsLnZhbHVlcykpIHtcblx0XHRcdGxldCB2YWx1ZVR5cGUgPSBtb2RlbC52YWx1ZXNba2V5XVxuXHRcdFx0bGV0IHZhbHVlID0gaVtrZXldXG5cblx0XHRcdGxldCBlbmNyeXB0ZWRWYWx1ZVxuXHRcdFx0Ly8gcmVzdG9yZSB0aGUgb3JpZ2luYWwgZW5jcnlwdGVkIHZhbHVlIGlmIGl0IGV4aXN0cy4gaXQgZG9lcyBub3QgZXhpc3QgaWYgdGhpcyBpcyBhIGRhdGEgdHJhbnNmZXIgdHlwZSBvciBhIG5ld2x5IGNyZWF0ZWQgZW50aXR5LiBjaGVjayBhZ2FpbnN0IG51bGwgZXhwbGljaXRlbHkgYmVjYXVzZSBcIlwiIGlzIGFsbG93ZWRcblx0XHRcdGlmICh2YWx1ZVR5cGUuZW5jcnlwdGVkICYmIHZhbHVlVHlwZS5maW5hbCAmJiBpW1wiX2ZpbmFsRW5jcnlwdGVkX1wiICsga2V5XSAhPSBudWxsKSB7XG5cdFx0XHRcdGVuY3J5cHRlZFZhbHVlID0gaVtcIl9maW5hbEVuY3J5cHRlZF9cIiArIGtleV1cblx0XHRcdH0gZWxzZSBpZiAodmFsdWVUeXBlLmVuY3J5cHRlZCAmJiAoaVtcIl9maW5hbEl2c1wiXT8uW2tleV0gYXMgVWludDhBcnJheSB8IG51bGwpPy5sZW5ndGggPT09IDAgJiYgaXNEZWZhdWx0VmFsdWUodmFsdWVUeXBlLnR5cGUsIHZhbHVlKSkge1xuXHRcdFx0XHQvLyByZXN0b3JlIHRoZSBkZWZhdWx0IGVuY3J5cHRlZCB2YWx1ZSBiZWNhdXNlIGl0IGhhcyBub3QgY2hhbmdlZFxuXHRcdFx0XHQvLyBub3RlOiB0aGlzIGJydW5jaCBtdXN0IGJlIGNoZWNrZWQgKmJlZm9yZSogdGhlIG9uZSB3aGljaCByZXVzZXMgSVZzIGFzIHRoaXMgb25lIGNoZWNrc1xuXHRcdFx0XHQvLyB0aGUgbGVuZ3RoLlxuXHRcdFx0XHRlbmNyeXB0ZWRWYWx1ZSA9IFwiXCJcblx0XHRcdH0gZWxzZSBpZiAodmFsdWVUeXBlLmVuY3J5cHRlZCAmJiB2YWx1ZVR5cGUuZmluYWwgJiYgaVtcIl9maW5hbEl2c1wiXT8uW2tleV0gIT0gbnVsbCkge1xuXHRcdFx0XHRjb25zdCBmaW5hbEl2ID0gaVtcIl9maW5hbEl2c1wiXVtrZXldXG5cdFx0XHRcdGVuY3J5cHRlZFZhbHVlID0gZW5jcnlwdFZhbHVlKGtleSwgdmFsdWVUeXBlLCB2YWx1ZSwgc2ssIGZpbmFsSXYpXG5cdFx0XHR9IGVsc2UgaWYgKHZhbHVlVHlwZS5lbmNyeXB0ZWQgJiYgaVtcIl9kZWZhdWx0RW5jcnlwdGVkX1wiICsga2V5XSA9PT0gdmFsdWUpIHtcblx0XHRcdFx0Ly8gcmVzdG9yZSB0aGUgZGVmYXVsdCBlbmNyeXB0ZWQgdmFsdWUgYmVjYXVzZSBpdCBoYXMgbm90IGNoYW5nZWRcblx0XHRcdFx0ZW5jcnlwdGVkVmFsdWUgPSBcIlwiXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRlbmNyeXB0ZWRWYWx1ZSA9IGVuY3J5cHRWYWx1ZShrZXksIHZhbHVlVHlwZSwgdmFsdWUsIHNrKVxuXHRcdFx0fVxuXHRcdFx0ZW5jcnlwdGVkW2tleV0gPSBlbmNyeXB0ZWRWYWx1ZVxuXHRcdH1cblxuXHRcdGlmIChtb2RlbC50eXBlID09PSBUeXBlLkFnZ3JlZ2F0ZWQgJiYgIWVuY3J5cHRlZC5faWQpIHtcblx0XHRcdGVuY3J5cHRlZC5faWQgPSBiYXNlNjRUb0Jhc2U2NFVybCh1aW50OEFycmF5VG9CYXNlNjQocmFuZG9tLmdlbmVyYXRlUmFuZG9tRGF0YSg0KSkpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHByb21pc2VNYXAoT2JqZWN0LmtleXMobW9kZWwuYXNzb2NpYXRpb25zKSwgYXN5bmMgKGFzc29jaWF0aW9uTmFtZSkgPT4ge1xuXHRcdFx0aWYgKG1vZGVsLmFzc29jaWF0aW9uc1thc3NvY2lhdGlvbk5hbWVdLnR5cGUgPT09IEFzc29jaWF0aW9uVHlwZS5BZ2dyZWdhdGlvbikge1xuXHRcdFx0XHRjb25zdCBkZXBlbmRlbmN5ID0gbW9kZWwuYXNzb2NpYXRpb25zW2Fzc29jaWF0aW9uTmFtZV0uZGVwZW5kZW5jeVxuXHRcdFx0XHRjb25zdCBhZ2dyZWdhdGVUeXBlTW9kZWwgPSBhd2FpdCByZXNvbHZlVHlwZVJlZmVyZW5jZShuZXcgVHlwZVJlZihkZXBlbmRlbmN5IHx8IG1vZGVsLmFwcCwgbW9kZWwuYXNzb2NpYXRpb25zW2Fzc29jaWF0aW9uTmFtZV0ucmVmVHlwZSkpXG5cdFx0XHRcdGxldCBhZ2dyZWdhdGlvbiA9IG1vZGVsLmFzc29jaWF0aW9uc1thc3NvY2lhdGlvbk5hbWVdXG5cdFx0XHRcdGlmIChhZ2dyZWdhdGlvbi5jYXJkaW5hbGl0eSA9PT0gQ2FyZGluYWxpdHkuWmVyb09yT25lICYmIGlbYXNzb2NpYXRpb25OYW1lXSA9PSBudWxsKSB7XG5cdFx0XHRcdFx0ZW5jcnlwdGVkW2Fzc29jaWF0aW9uTmFtZV0gPSBudWxsXG5cdFx0XHRcdH0gZWxzZSBpZiAoaVthc3NvY2lhdGlvbk5hbWVdID09IG51bGwpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgUHJvZ3JhbW1pbmdFcnJvcihgVW5kZWZpbmVkIGF0dHJpYnV0ZSAke21vZGVsLm5hbWV9OiR7YXNzb2NpYXRpb25OYW1lfWApXG5cdFx0XHRcdH0gZWxzZSBpZiAoYWdncmVnYXRpb24uY2FyZGluYWxpdHkgPT09IENhcmRpbmFsaXR5LkFueSkge1xuXHRcdFx0XHRcdHJldHVybiBwcm9taXNlTWFwKGlbYXNzb2NpYXRpb25OYW1lXSwgKGFnZ3JlZ2F0ZSkgPT4ge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRoaXMuZW5jcnlwdEFuZE1hcFRvTGl0ZXJhbChhZ2dyZWdhdGVUeXBlTW9kZWwsIGFnZ3JlZ2F0ZSwgc2spXG5cdFx0XHRcdFx0fSkudGhlbigoZW5jcnlwdGVkQWdncmVnYXRlcykgPT4ge1xuXHRcdFx0XHRcdFx0ZW5jcnlwdGVkW2Fzc29jaWF0aW9uTmFtZV0gPSBlbmNyeXB0ZWRBZ2dyZWdhdGVzXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5lbmNyeXB0QW5kTWFwVG9MaXRlcmFsKGFnZ3JlZ2F0ZVR5cGVNb2RlbCwgaVthc3NvY2lhdGlvbk5hbWVdLCBzaykudGhlbigoZW5jcnlwdGVkQWdncmVnYXRlKSA9PiB7XG5cdFx0XHRcdFx0XHRlbmNyeXB0ZWRbYXNzb2NpYXRpb25OYW1lXSA9IGVuY3J5cHRlZEFnZ3JlZ2F0ZVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGVuY3J5cHRlZFthc3NvY2lhdGlvbk5hbWVdID0gaVthc3NvY2lhdGlvbk5hbWVdXG5cdFx0XHR9XG5cdFx0fSkudGhlbigoKSA9PiB7XG5cdFx0XHRyZXR1cm4gZW5jcnlwdGVkXG5cdFx0fSlcblx0fVxufVxuXG4vLyBFeHBvcnRlZCBmb3IgdGVzdGluZ1xuZXhwb3J0IGZ1bmN0aW9uIGVuY3J5cHRWYWx1ZShcblx0dmFsdWVOYW1lOiBzdHJpbmcsXG5cdHZhbHVlVHlwZTogTW9kZWxWYWx1ZSxcblx0dmFsdWU6IGFueSxcblx0c2s6IEFlc0tleSB8IG51bGwsXG5cdGl2OiBVaW50OEFycmF5ID0gcmFuZG9tLmdlbmVyYXRlUmFuZG9tRGF0YShJVl9CWVRFX0xFTkdUSCksXG4pOiBzdHJpbmcgfCBCYXNlNjQgfCBudWxsIHtcblx0aWYgKHZhbHVlTmFtZSA9PT0gXCJfaWRcIiB8fCB2YWx1ZU5hbWUgPT09IFwiX3Blcm1pc3Npb25zXCIpIHtcblx0XHRyZXR1cm4gdmFsdWVcblx0fSBlbHNlIGlmICh2YWx1ZSA9PSBudWxsKSB7XG5cdFx0aWYgKHZhbHVlVHlwZS5jYXJkaW5hbGl0eSA9PT0gQ2FyZGluYWxpdHkuWmVyb09yT25lKSB7XG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgUHJvZ3JhbW1pbmdFcnJvcihgVmFsdWUgJHt2YWx1ZU5hbWV9IHdpdGggY2FyZGluYWxpdHkgT05FIGNhbiBub3QgYmUgbnVsbGApXG5cdFx0fVxuXHR9IGVsc2UgaWYgKHZhbHVlVHlwZS5lbmNyeXB0ZWQpIHtcblx0XHRsZXQgYnl0ZXMgPSB2YWx1ZVxuXG5cdFx0aWYgKHZhbHVlVHlwZS50eXBlICE9PSBWYWx1ZVR5cGUuQnl0ZXMpIHtcblx0XHRcdGNvbnN0IGRiVHlwZSA9IGFzc2VydE5vdE51bGwoY29udmVydEpzVG9EYlR5cGUodmFsdWVUeXBlLnR5cGUsIHZhbHVlKSlcblx0XHRcdGJ5dGVzID0gdHlwZW9mIGRiVHlwZSA9PT0gXCJzdHJpbmdcIiA/IHN0cmluZ1RvVXRmOFVpbnQ4QXJyYXkoZGJUeXBlKSA6IGRiVHlwZVxuXHRcdH1cblxuXHRcdHJldHVybiB1aW50OEFycmF5VG9CYXNlNjQoYWVzRW5jcnlwdChhc3NlcnROb3ROdWxsKHNrKSwgYnl0ZXMsIGl2LCB0cnVlLCBFTkFCTEVfTUFDKSlcblx0fSBlbHNlIHtcblx0XHRjb25zdCBkYlR5cGUgPSBjb252ZXJ0SnNUb0RiVHlwZSh2YWx1ZVR5cGUudHlwZSwgdmFsdWUpXG5cblx0XHRpZiAodHlwZW9mIGRiVHlwZSA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0cmV0dXJuIGRiVHlwZVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdWludDhBcnJheVRvQmFzZTY0KGRiVHlwZSlcblx0XHR9XG5cdH1cbn1cblxuLy8gRXhwb3J0ZWQgZm9yIHRlc3RpbmdcbmV4cG9ydCBmdW5jdGlvbiBkZWNyeXB0VmFsdWUodmFsdWVOYW1lOiBzdHJpbmcsIHZhbHVlVHlwZTogTW9kZWxWYWx1ZSwgdmFsdWU6IChCYXNlNjQgfCBudWxsKSB8IHN0cmluZywgc2s6IEFlc0tleSB8IG51bGwpOiBhbnkge1xuXHRpZiAodmFsdWUgPT0gbnVsbCkge1xuXHRcdGlmICh2YWx1ZVR5cGUuY2FyZGluYWxpdHkgPT09IENhcmRpbmFsaXR5Llplcm9Pck9uZSkge1xuXHRcdFx0cmV0dXJuIG51bGxcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgbmV3IFByb2dyYW1taW5nRXJyb3IoYFZhbHVlICR7dmFsdWVOYW1lfSB3aXRoIGNhcmRpbmFsaXR5IE9ORSBjYW4gbm90IGJlIG51bGxgKVxuXHRcdH1cblx0fSBlbHNlIGlmICh2YWx1ZVR5cGUuY2FyZGluYWxpdHkgPT09IENhcmRpbmFsaXR5Lk9uZSAmJiB2YWx1ZSA9PT0gXCJcIikge1xuXHRcdHJldHVybiB2YWx1ZVRvRGVmYXVsdCh2YWx1ZVR5cGUudHlwZSkgLy8gTWlncmF0aW9uIGZvciB2YWx1ZXMgYWRkZWQgYWZ0ZXIgdGhlIFR5cGUgaGFzIGJlZW4gZGVmaW5lZCBpbml0aWFsbHlcblx0fSBlbHNlIGlmICh2YWx1ZVR5cGUuZW5jcnlwdGVkKSB7XG5cdFx0aWYgKHNrID09IG51bGwpIHtcblx0XHRcdHRocm93IG5ldyBDcnlwdG9FcnJvcihcInNlc3Npb24ga2V5IGlzIG51bGwsIGJ1dCB2YWx1ZSBpcyBlbmNyeXB0ZWQuIHZhbHVlTmFtZTogXCIgKyB2YWx1ZU5hbWUgKyBcIiB2YWx1ZVR5cGU6IFwiICsgdmFsdWVUeXBlKVxuXHRcdH1cblx0XHRsZXQgZGVjcnlwdGVkQnl0ZXMgPSBhZXNEZWNyeXB0KHNrLCBiYXNlNjRUb1VpbnQ4QXJyYXkodmFsdWUpKVxuXG5cdFx0aWYgKHZhbHVlVHlwZS50eXBlID09PSBWYWx1ZVR5cGUuQnl0ZXMpIHtcblx0XHRcdHJldHVybiBkZWNyeXB0ZWRCeXRlc1xuXHRcdH0gZWxzZSBpZiAodmFsdWVUeXBlLnR5cGUgPT09IFZhbHVlVHlwZS5Db21wcmVzc2VkU3RyaW5nKSB7XG5cdFx0XHRyZXR1cm4gZGVjb21wcmVzc1N0cmluZyhkZWNyeXB0ZWRCeXRlcylcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGNvbnZlcnREYlRvSnNUeXBlKHZhbHVlVHlwZS50eXBlLCB1dGY4VWludDhBcnJheVRvU3RyaW5nKGRlY3J5cHRlZEJ5dGVzKSlcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGNvbnZlcnREYlRvSnNUeXBlKHZhbHVlVHlwZS50eXBlLCB2YWx1ZSlcblx0fVxufVxuXG4vKipcbiAqIFJldHVybnMgYnl0ZXMgd2hlbiB0aGUgdHlwZSA9PT0gQnl0ZXMgb3IgdHlwZSA9PT0gQ29tcHJlc3NlZFN0cmluZywgb3RoZXJ3aXNlIHJldHVybnMgYSBzdHJpbmdcbiAqIEBwYXJhbSB0eXBlXG4gKiBAcGFyYW0gdmFsdWVcbiAqIEByZXR1cm5zIHtzdHJpbmd8c3RyaW5nfE5vZGVKUy5HbG9iYWwuVWludDhBcnJheXwqfVxuICovXG5mdW5jdGlvbiBjb252ZXJ0SnNUb0RiVHlwZSh0eXBlOiBWYWx1ZXM8dHlwZW9mIFZhbHVlVHlwZT4sIHZhbHVlOiBhbnkpOiBVaW50OEFycmF5IHwgc3RyaW5nIHtcblx0aWYgKHR5cGUgPT09IFZhbHVlVHlwZS5CeXRlcyAmJiB2YWx1ZSAhPSBudWxsKSB7XG5cdFx0cmV0dXJuIHZhbHVlXG5cdH0gZWxzZSBpZiAodHlwZSA9PT0gVmFsdWVUeXBlLkJvb2xlYW4pIHtcblx0XHRyZXR1cm4gdmFsdWUgPyBcIjFcIiA6IFwiMFwiXG5cdH0gZWxzZSBpZiAodHlwZSA9PT0gVmFsdWVUeXBlLkRhdGUpIHtcblx0XHRyZXR1cm4gdmFsdWUuZ2V0VGltZSgpLnRvU3RyaW5nKClcblx0fSBlbHNlIGlmICh0eXBlID09PSBWYWx1ZVR5cGUuQ29tcHJlc3NlZFN0cmluZykge1xuXHRcdHJldHVybiBjb21wcmVzc1N0cmluZyh2YWx1ZSlcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gdmFsdWVcblx0fVxufVxuXG5mdW5jdGlvbiBjb252ZXJ0RGJUb0pzVHlwZSh0eXBlOiBWYWx1ZXM8dHlwZW9mIFZhbHVlVHlwZT4sIHZhbHVlOiBCYXNlNjQgfCBzdHJpbmcpOiBhbnkge1xuXHRpZiAodHlwZSA9PT0gVmFsdWVUeXBlLkJ5dGVzKSB7XG5cdFx0cmV0dXJuIGJhc2U2NFRvVWludDhBcnJheSh2YWx1ZSBhcyBhbnkpXG5cdH0gZWxzZSBpZiAodHlwZSA9PT0gVmFsdWVUeXBlLkJvb2xlYW4pIHtcblx0XHRyZXR1cm4gdmFsdWUgIT09IFwiMFwiXG5cdH0gZWxzZSBpZiAodHlwZSA9PT0gVmFsdWVUeXBlLkRhdGUpIHtcblx0XHRyZXR1cm4gbmV3IERhdGUocGFyc2VJbnQodmFsdWUpKVxuXHR9IGVsc2UgaWYgKHR5cGUgPT09IFZhbHVlVHlwZS5Db21wcmVzc2VkU3RyaW5nKSB7XG5cdFx0cmV0dXJuIGRlY29tcHJlc3NTdHJpbmcoYmFzZTY0VG9VaW50OEFycmF5KHZhbHVlKSlcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gdmFsdWVcblx0fVxufVxuXG5mdW5jdGlvbiBjb21wcmVzc1N0cmluZyh1bmNvbXByZXNzZWQ6IHN0cmluZyk6IFVpbnQ4QXJyYXkge1xuXHRyZXR1cm4gY29tcHJlc3Moc3RyaW5nVG9VdGY4VWludDhBcnJheSh1bmNvbXByZXNzZWQpKVxufVxuXG5mdW5jdGlvbiBkZWNvbXByZXNzU3RyaW5nKGNvbXByZXNzZWQ6IFVpbnQ4QXJyYXkpOiBzdHJpbmcge1xuXHRpZiAoY29tcHJlc3NlZC5sZW5ndGggPT09IDApIHtcblx0XHRyZXR1cm4gXCJcIlxuXHR9XG5cblx0Y29uc3Qgb3V0cHV0ID0gdW5jb21wcmVzcyhjb21wcmVzc2VkKVxuXHRyZXR1cm4gdXRmOFVpbnQ4QXJyYXlUb1N0cmluZyhvdXRwdXQpXG59XG5cbmZ1bmN0aW9uIHZhbHVlVG9EZWZhdWx0KHR5cGU6IFZhbHVlczx0eXBlb2YgVmFsdWVUeXBlPik6IERhdGUgfCBVaW50OEFycmF5IHwgc3RyaW5nIHwgYm9vbGVhbiB7XG5cdHN3aXRjaCAodHlwZSkge1xuXHRcdGNhc2UgVmFsdWVUeXBlLlN0cmluZzpcblx0XHRcdHJldHVybiBcIlwiXG5cblx0XHRjYXNlIFZhbHVlVHlwZS5OdW1iZXI6XG5cdFx0XHRyZXR1cm4gXCIwXCJcblxuXHRcdGNhc2UgVmFsdWVUeXBlLkJ5dGVzOlxuXHRcdFx0cmV0dXJuIG5ldyBVaW50OEFycmF5KDApXG5cblx0XHRjYXNlIFZhbHVlVHlwZS5EYXRlOlxuXHRcdFx0cmV0dXJuIG5ldyBEYXRlKDApXG5cblx0XHRjYXNlIFZhbHVlVHlwZS5Cb29sZWFuOlxuXHRcdFx0cmV0dXJuIGZhbHNlXG5cblx0XHRjYXNlIFZhbHVlVHlwZS5Db21wcmVzc2VkU3RyaW5nOlxuXHRcdFx0cmV0dXJuIFwiXCJcblxuXHRcdGRlZmF1bHQ6XG5cdFx0XHR0aHJvdyBuZXcgUHJvZ3JhbW1pbmdFcnJvcihgJHt0eXBlfSBpcyBub3QgYSB2YWxpZCB2YWx1ZSB0eXBlYClcblx0fVxufVxuXG5mdW5jdGlvbiBpc0RlZmF1bHRWYWx1ZSh0eXBlOiBWYWx1ZXM8dHlwZW9mIFZhbHVlVHlwZT4sIHZhbHVlOiB1bmtub3duKTogYm9vbGVhbiB7XG5cdHN3aXRjaCAodHlwZSkge1xuXHRcdGNhc2UgVmFsdWVUeXBlLlN0cmluZzpcblx0XHRcdHJldHVybiB2YWx1ZSA9PT0gXCJcIlxuXG5cdFx0Y2FzZSBWYWx1ZVR5cGUuTnVtYmVyOlxuXHRcdFx0cmV0dXJuIHZhbHVlID09PSBcIjBcIlxuXG5cdFx0Y2FzZSBWYWx1ZVR5cGUuQnl0ZXM6XG5cdFx0XHRyZXR1cm4gKHZhbHVlIGFzIFVpbnQ4QXJyYXkpLmxlbmd0aCA9PT0gMFxuXG5cdFx0Y2FzZSBWYWx1ZVR5cGUuRGF0ZTpcblx0XHRcdHJldHVybiAodmFsdWUgYXMgRGF0ZSkuZ2V0VGltZSgpID09PSAwXG5cblx0XHRjYXNlIFZhbHVlVHlwZS5Cb29sZWFuOlxuXHRcdFx0cmV0dXJuIHZhbHVlID09PSBmYWxzZVxuXG5cdFx0Y2FzZSBWYWx1ZVR5cGUuQ29tcHJlc3NlZFN0cmluZzpcblx0XHRcdHJldHVybiB2YWx1ZSA9PT0gXCJcIlxuXG5cdFx0ZGVmYXVsdDpcblx0XHRcdHRocm93IG5ldyBQcm9ncmFtbWluZ0Vycm9yKGAke3R5cGV9IGlzIG5vdCBhIHZhbGlkIHZhbHVlIHR5cGVgKVxuXHR9XG59XG4iLCJpbXBvcnQgeyBRdWV1ZWRCYXRjaCB9IGZyb20gXCIuLi9FdmVudFF1ZXVlLmpzXCJcbmltcG9ydCB7IEVudGl0eVVwZGF0ZSB9IGZyb20gXCIuLi8uLi9lbnRpdGllcy9zeXMvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgTGlzdEVsZW1lbnRFbnRpdHksIFNvbWVFbnRpdHkgfSBmcm9tIFwiLi4vLi4vY29tbW9uL0VudGl0eVR5cGVzXCJcbmltcG9ydCB7IFByb2dyYW1taW5nRXJyb3IgfSBmcm9tIFwiLi4vLi4vY29tbW9uL2Vycm9yL1Byb2dyYW1taW5nRXJyb3JcIlxuaW1wb3J0IHsgVHlwZVJlZiB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHsgRW50aXR5UmVzdENhY2hlIH0gZnJvbSBcIi4vRGVmYXVsdEVudGl0eVJlc3RDYWNoZS5qc1wiXG5pbXBvcnQgeyBFbnRpdHlSZXN0Q2xpZW50TG9hZE9wdGlvbnMgfSBmcm9tIFwiLi9FbnRpdHlSZXN0Q2xpZW50LmpzXCJcblxuZXhwb3J0IGNsYXNzIEFkbWluQ2xpZW50RHVtbXlFbnRpdHlSZXN0Q2FjaGUgaW1wbGVtZW50cyBFbnRpdHlSZXN0Q2FjaGUge1xuXHRhc3luYyBlbnRpdHlFdmVudHNSZWNlaXZlZChiYXRjaDogUXVldWVkQmF0Y2gpOiBQcm9taXNlPEFycmF5PEVudGl0eVVwZGF0ZT4+IHtcblx0XHRyZXR1cm4gYmF0Y2guZXZlbnRzXG5cdH1cblxuXHRhc3luYyBlcmFzZTxUIGV4dGVuZHMgU29tZUVudGl0eT4oaW5zdGFuY2U6IFQpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHR0aHJvdyBuZXcgUHJvZ3JhbW1pbmdFcnJvcihcImVyYXNlIG5vdCBpbXBsZW1lbnRlZFwiKVxuXHR9XG5cblx0YXN5bmMgbG9hZDxUIGV4dGVuZHMgU29tZUVudGl0eT4oX3R5cGVSZWY6IFR5cGVSZWY8VD4sIF9pZDogUHJvcGVydHlUeXBlPFQsIFwiX2lkXCI+LCBfb3B0czogRW50aXR5UmVzdENsaWVudExvYWRPcHRpb25zKTogUHJvbWlzZTxUPiB7XG5cdFx0dGhyb3cgbmV3IFByb2dyYW1taW5nRXJyb3IoXCJsb2FkIG5vdCBpbXBsZW1lbnRlZFwiKVxuXHR9XG5cblx0YXN5bmMgbG9hZE11bHRpcGxlPFQgZXh0ZW5kcyBTb21lRW50aXR5Pih0eXBlUmVmOiBUeXBlUmVmPFQ+LCBsaXN0SWQ6IElkIHwgbnVsbCwgZWxlbWVudElkczogQXJyYXk8SWQ+KTogUHJvbWlzZTxBcnJheTxUPj4ge1xuXHRcdHRocm93IG5ldyBQcm9ncmFtbWluZ0Vycm9yKFwibG9hZE11bHRpcGxlIG5vdCBpbXBsZW1lbnRlZFwiKVxuXHR9XG5cblx0YXN5bmMgbG9hZFJhbmdlPFQgZXh0ZW5kcyBMaXN0RWxlbWVudEVudGl0eT4odHlwZVJlZjogVHlwZVJlZjxUPiwgbGlzdElkOiBJZCwgc3RhcnQ6IElkLCBjb3VudDogbnVtYmVyLCByZXZlcnNlOiBib29sZWFuKTogUHJvbWlzZTxUW10+IHtcblx0XHR0aHJvdyBuZXcgUHJvZ3JhbW1pbmdFcnJvcihcImxvYWRSYW5nZSBub3QgaW1wbGVtZW50ZWRcIilcblx0fVxuXG5cdGFzeW5jIHB1cmdlU3RvcmFnZSgpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRyZXR1cm5cblx0fVxuXG5cdGFzeW5jIHNldHVwPFQgZXh0ZW5kcyBTb21lRW50aXR5PihsaXN0SWQ6IElkIHwgbnVsbCwgaW5zdGFuY2U6IFQsIGV4dHJhSGVhZGVycz86IERpY3QpOiBQcm9taXNlPElkPiB7XG5cdFx0dGhyb3cgbmV3IFByb2dyYW1taW5nRXJyb3IoXCJzZXR1cCBub3QgaW1wbGVtZW50ZWRcIilcblx0fVxuXG5cdGFzeW5jIHNldHVwTXVsdGlwbGU8VCBleHRlbmRzIFNvbWVFbnRpdHk+KGxpc3RJZDogSWQgfCBudWxsLCBpbnN0YW5jZXM6IEFycmF5PFQ+KTogUHJvbWlzZTxBcnJheTxJZD4+IHtcblx0XHR0aHJvdyBuZXcgUHJvZ3JhbW1pbmdFcnJvcihcInNldHVwTXVsdGlwbGUgbm90IGltcGxlbWVudGVkXCIpXG5cdH1cblxuXHRhc3luYyB1cGRhdGU8VCBleHRlbmRzIFNvbWVFbnRpdHk+KGluc3RhbmNlOiBUKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0dGhyb3cgbmV3IFByb2dyYW1taW5nRXJyb3IoXCJ1cGRhdGUgbm90IGltcGxlbWVudGVkXCIpXG5cdH1cblxuXHRhc3luYyBnZXRMYXN0RW50aXR5RXZlbnRCYXRjaEZvckdyb3VwKGdyb3VwSWQ6IElkKTogUHJvbWlzZTxJZCB8IG51bGw+IHtcblx0XHRyZXR1cm4gbnVsbFxuXHR9XG5cblx0YXN5bmMgc2V0TGFzdEVudGl0eUV2ZW50QmF0Y2hGb3JHcm91cChncm91cElkOiBJZCwgYmF0Y2hJZDogSWQpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRyZXR1cm5cblx0fVxuXG5cdGFzeW5jIHJlY29yZFN5bmNUaW1lKCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHJldHVyblxuXHR9XG5cblx0YXN5bmMgdGltZVNpbmNlTGFzdFN5bmNNcygpOiBQcm9taXNlPG51bWJlciB8IG51bGw+IHtcblx0XHRyZXR1cm4gbnVsbFxuXHR9XG5cblx0YXN5bmMgaXNPdXRPZlN5bmMoKTogUHJvbWlzZTxib29sZWFuPiB7XG5cdFx0cmV0dXJuIGZhbHNlXG5cdH1cbn1cbiIsImltcG9ydCB7IFRodW5rIH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5pbXBvcnQgeyBTY2hlZHVsZXIgfSBmcm9tIFwiLi4vLi4vY29tbW9uL3V0aWxzL1NjaGVkdWxlci5qc1wiXG5pbXBvcnQgeyBEYXRlUHJvdmlkZXIgfSBmcm9tIFwiLi4vLi4vY29tbW9uL0RhdGVQcm92aWRlci5qc1wiXG5cbi8vIGV4cG9ydGVkIGZvciB0ZXN0aW5nXG4vKiogSG93IG9mdGVuIGRvIHdlIGNoZWNrIGZvciBzbGVlcC4gKi9cbmV4cG9ydCBjb25zdCBDSEVDS19JTlRFUlZBTCA9IDUwMDBcbi8qKiBIb3cgbXVjaCB0aW1lIHNob3VsZCBoYXZlIHBhc3NlZCBmb3IgdXMgdG8gYXNzdW1lIHRoYXQgdGhlIGFwcCB3YXMgc3VzcGVuZGVkLiAqL1xuZXhwb3J0IGNvbnN0IFNMRUVQX0lOVEVSVkFMID0gMTUwMDBcblxuaW50ZXJmYWNlIFNjaGVkdWxlZFN0YXRlIHtcblx0c2NoZWR1bGVkSWQ6IG51bWJlclxuXHRsYXN0VGltZTogbnVtYmVyXG5cdHJlYWRvbmx5IG9uU2xlZXA6IFRodW5rXG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIGRldGVjdGluZyBzdXNwZW5zaW9uIHN0YXRlIG9mIHRoZSBhcHAvZGV2aWNlLlxuICogV2hlbiB0aGUgZGV2aWNlIGlzIGVudGVyaW5nIHRoZSBzbGVlcCBtb2RlIHRoZSBicm93c2VyIHdvdWxkIHBhdXNlIHRoZSBwYWdlLiBGb3IgbW9zdCBvZiB0aGUgYXBwIGl0IGxvb2tzIGxpa2Ugbm8gdGltZSBoYXMgcGFzc2VkIGF0IGFsbCBidXQgd2hlbiB0aGVyZVxuICogYXJlIGV4dGVybmFsIGZhY3RvcnMgZS5nLiB3ZWJzb2NrZXQgY29ubmVjdGlvbiB3ZSBtaWdodCBuZWVkIHRvIGtub3cgd2hldGhlciBpdCBoYXBwZW5zLlxuICpcbiAqIFdlIGRldGVjdCBzdWNoIHNpdHVhdGlvbiBieSBzY2hlZHVsaW5nIHBlcmlvZGljIHRpbWVyIGFuZCBtZWFzdXJpbmcgdGhlIHRpbWUgaW4gYmV0d2Vlbi5cbiAqXG4gKiBDdXJyZW50bHkgaXMgb25seSBjYXBhYmxlIG9mIGhhdmluZyBvbmUgc2xlZXAgYWN0aW9uIGF0IGEgdGltZS5cbiAqL1xuZXhwb3J0IGNsYXNzIFNsZWVwRGV0ZWN0b3Ige1xuXHRwcml2YXRlIHNjaGVkdWxlZFN0YXRlOiBTY2hlZHVsZWRTdGF0ZSB8IG51bGwgPSBudWxsXG5cblx0Y29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBzY2hlZHVsZXI6IFNjaGVkdWxlciwgcHJpdmF0ZSByZWFkb25seSBkYXRlUHJvdmlkZXI6IERhdGVQcm92aWRlcikge31cblxuXHRzdGFydChvblNsZWVwOiBUaHVuayk6IHZvaWQge1xuXHRcdHRoaXMuc3RvcCgpXG5cdFx0dGhpcy5zY2hlZHVsZWRTdGF0ZSA9IHtcblx0XHRcdHNjaGVkdWxlZElkOiB0aGlzLnNjaGVkdWxlci5zY2hlZHVsZVBlcmlvZGljKCgpID0+IHRoaXMuY2hlY2soKSwgQ0hFQ0tfSU5URVJWQUwpLFxuXHRcdFx0bGFzdFRpbWU6IHRoaXMuZGF0ZVByb3ZpZGVyLm5vdygpLFxuXHRcdFx0b25TbGVlcCxcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIGNoZWNrKCkge1xuXHRcdGlmICh0aGlzLnNjaGVkdWxlZFN0YXRlID09IG51bGwpIHJldHVyblxuXG5cdFx0Y29uc3Qgbm93ID0gdGhpcy5kYXRlUHJvdmlkZXIubm93KClcblx0XHRpZiAobm93IC0gdGhpcy5zY2hlZHVsZWRTdGF0ZS5sYXN0VGltZSA+IFNMRUVQX0lOVEVSVkFMKSB7XG5cdFx0XHR0aGlzLnNjaGVkdWxlZFN0YXRlLm9uU2xlZXAoKVxuXHRcdH1cblx0XHR0aGlzLnNjaGVkdWxlZFN0YXRlLmxhc3RUaW1lID0gbm93XG5cdH1cblxuXHRzdG9wKCk6IHZvaWQge1xuXHRcdGlmICh0aGlzLnNjaGVkdWxlZFN0YXRlKSB7XG5cdFx0XHR0aGlzLnNjaGVkdWxlci51bnNjaGVkdWxlUGVyaW9kaWModGhpcy5zY2hlZHVsZWRTdGF0ZS5zY2hlZHVsZWRJZClcblx0XHRcdHRoaXMuc2NoZWR1bGVkU3RhdGUgPSBudWxsXG5cdFx0fVxuXHR9XG59XG4iLCJpbXBvcnQgeyBCbG9iRWxlbWVudEVudGl0eSwgRWxlbWVudEVudGl0eSwgTGlzdEVsZW1lbnRFbnRpdHksIFNvbWVFbnRpdHksIFR5cGVNb2RlbCB9IGZyb20gXCIuLi8uLi9jb21tb24vRW50aXR5VHlwZXMuanNcIlxuaW1wb3J0IHsgRW50aXR5UmVzdENsaWVudCwgdHlwZVJlZlRvUGF0aCB9IGZyb20gXCIuL0VudGl0eVJlc3RDbGllbnQuanNcIlxuaW1wb3J0IHsgZmlyc3RCaWdnZXJUaGFuU2Vjb25kIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi91dGlscy9FbnRpdHlVdGlscy5qc1wiXG5pbXBvcnQgeyBDYWNoZVN0b3JhZ2UsIGV4cGFuZElkLCBFeHBvc2VkQ2FjaGVTdG9yYWdlLCBMYXN0VXBkYXRlVGltZSB9IGZyb20gXCIuL0RlZmF1bHRFbnRpdHlSZXN0Q2FjaGUuanNcIlxuaW1wb3J0IHsgYXNzZXJ0Tm90TnVsbCwgY2xvbmUsIGdldEZyb21NYXAsIHJlbW92ZSwgVHlwZVJlZiB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHsgQ3VzdG9tQ2FjaGVIYW5kbGVyTWFwIH0gZnJvbSBcIi4vQ3VzdG9tQ2FjaGVIYW5kbGVyLmpzXCJcbmltcG9ydCB7IHJlc29sdmVUeXBlUmVmZXJlbmNlIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9FbnRpdHlGdW5jdGlvbnMuanNcIlxuaW1wb3J0IHsgVHlwZSBhcyBUeXBlSWQgfSBmcm9tIFwiLi4vLi4vY29tbW9uL0VudGl0eUNvbnN0YW50cy5qc1wiXG5pbXBvcnQgeyBQcm9ncmFtbWluZ0Vycm9yIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9lcnJvci9Qcm9ncmFtbWluZ0Vycm9yLmpzXCJcbmltcG9ydCB7IGN1c3RvbUlkVG9CYXNlNjRVcmwsIGVuc3VyZUJhc2U2NEV4dCB9IGZyb20gXCIuLi9vZmZsaW5lL09mZmxpbmVTdG9yYWdlLmpzXCJcblxuLyoqIENhY2hlIGZvciBhIHNpbmdsZSBsaXN0LiAqL1xudHlwZSBMaXN0Q2FjaGUgPSB7XG5cdC8qKiBBbGwgZW50aXRpZXMgbG9hZGVkIGluc2lkZSB0aGUgcmFuZ2UuICovXG5cdGFsbFJhbmdlOiBJZFtdXG5cdGxvd2VyUmFuZ2VJZDogSWRcblx0dXBwZXJSYW5nZUlkOiBJZFxuXHQvKiogQWxsIHRoZSBlbnRpdGllcyBsb2FkZWQsIGluc2lkZSBvciBvdXRzaWRlIHRoZSByYW5nZSAoZS5nLiBsb2FkIGZvciBhIHNpbmdsZSBlbnRpdHkpLiAqL1xuXHRlbGVtZW50czogTWFwPElkLCBMaXN0RWxlbWVudEVudGl0eT5cbn1cblxuLyoqIE1hcCBmcm9tIGxpc3QgaWQgdG8gbGlzdCBjYWNoZS4gKi9cbnR5cGUgTGlzdFR5cGVDYWNoZSA9IE1hcDxJZCwgTGlzdENhY2hlPlxuXG50eXBlIEJsb2JFbGVtZW50Q2FjaGUgPSB7XG5cdC8qKiBBbGwgdGhlIGVudGl0aWVzIGxvYWRlZCwgaW5zaWRlIG9yIG91dHNpZGUgdGhlIHJhbmdlIChlLmcuIGxvYWQgZm9yIGEgc2luZ2xlIGVudGl0eSkuICovXG5cdGVsZW1lbnRzOiBNYXA8SWQsIEJsb2JFbGVtZW50RW50aXR5PlxufVxuXG4vKiogTWFwIGZyb20gbGlzdCBpZCB0byBsaXN0IGNhY2hlLiAqL1xudHlwZSBCbG9iRWxlbWVudFR5cGVDYWNoZSA9IE1hcDxJZCwgQmxvYkVsZW1lbnRDYWNoZT5cblxuZXhwb3J0IGludGVyZmFjZSBFcGhlbWVyYWxTdG9yYWdlSW5pdEFyZ3Mge1xuXHR1c2VySWQ6IElkXG59XG5cbmV4cG9ydCBjbGFzcyBFcGhlbWVyYWxDYWNoZVN0b3JhZ2UgaW1wbGVtZW50cyBDYWNoZVN0b3JhZ2Uge1xuXHQvKiogUGF0aCB0byBpZCB0byBlbnRpdHkgbWFwLiAqL1xuXHRwcml2YXRlIHJlYWRvbmx5IGVudGl0aWVzOiBNYXA8c3RyaW5nLCBNYXA8SWQsIEVsZW1lbnRFbnRpdHk+PiA9IG5ldyBNYXAoKVxuXHRwcml2YXRlIHJlYWRvbmx5IGxpc3RzOiBNYXA8c3RyaW5nLCBMaXN0VHlwZUNhY2hlPiA9IG5ldyBNYXAoKVxuXHRwcml2YXRlIHJlYWRvbmx5IGJsb2JFbnRpdGllczogTWFwPHN0cmluZywgQmxvYkVsZW1lbnRUeXBlQ2FjaGU+ID0gbmV3IE1hcCgpXG5cdHByaXZhdGUgcmVhZG9ubHkgY3VzdG9tQ2FjaGVIYW5kbGVyTWFwOiBDdXN0b21DYWNoZUhhbmRsZXJNYXAgPSBuZXcgQ3VzdG9tQ2FjaGVIYW5kbGVyTWFwKClcblx0cHJpdmF0ZSBsYXN0VXBkYXRlVGltZTogbnVtYmVyIHwgbnVsbCA9IG51bGxcblx0cHJpdmF0ZSB1c2VySWQ6IElkIHwgbnVsbCA9IG51bGxcblx0cHJpdmF0ZSBsYXN0QmF0Y2hJZFBlckdyb3VwID0gbmV3IE1hcDxJZCwgSWQ+KClcblxuXHRpbml0KHsgdXNlcklkIH06IEVwaGVtZXJhbFN0b3JhZ2VJbml0QXJncykge1xuXHRcdHRoaXMudXNlcklkID0gdXNlcklkXG5cdH1cblxuXHRkZWluaXQoKSB7XG5cdFx0dGhpcy51c2VySWQgPSBudWxsXG5cdFx0dGhpcy5lbnRpdGllcy5jbGVhcigpXG5cdFx0dGhpcy5saXN0cy5jbGVhcigpXG5cdFx0dGhpcy5ibG9iRW50aXRpZXMuY2xlYXIoKVxuXHRcdHRoaXMubGFzdFVwZGF0ZVRpbWUgPSBudWxsXG5cdFx0dGhpcy5sYXN0QmF0Y2hJZFBlckdyb3VwLmNsZWFyKClcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXQgYSBnaXZlbiBlbnRpdHkgZnJvbSB0aGUgY2FjaGUsIGV4cGVjdHMgdGhhdCB5b3UgaGF2ZSBhbHJlYWR5IGNoZWNrZWQgZm9yIGV4aXN0ZW5jZVxuXHQgKi9cblx0YXN5bmMgZ2V0PFQgZXh0ZW5kcyBTb21lRW50aXR5Pih0eXBlUmVmOiBUeXBlUmVmPFQ+LCBsaXN0SWQ6IElkIHwgbnVsbCwgZWxlbWVudElkOiBJZCk6IFByb21pc2U8VCB8IG51bGw+IHtcblx0XHQvLyBXZSBkb3duY2FzdCBiZWNhdXNlIHdlIGNhbid0IHByb3ZlIHRoYXQgbWFwIGhhcyBjb3JyZWN0IGVudGl0eSBvbiB0aGUgdHlwZSBsZXZlbFxuXHRcdGNvbnN0IHBhdGggPSB0eXBlUmVmVG9QYXRoKHR5cGVSZWYpXG5cdFx0Y29uc3QgdHlwZU1vZGVsID0gYXdhaXQgcmVzb2x2ZVR5cGVSZWZlcmVuY2UodHlwZVJlZilcblx0XHRlbGVtZW50SWQgPSBlbnN1cmVCYXNlNjRFeHQodHlwZU1vZGVsLCBlbGVtZW50SWQpXG5cdFx0c3dpdGNoICh0eXBlTW9kZWwudHlwZSkge1xuXHRcdFx0Y2FzZSBUeXBlSWQuRWxlbWVudDpcblx0XHRcdFx0cmV0dXJuIGNsb25lKCh0aGlzLmVudGl0aWVzLmdldChwYXRoKT8uZ2V0KGVsZW1lbnRJZCkgYXMgVCB8IHVuZGVmaW5lZCkgPz8gbnVsbClcblx0XHRcdGNhc2UgVHlwZUlkLkxpc3RFbGVtZW50OlxuXHRcdFx0XHRyZXR1cm4gY2xvbmUoKHRoaXMubGlzdHMuZ2V0KHBhdGgpPy5nZXQoYXNzZXJ0Tm90TnVsbChsaXN0SWQpKT8uZWxlbWVudHMuZ2V0KGVsZW1lbnRJZCkgYXMgVCB8IHVuZGVmaW5lZCkgPz8gbnVsbClcblx0XHRcdGNhc2UgVHlwZUlkLkJsb2JFbGVtZW50OlxuXHRcdFx0XHRyZXR1cm4gY2xvbmUoKHRoaXMuYmxvYkVudGl0aWVzLmdldChwYXRoKT8uZ2V0KGFzc2VydE5vdE51bGwobGlzdElkKSk/LmVsZW1lbnRzLmdldChlbGVtZW50SWQpIGFzIFQgfCB1bmRlZmluZWQpID8/IG51bGwpXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0aHJvdyBuZXcgUHJvZ3JhbW1pbmdFcnJvcihcIm11c3QgYmUgYSBwZXJzaXN0ZW50IHR5cGVcIilcblx0XHR9XG5cdH1cblxuXHRhc3luYyBkZWxldGVJZkV4aXN0czxUPih0eXBlUmVmOiBUeXBlUmVmPFQ+LCBsaXN0SWQ6IElkIHwgbnVsbCwgZWxlbWVudElkOiBJZCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IHBhdGggPSB0eXBlUmVmVG9QYXRoKHR5cGVSZWYpXG5cdFx0bGV0IHR5cGVNb2RlbDogVHlwZU1vZGVsXG5cdFx0dHlwZU1vZGVsID0gYXdhaXQgcmVzb2x2ZVR5cGVSZWZlcmVuY2UodHlwZVJlZilcblx0XHRlbGVtZW50SWQgPSBlbnN1cmVCYXNlNjRFeHQodHlwZU1vZGVsLCBlbGVtZW50SWQpXG5cdFx0c3dpdGNoICh0eXBlTW9kZWwudHlwZSkge1xuXHRcdFx0Y2FzZSBUeXBlSWQuRWxlbWVudDpcblx0XHRcdFx0dGhpcy5lbnRpdGllcy5nZXQocGF0aCk/LmRlbGV0ZShlbGVtZW50SWQpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIFR5cGVJZC5MaXN0RWxlbWVudDoge1xuXHRcdFx0XHRjb25zdCBjYWNoZSA9IHRoaXMubGlzdHMuZ2V0KHBhdGgpPy5nZXQoYXNzZXJ0Tm90TnVsbChsaXN0SWQpKVxuXHRcdFx0XHRpZiAoY2FjaGUgIT0gbnVsbCkge1xuXHRcdFx0XHRcdGNhY2hlLmVsZW1lbnRzLmRlbGV0ZShlbGVtZW50SWQpXG5cdFx0XHRcdFx0cmVtb3ZlKGNhY2hlLmFsbFJhbmdlLCBlbGVtZW50SWQpXG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWtcblx0XHRcdH1cblx0XHRcdGNhc2UgVHlwZUlkLkJsb2JFbGVtZW50OlxuXHRcdFx0XHR0aGlzLmJsb2JFbnRpdGllcy5nZXQocGF0aCk/LmdldChhc3NlcnROb3ROdWxsKGxpc3RJZCkpPy5lbGVtZW50cy5kZWxldGUoZWxlbWVudElkKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0dGhyb3cgbmV3IFByb2dyYW1taW5nRXJyb3IoXCJtdXN0IGJlIGEgcGVyc2lzdGVudCB0eXBlXCIpXG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBhZGRFbGVtZW50RW50aXR5PFQgZXh0ZW5kcyBFbGVtZW50RW50aXR5Pih0eXBlUmVmOiBUeXBlUmVmPFQ+LCBpZDogSWQsIGVudGl0eTogVCkge1xuXHRcdGdldEZyb21NYXAodGhpcy5lbnRpdGllcywgdHlwZVJlZlRvUGF0aCh0eXBlUmVmKSwgKCkgPT4gbmV3IE1hcCgpKS5zZXQoaWQsIGVudGl0eSlcblx0fVxuXG5cdGFzeW5jIGlzRWxlbWVudElkSW5DYWNoZVJhbmdlPFQgZXh0ZW5kcyBMaXN0RWxlbWVudEVudGl0eT4odHlwZVJlZjogVHlwZVJlZjxUPiwgbGlzdElkOiBJZCwgZWxlbWVudElkOiBJZCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdGNvbnN0IHR5cGVNb2RlbCA9IGF3YWl0IHJlc29sdmVUeXBlUmVmZXJlbmNlKHR5cGVSZWYpXG5cdFx0ZWxlbWVudElkID0gZW5zdXJlQmFzZTY0RXh0KHR5cGVNb2RlbCwgZWxlbWVudElkKVxuXG5cdFx0Y29uc3QgY2FjaGUgPSB0aGlzLmxpc3RzLmdldCh0eXBlUmVmVG9QYXRoKHR5cGVSZWYpKT8uZ2V0KGxpc3RJZClcblx0XHRyZXR1cm4gY2FjaGUgIT0gbnVsbCAmJiAhZmlyc3RCaWdnZXJUaGFuU2Vjb25kKGVsZW1lbnRJZCwgY2FjaGUudXBwZXJSYW5nZUlkKSAmJiAhZmlyc3RCaWdnZXJUaGFuU2Vjb25kKGNhY2hlLmxvd2VyUmFuZ2VJZCwgZWxlbWVudElkKVxuXHR9XG5cblx0YXN5bmMgcHV0KG9yaWdpbmFsRW50aXR5OiBTb21lRW50aXR5KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3QgZW50aXR5ID0gY2xvbmUob3JpZ2luYWxFbnRpdHkpXG5cdFx0Y29uc3QgdHlwZVJlZiA9IGVudGl0eS5fdHlwZVxuXHRcdGNvbnN0IHR5cGVNb2RlbCA9IGF3YWl0IHJlc29sdmVUeXBlUmVmZXJlbmNlKHR5cGVSZWYpXG5cdFx0bGV0IHsgbGlzdElkLCBlbGVtZW50SWQgfSA9IGV4cGFuZElkKG9yaWdpbmFsRW50aXR5Ll9pZClcblx0XHRlbGVtZW50SWQgPSBlbnN1cmVCYXNlNjRFeHQodHlwZU1vZGVsLCBlbGVtZW50SWQpXG5cdFx0c3dpdGNoICh0eXBlTW9kZWwudHlwZSkge1xuXHRcdFx0Y2FzZSBUeXBlSWQuRWxlbWVudDoge1xuXHRcdFx0XHRjb25zdCBlbGVtZW50RW50aXR5ID0gZW50aXR5IGFzIEVsZW1lbnRFbnRpdHlcblx0XHRcdFx0dGhpcy5hZGRFbGVtZW50RW50aXR5KGVsZW1lbnRFbnRpdHkuX3R5cGUsIGVsZW1lbnRJZCwgZWxlbWVudEVudGl0eSlcblx0XHRcdFx0YnJlYWtcblx0XHRcdH1cblx0XHRcdGNhc2UgVHlwZUlkLkxpc3RFbGVtZW50OiB7XG5cdFx0XHRcdGNvbnN0IGxpc3RFbGVtZW50RW50aXR5ID0gZW50aXR5IGFzIExpc3RFbGVtZW50RW50aXR5XG5cdFx0XHRcdGNvbnN0IGxpc3RFbGVtZW50VHlwZVJlZiA9IHR5cGVSZWYgYXMgVHlwZVJlZjxMaXN0RWxlbWVudEVudGl0eT5cblx0XHRcdFx0bGlzdElkID0gbGlzdElkIGFzIElkXG5cdFx0XHRcdGF3YWl0IHRoaXMucHV0TGlzdEVsZW1lbnQobGlzdEVsZW1lbnRUeXBlUmVmLCBsaXN0SWQsIGVsZW1lbnRJZCwgbGlzdEVsZW1lbnRFbnRpdHkpXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHR9XG5cdFx0XHRjYXNlIFR5cGVJZC5CbG9iRWxlbWVudDoge1xuXHRcdFx0XHRjb25zdCBibG9iRWxlbWVudEVudGl0eSA9IGVudGl0eSBhcyBCbG9iRWxlbWVudEVudGl0eVxuXHRcdFx0XHRjb25zdCBibG9iVHlwZVJlZiA9IHR5cGVSZWYgYXMgVHlwZVJlZjxCbG9iRWxlbWVudEVudGl0eT5cblx0XHRcdFx0bGlzdElkID0gbGlzdElkIGFzIElkXG5cdFx0XHRcdGF3YWl0IHRoaXMucHV0QmxvYkVsZW1lbnQoYmxvYlR5cGVSZWYsIGxpc3RJZCwgZWxlbWVudElkLCBibG9iRWxlbWVudEVudGl0eSlcblx0XHRcdFx0YnJlYWtcblx0XHRcdH1cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHRocm93IG5ldyBQcm9ncmFtbWluZ0Vycm9yKFwibXVzdCBiZSBhIHBlcnNpc3RlbnQgdHlwZVwiKVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgcHV0QmxvYkVsZW1lbnQodHlwZVJlZjogVHlwZVJlZjxCbG9iRWxlbWVudEVudGl0eT4sIGxpc3RJZDogSWQsIGVsZW1lbnRJZDogSWQsIGVudGl0eTogQmxvYkVsZW1lbnRFbnRpdHkpIHtcblx0XHRjb25zdCBjYWNoZSA9IHRoaXMuYmxvYkVudGl0aWVzLmdldCh0eXBlUmVmVG9QYXRoKHR5cGVSZWYpKT8uZ2V0KGxpc3RJZClcblx0XHRpZiAoY2FjaGUgPT0gbnVsbCkge1xuXHRcdFx0Ly8gZmlyc3QgZWxlbWVudCBpbiB0aGlzIGxpc3Rcblx0XHRcdGNvbnN0IG5ld0NhY2hlID0ge1xuXHRcdFx0XHRlbGVtZW50czogbmV3IE1hcChbW2VsZW1lbnRJZCwgZW50aXR5XV0pLFxuXHRcdFx0fVxuXHRcdFx0Z2V0RnJvbU1hcCh0aGlzLmJsb2JFbnRpdGllcywgdHlwZVJlZlRvUGF0aCh0eXBlUmVmKSwgKCkgPT4gbmV3IE1hcCgpKS5zZXQobGlzdElkLCBuZXdDYWNoZSlcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gaWYgdGhlIGVsZW1lbnQgYWxyZWFkeSBleGlzdHMgaW4gdGhlIGNhY2hlLCBvdmVyd3JpdGUgaXRcblx0XHRcdGNhY2hlLmVsZW1lbnRzLnNldChlbGVtZW50SWQsIGVudGl0eSlcblx0XHR9XG5cdH1cblxuXHQvKiogcHJjb25kaXRpb246IGVsZW1lbnRJZCBpcyBjb252ZXJ0ZWQgdG8gYmFzZTY0ZXh0IGlmIG5lY2Vzc2FyeSAqL1xuXHRwcml2YXRlIGFzeW5jIHB1dExpc3RFbGVtZW50KHR5cGVSZWY6IFR5cGVSZWY8TGlzdEVsZW1lbnRFbnRpdHk+LCBsaXN0SWQ6IElkLCBlbGVtZW50SWQ6IElkLCBlbnRpdHk6IExpc3RFbGVtZW50RW50aXR5KSB7XG5cdFx0Y29uc3QgY2FjaGUgPSB0aGlzLmxpc3RzLmdldCh0eXBlUmVmVG9QYXRoKHR5cGVSZWYpKT8uZ2V0KGxpc3RJZClcblx0XHRpZiAoY2FjaGUgPT0gbnVsbCkge1xuXHRcdFx0Ly8gZmlyc3QgZWxlbWVudCBpbiB0aGlzIGxpc3Rcblx0XHRcdGNvbnN0IG5ld0NhY2hlID0ge1xuXHRcdFx0XHRhbGxSYW5nZTogW2VsZW1lbnRJZF0sXG5cdFx0XHRcdGxvd2VyUmFuZ2VJZDogZWxlbWVudElkLFxuXHRcdFx0XHR1cHBlclJhbmdlSWQ6IGVsZW1lbnRJZCxcblx0XHRcdFx0ZWxlbWVudHM6IG5ldyBNYXAoW1tlbGVtZW50SWQsIGVudGl0eV1dKSxcblx0XHRcdH1cblx0XHRcdGdldEZyb21NYXAodGhpcy5saXN0cywgdHlwZVJlZlRvUGF0aCh0eXBlUmVmKSwgKCkgPT4gbmV3IE1hcCgpKS5zZXQobGlzdElkLCBuZXdDYWNoZSlcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gaWYgdGhlIGVsZW1lbnQgYWxyZWFkeSBleGlzdHMgaW4gdGhlIGNhY2hlLCBvdmVyd3JpdGUgaXRcblx0XHRcdC8vIGFkZCBuZXcgZWxlbWVudCB0byBleGlzdGluZyBsaXN0IGlmIG5lY2Vzc2FyeVxuXHRcdFx0Y2FjaGUuZWxlbWVudHMuc2V0KGVsZW1lbnRJZCwgZW50aXR5KVxuXHRcdFx0Y29uc3QgdHlwZU1vZGVsID0gYXdhaXQgcmVzb2x2ZVR5cGVSZWZlcmVuY2UodHlwZVJlZilcblx0XHRcdGlmIChhd2FpdCB0aGlzLmlzRWxlbWVudElkSW5DYWNoZVJhbmdlKHR5cGVSZWYsIGxpc3RJZCwgY3VzdG9tSWRUb0Jhc2U2NFVybCh0eXBlTW9kZWwsIGVsZW1lbnRJZCkpKSB7XG5cdFx0XHRcdHRoaXMuaW5zZXJ0SW50b1JhbmdlKGNhY2hlLmFsbFJhbmdlLCBlbGVtZW50SWQpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqIHByZWNvbmRpdGlvbjogZWxlbWVudElkIGlzIGNvbnZlcnRlZCB0byBiYXNlNjRleHQgaWYgbmVjZXNzYXJ5ICovXG5cdHByaXZhdGUgaW5zZXJ0SW50b1JhbmdlKGFsbFJhbmdlOiBBcnJheTxJZD4sIGVsZW1lbnRJZDogSWQpIHtcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFsbFJhbmdlLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRjb25zdCByYW5nZUVsZW1lbnQgPSBhbGxSYW5nZVtpXVxuXHRcdFx0aWYgKGZpcnN0QmlnZ2VyVGhhblNlY29uZChyYW5nZUVsZW1lbnQsIGVsZW1lbnRJZCkpIHtcblx0XHRcdFx0YWxsUmFuZ2Uuc3BsaWNlKGksIDAsIGVsZW1lbnRJZClcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHR9XG5cdFx0XHRpZiAocmFuZ2VFbGVtZW50ID09PSBlbGVtZW50SWQpIHtcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGFsbFJhbmdlLnB1c2goZWxlbWVudElkKVxuXHR9XG5cblx0YXN5bmMgcHJvdmlkZUZyb21SYW5nZTxUIGV4dGVuZHMgTGlzdEVsZW1lbnRFbnRpdHk+KHR5cGVSZWY6IFR5cGVSZWY8VD4sIGxpc3RJZDogSWQsIHN0YXJ0RWxlbWVudElkOiBJZCwgY291bnQ6IG51bWJlciwgcmV2ZXJzZTogYm9vbGVhbik6IFByb21pc2U8VFtdPiB7XG5cdFx0Y29uc3QgdHlwZU1vZGVsID0gYXdhaXQgcmVzb2x2ZVR5cGVSZWZlcmVuY2UodHlwZVJlZilcblx0XHRzdGFydEVsZW1lbnRJZCA9IGVuc3VyZUJhc2U2NEV4dCh0eXBlTW9kZWwsIHN0YXJ0RWxlbWVudElkKVxuXG5cdFx0Y29uc3QgbGlzdENhY2hlID0gdGhpcy5saXN0cy5nZXQodHlwZVJlZlRvUGF0aCh0eXBlUmVmKSk/LmdldChsaXN0SWQpXG5cblx0XHRpZiAobGlzdENhY2hlID09IG51bGwpIHtcblx0XHRcdHJldHVybiBbXVxuXHRcdH1cblxuXHRcdGxldCByYW5nZSA9IGxpc3RDYWNoZS5hbGxSYW5nZVxuXHRcdGxldCBpZHM6IElkW10gPSBbXVxuXHRcdGlmIChyZXZlcnNlKSB7XG5cdFx0XHRsZXQgaVxuXHRcdFx0Zm9yIChpID0gcmFuZ2UubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcblx0XHRcdFx0aWYgKGZpcnN0QmlnZ2VyVGhhblNlY29uZChzdGFydEVsZW1lbnRJZCwgcmFuZ2VbaV0pKSB7XG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKGkgPj0gMCkge1xuXHRcdFx0XHRsZXQgc3RhcnRJbmRleCA9IGkgKyAxIC0gY291bnRcblx0XHRcdFx0aWYgKHN0YXJ0SW5kZXggPCAwKSB7XG5cdFx0XHRcdFx0Ly8gc3RhcnRFbGVtZW50SWQgaW5kZXggbWF5IGJlIG5lZ2F0aXZlIGlmIG1vcmUgZWxlbWVudHMgaGF2ZSBiZWVuIHJlcXVlc3RlZCB0aGFuIGF2YWlsYWJsZSB3aGVuIGdldHRpbmcgZWxlbWVudHMgcmV2ZXJzZS5cblx0XHRcdFx0XHRzdGFydEluZGV4ID0gMFxuXHRcdFx0XHR9XG5cdFx0XHRcdGlkcyA9IHJhbmdlLnNsaWNlKHN0YXJ0SW5kZXgsIGkgKyAxKVxuXHRcdFx0XHRpZHMucmV2ZXJzZSgpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZHMgPSBbXVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBpID0gcmFuZ2UuZmluZEluZGV4KChpZCkgPT4gZmlyc3RCaWdnZXJUaGFuU2Vjb25kKGlkLCBzdGFydEVsZW1lbnRJZCkpXG5cdFx0XHRpZHMgPSByYW5nZS5zbGljZShpLCBpICsgY291bnQpXG5cdFx0fVxuXHRcdGxldCByZXN1bHQ6IFRbXSA9IFtdXG5cdFx0Zm9yIChsZXQgYSA9IDA7IGEgPCBpZHMubGVuZ3RoOyBhKyspIHtcblx0XHRcdHJlc3VsdC5wdXNoKGNsb25lKGxpc3RDYWNoZS5lbGVtZW50cy5nZXQoaWRzW2FdKSBhcyBUKSlcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdFxuXHR9XG5cblx0YXN5bmMgcHJvdmlkZU11bHRpcGxlPFQgZXh0ZW5kcyBMaXN0RWxlbWVudEVudGl0eT4odHlwZVJlZjogVHlwZVJlZjxUPiwgbGlzdElkOiBJZCwgZWxlbWVudElkczogSWRbXSk6IFByb21pc2U8QXJyYXk8VD4+IHtcblx0XHRjb25zdCBsaXN0Q2FjaGUgPSB0aGlzLmxpc3RzLmdldCh0eXBlUmVmVG9QYXRoKHR5cGVSZWYpKT8uZ2V0KGxpc3RJZClcblxuXHRcdGNvbnN0IHR5cGVNb2RlbCA9IGF3YWl0IHJlc29sdmVUeXBlUmVmZXJlbmNlKHR5cGVSZWYpXG5cdFx0ZWxlbWVudElkcyA9IGVsZW1lbnRJZHMubWFwKChlbCkgPT4gZW5zdXJlQmFzZTY0RXh0KHR5cGVNb2RlbCwgZWwpKVxuXG5cdFx0aWYgKGxpc3RDYWNoZSA9PSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gW11cblx0XHR9XG5cdFx0bGV0IHJlc3VsdDogVFtdID0gW11cblx0XHRmb3IgKGxldCBhID0gMDsgYSA8IGVsZW1lbnRJZHMubGVuZ3RoOyBhKyspIHtcblx0XHRcdHJlc3VsdC5wdXNoKGNsb25lKGxpc3RDYWNoZS5lbGVtZW50cy5nZXQoZWxlbWVudElkc1thXSkgYXMgVCkpXG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHRcblx0fVxuXG5cdGFzeW5jIGdldFJhbmdlRm9yTGlzdDxUIGV4dGVuZHMgTGlzdEVsZW1lbnRFbnRpdHk+KHR5cGVSZWY6IFR5cGVSZWY8VD4sIGxpc3RJZDogSWQpOiBQcm9taXNlPHsgbG93ZXI6IElkOyB1cHBlcjogSWQgfSB8IG51bGw+IHtcblx0XHRjb25zdCBsaXN0Q2FjaGUgPSB0aGlzLmxpc3RzLmdldCh0eXBlUmVmVG9QYXRoKHR5cGVSZWYpKT8uZ2V0KGxpc3RJZClcblxuXHRcdGlmIChsaXN0Q2FjaGUgPT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuIG51bGxcblx0XHR9XG5cblx0XHRjb25zdCB0eXBlTW9kZWwgPSBhd2FpdCByZXNvbHZlVHlwZVJlZmVyZW5jZSh0eXBlUmVmKVxuXHRcdHJldHVybiB7XG5cdFx0XHRsb3dlcjogY3VzdG9tSWRUb0Jhc2U2NFVybCh0eXBlTW9kZWwsIGxpc3RDYWNoZS5sb3dlclJhbmdlSWQpLFxuXHRcdFx0dXBwZXI6IGN1c3RvbUlkVG9CYXNlNjRVcmwodHlwZU1vZGVsLCBsaXN0Q2FjaGUudXBwZXJSYW5nZUlkKSxcblx0XHR9XG5cdH1cblxuXHRhc3luYyBzZXRVcHBlclJhbmdlRm9yTGlzdDxUIGV4dGVuZHMgTGlzdEVsZW1lbnRFbnRpdHk+KHR5cGVSZWY6IFR5cGVSZWY8VD4sIGxpc3RJZDogSWQsIHVwcGVySWQ6IElkKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3QgdHlwZU1vZGVsID0gYXdhaXQgcmVzb2x2ZVR5cGVSZWZlcmVuY2UodHlwZVJlZilcblx0XHR1cHBlcklkID0gZW5zdXJlQmFzZTY0RXh0KHR5cGVNb2RlbCwgdXBwZXJJZClcblx0XHRjb25zdCBsaXN0Q2FjaGUgPSB0aGlzLmxpc3RzLmdldCh0eXBlUmVmVG9QYXRoKHR5cGVSZWYpKT8uZ2V0KGxpc3RJZClcblx0XHRpZiAobGlzdENhY2hlID09IG51bGwpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcImxpc3QgZG9lcyBub3QgZXhpc3RcIilcblx0XHR9XG5cdFx0bGlzdENhY2hlLnVwcGVyUmFuZ2VJZCA9IHVwcGVySWRcblx0fVxuXG5cdGFzeW5jIHNldExvd2VyUmFuZ2VGb3JMaXN0PFQgZXh0ZW5kcyBMaXN0RWxlbWVudEVudGl0eT4odHlwZVJlZjogVHlwZVJlZjxUPiwgbGlzdElkOiBJZCwgbG93ZXJJZDogSWQpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCB0eXBlTW9kZWwgPSBhd2FpdCByZXNvbHZlVHlwZVJlZmVyZW5jZSh0eXBlUmVmKVxuXHRcdGxvd2VySWQgPSBlbnN1cmVCYXNlNjRFeHQodHlwZU1vZGVsLCBsb3dlcklkKVxuXHRcdGNvbnN0IGxpc3RDYWNoZSA9IHRoaXMubGlzdHMuZ2V0KHR5cGVSZWZUb1BhdGgodHlwZVJlZikpPy5nZXQobGlzdElkKVxuXHRcdGlmIChsaXN0Q2FjaGUgPT0gbnVsbCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibGlzdCBkb2VzIG5vdCBleGlzdFwiKVxuXHRcdH1cblx0XHRsaXN0Q2FjaGUubG93ZXJSYW5nZUlkID0gbG93ZXJJZFxuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBuZXcgbGlzdCBjYWNoZSBpZiB0aGVyZSBpcyBub25lLiBSZXNldHMgZXZlcnl0aGluZyBidXQgZWxlbWVudHMuXG5cdCAqIEBwYXJhbSB0eXBlUmVmXG5cdCAqIEBwYXJhbSBsaXN0SWRcblx0ICogQHBhcmFtIGxvd2VyXG5cdCAqIEBwYXJhbSB1cHBlclxuXHQgKi9cblx0YXN5bmMgc2V0TmV3UmFuZ2VGb3JMaXN0PFQgZXh0ZW5kcyBMaXN0RWxlbWVudEVudGl0eT4odHlwZVJlZjogVHlwZVJlZjxUPiwgbGlzdElkOiBJZCwgbG93ZXI6IElkLCB1cHBlcjogSWQpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCB0eXBlTW9kZWwgPSBhd2FpdCByZXNvbHZlVHlwZVJlZmVyZW5jZSh0eXBlUmVmKVxuXHRcdGxvd2VyID0gZW5zdXJlQmFzZTY0RXh0KHR5cGVNb2RlbCwgbG93ZXIpXG5cdFx0dXBwZXIgPSBlbnN1cmVCYXNlNjRFeHQodHlwZU1vZGVsLCB1cHBlcilcblxuXHRcdGNvbnN0IGxpc3RDYWNoZSA9IHRoaXMubGlzdHMuZ2V0KHR5cGVSZWZUb1BhdGgodHlwZVJlZikpPy5nZXQobGlzdElkKVxuXHRcdGlmIChsaXN0Q2FjaGUgPT0gbnVsbCkge1xuXHRcdFx0Z2V0RnJvbU1hcCh0aGlzLmxpc3RzLCB0eXBlUmVmVG9QYXRoKHR5cGVSZWYpLCAoKSA9PiBuZXcgTWFwKCkpLnNldChsaXN0SWQsIHtcblx0XHRcdFx0YWxsUmFuZ2U6IFtdLFxuXHRcdFx0XHRsb3dlclJhbmdlSWQ6IGxvd2VyLFxuXHRcdFx0XHR1cHBlclJhbmdlSWQ6IHVwcGVyLFxuXHRcdFx0XHRlbGVtZW50czogbmV3IE1hcCgpLFxuXHRcdFx0fSlcblx0XHR9IGVsc2Uge1xuXHRcdFx0bGlzdENhY2hlLmxvd2VyUmFuZ2VJZCA9IGxvd2VyXG5cdFx0XHRsaXN0Q2FjaGUudXBwZXJSYW5nZUlkID0gdXBwZXJcblx0XHRcdGxpc3RDYWNoZS5hbGxSYW5nZSA9IFtdXG5cdFx0fVxuXHR9XG5cblx0YXN5bmMgZ2V0SWRzSW5SYW5nZTxUIGV4dGVuZHMgTGlzdEVsZW1lbnRFbnRpdHk+KHR5cGVSZWY6IFR5cGVSZWY8VD4sIGxpc3RJZDogSWQpOiBQcm9taXNlPEFycmF5PElkPj4ge1xuXHRcdGNvbnN0IHR5cGVNb2RlbCA9IGF3YWl0IHJlc29sdmVUeXBlUmVmZXJlbmNlKHR5cGVSZWYpXG5cdFx0cmV0dXJuIChcblx0XHRcdHRoaXMubGlzdHNcblx0XHRcdFx0LmdldCh0eXBlUmVmVG9QYXRoKHR5cGVSZWYpKVxuXHRcdFx0XHQ/LmdldChsaXN0SWQpXG5cdFx0XHRcdD8uYWxsUmFuZ2UubWFwKChlbGVtZW50SWQpID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gY3VzdG9tSWRUb0Jhc2U2NFVybCh0eXBlTW9kZWwsIGVsZW1lbnRJZClcblx0XHRcdFx0fSkgPz8gW11cblx0XHQpXG5cdH1cblxuXHRhc3luYyBnZXRMYXN0QmF0Y2hJZEZvckdyb3VwKGdyb3VwSWQ6IElkKTogUHJvbWlzZTxJZCB8IG51bGw+IHtcblx0XHRyZXR1cm4gdGhpcy5sYXN0QmF0Y2hJZFBlckdyb3VwLmdldChncm91cElkKSA/PyBudWxsXG5cdH1cblxuXHRhc3luYyBwdXRMYXN0QmF0Y2hJZEZvckdyb3VwKGdyb3VwSWQ6IElkLCBiYXRjaElkOiBJZCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHRoaXMubGFzdEJhdGNoSWRQZXJHcm91cC5zZXQoZ3JvdXBJZCwgYmF0Y2hJZClcblx0fVxuXG5cdHB1cmdlU3RvcmFnZSgpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcblx0fVxuXG5cdGFzeW5jIGdldExhc3RVcGRhdGVUaW1lKCk6IFByb21pc2U8TGFzdFVwZGF0ZVRpbWU+IHtcblx0XHRyZXR1cm4gdGhpcy5sYXN0VXBkYXRlVGltZSA/IHsgdHlwZTogXCJyZWNvcmRlZFwiLCB0aW1lOiB0aGlzLmxhc3RVcGRhdGVUaW1lIH0gOiB7IHR5cGU6IFwibmV2ZXJcIiB9XG5cdH1cblxuXHRhc3luYyBwdXRMYXN0VXBkYXRlVGltZSh2YWx1ZTogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0dGhpcy5sYXN0VXBkYXRlVGltZSA9IHZhbHVlXG5cdH1cblxuXHRhc3luYyBnZXRXaG9sZUxpc3Q8VCBleHRlbmRzIExpc3RFbGVtZW50RW50aXR5Pih0eXBlUmVmOiBUeXBlUmVmPFQ+LCBsaXN0SWQ6IElkKTogUHJvbWlzZTxBcnJheTxUPj4ge1xuXHRcdGNvbnN0IGxpc3RDYWNoZSA9IHRoaXMubGlzdHMuZ2V0KHR5cGVSZWZUb1BhdGgodHlwZVJlZikpPy5nZXQobGlzdElkKVxuXG5cdFx0aWYgKGxpc3RDYWNoZSA9PSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gW11cblx0XHR9XG5cblx0XHRyZXR1cm4gbGlzdENhY2hlLmFsbFJhbmdlLm1hcCgoaWQpID0+IGNsb25lKGxpc3RDYWNoZS5lbGVtZW50cy5nZXQoaWQpIGFzIFQpKVxuXHR9XG5cblx0Z2V0Q3VzdG9tQ2FjaGVIYW5kbGVyTWFwKGVudGl0eVJlc3RDbGllbnQ6IEVudGl0eVJlc3RDbGllbnQpOiBDdXN0b21DYWNoZUhhbmRsZXJNYXAge1xuXHRcdHJldHVybiB0aGlzLmN1c3RvbUNhY2hlSGFuZGxlck1hcFxuXHR9XG5cblx0Z2V0VXNlcklkKCk6IElkIHtcblx0XHRyZXR1cm4gYXNzZXJ0Tm90TnVsbCh0aGlzLnVzZXJJZCwgXCJObyB1c2VyIGlkLCBub3QgaW5pdGlhbGl6ZWQ/XCIpXG5cdH1cblxuXHRhc3luYyBkZWxldGVBbGxPd25lZEJ5KG93bmVyOiBJZCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGZvciAoY29uc3QgdHlwZU1hcCBvZiB0aGlzLmVudGl0aWVzLnZhbHVlcygpKSB7XG5cdFx0XHRmb3IgKGNvbnN0IFtpZCwgZW50aXR5XSBvZiB0eXBlTWFwLmVudHJpZXMoKSkge1xuXHRcdFx0XHRpZiAoZW50aXR5Ll9vd25lckdyb3VwID09PSBvd25lcikge1xuXHRcdFx0XHRcdHR5cGVNYXAuZGVsZXRlKGlkKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGZvciAoY29uc3QgY2FjaGVGb3JUeXBlIG9mIHRoaXMubGlzdHMudmFsdWVzKCkpIHtcblx0XHRcdHRoaXMuZGVsZXRlQWxsT3duZWRCeUZyb21DYWNoZShjYWNoZUZvclR5cGUsIG93bmVyKVxuXHRcdH1cblx0XHRmb3IgKGNvbnN0IGNhY2hlRm9yVHlwZSBvZiB0aGlzLmJsb2JFbnRpdGllcy52YWx1ZXMoKSkge1xuXHRcdFx0dGhpcy5kZWxldGVBbGxPd25lZEJ5RnJvbUNhY2hlKGNhY2hlRm9yVHlwZSwgb3duZXIpXG5cdFx0fVxuXHRcdHRoaXMubGFzdEJhdGNoSWRQZXJHcm91cC5kZWxldGUob3duZXIpXG5cdH1cblxuXHRhc3luYyBkZWxldGVXaG9sZUxpc3Q8VCBleHRlbmRzIExpc3RFbGVtZW50RW50aXR5Pih0eXBlUmVmOiBUeXBlUmVmPFQ+LCBsaXN0SWQ6IElkKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0dGhpcy5saXN0cy5nZXQodHlwZVJlZi50eXBlKT8uZGVsZXRlKGxpc3RJZClcblx0fVxuXG5cdHByaXZhdGUgZGVsZXRlQWxsT3duZWRCeUZyb21DYWNoZShjYWNoZUZvclR5cGU6IE1hcDxJZCwgTGlzdENhY2hlIHwgQmxvYkVsZW1lbnRDYWNoZT4sIG93bmVyOiBzdHJpbmcpIHtcblx0XHQvLyBJZiB3ZSBmaW5kIGF0IGxlYXN0IG9uZSBlbGVtZW50IGluIHRoZSBsaXN0IHRoYXQgaXMgb3duZWQgYnkgb3VyIHRhcmdldCBvd25lciwgd2UgZGVsZXRlIHRoZSBlbnRpcmUgbGlzdC5cblx0XHQvLyBUaGlzIGlzIE9LIGluIG1vc3QgY2FzZXMgYmVjYXVzZSB0aGUgdmFzdCBtYWpvcml0eSBvZiBsaXN0cyBhcmUgc2luZ2xlIG93bmVyLlxuXHRcdC8vIEZvciB0aGUgb3RoZXIgY2FzZXMsIHdlIGFyZSBqdXN0IGNsZWFyaW5nIHRoZSBjYWNoZSBhIGJpdCBzb29uZXIgdGhhbiBuZWVkZWQuXG5cdFx0Y29uc3QgbGlzdElkc1RvRGVsZXRlOiBzdHJpbmdbXSA9IFtdXG5cdFx0Zm9yIChjb25zdCBbbGlzdElkLCBsaXN0Q2FjaGVdIG9mIGNhY2hlRm9yVHlwZS5lbnRyaWVzKCkpIHtcblx0XHRcdGZvciAoY29uc3QgW2lkLCBlbGVtZW50XSBvZiBsaXN0Q2FjaGUuZWxlbWVudHMuZW50cmllcygpKSB7XG5cdFx0XHRcdGlmIChlbGVtZW50Ll9vd25lckdyb3VwID09PSBvd25lcikge1xuXHRcdFx0XHRcdGxpc3RJZHNUb0RlbGV0ZS5wdXNoKGxpc3RJZClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGZvciAoY29uc3QgbGlzdElkIG9mIGxpc3RJZHNUb0RlbGV0ZSkge1xuXHRcdFx0Y2FjaGVGb3JUeXBlLmRlbGV0ZShsaXN0SWQpXG5cdFx0fVxuXHR9XG5cblx0Y2xlYXJFeGNsdWRlZERhdGEoKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG5cdH1cblxuXHQvKipcblx0ICogV2Ugd2FudCB0byBsb2NrIHRoZSBhY2Nlc3MgdG8gdGhlIFwicmFuZ2VzXCIgZGIgd2hlbiB1cGRhdGluZyAvIHJlYWRpbmcgdGhlXG5cdCAqIG9mZmxpbmUgYXZhaWxhYmxlIG1haWwgbGlzdCByYW5nZXMgZm9yIGVhY2ggbWFpbCBsaXN0IChyZWZlcmVuY2VkIHVzaW5nIHRoZSBsaXN0SWQpXG5cdCAqIEBwYXJhbSBsaXN0SWQgdGhlIG1haWwgbGlzdCB0aGF0IHdlIHdhbnQgdG8gbG9ja1xuXHQgKi9cblx0bG9ja1Jhbmdlc0RiQWNjZXNzKGxpc3RJZDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG5cdH1cblxuXHQvKipcblx0ICogVGhpcyBpcyB0aGUgY291bnRlcnBhcnQgdG8gdGhlIGZ1bmN0aW9uIFwibG9ja1Jhbmdlc0RiQWNjZXNzKGxpc3RJZClcIlxuXHQgKiBAcGFyYW0gbGlzdElkIHRoZSBtYWlsIGxpc3QgdGhhdCB3ZSB3YW50IHRvIHVubG9ja1xuXHQgKi9cblx0dW5sb2NrUmFuZ2VzRGJBY2Nlc3MobGlzdElkOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcblx0fVxufVxuIiwiaW1wb3J0IHsgQ2FjaGVTdG9yYWdlLCBMYXN0VXBkYXRlVGltZSwgUmFuZ2UgfSBmcm9tIFwiLi9EZWZhdWx0RW50aXR5UmVzdENhY2hlLmpzXCJcbmltcG9ydCB7IFByb2dyYW1taW5nRXJyb3IgfSBmcm9tIFwiLi4vLi4vY29tbW9uL2Vycm9yL1Byb2dyYW1taW5nRXJyb3JcIlxuaW1wb3J0IHsgTGlzdEVsZW1lbnRFbnRpdHksIFNvbWVFbnRpdHkgfSBmcm9tIFwiLi4vLi4vY29tbW9uL0VudGl0eVR5cGVzXCJcbmltcG9ydCB7IFR5cGVSZWYgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB7IE9mZmxpbmVTdG9yYWdlLCBPZmZsaW5lU3RvcmFnZUluaXRBcmdzIH0gZnJvbSBcIi4uL29mZmxpbmUvT2ZmbGluZVN0b3JhZ2UuanNcIlxuaW1wb3J0IHsgRXBoZW1lcmFsQ2FjaGVTdG9yYWdlLCBFcGhlbWVyYWxTdG9yYWdlSW5pdEFyZ3MgfSBmcm9tIFwiLi9FcGhlbWVyYWxDYWNoZVN0b3JhZ2VcIlxuaW1wb3J0IHsgRW50aXR5UmVzdENsaWVudCB9IGZyb20gXCIuL0VudGl0eVJlc3RDbGllbnQuanNcIlxuaW1wb3J0IHsgQ3VzdG9tQ2FjaGVIYW5kbGVyTWFwIH0gZnJvbSBcIi4vQ3VzdG9tQ2FjaGVIYW5kbGVyLmpzXCJcblxuZXhwb3J0IGludGVyZmFjZSBFcGhlbWVyYWxTdG9yYWdlQXJncyBleHRlbmRzIEVwaGVtZXJhbFN0b3JhZ2VJbml0QXJncyB7XG5cdHR5cGU6IFwiZXBoZW1lcmFsXCJcbn1cblxuZXhwb3J0IHR5cGUgT2ZmbGluZVN0b3JhZ2VBcmdzID0gT2ZmbGluZVN0b3JhZ2VJbml0QXJncyAmIHtcblx0dHlwZTogXCJvZmZsaW5lXCJcbn1cblxuaW50ZXJmYWNlIENhY2hlU3RvcmFnZUluaXRSZXR1cm4ge1xuXHQvKiogSWYgdGhlIGNyZWF0ZWQgc3RvcmFnZSBpcyBhbiBPZmZsaW5lU3RvcmFnZSAqL1xuXHRpc1BlcnNpc3RlbnQ6IGJvb2xlYW5cblx0LyoqIElmIGEgT2ZmbGluZVN0b3JhZ2Ugd2FzIGNyZWF0ZWQsIHdoZXRoZXIgb3Igbm90IHRoZSBiYWNraW5nIGRhdGFiYXNlIHdhcyBjcmVhdGVkIGZyZXNoIG9yIGFscmVhZHkgZXhpc3RlZCAqL1xuXHRpc05ld09mZmxpbmVEYjogYm9vbGVhblxufVxuXG5leHBvcnQgaW50ZXJmYWNlIENhY2hlU3RvcmFnZUxhdGVJbml0aWFsaXplciB7XG5cdGluaXRpYWxpemUoYXJnczogT2ZmbGluZVN0b3JhZ2VBcmdzIHwgRXBoZW1lcmFsU3RvcmFnZUFyZ3MpOiBQcm9taXNlPENhY2hlU3RvcmFnZUluaXRSZXR1cm4+XG5cblx0ZGVJbml0aWFsaXplKCk6IFByb21pc2U8dm9pZD5cbn1cblxudHlwZSBTb21lU3RvcmFnZSA9IE9mZmxpbmVTdG9yYWdlIHwgRXBoZW1lcmFsQ2FjaGVTdG9yYWdlXG5cbi8qKlxuICogVGhpcyBpcyBuZWNlc3Nhcnkgc28gdGhhdCB3ZSBjYW4gcmVsZWFzZSBvZmZsaW5lIHN0b3JhZ2UgbW9kZSB3aXRob3V0IGhhdmluZyB0byByZXdyaXRlIHRoZSBjcmVkZW50aWFscyBoYW5kbGluZyBzeXN0ZW0uIFNpbmNlIGl0J3MgcG9zc2libGUgdGhhdFxuICogYSBkZXNrdG9wIHVzZXIgbWlnaHQgbm90IHVzZSBhIHBlcnNpc3RlbnQgc2Vzc2lvbiwgYW5kIHdlIHdvbid0IGtub3cgdW50aWwgdGhleSB0cnkgdG8gbG9nIGluLCB3ZSBjYW4gb25seSBkZWNpZGUgd2hhdCBraW5kIG9mIGNhY2hlIHN0b3JhZ2UgdG8gdXNlIGF0IGxvZ2luXG4gKiBUaGlzIGltcGxlbWVudGF0aW9uIGFsbG93cyB1cyB0byBhdm9pZCBtb2RpZnlpbmcgdG9vIG11Y2ggb2YgdGhlIHdvcmtlciBwdWJsaWMgQVBJLiBPbmNlIHdlIG1ha2UgdGhpcyBvYnNvbGV0ZSwgYWxsIHdlIHdpbGwgaGF2ZSB0byBkbyBpc1xuICogcmVtb3ZlIHRoZSBpbml0aWFsaXplIHBhcmFtZXRlciBmcm9tIHRoZSBMb2dpbkZhY2FkZSwgYW5kIHRpZHkgdXAgdGhlIFdvcmtlckxvY2F0b3IgaW5pdFxuICpcbiAqIENyZWF0ZSBhIHByb3h5IHRvIGEgY2FjaGUgc3RvcmFnZSBvYmplY3QuXG4gKiBJdCB3aWxsIGJlIHVuaW5pdGlhbGl6ZWQsIGFuZCB1bnVzYWJsZSB1bnRpbCB7QG1ldGhvZCBDYWNoZVN0b3JhZ2VMYXRlSW5pdGlhbGl6ZXIuaW5pdGlhbGl6ZUNhY2hlU3RvcmFnZX0gaGFzIGJlZW4gY2FsbGVkIG9uIHRoZSByZXR1cm5lZCBvYmplY3RcbiAqIE9uY2UgaXQgaXMgaW5pdGlhbGl6ZWQsIHRoZW4gaXQgaXMgc2FmZSB0byB1c2VcbiAqIEBwYXJhbSBmYWN0b3J5IEEgZmFjdG9yeSBmdW5jdGlvbiB0byBnZXQgYSBDYWNoZVN0b3JhZ2UgaW1wbGVtZW50YXRpb24gd2hlbiBpbml0aWFsaXplIGlzIGNhbGxlZFxuICogQHJldHVybiB7Q2FjaGVTdG9yYWdlTGF0ZUluaXRpYWxpemVyfSBUaGUgdW5pbml0aWFsaXplZCBwcm94eSBhbmQgYSBmdW5jdGlvbiB0byBpbml0aWFsaXplIGl0XG4gKi9cbmV4cG9ydCBjbGFzcyBMYXRlSW5pdGlhbGl6ZWRDYWNoZVN0b3JhZ2VJbXBsIGltcGxlbWVudHMgQ2FjaGVTdG9yYWdlTGF0ZUluaXRpYWxpemVyLCBDYWNoZVN0b3JhZ2Uge1xuXHRwcml2YXRlIF9pbm5lcjogU29tZVN0b3JhZ2UgfCBudWxsID0gbnVsbFxuXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgc2VuZEVycm9yOiAoZXJyb3I6IEVycm9yKSA9PiBQcm9taXNlPHZvaWQ+LCBwcml2YXRlIHJlYWRvbmx5IG9mZmxpbmVTdG9yYWdlUHJvdmlkZXI6ICgpID0+IFByb21pc2U8bnVsbCB8IE9mZmxpbmVTdG9yYWdlPikge31cblxuXHRwcml2YXRlIGdldCBpbm5lcigpOiBDYWNoZVN0b3JhZ2Uge1xuXHRcdGlmICh0aGlzLl9pbm5lciA9PSBudWxsKSB7XG5cdFx0XHR0aHJvdyBuZXcgUHJvZ3JhbW1pbmdFcnJvcihcIkNhY2hlIHN0b3JhZ2UgaXMgbm90IGluaXRpYWxpemVkXCIpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuX2lubmVyXG5cdH1cblxuXHRhc3luYyBpbml0aWFsaXplKGFyZ3M6IE9mZmxpbmVTdG9yYWdlQXJncyB8IEVwaGVtZXJhbFN0b3JhZ2VBcmdzKTogUHJvbWlzZTxDYWNoZVN0b3JhZ2VJbml0UmV0dXJuPiB7XG5cdFx0Ly8gV2UgbWlnaHQgY2FsbCB0aGlzIG11bHRpcGxlIHRpbWVzLlxuXHRcdC8vIFRoaXMgaGFwcGVucyB3aGVuIHBlcnNpc3RlbnQgY3JlZGVudGlhbHMgbG9naW4gZmFpbHMgYW5kIHdlIG5lZWQgdG8gc3RhcnQgd2l0aCBuZXcgY2FjaGUgZm9yIG5ldyBsb2dpbi5cblx0XHRjb25zdCB7IHN0b3JhZ2UsIGlzUGVyc2lzdGVudCwgaXNOZXdPZmZsaW5lRGIgfSA9IGF3YWl0IHRoaXMuZ2V0U3RvcmFnZShhcmdzKVxuXHRcdHRoaXMuX2lubmVyID0gc3RvcmFnZVxuXHRcdHJldHVybiB7XG5cdFx0XHRpc1BlcnNpc3RlbnQsXG5cdFx0XHRpc05ld09mZmxpbmVEYixcblx0XHR9XG5cdH1cblxuXHRhc3luYyBkZUluaXRpYWxpemUoKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0dGhpcy5faW5uZXI/LmRlaW5pdCgpXG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIGdldFN0b3JhZ2UoXG5cdFx0YXJnczogT2ZmbGluZVN0b3JhZ2VBcmdzIHwgRXBoZW1lcmFsU3RvcmFnZUFyZ3MsXG5cdCk6IFByb21pc2U8eyBzdG9yYWdlOiBTb21lU3RvcmFnZTsgaXNQZXJzaXN0ZW50OiBib29sZWFuOyBpc05ld09mZmxpbmVEYjogYm9vbGVhbiB9PiB7XG5cdFx0aWYgKGFyZ3MudHlwZSA9PT0gXCJvZmZsaW5lXCIpIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGNvbnN0IHN0b3JhZ2UgPSBhd2FpdCB0aGlzLm9mZmxpbmVTdG9yYWdlUHJvdmlkZXIoKVxuXHRcdFx0XHRpZiAoc3RvcmFnZSAhPSBudWxsKSB7XG5cdFx0XHRcdFx0Y29uc3QgaXNOZXdPZmZsaW5lRGIgPSBhd2FpdCBzdG9yYWdlLmluaXQoYXJncylcblx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0c3RvcmFnZSxcblx0XHRcdFx0XHRcdGlzUGVyc2lzdGVudDogdHJ1ZSxcblx0XHRcdFx0XHRcdGlzTmV3T2ZmbGluZURiLFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHQvLyBQcmVjYXV0aW9uIGluIGNhc2Ugc29tZXRoaW5nIGJhZCBoYXBwZW5zIHRvIG9mZmxpbmUgZGF0YWJhc2UuIFdlIHdhbnQgdXNlcnMgdG8gc3RpbGwgYmUgYWJsZSB0byBsb2cgaW4uXG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoXCJFcnJvciB3aGlsZSBpbml0aWFsaXppbmcgb2ZmbGluZSBjYWNoZSBzdG9yYWdlXCIsIGUpXG5cdFx0XHRcdHRoaXMuc2VuZEVycm9yKGUpXG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIGJvdGggXCJlbHNlXCIgY2FzZSBhbmQgZmFsbGJhY2sgZm9yIHVuYXZhaWxhYmxlIHN0b3JhZ2UgYW5kIGVycm9yIGNhc2VzXG5cdFx0Y29uc3Qgc3RvcmFnZSA9IG5ldyBFcGhlbWVyYWxDYWNoZVN0b3JhZ2UoKVxuXHRcdGF3YWl0IHN0b3JhZ2UuaW5pdChhcmdzKVxuXHRcdHJldHVybiB7XG5cdFx0XHRzdG9yYWdlLFxuXHRcdFx0aXNQZXJzaXN0ZW50OiBmYWxzZSxcblx0XHRcdGlzTmV3T2ZmbGluZURiOiBmYWxzZSxcblx0XHR9XG5cdH1cblxuXHRkZWxldGVJZkV4aXN0czxUIGV4dGVuZHMgU29tZUVudGl0eT4odHlwZVJlZjogVHlwZVJlZjxUPiwgbGlzdElkOiBJZCB8IG51bGwsIGlkOiBJZCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHJldHVybiB0aGlzLmlubmVyLmRlbGV0ZUlmRXhpc3RzKHR5cGVSZWYsIGxpc3RJZCwgaWQpXG5cdH1cblxuXHRnZXQ8VCBleHRlbmRzIFNvbWVFbnRpdHk+KHR5cGVSZWY6IFR5cGVSZWY8VD4sIGxpc3RJZDogSWQgfCBudWxsLCBpZDogSWQpOiBQcm9taXNlPFQgfCBudWxsPiB7XG5cdFx0cmV0dXJuIHRoaXMuaW5uZXIuZ2V0KHR5cGVSZWYsIGxpc3RJZCwgaWQpXG5cdH1cblxuXHRnZXRJZHNJblJhbmdlPFQgZXh0ZW5kcyBMaXN0RWxlbWVudEVudGl0eT4odHlwZVJlZjogVHlwZVJlZjxUPiwgbGlzdElkOiBJZCk6IFByb21pc2U8QXJyYXk8SWQ+PiB7XG5cdFx0cmV0dXJuIHRoaXMuaW5uZXIuZ2V0SWRzSW5SYW5nZSh0eXBlUmVmLCBsaXN0SWQpXG5cdH1cblxuXHRnZXRMYXN0QmF0Y2hJZEZvckdyb3VwKGdyb3VwSWQ6IElkKTogUHJvbWlzZTxJZCB8IG51bGw+IHtcblx0XHRyZXR1cm4gdGhpcy5pbm5lci5nZXRMYXN0QmF0Y2hJZEZvckdyb3VwKGdyb3VwSWQpXG5cdH1cblxuXHRhc3luYyBnZXRMYXN0VXBkYXRlVGltZSgpOiBQcm9taXNlPExhc3RVcGRhdGVUaW1lPiB7XG5cdFx0cmV0dXJuIHRoaXMuX2lubmVyID8gdGhpcy5pbm5lci5nZXRMYXN0VXBkYXRlVGltZSgpIDogeyB0eXBlOiBcInVuaW5pdGlhbGl6ZWRcIiB9XG5cdH1cblxuXHRnZXRSYW5nZUZvckxpc3Q8VCBleHRlbmRzIExpc3RFbGVtZW50RW50aXR5Pih0eXBlUmVmOiBUeXBlUmVmPFQ+LCBsaXN0SWQ6IElkKTogUHJvbWlzZTxSYW5nZSB8IG51bGw+IHtcblx0XHRyZXR1cm4gdGhpcy5pbm5lci5nZXRSYW5nZUZvckxpc3QodHlwZVJlZiwgbGlzdElkKVxuXHR9XG5cblx0aXNFbGVtZW50SWRJbkNhY2hlUmFuZ2U8VCBleHRlbmRzIExpc3RFbGVtZW50RW50aXR5Pih0eXBlUmVmOiBUeXBlUmVmPFQ+LCBsaXN0SWQ6IElkLCBpZDogSWQpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRyZXR1cm4gdGhpcy5pbm5lci5pc0VsZW1lbnRJZEluQ2FjaGVSYW5nZSh0eXBlUmVmLCBsaXN0SWQsIGlkKVxuXHR9XG5cblx0cHJvdmlkZUZyb21SYW5nZTxUIGV4dGVuZHMgTGlzdEVsZW1lbnRFbnRpdHk+KHR5cGVSZWY6IFR5cGVSZWY8VD4sIGxpc3RJZDogSWQsIHN0YXJ0OiBJZCwgY291bnQ6IG51bWJlciwgcmV2ZXJzZTogYm9vbGVhbik6IFByb21pc2U8VFtdPiB7XG5cdFx0cmV0dXJuIHRoaXMuaW5uZXIucHJvdmlkZUZyb21SYW5nZSh0eXBlUmVmLCBsaXN0SWQsIHN0YXJ0LCBjb3VudCwgcmV2ZXJzZSlcblx0fVxuXG5cdHByb3ZpZGVNdWx0aXBsZTxUIGV4dGVuZHMgTGlzdEVsZW1lbnRFbnRpdHk+KHR5cGVSZWY6IFR5cGVSZWY8VD4sIGxpc3RJZDogc3RyaW5nLCBlbGVtZW50SWRzOiBzdHJpbmdbXSk6IFByb21pc2U8VFtdPiB7XG5cdFx0cmV0dXJuIHRoaXMuaW5uZXIucHJvdmlkZU11bHRpcGxlKHR5cGVSZWYsIGxpc3RJZCwgZWxlbWVudElkcylcblx0fVxuXG5cdGdldFdob2xlTGlzdDxUIGV4dGVuZHMgTGlzdEVsZW1lbnRFbnRpdHk+KHR5cGVSZWY6IFR5cGVSZWY8VD4sIGxpc3RJZDogSWQpOiBQcm9taXNlPEFycmF5PFQ+PiB7XG5cdFx0cmV0dXJuIHRoaXMuaW5uZXIuZ2V0V2hvbGVMaXN0KHR5cGVSZWYsIGxpc3RJZClcblx0fVxuXG5cdHB1cmdlU3RvcmFnZSgpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRyZXR1cm4gdGhpcy5pbm5lci5wdXJnZVN0b3JhZ2UoKVxuXHR9XG5cblx0cHV0KG9yaWdpbmFsRW50aXR5OiBTb21lRW50aXR5KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0cmV0dXJuIHRoaXMuaW5uZXIucHV0KG9yaWdpbmFsRW50aXR5KVxuXHR9XG5cblx0cHV0TGFzdEJhdGNoSWRGb3JHcm91cChncm91cElkOiBJZCwgYmF0Y2hJZDogSWQpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRyZXR1cm4gdGhpcy5pbm5lci5wdXRMYXN0QmF0Y2hJZEZvckdyb3VwKGdyb3VwSWQsIGJhdGNoSWQpXG5cdH1cblxuXHRwdXRMYXN0VXBkYXRlVGltZSh2YWx1ZTogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0cmV0dXJuIHRoaXMuaW5uZXIucHV0TGFzdFVwZGF0ZVRpbWUodmFsdWUpXG5cdH1cblxuXHRzZXRMb3dlclJhbmdlRm9yTGlzdDxUIGV4dGVuZHMgTGlzdEVsZW1lbnRFbnRpdHk+KHR5cGVSZWY6IFR5cGVSZWY8VD4sIGxpc3RJZDogSWQsIGlkOiBJZCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHJldHVybiB0aGlzLmlubmVyLnNldExvd2VyUmFuZ2VGb3JMaXN0KHR5cGVSZWYsIGxpc3RJZCwgaWQpXG5cdH1cblxuXHRzZXROZXdSYW5nZUZvckxpc3Q8VCBleHRlbmRzIExpc3RFbGVtZW50RW50aXR5Pih0eXBlUmVmOiBUeXBlUmVmPFQ+LCBsaXN0SWQ6IElkLCBsb3dlcjogSWQsIHVwcGVyOiBJZCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHJldHVybiB0aGlzLmlubmVyLnNldE5ld1JhbmdlRm9yTGlzdCh0eXBlUmVmLCBsaXN0SWQsIGxvd2VyLCB1cHBlcilcblx0fVxuXG5cdHNldFVwcGVyUmFuZ2VGb3JMaXN0PFQgZXh0ZW5kcyBMaXN0RWxlbWVudEVudGl0eT4odHlwZVJlZjogVHlwZVJlZjxUPiwgbGlzdElkOiBJZCwgaWQ6IElkKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0cmV0dXJuIHRoaXMuaW5uZXIuc2V0VXBwZXJSYW5nZUZvckxpc3QodHlwZVJlZiwgbGlzdElkLCBpZClcblx0fVxuXG5cdGdldEN1c3RvbUNhY2hlSGFuZGxlck1hcChlbnRpdHlSZXN0Q2xpZW50OiBFbnRpdHlSZXN0Q2xpZW50KTogQ3VzdG9tQ2FjaGVIYW5kbGVyTWFwIHtcblx0XHRyZXR1cm4gdGhpcy5pbm5lci5nZXRDdXN0b21DYWNoZUhhbmRsZXJNYXAoZW50aXR5UmVzdENsaWVudClcblx0fVxuXG5cdGdldFVzZXJJZCgpOiBJZCB7XG5cdFx0cmV0dXJuIHRoaXMuaW5uZXIuZ2V0VXNlcklkKClcblx0fVxuXG5cdGFzeW5jIGRlbGV0ZUFsbE93bmVkQnkob3duZXI6IElkKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0cmV0dXJuIHRoaXMuaW5uZXIuZGVsZXRlQWxsT3duZWRCeShvd25lcilcblx0fVxuXG5cdGFzeW5jIGRlbGV0ZVdob2xlTGlzdDxUIGV4dGVuZHMgTGlzdEVsZW1lbnRFbnRpdHk+KHR5cGVSZWY6IFR5cGVSZWY8VD4sIGxpc3RJZDogSWQpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRyZXR1cm4gdGhpcy5pbm5lci5kZWxldGVXaG9sZUxpc3QodHlwZVJlZiwgbGlzdElkKVxuXHR9XG5cblx0Y2xlYXJFeGNsdWRlZERhdGEoKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0cmV0dXJuIHRoaXMuaW5uZXIuY2xlYXJFeGNsdWRlZERhdGEoKVxuXHR9XG5cblx0LyoqXG5cdCAqIFdlIHdhbnQgdG8gbG9jayB0aGUgYWNjZXNzIHRvIHRoZSBcInJhbmdlc1wiIGRiIHdoZW4gdXBkYXRpbmcgLyByZWFkaW5nIHRoZVxuXHQgKiBvZmZsaW5lIGF2YWlsYWJsZSBtYWlsIGxpc3QgcmFuZ2VzIGZvciBlYWNoIG1haWwgbGlzdCAocmVmZXJlbmNlZCB1c2luZyB0aGUgbGlzdElkKVxuXHQgKiBAcGFyYW0gbGlzdElkIHRoZSBtYWlsIGxpc3QgdGhhdCB3ZSB3YW50IHRvIGxvY2tcblx0ICovXG5cdGxvY2tSYW5nZXNEYkFjY2VzcyhsaXN0SWQ6IElkKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0cmV0dXJuIHRoaXMuaW5uZXIubG9ja1Jhbmdlc0RiQWNjZXNzKGxpc3RJZClcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGlzIGlzIHRoZSBjb3VudGVycGFydCB0byB0aGUgZnVuY3Rpb24gXCJsb2NrUmFuZ2VzRGJBY2Nlc3MobGlzdElkKVwiXG5cdCAqIEBwYXJhbSBsaXN0SWQgdGhlIG1haWwgbGlzdCB0aGF0IHdlIHdhbnQgdG8gdW5sb2NrXG5cdCAqL1xuXHR1bmxvY2tSYW5nZXNEYkFjY2VzcyhsaXN0SWQ6IElkKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0cmV0dXJuIHRoaXMuaW5uZXIudW5sb2NrUmFuZ2VzRGJBY2Nlc3MobGlzdElkKVxuXHR9XG59XG4iLCJpbXBvcnQgeyBIdHRwTWV0aG9kLCBNZWRpYVR5cGUsIHJlc29sdmVUeXBlUmVmZXJlbmNlIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9FbnRpdHlGdW5jdGlvbnNcIlxuaW1wb3J0IHtcblx0RGVsZXRlU2VydmljZSxcblx0RXh0cmFTZXJ2aWNlUGFyYW1zLFxuXHRHZXRTZXJ2aWNlLFxuXHRJU2VydmljZUV4ZWN1dG9yLFxuXHRNZXRob2REZWZpbml0aW9uLFxuXHRQYXJhbVR5cGVGcm9tUmVmLFxuXHRQb3N0U2VydmljZSxcblx0UHV0U2VydmljZSxcblx0UmV0dXJuVHlwZUZyb21SZWYsXG59IGZyb20gXCIuLi8uLi9jb21tb24vU2VydmljZVJlcXVlc3QuanNcIlxuaW1wb3J0IHsgRW50aXR5IH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9FbnRpdHlUeXBlc1wiXG5pbXBvcnQgeyBpc1NhbWVUeXBlUmVmLCBsYXp5LCBUeXBlUmVmIH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5pbXBvcnQgeyBSZXN0Q2xpZW50IH0gZnJvbSBcIi4vUmVzdENsaWVudFwiXG5pbXBvcnQgeyBJbnN0YW5jZU1hcHBlciB9IGZyb20gXCIuLi9jcnlwdG8vSW5zdGFuY2VNYXBwZXJcIlxuaW1wb3J0IHsgQ3J5cHRvRmFjYWRlIH0gZnJvbSBcIi4uL2NyeXB0by9DcnlwdG9GYWNhZGVcIlxuaW1wb3J0IHsgYXNzZXJ0V29ya2VyT3JOb2RlIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9FbnZcIlxuaW1wb3J0IHsgUHJvZ3JhbW1pbmdFcnJvciB9IGZyb20gXCIuLi8uLi9jb21tb24vZXJyb3IvUHJvZ3JhbW1pbmdFcnJvclwiXG5pbXBvcnQgeyBBdXRoRGF0YVByb3ZpZGVyIH0gZnJvbSBcIi4uL2ZhY2FkZXMvVXNlckZhY2FkZVwiXG5pbXBvcnQgeyBMb2dpbkluY29tcGxldGVFcnJvciB9IGZyb20gXCIuLi8uLi9jb21tb24vZXJyb3IvTG9naW5JbmNvbXBsZXRlRXJyb3IuanNcIlxuXG5hc3NlcnRXb3JrZXJPck5vZGUoKVxuXG50eXBlIEFueVNlcnZpY2UgPSBHZXRTZXJ2aWNlIHwgUG9zdFNlcnZpY2UgfCBQdXRTZXJ2aWNlIHwgRGVsZXRlU2VydmljZVxuXG5leHBvcnQgY2xhc3MgU2VydmljZUV4ZWN1dG9yIGltcGxlbWVudHMgSVNlcnZpY2VFeGVjdXRvciB7XG5cdGNvbnN0cnVjdG9yKFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgcmVzdENsaWVudDogUmVzdENsaWVudCxcblx0XHRwcml2YXRlIHJlYWRvbmx5IGF1dGhEYXRhUHJvdmlkZXI6IEF1dGhEYXRhUHJvdmlkZXIsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBpbnN0YW5jZU1hcHBlcjogSW5zdGFuY2VNYXBwZXIsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBjcnlwdG9GYWNhZGU6IGxhenk8Q3J5cHRvRmFjYWRlPixcblx0KSB7fVxuXG5cdGdldDxTIGV4dGVuZHMgR2V0U2VydmljZT4oXG5cdFx0c2VydmljZTogUyxcblx0XHRkYXRhOiBQYXJhbVR5cGVGcm9tUmVmPFNbXCJnZXRcIl1bXCJkYXRhXCJdPixcblx0XHRwYXJhbXM/OiBFeHRyYVNlcnZpY2VQYXJhbXMsXG5cdCk6IFByb21pc2U8UmV0dXJuVHlwZUZyb21SZWY8U1tcImdldFwiXVtcInJldHVyblwiXT4+IHtcblx0XHRyZXR1cm4gdGhpcy5leGVjdXRlU2VydmljZVJlcXVlc3Qoc2VydmljZSwgSHR0cE1ldGhvZC5HRVQsIGRhdGEsIHBhcmFtcylcblx0fVxuXG5cdHBvc3Q8UyBleHRlbmRzIFBvc3RTZXJ2aWNlPihcblx0XHRzZXJ2aWNlOiBTLFxuXHRcdGRhdGE6IFBhcmFtVHlwZUZyb21SZWY8U1tcInBvc3RcIl1bXCJkYXRhXCJdPixcblx0XHRwYXJhbXM/OiBFeHRyYVNlcnZpY2VQYXJhbXMsXG5cdCk6IFByb21pc2U8UmV0dXJuVHlwZUZyb21SZWY8U1tcInBvc3RcIl1bXCJyZXR1cm5cIl0+PiB7XG5cdFx0cmV0dXJuIHRoaXMuZXhlY3V0ZVNlcnZpY2VSZXF1ZXN0KHNlcnZpY2UsIEh0dHBNZXRob2QuUE9TVCwgZGF0YSwgcGFyYW1zKVxuXHR9XG5cblx0cHV0PFMgZXh0ZW5kcyBQdXRTZXJ2aWNlPihcblx0XHRzZXJ2aWNlOiBTLFxuXHRcdGRhdGE6IFBhcmFtVHlwZUZyb21SZWY8U1tcInB1dFwiXVtcImRhdGFcIl0+LFxuXHRcdHBhcmFtcz86IEV4dHJhU2VydmljZVBhcmFtcyxcblx0KTogUHJvbWlzZTxSZXR1cm5UeXBlRnJvbVJlZjxTW1wicHV0XCJdW1wicmV0dXJuXCJdPj4ge1xuXHRcdHJldHVybiB0aGlzLmV4ZWN1dGVTZXJ2aWNlUmVxdWVzdChzZXJ2aWNlLCBIdHRwTWV0aG9kLlBVVCwgZGF0YSwgcGFyYW1zKVxuXHR9XG5cblx0ZGVsZXRlPFMgZXh0ZW5kcyBEZWxldGVTZXJ2aWNlPihcblx0XHRzZXJ2aWNlOiBTLFxuXHRcdGRhdGE6IFBhcmFtVHlwZUZyb21SZWY8U1tcImRlbGV0ZVwiXVtcImRhdGFcIl0+LFxuXHRcdHBhcmFtcz86IEV4dHJhU2VydmljZVBhcmFtcyxcblx0KTogUHJvbWlzZTxSZXR1cm5UeXBlRnJvbVJlZjxTW1wiZGVsZXRlXCJdW1wicmV0dXJuXCJdPj4ge1xuXHRcdHJldHVybiB0aGlzLmV4ZWN1dGVTZXJ2aWNlUmVxdWVzdChzZXJ2aWNlLCBIdHRwTWV0aG9kLkRFTEVURSwgZGF0YSwgcGFyYW1zKVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBleGVjdXRlU2VydmljZVJlcXVlc3QoXG5cdFx0c2VydmljZTogQW55U2VydmljZSxcblx0XHRtZXRob2Q6IEh0dHBNZXRob2QsXG5cdFx0cmVxdWVzdEVudGl0eTogRW50aXR5IHwgbnVsbCxcblx0XHRwYXJhbXM6IEV4dHJhU2VydmljZVBhcmFtcyB8IHVuZGVmaW5lZCxcblx0KTogUHJvbWlzZTxhbnk+IHtcblx0XHRjb25zdCBtZXRob2REZWZpbml0aW9uID0gdGhpcy5nZXRNZXRob2REZWZpbml0aW9uKHNlcnZpY2UsIG1ldGhvZClcblx0XHRpZiAoXG5cdFx0XHRtZXRob2REZWZpbml0aW9uLnJldHVybiAmJlxuXHRcdFx0cGFyYW1zPy5zZXNzaW9uS2V5ID09IG51bGwgJiZcblx0XHRcdChhd2FpdCByZXNvbHZlVHlwZVJlZmVyZW5jZShtZXRob2REZWZpbml0aW9uLnJldHVybikpLmVuY3J5cHRlZCAmJlxuXHRcdFx0IXRoaXMuYXV0aERhdGFQcm92aWRlci5pc0Z1bGx5TG9nZ2VkSW4oKVxuXHRcdCkge1xuXHRcdFx0Ly8gU2hvcnQtY2lyY3VpdCBiZWZvcmUgd2UgZG8gYW4gYWN0dWFsIHJlcXVlc3Qgd2hpY2ggd2UgY2FuJ3QgZGVjcnlwdFxuXHRcdFx0Ly8gSWYgd2UgaGF2ZSBhIHNlc3Npb24ga2V5IHBhc3NlZCBpdCBkb2Vzbid0IG1lYW4gdGhhdCBpdCBpcyBmb3IgdGhlIHJldHVybiB0eXBlIGJ1dCBpdCBpcyBsaWtlbHlcblx0XHRcdC8vIHNvIHdlIGFsbG93IHRoZSByZXF1ZXN0LlxuXHRcdFx0dGhyb3cgbmV3IExvZ2luSW5jb21wbGV0ZUVycm9yKGBUcmllZCB0byBtYWtlIHNlcnZpY2UgcmVxdWVzdCB3aXRoIGVuY3J5cHRlZCByZXR1cm4gdHlwZSBidXQgaXMgbm90IGZ1bGx5IGxvZ2dlZCBpbiB5ZXQsIHNlcnZpY2U6ICR7c2VydmljZS5uYW1lfWApXG5cdFx0fVxuXG5cdFx0Y29uc3QgbW9kZWxWZXJzaW9uID0gYXdhaXQgdGhpcy5nZXRNb2RlbFZlcnNpb24obWV0aG9kRGVmaW5pdGlvbilcblxuXHRcdGNvbnN0IHBhdGggPSBgL3Jlc3QvJHtzZXJ2aWNlLmFwcC50b0xvd2VyQ2FzZSgpfS8ke3NlcnZpY2UubmFtZS50b0xvd2VyQ2FzZSgpfWBcblx0XHRjb25zdCBoZWFkZXJzID0geyAuLi50aGlzLmF1dGhEYXRhUHJvdmlkZXIuY3JlYXRlQXV0aEhlYWRlcnMoKSwgLi4ucGFyYW1zPy5leHRyYUhlYWRlcnMsIHY6IG1vZGVsVmVyc2lvbiB9XG5cblx0XHRjb25zdCBlbmNyeXB0ZWRFbnRpdHkgPSBhd2FpdCB0aGlzLmVuY3J5cHREYXRhSWZOZWVkZWQobWV0aG9kRGVmaW5pdGlvbiwgcmVxdWVzdEVudGl0eSwgc2VydmljZSwgbWV0aG9kLCBwYXJhbXMgPz8gbnVsbClcblxuXHRcdGNvbnN0IGRhdGE6IHN0cmluZyB8IHVuZGVmaW5lZCA9IGF3YWl0IHRoaXMucmVzdENsaWVudC5yZXF1ZXN0KHBhdGgsIG1ldGhvZCwge1xuXHRcdFx0cXVlcnlQYXJhbXM6IHBhcmFtcz8ucXVlcnlQYXJhbXMsXG5cdFx0XHRoZWFkZXJzLFxuXHRcdFx0cmVzcG9uc2VUeXBlOiBNZWRpYVR5cGUuSnNvbixcblx0XHRcdGJvZHk6IGVuY3J5cHRlZEVudGl0eSA/PyB1bmRlZmluZWQsXG5cdFx0XHRzdXNwZW5zaW9uQmVoYXZpb3I6IHBhcmFtcz8uc3VzcGVuc2lvbkJlaGF2aW9yLFxuXHRcdFx0YmFzZVVybDogcGFyYW1zPy5iYXNlVXJsLFxuXHRcdH0pXG5cblx0XHRpZiAobWV0aG9kRGVmaW5pdGlvbi5yZXR1cm4pIHtcblx0XHRcdHJldHVybiBhd2FpdCB0aGlzLmRlY3J5cHRSZXNwb25zZShtZXRob2REZWZpbml0aW9uLnJldHVybiwgZGF0YSBhcyBzdHJpbmcsIHBhcmFtcylcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIGdldE1ldGhvZERlZmluaXRpb24oc2VydmljZTogQW55U2VydmljZSwgbWV0aG9kOiBIdHRwTWV0aG9kKTogTWV0aG9kRGVmaW5pdGlvbiB7XG5cdFx0c3dpdGNoIChtZXRob2QpIHtcblx0XHRcdGNhc2UgSHR0cE1ldGhvZC5HRVQ6XG5cdFx0XHRcdHJldHVybiAoc2VydmljZSBhcyBHZXRTZXJ2aWNlKVtcImdldFwiXVxuXHRcdFx0Y2FzZSBIdHRwTWV0aG9kLlBPU1Q6XG5cdFx0XHRcdHJldHVybiAoc2VydmljZSBhcyBQb3N0U2VydmljZSlbXCJwb3N0XCJdXG5cdFx0XHRjYXNlIEh0dHBNZXRob2QuUFVUOlxuXHRcdFx0XHRyZXR1cm4gKHNlcnZpY2UgYXMgUHV0U2VydmljZSlbXCJwdXRcIl1cblx0XHRcdGNhc2UgSHR0cE1ldGhvZC5ERUxFVEU6XG5cdFx0XHRcdHJldHVybiAoc2VydmljZSBhcyBEZWxldGVTZXJ2aWNlKVtcImRlbGV0ZVwiXVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgZ2V0TW9kZWxWZXJzaW9uKG1ldGhvZERlZmluaXRpb246IE1ldGhvZERlZmluaXRpb24pOiBQcm9taXNlPHN0cmluZz4ge1xuXHRcdC8vIFRoaXMgaXMgc29tZSBraW5kIG9mIGEgaGFjayBiZWNhdXNlIHdlIGRvbid0IGdlbmVyYXRlIGRhdGEgZm9yIHRoZSB3aG9sZSBtb2RlbCBhbnl3aGVyZSAodW5mb3J0dW5hdGVseSkuXG5cdFx0Y29uc3Qgc29tZVR5cGVSZWYgPSBtZXRob2REZWZpbml0aW9uLmRhdGEgPz8gbWV0aG9kRGVmaW5pdGlvbi5yZXR1cm5cblx0XHRpZiAoc29tZVR5cGVSZWYgPT0gbnVsbCkge1xuXHRcdFx0dGhyb3cgbmV3IFByb2dyYW1taW5nRXJyb3IoXCJOZWVkIGVpdGhlciBkYXRhIG9yIHJldHVybiBmb3IgdGhlIHNlcnZpY2UgbWV0aG9kIVwiKVxuXHRcdH1cblx0XHRjb25zdCBtb2RlbCA9IGF3YWl0IHJlc29sdmVUeXBlUmVmZXJlbmNlKHNvbWVUeXBlUmVmKVxuXHRcdHJldHVybiBtb2RlbC52ZXJzaW9uXG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIGVuY3J5cHREYXRhSWZOZWVkZWQoXG5cdFx0bWV0aG9kRGVmaW5pdGlvbjogTWV0aG9kRGVmaW5pdGlvbixcblx0XHRyZXF1ZXN0RW50aXR5OiBFbnRpdHkgfCBudWxsLFxuXHRcdHNlcnZpY2U6IEFueVNlcnZpY2UsXG5cdFx0bWV0aG9kOiBIdHRwTWV0aG9kLFxuXHRcdHBhcmFtczogRXh0cmFTZXJ2aWNlUGFyYW1zIHwgbnVsbCxcblx0KTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XG5cdFx0aWYgKG1ldGhvZERlZmluaXRpb24uZGF0YSAhPSBudWxsKSB7XG5cdFx0XHRpZiAocmVxdWVzdEVudGl0eSA9PSBudWxsIHx8ICFpc1NhbWVUeXBlUmVmKG1ldGhvZERlZmluaXRpb24uZGF0YSwgcmVxdWVzdEVudGl0eS5fdHlwZSkpIHtcblx0XHRcdFx0dGhyb3cgbmV3IFByb2dyYW1taW5nRXJyb3IoYEludmFsaWQgc2VydmljZSBkYXRhISAke3NlcnZpY2UubmFtZX0gJHttZXRob2R9YClcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgcmVxdWVzdFR5cGVNb2RlbCA9IGF3YWl0IHJlc29sdmVUeXBlUmVmZXJlbmNlKG1ldGhvZERlZmluaXRpb24uZGF0YSlcblx0XHRcdGlmIChyZXF1ZXN0VHlwZU1vZGVsLmVuY3J5cHRlZCAmJiBwYXJhbXM/LnNlc3Npb25LZXkgPT0gbnVsbCkge1xuXHRcdFx0XHR0aHJvdyBuZXcgUHJvZ3JhbW1pbmdFcnJvcihcIk11c3QgcHJvdmlkZSBhIHNlc3Npb24ga2V5IGZvciBhbiBlbmNyeXB0ZWQgZGF0YSB0cmFuc2ZlciB0eXBlITogXCIgKyBzZXJ2aWNlKVxuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBlbmNyeXB0ZWRFbnRpdHkgPSBhd2FpdCB0aGlzLmluc3RhbmNlTWFwcGVyLmVuY3J5cHRBbmRNYXBUb0xpdGVyYWwocmVxdWVzdFR5cGVNb2RlbCwgcmVxdWVzdEVudGl0eSwgcGFyYW1zPy5zZXNzaW9uS2V5ID8/IG51bGwpXG5cdFx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkoZW5jcnlwdGVkRW50aXR5KVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgZGVjcnlwdFJlc3BvbnNlPFQgZXh0ZW5kcyBFbnRpdHk+KHR5cGVSZWY6IFR5cGVSZWY8VD4sIGRhdGE6IHN0cmluZywgcGFyYW1zOiBFeHRyYVNlcnZpY2VQYXJhbXMgfCB1bmRlZmluZWQpOiBQcm9taXNlPFQ+IHtcblx0XHRjb25zdCByZXNwb25zZVR5cGVNb2RlbCA9IGF3YWl0IHJlc29sdmVUeXBlUmVmZXJlbmNlKHR5cGVSZWYpXG5cdFx0Ly8gRmlsdGVyIG91dCBfX3Byb3RvX18gdG8gYXZvaWQgcHJvdG90eXBlIHBvbGx1dGlvbi5cblx0XHRjb25zdCBpbnN0YW5jZSA9IEpTT04ucGFyc2UoZGF0YSwgKGssIHYpID0+IChrID09PSBcIl9fcHJvdG9fX1wiID8gdW5kZWZpbmVkIDogdikpXG5cdFx0Y29uc3QgcmVzb2x2ZWRTZXNzaW9uS2V5ID0gYXdhaXQgdGhpcy5jcnlwdG9GYWNhZGUoKS5yZXNvbHZlU2VydmljZVNlc3Npb25LZXkoaW5zdGFuY2UpXG5cdFx0cmV0dXJuIHRoaXMuaW5zdGFuY2VNYXBwZXIuZGVjcnlwdEFuZE1hcFRvSW5zdGFuY2UocmVzcG9uc2VUeXBlTW9kZWwsIGluc3RhbmNlLCByZXNvbHZlZFNlc3Npb25LZXkgPz8gcGFyYW1zPy5zZXNzaW9uS2V5ID8/IG51bGwpXG5cdH1cbn1cbiIsImltcG9ydCB7IEdyb3VwVHlwZSB9IGZyb20gXCIuLi8uLi9jb21tb24vVHV0YW5vdGFDb25zdGFudHNcIlxuaW1wb3J0IHsgQWVzMjU2S2V5LCBBZXNLZXksIGRlY3J5cHRLZXkgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLWNyeXB0b1wiXG5pbXBvcnQgeyBhc3NlcnROb3ROdWxsLCBLZXlWZXJzaW9uIH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5pbXBvcnQgeyBQcm9ncmFtbWluZ0Vycm9yIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9lcnJvci9Qcm9ncmFtbWluZ0Vycm9yXCJcbmltcG9ydCB7IGNyZWF0ZVdlYnNvY2tldExlYWRlclN0YXR1cywgR3JvdXBNZW1iZXJzaGlwLCBVc2VyLCBVc2VyR3JvdXBLZXlEaXN0cmlidXRpb24sIFdlYnNvY2tldExlYWRlclN0YXR1cyB9IGZyb20gXCIuLi8uLi9lbnRpdGllcy9zeXMvVHlwZVJlZnNcIlxuaW1wb3J0IHsgTG9naW5JbmNvbXBsZXRlRXJyb3IgfSBmcm9tIFwiLi4vLi4vY29tbW9uL2Vycm9yL0xvZ2luSW5jb21wbGV0ZUVycm9yXCJcbmltcG9ydCB7IGlzU2FtZUlkIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi91dGlscy9FbnRpdHlVdGlscy5qc1wiXG5pbXBvcnQgeyBLZXlDYWNoZSB9IGZyb20gXCIuL0tleUNhY2hlLmpzXCJcbmltcG9ydCB7IENyeXB0b1dyYXBwZXIsIFZlcnNpb25lZEtleSB9IGZyb20gXCIuLi9jcnlwdG8vQ3J5cHRvV3JhcHBlci5qc1wiXG5pbXBvcnQgeyBDcnlwdG9FcnJvciB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtY3J5cHRvL2Vycm9yLmpzXCJcbmltcG9ydCB7IGNoZWNrS2V5VmVyc2lvbkNvbnN0cmFpbnRzLCBwYXJzZUtleVZlcnNpb24gfSBmcm9tIFwiLi9LZXlMb2FkZXJGYWNhZGUuanNcIlxuXG5leHBvcnQgaW50ZXJmYWNlIEF1dGhEYXRhUHJvdmlkZXIge1xuXHQvKipcblx0ICogQHJldHVybiBUaGUgbWFwIHdoaWNoIGNvbnRhaW5zIGF1dGhlbnRpY2F0aW9uIGRhdGEgZm9yIHRoZSBsb2dnZWQtaW4gdXNlci5cblx0ICovXG5cdGNyZWF0ZUF1dGhIZWFkZXJzKCk6IERpY3RcblxuXHRpc0Z1bGx5TG9nZ2VkSW4oKTogYm9vbGVhblxufVxuXG4vKiogSG9sZGVyIGZvciB0aGUgdXNlciBhbmQgc2Vzc2lvbi1yZWxhdGVkIGRhdGEgb24gdGhlIHdvcmtlciBzaWRlLiAqL1xuZXhwb3J0IGNsYXNzIFVzZXJGYWNhZGUgaW1wbGVtZW50cyBBdXRoRGF0YVByb3ZpZGVyIHtcblx0cHJpdmF0ZSB1c2VyOiBVc2VyIHwgbnVsbCA9IG51bGxcblx0cHJpdmF0ZSBhY2Nlc3NUb2tlbjogc3RyaW5nIHwgbnVsbCA9IG51bGxcblx0cHJpdmF0ZSBsZWFkZXJTdGF0dXMhOiBXZWJzb2NrZXRMZWFkZXJTdGF0dXNcblxuXHRjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IGtleUNhY2hlOiBLZXlDYWNoZSwgcHJpdmF0ZSByZWFkb25seSBjcnlwdG9XcmFwcGVyOiBDcnlwdG9XcmFwcGVyKSB7XG5cdFx0dGhpcy5yZXNldCgpXG5cdH1cblxuXHQvLyBMb2dpbiBwcm9jZXNzIGlzIHNvbWVob3cgbXVsdGktc3RlcCwgYW5kIHdlIGRvbid0IHVzZSBhIHNlcGFyYXRlIG5ldHdvcmsgc3RhY2sgZm9yIGl0LiBTbyB3ZSBoYXZlIHRvIGJyZWFrIHVwIHNldHRlcnMuXG5cdC8vIDEuIFdlIG5lZWQgdG8gZG93bmxvYWQgdXNlci4gRm9yIHRoYXQgd2UgbmVlZCB0byBzZXQgYWNjZXNzIHRva2VuIGFscmVhZHkgKHRvIGF1dGhlbnRpY2F0ZSB0aGUgcmVxdWVzdCBmb3IgdGhlIHNlcnZlciBhcyBpdCBpcyBwYXNzZWQgaW4gaGVhZGVycykuXG5cdC8vIDIuIFdlIG5lZWQgdG8gZ2V0IGdyb3VwIGtleXMuIEZvciB0aGF0IHdlIG5lZWQgdG8gdW5sb2NrIHVzZXJHcm91cEtleSB3aXRoIHVzZXJQYXNzcGhyYXNlS2V5XG5cdC8vIHNvIHRoaXMgbGVhZHMgdG8gdGhpcyBzdGVwcyBpbiBVc2VyRmFjYWRlOlxuXHQvLyAxLiBBY2Nlc3MgdG9rZW4gaXMgc2V0XG5cdC8vIDIuIFVzZXIgaXMgc2V0XG5cdC8vIDMuIFVzZXJHcm91cEtleSBpcyB1bmxvY2tlZFxuXHRzZXRBY2Nlc3NUb2tlbihhY2Nlc3NUb2tlbjogc3RyaW5nIHwgbnVsbCkge1xuXHRcdHRoaXMuYWNjZXNzVG9rZW4gPSBhY2Nlc3NUb2tlblxuXHR9XG5cblx0Z2V0QWNjZXNzVG9rZW4oKTogc3RyaW5nIHwgbnVsbCB7XG5cdFx0cmV0dXJuIHRoaXMuYWNjZXNzVG9rZW5cblx0fVxuXG5cdHNldFVzZXIodXNlcjogVXNlcikge1xuXHRcdGlmICh0aGlzLmFjY2Vzc1Rva2VuID09IG51bGwpIHtcblx0XHRcdHRocm93IG5ldyBQcm9ncmFtbWluZ0Vycm9yKFwiaW52YWxpZCBzdGF0ZTogbm8gYWNjZXNzIHRva2VuXCIpXG5cdFx0fVxuXHRcdHRoaXMudXNlciA9IHVzZXJcblx0fVxuXG5cdHVubG9ja1VzZXJHcm91cEtleSh1c2VyUGFzc3BocmFzZUtleTogQWVzS2V5KSB7XG5cdFx0aWYgKHRoaXMudXNlciA9PSBudWxsKSB7XG5cdFx0XHR0aHJvdyBuZXcgUHJvZ3JhbW1pbmdFcnJvcihcIkludmFsaWQgc3RhdGU6IG5vIHVzZXJcIilcblx0XHR9XG5cdFx0Y29uc3QgdXNlckdyb3VwTWVtYmVyc2hpcCA9IHRoaXMudXNlci51c2VyR3JvdXBcblx0XHRjb25zdCBjdXJyZW50VXNlckdyb3VwS2V5ID0ge1xuXHRcdFx0dmVyc2lvbjogcGFyc2VLZXlWZXJzaW9uKHVzZXJHcm91cE1lbWJlcnNoaXAuZ3JvdXBLZXlWZXJzaW9uKSxcblx0XHRcdG9iamVjdDogZGVjcnlwdEtleSh1c2VyUGFzc3BocmFzZUtleSwgdXNlckdyb3VwTWVtYmVyc2hpcC5zeW1FbmNHS2V5KSxcblx0XHR9XG5cdFx0dGhpcy5rZXlDYWNoZS5zZXRDdXJyZW50VXNlckdyb3VwS2V5KGN1cnJlbnRVc2VyR3JvdXBLZXkpXG5cdFx0dGhpcy5zZXRVc2VyRGlzdEtleShjdXJyZW50VXNlckdyb3VwS2V5LnZlcnNpb24sIHVzZXJQYXNzcGhyYXNlS2V5KVxuXHR9XG5cblx0c2V0VXNlckRpc3RLZXkoY3VycmVudFVzZXJHcm91cEtleVZlcnNpb246IEtleVZlcnNpb24sIHVzZXJQYXNzcGhyYXNlS2V5OiBBZXNLZXkpIHtcblx0XHRpZiAodGhpcy51c2VyID09IG51bGwpIHtcblx0XHRcdHRocm93IG5ldyBQcm9ncmFtbWluZ0Vycm9yKFwiSW52YWxpZCBzdGF0ZTogbm8gdXNlclwiKVxuXHRcdH1cblx0XHQvLyBXaHkgdGhpcyBtYWdpYyArIDE/IEJlY2F1c2Ugd2UgZG9uJ3QgaGF2ZSBhY2Nlc3MgdG8gdGhlIG5ldyB2ZXJzaW9uIG51bWJlciB3aGVuIGNhbGxpbmcgdGhpcyBmdW5jdGlvbiBzbyB3ZSBjb21wdXRlIGl0IGZyb20gdGhlIGN1cnJlbnQgb25lXG5cdFx0Y29uc3QgbmV3VXNlckdyb3VwS2V5VmVyc2lvbiA9IGNoZWNrS2V5VmVyc2lvbkNvbnN0cmFpbnRzKGN1cnJlbnRVc2VyR3JvdXBLZXlWZXJzaW9uICsgMSlcblx0XHRjb25zdCB1c2VyR3JvdXBNZW1iZXJzaGlwID0gdGhpcy51c2VyLnVzZXJHcm91cFxuXHRcdGNvbnN0IGxlZ2FjeVVzZXJEaXN0S2V5ID0gdGhpcy5kZXJpdmVMZWdhY3lVc2VyRGlzdEtleSh1c2VyR3JvdXBNZW1iZXJzaGlwLmdyb3VwLCB1c2VyUGFzc3BocmFzZUtleSlcblx0XHRjb25zdCB1c2VyRGlzdEtleSA9IHRoaXMuZGVyaXZlVXNlckRpc3RLZXkodXNlckdyb3VwTWVtYmVyc2hpcC5ncm91cCwgbmV3VXNlckdyb3VwS2V5VmVyc2lvbiwgdXNlclBhc3NwaHJhc2VLZXkpXG5cdFx0dGhpcy5rZXlDYWNoZS5zZXRMZWdhY3lVc2VyRGlzdEtleShsZWdhY3lVc2VyRGlzdEtleSlcblx0XHR0aGlzLmtleUNhY2hlLnNldFVzZXJEaXN0S2V5KHVzZXJEaXN0S2V5KVxuXHR9XG5cblx0LyoqXG5cdCAqIERlcml2ZXMgYSBkaXN0cmlidXRpb24ga2V5IGZyb20gdGhlIHBhc3N3b3JkIGtleSB0byBzaGFyZSB0aGUgbmV3IHVzZXIgZ3JvdXAga2V5IG9mIHRoZSB1c2VyIHRvIHRoZWlyIG90aGVyIGNsaWVudHMgKGFwcHMsIHdlYiBldGMpXG5cdCAqIFRoaXMgaXMgYSBmYWxsYmFjayBmdW5jdGlvbiB0aGF0IGdldHMgY2FsbGVkIHdoZW4gdGhlIG91dHB1dCBrZXkgb2YgYGRlcml2ZVVzZXJEaXN0S2V5YCBmYWlscyB0byBkZWNyeXB0IHRoZSBuZXcgdXNlciBncm91cCBrZXlcblx0ICogQGRlcHJlY2F0ZWRcblx0ICogQHBhcmFtIHVzZXJHcm91cElkIHVzZXIgZ3JvdXAgaWQgb2YgdGhlIGxvZ2dlZCBpbiB1c2VyXG5cdCAqIEBwYXJhbSB1c2VyUGFzc3dvcmRLZXkgY3VycmVudCBwYXNzd29yZCBrZXkgb2YgdGhlIHVzZXJcblx0ICovXG5cdGRlcml2ZUxlZ2FjeVVzZXJEaXN0S2V5KHVzZXJHcm91cElkOiBJZCwgdXNlclBhc3N3b3JkS2V5OiBBZXNLZXkpOiBBZXNLZXkge1xuXHRcdC8vIHdlIHByZXBhcmUgYSBrZXkgdG8gZW5jcnlwdCBwb3RlbnRpYWwgdXNlciBncm91cCBrZXkgcm90YXRpb25zIHdpdGhcblx0XHQvLyB3aGVuIHBhc3N3b3JkcyBhcmUgY2hhbmdlZCBjbGllbnRzIGFyZSBsb2dnZWQtb3V0IG9mIG90aGVyIHNlc3Npb25zXG5cdFx0Ly8gdGhpcyBrZXkgaXMgb25seSBuZWVkZWQgYnkgdGhlIGxvZ2dlZC1pbiBjbGllbnRzLCBzbyBpdCBzaG91bGQgYmUgcmVsaWFibGUgZW5vdWdoIHRvIGFzc3VtZSB0aGF0IHVzZXJQYXNzcGhyYXNlS2V5IGlzIGluIHN5bmNcblxuXHRcdC8vIHdlIGJpbmQgdGhpcyB0byB1c2VyR3JvdXBJZCBhbmQgdGhlIGRvbWFpbiBzZXBhcmF0b3IgdXNlckdyb3VwS2V5RGlzdHJpYnV0aW9uS2V5IGZyb20gY3J5cHRvIHBhY2thZ2Vcblx0XHQvLyB0aGUgaGtkZiBzYWx0IGRvZXMgbm90IGhhdmUgdG8gYmUgc2VjcmV0IGJ1dCBzaG91bGQgYmUgdW5pcXVlIHBlciB1c2VyIGFuZCBjYXJyeSBzb21lIGFkZGl0aW9uYWwgZW50cm9weSB3aGljaCBzaGEyNTYgZW5zdXJlc1xuXG5cdFx0cmV0dXJuIHRoaXMuY3J5cHRvV3JhcHBlci5kZXJpdmVLZXlXaXRoSGtkZih7XG5cdFx0XHRzYWx0OiB1c2VyR3JvdXBJZCxcblx0XHRcdGtleTogdXNlclBhc3N3b3JkS2V5LFxuXHRcdFx0Y29udGV4dDogXCJ1c2VyR3JvdXBLZXlEaXN0cmlidXRpb25LZXlcIixcblx0XHR9KVxuXHR9XG5cblx0LyoqXG5cdCAqIERlcml2ZXMgYSBkaXN0cmlidXRpb24gdG8gc2hhcmUgdGhlIG5ldyB1c2VyIGdyb3VwIGtleSBvZiB0aGUgdXNlciB0byB0aGVpciBvdGhlciBjbGllbnRzIChhcHBzLCB3ZWIgZXRjKVxuXHQgKiBAcGFyYW0gdXNlckdyb3VwSWQgdXNlciBncm91cCBpZCBvZiB0aGUgbG9nZ2VkIGluIHVzZXJcblx0ICogQHBhcmFtIG5ld1VzZXJHcm91cEtleVZlcnNpb24gdGhlIG5ldyB1c2VyIGdyb3VwIGtleSB2ZXJzaW9uXG5cdCAqIEBwYXJhbSB1c2VyUGFzc3dvcmRLZXkgY3VycmVudCBwYXNzd29yZCBrZXkgb2YgdGhlIHVzZXJcblx0ICovXG5cdGRlcml2ZVVzZXJEaXN0S2V5KHVzZXJHcm91cElkOiBJZCwgbmV3VXNlckdyb3VwS2V5VmVyc2lvbjogS2V5VmVyc2lvbiwgdXNlclBhc3N3b3JkS2V5OiBBZXNLZXkpOiBBZXMyNTZLZXkge1xuXHRcdHJldHVybiB0aGlzLmNyeXB0b1dyYXBwZXIuZGVyaXZlS2V5V2l0aEhrZGYoe1xuXHRcdFx0c2FsdDogYHVzZXJHcm91cDogJHt1c2VyR3JvdXBJZH0sIG5ld1VzZXJHcm91cEtleVZlcnNpb246ICR7bmV3VXNlckdyb3VwS2V5VmVyc2lvbn1gLFxuXHRcdFx0a2V5OiB1c2VyUGFzc3dvcmRLZXksXG5cdFx0XHQvLyBGb3JtZXJseSx0aGlzIHdhcyBub3QgYm91bmQgdG8gdGhlIHVzZXIgZ3JvdXAga2V5IHZlcnNpb24uXG5cdFx0XHRjb250ZXh0OiBcInZlcnNpb25lZFVzZXJHcm91cEtleURpc3RyaWJ1dGlvbktleVwiLFxuXHRcdH0pXG5cdH1cblxuXHRhc3luYyB1cGRhdGVVc2VyKHVzZXI6IFVzZXIpIHtcblx0XHRpZiAodGhpcy51c2VyID09IG51bGwpIHtcblx0XHRcdHRocm93IG5ldyBQcm9ncmFtbWluZ0Vycm9yKFwiVXBkYXRlIHVzZXIgaXMgY2FsbGVkIHdpdGhvdXQgbG9nZ2luZyBpbi4gVGhpcyBmdW5jdGlvbiBpcyBub3QgZm9yIHlvdS5cIilcblx0XHR9XG5cdFx0dGhpcy51c2VyID0gdXNlclxuXHRcdGF3YWl0IHRoaXMua2V5Q2FjaGUucmVtb3ZlT3V0ZGF0ZWRHcm91cEtleXModXNlcilcblx0fVxuXG5cdGdldFVzZXIoKTogVXNlciB8IG51bGwge1xuXHRcdHJldHVybiB0aGlzLnVzZXJcblx0fVxuXG5cdC8qKlxuXHQgKiBAcmV0dXJuIFRoZSBtYXAgd2hpY2ggY29udGFpbnMgYXV0aGVudGljYXRpb24gZGF0YSBmb3IgdGhlIGxvZ2dlZC1pbiB1c2VyLlxuXHQgKi9cblx0Y3JlYXRlQXV0aEhlYWRlcnMoKTogRGljdCB7XG5cdFx0cmV0dXJuIHRoaXMuYWNjZXNzVG9rZW5cblx0XHRcdD8ge1xuXHRcdFx0XHRcdGFjY2Vzc1Rva2VuOiB0aGlzLmFjY2Vzc1Rva2VuLFxuXHRcdFx0ICB9XG5cdFx0XHQ6IHt9XG5cdH1cblxuXHRnZXRVc2VyR3JvdXBJZCgpOiBJZCB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0TG9nZ2VkSW5Vc2VyKCkudXNlckdyb3VwLmdyb3VwXG5cdH1cblxuXHRnZXRBbGxHcm91cElkcygpOiBJZFtdIHtcblx0XHRsZXQgZ3JvdXBzID0gdGhpcy5nZXRMb2dnZWRJblVzZXIoKS5tZW1iZXJzaGlwcy5tYXAoKG1lbWJlcnNoaXApID0+IG1lbWJlcnNoaXAuZ3JvdXApXG5cdFx0Z3JvdXBzLnB1c2godGhpcy5nZXRMb2dnZWRJblVzZXIoKS51c2VyR3JvdXAuZ3JvdXApXG5cdFx0cmV0dXJuIGdyb3Vwc1xuXHR9XG5cblx0Z2V0Q3VycmVudFVzZXJHcm91cEtleSgpOiBWZXJzaW9uZWRLZXkge1xuXHRcdC8vIHRoZSB1c2VyR3JvdXBLZXkgaXMgYWx3YXlzIHdyaXR0ZW4gYWZ0ZXIgdGhlIGxvZ2luIHRvIHRoaXMuY3VycmVudFVzZXJHcm91cEtleVxuXHRcdC8vaWYgdGhlIHVzZXIgaGFzIG9ubHkgbG9nZ2VkIGluIG9mZmxpbmUgdGhpcyBoYXMgbm90IGhhcHBlbmVkXG5cdFx0Y29uc3QgY3VycmVudFVzZXJHcm91cEtleSA9IHRoaXMua2V5Q2FjaGUuZ2V0Q3VycmVudFVzZXJHcm91cEtleSgpXG5cdFx0aWYgKGN1cnJlbnRVc2VyR3JvdXBLZXkgPT0gbnVsbCkge1xuXHRcdFx0aWYgKHRoaXMuaXNQYXJ0aWFsbHlMb2dnZWRJbigpKSB7XG5cdFx0XHRcdHRocm93IG5ldyBMb2dpbkluY29tcGxldGVFcnJvcihcInVzZXJHcm91cEtleSBub3QgYXZhaWxhYmxlXCIpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBuZXcgUHJvZ3JhbW1pbmdFcnJvcihcIkludmFsaWQgc3RhdGU6IHVzZXJHcm91cEtleSBpcyBub3QgYXZhaWxhYmxlXCIpXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBjdXJyZW50VXNlckdyb3VwS2V5XG5cdH1cblxuXHRnZXRNZW1iZXJzaGlwKGdyb3VwSWQ6IElkKTogR3JvdXBNZW1iZXJzaGlwIHtcblx0XHRsZXQgbWVtYmVyc2hpcCA9IHRoaXMuZ2V0TG9nZ2VkSW5Vc2VyKCkubWVtYmVyc2hpcHMuZmluZCgoZzogR3JvdXBNZW1iZXJzaGlwKSA9PiBpc1NhbWVJZChnLmdyb3VwLCBncm91cElkKSlcblxuXHRcdGlmICghbWVtYmVyc2hpcCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBObyBncm91cCB3aXRoIGdyb3VwSWQgJHtncm91cElkfSBmb3VuZCFgKVxuXHRcdH1cblxuXHRcdHJldHVybiBtZW1iZXJzaGlwXG5cdH1cblxuXHRoYXNHcm91cChncm91cElkOiBJZCk6IGJvb2xlYW4ge1xuXHRcdGlmICghdGhpcy51c2VyKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGdyb3VwSWQgPT09IHRoaXMudXNlci51c2VyR3JvdXAuZ3JvdXAgfHwgdGhpcy51c2VyLm1lbWJlcnNoaXBzLnNvbWUoKG0pID0+IG0uZ3JvdXAgPT09IGdyb3VwSWQpXG5cdFx0fVxuXHR9XG5cblx0Z2V0R3JvdXBJZChncm91cFR5cGU6IEdyb3VwVHlwZSk6IElkIHtcblx0XHRpZiAoZ3JvdXBUeXBlID09PSBHcm91cFR5cGUuVXNlcikge1xuXHRcdFx0cmV0dXJuIHRoaXMuZ2V0VXNlckdyb3VwSWQoKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRsZXQgbWVtYmVyc2hpcCA9IHRoaXMuZ2V0TG9nZ2VkSW5Vc2VyKCkubWVtYmVyc2hpcHMuZmluZCgobSkgPT4gbS5ncm91cFR5cGUgPT09IGdyb3VwVHlwZSlcblxuXHRcdFx0aWYgKCFtZW1iZXJzaGlwKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcImNvdWxkIG5vdCBmaW5kIGdyb3VwVHlwZSBcIiArIGdyb3VwVHlwZSArIFwiIGZvciB1c2VyIFwiICsgdGhpcy5nZXRMb2dnZWRJblVzZXIoKS5faWQpXG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBtZW1iZXJzaGlwLmdyb3VwXG5cdFx0fVxuXHR9XG5cblx0Z2V0R3JvdXBJZHMoZ3JvdXBUeXBlOiBHcm91cFR5cGUpOiBJZFtdIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRMb2dnZWRJblVzZXIoKVxuXHRcdFx0Lm1lbWJlcnNoaXBzLmZpbHRlcigobSkgPT4gbS5ncm91cFR5cGUgPT09IGdyb3VwVHlwZSlcblx0XHRcdC5tYXAoKGdtKSA9PiBnbS5ncm91cClcblx0fVxuXG5cdGlzUGFydGlhbGx5TG9nZ2VkSW4oKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMudXNlciAhPSBudWxsXG5cdH1cblxuXHRpc0Z1bGx5TG9nZ2VkSW4oKTogYm9vbGVhbiB7XG5cdFx0Ly8gV2UgaGF2ZSB1c2VyR3JvdXBLZXksIGFuZCB3ZSBjYW4gZGVjcnlwdCBhbnkgb3RoZXIga2V5IC0gd2UgYXJlIGdvb2QgdG8gZ29cblx0XHRyZXR1cm4gdGhpcy5rZXlDYWNoZS5nZXRDdXJyZW50VXNlckdyb3VwS2V5KCkgIT0gbnVsbFxuXHR9XG5cblx0Z2V0TG9nZ2VkSW5Vc2VyKCk6IFVzZXIge1xuXHRcdHJldHVybiBhc3NlcnROb3ROdWxsKHRoaXMudXNlcilcblx0fVxuXG5cdHNldExlYWRlclN0YXR1cyhzdGF0dXM6IFdlYnNvY2tldExlYWRlclN0YXR1cykge1xuXHRcdHRoaXMubGVhZGVyU3RhdHVzID0gc3RhdHVzXG5cdFx0Y29uc29sZS5sb2coXCJOZXcgbGVhZGVyIHN0YXR1cyBzZXQ6XCIsIHN0YXR1cy5sZWFkZXJTdGF0dXMpXG5cdH1cblxuXHRpc0xlYWRlcigpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5sZWFkZXJTdGF0dXMubGVhZGVyU3RhdHVzXG5cdH1cblxuXHRyZXNldCgpIHtcblx0XHR0aGlzLnVzZXIgPSBudWxsXG5cdFx0dGhpcy5hY2Nlc3NUb2tlbiA9IG51bGxcblx0XHR0aGlzLmtleUNhY2hlLnJlc2V0KClcblx0XHR0aGlzLmxlYWRlclN0YXR1cyA9IGNyZWF0ZVdlYnNvY2tldExlYWRlclN0YXR1cyh7XG5cdFx0XHRsZWFkZXJTdGF0dXM6IGZhbHNlLFxuXHRcdH0pXG5cdH1cblxuXHR1cGRhdGVVc2VyR3JvdXBLZXkodXNlckdyb3VwS2V5RGlzdHJpYnV0aW9uOiBVc2VyR3JvdXBLZXlEaXN0cmlidXRpb24pIHtcblx0XHRjb25zdCB1c2VyRGlzdEtleSA9IHRoaXMua2V5Q2FjaGUuZ2V0VXNlckRpc3RLZXkoKVxuXHRcdGlmICh1c2VyRGlzdEtleSA9PSBudWxsKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhcImNvdWxkIG5vdCB1cGRhdGUgdXNlckdyb3VwS2V5IGJlY2F1c2UgZGlzdHJpYnV0aW9uIGtleSBpcyBub3QgYXZhaWxhYmxlXCIpXG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cdFx0bGV0IG5ld1VzZXJHcm91cEtleUJ5dGVzXG5cdFx0dHJ5IHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdG5ld1VzZXJHcm91cEtleUJ5dGVzID0gZGVjcnlwdEtleSh1c2VyRGlzdEtleSwgdXNlckdyb3VwS2V5RGlzdHJpYnV0aW9uLmRpc3RyaWJ1dGlvbkVuY1VzZXJHcm91cEtleSlcblx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0aWYgKGUgaW5zdGFuY2VvZiBDcnlwdG9FcnJvcikge1xuXHRcdFx0XHRcdC8vIHRoaXMgbWlnaHQgYmUgZHVlIHRvIG9sZCBlbmNyeXB0aW9uIHdpdGggdGhlIGxlZ2FjeSBkZXJpdmF0aW9uIG9mIHRoZSBkaXN0cmlidXRpb24ga2V5XG5cdFx0XHRcdFx0Ly8gdHJ5IHdpdGggdGhlIGxlZ2FjeSBvbmUgaW5zdGVhZFxuXHRcdFx0XHRcdGNvbnN0IGxlZ2FjeVVzZXJEaXN0S2V5ID0gdGhpcy5rZXlDYWNoZS5nZXRMZWdhY3lVc2VyRGlzdEtleSgpXG5cdFx0XHRcdFx0aWYgKGxlZ2FjeVVzZXJEaXN0S2V5ID09IG51bGwpIHtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKFwiY291bGQgbm90IHVwZGF0ZSB1c2VyR3JvdXBLZXkgYmVjYXVzZSBvbGQgbGVnYWN5IGRpc3RyaWJ1dGlvbiBrZXkgaXMgbm90IGF2YWlsYWJsZVwiKVxuXHRcdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdG5ld1VzZXJHcm91cEtleUJ5dGVzID0gZGVjcnlwdEtleShsZWdhY3lVc2VyRGlzdEtleSwgdXNlckdyb3VwS2V5RGlzdHJpYnV0aW9uLmRpc3RyaWJ1dGlvbkVuY1VzZXJHcm91cEtleSlcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aHJvdyBlXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHQvLyB0aGlzIG1heSBoYXBwZW4gZHVyaW5nIG9mZmxpbmUgc3RvcmFnZSBzeW5jaHJvbmlzYXRpb24gd2hlbiB0aGUgZXZlbnQgcXVldWUgY29udGFpbnMgdXNlciBncm91cCBrZXkgcm90YXRpb24gYW5kIGEgcGFzc3dvcmQgY2hhbmdlLlxuXHRcdFx0Ly8gV2UgY2FuIGlnbm9yZSB0aGlzIGVycm9yIGFzIHdlIGFscmVhZHkgaGF2ZSB0aGUgbGF0ZXN0IHVzZXIgZ3JvdXAga2V5IGFmdGVyIGNvbm5lY3RpbmcgdGhlIG9mZmxpbmUgY2xpZW50XG5cdFx0XHRjb25zb2xlLmxvZyhgQ291bGQgbm90IGRlY3J5cHQgdXNlckdyb3VwS2V5VXBkYXRlYCwgZSlcblx0XHRcdHJldHVyblxuXHRcdH1cblx0XHRjb25zdCBuZXdVc2VyR3JvdXBLZXkgPSB7XG5cdFx0XHRvYmplY3Q6IG5ld1VzZXJHcm91cEtleUJ5dGVzLFxuXHRcdFx0dmVyc2lvbjogcGFyc2VLZXlWZXJzaW9uKHVzZXJHcm91cEtleURpc3RyaWJ1dGlvbi51c2VyR3JvdXBLZXlWZXJzaW9uKSxcblx0XHR9XG5cdFx0Y29uc29sZS5sb2coYHVwZGF0aW5nIHVzZXJHcm91cEtleS4gbmV3IHZlcnNpb246ICR7dXNlckdyb3VwS2V5RGlzdHJpYnV0aW9uLnVzZXJHcm91cEtleVZlcnNpb259YClcblx0XHR0aGlzLmtleUNhY2hlLnNldEN1cnJlbnRVc2VyR3JvdXBLZXkobmV3VXNlckdyb3VwS2V5KVxuXHR9XG59XG4iLCJpbXBvcnQgeyBPZmZsaW5lU3RvcmFnZSB9IGZyb20gXCIuL09mZmxpbmVTdG9yYWdlLmpzXCJcbmltcG9ydCB7IG1vZGVsSW5mb3MgfSBmcm9tIFwiLi4vLi4vY29tbW9uL0VudGl0eUZ1bmN0aW9ucy5qc1wiXG5pbXBvcnQgeyB0eXBlZEtleXMsIFR5cGVSZWYgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB7IEVsZW1lbnRFbnRpdHksIExpc3RFbGVtZW50RW50aXR5LCBTb21lRW50aXR5IH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9FbnRpdHlUeXBlcy5qc1wiXG5pbXBvcnQgeyBQcm9ncmFtbWluZ0Vycm9yIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9lcnJvci9Qcm9ncmFtbWluZ0Vycm9yLmpzXCJcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1pZ3JhdGVBbGxMaXN0RWxlbWVudHM8VCBleHRlbmRzIExpc3RFbGVtZW50RW50aXR5Pih0eXBlUmVmOiBUeXBlUmVmPFQ+LCBzdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSwgbWlncmF0aW9uczogQXJyYXk8TWlncmF0aW9uPikge1xuXHRsZXQgZW50aXRpZXMgPSBhd2FpdCBzdG9yYWdlLmdldFJhd0xpc3RFbGVtZW50c09mVHlwZSh0eXBlUmVmKVxuXG5cdGZvciAoY29uc3QgbWlncmF0aW9uIG9mIG1pZ3JhdGlvbnMpIHtcblx0XHQvLyBAdHMtaWdub3JlIG5lZWQgYmV0dGVyIHR5cGVzIGZvciBtaWdyYXRpb25zXG5cdFx0ZW50aXRpZXMgPSBlbnRpdGllcy5tYXAobWlncmF0aW9uKVxuXHR9XG5cblx0Zm9yIChjb25zdCBlbnRpdHkgb2YgZW50aXRpZXMpIHtcblx0XHRlbnRpdHkuX3R5cGUgPSB0eXBlUmVmIGFzIFR5cGVSZWY8dHlwZW9mIGVudGl0eT5cblx0XHRhd2FpdCBzdG9yYWdlLnB1dChlbnRpdHkpXG5cdH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1pZ3JhdGVBbGxFbGVtZW50czxUIGV4dGVuZHMgRWxlbWVudEVudGl0eT4odHlwZVJlZjogVHlwZVJlZjxUPiwgc3RvcmFnZTogT2ZmbGluZVN0b3JhZ2UsIG1pZ3JhdGlvbnM6IEFycmF5PE1pZ3JhdGlvbj4pIHtcblx0bGV0IGVudGl0aWVzID0gYXdhaXQgc3RvcmFnZS5nZXRSYXdFbGVtZW50c09mVHlwZSh0eXBlUmVmKVxuXG5cdGZvciAoY29uc3QgbWlncmF0aW9uIG9mIG1pZ3JhdGlvbnMpIHtcblx0XHQvLyBAdHMtaWdub3JlIG5lZWQgYmV0dGVyIHR5cGVzIGZvciBtaWdyYXRpb25zXG5cdFx0ZW50aXRpZXMgPSBlbnRpdGllcy5tYXAobWlncmF0aW9uKVxuXHR9XG5cblx0Zm9yIChjb25zdCBlbnRpdHkgb2YgZW50aXRpZXMpIHtcblx0XHRlbnRpdHkuX3R5cGUgPSB0eXBlUmVmIGFzIFR5cGVSZWY8dHlwZW9mIGVudGl0eT5cblx0XHRhd2FpdCBzdG9yYWdlLnB1dChlbnRpdHkpXG5cdH1cbn1cblxuZXhwb3J0IHR5cGUgTWlncmF0aW9uID0gKGVudGl0eTogYW55KSA9PiBTb21lRW50aXR5XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5hbWVBdHRyaWJ1dGUob2xkTmFtZTogc3RyaW5nLCBuZXdOYW1lOiBzdHJpbmcpOiBNaWdyYXRpb24ge1xuXHRyZXR1cm4gZnVuY3Rpb24gKGVudGl0eSkge1xuXHRcdGVudGl0eVtuZXdOYW1lXSA9IGVudGl0eVtvbGROYW1lXVxuXHRcdGRlbGV0ZSBlbnRpdHlbb2xkTmFtZV1cblx0XHRyZXR1cm4gZW50aXR5XG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZE93bmVyS2V5VmVyc2lvbigpOiBNaWdyYXRpb24ge1xuXHRyZXR1cm4gZnVuY3Rpb24gKGVudGl0eSkge1xuXHRcdGVudGl0eVtcIl9vd25lcktleVZlcnNpb25cIl0gPSBlbnRpdHlbXCJfb3duZXJFbmNTZXNzaW9uS2V5XCJdID09IG51bGwgPyBudWxsIDogXCIwXCJcblx0XHRyZXR1cm4gZW50aXR5XG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZVZhbHVlKHZhbHVlTmFtZTogc3RyaW5nKTogTWlncmF0aW9uIHtcblx0cmV0dXJuIGZ1bmN0aW9uIChlbnRpdHkpIHtcblx0XHRkZWxldGUgZW50aXR5W3ZhbHVlTmFtZV1cblx0XHRyZXR1cm4gZW50aXR5XG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZFZhbHVlKHZhbHVlTmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogTWlncmF0aW9uIHtcblx0cmV0dXJuIGZ1bmN0aW9uIChlbnRpdHkpIHtcblx0XHRlbnRpdHlbdmFsdWVOYW1lXSA9IHZhbHVlXG5cdFx0cmV0dXJuIGVudGl0eVxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBib29sZWFuVG9OdW1iZXJWYWx1ZShhdHRyaWJ1dGU6IHN0cmluZyk6IE1pZ3JhdGlvbiB7XG5cdHJldHVybiBmdW5jdGlvbiAoZW50aXR5KSB7XG5cdFx0Ly8gc2FtZSBkZWZhdWx0IHZhbHVlIG1hcHBpbmcgYXMgaW4gdGhlIHR1dGFkYiBtaWdyYXRpb25cblx0XHRlbnRpdHlbYXR0cmlidXRlXSA9IGVudGl0eVthdHRyaWJ1dGVdID8gXCIxXCIgOiBcIjBcIlxuXHRcdHJldHVybiBlbnRpdHlcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2hhbmdlQ2FyZGluYWxpdHlGcm9tQW55VG9aZXJvT3JPbmUoYXR0cmlidXRlOiBzdHJpbmcpOiBNaWdyYXRpb24ge1xuXHRyZXR1cm4gZnVuY3Rpb24gKGVudGl0eSkge1xuXHRcdGNvbnN0IHZhbHVlID0gZW50aXR5W2F0dHJpYnV0ZV1cblx0XHRpZiAoIUFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG5cdFx0XHR0aHJvdyBuZXcgUHJvZ3JhbW1pbmdFcnJvcihcIkNhbiBvbmx5IG1pZ3JhdGUgZnJvbSBjYXJkaW5hbGl0eSBBTlkuXCIpXG5cdFx0fVxuXHRcdGNvbnN0IGxlbmd0aCA9IHZhbHVlLmxlbmd0aFxuXHRcdGlmIChsZW5ndGggPT09IDApIHtcblx0XHRcdGVudGl0eVthdHRyaWJ1dGVdID0gbnVsbFxuXHRcdH0gZWxzZSBpZiAobGVuZ3RoID09PSAxKSB7XG5cdFx0XHRlbnRpdHlbYXR0cmlidXRlXSA9IHZhbHVlWzBdXG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBQcm9ncmFtbWluZ0Vycm9yKGBub3QgcG9zc2libGUgdG8gbWlncmF0ZSBBTlkgdG8gWkVST19PUl9PTkUgd2l0aCBhcnJheSBsZW5ndGggPiAxLiBhY3R1YWwgbGVuZ3RoOiAke2xlbmd0aH1gKVxuXHRcdH1cblx0XHRyZXR1cm4gZW50aXR5XG5cdH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyRGF0YWJhc2Uoc3RvcmFnZTogT2ZmbGluZVN0b3JhZ2UpIHtcblx0YXdhaXQgc3RvcmFnZS5wdXJnZVN0b3JhZ2UoKVxuXHRhd2FpdCB3cml0ZU1vZGVsVmVyc2lvbnMoc3RvcmFnZSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlbGV0ZUluc3RhbmNlc09mVHlwZTxUIGV4dGVuZHMgU29tZUVudGl0eT4oc3RvcmFnZTogT2ZmbGluZVN0b3JhZ2UsIHR5cGU6IFR5cGVSZWY8VD4pOiBQcm9taXNlPHZvaWQ+IHtcblx0cmV0dXJuIHN0b3JhZ2UuZGVsZXRlQWxsT2ZUeXBlKHR5cGUpXG59XG5cbmFzeW5jIGZ1bmN0aW9uIHdyaXRlTW9kZWxWZXJzaW9ucyhzdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSkge1xuXHRmb3IgKGNvbnN0IGFwcCBvZiB0eXBlZEtleXMobW9kZWxJbmZvcykpIHtcblx0XHRjb25zdCBrZXkgPSBgJHthcHB9LXZlcnNpb25gIGFzIGNvbnN0XG5cdFx0bGV0IHZlcnNpb24gPSBtb2RlbEluZm9zW2FwcF0udmVyc2lvblxuXHRcdGF3YWl0IHN0b3JhZ2Uuc2V0U3RvcmVkTW9kZWxWZXJzaW9uKGFwcCwgdmVyc2lvbilcblx0fVxufVxuIiwiaW1wb3J0IHsgT2ZmbGluZU1pZ3JhdGlvbiB9IGZyb20gXCIuLi9PZmZsaW5lU3RvcmFnZU1pZ3JhdG9yLmpzXCJcbmltcG9ydCB7IE9mZmxpbmVTdG9yYWdlIH0gZnJvbSBcIi4uL09mZmxpbmVTdG9yYWdlLmpzXCJcbmltcG9ydCB7IGRlbGV0ZUluc3RhbmNlc09mVHlwZSwgbWlncmF0ZUFsbExpc3RFbGVtZW50cyB9IGZyb20gXCIuLi9TdGFuZGFyZE1pZ3JhdGlvbnMuanNcIlxuaW1wb3J0IHsgTWFpbFR5cGVSZWYgfSBmcm9tIFwiLi4vLi4vLi4vZW50aXRpZXMvdHV0YW5vdGEvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgY3JlYXRlQ3VzdG9tZXJJbmZvLCBDdXN0b21lckluZm9UeXBlUmVmLCBVc2VyVHlwZVJlZiB9IGZyb20gXCIuLi8uLi8uLi9lbnRpdGllcy9zeXMvVHlwZVJlZnMuanNcIlxuXG5leHBvcnQgY29uc3Qgc3lzOTQ6IE9mZmxpbmVNaWdyYXRpb24gPSB7XG5cdGFwcDogXCJzeXNcIixcblx0dmVyc2lvbjogOTQsXG5cdGFzeW5jIG1pZ3JhdGUoc3RvcmFnZTogT2ZmbGluZVN0b3JhZ2UpIHtcblx0XHQvLyB0aGVzZSBhcmUgZHVlIHRvIHRoZSBtYWlsYm9keSBtaWdyYXRpb25cblx0XHRhd2FpdCBkZWxldGVJbnN0YW5jZXNPZlR5cGUoc3RvcmFnZSwgTWFpbFR5cGVSZWYpXG5cdFx0YXdhaXQgZGVsZXRlSW5zdGFuY2VzT2ZUeXBlKHN0b3JhZ2UsIFVzZXJUeXBlUmVmKVxuXHRcdC8vIHRoaXMgaXMgdG8gYWRkIHRoZSBjdXN0b21lckluZm8uc3VwcG9ydEluZm8gZmllbGQgKHN5czk0KVxuXHRcdGF3YWl0IG1pZ3JhdGVBbGxMaXN0RWxlbWVudHMoQ3VzdG9tZXJJbmZvVHlwZVJlZiwgc3RvcmFnZSwgW2NyZWF0ZUN1c3RvbWVySW5mb10pXG5cdH0sXG59XG4iLCJpbXBvcnQgeyBPZmZsaW5lTWlncmF0aW9uIH0gZnJvbSBcIi4uL09mZmxpbmVTdG9yYWdlTWlncmF0b3IuanNcIlxuaW1wb3J0IHsgT2ZmbGluZVN0b3JhZ2UgfSBmcm9tIFwiLi4vT2ZmbGluZVN0b3JhZ2UuanNcIlxuaW1wb3J0IHsgbWlncmF0ZUFsbExpc3RFbGVtZW50cyB9IGZyb20gXCIuLi9TdGFuZGFyZE1pZ3JhdGlvbnMuanNcIlxuaW1wb3J0IHsgY3JlYXRlTWFpbCwgTWFpbFR5cGVSZWYgfSBmcm9tIFwiLi4vLi4vLi4vZW50aXRpZXMvdHV0YW5vdGEvVHlwZVJlZnMuanNcIlxuXG5leHBvcnQgY29uc3QgdHV0YW5vdGE2NjogT2ZmbGluZU1pZ3JhdGlvbiA9IHtcblx0YXBwOiBcInR1dGFub3RhXCIsXG5cdHZlcnNpb246IDY2LFxuXHRhc3luYyBtaWdyYXRlKHN0b3JhZ2U6IE9mZmxpbmVTdG9yYWdlKSB7XG5cdFx0YXdhaXQgbWlncmF0ZUFsbExpc3RFbGVtZW50cyhNYWlsVHlwZVJlZiwgc3RvcmFnZSwgW2NyZWF0ZU1haWxdKSAvLyBpbml0aWFsaXplcyBlbmNyeXB0aW9uQXV0aFN0YXR1c1xuXHR9LFxufVxuIiwiaW1wb3J0IHsgT2ZmbGluZU1pZ3JhdGlvbiB9IGZyb20gXCIuLi9PZmZsaW5lU3RvcmFnZU1pZ3JhdG9yLmpzXCJcbmltcG9ydCB7IE9mZmxpbmVTdG9yYWdlIH0gZnJvbSBcIi4uL09mZmxpbmVTdG9yYWdlLmpzXCJcbmltcG9ydCB7IGRlbGV0ZUluc3RhbmNlc09mVHlwZSwgbWlncmF0ZUFsbExpc3RFbGVtZW50cyB9IGZyb20gXCIuLi9TdGFuZGFyZE1pZ3JhdGlvbnMuanNcIlxuaW1wb3J0IHsgQnVja2V0S2V5LCBCdWNrZXRQZXJtaXNzaW9uLCBCdWNrZXRQZXJtaXNzaW9uVHlwZVJlZiwgR3JvdXBUeXBlUmVmLCBVc2VyVHlwZVJlZiB9IGZyb20gXCIuLi8uLi8uLi9lbnRpdGllcy9zeXMvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgQ3J5cHRvUHJvdG9jb2xWZXJzaW9uIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9UdXRhbm90YUNvbnN0YW50cy5qc1wiXG5pbXBvcnQgeyBNYWlsLCBNYWlsVHlwZVJlZiB9IGZyb20gXCIuLi8uLi8uLi9lbnRpdGllcy90dXRhbm90YS9UeXBlUmVmcy5qc1wiXG5cbmV4cG9ydCBjb25zdCBzeXM5MjogT2ZmbGluZU1pZ3JhdGlvbiA9IHtcblx0YXBwOiBcInN5c1wiLFxuXHR2ZXJzaW9uOiA5Mixcblx0YXN5bmMgbWlncmF0ZShzdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSkge1xuXHRcdGF3YWl0IG1pZ3JhdGVBbGxMaXN0RWxlbWVudHMoQnVja2V0UGVybWlzc2lvblR5cGVSZWYsIHN0b3JhZ2UsIFthZGRQcm90b2NvbFZlcnNpb25dKVxuXHRcdGF3YWl0IG1pZ3JhdGVBbGxMaXN0RWxlbWVudHMoTWFpbFR5cGVSZWYsIHN0b3JhZ2UsIFtcblx0XHRcdChlOiBNYWlsKSA9PiB7XG5cdFx0XHRcdGlmIChlLmJ1Y2tldEtleSkge1xuXHRcdFx0XHRcdGFkZFByb3RvY29sVmVyc2lvbihlLmJ1Y2tldEtleSlcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gZVxuXHRcdFx0fSxcblx0XHRdKVxuXHRcdC8vIEtleVBhaXIgd2FzIGNoYW5nZWRcblx0XHRhd2FpdCBkZWxldGVJbnN0YW5jZXNPZlR5cGUoc3RvcmFnZSwgR3JvdXBUeXBlUmVmKVxuXHRcdC8vIFdlIGFsc28gZGVsZXRlIFVzZXJUeXBlIHJlZiB0byBkaXNhYmxlIG9mZmxpbmUgbG9naW4uIE90aGVyd2lzZSwgY2xpZW50cyB3aWxsIHNlZSBhbiB1bmV4cGVjdGVkIGVycm9yIG1lc3NhZ2Ugd2l0aCBwdXJlIG9mZmxpbmUgbG9naW4uXG5cdFx0YXdhaXQgZGVsZXRlSW5zdGFuY2VzT2ZUeXBlKHN0b3JhZ2UsIFVzZXJUeXBlUmVmKVxuXHR9LFxufVxuXG5mdW5jdGlvbiBhZGRQcm90b2NvbFZlcnNpb248VCBleHRlbmRzIEJ1Y2tldEtleSB8IEJ1Y2tldFBlcm1pc3Npb24+KGVudGl0eTogVCk6IFQge1xuXHRpZiAoZW50aXR5LnB1YkVuY0J1Y2tldEtleSkge1xuXHRcdGVudGl0eS5wcm90b2NvbFZlcnNpb24gPSBDcnlwdG9Qcm90b2NvbFZlcnNpb24uUlNBXG5cdH0gZWxzZSB7XG5cdFx0ZW50aXR5LnByb3RvY29sVmVyc2lvbiA9IENyeXB0b1Byb3RvY29sVmVyc2lvbi5TWU1NRVRSSUNfRU5DUllQVElPTlxuXHR9XG5cdHJldHVybiBlbnRpdHlcbn1cbiIsImltcG9ydCB7IE9mZmxpbmVNaWdyYXRpb24gfSBmcm9tIFwiLi4vT2ZmbGluZVN0b3JhZ2VNaWdyYXRvci5qc1wiXG5pbXBvcnQgeyBPZmZsaW5lU3RvcmFnZSB9IGZyb20gXCIuLi9PZmZsaW5lU3RvcmFnZS5qc1wiXG5pbXBvcnQgeyBkZWxldGVJbnN0YW5jZXNPZlR5cGUsIG1pZ3JhdGVBbGxFbGVtZW50cywgbWlncmF0ZUFsbExpc3RFbGVtZW50cywgcmVtb3ZlVmFsdWUgfSBmcm9tIFwiLi4vU3RhbmRhcmRNaWdyYXRpb25zLmpzXCJcbmltcG9ydCB7IEN1c3RvbWVyVHlwZVJlZiB9IGZyb20gXCIuLi8uLi8uLi9lbnRpdGllcy9zeXMvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgTWFpbGJveEdyb3VwUm9vdFR5cGVSZWYsIE1haWxUeXBlUmVmIH0gZnJvbSBcIi4uLy4uLy4uL2VudGl0aWVzL3R1dGFub3RhL1R5cGVSZWZzLmpzXCJcblxuZXhwb3J0IGNvbnN0IHR1dGFub3RhNjU6IE9mZmxpbmVNaWdyYXRpb24gPSB7XG5cdGFwcDogXCJ0dXRhbm90YVwiLFxuXHR2ZXJzaW9uOiA2NSxcblx0YXN5bmMgbWlncmF0ZShzdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSkge1xuXHRcdG1pZ3JhdGVBbGxMaXN0RWxlbWVudHMoTWFpbFR5cGVSZWYsIHN0b3JhZ2UsIFtyZW1vdmVWYWx1ZShcInJlc3RyaWN0aW9uc1wiKV0pXG5cdFx0bWlncmF0ZUFsbEVsZW1lbnRzKE1haWxib3hHcm91cFJvb3RUeXBlUmVmLCBzdG9yYWdlLCBbXG5cdFx0XHRyZW1vdmVWYWx1ZShcImNvbnRhY3RGb3JtVXNlckNvbnRhY3RGb3JtXCIpLFxuXHRcdFx0cmVtb3ZlVmFsdWUoXCJ0YXJnZXRNYWlsR3JvdXBDb250YWN0Rm9ybVwiKSxcblx0XHRcdHJlbW92ZVZhbHVlKFwicGFydGljaXBhdGluZ0NvbnRhY3RGb3Jtc1wiKSxcblx0XHRdKVxuXHR9LFxufVxuIiwiaW1wb3J0IHsgT2ZmbGluZU1pZ3JhdGlvbiB9IGZyb20gXCIuLi9PZmZsaW5lU3RvcmFnZU1pZ3JhdG9yLmpzXCJcbmltcG9ydCB7IE9mZmxpbmVTdG9yYWdlIH0gZnJvbSBcIi4uL09mZmxpbmVTdG9yYWdlLmpzXCJcbmltcG9ydCB7IG1pZ3JhdGVBbGxFbGVtZW50cywgcmVtb3ZlVmFsdWUgfSBmcm9tIFwiLi4vU3RhbmRhcmRNaWdyYXRpb25zLmpzXCJcbmltcG9ydCB7IEN1c3RvbWVyVHlwZVJlZiB9IGZyb20gXCIuLi8uLi8uLi9lbnRpdGllcy9zeXMvVHlwZVJlZnMuanNcIlxuXG5leHBvcnQgY29uc3Qgc3lzOTE6IE9mZmxpbmVNaWdyYXRpb24gPSB7XG5cdGFwcDogXCJzeXNcIixcblx0dmVyc2lvbjogOTEsXG5cdGFzeW5jIG1pZ3JhdGUoc3RvcmFnZTogT2ZmbGluZVN0b3JhZ2UpIHtcblx0XHRhd2FpdCBtaWdyYXRlQWxsRWxlbWVudHMoQ3VzdG9tZXJUeXBlUmVmLCBzdG9yYWdlLCBbcmVtb3ZlVmFsdWUoXCJjb250YWN0Rm9ybVVzZXJHcm91cHNcIiksIHJlbW92ZVZhbHVlKFwiY29udGFjdEZvcm1Vc2VyQXJlYUdyb3Vwc1wiKV0pXG5cdH0sXG59XG4iLCJpbXBvcnQgeyBPZmZsaW5lTWlncmF0aW9uIH0gZnJvbSBcIi4uL09mZmxpbmVTdG9yYWdlTWlncmF0b3IuanNcIlxuaW1wb3J0IHsgT2ZmbGluZVN0b3JhZ2UgfSBmcm9tIFwiLi4vT2ZmbGluZVN0b3JhZ2UuanNcIlxuaW1wb3J0IHsgbWlncmF0ZUFsbEVsZW1lbnRzLCBtaWdyYXRlQWxsTGlzdEVsZW1lbnRzIH0gZnJvbSBcIi4uL1N0YW5kYXJkTWlncmF0aW9ucy5qc1wiXG5pbXBvcnQgeyBDdXN0b21lckluZm8sIEN1c3RvbWVySW5mb1R5cGVSZWYsIFVzZXIsIFVzZXJUeXBlUmVmIH0gZnJvbSBcIi4uLy4uLy4uL2VudGl0aWVzL3N5cy9UeXBlUmVmcy5qc1wiXG5pbXBvcnQgeyBLZGZUeXBlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9UdXRhbm90YUNvbnN0YW50cy5qc1wiXG5cbmV4cG9ydCBjb25zdCBzeXM5MDogT2ZmbGluZU1pZ3JhdGlvbiA9IHtcblx0YXBwOiBcInN5c1wiLFxuXHR2ZXJzaW9uOiA5MCxcblx0YXN5bmMgbWlncmF0ZShzdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSkge1xuXHRcdC8vIHdlJ3ZlIGFkZGVkIGEgbmV3IGZpZWxkIHRvIFBsYW5Db25maWcgYW5kIHdlIHdhbnQgdG8gbWFrZSBzdXJlIHRoYXQgaXQncyBjb3JyZWN0IGluIHRoZSBmdXR1cmVcblx0XHQvLyBhbnlvbmUgd2hvIGhhcyBhIGN1c3RvbSBwbGFuIGF0IHRoZSBtb21lbnQgZG9lcyBub3QgaGF2ZSB0aGUgY29udGFjdCBsaXN0XG5cdFx0YXdhaXQgbWlncmF0ZUFsbExpc3RFbGVtZW50cyhDdXN0b21lckluZm9UeXBlUmVmLCBzdG9yYWdlLCBbXG5cdFx0XHQob2xkQ3VzdG9tZXJJbmZvOiBDdXN0b21lckluZm8pID0+IHtcblx0XHRcdFx0aWYgKG9sZEN1c3RvbWVySW5mby5jdXN0b21QbGFuKSB7XG5cdFx0XHRcdFx0b2xkQ3VzdG9tZXJJbmZvLmN1c3RvbVBsYW4uY29udGFjdExpc3QgPSBmYWxzZVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBvbGRDdXN0b21lckluZm9cblx0XHRcdH0sXG5cdFx0XSlcblxuXHRcdC8vIHdlIGZvcmdvdCB0byBpbmNsdWRlIHRoaXMgaW4gdjg5IG1pZ3JhdGlvblxuXHRcdGF3YWl0IG1pZ3JhdGVBbGxFbGVtZW50cyhVc2VyVHlwZVJlZiwgc3RvcmFnZSwgW1xuXHRcdFx0KHVzZXI6IFVzZXIpID0+IHtcblx0XHRcdFx0aWYgKCF1c2VyLmtkZlZlcnNpb24pIHtcblx0XHRcdFx0XHR1c2VyLmtkZlZlcnNpb24gPSBLZGZUeXBlLkJjcnlwdFxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiB1c2VyXG5cdFx0XHR9LFxuXHRcdF0pXG5cdH0sXG59XG4iLCJpbXBvcnQgeyBPZmZsaW5lTWlncmF0aW9uIH0gZnJvbSBcIi4uL09mZmxpbmVTdG9yYWdlTWlncmF0b3IuanNcIlxuaW1wb3J0IHsgT2ZmbGluZVN0b3JhZ2UgfSBmcm9tIFwiLi4vT2ZmbGluZVN0b3JhZ2UuanNcIlxuaW1wb3J0IHsgbWlncmF0ZUFsbExpc3RFbGVtZW50cywgcmVtb3ZlVmFsdWUgfSBmcm9tIFwiLi4vU3RhbmRhcmRNaWdyYXRpb25zLmpzXCJcbmltcG9ydCB7IEZpbGVUeXBlUmVmIH0gZnJvbSBcIi4uLy4uLy4uL2VudGl0aWVzL3R1dGFub3RhL1R5cGVSZWZzLmpzXCJcblxuZXhwb3J0IGNvbnN0IHR1dGFub3RhNjQ6IE9mZmxpbmVNaWdyYXRpb24gPSB7XG5cdGFwcDogXCJ0dXRhbm90YVwiLFxuXHR2ZXJzaW9uOiA2NCxcblx0YXN5bmMgbWlncmF0ZShzdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSkge1xuXHRcdC8vIFdlIGhhdmUgZnVsbHkgcmVtb3ZlZCBGaWxlRGF0YVxuXHRcdG1pZ3JhdGVBbGxMaXN0RWxlbWVudHMoRmlsZVR5cGVSZWYsIHN0b3JhZ2UsIFtyZW1vdmVWYWx1ZShcImRhdGFcIildKVxuXHR9LFxufVxuIiwiaW1wb3J0IHsgT2ZmbGluZU1pZ3JhdGlvbiB9IGZyb20gXCIuLi9PZmZsaW5lU3RvcmFnZU1pZ3JhdG9yLmpzXCJcbmltcG9ydCB7IE9mZmxpbmVTdG9yYWdlIH0gZnJvbSBcIi4uL09mZmxpbmVTdG9yYWdlLmpzXCJcbmltcG9ydCB7IGRlbGV0ZUluc3RhbmNlc09mVHlwZSB9IGZyb20gXCIuLi9TdGFuZGFyZE1pZ3JhdGlvbnMuanNcIlxuaW1wb3J0IHsgQ29udGFjdFR5cGVSZWYgfSBmcm9tIFwiLi4vLi4vLi4vZW50aXRpZXMvdHV0YW5vdGEvVHlwZVJlZnMuanNcIlxuXG5leHBvcnQgY29uc3QgdHV0YW5vdGE2NzogT2ZmbGluZU1pZ3JhdGlvbiA9IHtcblx0YXBwOiBcInR1dGFub3RhXCIsXG5cdHZlcnNpb246IDY3LFxuXHRhc3luYyBtaWdyYXRlKHN0b3JhZ2U6IE9mZmxpbmVTdG9yYWdlKSB7XG5cdFx0YXdhaXQgZGVsZXRlSW5zdGFuY2VzT2ZUeXBlKHN0b3JhZ2UsIENvbnRhY3RUeXBlUmVmKVxuXHR9LFxufVxuIiwiaW1wb3J0IHsgT2ZmbGluZU1pZ3JhdGlvbiB9IGZyb20gXCIuLi9PZmZsaW5lU3RvcmFnZU1pZ3JhdG9yLmpzXCJcbmltcG9ydCB7IE9mZmxpbmVTdG9yYWdlIH0gZnJvbSBcIi4uL09mZmxpbmVTdG9yYWdlLmpzXCJcbmltcG9ydCB7XG5cdEFjY291bnRpbmdJbmZvVHlwZVJlZixcblx0QXVkaXRMb2dFbnRyeVR5cGVSZWYsXG5cdEN1c3RvbWVyU2VydmVyUHJvcGVydGllc1R5cGVSZWYsXG5cdEdpZnRDYXJkVHlwZVJlZixcblx0R3JvdXBJbmZvVHlwZVJlZixcblx0R3JvdXBUeXBlUmVmLFxuXHRJbnZvaWNlVHlwZVJlZixcblx0TWlzc2VkTm90aWZpY2F0aW9uVHlwZVJlZixcblx0T3JkZXJQcm9jZXNzaW5nQWdyZWVtZW50VHlwZVJlZixcblx0UHVzaElkZW50aWZpZXJUeXBlUmVmLFxuXHRSZWNlaXZlZEdyb3VwSW52aXRhdGlvblR5cGVSZWYsXG5cdFJlY292ZXJDb2RlVHlwZVJlZixcblx0VXNlckFsYXJtSW5mb1R5cGVSZWYsXG5cdFVzZXJHcm91cFJvb3RUeXBlUmVmLFxuXHRVc2VyVHlwZVJlZixcblx0V2hpdGVsYWJlbENoaWxkVHlwZVJlZixcbn0gZnJvbSBcIi4uLy4uLy4uL2VudGl0aWVzL3N5cy9UeXBlUmVmcy5qc1wiXG5pbXBvcnQge1xuXHRhZGRPd25lcktleVZlcnNpb24sXG5cdGFkZFZhbHVlLFxuXHRjaGFuZ2VDYXJkaW5hbGl0eUZyb21BbnlUb1plcm9Pck9uZSxcblx0bWlncmF0ZUFsbEVsZW1lbnRzLFxuXHRtaWdyYXRlQWxsTGlzdEVsZW1lbnRzLFxuXHRNaWdyYXRpb24sXG5cdHJlbW92ZVZhbHVlLFxuXHRyZW5hbWVBdHRyaWJ1dGUsXG59IGZyb20gXCIuLi9TdGFuZGFyZE1pZ3JhdGlvbnMuanNcIlxuaW1wb3J0IHsgRWxlbWVudEVudGl0eSwgTGlzdEVsZW1lbnRFbnRpdHkgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL0VudGl0eVR5cGVzLmpzXCJcbmltcG9ydCB7IFR5cGVSZWYgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcblxuZXhwb3J0IGNvbnN0IHN5czk2OiBPZmZsaW5lTWlncmF0aW9uID0ge1xuXHRhcHA6IFwic3lzXCIsXG5cdHZlcnNpb246IDk2LFxuXHRhc3luYyBtaWdyYXRlKHN0b3JhZ2U6IE9mZmxpbmVTdG9yYWdlKSB7XG5cdFx0Y29uc3QgZW5jcnlwdGVkRWxlbWVudFR5cGVzOiBBcnJheTxUeXBlUmVmPEVsZW1lbnRFbnRpdHk+PiA9IFtcblx0XHRcdEFjY291bnRpbmdJbmZvVHlwZVJlZixcblx0XHRcdEN1c3RvbWVyU2VydmVyUHJvcGVydGllc1R5cGVSZWYsXG5cdFx0XHRJbnZvaWNlVHlwZVJlZixcblx0XHRcdE1pc3NlZE5vdGlmaWNhdGlvblR5cGVSZWYsXG5cdFx0XVxuXHRcdGNvbnN0IGVuY3J5cHRlZExpc3RFbGVtZW50VHlwZXM6IEFycmF5PFR5cGVSZWY8TGlzdEVsZW1lbnRFbnRpdHk+PiA9IFtcblx0XHRcdEdyb3VwSW5mb1R5cGVSZWYsXG5cdFx0XHRBdWRpdExvZ0VudHJ5VHlwZVJlZixcblx0XHRcdFdoaXRlbGFiZWxDaGlsZFR5cGVSZWYsXG5cdFx0XHRPcmRlclByb2Nlc3NpbmdBZ3JlZW1lbnRUeXBlUmVmLFxuXHRcdFx0VXNlckFsYXJtSW5mb1R5cGVSZWYsXG5cdFx0XHRSZWNlaXZlZEdyb3VwSW52aXRhdGlvblR5cGVSZWYsXG5cdFx0XHRHaWZ0Q2FyZFR5cGVSZWYsXG5cdFx0XHRQdXNoSWRlbnRpZmllclR5cGVSZWYsXG5cdFx0XVxuXG5cdFx0Zm9yIChjb25zdCB0eXBlIG9mIGVuY3J5cHRlZEVsZW1lbnRUeXBlcykge1xuXHRcdFx0YXdhaXQgbWlncmF0ZUFsbEVsZW1lbnRzKHR5cGUsIHN0b3JhZ2UsIFthZGRPd25lcktleVZlcnNpb24oKV0pXG5cdFx0fVxuXHRcdGZvciAoY29uc3QgdHlwZSBvZiBlbmNyeXB0ZWRMaXN0RWxlbWVudFR5cGVzKSB7XG5cdFx0XHRhd2FpdCBtaWdyYXRlQWxsTGlzdEVsZW1lbnRzKHR5cGUsIHN0b3JhZ2UsIFthZGRPd25lcktleVZlcnNpb24oKV0pXG5cdFx0fVxuXG5cdFx0YXdhaXQgbWlncmF0ZUFsbEVsZW1lbnRzKEdyb3VwVHlwZVJlZiwgc3RvcmFnZSwgW1xuXHRcdFx0cmVuYW1lQXR0cmlidXRlKFwia2V5c1wiLCBcImN1cnJlbnRLZXlzXCIpLFxuXHRcdFx0Y2hhbmdlQ2FyZGluYWxpdHlGcm9tQW55VG9aZXJvT3JPbmUoXCJjdXJyZW50S2V5c1wiKSxcblx0XHRcdHJlbW92ZUtleVBhaXJWZXJzaW9uKCksXG5cdFx0XHRhZGRWYWx1ZShcImZvcm1lckdyb3VwS2V5c1wiLCBudWxsKSxcblx0XHRcdGFkZFZhbHVlKFwicHViQWRtaW5Hcm91cEVuY0dLZXlcIiwgbnVsbCksXG5cdFx0XHRhZGRWYWx1ZShcImdyb3VwS2V5VmVyc2lvblwiLCBcIjBcIiksXG5cdFx0XHRhZGRBZG1pbkdyb3VwS2V5VmVyc2lvbigpLFxuXHRcdF0pXG5cblx0XHRhd2FpdCBtaWdyYXRlQWxsRWxlbWVudHMoVXNlclR5cGVSZWYsIHN0b3JhZ2UsIFthZGRWZXJzaW9uc1RvR3JvdXBNZW1iZXJzaGlwcygpLCByZW1vdmVWYWx1ZShcInVzZXJFbmNDbGllbnRLZXlcIildKVxuXHRcdGF3YWl0IG1pZ3JhdGVBbGxMaXN0RWxlbWVudHMoUmVjZWl2ZWRHcm91cEludml0YXRpb25UeXBlUmVmLCBzdG9yYWdlLCBbYWRkVmFsdWUoXCJzaGFyZWRHcm91cEtleVZlcnNpb25cIiwgXCIwXCIpXSlcblx0XHRhd2FpdCBtaWdyYXRlQWxsRWxlbWVudHMoUmVjb3ZlckNvZGVUeXBlUmVmLCBzdG9yYWdlLCBbYWRkVmFsdWUoXCJ1c2VyS2V5VmVyc2lvblwiLCBcIjBcIildKVxuXHRcdGF3YWl0IG1pZ3JhdGVBbGxFbGVtZW50cyhVc2VyR3JvdXBSb290VHlwZVJlZiwgc3RvcmFnZSwgW2FkZFZhbHVlKFwia2V5Um90YXRpb25zXCIsIG51bGwpXSlcblx0fSxcbn1cblxuZnVuY3Rpb24gYWRkVmVyc2lvbnNUb0dyb3VwTWVtYmVyc2hpcHMoKTogTWlncmF0aW9uIHtcblx0cmV0dXJuIGZ1bmN0aW9uIChlbnRpdHkpIHtcblx0XHRjb25zdCB1c2VyR3JvdXBNZW1iZXJzaGlwID0gZW50aXR5W1widXNlckdyb3VwXCJdXG5cdFx0dXNlckdyb3VwTWVtYmVyc2hpcFtcImdyb3VwS2V5VmVyc2lvblwiXSA9IFwiMFwiXG5cdFx0dXNlckdyb3VwTWVtYmVyc2hpcFtcInN5bUtleVZlcnNpb25cIl0gPSBcIjBcIlxuXHRcdGZvciAoY29uc3QgbWVtYmVyc2hpcCBvZiBlbnRpdHlbXCJtZW1iZXJzaGlwc1wiXSkge1xuXHRcdFx0bWVtYmVyc2hpcFtcImdyb3VwS2V5VmVyc2lvblwiXSA9IFwiMFwiXG5cdFx0XHRtZW1iZXJzaGlwW1wic3ltS2V5VmVyc2lvblwiXSA9IFwiMFwiXG5cdFx0fVxuXHRcdHJldHVybiBlbnRpdHlcblx0fVxufVxuXG5mdW5jdGlvbiBhZGRBZG1pbkdyb3VwS2V5VmVyc2lvbigpOiBNaWdyYXRpb24ge1xuXHRyZXR1cm4gZnVuY3Rpb24gKGVudGl0eSkge1xuXHRcdGVudGl0eVtcImFkbWluR3JvdXBLZXlWZXJzaW9uXCJdID0gZW50aXR5W1wiYWRtaW5Hcm91cEVuY0dLZXlcIl0gPT0gbnVsbCA/IG51bGwgOiBcIjBcIlxuXHRcdHJldHVybiBlbnRpdHlcblx0fVxufVxuXG5mdW5jdGlvbiByZW1vdmVLZXlQYWlyVmVyc2lvbigpOiBNaWdyYXRpb24ge1xuXHRyZXR1cm4gZnVuY3Rpb24gKGVudGl0eSkge1xuXHRcdGNvbnN0IGN1cnJlbnRLZXlzID0gZW50aXR5W1wiY3VycmVudEtleXNcIl1cblx0XHRpZiAoY3VycmVudEtleXMpIHtcblx0XHRcdGRlbGV0ZSBjdXJyZW50S2V5c1tcInZlcnNpb25cIl1cblx0XHR9XG5cdFx0cmV0dXJuIGVudGl0eVxuXHR9XG59XG4iLCJpbXBvcnQgeyBPZmZsaW5lTWlncmF0aW9uIH0gZnJvbSBcIi4uL09mZmxpbmVTdG9yYWdlTWlncmF0b3IuanNcIlxuaW1wb3J0IHsgT2ZmbGluZVN0b3JhZ2UgfSBmcm9tIFwiLi4vT2ZmbGluZVN0b3JhZ2UuanNcIlxuaW1wb3J0IHsgYWRkT3duZXJLZXlWZXJzaW9uLCBhZGRWYWx1ZSwgbWlncmF0ZUFsbEVsZW1lbnRzLCBtaWdyYXRlQWxsTGlzdEVsZW1lbnRzLCBNaWdyYXRpb24sIHJlbW92ZVZhbHVlLCByZW5hbWVBdHRyaWJ1dGUgfSBmcm9tIFwiLi4vU3RhbmRhcmRNaWdyYXRpb25zLmpzXCJcbmltcG9ydCB7IEVsZW1lbnRFbnRpdHksIExpc3RFbGVtZW50RW50aXR5LCBTb21lRW50aXR5IH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9FbnRpdHlUeXBlcy5qc1wiXG5pbXBvcnQgeyBUeXBlUmVmIH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5pbXBvcnQge1xuXHRDYWxlbmRhckV2ZW50VHlwZVJlZixcblx0Q2FsZW5kYXJFdmVudFVwZGF0ZVR5cGVSZWYsXG5cdENhbGVuZGFyR3JvdXBSb290VHlwZVJlZixcblx0Q29udGFjdExpc3RFbnRyeVR5cGVSZWYsXG5cdENvbnRhY3RMaXN0R3JvdXBSb290VHlwZVJlZixcblx0Q29udGFjdExpc3RUeXBlUmVmLFxuXHRDb250YWN0VHlwZVJlZixcblx0RW1haWxUZW1wbGF0ZVR5cGVSZWYsXG5cdEZpbGVTeXN0ZW1UeXBlUmVmLFxuXHRGaWxlVHlwZVJlZixcblx0S25vd2xlZGdlQmFzZUVudHJ5VHlwZVJlZixcblx0TWFpbGJveFByb3BlcnRpZXNUeXBlUmVmLFxuXHRNYWlsQm94VHlwZVJlZixcblx0TWFpbERldGFpbHNCbG9iVHlwZVJlZixcblx0TWFpbERldGFpbHNEcmFmdFR5cGVSZWYsXG5cdE1haWxGb2xkZXJUeXBlUmVmLFxuXHRNYWlsVHlwZVJlZixcblx0VGVtcGxhdGVHcm91cFJvb3RUeXBlUmVmLFxuXHRUdXRhbm90YVByb3BlcnRpZXNUeXBlUmVmLFxuXHRVc2VyU2V0dGluZ3NHcm91cFJvb3RUeXBlUmVmLFxufSBmcm9tIFwiLi4vLi4vLi4vZW50aXRpZXMvdHV0YW5vdGEvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgQ3J5cHRvUHJvdG9jb2xWZXJzaW9uIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9UdXRhbm90YUNvbnN0YW50cy5qc1wiXG5cbmV4cG9ydCBjb25zdCB0dXRhbm90YTY5OiBPZmZsaW5lTWlncmF0aW9uID0ge1xuXHRhcHA6IFwidHV0YW5vdGFcIixcblx0dmVyc2lvbjogNjksXG5cdGFzeW5jIG1pZ3JhdGUoc3RvcmFnZTogT2ZmbGluZVN0b3JhZ2UpIHtcblx0XHRjb25zdCBlbmNyeXB0ZWRFbGVtZW50VHlwZXM6IEFycmF5PFR5cGVSZWY8RWxlbWVudEVudGl0eT4+ID0gW1xuXHRcdFx0RmlsZVN5c3RlbVR5cGVSZWYsXG5cdFx0XHRNYWlsQm94VHlwZVJlZixcblx0XHRcdENvbnRhY3RMaXN0VHlwZVJlZixcblx0XHRcdFR1dGFub3RhUHJvcGVydGllc1R5cGVSZWYsXG5cdFx0XHRDYWxlbmRhckdyb3VwUm9vdFR5cGVSZWYsXG5cdFx0XHRVc2VyU2V0dGluZ3NHcm91cFJvb3RUeXBlUmVmLFxuXHRcdFx0Q29udGFjdExpc3RHcm91cFJvb3RUeXBlUmVmLFxuXHRcdFx0TWFpbGJveFByb3BlcnRpZXNUeXBlUmVmLFxuXHRcdFx0VGVtcGxhdGVHcm91cFJvb3RUeXBlUmVmLFxuXHRcdF1cblxuXHRcdGNvbnN0IGVuY3J5cHRlZExpc3RFbGVtZW50VHlwZXM6IEFycmF5PFR5cGVSZWY8TGlzdEVsZW1lbnRFbnRpdHk+PiA9IFtcblx0XHRcdEZpbGVUeXBlUmVmLFxuXHRcdFx0Q29udGFjdFR5cGVSZWYsXG5cdFx0XHRNYWlsVHlwZVJlZixcblx0XHRcdE1haWxGb2xkZXJUeXBlUmVmLFxuXHRcdFx0Q2FsZW5kYXJFdmVudFR5cGVSZWYsXG5cdFx0XHRDYWxlbmRhckV2ZW50VXBkYXRlVHlwZVJlZixcblx0XHRcdEVtYWlsVGVtcGxhdGVUeXBlUmVmLFxuXHRcdFx0TWFpbERldGFpbHNEcmFmdFR5cGVSZWYsXG5cdFx0XHRNYWlsRGV0YWlsc0Jsb2JUeXBlUmVmLFxuXHRcdFx0Q29udGFjdExpc3RFbnRyeVR5cGVSZWYsXG5cdFx0XHRLbm93bGVkZ2VCYXNlRW50cnlUeXBlUmVmLFxuXHRcdF1cblxuXHRcdGZvciAoY29uc3QgdHlwZSBvZiBlbmNyeXB0ZWRFbGVtZW50VHlwZXMpIHtcblx0XHRcdGF3YWl0IG1pZ3JhdGVBbGxFbGVtZW50cyh0eXBlLCBzdG9yYWdlLCBbYWRkT3duZXJLZXlWZXJzaW9uKCldKVxuXHRcdH1cblx0XHRmb3IgKGNvbnN0IHR5cGUgb2YgZW5jcnlwdGVkTGlzdEVsZW1lbnRUeXBlcykge1xuXHRcdFx0YXdhaXQgbWlncmF0ZUFsbExpc3RFbGVtZW50cyh0eXBlLCBzdG9yYWdlLCBbYWRkT3duZXJLZXlWZXJzaW9uKCldKVxuXHRcdH1cblxuXHRcdGF3YWl0IG1pZ3JhdGVBbGxMaXN0RWxlbWVudHMoTWFpbFR5cGVSZWYsIHN0b3JhZ2UsIFthZGRWZXJzaW9uc1RvQnVja2V0S2V5KCldKVxuXHRcdGF3YWl0IG1pZ3JhdGVBbGxFbGVtZW50cyhUdXRhbm90YVByb3BlcnRpZXNUeXBlUmVmLCBzdG9yYWdlLCBbcmVuYW1lQXR0cmlidXRlKFwiZ3JvdXBFbmNFbnRyb3B5XCIsIFwidXNlckVuY0VudHJvcHlcIiksIGFkZFZhbHVlKFwidXNlcktleVZlcnNpb25cIiwgbnVsbCldKVxuXHRcdGF3YWl0IG1pZ3JhdGVBbGxFbGVtZW50cyhNYWlsQm94VHlwZVJlZiwgc3RvcmFnZSwgW3JlbW92ZVZhbHVlKFwic3ltRW5jU2hhcmVCdWNrZXRLZXlcIildKVxuXHR9LFxufVxuXG5mdW5jdGlvbiBhZGRWZXJzaW9uc1RvQnVja2V0S2V5KCk6IE1pZ3JhdGlvbiB7XG5cdHJldHVybiBmdW5jdGlvbiAoZW50aXR5KSB7XG5cdFx0Y29uc3QgYnVja2V0S2V5ID0gZW50aXR5W1wiYnVja2V0S2V5XCJdXG5cdFx0aWYgKGJ1Y2tldEtleSAhPSBudWxsKSB7XG5cdFx0XHRidWNrZXRLZXlbXCJyZWNpcGllbnRLZXlWZXJzaW9uXCJdID0gXCIwXCJcblx0XHRcdGJ1Y2tldEtleVtcInNlbmRlcktleVZlcnNpb25cIl0gPSBidWNrZXRLZXlbXCJwcm90b2NvbFZlcnNpb25cIl0gPT09IENyeXB0b1Byb3RvY29sVmVyc2lvbi5UVVRBX0NSWVBUID8gXCIwXCIgOiBudWxsXG5cdFx0XHRmb3IgKGNvbnN0IGluc3RhbmNlU2Vzc2lvbktleSBvZiBidWNrZXRLZXlbXCJidWNrZXRFbmNTZXNzaW9uS2V5c1wiXSkge1xuXHRcdFx0XHRpbnN0YW5jZVNlc3Npb25LZXlbXCJzeW1LZXlWZXJzaW9uXCJdID0gXCIwXCJcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGVudGl0eVxuXHR9XG59XG4iLCJpbXBvcnQgeyBPZmZsaW5lTWlncmF0aW9uIH0gZnJvbSBcIi4uL09mZmxpbmVTdG9yYWdlTWlncmF0b3IuanNcIlxuaW1wb3J0IHsgT2ZmbGluZVN0b3JhZ2UgfSBmcm9tIFwiLi4vT2ZmbGluZVN0b3JhZ2UuanNcIlxuaW1wb3J0IHsgQ3VzdG9tZXJUeXBlUmVmIH0gZnJvbSBcIi4uLy4uLy4uL2VudGl0aWVzL3N5cy9UeXBlUmVmcy5qc1wiXG5pbXBvcnQgeyBtaWdyYXRlQWxsRWxlbWVudHMsIHJlbW92ZVZhbHVlIH0gZnJvbSBcIi4uL1N0YW5kYXJkTWlncmF0aW9ucy5qc1wiXG5cbmV4cG9ydCBjb25zdCBzeXM5NzogT2ZmbGluZU1pZ3JhdGlvbiA9IHtcblx0YXBwOiBcInN5c1wiLFxuXHR2ZXJzaW9uOiA5Nyxcblx0YXN5bmMgbWlncmF0ZShzdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSkge1xuXHRcdC8vIEFzIG9mIDIwMjAgdGhlIGNhbmNlbGVkUHJlbWl1bUFjY291bnQgYm9vbGVhbiB2YWx1ZSBoYXMgYWx3YXlzIGJlZW4gc2V0IHRvXG5cdFx0Ly8gZmFsc2UgdGhlcmVmb3JlIHRoaXMgdmFsdWUgaXMgbm8gbG9uZ2VyIG5lZWRlZCwgYW5kIHdlIGNhbiByZW1vdmUgaXQuXG5cdFx0YXdhaXQgbWlncmF0ZUFsbEVsZW1lbnRzKEN1c3RvbWVyVHlwZVJlZiwgc3RvcmFnZSwgW3JlbW92ZVZhbHVlKFwiY2FuY2VsZWRQcmVtaXVtQWNjb3VudFwiKV0pXG5cdH0sXG59XG4iLCJpbXBvcnQgeyBPZmZsaW5lTWlncmF0aW9uIH0gZnJvbSBcIi4uL09mZmxpbmVTdG9yYWdlTWlncmF0b3IuanNcIlxuaW1wb3J0IHsgT2ZmbGluZVN0b3JhZ2UgfSBmcm9tIFwiLi4vT2ZmbGluZVN0b3JhZ2UuanNcIlxuaW1wb3J0IHsgZGVsZXRlSW5zdGFuY2VzT2ZUeXBlIH0gZnJvbSBcIi4uL1N0YW5kYXJkTWlncmF0aW9ucy5qc1wiXG5pbXBvcnQgeyBSZWNlaXZlZEdyb3VwSW52aXRhdGlvblR5cGVSZWYsIFNlbnRHcm91cEludml0YXRpb25UeXBlUmVmLCBVc2VyR3JvdXBSb290VHlwZVJlZiB9IGZyb20gXCIuLi8uLi8uLi9lbnRpdGllcy9zeXMvVHlwZVJlZnMuanNcIlxuXG5leHBvcnQgY29uc3QgdHV0YW5vdGE3MTogT2ZmbGluZU1pZ3JhdGlvbiA9IHtcblx0YXBwOiBcInR1dGFub3RhXCIsXG5cdHZlcnNpb246IDcxLFxuXHRhc3luYyBtaWdyYXRlKHN0b3JhZ2U6IE9mZmxpbmVTdG9yYWdlKSB7XG5cdFx0YXdhaXQgZGVsZXRlSW5zdGFuY2VzT2ZUeXBlKHN0b3JhZ2UsIFVzZXJHcm91cFJvb3RUeXBlUmVmKVxuXHRcdGF3YWl0IGRlbGV0ZUluc3RhbmNlc09mVHlwZShzdG9yYWdlLCBSZWNlaXZlZEdyb3VwSW52aXRhdGlvblR5cGVSZWYpXG5cdFx0YXdhaXQgZGVsZXRlSW5zdGFuY2VzT2ZUeXBlKHN0b3JhZ2UsIFNlbnRHcm91cEludml0YXRpb25UeXBlUmVmKVxuXHR9LFxufVxuIiwiaW1wb3J0IHsgT2ZmbGluZU1pZ3JhdGlvbiB9IGZyb20gXCIuLi9PZmZsaW5lU3RvcmFnZU1pZ3JhdG9yLmpzXCJcbmltcG9ydCB7IE9mZmxpbmVTdG9yYWdlIH0gZnJvbSBcIi4uL09mZmxpbmVTdG9yYWdlLmpzXCJcblxuZXhwb3J0IGNvbnN0IHN5czk5OiBPZmZsaW5lTWlncmF0aW9uID0ge1xuXHRhcHA6IFwic3lzXCIsXG5cdHZlcnNpb246IDk5LFxuXHRhc3luYyBtaWdyYXRlKHN0b3JhZ2U6IE9mZmxpbmVTdG9yYWdlKSB7XG5cdFx0Ly8gb25seSBjaGFuZ2VzIE1pc3NlZE5vdGlmaWNhdGlvbiB3aGljaCB3ZSBkbyBub3QgbG9hZCBub3IgY2FjaGVcblx0fSxcbn1cbiIsImltcG9ydCB7IE9mZmxpbmVNaWdyYXRpb24gfSBmcm9tIFwiLi4vT2ZmbGluZVN0b3JhZ2VNaWdyYXRvci5qc1wiXG5pbXBvcnQgeyBPZmZsaW5lU3RvcmFnZSB9IGZyb20gXCIuLi9PZmZsaW5lU3RvcmFnZS5qc1wiXG5pbXBvcnQgeyBTcWxDaXBoZXJGYWNhZGUgfSBmcm9tIFwiLi4vLi4vLi4vLi4vbmF0aXZlL2NvbW1vbi9nZW5lcmF0ZWRpcGMvU3FsQ2lwaGVyRmFjYWRlLmpzXCJcblxuZXhwb3J0IGNvbnN0IHN5czEwMTogT2ZmbGluZU1pZ3JhdGlvbiA9IHtcblx0YXBwOiBcInN5c1wiLFxuXHR2ZXJzaW9uOiAxMDEsXG5cdGFzeW5jIG1pZ3JhdGUoc3RvcmFnZTogT2ZmbGluZVN0b3JhZ2UsIHNxbENpcGhlckZhY2FkZTogU3FsQ2lwaGVyRmFjYWRlKSB7XG5cdFx0Ly8gbm8gY2FjaGVkIHR5cGVzIGhhdmUgYmVlbiBtb2RpZmllZFxuXHR9LFxufVxuIiwiaW1wb3J0IHsgT2ZmbGluZU1pZ3JhdGlvbiB9IGZyb20gXCIuLi9PZmZsaW5lU3RvcmFnZU1pZ3JhdG9yLmpzXCJcbmltcG9ydCB7IE9mZmxpbmVTdG9yYWdlIH0gZnJvbSBcIi4uL09mZmxpbmVTdG9yYWdlLmpzXCJcbmltcG9ydCB7IFNxbENpcGhlckZhY2FkZSB9IGZyb20gXCIuLi8uLi8uLi8uLi9uYXRpdmUvY29tbW9uL2dlbmVyYXRlZGlwYy9TcWxDaXBoZXJGYWNhZGUuanNcIlxuaW1wb3J0IHsgZGVsZXRlSW5zdGFuY2VzT2ZUeXBlIH0gZnJvbSBcIi4uL1N0YW5kYXJkTWlncmF0aW9ucy5qc1wiXG5pbXBvcnQgeyBHcm91cFR5cGVSZWYsIFVzZXJHcm91cFJvb3RUeXBlUmVmLCBVc2VyVHlwZVJlZiB9IGZyb20gXCIuLi8uLi8uLi9lbnRpdGllcy9zeXMvVHlwZVJlZnMuanNcIlxuXG5leHBvcnQgY29uc3Qgc3lzMTAyOiBPZmZsaW5lTWlncmF0aW9uID0ge1xuXHRhcHA6IFwic3lzXCIsXG5cdHZlcnNpb246IDEwMixcblx0YXN5bmMgbWlncmF0ZShzdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSwgc3FsQ2lwaGVyRmFjYWRlOiBTcWxDaXBoZXJGYWNhZGUpIHtcblx0XHRhd2FpdCBkZWxldGVJbnN0YW5jZXNPZlR5cGUoc3RvcmFnZSwgVXNlckdyb3VwUm9vdFR5cGVSZWYpIC8vIHRvIGVuc3VyZSBrZXlSb3RhdGlvbnMgaXMgcG9wdWxhdGVkXG5cdFx0YXdhaXQgZGVsZXRlSW5zdGFuY2VzT2ZUeXBlKHN0b3JhZ2UsIEdyb3VwVHlwZVJlZikgLy8gdG8gZW5zdXJlIGZvcm1lckdyb3VwS2V5cyBpcyBwb3B1bGF0ZWRcblx0XHQvLyBXZSBhbHNvIGRlbGV0ZSBVc2VyVHlwZSByZWYgdG8gZGlzYWJsZSBvZmZsaW5lIGxvZ2luLiBPdGhlcndpc2UsIGNsaWVudHMgd2lsbCBzZWUgYW4gdW5leHBlY3RlZCBlcnJvciBtZXNzYWdlIHdpdGggcHVyZSBvZmZsaW5lIGxvZ2luLlxuXHRcdGF3YWl0IGRlbGV0ZUluc3RhbmNlc09mVHlwZShzdG9yYWdlLCBVc2VyVHlwZVJlZilcblx0fSxcbn1cbiIsImltcG9ydCB7IE9mZmxpbmVNaWdyYXRpb24gfSBmcm9tIFwiLi4vT2ZmbGluZVN0b3JhZ2VNaWdyYXRvci5qc1wiXG5pbXBvcnQgeyBPZmZsaW5lU3RvcmFnZSB9IGZyb20gXCIuLi9PZmZsaW5lU3RvcmFnZS5qc1wiXG5cbmV4cG9ydCBjb25zdCB0dXRhbm90YTcyOiBPZmZsaW5lTWlncmF0aW9uID0ge1xuXHRhcHA6IFwidHV0YW5vdGFcIixcblx0dmVyc2lvbjogNzIsXG5cdGFzeW5jIG1pZ3JhdGUoc3RvcmFnZTogT2ZmbGluZVN0b3JhZ2UpIHtcblx0XHQvLyBvbmx5IGRhdGEgdHJhbnNmZXIgdHlwZXMgaGF2ZSBiZWVuIG1vZGlmaWVkXG5cdH0sXG59XG4iLCJpbXBvcnQgeyBPZmZsaW5lTWlncmF0aW9uIH0gZnJvbSBcIi4uL09mZmxpbmVTdG9yYWdlTWlncmF0b3IuanNcIlxuaW1wb3J0IHsgT2ZmbGluZVN0b3JhZ2UgfSBmcm9tIFwiLi4vT2ZmbGluZVN0b3JhZ2UuanNcIlxuaW1wb3J0IHsgU3FsQ2lwaGVyRmFjYWRlIH0gZnJvbSBcIi4uLy4uLy4uLy4uL25hdGl2ZS9jb21tb24vZ2VuZXJhdGVkaXBjL1NxbENpcGhlckZhY2FkZS5qc1wiXG5pbXBvcnQgeyBkZWxldGVJbnN0YW5jZXNPZlR5cGUgfSBmcm9tIFwiLi4vU3RhbmRhcmRNaWdyYXRpb25zLmpzXCJcbmltcG9ydCB7IEFjY291bnRpbmdJbmZvVHlwZVJlZiB9IGZyb20gXCIuLi8uLi8uLi9lbnRpdGllcy9zeXMvVHlwZVJlZnMuanNcIlxuXG5leHBvcnQgY29uc3Qgc3lzMTAzOiBPZmZsaW5lTWlncmF0aW9uID0ge1xuXHRhcHA6IFwic3lzXCIsXG5cdHZlcnNpb246IDEwMyxcblx0YXN5bmMgbWlncmF0ZShzdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSwgc3FsQ2lwaGVyRmFjYWRlOiBTcWxDaXBoZXJGYWNhZGUpIHtcblx0XHQvLyBkZWxldGUgQWNjb3VudGluZ0luZm8gdG8gbWFrZSBzdXJlIGFwcFN0b3JlU3Vic2NyaXB0aW9uIGlzIG5vdCBtaXNzaW5nIGZyb20gb2ZmbG5lIGRiXG5cdFx0YXdhaXQgZGVsZXRlSW5zdGFuY2VzT2ZUeXBlKHN0b3JhZ2UsIEFjY291bnRpbmdJbmZvVHlwZVJlZilcblx0fSxcbn1cbiIsImltcG9ydCB7IE9mZmxpbmVNaWdyYXRpb24gfSBmcm9tIFwiLi4vT2ZmbGluZVN0b3JhZ2VNaWdyYXRvci5qc1wiXG5pbXBvcnQgeyBPZmZsaW5lU3RvcmFnZSB9IGZyb20gXCIuLi9PZmZsaW5lU3RvcmFnZS5qc1wiXG5pbXBvcnQgeyBtaWdyYXRlQWxsRWxlbWVudHMsIG1pZ3JhdGVBbGxMaXN0RWxlbWVudHMsIHJlbW92ZVZhbHVlIH0gZnJvbSBcIi4uL1N0YW5kYXJkTWlncmF0aW9ucy5qc1wiXG5pbXBvcnQgeyBDb250YWN0VHlwZVJlZiwgRmlsZVR5cGVSZWYsIE1haWxCb3hUeXBlUmVmLCBNYWlsRm9sZGVyVHlwZVJlZiwgTWFpbFR5cGVSZWYgfSBmcm9tIFwiLi4vLi4vLi4vZW50aXRpZXMvdHV0YW5vdGEvVHlwZVJlZnMuanNcIlxuXG5leHBvcnQgY29uc3QgdHV0YW5vdGE3MzogT2ZmbGluZU1pZ3JhdGlvbiA9IHtcblx0YXBwOiBcInR1dGFub3RhXCIsXG5cdHZlcnNpb246IDczLFxuXHRhc3luYyBtaWdyYXRlKHN0b3JhZ2U6IE9mZmxpbmVTdG9yYWdlKSB7XG5cdFx0Ly8gdGhlIFR1dGFub3RhTW9kZWxWNzMgZmluYWxseSByZW1vdmVzIGFsbCBsZWdhY3kgbWFpbCAod2l0aG91dCBNYWlsRGV0YWlscykgYXR0cmlidXRlcyBhbmQgdHlwZXNcblx0XHQvLyBhbGwgbWFpbHMgbXVzdCB1c2UgTWFpbERldGFpbHMgbm93XG5cdFx0YXdhaXQgbWlncmF0ZUFsbExpc3RFbGVtZW50cyhNYWlsVHlwZVJlZiwgc3RvcmFnZSwgW1xuXHRcdFx0cmVtb3ZlVmFsdWUoXCJib2R5XCIpLFxuXHRcdFx0cmVtb3ZlVmFsdWUoXCJ0b1JlY2lwaWVudHNcIiksXG5cdFx0XHRyZW1vdmVWYWx1ZShcImNjUmVjaXBpZW50c1wiKSxcblx0XHRcdHJlbW92ZVZhbHVlKFwiYmNjUmVjaXBpZW50c1wiKSxcblx0XHRcdHJlbW92ZVZhbHVlKFwicmVwbHlUb3NcIiksXG5cdFx0XHRyZW1vdmVWYWx1ZShcImhlYWRlcnNcIiksXG5cdFx0XHRyZW1vdmVWYWx1ZShcInNlbnREYXRlXCIpLFxuXHRcdF0pXG5cblx0XHQvLyBjbGVhbnVwIFR1dGFub3RhTW9kZWxcblx0XHRhd2FpdCBtaWdyYXRlQWxsRWxlbWVudHMoTWFpbEJveFR5cGVSZWYsIHN0b3JhZ2UsIFtyZW1vdmVWYWx1ZShcIm1haWxzXCIpXSlcblx0XHRhd2FpdCBtaWdyYXRlQWxsTGlzdEVsZW1lbnRzKE1haWxGb2xkZXJUeXBlUmVmLCBzdG9yYWdlLCBbcmVtb3ZlVmFsdWUoXCJzdWJGb2xkZXJzXCIpXSlcblxuXHRcdC8vIHJlbW92aW5nIFZhbHVlLk9MRF9PV05FUl9HUk9VUF9OQU1FLCBhbmQgVmFsdWUuT0xEX0FSRUFfSURfTkFNRSBmcm9tIEZJTEVfVFlQRSBhbmQgQ09OVEFDVF9UWVBFXG5cdFx0YXdhaXQgbWlncmF0ZUFsbExpc3RFbGVtZW50cyhGaWxlVHlwZVJlZiwgc3RvcmFnZSwgW3JlbW92ZVZhbHVlKFwiX293bmVyXCIpLCByZW1vdmVWYWx1ZShcIl9hcmVhXCIpXSlcblx0XHRhd2FpdCBtaWdyYXRlQWxsTGlzdEVsZW1lbnRzKENvbnRhY3RUeXBlUmVmLCBzdG9yYWdlLCBbXG5cdFx0XHRyZW1vdmVWYWx1ZShcIl9vd25lclwiKSxcblx0XHRcdHJlbW92ZVZhbHVlKFwiX2FyZWFcIiksXG5cdFx0XHRyZW1vdmVWYWx1ZShcImF1dG9UcmFuc21pdFBhc3N3b3JkXCIpLCAvLyBhdXRvVHJhbnNtaXRQYXNzd29yZCBoYXMgYmVlbiByZW1vdmVkIGZyb20gQ29udGFjdFR5cGVcblx0XHRdKVxuXHR9LFxufVxuIiwiaW1wb3J0IHsgT2ZmbGluZU1pZ3JhdGlvbiB9IGZyb20gXCIuLi9PZmZsaW5lU3RvcmFnZU1pZ3JhdG9yLmpzXCJcbmltcG9ydCB7IE9mZmxpbmVTdG9yYWdlIH0gZnJvbSBcIi4uL09mZmxpbmVTdG9yYWdlLmpzXCJcbmltcG9ydCB7IFNxbENpcGhlckZhY2FkZSB9IGZyb20gXCIuLi8uLi8uLi8uLi9uYXRpdmUvY29tbW9uL2dlbmVyYXRlZGlwYy9TcWxDaXBoZXJGYWNhZGUuanNcIlxuaW1wb3J0IHsgbWlncmF0ZUFsbEVsZW1lbnRzLCByZW1vdmVWYWx1ZSB9IGZyb20gXCIuLi9TdGFuZGFyZE1pZ3JhdGlvbnMuanNcIlxuaW1wb3J0IHsgVXNlclR5cGVSZWYgfSBmcm9tIFwiLi4vLi4vLi4vZW50aXRpZXMvc3lzL1R5cGVSZWZzLmpzXCJcblxuZXhwb3J0IGNvbnN0IHN5czEwNDogT2ZmbGluZU1pZ3JhdGlvbiA9IHtcblx0YXBwOiBcInN5c1wiLFxuXHR2ZXJzaW9uOiAxMDQsXG5cdGFzeW5jIG1pZ3JhdGUoc3RvcmFnZTogT2ZmbGluZVN0b3JhZ2UsIF86IFNxbENpcGhlckZhY2FkZSkge1xuXHRcdC8vIFN5c3RlbU1vZGVsVjEwNCByZW1vdmVzIHBob25lTnVtYmVycyBmcm9tIHRoZSBVU0VSX1RZUEVcblx0XHRhd2FpdCBtaWdyYXRlQWxsRWxlbWVudHMoVXNlclR5cGVSZWYsIHN0b3JhZ2UsIFtyZW1vdmVWYWx1ZShcInBob25lTnVtYmVyc1wiKV0pXG5cdH0sXG59XG4iLCJpbXBvcnQgeyBPZmZsaW5lTWlncmF0aW9uIH0gZnJvbSBcIi4uL09mZmxpbmVTdG9yYWdlTWlncmF0b3IuanNcIlxuaW1wb3J0IHsgT2ZmbGluZVN0b3JhZ2UgfSBmcm9tIFwiLi4vT2ZmbGluZVN0b3JhZ2UuanNcIlxuaW1wb3J0IHsgU3FsQ2lwaGVyRmFjYWRlIH0gZnJvbSBcIi4uLy4uLy4uLy4uL25hdGl2ZS9jb21tb24vZ2VuZXJhdGVkaXBjL1NxbENpcGhlckZhY2FkZS5qc1wiXG5pbXBvcnQgeyBkZWxldGVJbnN0YW5jZXNPZlR5cGUgfSBmcm9tIFwiLi4vU3RhbmRhcmRNaWdyYXRpb25zLmpzXCJcbmltcG9ydCB7IFB1c2hJZGVudGlmaWVyVHlwZVJlZiB9IGZyb20gXCIuLi8uLi8uLi9lbnRpdGllcy9zeXMvVHlwZVJlZnMuanNcIlxuXG5leHBvcnQgY29uc3Qgc3lzMTA1OiBPZmZsaW5lTWlncmF0aW9uID0ge1xuXHRhcHA6IFwic3lzXCIsXG5cdHZlcnNpb246IDEwNSxcblx0YXN5bmMgbWlncmF0ZShzdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSwgXzogU3FsQ2lwaGVyRmFjYWRlKSB7XG5cdFx0YXdhaXQgZGVsZXRlSW5zdGFuY2VzT2ZUeXBlKHN0b3JhZ2UsIFB1c2hJZGVudGlmaWVyVHlwZVJlZilcblx0fSxcbn1cbiIsImltcG9ydCB7IE9mZmxpbmVNaWdyYXRpb24gfSBmcm9tIFwiLi4vT2ZmbGluZVN0b3JhZ2VNaWdyYXRvci5qc1wiXG5pbXBvcnQgeyBPZmZsaW5lU3RvcmFnZSB9IGZyb20gXCIuLi9PZmZsaW5lU3RvcmFnZS5qc1wiXG5cbmV4cG9ydCBjb25zdCBzeXMxMDY6IE9mZmxpbmVNaWdyYXRpb24gPSB7XG5cdGFwcDogXCJzeXNcIixcblx0dmVyc2lvbjogMTA2LFxuXHRhc3luYyBtaWdyYXRlKHN0b3JhZ2U6IE9mZmxpbmVTdG9yYWdlKSB7XG5cdFx0Ly8gb25seSBjaGFuZ2VzIGRhdGEgdHJhbnNmZXIgdHlwZVxuXHR9LFxufVxuIiwiaW1wb3J0IHsgT2ZmbGluZU1pZ3JhdGlvbiB9IGZyb20gXCIuLi9PZmZsaW5lU3RvcmFnZU1pZ3JhdG9yLmpzXCJcbmltcG9ydCB7IE9mZmxpbmVTdG9yYWdlIH0gZnJvbSBcIi4uL09mZmxpbmVTdG9yYWdlLmpzXCJcbmltcG9ydCB7IGFkZFZhbHVlLCBkZWxldGVJbnN0YW5jZXNPZlR5cGUsIG1pZ3JhdGVBbGxFbGVtZW50cywgbWlncmF0ZUFsbExpc3RFbGVtZW50cyB9IGZyb20gXCIuLi9TdGFuZGFyZE1pZ3JhdGlvbnMuanNcIlxuaW1wb3J0IHsgQ2FsZW5kYXJFdmVudFR5cGVSZWYsIGNyZWF0ZU1haWwsIGNyZWF0ZU1haWxCb3gsIE1haWxCb3hUeXBlUmVmLCBNYWlsRm9sZGVyVHlwZVJlZiwgTWFpbFR5cGVSZWYgfSBmcm9tIFwiLi4vLi4vLi4vZW50aXRpZXMvdHV0YW5vdGEvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgR0VORVJBVEVEX01JTl9JRCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vdXRpbHMvRW50aXR5VXRpbHMuanNcIlxuXG5leHBvcnQgY29uc3QgdHV0YW5vdGE3NDogT2ZmbGluZU1pZ3JhdGlvbiA9IHtcblx0YXBwOiBcInR1dGFub3RhXCIsXG5cdHZlcnNpb246IDc0LFxuXHRhc3luYyBtaWdyYXRlKHN0b3JhZ2U6IE9mZmxpbmVTdG9yYWdlKSB7XG5cdFx0Ly8gdGhlIFR1dGFub3RhTW9kZWxWNzQgaW50cm9kdWNlcyBNYWlsU2V0cyB0byBzdXBwb3J0IGltcG9ydCBhbmQgbGFiZWxzXG5cdFx0YXdhaXQgbWlncmF0ZUFsbExpc3RFbGVtZW50cyhNYWlsRm9sZGVyVHlwZVJlZiwgc3RvcmFnZSwgW1xuXHRcdFx0YWRkVmFsdWUoXCJpc0xhYmVsXCIsIGZhbHNlKSxcblx0XHRcdGFkZFZhbHVlKFwiaXNNYWlsU2V0XCIsIGZhbHNlKSxcblx0XHRcdGFkZFZhbHVlKFwiZW50cmllc1wiLCBHRU5FUkFURURfTUlOX0lEKSxcblx0XHRdKVxuXHRcdGF3YWl0IG1pZ3JhdGVBbGxFbGVtZW50cyhNYWlsQm94VHlwZVJlZiwgc3RvcmFnZSwgW2NyZWF0ZU1haWxCb3hdKSAvLyBpbml0aWFsaXplIG1haWxiYWdzXG5cdFx0YXdhaXQgbWlncmF0ZUFsbExpc3RFbGVtZW50cyhNYWlsVHlwZVJlZiwgc3RvcmFnZSwgW2NyZWF0ZU1haWxdKSAvLyBpbml0aWFsaXplIHNldHNcblxuXHRcdC8vIHdlIG5lZWQgdG8gZGVsZXRlIGFsbCBDYWxlbmRhckV2ZW50cyBzaW5jZSB3ZSBjaGFuZ2VkIHRoZSBmb3JtYXQgZm9yIHN0b3JpbmcgY3VzdG9tSWRzIChDYWxlbmRhckV2ZW50cyB1c2UgY3VzdG9tSWRzKSBpbiB0aGUgb2ZmbGluZSBkYXRhYmFzZVxuXHRcdC8vIGFsbCBlbnRpdGllcyB3aXRoIGN1c3RvbUlkcywgdGhhdCBhcmUgc3RvcmVkIGluIHRoZSBvZmZsaW5lIGRhdGFiYXNlIChlLmcuIENhbGVuZGFyRXZlbnQsIE1haWxTZXRFbnRyeSksXG5cdFx0Ly8gYXJlIGZyb20gbm93IG9uIHN0b3JlZCBpbiB0aGUgb2ZmbGluZSBkYXRhYmFzZSB1c2luZyBhICoqYmFzZTY0RXh0KiogZW5jb2RlZCBpZCBzdHJpbmdcblx0XHRhd2FpdCBkZWxldGVJbnN0YW5jZXNPZlR5cGUoc3RvcmFnZSwgQ2FsZW5kYXJFdmVudFR5cGVSZWYpXG5cdH0sXG59XG4iLCJpbXBvcnQgeyBPZmZsaW5lTWlncmF0aW9uIH0gZnJvbSBcIi4uL09mZmxpbmVTdG9yYWdlTWlncmF0b3IuanNcIlxuaW1wb3J0IHsgT2ZmbGluZVN0b3JhZ2UgfSBmcm9tIFwiLi4vT2ZmbGluZVN0b3JhZ2UuanNcIlxuXG5leHBvcnQgY29uc3Qgc3lzMTA3OiBPZmZsaW5lTWlncmF0aW9uID0ge1xuXHRhcHA6IFwic3lzXCIsXG5cdHZlcnNpb246IDEwNyxcblx0YXN5bmMgbWlncmF0ZShzdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSkge1xuXHRcdC8vIG9ubHkgY2hhbmdlcyBkYXRhIHRyYW5zZmVyIHR5cGVcblx0fSxcbn1cbiIsImltcG9ydCB7IE9mZmxpbmVNaWdyYXRpb24gfSBmcm9tIFwiLi4vT2ZmbGluZVN0b3JhZ2VNaWdyYXRvci5qc1wiXG5pbXBvcnQgeyBPZmZsaW5lU3RvcmFnZSB9IGZyb20gXCIuLi9PZmZsaW5lU3RvcmFnZS5qc1wiXG5pbXBvcnQgeyBkZWxldGVJbnN0YW5jZXNPZlR5cGUgfSBmcm9tIFwiLi4vU3RhbmRhcmRNaWdyYXRpb25zLmpzXCJcbmltcG9ydCB7IFVzZXJTZXR0aW5nc0dyb3VwUm9vdFR5cGVSZWYgfSBmcm9tIFwiLi4vLi4vLi4vZW50aXRpZXMvdHV0YW5vdGEvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgQXVkaXRMb2dFbnRyeVR5cGVSZWYsIEdyb3VwSW5mb1R5cGVSZWYgfSBmcm9tIFwiLi4vLi4vLi4vZW50aXRpZXMvc3lzL1R5cGVSZWZzLmpzXCJcbmltcG9ydCB7IEdyb3VwVHlwZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vVHV0YW5vdGFDb25zdGFudHMuanNcIlxuaW1wb3J0IHsgZ2V0RWxlbWVudElkLCBnZXRMaXN0SWQgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL3V0aWxzL0VudGl0eVV0aWxzLmpzXCJcblxuZXhwb3J0IGNvbnN0IHR1dGFub3RhNzU6IE9mZmxpbmVNaWdyYXRpb24gPSB7XG5cdGFwcDogXCJ0dXRhbm90YVwiLFxuXHR2ZXJzaW9uOiA3NSxcblx0YXN5bmMgbWlncmF0ZShzdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSkge1xuXHRcdGF3YWl0IGRlbGV0ZUluc3RhbmNlc09mVHlwZShzdG9yYWdlLCBVc2VyU2V0dGluZ3NHcm91cFJvb3RUeXBlUmVmKVxuXHRcdC8vIHJlcXVpcmVkIHRvIHRocm93IHRoZSBMb2dpbkluY29tcGxldGVFcnJvciB3aGVuIHRyeWluZyBhc3luYyBsb2dpblxuXHRcdGNvbnN0IGdyb3VwSW5mb3MgPSBhd2FpdCBzdG9yYWdlLmdldFJhd0xpc3RFbGVtZW50c09mVHlwZShHcm91cEluZm9UeXBlUmVmKVxuXHRcdGZvciAoY29uc3QgZ3JvdXBJbmZvIG9mIGdyb3VwSW5mb3MpIHtcblx0XHRcdGlmICgoZ3JvdXBJbmZvIGFzIGFueSkuZ3JvdXBUeXBlICE9PSBHcm91cFR5cGUuVXNlcikgY29udGludWVcblx0XHRcdGF3YWl0IHN0b3JhZ2UuZGVsZXRlSWZFeGlzdHMoR3JvdXBJbmZvVHlwZVJlZiwgZ2V0TGlzdElkKGdyb3VwSW5mbyksIGdldEVsZW1lbnRJZChncm91cEluZm8pKVxuXHRcdH1cblx0XHRhd2FpdCBkZWxldGVJbnN0YW5jZXNPZlR5cGUoc3RvcmFnZSwgQXVkaXRMb2dFbnRyeVR5cGVSZWYpXG5cdH0sXG59XG4iLCJpbXBvcnQgeyBPZmZsaW5lTWlncmF0aW9uIH0gZnJvbSBcIi4uL09mZmxpbmVTdG9yYWdlTWlncmF0b3IuanNcIlxuaW1wb3J0IHsgT2ZmbGluZVN0b3JhZ2UgfSBmcm9tIFwiLi4vT2ZmbGluZVN0b3JhZ2UuanNcIlxuaW1wb3J0IHsgYWRkVmFsdWUsIG1pZ3JhdGVBbGxFbGVtZW50cywgbWlncmF0ZUFsbExpc3RFbGVtZW50cywgcmVtb3ZlVmFsdWUgfSBmcm9tIFwiLi4vU3RhbmRhcmRNaWdyYXRpb25zLmpzXCJcbmltcG9ydCB7IEdyb3VwS2V5VHlwZVJlZiwgR3JvdXBUeXBlUmVmIH0gZnJvbSBcIi4uLy4uLy4uL2VudGl0aWVzL3N5cy9UeXBlUmVmcy5qc1wiXG5cbmV4cG9ydCBjb25zdCBzeXMxMTE6IE9mZmxpbmVNaWdyYXRpb24gPSB7XG5cdGFwcDogXCJzeXNcIixcblx0dmVyc2lvbjogMTExLFxuXHRhc3luYyBtaWdyYXRlKHN0b3JhZ2U6IE9mZmxpbmVTdG9yYWdlKSB7XG5cdFx0YXdhaXQgbWlncmF0ZUFsbEVsZW1lbnRzKEdyb3VwVHlwZVJlZiwgc3RvcmFnZSwgW3JlbW92ZVZhbHVlKFwicHViQWRtaW5Hcm91cEVuY0dLZXlcIiksIGFkZFZhbHVlKFwicHViQWRtaW5Hcm91cEVuY0dLZXlcIiwgbnVsbCldKVxuXHRcdGF3YWl0IG1pZ3JhdGVBbGxMaXN0RWxlbWVudHMoR3JvdXBLZXlUeXBlUmVmLCBzdG9yYWdlLCBbcmVtb3ZlVmFsdWUoXCJwdWJBZG1pbkdyb3VwRW5jR0tleVwiKSwgYWRkVmFsdWUoXCJwdWJBZG1pbkdyb3VwRW5jR0tleVwiLCBudWxsKV0pXG5cdH0sXG59XG4iLCJpbXBvcnQgeyBPZmZsaW5lTWlncmF0aW9uIH0gZnJvbSBcIi4uL09mZmxpbmVTdG9yYWdlTWlncmF0b3IuanNcIlxuaW1wb3J0IHsgT2ZmbGluZVN0b3JhZ2UgfSBmcm9tIFwiLi4vT2ZmbGluZVN0b3JhZ2UuanNcIlxuaW1wb3J0IHsgZGVsZXRlSW5zdGFuY2VzT2ZUeXBlLCBtaWdyYXRlQWxsRWxlbWVudHMsIHJlbW92ZVZhbHVlIH0gZnJvbSBcIi4uL1N0YW5kYXJkTWlncmF0aW9uc1wiXG5pbXBvcnQgeyBNYWlsYm94R3JvdXBSb290VHlwZVJlZiwgTWFpbEJveFR5cGVSZWYgfSBmcm9tIFwiLi4vLi4vLi4vZW50aXRpZXMvdHV0YW5vdGEvVHlwZVJlZnNcIlxuaW1wb3J0IHsgVXNlckdyb3VwUm9vdFR5cGVSZWYgfSBmcm9tIFwiLi4vLi4vLi4vZW50aXRpZXMvc3lzL1R5cGVSZWZzXCJcblxuZXhwb3J0IGNvbnN0IHR1dGFub3RhNzY6IE9mZmxpbmVNaWdyYXRpb24gPSB7XG5cdGFwcDogXCJ0dXRhbm90YVwiLFxuXHR2ZXJzaW9uOiA3Nixcblx0YXN5bmMgbWlncmF0ZShzdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSkge1xuXHRcdGF3YWl0IG1pZ3JhdGVBbGxFbGVtZW50cyhNYWlsYm94R3JvdXBSb290VHlwZVJlZiwgc3RvcmFnZSwgW3JlbW92ZVZhbHVlKFwid2hpdGVsaXN0UmVxdWVzdHNcIildKVxuXHR9LFxufVxuIiwiaW1wb3J0IHsgT2ZmbGluZU1pZ3JhdGlvbiB9IGZyb20gXCIuLi9PZmZsaW5lU3RvcmFnZU1pZ3JhdG9yLmpzXCJcbmltcG9ydCB7IE9mZmxpbmVTdG9yYWdlIH0gZnJvbSBcIi4uL09mZmxpbmVTdG9yYWdlLmpzXCJcbmltcG9ydCB7IG1pZ3JhdGVBbGxFbGVtZW50cywgcmVtb3ZlVmFsdWUgfSBmcm9tIFwiLi4vU3RhbmRhcmRNaWdyYXRpb25zXCJcbmltcG9ydCB7IE1haWxib3hHcm91cFJvb3RUeXBlUmVmIH0gZnJvbSBcIi4uLy4uLy4uL2VudGl0aWVzL3R1dGFub3RhL1R5cGVSZWZzXCJcblxuZXhwb3J0IGNvbnN0IHN5czExMjogT2ZmbGluZU1pZ3JhdGlvbiA9IHtcblx0YXBwOiBcInN5c1wiLFxuXHR2ZXJzaW9uOiAxMTIsXG5cdGFzeW5jIG1pZ3JhdGUoc3RvcmFnZTogT2ZmbGluZVN0b3JhZ2UpIHtcblx0XHRhd2FpdCBtaWdyYXRlQWxsRWxlbWVudHMoTWFpbGJveEdyb3VwUm9vdFR5cGVSZWYsIHN0b3JhZ2UsIFtyZW1vdmVWYWx1ZShcIndoaXRlbGlzdGVkRG9tYWluc1wiKV0pXG5cdH0sXG59XG4iLCJpbXBvcnQgeyBPZmZsaW5lTWlncmF0aW9uIH0gZnJvbSBcIi4uL09mZmxpbmVTdG9yYWdlTWlncmF0b3IuanNcIlxuaW1wb3J0IHsgT2ZmbGluZVN0b3JhZ2UgfSBmcm9tIFwiLi4vT2ZmbGluZVN0b3JhZ2UuanNcIlxuaW1wb3J0IHsgYWRkVmFsdWUsIGRlbGV0ZUluc3RhbmNlc09mVHlwZSwgbWlncmF0ZUFsbExpc3RFbGVtZW50cywgcmVtb3ZlVmFsdWUgfSBmcm9tIFwiLi4vU3RhbmRhcmRNaWdyYXRpb25zXCJcbmltcG9ydCB7IE1haWxGb2xkZXJUeXBlUmVmLCBUdXRhbm90YVByb3BlcnRpZXNUeXBlUmVmIH0gZnJvbSBcIi4uLy4uLy4uL2VudGl0aWVzL3R1dGFub3RhL1R5cGVSZWZzXCJcblxuZXhwb3J0IGNvbnN0IHR1dGFub3RhNzc6IE9mZmxpbmVNaWdyYXRpb24gPSB7XG5cdGFwcDogXCJ0dXRhbm90YVwiLFxuXHR2ZXJzaW9uOiA3Nyxcblx0YXN5bmMgbWlncmF0ZShzdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSkge1xuXHRcdGF3YWl0IG1pZ3JhdGVBbGxMaXN0RWxlbWVudHMoTWFpbEZvbGRlclR5cGVSZWYsIHN0b3JhZ2UsIFtyZW1vdmVWYWx1ZShcImlzTGFiZWxcIiksIGFkZFZhbHVlKFwiY29sb3JcIiwgbnVsbCldKVxuXHRcdGF3YWl0IGRlbGV0ZUluc3RhbmNlc09mVHlwZShzdG9yYWdlLCBUdXRhbm90YVByb3BlcnRpZXNUeXBlUmVmKVxuXHR9LFxufVxuIiwiaW1wb3J0IHsgT2ZmbGluZU1pZ3JhdGlvbiB9IGZyb20gXCIuLi9PZmZsaW5lU3RvcmFnZU1pZ3JhdG9yLmpzXCJcbmltcG9ydCB7IE9mZmxpbmVTdG9yYWdlIH0gZnJvbSBcIi4uL09mZmxpbmVTdG9yYWdlLmpzXCJcbmltcG9ydCB7IG1pZ3JhdGVBbGxMaXN0RWxlbWVudHMsIE1pZ3JhdGlvbiB9IGZyb20gXCIuLi9TdGFuZGFyZE1pZ3JhdGlvbnNcIlxuaW1wb3J0IHsgQ3VzdG9tZXJJbmZvVHlwZVJlZiB9IGZyb20gXCIuLi8uLi8uLi9lbnRpdGllcy9zeXMvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgU29tZUVudGl0eSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vRW50aXR5VHlwZXMuanNcIlxuXG5leHBvcnQgY29uc3Qgc3lzMTE0OiBPZmZsaW5lTWlncmF0aW9uID0ge1xuXHRhcHA6IFwic3lzXCIsXG5cdHZlcnNpb246IDExNCxcblx0YXN5bmMgbWlncmF0ZShzdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSkge1xuXHRcdGF3YWl0IG1pZ3JhdGVBbGxMaXN0RWxlbWVudHMoQ3VzdG9tZXJJbmZvVHlwZVJlZiwgc3RvcmFnZSwgW2FkZFVubGltaXRlZExhYmVsc1RvUGxhbkNvbmZpZ3VyYXRpb24oKV0pXG5cdH0sXG59XG5cbmZ1bmN0aW9uIGFkZFVubGltaXRlZExhYmVsc1RvUGxhbkNvbmZpZ3VyYXRpb24oKTogTWlncmF0aW9uIHtcblx0cmV0dXJuIGZ1bmN0aW9uIGFkZFVubGltaXRlZExhYmVsc1RvUGxhbkNvbmZpZ3VyYXRpb25NaWdyYXRpb24oZW50aXR5OiBhbnkpOiBTb21lRW50aXR5IHtcblx0XHRpZiAoZW50aXR5LmN1c3RvbVBsYW4gIT0gbnVsbCkge1xuXHRcdFx0ZW50aXR5LmN1c3RvbVBsYW4udW5saW1pdGVkTGFiZWxzID0gZmFsc2Vcblx0XHR9XG5cdFx0cmV0dXJuIGVudGl0eVxuXHR9XG59XG4iLCJpbXBvcnQgeyBPZmZsaW5lU3RvcmFnZSB9IGZyb20gXCIuLi9PZmZsaW5lU3RvcmFnZS5qc1wiXG5pbXBvcnQgeyBTcWxDaXBoZXJGYWNhZGUgfSBmcm9tIFwiLi4vLi4vLi4vLi4vbmF0aXZlL2NvbW1vbi9nZW5lcmF0ZWRpcGMvU3FsQ2lwaGVyRmFjYWRlLmpzXCJcbmltcG9ydCB7IGFkZFZhbHVlLCBkZWxldGVJbnN0YW5jZXNPZlR5cGUsIG1pZ3JhdGVBbGxFbGVtZW50cyB9IGZyb20gXCIuLi9TdGFuZGFyZE1pZ3JhdGlvbnMuanNcIlxuaW1wb3J0IHsgVHV0YW5vdGFQcm9wZXJ0aWVzVHlwZVJlZiB9IGZyb20gXCIuLi8uLi8uLi9lbnRpdGllcy90dXRhbm90YS9UeXBlUmVmcy5qc1wiXG5pbXBvcnQgeyBPZmZsaW5lTWlncmF0aW9uIH0gZnJvbSBcIi4uL09mZmxpbmVTdG9yYWdlTWlncmF0b3IuanNcIlxuXG4vKipcbiAqIE1pZ3JhdGlvbiB0byBwYXRjaCB1cCB0aGUgYnJva2VuIHR1dGFub3RhLXY3NyBtaWdyYXRpb24uXG4gKlxuICogV2Ugd3JpdGUgZGVmYXVsdCB2YWx1ZSB3aGljaCBtaWdodCBiZSBvdXQgb2Ygc3luYyB3aXRoIHRoZSBzZXJ2ZXIgYnV0IHdlIGhhdmUgYW4gZXh0cmEgY2hlY2sgZm9yIHRoYXQgd2hlcmVcbiAqIHdlIHVzZSB0aGlzIHByb3BlcnR5LlxuICovXG5leHBvcnQgY29uc3Qgb2ZmbGluZTI6IE9mZmxpbmVNaWdyYXRpb24gPSB7XG5cdGFwcDogXCJvZmZsaW5lXCIsXG5cdHZlcnNpb246IDIsXG5cdGFzeW5jIG1pZ3JhdGUoc3RvcmFnZTogT2ZmbGluZVN0b3JhZ2UsIF86IFNxbENpcGhlckZhY2FkZSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGF3YWl0IG1pZ3JhdGVBbGxFbGVtZW50cyhUdXRhbm90YVByb3BlcnRpZXNUeXBlUmVmLCBzdG9yYWdlLCBbYWRkVmFsdWUoXCJkZWZhdWx0TGFiZWxDcmVhdGVkXCIsIGZhbHNlKV0pXG5cdH0sXG59XG4iLCJpbXBvcnQgeyBPZmZsaW5lTWlncmF0aW9uIH0gZnJvbSBcIi4uL09mZmxpbmVTdG9yYWdlTWlncmF0b3IuanNcIlxuaW1wb3J0IHsgT2ZmbGluZVN0b3JhZ2UgfSBmcm9tIFwiLi4vT2ZmbGluZVN0b3JhZ2UuanNcIlxuXG5leHBvcnQgY29uc3Qgc3lzMTE1OiBPZmZsaW5lTWlncmF0aW9uID0ge1xuXHRhcHA6IFwic3lzXCIsXG5cdHZlcnNpb246IDExNSxcblx0YXN5bmMgbWlncmF0ZShzdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSkge1xuXHRcdC8vIE5vdGhpbmcgdG8gbWlncmF0ZSBoZXJlLCBvbmx5IEFwcCBTdG9yZSBzdWJzY3JpcHRpb24gY2hhbmdlc1xuXHR9LFxufVxuIiwiaW1wb3J0IHsgT2ZmbGluZU1pZ3JhdGlvbiB9IGZyb20gXCIuLi9PZmZsaW5lU3RvcmFnZU1pZ3JhdG9yLmpzXCJcbmltcG9ydCB7IE9mZmxpbmVTdG9yYWdlIH0gZnJvbSBcIi4uL09mZmxpbmVTdG9yYWdlLmpzXCJcbmltcG9ydCB7IGFkZFZhbHVlLCBkZWxldGVJbnN0YW5jZXNPZlR5cGUsIG1pZ3JhdGVBbGxMaXN0RWxlbWVudHMsIHJlbW92ZVZhbHVlIH0gZnJvbSBcIi4uL1N0YW5kYXJkTWlncmF0aW9uc1wiXG5pbXBvcnQgeyBNYWlsRm9sZGVyVHlwZVJlZiwgVHV0YW5vdGFQcm9wZXJ0aWVzVHlwZVJlZiB9IGZyb20gXCIuLi8uLi8uLi9lbnRpdGllcy90dXRhbm90YS9UeXBlUmVmc1wiXG5cbmV4cG9ydCBjb25zdCB0dXRhbm90YTc4OiBPZmZsaW5lTWlncmF0aW9uID0ge1xuXHRhcHA6IFwidHV0YW5vdGFcIixcblx0dmVyc2lvbjogNzgsXG5cdGFzeW5jIG1pZ3JhdGUoc3RvcmFnZTogT2ZmbGluZVN0b3JhZ2UpIHt9LFxufVxuIiwiaW1wb3J0IHsgT2ZmbGluZU1pZ3JhdGlvbiB9IGZyb20gXCIuLi9PZmZsaW5lU3RvcmFnZU1pZ3JhdG9yLmpzXCJcbmltcG9ydCB7IE9mZmxpbmVTdG9yYWdlIH0gZnJvbSBcIi4uL09mZmxpbmVTdG9yYWdlLmpzXCJcbmV4cG9ydCBjb25zdCBzeXMxMTY6IE9mZmxpbmVNaWdyYXRpb24gPSB7XG5cdGFwcDogXCJzeXNcIixcblx0dmVyc2lvbjogMTE2LFxuXHRhc3luYyBtaWdyYXRlKHN0b3JhZ2U6IE9mZmxpbmVTdG9yYWdlKSB7XG5cdFx0Ly8gb25seSBEb3duZ3JhZGVkIGN1c3RvbWVyIHdhcyBhZGRlZCBzbyBub3RoaW5nIHRvIG1pZ3JhdGVcblx0fSxcbn1cbiIsImltcG9ydCB7IE9mZmxpbmVNaWdyYXRpb24gfSBmcm9tIFwiLi4vT2ZmbGluZVN0b3JhZ2VNaWdyYXRvci5qc1wiXG5pbXBvcnQgeyBPZmZsaW5lU3RvcmFnZSB9IGZyb20gXCIuLi9PZmZsaW5lU3RvcmFnZS5qc1wiXG5pbXBvcnQgeyBhZGRWYWx1ZSwgbWlncmF0ZUFsbEVsZW1lbnRzIH0gZnJvbSBcIi4uL1N0YW5kYXJkTWlncmF0aW9uc1wiXG5pbXBvcnQgeyBNYWlsQm94VHlwZVJlZiB9IGZyb20gXCIuLi8uLi8uLi9lbnRpdGllcy90dXRhbm90YS9UeXBlUmVmc1wiXG5pbXBvcnQgeyBHRU5FUkFURURfTUlOX0lEIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi91dGlscy9FbnRpdHlVdGlsc1wiXG5cbmV4cG9ydCBjb25zdCB0dXRhbm90YTc5OiBPZmZsaW5lTWlncmF0aW9uID0ge1xuXHRhcHA6IFwidHV0YW5vdGFcIixcblx0dmVyc2lvbjogNzksXG5cdGFzeW5jIG1pZ3JhdGUoc3RvcmFnZTogT2ZmbGluZVN0b3JhZ2UpIHtcblx0XHRhd2FpdCBtaWdyYXRlQWxsRWxlbWVudHMoTWFpbEJveFR5cGVSZWYsIHN0b3JhZ2UsIFthZGRWYWx1ZShcImltcG9ydGVkQXR0YWNobWVudHNcIiwgR0VORVJBVEVEX01JTl9JRCksIGFkZFZhbHVlKFwibWFpbEltcG9ydFN0YXRlc1wiLCBHRU5FUkFURURfTUlOX0lEKV0pXG5cdH0sXG59XG4iLCJpbXBvcnQgeyBPZmZsaW5lU3RvcmFnZSB9IGZyb20gXCIuLi9PZmZsaW5lU3RvcmFnZS5qc1wiXG5pbXBvcnQgeyBTcWxDaXBoZXJGYWNhZGUgfSBmcm9tIFwiLi4vLi4vLi4vLi4vbmF0aXZlL2NvbW1vbi9nZW5lcmF0ZWRpcGMvU3FsQ2lwaGVyRmFjYWRlLmpzXCJcbmltcG9ydCB7IE9mZmxpbmVNaWdyYXRpb24gfSBmcm9tIFwiLi4vT2ZmbGluZVN0b3JhZ2VNaWdyYXRvci5qc1wiXG5pbXBvcnQgeyBNYWlsQm94VHlwZVJlZiwgVXNlclNldHRpbmdzR3JvdXBSb290VHlwZVJlZiB9IGZyb20gXCIuLi8uLi8uLi9lbnRpdGllcy90dXRhbm90YS9UeXBlUmVmc1wiXG5pbXBvcnQgeyBHRU5FUkFURURfTUlOX0lELCBnZXRFbGVtZW50SWQsIGdldExpc3RJZCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vdXRpbHMvRW50aXR5VXRpbHNcIlxuaW1wb3J0IHsgR3JvdXBJbmZvVHlwZVJlZiB9IGZyb20gXCIuLi8uLi8uLi9lbnRpdGllcy9zeXMvVHlwZVJlZnNcIlxuaW1wb3J0IHsgZGVsZXRlSW5zdGFuY2VzT2ZUeXBlIH0gZnJvbSBcIi4uL1N0YW5kYXJkTWlncmF0aW9uc1wiXG5pbXBvcnQgeyBHcm91cFR5cGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL1R1dGFub3RhQ29uc3RhbnRzXCJcblxuLyoqXG4gKiBNaWdyYXRpb24gdG8gcmUtZG93bmxvYWQgbWFpbGJveGVzIHdpdGggaW1wb3J0TWFpbFN0YXRlcyBhbmQgaW1wb3J0ZWRBdHRhY2htZW50XG4gKiBsaXN0cyBwb2ludGluZyB0byBhIHdyb25nIHZhbHVlLlxuICovXG5leHBvcnQgY29uc3Qgb2ZmbGluZTM6IE9mZmxpbmVNaWdyYXRpb24gPSB7XG5cdGFwcDogXCJvZmZsaW5lXCIsXG5cdHZlcnNpb246IDMsXG5cdGFzeW5jIG1pZ3JhdGUoc3RvcmFnZTogT2ZmbGluZVN0b3JhZ2UsIF86IFNxbENpcGhlckZhY2FkZSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGxldCBtYWlsYm94ZXMgPSBhd2FpdCBzdG9yYWdlLmdldEVsZW1lbnRzT2ZUeXBlKE1haWxCb3hUeXBlUmVmKVxuXHRcdGxldCBuZWVkc09mZmxpbmVEaXNhYmxlID0gZmFsc2Vcblx0XHRmb3IgKGNvbnN0IG1haWxib3ggb2YgbWFpbGJveGVzKSB7XG5cdFx0XHRpZiAobWFpbGJveC5pbXBvcnRlZEF0dGFjaG1lbnRzICE9PSBHRU5FUkFURURfTUlOX0lEICYmIG1haWxib3gubWFpbEltcG9ydFN0YXRlcyAhPT0gR0VORVJBVEVEX01JTl9JRCkge1xuXHRcdFx0XHRjb250aW51ZVxuXHRcdFx0fVxuXHRcdFx0Ly8gZGVsZXRlIHRoZSBvZmZlbmRpbmcgaW5zdGFuY2Vcblx0XHRcdGF3YWl0IHN0b3JhZ2UuZGVsZXRlSWZFeGlzdHMoTWFpbEJveFR5cGVSZWYsIG51bGwsIG1haWxib3guX2lkKVxuXHRcdFx0bmVlZHNPZmZsaW5lRGlzYWJsZSA9IHRydWVcblx0XHR9XG5cblx0XHRpZiAobmVlZHNPZmZsaW5lRGlzYWJsZSkge1xuXHRcdFx0Ly8gYWxzbyBwcmV2ZW50IHRoZSB1c2VyJ3Mgb2ZmbGluZSBsb2dpbiBmcm9tIHJlcXVlc3RpbmcgdGhlIG1haWxib3hcblx0XHRcdC8vIGJlZm9yZSBpdCdzIGZ1bGx5IGxvZ2dlZCBpblxuXHRcdFx0YXdhaXQgZGVsZXRlSW5zdGFuY2VzT2ZUeXBlKHN0b3JhZ2UsIFVzZXJTZXR0aW5nc0dyb3VwUm9vdFR5cGVSZWYpXG5cdFx0XHQvLyByZXF1aXJlZCB0byB0aHJvdyB0aGUgTG9naW5JbmNvbXBsZXRlRXJyb3Igd2hlbiB0cnlpbmcgYXN5bmMgbG9naW5cblx0XHRcdGNvbnN0IGdyb3VwSW5mb3MgPSBhd2FpdCBzdG9yYWdlLmdldFJhd0xpc3RFbGVtZW50c09mVHlwZShHcm91cEluZm9UeXBlUmVmKVxuXHRcdFx0Zm9yIChjb25zdCBncm91cEluZm8gb2YgZ3JvdXBJbmZvcykge1xuXHRcdFx0XHRpZiAoKGdyb3VwSW5mbyBhcyBhbnkpLmdyb3VwVHlwZSAhPT0gR3JvdXBUeXBlLlVzZXIpIGNvbnRpbnVlXG5cdFx0XHRcdGF3YWl0IHN0b3JhZ2UuZGVsZXRlSWZFeGlzdHMoR3JvdXBJbmZvVHlwZVJlZiwgZ2V0TGlzdElkKGdyb3VwSW5mbyksIGdldEVsZW1lbnRJZChncm91cEluZm8pKVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcbn1cbiIsImltcG9ydCB7IE9mZmxpbmVNaWdyYXRpb24gfSBmcm9tIFwiLi4vT2ZmbGluZVN0b3JhZ2VNaWdyYXRvci5qc1wiXG5pbXBvcnQgeyBPZmZsaW5lU3RvcmFnZSB9IGZyb20gXCIuLi9PZmZsaW5lU3RvcmFnZS5qc1wiXG5pbXBvcnQgeyBtaWdyYXRlQWxsTGlzdEVsZW1lbnRzIH0gZnJvbSBcIi4uL1N0YW5kYXJkTWlncmF0aW9ucy5qc1wiXG5pbXBvcnQgeyBDYWxlbmRhckV2ZW50LCBDYWxlbmRhckV2ZW50VHlwZVJlZiB9IGZyb20gXCIuLi8uLi8uLi9lbnRpdGllcy90dXRhbm90YS9UeXBlUmVmcy5qc1wiXG5cbmV4cG9ydCBjb25zdCBzeXMxMTg6IE9mZmxpbmVNaWdyYXRpb24gPSB7XG5cdGFwcDogXCJzeXNcIixcblx0dmVyc2lvbjogMTE4LFxuXHRhc3luYyBtaWdyYXRlKHN0b3JhZ2U6IE9mZmxpbmVTdG9yYWdlKSB7XG5cdFx0YXdhaXQgbWlncmF0ZUFsbExpc3RFbGVtZW50cyhDYWxlbmRhckV2ZW50VHlwZVJlZiwgc3RvcmFnZSwgW1xuXHRcdFx0KGNhbGVuZGFyRXZlbnQ6IENhbGVuZGFyRXZlbnQpID0+IHtcblx0XHRcdFx0aWYgKGNhbGVuZGFyRXZlbnQucmVwZWF0UnVsZSkge1xuXHRcdFx0XHRcdGNhbGVuZGFyRXZlbnQucmVwZWF0UnVsZS5hZHZhbmNlZFJ1bGVzID0gW11cblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gY2FsZW5kYXJFdmVudFxuXHRcdFx0fSxcblx0XHRdKVxuXHR9LFxufVxuIiwiaW1wb3J0IHsgT2ZmbGluZU1pZ3JhdGlvbiB9IGZyb20gXCIuLi9PZmZsaW5lU3RvcmFnZU1pZ3JhdG9yLmpzXCJcbmltcG9ydCB7IE9mZmxpbmVTdG9yYWdlIH0gZnJvbSBcIi4uL09mZmxpbmVTdG9yYWdlLmpzXCJcbmltcG9ydCB7IG1pZ3JhdGVBbGxMaXN0RWxlbWVudHMgfSBmcm9tIFwiLi4vU3RhbmRhcmRNaWdyYXRpb25zXCJcbmltcG9ydCB7IENhbGVuZGFyRXZlbnQsIENhbGVuZGFyRXZlbnRUeXBlUmVmLCBNYWlsQm94VHlwZVJlZiB9IGZyb20gXCIuLi8uLi8uLi9lbnRpdGllcy90dXRhbm90YS9UeXBlUmVmc1wiXG5cbmV4cG9ydCBjb25zdCB0dXRhbm90YTgwOiBPZmZsaW5lTWlncmF0aW9uID0ge1xuXHRhcHA6IFwidHV0YW5vdGFcIixcblx0dmVyc2lvbjogODAsXG5cdGFzeW5jIG1pZ3JhdGUoc3RvcmFnZTogT2ZmbGluZVN0b3JhZ2UpIHtcblx0XHRhd2FpdCBtaWdyYXRlQWxsTGlzdEVsZW1lbnRzKENhbGVuZGFyRXZlbnRUeXBlUmVmLCBzdG9yYWdlLCBbXG5cdFx0XHQoY2FsZW5kYXJFdmVudDogQ2FsZW5kYXJFdmVudCkgPT4ge1xuXHRcdFx0XHRpZiAoY2FsZW5kYXJFdmVudC5yZXBlYXRSdWxlKSB7XG5cdFx0XHRcdFx0Y2FsZW5kYXJFdmVudC5yZXBlYXRSdWxlLmFkdmFuY2VkUnVsZXMgPSBbXVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBjYWxlbmRhckV2ZW50XG5cdFx0XHR9LFxuXHRcdF0pXG5cdH0sXG59XG4iLCJpbXBvcnQgeyBPZmZsaW5lTWlncmF0aW9uIH0gZnJvbSBcIi4uL09mZmxpbmVTdG9yYWdlTWlncmF0b3IuanNcIlxuaW1wb3J0IHsgT2ZmbGluZVN0b3JhZ2UgfSBmcm9tIFwiLi4vT2ZmbGluZVN0b3JhZ2UuanNcIlxuXG5leHBvcnQgY29uc3Qgc3RvcmFnZTExOiBPZmZsaW5lTWlncmF0aW9uID0ge1xuXHRhcHA6IFwic3RvcmFnZVwiLFxuXHR2ZXJzaW9uOiAxMSxcblx0YXN5bmMgbWlncmF0ZShzdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSkge30sXG59XG4iLCJpbXBvcnQgeyBPZmZsaW5lTWlncmF0aW9uIH0gZnJvbSBcIi4uL09mZmxpbmVTdG9yYWdlTWlncmF0b3IuanNcIlxuaW1wb3J0IHsgT2ZmbGluZVN0b3JhZ2UgfSBmcm9tIFwiLi4vT2ZmbGluZVN0b3JhZ2UuanNcIlxuaW1wb3J0IHsgZGVsZXRlSW5zdGFuY2VzT2ZUeXBlIH0gZnJvbSBcIi4uL1N0YW5kYXJkTWlncmF0aW9ucy5qc1wiXG5pbXBvcnQgeyBDdXN0b21lckluZm9UeXBlUmVmIH0gZnJvbSBcIi4uLy4uLy4uL2VudGl0aWVzL3N5cy9UeXBlUmVmc1wiXG5cbmV4cG9ydCBjb25zdCBzeXMxMTk6IE9mZmxpbmVNaWdyYXRpb24gPSB7XG5cdGFwcDogXCJzeXNcIixcblx0dmVyc2lvbjogMTE5LFxuXHRhc3luYyBtaWdyYXRlKHN0b3JhZ2U6IE9mZmxpbmVTdG9yYWdlKSB7XG5cdFx0YXdhaXQgZGVsZXRlSW5zdGFuY2VzT2ZUeXBlKHN0b3JhZ2UsIEN1c3RvbWVySW5mb1R5cGVSZWYpXG5cdH0sXG59XG4iLCJpbXBvcnQgeyBPZmZsaW5lTWlncmF0aW9uIH0gZnJvbSBcIi4uL09mZmxpbmVTdG9yYWdlTWlncmF0b3IuanNcIlxuaW1wb3J0IHsgT2ZmbGluZVN0b3JhZ2UgfSBmcm9tIFwiLi4vT2ZmbGluZVN0b3JhZ2UuanNcIlxuaW1wb3J0IHsgbWlncmF0ZUFsbEVsZW1lbnRzLCBtaWdyYXRlQWxsTGlzdEVsZW1lbnRzLCByZW1vdmVWYWx1ZSB9IGZyb20gXCIuLi9TdGFuZGFyZE1pZ3JhdGlvbnMuanNcIlxuaW1wb3J0IHsgR3JvdXBJbmZvVHlwZVJlZiwgR3JvdXBUeXBlUmVmIH0gZnJvbSBcIi4uLy4uLy4uL2VudGl0aWVzL3N5cy9UeXBlUmVmcy5qc1wiXG5cbmV4cG9ydCBjb25zdCBzeXMxMjA6IE9mZmxpbmVNaWdyYXRpb24gPSB7XG5cdGFwcDogXCJzeXNcIixcblx0dmVyc2lvbjogMTIwLFxuXHRhc3luYyBtaWdyYXRlKHN0b3JhZ2U6IE9mZmxpbmVTdG9yYWdlKSB7XG5cdFx0YXdhaXQgbWlncmF0ZUFsbExpc3RFbGVtZW50cyhHcm91cEluZm9UeXBlUmVmLCBzdG9yYWdlLCBbcmVtb3ZlVmFsdWUoXCJsb2NhbEFkbWluXCIpXSlcblx0XHRhd2FpdCBtaWdyYXRlQWxsRWxlbWVudHMoR3JvdXBUeXBlUmVmLCBzdG9yYWdlLCBbcmVtb3ZlVmFsdWUoXCJhZG1pbmlzdHJhdGVkR3JvdXBzXCIpXSlcblx0fSxcbn1cbiIsImltcG9ydCB7IE9mZmxpbmVNaWdyYXRpb24gfSBmcm9tIFwiLi4vT2ZmbGluZVN0b3JhZ2VNaWdyYXRvci5qc1wiXG5pbXBvcnQgeyBPZmZsaW5lU3RvcmFnZSB9IGZyb20gXCIuLi9PZmZsaW5lU3RvcmFnZS5qc1wiXG5pbXBvcnQgeyBtaWdyYXRlQWxsTGlzdEVsZW1lbnRzLCByZW1vdmVWYWx1ZSB9IGZyb20gXCIuLi9TdGFuZGFyZE1pZ3JhdGlvbnNcIlxuaW1wb3J0IHsgTWFpbEZvbGRlclR5cGVSZWYgfSBmcm9tIFwiLi4vLi4vLi4vZW50aXRpZXMvdHV0YW5vdGEvVHlwZVJlZnNcIlxuXG5leHBvcnQgY29uc3QgdHV0YW5vdGE4MzogT2ZmbGluZU1pZ3JhdGlvbiA9IHtcblx0YXBwOiBcInR1dGFub3RhXCIsXG5cdHZlcnNpb246IDgzLFxuXHRhc3luYyBtaWdyYXRlKHN0b3JhZ2U6IE9mZmxpbmVTdG9yYWdlKSB7XG5cdFx0YXdhaXQgbWlncmF0ZUFsbExpc3RFbGVtZW50cyhNYWlsRm9sZGVyVHlwZVJlZiwgc3RvcmFnZSwgW3JlbW92ZVZhbHVlKFwibWFpbHNcIiksIHJlbW92ZVZhbHVlKFwiaXNNYWlsU2V0XCIpXSlcblx0fSxcbn1cbiIsImltcG9ydCB7IE9mZmxpbmVNaWdyYXRpb24gfSBmcm9tIFwiLi4vT2ZmbGluZVN0b3JhZ2VNaWdyYXRvci5qc1wiXG5pbXBvcnQgeyBPZmZsaW5lU3RvcmFnZSB9IGZyb20gXCIuLi9PZmZsaW5lU3RvcmFnZS5qc1wiXG5cbmV4cG9ydCBjb25zdCBzeXMxMjE6IE9mZmxpbmVNaWdyYXRpb24gPSB7XG5cdGFwcDogXCJzeXNcIixcblx0dmVyc2lvbjogMTIxLFxuXHRhc3luYyBtaWdyYXRlKHN0b3JhZ2U6IE9mZmxpbmVTdG9yYWdlKSB7fSxcbn1cbiIsImltcG9ydCB7IE9mZmxpbmVEYk1ldGEsIE9mZmxpbmVTdG9yYWdlLCBWZXJzaW9uTWV0YWRhdGFCYXNlS2V5IH0gZnJvbSBcIi4vT2ZmbGluZVN0b3JhZ2UuanNcIlxuaW1wb3J0IHsgTW9kZWxJbmZvcyB9IGZyb20gXCIuLi8uLi9jb21tb24vRW50aXR5RnVuY3Rpb25zLmpzXCJcbmltcG9ydCB7IGFzc2VydE5vdE51bGwsIHR5cGVkRW50cmllcywgdHlwZWRLZXlzIH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5pbXBvcnQgeyBQcm9ncmFtbWluZ0Vycm9yIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9lcnJvci9Qcm9ncmFtbWluZ0Vycm9yLmpzXCJcbmltcG9ydCB7IFNxbENpcGhlckZhY2FkZSB9IGZyb20gXCIuLi8uLi8uLi9uYXRpdmUvY29tbW9uL2dlbmVyYXRlZGlwYy9TcWxDaXBoZXJGYWNhZGUuanNcIlxuaW1wb3J0IHsgT3V0T2ZTeW5jRXJyb3IgfSBmcm9tIFwiLi4vLi4vY29tbW9uL2Vycm9yL091dE9mU3luY0Vycm9yLmpzXCJcbmltcG9ydCB7IHN5czk0IH0gZnJvbSBcIi4vbWlncmF0aW9ucy9zeXMtdjk0LmpzXCJcbmltcG9ydCB7IHR1dGFub3RhNjYgfSBmcm9tIFwiLi9taWdyYXRpb25zL3R1dGFub3RhLXY2Ni5qc1wiXG5pbXBvcnQgeyBzeXM5MiB9IGZyb20gXCIuL21pZ3JhdGlvbnMvc3lzLXY5Mi5qc1wiXG5pbXBvcnQgeyB0dXRhbm90YTY1IH0gZnJvbSBcIi4vbWlncmF0aW9ucy90dXRhbm90YS12NjUuanNcIlxuaW1wb3J0IHsgc3lzOTEgfSBmcm9tIFwiLi9taWdyYXRpb25zL3N5cy12OTEuanNcIlxuaW1wb3J0IHsgc3lzOTAgfSBmcm9tIFwiLi9taWdyYXRpb25zL3N5cy12OTAuanNcIlxuaW1wb3J0IHsgdHV0YW5vdGE2NCB9IGZyb20gXCIuL21pZ3JhdGlvbnMvdHV0YW5vdGEtdjY0LmpzXCJcbmltcG9ydCB7IHR1dGFub3RhNjcgfSBmcm9tIFwiLi9taWdyYXRpb25zL3R1dGFub3RhLXY2Ny5qc1wiXG5pbXBvcnQgeyBzeXM5NiB9IGZyb20gXCIuL21pZ3JhdGlvbnMvc3lzLXY5Ni5qc1wiXG5pbXBvcnQgeyB0dXRhbm90YTY5IH0gZnJvbSBcIi4vbWlncmF0aW9ucy90dXRhbm90YS12NjkuanNcIlxuaW1wb3J0IHsgc3lzOTcgfSBmcm9tIFwiLi9taWdyYXRpb25zL3N5cy12OTcuanNcIlxuaW1wb3J0IHsgdHV0YW5vdGE3MSB9IGZyb20gXCIuL21pZ3JhdGlvbnMvdHV0YW5vdGEtdjcxLmpzXCJcbmltcG9ydCB7IHN5czk5IH0gZnJvbSBcIi4vbWlncmF0aW9ucy9zeXMtdjk5LmpzXCJcbmltcG9ydCB7IHN5czEwMSB9IGZyb20gXCIuL21pZ3JhdGlvbnMvc3lzLXYxMDEuanNcIlxuaW1wb3J0IHsgc3lzMTAyIH0gZnJvbSBcIi4vbWlncmF0aW9ucy9zeXMtdjEwMi5qc1wiXG5pbXBvcnQgeyB0dXRhbm90YTcyIH0gZnJvbSBcIi4vbWlncmF0aW9ucy90dXRhbm90YS12NzIuanNcIlxuaW1wb3J0IHsgc3lzMTAzIH0gZnJvbSBcIi4vbWlncmF0aW9ucy9zeXMtdjEwMy5qc1wiXG5pbXBvcnQgeyB0dXRhbm90YTczIH0gZnJvbSBcIi4vbWlncmF0aW9ucy90dXRhbm90YS12NzMuanNcIlxuaW1wb3J0IHsgc3lzMTA0IH0gZnJvbSBcIi4vbWlncmF0aW9ucy9zeXMtdjEwNC5qc1wiXG5pbXBvcnQgeyBzeXMxMDUgfSBmcm9tIFwiLi9taWdyYXRpb25zL3N5cy12MTA1LmpzXCJcbmltcG9ydCB7IHN5czEwNiB9IGZyb20gXCIuL21pZ3JhdGlvbnMvc3lzLXYxMDYuanNcIlxuaW1wb3J0IHsgdHV0YW5vdGE3NCB9IGZyb20gXCIuL21pZ3JhdGlvbnMvdHV0YW5vdGEtdjc0LmpzXCJcbmltcG9ydCB7IHN5czEwNyB9IGZyb20gXCIuL21pZ3JhdGlvbnMvc3lzLXYxMDcuanNcIlxuaW1wb3J0IHsgdHV0YW5vdGE3NSB9IGZyb20gXCIuL21pZ3JhdGlvbnMvdHV0YW5vdGEtdjc1LmpzXCJcbmltcG9ydCB7IHN5czExMSB9IGZyb20gXCIuL21pZ3JhdGlvbnMvc3lzLXYxMTEuanNcIlxuaW1wb3J0IHsgdHV0YW5vdGE3NiB9IGZyb20gXCIuL21pZ3JhdGlvbnMvdHV0YW5vdGEtdjc2LmpzXCJcbmltcG9ydCB7IHN5czExMiB9IGZyb20gXCIuL21pZ3JhdGlvbnMvc3lzLXYxMTIuanNcIlxuaW1wb3J0IHsgdHV0YW5vdGE3NyB9IGZyb20gXCIuL21pZ3JhdGlvbnMvdHV0YW5vdGEtdjc3LmpzXCJcbmltcG9ydCB7IHN5czExNCB9IGZyb20gXCIuL21pZ3JhdGlvbnMvc3lzLXYxMTQuanNcIlxuaW1wb3J0IHsgb2ZmbGluZTIgfSBmcm9tIFwiLi9taWdyYXRpb25zL29mZmxpbmUyLmpzXCJcbmltcG9ydCB7IHN5czExNSB9IGZyb20gXCIuL21pZ3JhdGlvbnMvc3lzLXYxMTUuanNcIlxuaW1wb3J0IHsgdHV0YW5vdGE3OCB9IGZyb20gXCIuL21pZ3JhdGlvbnMvdHV0YW5vdGEtdjc4LmpzXCJcbmltcG9ydCB7IHN5czExNiB9IGZyb20gXCIuL21pZ3JhdGlvbnMvc3lzLXYxMTYuanNcIlxuaW1wb3J0IHsgdHV0YW5vdGE3OSB9IGZyb20gXCIuL21pZ3JhdGlvbnMvdHV0YW5vdGEtdjc5LmpzXCJcbmltcG9ydCB7IG9mZmxpbmUzIH0gZnJvbSBcIi4vbWlncmF0aW9ucy9vZmZsaW5lM1wiXG5pbXBvcnQgeyBzeXMxMTggfSBmcm9tIFwiLi9taWdyYXRpb25zL3N5cy12MTE4LmpzXCJcbmltcG9ydCB7IHR1dGFub3RhODAgfSBmcm9tIFwiLi9taWdyYXRpb25zL3R1dGFub3RhLXY4MC5qc1wiXG5pbXBvcnQgeyBzdG9yYWdlMTEgfSBmcm9tIFwiLi9taWdyYXRpb25zL3N0b3JhZ2UtdjExLmpzXCJcbmltcG9ydCB7IHN5czExOSB9IGZyb20gXCIuL21pZ3JhdGlvbnMvc3lzLXYxMTkuanNcIlxuaW1wb3J0IHsgc3lzMTIwIH0gZnJvbSBcIi4vbWlncmF0aW9ucy9zeXMtdjEyMC5qc1wiXG5pbXBvcnQgeyB0dXRhbm90YTgzIH0gZnJvbSBcIi4vbWlncmF0aW9ucy90dXRhbm90YS12ODMuanNcIlxuaW1wb3J0IHsgc3lzMTIxIH0gZnJvbSBcIi4vbWlncmF0aW9ucy9zeXMtdjEyMS5qc1wiXG5cbmV4cG9ydCBpbnRlcmZhY2UgT2ZmbGluZU1pZ3JhdGlvbiB7XG5cdHJlYWRvbmx5IGFwcDogVmVyc2lvbk1ldGFkYXRhQmFzZUtleVxuXHRyZWFkb25seSB2ZXJzaW9uOiBudW1iZXJcblxuXHRtaWdyYXRlKHN0b3JhZ2U6IE9mZmxpbmVTdG9yYWdlLCBzcWxDaXBoZXJGYWNhZGU6IFNxbENpcGhlckZhY2FkZSk6IFByb21pc2U8dm9pZD5cbn1cblxuLyoqXG4gKiBMaXN0IG9mIG1pZ3JhdGlvbnMgdGhhdCB3aWxsIGJlIHJ1biB3aGVuIG5lZWRlZC4gUGxlYXNlIGFkZCB5b3VyIG1pZ3JhdGlvbnMgdG8gdGhlIGxpc3QuXG4gKlxuICogTm9ybWFsbHkgeW91IHNob3VsZCBvbmx5IGFkZCB0aGVtIHRvIHRoZSBlbmQgb2YgdGhlIGxpc3QgYnV0IHdpdGggb2ZmbGluZSBvbmVzIGl0IGNhbiBiZSBhIGJpdCB0cmlja3kgc2luY2UgdGhleSBjaGFuZ2UgdGhlIGRiIHN0cnVjdHVyZSBpdHNlbGYgc28gc29tZXRpbWVzXG4gKiB0aGV5IHNob3VsZCByYXRoZXIgYmUgaW4gdGhlIGJlZ2lubmluZy5cbiAqL1xuZXhwb3J0IGNvbnN0IE9GRkxJTkVfU1RPUkFHRV9NSUdSQVRJT05TOiBSZWFkb25seUFycmF5PE9mZmxpbmVNaWdyYXRpb24+ID0gW1xuXHRzeXM5MCxcblx0dHV0YW5vdGE2NCxcblx0c3lzOTEsXG5cdHR1dGFub3RhNjUsXG5cdHN5czkyLFxuXHR0dXRhbm90YTY2LFxuXHRzeXM5NCxcblx0dHV0YW5vdGE2Nyxcblx0c3lzOTYsXG5cdHR1dGFub3RhNjksXG5cdHN5czk3LFxuXHR0dXRhbm90YTcxLFxuXHRzeXM5OSxcblx0c3lzMTAxLFxuXHRzeXMxMDIsXG5cdHR1dGFub3RhNzIsXG5cdHN5czEwMyxcblx0dHV0YW5vdGE3Myxcblx0c3lzMTA0LFxuXHRzeXMxMDUsXG5cdHN5czEwNixcblx0dHV0YW5vdGE3NCxcblx0dHV0YW5vdGE3NSxcblx0c3lzMTA3LFxuXHR0dXRhbm90YTc1LFxuXHRzeXMxMTEsXG5cdHR1dGFub3RhNzYsXG5cdHN5czExMixcblx0dHV0YW5vdGE3Nyxcblx0c3lzMTE0LFxuXHRvZmZsaW5lMixcblx0c3lzMTE1LFxuXHR0dXRhbm90YTc4LFxuXHRzeXMxMTYsXG5cdHR1dGFub3RhNzksXG5cdG9mZmxpbmUzLFxuXHRzeXMxMTgsXG5cdHR1dGFub3RhODAsXG5cdHN0b3JhZ2UxMSxcblx0c3lzMTE5LFxuXHRzeXMxMjAsXG5cdHR1dGFub3RhODMsXG5cdHN5czEyMSxcbl1cblxuLy8gaW4gY2FzZXMgd2hlcmUgdGhlIGFjdHVhbCBtaWdyYXRpb24gaXMgbm90IHRoZXJlIGFueW1vcmUgKHdlIGNsZWFuIHVwIG9sZCBtaWdyYXRpb25zIG5vIGNsaWVudCB3b3VsZCBhcHBseSBhbnltb3JlKVxuLy8gYW5kIHdlIGNyZWF0ZSBhIG5ldyBvZmZsaW5lIGRhdGFiYXNlLCB3ZSBzdGlsbCBuZWVkIHRvIHNldCB0aGUgb2ZmbGluZSB2ZXJzaW9uIHRvIHRoZSBjdXJyZW50IHZhbHVlLlxuY29uc3QgQ1VSUkVOVF9PRkZMSU5FX1ZFUlNJT04gPSAzXG5cbi8qKlxuICogTWlncmF0b3IgZm9yIHRoZSBvZmZsaW5lIHN0b3JhZ2UgYmV0d2VlbiBkaWZmZXJlbnQgdmVyc2lvbnMgb2YgbW9kZWwuIEl0IGlzIHRpZ2h0bHkgY291cGxlcyB0byB0aGUgdmVyc2lvbnMgb2YgQVBJIGVudGl0aWVzOiBldmVyeSB0aW1lIHdlIG1ha2UgYW5cbiAqIFwiaW5jb21wYXRpYmxlXCIgY2hhbmdlIHRvIHRoZSBBUEkgbW9kZWwgd2UgbmVlZCB0byB1cGRhdGUgb2ZmbGluZSBkYXRhYmFzZSBzb21laG93LlxuICpcbiAqIE1pZ3JhdGlvbnMgYXJlIGRvbmUgbWFudWFsbHkgYnV0IHRoZXJlIGFyZSBhIGZldyBjaGVja3MgZG9uZTpcbiAqICAtIGNvbXBpbGUgdGltZSBjaGVjayB0aGF0IG1pZ3JhdGlvbiBleGlzdHMgYW5kIGlzIHVzZWQgaW4gdGhpcyBmaWxlXG4gKiAgLSBydW50aW1lIGNoZWNrIHRoYXQgcnVudGltZSBtb2RlbCBpcyBjb21wYXRpYmxlIHRvIHRoZSBzdG9yZWQgb25lIGFmdGVyIGFsbCB0aGUgbWlncmF0aW9ucyBhcmUgZG9uZS5cbiAqXG4gKiAgVG8gYWRkIGEgbmV3IG1pZ3JhdGlvbiBjcmVhdGUgYSBtaWdyYXRpb24gd2l0aCB0aGUgZmlsZW5hbWUgbWF0Y2hpbmcgLi9taWdyYXRpb25zL3thcHB9LXZ7dmVyc2lvbn0udHMgYW5kIHVzZSBpdCBpbiB0aGUgYG1pZ3JhdGlvbnNgIGZpZWxkIG9uIHRoaXNcbiAqICBtaWdyYXRvci5cbiAqXG4gKiAgTWlncmF0aW9ucyBtaWdodCByZWFkIGFuZCB3cml0ZSB0byB0aGUgZGF0YWJhc2UgYW5kIHRoZXkgc2hvdWxkIHVzZSBTdGFuZGFyZE1pZ3JhdGlvbnMgd2hlbiBuZWVkZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBPZmZsaW5lU3RvcmFnZU1pZ3JhdG9yIHtcblx0Y29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBtaWdyYXRpb25zOiBSZWFkb25seUFycmF5PE9mZmxpbmVNaWdyYXRpb24+LCBwcml2YXRlIHJlYWRvbmx5IG1vZGVsSW5mb3M6IE1vZGVsSW5mb3MpIHt9XG5cblx0YXN5bmMgbWlncmF0ZShzdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSwgc3FsQ2lwaGVyRmFjYWRlOiBTcWxDaXBoZXJGYWNhZGUpIHtcblx0XHRjb25zdCBtZXRhID0gYXdhaXQgc3RvcmFnZS5kdW1wTWV0YWRhdGEoKVxuXG5cdFx0Ly8gV2UgZGlkIG5vdCB3cml0ZSBkb3duIHRoZSBcIm9mZmxpbmVcIiB2ZXJzaW9uIGZyb20gdGhlIGJlZ2lubmluZywgc28gd2UgbmVlZCB0byBmaWd1cmUgb3V0IGlmIHdlIG5lZWQgdG8gcnVuIHRoZSBtaWdyYXRpb24gZm9yIHRoZSBkYiBzdHJ1Y3R1cmUgb3Jcblx0XHQvLyBub3QuIFByZXZpb3VzbHkgd2UndmUgYmVlbiBjaGVja2luZyB0aGF0IHRoZXJlJ3Mgc29tZXRoaW5nIGluIHRoZSBtZXRhIHRhYmxlIHdoaWNoIGlzIGEgcHJldHR5IGRlY2VudCBjaGVjay4gVW5mb3J0dW5hdGVseSB3ZSBoYWQgbXVsdGlwbGUgYnVnc1xuXHRcdC8vIHdoaWNoIHJlc3VsdGVkIGluIGEgc3RhdGUgd2hlcmUgd2Ugd291bGQgcmUtY3JlYXRlIHRoZSBvZmZsaW5lIGRiIGJ1dCBub3QgcG9wdWxhdGUgdGhlIG1ldGEgdGFibGUgd2l0aCB0aGUgdmVyc2lvbnMsIHRoZSBvbmx5IHRoaW5nIHRoYXQgd291bGQgYmVcblx0XHQvLyB3cml0dGVuIGlzIGxhc3RVcGRhdGVUaW1lLlxuXHRcdC8vIHt9ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLT4gbmV3IGRiLCBkbyBub3QgbWlncmF0ZSBvZmZsaW5lXG5cdFx0Ly8ge1wiYmFzZS12ZXJzaW9uXCI6IDEsIFwibGFzdFVwZGF0ZVRpbWVcIjogMTIzLCBcIm9mZmxpbmUtdmVyc2lvblwiOiAxfSAtPiB1cC10by1kYXRlIGRiLCBkbyBub3QgbWlncmF0ZSBvZmZsaW5lXG5cdFx0Ly8ge1wibGFzdFVwZGF0ZVRpbWVcIjogMTIzfSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0+IGJyb2tlbiBzdGF0ZSBhZnRlciB0aGUgYnVnZ3kgcmVjcmVhdGlvbiBvZiBkYiwgZGVsZXRlIHRoZSBkYlxuXHRcdC8vIHtcImJhc2UtdmVyc2lvblwiOiAxLCBcImxhc3RVcGRhdGVUaW1lXCI6IDEyM30gICAgICAgICAgICAgICAgICAgICAgIC0+IHNvbWUgdmVyeSBvbGQgc3RhdGUgd2hlcmUgd2Ugd291bGQgYWN0dWFsbHkgaGF2ZSB0byBtaWdyYXRlIG9mZmxpbmVcblx0XHRpZiAoT2JqZWN0LmtleXMobWV0YSkubGVuZ3RoID09PSAxICYmIG1ldGEubGFzdFVwZGF0ZVRpbWUgIT0gbnVsbCkge1xuXHRcdFx0dGhyb3cgbmV3IE91dE9mU3luY0Vycm9yKFwiSW52YWxpZCBEQiBzdGF0ZSwgbWlzc2luZyBtb2RlbCB2ZXJzaW9uc1wiKVxuXHRcdH1cblxuXHRcdGNvbnN0IHBvcHVsYXRlZE1ldGEgPSBhd2FpdCB0aGlzLnBvcHVsYXRlTW9kZWxWZXJzaW9ucyhtZXRhLCBzdG9yYWdlKVxuXG5cdFx0aWYgKHRoaXMuaXNEYk5ld2VyVGhhbkN1cnJlbnRDbGllbnQocG9wdWxhdGVkTWV0YSkpIHtcblx0XHRcdHRocm93IG5ldyBPdXRPZlN5bmNFcnJvcihgb2ZmbGluZSBkYXRhYmFzZSBoYXMgbmV3ZXIgc2NoZW1hIHRoYW4gY2xpZW50YClcblx0XHR9XG5cblx0XHRhd2FpdCB0aGlzLnJ1bk1pZ3JhdGlvbnMobWV0YSwgc3RvcmFnZSwgc3FsQ2lwaGVyRmFjYWRlKVxuXHRcdGF3YWl0IHRoaXMuY2hlY2tTdGF0ZUFmdGVyTWlncmF0aW9ucyhzdG9yYWdlKVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBjaGVja1N0YXRlQWZ0ZXJNaWdyYXRpb25zKHN0b3JhZ2U6IE9mZmxpbmVTdG9yYWdlKSB7XG5cdFx0Ly8gQ2hlY2sgdGhhdCBhbGwgdGhlIG5lY2Vzc2FyeSBtaWdyYXRpb25zIGhhdmUgYmVlbiBydW4sIGF0IGxlYXN0IHRvIHRoZSBwb2ludCB3aGVyZSB3ZSBhcmUgY29tcGF0aWJsZS5cblx0XHRjb25zdCBtZXRhID0gYXdhaXQgc3RvcmFnZS5kdW1wTWV0YWRhdGEoKVxuXHRcdGZvciAoY29uc3QgYXBwIG9mIHR5cGVkS2V5cyh0aGlzLm1vZGVsSW5mb3MpKSB7XG5cdFx0XHRjb25zdCBjb21wYXRpYmxlU2luY2UgPSB0aGlzLm1vZGVsSW5mb3NbYXBwXS5jb21wYXRpYmxlU2luY2Vcblx0XHRcdGxldCBtZXRhVmVyc2lvbiA9IG1ldGFbYCR7YXBwfS12ZXJzaW9uYF0hXG5cdFx0XHRpZiAobWV0YVZlcnNpb24gPCBjb21wYXRpYmxlU2luY2UpIHtcblx0XHRcdFx0dGhyb3cgbmV3IFByb2dyYW1taW5nRXJyb3IoXG5cdFx0XHRcdFx0YFlvdSBmb3Jnb3QgdG8gbWlncmF0ZSB5b3VyIGRhdGFiYXNlcyEgJHthcHB9LnZlcnNpb24gc2hvdWxkIGJlID49ICR7dGhpcy5tb2RlbEluZm9zW2FwcF0uY29tcGF0aWJsZVNpbmNlfSBidXQgaW4gZGIgaXQgaXMgJHttZXRhVmVyc2lvbn1gLFxuXHRcdFx0XHQpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBydW5NaWdyYXRpb25zKG1ldGE6IFBhcnRpYWw8T2ZmbGluZURiTWV0YT4sIHN0b3JhZ2U6IE9mZmxpbmVTdG9yYWdlLCBzcWxDaXBoZXJGYWNhZGU6IFNxbENpcGhlckZhY2FkZSkge1xuXHRcdGZvciAoY29uc3QgeyBhcHAsIHZlcnNpb24sIG1pZ3JhdGUgfSBvZiB0aGlzLm1pZ3JhdGlvbnMpIHtcblx0XHRcdGNvbnN0IHN0b3JlZFZlcnNpb24gPSBtZXRhW2Ake2FwcH0tdmVyc2lvbmBdIVxuXHRcdFx0aWYgKHN0b3JlZFZlcnNpb24gPCB2ZXJzaW9uKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGBydW5uaW5nIG9mZmxpbmUgZGIgbWlncmF0aW9uIGZvciAke2FwcH0gZnJvbSAke3N0b3JlZFZlcnNpb259IHRvICR7dmVyc2lvbn1gKVxuXHRcdFx0XHRhd2FpdCBtaWdyYXRlKHN0b3JhZ2UsIHNxbENpcGhlckZhY2FkZSlcblx0XHRcdFx0Y29uc29sZS5sb2coXCJtaWdyYXRpb24gZmluaXNoZWRcIilcblx0XHRcdFx0YXdhaXQgc3RvcmFnZS5zZXRTdG9yZWRNb2RlbFZlcnNpb24oYXBwLCB2ZXJzaW9uKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgcG9wdWxhdGVNb2RlbFZlcnNpb25zKG1ldGE6IFJlYWRvbmx5PFBhcnRpYWw8T2ZmbGluZURiTWV0YT4+LCBzdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSk6IFByb21pc2U8UGFydGlhbDxPZmZsaW5lRGJNZXRhPj4ge1xuXHRcdC8vIGNvcHkgbWV0YWRhdGEgYmVjYXVzZSBpdCdzIGdvaW5nIHRvIGJlIG11dGF0ZWRcblx0XHRjb25zdCBuZXdNZXRhID0geyAuLi5tZXRhIH1cblx0XHQvLyBQb3B1bGF0ZSBtb2RlbCB2ZXJzaW9ucyBpZiB0aGV5IGhhdmVuJ3QgYmVlbiB3cml0dGVuIGFscmVhZHlcblx0XHRmb3IgKGNvbnN0IGFwcCBvZiB0eXBlZEtleXModGhpcy5tb2RlbEluZm9zKSkge1xuXHRcdFx0YXdhaXQgdGhpcy5wcmVwb3B1bGF0ZVZlcnNpb25JZkFic2VudChhcHAsIHRoaXMubW9kZWxJbmZvc1thcHBdLnZlcnNpb24sIG5ld01ldGEsIHN0b3JhZ2UpXG5cdFx0fVxuXG5cdFx0YXdhaXQgdGhpcy5wcmVwb3B1bGF0ZVZlcnNpb25JZkFic2VudChcIm9mZmxpbmVcIiwgQ1VSUkVOVF9PRkZMSU5FX1ZFUlNJT04sIG5ld01ldGEsIHN0b3JhZ2UpXG5cdFx0cmV0dXJuIG5ld01ldGFcblx0fVxuXG5cdC8qKlxuXHQgKiB1cGRhdGUgdGhlIG1ldGFkYXRhIHRhYmxlIHRvIGluaXRpYWxpemUgdGhlIHJvdyBvZiB0aGUgYXBwIHdpdGggdGhlIGdpdmVuIG1vZGVsIHZlcnNpb25cblx0ICpcblx0ICogTkI6IG11dGF0ZXMgbWV0YVxuXHQgKi9cblx0cHJpdmF0ZSBhc3luYyBwcmVwb3B1bGF0ZVZlcnNpb25JZkFic2VudChhcHA6IFZlcnNpb25NZXRhZGF0YUJhc2VLZXksIHZlcnNpb246IG51bWJlciwgbWV0YTogUGFydGlhbDxPZmZsaW5lRGJNZXRhPiwgc3RvcmFnZTogT2ZmbGluZVN0b3JhZ2UpIHtcblx0XHRjb25zdCBrZXkgPSBgJHthcHB9LXZlcnNpb25gIGFzIGNvbnN0XG5cdFx0Y29uc3Qgc3RvcmVkVmVyc2lvbiA9IG1ldGFba2V5XVxuXHRcdGlmIChzdG9yZWRWZXJzaW9uID09IG51bGwpIHtcblx0XHRcdG1ldGFba2V5XSA9IHZlcnNpb25cblx0XHRcdGF3YWl0IHN0b3JhZ2Uuc2V0U3RvcmVkTW9kZWxWZXJzaW9uKGFwcCwgdmVyc2lvbilcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogaXQncyBwb3NzaWJsZSB0aGF0IHRoZSB1c2VyIGluc3RhbGxlZCBhbiBvbGRlciBjbGllbnQgb3ZlciBhIG5ld2VyIG9uZSwgYW5kIHdlIGRvbid0IGhhdmUgYmFja3dhcmRzIG1pZ3JhdGlvbnMuXG5cdCAqIGluIHRoYXQgY2FzZSwgaXQncyBsaWtlbHkgdGhhdCB0aGUgY2xpZW50IGNhbid0IGV2ZW4gdW5kZXJzdGFuZCB0aGUgY29udGVudHMgb2YgdGhlIGRiLlxuXHQgKiB3ZSdyZSBnb2luZyB0byBkZWxldGUgaXQgYW5kIG5vdCBtaWdyYXRlIGF0IGFsbC5cblx0ICogQHByaXZhdGVcblx0ICpcblx0ICogQHJldHVybnMgdHJ1ZSBpZiB0aGUgZGF0YWJhc2Ugd2UncmUgc3VwcG9zZWQgdG8gbWlncmF0ZSBoYXMgYW55IGhpZ2hlciBtb2RlbCB2ZXJzaW9ucyB0aGFuIG91ciBoaWdoZXN0IG1pZ3JhdGlvbiBmb3IgdGhhdCBtb2RlbCwgZmFsc2Ugb3RoZXJ3aXNlXG5cdCAqL1xuXHRwcml2YXRlIGlzRGJOZXdlclRoYW5DdXJyZW50Q2xpZW50KG1ldGE6IFBhcnRpYWw8T2ZmbGluZURiTWV0YT4pOiBib29sZWFuIHtcblx0XHRmb3IgKGNvbnN0IFthcHAsIHsgdmVyc2lvbiB9XSBvZiB0eXBlZEVudHJpZXModGhpcy5tb2RlbEluZm9zKSkge1xuXHRcdFx0Y29uc3Qgc3RvcmVkVmVyc2lvbiA9IG1ldGFbYCR7YXBwfS12ZXJzaW9uYF0hXG5cdFx0XHRpZiAoc3RvcmVkVmVyc2lvbiA+IHZlcnNpb24pIHtcblx0XHRcdFx0cmV0dXJuIHRydWVcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gYXNzZXJ0Tm90TnVsbChtZXRhW2BvZmZsaW5lLXZlcnNpb25gXSkgPiBDVVJSRU5UX09GRkxJTkVfVkVSU0lPTlxuXHR9XG59XG4iLCIvKiBnZW5lcmF0ZWQgZmlsZSwgZG9uJ3QgZWRpdC4gKi9cblxuaW1wb3J0IHsgU3FsQ2lwaGVyRmFjYWRlIH0gZnJvbSBcIi4vU3FsQ2lwaGVyRmFjYWRlLmpzXCJcblxuaW50ZXJmYWNlIE5hdGl2ZUludGVyZmFjZSB7XG5cdGludm9rZU5hdGl2ZShyZXF1ZXN0VHlwZTogc3RyaW5nLCBhcmdzOiB1bmtub3duW10pOiBQcm9taXNlPGFueT5cbn1cbmV4cG9ydCBjbGFzcyBTcWxDaXBoZXJGYWNhZGVTZW5kRGlzcGF0Y2hlciBpbXBsZW1lbnRzIFNxbENpcGhlckZhY2FkZSB7XG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgdHJhbnNwb3J0OiBOYXRpdmVJbnRlcmZhY2UpIHt9XG5cdGFzeW5jIG9wZW5EYiguLi5hcmdzOiBQYXJhbWV0ZXJzPFNxbENpcGhlckZhY2FkZVtcIm9wZW5EYlwiXT4pIHtcblx0XHRyZXR1cm4gdGhpcy50cmFuc3BvcnQuaW52b2tlTmF0aXZlKFwiaXBjXCIsIFtcIlNxbENpcGhlckZhY2FkZVwiLCBcIm9wZW5EYlwiLCAuLi5hcmdzXSlcblx0fVxuXHRhc3luYyBjbG9zZURiKC4uLmFyZ3M6IFBhcmFtZXRlcnM8U3FsQ2lwaGVyRmFjYWRlW1wiY2xvc2VEYlwiXT4pIHtcblx0XHRyZXR1cm4gdGhpcy50cmFuc3BvcnQuaW52b2tlTmF0aXZlKFwiaXBjXCIsIFtcIlNxbENpcGhlckZhY2FkZVwiLCBcImNsb3NlRGJcIiwgLi4uYXJnc10pXG5cdH1cblx0YXN5bmMgZGVsZXRlRGIoLi4uYXJnczogUGFyYW1ldGVyczxTcWxDaXBoZXJGYWNhZGVbXCJkZWxldGVEYlwiXT4pIHtcblx0XHRyZXR1cm4gdGhpcy50cmFuc3BvcnQuaW52b2tlTmF0aXZlKFwiaXBjXCIsIFtcIlNxbENpcGhlckZhY2FkZVwiLCBcImRlbGV0ZURiXCIsIC4uLmFyZ3NdKVxuXHR9XG5cdGFzeW5jIHJ1biguLi5hcmdzOiBQYXJhbWV0ZXJzPFNxbENpcGhlckZhY2FkZVtcInJ1blwiXT4pIHtcblx0XHRyZXR1cm4gdGhpcy50cmFuc3BvcnQuaW52b2tlTmF0aXZlKFwiaXBjXCIsIFtcIlNxbENpcGhlckZhY2FkZVwiLCBcInJ1blwiLCAuLi5hcmdzXSlcblx0fVxuXHRhc3luYyBnZXQoLi4uYXJnczogUGFyYW1ldGVyczxTcWxDaXBoZXJGYWNhZGVbXCJnZXRcIl0+KSB7XG5cdFx0cmV0dXJuIHRoaXMudHJhbnNwb3J0Lmludm9rZU5hdGl2ZShcImlwY1wiLCBbXCJTcWxDaXBoZXJGYWNhZGVcIiwgXCJnZXRcIiwgLi4uYXJnc10pXG5cdH1cblx0YXN5bmMgYWxsKC4uLmFyZ3M6IFBhcmFtZXRlcnM8U3FsQ2lwaGVyRmFjYWRlW1wiYWxsXCJdPikge1xuXHRcdHJldHVybiB0aGlzLnRyYW5zcG9ydC5pbnZva2VOYXRpdmUoXCJpcGNcIiwgW1wiU3FsQ2lwaGVyRmFjYWRlXCIsIFwiYWxsXCIsIC4uLmFyZ3NdKVxuXHR9XG5cdGFzeW5jIGxvY2tSYW5nZXNEYkFjY2VzcyguLi5hcmdzOiBQYXJhbWV0ZXJzPFNxbENpcGhlckZhY2FkZVtcImxvY2tSYW5nZXNEYkFjY2Vzc1wiXT4pIHtcblx0XHRyZXR1cm4gdGhpcy50cmFuc3BvcnQuaW52b2tlTmF0aXZlKFwiaXBjXCIsIFtcIlNxbENpcGhlckZhY2FkZVwiLCBcImxvY2tSYW5nZXNEYkFjY2Vzc1wiLCAuLi5hcmdzXSlcblx0fVxuXHRhc3luYyB1bmxvY2tSYW5nZXNEYkFjY2VzcyguLi5hcmdzOiBQYXJhbWV0ZXJzPFNxbENpcGhlckZhY2FkZVtcInVubG9ja1Jhbmdlc0RiQWNjZXNzXCJdPikge1xuXHRcdHJldHVybiB0aGlzLnRyYW5zcG9ydC5pbnZva2VOYXRpdmUoXCJpcGNcIiwgW1wiU3FsQ2lwaGVyRmFjYWRlXCIsIFwidW5sb2NrUmFuZ2VzRGJBY2Nlc3NcIiwgLi4uYXJnc10pXG5cdH1cbn1cbiIsImltcG9ydCB7IGF1dGhlbnRpY2F0ZWRBZXNEZWNyeXB0LCBFbnRyb3B5U291cmNlLCByYW5kb20sIFJhbmRvbWl6ZXIgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLWNyeXB0b1wiXG5pbXBvcnQgeyBVc2VyRmFjYWRlIH0gZnJvbSBcIi4vVXNlckZhY2FkZS5qc1wiXG5pbXBvcnQgeyBjcmVhdGVFbnRyb3B5RGF0YSwgVHV0YW5vdGFQcm9wZXJ0aWVzIH0gZnJvbSBcIi4uLy4uL2VudGl0aWVzL3R1dGFub3RhL1R5cGVSZWZzLmpzXCJcbmltcG9ydCB7IEVudHJvcHlTZXJ2aWNlIH0gZnJvbSBcIi4uLy4uL2VudGl0aWVzL3R1dGFub3RhL1NlcnZpY2VzLmpzXCJcbmltcG9ydCB7IGxhenksIG5vT3AsIG9mQ2xhc3MgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB7IENvbm5lY3Rpb25FcnJvciwgTG9ja2VkRXJyb3IsIFNlcnZpY2VVbmF2YWlsYWJsZUVycm9yIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9lcnJvci9SZXN0RXJyb3IuanNcIlxuaW1wb3J0IHsgSVNlcnZpY2VFeGVjdXRvciB9IGZyb20gXCIuLi8uLi9jb21tb24vU2VydmljZVJlcXVlc3QuanNcIlxuaW1wb3J0IHsgS2V5TG9hZGVyRmFjYWRlLCBwYXJzZUtleVZlcnNpb24gfSBmcm9tIFwiLi9LZXlMb2FkZXJGYWNhZGUuanNcIlxuaW1wb3J0IHsgZW5jcnlwdEJ5dGVzIH0gZnJvbSBcIi4uL2NyeXB0by9DcnlwdG9XcmFwcGVyLmpzXCJcblxuZXhwb3J0IGludGVyZmFjZSBFbnRyb3B5RGF0YUNodW5rIHtcblx0c291cmNlOiBFbnRyb3B5U291cmNlXG5cdGVudHJvcHk6IG51bWJlclxuXHRkYXRhOiBudW1iZXIgfCBBcnJheTxudW1iZXI+XG59XG5cbi8qKiBBIGNsYXNzIHdoaWNoIGFjY3VtdWxhdGVzIHRoZSBlbnRyb3B5IGFuZCBzdG9yZXMgaXQgb24gdGhlIHNlcnZlci4gKi9cbmV4cG9ydCBjbGFzcyBFbnRyb3B5RmFjYWRlIHtcblx0cHJpdmF0ZSBuZXdFbnRyb3B5OiBudW1iZXIgPSAtMVxuXHRwcml2YXRlIGxhc3RFbnRyb3B5VXBkYXRlOiBudW1iZXIgPSBEYXRlLm5vdygpXG5cblx0Y29uc3RydWN0b3IoXG5cdFx0cHJpdmF0ZSByZWFkb25seSB1c2VyRmFjYWRlOiBVc2VyRmFjYWRlLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgc2VydmljZUV4ZWN1dG9yOiBJU2VydmljZUV4ZWN1dG9yLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgcmFuZG9tOiBSYW5kb21pemVyLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgbGF6eUtleUxvYWRlckZhY2FkZTogbGF6eTxLZXlMb2FkZXJGYWNhZGU+LFxuXHQpIHt9XG5cblx0LyoqXG5cdCAqIEFkZHMgZW50cm9weSB0byB0aGUgcmFuZG9taXplci4gVXBkYXRlZCB0aGUgc3RvcmVkIGVudHJvcHkgZm9yIGEgdXNlciB3aGVuIGVub3VnaCBlbnRyb3B5IGhhcyBiZWVuIGNvbGxlY3RlZC5cblx0ICovXG5cdGFkZEVudHJvcHkoZW50cm9weTogRW50cm9weURhdGFDaHVua1tdKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0dHJ5IHtcblx0XHRcdHJldHVybiB0aGlzLnJhbmRvbS5hZGRFbnRyb3B5KGVudHJvcHkpXG5cdFx0fSBmaW5hbGx5IHtcblx0XHRcdHRoaXMubmV3RW50cm9weSA9IHRoaXMubmV3RW50cm9weSArIGVudHJvcHkucmVkdWNlKChzdW0sIHZhbHVlKSA9PiB2YWx1ZS5lbnRyb3B5ICsgc3VtLCAwKVxuXHRcdFx0Y29uc3Qgbm93ID0gbmV3IERhdGUoKS5nZXRUaW1lKClcblxuXHRcdFx0aWYgKHRoaXMubmV3RW50cm9weSA+IDUwMDAgJiYgbm93IC0gdGhpcy5sYXN0RW50cm9weVVwZGF0ZSA+IDEwMDAgKiA2MCAqIDUpIHtcblx0XHRcdFx0dGhpcy5sYXN0RW50cm9weVVwZGF0ZSA9IG5vd1xuXHRcdFx0XHR0aGlzLm5ld0VudHJvcHkgPSAwXG5cdFx0XHRcdHRoaXMuc3RvcmVFbnRyb3B5KClcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRzdG9yZUVudHJvcHkoKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Ly8gV2Ugb25seSBzdG9yZSBlbnRyb3B5IHRvIHRoZSBzZXJ2ZXIgaWYgd2UgYXJlIHRoZSBsZWFkZXJcblx0XHRpZiAoIXRoaXMudXNlckZhY2FkZS5pc0Z1bGx5TG9nZ2VkSW4oKSB8fCAhdGhpcy51c2VyRmFjYWRlLmlzTGVhZGVyKCkpIHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuXHRcdGNvbnN0IHVzZXJHcm91cEtleSA9IHRoaXMudXNlckZhY2FkZS5nZXRDdXJyZW50VXNlckdyb3VwS2V5KClcblx0XHRjb25zdCBlbnRyb3B5RGF0YSA9IGNyZWF0ZUVudHJvcHlEYXRhKHtcblx0XHRcdHVzZXJFbmNFbnRyb3B5OiBlbmNyeXB0Qnl0ZXModXNlckdyb3VwS2V5Lm9iamVjdCwgdGhpcy5yYW5kb20uZ2VuZXJhdGVSYW5kb21EYXRhKDMyKSksXG5cdFx0XHR1c2VyS2V5VmVyc2lvbjogdXNlckdyb3VwS2V5LnZlcnNpb24udG9TdHJpbmcoKSxcblx0XHR9KVxuXHRcdHJldHVybiB0aGlzLnNlcnZpY2VFeGVjdXRvclxuXHRcdFx0LnB1dChFbnRyb3B5U2VydmljZSwgZW50cm9weURhdGEpXG5cdFx0XHQuY2F0Y2gob2ZDbGFzcyhMb2NrZWRFcnJvciwgbm9PcCkpXG5cdFx0XHQuY2F0Y2goXG5cdFx0XHRcdG9mQ2xhc3MoQ29ubmVjdGlvbkVycm9yLCAoZSkgPT4ge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKFwiY291bGQgbm90IHN0b3JlIGVudHJvcHlcIiwgZSlcblx0XHRcdFx0fSksXG5cdFx0XHQpXG5cdFx0XHQuY2F0Y2goXG5cdFx0XHRcdG9mQ2xhc3MoU2VydmljZVVuYXZhaWxhYmxlRXJyb3IsIChlKSA9PiB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coXCJjb3VsZCBub3Qgc3RvcmUgZW50cm9weVwiLCBlKVxuXHRcdFx0XHR9KSxcblx0XHRcdClcblx0fVxuXG5cdC8qKlxuXHQgKiBMb2FkcyBlbnRyb3B5IGZyb20gdGhlIGxhc3QgbG9nb3V0LlxuXHQgKi9cblx0cHVibGljIGFzeW5jIGxvYWRFbnRyb3B5KHR1dGFub3RhUHJvcGVydGllczogVHV0YW5vdGFQcm9wZXJ0aWVzKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0aWYgKHR1dGFub3RhUHJvcGVydGllcy51c2VyRW5jRW50cm9weSkge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Y29uc3Qga2V5TG9hZGVyRmFjYWRlID0gdGhpcy5sYXp5S2V5TG9hZGVyRmFjYWRlKClcblx0XHRcdFx0Y29uc3QgdXNlckdyb3VwS2V5ID0gYXdhaXQga2V5TG9hZGVyRmFjYWRlLmxvYWRTeW1Vc2VyR3JvdXBLZXkocGFyc2VLZXlWZXJzaW9uKHR1dGFub3RhUHJvcGVydGllcy51c2VyS2V5VmVyc2lvbiA/PyBcIjBcIikpXG5cdFx0XHRcdGNvbnN0IGVudHJvcHkgPSBhdXRoZW50aWNhdGVkQWVzRGVjcnlwdCh1c2VyR3JvdXBLZXksIHR1dGFub3RhUHJvcGVydGllcy51c2VyRW5jRW50cm9weSlcblx0XHRcdFx0cmFuZG9tLmFkZFN0YXRpY0VudHJvcHkoZW50cm9weSlcblx0XHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiY291bGQgbm90IGRlY3J5cHQgZW50cm9weVwiLCBlcnJvcilcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cbiIsImltcG9ydCB7IEFyY2hpdmVEYXRhVHlwZSwgQmxvYkFjY2Vzc1Rva2VuS2luZCB9IGZyb20gXCIuLi8uLi9jb21tb24vVHV0YW5vdGFDb25zdGFudHNcIlxuaW1wb3J0IHsgYXNzZXJ0V29ya2VyT3JOb2RlIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9FbnZcIlxuaW1wb3J0IHsgQmxvYkFjY2Vzc1Rva2VuU2VydmljZSB9IGZyb20gXCIuLi8uLi9lbnRpdGllcy9zdG9yYWdlL1NlcnZpY2VzXCJcbmltcG9ydCB7IElTZXJ2aWNlRXhlY3V0b3IgfSBmcm9tIFwiLi4vLi4vY29tbW9uL1NlcnZpY2VSZXF1ZXN0XCJcbmltcG9ydCB7IEJsb2JTZXJ2ZXJBY2Nlc3NJbmZvLCBjcmVhdGVCbG9iQWNjZXNzVG9rZW5Qb3N0SW4sIGNyZWF0ZUJsb2JSZWFkRGF0YSwgY3JlYXRlQmxvYldyaXRlRGF0YSwgY3JlYXRlSW5zdGFuY2VJZCB9IGZyb20gXCIuLi8uLi9lbnRpdGllcy9zdG9yYWdlL1R5cGVSZWZzXCJcbmltcG9ydCB7IERhdGVQcm92aWRlciB9IGZyb20gXCIuLi8uLi9jb21tb24vRGF0ZVByb3ZpZGVyLmpzXCJcbmltcG9ydCB7IHJlc29sdmVUeXBlUmVmZXJlbmNlIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9FbnRpdHlGdW5jdGlvbnMuanNcIlxuaW1wb3J0IHsgQXV0aERhdGFQcm92aWRlciB9IGZyb20gXCIuL1VzZXJGYWNhZGUuanNcIlxuaW1wb3J0IHsgZGVkdXBsaWNhdGUsIGZpcnN0LCBpc0VtcHR5LCBsYXp5TWVtb2l6ZWQsIFR5cGVSZWYgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB7IFByb2dyYW1taW5nRXJyb3IgfSBmcm9tIFwiLi4vLi4vY29tbW9uL2Vycm9yL1Byb2dyYW1taW5nRXJyb3IuanNcIlxuaW1wb3J0IHsgQmxvYkxvYWRPcHRpb25zIH0gZnJvbSBcIi4vbGF6eS9CbG9iRmFjYWRlLmpzXCJcbmltcG9ydCB7IEJsb2JSZWZlcmVuY2luZ0luc3RhbmNlIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi91dGlscy9CbG9iVXRpbHMuanNcIlxuXG5hc3NlcnRXb3JrZXJPck5vZGUoKVxuXG4vKipcbiAqIFRoZSBCbG9iQWNjZXNzVG9rZW5GYWNhZGUgcmVxdWVzdHMgYmxvYkFjY2Vzc1Rva2VucyBmcm9tIHRoZSBCbG9iQWNjZXNzVG9rZW5TZXJ2aWNlIHRvIGdldCBvciBwb3N0IHRvIHRoZSBCbG9iU2VydmljZSAoYmluYXJ5IGJsb2JzKVxuICogb3IgRGVmYXVsdEJsb2JFbGVtZW50UmVzb3VyY2UgKGluc3RhbmNlcykuXG4gKlxuICogQWxsIHRva2VucyBhcmUgY2FjaGVkLlxuICovXG5leHBvcnQgY2xhc3MgQmxvYkFjY2Vzc1Rva2VuRmFjYWRlIHtcblx0Ly8gY2FjaGUgZm9yIGJsb2IgYWNjZXNzIHRva2VucyB0aGF0IGFyZSB2YWxpZCBmb3IgdGhlIHdob2xlIGFyY2hpdmUgKGtleTo8YXJjaGl2ZUlkPilcblx0Ly8gY2FjaGUgZm9yIGJsb2IgYWNjZXNzIHRva2VucyB0aGF0IGFyZSB2YWxpZCBmb3IgYmxvYnMgZnJvbSBhIGdpdmVuIGluc3RhbmNlIHdlcmUgdGhlIHVzZXIgZG9lcyBub3Qgb3duIHRoZSBhcmNoaXZlIChrZXk6PGluc3RhbmNlRWxlbWVudElkPikuXG5cdHByaXZhdGUgcmVhZG9ubHkgcmVhZENhY2hlOiBCbG9iQWNjZXNzVG9rZW5DYWNoZVxuXHQvLyBjYWNoZSBmb3IgdXBsb2FkIHJlcXVlc3RzIGFyZSB2YWxpZCBmb3IgdGhlIHdob2xlIGFyY2hpdmUgKGtleTo8b3duZXJHcm91cCArIGFyY2hpdmVEYXRhVHlwZT4pLlxuXHRwcml2YXRlIHJlYWRvbmx5IHdyaXRlQ2FjaGU6IEJsb2JBY2Nlc3NUb2tlbkNhY2hlXG5cblx0Y29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBzZXJ2aWNlRXhlY3V0b3I6IElTZXJ2aWNlRXhlY3V0b3IsIHByaXZhdGUgcmVhZG9ubHkgYXV0aERhdGFQcm92aWRlcjogQXV0aERhdGFQcm92aWRlciwgZGF0ZVByb3ZpZGVyOiBEYXRlUHJvdmlkZXIpIHtcblx0XHR0aGlzLnJlYWRDYWNoZSA9IG5ldyBCbG9iQWNjZXNzVG9rZW5DYWNoZShkYXRlUHJvdmlkZXIpXG5cdFx0dGhpcy53cml0ZUNhY2hlID0gbmV3IEJsb2JBY2Nlc3NUb2tlbkNhY2hlKGRhdGVQcm92aWRlcilcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXF1ZXN0cyBhIHRva2VuIHRoYXQgYWxsb3dzIHVwbG9hZGluZyBibG9icyBmb3IgdGhlIGdpdmVuIEFyY2hpdmVEYXRhVHlwZSBhbmQgb3duZXJHcm91cC5cblx0ICogQHBhcmFtIGFyY2hpdmVEYXRhVHlwZSBUaGUgdHlwZSBvZiBkYXRhIHRoYXQgc2hvdWxkIGJlIHN0b3JlZC5cblx0ICogQHBhcmFtIG93bmVyR3JvdXBJZCBUaGUgb3duZXJHcm91cCB3ZXJlIHRoZSBkYXRhIGJlbG9uZ3MgdG8gKGUuZy4gZ3JvdXAgb2YgdHlwZSBtYWlsKVxuXHQgKi9cblx0YXN5bmMgcmVxdWVzdFdyaXRlVG9rZW4oYXJjaGl2ZURhdGFUeXBlOiBBcmNoaXZlRGF0YVR5cGUsIG93bmVyR3JvdXBJZDogSWQpOiBQcm9taXNlPEJsb2JTZXJ2ZXJBY2Nlc3NJbmZvPiB7XG5cdFx0Y29uc3QgcmVxdWVzdE5ld1Rva2VuID0gYXN5bmMgKCkgPT4ge1xuXHRcdFx0Y29uc3QgdG9rZW5SZXF1ZXN0ID0gY3JlYXRlQmxvYkFjY2Vzc1Rva2VuUG9zdEluKHtcblx0XHRcdFx0YXJjaGl2ZURhdGFUeXBlLFxuXHRcdFx0XHR3cml0ZTogY3JlYXRlQmxvYldyaXRlRGF0YSh7XG5cdFx0XHRcdFx0YXJjaGl2ZU93bmVyR3JvdXA6IG93bmVyR3JvdXBJZCxcblx0XHRcdFx0fSksXG5cdFx0XHRcdHJlYWQ6IG51bGwsXG5cdFx0XHR9KVxuXHRcdFx0Y29uc3QgeyBibG9iQWNjZXNzSW5mbyB9ID0gYXdhaXQgdGhpcy5zZXJ2aWNlRXhlY3V0b3IucG9zdChCbG9iQWNjZXNzVG9rZW5TZXJ2aWNlLCB0b2tlblJlcXVlc3QpXG5cdFx0XHRyZXR1cm4gYmxvYkFjY2Vzc0luZm9cblx0XHR9XG5cdFx0Y29uc3Qga2V5ID0gdGhpcy5tYWtlV3JpdGVDYWNoZUtleShvd25lckdyb3VwSWQsIGFyY2hpdmVEYXRhVHlwZSlcblx0XHRyZXR1cm4gdGhpcy53cml0ZUNhY2hlLmdldFRva2VuKGtleSwgW10sIHJlcXVlc3ROZXdUb2tlbilcblx0fVxuXG5cdHByaXZhdGUgbWFrZVdyaXRlQ2FjaGVLZXkob3duZXJHcm91cElkOiBzdHJpbmcsIGFyY2hpdmVEYXRhVHlwZTogQXJjaGl2ZURhdGFUeXBlKSB7XG5cdFx0cmV0dXJuIG93bmVyR3JvdXBJZCArIGFyY2hpdmVEYXRhVHlwZVxuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZSBhIGdpdmVuIHdyaXRlIHRva2VuIGZyb20gdGhlIGNhY2hlLlxuXHQgKiBAcGFyYW0gYXJjaGl2ZURhdGFUeXBlXG5cdCAqIEBwYXJhbSBvd25lckdyb3VwSWRcblx0ICovXG5cdGV2aWN0V3JpdGVUb2tlbihhcmNoaXZlRGF0YVR5cGU6IEFyY2hpdmVEYXRhVHlwZSwgb3duZXJHcm91cElkOiBJZCk6IHZvaWQge1xuXHRcdGNvbnN0IGtleSA9IHRoaXMubWFrZVdyaXRlQ2FjaGVLZXkob3duZXJHcm91cElkLCBhcmNoaXZlRGF0YVR5cGUpXG5cdFx0dGhpcy53cml0ZUNhY2hlLmV2aWN0QXJjaGl2ZU9yR3JvdXBLZXkoa2V5KVxuXHR9XG5cblx0LyoqXG5cdCAqIFJlcXVlc3RzIGEgdG9rZW4gdGhhdCBncmFudHMgcmVhZCBhY2Nlc3MgdG8gYWxsIGJsb2JzIHRoYXQgYXJlIHJlZmVyZW5jZWQgYnkgdGhlIGdpdmVuIGluc3RhbmNlcy5cblx0ICogQSB1c2VyIG11c3QgYmUgb3duZXIgb2YgdGhlIGluc3RhbmNlIGJ1dCBtdXN0IG5vdCBiZSBvd25lciBvZiB0aGUgYXJjaGl2ZSB3aGVyZSB0aGUgYmxvYnMgYXJlIHN0b3JlZCBpbi5cblx0ICpcblx0ICogQHBhcmFtIGFyY2hpdmVEYXRhVHlwZSBzcGVjaWZ5IHRoZSBkYXRhIHR5cGVcblx0ICogQHBhcmFtIHJlZmVyZW5jaW5nSW5zdGFuY2VzIHRoZSBpbnN0YW5jZXMgdGhhdCByZWZlcmVuY2VzIHRoZSBibG9ic1xuXHQgKiBAcGFyYW0gYmxvYkxvYWRPcHRpb25zIGxvYWQgb3B0aW9ucyB3aGVuIGxvYWRpbmcgYmxvYnNcblx0ICogQHRocm93cyBQcm9ncmFtbWluZ0Vycm9yIGlmIGluc3RhbmNlcyBhcmUgbm90IHBhcnQgb2YgdGhlIHNhbWUgbGlzdCBvciBibG9icyBhcmUgbm90IHBhcnQgb2YgdGhlIHNhbWUgYXJjaGl2ZS5cblx0ICovXG5cdGFzeW5jIHJlcXVlc3RSZWFkVG9rZW5NdWx0aXBsZUluc3RhbmNlcyhcblx0XHRhcmNoaXZlRGF0YVR5cGU6IEFyY2hpdmVEYXRhVHlwZSxcblx0XHRyZWZlcmVuY2luZ0luc3RhbmNlczogcmVhZG9ubHkgQmxvYlJlZmVyZW5jaW5nSW5zdGFuY2VbXSxcblx0XHRibG9iTG9hZE9wdGlvbnM6IEJsb2JMb2FkT3B0aW9ucyxcblx0KTogUHJvbWlzZTxCbG9iU2VydmVyQWNjZXNzSW5mbz4ge1xuXHRcdGlmIChpc0VtcHR5KHJlZmVyZW5jaW5nSW5zdGFuY2VzKSkge1xuXHRcdFx0dGhyb3cgbmV3IFByb2dyYW1taW5nRXJyb3IoXCJNdXN0IHBhc3MgYXQgbGVhc3Qgb25lIHJlZmVyZW5jaW5nIGluc3RhbmNlXCIpXG5cdFx0fVxuXHRcdGNvbnN0IGluc3RhbmNlTGlzdElkID0gcmVmZXJlbmNpbmdJbnN0YW5jZXNbMF0ubGlzdElkXG5cdFx0aWYgKCFyZWZlcmVuY2luZ0luc3RhbmNlcy5ldmVyeSgoaW5zdGFuY2UpID0+IGluc3RhbmNlLmxpc3RJZCA9PT0gaW5zdGFuY2VMaXN0SWQpKSB7XG5cdFx0XHR0aHJvdyBuZXcgUHJvZ3JhbW1pbmdFcnJvcihcIkFsbCByZWZlcmVuY2luZyBpbnN0YW5jZXMgbXVzdCBiZSBwYXJ0IG9mIHRoZSBzYW1lIGxpc3RcIilcblx0XHR9XG5cblx0XHRjb25zdCBhcmNoaXZlSWQgPSB0aGlzLmdldEFyY2hpdmVJZChyZWZlcmVuY2luZ0luc3RhbmNlcylcblxuXHRcdGNvbnN0IHJlcXVlc3ROZXdUb2tlbiA9IGxhenlNZW1vaXplZChhc3luYyAoKSA9PiB7XG5cdFx0XHRjb25zdCBpbnN0YW5jZUlkcyA9IHJlZmVyZW5jaW5nSW5zdGFuY2VzLm1hcCgoeyBlbGVtZW50SWQgfSkgPT4gY3JlYXRlSW5zdGFuY2VJZCh7IGluc3RhbmNlSWQ6IGVsZW1lbnRJZCB9KSlcblx0XHRcdGNvbnN0IHRva2VuUmVxdWVzdCA9IGNyZWF0ZUJsb2JBY2Nlc3NUb2tlblBvc3RJbih7XG5cdFx0XHRcdGFyY2hpdmVEYXRhVHlwZSxcblx0XHRcdFx0cmVhZDogY3JlYXRlQmxvYlJlYWREYXRhKHtcblx0XHRcdFx0XHRhcmNoaXZlSWQsXG5cdFx0XHRcdFx0aW5zdGFuY2VMaXN0SWQsXG5cdFx0XHRcdFx0aW5zdGFuY2VJZHMsXG5cdFx0XHRcdH0pLFxuXHRcdFx0XHR3cml0ZTogbnVsbCxcblx0XHRcdH0pXG5cdFx0XHRjb25zdCB7IGJsb2JBY2Nlc3NJbmZvIH0gPSBhd2FpdCB0aGlzLnNlcnZpY2VFeGVjdXRvci5wb3N0KEJsb2JBY2Nlc3NUb2tlblNlcnZpY2UsIHRva2VuUmVxdWVzdCwgYmxvYkxvYWRPcHRpb25zKVxuXHRcdFx0cmV0dXJuIGJsb2JBY2Nlc3NJbmZvXG5cdFx0fSlcblxuXHRcdHJldHVybiB0aGlzLnJlYWRDYWNoZS5nZXRUb2tlbihcblx0XHRcdGFyY2hpdmVJZCxcblx0XHRcdHJlZmVyZW5jaW5nSW5zdGFuY2VzLm1hcCgoaW5zdGFuY2UpID0+IGluc3RhbmNlLmVsZW1lbnRJZCksXG5cdFx0XHRyZXF1ZXN0TmV3VG9rZW4sXG5cdFx0KVxuXHR9XG5cblx0LyoqXG5cdCAqIFJlcXVlc3RzIGEgdG9rZW4gdGhhdCBncmFudHMgcmVhZCBhY2Nlc3MgdG8gYWxsIGJsb2JzIHRoYXQgYXJlIHJlZmVyZW5jZWQgYnkgdGhlIGdpdmVuIGluc3RhbmNlLlxuXHQgKiBBIHVzZXIgbXVzdCBiZSBvd25lciBvZiB0aGUgaW5zdGFuY2UgYnV0IG11c3Qgbm90IGJlIG93bmVyIG9mIHRoZSBhcmNoaXZlIHdlcmUgdGhlIGJsb2JzIGFyZSBzdG9yZWQgaW4uXG5cdCAqIEBwYXJhbSBhcmNoaXZlRGF0YVR5cGUgc3BlY2lmeSB0aGUgZGF0YSB0eXBlXG5cdCAqIEBwYXJhbSByZWZlcmVuY2luZ0luc3RhbmNlIHRoZSBpbnN0YW5jZSB0aGF0IHJlZmVyZW5jZXMgdGhlIGJsb2JzXG5cdCAqIEBwYXJhbSBibG9iTG9hZE9wdGlvbnMgbG9hZCBvcHRpb25zIHdoZW4gbG9hZGluZyBibG9ic1xuXHQgKi9cblx0YXN5bmMgcmVxdWVzdFJlYWRUb2tlbkJsb2JzKFxuXHRcdGFyY2hpdmVEYXRhVHlwZTogQXJjaGl2ZURhdGFUeXBlLFxuXHRcdHJlZmVyZW5jaW5nSW5zdGFuY2U6IEJsb2JSZWZlcmVuY2luZ0luc3RhbmNlLFxuXHRcdGJsb2JMb2FkT3B0aW9uczogQmxvYkxvYWRPcHRpb25zLFxuXHQpOiBQcm9taXNlPEJsb2JTZXJ2ZXJBY2Nlc3NJbmZvPiB7XG5cdFx0Y29uc3QgYXJjaGl2ZUlkID0gdGhpcy5nZXRBcmNoaXZlSWQoW3JlZmVyZW5jaW5nSW5zdGFuY2VdKVxuXHRcdGNvbnN0IHJlcXVlc3ROZXdUb2tlbiA9IGFzeW5jICgpID0+IHtcblx0XHRcdGNvbnN0IGluc3RhbmNlTGlzdElkID0gcmVmZXJlbmNpbmdJbnN0YW5jZS5saXN0SWRcblx0XHRcdGNvbnN0IGluc3RhbmNlSWQgPSByZWZlcmVuY2luZ0luc3RhbmNlLmVsZW1lbnRJZFxuXHRcdFx0Y29uc3QgaW5zdGFuY2VJZHMgPSBbY3JlYXRlSW5zdGFuY2VJZCh7IGluc3RhbmNlSWQgfSldXG5cdFx0XHRjb25zdCB0b2tlblJlcXVlc3QgPSBjcmVhdGVCbG9iQWNjZXNzVG9rZW5Qb3N0SW4oe1xuXHRcdFx0XHRhcmNoaXZlRGF0YVR5cGUsXG5cdFx0XHRcdHJlYWQ6IGNyZWF0ZUJsb2JSZWFkRGF0YSh7XG5cdFx0XHRcdFx0YXJjaGl2ZUlkLFxuXHRcdFx0XHRcdGluc3RhbmNlTGlzdElkLFxuXHRcdFx0XHRcdGluc3RhbmNlSWRzLFxuXHRcdFx0XHR9KSxcblx0XHRcdFx0d3JpdGU6IG51bGwsXG5cdFx0XHR9KVxuXHRcdFx0Y29uc3QgeyBibG9iQWNjZXNzSW5mbyB9ID0gYXdhaXQgdGhpcy5zZXJ2aWNlRXhlY3V0b3IucG9zdChCbG9iQWNjZXNzVG9rZW5TZXJ2aWNlLCB0b2tlblJlcXVlc3QsIGJsb2JMb2FkT3B0aW9ucylcblx0XHRcdHJldHVybiBibG9iQWNjZXNzSW5mb1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5yZWFkQ2FjaGUuZ2V0VG9rZW4oYXJjaGl2ZUlkLCBbcmVmZXJlbmNpbmdJbnN0YW5jZS5lbGVtZW50SWRdLCByZXF1ZXN0TmV3VG9rZW4pXG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlIGEgZ2l2ZW4gcmVhZCBibG9icyB0b2tlbiBmcm9tIHRoZSBjYWNoZS5cblx0ICogQHBhcmFtIHJlZmVyZW5jaW5nSW5zdGFuY2Vcblx0ICovXG5cdGV2aWN0UmVhZEJsb2JzVG9rZW4ocmVmZXJlbmNpbmdJbnN0YW5jZTogQmxvYlJlZmVyZW5jaW5nSW5zdGFuY2UpOiB2b2lkIHtcblx0XHR0aGlzLnJlYWRDYWNoZS5ldmljdEluc3RhbmNlSWQocmVmZXJlbmNpbmdJbnN0YW5jZS5lbGVtZW50SWQpXG5cdFx0Y29uc3QgYXJjaGl2ZUlkID0gdGhpcy5nZXRBcmNoaXZlSWQoW3JlZmVyZW5jaW5nSW5zdGFuY2VdKVxuXHRcdHRoaXMucmVhZENhY2hlLmV2aWN0QXJjaGl2ZU9yR3JvdXBLZXkoYXJjaGl2ZUlkKVxuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZSBhIGdpdmVuIHJlYWQgYmxvYnMgdG9rZW4gZnJvbSB0aGUgY2FjaGUuXG5cdCAqIEBwYXJhbSByZWZlcmVuY2luZ0luc3RhbmNlc1xuXHQgKi9cblx0ZXZpY3RSZWFkQmxvYnNUb2tlbk11bHRpcGxlQmxvYnMocmVmZXJlbmNpbmdJbnN0YW5jZXM6IEJsb2JSZWZlcmVuY2luZ0luc3RhbmNlW10pOiB2b2lkIHtcblx0XHR0aGlzLnJlYWRDYWNoZS5ldmljdEFsbChyZWZlcmVuY2luZ0luc3RhbmNlcy5tYXAoKGluc3RhbmNlKSA9PiBpbnN0YW5jZS5lbGVtZW50SWQpKVxuXHRcdGNvbnN0IGFyY2hpdmVJZCA9IHRoaXMuZ2V0QXJjaGl2ZUlkKHJlZmVyZW5jaW5nSW5zdGFuY2VzKVxuXHRcdHRoaXMucmVhZENhY2hlLmV2aWN0QXJjaGl2ZU9yR3JvdXBLZXkoYXJjaGl2ZUlkKVxuXHR9XG5cblx0LyoqXG5cdCAqIFJlcXVlc3RzIGEgdG9rZW4gdGhhdCBncmFudHMgYWNjZXNzIHRvIGFsbCBibG9icyBzdG9yZWQgaW4gdGhlIGdpdmVuIGFyY2hpdmUuIFRoZSB1c2VyIG11c3Qgb3duIHRoZSBhcmNoaXZlIChtZW1iZXIgb2YgZ3JvdXApXG5cdCAqIEBwYXJhbSBhcmNoaXZlSWQgSUQgZm9yIHRoZSBhcmNoaXZlIHRvIHJlYWQgYmxvYnMgZnJvbVxuXHQgKi9cblx0YXN5bmMgcmVxdWVzdFJlYWRUb2tlbkFyY2hpdmUoYXJjaGl2ZUlkOiBJZCk6IFByb21pc2U8QmxvYlNlcnZlckFjY2Vzc0luZm8+IHtcblx0XHRjb25zdCByZXF1ZXN0TmV3VG9rZW4gPSBhc3luYyAoKSA9PiB7XG5cdFx0XHRjb25zdCB0b2tlblJlcXVlc3QgPSBjcmVhdGVCbG9iQWNjZXNzVG9rZW5Qb3N0SW4oe1xuXHRcdFx0XHRhcmNoaXZlRGF0YVR5cGU6IG51bGwsXG5cdFx0XHRcdHJlYWQ6IGNyZWF0ZUJsb2JSZWFkRGF0YSh7XG5cdFx0XHRcdFx0YXJjaGl2ZUlkLFxuXHRcdFx0XHRcdGluc3RhbmNlSWRzOiBbXSxcblx0XHRcdFx0XHRpbnN0YW5jZUxpc3RJZDogbnVsbCxcblx0XHRcdFx0fSksXG5cdFx0XHRcdHdyaXRlOiBudWxsLFxuXHRcdFx0fSlcblx0XHRcdGNvbnN0IHsgYmxvYkFjY2Vzc0luZm8gfSA9IGF3YWl0IHRoaXMuc2VydmljZUV4ZWN1dG9yLnBvc3QoQmxvYkFjY2Vzc1Rva2VuU2VydmljZSwgdG9rZW5SZXF1ZXN0KVxuXHRcdFx0cmV0dXJuIGJsb2JBY2Nlc3NJbmZvXG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLnJlYWRDYWNoZS5nZXRUb2tlbihhcmNoaXZlSWQsIFtdLCByZXF1ZXN0TmV3VG9rZW4pXG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlIGEgZ2l2ZW4gcmVhZCBhcmNoaXZlIHRva2VuIGZyb20gdGhlIGNhY2hlLlxuXHQgKiBAcGFyYW0gYXJjaGl2ZUlkXG5cdCAqL1xuXHRldmljdEFyY2hpdmVUb2tlbihhcmNoaXZlSWQ6IElkKTogdm9pZCB7XG5cdFx0dGhpcy5yZWFkQ2FjaGUuZXZpY3RBcmNoaXZlT3JHcm91cEtleShhcmNoaXZlSWQpXG5cdH1cblxuXHRwcml2YXRlIGdldEFyY2hpdmVJZChyZWZlcmVuY2luZ0luc3RhbmNlczogcmVhZG9ubHkgQmxvYlJlZmVyZW5jaW5nSW5zdGFuY2VbXSk6IElkIHtcblx0XHRpZiAoaXNFbXB0eShyZWZlcmVuY2luZ0luc3RhbmNlcykpIHtcblx0XHRcdHRocm93IG5ldyBQcm9ncmFtbWluZ0Vycm9yKFwiTXVzdCBwYXNzIGF0IGxlYXN0IG9uZSByZWZlcmVuY2luZyBpbnN0YW5jZVwiKVxuXHRcdH1cblx0XHRjb25zdCBhcmNoaXZlSWRzID0gbmV3IFNldDxJZD4oKVxuXHRcdGZvciAoY29uc3QgcmVmZXJlbmNpbmdJbnN0YW5jZSBvZiByZWZlcmVuY2luZ0luc3RhbmNlcykge1xuXHRcdFx0aWYgKGlzRW1wdHkocmVmZXJlbmNpbmdJbnN0YW5jZS5ibG9icykpIHtcblx0XHRcdFx0dGhyb3cgbmV3IFByb2dyYW1taW5nRXJyb3IoXCJtdXN0IHBhc3MgYmxvYnNcIilcblx0XHRcdH1cblx0XHRcdGZvciAoY29uc3QgYmxvYiBvZiByZWZlcmVuY2luZ0luc3RhbmNlLmJsb2JzKSB7XG5cdFx0XHRcdGFyY2hpdmVJZHMuYWRkKGJsb2IuYXJjaGl2ZUlkKVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChhcmNoaXZlSWRzLnNpemUgIT0gMSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBvbmx5IG9uZSBhcmNoaXZlIGlkIGFsbG93ZWQsIGJ1dCB3YXMgJHthcmNoaXZlSWRzfWApXG5cdFx0fVxuXHRcdHJldHVybiByZWZlcmVuY2luZ0luc3RhbmNlc1swXS5ibG9ic1swXS5hcmNoaXZlSWRcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gYmxvYlNlcnZlckFjY2Vzc0luZm9cblx0ICogQHBhcmFtIGFkZGl0aW9uYWxSZXF1ZXN0UGFyYW1zXG5cdCAqIEBwYXJhbSB0eXBlUmVmIHRoZSB0eXBlUmVmIHRoYXQgc2hhbGwgYmUgdXNlZCB0byBkZXRlcm1pbmUgdGhlIGNvcnJlY3QgbW9kZWwgdmVyc2lvblxuXHQgKi9cblx0cHVibGljIGFzeW5jIGNyZWF0ZVF1ZXJ5UGFyYW1zKGJsb2JTZXJ2ZXJBY2Nlc3NJbmZvOiBCbG9iU2VydmVyQWNjZXNzSW5mbywgYWRkaXRpb25hbFJlcXVlc3RQYXJhbXM6IERpY3QsIHR5cGVSZWY6IFR5cGVSZWY8YW55Pik6IFByb21pc2U8RGljdD4ge1xuXHRcdGNvbnN0IHR5cGVNb2RlbCA9IGF3YWl0IHJlc29sdmVUeXBlUmVmZXJlbmNlKHR5cGVSZWYpXG5cdFx0cmV0dXJuIE9iamVjdC5hc3NpZ24oXG5cdFx0XHRhZGRpdGlvbmFsUmVxdWVzdFBhcmFtcyxcblx0XHRcdHtcblx0XHRcdFx0YmxvYkFjY2Vzc1Rva2VuOiBibG9iU2VydmVyQWNjZXNzSW5mby5ibG9iQWNjZXNzVG9rZW4sXG5cdFx0XHRcdHY6IHR5cGVNb2RlbC52ZXJzaW9uLFxuXHRcdFx0fSxcblx0XHRcdHRoaXMuYXV0aERhdGFQcm92aWRlci5jcmVhdGVBdXRoSGVhZGVycygpLFxuXHRcdClcblx0fVxufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgZ2l2ZW4gYWNjZXNzIHRva2VuIGNhbiBiZSB1c2VkIGZvciBhbm90aGVyIGJsb2Igc2VydmljZSByZXF1ZXN0cy5cbiAqIEBwYXJhbSBibG9iU2VydmVyQWNjZXNzSW5mb1xuICogQHBhcmFtIGRhdGVQcm92aWRlclxuICovXG5mdW5jdGlvbiBjYW5CZVVzZWRGb3JBbm90aGVyUmVxdWVzdChibG9iU2VydmVyQWNjZXNzSW5mbzogQmxvYlNlcnZlckFjY2Vzc0luZm8sIGRhdGVQcm92aWRlcjogRGF0ZVByb3ZpZGVyKTogYm9vbGVhbiB7XG5cdHJldHVybiBibG9iU2VydmVyQWNjZXNzSW5mby5leHBpcmVzLmdldFRpbWUoKSA+IGRhdGVQcm92aWRlci5ub3coKVxufVxuXG5jbGFzcyBCbG9iQWNjZXNzVG9rZW5DYWNoZSB7XG5cdHByaXZhdGUgcmVhZG9ubHkgaW5zdGFuY2VNYXA6IE1hcDxJZCwgQmxvYlNlcnZlckFjY2Vzc0luZm8+ID0gbmV3IE1hcCgpXG5cdHByaXZhdGUgcmVhZG9ubHkgYXJjaGl2ZU1hcDogTWFwPElkLCBCbG9iU2VydmVyQWNjZXNzSW5mbz4gPSBuZXcgTWFwKClcblxuXHRjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IGRhdGVQcm92aWRlcjogRGF0ZVByb3ZpZGVyKSB7fVxuXG5cdC8qKlxuXHQgKiBHZXQgYSB0b2tlbiBmcm9tIHRoZSBjYWNoZSBvciBmcm9tIHtAcGFyYW0gbG9hZGVyfS5cblx0ICogRmlyc3Qgd2lsbCB0cnkgdG8gdXNlIHRoZSB0b2tlbiBrZXllZCBieSB7QHBhcmFtIGFyY2hpdmVPckdyb3VwS2V5fSwgb3RoZXJ3aXNlIGl0IHdpbGwgdHJ5IHRvIGZpbmQgYSB0b2tlbiB2YWxpZCBmb3IgYWxsIG9mIHtAcGFyYW0gaW5zdGFuY2VJZHN9LlxuXHQgKi9cblx0cHVibGljIGFzeW5jIGdldFRva2VuKFxuXHRcdGFyY2hpdmVPckdyb3VwS2V5OiBJZCB8IG51bGwsXG5cdFx0aW5zdGFuY2VJZHM6IHJlYWRvbmx5IElkW10sXG5cdFx0bG9hZGVyOiAoKSA9PiBQcm9taXNlPEJsb2JTZXJ2ZXJBY2Nlc3NJbmZvPixcblx0KTogUHJvbWlzZTxCbG9iU2VydmVyQWNjZXNzSW5mbz4ge1xuXHRcdGNvbnN0IGFyY2hpdmVUb2tlbiA9IGFyY2hpdmVPckdyb3VwS2V5ID8gdGhpcy5hcmNoaXZlTWFwLmdldChhcmNoaXZlT3JHcm91cEtleSkgOiBudWxsXG5cdFx0aWYgKGFyY2hpdmVUb2tlbiAhPSBudWxsICYmIGNhbkJlVXNlZEZvckFub3RoZXJSZXF1ZXN0KGFyY2hpdmVUb2tlbiwgdGhpcy5kYXRlUHJvdmlkZXIpKSB7XG5cdFx0XHRyZXR1cm4gYXJjaGl2ZVRva2VuXG5cdFx0fVxuXG5cdFx0Y29uc3QgdG9rZW5zID0gZGVkdXBsaWNhdGUoaW5zdGFuY2VJZHMubWFwKChpZCkgPT4gdGhpcy5pbnN0YW5jZU1hcC5nZXQoaWQpID8/IG51bGwpKVxuXHRcdGNvbnN0IGZpcnN0VG9rZW5Gb3VuZCA9IGZpcnN0KHRva2Vucylcblx0XHRpZiAodG9rZW5zLmxlbmd0aCAhPSAxIHx8IGZpcnN0VG9rZW5Gb3VuZCA9PSBudWxsIHx8ICFjYW5CZVVzZWRGb3JBbm90aGVyUmVxdWVzdChmaXJzdFRva2VuRm91bmQsIHRoaXMuZGF0ZVByb3ZpZGVyKSkge1xuXHRcdFx0Y29uc3QgbmV3VG9rZW4gPSBhd2FpdCBsb2FkZXIoKVxuXHRcdFx0aWYgKGFyY2hpdmVPckdyb3VwS2V5ICE9IG51bGwgJiYgbmV3VG9rZW4udG9rZW5LaW5kID09PSBCbG9iQWNjZXNzVG9rZW5LaW5kLkFyY2hpdmUpIHtcblx0XHRcdFx0dGhpcy5hcmNoaXZlTWFwLnNldChhcmNoaXZlT3JHcm91cEtleSwgbmV3VG9rZW4pXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmb3IgKGNvbnN0IGlkIG9mIGluc3RhbmNlSWRzKSB7XG5cdFx0XHRcdFx0dGhpcy5pbnN0YW5jZU1hcC5zZXQoaWQsIG5ld1Rva2VuKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbmV3VG9rZW5cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGZpcnN0VG9rZW5Gb3VuZFxuXHRcdH1cblx0fVxuXG5cdHB1YmxpYyBldmljdEluc3RhbmNlSWQoaWQ6IElkKTogdm9pZCB7XG5cdFx0dGhpcy5ldmljdEFsbChbaWRdKVxuXHR9XG5cblx0cHVibGljIGV2aWN0QXJjaGl2ZU9yR3JvdXBLZXkoaWQ6IElkKTogdm9pZCB7XG5cdFx0dGhpcy5hcmNoaXZlTWFwLmRlbGV0ZShpZClcblx0fVxuXG5cdHB1YmxpYyBldmljdEFsbChpZHM6IElkW10pOiB2b2lkIHtcblx0XHRmb3IgKGNvbnN0IGlkIG9mIGlkcykge1xuXHRcdFx0dGhpcy5pbnN0YW5jZU1hcC5kZWxldGUoaWQpXG5cdFx0fVxuXHR9XG59XG4iLCJpbXBvcnQgeyBkZWJvdW5jZSB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHsgY3JlYXRlVXBkYXRlU2Vzc2lvbktleXNQb3N0SW4sIEdyb3VwS2V5VXBkYXRlVHlwZVJlZiwgSW5zdGFuY2VTZXNzaW9uS2V5IH0gZnJvbSBcIi4uLy4uL2VudGl0aWVzL3N5cy9UeXBlUmVmcy5qc1wiXG5pbXBvcnQgeyBMb2NrZWRFcnJvciB9IGZyb20gXCIuLi8uLi9jb21tb24vZXJyb3IvUmVzdEVycm9yXCJcbmltcG9ydCB7IGFzc2VydFdvcmtlck9yTm9kZSB9IGZyb20gXCIuLi8uLi9jb21tb24vRW52XCJcbmltcG9ydCB7IElTZXJ2aWNlRXhlY3V0b3IgfSBmcm9tIFwiLi4vLi4vY29tbW9uL1NlcnZpY2VSZXF1ZXN0XCJcbmltcG9ydCB7IFVwZGF0ZVNlc3Npb25LZXlzU2VydmljZSB9IGZyb20gXCIuLi8uLi9lbnRpdGllcy9zeXMvU2VydmljZXNcIlxuaW1wb3J0IHsgVXNlckZhY2FkZSB9IGZyb20gXCIuLi9mYWNhZGVzL1VzZXJGYWNhZGVcIlxuaW1wb3J0IHsgVHlwZU1vZGVsIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9FbnRpdHlUeXBlcy5qc1wiXG5pbXBvcnQgeyByZXNvbHZlVHlwZVJlZmVyZW5jZSB9IGZyb20gXCIuLi8uLi9jb21tb24vRW50aXR5RnVuY3Rpb25zLmpzXCJcblxuYXNzZXJ0V29ya2VyT3JOb2RlKClcblxuZXhwb3J0IGNvbnN0IFVQREFURV9TRVNTSU9OX0tFWVNfU0VSVklDRV9ERUJPVU5DRV9NUyA9IDUwXG5cbi8qKlxuICogVGhpcyBxdWV1ZSBjb2xsZWN0cyB1cGRhdGVzIGZvciBvd25lckVuY1Nlc3Npb25LZXlzIGFuZCBkZWJvdW5jZXMgdGhlIHVwZGF0ZSByZXF1ZXN0IHRvIHRoZSBVcGRhdGVTZXNzaW9uS2V5c1NlcnZpY2UsXG4gKiBpbiBvcmRlciB0byB1cGRhdGUgYXMgbWFueSBpbnN0YW5jZXMgaW4gb25lIHJlcXVlc3QgYXMgcG9zc2libGUuXG4gKlxuICogSW4gY2FzZSBvZiBMb2NrZWRFcnJvcnMgaXQgd2lsbCByZXRyeS4gSW4gY2FzZSBvZiBvdGhlciBlcnJvcnMgaXQgd2lsbCBkaXNjYXJkIHRoZSB1cGRhdGUuXG4gKiAoVGhlIG5leHQgdGltZSB0aGUgaW5zdGFuY2Ugc2Vzc2lvbiBrZXkgaXMgcmVzb2x2ZWQgdXNpbmcgdGhlIGJ1Y2tldCBrZXkgYSBuZXcgdXBkYXRlIGF0dGVtcHQgd2lsbCBiZSBtYWRlIGZvciB0aG9zZSBpbnN0YW5jZXMuKVxuICovXG5leHBvcnQgY2xhc3MgT3duZXJFbmNTZXNzaW9uS2V5c1VwZGF0ZVF1ZXVlIHtcblx0cHJpdmF0ZSB1cGRhdGVJbnN0YW5jZVNlc3Npb25LZXlRdWV1ZTogQXJyYXk8SW5zdGFuY2VTZXNzaW9uS2V5PiA9IFtdXG5cdHByaXZhdGUgcmVhZG9ubHkgaW52b2tlVXBkYXRlU2Vzc2lvbktleVNlcnZpY2U6ICgpID0+IFByb21pc2U8dm9pZD5cblx0cHJpdmF0ZSBzZW5kZXJBdXRoU3RhdHVzRm9yTWFpbEluc3RhbmNlOiB7IGF1dGhlbnRpY2F0ZWQ6IGJvb2xlYW47IGluc3RhbmNlRWxlbWVudElkOiBJZCB9IHwgbnVsbCA9IG51bGxcblxuXHRjb25zdHJ1Y3Rvcihcblx0XHRwcml2YXRlIHJlYWRvbmx5IHVzZXJGYWNhZGU6IFVzZXJGYWNhZGUsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBzZXJ2aWNlRXhlY3V0b3I6IElTZXJ2aWNlRXhlY3V0b3IsXG5cdFx0Ly8gYWxsb3cgcGFzc2luZyB0aGUgdGltZW91dCBmb3IgdGVzdGFiaWxpdHlcblx0XHRkZWJvdW5jZVRpbWVvdXRNczogbnVtYmVyID0gVVBEQVRFX1NFU1NJT05fS0VZU19TRVJWSUNFX0RFQk9VTkNFX01TLFxuXHQpIHtcblx0XHR0aGlzLmludm9rZVVwZGF0ZVNlc3Npb25LZXlTZXJ2aWNlID0gZGVib3VuY2UoZGVib3VuY2VUaW1lb3V0TXMsICgpID0+IHRoaXMuc2VuZFVwZGF0ZVJlcXVlc3QoKSlcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGQgdGhlIG93bmVyRW5jU2Vzc2lvbktleSB1cGRhdGVzIHRvIHRoZSBxdWV1ZSBhbmQgZGVib3VuY2UgdGhlIHVwZGF0ZSByZXF1ZXN0LlxuXHQgKlxuXHQgKiBAcGFyYW0gaW5zdGFuY2VTZXNzaW9uS2V5cyBhbGwgaW5zdGFuY2VTZXNzaW9uS2V5cyBmcm9tIG9uZSBidWNrZXRLZXkgY29udGFpbmluZyB0aGUgb3duZXJFbmNTZXNzaW9uS2V5IGFzIHN5bUVuY1Nlc3Npb25LZXlcblx0ICogQHBhcmFtIHR5cGVNb2RlbCBvZiB0aGUgbWFpbiBpbnN0YW5jZSB0aGF0IHdlIGFyZSB1cGRhdGluZyBzZXNzaW9uIGtleXMgZm9yXG5cdCAqL1xuXHRhc3luYyB1cGRhdGVJbnN0YW5jZVNlc3Npb25LZXlzKGluc3RhbmNlU2Vzc2lvbktleXM6IEFycmF5PEluc3RhbmNlU2Vzc2lvbktleT4sIHR5cGVNb2RlbDogVHlwZU1vZGVsKSB7XG5cdFx0aWYgKHRoaXMudXNlckZhY2FkZS5pc0xlYWRlcigpKSB7XG5cdFx0XHRjb25zdCBncm91cEtleVVwZGF0ZVR5cGVNb2RlbCA9IGF3YWl0IHJlc29sdmVUeXBlUmVmZXJlbmNlKEdyb3VwS2V5VXBkYXRlVHlwZVJlZilcblx0XHRcdGlmIChncm91cEtleVVwZGF0ZVR5cGVNb2RlbC5pZCAhPT0gdHlwZU1vZGVsLmlkKSB7XG5cdFx0XHRcdHRoaXMudXBkYXRlSW5zdGFuY2VTZXNzaW9uS2V5UXVldWUucHVzaCguLi5pbnN0YW5jZVNlc3Npb25LZXlzKVxuXHRcdFx0XHR0aGlzLmludm9rZVVwZGF0ZVNlc3Npb25LZXlTZXJ2aWNlKClcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIHNlbmRVcGRhdGVSZXF1ZXN0KCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IGluc3RhbmNlU2Vzc2lvbktleXMgPSB0aGlzLnVwZGF0ZUluc3RhbmNlU2Vzc2lvbktleVF1ZXVlXG5cdFx0dGhpcy51cGRhdGVJbnN0YW5jZVNlc3Npb25LZXlRdWV1ZSA9IFtdXG5cdFx0dHJ5IHtcblx0XHRcdGlmIChpbnN0YW5jZVNlc3Npb25LZXlzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0YXdhaXQgdGhpcy5wb3N0VXBkYXRlU2Vzc2lvbktleXNTZXJ2aWNlKGluc3RhbmNlU2Vzc2lvbktleXMpXG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0aWYgKGUgaW5zdGFuY2VvZiBMb2NrZWRFcnJvcikge1xuXHRcdFx0XHR0aGlzLnVwZGF0ZUluc3RhbmNlU2Vzc2lvbktleVF1ZXVlLnB1c2goLi4uaW5zdGFuY2VTZXNzaW9uS2V5cylcblx0XHRcdFx0dGhpcy5pbnZva2VVcGRhdGVTZXNzaW9uS2V5U2VydmljZSgpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcImVycm9yIGR1cmluZyBzZXNzaW9uIGtleSB1cGRhdGU6XCIsIGUubmFtZSwgaW5zdGFuY2VTZXNzaW9uS2V5cy5sZW5ndGgpXG5cdFx0XHRcdHRocm93IGVcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRhc3luYyBwb3N0VXBkYXRlU2Vzc2lvbktleXNTZXJ2aWNlKGluc3RhbmNlU2Vzc2lvbktleXM6IEFycmF5PEluc3RhbmNlU2Vzc2lvbktleT4pIHtcblx0XHRjb25zdCBpbnB1dCA9IGNyZWF0ZVVwZGF0ZVNlc3Npb25LZXlzUG9zdEluKHsgb3duZXJFbmNTZXNzaW9uS2V5czogaW5zdGFuY2VTZXNzaW9uS2V5cyB9KVxuXHRcdGF3YWl0IHRoaXMuc2VydmljZUV4ZWN1dG9yLnBvc3QoVXBkYXRlU2Vzc2lvbktleXNTZXJ2aWNlLCBpbnB1dClcblx0fVxufVxuIiwiaW1wb3J0IHsgRXZlbnRCdXNMaXN0ZW5lciB9IGZyb20gXCIuL0V2ZW50QnVzQ2xpZW50LmpzXCJcbmltcG9ydCB7IFdzQ29ubmVjdGlvblN0YXRlIH0gZnJvbSBcIi4uL21haW4vV29ya2VyQ2xpZW50LmpzXCJcbmltcG9ydCB7XG5cdEVudGl0eVVwZGF0ZSxcblx0R3JvdXBLZXlVcGRhdGVUeXBlUmVmLFxuXHRVc2VyR3JvdXBLZXlEaXN0cmlidXRpb25UeXBlUmVmLFxuXHRVc2VyVHlwZVJlZixcblx0V2Vic29ja2V0Q291bnRlckRhdGEsXG5cdFdlYnNvY2tldExlYWRlclN0YXR1cyxcbn0gZnJvbSBcIi4uL2VudGl0aWVzL3N5cy9UeXBlUmVmcy5qc1wiXG5pbXBvcnQgeyBSZXBvcnRlZE1haWxGaWVsZE1hcmtlciB9IGZyb20gXCIuLi9lbnRpdGllcy90dXRhbm90YS9UeXBlUmVmcy5qc1wiXG5pbXBvcnQgeyBXZWJzb2NrZXRDb25uZWN0aXZpdHlMaXN0ZW5lciB9IGZyb20gXCIuLi8uLi9taXNjL1dlYnNvY2tldENvbm5lY3Rpdml0eU1vZGVsLmpzXCJcbmltcG9ydCB7IGlzQWRtaW5DbGllbnQsIGlzVGVzdCB9IGZyb20gXCIuLi9jb21tb24vRW52LmpzXCJcbmltcG9ydCB7IE1haWxGYWNhZGUgfSBmcm9tIFwiLi9mYWNhZGVzL2xhenkvTWFpbEZhY2FkZS5qc1wiXG5pbXBvcnQgeyBVc2VyRmFjYWRlIH0gZnJvbSBcIi4vZmFjYWRlcy9Vc2VyRmFjYWRlLmpzXCJcbmltcG9ydCB7IEVudGl0eUNsaWVudCB9IGZyb20gXCIuLi9jb21tb24vRW50aXR5Q2xpZW50LmpzXCJcbmltcG9ydCB7IEFjY291bnRUeXBlLCBPcGVyYXRpb25UeXBlIH0gZnJvbSBcIi4uL2NvbW1vbi9UdXRhbm90YUNvbnN0YW50cy5qc1wiXG5pbXBvcnQgeyBpc1NhbWVUeXBlUmVmQnlBdHRyLCBsYXp5QXN5bmMgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB7IGlzU2FtZUlkIH0gZnJvbSBcIi4uL2NvbW1vbi91dGlscy9FbnRpdHlVdGlscy5qc1wiXG5pbXBvcnQgeyBFeHBvc2VkRXZlbnRDb250cm9sbGVyIH0gZnJvbSBcIi4uL21haW4vRXZlbnRDb250cm9sbGVyLmpzXCJcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25EYXRhYmFzZSB9IGZyb20gXCIuL2ZhY2FkZXMvbGF6eS9Db25maWd1cmF0aW9uRGF0YWJhc2UuanNcIlxuaW1wb3J0IHsgS2V5Um90YXRpb25GYWNhZGUgfSBmcm9tIFwiLi9mYWNhZGVzL0tleVJvdGF0aW9uRmFjYWRlLmpzXCJcbmltcG9ydCB7IENhY2hlTWFuYWdlbWVudEZhY2FkZSB9IGZyb20gXCIuL2ZhY2FkZXMvbGF6eS9DYWNoZU1hbmFnZW1lbnRGYWNhZGUuanNcIlxuaW1wb3J0IHR5cGUgeyBRdWV1ZWRCYXRjaCB9IGZyb20gXCIuL0V2ZW50UXVldWUuanNcIlxuXG4vKiogQSBiaXQgb2YgZ2x1ZSB0byBkaXN0cmlidXRlIGV2ZW50IGJ1cyBldmVudHMgYWNyb3NzIHRoZSBhcHAuICovXG5leHBvcnQgY2xhc3MgRXZlbnRCdXNFdmVudENvb3JkaW5hdG9yIGltcGxlbWVudHMgRXZlbnRCdXNMaXN0ZW5lciB7XG5cdGNvbnN0cnVjdG9yKFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgY29ubmVjdGl2aXR5TGlzdGVuZXI6IFdlYnNvY2tldENvbm5lY3Rpdml0eUxpc3RlbmVyLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgbWFpbEZhY2FkZTogbGF6eUFzeW5jPE1haWxGYWNhZGU+LFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgdXNlckZhY2FkZTogVXNlckZhY2FkZSxcblx0XHRwcml2YXRlIHJlYWRvbmx5IGVudGl0eUNsaWVudDogRW50aXR5Q2xpZW50LFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgZXZlbnRDb250cm9sbGVyOiBFeHBvc2VkRXZlbnRDb250cm9sbGVyLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgY29uZmlndXJhdGlvbkRhdGFiYXNlOiBsYXp5QXN5bmM8Q29uZmlndXJhdGlvbkRhdGFiYXNlPixcblx0XHRwcml2YXRlIHJlYWRvbmx5IGtleVJvdGF0aW9uRmFjYWRlOiBLZXlSb3RhdGlvbkZhY2FkZSxcblx0XHRwcml2YXRlIHJlYWRvbmx5IGNhY2hlTWFuYWdlbWVudEZhY2FkZTogbGF6eUFzeW5jPENhY2hlTWFuYWdlbWVudEZhY2FkZT4sXG5cdFx0cHJpdmF0ZSByZWFkb25seSBzZW5kRXJyb3I6IChlcnJvcjogRXJyb3IpID0+IFByb21pc2U8dm9pZD4sXG5cdFx0cHJpdmF0ZSByZWFkb25seSBhcHBTcGVjaWZpY0JhdGNoSGFuZGxpbmc6IChxdWV1ZWRCYXRjaDogUXVldWVkQmF0Y2hbXSkgPT4gdm9pZCxcblx0KSB7fVxuXG5cdG9uV2Vic29ja2V0U3RhdGVDaGFuZ2VkKHN0YXRlOiBXc0Nvbm5lY3Rpb25TdGF0ZSkge1xuXHRcdHRoaXMuY29ubmVjdGl2aXR5TGlzdGVuZXIudXBkYXRlV2ViU29ja2V0U3RhdGUoc3RhdGUpXG5cdH1cblxuXHRhc3luYyBvbkVudGl0eUV2ZW50c1JlY2VpdmVkKGV2ZW50czogRW50aXR5VXBkYXRlW10sIGJhdGNoSWQ6IElkLCBncm91cElkOiBJZCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGF3YWl0IHRoaXMuZW50aXR5RXZlbnRzUmVjZWl2ZWQoZXZlbnRzKVxuXHRcdGF3YWl0IChhd2FpdCB0aGlzLm1haWxGYWNhZGUoKSkuZW50aXR5RXZlbnRzUmVjZWl2ZWQoZXZlbnRzKVxuXHRcdGF3YWl0IHRoaXMuZXZlbnRDb250cm9sbGVyLm9uRW50aXR5VXBkYXRlUmVjZWl2ZWQoZXZlbnRzLCBncm91cElkKVxuXHRcdC8vIENhbGwgdGhlIGluZGV4ZXIgaW4gdGhpcyBsYXN0IHN0ZXAgYmVjYXVzZSBub3cgdGhlIHByb2Nlc3NlZCBldmVudCBpcyBzdG9yZWQgYW5kIHRoZSBpbmRleGVyIGhhcyBhIHNlcGFyYXRlIGV2ZW50IHF1ZXVlIHRoYXRcblx0XHQvLyBzaGFsbCBub3QgcmVjZWl2ZSB0aGUgZXZlbnQgdHdpY2UuXG5cdFx0aWYgKCFpc1Rlc3QoKSAmJiAhaXNBZG1pbkNsaWVudCgpKSB7XG5cdFx0XHRjb25zdCBxdWV1ZWRCYXRjaCA9IHsgZ3JvdXBJZCwgYmF0Y2hJZCwgZXZlbnRzIH1cblx0XHRcdGNvbnN0IGNvbmZpZ3VyYXRpb25EYXRhYmFzZSA9IGF3YWl0IHRoaXMuY29uZmlndXJhdGlvbkRhdGFiYXNlKClcblx0XHRcdGF3YWl0IGNvbmZpZ3VyYXRpb25EYXRhYmFzZS5vbkVudGl0eUV2ZW50c1JlY2VpdmVkKHF1ZXVlZEJhdGNoKVxuXHRcdFx0dGhpcy5hcHBTcGVjaWZpY0JhdGNoSGFuZGxpbmcoW3F1ZXVlZEJhdGNoXSlcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQHBhcmFtIG1hcmtlcnMgb25seSBwaGlzaGluZyAobm90IHNwYW0pIG1hcmtlciB3aWxsIGJlIHNlbnQgYXMgd2Vic29ja2V0IHVwZGF0ZXNcblx0ICovXG5cdGFzeW5jIG9uUGhpc2hpbmdNYXJrZXJzUmVjZWl2ZWQobWFya2VyczogUmVwb3J0ZWRNYWlsRmllbGRNYXJrZXJbXSkge1xuXHRcdDsoYXdhaXQgdGhpcy5tYWlsRmFjYWRlKCkpLnBoaXNoaW5nTWFya2Vyc1VwZGF0ZVJlY2VpdmVkKG1hcmtlcnMpXG5cdH1cblxuXHRvbkVycm9yKHR1dGFub3RhRXJyb3I6IEVycm9yKSB7XG5cdFx0dGhpcy5zZW5kRXJyb3IodHV0YW5vdGFFcnJvcilcblx0fVxuXG5cdG9uTGVhZGVyU3RhdHVzQ2hhbmdlZChsZWFkZXJTdGF0dXM6IFdlYnNvY2tldExlYWRlclN0YXR1cykge1xuXHRcdHRoaXMuY29ubmVjdGl2aXR5TGlzdGVuZXIub25MZWFkZXJTdGF0dXNDaGFuZ2VkKGxlYWRlclN0YXR1cylcblx0XHRpZiAoIWlzQWRtaW5DbGllbnQoKSkge1xuXHRcdFx0Y29uc3QgdXNlciA9IHRoaXMudXNlckZhY2FkZS5nZXRVc2VyKClcblx0XHRcdGlmIChsZWFkZXJTdGF0dXMubGVhZGVyU3RhdHVzICYmIHVzZXIgJiYgdXNlci5hY2NvdW50VHlwZSAhPT0gQWNjb3VudFR5cGUuRVhURVJOQUwpIHtcblx0XHRcdFx0dGhpcy5rZXlSb3RhdGlvbkZhY2FkZS5wcm9jZXNzUGVuZGluZ0tleVJvdGF0aW9uc0FuZFVwZGF0ZXModXNlcilcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMua2V5Um90YXRpb25GYWNhZGUucmVzZXQoKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdG9uQ291bnRlckNoYW5nZWQoY291bnRlcjogV2Vic29ja2V0Q291bnRlckRhdGEpIHtcblx0XHR0aGlzLmV2ZW50Q29udHJvbGxlci5vbkNvdW50ZXJzVXBkYXRlUmVjZWl2ZWQoY291bnRlcilcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgZW50aXR5RXZlbnRzUmVjZWl2ZWQoZGF0YTogRW50aXR5VXBkYXRlW10pOiBQcm9taXNlPHZvaWQ+IHtcblx0XHQvLyBUaGlzIGlzIGEgY29tcHJvbWlzZSB0byBub3QgYWRkIGVudGl0eUNsaWVudCB0byBVc2VyRmFjYWRlIHdoaWNoIHdvdWxkIGludHJvZHVjZSBhIGNpcmN1bGFyIGRlcC5cblx0XHRjb25zdCBncm91cEtleVVwZGF0ZXM6IElkVHVwbGVbXSA9IFtdIC8vIEdyb3VwS2V5VXBkYXRlcyBhbGwgaW4gdGhlIHNhbWUgbGlzdFxuXHRcdGNvbnN0IHVzZXIgPSB0aGlzLnVzZXJGYWNhZGUuZ2V0VXNlcigpXG5cdFx0aWYgKHVzZXIgPT0gbnVsbCkgcmV0dXJuXG5cdFx0Zm9yIChjb25zdCB1cGRhdGUgb2YgZGF0YSkge1xuXHRcdFx0aWYgKFxuXHRcdFx0XHR1cGRhdGUub3BlcmF0aW9uID09PSBPcGVyYXRpb25UeXBlLlVQREFURSAmJlxuXHRcdFx0XHRpc1NhbWVUeXBlUmVmQnlBdHRyKFVzZXJUeXBlUmVmLCB1cGRhdGUuYXBwbGljYXRpb24sIHVwZGF0ZS50eXBlKSAmJlxuXHRcdFx0XHRpc1NhbWVJZCh1c2VyLl9pZCwgdXBkYXRlLmluc3RhbmNlSWQpXG5cdFx0XHQpIHtcblx0XHRcdFx0YXdhaXQgdGhpcy51c2VyRmFjYWRlLnVwZGF0ZVVzZXIoYXdhaXQgdGhpcy5lbnRpdHlDbGllbnQubG9hZChVc2VyVHlwZVJlZiwgdXNlci5faWQpKVxuXHRcdFx0fSBlbHNlIGlmIChcblx0XHRcdFx0KHVwZGF0ZS5vcGVyYXRpb24gPT09IE9wZXJhdGlvblR5cGUuQ1JFQVRFIHx8IHVwZGF0ZS5vcGVyYXRpb24gPT09IE9wZXJhdGlvblR5cGUuVVBEQVRFKSAmJlxuXHRcdFx0XHRpc1NhbWVUeXBlUmVmQnlBdHRyKFVzZXJHcm91cEtleURpc3RyaWJ1dGlvblR5cGVSZWYsIHVwZGF0ZS5hcHBsaWNhdGlvbiwgdXBkYXRlLnR5cGUpICYmXG5cdFx0XHRcdGlzU2FtZUlkKHVzZXIudXNlckdyb3VwLmdyb3VwLCB1cGRhdGUuaW5zdGFuY2VJZClcblx0XHRcdCkge1xuXHRcdFx0XHRhd2FpdCAoYXdhaXQgdGhpcy5jYWNoZU1hbmFnZW1lbnRGYWNhZGUoKSkudHJ5VXBkYXRpbmdVc2VyR3JvdXBLZXkoKVxuXHRcdFx0fSBlbHNlIGlmICh1cGRhdGUub3BlcmF0aW9uID09PSBPcGVyYXRpb25UeXBlLkNSRUFURSAmJiBpc1NhbWVUeXBlUmVmQnlBdHRyKEdyb3VwS2V5VXBkYXRlVHlwZVJlZiwgdXBkYXRlLmFwcGxpY2F0aW9uLCB1cGRhdGUudHlwZSkpIHtcblx0XHRcdFx0Z3JvdXBLZXlVcGRhdGVzLnB1c2goW3VwZGF0ZS5pbnN0YW5jZUxpc3RJZCwgdXBkYXRlLmluc3RhbmNlSWRdKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRhd2FpdCB0aGlzLmtleVJvdGF0aW9uRmFjYWRlLnVwZGF0ZUdyb3VwTWVtYmVyc2hpcHMoZ3JvdXBLZXlVcGRhdGVzKVxuXHR9XG59XG4iLCJpbXBvcnQgeyBhZXMyNTZSYW5kb21LZXksIGtleVRvQmFzZTY0IH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS1jcnlwdG9cIlxuaW1wb3J0IHsgTG9nZ2VyIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9Mb2dnZXIuanNcIlxuXG4vKipcbiAqICBMb29zZSBjb2xsZWN0aW9uIG9mIGZ1bmN0aW9ucyB0aGF0IHNob3VsZCBiZSBydW4gb24gdGhlIHdvcmtlciBzaWRlIGUuZy4gYmVjYXVzZSB0aGV5IHRha2UgdG9vIG11Y2ggdGltZSBhbmQgZG9uJ3QgYmVsb25nIGFueXdoZXJlIGVsc2UuXG4gKiAgKHJlYWQ6IGtpdGNoZW4gc2luaykuXG4gKi9cbmV4cG9ydCBjbGFzcyBXb3JrZXJGYWNhZGUge1xuXHRhc3luYyBnZW5lcmF0ZVNzZVB1c2hJZGVudGlmZXIoKTogUHJvbWlzZTxzdHJpbmc+IHtcblx0XHRyZXR1cm4ga2V5VG9CYXNlNjQoYWVzMjU2UmFuZG9tS2V5KCkpXG5cdH1cblxuXHRhc3luYyBnZXRMb2coKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuXHRcdGNvbnN0IGdsb2JhbCA9IHNlbGYgYXMgYW55XG5cdFx0Y29uc3QgbG9nZ2VyID0gZ2xvYmFsLmxvZ2dlciBhcyBMb2dnZXIgfCB1bmRlZmluZWRcblxuXHRcdGlmIChsb2dnZXIpIHtcblx0XHRcdHJldHVybiBsb2dnZXIuZ2V0RW50cmllcygpXG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBbXVxuXHRcdH1cblx0fVxuXG5cdGFzeW5jIHVybGlmeShodG1sOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuXHRcdGNvbnN0IHsgdXJsaWZ5IH0gPSBhd2FpdCBpbXBvcnQoXCIuLi9VcmxpZmllci5qc1wiKVxuXHRcdHJldHVybiB1cmxpZnkoaHRtbClcblx0fVxufVxuIiwiaW1wb3J0IHsgQWVzMjU2S2V5LCBBcmdvbjJJREV4cG9ydHMsIGdlbmVyYXRlS2V5RnJvbVBhc3NwaHJhc2VBcmdvbjJpZCwgdWludDhBcnJheVRvQml0QXJyYXkgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLWNyeXB0b1wiXG5pbXBvcnQgeyBMYXp5TG9hZGVkLCBzdHJpbmdUb1V0ZjhVaW50OEFycmF5IH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5pbXBvcnQgeyBOYXRpdmVDcnlwdG9GYWNhZGUgfSBmcm9tIFwiLi4vLi4vLi4vbmF0aXZlL2NvbW1vbi9nZW5lcmF0ZWRpcGMvTmF0aXZlQ3J5cHRvRmFjYWRlLmpzXCJcbmltcG9ydCB7IGFzc2VydFdvcmtlck9yTm9kZSB9IGZyb20gXCIuLi8uLi9jb21tb24vRW52LmpzXCJcbmltcG9ydCB7IGxvYWRXYXNtIH0gZnJvbSBcImFyZ29uMi53YXNtXCJcblxuYXNzZXJ0V29ya2VyT3JOb2RlKClcblxuLyoqXG4gKiBBYnN0cmFjdCBpbnRlcmZhY2UgZm9yIGdlbmVyYXRpbmcgQXJnb24yaWQgcGFzc3BocmFzZSBrZXlzIHVzaW5nIHRoZSBwcmVmZXJyZWQgaW1wbGVtZW50YXRpb24gKGkuZS4gbmF0aXZlIG9yIFdBU00pXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQXJnb24yaWRGYWNhZGUge1xuXHQvKipcblx0ICogR2VuZXJhdGUgYSBrZXkgZnJvbSBhIHBhc3NwaHJhc2Vcblx0ICogQHBhcmFtIHBhc3NwaHJhc2Vcblx0ICogQHBhcmFtIHNhbHRcblx0ICogQHJldHVybiBiaXQgYXJyYXkgb2YgdGhlIHJlc3VsdGluZyBrZXlcblx0ICovXG5cdGdlbmVyYXRlS2V5RnJvbVBhc3NwaHJhc2UocGFzc3BocmFzZTogc3RyaW5nLCBzYWx0OiBVaW50OEFycmF5KTogUHJvbWlzZTxBZXMyNTZLZXk+XG59XG5cbi8qKlxuICogV2ViQXNzZW1ibHkgaW1wbGVtZW50YXRpb24gb2YgQXJnb24yaWRcbiAqL1xuZXhwb3J0IGNsYXNzIFdBU01BcmdvbjJpZEZhY2FkZSBpbXBsZW1lbnRzIEFyZ29uMmlkRmFjYWRlIHtcblx0Ly8gbG9hZHMgYXJnb24yIFdBU01cblx0cHJpdmF0ZSBhcmdvbjI6IExhenlMb2FkZWQ8QXJnb24ySURFeHBvcnRzPiA9IG5ldyBMYXp5TG9hZGVkKGFzeW5jICgpID0+IHtcblx0XHRyZXR1cm4gYXdhaXQgbG9hZFdhc20oKVxuXHR9KVxuXG5cdGFzeW5jIGdlbmVyYXRlS2V5RnJvbVBhc3NwaHJhc2UocGFzc3BocmFzZTogc3RyaW5nLCBzYWx0OiBVaW50OEFycmF5KTogUHJvbWlzZTxBZXMyNTZLZXk+IHtcblx0XHRyZXR1cm4gZ2VuZXJhdGVLZXlGcm9tUGFzc3BocmFzZUFyZ29uMmlkKGF3YWl0IHRoaXMuYXJnb24yLmdldEFzeW5jKCksIHBhc3NwaHJhc2UsIHNhbHQpXG5cdH1cbn1cblxuLyoqXG4gKiBOYXRpdmUgaW1wbGVtZW50YXRpb24gb2YgQXJnb24yaWRcbiAqL1xuZXhwb3J0IGNsYXNzIE5hdGl2ZUFyZ29uMmlkRmFjYWRlIGltcGxlbWVudHMgQXJnb24yaWRGYWNhZGUge1xuXHRjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IG5hdGl2ZUNyeXB0b0ZhY2FkZTogTmF0aXZlQ3J5cHRvRmFjYWRlKSB7fVxuXG5cdGFzeW5jIGdlbmVyYXRlS2V5RnJvbVBhc3NwaHJhc2UocGFzc3BocmFzZTogc3RyaW5nLCBzYWx0OiBVaW50OEFycmF5KTogUHJvbWlzZTxBZXMyNTZLZXk+IHtcblx0XHRjb25zdCBoYXNoID0gYXdhaXQgdGhpcy5uYXRpdmVDcnlwdG9GYWNhZGUuYXJnb24yaWRHZW5lcmF0ZVBhc3NwaHJhc2VLZXkocGFzc3BocmFzZSwgc2FsdClcblx0XHRyZXR1cm4gdWludDhBcnJheVRvQml0QXJyYXkoaGFzaClcblx0fVxufVxuIiwiaW1wb3J0IHsgTGF6eUxvYWRlZCB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHsgTmF0aXZlQ3J5cHRvRmFjYWRlIH0gZnJvbSBcIi4uLy4uLy4uL25hdGl2ZS9jb21tb24vZ2VuZXJhdGVkaXBjL05hdGl2ZUNyeXB0b0ZhY2FkZS5qc1wiXG5pbXBvcnQgeyBhc3NlcnRXb3JrZXJPck5vZGUgfSBmcm9tIFwiLi4vLi4vY29tbW9uL0Vudi5qc1wiXG5pbXBvcnQge1xuXHRkZWNhcHN1bGF0ZUt5YmVyLFxuXHRlbmNhcHN1bGF0ZUt5YmVyLFxuXHRnZW5lcmF0ZUtleVBhaXJLeWJlcixcblx0TUxfS0VNX1JBTkRfQU1PVU5UX09GX0VOVFJPUFksXG5cdEt5YmVyRW5jYXBzdWxhdGlvbixcblx0S3liZXJLZXlQYWlyLFxuXHRLeWJlclByaXZhdGVLZXksXG5cdEt5YmVyUHVibGljS2V5LFxuXHRMaWJPUVNFeHBvcnRzLFxuXHRyYW5kb20sXG59IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtY3J5cHRvXCJcbmltcG9ydCB7IGxvYWRXYXNtIH0gZnJvbSBcImxpYm9xcy53YXNtXCJcblxuYXNzZXJ0V29ya2VyT3JOb2RlKClcblxuLyoqXG4gKiBBYnN0cmFjdCBpbnRlcmZhY2UgZm9yIHRoZSBMaWJvcXMgY3J5cHRvIHN5c3RlbS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBLeWJlckZhY2FkZSB7XG5cdC8qKlxuXHQgKiBHZW5lcmF0ZSBhIGtleSBuZXcgcmFuZG9tIGtleSBwYWlyXG5cdCAqL1xuXHRnZW5lcmF0ZUtleXBhaXIoKTogUHJvbWlzZTxLeWJlcktleVBhaXI+XG5cblx0LyoqXG5cdCAqXG5cdCAqIEBwYXJhbSBwdWJsaWNLZXkgdGhlIHB1YmxpYyBrZXkgdG8gZW5jYXBzdWxhdGUgdGhlIHNlY3JldCB3aXRoXG5cdCAqIEByZXR1cm5zIHRoZSBjaXBoZXJ0ZXh0IGFuZCB0aGUgc2hhcmVkIHNlY3JldFxuXHQgKi9cblx0ZW5jYXBzdWxhdGUocHVibGljS2V5OiBLeWJlclB1YmxpY0tleSk6IFByb21pc2U8S3liZXJFbmNhcHN1bGF0aW9uPlxuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gcHJpdmF0ZUtleSB0aGUgY29ycmVzcG9uZGluZyBwcml2YXRlIGtleSB0byB0aGUgcHVibGljIGtleSB1c2VkIHRvIGVuY2Fwc3VsYXRlIHRoZSBjaXBoZXIgdGV4dFxuXHQgKiBAcGFyYW0gY2lwaGVydGV4dCB0aGUgZW5jYXBzdWxhdGVkIGNpcGhlcnRleHRcblx0ICogQHJldHVybnMgdGhlIHNoYXJlZCBzZWNyZXRcblx0ICovXG5cdGRlY2Fwc3VsYXRlKHByaXZhdGVLZXk6IEt5YmVyUHJpdmF0ZUtleSwgY2lwaGVydGV4dDogVWludDhBcnJheSk6IFByb21pc2U8VWludDhBcnJheT5cbn1cblxuLyoqXG4gKiBXZWJBc3NlbWJseSBpbXBsZW1lbnRhdGlvbiBvZiBMaWJvcXNcbiAqL1xuZXhwb3J0IGNsYXNzIFdBU01LeWJlckZhY2FkZSBpbXBsZW1lbnRzIEt5YmVyRmFjYWRlIHtcblx0Y29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSB0ZXN0V0FTTT86IExpYk9RU0V4cG9ydHMpIHt9XG5cblx0Ly8gbG9hZHMgbGlib3FzIFdBU01cblx0cHJpdmF0ZSBsaWJvcXM6IExhenlMb2FkZWQ8TGliT1FTRXhwb3J0cz4gPSBuZXcgTGF6eUxvYWRlZChhc3luYyAoKSA9PiB7XG5cdFx0aWYgKHRoaXMudGVzdFdBU00pIHtcblx0XHRcdHJldHVybiB0aGlzLnRlc3RXQVNNXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGF3YWl0IGxvYWRXYXNtKClcblx0fSlcblxuXHRhc3luYyBnZW5lcmF0ZUtleXBhaXIoKTogUHJvbWlzZTxLeWJlcktleVBhaXI+IHtcblx0XHRyZXR1cm4gZ2VuZXJhdGVLZXlQYWlyS3liZXIoYXdhaXQgdGhpcy5saWJvcXMuZ2V0QXN5bmMoKSwgcmFuZG9tKVxuXHR9XG5cblx0YXN5bmMgZW5jYXBzdWxhdGUocHVibGljS2V5OiBLeWJlclB1YmxpY0tleSk6IFByb21pc2U8S3liZXJFbmNhcHN1bGF0aW9uPiB7XG5cdFx0cmV0dXJuIGVuY2Fwc3VsYXRlS3liZXIoYXdhaXQgdGhpcy5saWJvcXMuZ2V0QXN5bmMoKSwgcHVibGljS2V5LCByYW5kb20pXG5cdH1cblxuXHRhc3luYyBkZWNhcHN1bGF0ZShwcml2YXRlS2V5OiBLeWJlclByaXZhdGVLZXksIGNpcGhlcnRleHQ6IFVpbnQ4QXJyYXkpOiBQcm9taXNlPFVpbnQ4QXJyYXk+IHtcblx0XHRyZXR1cm4gZGVjYXBzdWxhdGVLeWJlcihhd2FpdCB0aGlzLmxpYm9xcy5nZXRBc3luYygpLCBwcml2YXRlS2V5LCBjaXBoZXJ0ZXh0KVxuXHR9XG59XG5cbi8qKlxuICogTmF0aXZlIGltcGxlbWVudGF0aW9uIG9mIExpYm9xc1xuICovXG5leHBvcnQgY2xhc3MgTmF0aXZlS3liZXJGYWNhZGUgaW1wbGVtZW50cyBLeWJlckZhY2FkZSB7XG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgbmF0aXZlQ3J5cHRvRmFjYWRlOiBOYXRpdmVDcnlwdG9GYWNhZGUpIHt9XG5cblx0Z2VuZXJhdGVLZXlwYWlyKCk6IFByb21pc2U8S3liZXJLZXlQYWlyPiB7XG5cdFx0cmV0dXJuIHRoaXMubmF0aXZlQ3J5cHRvRmFjYWRlLmdlbmVyYXRlS3liZXJLZXlwYWlyKHJhbmRvbS5nZW5lcmF0ZVJhbmRvbURhdGEoTUxfS0VNX1JBTkRfQU1PVU5UX09GX0VOVFJPUFkpKVxuXHR9XG5cblx0ZW5jYXBzdWxhdGUocHVibGljS2V5OiBLeWJlclB1YmxpY0tleSk6IFByb21pc2U8S3liZXJFbmNhcHN1bGF0aW9uPiB7XG5cdFx0cmV0dXJuIHRoaXMubmF0aXZlQ3J5cHRvRmFjYWRlLmt5YmVyRW5jYXBzdWxhdGUocHVibGljS2V5LCByYW5kb20uZ2VuZXJhdGVSYW5kb21EYXRhKE1MX0tFTV9SQU5EX0FNT1VOVF9PRl9FTlRST1BZKSlcblx0fVxuXG5cdGRlY2Fwc3VsYXRlKHByaXZhdGVLZXk6IEt5YmVyUHJpdmF0ZUtleSwgY2lwaGVydGV4dDogVWludDhBcnJheSk6IFByb21pc2U8VWludDhBcnJheT4ge1xuXHRcdHJldHVybiB0aGlzLm5hdGl2ZUNyeXB0b0ZhY2FkZS5reWJlckRlY2Fwc3VsYXRlKHByaXZhdGVLZXksIGNpcGhlcnRleHQpXG5cdH1cbn1cbiIsImltcG9ydCB7IEVjY1B1YmxpY0tleSB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtY3J5cHRvXCJcbmltcG9ydCB7IGJ5dGVBcnJheXNUb0J5dGVzLCBieXRlc1RvQnl0ZUFycmF5cyB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHMvZGlzdC9FbmNvZGluZy5qc1wiXG5cbmV4cG9ydCB0eXBlIFBRTWVzc2FnZSA9IHtcblx0c2VuZGVySWRlbnRpdHlQdWJLZXk6IEVjY1B1YmxpY0tleVxuXHRlcGhlbWVyYWxQdWJLZXk6IEVjY1B1YmxpY0tleVxuXHRlbmNhcHN1bGF0aW9uOiBQUUJ1Y2tldEtleUVuY2Fwc3VsYXRpb25cbn1cblxuZXhwb3J0IHR5cGUgUFFCdWNrZXRLZXlFbmNhcHN1bGF0aW9uID0ge1xuXHRreWJlckNpcGhlclRleHQ6IFVpbnQ4QXJyYXlcblx0a2VrRW5jQnVja2V0S2V5OiBVaW50OEFycmF5XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWNvZGVQUU1lc3NhZ2UoZW5jb2RlZDogVWludDhBcnJheSk6IFBRTWVzc2FnZSB7XG5cdGNvbnN0IHBxTWVzc2FnZVBhcnRzID0gYnl0ZXNUb0J5dGVBcnJheXMoZW5jb2RlZCwgNClcblx0cmV0dXJuIHtcblx0XHRzZW5kZXJJZGVudGl0eVB1YktleTogcHFNZXNzYWdlUGFydHNbMF0sXG5cdFx0ZXBoZW1lcmFsUHViS2V5OiBwcU1lc3NhZ2VQYXJ0c1sxXSxcblx0XHRlbmNhcHN1bGF0aW9uOiB7XG5cdFx0XHRreWJlckNpcGhlclRleHQ6IHBxTWVzc2FnZVBhcnRzWzJdLFxuXHRcdFx0a2VrRW5jQnVja2V0S2V5OiBwcU1lc3NhZ2VQYXJ0c1szXSxcblx0XHR9LFxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmNvZGVQUU1lc3NhZ2UoeyBzZW5kZXJJZGVudGl0eVB1YktleSwgZXBoZW1lcmFsUHViS2V5LCBlbmNhcHN1bGF0aW9uIH06IFBRTWVzc2FnZSk6IFVpbnQ4QXJyYXkge1xuXHRyZXR1cm4gYnl0ZUFycmF5c1RvQnl0ZXMoW3NlbmRlcklkZW50aXR5UHViS2V5LCBlcGhlbWVyYWxQdWJLZXksIGVuY2Fwc3VsYXRpb24ua3liZXJDaXBoZXJUZXh0LCBlbmNhcHN1bGF0aW9uLmtla0VuY0J1Y2tldEtleV0pXG59XG4iLCJpbXBvcnQgeyBLeWJlckZhY2FkZSB9IGZyb20gXCIuL0t5YmVyRmFjYWRlLmpzXCJcbmltcG9ydCB7XG5cdEFlczI1NktleSxcblx0YWVzRW5jcnlwdCxcblx0YXV0aGVudGljYXRlZEFlc0RlY3J5cHQsXG5cdGVjY0RlY2Fwc3VsYXRlLFxuXHRlY2NFbmNhcHN1bGF0ZSxcblx0RWNjS2V5UGFpcixcblx0RWNjUHVibGljS2V5LFxuXHRFY2NTaGFyZWRTZWNyZXRzLFxuXHRnZW5lcmF0ZUVjY0tleVBhaXIsXG5cdGhrZGYsXG5cdEtFWV9MRU5HVEhfQllURVNfQUVTXzI1Nixcblx0S2V5UGFpclR5cGUsXG5cdGt5YmVyUHVibGljS2V5VG9CeXRlcyxcblx0UFFLZXlQYWlycyxcblx0cHFLZXlQYWlyc1RvUHVibGljS2V5cyxcblx0UFFQdWJsaWNLZXlzLFxuXHR1aW50OEFycmF5VG9LZXksXG59IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtY3J5cHRvXCJcbmltcG9ydCB7IGNvbmNhdCwgc3RyaW5nVG9VdGY4VWludDhBcnJheSB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHsgZGVjb2RlUFFNZXNzYWdlLCBlbmNvZGVQUU1lc3NhZ2UsIFBRTWVzc2FnZSB9IGZyb20gXCIuL1BRTWVzc2FnZS5qc1wiXG5pbXBvcnQgeyBDcnlwdG9Qcm90b2NvbFZlcnNpb24gfSBmcm9tIFwiLi4vLi4vY29tbW9uL1R1dGFub3RhQ29uc3RhbnRzLmpzXCJcblxuZXhwb3J0IHR5cGUgRGVjYXBzdWxhdGVkU3ltS2V5ID0ge1xuXHRzZW5kZXJJZGVudGl0eVB1YktleTogRWNjUHVibGljS2V5XG5cdGRlY3J5cHRlZFN5bUtleUJ5dGVzOiBVaW50OEFycmF5XG59XG5cbmV4cG9ydCBjbGFzcyBQUUZhY2FkZSB7XG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkga3liZXJGYWNhZGU6IEt5YmVyRmFjYWRlKSB7fVxuXG5cdHB1YmxpYyBhc3luYyBnZW5lcmF0ZUtleVBhaXJzKCk6IFByb21pc2U8UFFLZXlQYWlycz4ge1xuXHRcdHJldHVybiB7XG5cdFx0XHRrZXlQYWlyVHlwZTogS2V5UGFpclR5cGUuVFVUQV9DUllQVCxcblx0XHRcdGVjY0tleVBhaXI6IGdlbmVyYXRlRWNjS2V5UGFpcigpLFxuXHRcdFx0a3liZXJLZXlQYWlyOiBhd2FpdCB0aGlzLmt5YmVyRmFjYWRlLmdlbmVyYXRlS2V5cGFpcigpLFxuXHRcdH1cblx0fVxuXG5cdHB1YmxpYyBhc3luYyBlbmNhcHN1bGF0ZUFuZEVuY29kZShcblx0XHRzZW5kZXJJZGVudGl0eUtleVBhaXI6IEVjY0tleVBhaXIsXG5cdFx0ZXBoZW1lcmFsS2V5UGFpcjogRWNjS2V5UGFpcixcblx0XHRyZWNpcGllbnRQdWJsaWNLZXlzOiBQUVB1YmxpY0tleXMsXG5cdFx0YnVja2V0S2V5OiBVaW50OEFycmF5LFxuXHQpOiBQcm9taXNlPFVpbnQ4QXJyYXk+IHtcblx0XHRjb25zdCBlbmNhcHN1bGF0ZWQgPSBhd2FpdCB0aGlzLmVuY2Fwc3VsYXRlKHNlbmRlcklkZW50aXR5S2V5UGFpciwgZXBoZW1lcmFsS2V5UGFpciwgcmVjaXBpZW50UHVibGljS2V5cywgYnVja2V0S2V5KVxuXHRcdHJldHVybiBlbmNvZGVQUU1lc3NhZ2UoZW5jYXBzdWxhdGVkKVxuXHR9XG5cblx0LyoqXG5cdCAqIEBWaXNpYmxlRm9yVGVzdGluZ1xuXHQgKi9cblx0YXN5bmMgZW5jYXBzdWxhdGUoXG5cdFx0c2VuZGVySWRlbnRpdHlLZXlQYWlyOiBFY2NLZXlQYWlyLFxuXHRcdGVwaGVtZXJhbEtleVBhaXI6IEVjY0tleVBhaXIsXG5cdFx0cmVjaXBpZW50UHVibGljS2V5czogUFFQdWJsaWNLZXlzLFxuXHRcdGJ1Y2tldEtleTogVWludDhBcnJheSxcblx0KTogUHJvbWlzZTxQUU1lc3NhZ2U+IHtcblx0XHRjb25zdCBlY2NTaGFyZWRTZWNyZXQgPSBlY2NFbmNhcHN1bGF0ZShzZW5kZXJJZGVudGl0eUtleVBhaXIucHJpdmF0ZUtleSwgZXBoZW1lcmFsS2V5UGFpci5wcml2YXRlS2V5LCByZWNpcGllbnRQdWJsaWNLZXlzLmVjY1B1YmxpY0tleSlcblx0XHRjb25zdCBreWJlckVuY2Fwc3VsYXRpb24gPSBhd2FpdCB0aGlzLmt5YmVyRmFjYWRlLmVuY2Fwc3VsYXRlKHJlY2lwaWVudFB1YmxpY0tleXMua3liZXJQdWJsaWNLZXkpXG5cdFx0Y29uc3Qga3liZXJDaXBoZXJUZXh0ID0ga3liZXJFbmNhcHN1bGF0aW9uLmNpcGhlcnRleHRcblxuXHRcdGNvbnN0IGtlayA9IHRoaXMuZGVyaXZlUFFLRUsoXG5cdFx0XHRzZW5kZXJJZGVudGl0eUtleVBhaXIucHVibGljS2V5LFxuXHRcdFx0ZXBoZW1lcmFsS2V5UGFpci5wdWJsaWNLZXksXG5cdFx0XHRyZWNpcGllbnRQdWJsaWNLZXlzLFxuXHRcdFx0a3liZXJDaXBoZXJUZXh0LFxuXHRcdFx0a3liZXJFbmNhcHN1bGF0aW9uLnNoYXJlZFNlY3JldCxcblx0XHRcdGVjY1NoYXJlZFNlY3JldCxcblx0XHRcdENyeXB0b1Byb3RvY29sVmVyc2lvbi5UVVRBX0NSWVBULFxuXHRcdClcblxuXHRcdGNvbnN0IGtla0VuY0J1Y2tldEtleSA9IGFlc0VuY3J5cHQoa2VrLCBidWNrZXRLZXkpXG5cdFx0cmV0dXJuIHtcblx0XHRcdHNlbmRlcklkZW50aXR5UHViS2V5OiBzZW5kZXJJZGVudGl0eUtleVBhaXIucHVibGljS2V5LFxuXHRcdFx0ZXBoZW1lcmFsUHViS2V5OiBlcGhlbWVyYWxLZXlQYWlyLnB1YmxpY0tleSxcblx0XHRcdGVuY2Fwc3VsYXRpb246IHtcblx0XHRcdFx0a3liZXJDaXBoZXJUZXh0LFxuXHRcdFx0XHRrZWtFbmNCdWNrZXRLZXk6IGtla0VuY0J1Y2tldEtleSxcblx0XHRcdH0sXG5cdFx0fVxuXHR9XG5cblx0cHVibGljIGFzeW5jIGRlY2Fwc3VsYXRlRW5jb2RlZChlbmNvZGVkUFFNZXNzYWdlOiBVaW50OEFycmF5LCByZWNpcGllbnRLZXlzOiBQUUtleVBhaXJzKTogUHJvbWlzZTxEZWNhcHN1bGF0ZWRTeW1LZXk+IHtcblx0XHRjb25zdCBkZWNvZGVkID0gZGVjb2RlUFFNZXNzYWdlKGVuY29kZWRQUU1lc3NhZ2UpXG5cdFx0cmV0dXJuIHsgZGVjcnlwdGVkU3ltS2V5Qnl0ZXM6IGF3YWl0IHRoaXMuZGVjYXBzdWxhdGUoZGVjb2RlZCwgcmVjaXBpZW50S2V5cyksIHNlbmRlcklkZW50aXR5UHViS2V5OiBkZWNvZGVkLnNlbmRlcklkZW50aXR5UHViS2V5IH1cblx0fVxuXG5cdC8qKlxuXHQgKiBAVmlzaWJsZUZvclRlc3Rpbmdcblx0ICovXG5cdGFzeW5jIGRlY2Fwc3VsYXRlKG1lc3NhZ2U6IFBRTWVzc2FnZSwgcmVjaXBpZW50S2V5czogUFFLZXlQYWlycyk6IFByb21pc2U8VWludDhBcnJheT4ge1xuXHRcdGNvbnN0IGt5YmVyQ2lwaGVyVGV4dCA9IG1lc3NhZ2UuZW5jYXBzdWxhdGlvbi5reWJlckNpcGhlclRleHRcblx0XHRjb25zdCBlY2NTaGFyZWRTZWNyZXQgPSBlY2NEZWNhcHN1bGF0ZShtZXNzYWdlLnNlbmRlcklkZW50aXR5UHViS2V5LCBtZXNzYWdlLmVwaGVtZXJhbFB1YktleSwgcmVjaXBpZW50S2V5cy5lY2NLZXlQYWlyLnByaXZhdGVLZXkpXG5cdFx0Y29uc3Qga3liZXJTaGFyZWRTZWNyZXQgPSBhd2FpdCB0aGlzLmt5YmVyRmFjYWRlLmRlY2Fwc3VsYXRlKHJlY2lwaWVudEtleXMua3liZXJLZXlQYWlyLnByaXZhdGVLZXksIGt5YmVyQ2lwaGVyVGV4dClcblxuXHRcdGNvbnN0IGtlayA9IHRoaXMuZGVyaXZlUFFLRUsoXG5cdFx0XHRtZXNzYWdlLnNlbmRlcklkZW50aXR5UHViS2V5LFxuXHRcdFx0bWVzc2FnZS5lcGhlbWVyYWxQdWJLZXksXG5cdFx0XHRwcUtleVBhaXJzVG9QdWJsaWNLZXlzKHJlY2lwaWVudEtleXMpLFxuXHRcdFx0a3liZXJDaXBoZXJUZXh0LFxuXHRcdFx0a3liZXJTaGFyZWRTZWNyZXQsXG5cdFx0XHRlY2NTaGFyZWRTZWNyZXQsXG5cdFx0XHRDcnlwdG9Qcm90b2NvbFZlcnNpb24uVFVUQV9DUllQVCxcblx0XHQpXG5cblx0XHRyZXR1cm4gYXV0aGVudGljYXRlZEFlc0RlY3J5cHQoa2VrLCBtZXNzYWdlLmVuY2Fwc3VsYXRpb24ua2VrRW5jQnVja2V0S2V5KVxuXHR9XG5cblx0cHJpdmF0ZSBkZXJpdmVQUUtFSyhcblx0XHRzZW5kZXJJZGVudGl0eVB1YmxpY0tleTogRWNjUHVibGljS2V5LFxuXHRcdGVwaGVtZXJhbFB1YmxpY0tleTogRWNjUHVibGljS2V5LFxuXHRcdHJlY2lwaWVudFB1YmxpY0tleXM6IFBRUHVibGljS2V5cyxcblx0XHRreWJlckNpcGhlclRleHQ6IFVpbnQ4QXJyYXksXG5cdFx0a3liZXJTaGFyZWRTZWNyZXQ6IFVpbnQ4QXJyYXksXG5cdFx0ZWNjU2hhcmVkU2VjcmV0OiBFY2NTaGFyZWRTZWNyZXRzLFxuXHRcdGNyeXB0b1Byb3RvY29sVmVyc2lvbjogQ3J5cHRvUHJvdG9jb2xWZXJzaW9uLFxuXHQpOiBBZXMyNTZLZXkge1xuXHRcdGNvbnN0IGNvbnRleHQgPSBjb25jYXQoXG5cdFx0XHRzZW5kZXJJZGVudGl0eVB1YmxpY0tleSxcblx0XHRcdGVwaGVtZXJhbFB1YmxpY0tleSxcblx0XHRcdHJlY2lwaWVudFB1YmxpY0tleXMuZWNjUHVibGljS2V5LFxuXHRcdFx0a3liZXJQdWJsaWNLZXlUb0J5dGVzKHJlY2lwaWVudFB1YmxpY0tleXMua3liZXJQdWJsaWNLZXkpLFxuXHRcdFx0a3liZXJDaXBoZXJUZXh0LFxuXHRcdFx0bmV3IFVpbnQ4QXJyYXkoW051bWJlcihjcnlwdG9Qcm90b2NvbFZlcnNpb24pXSksXG5cdFx0KVxuXG5cdFx0Y29uc3QgaW5wdXRLZXlNYXRlcmlhbCA9IGNvbmNhdChlY2NTaGFyZWRTZWNyZXQuZXBoZW1lcmFsU2hhcmVkU2VjcmV0LCBlY2NTaGFyZWRTZWNyZXQuYXV0aFNoYXJlZFNlY3JldCwga3liZXJTaGFyZWRTZWNyZXQpXG5cblx0XHRjb25zdCBrZWtCeXRlcyA9IGhrZGYoY29udGV4dCwgaW5wdXRLZXlNYXRlcmlhbCwgc3RyaW5nVG9VdGY4VWludDhBcnJheShcImtla1wiKSwgS0VZX0xFTkdUSF9CWVRFU19BRVNfMjU2KVxuXHRcdHJldHVybiB1aW50OEFycmF5VG9LZXkoa2VrQnl0ZXMpXG5cdH1cbn1cbiIsImltcG9ydCB7IEVudGl0eUNsaWVudCB9IGZyb20gXCIuLi8uLi9jb21tb24vRW50aXR5Q2xpZW50LmpzXCJcbmltcG9ydCB7XG5cdEFkbWluR3JvdXBLZXlEaXN0cmlidXRpb25FbGVtZW50LFxuXHRjcmVhdGVBZG1pbkdyb3VwS2V5RGlzdHJpYnV0aW9uRWxlbWVudCxcblx0Y3JlYXRlQWRtaW5Hcm91cEtleVJvdGF0aW9uUG9zdEluLFxuXHRjcmVhdGVBZG1pbkdyb3VwS2V5Um90YXRpb25QdXRJbixcblx0Y3JlYXRlR3JvdXBLZXlSb3RhdGlvbkRhdGEsXG5cdGNyZWF0ZUdyb3VwS2V5Um90YXRpb25Qb3N0SW4sXG5cdGNyZWF0ZUdyb3VwS2V5VXBkYXRlRGF0YSxcblx0Y3JlYXRlR3JvdXBNZW1iZXJzaGlwS2V5RGF0YSxcblx0Y3JlYXRlR3JvdXBNZW1iZXJzaGlwVXBkYXRlRGF0YSxcblx0Y3JlYXRlS2V5TWFjLFxuXHRjcmVhdGVLZXlQYWlyLFxuXHRjcmVhdGVNZW1iZXJzaGlwUHV0SW4sXG5cdGNyZWF0ZVB1YkVuY0tleURhdGEsXG5cdGNyZWF0ZVJlY292ZXJDb2RlRGF0YSxcblx0Y3JlYXRlVXNlckdyb3VwS2V5Um90YXRpb25EYXRhLFxuXHRjcmVhdGVVc2VyR3JvdXBLZXlSb3RhdGlvblBvc3RJbixcblx0Q3VzdG9tZXJUeXBlUmVmLFxuXHRHcm91cCxcblx0R3JvdXBJbmZvVHlwZVJlZixcblx0R3JvdXBLZXlSb3RhdGlvbkRhdGEsXG5cdEdyb3VwS2V5VXBkYXRlLFxuXHRHcm91cEtleVVwZGF0ZURhdGEsXG5cdEdyb3VwS2V5VXBkYXRlVHlwZVJlZixcblx0R3JvdXBNZW1iZXIsXG5cdEdyb3VwTWVtYmVyc2hpcEtleURhdGEsXG5cdEdyb3VwTWVtYmVyc2hpcFVwZGF0ZURhdGEsXG5cdEdyb3VwTWVtYmVyVHlwZVJlZixcblx0R3JvdXBUeXBlUmVmLFxuXHRLZXlNYWMsXG5cdEtleVBhaXIsXG5cdEtleVJvdGF0aW9uLFxuXHRLZXlSb3RhdGlvblR5cGVSZWYsXG5cdFB1YkRpc3RyaWJ1dGlvbktleSxcblx0UHViRW5jS2V5RGF0YSxcblx0UmVjb3ZlckNvZGVEYXRhLFxuXHRTZW50R3JvdXBJbnZpdGF0aW9uVHlwZVJlZixcblx0VXNlcixcblx0VXNlckdyb3VwUm9vdFR5cGVSZWYsXG5cdFVzZXJUeXBlUmVmLFxufSBmcm9tIFwiLi4vLi4vZW50aXRpZXMvc3lzL1R5cGVSZWZzLmpzXCJcbmltcG9ydCB7XG5cdGFzUHVibGljS2V5SWRlbnRpZmllcixcblx0YXNzZXJ0RW51bVZhbHVlLFxuXHRDcnlwdG9Qcm90b2NvbFZlcnNpb24sXG5cdEdyb3VwS2V5Um90YXRpb25UeXBlLFxuXHRHcm91cFR5cGUsXG5cdFB1YmxpY0tleUlkZW50aWZpZXJUeXBlLFxufSBmcm9tIFwiLi4vLi4vY29tbW9uL1R1dGFub3RhQ29uc3RhbnRzLmpzXCJcbmltcG9ydCB7XG5cdGFzc2VydE5vdE51bGwsXG5cdGRlZmVyLFxuXHREZWZlcnJlZE9iamVjdCxcblx0ZG93bmNhc3QsXG5cdGdldEZpcnN0T3JUaHJvdyxcblx0Z3JvdXBCeSxcblx0aXNFbXB0eSxcblx0aXNOb3ROdWxsLFxuXHRpc1NhbWVUeXBlUmVmLFxuXHRLZXlWZXJzaW9uLFxuXHRsYXp5QXN5bmMsXG5cdHByb21pc2VNYXAsXG5cdFZlcnNpb25lZCxcbn0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5pbXBvcnQgeyBlbGVtZW50SWRQYXJ0LCBnZXRFbGVtZW50SWQsIGlzU2FtZUlkLCBsaXN0SWRQYXJ0IH0gZnJvbSBcIi4uLy4uL2NvbW1vbi91dGlscy9FbnRpdHlVdGlscy5qc1wiXG5pbXBvcnQgeyBjaGVja0tleVZlcnNpb25Db25zdHJhaW50cywgS2V5TG9hZGVyRmFjYWRlLCBwYXJzZUtleVZlcnNpb24gfSBmcm9tIFwiLi9LZXlMb2FkZXJGYWNhZGUuanNcIlxuaW1wb3J0IHtcblx0QWVzMjU2S2V5LFxuXHRBZXNLZXksXG5cdGJpdEFycmF5VG9VaW50OEFycmF5LFxuXHRjcmVhdGVBdXRoVmVyaWZpZXIsXG5cdEVjY0tleVBhaXIsXG5cdEVuY3J5cHRlZFBxS2V5UGFpcnMsXG5cdGdldEtleUxlbmd0aEJ5dGVzLFxuXHRpc0VuY3J5cHRlZFBxS2V5UGFpcnMsXG5cdEtFWV9MRU5HVEhfQllURVNfQUVTXzI1Nixcblx0TWFjVGFnLFxuXHRQUUtleVBhaXJzLFxuXHRQUVB1YmxpY0tleXMsXG5cdHVpbnQ4QXJyYXlUb0tleSxcbn0gZnJvbSBcIkB0dXRhby90dXRhbm90YS1jcnlwdG9cIlxuaW1wb3J0IHsgUFFGYWNhZGUgfSBmcm9tIFwiLi9QUUZhY2FkZS5qc1wiXG5pbXBvcnQge1xuXHRBZG1pbkdyb3VwS2V5Um90YXRpb25TZXJ2aWNlLFxuXHRHcm91cEtleVJvdGF0aW9uSW5mb1NlcnZpY2UsXG5cdEdyb3VwS2V5Um90YXRpb25TZXJ2aWNlLFxuXHRNZW1iZXJzaGlwU2VydmljZSxcblx0VXNlckdyb3VwS2V5Um90YXRpb25TZXJ2aWNlLFxufSBmcm9tIFwiLi4vLi4vZW50aXRpZXMvc3lzL1NlcnZpY2VzLmpzXCJcbmltcG9ydCB7IElTZXJ2aWNlRXhlY3V0b3IgfSBmcm9tIFwiLi4vLi4vY29tbW9uL1NlcnZpY2VSZXF1ZXN0LmpzXCJcbmltcG9ydCB7IENyeXB0b0ZhY2FkZSB9IGZyb20gXCIuLi9jcnlwdG8vQ3J5cHRvRmFjYWRlLmpzXCJcbmltcG9ydCB7IGFzc2VydFdvcmtlck9yTm9kZSB9IGZyb20gXCIuLi8uLi9jb21tb24vRW52LmpzXCJcbmltcG9ydCB7IENyeXB0b1dyYXBwZXIsIFZlcnNpb25lZEVuY3J5cHRlZEtleSwgVmVyc2lvbmVkS2V5IH0gZnJvbSBcIi4uL2NyeXB0by9DcnlwdG9XcmFwcGVyLmpzXCJcbmltcG9ydCB7IGdldFVzZXJHcm91cE1lbWJlcnNoaXBzIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi91dGlscy9Hcm91cFV0aWxzLmpzXCJcbmltcG9ydCB7IFJlY292ZXJDb2RlRmFjYWRlIH0gZnJvbSBcIi4vbGF6eS9SZWNvdmVyQ29kZUZhY2FkZS5qc1wiXG5pbXBvcnQgeyBVc2VyRmFjYWRlIH0gZnJvbSBcIi4vVXNlckZhY2FkZS5qc1wiXG5pbXBvcnQgeyBHcm91cEludml0YXRpb25Qb3N0RGF0YSwgdHlwZSBJbnRlcm5hbFJlY2lwaWVudEtleURhdGEsIEludGVybmFsUmVjaXBpZW50S2V5RGF0YVR5cGVSZWYgfSBmcm9tIFwiLi4vLi4vZW50aXRpZXMvdHV0YW5vdGEvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgU2hhcmVGYWNhZGUgfSBmcm9tIFwiLi9sYXp5L1NoYXJlRmFjYWRlLmpzXCJcbmltcG9ydCB7IEdyb3VwTWFuYWdlbWVudEZhY2FkZSB9IGZyb20gXCIuL2xhenkvR3JvdXBNYW5hZ2VtZW50RmFjYWRlLmpzXCJcbmltcG9ydCB7IFJlY2lwaWVudHNOb3RGb3VuZEVycm9yIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9lcnJvci9SZWNpcGllbnRzTm90Rm91bmRFcnJvci5qc1wiXG5pbXBvcnQgeyBMb2NrZWRFcnJvciB9IGZyb20gXCIuLi8uLi9jb21tb24vZXJyb3IvUmVzdEVycm9yLmpzXCJcbmltcG9ydCB7IEFzeW1tZXRyaWNDcnlwdG9GYWNhZGUgfSBmcm9tIFwiLi4vY3J5cHRvL0FzeW1tZXRyaWNDcnlwdG9GYWNhZGUuanNcIlxuaW1wb3J0IHsgVHV0YW5vdGFFcnJvciB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtZXJyb3JcIlxuaW1wb3J0IHsgYXNQUVB1YmxpY0tleXMsIGJyYW5kS2V5TWFjLCBLZXlBdXRoZW50aWNhdGlvbkZhY2FkZSB9IGZyb20gXCIuL0tleUF1dGhlbnRpY2F0aW9uRmFjYWRlLmpzXCJcbmltcG9ydCB7IFB1YmxpY0tleVByb3ZpZGVyLCBQdWJsaWNLZXlzIH0gZnJvbSBcIi4vUHVibGljS2V5UHJvdmlkZXIuanNcIlxuXG5hc3NlcnRXb3JrZXJPck5vZGUoKVxuXG5leHBvcnQgZW51bSBNdWx0aUFkbWluR3JvdXBLZXlBZG1pbkFjdGlvblBhdGgge1xuXHRXQUlUX0ZPUl9PVEhFUl9BRE1JTlMsXG5cdENSRUFURV9ESVNUUklCVVRJT05fS0VZUyxcblx0UEVSRk9STV9LRVlfUk9UQVRJT04sXG5cdElNUE9TU0lCTEVfU1RBVEUsXG59XG5cbi8qKlxuICogVHlwZSB0byBrZWVwIGEgcGVuZGluZyBrZXkgcm90YXRpb24gYW5kIHRoZSBwYXNzd29yZCBrZXkgaW4gbWVtb3J5IGFzIGxvbmcgYXMgdGhlIGtleSByb3RhdGlvbiBoYXMgbm90IGJlZW4gcHJvY2Vzc2VkLlxuICovXG50eXBlIFBlbmRpbmdLZXlSb3RhdGlvbiA9IHtcblx0cHdLZXk6IEFlczI1NktleSB8IG51bGxcblx0Ly9JZiB3ZSByb3RhdGUgdGhlIGFkbWluIGdyb3VwIHdlIGFsd2F5cyB3YW50IHRvIHJvdGF0ZSB0aGUgdXNlciBncm91cCBmb3IgdGhlIGFkbWluIHVzZXIuXG5cdC8vIFRoZXJlZm9yZSwgd2UgZG8gbm90IG5lZWQgdG8gc2F2ZSB0d28gZGlmZmVyZW50IGtleSByb3RhdGlvbnMgZm9yIHRoaXMgY2FzZS5cblx0YWRtaW5PclVzZXJHcm91cEtleVJvdGF0aW9uOiBLZXlSb3RhdGlvbiB8IG51bGxcblx0dGVhbU9yQ3VzdG9tZXJHcm91cEtleVJvdGF0aW9uczogQXJyYXk8S2V5Um90YXRpb24+XG5cdHVzZXJBcmVhR3JvdXBzS2V5Um90YXRpb25zOiBBcnJheTxLZXlSb3RhdGlvbj5cbn1cblxudHlwZSBQcmVwYXJlZFVzZXJBcmVhR3JvdXBLZXlSb3RhdGlvbiA9IHtcblx0Z3JvdXBLZXlSb3RhdGlvbkRhdGE6IEdyb3VwS2V5Um90YXRpb25EYXRhXG5cdHByZXBhcmVkUmVJbnZpdGF0aW9uczogR3JvdXBJbnZpdGF0aW9uUG9zdERhdGFbXVxufVxuXG50eXBlIEdlbmVyYXRlZEdyb3VwS2V5cyA9IHtcblx0c3ltR3JvdXBLZXk6IFZlcnNpb25lZEtleVxuXHRlbmNyeXB0ZWRLZXlQYWlyOiBFbmNyeXB0ZWRQcUtleVBhaXJzIHwgbnVsbFxufVxuXG50eXBlIEVuY3J5cHRlZEdyb3VwS2V5cyA9IHtcblx0bmV3R3JvdXBLZXlFbmNDdXJyZW50R3JvdXBLZXk6IFZlcnNpb25lZEVuY3J5cHRlZEtleVxuXHRrZXlQYWlyOiBFbmNyeXB0ZWRQcUtleVBhaXJzIHwgbnVsbFxuXHRhZG1pbkdyb3VwS2V5RW5jTmV3R3JvdXBLZXk6IFZlcnNpb25lZEVuY3J5cHRlZEtleSB8IG51bGxcbn1cblxudHlwZSBFbmNyeXB0ZWRVc2VyR3JvdXBLZXlzID0ge1xuXHRuZXdVc2VyR3JvdXBLZXlFbmNDdXJyZW50R3JvdXBLZXk6IFZlcnNpb25lZEVuY3J5cHRlZEtleVxuXHRwYXNzcGhyYXNlS2V5RW5jTmV3VXNlckdyb3VwS2V5OiBWZXJzaW9uZWRFbmNyeXB0ZWRLZXlcblx0a2V5UGFpcjogS2V5UGFpclxuXHRyZWNvdmVyQ29kZURhdGE6IFJlY292ZXJDb2RlRGF0YSB8IG51bGxcblx0bmV3QWRtaW5Hcm91cEtleUVuY05ld1VzZXJHcm91cEtleTogVmVyc2lvbmVkRW5jcnlwdGVkS2V5XG5cdGRpc3RyaWJ1dGlvbktleUVuY05ld1VzZXJHcm91cEtleTogVWludDhBcnJheVxuXHRhdXRoVmVyaWZpZXI6IFVpbnQ4QXJyYXlcbn1cblxuLyoqXG4gKiBGYWNhZGUgdG8gaGFuZGxlIGtleSByb3RhdGlvbiByZXF1ZXN0cy4gTWFpbnRhaW5zIGFuZCBwcm9jZXNzZXMgQFBlbmRpbmdLZXlSb3RhdGlvblxuICovXG5leHBvcnQgY2xhc3MgS2V5Um90YXRpb25GYWNhZGUge1xuXHQvKipcblx0ICogQFZpc2libGVGb3JUZXN0aW5nXG5cdCAqL1xuXHRwZW5kaW5nS2V5Um90YXRpb25zOiBQZW5kaW5nS2V5Um90YXRpb25cblx0LyoqXG5cdCAqIEtlZXBzIHRyYWNrIG9mIHdoaWNoIFVzZXIgYW5kIFRlYW0gZ3JvdXBzIGhhdmUgcGVyZm9ybWVkIEtleSBSb3RhdGlvbiAob25seSBmb3IgdGhlIGN1cnJlbnQgc2Vzc2lvbikuXG5cdCAqIE90aGVyIGdyb3VwIHR5cGVzIG1heSBiZSBpbmNsdWRlZCwgYnV0IGl0IGlzIG5vdCBndWFyYW50ZWVkLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cHJpdmF0ZSBncm91cElkc1RoYXRQZXJmb3JtZWRLZXlSb3RhdGlvbnM6IFNldDxJZD5cblx0cHJpdmF0ZSByZWFkb25seSBmYWNhZGVJbml0aWFsaXplZERlZmVycmVkT2JqZWN0OiBEZWZlcnJlZE9iamVjdDx2b2lkPlxuXHRwcml2YXRlIHBlbmRpbmdHcm91cEtleVVwZGF0ZUlkczogSWRUdXBsZVtdIC8vIGFscmVhZHkgcm90YXRlZCBncm91cHMgZm9yIHdoaWNoIHdlIG5lZWQgdG8gdXBkYXRlIHRoZSBtZW1iZXJzaGlwcyAoR3JvdXBLZXlVcGRhdGVJZHMgYWxsIGluIG9uZSBsaXN0KVxuXG5cdGNvbnN0cnVjdG9yKFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgZW50aXR5Q2xpZW50OiBFbnRpdHlDbGllbnQsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBrZXlMb2FkZXJGYWNhZGU6IEtleUxvYWRlckZhY2FkZSxcblx0XHRwcml2YXRlIHJlYWRvbmx5IHBxRmFjYWRlOiBQUUZhY2FkZSxcblx0XHRwcml2YXRlIHJlYWRvbmx5IHNlcnZpY2VFeGVjdXRvcjogSVNlcnZpY2VFeGVjdXRvcixcblx0XHRwcml2YXRlIHJlYWRvbmx5IGNyeXB0b1dyYXBwZXI6IENyeXB0b1dyYXBwZXIsXG5cdFx0cHJpdmF0ZSByZWFkb25seSByZWNvdmVyQ29kZUZhY2FkZTogbGF6eUFzeW5jPFJlY292ZXJDb2RlRmFjYWRlPixcblx0XHRwcml2YXRlIHJlYWRvbmx5IHVzZXJGYWNhZGU6IFVzZXJGYWNhZGUsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBjcnlwdG9GYWNhZGU6IENyeXB0b0ZhY2FkZSxcblx0XHRwcml2YXRlIHJlYWRvbmx5IHNoYXJlRmFjYWRlOiBsYXp5QXN5bmM8U2hhcmVGYWNhZGU+LFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgZ3JvdXBNYW5hZ2VtZW50RmFjYWRlOiBsYXp5QXN5bmM8R3JvdXBNYW5hZ2VtZW50RmFjYWRlPixcblx0XHRwcml2YXRlIHJlYWRvbmx5IGFzeW1tZXRyaWNDcnlwdG9GYWNhZGU6IEFzeW1tZXRyaWNDcnlwdG9GYWNhZGUsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBrZXlBdXRoZW50aWNhdGlvbkZhY2FkZTogS2V5QXV0aGVudGljYXRpb25GYWNhZGUsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBwdWJsaWNLZXlQcm92aWRlcjogUHVibGljS2V5UHJvdmlkZXIsXG5cdCkge1xuXHRcdHRoaXMucGVuZGluZ0tleVJvdGF0aW9ucyA9IHtcblx0XHRcdHB3S2V5OiBudWxsLFxuXHRcdFx0YWRtaW5PclVzZXJHcm91cEtleVJvdGF0aW9uOiBudWxsLFxuXHRcdFx0dGVhbU9yQ3VzdG9tZXJHcm91cEtleVJvdGF0aW9uczogW10sXG5cdFx0XHR1c2VyQXJlYUdyb3Vwc0tleVJvdGF0aW9uczogW10sXG5cdFx0fVxuXHRcdHRoaXMuZmFjYWRlSW5pdGlhbGl6ZWREZWZlcnJlZE9iamVjdCA9IGRlZmVyPHZvaWQ+KClcblx0XHR0aGlzLnBlbmRpbmdHcm91cEtleVVwZGF0ZUlkcyA9IFtdXG5cdFx0dGhpcy5ncm91cElkc1RoYXRQZXJmb3JtZWRLZXlSb3RhdGlvbnMgPSBuZXcgU2V0PElkPigpXG5cdH1cblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZSB0aGUgZmFjYWRlIHdpdGggdGhlIGRhdGEgaXQgbmVlZHMgdG8gcGVyZm9ybSByb3RhdGlvbnMgbGF0ZXIuXG5cdCAqIE5lZWRzIHRvIGJlIGNhbGxlZCBkdXJpbmcgbG9naW4gd2hlbiB0aGUgcGFzc3dvcmQga2V5IGlzIHN0aWxsIGF2YWlsYWJsZS5cblx0ICogQHBhcmFtIHB3S2V5IHRoZSB1c2VyJ3MgcGFzc3BocmFzZSBrZXkuIE1heSBvciBtYXkgbm90IGJlIGtlcHQgaW4gbWVtb3J5LCBkZXBlbmRpbmcgb24gd2hldGhlciBhIFVzZXJHcm91cCBrZXkgcm90YXRpb24gaXMgc2NoZWR1bGVkLlxuXHQgKiBAcGFyYW0gbW9kZXJuS2RmVHlwZSB0cnVlIGlmIGFyZ29uMmlkLiBubyBhZG1pbiBvciB1c2VyIGtleSByb3RhdGlvbiBzaG91bGQgYmUgZXhlY3V0ZWQgaWYgZmFsc2UuXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgaW5pdGlhbGl6ZShwd0tleTogQWVzMjU2S2V5LCBtb2Rlcm5LZGZUeXBlOiBib29sZWFuKSB7XG5cdFx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5zZXJ2aWNlRXhlY3V0b3IuZ2V0KEdyb3VwS2V5Um90YXRpb25JbmZvU2VydmljZSwgbnVsbClcblx0XHRpZiAocmVzdWx0LnVzZXJPckFkbWluR3JvdXBLZXlSb3RhdGlvblNjaGVkdWxlZCAmJiBtb2Rlcm5LZGZUeXBlKSB7XG5cdFx0XHQvLyBJZiB3ZSBoYXZlIG5vdCBtaWdyYXRlZCB0byBhcmdvbjIgd2UgcG9zdHBvbmUga2V5IHJvdGF0aW9uIHVudGlsIG5leHQgbG9naW4uXG5cdFx0XHR0aGlzLnBlbmRpbmdLZXlSb3RhdGlvbnMucHdLZXkgPSBwd0tleVxuXHRcdH1cblx0XHR0aGlzLnBlbmRpbmdHcm91cEtleVVwZGF0ZUlkcyA9IHJlc3VsdC5ncm91cEtleVVwZGF0ZXNcblx0XHR0aGlzLmZhY2FkZUluaXRpYWxpemVkRGVmZXJyZWRPYmplY3QucmVzb2x2ZSgpXG5cdH1cblxuXHQvKipcblx0ICogUHJvY2Vzc2VzIHBlbmRpbmcga2V5IHJvdGF0aW9ucyBhbmQgcGVyZm9ybXMgZm9sbG93LXVwIHRhc2tzIHN1Y2ggYXMgdXBkYXRpbmcgbWVtYmVyc2hpcHMgZm9yIGdyb3VwcyByb3RhdGVkIGJ5IGFub3RoZXIgdXNlci5cblx0ICogQHBhcmFtIHVzZXJcblx0ICovXG5cdGFzeW5jIHByb2Nlc3NQZW5kaW5nS2V5Um90YXRpb25zQW5kVXBkYXRlcyh1c2VyOiBVc2VyKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0dHJ5IHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGF3YWl0IHRoaXMubG9hZFBlbmRpbmdLZXlSb3RhdGlvbnModXNlcilcblx0XHRcdFx0YXdhaXQgdGhpcy5wcm9jZXNzUGVuZGluZ0tleVJvdGF0aW9uKHVzZXIpXG5cdFx0XHR9IGZpbmFsbHkge1xuXHRcdFx0XHQvLyB3ZSBzdGlsbCB0cnkgdXBkYXRpbmcgbWVtYmVyc2hpcHMgaWYgdGhlcmUgd2FzIGFuIGVycm9yIHdpdGggcm90YXRpb25zXG5cdFx0XHRcdGF3YWl0IHRoaXMudXBkYXRlR3JvdXBNZW1iZXJzaGlwcyh0aGlzLnBlbmRpbmdHcm91cEtleVVwZGF0ZUlkcylcblx0XHRcdH1cblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRpZiAoZSBpbnN0YW5jZW9mIExvY2tlZEVycm9yKSB7XG5cdFx0XHRcdC8vIHdlIGNhdGNoIGhlcmUgc28gdGhhdCB3ZSBhbHNvIGNhdGNoIGVycm9ycyBpbiB0aGUgYGZpbmFsbHlgIGJsb2NrXG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiZXJyb3Igd2hlbiBwcm9jZXNzaW5nIGtleSByb3RhdGlvbiBvciBncm91cCBrZXkgdXBkYXRlXCIsIGUpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBlXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFF1ZXJpZXMgdGhlIHNlcnZlciBmb3IgcGVuZGluZyBrZXkgcm90YXRpb25zIGZvciBhIGdpdmVuIHVzZXIgYW5kIHNhdmVzIHRoZW0gYW5kIG9wdGlvbmFsbHkgdGhlIGdpdmVuIHBhc3N3b3JkIGtleSAoaW4gY2FzZSBhbiBhZG1pbiBvciB1c2VyIGdyb3VwIG5lZWRzIHRvIGJlIHJvdGF0ZWQpLlxuXHQgKlxuXHQgKiBOb3RlIHRoYXQgdGhpcyBmdW5jdGlvbiBjdXJyZW50bHkgbWFrZXMgMiBzZXJ2ZXIgcmVxdWVzdHMgdG8gbG9hZCB0aGUga2V5IHJvdGF0aW9uIGxpc3QgYW5kIGNoZWNrIGlmIGEga2V5IHJvdGF0aW9uIGlzIG5lZWRlZC5cblx0ICogVGhpcyByb3V0aW5lIHNob3VsZCBiZSBvcHRpbWl6ZWQgaW4gdGhlIGZ1dHVyZSBieSBzYXZpbmcgYSBmbGFnIG9uIHRoZSB1c2VyIHRvIGRldGVybWluZSB3aGV0aGVyIGEga2V5IHJvdGF0aW9uIGlzIHJlcXVpcmVkIG9yIG5vdC5cblx0ICogQFZpc2libGVGb3JUZXN0aW5nXG5cdCAqL1xuXHRhc3luYyBsb2FkUGVuZGluZ0tleVJvdGF0aW9ucyh1c2VyOiBVc2VyKSB7XG5cdFx0Y29uc3QgdXNlckdyb3VwUm9vdCA9IGF3YWl0IHRoaXMuZW50aXR5Q2xpZW50LmxvYWQoVXNlckdyb3VwUm9vdFR5cGVSZWYsIHVzZXIudXNlckdyb3VwLmdyb3VwKVxuXHRcdGlmICh1c2VyR3JvdXBSb290LmtleVJvdGF0aW9ucyAhPSBudWxsKSB7XG5cdFx0XHRjb25zdCBwZW5kaW5nS2V5Um90YXRpb25zID0gYXdhaXQgdGhpcy5lbnRpdHlDbGllbnQubG9hZEFsbChLZXlSb3RhdGlvblR5cGVSZWYsIHVzZXJHcm91cFJvb3Qua2V5Um90YXRpb25zLmxpc3QpXG5cdFx0XHRjb25zdCBrZXlSb3RhdGlvbnNCeVR5cGUgPSBncm91cEJ5KHBlbmRpbmdLZXlSb3RhdGlvbnMsIChrZXlSb3RhdGlvbikgPT4ga2V5Um90YXRpb24uZ3JvdXBLZXlSb3RhdGlvblR5cGUpXG5cdFx0XHRsZXQgYWRtaW5PclVzZXJHcm91cEtleVJvdGF0aW9uQXJyYXk6IEFycmF5PEtleVJvdGF0aW9uPiA9IFtcblx0XHRcdFx0a2V5Um90YXRpb25zQnlUeXBlLmdldChHcm91cEtleVJvdGF0aW9uVHlwZS5BZG1pbkdyb3VwS2V5Um90YXRpb25TaW5nbGVVc2VyQWNjb3VudCksXG5cdFx0XHRcdGtleVJvdGF0aW9uc0J5VHlwZS5nZXQoR3JvdXBLZXlSb3RhdGlvblR5cGUuQWRtaW5Hcm91cEtleVJvdGF0aW9uTXVsdGlwbGVVc2VyQWNjb3VudCksXG5cdFx0XHRcdGtleVJvdGF0aW9uc0J5VHlwZS5nZXQoR3JvdXBLZXlSb3RhdGlvblR5cGUuQWRtaW5Hcm91cEtleVJvdGF0aW9uTXVsdGlwbGVBZG1pbkFjY291bnQpLFxuXHRcdFx0XHRrZXlSb3RhdGlvbnNCeVR5cGUuZ2V0KEdyb3VwS2V5Um90YXRpb25UeXBlLlVzZXIpLFxuXHRcdFx0XVxuXHRcdFx0XHQuZmxhdCgpXG5cdFx0XHRcdC5maWx0ZXIoaXNOb3ROdWxsKVxuXHRcdFx0bGV0IGN1c3RvbWVyR3JvdXBLZXlSb3RhdGlvbkFycmF5ID0ga2V5Um90YXRpb25zQnlUeXBlLmdldChHcm91cEtleVJvdGF0aW9uVHlwZS5DdXN0b21lcikgfHwgW11cblx0XHRcdGNvbnN0IGFkbWluT3JVc2VyR3JvdXBLZXlSb3RhdGlvbiA9IGFkbWluT3JVc2VyR3JvdXBLZXlSb3RhdGlvbkFycmF5WzBdXG5cdFx0XHR0aGlzLnBlbmRpbmdLZXlSb3RhdGlvbnMgPSB7XG5cdFx0XHRcdHB3S2V5OiB0aGlzLnBlbmRpbmdLZXlSb3RhdGlvbnMucHdLZXksXG5cdFx0XHRcdGFkbWluT3JVc2VyR3JvdXBLZXlSb3RhdGlvbjogYWRtaW5PclVzZXJHcm91cEtleVJvdGF0aW9uID8gYWRtaW5PclVzZXJHcm91cEtleVJvdGF0aW9uIDogbnVsbCxcblx0XHRcdFx0dGVhbU9yQ3VzdG9tZXJHcm91cEtleVJvdGF0aW9uczogY3VzdG9tZXJHcm91cEtleVJvdGF0aW9uQXJyYXkuY29uY2F0KGtleVJvdGF0aW9uc0J5VHlwZS5nZXQoR3JvdXBLZXlSb3RhdGlvblR5cGUuVGVhbSkgfHwgW10pLFxuXHRcdFx0XHR1c2VyQXJlYUdyb3Vwc0tleVJvdGF0aW9uczoga2V5Um90YXRpb25zQnlUeXBlLmdldChHcm91cEtleVJvdGF0aW9uVHlwZS5Vc2VyQXJlYSkgfHwgW10sXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFByb2Nlc3NlcyB0aGUgaW50ZXJuYWwgbGlzdCBvZiBAUGVuZGluZ0tleVJvdGF0aW9uLiBLZXkgcm90YXRpb25zIGFuZCAoaWYgZXhpc3RlbnQpIHBhc3N3b3JkIGtleXMgYXJlIGRlbGV0ZWQgYWZ0ZXIgcHJvY2Vzc2luZy5cblx0ICogQFZpc2libGVGb3JUZXN0aW5nXG5cdCAqL1xuXHRhc3luYyBwcm9jZXNzUGVuZGluZ0tleVJvdGF0aW9uKHVzZXI6IFVzZXIpIHtcblx0XHRhd2FpdCB0aGlzLmZhY2FkZUluaXRpYWxpemVkRGVmZXJyZWRPYmplY3QucHJvbWlzZVxuXHRcdC8vIGZpcnN0IGFkbWluLCB0aGVuIHVzZXIgYW5kIHRoZW4gdXNlciBhcmVhXG5cdFx0dHJ5IHtcblx0XHRcdGlmICh0aGlzLnBlbmRpbmdLZXlSb3RhdGlvbnMuYWRtaW5PclVzZXJHcm91cEtleVJvdGF0aW9uICYmIHRoaXMucGVuZGluZ0tleVJvdGF0aW9ucy5wd0tleSkge1xuXHRcdFx0XHRjb25zdCBncm91cEtleVJvdGF0aW9uVHlwZSA9IGFzc2VydEVudW1WYWx1ZShHcm91cEtleVJvdGF0aW9uVHlwZSwgdGhpcy5wZW5kaW5nS2V5Um90YXRpb25zLmFkbWluT3JVc2VyR3JvdXBLZXlSb3RhdGlvbi5ncm91cEtleVJvdGF0aW9uVHlwZSlcblx0XHRcdFx0c3dpdGNoIChncm91cEtleVJvdGF0aW9uVHlwZSkge1xuXHRcdFx0XHRcdGNhc2UgR3JvdXBLZXlSb3RhdGlvblR5cGUuQWRtaW5Hcm91cEtleVJvdGF0aW9uTXVsdGlwbGVBZG1pbkFjY291bnQ6XG5cdFx0XHRcdFx0XHRhd2FpdCB0aGlzLnJvdGF0ZU11bHRpcGxlQWRtaW5zR3JvdXBLZXlzKHVzZXIsIHRoaXMucGVuZGluZ0tleVJvdGF0aW9ucy5wd0tleSwgdGhpcy5wZW5kaW5nS2V5Um90YXRpb25zLmFkbWluT3JVc2VyR3JvdXBLZXlSb3RhdGlvbilcblx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdFx0Y2FzZSBHcm91cEtleVJvdGF0aW9uVHlwZS5BZG1pbkdyb3VwS2V5Um90YXRpb25TaW5nbGVVc2VyQWNjb3VudDpcblx0XHRcdFx0XHRjYXNlIEdyb3VwS2V5Um90YXRpb25UeXBlLkFkbWluR3JvdXBLZXlSb3RhdGlvbk11bHRpcGxlVXNlckFjY291bnQ6XG5cdFx0XHRcdFx0XHRhd2FpdCB0aGlzLnJvdGF0ZVNpbmdsZUFkbWluR3JvdXBLZXlzKHVzZXIsIHRoaXMucGVuZGluZ0tleVJvdGF0aW9ucy5wd0tleSwgdGhpcy5wZW5kaW5nS2V5Um90YXRpb25zLmFkbWluT3JVc2VyR3JvdXBLZXlSb3RhdGlvbilcblx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdFx0Y2FzZSBHcm91cEtleVJvdGF0aW9uVHlwZS5Vc2VyOlxuXHRcdFx0XHRcdFx0YXdhaXQgdGhpcy5yb3RhdGVVc2VyR3JvdXBLZXkodXNlciwgdGhpcy5wZW5kaW5nS2V5Um90YXRpb25zLnB3S2V5LCB0aGlzLnBlbmRpbmdLZXlSb3RhdGlvbnMuYWRtaW5PclVzZXJHcm91cEtleVJvdGF0aW9uKVxuXHRcdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLnBlbmRpbmdLZXlSb3RhdGlvbnMuYWRtaW5PclVzZXJHcm91cEtleVJvdGF0aW9uID0gbnVsbFxuXHRcdFx0fVxuXHRcdH0gZmluYWxseSB7XG5cdFx0XHR0aGlzLnBlbmRpbmdLZXlSb3RhdGlvbnMucHdLZXkgPSBudWxsXG5cdFx0fVxuXG5cdFx0Ly91c2VyIGFyZWEsIHRlYW0gYW5kIGN1c3RvbWVyIGtleSByb3RhdGlvbnMgYXJlIHNlbmQgaW4gYSBzaW5nbGUgcmVxdWVzdCwgc28gdGhhdCB0aGV5IGNhbiBiZSBwcm9jZXNzZWQgaW4gcGFyYWxsZWxcblx0XHRjb25zdCBzZXJ2aWNlRGF0YSA9IGNyZWF0ZUdyb3VwS2V5Um90YXRpb25Qb3N0SW4oeyBncm91cEtleVVwZGF0ZXM6IFtdIH0pXG5cdFx0aWYgKCFpc0VtcHR5KHRoaXMucGVuZGluZ0tleVJvdGF0aW9ucy50ZWFtT3JDdXN0b21lckdyb3VwS2V5Um90YXRpb25zKSkge1xuXHRcdFx0Y29uc3QgZ3JvdXBLZXlSb3RhdGlvbkRhdGEgPSBhd2FpdCB0aGlzLnJvdGF0ZUN1c3RvbWVyT3JUZWFtR3JvdXBLZXlzKHVzZXIpXG5cdFx0XHRpZiAoZ3JvdXBLZXlSb3RhdGlvbkRhdGEgIT0gbnVsbCkge1xuXHRcdFx0XHRzZXJ2aWNlRGF0YS5ncm91cEtleVVwZGF0ZXMgPSBncm91cEtleVJvdGF0aW9uRGF0YVxuXHRcdFx0fVxuXHRcdFx0dGhpcy5wZW5kaW5nS2V5Um90YXRpb25zLnRlYW1PckN1c3RvbWVyR3JvdXBLZXlSb3RhdGlvbnMgPSBbXVxuXHRcdH1cblxuXHRcdGxldCBpbnZpdGF0aW9uRGF0YTogR3JvdXBJbnZpdGF0aW9uUG9zdERhdGFbXSA9IFtdXG5cdFx0aWYgKCFpc0VtcHR5KHRoaXMucGVuZGluZ0tleVJvdGF0aW9ucy51c2VyQXJlYUdyb3Vwc0tleVJvdGF0aW9ucykpIHtcblx0XHRcdGNvbnN0IHsgZ3JvdXBLZXlSb3RhdGlvbkRhdGEsIHByZXBhcmVkUmVJbnZpdGVzIH0gPSBhd2FpdCB0aGlzLnJvdGF0ZVVzZXJBcmVhR3JvdXBLZXlzKHVzZXIpXG5cdFx0XHRpbnZpdGF0aW9uRGF0YSA9IHByZXBhcmVkUmVJbnZpdGVzXG5cdFx0XHRpZiAoZ3JvdXBLZXlSb3RhdGlvbkRhdGEgIT0gbnVsbCkge1xuXHRcdFx0XHRzZXJ2aWNlRGF0YS5ncm91cEtleVVwZGF0ZXMgPSBzZXJ2aWNlRGF0YS5ncm91cEtleVVwZGF0ZXMuY29uY2F0KGdyb3VwS2V5Um90YXRpb25EYXRhKVxuXHRcdFx0fVxuXHRcdFx0dGhpcy5wZW5kaW5nS2V5Um90YXRpb25zLnVzZXJBcmVhR3JvdXBzS2V5Um90YXRpb25zID0gW11cblx0XHR9XG5cdFx0aWYgKHNlcnZpY2VEYXRhLmdyb3VwS2V5VXBkYXRlcy5sZW5ndGggPD0gMCkge1xuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXHRcdGF3YWl0IHRoaXMuc2VydmljZUV4ZWN1dG9yLnBvc3QoR3JvdXBLZXlSb3RhdGlvblNlcnZpY2UsIHNlcnZpY2VEYXRhKVxuXG5cdFx0Zm9yIChjb25zdCBncm91cEtleVVwZGF0ZSBvZiBzZXJ2aWNlRGF0YS5ncm91cEtleVVwZGF0ZXMpIHtcblx0XHRcdHRoaXMuZ3JvdXBJZHNUaGF0UGVyZm9ybWVkS2V5Um90YXRpb25zLmFkZChncm91cEtleVVwZGF0ZS5ncm91cClcblx0XHR9XG5cblx0XHRpZiAoIWlzRW1wdHkoaW52aXRhdGlvbkRhdGEpKSB7XG5cdFx0XHRjb25zdCBzaGFyZUZhY2FkZSA9IGF3YWl0IHRoaXMuc2hhcmVGYWNhZGUoKVxuXHRcdFx0YXdhaXQgcHJvbWlzZU1hcChpbnZpdGF0aW9uRGF0YSwgKHByZXBhcmVkSW52aXRlKSA9PiBzaGFyZUZhY2FkZS5zZW5kR3JvdXBJbnZpdGF0aW9uUmVxdWVzdChwcmVwYXJlZEludml0ZSkpXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEBWaXNpYmxlRm9yVGVzdGluZ1xuXHQgKi9cblx0YXN5bmMgcm90YXRlU2luZ2xlQWRtaW5Hcm91cEtleXModXNlcjogVXNlciwgcGFzc3BocmFzZUtleTogQWVzMjU2S2V5LCBrZXlSb3RhdGlvbjogS2V5Um90YXRpb24pIHtcblx0XHRpZiAoaGFzTm9uUXVhbnR1bVNhZmVLZXlzKHBhc3NwaHJhc2VLZXkpKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhcIk5vdCBhbGxvd2VkIHRvIHJvdGF0ZSBhZG1pbiBncm91cCBrZXlzIHdpdGggYSBiY3J5cHQgcGFzc3dvcmQga2V5XCIpXG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cdFx0Y29uc3QgY3VycmVudFVzZXJHcm91cEtleSA9IHRoaXMua2V5TG9hZGVyRmFjYWRlLmdldEN1cnJlbnRTeW1Vc2VyR3JvdXBLZXkoKVxuXHRcdGNvbnN0IGFkbWluR3JvdXBNZW1iZXJzaGlwID0gZ2V0Rmlyc3RPclRocm93KGdldFVzZXJHcm91cE1lbWJlcnNoaXBzKHVzZXIsIEdyb3VwVHlwZS5BZG1pbikpXG5cdFx0Y29uc3QgY3VycmVudEFkbWluR3JvdXBLZXkgPSBhd2FpdCB0aGlzLmtleUxvYWRlckZhY2FkZS5nZXRDdXJyZW50U3ltR3JvdXBLZXkoYWRtaW5Hcm91cE1lbWJlcnNoaXAuZ3JvdXApXG5cdFx0Y29uc3QgYWRtaW5LZXlSb3RhdGlvbkRhdGEgPSBhd2FpdCB0aGlzLnByZXBhcmVLZXlSb3RhdGlvbkZvclNpbmdsZUFkbWluKGtleVJvdGF0aW9uLCB1c2VyLCBjdXJyZW50VXNlckdyb3VwS2V5LCBjdXJyZW50QWRtaW5Hcm91cEtleSwgcGFzc3BocmFzZUtleSlcblxuXHRcdGF3YWl0IHRoaXMuc2VydmljZUV4ZWN1dG9yLnBvc3QoQWRtaW5Hcm91cEtleVJvdGF0aW9uU2VydmljZSwgYWRtaW5LZXlSb3RhdGlvbkRhdGEua2V5Um90YXRpb25EYXRhKVxuXHRcdHRoaXMuZ3JvdXBJZHNUaGF0UGVyZm9ybWVkS2V5Um90YXRpb25zLmFkZCh1c2VyLnVzZXJHcm91cC5ncm91cClcblx0fVxuXG5cdC8vV2UgYXNzdW1lIHRoYXQgdGhlIGxvZ2dlZC1pbiB1c2VyIGlzIGFuIGFkbWluIHVzZXIgYW5kIHRoYXQgdGhlIGtleSBlbmNyeXB0aW5nIHRoZSBncm91cCBrZXkgYXJlIGFscmVhZHkgcHEgc2VjdXJlXG5cdHByaXZhdGUgYXN5bmMgcm90YXRlVXNlckFyZWFHcm91cEtleXModXNlcjogVXNlcik6IFByb21pc2U8e1xuXHRcdGdyb3VwS2V5Um90YXRpb25EYXRhOiBHcm91cEtleVJvdGF0aW9uRGF0YVtdXG5cdFx0cHJlcGFyZWRSZUludml0ZXM6IEdyb3VwSW52aXRhdGlvblBvc3REYXRhW11cblx0fT4ge1xuXHRcdC8vICogdGhlIGVuY3J5cHRpbmcga2V5cyBhcmUgMTI4LWJpdCBrZXlzLiAodXNlciBncm91cCBrZXkpXG5cdFx0Y29uc3QgY3VycmVudFVzZXJHcm91cEtleSA9IHRoaXMua2V5TG9hZGVyRmFjYWRlLmdldEN1cnJlbnRTeW1Vc2VyR3JvdXBLZXkoKVxuXHRcdGlmIChoYXNOb25RdWFudHVtU2FmZUtleXMoY3VycmVudFVzZXJHcm91cEtleS5vYmplY3QpKSB7XG5cdFx0XHQvLyB1c2VyIG9yIGFkbWluIGdyb3VwIGtleSByb3RhdGlvbiBzaG91bGQgYmUgc2NoZWR1bGVkIGZpcnN0IG9uIHRoZSBzZXJ2ZXIsIHNvIHRoaXMgc2hvdWxkIG5vdCBoYXBwZW5cblx0XHRcdGNvbnNvbGUubG9nKFwiS2V5cyBjYW5ub3QgYmUgcm90YXRlZCBhcyB0aGUgZW5jcnlwdGluZyBrZXlzIGFyZSBub3QgcHEgc2VjdXJlXCIpXG5cdFx0XHRyZXR1cm4geyBncm91cEtleVJvdGF0aW9uRGF0YTogW10sIHByZXBhcmVkUmVJbnZpdGVzOiBbXSB9XG5cdFx0fVxuXG5cdFx0Y29uc3QgZ3JvdXBLZXlVcGRhdGVzID0gbmV3IEFycmF5PEdyb3VwS2V5Um90YXRpb25EYXRhPigpXG5cdFx0bGV0IHByZXBhcmVkUmVJbnZpdGVzOiBHcm91cEludml0YXRpb25Qb3N0RGF0YVtdID0gW11cblx0XHRmb3IgKGNvbnN0IGtleVJvdGF0aW9uIG9mIHRoaXMucGVuZGluZ0tleVJvdGF0aW9ucy51c2VyQXJlYUdyb3Vwc0tleVJvdGF0aW9ucykge1xuXHRcdFx0Y29uc3QgeyBncm91cEtleVJvdGF0aW9uRGF0YSwgcHJlcGFyZWRSZUludml0YXRpb25zIH0gPSBhd2FpdCB0aGlzLnByZXBhcmVLZXlSb3RhdGlvbkZvckFyZWFHcm91cChrZXlSb3RhdGlvbiwgY3VycmVudFVzZXJHcm91cEtleSwgdXNlcilcblx0XHRcdGdyb3VwS2V5VXBkYXRlcy5wdXNoKGdyb3VwS2V5Um90YXRpb25EYXRhKVxuXHRcdFx0cHJlcGFyZWRSZUludml0ZXMgPSBwcmVwYXJlZFJlSW52aXRlcy5jb25jYXQocHJlcGFyZWRSZUludml0YXRpb25zKVxuXHRcdH1cblxuXHRcdHJldHVybiB7IGdyb3VwS2V5Um90YXRpb25EYXRhOiBncm91cEtleVVwZGF0ZXMsIHByZXBhcmVkUmVJbnZpdGVzIH1cblx0fVxuXG5cdC8vV2UgYXNzdW1lIHRoYXQgdGhlIGxvZ2dlZC1pbiB1c2VyIGlzIGFuIGFkbWluIHVzZXIgYW5kIHRoYXQgdGhlIGtleSBlbmNyeXB0aW5nIHRoZSBncm91cCBrZXkgYXJlIGFscmVhZHkgcHEgc2VjdXJlXG5cdHByaXZhdGUgYXN5bmMgcm90YXRlQ3VzdG9tZXJPclRlYW1Hcm91cEtleXModXNlcjogVXNlcikge1xuXHRcdC8vZ3JvdXAga2V5IHJvdGF0aW9uIGlzIHNraXBwZWQgaWZcblx0XHQvLyAqIHVzZXIgaXMgbm90IGFuIGFkbWluIHVzZXJcblx0XHRjb25zdCBhZG1pbkdyb3VwTWVtYmVyc2hpcCA9IHVzZXIubWVtYmVyc2hpcHMuZmluZCgobSkgPT4gbS5ncm91cFR5cGUgPT09IEdyb3VwS2V5Um90YXRpb25UeXBlLkFkbWluR3JvdXBLZXlSb3RhdGlvblNpbmdsZVVzZXJBY2NvdW50KVxuXHRcdGlmIChhZG1pbkdyb3VwTWVtYmVyc2hpcCA9PSBudWxsKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhcIk9ubHkgYWRtaW4gdXNlciBjYW4gcm90YXRlIHRoZSBncm91cFwiKVxuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0Ly8gKiB0aGUgZW5jcnlwdGluZyBrZXlzIGFyZSAxMjgtYml0IGtleXMuICh1c2VyIGdyb3VwIGtleSwgYWRtaW4gZ3JvdXAga2V5KVxuXHRcdGNvbnN0IGN1cnJlbnRVc2VyR3JvdXBLZXkgPSB0aGlzLmtleUxvYWRlckZhY2FkZS5nZXRDdXJyZW50U3ltVXNlckdyb3VwS2V5KClcblx0XHRjb25zdCBjdXJyZW50QWRtaW5Hcm91cEtleSA9IGF3YWl0IHRoaXMua2V5TG9hZGVyRmFjYWRlLmdldEN1cnJlbnRTeW1Hcm91cEtleShhZG1pbkdyb3VwTWVtYmVyc2hpcC5ncm91cClcblx0XHRpZiAoaGFzTm9uUXVhbnR1bVNhZmVLZXlzKGN1cnJlbnRVc2VyR3JvdXBLZXkub2JqZWN0LCBjdXJyZW50QWRtaW5Hcm91cEtleS5vYmplY3QpKSB7XG5cdFx0XHQvLyBhZG1pbiBncm91cCBrZXkgcm90YXRpb24gc2hvdWxkIGJlIHNjaGVkdWxlZCBmaXJzdCBvbiB0aGUgc2VydmVyLCBzbyB0aGlzIHNob3VsZCBub3QgaGFwcGVuXG5cdFx0XHRjb25zb2xlLmxvZyhcIktleXMgY2Fubm90IGJlIHJvdGF0ZWQgYXMgdGhlIGVuY3J5cHRpbmcga2V5cyBhcmUgbm90IHBxIHNlY3VyZVwiKVxuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0Y29uc3QgZ3JvdXBLZXlVcGRhdGVzID0gbmV3IEFycmF5PEdyb3VwS2V5Um90YXRpb25EYXRhPigpXG5cdFx0Zm9yIChjb25zdCBrZXlSb3RhdGlvbiBvZiB0aGlzLnBlbmRpbmdLZXlSb3RhdGlvbnMudGVhbU9yQ3VzdG9tZXJHcm91cEtleVJvdGF0aW9ucykge1xuXHRcdFx0Y29uc3QgZ3JvdXBLZXlSb3RhdGlvbkRhdGEgPSBhd2FpdCB0aGlzLnByZXBhcmVLZXlSb3RhdGlvbkZvckN1c3RvbWVyT3JUZWFtR3JvdXAoa2V5Um90YXRpb24sIGN1cnJlbnRVc2VyR3JvdXBLZXksIGN1cnJlbnRBZG1pbkdyb3VwS2V5LCB1c2VyKVxuXHRcdFx0Z3JvdXBLZXlVcGRhdGVzLnB1c2goZ3JvdXBLZXlSb3RhdGlvbkRhdGEpXG5cdFx0fVxuXHRcdHJldHVybiBncm91cEtleVVwZGF0ZXNcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgcHJlcGFyZUtleVJvdGF0aW9uRm9yU2luZ2xlQWRtaW4oXG5cdFx0a2V5Um90YXRpb246IEtleVJvdGF0aW9uLFxuXHRcdHVzZXI6IFVzZXIsXG5cdFx0Y3VycmVudFVzZXJHcm91cEtleTogVmVyc2lvbmVkS2V5LFxuXHRcdGN1cnJlbnRBZG1pbkdyb3VwS2V5OiBWZXJzaW9uZWRLZXksXG5cdFx0cGFzc3BocmFzZUtleTogQWVzMjU2S2V5LFxuXHQpIHtcblx0XHRjb25zdCBhZG1pbkdyb3VwSWQgPSB0aGlzLmdldFRhcmdldEdyb3VwSWQoa2V5Um90YXRpb24pXG5cdFx0Y29uc3QgdXNlckdyb3VwTWVtYmVyc2hpcCA9IHVzZXIudXNlckdyb3VwXG5cdFx0Y29uc3QgdXNlckdyb3VwSWQgPSB1c2VyR3JvdXBNZW1iZXJzaGlwLmdyb3VwXG5cdFx0Y29uc29sZS5sb2coYEtleVJvdGF0aW9uRmFjYWRlOiByb3RhdGUga2V5IGZvciBncm91cDogJHthZG1pbkdyb3VwSWR9LCBncm91cEtleVJvdGF0aW9uVHlwZTogJHtrZXlSb3RhdGlvbi5ncm91cEtleVJvdGF0aW9uVHlwZX1gKVxuXG5cdFx0Y29uc3QgYWRtaW5Hcm91cCA9IGF3YWl0IHRoaXMuZW50aXR5Q2xpZW50LmxvYWQoR3JvdXBUeXBlUmVmLCBhZG1pbkdyb3VwSWQpXG5cdFx0Y29uc3QgdXNlckdyb3VwID0gYXdhaXQgdGhpcy5lbnRpdHlDbGllbnQubG9hZChHcm91cFR5cGVSZWYsIHVzZXJHcm91cElkKVxuXG5cdFx0Y29uc3QgbmV3QWRtaW5Hcm91cEtleXMgPSBhd2FpdCB0aGlzLmdlbmVyYXRlR3JvdXBLZXlzKGFkbWluR3JvdXApXG5cdFx0Y29uc3QgYWRtaW5LZXlQYWlyID0gYXNzZXJ0Tm90TnVsbChuZXdBZG1pbkdyb3VwS2V5cy5lbmNyeXB0ZWRLZXlQYWlyKVxuXHRcdGNvbnN0IGFkbWluUHViS2V5TWFjTGlzdCA9IGF3YWl0IHRoaXMuZ2VuZXJhdGVQdWJLZXlUYWdzRm9yTm9uQWRtaW5Vc2Vycyhcblx0XHRcdGFzUFFQdWJsaWNLZXlzKGFkbWluS2V5UGFpciksXG5cdFx0XHRuZXdBZG1pbkdyb3VwS2V5cy5zeW1Hcm91cEtleS52ZXJzaW9uLFxuXHRcdFx0YWRtaW5Hcm91cElkLFxuXHRcdFx0YXNzZXJ0Tm90TnVsbCh1c2VyLmN1c3RvbWVyKSxcblx0XHRcdHVzZXJHcm91cElkLFxuXHRcdClcblxuXHRcdGNvbnN0IG5ld1VzZXJHcm91cEtleXMgPSBhd2FpdCB0aGlzLmdlbmVyYXRlR3JvdXBLZXlzKHVzZXJHcm91cClcblx0XHRjb25zdCBlbmNyeXB0ZWRBZG1pbktleXMgPSBhd2FpdCB0aGlzLmVuY3J5cHRHcm91cEtleXMoYWRtaW5Hcm91cCwgY3VycmVudEFkbWluR3JvdXBLZXksIG5ld0FkbWluR3JvdXBLZXlzLCBuZXdBZG1pbkdyb3VwS2V5cy5zeW1Hcm91cEtleSlcblx0XHRjb25zdCBlbmNyeXB0ZWRVc2VyS2V5cyA9IGF3YWl0IHRoaXMuZW5jcnlwdFVzZXJHcm91cEtleSh1c2VyR3JvdXAsIGN1cnJlbnRVc2VyR3JvdXBLZXksIG5ld1VzZXJHcm91cEtleXMsIHBhc3NwaHJhc2VLZXksIG5ld0FkbWluR3JvdXBLZXlzLCB1c2VyKVxuXHRcdGNvbnN0IG1lbWJlcnNoaXBFbmNOZXdHcm91cEtleSA9IHRoaXMuY3J5cHRvV3JhcHBlci5lbmNyeXB0S2V5V2l0aFZlcnNpb25lZEtleShuZXdVc2VyR3JvdXBLZXlzLnN5bUdyb3VwS2V5LCBuZXdBZG1pbkdyb3VwS2V5cy5zeW1Hcm91cEtleS5vYmplY3QpXG5cblx0XHRjb25zdCBhZG1pbkdyb3VwS2V5RGF0YSA9IGNyZWF0ZUdyb3VwS2V5Um90YXRpb25EYXRhKHtcblx0XHRcdGFkbWluR3JvdXBFbmNHcm91cEtleTogYXNzZXJ0Tm90TnVsbChlbmNyeXB0ZWRBZG1pbktleXMuYWRtaW5Hcm91cEtleUVuY05ld0dyb3VwS2V5KS5rZXksXG5cdFx0XHRhZG1pbkdyb3VwS2V5VmVyc2lvbjogU3RyaW5nKGFzc2VydE5vdE51bGwoZW5jcnlwdGVkQWRtaW5LZXlzLmFkbWluR3JvdXBLZXlFbmNOZXdHcm91cEtleSkuZW5jcnlwdGluZ0tleVZlcnNpb24pLFxuXHRcdFx0Z3JvdXBFbmNQcmV2aW91c0dyb3VwS2V5OiBlbmNyeXB0ZWRBZG1pbktleXMubmV3R3JvdXBLZXlFbmNDdXJyZW50R3JvdXBLZXkua2V5LFxuXHRcdFx0Z3JvdXBLZXlWZXJzaW9uOiBTdHJpbmcobmV3QWRtaW5Hcm91cEtleXMuc3ltR3JvdXBLZXkudmVyc2lvbiksXG5cdFx0XHRncm91cDogYWRtaW5Hcm91cC5faWQsXG5cdFx0XHRrZXlQYWlyOiBtYWtlS2V5UGFpcihlbmNyeXB0ZWRBZG1pbktleXMua2V5UGFpciksXG5cdFx0XHRncm91cEtleVVwZGF0ZXNGb3JNZW1iZXJzOiBbXSwgLy8gd2Ugb25seSByb3RhdGVkIGZvciBhZG1pbiBncm91cHMgd2l0aCBvbmx5IG9uZSBtZW1iZXIsXG5cdFx0XHRncm91cE1lbWJlcnNoaXBVcGRhdGVEYXRhOiBbXG5cdFx0XHRcdGNyZWF0ZUdyb3VwTWVtYmVyc2hpcFVwZGF0ZURhdGEoe1xuXHRcdFx0XHRcdHVzZXJJZDogdXNlci5faWQsXG5cdFx0XHRcdFx0dXNlckVuY0dyb3VwS2V5OiBtZW1iZXJzaGlwRW5jTmV3R3JvdXBLZXkua2V5LFxuXHRcdFx0XHRcdHVzZXJLZXlWZXJzaW9uOiBTdHJpbmcobWVtYmVyc2hpcEVuY05ld0dyb3VwS2V5LmVuY3J5cHRpbmdLZXlWZXJzaW9uKSxcblx0XHRcdFx0fSksXG5cdFx0XHRdLFxuXHRcdH0pXG5cblx0XHRjb25zdCB1c2VyR3JvdXBLZXlEYXRhID0gY3JlYXRlVXNlckdyb3VwS2V5Um90YXRpb25EYXRhKHtcblx0XHRcdHJlY292ZXJDb2RlRGF0YTogZW5jcnlwdGVkVXNlcktleXMucmVjb3ZlckNvZGVEYXRhLFxuXHRcdFx0ZGlzdHJpYnV0aW9uS2V5RW5jVXNlckdyb3VwS2V5OiBlbmNyeXB0ZWRVc2VyS2V5cy5kaXN0cmlidXRpb25LZXlFbmNOZXdVc2VyR3JvdXBLZXksXG5cdFx0XHRhdXRoVmVyaWZpZXI6IGVuY3J5cHRlZFVzZXJLZXlzLmF1dGhWZXJpZmllcixcblx0XHRcdGdyb3VwOiB1c2VyR3JvdXAuX2lkLFxuXHRcdFx0dXNlckdyb3VwRW5jUHJldmlvdXNHcm91cEtleTogZW5jcnlwdGVkVXNlcktleXMubmV3VXNlckdyb3VwS2V5RW5jQ3VycmVudEdyb3VwS2V5LmtleSxcblx0XHRcdHVzZXJHcm91cEtleVZlcnNpb246IFN0cmluZyhuZXdVc2VyR3JvdXBLZXlzLnN5bUdyb3VwS2V5LnZlcnNpb24pLFxuXHRcdFx0a2V5UGFpcjogZW5jcnlwdGVkVXNlcktleXMua2V5UGFpcixcblx0XHRcdGFkbWluR3JvdXBFbmNVc2VyR3JvdXBLZXk6IGVuY3J5cHRlZFVzZXJLZXlzLm5ld0FkbWluR3JvdXBLZXlFbmNOZXdVc2VyR3JvdXBLZXkua2V5LFxuXHRcdFx0YWRtaW5Hcm91cEtleVZlcnNpb246IFN0cmluZyhlbmNyeXB0ZWRVc2VyS2V5cy5uZXdBZG1pbkdyb3VwS2V5RW5jTmV3VXNlckdyb3VwS2V5LmVuY3J5cHRpbmdLZXlWZXJzaW9uKSxcblx0XHRcdHBhc3NwaHJhc2VFbmNVc2VyR3JvdXBLZXk6IGVuY3J5cHRlZFVzZXJLZXlzLnBhc3NwaHJhc2VLZXlFbmNOZXdVc2VyR3JvdXBLZXkua2V5LFxuXHRcdFx0cHViQWRtaW5Hcm91cEVuY1VzZXJHcm91cEtleTogbnVsbCxcblx0XHRcdHVzZXJHcm91cEVuY0FkbWluR3JvdXBLZXk6IG51bGwsXG5cdFx0fSlcblxuXHRcdHJldHVybiB7XG5cdFx0XHRrZXlSb3RhdGlvbkRhdGE6IGNyZWF0ZUFkbWluR3JvdXBLZXlSb3RhdGlvblBvc3RJbih7XG5cdFx0XHRcdGFkbWluR3JvdXBLZXlEYXRhLFxuXHRcdFx0XHR1c2VyR3JvdXBLZXlEYXRhLFxuXHRcdFx0XHRhZG1pblB1YktleU1hY0xpc3QsXG5cdFx0XHRcdGRpc3RyaWJ1dGlvbjogW10sXG5cdFx0XHR9KSxcblx0XHRcdG5ld0FkbWluR3JvdXBLZXlzLFxuXHRcdFx0bmV3VXNlckdyb3VwS2V5cyxcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIGdlbmVyYXRlUHViS2V5VGFnc0Zvck5vbkFkbWluVXNlcnMoXG5cdFx0bmV3QWRtaW5QdWJLZXk6IFBRUHVibGljS2V5cyxcblx0XHRuZXdBZG1pbkdyb3VwS2V5VmVyc2lvbjogS2V5VmVyc2lvbixcblx0XHRhZG1pbkdyb3VwSWQ6IElkLFxuXHRcdGN1c3RvbWVySWQ6IElkLFxuXHRcdGdyb3VwVG9FeGNsdWRlOiBJZCxcblx0KTogUHJvbWlzZTxBcnJheTxLZXlNYWM+PiB7XG5cdFx0Y29uc3Qga2V5VGFnczogS2V5TWFjW10gPSBbXVxuXG5cdFx0Y29uc3QgY3VzdG9tZXIgPSBhd2FpdCB0aGlzLmVudGl0eUNsaWVudC5sb2FkKEN1c3RvbWVyVHlwZVJlZiwgY3VzdG9tZXJJZClcblx0XHRjb25zdCB1c2VyR3JvdXBJbmZvcyA9IGF3YWl0IHRoaXMuZW50aXR5Q2xpZW50LmxvYWRBbGwoR3JvdXBJbmZvVHlwZVJlZiwgY3VzdG9tZXIudXNlckdyb3VwcylcblxuXHRcdGxldCBncm91cE1hbmFnZW1lbnRGYWNhZGUgPSBhd2FpdCB0aGlzLmdyb3VwTWFuYWdlbWVudEZhY2FkZSgpXG5cblx0XHRmb3IgKGNvbnN0IHVzZXJHcm91cEluZm8gb2YgdXNlckdyb3VwSW5mb3MpIHtcblx0XHRcdGlmIChpc1NhbWVJZCh1c2VyR3JvdXBJbmZvLmdyb3VwLCBncm91cFRvRXhjbHVkZSkpIGNvbnRpbnVlXG5cblx0XHRcdGNvbnN0IGN1cnJlbnRVc2VyR3JvdXBLZXkgPSBhd2FpdCBncm91cE1hbmFnZW1lbnRGYWNhZGUuZ2V0Q3VycmVudEdyb3VwS2V5VmlhQWRtaW5FbmNHS2V5KHVzZXJHcm91cEluZm8uZ3JvdXApXG5cdFx0XHRjb25zdCB0YWcgPSB0aGlzLmtleUF1dGhlbnRpY2F0aW9uRmFjYWRlLmNvbXB1dGVUYWcoe1xuXHRcdFx0XHR0YWdUeXBlOiBcIk5FV19BRE1JTl9QVUJfS0VZX1RBR1wiLFxuXHRcdFx0XHRzb3VyY2VPZlRydXN0OiB7IHJlY2VpdmluZ1VzZXJHcm91cEtleTogY3VycmVudFVzZXJHcm91cEtleS5vYmplY3QgfSxcblx0XHRcdFx0dW50cnVzdGVkS2V5OiB7IG5ld0FkbWluUHViS2V5IH0sXG5cdFx0XHRcdGJpbmRpbmdEYXRhOiB7XG5cdFx0XHRcdFx0dXNlckdyb3VwSWQ6IHVzZXJHcm91cEluZm8uZ3JvdXAsXG5cdFx0XHRcdFx0YWRtaW5Hcm91cElkLFxuXHRcdFx0XHRcdGN1cnJlbnRSZWNlaXZpbmdVc2VyR3JvdXBLZXlWZXJzaW9uOiBjdXJyZW50VXNlckdyb3VwS2V5LnZlcnNpb24sXG5cdFx0XHRcdFx0bmV3QWRtaW5Hcm91cEtleVZlcnNpb24sXG5cdFx0XHRcdH0sXG5cdFx0XHR9KVxuXG5cdFx0XHRjb25zdCBwdWJsaWNLZXlUYWcgPSBjcmVhdGVLZXlNYWMoe1xuXHRcdFx0XHR0YWdnaW5nR3JvdXA6IHVzZXJHcm91cEluZm8uZ3JvdXAsXG5cdFx0XHRcdHRhZyxcblx0XHRcdFx0dGFnZ2VkS2V5VmVyc2lvbjogU3RyaW5nKG5ld0FkbWluR3JvdXBLZXlWZXJzaW9uKSxcblx0XHRcdFx0dGFnZ2luZ0tleVZlcnNpb246IFN0cmluZyhjdXJyZW50VXNlckdyb3VwS2V5LnZlcnNpb24pLFxuXHRcdFx0fSlcblx0XHRcdGtleVRhZ3MucHVzaChwdWJsaWNLZXlUYWcpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGtleVRhZ3Ncblx0fVxuXG5cdHByaXZhdGUgZGVyaXZlQWRtaW5Hcm91cERpc3RyaWJ1dGlvbktleVBhaXJFbmNyeXB0aW9uS2V5KFxuXHRcdGFkbWluR3JvdXBJZDogSWQsXG5cdFx0dXNlckdyb3VwSWQ6IElkLFxuXHRcdGN1cnJlbnRBZG1pbkdyb3VwS2V5VmVyc2lvbjogS2V5VmVyc2lvbixcblx0XHRjdXJyZW50VXNlckdyb3VwS2V5VmVyc2lvbjogbnVtYmVyLFxuXHRcdHB3S2V5OiBBZXMyNTZLZXksXG5cdCk6IEFlczI1NktleSB7XG5cdFx0cmV0dXJuIHRoaXMuY3J5cHRvV3JhcHBlci5kZXJpdmVLZXlXaXRoSGtkZih7XG5cdFx0XHRzYWx0OiBgYWRtaW5Hcm91cDogJHthZG1pbkdyb3VwSWR9LCB1c2VyR3JvdXA6ICR7dXNlckdyb3VwSWR9LCBjdXJyZW50VXNlckdyb3VwS2V5VmVyc2lvbjogJHtjdXJyZW50VXNlckdyb3VwS2V5VmVyc2lvbn0sIGN1cnJlbnRBZG1pbkdyb3VwS2V5VmVyc2lvbjogJHtjdXJyZW50QWRtaW5Hcm91cEtleVZlcnNpb259YCxcblx0XHRcdGtleTogcHdLZXksXG5cdFx0XHRjb250ZXh0OiBcImFkbWluR3JvdXBEaXN0cmlidXRpb25LZXlQYWlyRW5jcnlwdGlvbktleVwiLFxuXHRcdH0pXG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIHByZXBhcmVLZXlSb3RhdGlvbkZvckFyZWFHcm91cChcblx0XHRrZXlSb3RhdGlvbjogS2V5Um90YXRpb24sXG5cdFx0Y3VycmVudFVzZXJHcm91cEtleTogVmVyc2lvbmVkS2V5LFxuXHRcdHVzZXI6IFVzZXIsXG5cdCk6IFByb21pc2U8UHJlcGFyZWRVc2VyQXJlYUdyb3VwS2V5Um90YXRpb24+IHtcblx0XHRjb25zdCB0YXJnZXRHcm91cElkID0gdGhpcy5nZXRUYXJnZXRHcm91cElkKGtleVJvdGF0aW9uKVxuXHRcdGNvbnNvbGUubG9nKGBLZXlSb3RhdGlvbkZhY2FkZTogcm90YXRlIGtleSBmb3IgZ3JvdXA6ICR7dGFyZ2V0R3JvdXBJZH0sIGdyb3VwS2V5Um90YXRpb25UeXBlOiAke2tleVJvdGF0aW9uLmdyb3VwS2V5Um90YXRpb25UeXBlfWApXG5cdFx0Y29uc3QgdGFyZ2V0R3JvdXAgPSBhd2FpdCB0aGlzLmVudGl0eUNsaWVudC5sb2FkKEdyb3VwVHlwZVJlZiwgdGFyZ2V0R3JvdXBJZClcblx0XHRjb25zdCBjdXJyZW50R3JvdXBLZXkgPSBhd2FpdCB0aGlzLmtleUxvYWRlckZhY2FkZS5nZXRDdXJyZW50U3ltR3JvdXBLZXkodGFyZ2V0R3JvdXBJZClcblxuXHRcdGNvbnN0IG5ld0dyb3VwS2V5cyA9IGF3YWl0IHRoaXMuZ2VuZXJhdGVHcm91cEtleXModGFyZ2V0R3JvdXApXG5cdFx0Y29uc3QgZ3JvdXBFbmNQcmV2aW91c0dyb3VwS2V5ID0gdGhpcy5jcnlwdG9XcmFwcGVyLmVuY3J5cHRLZXlXaXRoVmVyc2lvbmVkS2V5KG5ld0dyb3VwS2V5cy5zeW1Hcm91cEtleSwgY3VycmVudEdyb3VwS2V5Lm9iamVjdClcblx0XHRjb25zdCBtZW1iZXJzaGlwU3ltRW5jTmV3R3JvdXBLZXkgPSB0aGlzLmNyeXB0b1dyYXBwZXIuZW5jcnlwdEtleVdpdGhWZXJzaW9uZWRLZXkoY3VycmVudFVzZXJHcm91cEtleSwgbmV3R3JvdXBLZXlzLnN5bUdyb3VwS2V5Lm9iamVjdClcblx0XHRjb25zdCBwcmVwYXJlZFJlSW52aXRhdGlvbnMgPSBhd2FpdCB0aGlzLmhhbmRsZVBlbmRpbmdJbnZpdGF0aW9ucyh0YXJnZXRHcm91cCwgbmV3R3JvdXBLZXlzLnN5bUdyb3VwS2V5KVxuXG5cdFx0Y29uc3QgZ3JvdXBLZXlVcGRhdGVzRm9yTWVtYmVycyA9IGF3YWl0IHRoaXMuY3JlYXRlR3JvdXBLZXlVcGRhdGVzRm9yTWVtYmVycyh0YXJnZXRHcm91cCwgbmV3R3JvdXBLZXlzLnN5bUdyb3VwS2V5KVxuXG5cdFx0Y29uc3QgZ3JvdXBLZXlSb3RhdGlvbkRhdGEgPSBjcmVhdGVHcm91cEtleVJvdGF0aW9uRGF0YSh7XG5cdFx0XHRhZG1pbkdyb3VwRW5jR3JvdXBLZXk6IG51bGwsIC8vIGZvciB1c2VyIGFyZWEgZ3JvdXBzIHdlIGRvIG5vdCBoYXZlIGFuIGFkbWluR3JvdXBFbmNHcm91cEtleSwgc28gd2Ugc2V0IGl0IGFsd2F5cyB0byBudWxsLlxuXHRcdFx0YWRtaW5Hcm91cEtleVZlcnNpb246IG51bGwsXG5cdFx0XHRncm91cDogdGFyZ2V0R3JvdXBJZCxcblx0XHRcdGdyb3VwS2V5VmVyc2lvbjogU3RyaW5nKG5ld0dyb3VwS2V5cy5zeW1Hcm91cEtleS52ZXJzaW9uKSxcblx0XHRcdGdyb3VwRW5jUHJldmlvdXNHcm91cEtleTogZ3JvdXBFbmNQcmV2aW91c0dyb3VwS2V5LmtleSxcblx0XHRcdGtleVBhaXI6IG1ha2VLZXlQYWlyKG5ld0dyb3VwS2V5cy5lbmNyeXB0ZWRLZXlQYWlyKSxcblx0XHRcdGdyb3VwS2V5VXBkYXRlc0Zvck1lbWJlcnMsXG5cdFx0XHRncm91cE1lbWJlcnNoaXBVcGRhdGVEYXRhOiBbXG5cdFx0XHRcdGNyZWF0ZUdyb3VwTWVtYmVyc2hpcFVwZGF0ZURhdGEoe1xuXHRcdFx0XHRcdHVzZXJJZDogdXNlci5faWQsXG5cdFx0XHRcdFx0dXNlckVuY0dyb3VwS2V5OiBtZW1iZXJzaGlwU3ltRW5jTmV3R3JvdXBLZXkua2V5LFxuXHRcdFx0XHRcdHVzZXJLZXlWZXJzaW9uOiBTdHJpbmcoY3VycmVudFVzZXJHcm91cEtleS52ZXJzaW9uKSxcblx0XHRcdFx0fSksXG5cdFx0XHRdLFxuXHRcdH0pXG5cdFx0cmV0dXJuIHtcblx0XHRcdGdyb3VwS2V5Um90YXRpb25EYXRhLFxuXHRcdFx0cHJlcGFyZWRSZUludml0YXRpb25zLFxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgcHJlcGFyZUtleVJvdGF0aW9uRm9yQ3VzdG9tZXJPclRlYW1Hcm91cChcblx0XHRrZXlSb3RhdGlvbjogS2V5Um90YXRpb24sXG5cdFx0Y3VycmVudFVzZXJHcm91cEtleTogVmVyc2lvbmVkS2V5LFxuXHRcdGN1cnJlbnRBZG1pbkdyb3VwS2V5OiBWZXJzaW9uZWRLZXksXG5cdFx0dXNlcjogVXNlcixcblx0KSB7XG5cdFx0Y29uc3QgdGFyZ2V0R3JvdXBJZCA9IHRoaXMuZ2V0VGFyZ2V0R3JvdXBJZChrZXlSb3RhdGlvbilcblx0XHRjb25zb2xlLmxvZyhgS2V5Um90YXRpb25GYWNhZGU6IHJvdGF0ZSBrZXkgZm9yIGdyb3VwOiAke3RhcmdldEdyb3VwSWR9LCBncm91cEtleVJvdGF0aW9uVHlwZTogJHtrZXlSb3RhdGlvbi5ncm91cEtleVJvdGF0aW9uVHlwZX1gKVxuXHRcdGNvbnN0IHRhcmdldEdyb3VwID0gYXdhaXQgdGhpcy5lbnRpdHlDbGllbnQubG9hZChHcm91cFR5cGVSZWYsIHRhcmdldEdyb3VwSWQpXG5cblx0XHRjb25zdCBtZW1iZXJzID0gYXdhaXQgdGhpcy5lbnRpdHlDbGllbnQubG9hZEFsbChHcm91cE1lbWJlclR5cGVSZWYsIHRhcmdldEdyb3VwLm1lbWJlcnMpXG5cdFx0Y29uc3Qgb3duTWVtYmVyID0gbWVtYmVycy5maW5kKChtZW1iZXIpID0+IG1lbWJlci51c2VyID09IHVzZXIuX2lkKVxuXHRcdGNvbnN0IG90aGVyTWVtYmVycyA9IG1lbWJlcnMuZmlsdGVyKChtZW1iZXIpID0+IG1lbWJlci51c2VyICE9IHVzZXIuX2lkKVxuXHRcdGxldCBjdXJyZW50R3JvdXBLZXkgPSBhd2FpdCB0aGlzLmdldEN1cnJlbnRHcm91cEtleSh0YXJnZXRHcm91cClcblx0XHRjb25zdCBuZXdHcm91cEtleXMgPSBhd2FpdCB0aGlzLmdlbmVyYXRlR3JvdXBLZXlzKHRhcmdldEdyb3VwKVxuXHRcdGNvbnN0IGVuY3J5cHRlZEdyb3VwS2V5cyA9IGF3YWl0IHRoaXMuZW5jcnlwdEdyb3VwS2V5cyh0YXJnZXRHcm91cCwgY3VycmVudEdyb3VwS2V5LCBuZXdHcm91cEtleXMsIGN1cnJlbnRBZG1pbkdyb3VwS2V5KVxuXG5cdFx0Y29uc3QgZ3JvdXBNZW1iZXJzaGlwVXBkYXRlRGF0YSA9IG5ldyBBcnJheTxHcm91cE1lbWJlcnNoaXBVcGRhdGVEYXRhPigpXG5cblx0XHQvL2ZvciB0ZWFtIGdyb3VwcyB0aGUgYWRtaW4gdXNlciBtaWdodCBub3QgYmUgYSBtZW1iZXIgb2YgdGhlIGdyb3VwXG5cdFx0aWYgKG93bk1lbWJlcikge1xuXHRcdFx0Y29uc3QgbWVtYmVyc2hpcFN5bUVuY05ld0dyb3VwS2V5ID0gdGhpcy5jcnlwdG9XcmFwcGVyLmVuY3J5cHRLZXlXaXRoVmVyc2lvbmVkS2V5KGN1cnJlbnRVc2VyR3JvdXBLZXksIG5ld0dyb3VwS2V5cy5zeW1Hcm91cEtleS5vYmplY3QpXG5cdFx0XHRncm91cE1lbWJlcnNoaXBVcGRhdGVEYXRhLnB1c2goXG5cdFx0XHRcdGNyZWF0ZUdyb3VwTWVtYmVyc2hpcFVwZGF0ZURhdGEoe1xuXHRcdFx0XHRcdHVzZXJJZDogdXNlci5faWQsXG5cdFx0XHRcdFx0dXNlckVuY0dyb3VwS2V5OiBtZW1iZXJzaGlwU3ltRW5jTmV3R3JvdXBLZXkua2V5LFxuXHRcdFx0XHRcdHVzZXJLZXlWZXJzaW9uOiBTdHJpbmcoY3VycmVudFVzZXJHcm91cEtleS52ZXJzaW9uKSxcblx0XHRcdFx0fSksXG5cdFx0XHQpXG5cdFx0fVxuXHRcdGZvciAoY29uc3QgbWVtYmVyIG9mIG90aGVyTWVtYmVycykge1xuXHRcdFx0Y29uc3QgdXNlckVuY05ld0dyb3VwS2V5OiBWZXJzaW9uZWRFbmNyeXB0ZWRLZXkgPSBhd2FpdCB0aGlzLmVuY3J5cHRHcm91cEtleUZvck90aGVyVXNlcnMobWVtYmVyLnVzZXIsIG5ld0dyb3VwS2V5cy5zeW1Hcm91cEtleSlcblx0XHRcdGxldCBncm91cE1lbWJlcnNoaXBVcGRhdGUgPSBjcmVhdGVHcm91cE1lbWJlcnNoaXBVcGRhdGVEYXRhKHtcblx0XHRcdFx0dXNlcklkOiBtZW1iZXIudXNlcixcblx0XHRcdFx0dXNlckVuY0dyb3VwS2V5OiB1c2VyRW5jTmV3R3JvdXBLZXkua2V5LFxuXHRcdFx0XHR1c2VyS2V5VmVyc2lvbjogU3RyaW5nKHVzZXJFbmNOZXdHcm91cEtleS5lbmNyeXB0aW5nS2V5VmVyc2lvbiksXG5cdFx0XHR9KVxuXHRcdFx0Z3JvdXBNZW1iZXJzaGlwVXBkYXRlRGF0YS5wdXNoKGdyb3VwTWVtYmVyc2hpcFVwZGF0ZSlcblx0XHR9XG5cblx0XHRyZXR1cm4gY3JlYXRlR3JvdXBLZXlSb3RhdGlvbkRhdGEoe1xuXHRcdFx0YWRtaW5Hcm91cEVuY0dyb3VwS2V5OiBlbmNyeXB0ZWRHcm91cEtleXMuYWRtaW5Hcm91cEtleUVuY05ld0dyb3VwS2V5ID8gZW5jcnlwdGVkR3JvdXBLZXlzLmFkbWluR3JvdXBLZXlFbmNOZXdHcm91cEtleS5rZXkgOiBudWxsLFxuXHRcdFx0YWRtaW5Hcm91cEtleVZlcnNpb246IGVuY3J5cHRlZEdyb3VwS2V5cy5hZG1pbkdyb3VwS2V5RW5jTmV3R3JvdXBLZXlcblx0XHRcdFx0PyBTdHJpbmcoZW5jcnlwdGVkR3JvdXBLZXlzLmFkbWluR3JvdXBLZXlFbmNOZXdHcm91cEtleS5lbmNyeXB0aW5nS2V5VmVyc2lvbilcblx0XHRcdFx0OiBudWxsLFxuXHRcdFx0Z3JvdXA6IHRhcmdldEdyb3VwSWQsXG5cdFx0XHRncm91cEtleVZlcnNpb246IFN0cmluZyhuZXdHcm91cEtleXMuc3ltR3JvdXBLZXkudmVyc2lvbiksXG5cdFx0XHRncm91cEVuY1ByZXZpb3VzR3JvdXBLZXk6IGVuY3J5cHRlZEdyb3VwS2V5cy5uZXdHcm91cEtleUVuY0N1cnJlbnRHcm91cEtleS5rZXksXG5cdFx0XHRrZXlQYWlyOiBtYWtlS2V5UGFpcihlbmNyeXB0ZWRHcm91cEtleXMua2V5UGFpciksXG5cdFx0XHRncm91cEtleVVwZGF0ZXNGb3JNZW1iZXJzOiBbXSxcblx0XHRcdGdyb3VwTWVtYmVyc2hpcFVwZGF0ZURhdGE6IGdyb3VwTWVtYmVyc2hpcFVwZGF0ZURhdGEsXG5cdFx0fSlcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgZ2V0Q3VycmVudEdyb3VwS2V5KHRhcmdldEdyb3VwOiBHcm91cCk6IFByb21pc2U8VmVyc2lvbmVkS2V5PiB7XG5cdFx0dHJ5IHtcblx0XHRcdHJldHVybiBhd2FpdCB0aGlzLmtleUxvYWRlckZhY2FkZS5nZXRDdXJyZW50U3ltR3JvdXBLZXkodGFyZ2V0R3JvdXAuX2lkKVxuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdC8vaWYgd2UgY2Fubm90IGdldC9kZWNyeXB0IHRoZSBncm91cCBrZXkgdmlhIG1lbWJlcnNoaXAgd2UgdHJ5IHZpYSBhZG1pbkVuY0dyb3VwS2V5XG5cdFx0XHRjb25zdCBncm91cE1hbmFnZW1lbnRGYWNhZGUgPSBhd2FpdCB0aGlzLmdyb3VwTWFuYWdlbWVudEZhY2FkZSgpXG5cdFx0XHRjb25zdCBjdXJyZW50S2V5ID0gYXdhaXQgZ3JvdXBNYW5hZ2VtZW50RmFjYWRlLmdldEdyb3VwS2V5VmlhQWRtaW5FbmNHS2V5KHRhcmdldEdyb3VwLl9pZCwgcGFyc2VLZXlWZXJzaW9uKHRhcmdldEdyb3VwLmdyb3VwS2V5VmVyc2lvbikpXG5cdFx0XHRyZXR1cm4geyBvYmplY3Q6IGN1cnJlbnRLZXksIHZlcnNpb246IHBhcnNlS2V5VmVyc2lvbih0YXJnZXRHcm91cC5ncm91cEtleVZlcnNpb24pIH1cblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIGVuY3J5cHRVc2VyR3JvdXBLZXkoXG5cdFx0dXNlckdyb3VwOiBHcm91cCxcblx0XHRjdXJyZW50VXNlckdyb3VwS2V5OiBWZXJzaW9uZWRLZXksXG5cdFx0bmV3VXNlckdyb3VwS2V5czogR2VuZXJhdGVkR3JvdXBLZXlzLFxuXHRcdHBhc3NwaHJhc2VLZXk6IEFlczI1NktleSxcblx0XHRuZXdBZG1pbkdyb3VwS2V5czogR2VuZXJhdGVkR3JvdXBLZXlzLFxuXHRcdHVzZXI6IFVzZXIsXG5cdCk6IFByb21pc2U8RW5jcnlwdGVkVXNlckdyb3VwS2V5cz4ge1xuXHRcdGNvbnN0IHsgbWVtYmVyc2hpcFN5bUVuY05ld0dyb3VwS2V5LCBkaXN0cmlidXRpb25LZXlFbmNOZXdVc2VyR3JvdXBLZXksIGF1dGhWZXJpZmllciB9ID0gdGhpcy5lbmNyeXB0VXNlckdyb3VwS2V5Rm9yVXNlcihcblx0XHRcdHBhc3NwaHJhc2VLZXksXG5cdFx0XHRuZXdVc2VyR3JvdXBLZXlzLFxuXHRcdFx0dXNlckdyb3VwLFxuXHRcdFx0Y3VycmVudFVzZXJHcm91cEtleSxcblx0XHQpXG5cblx0XHRjb25zdCBlbmNyeXB0ZWRVc2VyS2V5cyA9IGF3YWl0IHRoaXMuZW5jcnlwdEdyb3VwS2V5cyh1c2VyR3JvdXAsIGN1cnJlbnRVc2VyR3JvdXBLZXksIG5ld1VzZXJHcm91cEtleXMsIG5ld0FkbWluR3JvdXBLZXlzLnN5bUdyb3VwS2V5KVxuXHRcdGNvbnN0IHJlY292ZXJDb2RlRGF0YSA9IGF3YWl0IHRoaXMucmVlbmNyeXB0UmVjb3ZlckNvZGVJZkV4aXN0cyh1c2VyLCBwYXNzcGhyYXNlS2V5LCBuZXdVc2VyR3JvdXBLZXlzKVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdG5ld1VzZXJHcm91cEtleUVuY0N1cnJlbnRHcm91cEtleTogZW5jcnlwdGVkVXNlcktleXMubmV3R3JvdXBLZXlFbmNDdXJyZW50R3JvdXBLZXksXG5cdFx0XHRuZXdBZG1pbkdyb3VwS2V5RW5jTmV3VXNlckdyb3VwS2V5OiBhc3NlcnROb3ROdWxsKGVuY3J5cHRlZFVzZXJLZXlzLmFkbWluR3JvdXBLZXlFbmNOZXdHcm91cEtleSksXG5cdFx0XHRrZXlQYWlyOiBhc3NlcnROb3ROdWxsKG1ha2VLZXlQYWlyKGVuY3J5cHRlZFVzZXJLZXlzLmtleVBhaXIpKSxcblx0XHRcdHBhc3NwaHJhc2VLZXlFbmNOZXdVc2VyR3JvdXBLZXk6IG1lbWJlcnNoaXBTeW1FbmNOZXdHcm91cEtleSxcblx0XHRcdHJlY292ZXJDb2RlRGF0YSxcblx0XHRcdGRpc3RyaWJ1dGlvbktleUVuY05ld1VzZXJHcm91cEtleSxcblx0XHRcdGF1dGhWZXJpZmllcixcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIHJlZW5jcnlwdFJlY292ZXJDb2RlSWZFeGlzdHModXNlcjogVXNlciwgcGFzc3BocmFzZUtleTogQWVzS2V5LCBuZXdVc2VyR3JvdXBLZXlzOiBHZW5lcmF0ZWRHcm91cEtleXMpOiBQcm9taXNlPFJlY292ZXJDb2RlRGF0YSB8IG51bGw+IHtcblx0XHRsZXQgcmVjb3ZlckNvZGVEYXRhOiBSZWNvdmVyQ29kZURhdGEgfCBudWxsID0gbnVsbFxuXHRcdGlmICh1c2VyLmF1dGg/LnJlY292ZXJDb2RlICE9IG51bGwpIHtcblx0XHRcdGNvbnN0IHJlY292ZXJDb2RlRmFjYWRlID0gYXdhaXQgdGhpcy5yZWNvdmVyQ29kZUZhY2FkZSgpXG5cdFx0XHRjb25zdCByZWNvdmVyQ29kZSA9IGF3YWl0IHJlY292ZXJDb2RlRmFjYWRlLmdldFJhd1JlY292ZXJDb2RlKHBhc3NwaHJhc2VLZXkpXG5cdFx0XHRjb25zdCByZWNvdmVyRGF0YSA9IHJlY292ZXJDb2RlRmFjYWRlLmVuY3J5cHRSZWNvdmVyeUNvZGUocmVjb3ZlckNvZGUsIG5ld1VzZXJHcm91cEtleXMuc3ltR3JvdXBLZXkpXG5cdFx0XHRyZWNvdmVyQ29kZURhdGEgPSBjcmVhdGVSZWNvdmVyQ29kZURhdGEoe1xuXHRcdFx0XHRyZWNvdmVyeUNvZGVWZXJpZmllcjogcmVjb3ZlckRhdGEucmVjb3ZlcnlDb2RlVmVyaWZpZXIsXG5cdFx0XHRcdHVzZXJFbmNSZWNvdmVyeUNvZGU6IHJlY292ZXJEYXRhLnVzZXJFbmNSZWNvdmVyQ29kZSxcblx0XHRcdFx0dXNlcktleVZlcnNpb246IFN0cmluZyhyZWNvdmVyRGF0YS51c2VyS2V5VmVyc2lvbiksXG5cdFx0XHRcdHJlY292ZXJ5Q29kZUVuY1VzZXJHcm91cEtleTogcmVjb3ZlckRhdGEucmVjb3ZlckNvZGVFbmNVc2VyR3JvdXBLZXksXG5cdFx0XHR9KVxuXHRcdH1cblx0XHRyZXR1cm4gcmVjb3ZlckNvZGVEYXRhXG5cdH1cblxuXHRwcml2YXRlIGVuY3J5cHRVc2VyR3JvdXBLZXlGb3JVc2VyKHBhc3NwaHJhc2VLZXk6IEFlc0tleSwgbmV3VXNlckdyb3VwS2V5czogR2VuZXJhdGVkR3JvdXBLZXlzLCB1c2VyR3JvdXA6IEdyb3VwLCBjdXJyZW50R3JvdXBLZXk6IFZlcnNpb25lZEtleSkge1xuXHRcdGNvbnN0IHZlcnNpb25lZFBhc3NwaHJhc2VLZXk6IFZlcnNpb25lZEtleSA9IHtcblx0XHRcdG9iamVjdDogcGFzc3BocmFzZUtleSxcblx0XHRcdHZlcnNpb246IDAsIC8vIGR1bW15XG5cdFx0fVxuXHRcdGNvbnN0IG1lbWJlcnNoaXBTeW1FbmNOZXdHcm91cEtleSA9IHRoaXMuY3J5cHRvV3JhcHBlci5lbmNyeXB0S2V5V2l0aFZlcnNpb25lZEtleSh2ZXJzaW9uZWRQYXNzcGhyYXNlS2V5LCBuZXdVc2VyR3JvdXBLZXlzLnN5bUdyb3VwS2V5Lm9iamVjdClcblx0XHRjb25zdCBsZWdhY3lVc2VyRGlzdEtleSA9IHRoaXMudXNlckZhY2FkZS5kZXJpdmVMZWdhY3lVc2VyRGlzdEtleSh1c2VyR3JvdXAuX2lkLCBwYXNzcGhyYXNlS2V5KVxuXHRcdGNvbnN0IGRpc3RyaWJ1dGlvbktleUVuY05ld1VzZXJHcm91cEtleSA9IHRoaXMuY3J5cHRvV3JhcHBlci5lbmNyeXB0S2V5KGxlZ2FjeVVzZXJEaXN0S2V5LCBuZXdVc2VyR3JvdXBLZXlzLnN5bUdyb3VwS2V5Lm9iamVjdClcblx0XHRjb25zdCBhdXRoVmVyaWZpZXIgPSBjcmVhdGVBdXRoVmVyaWZpZXIocGFzc3BocmFzZUtleSlcblx0XHRjb25zdCBuZXdHcm91cEtleUVuY0N1cnJlbnRHcm91cEtleSA9IHRoaXMuY3J5cHRvV3JhcHBlci5lbmNyeXB0S2V5V2l0aFZlcnNpb25lZEtleShuZXdVc2VyR3JvdXBLZXlzLnN5bUdyb3VwS2V5LCBjdXJyZW50R3JvdXBLZXkub2JqZWN0KVxuXHRcdHJldHVybiB7IG1lbWJlcnNoaXBTeW1FbmNOZXdHcm91cEtleSwgZGlzdHJpYnV0aW9uS2V5RW5jTmV3VXNlckdyb3VwS2V5LCBhdXRoVmVyaWZpZXIsIG5ld0dyb3VwS2V5RW5jQ3VycmVudEdyb3VwS2V5IH1cblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgaGFuZGxlUGVuZGluZ0ludml0YXRpb25zKHRhcmdldEdyb3VwOiBHcm91cCwgbmV3VGFyZ2V0R3JvdXBLZXk6IFZlcnNpb25lZEtleSkge1xuXHRcdGNvbnN0IHByZXBhcmVkUmVJbnZpdGF0aW9uczogQXJyYXk8R3JvdXBJbnZpdGF0aW9uUG9zdERhdGE+ID0gW11cblx0XHRjb25zdCB0YXJnZXRHcm91cEluZm8gPSBhd2FpdCB0aGlzLmVudGl0eUNsaWVudC5sb2FkKEdyb3VwSW5mb1R5cGVSZWYsIHRhcmdldEdyb3VwLmdyb3VwSW5mbylcblx0XHRjb25zdCBwZW5kaW5nSW52aXRhdGlvbnMgPSBhd2FpdCB0aGlzLmVudGl0eUNsaWVudC5sb2FkQWxsKFNlbnRHcm91cEludml0YXRpb25UeXBlUmVmLCB0YXJnZXRHcm91cC5pbnZpdGF0aW9ucylcblx0XHRjb25zdCBzZW50SW52aXRhdGlvbnNCeUNhcGFiaWxpdHkgPSBncm91cEJ5KHBlbmRpbmdJbnZpdGF0aW9ucywgKGludml0YXRpb24pID0+IGludml0YXRpb24uY2FwYWJpbGl0eSlcblx0XHRjb25zdCBzaGFyZUZhY2FkZSA9IGF3YWl0IHRoaXMuc2hhcmVGYWNhZGUoKVxuXHRcdGZvciAoY29uc3QgW2NhcGFiaWxpdHksIHNlbnRJbnZpdGF0aW9uc10gb2Ygc2VudEludml0YXRpb25zQnlDYXBhYmlsaXR5KSB7XG5cdFx0XHRjb25zdCBpbnZpdGVlTWFpbEFkZHJlc3NlcyA9IHNlbnRJbnZpdGF0aW9ucy5tYXAoKGludml0ZSkgPT4gaW52aXRlLmludml0ZWVNYWlsQWRkcmVzcylcblx0XHRcdGNvbnN0IHByZXBhcmVHcm91cFJlSW52aXRlcyA9IGFzeW5jIChtYWlsQWRkcmVzc2VzOiBzdHJpbmdbXSkgPT4ge1xuXHRcdFx0XHRjb25zdCBwcmVwYXJlZEludml0YXRpb24gPSBhd2FpdCBzaGFyZUZhY2FkZS5wcmVwYXJlR3JvdXBJbnZpdGF0aW9uKG5ld1RhcmdldEdyb3VwS2V5LCB0YXJnZXRHcm91cEluZm8sIG1haWxBZGRyZXNzZXMsIGRvd25jYXN0KGNhcGFiaWxpdHkpKVxuXHRcdFx0XHRwcmVwYXJlZFJlSW52aXRhdGlvbnMucHVzaChwcmVwYXJlZEludml0YXRpb24pXG5cdFx0XHR9XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRhd2FpdCBwcmVwYXJlR3JvdXBSZUludml0ZXMoaW52aXRlZU1haWxBZGRyZXNzZXMpXG5cdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdC8vIHdlIGFjY2VwdCByZW1vdmluZyBwZW5kaW5nIGludml0YXRpb25zIHRoYXQgd2UgY2Fubm90IHNlbmQgYWdhaW4gKGUuZy4gYmVjYXVzZSB0aGUgdXNlciB3YXMgZGVhY3RpdmF0ZWQpXG5cdFx0XHRcdGlmIChlIGluc3RhbmNlb2YgUmVjaXBpZW50c05vdEZvdW5kRXJyb3IpIHtcblx0XHRcdFx0XHRjb25zdCBub3RGb3VuZFJlY2lwaWVudHMgPSBlLm1lc3NhZ2Uuc3BsaXQoXCJcXG5cIilcblx0XHRcdFx0XHRjb25zdCByZWR1Y2VkSW52aXRlZUFkZHJlc3NlcyA9IGludml0ZWVNYWlsQWRkcmVzc2VzLmZpbHRlcigoYWRkcmVzcykgPT4gIW5vdEZvdW5kUmVjaXBpZW50cy5pbmNsdWRlcyhhZGRyZXNzKSlcblx0XHRcdFx0XHRpZiAocmVkdWNlZEludml0ZWVBZGRyZXNzZXMubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHRhd2FpdCBwcmVwYXJlR3JvdXBSZUludml0ZXMocmVkdWNlZEludml0ZWVBZGRyZXNzZXMpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRocm93IGVcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gcHJlcGFyZWRSZUludml0YXRpb25zXG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIGNyZWF0ZUdyb3VwS2V5VXBkYXRlc0Zvck1lbWJlcnMoZ3JvdXA6IEdyb3VwLCBuZXdHcm91cEtleTogVmVyc2lvbmVkS2V5KTogUHJvbWlzZTxBcnJheTxHcm91cEtleVVwZGF0ZURhdGE+PiB7XG5cdFx0Y29uc3QgbWVtYmVycyA9IGF3YWl0IHRoaXMuZW50aXR5Q2xpZW50LmxvYWRBbGwoR3JvdXBNZW1iZXJUeXBlUmVmLCBncm91cC5tZW1iZXJzKVxuXHRcdGNvbnN0IG90aGVyTWVtYmVycyA9IG1lbWJlcnMuZmlsdGVyKChtZW1iZXIpID0+IG1lbWJlci51c2VyICE9IHRoaXMudXNlckZhY2FkZS5nZXRVc2VyKCk/Ll9pZClcblx0XHRyZXR1cm4gYXdhaXQgdGhpcy50cnlDcmVhdGluZ0dyb3VwS2V5VXBkYXRlc0Zvck1lbWJlcnMoZ3JvdXAuX2lkLCBvdGhlck1lbWJlcnMsIG5ld0dyb3VwS2V5KVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyB0cnlDcmVhdGluZ0dyb3VwS2V5VXBkYXRlc0Zvck1lbWJlcnMoZ3JvdXBJZDogSWQsIG90aGVyTWVtYmVyczogR3JvdXBNZW1iZXJbXSwgbmV3R3JvdXBLZXk6IFZlcnNpb25lZEtleSk6IFByb21pc2U8R3JvdXBLZXlVcGRhdGVEYXRhW10+IHtcblx0XHRjb25zdCBncm91cEtleVVwZGF0ZXMgPSBuZXcgQXJyYXk8R3JvdXBLZXlVcGRhdGVEYXRhPigpXG5cdFx0Ly8gdHJ5IHRvIHJlZHVjZSB0aGUgYW1vdW50IG9mIHJlcXVlc3RzXG5cdFx0Y29uc3QgZ3JvdXBlZE1lbWJlcnMgPSBncm91cEJ5KG90aGVyTWVtYmVycywgKG1lbWJlcikgPT4gbGlzdElkUGFydChtZW1iZXIudXNlckdyb3VwSW5mbykpXG5cdFx0Y29uc3QgbWVtYmVyc1RvUmVtb3ZlID0gbmV3IEFycmF5PEdyb3VwTWVtYmVyPigpXG5cdFx0Zm9yIChjb25zdCBbbGlzdElkLCBtZW1iZXJzXSBvZiBncm91cGVkTWVtYmVycykge1xuXHRcdFx0Y29uc3QgdXNlckdyb3VwSW5mb3MgPSBhd2FpdCB0aGlzLmVudGl0eUNsaWVudC5sb2FkTXVsdGlwbGUoXG5cdFx0XHRcdEdyb3VwSW5mb1R5cGVSZWYsXG5cdFx0XHRcdGxpc3RJZCxcblx0XHRcdFx0bWVtYmVycy5tYXAoKG1lbWJlcikgPT4gZWxlbWVudElkUGFydChtZW1iZXIudXNlckdyb3VwSW5mbykpLFxuXHRcdFx0KVxuXHRcdFx0Zm9yIChjb25zdCBtZW1iZXIgb2YgbWVtYmVycykge1xuXHRcdFx0XHRjb25zdCB1c2VyR3JvdXBJbmZvRm9yTWVtYmVyID0gdXNlckdyb3VwSW5mb3MuZmluZCgodWdpKSA9PiBpc1NhbWVJZCh1Z2kuX2lkLCBtZW1iZXIudXNlckdyb3VwSW5mbykpXG5cdFx0XHRcdGNvbnN0IG1lbWJlck1haWxBZGRyZXNzID0gYXNzZXJ0Tm90TnVsbCh1c2VyR3JvdXBJbmZvRm9yTWVtYmVyPy5tYWlsQWRkcmVzcykgLy8gdXNlciBncm91cCBpbmZvIG11c3QgYWx3YXlzIGhhdmUgYSBtYWlsIGFkZHJlc3Ncblx0XHRcdFx0Y29uc3QgYnVja2V0S2V5ID0gdGhpcy5jcnlwdG9XcmFwcGVyLmFlczI1NlJhbmRvbUtleSgpXG5cdFx0XHRcdGNvbnN0IHNlc3Npb25LZXkgPSB0aGlzLmNyeXB0b1dyYXBwZXIuYWVzMjU2UmFuZG9tS2V5KClcblx0XHRcdFx0Ly8gYWx3YXlzIHBhc3MgYW4gZW1wdHkgbGlzdCBiZWNhdXNlIHdlIGRvbid0IHdhbnQgdGhlIGVuY3J5cHRpb24gdG8gYmUgc2tpcHBlZCBpbiBjYXNlIG90aGVyIHJlY2lwaWVudHMgd2VyZW4ndCBmb3VuZFxuXHRcdFx0XHQvLyByZWNpcGllbnRzIHRoYXQgYXJlIG5vdCBmb3VuZCB3aWxsIGJlIG51bGwgYW55d2F5LCBhbmQgYWRkZWQgdG8gbWVtYmVyc1RvUmVtb3ZlXG5cdFx0XHRcdGNvbnN0IG5vdEZvdW5kUmVjaXBpZW50czogQXJyYXk8c3RyaW5nPiA9IFtdXG5cdFx0XHRcdGNvbnN0IHNlbmRlckdyb3VwSWQgPSB0aGlzLnVzZXJGYWNhZGUuZ2V0VXNlckdyb3VwSWQoKVxuXHRcdFx0XHRjb25zdCByZWNpcGllbnRLZXlEYXRhID0gYXdhaXQgdGhpcy5jcnlwdG9GYWNhZGUuZW5jcnlwdEJ1Y2tldEtleUZvckludGVybmFsUmVjaXBpZW50KFxuXHRcdFx0XHRcdHNlbmRlckdyb3VwSWQsXG5cdFx0XHRcdFx0YnVja2V0S2V5LFxuXHRcdFx0XHRcdG1lbWJlck1haWxBZGRyZXNzLFxuXHRcdFx0XHRcdG5vdEZvdW5kUmVjaXBpZW50cyxcblx0XHRcdFx0KVxuXHRcdFx0XHRpZiAocmVjaXBpZW50S2V5RGF0YSAhPSBudWxsICYmIGlzU2FtZVR5cGVSZWYocmVjaXBpZW50S2V5RGF0YS5fdHlwZSwgSW50ZXJuYWxSZWNpcGllbnRLZXlEYXRhVHlwZVJlZikpIHtcblx0XHRcdFx0XHRjb25zdCBrZXlEYXRhID0gcmVjaXBpZW50S2V5RGF0YSBhcyBJbnRlcm5hbFJlY2lwaWVudEtleURhdGFcblx0XHRcdFx0XHRjb25zdCBwdWJFbmNLZXlEYXRhID0gY3JlYXRlUHViRW5jS2V5RGF0YSh7XG5cdFx0XHRcdFx0XHRyZWNpcGllbnRJZGVudGlmaWVyOiBrZXlEYXRhLm1haWxBZGRyZXNzLFxuXHRcdFx0XHRcdFx0cmVjaXBpZW50SWRlbnRpZmllclR5cGU6IFB1YmxpY0tleUlkZW50aWZpZXJUeXBlLk1BSUxfQUREUkVTUyxcblx0XHRcdFx0XHRcdHB1YkVuY1N5bUtleToga2V5RGF0YS5wdWJFbmNCdWNrZXRLZXksXG5cdFx0XHRcdFx0XHRyZWNpcGllbnRLZXlWZXJzaW9uOiBrZXlEYXRhLnJlY2lwaWVudEtleVZlcnNpb24sXG5cdFx0XHRcdFx0XHRzZW5kZXJLZXlWZXJzaW9uOiBrZXlEYXRhLnNlbmRlcktleVZlcnNpb24sXG5cdFx0XHRcdFx0XHRwcm90b2NvbFZlcnNpb246IGtleURhdGEucHJvdG9jb2xWZXJzaW9uLFxuXHRcdFx0XHRcdFx0c2VuZGVySWRlbnRpZmllcjogc2VuZGVyR3JvdXBJZCxcblx0XHRcdFx0XHRcdHNlbmRlcklkZW50aWZpZXJUeXBlOiBQdWJsaWNLZXlJZGVudGlmaWVyVHlwZS5HUk9VUF9JRCxcblx0XHRcdFx0XHRcdHN5bUtleU1hYzogbnVsbCxcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdGNvbnN0IGdyb3VwS2V5VXBkYXRlRGF0YSA9IGNyZWF0ZUdyb3VwS2V5VXBkYXRlRGF0YSh7XG5cdFx0XHRcdFx0XHRzZXNzaW9uS2V5RW5jR3JvdXBLZXk6IHRoaXMuY3J5cHRvV3JhcHBlci5lbmNyeXB0Qnl0ZXMoc2Vzc2lvbktleSwgYml0QXJyYXlUb1VpbnQ4QXJyYXkobmV3R3JvdXBLZXkub2JqZWN0KSksXG5cdFx0XHRcdFx0XHRzZXNzaW9uS2V5RW5jR3JvdXBLZXlWZXJzaW9uOiBTdHJpbmcobmV3R3JvdXBLZXkudmVyc2lvbiksXG5cdFx0XHRcdFx0XHRidWNrZXRLZXlFbmNTZXNzaW9uS2V5OiB0aGlzLmNyeXB0b1dyYXBwZXIuZW5jcnlwdEtleShidWNrZXRLZXksIHNlc3Npb25LZXkpLFxuXHRcdFx0XHRcdFx0cHViRW5jQnVja2V0S2V5RGF0YTogcHViRW5jS2V5RGF0YSxcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdGdyb3VwS2V5VXBkYXRlcy5wdXNoKGdyb3VwS2V5VXBkYXRlRGF0YSlcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRtZW1iZXJzVG9SZW1vdmUucHVzaChtZW1iZXIpXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0Y29uc3QgZ3JvdXBNYW5hZ2VtZW50RmFjYWRlID0gYXdhaXQgdGhpcy5ncm91cE1hbmFnZW1lbnRGYWNhZGUoKVxuXHRcdGlmIChtZW1iZXJzVG9SZW1vdmUubGVuZ3RoICE9PSAwKSB7XG5cdFx0XHRmb3IgKGNvbnN0IG1lbWJlciBvZiBtZW1iZXJzVG9SZW1vdmUpIHtcblx0XHRcdFx0YXdhaXQgZ3JvdXBNYW5hZ2VtZW50RmFjYWRlLnJlbW92ZVVzZXJGcm9tR3JvdXAobWVtYmVyLnVzZXIsIGdyb3VwSWQpXG5cdFx0XHR9XG5cdFx0XHRjb25zdCByZWR1Y2VkTWVtYmVycyA9IG90aGVyTWVtYmVycy5maWx0ZXIoKG1lbWJlcikgPT4gIW1lbWJlcnNUb1JlbW92ZS5pbmNsdWRlcyhtZW1iZXIpKVxuXHRcdFx0Ly8gcmV0cnkgd2l0aG91dCB0aGUgcmVtb3ZlZCBtZW1iZXJzXG5cdFx0XHRyZXR1cm4gdGhpcy50cnlDcmVhdGluZ0dyb3VwS2V5VXBkYXRlc0Zvck1lbWJlcnMoZ3JvdXBJZCwgcmVkdWNlZE1lbWJlcnMsIG5ld0dyb3VwS2V5KVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gZ3JvdXBLZXlVcGRhdGVzXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEdldCB0aGUgSUQgb2YgdGhlIGdyb3VwIHdlIHdhbnQgdG8gcm90YXRlIHRoZSBrZXlzIGZvci5cblx0ICovXG5cdHByaXZhdGUgZ2V0VGFyZ2V0R3JvdXBJZChrZXlSb3RhdGlvbjogS2V5Um90YXRpb24pIHtcblx0XHQvLyBUaGUgS2V5Um90YXRpb24gaXMgYSBsaXN0IGVsZW1lbnQgdHlwZSB3aG9zZSBsaXN0IGVsZW1lbnQgSUQgcGFydCBpcyB0aGUgdGFyZ2V0IGdyb3VwIElELFxuXHRcdC8vIGkuZS4sIGFuIGluZGlyZWN0IHJlZmVyZW5jZSB0byBHcm91cC5cblx0XHRyZXR1cm4gZWxlbWVudElkUGFydChrZXlSb3RhdGlvbi5faWQpXG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIGVuY3J5cHRHcm91cEtleXMoXG5cdFx0Z3JvdXA6IEdyb3VwLFxuXHRcdGN1cnJlbnRHcm91cEtleTogVmVyc2lvbmVkS2V5LFxuXHRcdG5ld0tleXM6IEdlbmVyYXRlZEdyb3VwS2V5cyxcblx0XHRhZG1pbkdyb3VwS2V5czogVmVyc2lvbmVkS2V5LFxuXHQpOiBQcm9taXNlPEVuY3J5cHRlZEdyb3VwS2V5cz4ge1xuXHRcdGNvbnN0IG5ld0dyb3VwS2V5RW5jQ3VycmVudEdyb3VwS2V5ID0gdGhpcy5jcnlwdG9XcmFwcGVyLmVuY3J5cHRLZXlXaXRoVmVyc2lvbmVkS2V5KG5ld0tleXMuc3ltR3JvdXBLZXksIGN1cnJlbnRHcm91cEtleS5vYmplY3QpXG5cdFx0Y29uc3QgYWRtaW5Hcm91cEtleUVuY05ld0dyb3VwS2V5ID0gKGF3YWl0IHRoaXMuZ3JvdXBNYW5hZ2VtZW50RmFjYWRlKCkpLmhhc0FkbWluRW5jR0tleShncm91cClcblx0XHRcdD8gdGhpcy5jcnlwdG9XcmFwcGVyLmVuY3J5cHRLZXlXaXRoVmVyc2lvbmVkS2V5KGFkbWluR3JvdXBLZXlzLCBuZXdLZXlzLnN5bUdyb3VwS2V5Lm9iamVjdClcblx0XHRcdDogbnVsbFxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdG5ld0dyb3VwS2V5RW5jQ3VycmVudEdyb3VwS2V5OiBuZXdHcm91cEtleUVuY0N1cnJlbnRHcm91cEtleSxcblx0XHRcdGtleVBhaXI6IG5ld0tleXMuZW5jcnlwdGVkS2V5UGFpcixcblx0XHRcdGFkbWluR3JvdXBLZXlFbmNOZXdHcm91cEtleTogYWRtaW5Hcm91cEtleUVuY05ld0dyb3VwS2V5LFxuXHRcdH1cblx0fVxuXG5cdC8qXG5cdEdldHMgdGhlIHVzZXJHcm91cEtleSBmb3IgdGhlIGdpdmVuIHVzZXJJZCB2aWEgdGhlIGFkbWluRW5jR0tleSBhbmQgc3ltbWV0cmljYWxseSBlbmNyeXB0cyB0aGUgZ2l2ZW4gbmV3R3JvdXBLZXkgd2l0aCBpdC4gTm90ZSB0aGF0IHRoZSBsb2dnZWQtaW4gdXNlciBuZWVkc1xuXHQgdG8gYmUgdGhlIGFkbWluIG9mIHRoZSBzYW1lIGN1c3RvbWVyIHRoYXQgdGhlIHVlciB3aXRoIHVzZXJJZCBiZWxvbmdzIHRvLlxuXHQgKi9cblx0cHJpdmF0ZSBhc3luYyBlbmNyeXB0R3JvdXBLZXlGb3JPdGhlclVzZXJzKHVzZXJJZDogSWQsIG5ld0dyb3VwS2V5OiBWZXJzaW9uZWRLZXkpOiBQcm9taXNlPFZlcnNpb25lZEVuY3J5cHRlZEtleT4ge1xuXHRcdGNvbnN0IGdyb3VwTWFuYWdlbWVudEZhY2FkZSA9IGF3YWl0IHRoaXMuZ3JvdXBNYW5hZ2VtZW50RmFjYWRlKClcblx0XHRjb25zdCB1c2VyID0gYXdhaXQgdGhpcy5lbnRpdHlDbGllbnQubG9hZChVc2VyVHlwZVJlZiwgdXNlcklkKVxuXHRcdGNvbnN0IHVzZXJHcm91cEtleSA9IGF3YWl0IGdyb3VwTWFuYWdlbWVudEZhY2FkZS5nZXRHcm91cEtleVZpYUFkbWluRW5jR0tleSh1c2VyLnVzZXJHcm91cC5ncm91cCwgcGFyc2VLZXlWZXJzaW9uKHVzZXIudXNlckdyb3VwLmdyb3VwS2V5VmVyc2lvbikpXG5cdFx0Y29uc3QgZW5jcnlwdGVOZXdHcm91cEtleSA9IHRoaXMuY3J5cHRvV3JhcHBlci5lbmNyeXB0S2V5KHVzZXJHcm91cEtleSwgbmV3R3JvdXBLZXkub2JqZWN0KVxuXHRcdHJldHVybiB7IGtleTogZW5jcnlwdGVOZXdHcm91cEtleSwgZW5jcnlwdGluZ0tleVZlcnNpb246IHBhcnNlS2V5VmVyc2lvbih1c2VyLnVzZXJHcm91cC5ncm91cEtleVZlcnNpb24pIH1cblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgZ2VuZXJhdGVHcm91cEtleXMoZ3JvdXA6IEdyb3VwKTogUHJvbWlzZTxHZW5lcmF0ZWRHcm91cEtleXM+IHtcblx0XHRjb25zdCBzeW1Hcm91cEtleUJ5dGVzID0gdGhpcy5jcnlwdG9XcmFwcGVyLmFlczI1NlJhbmRvbUtleSgpXG5cdFx0Y29uc3Qga2V5UGFpciA9IGF3YWl0IHRoaXMuY3JlYXRlTmV3S2V5UGFpclZhbHVlKGdyb3VwLCBzeW1Hcm91cEtleUJ5dGVzKVxuXHRcdHJldHVybiB7XG5cdFx0XHRzeW1Hcm91cEtleToge1xuXHRcdFx0XHRvYmplY3Q6IHN5bUdyb3VwS2V5Qnl0ZXMsXG5cdFx0XHRcdHZlcnNpb246IGNoZWNrS2V5VmVyc2lvbkNvbnN0cmFpbnRzKHBhcnNlS2V5VmVyc2lvbihncm91cC5ncm91cEtleVZlcnNpb24pICsgMSksXG5cdFx0XHR9LFxuXHRcdFx0ZW5jcnlwdGVkS2V5UGFpcjoga2V5UGFpcixcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogTm90IGFsbCBncm91cHMgaGF2ZSBrZXkgcGFpcnMsIGJ1dCBpZiB0aGV5IGRvIHdlIG5lZWQgdG8gcm90YXRlIHRoZW0gYXMgd2VsbC5cblx0ICovXG5cdHByaXZhdGUgYXN5bmMgY3JlYXRlTmV3S2V5UGFpclZhbHVlKGdyb3VwVG9Sb3RhdGU6IEdyb3VwLCBuZXdTeW1tZXRyaWNHcm91cEtleTogQWVzMjU2S2V5KTogUHJvbWlzZTxFbmNyeXB0ZWRQcUtleVBhaXJzIHwgbnVsbD4ge1xuXHRcdGlmIChncm91cFRvUm90YXRlLmN1cnJlbnRLZXlzKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZW5lcmF0ZUFuZEVuY3J5cHRQcUtleVBhaXJzKG5ld1N5bW1ldHJpY0dyb3VwS2V5KVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgZ2VuZXJhdGVBbmRFbmNyeXB0UHFLZXlQYWlycyhzeW1tbWV0cmljRW5jcnlwdGlvbktleTogQWVzMjU2S2V5KTogUHJvbWlzZTxFbmNyeXB0ZWRQcUtleVBhaXJzPiB7XG5cdFx0Y29uc3QgbmV3UHFQYWlycyA9IGF3YWl0IHRoaXMucHFGYWNhZGUuZ2VuZXJhdGVLZXlQYWlycygpXG5cdFx0cmV0dXJuIHtcblx0XHRcdHB1YlJzYUtleTogbnVsbCxcblx0XHRcdHN5bUVuY1ByaXZSc2FLZXk6IG51bGwsXG5cdFx0XHRwdWJFY2NLZXk6IG5ld1BxUGFpcnMuZWNjS2V5UGFpci5wdWJsaWNLZXksXG5cdFx0XHRzeW1FbmNQcml2RWNjS2V5OiB0aGlzLmNyeXB0b1dyYXBwZXIuZW5jcnlwdEVjY0tleShzeW1tbWV0cmljRW5jcnlwdGlvbktleSwgbmV3UHFQYWlycy5lY2NLZXlQYWlyLnByaXZhdGVLZXkpLFxuXHRcdFx0cHViS3liZXJLZXk6IHRoaXMuY3J5cHRvV3JhcHBlci5reWJlclB1YmxpY0tleVRvQnl0ZXMobmV3UHFQYWlycy5reWJlcktleVBhaXIucHVibGljS2V5KSxcblx0XHRcdHN5bUVuY1ByaXZLeWJlcktleTogdGhpcy5jcnlwdG9XcmFwcGVyLmVuY3J5cHRLeWJlcktleShzeW1tbWV0cmljRW5jcnlwdGlvbktleSwgbmV3UHFQYWlycy5reWJlcktleVBhaXIucHJpdmF0ZUtleSksXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEBWaXNpYmxlRm9yVGVzdGluZ1xuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0c2V0UGVuZGluZ0tleVJvdGF0aW9ucyhwZW5kaW5nS2V5Um90YXRpb25zOiBQZW5kaW5nS2V5Um90YXRpb24pIHtcblx0XHR0aGlzLnBlbmRpbmdLZXlSb3RhdGlvbnMgPSBwZW5kaW5nS2V5Um90YXRpb25zXG5cdFx0dGhpcy5mYWNhZGVJbml0aWFsaXplZERlZmVycmVkT2JqZWN0LnJlc29sdmUoKVxuXHR9XG5cblx0YXN5bmMgcmVzZXQoKSB7XG5cdFx0YXdhaXQgdGhpcy5mYWNhZGVJbml0aWFsaXplZERlZmVycmVkT2JqZWN0LnByb21pc2Vcblx0XHR0aGlzLnBlbmRpbmdLZXlSb3RhdGlvbnMgPSB7XG5cdFx0XHRwd0tleTogbnVsbCxcblx0XHRcdGFkbWluT3JVc2VyR3JvdXBLZXlSb3RhdGlvbjogbnVsbCxcblx0XHRcdHRlYW1PckN1c3RvbWVyR3JvdXBLZXlSb3RhdGlvbnM6IFtdLFxuXHRcdFx0dXNlckFyZWFHcm91cHNLZXlSb3RhdGlvbnM6IFtdLFxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gZ3JvdXBLZXlVcGRhdGVJZHMgTVVTVCBiZSBpbiB0aGUgc2FtZSBsaXN0XG5cdCAqL1xuXHRhc3luYyB1cGRhdGVHcm91cE1lbWJlcnNoaXBzKGdyb3VwS2V5VXBkYXRlSWRzOiBJZFR1cGxlW10pOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRpZiAoZ3JvdXBLZXlVcGRhdGVJZHMubGVuZ3RoIDwgMSkgcmV0dXJuXG5cdFx0Y29uc29sZS5sb2coXCJoYW5kbGluZyBncm91cCBrZXkgdXBkYXRlIGZvciBncm91cHM6IFwiLCBncm91cEtleVVwZGF0ZUlkcylcblx0XHRjb25zdCBncm91cEtleVVwZGF0ZUluc3RhbmNlcyA9IGF3YWl0IHRoaXMuZW50aXR5Q2xpZW50LmxvYWRNdWx0aXBsZShcblx0XHRcdEdyb3VwS2V5VXBkYXRlVHlwZVJlZixcblx0XHRcdGxpc3RJZFBhcnQoZ3JvdXBLZXlVcGRhdGVJZHNbMF0pLFxuXHRcdFx0Z3JvdXBLZXlVcGRhdGVJZHMubWFwKChpZCkgPT4gZWxlbWVudElkUGFydChpZCkpLFxuXHRcdClcblx0XHRjb25zdCBncm91cEtleVVwZGF0ZXMgPSBncm91cEtleVVwZGF0ZUluc3RhbmNlcy5tYXAoKHVwZGF0ZSkgPT4gdGhpcy5wcmVwYXJlR3JvdXBNZW1iZXJzaGlwVXBkYXRlKHVwZGF0ZSkpXG5cdFx0Y29uc3QgbWVtYmVyc2hpcFB1dEluID0gY3JlYXRlTWVtYmVyc2hpcFB1dEluKHtcblx0XHRcdGdyb3VwS2V5VXBkYXRlcyxcblx0XHR9KVxuXHRcdHJldHVybiB0aGlzLnNlcnZpY2VFeGVjdXRvci5wdXQoTWVtYmVyc2hpcFNlcnZpY2UsIG1lbWJlcnNoaXBQdXRJbilcblx0fVxuXG5cdHByaXZhdGUgcHJlcGFyZUdyb3VwTWVtYmVyc2hpcFVwZGF0ZShncm91cEtleVVwZGF0ZTogR3JvdXBLZXlVcGRhdGUpOiBHcm91cE1lbWJlcnNoaXBLZXlEYXRhIHtcblx0XHRjb25zdCB1c2VyR3JvdXBLZXkgPSB0aGlzLmtleUxvYWRlckZhY2FkZS5nZXRDdXJyZW50U3ltVXNlckdyb3VwS2V5KClcblx0XHRjb25zdCBzeW1FbmNHcm91cEtleSA9IHRoaXMuY3J5cHRvV3JhcHBlci5lbmNyeXB0S2V5V2l0aFZlcnNpb25lZEtleSh1c2VyR3JvdXBLZXksIHVpbnQ4QXJyYXlUb0tleShncm91cEtleVVwZGF0ZS5ncm91cEtleSkpXG5cdFx0cmV0dXJuIGNyZWF0ZUdyb3VwTWVtYmVyc2hpcEtleURhdGEoe1xuXHRcdFx0Z3JvdXA6IGVsZW1lbnRJZFBhcnQoZ3JvdXBLZXlVcGRhdGUuX2lkKSxcblx0XHRcdHN5bUVuY0dLZXk6IHN5bUVuY0dyb3VwS2V5LmtleSxcblx0XHRcdGdyb3VwS2V5VmVyc2lvbjogZ3JvdXBLZXlVcGRhdGUuZ3JvdXBLZXlWZXJzaW9uLFxuXHRcdFx0c3ltS2V5VmVyc2lvbjogU3RyaW5nKHVzZXJHcm91cEtleS52ZXJzaW9uKSxcblx0XHR9KVxuXHR9XG5cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaXMgcmVzcG9uc2libGUgZm9yIHVwZ3JhZGluZyB0aGUgZW5jcnlwdGlvbiBrZXlzIG9mIGFueSB1c2VyIGFjY29yZGluZyB0byBhIEdyb3VwS2V5Um90YXRpb24gb2JqZWN0XG5cdCAqIEJlZm9yZSByb3RhdGluZyB0aGUga2V5cyB0aGUgdXNlciB3aWxsIGNoZWNrIHRoYXQgdGhlIGFkbWluIGhhc2ggY3JlYXRlZCBieSB0aGUgYWRtaW4gYW5kIGVuY3J5cHRlZCB3aXRoIHRoaXMgdXNlclxuXHQgKiBncm91cCBrZXkgbWF0Y2hlcyB0aGUgaGFzaCBnZW5lcmF0ZWQgYnkgdGhlIHVzZXIgZm9yIHRoaXMgcm90YXRpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSB1c2VyXG5cdCAqIEBwYXJhbSBwd0tleVxuXHQgKiBAcGFyYW0gdXNlckdyb3VwS2V5Um90YXRpb25cblx0ICogQHByaXZhdGVcblx0ICovXG5cdHByaXZhdGUgYXN5bmMgcm90YXRlVXNlckdyb3VwS2V5KHVzZXI6IFVzZXIsIHB3S2V5OiBBZXNLZXksIHVzZXJHcm91cEtleVJvdGF0aW9uOiBLZXlSb3RhdGlvbikge1xuXHRcdGNvbnN0IHVzZXJHcm91cE1lbWJlcnNoaXAgPSB1c2VyLnVzZXJHcm91cFxuXHRcdGNvbnN0IHVzZXJHcm91cElkID0gdXNlckdyb3VwTWVtYmVyc2hpcC5ncm91cFxuXHRcdGNvbnN0IGN1cnJlbnRVc2VyR3JvdXBLZXkgPSB0aGlzLmtleUxvYWRlckZhY2FkZS5nZXRDdXJyZW50U3ltVXNlckdyb3VwS2V5KClcblx0XHRjb25zb2xlLmxvZyhgS2V5Um90YXRpb25GYWNhZGU6IHJvdGF0ZSBrZXkgZm9yIGdyb3VwOiAke3VzZXJHcm91cElkfSwgZ3JvdXBLZXlSb3RhdGlvblR5cGU6ICR7dXNlckdyb3VwS2V5Um90YXRpb24uZ3JvdXBLZXlSb3RhdGlvblR5cGV9YClcblxuXHRcdGNvbnN0IHVzZXJHcm91cDogR3JvdXAgPSBhd2FpdCB0aGlzLmVudGl0eUNsaWVudC5sb2FkKEdyb3VwVHlwZVJlZiwgdXNlckdyb3VwSWQpXG5cblx0XHRjb25zdCBhZG1pbkdyb3VwSWQgPSBhc3NlcnROb3ROdWxsKHVzZXJHcm91cC5hZG1pbilcblxuXHRcdGNvbnN0IG5ld1VzZXJHcm91cEtleXMgPSBhd2FpdCB0aGlzLmdlbmVyYXRlR3JvdXBLZXlzKHVzZXJHcm91cClcblxuXHRcdGNvbnN0IHsgbWVtYmVyc2hpcFN5bUVuY05ld0dyb3VwS2V5LCBkaXN0cmlidXRpb25LZXlFbmNOZXdVc2VyR3JvdXBLZXksIGF1dGhWZXJpZmllciwgbmV3R3JvdXBLZXlFbmNDdXJyZW50R3JvdXBLZXkgfSA9IHRoaXMuZW5jcnlwdFVzZXJHcm91cEtleUZvclVzZXIoXG5cdFx0XHRwd0tleSxcblx0XHRcdG5ld1VzZXJHcm91cEtleXMsXG5cdFx0XHR1c2VyR3JvdXAsXG5cdFx0XHRjdXJyZW50VXNlckdyb3VwS2V5LFxuXHRcdClcblx0XHRjb25zdCByZWNvdmVyQ29kZURhdGEgPSBhd2FpdCB0aGlzLnJlZW5jcnlwdFJlY292ZXJDb2RlSWZFeGlzdHModXNlciwgcHdLZXksIG5ld1VzZXJHcm91cEtleXMpXG5cblx0XHRsZXQgcHViQWRtaW5Hcm91cEVuY1VzZXJHcm91cEtleTogbnVsbCB8IFB1YkVuY0tleURhdGEgPSBudWxsXG5cdFx0bGV0IGFkbWluR3JvdXBFbmNVc2VyR3JvdXBLZXk6IG51bGwgfCBVaW50OEFycmF5ID0gbnVsbFxuXHRcdGxldCB1c2VyR3JvdXBFbmNBZG1pbkdyb3VwS2V5OiBudWxsIHwgVWludDhBcnJheSA9IG51bGxcblx0XHRsZXQgYWRtaW5Hcm91cEtleVZlcnNpb246IE51bWJlclN0cmluZ1xuXHRcdC8vb3B0aW9uYWxseSBkZWNyeXB0IG5ldyBhZG1pbiBncm91cCBrZXlcblx0XHRpZiAodXNlckdyb3VwS2V5Um90YXRpb24uZGlzdEVuY0FkbWluR3JvdXBTeW1LZXkgIT0gbnVsbCkge1xuXHRcdFx0Y29uc3QgZW5jcnlwdGVkS2V5c0ZvckFkbWluID0gYXdhaXQgdGhpcy5oYW5kbGVVc2VyR3JvdXBLZXlSb3RhdGlvbkFzQWRtaW4oXG5cdFx0XHRcdHVzZXJHcm91cEtleVJvdGF0aW9uLFxuXHRcdFx0XHRhZG1pbkdyb3VwSWQsXG5cdFx0XHRcdHB3S2V5LFxuXHRcdFx0XHR1c2VyR3JvdXBJZCxcblx0XHRcdFx0Y3VycmVudFVzZXJHcm91cEtleSxcblx0XHRcdFx0bmV3VXNlckdyb3VwS2V5cyxcblx0XHRcdClcblx0XHRcdGFkbWluR3JvdXBFbmNVc2VyR3JvdXBLZXkgPSBlbmNyeXB0ZWRLZXlzRm9yQWRtaW4uYWRtaW5Hcm91cEVuY1VzZXJHcm91cEtleVxuXHRcdFx0YWRtaW5Hcm91cEtleVZlcnNpb24gPSBlbmNyeXB0ZWRLZXlzRm9yQWRtaW4uYWRtaW5Hcm91cEtleVZlcnNpb25cblx0XHRcdHVzZXJHcm91cEVuY0FkbWluR3JvdXBLZXkgPSBlbmNyeXB0ZWRLZXlzRm9yQWRtaW4udXNlckdyb3VwRW5jQWRtaW5Hcm91cEtleVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBlbmNyeXB0ZWRLZXlzRm9yVXNlciA9IGF3YWl0IHRoaXMuaGFuZGxlVXNlckdyb3VwS2V5Um90YXRpb25Bc1VzZXIoXG5cdFx0XHRcdHVzZXJHcm91cEtleVJvdGF0aW9uLFxuXHRcdFx0XHRjdXJyZW50VXNlckdyb3VwS2V5LFxuXHRcdFx0XHR1c2VyR3JvdXBJZCxcblx0XHRcdFx0YWRtaW5Hcm91cElkLFxuXHRcdFx0XHRuZXdVc2VyR3JvdXBLZXlzLFxuXHRcdFx0KVxuXHRcdFx0cHViQWRtaW5Hcm91cEVuY1VzZXJHcm91cEtleSA9IGVuY3J5cHRlZEtleXNGb3JVc2VyLnB1YkFkbWluR3JvdXBFbmNVc2VyR3JvdXBLZXlcblx0XHRcdGFkbWluR3JvdXBLZXlWZXJzaW9uID0gU3RyaW5nKGVuY3J5cHRlZEtleXNGb3JVc2VyLmFkbWluR3JvdXBLZXlWZXJzaW9uKVxuXHRcdH1cblxuXHRcdGNvbnN0IHVzZXJHcm91cEtleURhdGEgPSBjcmVhdGVVc2VyR3JvdXBLZXlSb3RhdGlvbkRhdGEoe1xuXHRcdFx0dXNlckdyb3VwS2V5VmVyc2lvbjogU3RyaW5nKG5ld1VzZXJHcm91cEtleXMuc3ltR3JvdXBLZXkudmVyc2lvbiksXG5cdFx0XHR1c2VyR3JvdXBFbmNQcmV2aW91c0dyb3VwS2V5OiBuZXdHcm91cEtleUVuY0N1cnJlbnRHcm91cEtleS5rZXksXG5cdFx0XHRwYXNzcGhyYXNlRW5jVXNlckdyb3VwS2V5OiBtZW1iZXJzaGlwU3ltRW5jTmV3R3JvdXBLZXkua2V5LFxuXHRcdFx0Z3JvdXA6IHVzZXJHcm91cElkLFxuXHRcdFx0ZGlzdHJpYnV0aW9uS2V5RW5jVXNlckdyb3VwS2V5OiBkaXN0cmlidXRpb25LZXlFbmNOZXdVc2VyR3JvdXBLZXksXG5cdFx0XHRrZXlQYWlyOiBhc3NlcnROb3ROdWxsKG1ha2VLZXlQYWlyKG5ld1VzZXJHcm91cEtleXMuZW5jcnlwdGVkS2V5UGFpcikpLFxuXHRcdFx0YXV0aFZlcmlmaWVyLFxuXHRcdFx0YWRtaW5Hcm91cEtleVZlcnNpb24sXG5cdFx0XHRwdWJBZG1pbkdyb3VwRW5jVXNlckdyb3VwS2V5LFxuXHRcdFx0YWRtaW5Hcm91cEVuY1VzZXJHcm91cEtleSxcblx0XHRcdHJlY292ZXJDb2RlRGF0YSxcblx0XHRcdHVzZXJHcm91cEVuY0FkbWluR3JvdXBLZXksXG5cdFx0fSlcblxuXHRcdGF3YWl0IHRoaXMuc2VydmljZUV4ZWN1dG9yLnBvc3QoXG5cdFx0XHRVc2VyR3JvdXBLZXlSb3RhdGlvblNlcnZpY2UsXG5cdFx0XHRjcmVhdGVVc2VyR3JvdXBLZXlSb3RhdGlvblBvc3RJbih7XG5cdFx0XHRcdHVzZXJHcm91cEtleURhdGEsXG5cdFx0XHR9KSxcblx0XHQpXG5cdFx0dGhpcy5ncm91cElkc1RoYXRQZXJmb3JtZWRLZXlSb3RhdGlvbnMuYWRkKHVzZXJHcm91cElkKVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBoYW5kbGVVc2VyR3JvdXBLZXlSb3RhdGlvbkFzVXNlcihcblx0XHR1c2VyR3JvdXBLZXlSb3RhdGlvbjogS2V5Um90YXRpb24sXG5cdFx0Y3VycmVudFVzZXJHcm91cEtleTogVmVyc2lvbmVkS2V5LFxuXHRcdHVzZXJHcm91cElkOiBJZCxcblx0XHRhZG1pbkdyb3VwSWQ6IElkLFxuXHRcdG5ld1VzZXJHcm91cEtleXM6IEdlbmVyYXRlZEdyb3VwS2V5cyxcblx0KSB7XG5cdFx0aWYgKHVzZXJHcm91cEtleVJvdGF0aW9uLmFkbWluUHViS2V5TWFjID09IG51bGwpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIlRoZSBoYXNoIGVuY3J5cHRlZCBieSBhZG1pbiBpcyBub3QgcHJlc2VudCBpbiB0aGUgdXNlciBncm91cCBrZXkgcm90YXRpb24gIVwiKVxuXHRcdH1cblxuXHRcdGNvbnN0IHsgdGFnZ2VkS2V5VmVyc2lvbiwgdGFnLCB0YWdnaW5nS2V5VmVyc2lvbiB9ID0gYnJhbmRLZXlNYWModXNlckdyb3VwS2V5Um90YXRpb24uYWRtaW5QdWJLZXlNYWMpXG5cdFx0aWYgKHBhcnNlS2V5VmVyc2lvbih0YWdnaW5nS2V5VmVyc2lvbikgIT09IGN1cnJlbnRVc2VyR3JvdXBLZXkudmVyc2lvbikge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0XHRgdGhlIGVuY3J5cHRpbmcga2V5IHZlcnNpb24gaW4gdGhlIHVzZXJFbmNBZG1pblB1YktleUhhc2ggZG9lcyBub3QgbWF0Y2ggaGFzaDogJHt0YWdnaW5nS2V5VmVyc2lvbn0gY3VycmVudCB1c2VyIGdyb3VwIGtleToke2N1cnJlbnRVc2VyR3JvdXBLZXkudmVyc2lvbn1gLFxuXHRcdFx0KVxuXHRcdH1cblxuXHRcdC8vIGdldCBhZG1pbiBncm91cCBwdWJsaWMga2V5c1xuXHRcdGNvbnN0IGN1cnJlbnRBZG1pblB1YktleXMgPSBhd2FpdCB0aGlzLnB1YmxpY0tleVByb3ZpZGVyLmxvYWRDdXJyZW50UHViS2V5KHtcblx0XHRcdGlkZW50aWZpZXI6IGFkbWluR3JvdXBJZCxcblx0XHRcdGlkZW50aWZpZXJUeXBlOiBQdWJsaWNLZXlJZGVudGlmaWVyVHlwZS5HUk9VUF9JRCxcblx0XHR9KVxuXHRcdGNvbnN0IGFkbWluR3JvdXBLZXlWZXJzaW9uID0gcGFyc2VLZXlWZXJzaW9uKHRhZ2dlZEtleVZlcnNpb24pXG5cdFx0aWYgKGN1cnJlbnRBZG1pblB1YktleXMudmVyc2lvbiAhPT0gYWRtaW5Hcm91cEtleVZlcnNpb24pIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcInRoZSBwdWJsaWMga2V5IHNlcnZpY2UgZGlkIG5vdCByZXR1cm4gdGhlIHRhZ2dlZCBrZXkgdmVyc2lvbiB0byB2ZXJpZnkgdGhlIGFkbWluIHB1YmxpYyBrZXlcIilcblx0XHR9XG5cblx0XHR0aGlzLmtleUF1dGhlbnRpY2F0aW9uRmFjYWRlLnZlcmlmeVRhZyhcblx0XHRcdHtcblx0XHRcdFx0dGFnVHlwZTogXCJORVdfQURNSU5fUFVCX0tFWV9UQUdcIixcblx0XHRcdFx0c291cmNlT2ZUcnVzdDogeyByZWNlaXZpbmdVc2VyR3JvdXBLZXk6IGN1cnJlbnRVc2VyR3JvdXBLZXkub2JqZWN0IH0sXG5cdFx0XHRcdHVudHJ1c3RlZEtleTogeyBuZXdBZG1pblB1YktleTogYXNQUVB1YmxpY0tleXMoY3VycmVudEFkbWluUHViS2V5cy5vYmplY3QpIH0sXG5cdFx0XHRcdGJpbmRpbmdEYXRhOiB7XG5cdFx0XHRcdFx0dXNlckdyb3VwSWQsXG5cdFx0XHRcdFx0YWRtaW5Hcm91cElkLFxuXHRcdFx0XHRcdG5ld0FkbWluR3JvdXBLZXlWZXJzaW9uOiBhZG1pbkdyb3VwS2V5VmVyc2lvbixcblx0XHRcdFx0XHRjdXJyZW50UmVjZWl2aW5nVXNlckdyb3VwS2V5VmVyc2lvbjogY3VycmVudFVzZXJHcm91cEtleS52ZXJzaW9uLFxuXHRcdFx0XHR9LFxuXHRcdFx0fSxcblx0XHRcdHRhZyxcblx0XHQpXG5cblx0XHRjb25zdCBwdWJBZG1pbkdyb3VwRW5jVXNlckdyb3VwS2V5ID0gYXdhaXQgdGhpcy5lbmNyeXB0VXNlckdyb3VwS2V5Rm9yQWRtaW5Bc3ltbWV0cmljYWxseShcblx0XHRcdHVzZXJHcm91cElkLFxuXHRcdFx0bmV3VXNlckdyb3VwS2V5cyxcblx0XHRcdGN1cnJlbnRBZG1pblB1YktleXMsXG5cdFx0XHRhZG1pbkdyb3VwSWQsXG5cdFx0XHRjdXJyZW50VXNlckdyb3VwS2V5LFxuXHRcdClcblx0XHRyZXR1cm4geyBwdWJBZG1pbkdyb3VwRW5jVXNlckdyb3VwS2V5LCBhZG1pbkdyb3VwS2V5VmVyc2lvbjogY3VycmVudEFkbWluUHViS2V5cy52ZXJzaW9uIH1cblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgaGFuZGxlVXNlckdyb3VwS2V5Um90YXRpb25Bc0FkbWluKFxuXHRcdHVzZXJHcm91cEtleVJvdGF0aW9uOiBLZXlSb3RhdGlvbixcblx0XHRhZG1pbkdyb3VwSWQ6IElkLFxuXHRcdHB3S2V5OiBBZXMyNTZLZXksXG5cdFx0dXNlckdyb3VwSWQ6IElkLFxuXHRcdGN1cnJlbnRVc2VyR3JvdXBLZXk6IFZlcnNpb25lZEtleSxcblx0XHRuZXdVc2VyR3JvdXBLZXlzOiBHZW5lcmF0ZWRHcm91cEtleXMsXG5cdCkge1xuXHRcdGNvbnN0IGRpc3RFbmNBZG1pbkdyb3VwU3ltS2V5ID0gYXNzZXJ0Tm90TnVsbCh1c2VyR3JvdXBLZXlSb3RhdGlvbi5kaXN0RW5jQWRtaW5Hcm91cFN5bUtleSwgXCJtaXNzaW5nIG5ldyBhZG1pbiBncm91cCBrZXlcIilcblx0XHRjb25zdCBwdWJBZG1pbkVuY0dLZXlBdXRoSGFzaCA9IGJyYW5kS2V5TWFjKGFzc2VydE5vdE51bGwoZGlzdEVuY0FkbWluR3JvdXBTeW1LZXkuc3ltS2V5TWFjLCBcIm1pc3NpbmcgbmV3IGFkbWluIGdyb3VwIGtleSBlbmNyeXB0ZWQgaGFzaFwiKSlcblx0XHRpZiAodXNlckdyb3VwS2V5Um90YXRpb24uYWRtaW5EaXN0S2V5UGFpciA9PSBudWxsIHx8ICFpc0VuY3J5cHRlZFBxS2V5UGFpcnModXNlckdyb3VwS2V5Um90YXRpb24uYWRtaW5EaXN0S2V5UGFpcikpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIm1pc3Npbmcgc29tZSByZXF1aXJlZCBwYXJhbWV0ZXJzIGZvciBhIHVzZXIgZ3JvdXAga2V5IHJvdGF0aW9uIGFzIGFkbWluXCIpXG5cdFx0fVxuXHRcdC8vZGVyaXZlIGFkbWluRGlzdEtleVBhaXJEaXN0cmlidXRpb25LZXlcblx0XHRjb25zdCBjdXJyZW50QWRtaW5Hcm91cEtleUZyb21NZW1iZXJzaGlwID0gYXdhaXQgdGhpcy5rZXlMb2FkZXJGYWNhZGUuZ2V0Q3VycmVudFN5bUdyb3VwS2V5KGFkbWluR3JvdXBJZCkgLy8gZ2V0IGFkbWluIGdyb3VwIGtleSBmcm9tIHRoZSBtZW1iZXJzaGlwIChub3QgeWV0IHJvdGF0ZWQpXG5cdFx0Y29uc3QgYWRtaW5Hcm91cEtleURpc3RyaWJ1dGlvbktleVBhaXJLZXkgPSB0aGlzLmRlcml2ZUFkbWluR3JvdXBEaXN0cmlidXRpb25LZXlQYWlyRW5jcnlwdGlvbktleShcblx0XHRcdGFkbWluR3JvdXBJZCxcblx0XHRcdHVzZXJHcm91cElkLFxuXHRcdFx0Y3VycmVudEFkbWluR3JvdXBLZXlGcm9tTWVtYmVyc2hpcC52ZXJzaW9uLFxuXHRcdFx0Y3VycmVudFVzZXJHcm91cEtleS52ZXJzaW9uLFxuXHRcdFx0cHdLZXksXG5cdFx0KVxuXG5cdFx0Ly8gZGVjcnlwdCBoaXMgcHJpdmF0ZSBkaXN0cmlidXRpb24ga2V5XG5cdFx0Y29uc3QgYWRtaW5Hcm91cERpc3RLZXlQYWlyID0gdGhpcy5jcnlwdG9XcmFwcGVyLmRlY3J5cHRLZXlQYWlyKGFkbWluR3JvdXBLZXlEaXN0cmlidXRpb25LZXlQYWlyS2V5LCB1c2VyR3JvdXBLZXlSb3RhdGlvbi5hZG1pbkRpc3RLZXlQYWlyKVxuXHRcdC8vZGVjcnlwdCBuZXcgc3ltbWV0cmljIGFkbWluIGdyb3VwIGtleVxuXHRcdGNvbnN0IHNlbmRlcklkZW50aWZpZXIgPSB7XG5cdFx0XHRpZGVudGlmaWVyOiBhc3NlcnROb3ROdWxsKGRpc3RFbmNBZG1pbkdyb3VwU3ltS2V5LnNlbmRlcklkZW50aWZpZXIpLFxuXHRcdFx0aWRlbnRpZmllclR5cGU6IGFzUHVibGljS2V5SWRlbnRpZmllcihhc3NlcnROb3ROdWxsKGRpc3RFbmNBZG1pbkdyb3VwU3ltS2V5LnNlbmRlcklkZW50aWZpZXJUeXBlKSksXG5cdFx0fVxuXHRcdGNvbnN0IGRlY2Fwc3VsYXRlZE5ld0FkbWluR3JvdXBLZXkgPSBhd2FpdCB0aGlzLmFzeW1tZXRyaWNDcnlwdG9GYWNhZGUuZGVjcnlwdFN5bUtleVdpdGhLZXlQYWlyQW5kQXV0aGVudGljYXRlKFxuXHRcdFx0YWRtaW5Hcm91cERpc3RLZXlQYWlyLFxuXHRcdFx0ZGlzdEVuY0FkbWluR3JvdXBTeW1LZXksXG5cdFx0XHRzZW5kZXJJZGVudGlmaWVyLFxuXHRcdClcblx0XHRjb25zdCB2ZXJzaW9uZWROZXdBZG1pbkdyb3VwS2V5ID0ge1xuXHRcdFx0b2JqZWN0OiBkZWNhcHN1bGF0ZWROZXdBZG1pbkdyb3VwS2V5LmRlY3J5cHRlZEFlc0tleSxcblx0XHRcdHZlcnNpb246IHBhcnNlS2V5VmVyc2lvbihwdWJBZG1pbkVuY0dLZXlBdXRoSGFzaC50YWdnZWRLZXlWZXJzaW9uKSxcblx0XHR9XG5cblx0XHR0aGlzLmtleUF1dGhlbnRpY2F0aW9uRmFjYWRlLnZlcmlmeVRhZyhcblx0XHRcdHtcblx0XHRcdFx0dGFnVHlwZTogXCJBRE1JTl9TWU1fS0VZX1RBR1wiLFxuXHRcdFx0XHRzb3VyY2VPZlRydXN0OiB7IGN1cnJlbnRSZWNlaXZpbmdVc2VyR3JvdXBLZXk6IGN1cnJlbnRVc2VyR3JvdXBLZXkub2JqZWN0IH0sXG5cdFx0XHRcdHVudHJ1c3RlZEtleTogeyBuZXdBZG1pbkdyb3VwS2V5OiB2ZXJzaW9uZWROZXdBZG1pbkdyb3VwS2V5Lm9iamVjdCB9LFxuXHRcdFx0XHRiaW5kaW5nRGF0YToge1xuXHRcdFx0XHRcdGN1cnJlbnRSZWNlaXZpbmdVc2VyR3JvdXBLZXlWZXJzaW9uOiBjdXJyZW50VXNlckdyb3VwS2V5LnZlcnNpb24sXG5cdFx0XHRcdFx0YWRtaW5Hcm91cElkLFxuXHRcdFx0XHRcdHVzZXJHcm91cElkLFxuXHRcdFx0XHRcdG5ld0FkbWluR3JvdXBLZXlWZXJzaW9uOiB2ZXJzaW9uZWROZXdBZG1pbkdyb3VwS2V5LnZlcnNpb24sXG5cdFx0XHRcdH0sXG5cdFx0XHR9LFxuXHRcdFx0cHViQWRtaW5FbmNHS2V5QXV0aEhhc2gudGFnLFxuXHRcdClcblxuXHRcdGNvbnN0IGFkbWluR3JvdXBFbmNVc2VyR3JvdXBLZXkgPSB0aGlzLmNyeXB0b1dyYXBwZXIuZW5jcnlwdEtleVdpdGhWZXJzaW9uZWRLZXkodmVyc2lvbmVkTmV3QWRtaW5Hcm91cEtleSwgbmV3VXNlckdyb3VwS2V5cy5zeW1Hcm91cEtleS5vYmplY3QpLmtleVxuXHRcdGNvbnN0IHVzZXJHcm91cEVuY0FkbWluR3JvdXBLZXkgPSB0aGlzLmNyeXB0b1dyYXBwZXIuZW5jcnlwdEtleVdpdGhWZXJzaW9uZWRLZXkobmV3VXNlckdyb3VwS2V5cy5zeW1Hcm91cEtleSwgdmVyc2lvbmVkTmV3QWRtaW5Hcm91cEtleS5vYmplY3QpLmtleVxuXHRcdGNvbnN0IGFkbWluR3JvdXBLZXlWZXJzaW9uID0gU3RyaW5nKHZlcnNpb25lZE5ld0FkbWluR3JvdXBLZXkudmVyc2lvbilcblx0XHRyZXR1cm4geyBhZG1pbkdyb3VwRW5jVXNlckdyb3VwS2V5LCB1c2VyR3JvdXBFbmNBZG1pbkdyb3VwS2V5LCBhZG1pbkdyb3VwS2V5VmVyc2lvbiB9XG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIGVuY3J5cHRVc2VyR3JvdXBLZXlGb3JBZG1pbkFzeW1tZXRyaWNhbGx5KFxuXHRcdHVzZXJHcm91cElkOiBJZCxcblx0XHRuZXdVc2VyR3JvdXBLZXlzOiBHZW5lcmF0ZWRHcm91cEtleXMsXG5cdFx0YWRtaW5QdWJLZXlzOiBWZXJzaW9uZWQ8UHVibGljS2V5cz4sXG5cdFx0YWRtaW5Hcm91cElkOiBJZCxcblx0XHRjdXJyZW50VXNlckdyb3VwS2V5OiBWZXJzaW9uZWRLZXksXG5cdCk6IFByb21pc2U8UHViRW5jS2V5RGF0YT4ge1xuXHRcdC8vIHdlIHdhbnQgdG8gYXV0aGVudGljYXRlIHdpdGggbmV3IHNlbmRlciBrZXkgcGFpci4gc28gd2UganVzdCBkZWNyeXB0IGl0IGFnYWluXG5cdFx0Y29uc3QgcHFLZXlQYWlyOiBQUUtleVBhaXJzID0gdGhpcy5jcnlwdG9XcmFwcGVyLmRlY3J5cHRLZXlQYWlyKG5ld1VzZXJHcm91cEtleXMuc3ltR3JvdXBLZXkub2JqZWN0LCBhc3NlcnROb3ROdWxsKG5ld1VzZXJHcm91cEtleXMuZW5jcnlwdGVkS2V5UGFpcikpXG5cblx0XHRjb25zdCBwdWJFbmNTeW1LZXkgPSBhd2FpdCB0aGlzLmFzeW1tZXRyaWNDcnlwdG9GYWNhZGUudHV0YUNyeXB0RW5jcnlwdFN5bUtleShuZXdVc2VyR3JvdXBLZXlzLnN5bUdyb3VwS2V5Lm9iamVjdCwgYWRtaW5QdWJLZXlzLCB7XG5cdFx0XHR2ZXJzaW9uOiBuZXdVc2VyR3JvdXBLZXlzLnN5bUdyb3VwS2V5LnZlcnNpb24sXG5cdFx0XHRvYmplY3Q6IHBxS2V5UGFpci5lY2NLZXlQYWlyLFxuXHRcdH0pXG5cblx0XHRjb25zdCB0YWcgPSB0aGlzLmtleUF1dGhlbnRpY2F0aW9uRmFjYWRlLmNvbXB1dGVUYWcoe1xuXHRcdFx0dGFnVHlwZTogXCJVU0VSX0dST1VQX0tFWV9UQUdcIixcblx0XHRcdHVudHJ1c3RlZEtleToge1xuXHRcdFx0XHRuZXdVc2VyR3JvdXBLZXk6IG5ld1VzZXJHcm91cEtleXMuc3ltR3JvdXBLZXkub2JqZWN0LFxuXHRcdFx0fSxcblx0XHRcdHNvdXJjZU9mVHJ1c3Q6IHtcblx0XHRcdFx0Y3VycmVudFVzZXJHcm91cEtleTogY3VycmVudFVzZXJHcm91cEtleS5vYmplY3QsXG5cdFx0XHR9LFxuXHRcdFx0YmluZGluZ0RhdGE6IHtcblx0XHRcdFx0dXNlckdyb3VwSWQsXG5cdFx0XHRcdGFkbWluR3JvdXBJZCxcblx0XHRcdFx0bmV3QWRtaW5Hcm91cEtleVZlcnNpb246IGFkbWluUHViS2V5cy52ZXJzaW9uLFxuXHRcdFx0XHRjdXJyZW50VXNlckdyb3VwS2V5VmVyc2lvbjogY3VycmVudFVzZXJHcm91cEtleS52ZXJzaW9uLFxuXHRcdFx0XHRuZXdVc2VyR3JvdXBLZXlWZXJzaW9uOiBuZXdVc2VyR3JvdXBLZXlzLnN5bUdyb3VwS2V5LnZlcnNpb24sXG5cdFx0XHR9LFxuXHRcdH0pXG5cblx0XHRjb25zdCBzeW1LZXlNYWMgPSBjcmVhdGVLZXlNYWMoe1xuXHRcdFx0dGFnZ2luZ0dyb3VwOiB1c2VyR3JvdXBJZCxcblx0XHRcdHRhZyxcblx0XHRcdHRhZ2dlZEtleVZlcnNpb246IFN0cmluZyhuZXdVc2VyR3JvdXBLZXlzLnN5bUdyb3VwS2V5LnZlcnNpb24pLFxuXHRcdFx0dGFnZ2luZ0tleVZlcnNpb246IFN0cmluZyhjdXJyZW50VXNlckdyb3VwS2V5LnZlcnNpb24pLFxuXHRcdH0pXG5cblx0XHRyZXR1cm4gY3JlYXRlUHViRW5jS2V5RGF0YSh7XG5cdFx0XHRyZWNpcGllbnRJZGVudGlmaWVyOiBhZG1pbkdyb3VwSWQsXG5cdFx0XHRyZWNpcGllbnRJZGVudGlmaWVyVHlwZTogUHVibGljS2V5SWRlbnRpZmllclR5cGUuR1JPVVBfSUQsXG5cdFx0XHRwdWJFbmNTeW1LZXk6IHB1YkVuY1N5bUtleS5wdWJFbmNTeW1LZXlCeXRlcyxcblx0XHRcdHByb3RvY29sVmVyc2lvbjogcHViRW5jU3ltS2V5LmNyeXB0b1Byb3RvY29sVmVyc2lvbixcblx0XHRcdHNlbmRlcktleVZlcnNpb246IHB1YkVuY1N5bUtleS5zZW5kZXJLZXlWZXJzaW9uICE9IG51bGwgPyBwdWJFbmNTeW1LZXkuc2VuZGVyS2V5VmVyc2lvbi50b1N0cmluZygpIDogbnVsbCxcblx0XHRcdHJlY2lwaWVudEtleVZlcnNpb246IHB1YkVuY1N5bUtleS5yZWNpcGllbnRLZXlWZXJzaW9uLnRvU3RyaW5nKCksXG5cdFx0XHRzZW5kZXJJZGVudGlmaWVyOiB1c2VyR3JvdXBJZCxcblx0XHRcdHNlbmRlcklkZW50aWZpZXJUeXBlOiBQdWJsaWNLZXlJZGVudGlmaWVyVHlwZS5HUk9VUF9JRCxcblx0XHRcdHN5bUtleU1hYyxcblx0XHR9KVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBjcmVhdGVEaXN0cmlidXRpb25LZXlQYWlyKHB3S2V5OiBBZXMyNTZLZXksIG11bHRpQWRtaW5LZXlSb3RhdGlvbjogS2V5Um90YXRpb24pIHtcblx0XHRsZXQgYWRtaW5Hcm91cElkID0gZ2V0RWxlbWVudElkKG11bHRpQWRtaW5LZXlSb3RhdGlvbilcblx0XHRjb25zdCBjdXJyZW50QWRtaW5Hcm91cEtleSA9IGF3YWl0IHRoaXMua2V5TG9hZGVyRmFjYWRlLmdldEN1cnJlbnRTeW1Hcm91cEtleShhZG1pbkdyb3VwSWQpXG5cdFx0Y29uc3QgY3VycmVudFVzZXJHcm91cEtleSA9IHRoaXMua2V5TG9hZGVyRmFjYWRlLmdldEN1cnJlbnRTeW1Vc2VyR3JvdXBLZXkoKVxuXHRcdGNvbnN0IHVzZXJHcm91cElkID0gdGhpcy51c2VyRmFjYWRlLmdldFVzZXJHcm91cElkKClcblx0XHRjb25zdCB1c2VyR3JvdXBLZXkgPSB0aGlzLmtleUxvYWRlckZhY2FkZS5nZXRDdXJyZW50U3ltVXNlckdyb3VwS2V5KClcblx0XHRjb25zdCBhZG1pbkRpc3RLZXlQYWlyRGlzdHJpYnV0aW9uS2V5ID0gdGhpcy5kZXJpdmVBZG1pbkdyb3VwRGlzdHJpYnV0aW9uS2V5UGFpckVuY3J5cHRpb25LZXkoXG5cdFx0XHRhZG1pbkdyb3VwSWQsXG5cdFx0XHR1c2VyR3JvdXBJZCxcblx0XHRcdGN1cnJlbnRBZG1pbkdyb3VwS2V5LnZlcnNpb24sXG5cdFx0XHR1c2VyR3JvdXBLZXkudmVyc2lvbixcblx0XHRcdHB3S2V5LFxuXHRcdClcblx0XHRjb25zdCBhZG1pbkRpc3RyaWJ1dGlvbktleVBhaXIgPSBhd2FpdCB0aGlzLmdlbmVyYXRlQW5kRW5jcnlwdFBxS2V5UGFpcnMoYWRtaW5EaXN0S2V5UGFpckRpc3RyaWJ1dGlvbktleSlcblxuXHRcdGNvbnN0IHRhZyA9IHRoaXMua2V5QXV0aGVudGljYXRpb25GYWNhZGUuY29tcHV0ZVRhZyh7XG5cdFx0XHR0YWdUeXBlOiBcIlBVQl9ESVNUX0tFWV9UQUdcIixcblx0XHRcdHNvdXJjZU9mVHJ1c3Q6IHsgY3VycmVudEFkbWluR3JvdXBLZXk6IGN1cnJlbnRBZG1pbkdyb3VwS2V5Lm9iamVjdCB9LFxuXHRcdFx0dW50cnVzdGVkS2V5OiB7XG5cdFx0XHRcdGRpc3RQdWJLZXk6IGFzUFFQdWJsaWNLZXlzKGFkbWluRGlzdHJpYnV0aW9uS2V5UGFpciksXG5cdFx0XHR9LFxuXHRcdFx0YmluZGluZ0RhdGE6IHtcblx0XHRcdFx0dXNlckdyb3VwSWQsXG5cdFx0XHRcdGFkbWluR3JvdXBJZCxcblx0XHRcdFx0Y3VycmVudFVzZXJHcm91cEtleVZlcnNpb246IGN1cnJlbnRVc2VyR3JvdXBLZXkudmVyc2lvbixcblx0XHRcdFx0Y3VycmVudEFkbWluR3JvdXBLZXlWZXJzaW9uOiBjdXJyZW50QWRtaW5Hcm91cEtleS52ZXJzaW9uLFxuXHRcdFx0fSxcblx0XHR9KVxuXG5cdFx0Y29uc3QgcHV0RGlzdHJpYnV0aW9uS2V5UGFpcnNPbktleVJvdGF0aW9uID0gY3JlYXRlQWRtaW5Hcm91cEtleVJvdGF0aW9uUHV0SW4oe1xuXHRcdFx0YWRtaW5EaXN0S2V5UGFpcjogYXNzZXJ0Tm90TnVsbChtYWtlS2V5UGFpcihhZG1pbkRpc3RyaWJ1dGlvbktleVBhaXIpKSxcblx0XHRcdGRpc3RLZXlNYWM6IGNyZWF0ZUtleU1hYyh7XG5cdFx0XHRcdHRhZyxcblx0XHRcdFx0dGFnZ2VkS2V5VmVyc2lvbjogXCIwXCIsIC8vIGR1bW15IHZhbHVlIGJlY2F1c2UgdGhpcyBpcyBvbmx5IHVzZWQgZm9yIHRoZSByb3RhdGlvbiBhbmQgZG9lcyBub3QgaGF2ZSBhIHZlcnNpb25cblx0XHRcdFx0dGFnZ2luZ0dyb3VwOiBhZG1pbkdyb3VwSWQsXG5cdFx0XHRcdHRhZ2dpbmdLZXlWZXJzaW9uOiBjdXJyZW50QWRtaW5Hcm91cEtleS52ZXJzaW9uLnRvU3RyaW5nKCksXG5cdFx0XHR9KSxcblx0XHR9KVxuXHRcdGF3YWl0IHRoaXMuc2VydmljZUV4ZWN1dG9yLnB1dChBZG1pbkdyb3VwS2V5Um90YXRpb25TZXJ2aWNlLCBwdXREaXN0cmlidXRpb25LZXlQYWlyc09uS2V5Um90YXRpb24pXG5cdH1cblxuXHRhc3luYyByb3RhdGVNdWx0aXBsZUFkbWluc0dyb3VwS2V5cyh1c2VyOiBVc2VyLCBwYXNzcGhyYXNlS2V5OiBBZXMyNTZLZXksIGtleVJvdGF0aW9uOiBLZXlSb3RhdGlvbikge1xuXHRcdC8vIGZpcnN0IGdldCBhbGwgYWRtaW4gbWVtYmVycycgYXZhaWxhYmxlIGRpc3RyaWJ1dGlvbiBrZXlzXG5cdFx0Y29uc3QgeyBkaXN0cmlidXRpb25LZXlzLCB1c2VyR3JvdXBJZHNNaXNzaW5nRGlzdHJpYnV0aW9uS2V5cyB9ID0gYXdhaXQgdGhpcy5zZXJ2aWNlRXhlY3V0b3IuZ2V0KEFkbWluR3JvdXBLZXlSb3RhdGlvblNlcnZpY2UsIG51bGwpXG5cblx0XHRzd2l0Y2ggKHRoaXMuZGVjaWRlTXVsdGlBZG1pbkdyb3VwS2V5Um90YXRpb25OZXh0UGF0aE9mQWN0aW9uKHVzZXJHcm91cElkc01pc3NpbmdEaXN0cmlidXRpb25LZXlzLCB1c2VyLCBkaXN0cmlidXRpb25LZXlzKSkge1xuXHRcdFx0Y2FzZSBNdWx0aUFkbWluR3JvdXBLZXlBZG1pbkFjdGlvblBhdGguV0FJVF9GT1JfT1RIRVJfQURNSU5TOlxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBNdWx0aUFkbWluR3JvdXBLZXlBZG1pbkFjdGlvblBhdGguQ1JFQVRFX0RJU1RSSUJVVElPTl9LRVlTOlxuXHRcdFx0XHRhd2FpdCB0aGlzLmNyZWF0ZURpc3RyaWJ1dGlvbktleVBhaXIocGFzc3BocmFzZUtleSwga2V5Um90YXRpb24pXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIE11bHRpQWRtaW5Hcm91cEtleUFkbWluQWN0aW9uUGF0aC5QRVJGT1JNX0tFWV9ST1RBVElPTjpcblx0XHRcdFx0YXdhaXQgdGhpcy5wZXJmb3JtTXVsdGlBZG1pbktleVJvdGF0aW9uKGtleVJvdGF0aW9uLCB1c2VyLCBwYXNzcGhyYXNlS2V5LCBkaXN0cmlidXRpb25LZXlzKVxuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBNdWx0aUFkbWluR3JvdXBLZXlBZG1pbkFjdGlvblBhdGguSU1QT1NTSUJMRV9TVEFURTpcblx0XHRcdFx0dGhyb3cgbmV3IFR1dGFub3RhRXJyb3IoXG5cdFx0XHRcdFx0XCJNdWx0aUFkbWluR3JvdXBLZXlBZG1pbkFjdGlvblBhdGhJbXBvc3NpYmxlU3RhdGVNZXRFcnJvclwiLFxuXHRcdFx0XHRcdFwiSW1wb3NzaWJsZSBzdGF0ZSBtZXQgd2hpbGUgcGVyZm9ybWluZyBtdWx0aSBhZG1pbiBrZXkgcm90YXRpb25cIixcblx0XHRcdFx0KVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgcGVyZm9ybU11bHRpQWRtaW5LZXlSb3RhdGlvbihrZXlSb3RhdGlvbjogS2V5Um90YXRpb24sIHVzZXI6IFVzZXIsIHBhc3NwaHJhc2VLZXk6IG51bWJlcltdLCBkaXN0cmlidXRpb25LZXlzOiBQdWJEaXN0cmlidXRpb25LZXlbXSkge1xuXHRcdGNvbnN0IGFkbWluR3JvdXBJZCA9IHRoaXMuZ2V0VGFyZ2V0R3JvdXBJZChrZXlSb3RhdGlvbilcblxuXHRcdC8vIGxvYWQgY3VycmVudCBhZG1pbiBncm91cCBrZXlcblx0XHRjb25zdCBjdXJyZW50QWRtaW5Hcm91cEtleSA9IGF3YWl0IHRoaXMua2V5TG9hZGVyRmFjYWRlLmdldEN1cnJlbnRTeW1Hcm91cEtleShhZG1pbkdyb3VwSWQpXG5cblx0XHQvLyBjcmVhdGlvbiBvZiBhIG5ldyBhZG1pbiBncm91cCBrZXlcblx0XHRjb25zdCBjdXJyZW50VXNlckdyb3VwS2V5ID0gdGhpcy5rZXlMb2FkZXJGYWNhZGUuZ2V0Q3VycmVudFN5bVVzZXJHcm91cEtleSgpXG5cdFx0Y29uc3QgeyBrZXlSb3RhdGlvbkRhdGEsIG5ld0FkbWluR3JvdXBLZXlzLCBuZXdVc2VyR3JvdXBLZXlzIH0gPSBhd2FpdCB0aGlzLnByZXBhcmVLZXlSb3RhdGlvbkZvclNpbmdsZUFkbWluKFxuXHRcdFx0a2V5Um90YXRpb24sXG5cdFx0XHR1c2VyLFxuXHRcdFx0Y3VycmVudFVzZXJHcm91cEtleSxcblx0XHRcdGN1cnJlbnRBZG1pbkdyb3VwS2V5LFxuXHRcdFx0cGFzc3BocmFzZUtleSxcblx0XHQpXG5cdFx0Y29uc3QgbmV3U3ltQWRtaW5Hcm91cEtleSA9IG5ld0FkbWluR3JvdXBLZXlzLnN5bUdyb3VwS2V5XG5cblx0XHRjb25zdCB7IHN5bUdyb3VwS2V5OiBzeW1Vc2VyR3JvdXBLZXksIGVuY3J5cHRlZEtleVBhaXI6IGVuY3J5cHRlZFVzZXJLZXlQYWlyIH0gPSBuZXdVc2VyR3JvdXBLZXlzXG5cdFx0Y29uc3QgZ2VuZXJhdGVkUHJpdmF0ZUVjY0tleSA9IHRoaXMuY3J5cHRvV3JhcHBlci5hZXNEZWNyeXB0KHN5bVVzZXJHcm91cEtleS5vYmplY3QsIGFzc2VydE5vdE51bGwoZW5jcnlwdGVkVXNlcktleVBhaXI/LnN5bUVuY1ByaXZFY2NLZXkpLCB0cnVlKVxuXHRcdGNvbnN0IGdlbmVyYXRlZFB1YmxpY0VjY0tleSA9IGFzc2VydE5vdE51bGwoZW5jcnlwdGVkVXNlcktleVBhaXI/LnB1YkVjY0tleSlcblx0XHRjb25zdCBnZW5lcmF0ZWRFY2NLZXlQYWlyOiBWZXJzaW9uZWQ8RWNjS2V5UGFpcj4gPSB7XG5cdFx0XHR2ZXJzaW9uOiBzeW1Vc2VyR3JvdXBLZXkudmVyc2lvbixcblx0XHRcdG9iamVjdDoge1xuXHRcdFx0XHRwcml2YXRlS2V5OiBnZW5lcmF0ZWRQcml2YXRlRWNjS2V5LFxuXHRcdFx0XHRwdWJsaWNLZXk6IGdlbmVyYXRlZFB1YmxpY0VjY0tleSxcblx0XHRcdH0sXG5cdFx0fVxuXG5cdFx0Y29uc3QgZ3JvdXBNYW5hZ2VtZW50RmFjYWRlID0gYXdhaXQgdGhpcy5ncm91cE1hbmFnZW1lbnRGYWNhZGUoKVxuXG5cdFx0Ly8gZGlzdHJpYnV0aW9uIGZvciBhbGwgb3RoZXIgYWRtaW5zIHVzaW5nIHRoZWlyIGRpc3RyaWJ1dGlvbiBrZXlzXG5cdFx0Zm9yIChjb25zdCBkaXN0cmlidXRpb25LZXkgb2YgZGlzdHJpYnV0aW9uS2V5cykge1xuXHRcdFx0Ly8gd2UgZG8gbm90IGRpc3RyaWJ1dGUgZm9yIG91cnNlbHZlc1xuXHRcdFx0aWYgKGlzU2FtZUlkKGRpc3RyaWJ1dGlvbktleS51c2VyR3JvdXBJZCwgdXNlci51c2VyR3JvdXAuZ3JvdXApKSBjb250aW51ZVxuXHRcdFx0Ly8gdmVyaWZ5IGF1dGhlbnRpY2l0eSBvZiB0aGlzIGRpc3RyaWJ1dGlvbiBrZXlcblx0XHRcdC8vIHJlcHJvZHVjZSBoYXNoXG5cblx0XHRcdGNvbnN0IHVzZXJHcm91cElkID0gZGlzdHJpYnV0aW9uS2V5LnVzZXJHcm91cElkXG5cdFx0XHRjb25zdCB0YXJnZXRVc2VyR3JvdXBLZXkgPSBhd2FpdCBncm91cE1hbmFnZW1lbnRGYWNhZGUuZ2V0Q3VycmVudEdyb3VwS2V5VmlhQWRtaW5FbmNHS2V5KHVzZXJHcm91cElkKVxuXHRcdFx0Y29uc3QgZ2l2ZW5UYWcgPSBicmFuZEtleU1hYyhkaXN0cmlidXRpb25LZXkucHViS2V5TWFjKS50YWdcblxuXHRcdFx0dGhpcy5rZXlBdXRoZW50aWNhdGlvbkZhY2FkZS52ZXJpZnlUYWcoXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0YWdUeXBlOiBcIlBVQl9ESVNUX0tFWV9UQUdcIixcblx0XHRcdFx0XHRzb3VyY2VPZlRydXN0OiB7IGN1cnJlbnRBZG1pbkdyb3VwS2V5OiBjdXJyZW50QWRtaW5Hcm91cEtleS5vYmplY3QgfSxcblx0XHRcdFx0XHR1bnRydXN0ZWRLZXk6IHtcblx0XHRcdFx0XHRcdGRpc3RQdWJLZXk6IGFzUFFQdWJsaWNLZXlzKGRpc3RyaWJ1dGlvbktleSksXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRiaW5kaW5nRGF0YToge1xuXHRcdFx0XHRcdFx0dXNlckdyb3VwSWQsXG5cdFx0XHRcdFx0XHRhZG1pbkdyb3VwSWQsXG5cdFx0XHRcdFx0XHRjdXJyZW50VXNlckdyb3VwS2V5VmVyc2lvbjogdGFyZ2V0VXNlckdyb3VwS2V5LnZlcnNpb24sXG5cdFx0XHRcdFx0XHRjdXJyZW50QWRtaW5Hcm91cEtleVZlcnNpb246IGN1cnJlbnRBZG1pbkdyb3VwS2V5LnZlcnNpb24sXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0fSxcblx0XHRcdFx0Z2l2ZW5UYWcsXG5cdFx0XHQpXG5cblx0XHRcdGNvbnN0IHJlY2lwaWVudFB1YmxpY0Rpc3RLZXlzOiBWZXJzaW9uZWQ8UHVibGljS2V5cz4gPSB7XG5cdFx0XHRcdHZlcnNpb246IDAsXG5cdFx0XHRcdG9iamVjdDoge1xuXHRcdFx0XHRcdHB1YlJzYUtleTogbnVsbCxcblx0XHRcdFx0XHRwdWJFY2NLZXk6IGRpc3RyaWJ1dGlvbktleS5wdWJFY2NLZXksXG5cdFx0XHRcdFx0cHViS3liZXJLZXk6IGRpc3RyaWJ1dGlvbktleS5wdWJLeWJlcktleSxcblx0XHRcdFx0fSxcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgZW5jcnlwdGVkQWRtaW5Hcm91cEtleUZvclRoaXNBZG1pbiA9IGF3YWl0IHRoaXMuYXN5bW1ldHJpY0NyeXB0b0ZhY2FkZS50dXRhQ3J5cHRFbmNyeXB0U3ltS2V5KFxuXHRcdFx0XHRuZXdTeW1BZG1pbkdyb3VwS2V5Lm9iamVjdCxcblx0XHRcdFx0cmVjaXBpZW50UHVibGljRGlzdEtleXMsXG5cdFx0XHRcdGdlbmVyYXRlZEVjY0tleVBhaXIsXG5cdFx0XHQpXG5cblx0XHRcdGNvbnN0IGFkbWluU3ltS2V5VGFnID0gdGhpcy5rZXlBdXRoZW50aWNhdGlvbkZhY2FkZS5jb21wdXRlVGFnKHtcblx0XHRcdFx0dGFnVHlwZTogXCJBRE1JTl9TWU1fS0VZX1RBR1wiLFxuXHRcdFx0XHRzb3VyY2VPZlRydXN0OiB7IGN1cnJlbnRSZWNlaXZpbmdVc2VyR3JvdXBLZXk6IHRhcmdldFVzZXJHcm91cEtleS5vYmplY3QgfSxcblx0XHRcdFx0dW50cnVzdGVkS2V5OiB7IG5ld0FkbWluR3JvdXBLZXk6IG5ld1N5bUFkbWluR3JvdXBLZXkub2JqZWN0IH0sXG5cdFx0XHRcdGJpbmRpbmdEYXRhOiB7XG5cdFx0XHRcdFx0YWRtaW5Hcm91cElkLFxuXHRcdFx0XHRcdHVzZXJHcm91cElkLFxuXHRcdFx0XHRcdGN1cnJlbnRSZWNlaXZpbmdVc2VyR3JvdXBLZXlWZXJzaW9uOiBjdXJyZW50VXNlckdyb3VwS2V5LnZlcnNpb24sXG5cdFx0XHRcdFx0bmV3QWRtaW5Hcm91cEtleVZlcnNpb246IG5ld1N5bUFkbWluR3JvdXBLZXkudmVyc2lvbixcblx0XHRcdFx0fSxcblx0XHRcdH0pXG5cblx0XHRcdGNvbnN0IHN5bUtleU1hYyA9IGNyZWF0ZUtleU1hYyh7XG5cdFx0XHRcdHRhZ2dpbmdHcm91cDogYWRtaW5Hcm91cElkLFxuXHRcdFx0XHR0YWdnZWRLZXlWZXJzaW9uOiBTdHJpbmcobmV3U3ltQWRtaW5Hcm91cEtleS52ZXJzaW9uKSxcblx0XHRcdFx0dGFnZ2luZ0tleVZlcnNpb246IFN0cmluZyhjdXJyZW50QWRtaW5Hcm91cEtleS52ZXJzaW9uKSxcblx0XHRcdFx0dGFnOiBhZG1pblN5bUtleVRhZyxcblx0XHRcdH0pXG5cblx0XHRcdGNvbnN0IHB1YkVuY0tleURhdGEgPSBjcmVhdGVQdWJFbmNLZXlEYXRhKHtcblx0XHRcdFx0cmVjaXBpZW50SWRlbnRpZmllclR5cGU6IFB1YmxpY0tleUlkZW50aWZpZXJUeXBlLkdST1VQX0lELFxuXHRcdFx0XHRyZWNpcGllbnRJZGVudGlmaWVyOiBcImR1bW15XCIsXG5cdFx0XHRcdHJlY2lwaWVudEtleVZlcnNpb246IFwiMFwiLFxuXHRcdFx0XHRwdWJFbmNTeW1LZXk6IGVuY3J5cHRlZEFkbWluR3JvdXBLZXlGb3JUaGlzQWRtaW4ucHViRW5jU3ltS2V5Qnl0ZXMsXG5cdFx0XHRcdHNlbmRlcklkZW50aWZpZXJUeXBlOiBQdWJsaWNLZXlJZGVudGlmaWVyVHlwZS5HUk9VUF9JRCxcblx0XHRcdFx0c2VuZGVySWRlbnRpZmllcjogdXNlci51c2VyR3JvdXAuZ3JvdXAsXG5cdFx0XHRcdHNlbmRlcktleVZlcnNpb246IFN0cmluZyhnZW5lcmF0ZWRFY2NLZXlQYWlyLnZlcnNpb24pLFxuXHRcdFx0XHRwcm90b2NvbFZlcnNpb246IENyeXB0b1Byb3RvY29sVmVyc2lvbi5UVVRBX0NSWVBULFxuXHRcdFx0XHRzeW1LZXlNYWMsXG5cdFx0XHR9KVxuXHRcdFx0Y29uc3QgdGhpc0FkbWluRGlzdHJpYnV0aW9uRWxlbWVudDogQWRtaW5Hcm91cEtleURpc3RyaWJ1dGlvbkVsZW1lbnQgPSBjcmVhdGVBZG1pbkdyb3VwS2V5RGlzdHJpYnV0aW9uRWxlbWVudCh7XG5cdFx0XHRcdHVzZXJHcm91cElkOiBkaXN0cmlidXRpb25LZXkudXNlckdyb3VwSWQsXG5cdFx0XHRcdGRpc3RFbmNBZG1pbkdyb3VwS2V5OiBwdWJFbmNLZXlEYXRhLFxuXHRcdFx0fSlcblxuXHRcdFx0a2V5Um90YXRpb25EYXRhLmRpc3RyaWJ1dGlvbi5wdXNoKHRoaXNBZG1pbkRpc3RyaWJ1dGlvbkVsZW1lbnQpXG5cdFx0fVxuXG5cdFx0Ly8gY2FsbCBzZXJ2aWNlXG5cdFx0YXdhaXQgdGhpcy5zZXJ2aWNlRXhlY3V0b3IucG9zdChBZG1pbkdyb3VwS2V5Um90YXRpb25TZXJ2aWNlLCBrZXlSb3RhdGlvbkRhdGEpXG5cdFx0dGhpcy5ncm91cElkc1RoYXRQZXJmb3JtZWRLZXlSb3RhdGlvbnMuYWRkKHVzZXIudXNlckdyb3VwLmdyb3VwKVxuXHR9XG5cblx0LyoqXG5cdCAqIENvbnRleHQ6IG11bHRpIGFkbWluIGdyb3VwIGtleSByb3RhdGlvblxuXHQgKlxuXHQgKiBUaGlzIHV0aWxpdHkgZnVuY3Rpb24gZGV0ZXJtaW5lcyB0aGUgYWN0aW9uIGEgZ2l2ZW4gYWRtaW4gbXVzdCB0YWtlIGluIGEgbXVsdGkgYWRtaW4gZ3JvdXAga2V5IHJvdGF0aW9uIHNjZW5hcmlvXG5cdCAqIFRoaXMgYWN0aW9uIGNhbiBiZSBvbmUgb2YgdGhlc2UgdGhyZWVcblx0ICogLSB0aGUgYWRtaW4gc2hvdWxkIHdhaXQgZm9yIHRoZSBvdGhlciB0byBjcmVhdGUgdGhlaXIgZGlzdHJpYnV0aW9uIGtleXNcblx0ICogLSB0aGUgYWRtaW4gc2hvdWxkIGNyZWF0ZSB0aGVpciBkaXN0cmlidXRpb24ga2V5c1xuXHQgKiAtIHRoZSBhZG1pbiBzaG91bGQgcGVyZm9ybSB0aGUga2V5IHJvdGF0aW9uIGFuZCBkaXN0cmlidXRlIHRoZSBuZXcga2V5cyB0byBvdGhlciBhZG1pbnNcblx0ICpcblx0ICogQHBhcmFtIHVzZXJHcm91cElkc01pc3NpbmdEaXN0cmlidXRpb25LZXlzIGFsbCBhZG1pbiBtZW1iZXIgaWRzIHRoYXQgY3VycmVudGx5IGRvbid0IGhhdmUgZGlzdHJpYnV0aW9uIGtleXNcblx0ICogQHBhcmFtIGFkbWluVXNlciB0aGUgY3VycmVudCBsb2dnZWQtaW4gYWRtaW4gdXNlclxuXHQgKiBAcGFyYW0gZGlzdHJpYnV0aW9uS2V5cyB0aGUgZGlzdHJpYnV0aW9uIGtleXMgYWxyZWFkeSBjcmVhdGVkIChpbmNsdWRlIHRoZSBhZG1pbnMgdXNlciBrZXlzKVxuXHQgKlxuXHQgKi9cblx0cHVibGljIGRlY2lkZU11bHRpQWRtaW5Hcm91cEtleVJvdGF0aW9uTmV4dFBhdGhPZkFjdGlvbihcblx0XHR1c2VyR3JvdXBJZHNNaXNzaW5nRGlzdHJpYnV0aW9uS2V5czogSWRbXSxcblx0XHRhZG1pblVzZXI6IFVzZXIsXG5cdFx0ZGlzdHJpYnV0aW9uS2V5czogUHViRGlzdHJpYnV0aW9uS2V5W10sXG5cdCk6IE11bHRpQWRtaW5Hcm91cEtleUFkbWluQWN0aW9uUGF0aCB7XG5cdFx0Y29uc3QgZXZlcnlvbmVIYXNEaXN0cmlidXRpb25LZXlzID0gdXNlckdyb3VwSWRzTWlzc2luZ0Rpc3RyaWJ1dGlvbktleXMubGVuZ3RoID09PSAwXG5cdFx0Y29uc3QgZXZlcnlvbmVFbHNlSGFzRGlzdHJpYnV0aW9uS2V5c0J1dE1lID1cblx0XHRcdHVzZXJHcm91cElkc01pc3NpbmdEaXN0cmlidXRpb25LZXlzLmxlbmd0aCA9PT0gMSAmJiBpc1NhbWVJZCh1c2VyR3JvdXBJZHNNaXNzaW5nRGlzdHJpYnV0aW9uS2V5c1swXSwgYWRtaW5Vc2VyLnVzZXJHcm91cC5ncm91cClcblx0XHRjb25zdCBpSGF2ZURpc3RyaWJ1dGlvbktleXMgPSBkaXN0cmlidXRpb25LZXlzLnNvbWUoKGRrKSA9PiBpc1NhbWVJZChkay51c2VyR3JvdXBJZCwgYWRtaW5Vc2VyLnVzZXJHcm91cC5ncm91cCkpXG5cblx0XHQvLyBjaGVjayBvcmRlciBpcyBpbXBvcnRhbnRcblx0XHRpZiAoZXZlcnlvbmVFbHNlSGFzRGlzdHJpYnV0aW9uS2V5c0J1dE1lIHx8IGV2ZXJ5b25lSGFzRGlzdHJpYnV0aW9uS2V5cykge1xuXHRcdFx0cmV0dXJuIE11bHRpQWRtaW5Hcm91cEtleUFkbWluQWN0aW9uUGF0aC5QRVJGT1JNX0tFWV9ST1RBVElPTlxuXHRcdH0gZWxzZSBpZiAoIWV2ZXJ5b25lSGFzRGlzdHJpYnV0aW9uS2V5cyAmJiBpSGF2ZURpc3RyaWJ1dGlvbktleXMpIHtcblx0XHRcdHJldHVybiBNdWx0aUFkbWluR3JvdXBLZXlBZG1pbkFjdGlvblBhdGguV0FJVF9GT1JfT1RIRVJfQURNSU5TXG5cdFx0fSBlbHNlIGlmICghZXZlcnlvbmVFbHNlSGFzRGlzdHJpYnV0aW9uS2V5c0J1dE1lICYmICFpSGF2ZURpc3RyaWJ1dGlvbktleXMpIHtcblx0XHRcdHJldHVybiBNdWx0aUFkbWluR3JvdXBLZXlBZG1pbkFjdGlvblBhdGguQ1JFQVRFX0RJU1RSSUJVVElPTl9LRVlTXG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBNdWx0aUFkbWluR3JvdXBLZXlBZG1pbkFjdGlvblBhdGguSU1QT1NTSUJMRV9TVEFURVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIGEgbGlzdCBvZiB0aGUgZ3JvdXBzIGZvciB3aGljaCB3ZSBoYXZlIHJvdGF0ZWQga2V5cyBpbiB0aGUgc2Vzc2lvbiwgc28gZmFyLlxuXHQgKi9cblx0cHVibGljIGFzeW5jIGdldEdyb3VwSWRzVGhhdFBlcmZvcm1lZEtleVJvdGF0aW9ucygpOiBQcm9taXNlPEFycmF5PElkPj4ge1xuXHRcdHJldHVybiBBcnJheS5mcm9tKHRoaXMuZ3JvdXBJZHNUaGF0UGVyZm9ybWVkS2V5Um90YXRpb25zLnZhbHVlcygpKVxuXHR9XG59XG5cbi8qKlxuICogV2UgcmVxdWlyZSBBRVMga2V5cyB0byBiZSAyNTYtYml0IGxvbmcgdG8gYmUgcXVhbnR1bS1zYWZlIGJlY2F1c2Ugb2YgR3JvdmVyJ3MgYWxnb3JpdGhtLlxuICovXG5mdW5jdGlvbiBpc1F1YW50dW1TYWZlKGtleTogQWVzS2V5KSB7XG5cdHJldHVybiBnZXRLZXlMZW5ndGhCeXRlcyhrZXkpID09PSBLRVlfTEVOR1RIX0JZVEVTX0FFU18yNTZcbn1cblxuZnVuY3Rpb24gaGFzTm9uUXVhbnR1bVNhZmVLZXlzKC4uLmtleXM6IEFlc0tleVtdKSB7XG5cdHJldHVybiBrZXlzLnNvbWUoKGtleSkgPT4gIWlzUXVhbnR1bVNhZmUoa2V5KSlcbn1cblxuZnVuY3Rpb24gbWFrZUtleVBhaXIoa2V5UGFpcjogRW5jcnlwdGVkUHFLZXlQYWlycyB8IG51bGwpOiBLZXlQYWlyIHwgbnVsbCB7XG5cdHJldHVybiBrZXlQYWlyICE9IG51bGwgPyBjcmVhdGVLZXlQYWlyKGtleVBhaXIpIDogbnVsbFxufVxuIiwiaW1wb3J0IHsgZ2V0RnJvbU1hcCwgbmV2ZXJOdWxsIH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5pbXBvcnQgeyBVc2VyIH0gZnJvbSBcIi4uLy4uL2VudGl0aWVzL3N5cy9UeXBlUmVmcy5qc1wiXG5pbXBvcnQgeyBWZXJzaW9uZWRLZXkgfSBmcm9tIFwiLi4vY3J5cHRvL0NyeXB0b1dyYXBwZXIuanNcIlxuaW1wb3J0IHsgQWVzMjU2S2V5IH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS1jcnlwdG9cIlxuaW1wb3J0IHsgY2hlY2tLZXlWZXJzaW9uQ29uc3RyYWludHMsIHBhcnNlS2V5VmVyc2lvbiB9IGZyb20gXCIuL0tleUxvYWRlckZhY2FkZS5qc1wiXG5cbi8qKlxuICogQSBjYWNoZSBmb3IgZGVjcnlwdGVkIGN1cnJlbnQga2V5cyBvZiBlYWNoIGdyb3VwLiBFbmNyeXB0ZWQga2V5cyBhcmUgc3RvcmVkIG9uIG1lbWJlcnNoaXAuc3ltRW5jR0tleS5cbiAqICovXG5leHBvcnQgY2xhc3MgS2V5Q2FjaGUge1xuXHRwcml2YXRlIGN1cnJlbnRHcm91cEtleXM6IE1hcDxJZCwgUHJvbWlzZTxWZXJzaW9uZWRLZXk+PiA9IG5ldyBNYXA8SWQsIFByb21pc2U8VmVyc2lvbmVkS2V5Pj4oKVxuXHQvLyB0aGUgdXNlciBncm91cCBrZXkgaXMgcGFzc3dvcmQgZW5jcnlwdGVkIGFuZCBzdG9yZWQgb24gYSBzcGVjaWFsIG1lbWJlcnNoaXBcblx0Ly8gYWxzbyBpdCBpcyB1c2VkIHRvIGRlY3J5cHQgdGhlIHJlc3Qgb2YgdGhlIGtleXMgdGhlcmVmb3JlIGl0IHJlcXVpcmVzIHNvbWUgc3BlY2lhbCBoYW5kbGluZ1xuXHRwcml2YXRlIGN1cnJlbnRVc2VyR3JvdXBLZXk6IFZlcnNpb25lZEtleSB8IG51bGwgPSBudWxsXG5cdC8vIHRoZSBuZXcgdXNlciBncm91cCBrZXkgd2lsbCBiZSByZS1lbmNyeXB0ZWQgd2l0aCB0aGlzIGtleSB0byBkaXN0cmlidXRlIHRoZSByb3RhdGVkIHVzZXIgZ3JvdXAga2V5IHdpdGhvdXQgYXNraW5nIGZvciB0aGUgcGFzc3dvcmRcblx0cHJpdmF0ZSB1c2VyRGlzdEtleTogQWVzMjU2S2V5IHwgbnVsbCA9IG51bGxcblxuXHRwcml2YXRlIGxlZ2FjeVVzZXJEaXN0S2V5OiBBZXMyNTZLZXkgfCBudWxsID0gbnVsbFxuXG5cdHNldEN1cnJlbnRVc2VyR3JvdXBLZXkobmV3VXNlckdyb3VwS2V5OiBWZXJzaW9uZWRLZXkpIHtcblx0XHRpZiAodGhpcy5jdXJyZW50VXNlckdyb3VwS2V5ICE9IG51bGwgJiYgdGhpcy5jdXJyZW50VXNlckdyb3VwS2V5LnZlcnNpb24gPiBuZXdVc2VyR3JvdXBLZXkudmVyc2lvbikge1xuXHRcdFx0Y29uc29sZS5sb2coXCJUcmllZCB0byBzZXQgYW4gb3V0ZGF0ZWQgdXNlciBncm91cCBrZXlcIilcblx0XHRcdHJldHVyblxuXHRcdH1cblx0XHQvLyB3ZSBuZWVkIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSB2ZXJzaW9ucyByZXR1cm5lZCBmcm9tIHRoZSBzZXJ2ZXIgYXJlIG5vbi1uZWdhdGl2ZSBpbnRlZ2VycywgYmVjYXVzZSB3ZSByZWx5IG9uIHRoYXQgaW4ga2V5IHZlcmlmaWNhdGlvblxuXHRcdGNoZWNrS2V5VmVyc2lvbkNvbnN0cmFpbnRzKG5ld1VzZXJHcm91cEtleS52ZXJzaW9uKVxuXHRcdHRoaXMuY3VycmVudFVzZXJHcm91cEtleSA9IG5ld1VzZXJHcm91cEtleVxuXHR9XG5cblx0Z2V0Q3VycmVudFVzZXJHcm91cEtleSgpOiBWZXJzaW9uZWRLZXkgfCBudWxsIHtcblx0XHRyZXR1cm4gdGhpcy5jdXJyZW50VXNlckdyb3VwS2V5XG5cdH1cblxuXHRzZXRVc2VyRGlzdEtleSh1c2VyRGlzdEtleTogQWVzMjU2S2V5KSB7XG5cdFx0dGhpcy51c2VyRGlzdEtleSA9IHVzZXJEaXN0S2V5XG5cdH1cblxuXHRzZXRMZWdhY3lVc2VyRGlzdEtleShsZWdhY3lVc2VyRGlzdEtleTogQWVzMjU2S2V5KSB7XG5cdFx0dGhpcy5sZWdhY3lVc2VyRGlzdEtleSA9IGxlZ2FjeVVzZXJEaXN0S2V5XG5cdH1cblxuXHRnZXRVc2VyRGlzdEtleSgpOiBBZXMyNTZLZXkgfCBudWxsIHtcblx0XHRyZXR1cm4gdGhpcy51c2VyRGlzdEtleVxuXHR9XG5cblx0Z2V0TGVnYWN5VXNlckRpc3RLZXkoKTogQWVzMjU2S2V5IHwgbnVsbCB7XG5cdFx0cmV0dXJuIHRoaXMubGVnYWN5VXNlckRpc3RLZXlcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gZ3JvdXBJZCBNVVNUIE5PVCBiZSB0aGUgdXNlciBncm91cCBpZFxuXHQgKiBAcGFyYW0ga2V5TG9hZGVyIGEgZnVuY3Rpb24gdG8gbG9hZCBhbmQgZGVjcnlwdCB0aGUgZ3JvdXAga2V5IGlmIGl0IGlzIG5vdCBjYWNoZWRcblx0ICovXG5cdGdldEN1cnJlbnRHcm91cEtleShncm91cElkOiBJZCwga2V5TG9hZGVyOiAoKSA9PiBQcm9taXNlPFZlcnNpb25lZEtleT4pOiBQcm9taXNlPFZlcnNpb25lZEtleT4ge1xuXHRcdHJldHVybiBnZXRGcm9tTWFwKHRoaXMuY3VycmVudEdyb3VwS2V5cywgZ3JvdXBJZCwgYXN5bmMgKCkgPT4ge1xuXHRcdFx0Y29uc3QgbG9hZGVkS2V5ID0gYXdhaXQga2V5TG9hZGVyKClcblx0XHRcdC8vIHdlIG5lZWQgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIHZlcnNpb25zIHJldHVybmVkIGZyb20gdGhlIHNlcnZlciBhcmUgbm9uLW5lZ2F0aXZlIGludGVnZXJzLCBiZWNhdXNlIHdlIHJlbHkgb24gdGhhdCBpbiBrZXkgdmVyaWZpY2F0aW9uXG5cdFx0XHRjaGVja0tleVZlcnNpb25Db25zdHJhaW50cyhsb2FkZWRLZXkudmVyc2lvbilcblx0XHRcdHJldHVybiBsb2FkZWRLZXlcblx0XHR9KVxuXHR9XG5cblx0cmVzZXQoKSB7XG5cdFx0dGhpcy5jdXJyZW50R3JvdXBLZXlzID0gbmV3IE1hcDxJZCwgUHJvbWlzZTxWZXJzaW9uZWRLZXk+PigpXG5cdFx0dGhpcy5jdXJyZW50VXNlckdyb3VwS2V5ID0gbnVsbFxuXHRcdHRoaXMudXNlckRpc3RLZXkgPSBudWxsXG5cdH1cblxuXHQvKipcblx0ICogQ2xlYXJzIGtleXMgZnJvbSB0aGUgY2FjaGUgd2hpY2ggYXJlIG91dGRhdGVkIG9yIHdoZXJlIHdlIGRvIG5vIGxvbmdlciBoYXZhIGEgbWVtYmVyc2hpcC5cblx0ICogQW4gb3V0ZGF0ZWQgdXNlciBtZW1iZXJzaGlwIGlzIGlnbm9yZWQgYW5kIHNob3VsZCBiZSBwcm9jZXNzZWQgYnkgdGhlIFVzZXJHcm91cEtleURpc3RyaWJ1dGlvbiB1cGRhdGUuXG5cdCAqIEBwYXJhbSB1c2VyIHVwZGF0ZWQgdXNlciB3aXRoIHVwLXRvLWRhdGUgbWVtYmVyc2hpcHNcblx0ICovXG5cdGFzeW5jIHJlbW92ZU91dGRhdGVkR3JvdXBLZXlzKHVzZXI6IFVzZXIpIHtcblx0XHRjb25zdCBjdXJyZW50VXNlckdyb3VwS2V5VmVyc2lvbiA9IG5ldmVyTnVsbCh0aGlzLmdldEN1cnJlbnRVc2VyR3JvdXBLZXkoKSkudmVyc2lvblxuXHRcdGNvbnN0IHJlY2VpdmVkVXNlckdyb3VwS2V5VmVyc2lvbiA9IHBhcnNlS2V5VmVyc2lvbih1c2VyLnVzZXJHcm91cC5ncm91cEtleVZlcnNpb24pXG5cdFx0aWYgKHJlY2VpdmVkVXNlckdyb3VwS2V5VmVyc2lvbiA+IGN1cnJlbnRVc2VyR3JvdXBLZXlWZXJzaW9uKSB7XG5cdFx0XHQvL3dlIGp1c3QgaWdub3JlIHRoaXMgYXMgdGhlIHNhbWUgYmF0Y2ggTVVTVCBoYXZlIGEgVXNlckdyb3VwS2V5RGlzdHJpYnV0aW9uIGVudGl0eSBldmVudCB1cGRhdGVcblx0XHRcdGNvbnNvbGUubG9nKGBSZWNlaXZlZCB1c2VyIHVwZGF0ZSB3aXRoIG5ldyB1c2VyIGdyb3VwIGtleSB2ZXJzaW9uOiAke2N1cnJlbnRVc2VyR3JvdXBLZXlWZXJzaW9ufSAtPiAke3JlY2VpdmVkVXNlckdyb3VwS2V5VmVyc2lvbn1gKVxuXHRcdH1cblxuXHRcdGNvbnN0IG5ld0N1cnJlbnRHcm91cEtleUNhY2hlID0gbmV3IE1hcDxJZCwgUHJvbWlzZTxWZXJzaW9uZWRLZXk+PigpXG5cdFx0Zm9yIChjb25zdCBtZW1iZXJzaGlwIG9mIHVzZXIubWVtYmVyc2hpcHMpIHtcblx0XHRcdGNvbnN0IGNhY2hlZEdyb3VwS2V5ID0gdGhpcy5jdXJyZW50R3JvdXBLZXlzLmdldChtZW1iZXJzaGlwLmdyb3VwKVxuXHRcdFx0aWYgKGNhY2hlZEdyb3VwS2V5ICE9IG51bGwgJiYgcGFyc2VLZXlWZXJzaW9uKG1lbWJlcnNoaXAuZ3JvdXBLZXlWZXJzaW9uKSA9PT0gKGF3YWl0IGNhY2hlZEdyb3VwS2V5KS52ZXJzaW9uKSB7XG5cdFx0XHRcdGF3YWl0IGdldEZyb21NYXAobmV3Q3VycmVudEdyb3VwS2V5Q2FjaGUsIG1lbWJlcnNoaXAuZ3JvdXAsICgpID0+IGNhY2hlZEdyb3VwS2V5KVxuXHRcdFx0fVxuXHRcdH1cblx0XHR0aGlzLmN1cnJlbnRHcm91cEtleXMgPSBuZXdDdXJyZW50R3JvdXBLZXlDYWNoZVxuXHR9XG59XG4iLCJpbXBvcnQgeyBVc2VyVHlwZVJlZiB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2VudGl0aWVzL3N5cy9UeXBlUmVmcy5qc1wiXG5pbXBvcnQgeyBBY2NvdW50VHlwZSwgT0ZGTElORV9TVE9SQUdFX0RFRkFVTFRfVElNRV9SQU5HRV9EQVlTIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL1R1dGFub3RhQ29uc3RhbnRzLmpzXCJcbmltcG9ydCB7IGFzc2VydE5vdE51bGwsIERBWV9JTl9NSUxMSVMsIGdyb3VwQnlBbmRNYXAgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB7XG5cdGNvbnN0cnVjdE1haWxTZXRFbnRyeUlkLFxuXHRDVVNUT01fTUFYX0lELFxuXHRlbGVtZW50SWRQYXJ0LFxuXHRmaXJzdEJpZ2dlclRoYW5TZWNvbmQsXG5cdGZpcnN0QmlnZ2VyVGhhblNlY29uZEN1c3RvbUlkLFxuXHRHRU5FUkFURURfTUFYX0lELFxuXHRnZXRFbGVtZW50SWQsXG5cdGxpc3RJZFBhcnQsXG5cdHRpbWVzdGFtcFRvR2VuZXJhdGVkSWQsXG59IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi91dGlscy9FbnRpdHlVdGlscy5qc1wiXG5pbXBvcnQge1xuXHRGaWxlVHlwZVJlZixcblx0TWFpbEJveFR5cGVSZWYsXG5cdE1haWxEZXRhaWxzQmxvYlR5cGVSZWYsXG5cdE1haWxEZXRhaWxzRHJhZnRUeXBlUmVmLFxuXHRNYWlsRm9sZGVyVHlwZVJlZixcblx0TWFpbFNldEVudHJ5VHlwZVJlZixcblx0TWFpbFR5cGVSZWYsXG59IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2VudGl0aWVzL3R1dGFub3RhL1R5cGVSZWZzLmpzXCJcbmltcG9ydCB7IEZvbGRlclN5c3RlbSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9tYWlsL0ZvbGRlclN5c3RlbS5qc1wiXG5pbXBvcnQgeyBPZmZsaW5lU3RvcmFnZSwgT2ZmbGluZVN0b3JhZ2VDbGVhbmVyIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL29mZmxpbmUvT2ZmbGluZVN0b3JhZ2UuanNcIlxuaW1wb3J0IHsgaXNEcmFmdCwgaXNTcGFtT3JUcmFzaEZvbGRlciB9IGZyb20gXCIuLi8uLi9tYWlsL21vZGVsL01haWxDaGVja3MuanNcIlxuXG5leHBvcnQgY2xhc3MgTWFpbE9mZmxpbmVDbGVhbmVyIGltcGxlbWVudHMgT2ZmbGluZVN0b3JhZ2VDbGVhbmVyIHtcblx0YXN5bmMgY2xlYW5PZmZsaW5lRGIob2ZmbGluZVN0b3JhZ2U6IE9mZmxpbmVTdG9yYWdlLCB0aW1lUmFuZ2VEYXlzOiBudW1iZXIgfCBudWxsLCB1c2VySWQ6IElkLCBub3c6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IHVzZXIgPSBhd2FpdCBvZmZsaW5lU3RvcmFnZS5nZXQoVXNlclR5cGVSZWYsIG51bGwsIHVzZXJJZClcblxuXHRcdC8vIEZyZWUgdXNlcnMgYWx3YXlzIGhhdmUgZGVmYXVsdCB0aW1lIHJhbmdlIHJlZ2FyZGxlc3Mgb2Ygd2hhdCBpcyBzdG9yZWRcblx0XHRjb25zdCBpc0ZyZWVVc2VyID0gdXNlcj8uYWNjb3VudFR5cGUgPT09IEFjY291bnRUeXBlLkZSRUVcblx0XHRjb25zdCB0aW1lUmFuZ2UgPSBpc0ZyZWVVc2VyIHx8IHRpbWVSYW5nZURheXMgPT0gbnVsbCA/IE9GRkxJTkVfU1RPUkFHRV9ERUZBVUxUX1RJTUVfUkFOR0VfREFZUyA6IHRpbWVSYW5nZURheXNcblx0XHRjb25zdCBkYXlzU2luY2VEYXlBZnRlckVwb2NoID0gbm93IC8gREFZX0lOX01JTExJUyAtIDFcblx0XHRjb25zdCB0aW1lUmFuZ2VNaWxsaXNTYWZlID0gTWF0aC5taW4oZGF5c1NpbmNlRGF5QWZ0ZXJFcG9jaCwgdGltZVJhbmdlKSAqIERBWV9JTl9NSUxMSVNcblx0XHQvLyBmcm9tIE1heSAxNXRoIDIxMDkgb253YXJkLCBleGNlZWRpbmcgZGF5c1NpbmNlRGF5QWZ0ZXJFcG9jaCBpbiB0aGUgdGltZSByYW5nZSBzZXR0aW5nIHdpbGxcblx0XHQvLyBsZWFkIHRvIGFuIG92ZXJmbG93IGluIG91ciA0MiBiaXQgdGltZXN0YW1wIGluIHRoZSBpZC5cblx0XHRjb25zdCBjdXRvZmZUaW1lc3RhbXAgPSBub3cgLSB0aW1lUmFuZ2VNaWxsaXNTYWZlXG5cblx0XHRjb25zdCBtYWlsQm94ZXMgPSBhd2FpdCBvZmZsaW5lU3RvcmFnZS5nZXRFbGVtZW50c09mVHlwZShNYWlsQm94VHlwZVJlZilcblx0XHRjb25zdCBjdXRvZmZJZCA9IHRpbWVzdGFtcFRvR2VuZXJhdGVkSWQoY3V0b2ZmVGltZXN0YW1wKVxuXHRcdGZvciAoY29uc3QgbWFpbEJveCBvZiBtYWlsQm94ZXMpIHtcblx0XHRcdGNvbnN0IGlzTWFpbHNldE1pZ3JhdGVkID0gbWFpbEJveC5jdXJyZW50TWFpbEJhZyAhPSBudWxsXG5cdFx0XHRjb25zdCBmb2xkZXJzID0gYXdhaXQgb2ZmbGluZVN0b3JhZ2UuZ2V0V2hvbGVMaXN0KE1haWxGb2xkZXJUeXBlUmVmLCBtYWlsQm94LmZvbGRlcnMhLmZvbGRlcnMpXG5cdFx0XHRpZiAoaXNNYWlsc2V0TWlncmF0ZWQpIHtcblx0XHRcdFx0Ly8gRGVsZXRpbmcgTWFpbFNldEVudHJpZXMgZmlyc3QgdG8gbWFrZSBzdXJlIHRoYXQgb25jZSB3ZSBzdGFydCBkZWxldGluZyBNYWlsXG5cdFx0XHRcdC8vIHdlIGRvbid0IGhhdmUgYW55IE1haWxTZXRFbnRyaWVzIHRoYXQgcmVmZXJlbmNlIHRoYXQgTWFpbCBhbnltb3JlLlxuXHRcdFx0XHRjb25zdCBmb2xkZXJTeXN0ZW0gPSBuZXcgRm9sZGVyU3lzdGVtKGZvbGRlcnMpXG5cdFx0XHRcdGZvciAoY29uc3QgbWFpbFNldCBvZiBmb2xkZXJzKSB7XG5cdFx0XHRcdFx0aWYgKGlzU3BhbU9yVHJhc2hGb2xkZXIoZm9sZGVyU3lzdGVtLCBtYWlsU2V0KSkge1xuXHRcdFx0XHRcdFx0YXdhaXQgdGhpcy5kZWxldGVNYWlsU2V0RW50cmllcyhvZmZsaW5lU3RvcmFnZSwgbWFpbFNldC5lbnRyaWVzLCBDVVNUT01fTUFYX0lEKVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRjb25zdCBjdXN0b21DdXRvZmZJZCA9IGNvbnN0cnVjdE1haWxTZXRFbnRyeUlkKG5ldyBEYXRlKGN1dG9mZlRpbWVzdGFtcCksIEdFTkVSQVRFRF9NQVhfSUQpXG5cdFx0XHRcdFx0XHRhd2FpdCB0aGlzLmRlbGV0ZU1haWxTZXRFbnRyaWVzKG9mZmxpbmVTdG9yYWdlLCBtYWlsU2V0LmVudHJpZXMsIGN1c3RvbUN1dG9mZklkKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBUT0RPIE1haWxTZXQgY2xlYW51cFxuXHRcdFx0XHRjb25zdCBtYWlsTGlzdElkcyA9IFttYWlsQm94LmN1cnJlbnRNYWlsQmFnISwgLi4ubWFpbEJveC5hcmNoaXZlZE1haWxCYWdzXS5tYXAoKG1haWxiYWcpID0+IG1haWxiYWcubWFpbHMpXG5cdFx0XHRcdGZvciAoY29uc3QgbWFpbExpc3RJZCBvZiBtYWlsTGlzdElkcykge1xuXHRcdFx0XHRcdGF3YWl0IHRoaXMuZGVsZXRlTWFpbExpc3RMZWdhY3kob2ZmbGluZVN0b3JhZ2UsIG1haWxMaXN0SWQsIGN1dG9mZklkKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFRoaXMgbWV0aG9kIGRlbGV0ZXMgbWFpbHMgZnJvbSB7QHBhcmFtIGxpc3RJZH0gd2hhdCBhcmUgb2xkZXIgdGhhbiB7QHBhcmFtIGN1dG9mZklkfSBhcyB3ZWxsIGFzIGFzc29jaWF0ZWQgZGF0YS5cblx0ICpcblx0ICogaXQncyBjb25zaWRlcmVkIGxlZ2FjeSBiZWNhdXNlIG9uY2Ugd2Ugc3RhcnQgaW1wb3J0aW5nIG1haWwgaW50byBtYWlsIGJhZ3MsIG1haW50YWluaW5nIG1haWwgbGlzdCByYW5nZXMgZG9lc24ndCBtYWtlXG5cdCAqIHNlbnNlIGFueW1vcmUgLSBtYWlsIG9yZGVyIGluIGEgbGlzdCBpcyBhcmJpdHJhcnkgYXQgdGhhdCBwb2ludC5cblx0ICpcblx0ICogRm9yIGVhY2ggbWFpbCB3ZSBkZWxldGUgdGhlIG1haWwsIGl0cyBib2R5LCBoZWFkZXJzLCBhbGwgcmVmZXJlbmNlcyBtYWlsIHNldCBlbnRyaWVzIGFuZCBhbGwgcmVmZXJlbmNlZCBhdHRhY2htZW50cy5cblx0ICpcblx0ICogV2hlbiB3ZSBkZWxldGUgdGhlIEZpbGVzLCB3ZSBhbHNvIGRlbGV0ZSB0aGUgd2hvbGUgcmFuZ2UgZm9yIHRoZSB1c2VyJ3MgRmlsZSBsaXN0LiBXZSBuZWVkIHRvIGRlbGV0ZSB0aGUgd2hvbGVcblx0ICogcmFuZ2UgYmVjYXVzZSB3ZSBvbmx5IGhhdmUgb25lIGZpbGUgbGlzdCBwZXIgbWFpbGJveCwgc28gaWYgd2UgZGVsZXRlIHNvbWV0aGluZyBmcm9tIHRoZSBtaWRkbGUgb2YgaXQsIHRoZSByYW5nZVxuXHQgKiB3aWxsIG5vIGxvbmdlciBiZSB2YWxpZC4gKHRoaXMgaXMgZnV0dXJlIHByb29maW5nLCBiZWNhdXNlIGFzIG9mIG5vdyB0aGVyZSBpcyBub3QgZ29pbmcgdG8gYmUgYSBSYW5nZSBzZXQgZm9yIHRoZVxuXHQgKiBGaWxlIGxpc3QgYW55d2F5LCBzaW5jZSB3ZSBjdXJyZW50bHkgZG8gbm90IGRvIHJhbmdlIHJlcXVlc3RzIGZvciBGaWxlcy5cblx0ICpcblx0ICogV2UgZG8gbm90IGRlbGV0ZSBDb252ZXJzYXRpb25FbnRyaWVzIGJlY2F1c2U6XG5cdCAqICAxLiBUaGV5IGFyZSBpbiB0aGUgc2FtZSBsaXN0IGZvciB0aGUgd2hvbGUgY29udmVyc2F0aW9uIHNvIHdlIGNhbid0IGFkanVzdCB0aGUgcmFuZ2Vcblx0ICogIDIuIFdlIG1pZ2h0IG5lZWQgdGhlbSBpbiB0aGUgZnV0dXJlIGZvciBzaG93aW5nIHRoZSB3aG9sZSB0aHJlYWRcblx0ICovXG5cdHByaXZhdGUgYXN5bmMgZGVsZXRlTWFpbExpc3RMZWdhY3kob2ZmbGluZVN0b3JhZ2U6IE9mZmxpbmVTdG9yYWdlLCBsaXN0SWQ6IElkLCBjdXRvZmZJZDogSWQpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHQvLyBXZSBsb2NrIGFjY2VzcyB0byB0aGUgXCJyYW5nZXNcIiBkYiBoZXJlIGluIG9yZGVyIHRvIHByZXZlbnQgcmFjZSBjb25kaXRpb25zIHdoZW4gYWNjZXNzaW5nIHRoZSBcInJhbmdlc1wiIGRhdGFiYXNlLlxuXHRcdGF3YWl0IG9mZmxpbmVTdG9yYWdlLmxvY2tSYW5nZXNEYkFjY2VzcyhsaXN0SWQpXG5cdFx0dHJ5IHtcblx0XHRcdC8vIFRoaXMgbXVzdCBiZSBkb25lIGJlZm9yZSBkZWxldGluZyBtYWlscyB0byBrbm93IHdoYXQgdGhlIG5ldyByYW5nZSBoYXMgdG8gYmVcblx0XHRcdGF3YWl0IG9mZmxpbmVTdG9yYWdlLnVwZGF0ZVJhbmdlRm9yTGlzdEFuZERlbGV0ZU9ic29sZXRlRGF0YShNYWlsVHlwZVJlZiwgbGlzdElkLCBjdXRvZmZJZClcblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0Ly8gV2UgdW5sb2NrIGFjY2VzcyB0byB0aGUgXCJyYW5nZXNcIiBkYiBoZXJlLiBXZSBsb2NrIGl0IGluIG9yZGVyIHRvIHByZXZlbnQgcmFjZSBjb25kaXRpb25zIHdoZW4gYWNjZXNzaW5nIHRoZSBcInJhbmdlc1wiIGRhdGFiYXNlLlxuXHRcdFx0YXdhaXQgb2ZmbGluZVN0b3JhZ2UudW5sb2NrUmFuZ2VzRGJBY2Nlc3MobGlzdElkKVxuXHRcdH1cblxuXHRcdGNvbnN0IG1haWxzVG9EZWxldGU6IElkVHVwbGVbXSA9IFtdXG5cdFx0Y29uc3QgYXR0YWNobWVudHNUb0RlbGV0ZTogSWRUdXBsZVtdID0gW11cblx0XHRjb25zdCBtYWlsRGV0YWlsc0Jsb2JUb0RlbGV0ZTogSWRUdXBsZVtdID0gW11cblx0XHRjb25zdCBtYWlsRGV0YWlsc0RyYWZ0VG9EZWxldGU6IElkVHVwbGVbXSA9IFtdXG5cblx0XHRjb25zdCBtYWlscyA9IGF3YWl0IG9mZmxpbmVTdG9yYWdlLmdldFdob2xlTGlzdChNYWlsVHlwZVJlZiwgbGlzdElkKVxuXHRcdGZvciAobGV0IG1haWwgb2YgbWFpbHMpIHtcblx0XHRcdGlmIChmaXJzdEJpZ2dlclRoYW5TZWNvbmQoY3V0b2ZmSWQsIGdldEVsZW1lbnRJZChtYWlsKSkpIHtcblx0XHRcdFx0bWFpbHNUb0RlbGV0ZS5wdXNoKG1haWwuX2lkKVxuXHRcdFx0XHRmb3IgKGNvbnN0IGlkIG9mIG1haWwuYXR0YWNobWVudHMpIHtcblx0XHRcdFx0XHRhdHRhY2htZW50c1RvRGVsZXRlLnB1c2goaWQpXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoaXNEcmFmdChtYWlsKSkge1xuXHRcdFx0XHRcdGNvbnN0IG1haWxEZXRhaWxzSWQgPSBhc3NlcnROb3ROdWxsKG1haWwubWFpbERldGFpbHNEcmFmdClcblx0XHRcdFx0XHRtYWlsRGV0YWlsc0RyYWZ0VG9EZWxldGUucHVzaChtYWlsRGV0YWlsc0lkKVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIG1haWxEZXRhaWxzQmxvYlxuXHRcdFx0XHRcdGNvbnN0IG1haWxEZXRhaWxzSWQgPSBhc3NlcnROb3ROdWxsKG1haWwubWFpbERldGFpbHMpXG5cdFx0XHRcdFx0bWFpbERldGFpbHNCbG9iVG9EZWxldGUucHVzaChtYWlsRGV0YWlsc0lkKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGZvciAobGV0IFtsaXN0SWQsIGVsZW1lbnRJZHNdIG9mIGdyb3VwQnlBbmRNYXAobWFpbERldGFpbHNCbG9iVG9EZWxldGUsIGxpc3RJZFBhcnQsIGVsZW1lbnRJZFBhcnQpLmVudHJpZXMoKSkge1xuXHRcdFx0YXdhaXQgb2ZmbGluZVN0b3JhZ2UuZGVsZXRlSW4oTWFpbERldGFpbHNCbG9iVHlwZVJlZiwgbGlzdElkLCBlbGVtZW50SWRzKVxuXHRcdH1cblx0XHRmb3IgKGxldCBbbGlzdElkLCBlbGVtZW50SWRzXSBvZiBncm91cEJ5QW5kTWFwKG1haWxEZXRhaWxzRHJhZnRUb0RlbGV0ZSwgbGlzdElkUGFydCwgZWxlbWVudElkUGFydCkuZW50cmllcygpKSB7XG5cdFx0XHRhd2FpdCBvZmZsaW5lU3RvcmFnZS5kZWxldGVJbihNYWlsRGV0YWlsc0RyYWZ0VHlwZVJlZiwgbGlzdElkLCBlbGVtZW50SWRzKVxuXHRcdH1cblx0XHRmb3IgKGxldCBbbGlzdElkLCBlbGVtZW50SWRzXSBvZiBncm91cEJ5QW5kTWFwKGF0dGFjaG1lbnRzVG9EZWxldGUsIGxpc3RJZFBhcnQsIGVsZW1lbnRJZFBhcnQpLmVudHJpZXMoKSkge1xuXHRcdFx0YXdhaXQgb2ZmbGluZVN0b3JhZ2UuZGVsZXRlSW4oRmlsZVR5cGVSZWYsIGxpc3RJZCwgZWxlbWVudElkcylcblx0XHRcdGF3YWl0IG9mZmxpbmVTdG9yYWdlLmRlbGV0ZVJhbmdlKEZpbGVUeXBlUmVmLCBsaXN0SWQpXG5cdFx0fVxuXG5cdFx0YXdhaXQgb2ZmbGluZVN0b3JhZ2UuZGVsZXRlSW4oTWFpbFR5cGVSZWYsIGxpc3RJZCwgbWFpbHNUb0RlbGV0ZS5tYXAoZWxlbWVudElkUGFydCkpXG5cdH1cblxuXHQvKipcblx0ICogZGVsZXRlIGFsbCBtYWlsIHNldCBlbnRyaWVzIG9mIGEgbWFpbCBzZXQgdGhhdCByZWZlcmVuY2Ugc29tZSBtYWlsIHdpdGggYSByZWNlaXZlZERhdGUgb2xkZXIgdGhhblxuXHQgKiBjdXRvZmZUaW1lc3RhbXAuIHRoaXMgZG9lc24ndCBjbGVhbiB1cCBtYWlscyBvciB0aGVpciBhc3NvY2lhdGVkIGRhdGEgYmVjYXVzZSB3ZSBjb3VsZCBiZSBicmVha2luZyB0aGVcblx0ICogb2ZmbGluZSBsaXN0IHJhbmdlIGludmFyaWFudCBieSBkZWxldGluZyBkYXRhIGZyb20gdGhlIG1pZGRsZSBvZiBhIG1haWwgcmFuZ2UuIGNsZWFuaW5nIHVwIG1haWxzIGlzIGRvbmVcblx0ICogdGhlIGxlZ2FjeSB3YXkgY3VycmVudGx5IGV2ZW4gZm9yIG1haWxzZXQgdXNlcnMuXG5cdCAqL1xuXHRwcml2YXRlIGFzeW5jIGRlbGV0ZU1haWxTZXRFbnRyaWVzKG9mZmxpbmVTdG9yYWdlOiBPZmZsaW5lU3RvcmFnZSwgZW50cmllc0xpc3RJZDogSWQsIGN1dG9mZklkOiBJZCkge1xuXHRcdGF3YWl0IG9mZmxpbmVTdG9yYWdlLmxvY2tSYW5nZXNEYkFjY2VzcyhlbnRyaWVzTGlzdElkKVxuXHRcdHRyeSB7XG5cdFx0XHRhd2FpdCBvZmZsaW5lU3RvcmFnZS51cGRhdGVSYW5nZUZvckxpc3RBbmREZWxldGVPYnNvbGV0ZURhdGEoTWFpbFNldEVudHJ5VHlwZVJlZiwgZW50cmllc0xpc3RJZCwgY3V0b2ZmSWQpXG5cdFx0fSBmaW5hbGx5IHtcblx0XHRcdC8vIFdlIHVubG9jayBhY2Nlc3MgdG8gdGhlIFwicmFuZ2VzXCIgZGIgaGVyZS4gV2UgbG9jayBpdCBpbiBvcmRlciB0byBwcmV2ZW50IHJhY2UgY29uZGl0aW9ucyB3aGVuIGFjY2Vzc2luZyB0aGUgXCJyYW5nZXNcIiBkYXRhYmFzZS5cblx0XHRcdGF3YWl0IG9mZmxpbmVTdG9yYWdlLnVubG9ja1Jhbmdlc0RiQWNjZXNzKGVudHJpZXNMaXN0SWQpXG5cdFx0fVxuXG5cdFx0Y29uc3QgbWFpbFNldEVudHJpZXNUb0RlbGV0ZTogSWRUdXBsZVtdID0gW11cblx0XHRjb25zdCBtYWlsU2V0RW50cmllcyA9IGF3YWl0IG9mZmxpbmVTdG9yYWdlLmdldFdob2xlTGlzdChNYWlsU2V0RW50cnlUeXBlUmVmLCBlbnRyaWVzTGlzdElkKVxuXHRcdGZvciAobGV0IG1haWxTZXRFbnRyeSBvZiBtYWlsU2V0RW50cmllcykge1xuXHRcdFx0aWYgKGZpcnN0QmlnZ2VyVGhhblNlY29uZEN1c3RvbUlkKGN1dG9mZklkLCBnZXRFbGVtZW50SWQobWFpbFNldEVudHJ5KSkpIHtcblx0XHRcdFx0bWFpbFNldEVudHJpZXNUb0RlbGV0ZS5wdXNoKG1haWxTZXRFbnRyeS5faWQpXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0YXdhaXQgb2ZmbGluZVN0b3JhZ2UuZGVsZXRlSW4oTWFpbFNldEVudHJ5VHlwZVJlZiwgZW50cmllc0xpc3RJZCwgbWFpbFNldEVudHJpZXNUb0RlbGV0ZS5tYXAoZWxlbWVudElkUGFydCkpXG5cdH1cbn1cbiIsImltcG9ydCB7IGFzc2VydFdvcmtlck9yTm9kZSB9IGZyb20gXCIuLi8uLi9jb21tb24vRW52XCJcbmltcG9ydCB7XG5cdEFlc0tleSxcblx0QXN5bW1ldHJpY0tleVBhaXIsXG5cdEFzeW1tZXRyaWNQdWJsaWNLZXksXG5cdGJpdEFycmF5VG9VaW50OEFycmF5LFxuXHRFY2NLZXlQYWlyLFxuXHRFY2NQdWJsaWNLZXksXG5cdGhleFRvUnNhUHVibGljS2V5LFxuXHRpc1BxS2V5UGFpcnMsXG5cdGlzUHFQdWJsaWNLZXksXG5cdGlzUnNhRWNjS2V5UGFpcixcblx0aXNSc2FPclJzYUVjY0tleVBhaXIsXG5cdGlzUnNhUHVibGljS2V5LFxuXHRLZXlQYWlyVHlwZSxcblx0UFFQdWJsaWNLZXlzLFxuXHRSc2FQcml2YXRlS2V5LFxuXHR1aW50OEFycmF5VG9CaXRBcnJheSxcbn0gZnJvbSBcIkB0dXRhby90dXRhbm90YS1jcnlwdG9cIlxuaW1wb3J0IHR5cGUgeyBSc2FJbXBsZW1lbnRhdGlvbiB9IGZyb20gXCIuL1JzYUltcGxlbWVudGF0aW9uXCJcbmltcG9ydCB7IFBRRmFjYWRlIH0gZnJvbSBcIi4uL2ZhY2FkZXMvUFFGYWNhZGUuanNcIlxuaW1wb3J0IHsgQ3J5cHRvRXJyb3IgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLWNyeXB0by9lcnJvci5qc1wiXG5pbXBvcnQgeyBhc0NyeXB0b1Byb3Rvb2NvbFZlcnNpb24sIENyeXB0b1Byb3RvY29sVmVyc2lvbiwgRW5jcnlwdGlvbkF1dGhTdGF0dXMgfSBmcm9tIFwiLi4vLi4vY29tbW9uL1R1dGFub3RhQ29uc3RhbnRzLmpzXCJcbmltcG9ydCB7IGFycmF5RXF1YWxzLCBhc3NlcnROb3ROdWxsLCB1aW50OEFycmF5VG9IZXgsIFZlcnNpb25lZCB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHsgS2V5TG9hZGVyRmFjYWRlLCBwYXJzZUtleVZlcnNpb24gfSBmcm9tIFwiLi4vZmFjYWRlcy9LZXlMb2FkZXJGYWNhZGUuanNcIlxuaW1wb3J0IHsgUHJvZ3JhbW1pbmdFcnJvciB9IGZyb20gXCIuLi8uLi9jb21tb24vZXJyb3IvUHJvZ3JhbW1pbmdFcnJvci5qc1wiXG5pbXBvcnQgeyBjcmVhdGVQdWJsaWNLZXlQdXRJbiwgUHViRW5jS2V5RGF0YSB9IGZyb20gXCIuLi8uLi9lbnRpdGllcy9zeXMvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgQ3J5cHRvV3JhcHBlciB9IGZyb20gXCIuL0NyeXB0b1dyYXBwZXIuanNcIlxuaW1wb3J0IHsgUHVibGljS2V5U2VydmljZSB9IGZyb20gXCIuLi8uLi9lbnRpdGllcy9zeXMvU2VydmljZXMuanNcIlxuaW1wb3J0IHsgSVNlcnZpY2VFeGVjdXRvciB9IGZyb20gXCIuLi8uLi9jb21tb24vU2VydmljZVJlcXVlc3QuanNcIlxuaW1wb3J0IHsgUHVibGljS2V5SWRlbnRpZmllciwgUHVibGljS2V5UHJvdmlkZXIsIFB1YmxpY0tleXMgfSBmcm9tIFwiLi4vZmFjYWRlcy9QdWJsaWNLZXlQcm92aWRlci5qc1wiXG5pbXBvcnQgeyBLZXlWZXJzaW9uIH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlscy9kaXN0L1V0aWxzLmpzXCJcblxuYXNzZXJ0V29ya2VyT3JOb2RlKClcblxuZXhwb3J0IHR5cGUgRGVjYXBzdWxhdGVkQWVzS2V5ID0ge1xuXHRkZWNyeXB0ZWRBZXNLZXk6IEFlc0tleVxuXHRzZW5kZXJJZGVudGl0eVB1YktleTogRWNjUHVibGljS2V5IHwgbnVsbCAvLyBmb3IgYXV0aGVudGljYXRpb246IG51bGwgZm9yIHJzYSBvbmx5XG59XG5cbmV4cG9ydCB0eXBlIFB1YkVuY1N5bUtleSA9IHtcblx0cHViRW5jU3ltS2V5Qnl0ZXM6IFVpbnQ4QXJyYXlcblx0Y3J5cHRvUHJvdG9jb2xWZXJzaW9uOiBDcnlwdG9Qcm90b2NvbFZlcnNpb25cblx0c2VuZGVyS2V5VmVyc2lvbjogS2V5VmVyc2lvbiB8IG51bGxcblx0cmVjaXBpZW50S2V5VmVyc2lvbjogS2V5VmVyc2lvblxufVxuXG4vKipcbiAqIFRoaXMgY2xhc3MgaXMgcmVzcG9uc2libGUgZm9yIGFzeW1tZXRyaWMgZW5jcnlwdGlvbiBhbmQgZGVjcnlwdGlvbi5cbiAqIEl0IHRyaWVzIHRvIGhpZGUgdGhlIGNvbXBsZXhpdHkgYmVoaW5kIGhhbmRsaW5nIGRpZmZlcmVudCBhc3ltbWV0cmljIHByb3RvY29sIHZlcnNpb25zIHN1Y2ggYXMgUlNBIGFuZCBUdXRhQ3J5cHQuXG4gKi9cbmV4cG9ydCBjbGFzcyBBc3ltbWV0cmljQ3J5cHRvRmFjYWRlIHtcblx0Y29uc3RydWN0b3IoXG5cdFx0cHJpdmF0ZSByZWFkb25seSByc2E6IFJzYUltcGxlbWVudGF0aW9uLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgcHFGYWNhZGU6IFBRRmFjYWRlLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkga2V5TG9hZGVyRmFjYWRlOiBLZXlMb2FkZXJGYWNhZGUsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBjcnlwdG9XcmFwcGVyOiBDcnlwdG9XcmFwcGVyLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgc2VydmljZUV4ZWN1dG9yOiBJU2VydmljZUV4ZWN1dG9yLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgcHVibGljS2V5UHJvdmlkZXI6IFB1YmxpY0tleVByb3ZpZGVyLFxuXHQpIHt9XG5cblx0LyoqXG5cdCAqIFZlcmlmaWVzIHdoZXRoZXIgdGhlIGtleSB0aGF0IHRoZSBwdWJsaWMga2V5IHNlcnZpY2UgcmV0dXJucyBpcyB0aGUgc2FtZSBhcyB0aGUgb25lIHVzZWQgZm9yIGVuY3J5cHRpb24uXG5cdCAqIFdoZW4gd2UgaGF2ZSBrZXkgdmVyaWZpY2F0aW9uIHdlIHNob3VsZCBzdG9wIHZlcmlmeWluZyBhZ2FpbnN0IHRoZSBQdWJsaWNLZXlTZXJ2aWNlIGJ1dCBhZ2FpbnN0IHRoZSB2ZXJpZmllZCBrZXkuXG5cdCAqXG5cdCAqIEBwYXJhbSBpZGVudGlmaWVyIHRoZSBpZGVudGlmaWVyIHRvIGxvYWQgdGhlIHB1YmxpYyBrZXkgdG8gdmVyaWZ5IHRoYXQgaXQgbWF0Y2hlcyB0aGUgb25lIHVzZWQgaW4gdGhlIHByb3RvY29sIHJ1bi5cblx0ICogQHBhcmFtIHNlbmRlcklkZW50aXR5UHViS2V5IHRoZSBzZW5kZXJJZGVudGl0eVB1YktleSB0aGF0IHdhcyB1c2VkIHRvIGVuY3J5cHQvYXV0aGVudGljYXRlIHRoZSBkYXRhLlxuXHQgKiBAcGFyYW0gc2VuZGVyS2V5VmVyc2lvbiB0aGUgdmVyc2lvbiBvZiB0aGUgc2VuZGVySWRlbnRpdHlQdWJLZXkuXG5cdCAqL1xuXHRhc3luYyBhdXRoZW50aWNhdGVTZW5kZXIoaWRlbnRpZmllcjogUHVibGljS2V5SWRlbnRpZmllciwgc2VuZGVySWRlbnRpdHlQdWJLZXk6IFVpbnQ4QXJyYXksIHNlbmRlcktleVZlcnNpb246IEtleVZlcnNpb24pOiBQcm9taXNlPEVuY3J5cHRpb25BdXRoU3RhdHVzPiB7XG5cdFx0Y29uc3QgcHVibGljS2V5cyA9IGF3YWl0IHRoaXMucHVibGljS2V5UHJvdmlkZXIubG9hZFZlcnNpb25lZFB1YktleShpZGVudGlmaWVyLCBzZW5kZXJLZXlWZXJzaW9uKVxuXHRcdHJldHVybiBwdWJsaWNLZXlzLnB1YkVjY0tleSAhPSBudWxsICYmIGFycmF5RXF1YWxzKHB1YmxpY0tleXMucHViRWNjS2V5LCBzZW5kZXJJZGVudGl0eVB1YktleSlcblx0XHRcdD8gRW5jcnlwdGlvbkF1dGhTdGF0dXMuVFVUQUNSWVBUX0FVVEhFTlRJQ0FUSU9OX1NVQ0NFRURFRFxuXHRcdFx0OiBFbmNyeXB0aW9uQXV0aFN0YXR1cy5UVVRBQ1JZUFRfQVVUSEVOVElDQVRJT05fRkFJTEVEXG5cdH1cblxuXHQvKipcblx0ICogRGVjcnlwdHMgdGhlIHB1YkVuY1N5bUtleSB3aXRoIHRoZSByZWNpcGllbnRLZXlQYWlyIGFuZCBhdXRoZW50aWNhdGVzIGl0IGlmIHRoZSBwcm90b2NvbCBzdXBwb3J0cyBhdXRoZW50aWNhdGlvbi5cblx0ICogSWYgdGhlIHByb3RvY29sIGRvZXMgbm90IHN1cHBvcnQgYXV0aGVudGljYXRpb24gdGhpcyBtZXRob2Qgd2lsbCBvbmx5IGRlY3J5cHQuXG5cdCAqIEBwYXJhbSByZWNpcGllbnRLZXlQYWlyIHRoZSByZWNpcGllbnRLZXlQYWlyLiBNdXN0IG1hdGNoIHRoZSBjcnlwdG9Qcm90b2NvbFZlcnNpb24gYW5kIG11c3QgYmUgb2YgdGhlIHJlcXVpcmVkIHJlY2lwaWVudEtleVZlcnNpb24uXG5cdCAqIEBwYXJhbSBwdWJFbmNLZXlEYXRhIHRoZSBlbmNyeXB0ZWQgc3ltS2V5IHdpdGggdGhlIG1ldGFkYXRhICh2ZXJzaW9ucywgZ3JvdXAgaWRlbnRpZmllciBldGMuKSBmb3IgZGVjcnlwdGlvbiBhbmQgYXV0aGVudGljYXRpb24uXG5cdCAqIEBwYXJhbSBzZW5kZXJJZGVudGlmaWVyIHRoZSBpZGVudGlmaWVyIGZvciB0aGUgc2VuZGVyJ3Mga2V5IGdyb3VwXG5cdCAqIEB0aHJvd3MgQ3J5cHRvRXJyb3IgaW4gY2FzZSB0aGUgYXV0aGVudGljYXRpb24gZmFpbHMuXG5cdCAqL1xuXHRhc3luYyBkZWNyeXB0U3ltS2V5V2l0aEtleVBhaXJBbmRBdXRoZW50aWNhdGUoXG5cdFx0cmVjaXBpZW50S2V5UGFpcjogQXN5bW1ldHJpY0tleVBhaXIsXG5cdFx0cHViRW5jS2V5RGF0YTogUHViRW5jS2V5RGF0YSxcblx0XHRzZW5kZXJJZGVudGlmaWVyOiBQdWJsaWNLZXlJZGVudGlmaWVyLFxuXHQpOiBQcm9taXNlPERlY2Fwc3VsYXRlZEFlc0tleT4ge1xuXHRcdGNvbnN0IGNyeXB0b1Byb3RvY29sVmVyc2lvbiA9IGFzQ3J5cHRvUHJvdG9vY29sVmVyc2lvbihwdWJFbmNLZXlEYXRhLnByb3RvY29sVmVyc2lvbilcblx0XHRjb25zdCBkZWNhcHN1bGF0ZWRBZXNLZXkgPSBhd2FpdCB0aGlzLmRlY3J5cHRTeW1LZXlXaXRoS2V5UGFpcihyZWNpcGllbnRLZXlQYWlyLCBjcnlwdG9Qcm90b2NvbFZlcnNpb24sIHB1YkVuY0tleURhdGEucHViRW5jU3ltS2V5KVxuXHRcdGlmIChjcnlwdG9Qcm90b2NvbFZlcnNpb24gPT09IENyeXB0b1Byb3RvY29sVmVyc2lvbi5UVVRBX0NSWVBUKSB7XG5cdFx0XHRjb25zdCBlbmNyeXB0aW9uQXV0aFN0YXR1cyA9IGF3YWl0IHRoaXMuYXV0aGVudGljYXRlU2VuZGVyKFxuXHRcdFx0XHRzZW5kZXJJZGVudGlmaWVyLFxuXHRcdFx0XHRhc3NlcnROb3ROdWxsKGRlY2Fwc3VsYXRlZEFlc0tleS5zZW5kZXJJZGVudGl0eVB1YktleSksXG5cdFx0XHRcdHBhcnNlS2V5VmVyc2lvbihhc3NlcnROb3ROdWxsKHB1YkVuY0tleURhdGEuc2VuZGVyS2V5VmVyc2lvbikpLFxuXHRcdFx0KVxuXHRcdFx0aWYgKGVuY3J5cHRpb25BdXRoU3RhdHVzICE9PSBFbmNyeXB0aW9uQXV0aFN0YXR1cy5UVVRBQ1JZUFRfQVVUSEVOVElDQVRJT05fU1VDQ0VFREVEKSB7XG5cdFx0XHRcdHRocm93IG5ldyBDcnlwdG9FcnJvcihcInRoZSBwcm92aWRlZCBwdWJsaWMga2V5IGNvdWxkIG5vdCBiZSBhdXRoZW50aWNhdGVkXCIpXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBkZWNhcHN1bGF0ZWRBZXNLZXlcblx0fVxuXG5cdC8qKlxuXHQgKiBEZWNyeXB0cyB0aGUgcHViRW5jU3ltS2V5IHdpdGggdGhlIHJlY2lwaWVudEtleVBhaXIuXG5cdCAqIEBwYXJhbSBwdWJFbmNTeW1LZXkgdGhlIGFzeW1tZXRyaWNhbGx5IGVuY3J5cHRlZCBzZXNzaW9uIGtleVxuXHQgKiBAcGFyYW0gY3J5cHRvUHJvdG9jb2xWZXJzaW9uIGFzeW1tZXRyaWMgcHJvdG9jb2wgdG8gZGVjcnlwdCBwdWJFbmNTeW1LZXkgKFJTQSBvciBUdXRhQ3J5cHQpXG5cdCAqIEBwYXJhbSByZWNpcGllbnRLZXlQYWlyIHRoZSByZWNpcGllbnRLZXlQYWlyLiBNdXN0IG1hdGNoIHRoZSBjcnlwdG9Qcm90b2NvbFZlcnNpb24uXG5cdCAqL1xuXHRhc3luYyBkZWNyeXB0U3ltS2V5V2l0aEtleVBhaXIoXG5cdFx0cmVjaXBpZW50S2V5UGFpcjogQXN5bW1ldHJpY0tleVBhaXIsXG5cdFx0Y3J5cHRvUHJvdG9jb2xWZXJzaW9uOiBDcnlwdG9Qcm90b2NvbFZlcnNpb24sXG5cdFx0cHViRW5jU3ltS2V5OiBVaW50OEFycmF5LFxuXHQpOiBQcm9taXNlPERlY2Fwc3VsYXRlZEFlc0tleT4ge1xuXHRcdHN3aXRjaCAoY3J5cHRvUHJvdG9jb2xWZXJzaW9uKSB7XG5cdFx0XHRjYXNlIENyeXB0b1Byb3RvY29sVmVyc2lvbi5SU0E6IHtcblx0XHRcdFx0aWYgKCFpc1JzYU9yUnNhRWNjS2V5UGFpcihyZWNpcGllbnRLZXlQYWlyKSkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBDcnlwdG9FcnJvcihcIndyb25nIGtleSB0eXBlLiBleHBlY3RlZCByc2EuIGdvdCBcIiArIHJlY2lwaWVudEtleVBhaXIua2V5UGFpclR5cGUpXG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uc3QgcHJpdmF0ZUtleTogUnNhUHJpdmF0ZUtleSA9IHJlY2lwaWVudEtleVBhaXIucHJpdmF0ZUtleVxuXHRcdFx0XHRjb25zdCBkZWNyeXB0ZWRTeW1LZXkgPSBhd2FpdCB0aGlzLnJzYS5kZWNyeXB0KHByaXZhdGVLZXksIHB1YkVuY1N5bUtleSlcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRkZWNyeXB0ZWRBZXNLZXk6IHVpbnQ4QXJyYXlUb0JpdEFycmF5KGRlY3J5cHRlZFN5bUtleSksXG5cdFx0XHRcdFx0c2VuZGVySWRlbnRpdHlQdWJLZXk6IG51bGwsXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGNhc2UgQ3J5cHRvUHJvdG9jb2xWZXJzaW9uLlRVVEFfQ1JZUFQ6IHtcblx0XHRcdFx0aWYgKCFpc1BxS2V5UGFpcnMocmVjaXBpZW50S2V5UGFpcikpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgQ3J5cHRvRXJyb3IoXCJ3cm9uZyBrZXkgdHlwZS4gZXhwZWN0ZWQgVHV0YUNyeXB0LiBnb3QgXCIgKyByZWNpcGllbnRLZXlQYWlyLmtleVBhaXJUeXBlKVxuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IHsgZGVjcnlwdGVkU3ltS2V5Qnl0ZXMsIHNlbmRlcklkZW50aXR5UHViS2V5IH0gPSBhd2FpdCB0aGlzLnBxRmFjYWRlLmRlY2Fwc3VsYXRlRW5jb2RlZChwdWJFbmNTeW1LZXksIHJlY2lwaWVudEtleVBhaXIpXG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0ZGVjcnlwdGVkQWVzS2V5OiB1aW50OEFycmF5VG9CaXRBcnJheShkZWNyeXB0ZWRTeW1LZXlCeXRlcyksXG5cdFx0XHRcdFx0c2VuZGVySWRlbnRpdHlQdWJLZXksXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHRocm93IG5ldyBDcnlwdG9FcnJvcihcImludmFsaWQgY3J5cHRvUHJvdG9jb2xWZXJzaW9uOiBcIiArIGNyeXB0b1Byb3RvY29sVmVyc2lvbilcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogTG9hZHMgdGhlIHJlY2lwaWVudCBrZXkgcGFpciBpbiB0aGUgcmVxdWlyZWQgdmVyc2lvbiBhbmQgZGVjcnlwdHMgdGhlIHB1YkVuY1N5bUtleSB3aXRoIGl0LlxuXHQgKi9cblx0YXN5bmMgbG9hZEtleVBhaXJBbmREZWNyeXB0U3ltS2V5KFxuXHRcdHJlY2lwaWVudEtleVBhaXJHcm91cElkOiBJZCxcblx0XHRyZWNpcGllbnRLZXlWZXJzaW9uOiBLZXlWZXJzaW9uLFxuXHRcdGNyeXB0b1Byb3RvY29sVmVyc2lvbjogQ3J5cHRvUHJvdG9jb2xWZXJzaW9uLFxuXHRcdHB1YkVuY1N5bUtleTogVWludDhBcnJheSxcblx0KTogUHJvbWlzZTxEZWNhcHN1bGF0ZWRBZXNLZXk+IHtcblx0XHRjb25zdCBrZXlQYWlyOiBBc3ltbWV0cmljS2V5UGFpciA9IGF3YWl0IHRoaXMua2V5TG9hZGVyRmFjYWRlLmxvYWRLZXlwYWlyKHJlY2lwaWVudEtleVBhaXJHcm91cElkLCByZWNpcGllbnRLZXlWZXJzaW9uKVxuXHRcdHJldHVybiBhd2FpdCB0aGlzLmRlY3J5cHRTeW1LZXlXaXRoS2V5UGFpcihrZXlQYWlyLCBjcnlwdG9Qcm90b2NvbFZlcnNpb24sIHB1YkVuY1N5bUtleSlcblx0fVxuXG5cdC8qKlxuXHQgKiBFbmNyeXB0cyB0aGUgc3ltS2V5IGFzeW1tZXRyaWNhbGx5IHdpdGggdGhlIHByb3ZpZGVkIHB1YmxpYyBrZXlzLlxuXHQgKiBAcGFyYW0gc3ltS2V5IHRoZSBzeW1tZXRyaWMga2V5ICB0byBiZSBlbmNyeXB0ZWRcblx0ICogQHBhcmFtIHJlY2lwaWVudFB1YmxpY0tleXMgdGhlIHB1YmxpYyBrZXkocykgb2YgdGhlIHJlY2lwaWVudCBpbiB0aGUgY3VycmVudCB2ZXJzaW9uXG5cdCAqIEBwYXJhbSBzZW5kZXJHcm91cElkIHRoZSBncm91cCBpZCBvZiB0aGUgc2VuZGVyLiB3aWxsIG9ubHkgYmUgdXNlZCBpbiBjYXNlIHdlIGFsc28gbmVlZCB0aGUgc2VuZGVyJ3Mga2V5IHBhaXIsIGUuZy4gd2l0aCBUdXRhQ3J5cHQuXG5cdCAqL1xuXHRhc3luYyBhc3ltRW5jcnlwdFN5bUtleShzeW1LZXk6IEFlc0tleSwgcmVjaXBpZW50UHVibGljS2V5czogVmVyc2lvbmVkPFB1YmxpY0tleXM+LCBzZW5kZXJHcm91cElkOiBJZCk6IFByb21pc2U8UHViRW5jU3ltS2V5PiB7XG5cdFx0Y29uc3QgcmVjaXBpZW50UHVibGljS2V5ID0gdGhpcy5leHRyYWN0UmVjaXBpZW50UHVibGljS2V5KHJlY2lwaWVudFB1YmxpY0tleXMub2JqZWN0KVxuXHRcdGNvbnN0IGtleVBhaXJUeXBlID0gcmVjaXBpZW50UHVibGljS2V5LmtleVBhaXJUeXBlXG5cblx0XHRpZiAoaXNQcVB1YmxpY0tleShyZWNpcGllbnRQdWJsaWNLZXkpKSB7XG5cdFx0XHRjb25zdCBzZW5kZXJLZXlQYWlyID0gYXdhaXQgdGhpcy5rZXlMb2FkZXJGYWNhZGUubG9hZEN1cnJlbnRLZXlQYWlyKHNlbmRlckdyb3VwSWQpXG5cdFx0XHRjb25zdCBzZW5kZXJFY2NLZXlQYWlyID0gYXdhaXQgdGhpcy5nZXRPck1ha2VTZW5kZXJJZGVudGl0eUtleVBhaXIoc2VuZGVyS2V5UGFpci5vYmplY3QsIHNlbmRlckdyb3VwSWQpXG5cdFx0XHRyZXR1cm4gdGhpcy50dXRhQ3J5cHRFbmNyeXB0U3ltS2V5SW1wbCh7IG9iamVjdDogcmVjaXBpZW50UHVibGljS2V5LCB2ZXJzaW9uOiByZWNpcGllbnRQdWJsaWNLZXlzLnZlcnNpb24gfSwgc3ltS2V5LCB7XG5cdFx0XHRcdG9iamVjdDogc2VuZGVyRWNjS2V5UGFpcixcblx0XHRcdFx0dmVyc2lvbjogc2VuZGVyS2V5UGFpci52ZXJzaW9uLFxuXHRcdFx0fSlcblx0XHR9IGVsc2UgaWYgKGlzUnNhUHVibGljS2V5KHJlY2lwaWVudFB1YmxpY0tleSkpIHtcblx0XHRcdGNvbnN0IHB1YkVuY1N5bUtleUJ5dGVzID0gYXdhaXQgdGhpcy5yc2EuZW5jcnlwdChyZWNpcGllbnRQdWJsaWNLZXksIGJpdEFycmF5VG9VaW50OEFycmF5KHN5bUtleSkpXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRwdWJFbmNTeW1LZXlCeXRlcyxcblx0XHRcdFx0Y3J5cHRvUHJvdG9jb2xWZXJzaW9uOiBDcnlwdG9Qcm90b2NvbFZlcnNpb24uUlNBLFxuXHRcdFx0XHRzZW5kZXJLZXlWZXJzaW9uOiBudWxsLFxuXHRcdFx0XHRyZWNpcGllbnRLZXlWZXJzaW9uOiByZWNpcGllbnRQdWJsaWNLZXlzLnZlcnNpb24sXG5cdFx0XHR9XG5cdFx0fVxuXHRcdHRocm93IG5ldyBDcnlwdG9FcnJvcihcInVua25vd24gcHVibGljIGtleSB0eXBlOiBcIiArIGtleVBhaXJUeXBlKVxuXHR9XG5cblx0LyoqXG5cdCAqIEVuY3J5cHRzIHRoZSBzeW1LZXkgYXN5bW1ldHJpY2FsbHkgd2l0aCB0aGUgcHJvdmlkZWQgcHVibGljIGtleXMgdXNpbmcgdGhlIFR1dGFDcnlwdCBwcm90b2NvbC5cblx0ICogQHBhcmFtIHN5bUtleSB0aGUga2V5IHRvIGJlIGVuY3J5cHRlZFxuXHQgKiBAcGFyYW0gcmVjaXBpZW50UHVibGljS2V5cyBNVVNUIGJlIGEgcHEga2V5IHBhaXJcblx0ICogQHBhcmFtIHNlbmRlckVjY0tleVBhaXIgdGhlIHNlbmRlcidzIGtleSBwYWlyIChuZWVkZWQgZm9yIGF1dGhlbnRpY2F0aW9uKVxuXHQgKiBAdGhyb3dzIFByb2dyYW1taW5nRXJyb3IgaWYgdGhlIHJlY2lwaWVudFB1YmxpY0tleXMgYXJlIG5vdCBzdWl0YWJsZSBmb3IgVHV0YUNyeXB0XG5cdCAqL1xuXHRhc3luYyB0dXRhQ3J5cHRFbmNyeXB0U3ltS2V5KHN5bUtleTogQWVzS2V5LCByZWNpcGllbnRQdWJsaWNLZXlzOiBWZXJzaW9uZWQ8UHVibGljS2V5cz4sIHNlbmRlckVjY0tleVBhaXI6IFZlcnNpb25lZDxFY2NLZXlQYWlyPik6IFByb21pc2U8UHViRW5jU3ltS2V5PiB7XG5cdFx0Y29uc3QgcmVjaXBpZW50UHVibGljS2V5ID0gdGhpcy5leHRyYWN0UmVjaXBpZW50UHVibGljS2V5KHJlY2lwaWVudFB1YmxpY0tleXMub2JqZWN0KVxuXHRcdGlmICghaXNQcVB1YmxpY0tleShyZWNpcGllbnRQdWJsaWNLZXkpKSB7XG5cdFx0XHR0aHJvdyBuZXcgUHJvZ3JhbW1pbmdFcnJvcihcInRoZSByZWNpcGllbnQgZG9lcyBub3QgaGF2ZSBwcSBrZXkgcGFpcnNcIilcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMudHV0YUNyeXB0RW5jcnlwdFN5bUtleUltcGwoXG5cdFx0XHR7XG5cdFx0XHRcdG9iamVjdDogcmVjaXBpZW50UHVibGljS2V5LFxuXHRcdFx0XHR2ZXJzaW9uOiByZWNpcGllbnRQdWJsaWNLZXlzLnZlcnNpb24sXG5cdFx0XHR9LFxuXHRcdFx0c3ltS2V5LFxuXHRcdFx0c2VuZGVyRWNjS2V5UGFpcixcblx0XHQpXG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIHR1dGFDcnlwdEVuY3J5cHRTeW1LZXlJbXBsKFxuXHRcdHJlY2lwaWVudFB1YmxpY0tleTogVmVyc2lvbmVkPFBRUHVibGljS2V5cz4sXG5cdFx0c3ltS2V5OiBBZXNLZXksXG5cdFx0c2VuZGVyRWNjS2V5UGFpcjogVmVyc2lvbmVkPEVjY0tleVBhaXI+LFxuXHQpOiBQcm9taXNlPFB1YkVuY1N5bUtleT4ge1xuXHRcdGNvbnN0IGVwaGVtZXJhbEtleVBhaXIgPSB0aGlzLmNyeXB0b1dyYXBwZXIuZ2VuZXJhdGVFY2NLZXlQYWlyKClcblx0XHRjb25zdCBwdWJFbmNTeW1LZXlCeXRlcyA9IGF3YWl0IHRoaXMucHFGYWNhZGUuZW5jYXBzdWxhdGVBbmRFbmNvZGUoXG5cdFx0XHRzZW5kZXJFY2NLZXlQYWlyLm9iamVjdCxcblx0XHRcdGVwaGVtZXJhbEtleVBhaXIsXG5cdFx0XHRyZWNpcGllbnRQdWJsaWNLZXkub2JqZWN0LFxuXHRcdFx0Yml0QXJyYXlUb1VpbnQ4QXJyYXkoc3ltS2V5KSxcblx0XHQpXG5cdFx0Y29uc3Qgc2VuZGVyS2V5VmVyc2lvbiA9IHNlbmRlckVjY0tleVBhaXIudmVyc2lvblxuXHRcdHJldHVybiB7IHB1YkVuY1N5bUtleUJ5dGVzLCBjcnlwdG9Qcm90b2NvbFZlcnNpb246IENyeXB0b1Byb3RvY29sVmVyc2lvbi5UVVRBX0NSWVBULCBzZW5kZXJLZXlWZXJzaW9uLCByZWNpcGllbnRLZXlWZXJzaW9uOiByZWNpcGllbnRQdWJsaWNLZXkudmVyc2lvbiB9XG5cdH1cblxuXHRwcml2YXRlIGV4dHJhY3RSZWNpcGllbnRQdWJsaWNLZXkocHVibGljS2V5czogUHVibGljS2V5cyk6IEFzeW1tZXRyaWNQdWJsaWNLZXkge1xuXHRcdGlmIChwdWJsaWNLZXlzLnB1YlJzYUtleSkge1xuXHRcdFx0Ly8gd2UgaWdub3JlIGVjYyBrZXlzIGFzIHRoaXMgaXMgb25seSB1c2VkIGZvciB0aGUgcmVjaXBpZW50IGtleXNcblx0XHRcdHJldHVybiBoZXhUb1JzYVB1YmxpY0tleSh1aW50OEFycmF5VG9IZXgocHVibGljS2V5cy5wdWJSc2FLZXkpKVxuXHRcdH0gZWxzZSBpZiAocHVibGljS2V5cy5wdWJLeWJlcktleSAmJiBwdWJsaWNLZXlzLnB1YkVjY0tleSkge1xuXHRcdFx0Y29uc3QgZWNjUHVibGljS2V5ID0gcHVibGljS2V5cy5wdWJFY2NLZXlcblx0XHRcdGNvbnN0IGt5YmVyUHVibGljS2V5ID0gdGhpcy5jcnlwdG9XcmFwcGVyLmJ5dGVzVG9LeWJlclB1YmxpY0tleShwdWJsaWNLZXlzLnB1Ykt5YmVyS2V5KVxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0a2V5UGFpclR5cGU6IEtleVBhaXJUeXBlLlRVVEFfQ1JZUFQsXG5cdFx0XHRcdGVjY1B1YmxpY0tleSxcblx0XHRcdFx0a3liZXJQdWJsaWNLZXksXG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkluY29uc2lzdGVudCBLZXlwYWlyXCIpXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIFNlbmRlcklkZW50aXR5S2V5UGFpciB0aGF0IGlzIGVpdGhlciBhbHJlYWR5IG9uIHRoZSBLZXlQYWlyIHRoYXQgaXMgYmVpbmcgcGFzc2VkIGluLFxuXHQgKiBvciBjcmVhdGVzIGEgbmV3IG9uZSBhbmQgd3JpdGVzIGl0IHRvIHRoZSByZXNwZWN0aXZlIEdyb3VwLlxuXHQgKiBAcGFyYW0gc2VuZGVyS2V5UGFpclxuXHQgKiBAcGFyYW0ga2V5R3JvdXBJZCBJZCBmb3IgdGhlIEdyb3VwIHRoYXQgUHVibGljIEtleSBTZXJ2aWNlIG1pZ2h0IHdyaXRlIGEgbmV3IElkZW50aXR5S2V5UGFpciBmb3IuXG5cdCAqIFx0XHRcdFx0XHRcdFRoaXMgaXMgbmVjZXNzYXJ5IGFzIGEgVXNlciBtaWdodCBzZW5kIGFuIEUtTWFpbCBmcm9tIGEgc2hhcmVkIG1haWxib3gsXG5cdCAqIFx0XHRcdFx0XHRcdGZvciB3aGljaCB0aGUgS2V5UGFpciBzaG91bGQgYmUgY3JlYXRlZC5cblx0ICovXG5cdHByaXZhdGUgYXN5bmMgZ2V0T3JNYWtlU2VuZGVySWRlbnRpdHlLZXlQYWlyKHNlbmRlcktleVBhaXI6IEFzeW1tZXRyaWNLZXlQYWlyLCBrZXlHcm91cElkOiBJZCk6IFByb21pc2U8RWNjS2V5UGFpcj4ge1xuXHRcdGNvbnN0IGFsZ28gPSBzZW5kZXJLZXlQYWlyLmtleVBhaXJUeXBlXG5cdFx0aWYgKGlzUHFLZXlQYWlycyhzZW5kZXJLZXlQYWlyKSkge1xuXHRcdFx0cmV0dXJuIHNlbmRlcktleVBhaXIuZWNjS2V5UGFpclxuXHRcdH0gZWxzZSBpZiAoaXNSc2FFY2NLZXlQYWlyKHNlbmRlcktleVBhaXIpKSB7XG5cdFx0XHRyZXR1cm4geyBwdWJsaWNLZXk6IHNlbmRlcktleVBhaXIucHVibGljRWNjS2V5LCBwcml2YXRlS2V5OiBzZW5kZXJLZXlQYWlyLnByaXZhdGVFY2NLZXkgfVxuXHRcdH0gZWxzZSBpZiAoaXNSc2FPclJzYUVjY0tleVBhaXIoc2VuZGVyS2V5UGFpcikpIHtcblx0XHRcdC8vIHRoZXJlIGlzIG5vIGVjYyBrZXkgcGFpciB5ZXQsIHNvIHdlIGhhdmUgdG8gZ2VucmF0ZSBhbmQgdXBsb2FkIG9uZVxuXHRcdFx0Y29uc3Qgc3ltR3JvdXBLZXkgPSBhd2FpdCB0aGlzLmtleUxvYWRlckZhY2FkZS5nZXRDdXJyZW50U3ltR3JvdXBLZXkoa2V5R3JvdXBJZClcblx0XHRcdGNvbnN0IG5ld0lkZW50aXR5S2V5UGFpciA9IHRoaXMuY3J5cHRvV3JhcHBlci5nZW5lcmF0ZUVjY0tleVBhaXIoKVxuXHRcdFx0Y29uc3Qgc3ltRW5jUHJpdkVjY0tleSA9IHRoaXMuY3J5cHRvV3JhcHBlci5lbmNyeXB0RWNjS2V5KHN5bUdyb3VwS2V5Lm9iamVjdCwgbmV3SWRlbnRpdHlLZXlQYWlyLnByaXZhdGVLZXkpXG5cdFx0XHRjb25zdCBkYXRhID0gY3JlYXRlUHVibGljS2V5UHV0SW4oeyBwdWJFY2NLZXk6IG5ld0lkZW50aXR5S2V5UGFpci5wdWJsaWNLZXksIHN5bUVuY1ByaXZFY2NLZXksIGtleUdyb3VwOiBrZXlHcm91cElkIH0pXG5cdFx0XHRhd2FpdCB0aGlzLnNlcnZpY2VFeGVjdXRvci5wdXQoUHVibGljS2V5U2VydmljZSwgZGF0YSlcblx0XHRcdHJldHVybiBuZXdJZGVudGl0eUtleVBhaXJcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgbmV3IENyeXB0b0Vycm9yKFwidW5rbm93biBrZXkgcGFpciB0eXBlOiBcIiArIGFsZ28pXG5cdFx0fVxuXHR9XG59XG4iLCJpbXBvcnQgeyBjcmVhdGVQdWJsaWNLZXlHZXRJbiwgUHVibGljS2V5R2V0T3V0IH0gZnJvbSBcIi4uLy4uL2VudGl0aWVzL3N5cy9UeXBlUmVmcy5qc1wiXG5pbXBvcnQgeyBJU2VydmljZUV4ZWN1dG9yIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9TZXJ2aWNlUmVxdWVzdC5qc1wiXG5pbXBvcnQgeyBQdWJsaWNLZXlTZXJ2aWNlIH0gZnJvbSBcIi4uLy4uL2VudGl0aWVzL3N5cy9TZXJ2aWNlcy5qc1wiXG5pbXBvcnQgeyBwYXJzZUtleVZlcnNpb24gfSBmcm9tIFwiLi9LZXlMb2FkZXJGYWNhZGUuanNcIlxuaW1wb3J0IHsgVmVyc2lvbmVkIH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5pbXBvcnQgeyBQdWJsaWNLZXlJZGVudGlmaWVyVHlwZSB9IGZyb20gXCIuLi8uLi9jb21tb24vVHV0YW5vdGFDb25zdGFudHMuanNcIlxuaW1wb3J0IHsgS2V5VmVyc2lvbiB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHMvZGlzdC9VdGlscy5qc1wiXG5pbXBvcnQgeyBJbnZhbGlkRGF0YUVycm9yIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9lcnJvci9SZXN0RXJyb3IuanNcIlxuaW1wb3J0IHsgQ3J5cHRvRXJyb3IgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLWNyeXB0by9lcnJvci5qc1wiXG5cbmV4cG9ydCB0eXBlIFB1YmxpY0tleUlkZW50aWZpZXIgPSB7XG5cdGlkZW50aWZpZXI6IHN0cmluZ1xuXHRpZGVudGlmaWVyVHlwZTogUHVibGljS2V5SWRlbnRpZmllclR5cGVcbn1cbmV4cG9ydCB0eXBlIFB1YmxpY0tleXMgPSB7XG5cdHB1YlJzYUtleTogbnVsbCB8IFVpbnQ4QXJyYXlcblx0cHViRWNjS2V5OiBudWxsIHwgVWludDhBcnJheVxuXHRwdWJLeWJlcktleTogbnVsbCB8IFVpbnQ4QXJyYXlcbn1cblxuLyoqXG4gKiBMb2FkIHB1YmxpYyBrZXlzLlxuICogSGFuZGxlIGtleSB2ZXJzaW9uaW5nLlxuICovXG5leHBvcnQgY2xhc3MgUHVibGljS2V5UHJvdmlkZXIge1xuXHRjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IHNlcnZpY2VFeGVjdXRvcjogSVNlcnZpY2VFeGVjdXRvcikge31cblxuXHRhc3luYyBsb2FkQ3VycmVudFB1YktleShwdWJLZXlJZGVudGlmaWVyOiBQdWJsaWNLZXlJZGVudGlmaWVyKTogUHJvbWlzZTxWZXJzaW9uZWQ8UHVibGljS2V5cz4+IHtcblx0XHRyZXR1cm4gdGhpcy5sb2FkUHViS2V5KHB1YktleUlkZW50aWZpZXIsIG51bGwpXG5cdH1cblxuXHRhc3luYyBsb2FkVmVyc2lvbmVkUHViS2V5KHB1YktleUlkZW50aWZpZXI6IFB1YmxpY0tleUlkZW50aWZpZXIsIHZlcnNpb246IEtleVZlcnNpb24pOiBQcm9taXNlPFB1YmxpY0tleXM+IHtcblx0XHRyZXR1cm4gKGF3YWl0IHRoaXMubG9hZFB1YktleShwdWJLZXlJZGVudGlmaWVyLCB2ZXJzaW9uKSkub2JqZWN0XG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIGxvYWRQdWJLZXkocHViS2V5SWRlbnRpZmllcjogUHVibGljS2V5SWRlbnRpZmllciwgdmVyc2lvbjogS2V5VmVyc2lvbiB8IG51bGwpOiBQcm9taXNlPFZlcnNpb25lZDxQdWJsaWNLZXlzPj4ge1xuXHRcdGNvbnN0IHJlcXVlc3REYXRhID0gY3JlYXRlUHVibGljS2V5R2V0SW4oe1xuXHRcdFx0dmVyc2lvbjogdmVyc2lvbiA/IFN0cmluZyh2ZXJzaW9uKSA6IG51bGwsXG5cdFx0XHRpZGVudGlmaWVyOiBwdWJLZXlJZGVudGlmaWVyLmlkZW50aWZpZXIsXG5cdFx0XHRpZGVudGlmaWVyVHlwZTogcHViS2V5SWRlbnRpZmllci5pZGVudGlmaWVyVHlwZSxcblx0XHR9KVxuXHRcdGNvbnN0IHB1YmxpY0tleUdldE91dCA9IGF3YWl0IHRoaXMuc2VydmljZUV4ZWN1dG9yLmdldChQdWJsaWNLZXlTZXJ2aWNlLCByZXF1ZXN0RGF0YSlcblx0XHRjb25zdCBwdWJLZXlzID0gdGhpcy5jb252ZXJ0VG9WZXJzaW9uZWRQdWJsaWNLZXlzKHB1YmxpY0tleUdldE91dClcblx0XHR0aGlzLmVuZm9yY2VSc2FLZXlWZXJzaW9uQ29uc3RyYWludChwdWJLZXlzKVxuXHRcdGlmICh2ZXJzaW9uICE9IG51bGwgJiYgcHViS2V5cy52ZXJzaW9uICE9PSB2ZXJzaW9uKSB7XG5cdFx0XHR0aHJvdyBuZXcgSW52YWxpZERhdGFFcnJvcihcInRoZSBzZXJ2ZXIgcmV0dXJuZWQgYSBrZXkgdmVyc2lvbiB0aGF0IHdhcyBub3QgcmVxdWVzdGVkXCIpXG5cdFx0fVxuXHRcdHJldHVybiBwdWJLZXlzXG5cdH1cblxuXHQvKipcblx0ICogUlNBIGtleXMgd2VyZSBvbmx5IGNyZWF0ZWQgYmVmb3JlIGludHJvZHVjaW5nIGtleSB2ZXJzaW9ucywgaS5lLiB0aGV5IGFsd2F5cyBoYXZlIHZlcnNpb24gMC5cblx0ICpcblx0ICogUmVjZWl2aW5nIGEgaGlnaGVyIHZlcnNpb24gd291bGQgaW5kaWNhdGUgYSBwcm90b2NvbCBkb3duZ3JhZGUvIE1JVE0gYXR0YWNrLCBhbmQgd2UgcmVqZWN0IHN1Y2gga2V5cy5cblx0ICovXG5cdHByaXZhdGUgZW5mb3JjZVJzYUtleVZlcnNpb25Db25zdHJhaW50KHB1YktleXM6IFZlcnNpb25lZDxQdWJsaWNLZXlzPikge1xuXHRcdGlmIChwdWJLZXlzLnZlcnNpb24gIT09IDAgJiYgcHViS2V5cy5vYmplY3QucHViUnNhS2V5ICE9IG51bGwpIHtcblx0XHRcdHRocm93IG5ldyBDcnlwdG9FcnJvcihcInJzYSBrZXkgaW4gYSB2ZXJzaW9uIHRoYXQgaXMgbm90IDBcIilcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIGNvbnZlcnRUb1ZlcnNpb25lZFB1YmxpY0tleXMocHVibGljS2V5R2V0T3V0OiBQdWJsaWNLZXlHZXRPdXQpOiBWZXJzaW9uZWQ8UHVibGljS2V5cz4ge1xuXHRcdHJldHVybiB7XG5cdFx0XHRvYmplY3Q6IHtcblx0XHRcdFx0cHViUnNhS2V5OiBwdWJsaWNLZXlHZXRPdXQucHViUnNhS2V5LFxuXHRcdFx0XHRwdWJLeWJlcktleTogcHVibGljS2V5R2V0T3V0LnB1Ykt5YmVyS2V5LFxuXHRcdFx0XHRwdWJFY2NLZXk6IHB1YmxpY0tleUdldE91dC5wdWJFY2NLZXksXG5cdFx0XHR9LFxuXHRcdFx0dmVyc2lvbjogcGFyc2VLZXlWZXJzaW9uKHB1YmxpY0tleUdldE91dC5wdWJLZXlWZXJzaW9uKSxcblx0XHR9XG5cdH1cbn1cbiIsImltcG9ydCB7IGdldERheVNoaWZ0ZWQsIGdldFN0YXJ0T2ZEYXkgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcblxuZXhwb3J0IGludGVyZmFjZSBEYXRlUHJvdmlkZXIge1xuXHRnZXRTdGFydE9mRGF5U2hpZnRlZEJ5KHNoaWZ0QnlEYXlzOiBudW1iZXIpOiBEYXRlXG59XG5cbmV4cG9ydCBjbGFzcyBMb2NhbFRpbWVEYXRlUHJvdmlkZXIgaW1wbGVtZW50cyBEYXRlUHJvdmlkZXIge1xuXHRnZXRTdGFydE9mRGF5U2hpZnRlZEJ5KHNoaWZ0QnlEYXlzOiBudW1iZXIpOiBEYXRlIHtcblx0XHRyZXR1cm4gZ2V0U3RhcnRPZkRheShnZXREYXlTaGlmdGVkKG5ldyBEYXRlKCksIHNoaWZ0QnlEYXlzKSlcblx0fVxufVxuIiwiaW1wb3J0IHsgQ2FjaGVJbmZvLCBMb2dpbkZhY2FkZSwgTG9naW5MaXN0ZW5lciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9mYWNhZGVzL0xvZ2luRmFjYWRlLmpzXCJcbmltcG9ydCB0eXBlIHsgV29ya2VySW1wbCB9IGZyb20gXCIuL1dvcmtlckltcGwuanNcIlxuaW1wb3J0IHR5cGUgeyBJbmRleGVyIH0gZnJvbSBcIi4uL2luZGV4L0luZGV4ZXIuanNcIlxuaW1wb3J0IHR5cGUgeyBFbnRpdHlSZXN0SW50ZXJmYWNlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL3Jlc3QvRW50aXR5UmVzdENsaWVudC5qc1wiXG5pbXBvcnQgeyBFbnRpdHlSZXN0Q2xpZW50IH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL3Jlc3QvRW50aXR5UmVzdENsaWVudC5qc1wiXG5pbXBvcnQgdHlwZSB7IFVzZXJNYW5hZ2VtZW50RmFjYWRlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL2ZhY2FkZXMvbGF6eS9Vc2VyTWFuYWdlbWVudEZhY2FkZS5qc1wiXG5pbXBvcnQgeyBDYWNoZVN0b3JhZ2UsIERlZmF1bHRFbnRpdHlSZXN0Q2FjaGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvcmVzdC9EZWZhdWx0RW50aXR5UmVzdENhY2hlLmpzXCJcbmltcG9ydCB0eXBlIHsgR3JvdXBNYW5hZ2VtZW50RmFjYWRlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL2ZhY2FkZXMvbGF6eS9Hcm91cE1hbmFnZW1lbnRGYWNhZGUuanNcIlxuaW1wb3J0IHR5cGUgeyBNYWlsRmFjYWRlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL2ZhY2FkZXMvbGF6eS9NYWlsRmFjYWRlLmpzXCJcbmltcG9ydCB0eXBlIHsgTWFpbEFkZHJlc3NGYWNhZGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvZmFjYWRlcy9sYXp5L01haWxBZGRyZXNzRmFjYWRlLmpzXCJcbmltcG9ydCB0eXBlIHsgQ3VzdG9tZXJGYWNhZGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvZmFjYWRlcy9sYXp5L0N1c3RvbWVyRmFjYWRlLmpzXCJcbmltcG9ydCB0eXBlIHsgQ291bnRlckZhY2FkZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9mYWNhZGVzL2xhenkvQ291bnRlckZhY2FkZS5qc1wiXG5pbXBvcnQgeyBFdmVudEJ1c0NsaWVudCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9FdmVudEJ1c0NsaWVudC5qc1wiXG5pbXBvcnQge1xuXHRhc3NlcnRXb3JrZXJPck5vZGUsXG5cdGdldFdlYnNvY2tldEJhc2VVcmwsXG5cdGlzQWRtaW5DbGllbnQsXG5cdGlzQW5kcm9pZEFwcCxcblx0aXNCcm93c2VyLFxuXHRpc0lPU0FwcCxcblx0aXNPZmZsaW5lU3RvcmFnZUF2YWlsYWJsZSxcblx0aXNUZXN0LFxufSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vRW52LmpzXCJcbmltcG9ydCB7IENvbnN0IH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL1R1dGFub3RhQ29uc3RhbnRzLmpzXCJcbmltcG9ydCB0eXBlIHsgQnJvd3NlckRhdGEgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21pc2MvQ2xpZW50Q29uc3RhbnRzLmpzXCJcbmltcG9ydCB0eXBlIHsgQ2FsZW5kYXJGYWNhZGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvZmFjYWRlcy9sYXp5L0NhbGVuZGFyRmFjYWRlLmpzXCJcbmltcG9ydCB0eXBlIHsgU2hhcmVGYWNhZGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvZmFjYWRlcy9sYXp5L1NoYXJlRmFjYWRlLmpzXCJcbmltcG9ydCB7IFJlc3RDbGllbnQgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvcmVzdC9SZXN0Q2xpZW50LmpzXCJcbmltcG9ydCB7IFN1c3BlbnNpb25IYW5kbGVyIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL1N1c3BlbnNpb25IYW5kbGVyLmpzXCJcbmltcG9ydCB7IEVudGl0eUNsaWVudCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9FbnRpdHlDbGllbnQuanNcIlxuaW1wb3J0IHR5cGUgeyBHaWZ0Q2FyZEZhY2FkZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9mYWNhZGVzL2xhenkvR2lmdENhcmRGYWNhZGUuanNcIlxuaW1wb3J0IHR5cGUgeyBDb25maWd1cmF0aW9uRGF0YWJhc2UgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvZmFjYWRlcy9sYXp5L0NvbmZpZ3VyYXRpb25EYXRhYmFzZS5qc1wiXG5pbXBvcnQgeyBEZXZpY2VFbmNyeXB0aW9uRmFjYWRlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL2ZhY2FkZXMvRGV2aWNlRW5jcnlwdGlvbkZhY2FkZS5qc1wiXG5pbXBvcnQgdHlwZSB7IE5hdGl2ZUludGVyZmFjZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vbmF0aXZlL2NvbW1vbi9OYXRpdmVJbnRlcmZhY2UuanNcIlxuaW1wb3J0IHsgTmF0aXZlRmlsZUFwcCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vbmF0aXZlL2NvbW1vbi9GaWxlQXBwLmpzXCJcbmltcG9ydCB7IEFlc0FwcCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vbmF0aXZlL3dvcmtlci9BZXNBcHAuanNcIlxuaW1wb3J0IHR5cGUgeyBSc2FJbXBsZW1lbnRhdGlvbiB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9jcnlwdG8vUnNhSW1wbGVtZW50YXRpb24uanNcIlxuaW1wb3J0IHsgY3JlYXRlUnNhSW1wbGVtZW50YXRpb24gfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvY3J5cHRvL1JzYUltcGxlbWVudGF0aW9uLmpzXCJcbmltcG9ydCB7IENyeXB0b0ZhY2FkZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9jcnlwdG8vQ3J5cHRvRmFjYWRlLmpzXCJcbmltcG9ydCB7IEluc3RhbmNlTWFwcGVyIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL2NyeXB0by9JbnN0YW5jZU1hcHBlci5qc1wiXG5pbXBvcnQgeyBBZG1pbkNsaWVudER1bW15RW50aXR5UmVzdENhY2hlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL3Jlc3QvQWRtaW5DbGllbnREdW1teUVudGl0eVJlc3RDYWNoZS5qc1wiXG5pbXBvcnQgeyBTbGVlcERldGVjdG9yIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL3V0aWxzL1NsZWVwRGV0ZWN0b3IuanNcIlxuaW1wb3J0IHsgU2NoZWR1bGVySW1wbCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi91dGlscy9TY2hlZHVsZXIuanNcIlxuaW1wb3J0IHsgTm9ab25lRGF0ZVByb3ZpZGVyIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL3V0aWxzL05vWm9uZURhdGVQcm92aWRlci5qc1wiXG5pbXBvcnQgeyBMYXRlSW5pdGlhbGl6ZWRDYWNoZVN0b3JhZ2VJbXBsIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL3Jlc3QvQ2FjaGVTdG9yYWdlUHJveHkuanNcIlxuaW1wb3J0IHsgSVNlcnZpY2VFeGVjdXRvciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9TZXJ2aWNlUmVxdWVzdC5qc1wiXG5pbXBvcnQgeyBTZXJ2aWNlRXhlY3V0b3IgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvcmVzdC9TZXJ2aWNlRXhlY3V0b3IuanNcIlxuaW1wb3J0IHR5cGUgeyBCb29raW5nRmFjYWRlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL2ZhY2FkZXMvbGF6eS9Cb29raW5nRmFjYWRlLmpzXCJcbmltcG9ydCB0eXBlIHsgQmxvYkZhY2FkZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9mYWNhZGVzL2xhenkvQmxvYkZhY2FkZS5qc1wiXG5pbXBvcnQgeyBVc2VyRmFjYWRlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL2ZhY2FkZXMvVXNlckZhY2FkZS5qc1wiXG5pbXBvcnQgeyBPZmZsaW5lU3RvcmFnZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9vZmZsaW5lL09mZmxpbmVTdG9yYWdlLmpzXCJcbmltcG9ydCB7IE9GRkxJTkVfU1RPUkFHRV9NSUdSQVRJT05TLCBPZmZsaW5lU3RvcmFnZU1pZ3JhdG9yIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL29mZmxpbmUvT2ZmbGluZVN0b3JhZ2VNaWdyYXRvci5qc1wiXG5pbXBvcnQgeyBtb2RlbEluZm9zIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL0VudGl0eUZ1bmN0aW9ucy5qc1wiXG5pbXBvcnQgeyBGaWxlRmFjYWRlU2VuZERpc3BhdGNoZXIgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL25hdGl2ZS9jb21tb24vZ2VuZXJhdGVkaXBjL0ZpbGVGYWNhZGVTZW5kRGlzcGF0Y2hlci5qc1wiXG5pbXBvcnQgeyBOYXRpdmVQdXNoRmFjYWRlU2VuZERpc3BhdGNoZXIgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL25hdGl2ZS9jb21tb24vZ2VuZXJhdGVkaXBjL05hdGl2ZVB1c2hGYWNhZGVTZW5kRGlzcGF0Y2hlci5qc1wiXG5pbXBvcnQgeyBOYXRpdmVDcnlwdG9GYWNhZGVTZW5kRGlzcGF0Y2hlciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vbmF0aXZlL2NvbW1vbi9nZW5lcmF0ZWRpcGMvTmF0aXZlQ3J5cHRvRmFjYWRlU2VuZERpc3BhdGNoZXIuanNcIlxuaW1wb3J0IHsgcmFuZG9tIH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS1jcnlwdG9cIlxuaW1wb3J0IHsgRXhwb3J0RmFjYWRlU2VuZERpc3BhdGNoZXIgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL25hdGl2ZS9jb21tb24vZ2VuZXJhdGVkaXBjL0V4cG9ydEZhY2FkZVNlbmREaXNwYXRjaGVyLmpzXCJcbmltcG9ydCB7IGFzc2VydE5vdE51bGwsIGRlbGF5LCBsYXp5QXN5bmMsIGxhenlNZW1vaXplZCB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHsgSW50ZXJXaW5kb3dFdmVudEZhY2FkZVNlbmREaXNwYXRjaGVyIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9uYXRpdmUvY29tbW9uL2dlbmVyYXRlZGlwYy9JbnRlcldpbmRvd0V2ZW50RmFjYWRlU2VuZERpc3BhdGNoZXIuanNcIlxuaW1wb3J0IHsgU3FsQ2lwaGVyRmFjYWRlU2VuZERpc3BhdGNoZXIgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL25hdGl2ZS9jb21tb24vZ2VuZXJhdGVkaXBjL1NxbENpcGhlckZhY2FkZVNlbmREaXNwYXRjaGVyLmpzXCJcbmltcG9ydCB7IEVudHJvcHlGYWNhZGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvZmFjYWRlcy9FbnRyb3B5RmFjYWRlLmpzXCJcbmltcG9ydCB7IEJsb2JBY2Nlc3NUb2tlbkZhY2FkZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9mYWNhZGVzL0Jsb2JBY2Nlc3NUb2tlbkZhY2FkZS5qc1wiXG5pbXBvcnQgeyBPd25lckVuY1Nlc3Npb25LZXlzVXBkYXRlUXVldWUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvY3J5cHRvL093bmVyRW5jU2Vzc2lvbktleXNVcGRhdGVRdWV1ZS5qc1wiXG5pbXBvcnQgeyBFdmVudEJ1c0V2ZW50Q29vcmRpbmF0b3IgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvRXZlbnRCdXNFdmVudENvb3JkaW5hdG9yLmpzXCJcbmltcG9ydCB7IFdvcmtlckZhY2FkZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9mYWNhZGVzL1dvcmtlckZhY2FkZS5qc1wiXG5pbXBvcnQgeyBTcWxDaXBoZXJGYWNhZGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL25hdGl2ZS9jb21tb24vZ2VuZXJhdGVkaXBjL1NxbENpcGhlckZhY2FkZS5qc1wiXG5pbXBvcnQgdHlwZSB7IFNlYXJjaEZhY2FkZSB9IGZyb20gXCIuLi9pbmRleC9TZWFyY2hGYWNhZGUuanNcIlxuaW1wb3J0IHsgQ2hhbGxlbmdlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvZW50aXRpZXMvc3lzL1R5cGVSZWZzLmpzXCJcbmltcG9ydCB7IExvZ2luRmFpbFJlYXNvbiB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL21haW4vUGFnZUNvbnRleHRMb2dpbkxpc3RlbmVyLmpzXCJcbmltcG9ydCB7IENvbm5lY3Rpb25FcnJvciwgU2VydmljZVVuYXZhaWxhYmxlRXJyb3IgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vZXJyb3IvUmVzdEVycm9yLmpzXCJcbmltcG9ydCB7IFNlc3Npb25UeXBlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL1Nlc3Npb25UeXBlLmpzXCJcbmltcG9ydCB7IEFyZ29uMmlkRmFjYWRlLCBOYXRpdmVBcmdvbjJpZEZhY2FkZSwgV0FTTUFyZ29uMmlkRmFjYWRlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL2ZhY2FkZXMvQXJnb24yaWRGYWNhZGUuanNcIlxuaW1wb3J0IHsgRG9tYWluQ29uZmlnUHJvdmlkZXIgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vRG9tYWluQ29uZmlnUHJvdmlkZXIuanNcIlxuaW1wb3J0IHsgS3liZXJGYWNhZGUsIE5hdGl2ZUt5YmVyRmFjYWRlLCBXQVNNS3liZXJGYWNhZGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvZmFjYWRlcy9LeWJlckZhY2FkZS5qc1wiXG5pbXBvcnQgeyBQUUZhY2FkZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9mYWNhZGVzL1BRRmFjYWRlLmpzXCJcbmltcG9ydCB7IFBkZldyaXRlciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9wZGYvUGRmV3JpdGVyLmpzXCJcbmltcG9ydCB7IENvbnRhY3RGYWNhZGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvZmFjYWRlcy9sYXp5L0NvbnRhY3RGYWNhZGUuanNcIlxuaW1wb3J0IHsgS2V5TG9hZGVyRmFjYWRlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL2ZhY2FkZXMvS2V5TG9hZGVyRmFjYWRlLmpzXCJcbmltcG9ydCB7IEtleVJvdGF0aW9uRmFjYWRlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL2ZhY2FkZXMvS2V5Um90YXRpb25GYWNhZGUuanNcIlxuaW1wb3J0IHsgS2V5Q2FjaGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvZmFjYWRlcy9LZXlDYWNoZS5qc1wiXG5pbXBvcnQgeyBDcnlwdG9XcmFwcGVyIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL2NyeXB0by9DcnlwdG9XcmFwcGVyLmpzXCJcbmltcG9ydCB7IFJlY292ZXJDb2RlRmFjYWRlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL2ZhY2FkZXMvbGF6eS9SZWNvdmVyQ29kZUZhY2FkZS5qc1wiXG5pbXBvcnQgeyBDYWNoZU1hbmFnZW1lbnRGYWNhZGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvZmFjYWRlcy9sYXp5L0NhY2hlTWFuYWdlbWVudEZhY2FkZS5qc1wiXG5pbXBvcnQgeyBNYWlsT2ZmbGluZUNsZWFuZXIgfSBmcm9tIFwiLi4vb2ZmbGluZS9NYWlsT2ZmbGluZUNsZWFuZXIuanNcIlxuaW1wb3J0IHR5cGUgeyBRdWV1ZWRCYXRjaCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9FdmVudFF1ZXVlLmpzXCJcbmltcG9ydCB7IENyZWRlbnRpYWxzIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9taXNjL2NyZWRlbnRpYWxzL0NyZWRlbnRpYWxzLmpzXCJcbmltcG9ydCB7IEFzeW1tZXRyaWNDcnlwdG9GYWNhZGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvY3J5cHRvL0FzeW1tZXRyaWNDcnlwdG9GYWNhZGUuanNcIlxuaW1wb3J0IHsgS2V5QXV0aGVudGljYXRpb25GYWNhZGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvZmFjYWRlcy9LZXlBdXRoZW50aWNhdGlvbkZhY2FkZS5qc1wiXG5pbXBvcnQgeyBQdWJsaWNLZXlQcm92aWRlciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9mYWNhZGVzL1B1YmxpY0tleVByb3ZpZGVyLmpzXCJcbmltcG9ydCB7IEVwaGVtZXJhbENhY2hlU3RvcmFnZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9yZXN0L0VwaGVtZXJhbENhY2hlU3RvcmFnZS5qc1wiXG5pbXBvcnQgeyBMb2NhbFRpbWVEYXRlUHJvdmlkZXIgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvRGF0ZVByb3ZpZGVyLmpzXCJcbmltcG9ydCB7IEJ1bGtNYWlsTG9hZGVyIH0gZnJvbSBcIi4uL2luZGV4L0J1bGtNYWlsTG9hZGVyLmpzXCJcbmltcG9ydCB0eXBlIHsgTWFpbEV4cG9ydEZhY2FkZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9mYWNhZGVzL2xhenkvTWFpbEV4cG9ydEZhY2FkZVwiXG5cbmFzc2VydFdvcmtlck9yTm9kZSgpXG5cbmV4cG9ydCB0eXBlIFdvcmtlckxvY2F0b3JUeXBlID0ge1xuXHQvLyBuZXR3b3JrICYgZW5jcnlwdGlvblxuXHRyZXN0Q2xpZW50OiBSZXN0Q2xpZW50XG5cdHNlcnZpY2VFeGVjdXRvcjogSVNlcnZpY2VFeGVjdXRvclxuXHRjcnlwdG9XcmFwcGVyOiBDcnlwdG9XcmFwcGVyXG5cdGFzeW1tZXRyaWNDcnlwdG86IEFzeW1tZXRyaWNDcnlwdG9GYWNhZGVcblx0Y3J5cHRvOiBDcnlwdG9GYWNhZGVcblx0aW5zdGFuY2VNYXBwZXI6IEluc3RhbmNlTWFwcGVyXG5cdGNhY2hlU3RvcmFnZTogQ2FjaGVTdG9yYWdlXG5cdGNhY2hlOiBFbnRpdHlSZXN0SW50ZXJmYWNlXG5cdGNhY2hpbmdFbnRpdHlDbGllbnQ6IEVudGl0eUNsaWVudFxuXHRldmVudEJ1c0NsaWVudDogRXZlbnRCdXNDbGllbnRcblx0cnNhOiBSc2FJbXBsZW1lbnRhdGlvblxuXHRreWJlckZhY2FkZTogS3liZXJGYWNhZGVcblx0cHFGYWNhZGU6IFBRRmFjYWRlXG5cdGVudHJvcHlGYWNhZGU6IEVudHJvcHlGYWNhZGVcblx0YmxvYkFjY2Vzc1Rva2VuOiBCbG9iQWNjZXNzVG9rZW5GYWNhZGVcblx0a2V5Q2FjaGU6IEtleUNhY2hlXG5cdGtleUxvYWRlcjogS2V5TG9hZGVyRmFjYWRlXG5cdHB1YmxpY0tleVByb3ZpZGVyOiBQdWJsaWNLZXlQcm92aWRlclxuXHRrZXlSb3RhdGlvbjogS2V5Um90YXRpb25GYWNhZGVcblxuXHQvLyBsb2dpblxuXHR1c2VyOiBVc2VyRmFjYWRlXG5cdGxvZ2luOiBMb2dpbkZhY2FkZVxuXG5cdC8vIGRvbWFpbnNcblx0YmxvYjogbGF6eUFzeW5jPEJsb2JGYWNhZGU+XG5cdG1haWw6IGxhenlBc3luYzxNYWlsRmFjYWRlPlxuXHRjYWxlbmRhcjogbGF6eUFzeW5jPENhbGVuZGFyRmFjYWRlPlxuXHRjb3VudGVyczogbGF6eUFzeW5jPENvdW50ZXJGYWNhZGU+XG5cdENvbnN0OiBSZWNvcmQ8c3RyaW5nLCBhbnk+XG5cblx0Ly8gc2VhcmNoICYgaW5kZXhpbmdcblx0aW5kZXhlcjogbGF6eUFzeW5jPEluZGV4ZXI+XG5cdHNlYXJjaDogbGF6eUFzeW5jPFNlYXJjaEZhY2FkZT5cblxuXHQvLyBtYW5hZ2VtZW50IGZhY2FkZXNcblx0Z3JvdXBNYW5hZ2VtZW50OiBsYXp5QXN5bmM8R3JvdXBNYW5hZ2VtZW50RmFjYWRlPlxuXHR1c2VyTWFuYWdlbWVudDogbGF6eUFzeW5jPFVzZXJNYW5hZ2VtZW50RmFjYWRlPlxuXHRyZWNvdmVyQ29kZTogbGF6eUFzeW5jPFJlY292ZXJDb2RlRmFjYWRlPlxuXHRjdXN0b21lcjogbGF6eUFzeW5jPEN1c3RvbWVyRmFjYWRlPlxuXHRnaWZ0Q2FyZHM6IGxhenlBc3luYzxHaWZ0Q2FyZEZhY2FkZT5cblx0bWFpbEFkZHJlc3M6IGxhenlBc3luYzxNYWlsQWRkcmVzc0ZhY2FkZT5cblx0Ym9va2luZzogbGF6eUFzeW5jPEJvb2tpbmdGYWNhZGU+XG5cdHNoYXJlOiBsYXp5QXN5bmM8U2hhcmVGYWNhZGU+XG5cdGNhY2hlTWFuYWdlbWVudDogbGF6eUFzeW5jPENhY2hlTWFuYWdlbWVudEZhY2FkZT5cblxuXHQvLyBtaXNjICYgbmF0aXZlXG5cdGNvbmZpZ0ZhY2FkZTogbGF6eUFzeW5jPENvbmZpZ3VyYXRpb25EYXRhYmFzZT5cblx0ZGV2aWNlRW5jcnlwdGlvbkZhY2FkZTogRGV2aWNlRW5jcnlwdGlvbkZhY2FkZVxuXHRuYXRpdmU6IE5hdGl2ZUludGVyZmFjZVxuXHR3b3JrZXJGYWNhZGU6IFdvcmtlckZhY2FkZVxuXHRzcWxDaXBoZXJGYWNhZGU6IFNxbENpcGhlckZhY2FkZVxuXHRwZGZXcml0ZXI6IGxhenlBc3luYzxQZGZXcml0ZXI+XG5cdGJ1bGtNYWlsTG9hZGVyOiBsYXp5QXN5bmM8QnVsa01haWxMb2FkZXI+XG5cdG1haWxFeHBvcnRGYWNhZGU6IGxhenlBc3luYzxNYWlsRXhwb3J0RmFjYWRlPlxuXG5cdC8vIHVzZWQgdG8gY2FjaGUgYmV0d2VlbiByZXNldHNcblx0X3dvcmtlcjogV29ya2VySW1wbFxuXHRfYnJvd3NlckRhdGE6IEJyb3dzZXJEYXRhXG5cblx0Ly9jb250YWN0XG5cdGNvbnRhY3RGYWNhZGU6IGxhenlBc3luYzxDb250YWN0RmFjYWRlPlxufVxuZXhwb3J0IGNvbnN0IGxvY2F0b3I6IFdvcmtlckxvY2F0b3JUeXBlID0ge30gYXMgYW55XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbml0TG9jYXRvcih3b3JrZXI6IFdvcmtlckltcGwsIGJyb3dzZXJEYXRhOiBCcm93c2VyRGF0YSkge1xuXHRsb2NhdG9yLl93b3JrZXIgPSB3b3JrZXJcblx0bG9jYXRvci5fYnJvd3NlckRhdGEgPSBicm93c2VyRGF0YVxuXHRsb2NhdG9yLmtleUNhY2hlID0gbmV3IEtleUNhY2hlKClcblx0bG9jYXRvci5jcnlwdG9XcmFwcGVyID0gbmV3IENyeXB0b1dyYXBwZXIoKVxuXHRsb2NhdG9yLnVzZXIgPSBuZXcgVXNlckZhY2FkZShsb2NhdG9yLmtleUNhY2hlLCBsb2NhdG9yLmNyeXB0b1dyYXBwZXIpXG5cdGxvY2F0b3Iud29ya2VyRmFjYWRlID0gbmV3IFdvcmtlckZhY2FkZSgpXG5cdGNvbnN0IGRhdGVQcm92aWRlciA9IG5ldyBOb1pvbmVEYXRlUHJvdmlkZXIoKVxuXG5cdGNvbnN0IG1haW5JbnRlcmZhY2UgPSB3b3JrZXIuZ2V0TWFpbkludGVyZmFjZSgpXG5cblx0Y29uc3Qgc3VzcGVuc2lvbkhhbmRsZXIgPSBuZXcgU3VzcGVuc2lvbkhhbmRsZXIobWFpbkludGVyZmFjZS5pbmZvTWVzc2FnZUhhbmRsZXIsIHNlbGYpXG5cdGxvY2F0b3IuaW5zdGFuY2VNYXBwZXIgPSBuZXcgSW5zdGFuY2VNYXBwZXIoKVxuXHRsb2NhdG9yLnJzYSA9IGF3YWl0IGNyZWF0ZVJzYUltcGxlbWVudGF0aW9uKHdvcmtlcilcblxuXHRjb25zdCBkb21haW5Db25maWcgPSBuZXcgRG9tYWluQ29uZmlnUHJvdmlkZXIoKS5nZXRDdXJyZW50RG9tYWluQ29uZmlnKClcblxuXHRsb2NhdG9yLnJlc3RDbGllbnQgPSBuZXcgUmVzdENsaWVudChzdXNwZW5zaW9uSGFuZGxlciwgZG9tYWluQ29uZmlnKVxuXHRsb2NhdG9yLnNlcnZpY2VFeGVjdXRvciA9IG5ldyBTZXJ2aWNlRXhlY3V0b3IobG9jYXRvci5yZXN0Q2xpZW50LCBsb2NhdG9yLnVzZXIsIGxvY2F0b3IuaW5zdGFuY2VNYXBwZXIsICgpID0+IGxvY2F0b3IuY3J5cHRvKVxuXHRsb2NhdG9yLmVudHJvcHlGYWNhZGUgPSBuZXcgRW50cm9weUZhY2FkZShsb2NhdG9yLnVzZXIsIGxvY2F0b3Iuc2VydmljZUV4ZWN1dG9yLCByYW5kb20sICgpID0+IGxvY2F0b3Iua2V5TG9hZGVyKVxuXHRsb2NhdG9yLmJsb2JBY2Nlc3NUb2tlbiA9IG5ldyBCbG9iQWNjZXNzVG9rZW5GYWNhZGUobG9jYXRvci5zZXJ2aWNlRXhlY3V0b3IsIGxvY2F0b3IudXNlciwgZGF0ZVByb3ZpZGVyKVxuXHRjb25zdCBlbnRpdHlSZXN0Q2xpZW50ID0gbmV3IEVudGl0eVJlc3RDbGllbnQobG9jYXRvci51c2VyLCBsb2NhdG9yLnJlc3RDbGllbnQsICgpID0+IGxvY2F0b3IuY3J5cHRvLCBsb2NhdG9yLmluc3RhbmNlTWFwcGVyLCBsb2NhdG9yLmJsb2JBY2Nlc3NUb2tlbilcblxuXHRsb2NhdG9yLm5hdGl2ZSA9IHdvcmtlclxuXHRsb2NhdG9yLmJvb2tpbmcgPSBsYXp5TWVtb2l6ZWQoYXN5bmMgKCkgPT4ge1xuXHRcdGNvbnN0IHsgQm9va2luZ0ZhY2FkZSB9ID0gYXdhaXQgaW1wb3J0KFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvZmFjYWRlcy9sYXp5L0Jvb2tpbmdGYWNhZGUuanNcIilcblx0XHRyZXR1cm4gbmV3IEJvb2tpbmdGYWNhZGUobG9jYXRvci5zZXJ2aWNlRXhlY3V0b3IpXG5cdH0pXG5cblx0bGV0IG9mZmxpbmVTdG9yYWdlUHJvdmlkZXJcblx0aWYgKGlzT2ZmbGluZVN0b3JhZ2VBdmFpbGFibGUoKSAmJiAhaXNBZG1pbkNsaWVudCgpKSB7XG5cdFx0bG9jYXRvci5zcWxDaXBoZXJGYWNhZGUgPSBuZXcgU3FsQ2lwaGVyRmFjYWRlU2VuZERpc3BhdGNoZXIobG9jYXRvci5uYXRpdmUpXG5cdFx0b2ZmbGluZVN0b3JhZ2VQcm92aWRlciA9IGFzeW5jICgpID0+IHtcblx0XHRcdHJldHVybiBuZXcgT2ZmbGluZVN0b3JhZ2UoXG5cdFx0XHRcdGxvY2F0b3Iuc3FsQ2lwaGVyRmFjYWRlLFxuXHRcdFx0XHRuZXcgSW50ZXJXaW5kb3dFdmVudEZhY2FkZVNlbmREaXNwYXRjaGVyKHdvcmtlciksXG5cdFx0XHRcdGRhdGVQcm92aWRlcixcblx0XHRcdFx0bmV3IE9mZmxpbmVTdG9yYWdlTWlncmF0b3IoT0ZGTElORV9TVE9SQUdFX01JR1JBVElPTlMsIG1vZGVsSW5mb3MpLFxuXHRcdFx0XHRuZXcgTWFpbE9mZmxpbmVDbGVhbmVyKCksXG5cdFx0XHQpXG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdG9mZmxpbmVTdG9yYWdlUHJvdmlkZXIgPSBhc3luYyAoKSA9PiBudWxsXG5cdH1cblx0bG9jYXRvci5wZGZXcml0ZXIgPSBhc3luYyAoKSA9PiB7XG5cdFx0Y29uc3QgeyBQZGZXcml0ZXIgfSA9IGF3YWl0IGltcG9ydChcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL3BkZi9QZGZXcml0ZXIuanNcIilcblx0XHRyZXR1cm4gbmV3IFBkZldyaXRlcihuZXcgVGV4dEVuY29kZXIoKSwgdW5kZWZpbmVkKVxuXHR9XG5cblx0Y29uc3QgbWF5YmVVbmluaXRpYWxpemVkU3RvcmFnZSA9IG5ldyBMYXRlSW5pdGlhbGl6ZWRDYWNoZVN0b3JhZ2VJbXBsKGFzeW5jIChlcnJvcjogRXJyb3IpID0+IHtcblx0XHRhd2FpdCB3b3JrZXIuc2VuZEVycm9yKGVycm9yKVxuXHR9LCBvZmZsaW5lU3RvcmFnZVByb3ZpZGVyKVxuXG5cdGxvY2F0b3IuY2FjaGVTdG9yYWdlID0gbWF5YmVVbmluaXRpYWxpemVkU3RvcmFnZVxuXG5cdGNvbnN0IGZpbGVBcHAgPSBuZXcgTmF0aXZlRmlsZUFwcChuZXcgRmlsZUZhY2FkZVNlbmREaXNwYXRjaGVyKHdvcmtlciksIG5ldyBFeHBvcnRGYWNhZGVTZW5kRGlzcGF0Y2hlcih3b3JrZXIpKVxuXG5cdC8vIFdlIGRvbid0IHdhbnQgdG8gY2FjaGUgd2l0aGluIHRoZSBhZG1pbiBjbGllbnRcblx0bGV0IGNhY2hlOiBEZWZhdWx0RW50aXR5UmVzdENhY2hlIHwgbnVsbCA9IG51bGxcblx0aWYgKCFpc0FkbWluQ2xpZW50KCkpIHtcblx0XHRjYWNoZSA9IG5ldyBEZWZhdWx0RW50aXR5UmVzdENhY2hlKGVudGl0eVJlc3RDbGllbnQsIG1heWJlVW5pbml0aWFsaXplZFN0b3JhZ2UpXG5cdH1cblxuXHRsb2NhdG9yLmNhY2hlID0gY2FjaGUgPz8gZW50aXR5UmVzdENsaWVudFxuXG5cdGxvY2F0b3IuY2FjaGluZ0VudGl0eUNsaWVudCA9IG5ldyBFbnRpdHlDbGllbnQobG9jYXRvci5jYWNoZSlcblx0Y29uc3Qgbm9uQ2FjaGluZ0VudGl0eUNsaWVudCA9IG5ldyBFbnRpdHlDbGllbnQoZW50aXR5UmVzdENsaWVudClcblxuXHRsb2NhdG9yLmNhY2hlTWFuYWdlbWVudCA9IGxhenlNZW1vaXplZChhc3luYyAoKSA9PiB7XG5cdFx0Y29uc3QgeyBDYWNoZU1hbmFnZW1lbnRGYWNhZGUgfSA9IGF3YWl0IGltcG9ydChcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL2ZhY2FkZXMvbGF6eS9DYWNoZU1hbmFnZW1lbnRGYWNhZGUuanNcIilcblx0XHRyZXR1cm4gbmV3IENhY2hlTWFuYWdlbWVudEZhY2FkZShsb2NhdG9yLnVzZXIsIGxvY2F0b3IuY2FjaGluZ0VudGl0eUNsaWVudCwgYXNzZXJ0Tm90TnVsbChjYWNoZSkpXG5cdH0pXG5cblx0LyoqIFNsaWdodGx5IGFubm95aW5nIHR3by1zdGFnZSBpbml0OiBmaXJzdCBpbXBvcnQgYnVsayBsb2FkZXIsIHRoZW4gd2UgY2FuIGhhdmUgYSBmYWN0b3J5IGZvciBpdC4gKi9cblx0Y29uc3QgcHJlcGFyZUJ1bGtMb2FkZXJGYWN0b3J5ID0gYXN5bmMgKCkgPT4ge1xuXHRcdGNvbnN0IHsgQnVsa01haWxMb2FkZXIgfSA9IGF3YWl0IGltcG9ydChcIi4uL2luZGV4L0J1bGtNYWlsTG9hZGVyLmpzXCIpXG5cdFx0cmV0dXJuICgpID0+IHtcblx0XHRcdC8vIE9uIHBsYXRmb3JtcyB3aXRoIG9mZmxpbmUgY2FjaGUgd2UganVzdCB1c2UgY2FjaGUgYXMgd2UgYXJlIG5vdCBib3VuZGVkIGJ5IG1lbW9yeS5cblx0XHRcdGlmIChpc09mZmxpbmVTdG9yYWdlQXZhaWxhYmxlKCkpIHtcblx0XHRcdFx0cmV0dXJuIG5ldyBCdWxrTWFpbExvYWRlcihsb2NhdG9yLmNhY2hpbmdFbnRpdHlDbGllbnQsIGxvY2F0b3IuY2FjaGluZ0VudGl0eUNsaWVudCwgbnVsbClcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIE9uIHBsYXRmb3JtcyB3aXRob3V0IG9mZmxpbmUgY2FjaGUgd2UgdXNlIG5ldyBlcGhlbWVyYWwgY2FjaGUgc3RvcmFnZSBmb3IgbWFpbHMgb25seSBhbmQgdW5jYWNoZWQgc3RvcmFnZSBmb3IgdGhlIHJlc3Rcblx0XHRcdFx0Y29uc3QgY2FjaGVTdG9yYWdlID0gbmV3IEVwaGVtZXJhbENhY2hlU3RvcmFnZSgpXG5cdFx0XHRcdHJldHVybiBuZXcgQnVsa01haWxMb2FkZXIoXG5cdFx0XHRcdFx0bmV3IEVudGl0eUNsaWVudChuZXcgRGVmYXVsdEVudGl0eVJlc3RDYWNoZShlbnRpdHlSZXN0Q2xpZW50LCBjYWNoZVN0b3JhZ2UpKSxcblx0XHRcdFx0XHRuZXcgRW50aXR5Q2xpZW50KGVudGl0eVJlc3RDbGllbnQpLFxuXHRcdFx0XHRcdGNhY2hlU3RvcmFnZSxcblx0XHRcdFx0KVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRsb2NhdG9yLmJ1bGtNYWlsTG9hZGVyID0gYXN5bmMgKCkgPT4ge1xuXHRcdGNvbnN0IGZhY3RvcnkgPSBhd2FpdCBwcmVwYXJlQnVsa0xvYWRlckZhY3RvcnkoKVxuXHRcdHJldHVybiBmYWN0b3J5KClcblx0fVxuXG5cdGxvY2F0b3IuaW5kZXhlciA9IGxhenlNZW1vaXplZChhc3luYyAoKSA9PiB7XG5cdFx0Y29uc3QgeyBJbmRleGVyIH0gPSBhd2FpdCBpbXBvcnQoXCIuLi9pbmRleC9JbmRleGVyLmpzXCIpXG5cdFx0Y29uc3QgeyBNYWlsSW5kZXhlciB9ID0gYXdhaXQgaW1wb3J0KFwiLi4vaW5kZXgvTWFpbEluZGV4ZXIuanNcIilcblx0XHRjb25zdCBtYWlsRmFjYWRlID0gYXdhaXQgbG9jYXRvci5tYWlsKClcblx0XHRjb25zdCBidWxrTG9hZGVyRmFjdG9yeSA9IGF3YWl0IHByZXBhcmVCdWxrTG9hZGVyRmFjdG9yeSgpXG5cdFx0cmV0dXJuIG5ldyBJbmRleGVyKGVudGl0eVJlc3RDbGllbnQsIG1haW5JbnRlcmZhY2UuaW5mb01lc3NhZ2VIYW5kbGVyLCBicm93c2VyRGF0YSwgbG9jYXRvci5jYWNoZSBhcyBEZWZhdWx0RW50aXR5UmVzdENhY2hlLCAoY29yZSwgZGIpID0+IHtcblx0XHRcdGNvbnN0IGRhdGVQcm92aWRlciA9IG5ldyBMb2NhbFRpbWVEYXRlUHJvdmlkZXIoKVxuXHRcdFx0cmV0dXJuIG5ldyBNYWlsSW5kZXhlcihjb3JlLCBkYiwgbWFpbkludGVyZmFjZS5pbmZvTWVzc2FnZUhhbmRsZXIsIGJ1bGtMb2FkZXJGYWN0b3J5LCBsb2NhdG9yLmNhY2hpbmdFbnRpdHlDbGllbnQsIGRhdGVQcm92aWRlciwgbWFpbEZhY2FkZSlcblx0XHR9KVxuXHR9KVxuXG5cdGlmIChpc0lPU0FwcCgpIHx8IGlzQW5kcm9pZEFwcCgpKSB7XG5cdFx0bG9jYXRvci5reWJlckZhY2FkZSA9IG5ldyBOYXRpdmVLeWJlckZhY2FkZShuZXcgTmF0aXZlQ3J5cHRvRmFjYWRlU2VuZERpc3BhdGNoZXIod29ya2VyKSlcblx0fSBlbHNlIHtcblx0XHRsb2NhdG9yLmt5YmVyRmFjYWRlID0gbmV3IFdBU01LeWJlckZhY2FkZSgpXG5cdH1cblxuXHRsb2NhdG9yLnBxRmFjYWRlID0gbmV3IFBRRmFjYWRlKGxvY2F0b3Iua3liZXJGYWNhZGUpXG5cblx0bG9jYXRvci5rZXlMb2FkZXIgPSBuZXcgS2V5TG9hZGVyRmFjYWRlKGxvY2F0b3Iua2V5Q2FjaGUsIGxvY2F0b3IudXNlciwgbG9jYXRvci5jYWNoaW5nRW50aXR5Q2xpZW50LCBsb2NhdG9yLmNhY2hlTWFuYWdlbWVudClcblxuXHRsb2NhdG9yLnB1YmxpY0tleVByb3ZpZGVyID0gbmV3IFB1YmxpY0tleVByb3ZpZGVyKGxvY2F0b3Iuc2VydmljZUV4ZWN1dG9yKVxuXG5cdGxvY2F0b3IuYXN5bW1ldHJpY0NyeXB0byA9IG5ldyBBc3ltbWV0cmljQ3J5cHRvRmFjYWRlKFxuXHRcdGxvY2F0b3IucnNhLFxuXHRcdGxvY2F0b3IucHFGYWNhZGUsXG5cdFx0bG9jYXRvci5rZXlMb2FkZXIsXG5cdFx0bG9jYXRvci5jcnlwdG9XcmFwcGVyLFxuXHRcdGxvY2F0b3Iuc2VydmljZUV4ZWN1dG9yLFxuXHRcdGxvY2F0b3IucHVibGljS2V5UHJvdmlkZXIsXG5cdClcblxuXHRsb2NhdG9yLmNyeXB0byA9IG5ldyBDcnlwdG9GYWNhZGUoXG5cdFx0bG9jYXRvci51c2VyLFxuXHRcdGxvY2F0b3IuY2FjaGluZ0VudGl0eUNsaWVudCxcblx0XHRsb2NhdG9yLnJlc3RDbGllbnQsXG5cdFx0bG9jYXRvci5zZXJ2aWNlRXhlY3V0b3IsXG5cdFx0bG9jYXRvci5pbnN0YW5jZU1hcHBlcixcblx0XHRuZXcgT3duZXJFbmNTZXNzaW9uS2V5c1VwZGF0ZVF1ZXVlKGxvY2F0b3IudXNlciwgbG9jYXRvci5zZXJ2aWNlRXhlY3V0b3IpLFxuXHRcdGNhY2hlLFxuXHRcdGxvY2F0b3Iua2V5TG9hZGVyLFxuXHRcdGxvY2F0b3IuYXN5bW1ldHJpY0NyeXB0byxcblx0XHRsb2NhdG9yLnB1YmxpY0tleVByb3ZpZGVyLFxuXHRcdGxhenlNZW1vaXplZCgoKSA9PiBsb2NhdG9yLmtleVJvdGF0aW9uKSxcblx0KVxuXG5cdGxvY2F0b3IucmVjb3ZlckNvZGUgPSBsYXp5TWVtb2l6ZWQoYXN5bmMgKCkgPT4ge1xuXHRcdGNvbnN0IHsgUmVjb3ZlckNvZGVGYWNhZGUgfSA9IGF3YWl0IGltcG9ydChcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL2ZhY2FkZXMvbGF6eS9SZWNvdmVyQ29kZUZhY2FkZS5qc1wiKVxuXHRcdHJldHVybiBuZXcgUmVjb3ZlckNvZGVGYWNhZGUobG9jYXRvci51c2VyLCBsb2NhdG9yLmNhY2hpbmdFbnRpdHlDbGllbnQsIGxvY2F0b3IubG9naW4sIGxvY2F0b3Iua2V5TG9hZGVyKVxuXHR9KVxuXHRsb2NhdG9yLnNoYXJlID0gbGF6eU1lbW9pemVkKGFzeW5jICgpID0+IHtcblx0XHRjb25zdCB7IFNoYXJlRmFjYWRlIH0gPSBhd2FpdCBpbXBvcnQoXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9mYWNhZGVzL2xhenkvU2hhcmVGYWNhZGUuanNcIilcblx0XHRyZXR1cm4gbmV3IFNoYXJlRmFjYWRlKGxvY2F0b3IudXNlciwgbG9jYXRvci5jcnlwdG8sIGxvY2F0b3Iuc2VydmljZUV4ZWN1dG9yLCBsb2NhdG9yLmNhY2hpbmdFbnRpdHlDbGllbnQsIGxvY2F0b3Iua2V5TG9hZGVyKVxuXHR9KVxuXHRsb2NhdG9yLmNvdW50ZXJzID0gbGF6eU1lbW9pemVkKGFzeW5jICgpID0+IHtcblx0XHRjb25zdCB7IENvdW50ZXJGYWNhZGUgfSA9IGF3YWl0IGltcG9ydChcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL2ZhY2FkZXMvbGF6eS9Db3VudGVyRmFjYWRlLmpzXCIpXG5cdFx0cmV0dXJuIG5ldyBDb3VudGVyRmFjYWRlKGxvY2F0b3Iuc2VydmljZUV4ZWN1dG9yKVxuXHR9KVxuXHRjb25zdCBrZXlBdXRoZW50aWNhdGlvbkZhY2FkZSA9IG5ldyBLZXlBdXRoZW50aWNhdGlvbkZhY2FkZShsb2NhdG9yLmNyeXB0b1dyYXBwZXIpXG5cdGxvY2F0b3IuZ3JvdXBNYW5hZ2VtZW50ID0gbGF6eU1lbW9pemVkKGFzeW5jICgpID0+IHtcblx0XHRjb25zdCB7IEdyb3VwTWFuYWdlbWVudEZhY2FkZSB9ID0gYXdhaXQgaW1wb3J0KFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvZmFjYWRlcy9sYXp5L0dyb3VwTWFuYWdlbWVudEZhY2FkZS5qc1wiKVxuXHRcdHJldHVybiBuZXcgR3JvdXBNYW5hZ2VtZW50RmFjYWRlKFxuXHRcdFx0bG9jYXRvci51c2VyLFxuXHRcdFx0YXdhaXQgbG9jYXRvci5jb3VudGVycygpLFxuXHRcdFx0bG9jYXRvci5jYWNoaW5nRW50aXR5Q2xpZW50LFxuXHRcdFx0bG9jYXRvci5zZXJ2aWNlRXhlY3V0b3IsXG5cdFx0XHRsb2NhdG9yLnBxRmFjYWRlLFxuXHRcdFx0bG9jYXRvci5rZXlMb2FkZXIsXG5cdFx0XHRhd2FpdCBsb2NhdG9yLmNhY2hlTWFuYWdlbWVudCgpLFxuXHRcdFx0bG9jYXRvci5hc3ltbWV0cmljQ3J5cHRvLFxuXHRcdFx0bG9jYXRvci5jcnlwdG9XcmFwcGVyLFxuXHRcdFx0a2V5QXV0aGVudGljYXRpb25GYWNhZGUsXG5cdFx0KVxuXHR9KVxuXHRsb2NhdG9yLmtleVJvdGF0aW9uID0gbmV3IEtleVJvdGF0aW9uRmFjYWRlKFxuXHRcdGxvY2F0b3IuY2FjaGluZ0VudGl0eUNsaWVudCxcblx0XHRsb2NhdG9yLmtleUxvYWRlcixcblx0XHRsb2NhdG9yLnBxRmFjYWRlLFxuXHRcdGxvY2F0b3Iuc2VydmljZUV4ZWN1dG9yLFxuXHRcdGxvY2F0b3IuY3J5cHRvV3JhcHBlcixcblx0XHRsb2NhdG9yLnJlY292ZXJDb2RlLFxuXHRcdGxvY2F0b3IudXNlcixcblx0XHRsb2NhdG9yLmNyeXB0byxcblx0XHRsb2NhdG9yLnNoYXJlLFxuXHRcdGxvY2F0b3IuZ3JvdXBNYW5hZ2VtZW50LFxuXHRcdGxvY2F0b3IuYXN5bW1ldHJpY0NyeXB0byxcblx0XHRrZXlBdXRoZW50aWNhdGlvbkZhY2FkZSxcblx0XHRsb2NhdG9yLnB1YmxpY0tleVByb3ZpZGVyLFxuXHQpXG5cblx0Y29uc3QgbG9naW5MaXN0ZW5lcjogTG9naW5MaXN0ZW5lciA9IHtcblx0XHRvbkZ1bGxMb2dpblN1Y2Nlc3Moc2Vzc2lvblR5cGU6IFNlc3Npb25UeXBlLCBjYWNoZUluZm86IENhY2hlSW5mbywgY3JlZGVudGlhbHM6IENyZWRlbnRpYWxzKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0XHRpZiAoIWlzVGVzdCgpICYmIHNlc3Npb25UeXBlICE9PSBTZXNzaW9uVHlwZS5UZW1wb3JhcnkgJiYgIWlzQWRtaW5DbGllbnQoKSkge1xuXHRcdFx0XHQvLyBpbmRleCBuZXcgaXRlbXMgaW4gYmFja2dyb3VuZFxuXHRcdFx0XHRjb25zb2xlLmxvZyhcImluaXRJbmRleGVyIGFmdGVyIGxvZyBpblwiKVxuXG5cdFx0XHRcdGluaXRJbmRleGVyKHdvcmtlciwgY2FjaGVJbmZvLCBsb2NhdG9yLmtleUxvYWRlcilcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG1haW5JbnRlcmZhY2UubG9naW5MaXN0ZW5lci5vbkZ1bGxMb2dpblN1Y2Nlc3Moc2Vzc2lvblR5cGUsIGNhY2hlSW5mbywgY3JlZGVudGlhbHMpXG5cdFx0fSxcblxuXHRcdG9uTG9naW5GYWlsdXJlKHJlYXNvbjogTG9naW5GYWlsUmVhc29uKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0XHRyZXR1cm4gbWFpbkludGVyZmFjZS5sb2dpbkxpc3RlbmVyLm9uTG9naW5GYWlsdXJlKHJlYXNvbilcblx0XHR9LFxuXG5cdFx0b25TZWNvbmRGYWN0b3JDaGFsbGVuZ2Uoc2Vzc2lvbklkOiBJZFR1cGxlLCBjaGFsbGVuZ2VzOiBSZWFkb25seUFycmF5PENoYWxsZW5nZT4sIG1haWxBZGRyZXNzOiBzdHJpbmcgfCBudWxsKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0XHRyZXR1cm4gbWFpbkludGVyZmFjZS5sb2dpbkxpc3RlbmVyLm9uU2Vjb25kRmFjdG9yQ2hhbGxlbmdlKHNlc3Npb25JZCwgY2hhbGxlbmdlcywgbWFpbEFkZHJlc3MpXG5cdFx0fSxcblx0fVxuXG5cdGxldCBhcmdvbjJpZEZhY2FkZTogQXJnb24yaWRGYWNhZGVcblx0aWYgKCFpc0Jyb3dzZXIoKSkge1xuXHRcdGFyZ29uMmlkRmFjYWRlID0gbmV3IE5hdGl2ZUFyZ29uMmlkRmFjYWRlKG5ldyBOYXRpdmVDcnlwdG9GYWNhZGVTZW5kRGlzcGF0Y2hlcih3b3JrZXIpKVxuXHR9IGVsc2Uge1xuXHRcdGFyZ29uMmlkRmFjYWRlID0gbmV3IFdBU01BcmdvbjJpZEZhY2FkZSgpXG5cdH1cblxuXHRsb2NhdG9yLmRldmljZUVuY3J5cHRpb25GYWNhZGUgPSBuZXcgRGV2aWNlRW5jcnlwdGlvbkZhY2FkZSgpXG5cdGNvbnN0IHsgRGF0YWJhc2VLZXlGYWN0b3J5IH0gPSBhd2FpdCBpbXBvcnQoXCIuLi8uLi8uLi9jb21tb24vbWlzYy9jcmVkZW50aWFscy9EYXRhYmFzZUtleUZhY3RvcnkuanNcIilcblxuXHRsb2NhdG9yLmxvZ2luID0gbmV3IExvZ2luRmFjYWRlKFxuXHRcdGxvY2F0b3IucmVzdENsaWVudCxcblx0XHQvKipcblx0XHQgKiB3ZSBkb24ndCB3YW50IHRvIHRyeSB0byB1c2UgdGhlIGNhY2hlIGluIHRoZSBsb2dpbiBmYWNhZGUsIGJlY2F1c2UgaXQgbWF5IG5vdCBiZSBhdmFpbGFibGUgKHdoZW4gbm8gdXNlciBpcyBsb2dnZWQgaW4pXG5cdFx0ICovXG5cdFx0bmV3IEVudGl0eUNsaWVudChsb2NhdG9yLmNhY2hlKSxcblx0XHRsb2dpbkxpc3RlbmVyLFxuXHRcdGxvY2F0b3IuaW5zdGFuY2VNYXBwZXIsXG5cdFx0bG9jYXRvci5jcnlwdG8sXG5cdFx0bG9jYXRvci5rZXlSb3RhdGlvbixcblx0XHRtYXliZVVuaW5pdGlhbGl6ZWRTdG9yYWdlLFxuXHRcdGxvY2F0b3Iuc2VydmljZUV4ZWN1dG9yLFxuXHRcdGxvY2F0b3IudXNlcixcblx0XHRsb2NhdG9yLmJsb2JBY2Nlc3NUb2tlbixcblx0XHRsb2NhdG9yLmVudHJvcHlGYWNhZGUsXG5cdFx0bmV3IERhdGFiYXNlS2V5RmFjdG9yeShsb2NhdG9yLmRldmljZUVuY3J5cHRpb25GYWNhZGUpLFxuXHRcdGFyZ29uMmlkRmFjYWRlLFxuXHRcdG5vbkNhY2hpbmdFbnRpdHlDbGllbnQsXG5cdFx0YXN5bmMgKGVycm9yOiBFcnJvcikgPT4ge1xuXHRcdFx0YXdhaXQgd29ya2VyLnNlbmRFcnJvcihlcnJvcilcblx0XHR9LFxuXHRcdGxvY2F0b3IuY2FjaGVNYW5hZ2VtZW50LFxuXHQpXG5cblx0bG9jYXRvci5zZWFyY2ggPSBsYXp5TWVtb2l6ZWQoYXN5bmMgKCkgPT4ge1xuXHRcdGNvbnN0IHsgU2VhcmNoRmFjYWRlIH0gPSBhd2FpdCBpbXBvcnQoXCIuLi9pbmRleC9TZWFyY2hGYWNhZGUuanNcIilcblx0XHRjb25zdCBpbmRleGVyID0gYXdhaXQgbG9jYXRvci5pbmRleGVyKClcblx0XHRjb25zdCBzdWdnZXN0aW9uRmFjYWRlcyA9IFtpbmRleGVyLl9jb250YWN0LnN1Z2dlc3Rpb25GYWNhZGVdXG5cdFx0cmV0dXJuIG5ldyBTZWFyY2hGYWNhZGUobG9jYXRvci51c2VyLCBpbmRleGVyLmRiLCBpbmRleGVyLl9tYWlsLCBzdWdnZXN0aW9uRmFjYWRlcywgYnJvd3NlckRhdGEsIGxvY2F0b3IuY2FjaGluZ0VudGl0eUNsaWVudClcblx0fSlcblx0bG9jYXRvci51c2VyTWFuYWdlbWVudCA9IGxhenlNZW1vaXplZChhc3luYyAoKSA9PiB7XG5cdFx0Y29uc3QgeyBVc2VyTWFuYWdlbWVudEZhY2FkZSB9ID0gYXdhaXQgaW1wb3J0KFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvZmFjYWRlcy9sYXp5L1VzZXJNYW5hZ2VtZW50RmFjYWRlLmpzXCIpXG5cdFx0cmV0dXJuIG5ldyBVc2VyTWFuYWdlbWVudEZhY2FkZShcblx0XHRcdGxvY2F0b3IudXNlcixcblx0XHRcdGF3YWl0IGxvY2F0b3IuZ3JvdXBNYW5hZ2VtZW50KCksXG5cdFx0XHRhd2FpdCBsb2NhdG9yLmNvdW50ZXJzKCksXG5cdFx0XHRsb2NhdG9yLmNhY2hpbmdFbnRpdHlDbGllbnQsXG5cdFx0XHRsb2NhdG9yLnNlcnZpY2VFeGVjdXRvcixcblx0XHRcdG1haW5JbnRlcmZhY2Uub3BlcmF0aW9uUHJvZ3Jlc3NUcmFja2VyLFxuXHRcdFx0bG9jYXRvci5sb2dpbixcblx0XHRcdGxvY2F0b3IucHFGYWNhZGUsXG5cdFx0XHRsb2NhdG9yLmtleUxvYWRlcixcblx0XHRcdGF3YWl0IGxvY2F0b3IucmVjb3ZlckNvZGUoKSxcblx0XHQpXG5cdH0pXG5cdGxvY2F0b3IuY3VzdG9tZXIgPSBsYXp5TWVtb2l6ZWQoYXN5bmMgKCkgPT4ge1xuXHRcdGNvbnN0IHsgQ3VzdG9tZXJGYWNhZGUgfSA9IGF3YWl0IGltcG9ydChcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL2ZhY2FkZXMvbGF6eS9DdXN0b21lckZhY2FkZS5qc1wiKVxuXHRcdHJldHVybiBuZXcgQ3VzdG9tZXJGYWNhZGUoXG5cdFx0XHRsb2NhdG9yLnVzZXIsXG5cdFx0XHRhd2FpdCBsb2NhdG9yLmdyb3VwTWFuYWdlbWVudCgpLFxuXHRcdFx0YXdhaXQgbG9jYXRvci51c2VyTWFuYWdlbWVudCgpLFxuXHRcdFx0YXdhaXQgbG9jYXRvci5jb3VudGVycygpLFxuXHRcdFx0bG9jYXRvci5yc2EsXG5cdFx0XHRsb2NhdG9yLmNhY2hpbmdFbnRpdHlDbGllbnQsXG5cdFx0XHRsb2NhdG9yLnNlcnZpY2VFeGVjdXRvcixcblx0XHRcdGF3YWl0IGxvY2F0b3IuYm9va2luZygpLFxuXHRcdFx0bG9jYXRvci5jcnlwdG8sXG5cdFx0XHRtYWluSW50ZXJmYWNlLm9wZXJhdGlvblByb2dyZXNzVHJhY2tlcixcblx0XHRcdGxvY2F0b3IucGRmV3JpdGVyLFxuXHRcdFx0bG9jYXRvci5wcUZhY2FkZSxcblx0XHRcdGxvY2F0b3Iua2V5TG9hZGVyLFxuXHRcdFx0YXdhaXQgbG9jYXRvci5yZWNvdmVyQ29kZSgpLFxuXHRcdFx0bG9jYXRvci5hc3ltbWV0cmljQ3J5cHRvLFxuXHRcdClcblx0fSlcblx0Y29uc3QgYWVzQXBwID0gbmV3IEFlc0FwcChuZXcgTmF0aXZlQ3J5cHRvRmFjYWRlU2VuZERpc3BhdGNoZXIod29ya2VyKSwgcmFuZG9tKVxuXHRsb2NhdG9yLmJsb2IgPSBsYXp5TWVtb2l6ZWQoYXN5bmMgKCkgPT4ge1xuXHRcdGNvbnN0IHsgQmxvYkZhY2FkZSB9ID0gYXdhaXQgaW1wb3J0KFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvZmFjYWRlcy9sYXp5L0Jsb2JGYWNhZGUuanNcIilcblx0XHRyZXR1cm4gbmV3IEJsb2JGYWNhZGUobG9jYXRvci5yZXN0Q2xpZW50LCBzdXNwZW5zaW9uSGFuZGxlciwgZmlsZUFwcCwgYWVzQXBwLCBsb2NhdG9yLmluc3RhbmNlTWFwcGVyLCBsb2NhdG9yLmNyeXB0bywgbG9jYXRvci5ibG9iQWNjZXNzVG9rZW4pXG5cdH0pXG5cdGxvY2F0b3IubWFpbCA9IGxhenlNZW1vaXplZChhc3luYyAoKSA9PiB7XG5cdFx0Y29uc3QgeyBNYWlsRmFjYWRlIH0gPSBhd2FpdCBpbXBvcnQoXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9mYWNhZGVzL2xhenkvTWFpbEZhY2FkZS5qc1wiKVxuXHRcdHJldHVybiBuZXcgTWFpbEZhY2FkZShcblx0XHRcdGxvY2F0b3IudXNlcixcblx0XHRcdGxvY2F0b3IuY2FjaGluZ0VudGl0eUNsaWVudCxcblx0XHRcdGxvY2F0b3IuY3J5cHRvLFxuXHRcdFx0bG9jYXRvci5zZXJ2aWNlRXhlY3V0b3IsXG5cdFx0XHRhd2FpdCBsb2NhdG9yLmJsb2IoKSxcblx0XHRcdGZpbGVBcHAsXG5cdFx0XHRsb2NhdG9yLmxvZ2luLFxuXHRcdFx0bG9jYXRvci5rZXlMb2FkZXIsXG5cdFx0XHRsb2NhdG9yLnB1YmxpY0tleVByb3ZpZGVyLFxuXHRcdClcblx0fSlcblx0Y29uc3QgbmF0aXZlUHVzaEZhY2FkZSA9IG5ldyBOYXRpdmVQdXNoRmFjYWRlU2VuZERpc3BhdGNoZXIod29ya2VyKVxuXHRsb2NhdG9yLmNhbGVuZGFyID0gbGF6eU1lbW9pemVkKGFzeW5jICgpID0+IHtcblx0XHRjb25zdCB7IENhbGVuZGFyRmFjYWRlIH0gPSBhd2FpdCBpbXBvcnQoXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9mYWNhZGVzL2xhenkvQ2FsZW5kYXJGYWNhZGUuanNcIilcblx0XHRyZXR1cm4gbmV3IENhbGVuZGFyRmFjYWRlKFxuXHRcdFx0bG9jYXRvci51c2VyLFxuXHRcdFx0YXdhaXQgbG9jYXRvci5ncm91cE1hbmFnZW1lbnQoKSxcblx0XHRcdGFzc2VydE5vdE51bGwoY2FjaGUpLFxuXHRcdFx0bm9uQ2FjaGluZ0VudGl0eUNsaWVudCwgLy8gd2l0aG91dCBjYWNoZVxuXHRcdFx0bmF0aXZlUHVzaEZhY2FkZSxcblx0XHRcdG1haW5JbnRlcmZhY2Uub3BlcmF0aW9uUHJvZ3Jlc3NUcmFja2VyLFxuXHRcdFx0bG9jYXRvci5pbnN0YW5jZU1hcHBlcixcblx0XHRcdGxvY2F0b3Iuc2VydmljZUV4ZWN1dG9yLFxuXHRcdFx0bG9jYXRvci5jcnlwdG8sXG5cdFx0XHRtYWluSW50ZXJmYWNlLmluZm9NZXNzYWdlSGFuZGxlcixcblx0XHQpXG5cdH0pXG5cblx0bG9jYXRvci5tYWlsQWRkcmVzcyA9IGxhenlNZW1vaXplZChhc3luYyAoKSA9PiB7XG5cdFx0Y29uc3QgeyBNYWlsQWRkcmVzc0ZhY2FkZSB9ID0gYXdhaXQgaW1wb3J0KFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvZmFjYWRlcy9sYXp5L01haWxBZGRyZXNzRmFjYWRlLmpzXCIpXG5cdFx0cmV0dXJuIG5ldyBNYWlsQWRkcmVzc0ZhY2FkZShcblx0XHRcdGxvY2F0b3IudXNlcixcblx0XHRcdGF3YWl0IGxvY2F0b3IuZ3JvdXBNYW5hZ2VtZW50KCksXG5cdFx0XHRsb2NhdG9yLnNlcnZpY2VFeGVjdXRvcixcblx0XHRcdG5vbkNhY2hpbmdFbnRpdHlDbGllbnQsIC8vIHdpdGhvdXQgY2FjaGVcblx0XHQpXG5cdH0pXG5cdGNvbnN0IHNjaGVkdWxlciA9IG5ldyBTY2hlZHVsZXJJbXBsKGRhdGVQcm92aWRlciwgc2VsZiwgc2VsZilcblxuXHRsb2NhdG9yLmNvbmZpZ0ZhY2FkZSA9IGxhenlNZW1vaXplZChhc3luYyAoKSA9PiB7XG5cdFx0Y29uc3QgeyBDb25maWd1cmF0aW9uRGF0YWJhc2UgfSA9IGF3YWl0IGltcG9ydChcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL2ZhY2FkZXMvbGF6eS9Db25maWd1cmF0aW9uRGF0YWJhc2UuanNcIilcblx0XHRyZXR1cm4gbmV3IENvbmZpZ3VyYXRpb25EYXRhYmFzZShsb2NhdG9yLmtleUxvYWRlciwgbG9jYXRvci51c2VyKVxuXHR9KVxuXG5cdGNvbnN0IGV2ZW50QnVzQ29vcmRpbmF0b3IgPSBuZXcgRXZlbnRCdXNFdmVudENvb3JkaW5hdG9yKFxuXHRcdG1haW5JbnRlcmZhY2Uud3NDb25uZWN0aXZpdHlMaXN0ZW5lcixcblx0XHRsb2NhdG9yLm1haWwsXG5cdFx0bG9jYXRvci51c2VyLFxuXHRcdGxvY2F0b3IuY2FjaGluZ0VudGl0eUNsaWVudCxcblx0XHRtYWluSW50ZXJmYWNlLmV2ZW50Q29udHJvbGxlcixcblx0XHRsb2NhdG9yLmNvbmZpZ0ZhY2FkZSxcblx0XHRsb2NhdG9yLmtleVJvdGF0aW9uLFxuXHRcdGxvY2F0b3IuY2FjaGVNYW5hZ2VtZW50LFxuXHRcdGFzeW5jIChlcnJvcjogRXJyb3IpID0+IHtcblx0XHRcdGF3YWl0IHdvcmtlci5zZW5kRXJyb3IoZXJyb3IpXG5cdFx0fSxcblx0XHRhc3luYyAocXVldWVkQmF0Y2g6IFF1ZXVlZEJhdGNoW10pID0+IHtcblx0XHRcdGNvbnN0IGluZGV4ZXIgPSBhd2FpdCBsb2NhdG9yLmluZGV4ZXIoKVxuXHRcdFx0aW5kZXhlci5hZGRCYXRjaGVzVG9RdWV1ZShxdWV1ZWRCYXRjaClcblx0XHRcdGluZGV4ZXIuc3RhcnRQcm9jZXNzaW5nKClcblx0XHR9LFxuXHQpXG5cblx0bG9jYXRvci5ldmVudEJ1c0NsaWVudCA9IG5ldyBFdmVudEJ1c0NsaWVudChcblx0XHRldmVudEJ1c0Nvb3JkaW5hdG9yLFxuXHRcdGNhY2hlID8/IG5ldyBBZG1pbkNsaWVudER1bW15RW50aXR5UmVzdENhY2hlKCksXG5cdFx0bG9jYXRvci51c2VyLFxuXHRcdGxvY2F0b3IuY2FjaGluZ0VudGl0eUNsaWVudCxcblx0XHRsb2NhdG9yLmluc3RhbmNlTWFwcGVyLFxuXHRcdChwYXRoKSA9PiBuZXcgV2ViU29ja2V0KGdldFdlYnNvY2tldEJhc2VVcmwoZG9tYWluQ29uZmlnKSArIHBhdGgpLFxuXHRcdG5ldyBTbGVlcERldGVjdG9yKHNjaGVkdWxlciwgZGF0ZVByb3ZpZGVyKSxcblx0XHRtYWluSW50ZXJmYWNlLnByb2dyZXNzVHJhY2tlcixcblx0KVxuXHRsb2NhdG9yLmxvZ2luLmluaXQobG9jYXRvci5ldmVudEJ1c0NsaWVudClcblx0bG9jYXRvci5Db25zdCA9IENvbnN0XG5cdGxvY2F0b3IuZ2lmdENhcmRzID0gbGF6eU1lbW9pemVkKGFzeW5jICgpID0+IHtcblx0XHRjb25zdCB7IEdpZnRDYXJkRmFjYWRlIH0gPSBhd2FpdCBpbXBvcnQoXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9mYWNhZGVzL2xhenkvR2lmdENhcmRGYWNhZGUuanNcIilcblx0XHRyZXR1cm4gbmV3IEdpZnRDYXJkRmFjYWRlKGxvY2F0b3IudXNlciwgYXdhaXQgbG9jYXRvci5jdXN0b21lcigpLCBsb2NhdG9yLnNlcnZpY2VFeGVjdXRvciwgbG9jYXRvci5jcnlwdG8sIGxvY2F0b3Iua2V5TG9hZGVyKVxuXHR9KVxuXHRsb2NhdG9yLmNvbnRhY3RGYWNhZGUgPSBsYXp5TWVtb2l6ZWQoYXN5bmMgKCkgPT4ge1xuXHRcdGNvbnN0IHsgQ29udGFjdEZhY2FkZSB9ID0gYXdhaXQgaW1wb3J0KFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvZmFjYWRlcy9sYXp5L0NvbnRhY3RGYWNhZGUuanNcIilcblx0XHRyZXR1cm4gbmV3IENvbnRhY3RGYWNhZGUobmV3IEVudGl0eUNsaWVudChsb2NhdG9yLmNhY2hlKSlcblx0fSlcblx0bG9jYXRvci5tYWlsRXhwb3J0RmFjYWRlID0gbGF6eU1lbW9pemVkKGFzeW5jICgpID0+IHtcblx0XHRjb25zdCB7IE1haWxFeHBvcnRGYWNhZGUgfSA9IGF3YWl0IGltcG9ydChcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL2ZhY2FkZXMvbGF6eS9NYWlsRXhwb3J0RmFjYWRlLmpzXCIpXG5cdFx0Y29uc3QgeyBNYWlsRXhwb3J0VG9rZW5GYWNhZGUgfSA9IGF3YWl0IGltcG9ydChcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL2ZhY2FkZXMvbGF6eS9NYWlsRXhwb3J0VG9rZW5GYWNhZGUuanNcIilcblx0XHRjb25zdCBtYWlsRXhwb3J0VG9rZW5GYWNhZGUgPSBuZXcgTWFpbEV4cG9ydFRva2VuRmFjYWRlKGxvY2F0b3Iuc2VydmljZUV4ZWN1dG9yKVxuXHRcdHJldHVybiBuZXcgTWFpbEV4cG9ydEZhY2FkZShtYWlsRXhwb3J0VG9rZW5GYWNhZGUsIGF3YWl0IGxvY2F0b3IuYnVsa01haWxMb2FkZXIoKSwgYXdhaXQgbG9jYXRvci5ibG9iKCksIGxvY2F0b3IuY3J5cHRvLCBsb2NhdG9yLmJsb2JBY2Nlc3NUb2tlbilcblx0fSlcbn1cblxuY29uc3QgUkVUUllfVElNT1VUX0FGVEVSX0lOSVRfSU5ERVhFUl9FUlJPUl9NUyA9IDMwMDAwXG5cbmFzeW5jIGZ1bmN0aW9uIGluaXRJbmRleGVyKHdvcmtlcjogV29ya2VySW1wbCwgY2FjaGVJbmZvOiBDYWNoZUluZm8sIGtleUxvYWRlckZhY2FkZTogS2V5TG9hZGVyRmFjYWRlKTogUHJvbWlzZTx2b2lkPiB7XG5cdGNvbnN0IGluZGV4ZXIgPSBhd2FpdCBsb2NhdG9yLmluZGV4ZXIoKVxuXHR0cnkge1xuXHRcdGF3YWl0IGluZGV4ZXIuaW5pdCh7XG5cdFx0XHR1c2VyOiBhc3NlcnROb3ROdWxsKGxvY2F0b3IudXNlci5nZXRVc2VyKCkpLFxuXHRcdFx0Y2FjaGVJbmZvLFxuXHRcdFx0a2V5TG9hZGVyRmFjYWRlLFxuXHRcdH0pXG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRpZiAoZSBpbnN0YW5jZW9mIFNlcnZpY2VVbmF2YWlsYWJsZUVycm9yKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhcIlJldHJ5IGluaXQgaW5kZXhlciBpbiAzMCBzZWNvbmRzIGFmdGVyIFNlcnZpY2VVbmF2YWlsYWJsZUVycm9yXCIpXG5cdFx0XHRhd2FpdCBkZWxheShSRVRSWV9USU1PVVRfQUZURVJfSU5JVF9JTkRFWEVSX0VSUk9SX01TKVxuXHRcdFx0Y29uc29sZS5sb2coXCJfaW5pdEluZGV4ZXIgYWZ0ZXIgU2VydmljZVVuYXZhaWxhYmxlRXJyb3JcIilcblx0XHRcdHJldHVybiBpbml0SW5kZXhlcih3b3JrZXIsIGNhY2hlSW5mbywga2V5TG9hZGVyRmFjYWRlKVxuXHRcdH0gZWxzZSBpZiAoZSBpbnN0YW5jZW9mIENvbm5lY3Rpb25FcnJvcikge1xuXHRcdFx0Y29uc29sZS5sb2coXCJSZXRyeSBpbml0IGluZGV4ZXIgaW4gMzAgc2Vjb25kcyBhZnRlciBDb25uZWN0aW9uRXJyb3JcIilcblx0XHRcdGF3YWl0IGRlbGF5KFJFVFJZX1RJTU9VVF9BRlRFUl9JTklUX0lOREVYRVJfRVJST1JfTVMpXG5cdFx0XHRjb25zb2xlLmxvZyhcIl9pbml0SW5kZXhlciBhZnRlciBDb25uZWN0aW9uRXJyb3JcIilcblx0XHRcdHJldHVybiBpbml0SW5kZXhlcih3b3JrZXIsIGNhY2hlSW5mbywga2V5TG9hZGVyRmFjYWRlKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBub3QgYXdhaXRpbmdcblx0XHRcdHdvcmtlci5zZW5kRXJyb3IoZSlcblx0XHRcdHJldHVyblxuXHRcdH1cblx0fVxuXHRpZiAoY2FjaGVJbmZvLmlzUGVyc2lzdGVudCAmJiBjYWNoZUluZm8uaXNOZXdPZmZsaW5lRGIpIHtcblx0XHQvLyBub3QgYXdhaXRpbmdcblx0XHRpbmRleGVyLmVuYWJsZU1haWxJbmRleGluZygpXG5cdH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlc2V0TG9jYXRvcigpOiBQcm9taXNlPHZvaWQ+IHtcblx0YXdhaXQgbG9jYXRvci5sb2dpbi5yZXNldFNlc3Npb24oKVxuXHRhd2FpdCBpbml0TG9jYXRvcihsb2NhdG9yLl93b3JrZXIsIGxvY2F0b3IuX2Jyb3dzZXJEYXRhKVxufVxuXG5pZiAodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIpIHtcblx0OyhzZWxmIGFzIHVua25vd24gYXMgV29ya2VyR2xvYmFsU2NvcGUpLmxvY2F0b3IgPSBsb2NhdG9yIC8vIGV4cG9ydCBpbiB3b3JrZXIgc2NvcGVcbn1cblxuLypcbiAqIEByZXR1cm5zIHRydWUgaWYgd2ViYXNzZW1ibHkgaXMgc3VwcG9ydGVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1dlYkFzc2VtYmx5U3VwcG9ydGVkKCkge1xuXHRyZXR1cm4gdHlwZW9mIFdlYkFzc2VtYmx5ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZSA9PT0gXCJmdW5jdGlvblwiXG59XG4iLCJpbXBvcnQgdHlwZSB7IENvbW1hbmRzIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL3RocmVhZGluZy9NZXNzYWdlRGlzcGF0Y2hlci5qc1wiXG5pbXBvcnQgeyBlcnJvclRvT2JqLCBNZXNzYWdlRGlzcGF0Y2hlciwgUmVxdWVzdCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi90aHJlYWRpbmcvTWVzc2FnZURpc3BhdGNoZXIuanNcIlxuaW1wb3J0IHsgQm9va2luZ0ZhY2FkZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9mYWNhZGVzL2xhenkvQm9va2luZ0ZhY2FkZS5qc1wiXG5pbXBvcnQgeyBOb3RBdXRoZW50aWNhdGVkRXJyb3IgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vZXJyb3IvUmVzdEVycm9yLmpzXCJcbmltcG9ydCB7IFByb2dyYW1taW5nRXJyb3IgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vZXJyb3IvUHJvZ3JhbW1pbmdFcnJvci5qc1wiXG5pbXBvcnQgeyBpbml0TG9jYXRvciwgbG9jYXRvciwgcmVzZXRMb2NhdG9yIH0gZnJvbSBcIi4vV29ya2VyTG9jYXRvci5qc1wiXG5pbXBvcnQgeyBhc3NlcnRXb3JrZXJPck5vZGUsIGlzTWFpbk9yTm9kZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9FbnYuanNcIlxuaW1wb3J0IHR5cGUgeyBCcm93c2VyRGF0YSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vbWlzYy9DbGllbnRDb25zdGFudHMuanNcIlxuaW1wb3J0IHsgQ3J5cHRvRmFjYWRlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL2NyeXB0by9DcnlwdG9GYWNhZGUuanNcIlxuaW1wb3J0IHR5cGUgeyBHaWZ0Q2FyZEZhY2FkZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9mYWNhZGVzL2xhenkvR2lmdENhcmRGYWNhZGUuanNcIlxuaW1wb3J0IHR5cGUgeyBMb2dpbkZhY2FkZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9mYWNhZGVzL0xvZ2luRmFjYWRlLmpzXCJcbmltcG9ydCB0eXBlIHsgQ3VzdG9tZXJGYWNhZGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvZmFjYWRlcy9sYXp5L0N1c3RvbWVyRmFjYWRlLmpzXCJcbmltcG9ydCB0eXBlIHsgR3JvdXBNYW5hZ2VtZW50RmFjYWRlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL2ZhY2FkZXMvbGF6eS9Hcm91cE1hbmFnZW1lbnRGYWNhZGUuanNcIlxuaW1wb3J0IHsgQ29uZmlndXJhdGlvbkRhdGFiYXNlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL2ZhY2FkZXMvbGF6eS9Db25maWd1cmF0aW9uRGF0YWJhc2UuanNcIlxuaW1wb3J0IHsgQ2FsZW5kYXJGYWNhZGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvZmFjYWRlcy9sYXp5L0NhbGVuZGFyRmFjYWRlLmpzXCJcbmltcG9ydCB7IE1haWxGYWNhZGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvZmFjYWRlcy9sYXp5L01haWxGYWNhZGUuanNcIlxuaW1wb3J0IHsgU2hhcmVGYWNhZGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvZmFjYWRlcy9sYXp5L1NoYXJlRmFjYWRlLmpzXCJcbmltcG9ydCB7IENvdW50ZXJGYWNhZGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvZmFjYWRlcy9sYXp5L0NvdW50ZXJGYWNhZGUuanNcIlxuaW1wb3J0IHR5cGUgeyBJbmRleGVyIH0gZnJvbSBcIi4uL2luZGV4L0luZGV4ZXIuanNcIlxuaW1wb3J0IHsgU2VhcmNoRmFjYWRlIH0gZnJvbSBcIi4uL2luZGV4L1NlYXJjaEZhY2FkZS5qc1wiXG5pbXBvcnQgeyBNYWlsQWRkcmVzc0ZhY2FkZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9mYWNhZGVzL2xhenkvTWFpbEFkZHJlc3NGYWNhZGUuanNcIlxuaW1wb3J0IHsgVXNlck1hbmFnZW1lbnRGYWNhZGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvZmFjYWRlcy9sYXp5L1VzZXJNYW5hZ2VtZW50RmFjYWRlLmpzXCJcbmltcG9ydCB7IERlbGF5ZWRJbXBscywgZXhwb3NlTG9jYWxEZWxheWVkLCBleHBvc2VSZW1vdGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vV29ya2VyUHJveHkuanNcIlxuaW1wb3J0IHsgcmFuZG9tIH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS1jcnlwdG9cIlxuaW1wb3J0IHR5cGUgeyBOYXRpdmVJbnRlcmZhY2UgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL25hdGl2ZS9jb21tb24vTmF0aXZlSW50ZXJmYWNlLmpzXCJcbmltcG9ydCB0eXBlIHsgRW50aXR5UmVzdEludGVyZmFjZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9yZXN0L0VudGl0eVJlc3RDbGllbnQuanNcIlxuaW1wb3J0IHsgUmVzdENsaWVudCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9yZXN0L1Jlc3RDbGllbnQuanNcIlxuaW1wb3J0IHsgSVNlcnZpY2VFeGVjdXRvciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9TZXJ2aWNlUmVxdWVzdC5qc1wiXG5pbXBvcnQgeyBCbG9iRmFjYWRlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL2ZhY2FkZXMvbGF6eS9CbG9iRmFjYWRlLmpzXCJcbmltcG9ydCB7IEV4cG9zZWRDYWNoZVN0b3JhZ2UgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvcmVzdC9EZWZhdWx0RW50aXR5UmVzdENhY2hlLmpzXCJcbmltcG9ydCB7IEJsb2JBY2Nlc3NUb2tlbkZhY2FkZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9mYWNhZGVzL0Jsb2JBY2Nlc3NUb2tlbkZhY2FkZS5qc1wiXG5pbXBvcnQgeyBFbnRyb3B5RmFjYWRlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL2ZhY2FkZXMvRW50cm9weUZhY2FkZS5qc1wiXG5pbXBvcnQgeyBXb3JrZXJGYWNhZGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvZmFjYWRlcy9Xb3JrZXJGYWNhZGUuanNcIlxuaW1wb3J0IHsgU3FsQ2lwaGVyRmFjYWRlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9uYXRpdmUvY29tbW9uL2dlbmVyYXRlZGlwYy9TcWxDaXBoZXJGYWNhZGUuanNcIlxuaW1wb3J0IHsgV2ViV29ya2VyVHJhbnNwb3J0IH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL3RocmVhZGluZy9UcmFuc3BvcnQuanNcIlxuaW1wb3J0IHsgQ29udGFjdEZhY2FkZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9mYWNhZGVzL2xhenkvQ29udGFjdEZhY2FkZS5qc1wiXG5pbXBvcnQgeyBSZWNvdmVyQ29kZUZhY2FkZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9mYWNhZGVzL2xhenkvUmVjb3ZlckNvZGVGYWNhZGUuanNcIlxuaW1wb3J0IHsgQ2FjaGVNYW5hZ2VtZW50RmFjYWRlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL2ZhY2FkZXMvbGF6eS9DYWNoZU1hbmFnZW1lbnRGYWNhZGUuanNcIlxuaW1wb3J0IHsgRXhwb3NlZEV2ZW50QnVzLCBNYWluSW50ZXJmYWNlLCBXb3JrZXJSYW5kb21pemVyIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL3dvcmtlckludGVyZmFjZXMuanNcIlxuaW1wb3J0IHsgQ3J5cHRvRXJyb3IgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLWNyeXB0by9lcnJvci5qc1wiXG5pbXBvcnQgeyBDcnlwdG9XcmFwcGVyIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL2NyeXB0by9DcnlwdG9XcmFwcGVyLmpzXCJcbmltcG9ydCB7IEFzeW1tZXRyaWNDcnlwdG9GYWNhZGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvY3J5cHRvL0FzeW1tZXRyaWNDcnlwdG9GYWNhZGUuanNcIlxuaW1wb3J0IHsgUHVibGljS2V5UHJvdmlkZXIgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvZmFjYWRlcy9QdWJsaWNLZXlQcm92aWRlci5qc1wiXG5pbXBvcnQgeyBNYWlsRXhwb3J0RmFjYWRlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL2ZhY2FkZXMvbGF6eS9NYWlsRXhwb3J0RmFjYWRlXCJcbmltcG9ydCB7IEJ1bGtNYWlsTG9hZGVyIH0gZnJvbSBcIi4uL2luZGV4L0J1bGtNYWlsTG9hZGVyLmpzXCJcblxuYXNzZXJ0V29ya2VyT3JOb2RlKClcblxuLyoqIEludGVyZmFjZSBvZiB0aGUgZmFjYWRlcyBleHBvc2VkIGJ5IHRoZSB3b3JrZXIsIGJhc2ljYWxseSBpbnRlcmZhY2UgZm9yIHRoZSB3b3JrZXIgaXRzZWxmICovXG5leHBvcnQgaW50ZXJmYWNlIFdvcmtlckludGVyZmFjZSB7XG5cdHJlYWRvbmx5IGxvZ2luRmFjYWRlOiBMb2dpbkZhY2FkZVxuXHRyZWFkb25seSBjdXN0b21lckZhY2FkZTogQ3VzdG9tZXJGYWNhZGVcblx0cmVhZG9ubHkgZ2lmdENhcmRGYWNhZGU6IEdpZnRDYXJkRmFjYWRlXG5cdHJlYWRvbmx5IGdyb3VwTWFuYWdlbWVudEZhY2FkZTogR3JvdXBNYW5hZ2VtZW50RmFjYWRlXG5cdHJlYWRvbmx5IGNvbmZpZ0ZhY2FkZTogQ29uZmlndXJhdGlvbkRhdGFiYXNlXG5cdHJlYWRvbmx5IGNhbGVuZGFyRmFjYWRlOiBDYWxlbmRhckZhY2FkZVxuXHRyZWFkb25seSBtYWlsRmFjYWRlOiBNYWlsRmFjYWRlXG5cdHJlYWRvbmx5IHNoYXJlRmFjYWRlOiBTaGFyZUZhY2FkZVxuXHRyZWFkb25seSBjYWNoZU1hbmFnZW1lbnRGYWNhZGU6IENhY2hlTWFuYWdlbWVudEZhY2FkZVxuXHRyZWFkb25seSBjb3VudGVyRmFjYWRlOiBDb3VudGVyRmFjYWRlXG5cdHJlYWRvbmx5IGluZGV4ZXJGYWNhZGU6IEluZGV4ZXJcblx0cmVhZG9ubHkgc2VhcmNoRmFjYWRlOiBTZWFyY2hGYWNhZGVcblx0cmVhZG9ubHkgYm9va2luZ0ZhY2FkZTogQm9va2luZ0ZhY2FkZVxuXHRyZWFkb25seSBtYWlsQWRkcmVzc0ZhY2FkZTogTWFpbEFkZHJlc3NGYWNhZGVcblx0cmVhZG9ubHkgYmxvYkFjY2Vzc1Rva2VuRmFjYWRlOiBCbG9iQWNjZXNzVG9rZW5GYWNhZGVcblx0cmVhZG9ubHkgYmxvYkZhY2FkZTogQmxvYkZhY2FkZVxuXHRyZWFkb25seSB1c2VyTWFuYWdlbWVudEZhY2FkZTogVXNlck1hbmFnZW1lbnRGYWNhZGVcblx0cmVhZG9ubHkgcmVjb3ZlckNvZGVGYWNhZGU6IFJlY292ZXJDb2RlRmFjYWRlXG5cdHJlYWRvbmx5IHJlc3RJbnRlcmZhY2U6IEVudGl0eVJlc3RJbnRlcmZhY2Vcblx0cmVhZG9ubHkgc2VydmljZUV4ZWN1dG9yOiBJU2VydmljZUV4ZWN1dG9yXG5cdHJlYWRvbmx5IGNyeXB0b1dyYXBwZXI6IENyeXB0b1dyYXBwZXJcblx0cmVhZG9ubHkgcHVibGljS2V5UHJvdmlkZXI6IFB1YmxpY0tleVByb3ZpZGVyXG5cdHJlYWRvbmx5IGFzeW1tZXRyaWNDcnlwdG9GYWNhZGU6IEFzeW1tZXRyaWNDcnlwdG9GYWNhZGVcblx0cmVhZG9ubHkgY3J5cHRvRmFjYWRlOiBDcnlwdG9GYWNhZGVcblx0cmVhZG9ubHkgY2FjaGVTdG9yYWdlOiBFeHBvc2VkQ2FjaGVTdG9yYWdlXG5cdHJlYWRvbmx5IHNxbENpcGhlckZhY2FkZTogU3FsQ2lwaGVyRmFjYWRlXG5cdHJlYWRvbmx5IHJhbmRvbTogV29ya2VyUmFuZG9taXplclxuXHRyZWFkb25seSBldmVudEJ1czogRXhwb3NlZEV2ZW50QnVzXG5cdHJlYWRvbmx5IGVudHJvcHlGYWNhZGU6IEVudHJvcHlGYWNhZGVcblx0cmVhZG9ubHkgd29ya2VyRmFjYWRlOiBXb3JrZXJGYWNhZGVcblx0cmVhZG9ubHkgY29udGFjdEZhY2FkZTogQ29udGFjdEZhY2FkZVxuXHRyZWFkb25seSBtYWlsRXhwb3J0RmFjYWRlOiBNYWlsRXhwb3J0RmFjYWRlXG5cdHJlYWRvbmx5IGJ1bGtNYWlsTG9hZGVyOiBCdWxrTWFpbExvYWRlclxufVxuXG50eXBlIFdvcmtlclJlcXVlc3QgPSBSZXF1ZXN0PFdvcmtlclJlcXVlc3RUeXBlPlxuXG5leHBvcnQgY2xhc3MgV29ya2VySW1wbCBpbXBsZW1lbnRzIE5hdGl2ZUludGVyZmFjZSB7XG5cdHByaXZhdGUgcmVhZG9ubHkgX3Njb3BlOiBEZWRpY2F0ZWRXb3JrZXJHbG9iYWxTY29wZVxuXHRwcml2YXRlIHJlYWRvbmx5IF9kaXNwYXRjaGVyOiBNZXNzYWdlRGlzcGF0Y2hlcjxNYWluUmVxdWVzdFR5cGUsIFdvcmtlclJlcXVlc3RUeXBlPlxuXG5cdGNvbnN0cnVjdG9yKHNlbGY6IERlZGljYXRlZFdvcmtlckdsb2JhbFNjb3BlKSB7XG5cdFx0dGhpcy5fc2NvcGUgPSBzZWxmXG5cdFx0dGhpcy5fZGlzcGF0Y2hlciA9IG5ldyBNZXNzYWdlRGlzcGF0Y2hlcihuZXcgV2ViV29ya2VyVHJhbnNwb3J0KHRoaXMuX3Njb3BlKSwgdGhpcy5xdWV1ZUNvbW1hbmRzKHRoaXMuZXhwb3NlZEludGVyZmFjZSksIFwid29ya2VyLW1haW5cIilcblx0fVxuXG5cdGFzeW5jIGluaXQoYnJvd3NlckRhdGE6IEJyb3dzZXJEYXRhKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Ly8gaW1wb3J0KFwidHV0YS1zZGtcIikudGhlbihhc3luYyAobW9kdWxlKSA9PiB7XG5cdFx0Ly8gXHQvLyBhd2FpdCBtb2R1bGUuZGVmYXVsdChcIndhc20vdHV0YXNkay53YXNtXCIpXG5cdFx0Ly8gXHRjb25zdCBlbnRpdHlDbGllbnQgPSBuZXcgbW9kdWxlLkVudGl0eUNsaWVudCgpXG5cdFx0Ly8gXHRjb25zdCB0eXBlUmVmID0gbmV3IG1vZHVsZS5UeXBlUmVmKFwidHV0YW5vdGFcIiwgXCJNYWlsXCIpXG5cdFx0Ly8gXHRjb25zb2xlLmxvZyhcInJlc3VsdCBmcm9tIHJ1c3Q6IFwiLCBhd2FpIHQgZW50aXR5Q2xpZW50LmxvYWRfZWxlbWVudCh0eXBlUmVmLCBcIm15SWRcIikpXG5cdFx0Ly8gXHR0eXBlUmVmLmZyZWUoKVxuXHRcdC8vIFx0ZW50aXR5Q2xpZW50LmZyZWUoKVxuXHRcdC8vIH0pXG5cblx0XHRhd2FpdCBpbml0TG9jYXRvcih0aGlzLCBicm93c2VyRGF0YSlcblx0XHRjb25zdCB3b3JrZXJTY29wZSA9IHRoaXMuX3Njb3BlXG5cblx0XHQvLyBvbmx5IHJlZ2lzdGVyIG9uY2F1Z2h0IGVycm9yIGhhbmRsZXIgaWYgd2UgYXJlIGluIHRoZSAqcmVhbCogd29ya2VyIHNjb3BlXG5cdFx0Ly8gT3RoZXJ3aXNlIHVuY2F1Z2h0IGVycm9yIGhhbmRsZXIgbWlnaHQgZW5kIHVwIGluIGFuIGluZmluaXRlIGxvb3AgZm9yIHRlc3QgY2FzZXMuXG5cdFx0aWYgKHdvcmtlclNjb3BlICYmICFpc01haW5Pck5vZGUoKSkge1xuXHRcdFx0d29ya2VyU2NvcGUuYWRkRXZlbnRMaXN0ZW5lcihcInVuaGFuZGxlZHJlamVjdGlvblwiLCAoZXZlbnQ6IFByb21pc2VSZWplY3Rpb25FdmVudCkgPT4ge1xuXHRcdFx0XHR0aGlzLnNlbmRFcnJvcihldmVudC5yZWFzb24pXG5cdFx0XHR9KVxuXG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR3b3JrZXJTY29wZS5vbmVycm9yID0gKGU6IHN0cmluZyB8IEV2ZW50LCBzb3VyY2UsIGxpbmVubywgY29sbm8sIGVycm9yKSA9PiB7XG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoXCJ3b3JrZXJJbXBsLm9uZXJyb3JcIiwgZSwgc291cmNlLCBsaW5lbm8sIGNvbG5vLCBlcnJvcilcblxuXHRcdFx0XHRpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvcikge1xuXHRcdFx0XHRcdHRoaXMuc2VuZEVycm9yKGVycm9yKVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRjb25zdCBlcnIgPSBuZXcgRXJyb3IoZSlcblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0ZXJyLmxpbmVOdW1iZXIgPSBsaW5lbm9cblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0ZXJyLmNvbHVtbk51bWJlciA9IGNvbG5vXG5cdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdGVyci5maWxlTmFtZSA9IHNvdXJjZVxuXHRcdFx0XHRcdHRoaXMuc2VuZEVycm9yKGVycilcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiB0cnVlXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Z2V0IGV4cG9zZWRJbnRlcmZhY2UoKTogRGVsYXllZEltcGxzPFdvcmtlckludGVyZmFjZT4ge1xuXHRcdHJldHVybiB7XG5cdFx0XHRhc3luYyBsb2dpbkZhY2FkZSgpIHtcblx0XHRcdFx0cmV0dXJuIGxvY2F0b3IubG9naW5cblx0XHRcdH0sXG5cblx0XHRcdGFzeW5jIGN1c3RvbWVyRmFjYWRlKCkge1xuXHRcdFx0XHRyZXR1cm4gbG9jYXRvci5jdXN0b21lcigpXG5cdFx0XHR9LFxuXG5cdFx0XHRhc3luYyBnaWZ0Q2FyZEZhY2FkZSgpIHtcblx0XHRcdFx0cmV0dXJuIGxvY2F0b3IuZ2lmdENhcmRzKClcblx0XHRcdH0sXG5cblx0XHRcdGFzeW5jIGdyb3VwTWFuYWdlbWVudEZhY2FkZSgpIHtcblx0XHRcdFx0cmV0dXJuIGxvY2F0b3IuZ3JvdXBNYW5hZ2VtZW50KClcblx0XHRcdH0sXG5cblx0XHRcdGFzeW5jIGNvbmZpZ0ZhY2FkZSgpIHtcblx0XHRcdFx0cmV0dXJuIGxvY2F0b3IuY29uZmlnRmFjYWRlKClcblx0XHRcdH0sXG5cblx0XHRcdGFzeW5jIGNhbGVuZGFyRmFjYWRlKCkge1xuXHRcdFx0XHRyZXR1cm4gbG9jYXRvci5jYWxlbmRhcigpXG5cdFx0XHR9LFxuXG5cdFx0XHRhc3luYyBtYWlsRmFjYWRlKCkge1xuXHRcdFx0XHRyZXR1cm4gbG9jYXRvci5tYWlsKClcblx0XHRcdH0sXG5cblx0XHRcdGFzeW5jIHNoYXJlRmFjYWRlKCkge1xuXHRcdFx0XHRyZXR1cm4gbG9jYXRvci5zaGFyZSgpXG5cdFx0XHR9LFxuXG5cdFx0XHRhc3luYyBjYWNoZU1hbmFnZW1lbnRGYWNhZGUoKSB7XG5cdFx0XHRcdHJldHVybiBsb2NhdG9yLmNhY2hlTWFuYWdlbWVudCgpXG5cdFx0XHR9LFxuXG5cdFx0XHRhc3luYyBjb3VudGVyRmFjYWRlKCkge1xuXHRcdFx0XHRyZXR1cm4gbG9jYXRvci5jb3VudGVycygpXG5cdFx0XHR9LFxuXG5cdFx0XHRhc3luYyBpbmRleGVyRmFjYWRlKCkge1xuXHRcdFx0XHRyZXR1cm4gbG9jYXRvci5pbmRleGVyKClcblx0XHRcdH0sXG5cblx0XHRcdGFzeW5jIHNlYXJjaEZhY2FkZSgpIHtcblx0XHRcdFx0cmV0dXJuIGxvY2F0b3Iuc2VhcmNoKClcblx0XHRcdH0sXG5cblx0XHRcdGFzeW5jIGJvb2tpbmdGYWNhZGUoKSB7XG5cdFx0XHRcdHJldHVybiBsb2NhdG9yLmJvb2tpbmcoKVxuXHRcdFx0fSxcblxuXHRcdFx0YXN5bmMgbWFpbEFkZHJlc3NGYWNhZGUoKSB7XG5cdFx0XHRcdHJldHVybiBsb2NhdG9yLm1haWxBZGRyZXNzKClcblx0XHRcdH0sXG5cblx0XHRcdGFzeW5jIGJsb2JBY2Nlc3NUb2tlbkZhY2FkZSgpIHtcblx0XHRcdFx0cmV0dXJuIGxvY2F0b3IuYmxvYkFjY2Vzc1Rva2VuXG5cdFx0XHR9LFxuXG5cdFx0XHRhc3luYyBibG9iRmFjYWRlKCkge1xuXHRcdFx0XHRyZXR1cm4gbG9jYXRvci5ibG9iKClcblx0XHRcdH0sXG5cblx0XHRcdGFzeW5jIHVzZXJNYW5hZ2VtZW50RmFjYWRlKCkge1xuXHRcdFx0XHRyZXR1cm4gbG9jYXRvci51c2VyTWFuYWdlbWVudCgpXG5cdFx0XHR9LFxuXG5cdFx0XHRhc3luYyByZWNvdmVyQ29kZUZhY2FkZSgpIHtcblx0XHRcdFx0cmV0dXJuIGxvY2F0b3IucmVjb3ZlckNvZGUoKVxuXHRcdFx0fSxcblxuXHRcdFx0YXN5bmMgcmVzdEludGVyZmFjZSgpIHtcblx0XHRcdFx0cmV0dXJuIGxvY2F0b3IuY2FjaGVcblx0XHRcdH0sXG5cblx0XHRcdGFzeW5jIHNlcnZpY2VFeGVjdXRvcigpIHtcblx0XHRcdFx0cmV0dXJuIGxvY2F0b3Iuc2VydmljZUV4ZWN1dG9yXG5cdFx0XHR9LFxuXG5cdFx0XHRhc3luYyBjcnlwdG9XcmFwcGVyKCkge1xuXHRcdFx0XHRyZXR1cm4gbG9jYXRvci5jcnlwdG9XcmFwcGVyXG5cdFx0XHR9LFxuXG5cdFx0XHRhc3luYyBwdWJsaWNLZXlQcm92aWRlcigpIHtcblx0XHRcdFx0cmV0dXJuIGxvY2F0b3IucHVibGljS2V5UHJvdmlkZXJcblx0XHRcdH0sXG5cblx0XHRcdGFzeW5jIGFzeW1tZXRyaWNDcnlwdG9GYWNhZGUoKSB7XG5cdFx0XHRcdHJldHVybiBsb2NhdG9yLmFzeW1tZXRyaWNDcnlwdG9cblx0XHRcdH0sXG5cblx0XHRcdGFzeW5jIGNyeXB0b0ZhY2FkZSgpIHtcblx0XHRcdFx0cmV0dXJuIGxvY2F0b3IuY3J5cHRvXG5cdFx0XHR9LFxuXG5cdFx0XHRhc3luYyBjYWNoZVN0b3JhZ2UoKSB7XG5cdFx0XHRcdHJldHVybiBsb2NhdG9yLmNhY2hlU3RvcmFnZVxuXHRcdFx0fSxcblxuXHRcdFx0YXN5bmMgc3FsQ2lwaGVyRmFjYWRlKCkge1xuXHRcdFx0XHRyZXR1cm4gbG9jYXRvci5zcWxDaXBoZXJGYWNhZGVcblx0XHRcdH0sXG5cblx0XHRcdGFzeW5jIHJhbmRvbSgpIHtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRhc3luYyBnZW5lcmF0ZVJhbmRvbU51bWJlcihuYnJPZkJ5dGVzOiBudW1iZXIpIHtcblx0XHRcdFx0XHRcdHJldHVybiByYW5kb20uZ2VuZXJhdGVSYW5kb21OdW1iZXIobmJyT2ZCeXRlcylcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXG5cdFx0XHRhc3luYyBldmVudEJ1cygpIHtcblx0XHRcdFx0cmV0dXJuIGxvY2F0b3IuZXZlbnRCdXNDbGllbnRcblx0XHRcdH0sXG5cblx0XHRcdGFzeW5jIGVudHJvcHlGYWNhZGUoKSB7XG5cdFx0XHRcdHJldHVybiBsb2NhdG9yLmVudHJvcHlGYWNhZGVcblx0XHRcdH0sXG5cblx0XHRcdGFzeW5jIHdvcmtlckZhY2FkZSgpIHtcblx0XHRcdFx0cmV0dXJuIGxvY2F0b3Iud29ya2VyRmFjYWRlXG5cdFx0XHR9LFxuXG5cdFx0XHRhc3luYyBjb250YWN0RmFjYWRlKCkge1xuXHRcdFx0XHRyZXR1cm4gbG9jYXRvci5jb250YWN0RmFjYWRlKClcblx0XHRcdH0sXG5cdFx0XHRhc3luYyBidWxrTWFpbExvYWRlcigpIHtcblx0XHRcdFx0cmV0dXJuIGxvY2F0b3IuYnVsa01haWxMb2FkZXIoKVxuXHRcdFx0fSxcblx0XHRcdGFzeW5jIG1haWxFeHBvcnRGYWNhZGUoKSB7XG5cdFx0XHRcdHJldHVybiBsb2NhdG9yLm1haWxFeHBvcnRGYWNhZGUoKVxuXHRcdFx0fSxcblx0XHR9XG5cdH1cblxuXHRxdWV1ZUNvbW1hbmRzKGV4cG9zZWRXb3JrZXI6IERlbGF5ZWRJbXBsczxXb3JrZXJJbnRlcmZhY2U+KTogQ29tbWFuZHM8V29ya2VyUmVxdWVzdFR5cGU+IHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0c2V0dXA6IGFzeW5jIChtZXNzYWdlKSA9PiB7XG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoXCJXb3JrZXJJbXBsOiBzZXR1cCB3YXMgY2FsbGVkIGFmdGVyIGJvb3RzdHJhcCEgbWVzc2FnZTogXCIsIG1lc3NhZ2UpXG5cdFx0XHR9LFxuXHRcdFx0dGVzdEVjaG86IChtZXNzYWdlKSA9PlxuXHRcdFx0XHRQcm9taXNlLnJlc29sdmUoe1xuXHRcdFx0XHRcdG1zZzogXCI+Pj4gXCIgKyBtZXNzYWdlLmFyZ3NbMF0ubXNnLFxuXHRcdFx0XHR9KSxcblx0XHRcdHRlc3RFcnJvcjogKG1lc3NhZ2UpID0+IHtcblx0XHRcdFx0Y29uc3QgZXJyb3JUeXBlcyA9IHtcblx0XHRcdFx0XHRQcm9ncmFtbWluZ0Vycm9yLFxuXHRcdFx0XHRcdENyeXB0b0Vycm9yLFxuXHRcdFx0XHRcdE5vdEF1dGhlbnRpY2F0ZWRFcnJvcixcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdGxldCBFcnJvclR5cGUgPSBlcnJvclR5cGVzW21lc3NhZ2UuYXJnc1swXS5lcnJvclR5cGVdXG5cdFx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3JUeXBlKGB3dGY6ICR7bWVzc2FnZS5hcmdzWzBdLmVycm9yVHlwZX1gKSlcblx0XHRcdH0sXG5cdFx0XHRyZXNldDogKG1lc3NhZ2U6IFdvcmtlclJlcXVlc3QpID0+IHtcblx0XHRcdFx0cmV0dXJuIHJlc2V0TG9jYXRvcigpXG5cdFx0XHR9LFxuXHRcdFx0cmVzdFJlcXVlc3Q6IChtZXNzYWdlOiBXb3JrZXJSZXF1ZXN0KSA9PiB7XG5cdFx0XHRcdC8vIFRoaXMgaG9ycm9yIGlzIHRvIGFkZCBhdXRoIGhlYWRlcnMgdG8gdGhlIGFkbWluIGNsaWVudFxuXHRcdFx0XHRjb25zdCBhcmdzID0gbWVzc2FnZS5hcmdzIGFzIFBhcmFtZXRlcnM8UmVzdENsaWVudFtcInJlcXVlc3RcIl0+XG5cdFx0XHRcdGxldCBbcGF0aCwgbWV0aG9kLCBvcHRpb25zXSA9IGFyZ3Ncblx0XHRcdFx0b3B0aW9ucyA9IG9wdGlvbnMgPz8ge31cblx0XHRcdFx0b3B0aW9ucy5oZWFkZXJzID0geyAuLi5sb2NhdG9yLnVzZXIuY3JlYXRlQXV0aEhlYWRlcnMoKSwgLi4ub3B0aW9ucy5oZWFkZXJzIH1cblx0XHRcdFx0cmV0dXJuIGxvY2F0b3IucmVzdENsaWVudC5yZXF1ZXN0KHBhdGgsIG1ldGhvZCwgb3B0aW9ucylcblx0XHRcdH0sXG5cblx0XHRcdGZhY2FkZTogZXhwb3NlTG9jYWxEZWxheWVkPERlbGF5ZWRJbXBsczxXb3JrZXJJbnRlcmZhY2U+LCBXb3JrZXJSZXF1ZXN0VHlwZT4oZXhwb3NlZFdvcmtlciksXG5cdFx0fVxuXHR9XG5cblx0aW52b2tlTmF0aXZlKHJlcXVlc3RUeXBlOiBzdHJpbmcsIGFyZ3M6IFJlYWRvbmx5QXJyYXk8dW5rbm93bj4pOiBQcm9taXNlPGFueT4ge1xuXHRcdHJldHVybiB0aGlzLl9kaXNwYXRjaGVyLnBvc3RSZXF1ZXN0KG5ldyBSZXF1ZXN0KFwiZXhlY05hdGl2ZVwiLCBbcmVxdWVzdFR5cGUsIGFyZ3NdKSlcblx0fVxuXG5cdGdldE1haW5JbnRlcmZhY2UoKTogTWFpbkludGVyZmFjZSB7XG5cdFx0cmV0dXJuIGV4cG9zZVJlbW90ZTxNYWluSW50ZXJmYWNlPigocmVxdWVzdCkgPT4gdGhpcy5fZGlzcGF0Y2hlci5wb3N0UmVxdWVzdChyZXF1ZXN0KSlcblx0fVxuXG5cdHNlbmRFcnJvcihlOiBFcnJvcik6IFByb21pc2U8dm9pZD4ge1xuXHRcdHJldHVybiB0aGlzLl9kaXNwYXRjaGVyLnBvc3RSZXF1ZXN0KG5ldyBSZXF1ZXN0KFwiZXJyb3JcIiwgW2Vycm9yVG9PYmooZSldKSlcblx0fVxufVxuIiwiaW1wb3J0IHsgV29ya2VySW1wbCB9IGZyb20gXCIuL1dvcmtlckltcGwuanNcIlxuaW1wb3J0IHsgTG9nZ2VyLCByZXBsYWNlTmF0aXZlTG9nZ2VyIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL0xvZ2dlci5qc1wiXG5cbi8qKlxuICogUmVjZWl2ZXMgdGhlIGZpcnN0IG1lc3NhZ2UgZnJvbSB0aGUgY2xpZW50IGFuZCBpbml0aWFsaXplcyB0aGUgV29ya2VySW1wbCB0byByZWNlaXZlIGFsbCBmdXR1cmUgbWVzc2FnZXMuIFNlbmRzIGEgcmVzcG9uc2UgdG8gdGhlIGNsaWVudCBvbiB0aGlzIGZpcnN0IG1lc3NhZ2UuXG4gKi9cbnNlbGYub25tZXNzYWdlID0gZnVuY3Rpb24gKG1zZykge1xuXHRjb25zdCBkYXRhID0gbXNnLmRhdGFcblxuXHRpZiAoZGF0YS5yZXF1ZXN0VHlwZSA9PT0gXCJzZXR1cFwiKSB7XG5cdFx0c2VsZi5lbnYgPSBkYXRhLmFyZ3NbMF1cblx0XHRyZXBsYWNlTmF0aXZlTG9nZ2VyKHNlbGYsIG5ldyBMb2dnZXIoKSlcblx0XHRQcm9taXNlLnJlc29sdmUoKVxuXHRcdFx0LnRoZW4oYXN5bmMgKCkgPT4ge1xuXHRcdFx0XHRjb25zdCBpbml0aWFsUmFuZG9taXplckVudHJvcHkgPSBkYXRhLmFyZ3NbMV1cblx0XHRcdFx0Y29uc3QgYnJvd3NlckRhdGEgPSBkYXRhLmFyZ3NbMl1cblxuXHRcdFx0XHRpZiAoaW5pdGlhbFJhbmRvbWl6ZXJFbnRyb3B5ID09IG51bGwgfHwgYnJvd3NlckRhdGEgPT0gbnVsbCkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgV29ya2VyIGFyZ3VtZW50c1wiKVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRjb25zdCB3b3JrZXJJbXBsID0gbmV3IFdvcmtlckltcGwodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogbnVsbClcblx0XHRcdFx0YXdhaXQgd29ya2VySW1wbC5pbml0KGJyb3dzZXJEYXRhKVxuXHRcdFx0XHR3b3JrZXJJbXBsLmV4cG9zZWRJbnRlcmZhY2UuZW50cm9weUZhY2FkZSgpLnRoZW4oKGVudHJvcHlGYWNhZGUpID0+IGVudHJvcHlGYWNhZGUuYWRkRW50cm9weShpbml0aWFsUmFuZG9taXplckVudHJvcHkpKVxuXHRcdFx0XHRzZWxmLnBvc3RNZXNzYWdlKHtcblx0XHRcdFx0XHRpZDogZGF0YS5pZCxcblx0XHRcdFx0XHR0eXBlOiBcInJlc3BvbnNlXCIsXG5cdFx0XHRcdFx0dmFsdWU6IHt9LFxuXHRcdFx0XHR9KVxuXHRcdFx0fSlcblx0XHRcdC5jYXRjaCgoZSkgPT4ge1xuXHRcdFx0XHRzZWxmLnBvc3RNZXNzYWdlKHtcblx0XHRcdFx0XHRpZDogZGF0YS5pZCxcblx0XHRcdFx0XHR0eXBlOiBcImVycm9yXCIsXG5cdFx0XHRcdFx0ZXJyb3I6IEpTT04uc3RyaW5naWZ5KHtcblx0XHRcdFx0XHRcdG5hbWU6IFwiRXJyb3JcIixcblx0XHRcdFx0XHRcdG1lc3NhZ2U6IGUubWVzc2FnZSxcblx0XHRcdFx0XHRcdHN0YWNrOiBlLnN0YWNrLFxuXHRcdFx0XHRcdH0pLFxuXHRcdFx0XHR9KVxuXHRcdFx0fSlcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJ3b3JrZXIgbm90IHlldCByZWFkeS4gUmVxdWVzdCB0eXBlOiBcIiArIGRhdGEucmVxdWVzdFR5cGUpXG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBS2Esb0JBQU4sTUFBd0I7Q0FDOUI7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUVBLFlBQTZCQSxvQkFBd0NDLGVBQThCO0VBdUVuRyxLQXZFNkI7QUFDNUIsT0FBSyxlQUFlO0FBQ3BCLE9BQUssa0JBQWtCO0FBQ3ZCLE9BQUssb0JBQW9CLENBQUU7QUFDM0IsT0FBSyxzQkFBc0I7QUFDM0IsT0FBSyxXQUFXO0NBQ2hCOzs7O0NBTUQsNkJBQTZCQywyQkFBbUNDLGFBQWtCO0FBQ2pGLE9BQUssS0FBSyxhQUFhLEVBQUU7QUFDeEIsV0FBUSxLQUFLLHlCQUF5QixZQUFZLE1BQU0sMEJBQTBCLEdBQUc7QUFDckYsUUFBSyxlQUFlO0dBQ3BCLE1BQU0sc0JBQXNCLEtBQUssS0FBSztBQUV0QyxRQUFLLFNBQVMsV0FBVyxZQUFZO0FBQ3BDLFNBQUssZUFBZTtBQUNwQixZQUFRLEtBQUssNkJBQTZCLEtBQUssS0FBSyxHQUFHLHVCQUF1QixJQUFLLEdBQUc7QUFDdEYsVUFBTSxLQUFLLHVCQUF1QjtHQUNsQyxHQUFFLDRCQUE0QixJQUFLO0FBRXBDLFFBQUssS0FBSyxxQkFBcUI7QUFDOUIsU0FBSyxtQkFBbUIsY0FBYztLQUNyQyxnQkFBZ0I7S0FDaEIsTUFBTSxDQUFFO0lBQ1IsRUFBQztBQUVGLFNBQUssc0JBQXNCO0dBQzNCO0VBQ0Q7Q0FDRDtDQUVELGNBQXVCO0FBQ3RCLFNBQU8sS0FBSztDQUNaOzs7Ozs7Q0FPRCxhQUFhQyxTQUEyQztBQUN2RCxNQUFJ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