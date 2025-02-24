import { __toESM } from "./chunk-chunk.js";
import "./dist-chunk.js";
import { ProgrammingError } from "./ProgrammingError-chunk.js";
import "./Env-chunk.js";
import "./ClientDetector-chunk.js";
import "./mithril-chunk.js";
import { assertNotNull, clone, debounce, deepEqual, downcast, findAndRemove, getStartOfDay, groupByAndMapUniquely, last } from "./dist2-chunk.js";
import "./WhitelabelCustomizations-chunk.js";
import { lang } from "./LanguageViewModel-chunk.js";
import "./styles-chunk.js";
import "./theme-chunk.js";
import { CLIENT_ONLY_CALENDARS, EXTERNAL_CALENDAR_SYNC_INTERVAL, OperationType, getWeekStart } from "./TutanotaConstants-chunk.js";
import "./KeyManager-chunk.js";
import "./WindowFacade-chunk.js";
import "./RootView-chunk.js";
import "./size-chunk.js";
import "./HtmlUtils-chunk.js";
import "./luxon-chunk.js";
import { getElementId, getListId, isSameId, listIdPart } from "./EntityUtils-chunk.js";
import "./TypeModels-chunk.js";
import { CalendarEventTypeRef, ContactTypeRef } from "./TypeRefs-chunk.js";
import { isAllDayEvent } from "./CommonCalendarUtils-chunk.js";
import "./TypeModels2-chunk.js";
import { CustomerInfoTypeRef } from "./TypeRefs2-chunk.js";
import "./ParserCombinator-chunk.js";
import { extractContactIdFromEvent, getDiffIn60mIntervals, getMonthRange, isClientOnlyCalendar, isEventBetweenDays } from "./CalendarUtils-chunk.js";
import "./ImportExportUtils-chunk.js";
import "./FormatValidator-chunk.js";
import { require_stream } from "./stream-chunk.js";
import { deviceConfig } from "./DeviceConfig-chunk.js";
import "./EntityFunctions-chunk.js";
import "./TypeModels3-chunk.js";
import "./ModelInfo-chunk.js";
import "./ErrorUtils-chunk.js";
import { NotAuthorizedError, NotFoundError } from "./RestError-chunk.js";
import "./SetupMultipleError-chunk.js";
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
import { isUpdateFor, isUpdateForTypeRef } from "./EntityUpdateUtils-chunk.js";
import "./dist3-chunk.js";
import "./Services-chunk.js";
import "./EntityClient-chunk.js";
import "./BirthdayUtils-chunk.js";
import "./Services2-chunk.js";
import "./GroupUtils-chunk.js";
import "./Button-chunk.js";
import "./Icons-chunk.js";
import "./DialogHeaderBar-chunk.js";
import "./CountryList-chunk.js";
import "./Dialog-chunk.js";
import "./Icon-chunk.js";
import "./AriaUtils-chunk.js";
import "./IconButton-chunk.js";
import { Time } from "./CalendarEventWhenModel-chunk.js";
import "./Formatter-chunk.js";
import "./ProgressMonitor-chunk.js";
import "./Notifications-chunk.js";
import "./CalendarFacade-chunk.js";
import "./CalendarModel-chunk.js";
import "./GroupUtils2-chunk.js";
import "./CommonLocator-chunk.js";
import "./UserError-chunk.js";
import "./MailAddressParser-chunk.js";
import "./BlobUtils-chunk.js";
import "./FileUtils-chunk.js";
import "./ProgressDialog-chunk.js";
import { getEnabledMailAddressesWithUser } from "./SharedMailUtils-chunk.js";
import "./PasswordUtils-chunk.js";
import "./Recipient-chunk.js";
import "./ContactUtils-chunk.js";
import "./RecipientsModel-chunk.js";
import { EventSaveResult, EventType, askIfShouldSendCalendarUpdatesToAttendees, getClientOnlyColors, getEventType, getGroupColors, getNonOrganizerAttendees, shouldDisplayEvent } from "./CalendarGuiUtils-chunk.js";
import "./UpgradeRequiredError-chunk.js";
import "./ColorPickerModel-chunk.js";

