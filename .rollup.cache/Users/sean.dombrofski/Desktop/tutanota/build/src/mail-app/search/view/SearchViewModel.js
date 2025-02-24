import { ListElementListModel } from "../../../common/misc/ListElementListModel.js";
import { SearchResultListEntry } from "./SearchListView.js";
import { CalendarEventTypeRef, ContactTypeRef, MailTypeRef } from "../../../common/api/entities/tutanota/TypeRefs.js";
import { CLIENT_ONLY_CALENDARS, FULL_INDEXED_TIMESTAMP, MailSetKind, NOTHING_INDEXED_TIMESTAMP, } from "../../../common/api/common/TutanotaConstants.js";
import { assertIsEntity, assertIsEntity2, elementIdPart, GENERATED_MAX_ID, getElementId, isSameId, listIdPart, sortCompareByReverseId, } from "../../../common/api/common/utils/EntityUtils.js";
import { ListLoadingState } from "../../../common/gui/base/List.js";
import { assertNotNull, deepEqual, defer, downcast, getEndOfDay, getStartOfDay, incrementMonth, isSameDayOfDate, isSameTypeRef, LazyLoaded, neverNull, ofClass, stringToBase64, TypeRef, } from "@tutao/tutanota-utils";
import { areResultsForTheSameQuery, hasMoreResults, isSameSearchRestriction } from "../model/SearchModel.js";
import { NotFoundError } from "../../../common/api/common/error/RestError.js";
import { compareContacts } from "../../contacts/view/ContactGuiUtils.js";
import { createRestriction, decodeCalendarSearchKey, encodeCalendarSearchKey, getRestriction, getSearchUrl, searchCategoryForRestriction, } from "../model/SearchUtils.js";
import Stream from "mithril/stream";
import { loadMultipleFromLists } from "../../../common/api/common/EntityClient.js";
import { containsEventOfType, getEventOfType, isUpdateForTypeRef } from "../../../common/api/common/utils/EntityUpdateUtils.js";
import { locator } from "../../../common/api/main/CommonLocator.js";
import m from "mithril";
import { ProgrammingError } from "../../../common/api/common/error/ProgrammingError.js";
import { ListAutoSelectBehavior } from "../../../common/misc/DeviceConfig.js";
import { generateCalendarInstancesInRange, getStartOfTheWeekOffsetForUser, retrieveClientOnlyEventsForUser, } from "../../../common/calendar/date/CalendarUtils.js";
import { mailLocator } from "../../mailLocator.js";
import { getMailFilterForType } from "../../mail/view/MailViewerUtils.js";
import { getClientOnlyCalendars } from "../../../calendar-app/calendar/gui/CalendarGuiUtils.js";
import { YEAR_IN_MILLIS } from "@tutao/tutanota-utils/dist/DateUtils.js";
const SEARCH_PAGE_SIZE = 100;
export var PaidFunctionResult;
(function (PaidFunctionResult) {
    PaidFunctionResult[PaidFunctionResult["Success"] = 0] = "Success";
    PaidFunctionResult[PaidFunctionResult["PaidSubscriptionNeeded"] = 1] = "PaidSubscriptionNeeded";
})(PaidFunctionResult || (PaidFunctionResult = {}));
export class SearchViewModel {
    router;
    search;
    searchFacade;
    mailboxModel;
    logins;
    indexerFacade;
    entityClient;
    eventController;
    mailOpenedListener;
    calendarFacade;
    progressTracker;
    conversationViewModelFactory;
    eventsRepository;
    updateUi;
    selectionBehavior;
    localCalendars;
    _listModel;
    get listModel() {
        return this._listModel;
    }
    _includeRepeatingEvents = true;
    get includeRepeatingEvents() {
        return this._includeRepeatingEvents;
    }
    get warning() {
        if (this.startDate && this.startDate.getTime() > this.endDate.getTime()) {
            return "startafterend";
        }
        else if (this.startDate && this.endDate.getTime() - this.startDate.getTime() > YEAR_IN_MILLIS) {
            return "long";
        }
        else {
            return null;
        }
    }
    /**
     * the type ref that determines which search filters and details
     * viewers this view should show.
     * taken from the current results' restriction or, if result is nonexistent,
     * the URL.
     *
     * result might be nonexistent if there is no query or we're not done searching
     * yet.
     */
    get searchedType() {
        return (this.searchResult?.restriction ?? this.router.getRestriction()).type;
    }
    _conversationViewModel = null;
    get conversationViewModel() {
        return this._conversationViewModel;
    }
    _startDate = null; // null = current mail index date. this allows us to start the search (and the url) without end date set
    get startDate() {
        return this._startDate ?? this.getCurrentMailIndexDate();
    }
    _endDate = null; // null = today (mail), end of 2 months in the future (calendar)
    get endDate() {
        if (this._endDate) {
            return this._endDate;
        }
        else {
            if (this.getCategory() === "calendar" /* SearchCategoryTypes.calendar */) {
                let returnDate = incrementMonth(new Date(), 3);
                returnDate.setDate(0);
                return returnDate;
            }
            else {
                return new Date();
            }
        }
    }
    _selectedMailFolder = [];
    get selectedMailFolder() {
        return this._selectedMailFolder;
    }
    // isn't an IdTuple because it is two list ids
    _selectedCalendar = null;
    get selectedCalendar() {
        return this._selectedCalendar;
    }
    _mailboxes = [];
    get mailboxes() {
        return this._mailboxes;
    }
    _selectedMailField = null;
    get selectedMailField() {
        return this._selectedMailField;
    }
    // Contains load more results even when searchModel doesn't.
    // Load more should probably be moved to the model to update it's result stream.
    searchResult = null;
    mailFilterType = null;
    latestMailRestriction = null;
    latestCalendarRestriction = null;
    mailboxSubscription = null;
    resultSubscription = null;
    listStateSubscription = null;
    loadingAllForSearchResult = null;
    lazyCalendarInfos = new LazyLoaded(async () => {
        const calendarModel = await locator.calendarModel();
        const calendarInfos = await calendarModel.getCalendarInfos();
        m.redraw();
        return calendarInfos;
    });
    userHasNewPaidPlan = new LazyLoaded(async () => {
        return await this.logins.getUserController().isNewPaidPlan();
    });
    currentQuery = "";
    extendIndexConfirmationCallback = null;
    constructor(router, search, searchFacade, mailboxModel, logins, indexerFacade, entityClient, eventController, mailOpenedListener, calendarFacade, progressTracker, conversationViewModelFactory, eventsRepository, updateUi, selectionBehavior, localCalendars) {
        this.router = router;
        this.search = search;
        this.searchFacade = searchFacade;
        this.mailboxModel = mailboxModel;
        this.logins = logins;
        this.indexerFacade = indexerFacade;
        this.entityClient = entityClient;
        this.eventController = eventController;
        this.mailOpenedListener = mailOpenedListener;
        this.calendarFacade = calendarFacade;
        this.progressTracker = progressTracker;
        this.conversationViewModelFactory = conversationViewModelFactory;
        this.eventsRepository = eventsRepository;
        this.updateUi = updateUi;
        this.selectionBehavior = selectionBehavior;
        this.localCalendars = localCalendars;
        this.currentQuery = this.search.result()?.query ?? "";
        this._listModel = this.createList();
    }
    getLazyCalendarInfos() {
        return this.lazyCalendarInfos;
    }
    getUserHasNewPaidPlan() {
        return this.userHasNewPaidPlan;
    }
    init(extendIndexConfirmationCallback) {
        if (this.extendIndexConfirmationCallback) {
            return;
        }
        this.extendIndexConfirmationCallback = extendIndexConfirmationCallback;
        this.resultSubscription = this.search.result.map((result) => {
            if (!result || !isSameTypeRef(result.restriction.type, MailTypeRef)) {
                this.mailFilterType = null;
            }
            if (this.searchResult == null || result == null || !areResultsForTheSameQuery(result, this.searchResult)) {
                this._listModel.cancelLoadAll();
                this.searchResult = result;
                this._listModel = this.createList();
                this.setMailFilter(this.mailFilterType);
                this.applyMailFilterIfNeeded();
                this._listModel.loadInitial();
                this.listStateSubscription?.end(true);
                this.listStateSubscription = this._listModel.stateStream.map((state) => this.onListStateChange(state));
            }
        });
        this.mailboxSubscription = this.mailboxModel.mailboxDetails.map((mailboxes) => {
            this.onMailboxesChanged(mailboxes);
        });
        this.eventController.addEntityListener(this.entityEventsListener);
    }
    getRestriction() {
        return this.router.getRestriction();
    }
    entityEventsListener = async (updates) => {
        for (const update of updates) {
            const mergedUpdate = this.mergeOperationsIfNeeded(update, updates);
            if (mergedUpdate == null)
                continue;
            await this.entityEventReceived(mergedUpdate);
        }
    };
    mergeOperationsIfNeeded(update, updates) {
        // We are trying to keep the mails that are moved and would match the search criteria displayed.
        // This is a bit hacky as we reimplement part of the filtering by list.
        // Ideally search result would update by itself and we would only need to reconcile the changes.
        if (!isUpdateForTypeRef(MailTypeRef, update) || this.searchResult == null) {
            return update;
        }
        if (update.operation === "0" /* OperationType.CREATE */ && containsEventOfType(updates, "2" /* OperationType.DELETE */, update.instanceId)) {
            // This is a move operation, is destination list included in the restrictions?
            if (this.listIdMatchesRestriction(update.instanceListId, this.searchResult.restriction)) {
                // If it's included, we want to keep showing the item but we will simulate the UPDATE
                return { ...update, operation: "1" /* OperationType.UPDATE */ };
            }
            else {
                // If it's not going to be included we might as well skip the create operation
                return null;
            }
        }
        else if (update.operation === "2" /* OperationType.DELETE */ && containsEventOfType(updates, "0" /* OperationType.CREATE */, update.instanceId)) {
            // This is a move operation and we are in the delete part of it.
            // Grab the other part to check the move destination.
            const createOperation = assertNotNull(getEventOfType(updates, "0" /* OperationType.CREATE */, update.instanceId));
            // Is destination included in the search?
            if (this.listIdMatchesRestriction(createOperation.instanceListId, this.searchResult.restriction)) {
                // If so, skip the delete.
                return null;
            }
            else {
                // Otherwise delete
                return update;
            }
        }
        else {
            return update;
        }
    }
    listIdMatchesRestriction(listId, restriction) {
        return restriction.folderIds.length === 0 || restriction.folderIds.includes(listId);
    }
    onNewUrl(args, requestedPath) {
        let restriction;
        try {
            restriction = getRestriction(requestedPath);
        }
        catch (e) {
            // if restriction is broken replace it with non-broken version
            this.router.routeTo(args.query, createRestriction("mail" /* SearchCategoryTypes.mail */, null, null, null, [], null));
            return;
        }
        this.currentQuery = args.query;
        const lastQuery = this.search.lastQueryString();
        const maxResults = isSameTypeRef(MailTypeRef, restriction.type) ? SEARCH_PAGE_SIZE : null;
        const listModel = this._listModel;
        // using hasOwnProperty to distinguish case when url is like '/search/mail/query='
        if (Object.hasOwn(args, "query") && this.search.isNewSearch(args.query, restriction)) {
            this.searchResult = null;
            listModel.updateLoadingStatus(ListLoadingState.Loading);
            this.search
                .search({
                query: args.query,
                restriction,
                minSuggestionCount: 0,
                maxResults,
            }, this.progressTracker)
                .then(() => listModel.updateLoadingStatus(ListLoadingState.Done))
                .catch(() => listModel.updateLoadingStatus(ListLoadingState.ConnectionLost));
        }
        else if (lastQuery && this.search.isNewSearch(lastQuery, restriction)) {
            this.searchResult = null;
            // If query is not set for some reason (e.g. switching search type), use the last query value
            listModel.selectNone();
            listModel.updateLoadingStatus(ListLoadingState.Loading);
            this.search
                .search({
                query: lastQuery,
                restriction,
                minSuggestionCount: 0,
                maxResults,
            }, this.progressTracker)
                .then(() => listModel.updateLoadingStatus(ListLoadingState.Done))
                .catch(() => listModel.updateLoadingStatus(ListLoadingState.ConnectionLost));
        }
        else if (!Object.hasOwn(args, "query") && !lastQuery) {
            // no query at all yet
            listModel.updateLoadingStatus(ListLoadingState.Done);
        }
        if (isSameTypeRef(restriction.type, ContactTypeRef)) {
            this.loadAndSelectIfNeeded(args.id);
        }
        else {
            if (isSameTypeRef(restriction.type, MailTypeRef)) {
                this._selectedMailField = restriction.field;
                this._startDate = restriction.end ? new Date(restriction.end) : null;
                this._endDate = restriction.start ? new Date(restriction.start) : null;
                this._selectedMailFolder = restriction.folderIds;
                this.loadAndSelectIfNeeded(args.id);
                this.latestMailRestriction = restriction;
            }
            else if (isSameTypeRef(restriction.type, CalendarEventTypeRef)) {
                this._startDate = restriction.start ? new Date(restriction.start) : null;
                this._endDate = restriction.end ? new Date(restriction.end) : null;
                this._includeRepeatingEvents = restriction.eventSeries ?? true;
                this.lazyCalendarInfos.load();
                this.userHasNewPaidPlan.load();
                this.latestCalendarRestriction = restriction;
                // Check if user is trying to search in a client only calendar while using a free account
                const selectedCalendar = this.extractCalendarListIds(restriction.folderIds);
                if (!selectedCalendar || Array.isArray(selectedCalendar)) {
                    this._selectedCalendar = selectedCalendar;
                }
                else if (CLIENT_ONLY_CALENDARS.has(selectedCalendar.toString())) {
                    this.getUserHasNewPaidPlan()
                        .getAsync()
                        .then((isNewPaidPlan) => {
                        if (!isNewPaidPlan) {
                            return (this._selectedCalendar = null);
                        }
                        this._selectedCalendar = selectedCalendar;
                    });
                }
                if (args.id != null) {
                    try {
                        const { start, id } = decodeCalendarSearchKey(args.id);
                        this.loadAndSelectIfNeeded(id, ({ entry }) => {
                            entry = entry;
                            return id === getElementId(entry) && start === entry.startTime.getTime();
                        });
                    }
                    catch (err) {
                        console.log("Invalid ID, selecting none");
                        this.listModel.selectNone();
                    }
                }
            }
        }
    }
    extractCalendarListIds(listIds) {
        if (listIds.length < 1)
            return null;
        else if (listIds.length === 1)
            return listIds[0];
        return [listIds[0], listIds[1]];
    }
    loadAndSelectIfNeeded(id, finder) {
        // nothing to select
        if (id == null) {
            return;
        }
        if (!this._listModel.isItemSelected(id)) {
            if (!this._listModel.isItemSelected(id)) {
                this.handleLoadAndSelection(id, finder);
            }
        }
    }
    handleLoadAndSelection(id, finder) {
        if (this._listModel.isLoadedCompletely()) {
            return this.selectItem(id, finder);
        }
        const listStateStream = Stream.combine((a) => a(), [this._listModel.stateStream]);
        listStateStream.map((state) => {
            if (state.loadingStatus === ListLoadingState.Done) {
                this.selectItem(id, finder);
                listStateStream.end(true);
            }
        });
    }
    selectItem(id, finder) {
        const listModel = this._listModel;
        this._listModel.loadAndSelect(id, () => !deepEqual(this._listModel, listModel), finder);
    }
    async loadAll() {
        if (this.loadingAllForSearchResult != null)
            return;
        this.loadingAllForSearchResult = this.searchResult ?? null;
        this._listModel.selectAll();
        try {
            while (this.searchResult?.restriction &&
                this.loadingAllForSearchResult &&
                isSameSearchRestriction(this.searchResult?.restriction, this.loadingAllForSearchResult.restriction) &&
                !this._listModel.isLoadedCompletely()) {
                await this._listModel.loadMore();
                if (this.searchResult.restriction &&
                    this.loadingAllForSearchResult.restriction &&
                    isSameSearchRestriction(this.searchResult.restriction, this.loadingAllForSearchResult.restriction)) {
                    this._listModel.selectAll();
                }
            }
        }
        finally {
            this.loadingAllForSearchResult = null;
        }
    }
    stopLoadAll() {
        this._listModel.cancelLoadAll();
    }
    selectMailField(field) {
        if (this.logins.getUserController().isFreeAccount() && field != null) {
            return PaidFunctionResult.PaidSubscriptionNeeded;
        }
        else {
            this._selectedMailField = field;
            this.searchAgain();
            return PaidFunctionResult.Success;
        }
    }
    canSelectTimePeriod() {
        return !this.logins.getUserController().isFreeAccount();
    }
    getStartOfTheWeekOffset() {
        return getStartOfTheWeekOffsetForUser(this.logins.getUserController().userSettingsGroupRoot);
    }
    async selectStartDate(startDate) {
        if (isSameDayOfDate(this.startDate, startDate)) {
            return PaidFunctionResult.Success;
        }
        if (!this.canSelectTimePeriod()) {
            return PaidFunctionResult.PaidSubscriptionNeeded;
        }
        // If start date is outside the indexed range, suggest to extend the index and only if confirmed change the selected date.
        // Otherwise, keep the date as it was.
        if (startDate &&
            this.getCategory() === "mail" /* SearchCategoryTypes.mail */ &&
            startDate.getTime() < this.search.indexState().currentMailIndexTimestamp &&
            startDate) {
            const confirmed = (await this.extendIndexConfirmationCallback?.()) ?? true;
            if (confirmed) {
                this._startDate = startDate;
                this.indexerFacade.extendMailIndex(startDate.getTime()).then(() => {
                    this.updateSearchUrl();
                    this.updateUi();
                });
            }
            else {
                // In this case it is not a success of payment, but we don't need to prompt for upgrade
                return PaidFunctionResult.Success;
            }
        }
        else {
            this._startDate = startDate;
        }
        this.searchAgain();
        return PaidFunctionResult.Success;
    }
    selectEndDate(endDate) {
        if (isSameDayOfDate(this.endDate, endDate)) {
            return PaidFunctionResult.Success;
        }
        if (!this.canSelectTimePeriod()) {
            return PaidFunctionResult.PaidSubscriptionNeeded;
        }
        this._endDate = endDate;
        this.searchAgain();
        return PaidFunctionResult.Success;
    }
    selectCalendar(calendarInfo) {
        if (typeof calendarInfo === "string" || calendarInfo == null) {
            this._selectedCalendar = calendarInfo;
        }
        else {
            this._selectedCalendar = [calendarInfo.groupRoot.longEvents, calendarInfo.groupRoot.shortEvents];
        }
        this.searchAgain();
    }
    selectMailFolder(folder) {
        if (this.logins.getUserController().isFreeAccount() && folder != null) {
            return PaidFunctionResult.PaidSubscriptionNeeded;
        }
        else {
            this._selectedMailFolder = folder;
            this.searchAgain();
            return PaidFunctionResult.Success;
        }
    }
    selectIncludeRepeatingEvents(include) {
        this._includeRepeatingEvents = include;
        this.searchAgain();
    }
    /**
     * @returns null if the complete mailbox is indexed
     */
    getCurrentMailIndexDate() {
        let timestamp = this.search.indexState().currentMailIndexTimestamp;
        if (timestamp === FULL_INDEXED_TIMESTAMP) {
            return null;
        }
        else if (timestamp === NOTHING_INDEXED_TIMESTAMP) {
            return getEndOfDay(new Date());
        }
        else {
            return new Date(timestamp);
        }
    }
    searchAgain() {
        this.updateSearchUrl();
        this.updateUi();
    }
    getUrlFromSearchCategory(category) {
        if (this.currentQuery) {
            let latestRestriction = null;
            switch (category) {
                case "mail" /* SearchCategoryTypes.mail */:
                    latestRestriction = this.latestMailRestriction;
                    break;
                case "calendar" /* SearchCategoryTypes.calendar */:
                    latestRestriction = this.latestCalendarRestriction;
                    break;
                case "contact" /* SearchCategoryTypes.contact */:
                    // contacts do not have restrictions at this time
                    break;
            }
            if (latestRestriction) {
                return getSearchUrl(this.currentQuery, latestRestriction);
            }
            else {
                return getSearchUrl(this.currentQuery, createRestriction(category, null, null, null, [], null));
            }
        }
        else {
            return getSearchUrl("", createRestriction(category, null, null, null, [], null));
        }
    }
    get mailFilter() {
        return this.mailFilterType;
    }
    setMailFilter(filter) {
        this.mailFilterType = filter;
        this.applyMailFilterIfNeeded();
    }
    applyMailFilterIfNeeded() {
        if (isSameTypeRef(this.searchedType, MailTypeRef)) {
            const filterFunction = getMailFilterForType(this.mailFilterType);
            const liftedFilter = filterFunction ? (entry) => filterFunction(entry.entry) : null;
            this._listModel?.setFilter(liftedFilter);
        }
    }
    updateSearchUrl() {
        const selectedElement = this._listModel.state.selectedItems.size === 1 ? this._listModel.getSelectedAsArray().at(0) : null;
        if (isSameTypeRef(this.searchedType, MailTypeRef)) {
            this.routeMail(selectedElement?.entry ?? null, createRestriction(this.getCategory(), this._endDate ? getEndOfDay(this._endDate).getTime() : null, this._startDate ? getStartOfDay(this._startDate).getTime() : null, this._selectedMailField, this._selectedMailFolder, null));
        }
        else if (isSameTypeRef(this.searchedType, CalendarEventTypeRef)) {
            this.routeCalendar(selectedElement?.entry ?? null, createRestriction(this.getCategory(), this._startDate ? getStartOfDay(this._startDate).getTime() : null, this._endDate ? getEndOfDay(this._endDate).getTime() : null, null, this.getFolderIds(), this._includeRepeatingEvents));
        }
        else if (isSameTypeRef(this.searchedType, ContactTypeRef)) {
            this.routeContact(selectedElement?.entry ?? null, createRestriction(this.getCategory(), null, null, null, [], null));
        }
    }
    getFolderIds() {
        if (typeof this.selectedCalendar === "string") {
            return [this.selectedCalendar];
        }
        else if (this.selectedCalendar != null) {
            return [...this.selectedCalendar];
        }
        return [];
    }
    routeCalendar(element, restriction) {
        const selectionKey = this.generateSelectionKey(element);
        this.router.routeTo(this.currentQuery, restriction, selectionKey);
    }
    routeMail(element, restriction) {
        this.router.routeTo(this.currentQuery, restriction, this.generateSelectionKey(element));
    }
    routeContact(element, restriction) {
        this.router.routeTo(this.currentQuery, restriction, this.generateSelectionKey(element));
    }
    generateSelectionKey(element) {
        if (element == null)
            return null;
        if (assertIsEntity(element, CalendarEventTypeRef)) {
            return encodeCalendarSearchKey(element);
        }
        else {
            return getElementId(element);
        }
    }
    getCategory() {
        const restriction = this.router.getRestriction();
        return searchCategoryForRestriction(restriction);
    }
    async onMailboxesChanged(mailboxes) {
        this._mailboxes = mailboxes;
        // if selected folder no longer exist select another one
        const selectedMailFolder = this._selectedMailFolder;
        if (selectedMailFolder[0]) {
            const mailFolder = await mailLocator.mailModel.getMailSetById(selectedMailFolder[0]);
            if (!mailFolder) {
                const folderSystem = assertNotNull(mailLocator.mailModel.getFolderSystemByGroupId(mailboxes[0].mailGroup._id));
                this._selectedMailFolder = [getElementId(assertNotNull(folderSystem.getSystemFolderByType(MailSetKind.INBOX)))];
                this.updateUi();
            }
        }
    }
    isPossibleABirthdayContactUpdate(update) {
        if (isUpdateForTypeRef(ContactTypeRef, update) && isSameTypeRef(this.searchedType, CalendarEventTypeRef)) {
            const { instanceListId, instanceId } = update;
            const encodedContactId = stringToBase64(`${instanceListId}/${instanceId}`);
            return this.listModel.stateStream().items.some((searchEntry) => searchEntry._id[1].endsWith(encodedContactId));
        }
        return false;
    }
    isSelectedEventAnUpdatedBirthday(update) {
        if (isUpdateForTypeRef(ContactTypeRef, update) && isSameTypeRef(this.searchedType, CalendarEventTypeRef)) {
            const { instanceListId, instanceId } = update;
            const encodedContactId = stringToBase64(`${instanceListId}/${instanceId}`);
            const selectedItem = this.listModel.getSelectedAsArray().at(0);
            if (!selectedItem) {
                return false;
            }
            return selectedItem._id[1].endsWith(encodedContactId);
        }
        return false;
    }
    async entityEventReceived(update) {
        const lastType = this.searchedType;
        const isPossibleABirthdayContactUpdate = this.isPossibleABirthdayContactUpdate(update);
        if (!isUpdateForTypeRef(lastType, update) && !isPossibleABirthdayContactUpdate) {
            return;
        }
        const { instanceListId, instanceId, operation } = update;
        const id = [neverNull(instanceListId), instanceId];
        const typeRef = new TypeRef(update.application, update.type);
        if (!this.isInSearchResult(typeRef, id) && !isPossibleABirthdayContactUpdate) {
            return;
        }
        if (isUpdateForTypeRef(MailTypeRef, update) && operation === "1" /* OperationType.UPDATE */) {
            if (this.searchResult && this.searchResult.results) {
                const index = this.searchResult?.results.findIndex((email) => update.instanceId === elementIdPart(email) && update.instanceListId !== listIdPart(email));
                if (index >= 0) {
                    const restrictionLength = this.searchResult.restriction.folderIds.length;
                    if ((restrictionLength > 0 && this.searchResult.restriction.folderIds.includes(update.instanceListId)) || restrictionLength === 0) {
                        // We need to update the listId of the updated item, since it was moved to another folder.
                        const newIdTuple = [update.instanceListId, update.instanceId];
                        this.searchResult.results[index] = newIdTuple;
                    }
                }
            }
        }
        else if ((isUpdateForTypeRef(CalendarEventTypeRef, update) && isSameTypeRef(lastType, CalendarEventTypeRef)) || isPossibleABirthdayContactUpdate) {
            // due to the way calendar event changes are sort of non-local, we throw away the whole list and re-render it if
            // the contents are edited. we do the calculation on a new list and then swap the old list out once the new one is
            // ready
            const selectedItem = this._listModel.getSelectedAsArray().at(0);
            const listModel = this.createList();
            this.setMailFilter(this.mailFilterType);
            this.applyMailFilterIfNeeded();
            if (isPossibleABirthdayContactUpdate && (await this.eventsRepository.canLoadBirthdaysCalendar())) {
                await this.eventsRepository.loadContactsBirthdays(true);
            }
            await listModel.loadInitial();
            if (selectedItem != null) {
                if (isPossibleABirthdayContactUpdate && this.isSelectedEventAnUpdatedBirthday(update)) {
                    // We must invalidate the selected item to refresh the contact preview
                    this.listModel.selectNone();
                }
                await listModel.loadAndSelect(elementIdPart(selectedItem._id), () => false);
            }
            this._listModel = listModel;
            this.listStateSubscription?.end(true);
            this.listStateSubscription = this._listModel.stateStream.map((state) => this.onListStateChange(state));
            this.updateSearchUrl();
            this.updateUi();
            return;
        }
        this._listModel.getUnfilteredAsArray();
        await this._listModel.entityEventReceived(instanceListId, instanceId, operation);
        // run the mail or contact update after the update on the list is finished to avoid parallel loading
        if (operation === "1" /* OperationType.UPDATE */ && this._listModel?.isItemSelected(elementIdPart(id))) {
            try {
                await this.entityClient.load(typeRef, id);
                this.updateUi();
            }
            catch (e) {
                // ignore. might happen if a mail was just sent
            }
        }
    }
    getSelectedMails() {
        return this._listModel
            .getSelectedAsArray()
            .map((e) => e.entry)
            .filter(assertIsEntity2(MailTypeRef));
    }
    getSelectedContacts() {
        return this._listModel
            .getSelectedAsArray()
            .map((e) => e.entry)
            .filter(assertIsEntity2(ContactTypeRef));
    }
    getSelectedEvents() {
        return this._listModel
            .getSelectedAsArray()
            .map((e) => e.entry)
            .filter(assertIsEntity2(CalendarEventTypeRef));
    }
    onListStateChange(newState) {
        if (isSameTypeRef(this.searchedType, MailTypeRef)) {
            if (!newState.inMultiselect && newState.selectedItems.size === 1) {
                const mail = this.getSelectedMails()[0];
                // Sometimes a stale state is passed through, resulting in no mail
                if (mail) {
                    if (!this._conversationViewModel) {
                        this.updateDisplayedConversation(mail);
                    }
                    else if (this._conversationViewModel) {
                        const isSameElementId = isSameId(elementIdPart(this._conversationViewModel?.primaryMail._id), elementIdPart(mail._id));
                        const isSameListId = isSameId(listIdPart(this._conversationViewModel?.primaryMail._id), listIdPart(mail._id));
                        if (!isSameElementId || !isSameListId) {
                            this.updateSearchUrl();
                            this.updateDisplayedConversation(mail);
                        }
                    }
                }
                else {
                    this._conversationViewModel = null;
                }
            }
            else {
                this._conversationViewModel = null;
            }
        }
        else {
            this._conversationViewModel = null;
        }
        this.updateUi();
    }
    updateDisplayedConversation(mail) {
        if (this.conversationViewModelFactory && this.mailOpenedListener) {
            this._conversationViewModel = this.conversationViewModelFactory({ mail, showFolder: true });
            // Notify the admin client about the mail being selected
            this.mailOpenedListener.onEmailOpened(mail);
        }
    }
    createList() {
        // since we recreate the list every time we set a new result object,
        // we bind the value of result for the lifetime of this list model
        // at this point
        // note in case of refactor: the fact that the list updates the URL every time it changes
        // its state is a major source of complexity and makes everything very order-dependent
        return new ListElementListModel({
            fetch: async (lastFetchedEntity, count) => {
                const startId = lastFetchedEntity == null ? GENERATED_MAX_ID : getElementId(lastFetchedEntity);
                const lastResult = this.searchResult;
                if (lastResult !== this.searchResult) {
                    console.warn("got a fetch request for outdated results object, ignoring");
                    // this._searchResults was reassigned, we'll create a new ListElementListModel soon
                    return { items: [], complete: true };
                }
                await awaitSearchInitialized(this.search);
                if (!lastResult || (lastResult.results.length === 0 && !hasMoreResults(lastResult))) {
                    return { items: [], complete: true };
                }
                const { items, newSearchResult } = await this.loadSearchResults(lastResult, startId, count);
                const entries = items.map((instance) => new SearchResultListEntry(instance));
                const complete = !hasMoreResults(newSearchResult);
                return { items: entries, complete };
            },
            loadSingle: async (_listId, elementId) => {
                const lastResult = this.searchResult;
                if (!lastResult) {
                    return null;
                }
                const id = lastResult.results.find((resultId) => elementIdPart(resultId) === elementId);
                if (id) {
                    return this.entityClient
                        .load(lastResult.restriction.type, id)
                        .then((entity) => new SearchResultListEntry(entity))
                        .catch(ofClass(NotFoundError, (_) => {
                        return null;
                    }));
                }
                else {
                    return null;
                }
            },
            sortCompare: (o1, o2) => {
                if (isSameTypeRef(o1.entry._type, ContactTypeRef)) {
                    return compareContacts(o1.entry, o2.entry);
                }
                else if (isSameTypeRef(o1.entry._type, CalendarEventTypeRef)) {
                    return downcast(o1.entry).startTime.getTime() - downcast(o2.entry).startTime.getTime();
                }
                else {
                    return sortCompareByReverseId(o1.entry, o2.entry);
                }
            },
            autoSelectBehavior: () => (isSameTypeRef(this.searchedType, MailTypeRef) ? this.selectionBehavior : ListAutoSelectBehavior.OLDER),
        });
    }
    isInSearchResult(typeRef, id) {
        const result = this.searchResult;
        if (result && isSameTypeRef(typeRef, result.restriction.type)) {
            // The list id must be null/empty, otherwise the user is filtering by list, and it shouldn't be ignored
            const ignoreList = isSameTypeRef(typeRef, MailTypeRef) && result.restriction.folderIds.length === 0;
            return result.results.some((r) => this.compareItemId(r, id, ignoreList));
        }
        return false;
    }
    compareItemId(id1, id2, ignoreList) {
        return ignoreList ? isSameId(elementIdPart(id1), elementIdPart(id2)) : isSameId(id1, id2);
    }
    async loadSearchResults(currentResult, startId, count) {
        const updatedResult = hasMoreResults(currentResult) ? await this.searchFacade.getMoreSearchResults(currentResult, count) : currentResult;
        // we need to override global reference for other functions
        this.searchResult = updatedResult;
        let items;
        if (isSameTypeRef(currentResult.restriction.type, MailTypeRef)) {
            let startIndex = 0;
            if (startId !== GENERATED_MAX_ID) {
                // this relies on the results being sorted from newest to oldest ID
                startIndex = updatedResult.results.findIndex((id) => id[1] <= startId);
                if (elementIdPart(updatedResult.results[startIndex]) === startId) {
                    // the start element is already loaded, so we exclude it from the next load
                    startIndex++;
                }
                else if (startIndex === -1) {
                    // there is nothing in our result that's not loaded yet, so we
                    // have nothing to do
                    startIndex = Math.max(updatedResult.results.length - 1, 0);
                }
            }
            // Ignore count when slicing here because we would have to modify SearchResult too
            const toLoad = updatedResult.results.slice(startIndex);
            items = await this.loadAndFilterInstances(currentResult.restriction.type, toLoad, updatedResult, startIndex);
        }
        else if (isSameTypeRef(currentResult.restriction.type, ContactTypeRef)) {
            try {
                // load all contacts to sort them by name afterwards
                items = await this.loadAndFilterInstances(currentResult.restriction.type, updatedResult.results, updatedResult, 0);
            }
            finally {
                this.updateUi();
            }
        }
        else if (isSameTypeRef(currentResult.restriction.type, CalendarEventTypeRef)) {
            try {
                const { start, end } = currentResult.restriction;
                if (start == null || end == null) {
                    throw new ProgrammingError("invalid search time range for calendar");
                }
                items = [
                    ...(await this.calendarFacade.reifyCalendarSearchResult(start, end, updatedResult.results)),
                    ...(await this.getClientOnlyEventsSeries(start, end, updatedResult.results)),
                ];
            }
            finally {
                this.updateUi();
            }
        }
        else {
            // this type is not shown in the search view, e.g. group info
            items = [];
        }
        return { items: items, newSearchResult: updatedResult };
    }
    async getClientOnlyEventsSeries(start, end, events) {
        const eventList = await retrieveClientOnlyEventsForUser(this.logins, events, this.eventsRepository.getBirthdayEvents());
        return generateCalendarInstancesInRange(eventList, { start, end });
    }
    /**
     * take a list of IDs and load them by list, filtering out the ones that could not be loaded.
     * updates the passed currentResult.result list to not include the failed IDs anymore
     */
    async loadAndFilterInstances(type, toLoad, currentResult, startIndex) {
        const instances = await loadMultipleFromLists(type, this.entityClient, toLoad);
        // Filter not found instances from the current result as well so we don’t loop trying to load them
        if (instances.length < toLoad.length) {
            const resultLength = currentResult.results.length;
            console.log(`Could not load some results: ${instances.length} out of ${toLoad.length}`);
            // loop backwards to remove correct elements by index
            for (let i = toLoad.length - 1; i >= 0; i--) {
                const toLoadId = toLoad[i];
                if (!instances.some((instance) => isSameId(instance._id, toLoadId))) {
                    currentResult.results.splice(startIndex + i, 1);
                    if (instances.length === toLoad.length) {
                        break;
                    }
                }
            }
            console.log(`Fixed results, before ${resultLength}, after: ${currentResult.results.length}`);
        }
        return instances;
    }
    sendStopLoadingSignal() {
        this.search.sendCancelSignal();
    }
    getLocalCalendars() {
        return getClientOnlyCalendars(this.logins.getUserController().userId, this.localCalendars);
    }
    dispose() {
        this.stopLoadAll();
        this.extendIndexConfirmationCallback = null;
        this.resultSubscription?.end(true);
        this.resultSubscription = null;
        this.mailboxSubscription?.end(true);
        this.mailboxSubscription = null;
        this.listStateSubscription?.end(true);
        this.listStateSubscription = null;
        this.search.sendCancelSignal();
        this.eventController.removeEntityListener(this.entityEventsListener);
    }
    getLabelsForMail(mail) {
        return mailLocator.mailModel.getLabelsForMail(mail);
    }
}
function awaitSearchInitialized(searchModel) {
    const deferred = defer();
    const dep = searchModel.indexState.map((state) => {
        if (!state.initializing) {
            Promise.resolve().then(() => {
                dep.end(true);
                deferred.resolve(undefined);
            });
        }
    });
    return deferred.promise;
}
//# sourceMappingURL=SearchViewModel.js.map