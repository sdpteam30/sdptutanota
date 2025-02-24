import { TutanotaError } from "./dist-chunk.js";
import { ProgrammingError } from "./ProgrammingError-chunk.js";
import { assertWorkerOrNode } from "./Env-chunk.js";
import { PromisableWrapper, TypeRef, arrayHash, assertNotNull, byteLength, contains, daysToMillis, defer, downcast, findLastIndex, getFromMap, groupByAndMap, isNotNull, isSameTypeRef, isSameTypeRefByAttr, lastThrow, mergeMaps, millisToDays, neverNull, noOp, ofClass, pMap, promiseMapCompat, stringToUtf8Uint8Array, tokenize, uint8ArrayToBase64, utf8Uint8ArrayToString } from "./dist2-chunk.js";
import { ENTITY_EVENT_BATCH_TTL_DAYS, FULL_INDEXED_TIMESTAMP, GroupType, NOTHING_INDEXED_TIMESTAMP, OperationType, getMembershipGroupType } from "./TutanotaConstants-chunk.js";
import { GENERATED_MAX_ID, elementIdPart, firstBiggerThanSecond, generatedIdToTimestamp, getElementId, isSameId, listIdPart, timestampToGeneratedId } from "./EntityUtils-chunk.js";
import { typeModels$2 as typeModels } from "./TypeModels-chunk.js";
import { ContactListTypeRef, ContactTypeRef, ImportMailStateTypeRef, MailTypeRef } from "./TypeRefs-chunk.js";
import "./TypeModels2-chunk.js";
import { EntityEventBatchTypeRef, UserTypeRef } from "./TypeRefs2-chunk.js";
import "./EntityFunctions-chunk.js";
import "./TypeModels3-chunk.js";
import "./ModelInfo-chunk.js";
import { ConnectionError, NotAuthorizedError, NotFoundError } from "./RestError-chunk.js";
import { OutOfSyncError } from "./OutOfSyncError-chunk.js";
import { CancelledError } from "./CancelledError-chunk.js";
import { EventQueue } from "./EventQueue-chunk.js";
import "./CryptoError-chunk.js";
import "./error-chunk.js";
import { DbError } from "./DbError-chunk.js";
import "./QuotaExceededError-chunk.js";
import { IV_BYTE_LENGTH, aes256EncryptSearchIndexEntry, aes256RandomKey, decryptKey, random, unauthenticatedAesDecrypt } from "./dist3-chunk.js";
import "./KeyLoaderFacade-chunk.js";
import { EntityClient } from "./EntityClient-chunk.js";
import { encryptKeyWithVersionedKey } from "./CryptoWrapper-chunk.js";
import { DbFacade, ElementDataOS, GroupDataOS, MetaDataOS, Metadata, SearchIndexMetaDataOS, SearchIndexOS, SearchIndexWordsIndex, SearchTermSuggestionsOS, b64UserIdHash } from "./IndexTables-chunk.js";
import { getIndexerMetaData, updateEncryptionMetadata } from "./ConfigurationDatabase-chunk.js";
import { _createNewIndexUpdate, appendBinaryBlocks, calculateNeededSpaceForNumbers, compareMetaEntriesOldest, decodeNumbers, decryptIndexKey, decryptMetaData, encodeNumbers, encryptIndexKeyBase64, encryptIndexKeyUint8Array, encryptMetaData, encryptSearchIndexEntry, filterIndexMemberships, getIdFromEncSearchIndexEntry, getPerformanceTimestamp, iterateBinaryBlocks, markEnd, markStart, removeBinaryBlockRanges, typeRefToTypeInfo } from "./IndexUtils-chunk.js";
import { IndexingErrorReason } from "./SearchTypes-chunk.js";

//#region src/mail-app/workerUtils/index/ContactIndexer.ts
var ContactIndexer = class {
	_core;
	_db;
	_entity;
	suggestionFacade;
	constructor(core, db, entity, suggestionFacade) {
		this._core = core;
		this._db = db;
		this._entity = entity;
		this.suggestionFacade = suggestionFacade;
	}
	createContactIndexEntries(contact) {
		const ContactModel = typeModels.Contact;
		let keyToIndexEntries = this._core.createIndexEntriesForAttributes(contact, [
			{
				attribute: ContactModel.values["firstName"],
				value: () => contact.firstName
			},
			{
				attribute: ContactModel.values["lastName"],
				value: () => contact.lastName
			},
			{
				attribute: ContactModel.values["nickname"],
				value: () => contact.nickname || ""
			},
			{
				attribute: ContactModel.values["role"],
				value: () => contact.role
			},
			{
				attribute: ContactModel.values["title"],
				value: () => contact.title || ""
			},
			{
				attribute: ContactModel.values["comment"],
				value: () => contact.comment
			},
			{
				attribute: ContactModel.values["company"],
				value: () => contact.company
			},
			{
				attribute: ContactModel.associations["addresses"],
				value: () => contact.addresses.map((a) => a.address).join(",")
			},
			{
				attribute: ContactModel.associations["mailAddresses"],
				value: () => contact.mailAddresses.map((cma) => cma.address).join(",")
			},
			{
				attribute: ContactModel.associations["phoneNumbers"],
				value: () => contact.phoneNumbers.map((pn) => pn.number).join(",")
			},
			{
				attribute: ContactModel.associations["socialIds"],
				value: () => contact.socialIds.map((s) => s.socialId).join(",")
			}
		]);
		this.suggestionFacade.addSuggestions(this._getSuggestionWords(contact));
		return keyToIndexEntries;
	}
	_getSuggestionWords(contact) {
		return tokenize(contact.firstName + " " + contact.lastName + " " + contact.mailAddresses.map((ma) => ma.address).join(" "));
	}
	processNewContact(event) {
		return this._entity.load(ContactTypeRef, [event.instanceListId, event.instanceId]).then((contact) => {
			let keyToIndexEntries = this.createContactIndexEntries(contact);
			return this.suggestionFacade.store().then(() => {
				return {
					contact,
					keyToIndexEntries
				};
			});
		}).catch(ofClass(NotFoundError, () => {
			console.log("tried to index non existing contact");
			return null;
		})).catch(ofClass(NotAuthorizedError, () => {
			console.log("tried to index contact without permission");
			return null;
		}));
	}
	async getIndexTimestamp(contactList) {
		const t = await this._db.dbFacade.createTransaction(true, [MetaDataOS, GroupDataOS]);
		const groupId = neverNull(contactList._ownerGroup);
		return t.get(GroupDataOS, groupId).then((groupData) => {
			return groupData ? groupData.indexTimestamp : null;
		});
	}
	/**
	* Indexes the contact list if it is not yet indexed.
	*/
	async indexFullContactList(contactList) {
		const groupId = neverNull(contactList._ownerGroup);
		let indexUpdate = _createNewIndexUpdate(typeRefToTypeInfo(ContactTypeRef));
		try {
			const contacts = await this._entity.loadAll(ContactTypeRef, contactList.contacts);
			for (const contact of contacts) {
				let keyToIndexEntries = this.createContactIndexEntries(contact);
				this._core.encryptSearchIndexEntries(contact._id, neverNull(contact._ownerGroup), keyToIndexEntries, indexUpdate);
			}
			return Promise.all([this._core.writeIndexUpdate([{
				groupId,
				indexTimestamp: FULL_INDEXED_TIMESTAMP
			}], indexUpdate), this.suggestionFacade.store()]);
		} catch (e) {
			if (e instanceof NotFoundError) return Promise.resolve();
			throw e;
		}
	}
	processEntityEvents(events, groupId, batchId, indexUpdate) {
		return pMap(events, async (event) => {
			if (event.operation === OperationType.CREATE) await this.processNewContact(event).then((result) => {
				if (result) this._core.encryptSearchIndexEntries(result.contact._id, neverNull(result.contact._ownerGroup), result.keyToIndexEntries, indexUpdate);
			});
else if (event.operation === OperationType.UPDATE) await Promise.all([this._core._processDeleted(event, indexUpdate), this.processNewContact(event).then((result) => {
				if (result) this._core.encryptSearchIndexEntries(result.contact._id, neverNull(result.contact._ownerGroup), result.keyToIndexEntries, indexUpdate);
			})]);
else if (event.operation === OperationType.DELETE) await this._core._processDeleted(event, indexUpdate);
		}).then(noOp);
	}
};

//#endregion
//#region src/common/api/common/error/InvalidDatabaseStateError.ts
var InvalidDatabaseStateError = class extends TutanotaError {
	constructor(message) {
		super("InvalidDatabaseStateError", message);
	}
};

//#endregion
//#region src/mail-app/workerUtils/index/IndexerCore.ts
const SEARCH_INDEX_ROW_LENGTH = 1e3;
var IndexerCore = class {
	queue;
	db;
	_isStopped;
	_promiseMapCompat;
	_needsExplicitIds;
	_explicitIdStart;
	_currentWriteOperation = null;
	_stats;
	constructor(db, queue, browserData) {
		this.queue = queue;
		this.db = db;
		this._isStopped = false;
		this._promiseMapCompat = promiseMapCompat(browserData.needsMicrotaskHack);
		this._needsExplicitIds = browserData.needsExplicitIDBIds;
		this._explicitIdStart = Date.now();
		this.resetStats();
	}
	/****************************************** Preparing the update ***********************************************/
	/**
	* Converts an instances into a map from words to a list of SearchIndexEntries.
	*/
	createIndexEntriesForAttributes(instance, attributes) {
		let indexEntries = attributes.map((attributeHandler) => {
			if (typeof attributeHandler.value !== "function") throw new ProgrammingError("Value for attributeHandler is not a function: " + JSON.stringify(attributeHandler.attribute));
			let value = attributeHandler.value();
			let tokens = tokenize(value);
			this._stats.indexedBytes += byteLength(value);
			let attributeKeyToIndexMap = new Map();
			for (let index = 0; index < tokens.length; index++) {
				let token = tokens[index];
				if (!attributeKeyToIndexMap.has(token)) attributeKeyToIndexMap.set(token, {
					id: instance._id instanceof Array ? instance._id[1] : instance._id,
					attribute: attributeHandler.attribute.id,
					positions: [index]
				});
else neverNull(attributeKeyToIndexMap.get(token)).positions.push(index);
			}
			return attributeKeyToIndexMap;
		});
		return mergeMaps(indexEntries);
	}
	/**
	* Encrypt search index entries created by {@link createIndexEntriesForAttributes} and put them into the {@param indexUpdate}.
	* @param id of the instance
	* @param ownerGroup of the instance
	* @param keyToIndexEntries map from search index keys (words which you can search for) to index entries
	* @param indexUpdate IndexUpdate for which {@code create} fields will be populated
	*/
	encryptSearchIndexEntries(id, ownerGroup, keyToIndexEntries, indexUpdate) {
		const encryptionTimeStart = getPerformanceTimestamp();
		const listId = listIdPart(id);
		const encInstanceId = encryptIndexKeyUint8Array(this.db.key, elementIdPart(id), this.db.iv);
		const encInstanceIdB64 = uint8ArrayToBase64(encInstanceId);
		const elementIdTimestamp = generatedIdToTimestamp(elementIdPart(id));
		const encWordsB64 = [];
		for (const [indexKey, value] of keyToIndexEntries.entries()) {
			const encWordB64 = encryptIndexKeyBase64(this.db.key, indexKey, this.db.iv);
			encWordsB64.push(encWordB64);
			const encIndexEntries = getFromMap(indexUpdate.create.indexMap, encWordB64, () => []);
			for (const indexEntry of value) encIndexEntries.push({
				entry: encryptSearchIndexEntry(this.db.key, indexEntry, encInstanceId),
				timestamp: elementIdTimestamp
			});
		}
		indexUpdate.create.encInstanceIdToElementData.set(encInstanceIdB64, {
			listId,
			encWordsB64,
			ownerGroup
		});
		this._stats.encryptionTime += getPerformanceTimestamp() - encryptionTimeStart;
	}
	/**
	* Process delete event before applying to the index.
	*/
	async _processDeleted(event, indexUpdate) {
		const encInstanceIdPlain = encryptIndexKeyUint8Array(this.db.key, event.instanceId, this.db.iv);
		const encInstanceIdB64 = uint8ArrayToBase64(encInstanceIdPlain);
		const { appId, typeId } = typeRefToTypeInfo(new TypeRef(event.application, event.type));
		const transaction = await this.db.dbFacade.createTransaction(true, [ElementDataOS]);
		const elementData = await transaction.get(ElementDataOS, encInstanceIdB64);
		if (!elementData) return;
		const metaDataRowKeysBinary = unauthenticatedAesDecrypt(this.db.key, elementData[1], true);
		const metaDataRowKeys = decodeNumbers(metaDataRowKeysBinary);
		for (const metaDataRowKey of metaDataRowKeys) {
			const ids = getFromMap(indexUpdate.delete.searchMetaRowToEncInstanceIds, metaDataRowKey, () => []);
			ids.push({
				encInstanceId: encInstanceIdPlain,
				appId,
				typeId,
				timestamp: generatedIdToTimestamp(event.instanceId)
			});
		}
		indexUpdate.delete.encInstanceIds.push(encInstanceIdB64);
	}
	/********************************************* Manipulating the state ***********************************************/
	stopProcessing() {
		this._isStopped = true;
		this.queue.clear();
	}
	isStoppedProcessing() {
		return this._isStopped;
	}
	startProcessing() {
		this._isStopped = false;
	}
	addBatchesToQueue(batches) {
		if (!this._isStopped) this.queue.addBatches(batches);
	}
	/*********************************************** Writing index update ***********************************************/
	/**
	* Apply populated {@param indexUpdate} to the database.
	*/
	writeIndexUpdate(dataPerGroup, indexUpdate) {
		return this._writeIndexUpdate(indexUpdate, (t) => this._updateGroupDataIndexTimestamp(dataPerGroup, t));
	}
	writeIndexUpdateWithBatchId(groupId, batchId, indexUpdate) {
		return this._writeIndexUpdate(indexUpdate, (t) => this._updateGroupDataBatchId(groupId, batchId, t));
	}
	_writeIndexUpdate(indexUpdate, updateGroupData) {
		return this._executeOperation({
			transaction: null,
			transactionFactory: () => this.db.dbFacade.createTransaction(false, [
				SearchIndexOS,
				SearchIndexMetaDataOS,
				ElementDataOS,
				MetaDataOS,
				GroupDataOS
			]),
			operation: (transaction) => {
				let startTimeStorage = getPerformanceTimestamp();
				if (this._isStopped) return Promise.reject(new CancelledError("mail indexing cancelled"));
				return this._moveIndexedInstance(indexUpdate, transaction).thenOrApply(() => this._deleteIndexedInstance(indexUpdate, transaction)).thenOrApply(() => this._insertNewIndexEntries(indexUpdate, transaction)).thenOrApply((rowKeys) => rowKeys && this._insertNewElementData(indexUpdate, transaction, rowKeys)).thenOrApply(() => updateGroupData(transaction)).thenOrApply(() => {
					return transaction.wait().then(() => {
						this._stats.storageTime += getPerformanceTimestamp() - startTimeStorage;
					});
				}).thenOrApply(noOp, (e) => {
					try {
						if (!transaction.aborted) transaction.abort();
					} catch (e$1) {
						console.warn("abort has failed: ", e$1);
					}
					throw e;
				}).toPromise();
			},
			deferred: defer(),
			isAbortedForBackgroundMode: false
		});
	}
	_executeOperation(operation) {
		this._currentWriteOperation = operation;
		return operation.transactionFactory().then((transaction) => {
			operation.transaction = transaction;
			operation.operation(transaction).then((it) => {
				this._currentWriteOperation = null;
				operation.deferred.resolve();
				return it;
			}).catch((e) => {
				if (operation.isAbortedForBackgroundMode) console.log("transaction has been aborted because of background mode");
else {
					if (env.mode !== "Test") console.log("rejecting operation with error", e);
					operation.deferred.reject(e);
				}
			});
			return operation.deferred.promise;
		});
	}
	onVisibilityChanged(visible) {
		const operation = this._currentWriteOperation;
		if (!visible && operation && operation.transaction) {
			console.log("abort indexedDb transaction operation because background mode");
			try {
				neverNull(operation.transaction).abort();
			} catch (e) {
				console.log("Error when aborting on visibility change", e);
			}
			operation.isAbortedForBackgroundMode = true;
		}
		if (visible && operation) {
			console.log("restart indexedDb transaction operation after background mode");
			operation.isAbortedForBackgroundMode = false;
			this._executeOperation(operation);
		}
	}
	_moveIndexedInstance(indexUpdate, transaction) {
		this._cancelIfNeeded();
		if (indexUpdate.move.length === 0) return PromisableWrapper.from(undefined);
		const promise = Promise.all(indexUpdate.move.map((moveInstance) => {
			return transaction.get(ElementDataOS, moveInstance.encInstanceId).then((elementData) => {
				if (elementData) {
					elementData[0] = moveInstance.newListId;
					transaction.put(ElementDataOS, moveInstance.encInstanceId, elementData);
				}
			});
		})).then(noOp);
		return PromisableWrapper.from(promise);
	}
	/**
	* Apply "delete" updates to the database
	* @private
	*/
	_deleteIndexedInstance(indexUpdate, transaction) {
		this._cancelIfNeeded();
		if (indexUpdate.delete.searchMetaRowToEncInstanceIds.size === 0) return null;
		let deleteElementDataPromise = Promise.all(indexUpdate.delete.encInstanceIds.map((encInstanceId) => transaction.delete(ElementDataOS, encInstanceId)));
		return Promise.all(Array.from(indexUpdate.delete.searchMetaRowToEncInstanceIds).map(([metaRowKey, encInstanceIds]) => this._deleteSearchIndexEntries(transaction, metaRowKey, encInstanceIds))).then(() => deleteElementDataPromise).then(noOp);
	}
	/**
	* Remove all {@param instanceInfos} from the SearchIndex entries and metadata entreis specified by the {@param metaRowKey}.
	* @private
	*/
	_deleteSearchIndexEntries(transaction, metaRowKey, instanceInfos) {
		this._cancelIfNeeded();
		const encInstanceIdSet = new Set(instanceInfos.map((e) => arrayHash(e.encInstanceId)));
		return transaction.get(SearchIndexMetaDataOS, metaRowKey).then((encMetaDataRow) => {
			if (!encMetaDataRow) return;
			const metaDataRow = decryptMetaData(this.db.key, encMetaDataRow);
			const metaDataEntriesSet = new Set();
			for (const info of instanceInfos) {
				const entryIndex = this._findMetaDataEntryByTimestamp(metaDataRow, info.timestamp, info.appId, info.typeId);
				if (entryIndex === -1) console.warn("could not find MetaDataEntry, info:", info, "rows: ", metaDataRow.rows.map((r) => JSON.stringify(r)));
else metaDataEntriesSet.add(metaDataRow.rows[entryIndex]);
			}
			const updateSearchIndex = this._promiseMapCompat(Array.from(metaDataEntriesSet), (metaEntry) => {
				return transaction.get(SearchIndexOS, metaEntry.key).then((indexEntriesRow) => {
					if (!indexEntriesRow) return;
					const rangesToRemove = [];
					iterateBinaryBlocks(indexEntriesRow, (block, start, end) => {
						if (encInstanceIdSet.has(arrayHash(getIdFromEncSearchIndexEntry(block)))) rangesToRemove.push([start, end]);
					});
					if (rangesToRemove.length === 0) return;
else if (metaEntry.size === rangesToRemove.length) {
						metaEntry.size = 0;
						return transaction.delete(SearchIndexOS, metaEntry.key);
					} else {
						const trimmed = removeBinaryBlockRanges(indexEntriesRow, rangesToRemove);
						metaEntry.size -= rangesToRemove.length;
						return transaction.put(SearchIndexOS, metaEntry.key, trimmed);
					}
				});
			});
			return updateSearchIndex.thenOrApply(() => {
				metaDataRow.rows = metaDataRow.rows.filter((r) => r.size > 0);
				if (metaDataRow.rows.length === 0) return transaction.delete(SearchIndexMetaDataOS, metaDataRow.id);
else return transaction.put(SearchIndexMetaDataOS, null, encryptMetaData(this.db.key, metaDataRow));
			}).value;
		});
	}
	_insertNewElementData(indexUpdate, transaction, encWordToMetaRow) {
		this._cancelIfNeeded();
		if (indexUpdate.create.encInstanceIdToElementData.size === 0) return null;
		let promises = [];
		for (const [b64EncInstanceId, elementDataSurrogate] of indexUpdate.create.encInstanceIdToElementData.entries()) {
			const metaRows = elementDataSurrogate.encWordsB64.map((w) => encWordToMetaRow[w]);
			const rowKeysBinary = new Uint8Array(calculateNeededSpaceForNumbers(metaRows));
			encodeNumbers(metaRows, rowKeysBinary);
			const encMetaRowKeys = aes256EncryptSearchIndexEntry(this.db.key, rowKeysBinary);
			promises.push(transaction.put(ElementDataOS, b64EncInstanceId, [
				elementDataSurrogate.listId,
				encMetaRowKeys,
				elementDataSurrogate.ownerGroup
			]));
		}
		return Promise.all(promises);
	}
	_insertNewIndexEntries(indexUpdate, transaction) {
		this._cancelIfNeeded();
		let keys = [...indexUpdate.create.indexMap.keys()];
		const encWordToMetaRow = {};
		const result = this._promiseMapCompat(keys, (encWordB64) => {
			const encryptedEntries = neverNull(indexUpdate.create.indexMap.get(encWordB64));
			return this._putEncryptedEntity(indexUpdate.typeInfo.appId, indexUpdate.typeInfo.typeId, transaction, encWordB64, encWordToMetaRow, encryptedEntries);
		}, { concurrency: 2 }).value;
		return result instanceof Promise ? result.then(() => encWordToMetaRow) : null;
	}
	_putEncryptedEntity(appId, typeId, transaction, encWordB64, encWordToMetaRow, encryptedEntries) {
		this._cancelIfNeeded();
		if (encryptedEntries.length <= 0) return null;
		return this._getOrCreateSearchIndexMeta(transaction, encWordB64).then((metaData) => {
			encryptedEntries.sort((a, b) => a.timestamp - b.timestamp);
			const writeResult = this._writeEntries(transaction, encryptedEntries, metaData, appId, typeId);
			return writeResult.thenOrApply(() => metaData).value;
		}).then((metaData) => {
			const columnSize = metaData.rows.reduce((result, metaDataEntry) => result + metaDataEntry.size, 0);
			this._stats.writeRequests += 1;
			this._stats.largestColumn = columnSize > this._stats.largestColumn ? columnSize : this._stats.largestColumn;
			this._stats.storedBytes += encryptedEntries.reduce((sum, e) => sum + e.entry.length, 0);
			encWordToMetaRow[encWordB64] = metaData.id;
			return transaction.put(SearchIndexMetaDataOS, null, encryptMetaData(this.db.key, metaData));
		});
	}
	/**
	* Insert {@param entries} into the database for the corresponding {@param metaData}.
	* Metadata entries for each type are sorted from oldest to newest. Each metadata entry has oldest element timestamp. Timestamps of newer entries make a
	* time border for the newest. Timestamp for entry is considered fixed (unless it's the first entry).
	* The strategy is following:
	* First, try to find matching row by the oldest id of the entries we want to insert.
	* If we've found one, put everything that matches time frame of this row into it (it's bounded by the next row, if present). Put the rest into newer
	* rows.
	* If we didn't find one, we may try to extend the oldest row, because it's not bounded by the other row.
	* When we append something to the row, we check if its size would exceed {@link SEARCH_INDEX_ROW_LENGTH}. If it is, we do splitting,
	* {@see _appendIndexEntriesToRow}.
	* @private
	*/
	_writeEntries(transaction, entries, metaData, appId, typeId) {
		if (entries.length === 0) return PromisableWrapper.from(undefined);
		const oldestTimestamp = entries[0].timestamp;
		const indexOfMetaEntry = this._findMetaDataEntryByTimestamp(metaData, oldestTimestamp, appId, typeId);
		if (indexOfMetaEntry !== -1) {
			const nextEntry = this._nextEntryOfType(metaData, indexOfMetaEntry + 1, appId, typeId);
			if (!nextEntry) return this._appendIndexEntriesToRow(transaction, metaData, indexOfMetaEntry, entries);
else {
				const [toCurrentOne, toNextOnes] = this._splitByTimestamp(entries, nextEntry.oldestElementTimestamp);
				return this._appendIndexEntriesToRow(transaction, metaData, indexOfMetaEntry, toCurrentOne).thenOrApply(() => this._writeEntries(transaction, toNextOnes, metaData, appId, typeId));
			}
		} else {
			const firstEntry = this._nextEntryOfType(metaData, 0, appId, typeId);
			if (firstEntry) {
				const indexOfFirstEntry = metaData.rows.indexOf(firstEntry);
				const secondEntry = this._nextEntryOfType(metaData, indexOfFirstEntry + 1, appId, typeId);
				const [toFirstOne, toNextOnes] = secondEntry ? this._splitByTimestamp(entries, secondEntry.oldestElementTimestamp) : [entries, []];
				if (firstEntry.size + toFirstOne.length < SEARCH_INDEX_ROW_LENGTH) return this._appendIndexEntriesToRow(transaction, metaData, indexOfFirstEntry, toFirstOne).thenOrApply(() => this._writeEntries(transaction, toNextOnes, metaData, appId, typeId));
else {
					const [toNewOne, toCurrentOne] = this._splitByTimestamp(toFirstOne, firstEntry.oldestElementTimestamp);
					return PromisableWrapper.from(this._createNewRow(transaction, metaData, toNewOne, oldestTimestamp, appId, typeId)).thenOrApply(() => this._writeEntries(transaction, toCurrentOne.concat(toNextOnes), metaData, appId, typeId));
				}
			} else return this._createNewRow(transaction, metaData, entries, oldestTimestamp, appId, typeId);
		}
	}
	_nextEntryOfType(metaData, startIndex, appId, typeId) {
		for (let i = startIndex; i < metaData.rows.length; i++) if (metaData.rows[i].app === appId && metaData.rows[i].type === typeId) return metaData.rows[i];
		return null;
	}
	/**
	* Split {@param entries} (must be sorted!) into two arrays: before and after the timestamp.
	* @private
	*/
	_splitByTimestamp(entries, timestamp) {
		const indexOfSplit = entries.findIndex((entry) => entry.timestamp >= timestamp);
		if (indexOfSplit === -1) return [entries, []];
		const below = entries.slice(0, indexOfSplit);
		const above = entries.slice(indexOfSplit);
		return [below, above];
	}
	/**
	* Append {@param entries} to the row specified by the {@param metaEntryIndex}. If the row size exceeds {@link SEARCH_INDEX_ROW_LENGTH}, then
	* split it into two rows.
	* @private
	*/
	_appendIndexEntriesToRow(transaction, metaData, metaEntryIndex, entries) {
		if (entries.length === 0) return new PromisableWrapper(undefined);
		const metaEntry = metaData.rows[metaEntryIndex];
		if (metaEntry.size + entries.length > SEARCH_INDEX_ROW_LENGTH) return PromisableWrapper.from(transaction.get(SearchIndexOS, metaEntry.key).then((binaryBlock) => {
			if (!binaryBlock) throw new InvalidDatabaseStateError("non existing index row");
			const timestampToEntries = new Map();
			const existingIds = new Set();
			iterateBinaryBlocks(binaryBlock, (encSearchIndexEntry) => {
				const encId = getIdFromEncSearchIndexEntry(encSearchIndexEntry);
				existingIds.add(arrayHash(encId));
				const decId = decryptIndexKey(this.db.key, encId, this.db.iv);
				const timeStamp = generatedIdToTimestamp(decId);
				getFromMap(timestampToEntries, timeStamp, () => []).push(encSearchIndexEntry);
			});
			for (const { entry, timestamp } of entries) getFromMap(timestampToEntries, timestamp, () => []).push(entry);
			const isLastEntry = this._nextEntryOfType(metaData, metaEntryIndex + 1, metaEntry.app, metaEntry.type) == null;
			const rows = this._distributeEntities(timestampToEntries, isLastEntry);
			const [appendRow, newRows] = [rows[0], rows.slice(1)];
			const firstRowBinary = appendBinaryBlocks(appendRow.row);
			const requestPromises = [transaction.put(SearchIndexOS, metaEntry.key, firstRowBinary).then(() => {
				metaEntry.size = appendRow.row.length;
				metaEntry.oldestElementTimestamp = appendRow.oldestElementTimestamp;
				return metaEntry.key;
			}), this._promiseMapCompat(newRows, (row) => {
				const binaryRow = appendBinaryBlocks(row.row);
				return transaction.put(SearchIndexOS, null, binaryRow).then((newSearchIndexRowId) => {
					metaData.rows.push({
						key: newSearchIndexRowId,
						size: row.row.length,
						app: metaEntry.app,
						type: metaEntry.type,
						oldestElementTimestamp: row.oldestElementTimestamp
					});
				});
			}, { concurrency: 2 }).value];
			return Promise.all(requestPromises).then(() => {
				metaData.rows.sort(compareMetaEntriesOldest);
			});
		}));
else return PromisableWrapper.from(transaction.get(SearchIndexOS, metaEntry.key).then((indexEntriesRow) => {
			let safeRow = indexEntriesRow || new Uint8Array(0);
			const resultRow = appendBinaryBlocks(entries.map((e) => e.entry), safeRow);
			return transaction.put(SearchIndexOS, metaEntry.key, resultRow).then(() => {
				metaEntry.size += entries.length;
				metaEntry.oldestElementTimestamp = Math.min(entries[0].timestamp, metaEntry.oldestElementTimestamp);
			});
		}));
	}
	_distributeEntities(timestampToEntries, preferFirst) {
		const sortedTimestamps = Array.from(timestampToEntries.keys()).sort((l, r) => l - r);
		if (preferFirst) {
			const rows = [{
				row: [],
				oldestElementTimestamp: sortedTimestamps[0]
			}];
			for (const id of sortedTimestamps) {
				const encryptedEntries = neverNull(timestampToEntries.get(id));
				if (lastThrow(rows).row.length + encryptedEntries.length > SEARCH_INDEX_ROW_LENGTH) rows.push({
					row: [],
					oldestElementTimestamp: id
				});
				lastThrow(rows).row.push(...encryptedEntries);
			}
			return rows;
		} else {
			const rows = [{
				row: [],
				oldestElementTimestamp: Number.MAX_SAFE_INTEGER
			}];
			const reveresId = sortedTimestamps.slice().reverse();
			for (const id of reveresId) {
				const encryptedEntries = neverNull(timestampToEntries.get(id));
				if (rows[0].row.length + encryptedEntries.length > SEARCH_INDEX_ROW_LENGTH) rows.unshift({
					row: [],
					oldestElementTimestamp: id
				});
				rows[0].row.unshift(...encryptedEntries);
				rows[0].oldestElementTimestamp = Math.min(rows[0].oldestElementTimestamp, id);
			}
			return rows;
		}
	}
	_createNewRow(transaction, metaData, encryptedSearchIndexEntries, oldestTimestamp, appId, typeId) {
		const byTimestamp = groupByAndMap(encryptedSearchIndexEntries, (e) => e.timestamp, (e) => e.entry);
		const distributed = this._distributeEntities(byTimestamp, false);
		return this._promiseMapCompat(distributed, ({ row, oldestElementTimestamp }) => {
			const binaryRow = appendBinaryBlocks(row);
			return transaction.put(SearchIndexOS, null, binaryRow).then((newRowId) => {
				metaData.rows.push({
					key: newRowId,
					size: row.length,
					app: appId,
					type: typeId,
					oldestElementTimestamp
				});
			});
		}, { concurrency: 2 }).thenOrApply(() => {
			metaData.rows.sort(compareMetaEntriesOldest);
		});
	}
	_findMetaDataEntryByTimestamp(metaData, oldestTimestamp, appId, typeId) {
		return findLastIndex(metaData.rows, (r) => r.app === appId && r.type === typeId && r.oldestElementTimestamp <= oldestTimestamp);
	}
	_getOrCreateSearchIndexMeta(transaction, encWordBase64) {
		return transaction.get(SearchIndexMetaDataOS, encWordBase64, SearchIndexWordsIndex).then((metaData) => {
			if (metaData) return decryptMetaData(this.db.key, metaData);
else {
				const metaTemplate = {
					word: encWordBase64,
					rows: new Uint8Array(0)
				};
				if (this._needsExplicitIds) metaTemplate.id = this._explicitIdStart++;
				return transaction.put(SearchIndexMetaDataOS, null, metaTemplate).then((rowId) => {
					this._stats.words += 1;
					return {
						id: rowId,
						word: encWordBase64,
						rows: []
					};
				});
			}
		});
	}
	_updateGroupDataIndexTimestamp(dataPerGroup, transaction) {
		return this._promiseMapCompat(dataPerGroup, (data) => {
			const { groupId, indexTimestamp } = data;
			return transaction.get(GroupDataOS, groupId).then((groupData) => {
				if (!groupData) throw new InvalidDatabaseStateError("GroupData not available for group " + groupId);
				groupData.indexTimestamp = indexTimestamp;
				return transaction.put(GroupDataOS, groupId, groupData);
			});
		}).thenOrApply(() => {}).value;
	}
	_updateGroupDataBatchId(groupId, batchId, transaction) {
		return transaction.get(GroupDataOS, groupId).then((groupData) => {
			if (!groupData) throw new InvalidDatabaseStateError("GroupData not available for group " + groupId);
			if (groupData.lastBatchIds.length > 0 && groupData.lastBatchIds.indexOf(batchId) !== -1) {
				console.warn("Abort transaction on updating group data: concurrent access", groupId, batchId);
				transaction.abort();
			} else {
				let newIndex = groupData.lastBatchIds.findIndex((indexedBatchId) => firstBiggerThanSecond(batchId, indexedBatchId));
				if (newIndex !== -1) groupData.lastBatchIds.splice(newIndex, 0, batchId);
else groupData.lastBatchIds.push(batchId);
				if (groupData.lastBatchIds.length > 1e3) groupData.lastBatchIds = groupData.lastBatchIds.slice(0, 1e3);
				return transaction.put(GroupDataOS, groupId, groupData);
			}
		});
	}
	_cancelIfNeeded() {
		if (this._isStopped) throw new CancelledError("indexing cancelled");
	}
	resetStats() {
		this._stats = {
			indexingTime: 0,
			storageTime: 0,
			preparingTime: 0,
			mailcount: 0,
			storedBytes: 0,
			encryptionTime: 0,
			writeRequests: 0,
			largestColumn: 0,
			words: 0,
			indexedBytes: 0
		};
	}
	printStatus() {
		const totalTime = this._stats.storageTime + this._stats.preparingTime;
		const statsWithDownloading = Object.assign({}, this._stats, { downloadingTime: this._stats.preparingTime - this._stats.indexingTime - this._stats.encryptionTime });
		console.log(JSON.stringify(statsWithDownloading), "total time: ", totalTime);
	}
};

//#endregion
//#region src/mail-app/workerUtils/index/SuggestionFacade.ts
var SuggestionFacade = class {
	_db;
	type;
	_suggestions;
	constructor(type, db) {
		this.type = type;
		this._db = db;
		this._suggestions = {};
	}
	load() {
		return this._db.initialized.then(() => {
			return this._db.dbFacade.createTransaction(true, [SearchTermSuggestionsOS]).then((t) => {
				return t.get(SearchTermSuggestionsOS, this.type.type.toLowerCase()).then((encSuggestions) => {
					if (encSuggestions) this._suggestions = JSON.parse(utf8Uint8ArrayToString(unauthenticatedAesDecrypt(this._db.key, encSuggestions, true)));
else this._suggestions = {};
				});
			});
		});
	}
	addSuggestions(words) {
		for (const word of words) if (word.length > 0) {
			let key = word.charAt(0);
			if (this._suggestions[key]) {
				let existingValues = this._suggestions[key];
				if (existingValues.indexOf(word) === -1) {
					let insertIndex = existingValues.findIndex((v) => word < v);
					if (insertIndex === -1) existingValues.push(word);
else existingValues.splice(insertIndex, 0, word);
				}
			} else this._suggestions[key] = [word];
		}
	}
	getSuggestions(word) {
		if (word.length > 0) {
			let key = word.charAt(0);
			let result = this._suggestions[key];
			return result ? result.filter((r) => r.startsWith(word)) : [];
		} else return [];
	}
	store() {
		return this._db.initialized.then(() => {
			return this._db.dbFacade.createTransaction(false, [SearchTermSuggestionsOS]).then((t) => {
				let encSuggestions = aes256EncryptSearchIndexEntry(this._db.key, stringToUtf8Uint8Array(JSON.stringify(this._suggestions)));
				t.put(SearchTermSuggestionsOS, this.type.type.toLowerCase(), encSuggestions);
				return t.wait();
			});
		});
	}
};

