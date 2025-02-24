import "./dist-chunk.js";
import { ProgrammingError } from "./ProgrammingError-chunk.js";
import { assertWorkerOrNode, isApp, isDesktop } from "./Env-chunk.js";
import { addressDomain, assertNotNull, byteLength, contains, defer, freshVersioned, isEmpty, isNotNull, isSameTypeRef, isSameTypeRefByAttr, noOp, ofClass, pMap, promiseFilter } from "./dist2-chunk.js";
import { ArchiveDataType, CounterType, CryptoProtocolVersion, DEFAULT_KDF_TYPE, EncryptionAuthStatus, GroupType, MailAuthenticationStatus, MailMethod, OperationType, PhishingMarkerStatus, PublicKeyIdentifierType, ReportedMailFieldType, SYSTEM_GROUP_MAIL_ADDRESS } from "./TutanotaConstants-chunk.js";
import { containsId, elementIdPart, getElementId, getLetId, isSameId, listIdPart, stringToCustomId } from "./EntityUtils-chunk.js";
import "./TypeModels-chunk.js";
import { FileTypeRef, InternalRecipientKeyDataTypeRef, MailDetailsBlobTypeRef, MailDetailsDraftTypeRef, MailTypeRef, SymEncInternalRecipientKeyDataTypeRef, TutanotaPropertiesTypeRef, createApplyLabelServicePostIn, createAttachmentKeyData, createCreateExternalUserGroupData, createCreateMailFolderData, createDeleteMailData, createDeleteMailFolderData, createDraftAttachment, createDraftCreateData, createDraftData, createDraftRecipient, createDraftUpdateData, createEncryptedMailAddress, createExternalUserData, createListUnsubscribeData, createManageLabelServiceDeleteIn, createManageLabelServiceLabelData, createManageLabelServicePostIn, createMoveMailData, createNewDraftAttachment, createReportMailPostData, createSecureExternalRecipientKeyData, createSendDraftData, createUpdateMailFolderData } from "./TypeRefs-chunk.js";
import "./TypeModels2-chunk.js";
import { ExternalUserReferenceTypeRef, GroupInfoTypeRef, GroupRootTypeRef, GroupTypeRef, UserTypeRef } from "./TypeRefs2-chunk.js";
import { resolveTypeReference } from "./EntityFunctions-chunk.js";
import "./TypeModels3-chunk.js";
import "./ModelInfo-chunk.js";
import { NotFoundError } from "./RestError-chunk.js";
import "./CryptoError-chunk.js";
import "./error-chunk.js";
import { RecipientsNotFoundError } from "./RecipientsNotFoundError-chunk.js";
import { MailBodyTooLargeError } from "./MailBodyTooLargeError-chunk.js";
import { aes256RandomKey, bitArrayToUint8Array, createAuthVerifier, decryptKey, encryptKey, generateRandomSalt, keyToUint8Array, murmurHash, random, sha256Hash } from "./dist3-chunk.js";
import { parseKeyVersion } from "./KeyLoaderFacade-chunk.js";
import { encryptBytes, encryptKeyWithVersionedKey, encryptString } from "./CryptoWrapper-chunk.js";
import { ApplyLabelService, DraftService, ExternalUserService, ListUnsubscribeService, MailFolderService, MailService, ManageLabelService, MoveMailService, ReportMailService, SendDraftService } from "./Services2-chunk.js";
import { UNCOMPRESSED_MAX_SIZE } from "./Compression-chunk.js";
import { getEnabledMailAddressesForGroupInfo, getUserGroupMemberships } from "./GroupUtils-chunk.js";
import { isDataFile, isFileReference } from "./FileUtils-chunk.js";
import { RecipientType } from "./Recipient-chunk.js";
import { CounterService, createWriteCounterData } from "./Services4-chunk.js";
import { htmlToText } from "./IndexUtils-chunk.js";

//#region src/common/api/worker/facades/lazy/MailFacade.ts
assertWorkerOrNode();
var MailFacade = class {
	phishingMarkers = new Set();
	deferredDraftId = null;
	deferredDraftUpdate = null;
	constructor(userFacade, entityClient, crypto, serviceExecutor, blobFacade, fileApp, loginFacade, keyLoaderFacade, publicKeyProvider) {
		this.userFacade = userFacade;
		this.entityClient = entityClient;
		this.crypto = crypto;
		this.serviceExecutor = serviceExecutor;
		this.blobFacade = blobFacade;
		this.fileApp = fileApp;
		this.loginFacade = loginFacade;
		this.keyLoaderFacade = keyLoaderFacade;
		this.publicKeyProvider = publicKeyProvider;
	}
	async createMailFolder(name, parent, ownerGroupId) {
		const mailGroupKey = await this.keyLoaderFacade.getCurrentSymGroupKey(ownerGroupId);
		const sk = aes256RandomKey();
		const ownerEncSessionKey = encryptKeyWithVersionedKey(mailGroupKey, sk);
		const newFolder = createCreateMailFolderData({
			folderName: name,
			parentFolder: parent,
			ownerEncSessionKey: ownerEncSessionKey.key,
			ownerGroup: ownerGroupId,
			ownerKeyVersion: ownerEncSessionKey.encryptingKeyVersion.toString()
		});
		await this.serviceExecutor.post(MailFolderService, newFolder, { sessionKey: sk });
	}
	/**
	* Updates a mail folder's name, if needed
	* @param newName - if this is the same as the folder's current name, nothing is done
	*/
	async updateMailFolderName(folder, newName) {
		if (newName !== folder.name) {
			folder.name = newName;
			await this.entityClient.update(folder);
		}
	}
	/**
	* Updates a mail folder's parent, if needed
	* @param newParent - if this is the same as the folder's current parent, nothing is done
	*/
	async updateMailFolderParent(folder, newParent) {
		if (folder.parentFolder != null && newParent != null && !isSameId(folder.parentFolder, newParent) || folder.parentFolder == null && newParent != null || folder.parentFolder != null && newParent == null) {
			const updateFolder = createUpdateMailFolderData({
				folder: folder._id,
				newParent
			});
			await this.serviceExecutor.put(MailFolderService, updateFolder);
		}
	}
	/**
	* Creates a draft mail.
	* @param bodyText The bodyText of the mail formatted as HTML.
	* @param previousMessageId The id of the message that this mail is a reply or forward to. Null if this is a new mail.
	* @param attachments The files that shall be attached to this mail or null if no files shall be attached. TutanotaFiles are already exising on the server, DataFiles are files from the local file system. Attention: the DataFile class information is lost
	* @param confidential True if the mail shall be sent end-to-end encrypted, false otherwise.
	*/
	async createDraft({ subject, bodyText, senderMailAddress, senderName, toRecipients, ccRecipients, bccRecipients, conversationType, previousMessageId, attachments, confidential, replyTos, method }) {
		if (byteLength(bodyText) > UNCOMPRESSED_MAX_SIZE) throw new MailBodyTooLargeError(`Can't update draft, mail body too large (${byteLength(bodyText)})`);
		const senderMailGroupId = await this._getMailGroupIdForMailAddress(this.userFacade.getLoggedInUser(), senderMailAddress);
		const mailGroupKey = await this.keyLoaderFacade.getCurrentSymGroupKey(senderMailGroupId);
		const sk = aes256RandomKey();
		const ownerEncSessionKey = encryptKeyWithVersionedKey(mailGroupKey, sk);
		const service = createDraftCreateData({
			previousMessageId,
			conversationType,
			ownerEncSessionKey: ownerEncSessionKey.key,
			draftData: createDraftData({
				subject,
				compressedBodyText: bodyText,
				senderMailAddress,
				senderName,
				confidential,
				method,
				toRecipients: toRecipients.map(recipientToDraftRecipient),
				ccRecipients: ccRecipients.map(recipientToDraftRecipient),
				bccRecipients: bccRecipients.map(recipientToDraftRecipient),
				replyTos: replyTos.map(recipientToEncryptedMailAddress),
				addedAttachments: await this._createAddedAttachments(attachments, [], senderMailGroupId, mailGroupKey),
				bodyText: "",
				removedAttachments: []
			}),
			ownerKeyVersion: ownerEncSessionKey.encryptingKeyVersion.toString()
		});
		const createDraftReturn = await this.serviceExecutor.post(DraftService, service, { sessionKey: sk });
		return this.entityClient.load(MailTypeRef, createDraftReturn.draft);
	}
	/**
	* Updates a draft mail.
	* @param subject The subject of the mail.
	* @param body The body text of the mail.
	* @param senderMailAddress The senders mail address.
	* @param senderName The name of the sender that is sent together with the mail address of the sender.
	* @param toRecipients The recipients the mail shall be sent to.
	* @param ccRecipients The recipients the mail shall be sent to in cc.
	* @param bccRecipients The recipients the mail shall be sent to in bcc.
	* @param attachments The files that shall be attached to this mail or null if the current attachments shall not be changed.
	* @param confidential True if the mail shall be sent end-to-end encrypted, false otherwise.
	* @param draft The draft to update.
	* @return The updated draft. Rejected with TooManyRequestsError if the number allowed mails was exceeded, AccessBlockedError if the customer is not allowed to send emails currently because he is marked for approval.
	*/
	async updateDraft({ subject, body, senderMailAddress, senderName, toRecipients, ccRecipients, bccRecipients, attachments, confidential, draft }) {
		if (byteLength(body) > UNCOMPRESSED_MAX_SIZE) throw new MailBodyTooLargeError(`Can't update draft, mail body too large (${byteLength(body)})`);
		const senderMailGroupId = await this._getMailGroupIdForMailAddress(this.userFacade.getLoggedInUser(), senderMailAddress);
		const mailGroupKeyVersion = parseKeyVersion(draft._ownerKeyVersion ?? "0");
		const mailGroupKey = {
			version: mailGroupKeyVersion,
			object: await this.keyLoaderFacade.loadSymGroupKey(senderMailGroupId, mailGroupKeyVersion)
		};
		const currentAttachments = await this.getAttachmentIds(draft);
		const replyTos = await this.getReplyTos(draft);
		const sk = decryptKey(mailGroupKey.object, assertNotNull(draft._ownerEncSessionKey));
		const service = createDraftUpdateData({
			draft: draft._id,
			draftData: createDraftData({
				subject,
				compressedBodyText: body,
				senderMailAddress,
				senderName,
				confidential,
				method: draft.method,
				toRecipients: toRecipients.map(recipientToDraftRecipient),
				ccRecipients: ccRecipients.map(recipientToDraftRecipient),
				bccRecipients: bccRecipients.map(recipientToDraftRecipient),
				replyTos,
				removedAttachments: this._getRemovedAttachments(attachments, currentAttachments),
				addedAttachments: await this._createAddedAttachments(attachments, currentAttachments, senderMailGroupId, mailGroupKey),
				bodyText: ""
			})
		});
		this.deferredDraftId = draft._id;
		this.deferredDraftUpdate = defer();
		const deferredUpdatePromiseWrapper = this.deferredDraftUpdate;
		await this.serviceExecutor.put(DraftService, service, { sessionKey: sk });
		return deferredUpdatePromiseWrapper.promise;
	}
	async moveMails(mails, sourceFolder, targetFolder) {
		await this.serviceExecutor.post(MoveMailService, createMoveMailData({
			mails,
			sourceFolder,
			targetFolder
		}));
	}
	async reportMail(mail, reportType) {
		const mailSessionKey = assertNotNull(await this.crypto.resolveSessionKeyForInstance(mail));
		const postData = createReportMailPostData({
			mailId: mail._id,
			mailSessionKey: bitArrayToUint8Array(mailSessionKey),
			reportType
		});
		await this.serviceExecutor.post(ReportMailService, postData);
	}
	async deleteMails(mails, folder) {
		const deleteMailData = createDeleteMailData({
			mails,
			folder
		});
		await this.serviceExecutor.delete(MailService, deleteMailData);
	}
	/**
	* Returns all ids of the files that have been removed, i.e. that are contained in the existingFileIds but not in the provided files
	*/
	_getRemovedAttachments(providedFiles, existingFileIds) {
		const removedAttachmentIds = [];
		if (providedFiles != null) {
			const attachments = providedFiles;
			for (const fileId of existingFileIds) if (!attachments.some((attachment) => attachment._type !== "DataFile" && attachment._type !== "FileReference" && isSameId(getLetId(attachment), fileId))) removedAttachmentIds.push(fileId);
		}
		return removedAttachmentIds;
	}
	/**
	* Uploads the given data files or sets the file if it is already existing files (e.g. forwarded files) and returns all DraftAttachments
	*/
	async _createAddedAttachments(providedFiles, existingFileIds, senderMailGroupId, mailGroupKey) {
		if (providedFiles == null || providedFiles.length === 0) return [];
		validateMimeTypesForAttachments(providedFiles);
		return pMap(providedFiles, async (providedFile) => {
			if (isDataFile(providedFile)) {
				const fileSessionKey = aes256RandomKey();
				let referenceTokens;
				if (isApp() || isDesktop()) {
					const { location } = await this.fileApp.writeDataFile(providedFile);
					referenceTokens = await this.blobFacade.encryptAndUploadNative(ArchiveDataType.Attachments, location, senderMailGroupId, fileSessionKey);
					await this.fileApp.deleteFile(location);
				} else referenceTokens = await this.blobFacade.encryptAndUpload(ArchiveDataType.Attachments, providedFile.data, senderMailGroupId, fileSessionKey);
				return this.createAndEncryptDraftAttachment(referenceTokens, fileSessionKey, providedFile, mailGroupKey);
			} else if (isFileReference(providedFile)) {
				const fileSessionKey = aes256RandomKey();
				const referenceTokens = await this.blobFacade.encryptAndUploadNative(ArchiveDataType.Attachments, providedFile.location, senderMailGroupId, fileSessionKey);
				return this.createAndEncryptDraftAttachment(referenceTokens, fileSessionKey, providedFile, mailGroupKey);
			} else if (!containsId(existingFileIds, getLetId(providedFile))) return this.crypto.resolveSessionKeyForInstance(providedFile).then((fileSessionKey) => {
				const sessionKey = assertNotNull(fileSessionKey, "filesessionkey was not resolved");
				const ownerEncFileSessionKey = encryptKeyWithVersionedKey(mailGroupKey, sessionKey);
				const attachment = createDraftAttachment({
					existingFile: getLetId(providedFile),
					ownerEncFileSessionKey: ownerEncFileSessionKey.key,
					newFile: null,
					ownerKeyVersion: ownerEncFileSessionKey.encryptingKeyVersion.toString()
				});
				return attachment;
			});
else return null;
		}).then((attachments) => attachments.filter(isNotNull)).then((it) => {
			if (isApp()) this.fileApp.clearFileData().catch((e) => console.warn("Failed to clear files", e));
			return it;
		});
	}
	createAndEncryptDraftAttachment(referenceTokens, fileSessionKey, providedFile, mailGroupKey) {
		const ownerEncFileSessionKey = encryptKeyWithVersionedKey(mailGroupKey, fileSessionKey);
		return createDraftAttachment({
			newFile: createNewDraftAttachment({
				encFileName: encryptString(fileSessionKey, providedFile.name),
				encMimeType: encryptString(fileSessionKey, providedFile.mimeType),
				referenceTokens,
				encCid: providedFile.cid == null ? null : encryptString(fileSessionKey, providedFile.cid)
			}),
			ownerEncFileSessionKey: ownerEncFileSessionKey.key,
			ownerKeyVersion: ownerEncFileSessionKey.encryptingKeyVersion.toString(),
			existingFile: null
		});
	}
	async sendDraft(draft, recipients, language) {
		const senderMailGroupId = await this._getMailGroupIdForMailAddress(this.userFacade.getLoggedInUser(), draft.sender.address);
		const bucketKey = aes256RandomKey();
		const sendDraftData = createSendDraftData({
			language,
			mail: draft._id,
			mailSessionKey: null,
			attachmentKeyData: [],
			calendarMethod: false,
			internalRecipientKeyData: [],
			plaintext: false,
			bucketEncMailSessionKey: null,
			senderNameUnencrypted: null,
			secureExternalRecipientKeyData: [],
			symEncInternalRecipientKeyData: [],
			sessionEncEncryptionAuthStatus: null
		});
		const attachments = await this.getAttachmentIds(draft);
		for (const fileId of attachments) {
			const file = await this.entityClient.load(FileTypeRef, fileId);
			const fileSessionKey = assertNotNull(await this.crypto.resolveSessionKeyForInstance(file), "fileSessionKey was null");
			const data = createAttachmentKeyData({
				file: fileId,
				fileSessionKey: null,
				bucketEncFileSessionKey: null
			});
			if (draft.confidential) data.bucketEncFileSessionKey = encryptKey(bucketKey, fileSessionKey);
else data.fileSessionKey = keyToUint8Array(fileSessionKey);
			sendDraftData.attachmentKeyData.push(data);
		}
		await Promise.all([this.entityClient.loadRoot(TutanotaPropertiesTypeRef, this.userFacade.getUserGroupId()).then((tutanotaProperties) => {
			sendDraftData.plaintext = tutanotaProperties.sendPlaintextOnly;
		}), this.crypto.resolveSessionKeyForInstance(draft).then(async (mailSessionkey) => {
			const sk = assertNotNull(mailSessionkey, "mailSessionKey was null");
			sendDraftData.calendarMethod = draft.method !== MailMethod.NONE;
			if (draft.confidential) {
				sendDraftData.bucketEncMailSessionKey = encryptKey(bucketKey, sk);
				const hasExternalSecureRecipient = recipients.some((r) => r.type === RecipientType.EXTERNAL && !!this.getContactPassword(r.contact)?.trim());
				if (hasExternalSecureRecipient) sendDraftData.senderNameUnencrypted = draft.sender.name;
				await this.addRecipientKeyData(bucketKey, sendDraftData, recipients, senderMailGroupId);
				if (this.isTutaCryptMail(sendDraftData)) sendDraftData.sessionEncEncryptionAuthStatus = encryptString(sk, EncryptionAuthStatus.TUTACRYPT_SENDER);
			} else sendDraftData.mailSessionKey = bitArrayToUint8Array(sk);
		})]);
		await this.serviceExecutor.post(SendDraftService, sendDraftData);
	}
	async getAttachmentIds(draft) {
		return draft.attachments;
	}
	async getReplyTos(draft) {
		const ownerEncSessionKeyProvider = this.keyProviderFromInstance(draft);
		const mailDetailsDraftId = assertNotNull(draft.mailDetailsDraft, "draft without mailDetailsDraft");
		const mailDetails = await this.entityClient.loadMultiple(MailDetailsDraftTypeRef, listIdPart(mailDetailsDraftId), [elementIdPart(mailDetailsDraftId)], ownerEncSessionKeyProvider);
		if (mailDetails.length === 0) throw new NotFoundError(`MailDetailsDraft ${draft.mailDetailsDraft}`);
		return mailDetails[0].details.replyTos;
	}
	async checkMailForPhishing(mail, links) {
		let score = 0;
		const senderAddress = mail.sender.address;
		let senderAuthenticated;
		if (mail.authStatus !== null) senderAuthenticated = mail.authStatus === MailAuthenticationStatus.AUTHENTICATED;
else {
			const mailDetails = await this.loadMailDetailsBlob(mail);
			senderAuthenticated = mailDetails.authStatus === MailAuthenticationStatus.AUTHENTICATED;
		}
		if (senderAuthenticated) if (this._checkFieldForPhishing(ReportedMailFieldType.FROM_ADDRESS, senderAddress)) score += 6;
else {
			const senderDomain = addressDomain(senderAddress);
			if (this._checkFieldForPhishing(ReportedMailFieldType.FROM_DOMAIN, senderDomain)) score += 6;
		}
else if (this._checkFieldForPhishing(ReportedMailFieldType.FROM_ADDRESS_NON_AUTH, senderAddress)) score += 6;
else {
			const senderDomain = addressDomain(senderAddress);
			if (this._checkFieldForPhishing(ReportedMailFieldType.FROM_DOMAIN_NON_AUTH, senderDomain)) score += 6;
		}
		if (mail.subject && this._checkFieldForPhishing(ReportedMailFieldType.SUBJECT, mail.subject)) score += 3;
		for (const link of links) if (this._checkFieldForPhishing(ReportedMailFieldType.LINK, link.href)) {
			score += 6;
			break;
		} else {
			const domain = getUrlDomain(link.href);
			if (domain && this._checkFieldForPhishing(ReportedMailFieldType.LINK_DOMAIN, domain)) {
				score += 6;
				break;
			}
		}
		const hasSuspiciousLink = links.some(({ href, innerHTML }) => {
			const innerText = htmlToText(innerHTML);
			const textUrl = parseUrl(innerText);
			const hrefUrl = parseUrl(href);
			return textUrl && hrefUrl && textUrl.hostname !== hrefUrl.hostname;
		});
		if (hasSuspiciousLink) score += 6;
		return Promise.resolve(7 < score);
	}
	async deleteFolder(id) {
		const deleteMailFolderData = createDeleteMailFolderData({ folders: [id] });
		await this.serviceExecutor.delete(MailFolderService, deleteMailFolderData, { sessionKey: "dummy" });
	}
	async fixupCounterForFolder(groupId, folder, unreadMails) {
		const counterId = getElementId(folder);
		const data = createWriteCounterData({
			counterType: CounterType.UnreadMails,
			row: groupId,
			column: counterId,
			value: String(unreadMails)
		});
		await this.serviceExecutor.post(CounterService, data);
	}
	_checkFieldForPhishing(type, value) {
		const hash = phishingMarkerValue(type, value);
		return this.phishingMarkers.has(hash);
	}
	async addRecipientKeyData(bucketKey, sendDraftData, recipients, senderMailGroupId) {
		const notFoundRecipients = [];
		for (const recipient of recipients) {
			if (recipient.address === SYSTEM_GROUP_MAIL_ADDRESS || !recipient) {
				notFoundRecipients.push(recipient.address);
				continue;
			}
			const isSharedMailboxSender = !isSameId(this.userFacade.getGroupId(GroupType.Mail), senderMailGroupId);
			if (recipient.type === RecipientType.EXTERNAL) {
				const passphrase = this.getContactPassword(recipient.contact);
				if (passphrase == null || isSharedMailboxSender) {
					notFoundRecipients.push(recipient.address);
					continue;
				}
				const salt = generateRandomSalt();
				const kdfType = DEFAULT_KDF_TYPE;
				const passwordKey = await this.loginFacade.deriveUserPassphraseKey({
					kdfType,
					passphrase,
					salt
				});
				const passwordVerifier = createAuthVerifier(passwordKey);
				const externalGroupKeys = await this.getExternalGroupKeys(recipient.address, kdfType, passwordKey, passwordVerifier);
				const ownerEncBucketKey = encryptKeyWithVersionedKey(externalGroupKeys.currentExternalMailGroupKey, bucketKey);
				const data = createSecureExternalRecipientKeyData({
					mailAddress: recipient.address,
					kdfVersion: kdfType,
					ownerEncBucketKey: ownerEncBucketKey.key,
					ownerKeyVersion: ownerEncBucketKey.encryptingKeyVersion.toString(),
					passwordVerifier,
					salt,
					saltHash: sha256Hash(salt),
					pwEncCommunicationKey: encryptKey(passwordKey, externalGroupKeys.currentExternalUserGroupKey.object),
					userGroupKeyVersion: String(externalGroupKeys.currentExternalUserGroupKey.version)
				});
				sendDraftData.secureExternalRecipientKeyData.push(data);
			} else {
				const keyData = await this.crypto.encryptBucketKeyForInternalRecipient(isSharedMailboxSender ? senderMailGroupId : this.userFacade.getLoggedInUser().userGroup.group, bucketKey, recipient.address, notFoundRecipients);
				if (keyData == null) {} else if (isSameTypeRef(keyData._type, SymEncInternalRecipientKeyDataTypeRef)) sendDraftData.symEncInternalRecipientKeyData.push(keyData);
else if (isSameTypeRef(keyData._type, InternalRecipientKeyDataTypeRef)) sendDraftData.internalRecipientKeyData.push(keyData);
			}
		}
		if (notFoundRecipients.length > 0) throw new RecipientsNotFoundError(notFoundRecipients.join("\n"));
	}
	/**
	* Checks if the given send draft data contains only encrypt keys that have been encrypted with TutaCrypt protocol.
	* @VisibleForTesting
	* @param sendDraftData The send drafta for the mail that should be sent
	*/
	isTutaCryptMail(sendDraftData) {
		if (sendDraftData.symEncInternalRecipientKeyData.length > 0 || sendDraftData.secureExternalRecipientKeyData.length) return false;
		if (isEmpty(sendDraftData.internalRecipientKeyData)) return false;
		return sendDraftData.internalRecipientKeyData.every((recipientData) => recipientData.protocolVersion === CryptoProtocolVersion.TUTA_CRYPT);
	}
	getContactPassword(contact) {
		return contact?.presharedPassword ?? null;
	}
	/**
	* Checks that an external user instance with a mail box exists for the given recipient. If it does not exist, it is created.
	* Returns the user group key and the user mail group key of the external recipient.
	* @param recipientMailAddress
	* @param externalUserKdfType the kdf type used to derive externalUserPwKey
	* @param externalUserPwKey The external user's password key.
	* @param verifier The external user's verifier, base64 encoded.
	* @return Resolves to the external user's group key and the external user's mail group key, rejected if an error occurred
	*/
	async getExternalGroupKeys(recipientMailAddress, externalUserKdfType, externalUserPwKey, verifier) {
		const groupRoot = await this.entityClient.loadRoot(GroupRootTypeRef, this.userFacade.getUserGroupId());
		const cleanedMailAddress = recipientMailAddress.trim().toLocaleLowerCase();
		const mailAddressId = stringToCustomId(cleanedMailAddress);
		let externalUserReference;
		try {
			externalUserReference = await this.entityClient.load(ExternalUserReferenceTypeRef, [groupRoot.externalUserReferences, mailAddressId]);
		} catch (e) {
			if (e instanceof NotFoundError) return this.createExternalUser(cleanedMailAddress, externalUserKdfType, externalUserPwKey, verifier);
			throw e;
		}
		const externalUser = await this.entityClient.load(UserTypeRef, externalUserReference.user);
		const externalUserGroupId = externalUserReference.userGroup;
		const externalMailGroupId = assertNotNull(externalUser.memberships.find((m) => m.groupType === GroupType.Mail), "no mail group membership on external user").group;
		const externalMailGroup = await this.entityClient.load(GroupTypeRef, externalMailGroupId);
		const externalUserGroup = await this.entityClient.load(GroupTypeRef, externalUserGroupId);
		const requiredInternalUserGroupKeyVersion = parseKeyVersion(externalUserGroup.adminGroupKeyVersion ?? "0");
		const requiredExternalUserGroupKeyVersion = parseKeyVersion(externalMailGroup.adminGroupKeyVersion ?? "0");
		const internalUserEncExternalUserKey = assertNotNull(externalUserGroup.adminGroupEncGKey, "no adminGroupEncGKey on external user group");
		const externalUserEncExternalMailKey = assertNotNull(externalMailGroup.adminGroupEncGKey, "no adminGroupEncGKey on external mail group");
		const requiredInternalUserGroupKey = await this.keyLoaderFacade.loadSymGroupKey(this.userFacade.getUserGroupId(), requiredInternalUserGroupKeyVersion);
		const currentExternalUserGroupKey = {
			object: decryptKey(requiredInternalUserGroupKey, internalUserEncExternalUserKey),
			version: parseKeyVersion(externalUserGroup.groupKeyVersion)
		};
		const requiredExternalUserGroupKey = await this.keyLoaderFacade.loadSymGroupKey(externalUserGroupId, requiredExternalUserGroupKeyVersion, currentExternalUserGroupKey);
		const currentExternalMailGroupKey = {
			object: decryptKey(requiredExternalUserGroupKey, externalUserEncExternalMailKey),
			version: parseKeyVersion(externalMailGroup.groupKeyVersion)
		};
		return {
			currentExternalUserGroupKey,
			currentExternalMailGroupKey
		};
	}
	getRecipientKeyData(mailAddress) {
		return this.publicKeyProvider.loadCurrentPubKey({
			identifierType: PublicKeyIdentifierType.MAIL_ADDRESS,
			identifier: mailAddress
		}).catch(ofClass(NotFoundError, () => null));
	}
	entityEventsReceived(data) {
		return pMap(data, (update) => {
			if (this.deferredDraftUpdate != null && this.deferredDraftId != null && update.operation === OperationType.UPDATE && isSameTypeRefByAttr(MailTypeRef, update.application, update.type) && isSameId(this.deferredDraftId, [update.instanceListId, update.instanceId])) return this.entityClient.load(MailTypeRef, this.deferredDraftId).then((mail) => {
				const deferredPromiseWrapper = assertNotNull(this.deferredDraftUpdate, "deferredDraftUpdate went away?");
				this.deferredDraftUpdate = null;
				deferredPromiseWrapper.resolve(mail);
			}).catch(ofClass(NotFoundError, () => {
				console.log(`Could not find updated mail ${JSON.stringify([update.instanceListId, update.instanceId])}`);
			}));
		}).then(noOp);
	}
	/**
	* @param markers only phishing (not spam) markers will be sent as event bus updates
	*/
	phishingMarkersUpdateReceived(markers) {
		for (const marker of markers) if (marker.status === PhishingMarkerStatus.INACTIVE) this.phishingMarkers.delete(marker.marker);
else this.phishingMarkers.add(marker.marker);
	}
	async createExternalUser(cleanedMailAddress, externalUserKdfType, externalUserPwKey, verifier) {
		const internalUserGroupKey = this.userFacade.getCurrentUserGroupKey();
		const internalMailGroupKey = await this.keyLoaderFacade.getCurrentSymGroupKey(this.userFacade.getGroupId(GroupType.Mail));
		const currentExternalUserGroupKey = freshVersioned(aes256RandomKey());
		const currentExternalMailGroupKey = freshVersioned(aes256RandomKey());
		const externalUserGroupInfoSessionKey = aes256RandomKey();
		const externalMailGroupInfoSessionKey = aes256RandomKey();
		const tutanotaPropertiesSessionKey = aes256RandomKey();
		const mailboxSessionKey = aes256RandomKey();
		const externalUserEncEntropy = encryptBytes(currentExternalUserGroupKey.object, random.generateRandomData(32));
		const internalUserEncGroupKey = encryptKeyWithVersionedKey(internalUserGroupKey, currentExternalUserGroupKey.object);
		const userGroupData = createCreateExternalUserGroupData({
			mailAddress: cleanedMailAddress,
			externalPwEncUserGroupKey: encryptKey(externalUserPwKey, currentExternalUserGroupKey.object),
			internalUserEncUserGroupKey: internalUserEncGroupKey.key,
			internalUserGroupKeyVersion: internalUserEncGroupKey.encryptingKeyVersion.toString()
		});
		const externalUserEncUserGroupInfoSessionKey = encryptKeyWithVersionedKey(currentExternalUserGroupKey, externalUserGroupInfoSessionKey);
		const externalUserEncMailGroupKey = encryptKeyWithVersionedKey(currentExternalUserGroupKey, currentExternalMailGroupKey.object);
		const externalUserEncTutanotaPropertiesSessionKey = encryptKeyWithVersionedKey(currentExternalUserGroupKey, tutanotaPropertiesSessionKey);
		const externalMailEncMailGroupInfoSessionKey = encryptKeyWithVersionedKey(currentExternalMailGroupKey, externalMailGroupInfoSessionKey);
		const externalMailEncMailBoxSessionKey = encryptKeyWithVersionedKey(currentExternalMailGroupKey, mailboxSessionKey);
		const internalMailEncUserGroupInfoSessionKey = encryptKeyWithVersionedKey(internalMailGroupKey, externalUserGroupInfoSessionKey);
		const internalMailEncMailGroupInfoSessionKey = encryptKeyWithVersionedKey(internalMailGroupKey, externalMailGroupInfoSessionKey);
		const externalUserData = createExternalUserData({
			verifier,
			userGroupData,
			kdfVersion: externalUserKdfType,
			externalUserEncEntropy,
			externalUserEncUserGroupInfoSessionKey: externalUserEncUserGroupInfoSessionKey.key,
			externalUserEncMailGroupKey: externalUserEncMailGroupKey.key,
			externalUserEncTutanotaPropertiesSessionKey: externalUserEncTutanotaPropertiesSessionKey.key,
			externalMailEncMailGroupInfoSessionKey: externalMailEncMailGroupInfoSessionKey.key,
			externalMailEncMailBoxSessionKey: externalMailEncMailBoxSessionKey.key,
			internalMailEncUserGroupInfoSessionKey: internalMailEncUserGroupInfoSessionKey.key,
			internalMailEncMailGroupInfoSessionKey: internalMailEncMailGroupInfoSessionKey.key,
			internalMailGroupKeyVersion: internalMailGroupKey.version.toString()
		});
		await this.serviceExecutor.post(ExternalUserService, externalUserData);
		return {
			currentExternalUserGroupKey,
			currentExternalMailGroupKey
		};
	}
	_getMailGroupIdForMailAddress(user, mailAddress) {
		return promiseFilter(getUserGroupMemberships(user, GroupType.Mail), (groupMembership) => {
			return this.entityClient.load(GroupTypeRef, groupMembership.group).then((mailGroup) => {
				if (mailGroup.user == null) return this.entityClient.load(GroupInfoTypeRef, groupMembership.groupInfo).then((mailGroupInfo) => {
					return contains(getEnabledMailAddressesForGroupInfo(mailGroupInfo), mailAddress);
				});
else if (isSameId(mailGroup.user, user._id)) return this.entityClient.load(GroupInfoTypeRef, user.userGroup.groupInfo).then((userGroupInfo) => {
					return contains(getEnabledMailAddressesForGroupInfo(userGroupInfo), mailAddress);
				});
else return false;
			});
		}).then((filteredMemberships) => {
			if (filteredMemberships.length === 1) return filteredMemberships[0].group;
else throw new NotFoundError("group for mail address not found " + mailAddress);
		});
	}
	async clearFolder(folderId) {
		const deleteMailData = createDeleteMailData({
			folder: folderId,
			mails: []
		});
		await this.serviceExecutor.delete(MailService, deleteMailData);
	}
	async unsubscribe(mailId, recipient, headers) {
		const postData = createListUnsubscribeData({
			mail: mailId,
			recipient,
			headers: headers.join("\n")
		});
		await this.serviceExecutor.post(ListUnsubscribeService, postData);
	}
	async loadAttachments(mail) {
		if (mail.attachments.length === 0) return [];
		const attachmentsListId = listIdPart(mail.attachments[0]);
		const attachmentElementIds = mail.attachments.map(elementIdPart);
		const bucketKey = mail.bucketKey;
		let ownerEncSessionKeyProvider;
		if (bucketKey) {
			const typeModel = await resolveTypeReference(FileTypeRef);
			const resolvedSessionKeys = await this.crypto.resolveWithBucketKey(assertNotNull(mail.bucketKey), mail, typeModel);
			ownerEncSessionKeyProvider = async (instanceElementId) => {
				const instanceSessionKey = assertNotNull(resolvedSessionKeys.instanceSessionKeys.find((instanceSessionKey$1) => instanceElementId === instanceSessionKey$1.instanceId));
				return {
					key: instanceSessionKey.symEncSessionKey,
					encryptingKeyVersion: parseKeyVersion(instanceSessionKey.symKeyVersion)
				};
			};
		}
		return await this.entityClient.loadMultiple(FileTypeRef, attachmentsListId, attachmentElementIds, ownerEncSessionKeyProvider);
	}
	/**
	* @param mail in case it is a mailDetailsBlob
	*/
	async loadMailDetailsBlob(mail) {
		if (mail.mailDetailsDraft != null) throw new ProgrammingError("not supported, must be mail details blob");
else {
			const mailDetailsBlobId = assertNotNull(mail.mailDetails);
			const mailDetailsBlobs = await this.entityClient.loadMultiple(MailDetailsBlobTypeRef, listIdPart(mailDetailsBlobId), [elementIdPart(mailDetailsBlobId)], this.keyProviderFromInstance(mail));
			if (mailDetailsBlobs.length === 0) throw new NotFoundError(`MailDetailsBlob ${mailDetailsBlobId}`);
			return mailDetailsBlobs[0].details;
		}
	}
	keyProviderFromInstance(mail) {
		return async () => ({
			key: assertNotNull(mail._ownerEncSessionKey),
			encryptingKeyVersion: parseKeyVersion(mail._ownerKeyVersion ?? "0")
		});
	}
	/**
	* @param mail in case it is a mailDetailsDraft
	*/
	async loadMailDetailsDraft(mail) {
		if (mail.mailDetailsDraft == null) throw new ProgrammingError("not supported, must be mail details draft");
else {
			const detailsDraftId = assertNotNull(mail.mailDetailsDraft);
			const mailDetailsDrafts = await this.entityClient.loadMultiple(MailDetailsDraftTypeRef, listIdPart(detailsDraftId), [elementIdPart(detailsDraftId)], this.keyProviderFromInstance(mail));
			if (mailDetailsDrafts.length === 0) throw new NotFoundError(`MailDetailsDraft ${detailsDraftId}`);
			return mailDetailsDrafts[0].details;
		}
	}
	/**
	* Create a label (aka MailSet aka {@link MailFolder} of kind {@link MailSetKind.LABEL}) for the group {@param mailGroupId}.
	*/
	async createLabel(mailGroupId, labelData) {
		const mailGroupKey = await this.keyLoaderFacade.getCurrentSymGroupKey(mailGroupId);
		const sk = aes256RandomKey();
		const ownerEncSessionKey = encryptKeyWithVersionedKey(mailGroupKey, sk);
		await this.serviceExecutor.post(ManageLabelService, createManageLabelServicePostIn({
			ownerGroup: mailGroupId,
			ownerEncSessionKey: ownerEncSessionKey.key,
			ownerKeyVersion: String(ownerEncSessionKey.encryptingKeyVersion),
			data: createManageLabelServiceLabelData({
				name: labelData.name,
				color: labelData.color
			})
		}), { sessionKey: sk });
	}
	async updateLabel(label, name, color) {
		if (name !== label.name || color != label.color) {
			label.name = name;
			label.color = color;
			await this.entityClient.update(label);
		}
	}
	async deleteLabel(label) {
		await this.serviceExecutor.delete(ManageLabelService, createManageLabelServiceDeleteIn({ label: label._id }));
	}
	async applyLabels(mails, addedLabels, removedLabels) {
		const postIn = createApplyLabelServicePostIn({
			mails: mails.map((mail) => mail._id),
			addedLabels: addedLabels.map((label) => label._id),
			removedLabels: removedLabels.map((label) => label._id)
		});
		await this.serviceExecutor.post(ApplyLabelService, postIn);
	}
};
function phishingMarkerValue(type, value) {
	return type + murmurHash(value.replace(/\s/g, ""));
}
function parseUrl(link) {
	try {
		return new URL(link);
	} catch (e) {
		return null;
	}
}
function getUrlDomain(link) {
	const url = parseUrl(link);
	return url && url.hostname;
}
function recipientToDraftRecipient(recipient) {
	return createDraftRecipient({
		name: recipient.name ?? "",
		mailAddress: recipient.address
	});
}
function recipientToEncryptedMailAddress(recipient) {
	return createEncryptedMailAddress({
		name: recipient.name ?? "",
		address: recipient.address
	});
}
function validateMimeTypesForAttachments(attachments) {
	const regex = /^\w+\/[\w.+-]+?(;\s*[\w.+-]+=([\w.+-]+|"[\w\s,.+-]+"))*$/g;
	for (const attachment of attachments) if (isDataFile(attachment) || isFileReference(attachment)) {
		if (!attachment.mimeType.match(regex)) throw new ProgrammingError(`${attachment.mimeType} is not a correctly formatted mimetype (${attachment.name})`);
	}
}