//#region src/calendar-app/calendar/view/CalendarViewModel.ts
var import_stream = __toESM(require_stream(), 1);
var CalendarViewModel = class {
	selectedDate = (0, import_stream.default)(getStartOfDay(new Date()));
	/**
	* An event currently being displayed (non-modally)
	* the {@code model} is {@code null} until it is loaded.
	*
	* We keep track of event separately to avoid races with selecting multiple events shortly one after another.
	*/
	previewedEvent = null;
	_hiddenCalendars;
	/** Events that have been dropped but still need to be rendered as temporary while waiting for entity updates. */
	_transientEvents;
	_draggedEvent = null;
	_redrawStream = (0, import_stream.default)();
	selectedTime;
	ignoreNextValidTimeSelection;
	scrollPosition = 0;
	scrollMax = null;
	viewSize = null;
	_isNewPaidPlan = false;
	localCalendars = new Map();
	_calendarColors = new Map();
	constructor(logins, createCalendarEventEditModel, createCalendarEventPreviewModel, createCalendarContactPreviewModel, calendarModel, eventsRepository, entityClient, eventController, progressTracker, deviceConfig$1, calendarInvitationsModel, timeZone, mailboxModel, contactModel) {
		this.logins = logins;
		this.createCalendarEventEditModel = createCalendarEventEditModel;
		this.createCalendarEventPreviewModel = createCalendarEventPreviewModel;
		this.createCalendarContactPreviewModel = createCalendarContactPreviewModel;
		this.calendarModel = calendarModel;
		this.eventsRepository = eventsRepository;
		this.entityClient = entityClient;
		this.progressTracker = progressTracker;
		this.deviceConfig = deviceConfig$1;
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
				const groupRoots = Array.from(newInfos.values()).map((i) => i.groupRoot);
				const lists = [...groupRoots.map((g) => g.longEvents), ...groupRoots.map((g) => g.shortEvents)];
				const previewListId = getListId(event);
				if (!lists.some((id) => isSameId(previewListId, id))) this.updatePreviewedEvent(null);
			}
			this.preloadMonthsAroundSelectedDate();
		});
		eventController.addEntityListener((updates) => this.entityEventReceived(updates));
		calendarInvitationsModel.init();
		this.eventsRepository.getEventsForMonths().map(() => {
			this.doRedraw();
		});
		this.loadCalendarColors();
		logins.getUserController().isNewPaidPlan().then((isNewPaidPlan) => {
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
		for (let [calendarId, color] of clientOnlyColors.entries()) groupColors.set(calendarId, color);
		if (!deepEqual(this._calendarColors, groupColors)) this._calendarColors = new Map(groupColors);
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
				groupInfo: clientOnlyCalendarConfig ? {
					name: clientOnlyCalendarConfig.name,
					group: calendarID
				} : {
					name: lang.get(name),
					group: calendarID
				},
				group: { _id: calendarID },
				shared: false,
				userIsOwner: true
			}));
			if (!this.isNewPaidPlan && !this.hiddenCalendars.has(calendarID)) this._hiddenCalendars.add(calendarID);
		}
	}
	/**
	* react to changes to the calendar data by making sure we have the current month + the two adjacent months
	* ready to be rendered
	*/
	preloadMonthsAroundSelectedDate = debounce(200, async () => {
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
			if (hasNewPaidPlan) await this.eventsRepository.loadContactsBirthdays();
			await this.loadMonthsIfNeeded([
				new Date(thisMonthStart),
				nextMonthDate,
				previousMonthDate
			], progressMonitor);
		} finally {
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
		return eventType === EventType.OWN || eventType === EventType.SHARED_RW;
	}
	onDragStart(originalEvent, timeToMoveBy) {
		if (this.allowDrag(originalEvent)) {
			let eventClone = clone(originalEvent);
			updateTemporaryEventWithDiff(eventClone, originalEvent, timeToMoveBy);
			this._draggedEvent = {
				originalEvent,
				eventClone
			};
		}
	}
	onDragUpdate(timeToMoveBy) {
		if (this._draggedEvent) updateTemporaryEventWithDiff(this._draggedEvent.eventClone, this._draggedEvent.originalEvent, timeToMoveBy);
	}
	/**
	* This is called when the event is dropped.
	*/
	async onDragEnd(timeToMoveBy, mode) {
		if (timeToMoveBy !== 0 && mode != null) {
			if (this._draggedEvent == null) return;
			const { originalEvent, eventClone } = this._draggedEvent;
			this._draggedEvent = null;
			updateTemporaryEventWithDiff(eventClone, originalEvent, timeToMoveBy);
			this._addTransientEvent(eventClone);
			try {
				const didUpdate = await this.moveEvent(originalEvent, timeToMoveBy, mode);
				if (didUpdate !== EventSaveResult.Saved) this._removeTransientEvent(eventClone);
			} catch (e) {
				this._removeTransientEvent(eventClone);
				throw e;
			}
		} else this._draggedEvent = null;
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
		if (time != undefined && this.ignoreNextValidTimeSelection) this.ignoreNextValidTimeSelection = false;
else this.selectedTime = time;
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
		/** A map from event id and start time to the event instance. It is not enough to just use an id because different occurrences will have the same id. */
		const longEvents = new Map();
		let shortEvents = [];
		const transientEventUidsByCalendar = groupByAndMapUniquely(this._transientEvents, (event) => getListId(event), (event) => event.uid);
		const sortEvent = (event, shortEventsForDay) => {
			if (isAllDayEvent(event) || getDiffIn60mIntervals(event.startTime, event.endTime) >= 24) longEvents.set(getElementId(event) + event.startTime.toString(), event);
else shortEventsForDay.push(event);
		};
		for (const day of days) {
			const shortEventsForDay = [];
			const eventsForDay = this.eventsRepository.getEventsForMonths()().get(day.getTime()) || [];
			for (const event of eventsForDay) {
				if (transientEventUidsByCalendar.get(getListId(event))?.has(event.uid)) continue;
				if (this._draggedEvent?.originalEvent !== event && shouldDisplayEvent(event, this._hiddenCalendars)) sortEvent(event, shortEventsForDay);
			}
			for (const event of this._transientEvents) if (isEventBetweenDays(event, day, day, this.timeZone)) sortEvent(event, shortEventsForDay);
			const temporaryEvent = this._draggedEvent?.eventClone;
			if (temporaryEvent && isEventBetweenDays(temporaryEvent, day, day, this.timeZone)) sortEvent(temporaryEvent, shortEventsForDay);
			shortEvents.push(shortEventsForDay);
		}
		const longEventsArray = Array.from(longEvents.values());
		return {
			days,
			longEvents: longEventsArray,
			shortEventsPerDay: shortEvents
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
		if (event.uid == null) throw new ProgrammingError("called moveEvent for an event without uid");
		const editModel = await this.createCalendarEventEditModel(mode, event);
		if (editModel == null) return EventSaveResult.Failed;
		editModel.editModels.whenModel.rescheduleEvent({ millisecond: diff });
		if (getNonOrganizerAttendees(event).length > 0) {
			const response = await askIfShouldSendCalendarUpdatesToAttendees();
			if (response === "yes") editModel.editModels.whoModel.shouldSendUpdates = true;
else if (response === "cancel") return EventSaveResult.Failed;
		}
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
		} else {
			const previewedEvent = this.previewedEvent = {
				event,
				model: null
			};
			const calendarInfos = await this.calendarModel.getCalendarInfosCreateIfNeeded();
			let previewModel;
			if (isClientOnlyCalendar(listIdPart(event._id))) {
				const idParts = event._id[1].split("#");
				const contactId = extractContactIdFromEvent(last(idParts));
				const contactIdParts = contactId.split("/");
				const contact = await this.contactModel.loadContactFromId([contactIdParts[0], contactIdParts[1]]);
				previewModel = await this.createCalendarContactPreviewModel(event, contact, true);
			} else previewModel = await this.createCalendarEventPreviewModel(event, calendarInfos);
			if (this.previewedEvent === previewedEvent) {
				this.previewedEvent.model = previewModel;
				this.doRedraw();
			}
		}
	}
	async entityEventReceived(updates) {
		for (const update of updates) if (isUpdateForTypeRef(CalendarEventTypeRef, update)) {
			const eventId = [update.instanceListId, update.instanceId];
			if (this.previewedEvent != null && isUpdateFor(this.previewedEvent.event, update)) if (update.operation === OperationType.DELETE) {
				this.previewedEvent = null;
				this.doRedraw();
			} else try {
				const event = await this.entityClient.load(CalendarEventTypeRef, eventId);
				await this.updatePreviewedEvent(event);
			} catch (e) {
				if (e instanceof NotAuthorizedError) console.log("NotAuthorizedError for event in entityEventsReceived of view", e);
else if (e instanceof NotFoundError) console.log("Not found event in entityEventsReceived of view", e);
else throw e;
			}
			const transientEvent = this._transientEvents.find((transientEvent$1) => isSameId(transientEvent$1._id, eventId));
			if (transientEvent) {
				this._removeTransientEvent(transientEvent);
				this.doRedraw();
			}
		} else if (isUpdateForTypeRef(ContactTypeRef, update) && this.isNewPaidPlan) {
			await this.eventsRepository.loadContactsBirthdays(true);
			this.eventsRepository.refreshBirthdayCalendar(this.selectedDate());
			this.doRedraw();
		} else if (isUpdateForTypeRef(CustomerInfoTypeRef, update)) this.logins.getUserController().isNewPaidPlan().then((isNewPaidPlan) => this._isNewPaidPlan = isNewPaidPlan);
	}
	getCalendarInfosCreateIfNeeded() {
		return this.calendarModel.getCalendarInfosCreateIfNeeded();
	}
	loadMonthsIfNeeded(daysInMonths, progressMonitor) {
		return this.eventsRepository.loadMonthsIfNeeded(daysInMonths, progressMonitor, (0, import_stream.default)(false));
	}
	doRedraw() {
		this._redrawStream(undefined);
	}
	getScrollPosition() {
		return this.scrollPosition;
	}
	setScrollPosition(newPosition) {
		if (newPosition < 0) this.scrollPosition = 0;
else if (this.scrollMax !== null && newPosition > this.scrollMax) this.scrollPosition = this.scrollMax;
else this.scrollPosition = newPosition;
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
		if (!groupSettings) return;
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
};
function updateTemporaryEventWithDiff(eventClone, originalEvent, mouseDiff) {
	eventClone.startTime = new Date(originalEvent.startTime.getTime() + mouseDiff);
	eventClone.endTime = new Date(originalEvent.endTime.getTime() + mouseDiff);
}

//#endregion
export { CalendarViewModel };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FsZW5kYXJWaWV3TW9kZWwtY2h1bmsuanMiLCJuYW1lcyI6WyJsb2dpbnM6IExvZ2luQ29udHJvbGxlciIsImNyZWF0ZUNhbGVuZGFyRXZlbnRFZGl0TW9kZWw6IENhbGVuZGFyRXZlbnRFZGl0TW9kZWxzRmFjdG9yeSIsImNyZWF0ZUNhbGVuZGFyRXZlbnRQcmV2aWV3TW9kZWw6IENhbGVuZGFyRXZlbnRQcmV2aWV3TW9kZWxGYWN0b3J5IiwiY3JlYXRlQ2FsZW5kYXJDb250YWN0UHJldmlld01vZGVsOiBDYWxlbmRhckNvbnRhY3RQcmV2aWV3TW9kZWxGYWN0b3J5IiwiY2FsZW5kYXJNb2RlbDogQ2FsZW5kYXJNb2RlbCIsImV2ZW50c1JlcG9zaXRvcnk6IENhbGVuZGFyRXZlbnRzUmVwb3NpdG9yeSIsImVudGl0eUNsaWVudDogRW50aXR5Q2xpZW50IiwiZXZlbnRDb250cm9sbGVyOiBFdmVudENvbnRyb2xsZXIiLCJwcm9ncmVzc1RyYWNrZXI6IFByb2dyZXNzVHJhY2tlciIsImRldmljZUNvbmZpZzogRGV2aWNlQ29uZmlnIiwiY2FsZW5kYXJJbnZpdGF0aW9uc01vZGVsOiBSZWNlaXZlZEdyb3VwSW52aXRhdGlvbnNNb2RlbDxHcm91cFR5cGUuQ2FsZW5kYXI+IiwidGltZVpvbmU6IHN0cmluZyIsIm1haWxib3hNb2RlbDogTWFpbGJveE1vZGVsIiwiY29udGFjdE1vZGVsOiBDb250YWN0TW9kZWwiLCJleHBhbmRlZDogYm9vbGVhbiIsInByb2dyZXNzTW9uaXRvcjogSVByb2dyZXNzTW9uaXRvciIsImV2ZW50OiBDYWxlbmRhckV2ZW50Iiwib3JpZ2luYWxFdmVudDogQ2FsZW5kYXJFdmVudCIsInRpbWVUb01vdmVCeTogbnVtYmVyIiwibW9kZTogQ2FsZW5kYXJPcGVyYXRpb24gfCBudWxsIiwibmV3SGlkZGVuQ2FsZW5kYXJzOiBTZXQ8SWQ+IiwidGltZTogVGltZSB8IHVuZGVmaW5lZCIsImRheXM6IEFycmF5PERhdGU+IiwibG9uZ0V2ZW50czogTWFwPHN0cmluZywgQ2FsZW5kYXJFdmVudD4iLCJzaG9ydEV2ZW50czogQXJyYXk8QXJyYXk8Q2FsZW5kYXJFdmVudD4+Iiwic2hvcnRFdmVudHNGb3JEYXk6IEFycmF5PENhbGVuZGFyRXZlbnQ+Iiwic2hvcnRFdmVudHNGb3JEYXk6IENhbGVuZGFyRXZlbnRbXSIsImNhbGVuZGFyOiBDYWxlbmRhckluZm8iLCJkaWZmOiBudW1iZXIiLCJtb2RlOiBDYWxlbmRhck9wZXJhdGlvbiIsImV2ZW50OiBDYWxlbmRhckV2ZW50IHwgbnVsbCIsInByZXZpZXdNb2RlbDogQ2FsZW5kYXJQcmV2aWV3TW9kZWxzIiwidXBkYXRlczogUmVhZG9ubHlBcnJheTxFbnRpdHlVcGRhdGVEYXRhPiIsImV2ZW50SWQ6IElkVHVwbGUiLCJ0cmFuc2llbnRFdmVudCIsImRheXNJbk1vbnRoczogQXJyYXk8RGF0ZT4iLCJuZXdQb3NpdGlvbjogbnVtYmVyIiwiZG9tOiBIVE1MRWxlbWVudCIsImJ5OiBudW1iZXIiLCJncm91cFNldHRpbmdzOiBHcm91cFNldHRpbmdzIHwgbnVsbCIsImxvbmdFcnJvck1lc3NhZ2U6IGJvb2xlYW4iLCJncm91cEluZm86IEdyb3VwSW5mbyIsIm5ld0dyb3VwU2V0dGluZ3M6IEdyb3VwU2V0dGluZ3MiLCJldmVudENsb25lOiBDYWxlbmRhckV2ZW50IiwibW91c2VEaWZmOiBudW1iZXIiXSwic291cmNlcyI6WyIuLi9zcmMvY2FsZW5kYXItYXBwL2NhbGVuZGFyL3ZpZXcvQ2FsZW5kYXJWaWV3TW9kZWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcblx0JFByb21pc2FibGUsXG5cdGFzc2VydE5vdE51bGwsXG5cdGNsb25lLFxuXHRkZWJvdW5jZSxcblx0ZGVlcEVxdWFsLFxuXHRkb3duY2FzdCxcblx0ZmluZEFuZFJlbW92ZSxcblx0Z2V0U3RhcnRPZkRheSxcblx0Z3JvdXBCeUFuZE1hcFVuaXF1ZWx5LFxuXHRsYXN0LFxufSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB7IENhbGVuZGFyRXZlbnQsIENhbGVuZGFyRXZlbnRUeXBlUmVmLCBDb250YWN0LCBDb250YWN0VHlwZVJlZiwgR3JvdXBTZXR0aW5ncyB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2VudGl0aWVzL3R1dGFub3RhL1R5cGVSZWZzLmpzXCJcbmltcG9ydCB7XG5cdENMSUVOVF9PTkxZX0NBTEVOREFSUyxcblx0RVhURVJOQUxfQ0FMRU5EQVJfU1lOQ19JTlRFUlZBTCxcblx0Z2V0V2Vla1N0YXJ0LFxuXHRHcm91cFR5cGUsXG5cdE9wZXJhdGlvblR5cGUsXG5cdFdlZWtTdGFydCxcbn0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL1R1dGFub3RhQ29uc3RhbnRzXCJcbmltcG9ydCB7IE5vdEF1dGhvcml6ZWRFcnJvciwgTm90Rm91bmRFcnJvciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9lcnJvci9SZXN0RXJyb3JcIlxuaW1wb3J0IHsgZ2V0RWxlbWVudElkLCBnZXRMaXN0SWQsIGlzU2FtZUlkLCBsaXN0SWRQYXJ0IH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL3V0aWxzL0VudGl0eVV0aWxzXCJcbmltcG9ydCB7IExvZ2luQ29udHJvbGxlciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL21haW4vTG9naW5Db250cm9sbGVyXCJcbmltcG9ydCB7IElQcm9ncmVzc01vbml0b3IgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vdXRpbHMvUHJvZ3Jlc3NNb25pdG9yXCJcbmltcG9ydCB7IEN1c3RvbWVySW5mb1R5cGVSZWYsIEdyb3VwSW5mbywgUmVjZWl2ZWRHcm91cEludml0YXRpb24gfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9lbnRpdGllcy9zeXMvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHN0cmVhbSBmcm9tIFwibWl0aHJpbC9zdHJlYW1cIlxuaW1wb3J0IFN0cmVhbSBmcm9tIFwibWl0aHJpbC9zdHJlYW1cIlxuaW1wb3J0IHtcblx0ZXh0cmFjdENvbnRhY3RJZEZyb21FdmVudCxcblx0Z2V0RGlmZkluNjBtSW50ZXJ2YWxzLFxuXHRnZXRNb250aFJhbmdlLFxuXHRpc0NsaWVudE9ubHlDYWxlbmRhcixcblx0aXNFdmVudEJldHdlZW5EYXlzLFxufSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2NhbGVuZGFyL2RhdGUvQ2FsZW5kYXJVdGlsc1wiXG5pbXBvcnQgeyBpc0FsbERheUV2ZW50IH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL3V0aWxzL0NvbW1vbkNhbGVuZGFyVXRpbHNcIlxuaW1wb3J0IHsgQ2FsZW5kYXJFdmVudE1vZGVsLCBDYWxlbmRhck9wZXJhdGlvbiwgRXZlbnRTYXZlUmVzdWx0LCBFdmVudFR5cGUsIGdldE5vbk9yZ2FuaXplckF0dGVuZGVlcyB9IGZyb20gXCIuLi9ndWkvZXZlbnRlZGl0b3ItbW9kZWwvQ2FsZW5kYXJFdmVudE1vZGVsLmpzXCJcbmltcG9ydCB7IGFza0lmU2hvdWxkU2VuZENhbGVuZGFyVXBkYXRlc1RvQXR0ZW5kZWVzLCBnZXRDbGllbnRPbmx5Q29sb3JzLCBnZXRFdmVudFR5cGUsIGdldEdyb3VwQ29sb3JzLCBzaG91bGREaXNwbGF5RXZlbnQgfSBmcm9tIFwiLi4vZ3VpL0NhbGVuZGFyR3VpVXRpbHMuanNcIlxuaW1wb3J0IHsgUmVjZWl2ZWRHcm91cEludml0YXRpb25zTW9kZWwgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL3NoYXJpbmcvbW9kZWwvUmVjZWl2ZWRHcm91cEludml0YXRpb25zTW9kZWxcIlxuaW1wb3J0IHR5cGUgeyBDYWxlbmRhckluZm8sIENhbGVuZGFyTW9kZWwgfSBmcm9tIFwiLi4vbW9kZWwvQ2FsZW5kYXJNb2RlbFwiXG5pbXBvcnQgeyBFdmVudENvbnRyb2xsZXIgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9tYWluL0V2ZW50Q29udHJvbGxlclwiXG5pbXBvcnQgeyBFbnRpdHlDbGllbnQgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vRW50aXR5Q2xpZW50XCJcbmltcG9ydCB7IFByb2dyZXNzVHJhY2tlciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL21haW4vUHJvZ3Jlc3NUcmFja2VyXCJcbmltcG9ydCB7IGRldmljZUNvbmZpZywgRGV2aWNlQ29uZmlnIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9taXNjL0RldmljZUNvbmZpZ1wiXG5pbXBvcnQgdHlwZSB7IEV2ZW50RHJhZ0hhbmRsZXJDYWxsYmFja3MgfSBmcm9tIFwiLi9FdmVudERyYWdIYW5kbGVyXCJcbmltcG9ydCB7IFByb2dyYW1taW5nRXJyb3IgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vZXJyb3IvUHJvZ3JhbW1pbmdFcnJvci5qc1wiXG5pbXBvcnQgeyBUaW1lIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9jYWxlbmRhci9kYXRlL1RpbWUuanNcIlxuaW1wb3J0IHsgQ2FsZW5kYXJFdmVudHNSZXBvc2l0b3J5LCBEYXlzVG9FdmVudHMgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2NhbGVuZGFyL2RhdGUvQ2FsZW5kYXJFdmVudHNSZXBvc2l0b3J5LmpzXCJcbmltcG9ydCB7IENhbGVuZGFyRXZlbnRQcmV2aWV3Vmlld01vZGVsIH0gZnJvbSBcIi4uL2d1aS9ldmVudHBvcHVwL0NhbGVuZGFyRXZlbnRQcmV2aWV3Vmlld01vZGVsLmpzXCJcbmltcG9ydCB7IEVudGl0eVVwZGF0ZURhdGEsIGlzVXBkYXRlRm9yLCBpc1VwZGF0ZUZvclR5cGVSZWYgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vdXRpbHMvRW50aXR5VXBkYXRlVXRpbHMuanNcIlxuaW1wb3J0IHsgTWFpbGJveE1vZGVsIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9tYWlsRnVuY3Rpb25hbGl0eS9NYWlsYm94TW9kZWwuanNcIlxuaW1wb3J0IHsgZ2V0RW5hYmxlZE1haWxBZGRyZXNzZXNXaXRoVXNlciB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vbWFpbEZ1bmN0aW9uYWxpdHkvU2hhcmVkTWFpbFV0aWxzLmpzXCJcbmltcG9ydCB7IENvbnRhY3RNb2RlbCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vY29udGFjdHNGdW5jdGlvbmFsaXR5L0NvbnRhY3RNb2RlbC5qc1wiXG5pbXBvcnQgdHlwZSB7IEdyb3VwQ29sb3JzIH0gZnJvbSBcIi4vQ2FsZW5kYXJWaWV3LmpzXCJcbmltcG9ydCB7IGxhbmcgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21pc2MvTGFuZ3VhZ2VWaWV3TW9kZWwuanNcIlxuaW1wb3J0IHsgQ2FsZW5kYXJDb250YWN0UHJldmlld1ZpZXdNb2RlbCB9IGZyb20gXCIuLi9ndWkvZXZlbnRwb3B1cC9DYWxlbmRhckNvbnRhY3RQcmV2aWV3Vmlld01vZGVsLmpzXCJcblxuZXhwb3J0IHR5cGUgRXZlbnRzT25EYXlzID0ge1xuXHRkYXlzOiBBcnJheTxEYXRlPlxuXHRzaG9ydEV2ZW50c1BlckRheTogQXJyYXk8QXJyYXk8Q2FsZW5kYXJFdmVudD4+XG5cdGxvbmdFdmVudHM6IEFycmF5PENhbGVuZGFyRXZlbnQ+XG59XG5cbi8qKiBjb250YWluZXIgdG8gZm9yIHRoZSBpbmZvcm1hdGlvbiBuZWVkZWQgdG8gcmVuZGVyICYgaGFuZGxlIGEgcmVzY2hlZHVsZSB3aXRoIGRyYWctYW5kLWRyb3AgKi9cbmV4cG9ydCB0eXBlIERyYWdnZWRFdmVudCA9IHtcblx0LyoqIHRoZSBldmVudCBpbnN0YW5jZSB0aGUgdXNlciBncmFiYmVkIHdpdGggdGhlIG1vdXNlICovXG5cdG9yaWdpbmFsRXZlbnQ6IENhbGVuZGFyRXZlbnRcblx0LyoqIHRoZSB0ZW1wb3JhcnkgZXZlbnQgdGhhdCdzIHNob3duIGR1cmluZyB0aGUgZHJhZyAqL1xuXHRldmVudENsb25lOiBDYWxlbmRhckV2ZW50XG59XG5cbmV4cG9ydCB0eXBlIE1vdXNlT3JQb2ludGVyRXZlbnQgPSBNb3VzZUV2ZW50IHwgUG9pbnRlckV2ZW50XG5leHBvcnQgdHlwZSBDYWxlbmRhckV2ZW50QnViYmxlQ2xpY2tIYW5kbGVyID0gKGFyZzA6IENhbGVuZGFyRXZlbnQsIGFyZzE6IE1vdXNlT3JQb2ludGVyRXZlbnQpID0+IHVua25vd25cbmV4cG9ydCB0eXBlIENhbGVuZGFyRXZlbnRCdWJibGVLZXlEb3duSGFuZGxlciA9IChhcmcwOiBDYWxlbmRhckV2ZW50LCBhcmcxOiBLZXlib2FyZEV2ZW50KSA9PiB1bmtub3duXG5leHBvcnQgdHlwZSBDYWxlbmRhckV2ZW50RWRpdE1vZGVsc0ZhY3RvcnkgPSAobW9kZTogQ2FsZW5kYXJPcGVyYXRpb24sIGV2ZW50OiBDYWxlbmRhckV2ZW50KSA9PiBQcm9taXNlPENhbGVuZGFyRXZlbnRNb2RlbCB8IG51bGw+XG5cbmV4cG9ydCB0eXBlIENhbGVuZGFyRXZlbnRQcmV2aWV3TW9kZWxGYWN0b3J5ID0gKFxuXHRzZWxlY3RlZEV2ZW50OiBDYWxlbmRhckV2ZW50LFxuXHRjYWxlbmRhcnM6IFJlYWRvbmx5TWFwPHN0cmluZywgQ2FsZW5kYXJJbmZvPixcbikgPT4gUHJvbWlzZTxDYWxlbmRhckV2ZW50UHJldmlld1ZpZXdNb2RlbD5cbmV4cG9ydCB0eXBlIENhbGVuZGFyQ29udGFjdFByZXZpZXdNb2RlbEZhY3RvcnkgPSAoZXZlbnQ6IENhbGVuZGFyRXZlbnQsIGNvbnRhY3Q6IENvbnRhY3QsIGNhbkVkaXQ6IGJvb2xlYW4pID0+IFByb21pc2U8Q2FsZW5kYXJDb250YWN0UHJldmlld1ZpZXdNb2RlbD5cbmV4cG9ydCB0eXBlIENhbGVuZGFyUHJldmlld01vZGVscyA9IENhbGVuZGFyRXZlbnRQcmV2aWV3Vmlld01vZGVsIHwgQ2FsZW5kYXJDb250YWN0UHJldmlld1ZpZXdNb2RlbFxuXG5leHBvcnQgY2xhc3MgQ2FsZW5kYXJWaWV3TW9kZWwgaW1wbGVtZW50cyBFdmVudERyYWdIYW5kbGVyQ2FsbGJhY2tzIHtcblx0Ly8gU2hvdWxkIG5vdCBiZSBjaGFuZ2VkIGRpcmVjdGx5IGJ1dCBvbmx5IHRocm91Z2ggdGhlIFVSTFxuXHRyZWFkb25seSBzZWxlY3RlZERhdGU6IFN0cmVhbTxEYXRlPiA9IHN0cmVhbShnZXRTdGFydE9mRGF5KG5ldyBEYXRlKCkpKVxuXG5cdC8qKlxuXHQgKiBBbiBldmVudCBjdXJyZW50bHkgYmVpbmcgZGlzcGxheWVkIChub24tbW9kYWxseSlcblx0ICogdGhlIHtAY29kZSBtb2RlbH0gaXMge0Bjb2RlIG51bGx9IHVudGlsIGl0IGlzIGxvYWRlZC5cblx0ICpcblx0ICogV2Uga2VlcCB0cmFjayBvZiBldmVudCBzZXBhcmF0ZWx5IHRvIGF2b2lkIHJhY2VzIHdpdGggc2VsZWN0aW5nIG11bHRpcGxlIGV2ZW50cyBzaG9ydGx5IG9uZSBhZnRlciBhbm90aGVyLlxuXHQgKi9cblx0cHJpdmF0ZSBwcmV2aWV3ZWRFdmVudDogeyBldmVudDogQ2FsZW5kYXJFdmVudDsgbW9kZWw6IENhbGVuZGFyUHJldmlld01vZGVscyB8IG51bGwgfSB8IG51bGwgPSBudWxsXG5cblx0cHJpdmF0ZSBfaGlkZGVuQ2FsZW5kYXJzOiBTZXQ8SWQ+XG5cdC8qKiBFdmVudHMgdGhhdCBoYXZlIGJlZW4gZHJvcHBlZCBidXQgc3RpbGwgbmVlZCB0byBiZSByZW5kZXJlZCBhcyB0ZW1wb3Jhcnkgd2hpbGUgd2FpdGluZyBmb3IgZW50aXR5IHVwZGF0ZXMuICovXG5cdC8vIHZpc2libGUgZm9yIHRlc3RzXG5cdHJlYWRvbmx5IF90cmFuc2llbnRFdmVudHM6IEFycmF5PENhbGVuZGFyRXZlbnQ+XG5cdC8vIHZpc2libGUgZm9yIHRlc3RzXG5cdF9kcmFnZ2VkRXZlbnQ6IERyYWdnZWRFdmVudCB8IG51bGwgPSBudWxsXG5cdHByaXZhdGUgcmVhZG9ubHkgX3JlZHJhd1N0cmVhbTogU3RyZWFtPHZvaWQ+ID0gc3RyZWFtKClcblx0c2VsZWN0ZWRUaW1lOiBUaW1lIHwgdW5kZWZpbmVkXG5cdC8vIFdoZW4gc2V0IHRvIHRydWUsIGlnbm9yZXMgdGhlIG5leHQgc2V0dGluZyBvZiBzZWxlY3RlZFRpbWVcblx0aWdub3JlTmV4dFZhbGlkVGltZVNlbGVjdGlvbjogYm9vbGVhblxuXG5cdHByaXZhdGUgc2Nyb2xsUG9zaXRpb246IG51bWJlciA9IDAgLy8gc2l6ZS5jYWxlbmRhcl9ob3VyX2hlaWdodCAqIERFRkFVTFRfSE9VUl9PRl9EQVlcblx0Ly8gVGhlIG1heGltdW0gc2Nyb2xsIHZhbHVlIG9mIHRoZSBsaXN0IGluIHRoZSB2aWV3XG5cdHByaXZhdGUgc2Nyb2xsTWF4OiBudW1iZXIgfCBudWxsID0gbnVsbFxuXHQvLyBUaGUgc2l6ZSBvZiB0aGUgbGlzdCBpbiB0aGUgdmlld1xuXHRwcml2YXRlIHZpZXdTaXplOiBudW1iZXIgfCBudWxsID0gbnVsbFxuXG5cdHByaXZhdGUgX2lzTmV3UGFpZFBsYW46IGJvb2xlYW4gPSBmYWxzZVxuXHRwcml2YXRlIGxvY2FsQ2FsZW5kYXJzOiBNYXA8SWQsIENhbGVuZGFySW5mbz4gPSBuZXcgTWFwPElkLCBDYWxlbmRhckluZm8+KClcblx0cHJpdmF0ZSBfY2FsZW5kYXJDb2xvcnM6IEdyb3VwQ29sb3JzID0gbmV3IE1hcCgpXG5cblx0Y29uc3RydWN0b3IoXG5cdFx0cHJpdmF0ZSByZWFkb25seSBsb2dpbnM6IExvZ2luQ29udHJvbGxlcixcblx0XHRwcml2YXRlIHJlYWRvbmx5IGNyZWF0ZUNhbGVuZGFyRXZlbnRFZGl0TW9kZWw6IENhbGVuZGFyRXZlbnRFZGl0TW9kZWxzRmFjdG9yeSxcblx0XHRwcml2YXRlIHJlYWRvbmx5IGNyZWF0ZUNhbGVuZGFyRXZlbnRQcmV2aWV3TW9kZWw6IENhbGVuZGFyRXZlbnRQcmV2aWV3TW9kZWxGYWN0b3J5LFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgY3JlYXRlQ2FsZW5kYXJDb250YWN0UHJldmlld01vZGVsOiBDYWxlbmRhckNvbnRhY3RQcmV2aWV3TW9kZWxGYWN0b3J5LFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgY2FsZW5kYXJNb2RlbDogQ2FsZW5kYXJNb2RlbCxcblx0XHRwcml2YXRlIHJlYWRvbmx5IGV2ZW50c1JlcG9zaXRvcnk6IENhbGVuZGFyRXZlbnRzUmVwb3NpdG9yeSxcblx0XHRwcml2YXRlIHJlYWRvbmx5IGVudGl0eUNsaWVudDogRW50aXR5Q2xpZW50LFxuXHRcdGV2ZW50Q29udHJvbGxlcjogRXZlbnRDb250cm9sbGVyLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgcHJvZ3Jlc3NUcmFja2VyOiBQcm9ncmVzc1RyYWNrZXIsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBkZXZpY2VDb25maWc6IERldmljZUNvbmZpZyxcblx0XHRwcml2YXRlIHJlYWRvbmx5IGNhbGVuZGFySW52aXRhdGlvbnNNb2RlbDogUmVjZWl2ZWRHcm91cEludml0YXRpb25zTW9kZWw8R3JvdXBUeXBlLkNhbGVuZGFyPixcblx0XHRwcml2YXRlIHJlYWRvbmx5IHRpbWVab25lOiBzdHJpbmcsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBtYWlsYm94TW9kZWw6IE1haWxib3hNb2RlbCxcblx0XHRwcml2YXRlIHJlYWRvbmx5IGNvbnRhY3RNb2RlbDogQ29udGFjdE1vZGVsLFxuXHQpIHtcblx0XHR0aGlzLl90cmFuc2llbnRFdmVudHMgPSBbXVxuXG5cdFx0Y29uc3QgdXNlcklkID0gbG9naW5zLmdldFVzZXJDb250cm9sbGVyKCkudXNlci5faWRcblx0XHRjb25zdCB0b2RheSA9IG5ldyBEYXRlKClcblxuXHRcdHRoaXMuX2hpZGRlbkNhbGVuZGFycyA9IG5ldyBTZXQodGhpcy5kZXZpY2VDb25maWcuZ2V0SGlkZGVuQ2FsZW5kYXJzKHVzZXJJZCkpXG5cblx0XHR0aGlzLnNlbGVjdGVkRGF0ZS5tYXAoKCkgPT4ge1xuXHRcdFx0dGhpcy51cGRhdGVQcmV2aWV3ZWRFdmVudChudWxsKVxuXHRcdFx0dGhpcy5wcmVsb2FkTW9udGhzQXJvdW5kU2VsZWN0ZWREYXRlKClcblx0XHR9KVxuXHRcdHRoaXMuc2VsZWN0ZWRUaW1lID0gVGltZS5mcm9tRGF0ZSh0b2RheSlcblx0XHR0aGlzLmlnbm9yZU5leHRWYWxpZFRpbWVTZWxlY3Rpb24gPSBmYWxzZVxuXHRcdHRoaXMuY2FsZW5kYXJNb2RlbC5nZXRDYWxlbmRhckluZm9zU3RyZWFtKCkubWFwKChuZXdJbmZvcykgPT4ge1xuXHRcdFx0Y29uc3QgZXZlbnQgPSB0aGlzLnByZXZpZXdlZEV2ZW50Py5ldmVudCA/PyBudWxsXG5cdFx0XHRpZiAoZXZlbnQgIT0gbnVsbCkge1xuXHRcdFx0XHQvLyByZWRyYXcgaWYgd2UgbG9zdCBhY2Nlc3MgdG8gdGhlIGV2ZW50cycgbGlzdFxuXHRcdFx0XHRjb25zdCBncm91cFJvb3RzID0gQXJyYXkuZnJvbShuZXdJbmZvcy52YWx1ZXMoKSkubWFwKChpKSA9PiBpLmdyb3VwUm9vdClcblx0XHRcdFx0Y29uc3QgbGlzdHMgPSBbLi4uZ3JvdXBSb290cy5tYXAoKGcpID0+IGcubG9uZ0V2ZW50cyksIC4uLmdyb3VwUm9vdHMubWFwKChnKSA9PiBnLnNob3J0RXZlbnRzKV1cblx0XHRcdFx0Y29uc3QgcHJldmlld0xpc3RJZCA9IGdldExpc3RJZChldmVudClcblx0XHRcdFx0aWYgKCFsaXN0cy5zb21lKChpZCkgPT4gaXNTYW1lSWQocHJldmlld0xpc3RJZCwgaWQpKSkge1xuXHRcdFx0XHRcdHRoaXMudXBkYXRlUHJldmlld2VkRXZlbnQobnVsbClcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dGhpcy5wcmVsb2FkTW9udGhzQXJvdW5kU2VsZWN0ZWREYXRlKClcblx0XHR9KVxuXG5cdFx0ZXZlbnRDb250cm9sbGVyLmFkZEVudGl0eUxpc3RlbmVyKCh1cGRhdGVzKSA9PiB0aGlzLmVudGl0eUV2ZW50UmVjZWl2ZWQodXBkYXRlcykpXG5cblx0XHRjYWxlbmRhckludml0YXRpb25zTW9kZWwuaW5pdCgpXG5cblx0XHR0aGlzLmV2ZW50c1JlcG9zaXRvcnkuZ2V0RXZlbnRzRm9yTW9udGhzKCkubWFwKCgpID0+IHtcblx0XHRcdHRoaXMuZG9SZWRyYXcoKVxuXHRcdH0pXG5cblx0XHR0aGlzLmxvYWRDYWxlbmRhckNvbG9ycygpXG5cblx0XHRsb2dpbnNcblx0XHRcdC5nZXRVc2VyQ29udHJvbGxlcigpXG5cdFx0XHQuaXNOZXdQYWlkUGxhbigpXG5cdFx0XHQudGhlbigoaXNOZXdQYWlkUGxhbikgPT4ge1xuXHRcdFx0XHR0aGlzLl9pc05ld1BhaWRQbGFuID0gaXNOZXdQYWlkUGxhblxuXHRcdFx0XHR0aGlzLnByZXBhcmVDbGllbnRDYWxlbmRhcnMoKVxuXHRcdFx0fSlcblx0fVxuXG5cdGlzRGF5U2VsZWN0b3JFeHBhbmRlZCgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5kZXZpY2VDb25maWcuaXNDYWxlbmRhckRheVNlbGVjdG9yRXhwYW5kZWQoKVxuXHR9XG5cblx0c2V0RGF5U2VsZWN0b3JFeHBhbmRlZChleHBhbmRlZDogYm9vbGVhbikge1xuXHRcdHRoaXMuZGV2aWNlQ29uZmlnLnNldENhbGVuZGFyRGF5U2VsZWN0b3JFeHBhbmRlZChleHBhbmRlZClcblx0fVxuXG5cdGxvYWRDYWxlbmRhckNvbG9ycygpIHtcblx0XHRjb25zdCBjbGllbnRPbmx5Q29sb3JzID0gZ2V0Q2xpZW50T25seUNvbG9ycyh0aGlzLmxvZ2lucy5nZXRVc2VyQ29udHJvbGxlcigpLnVzZXJJZCwgZGV2aWNlQ29uZmlnLmdldENsaWVudE9ubHlDYWxlbmRhcnMoKSlcblx0XHRjb25zdCBncm91cENvbG9ycyA9IGdldEdyb3VwQ29sb3JzKHRoaXMubG9naW5zLmdldFVzZXJDb250cm9sbGVyKCkudXNlclNldHRpbmdzR3JvdXBSb290KVxuXHRcdGZvciAobGV0IFtjYWxlbmRhcklkLCBjb2xvcl0gb2YgY2xpZW50T25seUNvbG9ycy5lbnRyaWVzKCkpIHtcblx0XHRcdGdyb3VwQ29sb3JzLnNldChjYWxlbmRhcklkLCBjb2xvcilcblx0XHR9XG5cblx0XHRpZiAoIWRlZXBFcXVhbCh0aGlzLl9jYWxlbmRhckNvbG9ycywgZ3JvdXBDb2xvcnMpKSB7XG5cdFx0XHR0aGlzLl9jYWxlbmRhckNvbG9ycyA9IG5ldyBNYXAoZ3JvdXBDb2xvcnMpXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIExvYWQgY2xpZW50IG9ubHkgY2FsZW5kYXJzIG9yIGdlbmVyYXRlIHRoZW0gaWYgbWlzc2luZ1xuXHQgKi9cblx0cHJpdmF0ZSBwcmVwYXJlQ2xpZW50Q2FsZW5kYXJzKCkge1xuXHRcdGZvciAoY29uc3QgW2NsaWVudE9ubHlDYWxlbmRhckJhc2VJZCwgbmFtZV0gb2YgQ0xJRU5UX09OTFlfQ0FMRU5EQVJTKSB7XG5cdFx0XHRjb25zdCBjYWxlbmRhcklEID0gYCR7dGhpcy5sb2dpbnMuZ2V0VXNlckNvbnRyb2xsZXIoKS51c2VySWR9IyR7Y2xpZW50T25seUNhbGVuZGFyQmFzZUlkfWBcblx0XHRcdGNvbnN0IGNsaWVudE9ubHlDYWxlbmRhckNvbmZpZyA9IGRldmljZUNvbmZpZy5nZXRDbGllbnRPbmx5Q2FsZW5kYXJzKCkuZ2V0KGNhbGVuZGFySUQpXG5cblx0XHRcdHRoaXMubG9jYWxDYWxlbmRhcnMuc2V0KFxuXHRcdFx0XHRjYWxlbmRhcklELFxuXHRcdFx0XHRkb3duY2FzdCh7XG5cdFx0XHRcdFx0Z3JvdXBSb290OiB7IF9pZDogY2FsZW5kYXJJRCB9LFxuXHRcdFx0XHRcdGdyb3VwSW5mbzogY2xpZW50T25seUNhbGVuZGFyQ29uZmlnXG5cdFx0XHRcdFx0XHQ/IHsgbmFtZTogY2xpZW50T25seUNhbGVuZGFyQ29uZmlnLm5hbWUsIGdyb3VwOiBjYWxlbmRhcklEIH1cblx0XHRcdFx0XHRcdDoge1xuXHRcdFx0XHRcdFx0XHRcdG5hbWU6IGxhbmcuZ2V0KG5hbWUpLFxuXHRcdFx0XHRcdFx0XHRcdGdyb3VwOiBjYWxlbmRhcklELFxuXHRcdFx0XHRcdFx0ICB9LFxuXHRcdFx0XHRcdGdyb3VwOiB7IF9pZDogY2FsZW5kYXJJRCB9LFxuXHRcdFx0XHRcdHNoYXJlZDogZmFsc2UsXG5cdFx0XHRcdFx0dXNlcklzT3duZXI6IHRydWUsXG5cdFx0XHRcdH0pLFxuXHRcdFx0KVxuXG5cdFx0XHRpZiAoIXRoaXMuaXNOZXdQYWlkUGxhbiAmJiAhdGhpcy5oaWRkZW5DYWxlbmRhcnMuaGFzKGNhbGVuZGFySUQpKSB7XG5cdFx0XHRcdHRoaXMuX2hpZGRlbkNhbGVuZGFycy5hZGQoY2FsZW5kYXJJRClcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogcmVhY3QgdG8gY2hhbmdlcyB0byB0aGUgY2FsZW5kYXIgZGF0YSBieSBtYWtpbmcgc3VyZSB3ZSBoYXZlIHRoZSBjdXJyZW50IG1vbnRoICsgdGhlIHR3byBhZGphY2VudCBtb250aHNcblx0ICogcmVhZHkgdG8gYmUgcmVuZGVyZWRcblx0ICovXG5cdHByaXZhdGUgcHJlbG9hZE1vbnRoc0Fyb3VuZFNlbGVjdGVkRGF0ZSA9IGRlYm91bmNlKDIwMCwgYXN5bmMgKCkgPT4ge1xuXHRcdC8vIGxvYWQgYWxsIGNhbGVuZGFycy4gaWYgdGhlcmUgaXMgbm8gY2FsZW5kYXIgeWV0LCBjcmVhdGUgb25lXG5cdFx0Ly8gZm9yIGVhY2ggY2FsZW5kYXIgd2UgbG9hZCBzaG9ydCBldmVudHMgZm9yIHRocmVlIG1vbnRocyArM1xuXHRcdGNvbnN0IHdvcmtQZXJDYWxlbmRhciA9IDNcblx0XHRjb25zdCB0b3RhbFdvcmsgPSB0aGlzLmxvZ2lucy5nZXRVc2VyQ29udHJvbGxlcigpLmdldENhbGVuZGFyTWVtYmVyc2hpcHMoKS5sZW5ndGggKiB3b3JrUGVyQ2FsZW5kYXJcblx0XHRjb25zdCBtb25pdG9ySGFuZGxlID0gdGhpcy5wcm9ncmVzc1RyYWNrZXIucmVnaXN0ZXJNb25pdG9yU3luYyh0b3RhbFdvcmspXG5cdFx0Y29uc3QgcHJvZ3Jlc3NNb25pdG9yOiBJUHJvZ3Jlc3NNb25pdG9yID0gYXNzZXJ0Tm90TnVsbCh0aGlzLnByb2dyZXNzVHJhY2tlci5nZXRNb25pdG9yKG1vbml0b3JIYW5kbGUpKVxuXG5cdFx0Y29uc3QgbmV3U2VsZWN0ZWREYXRlID0gdGhpcy5zZWxlY3RlZERhdGUoKVxuXHRcdGNvbnN0IHRoaXNNb250aFN0YXJ0ID0gZ2V0TW9udGhSYW5nZShuZXdTZWxlY3RlZERhdGUsIHRoaXMudGltZVpvbmUpLnN0YXJ0XG5cdFx0Y29uc3QgcHJldmlvdXNNb250aERhdGUgPSBuZXcgRGF0ZSh0aGlzTW9udGhTdGFydClcblx0XHRwcmV2aW91c01vbnRoRGF0ZS5zZXRNb250aChuZXcgRGF0ZSh0aGlzTW9udGhTdGFydCkuZ2V0TW9udGgoKSAtIDEpXG5cdFx0Y29uc3QgbmV4dE1vbnRoRGF0ZSA9IG5ldyBEYXRlKHRoaXNNb250aFN0YXJ0KVxuXHRcdG5leHRNb250aERhdGUuc2V0TW9udGgobmV3IERhdGUodGhpc01vbnRoU3RhcnQpLmdldE1vbnRoKCkgKyAxKVxuXG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IGhhc05ld1BhaWRQbGFuID0gYXdhaXQgdGhpcy5ldmVudHNSZXBvc2l0b3J5LmNhbkxvYWRCaXJ0aGRheXNDYWxlbmRhcigpXG5cdFx0XHRpZiAoaGFzTmV3UGFpZFBsYW4pIHtcblx0XHRcdFx0YXdhaXQgdGhpcy5ldmVudHNSZXBvc2l0b3J5LmxvYWRDb250YWN0c0JpcnRoZGF5cygpXG5cdFx0XHR9XG5cdFx0XHRhd2FpdCB0aGlzLmxvYWRNb250aHNJZk5lZWRlZChbbmV3IERhdGUodGhpc01vbnRoU3RhcnQpLCBuZXh0TW9udGhEYXRlLCBwcmV2aW91c01vbnRoRGF0ZV0sIHByb2dyZXNzTW9uaXRvcilcblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0cHJvZ3Jlc3NNb25pdG9yLmNvbXBsZXRlZCgpXG5cdFx0XHR0aGlzLmRvUmVkcmF3KClcblx0XHR9XG5cdH0pXG5cblx0Z2V0IGNhbGVuZGFySW52aXRhdGlvbnMoKTogU3RyZWFtPEFycmF5PFJlY2VpdmVkR3JvdXBJbnZpdGF0aW9uPj4ge1xuXHRcdHJldHVybiB0aGlzLmNhbGVuZGFySW52aXRhdGlvbnNNb2RlbC5pbnZpdGF0aW9uc1xuXHR9XG5cblx0Z2V0IGNhbGVuZGFyQ29sb3JzKCk6IEdyb3VwQ29sb3JzIHtcblx0XHRyZXR1cm4gdGhpcy5fY2FsZW5kYXJDb2xvcnNcblx0fVxuXG5cdGdldCBjbGllbnRPbmx5Q2FsZW5kYXJzKCk6IFJlYWRvbmx5TWFwPElkLCBDYWxlbmRhckluZm8+IHtcblx0XHRyZXR1cm4gdGhpcy5sb2NhbENhbGVuZGFyc1xuXHR9XG5cblx0Z2V0IGNhbGVuZGFySW5mb3MoKTogUmVhZG9ubHlNYXA8SWQsIENhbGVuZGFySW5mbz4ge1xuXHRcdHJldHVybiB0aGlzLmNhbGVuZGFyTW9kZWwuZ2V0Q2FsZW5kYXJJbmZvc1N0cmVhbSgpKClcblx0fVxuXG5cdGdldCBoaWRkZW5DYWxlbmRhcnMoKTogUmVhZG9ubHlTZXQ8SWQ+IHtcblx0XHRyZXR1cm4gdGhpcy5faGlkZGVuQ2FsZW5kYXJzXG5cdH1cblxuXHRnZXQgZXZlbnRzRm9yRGF5cygpOiBEYXlzVG9FdmVudHMge1xuXHRcdHJldHVybiB0aGlzLmV2ZW50c1JlcG9zaXRvcnkuZ2V0RXZlbnRzRm9yTW9udGhzKCkoKVxuXHR9XG5cblx0Z2V0IHJlZHJhdygpOiBTdHJlYW08dm9pZD4ge1xuXHRcdHJldHVybiB0aGlzLl9yZWRyYXdTdHJlYW1cblx0fVxuXG5cdGdldCB3ZWVrU3RhcnQoKTogV2Vla1N0YXJ0IHtcblx0XHRyZXR1cm4gZ2V0V2Vla1N0YXJ0KHRoaXMubG9naW5zLmdldFVzZXJDb250cm9sbGVyKCkudXNlclNldHRpbmdzR3JvdXBSb290KVxuXHR9XG5cblx0Ly8gdmlzaWJsZUZvclRlc3Rpbmdcblx0YWxsb3dEcmFnKGV2ZW50OiBDYWxlbmRhckV2ZW50KTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMuY2FuRnVsbHlFZGl0RXZlbnQoZXZlbnQpXG5cdH1cblxuXHQvKipcblx0ICogUGFydGlhbGx5IG1pcnJvcnMgdGhlIGxvZ2ljIGZyb20gQ2FsZW5kYXJFdmVudE1vZGVsLnByb3RvdHlwZS5pc0Z1bGx5V3JpdGFibGUoKSB0byBkZXRlcm1pbmVcblx0ICogaWYgdGhlIHVzZXIgY2FuIGVkaXQgbW9yZSB0aGFuIGp1c3QgYWxhcm1zIGZvciBhIGdpdmVuIGV2ZW50XG5cdCAqL1xuXHRwcml2YXRlIGNhbkZ1bGx5RWRpdEV2ZW50KGV2ZW50OiBDYWxlbmRhckV2ZW50KTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgdXNlckNvbnRyb2xsZXIgPSB0aGlzLmxvZ2lucy5nZXRVc2VyQ29udHJvbGxlcigpXG5cdFx0Y29uc3QgdXNlck1haWxHcm91cCA9IHVzZXJDb250cm9sbGVyLmdldFVzZXJNYWlsR3JvdXBNZW1iZXJzaGlwKCkuZ3JvdXBcblx0XHRjb25zdCBtYWlsYm94RGV0YWlsc0FycmF5ID0gdGhpcy5tYWlsYm94TW9kZWwubWFpbGJveERldGFpbHMoKVxuXHRcdGNvbnN0IG1haWxib3hEZXRhaWxzID0gYXNzZXJ0Tm90TnVsbChtYWlsYm94RGV0YWlsc0FycmF5LmZpbmQoKG1kKSA9PiBtZC5tYWlsR3JvdXAuX2lkID09PSB1c2VyTWFpbEdyb3VwKSlcblx0XHRjb25zdCBvd25NYWlsQWRkcmVzc2VzID0gZ2V0RW5hYmxlZE1haWxBZGRyZXNzZXNXaXRoVXNlcihtYWlsYm94RGV0YWlscywgdXNlckNvbnRyb2xsZXIudXNlckdyb3VwSW5mbylcblx0XHRjb25zdCBldmVudFR5cGUgPSBnZXRFdmVudFR5cGUoZXZlbnQsIHRoaXMuY2FsZW5kYXJJbmZvcywgb3duTWFpbEFkZHJlc3NlcywgdXNlckNvbnRyb2xsZXIpXG5cdFx0cmV0dXJuIGV2ZW50VHlwZSA9PT0gRXZlbnRUeXBlLk9XTiB8fCBldmVudFR5cGUgPT09IEV2ZW50VHlwZS5TSEFSRURfUldcblx0fVxuXG5cdG9uRHJhZ1N0YXJ0KG9yaWdpbmFsRXZlbnQ6IENhbGVuZGFyRXZlbnQsIHRpbWVUb01vdmVCeTogbnVtYmVyKSB7XG5cdFx0aWYgKHRoaXMuYWxsb3dEcmFnKG9yaWdpbmFsRXZlbnQpKSB7XG5cdFx0XHRsZXQgZXZlbnRDbG9uZSA9IGNsb25lKG9yaWdpbmFsRXZlbnQpXG5cdFx0XHR1cGRhdGVUZW1wb3JhcnlFdmVudFdpdGhEaWZmKGV2ZW50Q2xvbmUsIG9yaWdpbmFsRXZlbnQsIHRpbWVUb01vdmVCeSlcblx0XHRcdHRoaXMuX2RyYWdnZWRFdmVudCA9IHtcblx0XHRcdFx0b3JpZ2luYWxFdmVudCxcblx0XHRcdFx0ZXZlbnRDbG9uZSxcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRvbkRyYWdVcGRhdGUodGltZVRvTW92ZUJ5OiBudW1iZXIpIHtcblx0XHRpZiAodGhpcy5fZHJhZ2dlZEV2ZW50KSB7XG5cdFx0XHR1cGRhdGVUZW1wb3JhcnlFdmVudFdpdGhEaWZmKHRoaXMuX2RyYWdnZWRFdmVudC5ldmVudENsb25lLCB0aGlzLl9kcmFnZ2VkRXZlbnQub3JpZ2luYWxFdmVudCwgdGltZVRvTW92ZUJ5KVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBUaGlzIGlzIGNhbGxlZCB3aGVuIHRoZSBldmVudCBpcyBkcm9wcGVkLlxuXHQgKi9cblx0YXN5bmMgb25EcmFnRW5kKHRpbWVUb01vdmVCeTogbnVtYmVyLCBtb2RlOiBDYWxlbmRhck9wZXJhdGlvbiB8IG51bGwpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHQvL2lmIHRoZSB0aW1lIG9mIHRoZSBkcmFnZ2VkIGV2ZW50IGlzIHRoZSBzYW1lIGFzIG9mIHRoZSBvcmlnaW5hbCB3ZSBvbmx5IGNhbmNlbCB0aGUgZHJhZ1xuXHRcdGlmICh0aW1lVG9Nb3ZlQnkgIT09IDAgJiYgbW9kZSAhPSBudWxsKSB7XG5cdFx0XHRpZiAodGhpcy5fZHJhZ2dlZEV2ZW50ID09IG51bGwpIHJldHVyblxuXG5cdFx0XHRjb25zdCB7IG9yaWdpbmFsRXZlbnQsIGV2ZW50Q2xvbmUgfSA9IHRoaXMuX2RyYWdnZWRFdmVudFxuXHRcdFx0dGhpcy5fZHJhZ2dlZEV2ZW50ID0gbnVsbFxuXHRcdFx0dXBkYXRlVGVtcG9yYXJ5RXZlbnRXaXRoRGlmZihldmVudENsb25lLCBvcmlnaW5hbEV2ZW50LCB0aW1lVG9Nb3ZlQnkpXG5cblx0XHRcdHRoaXMuX2FkZFRyYW5zaWVudEV2ZW50KGV2ZW50Q2xvbmUpXG5cblx0XHRcdHRyeSB7XG5cdFx0XHRcdGNvbnN0IGRpZFVwZGF0ZSA9IGF3YWl0IHRoaXMubW92ZUV2ZW50KG9yaWdpbmFsRXZlbnQsIHRpbWVUb01vdmVCeSwgbW9kZSlcblxuXHRcdFx0XHRpZiAoZGlkVXBkYXRlICE9PSBFdmVudFNhdmVSZXN1bHQuU2F2ZWQpIHtcblx0XHRcdFx0XHR0aGlzLl9yZW1vdmVUcmFuc2llbnRFdmVudChldmVudENsb25lKVxuXHRcdFx0XHR9XG5cdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdHRoaXMuX3JlbW92ZVRyYW5zaWVudEV2ZW50KGV2ZW50Q2xvbmUpXG5cblx0XHRcdFx0dGhyb3cgZVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9kcmFnZ2VkRXZlbnQgPSBudWxsXG5cdFx0fVxuXHR9XG5cblx0b25EcmFnQ2FuY2VsKCkge1xuXHRcdHRoaXMuX2RyYWdnZWRFdmVudCA9IG51bGxcblx0fVxuXG5cdGdldCB0ZW1wb3JhcnlFdmVudHMoKTogQXJyYXk8Q2FsZW5kYXJFdmVudD4ge1xuXHRcdHJldHVybiB0aGlzLl90cmFuc2llbnRFdmVudHMuY29uY2F0KHRoaXMuX2RyYWdnZWRFdmVudCA/IFt0aGlzLl9kcmFnZ2VkRXZlbnQuZXZlbnRDbG9uZV0gOiBbXSlcblx0fVxuXG5cdHNldEhpZGRlbkNhbGVuZGFycyhuZXdIaWRkZW5DYWxlbmRhcnM6IFNldDxJZD4pIHtcblx0XHR0aGlzLl9oaWRkZW5DYWxlbmRhcnMgPSBuZXdIaWRkZW5DYWxlbmRhcnNcblxuXHRcdHRoaXMuZGV2aWNlQ29uZmlnLnNldEhpZGRlbkNhbGVuZGFycyh0aGlzLmxvZ2lucy5nZXRVc2VyQ29udHJvbGxlcigpLnVzZXIuX2lkLCBbLi4ubmV3SGlkZGVuQ2FsZW5kYXJzXSlcblx0fVxuXG5cdHNldFNlbGVjdGVkVGltZSh0aW1lOiBUaW1lIHwgdW5kZWZpbmVkKSB7XG5cdFx0Ly8gb25seSBpZ25vcmUgYW4gYWN0dWFsIHRpbWUsIHNldHRpbmcgdG8gdW5kZWZpbmVkIGlzIGZpbmVcblx0XHRpZiAodGltZSAhPSB1bmRlZmluZWQgJiYgdGhpcy5pZ25vcmVOZXh0VmFsaWRUaW1lU2VsZWN0aW9uKSB7XG5cdFx0XHR0aGlzLmlnbm9yZU5leHRWYWxpZFRpbWVTZWxlY3Rpb24gPSBmYWxzZVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnNlbGVjdGVkVGltZSA9IHRpbWVcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogR2l2ZW4gYW4gZXZlbnQgYW5kIGRheXMsIHJldHVybiB0aGUgbG9uZyBhbmQgc2hvcnQgZXZlbnRzIG9mIHRoYXQgcmFuZ2Ugb2YgZGF5c1xuXHQgKiB3ZSBkZXRlY3QgZXZlbnRzIHRoYXQgc2hvdWxkIGJlIHJlbW92ZWQgYmFzZWQgb24gdGhlaXIgVUlEICsgc3RhcnQgYW5kIGVuZCB0aW1lXG5cdCAqXG5cdCAqIEBwYXJhbSBkYXlzIFRoZSByYW5nZSBvZiBkYXlzIGZyb20gd2hpY2ggZXZlbnRzIHNob3VsZCBiZSByZXR1cm5lZFxuXHQgKiBAcmV0dXJucyAgICBzaG9ydEV2ZW50czogQXJyYXk8QXJyYXk8Q2FsZW5kYXJFdmVudD4+LCBzaG9ydCBldmVudHMgcGVyIGRheVxuXHQgKiAgICAgICAgICAgICBsb25nRXZlbnRzOiBBcnJheTxDYWxlbmRhckV2ZW50PjogbG9uZyBldmVudHMgb3ZlciB0aGUgd2hvbGUgcmFuZ2UsXG5cdCAqICAgICAgICAgICAgIGRheXM6IEFycmF5PERhdGU+OiB0aGUgb3JpZ2luYWwgZGF5cyB0aGF0IHdlcmUgcGFzc2VkIGluXG5cdCAqL1xuXHRnZXRFdmVudHNPbkRheXNUb1JlbmRlcihkYXlzOiBBcnJheTxEYXRlPik6IEV2ZW50c09uRGF5cyB7XG5cdFx0Ly8gYWRkRGF5c0ZvclJlY3VycmluZ0V2ZW50cyBwcm9kdWNlcyBzb21lIHdlZWtzIHRoYXQgaGF2ZSBub24tcmVmZXJlbnRpYWxseS1pZGVudGljYWwgb2JqZWN0cyBmb3IgdGhlIHNhbWUgZXZlbnQgaW5zdGFuY2UgKG9jY3VycmVuY2UpXG5cdFx0Ly8gaW4gcGFydGljdWxhciwgdGhpcyBoYXBwZW5zIGZvciB0aGUgd2Vla3Mgc3RyYWRkbGluZyBhIG1vbnRoIGJvcmRlciBiZWNhdXNlIGVhY2ggbW9udGggYWRkcyBhIGRpZmZlcmVudCBjbG9uZSBvZiB0aGUgb2NjdXJyZW5jZSB0byBpdHMgcGFydCBvZiB0aGUgd2Vla1xuXHRcdC8vIHRoaXMgbWVhbnMgd2UgY2FuJ3QgdXNlIGEgc2V0IHRvIGRlZHVwbGljYXRlIHRoZXNlLlxuXG5cdFx0LyoqIEEgbWFwIGZyb20gZXZlbnQgaWQgYW5kIHN0YXJ0IHRpbWUgdG8gdGhlIGV2ZW50IGluc3RhbmNlLiBJdCBpcyBub3QgZW5vdWdoIHRvIGp1c3QgdXNlIGFuIGlkIGJlY2F1c2UgZGlmZmVyZW50IG9jY3VycmVuY2VzIHdpbGwgaGF2ZSB0aGUgc2FtZSBpZC4gKi9cblx0XHRjb25zdCBsb25nRXZlbnRzOiBNYXA8c3RyaW5nLCBDYWxlbmRhckV2ZW50PiA9IG5ldyBNYXAoKVxuXHRcdGxldCBzaG9ydEV2ZW50czogQXJyYXk8QXJyYXk8Q2FsZW5kYXJFdmVudD4+ID0gW11cblx0XHQvLyBJdCBtaWdodCBiZSB0aGUgY2FzZSB0aGF0IGEgVUlEIGlzIHNoYXJlZCBieSBldmVudHMgYWNyb3NzIGNhbGVuZGFycywgc28gd2UgbmVlZCB0byBkaWZmZXJlbnRpYXRlIHRoZW0gYnkgbGlzdCBJRCBhc3dlbGxcblx0XHRjb25zdCB0cmFuc2llbnRFdmVudFVpZHNCeUNhbGVuZGFyID0gZ3JvdXBCeUFuZE1hcFVuaXF1ZWx5KFxuXHRcdFx0dGhpcy5fdHJhbnNpZW50RXZlbnRzLFxuXHRcdFx0KGV2ZW50KSA9PiBnZXRMaXN0SWQoZXZlbnQpLFxuXHRcdFx0KGV2ZW50KSA9PiBldmVudC51aWQsXG5cdFx0KVxuXG5cdFx0Y29uc3Qgc29ydEV2ZW50ID0gKGV2ZW50OiBDYWxlbmRhckV2ZW50LCBzaG9ydEV2ZW50c0ZvckRheTogQXJyYXk8Q2FsZW5kYXJFdmVudD4pID0+IHtcblx0XHRcdGlmIChpc0FsbERheUV2ZW50KGV2ZW50KSB8fCBnZXREaWZmSW42MG1JbnRlcnZhbHMoZXZlbnQuc3RhcnRUaW1lLCBldmVudC5lbmRUaW1lKSA+PSAyNCkge1xuXHRcdFx0XHRsb25nRXZlbnRzLnNldChnZXRFbGVtZW50SWQoZXZlbnQpICsgZXZlbnQuc3RhcnRUaW1lLnRvU3RyaW5nKCksIGV2ZW50KVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c2hvcnRFdmVudHNGb3JEYXkucHVzaChldmVudClcblx0XHRcdH1cblx0XHR9XG5cblx0XHRmb3IgKGNvbnN0IGRheSBvZiBkYXlzKSB7XG5cdFx0XHRjb25zdCBzaG9ydEV2ZW50c0ZvckRheTogQ2FsZW5kYXJFdmVudFtdID0gW11cblx0XHRcdGNvbnN0IGV2ZW50c0ZvckRheSA9IHRoaXMuZXZlbnRzUmVwb3NpdG9yeS5nZXRFdmVudHNGb3JNb250aHMoKSgpLmdldChkYXkuZ2V0VGltZSgpKSB8fCBbXVxuXG5cdFx0XHRmb3IgKGNvbnN0IGV2ZW50IG9mIGV2ZW50c0ZvckRheSkge1xuXHRcdFx0XHRpZiAodHJhbnNpZW50RXZlbnRVaWRzQnlDYWxlbmRhci5nZXQoZ2V0TGlzdElkKGV2ZW50KSk/LmhhcyhldmVudC51aWQpKSB7XG5cdFx0XHRcdFx0Y29udGludWVcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICh0aGlzLl9kcmFnZ2VkRXZlbnQ/Lm9yaWdpbmFsRXZlbnQgIT09IGV2ZW50ICYmIHNob3VsZERpc3BsYXlFdmVudChldmVudCwgdGhpcy5faGlkZGVuQ2FsZW5kYXJzKSkge1xuXHRcdFx0XHRcdC8vIHRoaXMgaXMgbm90IHRoZSBkcmFnZ2VkIGV2ZW50IChub3QgcmVuZGVyZWQpIGFuZCBkb2VzIG5vdCBiZWxvbmcgdG8gYSBoaWRkZW4gY2FsZW5kYXIsIHNvIHdlIHNob3VsZCByZW5kZXIgaXQuXG5cdFx0XHRcdFx0c29ydEV2ZW50KGV2ZW50LCBzaG9ydEV2ZW50c0ZvckRheSlcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRmb3IgKGNvbnN0IGV2ZW50IG9mIHRoaXMuX3RyYW5zaWVudEV2ZW50cykge1xuXHRcdFx0XHRpZiAoaXNFdmVudEJldHdlZW5EYXlzKGV2ZW50LCBkYXksIGRheSwgdGhpcy50aW1lWm9uZSkpIHtcblx0XHRcdFx0XHRzb3J0RXZlbnQoZXZlbnQsIHNob3J0RXZlbnRzRm9yRGF5KVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IHRlbXBvcmFyeUV2ZW50ID0gdGhpcy5fZHJhZ2dlZEV2ZW50Py5ldmVudENsb25lXG5cblx0XHRcdGlmICh0ZW1wb3JhcnlFdmVudCAmJiBpc0V2ZW50QmV0d2VlbkRheXModGVtcG9yYXJ5RXZlbnQsIGRheSwgZGF5LCB0aGlzLnRpbWVab25lKSkge1xuXHRcdFx0XHRzb3J0RXZlbnQodGVtcG9yYXJ5RXZlbnQsIHNob3J0RXZlbnRzRm9yRGF5KVxuXHRcdFx0fVxuXG5cdFx0XHRzaG9ydEV2ZW50cy5wdXNoKHNob3J0RXZlbnRzRm9yRGF5KVxuXHRcdH1cblxuXHRcdGNvbnN0IGxvbmdFdmVudHNBcnJheSA9IEFycmF5LmZyb20obG9uZ0V2ZW50cy52YWx1ZXMoKSlcblx0XHRyZXR1cm4ge1xuXHRcdFx0ZGF5cyxcblx0XHRcdGxvbmdFdmVudHM6IGxvbmdFdmVudHNBcnJheSxcblx0XHRcdHNob3J0RXZlbnRzUGVyRGF5OiBzaG9ydEV2ZW50cyxcblx0XHR9XG5cdH1cblxuXHRhc3luYyBkZWxldGVDYWxlbmRhcihjYWxlbmRhcjogQ2FsZW5kYXJJbmZvKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0YXdhaXQgdGhpcy5jYWxlbmRhck1vZGVsLmRlbGV0ZUNhbGVuZGFyKGNhbGVuZGFyKVxuXHR9XG5cblx0X2FkZFRyYW5zaWVudEV2ZW50KGV2ZW50OiBDYWxlbmRhckV2ZW50KSB7XG5cdFx0dGhpcy5fdHJhbnNpZW50RXZlbnRzLnB1c2goZXZlbnQpXG5cdH1cblxuXHRfcmVtb3ZlVHJhbnNpZW50RXZlbnQoZXZlbnQ6IENhbGVuZGFyRXZlbnQpIHtcblx0XHRmaW5kQW5kUmVtb3ZlKHRoaXMuX3RyYW5zaWVudEV2ZW50cywgKHRyYW5zaWVudCkgPT4gdHJhbnNpZW50LnVpZCA9PT0gZXZlbnQudWlkKVxuXHR9XG5cblx0LyoqXG5cdCAqIG1vdmUgYW4gZXZlbnQgdG8gYSBuZXcgc3RhcnQgdGltZVxuXHQgKiBAcGFyYW0gZXZlbnQgdGhlIGFjdHVhbGx5IGRyYWdnZWQgZXZlbnQgKG1heSBiZSBhIHJlcGVhdGVkIGluc3RhbmNlKVxuXHQgKiBAcGFyYW0gZGlmZiB0aGUgYW1vdW50IG9mIG1pbGxpc2Vjb25kcyB0byBzaGlmdCB0aGUgZXZlbnQgYnlcblx0ICogQHBhcmFtIG1vZGUgd2hpY2ggcGFydHMgb2YgdGhlIHNlcmllcyBzaG91bGQgYmUgcmVzY2hlZHVsZWQ/XG5cdCAqL1xuXHRwcml2YXRlIGFzeW5jIG1vdmVFdmVudChldmVudDogQ2FsZW5kYXJFdmVudCwgZGlmZjogbnVtYmVyLCBtb2RlOiBDYWxlbmRhck9wZXJhdGlvbik6IFByb21pc2U8RXZlbnRTYXZlUmVzdWx0PiB7XG5cdFx0aWYgKGV2ZW50LnVpZCA9PSBudWxsKSB7XG5cdFx0XHR0aHJvdyBuZXcgUHJvZ3JhbW1pbmdFcnJvcihcImNhbGxlZCBtb3ZlRXZlbnQgZm9yIGFuIGV2ZW50IHdpdGhvdXQgdWlkXCIpXG5cdFx0fVxuXG5cdFx0Y29uc3QgZWRpdE1vZGVsID0gYXdhaXQgdGhpcy5jcmVhdGVDYWxlbmRhckV2ZW50RWRpdE1vZGVsKG1vZGUsIGV2ZW50KVxuXHRcdGlmIChlZGl0TW9kZWwgPT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuIEV2ZW50U2F2ZVJlc3VsdC5GYWlsZWRcblx0XHR9XG5cdFx0ZWRpdE1vZGVsLmVkaXRNb2RlbHMud2hlbk1vZGVsLnJlc2NoZWR1bGVFdmVudCh7IG1pbGxpc2Vjb25kOiBkaWZmIH0pXG5cblx0XHRpZiAoZ2V0Tm9uT3JnYW5pemVyQXR0ZW5kZWVzKGV2ZW50KS5sZW5ndGggPiAwKSB7XG5cdFx0XHRjb25zdCByZXNwb25zZSA9IGF3YWl0IGFza0lmU2hvdWxkU2VuZENhbGVuZGFyVXBkYXRlc1RvQXR0ZW5kZWVzKClcblx0XHRcdGlmIChyZXNwb25zZSA9PT0gXCJ5ZXNcIikge1xuXHRcdFx0XHRlZGl0TW9kZWwuZWRpdE1vZGVscy53aG9Nb2RlbC5zaG91bGRTZW5kVXBkYXRlcyA9IHRydWVcblx0XHRcdH0gZWxzZSBpZiAocmVzcG9uc2UgPT09IFwiY2FuY2VsXCIpIHtcblx0XHRcdFx0cmV0dXJuIEV2ZW50U2F2ZVJlc3VsdC5GYWlsZWRcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBFcnJvcnMgYXJlIGhhbmRsZWQgaW4gdGhlIGluZGl2aWR1YWwgdmlld3Ncblx0XHRyZXR1cm4gYXdhaXQgZWRpdE1vZGVsLmFwcGx5KClcblx0fVxuXG5cdGdldCBldmVudFByZXZpZXdNb2RlbCgpOiBDYWxlbmRhclByZXZpZXdNb2RlbHMgfCBudWxsIHtcblx0XHRyZXR1cm4gdGhpcy5wcmV2aWV3ZWRFdmVudD8ubW9kZWwgPz8gbnVsbFxuXHR9XG5cblx0LyoqXG5cdCAqIHRoZXJlIGFyZSBzZXZlcmFsIHJlYXNvbnMgd2h5IHdlIG1pZ2h0IG5vIGxvbmdlciB3YW50IHRvIHByZXZpZXcgYW4gZXZlbnQgYW5kIG5lZWQgdG8gcmVkcmF3IHdpdGhvdXRcblx0ICogYSBwcmV2aWV3ZWQgZXZlbnQ6XG5cdCAqICogaXQgd2FzIGRlbGV0ZWRcblx0ICogKiBpdCB3YXMgbW92ZWQgYXdheSBmcm9tIHRoZSBkYXkgd2UncmUgbG9va2luZyBhdCAob3IgdGhlIGRheSB3YXMgbW92ZWQgYXdheSlcblx0ICogKiB0aGUgY2FsZW5kYXIgd2FzIHVuc2hhcmVkIG9yIGRlbGV0ZWRcblx0ICpcblx0ICogd2Ugd291bGQgd2FudCB0byBrZWVwIHRoZSBzZWxlY3Rpb24gaWYgdGhlIGV2ZW50IG1lcmVseSBzaGlmdGVkIGl0cyBzdGFydCB0aW1lIGJ1dCBzdGlsbCBpbnRlcnNlY3RzIHRoZSB2aWV3ZWQgZGF5LFxuXHQgKiBidXQgdGhhdCB3b3VsZCByZXF1aXJlIGdvaW5nIHRocm91Z2ggdGhlIFVJRCBpbmRleCBiZWNhdXNlIG1vdmluZyBldmVudHMgY2hhbmdlcyB0aGVpciBJRC5cblx0ICogYmVjYXVzZSBvZiB0aGlzIGFuZCBiZWNhdXNlIHByZXZpZXdlZEV2ZW50IGlzIHRoZSBldmVudCBfYmVmb3JlXyB3ZSBnb3QgdGhlIHVwZGF0ZSB0aGF0IGNhdXNlZCB1cyB0byByZWNvbnNpZGVyIHRoZVxuXHQgKiBzZWxlY3Rpb24sIHdpdGggdGhlIG9sZCB0aW1lcywgdGhpcyBmdW5jdGlvbiBvbmx5IHdvcmtzIGlmIHRoZSBzZWxlY3RlZCBkYXRlIGNoYW5nZWQsIGJ1dCBub3QgaWYgdGhlIGV2ZW50IHRpbWVzXG5cdCAqIGNoYW5nZWQuXG5cdCAqL1xuXHRhc3luYyB1cGRhdGVQcmV2aWV3ZWRFdmVudChldmVudDogQ2FsZW5kYXJFdmVudCB8IG51bGwpIHtcblx0XHRpZiAoZXZlbnQgPT0gbnVsbCkge1xuXHRcdFx0dGhpcy5wcmV2aWV3ZWRFdmVudCA9IG51bGxcblx0XHRcdHRoaXMuZG9SZWRyYXcoKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBwcmV2aWV3ZWRFdmVudCA9ICh0aGlzLnByZXZpZXdlZEV2ZW50ID0geyBldmVudCwgbW9kZWw6IG51bGwgfSlcblx0XHRcdGNvbnN0IGNhbGVuZGFySW5mb3MgPSBhd2FpdCB0aGlzLmNhbGVuZGFyTW9kZWwuZ2V0Q2FsZW5kYXJJbmZvc0NyZWF0ZUlmTmVlZGVkKClcblx0XHRcdGxldCBwcmV2aWV3TW9kZWw6IENhbGVuZGFyUHJldmlld01vZGVsc1xuXHRcdFx0aWYgKGlzQ2xpZW50T25seUNhbGVuZGFyKGxpc3RJZFBhcnQoZXZlbnQuX2lkKSkpIHtcblx0XHRcdFx0Y29uc3QgaWRQYXJ0cyA9IGV2ZW50Ll9pZFsxXS5zcGxpdChcIiNcIikhXG5cdFx0XHRcdGNvbnN0IGNvbnRhY3RJZCA9IGV4dHJhY3RDb250YWN0SWRGcm9tRXZlbnQobGFzdChpZFBhcnRzKSkhXG5cdFx0XHRcdGNvbnN0IGNvbnRhY3RJZFBhcnRzID0gY29udGFjdElkLnNwbGl0KFwiL1wiKVxuXHRcdFx0XHRjb25zdCBjb250YWN0ID0gYXdhaXQgdGhpcy5jb250YWN0TW9kZWwubG9hZENvbnRhY3RGcm9tSWQoW2NvbnRhY3RJZFBhcnRzWzBdLCBjb250YWN0SWRQYXJ0c1sxXV0pXG5cdFx0XHRcdHByZXZpZXdNb2RlbCA9IGF3YWl0IHRoaXMuY3JlYXRlQ2FsZW5kYXJDb250YWN0UHJldmlld01vZGVsKGV2ZW50LCBjb250YWN0LCB0cnVlKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cHJldmlld01vZGVsID0gYXdhaXQgdGhpcy5jcmVhdGVDYWxlbmRhckV2ZW50UHJldmlld01vZGVsKGV2ZW50LCBjYWxlbmRhckluZm9zKVxuXHRcdFx0fVxuXHRcdFx0Ly8gY2hlY2sgdGhhdCB3ZSBkaWRuJ3Qgc3RhcnQgcHJldmlld2luZyBhbm90aGVyIGV2ZW50IG9yIGNoYW5nZWQgdGhlIGRhdGUgaW4gdGhlIG1lYW50aW1lXG5cdFx0XHRpZiAodGhpcy5wcmV2aWV3ZWRFdmVudCA9PT0gcHJldmlld2VkRXZlbnQpIHtcblx0XHRcdFx0dGhpcy5wcmV2aWV3ZWRFdmVudC5tb2RlbCA9IHByZXZpZXdNb2RlbFxuXHRcdFx0XHR0aGlzLmRvUmVkcmF3KClcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIGVudGl0eUV2ZW50UmVjZWl2ZWQ8VD4odXBkYXRlczogUmVhZG9ubHlBcnJheTxFbnRpdHlVcGRhdGVEYXRhPik6IFByb21pc2U8dm9pZD4ge1xuXHRcdGZvciAoY29uc3QgdXBkYXRlIG9mIHVwZGF0ZXMpIHtcblx0XHRcdGlmIChpc1VwZGF0ZUZvclR5cGVSZWYoQ2FsZW5kYXJFdmVudFR5cGVSZWYsIHVwZGF0ZSkpIHtcblx0XHRcdFx0Y29uc3QgZXZlbnRJZDogSWRUdXBsZSA9IFt1cGRhdGUuaW5zdGFuY2VMaXN0SWQsIHVwZGF0ZS5pbnN0YW5jZUlkXVxuXHRcdFx0XHRpZiAodGhpcy5wcmV2aWV3ZWRFdmVudCAhPSBudWxsICYmIGlzVXBkYXRlRm9yKHRoaXMucHJldmlld2VkRXZlbnQuZXZlbnQsIHVwZGF0ZSkpIHtcblx0XHRcdFx0XHRpZiAodXBkYXRlLm9wZXJhdGlvbiA9PT0gT3BlcmF0aW9uVHlwZS5ERUxFVEUpIHtcblx0XHRcdFx0XHRcdHRoaXMucHJldmlld2VkRXZlbnQgPSBudWxsXG5cdFx0XHRcdFx0XHR0aGlzLmRvUmVkcmF3KClcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgZXZlbnQgPSBhd2FpdCB0aGlzLmVudGl0eUNsaWVudC5sb2FkKENhbGVuZGFyRXZlbnRUeXBlUmVmLCBldmVudElkKVxuXHRcdFx0XHRcdFx0XHRhd2FpdCB0aGlzLnVwZGF0ZVByZXZpZXdlZEV2ZW50KGV2ZW50KVxuXHRcdFx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdFx0XHRpZiAoZSBpbnN0YW5jZW9mIE5vdEF1dGhvcml6ZWRFcnJvcikge1xuXHRcdFx0XHRcdFx0XHRcdC8vIHJldHVybiB1cGRhdGVzIHRoYXQgYXJlIG5vdCBpbiBjYWNoZSBSYW5nZSBpZiBOb3RBdXRob3JpemVkRXJyb3IgKGZvciB0aG9zZSB1cGRhdGVzIHRoYXQgYXJlIGluIGNhY2hlIHJhbmdlKVxuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKFwiTm90QXV0aG9yaXplZEVycm9yIGZvciBldmVudCBpbiBlbnRpdHlFdmVudHNSZWNlaXZlZCBvZiB2aWV3XCIsIGUpXG5cdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoZSBpbnN0YW5jZW9mIE5vdEZvdW5kRXJyb3IpIHtcblx0XHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhcIk5vdCBmb3VuZCBldmVudCBpbiBlbnRpdHlFdmVudHNSZWNlaXZlZCBvZiB2aWV3XCIsIGUpXG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0dGhyb3cgZVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IHRyYW5zaWVudEV2ZW50ID0gdGhpcy5fdHJhbnNpZW50RXZlbnRzLmZpbmQoKHRyYW5zaWVudEV2ZW50KSA9PiBpc1NhbWVJZCh0cmFuc2llbnRFdmVudC5faWQsIGV2ZW50SWQpKVxuXHRcdFx0XHRpZiAodHJhbnNpZW50RXZlbnQpIHtcblx0XHRcdFx0XHR0aGlzLl9yZW1vdmVUcmFuc2llbnRFdmVudCh0cmFuc2llbnRFdmVudClcblx0XHRcdFx0XHR0aGlzLmRvUmVkcmF3KClcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChpc1VwZGF0ZUZvclR5cGVSZWYoQ29udGFjdFR5cGVSZWYsIHVwZGF0ZSkgJiYgdGhpcy5pc05ld1BhaWRQbGFuKSB7XG5cdFx0XHRcdGF3YWl0IHRoaXMuZXZlbnRzUmVwb3NpdG9yeS5sb2FkQ29udGFjdHNCaXJ0aGRheXModHJ1ZSlcblx0XHRcdFx0dGhpcy5ldmVudHNSZXBvc2l0b3J5LnJlZnJlc2hCaXJ0aGRheUNhbGVuZGFyKHRoaXMuc2VsZWN0ZWREYXRlKCkpXG5cdFx0XHRcdHRoaXMuZG9SZWRyYXcoKVxuXHRcdFx0fSBlbHNlIGlmIChpc1VwZGF0ZUZvclR5cGVSZWYoQ3VzdG9tZXJJbmZvVHlwZVJlZiwgdXBkYXRlKSkge1xuXHRcdFx0XHR0aGlzLmxvZ2luc1xuXHRcdFx0XHRcdC5nZXRVc2VyQ29udHJvbGxlcigpXG5cdFx0XHRcdFx0LmlzTmV3UGFpZFBsYW4oKVxuXHRcdFx0XHRcdC50aGVuKChpc05ld1BhaWRQbGFuKSA9PiAodGhpcy5faXNOZXdQYWlkUGxhbiA9IGlzTmV3UGFpZFBsYW4pKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGdldENhbGVuZGFySW5mb3NDcmVhdGVJZk5lZWRlZCgpOiAkUHJvbWlzYWJsZTxSZWFkb25seU1hcDxJZCwgQ2FsZW5kYXJJbmZvPj4ge1xuXHRcdHJldHVybiB0aGlzLmNhbGVuZGFyTW9kZWwuZ2V0Q2FsZW5kYXJJbmZvc0NyZWF0ZUlmTmVlZGVkKClcblx0fVxuXG5cdGxvYWRNb250aHNJZk5lZWRlZChkYXlzSW5Nb250aHM6IEFycmF5PERhdGU+LCBwcm9ncmVzc01vbml0b3I6IElQcm9ncmVzc01vbml0b3IpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRyZXR1cm4gdGhpcy5ldmVudHNSZXBvc2l0b3J5LmxvYWRNb250aHNJZk5lZWRlZChkYXlzSW5Nb250aHMsIHByb2dyZXNzTW9uaXRvciwgc3RyZWFtKGZhbHNlKSlcblx0fVxuXG5cdHByaXZhdGUgZG9SZWRyYXcoKSB7XG5cdFx0Ly8gTmVlZCB0byBwYXNzIHNvbWUgYXJndW1lbnQgdG8gbWFrZSBpdCBhIFwic2V0XCIgb3BlcmF0aW9uXG5cdFx0dGhpcy5fcmVkcmF3U3RyZWFtKHVuZGVmaW5lZClcblx0fVxuXG5cdGdldFNjcm9sbFBvc2l0aW9uKCk6IG51bWJlciB7XG5cdFx0cmV0dXJuIHRoaXMuc2Nyb2xsUG9zaXRpb25cblx0fVxuXG5cdHNldFNjcm9sbFBvc2l0aW9uKG5ld1Bvc2l0aW9uOiBudW1iZXIpOiB2b2lkIHtcblx0XHRpZiAobmV3UG9zaXRpb24gPCAwKSB7XG5cdFx0XHR0aGlzLnNjcm9sbFBvc2l0aW9uID0gMFxuXHRcdH0gZWxzZSBpZiAodGhpcy5zY3JvbGxNYXggIT09IG51bGwgJiYgbmV3UG9zaXRpb24gPiB0aGlzLnNjcm9sbE1heCkge1xuXHRcdFx0dGhpcy5zY3JvbGxQb3NpdGlvbiA9IHRoaXMuc2Nyb2xsTWF4XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuc2Nyb2xsUG9zaXRpb24gPSBuZXdQb3NpdGlvblxuXHRcdH1cblx0fVxuXG5cdGdldFNjcm9sbE1heGltdW0oKTogbnVtYmVyIHwgbnVsbCB7XG5cdFx0cmV0dXJuIHRoaXMuc2Nyb2xsTWF4XG5cdH1cblxuXHRnZXRWaWV3U2l6ZSgpOiBudW1iZXIgfCBudWxsIHtcblx0XHRyZXR1cm4gdGhpcy52aWV3U2l6ZVxuXHR9XG5cblx0c2V0Vmlld1BhcmFtZXRlcnMoZG9tOiBIVE1MRWxlbWVudCk6IHZvaWQge1xuXHRcdHRoaXMuc2Nyb2xsTWF4ID0gZG9tLnNjcm9sbEhlaWdodCAtIGRvbS5jbGllbnRIZWlnaHRcblx0XHR0aGlzLnZpZXdTaXplID0gZG9tLmNsaWVudEhlaWdodFxuXHR9XG5cblx0c2Nyb2xsKGJ5OiBudW1iZXIpOiB2b2lkIHtcblx0XHR0aGlzLnNldFNjcm9sbFBvc2l0aW9uKHRoaXMuc2Nyb2xsUG9zaXRpb24gKyBieSlcblx0fVxuXG5cdGZvcmNlU3luY0V4dGVybmFsKGdyb3VwU2V0dGluZ3M6IEdyb3VwU2V0dGluZ3MgfCBudWxsLCBsb25nRXJyb3JNZXNzYWdlOiBib29sZWFuID0gZmFsc2UpIHtcblx0XHRpZiAoIWdyb3VwU2V0dGluZ3MpIHtcblx0XHRcdHJldHVyblxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLmNhbGVuZGFyTW9kZWwuc3luY0V4dGVybmFsQ2FsZW5kYXJzKFtncm91cFNldHRpbmdzXSwgRVhURVJOQUxfQ0FMRU5EQVJfU1lOQ19JTlRFUlZBTCwgbG9uZ0Vycm9yTWVzc2FnZSwgdHJ1ZSlcblx0fVxuXG5cdHB1YmxpYyBnZXRDYWxlbmRhck1vZGVsKCkge1xuXHRcdHJldHVybiB0aGlzLmNhbGVuZGFyTW9kZWxcblx0fVxuXG5cdGhhbmRsZUNsaWVudE9ubHlVcGRhdGUoZ3JvdXBJbmZvOiBHcm91cEluZm8sIG5ld0dyb3VwU2V0dGluZ3M6IEdyb3VwU2V0dGluZ3MpIHtcblx0XHR0aGlzLmRldmljZUNvbmZpZy51cGRhdGVDbGllbnRPbmx5Q2FsZW5kYXJzKGdyb3VwSW5mby5ncm91cCwgbmV3R3JvdXBTZXR0aW5ncylcblx0fVxuXG5cdGdldCBpc05ld1BhaWRQbGFuKCk6IFJlYWRvbmx5PGJvb2xlYW4+IHtcblx0XHRyZXR1cm4gdGhpcy5faXNOZXdQYWlkUGxhblxuXHR9XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVRlbXBvcmFyeUV2ZW50V2l0aERpZmYoZXZlbnRDbG9uZTogQ2FsZW5kYXJFdmVudCwgb3JpZ2luYWxFdmVudDogQ2FsZW5kYXJFdmVudCwgbW91c2VEaWZmOiBudW1iZXIpIHtcblx0ZXZlbnRDbG9uZS5zdGFydFRpbWUgPSBuZXcgRGF0ZShvcmlnaW5hbEV2ZW50LnN0YXJ0VGltZS5nZXRUaW1lKCkgKyBtb3VzZURpZmYpXG5cdGV2ZW50Q2xvbmUuZW5kVGltZSA9IG5ldyBEYXRlKG9yaWdpbmFsRXZlbnQuZW5kVGltZS5nZXRUaW1lKCkgKyBtb3VzZURpZmYpXG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBbUZhLG9CQUFOLE1BQTZEO0NBRW5FLEFBQVMsZUFBNkIsMkJBQU8sY0FBYyxJQUFJLE9BQU8sQ0FBQzs7Ozs7OztDQVF2RSxBQUFRLGlCQUF1RjtDQUUvRixBQUFROztDQUdSLEFBQVM7Q0FFVCxnQkFBcUM7Q0FDckMsQUFBaUIsZ0JBQThCLDRCQUFRO0NBQ3ZEO0NBRUE7Q0FFQSxBQUFRLGlCQUF5QjtDQUVqQyxBQUFRLFlBQTJCO0NBRW5DLEFBQVEsV0FBMEI7Q0FFbEMsQUFBUSxpQkFBMEI7Q0FDbEMsQUFBUSxpQkFBd0MsSUFBSTtDQUNwRCxBQUFRLGtCQUErQixJQUFJO0NBRTNDLFlBQ2tCQSxRQUNBQyw4QkFDQUMsaUNBQ0FDLG1DQUNBQyxlQUNBQyxrQkFDQUMsY0FDakJDLGlCQUNpQkMsaUJBQ0FDLGdCQUNBQywwQkFDQUMsVUFDQUMsY0FDQUMsY0FDaEI7RUFrZ0JGLEtBaGhCa0I7RUFnaEJqQixLQS9nQmlCO0VBK2dCaEIsS0E5Z0JnQjtFQThnQmYsS0E3Z0JlO0VBNmdCZCxLQTVnQmM7RUE0Z0JiLEtBM2dCYTtFQTJnQlosS0ExZ0JZO0VBMGdCWCxLQXhnQlc7RUF3Z0JWLEtBdmdCVTtFQXVnQlQsS0F0Z0JTO0VBc2dCUixLQXJnQlE7RUFxZ0JQLEtBcGdCTztFQW9nQk4sS0FuZ0JNO0FBRWpCLE9BQUssbUJBQW1CLENBQUU7RUFFMUIsTUFBTSxTQUFTLE9BQU8sbUJBQW1CLENBQUMsS0FBSztFQUMvQyxNQUFNLFFBQVEsSUFBSTtBQUVsQixP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