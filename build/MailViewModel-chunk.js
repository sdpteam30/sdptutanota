import "./dist-chunk.js";
import { ProgrammingError } from "./ProgrammingError-chunk.js";
import { assertMainOrNode } from "./Env-chunk.js";
import "./ClientDetector-chunk.js";
import "./mithril-chunk.js";
import { assertNotNull, compare, count, debounce, first, groupBy, isEmpty, lastThrow, lazyMemoized, mapWith, mapWithout, memoized, ofClass, pMap, promiseFilter } from "./dist2-chunk.js";
import "./WhitelabelCustomizations-chunk.js";
import "./LanguageViewModel-chunk.js";
import "./styles-chunk.js";
import "./theme-chunk.js";
import { ImportStatus, MailSetKind, OperationType, getMailSetKind } from "./TutanotaConstants-chunk.js";
import "./KeyManager-chunk.js";
import "./WindowFacade-chunk.js";
import "./RootView-chunk.js";
import "./size-chunk.js";
import "./HtmlUtils-chunk.js";
import "./luxon-chunk.js";
import { CUSTOM_MAX_ID, customIdToUint8array, deconstructMailSetEntryId, elementIdPart, firstBiggerThanSecond, getElementId, isSameId, listIdPart } from "./EntityUtils-chunk.js";
import "./TypeModels-chunk.js";
import { ImportMailStateTypeRef, ImportedMailTypeRef, MailFolderTypeRef, MailSetEntryTypeRef, MailTypeRef } from "./TypeRefs-chunk.js";
import "./CommonCalendarUtils-chunk.js";
import "./TypeModels2-chunk.js";
import "./TypeRefs2-chunk.js";
import "./ParserCombinator-chunk.js";
import "./CalendarUtils-chunk.js";
import "./ImportExportUtils-chunk.js";
import "./FormatValidator-chunk.js";
import "./stream-chunk.js";
import "./DeviceConfig-chunk.js";
import "./Logger-chunk.js";
import "./ErrorHandler-chunk.js";
import "./EntityFunctions-chunk.js";
import "./TypeModels3-chunk.js";
import "./ModelInfo-chunk.js";
import { isOfflineError } from "./ErrorUtils-chunk.js";
import { NotAuthorizedError, NotFoundError, PreconditionFailedError } from "./RestError-chunk.js";
import "./SetupMultipleError-chunk.js";
import "./OutOfSyncError-chunk.js";
import "./CancelledError-chunk.js";
import "./EventQueue-chunk.js";
import { CacheMode, WsConnectionState } from "./EntityRestClient-chunk.js";
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
import "./MessageDispatcher-chunk.js";
import "./WorkerProxy-chunk.js";
import { isUpdateForTypeRef } from "./EntityUpdateUtils-chunk.js";
import "./dist3-chunk.js";
import "./KeyLoaderFacade-chunk.js";
import "./SessionType-chunk.js";
import "./EntityClient-chunk.js";
import "./PageContextLoginListener-chunk.js";
import "./RestClient-chunk.js";
import "./BirthdayUtils-chunk.js";
import "./Services2-chunk.js";
import "./FolderSystem-chunk.js";
import "./GroupUtils-chunk.js";
import { isOfTypeOrSubfolderOf, isSpamOrTrashFolder, isSubfolderOfType } from "./MailChecks-chunk.js";
import "./Button-chunk.js";
import "./Icons-chunk.js";
import "./DialogHeaderBar-chunk.js";
import "./CountryList-chunk.js";
import "./Dialog-chunk.js";
import "./Icon-chunk.js";
import "./AriaUtils-chunk.js";
import "./IconButton-chunk.js";
import "./Formatter-chunk.js";
import "./ProgressMonitor-chunk.js";
import "./Notifications-chunk.js";
import "./CommonLocator-chunk.js";
import { UserError } from "./UserError-chunk.js";
import "./MailAddressParser-chunk.js";
import "./BlobUtils-chunk.js";
import "./FileUtils-chunk.js";
import "./ProgressDialog-chunk.js";
import "./SharedMailUtils-chunk.js";
import "./PasswordUtils-chunk.js";
import "./Recipient-chunk.js";
import "./ContactUtils-chunk.js";
import "./SubscriptionDialogs-chunk.js";
import "./ExternalLink-chunk.js";
import "./ToggleButton-chunk.js";
import "./SnackBar-chunk.js";
import "./Credentials-chunk.js";
import "./NotificationOverlay-chunk.js";
import "./Checkbox-chunk.js";
import "./Expander-chunk.js";
import "./ClipboardUtils-chunk.js";
import "./Services4-chunk.js";
import "./BubbleButton-chunk.js";
import "./ErrorReporter-chunk.js";
import "./PasswordField-chunk.js";
import "./PasswordRequestDialog-chunk.js";
import "./ErrorHandlerImpl-chunk.js";
import "./List-chunk.js";
import "./RouteChange-chunk.js";
import { ListModel } from "./ListModel-chunk.js";
import "./CustomerUtils-chunk.js";
import "./mailLocator-chunk.js";
import "./LoginScreenHeader-chunk.js";
import "./LoginButton-chunk.js";
import "./LoginUtils-chunk.js";
import "./AttachmentBubble-chunk.js";
import "./MailGuiUtils-chunk.js";
import "./UsageTestModel-chunk.js";
import { assertSystemFolderOfType } from "./MailUtils-chunk.js";
import "./BrowserWebauthn-chunk.js";
import "./PermissionType-chunk.js";
import "./CommonMailUtils-chunk.js";
import "./SearchUtils-chunk.js";
import "./FontIcons-chunk.js";
import { MailFilterType, getMailFilterForType } from "./MailViewerViewModel-chunk.js";
import "./LoadingState-chunk.js";
import "./inlineImagesUtils-chunk.js";

//#region src/mail-app/mail/model/MailListModel.ts
assertMainOrNode();
var MailListModel = class {
	listModel;
	mailMap = new Map();
	constructor(mailSet, conversationPrefProvider, entityClient, mailModel, inboxRuleHandler, cacheStorage) {
		this.mailSet = mailSet;
		this.conversationPrefProvider = conversationPrefProvider;
		this.entityClient = entityClient;
		this.mailModel = mailModel;
		this.inboxRuleHandler = inboxRuleHandler;
		this.cacheStorage = cacheStorage;
		this.listModel = new ListModel({
			fetch: (lastFetchedItem, count$1) => {
				const lastFetchedId = lastFetchedItem?.mailSetEntry?._id ?? [mailSet.entries, CUSTOM_MAX_ID];
				return this.loadMails(lastFetchedId, count$1);
			},
			sortCompare: (item1, item2) => {
				const item1Id = getElementId(item1.mailSetEntry);
				const item2Id = getElementId(item2.mailSetEntry);
				return compare(customIdToUint8array(item2Id), customIdToUint8array(item1Id));
			},
			getItemId: (item) => getElementId(item.mailSetEntry),
			isSameId: (id1, id2) => id1 === id2,
			autoSelectBehavior: () => this.conversationPrefProvider.getMailAutoSelectBehavior()
		});
	}
	get items() {
		return this._loadedMails().map((mail) => mail.mail);
	}
	get loadingStatus() {
		return this.listModel.state.loadingStatus;
	}
	get stateStream() {
		return this.listModel.stateStream.map((state) => {
			const items = state.items.map((item) => item.mail);
			const selectedItems = new Set();
			for (const item of state.selectedItems) selectedItems.add(item.mail);
			const newState = {
				...state,
				items,
				selectedItems
			};
			return newState;
		});
	}
	isLoadingAll() {
		return this.listModel.state.loadingAll;
	}
	isItemSelected(mailId) {
		const loadedMail = this.mailMap.get(mailId);
		if (loadedMail == null) return false;
		return this.listModel.isItemSelected(getElementId(loadedMail.mailSetEntry));
	}
	getMail(mailElementId) {
		return this.getLoadedMailByMailId(mailElementId)?.mail ?? null;
	}
	getLabelsForMail(mail) {
		return this.getLoadedMailByMailInstance(mail)?.labels ?? [];
	}
	getMailSetEntry(mailSetEntryId) {
		return this.getLoadedMailByMailSetId(mailSetEntryId)?.mailSetEntry ?? null;
	}
	async loadAndSelect(mailId, shouldStop) {
		const mailFinder = (loadedMail) => isSameId(getElementId(loadedMail.mail), mailId);
		const mail = await this.listModel.loadAndSelect(mailFinder, shouldStop);
		return mail?.mail ?? null;
	}
	onSingleSelection(mail) {
		this.listModel.onSingleSelection(assertNotNull(this.getLoadedMailByMailInstance(mail)));
	}
	selectNone() {
		this.listModel.selectNone();
	}
	cancelLoadAll() {
		this.listModel.cancelLoadAll();
	}
	async loadInitial() {
		await this.listModel.loadInitial();
	}
	getSelectedAsArray() {
		return this.listModel.getSelectedAsArray().map(({ mail }) => mail);
	}
	async handleEntityUpdate(update) {
		if (isUpdateForTypeRef(MailFolderTypeRef, update)) {
			if (update.operation === OperationType.UPDATE) {
				const mailSetId = [update.instanceListId, update.instanceId];
				for (const loadedMail of this.mailMap.values()) {
					const hasMailSet = loadedMail.labels.some((label) => isSameId(mailSetId, label._id));
					if (!hasMailSet) continue;
					const labels = this.mailModel.getLabelsForMail(loadedMail.mail);
					const newMailEntry = {
						...loadedMail,
						labels
					};
					this._updateSingleMail(newMailEntry);
				}
			}
		} else if (isUpdateForTypeRef(MailSetEntryTypeRef, update) && isSameId(this.mailSet.entries, update.instanceListId)) {
			if (update.operation === OperationType.DELETE) {
				const mail = this.getLoadedMailByMailSetId(update.instanceId);
				if (mail) this.mailMap.delete(getElementId(mail.mail));
				await this.listModel.deleteLoadedItem(update.instanceId);
			} else if (update.operation === OperationType.CREATE) {
				const loadedMail = await this.loadSingleMail([update.instanceListId, update.instanceId]);
				await this.listModel.waitLoad(async () => {
					if (this.listModel.canInsertItem(loadedMail)) this.listModel.insertLoadedItem(loadedMail);
				});
			}
		} else if (isUpdateForTypeRef(MailTypeRef, update)) {
			const mailItem = this.mailMap.get(update.instanceId);
			if (mailItem != null && update.operation === OperationType.UPDATE) {
				const newMailData = await this.entityClient.load(MailTypeRef, [update.instanceListId, update.instanceId]);
				const labels = this.mailModel.getLabelsForMail(newMailData);
				const newMailItem = {
					...mailItem,
					labels,
					mail: newMailData
				};
				this._updateSingleMail(newMailItem);
			}
		}
	}
	areAllSelected() {
		return this.listModel.areAllSelected();
	}
	selectAll() {
		this.listModel.selectAll();
	}
	onSingleInclusiveSelection(mail, clearSelectionOnMultiSelectStart) {
		this.listModel.onSingleInclusiveSelection(assertNotNull(this.getLoadedMailByMailInstance(mail)), clearSelectionOnMultiSelectStart);
	}
	selectRangeTowards(mail) {
		this.listModel.selectRangeTowards(assertNotNull(this.getLoadedMailByMailInstance(mail)));
	}
	selectPrevious(multiselect) {
		this.listModel.selectPrevious(multiselect);
	}
	selectNext(multiselect) {
		this.listModel.selectNext(multiselect);
	}
	onSingleExclusiveSelection(mail) {
		this.listModel.onSingleExclusiveSelection(assertNotNull(this.getLoadedMailByMailInstance(mail)));
	}
	isInMultiselect() {
		return this.listModel.state.inMultiselect;
	}
	enterMultiselect() {
		this.listModel.enterMultiselect();
	}
	async loadAll() {
		await this.listModel.loadAll();
	}
	setFilter(filter) {
		this.listModel.setFilter(filter && ((loadedMail) => filter(loadedMail.mail)));
	}
	isEmptyAndDone() {
		return this.listModel.isEmptyAndDone();
	}
	async loadMore() {
		await this.listModel.loadMore();
	}
	async retryLoading() {
		await this.listModel.retryLoading();
	}
	stopLoading() {
		this.listModel.stopLoading();
	}
	getLoadedMailByMailId(mailId) {
		return this.mailMap.get(mailId) ?? null;
	}
	getLoadedMailByMailSetId(mailId) {
		return this.mailMap.get(deconstructMailSetEntryId(mailId).mailId) ?? null;
	}
	getLoadedMailByMailInstance(mail) {
		return this.getLoadedMailByMailId(getElementId(mail));
	}
	/**
	* Load mails, applying inbox rules as needed
	*/
	async loadMails(startingId, count$1) {
		let items = [];
		let complete = false;
		try {
			const mailSetEntries = await this.entityClient.loadRange(MailSetEntryTypeRef, listIdPart(startingId), elementIdPart(startingId), count$1, true);
			complete = mailSetEntries.length < count$1;
			if (mailSetEntries.length > 0) {
				items = await this.resolveMailSetEntries(mailSetEntries, this.defaultMailProvider);
				items = await this.applyInboxRulesToEntries(items);
			}
		} catch (e) {
			if (isOfflineError(e)) {
				if (items.length === 0) {
					complete = false;
					items = await this.loadMailsFromCache(startingId, count$1);
					if (items.length === 0) throw e;
				}
			} else throw e;
		}
		this.updateMailMap(items);
		return {
			items,
			complete
		};
	}
	/**
	* Load mails from the cache rather than remotely
	*/
	async loadMailsFromCache(startId, count$1) {
		const mailSetEntries = await this.cacheStorage.provideFromRange(MailSetEntryTypeRef, listIdPart(startId), elementIdPart(startId), count$1, true);
		return await this.resolveMailSetEntries(mailSetEntries, (list, elements) => this.cacheStorage.provideMultiple(MailTypeRef, list, elements));
	}
	/**
	* Apply inbox rules to an array of mails, returning all mails that were not moved
	*/
	async applyInboxRulesToEntries(entries) {
		if (this.mailSet.folderType !== MailSetKind.INBOX || entries.length === 0) return entries;
		const mailboxDetail = await this.mailModel.getMailboxDetailsForMailFolder(this.mailSet);
		if (!mailboxDetail) return entries;
		return await promiseFilter(entries, async (entry) => {
			const ruleApplied = await this.inboxRuleHandler.findAndApplyMatchingRule(mailboxDetail, entry.mail, true);
			return ruleApplied == null;
		});
	}
	async loadSingleMail(id) {
		const mailSetEntry = await this.entityClient.load(MailSetEntryTypeRef, id);
		const loadedMails = await this.resolveMailSetEntries([mailSetEntry], this.defaultMailProvider);
		this.updateMailMap(loadedMails);
		return assertNotNull(loadedMails[0]);
	}
	/**
	* Loads all Mail instances for each MailSetEntry, returning a tuple of each
	*/
	async resolveMailSetEntries(mailSetEntries, mailProvider) {
		const mailListMap = new Map();
		for (const entry of mailSetEntries) {
			const mailBag = listIdPart(entry.mail);
			const mailElementId = elementIdPart(entry.mail);
			let mailIds = mailListMap.get(mailBag);
			if (!mailIds) {
				mailIds = [];
				mailListMap.set(mailBag, mailIds);
			}
			mailIds.push(mailElementId);
		}
		const allMails = new Map();
		for (const [list, elements] of mailListMap) {
			const mails = await mailProvider(list, elements);
			for (const mail of mails) allMails.set(getElementId(mail), mail);
		}
		const loadedMails = [];
		for (const mailSetEntry of mailSetEntries) {
			const mail = allMails.get(elementIdPart(mailSetEntry.mail));
			if (!mail) continue;
			const labels = this.mailModel.getLabelsForMail(mail);
			loadedMails.push({
				mailSetEntry,
				mail,
				labels
			});
		}
		return loadedMails;
	}
	updateMailMap(mails) {
		for (const mail of mails) this.mailMap.set(getElementId(mail.mail), mail);
	}
	_updateSingleMail(mail) {
		this.updateMailMap([mail]);
		this.listModel.updateLoadedItem(mail);
	}
	_loadedMails() {
		return this.listModel.state.items;
	}
	defaultMailProvider = (listId, elements) => {
		return this.entityClient.loadMultiple(MailTypeRef, listId, elements);
	};
};

