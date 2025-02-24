import { ProgrammingError } from "./ProgrammingError-chunk.js";
import { assertWorkerOrNode, isAdminClient } from "./Env-chunk.js";
import { arrayEquals, assertNotNull, base64ToBase64Ext, base64ToBase64Url, base64ToUint8Array, base64UrlToBase64, defer, hexToUint8Array, neverNull, ofClass, uint8ArrayToBase64, utf8Uint8ArrayToString } from "./dist2-chunk.js";
import { AccountType, CloseEventBusOption, Const, DEFAULT_KDF_TYPE, KdfType, asKdfType } from "./TutanotaConstants-chunk.js";
import { GENERATED_ID_BYTES_LENGTH, isSameId } from "./EntityUtils-chunk.js";
import { TutanotaPropertiesTypeRef } from "./TypeRefs-chunk.js";
import { GroupInfoTypeRef, RecoverCodeTypeRef, SessionTypeRef, UserTypeRef, createChangeKdfPostIn, createChangePasswordPostIn, createCreateSessionData, createDeleteCustomerData, createResetFactorsDeleteData, createSaltData, createSecondFactorAuthDeleteData, createSecondFactorAuthGetData, createTakeOverDeletedAddressData, createVerifierTokenServiceIn } from "./TypeRefs2-chunk.js";
import { HttpMethod, MediaType, resolveTypeReference } from "./EntityFunctions-chunk.js";
import { AccessExpiredError, ConnectionError, LockedError, NotAuthenticatedError, NotFoundError, SessionExpiredError } from "./RestError-chunk.js";
import { CancelledError } from "./CancelledError-chunk.js";
import { ConnectMode, EntityRestClient, typeRefToPath } from "./EntityRestClient-chunk.js";
import { LoginIncompleteError } from "./LoginIncompleteError-chunk.js";
import { KeyLength, TotpVerifier, aes256DecryptWithRecoveryKey, aes256RandomKey, aesDecrypt, base64ToKey, createAuthVerifier, createAuthVerifierAsBase64Url, encryptKey, generateKeyFromPassphrase$1 as generateKeyFromPassphrase, generateRandomSalt, keyToUint8Array, sha256Hash, uint8ArrayToBitArray } from "./dist3-chunk.js";
import { SessionType } from "./SessionType-chunk.js";
import { ChangeKdfService, ChangePasswordService, CustomerService, ResetFactorsService, SaltService, SecondFactorAuthService, SessionService, TakeOverDeletedAddressService, VerifierTokenService } from "./Services-chunk.js";
import { EntityClient } from "./EntityClient-chunk.js";
import { LoginFailReason } from "./PageContextLoginListener-chunk.js";
import { CredentialType } from "./CredentialType-chunk.js";
import { encryptString } from "./CryptoWrapper-chunk.js";

//#region src/common/api/worker/facades/LoginFacade.ts
assertWorkerOrNode();
let ResumeSessionErrorReason = function(ResumeSessionErrorReason$1) {
	ResumeSessionErrorReason$1[ResumeSessionErrorReason$1["OfflineNotAvailableForFree"] = 0] = "OfflineNotAvailableForFree";
	return ResumeSessionErrorReason$1;
}({});
var LoginFacade = class {
	eventBusClient;
	/**
	* Used for cancelling second factor and to not mix different attempts
	*/
	loginRequestSessionId = null;
	/**
	* Used for cancelling second factor immediately
	*/
	loggingInPromiseWrapper = null;
	/** On platforms with offline cache we do the actual login asynchronously and we can retry it. This is the state of such async login. */
	asyncLoginState = { state: "idle" };
	constructor(restClient, entityClient, loginListener, instanceMapper, cryptoFacade, keyRotationFacade, cacheInitializer, serviceExecutor, userFacade, blobAccessTokenFacade, entropyFacade, databaseKeyFactory, argon2idFacade, noncachingEntityClient, sendError, cacheManagementFacade) {
		this.restClient = restClient;
		this.entityClient = entityClient;
		this.loginListener = loginListener;
		this.instanceMapper = instanceMapper;
		this.cryptoFacade = cryptoFacade;
		this.keyRotationFacade = keyRotationFacade;
		this.cacheInitializer = cacheInitializer;
		this.serviceExecutor = serviceExecutor;
		this.userFacade = userFacade;
		this.blobAccessTokenFacade = blobAccessTokenFacade;
		this.entropyFacade = entropyFacade;
		this.databaseKeyFactory = databaseKeyFactory;
		this.argon2idFacade = argon2idFacade;
		this.noncachingEntityClient = noncachingEntityClient;
		this.sendError = sendError;
		this.cacheManagementFacade = cacheManagementFacade;
	}
	init(eventBusClient) {
		this.eventBusClient = eventBusClient;
	}
	async resetSession() {
		this.eventBusClient.close(CloseEventBusOption.Terminate);
		await this.deInitCache();
		this.userFacade.reset();
	}
	/**
	* Create session and log in. Changes internal state to refer to the logged in user.
	*/
	async createSession(mailAddress, passphrase, clientIdentifier, sessionType, databaseKey) {
		if (this.userFacade.isPartiallyLoggedIn()) console.log("session already exists, reuse data");
		const { userPassphraseKey, kdfType } = await this.loadUserPassphraseKey(mailAddress, passphrase);
		const authVerifier = createAuthVerifierAsBase64Url(userPassphraseKey);
		const createSessionData = createCreateSessionData({
			accessKey: null,
			authToken: null,
			authVerifier,
			clientIdentifier,
			mailAddress: mailAddress.toLowerCase().trim(),
			recoverCodeVerifier: null,
			user: null
		});
		let accessKey = null;
		if (sessionType === SessionType.Persistent) {
			accessKey = aes256RandomKey();
			createSessionData.accessKey = keyToUint8Array(accessKey);
		}
		const createSessionReturn = await this.serviceExecutor.post(SessionService, createSessionData);
		const sessionData = await this.waitUntilSecondFactorApprovedOrCancelled(createSessionReturn, mailAddress);
		const forceNewDatabase = sessionType === SessionType.Persistent && databaseKey == null;
		if (forceNewDatabase) {
			console.log("generating new database key for persistent session");
			databaseKey = await this.databaseKeyFactory.generateKey();
		}
		const cacheInfo = await this.initCache({
			userId: sessionData.userId,
			databaseKey,
			timeRangeDays: null,
			forceNewDatabase
		});
		const { user, userGroupInfo, accessToken } = await this.initSession(sessionData.userId, sessionData.accessToken, userPassphraseKey);
		const modernKdfType = this.isModernKdfType(kdfType);
		if (!modernKdfType) await this.migrateKdfType(KdfType.Argon2id, passphrase, user);
		const credentials = {
			login: mailAddress,
			accessToken,
			encryptedPassword: sessionType === SessionType.Persistent ? uint8ArrayToBase64(encryptString(neverNull(accessKey), passphrase)) : null,
			encryptedPassphraseKey: sessionType === SessionType.Persistent ? encryptKey(neverNull(accessKey), userPassphraseKey) : null,
			userId: sessionData.userId,
			type: CredentialType.Internal
		};
		this.loginListener.onFullLoginSuccess(sessionType, cacheInfo, credentials);
		if (!isAdminClient()) await this.keyRotationFacade.initialize(userPassphraseKey, modernKdfType);
		return {
			user,
			userGroupInfo,
			sessionId: sessionData.sessionId,
			credentials,
			databaseKey: cacheInfo.isPersistent ? databaseKey : null
		};
	}
	/**
	* Ensure that the user is using a modern KDF type, migrating if not.
	* @param targetKdfType the current KDF type
	* @param passphrase either the plaintext passphrase or the encrypted passphrase with the access token necessary to decrypt it
	* @param user the user we are updating
	*/
	async migrateKdfType(targetKdfType, passphrase, user) {
		if (!Const.EXECUTE_KDF_MIGRATION) return;
		const currentPassphraseKeyData = {
			passphrase,
			kdfType: asKdfType(user.kdfVersion),
			salt: assertNotNull(user.salt, `current salt for user ${user._id} not found`)
		};
		const currentUserPassphraseKey = await this.deriveUserPassphraseKey(currentPassphraseKeyData);
		const currentAuthVerifier = createAuthVerifier(currentUserPassphraseKey);
		const newPassphraseKeyData = {
			passphrase,
			kdfType: targetKdfType,
			salt: generateRandomSalt()
		};
		const newUserPassphraseKey = await this.deriveUserPassphraseKey(newPassphraseKeyData);
		const currentUserGroupKey = this.userFacade.getCurrentUserGroupKey();
		const pwEncUserGroupKey = encryptKey(newUserPassphraseKey, currentUserGroupKey.object);
		const newAuthVerifier = createAuthVerifier(newUserPassphraseKey);
		const changeKdfPostIn = createChangeKdfPostIn({
			kdfVersion: newPassphraseKeyData.kdfType,
			salt: newPassphraseKeyData.salt,
			pwEncUserGroupKey,
			verifier: newAuthVerifier,
			oldVerifier: currentAuthVerifier,
			userGroupKeyVersion: String(currentUserGroupKey.version)
		});
		console.log("Migrate KDF from:", user.kdfVersion, "to", targetKdfType);
		await this.serviceExecutor.post(ChangeKdfService, changeKdfPostIn);
		await (await this.cacheManagementFacade()).reloadUser();
		this.userFacade.setUserDistKey(currentUserGroupKey.version, newUserPassphraseKey);
	}
	/**
	* Checks if the given KDF type is phased out.
	* @param kdfType
	* @private
	*/
	isModernKdfType(kdfType) {
		return kdfType !== KdfType.Bcrypt;
	}
	/**
	* If the second factor login has been cancelled a CancelledError is thrown.
	*/
	waitUntilSecondFactorApprovedOrCancelled(createSessionReturn, mailAddress) {
		let p = Promise.resolve();
		let sessionId = [this.getSessionListId(createSessionReturn.accessToken), this.getSessionElementId(createSessionReturn.accessToken)];
		this.loginRequestSessionId = sessionId;
		if (createSessionReturn.challenges.length > 0) {
			this.loginListener.onSecondFactorChallenge(sessionId, createSessionReturn.challenges, mailAddress);
			p = this.waitUntilSecondFactorApproved(createSessionReturn.accessToken, sessionId, 0);
		}
		this.loggingInPromiseWrapper = defer();
		return Promise.race([this.loggingInPromiseWrapper.promise, p]).then(() => ({
			sessionId,
			accessToken: createSessionReturn.accessToken,
			userId: createSessionReturn.user
		}));
	}
	async waitUntilSecondFactorApproved(accessToken, sessionId, retryOnNetworkError) {
		let secondFactorAuthGetData = createSecondFactorAuthGetData({ accessToken });
		try {
			const secondFactorAuthGetReturn = await this.serviceExecutor.get(SecondFactorAuthService, secondFactorAuthGetData);
			if (!this.loginRequestSessionId || !isSameId(this.loginRequestSessionId, sessionId)) throw new CancelledError("login cancelled");
			if (secondFactorAuthGetReturn.secondFactorPending) return this.waitUntilSecondFactorApproved(accessToken, sessionId, 0);
		} catch (e) {
			if (e instanceof ConnectionError && retryOnNetworkError < 10) return this.waitUntilSecondFactorApproved(accessToken, sessionId, retryOnNetworkError + 1);
			throw e;
		}
	}
	/**
	* Create external (temporary mailbox for passphrase-protected emails) session and log in.
	* Changes internal state to refer to the logged-in user.
	*/
	async createExternalSession(userId, passphrase, salt, kdfType, clientIdentifier, persistentSession) {
		if (this.userFacade.isPartiallyLoggedIn()) throw new Error("user already logged in");
		const userPassphraseKey = await this.deriveUserPassphraseKey({
			kdfType,
			passphrase,
			salt
		});
		const authVerifier = createAuthVerifierAsBase64Url(userPassphraseKey);
		const authToken = base64ToBase64Url(uint8ArrayToBase64(sha256Hash(salt)));
		const sessionData = createCreateSessionData({
			accessKey: null,
			authToken,
			authVerifier,
			clientIdentifier,
			mailAddress: null,
			recoverCodeVerifier: null,
			user: userId
		});
		let accessKey = null;
		if (persistentSession) {
			accessKey = aes256RandomKey();
			sessionData.accessKey = keyToUint8Array(accessKey);
		}
		const createSessionReturn = await this.serviceExecutor.post(SessionService, sessionData);
		let sessionId = [this.getSessionListId(createSessionReturn.accessToken), this.getSessionElementId(createSessionReturn.accessToken)];
		const cacheInfo = await this.initCache({
			userId,
			databaseKey: null,
			timeRangeDays: null,
			forceNewDatabase: true
		});
		const { user, userGroupInfo, accessToken } = await this.initSession(createSessionReturn.user, createSessionReturn.accessToken, userPassphraseKey);
		const credentials = {
			login: userId,
			accessToken,
			encryptedPassword: accessKey ? uint8ArrayToBase64(encryptString(accessKey, passphrase)) : null,
			encryptedPassphraseKey: accessKey ? encryptKey(accessKey, userPassphraseKey) : null,
			userId,
			type: CredentialType.External
		};
		this.loginListener.onFullLoginSuccess(SessionType.Login, cacheInfo, credentials);
		return {
			user,
			userGroupInfo,
			sessionId,
			credentials,
			databaseKey: null
		};
	}
	/**
	* Derive a key given a KDF type, passphrase, and salt
	*/
	async deriveUserPassphraseKey({ kdfType, passphrase, salt }) {
		switch (kdfType) {
			case KdfType.Bcrypt: return generateKeyFromPassphrase(passphrase, salt, KeyLength.b128);
			case KdfType.Argon2id: return this.argon2idFacade.generateKeyFromPassphrase(passphrase, salt);
		}
	}
	/** Cancels 2FA process. */
	async cancelCreateSession(sessionId) {
		if (!this.loginRequestSessionId || !isSameId(this.loginRequestSessionId, sessionId)) throw new Error("Trying to cancel session creation but the state is invalid");
		const secondFactorAuthDeleteData = createSecondFactorAuthDeleteData({ session: sessionId });
		await this.serviceExecutor.delete(SecondFactorAuthService, secondFactorAuthDeleteData).catch(ofClass(NotFoundError, (e) => {
			console.warn("Tried to cancel second factor but it was not there anymore", e);
		})).catch(ofClass(LockedError, (e) => {
			console.warn("Tried to cancel second factor but it is currently locked", e);
		}));
		this.loginRequestSessionId = null;
		this.loggingInPromiseWrapper?.reject(new CancelledError("login cancelled"));
	}
	/** Finishes 2FA process either using second factor or approving session on another client. */
	async authenticateWithSecondFactor(data, host) {
		await this.serviceExecutor.post(SecondFactorAuthService, data, { baseUrl: host });
	}
	/**
	* Resumes previously created session (using persisted credentials).
	* @param credentials the saved credentials to use
	* @param externalUserKeyDeriver information for deriving a key (if external user)
	* @param databaseKey key to unlock the local database (if enabled)
	* @param timeRangeDays the user configured time range for the offline database
	*/
	async resumeSession(credentials, externalUserKeyDeriver, databaseKey, timeRangeDays) {
		if (this.userFacade.getUser() != null) throw new ProgrammingError(`Trying to resume the session for user ${credentials.userId} while already logged in for ${this.userFacade.getUser()?._id}`);
		if (this.asyncLoginState.state !== "idle") throw new ProgrammingError(`Trying to resume the session for user ${credentials.userId} while the asyncLoginState is ${this.asyncLoginState.state}`);
		this.userFacade.setAccessToken(credentials.accessToken);
		const cacheInfo = await this.initCache({
			userId: credentials.userId,
			databaseKey,
			timeRangeDays,
			forceNewDatabase: false
		});
		const sessionId = this.getSessionId(credentials);
		try {
			if (cacheInfo?.isPersistent && !cacheInfo.isNewOfflineDb) {
				const user = await this.entityClient.load(UserTypeRef, credentials.userId);
				if (user.accountType !== AccountType.PAID) return await this.finishResumeSession(credentials, externalUserKeyDeriver, cacheInfo).catch(ofClass(ConnectionError, async () => {
					await this.resetSession();
					return {
						type: "error",
						reason: ResumeSessionErrorReason.OfflineNotAvailableForFree
					};
				}));
				this.userFacade.setUser(user);
				let userGroupInfo;
				try {
					userGroupInfo = await this.entityClient.load(GroupInfoTypeRef, user.userGroup.groupInfo);
				} catch (e) {
					console.log("Could not do start login, groupInfo is not cached, falling back to sync login");
					if (e instanceof LoginIncompleteError) return await this.finishResumeSession(credentials, externalUserKeyDeriver, cacheInfo);
else throw e;
				}
				Promise.resolve().then(() => this.asyncResumeSession(credentials, cacheInfo));
				const data = {
					user,
					userGroupInfo,
					sessionId
				};
				return {
					type: "success",
					data
				};
			} else return await this.finishResumeSession(credentials, externalUserKeyDeriver, cacheInfo);
		} catch (e) {
			await this.resetSession();
			throw e;
		}
	}
	getSessionId(credentials) {
		return [this.getSessionListId(credentials.accessToken), this.getSessionElementId(credentials.accessToken)];
	}
	async asyncResumeSession(credentials, cacheInfo) {
		if (this.asyncLoginState.state === "running") throw new Error("finishLoginResume run in parallel");
		this.asyncLoginState = { state: "running" };
		try {
			await this.finishResumeSession(credentials, null, cacheInfo);
		} catch (e) {
			if (e instanceof NotAuthenticatedError || e instanceof SessionExpiredError) {
				this.asyncLoginState = { state: "idle" };
				await this.loginListener.onLoginFailure(LoginFailReason.SessionExpired);
			} else {
				this.asyncLoginState = {
					state: "failed",
					credentials,
					cacheInfo
				};
				if (!(e instanceof ConnectionError)) await this.sendError(e);
				await this.loginListener.onLoginFailure(LoginFailReason.Error);
			}
		}
	}
	async finishResumeSession(credentials, externalUserKeyDeriver, cacheInfo) {
		const sessionId = this.getSessionId(credentials);
		const sessionData = await this.loadSessionData(credentials.accessToken);
		const accessKey = assertNotNull(sessionData.accessKey, "no access key on session data!");
		const isExternalUser = externalUserKeyDeriver != null;
		let userPassphraseKey;
		let credentialsWithPassphraseKey;
		if (credentials.encryptedPassword) {
			const passphrase = utf8Uint8ArrayToString(aesDecrypt(accessKey, base64ToUint8Array(credentials.encryptedPassword)));
			if (isExternalUser) {
				await this.checkOutdatedExternalSalt(credentials, sessionData, externalUserKeyDeriver.salt);
				userPassphraseKey = await this.deriveUserPassphraseKey({
					...externalUserKeyDeriver,
					passphrase
				});
			} else {
				const passphraseData = await this.loadUserPassphraseKey(credentials.login, passphrase);
				userPassphraseKey = passphraseData.userPassphraseKey;
			}
			const encryptedPassphraseKey = encryptKey(accessKey, userPassphraseKey);
			credentialsWithPassphraseKey = {
				...credentials,
				encryptedPassphraseKey
			};
		} else throw new ProgrammingError("no key or password stored in credentials!");
		const { user, userGroupInfo } = await this.initSession(sessionData.userId, credentials.accessToken, userPassphraseKey);
		this.loginListener.onFullLoginSuccess(SessionType.Persistent, cacheInfo, credentialsWithPassphraseKey);
		this.asyncLoginState = { state: "idle" };
		const data = {
			user,
			userGroupInfo,
			sessionId
		};
		const modernKdfType = this.isModernKdfType(asKdfType(user.kdfVersion));
		if (!isExternalUser && credentials.encryptedPassword != null && !modernKdfType) {
			const passphrase = utf8Uint8ArrayToString(aesDecrypt(accessKey, base64ToUint8Array(credentials.encryptedPassword)));
			await this.migrateKdfType(KdfType.Argon2id, passphrase, user);
		}
		if (!isExternalUser && !isAdminClient()) await this.keyRotationFacade.initialize(userPassphraseKey, modernKdfType);
		return {
			type: "success",
			data
		};
	}
	async initSession(userId, accessToken, userPassphraseKey) {
		const userIdFromFormerLogin = this.userFacade.getUser()?._id ?? null;
		if (userIdFromFormerLogin && userId !== userIdFromFormerLogin) throw new Error("different user is tried to login in existing other user's session");
		this.userFacade.setAccessToken(accessToken);
		try {
			const user = await this.noncachingEntityClient.load(UserTypeRef, userId);
			await this.checkOutdatedVerifier(user, accessToken, userPassphraseKey);
			this.userFacade.setUser(user);
			const wasFullyLoggedIn = this.userFacade.isFullyLoggedIn();
			this.userFacade.unlockUserGroupKey(userPassphraseKey);
			const userGroupInfo = await this.entityClient.load(GroupInfoTypeRef, user.userGroup.groupInfo);
			await this.loadEntropy();
			if (wasFullyLoggedIn) this.eventBusClient.connect(ConnectMode.Reconnect);
else this.eventBusClient.connect(ConnectMode.Initial);
			await this.entropyFacade.storeEntropy();
			return {
				user,
				accessToken,
				userGroupInfo
			};
		} catch (e) {
			this.resetSession();
			throw e;
		}
	}
	/**
	* init an appropriate cache implementation. we will always try to create a persistent cache for persistent sessions and fall back to an ephemeral cache
	* in the browser.
	*
	* @param userId the user for which the cache is created
	* @param databaseKey the key to use
	* @param timeRangeDays how far into the past the cache keeps data around
	* @param forceNewDatabase true if the old database should be deleted if there is one
	* @private
	*/
	async initCache({ userId, databaseKey, timeRangeDays, forceNewDatabase }) {
		if (databaseKey != null) return {
			databaseKey,
			...await this.cacheInitializer.initialize({
				type: "offline",
				userId,
				databaseKey,
				timeRangeDays,
				forceNewDatabase
			})
		};
else return {
			databaseKey: null,
			...await this.cacheInitializer.initialize({
				type: "ephemeral",
				userId
			})
		};
	}
	async deInitCache() {
		return this.cacheInitializer.deInitialize();
	}
	/**
	* Check whether the passed salt for external user is up-to-date (whether an outdated link was used).
	*/
	async checkOutdatedExternalSalt(credentials, sessionData, externalUserSalt) {
		this.userFacade.setAccessToken(credentials.accessToken);
		const user = await this.entityClient.load(UserTypeRef, sessionData.userId);
		const latestSaltHash = assertNotNull(user.externalAuthInfo.latestSaltHash, "latestSaltHash is not set!");
		if (!arrayEquals(latestSaltHash, sha256Hash(externalUserSalt))) {
			this.resetSession();
			throw new AccessExpiredError("Salt changed, outdated link?");
		}
	}
	/**
	* Check that the auth verifier is not changed e.g. due to the password change.
	* Normally this won't happen for internal users as all sessions are closed on password change. This may happen for external users when the sender has
	* changed the password.
	* We do not delete all sessions on the server when changing the external password to avoid that an external user is immediately logged out.
	*
	* @param user Should be up-to-date, i.e., not loaded from cache, but fresh from the server, otherwise an outdated verifier will cause a logout.
	*/
	async checkOutdatedVerifier(user, accessToken, userPassphraseKey) {
		if (uint8ArrayToBase64(user.verifier) !== uint8ArrayToBase64(sha256Hash(createAuthVerifier(userPassphraseKey)))) {
			console.log("Auth verifier has changed");
			await this.deleteSession(accessToken).catch((e) => console.error("Could not delete session", e));
			await this.resetSession();
			throw new NotAuthenticatedError("Auth verifier has changed");
		}
	}
	async loadUserPassphraseKey(mailAddress, passphrase) {
		mailAddress = mailAddress.toLowerCase().trim();
		const saltRequest = createSaltData({ mailAddress });
		const saltReturn = await this.serviceExecutor.get(SaltService, saltRequest);
		const kdfType = asKdfType(saltReturn.kdfVersion);
		return {
			userPassphraseKey: await this.deriveUserPassphraseKey({
				kdfType,
				passphrase,
				salt: saltReturn.salt
			}),
			kdfType
		};
	}
	/**
	* We use the accessToken that should be deleted for authentication. Therefore it can be invoked while logged in or logged out.
	*
	* @param pushIdentifier identifier associated with this device, if any, to delete PushIdentifier on the server
	*/
	async deleteSession(accessToken, pushIdentifier = null) {
		let path = typeRefToPath(SessionTypeRef) + "/" + this.getSessionListId(accessToken) + "/" + this.getSessionElementId(accessToken);
		const sessionTypeModel = await resolveTypeReference(SessionTypeRef);
		const headers = {
			accessToken: neverNull(accessToken),
			v: sessionTypeModel.version
		};
		const queryParams = pushIdentifier == null ? {} : { pushIdentifier };
		return this.restClient.request(path, HttpMethod.DELETE, {
			headers,
			responseType: MediaType.Json,
			queryParams
		}).catch(ofClass(NotAuthenticatedError, () => {
			console.log("authentication failed => session is already closed");
		})).catch(ofClass(NotFoundError, () => {
			console.log("authentication failed => session instance is already deleted");
		}));
	}
	getSessionElementId(accessToken) {
		let byteAccessToken = base64ToUint8Array(base64UrlToBase64(neverNull(accessToken)));
		return base64ToBase64Url(uint8ArrayToBase64(sha256Hash(byteAccessToken.slice(GENERATED_ID_BYTES_LENGTH))));
	}
	getSessionListId(accessToken) {
		let byteAccessToken = base64ToUint8Array(base64UrlToBase64(neverNull(accessToken)));
		return base64ToBase64Ext(uint8ArrayToBase64(byteAccessToken.slice(0, GENERATED_ID_BYTES_LENGTH)));
	}
	async loadSessionData(accessToken) {
		const path = typeRefToPath(SessionTypeRef) + "/" + this.getSessionListId(accessToken) + "/" + this.getSessionElementId(accessToken);
		const SessionTypeModel = await resolveTypeReference(SessionTypeRef);
		let headers = {
			accessToken,
			v: SessionTypeModel.version
		};
		return this.restClient.request(path, HttpMethod.GET, {
			headers,
			responseType: MediaType.Json
		}).then((instance) => {
			let session = JSON.parse(instance);
			return {
				userId: session.user,
				accessKey: session.accessKey ? base64ToKey(session.accessKey) : null
			};
		});
	}
	/**
	* Loads entropy from the last logout.
	*/
	async loadEntropy() {
		const tutanotaProperties = await this.entityClient.loadRoot(TutanotaPropertiesTypeRef, this.userFacade.getUserGroupId());
		return this.entropyFacade.loadEntropy(tutanotaProperties);
	}
	/**
	* Change password and/or KDF type for the current user. This will cause all other sessions to be closed.
	* @return New password encrypted with accessKey if this is a persistent session or {@code null}  if it's an ephemeral one.
	*/
	async changePassword(currentPasswordKeyData, newPasswordKeyDataTemplate) {
		const currentUserPassphraseKey = await this.deriveUserPassphraseKey(currentPasswordKeyData);
		const currentAuthVerifier = createAuthVerifier(currentUserPassphraseKey);
		const newPasswordKeyData = {
			...newPasswordKeyDataTemplate,
			salt: generateRandomSalt()
		};
		const newUserPassphraseKey = await this.deriveUserPassphraseKey(newPasswordKeyData);
		const currentUserGroupKey = this.userFacade.getCurrentUserGroupKey();
		const pwEncUserGroupKey = encryptKey(newUserPassphraseKey, currentUserGroupKey.object);
		const authVerifier = createAuthVerifier(newUserPassphraseKey);
		const service = createChangePasswordPostIn({
			code: null,
			kdfVersion: newPasswordKeyDataTemplate.kdfType,
			oldVerifier: currentAuthVerifier,
			pwEncUserGroupKey,
			recoverCodeVerifier: null,
			salt: newPasswordKeyData.salt,
			verifier: authVerifier,
			userGroupKeyVersion: String(currentUserGroupKey.version)
		});
		await this.serviceExecutor.post(ChangePasswordService, service);
		this.userFacade.setUserDistKey(currentUserGroupKey.version, newUserPassphraseKey);
		const accessToken = assertNotNull(this.userFacade.getAccessToken());
		const sessionData = await this.loadSessionData(accessToken);
		if (sessionData.accessKey != null) {
			const newEncryptedPassphrase = uint8ArrayToBase64(encryptString(sessionData.accessKey, newPasswordKeyDataTemplate.passphrase));
			const newEncryptedPassphraseKey = encryptKey(sessionData.accessKey, newUserPassphraseKey);
			return {
				newEncryptedPassphrase,
				newEncryptedPassphraseKey
			};
		} else return null;
	}
	async deleteAccount(password, takeover, surveyData = null) {
		const userSalt = assertNotNull(this.userFacade.getLoggedInUser().salt);
		const passphraseKeyData = {
			kdfType: asKdfType(this.userFacade.getLoggedInUser().kdfVersion),
			passphrase: password,
			salt: userSalt
		};
		const passwordKey = await this.deriveUserPassphraseKey(passphraseKeyData);
		const deleteCustomerData = createDeleteCustomerData({
			authVerifier: createAuthVerifier(passwordKey),
			reason: null,
			takeoverMailAddress: null,
			undelete: false,
			customer: neverNull(neverNull(this.userFacade.getLoggedInUser()).customer),
			surveyData
		});
		if (takeover !== "") deleteCustomerData.takeoverMailAddress = takeover;
else deleteCustomerData.takeoverMailAddress = null;
		await this.serviceExecutor.delete(CustomerService, deleteCustomerData);
	}
	/** Changes user password to another one using recoverCode instead of the old password. */
	async recoverLogin(mailAddress, recoverCode, newPassword, clientIdentifier) {
		const recoverCodeKey = uint8ArrayToBitArray(hexToUint8Array(recoverCode));
		const recoverCodeVerifier = createAuthVerifier(recoverCodeKey);
		const recoverCodeVerifierBase64 = base64ToBase64Url(uint8ArrayToBase64(recoverCodeVerifier));
		const sessionData = createCreateSessionData({
			accessKey: null,
			authToken: null,
			authVerifier: null,
			clientIdentifier,
			mailAddress: mailAddress.toLowerCase().trim(),
			recoverCodeVerifier: recoverCodeVerifierBase64,
			user: null
		});
		const tempAuthDataProvider = {
			createAuthHeaders() {
				return {};
			},
			isFullyLoggedIn() {
				return false;
			}
		};
		const eventRestClient = new EntityRestClient(tempAuthDataProvider, this.restClient, () => this.cryptoFacade, this.instanceMapper, this.blobAccessTokenFacade);
		const entityClient = new EntityClient(eventRestClient);
		const createSessionReturn = await this.serviceExecutor.post(SessionService, sessionData);
		const { userId, accessToken } = await this.waitUntilSecondFactorApprovedOrCancelled(createSessionReturn, null);
		const user = await entityClient.load(UserTypeRef, userId, { extraHeaders: { accessToken } });
		if (user.auth == null || user.auth.recoverCode == null) throw new Error("missing recover code");
		const recoverCodeExtraHeaders = {
			accessToken,
			recoverCodeVerifier: recoverCodeVerifierBase64
		};
		const recoverCodeData = await entityClient.load(RecoverCodeTypeRef, user.auth.recoverCode, { extraHeaders: recoverCodeExtraHeaders });
		try {
			const groupKey = aes256DecryptWithRecoveryKey(recoverCodeKey, recoverCodeData.recoverCodeEncUserGroupKey);
			const salt = generateRandomSalt();
			const newKdfType = DEFAULT_KDF_TYPE;
			const newPassphraseKeyData = {
				kdfType: newKdfType,
				passphrase: newPassword,
				salt
			};
			const userPassphraseKey = await this.deriveUserPassphraseKey(newPassphraseKeyData);
			const pwEncUserGroupKey = encryptKey(userPassphraseKey, groupKey);
			const newPasswordVerifier = createAuthVerifier(userPassphraseKey);
			const postData = createChangePasswordPostIn({
				code: null,
				kdfVersion: newKdfType,
				oldVerifier: null,
				salt,
				pwEncUserGroupKey,
				verifier: newPasswordVerifier,
				recoverCodeVerifier,
				userGroupKeyVersion: recoverCodeData.userKeyVersion
			});
			const extraHeaders = { accessToken };
			await this.serviceExecutor.post(ChangePasswordService, postData, { extraHeaders });
		} finally {
			this.deleteSession(accessToken);
		}
	}
	/** Deletes second factors using recoverCode as second factor. */
	resetSecondFactors(mailAddress, password, recoverCode) {
		return this.loadUserPassphraseKey(mailAddress, password).then((passphraseReturn) => {
			const authVerifier = createAuthVerifierAsBase64Url(passphraseReturn.userPassphraseKey);
			const recoverCodeKey = uint8ArrayToBitArray(hexToUint8Array(recoverCode));
			const recoverCodeVerifier = createAuthVerifierAsBase64Url(recoverCodeKey);
			const deleteData = createResetFactorsDeleteData({
				mailAddress,
				authVerifier,
				recoverCodeVerifier
			});
			return this.serviceExecutor.delete(ResetFactorsService, deleteData);
		});
	}
	takeOverDeletedAddress(mailAddress, password, recoverCode, targetAccountMailAddress) {
		return this.loadUserPassphraseKey(mailAddress, password).then((passphraseReturn) => {
			const authVerifier = createAuthVerifierAsBase64Url(passphraseReturn.userPassphraseKey);
			let recoverCodeVerifier = null;
			if (recoverCode) {
				const recoverCodeKey = uint8ArrayToBitArray(hexToUint8Array(recoverCode));
				recoverCodeVerifier = createAuthVerifierAsBase64Url(recoverCodeKey);
			}
			let data = createTakeOverDeletedAddressData({
				mailAddress,
				authVerifier,
				recoverCodeVerifier,
				targetAccountMailAddress
			});
			return this.serviceExecutor.post(TakeOverDeletedAddressService, data);
		});
	}
	generateTotpSecret() {
		return this.getTotpVerifier().then((totp) => totp.generateSecret());
	}
	generateTotpCode(time, key) {
		return this.getTotpVerifier().then((totp) => totp.generateTotp(time, key));
	}
	getTotpVerifier() {
		return Promise.resolve(new TotpVerifier());
	}
	async retryAsyncLogin() {
		if (this.asyncLoginState.state === "running") return;
else if (this.asyncLoginState.state === "failed") await this.asyncResumeSession(this.asyncLoginState.credentials, this.asyncLoginState.cacheInfo);
else throw new Error("credentials went missing");
	}
	/**
	* Returns a verifier token, which is proof of password authentication and is valid for a limited time.
	* This token will have to be passed back to the server with the appropriate call.
	*/
	async getVerifierToken(passphrase) {
		const user = this.userFacade.getLoggedInUser();
		const passphraseKey = await this.deriveUserPassphraseKey({
			kdfType: asKdfType(user.kdfVersion),
			passphrase,
			salt: assertNotNull(user.salt)
		});
		const authVerifier = createAuthVerifier(passphraseKey);
		const out = await this.serviceExecutor.post(VerifierTokenService, createVerifierTokenServiceIn({ authVerifier }));
		return out.token;
	}
};