//#endregion
//#region src/common/api/common/error/MembershipRemovedError.ts
var MembershipRemovedError = class extends TutanotaError {
	constructor(message) {
		super("MembershipRemovedError", message);
	}
};

//#endregion
//#region src/common/api/worker/utils/DbUtils.ts
assertWorkerOrNode();
function deleteObjectStores(db, ...oss) {
	for (let os of oss) try {
		db.deleteObjectStore(os);
	} catch (e) {
		console.warn("Error while deleting old os", os, "ignoring", e);
	}
}

//#endregion
//#region src/mail-app/workerUtils/index/Indexer.ts
const DB_VERSION = 3;
function newSearchIndexDB() {
	return new DbFacade(DB_VERSION, (event, db) => {
		if (event.oldVersion !== DB_VERSION && event.oldVersion !== 0) deleteObjectStores(db, SearchIndexOS, ElementDataOS, MetaDataOS, GroupDataOS, SearchTermSuggestionsOS, SearchIndexMetaDataOS);
		db.createObjectStore(SearchIndexOS, { autoIncrement: true });
		const metaOS = db.createObjectStore(SearchIndexMetaDataOS, {
			autoIncrement: true,
			keyPath: "id"
		});
		db.createObjectStore(ElementDataOS);
		db.createObjectStore(MetaDataOS);
		db.createObjectStore(GroupDataOS);
		db.createObjectStore(SearchTermSuggestionsOS);
		metaOS.createIndex(SearchIndexWordsIndex, "word", { unique: true });
	});
}
var Indexer = class {
	db;
	_dbInitializedDeferredObject;
	_initParams;
	_contact;
	_mail;
	/**
	* Last batch id per group from initial loading.
	* In case we get duplicate events from loading and websocket we want to filter them out to avoid processing duplicates.
	* */
	_initiallyLoadedBatchIdsPerGroup;
	/**
	* Queue which gets all the websocket events and dispatches them to the core. It is paused until we load initial events to avoid
	* putting events from websocket before initial events.
	*/
	_realtimeEventQueue;
	_core;
	_entity;
	_entityRestClient;
	_indexedGroupIds;
	constructor(entityRestClient, infoMessageHandler, browserData, defaultEntityRestCache, makeMailIndexer) {
		this.infoMessageHandler = infoMessageHandler;
		let deferred = defer();
		this._dbInitializedDeferredObject = deferred;
		this.db = {
			dbFacade: newSearchIndexDB(),
			key: downcast(null),
			iv: downcast(null),
			initialized: deferred.promise
		};
		this._core = new IndexerCore(this.db, new EventQueue("indexer_core", true, (batch) => this._processEntityEvents(batch)), browserData);
		this._entityRestClient = entityRestClient;
		this._entity = new EntityClient(defaultEntityRestCache);
		this._contact = new ContactIndexer(this._core, this.db, this._entity, new SuggestionFacade(ContactTypeRef, this.db));
		this._mail = makeMailIndexer(this._core, this.db);
		this._indexedGroupIds = [];
		this._initiallyLoadedBatchIdsPerGroup = new Map();
		this._realtimeEventQueue = new EventQueue("indexer_realtime", false, (nextElement) => {
			const loadedIdForGroup = this._initiallyLoadedBatchIdsPerGroup.get(nextElement.groupId);
			if (loadedIdForGroup == null || firstBiggerThanSecond(nextElement.batchId, loadedIdForGroup)) this._core.addBatchesToQueue([nextElement]);
			return Promise.resolve();
		});
		this._realtimeEventQueue.pause();
	}
	/**
	* Opens a new DbFacade and initializes the metadata if it is not there yet
	*/
	async init({ user, keyLoaderFacade, retryOnError, cacheInfo }) {
		this._initParams = {
			user,
			keyLoaderFacade
		};
		try {
			await this.db.dbFacade.open(this.getDbId(user));
			const metaData = await getIndexerMetaData(this.db.dbFacade, MetaDataOS);
			if (metaData == null) {
				const userGroupKey = keyLoaderFacade.getCurrentSymUserGroupKey();
				await this.createIndexTables(user, userGroupKey);
			} else {
				const userGroupKey = await keyLoaderFacade.loadSymUserGroupKey(metaData.userGroupKeyVersion);
				await this.loadIndexTables(user, userGroupKey, metaData);
			}
			await this.infoMessageHandler.onSearchIndexStateUpdate({
				initializing: false,
				mailIndexEnabled: this._mail.mailIndexingEnabled,
				progress: 0,
				currentMailIndexTimestamp: this._mail.currentIndexTimestamp,
				aimedMailIndexTimestamp: this._mail.currentIndexTimestamp,
				indexedMailCount: 0,
				failedIndexingUpTo: null
			});
			this._core.startProcessing();
			await this.indexOrLoadContactListIfNeeded(user, cacheInfo);
			await this._mail.mailboxIndexingPromise;
			await this._mail.indexMailboxes(user, this._mail.currentIndexTimestamp);
			const groupIdToEventBatches = await this._loadPersistentGroupData(user);
			await this._loadNewEntities(groupIdToEventBatches).catch(ofClass(OutOfSyncError, (e) => this.disableMailIndexing()));
		} catch (e) {
			if (retryOnError !== false && (e instanceof MembershipRemovedError || e instanceof InvalidDatabaseStateError)) {
				console.log("disable mail indexing and init again", e);
				return this._reCreateIndex();
			} else {
				await this.infoMessageHandler.onSearchIndexStateUpdate({
					initializing: false,
					mailIndexEnabled: this._mail.mailIndexingEnabled,
					progress: 0,
					currentMailIndexTimestamp: this._mail.currentIndexTimestamp,
					aimedMailIndexTimestamp: this._mail.currentIndexTimestamp,
					indexedMailCount: 0,
					failedIndexingUpTo: this._mail.currentIndexTimestamp,
					error: e instanceof ConnectionError ? IndexingErrorReason.ConnectionLost : IndexingErrorReason.Unknown
				});
				this._dbInitializedDeferredObject.reject(e);
				throw e;
			}
		}
	}
	getDbId(user) {
		return b64UserIdHash(user._id);
	}
	async indexOrLoadContactListIfNeeded(user, cacheInfo) {
		try {
			const contactList = await this._entity.loadRoot(ContactListTypeRef, user.userGroup.group);
			const indexTimestamp = await this._contact.getIndexTimestamp(contactList);
			if (indexTimestamp === NOTHING_INDEXED_TIMESTAMP) await this._contact.indexFullContactList(contactList);
else if (cacheInfo?.isNewOfflineDb) await this._entity.loadAll(ContactTypeRef, contactList.contacts);
		} catch (e) {
			if (!(e instanceof NotFoundError)) throw e;
		}
	}
	enableMailIndexing() {
		return this.db.initialized.then(() => {
			return this._mail.enableMailIndexing(this._initParams.user).then(() => {
				this._mail.mailboxIndexingPromise.catch(ofClass(CancelledError, noOp));
			});
		});
	}
	async disableMailIndexing() {
		await this.db.initialized;
		if (!this._core.isStoppedProcessing()) {
			await this.deleteIndex(this._initParams.user._id);
			await this.init({
				user: this._initParams.user,
				keyLoaderFacade: this._initParams.keyLoaderFacade
			});
		}
	}
	async deleteIndex(userId) {
		this._core.stopProcessing();
		await this._mail.disableMailIndexing(userId);
	}
	extendMailIndex(newOldestTimestamp) {
		return this._mail.extendIndexIfNeeded(this._initParams.user, newOldestTimestamp);
	}
	cancelMailIndexing() {
		return this._mail.cancelMailIndexing();
	}
	addBatchesToQueue(batches) {
		this._realtimeEventQueue.addBatches(batches);
	}
	startProcessing() {
		this._core.queue.start();
	}
	async onVisibilityChanged(visible) {
		this._core.onVisibilityChanged(visible);
	}
	_reCreateIndex() {
		const mailIndexingWasEnabled = this._mail.mailIndexingEnabled;
		return this._mail.disableMailIndexing(assertNotNull(this._initParams.user._id)).then(() => {
			return this.init({
				user: this._initParams.user,
				keyLoaderFacade: this._initParams.keyLoaderFacade,
				retryOnError: false
			}).then(() => {
				if (mailIndexingWasEnabled) return this.enableMailIndexing();
			});
		});
	}
	async createIndexTables(user, userGroupKey) {
		this.db.key = aes256RandomKey();
		this.db.iv = random.generateRandomData(IV_BYTE_LENGTH);
		const groupBatches = await this._loadGroupData(user);
		const userEncDbKey = encryptKeyWithVersionedKey(userGroupKey, this.db.key);
		const transaction = await this.db.dbFacade.createTransaction(false, [MetaDataOS, GroupDataOS]);
		await transaction.put(MetaDataOS, Metadata.userEncDbKey, userEncDbKey.key);
		await transaction.put(MetaDataOS, Metadata.mailIndexingEnabled, this._mail.mailIndexingEnabled);
		await transaction.put(MetaDataOS, Metadata.encDbIv, aes256EncryptSearchIndexEntry(this.db.key, this.db.iv));
		await transaction.put(MetaDataOS, Metadata.userGroupKeyVersion, userEncDbKey.encryptingKeyVersion);
		await transaction.put(MetaDataOS, Metadata.lastEventIndexTimeMs, this._entityRestClient.getRestClient().getServerTimestampMs());
		await this._initGroupData(groupBatches, transaction);
		await this._updateIndexedGroups();
		this._dbInitializedDeferredObject.resolve();
	}
	async loadIndexTables(user, userGroupKey, metaData) {
		this.db.key = decryptKey(userGroupKey, metaData.userEncDbKey);
		this.db.iv = unauthenticatedAesDecrypt(this.db.key, neverNull(metaData.encDbIv), true);
		this._mail.mailIndexingEnabled = metaData.mailIndexingEnabled;
		const groupDiff = await this._loadGroupDiff(user);
		await this._updateGroups(user, groupDiff);
		await this._mail.updateCurrentIndexTimestamp(user);
		await this._updateIndexedGroups();
		this._dbInitializedDeferredObject.resolve();
		await this._contact.suggestionFacade.load();
	}
	async _updateIndexedGroups() {
		const t = await this.db.dbFacade.createTransaction(true, [GroupDataOS]);
		const indexedGroupIds = await pMap(await t.getAll(GroupDataOS), (groupDataEntry) => downcast(groupDataEntry.key));
		if (indexedGroupIds.length === 0) {
			console.log("no group ids in database, disabling indexer");
			this.disableMailIndexing();
		}
		this._indexedGroupIds = indexedGroupIds;
	}
	_loadGroupDiff(user) {
		let currentGroups = filterIndexMemberships(user).map((m) => {
			return {
				id: m.group,
				type: getMembershipGroupType(m)
			};
		});
		return this.db.dbFacade.createTransaction(true, [GroupDataOS]).then((t) => {
			return t.getAll(GroupDataOS).then((loadedGroups) => {
				if (!Array.isArray(loadedGroups)) throw new InvalidDatabaseStateError("loadedGroups is not an array");
				let oldGroups = loadedGroups.map((group) => {
					if (typeof group?.key !== "string" || typeof group?.value?.groupType !== "string") throw new InvalidDatabaseStateError(`loaded group is malformed: ${group} ${JSON.stringify(group)}`);
					const id = group.key;
					return {
						id,
						type: group.value.groupType
					};
				});
				let deletedGroups = oldGroups.filter((oldGroup) => !currentGroups.some((m) => m.id === oldGroup.id));
				let newGroups = currentGroups.filter((m) => !oldGroups.some((oldGroup) => m.id === oldGroup.id));
				return {
					deletedGroups,
					newGroups
				};
			});
		});
	}
	/**
	*
	* Initializes the index db for new groups of the user, but does not start the actual indexing for those groups.
	* If the user was removed from a contact or mail group the function throws a CancelledError to delete the complete mail index afterwards.
	*/
	_updateGroups(user, groupDiff) {
		if (groupDiff.deletedGroups.some((g) => g.type === GroupType.Mail || g.type === GroupType.Contact)) return Promise.reject(new MembershipRemovedError("user has been removed from contact or mail group"));
else if (groupDiff.newGroups.length > 0) return this._loadGroupData(user, groupDiff.newGroups.map((g) => g.id)).then((groupBatches) => {
			return this.db.dbFacade.createTransaction(false, [GroupDataOS]).then((t) => {
				return this._initGroupData(groupBatches, t);
			});
		});
		return Promise.resolve();
	}
	/**
	* Provides a GroupData object including the last 100 event batch ids for all indexed membership groups of the given user.
	*/
	_loadGroupData(user, restrictToTheseGroups) {
		let memberships = filterIndexMemberships(user);
		const restrictTo = restrictToTheseGroups;
		if (restrictTo) memberships = memberships.filter((membership) => contains(restrictTo, membership.group));
		return pMap(memberships, (membership) => {
			return this._entity.loadRange(EntityEventBatchTypeRef, membership.group, GENERATED_MAX_ID, 1, true).then((eventBatches) => {
				return {
					groupId: membership.group,
					groupData: {
						lastBatchIds: eventBatches.map((eventBatch) => eventBatch._id[1]),
						indexTimestamp: NOTHING_INDEXED_TIMESTAMP,
						groupType: getMembershipGroupType(membership)
					}
				};
			}).catch(ofClass(NotAuthorizedError, () => {
				console.log("could not download entity updates => lost permission on list");
				return null;
			}));
		}).then((data) => data.filter(isNotNull));
	}
	/**
	* creates the initial group data for all provided group ids
	*/
	_initGroupData(groupBatches, t2) {
		for (const groupIdToLastBatchId of groupBatches) t2.put(GroupDataOS, groupIdToLastBatchId.groupId, groupIdToLastBatchId.groupData);
		return t2.wait();
	}
	async _loadNewEntities(groupIdToEventBatches) {
		const batchesOfAllGroups = [];
		const lastLoadedBatchIdInGroup = new Map();
		const transaction = await this.db.dbFacade.createTransaction(true, [MetaDataOS]);
		const lastIndexTimeMs = await transaction.get(MetaDataOS, Metadata.lastEventIndexTimeMs);
		await this._throwIfOutOfDate();
		try {
			for (let groupIdToEventBatch of groupIdToEventBatches) if (groupIdToEventBatch.eventBatchIds.length > 0) {
				let startId = this._getStartIdForLoadingMissedEventBatches(groupIdToEventBatch.eventBatchIds);
				let eventBatchesOnServer = [];
				eventBatchesOnServer = await this._entity.loadAll(EntityEventBatchTypeRef, groupIdToEventBatch.groupId, startId);
				const batchesToQueue = [];
				for (let batch of eventBatchesOnServer) {
					const batchId = getElementId(batch);
					if (groupIdToEventBatch.eventBatchIds.indexOf(batchId) === -1 && firstBiggerThanSecond(batchId, startId)) {
						batchesToQueue.push({
							groupId: groupIdToEventBatch.groupId,
							batchId,
							events: batch.events
						});
						const lastBatch = lastLoadedBatchIdInGroup.get(groupIdToEventBatch.groupId);
						if (lastBatch == null || firstBiggerThanSecond(batchId, lastBatch)) lastLoadedBatchIdInGroup.set(groupIdToEventBatch.groupId, batchId);
					}
				}
				if (lastIndexTimeMs == null && eventBatchesOnServer.length === batchesToQueue.length) throw new OutOfSyncError(`We lost entity events for group ${groupIdToEventBatch.groupId}. start id was ${startId}`);
				batchesOfAllGroups.push(...batchesToQueue);
			}
		} catch (e) {
			if (e instanceof NotAuthorizedError) {
				console.log("could not download entity updates => lost permission on list");
				return;
			}
			throw e;
		}
		this._core.addBatchesToQueue(batchesOfAllGroups);
		this._initiallyLoadedBatchIdsPerGroup = lastLoadedBatchIdInGroup;
		this._realtimeEventQueue.resume();
		this.startProcessing();
		await this._writeServerTimestamp();
	}
	_getStartIdForLoadingMissedEventBatches(lastEventBatchIds) {
		let newestBatchId = lastEventBatchIds[0];
		let oldestBatchId = lastEventBatchIds[lastEventBatchIds.length - 1];
		let startId = timestampToGeneratedId(generatedIdToTimestamp(newestBatchId) - 6e4);
		if (!firstBiggerThanSecond(startId, oldestBatchId)) startId = timestampToGeneratedId(generatedIdToTimestamp(oldestBatchId) - 1);
		return startId;
	}
	/**
	* @private a map from group id to event batches
	*/
	_loadPersistentGroupData(user) {
		return this.db.dbFacade.createTransaction(true, [GroupDataOS]).then((t) => {
			return Promise.all(filterIndexMemberships(user).map((membership) => {
				return t.get(GroupDataOS, membership.group).then((groupData) => {
					if (groupData) return {
						groupId: membership.group,
						eventBatchIds: groupData.lastBatchIds
					};
else throw new InvalidDatabaseStateError("no group data for group " + membership.group + " indexedGroupIds: " + this._indexedGroupIds.join(","));
				});
			}));
		});
	}
	_processEntityEvents(batch) {
		const { events, groupId, batchId } = batch;
		return this.db.initialized.then(async () => {
			if (!this.db.dbFacade.indexingSupported) return Promise.resolve();
			if (filterIndexMemberships(this._initParams.user).map((m) => m.group).indexOf(groupId) === -1) return Promise.resolve();
			if (this._indexedGroupIds.indexOf(groupId) === -1) return Promise.resolve();
			markStart("processEntityEvents");
			const groupedEvents = new Map();
			events.reduce((all, update) => {
				if (isSameTypeRefByAttr(MailTypeRef, update.application, update.type)) getFromMap(all, MailTypeRef, () => []).push(update);
else if (isSameTypeRefByAttr(ContactTypeRef, update.application, update.type)) getFromMap(all, ContactTypeRef, () => []).push(update);
else if (isSameTypeRefByAttr(UserTypeRef, update.application, update.type)) getFromMap(all, UserTypeRef, () => []).push(update);
else if (isSameTypeRefByAttr(ImportMailStateTypeRef, update.application, update.type)) getFromMap(all, ImportMailStateTypeRef, () => []).push(update);
				return all;
			}, groupedEvents);
			markStart("processEvent");
			return pMap(groupedEvents.entries(), ([key, value]) => {
				let promise = Promise.resolve();
				if (isSameTypeRef(UserTypeRef, key)) return this._processUserEntityEvents(value);
				const typeInfoToIndex = isSameTypeRef(ImportMailStateTypeRef, key) || isSameTypeRef(MailTypeRef, key) ? typeRefToTypeInfo(MailTypeRef) : typeRefToTypeInfo(key);
				const indexUpdate = _createNewIndexUpdate(typeInfoToIndex);
				if (isSameTypeRef(MailTypeRef, key)) promise = this._mail.processEntityEvents(value, groupId, batchId, indexUpdate);
else if (isSameTypeRef(ContactTypeRef, key)) promise = this._contact.processEntityEvents(value, groupId, batchId, indexUpdate);
else if (isSameTypeRef(ImportMailStateTypeRef, key)) promise = this._mail.processImportStateEntityEvents(value, groupId, batchId, indexUpdate);
				return promise.then(() => {
					markEnd("processEvent");
					markStart("writeIndexUpdate");
					return this._core.writeIndexUpdateWithBatchId(groupId, batchId, indexUpdate);
				}).then(() => {
					markEnd("writeIndexUpdate");
					markEnd("processEntityEvents");
				});
			});
		}).catch(ofClass(CancelledError, noOp)).catch(ofClass(DbError, (e) => {
			if (this._core.isStoppedProcessing()) console.log("Ignoring DBerror when indexing is disabled", e);
else throw e;
		})).catch(ofClass(InvalidDatabaseStateError, (e) => {
			console.log("InvalidDatabaseStateError during _processEntityEvents");
			this._core.stopProcessing();
			return this._reCreateIndex();
		}));
	}
	/**
	* @VisibleForTesting
	* @param events
	*/
	async _processUserEntityEvents(events) {
		for (const event of events) {
			if (!(event.operation === OperationType.UPDATE && isSameId(this._initParams.user._id, event.instanceId))) continue;
			this._initParams.user = await this._entity.load(UserTypeRef, event.instanceId);
			await updateEncryptionMetadata(this.db.dbFacade, this._initParams.keyLoaderFacade, MetaDataOS);
		}
	}
	async _throwIfOutOfDate() {
		const transaction = await this.db.dbFacade.createTransaction(true, [MetaDataOS]);
		const lastIndexTimeMs = await transaction.get(MetaDataOS, Metadata.lastEventIndexTimeMs);
		if (lastIndexTimeMs != null) {
			const now = this._entityRestClient.getRestClient().getServerTimestampMs();
			const timeSinceLastIndex = now - lastIndexTimeMs;
			if (timeSinceLastIndex >= daysToMillis(ENTITY_EVENT_BATCH_TTL_DAYS)) throw new OutOfSyncError(`we haven't updated the index in ${millisToDays(timeSinceLastIndex)} days. last update was ${new Date(neverNull(lastIndexTimeMs)).toString()}`);
		}
	}
	async _writeServerTimestamp() {
		const transaction = await this.db.dbFacade.createTransaction(false, [MetaDataOS]);
		const now = this._entityRestClient.getRestClient().getServerTimestampMs();
		await transaction.put(MetaDataOS, Metadata.lastEventIndexTimeMs, now);
	}
};

