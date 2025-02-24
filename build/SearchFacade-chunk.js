import "./dist-chunk.js";
import "./ProgrammingError-chunk.js";
import "./Env-chunk.js";
import { TypeRef, arrayHash, asyncFind, contains, downcast, getDayShifted, getStartOfDay, isEmpty, isNotNull, isSameTypeRef, neverNull, ofClass, pMap, promiseMapCompat, tokenize, uint8ArrayToBase64 } from "./dist2-chunk.js";
import { FULL_INDEXED_TIMESTAMP, NOTHING_INDEXED_TIMESTAMP } from "./TutanotaConstants-chunk.js";
import { AssociationType, Cardinality, ValueType, compareNewestFirst, elementIdPart, firstBiggerThanSecond, timestampToGeneratedId } from "./EntityUtils-chunk.js";
import "./TypeModels-chunk.js";
import { MailTypeRef } from "./TypeRefs-chunk.js";
import "./TypeModels2-chunk.js";
import "./TypeRefs2-chunk.js";
import "./ParserCombinator-chunk.js";
import { resolveTypeReference } from "./EntityFunctions-chunk.js";
import "./TypeModels3-chunk.js";
import "./ModelInfo-chunk.js";
import "./ErrorUtils-chunk.js";
import { NotAuthorizedError, NotFoundError } from "./RestError-chunk.js";
import "./OutOfSyncError-chunk.js";
import "./CancelledError-chunk.js";
import "./SuspensionError-chunk.js";
import "./LoginIncompleteError-chunk.js";
import "./CryptoError-chunk.js";
import "./error-chunk.js";
import "./RecipientsNotFoundError-chunk.js";
import "./DbError-chunk.js";
import "./QuotaExceededError-chunk.js";
import "./DeviceStorageUnavailableError-chunk.js";
import "./MailBodyTooLargeError-chunk.js";
import "./ImportError-chunk.js";
import "./WebauthnError-chunk.js";
import "./PermissionError-chunk.js";
import "./EntityUpdateUtils-chunk.js";
import "./dist3-chunk.js";
import "./KeyLoaderFacade-chunk.js";
import "./MailChecks-chunk.js";
import "./ProgressMonitor-chunk.js";
import "./CommonMailUtils-chunk.js";
import { ElementDataOS, SearchIndexMetaDataOS, SearchIndexOS, SearchIndexWordsIndex } from "./IndexTables-chunk.js";
import { decryptMetaData, decryptSearchIndexEntry, encryptIndexKeyBase64, getIdFromEncSearchIndexEntry, getPerformanceTimestamp, iterateBinaryBlocks, markEnd, markStart, printMeasure, typeRefToTypeInfo } from "./IndexUtils-chunk.js";
import "./SearchTypes-chunk.js";
import { INITIAL_MAIL_INDEX_INTERVAL_DAYS } from "./MailIndexer-chunk.js";

//#region src/mail-app/workerUtils/index/SearchFacade.ts
var SearchFacade = class {
	_db;
	_mailIndexer;
	_suggestionFacades;
	_promiseMapCompat;
	_entityClient;
	constructor(userFacade, db, mailIndexer, suggestionFacades, browserData, entityClient) {
		this.userFacade = userFacade;
		this._db = db;
		this._mailIndexer = mailIndexer;
		this._suggestionFacades = suggestionFacades;
		this._promiseMapCompat = promiseMapCompat(browserData.needsMicrotaskHack);
		this._entityClient = entityClient;
	}
	/****************************** SEARCH ******************************/
	/**
	* Invoke an AND-query.
	* @param query is tokenized. All tokens must be matched by the result (AND-query)
	* @param minSuggestionCount If minSuggestionCount > 0 regards the last query token as suggestion token and includes suggestion results for that token, but not less than minSuggestionCount
	* @returns The result ids are sorted by id from newest to oldest
	*/
	search(query, restriction, minSuggestionCount, maxResults) {
		return this._db.initialized.then(() => {
			let searchTokens = tokenize(query);
			let result = {
				query,
				restriction,
				results: [],
				currentIndexTimestamp: this._getSearchEndTimestamp(restriction),
				lastReadSearchIndexRow: searchTokens.map((token) => [token, null]),
				matchWordOrder: searchTokens.length > 1 && query.startsWith("\"") && query.endsWith("\""),
				moreResults: [],
				moreResultsEntries: []
			};
			if (searchTokens.length > 0) {
				let isFirstWordSearch = searchTokens.length === 1;
				let before = getPerformanceTimestamp();
				let suggestionFacade = this._suggestionFacades.find((f) => isSameTypeRef(f.type, restriction.type));
				let searchPromise;
				if (minSuggestionCount > 0 && isFirstWordSearch && suggestionFacade) {
					let addSuggestionBefore = getPerformanceTimestamp();
					searchPromise = this._addSuggestions(searchTokens[0], suggestionFacade, minSuggestionCount, result).then(() => {
						if (result.results.length < minSuggestionCount) {
							let searchForTokensAfterSuggestionsBefore = getPerformanceTimestamp();
							return this._startOrContinueSearch(result).then((result$1) => {
								return result$1;
							});
						}
					});
				} else if (minSuggestionCount > 0 && !isFirstWordSearch && suggestionFacade) {
					let suggestionToken = neverNull(result.lastReadSearchIndexRow.pop())[0];
					searchPromise = this._startOrContinueSearch(result).then(() => {
						result.results.sort(compareNewestFirst);
						return this._loadAndReduce(restriction, result, suggestionToken, minSuggestionCount);
					});
				} else searchPromise = this._startOrContinueSearch(result, maxResults);
				return searchPromise.then(() => {
					result.results.sort(compareNewestFirst);
					return result;
				});
			} else return Promise.resolve(result);
		});
	}
	async _loadAndReduce(restriction, result, suggestionToken, minSuggestionCount) {
		if (result.results.length > 0) {
			const model = await resolveTypeReference(restriction.type);
			const suggestionQuery = result.matchWordOrder ? normalizeQuery(result.query) : suggestionToken;
			const finalResults = [];
			for (const id of result.results) if (finalResults.length >= minSuggestionCount) break;
else {
				let entity;
				try {
					entity = await this._entityClient.load(restriction.type, id);
				} catch (e) {
					if (e instanceof NotFoundError || e instanceof NotAuthorizedError) continue;
else throw e;
				}
				const found = await this._containsSuggestionToken(entity, model, restriction.attributeIds, suggestionQuery, result.matchWordOrder);
				if (found) finalResults.push(id);
			}
			result.results = finalResults;
		} else return Promise.resolve();
	}
	/**
	* Looks for a word in any of the entities string values or aggregations string values that starts with suggestionToken.
	* @param attributeIds Only looks in these attribute ids (or all its string values if it is an aggregation attribute id. If null, looks in all string values and aggregations.
	*/
	_containsSuggestionToken(entity, model, attributeIds, suggestionToken, matchWordOrder) {
		let attributeNames;
		if (!attributeIds) attributeNames = Object.keys(model.values).concat(Object.keys(model.associations));
else attributeNames = attributeIds.map((id) => neverNull(Object.keys(model.values).find((valueName) => model.values[valueName].id === id) || Object.keys(model.associations).find((associationName) => model.associations[associationName].id === id)));
		return asyncFind(attributeNames, async (attributeName) => {
			if (model.values[attributeName] && model.values[attributeName].type === ValueType.String && entity[attributeName]) if (matchWordOrder) return Promise.resolve(normalizeQuery(entity[attributeName]).indexOf(suggestionToken) !== -1);
else {
				let words = tokenize(entity[attributeName]);
				return Promise.resolve(words.some((w) => w.startsWith(suggestionToken)));
			}
else if (model.associations[attributeName] && model.associations[attributeName].type === AssociationType.Aggregation && entity[attributeName]) {
				let aggregates = model.associations[attributeName].cardinality === Cardinality.Any ? entity[attributeName] : [entity[attributeName]];
				const refModel = await resolveTypeReference(new TypeRef(model.app, model.associations[attributeName].refType));
				return asyncFind(aggregates, (aggregate) => {
					return this._containsSuggestionToken(downcast(aggregate), refModel, null, suggestionToken, matchWordOrder);
				}).then((found) => found != null);
			} else return Promise.resolve(false);
		}).then((found) => found != null);
	}
	_startOrContinueSearch(searchResult, maxResults) {
		markStart("findIndexEntries");
		const nextScheduledIndexingRun = getStartOfDay(getDayShifted(new Date(this._mailIndexer.currentIndexTimestamp), INITIAL_MAIL_INDEX_INTERVAL_DAYS));
		const theDayAfterTomorrow = getStartOfDay(getDayShifted(new Date(), 1));
		if (searchResult.moreResults.length === 0 && nextScheduledIndexingRun.getTime() > theDayAfterTomorrow.getTime() && !this._mailIndexer.isIndexing) this._mailIndexer.extendIndexIfNeeded(this.userFacade.getLoggedInUser(), getStartOfDay(getDayShifted(new Date(), -INITIAL_MAIL_INDEX_INTERVAL_DAYS)).getTime());
		let moreResultsEntries;
		if (maxResults && searchResult.moreResults.length >= maxResults) moreResultsEntries = Promise.resolve(searchResult.moreResults);
else moreResultsEntries = this._findIndexEntries(searchResult, maxResults).then((keyToEncryptedIndexEntries) => {
			markEnd("findIndexEntries");
			markStart("_filterByEncryptedId");
			return this._filterByEncryptedId(keyToEncryptedIndexEntries);
		}).then((keyToEncryptedIndexEntries) => {
			markEnd("_filterByEncryptedId");
			markStart("_decryptSearchResult");
			return this._decryptSearchResult(keyToEncryptedIndexEntries);
		}).then((keyToIndexEntries) => {
			markEnd("_decryptSearchResult");
			markStart("_filterByTypeAndAttributeAndTime");
			return this._filterByTypeAndAttributeAndTime(keyToIndexEntries, searchResult.restriction);
		}).then((keyToIndexEntries) => {
			markEnd("_filterByTypeAndAttributeAndTime");
			markStart("_reduceWords");
			return this._reduceWords(keyToIndexEntries, searchResult.matchWordOrder);
		}).then((searchIndexEntries) => {
			markEnd("_reduceWords");
			markStart("_reduceToUniqueElementIds");
			return this._reduceToUniqueElementIds(searchIndexEntries, searchResult);
		}).then((additionalEntries) => {
			markEnd("_reduceToUniqueElementIds");
			return additionalEntries.concat(searchResult.moreResults);
		});
		return moreResultsEntries.then((searchIndexEntries) => {
			markStart("_filterByListIdAndGroupSearchResults");
			return this._filterByListIdAndGroupSearchResults(searchIndexEntries, searchResult, maxResults);
		}).then((result) => {
			markEnd("_filterByListIdAndGroupSearchResults");
			if (typeof self !== "undefined") printMeasure("query: " + searchResult.query + ", maxResults: " + String(maxResults), [
				"findIndexEntries",
				"_filterByEncryptedId",
				"_decryptSearchResult",
				"_filterByTypeAndAttributeAndTime",
				"_reduceWords",
				"_reduceToUniqueElementIds",
				"_filterByListIdAndGroupSearchResults"
			]);
			return result;
		});
	}
	/**
	* Adds suggestions for the given searchToken to the searchResult until at least minSuggestionCount results are existing
	*/
	_addSuggestions(searchToken, suggestionFacade, minSuggestionCount, searchResult) {
		let suggestions = suggestionFacade.getSuggestions(searchToken);
		return pMap(suggestions, (suggestion) => {
			if (searchResult.results.length < minSuggestionCount) {
				const suggestionResult = {
					query: suggestion,
					restriction: searchResult.restriction,
					results: searchResult.results,
					currentIndexTimestamp: searchResult.currentIndexTimestamp,
					lastReadSearchIndexRow: [[suggestion, null]],
					matchWordOrder: false,
					moreResults: [],
					moreResultsEntries: []
				};
				return this._startOrContinueSearch(suggestionResult);
			}
		});
	}
	_findIndexEntries(searchResult, maxResults) {
		const typeInfo = typeRefToTypeInfo(searchResult.restriction.type);
		const firstSearchTokenInfo = searchResult.lastReadSearchIndexRow[0];
		return this._db.dbFacade.createTransaction(true, [SearchIndexOS, SearchIndexMetaDataOS]).then((transaction) => {
			return this._promiseMapCompat(searchResult.lastReadSearchIndexRow, (tokenInfo, index) => {
				const [searchToken] = tokenInfo;
				let indexKey = encryptIndexKeyBase64(this._db.key, searchToken, this._db.iv);
				return transaction.get(SearchIndexMetaDataOS, indexKey, SearchIndexWordsIndex).then((metaData) => {
					if (!metaData) {
						tokenInfo[1] = 0;
						return {
							id: -index,
							word: indexKey,
							rows: []
						};
					}
					return decryptMetaData(this._db.key, metaData);
				});
			}).thenOrApply((metaRows) => {
				const rowsToReadForIndexKeys = this._findRowsToReadFromMetaData(firstSearchTokenInfo, metaRows, typeInfo, maxResults);
				return this._promiseMapCompat(rowsToReadForIndexKeys, (rowsToRead) => {
					return this._promiseMapCompat(rowsToRead.rows, (entry) => this._findEntriesForMetadata(transaction, entry)).thenOrApply((a) => a.flat()).thenOrApply((indexEntries) => {
						return indexEntries.map((entry) => ({
							encEntry: entry,
							idHash: arrayHash(getIdFromEncSearchIndexEntry(entry))
						}));
					}).thenOrApply((indexEntries) => {
						return {
							indexKey: rowsToRead.indexKey,
							indexEntries
						};
					}).value;
				}).value;
			}).toPromise();
		});
	}
	_findRowsToReadFromMetaData(firstTokenInfo, safeMetaDataRows, typeInfo, maxResults) {
		const leadingRow = safeMetaDataRows[0];
		const otherRows = safeMetaDataRows.slice(1);
		const rangeForLeadingRow = this._findRowsToRead(leadingRow, typeInfo, firstTokenInfo[1] || Number.MAX_SAFE_INTEGER, maxResults);
		const rowsForLeadingRow = [{
			indexKey: leadingRow.word,
			rows: rangeForLeadingRow.metaEntries
		}];
		firstTokenInfo[1] = rangeForLeadingRow.oldestTimestamp;
		const rowsForOtherRows = otherRows.map((r) => {
			return {
				indexKey: r.word,
				rows: this._findRowsToReadByTimeRange(r, typeInfo, rangeForLeadingRow.newestRowTimestamp, rangeForLeadingRow.oldestTimestamp)
			};
		});
		return rowsForLeadingRow.concat(rowsForOtherRows);
	}
	_findEntriesForMetadata(transaction, entry) {
		return transaction.get(SearchIndexOS, entry.key).then((indexEntriesRow) => {
			if (!indexEntriesRow) return [];
			const result = new Array(entry.size);
			iterateBinaryBlocks(indexEntriesRow, (block, s, e, iteration) => {
				result[iteration] = block;
			});
			return result;
		});
	}
	_findRowsToReadByTimeRange(metaData, typeInfo, fromNewestTimestamp, toOldestTimestamp) {
		const filteredRows = metaData.rows.filter((r) => r.app === typeInfo.appId && r.type === typeInfo.typeId);
		filteredRows.reverse();
		const passedRows = [];
		for (let row of filteredRows) if (row.oldestElementTimestamp < fromNewestTimestamp) {
			passedRows.push(row);
			if (row.oldestElementTimestamp <= toOldestTimestamp) break;
		}
		return passedRows;
	}
	_findRowsToRead(metaData, typeInfo, mustBeOlderThan, maxResults) {
		const filteredRows = metaData.rows.filter((r) => r.app === typeInfo.appId && r.type === typeInfo.typeId);
		filteredRows.reverse();
		let entitiesToRead = 0;
		let lastReadRowTimestamp = 0;
		let newestRowTimestamp = Number.MAX_SAFE_INTEGER;
		let rowsToRead;
		if (maxResults) {
			rowsToRead = [];
			for (let r of filteredRows) if (r.oldestElementTimestamp < mustBeOlderThan) if (entitiesToRead < 1e3) {
				entitiesToRead += r.size;
				lastReadRowTimestamp = r.oldestElementTimestamp;
				rowsToRead.push(r);
			} else break;
else newestRowTimestamp = r.oldestElementTimestamp;
		} else rowsToRead = filteredRows;
		return {
			metaEntries: rowsToRead,
			oldestTimestamp: lastReadRowTimestamp,
			newestRowTimestamp
		};
	}
	/**
	* Reduces the search result by filtering out all mailIds that don't match all search tokens
	*/
	_filterByEncryptedId(results) {
		let matchingEncIds = null;
		for (const keyToEncryptedIndexEntry of results) if (matchingEncIds == null) matchingEncIds = new Set(keyToEncryptedIndexEntry.indexEntries.map((entry) => entry.idHash));
else {
			const filtered = new Set();
			for (const indexEntry of keyToEncryptedIndexEntry.indexEntries) if (matchingEncIds.has(indexEntry.idHash)) filtered.add(indexEntry.idHash);
			matchingEncIds = filtered;
		}
		return results.map((r) => {
			return {
				indexKey: r.indexKey,
				indexEntries: r.indexEntries.filter((entry) => matchingEncIds?.has(entry.idHash))
			};
		});
	}
	_decryptSearchResult(results) {
		return results.map((searchResult) => {
			return {
				indexKey: searchResult.indexKey,
				indexEntries: searchResult.indexEntries.map((entry) => decryptSearchIndexEntry(this._db.key, entry.encEntry, this._db.iv))
			};
		});
	}
	_filterByTypeAndAttributeAndTime(results, restriction) {
		let endTimestamp = this._getSearchEndTimestamp(restriction);
		const minIncludedId = timestampToGeneratedId(endTimestamp);
		const maxExcludedId = restriction.start ? timestampToGeneratedId(restriction.start + 1) : null;
		for (const result of results) result.indexEntries = result.indexEntries.filter((entry) => {
			return this._isValidAttributeAndTime(restriction, entry, minIncludedId, maxExcludedId);
		});
		let matchingIds = null;
		for (const keyToIndexEntry of results) if (!matchingIds) matchingIds = new Set(keyToIndexEntry.indexEntries.map((entry) => entry.id));
else {
			let filtered = new Set();
			for (const entry of keyToIndexEntry.indexEntries) if (matchingIds.has(entry.id)) filtered.add(entry.id);
			matchingIds = filtered;
		}
		return results.map((r) => {
			return {
				indexKey: r.indexKey,
				indexEntries: r.indexEntries.filter((entry) => matchingIds?.has(entry.id))
			};
		});
	}
	_isValidAttributeAndTime(restriction, entry, minIncludedId, maxExcludedId) {
		if (restriction.attributeIds) {
			if (!contains(restriction.attributeIds, entry.attribute)) return false;
		}
		if (maxExcludedId) {
			if (!firstBiggerThanSecond(maxExcludedId, entry.id)) return false;
		}
		return !firstBiggerThanSecond(minIncludedId, entry.id);
	}
	_reduceWords(results, matchWordOrder) {
		if (matchWordOrder) return results[0].indexEntries.filter((firstWordEntry) => {
			let filteredPositions = firstWordEntry.positions.slice();
			for (let i = 1; i < results.length; i++) {
				let entry = results[i].indexEntries.find((e) => e.id === firstWordEntry.id && e.attribute === firstWordEntry.attribute);
				if (entry) filteredPositions = filteredPositions.filter((firstWordPosition) => neverNull(entry).positions.find((position) => position === firstWordPosition + i));
else filteredPositions = [];
			}
			return filteredPositions.length > 0;
		});
else return results[0].indexEntries;
	}
	_reduceToUniqueElementIds(results, previousResult) {
		const uniqueIds = new Set();
		return results.filter((entry) => {
			if (!uniqueIds.has(entry.id) && !previousResult.results.some((r) => r[1] === entry.id)) {
				uniqueIds.add(entry.id);
				return true;
			} else return false;
		});
	}
	_filterByListIdAndGroupSearchResults(indexEntries, searchResult, maxResults) {
		indexEntries.sort((l, r) => compareNewestFirst(l.id, r.id));
		const entriesCopy = downcast(indexEntries.slice());
		return this._db.dbFacade.createTransaction(true, [ElementDataOS]).then((transaction) => pMap(indexEntries.slice(0, maxResults || indexEntries.length + 1), async (entry, index) => {
			return transaction.get(ElementDataOS, uint8ArrayToBase64(entry.encId)).then((elementData) => {
				entriesCopy[index] = null;
				if (elementData) return [elementData[0], entry.id];
else return null;
			});
		}, { concurrency: 5 })).then((intermediateResults) => intermediateResults.filter(isNotNull)).then(async (intermediateResults) => {
			if (isEmpty(searchResult.restriction.folderIds)) return intermediateResults;
else {
				const mails = await Promise.all(intermediateResults.map((intermediateResultId) => this._entityClient.load(MailTypeRef, intermediateResultId).catch(ofClass(NotFoundError, () => {
					console.log(`Could not find updated mail ${JSON.stringify(intermediateResultId)}`);
					return null;
				}))));
				return mails.filter(isNotNull).filter((mail) => {
					let folderIds = mail.sets.map((setId) => elementIdPart(setId));
					return folderIds.some((folderId) => searchResult.restriction.folderIds.includes(folderId));
				}).map((mail) => mail._id);
			}
		}).then((newResults) => {
			searchResult.results.push(...newResults);
			searchResult.moreResults = entriesCopy.filter(isNotNull);
		});
	}
	async getMoreSearchResults(searchResult, moreResultCount) {
		await this._startOrContinueSearch(searchResult, moreResultCount);
		return searchResult;
	}
	_getSearchEndTimestamp(restriction) {
		if (restriction.end) return restriction.end;
else if (isSameTypeRef(MailTypeRef, restriction.type)) return this._mailIndexer.currentIndexTimestamp === NOTHING_INDEXED_TIMESTAMP ? Date.now() : this._mailIndexer.currentIndexTimestamp;
else return FULL_INDEXED_TIMESTAMP;
	}
};
function normalizeQuery(query) {
	return tokenize(query).join(" ");
}