//#endregion
export { MailFacade };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFpbEZhY2FkZS1jaHVuay5qcyIsIm5hbWVzIjpbInVzZXJGYWNhZGU6IFVzZXJGYWNhZGUiLCJlbnRpdHlDbGllbnQ6IEVudGl0eUNsaWVudCIsImNyeXB0bzogQ3J5cHRvRmFjYWRlIiwic2VydmljZUV4ZWN1dG9yOiBJU2VydmljZUV4ZWN1dG9yIiwiYmxvYkZhY2FkZTogQmxvYkZhY2FkZSIsImZpbGVBcHA6IE5hdGl2ZUZpbGVBcHAiLCJsb2dpbkZhY2FkZTogTG9naW5GYWNhZGUiLCJrZXlMb2FkZXJGYWNhZGU6IEtleUxvYWRlckZhY2FkZSIsInB1YmxpY0tleVByb3ZpZGVyOiBQdWJsaWNLZXlQcm92aWRlciIsIm5hbWU6IHN0cmluZyIsInBhcmVudDogSWRUdXBsZSB8IG51bGwiLCJvd25lckdyb3VwSWQ6IElkIiwiZm9sZGVyOiBNYWlsRm9sZGVyIiwibmV3TmFtZTogc3RyaW5nIiwibmV3UGFyZW50OiBJZFR1cGxlIHwgbnVsbCIsIm1haWxzOiBJZFR1cGxlW10iLCJzb3VyY2VGb2xkZXI6IElkVHVwbGUiLCJ0YXJnZXRGb2xkZXI6IElkVHVwbGUiLCJtYWlsOiBNYWlsIiwicmVwb3J0VHlwZTogTWFpbFJlcG9ydFR5cGUiLCJtYWlsU2Vzc2lvbktleTogQWVzMTI4S2V5IiwiZm9sZGVyOiBJZFR1cGxlIiwicHJvdmlkZWRGaWxlczogQXR0YWNobWVudHMgfCBudWxsIiwiZXhpc3RpbmdGaWxlSWRzOiBJZFR1cGxlW10iLCJyZW1vdmVkQXR0YWNobWVudElkczogSWRUdXBsZVtdIiwiZXhpc3RpbmdGaWxlSWRzOiBSZWFkb25seUFycmF5PElkVHVwbGU+Iiwic2VuZGVyTWFpbEdyb3VwSWQ6IElkIiwibWFpbEdyb3VwS2V5OiBWZXJzaW9uZWRLZXkiLCJyZWZlcmVuY2VUb2tlbnM6IEFycmF5PEJsb2JSZWZlcmVuY2VUb2tlbldyYXBwZXI+IiwicmVmZXJlbmNlVG9rZW5zOiBCbG9iUmVmZXJlbmNlVG9rZW5XcmFwcGVyW10iLCJmaWxlU2Vzc2lvbktleTogQWVzS2V5IiwicHJvdmlkZWRGaWxlOiBEYXRhRmlsZSB8IEZpbGVSZWZlcmVuY2UiLCJkcmFmdDogTWFpbCIsInJlY2lwaWVudHM6IEFycmF5PFJlY2lwaWVudD4iLCJsYW5ndWFnZTogc3RyaW5nIiwib3duZXJFbmNTZXNzaW9uS2V5UHJvdmlkZXI6IE93bmVyRW5jU2Vzc2lvbktleVByb3ZpZGVyIiwibGlua3M6IEFycmF5PHtcblx0XHRcdGhyZWY6IHN0cmluZ1xuXHRcdFx0aW5uZXJIVE1MOiBzdHJpbmdcblx0XHR9PiIsImlkOiBJZFR1cGxlIiwiZ3JvdXBJZDogSWQiLCJ1bnJlYWRNYWlsczogbnVtYmVyIiwidHlwZTogUmVwb3J0ZWRNYWlsRmllbGRUeXBlIiwidmFsdWU6IHN0cmluZyIsImJ1Y2tldEtleTogQWVzS2V5Iiwic2VuZERyYWZ0RGF0YTogU2VuZERyYWZ0RGF0YSIsIm5vdEZvdW5kUmVjaXBpZW50czogc3RyaW5nW10iLCJjb250YWN0OiBDb250YWN0IHwgbnVsbCIsInJlY2lwaWVudE1haWxBZGRyZXNzOiBzdHJpbmciLCJleHRlcm5hbFVzZXJLZGZUeXBlOiBLZGZUeXBlIiwiZXh0ZXJuYWxVc2VyUHdLZXk6IEFlc0tleSIsInZlcmlmaWVyOiBVaW50OEFycmF5IiwiZXh0ZXJuYWxVc2VyUmVmZXJlbmNlOiBFeHRlcm5hbFVzZXJSZWZlcmVuY2UiLCJtYWlsQWRkcmVzczogc3RyaW5nIiwiZGF0YTogRW50aXR5VXBkYXRlW10iLCJtYXJrZXJzOiBSZXBvcnRlZE1haWxGaWVsZE1hcmtlcltdIiwiY2xlYW5lZE1haWxBZGRyZXNzOiBzdHJpbmciLCJ1c2VyOiBVc2VyIiwiZm9sZGVySWQ6IElkVHVwbGUiLCJtYWlsSWQ6IElkVHVwbGUiLCJyZWNpcGllbnQ6IHN0cmluZyIsImhlYWRlcnM6IHN0cmluZ1tdIiwib3duZXJFbmNTZXNzaW9uS2V5UHJvdmlkZXI6IE93bmVyRW5jU2Vzc2lvbktleVByb3ZpZGVyIHwgdW5kZWZpbmVkIiwiaW5zdGFuY2VFbGVtZW50SWQ6IElkIiwiaW5zdGFuY2VTZXNzaW9uS2V5IiwibWFpbEdyb3VwSWQ6IElkIiwibGFiZWxEYXRhOiB7IG5hbWU6IHN0cmluZzsgY29sb3I6IHN0cmluZyB9IiwibGFiZWw6IE1haWxGb2xkZXIiLCJjb2xvcjogc3RyaW5nIiwibWFpbHM6IHJlYWRvbmx5IE1haWxbXSIsImFkZGVkTGFiZWxzOiByZWFkb25seSBNYWlsRm9sZGVyW10iLCJyZW1vdmVkTGFiZWxzOiByZWFkb25seSBNYWlsRm9sZGVyW10iLCJsaW5rOiBzdHJpbmciLCJyZWNpcGllbnQ6IFBhcnRpYWxSZWNpcGllbnQiLCJhdHRhY2htZW50czogQXR0YWNobWVudHMiXSwic291cmNlcyI6WyIuLi9zcmMvY29tbW9uL2FwaS93b3JrZXIvZmFjYWRlcy9sYXp5L01haWxGYWNhZGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBDcnlwdG9GYWNhZGUgfSBmcm9tIFwiLi4vLi4vY3J5cHRvL0NyeXB0b0ZhY2FkZS5qc1wiXG5pbXBvcnQge1xuXHRBcHBseUxhYmVsU2VydmljZSxcblx0RHJhZnRTZXJ2aWNlLFxuXHRFeHRlcm5hbFVzZXJTZXJ2aWNlLFxuXHRMaXN0VW5zdWJzY3JpYmVTZXJ2aWNlLFxuXHRNYWlsRm9sZGVyU2VydmljZSxcblx0TWFpbFNlcnZpY2UsXG5cdE1hbmFnZUxhYmVsU2VydmljZSxcblx0TW92ZU1haWxTZXJ2aWNlLFxuXHRSZXBvcnRNYWlsU2VydmljZSxcblx0U2VuZERyYWZ0U2VydmljZSxcbn0gZnJvbSBcIi4uLy4uLy4uL2VudGl0aWVzL3R1dGFub3RhL1NlcnZpY2VzLmpzXCJcbmltcG9ydCB7XG5cdEFyY2hpdmVEYXRhVHlwZSxcblx0Q29udmVyc2F0aW9uVHlwZSxcblx0Q291bnRlclR5cGUsXG5cdENyeXB0b1Byb3RvY29sVmVyc2lvbixcblx0REVGQVVMVF9LREZfVFlQRSxcblx0RW5jcnlwdGlvbkF1dGhTdGF0dXMsXG5cdEdyb3VwVHlwZSxcblx0S2RmVHlwZSxcblx0TWFpbEF1dGhlbnRpY2F0aW9uU3RhdHVzLFxuXHRNYWlsTWV0aG9kLFxuXHRNYWlsUmVwb3J0VHlwZSxcblx0T3BlcmF0aW9uVHlwZSxcblx0UGhpc2hpbmdNYXJrZXJTdGF0dXMsXG5cdFB1YmxpY0tleUlkZW50aWZpZXJUeXBlLFxuXHRSZXBvcnRlZE1haWxGaWVsZFR5cGUsXG5cdFNZU1RFTV9HUk9VUF9NQUlMX0FERFJFU1MsXG59IGZyb20gXCIuLi8uLi8uLi9jb21tb24vVHV0YW5vdGFDb25zdGFudHMuanNcIlxuaW1wb3J0IHtcblx0Q29udGFjdCxcblx0Y3JlYXRlQXBwbHlMYWJlbFNlcnZpY2VQb3N0SW4sXG5cdGNyZWF0ZUF0dGFjaG1lbnRLZXlEYXRhLFxuXHRjcmVhdGVDcmVhdGVFeHRlcm5hbFVzZXJHcm91cERhdGEsXG5cdGNyZWF0ZUNyZWF0ZU1haWxGb2xkZXJEYXRhLFxuXHRjcmVhdGVEZWxldGVNYWlsRGF0YSxcblx0Y3JlYXRlRGVsZXRlTWFpbEZvbGRlckRhdGEsXG5cdGNyZWF0ZURyYWZ0QXR0YWNobWVudCxcblx0Y3JlYXRlRHJhZnRDcmVhdGVEYXRhLFxuXHRjcmVhdGVEcmFmdERhdGEsXG5cdGNyZWF0ZURyYWZ0UmVjaXBpZW50LFxuXHRjcmVhdGVEcmFmdFVwZGF0ZURhdGEsXG5cdGNyZWF0ZUVuY3J5cHRlZE1haWxBZGRyZXNzLFxuXHRjcmVhdGVFeHRlcm5hbFVzZXJEYXRhLFxuXHRjcmVhdGVMaXN0VW5zdWJzY3JpYmVEYXRhLFxuXHRjcmVhdGVNYW5hZ2VMYWJlbFNlcnZpY2VEZWxldGVJbixcblx0Y3JlYXRlTWFuYWdlTGFiZWxTZXJ2aWNlTGFiZWxEYXRhLFxuXHRjcmVhdGVNYW5hZ2VMYWJlbFNlcnZpY2VQb3N0SW4sXG5cdGNyZWF0ZU1vdmVNYWlsRGF0YSxcblx0Y3JlYXRlTmV3RHJhZnRBdHRhY2htZW50LFxuXHRjcmVhdGVSZXBvcnRNYWlsUG9zdERhdGEsXG5cdGNyZWF0ZVNlY3VyZUV4dGVybmFsUmVjaXBpZW50S2V5RGF0YSxcblx0Y3JlYXRlU2VuZERyYWZ0RGF0YSxcblx0Y3JlYXRlVXBkYXRlTWFpbEZvbGRlckRhdGEsXG5cdERyYWZ0QXR0YWNobWVudCxcblx0RHJhZnRSZWNpcGllbnQsXG5cdEVuY3J5cHRlZE1haWxBZGRyZXNzLFxuXHRGaWxlIGFzIFR1dGFub3RhRmlsZSxcblx0RmlsZVR5cGVSZWYsXG5cdEludGVybmFsUmVjaXBpZW50S2V5RGF0YSxcblx0SW50ZXJuYWxSZWNpcGllbnRLZXlEYXRhVHlwZVJlZixcblx0TWFpbCxcblx0TWFpbERldGFpbHMsXG5cdE1haWxEZXRhaWxzQmxvYlR5cGVSZWYsXG5cdE1haWxEZXRhaWxzRHJhZnRUeXBlUmVmLFxuXHRNYWlsRm9sZGVyLFxuXHRNYWlsVHlwZVJlZixcblx0UmVwb3J0ZWRNYWlsRmllbGRNYXJrZXIsXG5cdFNlbmREcmFmdERhdGEsXG5cdFN5bUVuY0ludGVybmFsUmVjaXBpZW50S2V5RGF0YSxcblx0U3ltRW5jSW50ZXJuYWxSZWNpcGllbnRLZXlEYXRhVHlwZVJlZixcblx0VHV0YW5vdGFQcm9wZXJ0aWVzVHlwZVJlZixcbn0gZnJvbSBcIi4uLy4uLy4uL2VudGl0aWVzL3R1dGFub3RhL1R5cGVSZWZzLmpzXCJcbmltcG9ydCB7IFJlY2lwaWVudHNOb3RGb3VuZEVycm9yIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9lcnJvci9SZWNpcGllbnRzTm90Rm91bmRFcnJvci5qc1wiXG5pbXBvcnQgeyBOb3RGb3VuZEVycm9yIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9lcnJvci9SZXN0RXJyb3IuanNcIlxuaW1wb3J0IHR5cGUgeyBFbnRpdHlVcGRhdGUsIEV4dGVybmFsVXNlclJlZmVyZW5jZSwgVXNlciB9IGZyb20gXCIuLi8uLi8uLi9lbnRpdGllcy9zeXMvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHtcblx0QmxvYlJlZmVyZW5jZVRva2VuV3JhcHBlcixcblx0RXh0ZXJuYWxVc2VyUmVmZXJlbmNlVHlwZVJlZixcblx0R3JvdXBJbmZvVHlwZVJlZixcblx0R3JvdXBSb290VHlwZVJlZixcblx0R3JvdXBUeXBlUmVmLFxuXHRVc2VyVHlwZVJlZixcbn0gZnJvbSBcIi4uLy4uLy4uL2VudGl0aWVzL3N5cy9UeXBlUmVmcy5qc1wiXG5pbXBvcnQge1xuXHRhZGRyZXNzRG9tYWluLFxuXHRhc3NlcnROb3ROdWxsLFxuXHRieXRlTGVuZ3RoLFxuXHRjb250YWlucyxcblx0ZGVmZXIsXG5cdGZyZXNoVmVyc2lvbmVkLFxuXHRpc0VtcHR5LFxuXHRpc05vdE51bGwsXG5cdGlzU2FtZVR5cGVSZWYsXG5cdGlzU2FtZVR5cGVSZWZCeUF0dHIsXG5cdG5vT3AsXG5cdG9mQ2xhc3MsXG5cdHByb21pc2VGaWx0ZXIsXG5cdHByb21pc2VNYXAsXG5cdFZlcnNpb25lZCxcbn0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5pbXBvcnQgeyBCbG9iRmFjYWRlIH0gZnJvbSBcIi4vQmxvYkZhY2FkZS5qc1wiXG5pbXBvcnQgeyBhc3NlcnRXb3JrZXJPck5vZGUsIGlzQXBwLCBpc0Rlc2t0b3AgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL0Vudi5qc1wiXG5pbXBvcnQgeyBFbnRpdHlDbGllbnQgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL0VudGl0eUNsaWVudC5qc1wiXG5pbXBvcnQgeyBnZXRFbmFibGVkTWFpbEFkZHJlc3Nlc0Zvckdyb3VwSW5mbywgZ2V0VXNlckdyb3VwTWVtYmVyc2hpcHMgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL3V0aWxzL0dyb3VwVXRpbHMuanNcIlxuaW1wb3J0IHsgY29udGFpbnNJZCwgZWxlbWVudElkUGFydCwgZ2V0RWxlbWVudElkLCBnZXRMZXRJZCwgaXNTYW1lSWQsIGxpc3RJZFBhcnQsIHN0cmluZ1RvQ3VzdG9tSWQgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL3V0aWxzL0VudGl0eVV0aWxzLmpzXCJcbmltcG9ydCB7IGh0bWxUb1RleHQgfSBmcm9tIFwiLi4vLi4vc2VhcmNoL0luZGV4VXRpbHMuanNcIlxuaW1wb3J0IHsgTWFpbEJvZHlUb29MYXJnZUVycm9yIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9lcnJvci9NYWlsQm9keVRvb0xhcmdlRXJyb3IuanNcIlxuaW1wb3J0IHsgVU5DT01QUkVTU0VEX01BWF9TSVpFIH0gZnJvbSBcIi4uLy4uL0NvbXByZXNzaW9uLmpzXCJcbmltcG9ydCB7XG5cdEFlczEyOEtleSxcblx0YWVzMjU2UmFuZG9tS2V5LFxuXHRBZXNLZXksXG5cdGJpdEFycmF5VG9VaW50OEFycmF5LFxuXHRjcmVhdGVBdXRoVmVyaWZpZXIsXG5cdGRlY3J5cHRLZXksXG5cdGVuY3J5cHRLZXksXG5cdGdlbmVyYXRlUmFuZG9tU2FsdCxcblx0a2V5VG9VaW50OEFycmF5LFxuXHRtdXJtdXJIYXNoLFxuXHRyYW5kb20sXG5cdHNoYTI1Nkhhc2gsXG59IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtY3J5cHRvXCJcbmltcG9ydCB7IERhdGFGaWxlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9EYXRhRmlsZS5qc1wiXG5pbXBvcnQgeyBGaWxlUmVmZXJlbmNlLCBpc0RhdGFGaWxlLCBpc0ZpbGVSZWZlcmVuY2UgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL3V0aWxzL0ZpbGVVdGlscy5qc1wiXG5pbXBvcnQgeyBDb3VudGVyU2VydmljZSB9IGZyb20gXCIuLi8uLi8uLi9lbnRpdGllcy9tb25pdG9yL1NlcnZpY2VzLmpzXCJcbmltcG9ydCB7IElTZXJ2aWNlRXhlY3V0b3IgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL1NlcnZpY2VSZXF1ZXN0LmpzXCJcbmltcG9ydCB7IGNyZWF0ZVdyaXRlQ291bnRlckRhdGEgfSBmcm9tIFwiLi4vLi4vLi4vZW50aXRpZXMvbW9uaXRvci9UeXBlUmVmcy5qc1wiXG5pbXBvcnQgeyBVc2VyRmFjYWRlIH0gZnJvbSBcIi4uL1VzZXJGYWNhZGUuanNcIlxuaW1wb3J0IHsgUGFydGlhbFJlY2lwaWVudCwgUmVjaXBpZW50LCBSZWNpcGllbnRMaXN0LCBSZWNpcGllbnRUeXBlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9yZWNpcGllbnRzL1JlY2lwaWVudC5qc1wiXG5pbXBvcnQgeyBOYXRpdmVGaWxlQXBwIH0gZnJvbSBcIi4uLy4uLy4uLy4uL25hdGl2ZS9jb21tb24vRmlsZUFwcC5qc1wiXG5pbXBvcnQgeyBMb2dpbkZhY2FkZSB9IGZyb20gXCIuLi9Mb2dpbkZhY2FkZS5qc1wiXG5pbXBvcnQgeyBQcm9ncmFtbWluZ0Vycm9yIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9lcnJvci9Qcm9ncmFtbWluZ0Vycm9yLmpzXCJcbmltcG9ydCB7IE93bmVyRW5jU2Vzc2lvbktleVByb3ZpZGVyIH0gZnJvbSBcIi4uLy4uL3Jlc3QvRW50aXR5UmVzdENsaWVudC5qc1wiXG5pbXBvcnQgeyByZXNvbHZlVHlwZVJlZmVyZW5jZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vRW50aXR5RnVuY3Rpb25zLmpzXCJcbmltcG9ydCB7IEtleUxvYWRlckZhY2FkZSwgcGFyc2VLZXlWZXJzaW9uIH0gZnJvbSBcIi4uL0tleUxvYWRlckZhY2FkZS5qc1wiXG5pbXBvcnQgeyBlbmNyeXB0Qnl0ZXMsIGVuY3J5cHRLZXlXaXRoVmVyc2lvbmVkS2V5LCBlbmNyeXB0U3RyaW5nLCBWZXJzaW9uZWRFbmNyeXB0ZWRLZXksIFZlcnNpb25lZEtleSB9IGZyb20gXCIuLi8uLi9jcnlwdG8vQ3J5cHRvV3JhcHBlci5qc1wiXG5pbXBvcnQgeyBQdWJsaWNLZXlQcm92aWRlciwgUHVibGljS2V5cyB9IGZyb20gXCIuLi9QdWJsaWNLZXlQcm92aWRlci5qc1wiXG5cbmFzc2VydFdvcmtlck9yTm9kZSgpXG50eXBlIEF0dGFjaG1lbnRzID0gUmVhZG9ubHlBcnJheTxUdXRhbm90YUZpbGUgfCBEYXRhRmlsZSB8IEZpbGVSZWZlcmVuY2U+XG5cbmludGVyZmFjZSBDcmVhdGVEcmFmdFBhcmFtcyB7XG5cdHN1YmplY3Q6IHN0cmluZ1xuXHRib2R5VGV4dDogc3RyaW5nXG5cdHNlbmRlck1haWxBZGRyZXNzOiBzdHJpbmdcblx0c2VuZGVyTmFtZTogc3RyaW5nXG5cdHRvUmVjaXBpZW50czogUmVjaXBpZW50TGlzdFxuXHRjY1JlY2lwaWVudHM6IFJlY2lwaWVudExpc3Rcblx0YmNjUmVjaXBpZW50czogUmVjaXBpZW50TGlzdFxuXHRjb252ZXJzYXRpb25UeXBlOiBDb252ZXJzYXRpb25UeXBlXG5cdHByZXZpb3VzTWVzc2FnZUlkOiBJZCB8IG51bGxcblx0YXR0YWNobWVudHM6IEF0dGFjaG1lbnRzIHwgbnVsbFxuXHRjb25maWRlbnRpYWw6IGJvb2xlYW5cblx0cmVwbHlUb3M6IFJlY2lwaWVudExpc3Rcblx0bWV0aG9kOiBNYWlsTWV0aG9kXG59XG5cbmludGVyZmFjZSBVcGRhdGVEcmFmdFBhcmFtcyB7XG5cdHN1YmplY3Q6IHN0cmluZ1xuXHRib2R5OiBzdHJpbmdcblx0c2VuZGVyTWFpbEFkZHJlc3M6IHN0cmluZ1xuXHRzZW5kZXJOYW1lOiBzdHJpbmdcblx0dG9SZWNpcGllbnRzOiBSZWNpcGllbnRMaXN0XG5cdGNjUmVjaXBpZW50czogUmVjaXBpZW50TGlzdFxuXHRiY2NSZWNpcGllbnRzOiBSZWNpcGllbnRMaXN0XG5cdGF0dGFjaG1lbnRzOiBBdHRhY2htZW50cyB8IG51bGxcblx0Y29uZmlkZW50aWFsOiBib29sZWFuXG5cdGRyYWZ0OiBNYWlsXG59XG5cbmV4cG9ydCBjbGFzcyBNYWlsRmFjYWRlIHtcblx0cHJpdmF0ZSBwaGlzaGluZ01hcmtlcnM6IFNldDxzdHJpbmc+ID0gbmV3IFNldCgpXG5cdHByaXZhdGUgZGVmZXJyZWREcmFmdElkOiBJZFR1cGxlIHwgbnVsbCA9IG51bGwgLy8gdGhlIG1haWwgaWQgb2YgdGhlIGRyYWZ0IHRoYXQgd2UgYXJlIHdhaXRpbmcgZm9yIHRvIGJlIHVwZGF0ZWQgdmlhIHdlYnNvY2tldFxuXHRwcml2YXRlIGRlZmVycmVkRHJhZnRVcGRhdGU6IFJlY29yZDxzdHJpbmcsIGFueT4gfCBudWxsID0gbnVsbCAvLyB0aGlzIGRlZmVycmVkIHByb21pc2UgaXMgcmVzb2x2ZWQgYXMgc29vbiBhcyB0aGUgdXBkYXRlIG9mIHRoZSBkcmFmdCBpcyByZWNlaXZlZFxuXG5cdGNvbnN0cnVjdG9yKFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgdXNlckZhY2FkZTogVXNlckZhY2FkZSxcblx0XHRwcml2YXRlIHJlYWRvbmx5IGVudGl0eUNsaWVudDogRW50aXR5Q2xpZW50LFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgY3J5cHRvOiBDcnlwdG9GYWNhZGUsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBzZXJ2aWNlRXhlY3V0b3I6IElTZXJ2aWNlRXhlY3V0b3IsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBibG9iRmFjYWRlOiBCbG9iRmFjYWRlLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgZmlsZUFwcDogTmF0aXZlRmlsZUFwcCxcblx0XHRwcml2YXRlIHJlYWRvbmx5IGxvZ2luRmFjYWRlOiBMb2dpbkZhY2FkZSxcblx0XHRwcml2YXRlIHJlYWRvbmx5IGtleUxvYWRlckZhY2FkZTogS2V5TG9hZGVyRmFjYWRlLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgcHVibGljS2V5UHJvdmlkZXI6IFB1YmxpY0tleVByb3ZpZGVyLFxuXHQpIHt9XG5cblx0YXN5bmMgY3JlYXRlTWFpbEZvbGRlcihuYW1lOiBzdHJpbmcsIHBhcmVudDogSWRUdXBsZSB8IG51bGwsIG93bmVyR3JvdXBJZDogSWQpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCBtYWlsR3JvdXBLZXkgPSBhd2FpdCB0aGlzLmtleUxvYWRlckZhY2FkZS5nZXRDdXJyZW50U3ltR3JvdXBLZXkob3duZXJHcm91cElkKVxuXG5cdFx0Y29uc3Qgc2sgPSBhZXMyNTZSYW5kb21LZXkoKVxuXHRcdGNvbnN0IG93bmVyRW5jU2Vzc2lvbktleSA9IGVuY3J5cHRLZXlXaXRoVmVyc2lvbmVkS2V5KG1haWxHcm91cEtleSwgc2spXG5cdFx0Y29uc3QgbmV3Rm9sZGVyID0gY3JlYXRlQ3JlYXRlTWFpbEZvbGRlckRhdGEoe1xuXHRcdFx0Zm9sZGVyTmFtZTogbmFtZSxcblx0XHRcdHBhcmVudEZvbGRlcjogcGFyZW50LFxuXHRcdFx0b3duZXJFbmNTZXNzaW9uS2V5OiBvd25lckVuY1Nlc3Npb25LZXkua2V5LFxuXHRcdFx0b3duZXJHcm91cDogb3duZXJHcm91cElkLFxuXHRcdFx0b3duZXJLZXlWZXJzaW9uOiBvd25lckVuY1Nlc3Npb25LZXkuZW5jcnlwdGluZ0tleVZlcnNpb24udG9TdHJpbmcoKSxcblx0XHR9KVxuXHRcdGF3YWl0IHRoaXMuc2VydmljZUV4ZWN1dG9yLnBvc3QoTWFpbEZvbGRlclNlcnZpY2UsIG5ld0ZvbGRlciwgeyBzZXNzaW9uS2V5OiBzayB9KVxuXHR9XG5cblx0LyoqXG5cdCAqIFVwZGF0ZXMgYSBtYWlsIGZvbGRlcidzIG5hbWUsIGlmIG5lZWRlZFxuXHQgKiBAcGFyYW0gbmV3TmFtZSAtIGlmIHRoaXMgaXMgdGhlIHNhbWUgYXMgdGhlIGZvbGRlcidzIGN1cnJlbnQgbmFtZSwgbm90aGluZyBpcyBkb25lXG5cdCAqL1xuXHRhc3luYyB1cGRhdGVNYWlsRm9sZGVyTmFtZShmb2xkZXI6IE1haWxGb2xkZXIsIG5ld05hbWU6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGlmIChuZXdOYW1lICE9PSBmb2xkZXIubmFtZSkge1xuXHRcdFx0Zm9sZGVyLm5hbWUgPSBuZXdOYW1lXG5cdFx0XHRhd2FpdCB0aGlzLmVudGl0eUNsaWVudC51cGRhdGUoZm9sZGVyKVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBVcGRhdGVzIGEgbWFpbCBmb2xkZXIncyBwYXJlbnQsIGlmIG5lZWRlZFxuXHQgKiBAcGFyYW0gbmV3UGFyZW50IC0gaWYgdGhpcyBpcyB0aGUgc2FtZSBhcyB0aGUgZm9sZGVyJ3MgY3VycmVudCBwYXJlbnQsIG5vdGhpbmcgaXMgZG9uZVxuXHQgKi9cblx0YXN5bmMgdXBkYXRlTWFpbEZvbGRlclBhcmVudChmb2xkZXI6IE1haWxGb2xkZXIsIG5ld1BhcmVudDogSWRUdXBsZSB8IG51bGwpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRpZiAoXG5cdFx0XHQoZm9sZGVyLnBhcmVudEZvbGRlciAhPSBudWxsICYmIG5ld1BhcmVudCAhPSBudWxsICYmICFpc1NhbWVJZChmb2xkZXIucGFyZW50Rm9sZGVyLCBuZXdQYXJlbnQpKSB8fFxuXHRcdFx0KGZvbGRlci5wYXJlbnRGb2xkZXIgPT0gbnVsbCAmJiBuZXdQYXJlbnQgIT0gbnVsbCkgfHxcblx0XHRcdChmb2xkZXIucGFyZW50Rm9sZGVyICE9IG51bGwgJiYgbmV3UGFyZW50ID09IG51bGwpXG5cdFx0KSB7XG5cdFx0XHRjb25zdCB1cGRhdGVGb2xkZXIgPSBjcmVhdGVVcGRhdGVNYWlsRm9sZGVyRGF0YSh7XG5cdFx0XHRcdGZvbGRlcjogZm9sZGVyLl9pZCxcblx0XHRcdFx0bmV3UGFyZW50OiBuZXdQYXJlbnQsXG5cdFx0XHR9KVxuXHRcdFx0YXdhaXQgdGhpcy5zZXJ2aWNlRXhlY3V0b3IucHV0KE1haWxGb2xkZXJTZXJ2aWNlLCB1cGRhdGVGb2xkZXIpXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBkcmFmdCBtYWlsLlxuXHQgKiBAcGFyYW0gYm9keVRleHQgVGhlIGJvZHlUZXh0IG9mIHRoZSBtYWlsIGZvcm1hdHRlZCBhcyBIVE1MLlxuXHQgKiBAcGFyYW0gcHJldmlvdXNNZXNzYWdlSWQgVGhlIGlkIG9mIHRoZSBtZXNzYWdlIHRoYXQgdGhpcyBtYWlsIGlzIGEgcmVwbHkgb3IgZm9yd2FyZCB0by4gTnVsbCBpZiB0aGlzIGlzIGEgbmV3IG1haWwuXG5cdCAqIEBwYXJhbSBhdHRhY2htZW50cyBUaGUgZmlsZXMgdGhhdCBzaGFsbCBiZSBhdHRhY2hlZCB0byB0aGlzIG1haWwgb3IgbnVsbCBpZiBubyBmaWxlcyBzaGFsbCBiZSBhdHRhY2hlZC4gVHV0YW5vdGFGaWxlcyBhcmUgYWxyZWFkeSBleGlzaW5nIG9uIHRoZSBzZXJ2ZXIsIERhdGFGaWxlcyBhcmUgZmlsZXMgZnJvbSB0aGUgbG9jYWwgZmlsZSBzeXN0ZW0uIEF0dGVudGlvbjogdGhlIERhdGFGaWxlIGNsYXNzIGluZm9ybWF0aW9uIGlzIGxvc3Rcblx0ICogQHBhcmFtIGNvbmZpZGVudGlhbCBUcnVlIGlmIHRoZSBtYWlsIHNoYWxsIGJlIHNlbnQgZW5kLXRvLWVuZCBlbmNyeXB0ZWQsIGZhbHNlIG90aGVyd2lzZS5cblx0ICovXG5cdGFzeW5jIGNyZWF0ZURyYWZ0KHtcblx0XHRzdWJqZWN0LFxuXHRcdGJvZHlUZXh0LFxuXHRcdHNlbmRlck1haWxBZGRyZXNzLFxuXHRcdHNlbmRlck5hbWUsXG5cdFx0dG9SZWNpcGllbnRzLFxuXHRcdGNjUmVjaXBpZW50cyxcblx0XHRiY2NSZWNpcGllbnRzLFxuXHRcdGNvbnZlcnNhdGlvblR5cGUsXG5cdFx0cHJldmlvdXNNZXNzYWdlSWQsXG5cdFx0YXR0YWNobWVudHMsXG5cdFx0Y29uZmlkZW50aWFsLFxuXHRcdHJlcGx5VG9zLFxuXHRcdG1ldGhvZCxcblx0fTogQ3JlYXRlRHJhZnRQYXJhbXMpOiBQcm9taXNlPE1haWw+IHtcblx0XHRpZiAoYnl0ZUxlbmd0aChib2R5VGV4dCkgPiBVTkNPTVBSRVNTRURfTUFYX1NJWkUpIHtcblx0XHRcdHRocm93IG5ldyBNYWlsQm9keVRvb0xhcmdlRXJyb3IoYENhbid0IHVwZGF0ZSBkcmFmdCwgbWFpbCBib2R5IHRvbyBsYXJnZSAoJHtieXRlTGVuZ3RoKGJvZHlUZXh0KX0pYClcblx0XHR9XG5cblx0XHRjb25zdCBzZW5kZXJNYWlsR3JvdXBJZCA9IGF3YWl0IHRoaXMuX2dldE1haWxHcm91cElkRm9yTWFpbEFkZHJlc3ModGhpcy51c2VyRmFjYWRlLmdldExvZ2dlZEluVXNlcigpLCBzZW5kZXJNYWlsQWRkcmVzcylcblx0XHRjb25zdCBtYWlsR3JvdXBLZXkgPSBhd2FpdCB0aGlzLmtleUxvYWRlckZhY2FkZS5nZXRDdXJyZW50U3ltR3JvdXBLZXkoc2VuZGVyTWFpbEdyb3VwSWQpXG5cblx0XHRjb25zdCBzayA9IGFlczI1NlJhbmRvbUtleSgpXG5cdFx0Y29uc3Qgb3duZXJFbmNTZXNzaW9uS2V5ID0gZW5jcnlwdEtleVdpdGhWZXJzaW9uZWRLZXkobWFpbEdyb3VwS2V5LCBzaylcblx0XHRjb25zdCBzZXJ2aWNlID0gY3JlYXRlRHJhZnRDcmVhdGVEYXRhKHtcblx0XHRcdHByZXZpb3VzTWVzc2FnZUlkOiBwcmV2aW91c01lc3NhZ2VJZCxcblx0XHRcdGNvbnZlcnNhdGlvblR5cGU6IGNvbnZlcnNhdGlvblR5cGUsXG5cdFx0XHRvd25lckVuY1Nlc3Npb25LZXk6IG93bmVyRW5jU2Vzc2lvbktleS5rZXksXG5cdFx0XHRkcmFmdERhdGE6IGNyZWF0ZURyYWZ0RGF0YSh7XG5cdFx0XHRcdHN1YmplY3QsXG5cdFx0XHRcdGNvbXByZXNzZWRCb2R5VGV4dDogYm9keVRleHQsXG5cdFx0XHRcdHNlbmRlck1haWxBZGRyZXNzLFxuXHRcdFx0XHRzZW5kZXJOYW1lLFxuXHRcdFx0XHRjb25maWRlbnRpYWwsXG5cdFx0XHRcdG1ldGhvZCxcblx0XHRcdFx0dG9SZWNpcGllbnRzOiB0b1JlY2lwaWVudHMubWFwKHJlY2lwaWVudFRvRHJhZnRSZWNpcGllbnQpLFxuXHRcdFx0XHRjY1JlY2lwaWVudHM6IGNjUmVjaXBpZW50cy5tYXAocmVjaXBpZW50VG9EcmFmdFJlY2lwaWVudCksXG5cdFx0XHRcdGJjY1JlY2lwaWVudHM6IGJjY1JlY2lwaWVudHMubWFwKHJlY2lwaWVudFRvRHJhZnRSZWNpcGllbnQpLFxuXHRcdFx0XHRyZXBseVRvczogcmVwbHlUb3MubWFwKHJlY2lwaWVudFRvRW5jcnlwdGVkTWFpbEFkZHJlc3MpLFxuXHRcdFx0XHRhZGRlZEF0dGFjaG1lbnRzOiBhd2FpdCB0aGlzLl9jcmVhdGVBZGRlZEF0dGFjaG1lbnRzKGF0dGFjaG1lbnRzLCBbXSwgc2VuZGVyTWFpbEdyb3VwSWQsIG1haWxHcm91cEtleSksXG5cdFx0XHRcdGJvZHlUZXh0OiBcIlwiLFxuXHRcdFx0XHRyZW1vdmVkQXR0YWNobWVudHM6IFtdLFxuXHRcdFx0fSksXG5cdFx0XHRvd25lcktleVZlcnNpb246IG93bmVyRW5jU2Vzc2lvbktleS5lbmNyeXB0aW5nS2V5VmVyc2lvbi50b1N0cmluZygpLFxuXHRcdH0pXG5cdFx0Y29uc3QgY3JlYXRlRHJhZnRSZXR1cm4gPSBhd2FpdCB0aGlzLnNlcnZpY2VFeGVjdXRvci5wb3N0KERyYWZ0U2VydmljZSwgc2VydmljZSwgeyBzZXNzaW9uS2V5OiBzayB9KVxuXHRcdHJldHVybiB0aGlzLmVudGl0eUNsaWVudC5sb2FkKE1haWxUeXBlUmVmLCBjcmVhdGVEcmFmdFJldHVybi5kcmFmdClcblx0fVxuXG5cdC8qKlxuXHQgKiBVcGRhdGVzIGEgZHJhZnQgbWFpbC5cblx0ICogQHBhcmFtIHN1YmplY3QgVGhlIHN1YmplY3Qgb2YgdGhlIG1haWwuXG5cdCAqIEBwYXJhbSBib2R5IFRoZSBib2R5IHRleHQgb2YgdGhlIG1haWwuXG5cdCAqIEBwYXJhbSBzZW5kZXJNYWlsQWRkcmVzcyBUaGUgc2VuZGVycyBtYWlsIGFkZHJlc3MuXG5cdCAqIEBwYXJhbSBzZW5kZXJOYW1lIFRoZSBuYW1lIG9mIHRoZSBzZW5kZXIgdGhhdCBpcyBzZW50IHRvZ2V0aGVyIHdpdGggdGhlIG1haWwgYWRkcmVzcyBvZiB0aGUgc2VuZGVyLlxuXHQgKiBAcGFyYW0gdG9SZWNpcGllbnRzIFRoZSByZWNpcGllbnRzIHRoZSBtYWlsIHNoYWxsIGJlIHNlbnQgdG8uXG5cdCAqIEBwYXJhbSBjY1JlY2lwaWVudHMgVGhlIHJlY2lwaWVudHMgdGhlIG1haWwgc2hhbGwgYmUgc2VudCB0byBpbiBjYy5cblx0ICogQHBhcmFtIGJjY1JlY2lwaWVudHMgVGhlIHJlY2lwaWVudHMgdGhlIG1haWwgc2hhbGwgYmUgc2VudCB0byBpbiBiY2MuXG5cdCAqIEBwYXJhbSBhdHRhY2htZW50cyBUaGUgZmlsZXMgdGhhdCBzaGFsbCBiZSBhdHRhY2hlZCB0byB0aGlzIG1haWwgb3IgbnVsbCBpZiB0aGUgY3VycmVudCBhdHRhY2htZW50cyBzaGFsbCBub3QgYmUgY2hhbmdlZC5cblx0ICogQHBhcmFtIGNvbmZpZGVudGlhbCBUcnVlIGlmIHRoZSBtYWlsIHNoYWxsIGJlIHNlbnQgZW5kLXRvLWVuZCBlbmNyeXB0ZWQsIGZhbHNlIG90aGVyd2lzZS5cblx0ICogQHBhcmFtIGRyYWZ0IFRoZSBkcmFmdCB0byB1cGRhdGUuXG5cdCAqIEByZXR1cm4gVGhlIHVwZGF0ZWQgZHJhZnQuIFJlamVjdGVkIHdpdGggVG9vTWFueVJlcXVlc3RzRXJyb3IgaWYgdGhlIG51bWJlciBhbGxvd2VkIG1haWxzIHdhcyBleGNlZWRlZCwgQWNjZXNzQmxvY2tlZEVycm9yIGlmIHRoZSBjdXN0b21lciBpcyBub3QgYWxsb3dlZCB0byBzZW5kIGVtYWlscyBjdXJyZW50bHkgYmVjYXVzZSBoZSBpcyBtYXJrZWQgZm9yIGFwcHJvdmFsLlxuXHQgKi9cblx0YXN5bmMgdXBkYXRlRHJhZnQoe1xuXHRcdHN1YmplY3QsXG5cdFx0Ym9keSxcblx0XHRzZW5kZXJNYWlsQWRkcmVzcyxcblx0XHRzZW5kZXJOYW1lLFxuXHRcdHRvUmVjaXBpZW50cyxcblx0XHRjY1JlY2lwaWVudHMsXG5cdFx0YmNjUmVjaXBpZW50cyxcblx0XHRhdHRhY2htZW50cyxcblx0XHRjb25maWRlbnRpYWwsXG5cdFx0ZHJhZnQsXG5cdH06IFVwZGF0ZURyYWZ0UGFyYW1zKTogUHJvbWlzZTxNYWlsPiB7XG5cdFx0aWYgKGJ5dGVMZW5ndGgoYm9keSkgPiBVTkNPTVBSRVNTRURfTUFYX1NJWkUpIHtcblx0XHRcdHRocm93IG5ldyBNYWlsQm9keVRvb0xhcmdlRXJyb3IoYENhbid0IHVwZGF0ZSBkcmFmdCwgbWFpbCBib2R5IHRvbyBsYXJnZSAoJHtieXRlTGVuZ3RoKGJvZHkpfSlgKVxuXHRcdH1cblxuXHRcdGNvbnN0IHNlbmRlck1haWxHcm91cElkID0gYXdhaXQgdGhpcy5fZ2V0TWFpbEdyb3VwSWRGb3JNYWlsQWRkcmVzcyh0aGlzLnVzZXJGYWNhZGUuZ2V0TG9nZ2VkSW5Vc2VyKCksIHNlbmRlck1haWxBZGRyZXNzKVxuXG5cdFx0Ly8gd2UgYXNzdW1lIHRoYXQgdGhlcmUgaXMgYW4gX293bmVyRW5jU2Vzc2lvbktleSBhbnl3YXksIHNvIHdlIGNhbiBkZWZhdWx0IHRvIDBcblx0XHRjb25zdCBtYWlsR3JvdXBLZXlWZXJzaW9uID0gcGFyc2VLZXlWZXJzaW9uKGRyYWZ0Ll9vd25lcktleVZlcnNpb24gPz8gXCIwXCIpXG5cdFx0Y29uc3QgbWFpbEdyb3VwS2V5ID0ge1xuXHRcdFx0dmVyc2lvbjogbWFpbEdyb3VwS2V5VmVyc2lvbixcblx0XHRcdG9iamVjdDogYXdhaXQgdGhpcy5rZXlMb2FkZXJGYWNhZGUubG9hZFN5bUdyb3VwS2V5KHNlbmRlck1haWxHcm91cElkLCBtYWlsR3JvdXBLZXlWZXJzaW9uKSxcblx0XHR9XG5cdFx0Y29uc3QgY3VycmVudEF0dGFjaG1lbnRzID0gYXdhaXQgdGhpcy5nZXRBdHRhY2htZW50SWRzKGRyYWZ0KVxuXHRcdGNvbnN0IHJlcGx5VG9zID0gYXdhaXQgdGhpcy5nZXRSZXBseVRvcyhkcmFmdClcblxuXHRcdGNvbnN0IHNrID0gZGVjcnlwdEtleShtYWlsR3JvdXBLZXkub2JqZWN0LCBhc3NlcnROb3ROdWxsKGRyYWZ0Ll9vd25lckVuY1Nlc3Npb25LZXkpKVxuXHRcdGNvbnN0IHNlcnZpY2UgPSBjcmVhdGVEcmFmdFVwZGF0ZURhdGEoe1xuXHRcdFx0ZHJhZnQ6IGRyYWZ0Ll9pZCxcblx0XHRcdGRyYWZ0RGF0YTogY3JlYXRlRHJhZnREYXRhKHtcblx0XHRcdFx0c3ViamVjdDogc3ViamVjdCxcblx0XHRcdFx0Y29tcHJlc3NlZEJvZHlUZXh0OiBib2R5LFxuXHRcdFx0XHRzZW5kZXJNYWlsQWRkcmVzczogc2VuZGVyTWFpbEFkZHJlc3MsXG5cdFx0XHRcdHNlbmRlck5hbWU6IHNlbmRlck5hbWUsXG5cdFx0XHRcdGNvbmZpZGVudGlhbDogY29uZmlkZW50aWFsLFxuXHRcdFx0XHRtZXRob2Q6IGRyYWZ0Lm1ldGhvZCxcblx0XHRcdFx0dG9SZWNpcGllbnRzOiB0b1JlY2lwaWVudHMubWFwKHJlY2lwaWVudFRvRHJhZnRSZWNpcGllbnQpLFxuXHRcdFx0XHRjY1JlY2lwaWVudHM6IGNjUmVjaXBpZW50cy5tYXAocmVjaXBpZW50VG9EcmFmdFJlY2lwaWVudCksXG5cdFx0XHRcdGJjY1JlY2lwaWVudHM6IGJjY1JlY2lwaWVudHMubWFwKHJlY2lwaWVudFRvRHJhZnRSZWNpcGllbnQpLFxuXHRcdFx0XHRyZXBseVRvczogcmVwbHlUb3MsXG5cdFx0XHRcdHJlbW92ZWRBdHRhY2htZW50czogdGhpcy5fZ2V0UmVtb3ZlZEF0dGFjaG1lbnRzKGF0dGFjaG1lbnRzLCBjdXJyZW50QXR0YWNobWVudHMpLFxuXHRcdFx0XHRhZGRlZEF0dGFjaG1lbnRzOiBhd2FpdCB0aGlzLl9jcmVhdGVBZGRlZEF0dGFjaG1lbnRzKGF0dGFjaG1lbnRzLCBjdXJyZW50QXR0YWNobWVudHMsIHNlbmRlck1haWxHcm91cElkLCBtYWlsR3JvdXBLZXkpLFxuXHRcdFx0XHRib2R5VGV4dDogXCJcIixcblx0XHRcdH0pLFxuXHRcdH0pXG5cdFx0dGhpcy5kZWZlcnJlZERyYWZ0SWQgPSBkcmFmdC5faWRcblx0XHQvLyB3ZSBoYXZlIHRvIHdhaXQgZm9yIHRoZSB1cGRhdGVkIG1haWwgYmVjYXVzZSBzZW5kTWFpbCgpIG1pZ2h0IGJlIGNhbGxlZCByaWdodCBhZnRlciB0aGlzIHVwZGF0ZVxuXHRcdHRoaXMuZGVmZXJyZWREcmFmdFVwZGF0ZSA9IGRlZmVyKClcblx0XHQvLyB1c2UgYSBsb2NhbCByZWZlcmVuY2UgaGVyZSBiZWNhdXNlIHRoaXMuX2RlZmVycmVkRHJhZnRVcGRhdGUgaXMgc2V0IHRvIG51bGwgd2hlbiB0aGUgZXZlbnQgaXMgcmVjZWl2ZWQgYXN5bmNcblx0XHRjb25zdCBkZWZlcnJlZFVwZGF0ZVByb21pc2VXcmFwcGVyID0gdGhpcy5kZWZlcnJlZERyYWZ0VXBkYXRlXG5cdFx0YXdhaXQgdGhpcy5zZXJ2aWNlRXhlY3V0b3IucHV0KERyYWZ0U2VydmljZSwgc2VydmljZSwgeyBzZXNzaW9uS2V5OiBzayB9KVxuXHRcdHJldHVybiBkZWZlcnJlZFVwZGF0ZVByb21pc2VXcmFwcGVyLnByb21pc2Vcblx0fVxuXG5cdGFzeW5jIG1vdmVNYWlscyhtYWlsczogSWRUdXBsZVtdLCBzb3VyY2VGb2xkZXI6IElkVHVwbGUsIHRhcmdldEZvbGRlcjogSWRUdXBsZSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGF3YWl0IHRoaXMuc2VydmljZUV4ZWN1dG9yLnBvc3QoTW92ZU1haWxTZXJ2aWNlLCBjcmVhdGVNb3ZlTWFpbERhdGEoeyBtYWlscywgc291cmNlRm9sZGVyLCB0YXJnZXRGb2xkZXIgfSkpXG5cdH1cblxuXHRhc3luYyByZXBvcnRNYWlsKG1haWw6IE1haWwsIHJlcG9ydFR5cGU6IE1haWxSZXBvcnRUeXBlKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3QgbWFpbFNlc3Npb25LZXk6IEFlczEyOEtleSA9IGFzc2VydE5vdE51bGwoYXdhaXQgdGhpcy5jcnlwdG8ucmVzb2x2ZVNlc3Npb25LZXlGb3JJbnN0YW5jZShtYWlsKSlcblx0XHRjb25zdCBwb3N0RGF0YSA9IGNyZWF0ZVJlcG9ydE1haWxQb3N0RGF0YSh7XG5cdFx0XHRtYWlsSWQ6IG1haWwuX2lkLFxuXHRcdFx0bWFpbFNlc3Npb25LZXk6IGJpdEFycmF5VG9VaW50OEFycmF5KG1haWxTZXNzaW9uS2V5KSxcblx0XHRcdHJlcG9ydFR5cGUsXG5cdFx0fSlcblx0XHRhd2FpdCB0aGlzLnNlcnZpY2VFeGVjdXRvci5wb3N0KFJlcG9ydE1haWxTZXJ2aWNlLCBwb3N0RGF0YSlcblx0fVxuXG5cdGFzeW5jIGRlbGV0ZU1haWxzKG1haWxzOiBJZFR1cGxlW10sIGZvbGRlcjogSWRUdXBsZSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IGRlbGV0ZU1haWxEYXRhID0gY3JlYXRlRGVsZXRlTWFpbERhdGEoe1xuXHRcdFx0bWFpbHMsXG5cdFx0XHRmb2xkZXIsXG5cdFx0fSlcblx0XHRhd2FpdCB0aGlzLnNlcnZpY2VFeGVjdXRvci5kZWxldGUoTWFpbFNlcnZpY2UsIGRlbGV0ZU1haWxEYXRhKVxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYWxsIGlkcyBvZiB0aGUgZmlsZXMgdGhhdCBoYXZlIGJlZW4gcmVtb3ZlZCwgaS5lLiB0aGF0IGFyZSBjb250YWluZWQgaW4gdGhlIGV4aXN0aW5nRmlsZUlkcyBidXQgbm90IGluIHRoZSBwcm92aWRlZCBmaWxlc1xuXHQgKi9cblx0X2dldFJlbW92ZWRBdHRhY2htZW50cyhwcm92aWRlZEZpbGVzOiBBdHRhY2htZW50cyB8IG51bGwsIGV4aXN0aW5nRmlsZUlkczogSWRUdXBsZVtdKTogSWRUdXBsZVtdIHtcblx0XHRjb25zdCByZW1vdmVkQXR0YWNobWVudElkczogSWRUdXBsZVtdID0gW11cblxuXHRcdGlmIChwcm92aWRlZEZpbGVzICE9IG51bGwpIHtcblx0XHRcdGNvbnN0IGF0dGFjaG1lbnRzID0gcHJvdmlkZWRGaWxlc1xuXHRcdFx0Ly8gY2hlY2sgd2hpY2ggYXR0YWNobWVudHMgaGF2ZSBiZWVuIHJlbW92ZWRcblx0XHRcdGZvciAoY29uc3QgZmlsZUlkIG9mIGV4aXN0aW5nRmlsZUlkcykge1xuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0IWF0dGFjaG1lbnRzLnNvbWUoXG5cdFx0XHRcdFx0XHQoYXR0YWNobWVudCkgPT4gYXR0YWNobWVudC5fdHlwZSAhPT0gXCJEYXRhRmlsZVwiICYmIGF0dGFjaG1lbnQuX3R5cGUgIT09IFwiRmlsZVJlZmVyZW5jZVwiICYmIGlzU2FtZUlkKGdldExldElkKGF0dGFjaG1lbnQpLCBmaWxlSWQpLFxuXHRcdFx0XHRcdClcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0cmVtb3ZlZEF0dGFjaG1lbnRJZHMucHVzaChmaWxlSWQpXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gcmVtb3ZlZEF0dGFjaG1lbnRJZHNcblx0fVxuXG5cdC8qKlxuXHQgKiBVcGxvYWRzIHRoZSBnaXZlbiBkYXRhIGZpbGVzIG9yIHNldHMgdGhlIGZpbGUgaWYgaXQgaXMgYWxyZWFkeSBleGlzdGluZyBmaWxlcyAoZS5nLiBmb3J3YXJkZWQgZmlsZXMpIGFuZCByZXR1cm5zIGFsbCBEcmFmdEF0dGFjaG1lbnRzXG5cdCAqL1xuXHRhc3luYyBfY3JlYXRlQWRkZWRBdHRhY2htZW50cyhcblx0XHRwcm92aWRlZEZpbGVzOiBBdHRhY2htZW50cyB8IG51bGwsXG5cdFx0ZXhpc3RpbmdGaWxlSWRzOiBSZWFkb25seUFycmF5PElkVHVwbGU+LFxuXHRcdHNlbmRlck1haWxHcm91cElkOiBJZCxcblx0XHRtYWlsR3JvdXBLZXk6IFZlcnNpb25lZEtleSxcblx0KTogUHJvbWlzZTxEcmFmdEF0dGFjaG1lbnRbXT4ge1xuXHRcdGlmIChwcm92aWRlZEZpbGVzID09IG51bGwgfHwgcHJvdmlkZWRGaWxlcy5sZW5ndGggPT09IDApIHJldHVybiBbXVxuXG5cdFx0Ly8gVmVyaWZ5IG1pbWUgdHlwZXMgYXJlIGNvcnJlY3QgYmVmb3JlIHVwbG9hZGluZ1xuXHRcdHZhbGlkYXRlTWltZVR5cGVzRm9yQXR0YWNobWVudHMocHJvdmlkZWRGaWxlcylcblxuXHRcdHJldHVybiBwcm9taXNlTWFwKHByb3ZpZGVkRmlsZXMsIGFzeW5jIChwcm92aWRlZEZpbGUpID0+IHtcblx0XHRcdC8vIGNoZWNrIGlmIHRoaXMgaXMgYSBuZXcgYXR0YWNobWVudCBvciBhbiBleGlzdGluZyBvbmVcblx0XHRcdGlmIChpc0RhdGFGaWxlKHByb3ZpZGVkRmlsZSkpIHtcblx0XHRcdFx0Ly8gdXNlciBhZGRlZCBhdHRhY2htZW50XG5cdFx0XHRcdGNvbnN0IGZpbGVTZXNzaW9uS2V5ID0gYWVzMjU2UmFuZG9tS2V5KClcblx0XHRcdFx0bGV0IHJlZmVyZW5jZVRva2VuczogQXJyYXk8QmxvYlJlZmVyZW5jZVRva2VuV3JhcHBlcj5cblx0XHRcdFx0aWYgKGlzQXBwKCkgfHwgaXNEZXNrdG9wKCkpIHtcblx0XHRcdFx0XHRjb25zdCB7IGxvY2F0aW9uIH0gPSBhd2FpdCB0aGlzLmZpbGVBcHAud3JpdGVEYXRhRmlsZShwcm92aWRlZEZpbGUpXG5cdFx0XHRcdFx0cmVmZXJlbmNlVG9rZW5zID0gYXdhaXQgdGhpcy5ibG9iRmFjYWRlLmVuY3J5cHRBbmRVcGxvYWROYXRpdmUoQXJjaGl2ZURhdGFUeXBlLkF0dGFjaG1lbnRzLCBsb2NhdGlvbiwgc2VuZGVyTWFpbEdyb3VwSWQsIGZpbGVTZXNzaW9uS2V5KVxuXHRcdFx0XHRcdGF3YWl0IHRoaXMuZmlsZUFwcC5kZWxldGVGaWxlKGxvY2F0aW9uKVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJlZmVyZW5jZVRva2VucyA9IGF3YWl0IHRoaXMuYmxvYkZhY2FkZS5lbmNyeXB0QW5kVXBsb2FkKEFyY2hpdmVEYXRhVHlwZS5BdHRhY2htZW50cywgcHJvdmlkZWRGaWxlLmRhdGEsIHNlbmRlck1haWxHcm91cElkLCBmaWxlU2Vzc2lvbktleSlcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gdGhpcy5jcmVhdGVBbmRFbmNyeXB0RHJhZnRBdHRhY2htZW50KHJlZmVyZW5jZVRva2VucywgZmlsZVNlc3Npb25LZXksIHByb3ZpZGVkRmlsZSwgbWFpbEdyb3VwS2V5KVxuXHRcdFx0fSBlbHNlIGlmIChpc0ZpbGVSZWZlcmVuY2UocHJvdmlkZWRGaWxlKSkge1xuXHRcdFx0XHRjb25zdCBmaWxlU2Vzc2lvbktleSA9IGFlczI1NlJhbmRvbUtleSgpXG5cdFx0XHRcdGNvbnN0IHJlZmVyZW5jZVRva2VucyA9IGF3YWl0IHRoaXMuYmxvYkZhY2FkZS5lbmNyeXB0QW5kVXBsb2FkTmF0aXZlKFxuXHRcdFx0XHRcdEFyY2hpdmVEYXRhVHlwZS5BdHRhY2htZW50cyxcblx0XHRcdFx0XHRwcm92aWRlZEZpbGUubG9jYXRpb24sXG5cdFx0XHRcdFx0c2VuZGVyTWFpbEdyb3VwSWQsXG5cdFx0XHRcdFx0ZmlsZVNlc3Npb25LZXksXG5cdFx0XHRcdClcblx0XHRcdFx0cmV0dXJuIHRoaXMuY3JlYXRlQW5kRW5jcnlwdERyYWZ0QXR0YWNobWVudChyZWZlcmVuY2VUb2tlbnMsIGZpbGVTZXNzaW9uS2V5LCBwcm92aWRlZEZpbGUsIG1haWxHcm91cEtleSlcblx0XHRcdH0gZWxzZSBpZiAoIWNvbnRhaW5zSWQoZXhpc3RpbmdGaWxlSWRzLCBnZXRMZXRJZChwcm92aWRlZEZpbGUpKSkge1xuXHRcdFx0XHQvLyBmb3J3YXJkZWQgYXR0YWNobWVudCB3aGljaCB3YXMgbm90IGluIHRoZSBkcmFmdCBiZWZvcmVcblx0XHRcdFx0cmV0dXJuIHRoaXMuY3J5cHRvLnJlc29sdmVTZXNzaW9uS2V5Rm9ySW5zdGFuY2UocHJvdmlkZWRGaWxlKS50aGVuKChmaWxlU2Vzc2lvbktleSkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IHNlc3Npb25LZXkgPSBhc3NlcnROb3ROdWxsKGZpbGVTZXNzaW9uS2V5LCBcImZpbGVzZXNzaW9ua2V5IHdhcyBub3QgcmVzb2x2ZWRcIilcblx0XHRcdFx0XHRjb25zdCBvd25lckVuY0ZpbGVTZXNzaW9uS2V5ID0gZW5jcnlwdEtleVdpdGhWZXJzaW9uZWRLZXkobWFpbEdyb3VwS2V5LCBzZXNzaW9uS2V5KVxuXHRcdFx0XHRcdGNvbnN0IGF0dGFjaG1lbnQgPSBjcmVhdGVEcmFmdEF0dGFjaG1lbnQoe1xuXHRcdFx0XHRcdFx0ZXhpc3RpbmdGaWxlOiBnZXRMZXRJZChwcm92aWRlZEZpbGUpLFxuXHRcdFx0XHRcdFx0b3duZXJFbmNGaWxlU2Vzc2lvbktleTogb3duZXJFbmNGaWxlU2Vzc2lvbktleS5rZXksXG5cdFx0XHRcdFx0XHRuZXdGaWxlOiBudWxsLFxuXHRcdFx0XHRcdFx0b3duZXJLZXlWZXJzaW9uOiBvd25lckVuY0ZpbGVTZXNzaW9uS2V5LmVuY3J5cHRpbmdLZXlWZXJzaW9uLnRvU3RyaW5nKCksXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRyZXR1cm4gYXR0YWNobWVudFxuXHRcdFx0XHR9KVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIG51bGxcblx0XHRcdH1cblx0XHR9KSAvLyBkaXNhYmxlIGNvbmN1cnJlbnQgZmlsZSB1cGxvYWQgdG8gYXZvaWQgdGltZW91dCBiZWNhdXNlIG9mIG1pc3NpbmcgcHJvZ3Jlc3MgZXZlbnRzIG9uIEZpcmVmb3guXG5cdFx0XHQudGhlbigoYXR0YWNobWVudHMpID0+IGF0dGFjaG1lbnRzLmZpbHRlcihpc05vdE51bGwpKVxuXHRcdFx0LnRoZW4oKGl0KSA9PiB7XG5cdFx0XHRcdC8vIG9ubHkgZGVsZXRlIHRoZSB0ZW1wb3JhcnkgZmlsZXMgYWZ0ZXIgYWxsIGF0dGFjaG1lbnRzIGhhdmUgYmVlbiB1cGxvYWRlZFxuXHRcdFx0XHRpZiAoaXNBcHAoKSkge1xuXHRcdFx0XHRcdHRoaXMuZmlsZUFwcC5jbGVhckZpbGVEYXRhKCkuY2F0Y2goKGUpID0+IGNvbnNvbGUud2FybihcIkZhaWxlZCB0byBjbGVhciBmaWxlc1wiLCBlKSlcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBpdFxuXHRcdFx0fSlcblx0fVxuXG5cdHByaXZhdGUgY3JlYXRlQW5kRW5jcnlwdERyYWZ0QXR0YWNobWVudChcblx0XHRyZWZlcmVuY2VUb2tlbnM6IEJsb2JSZWZlcmVuY2VUb2tlbldyYXBwZXJbXSxcblx0XHRmaWxlU2Vzc2lvbktleTogQWVzS2V5LFxuXHRcdHByb3ZpZGVkRmlsZTogRGF0YUZpbGUgfCBGaWxlUmVmZXJlbmNlLFxuXHRcdG1haWxHcm91cEtleTogVmVyc2lvbmVkS2V5LFxuXHQpOiBEcmFmdEF0dGFjaG1lbnQge1xuXHRcdGNvbnN0IG93bmVyRW5jRmlsZVNlc3Npb25LZXkgPSBlbmNyeXB0S2V5V2l0aFZlcnNpb25lZEtleShtYWlsR3JvdXBLZXksIGZpbGVTZXNzaW9uS2V5KVxuXHRcdHJldHVybiBjcmVhdGVEcmFmdEF0dGFjaG1lbnQoe1xuXHRcdFx0bmV3RmlsZTogY3JlYXRlTmV3RHJhZnRBdHRhY2htZW50KHtcblx0XHRcdFx0ZW5jRmlsZU5hbWU6IGVuY3J5cHRTdHJpbmcoZmlsZVNlc3Npb25LZXksIHByb3ZpZGVkRmlsZS5uYW1lKSxcblx0XHRcdFx0ZW5jTWltZVR5cGU6IGVuY3J5cHRTdHJpbmcoZmlsZVNlc3Npb25LZXksIHByb3ZpZGVkRmlsZS5taW1lVHlwZSksXG5cdFx0XHRcdHJlZmVyZW5jZVRva2VuczogcmVmZXJlbmNlVG9rZW5zLFxuXHRcdFx0XHRlbmNDaWQ6IHByb3ZpZGVkRmlsZS5jaWQgPT0gbnVsbCA/IG51bGwgOiBlbmNyeXB0U3RyaW5nKGZpbGVTZXNzaW9uS2V5LCBwcm92aWRlZEZpbGUuY2lkKSxcblx0XHRcdH0pLFxuXHRcdFx0b3duZXJFbmNGaWxlU2Vzc2lvbktleTogb3duZXJFbmNGaWxlU2Vzc2lvbktleS5rZXksXG5cdFx0XHRvd25lcktleVZlcnNpb246IG93bmVyRW5jRmlsZVNlc3Npb25LZXkuZW5jcnlwdGluZ0tleVZlcnNpb24udG9TdHJpbmcoKSxcblx0XHRcdGV4aXN0aW5nRmlsZTogbnVsbCxcblx0XHR9KVxuXHR9XG5cblx0YXN5bmMgc2VuZERyYWZ0KGRyYWZ0OiBNYWlsLCByZWNpcGllbnRzOiBBcnJheTxSZWNpcGllbnQ+LCBsYW5ndWFnZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3Qgc2VuZGVyTWFpbEdyb3VwSWQgPSBhd2FpdCB0aGlzLl9nZXRNYWlsR3JvdXBJZEZvck1haWxBZGRyZXNzKHRoaXMudXNlckZhY2FkZS5nZXRMb2dnZWRJblVzZXIoKSwgZHJhZnQuc2VuZGVyLmFkZHJlc3MpXG5cdFx0Y29uc3QgYnVja2V0S2V5ID0gYWVzMjU2UmFuZG9tS2V5KClcblx0XHRjb25zdCBzZW5kRHJhZnREYXRhID0gY3JlYXRlU2VuZERyYWZ0RGF0YSh7XG5cdFx0XHRsYW5ndWFnZTogbGFuZ3VhZ2UsXG5cdFx0XHRtYWlsOiBkcmFmdC5faWQsXG5cdFx0XHRtYWlsU2Vzc2lvbktleTogbnVsbCxcblx0XHRcdGF0dGFjaG1lbnRLZXlEYXRhOiBbXSxcblx0XHRcdGNhbGVuZGFyTWV0aG9kOiBmYWxzZSxcblx0XHRcdGludGVybmFsUmVjaXBpZW50S2V5RGF0YTogW10sXG5cdFx0XHRwbGFpbnRleHQ6IGZhbHNlLFxuXHRcdFx0YnVja2V0RW5jTWFpbFNlc3Npb25LZXk6IG51bGwsXG5cdFx0XHRzZW5kZXJOYW1lVW5lbmNyeXB0ZWQ6IG51bGwsXG5cdFx0XHRzZWN1cmVFeHRlcm5hbFJlY2lwaWVudEtleURhdGE6IFtdLFxuXHRcdFx0c3ltRW5jSW50ZXJuYWxSZWNpcGllbnRLZXlEYXRhOiBbXSxcblx0XHRcdHNlc3Npb25FbmNFbmNyeXB0aW9uQXV0aFN0YXR1czogbnVsbCxcblx0XHR9KVxuXG5cdFx0Y29uc3QgYXR0YWNobWVudHMgPSBhd2FpdCB0aGlzLmdldEF0dGFjaG1lbnRJZHMoZHJhZnQpXG5cdFx0Zm9yIChjb25zdCBmaWxlSWQgb2YgYXR0YWNobWVudHMpIHtcblx0XHRcdGNvbnN0IGZpbGUgPSBhd2FpdCB0aGlzLmVudGl0eUNsaWVudC5sb2FkKEZpbGVUeXBlUmVmLCBmaWxlSWQpXG5cdFx0XHRjb25zdCBmaWxlU2Vzc2lvbktleSA9IGFzc2VydE5vdE51bGwoYXdhaXQgdGhpcy5jcnlwdG8ucmVzb2x2ZVNlc3Npb25LZXlGb3JJbnN0YW5jZShmaWxlKSwgXCJmaWxlU2Vzc2lvbktleSB3YXMgbnVsbFwiKVxuXHRcdFx0Y29uc3QgZGF0YSA9IGNyZWF0ZUF0dGFjaG1lbnRLZXlEYXRhKHtcblx0XHRcdFx0ZmlsZTogZmlsZUlkLFxuXHRcdFx0XHRmaWxlU2Vzc2lvbktleTogbnVsbCxcblx0XHRcdFx0YnVja2V0RW5jRmlsZVNlc3Npb25LZXk6IG51bGwsXG5cdFx0XHR9KVxuXG5cdFx0XHRpZiAoZHJhZnQuY29uZmlkZW50aWFsKSB7XG5cdFx0XHRcdGRhdGEuYnVja2V0RW5jRmlsZVNlc3Npb25LZXkgPSBlbmNyeXB0S2V5KGJ1Y2tldEtleSwgZmlsZVNlc3Npb25LZXkpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRkYXRhLmZpbGVTZXNzaW9uS2V5ID0ga2V5VG9VaW50OEFycmF5KGZpbGVTZXNzaW9uS2V5KVxuXHRcdFx0fVxuXG5cdFx0XHRzZW5kRHJhZnREYXRhLmF0dGFjaG1lbnRLZXlEYXRhLnB1c2goZGF0YSlcblx0XHR9XG5cblx0XHRhd2FpdCBQcm9taXNlLmFsbChbXG5cdFx0XHR0aGlzLmVudGl0eUNsaWVudC5sb2FkUm9vdChUdXRhbm90YVByb3BlcnRpZXNUeXBlUmVmLCB0aGlzLnVzZXJGYWNhZGUuZ2V0VXNlckdyb3VwSWQoKSkudGhlbigodHV0YW5vdGFQcm9wZXJ0aWVzKSA9PiB7XG5cdFx0XHRcdHNlbmREcmFmdERhdGEucGxhaW50ZXh0ID0gdHV0YW5vdGFQcm9wZXJ0aWVzLnNlbmRQbGFpbnRleHRPbmx5XG5cdFx0XHR9KSxcblx0XHRcdHRoaXMuY3J5cHRvLnJlc29sdmVTZXNzaW9uS2V5Rm9ySW5zdGFuY2UoZHJhZnQpLnRoZW4oYXN5bmMgKG1haWxTZXNzaW9ua2V5KSA9PiB7XG5cdFx0XHRcdGNvbnN0IHNrID0gYXNzZXJ0Tm90TnVsbChtYWlsU2Vzc2lvbmtleSwgXCJtYWlsU2Vzc2lvbktleSB3YXMgbnVsbFwiKVxuXHRcdFx0XHRzZW5kRHJhZnREYXRhLmNhbGVuZGFyTWV0aG9kID0gZHJhZnQubWV0aG9kICE9PSBNYWlsTWV0aG9kLk5PTkVcblxuXHRcdFx0XHRpZiAoZHJhZnQuY29uZmlkZW50aWFsKSB7XG5cdFx0XHRcdFx0c2VuZERyYWZ0RGF0YS5idWNrZXRFbmNNYWlsU2Vzc2lvbktleSA9IGVuY3J5cHRLZXkoYnVja2V0S2V5LCBzaylcblx0XHRcdFx0XHRjb25zdCBoYXNFeHRlcm5hbFNlY3VyZVJlY2lwaWVudCA9IHJlY2lwaWVudHMuc29tZSgocikgPT4gci50eXBlID09PSBSZWNpcGllbnRUeXBlLkVYVEVSTkFMICYmICEhdGhpcy5nZXRDb250YWN0UGFzc3dvcmQoci5jb250YWN0KT8udHJpbSgpKVxuXG5cdFx0XHRcdFx0aWYgKGhhc0V4dGVybmFsU2VjdXJlUmVjaXBpZW50KSB7XG5cdFx0XHRcdFx0XHRzZW5kRHJhZnREYXRhLnNlbmRlck5hbWVVbmVuY3J5cHRlZCA9IGRyYWZ0LnNlbmRlci5uYW1lIC8vIG5lZWRlZCBmb3Igbm90aWZpY2F0aW9uIG1haWxcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRhd2FpdCB0aGlzLmFkZFJlY2lwaWVudEtleURhdGEoYnVja2V0S2V5LCBzZW5kRHJhZnREYXRhLCByZWNpcGllbnRzLCBzZW5kZXJNYWlsR3JvdXBJZClcblx0XHRcdFx0XHRpZiAodGhpcy5pc1R1dGFDcnlwdE1haWwoc2VuZERyYWZ0RGF0YSkpIHtcblx0XHRcdFx0XHRcdHNlbmREcmFmdERhdGEuc2Vzc2lvbkVuY0VuY3J5cHRpb25BdXRoU3RhdHVzID0gZW5jcnlwdFN0cmluZyhzaywgRW5jcnlwdGlvbkF1dGhTdGF0dXMuVFVUQUNSWVBUX1NFTkRFUilcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c2VuZERyYWZ0RGF0YS5tYWlsU2Vzc2lvbktleSA9IGJpdEFycmF5VG9VaW50OEFycmF5KHNrKVxuXHRcdFx0XHR9XG5cdFx0XHR9KSxcblx0XHRdKVxuXHRcdGF3YWl0IHRoaXMuc2VydmljZUV4ZWN1dG9yLnBvc3QoU2VuZERyYWZ0U2VydmljZSwgc2VuZERyYWZ0RGF0YSlcblx0fVxuXG5cdGFzeW5jIGdldEF0dGFjaG1lbnRJZHMoZHJhZnQ6IE1haWwpOiBQcm9taXNlPElkVHVwbGVbXT4ge1xuXHRcdHJldHVybiBkcmFmdC5hdHRhY2htZW50c1xuXHR9XG5cblx0YXN5bmMgZ2V0UmVwbHlUb3MoZHJhZnQ6IE1haWwpOiBQcm9taXNlPEVuY3J5cHRlZE1haWxBZGRyZXNzW10+IHtcblx0XHRjb25zdCBvd25lckVuY1Nlc3Npb25LZXlQcm92aWRlcjogT3duZXJFbmNTZXNzaW9uS2V5UHJvdmlkZXIgPSB0aGlzLmtleVByb3ZpZGVyRnJvbUluc3RhbmNlKGRyYWZ0KVxuXHRcdGNvbnN0IG1haWxEZXRhaWxzRHJhZnRJZCA9IGFzc2VydE5vdE51bGwoZHJhZnQubWFpbERldGFpbHNEcmFmdCwgXCJkcmFmdCB3aXRob3V0IG1haWxEZXRhaWxzRHJhZnRcIilcblx0XHRjb25zdCBtYWlsRGV0YWlscyA9IGF3YWl0IHRoaXMuZW50aXR5Q2xpZW50LmxvYWRNdWx0aXBsZShcblx0XHRcdE1haWxEZXRhaWxzRHJhZnRUeXBlUmVmLFxuXHRcdFx0bGlzdElkUGFydChtYWlsRGV0YWlsc0RyYWZ0SWQpLFxuXHRcdFx0W2VsZW1lbnRJZFBhcnQobWFpbERldGFpbHNEcmFmdElkKV0sXG5cdFx0XHRvd25lckVuY1Nlc3Npb25LZXlQcm92aWRlcixcblx0XHQpXG5cdFx0aWYgKG1haWxEZXRhaWxzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0dGhyb3cgbmV3IE5vdEZvdW5kRXJyb3IoYE1haWxEZXRhaWxzRHJhZnQgJHtkcmFmdC5tYWlsRGV0YWlsc0RyYWZ0fWApXG5cdFx0fVxuXHRcdHJldHVybiBtYWlsRGV0YWlsc1swXS5kZXRhaWxzLnJlcGx5VG9zXG5cdH1cblxuXHRhc3luYyBjaGVja01haWxGb3JQaGlzaGluZyhcblx0XHRtYWlsOiBNYWlsLFxuXHRcdGxpbmtzOiBBcnJheTx7XG5cdFx0XHRocmVmOiBzdHJpbmdcblx0XHRcdGlubmVySFRNTDogc3RyaW5nXG5cdFx0fT4sXG5cdCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdGxldCBzY29yZSA9IDBcblx0XHRjb25zdCBzZW5kZXJBZGRyZXNzID0gbWFpbC5zZW5kZXIuYWRkcmVzc1xuXG5cdFx0bGV0IHNlbmRlckF1dGhlbnRpY2F0ZWRcblx0XHRpZiAobWFpbC5hdXRoU3RhdHVzICE9PSBudWxsKSB7XG5cdFx0XHRzZW5kZXJBdXRoZW50aWNhdGVkID0gbWFpbC5hdXRoU3RhdHVzID09PSBNYWlsQXV0aGVudGljYXRpb25TdGF0dXMuQVVUSEVOVElDQVRFRFxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBtYWlsRGV0YWlscyA9IGF3YWl0IHRoaXMubG9hZE1haWxEZXRhaWxzQmxvYihtYWlsKVxuXHRcdFx0c2VuZGVyQXV0aGVudGljYXRlZCA9IG1haWxEZXRhaWxzLmF1dGhTdGF0dXMgPT09IE1haWxBdXRoZW50aWNhdGlvblN0YXR1cy5BVVRIRU5USUNBVEVEXG5cdFx0fVxuXG5cdFx0aWYgKHNlbmRlckF1dGhlbnRpY2F0ZWQpIHtcblx0XHRcdGlmICh0aGlzLl9jaGVja0ZpZWxkRm9yUGhpc2hpbmcoUmVwb3J0ZWRNYWlsRmllbGRUeXBlLkZST01fQUREUkVTUywgc2VuZGVyQWRkcmVzcykpIHtcblx0XHRcdFx0c2NvcmUgKz0gNlxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3Qgc2VuZGVyRG9tYWluID0gYWRkcmVzc0RvbWFpbihzZW5kZXJBZGRyZXNzKVxuXG5cdFx0XHRcdGlmICh0aGlzLl9jaGVja0ZpZWxkRm9yUGhpc2hpbmcoUmVwb3J0ZWRNYWlsRmllbGRUeXBlLkZST01fRE9NQUlOLCBzZW5kZXJEb21haW4pKSB7XG5cdFx0XHRcdFx0c2NvcmUgKz0gNlxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICh0aGlzLl9jaGVja0ZpZWxkRm9yUGhpc2hpbmcoUmVwb3J0ZWRNYWlsRmllbGRUeXBlLkZST01fQUREUkVTU19OT05fQVVUSCwgc2VuZGVyQWRkcmVzcykpIHtcblx0XHRcdFx0c2NvcmUgKz0gNlxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3Qgc2VuZGVyRG9tYWluID0gYWRkcmVzc0RvbWFpbihzZW5kZXJBZGRyZXNzKVxuXG5cdFx0XHRcdGlmICh0aGlzLl9jaGVja0ZpZWxkRm9yUGhpc2hpbmcoUmVwb3J0ZWRNYWlsRmllbGRUeXBlLkZST01fRE9NQUlOX05PTl9BVVRILCBzZW5kZXJEb21haW4pKSB7XG5cdFx0XHRcdFx0c2NvcmUgKz0gNlxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gV2UgY2hlY2sgdGhhdCBzdWJqZWN0IGV4aXN0cyBiZWNhdXNlIHdoZW4gdGhlcmUncyBhbiBlbmNyeXB0aW9uIGVycm9yIGl0IHdpbGwgYmUgbWlzc2luZ1xuXHRcdGlmIChtYWlsLnN1YmplY3QgJiYgdGhpcy5fY2hlY2tGaWVsZEZvclBoaXNoaW5nKFJlcG9ydGVkTWFpbEZpZWxkVHlwZS5TVUJKRUNULCBtYWlsLnN1YmplY3QpKSB7XG5cdFx0XHRzY29yZSArPSAzXG5cdFx0fVxuXG5cdFx0Zm9yIChjb25zdCBsaW5rIG9mIGxpbmtzKSB7XG5cdFx0XHRpZiAodGhpcy5fY2hlY2tGaWVsZEZvclBoaXNoaW5nKFJlcG9ydGVkTWFpbEZpZWxkVHlwZS5MSU5LLCBsaW5rLmhyZWYpKSB7XG5cdFx0XHRcdHNjb3JlICs9IDZcblx0XHRcdFx0YnJlYWtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IGRvbWFpbiA9IGdldFVybERvbWFpbihsaW5rLmhyZWYpXG5cblx0XHRcdFx0aWYgKGRvbWFpbiAmJiB0aGlzLl9jaGVja0ZpZWxkRm9yUGhpc2hpbmcoUmVwb3J0ZWRNYWlsRmllbGRUeXBlLkxJTktfRE9NQUlOLCBkb21haW4pKSB7XG5cdFx0XHRcdFx0c2NvcmUgKz0gNlxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRjb25zdCBoYXNTdXNwaWNpb3VzTGluayA9IGxpbmtzLnNvbWUoKHsgaHJlZiwgaW5uZXJIVE1MIH0pID0+IHtcblx0XHRcdGNvbnN0IGlubmVyVGV4dCA9IGh0bWxUb1RleHQoaW5uZXJIVE1MKVxuXHRcdFx0Y29uc3QgdGV4dFVybCA9IHBhcnNlVXJsKGlubmVyVGV4dClcblx0XHRcdGNvbnN0IGhyZWZVcmwgPSBwYXJzZVVybChocmVmKVxuXHRcdFx0cmV0dXJuIHRleHRVcmwgJiYgaHJlZlVybCAmJiB0ZXh0VXJsLmhvc3RuYW1lICE9PSBocmVmVXJsLmhvc3RuYW1lXG5cdFx0fSlcblxuXHRcdGlmIChoYXNTdXNwaWNpb3VzTGluaykge1xuXHRcdFx0c2NvcmUgKz0gNlxuXHRcdH1cblxuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoNyA8IHNjb3JlKVxuXHR9XG5cblx0YXN5bmMgZGVsZXRlRm9sZGVyKGlkOiBJZFR1cGxlKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3QgZGVsZXRlTWFpbEZvbGRlckRhdGEgPSBjcmVhdGVEZWxldGVNYWlsRm9sZGVyRGF0YSh7XG5cdFx0XHRmb2xkZXJzOiBbaWRdLFxuXHRcdH0pXG5cdFx0Ly8gVE9ETyBtYWtlIERlbGV0ZU1haWxGb2xkZXJEYXRhIHVuZW5jcnlwdGVkIGluIG5leHQgbW9kZWwgdmVyc2lvblxuXHRcdGF3YWl0IHRoaXMuc2VydmljZUV4ZWN1dG9yLmRlbGV0ZShNYWlsRm9sZGVyU2VydmljZSwgZGVsZXRlTWFpbEZvbGRlckRhdGEsIHsgc2Vzc2lvbktleTogXCJkdW1teVwiIGFzIGFueSB9KVxuXHR9XG5cblx0YXN5bmMgZml4dXBDb3VudGVyRm9yRm9sZGVyKGdyb3VwSWQ6IElkLCBmb2xkZXI6IE1haWxGb2xkZXIsIHVucmVhZE1haWxzOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCBjb3VudGVySWQgPSBnZXRFbGVtZW50SWQoZm9sZGVyKVxuXHRcdGNvbnN0IGRhdGEgPSBjcmVhdGVXcml0ZUNvdW50ZXJEYXRhKHtcblx0XHRcdGNvdW50ZXJUeXBlOiBDb3VudGVyVHlwZS5VbnJlYWRNYWlscyxcblx0XHRcdHJvdzogZ3JvdXBJZCxcblx0XHRcdGNvbHVtbjogY291bnRlcklkLFxuXHRcdFx0dmFsdWU6IFN0cmluZyh1bnJlYWRNYWlscyksXG5cdFx0fSlcblx0XHRhd2FpdCB0aGlzLnNlcnZpY2VFeGVjdXRvci5wb3N0KENvdW50ZXJTZXJ2aWNlLCBkYXRhKVxuXHR9XG5cblx0X2NoZWNrRmllbGRGb3JQaGlzaGluZyh0eXBlOiBSZXBvcnRlZE1haWxGaWVsZFR5cGUsIHZhbHVlOiBzdHJpbmcpOiBib29sZWFuIHtcblx0XHRjb25zdCBoYXNoID0gcGhpc2hpbmdNYXJrZXJWYWx1ZSh0eXBlLCB2YWx1ZSlcblx0XHRyZXR1cm4gdGhpcy5waGlzaGluZ01hcmtlcnMuaGFzKGhhc2gpXG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIGFkZFJlY2lwaWVudEtleURhdGEoYnVja2V0S2V5OiBBZXNLZXksIHNlbmREcmFmdERhdGE6IFNlbmREcmFmdERhdGEsIHJlY2lwaWVudHM6IEFycmF5PFJlY2lwaWVudD4sIHNlbmRlck1haWxHcm91cElkOiBJZCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IG5vdEZvdW5kUmVjaXBpZW50czogc3RyaW5nW10gPSBbXVxuXG5cdFx0Zm9yIChjb25zdCByZWNpcGllbnQgb2YgcmVjaXBpZW50cykge1xuXHRcdFx0aWYgKHJlY2lwaWVudC5hZGRyZXNzID09PSBTWVNURU1fR1JPVVBfTUFJTF9BRERSRVNTIHx8ICFyZWNpcGllbnQpIHtcblx0XHRcdFx0bm90Rm91bmRSZWNpcGllbnRzLnB1c2gocmVjaXBpZW50LmFkZHJlc3MpXG5cdFx0XHRcdGNvbnRpbnVlXG5cdFx0XHR9XG5cblx0XHRcdC8vIGNvcHkgcGFzc3dvcmQgaW5mb3JtYXRpb24gaWYgdGhpcyBpcyBhbiBleHRlcm5hbCBjb250YWN0XG5cdFx0XHQvLyBvdGhlcndpc2UgbG9hZCB0aGUga2V5IGluZm9ybWF0aW9uIGZyb20gdGhlIHNlcnZlclxuXHRcdFx0Y29uc3QgaXNTaGFyZWRNYWlsYm94U2VuZGVyID0gIWlzU2FtZUlkKHRoaXMudXNlckZhY2FkZS5nZXRHcm91cElkKEdyb3VwVHlwZS5NYWlsKSwgc2VuZGVyTWFpbEdyb3VwSWQpXG5cblx0XHRcdGlmIChyZWNpcGllbnQudHlwZSA9PT0gUmVjaXBpZW50VHlwZS5FWFRFUk5BTCkge1xuXHRcdFx0XHRjb25zdCBwYXNzcGhyYXNlID0gdGhpcy5nZXRDb250YWN0UGFzc3dvcmQocmVjaXBpZW50LmNvbnRhY3QpXG5cdFx0XHRcdGlmIChwYXNzcGhyYXNlID09IG51bGwgfHwgaXNTaGFyZWRNYWlsYm94U2VuZGVyKSB7XG5cdFx0XHRcdFx0Ly8gbm8gcGFzc3dvcmQgZ2l2ZW4gYW5kIHByZXZlbnQgc2VuZGluZyB0byBzZWN1cmUgZXh0ZXJuYWxzIGZyb20gc2hhcmVkIGdyb3VwXG5cdFx0XHRcdFx0bm90Rm91bmRSZWNpcGllbnRzLnB1c2gocmVjaXBpZW50LmFkZHJlc3MpXG5cdFx0XHRcdFx0Y29udGludWVcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IHNhbHQgPSBnZW5lcmF0ZVJhbmRvbVNhbHQoKVxuXHRcdFx0XHRjb25zdCBrZGZUeXBlID0gREVGQVVMVF9LREZfVFlQRVxuXHRcdFx0XHRjb25zdCBwYXNzd29yZEtleSA9IGF3YWl0IHRoaXMubG9naW5GYWNhZGUuZGVyaXZlVXNlclBhc3NwaHJhc2VLZXkoeyBrZGZUeXBlLCBwYXNzcGhyYXNlLCBzYWx0IH0pXG5cdFx0XHRcdGNvbnN0IHBhc3N3b3JkVmVyaWZpZXIgPSBjcmVhdGVBdXRoVmVyaWZpZXIocGFzc3dvcmRLZXkpXG5cdFx0XHRcdGNvbnN0IGV4dGVybmFsR3JvdXBLZXlzID0gYXdhaXQgdGhpcy5nZXRFeHRlcm5hbEdyb3VwS2V5cyhyZWNpcGllbnQuYWRkcmVzcywga2RmVHlwZSwgcGFzc3dvcmRLZXksIHBhc3N3b3JkVmVyaWZpZXIpXG5cdFx0XHRcdGNvbnN0IG93bmVyRW5jQnVja2V0S2V5ID0gZW5jcnlwdEtleVdpdGhWZXJzaW9uZWRLZXkoZXh0ZXJuYWxHcm91cEtleXMuY3VycmVudEV4dGVybmFsTWFpbEdyb3VwS2V5LCBidWNrZXRLZXkpXG5cdFx0XHRcdGNvbnN0IGRhdGEgPSBjcmVhdGVTZWN1cmVFeHRlcm5hbFJlY2lwaWVudEtleURhdGEoe1xuXHRcdFx0XHRcdG1haWxBZGRyZXNzOiByZWNpcGllbnQuYWRkcmVzcyxcblx0XHRcdFx0XHRrZGZWZXJzaW9uOiBrZGZUeXBlLFxuXHRcdFx0XHRcdG93bmVyRW5jQnVja2V0S2V5OiBvd25lckVuY0J1Y2tldEtleS5rZXksXG5cdFx0XHRcdFx0b3duZXJLZXlWZXJzaW9uOiBvd25lckVuY0J1Y2tldEtleS5lbmNyeXB0aW5nS2V5VmVyc2lvbi50b1N0cmluZygpLFxuXHRcdFx0XHRcdHBhc3N3b3JkVmVyaWZpZXI6IHBhc3N3b3JkVmVyaWZpZXIsXG5cdFx0XHRcdFx0c2FsdDogc2FsdCxcblx0XHRcdFx0XHRzYWx0SGFzaDogc2hhMjU2SGFzaChzYWx0KSxcblx0XHRcdFx0XHRwd0VuY0NvbW11bmljYXRpb25LZXk6IGVuY3J5cHRLZXkocGFzc3dvcmRLZXksIGV4dGVybmFsR3JvdXBLZXlzLmN1cnJlbnRFeHRlcm5hbFVzZXJHcm91cEtleS5vYmplY3QpLFxuXHRcdFx0XHRcdHVzZXJHcm91cEtleVZlcnNpb246IFN0cmluZyhleHRlcm5hbEdyb3VwS2V5cy5jdXJyZW50RXh0ZXJuYWxVc2VyR3JvdXBLZXkudmVyc2lvbiksXG5cdFx0XHRcdH0pXG5cdFx0XHRcdHNlbmREcmFmdERhdGEuc2VjdXJlRXh0ZXJuYWxSZWNpcGllbnRLZXlEYXRhLnB1c2goZGF0YSlcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IGtleURhdGEgPSBhd2FpdCB0aGlzLmNyeXB0by5lbmNyeXB0QnVja2V0S2V5Rm9ySW50ZXJuYWxSZWNpcGllbnQoXG5cdFx0XHRcdFx0aXNTaGFyZWRNYWlsYm94U2VuZGVyID8gc2VuZGVyTWFpbEdyb3VwSWQgOiB0aGlzLnVzZXJGYWNhZGUuZ2V0TG9nZ2VkSW5Vc2VyKCkudXNlckdyb3VwLmdyb3VwLFxuXHRcdFx0XHRcdGJ1Y2tldEtleSxcblx0XHRcdFx0XHRyZWNpcGllbnQuYWRkcmVzcyxcblx0XHRcdFx0XHRub3RGb3VuZFJlY2lwaWVudHMsXG5cdFx0XHRcdClcblx0XHRcdFx0aWYgKGtleURhdGEgPT0gbnVsbCkge1xuXHRcdFx0XHRcdC8vIGNhbm5vdCBhZGQgcmVjaXBpZW50IGJlY2F1c2Ugb2Ygbm90Rm91bmRFcnJvclxuXHRcdFx0XHRcdC8vIHdlIGRvIG5vdCB0aHJvdyBoZXJlIGJlY2F1c2Ugd2Ugd2FudCB0byBjb2xsZWN0IGFsbCBub3QgZm91bmQgcmVjaXBpZW50cyBmaXJzdFxuXHRcdFx0XHR9IGVsc2UgaWYgKGlzU2FtZVR5cGVSZWYoa2V5RGF0YS5fdHlwZSwgU3ltRW5jSW50ZXJuYWxSZWNpcGllbnRLZXlEYXRhVHlwZVJlZikpIHtcblx0XHRcdFx0XHRzZW5kRHJhZnREYXRhLnN5bUVuY0ludGVybmFsUmVjaXBpZW50S2V5RGF0YS5wdXNoKGtleURhdGEgYXMgU3ltRW5jSW50ZXJuYWxSZWNpcGllbnRLZXlEYXRhKVxuXHRcdFx0XHR9IGVsc2UgaWYgKGlzU2FtZVR5cGVSZWYoa2V5RGF0YS5fdHlwZSwgSW50ZXJuYWxSZWNpcGllbnRLZXlEYXRhVHlwZVJlZikpIHtcblx0XHRcdFx0XHRzZW5kRHJhZnREYXRhLmludGVybmFsUmVjaXBpZW50S2V5RGF0YS5wdXNoKGtleURhdGEgYXMgSW50ZXJuYWxSZWNpcGllbnRLZXlEYXRhKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKG5vdEZvdW5kUmVjaXBpZW50cy5sZW5ndGggPiAwKSB7XG5cdFx0XHR0aHJvdyBuZXcgUmVjaXBpZW50c05vdEZvdW5kRXJyb3Iobm90Rm91bmRSZWNpcGllbnRzLmpvaW4oXCJcXG5cIikpXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiB0aGUgZ2l2ZW4gc2VuZCBkcmFmdCBkYXRhIGNvbnRhaW5zIG9ubHkgZW5jcnlwdCBrZXlzIHRoYXQgaGF2ZSBiZWVuIGVuY3J5cHRlZCB3aXRoIFR1dGFDcnlwdCBwcm90b2NvbC5cblx0ICogQFZpc2libGVGb3JUZXN0aW5nXG5cdCAqIEBwYXJhbSBzZW5kRHJhZnREYXRhIFRoZSBzZW5kIGRyYWZ0YSBmb3IgdGhlIG1haWwgdGhhdCBzaG91bGQgYmUgc2VudFxuXHQgKi9cblx0aXNUdXRhQ3J5cHRNYWlsKHNlbmREcmFmdERhdGE6IFNlbmREcmFmdERhdGEpIHtcblx0XHQvLyBpZiBhbiBzZWN1cmUgZXh0ZXJuYWwgcmVjaXBpZW50IGlzIGludm9sdmVkIGluIHRoZSBjb252ZXJzYXRpb24gd2UgZG8gbm90IHVzZSBhc3ltbWV0cmljIGVuY3J5cHRpb25cblx0XHRpZiAoc2VuZERyYWZ0RGF0YS5zeW1FbmNJbnRlcm5hbFJlY2lwaWVudEtleURhdGEubGVuZ3RoID4gMCB8fCBzZW5kRHJhZnREYXRhLnNlY3VyZUV4dGVybmFsUmVjaXBpZW50S2V5RGF0YS5sZW5ndGgpIHtcblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdH1cblx0XHRpZiAoaXNFbXB0eShzZW5kRHJhZnREYXRhLmludGVybmFsUmVjaXBpZW50S2V5RGF0YSkpIHtcblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdH1cblx0XHRyZXR1cm4gc2VuZERyYWZ0RGF0YS5pbnRlcm5hbFJlY2lwaWVudEtleURhdGEuZXZlcnkoKHJlY2lwaWVudERhdGEpID0+IHJlY2lwaWVudERhdGEucHJvdG9jb2xWZXJzaW9uID09PSBDcnlwdG9Qcm90b2NvbFZlcnNpb24uVFVUQV9DUllQVClcblx0fVxuXG5cdHByaXZhdGUgZ2V0Q29udGFjdFBhc3N3b3JkKGNvbnRhY3Q6IENvbnRhY3QgfCBudWxsKTogc3RyaW5nIHwgbnVsbCB7XG5cdFx0cmV0dXJuIGNvbnRhY3Q/LnByZXNoYXJlZFBhc3N3b3JkID8/IG51bGxcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgdGhhdCBhbiBleHRlcm5hbCB1c2VyIGluc3RhbmNlIHdpdGggYSBtYWlsIGJveCBleGlzdHMgZm9yIHRoZSBnaXZlbiByZWNpcGllbnQuIElmIGl0IGRvZXMgbm90IGV4aXN0LCBpdCBpcyBjcmVhdGVkLlxuXHQgKiBSZXR1cm5zIHRoZSB1c2VyIGdyb3VwIGtleSBhbmQgdGhlIHVzZXIgbWFpbCBncm91cCBrZXkgb2YgdGhlIGV4dGVybmFsIHJlY2lwaWVudC5cblx0ICogQHBhcmFtIHJlY2lwaWVudE1haWxBZGRyZXNzXG5cdCAqIEBwYXJhbSBleHRlcm5hbFVzZXJLZGZUeXBlIHRoZSBrZGYgdHlwZSB1c2VkIHRvIGRlcml2ZSBleHRlcm5hbFVzZXJQd0tleVxuXHQgKiBAcGFyYW0gZXh0ZXJuYWxVc2VyUHdLZXkgVGhlIGV4dGVybmFsIHVzZXIncyBwYXNzd29yZCBrZXkuXG5cdCAqIEBwYXJhbSB2ZXJpZmllciBUaGUgZXh0ZXJuYWwgdXNlcidzIHZlcmlmaWVyLCBiYXNlNjQgZW5jb2RlZC5cblx0ICogQHJldHVybiBSZXNvbHZlcyB0byB0aGUgZXh0ZXJuYWwgdXNlcidzIGdyb3VwIGtleSBhbmQgdGhlIGV4dGVybmFsIHVzZXIncyBtYWlsIGdyb3VwIGtleSwgcmVqZWN0ZWQgaWYgYW4gZXJyb3Igb2NjdXJyZWRcblx0ICovXG5cdHByaXZhdGUgYXN5bmMgZ2V0RXh0ZXJuYWxHcm91cEtleXMoXG5cdFx0cmVjaXBpZW50TWFpbEFkZHJlc3M6IHN0cmluZyxcblx0XHRleHRlcm5hbFVzZXJLZGZUeXBlOiBLZGZUeXBlLFxuXHRcdGV4dGVybmFsVXNlclB3S2V5OiBBZXNLZXksXG5cdFx0dmVyaWZpZXI6IFVpbnQ4QXJyYXksXG5cdCk6IFByb21pc2U8eyBjdXJyZW50RXh0ZXJuYWxVc2VyR3JvdXBLZXk6IFZlcnNpb25lZEtleTsgY3VycmVudEV4dGVybmFsTWFpbEdyb3VwS2V5OiBWZXJzaW9uZWRLZXkgfT4ge1xuXHRcdGNvbnN0IGdyb3VwUm9vdCA9IGF3YWl0IHRoaXMuZW50aXR5Q2xpZW50LmxvYWRSb290KEdyb3VwUm9vdFR5cGVSZWYsIHRoaXMudXNlckZhY2FkZS5nZXRVc2VyR3JvdXBJZCgpKVxuXHRcdGNvbnN0IGNsZWFuZWRNYWlsQWRkcmVzcyA9IHJlY2lwaWVudE1haWxBZGRyZXNzLnRyaW0oKS50b0xvY2FsZUxvd2VyQ2FzZSgpXG5cdFx0Y29uc3QgbWFpbEFkZHJlc3NJZCA9IHN0cmluZ1RvQ3VzdG9tSWQoY2xlYW5lZE1haWxBZGRyZXNzKVxuXG5cdFx0bGV0IGV4dGVybmFsVXNlclJlZmVyZW5jZTogRXh0ZXJuYWxVc2VyUmVmZXJlbmNlXG5cdFx0dHJ5IHtcblx0XHRcdGV4dGVybmFsVXNlclJlZmVyZW5jZSA9IGF3YWl0IHRoaXMuZW50aXR5Q2xpZW50LmxvYWQoRXh0ZXJuYWxVc2VyUmVmZXJlbmNlVHlwZVJlZiwgW2dyb3VwUm9vdC5leHRlcm5hbFVzZXJSZWZlcmVuY2VzLCBtYWlsQWRkcmVzc0lkXSlcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRpZiAoZSBpbnN0YW5jZW9mIE5vdEZvdW5kRXJyb3IpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY3JlYXRlRXh0ZXJuYWxVc2VyKGNsZWFuZWRNYWlsQWRkcmVzcywgZXh0ZXJuYWxVc2VyS2RmVHlwZSwgZXh0ZXJuYWxVc2VyUHdLZXksIHZlcmlmaWVyKVxuXHRcdFx0fVxuXHRcdFx0dGhyb3cgZVxuXHRcdH1cblxuXHRcdGNvbnN0IGV4dGVybmFsVXNlciA9IGF3YWl0IHRoaXMuZW50aXR5Q2xpZW50LmxvYWQoVXNlclR5cGVSZWYsIGV4dGVybmFsVXNlclJlZmVyZW5jZS51c2VyKVxuXHRcdGNvbnN0IGV4dGVybmFsVXNlckdyb3VwSWQgPSBleHRlcm5hbFVzZXJSZWZlcmVuY2UudXNlckdyb3VwXG5cdFx0Y29uc3QgZXh0ZXJuYWxNYWlsR3JvdXBJZCA9IGFzc2VydE5vdE51bGwoXG5cdFx0XHRleHRlcm5hbFVzZXIubWVtYmVyc2hpcHMuZmluZCgobSkgPT4gbS5ncm91cFR5cGUgPT09IEdyb3VwVHlwZS5NYWlsKSxcblx0XHRcdFwibm8gbWFpbCBncm91cCBtZW1iZXJzaGlwIG9uIGV4dGVybmFsIHVzZXJcIixcblx0XHQpLmdyb3VwXG5cblx0XHRjb25zdCBleHRlcm5hbE1haWxHcm91cCA9IGF3YWl0IHRoaXMuZW50aXR5Q2xpZW50LmxvYWQoR3JvdXBUeXBlUmVmLCBleHRlcm5hbE1haWxHcm91cElkKVxuXHRcdGNvbnN0IGV4dGVybmFsVXNlckdyb3VwID0gYXdhaXQgdGhpcy5lbnRpdHlDbGllbnQubG9hZChHcm91cFR5cGVSZWYsIGV4dGVybmFsVXNlckdyb3VwSWQpXG5cdFx0Y29uc3QgcmVxdWlyZWRJbnRlcm5hbFVzZXJHcm91cEtleVZlcnNpb24gPSBwYXJzZUtleVZlcnNpb24oZXh0ZXJuYWxVc2VyR3JvdXAuYWRtaW5Hcm91cEtleVZlcnNpb24gPz8gXCIwXCIpXG5cdFx0Y29uc3QgcmVxdWlyZWRFeHRlcm5hbFVzZXJHcm91cEtleVZlcnNpb24gPSBwYXJzZUtleVZlcnNpb24oZXh0ZXJuYWxNYWlsR3JvdXAuYWRtaW5Hcm91cEtleVZlcnNpb24gPz8gXCIwXCIpXG5cdFx0Y29uc3QgaW50ZXJuYWxVc2VyRW5jRXh0ZXJuYWxVc2VyS2V5ID0gYXNzZXJ0Tm90TnVsbChleHRlcm5hbFVzZXJHcm91cC5hZG1pbkdyb3VwRW5jR0tleSwgXCJubyBhZG1pbkdyb3VwRW5jR0tleSBvbiBleHRlcm5hbCB1c2VyIGdyb3VwXCIpXG5cdFx0Y29uc3QgZXh0ZXJuYWxVc2VyRW5jRXh0ZXJuYWxNYWlsS2V5ID0gYXNzZXJ0Tm90TnVsbChleHRlcm5hbE1haWxHcm91cC5hZG1pbkdyb3VwRW5jR0tleSwgXCJubyBhZG1pbkdyb3VwRW5jR0tleSBvbiBleHRlcm5hbCBtYWlsIGdyb3VwXCIpXG5cdFx0Y29uc3QgcmVxdWlyZWRJbnRlcm5hbFVzZXJHcm91cEtleSA9IGF3YWl0IHRoaXMua2V5TG9hZGVyRmFjYWRlLmxvYWRTeW1Hcm91cEtleSh0aGlzLnVzZXJGYWNhZGUuZ2V0VXNlckdyb3VwSWQoKSwgcmVxdWlyZWRJbnRlcm5hbFVzZXJHcm91cEtleVZlcnNpb24pXG5cdFx0Y29uc3QgY3VycmVudEV4dGVybmFsVXNlckdyb3VwS2V5ID0ge1xuXHRcdFx0b2JqZWN0OiBkZWNyeXB0S2V5KHJlcXVpcmVkSW50ZXJuYWxVc2VyR3JvdXBLZXksIGludGVybmFsVXNlckVuY0V4dGVybmFsVXNlcktleSksXG5cdFx0XHR2ZXJzaW9uOiBwYXJzZUtleVZlcnNpb24oZXh0ZXJuYWxVc2VyR3JvdXAuZ3JvdXBLZXlWZXJzaW9uKSxcblx0XHR9XG5cdFx0Y29uc3QgcmVxdWlyZWRFeHRlcm5hbFVzZXJHcm91cEtleSA9IGF3YWl0IHRoaXMua2V5TG9hZGVyRmFjYWRlLmxvYWRTeW1Hcm91cEtleShcblx0XHRcdGV4dGVybmFsVXNlckdyb3VwSWQsXG5cdFx0XHRyZXF1aXJlZEV4dGVybmFsVXNlckdyb3VwS2V5VmVyc2lvbixcblx0XHRcdGN1cnJlbnRFeHRlcm5hbFVzZXJHcm91cEtleSxcblx0XHQpXG5cdFx0Y29uc3QgY3VycmVudEV4dGVybmFsTWFpbEdyb3VwS2V5ID0ge1xuXHRcdFx0b2JqZWN0OiBkZWNyeXB0S2V5KHJlcXVpcmVkRXh0ZXJuYWxVc2VyR3JvdXBLZXksIGV4dGVybmFsVXNlckVuY0V4dGVybmFsTWFpbEtleSksXG5cdFx0XHR2ZXJzaW9uOiBwYXJzZUtleVZlcnNpb24oZXh0ZXJuYWxNYWlsR3JvdXAuZ3JvdXBLZXlWZXJzaW9uKSxcblx0XHR9XG5cdFx0cmV0dXJuIHtcblx0XHRcdGN1cnJlbnRFeHRlcm5hbFVzZXJHcm91cEtleSxcblx0XHRcdGN1cnJlbnRFeHRlcm5hbE1haWxHcm91cEtleSxcblx0XHR9XG5cdH1cblxuXHRnZXRSZWNpcGllbnRLZXlEYXRhKG1haWxBZGRyZXNzOiBzdHJpbmcpOiBQcm9taXNlPFZlcnNpb25lZDxQdWJsaWNLZXlzPiB8IG51bGw+IHtcblx0XHRyZXR1cm4gdGhpcy5wdWJsaWNLZXlQcm92aWRlclxuXHRcdFx0LmxvYWRDdXJyZW50UHViS2V5KHtcblx0XHRcdFx0aWRlbnRpZmllclR5cGU6IFB1YmxpY0tleUlkZW50aWZpZXJUeXBlLk1BSUxfQUREUkVTUyxcblx0XHRcdFx0aWRlbnRpZmllcjogbWFpbEFkZHJlc3MsXG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKG9mQ2xhc3MoTm90Rm91bmRFcnJvciwgKCkgPT4gbnVsbCkpXG5cdH1cblxuXHRlbnRpdHlFdmVudHNSZWNlaXZlZChkYXRhOiBFbnRpdHlVcGRhdGVbXSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHJldHVybiBwcm9taXNlTWFwKGRhdGEsICh1cGRhdGUpID0+IHtcblx0XHRcdGlmIChcblx0XHRcdFx0dGhpcy5kZWZlcnJlZERyYWZ0VXBkYXRlICE9IG51bGwgJiZcblx0XHRcdFx0dGhpcy5kZWZlcnJlZERyYWZ0SWQgIT0gbnVsbCAmJlxuXHRcdFx0XHR1cGRhdGUub3BlcmF0aW9uID09PSBPcGVyYXRpb25UeXBlLlVQREFURSAmJlxuXHRcdFx0XHRpc1NhbWVUeXBlUmVmQnlBdHRyKE1haWxUeXBlUmVmLCB1cGRhdGUuYXBwbGljYXRpb24sIHVwZGF0ZS50eXBlKSAmJlxuXHRcdFx0XHRpc1NhbWVJZCh0aGlzLmRlZmVycmVkRHJhZnRJZCwgW3VwZGF0ZS5pbnN0YW5jZUxpc3RJZCwgdXBkYXRlLmluc3RhbmNlSWRdKVxuXHRcdFx0KSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLmVudGl0eUNsaWVudFxuXHRcdFx0XHRcdC5sb2FkKE1haWxUeXBlUmVmLCB0aGlzLmRlZmVycmVkRHJhZnRJZClcblx0XHRcdFx0XHQudGhlbigobWFpbCkgPT4ge1xuXHRcdFx0XHRcdFx0Y29uc3QgZGVmZXJyZWRQcm9taXNlV3JhcHBlciA9IGFzc2VydE5vdE51bGwodGhpcy5kZWZlcnJlZERyYWZ0VXBkYXRlLCBcImRlZmVycmVkRHJhZnRVcGRhdGUgd2VudCBhd2F5P1wiKVxuXHRcdFx0XHRcdFx0dGhpcy5kZWZlcnJlZERyYWZ0VXBkYXRlID0gbnVsbFxuXHRcdFx0XHRcdFx0ZGVmZXJyZWRQcm9taXNlV3JhcHBlci5yZXNvbHZlKG1haWwpXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuY2F0Y2goXG5cdFx0XHRcdFx0XHRvZkNsYXNzKE5vdEZvdW5kRXJyb3IsICgpID0+IHtcblx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coYENvdWxkIG5vdCBmaW5kIHVwZGF0ZWQgbWFpbCAke0pTT04uc3RyaW5naWZ5KFt1cGRhdGUuaW5zdGFuY2VMaXN0SWQsIHVwZGF0ZS5pbnN0YW5jZUlkXSl9YClcblx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdClcblx0XHRcdH1cblx0XHR9KS50aGVuKG5vT3ApXG5cdH1cblxuXHQvKipcblx0ICogQHBhcmFtIG1hcmtlcnMgb25seSBwaGlzaGluZyAobm90IHNwYW0pIG1hcmtlcnMgd2lsbCBiZSBzZW50IGFzIGV2ZW50IGJ1cyB1cGRhdGVzXG5cdCAqL1xuXHRwaGlzaGluZ01hcmtlcnNVcGRhdGVSZWNlaXZlZChtYXJrZXJzOiBSZXBvcnRlZE1haWxGaWVsZE1hcmtlcltdKSB7XG5cdFx0Zm9yIChjb25zdCBtYXJrZXIgb2YgbWFya2Vycykge1xuXHRcdFx0aWYgKG1hcmtlci5zdGF0dXMgPT09IFBoaXNoaW5nTWFya2VyU3RhdHVzLklOQUNUSVZFKSB7XG5cdFx0XHRcdHRoaXMucGhpc2hpbmdNYXJrZXJzLmRlbGV0ZShtYXJrZXIubWFya2VyKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5waGlzaGluZ01hcmtlcnMuYWRkKG1hcmtlci5tYXJrZXIpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBjcmVhdGVFeHRlcm5hbFVzZXIoY2xlYW5lZE1haWxBZGRyZXNzOiBzdHJpbmcsIGV4dGVybmFsVXNlcktkZlR5cGU6IEtkZlR5cGUsIGV4dGVybmFsVXNlclB3S2V5OiBBZXNLZXksIHZlcmlmaWVyOiBVaW50OEFycmF5KSB7XG5cdFx0Y29uc3QgaW50ZXJuYWxVc2VyR3JvdXBLZXkgPSB0aGlzLnVzZXJGYWNhZGUuZ2V0Q3VycmVudFVzZXJHcm91cEtleSgpXG5cdFx0Y29uc3QgaW50ZXJuYWxNYWlsR3JvdXBLZXkgPSBhd2FpdCB0aGlzLmtleUxvYWRlckZhY2FkZS5nZXRDdXJyZW50U3ltR3JvdXBLZXkodGhpcy51c2VyRmFjYWRlLmdldEdyb3VwSWQoR3JvdXBUeXBlLk1haWwpKVxuXG5cdFx0Y29uc3QgY3VycmVudEV4dGVybmFsVXNlckdyb3VwS2V5ID0gZnJlc2hWZXJzaW9uZWQoYWVzMjU2UmFuZG9tS2V5KCkpXG5cdFx0Y29uc3QgY3VycmVudEV4dGVybmFsTWFpbEdyb3VwS2V5ID0gZnJlc2hWZXJzaW9uZWQoYWVzMjU2UmFuZG9tS2V5KCkpXG5cdFx0Y29uc3QgZXh0ZXJuYWxVc2VyR3JvdXBJbmZvU2Vzc2lvbktleSA9IGFlczI1NlJhbmRvbUtleSgpXG5cdFx0Y29uc3QgZXh0ZXJuYWxNYWlsR3JvdXBJbmZvU2Vzc2lvbktleSA9IGFlczI1NlJhbmRvbUtleSgpXG5cdFx0Y29uc3QgdHV0YW5vdGFQcm9wZXJ0aWVzU2Vzc2lvbktleSA9IGFlczI1NlJhbmRvbUtleSgpXG5cdFx0Y29uc3QgbWFpbGJveFNlc3Npb25LZXkgPSBhZXMyNTZSYW5kb21LZXkoKVxuXHRcdGNvbnN0IGV4dGVybmFsVXNlckVuY0VudHJvcHkgPSBlbmNyeXB0Qnl0ZXMoY3VycmVudEV4dGVybmFsVXNlckdyb3VwS2V5Lm9iamVjdCwgcmFuZG9tLmdlbmVyYXRlUmFuZG9tRGF0YSgzMikpXG5cblx0XHRjb25zdCBpbnRlcm5hbFVzZXJFbmNHcm91cEtleSA9IGVuY3J5cHRLZXlXaXRoVmVyc2lvbmVkS2V5KGludGVybmFsVXNlckdyb3VwS2V5LCBjdXJyZW50RXh0ZXJuYWxVc2VyR3JvdXBLZXkub2JqZWN0KVxuXHRcdGNvbnN0IHVzZXJHcm91cERhdGEgPSBjcmVhdGVDcmVhdGVFeHRlcm5hbFVzZXJHcm91cERhdGEoe1xuXHRcdFx0bWFpbEFkZHJlc3M6IGNsZWFuZWRNYWlsQWRkcmVzcyxcblx0XHRcdGV4dGVybmFsUHdFbmNVc2VyR3JvdXBLZXk6IGVuY3J5cHRLZXkoZXh0ZXJuYWxVc2VyUHdLZXksIGN1cnJlbnRFeHRlcm5hbFVzZXJHcm91cEtleS5vYmplY3QpLFxuXHRcdFx0aW50ZXJuYWxVc2VyRW5jVXNlckdyb3VwS2V5OiBpbnRlcm5hbFVzZXJFbmNHcm91cEtleS5rZXksXG5cdFx0XHRpbnRlcm5hbFVzZXJHcm91cEtleVZlcnNpb246IGludGVybmFsVXNlckVuY0dyb3VwS2V5LmVuY3J5cHRpbmdLZXlWZXJzaW9uLnRvU3RyaW5nKCksXG5cdFx0fSlcblxuXHRcdGNvbnN0IGV4dGVybmFsVXNlckVuY1VzZXJHcm91cEluZm9TZXNzaW9uS2V5ID0gZW5jcnlwdEtleVdpdGhWZXJzaW9uZWRLZXkoY3VycmVudEV4dGVybmFsVXNlckdyb3VwS2V5LCBleHRlcm5hbFVzZXJHcm91cEluZm9TZXNzaW9uS2V5KVxuXHRcdGNvbnN0IGV4dGVybmFsVXNlckVuY01haWxHcm91cEtleSA9IGVuY3J5cHRLZXlXaXRoVmVyc2lvbmVkS2V5KGN1cnJlbnRFeHRlcm5hbFVzZXJHcm91cEtleSwgY3VycmVudEV4dGVybmFsTWFpbEdyb3VwS2V5Lm9iamVjdClcblx0XHRjb25zdCBleHRlcm5hbFVzZXJFbmNUdXRhbm90YVByb3BlcnRpZXNTZXNzaW9uS2V5ID0gZW5jcnlwdEtleVdpdGhWZXJzaW9uZWRLZXkoY3VycmVudEV4dGVybmFsVXNlckdyb3VwS2V5LCB0dXRhbm90YVByb3BlcnRpZXNTZXNzaW9uS2V5KVxuXG5cdFx0Y29uc3QgZXh0ZXJuYWxNYWlsRW5jTWFpbEdyb3VwSW5mb1Nlc3Npb25LZXkgPSBlbmNyeXB0S2V5V2l0aFZlcnNpb25lZEtleShjdXJyZW50RXh0ZXJuYWxNYWlsR3JvdXBLZXksIGV4dGVybmFsTWFpbEdyb3VwSW5mb1Nlc3Npb25LZXkpXG5cdFx0Y29uc3QgZXh0ZXJuYWxNYWlsRW5jTWFpbEJveFNlc3Npb25LZXkgPSBlbmNyeXB0S2V5V2l0aFZlcnNpb25lZEtleShjdXJyZW50RXh0ZXJuYWxNYWlsR3JvdXBLZXksIG1haWxib3hTZXNzaW9uS2V5KVxuXG5cdFx0Y29uc3QgaW50ZXJuYWxNYWlsRW5jVXNlckdyb3VwSW5mb1Nlc3Npb25LZXkgPSBlbmNyeXB0S2V5V2l0aFZlcnNpb25lZEtleShpbnRlcm5hbE1haWxHcm91cEtleSwgZXh0ZXJuYWxVc2VyR3JvdXBJbmZvU2Vzc2lvbktleSlcblx0XHRjb25zdCBpbnRlcm5hbE1haWxFbmNNYWlsR3JvdXBJbmZvU2Vzc2lvbktleSA9IGVuY3J5cHRLZXlXaXRoVmVyc2lvbmVkS2V5KGludGVybmFsTWFpbEdyb3VwS2V5LCBleHRlcm5hbE1haWxHcm91cEluZm9TZXNzaW9uS2V5KVxuXG5cdFx0Y29uc3QgZXh0ZXJuYWxVc2VyRGF0YSA9IGNyZWF0ZUV4dGVybmFsVXNlckRhdGEoe1xuXHRcdFx0dmVyaWZpZXIsXG5cdFx0XHR1c2VyR3JvdXBEYXRhLFxuXHRcdFx0a2RmVmVyc2lvbjogZXh0ZXJuYWxVc2VyS2RmVHlwZSxcblxuXHRcdFx0ZXh0ZXJuYWxVc2VyRW5jRW50cm9weSxcblx0XHRcdGV4dGVybmFsVXNlckVuY1VzZXJHcm91cEluZm9TZXNzaW9uS2V5OiBleHRlcm5hbFVzZXJFbmNVc2VyR3JvdXBJbmZvU2Vzc2lvbktleS5rZXksXG5cdFx0XHRleHRlcm5hbFVzZXJFbmNNYWlsR3JvdXBLZXk6IGV4dGVybmFsVXNlckVuY01haWxHcm91cEtleS5rZXksXG5cdFx0XHRleHRlcm5hbFVzZXJFbmNUdXRhbm90YVByb3BlcnRpZXNTZXNzaW9uS2V5OiBleHRlcm5hbFVzZXJFbmNUdXRhbm90YVByb3BlcnRpZXNTZXNzaW9uS2V5LmtleSxcblxuXHRcdFx0ZXh0ZXJuYWxNYWlsRW5jTWFpbEdyb3VwSW5mb1Nlc3Npb25LZXk6IGV4dGVybmFsTWFpbEVuY01haWxHcm91cEluZm9TZXNzaW9uS2V5LmtleSxcblx0XHRcdGV4dGVybmFsTWFpbEVuY01haWxCb3hTZXNzaW9uS2V5OiBleHRlcm5hbE1haWxFbmNNYWlsQm94U2Vzc2lvbktleS5rZXksXG5cblx0XHRcdGludGVybmFsTWFpbEVuY1VzZXJHcm91cEluZm9TZXNzaW9uS2V5OiBpbnRlcm5hbE1haWxFbmNVc2VyR3JvdXBJbmZvU2Vzc2lvbktleS5rZXksXG5cdFx0XHRpbnRlcm5hbE1haWxFbmNNYWlsR3JvdXBJbmZvU2Vzc2lvbktleTogaW50ZXJuYWxNYWlsRW5jTWFpbEdyb3VwSW5mb1Nlc3Npb25LZXkua2V5LFxuXHRcdFx0aW50ZXJuYWxNYWlsR3JvdXBLZXlWZXJzaW9uOiBpbnRlcm5hbE1haWxHcm91cEtleS52ZXJzaW9uLnRvU3RyaW5nKCksXG5cdFx0fSlcblx0XHRhd2FpdCB0aGlzLnNlcnZpY2VFeGVjdXRvci5wb3N0KEV4dGVybmFsVXNlclNlcnZpY2UsIGV4dGVybmFsVXNlckRhdGEpXG5cdFx0cmV0dXJuIHtcblx0XHRcdGN1cnJlbnRFeHRlcm5hbFVzZXJHcm91cEtleSxcblx0XHRcdGN1cnJlbnRFeHRlcm5hbE1haWxHcm91cEtleSxcblx0XHR9XG5cdH1cblxuXHRfZ2V0TWFpbEdyb3VwSWRGb3JNYWlsQWRkcmVzcyh1c2VyOiBVc2VyLCBtYWlsQWRkcmVzczogc3RyaW5nKTogUHJvbWlzZTxJZD4ge1xuXHRcdHJldHVybiBwcm9taXNlRmlsdGVyKGdldFVzZXJHcm91cE1lbWJlcnNoaXBzKHVzZXIsIEdyb3VwVHlwZS5NYWlsKSwgKGdyb3VwTWVtYmVyc2hpcCkgPT4ge1xuXHRcdFx0cmV0dXJuIHRoaXMuZW50aXR5Q2xpZW50LmxvYWQoR3JvdXBUeXBlUmVmLCBncm91cE1lbWJlcnNoaXAuZ3JvdXApLnRoZW4oKG1haWxHcm91cCkgPT4ge1xuXHRcdFx0XHRpZiAobWFpbEdyb3VwLnVzZXIgPT0gbnVsbCkge1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLmVudGl0eUNsaWVudC5sb2FkKEdyb3VwSW5mb1R5cGVSZWYsIGdyb3VwTWVtYmVyc2hpcC5ncm91cEluZm8pLnRoZW4oKG1haWxHcm91cEluZm8pID0+IHtcblx0XHRcdFx0XHRcdHJldHVybiBjb250YWlucyhnZXRFbmFibGVkTWFpbEFkZHJlc3Nlc0Zvckdyb3VwSW5mbyhtYWlsR3JvdXBJbmZvKSwgbWFpbEFkZHJlc3MpXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0fSBlbHNlIGlmIChpc1NhbWVJZChtYWlsR3JvdXAudXNlciwgdXNlci5faWQpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuZW50aXR5Q2xpZW50LmxvYWQoR3JvdXBJbmZvVHlwZVJlZiwgdXNlci51c2VyR3JvdXAuZ3JvdXBJbmZvKS50aGVuKCh1c2VyR3JvdXBJbmZvKSA9PiB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gY29udGFpbnMoZ2V0RW5hYmxlZE1haWxBZGRyZXNzZXNGb3JHcm91cEluZm8odXNlckdyb3VwSW5mbyksIG1haWxBZGRyZXNzKVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gbm90IHN1cHBvcnRlZFxuXHRcdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdH0pLnRoZW4oKGZpbHRlcmVkTWVtYmVyc2hpcHMpID0+IHtcblx0XHRcdGlmIChmaWx0ZXJlZE1lbWJlcnNoaXBzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHRyZXR1cm4gZmlsdGVyZWRNZW1iZXJzaGlwc1swXS5ncm91cFxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhyb3cgbmV3IE5vdEZvdW5kRXJyb3IoXCJncm91cCBmb3IgbWFpbCBhZGRyZXNzIG5vdCBmb3VuZCBcIiArIG1haWxBZGRyZXNzKVxuXHRcdFx0fVxuXHRcdH0pXG5cdH1cblxuXHRhc3luYyBjbGVhckZvbGRlcihmb2xkZXJJZDogSWRUdXBsZSkge1xuXHRcdGNvbnN0IGRlbGV0ZU1haWxEYXRhID0gY3JlYXRlRGVsZXRlTWFpbERhdGEoe1xuXHRcdFx0Zm9sZGVyOiBmb2xkZXJJZCxcblx0XHRcdG1haWxzOiBbXSxcblx0XHR9KVxuXHRcdGF3YWl0IHRoaXMuc2VydmljZUV4ZWN1dG9yLmRlbGV0ZShNYWlsU2VydmljZSwgZGVsZXRlTWFpbERhdGEpXG5cdH1cblxuXHRhc3luYyB1bnN1YnNjcmliZShtYWlsSWQ6IElkVHVwbGUsIHJlY2lwaWVudDogc3RyaW5nLCBoZWFkZXJzOiBzdHJpbmdbXSkge1xuXHRcdGNvbnN0IHBvc3REYXRhID0gY3JlYXRlTGlzdFVuc3Vic2NyaWJlRGF0YSh7XG5cdFx0XHRtYWlsOiBtYWlsSWQsXG5cdFx0XHRyZWNpcGllbnQsXG5cdFx0XHRoZWFkZXJzOiBoZWFkZXJzLmpvaW4oXCJcXG5cIiksXG5cdFx0fSlcblx0XHRhd2FpdCB0aGlzLnNlcnZpY2VFeGVjdXRvci5wb3N0KExpc3RVbnN1YnNjcmliZVNlcnZpY2UsIHBvc3REYXRhKVxuXHR9XG5cblx0YXN5bmMgbG9hZEF0dGFjaG1lbnRzKG1haWw6IE1haWwpOiBQcm9taXNlPFR1dGFub3RhRmlsZVtdPiB7XG5cdFx0aWYgKG1haWwuYXR0YWNobWVudHMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRyZXR1cm4gW11cblx0XHR9XG5cdFx0Y29uc3QgYXR0YWNobWVudHNMaXN0SWQgPSBsaXN0SWRQYXJ0KG1haWwuYXR0YWNobWVudHNbMF0pXG5cdFx0Y29uc3QgYXR0YWNobWVudEVsZW1lbnRJZHMgPSBtYWlsLmF0dGFjaG1lbnRzLm1hcChlbGVtZW50SWRQYXJ0KVxuXG5cdFx0Y29uc3QgYnVja2V0S2V5ID0gbWFpbC5idWNrZXRLZXlcblx0XHRsZXQgb3duZXJFbmNTZXNzaW9uS2V5UHJvdmlkZXI6IE93bmVyRW5jU2Vzc2lvbktleVByb3ZpZGVyIHwgdW5kZWZpbmVkXG5cdFx0aWYgKGJ1Y2tldEtleSkge1xuXHRcdFx0Y29uc3QgdHlwZU1vZGVsID0gYXdhaXQgcmVzb2x2ZVR5cGVSZWZlcmVuY2UoRmlsZVR5cGVSZWYpXG5cdFx0XHRjb25zdCByZXNvbHZlZFNlc3Npb25LZXlzID0gYXdhaXQgdGhpcy5jcnlwdG8ucmVzb2x2ZVdpdGhCdWNrZXRLZXkoYXNzZXJ0Tm90TnVsbChtYWlsLmJ1Y2tldEtleSksIG1haWwsIHR5cGVNb2RlbClcblx0XHRcdG93bmVyRW5jU2Vzc2lvbktleVByb3ZpZGVyID0gYXN5bmMgKGluc3RhbmNlRWxlbWVudElkOiBJZCk6IFByb21pc2U8VmVyc2lvbmVkRW5jcnlwdGVkS2V5PiA9PiB7XG5cdFx0XHRcdGNvbnN0IGluc3RhbmNlU2Vzc2lvbktleSA9IGFzc2VydE5vdE51bGwoXG5cdFx0XHRcdFx0cmVzb2x2ZWRTZXNzaW9uS2V5cy5pbnN0YW5jZVNlc3Npb25LZXlzLmZpbmQoKGluc3RhbmNlU2Vzc2lvbktleSkgPT4gaW5zdGFuY2VFbGVtZW50SWQgPT09IGluc3RhbmNlU2Vzc2lvbktleS5pbnN0YW5jZUlkKSxcblx0XHRcdFx0KVxuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdGtleTogaW5zdGFuY2VTZXNzaW9uS2V5LnN5bUVuY1Nlc3Npb25LZXksXG5cdFx0XHRcdFx0ZW5jcnlwdGluZ0tleVZlcnNpb246IHBhcnNlS2V5VmVyc2lvbihpbnN0YW5jZVNlc3Npb25LZXkuc3ltS2V5VmVyc2lvbiksXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGF3YWl0IHRoaXMuZW50aXR5Q2xpZW50LmxvYWRNdWx0aXBsZShGaWxlVHlwZVJlZiwgYXR0YWNobWVudHNMaXN0SWQsIGF0dGFjaG1lbnRFbGVtZW50SWRzLCBvd25lckVuY1Nlc3Npb25LZXlQcm92aWRlcilcblx0fVxuXG5cdC8qKlxuXHQgKiBAcGFyYW0gbWFpbCBpbiBjYXNlIGl0IGlzIGEgbWFpbERldGFpbHNCbG9iXG5cdCAqL1xuXHRhc3luYyBsb2FkTWFpbERldGFpbHNCbG9iKG1haWw6IE1haWwpOiBQcm9taXNlPE1haWxEZXRhaWxzPiB7XG5cdFx0Ly8gaWYgaXNEcmFmdFxuXHRcdGlmIChtYWlsLm1haWxEZXRhaWxzRHJhZnQgIT0gbnVsbCkge1xuXHRcdFx0dGhyb3cgbmV3IFByb2dyYW1taW5nRXJyb3IoXCJub3Qgc3VwcG9ydGVkLCBtdXN0IGJlIG1haWwgZGV0YWlscyBibG9iXCIpXG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IG1haWxEZXRhaWxzQmxvYklkID0gYXNzZXJ0Tm90TnVsbChtYWlsLm1haWxEZXRhaWxzKVxuXG5cdFx0XHRjb25zdCBtYWlsRGV0YWlsc0Jsb2JzID0gYXdhaXQgdGhpcy5lbnRpdHlDbGllbnQubG9hZE11bHRpcGxlKFxuXHRcdFx0XHRNYWlsRGV0YWlsc0Jsb2JUeXBlUmVmLFxuXHRcdFx0XHRsaXN0SWRQYXJ0KG1haWxEZXRhaWxzQmxvYklkKSxcblx0XHRcdFx0W2VsZW1lbnRJZFBhcnQobWFpbERldGFpbHNCbG9iSWQpXSxcblx0XHRcdFx0dGhpcy5rZXlQcm92aWRlckZyb21JbnN0YW5jZShtYWlsKSxcblx0XHRcdClcblx0XHRcdGlmIChtYWlsRGV0YWlsc0Jsb2JzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHR0aHJvdyBuZXcgTm90Rm91bmRFcnJvcihgTWFpbERldGFpbHNCbG9iICR7bWFpbERldGFpbHNCbG9iSWR9YClcblx0XHRcdH1cblx0XHRcdHJldHVybiBtYWlsRGV0YWlsc0Jsb2JzWzBdLmRldGFpbHNcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIGtleVByb3ZpZGVyRnJvbUluc3RhbmNlKG1haWw6IE1haWwpIHtcblx0XHRyZXR1cm4gYXN5bmMgKCkgPT4gKHtcblx0XHRcdGtleTogYXNzZXJ0Tm90TnVsbChtYWlsLl9vd25lckVuY1Nlc3Npb25LZXkpLFxuXHRcdFx0ZW5jcnlwdGluZ0tleVZlcnNpb246IHBhcnNlS2V5VmVyc2lvbihtYWlsLl9vd25lcktleVZlcnNpb24gPz8gXCIwXCIpLFxuXHRcdH0pXG5cdH1cblxuXHQvKipcblx0ICogQHBhcmFtIG1haWwgaW4gY2FzZSBpdCBpcyBhIG1haWxEZXRhaWxzRHJhZnRcblx0ICovXG5cdGFzeW5jIGxvYWRNYWlsRGV0YWlsc0RyYWZ0KG1haWw6IE1haWwpOiBQcm9taXNlPE1haWxEZXRhaWxzPiB7XG5cdFx0Ly8gaWYgbm90IGlzRHJhZnRcblx0XHRpZiAobWFpbC5tYWlsRGV0YWlsc0RyYWZ0ID09IG51bGwpIHtcblx0XHRcdHRocm93IG5ldyBQcm9ncmFtbWluZ0Vycm9yKFwibm90IHN1cHBvcnRlZCwgbXVzdCBiZSBtYWlsIGRldGFpbHMgZHJhZnRcIilcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3QgZGV0YWlsc0RyYWZ0SWQgPSBhc3NlcnROb3ROdWxsKG1haWwubWFpbERldGFpbHNEcmFmdClcblxuXHRcdFx0Y29uc3QgbWFpbERldGFpbHNEcmFmdHMgPSBhd2FpdCB0aGlzLmVudGl0eUNsaWVudC5sb2FkTXVsdGlwbGUoXG5cdFx0XHRcdE1haWxEZXRhaWxzRHJhZnRUeXBlUmVmLFxuXHRcdFx0XHRsaXN0SWRQYXJ0KGRldGFpbHNEcmFmdElkKSxcblx0XHRcdFx0W2VsZW1lbnRJZFBhcnQoZGV0YWlsc0RyYWZ0SWQpXSxcblx0XHRcdFx0dGhpcy5rZXlQcm92aWRlckZyb21JbnN0YW5jZShtYWlsKSxcblx0XHRcdClcblx0XHRcdGlmIChtYWlsRGV0YWlsc0RyYWZ0cy5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0dGhyb3cgbmV3IE5vdEZvdW5kRXJyb3IoYE1haWxEZXRhaWxzRHJhZnQgJHtkZXRhaWxzRHJhZnRJZH1gKVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG1haWxEZXRhaWxzRHJhZnRzWzBdLmRldGFpbHNcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlIGEgbGFiZWwgKGFrYSBNYWlsU2V0IGFrYSB7QGxpbmsgTWFpbEZvbGRlcn0gb2Yga2luZCB7QGxpbmsgTWFpbFNldEtpbmQuTEFCRUx9KSBmb3IgdGhlIGdyb3VwIHtAcGFyYW0gbWFpbEdyb3VwSWR9LlxuXHQgKi9cblx0YXN5bmMgY3JlYXRlTGFiZWwobWFpbEdyb3VwSWQ6IElkLCBsYWJlbERhdGE6IHsgbmFtZTogc3RyaW5nOyBjb2xvcjogc3RyaW5nIH0pIHtcblx0XHRjb25zdCBtYWlsR3JvdXBLZXkgPSBhd2FpdCB0aGlzLmtleUxvYWRlckZhY2FkZS5nZXRDdXJyZW50U3ltR3JvdXBLZXkobWFpbEdyb3VwSWQpXG5cdFx0Y29uc3Qgc2sgPSBhZXMyNTZSYW5kb21LZXkoKVxuXHRcdGNvbnN0IG93bmVyRW5jU2Vzc2lvbktleSA9IGVuY3J5cHRLZXlXaXRoVmVyc2lvbmVkS2V5KG1haWxHcm91cEtleSwgc2spXG5cblx0XHRhd2FpdCB0aGlzLnNlcnZpY2VFeGVjdXRvci5wb3N0KFxuXHRcdFx0TWFuYWdlTGFiZWxTZXJ2aWNlLFxuXHRcdFx0Y3JlYXRlTWFuYWdlTGFiZWxTZXJ2aWNlUG9zdEluKHtcblx0XHRcdFx0b3duZXJHcm91cDogbWFpbEdyb3VwSWQsXG5cdFx0XHRcdG93bmVyRW5jU2Vzc2lvbktleTogb3duZXJFbmNTZXNzaW9uS2V5LmtleSxcblx0XHRcdFx0b3duZXJLZXlWZXJzaW9uOiBTdHJpbmcob3duZXJFbmNTZXNzaW9uS2V5LmVuY3J5cHRpbmdLZXlWZXJzaW9uKSxcblx0XHRcdFx0ZGF0YTogY3JlYXRlTWFuYWdlTGFiZWxTZXJ2aWNlTGFiZWxEYXRhKHtcblx0XHRcdFx0XHRuYW1lOiBsYWJlbERhdGEubmFtZSxcblx0XHRcdFx0XHRjb2xvcjogbGFiZWxEYXRhLmNvbG9yLFxuXHRcdFx0XHR9KSxcblx0XHRcdH0pLFxuXHRcdFx0e1xuXHRcdFx0XHRzZXNzaW9uS2V5OiBzayxcblx0XHRcdH0sXG5cdFx0KVxuXHR9XG5cblx0Lypcblx0ICogVXBkYXRlIGEgbGFiZWwsIGlmIG5lZWRlZFxuXHQgKiBAcGFyYW0gbGFiZWwgZXhpc3RpbmcgbGFiZWxcblx0ICogQHBhcmFtIG5hbWUgcG9zc2libGUgbmV3IG5hbWUgZm9yIGxhYmVsXG5cdCAqIEBwYXJhbSBjb2xvciBwb3NzaWJsZSBuZXcgY29sb3IgZm9yIGxhYmVsXG5cdCAqL1xuXHRhc3luYyB1cGRhdGVMYWJlbChsYWJlbDogTWFpbEZvbGRlciwgbmFtZTogc3RyaW5nLCBjb2xvcjogc3RyaW5nKSB7XG5cdFx0aWYgKG5hbWUgIT09IGxhYmVsLm5hbWUgfHwgY29sb3IgIT0gbGFiZWwuY29sb3IpIHtcblx0XHRcdGxhYmVsLm5hbWUgPSBuYW1lXG5cdFx0XHRsYWJlbC5jb2xvciA9IGNvbG9yXG5cdFx0XHRhd2FpdCB0aGlzLmVudGl0eUNsaWVudC51cGRhdGUobGFiZWwpXG5cdFx0fVxuXHR9XG5cblx0YXN5bmMgZGVsZXRlTGFiZWwobGFiZWw6IE1haWxGb2xkZXIpIHtcblx0XHRhd2FpdCB0aGlzLnNlcnZpY2VFeGVjdXRvci5kZWxldGUoXG5cdFx0XHRNYW5hZ2VMYWJlbFNlcnZpY2UsXG5cdFx0XHRjcmVhdGVNYW5hZ2VMYWJlbFNlcnZpY2VEZWxldGVJbih7XG5cdFx0XHRcdGxhYmVsOiBsYWJlbC5faWQsXG5cdFx0XHR9KSxcblx0XHQpXG5cdH1cblxuXHRhc3luYyBhcHBseUxhYmVscyhtYWlsczogcmVhZG9ubHkgTWFpbFtdLCBhZGRlZExhYmVsczogcmVhZG9ubHkgTWFpbEZvbGRlcltdLCByZW1vdmVkTGFiZWxzOiByZWFkb25seSBNYWlsRm9sZGVyW10pIHtcblx0XHRjb25zdCBwb3N0SW4gPSBjcmVhdGVBcHBseUxhYmVsU2VydmljZVBvc3RJbih7XG5cdFx0XHRtYWlsczogbWFpbHMubWFwKChtYWlsKSA9PiBtYWlsLl9pZCksXG5cdFx0XHRhZGRlZExhYmVsczogYWRkZWRMYWJlbHMubWFwKChsYWJlbCkgPT4gbGFiZWwuX2lkKSxcblx0XHRcdHJlbW92ZWRMYWJlbHM6IHJlbW92ZWRMYWJlbHMubWFwKChsYWJlbCkgPT4gbGFiZWwuX2lkKSxcblx0XHR9KVxuXHRcdGF3YWl0IHRoaXMuc2VydmljZUV4ZWN1dG9yLnBvc3QoQXBwbHlMYWJlbFNlcnZpY2UsIHBvc3RJbilcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcGhpc2hpbmdNYXJrZXJWYWx1ZSh0eXBlOiBSZXBvcnRlZE1haWxGaWVsZFR5cGUsIHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRyZXR1cm4gdHlwZSArIG11cm11ckhhc2godmFsdWUucmVwbGFjZSgvXFxzL2csIFwiXCIpKVxufVxuXG5mdW5jdGlvbiBwYXJzZVVybChsaW5rOiBzdHJpbmcpOiBVUkwgfCBudWxsIHtcblx0dHJ5IHtcblx0XHRyZXR1cm4gbmV3IFVSTChsaW5rKVxuXHR9IGNhdGNoIChlKSB7XG5cdFx0cmV0dXJuIG51bGxcblx0fVxufVxuXG5mdW5jdGlvbiBnZXRVcmxEb21haW4obGluazogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG5cdGNvbnN0IHVybCA9IHBhcnNlVXJsKGxpbmspXG5cdHJldHVybiB1cmwgJiYgdXJsLmhvc3RuYW1lXG59XG5cbmZ1bmN0aW9uIHJlY2lwaWVudFRvRHJhZnRSZWNpcGllbnQocmVjaXBpZW50OiBQYXJ0aWFsUmVjaXBpZW50KTogRHJhZnRSZWNpcGllbnQge1xuXHRyZXR1cm4gY3JlYXRlRHJhZnRSZWNpcGllbnQoe1xuXHRcdG5hbWU6IHJlY2lwaWVudC5uYW1lID8/IFwiXCIsXG5cdFx0bWFpbEFkZHJlc3M6IHJlY2lwaWVudC5hZGRyZXNzLFxuXHR9KVxufVxuXG5mdW5jdGlvbiByZWNpcGllbnRUb0VuY3J5cHRlZE1haWxBZGRyZXNzKHJlY2lwaWVudDogUGFydGlhbFJlY2lwaWVudCk6IEVuY3J5cHRlZE1haWxBZGRyZXNzIHtcblx0cmV0dXJuIGNyZWF0ZUVuY3J5cHRlZE1haWxBZGRyZXNzKHtcblx0XHRuYW1lOiByZWNpcGllbnQubmFtZSA/PyBcIlwiLFxuXHRcdGFkZHJlc3M6IHJlY2lwaWVudC5hZGRyZXNzLFxuXHR9KVxufVxuXG4vKipcbiAqIFZlcmlmeSBhbGwgYXR0YWNobWVudHMgY29udGFpbiBjb3JyZWN0bHkgZm9ybWF0dGVkIE1JTUUgdHlwZXMuIFRoaXMgZW5zdXJlcyB0aGF0IHRoZXkgY2FuIGJlIHNlbnQuXG4gKlxuICogTm90ZSB0aGF0IHRoaXMgZG9lcyBub3QgdmVyaWZ5IHRoYXQgdGhlIG1pbWUgdHlwZSBhY3R1YWxseSBjb3JyZXNwb25kcyB0byBhIGtub3duIE1JTUUgdHlwZS5cbiAqIEBwYXJhbSBhdHRhY2htZW50c1xuICogQHRocm93cyB7UHJvZ3JhbW1pbmdFcnJvcn0gaWYgYSBNSU1FIHR5cGUgaXMgc29tZWhvdyBub3QgY29ycmVjdGx5IGZvcm1hdHRlZCBmb3IgYXQgbGVhc3Qgb25lIGF0dGFjaG1lbnRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlTWltZVR5cGVzRm9yQXR0YWNobWVudHMoYXR0YWNobWVudHM6IEF0dGFjaG1lbnRzKSB7XG5cdGNvbnN0IHJlZ2V4ID0gL15cXHcrXFwvW1xcdy4rLV0rPyg7XFxzKltcXHcuKy1dKz0oW1xcdy4rLV0rfFwiW1xcd1xccywuKy1dK1wiKSkqJC9nXG5cdGZvciAoY29uc3QgYXR0YWNobWVudCBvZiBhdHRhY2htZW50cykge1xuXHRcdGlmIChpc0RhdGFGaWxlKGF0dGFjaG1lbnQpIHx8IGlzRmlsZVJlZmVyZW5jZShhdHRhY2htZW50KSkge1xuXHRcdFx0aWYgKCFhdHRhY2htZW50Lm1pbWVUeXBlLm1hdGNoKHJlZ2V4KSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgUHJvZ3JhbW1pbmdFcnJvcihgJHthdHRhY2htZW50Lm1pbWVUeXBlfSBpcyBub3QgYSBjb3JyZWN0bHkgZm9ybWF0dGVkIG1pbWV0eXBlICgke2F0dGFjaG1lbnQubmFtZX0pYClcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNklBLG9CQUFvQjtJQWdDUCxhQUFOLE1BQWlCO0NBQ3ZCLEFBQVEsa0JBQStCLElBQUk7Q0FDM0MsQUFBUSxrQkFBa0M7Q0FDMUMsQUFBUSxzQkFBa0Q7Q0FFMUQsWUFDa0JBLFlBQ0FDLGNBQ0FDLFFBQ0FDLGlCQUNBQyxZQUNBQyxTQUNBQyxhQUNBQyxpQkFDQUMsbUJBQ2hCO0VBeTdCRixLQWw4QmtCO0VBazhCakIsS0FqOEJpQjtFQWk4QmhCLEtBaDhCZ0I7RUFnOEJmLEtBLzdCZTtFQSs3QmQsS0E5N0JjO0VBODdCYixLQTc3QmE7RUE2N0JaLEtBNTdCWTtFQTQ3QlgsS0EzN0JXO0VBMjdCVixLQTE3QlU7Q0FDZDtDQUVKLE1BQU0saUJBQWlCQyxNQUFjQyxRQUF3QkMsY0FBaUM7RUFDN0YsTUFBTSxlQUFlLE1BQU0sS0FBSyxnQkFBZ0Isc0JBQXNCLGFBQWE7RUFFbkYsTUFBTSxLQUFLLGlCQUFpQjtFQUM1QixNQUFNLHFCQUFxQiwyQkFBMkIsY0FBYyxHQUFHO0VBQ3ZFLE1BQU0sWUFBWSwyQkFBMkI7R0FDNUMsWUFBWTtHQUNaLGNBQWM7R0FDZCxvQkFBb0IsbUJBQW1CO0dBQ3ZDLFlBQVk7R0FDWixpQkFBaUIsbUJBQW1CLHFCQUFxQixVQUFVO0VBQ25FLEVBQUM7QUFDRixRQUFNLEtBQUssZ0JBQWdCLEtBQUssbUJBQW1CLFdBQVcsRUFBRSxZQUFZLEdBQUksRUFBQztDQUNqRjs7Ozs7Q0FNRCxNQUFNLHFCQUFxQkMsUUFBb0JDLFNBQWdDO0FBQzlFLE1BQUksWUFBWSxPQUFPLE1BQU07QUFDNUIsVUFBTyxPQUFPO0FBQ2QsU0FBTSxLQUFLLGFBQWEsT0FBTyxPQUFPO0VBQ3RDO0NBQ0Q7Ozs7O0NBTUQsTUFBTSx1QkFBdUJE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