//#endregion
//#region src/mail-app/mail/view/MailViewModel.ts
const TAG = "MailVM";
var MailViewModel = class {
	_folder = null;
	/** id of the mail that was requested to be displayed, independent of the list state. */
	stickyMailId = null;
	/**
	* When the URL contains both folder id and mail id we will try to select that mail but we might need to load the list until we find it.
	* This is that mail id that we are loading.
	*/
	loadingTargetId = null;
	conversationViewModel = null;
	_filterType = null;
	/**
	* We remember the last URL used for each folder so if we switch between folders we can keep the selected mail.
	* There's a similar (but different) hacky mechanism where we store last URL but per each top-level view: navButtonRoutes. This one is per folder.
	*/
	mailFolderElementIdToSelectedMailId = new Map();
	listStreamSubscription = null;
	conversationPref = false;
	/** A slightly hacky marker to avoid concurrent URL updates. */
	currentShowTargetMarker = {};
	constructor(mailboxModel, mailModel, entityClient, eventController, connectivityModel, cacheStorage, conversationViewModelFactory, mailOpenedListener, conversationPrefProvider, inboxRuleHandler, router, updateUi) {
		this.mailboxModel = mailboxModel;
		this.mailModel = mailModel;
		this.entityClient = entityClient;
		this.eventController = eventController;
		this.connectivityModel = connectivityModel;
		this.cacheStorage = cacheStorage;
		this.conversationViewModelFactory = conversationViewModelFactory;
		this.mailOpenedListener = mailOpenedListener;
		this.conversationPrefProvider = conversationPrefProvider;
		this.inboxRuleHandler = inboxRuleHandler;
		this.router = router;
		this.updateUi = updateUi;
	}
	getSelectedMailSetKind() {
		return this._folder ? getMailSetKind(this._folder) : null;
	}
	get filterType() {
		return this._filterType;
	}
	setFilter(filter) {
		this._filterType = filter;
		this.listModel?.setFilter(getMailFilterForType(filter));
	}
	async showMailWithMailSetId(mailsetId, mailId) {
		const showMailMarker = {};
		this.currentShowTargetMarker = showMailMarker;
		if (mailsetId) {
			const mailset = await this.mailModel.getMailSetById(mailsetId);
			if (showMailMarker !== this.currentShowTargetMarker) return;
			if (mailset) return this.showMail(mailset, mailId);
		}
		return this.showMail(null, mailId);
	}
	async showStickyMail(fullMailId, onMissingExplicitMailTarget) {
		const [listId, elementId] = fullMailId;
		if (this.conversationViewModel && isSameId(this.conversationViewModel.primaryMail._id, elementId)) return;
		if (isSameId(this.stickyMailId, fullMailId)) return;
		console.log(TAG, "Loading sticky mail", listId, elementId);
		this.stickyMailId = fullMailId;
		await this.loadExplicitMailTarget(listId, elementId, onMissingExplicitMailTarget);
	}
	async resetOrInitializeList(stickyMailId) {
		if (this._folder != null) this.listModel?.selectNone();
else {
			const userInbox = await this.getFolderForUserInbox();
			if (this.didStickyMailChange(stickyMailId, "after loading user inbox ID")) return;
			this.setListId(userInbox);
		}
	}
	async showMail(folder, mailId) {
		if (folder != null && mailId != null && this.conversationViewModel && isSameId(elementIdPart(this.conversationViewModel.primaryMail._id), mailId)) return;
		if (folder != null && mailId != null && this._folder && this.loadingTargetId && isSameId(folder._id, this._folder._id) && isSameId(this.loadingTargetId, mailId)) return;
		console.log(TAG, "showMail", folder?._id, mailId);
		const loadingTargetId = mailId ?? null;
		this.loadingTargetId = loadingTargetId;
		this.stickyMailId = null;
		const folderToUse = await this.selectFolderToUse(folder ?? null);
		if (this.loadingTargetId !== loadingTargetId) return;
		this.setListId(folderToUse);
		if (loadingTargetId) {
			this.mailFolderElementIdToSelectedMailId = mapWith(this.mailFolderElementIdToSelectedMailId, getElementId(folderToUse), loadingTargetId);
			try {
				await this.loadAndSelectMail(folderToUse, loadingTargetId);
			} finally {
				this.loadingTargetId = null;
			}
		} else if (folder == null) this.updateUrl();
	}
	async selectFolderToUse(folderArgument) {
		if (folderArgument) {
			const mailboxDetail = await this.mailModel.getMailboxDetailsForMailFolder(folderArgument);
			if (mailboxDetail) return folderArgument;
else return await this.getFolderForUserInbox();
		} else return this._folder ?? await this.getFolderForUserInbox();
	}
	async loadExplicitMailTarget(listId, mailId, onMissingTargetEmail) {
		const expectedStickyMailId = [listId, mailId];
		const mailInList = this.listModel?.getMail(mailId);
		if (mailInList) {
			console.log(TAG, "opening mail from list", mailId);
			this.listModel?.onSingleSelection(mailInList);
			return;
		}
		const cached = await this.cacheStorage.get(MailTypeRef, listId, mailId);
		if (this.didStickyMailChange(expectedStickyMailId, "after loading cached")) return;
		if (cached) {
			console.log(TAG, "displaying cached mail", mailId);
			await this.displayExplicitMailTarget(cached);
		}
		let mail;
		try {
			mail = await this.entityClient.load(MailTypeRef, [listId, mailId], { cacheMode: CacheMode.WriteOnly });
		} catch (e) {
			if (isOfflineError(e)) return;
else if (e instanceof NotFoundError || e instanceof NotAuthorizedError) mail = null;
else throw e;
		}
		if (this.didStickyMailChange(expectedStickyMailId, "after loading from entity client")) return;
		let movedSetsSinceLastSync = false;
		if (mail != null && cached != null) {
			const currentFolderId = elementIdPart(assertNotNull(this._folder, "cached was displayed earlier, thus folder would have been set")._id);
			const cachedMailInFolder = cached.sets.some((id) => elementIdPart(id) === currentFolderId);
			movedSetsSinceLastSync = cachedMailInFolder && !mail.sets.some((id) => elementIdPart(id) === currentFolderId);
		}
		if (!movedSetsSinceLastSync && mail != null) {
			console.log(TAG, "opening mail from entity client", mailId);
			await this.displayExplicitMailTarget(mail);
		} else {
			if (mail != null) console.log(TAG, "Explicit mail target moved sets", listId, mailId);
else console.log(TAG, "Explicit mail target not found", listId, mailId);
			onMissingTargetEmail();
			this.stickyMailId = null;
			this.updateUrl();
		}
	}
	async displayExplicitMailTarget(mail) {
		await this.resetOrInitializeList(mail._id);
		this.createConversationViewModel({
			mail,
			showFolder: false
		});
		this.updateUi();
	}
	didStickyMailChange(expectedId, message) {
		const changed = !isSameId(this.stickyMailId, expectedId);
		if (changed) console.log(TAG, "target mail id changed", message, expectedId, this.stickyMailId);
		return changed;
	}
	async loadAndSelectMail(folder, mailId) {
		const foundMail = await this.listModel?.loadAndSelect(mailId, () => this.getFolder() !== folder || !this.listModel || this.loadingTargetId !== mailId || this.listModel.items.length > 0 && firstBiggerThanSecond(mailId, getElementId(lastThrow(this.listModel.items))));
		if (foundMail == null) console.log("did not find mail", folder, mailId);
	}
	async getFolderForUserInbox() {
		const mailboxDetail = await this.mailboxModel.getUserMailboxDetails();
		const folders = await this.mailModel.getMailboxFoldersForId(assertNotNull(mailboxDetail.mailbox.folders)._id);
		return assertSystemFolderOfType(folders, MailSetKind.INBOX);
	}
	init() {
		this.singInit();
		const conversationEnabled = this.conversationPrefProvider.getConversationViewShowOnlySelectedMail();
		if (this.conversationViewModel && this.conversationPref !== conversationEnabled) {
			const mail = this.conversationViewModel.primaryMail;
			this.createConversationViewModel({
				mail,
				showFolder: false,
				delayBodyRenderingUntil: Promise.resolve()
			});
			this.mailOpenedListener.onEmailOpened(mail);
		}
		this.conversationPref = conversationEnabled;
	}
	singInit = lazyMemoized(() => {
		this.eventController.addEntityListener((updates) => this.entityEventsReceived(updates));
	});
	get listModel() {
		return this._folder ? this.listModelForFolder(getElementId(this._folder)) : null;
	}
	getMailFolderToSelectedMail() {
		return this.mailFolderElementIdToSelectedMailId;
	}
	getFolder() {
		return this._folder;
	}
	getLabelsForMail(mail) {
		return this.listModel?.getLabelsForMail(mail) ?? [];
	}
	setListId(folder) {
		if (folder === this._folder) return;
		this.listModel?.cancelLoadAll();
		this._filterType = null;
		this._folder = folder;
		this.listStreamSubscription?.end(true);
		this.listStreamSubscription = this.listModel.stateStream.map((state) => this.onListStateChange(state));
		this.listModel.loadInitial().then(() => {
			if (this.listModel != null && this._folder === folder) this.fixCounterIfNeeded(folder, this.listModel.items);
		});
	}
	getConversationViewModel() {
		return this.conversationViewModel;
	}
	listModelForFolder = memoized((_folderId) => {
		const folder = assertNotNull(this._folder);
		return new MailListModel(folder, this.conversationPrefProvider, this.entityClient, this.mailModel, this.inboxRuleHandler, this.cacheStorage);
	});
	fixCounterIfNeeded = debounce(2e3, async (folder, itemsWhenCalled) => {
		const ourFolder = this.getFolder();
		if (ourFolder == null || this._filterType != null && this.filterType !== MailFilterType.Unread) return;
		if (!isSameId(getElementId(ourFolder), getElementId(folder)) || this.connectivityModel.wsConnection()() !== WsConnectionState.connected) return;
		if (this.listModel?.items !== itemsWhenCalled) {
			console.log(`list changed, trying again later`);
			return this.fixCounterIfNeeded(folder, this.listModel?.items ?? []);
		}
		const unreadMailsCount = count(this.listModel.items, (e) => e.unread);
		const counterValue = await this.mailModel.getCounterValue(folder);
		if (counterValue != null && counterValue !== unreadMailsCount) {
			console.log(`fixing up counter for folder ${folder._id}`);
			await this.mailModel.fixupCounterForFolder(folder, unreadMailsCount);
		} else console.log(`same counter, no fixup on folder ${folder._id}`);
	});
	onListStateChange(newState) {
		const displayedMailId = this.conversationViewModel?.primaryViewModel()?.mail._id;
		if (!(displayedMailId && isSameId(displayedMailId, this.stickyMailId))) {
			const targetItem = this.stickyMailId ? newState.items.find((item) => isSameId(this.stickyMailId, item._id)) : !newState.inMultiselect && newState.selectedItems.size === 1 ? first(this.listModel.getSelectedAsArray()) : null;
			if (targetItem != null) {
				this.mailFolderElementIdToSelectedMailId = mapWith(this.mailFolderElementIdToSelectedMailId, getElementId(assertNotNull(this.getFolder())), getElementId(targetItem));
				if (!this.conversationViewModel || !isSameId(this.conversationViewModel?.primaryMail._id, targetItem._id)) {
					this.createConversationViewModel({
						mail: targetItem,
						showFolder: false
					});
					this.mailOpenedListener.onEmailOpened(targetItem);
				}
			} else {
				this.conversationViewModel?.dispose();
				this.conversationViewModel = null;
				this.mailFolderElementIdToSelectedMailId = mapWithout(this.mailFolderElementIdToSelectedMailId, getElementId(assertNotNull(this.getFolder())));
			}
		}
		this.updateUrl();
		this.updateUi();
	}
	updateUrl() {
		const folder = this._folder;
		const folderId = folder ? getElementId(folder) : null;
		const mailId = this.loadingTargetId ?? (folderId ? this.getMailFolderToSelectedMail().get(folderId) : null);
		const stickyMail = this.stickyMailId;
		if (mailId != null) this.router.routeTo("/mail/:folderId/:mailId", this.addStickyMailParam({
			folderId,
			mailId,
			mail: stickyMail
		}));
else this.router.routeTo("/mail/:folderId", this.addStickyMailParam({ folderId: folderId ?? "" }));
	}
	addStickyMailParam(params) {
		if (this.stickyMailId) params.mail = this.stickyMailId.join(",");
		return params;
	}
	createConversationViewModel(viewModelParams) {
		this.conversationViewModel?.dispose();
		this.conversationViewModel = this.conversationViewModelFactory(viewModelParams);
	}
	async entityEventsReceived(updates) {
		const folder = this._folder;
		const listModel = this.listModel;
		if (!folder || !listModel) return;
		let importMailStateUpdates = [];
		for (const update of updates) {
			if (isUpdateForTypeRef(MailSetEntryTypeRef, update) && isSameId(folder.entries, update.instanceListId)) {
				if (update.operation === OperationType.DELETE && this.stickyMailId != null) {
					const { mailId } = deconstructMailSetEntryId(update.instanceId);
					if (isSameId(mailId, elementIdPart(this.stickyMailId))) this.stickyMailId = null;
				}
			} else if (isUpdateForTypeRef(ImportMailStateTypeRef, update) && (update.operation == OperationType.CREATE || update.operation == OperationType.UPDATE)) importMailStateUpdates.push(update);
			await listModel.handleEntityUpdate(update);
			await pMap(importMailStateUpdates, (update$1) => this.processImportedMails(update$1));
		}
	}
	async processImportedMails(update) {
		const importMailState = await this.entityClient.load(ImportMailStateTypeRef, [update.instanceListId, update.instanceId]);
		const importedFolder = await this.entityClient.load(MailFolderTypeRef, importMailState.targetFolder);
		const listModelOfImport = this.listModelForFolder(elementIdPart(importMailState.targetFolder));
		let status = parseInt(importMailState.status);
		if (status === ImportStatus.Finished || status === ImportStatus.Canceled) {
			let importedMailEntries = await this.entityClient.loadAll(ImportedMailTypeRef, importMailState.importedMails);
			if (isEmpty(importedMailEntries)) return Promise.resolve();
			let mailSetEntryIds = importedMailEntries.map((importedMail) => elementIdPart(importedMail.mailSetEntry));
			const mailSetEntryListId = listIdPart(importedMailEntries[0].mailSetEntry);
			const importedMailSetEntries = await this.entityClient.loadMultiple(MailSetEntryTypeRef, mailSetEntryListId, mailSetEntryIds);
			if (isEmpty(importedMailSetEntries)) return Promise.resolve();
			await this.preloadMails(importedMailSetEntries);
			await pMap(importedMailSetEntries, (importedMailSetEntry) => {
				return listModelOfImport.handleEntityUpdate({
					instanceId: elementIdPart(importedMailSetEntry._id),
					instanceListId: importedFolder.entries,
					operation: OperationType.CREATE,
					type: MailSetEntryTypeRef.type,
					application: MailSetEntryTypeRef.app
				});
			});
		}
	}
	async preloadMails(importedMailSetEntries) {
		const mailIds = importedMailSetEntries.map((mse) => mse.mail);
		const mailsByList = groupBy(mailIds, (m) => listIdPart(m));
		for (const [listId, mailIds$1] of mailsByList.entries()) {
			const mailElementIds = mailIds$1.map((m) => elementIdPart(m));
			await this.entityClient.loadMultiple(MailTypeRef, listId, mailElementIds);
		}
	}
	async switchToFolder(folderType) {
		const state = {};
		this.currentShowTargetMarker = state;
		const mailboxDetail = assertNotNull(await this.getMailboxDetails());
		if (this.currentShowTargetMarker !== state) return;
		if (mailboxDetail == null || mailboxDetail.mailbox.folders == null) return;
		const folders = await this.mailModel.getMailboxFoldersForId(mailboxDetail.mailbox.folders._id);
		if (this.currentShowTargetMarker !== state) return;
		const folder = assertSystemFolderOfType(folders, folderType);
		await this.showMail(folder, this.mailFolderElementIdToSelectedMailId.get(getElementId(folder)));
	}
	async getMailboxDetails() {
		const folder = this.getFolder();
		return await this.mailboxDetailForListWithFallback(folder);
	}
	async showingDraftsFolder() {
		if (!this._folder) return false;
		const mailboxDetail = await this.mailModel.getMailboxDetailsForMailFolder(this._folder);
		const selectedFolder = this.getFolder();
		if (selectedFolder && mailboxDetail && mailboxDetail.mailbox.folders) {
			const folders = await this.mailModel.getMailboxFoldersForId(mailboxDetail.mailbox.folders._id);
			return isOfTypeOrSubfolderOf(folders, selectedFolder, MailSetKind.DRAFT);
		} else return false;
	}
	async showingTrashOrSpamFolder() {
		const folder = this.getFolder();
		if (folder) {
			const mailboxDetail = await this.mailModel.getMailboxDetailsForMailFolder(folder);
			if (folder && mailboxDetail && mailboxDetail.mailbox.folders) {
				const folders = await this.mailModel.getMailboxFoldersForId(mailboxDetail.mailbox.folders._id);
				return isSpamOrTrashFolder(folders, folder);
			}
		}
		return false;
	}
	async mailboxDetailForListWithFallback(folder) {
		const mailboxDetailForListId = folder ? await this.mailModel.getMailboxDetailsForMailFolder(folder) : null;
		return mailboxDetailForListId ?? await this.mailboxModel.getUserMailboxDetails();
	}
	async finallyDeleteAllMailsInSelectedFolder(folder) {
		this.listModel?.selectNone();
		const mailboxDetail = await this.getMailboxDetails();
		if (folder.folderType === MailSetKind.TRASH || folder.folderType === MailSetKind.SPAM) return this.mailModel.clearFolder(folder).catch(ofClass(PreconditionFailedError, () => {
			throw new UserError("operationStillActive_msg");
		}));
else {
			const folders = await this.mailModel.getMailboxFoldersForId(assertNotNull(mailboxDetail.mailbox.folders)._id);
			if (isSubfolderOfType(folders, folder, MailSetKind.TRASH) || isSubfolderOfType(folders, folder, MailSetKind.SPAM)) return this.mailModel.finallyDeleteCustomMailFolder(folder).catch(ofClass(PreconditionFailedError, () => {
				throw new UserError("operationStillActive_msg");
			}));
else throw new ProgrammingError(`Cannot delete mails in folder ${String(folder._id)} with type ${folder.folderType}`);
		}
	}
	onSingleSelection(mail) {
		this.stickyMailId = null;
		this.loadingTargetId = null;
		this.listModel?.onSingleSelection(mail);
	}
	areAllSelected() {
		return this.listModel?.areAllSelected() ?? false;
	}
	selectNone() {
		this.stickyMailId = null;
		this.loadingTargetId = null;
		this.listModel?.selectNone();
	}
	selectAll() {
		this.stickyMailId = null;
		this.loadingTargetId = null;
		this.listModel?.selectAll();
	}
	onSingleInclusiveSelection(mail, clearSelectionOnMultiSelectStart) {
		this.stickyMailId = null;
		this.loadingTargetId = null;
		this.listModel?.onSingleInclusiveSelection(mail, clearSelectionOnMultiSelectStart);
	}
	onRangeSelectionTowards(mail) {
		this.stickyMailId = null;
		this.loadingTargetId = null;
		this.listModel?.selectRangeTowards(mail);
	}
	selectPrevious(multiselect) {
		this.stickyMailId = null;
		this.loadingTargetId = null;
		this.listModel?.selectPrevious(multiselect);
	}
	selectNext(multiselect) {
		this.stickyMailId = null;
		this.loadingTargetId = null;
		this.listModel?.selectNext(multiselect);
	}
	onSingleExclusiveSelection(mail) {
		this.stickyMailId = null;
		this.loadingTargetId = null;
		this.listModel?.onSingleExclusiveSelection(mail);
	}
	async createLabel(mailbox, labelData) {
		await this.mailModel.createLabel(assertNotNull(mailbox._ownerGroup), labelData);
	}
	async editLabel(label, newData) {
		await this.mailModel.updateLabel(label, newData);
	}
	async deleteLabel(label) {
		await this.mailModel.deleteLabel(label);
	}
};