//#endregion
export { LoginFacade, ResumeSessionErrorReason };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9naW5GYWNhZGUtY2h1bmsuanMiLCJuYW1lcyI6WyJyZXN0Q2xpZW50OiBSZXN0Q2xpZW50IiwiZW50aXR5Q2xpZW50OiBFbnRpdHlDbGllbnQiLCJsb2dpbkxpc3RlbmVyOiBMb2dpbkxpc3RlbmVyIiwiaW5zdGFuY2VNYXBwZXI6IEluc3RhbmNlTWFwcGVyIiwiY3J5cHRvRmFjYWRlOiBDcnlwdG9GYWNhZGUiLCJrZXlSb3RhdGlvbkZhY2FkZTogS2V5Um90YXRpb25GYWNhZGUiLCJjYWNoZUluaXRpYWxpemVyOiBDYWNoZVN0b3JhZ2VMYXRlSW5pdGlhbGl6ZXIiLCJzZXJ2aWNlRXhlY3V0b3I6IElTZXJ2aWNlRXhlY3V0b3IiLCJ1c2VyRmFjYWRlOiBVc2VyRmFjYWRlIiwiYmxvYkFjY2Vzc1Rva2VuRmFjYWRlOiBCbG9iQWNjZXNzVG9rZW5GYWNhZGUiLCJlbnRyb3B5RmFjYWRlOiBFbnRyb3B5RmFjYWRlIiwiZGF0YWJhc2VLZXlGYWN0b3J5OiBEYXRhYmFzZUtleUZhY3RvcnkiLCJhcmdvbjJpZEZhY2FkZTogQXJnb24yaWRGYWNhZGUiLCJub25jYWNoaW5nRW50aXR5Q2xpZW50OiBFbnRpdHlDbGllbnQiLCJzZW5kRXJyb3I6IChlcnJvcjogRXJyb3IpID0+IFByb21pc2U8dm9pZD4iLCJjYWNoZU1hbmFnZW1lbnRGYWNhZGU6IGxhenlBc3luYzxDYWNoZU1hbmFnZW1lbnRGYWNhZGU+IiwiZXZlbnRCdXNDbGllbnQ6IEV2ZW50QnVzQ2xpZW50IiwibWFpbEFkZHJlc3M6IHN0cmluZyIsInBhc3NwaHJhc2U6IHN0cmluZyIsImNsaWVudElkZW50aWZpZXI6IHN0cmluZyIsInNlc3Npb25UeXBlOiBTZXNzaW9uVHlwZSIsImRhdGFiYXNlS2V5OiBVaW50OEFycmF5IHwgbnVsbCIsImFjY2Vzc0tleTogQWVzS2V5IHwgbnVsbCIsInRhcmdldEtkZlR5cGU6IEtkZlR5cGUiLCJ1c2VyOiBVc2VyIiwia2RmVHlwZTogS2RmVHlwZSIsImNyZWF0ZVNlc3Npb25SZXR1cm46IENyZWF0ZVNlc3Npb25SZXR1cm4iLCJtYWlsQWRkcmVzczogc3RyaW5nIHwgbnVsbCIsImFjY2Vzc1Rva2VuOiBCYXNlNjRVcmwiLCJzZXNzaW9uSWQ6IElkVHVwbGUiLCJyZXRyeU9uTmV0d29ya0Vycm9yOiBudW1iZXIiLCJ1c2VySWQ6IElkIiwic2FsdDogVWludDhBcnJheSIsInBlcnNpc3RlbnRTZXNzaW9uOiBib29sZWFuIiwiYWNjZXNzS2V5OiBBZXMyNTZLZXkgfCBudWxsIiwiZGF0YTogU2Vjb25kRmFjdG9yQXV0aERhdGEiLCJob3N0Pzogc3RyaW5nIiwiY3JlZGVudGlhbHM6IENyZWRlbnRpYWxzIiwiZXh0ZXJuYWxVc2VyS2V5RGVyaXZlcjogRXh0ZXJuYWxVc2VyS2V5RGVyaXZlciB8IG51bGwiLCJ0aW1lUmFuZ2VEYXlzOiBudW1iZXIgfCBudWxsIiwidXNlckdyb3VwSW5mbzogR3JvdXBJbmZvIiwiY2FjaGVJbmZvOiBDYWNoZUluZm8iLCJ1c2VyUGFzc3BocmFzZUtleTogQWVzS2V5IiwiY3JlZGVudGlhbHNXaXRoUGFzc3BocmFzZUtleTogQ3JlZGVudGlhbHMiLCJzZXNzaW9uRGF0YToge1xuXHRcdFx0dXNlcklkOiBJZFxuXHRcdFx0YWNjZXNzS2V5OiBBZXNLZXkgfCBudWxsXG5cdFx0fSIsImV4dGVybmFsVXNlclNhbHQ6IFVpbnQ4QXJyYXkiLCJhY2Nlc3NUb2tlbjogc3RyaW5nIiwidXNlclBhc3NwaHJhc2VLZXk6IEFlczEyOEtleSIsInB1c2hJZGVudGlmaWVyOiBzdHJpbmcgfCBudWxsIiwicXVlcnlQYXJhbXM6IERpY3QiLCJjdXJyZW50UGFzc3dvcmRLZXlEYXRhOiBQYXNzcGhyYXNlS2V5RGF0YSIsIm5ld1Bhc3N3b3JkS2V5RGF0YVRlbXBsYXRlOiBPbWl0PFBhc3NwaHJhc2VLZXlEYXRhLCBcInNhbHRcIj4iLCJwYXNzd29yZDogc3RyaW5nIiwidGFrZW92ZXI6IHN0cmluZyIsInN1cnZleURhdGE6IFN1cnZleURhdGEgfCBudWxsIiwicmVjb3ZlckNvZGU6IHN0cmluZyIsIm5ld1Bhc3N3b3JkOiBzdHJpbmciLCJ0ZW1wQXV0aERhdGFQcm92aWRlcjogQXV0aERhdGFQcm92aWRlciIsInJlY292ZXJDb2RlOiBIZXgiLCJyZWNvdmVyQ29kZTogSGV4IHwgbnVsbCIsInRhcmdldEFjY291bnRNYWlsQWRkcmVzczogc3RyaW5nIiwicmVjb3ZlckNvZGVWZXJpZmllcjogQmFzZTY0IHwgbnVsbCIsInRpbWU6IG51bWJlciIsImtleTogVWludDhBcnJheSJdLCJzb3VyY2VzIjpbIi4uL3NyYy9jb21tb24vYXBpL3dvcmtlci9mYWNhZGVzL0xvZ2luRmFjYWRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG5cdGFycmF5RXF1YWxzLFxuXHRhc3NlcnROb3ROdWxsLFxuXHRCYXNlNjQsXG5cdGJhc2U2NFRvQmFzZTY0RXh0LFxuXHRiYXNlNjRUb0Jhc2U2NFVybCxcblx0YmFzZTY0VG9VaW50OEFycmF5LFxuXHRCYXNlNjRVcmwsXG5cdGJhc2U2NFVybFRvQmFzZTY0LFxuXHRkZWZlcixcblx0RGVmZXJyZWRPYmplY3QsXG5cdEhleCxcblx0aGV4VG9VaW50OEFycmF5LFxuXHRsYXp5QXN5bmMsXG5cdG5ldmVyTnVsbCxcblx0b2ZDbGFzcyxcblx0dWludDhBcnJheVRvQmFzZTY0LFxuXHR1dGY4VWludDhBcnJheVRvU3RyaW5nLFxufSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB7XG5cdENoYW5nZUtkZlNlcnZpY2UsXG5cdENoYW5nZVBhc3N3b3JkU2VydmljZSxcblx0Q3VzdG9tZXJTZXJ2aWNlLFxuXHRSZXNldEZhY3RvcnNTZXJ2aWNlLFxuXHRTYWx0U2VydmljZSxcblx0U2Vjb25kRmFjdG9yQXV0aFNlcnZpY2UsXG5cdFNlc3Npb25TZXJ2aWNlLFxuXHRUYWtlT3ZlckRlbGV0ZWRBZGRyZXNzU2VydmljZSxcblx0VmVyaWZpZXJUb2tlblNlcnZpY2UsXG59IGZyb20gXCIuLi8uLi9lbnRpdGllcy9zeXMvU2VydmljZXNcIlxuaW1wb3J0IHsgQWNjb3VudFR5cGUsIGFzS2RmVHlwZSwgQ2xvc2VFdmVudEJ1c09wdGlvbiwgQ29uc3QsIERFRkFVTFRfS0RGX1RZUEUsIEtkZlR5cGUgfSBmcm9tIFwiLi4vLi4vY29tbW9uL1R1dGFub3RhQ29uc3RhbnRzXCJcbmltcG9ydCB7XG5cdENoYWxsZW5nZSxcblx0Y3JlYXRlQ2hhbmdlS2RmUG9zdEluLFxuXHRjcmVhdGVDaGFuZ2VQYXNzd29yZFBvc3RJbixcblx0Y3JlYXRlQ3JlYXRlU2Vzc2lvbkRhdGEsXG5cdGNyZWF0ZURlbGV0ZUN1c3RvbWVyRGF0YSxcblx0Y3JlYXRlUmVzZXRGYWN0b3JzRGVsZXRlRGF0YSxcblx0Y3JlYXRlU2FsdERhdGEsXG5cdGNyZWF0ZVNlY29uZEZhY3RvckF1dGhEZWxldGVEYXRhLFxuXHRjcmVhdGVTZWNvbmRGYWN0b3JBdXRoR2V0RGF0YSxcblx0Q3JlYXRlU2Vzc2lvblJldHVybixcblx0Y3JlYXRlVGFrZU92ZXJEZWxldGVkQWRkcmVzc0RhdGEsXG5cdGNyZWF0ZVZlcmlmaWVyVG9rZW5TZXJ2aWNlSW4sXG5cdEdyb3VwSW5mbyxcblx0R3JvdXBJbmZvVHlwZVJlZixcblx0UmVjb3ZlckNvZGVUeXBlUmVmLFxuXHRTZWNvbmRGYWN0b3JBdXRoRGF0YSxcblx0U2Vzc2lvblR5cGVSZWYsXG5cdFN1cnZleURhdGEsXG5cdFVzZXIsXG5cdFVzZXJUeXBlUmVmLFxufSBmcm9tIFwiLi4vLi4vZW50aXRpZXMvc3lzL1R5cGVSZWZzLmpzXCJcbmltcG9ydCB7IFR1dGFub3RhUHJvcGVydGllc1R5cGVSZWYgfSBmcm9tIFwiLi4vLi4vZW50aXRpZXMvdHV0YW5vdGEvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgSHR0cE1ldGhvZCwgTWVkaWFUeXBlLCByZXNvbHZlVHlwZVJlZmVyZW5jZSB9IGZyb20gXCIuLi8uLi9jb21tb24vRW50aXR5RnVuY3Rpb25zXCJcbmltcG9ydCB7IGFzc2VydFdvcmtlck9yTm9kZSwgaXNBZG1pbkNsaWVudCB9IGZyb20gXCIuLi8uLi9jb21tb24vRW52XCJcbmltcG9ydCB7IENvbm5lY3RNb2RlLCBFdmVudEJ1c0NsaWVudCB9IGZyb20gXCIuLi9FdmVudEJ1c0NsaWVudFwiXG5pbXBvcnQgeyBFbnRpdHlSZXN0Q2xpZW50LCB0eXBlUmVmVG9QYXRoIH0gZnJvbSBcIi4uL3Jlc3QvRW50aXR5UmVzdENsaWVudFwiXG5pbXBvcnQgeyBBY2Nlc3NFeHBpcmVkRXJyb3IsIENvbm5lY3Rpb25FcnJvciwgTG9ja2VkRXJyb3IsIE5vdEF1dGhlbnRpY2F0ZWRFcnJvciwgTm90Rm91bmRFcnJvciwgU2Vzc2lvbkV4cGlyZWRFcnJvciB9IGZyb20gXCIuLi8uLi9jb21tb24vZXJyb3IvUmVzdEVycm9yXCJcbmltcG9ydCB7IENhbmNlbGxlZEVycm9yIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9lcnJvci9DYW5jZWxsZWRFcnJvclwiXG5pbXBvcnQgeyBSZXN0Q2xpZW50IH0gZnJvbSBcIi4uL3Jlc3QvUmVzdENsaWVudFwiXG5pbXBvcnQgeyBFbnRpdHlDbGllbnQgfSBmcm9tIFwiLi4vLi4vY29tbW9uL0VudGl0eUNsaWVudFwiXG5pbXBvcnQgeyBHRU5FUkFURURfSURfQllURVNfTEVOR1RILCBpc1NhbWVJZCB9IGZyb20gXCIuLi8uLi9jb21tb24vdXRpbHMvRW50aXR5VXRpbHNcIlxuaW1wb3J0IHR5cGUgeyBDcmVkZW50aWFscyB9IGZyb20gXCIuLi8uLi8uLi9taXNjL2NyZWRlbnRpYWxzL0NyZWRlbnRpYWxzXCJcbmltcG9ydCB7XG5cdEFlczEyOEtleSxcblx0YWVzMjU2RGVjcnlwdFdpdGhSZWNvdmVyeUtleSxcblx0QWVzMjU2S2V5LFxuXHRhZXMyNTZSYW5kb21LZXksXG5cdGFlc0RlY3J5cHQsXG5cdEFlc0tleSxcblx0YmFzZTY0VG9LZXksXG5cdGNyZWF0ZUF1dGhWZXJpZmllcixcblx0Y3JlYXRlQXV0aFZlcmlmaWVyQXNCYXNlNjRVcmwsXG5cdGVuY3J5cHRLZXksXG5cdGdlbmVyYXRlS2V5RnJvbVBhc3NwaHJhc2VCY3J5cHQsXG5cdGdlbmVyYXRlUmFuZG9tU2FsdCxcblx0S2V5TGVuZ3RoLFxuXHRrZXlUb1VpbnQ4QXJyYXksXG5cdHNoYTI1Nkhhc2gsXG5cdFRvdHBTZWNyZXQsXG5cdFRvdHBWZXJpZmllcixcblx0dWludDhBcnJheVRvQml0QXJyYXksXG59IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtY3J5cHRvXCJcbmltcG9ydCB7IENyeXB0b0ZhY2FkZSB9IGZyb20gXCIuLi9jcnlwdG8vQ3J5cHRvRmFjYWRlXCJcbmltcG9ydCB7IEluc3RhbmNlTWFwcGVyIH0gZnJvbSBcIi4uL2NyeXB0by9JbnN0YW5jZU1hcHBlclwiXG5pbXBvcnQgeyBJU2VydmljZUV4ZWN1dG9yIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9TZXJ2aWNlUmVxdWVzdFwiXG5pbXBvcnQgeyBTZXNzaW9uVHlwZSB9IGZyb20gXCIuLi8uLi9jb21tb24vU2Vzc2lvblR5cGVcIlxuaW1wb3J0IHsgQ2FjaGVTdG9yYWdlTGF0ZUluaXRpYWxpemVyIH0gZnJvbSBcIi4uL3Jlc3QvQ2FjaGVTdG9yYWdlUHJveHlcIlxuaW1wb3J0IHsgQXV0aERhdGFQcm92aWRlciwgVXNlckZhY2FkZSB9IGZyb20gXCIuL1VzZXJGYWNhZGVcIlxuaW1wb3J0IHsgTG9naW5GYWlsUmVhc29uIH0gZnJvbSBcIi4uLy4uL21haW4vUGFnZUNvbnRleHRMb2dpbkxpc3RlbmVyLmpzXCJcbmltcG9ydCB7IExvZ2luSW5jb21wbGV0ZUVycm9yIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9lcnJvci9Mb2dpbkluY29tcGxldGVFcnJvci5qc1wiXG5pbXBvcnQgeyBFbnRyb3B5RmFjYWRlIH0gZnJvbSBcIi4vRW50cm9weUZhY2FkZS5qc1wiXG5pbXBvcnQgeyBCbG9iQWNjZXNzVG9rZW5GYWNhZGUgfSBmcm9tIFwiLi9CbG9iQWNjZXNzVG9rZW5GYWNhZGUuanNcIlxuaW1wb3J0IHsgUHJvZ3JhbW1pbmdFcnJvciB9IGZyb20gXCIuLi8uLi9jb21tb24vZXJyb3IvUHJvZ3JhbW1pbmdFcnJvci5qc1wiXG5pbXBvcnQgeyBEYXRhYmFzZUtleUZhY3RvcnkgfSBmcm9tIFwiLi4vLi4vLi4vbWlzYy9jcmVkZW50aWFscy9EYXRhYmFzZUtleUZhY3RvcnkuanNcIlxuaW1wb3J0IHsgRXh0ZXJuYWxVc2VyS2V5RGVyaXZlciB9IGZyb20gXCIuLi8uLi8uLi9taXNjL0xvZ2luVXRpbHMuanNcIlxuaW1wb3J0IHsgQXJnb24yaWRGYWNhZGUgfSBmcm9tIFwiLi9BcmdvbjJpZEZhY2FkZS5qc1wiXG5pbXBvcnQgeyBDcmVkZW50aWFsVHlwZSB9IGZyb20gXCIuLi8uLi8uLi9taXNjL2NyZWRlbnRpYWxzL0NyZWRlbnRpYWxUeXBlLmpzXCJcbmltcG9ydCB7IEtleVJvdGF0aW9uRmFjYWRlIH0gZnJvbSBcIi4vS2V5Um90YXRpb25GYWNhZGUuanNcIlxuaW1wb3J0IHsgZW5jcnlwdFN0cmluZyB9IGZyb20gXCIuLi9jcnlwdG8vQ3J5cHRvV3JhcHBlci5qc1wiXG5pbXBvcnQgeyBDYWNoZU1hbmFnZW1lbnRGYWNhZGUgfSBmcm9tIFwiLi9sYXp5L0NhY2hlTWFuYWdlbWVudEZhY2FkZS5qc1wiXG5cbmFzc2VydFdvcmtlck9yTm9kZSgpXG5cbmV4cG9ydCB0eXBlIE5ld1Nlc3Npb25EYXRhID0ge1xuXHR1c2VyOiBVc2VyXG5cdHVzZXJHcm91cEluZm86IEdyb3VwSW5mb1xuXHRzZXNzaW9uSWQ6IElkVHVwbGVcblx0Y3JlZGVudGlhbHM6IENyZWRlbnRpYWxzXG5cdGRhdGFiYXNlS2V5OiBVaW50OEFycmF5IHwgbnVsbFxufVxuXG5leHBvcnQgdHlwZSBDYWNoZUluZm8gPSB7XG5cdGlzUGVyc2lzdGVudDogYm9vbGVhblxuXHRpc05ld09mZmxpbmVEYjogYm9vbGVhblxuXHRkYXRhYmFzZUtleTogVWludDhBcnJheSB8IG51bGxcbn1cblxuaW50ZXJmYWNlIFJlc3VtZVNlc3Npb25SZXN1bHREYXRhIHtcblx0dXNlcjogVXNlclxuXHR1c2VyR3JvdXBJbmZvOiBHcm91cEluZm9cblx0c2Vzc2lvbklkOiBJZFR1cGxlXG59XG5cbmV4cG9ydCBjb25zdCBlbnVtIFJlc3VtZVNlc3Npb25FcnJvclJlYXNvbiB7XG5cdE9mZmxpbmVOb3RBdmFpbGFibGVGb3JGcmVlLFxufVxuXG5leHBvcnQgdHlwZSBJbml0Q2FjaGVPcHRpb25zID0ge1xuXHR1c2VySWQ6IElkXG5cdGRhdGFiYXNlS2V5OiBVaW50OEFycmF5IHwgbnVsbFxuXHR0aW1lUmFuZ2VEYXlzOiBudW1iZXIgfCBudWxsXG5cdGZvcmNlTmV3RGF0YWJhc2U6IGJvb2xlYW5cbn1cblxudHlwZSBSZXN1bWVTZXNzaW9uU3VjY2VzcyA9IHsgdHlwZTogXCJzdWNjZXNzXCI7IGRhdGE6IFJlc3VtZVNlc3Npb25SZXN1bHREYXRhIH1cbnR5cGUgUmVzdW1lU2Vzc2lvbkZhaWx1cmUgPSB7IHR5cGU6IFwiZXJyb3JcIjsgcmVhc29uOiBSZXN1bWVTZXNzaW9uRXJyb3JSZWFzb24gfVxudHlwZSBSZXN1bWVTZXNzaW9uUmVzdWx0ID0gUmVzdW1lU2Vzc2lvblN1Y2Nlc3MgfCBSZXN1bWVTZXNzaW9uRmFpbHVyZVxuXG50eXBlIEFzeW5jTG9naW5TdGF0ZSA9XG5cdHwgeyBzdGF0ZTogXCJpZGxlXCIgfVxuXHR8IHsgc3RhdGU6IFwicnVubmluZ1wiIH1cblx0fCB7XG5cdFx0XHRzdGF0ZTogXCJmYWlsZWRcIlxuXHRcdFx0Y3JlZGVudGlhbHM6IENyZWRlbnRpYWxzXG5cdFx0XHRjYWNoZUluZm86IENhY2hlSW5mb1xuXHQgIH1cblxuLyoqXG4gKiBBbGwgYXR0cmlidXRlcyB0aGF0IGFyZSByZXF1aXJlZCB0byBkZXJpdmUgdGhlIHBhc3NwaHJhc2Uga2V5LlxuICovXG5leHBvcnQgdHlwZSBQYXNzcGhyYXNlS2V5RGF0YSA9IHtcblx0a2RmVHlwZTogS2RmVHlwZVxuXHRzYWx0OiBVaW50OEFycmF5XG5cdHBhc3NwaHJhc2U6IHN0cmluZ1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIExvZ2luTGlzdGVuZXIge1xuXHQvKipcblx0ICogRnVsbCBsb2dpbiByZWFjaGVkOiBhbnkgbmV0d29yayByZXF1ZXN0cyBjYW4gYmUgbWFkZVxuXHQgKi9cblx0b25GdWxsTG9naW5TdWNjZXNzKHNlc3Npb25UeXBlOiBTZXNzaW9uVHlwZSwgY2FjaGVJbmZvOiBDYWNoZUluZm8sIGNyZWRlbnRpYWxzOiBDcmVkZW50aWFscyk6IFByb21pc2U8dm9pZD5cblxuXHQvKipcblx0ICogY2FsbCB3aGVuIHRoZSBsb2dpbiBmYWlscyBmb3IgaW52YWxpZCBzZXNzaW9uIG9yIG90aGVyIHJlYXNvbnNcblx0ICovXG5cdG9uTG9naW5GYWlsdXJlKHJlYXNvbjogTG9naW5GYWlsUmVhc29uKTogUHJvbWlzZTx2b2lkPlxuXG5cdC8qKlxuXHQgKiBTaG93cyBhIGRpYWxvZyB3aXRoIHBvc3NpYmlsaXR5IHRvIHVzZSBzZWNvbmQgZmFjdG9yIGFuZCB3aXRoIGEgbWVzc2FnZSB0aGF0IHRoZSBsb2dpbiBjYW4gYmUgYXBwcm92ZWQgZnJvbSBhbm90aGVyIGNsaWVudC5cblx0ICovXG5cdG9uU2Vjb25kRmFjdG9yQ2hhbGxlbmdlKHNlc3Npb25JZDogSWRUdXBsZSwgY2hhbGxlbmdlczogUmVhZG9ubHlBcnJheTxDaGFsbGVuZ2U+LCBtYWlsQWRkcmVzczogc3RyaW5nIHwgbnVsbCk6IFByb21pc2U8dm9pZD5cbn1cblxuZXhwb3J0IGNsYXNzIExvZ2luRmFjYWRlIHtcblx0cHJpdmF0ZSBldmVudEJ1c0NsaWVudCE6IEV2ZW50QnVzQ2xpZW50XG5cdC8qKlxuXHQgKiBVc2VkIGZvciBjYW5jZWxsaW5nIHNlY29uZCBmYWN0b3IgYW5kIHRvIG5vdCBtaXggZGlmZmVyZW50IGF0dGVtcHRzXG5cdCAqL1xuXHRwcml2YXRlIGxvZ2luUmVxdWVzdFNlc3Npb25JZDogSWRUdXBsZSB8IG51bGwgPSBudWxsXG5cblx0LyoqXG5cdCAqIFVzZWQgZm9yIGNhbmNlbGxpbmcgc2Vjb25kIGZhY3RvciBpbW1lZGlhdGVseVxuXHQgKi9cblx0cHJpdmF0ZSBsb2dnaW5nSW5Qcm9taXNlV3JhcHBlcjogRGVmZXJyZWRPYmplY3Q8dm9pZD4gfCBudWxsID0gbnVsbFxuXG5cdC8qKiBPbiBwbGF0Zm9ybXMgd2l0aCBvZmZsaW5lIGNhY2hlIHdlIGRvIHRoZSBhY3R1YWwgbG9naW4gYXN5bmNocm9ub3VzbHkgYW5kIHdlIGNhbiByZXRyeSBpdC4gVGhpcyBpcyB0aGUgc3RhdGUgb2Ygc3VjaCBhc3luYyBsb2dpbi4gKi9cblx0YXN5bmNMb2dpblN0YXRlOiBBc3luY0xvZ2luU3RhdGUgPSB7IHN0YXRlOiBcImlkbGVcIiB9XG5cblx0Y29uc3RydWN0b3IoXG5cdFx0cHJpdmF0ZSByZWFkb25seSByZXN0Q2xpZW50OiBSZXN0Q2xpZW50LFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgZW50aXR5Q2xpZW50OiBFbnRpdHlDbGllbnQsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBsb2dpbkxpc3RlbmVyOiBMb2dpbkxpc3RlbmVyLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgaW5zdGFuY2VNYXBwZXI6IEluc3RhbmNlTWFwcGVyLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgY3J5cHRvRmFjYWRlOiBDcnlwdG9GYWNhZGUsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBrZXlSb3RhdGlvbkZhY2FkZTogS2V5Um90YXRpb25GYWNhZGUsXG5cdFx0LyoqXG5cdFx0ICogIE9ubHkgbmVlZGVkIHNvIHRoYXQgd2UgY2FuIGluaXRpYWxpemUgdGhlIG9mZmxpbmUgc3RvcmFnZSBhZnRlciBsb2dpbi5cblx0XHQgKiAgVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSB3ZSBkb24ndCBrbm93IGlmIHdlJ2xsIGJlIHBlcnNpc3RlbnQgb3Igbm90IHVudGlsIHRoZSB1c2VyIHRyaWVzIHRvIGxvZ2luXG5cdFx0ICogIE9uY2UgdGhlIGNyZWRlbnRpYWxzIGhhbmRsaW5nIGhhcyBiZWVuIGNoYW5nZWQgdG8gKmFsd2F5cyogc2F2ZSBpbiBkZXNrdG9wLCB0aGVuIHRoaXMgc2hvdWxkIGJlY29tZSBvYnNvbGV0ZVxuXHRcdCAqL1xuXHRcdHByaXZhdGUgcmVhZG9ubHkgY2FjaGVJbml0aWFsaXplcjogQ2FjaGVTdG9yYWdlTGF0ZUluaXRpYWxpemVyLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgc2VydmljZUV4ZWN1dG9yOiBJU2VydmljZUV4ZWN1dG9yLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgdXNlckZhY2FkZTogVXNlckZhY2FkZSxcblx0XHRwcml2YXRlIHJlYWRvbmx5IGJsb2JBY2Nlc3NUb2tlbkZhY2FkZTogQmxvYkFjY2Vzc1Rva2VuRmFjYWRlLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgZW50cm9weUZhY2FkZTogRW50cm9weUZhY2FkZSxcblx0XHRwcml2YXRlIHJlYWRvbmx5IGRhdGFiYXNlS2V5RmFjdG9yeTogRGF0YWJhc2VLZXlGYWN0b3J5LFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgYXJnb24yaWRGYWNhZGU6IEFyZ29uMmlkRmFjYWRlLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgbm9uY2FjaGluZ0VudGl0eUNsaWVudDogRW50aXR5Q2xpZW50LFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgc2VuZEVycm9yOiAoZXJyb3I6IEVycm9yKSA9PiBQcm9taXNlPHZvaWQ+LFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgY2FjaGVNYW5hZ2VtZW50RmFjYWRlOiBsYXp5QXN5bmM8Q2FjaGVNYW5hZ2VtZW50RmFjYWRlPixcblx0KSB7fVxuXG5cdGluaXQoZXZlbnRCdXNDbGllbnQ6IEV2ZW50QnVzQ2xpZW50KSB7XG5cdFx0dGhpcy5ldmVudEJ1c0NsaWVudCA9IGV2ZW50QnVzQ2xpZW50XG5cdH1cblxuXHRhc3luYyByZXNldFNlc3Npb24oKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0dGhpcy5ldmVudEJ1c0NsaWVudC5jbG9zZShDbG9zZUV2ZW50QnVzT3B0aW9uLlRlcm1pbmF0ZSlcblx0XHRhd2FpdCB0aGlzLmRlSW5pdENhY2hlKClcblx0XHR0aGlzLnVzZXJGYWNhZGUucmVzZXQoKVxuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZSBzZXNzaW9uIGFuZCBsb2cgaW4uIENoYW5nZXMgaW50ZXJuYWwgc3RhdGUgdG8gcmVmZXIgdG8gdGhlIGxvZ2dlZCBpbiB1c2VyLlxuXHQgKi9cblx0YXN5bmMgY3JlYXRlU2Vzc2lvbihcblx0XHRtYWlsQWRkcmVzczogc3RyaW5nLFxuXHRcdHBhc3NwaHJhc2U6IHN0cmluZyxcblx0XHRjbGllbnRJZGVudGlmaWVyOiBzdHJpbmcsXG5cdFx0c2Vzc2lvblR5cGU6IFNlc3Npb25UeXBlLFxuXHRcdGRhdGFiYXNlS2V5OiBVaW50OEFycmF5IHwgbnVsbCxcblx0KTogUHJvbWlzZTxOZXdTZXNzaW9uRGF0YT4ge1xuXHRcdGlmICh0aGlzLnVzZXJGYWNhZGUuaXNQYXJ0aWFsbHlMb2dnZWRJbigpKSB7XG5cdFx0XHQvLyBkbyBub3QgcmVzZXQgaGVyZSBiZWNhdXNlIHRoZSBldmVudCBidXMgY2xpZW50IG5lZWRzIHRvIGJlIGtlcHQgaWYgdGhlIHNhbWUgdXNlciBpcyBsb2dnZWQgaW4gYXMgYmVmb3JlXG5cdFx0XHRjb25zb2xlLmxvZyhcInNlc3Npb24gYWxyZWFkeSBleGlzdHMsIHJldXNlIGRhdGFcIilcblx0XHRcdC8vIGNoZWNrIGlmIGl0IGlzIHRoZSBzYW1lIHVzZXIgaW4gX2luaXRTZXNzaW9uKClcblx0XHR9XG5cblx0XHRjb25zdCB7IHVzZXJQYXNzcGhyYXNlS2V5LCBrZGZUeXBlIH0gPSBhd2FpdCB0aGlzLmxvYWRVc2VyUGFzc3BocmFzZUtleShtYWlsQWRkcmVzcywgcGFzc3BocmFzZSlcblx0XHQvLyB0aGUgdmVyaWZpZXIgaXMgYWx3YXlzIHNlbnQgYXMgdXJsIHBhcmFtZXRlciwgc28gaXQgbXVzdCBiZSB1cmwgZW5jb2RlZFxuXHRcdGNvbnN0IGF1dGhWZXJpZmllciA9IGNyZWF0ZUF1dGhWZXJpZmllckFzQmFzZTY0VXJsKHVzZXJQYXNzcGhyYXNlS2V5KVxuXHRcdGNvbnN0IGNyZWF0ZVNlc3Npb25EYXRhID0gY3JlYXRlQ3JlYXRlU2Vzc2lvbkRhdGEoe1xuXHRcdFx0YWNjZXNzS2V5OiBudWxsLFxuXHRcdFx0YXV0aFRva2VuOiBudWxsLFxuXHRcdFx0YXV0aFZlcmlmaWVyLFxuXHRcdFx0Y2xpZW50SWRlbnRpZmllcixcblx0XHRcdG1haWxBZGRyZXNzOiBtYWlsQWRkcmVzcy50b0xvd2VyQ2FzZSgpLnRyaW0oKSxcblx0XHRcdHJlY292ZXJDb2RlVmVyaWZpZXI6IG51bGwsXG5cdFx0XHR1c2VyOiBudWxsLFxuXHRcdH0pXG5cblx0XHRsZXQgYWNjZXNzS2V5OiBBZXNLZXkgfCBudWxsID0gbnVsbFxuXG5cdFx0aWYgKHNlc3Npb25UeXBlID09PSBTZXNzaW9uVHlwZS5QZXJzaXN0ZW50KSB7XG5cdFx0XHRhY2Nlc3NLZXkgPSBhZXMyNTZSYW5kb21LZXkoKVxuXHRcdFx0Y3JlYXRlU2Vzc2lvbkRhdGEuYWNjZXNzS2V5ID0ga2V5VG9VaW50OEFycmF5KGFjY2Vzc0tleSlcblx0XHR9XG5cdFx0Y29uc3QgY3JlYXRlU2Vzc2lvblJldHVybiA9IGF3YWl0IHRoaXMuc2VydmljZUV4ZWN1dG9yLnBvc3QoU2Vzc2lvblNlcnZpY2UsIGNyZWF0ZVNlc3Npb25EYXRhKVxuXHRcdGNvbnN0IHNlc3Npb25EYXRhID0gYXdhaXQgdGhpcy53YWl0VW50aWxTZWNvbmRGYWN0b3JBcHByb3ZlZE9yQ2FuY2VsbGVkKGNyZWF0ZVNlc3Npb25SZXR1cm4sIG1haWxBZGRyZXNzKVxuXG5cdFx0Y29uc3QgZm9yY2VOZXdEYXRhYmFzZSA9IHNlc3Npb25UeXBlID09PSBTZXNzaW9uVHlwZS5QZXJzaXN0ZW50ICYmIGRhdGFiYXNlS2V5ID09IG51bGxcblx0XHRpZiAoZm9yY2VOZXdEYXRhYmFzZSkge1xuXHRcdFx0Y29uc29sZS5sb2coXCJnZW5lcmF0aW5nIG5ldyBkYXRhYmFzZSBrZXkgZm9yIHBlcnNpc3RlbnQgc2Vzc2lvblwiKVxuXHRcdFx0ZGF0YWJhc2VLZXkgPSBhd2FpdCB0aGlzLmRhdGFiYXNlS2V5RmFjdG9yeS5nZW5lcmF0ZUtleSgpXG5cdFx0fVxuXG5cdFx0Y29uc3QgY2FjaGVJbmZvID0gYXdhaXQgdGhpcy5pbml0Q2FjaGUoe1xuXHRcdFx0dXNlcklkOiBzZXNzaW9uRGF0YS51c2VySWQsXG5cdFx0XHRkYXRhYmFzZUtleSxcblx0XHRcdHRpbWVSYW5nZURheXM6IG51bGwsXG5cdFx0XHRmb3JjZU5ld0RhdGFiYXNlLFxuXHRcdH0pXG5cdFx0Y29uc3QgeyB1c2VyLCB1c2VyR3JvdXBJbmZvLCBhY2Nlc3NUb2tlbiB9ID0gYXdhaXQgdGhpcy5pbml0U2Vzc2lvbihzZXNzaW9uRGF0YS51c2VySWQsIHNlc3Npb25EYXRhLmFjY2Vzc1Rva2VuLCB1c2VyUGFzc3BocmFzZUtleSlcblxuXHRcdGNvbnN0IG1vZGVybktkZlR5cGUgPSB0aGlzLmlzTW9kZXJuS2RmVHlwZShrZGZUeXBlKVxuXHRcdGlmICghbW9kZXJuS2RmVHlwZSkge1xuXHRcdFx0YXdhaXQgdGhpcy5taWdyYXRlS2RmVHlwZShLZGZUeXBlLkFyZ29uMmlkLCBwYXNzcGhyYXNlLCB1c2VyKVxuXHRcdH1cblxuXHRcdGNvbnN0IGNyZWRlbnRpYWxzID0ge1xuXHRcdFx0bG9naW46IG1haWxBZGRyZXNzLFxuXHRcdFx0YWNjZXNzVG9rZW4sXG5cdFx0XHRlbmNyeXB0ZWRQYXNzd29yZDogc2Vzc2lvblR5cGUgPT09IFNlc3Npb25UeXBlLlBlcnNpc3RlbnQgPyB1aW50OEFycmF5VG9CYXNlNjQoZW5jcnlwdFN0cmluZyhuZXZlck51bGwoYWNjZXNzS2V5KSwgcGFzc3BocmFzZSkpIDogbnVsbCxcblx0XHRcdGVuY3J5cHRlZFBhc3NwaHJhc2VLZXk6IHNlc3Npb25UeXBlID09PSBTZXNzaW9uVHlwZS5QZXJzaXN0ZW50ID8gZW5jcnlwdEtleShuZXZlck51bGwoYWNjZXNzS2V5KSwgdXNlclBhc3NwaHJhc2VLZXkpIDogbnVsbCxcblx0XHRcdHVzZXJJZDogc2Vzc2lvbkRhdGEudXNlcklkLFxuXHRcdFx0dHlwZTogQ3JlZGVudGlhbFR5cGUuSW50ZXJuYWwsXG5cdFx0fVxuXHRcdHRoaXMubG9naW5MaXN0ZW5lci5vbkZ1bGxMb2dpblN1Y2Nlc3Moc2Vzc2lvblR5cGUsIGNhY2hlSW5mbywgY3JlZGVudGlhbHMpXG5cblx0XHRpZiAoIWlzQWRtaW5DbGllbnQoKSkge1xuXHRcdFx0YXdhaXQgdGhpcy5rZXlSb3RhdGlvbkZhY2FkZS5pbml0aWFsaXplKHVzZXJQYXNzcGhyYXNlS2V5LCBtb2Rlcm5LZGZUeXBlKVxuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHR1c2VyLFxuXHRcdFx0dXNlckdyb3VwSW5mbyxcblx0XHRcdHNlc3Npb25JZDogc2Vzc2lvbkRhdGEuc2Vzc2lvbklkLFxuXHRcdFx0Y3JlZGVudGlhbHM6IGNyZWRlbnRpYWxzLFxuXHRcdFx0Ly8gd2UgYWx3YXlzIHRyeSB0byBtYWtlIGEgcGVyc2lzdGVudCBjYWNoZSB3aXRoIGEga2V5IGZvciBwZXJzaXN0ZW50IHNlc3Npb24sIGJ1dCB0aGlzXG5cdFx0XHQvLyBmYWxscyBiYWNrIHRvIGVwaGVtZXJhbCBjYWNoZSBpbiBicm93c2Vycy4gbm8gcG9pbnQgc3RvcmluZyB0aGUga2V5IHRoZW4uXG5cdFx0XHRkYXRhYmFzZUtleTogY2FjaGVJbmZvLmlzUGVyc2lzdGVudCA/IGRhdGFiYXNlS2V5IDogbnVsbCxcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogRW5zdXJlIHRoYXQgdGhlIHVzZXIgaXMgdXNpbmcgYSBtb2Rlcm4gS0RGIHR5cGUsIG1pZ3JhdGluZyBpZiBub3QuXG5cdCAqIEBwYXJhbSB0YXJnZXRLZGZUeXBlIHRoZSBjdXJyZW50IEtERiB0eXBlXG5cdCAqIEBwYXJhbSBwYXNzcGhyYXNlIGVpdGhlciB0aGUgcGxhaW50ZXh0IHBhc3NwaHJhc2Ugb3IgdGhlIGVuY3J5cHRlZCBwYXNzcGhyYXNlIHdpdGggdGhlIGFjY2VzcyB0b2tlbiBuZWNlc3NhcnkgdG8gZGVjcnlwdCBpdFxuXHQgKiBAcGFyYW0gdXNlciB0aGUgdXNlciB3ZSBhcmUgdXBkYXRpbmdcblx0ICovXG5cdHB1YmxpYyBhc3luYyBtaWdyYXRlS2RmVHlwZSh0YXJnZXRLZGZUeXBlOiBLZGZUeXBlLCBwYXNzcGhyYXNlOiBzdHJpbmcsIHVzZXI6IFVzZXIpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRpZiAoIUNvbnN0LkVYRUNVVEVfS0RGX01JR1JBVElPTikge1xuXHRcdFx0Ly8gTWlncmF0aW9uIGlzIG5vdCB5ZXQgZW5hYmxlZCBvbiB0aGlzIHZlcnNpb24uXG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cdFx0Y29uc3QgY3VycmVudFBhc3NwaHJhc2VLZXlEYXRhID0ge1xuXHRcdFx0cGFzc3BocmFzZSxcblx0XHRcdGtkZlR5cGU6IGFzS2RmVHlwZSh1c2VyLmtkZlZlcnNpb24pLFxuXHRcdFx0c2FsdDogYXNzZXJ0Tm90TnVsbCh1c2VyLnNhbHQsIGBjdXJyZW50IHNhbHQgZm9yIHVzZXIgJHt1c2VyLl9pZH0gbm90IGZvdW5kYCksXG5cdFx0fVxuXG5cdFx0Y29uc3QgY3VycmVudFVzZXJQYXNzcGhyYXNlS2V5ID0gYXdhaXQgdGhpcy5kZXJpdmVVc2VyUGFzc3BocmFzZUtleShjdXJyZW50UGFzc3BocmFzZUtleURhdGEpXG5cdFx0Y29uc3QgY3VycmVudEF1dGhWZXJpZmllciA9IGNyZWF0ZUF1dGhWZXJpZmllcihjdXJyZW50VXNlclBhc3NwaHJhc2VLZXkpXG5cblx0XHRjb25zdCBuZXdQYXNzcGhyYXNlS2V5RGF0YSA9IHtcblx0XHRcdHBhc3NwaHJhc2UsXG5cdFx0XHRrZGZUeXBlOiB0YXJnZXRLZGZUeXBlLFxuXHRcdFx0c2FsdDogZ2VuZXJhdGVSYW5kb21TYWx0KCksXG5cdFx0fVxuXHRcdGNvbnN0IG5ld1VzZXJQYXNzcGhyYXNlS2V5ID0gYXdhaXQgdGhpcy5kZXJpdmVVc2VyUGFzc3BocmFzZUtleShuZXdQYXNzcGhyYXNlS2V5RGF0YSlcblxuXHRcdGNvbnN0IGN1cnJlbnRVc2VyR3JvdXBLZXkgPSB0aGlzLnVzZXJGYWNhZGUuZ2V0Q3VycmVudFVzZXJHcm91cEtleSgpXG5cdFx0Y29uc3QgcHdFbmNVc2VyR3JvdXBLZXkgPSBlbmNyeXB0S2V5KG5ld1VzZXJQYXNzcGhyYXNlS2V5LCBjdXJyZW50VXNlckdyb3VwS2V5Lm9iamVjdClcblx0XHRjb25zdCBuZXdBdXRoVmVyaWZpZXIgPSBjcmVhdGVBdXRoVmVyaWZpZXIobmV3VXNlclBhc3NwaHJhc2VLZXkpXG5cblx0XHRjb25zdCBjaGFuZ2VLZGZQb3N0SW4gPSBjcmVhdGVDaGFuZ2VLZGZQb3N0SW4oe1xuXHRcdFx0a2RmVmVyc2lvbjogbmV3UGFzc3BocmFzZUtleURhdGEua2RmVHlwZSxcblx0XHRcdHNhbHQ6IG5ld1Bhc3NwaHJhc2VLZXlEYXRhLnNhbHQsXG5cdFx0XHRwd0VuY1VzZXJHcm91cEtleSxcblx0XHRcdHZlcmlmaWVyOiBuZXdBdXRoVmVyaWZpZXIsXG5cdFx0XHRvbGRWZXJpZmllcjogY3VycmVudEF1dGhWZXJpZmllcixcblx0XHRcdHVzZXJHcm91cEtleVZlcnNpb246IFN0cmluZyhjdXJyZW50VXNlckdyb3VwS2V5LnZlcnNpb24pLFxuXHRcdH0pXG5cdFx0Y29uc29sZS5sb2coXCJNaWdyYXRlIEtERiBmcm9tOlwiLCB1c2VyLmtkZlZlcnNpb24sIFwidG9cIiwgdGFyZ2V0S2RmVHlwZSlcblx0XHRhd2FpdCB0aGlzLnNlcnZpY2VFeGVjdXRvci5wb3N0KENoYW5nZUtkZlNlcnZpY2UsIGNoYW5nZUtkZlBvc3RJbilcblx0XHQvLyBXZSByZWxvYWQgdGhlIHVzZXIgYmVjYXVzZSB3ZSBleHBlcmllbmNlZCBhIHJhY2UgY29uZGl0aW9uXG5cdFx0Ly8gd2VyZSB3ZSBkbyBub3QgcHJvY2VzcyB0aGUgVXNlciB1cGRhdGUgYWZ0ZXIgZG9pbmcgdGhlIGFyZ29uMiBtaWdyYXRpb24gZnJvbSB0aGUgd2ViIGNsaWVudC7CtFxuXHRcdC8vIEluIG9yZGVyIGRvIG5vdCByZXdvcmsgdGhlIGVudGl0eSBwcm9jZXNzaW5nIGFuZCBpdHMgaW5pdGlhbGl6YXRpb24gZm9yIG5ldyBjbGllbnRzIHdlXG5cdFx0Ly8gcmVwbGFjZSB0aGUgY2FjaGVkIGluc3RhbmNlcyBhZnRlciBkb2luZyB0aGUgbWlncmF0aW9uXG5cdFx0YXdhaXQgKGF3YWl0IHRoaXMuY2FjaGVNYW5hZ2VtZW50RmFjYWRlKCkpLnJlbG9hZFVzZXIoKVxuXHRcdHRoaXMudXNlckZhY2FkZS5zZXRVc2VyRGlzdEtleShjdXJyZW50VXNlckdyb3VwS2V5LnZlcnNpb24sIG5ld1VzZXJQYXNzcGhyYXNlS2V5KVxuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiB0aGUgZ2l2ZW4gS0RGIHR5cGUgaXMgcGhhc2VkIG91dC5cblx0ICogQHBhcmFtIGtkZlR5cGVcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHByaXZhdGUgaXNNb2Rlcm5LZGZUeXBlKGtkZlR5cGU6IEtkZlR5cGUpOiBib29sZWFuIHtcblx0XHQvLyByZXNpc3QgdGhlIHRlbXB0YXRpb24gdG8ganVzdCBjaGVjayBpZiBpdCBpcyBlcXVhbCB0byB0aGUgZGVmYXVsdCwgYmVjYXVzZSB0aGF0IHdpbGwgeWllbGQgZmFsc2UgZm9yIEtERiB0eXBlcyB3ZSBkb24ndCBrbm93IGFib3V0IHlldFxuXHRcdHJldHVybiBrZGZUeXBlICE9PSBLZGZUeXBlLkJjcnlwdFxuXHR9XG5cblx0LyoqXG5cdCAqIElmIHRoZSBzZWNvbmQgZmFjdG9yIGxvZ2luIGhhcyBiZWVuIGNhbmNlbGxlZCBhIENhbmNlbGxlZEVycm9yIGlzIHRocm93bi5cblx0ICovXG5cdHByaXZhdGUgd2FpdFVudGlsU2Vjb25kRmFjdG9yQXBwcm92ZWRPckNhbmNlbGxlZChcblx0XHRjcmVhdGVTZXNzaW9uUmV0dXJuOiBDcmVhdGVTZXNzaW9uUmV0dXJuLFxuXHRcdG1haWxBZGRyZXNzOiBzdHJpbmcgfCBudWxsLFxuXHQpOiBQcm9taXNlPHtcblx0XHRzZXNzaW9uSWQ6IElkVHVwbGVcblx0XHR1c2VySWQ6IElkXG5cdFx0YWNjZXNzVG9rZW46IEJhc2U2NFVybFxuXHR9PiB7XG5cdFx0bGV0IHAgPSBQcm9taXNlLnJlc29sdmUoKVxuXHRcdGxldCBzZXNzaW9uSWQgPSBbdGhpcy5nZXRTZXNzaW9uTGlzdElkKGNyZWF0ZVNlc3Npb25SZXR1cm4uYWNjZXNzVG9rZW4pLCB0aGlzLmdldFNlc3Npb25FbGVtZW50SWQoY3JlYXRlU2Vzc2lvblJldHVybi5hY2Nlc3NUb2tlbildIGFzIGNvbnN0XG5cdFx0dGhpcy5sb2dpblJlcXVlc3RTZXNzaW9uSWQgPSBzZXNzaW9uSWRcblxuXHRcdGlmIChjcmVhdGVTZXNzaW9uUmV0dXJuLmNoYWxsZW5nZXMubGVuZ3RoID4gMCkge1xuXHRcdFx0Ly8gU2hvdyBhIG1lc3NhZ2UgdG8gdGhlIHVzZXIgYW5kIGdpdmUgdGhlbSBhIGNoYW5jZSB0byBjb21wbGV0ZSB0aGUgY2hhbGxlbmdlcy5cblx0XHRcdHRoaXMubG9naW5MaXN0ZW5lci5vblNlY29uZEZhY3RvckNoYWxsZW5nZShzZXNzaW9uSWQsIGNyZWF0ZVNlc3Npb25SZXR1cm4uY2hhbGxlbmdlcywgbWFpbEFkZHJlc3MpXG5cblx0XHRcdHAgPSB0aGlzLndhaXRVbnRpbFNlY29uZEZhY3RvckFwcHJvdmVkKGNyZWF0ZVNlc3Npb25SZXR1cm4uYWNjZXNzVG9rZW4sIHNlc3Npb25JZCwgMClcblx0XHR9XG5cblx0XHR0aGlzLmxvZ2dpbmdJblByb21pc2VXcmFwcGVyID0gZGVmZXIoKVxuXHRcdC8vIFdhaXQgZm9yIGVpdGhlciBsb2dpbiBvciBjYW5jZWxcblx0XHRyZXR1cm4gUHJvbWlzZS5yYWNlKFt0aGlzLmxvZ2dpbmdJblByb21pc2VXcmFwcGVyLnByb21pc2UsIHBdKS50aGVuKCgpID0+ICh7XG5cdFx0XHRzZXNzaW9uSWQsXG5cdFx0XHRhY2Nlc3NUb2tlbjogY3JlYXRlU2Vzc2lvblJldHVybi5hY2Nlc3NUb2tlbixcblx0XHRcdHVzZXJJZDogY3JlYXRlU2Vzc2lvblJldHVybi51c2VyLFxuXHRcdH0pKVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyB3YWl0VW50aWxTZWNvbmRGYWN0b3JBcHByb3ZlZChhY2Nlc3NUb2tlbjogQmFzZTY0VXJsLCBzZXNzaW9uSWQ6IElkVHVwbGUsIHJldHJ5T25OZXR3b3JrRXJyb3I6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuXHRcdGxldCBzZWNvbmRGYWN0b3JBdXRoR2V0RGF0YSA9IGNyZWF0ZVNlY29uZEZhY3RvckF1dGhHZXREYXRhKHtcblx0XHRcdGFjY2Vzc1Rva2VuLFxuXHRcdH0pXG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IHNlY29uZEZhY3RvckF1dGhHZXRSZXR1cm4gPSBhd2FpdCB0aGlzLnNlcnZpY2VFeGVjdXRvci5nZXQoU2Vjb25kRmFjdG9yQXV0aFNlcnZpY2UsIHNlY29uZEZhY3RvckF1dGhHZXREYXRhKVxuXHRcdFx0aWYgKCF0aGlzLmxvZ2luUmVxdWVzdFNlc3Npb25JZCB8fCAhaXNTYW1lSWQodGhpcy5sb2dpblJlcXVlc3RTZXNzaW9uSWQsIHNlc3Npb25JZCkpIHtcblx0XHRcdFx0dGhyb3cgbmV3IENhbmNlbGxlZEVycm9yKFwibG9naW4gY2FuY2VsbGVkXCIpXG5cdFx0XHR9XG5cblx0XHRcdGlmIChzZWNvbmRGYWN0b3JBdXRoR2V0UmV0dXJuLnNlY29uZEZhY3RvclBlbmRpbmcpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMud2FpdFVudGlsU2Vjb25kRmFjdG9yQXBwcm92ZWQoYWNjZXNzVG9rZW4sIHNlc3Npb25JZCwgMClcblx0XHRcdH1cblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRpZiAoZSBpbnN0YW5jZW9mIENvbm5lY3Rpb25FcnJvciAmJiByZXRyeU9uTmV0d29ya0Vycm9yIDwgMTApIHtcblx0XHRcdFx0Ly8gQ29ubmVjdGlvbiBlcnJvciBjYW4gb2NjdXIgb24gaW9zIHdoZW4gc3dpdGNoaW5nIGJldHdlZW4gYXBwcyBvciBqdXN0IGFzIGEgdGltZW91dCAob3VyIHJlcXVlc3QgdGltZW91dCBpcyBzaG9ydGVyIHRoYW4gdGhlIG92ZXJhbGxcblx0XHRcdFx0Ly8gYXV0aCBmbG93IHRpbWVvdXQpLiBKdXN0IHJldHJ5IGluIHRoaXMgY2FzZS5cblx0XHRcdFx0cmV0dXJuIHRoaXMud2FpdFVudGlsU2Vjb25kRmFjdG9yQXBwcm92ZWQoYWNjZXNzVG9rZW4sIHNlc3Npb25JZCwgcmV0cnlPbk5ldHdvcmtFcnJvciArIDEpXG5cdFx0XHR9XG5cdFx0XHR0aHJvdyBlXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZSBleHRlcm5hbCAodGVtcG9yYXJ5IG1haWxib3ggZm9yIHBhc3NwaHJhc2UtcHJvdGVjdGVkIGVtYWlscykgc2Vzc2lvbiBhbmQgbG9nIGluLlxuXHQgKiBDaGFuZ2VzIGludGVybmFsIHN0YXRlIHRvIHJlZmVyIHRvIHRoZSBsb2dnZWQtaW4gdXNlci5cblx0ICovXG5cdGFzeW5jIGNyZWF0ZUV4dGVybmFsU2Vzc2lvbihcblx0XHR1c2VySWQ6IElkLFxuXHRcdHBhc3NwaHJhc2U6IHN0cmluZyxcblx0XHRzYWx0OiBVaW50OEFycmF5LFxuXHRcdGtkZlR5cGU6IEtkZlR5cGUsXG5cdFx0Y2xpZW50SWRlbnRpZmllcjogc3RyaW5nLFxuXHRcdHBlcnNpc3RlbnRTZXNzaW9uOiBib29sZWFuLFxuXHQpOiBQcm9taXNlPE5ld1Nlc3Npb25EYXRhPiB7XG5cdFx0aWYgKHRoaXMudXNlckZhY2FkZS5pc1BhcnRpYWxseUxvZ2dlZEluKCkpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcInVzZXIgYWxyZWFkeSBsb2dnZWQgaW5cIilcblx0XHR9XG5cblx0XHRjb25zdCB1c2VyUGFzc3BocmFzZUtleSA9IGF3YWl0IHRoaXMuZGVyaXZlVXNlclBhc3NwaHJhc2VLZXkoeyBrZGZUeXBlLCBwYXNzcGhyYXNlLCBzYWx0IH0pXG5cdFx0Ly8gdGhlIHZlcmlmaWVyIGlzIGFsd2F5cyBzZW50IGFzIHVybCBwYXJhbWV0ZXIsIHNvIGl0IG11c3QgYmUgdXJsIGVuY29kZWRcblx0XHRjb25zdCBhdXRoVmVyaWZpZXIgPSBjcmVhdGVBdXRoVmVyaWZpZXJBc0Jhc2U2NFVybCh1c2VyUGFzc3BocmFzZUtleSlcblx0XHRjb25zdCBhdXRoVG9rZW4gPSBiYXNlNjRUb0Jhc2U2NFVybCh1aW50OEFycmF5VG9CYXNlNjQoc2hhMjU2SGFzaChzYWx0KSkpXG5cdFx0Y29uc3Qgc2Vzc2lvbkRhdGEgPSBjcmVhdGVDcmVhdGVTZXNzaW9uRGF0YSh7XG5cdFx0XHRhY2Nlc3NLZXk6IG51bGwsXG5cdFx0XHRhdXRoVG9rZW4sXG5cdFx0XHRhdXRoVmVyaWZpZXIsXG5cdFx0XHRjbGllbnRJZGVudGlmaWVyLFxuXHRcdFx0bWFpbEFkZHJlc3M6IG51bGwsXG5cdFx0XHRyZWNvdmVyQ29kZVZlcmlmaWVyOiBudWxsLFxuXHRcdFx0dXNlcjogdXNlcklkLFxuXHRcdH0pXG5cdFx0bGV0IGFjY2Vzc0tleTogQWVzMjU2S2V5IHwgbnVsbCA9IG51bGxcblxuXHRcdGlmIChwZXJzaXN0ZW50U2Vzc2lvbikge1xuXHRcdFx0YWNjZXNzS2V5ID0gYWVzMjU2UmFuZG9tS2V5KClcblx0XHRcdHNlc3Npb25EYXRhLmFjY2Vzc0tleSA9IGtleVRvVWludDhBcnJheShhY2Nlc3NLZXkpXG5cdFx0fVxuXG5cdFx0Y29uc3QgY3JlYXRlU2Vzc2lvblJldHVybiA9IGF3YWl0IHRoaXMuc2VydmljZUV4ZWN1dG9yLnBvc3QoU2Vzc2lvblNlcnZpY2UsIHNlc3Npb25EYXRhKVxuXG5cdFx0bGV0IHNlc3Npb25JZCA9IFt0aGlzLmdldFNlc3Npb25MaXN0SWQoY3JlYXRlU2Vzc2lvblJldHVybi5hY2Nlc3NUb2tlbiksIHRoaXMuZ2V0U2Vzc2lvbkVsZW1lbnRJZChjcmVhdGVTZXNzaW9uUmV0dXJuLmFjY2Vzc1Rva2VuKV0gYXMgY29uc3Rcblx0XHRjb25zdCBjYWNoZUluZm8gPSBhd2FpdCB0aGlzLmluaXRDYWNoZSh7XG5cdFx0XHR1c2VySWQsXG5cdFx0XHRkYXRhYmFzZUtleTogbnVsbCxcblx0XHRcdHRpbWVSYW5nZURheXM6IG51bGwsXG5cdFx0XHRmb3JjZU5ld0RhdGFiYXNlOiB0cnVlLFxuXHRcdH0pXG5cdFx0Y29uc3QgeyB1c2VyLCB1c2VyR3JvdXBJbmZvLCBhY2Nlc3NUb2tlbiB9ID0gYXdhaXQgdGhpcy5pbml0U2Vzc2lvbihjcmVhdGVTZXNzaW9uUmV0dXJuLnVzZXIsIGNyZWF0ZVNlc3Npb25SZXR1cm4uYWNjZXNzVG9rZW4sIHVzZXJQYXNzcGhyYXNlS2V5KVxuXHRcdGNvbnN0IGNyZWRlbnRpYWxzID0ge1xuXHRcdFx0bG9naW46IHVzZXJJZCxcblx0XHRcdGFjY2Vzc1Rva2VuLFxuXHRcdFx0ZW5jcnlwdGVkUGFzc3dvcmQ6IGFjY2Vzc0tleSA/IHVpbnQ4QXJyYXlUb0Jhc2U2NChlbmNyeXB0U3RyaW5nKGFjY2Vzc0tleSwgcGFzc3BocmFzZSkpIDogbnVsbCxcblx0XHRcdGVuY3J5cHRlZFBhc3NwaHJhc2VLZXk6IGFjY2Vzc0tleSA/IGVuY3J5cHRLZXkoYWNjZXNzS2V5LCB1c2VyUGFzc3BocmFzZUtleSkgOiBudWxsLFxuXHRcdFx0dXNlcklkLFxuXHRcdFx0dHlwZTogQ3JlZGVudGlhbFR5cGUuRXh0ZXJuYWwsXG5cdFx0fVxuXHRcdHRoaXMubG9naW5MaXN0ZW5lci5vbkZ1bGxMb2dpblN1Y2Nlc3MoU2Vzc2lvblR5cGUuTG9naW4sIGNhY2hlSW5mbywgY3JlZGVudGlhbHMpXG5cdFx0cmV0dXJuIHtcblx0XHRcdHVzZXIsXG5cdFx0XHR1c2VyR3JvdXBJbmZvLFxuXHRcdFx0c2Vzc2lvbklkLFxuXHRcdFx0Y3JlZGVudGlhbHM6IGNyZWRlbnRpYWxzLFxuXHRcdFx0ZGF0YWJhc2VLZXk6IG51bGwsXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIERlcml2ZSBhIGtleSBnaXZlbiBhIEtERiB0eXBlLCBwYXNzcGhyYXNlLCBhbmQgc2FsdFxuXHQgKi9cblx0YXN5bmMgZGVyaXZlVXNlclBhc3NwaHJhc2VLZXkoeyBrZGZUeXBlLCBwYXNzcGhyYXNlLCBzYWx0IH06IFBhc3NwaHJhc2VLZXlEYXRhKTogUHJvbWlzZTxBZXNLZXk+IHtcblx0XHRzd2l0Y2ggKGtkZlR5cGUpIHtcblx0XHRcdGNhc2UgS2RmVHlwZS5CY3J5cHQ6IHtcblx0XHRcdFx0cmV0dXJuIGdlbmVyYXRlS2V5RnJvbVBhc3NwaHJhc2VCY3J5cHQocGFzc3BocmFzZSwgc2FsdCwgS2V5TGVuZ3RoLmIxMjgpXG5cdFx0XHR9XG5cdFx0XHRjYXNlIEtkZlR5cGUuQXJnb24yaWQ6IHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuYXJnb24yaWRGYWNhZGUuZ2VuZXJhdGVLZXlGcm9tUGFzc3BocmFzZShwYXNzcGhyYXNlLCBzYWx0KVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKiBDYW5jZWxzIDJGQSBwcm9jZXNzLiAqL1xuXHRhc3luYyBjYW5jZWxDcmVhdGVTZXNzaW9uKHNlc3Npb25JZDogSWRUdXBsZSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGlmICghdGhpcy5sb2dpblJlcXVlc3RTZXNzaW9uSWQgfHwgIWlzU2FtZUlkKHRoaXMubG9naW5SZXF1ZXN0U2Vzc2lvbklkLCBzZXNzaW9uSWQpKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJUcnlpbmcgdG8gY2FuY2VsIHNlc3Npb24gY3JlYXRpb24gYnV0IHRoZSBzdGF0ZSBpcyBpbnZhbGlkXCIpXG5cdFx0fVxuXG5cdFx0Y29uc3Qgc2Vjb25kRmFjdG9yQXV0aERlbGV0ZURhdGEgPSBjcmVhdGVTZWNvbmRGYWN0b3JBdXRoRGVsZXRlRGF0YSh7XG5cdFx0XHRzZXNzaW9uOiBzZXNzaW9uSWQsXG5cdFx0fSlcblx0XHRhd2FpdCB0aGlzLnNlcnZpY2VFeGVjdXRvclxuXHRcdFx0LmRlbGV0ZShTZWNvbmRGYWN0b3JBdXRoU2VydmljZSwgc2Vjb25kRmFjdG9yQXV0aERlbGV0ZURhdGEpXG5cdFx0XHQuY2F0Y2goXG5cdFx0XHRcdG9mQ2xhc3MoTm90Rm91bmRFcnJvciwgKGUpID0+IHtcblx0XHRcdFx0XHQvLyBUaGlzIGNhbiBoYXBwZW4gZHVyaW5nIHNvbWUgb2RkIGJlaGF2aW9yIGluIGJyb3dzZXIgd2hlcmUgbWFpbiBsb29wIHdvdWxkIGJlIGJsb2NrZWQgYnkgd2ViYXV0aG4gKGhlbGxvLCBGRikgYW5kIHRoZW4gd2Ugd291bGQgdHJ5IHRvXG5cdFx0XHRcdFx0Ly8gY2FuY2VsIHRvbyBsYXRlLiBObyBoYXJtIGhlcmUgYW55d2F5IGlmIHRoZSBzZXNzaW9uIGlzIGFscmVhZHkgZ29uZS5cblx0XHRcdFx0XHRjb25zb2xlLndhcm4oXCJUcmllZCB0byBjYW5jZWwgc2Vjb25kIGZhY3RvciBidXQgaXQgd2FzIG5vdCB0aGVyZSBhbnltb3JlXCIsIGUpXG5cdFx0XHRcdH0pLFxuXHRcdFx0KVxuXHRcdFx0LmNhdGNoKFxuXHRcdFx0XHRvZkNsYXNzKExvY2tlZEVycm9yLCAoZSkgPT4ge1xuXHRcdFx0XHRcdC8vIE1pZ2h0IGhhcHBlbiBpZiB3ZSB0cmlnZ2VyIGNhbmNlbCBhbmQgY29uZmlybSBhdCB0aGUgc2FtZSB0aW1lLlxuXHRcdFx0XHRcdGNvbnNvbGUud2FybihcIlRyaWVkIHRvIGNhbmNlbCBzZWNvbmQgZmFjdG9yIGJ1dCBpdCBpcyBjdXJyZW50bHkgbG9ja2VkXCIsIGUpXG5cdFx0XHRcdH0pLFxuXHRcdFx0KVxuXHRcdHRoaXMubG9naW5SZXF1ZXN0U2Vzc2lvbklkID0gbnVsbFxuXHRcdHRoaXMubG9nZ2luZ0luUHJvbWlzZVdyYXBwZXI/LnJlamVjdChuZXcgQ2FuY2VsbGVkRXJyb3IoXCJsb2dpbiBjYW5jZWxsZWRcIikpXG5cdH1cblxuXHQvKiogRmluaXNoZXMgMkZBIHByb2Nlc3MgZWl0aGVyIHVzaW5nIHNlY29uZCBmYWN0b3Igb3IgYXBwcm92aW5nIHNlc3Npb24gb24gYW5vdGhlciBjbGllbnQuICovXG5cdGFzeW5jIGF1dGhlbnRpY2F0ZVdpdGhTZWNvbmRGYWN0b3IoZGF0YTogU2Vjb25kRmFjdG9yQXV0aERhdGEsIGhvc3Q/OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRhd2FpdCB0aGlzLnNlcnZpY2VFeGVjdXRvci5wb3N0KFNlY29uZEZhY3RvckF1dGhTZXJ2aWNlLCBkYXRhLCB7IGJhc2VVcmw6IGhvc3QgfSlcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXN1bWVzIHByZXZpb3VzbHkgY3JlYXRlZCBzZXNzaW9uICh1c2luZyBwZXJzaXN0ZWQgY3JlZGVudGlhbHMpLlxuXHQgKiBAcGFyYW0gY3JlZGVudGlhbHMgdGhlIHNhdmVkIGNyZWRlbnRpYWxzIHRvIHVzZVxuXHQgKiBAcGFyYW0gZXh0ZXJuYWxVc2VyS2V5RGVyaXZlciBpbmZvcm1hdGlvbiBmb3IgZGVyaXZpbmcgYSBrZXkgKGlmIGV4dGVybmFsIHVzZXIpXG5cdCAqIEBwYXJhbSBkYXRhYmFzZUtleSBrZXkgdG8gdW5sb2NrIHRoZSBsb2NhbCBkYXRhYmFzZSAoaWYgZW5hYmxlZClcblx0ICogQHBhcmFtIHRpbWVSYW5nZURheXMgdGhlIHVzZXIgY29uZmlndXJlZCB0aW1lIHJhbmdlIGZvciB0aGUgb2ZmbGluZSBkYXRhYmFzZVxuXHQgKi9cblx0YXN5bmMgcmVzdW1lU2Vzc2lvbihcblx0XHRjcmVkZW50aWFsczogQ3JlZGVudGlhbHMsXG5cdFx0ZXh0ZXJuYWxVc2VyS2V5RGVyaXZlcjogRXh0ZXJuYWxVc2VyS2V5RGVyaXZlciB8IG51bGwsXG5cdFx0ZGF0YWJhc2VLZXk6IFVpbnQ4QXJyYXkgfCBudWxsLFxuXHRcdHRpbWVSYW5nZURheXM6IG51bWJlciB8IG51bGwsXG5cdCk6IFByb21pc2U8UmVzdW1lU2Vzc2lvblJlc3VsdD4ge1xuXHRcdGlmICh0aGlzLnVzZXJGYWNhZGUuZ2V0VXNlcigpICE9IG51bGwpIHtcblx0XHRcdHRocm93IG5ldyBQcm9ncmFtbWluZ0Vycm9yKFxuXHRcdFx0XHRgVHJ5aW5nIHRvIHJlc3VtZSB0aGUgc2Vzc2lvbiBmb3IgdXNlciAke2NyZWRlbnRpYWxzLnVzZXJJZH0gd2hpbGUgYWxyZWFkeSBsb2dnZWQgaW4gZm9yICR7dGhpcy51c2VyRmFjYWRlLmdldFVzZXIoKT8uX2lkfWAsXG5cdFx0XHQpXG5cdFx0fVxuXHRcdGlmICh0aGlzLmFzeW5jTG9naW5TdGF0ZS5zdGF0ZSAhPT0gXCJpZGxlXCIpIHtcblx0XHRcdHRocm93IG5ldyBQcm9ncmFtbWluZ0Vycm9yKGBUcnlpbmcgdG8gcmVzdW1lIHRoZSBzZXNzaW9uIGZvciB1c2VyICR7Y3JlZGVudGlhbHMudXNlcklkfSB3aGlsZSB0aGUgYXN5bmNMb2dpblN0YXRlIGlzICR7dGhpcy5hc3luY0xvZ2luU3RhdGUuc3RhdGV9YClcblx0XHR9XG5cdFx0dGhpcy51c2VyRmFjYWRlLnNldEFjY2Vzc1Rva2VuKGNyZWRlbnRpYWxzLmFjY2Vzc1Rva2VuKVxuXHRcdC8vIGltcG9ydGFudDogYW55IGV4aXQgcG9pbnQgZnJvbSBoZXJlIG9uIHNob3VsZCBkZWluaXQgdGhlIGNhY2hlIGlmIHRoZSBsb2dpbiBoYXNuJ3Qgc3VjY2VlZGVkXG5cdFx0Y29uc3QgY2FjaGVJbmZvID0gYXdhaXQgdGhpcy5pbml0Q2FjaGUoe1xuXHRcdFx0dXNlcklkOiBjcmVkZW50aWFscy51c2VySWQsXG5cdFx0XHRkYXRhYmFzZUtleSxcblx0XHRcdHRpbWVSYW5nZURheXMsXG5cdFx0XHRmb3JjZU5ld0RhdGFiYXNlOiBmYWxzZSxcblx0XHR9KVxuXHRcdGNvbnN0IHNlc3Npb25JZCA9IHRoaXMuZ2V0U2Vzc2lvbklkKGNyZWRlbnRpYWxzKVxuXHRcdHRyeSB7XG5cdFx0XHQvLyB1c2luZyBvZmZsaW5lLCBmcmVlLCBoYXZlIGNvbm5lY3Rpb24gICAgICAgICAtPiBzeW5jIGxvZ2luXG5cdFx0XHQvLyB1c2luZyBvZmZsaW5lLCBmcmVlLCBubyBjb25uZWN0aW9uICAgICAgICAgICAtPiBpbmRpY2F0ZSB0aGF0IG9mZmxpbmUgbG9naW4gaXMgbm90IGZvciBmcmVlIGN1c3RvbWVyc1xuXHRcdFx0Ly8gdXNpbmcgb2ZmbGluZSwgcHJlbWl1bSwgaGF2ZSBjb25uZWN0aW9uICAgICAgLT4gYXN5bmMgbG9naW5cblx0XHRcdC8vIHVzaW5nIG9mZmxpbmUsIHByZW1pdW0sIG5vIGNvbm5lY3Rpb24gICAgICAgIC0+IGFzeW5jIGxvZ2luIHcvIGxhdGVyIHJldHJ5XG5cdFx0XHQvLyBubyBvZmZsaW5lLCBmcmVlLCBoYXZlIGNvbm5lY3Rpb24gICAgICAgICAgICAtPiBzeW5jIGxvZ2luXG5cdFx0XHQvLyBubyBvZmZsaW5lLCBmcmVlLCBubyBjb25uZWN0aW9uICAgICAgICAgICAgICAtPiBzeW5jIGxvZ2luLCBmYWlsIHdpdGggY29ubmVjdGlvbiBlcnJvclxuXHRcdFx0Ly8gbm8gb2ZmbGluZSwgcHJlbWl1bSwgaGF2ZSBjb25uZWN0aW9uICAgICAgICAgLT4gc3luYyBsb2dpblxuXHRcdFx0Ly8gbm8gb2ZmbGluZSwgcHJlbWl1bSwgbm8gY29ubmVjdGlvbiAgICAgICAgICAgLT4gc3luYyBsb2dpbiwgZmFpbCB3aXRoIGNvbm5lY3Rpb24gZXJyb3JcblxuXHRcdFx0Ly8gSWYgYSB1c2VyIGVuYWJsZXMgb2ZmbGluZSBzdG9yYWdlIGZvciB0aGUgZmlyc3QgdGltZSwgYWZ0ZXIgYWxyZWFkeSBoYXZpbmcgc2F2ZWQgY3JlZGVudGlhbHNcblx0XHRcdC8vIHRoZW4gdXBvbiB0aGVpciBuZXh0IGxvZ2luLCB0aGV5IHdvbid0IGhhdmUgYW4gb2ZmbGluZSBkYXRhYmFzZSBhdmFpbGFibGUsIG1lYW5pbmcgd2UgaGF2ZSB0byBkb1xuXHRcdFx0Ly8gc3luY2hyb25vdXMgbG9naW4gaW4gb3JkZXIgdG8gbG9hZCBhbGwgdGhlIG5lY2Vzc2FyeSBrZXlzIGFuZCBzdWNoXG5cdFx0XHQvLyB0aGUgbmV4dCB0aW1lIHRoZXkgbG9nIGluIHRoZXkgd2lsbCBiZSBhYmxlIHRvIGRvIGFzeW5jaHJvbm91cyBsb2dpblxuXHRcdFx0aWYgKGNhY2hlSW5mbz8uaXNQZXJzaXN0ZW50ICYmICFjYWNoZUluZm8uaXNOZXdPZmZsaW5lRGIpIHtcblx0XHRcdFx0Y29uc3QgdXNlciA9IGF3YWl0IHRoaXMuZW50aXR5Q2xpZW50LmxvYWQoVXNlclR5cGVSZWYsIGNyZWRlbnRpYWxzLnVzZXJJZClcblx0XHRcdFx0aWYgKHVzZXIuYWNjb3VudFR5cGUgIT09IEFjY291bnRUeXBlLlBBSUQpIHtcblx0XHRcdFx0XHQvLyBpZiBhY2NvdW50IGlzIGZyZWUgZG8gbm90IHN0YXJ0IG9mZmxpbmUgbG9naW4vYXN5bmMgbG9naW4gd29ya2Zsb3cuXG5cdFx0XHRcdFx0Ly8gYXdhaXQgYmVmb3JlIHJldHVybiB0byBjYXRjaCBlcnJvcnMgaGVyZVxuXHRcdFx0XHRcdHJldHVybiBhd2FpdCB0aGlzLmZpbmlzaFJlc3VtZVNlc3Npb24oY3JlZGVudGlhbHMsIGV4dGVybmFsVXNlcktleURlcml2ZXIsIGNhY2hlSW5mbykuY2F0Y2goXG5cdFx0XHRcdFx0XHRvZkNsYXNzKENvbm5lY3Rpb25FcnJvciwgYXN5bmMgKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRhd2FpdCB0aGlzLnJlc2V0U2Vzc2lvbigpXG5cdFx0XHRcdFx0XHRcdHJldHVybiB7IHR5cGU6IFwiZXJyb3JcIiwgcmVhc29uOiBSZXN1bWVTZXNzaW9uRXJyb3JSZWFzb24uT2ZmbGluZU5vdEF2YWlsYWJsZUZvckZyZWUgfVxuXHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMudXNlckZhY2FkZS5zZXRVc2VyKHVzZXIpXG5cblx0XHRcdFx0Ly8gVGVtcG9yYXJ5IHdvcmthcm91bmQgZm9yIHRoZSB0cmFuc2l0aW9uYWwgcGVyaW9kXG5cdFx0XHRcdC8vIEJlZm9yZSBvZmZsaW5lIGxvZ2luIHdhcyBlbmFibGVkIChpbiAzLjk2LjQpIHdlIGRpZG4ndCB1c2UgY2FjaGUgZm9yIHRoZSBsb2dpbiBwcm9jZXNzLCBvbmx5IGFmdGVyd2FyZHMuXG5cdFx0XHRcdC8vIFRoaXMgY291bGQgbGVhZCB0byBhIHNpdHVhdGlvbiB3aGVyZSB3ZSBuZXZlciBsb2FkZWQgb3Igc2F2ZWQgdXNlciBncm91cEluZm8gYnV0IHdvdWxkIHRyeSB0byB1c2UgaXQgbm93LlxuXHRcdFx0XHQvLyBXZSBjYW4gcmVtb3ZlIHRoaXMgYWZ0ZXIgYSBmZXcgdmVyc2lvbnMgd2hlbiB0aGUgYnVsayBvZiBwZW9wbGUgd2hvIGVuYWJsZWQgb2ZmbGluZSB3aWxsIHVwZ3JhZGUuXG5cdFx0XHRcdGxldCB1c2VyR3JvdXBJbmZvOiBHcm91cEluZm9cblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHR1c2VyR3JvdXBJbmZvID0gYXdhaXQgdGhpcy5lbnRpdHlDbGllbnQubG9hZChHcm91cEluZm9UeXBlUmVmLCB1c2VyLnVzZXJHcm91cC5ncm91cEluZm8pXG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhcIkNvdWxkIG5vdCBkbyBzdGFydCBsb2dpbiwgZ3JvdXBJbmZvIGlzIG5vdCBjYWNoZWQsIGZhbGxpbmcgYmFjayB0byBzeW5jIGxvZ2luXCIpXG5cdFx0XHRcdFx0aWYgKGUgaW5zdGFuY2VvZiBMb2dpbkluY29tcGxldGVFcnJvcikge1xuXHRcdFx0XHRcdFx0Ly8gYXdhaXQgYmVmb3JlIHJldHVybiB0byBjYXRjaCB0aGUgZXJyb3JzIGhlcmVcblx0XHRcdFx0XHRcdHJldHVybiBhd2FpdCB0aGlzLmZpbmlzaFJlc3VtZVNlc3Npb24oY3JlZGVudGlhbHMsIGV4dGVybmFsVXNlcktleURlcml2ZXIsIGNhY2hlSW5mbylcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Ly8gbm9pbnNwZWN0aW9uIEV4Y2VwdGlvbkNhdWdodExvY2FsbHlKUzogd2Ugd2FudCB0byBtYWtlIHN1cmUgd2UgZ28gdGhyb3cgdGhlIHNhbWUgZXhpdCBwb2ludFxuXHRcdFx0XHRcdFx0dGhyb3cgZVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFN0YXJ0IGZ1bGwgbG9naW4gYXN5bmNcblx0XHRcdFx0UHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB0aGlzLmFzeW5jUmVzdW1lU2Vzc2lvbihjcmVkZW50aWFscywgY2FjaGVJbmZvKSlcblx0XHRcdFx0Y29uc3QgZGF0YSA9IHtcblx0XHRcdFx0XHR1c2VyLFxuXHRcdFx0XHRcdHVzZXJHcm91cEluZm8sXG5cdFx0XHRcdFx0c2Vzc2lvbklkLFxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiB7IHR5cGU6IFwic3VjY2Vzc1wiLCBkYXRhIH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIGF3YWl0IGJlZm9yZSByZXR1cm4gdG8gY2F0Y2ggZXJyb3JzIGhlcmVcblx0XHRcdFx0cmV0dXJuIGF3YWl0IHRoaXMuZmluaXNoUmVzdW1lU2Vzc2lvbihjcmVkZW50aWFscywgZXh0ZXJuYWxVc2VyS2V5RGVyaXZlciwgY2FjaGVJbmZvKVxuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdC8vIElmIHdlIGluaXRpYWxpemVkIHRoZSBjYWNoZSwgYnV0IHRoZW4gd2UgY291bGRuJ3QgYXV0aGVudGljYXRlIHdlIHNob3VsZCBkZS1pbml0aWFsaXplXG5cdFx0XHQvLyB0aGUgY2FjaGUgYWdhaW4gYmVjYXVzZSB3ZSB3aWxsIGluaXRpYWxpemUgaXQgZm9yIHRoZSBuZXh0IGF0dGVtcHQuXG5cdFx0XHQvLyBJdCBtaWdodCBiZSBhbHNvIGNhbGxlZCBpbiBpbml0U2Vzc2lvbiBidXQgdGhlIGVycm9yIGNhbiBiZSB0aHJvd24gZXZlbiBiZWZvcmUgdGhhdCAoZS5nLiBpZiB0aGUgZGIgaXMgZW1wdHkgZm9yIHNvbWUgcmVhc29uKSBzbyB3ZSByZXNldFxuXHRcdFx0Ly8gdGhlIHNlc3Npb24gaGVyZSBhcyB3ZWxsLCBvdGhlcndpc2Ugd2UgbWlnaHQgdHJ5IHRvIG9wZW4gdGhlIERCIHR3aWNlLlxuXHRcdFx0YXdhaXQgdGhpcy5yZXNldFNlc3Npb24oKVxuXHRcdFx0dGhyb3cgZVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgZ2V0U2Vzc2lvbklkKGNyZWRlbnRpYWxzOiBDcmVkZW50aWFscyk6IElkVHVwbGUge1xuXHRcdHJldHVybiBbdGhpcy5nZXRTZXNzaW9uTGlzdElkKGNyZWRlbnRpYWxzLmFjY2Vzc1Rva2VuKSwgdGhpcy5nZXRTZXNzaW9uRWxlbWVudElkKGNyZWRlbnRpYWxzLmFjY2Vzc1Rva2VuKV1cblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgYXN5bmNSZXN1bWVTZXNzaW9uKGNyZWRlbnRpYWxzOiBDcmVkZW50aWFscywgY2FjaGVJbmZvOiBDYWNoZUluZm8pOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRpZiAodGhpcy5hc3luY0xvZ2luU3RhdGUuc3RhdGUgPT09IFwicnVubmluZ1wiKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJmaW5pc2hMb2dpblJlc3VtZSBydW4gaW4gcGFyYWxsZWxcIilcblx0XHR9XG5cdFx0dGhpcy5hc3luY0xvZ2luU3RhdGUgPSB7IHN0YXRlOiBcInJ1bm5pbmdcIiB9XG5cdFx0dHJ5IHtcblx0XHRcdGF3YWl0IHRoaXMuZmluaXNoUmVzdW1lU2Vzc2lvbihjcmVkZW50aWFscywgbnVsbCwgY2FjaGVJbmZvKVxuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdGlmIChlIGluc3RhbmNlb2YgTm90QXV0aGVudGljYXRlZEVycm9yIHx8IGUgaW5zdGFuY2VvZiBTZXNzaW9uRXhwaXJlZEVycm9yKSB7XG5cdFx0XHRcdC8vIEZvciB0aGlzIHR5cGUgb2YgZXJyb3JzIHdlIGNhbm5vdCB1c2UgY3JlZGVudGlhbHMgYW55bW9yZS5cblx0XHRcdFx0dGhpcy5hc3luY0xvZ2luU3RhdGUgPSB7IHN0YXRlOiBcImlkbGVcIiB9XG5cdFx0XHRcdGF3YWl0IHRoaXMubG9naW5MaXN0ZW5lci5vbkxvZ2luRmFpbHVyZShMb2dpbkZhaWxSZWFzb24uU2Vzc2lvbkV4cGlyZWQpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLmFzeW5jTG9naW5TdGF0ZSA9IHsgc3RhdGU6IFwiZmFpbGVkXCIsIGNyZWRlbnRpYWxzLCBjYWNoZUluZm8gfVxuXHRcdFx0XHRpZiAoIShlIGluc3RhbmNlb2YgQ29ubmVjdGlvbkVycm9yKSkgYXdhaXQgdGhpcy5zZW5kRXJyb3IoZSlcblx0XHRcdFx0YXdhaXQgdGhpcy5sb2dpbkxpc3RlbmVyLm9uTG9naW5GYWlsdXJlKExvZ2luRmFpbFJlYXNvbi5FcnJvcilcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIGZpbmlzaFJlc3VtZVNlc3Npb24oXG5cdFx0Y3JlZGVudGlhbHM6IENyZWRlbnRpYWxzLFxuXHRcdGV4dGVybmFsVXNlcktleURlcml2ZXI6IEV4dGVybmFsVXNlcktleURlcml2ZXIgfCBudWxsLFxuXHRcdGNhY2hlSW5mbzogQ2FjaGVJbmZvLFxuXHQpOiBQcm9taXNlPFJlc3VtZVNlc3Npb25TdWNjZXNzPiB7XG5cdFx0Y29uc3Qgc2Vzc2lvbklkID0gdGhpcy5nZXRTZXNzaW9uSWQoY3JlZGVudGlhbHMpXG5cdFx0Y29uc3Qgc2Vzc2lvbkRhdGEgPSBhd2FpdCB0aGlzLmxvYWRTZXNzaW9uRGF0YShjcmVkZW50aWFscy5hY2Nlc3NUb2tlbilcblxuXHRcdGNvbnN0IGFjY2Vzc0tleSA9IGFzc2VydE5vdE51bGwoc2Vzc2lvbkRhdGEuYWNjZXNzS2V5LCBcIm5vIGFjY2VzcyBrZXkgb24gc2Vzc2lvbiBkYXRhIVwiKVxuXHRcdGNvbnN0IGlzRXh0ZXJuYWxVc2VyID0gZXh0ZXJuYWxVc2VyS2V5RGVyaXZlciAhPSBudWxsXG5cblx0XHRsZXQgdXNlclBhc3NwaHJhc2VLZXk6IEFlc0tleVxuXHRcdGxldCBjcmVkZW50aWFsc1dpdGhQYXNzcGhyYXNlS2V5OiBDcmVkZW50aWFsc1xuXG5cdFx0Ly8gUHJldmlvdXNseSBvbmx5IHRoZSBlbmNyeXB0ZWRQYXNzd29yZCB3YXMgc3RvcmVkLCBub3cgd2UgcHJlZmVyIHRvIHVzZSB0aGUga2V5IGlmIGl0J3MgYWxyZWFkeSB0aGVyZVxuXHRcdC8vIGFuZCBrZWVwIHBhc3NwaHJhc2UgZm9yIG1pZ3JhdGluZyBLREYgZm9yIG5vdy5cblx0XHRpZiAoY3JlZGVudGlhbHMuZW5jcnlwdGVkUGFzc3dvcmQpIHtcblx0XHRcdGNvbnN0IHBhc3NwaHJhc2UgPSB1dGY4VWludDhBcnJheVRvU3RyaW5nKGFlc0RlY3J5cHQoYWNjZXNzS2V5LCBiYXNlNjRUb1VpbnQ4QXJyYXkoY3JlZGVudGlhbHMuZW5jcnlwdGVkUGFzc3dvcmQpKSlcblx0XHRcdGlmIChpc0V4dGVybmFsVXNlcikge1xuXHRcdFx0XHRhd2FpdCB0aGlzLmNoZWNrT3V0ZGF0ZWRFeHRlcm5hbFNhbHQoY3JlZGVudGlhbHMsIHNlc3Npb25EYXRhLCBleHRlcm5hbFVzZXJLZXlEZXJpdmVyLnNhbHQpXG5cdFx0XHRcdHVzZXJQYXNzcGhyYXNlS2V5ID0gYXdhaXQgdGhpcy5kZXJpdmVVc2VyUGFzc3BocmFzZUtleSh7IC4uLmV4dGVybmFsVXNlcktleURlcml2ZXIsIHBhc3NwaHJhc2UgfSlcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IHBhc3NwaHJhc2VEYXRhID0gYXdhaXQgdGhpcy5sb2FkVXNlclBhc3NwaHJhc2VLZXkoY3JlZGVudGlhbHMubG9naW4sIHBhc3NwaHJhc2UpXG5cdFx0XHRcdHVzZXJQYXNzcGhyYXNlS2V5ID0gcGFzc3BocmFzZURhdGEudXNlclBhc3NwaHJhc2VLZXlcblx0XHRcdH1cblx0XHRcdGNvbnN0IGVuY3J5cHRlZFBhc3NwaHJhc2VLZXkgPSBlbmNyeXB0S2V5KGFjY2Vzc0tleSwgdXNlclBhc3NwaHJhc2VLZXkpXG5cdFx0XHRjcmVkZW50aWFsc1dpdGhQYXNzcGhyYXNlS2V5ID0geyAuLi5jcmVkZW50aWFscywgZW5jcnlwdGVkUGFzc3BocmFzZUtleSB9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBQcm9ncmFtbWluZ0Vycm9yKFwibm8ga2V5IG9yIHBhc3N3b3JkIHN0b3JlZCBpbiBjcmVkZW50aWFscyFcIilcblx0XHR9XG5cblx0XHRjb25zdCB7IHVzZXIsIHVzZXJHcm91cEluZm8gfSA9IGF3YWl0IHRoaXMuaW5pdFNlc3Npb24oc2Vzc2lvbkRhdGEudXNlcklkLCBjcmVkZW50aWFscy5hY2Nlc3NUb2tlbiwgdXNlclBhc3NwaHJhc2VLZXkpXG5cdFx0dGhpcy5sb2dpbkxpc3RlbmVyLm9uRnVsbExvZ2luU3VjY2VzcyhTZXNzaW9uVHlwZS5QZXJzaXN0ZW50LCBjYWNoZUluZm8sIGNyZWRlbnRpYWxzV2l0aFBhc3NwaHJhc2VLZXkpXG5cblx0XHR0aGlzLmFzeW5jTG9naW5TdGF0ZSA9IHsgc3RhdGU6IFwiaWRsZVwiIH1cblxuXHRcdGNvbnN0IGRhdGEgPSB7XG5cdFx0XHR1c2VyLFxuXHRcdFx0dXNlckdyb3VwSW5mbyxcblx0XHRcdHNlc3Npb25JZCxcblx0XHR9XG5cblx0XHQvLyBXZSBvbmx5IG5lZWQgdG8gbWlncmF0ZSB0aGUga2RmIGluIGNhc2UgYW4gaW50ZXJuYWwgdXNlciByZXN1bWVzIHRoZSBzZXNzaW9uLlxuXHRcdGNvbnN0IG1vZGVybktkZlR5cGUgPSB0aGlzLmlzTW9kZXJuS2RmVHlwZShhc0tkZlR5cGUodXNlci5rZGZWZXJzaW9uKSlcblx0XHRpZiAoIWlzRXh0ZXJuYWxVc2VyICYmIGNyZWRlbnRpYWxzLmVuY3J5cHRlZFBhc3N3b3JkICE9IG51bGwgJiYgIW1vZGVybktkZlR5cGUpIHtcblx0XHRcdGNvbnN0IHBhc3NwaHJhc2UgPSB1dGY4VWludDhBcnJheVRvU3RyaW5nKGFlc0RlY3J5cHQoYWNjZXNzS2V5LCBiYXNlNjRUb1VpbnQ4QXJyYXkoY3JlZGVudGlhbHMuZW5jcnlwdGVkUGFzc3dvcmQpKSlcblx0XHRcdGF3YWl0IHRoaXMubWlncmF0ZUtkZlR5cGUoS2RmVHlwZS5BcmdvbjJpZCwgcGFzc3BocmFzZSwgdXNlcilcblx0XHR9XG5cdFx0aWYgKCFpc0V4dGVybmFsVXNlciAmJiAhaXNBZG1pbkNsaWVudCgpKSB7XG5cdFx0XHQvLyBXZSB0cmlnZ2VyIGdyb3VwIGtleSByb3RhdGlvbiBvbmx5IGZvciBpbnRlcm5hbCB1c2Vycy5cblx0XHRcdC8vIElmIHdlIGhhdmUgbm90IG1pZ3JhdGVkIHRvIGFyZ29uMiB3ZSBwb3N0cG9uZSBrZXkgcm90YXRpb24gdW50aWwgbmV4dCBsb2dpblxuXHRcdFx0Ly8gaW5zdGVhZCBvZiByZWxvYWRpbmcgdGhlIHB3S2V5LCB3aGljaCB3b3VsZCBiZSB1cGRhdGVkIGJ5IHRoZSBLREYgbWlncmF0aW9uLlxuXHRcdFx0YXdhaXQgdGhpcy5rZXlSb3RhdGlvbkZhY2FkZS5pbml0aWFsaXplKHVzZXJQYXNzcGhyYXNlS2V5LCBtb2Rlcm5LZGZUeXBlKVxuXHRcdH1cblxuXHRcdHJldHVybiB7IHR5cGU6IFwic3VjY2Vzc1wiLCBkYXRhIH1cblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgaW5pdFNlc3Npb24oXG5cdFx0dXNlcklkOiBJZCxcblx0XHRhY2Nlc3NUb2tlbjogQmFzZTY0VXJsLFxuXHRcdHVzZXJQYXNzcGhyYXNlS2V5OiBBZXNLZXksXG5cdCk6IFByb21pc2U8eyB1c2VyOiBVc2VyOyBhY2Nlc3NUb2tlbjogc3RyaW5nOyB1c2VyR3JvdXBJbmZvOiBHcm91cEluZm8gfT4ge1xuXHRcdC8vIFdlIG1pZ2h0IGhhdmUgdXNlcklkIGFscmVhZHkgaWY6XG5cdFx0Ly8gLSBzZXNzaW9uIGhhcyBleHBpcmVkIGFuZCBhIG5ldyBvbmUgd2FzIGNyZWF0ZWRcblx0XHQvLyAtIGlmIGl0J3MgYSBwYXJ0aWFsIGxvZ2luXG5cdFx0Y29uc3QgdXNlcklkRnJvbUZvcm1lckxvZ2luID0gdGhpcy51c2VyRmFjYWRlLmdldFVzZXIoKT8uX2lkID8/IG51bGxcblxuXHRcdGlmICh1c2VySWRGcm9tRm9ybWVyTG9naW4gJiYgdXNlcklkICE9PSB1c2VySWRGcm9tRm9ybWVyTG9naW4pIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcImRpZmZlcmVudCB1c2VyIGlzIHRyaWVkIHRvIGxvZ2luIGluIGV4aXN0aW5nIG90aGVyIHVzZXIncyBzZXNzaW9uXCIpXG5cdFx0fVxuXG5cdFx0dGhpcy51c2VyRmFjYWRlLnNldEFjY2Vzc1Rva2VuKGFjY2Vzc1Rva2VuKVxuXG5cdFx0dHJ5IHtcblx0XHRcdC8vIFdlIG5lZWQgdG8gdXNlIHVwLXRvLWRhdGUgdXNlciB0byBtYWtlIHN1cmUgdGhhdCB3ZSBhcmUgbm90IGNoZWNraW5nIGZvciBvdXRkYXRlZCB2ZXJpZmllZCBhZ2FpbnN0IGNhY2hlZCB1c2VyLlxuXHRcdFx0Y29uc3QgdXNlciA9IGF3YWl0IHRoaXMubm9uY2FjaGluZ0VudGl0eUNsaWVudC5sb2FkKFVzZXJUeXBlUmVmLCB1c2VySWQpXG5cdFx0XHRhd2FpdCB0aGlzLmNoZWNrT3V0ZGF0ZWRWZXJpZmllcih1c2VyLCBhY2Nlc3NUb2tlbiwgdXNlclBhc3NwaHJhc2VLZXkpXG5cblx0XHRcdC8vIHRoaXMgbWF5IGJlIHRoZSBzZWNvbmQgdGltZSB3ZSBzZXQgdXNlciBpbiBjYXNlIHdlIGhhZCBhIHBhcnRpYWwgb2ZmbGluZSBsb2dpbiBiZWZvcmVcblx0XHRcdC8vIHdlIGRvIGl0IHVuY29uZGl0aW9uYWxseSBoZXJlLCB0byBtYWtlIHN1cmUgd2UgdW5sb2NrIHRoZSBsYXRlc3QgdXNlciBncm91cCBrZXkgcmlnaHQgYmVsb3dcblx0XHRcdHRoaXMudXNlckZhY2FkZS5zZXRVc2VyKHVzZXIpXG5cdFx0XHRjb25zdCB3YXNGdWxseUxvZ2dlZEluID0gdGhpcy51c2VyRmFjYWRlLmlzRnVsbHlMb2dnZWRJbigpXG5cblx0XHRcdHRoaXMudXNlckZhY2FkZS51bmxvY2tVc2VyR3JvdXBLZXkodXNlclBhc3NwaHJhc2VLZXkpXG5cdFx0XHRjb25zdCB1c2VyR3JvdXBJbmZvID0gYXdhaXQgdGhpcy5lbnRpdHlDbGllbnQubG9hZChHcm91cEluZm9UeXBlUmVmLCB1c2VyLnVzZXJHcm91cC5ncm91cEluZm8pXG5cblx0XHRcdGF3YWl0IHRoaXMubG9hZEVudHJvcHkoKVxuXG5cdFx0XHQvLyBJZiB3ZSBoYXZlIGJlZW4gZnVsbHkgbG9nZ2VkIGluIGF0IGxlYXN0IG9uY2UgYWxyZWFkeSAocHJvYmFibHkgZXhwaXJlZCBlcGhlbWVyYWwgc2Vzc2lvbilcblx0XHRcdC8vIHRoZW4gd2UganVzdCByZWNvbm5lY3QgYW5kIHJlLWRvd25sb2FkIG1pc3NpbmcgZXZlbnRzLlxuXHRcdFx0Ly8gRm9yIG5ldyBjb25uZWN0aW9ucyB3ZSBoYXZlIHNwZWNpYWwgaGFuZGxpbmcuXG5cdFx0XHRpZiAod2FzRnVsbHlMb2dnZWRJbikge1xuXHRcdFx0XHR0aGlzLmV2ZW50QnVzQ2xpZW50LmNvbm5lY3QoQ29ubmVjdE1vZGUuUmVjb25uZWN0KVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5ldmVudEJ1c0NsaWVudC5jb25uZWN0KENvbm5lY3RNb2RlLkluaXRpYWwpXG5cdFx0XHR9XG5cblx0XHRcdGF3YWl0IHRoaXMuZW50cm9weUZhY2FkZS5zdG9yZUVudHJvcHkoKVxuXHRcdFx0cmV0dXJuIHsgdXNlciwgYWNjZXNzVG9rZW4sIHVzZXJHcm91cEluZm8gfVxuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdHRoaXMucmVzZXRTZXNzaW9uKClcblx0XHRcdHRocm93IGVcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogaW5pdCBhbiBhcHByb3ByaWF0ZSBjYWNoZSBpbXBsZW1lbnRhdGlvbi4gd2Ugd2lsbCBhbHdheXMgdHJ5IHRvIGNyZWF0ZSBhIHBlcnNpc3RlbnQgY2FjaGUgZm9yIHBlcnNpc3RlbnQgc2Vzc2lvbnMgYW5kIGZhbGwgYmFjayB0byBhbiBlcGhlbWVyYWwgY2FjaGVcblx0ICogaW4gdGhlIGJyb3dzZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSB1c2VySWQgdGhlIHVzZXIgZm9yIHdoaWNoIHRoZSBjYWNoZSBpcyBjcmVhdGVkXG5cdCAqIEBwYXJhbSBkYXRhYmFzZUtleSB0aGUga2V5IHRvIHVzZVxuXHQgKiBAcGFyYW0gdGltZVJhbmdlRGF5cyBob3cgZmFyIGludG8gdGhlIHBhc3QgdGhlIGNhY2hlIGtlZXBzIGRhdGEgYXJvdW5kXG5cdCAqIEBwYXJhbSBmb3JjZU5ld0RhdGFiYXNlIHRydWUgaWYgdGhlIG9sZCBkYXRhYmFzZSBzaG91bGQgYmUgZGVsZXRlZCBpZiB0aGVyZSBpcyBvbmVcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHByaXZhdGUgYXN5bmMgaW5pdENhY2hlKHsgdXNlcklkLCBkYXRhYmFzZUtleSwgdGltZVJhbmdlRGF5cywgZm9yY2VOZXdEYXRhYmFzZSB9OiBJbml0Q2FjaGVPcHRpb25zKTogUHJvbWlzZTxDYWNoZUluZm8+IHtcblx0XHRpZiAoZGF0YWJhc2VLZXkgIT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0ZGF0YWJhc2VLZXksXG5cdFx0XHRcdC4uLihhd2FpdCB0aGlzLmNhY2hlSW5pdGlhbGl6ZXIuaW5pdGlhbGl6ZSh7XG5cdFx0XHRcdFx0dHlwZTogXCJvZmZsaW5lXCIsXG5cdFx0XHRcdFx0dXNlcklkLFxuXHRcdFx0XHRcdGRhdGFiYXNlS2V5LFxuXHRcdFx0XHRcdHRpbWVSYW5nZURheXMsXG5cdFx0XHRcdFx0Zm9yY2VOZXdEYXRhYmFzZSxcblx0XHRcdFx0fSkpLFxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4geyBkYXRhYmFzZUtleTogbnVsbCwgLi4uKGF3YWl0IHRoaXMuY2FjaGVJbml0aWFsaXplci5pbml0aWFsaXplKHsgdHlwZTogXCJlcGhlbWVyYWxcIiwgdXNlcklkIH0pKSB9XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBkZUluaXRDYWNoZSgpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRyZXR1cm4gdGhpcy5jYWNoZUluaXRpYWxpemVyLmRlSW5pdGlhbGl6ZSgpXG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2sgd2hldGhlciB0aGUgcGFzc2VkIHNhbHQgZm9yIGV4dGVybmFsIHVzZXIgaXMgdXAtdG8tZGF0ZSAod2hldGhlciBhbiBvdXRkYXRlZCBsaW5rIHdhcyB1c2VkKS5cblx0ICovXG5cdHByaXZhdGUgYXN5bmMgY2hlY2tPdXRkYXRlZEV4dGVybmFsU2FsdChcblx0XHRjcmVkZW50aWFsczogQ3JlZGVudGlhbHMsXG5cdFx0c2Vzc2lvbkRhdGE6IHtcblx0XHRcdHVzZXJJZDogSWRcblx0XHRcdGFjY2Vzc0tleTogQWVzS2V5IHwgbnVsbFxuXHRcdH0sXG5cdFx0ZXh0ZXJuYWxVc2VyU2FsdDogVWludDhBcnJheSxcblx0KSB7XG5cdFx0dGhpcy51c2VyRmFjYWRlLnNldEFjY2Vzc1Rva2VuKGNyZWRlbnRpYWxzLmFjY2Vzc1Rva2VuKVxuXHRcdGNvbnN0IHVzZXIgPSBhd2FpdCB0aGlzLmVudGl0eUNsaWVudC5sb2FkKFVzZXJUeXBlUmVmLCBzZXNzaW9uRGF0YS51c2VySWQpXG5cdFx0Y29uc3QgbGF0ZXN0U2FsdEhhc2ggPSBhc3NlcnROb3ROdWxsKHVzZXIuZXh0ZXJuYWxBdXRoSW5mbyEubGF0ZXN0U2FsdEhhc2gsIFwibGF0ZXN0U2FsdEhhc2ggaXMgbm90IHNldCFcIilcblx0XHRpZiAoIWFycmF5RXF1YWxzKGxhdGVzdFNhbHRIYXNoLCBzaGEyNTZIYXNoKGV4dGVybmFsVXNlclNhbHQpKSkge1xuXHRcdFx0Ly8gRG8gbm90IGRlbGV0ZSBzZXNzaW9uIG9yIGNyZWRlbnRpYWxzLCB3ZSBjYW4gc3RpbGwgdXNlIHRoZW0gaWYgdGhlIHBhc3N3b3JkXG5cdFx0XHQvLyBoYXNuJ3QgYmVlbiBjaGFuZ2VkLlxuXHRcdFx0dGhpcy5yZXNldFNlc3Npb24oKVxuXHRcdFx0dGhyb3cgbmV3IEFjY2Vzc0V4cGlyZWRFcnJvcihcIlNhbHQgY2hhbmdlZCwgb3V0ZGF0ZWQgbGluaz9cIilcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2sgdGhhdCB0aGUgYXV0aCB2ZXJpZmllciBpcyBub3QgY2hhbmdlZCBlLmcuIGR1ZSB0byB0aGUgcGFzc3dvcmQgY2hhbmdlLlxuXHQgKiBOb3JtYWxseSB0aGlzIHdvbid0IGhhcHBlbiBmb3IgaW50ZXJuYWwgdXNlcnMgYXMgYWxsIHNlc3Npb25zIGFyZSBjbG9zZWQgb24gcGFzc3dvcmQgY2hhbmdlLiBUaGlzIG1heSBoYXBwZW4gZm9yIGV4dGVybmFsIHVzZXJzIHdoZW4gdGhlIHNlbmRlciBoYXNcblx0ICogY2hhbmdlZCB0aGUgcGFzc3dvcmQuXG5cdCAqIFdlIGRvIG5vdCBkZWxldGUgYWxsIHNlc3Npb25zIG9uIHRoZSBzZXJ2ZXIgd2hlbiBjaGFuZ2luZyB0aGUgZXh0ZXJuYWwgcGFzc3dvcmQgdG8gYXZvaWQgdGhhdCBhbiBleHRlcm5hbCB1c2VyIGlzIGltbWVkaWF0ZWx5IGxvZ2dlZCBvdXQuXG5cdCAqXG5cdCAqIEBwYXJhbSB1c2VyIFNob3VsZCBiZSB1cC10by1kYXRlLCBpLmUuLCBub3QgbG9hZGVkIGZyb20gY2FjaGUsIGJ1dCBmcmVzaCBmcm9tIHRoZSBzZXJ2ZXIsIG90aGVyd2lzZSBhbiBvdXRkYXRlZCB2ZXJpZmllciB3aWxsIGNhdXNlIGEgbG9nb3V0LlxuXHQgKi9cblx0cHJpdmF0ZSBhc3luYyBjaGVja091dGRhdGVkVmVyaWZpZXIodXNlcjogVXNlciwgYWNjZXNzVG9rZW46IHN0cmluZywgdXNlclBhc3NwaHJhc2VLZXk6IEFlczEyOEtleSkge1xuXHRcdGlmICh1aW50OEFycmF5VG9CYXNlNjQodXNlci52ZXJpZmllcikgIT09IHVpbnQ4QXJyYXlUb0Jhc2U2NChzaGEyNTZIYXNoKGNyZWF0ZUF1dGhWZXJpZmllcih1c2VyUGFzc3BocmFzZUtleSkpKSkge1xuXHRcdFx0Y29uc29sZS5sb2coXCJBdXRoIHZlcmlmaWVyIGhhcyBjaGFuZ2VkXCIpXG5cdFx0XHQvLyBkZWxldGUgdGhlIG9ic29sZXRlIHNlc3Npb24gdG8gbWFrZSBzdXJlIGl0IGNhbiBub3QgYmUgdXNlZCBhbnkgbW9yZVxuXHRcdFx0YXdhaXQgdGhpcy5kZWxldGVTZXNzaW9uKGFjY2Vzc1Rva2VuKS5jYXRjaCgoZSkgPT4gY29uc29sZS5lcnJvcihcIkNvdWxkIG5vdCBkZWxldGUgc2Vzc2lvblwiLCBlKSlcblx0XHRcdGF3YWl0IHRoaXMucmVzZXRTZXNzaW9uKClcblx0XHRcdHRocm93IG5ldyBOb3RBdXRoZW50aWNhdGVkRXJyb3IoXCJBdXRoIHZlcmlmaWVyIGhhcyBjaGFuZ2VkXCIpXG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBsb2FkVXNlclBhc3NwaHJhc2VLZXkoXG5cdFx0bWFpbEFkZHJlc3M6IHN0cmluZyxcblx0XHRwYXNzcGhyYXNlOiBzdHJpbmcsXG5cdCk6IFByb21pc2U8e1xuXHRcdGtkZlR5cGU6IEtkZlR5cGVcblx0XHR1c2VyUGFzc3BocmFzZUtleTogQWVzS2V5XG5cdH0+IHtcblx0XHRtYWlsQWRkcmVzcyA9IG1haWxBZGRyZXNzLnRvTG93ZXJDYXNlKCkudHJpbSgpXG5cdFx0Y29uc3Qgc2FsdFJlcXVlc3QgPSBjcmVhdGVTYWx0RGF0YSh7IG1haWxBZGRyZXNzIH0pXG5cdFx0Y29uc3Qgc2FsdFJldHVybiA9IGF3YWl0IHRoaXMuc2VydmljZUV4ZWN1dG9yLmdldChTYWx0U2VydmljZSwgc2FsdFJlcXVlc3QpXG5cdFx0Y29uc3Qga2RmVHlwZSA9IGFzS2RmVHlwZShzYWx0UmV0dXJuLmtkZlZlcnNpb24pXG5cdFx0cmV0dXJuIHtcblx0XHRcdHVzZXJQYXNzcGhyYXNlS2V5OiBhd2FpdCB0aGlzLmRlcml2ZVVzZXJQYXNzcGhyYXNlS2V5KHsga2RmVHlwZSwgcGFzc3BocmFzZSwgc2FsdDogc2FsdFJldHVybi5zYWx0IH0pLFxuXHRcdFx0a2RmVHlwZSxcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogV2UgdXNlIHRoZSBhY2Nlc3NUb2tlbiB0aGF0IHNob3VsZCBiZSBkZWxldGVkIGZvciBhdXRoZW50aWNhdGlvbi4gVGhlcmVmb3JlIGl0IGNhbiBiZSBpbnZva2VkIHdoaWxlIGxvZ2dlZCBpbiBvciBsb2dnZWQgb3V0LlxuXHQgKlxuXHQgKiBAcGFyYW0gcHVzaElkZW50aWZpZXIgaWRlbnRpZmllciBhc3NvY2lhdGVkIHdpdGggdGhpcyBkZXZpY2UsIGlmIGFueSwgdG8gZGVsZXRlIFB1c2hJZGVudGlmaWVyIG9uIHRoZSBzZXJ2ZXJcblx0ICovXG5cdGFzeW5jIGRlbGV0ZVNlc3Npb24oYWNjZXNzVG9rZW46IEJhc2U2NFVybCwgcHVzaElkZW50aWZpZXI6IHN0cmluZyB8IG51bGwgPSBudWxsKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0bGV0IHBhdGggPSB0eXBlUmVmVG9QYXRoKFNlc3Npb25UeXBlUmVmKSArIFwiL1wiICsgdGhpcy5nZXRTZXNzaW9uTGlzdElkKGFjY2Vzc1Rva2VuKSArIFwiL1wiICsgdGhpcy5nZXRTZXNzaW9uRWxlbWVudElkKGFjY2Vzc1Rva2VuKVxuXHRcdGNvbnN0IHNlc3Npb25UeXBlTW9kZWwgPSBhd2FpdCByZXNvbHZlVHlwZVJlZmVyZW5jZShTZXNzaW9uVHlwZVJlZilcblxuXHRcdGNvbnN0IGhlYWRlcnMgPSB7XG5cdFx0XHRhY2Nlc3NUb2tlbjogbmV2ZXJOdWxsKGFjY2Vzc1Rva2VuKSxcblx0XHRcdHY6IHNlc3Npb25UeXBlTW9kZWwudmVyc2lvbixcblx0XHR9XG5cdFx0Y29uc3QgcXVlcnlQYXJhbXM6IERpY3QgPSBwdXNoSWRlbnRpZmllciA9PSBudWxsID8ge30gOiB7IHB1c2hJZGVudGlmaWVyIH1cblx0XHRyZXR1cm4gdGhpcy5yZXN0Q2xpZW50XG5cdFx0XHQucmVxdWVzdChwYXRoLCBIdHRwTWV0aG9kLkRFTEVURSwge1xuXHRcdFx0XHRoZWFkZXJzLFxuXHRcdFx0XHRyZXNwb25zZVR5cGU6IE1lZGlhVHlwZS5Kc29uLFxuXHRcdFx0XHRxdWVyeVBhcmFtcyxcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goXG5cdFx0XHRcdG9mQ2xhc3MoTm90QXV0aGVudGljYXRlZEVycm9yLCAoKSA9PiB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coXCJhdXRoZW50aWNhdGlvbiBmYWlsZWQgPT4gc2Vzc2lvbiBpcyBhbHJlYWR5IGNsb3NlZFwiKVxuXHRcdFx0XHR9KSxcblx0XHRcdClcblx0XHRcdC5jYXRjaChcblx0XHRcdFx0b2ZDbGFzcyhOb3RGb3VuZEVycm9yLCAoKSA9PiB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coXCJhdXRoZW50aWNhdGlvbiBmYWlsZWQgPT4gc2Vzc2lvbiBpbnN0YW5jZSBpcyBhbHJlYWR5IGRlbGV0ZWRcIilcblx0XHRcdFx0fSksXG5cdFx0XHQpXG5cdH1cblxuXHRwcml2YXRlIGdldFNlc3Npb25FbGVtZW50SWQoYWNjZXNzVG9rZW46IEJhc2U2NFVybCk6IElkIHtcblx0XHRsZXQgYnl0ZUFjY2Vzc1Rva2VuID0gYmFzZTY0VG9VaW50OEFycmF5KGJhc2U2NFVybFRvQmFzZTY0KG5ldmVyTnVsbChhY2Nlc3NUb2tlbikpKVxuXHRcdHJldHVybiBiYXNlNjRUb0Jhc2U2NFVybCh1aW50OEFycmF5VG9CYXNlNjQoc2hhMjU2SGFzaChieXRlQWNjZXNzVG9rZW4uc2xpY2UoR0VORVJBVEVEX0lEX0JZVEVTX0xFTkdUSCkpKSlcblx0fVxuXG5cdHByaXZhdGUgZ2V0U2Vzc2lvbkxpc3RJZChhY2Nlc3NUb2tlbjogQmFzZTY0VXJsKTogSWQge1xuXHRcdGxldCBieXRlQWNjZXNzVG9rZW4gPSBiYXNlNjRUb1VpbnQ4QXJyYXkoYmFzZTY0VXJsVG9CYXNlNjQobmV2ZXJOdWxsKGFjY2Vzc1Rva2VuKSkpXG5cdFx0cmV0dXJuIGJhc2U2NFRvQmFzZTY0RXh0KHVpbnQ4QXJyYXlUb0Jhc2U2NChieXRlQWNjZXNzVG9rZW4uc2xpY2UoMCwgR0VORVJBVEVEX0lEX0JZVEVTX0xFTkdUSCkpKVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBsb2FkU2Vzc2lvbkRhdGEoYWNjZXNzVG9rZW46IEJhc2U2NFVybCk6IFByb21pc2U8e1xuXHRcdHVzZXJJZDogSWRcblx0XHRhY2Nlc3NLZXk6IEFlc0tleSB8IG51bGxcblx0fT4ge1xuXHRcdGNvbnN0IHBhdGggPSB0eXBlUmVmVG9QYXRoKFNlc3Npb25UeXBlUmVmKSArIFwiL1wiICsgdGhpcy5nZXRTZXNzaW9uTGlzdElkKGFjY2Vzc1Rva2VuKSArIFwiL1wiICsgdGhpcy5nZXRTZXNzaW9uRWxlbWVudElkKGFjY2Vzc1Rva2VuKVxuXHRcdGNvbnN0IFNlc3Npb25UeXBlTW9kZWwgPSBhd2FpdCByZXNvbHZlVHlwZVJlZmVyZW5jZShTZXNzaW9uVHlwZVJlZilcblxuXHRcdGxldCBoZWFkZXJzID0ge1xuXHRcdFx0YWNjZXNzVG9rZW46IGFjY2Vzc1Rva2VuLFxuXHRcdFx0djogU2Vzc2lvblR5cGVNb2RlbC52ZXJzaW9uLFxuXHRcdH1cblx0XHQvLyB3ZSBjYW5ub3QgdXNlIHRoZSBlbnRpdHkgY2xpZW50IHlldCBiZWNhdXNlIHRoaXMgdHlwZSBpcyBlbmNyeXB0ZWQgYW5kIHdlIGRvbid0IGhhdmUgYW4gb3duZXIga2V5IHlldFxuXHRcdHJldHVybiB0aGlzLnJlc3RDbGllbnRcblx0XHRcdC5yZXF1ZXN0KHBhdGgsIEh0dHBNZXRob2QuR0VULCB7XG5cdFx0XHRcdGhlYWRlcnMsXG5cdFx0XHRcdHJlc3BvbnNlVHlwZTogTWVkaWFUeXBlLkpzb24sXG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oKGluc3RhbmNlKSA9PiB7XG5cdFx0XHRcdGxldCBzZXNzaW9uID0gSlNPTi5wYXJzZShpbnN0YW5jZSlcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHR1c2VySWQ6IHNlc3Npb24udXNlcixcblx0XHRcdFx0XHRhY2Nlc3NLZXk6IHNlc3Npb24uYWNjZXNzS2V5ID8gYmFzZTY0VG9LZXkoc2Vzc2lvbi5hY2Nlc3NLZXkpIDogbnVsbCxcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0fVxuXG5cdC8qKlxuXHQgKiBMb2FkcyBlbnRyb3B5IGZyb20gdGhlIGxhc3QgbG9nb3V0LlxuXHQgKi9cblx0cHJpdmF0ZSBhc3luYyBsb2FkRW50cm9weSgpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCB0dXRhbm90YVByb3BlcnRpZXMgPSBhd2FpdCB0aGlzLmVudGl0eUNsaWVudC5sb2FkUm9vdChUdXRhbm90YVByb3BlcnRpZXNUeXBlUmVmLCB0aGlzLnVzZXJGYWNhZGUuZ2V0VXNlckdyb3VwSWQoKSlcblx0XHRyZXR1cm4gdGhpcy5lbnRyb3B5RmFjYWRlLmxvYWRFbnRyb3B5KHR1dGFub3RhUHJvcGVydGllcylcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGFuZ2UgcGFzc3dvcmQgYW5kL29yIEtERiB0eXBlIGZvciB0aGUgY3VycmVudCB1c2VyLiBUaGlzIHdpbGwgY2F1c2UgYWxsIG90aGVyIHNlc3Npb25zIHRvIGJlIGNsb3NlZC5cblx0ICogQHJldHVybiBOZXcgcGFzc3dvcmQgZW5jcnlwdGVkIHdpdGggYWNjZXNzS2V5IGlmIHRoaXMgaXMgYSBwZXJzaXN0ZW50IHNlc3Npb24gb3Ige0Bjb2RlIG51bGx9ICBpZiBpdCdzIGFuIGVwaGVtZXJhbCBvbmUuXG5cdCAqL1xuXHRhc3luYyBjaGFuZ2VQYXNzd29yZChcblx0XHRjdXJyZW50UGFzc3dvcmRLZXlEYXRhOiBQYXNzcGhyYXNlS2V5RGF0YSxcblx0XHRuZXdQYXNzd29yZEtleURhdGFUZW1wbGF0ZTogT21pdDxQYXNzcGhyYXNlS2V5RGF0YSwgXCJzYWx0XCI+LFxuXHQpOiBQcm9taXNlPHtcblx0XHRuZXdFbmNyeXB0ZWRQYXNzcGhyYXNlOiBCYXNlNjRcblx0XHRuZXdFbmNyeXB0ZWRQYXNzcGhyYXNlS2V5OiBVaW50OEFycmF5XG5cdH0gfCBudWxsPiB7XG5cdFx0Y29uc3QgY3VycmVudFVzZXJQYXNzcGhyYXNlS2V5ID0gYXdhaXQgdGhpcy5kZXJpdmVVc2VyUGFzc3BocmFzZUtleShjdXJyZW50UGFzc3dvcmRLZXlEYXRhKVxuXHRcdGNvbnN0IGN1cnJlbnRBdXRoVmVyaWZpZXIgPSBjcmVhdGVBdXRoVmVyaWZpZXIoY3VycmVudFVzZXJQYXNzcGhyYXNlS2V5KVxuXHRcdGNvbnN0IG5ld1Bhc3N3b3JkS2V5RGF0YSA9IHsgLi4ubmV3UGFzc3dvcmRLZXlEYXRhVGVtcGxhdGUsIHNhbHQ6IGdlbmVyYXRlUmFuZG9tU2FsdCgpIH1cblxuXHRcdGNvbnN0IG5ld1VzZXJQYXNzcGhyYXNlS2V5ID0gYXdhaXQgdGhpcy5kZXJpdmVVc2VyUGFzc3BocmFzZUtleShuZXdQYXNzd29yZEtleURhdGEpXG5cdFx0Y29uc3QgY3VycmVudFVzZXJHcm91cEtleSA9IHRoaXMudXNlckZhY2FkZS5nZXRDdXJyZW50VXNlckdyb3VwS2V5KClcblx0XHRjb25zdCBwd0VuY1VzZXJHcm91cEtleSA9IGVuY3J5cHRLZXkobmV3VXNlclBhc3NwaHJhc2VLZXksIGN1cnJlbnRVc2VyR3JvdXBLZXkub2JqZWN0KVxuXHRcdGNvbnN0IGF1dGhWZXJpZmllciA9IGNyZWF0ZUF1dGhWZXJpZmllcihuZXdVc2VyUGFzc3BocmFzZUtleSlcblx0XHRjb25zdCBzZXJ2aWNlID0gY3JlYXRlQ2hhbmdlUGFzc3dvcmRQb3N0SW4oe1xuXHRcdFx0Y29kZTogbnVsbCxcblx0XHRcdGtkZlZlcnNpb246IG5ld1Bhc3N3b3JkS2V5RGF0YVRlbXBsYXRlLmtkZlR5cGUsXG5cdFx0XHRvbGRWZXJpZmllcjogY3VycmVudEF1dGhWZXJpZmllcixcblx0XHRcdHB3RW5jVXNlckdyb3VwS2V5OiBwd0VuY1VzZXJHcm91cEtleSxcblx0XHRcdHJlY292ZXJDb2RlVmVyaWZpZXI6IG51bGwsXG5cdFx0XHRzYWx0OiBuZXdQYXNzd29yZEtleURhdGEuc2FsdCxcblx0XHRcdHZlcmlmaWVyOiBhdXRoVmVyaWZpZXIsXG5cdFx0XHR1c2VyR3JvdXBLZXlWZXJzaW9uOiBTdHJpbmcoY3VycmVudFVzZXJHcm91cEtleS52ZXJzaW9uKSxcblx0XHR9KVxuXG5cdFx0YXdhaXQgdGhpcy5zZXJ2aWNlRXhlY3V0b3IucG9zdChDaGFuZ2VQYXNzd29yZFNlcnZpY2UsIHNlcnZpY2UpXG5cblx0XHR0aGlzLnVzZXJGYWNhZGUuc2V0VXNlckRpc3RLZXkoY3VycmVudFVzZXJHcm91cEtleS52ZXJzaW9uLCBuZXdVc2VyUGFzc3BocmFzZUtleSlcblx0XHRjb25zdCBhY2Nlc3NUb2tlbiA9IGFzc2VydE5vdE51bGwodGhpcy51c2VyRmFjYWRlLmdldEFjY2Vzc1Rva2VuKCkpXG5cdFx0Y29uc3Qgc2Vzc2lvbkRhdGEgPSBhd2FpdCB0aGlzLmxvYWRTZXNzaW9uRGF0YShhY2Nlc3NUb2tlbilcblx0XHRpZiAoc2Vzc2lvbkRhdGEuYWNjZXNzS2V5ICE9IG51bGwpIHtcblx0XHRcdC8vIGlmIHdlIGhhdmUgYW4gYWNjZXNzS2V5LCB0aGlzIG1lYW5zIHdlIGFyZSBzdG9yaW5nIHRoZSBlbmNyeXB0ZWQgcGFzc3dvcmQgbG9jYWxseSwgaW4gd2hpY2ggY2FzZSB3ZSBuZWVkIHRvIHN0b3JlIHRoZSBuZXcgb25lXG5cdFx0XHRjb25zdCBuZXdFbmNyeXB0ZWRQYXNzcGhyYXNlID0gdWludDhBcnJheVRvQmFzZTY0KGVuY3J5cHRTdHJpbmcoc2Vzc2lvbkRhdGEuYWNjZXNzS2V5LCBuZXdQYXNzd29yZEtleURhdGFUZW1wbGF0ZS5wYXNzcGhyYXNlKSlcblx0XHRcdGNvbnN0IG5ld0VuY3J5cHRlZFBhc3NwaHJhc2VLZXkgPSBlbmNyeXB0S2V5KHNlc3Npb25EYXRhLmFjY2Vzc0tleSwgbmV3VXNlclBhc3NwaHJhc2VLZXkpXG5cdFx0XHRyZXR1cm4geyBuZXdFbmNyeXB0ZWRQYXNzcGhyYXNlLCBuZXdFbmNyeXB0ZWRQYXNzcGhyYXNlS2V5IH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIG51bGxcblx0XHR9XG5cdH1cblxuXHRhc3luYyBkZWxldGVBY2NvdW50KHBhc3N3b3JkOiBzdHJpbmcsIHRha2VvdmVyOiBzdHJpbmcsIHN1cnZleURhdGE6IFN1cnZleURhdGEgfCBudWxsID0gbnVsbCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IHVzZXJTYWx0ID0gYXNzZXJ0Tm90TnVsbCh0aGlzLnVzZXJGYWNhZGUuZ2V0TG9nZ2VkSW5Vc2VyKCkuc2FsdClcblxuXHRcdGNvbnN0IHBhc3NwaHJhc2VLZXlEYXRhID0ge1xuXHRcdFx0a2RmVHlwZTogYXNLZGZUeXBlKHRoaXMudXNlckZhY2FkZS5nZXRMb2dnZWRJblVzZXIoKS5rZGZWZXJzaW9uKSxcblx0XHRcdHBhc3NwaHJhc2U6IHBhc3N3b3JkLFxuXHRcdFx0c2FsdDogdXNlclNhbHQsXG5cdFx0fVxuXHRcdGNvbnN0IHBhc3N3b3JkS2V5ID0gYXdhaXQgdGhpcy5kZXJpdmVVc2VyUGFzc3BocmFzZUtleShwYXNzcGhyYXNlS2V5RGF0YSlcblx0XHRjb25zdCBkZWxldGVDdXN0b21lckRhdGEgPSBjcmVhdGVEZWxldGVDdXN0b21lckRhdGEoe1xuXHRcdFx0YXV0aFZlcmlmaWVyOiBjcmVhdGVBdXRoVmVyaWZpZXIocGFzc3dvcmRLZXkpLFxuXHRcdFx0cmVhc29uOiBudWxsLFxuXHRcdFx0dGFrZW92ZXJNYWlsQWRkcmVzczogbnVsbCxcblx0XHRcdHVuZGVsZXRlOiBmYWxzZSxcblx0XHRcdGN1c3RvbWVyOiBuZXZlck51bGwobmV2ZXJOdWxsKHRoaXMudXNlckZhY2FkZS5nZXRMb2dnZWRJblVzZXIoKSkuY3VzdG9tZXIpLFxuXHRcdFx0c3VydmV5RGF0YTogc3VydmV5RGF0YSxcblx0XHR9KVxuXG5cdFx0aWYgKHRha2VvdmVyICE9PSBcIlwiKSB7XG5cdFx0XHRkZWxldGVDdXN0b21lckRhdGEudGFrZW92ZXJNYWlsQWRkcmVzcyA9IHRha2VvdmVyXG5cdFx0fSBlbHNlIHtcblx0XHRcdGRlbGV0ZUN1c3RvbWVyRGF0YS50YWtlb3Zlck1haWxBZGRyZXNzID0gbnVsbFxuXHRcdH1cblx0XHRhd2FpdCB0aGlzLnNlcnZpY2VFeGVjdXRvci5kZWxldGUoQ3VzdG9tZXJTZXJ2aWNlLCBkZWxldGVDdXN0b21lckRhdGEpXG5cdH1cblxuXHQvKiogQ2hhbmdlcyB1c2VyIHBhc3N3b3JkIHRvIGFub3RoZXIgb25lIHVzaW5nIHJlY292ZXJDb2RlIGluc3RlYWQgb2YgdGhlIG9sZCBwYXNzd29yZC4gKi9cblx0YXN5bmMgcmVjb3ZlckxvZ2luKG1haWxBZGRyZXNzOiBzdHJpbmcsIHJlY292ZXJDb2RlOiBzdHJpbmcsIG5ld1Bhc3N3b3JkOiBzdHJpbmcsIGNsaWVudElkZW50aWZpZXI6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IHJlY292ZXJDb2RlS2V5ID0gdWludDhBcnJheVRvQml0QXJyYXkoaGV4VG9VaW50OEFycmF5KHJlY292ZXJDb2RlKSlcblx0XHRjb25zdCByZWNvdmVyQ29kZVZlcmlmaWVyID0gY3JlYXRlQXV0aFZlcmlmaWVyKHJlY292ZXJDb2RlS2V5KVxuXHRcdGNvbnN0IHJlY292ZXJDb2RlVmVyaWZpZXJCYXNlNjQgPSBiYXNlNjRUb0Jhc2U2NFVybCh1aW50OEFycmF5VG9CYXNlNjQocmVjb3ZlckNvZGVWZXJpZmllcikpXG5cdFx0Y29uc3Qgc2Vzc2lvbkRhdGEgPSBjcmVhdGVDcmVhdGVTZXNzaW9uRGF0YSh7XG5cdFx0XHRhY2Nlc3NLZXk6IG51bGwsXG5cdFx0XHRhdXRoVG9rZW46IG51bGwsXG5cdFx0XHRhdXRoVmVyaWZpZXI6IG51bGwsXG5cdFx0XHRjbGllbnRJZGVudGlmaWVyOiBjbGllbnRJZGVudGlmaWVyLFxuXHRcdFx0bWFpbEFkZHJlc3M6IG1haWxBZGRyZXNzLnRvTG93ZXJDYXNlKCkudHJpbSgpLFxuXHRcdFx0cmVjb3ZlckNvZGVWZXJpZmllcjogcmVjb3ZlckNvZGVWZXJpZmllckJhc2U2NCxcblx0XHRcdHVzZXI6IG51bGwsXG5cdFx0fSlcblx0XHQvLyB3ZSBuZWVkIGEgc2VwYXJhdGUgZW50aXR5IHJlc3QgY2xpZW50IGJlY2F1c2UgdG8gYXZvaWQgY2FjaGluZyBvZiB0aGUgdXNlciBpbnN0YW5jZSB3aGljaCBpcyB1cGRhdGVkIG9uIHBhc3N3b3JkIGNoYW5nZS4gdGhlIHdlYiBzb2NrZXQgaXMgbm90IGNvbm5lY3RlZCBiZWNhdXNlIHdlXG5cdFx0Ly8gZG9uJ3QgZG8gYSBub3JtYWwgbG9naW4sIGFuZCB0aGVyZWZvcmUgd2Ugd291bGQgbm90IGdldCBhbnkgdXNlciB1cGRhdGUgZXZlbnRzLiB3ZSBjYW4gbm90IHVzZSBwZXJtYW5lbnRMb2dpbj1mYWxzZSB3aXRoIGluaXRTZXNzaW9uIGJlY2F1c2UgY2FjaGluZyB3b3VsZCBiZSBlbmFibGVkLFxuXHRcdC8vIGFuZCB0aGVyZWZvcmUgd2Ugd291bGQgbm90IGJlIGFibGUgdG8gcmVhZCB0aGUgdXBkYXRlZCB1c2VyXG5cdFx0Ly8gYWRkaXRpb25hbGx5IHdlIGRvIG5vdCB3YW50IHRvIHVzZSBpbml0U2Vzc2lvbigpIHRvIGtlZXAgdGhlIExvZ2luRmFjYWRlIHN0YXRlbGVzcyAoZXhjZXB0IHNlY29uZCBmYWN0b3IgaGFuZGxpbmcpIGJlY2F1c2Ugd2UgZG8gbm90IHdhbnQgdG8gaGF2ZSBhbnkgcmFjZSBjb25kaXRpb25zXG5cdFx0Ly8gd2hlbiBsb2dnaW5nIGluIG5vcm1hbGx5IGFmdGVyIHJlc2V0dGluZyB0aGUgcGFzc3dvcmRcblx0XHRjb25zdCB0ZW1wQXV0aERhdGFQcm92aWRlcjogQXV0aERhdGFQcm92aWRlciA9IHtcblx0XHRcdGNyZWF0ZUF1dGhIZWFkZXJzKCk6IERpY3Qge1xuXHRcdFx0XHRyZXR1cm4ge31cblx0XHRcdH0sXG5cdFx0XHRpc0Z1bGx5TG9nZ2VkSW4oKTogYm9vbGVhbiB7XG5cdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0fSxcblx0XHR9XG5cdFx0Y29uc3QgZXZlbnRSZXN0Q2xpZW50ID0gbmV3IEVudGl0eVJlc3RDbGllbnQoXG5cdFx0XHR0ZW1wQXV0aERhdGFQcm92aWRlcixcblx0XHRcdHRoaXMucmVzdENsaWVudCxcblx0XHRcdCgpID0+IHRoaXMuY3J5cHRvRmFjYWRlLFxuXHRcdFx0dGhpcy5pbnN0YW5jZU1hcHBlcixcblx0XHRcdHRoaXMuYmxvYkFjY2Vzc1Rva2VuRmFjYWRlLFxuXHRcdClcblx0XHRjb25zdCBlbnRpdHlDbGllbnQgPSBuZXcgRW50aXR5Q2xpZW50KGV2ZW50UmVzdENsaWVudClcblx0XHRjb25zdCBjcmVhdGVTZXNzaW9uUmV0dXJuID0gYXdhaXQgdGhpcy5zZXJ2aWNlRXhlY3V0b3IucG9zdChTZXNzaW9uU2VydmljZSwgc2Vzc2lvbkRhdGEpIC8vIERvbid0IHBhc3MgZW1haWwgYWRkcmVzcyB0byBhdm9pZCBwcm9wb3NpbmcgdG8gcmVzZXQgc2Vjb25kIGZhY3RvciB3aGVuIHdlJ3JlIHJlc2V0dGluZyBwYXNzd29yZFxuXG5cdFx0Y29uc3QgeyB1c2VySWQsIGFjY2Vzc1Rva2VuIH0gPSBhd2FpdCB0aGlzLndhaXRVbnRpbFNlY29uZEZhY3RvckFwcHJvdmVkT3JDYW5jZWxsZWQoY3JlYXRlU2Vzc2lvblJldHVybiwgbnVsbClcblx0XHRjb25zdCB1c2VyID0gYXdhaXQgZW50aXR5Q2xpZW50LmxvYWQoVXNlclR5cGVSZWYsIHVzZXJJZCwge1xuXHRcdFx0ZXh0cmFIZWFkZXJzOiB7XG5cdFx0XHRcdGFjY2Vzc1Rva2VuLFxuXHRcdFx0fSxcblx0XHR9KVxuXHRcdGlmICh1c2VyLmF1dGggPT0gbnVsbCB8fCB1c2VyLmF1dGgucmVjb3ZlckNvZGUgPT0gbnVsbCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwibWlzc2luZyByZWNvdmVyIGNvZGVcIilcblx0XHR9XG5cdFx0Y29uc3QgcmVjb3ZlckNvZGVFeHRyYUhlYWRlcnMgPSB7XG5cdFx0XHRhY2Nlc3NUb2tlbixcblx0XHRcdHJlY292ZXJDb2RlVmVyaWZpZXI6IHJlY292ZXJDb2RlVmVyaWZpZXJCYXNlNjQsXG5cdFx0fVxuXG5cdFx0Y29uc3QgcmVjb3ZlckNvZGVEYXRhID0gYXdhaXQgZW50aXR5Q2xpZW50LmxvYWQoUmVjb3ZlckNvZGVUeXBlUmVmLCB1c2VyLmF1dGgucmVjb3ZlckNvZGUsIHsgZXh0cmFIZWFkZXJzOiByZWNvdmVyQ29kZUV4dHJhSGVhZGVycyB9KVxuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBncm91cEtleSA9IGFlczI1NkRlY3J5cHRXaXRoUmVjb3ZlcnlLZXkocmVjb3ZlckNvZGVLZXksIHJlY292ZXJDb2RlRGF0YS5yZWNvdmVyQ29kZUVuY1VzZXJHcm91cEtleSlcblx0XHRcdGNvbnN0IHNhbHQgPSBnZW5lcmF0ZVJhbmRvbVNhbHQoKVxuXHRcdFx0Y29uc3QgbmV3S2RmVHlwZSA9IERFRkFVTFRfS0RGX1RZUEVcblxuXHRcdFx0Y29uc3QgbmV3UGFzc3BocmFzZUtleURhdGEgPSB7IGtkZlR5cGU6IG5ld0tkZlR5cGUsIHBhc3NwaHJhc2U6IG5ld1Bhc3N3b3JkLCBzYWx0IH1cblx0XHRcdGNvbnN0IHVzZXJQYXNzcGhyYXNlS2V5ID0gYXdhaXQgdGhpcy5kZXJpdmVVc2VyUGFzc3BocmFzZUtleShuZXdQYXNzcGhyYXNlS2V5RGF0YSlcblx0XHRcdGNvbnN0IHB3RW5jVXNlckdyb3VwS2V5ID0gZW5jcnlwdEtleSh1c2VyUGFzc3BocmFzZUtleSwgZ3JvdXBLZXkpXG5cdFx0XHRjb25zdCBuZXdQYXNzd29yZFZlcmlmaWVyID0gY3JlYXRlQXV0aFZlcmlmaWVyKHVzZXJQYXNzcGhyYXNlS2V5KVxuXHRcdFx0Y29uc3QgcG9zdERhdGEgPSBjcmVhdGVDaGFuZ2VQYXNzd29yZFBvc3RJbih7XG5cdFx0XHRcdGNvZGU6IG51bGwsXG5cdFx0XHRcdGtkZlZlcnNpb246IG5ld0tkZlR5cGUsXG5cdFx0XHRcdG9sZFZlcmlmaWVyOiBudWxsLFxuXHRcdFx0XHRzYWx0OiBzYWx0LFxuXHRcdFx0XHRwd0VuY1VzZXJHcm91cEtleTogcHdFbmNVc2VyR3JvdXBLZXksXG5cdFx0XHRcdHZlcmlmaWVyOiBuZXdQYXNzd29yZFZlcmlmaWVyLFxuXHRcdFx0XHRyZWNvdmVyQ29kZVZlcmlmaWVyOiByZWNvdmVyQ29kZVZlcmlmaWVyLFxuXHRcdFx0XHR1c2VyR3JvdXBLZXlWZXJzaW9uOiByZWNvdmVyQ29kZURhdGEudXNlcktleVZlcnNpb24sXG5cdFx0XHR9KVxuXG5cdFx0XHRjb25zdCBleHRyYUhlYWRlcnMgPSB7XG5cdFx0XHRcdGFjY2Vzc1Rva2VuLFxuXHRcdFx0fVxuXHRcdFx0YXdhaXQgdGhpcy5zZXJ2aWNlRXhlY3V0b3IucG9zdChDaGFuZ2VQYXNzd29yZFNlcnZpY2UsIHBvc3REYXRhLCB7IGV4dHJhSGVhZGVycyB9KVxuXHRcdH0gZmluYWxseSB7XG5cdFx0XHR0aGlzLmRlbGV0ZVNlc3Npb24oYWNjZXNzVG9rZW4pXG5cdFx0fVxuXHR9XG5cblx0LyoqIERlbGV0ZXMgc2Vjb25kIGZhY3RvcnMgdXNpbmcgcmVjb3ZlckNvZGUgYXMgc2Vjb25kIGZhY3Rvci4gKi9cblx0cmVzZXRTZWNvbmRGYWN0b3JzKG1haWxBZGRyZXNzOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcsIHJlY292ZXJDb2RlOiBIZXgpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRyZXR1cm4gdGhpcy5sb2FkVXNlclBhc3NwaHJhc2VLZXkobWFpbEFkZHJlc3MsIHBhc3N3b3JkKS50aGVuKChwYXNzcGhyYXNlUmV0dXJuKSA9PiB7XG5cdFx0XHRjb25zdCBhdXRoVmVyaWZpZXIgPSBjcmVhdGVBdXRoVmVyaWZpZXJBc0Jhc2U2NFVybChwYXNzcGhyYXNlUmV0dXJuLnVzZXJQYXNzcGhyYXNlS2V5KVxuXHRcdFx0Y29uc3QgcmVjb3ZlckNvZGVLZXkgPSB1aW50OEFycmF5VG9CaXRBcnJheShoZXhUb1VpbnQ4QXJyYXkocmVjb3ZlckNvZGUpKVxuXHRcdFx0Y29uc3QgcmVjb3ZlckNvZGVWZXJpZmllciA9IGNyZWF0ZUF1dGhWZXJpZmllckFzQmFzZTY0VXJsKHJlY292ZXJDb2RlS2V5KVxuXHRcdFx0Y29uc3QgZGVsZXRlRGF0YSA9IGNyZWF0ZVJlc2V0RmFjdG9yc0RlbGV0ZURhdGEoe1xuXHRcdFx0XHRtYWlsQWRkcmVzcyxcblx0XHRcdFx0YXV0aFZlcmlmaWVyLFxuXHRcdFx0XHRyZWNvdmVyQ29kZVZlcmlmaWVyLFxuXHRcdFx0fSlcblx0XHRcdHJldHVybiB0aGlzLnNlcnZpY2VFeGVjdXRvci5kZWxldGUoUmVzZXRGYWN0b3JzU2VydmljZSwgZGVsZXRlRGF0YSlcblx0XHR9KVxuXHR9XG5cblx0dGFrZU92ZXJEZWxldGVkQWRkcmVzcyhtYWlsQWRkcmVzczogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nLCByZWNvdmVyQ29kZTogSGV4IHwgbnVsbCwgdGFyZ2V0QWNjb3VudE1haWxBZGRyZXNzOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRyZXR1cm4gdGhpcy5sb2FkVXNlclBhc3NwaHJhc2VLZXkobWFpbEFkZHJlc3MsIHBhc3N3b3JkKS50aGVuKChwYXNzcGhyYXNlUmV0dXJuKSA9PiB7XG5cdFx0XHRjb25zdCBhdXRoVmVyaWZpZXIgPSBjcmVhdGVBdXRoVmVyaWZpZXJBc0Jhc2U2NFVybChwYXNzcGhyYXNlUmV0dXJuLnVzZXJQYXNzcGhyYXNlS2V5KVxuXHRcdFx0bGV0IHJlY292ZXJDb2RlVmVyaWZpZXI6IEJhc2U2NCB8IG51bGwgPSBudWxsXG5cblx0XHRcdGlmIChyZWNvdmVyQ29kZSkge1xuXHRcdFx0XHRjb25zdCByZWNvdmVyQ29kZUtleSA9IHVpbnQ4QXJyYXlUb0JpdEFycmF5KGhleFRvVWludDhBcnJheShyZWNvdmVyQ29kZSkpXG5cdFx0XHRcdHJlY292ZXJDb2RlVmVyaWZpZXIgPSBjcmVhdGVBdXRoVmVyaWZpZXJBc0Jhc2U2NFVybChyZWNvdmVyQ29kZUtleSlcblx0XHRcdH1cblxuXHRcdFx0bGV0IGRhdGEgPSBjcmVhdGVUYWtlT3ZlckRlbGV0ZWRBZGRyZXNzRGF0YSh7XG5cdFx0XHRcdG1haWxBZGRyZXNzLFxuXHRcdFx0XHRhdXRoVmVyaWZpZXIsXG5cdFx0XHRcdHJlY292ZXJDb2RlVmVyaWZpZXIsXG5cdFx0XHRcdHRhcmdldEFjY291bnRNYWlsQWRkcmVzcyxcblx0XHRcdH0pXG5cdFx0XHRyZXR1cm4gdGhpcy5zZXJ2aWNlRXhlY3V0b3IucG9zdChUYWtlT3ZlckRlbGV0ZWRBZGRyZXNzU2VydmljZSwgZGF0YSlcblx0XHR9KVxuXHR9XG5cblx0Z2VuZXJhdGVUb3RwU2VjcmV0KCk6IFByb21pc2U8VG90cFNlY3JldD4ge1xuXHRcdHJldHVybiB0aGlzLmdldFRvdHBWZXJpZmllcigpLnRoZW4oKHRvdHApID0+IHRvdHAuZ2VuZXJhdGVTZWNyZXQoKSlcblx0fVxuXG5cdGdlbmVyYXRlVG90cENvZGUodGltZTogbnVtYmVyLCBrZXk6IFVpbnQ4QXJyYXkpOiBQcm9taXNlPG51bWJlcj4ge1xuXHRcdHJldHVybiB0aGlzLmdldFRvdHBWZXJpZmllcigpLnRoZW4oKHRvdHApID0+IHRvdHAuZ2VuZXJhdGVUb3RwKHRpbWUsIGtleSkpXG5cdH1cblxuXHRwcml2YXRlIGdldFRvdHBWZXJpZmllcigpOiBQcm9taXNlPFRvdHBWZXJpZmllcj4ge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IFRvdHBWZXJpZmllcigpKVxuXHR9XG5cblx0YXN5bmMgcmV0cnlBc3luY0xvZ2luKCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGlmICh0aGlzLmFzeW5jTG9naW5TdGF0ZS5zdGF0ZSA9PT0gXCJydW5uaW5nXCIpIHtcblx0XHRcdHJldHVyblxuXHRcdH0gZWxzZSBpZiAodGhpcy5hc3luY0xvZ2luU3RhdGUuc3RhdGUgPT09IFwiZmFpbGVkXCIpIHtcblx0XHRcdGF3YWl0IHRoaXMuYXN5bmNSZXN1bWVTZXNzaW9uKHRoaXMuYXN5bmNMb2dpblN0YXRlLmNyZWRlbnRpYWxzLCB0aGlzLmFzeW5jTG9naW5TdGF0ZS5jYWNoZUluZm8pXG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcImNyZWRlbnRpYWxzIHdlbnQgbWlzc2luZ1wiKVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgdmVyaWZpZXIgdG9rZW4sIHdoaWNoIGlzIHByb29mIG9mIHBhc3N3b3JkIGF1dGhlbnRpY2F0aW9uIGFuZCBpcyB2YWxpZCBmb3IgYSBsaW1pdGVkIHRpbWUuXG5cdCAqIFRoaXMgdG9rZW4gd2lsbCBoYXZlIHRvIGJlIHBhc3NlZCBiYWNrIHRvIHRoZSBzZXJ2ZXIgd2l0aCB0aGUgYXBwcm9wcmlhdGUgY2FsbC5cblx0ICovXG5cdGFzeW5jIGdldFZlcmlmaWVyVG9rZW4ocGFzc3BocmFzZTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcblx0XHRjb25zdCB1c2VyID0gdGhpcy51c2VyRmFjYWRlLmdldExvZ2dlZEluVXNlcigpXG5cdFx0Y29uc3QgcGFzc3BocmFzZUtleSA9IGF3YWl0IHRoaXMuZGVyaXZlVXNlclBhc3NwaHJhc2VLZXkoe1xuXHRcdFx0a2RmVHlwZTogYXNLZGZUeXBlKHVzZXIua2RmVmVyc2lvbiksXG5cdFx0XHRwYXNzcGhyYXNlLFxuXHRcdFx0c2FsdDogYXNzZXJ0Tm90TnVsbCh1c2VyLnNhbHQpLFxuXHRcdH0pXG5cblx0XHRjb25zdCBhdXRoVmVyaWZpZXIgPSBjcmVhdGVBdXRoVmVyaWZpZXIocGFzc3BocmFzZUtleSlcblx0XHRjb25zdCBvdXQgPSBhd2FpdCB0aGlzLnNlcnZpY2VFeGVjdXRvci5wb3N0KFZlcmlmaWVyVG9rZW5TZXJ2aWNlLCBjcmVhdGVWZXJpZmllclRva2VuU2VydmljZUluKHsgYXV0aFZlcmlmaWVyIH0pKVxuXHRcdHJldHVybiBvdXQudG9rZW5cblx0fVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF1R0Esb0JBQW9CO0lBc0JGLGdFQUFYO0FBQ047O0FBQ0E7SUFnRFksY0FBTixNQUFrQjtDQUN4QixBQUFROzs7O0NBSVIsQUFBUSx3QkFBd0M7Ozs7Q0FLaEQsQUFBUSwwQkFBdUQ7O0NBRy9ELGtCQUFtQyxFQUFFLE9BQU8sT0FBUTtDQUVwRCxZQUNrQkEsWUFDQUMsY0FDQUMsZUFDQUMsZ0JBQ0FDLGNBQ0FDLG1CQU1BQyxrQkFDQUMsaUJBQ0FDLFlBQ0FDLHVCQUNBQyxlQUNBQyxvQkFDQUMsZ0JBQ0FDLHdCQUNBQyxXQUNBQyx1QkFDaEI7RUF3NkJGLEtBNzdCa0I7RUE2N0JqQixLQTU3QmlCO0VBNDdCaEIsS0EzN0JnQjtFQTI3QmYsS0ExN0JlO0VBMDdCZCxLQXo3QmM7RUF5N0JiLEtBeDdCYTtFQXc3QlosS0FsN0JZO0VBazdCWCxLQWo3Qlc7RUFpN0JWLEtBaDdCVTtFQWc3QlQsS0EvNkJTO0VBKzZCUixLQTk2QlE7RUE4NkJQLEtBNzZCTztFQTY2Qk4sS0E1NkJNO0VBNDZCTCxLQTM2Qks7RUEyNkJKLEtBMTZCSTtFQTA2QkgsS0F6NkJHO0NBQ2Q7Q0FFSixLQUFLQyxnQkFBZ0M7QUFDcEMsT0FBSyxpQkFBaUI7Q0FDdEI7Q0FFRCxNQUFNLGVBQThCO0FBQ25DLE9BQUssZUFBZSxNQUFNLG9CQUFvQixVQUFVO0FBQ3hELFFBQU0sS0FBSyxhQUFhO0FBQ3hCLE9BQUssV0FBVyxPQUFPO0NBQ3ZCOzs7O0NBS0QsTUFBTSxjQUNMQyxhQUNBQyxZQUNBQyxrQkFDQUMsYUFDQUMsYUFDMEI7QUFDMUIsTUFBSSxLQUFLLFdBQVcscUJBQXFCLENBRXhDLFNBQVEsSUFBSSxxQ0FBcUM7RUFJbEQsTUFBTSxFQUFFLG1CQUFtQixTQUFTLEdBQUcsTUFBTSxLQUFLLHNCQUFzQixhQUFhLFdBQVc7RUFFaEcsTUFB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