//#endregion
export { SearchFacade };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2VhcmNoRmFjYWRlLWNodW5rLmpzIiwibmFtZXMiOlsidXNlckZhY2FkZTogVXNlckZhY2FkZSIsImRiOiBEYiIsIm1haWxJbmRleGVyOiBNYWlsSW5kZXhlciIsInN1Z2dlc3Rpb25GYWNhZGVzOiBTdWdnZXN0aW9uRmFjYWRlPGFueT5bXSIsImJyb3dzZXJEYXRhOiBCcm93c2VyRGF0YSIsImVudGl0eUNsaWVudDogRW50aXR5Q2xpZW50IiwicXVlcnk6IHN0cmluZyIsInJlc3RyaWN0aW9uOiBTZWFyY2hSZXN0cmljdGlvbiIsIm1pblN1Z2dlc3Rpb25Db3VudDogbnVtYmVyIiwibWF4UmVzdWx0cz86IG51bWJlciIsInJlc3VsdDogU2VhcmNoUmVzdWx0IiwicmVzdWx0Iiwic3VnZ2VzdGlvblRva2VuOiBzdHJpbmciLCJmaW5hbFJlc3VsdHM6IElkVHVwbGVbXSIsImVudGl0eTogUmVjb3JkPHN0cmluZywgYW55PiIsIm1vZGVsOiBUeXBlTW9kZWwiLCJhdHRyaWJ1dGVJZHM6IG51bWJlcltdIHwgbnVsbCIsIm1hdGNoV29yZE9yZGVyOiBib29sZWFuIiwiYXR0cmlidXRlTmFtZXM6IHN0cmluZ1tdIiwic2VhcmNoUmVzdWx0OiBTZWFyY2hSZXN1bHQiLCJtb3JlUmVzdWx0c0VudHJpZXM6IFByb21pc2U8QXJyYXk8TW9yZVJlc3VsdHNJbmRleEVudHJ5Pj4iLCJzZWFyY2hJbmRleEVudHJpZXM6IE1vcmVSZXN1bHRzSW5kZXhFbnRyeVtdIiwic2VhcmNoVG9rZW46IHN0cmluZyIsInN1Z2dlc3Rpb25GYWNhZGU6IFN1Z2dlc3Rpb25GYWNhZGU8YW55PiIsInN1Z2dlc3Rpb25SZXN1bHQ6IFNlYXJjaFJlc3VsdCIsIm1heFJlc3VsdHM6IG51bWJlciB8IG51bGwgfCB1bmRlZmluZWQiLCJtZXRhRGF0YTogU2VhcmNoSW5kZXhNZXRhRGF0YURiUm93IHwgbnVsbCIsInJvd3NUb1JlYWQ6IFJvd3NUb1JlYWRGb3JJbmRleEtleSIsImluZGV4RW50cmllczogRW5jcnlwdGVkU2VhcmNoSW5kZXhFbnRyeVtdIiwiaW5kZXhFbnRyaWVzOiBFbmNyeXB0ZWRTZWFyY2hJbmRleEVudHJ5V2l0aEhhc2hbXSIsImZpcnN0VG9rZW5JbmZvOiBbc3RyaW5nLCBudW1iZXIgfCBudWxsXSIsInNhZmVNZXRhRGF0YVJvd3M6IEFycmF5PFNlYXJjaEluZGV4TWV0YURhdGFSb3c+IiwidHlwZUluZm86IFR5cGVJbmZvIiwidHJhbnNhY3Rpb246IERiVHJhbnNhY3Rpb24iLCJlbnRyeTogU2VhcmNoSW5kZXhNZXRhZGF0YUVudHJ5IiwibWV0YURhdGE6IFNlYXJjaEluZGV4TWV0YURhdGFSb3ciLCJmcm9tTmV3ZXN0VGltZXN0YW1wOiBudW1iZXIiLCJ0b09sZGVzdFRpbWVzdGFtcDogbnVtYmVyIiwicGFzc2VkUm93czogU2VhcmNoSW5kZXhNZXRhZGF0YUVudHJ5W10iLCJtdXN0QmVPbGRlclRoYW46IG51bWJlciIsInJlc3VsdHM6IEtleVRvRW5jcnlwdGVkSW5kZXhFbnRyaWVzW10iLCJtYXRjaGluZ0VuY0lkczogU2V0PG51bWJlcj4gfCBudWxsIiwicmVzdWx0czogS2V5VG9JbmRleEVudHJpZXNbXSIsIm1hdGNoaW5nSWRzOiBTZXQ8SWQ+IHwgbnVsbCIsImVudHJ5OiBTZWFyY2hJbmRleEVudHJ5IiwibWluSW5jbHVkZWRJZDogSWQiLCJtYXhFeGNsdWRlZElkOiBJZCB8IG51bGwiLCJyZXN1bHRzOiBSZWFkb25seUFycmF5PERlY3J5cHRlZFNlYXJjaEluZGV4RW50cnk+IiwicHJldmlvdXNSZXN1bHQ6IFNlYXJjaFJlc3VsdCIsImluZGV4RW50cmllczogQXJyYXk8TW9yZVJlc3VsdHNJbmRleEVudHJ5PiIsImVudHJpZXNDb3B5OiBBcnJheTxNb3JlUmVzdWx0c0luZGV4RW50cnkgfCBudWxsPiIsImVsZW1lbnREYXRhOiBFbGVtZW50RGF0YURiUm93IHwgbnVsbCIsImZvbGRlcklkczogQXJyYXk8SWQ+IiwibW9yZVJlc3VsdENvdW50OiBudW1iZXIiXSwic291cmNlcyI6WyIuLi9zcmMvbWFpbC1hcHAvd29ya2VyVXRpbHMvaW5kZXgvU2VhcmNoRmFjYWRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1haWxUeXBlUmVmIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvZW50aXRpZXMvdHV0YW5vdGEvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgRGJUcmFuc2FjdGlvbiB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9zZWFyY2gvRGJGYWNhZGUuanNcIlxuaW1wb3J0IHsgcmVzb2x2ZVR5cGVSZWZlcmVuY2UgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vRW50aXR5RnVuY3Rpb25zLmpzXCJcbmltcG9ydCB7XG5cdGFycmF5SGFzaCxcblx0YXN5bmNGaW5kLFxuXHRjb250YWlucyxcblx0ZG93bmNhc3QsXG5cdGdldERheVNoaWZ0ZWQsXG5cdGdldFN0YXJ0T2ZEYXksXG5cdGlzRW1wdHksXG5cdGlzTm90TnVsbCxcblx0aXNTYW1lVHlwZVJlZixcblx0bmV2ZXJOdWxsLFxuXHRvZkNsYXNzLFxuXHRwcm9taXNlTWFwLFxuXHRwcm9taXNlTWFwQ29tcGF0LFxuXHRQcm9taXNlTWFwRm4sXG5cdHRva2VuaXplLFxuXHRUeXBlUmVmLFxuXHR1aW50OEFycmF5VG9CYXNlNjQsXG59IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHR5cGUge1xuXHREYixcblx0RGVjcnlwdGVkU2VhcmNoSW5kZXhFbnRyeSxcblx0RWxlbWVudERhdGFEYlJvdyxcblx0RW5jcnlwdGVkU2VhcmNoSW5kZXhFbnRyeSxcblx0RW5jcnlwdGVkU2VhcmNoSW5kZXhFbnRyeVdpdGhIYXNoLFxuXHRLZXlUb0VuY3J5cHRlZEluZGV4RW50cmllcyxcblx0S2V5VG9JbmRleEVudHJpZXMsXG5cdE1vcmVSZXN1bHRzSW5kZXhFbnRyeSxcblx0U2VhcmNoSW5kZXhFbnRyeSxcblx0U2VhcmNoSW5kZXhNZXRhRGF0YURiUm93LFxuXHRTZWFyY2hJbmRleE1ldGFkYXRhRW50cnksXG5cdFNlYXJjaEluZGV4TWV0YURhdGFSb3csXG5cdFNlYXJjaFJlc3RyaWN0aW9uLFxuXHRTZWFyY2hSZXN1bHQsXG59IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9zZWFyY2gvU2VhcmNoVHlwZXMuanNcIlxuaW1wb3J0IHR5cGUgeyBUeXBlSW5mbyB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9zZWFyY2gvSW5kZXhVdGlscy5qc1wiXG5pbXBvcnQge1xuXHRkZWNyeXB0TWV0YURhdGEsXG5cdGRlY3J5cHRTZWFyY2hJbmRleEVudHJ5LFxuXHRlbmNyeXB0SW5kZXhLZXlCYXNlNjQsXG5cdGdldElkRnJvbUVuY1NlYXJjaEluZGV4RW50cnksXG5cdGdldFBlcmZvcm1hbmNlVGltZXN0YW1wLFxuXHRtYXJrRW5kLFxuXHRtYXJrU3RhcnQsXG5cdHByaW50TWVhc3VyZSxcblx0dHlwZVJlZlRvVHlwZUluZm8sXG59IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9zZWFyY2gvSW5kZXhVdGlscy5qc1wiXG5pbXBvcnQgeyBGVUxMX0lOREVYRURfVElNRVNUQU1QLCBOT1RISU5HX0lOREVYRURfVElNRVNUQU1QIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL1R1dGFub3RhQ29uc3RhbnRzLmpzXCJcbmltcG9ydCB7IGNvbXBhcmVOZXdlc3RGaXJzdCwgZWxlbWVudElkUGFydCwgZmlyc3RCaWdnZXJUaGFuU2Vjb25kLCB0aW1lc3RhbXBUb0dlbmVyYXRlZElkIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL3V0aWxzL0VudGl0eVV0aWxzLmpzXCJcbmltcG9ydCB7IElOSVRJQUxfTUFJTF9JTkRFWF9JTlRFUlZBTF9EQVlTLCBNYWlsSW5kZXhlciB9IGZyb20gXCIuL01haWxJbmRleGVyLmpzXCJcbmltcG9ydCB7IFN1Z2dlc3Rpb25GYWNhZGUgfSBmcm9tIFwiLi9TdWdnZXN0aW9uRmFjYWRlLmpzXCJcbmltcG9ydCB7IEFzc29jaWF0aW9uVHlwZSwgQ2FyZGluYWxpdHksIFZhbHVlVHlwZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9FbnRpdHlDb25zdGFudHMuanNcIlxuaW1wb3J0IHsgTm90QXV0aG9yaXplZEVycm9yLCBOb3RGb3VuZEVycm9yIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL2Vycm9yL1Jlc3RFcnJvci5qc1wiXG5pbXBvcnQgeyBpdGVyYXRlQmluYXJ5QmxvY2tzIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL3NlYXJjaC9TZWFyY2hJbmRleEVuY29kaW5nLmpzXCJcbmltcG9ydCB0eXBlIHsgQnJvd3NlckRhdGEgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21pc2MvQ2xpZW50Q29uc3RhbnRzLmpzXCJcbmltcG9ydCB0eXBlIHsgVHlwZU1vZGVsIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL0VudGl0eVR5cGVzLmpzXCJcbmltcG9ydCB7IEVudGl0eUNsaWVudCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9FbnRpdHlDbGllbnQuanNcIlxuaW1wb3J0IHsgVXNlckZhY2FkZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9mYWNhZGVzL1VzZXJGYWNhZGUuanNcIlxuaW1wb3J0IHsgRWxlbWVudERhdGFPUywgU2VhcmNoSW5kZXhNZXRhRGF0YU9TLCBTZWFyY2hJbmRleE9TLCBTZWFyY2hJbmRleFdvcmRzSW5kZXggfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvc2VhcmNoL0luZGV4VGFibGVzLmpzXCJcblxudHlwZSBSb3dzVG9SZWFkRm9ySW5kZXhLZXkgPSB7XG5cdGluZGV4S2V5OiBzdHJpbmdcblx0cm93czogQXJyYXk8U2VhcmNoSW5kZXhNZXRhZGF0YUVudHJ5PlxufVxuXG5leHBvcnQgY2xhc3MgU2VhcmNoRmFjYWRlIHtcblx0X2RiOiBEYlxuXHRfbWFpbEluZGV4ZXI6IE1haWxJbmRleGVyXG5cdF9zdWdnZXN0aW9uRmFjYWRlczogU3VnZ2VzdGlvbkZhY2FkZTxhbnk+W11cblx0X3Byb21pc2VNYXBDb21wYXQ6IFByb21pc2VNYXBGblxuXHRfZW50aXR5Q2xpZW50OiBFbnRpdHlDbGllbnRcblxuXHRjb25zdHJ1Y3Rvcihcblx0XHRwcml2YXRlIHJlYWRvbmx5IHVzZXJGYWNhZGU6IFVzZXJGYWNhZGUsXG5cdFx0ZGI6IERiLFxuXHRcdG1haWxJbmRleGVyOiBNYWlsSW5kZXhlcixcblx0XHRzdWdnZXN0aW9uRmFjYWRlczogU3VnZ2VzdGlvbkZhY2FkZTxhbnk+W10sXG5cdFx0YnJvd3NlckRhdGE6IEJyb3dzZXJEYXRhLFxuXHRcdGVudGl0eUNsaWVudDogRW50aXR5Q2xpZW50LFxuXHQpIHtcblx0XHR0aGlzLl9kYiA9IGRiXG5cdFx0dGhpcy5fbWFpbEluZGV4ZXIgPSBtYWlsSW5kZXhlclxuXHRcdHRoaXMuX3N1Z2dlc3Rpb25GYWNhZGVzID0gc3VnZ2VzdGlvbkZhY2FkZXNcblx0XHR0aGlzLl9wcm9taXNlTWFwQ29tcGF0ID0gcHJvbWlzZU1hcENvbXBhdChicm93c2VyRGF0YS5uZWVkc01pY3JvdGFza0hhY2spXG5cdFx0dGhpcy5fZW50aXR5Q2xpZW50ID0gZW50aXR5Q2xpZW50XG5cdH1cblxuXHQvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIFNFQVJDSCAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblx0LyoqXG5cdCAqIEludm9rZSBhbiBBTkQtcXVlcnkuXG5cdCAqIEBwYXJhbSBxdWVyeSBpcyB0b2tlbml6ZWQuIEFsbCB0b2tlbnMgbXVzdCBiZSBtYXRjaGVkIGJ5IHRoZSByZXN1bHQgKEFORC1xdWVyeSlcblx0ICogQHBhcmFtIG1pblN1Z2dlc3Rpb25Db3VudCBJZiBtaW5TdWdnZXN0aW9uQ291bnQgPiAwIHJlZ2FyZHMgdGhlIGxhc3QgcXVlcnkgdG9rZW4gYXMgc3VnZ2VzdGlvbiB0b2tlbiBhbmQgaW5jbHVkZXMgc3VnZ2VzdGlvbiByZXN1bHRzIGZvciB0aGF0IHRva2VuLCBidXQgbm90IGxlc3MgdGhhbiBtaW5TdWdnZXN0aW9uQ291bnRcblx0ICogQHJldHVybnMgVGhlIHJlc3VsdCBpZHMgYXJlIHNvcnRlZCBieSBpZCBmcm9tIG5ld2VzdCB0byBvbGRlc3Rcblx0ICovXG5cdHNlYXJjaChxdWVyeTogc3RyaW5nLCByZXN0cmljdGlvbjogU2VhcmNoUmVzdHJpY3Rpb24sIG1pblN1Z2dlc3Rpb25Db3VudDogbnVtYmVyLCBtYXhSZXN1bHRzPzogbnVtYmVyKTogUHJvbWlzZTxTZWFyY2hSZXN1bHQ+IHtcblx0XHRyZXR1cm4gdGhpcy5fZGIuaW5pdGlhbGl6ZWQudGhlbigoKSA9PiB7XG5cdFx0XHRsZXQgc2VhcmNoVG9rZW5zID0gdG9rZW5pemUocXVlcnkpXG5cdFx0XHRsZXQgcmVzdWx0OiBTZWFyY2hSZXN1bHQgPSB7XG5cdFx0XHRcdHF1ZXJ5LFxuXHRcdFx0XHRyZXN0cmljdGlvbixcblx0XHRcdFx0cmVzdWx0czogW10sXG5cdFx0XHRcdGN1cnJlbnRJbmRleFRpbWVzdGFtcDogdGhpcy5fZ2V0U2VhcmNoRW5kVGltZXN0YW1wKHJlc3RyaWN0aW9uKSxcblx0XHRcdFx0bGFzdFJlYWRTZWFyY2hJbmRleFJvdzogc2VhcmNoVG9rZW5zLm1hcCgodG9rZW4pID0+IFt0b2tlbiwgbnVsbF0pLFxuXHRcdFx0XHRtYXRjaFdvcmRPcmRlcjogc2VhcmNoVG9rZW5zLmxlbmd0aCA+IDEgJiYgcXVlcnkuc3RhcnRzV2l0aCgnXCInKSAmJiBxdWVyeS5lbmRzV2l0aCgnXCInKSxcblx0XHRcdFx0bW9yZVJlc3VsdHM6IFtdLFxuXHRcdFx0XHRtb3JlUmVzdWx0c0VudHJpZXM6IFtdLFxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoc2VhcmNoVG9rZW5zLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0bGV0IGlzRmlyc3RXb3JkU2VhcmNoID0gc2VhcmNoVG9rZW5zLmxlbmd0aCA9PT0gMVxuXHRcdFx0XHRsZXQgYmVmb3JlID0gZ2V0UGVyZm9ybWFuY2VUaW1lc3RhbXAoKVxuXG5cdFx0XHRcdGxldCBzdWdnZXN0aW9uRmFjYWRlID0gdGhpcy5fc3VnZ2VzdGlvbkZhY2FkZXMuZmluZCgoZikgPT4gaXNTYW1lVHlwZVJlZihmLnR5cGUsIHJlc3RyaWN0aW9uLnR5cGUpKVxuXG5cdFx0XHRcdGxldCBzZWFyY2hQcm9taXNlXG5cblx0XHRcdFx0aWYgKG1pblN1Z2dlc3Rpb25Db3VudCA+IDAgJiYgaXNGaXJzdFdvcmRTZWFyY2ggJiYgc3VnZ2VzdGlvbkZhY2FkZSkge1xuXHRcdFx0XHRcdGxldCBhZGRTdWdnZXN0aW9uQmVmb3JlID0gZ2V0UGVyZm9ybWFuY2VUaW1lc3RhbXAoKVxuXHRcdFx0XHRcdHNlYXJjaFByb21pc2UgPSB0aGlzLl9hZGRTdWdnZXN0aW9ucyhzZWFyY2hUb2tlbnNbMF0sIHN1Z2dlc3Rpb25GYWNhZGUsIG1pblN1Z2dlc3Rpb25Db3VudCwgcmVzdWx0KS50aGVuKCgpID0+IHtcblx0XHRcdFx0XHRcdGlmIChyZXN1bHQucmVzdWx0cy5sZW5ndGggPCBtaW5TdWdnZXN0aW9uQ291bnQpIHtcblx0XHRcdFx0XHRcdFx0Ly8gdGhlcmUgbWF5IGJlIGZpZWxkcyB0aGF0IGFyZSBub3QgaW5kZXhlZCB3aXRoIHN1Z2dlc3Rpb25zIGJ1dCB3aGljaCB3ZSBjYW4gZmluZCB3aXRoIHRoZSBub3JtYWwgc2VhcmNoXG5cdFx0XHRcdFx0XHRcdC8vIFRPRE86IGxldCBzdWdnZXN0aW9uIGZhY2FkZSBhbmQgc2VhcmNoIGZhY2FkZSBrbm93IHdoaWNoIGZpZWxkcyBhcmVcblx0XHRcdFx0XHRcdFx0Ly8gaW5kZXhlZCB3aXRoIHN1Z2dlc3Rpb25zLCBzbyB0aGF0IHdlXG5cdFx0XHRcdFx0XHRcdC8vIDEpIGtub3cgaWYgd2UgYWxzbyBoYXZlIHRvIHNlYXJjaCBub3JtYWxseSBhbmRcblx0XHRcdFx0XHRcdFx0Ly8gMikgaW4gd2hpY2ggZmllbGRzIHdlIGhhdmUgdG8gc2VhcmNoIGZvciBzZWNvbmQgd29yZCBzdWdnZXN0aW9ucyBiZWNhdXNlIG5vdyB3ZSB3b3VsZCBhbHNvIGZpbmQgd29yZHMgb2Ygbm9uLXN1Z2dlc3Rpb24gZmllbGRzIGFzIHNlY29uZCB3b3Jkc1xuXHRcdFx0XHRcdFx0XHRsZXQgc2VhcmNoRm9yVG9rZW5zQWZ0ZXJTdWdnZXN0aW9uc0JlZm9yZSA9IGdldFBlcmZvcm1hbmNlVGltZXN0YW1wKClcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHRoaXMuX3N0YXJ0T3JDb250aW51ZVNlYXJjaChyZXN1bHQpLnRoZW4oKHJlc3VsdCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiByZXN1bHRcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9IGVsc2UgaWYgKG1pblN1Z2dlc3Rpb25Db3VudCA+IDAgJiYgIWlzRmlyc3RXb3JkU2VhcmNoICYmIHN1Z2dlc3Rpb25GYWNhZGUpIHtcblx0XHRcdFx0XHRsZXQgc3VnZ2VzdGlvblRva2VuID0gbmV2ZXJOdWxsKHJlc3VsdC5sYXN0UmVhZFNlYXJjaEluZGV4Um93LnBvcCgpKVswXVxuXHRcdFx0XHRcdHNlYXJjaFByb21pc2UgPSB0aGlzLl9zdGFydE9yQ29udGludWVTZWFyY2gocmVzdWx0KS50aGVuKCgpID0+IHtcblx0XHRcdFx0XHRcdC8vIHdlIG5vdyBmaWx0ZXIgZm9yIHRoZSBzdWdnZXN0aW9uIHRva2VuIG1hbnVhbGx5IGJlY2F1c2Ugc2VhcmNoaW5nIGZvciBzdWdnZXN0aW9ucyBmb3IgdGhlIGxhc3Qgd29yZCBhbmQgcmVkdWNpbmcgdGhlIGluaXRpYWwgc2VhcmNoIHJlc3VsdCB3aXRoIHRoZW0gY2FuIGxlYWQgdG9cblx0XHRcdFx0XHRcdC8vIGRvemVucyBvZiBzZWFyY2hlcyB3aXRob3V0IGFueSBlZmZlY3Qgd2hlbiB0aGUgc2VhY2ggdG9rZW4gaXMgZm91bmQgaW4gdG9vIG1hbnkgY29udGFjdHMsIGUuZy4gaW4gdGhlIGVtYWlsIGFkZHJlc3Mgd2l0aCB0aGUgZW5kaW5nIFwiZGVcIlxuXHRcdFx0XHRcdFx0cmVzdWx0LnJlc3VsdHMuc29ydChjb21wYXJlTmV3ZXN0Rmlyc3QpXG5cdFx0XHRcdFx0XHRyZXR1cm4gdGhpcy5fbG9hZEFuZFJlZHVjZShyZXN0cmljdGlvbiwgcmVzdWx0LCBzdWdnZXN0aW9uVG9rZW4sIG1pblN1Z2dlc3Rpb25Db3VudClcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHNlYXJjaFByb21pc2UgPSB0aGlzLl9zdGFydE9yQ29udGludWVTZWFyY2gocmVzdWx0LCBtYXhSZXN1bHRzKVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHNlYXJjaFByb21pc2UudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0cmVzdWx0LnJlc3VsdHMuc29ydChjb21wYXJlTmV3ZXN0Rmlyc3QpXG5cdFx0XHRcdFx0cmV0dXJuIHJlc3VsdFxuXHRcdFx0XHR9KVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXN1bHQpXG5cdFx0XHR9XG5cdFx0fSlcblx0fVxuXG5cdGFzeW5jIF9sb2FkQW5kUmVkdWNlKHJlc3RyaWN0aW9uOiBTZWFyY2hSZXN0cmljdGlvbiwgcmVzdWx0OiBTZWFyY2hSZXN1bHQsIHN1Z2dlc3Rpb25Ub2tlbjogc3RyaW5nLCBtaW5TdWdnZXN0aW9uQ291bnQ6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuXHRcdGlmIChyZXN1bHQucmVzdWx0cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRjb25zdCBtb2RlbCA9IGF3YWl0IHJlc29sdmVUeXBlUmVmZXJlbmNlKHJlc3RyaWN0aW9uLnR5cGUpXG5cdFx0XHQvLyBpZiB3ZSB3YW50IHRoZSBleGFjdCBzZWFyY2ggb3JkZXIgd2UgdHJ5IHRvIGZpbmQgdGhlIGNvbXBsZXRlIHNlcXVlbmNlIG9mIHdvcmRzIGluIGFuIGF0dHJpYnV0ZSBvZiB0aGUgaW5zdGFuY2UuXG5cdFx0XHQvLyBmb3Igb3RoZXIgY2FzZXMgd2Ugb25seSBjaGVjayB0aGF0IGFuIGF0dHJpYnV0ZSBjb250YWlucyBhIHdvcmQgdGhhdCBzdGFydHMgd2l0aCBzdWdnZXN0aW9uIHdvcmRcblx0XHRcdGNvbnN0IHN1Z2dlc3Rpb25RdWVyeSA9IHJlc3VsdC5tYXRjaFdvcmRPcmRlciA/IG5vcm1hbGl6ZVF1ZXJ5KHJlc3VsdC5xdWVyeSkgOiBzdWdnZXN0aW9uVG9rZW5cblx0XHRcdGNvbnN0IGZpbmFsUmVzdWx0czogSWRUdXBsZVtdID0gW11cblxuXHRcdFx0Zm9yIChjb25zdCBpZCBvZiByZXN1bHQucmVzdWx0cykge1xuXHRcdFx0XHRpZiAoZmluYWxSZXN1bHRzLmxlbmd0aCA+PSBtaW5TdWdnZXN0aW9uQ291bnQpIHtcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGxldCBlbnRpdHlcblxuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRlbnRpdHkgPSBhd2FpdCB0aGlzLl9lbnRpdHlDbGllbnQubG9hZChyZXN0cmljdGlvbi50eXBlLCBpZClcblx0XHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0XHRpZiAoZSBpbnN0YW5jZW9mIE5vdEZvdW5kRXJyb3IgfHwgZSBpbnN0YW5jZW9mIE5vdEF1dGhvcml6ZWRFcnJvcikge1xuXHRcdFx0XHRcdFx0XHRjb250aW51ZVxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0dGhyb3cgZVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGNvbnN0IGZvdW5kID0gYXdhaXQgdGhpcy5fY29udGFpbnNTdWdnZXN0aW9uVG9rZW4oZW50aXR5LCBtb2RlbCwgcmVzdHJpY3Rpb24uYXR0cmlidXRlSWRzLCBzdWdnZXN0aW9uUXVlcnksIHJlc3VsdC5tYXRjaFdvcmRPcmRlcilcblxuXHRcdFx0XHRcdGlmIChmb3VuZCkge1xuXHRcdFx0XHRcdFx0ZmluYWxSZXN1bHRzLnB1c2goaWQpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHJlc3VsdC5yZXN1bHRzID0gZmluYWxSZXN1bHRzXG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBMb29rcyBmb3IgYSB3b3JkIGluIGFueSBvZiB0aGUgZW50aXRpZXMgc3RyaW5nIHZhbHVlcyBvciBhZ2dyZWdhdGlvbnMgc3RyaW5nIHZhbHVlcyB0aGF0IHN0YXJ0cyB3aXRoIHN1Z2dlc3Rpb25Ub2tlbi5cblx0ICogQHBhcmFtIGF0dHJpYnV0ZUlkcyBPbmx5IGxvb2tzIGluIHRoZXNlIGF0dHJpYnV0ZSBpZHMgKG9yIGFsbCBpdHMgc3RyaW5nIHZhbHVlcyBpZiBpdCBpcyBhbiBhZ2dyZWdhdGlvbiBhdHRyaWJ1dGUgaWQuIElmIG51bGwsIGxvb2tzIGluIGFsbCBzdHJpbmcgdmFsdWVzIGFuZCBhZ2dyZWdhdGlvbnMuXG5cdCAqL1xuXHRfY29udGFpbnNTdWdnZXN0aW9uVG9rZW4oXG5cdFx0ZW50aXR5OiBSZWNvcmQ8c3RyaW5nLCBhbnk+LFxuXHRcdG1vZGVsOiBUeXBlTW9kZWwsXG5cdFx0YXR0cmlidXRlSWRzOiBudW1iZXJbXSB8IG51bGwsXG5cdFx0c3VnZ2VzdGlvblRva2VuOiBzdHJpbmcsXG5cdFx0bWF0Y2hXb3JkT3JkZXI6IGJvb2xlYW4sXG5cdCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdGxldCBhdHRyaWJ1dGVOYW1lczogc3RyaW5nW11cblxuXHRcdGlmICghYXR0cmlidXRlSWRzKSB7XG5cdFx0XHRhdHRyaWJ1dGVOYW1lcyA9IE9iamVjdC5rZXlzKG1vZGVsLnZhbHVlcykuY29uY2F0KE9iamVjdC5rZXlzKG1vZGVsLmFzc29jaWF0aW9ucykpXG5cdFx0fSBlbHNlIHtcblx0XHRcdGF0dHJpYnV0ZU5hbWVzID0gYXR0cmlidXRlSWRzLm1hcCgoaWQpID0+XG5cdFx0XHRcdG5ldmVyTnVsbChcblx0XHRcdFx0XHRPYmplY3Qua2V5cyhtb2RlbC52YWx1ZXMpLmZpbmQoKHZhbHVlTmFtZSkgPT4gbW9kZWwudmFsdWVzW3ZhbHVlTmFtZV0uaWQgPT09IGlkKSB8fFxuXHRcdFx0XHRcdFx0T2JqZWN0LmtleXMobW9kZWwuYXNzb2NpYXRpb25zKS5maW5kKChhc3NvY2lhdGlvbk5hbWUpID0+IG1vZGVsLmFzc29jaWF0aW9uc1thc3NvY2lhdGlvbk5hbWVdLmlkID09PSBpZCksXG5cdFx0XHRcdCksXG5cdFx0XHQpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGFzeW5jRmluZChhdHRyaWJ1dGVOYW1lcywgYXN5bmMgKGF0dHJpYnV0ZU5hbWUpID0+IHtcblx0XHRcdGlmIChtb2RlbC52YWx1ZXNbYXR0cmlidXRlTmFtZV0gJiYgbW9kZWwudmFsdWVzW2F0dHJpYnV0ZU5hbWVdLnR5cGUgPT09IFZhbHVlVHlwZS5TdHJpbmcgJiYgZW50aXR5W2F0dHJpYnV0ZU5hbWVdKSB7XG5cdFx0XHRcdGlmIChtYXRjaFdvcmRPcmRlcikge1xuXHRcdFx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUobm9ybWFsaXplUXVlcnkoZW50aXR5W2F0dHJpYnV0ZU5hbWVdKS5pbmRleE9mKHN1Z2dlc3Rpb25Ub2tlbikgIT09IC0xKVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGxldCB3b3JkcyA9IHRva2VuaXplKGVudGl0eVthdHRyaWJ1dGVOYW1lXSlcblx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHdvcmRzLnNvbWUoKHcpID0+IHcuc3RhcnRzV2l0aChzdWdnZXN0aW9uVG9rZW4pKSlcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChtb2RlbC5hc3NvY2lhdGlvbnNbYXR0cmlidXRlTmFtZV0gJiYgbW9kZWwuYXNzb2NpYXRpb25zW2F0dHJpYnV0ZU5hbWVdLnR5cGUgPT09IEFzc29jaWF0aW9uVHlwZS5BZ2dyZWdhdGlvbiAmJiBlbnRpdHlbYXR0cmlidXRlTmFtZV0pIHtcblx0XHRcdFx0bGV0IGFnZ3JlZ2F0ZXMgPSBtb2RlbC5hc3NvY2lhdGlvbnNbYXR0cmlidXRlTmFtZV0uY2FyZGluYWxpdHkgPT09IENhcmRpbmFsaXR5LkFueSA/IGVudGl0eVthdHRyaWJ1dGVOYW1lXSA6IFtlbnRpdHlbYXR0cmlidXRlTmFtZV1dXG5cdFx0XHRcdGNvbnN0IHJlZk1vZGVsID0gYXdhaXQgcmVzb2x2ZVR5cGVSZWZlcmVuY2UobmV3IFR5cGVSZWYobW9kZWwuYXBwLCBtb2RlbC5hc3NvY2lhdGlvbnNbYXR0cmlidXRlTmFtZV0ucmVmVHlwZSkpXG5cdFx0XHRcdHJldHVybiBhc3luY0ZpbmQoYWdncmVnYXRlcywgKGFnZ3JlZ2F0ZSkgPT4ge1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLl9jb250YWluc1N1Z2dlc3Rpb25Ub2tlbihkb3duY2FzdDxSZWNvcmQ8c3RyaW5nLCBhbnk+PihhZ2dyZWdhdGUpLCByZWZNb2RlbCwgbnVsbCwgc3VnZ2VzdGlvblRva2VuLCBtYXRjaFdvcmRPcmRlcilcblx0XHRcdFx0fSkudGhlbigoZm91bmQpID0+IGZvdW5kICE9IG51bGwpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKVxuXHRcdFx0fVxuXHRcdH0pLnRoZW4oKGZvdW5kKSA9PiBmb3VuZCAhPSBudWxsKVxuXHR9XG5cblx0X3N0YXJ0T3JDb250aW51ZVNlYXJjaChzZWFyY2hSZXN1bHQ6IFNlYXJjaFJlc3VsdCwgbWF4UmVzdWx0cz86IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuXHRcdG1hcmtTdGFydChcImZpbmRJbmRleEVudHJpZXNcIilcblxuXHRcdGNvbnN0IG5leHRTY2hlZHVsZWRJbmRleGluZ1J1biA9IGdldFN0YXJ0T2ZEYXkoZ2V0RGF5U2hpZnRlZChuZXcgRGF0ZSh0aGlzLl9tYWlsSW5kZXhlci5jdXJyZW50SW5kZXhUaW1lc3RhbXApLCBJTklUSUFMX01BSUxfSU5ERVhfSU5URVJWQUxfREFZUykpXG5cdFx0Y29uc3QgdGhlRGF5QWZ0ZXJUb21vcnJvdyA9IGdldFN0YXJ0T2ZEYXkoZ2V0RGF5U2hpZnRlZChuZXcgRGF0ZSgpLCAxKSlcblxuXHRcdGlmIChzZWFyY2hSZXN1bHQubW9yZVJlc3VsdHMubGVuZ3RoID09PSAwICYmIG5leHRTY2hlZHVsZWRJbmRleGluZ1J1bi5nZXRUaW1lKCkgPiB0aGVEYXlBZnRlclRvbW9ycm93LmdldFRpbWUoKSAmJiAhdGhpcy5fbWFpbEluZGV4ZXIuaXNJbmRleGluZykge1xuXHRcdFx0dGhpcy5fbWFpbEluZGV4ZXIuZXh0ZW5kSW5kZXhJZk5lZWRlZChcblx0XHRcdFx0dGhpcy51c2VyRmFjYWRlLmdldExvZ2dlZEluVXNlcigpLFxuXHRcdFx0XHRnZXRTdGFydE9mRGF5KGdldERheVNoaWZ0ZWQobmV3IERhdGUoKSwgLUlOSVRJQUxfTUFJTF9JTkRFWF9JTlRFUlZBTF9EQVlTKSkuZ2V0VGltZSgpLFxuXHRcdFx0KVxuXHRcdH1cblxuXHRcdGxldCBtb3JlUmVzdWx0c0VudHJpZXM6IFByb21pc2U8QXJyYXk8TW9yZVJlc3VsdHNJbmRleEVudHJ5Pj5cblxuXHRcdGlmIChtYXhSZXN1bHRzICYmIHNlYXJjaFJlc3VsdC5tb3JlUmVzdWx0cy5sZW5ndGggPj0gbWF4UmVzdWx0cykge1xuXHRcdFx0bW9yZVJlc3VsdHNFbnRyaWVzID0gUHJvbWlzZS5yZXNvbHZlKHNlYXJjaFJlc3VsdC5tb3JlUmVzdWx0cylcblx0XHR9IGVsc2Uge1xuXHRcdFx0bW9yZVJlc3VsdHNFbnRyaWVzID0gdGhpcy5fZmluZEluZGV4RW50cmllcyhzZWFyY2hSZXN1bHQsIG1heFJlc3VsdHMpXG5cdFx0XHRcdC50aGVuKChrZXlUb0VuY3J5cHRlZEluZGV4RW50cmllcykgPT4ge1xuXHRcdFx0XHRcdG1hcmtFbmQoXCJmaW5kSW5kZXhFbnRyaWVzXCIpXG5cdFx0XHRcdFx0bWFya1N0YXJ0KFwiX2ZpbHRlckJ5RW5jcnlwdGVkSWRcIilcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5fZmlsdGVyQnlFbmNyeXB0ZWRJZChrZXlUb0VuY3J5cHRlZEluZGV4RW50cmllcylcblx0XHRcdFx0fSlcblx0XHRcdFx0LnRoZW4oKGtleVRvRW5jcnlwdGVkSW5kZXhFbnRyaWVzKSA9PiB7XG5cdFx0XHRcdFx0bWFya0VuZChcIl9maWx0ZXJCeUVuY3J5cHRlZElkXCIpXG5cdFx0XHRcdFx0bWFya1N0YXJ0KFwiX2RlY3J5cHRTZWFyY2hSZXN1bHRcIilcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5fZGVjcnlwdFNlYXJjaFJlc3VsdChrZXlUb0VuY3J5cHRlZEluZGV4RW50cmllcylcblx0XHRcdFx0fSlcblx0XHRcdFx0LnRoZW4oKGtleVRvSW5kZXhFbnRyaWVzKSA9PiB7XG5cdFx0XHRcdFx0bWFya0VuZChcIl9kZWNyeXB0U2VhcmNoUmVzdWx0XCIpXG5cdFx0XHRcdFx0bWFya1N0YXJ0KFwiX2ZpbHRlckJ5VHlwZUFuZEF0dHJpYnV0ZUFuZFRpbWVcIilcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5fZmlsdGVyQnlUeXBlQW5kQXR0cmlidXRlQW5kVGltZShrZXlUb0luZGV4RW50cmllcywgc2VhcmNoUmVzdWx0LnJlc3RyaWN0aW9uKVxuXHRcdFx0XHR9KVxuXHRcdFx0XHQudGhlbigoa2V5VG9JbmRleEVudHJpZXMpID0+IHtcblx0XHRcdFx0XHRtYXJrRW5kKFwiX2ZpbHRlckJ5VHlwZUFuZEF0dHJpYnV0ZUFuZFRpbWVcIilcblx0XHRcdFx0XHRtYXJrU3RhcnQoXCJfcmVkdWNlV29yZHNcIilcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5fcmVkdWNlV29yZHMoa2V5VG9JbmRleEVudHJpZXMsIHNlYXJjaFJlc3VsdC5tYXRjaFdvcmRPcmRlcilcblx0XHRcdFx0fSlcblx0XHRcdFx0LnRoZW4oKHNlYXJjaEluZGV4RW50cmllcykgPT4ge1xuXHRcdFx0XHRcdG1hcmtFbmQoXCJfcmVkdWNlV29yZHNcIilcblx0XHRcdFx0XHRtYXJrU3RhcnQoXCJfcmVkdWNlVG9VbmlxdWVFbGVtZW50SWRzXCIpXG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuX3JlZHVjZVRvVW5pcXVlRWxlbWVudElkcyhzZWFyY2hJbmRleEVudHJpZXMsIHNlYXJjaFJlc3VsdClcblx0XHRcdFx0fSlcblx0XHRcdFx0LnRoZW4oKGFkZGl0aW9uYWxFbnRyaWVzKSA9PiB7XG5cdFx0XHRcdFx0bWFya0VuZChcIl9yZWR1Y2VUb1VuaXF1ZUVsZW1lbnRJZHNcIilcblx0XHRcdFx0XHRyZXR1cm4gYWRkaXRpb25hbEVudHJpZXMuY29uY2F0KHNlYXJjaFJlc3VsdC5tb3JlUmVzdWx0cylcblx0XHRcdFx0fSlcblx0XHR9XG5cblx0XHRyZXR1cm4gbW9yZVJlc3VsdHNFbnRyaWVzXG5cdFx0XHQudGhlbigoc2VhcmNoSW5kZXhFbnRyaWVzOiBNb3JlUmVzdWx0c0luZGV4RW50cnlbXSkgPT4ge1xuXHRcdFx0XHRtYXJrU3RhcnQoXCJfZmlsdGVyQnlMaXN0SWRBbmRHcm91cFNlYXJjaFJlc3VsdHNcIilcblx0XHRcdFx0cmV0dXJuIHRoaXMuX2ZpbHRlckJ5TGlzdElkQW5kR3JvdXBTZWFyY2hSZXN1bHRzKHNlYXJjaEluZGV4RW50cmllcywgc2VhcmNoUmVzdWx0LCBtYXhSZXN1bHRzKVxuXHRcdFx0fSlcblx0XHRcdC50aGVuKChyZXN1bHQpID0+IHtcblx0XHRcdFx0bWFya0VuZChcIl9maWx0ZXJCeUxpc3RJZEFuZEdyb3VwU2VhcmNoUmVzdWx0c1wiKVxuXHRcdFx0XHRpZiAodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRcdFx0XHRwcmludE1lYXN1cmUoXCJxdWVyeTogXCIgKyBzZWFyY2hSZXN1bHQucXVlcnkgKyBcIiwgbWF4UmVzdWx0czogXCIgKyBTdHJpbmcobWF4UmVzdWx0cyksIFtcblx0XHRcdFx0XHRcdFwiZmluZEluZGV4RW50cmllc1wiLFxuXHRcdFx0XHRcdFx0XCJfZmlsdGVyQnlFbmNyeXB0ZWRJZFwiLFxuXHRcdFx0XHRcdFx0XCJfZGVjcnlwdFNlYXJjaFJlc3VsdFwiLFxuXHRcdFx0XHRcdFx0XCJfZmlsdGVyQnlUeXBlQW5kQXR0cmlidXRlQW5kVGltZVwiLFxuXHRcdFx0XHRcdFx0XCJfcmVkdWNlV29yZHNcIixcblx0XHRcdFx0XHRcdFwiX3JlZHVjZVRvVW5pcXVlRWxlbWVudElkc1wiLFxuXHRcdFx0XHRcdFx0XCJfZmlsdGVyQnlMaXN0SWRBbmRHcm91cFNlYXJjaFJlc3VsdHNcIixcblx0XHRcdFx0XHRdKVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiByZXN1bHRcblx0XHRcdH0pXG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBzdWdnZXN0aW9ucyBmb3IgdGhlIGdpdmVuIHNlYXJjaFRva2VuIHRvIHRoZSBzZWFyY2hSZXN1bHQgdW50aWwgYXQgbGVhc3QgbWluU3VnZ2VzdGlvbkNvdW50IHJlc3VsdHMgYXJlIGV4aXN0aW5nXG5cdCAqL1xuXHRfYWRkU3VnZ2VzdGlvbnMoc2VhcmNoVG9rZW46IHN0cmluZywgc3VnZ2VzdGlvbkZhY2FkZTogU3VnZ2VzdGlvbkZhY2FkZTxhbnk+LCBtaW5TdWdnZXN0aW9uQ291bnQ6IG51bWJlciwgc2VhcmNoUmVzdWx0OiBTZWFyY2hSZXN1bHQpOiBQcm9taXNlPGFueT4ge1xuXHRcdGxldCBzdWdnZXN0aW9ucyA9IHN1Z2dlc3Rpb25GYWNhZGUuZ2V0U3VnZ2VzdGlvbnMoc2VhcmNoVG9rZW4pXG5cdFx0cmV0dXJuIHByb21pc2VNYXAoc3VnZ2VzdGlvbnMsIChzdWdnZXN0aW9uKSA9PiB7XG5cdFx0XHRpZiAoc2VhcmNoUmVzdWx0LnJlc3VsdHMubGVuZ3RoIDwgbWluU3VnZ2VzdGlvbkNvdW50KSB7XG5cdFx0XHRcdGNvbnN0IHN1Z2dlc3Rpb25SZXN1bHQ6IFNlYXJjaFJlc3VsdCA9IHtcblx0XHRcdFx0XHRxdWVyeTogc3VnZ2VzdGlvbixcblx0XHRcdFx0XHRyZXN0cmljdGlvbjogc2VhcmNoUmVzdWx0LnJlc3RyaWN0aW9uLFxuXHRcdFx0XHRcdHJlc3VsdHM6IHNlYXJjaFJlc3VsdC5yZXN1bHRzLFxuXHRcdFx0XHRcdGN1cnJlbnRJbmRleFRpbWVzdGFtcDogc2VhcmNoUmVzdWx0LmN1cnJlbnRJbmRleFRpbWVzdGFtcCxcblx0XHRcdFx0XHRsYXN0UmVhZFNlYXJjaEluZGV4Um93OiBbW3N1Z2dlc3Rpb24sIG51bGxdXSxcblx0XHRcdFx0XHRtYXRjaFdvcmRPcmRlcjogZmFsc2UsXG5cdFx0XHRcdFx0bW9yZVJlc3VsdHM6IFtdLFxuXHRcdFx0XHRcdG1vcmVSZXN1bHRzRW50cmllczogW10sXG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHRoaXMuX3N0YXJ0T3JDb250aW51ZVNlYXJjaChzdWdnZXN0aW9uUmVzdWx0KVxuXHRcdFx0fVxuXHRcdH0pXG5cdH1cblxuXHRfZmluZEluZGV4RW50cmllcyhzZWFyY2hSZXN1bHQ6IFNlYXJjaFJlc3VsdCwgbWF4UmVzdWx0czogbnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZCk6IFByb21pc2U8S2V5VG9FbmNyeXB0ZWRJbmRleEVudHJpZXNbXT4ge1xuXHRcdGNvbnN0IHR5cGVJbmZvID0gdHlwZVJlZlRvVHlwZUluZm8oc2VhcmNoUmVzdWx0LnJlc3RyaWN0aW9uLnR5cGUpXG5cdFx0Y29uc3QgZmlyc3RTZWFyY2hUb2tlbkluZm8gPSBzZWFyY2hSZXN1bHQubGFzdFJlYWRTZWFyY2hJbmRleFJvd1swXVxuXHRcdC8vIEZpcnN0IHJlYWQgYWxsIG1ldGFkYXRhIHRvIG5hcnJvdyB0aW1lIHJhbmdlIHdlIHNlYXJjaCBpbi5cblx0XHRyZXR1cm4gdGhpcy5fZGIuZGJGYWNhZGUuY3JlYXRlVHJhbnNhY3Rpb24odHJ1ZSwgW1NlYXJjaEluZGV4T1MsIFNlYXJjaEluZGV4TWV0YURhdGFPU10pLnRoZW4oKHRyYW5zYWN0aW9uKSA9PiB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fcHJvbWlzZU1hcENvbXBhdChzZWFyY2hSZXN1bHQubGFzdFJlYWRTZWFyY2hJbmRleFJvdywgKHRva2VuSW5mbywgaW5kZXgpID0+IHtcblx0XHRcdFx0Y29uc3QgW3NlYXJjaFRva2VuXSA9IHRva2VuSW5mb1xuXHRcdFx0XHRsZXQgaW5kZXhLZXkgPSBlbmNyeXB0SW5kZXhLZXlCYXNlNjQodGhpcy5fZGIua2V5LCBzZWFyY2hUb2tlbiwgdGhpcy5fZGIuaXYpXG5cdFx0XHRcdHJldHVybiB0cmFuc2FjdGlvbi5nZXQoU2VhcmNoSW5kZXhNZXRhRGF0YU9TLCBpbmRleEtleSwgU2VhcmNoSW5kZXhXb3Jkc0luZGV4KS50aGVuKChtZXRhRGF0YTogU2VhcmNoSW5kZXhNZXRhRGF0YURiUm93IHwgbnVsbCkgPT4ge1xuXHRcdFx0XHRcdGlmICghbWV0YURhdGEpIHtcblx0XHRcdFx0XHRcdHRva2VuSW5mb1sxXSA9IDAgLy8gXCJ3ZSd2ZSByZWFkIGFsbFwiIChiZWNhdXNlIHdlIGRvbid0IGhhdmUgYW55dGhpbmdcblxuXHRcdFx0XHRcdFx0Ly8gSWYgdGhlcmUncyBubyBtZXRhZGF0YSBmb3Iga2V5LCByZXR1cm4gZW1wdHkgcmVzdWx0XG5cdFx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHRpZDogLWluZGV4LFxuXHRcdFx0XHRcdFx0XHR3b3JkOiBpbmRleEtleSxcblx0XHRcdFx0XHRcdFx0cm93czogW10sXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0dXJuIGRlY3J5cHRNZXRhRGF0YSh0aGlzLl9kYi5rZXksIG1ldGFEYXRhKVxuXHRcdFx0XHR9KVxuXHRcdFx0fSlcblx0XHRcdFx0LnRoZW5PckFwcGx5KChtZXRhUm93cykgPT4ge1xuXHRcdFx0XHRcdC8vIEZpbmQgaW5kZXggZW50cnkgcm93cyBpbiB3aGljaCB3ZSB3aWxsIHNlYXJjaC5cblx0XHRcdFx0XHRjb25zdCByb3dzVG9SZWFkRm9ySW5kZXhLZXlzID0gdGhpcy5fZmluZFJvd3NUb1JlYWRGcm9tTWV0YURhdGEoZmlyc3RTZWFyY2hUb2tlbkluZm8sIG1ldGFSb3dzLCB0eXBlSW5mbywgbWF4UmVzdWx0cylcblxuXHRcdFx0XHRcdC8vIEl0ZXJhdGUgZWFjaCBxdWVyeSB0b2tlblxuXHRcdFx0XHRcdHJldHVybiB0aGlzLl9wcm9taXNlTWFwQ29tcGF0KHJvd3NUb1JlYWRGb3JJbmRleEtleXMsIChyb3dzVG9SZWFkOiBSb3dzVG9SZWFkRm9ySW5kZXhLZXkpID0+IHtcblx0XHRcdFx0XHRcdC8vIEZvciBlYWNoIHRva2VuIGZpbmQgdG9rZW4gZW50cmllcyBpbiB0aGUgcm93cyB3ZSd2ZSBmb3VuZFxuXHRcdFx0XHRcdFx0cmV0dXJuIHRoaXMuX3Byb21pc2VNYXBDb21wYXQocm93c1RvUmVhZC5yb3dzLCAoZW50cnkpID0+IHRoaXMuX2ZpbmRFbnRyaWVzRm9yTWV0YWRhdGEodHJhbnNhY3Rpb24sIGVudHJ5KSlcblx0XHRcdFx0XHRcdFx0LnRoZW5PckFwcGx5KChhKSA9PiBhLmZsYXQoKSlcblx0XHRcdFx0XHRcdFx0LnRoZW5PckFwcGx5KChpbmRleEVudHJpZXM6IEVuY3J5cHRlZFNlYXJjaEluZGV4RW50cnlbXSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBpbmRleEVudHJpZXMubWFwKChlbnRyeSkgPT4gKHtcblx0XHRcdFx0XHRcdFx0XHRcdGVuY0VudHJ5OiBlbnRyeSxcblx0XHRcdFx0XHRcdFx0XHRcdGlkSGFzaDogYXJyYXlIYXNoKGdldElkRnJvbUVuY1NlYXJjaEluZGV4RW50cnkoZW50cnkpKSxcblx0XHRcdFx0XHRcdFx0XHR9KSlcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0LnRoZW5PckFwcGx5KChpbmRleEVudHJpZXM6IEVuY3J5cHRlZFNlYXJjaEluZGV4RW50cnlXaXRoSGFzaFtdKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0XHRcdGluZGV4S2V5OiByb3dzVG9SZWFkLmluZGV4S2V5LFxuXHRcdFx0XHRcdFx0XHRcdFx0aW5kZXhFbnRyaWVzOiBpbmRleEVudHJpZXMsXG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9KS52YWx1ZVxuXHRcdFx0XHRcdH0pLnZhbHVlXG5cdFx0XHRcdH0pXG5cdFx0XHRcdC50b1Byb21pc2UoKVxuXHRcdH0pXG5cdH1cblxuXHRfZmluZFJvd3NUb1JlYWRGcm9tTWV0YURhdGEoXG5cdFx0Zmlyc3RUb2tlbkluZm86IFtzdHJpbmcsIG51bWJlciB8IG51bGxdLFxuXHRcdHNhZmVNZXRhRGF0YVJvd3M6IEFycmF5PFNlYXJjaEluZGV4TWV0YURhdGFSb3c+LFxuXHRcdHR5cGVJbmZvOiBUeXBlSW5mbyxcblx0XHRtYXhSZXN1bHRzOiBudW1iZXIgfCBudWxsIHwgdW5kZWZpbmVkLFxuXHQpOiBBcnJheTxSb3dzVG9SZWFkRm9ySW5kZXhLZXk+IHtcblx0XHQvLyBcIkxlYWRpbmcgcm93XCIgbmFycm93cyBkb3duIHRpbWUgcmFuZ2UgaW4gd2hpY2ggd2Ugc2VhcmNoIGluIHRoaXMgaXRlcmF0aW9uXG5cdFx0Ly8gRG9lc24ndCBtYXR0ZXIgZm9yIGNvcnJlY3RuZXNzIHdoaWNoIG9uZSBpdCBpcyAoYmVjYXVzZSBxdWVyeSBpcyBhbHdheXMgQU5EKSBidXQgbWF0dGVycyBmb3IgcGVyZm9ybWFuY2Vcblx0XHQvLyBGb3Igbm93IGFyYml0cmFyaWx5IHBpY2tlZCBmaXJzdCAodXN1YWxseSBpdCdzIHRoZSBtb3N0IHNwZWNpZmljIHBhcnQgYW55d2F5KVxuXHRcdGNvbnN0IGxlYWRpbmdSb3cgPSBzYWZlTWV0YURhdGFSb3dzWzBdXG5cdFx0Y29uc3Qgb3RoZXJSb3dzID0gc2FmZU1ldGFEYXRhUm93cy5zbGljZSgxKVxuXG5cdFx0Y29uc3QgcmFuZ2VGb3JMZWFkaW5nUm93ID0gdGhpcy5fZmluZFJvd3NUb1JlYWQobGVhZGluZ1JvdywgdHlwZUluZm8sIGZpcnN0VG9rZW5JbmZvWzFdIHx8IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSLCBtYXhSZXN1bHRzKVxuXG5cdFx0Y29uc3Qgcm93c0ZvckxlYWRpbmdSb3cgPSBbXG5cdFx0XHR7XG5cdFx0XHRcdGluZGV4S2V5OiBsZWFkaW5nUm93LndvcmQsXG5cdFx0XHRcdHJvd3M6IHJhbmdlRm9yTGVhZGluZ1Jvdy5tZXRhRW50cmllcyxcblx0XHRcdH0sXG5cdFx0XVxuXHRcdGZpcnN0VG9rZW5JbmZvWzFdID0gcmFuZ2VGb3JMZWFkaW5nUm93Lm9sZGVzdFRpbWVzdGFtcFxuXHRcdGNvbnN0IHJvd3NGb3JPdGhlclJvd3MgPSBvdGhlclJvd3MubWFwKChyKSA9PiB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRpbmRleEtleTogci53b3JkLFxuXHRcdFx0XHRyb3dzOiB0aGlzLl9maW5kUm93c1RvUmVhZEJ5VGltZVJhbmdlKHIsIHR5cGVJbmZvLCByYW5nZUZvckxlYWRpbmdSb3cubmV3ZXN0Um93VGltZXN0YW1wLCByYW5nZUZvckxlYWRpbmdSb3cub2xkZXN0VGltZXN0YW1wKSxcblx0XHRcdH1cblx0XHR9KVxuXHRcdHJldHVybiByb3dzRm9yTGVhZGluZ1Jvdy5jb25jYXQocm93c0Zvck90aGVyUm93cylcblx0fVxuXG5cdF9maW5kRW50cmllc0Zvck1ldGFkYXRhKHRyYW5zYWN0aW9uOiBEYlRyYW5zYWN0aW9uLCBlbnRyeTogU2VhcmNoSW5kZXhNZXRhZGF0YUVudHJ5KTogUHJvbWlzZTxFbmNyeXB0ZWRTZWFyY2hJbmRleEVudHJ5W10+IHtcblx0XHRyZXR1cm4gdHJhbnNhY3Rpb24uZ2V0KFNlYXJjaEluZGV4T1MsIGVudHJ5LmtleSkudGhlbigoaW5kZXhFbnRyaWVzUm93KSA9PiB7XG5cdFx0XHRpZiAoIWluZGV4RW50cmllc1JvdykgcmV0dXJuIFtdXG5cdFx0XHRjb25zdCByZXN1bHQgPSBuZXcgQXJyYXkoZW50cnkuc2l6ZSlcblx0XHRcdGl0ZXJhdGVCaW5hcnlCbG9ja3MoaW5kZXhFbnRyaWVzUm93IGFzIFVpbnQ4QXJyYXksIChibG9jaywgcywgZSwgaXRlcmF0aW9uKSA9PiB7XG5cdFx0XHRcdHJlc3VsdFtpdGVyYXRpb25dID0gYmxvY2tcblx0XHRcdH0pXG5cdFx0XHRyZXR1cm4gcmVzdWx0XG5cdFx0fSlcblx0fVxuXG5cdF9maW5kUm93c1RvUmVhZEJ5VGltZVJhbmdlKFxuXHRcdG1ldGFEYXRhOiBTZWFyY2hJbmRleE1ldGFEYXRhUm93LFxuXHRcdHR5cGVJbmZvOiBUeXBlSW5mbyxcblx0XHRmcm9tTmV3ZXN0VGltZXN0YW1wOiBudW1iZXIsXG5cdFx0dG9PbGRlc3RUaW1lc3RhbXA6IG51bWJlcixcblx0KTogQXJyYXk8U2VhcmNoSW5kZXhNZXRhZGF0YUVudHJ5PiB7XG5cdFx0Y29uc3QgZmlsdGVyZWRSb3dzID0gbWV0YURhdGEucm93cy5maWx0ZXIoKHIpID0+IHIuYXBwID09PSB0eXBlSW5mby5hcHBJZCAmJiByLnR5cGUgPT09IHR5cGVJbmZvLnR5cGVJZClcblx0XHRmaWx0ZXJlZFJvd3MucmV2ZXJzZSgpXG5cdFx0Y29uc3QgcGFzc2VkUm93czogU2VhcmNoSW5kZXhNZXRhZGF0YUVudHJ5W10gPSBbXVxuXG5cdFx0Zm9yIChsZXQgcm93IG9mIGZpbHRlcmVkUm93cykge1xuXHRcdFx0aWYgKHJvdy5vbGRlc3RFbGVtZW50VGltZXN0YW1wIDwgZnJvbU5ld2VzdFRpbWVzdGFtcCkge1xuXHRcdFx0XHRwYXNzZWRSb3dzLnB1c2gocm93KVxuXG5cdFx0XHRcdGlmIChyb3cub2xkZXN0RWxlbWVudFRpbWVzdGFtcCA8PSB0b09sZGVzdFRpbWVzdGFtcCkge1xuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gcGFzc2VkUm93c1xuXHR9XG5cblx0X2ZpbmRSb3dzVG9SZWFkKFxuXHRcdG1ldGFEYXRhOiBTZWFyY2hJbmRleE1ldGFEYXRhUm93LFxuXHRcdHR5cGVJbmZvOiBUeXBlSW5mbyxcblx0XHRtdXN0QmVPbGRlclRoYW46IG51bWJlcixcblx0XHRtYXhSZXN1bHRzOiBudW1iZXIgfCBudWxsIHwgdW5kZWZpbmVkLFxuXHQpOiB7XG5cdFx0bWV0YUVudHJpZXM6IEFycmF5PFNlYXJjaEluZGV4TWV0YWRhdGFFbnRyeT5cblx0XHRvbGRlc3RUaW1lc3RhbXA6IG51bWJlclxuXHRcdG5ld2VzdFJvd1RpbWVzdGFtcDogbnVtYmVyXG5cdH0ge1xuXHRcdGNvbnN0IGZpbHRlcmVkUm93cyA9IG1ldGFEYXRhLnJvd3MuZmlsdGVyKChyKSA9PiByLmFwcCA9PT0gdHlwZUluZm8uYXBwSWQgJiYgci50eXBlID09PSB0eXBlSW5mby50eXBlSWQpXG5cdFx0ZmlsdGVyZWRSb3dzLnJldmVyc2UoKVxuXHRcdGxldCBlbnRpdGllc1RvUmVhZCA9IDBcblx0XHRsZXQgbGFzdFJlYWRSb3dUaW1lc3RhbXAgPSAwXG5cdFx0bGV0IG5ld2VzdFJvd1RpbWVzdGFtcCA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSXG5cdFx0bGV0IHJvd3NUb1JlYWRcblxuXHRcdGlmIChtYXhSZXN1bHRzKSB7XG5cdFx0XHRyb3dzVG9SZWFkID0gW11cblxuXHRcdFx0Zm9yIChsZXQgciBvZiBmaWx0ZXJlZFJvd3MpIHtcblx0XHRcdFx0aWYgKHIub2xkZXN0RWxlbWVudFRpbWVzdGFtcCA8IG11c3RCZU9sZGVyVGhhbikge1xuXHRcdFx0XHRcdGlmIChlbnRpdGllc1RvUmVhZCA8IDEwMDApIHtcblx0XHRcdFx0XHRcdGVudGl0aWVzVG9SZWFkICs9IHIuc2l6ZVxuXHRcdFx0XHRcdFx0bGFzdFJlYWRSb3dUaW1lc3RhbXAgPSByLm9sZGVzdEVsZW1lbnRUaW1lc3RhbXBcblx0XHRcdFx0XHRcdHJvd3NUb1JlYWQucHVzaChyKVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRuZXdlc3RSb3dUaW1lc3RhbXAgPSByLm9sZGVzdEVsZW1lbnRUaW1lc3RhbXBcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyb3dzVG9SZWFkID0gZmlsdGVyZWRSb3dzXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdG1ldGFFbnRyaWVzOiByb3dzVG9SZWFkLFxuXHRcdFx0b2xkZXN0VGltZXN0YW1wOiBsYXN0UmVhZFJvd1RpbWVzdGFtcCxcblx0XHRcdG5ld2VzdFJvd1RpbWVzdGFtcDogbmV3ZXN0Um93VGltZXN0YW1wLFxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZWR1Y2VzIHRoZSBzZWFyY2ggcmVzdWx0IGJ5IGZpbHRlcmluZyBvdXQgYWxsIG1haWxJZHMgdGhhdCBkb24ndCBtYXRjaCBhbGwgc2VhcmNoIHRva2Vuc1xuXHQgKi9cblx0X2ZpbHRlckJ5RW5jcnlwdGVkSWQocmVzdWx0czogS2V5VG9FbmNyeXB0ZWRJbmRleEVudHJpZXNbXSk6IEtleVRvRW5jcnlwdGVkSW5kZXhFbnRyaWVzW10ge1xuXHRcdGxldCBtYXRjaGluZ0VuY0lkczogU2V0PG51bWJlcj4gfCBudWxsID0gbnVsbFxuXHRcdGZvciAoY29uc3Qga2V5VG9FbmNyeXB0ZWRJbmRleEVudHJ5IG9mIHJlc3VsdHMpIHtcblx0XHRcdGlmIChtYXRjaGluZ0VuY0lkcyA9PSBudWxsKSB7XG5cdFx0XHRcdG1hdGNoaW5nRW5jSWRzID0gbmV3IFNldChrZXlUb0VuY3J5cHRlZEluZGV4RW50cnkuaW5kZXhFbnRyaWVzLm1hcCgoZW50cnkpID0+IGVudHJ5LmlkSGFzaCkpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBmaWx0ZXJlZCA9IG5ldyBTZXQ8bnVtYmVyPigpXG5cdFx0XHRcdGZvciAoY29uc3QgaW5kZXhFbnRyeSBvZiBrZXlUb0VuY3J5cHRlZEluZGV4RW50cnkuaW5kZXhFbnRyaWVzKSB7XG5cdFx0XHRcdFx0aWYgKG1hdGNoaW5nRW5jSWRzLmhhcyhpbmRleEVudHJ5LmlkSGFzaCkpIHtcblx0XHRcdFx0XHRcdGZpbHRlcmVkLmFkZChpbmRleEVudHJ5LmlkSGFzaClcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0bWF0Y2hpbmdFbmNJZHMgPSBmaWx0ZXJlZFxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0cy5tYXAoKHIpID0+IHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGluZGV4S2V5OiByLmluZGV4S2V5LFxuXHRcdFx0XHRpbmRleEVudHJpZXM6IHIuaW5kZXhFbnRyaWVzLmZpbHRlcigoZW50cnkpID0+IG1hdGNoaW5nRW5jSWRzPy5oYXMoZW50cnkuaWRIYXNoKSksXG5cdFx0XHR9XG5cdFx0fSlcblx0fVxuXG5cdF9kZWNyeXB0U2VhcmNoUmVzdWx0KHJlc3VsdHM6IEtleVRvRW5jcnlwdGVkSW5kZXhFbnRyaWVzW10pOiBLZXlUb0luZGV4RW50cmllc1tdIHtcblx0XHRyZXR1cm4gcmVzdWx0cy5tYXAoKHNlYXJjaFJlc3VsdCkgPT4ge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0aW5kZXhLZXk6IHNlYXJjaFJlc3VsdC5pbmRleEtleSxcblx0XHRcdFx0aW5kZXhFbnRyaWVzOiBzZWFyY2hSZXN1bHQuaW5kZXhFbnRyaWVzLm1hcCgoZW50cnkpID0+IGRlY3J5cHRTZWFyY2hJbmRleEVudHJ5KHRoaXMuX2RiLmtleSwgZW50cnkuZW5jRW50cnksIHRoaXMuX2RiLml2KSksXG5cdFx0XHR9XG5cdFx0fSlcblx0fVxuXG5cdF9maWx0ZXJCeVR5cGVBbmRBdHRyaWJ1dGVBbmRUaW1lKHJlc3VsdHM6IEtleVRvSW5kZXhFbnRyaWVzW10sIHJlc3RyaWN0aW9uOiBTZWFyY2hSZXN0cmljdGlvbik6IEtleVRvSW5kZXhFbnRyaWVzW10ge1xuXHRcdC8vIGZpcnN0IGZpbHRlciBlYWNoIGluZGV4IGVudHJ5IGJ5IGl0c2VsZlxuXHRcdGxldCBlbmRUaW1lc3RhbXAgPSB0aGlzLl9nZXRTZWFyY2hFbmRUaW1lc3RhbXAocmVzdHJpY3Rpb24pXG5cblx0XHRjb25zdCBtaW5JbmNsdWRlZElkID0gdGltZXN0YW1wVG9HZW5lcmF0ZWRJZChlbmRUaW1lc3RhbXApXG5cdFx0Y29uc3QgbWF4RXhjbHVkZWRJZCA9IHJlc3RyaWN0aW9uLnN0YXJ0ID8gdGltZXN0YW1wVG9HZW5lcmF0ZWRJZChyZXN0cmljdGlvbi5zdGFydCArIDEpIDogbnVsbFxuXHRcdGZvciAoY29uc3QgcmVzdWx0IG9mIHJlc3VsdHMpIHtcblx0XHRcdHJlc3VsdC5pbmRleEVudHJpZXMgPSByZXN1bHQuaW5kZXhFbnRyaWVzLmZpbHRlcigoZW50cnkpID0+IHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX2lzVmFsaWRBdHRyaWJ1dGVBbmRUaW1lKHJlc3RyaWN0aW9uLCBlbnRyeSwgbWluSW5jbHVkZWRJZCwgbWF4RXhjbHVkZWRJZClcblx0XHRcdH0pXG5cdFx0fVxuXHRcdC8vIG5vdyBmaWx0ZXIgYWxsIGlkcyB0aGF0IGFyZSBpbiBhbGwgb2YgdGhlIHNlYXJjaCB3b3Jkc1xuXHRcdGxldCBtYXRjaGluZ0lkczogU2V0PElkPiB8IG51bGwgPSBudWxsXG5cdFx0Zm9yIChjb25zdCBrZXlUb0luZGV4RW50cnkgb2YgcmVzdWx0cykge1xuXHRcdFx0aWYgKCFtYXRjaGluZ0lkcykge1xuXHRcdFx0XHRtYXRjaGluZ0lkcyA9IG5ldyBTZXQoa2V5VG9JbmRleEVudHJ5LmluZGV4RW50cmllcy5tYXAoKGVudHJ5KSA9PiBlbnRyeS5pZCkpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRsZXQgZmlsdGVyZWQgPSBuZXcgU2V0PElkPigpXG5cdFx0XHRcdGZvciAoY29uc3QgZW50cnkgb2Yga2V5VG9JbmRleEVudHJ5LmluZGV4RW50cmllcykge1xuXHRcdFx0XHRcdGlmIChtYXRjaGluZ0lkcy5oYXMoZW50cnkuaWQpKSB7XG5cdFx0XHRcdFx0XHRmaWx0ZXJlZC5hZGQoZW50cnkuaWQpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdG1hdGNoaW5nSWRzID0gZmlsdGVyZWRcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdHMubWFwKChyKSA9PiB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRpbmRleEtleTogci5pbmRleEtleSxcblx0XHRcdFx0aW5kZXhFbnRyaWVzOiByLmluZGV4RW50cmllcy5maWx0ZXIoKGVudHJ5KSA9PiBtYXRjaGluZ0lkcz8uaGFzKGVudHJ5LmlkKSksXG5cdFx0XHR9XG5cdFx0fSlcblx0fVxuXG5cdF9pc1ZhbGlkQXR0cmlidXRlQW5kVGltZShyZXN0cmljdGlvbjogU2VhcmNoUmVzdHJpY3Rpb24sIGVudHJ5OiBTZWFyY2hJbmRleEVudHJ5LCBtaW5JbmNsdWRlZElkOiBJZCwgbWF4RXhjbHVkZWRJZDogSWQgfCBudWxsKTogYm9vbGVhbiB7XG5cdFx0aWYgKHJlc3RyaWN0aW9uLmF0dHJpYnV0ZUlkcykge1xuXHRcdFx0aWYgKCFjb250YWlucyhyZXN0cmljdGlvbi5hdHRyaWJ1dGVJZHMsIGVudHJ5LmF0dHJpYnV0ZSkpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKG1heEV4Y2x1ZGVkSWQpIHtcblx0XHRcdC8vIHRpbWVzdGFtcFRvR2VuZXJhdGVkSWQgcHJvdmlkZXMgdGhlIGxvd2VzdCBpZCB3aXRoIHRoZSBnaXZlbiB0aW1lc3RhbXAgKHNlcnZlciBpZCBhbmQgY291bnRlciBzZXQgdG8gMCksXG5cdFx0XHQvLyBzbyB3ZSBhZGQgb25lIG1pbGxpc2Vjb25kIHRvIG1ha2Ugc3VyZSBhbGwgaWRzIG9mIHRoZSB0aW1lc3RhbXAgYXJlIGNvdmVyZWRcblx0XHRcdGlmICghZmlyc3RCaWdnZXJUaGFuU2Vjb25kKG1heEV4Y2x1ZGVkSWQsIGVudHJ5LmlkKSkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gIWZpcnN0QmlnZ2VyVGhhblNlY29uZChtaW5JbmNsdWRlZElkLCBlbnRyeS5pZClcblx0fVxuXG5cdF9yZWR1Y2VXb3JkcyhyZXN1bHRzOiBLZXlUb0luZGV4RW50cmllc1tdLCBtYXRjaFdvcmRPcmRlcjogYm9vbGVhbik6IFJlYWRvbmx5QXJyYXk8RGVjcnlwdGVkU2VhcmNoSW5kZXhFbnRyeT4ge1xuXHRcdGlmIChtYXRjaFdvcmRPcmRlcikge1xuXHRcdFx0cmV0dXJuIHJlc3VsdHNbMF0uaW5kZXhFbnRyaWVzLmZpbHRlcigoZmlyc3RXb3JkRW50cnkpID0+IHtcblx0XHRcdFx0Ly8gcmVkdWNlIHRoZSBmaWx0ZXJlZCBwb3NpdGlvbnMgZm9yIHRoaXMgZmlyc3Qgd29yZCBlbnRyeSBhbmQgaXRzIGF0dHJpYnV0ZSB3aXRoIGVhY2ggbmV4dCB3b3JkIHRvIHRob3NlIHRoYXQgYXJlIGluIG9yZGVyXG5cdFx0XHRcdGxldCBmaWx0ZXJlZFBvc2l0aW9ucyA9IGZpcnN0V29yZEVudHJ5LnBvc2l0aW9ucy5zbGljZSgpXG5cblx0XHRcdFx0Zm9yIChsZXQgaSA9IDE7IGkgPCByZXN1bHRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0bGV0IGVudHJ5ID0gcmVzdWx0c1tpXS5pbmRleEVudHJpZXMuZmluZCgoZSkgPT4gZS5pZCA9PT0gZmlyc3RXb3JkRW50cnkuaWQgJiYgZS5hdHRyaWJ1dGUgPT09IGZpcnN0V29yZEVudHJ5LmF0dHJpYnV0ZSlcblxuXHRcdFx0XHRcdGlmIChlbnRyeSkge1xuXHRcdFx0XHRcdFx0ZmlsdGVyZWRQb3NpdGlvbnMgPSBmaWx0ZXJlZFBvc2l0aW9ucy5maWx0ZXIoKGZpcnN0V29yZFBvc2l0aW9uKSA9PlxuXHRcdFx0XHRcdFx0XHRuZXZlck51bGwoZW50cnkpLnBvc2l0aW9ucy5maW5kKChwb3NpdGlvbikgPT4gcG9zaXRpb24gPT09IGZpcnN0V29yZFBvc2l0aW9uICsgaSksXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdC8vIHRoZSBpZCB3YXMgcHJvYmFibHkgbm90IGZvdW5kIGZvciB0aGUgc2FtZSBhdHRyaWJ1dGUgYXMgdGhlIGN1cnJlbnQgZmlsdGVyZWQgcG9zaXRpb25zLCBzbyB3ZSBjb3VsZCBub3QgZmluZCBhbGwgd29yZHMgaW4gb3JkZXIgaW4gdGhlIHNhbWUgYXR0cmlidXRlXG5cdFx0XHRcdFx0XHRmaWx0ZXJlZFBvc2l0aW9ucyA9IFtdXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIGZpbHRlcmVkUG9zaXRpb25zLmxlbmd0aCA+IDBcblx0XHRcdH0pXG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGFsbCBpZHMgbXVzdCBhcHBlYXIgaW4gYWxsIHdvcmRzIG5vdywgc28gd2UgY2FuIHVzZSBhbnkgb2YgdGhlIGVudHJpZXMgbGlzdHNcblx0XHRcdHJldHVybiByZXN1bHRzWzBdLmluZGV4RW50cmllc1xuXHRcdH1cblx0fVxuXG5cdF9yZWR1Y2VUb1VuaXF1ZUVsZW1lbnRJZHMocmVzdWx0czogUmVhZG9ubHlBcnJheTxEZWNyeXB0ZWRTZWFyY2hJbmRleEVudHJ5PiwgcHJldmlvdXNSZXN1bHQ6IFNlYXJjaFJlc3VsdCk6IFJlYWRvbmx5QXJyYXk8TW9yZVJlc3VsdHNJbmRleEVudHJ5PiB7XG5cdFx0Y29uc3QgdW5pcXVlSWRzID0gbmV3IFNldDxzdHJpbmc+KClcblx0XHRyZXR1cm4gcmVzdWx0cy5maWx0ZXIoKGVudHJ5KSA9PiB7XG5cdFx0XHRpZiAoIXVuaXF1ZUlkcy5oYXMoZW50cnkuaWQpICYmICFwcmV2aW91c1Jlc3VsdC5yZXN1bHRzLnNvbWUoKHIpID0+IHJbMV0gPT09IGVudHJ5LmlkKSkge1xuXHRcdFx0XHR1bmlxdWVJZHMuYWRkKGVudHJ5LmlkKVxuXHRcdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHR9XG5cdFx0fSlcblx0fVxuXG5cdF9maWx0ZXJCeUxpc3RJZEFuZEdyb3VwU2VhcmNoUmVzdWx0cyhcblx0XHRpbmRleEVudHJpZXM6IEFycmF5PE1vcmVSZXN1bHRzSW5kZXhFbnRyeT4sXG5cdFx0c2VhcmNoUmVzdWx0OiBTZWFyY2hSZXN1bHQsXG5cdFx0bWF4UmVzdWx0czogbnVtYmVyIHwgbnVsbCB8IHVuZGVmaW5lZCxcblx0KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0aW5kZXhFbnRyaWVzLnNvcnQoKGwsIHIpID0+IGNvbXBhcmVOZXdlc3RGaXJzdChsLmlkLCByLmlkKSlcblx0XHQvLyBXZSBmaWx0ZXIgb3V0IGV2ZXJ5dGhpbmcgd2UndmUgcHJvY2Vzc2VkIGZyb20gbW9yZUVudHJpZXMsIGV2ZW4gaWYgd2UgZGlkbid0IGluY2x1ZGUgaXRcblx0XHQvLyBkb3duY2FzdDogQXJyYXkgb2Ygb3B0aW9uYWwgZWxlbWVudHMgaW4gbm90IHN1YnR5cGUgb2Ygbm9uLW9wdGlvbmFsIGVsZW1lbnRzXG5cdFx0Y29uc3QgZW50cmllc0NvcHk6IEFycmF5PE1vcmVSZXN1bHRzSW5kZXhFbnRyeSB8IG51bGw+ID0gZG93bmNhc3QoaW5kZXhFbnRyaWVzLnNsaWNlKCkpXG5cdFx0Ly8gUmVzdWx0cyBhcmUgYWRkZWQgaW4gdGhlIHJhbmRvbSBvcmRlciBhbmQgd2UgbWF5IGZpbHRlciBzb21lIG9mIHRoZW0gb3V0LiBXZSBuZWVkIHRvIHNvcnQgdGhlbS5cblx0XHQvLyBVc2Ugc2VwYXJhdGUgYXJyYXkgdG8gb25seSBzb3J0IG5ldyByZXN1bHRzIGFuZCBub3QgYWxsIG9mIHRoZW0uXG5cdFx0cmV0dXJuIHRoaXMuX2RiLmRiRmFjYWRlXG5cdFx0XHQuY3JlYXRlVHJhbnNhY3Rpb24odHJ1ZSwgW0VsZW1lbnREYXRhT1NdKVxuXHRcdFx0LnRoZW4oKHRyYW5zYWN0aW9uKSA9PlxuXHRcdFx0XHQvLyBBcyBhbiBhdHRlbXB0IHRvIG9wdGltaXplIHNlYXJjaCB3ZSBsb29rIGZvciBpdGVtcyBpbiBwYXJhbGxlbC4gUHJvbWlzZS5tYXAgaXRlcmF0ZXMgaW4gYXJiaXRyYXJ5IG9yZGVyIVxuXHRcdFx0XHQvLyBCVVQhIHdlIGhhdmUgdG8gbG9vayBhdCBhbGwgb2YgdGhlbSEgT3RoZXJ3aXNlLCB3ZSBtYXkgcmV0dXJuIHRoZW0gaW4gdGhlIHdyb25nIG9yZGVyLlxuXHRcdFx0XHQvLyBXZSBjYW5ub3QgcmV0dXJuIGVsZW1lbnRzIDEwLCAxNSwgMjAgaWYgd2UgZGlkbid0IHJldHVybiBlbGVtZW50IDUgZmlyc3QsIG5vIG9uZSB3aWxsIGFzayBmb3IgaXQgbGF0ZXIuXG5cdFx0XHRcdC8vIFRoZSBiZXN0IHRoaW5nIHBlcmZvcm1hbmNlLXdpc2Ugd291bGQgYmUgdG8gc3BsaXQgaW50byBjaHVua3Mgb2YgY2VydGFpbiBsZW5ndGggYW5kIHByb2Nlc3MgdGhlbSBpbiBwYXJhbGxlbCBhbmQgc3RvcCBhZnRlciBjZXJ0YWluIGNodW5rLlxuXHRcdFx0XHRwcm9taXNlTWFwKFxuXHRcdFx0XHRcdGluZGV4RW50cmllcy5zbGljZSgwLCBtYXhSZXN1bHRzIHx8IGluZGV4RW50cmllcy5sZW5ndGggKyAxKSxcblx0XHRcdFx0XHRhc3luYyAoZW50cnksIGluZGV4KSA9PiB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJhbnNhY3Rpb24uZ2V0KEVsZW1lbnREYXRhT1MsIHVpbnQ4QXJyYXlUb0Jhc2U2NChlbnRyeS5lbmNJZCkpLnRoZW4oKGVsZW1lbnREYXRhOiBFbGVtZW50RGF0YURiUm93IHwgbnVsbCkgPT4ge1xuXHRcdFx0XHRcdFx0XHQvLyBtYXJrIHJlc3VsdCBpbmRleCBpZCBhcyBwcm9jZXNzZWQgdG8gbm90IHF1ZXJ5IHJlc3VsdCBpbiBuZXh0IGxvYWQgbW9yZSBvcGVyYXRpb25cblx0XHRcdFx0XHRcdFx0ZW50cmllc0NvcHlbaW5kZXhdID0gbnVsbFxuXG5cdFx0XHRcdFx0XHRcdGlmIChlbGVtZW50RGF0YSkge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBbZWxlbWVudERhdGFbMF0sIGVudHJ5LmlkXSBhcyBJZFR1cGxlXG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG51bGxcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGNvbmN1cnJlbmN5OiA1LFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdCksXG5cdFx0XHQpXG5cdFx0XHQudGhlbigoaW50ZXJtZWRpYXRlUmVzdWx0cykgPT4gaW50ZXJtZWRpYXRlUmVzdWx0cy5maWx0ZXIoaXNOb3ROdWxsKSlcblx0XHRcdC50aGVuKGFzeW5jIChpbnRlcm1lZGlhdGVSZXN1bHRzKSA9PiB7XG5cdFx0XHRcdC8vIGFwcGx5IGZvbGRlciByZXN0cmljdGlvbnMgdG8gaW50ZXJtZWRpYXRlUmVzdWx0c1xuXG5cdFx0XHRcdGlmIChpc0VtcHR5KHNlYXJjaFJlc3VsdC5yZXN0cmljdGlvbi5mb2xkZXJJZHMpKSB7XG5cdFx0XHRcdFx0Ly8gbm8gZm9sZGVyIHJlc3RyaWN0aW9ucyAoQUxMKVxuXHRcdFx0XHRcdHJldHVybiBpbnRlcm1lZGlhdGVSZXN1bHRzXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gc29tZSBmb2xkZXIgcmVzdHJpY3Rpb25zIChlLmcuIElOQk9YKVxuXG5cdFx0XHRcdFx0Ly8gV2l0aCB0aGUgbmV3IG1haWxTZXQgYXJjaGl0ZWN0dXJlIChzdGF0aWMgbWFpbCBsaXN0cykgd2UgbmVlZCB0byBsb2FkIGV2ZXJ5IG1haWxcblx0XHRcdFx0XHQvLyBpbiBvcmRlciB0byBjaGVjayBpbiB3aGljaCBtYWlsU2V0IChmb2xkZXIpIGEgbWFpbCBpcyBpbmNsdWRlZCBpbi5cblx0XHRcdFx0XHRjb25zdCBtYWlscyA9IGF3YWl0IFByb21pc2UuYWxsKFxuXHRcdFx0XHRcdFx0aW50ZXJtZWRpYXRlUmVzdWx0cy5tYXAoKGludGVybWVkaWF0ZVJlc3VsdElkKSA9PlxuXHRcdFx0XHRcdFx0XHR0aGlzLl9lbnRpdHlDbGllbnQubG9hZChNYWlsVHlwZVJlZiwgaW50ZXJtZWRpYXRlUmVzdWx0SWQpLmNhdGNoKFxuXHRcdFx0XHRcdFx0XHRcdG9mQ2xhc3MoTm90Rm91bmRFcnJvciwgKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coYENvdWxkIG5vdCBmaW5kIHVwZGF0ZWQgbWFpbCAke0pTT04uc3RyaW5naWZ5KGludGVybWVkaWF0ZVJlc3VsdElkKX1gKVxuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG51bGxcblx0XHRcdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHRcdHJldHVybiBtYWlsc1xuXHRcdFx0XHRcdFx0LmZpbHRlcihpc05vdE51bGwpXG5cdFx0XHRcdFx0XHQuZmlsdGVyKChtYWlsKSA9PiB7XG5cdFx0XHRcdFx0XHRcdGxldCBmb2xkZXJJZHM6IEFycmF5PElkPiA9IG1haWwuc2V0cy5tYXAoKHNldElkKSA9PiBlbGVtZW50SWRQYXJ0KHNldElkKSlcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGZvbGRlcklkcy5zb21lKChmb2xkZXJJZCkgPT4gc2VhcmNoUmVzdWx0LnJlc3RyaWN0aW9uLmZvbGRlcklkcy5pbmNsdWRlcyhmb2xkZXJJZCkpXG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0Lm1hcCgobWFpbCkgPT4gbWFpbC5faWQpXG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0XHQudGhlbigobmV3UmVzdWx0cykgPT4ge1xuXHRcdFx0XHRzZWFyY2hSZXN1bHQucmVzdWx0cy5wdXNoKC4uLihuZXdSZXN1bHRzIGFzIElkVHVwbGVbXSkpXG5cdFx0XHRcdHNlYXJjaFJlc3VsdC5tb3JlUmVzdWx0cyA9IGVudHJpZXNDb3B5LmZpbHRlcihpc05vdE51bGwpXG5cdFx0XHR9KVxuXHR9XG5cblx0YXN5bmMgZ2V0TW9yZVNlYXJjaFJlc3VsdHMoc2VhcmNoUmVzdWx0OiBTZWFyY2hSZXN1bHQsIG1vcmVSZXN1bHRDb3VudDogbnVtYmVyKTogUHJvbWlzZTxTZWFyY2hSZXN1bHQ+IHtcblx0XHRhd2FpdCB0aGlzLl9zdGFydE9yQ29udGludWVTZWFyY2goc2VhcmNoUmVzdWx0LCBtb3JlUmVzdWx0Q291bnQpXG5cdFx0cmV0dXJuIHNlYXJjaFJlc3VsdFxuXHR9XG5cblx0X2dldFNlYXJjaEVuZFRpbWVzdGFtcChyZXN0cmljdGlvbjogU2VhcmNoUmVzdHJpY3Rpb24pOiBudW1iZXIge1xuXHRcdGlmIChyZXN0cmljdGlvbi5lbmQpIHtcblx0XHRcdHJldHVybiByZXN0cmljdGlvbi5lbmRcblx0XHR9IGVsc2UgaWYgKGlzU2FtZVR5cGVSZWYoTWFpbFR5cGVSZWYsIHJlc3RyaWN0aW9uLnR5cGUpKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fbWFpbEluZGV4ZXIuY3VycmVudEluZGV4VGltZXN0YW1wID09PSBOT1RISU5HX0lOREVYRURfVElNRVNUQU1QID8gRGF0ZS5ub3coKSA6IHRoaXMuX21haWxJbmRleGVyLmN1cnJlbnRJbmRleFRpbWVzdGFtcFxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gRlVMTF9JTkRFWEVEX1RJTUVTVEFNUFxuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBub3JtYWxpemVRdWVyeShxdWVyeTogc3RyaW5nKTogc3RyaW5nIHtcblx0cmV0dXJuIHRva2VuaXplKHF1ZXJ5KS5qb2luKFwiIFwiKVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFvRWEsZUFBTixNQUFtQjtDQUN6QjtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBRUEsWUFDa0JBLFlBQ2pCQyxJQUNBQyxhQUNBQyxtQkFDQUMsYUFDQUMsY0FDQztFQW9uQkYsS0ExbkJrQjtBQU9qQixPQUFLLE1BQU07QUFDWCxPQUFLLGVBQWU7QUFDcEIsT0FBSyxxQkFBcUI7QUFDMUIsT0FBSyxvQkFBb0IsaUJBQWlCLFlBQVksbUJBQW1CO0FBQ3pFLE9BQUssZ0JBQWdCO0NBQ3JCOzs7Ozs7OztDQVVELE9BQU9DLE9BQWVDLGFBQWdDQyxvQkFBNEJDLFlBQTRDO0FBQzdILFNBQU8sS0FBSyxJQUFJLFlBQVksS0FBSyxNQUFNO0dBQ3RDLElBQUksZUFBZSxTQUFTLE1BQU07R0FDbEMsSUFBSUMsU0FBdUI7SUFDMUI7SUFDQTtJQUNBLFNBQVMsQ0FBRTtJQUNYLHVCQUF1QixLQUFLLHVCQUF1QixZQUFZO0lBQy9ELHdCQUF3QixhQUFhLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxJQUFLLEVBQUM7SUFDbEUsZ0JBQWdCLGFBQWEsU0FBUyxLQUFLLE1BQU0sV0FBVyxLQUFJLElBQUksTUFBTSxTQUFT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