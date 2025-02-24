import { assertNotNull, clone, debounce, deepEqual, downcast, findAndRemove, getStartOfDay, groupByAndMapUniquely, last, } from "@tutao/tutanota-utils";
import { CalendarEventTypeRef, ContactTypeRef } from "../../../common/api/entities/tutanota/TypeRefs.js";
import { CLIENT_ONLY_CALENDARS, EXTERNAL_CALENDAR_SYNC_INTERVAL, getWeekStart, } from "../../../common/api/common/TutanotaConstants";
import { NotAuthorizedError, NotFoundError } from "../../../common/api/common/error/RestError";
import { getElementId, getListId, isSameId, listIdPart } from "../../../common/api/common/utils/EntityUtils";
import { CustomerInfoTypeRef } from "../../../common/api/entities/sys/TypeRefs.js";
import stream from "mithril/stream";
import { extractContactIdFromEvent, getDiffIn60mIntervals, getMonthRange, isClientOnlyCalendar, isEventBetweenDays, } from "../../../common/calendar/date/CalendarUtils";
import { isAllDayEvent } from "../../../common/api/common/utils/CommonCalendarUtils";
import { getNonOrganizerAttendees } from "../gui/eventeditor-model/CalendarEventModel.js";
import { askIfShouldSendCalendarUpdatesToAttendees, getClientOnlyColors, getEventType, getGroupColors, shouldDisplayEvent } from "../gui/CalendarGuiUtils.js";
import { deviceConfig } from "../../../common/misc/DeviceConfig";
import { ProgrammingError } from "../../../common/api/common/error/ProgrammingError.js";
import { Time } from "../../../common/calendar/date/Time.js";
import { isUpdateFor, isUpdateForTypeRef } from "../../../common/api/common/utils/EntityUpdateUtils.js";
import { getEnabledMailAddressesWithUser } from "../../../common/mailFunctionality/SharedMailUtils.js";
import { lang } from "../../../common/misc/LanguageViewModel.js";
export class CalendarViewModel {
    logins;
    createCalendarEventEditModel;
    createCalendarEventPreviewModel;
    createCalendarContactPreviewModel;
    calendarModel;
    eventsRepository;
    entityClient;
    progressTracker;
    deviceConfig;
    calendarInvitationsModel;
    timeZone;
    mailboxModel;
    contactModel;
    // Should not be changed directly but only through the URL
    selectedDate = stream(getStartOfDay(new Date()));
    /**
     * An event currently being displayed (non-modally)
     * the {@code model} is {@code null} until it is loaded.
     *
     * We keep track of event separately to avoid races with selecting multiple events shortly one after another.
     */
    previewedEvent = null;
    _hiddenCalendars;
    /** Events that have been dropped but still need to be rendered as temporary while waiting for entity updates. */
    // visible for tests
    _transientEvents;
    // visible for tests
    _draggedEvent = null;
    _redrawStream = stream();
    selectedTime;
    // When set to true, ignores the next setting of selectedTime
    ignoreNextValidTimeSelection;
    scrollPosition = 0; // size.calendar_hour_height * DEFAULT_HOUR_OF_DAY
    // The maximum scroll value of the list in the view
    scrollMax = null;
    // The size of the list in the view
    viewSize = null;
    _isNewPaidPlan = false;
    localCalendars = new Map();
    _calendarColors = new Map();
    constructor(logins, createCalendarEventEditModel, createCalendarEventPreviewModel, createCalendarContactPreviewModel, calendarModel, eventsRepository, entityClient, eventController, progressTracker, deviceConfig, calendarInvitationsModel, timeZone, mailboxModel, contactModel) {
        this.logins = logins;
        this.createCalendarEventEditModel = createCalendarEventEditModel;
        this.createCalendarEventPreviewModel = createCalendarEventPreviewModel;
        this.createCalendarContactPreviewModel = createCalendarContactPreviewModel;
        this.calendarModel = calendarModel;
        this.eventsRepository = eventsRepository;
        this.entityClient = entityClient;
        this.progressTracker = progressTracker;
        this.deviceConfig = deviceConfig;
        this.calendarInvitationsModel = calendarInvitationsModel;
        this.timeZone = timeZone;
        this.mailboxModel = mailboxModel;
        this.contactModel = contactModel;
        this._transientEvents = [];
        const userId = logins.getUserController().user._id;
        const today = new Date();
        this._hiddenCalendars = new Set(this.deviceConfig.getHiddenCalendars(userId));
        this.selectedDate.map(() => {
            this.updatePreviewedEvent(null);
            this.preloadMonthsAroundSelectedDate();
        });
        this.selectedTime = Time.fromDate(today);
        this.ignoreNextValidTimeSelection = false;
        this.calendarModel.getCalendarInfosStream().map((newInfos) => {
            const event = this.previewedEvent?.event ?? null;
            if (event != null) {
                // redraw if we lost access to the events' list
                const groupRoots = Array.from(newInfos.values()).map((i) => i.groupRoot);
                const lists = [...groupRoots.map((g) => g.longEvents), ...groupRoots.map((g) => g.shortEvents)];
                const previewListId = getListId(event);
                if (!lists.some((id) => isSameId(previewListId, id))) {
                    this.updatePreviewedEvent(null);
                }
            }
            this.preloadMonthsAroundSelectedDate();
        });
        eventController.addEntityListener((updates) => this.entityEventReceived(updates));
        calendarInvitationsModel.init();
        this.eventsRepository.getEventsForMonths().map(() => {
            this.doRedraw();
        });
        this.loadCalendarColors();
        logins
            .getUserController()
            .isNewPaidPlan()
            .then((isNewPaidPlan) => {
            this._isNewPaidPlan = isNewPaidPlan;
            this.prepareClientCalendars();
        });
    }
    isDaySelectorExpanded() {
        return this.deviceConfig.isCalendarDaySelectorExpanded();
    }
    setDaySelectorExpanded(expanded) {
        this.deviceConfig.setCalendarDaySelectorExpanded(expanded);
    }
    loadCalendarColors() {
        const clientOnlyColors = getClientOnlyColors(this.logins.getUserController().userId, deviceConfig.getClientOnlyCalendars());
        const groupColors = getGroupColors(this.logins.getUserController().userSettingsGroupRoot);
        for (let [calendarId, color] of clientOnlyColors.entries()) {
            groupColors.set(calendarId, color);
        }
        if (!deepEqual(this._calendarColors, groupColors)) {
            this._calendarColors = new Map(groupColors);
        }
    }
    /**
     * Load client only calendars or generate them if missing
     */
    prepareClientCalendars() {
        for (const [clientOnlyCalendarBaseId, name] of CLIENT_ONLY_CALENDARS) {
            const calendarID = `${this.logins.getUserController().userId}#${clientOnlyCalendarBaseId}`;
            const clientOnlyCalendarConfig = deviceConfig.getClientOnlyCalendars().get(calendarID);
            this.localCalendars.set(calendarID, downcast({
                groupRoot: { _id: calendarID },
                groupInfo: clientOnlyCalendarConfig
                    ? { name: clientOnlyCalendarConfig.name, group: calendarID }
                    : {
                        name: lang.get(name),
                        group: calendarID,
                    },
                group: { _id: calendarID },
                shared: false,
                userIsOwner: true,
            }));
            if (!this.isNewPaidPlan && !this.hiddenCalendars.has(calendarID)) {
                this._hiddenCalendars.add(calendarID);
            }
        }
    }
    /**
     * react to changes to the calendar data by making sure we have the current month + the two adjacent months
     * ready to be rendered
     */
    preloadMonthsAroundSelectedDate = debounce(200, async () => {
        // load all calendars. if there is no calendar yet, create one
        // for each calendar we load short events for three months +3
        const workPerCalendar = 3;
        const totalWork = this.logins.getUserController().getCalendarMemberships().length * workPerCalendar;
        const monitorHandle = this.progressTracker.registerMonitorSync(totalWork);
        const progressMonitor = assertNotNull(this.progressTracker.getMonitor(monitorHandle));
        const newSelectedDate = this.selectedDate();
        const thisMonthStart = getMonthRange(newSelectedDate, this.timeZone).start;
        const previousMonthDate = new Date(thisMonthStart);
        previousMonthDate.setMonth(new Date(thisMonthStart).getMonth() - 1);
        const nextMonthDate = new Date(thisMonthStart);
        nextMonthDate.setMonth(new Date(thisMonthStart).getMonth() + 1);
        try {
            const hasNewPaidPlan = await this.eventsRepository.canLoadBirthdaysCalendar();
            if (hasNewPaidPlan) {
                await this.eventsRepository.loadContactsBirthdays();
            }
            await this.loadMonthsIfNeeded([new Date(thisMonthStart), nextMonthDate, previousMonthDate], progressMonitor);
        }
        finally {
            progressMonitor.completed();
            this.doRedraw();
        }
    });
    get calendarInvitations() {
        return this.calendarInvitationsModel.invitations;
    }
    get calendarColors() {
        return this._calendarColors;
    }
    get clientOnlyCalendars() {
        return this.localCalendars;
    }
    get calendarInfos() {
        return this.calendarModel.getCalendarInfosStream()();
    }
    get hiddenCalendars() {
        return this._hiddenCalendars;
    }
    get eventsForDays() {
        return this.eventsRepository.getEventsForMonths()();
    }
    get redraw() {
        return this._redrawStream;
    }
    get weekStart() {
        return getWeekStart(this.logins.getUserController().userSettingsGroupRoot);
    }
    // visibleForTesting
    allowDrag(event) {
        return this.canFullyEditEvent(event);
    }
    /**
     * Partially mirrors the logic from CalendarEventModel.prototype.isFullyWritable() to determine
     * if the user can edit more than just alarms for a given event
     */
    canFullyEditEvent(event) {
        const userController = this.logins.getUserController();
        const userMailGroup = userController.getUserMailGroupMembership().group;
        const mailboxDetailsArray = this.mailboxModel.mailboxDetails();
        const mailboxDetails = assertNotNull(mailboxDetailsArray.find((md) => md.mailGroup._id === userMailGroup));
        const ownMailAddresses = getEnabledMailAddressesWithUser(mailboxDetails, userController.userGroupInfo);
        const eventType = getEventType(event, this.calendarInfos, ownMailAddresses, userController);
        return eventType === "own" /* EventType.OWN */ || eventType === "shared_rw" /* EventType.SHARED_RW */;
    }
    onDragStart(originalEvent, timeToMoveBy) {
        if (this.allowDrag(originalEvent)) {
            let eventClone = clone(originalEvent);
            updateTemporaryEventWithDiff(eventClone, originalEvent, timeToMoveBy);
            this._draggedEvent = {
                originalEvent,
                eventClone,
            };
        }
    }
    onDragUpdate(timeToMoveBy) {
        if (this._draggedEvent) {
            updateTemporaryEventWithDiff(this._draggedEvent.eventClone, this._draggedEvent.originalEvent, timeToMoveBy);
        }
    }
    /**
     * This is called when the event is dropped.
     */
    async onDragEnd(timeToMoveBy, mode) {
        //if the time of the dragged event is the same as of the original we only cancel the drag
        if (timeToMoveBy !== 0 && mode != null) {
            if (this._draggedEvent == null)
                return;
            const { originalEvent, eventClone } = this._draggedEvent;
            this._draggedEvent = null;
            updateTemporaryEventWithDiff(eventClone, originalEvent, timeToMoveBy);
            this._addTransientEvent(eventClone);
            try {
                const didUpdate = await this.moveEvent(originalEvent, timeToMoveBy, mode);
                if (didUpdate !== 0 /* EventSaveResult.Saved */) {
                    this._removeTransientEvent(eventClone);
                }
            }
            catch (e) {
                this._removeTransientEvent(eventClone);
                throw e;
            }
        }
        else {
            this._draggedEvent = null;
        }
    }
    onDragCancel() {
        this._draggedEvent = null;
    }
    get temporaryEvents() {
        return this._transientEvents.concat(this._draggedEvent ? [this._draggedEvent.eventClone] : []);
    }
    setHiddenCalendars(newHiddenCalendars) {
        this._hiddenCalendars = newHiddenCalendars;
        this.deviceConfig.setHiddenCalendars(this.logins.getUserController().user._id, [...newHiddenCalendars]);
    }
    setSelectedTime(time) {
        // only ignore an actual time, setting to undefined is fine
        if (time != undefined && this.ignoreNextValidTimeSelection) {
            this.ignoreNextValidTimeSelection = false;
        }
        else {
            this.selectedTime = time;
        }
    }
    /**
     * Given an event and days, return the long and short events of that range of days
     * we detect events that should be removed based on their UID + start and end time
     *
     * @param days The range of days from which events should be returned
     * @returns    shortEvents: Array<Array<CalendarEvent>>, short events per day
     *             longEvents: Array<CalendarEvent>: long events over the whole range,
     *             days: Array<Date>: the original days that were passed in
     */
    getEventsOnDaysToRender(days) {
        // addDaysForRecurringEvents produces some weeks that have non-referentially-identical objects for the same event instance (occurrence)
        // in particular, this happens for the weeks straddling a month border because each month adds a different clone of the occurrence to its part of the week
        // this means we can't use a set to deduplicate these.
        /** A map from event id and start time to the event instance. It is not enough to just use an id because different occurrences will have the same id. */
        const longEvents = new Map();
        let shortEvents = [];
        // It might be the case that a UID is shared by events across calendars, so we need to differentiate them by list ID aswell
        const transientEventUidsByCalendar = groupByAndMapUniquely(this._transientEvents, (event) => getListId(event), (event) => event.uid);
        const sortEvent = (event, shortEventsForDay) => {
            if (isAllDayEvent(event) || getDiffIn60mIntervals(event.startTime, event.endTime) >= 24) {
                longEvents.set(getElementId(event) + event.startTime.toString(), event);
            }
            else {
                shortEventsForDay.push(event);
            }
        };
        for (const day of days) {
            const shortEventsForDay = [];
            const eventsForDay = this.eventsRepository.getEventsForMonths()().get(day.getTime()) || [];
            for (const event of eventsForDay) {
                if (transientEventUidsByCalendar.get(getListId(event))?.has(event.uid)) {
                    continue;
                }
                if (this._draggedEvent?.originalEvent !== event && shouldDisplayEvent(event, this._hiddenCalendars)) {
                    // this is not the dragged event (not rendered) and does not belong to a hidden calendar, so we should render it.
                    sortEvent(event, shortEventsForDay);
                }
            }
            for (const event of this._transientEvents) {
                if (isEventBetweenDays(event, day, day, this.timeZone)) {
                    sortEvent(event, shortEventsForDay);
                }
            }
            const temporaryEvent = this._draggedEvent?.eventClone;
            if (temporaryEvent && isEventBetweenDays(temporaryEvent, day, day, this.timeZone)) {
                sortEvent(temporaryEvent, shortEventsForDay);
            }
            shortEvents.push(shortEventsForDay);
        }
        const longEventsArray = Array.from(longEvents.values());
        return {
            days,
            longEvents: longEventsArray,
            shortEventsPerDay: shortEvents,
        };
    }
    async deleteCalendar(calendar) {
        await this.calendarModel.deleteCalendar(calendar);
    }
    _addTransientEvent(event) {
        this._transientEvents.push(event);
    }
    _removeTransientEvent(event) {
        findAndRemove(this._transientEvents, (transient) => transient.uid === event.uid);
    }
    /**
     * move an event to a new start time
     * @param event the actually dragged event (may be a repeated instance)
     * @param diff the amount of milliseconds to shift the event by
     * @param mode which parts of the series should be rescheduled?
     */
    async moveEvent(event, diff, mode) {
        if (event.uid == null) {
            throw new ProgrammingError("called moveEvent for an event without uid");
        }
        const editModel = await this.createCalendarEventEditModel(mode, event);
        if (editModel == null) {
            return 1 /* EventSaveResult.Failed */;
        }
        editModel.editModels.whenModel.rescheduleEvent({ millisecond: diff });
        if (getNonOrganizerAttendees(event).length > 0) {
            const response = await askIfShouldSendCalendarUpdatesToAttendees();
            if (response === "yes") {
                editModel.editModels.whoModel.shouldSendUpdates = true;
            }
            else if (response === "cancel") {
                return 1 /* EventSaveResult.Failed */;
            }
        }
        // Errors are handled in the individual views
        return await editModel.apply();
    }
    get eventPreviewModel() {
        return this.previewedEvent?.model ?? null;
    }
    /**
     * there are several reasons why we might no longer want to preview an event and need to redraw without
     * a previewed event:
     * * it was deleted
     * * it was moved away from the day we're looking at (or the day was moved away)
     * * the calendar was unshared or deleted
     *
     * we would want to keep the selection if the event merely shifted its start time but still intersects the viewed day,
     * but that would require going through the UID index because moving events changes their ID.
     * because of this and because previewedEvent is the event _before_ we got the update that caused us to reconsider the
     * selection, with the old times, this function only works if the selected date changed, but not if the event times
     * changed.
     */
    async updatePreviewedEvent(event) {
        if (event == null) {
            this.previewedEvent = null;
            this.doRedraw();
        }
        else {
            const previewedEvent = (this.previewedEvent = { event, model: null });
            const calendarInfos = await this.calendarModel.getCalendarInfosCreateIfNeeded();
            let previewModel;
            if (isClientOnlyCalendar(listIdPart(event._id))) {
                const idParts = event._id[1].split("#");
                const contactId = extractContactIdFromEvent(last(idParts));
                const contactIdParts = contactId.split("/");
                const contact = await this.contactModel.loadContactFromId([contactIdParts[0], contactIdParts[1]]);
                previewModel = await this.createCalendarContactPreviewModel(event, contact, true);
            }
            else {
                previewModel = await this.createCalendarEventPreviewModel(event, calendarInfos);
            }
            // check that we didn't start previewing another event or changed the date in the meantime
            if (this.previewedEvent === previewedEvent) {
                this.previewedEvent.model = previewModel;
                this.doRedraw();
            }
        }
    }
    async entityEventReceived(updates) {
        for (const update of updates) {
            if (isUpdateForTypeRef(CalendarEventTypeRef, update)) {
                const eventId = [update.instanceListId, update.instanceId];
                if (this.previewedEvent != null && isUpdateFor(this.previewedEvent.event, update)) {
                    if (update.operation === "2" /* OperationType.DELETE */) {
                        this.previewedEvent = null;
                        this.doRedraw();
                    }
                    else {
                        try {
                            const event = await this.entityClient.load(CalendarEventTypeRef, eventId);
                            await this.updatePreviewedEvent(event);
                        }
                        catch (e) {
                            if (e instanceof NotAuthorizedError) {
                                // return updates that are not in cache Range if NotAuthorizedError (for those updates that are in cache range)
                                console.log("NotAuthorizedError for event in entityEventsReceived of view", e);
                            }
                            else if (e instanceof NotFoundError) {
                                console.log("Not found event in entityEventsReceived of view", e);
                            }
                            else {
                                throw e;
                            }
                        }
                    }
                }
                const transientEvent = this._transientEvents.find((transientEvent) => isSameId(transientEvent._id, eventId));
                if (transientEvent) {
                    this._removeTransientEvent(transientEvent);
                    this.doRedraw();
                }
            }
            else if (isUpdateForTypeRef(ContactTypeRef, update) && this.isNewPaidPlan) {
                await this.eventsRepository.loadContactsBirthdays(true);
                this.eventsRepository.refreshBirthdayCalendar(this.selectedDate());
                this.doRedraw();
            }
            else if (isUpdateForTypeRef(CustomerInfoTypeRef, update)) {
                this.logins
                    .getUserController()
                    .isNewPaidPlan()
                    .then((isNewPaidPlan) => (this._isNewPaidPlan = isNewPaidPlan));
            }
        }
    }
    getCalendarInfosCreateIfNeeded() {
        return this.calendarModel.getCalendarInfosCreateIfNeeded();
    }
    loadMonthsIfNeeded(daysInMonths, progressMonitor) {
        return this.eventsRepository.loadMonthsIfNeeded(daysInMonths, progressMonitor, stream(false));
    }
    doRedraw() {
        // Need to pass some argument to make it a "set" operation
        this._redrawStream(undefined);
    }
    getScrollPosition() {
        return this.scrollPosition;
    }
    setScrollPosition(newPosition) {
        if (newPosition < 0) {
            this.scrollPosition = 0;
        }
        else if (this.scrollMax !== null && newPosition > this.scrollMax) {
            this.scrollPosition = this.scrollMax;
        }
        else {
            this.scrollPosition = newPosition;
        }
    }
    getScrollMaximum() {
        return this.scrollMax;
    }
    getViewSize() {
        return this.viewSize;
    }
    setViewParameters(dom) {
        this.scrollMax = dom.scrollHeight - dom.clientHeight;
        this.viewSize = dom.clientHeight;
    }
    scroll(by) {
        this.setScrollPosition(this.scrollPosition + by);
    }
    forceSyncExternal(groupSettings, longErrorMessage = false) {
        if (!groupSettings) {
            return;
        }
        return this.calendarModel.syncExternalCalendars([groupSettings], EXTERNAL_CALENDAR_SYNC_INTERVAL, longErrorMessage, true);
    }
    getCalendarModel() {
        return this.calendarModel;
    }
    handleClientOnlyUpdate(groupInfo, newGroupSettings) {
        this.deviceConfig.updateClientOnlyCalendars(groupInfo.group, newGroupSettings);
    }
    get isNewPaidPlan() {
        return this._isNewPaidPlan;
    }
}
function updateTemporaryEventWithDiff(eventClone, originalEvent, mouseDiff) {
    eventClone.startTime = new Date(originalEvent.startTime.getTime() + mouseDiff);
    eventClone.endTime = new Date(originalEvent.endTime.getTime() + mouseDiff);
}
//# sourceMappingURL=CalendarViewModel.js.map