//#endregion
export { MailViewModel };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFpbFZpZXdNb2RlbC1jaHVuay5qcyIsIm5hbWVzIjpbIm1haWxTZXQ6IE1haWxGb2xkZXIiLCJjb252ZXJzYXRpb25QcmVmUHJvdmlkZXI6IENvbnZlcnNhdGlvblByZWZQcm92aWRlciIsImVudGl0eUNsaWVudDogRW50aXR5Q2xpZW50IiwibWFpbE1vZGVsOiBNYWlsTW9kZWwiLCJpbmJveFJ1bGVIYW5kbGVyOiBJbmJveFJ1bGVIYW5kbGVyIiwiY2FjaGVTdG9yYWdlOiBFeHBvc2VkQ2FjaGVTdG9yYWdlIiwiY291bnQiLCJzZWxlY3RlZEl0ZW1zOiBTZXQ8TWFpbD4iLCJuZXdTdGF0ZTogTGlzdFN0YXRlPE1haWw+IiwibWFpbElkOiBJZCIsIm1haWxFbGVtZW50SWQ6IElkIiwibWFpbDogTWFpbCIsIm1haWxTZXRFbnRyeUlkOiBJZCIsInNob3VsZFN0b3A6ICgpID0+IGJvb2xlYW4iLCJsb2FkZWRNYWlsOiBMb2FkZWRNYWlsIiwidXBkYXRlOiBFbnRpdHlVcGRhdGVEYXRhIiwibWFpbFNldElkOiBJZFR1cGxlIiwiY2xlYXJTZWxlY3Rpb25Pbk11bHRpU2VsZWN0U3RhcnQ/OiBib29sZWFuIiwibXVsdGlzZWxlY3Q6IGJvb2xlYW4iLCJmaWx0ZXI6IExpc3RGaWx0ZXI8TWFpbD4gfCBudWxsIiwic3RhcnRpbmdJZDogSWRUdXBsZSIsImNvdW50OiBudW1iZXIiLCJpdGVtczogTG9hZGVkTWFpbFtdIiwic3RhcnRJZDogSWRUdXBsZSIsImVudHJpZXM6IExvYWRlZE1haWxbXSIsImlkOiBJZFR1cGxlIiwibWFpbFNldEVudHJpZXM6IE1haWxTZXRFbnRyeVtdIiwibWFpbFByb3ZpZGVyOiAobGlzdElkOiBJZCwgZWxlbWVudElkczogSWRbXSkgPT4gUHJvbWlzZTxNYWlsW10+IiwibWFpbExpc3RNYXA6IE1hcDxJZCwgSWRbXT4iLCJhbGxNYWlsczogTWFwPElkLCBNYWlsPiIsImxvYWRlZE1haWxzOiBMb2FkZWRNYWlsW10iLCJsYWJlbHM6IE1haWxGb2xkZXJbXSIsIm1haWxzOiBMb2FkZWRNYWlsW10iLCJtYWlsOiBMb2FkZWRNYWlsIiwibGlzdElkOiBJZCIsImVsZW1lbnRzOiBJZFtdIiwibWFpbGJveE1vZGVsOiBNYWlsYm94TW9kZWwiLCJtYWlsTW9kZWw6IE1haWxNb2RlbCIsImVudGl0eUNsaWVudDogRW50aXR5Q2xpZW50IiwiZXZlbnRDb250cm9sbGVyOiBFdmVudENvbnRyb2xsZXIiLCJjb25uZWN0aXZpdHlNb2RlbDogV2Vic29ja2V0Q29ubmVjdGl2aXR5TW9kZWwiLCJjYWNoZVN0b3JhZ2U6IEV4cG9zZWRDYWNoZVN0b3JhZ2UiLCJjb252ZXJzYXRpb25WaWV3TW9kZWxGYWN0b3J5OiBDb252ZXJzYXRpb25WaWV3TW9kZWxGYWN0b3J5IiwibWFpbE9wZW5lZExpc3RlbmVyOiBNYWlsT3BlbmVkTGlzdGVuZXIiLCJjb252ZXJzYXRpb25QcmVmUHJvdmlkZXI6IENvbnZlcnNhdGlvblByZWZQcm92aWRlciIsImluYm94UnVsZUhhbmRsZXI6IEluYm94UnVsZUhhbmRsZXIiLCJyb3V0ZXI6IFJvdXRlciIsInVwZGF0ZVVpOiAoKSA9PiB1bmtub3duIiwiZmlsdGVyOiBNYWlsRmlsdGVyVHlwZSB8IG51bGwiLCJtYWlsc2V0SWQ/OiBJZCIsIm1haWxJZD86IElkIiwiZnVsbE1haWxJZDogSWRUdXBsZSIsIm9uTWlzc2luZ0V4cGxpY2l0TWFpbFRhcmdldDogKCkgPT4gdW5rbm93biIsInN0aWNreU1haWxJZDogSWRUdXBsZSIsImZvbGRlcj86IE1haWxGb2xkZXIgfCBudWxsIiwiZm9sZGVyQXJndW1lbnQ6IE1haWxGb2xkZXIgfCBudWxsIiwibGlzdElkOiBJZCIsIm1haWxJZDogSWQiLCJvbk1pc3NpbmdUYXJnZXRFbWFpbDogKCkgPT4gdW5rbm93biIsImV4cGVjdGVkU3RpY2t5TWFpbElkOiBJZFR1cGxlIiwibWFpbDogTWFpbCB8IG51bGwiLCJtYWlsOiBNYWlsIiwiZXhwZWN0ZWRJZDogSWRUdXBsZSIsIm1lc3NhZ2U6IHN0cmluZyIsImZvbGRlcjogTWFpbEZvbGRlciIsIl9mb2xkZXJJZDogSWQiLCJpdGVtc1doZW5DYWxsZWQ6IFJlYWRvbmx5QXJyYXk8TWFpbD4iLCJuZXdTdGF0ZTogTGlzdFN0YXRlPE1haWw+IiwicGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiIsInZpZXdNb2RlbFBhcmFtczogQ3JlYXRlTWFpbFZpZXdlck9wdGlvbnMiLCJ1cGRhdGVzOiBSZWFkb25seUFycmF5PEVudGl0eVVwZGF0ZURhdGE+IiwiaW1wb3J0TWFpbFN0YXRlVXBkYXRlczogQXJyYXk8RW50aXR5VXBkYXRlRGF0YT4iLCJ1cGRhdGUiLCJ1cGRhdGU6IEVudGl0eVVwZGF0ZURhdGEiLCJpbXBvcnRlZE1haWxTZXRFbnRyaWVzOiBNYWlsU2V0RW50cnlbXSIsIm1haWxJZHMiLCJmb2xkZXJUeXBlOiBPbWl0PE1haWxTZXRLaW5kLCBNYWlsU2V0S2luZC5DVVNUT00+IiwiY2xlYXJTZWxlY3Rpb25Pbk11bHRpU2VsZWN0U3RhcnQ/OiBib29sZWFuIiwibXVsdGlzZWxlY3Q6IGJvb2xlYW4iLCJtYWlsYm94OiBNYWlsQm94IiwibGFiZWxEYXRhOiB7IG5hbWU6IHN0cmluZzsgY29sb3I6IHN0cmluZyB9IiwibGFiZWw6IE1haWxGb2xkZXIiLCJuZXdEYXRhOiB7IG5hbWU6IHN0cmluZzsgY29sb3I6IHN0cmluZyB9Il0sInNvdXJjZXMiOlsiLi4vc3JjL21haWwtYXBwL21haWwvbW9kZWwvTWFpbExpc3RNb2RlbC50cyIsIi4uL3NyYy9tYWlsLWFwcC9tYWlsL3ZpZXcvTWFpbFZpZXdNb2RlbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBMaXN0RmlsdGVyLCBMaXN0TW9kZWwgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21pc2MvTGlzdE1vZGVsXCJcbmltcG9ydCB7IE1haWwsIE1haWxGb2xkZXIsIE1haWxGb2xkZXJUeXBlUmVmLCBNYWlsU2V0RW50cnksIE1haWxTZXRFbnRyeVR5cGVSZWYsIE1haWxUeXBlUmVmIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvZW50aXRpZXMvdHV0YW5vdGEvVHlwZVJlZnNcIlxuaW1wb3J0IHtcblx0Q1VTVE9NX01BWF9JRCxcblx0Y3VzdG9tSWRUb1VpbnQ4YXJyYXksXG5cdGRlY29uc3RydWN0TWFpbFNldEVudHJ5SWQsXG5cdGVsZW1lbnRJZFBhcnQsXG5cdGdldEVsZW1lbnRJZCxcblx0aXNTYW1lSWQsXG5cdGxpc3RJZFBhcnQsXG59IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi91dGlscy9FbnRpdHlVdGlsc1wiXG5pbXBvcnQgeyBFbnRpdHlDbGllbnQgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vRW50aXR5Q2xpZW50XCJcbmltcG9ydCB7IENvbnZlcnNhdGlvblByZWZQcm92aWRlciB9IGZyb20gXCIuLi92aWV3L0NvbnZlcnNhdGlvblZpZXdNb2RlbFwiXG5pbXBvcnQgeyBhc3NlcnRNYWluT3JOb2RlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL0VudlwiXG5pbXBvcnQgeyBhc3NlcnROb3ROdWxsLCBjb21wYXJlLCBwcm9taXNlRmlsdGVyIH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5pbXBvcnQgeyBMaXN0TG9hZGluZ1N0YXRlLCBMaXN0U3RhdGUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0xpc3RcIlxuaW1wb3J0IFN0cmVhbSBmcm9tIFwibWl0aHJpbC9zdHJlYW1cIlxuaW1wb3J0IHsgRW50aXR5VXBkYXRlRGF0YSwgaXNVcGRhdGVGb3JUeXBlUmVmIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL3V0aWxzL0VudGl0eVVwZGF0ZVV0aWxzXCJcbmltcG9ydCB7IE1haWxTZXRLaW5kLCBPcGVyYXRpb25UeXBlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL1R1dGFub3RhQ29uc3RhbnRzXCJcbmltcG9ydCB7IEluYm94UnVsZUhhbmRsZXIgfSBmcm9tIFwiLi9JbmJveFJ1bGVIYW5kbGVyXCJcbmltcG9ydCB7IE1haWxNb2RlbCB9IGZyb20gXCIuL01haWxNb2RlbFwiXG5pbXBvcnQgeyBMaXN0RmV0Y2hSZXN1bHQgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0xpc3RVdGlsc1wiXG5pbXBvcnQgeyBpc09mZmxpbmVFcnJvciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi91dGlscy9FcnJvclV0aWxzXCJcbmltcG9ydCB7IEV4cG9zZWRDYWNoZVN0b3JhZ2UgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS93b3JrZXIvcmVzdC9EZWZhdWx0RW50aXR5UmVzdENhY2hlXCJcblxuYXNzZXJ0TWFpbk9yTm9kZSgpXG5cbi8qKlxuICogSW50ZXJuYWwgcmVwcmVzZW50YXRpb24gb2YgYSBsb2FkZWQgbWFpbFxuICpcbiAqIEBWaXNpYmxlRm9yVGVzdGluZ1xuICovXG5leHBvcnQgaW50ZXJmYWNlIExvYWRlZE1haWwge1xuXHRyZWFkb25seSBtYWlsOiBNYWlsXG5cdHJlYWRvbmx5IG1haWxTZXRFbnRyeTogTWFpbFNldEVudHJ5XG5cdHJlYWRvbmx5IGxhYmVsczogUmVhZG9ubHlBcnJheTxNYWlsRm9sZGVyPlxufVxuXG4vKipcbiAqIEhhbmRsZXMgZmV0Y2hpbmcgYW5kIHJlc29sdmluZyBtYWlsIHNldCBlbnRyaWVzIGludG8gbWFpbHMgYXMgd2VsbCBhcyBoYW5kbGluZyBzb3J0aW5nLlxuICovXG5leHBvcnQgY2xhc3MgTWFpbExpc3RNb2RlbCB7XG5cdC8vIElkID0gTWFpbFNldEVudHJ5IGVsZW1lbnQgaWRcblx0cHJpdmF0ZSByZWFkb25seSBsaXN0TW9kZWw6IExpc3RNb2RlbDxMb2FkZWRNYWlsLCBJZD5cblxuXHQvLyBrZWVwIGEgcmV2ZXJzZSBtYXAgZm9yIGdvaW5nIGZyb20gTWFpbCBlbGVtZW50IGlkIC0+IExvYWRlZE1haWxcblx0cHJpdmF0ZSByZWFkb25seSBtYWlsTWFwOiBNYXA8SWQsIExvYWRlZE1haWw+ID0gbmV3IE1hcCgpXG5cblx0Y29uc3RydWN0b3IoXG5cdFx0cHJpdmF0ZSByZWFkb25seSBtYWlsU2V0OiBNYWlsRm9sZGVyLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgY29udmVyc2F0aW9uUHJlZlByb3ZpZGVyOiBDb252ZXJzYXRpb25QcmVmUHJvdmlkZXIsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBlbnRpdHlDbGllbnQ6IEVudGl0eUNsaWVudCxcblx0XHRwcml2YXRlIHJlYWRvbmx5IG1haWxNb2RlbDogTWFpbE1vZGVsLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgaW5ib3hSdWxlSGFuZGxlcjogSW5ib3hSdWxlSGFuZGxlcixcblx0XHRwcml2YXRlIHJlYWRvbmx5IGNhY2hlU3RvcmFnZTogRXhwb3NlZENhY2hlU3RvcmFnZSxcblx0KSB7XG5cdFx0dGhpcy5saXN0TW9kZWwgPSBuZXcgTGlzdE1vZGVsKHtcblx0XHRcdGZldGNoOiAobGFzdEZldGNoZWRJdGVtLCBjb3VudCkgPT4ge1xuXHRcdFx0XHRjb25zdCBsYXN0RmV0Y2hlZElkID0gbGFzdEZldGNoZWRJdGVtPy5tYWlsU2V0RW50cnk/Ll9pZCA/PyBbbWFpbFNldC5lbnRyaWVzLCBDVVNUT01fTUFYX0lEXVxuXHRcdFx0XHRyZXR1cm4gdGhpcy5sb2FkTWFpbHMobGFzdEZldGNoZWRJZCwgY291bnQpXG5cdFx0XHR9LFxuXG5cdFx0XHRzb3J0Q29tcGFyZTogKGl0ZW0xLCBpdGVtMikgPT4ge1xuXHRcdFx0XHQvLyBNYWlsIHNldCBlbnRyeSBJRCBoYXMgdGhlIHRpbWVzdGFtcCBhbmQgbWFpbCBlbGVtZW50IElEXG5cdFx0XHRcdGNvbnN0IGl0ZW0xSWQgPSBnZXRFbGVtZW50SWQoaXRlbTEubWFpbFNldEVudHJ5KVxuXHRcdFx0XHRjb25zdCBpdGVtMklkID0gZ2V0RWxlbWVudElkKGl0ZW0yLm1haWxTZXRFbnRyeSlcblxuXHRcdFx0XHQvLyBTb3J0IGluIHJldmVyc2Ugb3JkZXIgdG8gZW5zdXJlIG5ld2VyIG1haWxzIGFyZSBmaXJzdFxuXHRcdFx0XHRyZXR1cm4gY29tcGFyZShjdXN0b21JZFRvVWludDhhcnJheShpdGVtMklkKSwgY3VzdG9tSWRUb1VpbnQ4YXJyYXkoaXRlbTFJZCkpXG5cdFx0XHR9LFxuXG5cdFx0XHRnZXRJdGVtSWQ6IChpdGVtKSA9PiBnZXRFbGVtZW50SWQoaXRlbS5tYWlsU2V0RW50cnkpLFxuXG5cdFx0XHRpc1NhbWVJZDogKGlkMSwgaWQyKSA9PiBpZDEgPT09IGlkMixcblxuXHRcdFx0YXV0b1NlbGVjdEJlaGF2aW9yOiAoKSA9PiB0aGlzLmNvbnZlcnNhdGlvblByZWZQcm92aWRlci5nZXRNYWlsQXV0b1NlbGVjdEJlaGF2aW9yKCksXG5cdFx0fSlcblx0fVxuXG5cdGdldCBpdGVtcygpOiBNYWlsW10ge1xuXHRcdHJldHVybiB0aGlzLl9sb2FkZWRNYWlscygpLm1hcCgobWFpbCkgPT4gbWFpbC5tYWlsKVxuXHR9XG5cblx0Z2V0IGxvYWRpbmdTdGF0dXMoKTogTGlzdExvYWRpbmdTdGF0ZSB7XG5cdFx0cmV0dXJuIHRoaXMubGlzdE1vZGVsLnN0YXRlLmxvYWRpbmdTdGF0dXNcblx0fVxuXG5cdGdldCBzdGF0ZVN0cmVhbSgpOiBTdHJlYW08TGlzdFN0YXRlPE1haWw+PiB7XG5cdFx0cmV0dXJuIHRoaXMubGlzdE1vZGVsLnN0YXRlU3RyZWFtLm1hcCgoc3RhdGUpID0+IHtcblx0XHRcdGNvbnN0IGl0ZW1zID0gc3RhdGUuaXRlbXMubWFwKChpdGVtKSA9PiBpdGVtLm1haWwpXG5cdFx0XHRjb25zdCBzZWxlY3RlZEl0ZW1zOiBTZXQ8TWFpbD4gPSBuZXcgU2V0KClcblx0XHRcdGZvciAoY29uc3QgaXRlbSBvZiBzdGF0ZS5zZWxlY3RlZEl0ZW1zKSB7XG5cdFx0XHRcdHNlbGVjdGVkSXRlbXMuYWRkKGl0ZW0ubWFpbClcblx0XHRcdH1cblx0XHRcdGNvbnN0IG5ld1N0YXRlOiBMaXN0U3RhdGU8TWFpbD4gPSB7XG5cdFx0XHRcdC4uLnN0YXRlLFxuXHRcdFx0XHRpdGVtcyxcblx0XHRcdFx0c2VsZWN0ZWRJdGVtcyxcblx0XHRcdH1cblx0XHRcdHJldHVybiBuZXdTdGF0ZVxuXHRcdH0pXG5cdH1cblxuXHRpc0xvYWRpbmdBbGwoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMubGlzdE1vZGVsLnN0YXRlLmxvYWRpbmdBbGxcblx0fVxuXG5cdGlzSXRlbVNlbGVjdGVkKG1haWxJZDogSWQpOiBib29sZWFuIHtcblx0XHRjb25zdCBsb2FkZWRNYWlsID0gdGhpcy5tYWlsTWFwLmdldChtYWlsSWQpXG5cdFx0aWYgKGxvYWRlZE1haWwgPT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLmxpc3RNb2RlbC5pc0l0ZW1TZWxlY3RlZChnZXRFbGVtZW50SWQobG9hZGVkTWFpbC5tYWlsU2V0RW50cnkpKVxuXHR9XG5cblx0Z2V0TWFpbChtYWlsRWxlbWVudElkOiBJZCk6IE1haWwgfCBudWxsIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRMb2FkZWRNYWlsQnlNYWlsSWQobWFpbEVsZW1lbnRJZCk/Lm1haWwgPz8gbnVsbFxuXHR9XG5cblx0Z2V0TGFiZWxzRm9yTWFpbChtYWlsOiBNYWlsKTogUmVhZG9ubHlBcnJheTxNYWlsRm9sZGVyPiB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0TG9hZGVkTWFpbEJ5TWFpbEluc3RhbmNlKG1haWwpPy5sYWJlbHMgPz8gW11cblx0fVxuXG5cdGdldE1haWxTZXRFbnRyeShtYWlsU2V0RW50cnlJZDogSWQpOiBNYWlsU2V0RW50cnkgfCBudWxsIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRMb2FkZWRNYWlsQnlNYWlsU2V0SWQobWFpbFNldEVudHJ5SWQpPy5tYWlsU2V0RW50cnkgPz8gbnVsbFxuXHR9XG5cblx0YXN5bmMgbG9hZEFuZFNlbGVjdChtYWlsSWQ6IElkLCBzaG91bGRTdG9wOiAoKSA9PiBib29sZWFuKTogUHJvbWlzZTxNYWlsIHwgbnVsbD4ge1xuXHRcdGNvbnN0IG1haWxGaW5kZXIgPSAobG9hZGVkTWFpbDogTG9hZGVkTWFpbCkgPT4gaXNTYW1lSWQoZ2V0RWxlbWVudElkKGxvYWRlZE1haWwubWFpbCksIG1haWxJZClcblx0XHRjb25zdCBtYWlsID0gYXdhaXQgdGhpcy5saXN0TW9kZWwubG9hZEFuZFNlbGVjdChtYWlsRmluZGVyLCBzaG91bGRTdG9wKVxuXHRcdHJldHVybiBtYWlsPy5tYWlsID8/IG51bGxcblx0fVxuXG5cdG9uU2luZ2xlU2VsZWN0aW9uKG1haWw6IE1haWwpIHtcblx0XHR0aGlzLmxpc3RNb2RlbC5vblNpbmdsZVNlbGVjdGlvbihhc3NlcnROb3ROdWxsKHRoaXMuZ2V0TG9hZGVkTWFpbEJ5TWFpbEluc3RhbmNlKG1haWwpKSlcblx0fVxuXG5cdHNlbGVjdE5vbmUoKSB7XG5cdFx0dGhpcy5saXN0TW9kZWwuc2VsZWN0Tm9uZSgpXG5cdH1cblxuXHRjYW5jZWxMb2FkQWxsKCkge1xuXHRcdHRoaXMubGlzdE1vZGVsLmNhbmNlbExvYWRBbGwoKVxuXHR9XG5cblx0YXN5bmMgbG9hZEluaXRpYWwoKSB7XG5cdFx0YXdhaXQgdGhpcy5saXN0TW9kZWwubG9hZEluaXRpYWwoKVxuXHR9XG5cblx0Z2V0U2VsZWN0ZWRBc0FycmF5KCk6IEFycmF5PE1haWw+IHtcblx0XHRyZXR1cm4gdGhpcy5saXN0TW9kZWwuZ2V0U2VsZWN0ZWRBc0FycmF5KCkubWFwKCh7IG1haWwgfSkgPT4gbWFpbClcblx0fVxuXG5cdGFzeW5jIGhhbmRsZUVudGl0eVVwZGF0ZSh1cGRhdGU6IEVudGl0eVVwZGF0ZURhdGEpIHtcblx0XHRpZiAoaXNVcGRhdGVGb3JUeXBlUmVmKE1haWxGb2xkZXJUeXBlUmVmLCB1cGRhdGUpKSB7XG5cdFx0XHQvLyBJZiBhIGxhYmVsIGlzIG1vZGlmaWVkLCB3ZSB3YW50IHRvIHVwZGF0ZSBhbGwgbWFpbHMgdGhhdCByZWZlcmVuY2UgaXQsIHdoaWNoIHJlcXVpcmVzIGxpbmVhcmx5IGl0ZXJhdGluZ1xuXHRcdFx0Ly8gdGhyb3VnaCBhbGwgbWFpbHMuIFRoZXJlIGFyZSBtb3JlIGVmZmljaWVudCB3YXlzIHdlIGNvdWxkIGRvIHRoaXMsIHN1Y2ggYXMgYnkga2VlcGluZyB0cmFjayBvZiBlYWNoIGxhYmVsXG5cdFx0XHQvLyB3ZSd2ZSByZXRyaWV2ZWQgZnJvbSB0aGUgZGF0YWJhc2UgYW5kIGp1c3QgdXBkYXRlIHRoYXQsIGJ1dCB3ZSB3YW50IHRvIGF2b2lkIGFkZGluZyBtb3JlIG1hcHMgdGhhdCB3ZVxuXHRcdFx0Ly8gaGF2ZSB0byBtYWludGFpbi5cblx0XHRcdGlmICh1cGRhdGUub3BlcmF0aW9uID09PSBPcGVyYXRpb25UeXBlLlVQREFURSkge1xuXHRcdFx0XHRjb25zdCBtYWlsU2V0SWQ6IElkVHVwbGUgPSBbdXBkYXRlLmluc3RhbmNlTGlzdElkLCB1cGRhdGUuaW5zdGFuY2VJZF1cblx0XHRcdFx0Zm9yIChjb25zdCBsb2FkZWRNYWlsIG9mIHRoaXMubWFpbE1hcC52YWx1ZXMoKSkge1xuXHRcdFx0XHRcdGNvbnN0IGhhc01haWxTZXQgPSBsb2FkZWRNYWlsLmxhYmVscy5zb21lKChsYWJlbCkgPT4gaXNTYW1lSWQobWFpbFNldElkLCBsYWJlbC5faWQpKVxuXHRcdFx0XHRcdGlmICghaGFzTWFpbFNldCkge1xuXHRcdFx0XHRcdFx0Y29udGludWVcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gTWFpbE1vZGVsJ3MgZW50aXR5IGV2ZW50IGxpc3RlbmVyIHNob3VsZCBoYXZlIGJlZW4gZmlyZWQgZmlyc3Rcblx0XHRcdFx0XHRjb25zdCBsYWJlbHMgPSB0aGlzLm1haWxNb2RlbC5nZXRMYWJlbHNGb3JNYWlsKGxvYWRlZE1haWwubWFpbClcblx0XHRcdFx0XHRjb25zdCBuZXdNYWlsRW50cnkgPSB7XG5cdFx0XHRcdFx0XHQuLi5sb2FkZWRNYWlsLFxuXHRcdFx0XHRcdFx0bGFiZWxzLFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0aGlzLl91cGRhdGVTaW5nbGVNYWlsKG5ld01haWxFbnRyeSlcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoaXNVcGRhdGVGb3JUeXBlUmVmKE1haWxTZXRFbnRyeVR5cGVSZWYsIHVwZGF0ZSkgJiYgaXNTYW1lSWQodGhpcy5tYWlsU2V0LmVudHJpZXMsIHVwZGF0ZS5pbnN0YW5jZUxpc3RJZCkpIHtcblx0XHRcdC8vIEFkZGluZy9yZW1vdmluZyB0byB0aGlzIGxpc3QgKE1haWxTZXRFbnRyeSBkb2Vzbid0IGhhdmUgYW55IGZpZWxkcyB0byB1cGRhdGUsIHNvIHdlIGRvbid0IG5lZWQgdG8gaGFuZGxlIHRoaXMpXG5cdFx0XHRpZiAodXBkYXRlLm9wZXJhdGlvbiA9PT0gT3BlcmF0aW9uVHlwZS5ERUxFVEUpIHtcblx0XHRcdFx0Y29uc3QgbWFpbCA9IHRoaXMuZ2V0TG9hZGVkTWFpbEJ5TWFpbFNldElkKHVwZGF0ZS5pbnN0YW5jZUlkKVxuXHRcdFx0XHRpZiAobWFpbCkge1xuXHRcdFx0XHRcdHRoaXMubWFpbE1hcC5kZWxldGUoZ2V0RWxlbWVudElkKG1haWwubWFpbCkpXG5cdFx0XHRcdH1cblx0XHRcdFx0YXdhaXQgdGhpcy5saXN0TW9kZWwuZGVsZXRlTG9hZGVkSXRlbSh1cGRhdGUuaW5zdGFuY2VJZClcblx0XHRcdH0gZWxzZSBpZiAodXBkYXRlLm9wZXJhdGlvbiA9PT0gT3BlcmF0aW9uVHlwZS5DUkVBVEUpIHtcblx0XHRcdFx0Y29uc3QgbG9hZGVkTWFpbCA9IGF3YWl0IHRoaXMubG9hZFNpbmdsZU1haWwoW3VwZGF0ZS5pbnN0YW5jZUxpc3RJZCwgdXBkYXRlLmluc3RhbmNlSWRdKVxuXHRcdFx0XHRhd2FpdCB0aGlzLmxpc3RNb2RlbC53YWl0TG9hZChhc3luYyAoKSA9PiB7XG5cdFx0XHRcdFx0aWYgKHRoaXMubGlzdE1vZGVsLmNhbkluc2VydEl0ZW0obG9hZGVkTWFpbCkpIHtcblx0XHRcdFx0XHRcdHRoaXMubGlzdE1vZGVsLmluc2VydExvYWRlZEl0ZW0obG9hZGVkTWFpbClcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChpc1VwZGF0ZUZvclR5cGVSZWYoTWFpbFR5cGVSZWYsIHVwZGF0ZSkpIHtcblx0XHRcdC8vIFdlIG9ubHkgbmVlZCB0byBoYW5kbGUgdXBkYXRlcyBmb3IgTWFpbC5cblx0XHRcdC8vIE1haWwgZGVsZXRpb24gd2lsbCBhbHNvIGJlIGhhbmRsZWQgaW4gTWFpbFNldEVudHJ5IGRlbGV0ZS9jcmVhdGUuXG5cdFx0XHRjb25zdCBtYWlsSXRlbSA9IHRoaXMubWFpbE1hcC5nZXQodXBkYXRlLmluc3RhbmNlSWQpXG5cdFx0XHRpZiAobWFpbEl0ZW0gIT0gbnVsbCAmJiB1cGRhdGUub3BlcmF0aW9uID09PSBPcGVyYXRpb25UeXBlLlVQREFURSkge1xuXHRcdFx0XHRjb25zdCBuZXdNYWlsRGF0YSA9IGF3YWl0IHRoaXMuZW50aXR5Q2xpZW50LmxvYWQoTWFpbFR5cGVSZWYsIFt1cGRhdGUuaW5zdGFuY2VMaXN0SWQsIHVwZGF0ZS5pbnN0YW5jZUlkXSlcblx0XHRcdFx0Y29uc3QgbGFiZWxzID0gdGhpcy5tYWlsTW9kZWwuZ2V0TGFiZWxzRm9yTWFpbChuZXdNYWlsRGF0YSkgLy8gaW4gY2FzZSBsYWJlbHMgd2VyZSBhZGRlZC9yZW1vdmVkXG5cdFx0XHRcdGNvbnN0IG5ld01haWxJdGVtID0ge1xuXHRcdFx0XHRcdC4uLm1haWxJdGVtLFxuXHRcdFx0XHRcdGxhYmVscyxcblx0XHRcdFx0XHRtYWlsOiBuZXdNYWlsRGF0YSxcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLl91cGRhdGVTaW5nbGVNYWlsKG5ld01haWxJdGVtKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGFyZUFsbFNlbGVjdGVkKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLmxpc3RNb2RlbC5hcmVBbGxTZWxlY3RlZCgpXG5cdH1cblxuXHRzZWxlY3RBbGwoKSB7XG5cdFx0dGhpcy5saXN0TW9kZWwuc2VsZWN0QWxsKClcblx0fVxuXG5cdG9uU2luZ2xlSW5jbHVzaXZlU2VsZWN0aW9uKG1haWw6IE1haWwsIGNsZWFyU2VsZWN0aW9uT25NdWx0aVNlbGVjdFN0YXJ0PzogYm9vbGVhbikge1xuXHRcdHRoaXMubGlzdE1vZGVsLm9uU2luZ2xlSW5jbHVzaXZlU2VsZWN0aW9uKGFzc2VydE5vdE51bGwodGhpcy5nZXRMb2FkZWRNYWlsQnlNYWlsSW5zdGFuY2UobWFpbCkpLCBjbGVhclNlbGVjdGlvbk9uTXVsdGlTZWxlY3RTdGFydClcblx0fVxuXG5cdHNlbGVjdFJhbmdlVG93YXJkcyhtYWlsOiBNYWlsKSB7XG5cdFx0dGhpcy5saXN0TW9kZWwuc2VsZWN0UmFuZ2VUb3dhcmRzKGFzc2VydE5vdE51bGwodGhpcy5nZXRMb2FkZWRNYWlsQnlNYWlsSW5zdGFuY2UobWFpbCkpKVxuXHR9XG5cblx0c2VsZWN0UHJldmlvdXMobXVsdGlzZWxlY3Q6IGJvb2xlYW4pIHtcblx0XHR0aGlzLmxpc3RNb2RlbC5zZWxlY3RQcmV2aW91cyhtdWx0aXNlbGVjdClcblx0fVxuXG5cdHNlbGVjdE5leHQobXVsdGlzZWxlY3Q6IGJvb2xlYW4pIHtcblx0XHR0aGlzLmxpc3RNb2RlbC5zZWxlY3ROZXh0KG11bHRpc2VsZWN0KVxuXHR9XG5cblx0b25TaW5nbGVFeGNsdXNpdmVTZWxlY3Rpb24obWFpbDogTWFpbCkge1xuXHRcdHRoaXMubGlzdE1vZGVsLm9uU2luZ2xlRXhjbHVzaXZlU2VsZWN0aW9uKGFzc2VydE5vdE51bGwodGhpcy5nZXRMb2FkZWRNYWlsQnlNYWlsSW5zdGFuY2UobWFpbCkpKVxuXHR9XG5cblx0aXNJbk11bHRpc2VsZWN0KCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLmxpc3RNb2RlbC5zdGF0ZS5pbk11bHRpc2VsZWN0XG5cdH1cblxuXHRlbnRlck11bHRpc2VsZWN0KCkge1xuXHRcdHRoaXMubGlzdE1vZGVsLmVudGVyTXVsdGlzZWxlY3QoKVxuXHR9XG5cblx0YXN5bmMgbG9hZEFsbCgpIHtcblx0XHRhd2FpdCB0aGlzLmxpc3RNb2RlbC5sb2FkQWxsKClcblx0fVxuXG5cdHNldEZpbHRlcihmaWx0ZXI6IExpc3RGaWx0ZXI8TWFpbD4gfCBudWxsKSB7XG5cdFx0dGhpcy5saXN0TW9kZWwuc2V0RmlsdGVyKGZpbHRlciAmJiAoKGxvYWRlZE1haWw6IExvYWRlZE1haWwpID0+IGZpbHRlcihsb2FkZWRNYWlsLm1haWwpKSlcblx0fVxuXG5cdGlzRW1wdHlBbmREb25lKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiB0aGlzLmxpc3RNb2RlbC5pc0VtcHR5QW5kRG9uZSgpXG5cdH1cblxuXHRhc3luYyBsb2FkTW9yZSgpIHtcblx0XHRhd2FpdCB0aGlzLmxpc3RNb2RlbC5sb2FkTW9yZSgpXG5cdH1cblxuXHRhc3luYyByZXRyeUxvYWRpbmcoKSB7XG5cdFx0YXdhaXQgdGhpcy5saXN0TW9kZWwucmV0cnlMb2FkaW5nKClcblx0fVxuXG5cdHN0b3BMb2FkaW5nKCkge1xuXHRcdHRoaXMubGlzdE1vZGVsLnN0b3BMb2FkaW5nKClcblx0fVxuXG5cdHByaXZhdGUgZ2V0TG9hZGVkTWFpbEJ5TWFpbElkKG1haWxJZDogSWQpOiBMb2FkZWRNYWlsIHwgbnVsbCB7XG5cdFx0cmV0dXJuIHRoaXMubWFpbE1hcC5nZXQobWFpbElkKSA/PyBudWxsXG5cdH1cblxuXHRwcml2YXRlIGdldExvYWRlZE1haWxCeU1haWxTZXRJZChtYWlsSWQ6IElkKTogTG9hZGVkTWFpbCB8IG51bGwge1xuXHRcdHJldHVybiB0aGlzLm1haWxNYXAuZ2V0KGRlY29uc3RydWN0TWFpbFNldEVudHJ5SWQobWFpbElkKS5tYWlsSWQpID8/IG51bGxcblx0fVxuXG5cdHByaXZhdGUgZ2V0TG9hZGVkTWFpbEJ5TWFpbEluc3RhbmNlKG1haWw6IE1haWwpOiBMb2FkZWRNYWlsIHwgbnVsbCB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0TG9hZGVkTWFpbEJ5TWFpbElkKGdldEVsZW1lbnRJZChtYWlsKSlcblx0fVxuXG5cdC8qKlxuXHQgKiBMb2FkIG1haWxzLCBhcHBseWluZyBpbmJveCBydWxlcyBhcyBuZWVkZWRcblx0ICovXG5cdHByaXZhdGUgYXN5bmMgbG9hZE1haWxzKHN0YXJ0aW5nSWQ6IElkVHVwbGUsIGNvdW50OiBudW1iZXIpOiBQcm9taXNlPExpc3RGZXRjaFJlc3VsdDxMb2FkZWRNYWlsPj4ge1xuXHRcdGxldCBpdGVtczogTG9hZGVkTWFpbFtdID0gW11cblx0XHRsZXQgY29tcGxldGUgPSBmYWxzZVxuXG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IG1haWxTZXRFbnRyaWVzID0gYXdhaXQgdGhpcy5lbnRpdHlDbGllbnQubG9hZFJhbmdlKE1haWxTZXRFbnRyeVR5cGVSZWYsIGxpc3RJZFBhcnQoc3RhcnRpbmdJZCksIGVsZW1lbnRJZFBhcnQoc3RhcnRpbmdJZCksIGNvdW50LCB0cnVlKVxuXG5cdFx0XHQvLyBDaGVjayBmb3IgY29tcGxldGVuZXNzIGJlZm9yZSBsb2FkaW5nL2ZpbHRlcmluZyBtYWlscywgYXMgd2UgbWF5IGVuZCB1cCB3aXRoIGV2ZW4gZmV3ZXIgbWFpbHMgdGhhbiByZXRyaWV2ZWQgaW4gZWl0aGVyIGNhc2Vcblx0XHRcdGNvbXBsZXRlID0gbWFpbFNldEVudHJpZXMubGVuZ3RoIDwgY291bnRcblx0XHRcdGlmIChtYWlsU2V0RW50cmllcy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGl0ZW1zID0gYXdhaXQgdGhpcy5yZXNvbHZlTWFpbFNldEVudHJpZXMobWFpbFNldEVudHJpZXMsIHRoaXMuZGVmYXVsdE1haWxQcm92aWRlcilcblx0XHRcdFx0aXRlbXMgPSBhd2FpdCB0aGlzLmFwcGx5SW5ib3hSdWxlc1RvRW50cmllcyhpdGVtcylcblx0XHRcdH1cblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRpZiAoaXNPZmZsaW5lRXJyb3IoZSkpIHtcblx0XHRcdFx0Ly8gQXR0ZW1wdCBsb2FkaW5nIGZyb20gdGhlIGNhY2hlIGlmIHdlIGZhaWxlZCB0byBnZXQgbWFpbHMgYW5kL29yIG1haWxzZXQgZW50cmllc1xuXHRcdFx0XHQvLyBOb3RlIHRoYXQgd2UgbWF5IGhhdmUgaXRlbXMgaWYgaXQgd2FzIGp1c3QgaW5ib3ggcnVsZXMgdGhhdCBmYWlsZWRcblx0XHRcdFx0aWYgKGl0ZW1zLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRcdC8vIFNldCB0aGUgcmVxdWVzdCBhcyBpbmNvbXBsZXRlIHNvIHRoYXQgd2UgbWFrZSBhbm90aGVyIHJlcXVlc3QgbGF0ZXIgKHNlZSBgbG9hZE1haWxzRnJvbUNhY2hlYCBjb21tZW50KVxuXHRcdFx0XHRcdGNvbXBsZXRlID0gZmFsc2Vcblx0XHRcdFx0XHRpdGVtcyA9IGF3YWl0IHRoaXMubG9hZE1haWxzRnJvbUNhY2hlKHN0YXJ0aW5nSWQsIGNvdW50KVxuXHRcdFx0XHRcdGlmIChpdGVtcy5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0XHRcdHRocm93IGUgLy8gd2UgY291bGRuJ3QgZ2V0IGFueXRoaW5nIGZyb20gdGhlIGNhY2hlIVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhyb3cgZVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMudXBkYXRlTWFpbE1hcChpdGVtcylcblx0XHRyZXR1cm4ge1xuXHRcdFx0aXRlbXMsXG5cdFx0XHRjb21wbGV0ZSxcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogTG9hZCBtYWlscyBmcm9tIHRoZSBjYWNoZSByYXRoZXIgdGhhbiByZW1vdGVseVxuXHQgKi9cblx0cHJpdmF0ZSBhc3luYyBsb2FkTWFpbHNGcm9tQ2FjaGUoc3RhcnRJZDogSWRUdXBsZSwgY291bnQ6IG51bWJlcik6IFByb21pc2U8TG9hZGVkTWFpbFtdPiB7XG5cdFx0Ly8gVGhlIHdheSB0aGUgY2FjaGUgd29ya3MgaXMgdGhhdCBpdCB0cmllcyB0byBmdWxmaWxsIHRoZSBBUEkgY29udHJhY3Qgb2YgcmV0dXJuaW5nIGFzIG1hbnkgaXRlbXMgYXMgcmVxdWVzdGVkIGFzIGxvbmcgYXMgaXQgY2FuLlxuXHRcdC8vIFRoaXMgaXMgcHJvYmxlbWF0aWMgZm9yIG9mZmxpbmUgd2hlcmUgd2UgbWlnaHQgbm90IGhhdmUgdGhlIGZ1bGwgcGFnZSBvZiBlbWFpbHMgbG9hZGVkIChlLmcuIHdlIGRlbGV0ZSBwYXJ0IGFzIGl0J3MgdG9vIG9sZCwgb3Igd2UgbW92ZSBlbWFpbHNcblx0XHQvLyBhcm91bmQpLiBCZWNhdXNlIG9mIHRoYXQgY2FjaGUgd2lsbCB0cnkgdG8gbG9hZCBhZGRpdGlvbmFsIGl0ZW1zIGZyb20gdGhlIHNlcnZlciBpbiBvcmRlciB0byByZXR1cm4gYGNvdW50YCBpdGVtcy4gSWYgaXQgZmFpbHMgdG8gbG9hZCB0aGVtLFxuXHRcdC8vIGl0IHdpbGwgbm90IHJldHVybiBhbnl0aGluZyBhbmQgaW5zdGVhZCB3aWxsIHRocm93IGFuIGVycm9yLlxuXHRcdC8vIFRoaXMgaXMgZ2VuZXJhbGx5IGZpbmUgYnV0IGluIGNhc2Ugb2Ygb2ZmbGluZSB3ZSB3YW50IHRvIGRpc3BsYXkgZXZlcnl0aGluZyB0aGF0IHdlIGhhdmUgY2FjaGVkLiBGb3IgdGhhdCB3ZSBmZXRjaCBkaXJlY3RseSBmcm9tIHRoZSBjYWNoZSxcblx0XHQvLyBnaXZlIGl0IHRvIHRoZSBsaXN0IGFuZCBsZXQgbGlzdCBtYWtlIGFub3RoZXIgcmVxdWVzdCAoYW5kIGFsbW9zdCBjZXJ0YWlubHkgZmFpbCB0aGF0IHJlcXVlc3QpIHRvIHNob3cgYSByZXRyeSBidXR0b24uIFRoaXMgd2F5IHdlIGJvdGggc2hvd1xuXHRcdC8vIHRoZSBpdGVtcyB3ZSBoYXZlIGFuZCBhbHNvIHNob3cgdGhhdCB3ZSBjb3VsZG4ndCBsb2FkIGV2ZXJ5dGhpbmcuXG5cdFx0Y29uc3QgbWFpbFNldEVudHJpZXMgPSBhd2FpdCB0aGlzLmNhY2hlU3RvcmFnZS5wcm92aWRlRnJvbVJhbmdlKE1haWxTZXRFbnRyeVR5cGVSZWYsIGxpc3RJZFBhcnQoc3RhcnRJZCksIGVsZW1lbnRJZFBhcnQoc3RhcnRJZCksIGNvdW50LCB0cnVlKVxuXHRcdHJldHVybiBhd2FpdCB0aGlzLnJlc29sdmVNYWlsU2V0RW50cmllcyhtYWlsU2V0RW50cmllcywgKGxpc3QsIGVsZW1lbnRzKSA9PiB0aGlzLmNhY2hlU3RvcmFnZS5wcm92aWRlTXVsdGlwbGUoTWFpbFR5cGVSZWYsIGxpc3QsIGVsZW1lbnRzKSlcblx0fVxuXG5cdC8qKlxuXHQgKiBBcHBseSBpbmJveCBydWxlcyB0byBhbiBhcnJheSBvZiBtYWlscywgcmV0dXJuaW5nIGFsbCBtYWlscyB0aGF0IHdlcmUgbm90IG1vdmVkXG5cdCAqL1xuXHRwcml2YXRlIGFzeW5jIGFwcGx5SW5ib3hSdWxlc1RvRW50cmllcyhlbnRyaWVzOiBMb2FkZWRNYWlsW10pOiBQcm9taXNlPExvYWRlZE1haWxbXT4ge1xuXHRcdGlmICh0aGlzLm1haWxTZXQuZm9sZGVyVHlwZSAhPT0gTWFpbFNldEtpbmQuSU5CT1ggfHwgZW50cmllcy5sZW5ndGggPT09IDApIHtcblx0XHRcdHJldHVybiBlbnRyaWVzXG5cdFx0fVxuXHRcdGNvbnN0IG1haWxib3hEZXRhaWwgPSBhd2FpdCB0aGlzLm1haWxNb2RlbC5nZXRNYWlsYm94RGV0YWlsc0Zvck1haWxGb2xkZXIodGhpcy5tYWlsU2V0KVxuXHRcdGlmICghbWFpbGJveERldGFpbCkge1xuXHRcdFx0cmV0dXJuIGVudHJpZXNcblx0XHR9XG5cdFx0cmV0dXJuIGF3YWl0IHByb21pc2VGaWx0ZXIoZW50cmllcywgYXN5bmMgKGVudHJ5KSA9PiB7XG5cdFx0XHRjb25zdCBydWxlQXBwbGllZCA9IGF3YWl0IHRoaXMuaW5ib3hSdWxlSGFuZGxlci5maW5kQW5kQXBwbHlNYXRjaGluZ1J1bGUobWFpbGJveERldGFpbCwgZW50cnkubWFpbCwgdHJ1ZSlcblx0XHRcdHJldHVybiBydWxlQXBwbGllZCA9PSBudWxsXG5cdFx0fSlcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgbG9hZFNpbmdsZU1haWwoaWQ6IElkVHVwbGUpOiBQcm9taXNlPExvYWRlZE1haWw+IHtcblx0XHRjb25zdCBtYWlsU2V0RW50cnkgPSBhd2FpdCB0aGlzLmVudGl0eUNsaWVudC5sb2FkKE1haWxTZXRFbnRyeVR5cGVSZWYsIGlkKVxuXHRcdGNvbnN0IGxvYWRlZE1haWxzID0gYXdhaXQgdGhpcy5yZXNvbHZlTWFpbFNldEVudHJpZXMoW21haWxTZXRFbnRyeV0sIHRoaXMuZGVmYXVsdE1haWxQcm92aWRlcilcblx0XHR0aGlzLnVwZGF0ZU1haWxNYXAobG9hZGVkTWFpbHMpXG5cdFx0cmV0dXJuIGFzc2VydE5vdE51bGwobG9hZGVkTWFpbHNbMF0pXG5cdH1cblxuXHQvKipcblx0ICogTG9hZHMgYWxsIE1haWwgaW5zdGFuY2VzIGZvciBlYWNoIE1haWxTZXRFbnRyeSwgcmV0dXJuaW5nIGEgdHVwbGUgb2YgZWFjaFxuXHQgKi9cblx0cHJpdmF0ZSBhc3luYyByZXNvbHZlTWFpbFNldEVudHJpZXMoXG5cdFx0bWFpbFNldEVudHJpZXM6IE1haWxTZXRFbnRyeVtdLFxuXHRcdG1haWxQcm92aWRlcjogKGxpc3RJZDogSWQsIGVsZW1lbnRJZHM6IElkW10pID0+IFByb21pc2U8TWFpbFtdPixcblx0KTogUHJvbWlzZTxMb2FkZWRNYWlsW10+IHtcblx0XHQvLyBTb3J0IGFsbCBtYWlscyBpbnRvIG1haWxiYWdzIHNvIHdlIGNhbiByZXRyaWV2ZSB0aGVtIHdpdGggbG9hZE11bHRpcGxlXG5cdFx0Y29uc3QgbWFpbExpc3RNYXA6IE1hcDxJZCwgSWRbXT4gPSBuZXcgTWFwKClcblx0XHRmb3IgKGNvbnN0IGVudHJ5IG9mIG1haWxTZXRFbnRyaWVzKSB7XG5cdFx0XHRjb25zdCBtYWlsQmFnID0gbGlzdElkUGFydChlbnRyeS5tYWlsKVxuXHRcdFx0Y29uc3QgbWFpbEVsZW1lbnRJZCA9IGVsZW1lbnRJZFBhcnQoZW50cnkubWFpbClcblx0XHRcdGxldCBtYWlsSWRzID0gbWFpbExpc3RNYXAuZ2V0KG1haWxCYWcpXG5cdFx0XHRpZiAoIW1haWxJZHMpIHtcblx0XHRcdFx0bWFpbElkcyA9IFtdXG5cdFx0XHRcdG1haWxMaXN0TWFwLnNldChtYWlsQmFnLCBtYWlsSWRzKVxuXHRcdFx0fVxuXHRcdFx0bWFpbElkcy5wdXNoKG1haWxFbGVtZW50SWQpXG5cdFx0fVxuXG5cdFx0Ly8gUmV0cmlldmUgYWxsIG1haWxzIGJ5IG1haWxiYWdcblx0XHRjb25zdCBhbGxNYWlsczogTWFwPElkLCBNYWlsPiA9IG5ldyBNYXAoKVxuXHRcdGZvciAoY29uc3QgW2xpc3QsIGVsZW1lbnRzXSBvZiBtYWlsTGlzdE1hcCkge1xuXHRcdFx0Y29uc3QgbWFpbHMgPSBhd2FpdCBtYWlsUHJvdmlkZXIobGlzdCwgZWxlbWVudHMpXG5cdFx0XHRmb3IgKGNvbnN0IG1haWwgb2YgbWFpbHMpIHtcblx0XHRcdFx0YWxsTWFpbHMuc2V0KGdldEVsZW1lbnRJZChtYWlsKSwgbWFpbClcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBCdWlsZCBvdXIgYXJyYXlcblx0XHRjb25zdCBsb2FkZWRNYWlsczogTG9hZGVkTWFpbFtdID0gW11cblx0XHRmb3IgKGNvbnN0IG1haWxTZXRFbnRyeSBvZiBtYWlsU2V0RW50cmllcykge1xuXHRcdFx0Y29uc3QgbWFpbCA9IGFsbE1haWxzLmdldChlbGVtZW50SWRQYXJ0KG1haWxTZXRFbnRyeS5tYWlsKSlcblxuXHRcdFx0Ly8gTWFpbCBtYXkgaGF2ZSBiZWVuIGRlbGV0ZWQgaW4gdGhlIG1lYW50aW1lXG5cdFx0XHRpZiAoIW1haWwpIHtcblx0XHRcdFx0Y29udGludWVcblx0XHRcdH1cblxuXHRcdFx0Ly8gUmVzb2x2ZSBsYWJlbHNcblx0XHRcdGNvbnN0IGxhYmVsczogTWFpbEZvbGRlcltdID0gdGhpcy5tYWlsTW9kZWwuZ2V0TGFiZWxzRm9yTWFpbChtYWlsKVxuXHRcdFx0bG9hZGVkTWFpbHMucHVzaCh7IG1haWxTZXRFbnRyeSwgbWFpbCwgbGFiZWxzIH0pXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGxvYWRlZE1haWxzXG5cdH1cblxuXHRwcml2YXRlIHVwZGF0ZU1haWxNYXAobWFpbHM6IExvYWRlZE1haWxbXSkge1xuXHRcdGZvciAoY29uc3QgbWFpbCBvZiBtYWlscykge1xuXHRcdFx0dGhpcy5tYWlsTWFwLnNldChnZXRFbGVtZW50SWQobWFpbC5tYWlsKSwgbWFpbClcblx0XHR9XG5cdH1cblxuXHQvLyBAVmlzaWJsZUZvclRlc3Rpbmdcblx0X3VwZGF0ZVNpbmdsZU1haWwobWFpbDogTG9hZGVkTWFpbCkge1xuXHRcdHRoaXMudXBkYXRlTWFpbE1hcChbbWFpbF0pXG5cdFx0dGhpcy5saXN0TW9kZWwudXBkYXRlTG9hZGVkSXRlbShtYWlsKVxuXHR9XG5cblx0Ly8gQFZpc2libGVGb3JUZXN0aW5nXG5cdF9sb2FkZWRNYWlscygpOiByZWFkb25seSBMb2FkZWRNYWlsW10ge1xuXHRcdHJldHVybiB0aGlzLmxpc3RNb2RlbC5zdGF0ZS5pdGVtc1xuXHR9XG5cblx0cHJpdmF0ZSByZWFkb25seSBkZWZhdWx0TWFpbFByb3ZpZGVyID0gKGxpc3RJZDogSWQsIGVsZW1lbnRzOiBJZFtdKTogUHJvbWlzZTxNYWlsW10+ID0+IHtcblx0XHRyZXR1cm4gdGhpcy5lbnRpdHlDbGllbnQubG9hZE11bHRpcGxlKE1haWxUeXBlUmVmLCBsaXN0SWQsIGVsZW1lbnRzKVxuXHR9XG59XG4iLCJpbXBvcnQgeyBNYWlsYm94RGV0YWlsLCBNYWlsYm94TW9kZWwgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21haWxGdW5jdGlvbmFsaXR5L01haWxib3hNb2RlbC5qc1wiXG5pbXBvcnQgeyBFbnRpdHlDbGllbnQgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vRW50aXR5Q2xpZW50LmpzXCJcbmltcG9ydCB7XG5cdEltcG9ydGVkTWFpbFR5cGVSZWYsXG5cdEltcG9ydE1haWxTdGF0ZVR5cGVSZWYsXG5cdE1haWwsXG5cdE1haWxCb3gsXG5cdE1haWxGb2xkZXIsXG5cdE1haWxGb2xkZXJUeXBlUmVmLFxuXHRNYWlsU2V0RW50cnksXG5cdE1haWxTZXRFbnRyeVR5cGVSZWYsXG5cdE1haWxUeXBlUmVmLFxufSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9lbnRpdGllcy90dXRhbm90YS9UeXBlUmVmcy5qc1wiXG5pbXBvcnQge1xuXHRkZWNvbnN0cnVjdE1haWxTZXRFbnRyeUlkLFxuXHRlbGVtZW50SWRQYXJ0LFxuXHRmaXJzdEJpZ2dlclRoYW5TZWNvbmQsXG5cdGdldEVsZW1lbnRJZCxcblx0aXNTYW1lSWQsXG5cdGxpc3RJZFBhcnQsXG59IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi91dGlscy9FbnRpdHlVdGlscy5qc1wiXG5pbXBvcnQge1xuXHRhc3NlcnROb3ROdWxsLFxuXHRjb3VudCxcblx0ZGVib3VuY2UsXG5cdGZpcnN0LFxuXHRncm91cEJ5LFxuXHRpc0VtcHR5LFxuXHRsYXN0VGhyb3csXG5cdGxhenlNZW1vaXplZCxcblx0bWFwV2l0aCxcblx0bWFwV2l0aG91dCxcblx0bWVtb2l6ZWQsXG5cdG9mQ2xhc3MsXG5cdHByb21pc2VNYXAsXG59IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHsgTGlzdFN0YXRlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9MaXN0LmpzXCJcbmltcG9ydCB7IENvbnZlcnNhdGlvblByZWZQcm92aWRlciwgQ29udmVyc2F0aW9uVmlld01vZGVsLCBDb252ZXJzYXRpb25WaWV3TW9kZWxGYWN0b3J5IH0gZnJvbSBcIi4vQ29udmVyc2F0aW9uVmlld01vZGVsLmpzXCJcbmltcG9ydCB7IENyZWF0ZU1haWxWaWV3ZXJPcHRpb25zIH0gZnJvbSBcIi4vTWFpbFZpZXdlci5qc1wiXG5pbXBvcnQgeyBpc09mZmxpbmVFcnJvciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi91dGlscy9FcnJvclV0aWxzLmpzXCJcbmltcG9ydCB7IGdldE1haWxTZXRLaW5kLCBJbXBvcnRTdGF0dXMsIE1haWxTZXRLaW5kLCBPcGVyYXRpb25UeXBlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL1R1dGFub3RhQ29uc3RhbnRzLmpzXCJcbmltcG9ydCB7IFdzQ29ubmVjdGlvblN0YXRlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvbWFpbi9Xb3JrZXJDbGllbnQuanNcIlxuaW1wb3J0IHsgV2Vic29ja2V0Q29ubmVjdGl2aXR5TW9kZWwgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21pc2MvV2Vic29ja2V0Q29ubmVjdGl2aXR5TW9kZWwuanNcIlxuaW1wb3J0IHsgRXhwb3NlZENhY2hlU3RvcmFnZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9yZXN0L0RlZmF1bHRFbnRpdHlSZXN0Q2FjaGUuanNcIlxuaW1wb3J0IHsgTm90QXV0aG9yaXplZEVycm9yLCBOb3RGb3VuZEVycm9yLCBQcmVjb25kaXRpb25GYWlsZWRFcnJvciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9lcnJvci9SZXN0RXJyb3IuanNcIlxuaW1wb3J0IHsgVXNlckVycm9yIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvbWFpbi9Vc2VyRXJyb3IuanNcIlxuaW1wb3J0IHsgUHJvZ3JhbW1pbmdFcnJvciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9lcnJvci9Qcm9ncmFtbWluZ0Vycm9yLmpzXCJcbmltcG9ydCBTdHJlYW0gZnJvbSBcIm1pdGhyaWwvc3RyZWFtXCJcbmltcG9ydCB7IEluYm94UnVsZUhhbmRsZXIgfSBmcm9tIFwiLi4vbW9kZWwvSW5ib3hSdWxlSGFuZGxlci5qc1wiXG5pbXBvcnQgeyBSb3V0ZXIgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9TY29wZWRSb3V0ZXIuanNcIlxuaW1wb3J0IHsgRW50aXR5VXBkYXRlRGF0YSwgaXNVcGRhdGVGb3JUeXBlUmVmIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL3V0aWxzL0VudGl0eVVwZGF0ZVV0aWxzLmpzXCJcbmltcG9ydCB7IEV2ZW50Q29udHJvbGxlciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL21haW4vRXZlbnRDb250cm9sbGVyLmpzXCJcbmltcG9ydCB7IE1haWxNb2RlbCB9IGZyb20gXCIuLi9tb2RlbC9NYWlsTW9kZWwuanNcIlxuaW1wb3J0IHsgYXNzZXJ0U3lzdGVtRm9sZGVyT2ZUeXBlIH0gZnJvbSBcIi4uL21vZGVsL01haWxVdGlscy5qc1wiXG5pbXBvcnQgeyBnZXRNYWlsRmlsdGVyRm9yVHlwZSwgTWFpbEZpbHRlclR5cGUgfSBmcm9tIFwiLi9NYWlsVmlld2VyVXRpbHMuanNcIlxuaW1wb3J0IHsgQ2FjaGVNb2RlIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL3Jlc3QvRW50aXR5UmVzdENsaWVudC5qc1wiXG5pbXBvcnQgeyBpc09mVHlwZU9yU3ViZm9sZGVyT2YsIGlzU3BhbU9yVHJhc2hGb2xkZXIsIGlzU3ViZm9sZGVyT2ZUeXBlIH0gZnJvbSBcIi4uL21vZGVsL01haWxDaGVja3MuanNcIlxuaW1wb3J0IHsgTWFpbExpc3RNb2RlbCB9IGZyb20gXCIuLi9tb2RlbC9NYWlsTGlzdE1vZGVsXCJcblxuZXhwb3J0IGludGVyZmFjZSBNYWlsT3BlbmVkTGlzdGVuZXIge1xuXHRvbkVtYWlsT3BlbmVkKG1haWw6IE1haWwpOiB1bmtub3duXG59XG5cbmNvbnN0IFRBRyA9IFwiTWFpbFZNXCJcblxuLyoqIFZpZXdNb2RlbCBmb3IgdGhlIG92ZXJhbGwgbWFpbCB2aWV3LiAqL1xuZXhwb3J0IGNsYXNzIE1haWxWaWV3TW9kZWwge1xuXHRwcml2YXRlIF9mb2xkZXI6IE1haWxGb2xkZXIgfCBudWxsID0gbnVsbFxuXHQvKiogaWQgb2YgdGhlIG1haWwgdGhhdCB3YXMgcmVxdWVzdGVkIHRvIGJlIGRpc3BsYXllZCwgaW5kZXBlbmRlbnQgb2YgdGhlIGxpc3Qgc3RhdGUuICovXG5cdHByaXZhdGUgc3RpY2t5TWFpbElkOiBJZFR1cGxlIHwgbnVsbCA9IG51bGxcblx0LyoqXG5cdCAqIFdoZW4gdGhlIFVSTCBjb250YWlucyBib3RoIGZvbGRlciBpZCBhbmQgbWFpbCBpZCB3ZSB3aWxsIHRyeSB0byBzZWxlY3QgdGhhdCBtYWlsIGJ1dCB3ZSBtaWdodCBuZWVkIHRvIGxvYWQgdGhlIGxpc3QgdW50aWwgd2UgZmluZCBpdC5cblx0ICogVGhpcyBpcyB0aGF0IG1haWwgaWQgdGhhdCB3ZSBhcmUgbG9hZGluZy5cblx0ICovXG5cdHByaXZhdGUgbG9hZGluZ1RhcmdldElkOiBJZCB8IG51bGwgPSBudWxsXG5cdHByaXZhdGUgY29udmVyc2F0aW9uVmlld01vZGVsOiBDb252ZXJzYXRpb25WaWV3TW9kZWwgfCBudWxsID0gbnVsbFxuXHRwcml2YXRlIF9maWx0ZXJUeXBlOiBNYWlsRmlsdGVyVHlwZSB8IG51bGwgPSBudWxsXG5cblx0LyoqXG5cdCAqIFdlIHJlbWVtYmVyIHRoZSBsYXN0IFVSTCB1c2VkIGZvciBlYWNoIGZvbGRlciBzbyBpZiB3ZSBzd2l0Y2ggYmV0d2VlbiBmb2xkZXJzIHdlIGNhbiBrZWVwIHRoZSBzZWxlY3RlZCBtYWlsLlxuXHQgKiBUaGVyZSdzIGEgc2ltaWxhciAoYnV0IGRpZmZlcmVudCkgaGFja3kgbWVjaGFuaXNtIHdoZXJlIHdlIHN0b3JlIGxhc3QgVVJMIGJ1dCBwZXIgZWFjaCB0b3AtbGV2ZWwgdmlldzogbmF2QnV0dG9uUm91dGVzLiBUaGlzIG9uZSBpcyBwZXIgZm9sZGVyLlxuXHQgKi9cblx0cHJpdmF0ZSBtYWlsRm9sZGVyRWxlbWVudElkVG9TZWxlY3RlZE1haWxJZDogUmVhZG9ubHlNYXA8SWQsIElkPiA9IG5ldyBNYXAoKVxuXHRwcml2YXRlIGxpc3RTdHJlYW1TdWJzY3JpcHRpb246IFN0cmVhbTx1bmtub3duPiB8IG51bGwgPSBudWxsXG5cdHByaXZhdGUgY29udmVyc2F0aW9uUHJlZjogYm9vbGVhbiA9IGZhbHNlXG5cdC8qKiBBIHNsaWdodGx5IGhhY2t5IG1hcmtlciB0byBhdm9pZCBjb25jdXJyZW50IFVSTCB1cGRhdGVzLiAqL1xuXHRwcml2YXRlIGN1cnJlbnRTaG93VGFyZ2V0TWFya2VyOiBvYmplY3QgPSB7fVxuXG5cdGNvbnN0cnVjdG9yKFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgbWFpbGJveE1vZGVsOiBNYWlsYm94TW9kZWwsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBtYWlsTW9kZWw6IE1haWxNb2RlbCxcblx0XHRwcml2YXRlIHJlYWRvbmx5IGVudGl0eUNsaWVudDogRW50aXR5Q2xpZW50LFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgZXZlbnRDb250cm9sbGVyOiBFdmVudENvbnRyb2xsZXIsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBjb25uZWN0aXZpdHlNb2RlbDogV2Vic29ja2V0Q29ubmVjdGl2aXR5TW9kZWwsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBjYWNoZVN0b3JhZ2U6IEV4cG9zZWRDYWNoZVN0b3JhZ2UsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBjb252ZXJzYXRpb25WaWV3TW9kZWxGYWN0b3J5OiBDb252ZXJzYXRpb25WaWV3TW9kZWxGYWN0b3J5LFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgbWFpbE9wZW5lZExpc3RlbmVyOiBNYWlsT3BlbmVkTGlzdGVuZXIsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBjb252ZXJzYXRpb25QcmVmUHJvdmlkZXI6IENvbnZlcnNhdGlvblByZWZQcm92aWRlcixcblx0XHRwcml2YXRlIHJlYWRvbmx5IGluYm94UnVsZUhhbmRsZXI6IEluYm94UnVsZUhhbmRsZXIsXG5cdFx0cHJpdmF0ZSByZWFkb25seSByb3V0ZXI6IFJvdXRlcixcblx0XHRwcml2YXRlIHJlYWRvbmx5IHVwZGF0ZVVpOiAoKSA9PiB1bmtub3duLFxuXHQpIHt9XG5cblx0Z2V0U2VsZWN0ZWRNYWlsU2V0S2luZCgpOiBNYWlsU2V0S2luZCB8IG51bGwge1xuXHRcdHJldHVybiB0aGlzLl9mb2xkZXIgPyBnZXRNYWlsU2V0S2luZCh0aGlzLl9mb2xkZXIpIDogbnVsbFxuXHR9XG5cblx0Z2V0IGZpbHRlclR5cGUoKTogTWFpbEZpbHRlclR5cGUgfCBudWxsIHtcblx0XHRyZXR1cm4gdGhpcy5fZmlsdGVyVHlwZVxuXHR9XG5cblx0c2V0RmlsdGVyKGZpbHRlcjogTWFpbEZpbHRlclR5cGUgfCBudWxsKSB7XG5cdFx0dGhpcy5fZmlsdGVyVHlwZSA9IGZpbHRlclxuXHRcdHRoaXMubGlzdE1vZGVsPy5zZXRGaWx0ZXIoZ2V0TWFpbEZpbHRlckZvclR5cGUoZmlsdGVyKSlcblx0fVxuXG5cdGFzeW5jIHNob3dNYWlsV2l0aE1haWxTZXRJZChtYWlsc2V0SWQ/OiBJZCwgbWFpbElkPzogSWQpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCBzaG93TWFpbE1hcmtlciA9IHt9XG5cdFx0dGhpcy5jdXJyZW50U2hvd1RhcmdldE1hcmtlciA9IHNob3dNYWlsTWFya2VyXG5cdFx0aWYgKG1haWxzZXRJZCkge1xuXHRcdFx0Y29uc3QgbWFpbHNldCA9IGF3YWl0IHRoaXMubWFpbE1vZGVsLmdldE1haWxTZXRCeUlkKG1haWxzZXRJZClcblx0XHRcdGlmIChzaG93TWFpbE1hcmtlciAhPT0gdGhpcy5jdXJyZW50U2hvd1RhcmdldE1hcmtlcikge1xuXHRcdFx0XHRyZXR1cm5cblx0XHRcdH1cblx0XHRcdGlmIChtYWlsc2V0KSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLnNob3dNYWlsKG1haWxzZXQsIG1haWxJZClcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuc2hvd01haWwobnVsbCwgbWFpbElkKVxuXHR9XG5cblx0YXN5bmMgc2hvd1N0aWNreU1haWwoZnVsbE1haWxJZDogSWRUdXBsZSwgb25NaXNzaW5nRXhwbGljaXRNYWlsVGFyZ2V0OiAoKSA9PiB1bmtub3duKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3QgW2xpc3RJZCwgZWxlbWVudElkXSA9IGZ1bGxNYWlsSWRcblx0XHQvLyBJZiB3ZSBhcmUgYWxyZWFkeSBkaXNwbGF5aW5nIHRoZSByZXF1ZXN0ZWQgZW1haWwsIGRvIG5vdGhpbmdcblx0XHRpZiAodGhpcy5jb252ZXJzYXRpb25WaWV3TW9kZWwgJiYgaXNTYW1lSWQodGhpcy5jb252ZXJzYXRpb25WaWV3TW9kZWwucHJpbWFyeU1haWwuX2lkLCBlbGVtZW50SWQpKSB7XG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cdFx0aWYgKGlzU2FtZUlkKHRoaXMuc3RpY2t5TWFpbElkLCBmdWxsTWFpbElkKSkge1xuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0Y29uc29sZS5sb2coVEFHLCBcIkxvYWRpbmcgc3RpY2t5IG1haWxcIiwgbGlzdElkLCBlbGVtZW50SWQpXG5cdFx0dGhpcy5zdGlja3lNYWlsSWQgPSBmdWxsTWFpbElkXG5cblx0XHQvLyBUaGlzIHNob3VsZCBiZSB2ZXJ5IHF1aWNrIGFzIHdlIG9ubHkgd2FpdCBmb3IgdGhlIGNhY2hlLFxuXHRcdGF3YWl0IHRoaXMubG9hZEV4cGxpY2l0TWFpbFRhcmdldChsaXN0SWQsIGVsZW1lbnRJZCwgb25NaXNzaW5nRXhwbGljaXRNYWlsVGFyZ2V0KVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyByZXNldE9ySW5pdGlhbGl6ZUxpc3Qoc3RpY2t5TWFpbElkOiBJZFR1cGxlKSB7XG5cdFx0aWYgKHRoaXMuX2ZvbGRlciAhPSBudWxsKSB7XG5cdFx0XHQvLyBJZiB3ZSBhbHJlYWR5IGhhdmUgYSBmb2xkZXIsIGRlc2VsZWN0LlxuXHRcdFx0dGhpcy5saXN0TW9kZWw/LnNlbGVjdE5vbmUoKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBPdGhlcndpc2UsIGxvYWQgdGhlIGluYm94IHNvIHRoYXQgaXQgd29uJ3QgYmUgZW1wdHkgb24gbW9iaWxlIHdoZW4geW91IHRyeSB0byBnbyBiYWNrLlxuXHRcdFx0Y29uc3QgdXNlckluYm94ID0gYXdhaXQgdGhpcy5nZXRGb2xkZXJGb3JVc2VySW5ib3goKVxuXG5cdFx0XHRpZiAodGhpcy5kaWRTdGlja3lNYWlsQ2hhbmdlKHN0aWNreU1haWxJZCwgXCJhZnRlciBsb2FkaW5nIHVzZXIgaW5ib3ggSURcIikpIHtcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuc2V0TGlzdElkKHVzZXJJbmJveClcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIHNob3dNYWlsKGZvbGRlcj86IE1haWxGb2xkZXIgfCBudWxsLCBtYWlsSWQ/OiBJZCkge1xuXHRcdC8vIGFuIG9wdGltaXphdGlvbiB0byBub3Qgb3BlbiBhbiBlbWFpbCB0aGF0IHdlIGFscmVhZHkgZGlzcGxheVxuXHRcdGlmIChmb2xkZXIgIT0gbnVsbCAmJiBtYWlsSWQgIT0gbnVsbCAmJiB0aGlzLmNvbnZlcnNhdGlvblZpZXdNb2RlbCAmJiBpc1NhbWVJZChlbGVtZW50SWRQYXJ0KHRoaXMuY29udmVyc2F0aW9uVmlld01vZGVsLnByaW1hcnlNYWlsLl9pZCksIG1haWxJZCkpIHtcblx0XHRcdHJldHVyblxuXHRcdH1cblx0XHQvLyBJZiB3ZSBhcmUgYWxyZWFkeSBsb2FkaW5nIHRvd2FyZHMgdGhlIGVtYWlsIHRoYXQgaXMgcGFzc2VkIHRvIHVzIGluIHRoZSBVUkwgdGhlbiB3ZSBkb24ndCBuZWVkIHRvIGRvIGFueXRoaW5nLiBXZSBhbHJlYWR5IHVwZGF0ZWQgVVJMIG9uIHRoZVxuXHRcdC8vIHByZXZpb3VzIGNhbGwuXG5cdFx0aWYgKFxuXHRcdFx0Zm9sZGVyICE9IG51bGwgJiZcblx0XHRcdG1haWxJZCAhPSBudWxsICYmXG5cdFx0XHR0aGlzLl9mb2xkZXIgJiZcblx0XHRcdHRoaXMubG9hZGluZ1RhcmdldElkICYmXG5cdFx0XHRpc1NhbWVJZChmb2xkZXIuX2lkLCB0aGlzLl9mb2xkZXIuX2lkKSAmJlxuXHRcdFx0aXNTYW1lSWQodGhpcy5sb2FkaW5nVGFyZ2V0SWQsIG1haWxJZClcblx0XHQpIHtcblx0XHRcdHJldHVyblxuXHRcdH1cblxuXHRcdGNvbnNvbGUubG9nKFRBRywgXCJzaG93TWFpbFwiLCBmb2xkZXI/Ll9pZCwgbWFpbElkKVxuXG5cdFx0Ly8gaW1wb3J0YW50OiB0byBzZXQgaXQgZWFybHkgZW5vdWdoIGJlY2F1c2Ugc2V0dGluZyBsaXN0SWQgd2lsbCB0cmlnZ2VyIFVSTCB1cGRhdGUuXG5cdFx0Ly8gaWYgd2UgZG9uJ3Qgc2V0IHRoaXMgb25lIGJlZm9yZSBzZXRMaXN0SWQsIHVybCB1cGRhdGUgd2lsbCBjYXVzZSB0aGlzIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBhZ2FpbiBidXQgd2l0aG91dCB0YXJnZXQgbWFpbCwgYW5kIHdlIHdpbGwgbG9zZSB0aGVcblx0XHQvLyB0YXJnZXQgaWRcblx0XHRjb25zdCBsb2FkaW5nVGFyZ2V0SWQgPSBtYWlsSWQgPz8gbnVsbFxuXHRcdHRoaXMubG9hZGluZ1RhcmdldElkID0gbG9hZGluZ1RhcmdldElkXG5cblx0XHQvLyBpZiB0aGUgVVJMIGhhcyBjaGFuZ2VkIHRoZW4gd2UgcHJvYmFibHkgd2FudCB0byByZXNldCB0aGUgZXhwbGljaXRseSBzaG93biBlbWFpbFxuXHRcdHRoaXMuc3RpY2t5TWFpbElkID0gbnVsbFxuXG5cdFx0Y29uc3QgZm9sZGVyVG9Vc2UgPSBhd2FpdCB0aGlzLnNlbGVjdEZvbGRlclRvVXNlKGZvbGRlciA/PyBudWxsKVxuXHRcdC8vIFNlbGVjdGluZyBmb2xkZXIgaXMgYXN5bmMsIGNoZWNrIHRoYXQgdGhlIHRhcmdldCBoYXNuJ3QgY2hhbmdlZCBpbmJldHdlZW5cblx0XHRpZiAodGhpcy5sb2FkaW5nVGFyZ2V0SWQgIT09IGxvYWRpbmdUYXJnZXRJZCkgcmV0dXJuXG5cblx0XHQvLyBUaGlzIHdpbGwgY2F1c2UgYSBVUkwgdXBkYXRlIGluZGlyZWN0bHlcblx0XHR0aGlzLnNldExpc3RJZChmb2xkZXJUb1VzZSlcblxuXHRcdC8vIElmIHdlIGhhdmUgYSBtYWlsIHRoYXQgc2hvdWxkIGJlIHNlbGVjdGVkIHN0YXJ0IGxvYWRpbmcgdG93YXJkcyBpdC5cblx0XHQvLyBXZSBhbHJlYWR5IGNoZWNrZWQgaW4gdGhlIGJlZ2lubmluZyB0aGF0IHdlIGFyZSBub3QgbG9hZGluZyB0byB0aGUgc2FtZSB0YXJnZXQuIFdlIHNldCB0aGUgbG9hZGluZ1RhcmdldCBlYXJseSBzbyB0aGVyZSBzaG91bGQgYmUgbm8gcmFjZXMuXG5cdFx0aWYgKGxvYWRpbmdUYXJnZXRJZCkge1xuXHRcdFx0Ly8gUmVjb3JkIHRoZSBzZWxlY3RlZCBtYWlsIGZvciB0aGUgZm9sZGVyXG5cdFx0XHR0aGlzLm1haWxGb2xkZXJFbGVtZW50SWRUb1NlbGVjdGVkTWFpbElkID0gbWFwV2l0aCh0aGlzLm1haWxGb2xkZXJFbGVtZW50SWRUb1NlbGVjdGVkTWFpbElkLCBnZXRFbGVtZW50SWQoZm9sZGVyVG9Vc2UpLCBsb2FkaW5nVGFyZ2V0SWQpXG5cdFx0XHR0cnkge1xuXHRcdFx0XHRhd2FpdCB0aGlzLmxvYWRBbmRTZWxlY3RNYWlsKGZvbGRlclRvVXNlLCBsb2FkaW5nVGFyZ2V0SWQpXG5cdFx0XHR9IGZpbmFsbHkge1xuXHRcdFx0XHQvLyBXZSBlaXRoZXIgc2VsZWN0ZWQgdGhlIG1haWwgYW5kIHdlIGRvbid0IG5lZWQgdGhlIHRhcmdldCBhbnltb3JlIG9yIHdlIGRpZG4ndCBmaW5kIGl0IGFuZCB3ZSBzaG91bGQgcmVtb3ZlIHRoZSB0YXJnZXRcblx0XHRcdFx0dGhpcy5sb2FkaW5nVGFyZ2V0SWQgPSBudWxsXG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIHVwZGF0ZSBVUkwgaWYgdGhlIHZpZXcgd2FzIGp1c3Qgb3BlbmVkIHdpdGhvdXQgYW55IHVybCBwYXJhbXNcblx0XHRcdC8vIHNldExpc3RJZCBtaWdodCBub3QgaGF2ZSBkb25lIGl0IGlmIHRoZSBsaXN0IGRpZG4ndCBjaGFuZ2UgZm9yIHVzIGludGVybmFsbHkgYnV0IGlzIGNoYW5nZWQgZm9yIHRoZSB2aWV3XG5cdFx0XHRpZiAoZm9sZGVyID09IG51bGwpIHRoaXMudXBkYXRlVXJsKClcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIHNlbGVjdEZvbGRlclRvVXNlKGZvbGRlckFyZ3VtZW50OiBNYWlsRm9sZGVyIHwgbnVsbCk6IFByb21pc2U8TWFpbEZvbGRlcj4ge1xuXHRcdGlmIChmb2xkZXJBcmd1bWVudCkge1xuXHRcdFx0Y29uc3QgbWFpbGJveERldGFpbCA9IGF3YWl0IHRoaXMubWFpbE1vZGVsLmdldE1haWxib3hEZXRhaWxzRm9yTWFpbEZvbGRlcihmb2xkZXJBcmd1bWVudClcblx0XHRcdGlmIChtYWlsYm94RGV0YWlsKSB7XG5cdFx0XHRcdHJldHVybiBmb2xkZXJBcmd1bWVudFxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIGF3YWl0IHRoaXMuZ2V0Rm9sZGVyRm9yVXNlckluYm94KClcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRoaXMuX2ZvbGRlciA/PyAoYXdhaXQgdGhpcy5nZXRGb2xkZXJGb3JVc2VySW5ib3goKSlcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIGxvYWRFeHBsaWNpdE1haWxUYXJnZXQobGlzdElkOiBJZCwgbWFpbElkOiBJZCwgb25NaXNzaW5nVGFyZ2V0RW1haWw6ICgpID0+IHVua25vd24pIHtcblx0XHRjb25zdCBleHBlY3RlZFN0aWNreU1haWxJZDogSWRUdXBsZSA9IFtsaXN0SWQsIG1haWxJZF1cblxuXHRcdC8vIEZpcnN0IHRyeSBnZXR0aW5nIHRoZSBtYWlsIGZyb20gdGhlIGxpc3QuIFdlIGRvbid0IG5lZWQgdG8gZG8gYW55dGhpbmcgbW9yZSBpZiB3ZSBjYW4gc2ltcGx5IHNlbGVjdCBpdCwgYXNcblx0XHQvLyBnZXR0aW5nIHRoZSBtYWlsIGlzIGNvbXBsZXRlbHkgc3luY2hyb25vdXMuXG5cdFx0Y29uc3QgbWFpbEluTGlzdCA9IHRoaXMubGlzdE1vZGVsPy5nZXRNYWlsKG1haWxJZClcblx0XHRpZiAobWFpbEluTGlzdCkge1xuXHRcdFx0Y29uc29sZS5sb2coVEFHLCBcIm9wZW5pbmcgbWFpbCBmcm9tIGxpc3RcIiwgbWFpbElkKVxuXHRcdFx0dGhpcy5saXN0TW9kZWw/Lm9uU2luZ2xlU2VsZWN0aW9uKG1haWxJbkxpc3QpXG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cblx0XHQvLyBMb2FkIHRoZSBjYWNoZWQgbWFpbCB0byBkaXNwbGF5IGl0IHNvb25lci5cblx0XHQvLyBXZSBzdGlsbCB3YW50IHRvIGxvYWQgdGhlIG1haWwgcmVtb3RlbHksIHRob3VnaCwgdG8gbWFrZSBzdXJlIHRoYXQgaXQgd29uJ3QgZGlzYXBwZWFyIGR1ZSB0byBiZWluZyBtb3ZlZC5cblx0XHRjb25zdCBjYWNoZWQgPSBhd2FpdCB0aGlzLmNhY2hlU3RvcmFnZS5nZXQoTWFpbFR5cGVSZWYsIGxpc3RJZCwgbWFpbElkKVxuXHRcdGlmICh0aGlzLmRpZFN0aWNreU1haWxDaGFuZ2UoZXhwZWN0ZWRTdGlja3lNYWlsSWQsIFwiYWZ0ZXIgbG9hZGluZyBjYWNoZWRcIikpIHtcblx0XHRcdHJldHVyblxuXHRcdH1cblx0XHRpZiAoY2FjaGVkKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhUQUcsIFwiZGlzcGxheWluZyBjYWNoZWQgbWFpbFwiLCBtYWlsSWQpXG5cdFx0XHRhd2FpdCB0aGlzLmRpc3BsYXlFeHBsaWNpdE1haWxUYXJnZXQoY2FjaGVkKVxuXHRcdH1cblxuXHRcdGxldCBtYWlsOiBNYWlsIHwgbnVsbFxuXHRcdHRyeSB7XG5cdFx0XHRtYWlsID0gYXdhaXQgdGhpcy5lbnRpdHlDbGllbnQubG9hZChNYWlsVHlwZVJlZiwgW2xpc3RJZCwgbWFpbElkXSwgeyBjYWNoZU1vZGU6IENhY2hlTW9kZS5Xcml0ZU9ubHkgfSlcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRpZiAoaXNPZmZsaW5lRXJyb3IoZSkpIHtcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHR9IGVsc2UgaWYgKGUgaW5zdGFuY2VvZiBOb3RGb3VuZEVycm9yIHx8IGUgaW5zdGFuY2VvZiBOb3RBdXRob3JpemVkRXJyb3IpIHtcblx0XHRcdFx0bWFpbCA9IG51bGxcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRocm93IGVcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKHRoaXMuZGlkU3RpY2t5TWFpbENoYW5nZShleHBlY3RlZFN0aWNreU1haWxJZCwgXCJhZnRlciBsb2FkaW5nIGZyb20gZW50aXR5IGNsaWVudFwiKSkge1xuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0Ly8gU2ltcGx5IGNoZWNraW5nIGlmIE1haWwgZXhpc3RzIGlzIG5vdCBlbm91Z2guIEluc3RlYWQsIHdlIGNoZWNrIGFnYWluc3QgdGhlIHNldHMgaW4gdGhlIE1haWxcblx0XHQvLyBhbmQgc2VlIGlmIGl0J3MgbW92ZWQgZm9sZGVycyBzaW5jZSB0aGUgbGFzdCBzeW5jLiBXZSBoYXZlIHRvIGRvIHRoaXMgYmVjYXVzZSBpZiB0aGUgbWFpbFxuXHRcdC8vIGRpZCBtb3ZlIHNpbmNlIHRoZSBsYXN0IHN5bmMsIGl0IHdpbGwgc3RpbGwgZGlzYXBwZWFyIGZyb20gdmlldy5cblx0XHRsZXQgbW92ZWRTZXRzU2luY2VMYXN0U3luYyA9IGZhbHNlXG5cdFx0aWYgKG1haWwgIT0gbnVsbCAmJiBjYWNoZWQgIT0gbnVsbCkge1xuXHRcdFx0Ly8gVGhpcyB3aWxsIG1vc3QgbGlrZWx5IGJlIHRoZSBpbmJveFxuXHRcdFx0Y29uc3QgY3VycmVudEZvbGRlcklkID0gZWxlbWVudElkUGFydChhc3NlcnROb3ROdWxsKHRoaXMuX2ZvbGRlciwgXCJjYWNoZWQgd2FzIGRpc3BsYXllZCBlYXJsaWVyLCB0aHVzIGZvbGRlciB3b3VsZCBoYXZlIGJlZW4gc2V0XCIpLl9pZClcblx0XHRcdC8vIFRoaXMgY2FuIGJlIGZhbHNlIGlmIHRoZSBtYWlsIHdhcyBtb3ZlZCB3aGlsZSB0aGUgdXNlciBpcyBsb2dnZWQgaW4sIHdoaWNoIGlzIGZpbmUsIGFuZCB3ZSBkb24ndCBuZWVkIHRvIGNoZWNrIHRoZSBsb2FkZWQgbWFpbFxuXHRcdFx0Y29uc3QgY2FjaGVkTWFpbEluRm9sZGVyID0gY2FjaGVkLnNldHMuc29tZSgoaWQpID0+IGVsZW1lbnRJZFBhcnQoaWQpID09PSBjdXJyZW50Rm9sZGVySWQpXG5cdFx0XHRtb3ZlZFNldHNTaW5jZUxhc3RTeW5jID0gY2FjaGVkTWFpbEluRm9sZGVyICYmICFtYWlsLnNldHMuc29tZSgoaWQpID0+IGVsZW1lbnRJZFBhcnQoaWQpID09PSBjdXJyZW50Rm9sZGVySWQpXG5cdFx0fVxuXG5cdFx0aWYgKCFtb3ZlZFNldHNTaW5jZUxhc3RTeW5jICYmIG1haWwgIT0gbnVsbCkge1xuXHRcdFx0Y29uc29sZS5sb2coVEFHLCBcIm9wZW5pbmcgbWFpbCBmcm9tIGVudGl0eSBjbGllbnRcIiwgbWFpbElkKVxuXHRcdFx0YXdhaXQgdGhpcy5kaXNwbGF5RXhwbGljaXRNYWlsVGFyZ2V0KG1haWwpXG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmIChtYWlsICE9IG51bGwpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coVEFHLCBcIkV4cGxpY2l0IG1haWwgdGFyZ2V0IG1vdmVkIHNldHNcIiwgbGlzdElkLCBtYWlsSWQpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhUQUcsIFwiRXhwbGljaXQgbWFpbCB0YXJnZXQgbm90IGZvdW5kXCIsIGxpc3RJZCwgbWFpbElkKVxuXHRcdFx0fVxuXHRcdFx0b25NaXNzaW5nVGFyZ2V0RW1haWwoKVxuXHRcdFx0Ly8gV2UgYWxyZWFkeSBrbm93IHRoYXQgZW1haWwgaXMgbm90IHRoZXJlLCB3ZSBjYW4gcmVzZXQgdGhlIHRhcmdldCBoZXJlIGFuZCBhdm9pZCBsaXN0IGxvYWRpbmdcblx0XHRcdHRoaXMuc3RpY2t5TWFpbElkID0gbnVsbFxuXHRcdFx0dGhpcy51cGRhdGVVcmwoKVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgZGlzcGxheUV4cGxpY2l0TWFpbFRhcmdldChtYWlsOiBNYWlsKSB7XG5cdFx0YXdhaXQgdGhpcy5yZXNldE9ySW5pdGlhbGl6ZUxpc3QobWFpbC5faWQpXG5cdFx0dGhpcy5jcmVhdGVDb252ZXJzYXRpb25WaWV3TW9kZWwoeyBtYWlsLCBzaG93Rm9sZGVyOiBmYWxzZSB9KVxuXHRcdHRoaXMudXBkYXRlVWkoKVxuXHR9XG5cblx0cHJpdmF0ZSBkaWRTdGlja3lNYWlsQ2hhbmdlKGV4cGVjdGVkSWQ6IElkVHVwbGUsIG1lc3NhZ2U6IHN0cmluZyk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IGNoYW5nZWQgPSAhaXNTYW1lSWQodGhpcy5zdGlja3lNYWlsSWQsIGV4cGVjdGVkSWQpXG5cdFx0aWYgKGNoYW5nZWQpIHtcblx0XHRcdGNvbnNvbGUubG9nKFRBRywgXCJ0YXJnZXQgbWFpbCBpZCBjaGFuZ2VkXCIsIG1lc3NhZ2UsIGV4cGVjdGVkSWQsIHRoaXMuc3RpY2t5TWFpbElkKVxuXHRcdH1cblx0XHRyZXR1cm4gY2hhbmdlZFxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBsb2FkQW5kU2VsZWN0TWFpbChmb2xkZXI6IE1haWxGb2xkZXIsIG1haWxJZDogSWQpIHtcblx0XHRjb25zdCBmb3VuZE1haWwgPSBhd2FpdCB0aGlzLmxpc3RNb2RlbD8ubG9hZEFuZFNlbGVjdChcblx0XHRcdG1haWxJZCxcblx0XHRcdCgpID0+XG5cdFx0XHRcdC8vIGlmIHdlIGNoYW5nZWQgdGhlIGxpc3QsIHN0b3Bcblx0XHRcdFx0dGhpcy5nZXRGb2xkZXIoKSAhPT0gZm9sZGVyIHx8XG5cdFx0XHRcdC8vIGlmIGxpc3RNb2RlbCBpcyBnb25lIGZvciBzb21lIHJlYXNvbiwgc3RvcFxuXHRcdFx0XHQhdGhpcy5saXN0TW9kZWwgfHxcblx0XHRcdFx0Ly8gaWYgdGhlIHRhcmdldCBtYWlsIGhhcyBjaGFuZ2VkLCBzdG9wXG5cdFx0XHRcdHRoaXMubG9hZGluZ1RhcmdldElkICE9PSBtYWlsSWQgfHxcblx0XHRcdFx0Ly8gaWYgd2UgbG9hZGVkIHBhc3QgdGhlIHRhcmdldCBpdGVtIHdlIHdvbid0IGZpbmQgaXQsIHN0b3Bcblx0XHRcdFx0KHRoaXMubGlzdE1vZGVsLml0ZW1zLmxlbmd0aCA+IDAgJiYgZmlyc3RCaWdnZXJUaGFuU2Vjb25kKG1haWxJZCwgZ2V0RWxlbWVudElkKGxhc3RUaHJvdyh0aGlzLmxpc3RNb2RlbC5pdGVtcykpKSksXG5cdFx0KVxuXHRcdGlmIChmb3VuZE1haWwgPT0gbnVsbCkge1xuXHRcdFx0Y29uc29sZS5sb2coXCJkaWQgbm90IGZpbmQgbWFpbFwiLCBmb2xkZXIsIG1haWxJZClcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIGdldEZvbGRlckZvclVzZXJJbmJveCgpOiBQcm9taXNlPE1haWxGb2xkZXI+IHtcblx0XHRjb25zdCBtYWlsYm94RGV0YWlsID0gYXdhaXQgdGhpcy5tYWlsYm94TW9kZWwuZ2V0VXNlck1haWxib3hEZXRhaWxzKClcblx0XHRjb25zdCBmb2xkZXJzID0gYXdhaXQgdGhpcy5tYWlsTW9kZWwuZ2V0TWFpbGJveEZvbGRlcnNGb3JJZChhc3NlcnROb3ROdWxsKG1haWxib3hEZXRhaWwubWFpbGJveC5mb2xkZXJzKS5faWQpXG5cdFx0cmV0dXJuIGFzc2VydFN5c3RlbUZvbGRlck9mVHlwZShmb2xkZXJzLCBNYWlsU2V0S2luZC5JTkJPWClcblx0fVxuXG5cdGluaXQoKSB7XG5cdFx0dGhpcy5zaW5nSW5pdCgpXG5cdFx0Y29uc3QgY29udmVyc2F0aW9uRW5hYmxlZCA9IHRoaXMuY29udmVyc2F0aW9uUHJlZlByb3ZpZGVyLmdldENvbnZlcnNhdGlvblZpZXdTaG93T25seVNlbGVjdGVkTWFpbCgpXG5cdFx0aWYgKHRoaXMuY29udmVyc2F0aW9uVmlld01vZGVsICYmIHRoaXMuY29udmVyc2F0aW9uUHJlZiAhPT0gY29udmVyc2F0aW9uRW5hYmxlZCkge1xuXHRcdFx0Y29uc3QgbWFpbCA9IHRoaXMuY29udmVyc2F0aW9uVmlld01vZGVsLnByaW1hcnlNYWlsXG5cdFx0XHR0aGlzLmNyZWF0ZUNvbnZlcnNhdGlvblZpZXdNb2RlbCh7XG5cdFx0XHRcdG1haWwsXG5cdFx0XHRcdHNob3dGb2xkZXI6IGZhbHNlLFxuXHRcdFx0XHRkZWxheUJvZHlSZW5kZXJpbmdVbnRpbDogUHJvbWlzZS5yZXNvbHZlKCksXG5cdFx0XHR9KVxuXHRcdFx0dGhpcy5tYWlsT3BlbmVkTGlzdGVuZXIub25FbWFpbE9wZW5lZChtYWlsKVxuXHRcdH1cblx0XHR0aGlzLmNvbnZlcnNhdGlvblByZWYgPSBjb252ZXJzYXRpb25FbmFibGVkXG5cdH1cblxuXHRwcml2YXRlIHJlYWRvbmx5IHNpbmdJbml0ID0gbGF6eU1lbW9pemVkKCgpID0+IHtcblx0XHR0aGlzLmV2ZW50Q29udHJvbGxlci5hZGRFbnRpdHlMaXN0ZW5lcigodXBkYXRlcykgPT4gdGhpcy5lbnRpdHlFdmVudHNSZWNlaXZlZCh1cGRhdGVzKSlcblx0fSlcblxuXHRnZXQgbGlzdE1vZGVsKCk6IE1haWxMaXN0TW9kZWwgfCBudWxsIHtcblx0XHRyZXR1cm4gdGhpcy5fZm9sZGVyID8gdGhpcy5saXN0TW9kZWxGb3JGb2xkZXIoZ2V0RWxlbWVudElkKHRoaXMuX2ZvbGRlcikpIDogbnVsbFxuXHR9XG5cblx0Z2V0TWFpbEZvbGRlclRvU2VsZWN0ZWRNYWlsKCk6IFJlYWRvbmx5TWFwPElkLCBJZD4ge1xuXHRcdHJldHVybiB0aGlzLm1haWxGb2xkZXJFbGVtZW50SWRUb1NlbGVjdGVkTWFpbElkXG5cdH1cblxuXHRnZXRGb2xkZXIoKTogTWFpbEZvbGRlciB8IG51bGwge1xuXHRcdHJldHVybiB0aGlzLl9mb2xkZXJcblx0fVxuXG5cdGdldExhYmVsc0Zvck1haWwobWFpbDogTWFpbCk6IFJlYWRvbmx5QXJyYXk8TWFpbEZvbGRlcj4ge1xuXHRcdHJldHVybiB0aGlzLmxpc3RNb2RlbD8uZ2V0TGFiZWxzRm9yTWFpbChtYWlsKSA/PyBbXVxuXHR9XG5cblx0cHJpdmF0ZSBzZXRMaXN0SWQoZm9sZGVyOiBNYWlsRm9sZGVyKSB7XG5cdFx0aWYgKGZvbGRlciA9PT0gdGhpcy5fZm9sZGVyKSB7XG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cdFx0Ly8gQ2FuY2VsIG9sZCBsb2FkIGFsbFxuXHRcdHRoaXMubGlzdE1vZGVsPy5jYW5jZWxMb2FkQWxsKClcblx0XHR0aGlzLl9maWx0ZXJUeXBlID0gbnVsbFxuXG5cdFx0dGhpcy5fZm9sZGVyID0gZm9sZGVyXG5cdFx0dGhpcy5saXN0U3RyZWFtU3Vic2NyaXB0aW9uPy5lbmQodHJ1ZSlcblx0XHR0aGlzLmxpc3RTdHJlYW1TdWJzY3JpcHRpb24gPSB0aGlzLmxpc3RNb2RlbCEuc3RhdGVTdHJlYW0ubWFwKChzdGF0ZSkgPT4gdGhpcy5vbkxpc3RTdGF0ZUNoYW5nZShzdGF0ZSkpXG5cdFx0dGhpcy5saXN0TW9kZWwhLmxvYWRJbml0aWFsKCkudGhlbigoKSA9PiB7XG5cdFx0XHRpZiAodGhpcy5saXN0TW9kZWwgIT0gbnVsbCAmJiB0aGlzLl9mb2xkZXIgPT09IGZvbGRlcikge1xuXHRcdFx0XHR0aGlzLmZpeENvdW50ZXJJZk5lZWRlZChmb2xkZXIsIHRoaXMubGlzdE1vZGVsLml0ZW1zKVxuXHRcdFx0fVxuXHRcdH0pXG5cdH1cblxuXHRnZXRDb252ZXJzYXRpb25WaWV3TW9kZWwoKTogQ29udmVyc2F0aW9uVmlld01vZGVsIHwgbnVsbCB7XG5cdFx0cmV0dXJuIHRoaXMuY29udmVyc2F0aW9uVmlld01vZGVsXG5cdH1cblxuXHRwcml2YXRlIGxpc3RNb2RlbEZvckZvbGRlciA9IG1lbW9pemVkKChfZm9sZGVySWQ6IElkKSA9PiB7XG5cdFx0Ly8gQ2FwdHVyZSBzdGF0ZSB0byBhdm9pZCByYWNlIGNvbmRpdGlvbnMuXG5cdFx0Ly8gV2UgbmVlZCB0byBwb3B1bGF0ZSBtYWlsIHNldCBlbnRyaWVzIGNhY2hlIHdoZW4gbG9hZGluZyBtYWlscyBzbyB0aGF0IHdlIGNhbiByZWFjdCB0byB1cGRhdGVzIGxhdGVyLlxuXHRcdGNvbnN0IGZvbGRlciA9IGFzc2VydE5vdE51bGwodGhpcy5fZm9sZGVyKVxuXHRcdHJldHVybiBuZXcgTWFpbExpc3RNb2RlbChmb2xkZXIsIHRoaXMuY29udmVyc2F0aW9uUHJlZlByb3ZpZGVyLCB0aGlzLmVudGl0eUNsaWVudCwgdGhpcy5tYWlsTW9kZWwsIHRoaXMuaW5ib3hSdWxlSGFuZGxlciwgdGhpcy5jYWNoZVN0b3JhZ2UpXG5cdH0pXG5cblx0cHJpdmF0ZSBmaXhDb3VudGVySWZOZWVkZWQ6IChmb2xkZXI6IE1haWxGb2xkZXIsIGl0ZW1zV2hlbkNhbGxlZDogUmVhZG9ubHlBcnJheTxNYWlsPikgPT4gdm9pZCA9IGRlYm91bmNlKFxuXHRcdDIwMDAsXG5cdFx0YXN5bmMgKGZvbGRlcjogTWFpbEZvbGRlciwgaXRlbXNXaGVuQ2FsbGVkOiBSZWFkb25seUFycmF5PE1haWw+KSA9PiB7XG5cdFx0XHRjb25zdCBvdXJGb2xkZXIgPSB0aGlzLmdldEZvbGRlcigpXG5cdFx0XHRpZiAob3VyRm9sZGVyID09IG51bGwgfHwgKHRoaXMuX2ZpbHRlclR5cGUgIT0gbnVsbCAmJiB0aGlzLmZpbHRlclR5cGUgIT09IE1haWxGaWx0ZXJUeXBlLlVucmVhZCkpIHtcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHR9XG5cblx0XHRcdC8vIElmIGZvbGRlcnMgYXJlIGNoYW5nZWQsIGxpc3Qgd29uJ3QgaGF2ZSB0aGUgZGF0YSB3ZSBuZWVkLlxuXHRcdFx0Ly8gRG8gbm90IHJlbHkgb24gY291bnRlcnMgaWYgd2UgYXJlIG5vdCBjb25uZWN0ZWRcblx0XHRcdGlmICghaXNTYW1lSWQoZ2V0RWxlbWVudElkKG91ckZvbGRlciksIGdldEVsZW1lbnRJZChmb2xkZXIpKSB8fCB0aGlzLmNvbm5lY3Rpdml0eU1vZGVsLndzQ29ubmVjdGlvbigpKCkgIT09IFdzQ29ubmVjdGlvblN0YXRlLmNvbm5lY3RlZCkge1xuXHRcdFx0XHRyZXR1cm5cblx0XHRcdH1cblxuXHRcdFx0Ly8gSWYgbGlzdCB3YXMgbW9kaWZpZWQgaW4gdGhlIG1lYW50aW1lLCB3ZSBjYW5ub3QgYmUgc3VyZSB0aGF0IHdlIHdpbGwgZml4IGNvdW50ZXJzIGNvcnJlY3RseSAoZS5nLiBiZWNhdXNlIG9mIHRoZSBpbmJveCBydWxlcylcblx0XHRcdGlmICh0aGlzLmxpc3RNb2RlbD8uaXRlbXMgIT09IGl0ZW1zV2hlbkNhbGxlZCkge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhgbGlzdCBjaGFuZ2VkLCB0cnlpbmcgYWdhaW4gbGF0ZXJgKVxuXHRcdFx0XHRyZXR1cm4gdGhpcy5maXhDb3VudGVySWZOZWVkZWQoZm9sZGVyLCB0aGlzLmxpc3RNb2RlbD8uaXRlbXMgPz8gW10pXG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IHVucmVhZE1haWxzQ291bnQgPSBjb3VudCh0aGlzLmxpc3RNb2RlbC5pdGVtcywgKGUpID0+IGUudW5yZWFkKVxuXG5cdFx0XHRjb25zdCBjb3VudGVyVmFsdWUgPSBhd2FpdCB0aGlzLm1haWxNb2RlbC5nZXRDb3VudGVyVmFsdWUoZm9sZGVyKVxuXHRcdFx0aWYgKGNvdW50ZXJWYWx1ZSAhPSBudWxsICYmIGNvdW50ZXJWYWx1ZSAhPT0gdW5yZWFkTWFpbHNDb3VudCkge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhgZml4aW5nIHVwIGNvdW50ZXIgZm9yIGZvbGRlciAke2ZvbGRlci5faWR9YClcblx0XHRcdFx0YXdhaXQgdGhpcy5tYWlsTW9kZWwuZml4dXBDb3VudGVyRm9yRm9sZGVyKGZvbGRlciwgdW5yZWFkTWFpbHNDb3VudClcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGBzYW1lIGNvdW50ZXIsIG5vIGZpeHVwIG9uIGZvbGRlciAke2ZvbGRlci5faWR9YClcblx0XHRcdH1cblx0XHR9LFxuXHQpXG5cblx0cHJpdmF0ZSBvbkxpc3RTdGF0ZUNoYW5nZShuZXdTdGF0ZTogTGlzdFN0YXRlPE1haWw+KSB7XG5cdFx0Ly8gSWYgd2UgYXJlIGFscmVhZHkgZGlzcGxheWluZyBzdGlja3kgbWFpbCBqdXN0IGxlYXZlIGl0IGFsb25lLCBubyBtYXR0ZXIgd2hhdCdzIGhhcHBlbmluZyB0byB0aGUgbGlzdC5cblx0XHQvLyBVc2VyIGFjdGlvbnMgYW5kIFVSTCB1cGRhdGVkIGRvIHJlc2V0IHN0aWNreSBtYWlsIGlkLlxuXHRcdGNvbnN0IGRpc3BsYXllZE1haWxJZCA9IHRoaXMuY29udmVyc2F0aW9uVmlld01vZGVsPy5wcmltYXJ5Vmlld01vZGVsKCk/Lm1haWwuX2lkXG5cdFx0aWYgKCEoZGlzcGxheWVkTWFpbElkICYmIGlzU2FtZUlkKGRpc3BsYXllZE1haWxJZCwgdGhpcy5zdGlja3lNYWlsSWQpKSkge1xuXHRcdFx0Y29uc3QgdGFyZ2V0SXRlbSA9IHRoaXMuc3RpY2t5TWFpbElkXG5cdFx0XHRcdD8gbmV3U3RhdGUuaXRlbXMuZmluZCgoaXRlbSkgPT4gaXNTYW1lSWQodGhpcy5zdGlja3lNYWlsSWQsIGl0ZW0uX2lkKSlcblx0XHRcdFx0OiAhbmV3U3RhdGUuaW5NdWx0aXNlbGVjdCAmJiBuZXdTdGF0ZS5zZWxlY3RlZEl0ZW1zLnNpemUgPT09IDFcblx0XHRcdFx0PyBmaXJzdCh0aGlzLmxpc3RNb2RlbCEuZ2V0U2VsZWN0ZWRBc0FycmF5KCkpXG5cdFx0XHRcdDogbnVsbFxuXHRcdFx0aWYgKHRhcmdldEl0ZW0gIT0gbnVsbCkge1xuXHRcdFx0XHQvLyBBbHdheXMgd3JpdGUgdGhlIHRhcmdldEl0ZW0gaW4gY2FzZSBpdCB3YXMgbm90IHdyaXR0ZW4gYmVmb3JlIGJ1dCBhbHJlYWR5IGJlaW5nIGRpc3BsYXllZCAoc3RpY2t5IG1haWwpXG5cdFx0XHRcdHRoaXMubWFpbEZvbGRlckVsZW1lbnRJZFRvU2VsZWN0ZWRNYWlsSWQgPSBtYXBXaXRoKFxuXHRcdFx0XHRcdHRoaXMubWFpbEZvbGRlckVsZW1lbnRJZFRvU2VsZWN0ZWRNYWlsSWQsXG5cdFx0XHRcdFx0Z2V0RWxlbWVudElkKGFzc2VydE5vdE51bGwodGhpcy5nZXRGb2xkZXIoKSkpLFxuXHRcdFx0XHRcdGdldEVsZW1lbnRJZCh0YXJnZXRJdGVtKSxcblx0XHRcdFx0KVxuXHRcdFx0XHRpZiAoIXRoaXMuY29udmVyc2F0aW9uVmlld01vZGVsIHx8ICFpc1NhbWVJZCh0aGlzLmNvbnZlcnNhdGlvblZpZXdNb2RlbD8ucHJpbWFyeU1haWwuX2lkLCB0YXJnZXRJdGVtLl9pZCkpIHtcblx0XHRcdFx0XHR0aGlzLmNyZWF0ZUNvbnZlcnNhdGlvblZpZXdNb2RlbCh7XG5cdFx0XHRcdFx0XHRtYWlsOiB0YXJnZXRJdGVtLFxuXHRcdFx0XHRcdFx0c2hvd0ZvbGRlcjogZmFsc2UsXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHR0aGlzLm1haWxPcGVuZWRMaXN0ZW5lci5vbkVtYWlsT3BlbmVkKHRhcmdldEl0ZW0pXG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuY29udmVyc2F0aW9uVmlld01vZGVsPy5kaXNwb3NlKClcblx0XHRcdFx0dGhpcy5jb252ZXJzYXRpb25WaWV3TW9kZWwgPSBudWxsXG5cdFx0XHRcdHRoaXMubWFpbEZvbGRlckVsZW1lbnRJZFRvU2VsZWN0ZWRNYWlsSWQgPSBtYXBXaXRob3V0KHRoaXMubWFpbEZvbGRlckVsZW1lbnRJZFRvU2VsZWN0ZWRNYWlsSWQsIGdldEVsZW1lbnRJZChhc3NlcnROb3ROdWxsKHRoaXMuZ2V0Rm9sZGVyKCkpKSlcblx0XHRcdH1cblx0XHR9XG5cdFx0dGhpcy51cGRhdGVVcmwoKVxuXHRcdHRoaXMudXBkYXRlVWkoKVxuXHR9XG5cblx0cHJpdmF0ZSB1cGRhdGVVcmwoKSB7XG5cdFx0Y29uc3QgZm9sZGVyID0gdGhpcy5fZm9sZGVyXG5cdFx0Y29uc3QgZm9sZGVySWQgPSBmb2xkZXIgPyBnZXRFbGVtZW50SWQoZm9sZGVyKSA6IG51bGxcblx0XHQvLyBJZiB3ZSBhcmUgbG9hZGluZyB0b3dhcmRzIGFuIGVtYWlsIHdlIHdhbnQgdG8ga2VlcCBpdCBpbiB0aGUgVVJMLCBvdGhlcndpc2Ugd2Ugd2lsbCByZXNldCBpdC5cblx0XHQvLyBPdGhlcndpc2UsIGlmIHdlIGhhdmUgYSBzaW5nbGUgc2VsZWN0ZWQgZW1haWwgdGhlbiB0aGF0IHNob3VsZCBiZSBpbiB0aGUgVVJMLlxuXHRcdGNvbnN0IG1haWxJZCA9IHRoaXMubG9hZGluZ1RhcmdldElkID8/IChmb2xkZXJJZCA/IHRoaXMuZ2V0TWFpbEZvbGRlclRvU2VsZWN0ZWRNYWlsKCkuZ2V0KGZvbGRlcklkKSA6IG51bGwpXG5cdFx0Y29uc3Qgc3RpY2t5TWFpbCA9IHRoaXMuc3RpY2t5TWFpbElkXG5cblx0XHRpZiAobWFpbElkICE9IG51bGwpIHtcblx0XHRcdHRoaXMucm91dGVyLnJvdXRlVG8oXG5cdFx0XHRcdFwiL21haWwvOmZvbGRlcklkLzptYWlsSWRcIixcblx0XHRcdFx0dGhpcy5hZGRTdGlja3lNYWlsUGFyYW0oe1xuXHRcdFx0XHRcdGZvbGRlcklkLFxuXHRcdFx0XHRcdG1haWxJZCxcblx0XHRcdFx0XHRtYWlsOiBzdGlja3lNYWlsLFxuXHRcdFx0XHR9KSxcblx0XHRcdClcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5yb3V0ZXIucm91dGVUbyhcIi9tYWlsLzpmb2xkZXJJZFwiLCB0aGlzLmFkZFN0aWNreU1haWxQYXJhbSh7IGZvbGRlcklkOiBmb2xkZXJJZCA/PyBcIlwiIH0pKVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgYWRkU3RpY2t5TWFpbFBhcmFtKHBhcmFtczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiB0eXBlb2YgcGFyYW1zIHtcblx0XHRpZiAodGhpcy5zdGlja3lNYWlsSWQpIHtcblx0XHRcdHBhcmFtcy5tYWlsID0gdGhpcy5zdGlja3lNYWlsSWQuam9pbihcIixcIilcblx0XHR9XG5cdFx0cmV0dXJuIHBhcmFtc1xuXHR9XG5cblx0cHJpdmF0ZSBjcmVhdGVDb252ZXJzYXRpb25WaWV3TW9kZWwodmlld01vZGVsUGFyYW1zOiBDcmVhdGVNYWlsVmlld2VyT3B0aW9ucykge1xuXHRcdHRoaXMuY29udmVyc2F0aW9uVmlld01vZGVsPy5kaXNwb3NlKClcblx0XHR0aGlzLmNvbnZlcnNhdGlvblZpZXdNb2RlbCA9IHRoaXMuY29udmVyc2F0aW9uVmlld01vZGVsRmFjdG9yeSh2aWV3TW9kZWxQYXJhbXMpXG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIGVudGl0eUV2ZW50c1JlY2VpdmVkKHVwZGF0ZXM6IFJlYWRvbmx5QXJyYXk8RW50aXR5VXBkYXRlRGF0YT4pIHtcblx0XHQvLyBjYXB0dXJpbmcgdGhlIHN0YXRlIHNvIHRoYXQgaWYgd2Ugc3dpdGNoIGZvbGRlcnMgd2Ugd29uJ3QgcnVuIGludG8gcmFjZSBjb25kaXRpb25zXG5cdFx0Y29uc3QgZm9sZGVyID0gdGhpcy5fZm9sZGVyXG5cdFx0Y29uc3QgbGlzdE1vZGVsID0gdGhpcy5saXN0TW9kZWxcblxuXHRcdGlmICghZm9sZGVyIHx8ICFsaXN0TW9kZWwpIHtcblx0XHRcdHJldHVyblxuXHRcdH1cblxuXHRcdGxldCBpbXBvcnRNYWlsU3RhdGVVcGRhdGVzOiBBcnJheTxFbnRpdHlVcGRhdGVEYXRhPiA9IFtdXG5cdFx0Zm9yIChjb25zdCB1cGRhdGUgb2YgdXBkYXRlcykge1xuXHRcdFx0aWYgKGlzVXBkYXRlRm9yVHlwZVJlZihNYWlsU2V0RW50cnlUeXBlUmVmLCB1cGRhdGUpICYmIGlzU2FtZUlkKGZvbGRlci5lbnRyaWVzLCB1cGRhdGUuaW5zdGFuY2VMaXN0SWQpKSB7XG5cdFx0XHRcdGlmICh1cGRhdGUub3BlcmF0aW9uID09PSBPcGVyYXRpb25UeXBlLkRFTEVURSAmJiB0aGlzLnN0aWNreU1haWxJZCAhPSBudWxsKSB7XG5cdFx0XHRcdFx0Y29uc3QgeyBtYWlsSWQgfSA9IGRlY29uc3RydWN0TWFpbFNldEVudHJ5SWQodXBkYXRlLmluc3RhbmNlSWQpXG5cdFx0XHRcdFx0aWYgKGlzU2FtZUlkKG1haWxJZCwgZWxlbWVudElkUGFydCh0aGlzLnN0aWNreU1haWxJZCkpKSB7XG5cdFx0XHRcdFx0XHQvLyBSZXNldCB0YXJnZXQgYmVmb3JlIHdlIGRpc3BhdGNoIGV2ZW50IHRvIHRoZSBsaXN0IHNvIHRoYXQgb3VyIGhhbmRsZXIgaW4gb25MaXN0U3RhdGVDaGFuZ2UoKSBoYXMgdXAtdG8tZGF0ZSBzdGF0ZS5cblx0XHRcdFx0XHRcdHRoaXMuc3RpY2t5TWFpbElkID0gbnVsbFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChcblx0XHRcdFx0aXNVcGRhdGVGb3JUeXBlUmVmKEltcG9ydE1haWxTdGF0ZVR5cGVSZWYsIHVwZGF0ZSkgJiZcblx0XHRcdFx0KHVwZGF0ZS5vcGVyYXRpb24gPT0gT3BlcmF0aW9uVHlwZS5DUkVBVEUgfHwgdXBkYXRlLm9wZXJhdGlvbiA9PSBPcGVyYXRpb25UeXBlLlVQREFURSlcblx0XHRcdCkge1xuXHRcdFx0XHRpbXBvcnRNYWlsU3RhdGVVcGRhdGVzLnB1c2godXBkYXRlKVxuXHRcdFx0fVxuXG5cdFx0XHRhd2FpdCBsaXN0TW9kZWwuaGFuZGxlRW50aXR5VXBkYXRlKHVwZGF0ZSlcblx0XHRcdGF3YWl0IHByb21pc2VNYXAoaW1wb3J0TWFpbFN0YXRlVXBkYXRlcywgKHVwZGF0ZSkgPT4gdGhpcy5wcm9jZXNzSW1wb3J0ZWRNYWlscyh1cGRhdGUpKVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgcHJvY2Vzc0ltcG9ydGVkTWFpbHModXBkYXRlOiBFbnRpdHlVcGRhdGVEYXRhKSB7XG5cdFx0Y29uc3QgaW1wb3J0TWFpbFN0YXRlID0gYXdhaXQgdGhpcy5lbnRpdHlDbGllbnQubG9hZChJbXBvcnRNYWlsU3RhdGVUeXBlUmVmLCBbdXBkYXRlLmluc3RhbmNlTGlzdElkLCB1cGRhdGUuaW5zdGFuY2VJZF0pXG5cdFx0Y29uc3QgaW1wb3J0ZWRGb2xkZXIgPSBhd2FpdCB0aGlzLmVudGl0eUNsaWVudC5sb2FkKE1haWxGb2xkZXJUeXBlUmVmLCBpbXBvcnRNYWlsU3RhdGUudGFyZ2V0Rm9sZGVyKVxuXHRcdGNvbnN0IGxpc3RNb2RlbE9mSW1wb3J0ID0gdGhpcy5saXN0TW9kZWxGb3JGb2xkZXIoZWxlbWVudElkUGFydChpbXBvcnRNYWlsU3RhdGUudGFyZ2V0Rm9sZGVyKSlcblxuXHRcdGxldCBzdGF0dXMgPSBwYXJzZUludChpbXBvcnRNYWlsU3RhdGUuc3RhdHVzKSBhcyBJbXBvcnRTdGF0dXNcblx0XHRpZiAoc3RhdHVzID09PSBJbXBvcnRTdGF0dXMuRmluaXNoZWQgfHwgc3RhdHVzID09PSBJbXBvcnRTdGF0dXMuQ2FuY2VsZWQpIHtcblx0XHRcdGxldCBpbXBvcnRlZE1haWxFbnRyaWVzID0gYXdhaXQgdGhpcy5lbnRpdHlDbGllbnQubG9hZEFsbChJbXBvcnRlZE1haWxUeXBlUmVmLCBpbXBvcnRNYWlsU3RhdGUuaW1wb3J0ZWRNYWlscylcblx0XHRcdGlmIChpc0VtcHR5KGltcG9ydGVkTWFpbEVudHJpZXMpKSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcblxuXHRcdFx0bGV0IG1haWxTZXRFbnRyeUlkcyA9IGltcG9ydGVkTWFpbEVudHJpZXMubWFwKChpbXBvcnRlZE1haWwpID0+IGVsZW1lbnRJZFBhcnQoaW1wb3J0ZWRNYWlsLm1haWxTZXRFbnRyeSkpXG5cdFx0XHRjb25zdCBtYWlsU2V0RW50cnlMaXN0SWQgPSBsaXN0SWRQYXJ0KGltcG9ydGVkTWFpbEVudHJpZXNbMF0ubWFpbFNldEVudHJ5KVxuXHRcdFx0Y29uc3QgaW1wb3J0ZWRNYWlsU2V0RW50cmllcyA9IGF3YWl0IHRoaXMuZW50aXR5Q2xpZW50LmxvYWRNdWx0aXBsZShNYWlsU2V0RW50cnlUeXBlUmVmLCBtYWlsU2V0RW50cnlMaXN0SWQsIG1haWxTZXRFbnRyeUlkcylcblx0XHRcdGlmIChpc0VtcHR5KGltcG9ydGVkTWFpbFNldEVudHJpZXMpKSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcblxuXHRcdFx0Ly8gcHV0IG1haWxzIGludG8gY2FjaGUgYmVmb3JlIGxpc3QgbW9kZWwgd2lsbCBkb3dubG9hZCB0aGVtIG9uZSBieSBvbmVcblx0XHRcdGF3YWl0IHRoaXMucHJlbG9hZE1haWxzKGltcG9ydGVkTWFpbFNldEVudHJpZXMpXG5cdFx0XHRhd2FpdCBwcm9taXNlTWFwKGltcG9ydGVkTWFpbFNldEVudHJpZXMsIChpbXBvcnRlZE1haWxTZXRFbnRyeSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gbGlzdE1vZGVsT2ZJbXBvcnQuaGFuZGxlRW50aXR5VXBkYXRlKHtcblx0XHRcdFx0XHRpbnN0YW5jZUlkOiBlbGVtZW50SWRQYXJ0KGltcG9ydGVkTWFpbFNldEVudHJ5Ll9pZCksXG5cdFx0XHRcdFx0aW5zdGFuY2VMaXN0SWQ6IGltcG9ydGVkRm9sZGVyLmVudHJpZXMsXG5cdFx0XHRcdFx0b3BlcmF0aW9uOiBPcGVyYXRpb25UeXBlLkNSRUFURSxcblx0XHRcdFx0XHR0eXBlOiBNYWlsU2V0RW50cnlUeXBlUmVmLnR5cGUsXG5cdFx0XHRcdFx0YXBwbGljYXRpb246IE1haWxTZXRFbnRyeVR5cGVSZWYuYXBwLFxuXHRcdFx0XHR9KVxuXHRcdFx0fSlcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIHByZWxvYWRNYWlscyhpbXBvcnRlZE1haWxTZXRFbnRyaWVzOiBNYWlsU2V0RW50cnlbXSkge1xuXHRcdGNvbnN0IG1haWxJZHMgPSBpbXBvcnRlZE1haWxTZXRFbnRyaWVzLm1hcCgobXNlKSA9PiBtc2UubWFpbClcblx0XHRjb25zdCBtYWlsc0J5TGlzdCA9IGdyb3VwQnkobWFpbElkcywgKG0pID0+IGxpc3RJZFBhcnQobSkpXG5cdFx0Zm9yIChjb25zdCBbbGlzdElkLCBtYWlsSWRzXSBvZiBtYWlsc0J5TGlzdC5lbnRyaWVzKCkpIHtcblx0XHRcdGNvbnN0IG1haWxFbGVtZW50SWRzID0gbWFpbElkcy5tYXAoKG0pID0+IGVsZW1lbnRJZFBhcnQobSkpXG5cdFx0XHRhd2FpdCB0aGlzLmVudGl0eUNsaWVudC5sb2FkTXVsdGlwbGUoTWFpbFR5cGVSZWYsIGxpc3RJZCwgbWFpbEVsZW1lbnRJZHMpXG5cdFx0fVxuXHR9XG5cblx0YXN5bmMgc3dpdGNoVG9Gb2xkZXIoZm9sZGVyVHlwZTogT21pdDxNYWlsU2V0S2luZCwgTWFpbFNldEtpbmQuQ1VTVE9NPik6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IHN0YXRlID0ge31cblx0XHR0aGlzLmN1cnJlbnRTaG93VGFyZ2V0TWFya2VyID0gc3RhdGVcblx0XHRjb25zdCBtYWlsYm94RGV0YWlsID0gYXNzZXJ0Tm90TnVsbChhd2FpdCB0aGlzLmdldE1haWxib3hEZXRhaWxzKCkpXG5cdFx0aWYgKHRoaXMuY3VycmVudFNob3dUYXJnZXRNYXJrZXIgIT09IHN0YXRlKSB7XG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cdFx0aWYgKG1haWxib3hEZXRhaWwgPT0gbnVsbCB8fCBtYWlsYm94RGV0YWlsLm1haWxib3guZm9sZGVycyA9PSBudWxsKSB7XG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cdFx0Y29uc3QgZm9sZGVycyA9IGF3YWl0IHRoaXMubWFpbE1vZGVsLmdldE1haWxib3hGb2xkZXJzRm9ySWQobWFpbGJveERldGFpbC5tYWlsYm94LmZvbGRlcnMuX2lkKVxuXHRcdGlmICh0aGlzLmN1cnJlbnRTaG93VGFyZ2V0TWFya2VyICE9PSBzdGF0ZSkge1xuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXHRcdGNvbnN0IGZvbGRlciA9IGFzc2VydFN5c3RlbUZvbGRlck9mVHlwZShmb2xkZXJzLCBmb2xkZXJUeXBlKVxuXHRcdGF3YWl0IHRoaXMuc2hvd01haWwoZm9sZGVyLCB0aGlzLm1haWxGb2xkZXJFbGVtZW50SWRUb1NlbGVjdGVkTWFpbElkLmdldChnZXRFbGVtZW50SWQoZm9sZGVyKSkpXG5cdH1cblxuXHRhc3luYyBnZXRNYWlsYm94RGV0YWlscygpOiBQcm9taXNlPE1haWxib3hEZXRhaWw+IHtcblx0XHRjb25zdCBmb2xkZXIgPSB0aGlzLmdldEZvbGRlcigpXG5cdFx0cmV0dXJuIGF3YWl0IHRoaXMubWFpbGJveERldGFpbEZvckxpc3RXaXRoRmFsbGJhY2soZm9sZGVyKVxuXHR9XG5cblx0YXN5bmMgc2hvd2luZ0RyYWZ0c0ZvbGRlcigpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRpZiAoIXRoaXMuX2ZvbGRlcikgcmV0dXJuIGZhbHNlXG5cdFx0Y29uc3QgbWFpbGJveERldGFpbCA9IGF3YWl0IHRoaXMubWFpbE1vZGVsLmdldE1haWxib3hEZXRhaWxzRm9yTWFpbEZvbGRlcih0aGlzLl9mb2xkZXIpXG5cdFx0Y29uc3Qgc2VsZWN0ZWRGb2xkZXIgPSB0aGlzLmdldEZvbGRlcigpXG5cdFx0aWYgKHNlbGVjdGVkRm9sZGVyICYmIG1haWxib3hEZXRhaWwgJiYgbWFpbGJveERldGFpbC5tYWlsYm94LmZvbGRlcnMpIHtcblx0XHRcdGNvbnN0IGZvbGRlcnMgPSBhd2FpdCB0aGlzLm1haWxNb2RlbC5nZXRNYWlsYm94Rm9sZGVyc0ZvcklkKG1haWxib3hEZXRhaWwubWFpbGJveC5mb2xkZXJzLl9pZClcblx0XHRcdHJldHVybiBpc09mVHlwZU9yU3ViZm9sZGVyT2YoZm9sZGVycywgc2VsZWN0ZWRGb2xkZXIsIE1haWxTZXRLaW5kLkRSQUZUKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHR9XG5cdH1cblxuXHRhc3luYyBzaG93aW5nVHJhc2hPclNwYW1Gb2xkZXIoKTogUHJvbWlzZTxib29sZWFuPiB7XG5cdFx0Y29uc3QgZm9sZGVyID0gdGhpcy5nZXRGb2xkZXIoKVxuXHRcdGlmIChmb2xkZXIpIHtcblx0XHRcdGNvbnN0IG1haWxib3hEZXRhaWwgPSBhd2FpdCB0aGlzLm1haWxNb2RlbC5nZXRNYWlsYm94RGV0YWlsc0Zvck1haWxGb2xkZXIoZm9sZGVyKVxuXHRcdFx0aWYgKGZvbGRlciAmJiBtYWlsYm94RGV0YWlsICYmIG1haWxib3hEZXRhaWwubWFpbGJveC5mb2xkZXJzKSB7XG5cdFx0XHRcdGNvbnN0IGZvbGRlcnMgPSBhd2FpdCB0aGlzLm1haWxNb2RlbC5nZXRNYWlsYm94Rm9sZGVyc0ZvcklkKG1haWxib3hEZXRhaWwubWFpbGJveC5mb2xkZXJzLl9pZClcblx0XHRcdFx0cmV0dXJuIGlzU3BhbU9yVHJhc2hGb2xkZXIoZm9sZGVycywgZm9sZGVyKVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2Vcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgbWFpbGJveERldGFpbEZvckxpc3RXaXRoRmFsbGJhY2soZm9sZGVyPzogTWFpbEZvbGRlciB8IG51bGwpIHtcblx0XHRjb25zdCBtYWlsYm94RGV0YWlsRm9yTGlzdElkID0gZm9sZGVyID8gYXdhaXQgdGhpcy5tYWlsTW9kZWwuZ2V0TWFpbGJveERldGFpbHNGb3JNYWlsRm9sZGVyKGZvbGRlcikgOiBudWxsXG5cdFx0cmV0dXJuIG1haWxib3hEZXRhaWxGb3JMaXN0SWQgPz8gKGF3YWl0IHRoaXMubWFpbGJveE1vZGVsLmdldFVzZXJNYWlsYm94RGV0YWlscygpKVxuXHR9XG5cblx0YXN5bmMgZmluYWxseURlbGV0ZUFsbE1haWxzSW5TZWxlY3RlZEZvbGRlcihmb2xkZXI6IE1haWxGb2xkZXIpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHQvLyByZW1vdmUgYW55IHNlbGVjdGlvbiB0byBhdm9pZCB0aGF0IHRoZSBuZXh0IG1haWwgaXMgbG9hZGVkIGFuZCBzZWxlY3RlZCBmb3IgZWFjaCBkZWxldGVkIG1haWwgZXZlbnRcblx0XHR0aGlzLmxpc3RNb2RlbD8uc2VsZWN0Tm9uZSgpXG5cblx0XHRjb25zdCBtYWlsYm94RGV0YWlsID0gYXdhaXQgdGhpcy5nZXRNYWlsYm94RGV0YWlscygpXG5cblx0XHQvLyB0aGUgcmVxdWVzdCBpcyBoYW5kbGVkIGEgbGl0dGxlIGRpZmZlcmVudGx5IGlmIGl0IGlzIHRoZSBzeXN0ZW0gZm9sZGVyIHZzIGEgc3ViZm9sZGVyXG5cdFx0aWYgKGZvbGRlci5mb2xkZXJUeXBlID09PSBNYWlsU2V0S2luZC5UUkFTSCB8fCBmb2xkZXIuZm9sZGVyVHlwZSA9PT0gTWFpbFNldEtpbmQuU1BBTSkge1xuXHRcdFx0cmV0dXJuIHRoaXMubWFpbE1vZGVsLmNsZWFyRm9sZGVyKGZvbGRlcikuY2F0Y2goXG5cdFx0XHRcdG9mQ2xhc3MoUHJlY29uZGl0aW9uRmFpbGVkRXJyb3IsICgpID0+IHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgVXNlckVycm9yKFwib3BlcmF0aW9uU3RpbGxBY3RpdmVfbXNnXCIpXG5cdFx0XHRcdH0pLFxuXHRcdFx0KVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBmb2xkZXJzID0gYXdhaXQgdGhpcy5tYWlsTW9kZWwuZ2V0TWFpbGJveEZvbGRlcnNGb3JJZChhc3NlcnROb3ROdWxsKG1haWxib3hEZXRhaWwubWFpbGJveC5mb2xkZXJzKS5faWQpXG5cdFx0XHRpZiAoaXNTdWJmb2xkZXJPZlR5cGUoZm9sZGVycywgZm9sZGVyLCBNYWlsU2V0S2luZC5UUkFTSCkgfHwgaXNTdWJmb2xkZXJPZlR5cGUoZm9sZGVycywgZm9sZGVyLCBNYWlsU2V0S2luZC5TUEFNKSkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5tYWlsTW9kZWwuZmluYWxseURlbGV0ZUN1c3RvbU1haWxGb2xkZXIoZm9sZGVyKS5jYXRjaChcblx0XHRcdFx0XHRvZkNsYXNzKFByZWNvbmRpdGlvbkZhaWxlZEVycm9yLCAoKSA9PiB7XG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgVXNlckVycm9yKFwib3BlcmF0aW9uU3RpbGxBY3RpdmVfbXNnXCIpXG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdClcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRocm93IG5ldyBQcm9ncmFtbWluZ0Vycm9yKGBDYW5ub3QgZGVsZXRlIG1haWxzIGluIGZvbGRlciAke1N0cmluZyhmb2xkZXIuX2lkKX0gd2l0aCB0eXBlICR7Zm9sZGVyLmZvbGRlclR5cGV9YClcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRvblNpbmdsZVNlbGVjdGlvbihtYWlsOiBNYWlsKSB7XG5cdFx0dGhpcy5zdGlja3lNYWlsSWQgPSBudWxsXG5cdFx0dGhpcy5sb2FkaW5nVGFyZ2V0SWQgPSBudWxsXG5cdFx0dGhpcy5saXN0TW9kZWw/Lm9uU2luZ2xlU2VsZWN0aW9uKG1haWwpXG5cdH1cblxuXHRhcmVBbGxTZWxlY3RlZCgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5saXN0TW9kZWw/LmFyZUFsbFNlbGVjdGVkKCkgPz8gZmFsc2Vcblx0fVxuXG5cdHNlbGVjdE5vbmUoKTogdm9pZCB7XG5cdFx0dGhpcy5zdGlja3lNYWlsSWQgPSBudWxsXG5cdFx0dGhpcy5sb2FkaW5nVGFyZ2V0SWQgPSBudWxsXG5cdFx0dGhpcy5saXN0TW9kZWw/LnNlbGVjdE5vbmUoKVxuXHR9XG5cblx0c2VsZWN0QWxsKCk6IHZvaWQge1xuXHRcdHRoaXMuc3RpY2t5TWFpbElkID0gbnVsbFxuXHRcdHRoaXMubG9hZGluZ1RhcmdldElkID0gbnVsbFxuXHRcdHRoaXMubGlzdE1vZGVsPy5zZWxlY3RBbGwoKVxuXHR9XG5cblx0b25TaW5nbGVJbmNsdXNpdmVTZWxlY3Rpb24obWFpbDogTWFpbCwgY2xlYXJTZWxlY3Rpb25Pbk11bHRpU2VsZWN0U3RhcnQ/OiBib29sZWFuKSB7XG5cdFx0dGhpcy5zdGlja3lNYWlsSWQgPSBudWxsXG5cdFx0dGhpcy5sb2FkaW5nVGFyZ2V0SWQgPSBudWxsXG5cdFx0dGhpcy5saXN0TW9kZWw/Lm9uU2luZ2xlSW5jbHVzaXZlU2VsZWN0aW9uKG1haWwsIGNsZWFyU2VsZWN0aW9uT25NdWx0aVNlbGVjdFN0YXJ0KVxuXHR9XG5cblx0b25SYW5nZVNlbGVjdGlvblRvd2FyZHMobWFpbDogTWFpbCkge1xuXHRcdHRoaXMuc3RpY2t5TWFpbElkID0gbnVsbFxuXHRcdHRoaXMubG9hZGluZ1RhcmdldElkID0gbnVsbFxuXHRcdHRoaXMubGlzdE1vZGVsPy5zZWxlY3RSYW5nZVRvd2FyZHMobWFpbClcblx0fVxuXG5cdHNlbGVjdFByZXZpb3VzKG11bHRpc2VsZWN0OiBib29sZWFuKSB7XG5cdFx0dGhpcy5zdGlja3lNYWlsSWQgPSBudWxsXG5cdFx0dGhpcy5sb2FkaW5nVGFyZ2V0SWQgPSBudWxsXG5cdFx0dGhpcy5saXN0TW9kZWw/LnNlbGVjdFByZXZpb3VzKG11bHRpc2VsZWN0KVxuXHR9XG5cblx0c2VsZWN0TmV4dChtdWx0aXNlbGVjdDogYm9vbGVhbikge1xuXHRcdHRoaXMuc3RpY2t5TWFpbElkID0gbnVsbFxuXHRcdHRoaXMubG9hZGluZ1RhcmdldElkID0gbnVsbFxuXHRcdHRoaXMubGlzdE1vZGVsPy5zZWxlY3ROZXh0KG11bHRpc2VsZWN0KVxuXHR9XG5cblx0b25TaW5nbGVFeGNsdXNpdmVTZWxlY3Rpb24obWFpbDogTWFpbCkge1xuXHRcdHRoaXMuc3RpY2t5TWFpbElkID0gbnVsbFxuXHRcdHRoaXMubG9hZGluZ1RhcmdldElkID0gbnVsbFxuXHRcdHRoaXMubGlzdE1vZGVsPy5vblNpbmdsZUV4Y2x1c2l2ZVNlbGVjdGlvbihtYWlsKVxuXHR9XG5cblx0YXN5bmMgY3JlYXRlTGFiZWwobWFpbGJveDogTWFpbEJveCwgbGFiZWxEYXRhOiB7IG5hbWU6IHN0cmluZzsgY29sb3I6IHN0cmluZyB9KSB7XG5cdFx0YXdhaXQgdGhpcy5tYWlsTW9kZWwuY3JlYXRlTGFiZWwoYXNzZXJ0Tm90TnVsbChtYWlsYm94Ll9vd25lckdyb3VwKSwgbGFiZWxEYXRhKVxuXHR9XG5cblx0YXN5bmMgZWRpdExhYmVsKGxhYmVsOiBNYWlsRm9sZGVyLCBuZXdEYXRhOiB7IG5hbWU6IHN0cmluZzsgY29sb3I6IHN0cmluZyB9KSB7XG5cdFx0YXdhaXQgdGhpcy5tYWlsTW9kZWwudXBkYXRlTGFiZWwobGFiZWwsIG5ld0RhdGEpXG5cdH1cblxuXHRhc3luYyBkZWxldGVMYWJlbChsYWJlbDogTWFpbEZvbGRlcikge1xuXHRcdGF3YWl0IHRoaXMubWFpbE1vZGVsLmRlbGV0ZUxhYmVsKGxhYmVsKVxuXHR9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBeUJBLGtCQUFrQjtJQWdCTCxnQkFBTixNQUFvQjtDQUUxQixBQUFpQjtDQUdqQixBQUFpQixVQUErQixJQUFJO0NBRXBELFlBQ2tCQSxTQUNBQywwQkFDQUMsY0FDQUMsV0FDQUMsa0JBQ0FDLGNBQ2hCO0VBb1hGLEtBMVhrQjtFQTBYakIsS0F6WGlCO0VBeVhoQixLQXhYZ0I7RUF3WGYsS0F2WGU7RUF1WGQsS0F0WGM7RUFzWGIsS0FyWGE7QUFFakIsT0FBSyxZQUFZLElBQUksVUFBVTtHQUM5QixPQUFPLENBQUMsaUJBQWlCQyxZQUFVO0lBQ2xDLE1BQU0sZ0JBQWdCLGlCQUFpQixjQUFjLE9BQU8sQ0FBQyxRQUFRLFNBQVMsYUFBYztBQUM1RixXQUFPLEtBQUssVUFBVSxlQUFlQSxRQUFNO0dBQzNDO0dBRUQsYUFBYSxDQUFDLE9B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