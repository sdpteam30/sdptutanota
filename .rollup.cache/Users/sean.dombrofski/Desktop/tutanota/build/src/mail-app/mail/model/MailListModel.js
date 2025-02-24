import { ListModel } from "../../../common/misc/ListModel";
import { MailFolderTypeRef, MailSetEntryTypeRef, MailTypeRef } from "../../../common/api/entities/tutanota/TypeRefs";
import { CUSTOM_MAX_ID, customIdToUint8array, deconstructMailSetEntryId, elementIdPart, getElementId, isSameId, listIdPart, } from "../../../common/api/common/utils/EntityUtils";
import { assertMainOrNode } from "../../../common/api/common/Env";
import { assertNotNull, compare, promiseFilter } from "@tutao/tutanota-utils";
import { isUpdateForTypeRef } from "../../../common/api/common/utils/EntityUpdateUtils";
import { MailSetKind } from "../../../common/api/common/TutanotaConstants";
import { isOfflineError } from "../../../common/api/common/utils/ErrorUtils";
assertMainOrNode();
/**
 * Handles fetching and resolving mail set entries into mails as well as handling sorting.
 */
export class MailListModel {
    mailSet;
    conversationPrefProvider;
    entityClient;
    mailModel;
    inboxRuleHandler;
    cacheStorage;
    // Id = MailSetEntry element id
    listModel;
    // keep a reverse map for going from Mail element id -> LoadedMail
    mailMap = new Map();
    constructor(mailSet, conversationPrefProvider, entityClient, mailModel, inboxRuleHandler, cacheStorage) {
        this.mailSet = mailSet;
        this.conversationPrefProvider = conversationPrefProvider;
        this.entityClient = entityClient;
        this.mailModel = mailModel;
        this.inboxRuleHandler = inboxRuleHandler;
        this.cacheStorage = cacheStorage;
        this.listModel = new ListModel({
            fetch: (lastFetchedItem, count) => {
                const lastFetchedId = lastFetchedItem?.mailSetEntry?._id ?? [mailSet.entries, CUSTOM_MAX_ID];
                return this.loadMails(lastFetchedId, count);
            },
            sortCompare: (item1, item2) => {
                // Mail set entry ID has the timestamp and mail element ID
                const item1Id = getElementId(item1.mailSetEntry);
                const item2Id = getElementId(item2.mailSetEntry);
                // Sort in reverse order to ensure newer mails are first
                return compare(customIdToUint8array(item2Id), customIdToUint8array(item1Id));
            },
            getItemId: (item) => getElementId(item.mailSetEntry),
            isSameId: (id1, id2) => id1 === id2,
            autoSelectBehavior: () => this.conversationPrefProvider.getMailAutoSelectBehavior(),
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
            for (const item of state.selectedItems) {
                selectedItems.add(item.mail);
            }
            const newState = {
                ...state,
                items,
                selectedItems,
            };
            return newState;
        });
    }
    isLoadingAll() {
        return this.listModel.state.loadingAll;
    }
    isItemSelected(mailId) {
        const loadedMail = this.mailMap.get(mailId);
        if (loadedMail == null) {
            return false;
        }
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
            // If a label is modified, we want to update all mails that reference it, which requires linearly iterating
            // through all mails. There are more efficient ways we could do this, such as by keeping track of each label
            // we've retrieved from the database and just update that, but we want to avoid adding more maps that we
            // have to maintain.
            if (update.operation === "1" /* OperationType.UPDATE */) {
                const mailSetId = [update.instanceListId, update.instanceId];
                for (const loadedMail of this.mailMap.values()) {
                    const hasMailSet = loadedMail.labels.some((label) => isSameId(mailSetId, label._id));
                    if (!hasMailSet) {
                        continue;
                    }
                    // MailModel's entity event listener should have been fired first
                    const labels = this.mailModel.getLabelsForMail(loadedMail.mail);
                    const newMailEntry = {
                        ...loadedMail,
                        labels,
                    };
                    this._updateSingleMail(newMailEntry);
                }
            }
        }
        else if (isUpdateForTypeRef(MailSetEntryTypeRef, update) && isSameId(this.mailSet.entries, update.instanceListId)) {
            // Adding/removing to this list (MailSetEntry doesn't have any fields to update, so we don't need to handle this)
            if (update.operation === "2" /* OperationType.DELETE */) {
                const mail = this.getLoadedMailByMailSetId(update.instanceId);
                if (mail) {
                    this.mailMap.delete(getElementId(mail.mail));
                }
                await this.listModel.deleteLoadedItem(update.instanceId);
            }
            else if (update.operation === "0" /* OperationType.CREATE */) {
                const loadedMail = await this.loadSingleMail([update.instanceListId, update.instanceId]);
                await this.listModel.waitLoad(async () => {
                    if (this.listModel.canInsertItem(loadedMail)) {
                        this.listModel.insertLoadedItem(loadedMail);
                    }
                });
            }
        }
        else if (isUpdateForTypeRef(MailTypeRef, update)) {
            // We only need to handle updates for Mail.
            // Mail deletion will also be handled in MailSetEntry delete/create.
            const mailItem = this.mailMap.get(update.instanceId);
            if (mailItem != null && update.operation === "1" /* OperationType.UPDATE */) {
                const newMailData = await this.entityClient.load(MailTypeRef, [update.instanceListId, update.instanceId]);
                const labels = this.mailModel.getLabelsForMail(newMailData); // in case labels were added/removed
                const newMailItem = {
                    ...mailItem,
                    labels,
                    mail: newMailData,
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
    async loadMails(startingId, count) {
        let items = [];
        let complete = false;
        try {
            const mailSetEntries = await this.entityClient.loadRange(MailSetEntryTypeRef, listIdPart(startingId), elementIdPart(startingId), count, true);
            // Check for completeness before loading/filtering mails, as we may end up with even fewer mails than retrieved in either case
            complete = mailSetEntries.length < count;
            if (mailSetEntries.length > 0) {
                items = await this.resolveMailSetEntries(mailSetEntries, this.defaultMailProvider);
                items = await this.applyInboxRulesToEntries(items);
            }
        }
        catch (e) {
            if (isOfflineError(e)) {
                // Attempt loading from the cache if we failed to get mails and/or mailset entries
                // Note that we may have items if it was just inbox rules that failed
                if (items.length === 0) {
                    // Set the request as incomplete so that we make another request later (see `loadMailsFromCache` comment)
                    complete = false;
                    items = await this.loadMailsFromCache(startingId, count);
                    if (items.length === 0) {
                        throw e; // we couldn't get anything from the cache!
                    }
                }
            }
            else {
                throw e;
            }
        }
        this.updateMailMap(items);
        return {
            items,
            complete,
        };
    }
    /**
     * Load mails from the cache rather than remotely
     */
    async loadMailsFromCache(startId, count) {
        // The way the cache works is that it tries to fulfill the API contract of returning as many items as requested as long as it can.
        // This is problematic for offline where we might not have the full page of emails loaded (e.g. we delete part as it's too old, or we move emails
        // around). Because of that cache will try to load additional items from the server in order to return `count` items. If it fails to load them,
        // it will not return anything and instead will throw an error.
        // This is generally fine but in case of offline we want to display everything that we have cached. For that we fetch directly from the cache,
        // give it to the list and let list make another request (and almost certainly fail that request) to show a retry button. This way we both show
        // the items we have and also show that we couldn't load everything.
        const mailSetEntries = await this.cacheStorage.provideFromRange(MailSetEntryTypeRef, listIdPart(startId), elementIdPart(startId), count, true);
        return await this.resolveMailSetEntries(mailSetEntries, (list, elements) => this.cacheStorage.provideMultiple(MailTypeRef, list, elements));
    }
    /**
     * Apply inbox rules to an array of mails, returning all mails that were not moved
     */
    async applyInboxRulesToEntries(entries) {
        if (this.mailSet.folderType !== MailSetKind.INBOX || entries.length === 0) {
            return entries;
        }
        const mailboxDetail = await this.mailModel.getMailboxDetailsForMailFolder(this.mailSet);
        if (!mailboxDetail) {
            return entries;
        }
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
        // Sort all mails into mailbags so we can retrieve them with loadMultiple
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
        // Retrieve all mails by mailbag
        const allMails = new Map();
        for (const [list, elements] of mailListMap) {
            const mails = await mailProvider(list, elements);
            for (const mail of mails) {
                allMails.set(getElementId(mail), mail);
            }
        }
        // Build our array
        const loadedMails = [];
        for (const mailSetEntry of mailSetEntries) {
            const mail = allMails.get(elementIdPart(mailSetEntry.mail));
            // Mail may have been deleted in the meantime
            if (!mail) {
                continue;
            }
            // Resolve labels
            const labels = this.mailModel.getLabelsForMail(mail);
            loadedMails.push({ mailSetEntry, mail, labels });
        }
        return loadedMails;
    }
    updateMailMap(mails) {
        for (const mail of mails) {
            this.mailMap.set(getElementId(mail.mail), mail);
        }
    }
    // @VisibleForTesting
    _updateSingleMail(mail) {
        this.updateMailMap([mail]);
        this.listModel.updateLoadedItem(mail);
    }
    // @VisibleForTesting
    _loadedMails() {
        return this.listModel.state.items;
    }
    defaultMailProvider = (listId, elements) => {
        return this.entityClient.loadMultiple(MailTypeRef, listId, elements);
    };
}
//# sourceMappingURL=MailListModel.js.map