//#endregion
export { Indexer };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5kZXhlci1jaHVuay5qcyIsIm5hbWVzIjpbImNvcmU6IEluZGV4ZXJDb3JlIiwiZGI6IERiIiwiZW50aXR5OiBFbnRpdHlDbGllbnQiLCJzdWdnZXN0aW9uRmFjYWRlOiBTdWdnZXN0aW9uRmFjYWRlPENvbnRhY3Q+IiwiY29udGFjdDogQ29udGFjdCIsInR1dGFub3RhTW9kZWxzIiwiZXZlbnQ6IEVudGl0eVVwZGF0ZSIsImNvbnRhY3RMaXN0OiBDb250YWN0TGlzdCIsImdyb3VwRGF0YTogR3JvdXBEYXRhIHwgbnVsbCIsImV2ZW50czogRW50aXR5VXBkYXRlW10iLCJncm91cElkOiBJZCIsImJhdGNoSWQ6IElkIiwiaW5kZXhVcGRhdGU6IEluZGV4VXBkYXRlIiwibWVzc2FnZTogc3RyaW5nIiwiZGI6IERiIiwicXVldWU6IEV2ZW50UXVldWUiLCJicm93c2VyRGF0YTogQnJvd3NlckRhdGEiLCJpbnN0YW5jZTogUmVjb3JkPHN0cmluZywgYW55PiIsImF0dHJpYnV0ZXM6IEF0dHJpYnV0ZUhhbmRsZXJbXSIsImluZGV4RW50cmllczogTWFwPHN0cmluZywgU2VhcmNoSW5kZXhFbnRyeT5bXSIsImF0dHJpYnV0ZUtleVRvSW5kZXhNYXA6IE1hcDxzdHJpbmcsIFNlYXJjaEluZGV4RW50cnk+IiwiaWQ6IElkVHVwbGUiLCJvd25lckdyb3VwOiBJZCIsImtleVRvSW5kZXhFbnRyaWVzOiBNYXA8c3RyaW5nLCBTZWFyY2hJbmRleEVudHJ5W10+IiwiaW5kZXhVcGRhdGU6IEluZGV4VXBkYXRlIiwiZW5jV29yZHNCNjQ6IHN0cmluZ1tdIiwiZXZlbnQ6IEVudGl0eVVwZGF0ZSIsImJhdGNoZXM6IFF1ZXVlZEJhdGNoW10iLCJkYXRhUGVyR3JvdXA6IEFycmF5PHtcblx0XHRcdGdyb3VwSWQ6IElkXG5cdFx0XHRpbmRleFRpbWVzdGFtcDogbnVtYmVyXG5cdFx0fT4iLCJncm91cElkOiBJZCIsImJhdGNoSWQ6IElkIiwidXBkYXRlR3JvdXBEYXRhOiAodDogRGJUcmFuc2FjdGlvbikgPT4gJFByb21pc2FibGU8dm9pZD4iLCJyb3dLZXlzOiBFbmNXb3JkVG9NZXRhUm93IHwgbnVsbCIsImUiLCJvcGVyYXRpb246IFdyaXRlT3BlcmF0aW9uIiwidmlzaWJsZTogYm9vbGVhbiIsInRyYW5zYWN0aW9uOiBEYlRyYW5zYWN0aW9uIiwibWV0YVJvd0tleTogbnVtYmVyIiwiaW5zdGFuY2VJbmZvczogRW5jSW5zdGFuY2VJZFdpdGhUaW1lc3RhbXBbXSIsInJhbmdlc1RvUmVtb3ZlOiBBcnJheTxbbnVtYmVyLCBudW1iZXJdPiIsImVuY1dvcmRUb01ldGFSb3c6IEVuY1dvcmRUb01ldGFSb3ciLCJwcm9taXNlczogUHJvbWlzZTx1bmtub3duPltdIiwiYXBwSWQ6IG51bWJlciIsInR5cGVJZDogbnVtYmVyIiwiZW5jV29yZEI2NDogQjY0RW5jSW5kZXhLZXkiLCJlbmNyeXB0ZWRFbnRyaWVzOiBBcnJheTxFbmNTZWFyY2hJbmRleEVudHJ5V2l0aFRpbWVzdGFtcD4iLCJtZXRhRGF0YTogU2VhcmNoSW5kZXhNZXRhRGF0YVJvdyIsImVudHJpZXM6IEFycmF5PEVuY1NlYXJjaEluZGV4RW50cnlXaXRoVGltZXN0YW1wPiIsInN0YXJ0SW5kZXg6IG51bWJlciIsInRpbWVzdGFtcDogbnVtYmVyIiwibWV0YUVudHJ5SW5kZXg6IG51bWJlciIsImJpbmFyeUJsb2NrOiBTZWFyY2hJbmRleERiUm93IHwgbnVsbCIsInRpbWVzdGFtcFRvRW50cmllczogTWFwPG51bWJlciwgQXJyYXk8VWludDhBcnJheT4+IiwidGltZXN0YW1wVG9FbnRyaWVzOiBNYXA8bnVtYmVyLCBBcnJheTxFbmNyeXB0ZWRTZWFyY2hJbmRleEVudHJ5Pj4iLCJwcmVmZXJGaXJzdDogYm9vbGVhbiIsImVuY3J5cHRlZFNlYXJjaEluZGV4RW50cmllczogQXJyYXk8RW5jU2VhcmNoSW5kZXhFbnRyeVdpdGhUaW1lc3RhbXA+Iiwib2xkZXN0VGltZXN0YW1wOiBudW1iZXIiLCJlbmNXb3JkQmFzZTY0OiBCNjRFbmNJbmRleEtleSIsIm1ldGFEYXRhOiBTZWFyY2hJbmRleE1ldGFEYXRhRGJSb3cgfCBudWxsIiwibWV0YVRlbXBsYXRlOiBQYXJ0aWFsPFNlYXJjaEluZGV4TWV0YURhdGFEYlJvdz4iLCJncm91cERhdGE6IEdyb3VwRGF0YSB8IG51bGwiLCJ0eXBlOiBUeXBlUmVmPFQ+IiwiZGI6IERiIiwid29yZHM6IHN0cmluZ1tdIiwid29yZDogc3RyaW5nIiwibWVzc2FnZTogc3RyaW5nIiwiZGI6IElEQkRhdGFiYXNlIiwiREJfVkVSU0lPTjogbnVtYmVyIiwiZW50aXR5UmVzdENsaWVudDogRW50aXR5UmVzdENsaWVudCIsImluZm9NZXNzYWdlSGFuZGxlcjogSW5mb01lc3NhZ2VIYW5kbGVyIiwiYnJvd3NlckRhdGE6IEJyb3dzZXJEYXRhIiwiZGVmYXVsdEVudGl0eVJlc3RDYWNoZTogRGVmYXVsdEVudGl0eVJlc3RDYWNoZSIsIm1ha2VNYWlsSW5kZXhlcjogKGNvcmU6IEluZGV4ZXJDb3JlLCBkYjogRGIpID0+IE1haWxJbmRleGVyIiwibmV4dEVsZW1lbnQ6IFF1ZXVlZEJhdGNoIiwidXNlcjogVXNlciIsImNhY2hlSW5mbzogQ2FjaGVJbmZvIHwgdW5kZWZpbmVkIiwiY29udGFjdExpc3Q6IENvbnRhY3RMaXN0IiwidXNlcklkOiBzdHJpbmciLCJuZXdPbGRlc3RUaW1lc3RhbXA6IG51bWJlciIsImJhdGNoZXM6IFF1ZXVlZEJhdGNoW10iLCJ2aXNpYmxlOiBib29sZWFuIiwidXNlckdyb3VwS2V5OiBWZXJzaW9uZWRLZXkiLCJ1c2VyR3JvdXBLZXk6IEFlc0tleSIsIm1ldGFEYXRhOiBFbmNyeXB0ZWRJbmRleGVyTWV0YURhdGEiLCJ0OiBEYlRyYW5zYWN0aW9uIiwiZ3JvdXBEYXRhRW50cnk6IERhdGFiYXNlRW50cnkiLCJjdXJyZW50R3JvdXBzOiBBcnJheTx7XG5cdFx0XHRpZDogSWRcblx0XHRcdHR5cGU6IEdyb3VwVHlwZVxuXHRcdH0+IiwibG9hZGVkR3JvdXBzOiB7XG5cdFx0XHRcdFx0XHRrZXk6IERiS2V5XG5cdFx0XHRcdFx0XHR2YWx1ZTogR3JvdXBEYXRhXG5cdFx0XHRcdFx0fVtdIiwiaWQ6IElkIiwiZ3JvdXBEaWZmOiB7XG5cdFx0XHRkZWxldGVkR3JvdXBzOiB7XG5cdFx0XHRcdGlkOiBJZFxuXHRcdFx0XHR0eXBlOiBHcm91cFR5cGVcblx0XHRcdH1bXVxuXHRcdFx0bmV3R3JvdXBzOiB7XG5cdFx0XHRcdGlkOiBJZFxuXHRcdFx0XHR0eXBlOiBHcm91cFR5cGVcblx0XHRcdH1bXVxuXHRcdH0iLCJncm91cEJhdGNoZXM6IHtcblx0XHRcdFx0XHRcdGdyb3VwSWQ6IElkXG5cdFx0XHRcdFx0XHRncm91cERhdGE6IEdyb3VwRGF0YVxuXHRcdFx0XHRcdH1bXSIsInJlc3RyaWN0VG9UaGVzZUdyb3Vwcz86IElkW10iLCJtZW1iZXJzaGlwOiBHcm91cE1lbWJlcnNoaXAiLCJncm91cEJhdGNoZXM6IHtcblx0XHRcdGdyb3VwSWQ6IElkXG5cdFx0XHRncm91cERhdGE6IEdyb3VwRGF0YVxuXHRcdH1bXSIsInQyOiBEYlRyYW5zYWN0aW9uIiwiZ3JvdXBJZFRvRXZlbnRCYXRjaGVzOiB7XG5cdFx0XHRncm91cElkOiBJZFxuXHRcdFx0ZXZlbnRCYXRjaElkczogSWRbXVxuXHRcdH1bXSIsImJhdGNoZXNPZkFsbEdyb3VwczogUXVldWVkQmF0Y2hbXSIsImxhc3RJbmRleFRpbWVNczogbnVtYmVyIHwgbnVsbCIsImV2ZW50QmF0Y2hlc09uU2VydmVyOiBFbnRpdHlFdmVudEJhdGNoW10iLCJiYXRjaGVzVG9RdWV1ZTogUXVldWVkQmF0Y2hbXSIsImxhc3RFdmVudEJhdGNoSWRzOiBJZFtdIiwiZ3JvdXBEYXRhOiBHcm91cERhdGEgfCBudWxsIiwiYmF0Y2g6IFF1ZXVlZEJhdGNoIiwiZ3JvdXBlZEV2ZW50czogTWFwPFR5cGVSZWY8YW55PiwgRW50aXR5VXBkYXRlW10+IiwiZXZlbnRzOiBFbnRpdHlVcGRhdGVbXSJdLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWlsLWFwcC93b3JrZXJVdGlscy9pbmRleC9Db250YWN0SW5kZXhlci50cyIsIi4uL3NyYy9jb21tb24vYXBpL2NvbW1vbi9lcnJvci9JbnZhbGlkRGF0YWJhc2VTdGF0ZUVycm9yLnRzIiwiLi4vc3JjL21haWwtYXBwL3dvcmtlclV0aWxzL2luZGV4L0luZGV4ZXJDb3JlLnRzIiwiLi4vc3JjL21haWwtYXBwL3dvcmtlclV0aWxzL2luZGV4L1N1Z2dlc3Rpb25GYWNhZGUudHMiLCIuLi9zcmMvY29tbW9uL2FwaS9jb21tb24vZXJyb3IvTWVtYmVyc2hpcFJlbW92ZWRFcnJvci50cyIsIi4uL3NyYy9jb21tb24vYXBpL3dvcmtlci91dGlscy9EYlV0aWxzLnRzIiwiLi4vc3JjL21haWwtYXBwL3dvcmtlclV0aWxzL2luZGV4L0luZGV4ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTm90QXV0aG9yaXplZEVycm9yLCBOb3RGb3VuZEVycm9yIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL2Vycm9yL1Jlc3RFcnJvci5qc1wiXG5pbXBvcnQgdHlwZSB7IENvbnRhY3QsIENvbnRhY3RMaXN0IH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvZW50aXRpZXMvdHV0YW5vdGEvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgQ29udGFjdFR5cGVSZWYgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9lbnRpdGllcy90dXRhbm90YS9UeXBlUmVmcy5qc1wiXG5pbXBvcnQgeyB0eXBlTW9kZWxzIGFzIHR1dGFub3RhTW9kZWxzIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvZW50aXRpZXMvdHV0YW5vdGEvVHlwZU1vZGVscy5qc1wiXG5pbXBvcnQgdHlwZSB7IERiLCBHcm91cERhdGEsIEluZGV4VXBkYXRlLCBTZWFyY2hJbmRleEVudHJ5IH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL3NlYXJjaC9TZWFyY2hUeXBlcy5qc1wiXG5pbXBvcnQgeyBfY3JlYXRlTmV3SW5kZXhVcGRhdGUsIHR5cGVSZWZUb1R5cGVJbmZvIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL3NlYXJjaC9JbmRleFV0aWxzLmpzXCJcbmltcG9ydCB7IG5ldmVyTnVsbCwgbm9PcCwgb2ZDbGFzcywgcHJvbWlzZU1hcCB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHsgRlVMTF9JTkRFWEVEX1RJTUVTVEFNUCwgT3BlcmF0aW9uVHlwZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9UdXRhbm90YUNvbnN0YW50cy5qc1wiXG5pbXBvcnQgeyBJbmRleGVyQ29yZSB9IGZyb20gXCIuL0luZGV4ZXJDb3JlLmpzXCJcbmltcG9ydCB7IFN1Z2dlc3Rpb25GYWNhZGUgfSBmcm9tIFwiLi9TdWdnZXN0aW9uRmFjYWRlLmpzXCJcbmltcG9ydCB7IHRva2VuaXplIH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5pbXBvcnQgdHlwZSB7IEVudGl0eVVwZGF0ZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2VudGl0aWVzL3N5cy9UeXBlUmVmcy5qc1wiXG5pbXBvcnQgeyBFbnRpdHlDbGllbnQgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vRW50aXR5Q2xpZW50LmpzXCJcbmltcG9ydCB7IEdyb3VwRGF0YU9TLCBNZXRhRGF0YU9TIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL3NlYXJjaC9JbmRleFRhYmxlcy5qc1wiXG5cbmV4cG9ydCBjbGFzcyBDb250YWN0SW5kZXhlciB7XG5cdF9jb3JlOiBJbmRleGVyQ29yZVxuXHRfZGI6IERiXG5cdF9lbnRpdHk6IEVudGl0eUNsaWVudFxuXHRzdWdnZXN0aW9uRmFjYWRlOiBTdWdnZXN0aW9uRmFjYWRlPENvbnRhY3Q+XG5cblx0Y29uc3RydWN0b3IoY29yZTogSW5kZXhlckNvcmUsIGRiOiBEYiwgZW50aXR5OiBFbnRpdHlDbGllbnQsIHN1Z2dlc3Rpb25GYWNhZGU6IFN1Z2dlc3Rpb25GYWNhZGU8Q29udGFjdD4pIHtcblx0XHR0aGlzLl9jb3JlID0gY29yZVxuXHRcdHRoaXMuX2RiID0gZGJcblx0XHR0aGlzLl9lbnRpdHkgPSBlbnRpdHlcblx0XHR0aGlzLnN1Z2dlc3Rpb25GYWNhZGUgPSBzdWdnZXN0aW9uRmFjYWRlXG5cdH1cblxuXHRjcmVhdGVDb250YWN0SW5kZXhFbnRyaWVzKGNvbnRhY3Q6IENvbnRhY3QpOiBNYXA8c3RyaW5nLCBTZWFyY2hJbmRleEVudHJ5W10+IHtcblx0XHRjb25zdCBDb250YWN0TW9kZWwgPSB0dXRhbm90YU1vZGVscy5Db250YWN0XG5cdFx0bGV0IGtleVRvSW5kZXhFbnRyaWVzID0gdGhpcy5fY29yZS5jcmVhdGVJbmRleEVudHJpZXNGb3JBdHRyaWJ1dGVzKGNvbnRhY3QsIFtcblx0XHRcdHtcblx0XHRcdFx0YXR0cmlidXRlOiBDb250YWN0TW9kZWwudmFsdWVzW1wiZmlyc3ROYW1lXCJdLFxuXHRcdFx0XHR2YWx1ZTogKCkgPT4gY29udGFjdC5maXJzdE5hbWUsXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRhdHRyaWJ1dGU6IENvbnRhY3RNb2RlbC52YWx1ZXNbXCJsYXN0TmFtZVwiXSxcblx0XHRcdFx0dmFsdWU6ICgpID0+IGNvbnRhY3QubGFzdE5hbWUsXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRhdHRyaWJ1dGU6IENvbnRhY3RNb2RlbC52YWx1ZXNbXCJuaWNrbmFtZVwiXSxcblx0XHRcdFx0dmFsdWU6ICgpID0+IGNvbnRhY3Qubmlja25hbWUgfHwgXCJcIixcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdGF0dHJpYnV0ZTogQ29udGFjdE1vZGVsLnZhbHVlc1tcInJvbGVcIl0sXG5cdFx0XHRcdHZhbHVlOiAoKSA9PiBjb250YWN0LnJvbGUsXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRhdHRyaWJ1dGU6IENvbnRhY3RNb2RlbC52YWx1ZXNbXCJ0aXRsZVwiXSxcblx0XHRcdFx0dmFsdWU6ICgpID0+IGNvbnRhY3QudGl0bGUgfHwgXCJcIixcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdGF0dHJpYnV0ZTogQ29udGFjdE1vZGVsLnZhbHVlc1tcImNvbW1lbnRcIl0sXG5cdFx0XHRcdHZhbHVlOiAoKSA9PiBjb250YWN0LmNvbW1lbnQsXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRhdHRyaWJ1dGU6IENvbnRhY3RNb2RlbC52YWx1ZXNbXCJjb21wYW55XCJdLFxuXHRcdFx0XHR2YWx1ZTogKCkgPT4gY29udGFjdC5jb21wYW55LFxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0YXR0cmlidXRlOiBDb250YWN0TW9kZWwuYXNzb2NpYXRpb25zW1wiYWRkcmVzc2VzXCJdLFxuXHRcdFx0XHR2YWx1ZTogKCkgPT4gY29udGFjdC5hZGRyZXNzZXMubWFwKChhKSA9PiBhLmFkZHJlc3MpLmpvaW4oXCIsXCIpLFxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0YXR0cmlidXRlOiBDb250YWN0TW9kZWwuYXNzb2NpYXRpb25zW1wibWFpbEFkZHJlc3Nlc1wiXSxcblx0XHRcdFx0dmFsdWU6ICgpID0+IGNvbnRhY3QubWFpbEFkZHJlc3Nlcy5tYXAoKGNtYSkgPT4gY21hLmFkZHJlc3MpLmpvaW4oXCIsXCIpLFxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0YXR0cmlidXRlOiBDb250YWN0TW9kZWwuYXNzb2NpYXRpb25zW1wicGhvbmVOdW1iZXJzXCJdLFxuXHRcdFx0XHR2YWx1ZTogKCkgPT4gY29udGFjdC5waG9uZU51bWJlcnMubWFwKChwbikgPT4gcG4ubnVtYmVyKS5qb2luKFwiLFwiKSxcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdGF0dHJpYnV0ZTogQ29udGFjdE1vZGVsLmFzc29jaWF0aW9uc1tcInNvY2lhbElkc1wiXSxcblx0XHRcdFx0dmFsdWU6ICgpID0+IGNvbnRhY3Quc29jaWFsSWRzLm1hcCgocykgPT4gcy5zb2NpYWxJZCkuam9pbihcIixcIiksXG5cdFx0XHR9LFxuXHRcdF0pXG5cblx0XHR0aGlzLnN1Z2dlc3Rpb25GYWNhZGUuYWRkU3VnZ2VzdGlvbnModGhpcy5fZ2V0U3VnZ2VzdGlvbldvcmRzKGNvbnRhY3QpKVxuXHRcdHJldHVybiBrZXlUb0luZGV4RW50cmllc1xuXHR9XG5cblx0X2dldFN1Z2dlc3Rpb25Xb3Jkcyhjb250YWN0OiBDb250YWN0KTogc3RyaW5nW10ge1xuXHRcdHJldHVybiB0b2tlbml6ZShjb250YWN0LmZpcnN0TmFtZSArIFwiIFwiICsgY29udGFjdC5sYXN0TmFtZSArIFwiIFwiICsgY29udGFjdC5tYWlsQWRkcmVzc2VzLm1hcCgobWEpID0+IG1hLmFkZHJlc3MpLmpvaW4oXCIgXCIpKVxuXHR9XG5cblx0cHJvY2Vzc05ld0NvbnRhY3QoZXZlbnQ6IEVudGl0eVVwZGF0ZSk6IFByb21pc2U8XG5cdFx0fCB7XG5cdFx0XHRcdGNvbnRhY3Q6IENvbnRhY3Rcblx0XHRcdFx0a2V5VG9JbmRleEVudHJpZXM6IE1hcDxzdHJpbmcsIFNlYXJjaEluZGV4RW50cnlbXT5cblx0XHQgIH1cblx0XHR8IG51bGxcblx0XHR8IHVuZGVmaW5lZFxuXHQ+IHtcblx0XHRyZXR1cm4gdGhpcy5fZW50aXR5XG5cdFx0XHQubG9hZChDb250YWN0VHlwZVJlZiwgW2V2ZW50Lmluc3RhbmNlTGlzdElkLCBldmVudC5pbnN0YW5jZUlkXSlcblx0XHRcdC50aGVuKChjb250YWN0KSA9PiB7XG5cdFx0XHRcdGxldCBrZXlUb0luZGV4RW50cmllcyA9IHRoaXMuY3JlYXRlQ29udGFjdEluZGV4RW50cmllcyhjb250YWN0KVxuXHRcdFx0XHRyZXR1cm4gdGhpcy5zdWdnZXN0aW9uRmFjYWRlLnN0b3JlKCkudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdGNvbnRhY3QsXG5cdFx0XHRcdFx0XHRrZXlUb0luZGV4RW50cmllcyxcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKFxuXHRcdFx0XHRvZkNsYXNzKE5vdEZvdW5kRXJyb3IsICgpID0+IHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhcInRyaWVkIHRvIGluZGV4IG5vbiBleGlzdGluZyBjb250YWN0XCIpXG5cdFx0XHRcdFx0cmV0dXJuIG51bGxcblx0XHRcdFx0fSksXG5cdFx0XHQpXG5cdFx0XHQuY2F0Y2goXG5cdFx0XHRcdG9mQ2xhc3MoTm90QXV0aG9yaXplZEVycm9yLCAoKSA9PiB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coXCJ0cmllZCB0byBpbmRleCBjb250YWN0IHdpdGhvdXQgcGVybWlzc2lvblwiKVxuXHRcdFx0XHRcdHJldHVybiBudWxsXG5cdFx0XHRcdH0pLFxuXHRcdFx0KVxuXHR9XG5cblx0YXN5bmMgZ2V0SW5kZXhUaW1lc3RhbXAoY29udGFjdExpc3Q6IENvbnRhY3RMaXN0KTogUHJvbWlzZTxudW1iZXIgfCBudWxsPiB7XG5cdFx0Y29uc3QgdCA9IGF3YWl0IHRoaXMuX2RiLmRiRmFjYWRlLmNyZWF0ZVRyYW5zYWN0aW9uKHRydWUsIFtNZXRhRGF0YU9TLCBHcm91cERhdGFPU10pXG5cdFx0Y29uc3QgZ3JvdXBJZCA9IG5ldmVyTnVsbChjb250YWN0TGlzdC5fb3duZXJHcm91cClcblx0XHRyZXR1cm4gdC5nZXQoR3JvdXBEYXRhT1MsIGdyb3VwSWQpLnRoZW4oKGdyb3VwRGF0YTogR3JvdXBEYXRhIHwgbnVsbCkgPT4ge1xuXHRcdFx0cmV0dXJuIGdyb3VwRGF0YSA/IGdyb3VwRGF0YS5pbmRleFRpbWVzdGFtcCA6IG51bGxcblx0XHR9KVxuXHR9XG5cblx0LyoqXG5cdCAqIEluZGV4ZXMgdGhlIGNvbnRhY3QgbGlzdCBpZiBpdCBpcyBub3QgeWV0IGluZGV4ZWQuXG5cdCAqL1xuXHRhc3luYyBpbmRleEZ1bGxDb250YWN0TGlzdChjb250YWN0TGlzdDogQ29udGFjdExpc3QpOiBQcm9taXNlPGFueT4ge1xuXHRcdGNvbnN0IGdyb3VwSWQgPSBuZXZlck51bGwoY29udGFjdExpc3QuX293bmVyR3JvdXApXG5cdFx0bGV0IGluZGV4VXBkYXRlID0gX2NyZWF0ZU5ld0luZGV4VXBkYXRlKHR5cGVSZWZUb1R5cGVJbmZvKENvbnRhY3RUeXBlUmVmKSlcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgY29udGFjdHMgPSBhd2FpdCB0aGlzLl9lbnRpdHkubG9hZEFsbChDb250YWN0VHlwZVJlZiwgY29udGFjdExpc3QuY29udGFjdHMpXG5cdFx0XHRmb3IgKGNvbnN0IGNvbnRhY3Qgb2YgY29udGFjdHMpIHtcblx0XHRcdFx0bGV0IGtleVRvSW5kZXhFbnRyaWVzID0gdGhpcy5jcmVhdGVDb250YWN0SW5kZXhFbnRyaWVzKGNvbnRhY3QpXG5cdFx0XHRcdHRoaXMuX2NvcmUuZW5jcnlwdFNlYXJjaEluZGV4RW50cmllcyhjb250YWN0Ll9pZCwgbmV2ZXJOdWxsKGNvbnRhY3QuX293bmVyR3JvdXApLCBrZXlUb0luZGV4RW50cmllcywgaW5kZXhVcGRhdGUpXG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5hbGwoW1xuXHRcdFx0XHR0aGlzLl9jb3JlLndyaXRlSW5kZXhVcGRhdGUoXG5cdFx0XHRcdFx0W1xuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRncm91cElkLFxuXHRcdFx0XHRcdFx0XHRpbmRleFRpbWVzdGFtcDogRlVMTF9JTkRFWEVEX1RJTUVTVEFNUCxcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XSxcblx0XHRcdFx0XHRpbmRleFVwZGF0ZSxcblx0XHRcdFx0KSxcblx0XHRcdFx0dGhpcy5zdWdnZXN0aW9uRmFjYWRlLnN0b3JlKCksXG5cdFx0XHRdKVxuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdGlmIChlIGluc3RhbmNlb2YgTm90Rm91bmRFcnJvcikge1xuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcblx0XHRcdH1cblx0XHRcdHRocm93IGVcblx0XHR9XG5cdH1cblxuXHRwcm9jZXNzRW50aXR5RXZlbnRzKGV2ZW50czogRW50aXR5VXBkYXRlW10sIGdyb3VwSWQ6IElkLCBiYXRjaElkOiBJZCwgaW5kZXhVcGRhdGU6IEluZGV4VXBkYXRlKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0cmV0dXJuIHByb21pc2VNYXAoZXZlbnRzLCBhc3luYyAoZXZlbnQpID0+IHtcblx0XHRcdGlmIChldmVudC5vcGVyYXRpb24gPT09IE9wZXJhdGlvblR5cGUuQ1JFQVRFKSB7XG5cdFx0XHRcdGF3YWl0IHRoaXMucHJvY2Vzc05ld0NvbnRhY3QoZXZlbnQpLnRoZW4oKHJlc3VsdCkgPT4ge1xuXHRcdFx0XHRcdGlmIChyZXN1bHQpIHtcblx0XHRcdFx0XHRcdHRoaXMuX2NvcmUuZW5jcnlwdFNlYXJjaEluZGV4RW50cmllcyhyZXN1bHQuY29udGFjdC5faWQsIG5ldmVyTnVsbChyZXN1bHQuY29udGFjdC5fb3duZXJHcm91cCksIHJlc3VsdC5rZXlUb0luZGV4RW50cmllcywgaW5kZXhVcGRhdGUpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KVxuXHRcdFx0fSBlbHNlIGlmIChldmVudC5vcGVyYXRpb24gPT09IE9wZXJhdGlvblR5cGUuVVBEQVRFKSB7XG5cdFx0XHRcdGF3YWl0IFByb21pc2UuYWxsKFtcblx0XHRcdFx0XHR0aGlzLl9jb3JlLl9wcm9jZXNzRGVsZXRlZChldmVudCwgaW5kZXhVcGRhdGUpLFxuXHRcdFx0XHRcdHRoaXMucHJvY2Vzc05ld0NvbnRhY3QoZXZlbnQpLnRoZW4oKHJlc3VsdCkgPT4ge1xuXHRcdFx0XHRcdFx0aWYgKHJlc3VsdCkge1xuXHRcdFx0XHRcdFx0XHR0aGlzLl9jb3JlLmVuY3J5cHRTZWFyY2hJbmRleEVudHJpZXMoXG5cdFx0XHRcdFx0XHRcdFx0cmVzdWx0LmNvbnRhY3QuX2lkLFxuXHRcdFx0XHRcdFx0XHRcdG5ldmVyTnVsbChyZXN1bHQuY29udGFjdC5fb3duZXJHcm91cCksXG5cdFx0XHRcdFx0XHRcdFx0cmVzdWx0LmtleVRvSW5kZXhFbnRyaWVzLFxuXHRcdFx0XHRcdFx0XHRcdGluZGV4VXBkYXRlLFxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdF0pXG5cdFx0XHR9IGVsc2UgaWYgKGV2ZW50Lm9wZXJhdGlvbiA9PT0gT3BlcmF0aW9uVHlwZS5ERUxFVEUpIHtcblx0XHRcdFx0YXdhaXQgdGhpcy5fY29yZS5fcHJvY2Vzc0RlbGV0ZWQoZXZlbnQsIGluZGV4VXBkYXRlKVxuXHRcdFx0fVxuXHRcdH0pLnRoZW4obm9PcClcblx0fVxufVxuIiwiLy9AYnVuZGxlSW50bzpjb21tb24tbWluXG5cbmltcG9ydCB7IFR1dGFub3RhRXJyb3IgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLWVycm9yXCJcblxuZXhwb3J0IGNsYXNzIEludmFsaWREYXRhYmFzZVN0YXRlRXJyb3IgZXh0ZW5kcyBUdXRhbm90YUVycm9yIHtcblx0Y29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nKSB7XG5cdFx0c3VwZXIoXCJJbnZhbGlkRGF0YWJhc2VTdGF0ZUVycm9yXCIsIG1lc3NhZ2UpXG5cdH1cbn1cbiIsImltcG9ydCB0eXBlIHsgRGJUcmFuc2FjdGlvbiB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9zZWFyY2gvRGJGYWNhZGUuanNcIlxuaW1wb3J0IHR5cGUgeyAkUHJvbWlzYWJsZSwgRGVmZXJyZWRPYmplY3QsIFByb21pc2VNYXBGbiB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHtcblx0YXJyYXlIYXNoLFxuXHRieXRlTGVuZ3RoLFxuXHRkZWZlcixcblx0ZmluZExhc3RJbmRleCxcblx0Z2V0RnJvbU1hcCxcblx0Z3JvdXBCeUFuZE1hcCxcblx0bGFzdFRocm93LFxuXHRtZXJnZU1hcHMsXG5cdG5ldmVyTnVsbCxcblx0bm9PcCxcblx0UHJvbWlzYWJsZVdyYXBwZXIsXG5cdHByb21pc2VNYXBDb21wYXQsXG5cdHRva2VuaXplLFxuXHRUeXBlUmVmLFxuXHR1aW50OEFycmF5VG9CYXNlNjQsXG59IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHsgZWxlbWVudElkUGFydCwgZmlyc3RCaWdnZXJUaGFuU2Vjb25kLCBnZW5lcmF0ZWRJZFRvVGltZXN0YW1wLCBsaXN0SWRQYXJ0IH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL3V0aWxzL0VudGl0eVV0aWxzLmpzXCJcbmltcG9ydCB7XG5cdGNvbXBhcmVNZXRhRW50cmllc09sZGVzdCxcblx0ZGVjcnlwdEluZGV4S2V5LFxuXHRkZWNyeXB0TWV0YURhdGEsXG5cdGVuY3J5cHRJbmRleEtleUJhc2U2NCxcblx0ZW5jcnlwdEluZGV4S2V5VWludDhBcnJheSxcblx0ZW5jcnlwdE1ldGFEYXRhLFxuXHRlbmNyeXB0U2VhcmNoSW5kZXhFbnRyeSxcblx0Z2V0SWRGcm9tRW5jU2VhcmNoSW5kZXhFbnRyeSxcblx0Z2V0UGVyZm9ybWFuY2VUaW1lc3RhbXAsXG5cdHR5cGVSZWZUb1R5cGVJbmZvLFxufSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvc2VhcmNoL0luZGV4VXRpbHMuanNcIlxuaW1wb3J0IHR5cGUge1xuXHRBdHRyaWJ1dGVIYW5kbGVyLFxuXHRCNjRFbmNJbmRleEtleSxcblx0RGIsXG5cdEVuY0luc3RhbmNlSWRXaXRoVGltZXN0YW1wLFxuXHRFbmNyeXB0ZWRTZWFyY2hJbmRleEVudHJ5LFxuXHRFbmNTZWFyY2hJbmRleEVudHJ5V2l0aFRpbWVzdGFtcCxcblx0RW5jV29yZFRvTWV0YVJvdyxcblx0R3JvdXBEYXRhLFxuXHRJbmRleFVwZGF0ZSxcblx0U2VhcmNoSW5kZXhEYlJvdyxcblx0U2VhcmNoSW5kZXhFbnRyeSxcblx0U2VhcmNoSW5kZXhNZXRhRGF0YURiUm93LFxuXHRTZWFyY2hJbmRleE1ldGFkYXRhRW50cnksXG5cdFNlYXJjaEluZGV4TWV0YURhdGFSb3csXG59IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9zZWFyY2gvU2VhcmNoVHlwZXMuanNcIlxuaW1wb3J0IHR5cGUgeyBRdWV1ZWRCYXRjaCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9FdmVudFF1ZXVlLmpzXCJcbmltcG9ydCB7IEV2ZW50UXVldWUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvRXZlbnRRdWV1ZS5qc1wiXG5pbXBvcnQgeyBDYW5jZWxsZWRFcnJvciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9lcnJvci9DYW5jZWxsZWRFcnJvci5qc1wiXG5pbXBvcnQgeyBQcm9ncmFtbWluZ0Vycm9yIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL2Vycm9yL1Byb2dyYW1taW5nRXJyb3IuanNcIlxuaW1wb3J0IHR5cGUgeyBCcm93c2VyRGF0YSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vbWlzYy9DbGllbnRDb25zdGFudHMuanNcIlxuaW1wb3J0IHsgSW52YWxpZERhdGFiYXNlU3RhdGVFcnJvciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9lcnJvci9JbnZhbGlkRGF0YWJhc2VTdGF0ZUVycm9yLmpzXCJcbmltcG9ydCB7XG5cdGFwcGVuZEJpbmFyeUJsb2Nrcyxcblx0Y2FsY3VsYXRlTmVlZGVkU3BhY2VGb3JOdW1iZXJzLFxuXHRkZWNvZGVOdW1iZXJzLFxuXHRlbmNvZGVOdW1iZXJzLFxuXHRpdGVyYXRlQmluYXJ5QmxvY2tzLFxuXHRyZW1vdmVCaW5hcnlCbG9ja1Jhbmdlcyxcbn0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL3NlYXJjaC9TZWFyY2hJbmRleEVuY29kaW5nLmpzXCJcbmltcG9ydCB0eXBlIHsgRW50aXR5VXBkYXRlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvZW50aXRpZXMvc3lzL1R5cGVSZWZzLmpzXCJcbmltcG9ydCB7IGFlczI1NkVuY3J5cHRTZWFyY2hJbmRleEVudHJ5LCB1bmF1dGhlbnRpY2F0ZWRBZXNEZWNyeXB0IH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS1jcnlwdG9cIlxuaW1wb3J0IHtcblx0RWxlbWVudERhdGFPUyxcblx0R3JvdXBEYXRhT1MsXG5cdE1ldGFEYXRhT1MsXG5cdFNlYXJjaEluZGV4TWV0YURhdGFPUyxcblx0U2VhcmNoSW5kZXhPUyxcblx0U2VhcmNoSW5kZXhXb3Jkc0luZGV4LFxufSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvc2VhcmNoL0luZGV4VGFibGVzLmpzXCJcblxuY29uc3QgU0VBUkNIX0lOREVYX1JPV19MRU5HVEggPSAxMDAwXG5cbi8qKlxuICogT2JqZWN0IHRvIHN0b3JlIHRoZSBjdXJyZW50IGluZGV4ZWREYiB3cml0ZSBvcGVyYXRpb24uIEluIGNhc2Ugb2YgYmFja2dyb3VuZCBtb2RlIG9uIGlPUyB3ZSBoYXZlIHRvIGFib3J0IHRoZSBjdXJyZW50IHdyaXRlXG4gKiBhbmQgcmVzdGFydCB0aGUgd3JpdGUgYWZ0ZXIgYXBwIGdvZXMgdG8gZm9yZWdyb3VuZCBhZ2Fpbi5cbiAqL1xudHlwZSBXcml0ZU9wZXJhdGlvbiA9IHtcblx0dHJhbnNhY3Rpb246IERiVHJhbnNhY3Rpb24gfCBudWxsXG5cdG9wZXJhdGlvbjogKHRyYW5zYWN0aW9uOiBEYlRyYW5zYWN0aW9uKSA9PiBQcm9taXNlPHZvaWQ+XG5cdHRyYW5zYWN0aW9uRmFjdG9yeTogKCkgPT4gUHJvbWlzZTxEYlRyYW5zYWN0aW9uPlxuXHRkZWZlcnJlZDogRGVmZXJyZWRPYmplY3Q8dm9pZD5cblx0aXNBYm9ydGVkRm9yQmFja2dyb3VuZE1vZGU6IGJvb2xlYW5cbn1cblxuLyoqXG4gKiBDbGFzcyB3aGljaCBleGVjdXRlcyBvcGVyYXRpb24gb24gdGhlIGluZGV4aW5nIHRhYmxlcy5cbiAqXG4gKiBTb21lIGZ1bmN0aW9ucyByZXR1cm4gbnVsbCBpbnN0ZWFkIG9mIFByb21pc2UgYmVjYXVzZVxuICogSW5kZXhlZERCIHRyYW5zYWN0aW9uIHVzdWFsbHkgbGl2ZXMgb25seSB0aWxsIHRoZSBlbmRcbiAqIG9mIHRoZSBldmVudCBsb29wIGl0ZXJhdGlvbiBhbmQgcHJvbWlzZSBzY2hlZHVsaW5nXG4gKiBzb21laG93IG1hbmFnZXMgdG8gYnJlYWsgdGhhdCBhbmQgY29tbWl0IHRyYW5zYWN0aW9uXG4gKiB0b28gZWFybHkuXG4gKi9cbmV4cG9ydCBjbGFzcyBJbmRleGVyQ29yZSB7XG5cdHF1ZXVlOiBFdmVudFF1ZXVlXG5cdGRiOiBEYlxuXHRwcml2YXRlIF9pc1N0b3BwZWQ6IGJvb2xlYW5cblx0cHJpdmF0ZSBfcHJvbWlzZU1hcENvbXBhdDogUHJvbWlzZU1hcEZuXG5cdHByaXZhdGUgX25lZWRzRXhwbGljaXRJZHM6IGJvb2xlYW5cblx0cHJpdmF0ZSBfZXhwbGljaXRJZFN0YXJ0OiBudW1iZXJcblx0cHJpdmF0ZSBfY3VycmVudFdyaXRlT3BlcmF0aW9uOiBXcml0ZU9wZXJhdGlvbiB8IG51bGwgPSBudWxsXG5cdF9zdGF0cyE6IHtcblx0XHRpbmRleGluZ1RpbWU6IG51bWJlclxuXHRcdHN0b3JhZ2VUaW1lOiBudW1iZXJcblx0XHRwcmVwYXJpbmdUaW1lOiBudW1iZXJcblx0XHRtYWlsY291bnQ6IG51bWJlclxuXHRcdHN0b3JlZEJ5dGVzOiBudW1iZXJcblx0XHRlbmNyeXB0aW9uVGltZTogbnVtYmVyXG5cdFx0d3JpdGVSZXF1ZXN0czogbnVtYmVyXG5cdFx0bGFyZ2VzdENvbHVtbjogbnVtYmVyXG5cdFx0d29yZHM6IG51bWJlclxuXHRcdGluZGV4ZWRCeXRlczogbnVtYmVyXG5cdH1cblxuXHRjb25zdHJ1Y3RvcihkYjogRGIsIHF1ZXVlOiBFdmVudFF1ZXVlLCBicm93c2VyRGF0YTogQnJvd3NlckRhdGEpIHtcblx0XHR0aGlzLnF1ZXVlID0gcXVldWVcblx0XHR0aGlzLmRiID0gZGJcblx0XHR0aGlzLl9pc1N0b3BwZWQgPSBmYWxzZVxuXHRcdHRoaXMuX3Byb21pc2VNYXBDb21wYXQgPSBwcm9taXNlTWFwQ29tcGF0KGJyb3dzZXJEYXRhLm5lZWRzTWljcm90YXNrSGFjaylcblx0XHR0aGlzLl9uZWVkc0V4cGxpY2l0SWRzID0gYnJvd3NlckRhdGEubmVlZHNFeHBsaWNpdElEQklkc1xuXHRcdHRoaXMuX2V4cGxpY2l0SWRTdGFydCA9IERhdGUubm93KClcblx0XHR0aGlzLnJlc2V0U3RhdHMoKVxuXHR9XG5cblx0LyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBQcmVwYXJpbmcgdGhlIHVwZGF0ZSAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuXHQvKipcblx0ICogQ29udmVydHMgYW4gaW5zdGFuY2VzIGludG8gYSBtYXAgZnJvbSB3b3JkcyB0byBhIGxpc3Qgb2YgU2VhcmNoSW5kZXhFbnRyaWVzLlxuXHQgKi9cblx0Y3JlYXRlSW5kZXhFbnRyaWVzRm9yQXR0cmlidXRlcyhpbnN0YW5jZTogUmVjb3JkPHN0cmluZywgYW55PiwgYXR0cmlidXRlczogQXR0cmlidXRlSGFuZGxlcltdKTogTWFwPHN0cmluZywgU2VhcmNoSW5kZXhFbnRyeVtdPiB7XG5cdFx0bGV0IGluZGV4RW50cmllczogTWFwPHN0cmluZywgU2VhcmNoSW5kZXhFbnRyeT5bXSA9IGF0dHJpYnV0ZXMubWFwKChhdHRyaWJ1dGVIYW5kbGVyKSA9PiB7XG5cdFx0XHRpZiAodHlwZW9mIGF0dHJpYnV0ZUhhbmRsZXIudmFsdWUgIT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHR0aHJvdyBuZXcgUHJvZ3JhbW1pbmdFcnJvcihcIlZhbHVlIGZvciBhdHRyaWJ1dGVIYW5kbGVyIGlzIG5vdCBhIGZ1bmN0aW9uOiBcIiArIEpTT04uc3RyaW5naWZ5KGF0dHJpYnV0ZUhhbmRsZXIuYXR0cmlidXRlKSlcblx0XHRcdH1cblxuXHRcdFx0bGV0IHZhbHVlID0gYXR0cmlidXRlSGFuZGxlci52YWx1ZSgpXG5cdFx0XHRsZXQgdG9rZW5zID0gdG9rZW5pemUodmFsdWUpXG5cdFx0XHR0aGlzLl9zdGF0cy5pbmRleGVkQnl0ZXMgKz0gYnl0ZUxlbmd0aCh2YWx1ZSlcblx0XHRcdGxldCBhdHRyaWJ1dGVLZXlUb0luZGV4TWFwOiBNYXA8c3RyaW5nLCBTZWFyY2hJbmRleEVudHJ5PiA9IG5ldyBNYXAoKVxuXG5cdFx0XHRmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdG9rZW5zLmxlbmd0aDsgaW5kZXgrKykge1xuXHRcdFx0XHRsZXQgdG9rZW4gPSB0b2tlbnNbaW5kZXhdXG5cblx0XHRcdFx0aWYgKCFhdHRyaWJ1dGVLZXlUb0luZGV4TWFwLmhhcyh0b2tlbikpIHtcblx0XHRcdFx0XHRhdHRyaWJ1dGVLZXlUb0luZGV4TWFwLnNldCh0b2tlbiwge1xuXHRcdFx0XHRcdFx0aWQ6IGluc3RhbmNlLl9pZCBpbnN0YW5jZW9mIEFycmF5ID8gaW5zdGFuY2UuX2lkWzFdIDogaW5zdGFuY2UuX2lkLFxuXHRcdFx0XHRcdFx0YXR0cmlidXRlOiBhdHRyaWJ1dGVIYW5kbGVyLmF0dHJpYnV0ZS5pZCxcblx0XHRcdFx0XHRcdHBvc2l0aW9uczogW2luZGV4XSxcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG5ldmVyTnVsbChhdHRyaWJ1dGVLZXlUb0luZGV4TWFwLmdldCh0b2tlbikpLnBvc2l0aW9ucy5wdXNoKGluZGV4KVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBhdHRyaWJ1dGVLZXlUb0luZGV4TWFwXG5cdFx0fSlcblx0XHRyZXR1cm4gbWVyZ2VNYXBzKGluZGV4RW50cmllcylcblx0fVxuXG5cdC8qKlxuXHQgKiBFbmNyeXB0IHNlYXJjaCBpbmRleCBlbnRyaWVzIGNyZWF0ZWQgYnkge0BsaW5rIGNyZWF0ZUluZGV4RW50cmllc0ZvckF0dHJpYnV0ZXN9IGFuZCBwdXQgdGhlbSBpbnRvIHRoZSB7QHBhcmFtIGluZGV4VXBkYXRlfS5cblx0ICogQHBhcmFtIGlkIG9mIHRoZSBpbnN0YW5jZVxuXHQgKiBAcGFyYW0gb3duZXJHcm91cCBvZiB0aGUgaW5zdGFuY2Vcblx0ICogQHBhcmFtIGtleVRvSW5kZXhFbnRyaWVzIG1hcCBmcm9tIHNlYXJjaCBpbmRleCBrZXlzICh3b3JkcyB3aGljaCB5b3UgY2FuIHNlYXJjaCBmb3IpIHRvIGluZGV4IGVudHJpZXNcblx0ICogQHBhcmFtIGluZGV4VXBkYXRlIEluZGV4VXBkYXRlIGZvciB3aGljaCB7QGNvZGUgY3JlYXRlfSBmaWVsZHMgd2lsbCBiZSBwb3B1bGF0ZWRcblx0ICovXG5cdGVuY3J5cHRTZWFyY2hJbmRleEVudHJpZXMoaWQ6IElkVHVwbGUsIG93bmVyR3JvdXA6IElkLCBrZXlUb0luZGV4RW50cmllczogTWFwPHN0cmluZywgU2VhcmNoSW5kZXhFbnRyeVtdPiwgaW5kZXhVcGRhdGU6IEluZGV4VXBkYXRlKTogdm9pZCB7XG5cdFx0Y29uc3QgZW5jcnlwdGlvblRpbWVTdGFydCA9IGdldFBlcmZvcm1hbmNlVGltZXN0YW1wKClcblx0XHRjb25zdCBsaXN0SWQgPSBsaXN0SWRQYXJ0KGlkKVxuXHRcdGNvbnN0IGVuY0luc3RhbmNlSWQgPSBlbmNyeXB0SW5kZXhLZXlVaW50OEFycmF5KHRoaXMuZGIua2V5LCBlbGVtZW50SWRQYXJ0KGlkKSwgdGhpcy5kYi5pdilcblx0XHRjb25zdCBlbmNJbnN0YW5jZUlkQjY0ID0gdWludDhBcnJheVRvQmFzZTY0KGVuY0luc3RhbmNlSWQpXG5cdFx0Y29uc3QgZWxlbWVudElkVGltZXN0YW1wID0gZ2VuZXJhdGVkSWRUb1RpbWVzdGFtcChlbGVtZW50SWRQYXJ0KGlkKSlcblx0XHRjb25zdCBlbmNXb3Jkc0I2NDogc3RyaW5nW10gPSBbXVxuXHRcdGZvciAoY29uc3QgW2luZGV4S2V5LCB2YWx1ZV0gb2Yga2V5VG9JbmRleEVudHJpZXMuZW50cmllcygpKSB7XG5cdFx0XHRjb25zdCBlbmNXb3JkQjY0ID0gZW5jcnlwdEluZGV4S2V5QmFzZTY0KHRoaXMuZGIua2V5LCBpbmRleEtleSwgdGhpcy5kYi5pdilcblx0XHRcdGVuY1dvcmRzQjY0LnB1c2goZW5jV29yZEI2NClcblx0XHRcdGNvbnN0IGVuY0luZGV4RW50cmllcyA9IGdldEZyb21NYXAoaW5kZXhVcGRhdGUuY3JlYXRlLmluZGV4TWFwLCBlbmNXb3JkQjY0LCAoKSA9PiBbXSlcblx0XHRcdGZvciAoY29uc3QgaW5kZXhFbnRyeSBvZiB2YWx1ZSlcblx0XHRcdFx0ZW5jSW5kZXhFbnRyaWVzLnB1c2goe1xuXHRcdFx0XHRcdGVudHJ5OiBlbmNyeXB0U2VhcmNoSW5kZXhFbnRyeSh0aGlzLmRiLmtleSwgaW5kZXhFbnRyeSwgZW5jSW5zdGFuY2VJZCksXG5cdFx0XHRcdFx0dGltZXN0YW1wOiBlbGVtZW50SWRUaW1lc3RhbXAsXG5cdFx0XHRcdH0pXG5cdFx0fVxuXHRcdGluZGV4VXBkYXRlLmNyZWF0ZS5lbmNJbnN0YW5jZUlkVG9FbGVtZW50RGF0YS5zZXQoZW5jSW5zdGFuY2VJZEI2NCwge1xuXHRcdFx0bGlzdElkLFxuXHRcdFx0ZW5jV29yZHNCNjQsXG5cdFx0XHRvd25lckdyb3VwLFxuXHRcdH0pXG5cdFx0dGhpcy5fc3RhdHMuZW5jcnlwdGlvblRpbWUgKz0gZ2V0UGVyZm9ybWFuY2VUaW1lc3RhbXAoKSAtIGVuY3J5cHRpb25UaW1lU3RhcnRcblx0fVxuXG5cdC8qKlxuXHQgKiBQcm9jZXNzIGRlbGV0ZSBldmVudCBiZWZvcmUgYXBwbHlpbmcgdG8gdGhlIGluZGV4LlxuXHQgKi9cblx0YXN5bmMgX3Byb2Nlc3NEZWxldGVkKGV2ZW50OiBFbnRpdHlVcGRhdGUsIGluZGV4VXBkYXRlOiBJbmRleFVwZGF0ZSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IGVuY0luc3RhbmNlSWRQbGFpbiA9IGVuY3J5cHRJbmRleEtleVVpbnQ4QXJyYXkodGhpcy5kYi5rZXksIGV2ZW50Lmluc3RhbmNlSWQsIHRoaXMuZGIuaXYpXG5cdFx0Y29uc3QgZW5jSW5zdGFuY2VJZEI2NCA9IHVpbnQ4QXJyYXlUb0Jhc2U2NChlbmNJbnN0YW5jZUlkUGxhaW4pXG5cdFx0Y29uc3QgeyBhcHBJZCwgdHlwZUlkIH0gPSB0eXBlUmVmVG9UeXBlSW5mbyhuZXcgVHlwZVJlZihldmVudC5hcHBsaWNhdGlvbiwgZXZlbnQudHlwZSkpXG5cdFx0Y29uc3QgdHJhbnNhY3Rpb24gPSBhd2FpdCB0aGlzLmRiLmRiRmFjYWRlLmNyZWF0ZVRyYW5zYWN0aW9uKHRydWUsIFtFbGVtZW50RGF0YU9TXSlcblx0XHRjb25zdCBlbGVtZW50RGF0YSA9IGF3YWl0IHRyYW5zYWN0aW9uLmdldChFbGVtZW50RGF0YU9TLCBlbmNJbnN0YW5jZUlkQjY0KVxuXHRcdGlmICghZWxlbWVudERhdGEpIHtcblx0XHRcdHJldHVyblxuXHRcdH1cblxuXHRcdC8vIFdlIG5lZWQgdG8gZmluZCBTZWFyY2hJbmRleCByb3dzIHdoaWNoIHdlIHdhbnQgdG8gdXBkYXRlLiBJbiB0aGUgRWxlbWVudERhdGEgd2UgaGF2ZSByZWZlcmVuY2VzIHRvIHRoZSBtZXRhZGF0YSBhbmQgd2UgY2FuIGZpbmRcblx0XHQvLyBjb3JyZXNwb25kaW5nIFNlYXJjaEluZGV4IHJvdyBpbiBpdC5cblx0XHRjb25zdCBtZXRhRGF0YVJvd0tleXNCaW5hcnkgPSB1bmF1dGhlbnRpY2F0ZWRBZXNEZWNyeXB0KHRoaXMuZGIua2V5LCBlbGVtZW50RGF0YVsxXSwgdHJ1ZSlcblx0XHQvLyBGb3IgZXZlcnkgd29yZCB3ZSBoYXZlIGEgbWV0YWRhdGEgcmVmZXJlbmNlIGFuZCB3ZSB3YW50IHRvIHVwZGF0ZSB0aGVtIGFsbC5cblx0XHRjb25zdCBtZXRhRGF0YVJvd0tleXMgPSBkZWNvZGVOdW1iZXJzKG1ldGFEYXRhUm93S2V5c0JpbmFyeSlcblx0XHRmb3IgKGNvbnN0IG1ldGFEYXRhUm93S2V5IG9mIG1ldGFEYXRhUm93S2V5cykge1xuXHRcdFx0Ly8gV2UgYWRkIGN1cnJlbnQgaW5zdGFuY2UgaW50byBsaXN0IG9mIGluc3RhbmNlcyB0byBkZWxldGUgZm9yIGVhY2ggd29yZFxuXHRcdFx0Y29uc3QgaWRzID0gZ2V0RnJvbU1hcChpbmRleFVwZGF0ZS5kZWxldGUuc2VhcmNoTWV0YVJvd1RvRW5jSW5zdGFuY2VJZHMsIG1ldGFEYXRhUm93S2V5LCAoKSA9PiBbXSlcblx0XHRcdGlkcy5wdXNoKHtcblx0XHRcdFx0ZW5jSW5zdGFuY2VJZDogZW5jSW5zdGFuY2VJZFBsYWluLFxuXHRcdFx0XHRhcHBJZCxcblx0XHRcdFx0dHlwZUlkLFxuXHRcdFx0XHR0aW1lc3RhbXA6IGdlbmVyYXRlZElkVG9UaW1lc3RhbXAoZXZlbnQuaW5zdGFuY2VJZCksXG5cdFx0XHR9KVxuXHRcdH1cblx0XHRpbmRleFVwZGF0ZS5kZWxldGUuZW5jSW5zdGFuY2VJZHMucHVzaChlbmNJbnN0YW5jZUlkQjY0KVxuXHR9XG5cblx0LyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBNYW5pcHVsYXRpbmcgdGhlIHN0YXRlICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXHRzdG9wUHJvY2Vzc2luZygpIHtcblx0XHR0aGlzLl9pc1N0b3BwZWQgPSB0cnVlXG5cdFx0dGhpcy5xdWV1ZS5jbGVhcigpXG5cdH1cblxuXHRpc1N0b3BwZWRQcm9jZXNzaW5nKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLl9pc1N0b3BwZWRcblx0fVxuXG5cdHN0YXJ0UHJvY2Vzc2luZygpIHtcblx0XHR0aGlzLl9pc1N0b3BwZWQgPSBmYWxzZVxuXHR9XG5cblx0YWRkQmF0Y2hlc1RvUXVldWUoYmF0Y2hlczogUXVldWVkQmF0Y2hbXSk6IHZvaWQge1xuXHRcdGlmICghdGhpcy5faXNTdG9wcGVkKSB7XG5cdFx0XHR0aGlzLnF1ZXVlLmFkZEJhdGNoZXMoYmF0Y2hlcylcblx0XHR9XG5cdH1cblxuXHQvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogV3JpdGluZyBpbmRleCB1cGRhdGUgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblx0LyoqXG5cdCAqIEFwcGx5IHBvcHVsYXRlZCB7QHBhcmFtIGluZGV4VXBkYXRlfSB0byB0aGUgZGF0YWJhc2UuXG5cdCAqL1xuXHR3cml0ZUluZGV4VXBkYXRlKFxuXHRcdGRhdGFQZXJHcm91cDogQXJyYXk8e1xuXHRcdFx0Z3JvdXBJZDogSWRcblx0XHRcdGluZGV4VGltZXN0YW1wOiBudW1iZXJcblx0XHR9Pixcblx0XHRpbmRleFVwZGF0ZTogSW5kZXhVcGRhdGUsXG5cdCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHJldHVybiB0aGlzLl93cml0ZUluZGV4VXBkYXRlKGluZGV4VXBkYXRlLCAodCkgPT4gdGhpcy5fdXBkYXRlR3JvdXBEYXRhSW5kZXhUaW1lc3RhbXAoZGF0YVBlckdyb3VwLCB0KSlcblx0fVxuXG5cdHdyaXRlSW5kZXhVcGRhdGVXaXRoQmF0Y2hJZChncm91cElkOiBJZCwgYmF0Y2hJZDogSWQsIGluZGV4VXBkYXRlOiBJbmRleFVwZGF0ZSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHJldHVybiB0aGlzLl93cml0ZUluZGV4VXBkYXRlKGluZGV4VXBkYXRlLCAodCkgPT4gdGhpcy5fdXBkYXRlR3JvdXBEYXRhQmF0Y2hJZChncm91cElkLCBiYXRjaElkLCB0KSlcblx0fVxuXG5cdF93cml0ZUluZGV4VXBkYXRlKGluZGV4VXBkYXRlOiBJbmRleFVwZGF0ZSwgdXBkYXRlR3JvdXBEYXRhOiAodDogRGJUcmFuc2FjdGlvbikgPT4gJFByb21pc2FibGU8dm9pZD4pOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRyZXR1cm4gdGhpcy5fZXhlY3V0ZU9wZXJhdGlvbih7XG5cdFx0XHR0cmFuc2FjdGlvbjogbnVsbCxcblx0XHRcdHRyYW5zYWN0aW9uRmFjdG9yeTogKCkgPT4gdGhpcy5kYi5kYkZhY2FkZS5jcmVhdGVUcmFuc2FjdGlvbihmYWxzZSwgW1NlYXJjaEluZGV4T1MsIFNlYXJjaEluZGV4TWV0YURhdGFPUywgRWxlbWVudERhdGFPUywgTWV0YURhdGFPUywgR3JvdXBEYXRhT1NdKSxcblx0XHRcdG9wZXJhdGlvbjogKHRyYW5zYWN0aW9uKSA9PiB7XG5cdFx0XHRcdGxldCBzdGFydFRpbWVTdG9yYWdlID0gZ2V0UGVyZm9ybWFuY2VUaW1lc3RhbXAoKVxuXG5cdFx0XHRcdGlmICh0aGlzLl9pc1N0b3BwZWQpIHtcblx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IENhbmNlbGxlZEVycm9yKFwibWFpbCBpbmRleGluZyBjYW5jZWxsZWRcIikpXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRcdHRoaXMuX21vdmVJbmRleGVkSW5zdGFuY2UoaW5kZXhVcGRhdGUsIHRyYW5zYWN0aW9uKVxuXHRcdFx0XHRcdFx0LnRoZW5PckFwcGx5KCgpID0+IHRoaXMuX2RlbGV0ZUluZGV4ZWRJbnN0YW5jZShpbmRleFVwZGF0ZSwgdHJhbnNhY3Rpb24pKVxuXHRcdFx0XHRcdFx0LnRoZW5PckFwcGx5KCgpID0+IHRoaXMuX2luc2VydE5ld0luZGV4RW50cmllcyhpbmRleFVwZGF0ZSwgdHJhbnNhY3Rpb24pKVxuXHRcdFx0XHRcdFx0LnRoZW5PckFwcGx5KChyb3dLZXlzOiBFbmNXb3JkVG9NZXRhUm93IHwgbnVsbCkgPT4gcm93S2V5cyAmJiB0aGlzLl9pbnNlcnROZXdFbGVtZW50RGF0YShpbmRleFVwZGF0ZSwgdHJhbnNhY3Rpb24sIHJvd0tleXMpKVxuXHRcdFx0XHRcdFx0LnRoZW5PckFwcGx5KCgpID0+IHVwZGF0ZUdyb3VwRGF0YSh0cmFuc2FjdGlvbikpXG5cdFx0XHRcdFx0XHQudGhlbk9yQXBwbHkoKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gdHJhbnNhY3Rpb24ud2FpdCgpLnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdHRoaXMuX3N0YXRzLnN0b3JhZ2VUaW1lICs9IGdldFBlcmZvcm1hbmNlVGltZXN0YW1wKCkgLSBzdGFydFRpbWVTdG9yYWdlXG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHR9KSAvLyBhIGxhIGNhdGNoKCkuIE11c3QgYmUgZG9uZSBpbiB0aGUgbmV4dCBzdGVwIGJlY2F1c2UgZGlkUmVqZWN0IGlzIG5vdCBpbnZva2VkIGZvciB0aGUgY3VycmVudCBQcm9taXNlLCBvbmx5IGZvciB0aGUgcHJldmlvdXMgb25lLlxuXHRcdFx0XHRcdFx0Ly8gSXQncyBwcm9iYWJseSBhIGJhZCBpZGVhIHRvIGNvbnZlcnQgdG8gdGhlIFByb21pc2UgZmlyc3QgYW5kIHRoZW4gY2F0Y2ggYmVjYXVzZSBpdCBtYXkgZG8gUHJvbWlzZS5yZXNvbHZlKCkgYW5kIHRoaXMgd2lsbCBzY2hlZHVsZSB0b1xuXHRcdFx0XHRcdFx0Ly8gdGhlIG5leHQgZXZlbnQgbG9vcCBpdGVyYXRpb24gYW5kIHRoZSBjb250ZXh0IHdpbGwgYmUgY2xvc2VkIGFuZCBpdCB3aWxsIGJlIHRvbyBsYXRlIHRvIGFib3J0KCkuIEV2ZW4gd29yc2UsIGl0IHdpbGwgYmUgY29tbWl0ZWQgdG9cblx0XHRcdFx0XHRcdC8vIEluZGV4ZWREQiBhbHJlYWR5IGFuZCBpdCB3aWxsIGJlIGluY29uc2lzdGVudCAob29wcykuXG5cdFx0XHRcdFx0XHQudGhlbk9yQXBwbHkobm9PcCwgKGUpID0+IHtcblx0XHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0XHRpZiAoIXRyYW5zYWN0aW9uLmFib3J0ZWQpIHRyYW5zYWN0aW9uLmFib3J0KClcblx0XHRcdFx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUud2FybihcImFib3J0IGhhcyBmYWlsZWQ6IFwiLCBlKSAvLyBJZ25vcmUgaWYgYWJvcnQgaGFzIGZhaWxlZFxuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0dGhyb3cgZVxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdC50b1Byb21pc2UoKVxuXHRcdFx0XHQpXG5cdFx0XHR9LFxuXHRcdFx0ZGVmZXJyZWQ6IGRlZmVyKCksXG5cdFx0XHRpc0Fib3J0ZWRGb3JCYWNrZ3JvdW5kTW9kZTogZmFsc2UsXG5cdFx0fSlcblx0fVxuXG5cdF9leGVjdXRlT3BlcmF0aW9uKG9wZXJhdGlvbjogV3JpdGVPcGVyYXRpb24pOiBQcm9taXNlPHZvaWQ+IHtcblx0XHR0aGlzLl9jdXJyZW50V3JpdGVPcGVyYXRpb24gPSBvcGVyYXRpb25cblx0XHRyZXR1cm4gb3BlcmF0aW9uLnRyYW5zYWN0aW9uRmFjdG9yeSgpLnRoZW4oKHRyYW5zYWN0aW9uKSA9PiB7XG5cdFx0XHRvcGVyYXRpb24udHJhbnNhY3Rpb24gPSB0cmFuc2FjdGlvblxuXHRcdFx0b3BlcmF0aW9uXG5cdFx0XHRcdC5vcGVyYXRpb24odHJhbnNhY3Rpb24pXG5cdFx0XHRcdC50aGVuKChpdCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMuX2N1cnJlbnRXcml0ZU9wZXJhdGlvbiA9IG51bGxcblx0XHRcdFx0XHRvcGVyYXRpb24uZGVmZXJyZWQucmVzb2x2ZSgpXG5cdFx0XHRcdFx0cmV0dXJuIGl0XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaCgoZSkgPT4ge1xuXHRcdFx0XHRcdGlmIChvcGVyYXRpb24uaXNBYm9ydGVkRm9yQmFja2dyb3VuZE1vZGUpIHtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKFwidHJhbnNhY3Rpb24gaGFzIGJlZW4gYWJvcnRlZCBiZWNhdXNlIG9mIGJhY2tncm91bmQgbW9kZVwiKVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRpZiAoZW52Lm1vZGUgIT09IFwiVGVzdFwiKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKFwicmVqZWN0aW5nIG9wZXJhdGlvbiB3aXRoIGVycm9yXCIsIGUpXG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdG9wZXJhdGlvbi5kZWZlcnJlZC5yZWplY3QoZSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHRyZXR1cm4gb3BlcmF0aW9uLmRlZmVycmVkLnByb21pc2Vcblx0XHR9KVxuXHR9XG5cblx0b25WaXNpYmlsaXR5Q2hhbmdlZCh2aXNpYmxlOiBib29sZWFuKSB7XG5cdFx0Y29uc3Qgb3BlcmF0aW9uID0gdGhpcy5fY3VycmVudFdyaXRlT3BlcmF0aW9uXG5cblx0XHRpZiAoIXZpc2libGUgJiYgb3BlcmF0aW9uICYmIG9wZXJhdGlvbi50cmFuc2FjdGlvbikge1xuXHRcdFx0Y29uc29sZS5sb2coXCJhYm9ydCBpbmRleGVkRGIgdHJhbnNhY3Rpb24gb3BlcmF0aW9uIGJlY2F1c2UgYmFja2dyb3VuZCBtb2RlXCIpXG5cblx0XHRcdHRyeSB7XG5cdFx0XHRcdG5ldmVyTnVsbChvcGVyYXRpb24udHJhbnNhY3Rpb24pLmFib3J0KClcblx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coXCJFcnJvciB3aGVuIGFib3J0aW5nIG9uIHZpc2liaWxpdHkgY2hhbmdlXCIsIGUpXG5cdFx0XHR9XG5cblx0XHRcdG9wZXJhdGlvbi5pc0Fib3J0ZWRGb3JCYWNrZ3JvdW5kTW9kZSA9IHRydWVcblx0XHR9XG5cblx0XHRpZiAodmlzaWJsZSAmJiBvcGVyYXRpb24pIHtcblx0XHRcdGNvbnNvbGUubG9nKFwicmVzdGFydCBpbmRleGVkRGIgdHJhbnNhY3Rpb24gb3BlcmF0aW9uIGFmdGVyIGJhY2tncm91bmQgbW9kZVwiKVxuXHRcdFx0b3BlcmF0aW9uLmlzQWJvcnRlZEZvckJhY2tncm91bmRNb2RlID0gZmFsc2VcblxuXHRcdFx0dGhpcy5fZXhlY3V0ZU9wZXJhdGlvbihvcGVyYXRpb24pXG5cdFx0fVxuXHR9XG5cblx0X21vdmVJbmRleGVkSW5zdGFuY2UoaW5kZXhVcGRhdGU6IEluZGV4VXBkYXRlLCB0cmFuc2FjdGlvbjogRGJUcmFuc2FjdGlvbik6IFByb21pc2FibGVXcmFwcGVyPHZvaWQ+IHtcblx0XHR0aGlzLl9jYW5jZWxJZk5lZWRlZCgpXG5cblx0XHRpZiAoaW5kZXhVcGRhdGUubW92ZS5sZW5ndGggPT09IDApIHJldHVybiBQcm9taXNhYmxlV3JhcHBlci5mcm9tKHVuZGVmaW5lZCkgLy8ga2VlcCB0cmFuc2FjdGlvbiBjb250ZXh0IG9wZW4gKG9ubHkgZm9yIFNhZmFyaSlcblxuXHRcdGNvbnN0IHByb21pc2UgPSBQcm9taXNlLmFsbChcblx0XHRcdGluZGV4VXBkYXRlLm1vdmUubWFwKChtb3ZlSW5zdGFuY2UpID0+IHtcblx0XHRcdFx0cmV0dXJuIHRyYW5zYWN0aW9uLmdldChFbGVtZW50RGF0YU9TLCBtb3ZlSW5zdGFuY2UuZW5jSW5zdGFuY2VJZCkudGhlbigoZWxlbWVudERhdGEpID0+IHtcblx0XHRcdFx0XHRpZiAoZWxlbWVudERhdGEpIHtcblx0XHRcdFx0XHRcdGVsZW1lbnREYXRhWzBdID0gbW92ZUluc3RhbmNlLm5ld0xpc3RJZFxuXHRcdFx0XHRcdFx0dHJhbnNhY3Rpb24ucHV0KEVsZW1lbnREYXRhT1MsIG1vdmVJbnN0YW5jZS5lbmNJbnN0YW5jZUlkLCBlbGVtZW50RGF0YSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHR9KSxcblx0XHQpLnRoZW4obm9PcClcblx0XHRyZXR1cm4gUHJvbWlzYWJsZVdyYXBwZXIuZnJvbShwcm9taXNlKVxuXHR9XG5cblx0LyoqXG5cdCAqIEFwcGx5IFwiZGVsZXRlXCIgdXBkYXRlcyB0byB0aGUgZGF0YWJhc2Vcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9kZWxldGVJbmRleGVkSW5zdGFuY2UoaW5kZXhVcGRhdGU6IEluZGV4VXBkYXRlLCB0cmFuc2FjdGlvbjogRGJUcmFuc2FjdGlvbik6IFByb21pc2U8dm9pZD4gfCBudWxsIHtcblx0XHR0aGlzLl9jYW5jZWxJZk5lZWRlZCgpXG5cblx0XHRpZiAoaW5kZXhVcGRhdGUuZGVsZXRlLnNlYXJjaE1ldGFSb3dUb0VuY0luc3RhbmNlSWRzLnNpemUgPT09IDApIHJldHVybiBudWxsIC8vIGtlZXAgdHJhbnNhY3Rpb24gY29udGV4dCBvcGVuXG5cblx0XHRsZXQgZGVsZXRlRWxlbWVudERhdGFQcm9taXNlID0gUHJvbWlzZS5hbGwoaW5kZXhVcGRhdGUuZGVsZXRlLmVuY0luc3RhbmNlSWRzLm1hcCgoZW5jSW5zdGFuY2VJZCkgPT4gdHJhbnNhY3Rpb24uZGVsZXRlKEVsZW1lbnREYXRhT1MsIGVuY0luc3RhbmNlSWQpKSlcblx0XHQvLyBGb3IgZWFjaCB3b3JkIHdlIGhhdmUgbGlzdCBvZiBpbnN0YW5jZXMgd2Ugd2FudCB0byByZW1vdmVcblx0XHRyZXR1cm4gUHJvbWlzZS5hbGwoXG5cdFx0XHRBcnJheS5mcm9tKGluZGV4VXBkYXRlLmRlbGV0ZS5zZWFyY2hNZXRhUm93VG9FbmNJbnN0YW5jZUlkcykubWFwKChbbWV0YVJvd0tleSwgZW5jSW5zdGFuY2VJZHNdKSA9PlxuXHRcdFx0XHR0aGlzLl9kZWxldGVTZWFyY2hJbmRleEVudHJpZXModHJhbnNhY3Rpb24sIG1ldGFSb3dLZXksIGVuY0luc3RhbmNlSWRzKSxcblx0XHRcdCksXG5cdFx0KVxuXHRcdFx0LnRoZW4oKCkgPT4gZGVsZXRlRWxlbWVudERhdGFQcm9taXNlKVxuXHRcdFx0LnRoZW4obm9PcClcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmUgYWxsIHtAcGFyYW0gaW5zdGFuY2VJbmZvc30gZnJvbSB0aGUgU2VhcmNoSW5kZXggZW50cmllcyBhbmQgbWV0YWRhdGEgZW50cmVpcyBzcGVjaWZpZWQgYnkgdGhlIHtAcGFyYW0gbWV0YVJvd0tleX0uXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfZGVsZXRlU2VhcmNoSW5kZXhFbnRyaWVzKHRyYW5zYWN0aW9uOiBEYlRyYW5zYWN0aW9uLCBtZXRhUm93S2V5OiBudW1iZXIsIGluc3RhbmNlSW5mb3M6IEVuY0luc3RhbmNlSWRXaXRoVGltZXN0YW1wW10pOiBQcm9taXNlPGFueT4ge1xuXHRcdHRoaXMuX2NhbmNlbElmTmVlZGVkKClcblxuXHRcdC8vIENvbGxlY3QgaGFzaGVzIG9mIGFsbCBpbnN0YW5jZXMgd2Ugd2FudCB0byBkZWxldGUgdG8gY2hlY2sgaXQgZmFzdGVyIGxhdGVyXG5cdFx0Y29uc3QgZW5jSW5zdGFuY2VJZFNldCA9IG5ldyBTZXQoaW5zdGFuY2VJbmZvcy5tYXAoKGUpID0+IGFycmF5SGFzaChlLmVuY0luc3RhbmNlSWQpKSlcblx0XHRyZXR1cm4gdHJhbnNhY3Rpb24uZ2V0KFNlYXJjaEluZGV4TWV0YURhdGFPUywgbWV0YVJvd0tleSkudGhlbigoZW5jTWV0YURhdGFSb3cpID0+IHtcblx0XHRcdGlmICghZW5jTWV0YURhdGFSb3cpIHtcblx0XHRcdFx0Ly8gYWxyZWFkeSBkZWxldGVkXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBtZXRhRGF0YVJvdyA9IGRlY3J5cHRNZXRhRGF0YSh0aGlzLmRiLmtleSwgZW5jTWV0YURhdGFSb3cpXG5cdFx0XHQvLyBhZGQgbWV0YSBkYXRhIHRvIHNldCB0byBvbmx5IHVwZGF0ZSBtZXRhIGRhdGEgb25jZSB3aGVuIGRlbGV0aW5nIG11bHRpcGxlIGluc3RhbmNlc1xuXHRcdFx0Y29uc3QgbWV0YURhdGFFbnRyaWVzU2V0ID0gbmV3IFNldCgpIGFzIFNldDxTZWFyY2hJbmRleE1ldGFkYXRhRW50cnk+XG5cdFx0XHRmb3IgKGNvbnN0IGluZm8gb2YgaW5zdGFuY2VJbmZvcykge1xuXHRcdFx0XHQvLyBGb3IgZWFjaCBpbnN0YW5jZSB3ZSBmaW5kIFNlYXJjaEluZGV4IHJvdyBpdCBiZWxvbmdzIHRvIGJ5IHRpbWVzdGFtcFxuXHRcdFx0XHRjb25zdCBlbnRyeUluZGV4ID0gdGhpcy5fZmluZE1ldGFEYXRhRW50cnlCeVRpbWVzdGFtcChtZXRhRGF0YVJvdywgaW5mby50aW1lc3RhbXAsIGluZm8uYXBwSWQsIGluZm8udHlwZUlkKVxuXG5cdFx0XHRcdGlmIChlbnRyeUluZGV4ID09PSAtMSkge1xuXHRcdFx0XHRcdGNvbnNvbGUud2Fybihcblx0XHRcdFx0XHRcdFwiY291bGQgbm90IGZpbmQgTWV0YURhdGFFbnRyeSwgaW5mbzpcIixcblx0XHRcdFx0XHRcdGluZm8sXG5cdFx0XHRcdFx0XHRcInJvd3M6IFwiLFxuXHRcdFx0XHRcdFx0bWV0YURhdGFSb3cucm93cy5tYXAoKHIpID0+IEpTT04uc3RyaW5naWZ5KHIpKSxcblx0XHRcdFx0XHQpXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bWV0YURhdGFFbnRyaWVzU2V0LmFkZChtZXRhRGF0YVJvdy5yb3dzW2VudHJ5SW5kZXhdKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIEZvciBlYWNoIFNlYXJjaEluZGV4IHJvdyB3ZSBuZWVkIHRvIHVwZGF0ZS4uLlxuXHRcdFx0Y29uc3QgdXBkYXRlU2VhcmNoSW5kZXggPSB0aGlzLl9wcm9taXNlTWFwQ29tcGF0KEFycmF5LmZyb20obWV0YURhdGFFbnRyaWVzU2V0KSwgKG1ldGFFbnRyeSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gdHJhbnNhY3Rpb24uZ2V0KFNlYXJjaEluZGV4T1MsIG1ldGFFbnRyeS5rZXkpLnRoZW4oKGluZGV4RW50cmllc1JvdykgPT4ge1xuXHRcdFx0XHRcdGlmICghaW5kZXhFbnRyaWVzUm93KSByZXR1cm5cblx0XHRcdFx0XHQvLyBGaW5kIGFsbCBlbnRyaWVzIHdlIG5lZWQgdG8gcmVtb3ZlIGJ5IGhhc2ggb2YgdGhlIGVuY3J5cHRlZCBJRFxuXHRcdFx0XHRcdGNvbnN0IHJhbmdlc1RvUmVtb3ZlOiBBcnJheTxbbnVtYmVyLCBudW1iZXJdPiA9IFtdXG5cdFx0XHRcdFx0aXRlcmF0ZUJpbmFyeUJsb2NrcyhpbmRleEVudHJpZXNSb3csIChibG9jaywgc3RhcnQsIGVuZCkgPT4ge1xuXHRcdFx0XHRcdFx0aWYgKGVuY0luc3RhbmNlSWRTZXQuaGFzKGFycmF5SGFzaChnZXRJZEZyb21FbmNTZWFyY2hJbmRleEVudHJ5KGJsb2NrKSkpKSB7XG5cdFx0XHRcdFx0XHRcdHJhbmdlc1RvUmVtb3ZlLnB1c2goW3N0YXJ0LCBlbmRdKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pXG5cblx0XHRcdFx0XHRpZiAocmFuZ2VzVG9SZW1vdmUubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm5cblx0XHRcdFx0XHR9IGVsc2UgaWYgKG1ldGFFbnRyeS5zaXplID09PSByYW5nZXNUb1JlbW92ZS5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdG1ldGFFbnRyeS5zaXplID0gMFxuXHRcdFx0XHRcdFx0cmV0dXJuIHRyYW5zYWN0aW9uLmRlbGV0ZShTZWFyY2hJbmRleE9TLCBtZXRhRW50cnkua2V5KVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRjb25zdCB0cmltbWVkID0gcmVtb3ZlQmluYXJ5QmxvY2tSYW5nZXMoaW5kZXhFbnRyaWVzUm93LCByYW5nZXNUb1JlbW92ZSlcblx0XHRcdFx0XHRcdG1ldGFFbnRyeS5zaXplIC09IHJhbmdlc1RvUmVtb3ZlLmxlbmd0aFxuXHRcdFx0XHRcdFx0cmV0dXJuIHRyYW5zYWN0aW9uLnB1dChTZWFyY2hJbmRleE9TLCBtZXRhRW50cnkua2V5LCB0cmltbWVkKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSlcblx0XHRcdH0pXG5cblx0XHRcdHJldHVybiB1cGRhdGVTZWFyY2hJbmRleC50aGVuT3JBcHBseSgoKSA9PiB7XG5cdFx0XHRcdG1ldGFEYXRhUm93LnJvd3MgPSBtZXRhRGF0YVJvdy5yb3dzLmZpbHRlcigocikgPT4gci5zaXplID4gMClcblxuXHRcdFx0XHRpZiAobWV0YURhdGFSb3cucm93cy5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0XHRyZXR1cm4gdHJhbnNhY3Rpb24uZGVsZXRlKFNlYXJjaEluZGV4TWV0YURhdGFPUywgbWV0YURhdGFSb3cuaWQpXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRyYW5zYWN0aW9uLnB1dChTZWFyY2hJbmRleE1ldGFEYXRhT1MsIG51bGwsIGVuY3J5cHRNZXRhRGF0YSh0aGlzLmRiLmtleSwgbWV0YURhdGFSb3cpKVxuXHRcdFx0XHR9XG5cdFx0XHR9KS52YWx1ZVxuXHRcdH0pXG5cdH1cblxuXHRfaW5zZXJ0TmV3RWxlbWVudERhdGEoaW5kZXhVcGRhdGU6IEluZGV4VXBkYXRlLCB0cmFuc2FjdGlvbjogRGJUcmFuc2FjdGlvbiwgZW5jV29yZFRvTWV0YVJvdzogRW5jV29yZFRvTWV0YVJvdyk6IFByb21pc2U8dW5rbm93bj4gfCBudWxsIHtcblx0XHR0aGlzLl9jYW5jZWxJZk5lZWRlZCgpXG5cblx0XHRpZiAoaW5kZXhVcGRhdGUuY3JlYXRlLmVuY0luc3RhbmNlSWRUb0VsZW1lbnREYXRhLnNpemUgPT09IDApIHJldHVybiBudWxsIC8vIGtlZXAgdHJhbnNhY3Rpb24gY29udGV4dCBvcGVuIChvbmx5IGluIFNhZmFyaSlcblxuXHRcdGxldCBwcm9taXNlczogUHJvbWlzZTx1bmtub3duPltdID0gW11cblx0XHRmb3IgKGNvbnN0IFtiNjRFbmNJbnN0YW5jZUlkLCBlbGVtZW50RGF0YVN1cnJvZ2F0ZV0gb2YgaW5kZXhVcGRhdGUuY3JlYXRlLmVuY0luc3RhbmNlSWRUb0VsZW1lbnREYXRhLmVudHJpZXMoKSkge1xuXHRcdFx0Y29uc3QgbWV0YVJvd3MgPSBlbGVtZW50RGF0YVN1cnJvZ2F0ZS5lbmNXb3Jkc0I2NC5tYXAoKHcpID0+IGVuY1dvcmRUb01ldGFSb3dbd10pXG5cdFx0XHRjb25zdCByb3dLZXlzQmluYXJ5ID0gbmV3IFVpbnQ4QXJyYXkoY2FsY3VsYXRlTmVlZGVkU3BhY2VGb3JOdW1iZXJzKG1ldGFSb3dzKSlcblx0XHRcdGVuY29kZU51bWJlcnMobWV0YVJvd3MsIHJvd0tleXNCaW5hcnkpXG5cdFx0XHRjb25zdCBlbmNNZXRhUm93S2V5cyA9IGFlczI1NkVuY3J5cHRTZWFyY2hJbmRleEVudHJ5KHRoaXMuZGIua2V5LCByb3dLZXlzQmluYXJ5KVxuXHRcdFx0cHJvbWlzZXMucHVzaCh0cmFuc2FjdGlvbi5wdXQoRWxlbWVudERhdGFPUywgYjY0RW5jSW5zdGFuY2VJZCwgW2VsZW1lbnREYXRhU3Vycm9nYXRlLmxpc3RJZCwgZW5jTWV0YVJvd0tleXMsIGVsZW1lbnREYXRhU3Vycm9nYXRlLm93bmVyR3JvdXBdKSlcblx0XHR9XG5cdFx0cmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKVxuXHR9XG5cblx0X2luc2VydE5ld0luZGV4RW50cmllcyhpbmRleFVwZGF0ZTogSW5kZXhVcGRhdGUsIHRyYW5zYWN0aW9uOiBEYlRyYW5zYWN0aW9uKTogUHJvbWlzZTxFbmNXb3JkVG9NZXRhUm93PiB8IG51bGwge1xuXHRcdHRoaXMuX2NhbmNlbElmTmVlZGVkKClcblxuXHRcdGxldCBrZXlzID0gWy4uLmluZGV4VXBkYXRlLmNyZWF0ZS5pbmRleE1hcC5rZXlzKCldXG5cdFx0Y29uc3QgZW5jV29yZFRvTWV0YVJvdzogRW5jV29yZFRvTWV0YVJvdyA9IHt9XG5cblx0XHRjb25zdCByZXN1bHQgPSB0aGlzLl9wcm9taXNlTWFwQ29tcGF0KFxuXHRcdFx0a2V5cyxcblx0XHRcdChlbmNXb3JkQjY0KSA9PiB7XG5cdFx0XHRcdGNvbnN0IGVuY3J5cHRlZEVudHJpZXMgPSBuZXZlck51bGwoaW5kZXhVcGRhdGUuY3JlYXRlLmluZGV4TWFwLmdldChlbmNXb3JkQjY0KSlcblx0XHRcdFx0cmV0dXJuIHRoaXMuX3B1dEVuY3J5cHRlZEVudGl0eShcblx0XHRcdFx0XHRpbmRleFVwZGF0ZS50eXBlSW5mby5hcHBJZCxcblx0XHRcdFx0XHRpbmRleFVwZGF0ZS50eXBlSW5mby50eXBlSWQsXG5cdFx0XHRcdFx0dHJhbnNhY3Rpb24sXG5cdFx0XHRcdFx0ZW5jV29yZEI2NCxcblx0XHRcdFx0XHRlbmNXb3JkVG9NZXRhUm93LFxuXHRcdFx0XHRcdGVuY3J5cHRlZEVudHJpZXMsXG5cdFx0XHRcdClcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdGNvbmN1cnJlbmN5OiAyLFxuXHRcdFx0fSxcblx0XHQpLnZhbHVlXG5cblx0XHRyZXR1cm4gcmVzdWx0IGluc3RhbmNlb2YgUHJvbWlzZSA/IHJlc3VsdC50aGVuKCgpID0+IGVuY1dvcmRUb01ldGFSb3cpIDogbnVsbFxuXHR9XG5cblx0X3B1dEVuY3J5cHRlZEVudGl0eShcblx0XHRhcHBJZDogbnVtYmVyLFxuXHRcdHR5cGVJZDogbnVtYmVyLFxuXHRcdHRyYW5zYWN0aW9uOiBEYlRyYW5zYWN0aW9uLFxuXHRcdGVuY1dvcmRCNjQ6IEI2NEVuY0luZGV4S2V5LFxuXHRcdGVuY1dvcmRUb01ldGFSb3c6IEVuY1dvcmRUb01ldGFSb3csXG5cdFx0ZW5jcnlwdGVkRW50cmllczogQXJyYXk8RW5jU2VhcmNoSW5kZXhFbnRyeVdpdGhUaW1lc3RhbXA+LFxuXHQpOiBQcm9taXNlPHVua25vd24+IHwgbnVsbCB7XG5cdFx0dGhpcy5fY2FuY2VsSWZOZWVkZWQoKVxuXG5cdFx0aWYgKGVuY3J5cHRlZEVudHJpZXMubGVuZ3RoIDw9IDApIHtcblx0XHRcdHJldHVybiBudWxsXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuX2dldE9yQ3JlYXRlU2VhcmNoSW5kZXhNZXRhKHRyYW5zYWN0aW9uLCBlbmNXb3JkQjY0KVxuXHRcdFx0LnRoZW4oKG1ldGFEYXRhOiBTZWFyY2hJbmRleE1ldGFEYXRhUm93KSA9PiB7XG5cdFx0XHRcdGVuY3J5cHRlZEVudHJpZXMuc29ydCgoYSwgYikgPT4gYS50aW1lc3RhbXAgLSBiLnRpbWVzdGFtcClcblxuXHRcdFx0XHRjb25zdCB3cml0ZVJlc3VsdCA9IHRoaXMuX3dyaXRlRW50cmllcyh0cmFuc2FjdGlvbiwgZW5jcnlwdGVkRW50cmllcywgbWV0YURhdGEsIGFwcElkLCB0eXBlSWQpXG5cblx0XHRcdFx0cmV0dXJuIHdyaXRlUmVzdWx0LnRoZW5PckFwcGx5KCgpID0+IG1ldGFEYXRhKS52YWx1ZVxuXHRcdFx0fSlcblx0XHRcdC50aGVuKChtZXRhRGF0YSkgPT4ge1xuXHRcdFx0XHRjb25zdCBjb2x1bW5TaXplID0gbWV0YURhdGEucm93cy5yZWR1Y2UoKHJlc3VsdCwgbWV0YURhdGFFbnRyeSkgPT4gcmVzdWx0ICsgbWV0YURhdGFFbnRyeS5zaXplLCAwKVxuXHRcdFx0XHR0aGlzLl9zdGF0cy53cml0ZVJlcXVlc3RzICs9IDFcblx0XHRcdFx0dGhpcy5fc3RhdHMubGFyZ2VzdENvbHVtbiA9IGNvbHVtblNpemUgPiB0aGlzLl9zdGF0cy5sYXJnZXN0Q29sdW1uID8gY29sdW1uU2l6ZSA6IHRoaXMuX3N0YXRzLmxhcmdlc3RDb2x1bW5cblx0XHRcdFx0dGhpcy5fc3RhdHMuc3RvcmVkQnl0ZXMgKz0gZW5jcnlwdGVkRW50cmllcy5yZWR1Y2UoKHN1bSwgZSkgPT4gc3VtICsgZS5lbnRyeS5sZW5ndGgsIDApXG5cdFx0XHRcdGVuY1dvcmRUb01ldGFSb3dbZW5jV29yZEI2NF0gPSBtZXRhRGF0YS5pZFxuXHRcdFx0XHRyZXR1cm4gdHJhbnNhY3Rpb24ucHV0KFNlYXJjaEluZGV4TWV0YURhdGFPUywgbnVsbCwgZW5jcnlwdE1ldGFEYXRhKHRoaXMuZGIua2V5LCBtZXRhRGF0YSkpXG5cdFx0XHR9KVxuXHR9XG5cblx0LyoqXG5cdCAqIEluc2VydCB7QHBhcmFtIGVudHJpZXN9IGludG8gdGhlIGRhdGFiYXNlIGZvciB0aGUgY29ycmVzcG9uZGluZyB7QHBhcmFtIG1ldGFEYXRhfS5cblx0ICogTWV0YWRhdGEgZW50cmllcyBmb3IgZWFjaCB0eXBlIGFyZSBzb3J0ZWQgZnJvbSBvbGRlc3QgdG8gbmV3ZXN0LiBFYWNoIG1ldGFkYXRhIGVudHJ5IGhhcyBvbGRlc3QgZWxlbWVudCB0aW1lc3RhbXAuIFRpbWVzdGFtcHMgb2YgbmV3ZXIgZW50cmllcyBtYWtlIGFcblx0ICogdGltZSBib3JkZXIgZm9yIHRoZSBuZXdlc3QuIFRpbWVzdGFtcCBmb3IgZW50cnkgaXMgY29uc2lkZXJlZCBmaXhlZCAodW5sZXNzIGl0J3MgdGhlIGZpcnN0IGVudHJ5KS5cblx0ICogVGhlIHN0cmF0ZWd5IGlzIGZvbGxvd2luZzpcblx0ICogRmlyc3QsIHRyeSB0byBmaW5kIG1hdGNoaW5nIHJvdyBieSB0aGUgb2xkZXN0IGlkIG9mIHRoZSBlbnRyaWVzIHdlIHdhbnQgdG8gaW5zZXJ0LlxuXHQgKiBJZiB3ZSd2ZSBmb3VuZCBvbmUsIHB1dCBldmVyeXRoaW5nIHRoYXQgbWF0Y2hlcyB0aW1lIGZyYW1lIG9mIHRoaXMgcm93IGludG8gaXQgKGl0J3MgYm91bmRlZCBieSB0aGUgbmV4dCByb3csIGlmIHByZXNlbnQpLiBQdXQgdGhlIHJlc3QgaW50byBuZXdlclxuXHQgKiByb3dzLlxuXHQgKiBJZiB3ZSBkaWRuJ3QgZmluZCBvbmUsIHdlIG1heSB0cnkgdG8gZXh0ZW5kIHRoZSBvbGRlc3Qgcm93LCBiZWNhdXNlIGl0J3Mgbm90IGJvdW5kZWQgYnkgdGhlIG90aGVyIHJvdy5cblx0ICogV2hlbiB3ZSBhcHBlbmQgc29tZXRoaW5nIHRvIHRoZSByb3csIHdlIGNoZWNrIGlmIGl0cyBzaXplIHdvdWxkIGV4Y2VlZCB7QGxpbmsgU0VBUkNIX0lOREVYX1JPV19MRU5HVEh9LiBJZiBpdCBpcywgd2UgZG8gc3BsaXR0aW5nLFxuXHQgKiB7QHNlZSBfYXBwZW5kSW5kZXhFbnRyaWVzVG9Sb3d9LlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X3dyaXRlRW50cmllcyhcblx0XHR0cmFuc2FjdGlvbjogRGJUcmFuc2FjdGlvbixcblx0XHRlbnRyaWVzOiBBcnJheTxFbmNTZWFyY2hJbmRleEVudHJ5V2l0aFRpbWVzdGFtcD4sXG5cdFx0bWV0YURhdGE6IFNlYXJjaEluZGV4TWV0YURhdGFSb3csXG5cdFx0YXBwSWQ6IG51bWJlcixcblx0XHR0eXBlSWQ6IG51bWJlcixcblx0KTogUHJvbWlzYWJsZVdyYXBwZXI8dm9pZD4ge1xuXHRcdGlmIChlbnRyaWVzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0Ly8gUHJldmVudCBJREIgdGltZW91dHMgaW4gU2FmYXJpIGNhc3VlZCBieSBQcm9taXNlLnJlc29sdmUoKVxuXHRcdFx0cmV0dXJuIFByb21pc2FibGVXcmFwcGVyLmZyb20odW5kZWZpbmVkKVxuXHRcdH1cblxuXHRcdGNvbnN0IG9sZGVzdFRpbWVzdGFtcCA9IGVudHJpZXNbMF0udGltZXN0YW1wXG5cblx0XHRjb25zdCBpbmRleE9mTWV0YUVudHJ5ID0gdGhpcy5fZmluZE1ldGFEYXRhRW50cnlCeVRpbWVzdGFtcChtZXRhRGF0YSwgb2xkZXN0VGltZXN0YW1wLCBhcHBJZCwgdHlwZUlkKVxuXG5cdFx0aWYgKGluZGV4T2ZNZXRhRW50cnkgIT09IC0xKSB7XG5cdFx0XHRjb25zdCBuZXh0RW50cnkgPSB0aGlzLl9uZXh0RW50cnlPZlR5cGUobWV0YURhdGEsIGluZGV4T2ZNZXRhRW50cnkgKyAxLCBhcHBJZCwgdHlwZUlkKVxuXG5cdFx0XHRpZiAoIW5leHRFbnRyeSkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5fYXBwZW5kSW5kZXhFbnRyaWVzVG9Sb3codHJhbnNhY3Rpb24sIG1ldGFEYXRhLCBpbmRleE9mTWV0YUVudHJ5LCBlbnRyaWVzKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3QgW3RvQ3VycmVudE9uZSwgdG9OZXh0T25lc10gPSB0aGlzLl9zcGxpdEJ5VGltZXN0YW1wKGVudHJpZXMsIG5leHRFbnRyeS5vbGRlc3RFbGVtZW50VGltZXN0YW1wKVxuXG5cdFx0XHRcdHJldHVybiB0aGlzLl9hcHBlbmRJbmRleEVudHJpZXNUb1Jvdyh0cmFuc2FjdGlvbiwgbWV0YURhdGEsIGluZGV4T2ZNZXRhRW50cnksIHRvQ3VycmVudE9uZSkudGhlbk9yQXBwbHkoKCkgPT5cblx0XHRcdFx0XHR0aGlzLl93cml0ZUVudHJpZXModHJhbnNhY3Rpb24sIHRvTmV4dE9uZXMsIG1ldGFEYXRhLCBhcHBJZCwgdHlwZUlkKSxcblx0XHRcdFx0KVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyB3ZSBoYXZlIG5vdCBmb3VuZCBhbnkgZW50cnkgd2hpY2ggb2xkZXN0IGlkIGlzIGxvd2VyIHRoYW4gb2xkZXN0IGlkIHRvIGFkZCBidXQgdGhlcmUgY2FuIGJlIG90aGVyIGVudHJpZXNcblx0XHRcdGNvbnN0IGZpcnN0RW50cnkgPSB0aGlzLl9uZXh0RW50cnlPZlR5cGUobWV0YURhdGEsIDAsIGFwcElkLCB0eXBlSWQpXG5cblx0XHRcdC8vIDEuIFdlIGhhdmUgYSBmaXJzdCBlbnRyeS5cblx0XHRcdC8vICAgaTogV2UgaGF2ZSBhIHNlY29uZCBlbnRyeS4gQ2hlY2sgaG93IG11Y2ggZml0cyBpbnRvIHRoZSBmaXJzdCBibG9ja1xuXHRcdFx0Ly8gICAgIGEuIEl0J3Mgbm90IG92ZXJzaXplZC4gV3JpdGUgdG8gaXQuXG5cdFx0XHQvLyAgICAgYi4gSXQgaXMgb3ZlcnNpemVkLiBDcmVhdGUgYSBuZXcgYmxvY2suXG5cdFx0XHQvLyAgIGlpOiBXZSBkb24ndCBoYXZlIGEgc2Vjb25kIGVudHJ5LiBDaGVjayBpZiB3ZSBjYW4gZml0IGV2ZXJ5dGhpbmcgaW50byB0aGUgZmlyc3QgYmxvY2tcblx0XHRcdC8vICAgICBhLiBJdCdzIG5vdCBldmVyc2l6ZWQuIFdyaXRlIHRvIGl0LlxuXHRcdFx0Ly8gICAgIGIuIEl0J3Mgb3ZlcnNpemVkLiBDcmVhdGUgYSBuZXcgb25lLlxuXHRcdFx0Ly8gMi4gV2UgZG9uJ3QgaGF2ZSBhIGZpcnN0IGVudHJ5LiBKdXN0IGNyZWF0ZSBhIG5ldyByb3cgd2l0aCBldmVyeXRoaW5nLlxuXHRcdFx0aWYgKGZpcnN0RW50cnkpIHtcblx0XHRcdFx0Y29uc3QgaW5kZXhPZkZpcnN0RW50cnkgPSBtZXRhRGF0YS5yb3dzLmluZGV4T2YoZmlyc3RFbnRyeSlcblxuXHRcdFx0XHRjb25zdCBzZWNvbmRFbnRyeSA9IHRoaXMuX25leHRFbnRyeU9mVHlwZShtZXRhRGF0YSwgaW5kZXhPZkZpcnN0RW50cnkgKyAxLCBhcHBJZCwgdHlwZUlkKVxuXG5cdFx0XHRcdGNvbnN0IFt0b0ZpcnN0T25lLCB0b05leHRPbmVzXSA9IHNlY29uZEVudHJ5ID8gdGhpcy5fc3BsaXRCeVRpbWVzdGFtcChlbnRyaWVzLCBzZWNvbmRFbnRyeS5vbGRlc3RFbGVtZW50VGltZXN0YW1wKSA6IFtlbnRyaWVzLCBbXV1cblxuXHRcdFx0XHRpZiAoZmlyc3RFbnRyeS5zaXplICsgdG9GaXJzdE9uZS5sZW5ndGggPCBTRUFSQ0hfSU5ERVhfUk9XX0xFTkdUSCkge1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLl9hcHBlbmRJbmRleEVudHJpZXNUb1Jvdyh0cmFuc2FjdGlvbiwgbWV0YURhdGEsIGluZGV4T2ZGaXJzdEVudHJ5LCB0b0ZpcnN0T25lKS50aGVuT3JBcHBseSgoKSA9PlxuXHRcdFx0XHRcdFx0dGhpcy5fd3JpdGVFbnRyaWVzKHRyYW5zYWN0aW9uLCB0b05leHRPbmVzLCBtZXRhRGF0YSwgYXBwSWQsIHR5cGVJZCksXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnN0IFt0b05ld09uZSwgdG9DdXJyZW50T25lXSA9IHRoaXMuX3NwbGl0QnlUaW1lc3RhbXAodG9GaXJzdE9uZSwgZmlyc3RFbnRyeS5vbGRlc3RFbGVtZW50VGltZXN0YW1wKVxuXG5cdFx0XHRcdFx0cmV0dXJuIFByb21pc2FibGVXcmFwcGVyLmZyb20odGhpcy5fY3JlYXRlTmV3Um93KHRyYW5zYWN0aW9uLCBtZXRhRGF0YSwgdG9OZXdPbmUsIG9sZGVzdFRpbWVzdGFtcCwgYXBwSWQsIHR5cGVJZCkpLnRoZW5PckFwcGx5KCgpID0+XG5cdFx0XHRcdFx0XHR0aGlzLl93cml0ZUVudHJpZXModHJhbnNhY3Rpb24sIHRvQ3VycmVudE9uZS5jb25jYXQodG9OZXh0T25lcyksIG1ldGFEYXRhLCBhcHBJZCwgdHlwZUlkKSxcblx0XHRcdFx0XHQpXG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9jcmVhdGVOZXdSb3codHJhbnNhY3Rpb24sIG1ldGFEYXRhLCBlbnRyaWVzLCBvbGRlc3RUaW1lc3RhbXAsIGFwcElkLCB0eXBlSWQpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0X25leHRFbnRyeU9mVHlwZShtZXRhRGF0YTogU2VhcmNoSW5kZXhNZXRhRGF0YVJvdywgc3RhcnRJbmRleDogbnVtYmVyLCBhcHBJZDogbnVtYmVyLCB0eXBlSWQ6IG51bWJlcik6IFNlYXJjaEluZGV4TWV0YWRhdGFFbnRyeSB8IG51bGwge1xuXHRcdGZvciAobGV0IGkgPSBzdGFydEluZGV4OyBpIDwgbWV0YURhdGEucm93cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKG1ldGFEYXRhLnJvd3NbaV0uYXBwID09PSBhcHBJZCAmJiBtZXRhRGF0YS5yb3dzW2ldLnR5cGUgPT09IHR5cGVJZCkge1xuXHRcdFx0XHRyZXR1cm4gbWV0YURhdGEucm93c1tpXVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBudWxsXG5cdH1cblxuXHQvKipcblx0ICogU3BsaXQge0BwYXJhbSBlbnRyaWVzfSAobXVzdCBiZSBzb3J0ZWQhKSBpbnRvIHR3byBhcnJheXM6IGJlZm9yZSBhbmQgYWZ0ZXIgdGhlIHRpbWVzdGFtcC5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9zcGxpdEJ5VGltZXN0YW1wKFxuXHRcdGVudHJpZXM6IEFycmF5PEVuY1NlYXJjaEluZGV4RW50cnlXaXRoVGltZXN0YW1wPixcblx0XHR0aW1lc3RhbXA6IG51bWJlcixcblx0KTogW0FycmF5PEVuY1NlYXJjaEluZGV4RW50cnlXaXRoVGltZXN0YW1wPiwgQXJyYXk8RW5jU2VhcmNoSW5kZXhFbnRyeVdpdGhUaW1lc3RhbXA+XSB7XG5cdFx0Y29uc3QgaW5kZXhPZlNwbGl0ID0gZW50cmllcy5maW5kSW5kZXgoKGVudHJ5KSA9PiBlbnRyeS50aW1lc3RhbXAgPj0gdGltZXN0YW1wKVxuXG5cdFx0aWYgKGluZGV4T2ZTcGxpdCA9PT0gLTEpIHtcblx0XHRcdHJldHVybiBbZW50cmllcywgW11dXG5cdFx0fVxuXG5cdFx0Y29uc3QgYmVsb3cgPSBlbnRyaWVzLnNsaWNlKDAsIGluZGV4T2ZTcGxpdClcblx0XHRjb25zdCBhYm92ZSA9IGVudHJpZXMuc2xpY2UoaW5kZXhPZlNwbGl0KVxuXHRcdHJldHVybiBbYmVsb3csIGFib3ZlXVxuXHR9XG5cblx0LyoqXG5cdCAqIEFwcGVuZCB7QHBhcmFtIGVudHJpZXN9IHRvIHRoZSByb3cgc3BlY2lmaWVkIGJ5IHRoZSB7QHBhcmFtIG1ldGFFbnRyeUluZGV4fS4gSWYgdGhlIHJvdyBzaXplIGV4Y2VlZHMge0BsaW5rIFNFQVJDSF9JTkRFWF9ST1dfTEVOR1RIfSwgdGhlblxuXHQgKiBzcGxpdCBpdCBpbnRvIHR3byByb3dzLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2FwcGVuZEluZGV4RW50cmllc1RvUm93KFxuXHRcdHRyYW5zYWN0aW9uOiBEYlRyYW5zYWN0aW9uLFxuXHRcdG1ldGFEYXRhOiBTZWFyY2hJbmRleE1ldGFEYXRhUm93LFxuXHRcdG1ldGFFbnRyeUluZGV4OiBudW1iZXIsXG5cdFx0ZW50cmllczogQXJyYXk8RW5jU2VhcmNoSW5kZXhFbnRyeVdpdGhUaW1lc3RhbXA+LFxuXHQpOiBQcm9taXNhYmxlV3JhcHBlcjx2b2lkPiB7XG5cdFx0aWYgKGVudHJpZXMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2FibGVXcmFwcGVyKHVuZGVmaW5lZClcblx0XHR9XG5cblx0XHRjb25zdCBtZXRhRW50cnkgPSBtZXRhRGF0YS5yb3dzW21ldGFFbnRyeUluZGV4XVxuXG5cdFx0aWYgKG1ldGFFbnRyeS5zaXplICsgZW50cmllcy5sZW5ndGggPiBTRUFSQ0hfSU5ERVhfUk9XX0xFTkdUSCkge1xuXHRcdFx0Ly8gbG9hZCBleGlzdGluZyByb3dcblx0XHRcdC8vIGRlY3J5cHQgaWRzXG5cdFx0XHQvLyBzb3J0IGJ5IGlkXG5cdFx0XHQvLyBzcGxpdFxuXHRcdFx0cmV0dXJuIFByb21pc2FibGVXcmFwcGVyLmZyb20oXG5cdFx0XHRcdHRyYW5zYWN0aW9uLmdldChTZWFyY2hJbmRleE9TLCBtZXRhRW50cnkua2V5KS50aGVuKChiaW5hcnlCbG9jazogU2VhcmNoSW5kZXhEYlJvdyB8IG51bGwpID0+IHtcblx0XHRcdFx0XHRpZiAoIWJpbmFyeUJsb2NrKSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgSW52YWxpZERhdGFiYXNlU3RhdGVFcnJvcihcIm5vbiBleGlzdGluZyBpbmRleCByb3dcIilcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRjb25zdCB0aW1lc3RhbXBUb0VudHJpZXM6IE1hcDxudW1iZXIsIEFycmF5PFVpbnQ4QXJyYXk+PiA9IG5ldyBNYXAoKVxuXHRcdFx0XHRcdGNvbnN0IGV4aXN0aW5nSWRzID0gbmV3IFNldCgpXG5cdFx0XHRcdFx0Ly8gSXRlcmF0ZSBhbGwgZW50cmllcyBpbiBhIGJsb2NrLCBkZWNyeXB0IGlkIG9mIGVhY2ggYW5kIHB1dCBpdCBpbnRvIHRoZSBtYXBcblx0XHRcdFx0XHRpdGVyYXRlQmluYXJ5QmxvY2tzKGJpbmFyeUJsb2NrLCAoZW5jU2VhcmNoSW5kZXhFbnRyeSkgPT4ge1xuXHRcdFx0XHRcdFx0Y29uc3QgZW5jSWQgPSBnZXRJZEZyb21FbmNTZWFyY2hJbmRleEVudHJ5KGVuY1NlYXJjaEluZGV4RW50cnkpXG5cdFx0XHRcdFx0XHRleGlzdGluZ0lkcy5hZGQoYXJyYXlIYXNoKGVuY0lkKSlcblx0XHRcdFx0XHRcdGNvbnN0IGRlY0lkID0gZGVjcnlwdEluZGV4S2V5KHRoaXMuZGIua2V5LCBlbmNJZCwgdGhpcy5kYi5pdilcblx0XHRcdFx0XHRcdGNvbnN0IHRpbWVTdGFtcCA9IGdlbmVyYXRlZElkVG9UaW1lc3RhbXAoZGVjSWQpXG5cdFx0XHRcdFx0XHRnZXRGcm9tTWFwKHRpbWVzdGFtcFRvRW50cmllcywgdGltZVN0YW1wLCAoKSA9PiBbXSkucHVzaChlbmNTZWFyY2hJbmRleEVudHJ5KVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0Ly8gQWxzbyBhZGQgbmV3IGVudHJpZXNcblx0XHRcdFx0XHRmb3IgKGNvbnN0IHsgZW50cnksIHRpbWVzdGFtcCB9IG9mIGVudHJpZXMpIHtcblx0XHRcdFx0XHRcdGdldEZyb21NYXAodGltZXN0YW1wVG9FbnRyaWVzLCB0aW1lc3RhbXAsICgpID0+IFtdKS5wdXNoKGVudHJ5KVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBQcmVmZXIgdG8gcHV0IGVudHJpZXMgaW50byB0aGUgZmlyc3Qgcm93IGlmIGl0J3Mgbm90IGluaXRpYWwgaW5kZXhpbmcgKHdlIGFyZSBsaWtlbHkgdG8gZ3JvdyBzZWNvbmQgcm93IGluIHRoZSBmdXR1cmUpXG5cdFx0XHRcdFx0Ly8gUHJlZmVyIHRvIHB1dCBlbnRyaWVzIGludG8gdGhlIHNlY29uZCByb3cgaWYgaXQncyBpbml0aWFsIGluZGV4aW5nICh3ZSBhcmUgbGlrZWx5IHRvIGdyb3cgdGhlIGZpcnN0IHJvdyBiZWNhdXNlIHdlIG1vdmUgYmFjayBpbiB0aW1lKVxuXHRcdFx0XHRcdGNvbnN0IGlzTGFzdEVudHJ5ID0gdGhpcy5fbmV4dEVudHJ5T2ZUeXBlKG1ldGFEYXRhLCBtZXRhRW50cnlJbmRleCArIDEsIG1ldGFFbnRyeS5hcHAsIG1ldGFFbnRyeS50eXBlKSA9PSBudWxsXG5cblx0XHRcdFx0XHRjb25zdCByb3dzID0gdGhpcy5fZGlzdHJpYnV0ZUVudGl0aWVzKHRpbWVzdGFtcFRvRW50cmllcywgaXNMYXN0RW50cnkpXG5cblx0XHRcdFx0XHQvLyBrZWVwIHRoZSBvbGRlc3QgdGltZXN0YW1wIGluIHRoZSBleGlzdGluZyBtZXRhIGRhdGEgZW50cnkgdG8gZW5zdXJlIHRoYXQgd2hlbiBjb250aW51aW5nIHNlYXJjaCB3ZSBkb24ndCBnZXQgdGhlIHNhbWUgbWV0YSBkYXRhIGVudHJ5IHR3aWNlLlxuXHRcdFx0XHRcdGNvbnN0IFthcHBlbmRSb3csIG5ld1Jvd3NdID0gW3Jvd3NbMF0sIHJvd3Muc2xpY2UoMSldXG5cdFx0XHRcdFx0Y29uc3QgZmlyc3RSb3dCaW5hcnkgPSBhcHBlbmRCaW5hcnlCbG9ja3MoYXBwZW5kUm93LnJvdylcblx0XHRcdFx0XHRjb25zdCByZXF1ZXN0UHJvbWlzZXMgPSBbXG5cdFx0XHRcdFx0XHR0cmFuc2FjdGlvbi5wdXQoU2VhcmNoSW5kZXhPUywgbWV0YUVudHJ5LmtleSwgZmlyc3RSb3dCaW5hcnkpLnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRtZXRhRW50cnkuc2l6ZSA9IGFwcGVuZFJvdy5yb3cubGVuZ3RoXG5cdFx0XHRcdFx0XHRcdG1ldGFFbnRyeS5vbGRlc3RFbGVtZW50VGltZXN0YW1wID0gYXBwZW5kUm93Lm9sZGVzdEVsZW1lbnRUaW1lc3RhbXBcblx0XHRcdFx0XHRcdFx0cmV0dXJuIG1ldGFFbnRyeS5rZXlcblx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdFx0dGhpcy5fcHJvbWlzZU1hcENvbXBhdChcblx0XHRcdFx0XHRcdFx0bmV3Um93cyxcblx0XHRcdFx0XHRcdFx0KHJvdykgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IGJpbmFyeVJvdyA9IGFwcGVuZEJpbmFyeUJsb2Nrcyhyb3cucm93KVxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB0cmFuc2FjdGlvbi5wdXQoU2VhcmNoSW5kZXhPUywgbnVsbCwgYmluYXJ5Um93KS50aGVuKChuZXdTZWFyY2hJbmRleFJvd0lkKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRtZXRhRGF0YS5yb3dzLnB1c2goe1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRrZXk6IG5ld1NlYXJjaEluZGV4Um93SWQsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHNpemU6IHJvdy5yb3cubGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRhcHA6IG1ldGFFbnRyeS5hcHAsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHR5cGU6IG1ldGFFbnRyeS50eXBlLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRvbGRlc3RFbGVtZW50VGltZXN0YW1wOiByb3cub2xkZXN0RWxlbWVudFRpbWVzdGFtcCxcblx0XHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGNvbmN1cnJlbmN5OiAyLFxuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0KS52YWx1ZSxcblx0XHRcdFx0XHRdXG5cdFx0XHRcdFx0cmV0dXJuIFByb21pc2UuYWxsKHJlcXVlc3RQcm9taXNlcykudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0XHRtZXRhRGF0YS5yb3dzLnNvcnQoY29tcGFyZU1ldGFFbnRyaWVzT2xkZXN0KVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdH0pLFxuXHRcdFx0KVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzYWJsZVdyYXBwZXIuZnJvbShcblx0XHRcdFx0dHJhbnNhY3Rpb24uZ2V0KFNlYXJjaEluZGV4T1MsIG1ldGFFbnRyeS5rZXkpLnRoZW4oKGluZGV4RW50cmllc1JvdykgPT4ge1xuXHRcdFx0XHRcdGxldCBzYWZlUm93ID0gaW5kZXhFbnRyaWVzUm93IHx8IG5ldyBVaW50OEFycmF5KDApXG5cdFx0XHRcdFx0Y29uc3QgcmVzdWx0Um93ID0gYXBwZW5kQmluYXJ5QmxvY2tzKFxuXHRcdFx0XHRcdFx0ZW50cmllcy5tYXAoKGUpID0+IGUuZW50cnkpLFxuXHRcdFx0XHRcdFx0c2FmZVJvdyxcblx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0cmV0dXJuIHRyYW5zYWN0aW9uLnB1dChTZWFyY2hJbmRleE9TLCBtZXRhRW50cnkua2V5LCByZXN1bHRSb3cpLnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdFx0bWV0YUVudHJ5LnNpemUgKz0gZW50cmllcy5sZW5ndGhcblx0XHRcdFx0XHRcdC8vIHdoZW4gYWRkaW5nIGVudHJpZXMgdG8gYW4gZXhpc3Rpbmcgcm93IGl0IGlzIGd1YXJhbnRlZWQgdGhhdCBhbGwgYWRkZWQgZWxlbWVudHMgYXJlIG5ld2VyLlxuXHRcdFx0XHRcdFx0Ly8gV2UgZG9uJ3QgaGF2ZSB0byB1cGRhdGUgb2xkZXN0VGltZXN0YW1wIG9mIHRoZSBtZXRhIGRhdGEuXG5cdFx0XHRcdFx0XHQvLyAuLi5leGNlcHQgd2hlbiB3ZSdyZSBncm93aW5nIHRoZSBmaXJzdCByb3csIHRoZW4gd2Ugc2hvdWxkIGRvIHRoYXRcblx0XHRcdFx0XHRcdG1ldGFFbnRyeS5vbGRlc3RFbGVtZW50VGltZXN0YW1wID0gTWF0aC5taW4oZW50cmllc1swXS50aW1lc3RhbXAsIG1ldGFFbnRyeS5vbGRlc3RFbGVtZW50VGltZXN0YW1wKVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdH0pLFxuXHRcdFx0KVxuXHRcdH1cblx0fVxuXG5cdF9kaXN0cmlidXRlRW50aXRpZXMoXG5cdFx0dGltZXN0YW1wVG9FbnRyaWVzOiBNYXA8bnVtYmVyLCBBcnJheTxFbmNyeXB0ZWRTZWFyY2hJbmRleEVudHJ5Pj4sXG5cdFx0cHJlZmVyRmlyc3Q6IGJvb2xlYW4sXG5cdCk6IEFycmF5PHtcblx0XHRyb3c6IEFycmF5PFVpbnQ4QXJyYXk+XG5cdFx0b2xkZXN0RWxlbWVudFRpbWVzdGFtcDogbnVtYmVyXG5cdH0+IHtcblx0XHRjb25zdCBzb3J0ZWRUaW1lc3RhbXBzID0gQXJyYXkuZnJvbSh0aW1lc3RhbXBUb0VudHJpZXMua2V5cygpKS5zb3J0KChsLCByKSA9PiBsIC0gcilcblxuXHRcdC8vIElmIHdlIGFwcGVuZCB0byB0aGUgbmV3ZXN0IElEcywgdGhlbiB0cnkgdG8gc2F0dXJhdGUgb2xkZXIgcm93c1xuXHRcdGlmIChwcmVmZXJGaXJzdCkge1xuXHRcdFx0Y29uc3Qgcm93cyA9IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJvdzogW10gYXMgQXJyYXk8RW5jcnlwdGVkU2VhcmNoSW5kZXhFbnRyeT4sXG5cdFx0XHRcdFx0b2xkZXN0RWxlbWVudFRpbWVzdGFtcDogc29ydGVkVGltZXN0YW1wc1swXSxcblx0XHRcdFx0fSxcblx0XHRcdF1cblx0XHRcdGZvciAoY29uc3QgaWQgb2Ygc29ydGVkVGltZXN0YW1wcykge1xuXHRcdFx0XHRjb25zdCBlbmNyeXB0ZWRFbnRyaWVzID0gbmV2ZXJOdWxsKHRpbWVzdGFtcFRvRW50cmllcy5nZXQoaWQpKVxuXG5cdFx0XHRcdGlmIChsYXN0VGhyb3cocm93cykucm93Lmxlbmd0aCArIGVuY3J5cHRlZEVudHJpZXMubGVuZ3RoID4gU0VBUkNIX0lOREVYX1JPV19MRU5HVEgpIHtcblx0XHRcdFx0XHRyb3dzLnB1c2goe1xuXHRcdFx0XHRcdFx0cm93OiBbXSxcblx0XHRcdFx0XHRcdG9sZGVzdEVsZW1lbnRUaW1lc3RhbXA6IGlkLFxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsYXN0VGhyb3cocm93cykucm93LnB1c2goLi4uZW5jcnlwdGVkRW50cmllcylcblx0XHRcdH1cblx0XHRcdHJldHVybiByb3dzXG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIElmIHdlIGFwcGVuZCBpbiB0aGUgbWlkZGxlLCB0aGVuIHRyeSB0byBzYXR1cmF0ZSBuZXcgcm93XG5cdFx0XHRjb25zdCByb3dzID0gW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cm93OiBbXSBhcyBFbmNyeXB0ZWRTZWFyY2hJbmRleEVudHJ5W10sXG5cdFx0XHRcdFx0b2xkZXN0RWxlbWVudFRpbWVzdGFtcDogTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIsXG5cdFx0XHRcdH0sXG5cdFx0XHRdXG5cdFx0XHRjb25zdCByZXZlcmVzSWQgPSBzb3J0ZWRUaW1lc3RhbXBzLnNsaWNlKCkucmV2ZXJzZSgpXG5cdFx0XHRmb3IgKGNvbnN0IGlkIG9mIHJldmVyZXNJZCkge1xuXHRcdFx0XHRjb25zdCBlbmNyeXB0ZWRFbnRyaWVzID0gbmV2ZXJOdWxsKHRpbWVzdGFtcFRvRW50cmllcy5nZXQoaWQpKVxuXG5cdFx0XHRcdGlmIChyb3dzWzBdLnJvdy5sZW5ndGggKyBlbmNyeXB0ZWRFbnRyaWVzLmxlbmd0aCA+IFNFQVJDSF9JTkRFWF9ST1dfTEVOR1RIKSB7XG5cdFx0XHRcdFx0cm93cy51bnNoaWZ0KHtcblx0XHRcdFx0XHRcdHJvdzogW10sXG5cdFx0XHRcdFx0XHRvbGRlc3RFbGVtZW50VGltZXN0YW1wOiBpZCxcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cm93c1swXS5yb3cudW5zaGlmdCguLi5lbmNyeXB0ZWRFbnRyaWVzKVxuXHRcdFx0XHRyb3dzWzBdLm9sZGVzdEVsZW1lbnRUaW1lc3RhbXAgPSBNYXRoLm1pbihyb3dzWzBdLm9sZGVzdEVsZW1lbnRUaW1lc3RhbXAsIGlkKVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHJvd3Ncblx0XHR9XG5cdH1cblxuXHRfY3JlYXRlTmV3Um93KFxuXHRcdHRyYW5zYWN0aW9uOiBEYlRyYW5zYWN0aW9uLFxuXHRcdG1ldGFEYXRhOiBTZWFyY2hJbmRleE1ldGFEYXRhUm93LFxuXHRcdGVuY3J5cHRlZFNlYXJjaEluZGV4RW50cmllczogQXJyYXk8RW5jU2VhcmNoSW5kZXhFbnRyeVdpdGhUaW1lc3RhbXA+LFxuXHRcdG9sZGVzdFRpbWVzdGFtcDogbnVtYmVyLFxuXHRcdGFwcElkOiBudW1iZXIsXG5cdFx0dHlwZUlkOiBudW1iZXIsXG5cdCk6IFByb21pc2FibGVXcmFwcGVyPHZvaWQ+IHtcblx0XHRjb25zdCBieVRpbWVzdGFtcCA9IGdyb3VwQnlBbmRNYXAoXG5cdFx0XHRlbmNyeXB0ZWRTZWFyY2hJbmRleEVudHJpZXMsXG5cdFx0XHQoZSkgPT4gZS50aW1lc3RhbXAsXG5cdFx0XHQoZSkgPT4gZS5lbnRyeSxcblx0XHQpXG5cblx0XHRjb25zdCBkaXN0cmlidXRlZCA9IHRoaXMuX2Rpc3RyaWJ1dGVFbnRpdGllcyhieVRpbWVzdGFtcCwgZmFsc2UpXG5cblx0XHRyZXR1cm4gdGhpcy5fcHJvbWlzZU1hcENvbXBhdChcblx0XHRcdGRpc3RyaWJ1dGVkLFxuXHRcdFx0KHsgcm93LCBvbGRlc3RFbGVtZW50VGltZXN0YW1wIH0pID0+IHtcblx0XHRcdFx0Y29uc3QgYmluYXJ5Um93ID0gYXBwZW5kQmluYXJ5QmxvY2tzKHJvdylcblx0XHRcdFx0cmV0dXJuIHRyYW5zYWN0aW9uLnB1dChTZWFyY2hJbmRleE9TLCBudWxsLCBiaW5hcnlSb3cpLnRoZW4oKG5ld1Jvd0lkKSA9PiB7XG5cdFx0XHRcdFx0Ly8gT2xkZXN0IGVudHJpZXMgY29tZSBpbiBmcm9udFxuXHRcdFx0XHRcdG1ldGFEYXRhLnJvd3MucHVzaCh7XG5cdFx0XHRcdFx0XHRrZXk6IG5ld1Jvd0lkLFxuXHRcdFx0XHRcdFx0c2l6ZTogcm93Lmxlbmd0aCxcblx0XHRcdFx0XHRcdGFwcDogYXBwSWQsXG5cdFx0XHRcdFx0XHR0eXBlOiB0eXBlSWQsXG5cdFx0XHRcdFx0XHRvbGRlc3RFbGVtZW50VGltZXN0YW1wLFxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdH0pXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRjb25jdXJyZW5jeTogMixcblx0XHRcdH0sXG5cdFx0KS50aGVuT3JBcHBseSgoKSA9PiB7XG5cdFx0XHRtZXRhRGF0YS5yb3dzLnNvcnQoY29tcGFyZU1ldGFFbnRyaWVzT2xkZXN0KVxuXHRcdH0pXG5cdH1cblxuXHRfZmluZE1ldGFEYXRhRW50cnlCeVRpbWVzdGFtcChtZXRhRGF0YTogU2VhcmNoSW5kZXhNZXRhRGF0YVJvdywgb2xkZXN0VGltZXN0YW1wOiBudW1iZXIsIGFwcElkOiBudW1iZXIsIHR5cGVJZDogbnVtYmVyKTogbnVtYmVyIHtcblx0XHRyZXR1cm4gZmluZExhc3RJbmRleChtZXRhRGF0YS5yb3dzLCAocikgPT4gci5hcHAgPT09IGFwcElkICYmIHIudHlwZSA9PT0gdHlwZUlkICYmIHIub2xkZXN0RWxlbWVudFRpbWVzdGFtcCA8PSBvbGRlc3RUaW1lc3RhbXApXG5cdH1cblxuXHRfZ2V0T3JDcmVhdGVTZWFyY2hJbmRleE1ldGEodHJhbnNhY3Rpb246IERiVHJhbnNhY3Rpb24sIGVuY1dvcmRCYXNlNjQ6IEI2NEVuY0luZGV4S2V5KTogUHJvbWlzZTxTZWFyY2hJbmRleE1ldGFEYXRhUm93PiB7XG5cdFx0cmV0dXJuIHRyYW5zYWN0aW9uLmdldChTZWFyY2hJbmRleE1ldGFEYXRhT1MsIGVuY1dvcmRCYXNlNjQsIFNlYXJjaEluZGV4V29yZHNJbmRleCkudGhlbigobWV0YURhdGE6IFNlYXJjaEluZGV4TWV0YURhdGFEYlJvdyB8IG51bGwpID0+IHtcblx0XHRcdGlmIChtZXRhRGF0YSkge1xuXHRcdFx0XHRyZXR1cm4gZGVjcnlwdE1ldGFEYXRhKHRoaXMuZGIua2V5LCBtZXRhRGF0YSlcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IG1ldGFUZW1wbGF0ZTogUGFydGlhbDxTZWFyY2hJbmRleE1ldGFEYXRhRGJSb3c+ID0ge1xuXHRcdFx0XHRcdHdvcmQ6IGVuY1dvcmRCYXNlNjQsXG5cdFx0XHRcdFx0cm93czogbmV3IFVpbnQ4QXJyYXkoMCksXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAodGhpcy5fbmVlZHNFeHBsaWNpdElkcykge1xuXHRcdFx0XHRcdG1ldGFUZW1wbGF0ZS5pZCA9IHRoaXMuX2V4cGxpY2l0SWRTdGFydCsrXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gdHJhbnNhY3Rpb24ucHV0KFNlYXJjaEluZGV4TWV0YURhdGFPUywgbnVsbCwgbWV0YVRlbXBsYXRlKS50aGVuKChyb3dJZCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMuX3N0YXRzLndvcmRzICs9IDFcblx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0aWQ6IHJvd0lkLFxuXHRcdFx0XHRcdFx0d29yZDogZW5jV29yZEJhc2U2NCxcblx0XHRcdFx0XHRcdHJvd3M6IFtdLFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSlcblx0XHRcdH1cblx0XHR9KVxuXHR9XG5cblx0X3VwZGF0ZUdyb3VwRGF0YUluZGV4VGltZXN0YW1wKFxuXHRcdGRhdGFQZXJHcm91cDogQXJyYXk8e1xuXHRcdFx0Z3JvdXBJZDogSWRcblx0XHRcdGluZGV4VGltZXN0YW1wOiBudW1iZXJcblx0XHR9Pixcblx0XHR0cmFuc2FjdGlvbjogRGJUcmFuc2FjdGlvbixcblx0KTogJFByb21pc2FibGU8dm9pZD4ge1xuXHRcdHJldHVybiB0aGlzLl9wcm9taXNlTWFwQ29tcGF0KGRhdGFQZXJHcm91cCwgKGRhdGEpID0+IHtcblx0XHRcdGNvbnN0IHsgZ3JvdXBJZCwgaW5kZXhUaW1lc3RhbXAgfSA9IGRhdGFcblx0XHRcdHJldHVybiB0cmFuc2FjdGlvbi5nZXQoR3JvdXBEYXRhT1MsIGdyb3VwSWQpLnRoZW4oKGdyb3VwRGF0YTogR3JvdXBEYXRhIHwgbnVsbCkgPT4ge1xuXHRcdFx0XHRpZiAoIWdyb3VwRGF0YSkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBJbnZhbGlkRGF0YWJhc2VTdGF0ZUVycm9yKFwiR3JvdXBEYXRhIG5vdCBhdmFpbGFibGUgZm9yIGdyb3VwIFwiICsgZ3JvdXBJZClcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGdyb3VwRGF0YS5pbmRleFRpbWVzdGFtcCA9IGluZGV4VGltZXN0YW1wXG5cdFx0XHRcdHJldHVybiB0cmFuc2FjdGlvbi5wdXQoR3JvdXBEYXRhT1MsIGdyb3VwSWQsIGdyb3VwRGF0YSlcblx0XHRcdH0pXG5cdFx0fSkudGhlbk9yQXBwbHkoKCkgPT4ge30pLnZhbHVlXG5cdH1cblxuXHRfdXBkYXRlR3JvdXBEYXRhQmF0Y2hJZChncm91cElkOiBJZCwgYmF0Y2hJZDogSWQsIHRyYW5zYWN0aW9uOiBEYlRyYW5zYWN0aW9uKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0cmV0dXJuIHRyYW5zYWN0aW9uLmdldChHcm91cERhdGFPUywgZ3JvdXBJZCkudGhlbigoZ3JvdXBEYXRhOiBHcm91cERhdGEgfCBudWxsKSA9PiB7XG5cdFx0XHRpZiAoIWdyb3VwRGF0YSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgSW52YWxpZERhdGFiYXNlU3RhdGVFcnJvcihcIkdyb3VwRGF0YSBub3QgYXZhaWxhYmxlIGZvciBncm91cCBcIiArIGdyb3VwSWQpXG5cdFx0XHR9XG5cblx0XHRcdGlmIChncm91cERhdGEubGFzdEJhdGNoSWRzLmxlbmd0aCA+IDAgJiYgZ3JvdXBEYXRhLmxhc3RCYXRjaElkcy5pbmRleE9mKGJhdGNoSWQpICE9PSAtMSkge1xuXHRcdFx0XHQvLyBjb25jdXJyZW50IGluZGV4aW5nIChtdWx0aXBsZSB0YWJzKVxuXHRcdFx0XHRjb25zb2xlLndhcm4oXCJBYm9ydCB0cmFuc2FjdGlvbiBvbiB1cGRhdGluZyBncm91cCBkYXRhOiBjb25jdXJyZW50IGFjY2Vzc1wiLCBncm91cElkLCBiYXRjaElkKVxuXHRcdFx0XHR0cmFuc2FjdGlvbi5hYm9ydCgpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRsZXQgbmV3SW5kZXggPSBncm91cERhdGEubGFzdEJhdGNoSWRzLmZpbmRJbmRleCgoaW5kZXhlZEJhdGNoSWQpID0+IGZpcnN0QmlnZ2VyVGhhblNlY29uZChiYXRjaElkLCBpbmRleGVkQmF0Y2hJZCkpXG5cblx0XHRcdFx0aWYgKG5ld0luZGV4ICE9PSAtMSkge1xuXHRcdFx0XHRcdGdyb3VwRGF0YS5sYXN0QmF0Y2hJZHMuc3BsaWNlKG5ld0luZGV4LCAwLCBiYXRjaElkKVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGdyb3VwRGF0YS5sYXN0QmF0Y2hJZHMucHVzaChiYXRjaElkKSAvLyBuZXcgYmF0Y2ggaXMgb2xkZXN0IG9mIGFsbCBzdG9yZWQgYmF0Y2hlc1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGdyb3VwRGF0YS5sYXN0QmF0Y2hJZHMubGVuZ3RoID4gMTAwMCkge1xuXHRcdFx0XHRcdGdyb3VwRGF0YS5sYXN0QmF0Y2hJZHMgPSBncm91cERhdGEubGFzdEJhdGNoSWRzLnNsaWNlKDAsIDEwMDApXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gdHJhbnNhY3Rpb24ucHV0KEdyb3VwRGF0YU9TLCBncm91cElkLCBncm91cERhdGEpXG5cdFx0XHR9XG5cdFx0fSlcblx0fVxuXG5cdF9jYW5jZWxJZk5lZWRlZCgpIHtcblx0XHRpZiAodGhpcy5faXNTdG9wcGVkKSB7XG5cdFx0XHR0aHJvdyBuZXcgQ2FuY2VsbGVkRXJyb3IoXCJpbmRleGluZyBjYW5jZWxsZWRcIilcblx0XHR9XG5cdH1cblxuXHRyZXNldFN0YXRzKCkge1xuXHRcdHRoaXMuX3N0YXRzID0ge1xuXHRcdFx0aW5kZXhpbmdUaW1lOiAwLFxuXHRcdFx0c3RvcmFnZVRpbWU6IDAsXG5cdFx0XHRwcmVwYXJpbmdUaW1lOiAwLFxuXHRcdFx0bWFpbGNvdW50OiAwLFxuXHRcdFx0c3RvcmVkQnl0ZXM6IDAsXG5cdFx0XHRlbmNyeXB0aW9uVGltZTogMCxcblx0XHRcdHdyaXRlUmVxdWVzdHM6IDAsXG5cdFx0XHRsYXJnZXN0Q29sdW1uOiAwLFxuXHRcdFx0d29yZHM6IDAsXG5cdFx0XHRpbmRleGVkQnl0ZXM6IDAsXG5cdFx0fVxuXHR9XG5cblx0cHJpbnRTdGF0dXMoKSB7XG5cdFx0Y29uc3QgdG90YWxUaW1lID0gdGhpcy5fc3RhdHMuc3RvcmFnZVRpbWUgKyB0aGlzLl9zdGF0cy5wcmVwYXJpbmdUaW1lXG5cdFx0Y29uc3Qgc3RhdHNXaXRoRG93bmxvYWRpbmcgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLl9zdGF0cywge1xuXHRcdFx0ZG93bmxvYWRpbmdUaW1lOiB0aGlzLl9zdGF0cy5wcmVwYXJpbmdUaW1lIC0gdGhpcy5fc3RhdHMuaW5kZXhpbmdUaW1lIC0gdGhpcy5fc3RhdHMuZW5jcnlwdGlvblRpbWUsXG5cdFx0fSlcblx0XHRjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShzdGF0c1dpdGhEb3dubG9hZGluZyksIFwidG90YWwgdGltZTogXCIsIHRvdGFsVGltZSlcblx0fVxufVxuIiwiaW1wb3J0IHR5cGUgeyBEYiB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9zZWFyY2gvU2VhcmNoVHlwZXMuanNcIlxuaW1wb3J0IHsgc3RyaW5nVG9VdGY4VWludDhBcnJheSwgVHlwZVJlZiwgdXRmOFVpbnQ4QXJyYXlUb1N0cmluZyB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHsgYWVzRGVjcnlwdCwgYWVzMjU2RW5jcnlwdFNlYXJjaEluZGV4RW50cnksIHVuYXV0aGVudGljYXRlZEFlc0RlY3J5cHQgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLWNyeXB0b1wiXG5pbXBvcnQgeyBTZWFyY2hUZXJtU3VnZ2VzdGlvbnNPUyB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9zZWFyY2gvSW5kZXhUYWJsZXMuanNcIlxuXG5leHBvcnQgdHlwZSBTdWdnZXN0aW9uc1R5cGUgPSBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT5cblxuZXhwb3J0IGNsYXNzIFN1Z2dlc3Rpb25GYWNhZGU8VD4ge1xuXHRfZGI6IERiXG5cdHR5cGU6IFR5cGVSZWY8VD5cblx0X3N1Z2dlc3Rpb25zOiBTdWdnZXN0aW9uc1R5cGVcblxuXHRjb25zdHJ1Y3Rvcih0eXBlOiBUeXBlUmVmPFQ+LCBkYjogRGIpIHtcblx0XHR0aGlzLnR5cGUgPSB0eXBlXG5cdFx0dGhpcy5fZGIgPSBkYlxuXHRcdHRoaXMuX3N1Z2dlc3Rpb25zID0ge31cblx0fVxuXG5cdGxvYWQoKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0cmV0dXJuIHRoaXMuX2RiLmluaXRpYWxpemVkLnRoZW4oKCkgPT4ge1xuXHRcdFx0cmV0dXJuIHRoaXMuX2RiLmRiRmFjYWRlLmNyZWF0ZVRyYW5zYWN0aW9uKHRydWUsIFtTZWFyY2hUZXJtU3VnZ2VzdGlvbnNPU10pLnRoZW4oKHQpID0+IHtcblx0XHRcdFx0cmV0dXJuIHQuZ2V0KFNlYXJjaFRlcm1TdWdnZXN0aW9uc09TLCB0aGlzLnR5cGUudHlwZS50b0xvd2VyQ2FzZSgpKS50aGVuKChlbmNTdWdnZXN0aW9ucykgPT4ge1xuXHRcdFx0XHRcdGlmIChlbmNTdWdnZXN0aW9ucykge1xuXHRcdFx0XHRcdFx0dGhpcy5fc3VnZ2VzdGlvbnMgPSBKU09OLnBhcnNlKHV0ZjhVaW50OEFycmF5VG9TdHJpbmcodW5hdXRoZW50aWNhdGVkQWVzRGVjcnlwdCh0aGlzLl9kYi5rZXksIGVuY1N1Z2dlc3Rpb25zLCB0cnVlKSkpXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHRoaXMuX3N1Z2dlc3Rpb25zID0ge31cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHR9KVxuXHRcdH0pXG5cdH1cblxuXHRhZGRTdWdnZXN0aW9ucyh3b3Jkczogc3RyaW5nW10pOiB2b2lkIHtcblx0XHRmb3IgKGNvbnN0IHdvcmQgb2Ygd29yZHMpIHtcblx0XHRcdGlmICh3b3JkLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0bGV0IGtleSA9IHdvcmQuY2hhckF0KDApXG5cblx0XHRcdFx0aWYgKHRoaXMuX3N1Z2dlc3Rpb25zW2tleV0pIHtcblx0XHRcdFx0XHRsZXQgZXhpc3RpbmdWYWx1ZXMgPSB0aGlzLl9zdWdnZXN0aW9uc1trZXldXG5cblx0XHRcdFx0XHRpZiAoZXhpc3RpbmdWYWx1ZXMuaW5kZXhPZih3b3JkKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRcdGxldCBpbnNlcnRJbmRleCA9IGV4aXN0aW5nVmFsdWVzLmZpbmRJbmRleCgodikgPT4gd29yZCA8IHYpXG5cblx0XHRcdFx0XHRcdGlmIChpbnNlcnRJbmRleCA9PT0gLTEpIHtcblx0XHRcdFx0XHRcdFx0ZXhpc3RpbmdWYWx1ZXMucHVzaCh3b3JkKVxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0ZXhpc3RpbmdWYWx1ZXMuc3BsaWNlKGluc2VydEluZGV4LCAwLCB3b3JkKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aGlzLl9zdWdnZXN0aW9uc1trZXldID0gW3dvcmRdXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRnZXRTdWdnZXN0aW9ucyh3b3JkOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG5cdFx0aWYgKHdvcmQubGVuZ3RoID4gMCkge1xuXHRcdFx0bGV0IGtleSA9IHdvcmQuY2hhckF0KDApXG5cdFx0XHRsZXQgcmVzdWx0ID0gdGhpcy5fc3VnZ2VzdGlvbnNba2V5XVxuXHRcdFx0cmV0dXJuIHJlc3VsdCA/IHJlc3VsdC5maWx0ZXIoKHIpID0+IHIuc3RhcnRzV2l0aCh3b3JkKSkgOiBbXVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gW11cblx0XHR9XG5cdH1cblxuXHRzdG9yZSgpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRyZXR1cm4gdGhpcy5fZGIuaW5pdGlhbGl6ZWQudGhlbigoKSA9PiB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fZGIuZGJGYWNhZGUuY3JlYXRlVHJhbnNhY3Rpb24oZmFsc2UsIFtTZWFyY2hUZXJtU3VnZ2VzdGlvbnNPU10pLnRoZW4oKHQpID0+IHtcblx0XHRcdFx0bGV0IGVuY1N1Z2dlc3Rpb25zID0gYWVzMjU2RW5jcnlwdFNlYXJjaEluZGV4RW50cnkodGhpcy5fZGIua2V5LCBzdHJpbmdUb1V0ZjhVaW50OEFycmF5KEpTT04uc3RyaW5naWZ5KHRoaXMuX3N1Z2dlc3Rpb25zKSkpXG5cdFx0XHRcdHQucHV0KFNlYXJjaFRlcm1TdWdnZXN0aW9uc09TLCB0aGlzLnR5cGUudHlwZS50b0xvd2VyQ2FzZSgpLCBlbmNTdWdnZXN0aW9ucylcblx0XHRcdFx0cmV0dXJuIHQud2FpdCgpXG5cdFx0XHR9KVxuXHRcdH0pXG5cdH1cbn1cbiIsIi8vQGJ1bmRsZUludG86Y29tbW9uLW1pblxuXG5pbXBvcnQgeyBUdXRhbm90YUVycm9yIH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS1lcnJvclwiXG5cbmV4cG9ydCBjbGFzcyBNZW1iZXJzaGlwUmVtb3ZlZEVycm9yIGV4dGVuZHMgVHV0YW5vdGFFcnJvciB7XG5cdGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZykge1xuXHRcdHN1cGVyKFwiTWVtYmVyc2hpcFJlbW92ZWRFcnJvclwiLCBtZXNzYWdlKVxuXHR9XG59XG4iLCJpbXBvcnQgeyBhc3NlcnRXb3JrZXJPck5vZGUgfSBmcm9tIFwiLi4vLi4vY29tbW9uL0VudlwiXG5cbmFzc2VydFdvcmtlck9yTm9kZSgpXG5cbmV4cG9ydCBmdW5jdGlvbiBkZWxldGVPYmplY3RTdG9yZXMoZGI6IElEQkRhdGFiYXNlLCAuLi5vc3M6IHN0cmluZ1tdKSB7XG5cdGZvciAobGV0IG9zIG9mIG9zcykge1xuXHRcdHRyeSB7XG5cdFx0XHRkYi5kZWxldGVPYmplY3RTdG9yZShvcylcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRjb25zb2xlLndhcm4oXCJFcnJvciB3aGlsZSBkZWxldGluZyBvbGQgb3NcIiwgb3MsIFwiaWdub3JpbmdcIiwgZSlcblx0XHR9XG5cdH1cbn1cbiIsImltcG9ydCB7XG5cdEVOVElUWV9FVkVOVF9CQVRDSF9UVExfREFZUyxcblx0Z2V0TWVtYmVyc2hpcEdyb3VwVHlwZSxcblx0R3JvdXBUeXBlLFxuXHROT1RISU5HX0lOREVYRURfVElNRVNUQU1QLFxuXHRPcGVyYXRpb25UeXBlLFxufSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vVHV0YW5vdGFDb25zdGFudHMuanNcIlxuaW1wb3J0IHsgQ29ubmVjdGlvbkVycm9yLCBOb3RBdXRob3JpemVkRXJyb3IsIE5vdEZvdW5kRXJyb3IgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vZXJyb3IvUmVzdEVycm9yLmpzXCJcbmltcG9ydCB0eXBlIHsgRW50aXR5VXBkYXRlLCBHcm91cE1lbWJlcnNoaXAsIFVzZXIgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9lbnRpdGllcy9zeXMvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgRW50aXR5RXZlbnRCYXRjaCwgRW50aXR5RXZlbnRCYXRjaFR5cGVSZWYsIFVzZXJUeXBlUmVmIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvZW50aXRpZXMvc3lzL1R5cGVSZWZzLmpzXCJcbmltcG9ydCB0eXBlIHsgRGF0YWJhc2VFbnRyeSwgRGJLZXksIERiVHJhbnNhY3Rpb24gfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvc2VhcmNoL0RiRmFjYWRlLmpzXCJcbmltcG9ydCB7IGI2NFVzZXJJZEhhc2gsIERiRmFjYWRlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL3NlYXJjaC9EYkZhY2FkZS5qc1wiXG5pbXBvcnQge1xuXHRhc3NlcnROb3ROdWxsLFxuXHRjb250YWlucyxcblx0ZGF5c1RvTWlsbGlzLFxuXHRkZWZlcixcblx0RGVmZXJyZWRPYmplY3QsXG5cdGRvd25jYXN0LFxuXHRnZXRGcm9tTWFwLFxuXHRpc05vdE51bGwsXG5cdGlzU2FtZVR5cGVSZWYsXG5cdGlzU2FtZVR5cGVSZWZCeUF0dHIsXG5cdG1pbGxpc1RvRGF5cyxcblx0bmV2ZXJOdWxsLFxuXHRub09wLFxuXHRvZkNsYXNzLFxuXHRwcm9taXNlTWFwLFxuXHRUeXBlUmVmLFxufSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB7XG5cdGZpcnN0QmlnZ2VyVGhhblNlY29uZCxcblx0R0VORVJBVEVEX01BWF9JRCxcblx0Z2VuZXJhdGVkSWRUb1RpbWVzdGFtcCxcblx0Z2V0RWxlbWVudElkLFxuXHRpc1NhbWVJZCxcblx0dGltZXN0YW1wVG9HZW5lcmF0ZWRJZCxcbn0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL3V0aWxzL0VudGl0eVV0aWxzLmpzXCJcbmltcG9ydCB7IF9jcmVhdGVOZXdJbmRleFVwZGF0ZSwgZmlsdGVySW5kZXhNZW1iZXJzaGlwcywgbWFya0VuZCwgbWFya1N0YXJ0LCB0eXBlUmVmVG9UeXBlSW5mbyB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9zZWFyY2gvSW5kZXhVdGlscy5qc1wiXG5pbXBvcnQgdHlwZSB7IERiLCBHcm91cERhdGEgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvc2VhcmNoL1NlYXJjaFR5cGVzLmpzXCJcbmltcG9ydCB7IEluZGV4aW5nRXJyb3JSZWFzb24gfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvc2VhcmNoL1NlYXJjaFR5cGVzLmpzXCJcbmltcG9ydCB7IENvbnRhY3RJbmRleGVyIH0gZnJvbSBcIi4vQ29udGFjdEluZGV4ZXIuanNcIlxuaW1wb3J0IHsgQ29udGFjdExpc3QsIENvbnRhY3RMaXN0VHlwZVJlZiwgQ29udGFjdFR5cGVSZWYsIEltcG9ydE1haWxTdGF0ZVR5cGVSZWYsIE1haWxUeXBlUmVmIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvZW50aXRpZXMvdHV0YW5vdGEvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgTWFpbEluZGV4ZXIgfSBmcm9tIFwiLi9NYWlsSW5kZXhlci5qc1wiXG5pbXBvcnQgeyBJbmRleGVyQ29yZSB9IGZyb20gXCIuL0luZGV4ZXJDb3JlLmpzXCJcbmltcG9ydCB0eXBlIHsgRW50aXR5UmVzdENsaWVudCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9yZXN0L0VudGl0eVJlc3RDbGllbnQuanNcIlxuaW1wb3J0IHsgT3V0T2ZTeW5jRXJyb3IgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vZXJyb3IvT3V0T2ZTeW5jRXJyb3IuanNcIlxuaW1wb3J0IHsgU3VnZ2VzdGlvbkZhY2FkZSB9IGZyb20gXCIuL1N1Z2dlc3Rpb25GYWNhZGUuanNcIlxuaW1wb3J0IHsgRGJFcnJvciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9lcnJvci9EYkVycm9yLmpzXCJcbmltcG9ydCB0eXBlIHsgUXVldWVkQmF0Y2ggfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvRXZlbnRRdWV1ZS5qc1wiXG5pbXBvcnQgeyBFdmVudFF1ZXVlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL0V2ZW50UXVldWUuanNcIlxuaW1wb3J0IHsgQ2FuY2VsbGVkRXJyb3IgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vZXJyb3IvQ2FuY2VsbGVkRXJyb3IuanNcIlxuaW1wb3J0IHsgTWVtYmVyc2hpcFJlbW92ZWRFcnJvciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9lcnJvci9NZW1iZXJzaGlwUmVtb3ZlZEVycm9yLmpzXCJcbmltcG9ydCB0eXBlIHsgQnJvd3NlckRhdGEgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21pc2MvQ2xpZW50Q29uc3RhbnRzLmpzXCJcbmltcG9ydCB7IEludmFsaWREYXRhYmFzZVN0YXRlRXJyb3IgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vZXJyb3IvSW52YWxpZERhdGFiYXNlU3RhdGVFcnJvci5qc1wiXG5pbXBvcnQgeyBMb2NhbFRpbWVEYXRlUHJvdmlkZXIgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvRGF0ZVByb3ZpZGVyLmpzXCJcbmltcG9ydCB7IEVudGl0eUNsaWVudCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9FbnRpdHlDbGllbnQuanNcIlxuaW1wb3J0IHsgZGVsZXRlT2JqZWN0U3RvcmVzIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL3V0aWxzL0RiVXRpbHMuanNcIlxuaW1wb3J0IHtcblx0YWVzMjU2RW5jcnlwdFNlYXJjaEluZGV4RW50cnksXG5cdGFlczI1NlJhbmRvbUtleSxcblx0QWVzS2V5LFxuXHRCaXRBcnJheSxcblx0ZGVjcnlwdEtleSxcblx0SVZfQllURV9MRU5HVEgsXG5cdHJhbmRvbSxcblx0dW5hdXRoZW50aWNhdGVkQWVzRGVjcnlwdCxcbn0gZnJvbSBcIkB0dXRhby90dXRhbm90YS1jcnlwdG9cIlxuaW1wb3J0IHsgRGVmYXVsdEVudGl0eVJlc3RDYWNoZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9yZXN0L0RlZmF1bHRFbnRpdHlSZXN0Q2FjaGUuanNcIlxuaW1wb3J0IHsgQ2FjaGVJbmZvIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL2ZhY2FkZXMvTG9naW5GYWNhZGUuanNcIlxuaW1wb3J0IHsgSW5mb01lc3NhZ2VIYW5kbGVyIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvSW5mb01lc3NhZ2VIYW5kbGVyLmpzXCJcbmltcG9ydCB7XG5cdEVsZW1lbnREYXRhT1MsXG5cdEVuY3J5cHRlZEluZGV4ZXJNZXRhRGF0YSxcblx0R3JvdXBEYXRhT1MsXG5cdE1ldGFkYXRhLFxuXHRNZXRhRGF0YU9TLFxuXHRTZWFyY2hJbmRleE1ldGFEYXRhT1MsXG5cdFNlYXJjaEluZGV4T1MsXG5cdFNlYXJjaEluZGV4V29yZHNJbmRleCxcblx0U2VhcmNoVGVybVN1Z2dlc3Rpb25zT1MsXG59IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9zZWFyY2gvSW5kZXhUYWJsZXMuanNcIlxuaW1wb3J0IHsgTWFpbEZhY2FkZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9mYWNhZGVzL2xhenkvTWFpbEZhY2FkZS5qc1wiXG5pbXBvcnQgeyBLZXlMb2FkZXJGYWNhZGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvZmFjYWRlcy9LZXlMb2FkZXJGYWNhZGUuanNcIlxuaW1wb3J0IHsgZ2V0SW5kZXhlck1ldGFEYXRhLCB1cGRhdGVFbmNyeXB0aW9uTWV0YWRhdGEgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvZmFjYWRlcy9sYXp5L0NvbmZpZ3VyYXRpb25EYXRhYmFzZS5qc1wiXG5pbXBvcnQgeyBlbmNyeXB0S2V5V2l0aFZlcnNpb25lZEtleSwgVmVyc2lvbmVkS2V5IH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL2NyeXB0by9DcnlwdG9XcmFwcGVyLmpzXCJcblxuZXhwb3J0IHR5cGUgSW5pdFBhcmFtcyA9IHtcblx0dXNlcjogVXNlclxuXHRrZXlMb2FkZXJGYWNhZGU6IEtleUxvYWRlckZhY2FkZVxufVxuXG5jb25zdCBEQl9WRVJTSU9OOiBudW1iZXIgPSAzXG5cbmludGVyZmFjZSBJbmRleGVySW5pdFBhcmFtcyB7XG5cdHVzZXI6IFVzZXJcblx0a2V5TG9hZGVyRmFjYWRlOiBLZXlMb2FkZXJGYWNhZGVcblx0cmV0cnlPbkVycm9yPzogYm9vbGVhblxuXHRjYWNoZUluZm8/OiBDYWNoZUluZm9cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5ld1NlYXJjaEluZGV4REIoKTogRGJGYWNhZGUge1xuXHRyZXR1cm4gbmV3IERiRmFjYWRlKERCX1ZFUlNJT04sIChldmVudCwgZGIpID0+IHtcblx0XHRpZiAoZXZlbnQub2xkVmVyc2lvbiAhPT0gREJfVkVSU0lPTiAmJiBldmVudC5vbGRWZXJzaW9uICE9PSAwKSB7XG5cdFx0XHRkZWxldGVPYmplY3RTdG9yZXMoZGIsIFNlYXJjaEluZGV4T1MsIEVsZW1lbnREYXRhT1MsIE1ldGFEYXRhT1MsIEdyb3VwRGF0YU9TLCBTZWFyY2hUZXJtU3VnZ2VzdGlvbnNPUywgU2VhcmNoSW5kZXhNZXRhRGF0YU9TKVxuXHRcdH1cblxuXHRcdGRiLmNyZWF0ZU9iamVjdFN0b3JlKFNlYXJjaEluZGV4T1MsIHtcblx0XHRcdGF1dG9JbmNyZW1lbnQ6IHRydWUsXG5cdFx0fSlcblx0XHRjb25zdCBtZXRhT1MgPSBkYi5jcmVhdGVPYmplY3RTdG9yZShTZWFyY2hJbmRleE1ldGFEYXRhT1MsIHtcblx0XHRcdGF1dG9JbmNyZW1lbnQ6IHRydWUsXG5cdFx0XHRrZXlQYXRoOiBcImlkXCIsXG5cdFx0fSlcblx0XHRkYi5jcmVhdGVPYmplY3RTdG9yZShFbGVtZW50RGF0YU9TKVxuXHRcdGRiLmNyZWF0ZU9iamVjdFN0b3JlKE1ldGFEYXRhT1MpXG5cdFx0ZGIuY3JlYXRlT2JqZWN0U3RvcmUoR3JvdXBEYXRhT1MpXG5cdFx0ZGIuY3JlYXRlT2JqZWN0U3RvcmUoU2VhcmNoVGVybVN1Z2dlc3Rpb25zT1MpXG5cdFx0bWV0YU9TLmNyZWF0ZUluZGV4KFNlYXJjaEluZGV4V29yZHNJbmRleCwgXCJ3b3JkXCIsIHtcblx0XHRcdHVuaXF1ZTogdHJ1ZSxcblx0XHR9KVxuXHR9KVxufVxuXG5leHBvcnQgY2xhc3MgSW5kZXhlciB7XG5cdHJlYWRvbmx5IGRiOiBEYlxuXHRwcml2YXRlIHJlYWRvbmx5IF9kYkluaXRpYWxpemVkRGVmZXJyZWRPYmplY3Q6IERlZmVycmVkT2JqZWN0PHZvaWQ+XG5cdHByaXZhdGUgX2luaXRQYXJhbXMhOiBJbml0UGFyYW1zXG5cdHJlYWRvbmx5IF9jb250YWN0OiBDb250YWN0SW5kZXhlclxuXHRyZWFkb25seSBfbWFpbDogTWFpbEluZGV4ZXJcblxuXHQvKipcblx0ICogTGFzdCBiYXRjaCBpZCBwZXIgZ3JvdXAgZnJvbSBpbml0aWFsIGxvYWRpbmcuXG5cdCAqIEluIGNhc2Ugd2UgZ2V0IGR1cGxpY2F0ZSBldmVudHMgZnJvbSBsb2FkaW5nIGFuZCB3ZWJzb2NrZXQgd2Ugd2FudCB0byBmaWx0ZXIgdGhlbSBvdXQgdG8gYXZvaWQgcHJvY2Vzc2luZyBkdXBsaWNhdGVzLlxuXHQgKiAqL1xuXHRfaW5pdGlhbGx5TG9hZGVkQmF0Y2hJZHNQZXJHcm91cDogTWFwPElkLCBJZD5cblxuXHQvKipcblx0ICogUXVldWUgd2hpY2ggZ2V0cyBhbGwgdGhlIHdlYnNvY2tldCBldmVudHMgYW5kIGRpc3BhdGNoZXMgdGhlbSB0byB0aGUgY29yZS4gSXQgaXMgcGF1c2VkIHVudGlsIHdlIGxvYWQgaW5pdGlhbCBldmVudHMgdG8gYXZvaWRcblx0ICogcHV0dGluZyBldmVudHMgZnJvbSB3ZWJzb2NrZXQgYmVmb3JlIGluaXRpYWwgZXZlbnRzLlxuXHQgKi9cblx0X3JlYWx0aW1lRXZlbnRRdWV1ZTogRXZlbnRRdWV1ZVxuXHRfY29yZTogSW5kZXhlckNvcmVcblx0X2VudGl0eTogRW50aXR5Q2xpZW50XG5cdF9lbnRpdHlSZXN0Q2xpZW50OiBFbnRpdHlSZXN0Q2xpZW50XG5cdF9pbmRleGVkR3JvdXBJZHM6IEFycmF5PElkPlxuXG5cdGNvbnN0cnVjdG9yKFxuXHRcdGVudGl0eVJlc3RDbGllbnQ6IEVudGl0eVJlc3RDbGllbnQsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBpbmZvTWVzc2FnZUhhbmRsZXI6IEluZm9NZXNzYWdlSGFuZGxlcixcblx0XHRicm93c2VyRGF0YTogQnJvd3NlckRhdGEsXG5cdFx0ZGVmYXVsdEVudGl0eVJlc3RDYWNoZTogRGVmYXVsdEVudGl0eVJlc3RDYWNoZSxcblx0XHRtYWtlTWFpbEluZGV4ZXI6IChjb3JlOiBJbmRleGVyQ29yZSwgZGI6IERiKSA9PiBNYWlsSW5kZXhlcixcblx0KSB7XG5cdFx0bGV0IGRlZmVycmVkID0gZGVmZXI8dm9pZD4oKVxuXHRcdHRoaXMuX2RiSW5pdGlhbGl6ZWREZWZlcnJlZE9iamVjdCA9IGRlZmVycmVkXG5cdFx0dGhpcy5kYiA9IHtcblx0XHRcdGRiRmFjYWRlOiBuZXdTZWFyY2hJbmRleERCKCksXG5cdFx0XHRrZXk6IGRvd25jYXN0PEJpdEFycmF5PihudWxsKSxcblx0XHRcdGl2OiBkb3duY2FzdDxVaW50OEFycmF5PihudWxsKSxcblx0XHRcdGluaXRpYWxpemVkOiBkZWZlcnJlZC5wcm9taXNlLFxuXHRcdH1cblx0XHQvLyBjb3JyZWN0bHkgaW5pdGlhbGl6ZWQgZHVyaW5nIGluaXQoKVxuXHRcdHRoaXMuX2NvcmUgPSBuZXcgSW5kZXhlckNvcmUodGhpcy5kYiwgbmV3IEV2ZW50UXVldWUoXCJpbmRleGVyX2NvcmVcIiwgdHJ1ZSwgKGJhdGNoKSA9PiB0aGlzLl9wcm9jZXNzRW50aXR5RXZlbnRzKGJhdGNoKSksIGJyb3dzZXJEYXRhKVxuXHRcdHRoaXMuX2VudGl0eVJlc3RDbGllbnQgPSBlbnRpdHlSZXN0Q2xpZW50XG5cdFx0dGhpcy5fZW50aXR5ID0gbmV3IEVudGl0eUNsaWVudChkZWZhdWx0RW50aXR5UmVzdENhY2hlKVxuXHRcdHRoaXMuX2NvbnRhY3QgPSBuZXcgQ29udGFjdEluZGV4ZXIodGhpcy5fY29yZSwgdGhpcy5kYiwgdGhpcy5fZW50aXR5LCBuZXcgU3VnZ2VzdGlvbkZhY2FkZShDb250YWN0VHlwZVJlZiwgdGhpcy5kYikpXG5cdFx0dGhpcy5fbWFpbCA9IG1ha2VNYWlsSW5kZXhlcih0aGlzLl9jb3JlLCB0aGlzLmRiKVxuXHRcdHRoaXMuX2luZGV4ZWRHcm91cElkcyA9IFtdXG5cdFx0dGhpcy5faW5pdGlhbGx5TG9hZGVkQmF0Y2hJZHNQZXJHcm91cCA9IG5ldyBNYXAoKVxuXHRcdHRoaXMuX3JlYWx0aW1lRXZlbnRRdWV1ZSA9IG5ldyBFdmVudFF1ZXVlKFwiaW5kZXhlcl9yZWFsdGltZVwiLCBmYWxzZSwgKG5leHRFbGVtZW50OiBRdWV1ZWRCYXRjaCkgPT4ge1xuXHRcdFx0Ly8gRHVyaW5nIGluaXRpYWwgbG9hZGluZyB3ZSByZW1lbWJlciB0aGUgbGFzdCBiYXRjaCB3ZSBsb2FkZWRcblx0XHRcdC8vIHNvIGlmIHdlIGdldCB1cGRhdGVzIGZyb20gRXZlbnRCdXNDbGllbnQgaGVyZSBmb3IgdGhpbmdzIHRoYXQgYXJlIGFscmVhZHkgbG9hZGVkIHdlIGRpc2NhcmQgdGhlbVxuXHRcdFx0Y29uc3QgbG9hZGVkSWRGb3JHcm91cCA9IHRoaXMuX2luaXRpYWxseUxvYWRlZEJhdGNoSWRzUGVyR3JvdXAuZ2V0KG5leHRFbGVtZW50Lmdyb3VwSWQpXG5cblx0XHRcdGlmIChsb2FkZWRJZEZvckdyb3VwID09IG51bGwgfHwgZmlyc3RCaWdnZXJUaGFuU2Vjb25kKG5leHRFbGVtZW50LmJhdGNoSWQsIGxvYWRlZElkRm9yR3JvdXApKSB7XG5cdFx0XHRcdHRoaXMuX2NvcmUuYWRkQmF0Y2hlc1RvUXVldWUoW25leHRFbGVtZW50XSlcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG5cdFx0fSlcblxuXHRcdHRoaXMuX3JlYWx0aW1lRXZlbnRRdWV1ZS5wYXVzZSgpXG5cdH1cblxuXHQvKipcblx0ICogT3BlbnMgYSBuZXcgRGJGYWNhZGUgYW5kIGluaXRpYWxpemVzIHRoZSBtZXRhZGF0YSBpZiBpdCBpcyBub3QgdGhlcmUgeWV0XG5cdCAqL1xuXHRhc3luYyBpbml0KHsgdXNlciwga2V5TG9hZGVyRmFjYWRlLCByZXRyeU9uRXJyb3IsIGNhY2hlSW5mbyB9OiBJbmRleGVySW5pdFBhcmFtcyk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHRoaXMuX2luaXRQYXJhbXMgPSB7XG5cdFx0XHR1c2VyLFxuXHRcdFx0a2V5TG9hZGVyRmFjYWRlLFxuXHRcdH1cblxuXHRcdHRyeSB7XG5cdFx0XHRhd2FpdCB0aGlzLmRiLmRiRmFjYWRlLm9wZW4odGhpcy5nZXREYklkKHVzZXIpKVxuXHRcdFx0Y29uc3QgbWV0YURhdGEgPSBhd2FpdCBnZXRJbmRleGVyTWV0YURhdGEodGhpcy5kYi5kYkZhY2FkZSwgTWV0YURhdGFPUylcblx0XHRcdGlmIChtZXRhRGF0YSA9PSBudWxsKSB7XG5cdFx0XHRcdGNvbnN0IHVzZXJHcm91cEtleSA9IGtleUxvYWRlckZhY2FkZS5nZXRDdXJyZW50U3ltVXNlckdyb3VwS2V5KClcblx0XHRcdFx0Ly8gZGF0YWJhc2Ugd2FzIG9wZW5lZCBmb3IgdGhlIGZpcnN0IHRpbWUgLSBjcmVhdGUgbmV3IHRhYmxlc1xuXHRcdFx0XHRhd2FpdCB0aGlzLmNyZWF0ZUluZGV4VGFibGVzKHVzZXIsIHVzZXJHcm91cEtleSlcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IHVzZXJHcm91cEtleSA9IGF3YWl0IGtleUxvYWRlckZhY2FkZS5sb2FkU3ltVXNlckdyb3VwS2V5KG1ldGFEYXRhLnVzZXJHcm91cEtleVZlcnNpb24pXG5cdFx0XHRcdGF3YWl0IHRoaXMubG9hZEluZGV4VGFibGVzKHVzZXIsIHVzZXJHcm91cEtleSwgbWV0YURhdGEpXG5cdFx0XHR9XG5cblx0XHRcdGF3YWl0IHRoaXMuaW5mb01lc3NhZ2VIYW5kbGVyLm9uU2VhcmNoSW5kZXhTdGF0ZVVwZGF0ZSh7XG5cdFx0XHRcdGluaXRpYWxpemluZzogZmFsc2UsXG5cdFx0XHRcdG1haWxJbmRleEVuYWJsZWQ6IHRoaXMuX21haWwubWFpbEluZGV4aW5nRW5hYmxlZCxcblx0XHRcdFx0cHJvZ3Jlc3M6IDAsXG5cdFx0XHRcdGN1cnJlbnRNYWlsSW5kZXhUaW1lc3RhbXA6IHRoaXMuX21haWwuY3VycmVudEluZGV4VGltZXN0YW1wLFxuXHRcdFx0XHRhaW1lZE1haWxJbmRleFRpbWVzdGFtcDogdGhpcy5fbWFpbC5jdXJyZW50SW5kZXhUaW1lc3RhbXAsXG5cdFx0XHRcdGluZGV4ZWRNYWlsQ291bnQ6IDAsXG5cdFx0XHRcdGZhaWxlZEluZGV4aW5nVXBUbzogbnVsbCxcblx0XHRcdH0pXG5cblx0XHRcdHRoaXMuX2NvcmUuc3RhcnRQcm9jZXNzaW5nKClcblx0XHRcdGF3YWl0IHRoaXMuaW5kZXhPckxvYWRDb250YWN0TGlzdElmTmVlZGVkKHVzZXIsIGNhY2hlSW5mbylcblx0XHRcdGF3YWl0IHRoaXMuX21haWwubWFpbGJveEluZGV4aW5nUHJvbWlzZVxuXHRcdFx0YXdhaXQgdGhpcy5fbWFpbC5pbmRleE1haWxib3hlcyh1c2VyLCB0aGlzLl9tYWlsLmN1cnJlbnRJbmRleFRpbWVzdGFtcClcblx0XHRcdGNvbnN0IGdyb3VwSWRUb0V2ZW50QmF0Y2hlcyA9IGF3YWl0IHRoaXMuX2xvYWRQZXJzaXN0ZW50R3JvdXBEYXRhKHVzZXIpXG5cdFx0XHRhd2FpdCB0aGlzLl9sb2FkTmV3RW50aXRpZXMoZ3JvdXBJZFRvRXZlbnRCYXRjaGVzKS5jYXRjaChvZkNsYXNzKE91dE9mU3luY0Vycm9yLCAoZSkgPT4gdGhpcy5kaXNhYmxlTWFpbEluZGV4aW5nKCkpKVxuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdGlmIChyZXRyeU9uRXJyb3IgIT09IGZhbHNlICYmIChlIGluc3RhbmNlb2YgTWVtYmVyc2hpcFJlbW92ZWRFcnJvciB8fCBlIGluc3RhbmNlb2YgSW52YWxpZERhdGFiYXNlU3RhdGVFcnJvcikpIHtcblx0XHRcdFx0Ly8gaW4gY2FzZSBvZiBNZW1iZXJzaGlwUmVtb3ZlZEVycm9yIG1haWwgb3IgY29udGFjdCBncm91cCBoYXMgYmVlbiByZW1vdmVkIGZyb20gdXNlci5cblx0XHRcdFx0Ly8gaW4gY2FzZSBvZiBJbnZhbGlkRGF0YWJhc2VFcnJvciBubyBncm91cCBpZCBoYXMgYmVlbiBzdG9yZWQgdG8gdGhlIGRhdGFiYXNlLlxuXHRcdFx0XHQvLyBkaXNhYmxlIG1haWwgaW5kZXhpbmcgYW5kIGluaXQgaW5kZXggYWdhaW4gaW4gYm90aCBjYXNlcy5cblx0XHRcdFx0Ly8gZG8gbm90IHVzZSB0aGlzLmRpc2FibGVNYWlsSW5kZXhpbmcoKSBiZWNhdXNlIGRiLmluaXRpYWxpemVkIGlzIG5vdCB5ZXQgcmVzb2x2ZWQuXG5cdFx0XHRcdC8vIGluaXRpYWxpemVkIHByb21pc2Ugd2lsbCBiZSByZXNvbHZlZCBpbiB0aGlzLmluaXQgbGF0ZXIuXG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiZGlzYWJsZSBtYWlsIGluZGV4aW5nIGFuZCBpbml0IGFnYWluXCIsIGUpXG5cdFx0XHRcdHJldHVybiB0aGlzLl9yZUNyZWF0ZUluZGV4KClcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGF3YWl0IHRoaXMuaW5mb01lc3NhZ2VIYW5kbGVyLm9uU2VhcmNoSW5kZXhTdGF0ZVVwZGF0ZSh7XG5cdFx0XHRcdFx0aW5pdGlhbGl6aW5nOiBmYWxzZSxcblx0XHRcdFx0XHRtYWlsSW5kZXhFbmFibGVkOiB0aGlzLl9tYWlsLm1haWxJbmRleGluZ0VuYWJsZWQsXG5cdFx0XHRcdFx0cHJvZ3Jlc3M6IDAsXG5cdFx0XHRcdFx0Y3VycmVudE1haWxJbmRleFRpbWVzdGFtcDogdGhpcy5fbWFpbC5jdXJyZW50SW5kZXhUaW1lc3RhbXAsXG5cdFx0XHRcdFx0YWltZWRNYWlsSW5kZXhUaW1lc3RhbXA6IHRoaXMuX21haWwuY3VycmVudEluZGV4VGltZXN0YW1wLFxuXHRcdFx0XHRcdGluZGV4ZWRNYWlsQ291bnQ6IDAsXG5cdFx0XHRcdFx0ZmFpbGVkSW5kZXhpbmdVcFRvOiB0aGlzLl9tYWlsLmN1cnJlbnRJbmRleFRpbWVzdGFtcCxcblx0XHRcdFx0XHRlcnJvcjogZSBpbnN0YW5jZW9mIENvbm5lY3Rpb25FcnJvciA/IEluZGV4aW5nRXJyb3JSZWFzb24uQ29ubmVjdGlvbkxvc3QgOiBJbmRleGluZ0Vycm9yUmVhc29uLlVua25vd24sXG5cdFx0XHRcdH0pXG5cblx0XHRcdFx0dGhpcy5fZGJJbml0aWFsaXplZERlZmVycmVkT2JqZWN0LnJlamVjdChlKVxuXG5cdFx0XHRcdHRocm93IGVcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIGdldERiSWQodXNlcjogVXNlcikge1xuXHRcdHJldHVybiBiNjRVc2VySWRIYXNoKHVzZXIuX2lkKVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBpbmRleE9yTG9hZENvbnRhY3RMaXN0SWZOZWVkZWQodXNlcjogVXNlciwgY2FjaGVJbmZvOiBDYWNoZUluZm8gfCB1bmRlZmluZWQpIHtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgY29udGFjdExpc3Q6IENvbnRhY3RMaXN0ID0gYXdhaXQgdGhpcy5fZW50aXR5LmxvYWRSb290KENvbnRhY3RMaXN0VHlwZVJlZiwgdXNlci51c2VyR3JvdXAuZ3JvdXApXG5cdFx0XHRjb25zdCBpbmRleFRpbWVzdGFtcCA9IGF3YWl0IHRoaXMuX2NvbnRhY3QuZ2V0SW5kZXhUaW1lc3RhbXAoY29udGFjdExpc3QpXG5cdFx0XHRpZiAoaW5kZXhUaW1lc3RhbXAgPT09IE5PVEhJTkdfSU5ERVhFRF9USU1FU1RBTVApIHtcblx0XHRcdFx0YXdhaXQgdGhpcy5fY29udGFjdC5pbmRleEZ1bGxDb250YWN0TGlzdChjb250YWN0TGlzdClcblx0XHRcdH1cblx0XHRcdC8vSWYgd2UgZG8gbm90IGhhdmUgdG8gaW5kZXggdGhlIGNvbnRhY3QgbGlzdCB3ZSBtaWdodCBzdGlsbCBuZWVkIHRvIGRvd25sb2FkIGl0IHNvIHdlIGNhY2hlIGl0IGluIHRoZSBvZmZsaW5lIHN0b3JhZ2Vcblx0XHRcdGVsc2UgaWYgKGNhY2hlSW5mbz8uaXNOZXdPZmZsaW5lRGIpIHtcblx0XHRcdFx0YXdhaXQgdGhpcy5fZW50aXR5LmxvYWRBbGwoQ29udGFjdFR5cGVSZWYsIGNvbnRhY3RMaXN0LmNvbnRhY3RzKVxuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdC8vIGV4dGVybmFsIHVzZXJzIGhhdmUgbm8gY29udGFjdCBsaXN0LlxuXHRcdFx0aWYgKCEoZSBpbnN0YW5jZW9mIE5vdEZvdW5kRXJyb3IpKSB7XG5cdFx0XHRcdHRocm93IGVcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRlbmFibGVNYWlsSW5kZXhpbmcoKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0cmV0dXJuIHRoaXMuZGIuaW5pdGlhbGl6ZWQudGhlbigoKSA9PiB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fbWFpbC5lbmFibGVNYWlsSW5kZXhpbmcodGhpcy5faW5pdFBhcmFtcy51c2VyKS50aGVuKCgpID0+IHtcblx0XHRcdFx0Ly8gV2UgZG9uJ3QgaGF2ZSB0byBkaXNhYmxlIG1haWwgaW5kZXhpbmcgd2hlbiBpdCdzIHN0b3BwZWQgbm93XG5cdFx0XHRcdHRoaXMuX21haWwubWFpbGJveEluZGV4aW5nUHJvbWlzZS5jYXRjaChvZkNsYXNzKENhbmNlbGxlZEVycm9yLCBub09wKSlcblx0XHRcdH0pXG5cdFx0fSlcblx0fVxuXG5cdGFzeW5jIGRpc2FibGVNYWlsSW5kZXhpbmcoKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0YXdhaXQgdGhpcy5kYi5pbml0aWFsaXplZFxuXG5cdFx0aWYgKCF0aGlzLl9jb3JlLmlzU3RvcHBlZFByb2Nlc3NpbmcoKSkge1xuXHRcdFx0YXdhaXQgdGhpcy5kZWxldGVJbmRleCh0aGlzLl9pbml0UGFyYW1zLnVzZXIuX2lkKVxuXHRcdFx0YXdhaXQgdGhpcy5pbml0KHtcblx0XHRcdFx0dXNlcjogdGhpcy5faW5pdFBhcmFtcy51c2VyLFxuXHRcdFx0XHRrZXlMb2FkZXJGYWNhZGU6IHRoaXMuX2luaXRQYXJhbXMua2V5TG9hZGVyRmFjYWRlLFxuXHRcdFx0fSlcblx0XHR9XG5cdH1cblxuXHRhc3luYyBkZWxldGVJbmRleCh1c2VySWQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHRoaXMuX2NvcmUuc3RvcFByb2Nlc3NpbmcoKVxuXHRcdGF3YWl0IHRoaXMuX21haWwuZGlzYWJsZU1haWxJbmRleGluZyh1c2VySWQpXG5cdH1cblxuXHRleHRlbmRNYWlsSW5kZXgobmV3T2xkZXN0VGltZXN0YW1wOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRyZXR1cm4gdGhpcy5fbWFpbC5leHRlbmRJbmRleElmTmVlZGVkKHRoaXMuX2luaXRQYXJhbXMudXNlciwgbmV3T2xkZXN0VGltZXN0YW1wKVxuXHR9XG5cblx0Y2FuY2VsTWFpbEluZGV4aW5nKCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdHJldHVybiB0aGlzLl9tYWlsLmNhbmNlbE1haWxJbmRleGluZygpXG5cdH1cblxuXHRhZGRCYXRjaGVzVG9RdWV1ZShiYXRjaGVzOiBRdWV1ZWRCYXRjaFtdKSB7XG5cdFx0dGhpcy5fcmVhbHRpbWVFdmVudFF1ZXVlLmFkZEJhdGNoZXMoYmF0Y2hlcylcblx0fVxuXG5cdHN0YXJ0UHJvY2Vzc2luZygpIHtcblx0XHR0aGlzLl9jb3JlLnF1ZXVlLnN0YXJ0KClcblx0fVxuXG5cdGFzeW5jIG9uVmlzaWJpbGl0eUNoYW5nZWQodmlzaWJsZTogYm9vbGVhbik6IFByb21pc2U8dm9pZD4ge1xuXHRcdHRoaXMuX2NvcmUub25WaXNpYmlsaXR5Q2hhbmdlZCh2aXNpYmxlKVxuXHR9XG5cblx0X3JlQ3JlYXRlSW5kZXgoKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3QgbWFpbEluZGV4aW5nV2FzRW5hYmxlZCA9IHRoaXMuX21haWwubWFpbEluZGV4aW5nRW5hYmxlZFxuXHRcdHJldHVybiB0aGlzLl9tYWlsLmRpc2FibGVNYWlsSW5kZXhpbmcoYXNzZXJ0Tm90TnVsbCh0aGlzLl9pbml0UGFyYW1zLnVzZXIuX2lkKSkudGhlbigoKSA9PiB7XG5cdFx0XHQvLyBkbyBub3QgdHJ5IHRvIGluaXQgYWdhaW4gb24gZXJyb3Jcblx0XHRcdHJldHVybiB0aGlzLmluaXQoe1xuXHRcdFx0XHR1c2VyOiB0aGlzLl9pbml0UGFyYW1zLnVzZXIsXG5cdFx0XHRcdGtleUxvYWRlckZhY2FkZTogdGhpcy5faW5pdFBhcmFtcy5rZXlMb2FkZXJGYWNhZGUsXG5cdFx0XHRcdHJldHJ5T25FcnJvcjogZmFsc2UsXG5cdFx0XHR9KS50aGVuKCgpID0+IHtcblx0XHRcdFx0aWYgKG1haWxJbmRleGluZ1dhc0VuYWJsZWQpIHtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5lbmFibGVNYWlsSW5kZXhpbmcoKVxuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdH0pXG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIGNyZWF0ZUluZGV4VGFibGVzKHVzZXI6IFVzZXIsIHVzZXJHcm91cEtleTogVmVyc2lvbmVkS2V5KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0dGhpcy5kYi5rZXkgPSBhZXMyNTZSYW5kb21LZXkoKVxuXHRcdHRoaXMuZGIuaXYgPSByYW5kb20uZ2VuZXJhdGVSYW5kb21EYXRhKElWX0JZVEVfTEVOR1RIKVxuXHRcdGNvbnN0IGdyb3VwQmF0Y2hlcyA9IGF3YWl0IHRoaXMuX2xvYWRHcm91cERhdGEodXNlcilcblx0XHRjb25zdCB1c2VyRW5jRGJLZXkgPSBlbmNyeXB0S2V5V2l0aFZlcnNpb25lZEtleSh1c2VyR3JvdXBLZXksIHRoaXMuZGIua2V5KVxuXHRcdGNvbnN0IHRyYW5zYWN0aW9uID0gYXdhaXQgdGhpcy5kYi5kYkZhY2FkZS5jcmVhdGVUcmFuc2FjdGlvbihmYWxzZSwgW01ldGFEYXRhT1MsIEdyb3VwRGF0YU9TXSlcblx0XHRhd2FpdCB0cmFuc2FjdGlvbi5wdXQoTWV0YURhdGFPUywgTWV0YWRhdGEudXNlckVuY0RiS2V5LCB1c2VyRW5jRGJLZXkua2V5KVxuXHRcdGF3YWl0IHRyYW5zYWN0aW9uLnB1dChNZXRhRGF0YU9TLCBNZXRhZGF0YS5tYWlsSW5kZXhpbmdFbmFibGVkLCB0aGlzLl9tYWlsLm1haWxJbmRleGluZ0VuYWJsZWQpXG5cdFx0YXdhaXQgdHJhbnNhY3Rpb24ucHV0KE1ldGFEYXRhT1MsIE1ldGFkYXRhLmVuY0RiSXYsIGFlczI1NkVuY3J5cHRTZWFyY2hJbmRleEVudHJ5KHRoaXMuZGIua2V5LCB0aGlzLmRiLml2KSlcblx0XHRhd2FpdCB0cmFuc2FjdGlvbi5wdXQoTWV0YURhdGFPUywgTWV0YWRhdGEudXNlckdyb3VwS2V5VmVyc2lvbiwgdXNlckVuY0RiS2V5LmVuY3J5cHRpbmdLZXlWZXJzaW9uKVxuXHRcdGF3YWl0IHRyYW5zYWN0aW9uLnB1dChNZXRhRGF0YU9TLCBNZXRhZGF0YS5sYXN0RXZlbnRJbmRleFRpbWVNcywgdGhpcy5fZW50aXR5UmVzdENsaWVudC5nZXRSZXN0Q2xpZW50KCkuZ2V0U2VydmVyVGltZXN0YW1wTXMoKSlcblx0XHRhd2FpdCB0aGlzLl9pbml0R3JvdXBEYXRhKGdyb3VwQmF0Y2hlcywgdHJhbnNhY3Rpb24pXG5cdFx0YXdhaXQgdGhpcy5fdXBkYXRlSW5kZXhlZEdyb3VwcygpXG5cdFx0dGhpcy5fZGJJbml0aWFsaXplZERlZmVycmVkT2JqZWN0LnJlc29sdmUoKVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBsb2FkSW5kZXhUYWJsZXModXNlcjogVXNlciwgdXNlckdyb3VwS2V5OiBBZXNLZXksIG1ldGFEYXRhOiBFbmNyeXB0ZWRJbmRleGVyTWV0YURhdGEpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHR0aGlzLmRiLmtleSA9IGRlY3J5cHRLZXkodXNlckdyb3VwS2V5LCBtZXRhRGF0YS51c2VyRW5jRGJLZXkpXG5cdFx0dGhpcy5kYi5pdiA9IHVuYXV0aGVudGljYXRlZEFlc0RlY3J5cHQodGhpcy5kYi5rZXksIG5ldmVyTnVsbChtZXRhRGF0YS5lbmNEYkl2KSwgdHJ1ZSlcblx0XHR0aGlzLl9tYWlsLm1haWxJbmRleGluZ0VuYWJsZWQgPSBtZXRhRGF0YS5tYWlsSW5kZXhpbmdFbmFibGVkXG5cdFx0Y29uc3QgZ3JvdXBEaWZmID0gYXdhaXQgdGhpcy5fbG9hZEdyb3VwRGlmZih1c2VyKVxuXHRcdGF3YWl0IHRoaXMuX3VwZGF0ZUdyb3Vwcyh1c2VyLCBncm91cERpZmYpXG5cdFx0YXdhaXQgdGhpcy5fbWFpbC51cGRhdGVDdXJyZW50SW5kZXhUaW1lc3RhbXAodXNlcilcblx0XHRhd2FpdCB0aGlzLl91cGRhdGVJbmRleGVkR3JvdXBzKClcblx0XHR0aGlzLl9kYkluaXRpYWxpemVkRGVmZXJyZWRPYmplY3QucmVzb2x2ZSgpXG5cdFx0YXdhaXQgdGhpcy5fY29udGFjdC5zdWdnZXN0aW9uRmFjYWRlLmxvYWQoKVxuXHR9XG5cblx0YXN5bmMgX3VwZGF0ZUluZGV4ZWRHcm91cHMoKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3QgdDogRGJUcmFuc2FjdGlvbiA9IGF3YWl0IHRoaXMuZGIuZGJGYWNhZGUuY3JlYXRlVHJhbnNhY3Rpb24odHJ1ZSwgW0dyb3VwRGF0YU9TXSlcblx0XHRjb25zdCBpbmRleGVkR3JvdXBJZHMgPSBhd2FpdCBwcm9taXNlTWFwKGF3YWl0IHQuZ2V0QWxsKEdyb3VwRGF0YU9TKSwgKGdyb3VwRGF0YUVudHJ5OiBEYXRhYmFzZUVudHJ5KSA9PiBkb3duY2FzdDxJZD4oZ3JvdXBEYXRhRW50cnkua2V5KSlcblxuXHRcdGlmIChpbmRleGVkR3JvdXBJZHMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHQvLyB0cmllZCB0byBpbmRleCB0d2ljZSwgdGhpcyBpcyBwcm9iYWJseSBub3Qgb3VyIGZhdWx0XG5cdFx0XHRjb25zb2xlLmxvZyhcIm5vIGdyb3VwIGlkcyBpbiBkYXRhYmFzZSwgZGlzYWJsaW5nIGluZGV4ZXJcIilcblx0XHRcdHRoaXMuZGlzYWJsZU1haWxJbmRleGluZygpXG5cdFx0fVxuXG5cdFx0dGhpcy5faW5kZXhlZEdyb3VwSWRzID0gaW5kZXhlZEdyb3VwSWRzXG5cdH1cblxuXHRfbG9hZEdyb3VwRGlmZih1c2VyOiBVc2VyKTogUHJvbWlzZTx7XG5cdFx0ZGVsZXRlZEdyb3Vwczoge1xuXHRcdFx0aWQ6IElkXG5cdFx0XHR0eXBlOiBHcm91cFR5cGVcblx0XHR9W11cblx0XHRuZXdHcm91cHM6IHtcblx0XHRcdGlkOiBJZFxuXHRcdFx0dHlwZTogR3JvdXBUeXBlXG5cdFx0fVtdXG5cdH0+IHtcblx0XHRsZXQgY3VycmVudEdyb3VwczogQXJyYXk8e1xuXHRcdFx0aWQ6IElkXG5cdFx0XHR0eXBlOiBHcm91cFR5cGVcblx0XHR9PiA9IGZpbHRlckluZGV4TWVtYmVyc2hpcHModXNlcikubWFwKChtKSA9PiB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRpZDogbS5ncm91cCxcblx0XHRcdFx0dHlwZTogZ2V0TWVtYmVyc2hpcEdyb3VwVHlwZShtKSxcblx0XHRcdH1cblx0XHR9KVxuXHRcdHJldHVybiB0aGlzLmRiLmRiRmFjYWRlLmNyZWF0ZVRyYW5zYWN0aW9uKHRydWUsIFtHcm91cERhdGFPU10pLnRoZW4oKHQpID0+IHtcblx0XHRcdHJldHVybiB0LmdldEFsbChHcm91cERhdGFPUykudGhlbihcblx0XHRcdFx0KFxuXHRcdFx0XHRcdGxvYWRlZEdyb3Vwczoge1xuXHRcdFx0XHRcdFx0a2V5OiBEYktleVxuXHRcdFx0XHRcdFx0dmFsdWU6IEdyb3VwRGF0YVxuXHRcdFx0XHRcdH1bXSxcblx0XHRcdFx0KSA9PiB7XG5cdFx0XHRcdFx0aWYgKCFBcnJheS5pc0FycmF5KGxvYWRlZEdyb3VwcykpIHtcblx0XHRcdFx0XHRcdHRocm93IG5ldyBJbnZhbGlkRGF0YWJhc2VTdGF0ZUVycm9yKFwibG9hZGVkR3JvdXBzIGlzIG5vdCBhbiBhcnJheVwiKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRsZXQgb2xkR3JvdXBzID0gbG9hZGVkR3JvdXBzLm1hcCgoZ3JvdXApID0+IHtcblx0XHRcdFx0XHRcdGlmICh0eXBlb2YgZ3JvdXA/LmtleSAhPT0gXCJzdHJpbmdcIiB8fCB0eXBlb2YgZ3JvdXA/LnZhbHVlPy5ncm91cFR5cGUgIT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEludmFsaWREYXRhYmFzZVN0YXRlRXJyb3IoYGxvYWRlZCBncm91cCBpcyBtYWxmb3JtZWQ6ICR7Z3JvdXB9ICR7SlNPTi5zdHJpbmdpZnkoZ3JvdXApfWApXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRjb25zdCBpZDogSWQgPSBncm91cC5rZXlcblx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdGlkLFxuXHRcdFx0XHRcdFx0XHR0eXBlOiBncm91cC52YWx1ZS5ncm91cFR5cGUsXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRsZXQgZGVsZXRlZEdyb3VwcyA9IG9sZEdyb3Vwcy5maWx0ZXIoKG9sZEdyb3VwKSA9PiAhY3VycmVudEdyb3Vwcy5zb21lKChtKSA9PiBtLmlkID09PSBvbGRHcm91cC5pZCkpXG5cdFx0XHRcdFx0bGV0IG5ld0dyb3VwcyA9IGN1cnJlbnRHcm91cHMuZmlsdGVyKChtKSA9PiAhb2xkR3JvdXBzLnNvbWUoKG9sZEdyb3VwKSA9PiBtLmlkID09PSBvbGRHcm91cC5pZCkpXG5cdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdGRlbGV0ZWRHcm91cHMsXG5cdFx0XHRcdFx0XHRuZXdHcm91cHMsXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0KVxuXHRcdH0pXG5cdH1cblxuXHQvKipcblx0ICpcblx0ICogSW5pdGlhbGl6ZXMgdGhlIGluZGV4IGRiIGZvciBuZXcgZ3JvdXBzIG9mIHRoZSB1c2VyLCBidXQgZG9lcyBub3Qgc3RhcnQgdGhlIGFjdHVhbCBpbmRleGluZyBmb3IgdGhvc2UgZ3JvdXBzLlxuXHQgKiBJZiB0aGUgdXNlciB3YXMgcmVtb3ZlZCBmcm9tIGEgY29udGFjdCBvciBtYWlsIGdyb3VwIHRoZSBmdW5jdGlvbiB0aHJvd3MgYSBDYW5jZWxsZWRFcnJvciB0byBkZWxldGUgdGhlIGNvbXBsZXRlIG1haWwgaW5kZXggYWZ0ZXJ3YXJkcy5cblx0ICovXG5cdF91cGRhdGVHcm91cHMoXG5cdFx0dXNlcjogVXNlcixcblx0XHRncm91cERpZmY6IHtcblx0XHRcdGRlbGV0ZWRHcm91cHM6IHtcblx0XHRcdFx0aWQ6IElkXG5cdFx0XHRcdHR5cGU6IEdyb3VwVHlwZVxuXHRcdFx0fVtdXG5cdFx0XHRuZXdHcm91cHM6IHtcblx0XHRcdFx0aWQ6IElkXG5cdFx0XHRcdHR5cGU6IEdyb3VwVHlwZVxuXHRcdFx0fVtdXG5cdFx0fSxcblx0KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0aWYgKGdyb3VwRGlmZi5kZWxldGVkR3JvdXBzLnNvbWUoKGcpID0+IGcudHlwZSA9PT0gR3JvdXBUeXBlLk1haWwgfHwgZy50eXBlID09PSBHcm91cFR5cGUuQ29udGFjdCkpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgTWVtYmVyc2hpcFJlbW92ZWRFcnJvcihcInVzZXIgaGFzIGJlZW4gcmVtb3ZlZCBmcm9tIGNvbnRhY3Qgb3IgbWFpbCBncm91cFwiKSkgLy8gdXNlciBoYXMgYmVlbiByZW1vdmVkIGZyb20gYSBzaGFyZWQgZ3JvdXBcblx0XHR9IGVsc2UgaWYgKGdyb3VwRGlmZi5uZXdHcm91cHMubGVuZ3RoID4gMCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuX2xvYWRHcm91cERhdGEoXG5cdFx0XHRcdHVzZXIsXG5cdFx0XHRcdGdyb3VwRGlmZi5uZXdHcm91cHMubWFwKChnKSA9PiBnLmlkKSxcblx0XHRcdCkudGhlbihcblx0XHRcdFx0KFxuXHRcdFx0XHRcdGdyb3VwQmF0Y2hlczoge1xuXHRcdFx0XHRcdFx0Z3JvdXBJZDogSWRcblx0XHRcdFx0XHRcdGdyb3VwRGF0YTogR3JvdXBEYXRhXG5cdFx0XHRcdFx0fVtdLFxuXHRcdFx0XHQpID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5kYi5kYkZhY2FkZS5jcmVhdGVUcmFuc2FjdGlvbihmYWxzZSwgW0dyb3VwRGF0YU9TXSkudGhlbigodCkgPT4ge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRoaXMuX2luaXRHcm91cERhdGEoZ3JvdXBCYXRjaGVzLCB0KVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdH0sXG5cdFx0XHQpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG5cdH1cblxuXHQvKipcblx0ICogUHJvdmlkZXMgYSBHcm91cERhdGEgb2JqZWN0IGluY2x1ZGluZyB0aGUgbGFzdCAxMDAgZXZlbnQgYmF0Y2ggaWRzIGZvciBhbGwgaW5kZXhlZCBtZW1iZXJzaGlwIGdyb3VwcyBvZiB0aGUgZ2l2ZW4gdXNlci5cblx0ICovXG5cdF9sb2FkR3JvdXBEYXRhKFxuXHRcdHVzZXI6IFVzZXIsXG5cdFx0cmVzdHJpY3RUb1RoZXNlR3JvdXBzPzogSWRbXSxcblx0KTogUHJvbWlzZTxcblx0XHR7XG5cdFx0XHRncm91cElkOiBJZFxuXHRcdFx0Z3JvdXBEYXRhOiBHcm91cERhdGFcblx0XHR9W11cblx0PiB7XG5cdFx0bGV0IG1lbWJlcnNoaXBzID0gZmlsdGVySW5kZXhNZW1iZXJzaGlwcyh1c2VyKVxuXHRcdGNvbnN0IHJlc3RyaWN0VG8gPSByZXN0cmljdFRvVGhlc2VHcm91cHMgLy8gdHlwZSBjaGVja1xuXG5cdFx0aWYgKHJlc3RyaWN0VG8pIHtcblx0XHRcdG1lbWJlcnNoaXBzID0gbWVtYmVyc2hpcHMuZmlsdGVyKChtZW1iZXJzaGlwKSA9PiBjb250YWlucyhyZXN0cmljdFRvLCBtZW1iZXJzaGlwLmdyb3VwKSlcblx0XHR9XG5cblx0XHRyZXR1cm4gcHJvbWlzZU1hcChtZW1iZXJzaGlwcywgKG1lbWJlcnNoaXA6IEdyb3VwTWVtYmVyc2hpcCkgPT4ge1xuXHRcdFx0Ly8gd2Ugb25seSBuZWVkIHRoZSBsYXRlc3QgRW50aXR5RXZlbnRCYXRjaCB0byBzeW5jaHJvbml6ZSB0aGUgaW5kZXggc3RhdGUgYWZ0ZXIgcmVjb25uZWN0LiBUaGUgbGFzdEJhdGNoSWRzIGFyZSBmaWxsZWQgdXAgdG8gMTAwIHdpdGggZWFjaCBldmVudCB3ZSByZWNlaXZlLlxuXHRcdFx0cmV0dXJuIHRoaXMuX2VudGl0eVxuXHRcdFx0XHQubG9hZFJhbmdlKEVudGl0eUV2ZW50QmF0Y2hUeXBlUmVmLCBtZW1iZXJzaGlwLmdyb3VwLCBHRU5FUkFURURfTUFYX0lELCAxLCB0cnVlKVxuXHRcdFx0XHQudGhlbigoZXZlbnRCYXRjaGVzKSA9PiB7XG5cdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdGdyb3VwSWQ6IG1lbWJlcnNoaXAuZ3JvdXAsXG5cdFx0XHRcdFx0XHRncm91cERhdGE6IHtcblx0XHRcdFx0XHRcdFx0bGFzdEJhdGNoSWRzOiBldmVudEJhdGNoZXMubWFwKChldmVudEJhdGNoKSA9PiBldmVudEJhdGNoLl9pZFsxXSksXG5cdFx0XHRcdFx0XHRcdGluZGV4VGltZXN0YW1wOiBOT1RISU5HX0lOREVYRURfVElNRVNUQU1QLFxuXHRcdFx0XHRcdFx0XHRncm91cFR5cGU6IGdldE1lbWJlcnNoaXBHcm91cFR5cGUobWVtYmVyc2hpcCksXG5cdFx0XHRcdFx0XHR9IGFzIEdyb3VwRGF0YSxcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChcblx0XHRcdFx0XHRvZkNsYXNzKE5vdEF1dGhvcml6ZWRFcnJvciwgKCkgPT4ge1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coXCJjb3VsZCBub3QgZG93bmxvYWQgZW50aXR5IHVwZGF0ZXMgPT4gbG9zdCBwZXJtaXNzaW9uIG9uIGxpc3RcIilcblx0XHRcdFx0XHRcdHJldHVybiBudWxsXG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdClcblx0XHR9KSAvLyBzZXF1ZW50aWFsbHkgdG8gYXZvaWQgcmF0ZSBsaW1pdGluZ1xuXHRcdFx0LnRoZW4oKGRhdGEpID0+IGRhdGEuZmlsdGVyKGlzTm90TnVsbCkpXG5cdH1cblxuXHQvKipcblx0ICogY3JlYXRlcyB0aGUgaW5pdGlhbCBncm91cCBkYXRhIGZvciBhbGwgcHJvdmlkZWQgZ3JvdXAgaWRzXG5cdCAqL1xuXHRfaW5pdEdyb3VwRGF0YShcblx0XHRncm91cEJhdGNoZXM6IHtcblx0XHRcdGdyb3VwSWQ6IElkXG5cdFx0XHRncm91cERhdGE6IEdyb3VwRGF0YVxuXHRcdH1bXSxcblx0XHR0MjogRGJUcmFuc2FjdGlvbixcblx0KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Zm9yIChjb25zdCBncm91cElkVG9MYXN0QmF0Y2hJZCBvZiBncm91cEJhdGNoZXMpIHtcblx0XHRcdHQyLnB1dChHcm91cERhdGFPUywgZ3JvdXBJZFRvTGFzdEJhdGNoSWQuZ3JvdXBJZCwgZ3JvdXBJZFRvTGFzdEJhdGNoSWQuZ3JvdXBEYXRhKVxuXHRcdH1cblx0XHRyZXR1cm4gdDIud2FpdCgpXG5cdH1cblxuXHRhc3luYyBfbG9hZE5ld0VudGl0aWVzKFxuXHRcdGdyb3VwSWRUb0V2ZW50QmF0Y2hlczoge1xuXHRcdFx0Z3JvdXBJZDogSWRcblx0XHRcdGV2ZW50QmF0Y2hJZHM6IElkW11cblx0XHR9W10sXG5cdCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IGJhdGNoZXNPZkFsbEdyb3VwczogUXVldWVkQmF0Y2hbXSA9IFtdXG5cdFx0Y29uc3QgbGFzdExvYWRlZEJhdGNoSWRJbkdyb3VwID0gbmV3IE1hcDxJZCwgSWQ+KClcblx0XHRjb25zdCB0cmFuc2FjdGlvbiA9IGF3YWl0IHRoaXMuZGIuZGJGYWNhZGUuY3JlYXRlVHJhbnNhY3Rpb24odHJ1ZSwgW01ldGFEYXRhT1NdKVxuXHRcdGNvbnN0IGxhc3RJbmRleFRpbWVNczogbnVtYmVyIHwgbnVsbCA9IGF3YWl0IHRyYW5zYWN0aW9uLmdldChNZXRhRGF0YU9TLCBNZXRhZGF0YS5sYXN0RXZlbnRJbmRleFRpbWVNcylcblx0XHRhd2FpdCB0aGlzLl90aHJvd0lmT3V0T2ZEYXRlKClcblxuXHRcdHRyeSB7XG5cdFx0XHRmb3IgKGxldCBncm91cElkVG9FdmVudEJhdGNoIG9mIGdyb3VwSWRUb0V2ZW50QmF0Y2hlcykge1xuXHRcdFx0XHRpZiAoZ3JvdXBJZFRvRXZlbnRCYXRjaC5ldmVudEJhdGNoSWRzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRsZXQgc3RhcnRJZCA9IHRoaXMuX2dldFN0YXJ0SWRGb3JMb2FkaW5nTWlzc2VkRXZlbnRCYXRjaGVzKGdyb3VwSWRUb0V2ZW50QmF0Y2guZXZlbnRCYXRjaElkcylcblxuXHRcdFx0XHRcdGxldCBldmVudEJhdGNoZXNPblNlcnZlcjogRW50aXR5RXZlbnRCYXRjaFtdID0gW11cblx0XHRcdFx0XHRldmVudEJhdGNoZXNPblNlcnZlciA9IGF3YWl0IHRoaXMuX2VudGl0eS5sb2FkQWxsKEVudGl0eUV2ZW50QmF0Y2hUeXBlUmVmLCBncm91cElkVG9FdmVudEJhdGNoLmdyb3VwSWQsIHN0YXJ0SWQpXG5cdFx0XHRcdFx0Y29uc3QgYmF0Y2hlc1RvUXVldWU6IFF1ZXVlZEJhdGNoW10gPSBbXVxuXG5cdFx0XHRcdFx0Zm9yIChsZXQgYmF0Y2ggb2YgZXZlbnRCYXRjaGVzT25TZXJ2ZXIpIHtcblx0XHRcdFx0XHRcdGNvbnN0IGJhdGNoSWQgPSBnZXRFbGVtZW50SWQoYmF0Y2gpXG5cblx0XHRcdFx0XHRcdGlmIChncm91cElkVG9FdmVudEJhdGNoLmV2ZW50QmF0Y2hJZHMuaW5kZXhPZihiYXRjaElkKSA9PT0gLTEgJiYgZmlyc3RCaWdnZXJUaGFuU2Vjb25kKGJhdGNoSWQsIHN0YXJ0SWQpKSB7XG5cdFx0XHRcdFx0XHRcdGJhdGNoZXNUb1F1ZXVlLnB1c2goe1xuXHRcdFx0XHRcdFx0XHRcdGdyb3VwSWQ6IGdyb3VwSWRUb0V2ZW50QmF0Y2guZ3JvdXBJZCxcblx0XHRcdFx0XHRcdFx0XHRiYXRjaElkLFxuXHRcdFx0XHRcdFx0XHRcdGV2ZW50czogYmF0Y2guZXZlbnRzLFxuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRjb25zdCBsYXN0QmF0Y2ggPSBsYXN0TG9hZGVkQmF0Y2hJZEluR3JvdXAuZ2V0KGdyb3VwSWRUb0V2ZW50QmF0Y2guZ3JvdXBJZClcblxuXHRcdFx0XHRcdFx0XHRpZiAobGFzdEJhdGNoID09IG51bGwgfHwgZmlyc3RCaWdnZXJUaGFuU2Vjb25kKGJhdGNoSWQsIGxhc3RCYXRjaCkpIHtcblx0XHRcdFx0XHRcdFx0XHRsYXN0TG9hZGVkQmF0Y2hJZEluR3JvdXAuc2V0KGdyb3VwSWRUb0V2ZW50QmF0Y2guZ3JvdXBJZCwgYmF0Y2hJZClcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIEdvb2Qgc2NlbmFyaW86IHdlIGtub3cgd2hlbiB3ZSBzdG9wcGVkLCB3ZSBjYW4gcHJvY2VzcyBldmVudHMgd2UgZGlkIG5vdCBwcm9jZXNzIHlldCBhbmQgY2F0Y2ggdXAgdGhlIHNlcnZlclxuXHRcdFx0XHRcdC8vXG5cdFx0XHRcdFx0Ly9cblx0XHRcdFx0XHQvLyBbNCwgMywgMiwgMV0gICAgICAgICAgICAgICAgICAgICAgICAgIC0gcHJvY2Vzc2VkIGV2ZW50cywgbGFzdEJhdGNoSWQgPTFcblx0XHRcdFx0XHQvLyBsb2FkIGZyb20gbG93ZXN0IGlkIDEgLTFcblx0XHRcdFx0XHQvLyBbMC45LCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4XSAgICAgICAgIC0gbGFzdCBYIGV2ZW50cyBmcm9tIHNlcnZlclxuXHRcdFx0XHRcdC8vID0+IFs1LCA2LCA3LCA4XSAgICAgICAgICAgICAgICAgICAgICAgLSBiYXRjaGVzIHRvIHF1ZXVlXG5cdFx0XHRcdFx0Ly9cblx0XHRcdFx0XHQvLyBCYWQgc2NlbmFyaW86IHdlIGRvbicga25vdyB3aGVyZSB3ZSBzdG9wcGVkLCBzZXJ2ZXIgZG9lc24ndCBoYXZlIGV2ZW50cyB0byBmaWxsIHRoZSBnYXAgYW55bW9yZSwgd2UgY2Fubm90IGZpeCB0aGUgaW5kZXguXG5cdFx0XHRcdFx0Ly8gWzQsIDMsIDIsIDFdIC0gcHJvY2Vzc2VkIGV2ZW50cywgbGFzdEJhdGNoSWQgPSAxXG5cdFx0XHRcdFx0Ly8gWzcsIDUsIDksIDEwXSAtIGxhc3QgZXZlbnRzIGZyb20gc2VydmVyXG5cdFx0XHRcdFx0Ly8gPT4gWzcsIDUsIDksIDEwXSAtIGJhdGNoZXMgdG8gcXVldWUgLSBub3RoaW5nIGhhcyBiZWVuIHByb2Nlc3NlZCBiZWZvcmUgc28gd2UgYXJlIG91dCBvZiBzeW5jXG5cdFx0XHRcdFx0Ly8gV2Ugb25seSB3YW50IHRvIGRvIHRoaXMgY2hlY2sgZm9yIGNsaWVudHMgdGhhdCBoYXZlbid0IHlldCBzYXZlZCB0aGUgaW5kZXggdGltZVxuXHRcdFx0XHRcdC8vIFRoaXMgY2FuIGJlIHJlbW92ZWQgaW4gdGhlIGZ1dHVyZVxuXHRcdFx0XHRcdGlmIChsYXN0SW5kZXhUaW1lTXMgPT0gbnVsbCAmJiBldmVudEJhdGNoZXNPblNlcnZlci5sZW5ndGggPT09IGJhdGNoZXNUb1F1ZXVlLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0Ly8gQmFkIHNjZW5hcmlvIGhhcHBlbmVkLlxuXHRcdFx0XHRcdFx0Ly8gTm9uZSBvZiB0aGUgZXZlbnRzIHdlIHdhbnQgdG8gcHJvY2VzcyB3ZXJlIHByb2Nlc3NlZCBiZWZvcmUsIHdlJ3JlIHRvbyBmYXIgYXdheSwgc3RvcCB0aGUgcHJvY2VzcyBhbmQgZGVsZXRlXG5cdFx0XHRcdFx0XHQvLyB0aGUgaW5kZXguXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgT3V0T2ZTeW5jRXJyb3IoYFdlIGxvc3QgZW50aXR5IGV2ZW50cyBmb3IgZ3JvdXAgJHtncm91cElkVG9FdmVudEJhdGNoLmdyb3VwSWR9LiBzdGFydCBpZCB3YXMgJHtzdGFydElkfWApXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0YmF0Y2hlc09mQWxsR3JvdXBzLnB1c2goLi4uYmF0Y2hlc1RvUXVldWUpXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRpZiAoZSBpbnN0YW5jZW9mIE5vdEF1dGhvcml6ZWRFcnJvcikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcImNvdWxkIG5vdCBkb3dubG9hZCBlbnRpdHkgdXBkYXRlcyA9PiBsb3N0IHBlcm1pc3Npb24gb24gbGlzdFwiKVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdH1cblxuXHRcdFx0dGhyb3cgZVxuXHRcdH1cblxuXHRcdC8vIGFkZCBhbGwgYmF0Y2hlcyBvZiBhbGwgZ3JvdXBzIGluIG9uZSBzdGVwIHRvIGF2b2lkIHRoYXQganVzdCBzb21lIGdyb3VwcyBhcmUgYWRkZWQgd2hlbiBhIFNlcnZpY2VVbmF2YWlsYWJsZUVycm9yIG9jY3Vyc1xuXHRcdC8vIEFkZCB0aGVtIGRpcmVjdGx5IHRvIHRoZSBjb3JlIHNvIHRoYXQgdGhleSBhcmUgYWRkZWQgYmVmb3JlIHRoZSByZWFsdGltZSBiYXRjaGVzXG5cdFx0dGhpcy5fY29yZS5hZGRCYXRjaGVzVG9RdWV1ZShiYXRjaGVzT2ZBbGxHcm91cHMpXG5cblx0XHQvLyBBZGQgbGF0ZXN0IGJhdGNoZXMgcGVyIGdyb3VwIHNvIHRoYXQgd2UgY2FuIGZpbHRlciBvdXQgb3ZlcmxhcHBpbmcgcmVhbHRpbWUgdXBkYXRlcyBsYXRlclxuXHRcdHRoaXMuX2luaXRpYWxseUxvYWRlZEJhdGNoSWRzUGVyR3JvdXAgPSBsYXN0TG9hZGVkQmF0Y2hJZEluR3JvdXBcblxuXHRcdHRoaXMuX3JlYWx0aW1lRXZlbnRRdWV1ZS5yZXN1bWUoKVxuXG5cdFx0dGhpcy5zdGFydFByb2Nlc3NpbmcoKVxuXHRcdGF3YWl0IHRoaXMuX3dyaXRlU2VydmVyVGltZXN0YW1wKClcblx0fVxuXG5cdF9nZXRTdGFydElkRm9yTG9hZGluZ01pc3NlZEV2ZW50QmF0Y2hlcyhsYXN0RXZlbnRCYXRjaElkczogSWRbXSk6IElkIHtcblx0XHRsZXQgbmV3ZXN0QmF0Y2hJZCA9IGxhc3RFdmVudEJhdGNoSWRzWzBdXG5cdFx0bGV0IG9sZGVzdEJhdGNoSWQgPSBsYXN0RXZlbnRCYXRjaElkc1tsYXN0RXZlbnRCYXRjaElkcy5sZW5ndGggLSAxXVxuXHRcdC8vIGxvYWQgYWxsIEVudGl0eUV2ZW50QmF0Y2hlcyB3aGljaCBhcmUgbm90IG9sZGVyIHRoYW4gMSBtaW51dGUgYmVmb3JlIHRoZSBuZXdlc3QgYmF0Y2hcblx0XHQvLyB0byBiZSBhYmxlIHRvIGdldCBiYXRjaGVzIHRoYXQgd2VyZSBvdmVydGFrZW4gYnkgdGhlIG5ld2VzdCBiYXRjaCBhbmQgdGhlcmVmb3JlIG1pc3NlZCBiZWZvcmVcblx0XHRsZXQgc3RhcnRJZCA9IHRpbWVzdGFtcFRvR2VuZXJhdGVkSWQoZ2VuZXJhdGVkSWRUb1RpbWVzdGFtcChuZXdlc3RCYXRjaElkKSAtIDEwMDAgKiA2MClcblxuXHRcdC8vIGRvIG5vdCBsb2FkIGV2ZW50cyB0aGF0IGFyZSBvbGRlciB0aGFuIHRoZSBzdG9yZWQgZXZlbnRzXG5cdFx0aWYgKCFmaXJzdEJpZ2dlclRoYW5TZWNvbmQoc3RhcnRJZCwgb2xkZXN0QmF0Y2hJZCkpIHtcblx0XHRcdC8vIHJlZHVjZSB0aGUgZ2VuZXJhdGVkIGlkIGJ5IGEgbWlsbGlzZWNvbmQgaW4gb3JkZXIgdG8gZmV0Y2ggdGhlIGluc3RhbmNlIHdpdGggbGFzdEJhdGNoSWQsIHRvbyAod291bGQgdGhyb3cgT3V0T2ZTeW5jLCBvdGhlcndpc2UgaWYgdGhlIGluc3RhbmNlIHdpdGggbGFzQmF0Y2hJZCBpcyB0aGUgb25seSBvbmUgaW4gdGhlIGxpc3QpXG5cdFx0XHRzdGFydElkID0gdGltZXN0YW1wVG9HZW5lcmF0ZWRJZChnZW5lcmF0ZWRJZFRvVGltZXN0YW1wKG9sZGVzdEJhdGNoSWQpIC0gMSlcblx0XHR9XG5cblx0XHRyZXR1cm4gc3RhcnRJZFxuXHR9XG5cblx0LyoqXG5cdCAqIEBwcml2YXRlIGEgbWFwIGZyb20gZ3JvdXAgaWQgdG8gZXZlbnQgYmF0Y2hlc1xuXHQgKi9cblx0X2xvYWRQZXJzaXN0ZW50R3JvdXBEYXRhKHVzZXI6IFVzZXIpOiBQcm9taXNlPFxuXHRcdHtcblx0XHRcdGdyb3VwSWQ6IElkXG5cdFx0XHRldmVudEJhdGNoSWRzOiBJZFtdXG5cdFx0fVtdXG5cdD4ge1xuXHRcdHJldHVybiB0aGlzLmRiLmRiRmFjYWRlLmNyZWF0ZVRyYW5zYWN0aW9uKHRydWUsIFtHcm91cERhdGFPU10pLnRoZW4oKHQpID0+IHtcblx0XHRcdHJldHVybiBQcm9taXNlLmFsbChcblx0XHRcdFx0ZmlsdGVySW5kZXhNZW1iZXJzaGlwcyh1c2VyKS5tYXAoKG1lbWJlcnNoaXApID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gdC5nZXQoR3JvdXBEYXRhT1MsIG1lbWJlcnNoaXAuZ3JvdXApLnRoZW4oKGdyb3VwRGF0YTogR3JvdXBEYXRhIHwgbnVsbCkgPT4ge1xuXHRcdFx0XHRcdFx0aWYgKGdyb3VwRGF0YSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHRcdGdyb3VwSWQ6IG1lbWJlcnNoaXAuZ3JvdXAsXG5cdFx0XHRcdFx0XHRcdFx0ZXZlbnRCYXRjaElkczogZ3JvdXBEYXRhLmxhc3RCYXRjaElkcyxcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEludmFsaWREYXRhYmFzZVN0YXRlRXJyb3IoXG5cdFx0XHRcdFx0XHRcdFx0XCJubyBncm91cCBkYXRhIGZvciBncm91cCBcIiArIG1lbWJlcnNoaXAuZ3JvdXAgKyBcIiBpbmRleGVkR3JvdXBJZHM6IFwiICsgdGhpcy5faW5kZXhlZEdyb3VwSWRzLmpvaW4oXCIsXCIpLFxuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0fSksXG5cdFx0XHQpXG5cdFx0fSlcblx0fVxuXG5cdF9wcm9jZXNzRW50aXR5RXZlbnRzKGJhdGNoOiBRdWV1ZWRCYXRjaCk6IFByb21pc2U8YW55PiB7XG5cdFx0Y29uc3QgeyBldmVudHMsIGdyb3VwSWQsIGJhdGNoSWQgfSA9IGJhdGNoXG5cdFx0cmV0dXJuIHRoaXMuZGIuaW5pdGlhbGl6ZWRcblx0XHRcdC50aGVuKGFzeW5jICgpID0+IHtcblx0XHRcdFx0aWYgKCF0aGlzLmRiLmRiRmFjYWRlLmluZGV4aW5nU3VwcG9ydGVkKSB7XG5cdFx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0ZmlsdGVySW5kZXhNZW1iZXJzaGlwcyh0aGlzLl9pbml0UGFyYW1zLnVzZXIpXG5cdFx0XHRcdFx0XHQubWFwKChtKSA9PiBtLmdyb3VwKVxuXHRcdFx0XHRcdFx0LmluZGV4T2YoZ3JvdXBJZCkgPT09IC0xXG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKHRoaXMuX2luZGV4ZWRHcm91cElkcy5pbmRleE9mKGdyb3VwSWQpID09PSAtMSkge1xuXHRcdFx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0bWFya1N0YXJ0KFwicHJvY2Vzc0VudGl0eUV2ZW50c1wiKVxuXHRcdFx0XHRjb25zdCBncm91cGVkRXZlbnRzOiBNYXA8VHlwZVJlZjxhbnk+LCBFbnRpdHlVcGRhdGVbXT4gPSBuZXcgTWFwKCkgLy8gZGVmaW5lIG1hcCBmaXJzdCBiZWNhdXNlIFdlYnN0b3JtIGhhcyBwcm9ibGVtcyB3aXRoIHR5cGUgYW5ub3RhdGlvbnNcblxuXHRcdFx0XHRldmVudHMucmVkdWNlKChhbGwsIHVwZGF0ZSkgPT4ge1xuXHRcdFx0XHRcdGlmIChpc1NhbWVUeXBlUmVmQnlBdHRyKE1haWxUeXBlUmVmLCB1cGRhdGUuYXBwbGljYXRpb24sIHVwZGF0ZS50eXBlKSkge1xuXHRcdFx0XHRcdFx0Z2V0RnJvbU1hcChhbGwsIE1haWxUeXBlUmVmLCAoKSA9PiBbXSkucHVzaCh1cGRhdGUpXG5cdFx0XHRcdFx0fSBlbHNlIGlmIChpc1NhbWVUeXBlUmVmQnlBdHRyKENvbnRhY3RUeXBlUmVmLCB1cGRhdGUuYXBwbGljYXRpb24sIHVwZGF0ZS50eXBlKSkge1xuXHRcdFx0XHRcdFx0Z2V0RnJvbU1hcChhbGwsIENvbnRhY3RUeXBlUmVmLCAoKSA9PiBbXSkucHVzaCh1cGRhdGUpXG5cdFx0XHRcdFx0fSBlbHNlIGlmIChpc1NhbWVUeXBlUmVmQnlBdHRyKFVzZXJUeXBlUmVmLCB1cGRhdGUuYXBwbGljYXRpb24sIHVwZGF0ZS50eXBlKSkge1xuXHRcdFx0XHRcdFx0Z2V0RnJvbU1hcChhbGwsIFVzZXJUeXBlUmVmLCAoKSA9PiBbXSkucHVzaCh1cGRhdGUpXG5cdFx0XHRcdFx0fSBlbHNlIGlmIChpc1NhbWVUeXBlUmVmQnlBdHRyKEltcG9ydE1haWxTdGF0ZVR5cGVSZWYsIHVwZGF0ZS5hcHBsaWNhdGlvbiwgdXBkYXRlLnR5cGUpKSB7XG5cdFx0XHRcdFx0XHRnZXRGcm9tTWFwKGFsbCwgSW1wb3J0TWFpbFN0YXRlVHlwZVJlZiwgKCkgPT4gW10pLnB1c2godXBkYXRlKVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJldHVybiBhbGxcblx0XHRcdFx0fSwgZ3JvdXBlZEV2ZW50cylcblx0XHRcdFx0bWFya1N0YXJ0KFwicHJvY2Vzc0V2ZW50XCIpXG5cdFx0XHRcdHJldHVybiBwcm9taXNlTWFwKGdyb3VwZWRFdmVudHMuZW50cmllcygpLCAoW2tleSwgdmFsdWVdKSA9PiB7XG5cdFx0XHRcdFx0bGV0IHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKVxuXG5cdFx0XHRcdFx0aWYgKGlzU2FtZVR5cGVSZWYoVXNlclR5cGVSZWYsIGtleSkpIHtcblx0XHRcdFx0XHRcdHJldHVybiB0aGlzLl9wcm9jZXNzVXNlckVudGl0eUV2ZW50cyh2YWx1ZSlcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRjb25zdCB0eXBlSW5mb1RvSW5kZXggPVxuXHRcdFx0XHRcdFx0aXNTYW1lVHlwZVJlZihJbXBvcnRNYWlsU3RhdGVUeXBlUmVmLCBrZXkpIHx8IGlzU2FtZVR5cGVSZWYoTWFpbFR5cGVSZWYsIGtleSkgPyB0eXBlUmVmVG9UeXBlSW5mbyhNYWlsVHlwZVJlZikgOiB0eXBlUmVmVG9UeXBlSW5mbyhrZXkpXG5cdFx0XHRcdFx0Y29uc3QgaW5kZXhVcGRhdGUgPSBfY3JlYXRlTmV3SW5kZXhVcGRhdGUodHlwZUluZm9Ub0luZGV4KVxuXG5cdFx0XHRcdFx0aWYgKGlzU2FtZVR5cGVSZWYoTWFpbFR5cGVSZWYsIGtleSkpIHtcblx0XHRcdFx0XHRcdHByb21pc2UgPSB0aGlzLl9tYWlsLnByb2Nlc3NFbnRpdHlFdmVudHModmFsdWUsIGdyb3VwSWQsIGJhdGNoSWQsIGluZGV4VXBkYXRlKVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAoaXNTYW1lVHlwZVJlZihDb250YWN0VHlwZVJlZiwga2V5KSkge1xuXHRcdFx0XHRcdFx0cHJvbWlzZSA9IHRoaXMuX2NvbnRhY3QucHJvY2Vzc0VudGl0eUV2ZW50cyh2YWx1ZSwgZ3JvdXBJZCwgYmF0Y2hJZCwgaW5kZXhVcGRhdGUpXG5cdFx0XHRcdFx0fSBlbHNlIGlmIChpc1NhbWVUeXBlUmVmKEltcG9ydE1haWxTdGF0ZVR5cGVSZWYsIGtleSkpIHtcblx0XHRcdFx0XHRcdHByb21pc2UgPSB0aGlzLl9tYWlsLnByb2Nlc3NJbXBvcnRTdGF0ZUVudGl0eUV2ZW50cyh2YWx1ZSwgZ3JvdXBJZCwgYmF0Y2hJZCwgaW5kZXhVcGRhdGUpXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0dXJuIHByb21pc2Vcblx0XHRcdFx0XHRcdC50aGVuKCgpID0+IHtcblx0XHRcdFx0XHRcdFx0bWFya0VuZChcInByb2Nlc3NFdmVudFwiKVxuXHRcdFx0XHRcdFx0XHRtYXJrU3RhcnQoXCJ3cml0ZUluZGV4VXBkYXRlXCIpXG5cdFx0XHRcdFx0XHRcdHJldHVybiB0aGlzLl9jb3JlLndyaXRlSW5kZXhVcGRhdGVXaXRoQmF0Y2hJZChncm91cElkLCBiYXRjaElkLCBpbmRleFVwZGF0ZSlcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdG1hcmtFbmQoXCJ3cml0ZUluZGV4VXBkYXRlXCIpXG5cdFx0XHRcdFx0XHRcdG1hcmtFbmQoXCJwcm9jZXNzRW50aXR5RXZlbnRzXCIpIC8vIGlmICghZW52LmRpc3QgJiYgZW52Lm1vZGUgIT09IFwiVGVzdFwiKSB7XG5cdFx0XHRcdFx0XHRcdC8vIFx0cHJpbnRNZWFzdXJlKFwiVXBkYXRlIG9mIFwiICsga2V5LnR5cGUgKyBcIiBcIiArIGJhdGNoLmV2ZW50cy5tYXAoZSA9PiBvcGVyYXRpb25UeXBlS2V5c1tlLm9wZXJhdGlvbl0pLmpvaW4oXCIsXCIpLCBbXG5cdFx0XHRcdFx0XHRcdC8vIFx0XHRcInByb2Nlc3NFbnRpdHlFdmVudHNcIiwgXCJwcm9jZXNzRXZlbnRcIiwgXCJ3cml0ZUluZGV4VXBkYXRlXCJcblx0XHRcdFx0XHRcdFx0Ly8gXHRdKVxuXHRcdFx0XHRcdFx0XHQvLyB9XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9KVxuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChvZkNsYXNzKENhbmNlbGxlZEVycm9yLCBub09wKSlcblx0XHRcdC5jYXRjaChcblx0XHRcdFx0b2ZDbGFzcyhEYkVycm9yLCAoZSkgPT4ge1xuXHRcdFx0XHRcdGlmICh0aGlzLl9jb3JlLmlzU3RvcHBlZFByb2Nlc3NpbmcoKSkge1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coXCJJZ25vcmluZyBEQmVycm9yIHdoZW4gaW5kZXhpbmcgaXMgZGlzYWJsZWRcIiwgZSlcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dGhyb3cgZVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSksXG5cdFx0XHQpXG5cdFx0XHQuY2F0Y2goXG5cdFx0XHRcdG9mQ2xhc3MoSW52YWxpZERhdGFiYXNlU3RhdGVFcnJvciwgKGUpID0+IHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhcIkludmFsaWREYXRhYmFzZVN0YXRlRXJyb3IgZHVyaW5nIF9wcm9jZXNzRW50aXR5RXZlbnRzXCIpXG5cblx0XHRcdFx0XHR0aGlzLl9jb3JlLnN0b3BQcm9jZXNzaW5nKClcblxuXHRcdFx0XHRcdHJldHVybiB0aGlzLl9yZUNyZWF0ZUluZGV4KClcblx0XHRcdFx0fSksXG5cdFx0XHQpXG5cdH1cblxuXHQvKipcblx0ICogQFZpc2libGVGb3JUZXN0aW5nXG5cdCAqIEBwYXJhbSBldmVudHNcblx0ICovXG5cdGFzeW5jIF9wcm9jZXNzVXNlckVudGl0eUV2ZW50cyhldmVudHM6IEVudGl0eVVwZGF0ZVtdKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Zm9yIChjb25zdCBldmVudCBvZiBldmVudHMpIHtcblx0XHRcdGlmICghKGV2ZW50Lm9wZXJhdGlvbiA9PT0gT3BlcmF0aW9uVHlwZS5VUERBVEUgJiYgaXNTYW1lSWQodGhpcy5faW5pdFBhcmFtcy51c2VyLl9pZCwgZXZlbnQuaW5zdGFuY2VJZCkpKSB7XG5cdFx0XHRcdGNvbnRpbnVlXG5cdFx0XHR9XG5cdFx0XHR0aGlzLl9pbml0UGFyYW1zLnVzZXIgPSBhd2FpdCB0aGlzLl9lbnRpdHkubG9hZChVc2VyVHlwZVJlZiwgZXZlbnQuaW5zdGFuY2VJZClcblx0XHRcdGF3YWl0IHVwZGF0ZUVuY3J5cHRpb25NZXRhZGF0YSh0aGlzLmRiLmRiRmFjYWRlLCB0aGlzLl9pbml0UGFyYW1zLmtleUxvYWRlckZhY2FkZSwgTWV0YURhdGFPUylcblx0XHR9XG5cdH1cblxuXHRhc3luYyBfdGhyb3dJZk91dE9mRGF0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCB0cmFuc2FjdGlvbiA9IGF3YWl0IHRoaXMuZGIuZGJGYWNhZGUuY3JlYXRlVHJhbnNhY3Rpb24odHJ1ZSwgW01ldGFEYXRhT1NdKVxuXHRcdGNvbnN0IGxhc3RJbmRleFRpbWVNcyA9IGF3YWl0IHRyYW5zYWN0aW9uLmdldChNZXRhRGF0YU9TLCBNZXRhZGF0YS5sYXN0RXZlbnRJbmRleFRpbWVNcylcblxuXHRcdGlmIChsYXN0SW5kZXhUaW1lTXMgIT0gbnVsbCkge1xuXHRcdFx0Y29uc3Qgbm93ID0gdGhpcy5fZW50aXR5UmVzdENsaWVudC5nZXRSZXN0Q2xpZW50KCkuZ2V0U2VydmVyVGltZXN0YW1wTXMoKVxuXG5cdFx0XHRjb25zdCB0aW1lU2luY2VMYXN0SW5kZXggPSBub3cgLSBsYXN0SW5kZXhUaW1lTXNcblxuXHRcdFx0aWYgKHRpbWVTaW5jZUxhc3RJbmRleCA+PSBkYXlzVG9NaWxsaXMoRU5USVRZX0VWRU5UX0JBVENIX1RUTF9EQVlTKSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgT3V0T2ZTeW5jRXJyb3IoXG5cdFx0XHRcdFx0YHdlIGhhdmVuJ3QgdXBkYXRlZCB0aGUgaW5kZXggaW4gJHttaWxsaXNUb0RheXModGltZVNpbmNlTGFzdEluZGV4KX0gZGF5cy4gbGFzdCB1cGRhdGUgd2FzICR7bmV3IERhdGUoXG5cdFx0XHRcdFx0XHRuZXZlck51bGwobGFzdEluZGV4VGltZU1zKSxcblx0XHRcdFx0XHQpLnRvU3RyaW5nKCl9YCxcblx0XHRcdFx0KVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGFzeW5jIF93cml0ZVNlcnZlclRpbWVzdGFtcCgpIHtcblx0XHRjb25zdCB0cmFuc2FjdGlvbiA9IGF3YWl0IHRoaXMuZGIuZGJGYWNhZGUuY3JlYXRlVHJhbnNhY3Rpb24oZmFsc2UsIFtNZXRhRGF0YU9TXSlcblxuXHRcdGNvbnN0IG5vdyA9IHRoaXMuX2VudGl0eVJlc3RDbGllbnQuZ2V0UmVzdENsaWVudCgpLmdldFNlcnZlclRpbWVzdGFtcE1zKClcblxuXHRcdGF3YWl0IHRyYW5zYWN0aW9uLnB1dChNZXRhRGF0YU9TLCBNZXRhZGF0YS5sYXN0RXZlbnRJbmRleFRpbWVNcywgbm93KVxuXHR9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFlYSxpQkFBTixNQUFxQjtDQUMzQjtDQUNBO0NBQ0E7Q0FDQTtDQUVBLFlBQVlBLE1BQW1CQyxJQUFRQyxRQUFzQkMsa0JBQTZDO0FBQ3pHLE9BQUssUUFBUTtBQUNiLE9BQUssTUFBTTtBQUNYLE9BQUssVUFBVTtBQUNmLE9BQUssbUJBQW1CO0NBQ3hCO0NBRUQsMEJBQTBCQyxTQUFtRDtFQUM1RSxNQUFNLGVBQWVDLFdBQWU7RUFDcEMsSUFBSSxvQkFBb0IsS0FBSyxNQUFNLGdDQUFnQyxTQUFTO0dBQzNFO0lBQ0MsV0FBVyxhQUFhLE9BQU87SUFDL0IsT0FBTyxNQUFNLFFBQVE7R0FDckI7R0FDRDtJQUNDLFdBQVcsYUFBYSxPQUFPO0lBQy9CLE9BQU8sTUFBTSxRQUFRO0dBQ3JCO0dBQ0Q7SUFDQyxXQUFXLGFBQWEsT0FBTztJQUMvQixPQUFPLE1BQU0sUUFBUSxZQUFZO0dBQ2pDO0dBQ0Q7SUFDQyxXQUFXLGFBQWEsT0FBTztJQUMvQixPQUFPLE1BQU0sUUFBUTtHQUNyQjtHQUNEO0lBQ0MsV0FBVyxhQUFhLE9BQU87SUFDL0IsT0FBTyxNQUFNLFFBQVEsU0FBUztHQUM5QjtHQUNEO0lBQ0MsV0FBVyxhQUFhLE9BQU87SUFDL0IsT0FBTyxNQUFNLFFBQVE7R0FDckI7R0FDRDtJQUNDLFdBQVcsYUFBYSxPQUFPO0lBQy9CLE9BQU8sTUFBTSxRQUFRO0dBQ3JCO0dBQ0Q7SUFDQyxXQUFXLGFBQWEsYUFBYTtJQUNyQyxPQUFPLE1BQU0sUUFBUSxVQUFVLElBQUksQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLEtBQUssSUFBSTtHQUM5RDtHQUNEO0lBQ0MsV0FBVyxhQUFhLGFBQWE7SUFDckMsT0FBTyxNQUFNLFFBQVEsY0FBYyxJQUFJLENBQUMsUUFBUSxJ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