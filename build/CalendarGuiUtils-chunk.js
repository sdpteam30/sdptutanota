import { ProgrammingError } from "./ProgrammingError-chunk.js";
import { mithril_default } from "./mithril-chunk.js";
import { arrayEqualsWithPredicate, assert, assertNonNull, assertNotNull, clamp, clone, defer, findAll, getFromMap, getStartOfDay, identity, incrementDate, isNotEmpty, isSameDay, isSameDayOfDate, memoized, noOp, numberRange, remove, trisectingDiff, typedValues } from "./dist2-chunk.js";
import { lang } from "./LanguageViewModel-chunk.js";
import { MAX_HUE_ANGLE, hslToHex, isColorLight, isValidColorCode, theme } from "./theme-chunk.js";
import { AccountType, CLIENT_ONLY_CALENDARS, CalendarAttendeeStatus, ConversationType, DEFAULT_CLIENT_ONLY_CALENDAR_COLORS, EndType, EventTextTimeOption, RepeatPeriod, ShareCapability, WeekStart, defaultCalendarColor } from "./TutanotaConstants-chunk.js";
import { size } from "./size-chunk.js";
import { DateTime, Duration } from "./luxon-chunk.js";
import { getStrippedClone, haveSameId } from "./EntityUtils-chunk.js";
import { createCalendarEvent, createCalendarEventAttendee, createEncryptedMailAddress } from "./TypeRefs-chunk.js";
import { CalendarViewType, cleanMailAddress, findRecipientWithAddress, generateEventElementId, isAllDayEvent, serializeAlarmInterval } from "./CommonCalendarUtils-chunk.js";
import { AlarmIntervalUnit, DefaultDateProvider, StandardAlarmInterval, alarmIntervalToLuxonDurationLikeObject, areRepeatRulesEqual, eventEndsAfterDay, eventStartsBefore, findFirstPrivateCalendar, generateUid, getAllDayDateForTimezone, getEndOfDayWithZone, getEventEnd, getEventStart, getStartOfDayWithZone, getStartOfNextDayWithZone, getStartOfTheWeekOffset, getStartOfWeek, getTimeZone, getWeekNumber, hasSourceUrl, incrementByRepeatPeriod, incrementSequence, parseAlarmInterval } from "./CalendarUtils-chunk.js";
import { NotFoundError, PayloadTooLargeError, TooManyRequestsError } from "./RestError-chunk.js";
import { ButtonType } from "./Button-chunk.js";
import { Icons } from "./Icons-chunk.js";
import { Dialog, createAsyncDropdown } from "./Dialog-chunk.js";
import { IconButton } from "./IconButton-chunk.js";
import { CalendarEventWhenModel, Time } from "./CalendarEventWhenModel-chunk.js";
import { formatDateTime, formatDateWithMonth, formatDateWithWeekday, formatMonthWithFullYear, formatTime } from "./Formatter-chunk.js";
import { assertEventValidity } from "./CalendarModel-chunk.js";
import { hasCapabilityOnGroup } from "./GroupUtils2-chunk.js";
import { UserError } from "./UserError-chunk.js";
import { RecipientField, getDefaultSender } from "./SharedMailUtils-chunk.js";
import { getPasswordStrengthForUser, isSecurePassword } from "./PasswordUtils-chunk.js";
import { RecipientType } from "./Recipient-chunk.js";
import { getContactDisplayName } from "./ContactUtils-chunk.js";
import { ResolveMode } from "./RecipientsModel-chunk.js";
import { UpgradeRequiredError } from "./UpgradeRequiredError-chunk.js";
import { ColorPickerModel } from "./ColorPickerModel-chunk.js";

//#region src/calendar-app/calendar/gui/eventeditor-model/CalendarEventWhoModel.ts
var CalendarEventWhoModel = class {
	/** we need to resolve recipients to know if we need to show an external password field. */
	resolvedRecipients = new Map();
	pendingRecipients = 0;
	_recipientsSettled = defer();
	/** it's possible that the consumer cares about all the recipient information being resolved, but that's only possible in an async way. */
	get recipientsSettled() {
		return this._recipientsSettled.promise;
	}
	/** external password for an external attendee with an address */
	externalPasswords = new Map();
	/** to know who to update, we need to know who was already on the guest list.
	* we keep the attendees in maps for deduplication, keyed by their address.
	* */
	initialAttendees = new Map();
	initialOwnAttendeeStatus = null;
	/** we only show the send update checkbox if there are attendees that require updates from us. */
	initiallyHadOtherAttendees;
	/** the current list of attendees. */
	_attendees = new Map();
	/** organizer MUST be set if _ownAttendee is - we're either both, we're invited and someone else is organizer or there are no guests at all. */
	_organizer = null;
	/** the attendee that has one of our mail addresses. MUST NOT be in _attendees */
	_ownAttendee = null;
	isConfidential;
	/**
	* whether this user will send updates for this event.
	* * this needs to be our event.
	* * we need a paid account
	* * there need to be changes that require updating the attendees (eg alarms do not)
	* * there also need to be attendees that require updates/invites/cancellations/response
	*/
	shouldSendUpdates = false;
	/**
	*
	* @param initialValues
	* @param eventType
	* @param operation the operation the user is currently attempting. we could use recurrenceId on initialvalues for this information, but this is safer.
	* @param calendars
	* @param _selectedCalendar
	* @param userController
	* @param isNew whether the event is new (never been saved)
	* @param ownMailAddresses an array of the mail addresses this user could be mentioned as as an attendee or organizer.
	* @param recipientsModel
	* @param responseTo
	* @param passwordStrengthModel
	* @param sendMailModelFactory
	* @param uiUpdateCallback
	*/
	constructor(initialValues, eventType, operation, calendars, _selectedCalendar, userController, isNew, ownMailAddresses, recipientsModel, responseTo, passwordStrengthModel, sendMailModelFactory, uiUpdateCallback = noOp) {
		this.eventType = eventType;
		this.operation = operation;
		this.calendars = calendars;
		this._selectedCalendar = _selectedCalendar;
		this.userController = userController;
		this.isNew = isNew;
		this.ownMailAddresses = ownMailAddresses;
		this.recipientsModel = recipientsModel;
		this.responseTo = responseTo;
		this.passwordStrengthModel = passwordStrengthModel;
		this.sendMailModelFactory = sendMailModelFactory;
		this.uiUpdateCallback = uiUpdateCallback;
		this.setupAttendees(initialValues);
		const resolvePromises = initialValues.attendees?.map((a) => this.resolveAndCacheAddress(a.address)).concat() ?? [];
		if (initialValues.organizer) resolvePromises.push(this.resolveAndCacheAddress(initialValues.organizer));
		Promise.all(resolvePromises).then(this.uiUpdateCallback);
		this.initiallyHadOtherAttendees = this.hasNotifyableOtherAttendees();
		this.isConfidential = initialValues.invitedConfidentially ?? false;
	}
	set selectedCalendar(v) {
		/**
		* when changing the calendar of an event, if the user is the organiser
		* they can link any of their owned calendars(private or shared) to said event
		* even if the event has guests
		**/
		if (!v.userIsOwner && v.shared && this._attendees.size > 0) throw new ProgrammingError("tried to select shared calendar while there are guests.");
else if (!v.userIsOwner && v.shared && this.isNew && this._organizer != null) this._organizer = null;
		this._selectedCalendar = v;
		this.uiUpdateCallback();
	}
	get selectedCalendar() {
		return this._selectedCalendar;
	}
	/**
	* whether the current user can modify the guest list of the event depending on event type and the calendar it's in.
	*
	* * at the moment, we can never modify guests when editing only part of a series.
	* * selected calendar is our own:
	*   * event is invite (we're not organizer): can't modify guest list, any edit operation will be local only.
	*   * event is our own: can do what we want.
	* * if the selected calendar is a shared one:
	*   * ro: don't show editor at all
	*   * rw, new event: don't show attendee list editor - we can't invite in shared calendars.
	*   * rw, existing event without attendees: not our own calendar, can't invite, don't show attendee list.
	*   * rw, existing event with attendees:  this is the case where we can see attendees, but can't edit them.
	*                                         but we also can't edit the event since there are attendees and we're
	*                                         unable to send updates.
	*/
	get canModifyGuests() {
		/**
		* if the user is the event's organiser and the owner of its linked calendar, the user can modify the guests freely
		**/
		const userIsOwner = this.eventType === EventType.OWN && this.selectedCalendar.userIsOwner;
		return userIsOwner || !(this.selectedCalendar?.shared || this.eventType === EventType.INVITE || this.operation === CalendarOperation.EditThis);
	}
	/**
	* filter the calendars an event can be saved to depending on the event type, attendee status and edit operation.
	* Prevent moving the event to another calendar if you only have read permission or if the event has attendees.
	* */
	getAvailableCalendars() {
		const { groupSettings } = this.userController.userSettingsGroupRoot;
		const calendarArray = Array.from(this.calendars.values()).filter((cal) => !this.isExternalCalendar(groupSettings, cal.group._id));
		if (this.eventType === EventType.LOCKED || this.operation === CalendarOperation.EditThis) return [this.selectedCalendar];
else if (this.isNew && this._attendees.size > 0)
 /**
		* when changing the calendar of an event, if the user is the organiser
		* they can link any of their owned calendars(private or shared) to said event
		* even if the event has guests
		**/
		return calendarArray.filter((calendarInfo) => calendarInfo.userIsOwner || !calendarInfo.shared);
else if (this._attendees.size > 0 && this.eventType === EventType.OWN) return calendarArray.filter((calendarInfo) => calendarInfo.userIsOwner);
else if (this._attendees.size > 0 || this.eventType === EventType.INVITE) return calendarArray.filter((calendarInfo) => !calendarInfo.shared || haveSameId(calendarInfo.group, this.selectedCalendar.group));
else return calendarArray.filter((calendarInfo) => hasCapabilityOnGroup(this.userController.user, calendarInfo.group, ShareCapability.Write));
	}
	isExternalCalendar(groupSettings, groupId) {
		const existingGroupSettings = groupSettings.find((gc) => gc.group === groupId);
		return hasSourceUrl(existingGroupSettings);
	}
	async resolveAndCacheAddress(a) {
		if (this.resolvedRecipients.has(a.address)) return;
		this.pendingRecipients = this.pendingRecipients + 1;
		const recipient = await this.recipientsModel.resolve(a, ResolveMode.Eager).resolved();
		this.cacheRecipient(recipient);
		this.pendingRecipients = this.pendingRecipients - 1;
		if (this.pendingRecipients === 0) {
			this._recipientsSettled.resolve();
			this._recipientsSettled = defer();
		}
	}
	cacheRecipient(recipient) {
		this.resolvedRecipients.set(recipient.address, recipient);
		if (recipient.type !== RecipientType.EXTERNAL) return;
		this.externalPasswords.set(recipient.address, recipient.contact?.presharedPassword ?? "");
		if (recipient.contact != null && this._attendees.has(recipient.address)) {
			const attendee = this._attendees.get(recipient.address);
			attendee.address.name = getContactDisplayName(recipient.contact);
		}
	}
	/**
	* internally, we want to keep ourselves and the organizer separate from the other attendees
	*/
	setupAttendees(initialValues) {
		const ownAddresses = this.ownMailAddresses.map((a) => cleanMailAddress(a.address));
		for (const a of initialValues.attendees ?? []) {
			const attendee = createCalendarEventAttendee({
				status: a.status,
				address: createEncryptedMailAddress({
					name: a.address.name,
					address: cleanMailAddress(a.address.address)
				})
			});
			this.initialAttendees.set(attendee.address.address, attendee);
		}
		const initialOrganizerAddress = initialValues.organizer == null ? null : createEncryptedMailAddress({
			address: cleanMailAddress(initialValues.organizer.address),
			name: initialValues.organizer.name
		});
		if (initialOrganizerAddress != null) {
			const organizerAttendee = this.initialAttendees.get(initialOrganizerAddress.address);
			this._organizer = organizerAttendee ?? createCalendarEventAttendee({
				address: initialOrganizerAddress,
				status: CalendarAttendeeStatus.NEEDS_ACTION
			});
			this.initialAttendees.delete(this._organizer.address.address);
		}
		const ownAttendeeAddresses = findAll(Array.from(this.initialAttendees.keys()), (address) => ownAddresses.includes(address));
		this._ownAttendee = this.initialAttendees.get(ownAttendeeAddresses[0]) ?? null;
		this.initialOwnAttendeeStatus = this._ownAttendee?.status ?? null;
		for (const match of ownAttendeeAddresses) this.initialAttendees.delete(match);
		for (const [initialAttendeeAddress, initialAttendee] of this.initialAttendees.entries()) this._attendees.set(initialAttendeeAddress, clone(initialAttendee));
		if (this._organizer != null && this._attendees.size === 0 && this._ownAttendee == null) this._organizer = null;
		if (this.eventType === EventType.OWN && this._organizer != null && !ownAddresses.includes(this._organizer.address.address) && Array.from(this._attendees.values()).some((a) => a.status !== CalendarAttendeeStatus.ADDED)) {
			console.warn("got an event with attendees and an organizer that's not the owner of the calendar, replacing organizer.");
			this._attendees.set(this._organizer.address.address, this._organizer);
			this._organizer = this._ownAttendee ?? createCalendarEventAttendee({
				address: createEncryptedMailAddress({
					address: ownAddresses[0],
					name: ""
				}),
				status: CalendarAttendeeStatus.ACCEPTED
			});
		}
		if (this._organizer && ownAddresses.includes(this._organizer.address.address) && this._organizer.address.address !== this._ownAttendee?.address.address) this._ownAttendee = this._organizer;
	}
	/**
	* figure out if there are currently other people that might need to be notified if this event is modified.
	* attendees that were just added and not invited yet are ignored for this.
	* @private
	*/
	hasNotifyableOtherAttendees() {
		return !this.isNew && Array.from(this.initialAttendees.values()).some((a) => a.status !== CalendarAttendeeStatus.ADDED);
	}
	get possibleOrganizers() {
		if (this.eventType !== EventType.OWN) return this._organizer ? [this._organizer.address] : [];
else if (!this.hasNotifyableOtherAttendees()) return this.ownMailAddresses;
else if (this._organizer != null && this.ownGuest?.address === this._organizer?.address.address) return [this._organizer.address];
else if (this.eventType === EventType.OWN) return this.ownMailAddresses;
else throw new ProgrammingError("could not figure out which addresses are a valid organizer for this event.");
	}
	/**
	* get our own guest, if any
	*/
	get ownGuest() {
		return this._ownAttendee && this.getGuestForAttendee(this._ownAttendee);
	}
	/**
	* get the current organizer of the event
	*
	* there is no setter - if we're changing attendees, we're ensured to be the organizer.
	*/
	get organizer() {
		return this._organizer && this.getGuestForAttendee(this._organizer);
	}
	/**
	* a list of the attendees of the event that are not the organizer or ourselves, with their status and type
	*/
	get guests() {
		return Array.from(this._attendees.values()).map((a) => this.getGuestForAttendee(a));
	}
	getGuestForAttendee(a) {
		if (this.resolvedRecipients.has(a.address.address)) {
			const recipient = this.resolvedRecipients.get(a.address.address);
			return {
				...recipient,
				status: a.status
			};
		} else return {
			address: a.address.address,
			name: a.address.name,
			status: a.status,
			type: RecipientType.UNKNOWN,
			contact: null
		};
	}
	/**
	* add a mail address to the list of invitees.
	* the organizer will always be set to the last of the current user's mail addresses that has been added.
	*
	* if an attendee is deleted an re-added, the status is retained.
	*
	* @param address the mail address to send the invite to
	* @param contact a contact for a display name.
	*/
	addAttendee(address, contact = null) {
		if (!this.canModifyGuests) throw new UserError(lang.makeTranslation("cannotAddAttendees_msg", "Cannot add attendees"));
		const cleanAddress = cleanMailAddress(address);
		if (this._attendees.has(cleanAddress) || this._organizer?.address.address === cleanAddress || this._ownAttendee?.address.address === cleanAddress) return;
		const ownAttendee = findRecipientWithAddress(this.ownMailAddresses, cleanAddress);
		if (ownAttendee != null) this.addOwnAttendee(ownAttendee);
else {
			const name = contact != null ? getContactDisplayName(contact) : "";
			this.addOtherAttendee(createEncryptedMailAddress({
				address: cleanAddress,
				name
			}));
		}
	}
	/**
	* this is a no-op if there are already
	* @param address MUST be one of ours and MUST NOT be in the attendees array or set on _organizer
	* @private
	*/
	addOwnAttendee(address) {
		if (this.hasNotifyableOtherAttendees()) {
			console.log("can't change organizer if there are other invitees already");
			return;
		}
		const attendeeToAdd = createCalendarEventAttendee({
			address,
			status: CalendarAttendeeStatus.ACCEPTED
		});
		this._ownAttendee = attendeeToAdd;
		this._organizer = attendeeToAdd;
		if (!this.resolvedRecipients.has(address.address)) this.resolveAndCacheAddress(address).then(this.uiUpdateCallback);
		this.uiUpdateCallback();
	}
	/**
	*
	* @param address must NOT be one of ours.
	* @private
	*/
	addOtherAttendee(address) {
		if (this._ownAttendee == null) this.addOwnAttendee(this.ownMailAddresses[0]);
		address.address = cleanMailAddress(address.address);
		const previousAttendee = this.initialAttendees.get(address.address);
		if (previousAttendee != null) this._attendees.set(address.address, previousAttendee);
else this._attendees.set(address.address, createCalendarEventAttendee({
			address,
			status: CalendarAttendeeStatus.ADDED
		}));
		if (!this.resolvedRecipients.has(address.address)) this.resolveAndCacheAddress(address).then(this.uiUpdateCallback);
		this.uiUpdateCallback();
	}
	/**
	* remove a single attendee from the list.
	* * if it's the organizer AND there are other attendees, this is a no-op - if there are attendees, someone must be organizer (and it's us)
	* * if it's the organizer AND there are no other attendees, this sets the organizer and ownAttendee
	* * if it's not the organizer, but the last non-organizer attendee, only removes the attendee from the list, but the
	*   result will have an empty attendee list and no organizer if no other attendees are added in the meantime.
	* * if it's not the organizer but not the last non-organizer attendee, just removes that attendee from the list.
	* @param address the attendee to remove.
	*/
	removeAttendee(address) {
		const cleanRemoveAddress = cleanMailAddress(address);
		if (this._organizer?.address.address === cleanRemoveAddress) if (this._attendees.size > 0) {
			console.log("tried to remove organizer while there are other attendees, ignoring.");
			return;
		} else {
			this._organizer = null;
			this._ownAttendee = null;
			this.uiUpdateCallback();
		}
else if (this._attendees.has(cleanRemoveAddress)) {
			this._attendees.delete(cleanRemoveAddress);
			if (this._attendees.size === 0) {
				this._organizer = null;
				this._ownAttendee = null;
			}
			this.uiUpdateCallback();
		}
	}
	/**
	* modify your own attendance to the selected value.
	* is a no-op if we're not actually an attendee
	* @param status
	*/
	setOwnAttendance(status) {
		if (this._ownAttendee) this._ownAttendee.status = status;
	}
	setPresharedPassword(address, password) {
		this.externalPasswords.set(address, password);
	}
	/** for a stored address, get the preshared password and an indicator value for its strength */
	getPresharedPassword(address) {
		const password = this.externalPasswords.get(address) ?? "";
		const recipient = this.resolvedRecipients.get(address);
		const strength = recipient != null ? this.passwordStrengthModel(password, recipient) : 0;
		return {
			password,
			strength
		};
	}
	/**
	* return whether any of the attendees have a password set that warrants asking the user if they really want to use it.
	*
	* ignores empty passwords since those are always a hard fail when sending external mail.
	*/
	hasInsecurePasswords() {
		if (!this.isConfidential) return false;
		for (const g of this._attendees.values()) {
			const { password, strength } = this.getPresharedPassword(g.address.address);
			if (password === "" || isSecurePassword(strength)) continue;
			return true;
		}
		return false;
	}
	prepareSendModel(attendees) {
		if (!this._ownAttendee) return null;
		const recipients = attendees.map(({ address }) => address);
		const model = this.sendMailModelFactory();
		model.initWithTemplate([], "", "");
		for (const recipient of recipients) {
			model.addRecipient(RecipientField.BCC, recipient);
			if (this.externalPasswords.has(recipient.address)) {
				const password = assertNotNull(this.externalPasswords.get(recipient.address));
				model.setPassword(recipient.address, password);
			}
		}
		model.setSender(this._ownAttendee.address.address);
		model.setConfidential(this.isConfidential);
		return model;
	}
	prepareResponseModel() {
		if (this.eventType !== EventType.INVITE || this._ownAttendee === null || this._organizer == null || this._ownAttendee == null) return null;
		const initialOwnAttendeeStatus = assertNotNull(this.initialOwnAttendeeStatus, "somehow managed to become an attendee on an invite we weren't invited to before");
		if (!(initialOwnAttendeeStatus !== this._ownAttendee.status && this._ownAttendee.status !== CalendarAttendeeStatus.NEEDS_ACTION)) return null;
		const responseModel = this.sendMailModelFactory();
		if (this.responseTo != null) responseModel.initAsResponse({
			previousMail: this.responseTo,
			conversationType: ConversationType.REPLY,
			senderMailAddress: this._ownAttendee.address.address,
			recipients: [],
			attachments: [],
			bodyText: "",
			subject: "",
			replyTos: []
		}, new Map());
else responseModel.initWithTemplate({}, "", "");
		responseModel.addRecipient(RecipientField.TO, this._organizer.address);
		return responseModel;
	}
	get result() {
		if (this._selectedCalendar == null) throw new UserError("noCalendar_msg");
		const isOrganizer = this._organizer != null && this._ownAttendee?.address.address === this._organizer.address.address;
		const { kept: attendeesToUpdate, deleted: attendeesToCancel, added: attendeesToInvite } = getRecipientLists(this.initialAttendees, this._attendees, isOrganizer, this.isNew);
		const { allAttendees, organizerToPublish } = assembleAttendees(attendeesToInvite, attendeesToUpdate, this._organizer, this._ownAttendee);
		return {
			attendees: allAttendees,
			organizer: organizerToPublish,
			isConfidential: this.isConfidential,
			cancelModel: isOrganizer && attendeesToCancel.length > 0 ? this.prepareSendModel(attendeesToCancel) : null,
			inviteModel: isOrganizer && attendeesToInvite.length > 0 ? this.prepareSendModel(attendeesToInvite) : null,
			updateModel: isOrganizer && attendeesToUpdate.length > 0 && this.shouldSendUpdates ? this.prepareSendModel(attendeesToUpdate) : null,
			responseModel: !isOrganizer && organizerToPublish != null ? this.prepareResponseModel() : null,
			calendar: this._selectedCalendar
		};
	}
};
function getRecipientLists(initialAttendees, currentAttendees, isOrganizer, isNew) {
	if (!isOrganizer) return {
		added: [],
		deleted: [],
		kept: Array.from(initialAttendees.values())
	};
else if (isNew) return {
		added: Array.from(currentAttendees.values()),
		deleted: [],
		kept: []
	};
else return trisectingDiff(initialAttendees, currentAttendees);
}
/** get the list of attendees and the organizer address to publish.
* the array contains the organizer as an attendee.
*
* if there's only an organizer but no other attendees, no attendees or organizers are returned.
* */
function assembleAttendees(attendeesToInvite, attendeesToUpdate, organizer, ownAttendee) {
	if (organizer == null || attendeesToInvite.length + attendeesToUpdate.length === 0 && (ownAttendee == null || ownAttendee.address.address === organizer?.address.address)) return {
		allAttendees: [],
		organizerToPublish: null
	};
	const allAttendees = [];
	if (organizer.address.address !== ownAttendee?.address.address) allAttendees.push(organizer);
	if (ownAttendee != null) allAttendees.push(ownAttendee);
	allAttendees.push(...attendeesToUpdate);
	allAttendees.push(...attendeesToInvite);
	return {
		allAttendees,
		organizerToPublish: organizer.address
	};
}

//#endregion
//#region src/calendar-app/calendar/gui/eventeditor-model/CalendarEventAlarmModel.ts
var CalendarEventAlarmModel = class {
	_alarms = [];
	/** we can set reminders only if we're able to edit the event on the server because we have to add them to the entity. */
	canEditReminders;
	constructor(eventType, alarms = [], dateProvider, uiUpdateCallback = noOp) {
		this.dateProvider = dateProvider;
		this.uiUpdateCallback = uiUpdateCallback;
		this.canEditReminders = eventType === EventType.OWN || eventType === EventType.SHARED_RW || eventType === EventType.LOCKED || eventType === EventType.INVITE;
		this._alarms = [...alarms];
	}
	/**
	* @param trigger the interval to add.
	*/
	addAlarm(trigger) {
		if (trigger == null) return;
		const alreadyHasAlarm = this._alarms.some((e) => this.isEqualAlarms(trigger, e));
		if (alreadyHasAlarm) return;
		this._alarms.push(trigger);
		this.uiUpdateCallback();
	}
	/**
	* deactivate the alarm for the given interval.
	*/
	removeAlarm(alarmInterval) {
		remove(this._alarms, alarmInterval);
		this.uiUpdateCallback();
	}
	removeAll() {
		this._alarms.splice(0);
	}
	addAll(alarmIntervalList) {
		this._alarms.push(...alarmIntervalList);
	}
	get alarms() {
		return this._alarms;
	}
	get result() {
		return { alarms: Array.from(this._alarms.values()).map((t) => this.makeNewAlarm(t)) };
	}
	makeNewAlarm(alarmInterval) {
		return {
			alarmIdentifier: generateEventElementId(this.dateProvider.now()),
			trigger: serializeAlarmInterval(alarmInterval)
		};
	}
	/**
	* Compares two AlarmIntervals if they have the same duration
	* eg: 60 minutes === 1 hour
	* @param alarmOne base interval
	* @param alarmTwo interval to be compared with
	* @return true if they have the same duration
	*/
	isEqualAlarms(alarmOne, alarmTwo) {
		const luxonAlarmOne = Duration.fromDurationLike(alarmIntervalToLuxonDurationLikeObject(alarmOne)).shiftToAll();
		const luxonAlarmTwo = Duration.fromDurationLike(alarmIntervalToLuxonDurationLikeObject(alarmTwo)).shiftToAll();
		return luxonAlarmOne.equals(luxonAlarmTwo);
	}
};

//#endregion
//#region src/common/misc/SanitizedTextViewModel.ts
var SanitizedTextViewModel = class {
	sanitizedText = null;
	constructor(text, sanitizer, uiUpdateCallback = noOp) {
		this.text = text;
		this.sanitizer = sanitizer;
		this.uiUpdateCallback = uiUpdateCallback;
	}
	set content(v) {
		this.sanitizedText = null;
		this.text = v;
		this.uiUpdateCallback();
	}
	get content() {
		if (this.sanitizedText == null) this.sanitizedText = this.sanitizer.sanitizeHTML(this.text, { blockExternalContent: false }).html;
		return this.sanitizedText;
	}
};

//#endregion
//#region src/calendar-app/calendar/gui/eventeditor-model/CalendarNotificationModel.ts
var CalendarNotificationModel = class {
	constructor(notificationSender, loginController) {
		this.notificationSender = notificationSender;
		this.loginController = loginController;
	}
	/**
	* send all notifications required for the new event, determined by the contents of the sendModels parameter.
	*
	* will modify the attendee list of newEvent if invites/cancellations are sent.
	*/
	async send(event, recurrenceIds, sendModels) {
		if (sendModels.updateModel == null && sendModels.cancelModel == null && sendModels.inviteModel == null && sendModels.responseModel == null) return;
		if ((sendModels.updateModel != null || sendModels.cancelModel != null || sendModels.inviteModel != null) && !await hasPlanWithInvites(this.loginController)) {
			const { getAvailablePlansWithCalendarInvites } = await import("./SubscriptionUtils2-chunk.js");
			throw new UpgradeRequiredError("upgradeRequired_msg", await getAvailablePlansWithCalendarInvites());
		}
		const recurrenceTimes = recurrenceIds.map((date) => date.getTime());
		const originalExclusions = event.repeatRule?.excludedDates ?? [];
		const filteredExclusions = originalExclusions.filter(({ date }) => !recurrenceTimes.includes(date.getTime()));
		if (event.repeatRule != null) event.repeatRule.excludedDates = filteredExclusions;
		try {
			const invitePromise = sendModels.inviteModel != null ? this.sendInvites(event, sendModels.inviteModel) : Promise.resolve();
			const cancelPromise = sendModels.cancelModel != null ? this.sendCancellation(event, sendModels.cancelModel) : Promise.resolve();
			const updatePromise = sendModels.updateModel != null ? this.sendUpdates(event, sendModels.updateModel) : Promise.resolve();
			const responsePromise = sendModels.responseModel != null ? this.respondToOrganizer(event, sendModels.responseModel) : Promise.resolve();
			await Promise.all([
				invitePromise,
				cancelPromise,
				updatePromise,
				responsePromise
			]);
		} finally {
			if (event.repeatRule != null) event.repeatRule.excludedDates = originalExclusions;
		}
	}
	/**
	* invite all new attendees for an event and set their status from "ADDED" to "NEEDS_ACTION"
	* @param event will be modified if invites are sent.
	* @param inviteModel
	* @private
	*/
	async sendInvites(event, inviteModel) {
		if (event.organizer == null || inviteModel?.allRecipients().length === 0) throw new ProgrammingError("event has no organizer or no invitable attendees, can't send invites.");
		const newAttendees = getNonOrganizerAttendees(event).filter((a) => a.status === CalendarAttendeeStatus.ADDED);
		await inviteModel.waitForResolvedRecipients();
		if (event.invitedConfidentially != null) inviteModel.setConfidential(event.invitedConfidentially);
		await this.notificationSender.sendInvite(event, inviteModel);
		for (const attendee of newAttendees) if (attendee.status === CalendarAttendeeStatus.ADDED) attendee.status = CalendarAttendeeStatus.NEEDS_ACTION;
	}
	async sendCancellation(event, cancelModel) {
		const updatedEvent = clone(event);
		try {
			if (event.invitedConfidentially != null) cancelModel.setConfidential(event.invitedConfidentially);
			await this.notificationSender.sendCancellation(updatedEvent, cancelModel);
		} catch (e) {
			if (e instanceof TooManyRequestsError) throw new UserError("mailAddressDelay_msg");
else throw e;
		}
	}
	async sendUpdates(event, updateModel) {
		await updateModel.waitForResolvedRecipients();
		if (event.invitedConfidentially != null) updateModel.setConfidential(event.invitedConfidentially);
		await this.notificationSender.sendUpdate(event, updateModel);
	}
	/**
	* send a response mail to the organizer as stated on the original event. calling this for an event that is not an invite or
	* does not contain address as an attendee or that has no organizer is an error.
	* @param newEvent the event to send the update for, this should be identical to existingEvent except for the own status.
	* @param responseModel
	* @private
	*/
	async respondToOrganizer(newEvent, responseModel) {
		await responseModel.waitForResolvedRecipients();
		if (newEvent.invitedConfidentially != null) responseModel.setConfidential(newEvent.invitedConfidentially);
		await this.notificationSender.sendResponse(newEvent, responseModel);
		responseModel.dispose();
	}
};
async function hasPlanWithInvites(loginController) {
	const userController = loginController.getUserController();
	const { user } = userController;
	if (user.accountType === AccountType.FREE || user.accountType === AccountType.EXTERNAL) return false;
	const customer = await loginController.getUserController().loadCustomer();
	return (await userController.getPlanConfig()).eventInvites;
}

//#endregion
//#region src/calendar-app/calendar/gui/eventeditor-model/CalendarEventModelStrategy.ts
var CalendarEventApplyStrategies = class {
	constructor(calendarModel, logins, notificationModel, lazyRecurrenceIds, showProgress = identity, zone) {
		this.calendarModel = calendarModel;
		this.logins = logins;
		this.notificationModel = notificationModel;
		this.lazyRecurrenceIds = lazyRecurrenceIds;
		this.showProgress = showProgress;
		this.zone = zone;
	}
	/**
	* save a new event to the selected calendar, invite all attendees except for the organizer and set up alarms.
	*/
	async saveNewEvent(editModels) {
		const { eventValues, newAlarms, sendModels, calendar } = assembleCalendarEventEditResult(editModels);
		const uid = generateUid(calendar.group._id, Date.now());
		const newEvent = assignEventIdentity(eventValues, { uid });
		assertEventValidity(newEvent);
		const { groupRoot } = calendar;
		await this.showProgress((async () => {
			await this.notificationModel.send(newEvent, [], sendModels);
			await this.calendarModel.createEvent(newEvent, newAlarms, this.zone, groupRoot);
		})());
	}
	/** all instances of an event will be updated. if the recurrenceIds are invalidated (rrule or startTime changed),
	* will delete all altered instances and exclusions. */
	async saveEntireExistingEvent(editModelsForProgenitor, existingEvent) {
		const uid = assertNotNull(existingEvent.uid, "no uid to update existing event");
		assertNotNull(existingEvent?._id, "no id to update existing event");
		assertNotNull(existingEvent?._ownerGroup, "no ownerGroup to update existing event");
		assertNotNull(existingEvent?._permissions, "no permissions to update existing event");
		const { newEvent, calendar, newAlarms, sendModels } = assembleEditResultAndAssignFromExisting(existingEvent, editModelsForProgenitor, CalendarOperation.EditAll);
		const { groupRoot } = calendar;
		await this.showProgress((async () => {
			const recurrenceIds = await this.lazyRecurrenceIds(uid);
			await this.notificationModel.send(newEvent, recurrenceIds, sendModels);
			await this.calendarModel.updateEvent(newEvent, newAlarms, this.zone, groupRoot, existingEvent);
			const invalidateAlteredInstances = newEvent.repeatRule && newEvent.repeatRule.excludedDates.length === 0;
			const newDuration = editModelsForProgenitor.whenModel.duration;
			const index = await this.calendarModel.getEventsByUid(uid);
			if (index == null) return;
			for (const occurrence of index.alteredInstances) if (invalidateAlteredInstances) {
				editModelsForProgenitor.whoModel.shouldSendUpdates = true;
				const { sendModels: sendModels$1 } = assembleEditResultAndAssignFromExisting(occurrence, editModelsForProgenitor, CalendarOperation.EditThis);
				for (const recipient of sendModels$1.cancelModel?.allRecipients() ?? []) sendModels$1.updateModel?.addRecipient(RecipientField.BCC, recipient);
				sendModels$1.cancelModel = sendModels$1.updateModel;
				sendModels$1.updateModel = null;
				sendModels$1.inviteModel = null;
				await this.notificationModel.send(occurrence, [], sendModels$1);
				await this.calendarModel.deleteEvent(occurrence);
			} else {
				const { newEvent: newEvent$1, newAlarms: newAlarms$1, sendModels: sendModels$1 } = assembleEditResultAndAssignFromExisting(occurrence, editModelsForProgenitor, CalendarOperation.EditThis);
				newEvent$1.startTime = occurrence.startTime;
				newEvent$1.endTime = DateTime.fromJSDate(newEvent$1.startTime, { zone: this.zone }).plus(newDuration).toJSDate();
				newEvent$1.repeatRule = null;
				await this.notificationModel.send(newEvent$1, [], sendModels$1);
				await this.calendarModel.updateEvent(newEvent$1, newAlarms$1, this.zone, groupRoot, occurrence);
			}
		})());
	}
	async saveNewAlteredInstance({ editModels, editModelsForProgenitor, existingInstance, progenitor }) {
		await this.showProgress((async () => {
			const { newEvent, calendar, newAlarms, sendModels } = assembleEditResultAndAssignFromExisting(existingInstance, editModels, CalendarOperation.EditThis);
			await this.notificationModel.send(newEvent, [], sendModels);
			editModelsForProgenitor.whoModel.shouldSendUpdates = true;
			editModelsForProgenitor.whenModel.excludeDate(existingInstance.startTime);
			const { newEvent: newProgenitor, sendModels: progenitorSendModels, newAlarms: progenitorAlarms } = assembleEditResultAndAssignFromExisting(progenitor, editModelsForProgenitor, CalendarOperation.EditAll);
			const recurrenceIds = await this.lazyRecurrenceIds(progenitor.uid);
			recurrenceIds.push(existingInstance.startTime);
			await this.notificationModel.send(newProgenitor, recurrenceIds, progenitorSendModels);
			await this.calendarModel.updateEvent(newProgenitor, progenitorAlarms, this.zone, calendar.groupRoot, progenitor);
			const { groupRoot } = calendar;
			await this.calendarModel.createEvent(newEvent, newAlarms, this.zone, groupRoot);
		})());
	}
	async saveExistingAlteredInstance(editModels, existingInstance) {
		const { newEvent, calendar, newAlarms, sendModels } = assembleEditResultAndAssignFromExisting(existingInstance, editModels, CalendarOperation.EditThis);
		const { groupRoot } = calendar;
		await this.showProgress((async () => {
			await this.notificationModel.send(newEvent, [], sendModels);
			await this.calendarModel.updateEvent(newEvent, newAlarms, this.zone, groupRoot, existingInstance);
		})());
	}
	/** delete a whole event and all the instances generated by it */
	async deleteEntireExistingEvent(editModels, existingEvent) {
		editModels.whoModel.shouldSendUpdates = true;
		const { sendModels } = assembleCalendarEventEditResult(editModels);
		await this.showProgress((async () => {
			const alteredOccurrences = await this.calendarModel.getEventsByUid(assertNotNull(existingEvent.uid));
			if (alteredOccurrences) for (const occurrence of alteredOccurrences.alteredInstances) {
				if (occurrence.attendees.length === 0) continue;
				const { sendModels: sendModels$1 } = assembleEditResultAndAssignFromExisting(occurrence, editModels, CalendarOperation.DeleteAll);
				sendModels$1.cancelModel = sendModels$1.updateModel;
				sendModels$1.updateModel = null;
				await this.notificationModel.send(occurrence, [], sendModels$1);
			}
			sendModels.cancelModel = sendModels.updateModel;
			sendModels.updateModel = null;
			await this.notificationModel.send(existingEvent, [], sendModels);
			if (existingEvent.uid != null) await this.calendarModel.deleteEventsByUid(existingEvent.uid);
			await this.calendarModel.deleteEvent(existingEvent);
		})());
	}
	/** add an exclusion to the progenitor and send an update. */
	async excludeSingleInstance(editModelsForProgenitor, existingInstance, progenitor) {
		await this.showProgress((async () => {
			editModelsForProgenitor.whoModel.shouldSendUpdates = true;
			editModelsForProgenitor.whenModel.excludeDate(existingInstance.startTime);
			const { newEvent, sendModels, calendar, newAlarms } = assembleEditResultAndAssignFromExisting(progenitor, editModelsForProgenitor, CalendarOperation.DeleteThis);
			const recurrenceIds = await this.lazyRecurrenceIds(progenitor.uid);
			await this.notificationModel.send(newEvent, recurrenceIds, sendModels);
			await this.calendarModel.updateEvent(newEvent, newAlarms, this.zone, calendar.groupRoot, progenitor);
		})());
	}
	/** only remove a single altered instance from the server & the uid index. will not modify the progenitor. */
	async deleteAlteredInstance(editModels, existingAlteredInstance) {
		editModels.whoModel.shouldSendUpdates = true;
		const { sendModels } = assembleCalendarEventEditResult(editModels);
		sendModels.cancelModel = sendModels.updateModel;
		sendModels.updateModel = null;
		await this.showProgress((async () => {
			await this.notificationModel.send(existingAlteredInstance, [], sendModels);
			await this.calendarModel.deleteEvent(existingAlteredInstance);
		})());
	}
};

//#endregion
//#region src/common/misc/SimpleTextViewModel.ts
var SimpleTextViewModel = class {
	constructor(text, uiUpdateCallback = noOp) {
		this.text = text;
		this.uiUpdateCallback = uiUpdateCallback;
	}
	set content(text) {
		this.text = text;
		this.uiUpdateCallback();
	}
	get content() {
		return this.text;
	}
};

//#endregion
//#region src/calendar-app/calendar/gui/eventeditor-model/CalendarEventModel.ts
let EventType = function(EventType$1) {
	/** event in our own calendar and we are organizer */
	EventType$1["OWN"] = "own";
	/** event in shared calendar with read permission */
	EventType$1["SHARED_RO"] = "shared_ro";
	/** event in shared calendar with write permission, that has no attendees */
	EventType$1["SHARED_RW"] = "shared_rw";
	/** shared with write permissions, but we can't edit anything but alarms because it has attendees. might be something the calendar owner was invited to. */
	EventType$1["LOCKED"] = "locked";
	/** invite from calendar invitation which is not stored in calendar yet, or event stored in **own calendar** and we are not organizer. */
	EventType$1["INVITE"] = "invite";
	/** we are an external user and see an event in our mailbox */
	EventType$1["EXTERNAL"] = "external";
	return EventType$1;
}({});
let ReadonlyReason = function(ReadonlyReason$1) {
	/** it's a shared event, so at least the attendees are read-only */
	ReadonlyReason$1[ReadonlyReason$1["SHARED"] = 0] = "SHARED";
	/** this edit operation applies to only part of a series, so attendees and calendar are read-only */
	ReadonlyReason$1[ReadonlyReason$1["SINGLE_INSTANCE"] = 1] = "SINGLE_INSTANCE";
	/** the organizer is not the current user */
	ReadonlyReason$1[ReadonlyReason$1["NOT_ORGANIZER"] = 2] = "NOT_ORGANIZER";
	/** the event cannot be edited for an unspecified reason. This is the default value */
	ReadonlyReason$1[ReadonlyReason$1["UNKNOWN"] = 3] = "UNKNOWN";
	/** we can edit anything here */
	ReadonlyReason$1[ReadonlyReason$1["NONE"] = 4] = "NONE";
	return ReadonlyReason$1;
}({});
let CalendarOperation = function(CalendarOperation$1) {
	/** create a new event */
	CalendarOperation$1[CalendarOperation$1["Create"] = 0] = "Create";
	/** only apply an edit to only one particular instance of the series */
	CalendarOperation$1[CalendarOperation$1["EditThis"] = 1] = "EditThis";
	/** Delete a single instance from a series, altered or not */
	CalendarOperation$1[CalendarOperation$1["DeleteThis"] = 2] = "DeleteThis";
	/** apply the edit operation to all instances of the series*/
	CalendarOperation$1[CalendarOperation$1["EditAll"] = 3] = "EditAll";
	/** delete the whole series */
	CalendarOperation$1[CalendarOperation$1["DeleteAll"] = 4] = "DeleteAll";
	return CalendarOperation$1;
}({});
async function makeCalendarEventModel(operation, initialValues, recipientsModel, calendarModel, logins, mailboxDetail, mailboxProperties, sendMailModelFactory, notificationSender, entityClient, responseTo, zone = getTimeZone(), showProgress = identity, uiUpdateCallback = mithril_default.redraw) {
	const { htmlSanitizer } = await import("./HtmlSanitizer2-chunk.js");
	const ownMailAddresses = getOwnMailAddressesWithDefaultSenderInFront(logins, mailboxDetail, mailboxProperties);
	if (operation === CalendarOperation.DeleteAll || operation === CalendarOperation.EditAll) {
		assertNonNull(initialValues.uid, "tried to edit/delete all with nonexistent uid");
		const index = await calendarModel.getEventsByUid(initialValues.uid);
		if (index != null && index.progenitor != null) initialValues = index.progenitor;
	}
	const user = logins.getUserController().user;
	const [alarms, calendars] = await Promise.all([resolveAlarmsForEvent(initialValues.alarmInfos ?? [], calendarModel, user), calendarModel.getCalendarInfos()]);
	const selectedCalendar = getPreselectedCalendar(calendars, initialValues);
	const getPasswordStrength = (password, recipientInfo) => getPasswordStrengthForUser(password, recipientInfo, mailboxDetail, logins);
	const eventType = getEventType(initialValues, calendars, ownMailAddresses.map(({ address }) => address), logins.getUserController());
	const makeEditModels = (initializationEvent) => ({
		whenModel: new CalendarEventWhenModel(initializationEvent, zone, uiUpdateCallback),
		whoModel: new CalendarEventWhoModel(initializationEvent, eventType, operation, calendars, selectedCalendar, logins.getUserController(), operation === CalendarOperation.Create, ownMailAddresses, recipientsModel, responseTo, getPasswordStrength, sendMailModelFactory, uiUpdateCallback),
		alarmModel: new CalendarEventAlarmModel(eventType, alarms, new DefaultDateProvider(), uiUpdateCallback),
		location: new SimpleTextViewModel(initializationEvent.location, uiUpdateCallback),
		summary: new SimpleTextViewModel(initializationEvent.summary, uiUpdateCallback),
		description: new SanitizedTextViewModel(initializationEvent.description, htmlSanitizer, uiUpdateCallback)
	});
	const recurrenceIds = async (uid) => uid == null ? [] : (await calendarModel.getEventsByUid(uid))?.alteredInstances.map((i) => i.recurrenceId) ?? [];
	const notificationModel = new CalendarNotificationModel(notificationSender, logins);
	const applyStrategies = new CalendarEventApplyStrategies(calendarModel, logins, notificationModel, recurrenceIds, showProgress, zone);
	const initialOrDefaultValues = Object.assign(makeEmptyCalendarEvent(), initialValues);
	const cleanInitialValues = cleanupInitialValuesForEditing(initialOrDefaultValues);
	const progenitor = () => calendarModel.resolveCalendarEventProgenitor(cleanInitialValues);
	const strategy = await selectStrategy(makeEditModels, applyStrategies, operation, progenitor, createCalendarEvent(initialOrDefaultValues), cleanInitialValues);
	return strategy && new CalendarEventModel(strategy, eventType, operation, logins.getUserController(), notificationSender, entityClient, calendars);
}
async function selectStrategy(makeEditModels, applyStrategies, operation, resolveProgenitor, existingInstanceIdentity, cleanInitialValues) {
	let editModels;
	let apply;
	let mayRequireSendingUpdates;
	if (operation === CalendarOperation.Create) {
		editModels = makeEditModels(cleanInitialValues);
		apply = () => applyStrategies.saveNewEvent(editModels);
		mayRequireSendingUpdates = () => true;
	} else if (operation === CalendarOperation.EditThis) {
		cleanInitialValues.repeatRule = null;
		if (cleanInitialValues.recurrenceId == null) {
			const progenitor = await resolveProgenitor();
			if (progenitor == null || progenitor.repeatRule == null) {
				console.warn("no repeating progenitor during EditThis operation?");
				return null;
			}
			apply = () => applyStrategies.saveNewAlteredInstance({
				editModels,
				editModelsForProgenitor: makeEditModels(progenitor),
				existingInstance: existingInstanceIdentity,
				progenitor
			});
			mayRequireSendingUpdates = () => true;
			editModels = makeEditModels(cleanInitialValues);
		} else {
			editModels = makeEditModels(cleanInitialValues);
			apply = () => applyStrategies.saveExistingAlteredInstance(editModels, existingInstanceIdentity);
			mayRequireSendingUpdates = () => assembleEditResultAndAssignFromExisting(existingInstanceIdentity, editModels, operation).hasUpdateWorthyChanges;
		}
	} else if (operation === CalendarOperation.DeleteThis) if (cleanInitialValues.recurrenceId == null) {
		const progenitor = await resolveProgenitor();
		if (progenitor == null) return null;
		editModels = makeEditModels(progenitor);
		apply = () => applyStrategies.excludeSingleInstance(editModels, existingInstanceIdentity, progenitor);
		mayRequireSendingUpdates = () => true;
	} else {
		editModels = makeEditModels(cleanInitialValues);
		apply = () => applyStrategies.deleteAlteredInstance(editModels, existingInstanceIdentity);
		mayRequireSendingUpdates = () => true;
	}
else if (operation === CalendarOperation.EditAll) {
		const progenitor = await resolveProgenitor();
		if (progenitor == null) return null;
		editModels = makeEditModels(cleanInitialValues);
		apply = () => applyStrategies.saveEntireExistingEvent(editModels, progenitor);
		mayRequireSendingUpdates = () => assembleEditResultAndAssignFromExisting(existingInstanceIdentity, editModels, operation).hasUpdateWorthyChanges;
	} else if (operation === CalendarOperation.DeleteAll) {
		editModels = makeEditModels(cleanInitialValues);
		apply = () => applyStrategies.deleteEntireExistingEvent(editModels, existingInstanceIdentity);
		mayRequireSendingUpdates = () => assembleEditResultAndAssignFromExisting(existingInstanceIdentity, editModels, operation).hasUpdateWorthyChanges;
	} else throw new ProgrammingError(`unknown calendar operation: ${operation}`);
	return {
		apply,
		mayRequireSendingUpdates,
		editModels
	};
}
function getNonOrganizerAttendees({ organizer, attendees }) {
	if (attendees == null) return [];
	if (organizer == null) return attendees;
	const organizerAddress = cleanMailAddress(organizer.address);
	return attendees.filter((a) => cleanMailAddress(a.address.address) !== organizerAddress) ?? [];
}
var CalendarEventModel = class {
	processing = false;
	get editModels() {
		return this.strategy.editModels;
	}
	constructor(strategy, eventType, operation, userController, distributor, entityClient, calendars) {
		this.strategy = strategy;
		this.eventType = eventType;
		this.operation = operation;
		this.userController = userController;
		this.distributor = distributor;
		this.entityClient = entityClient;
		this.calendars = calendars;
		this.calendars = calendars;
	}
	async apply() {
		if (this.userController.user.accountType === AccountType.EXTERNAL) {
			console.log("did not apply event changes, we're an external user.");
			return EventSaveResult.Failed;
		}
		if (this.processing) return EventSaveResult.Failed;
		this.processing = true;
		try {
			await this.strategy.apply();
			return EventSaveResult.Saved;
		} catch (e) {
			if (e instanceof PayloadTooLargeError) throw new UserError("requestTooLarge_msg");
else if (e instanceof NotFoundError) return EventSaveResult.NotFound;
else throw e;
		} finally {
			this.processing = false;
		}
	}
	/** false if the event is only partially or not at all writable */
	isFullyWritable() {
		return this.eventType === EventType.OWN || this.eventType === EventType.SHARED_RW;
	}
	/** some edit operations apply to the whole event series.
	* they are not possible if the operation the model was created with only applies to a single instance.
	*
	* returns true if such operations can be attempted.
	* */
	canEditSeries() {
		return this.operation !== CalendarOperation.EditThis && (this.eventType === EventType.OWN || this.eventType === EventType.SHARED_RW);
	}
	canChangeCalendar() {
		return this.operation !== CalendarOperation.EditThis && (this.eventType === EventType.OWN || this.eventType === EventType.SHARED_RW || this.eventType === EventType.INVITE);
	}
	isAskingForUpdatesNeeded() {
		return this.eventType === EventType.OWN && !this.editModels.whoModel.shouldSendUpdates && this.editModels.whoModel.initiallyHadOtherAttendees && this.strategy.mayRequireSendingUpdates();
	}
	getReadonlyReason() {
		const isFullyWritable = this.isFullyWritable();
		const canEditSeries = this.canEditSeries();
		const canModifyGuests = this.editModels.whoModel.canModifyGuests;
		if (isFullyWritable && canEditSeries && canModifyGuests) return ReadonlyReason.NONE;
		if (!isFullyWritable && !canEditSeries && !canModifyGuests) return ReadonlyReason.NOT_ORGANIZER;
		if (!canModifyGuests) if (canEditSeries) return ReadonlyReason.SHARED;
else return ReadonlyReason.SINGLE_INSTANCE;
		return ReadonlyReason.UNKNOWN;
	}
};
function eventHasChanged(now, previous) {
	if (previous == null) return true;
	return now.startTime.getTime() !== previous?.startTime?.getTime() || now.description !== previous?.description || now.summary !== previous.summary || now.location !== previous.location || now.endTime.getTime() !== previous?.endTime?.getTime() || now.invitedConfidentially !== previous.invitedConfidentially || now.uid !== previous.uid || !areRepeatRulesEqual(now.repeatRule, previous?.repeatRule ?? null) || !arrayEqualsWithPredicate(now.attendees, previous?.attendees ?? [], (a1, a2) => a1.status === a2.status && cleanMailAddress(a1.address.address) === cleanMailAddress(a2.address.address)) || now.organizer !== previous.organizer && now.organizer?.address !== previous.organizer?.address;
}
function assembleCalendarEventEditResult(models) {
	const whenResult = models.whenModel.result;
	const whoResult = models.whoModel.result;
	const alarmResult = models.alarmModel.result;
	const summary = models.summary.content;
	const description = models.description.content;
	const location = models.location.content;
	return {
		eventValues: {
			startTime: whenResult.startTime,
			endTime: whenResult.endTime,
			repeatRule: whenResult.repeatRule,
			summary,
			description,
			location,
			invitedConfidentially: whoResult.isConfidential,
			organizer: whoResult.organizer,
			attendees: whoResult.attendees,
			alarmInfos: []
		},
		newAlarms: alarmResult.alarms,
		sendModels: whoResult,
		calendar: whoResult.calendar
	};
}
function assembleEditResultAndAssignFromExisting(existingEvent, editModels, operation) {
	const assembleResult = assembleCalendarEventEditResult(editModels);
	const { uid: oldUid, sequence: oldSequence, recurrenceId } = existingEvent;
	const newEvent = assignEventIdentity(assembleResult.eventValues, {
		uid: oldUid,
		sequence: incrementSequence(oldSequence),
		recurrenceId: operation === CalendarOperation.EditThis && recurrenceId == null ? existingEvent.startTime : recurrenceId
	});
	assertEventValidity(newEvent);
	newEvent._id = existingEvent._id;
	newEvent._ownerGroup = existingEvent._ownerGroup;
	newEvent._permissions = existingEvent._permissions;
	return {
		hasUpdateWorthyChanges: eventHasChanged(newEvent, existingEvent),
		newEvent,
		calendar: assembleResult.calendar,
		newAlarms: assembleResult.newAlarms,
		sendModels: assembleResult.sendModels
	};
}
function assignEventIdentity(values, identity$1) {
	return createCalendarEvent({
		sequence: "0",
		recurrenceId: null,
		hashedUid: null,
		...values,
		...identity$1
	});
}
async function resolveAlarmsForEvent(alarms, calendarModel, user) {
	const alarmInfos = await calendarModel.loadAlarms(alarms, user);
	return alarmInfos.map(({ alarmInfo }) => parseAlarmInterval(alarmInfo.trigger));
}
function makeEmptyCalendarEvent() {
	return {
		alarmInfos: [],
		invitedConfidentially: null,
		hashedUid: null,
		uid: null,
		recurrenceId: null,
		endTime: new Date(),
		summary: "",
		startTime: new Date(),
		location: "",
		repeatRule: null,
		description: "",
		attendees: [],
		organizer: null,
		sequence: ""
	};
}
function cleanupInitialValuesForEditing(initialValues) {
	const stripped = getStrippedClone(initialValues);
	const result = createCalendarEvent(stripped);
	result.alarmInfos = [];
	return result;
}
let EventSaveResult = function(EventSaveResult$1) {
	EventSaveResult$1[EventSaveResult$1["Saved"] = 0] = "Saved";
	EventSaveResult$1[EventSaveResult$1["Failed"] = 1] = "Failed";
	EventSaveResult$1[EventSaveResult$1["NotFound"] = 2] = "NotFound";
	return EventSaveResult$1;
}({});
/**
* return the calendar the given event belongs to, if any, otherwise get the first one from the given calendars.
* @param calendars must contain at least one calendar
* @param event
*/
function getPreselectedCalendar(calendars, event) {
	const ownerGroup = event?._ownerGroup ?? null;
	if (ownerGroup == null || !calendars.has(ownerGroup)) {
		const calendar = findFirstPrivateCalendar(calendars);
		if (!calendar) throw new Error("Can't find a private calendar");
		return calendar;
	} else return assertNotNull(calendars.get(ownerGroup), "invalid ownergroup for existing event?");
}
/** get the list of mail addresses that are enabled for this mailbox with the configured sender names
* will put the sender that matches the default sender address in the first spot. this enables us to use
* it as an easy default without having to pass it around separately */
function getOwnMailAddressesWithDefaultSenderInFront(logins, mailboxDetail, mailboxProperties) {
	const defaultSender = getDefaultSender(logins, mailboxDetail);
	const ownMailAddresses = mailboxProperties.mailAddressProperties.map(({ mailAddress, senderName }) => createEncryptedMailAddress({
		address: mailAddress,
		name: senderName
	}));
	const defaultIndex = ownMailAddresses.findIndex((address) => address.address === defaultSender);
	if (defaultIndex < 0) return ownMailAddresses;
	const defaultEncryptedMailAddress = ownMailAddresses.splice(defaultIndex, 1);
	return [...defaultEncryptedMailAddress, ...ownMailAddresses];
}

//#endregion
//#region src/calendar-app/calendar/gui/CalendarGuiUtils.ts
function renderCalendarSwitchLeftButton(label, click) {
	return mithril_default(IconButton, {
		title: label,
		icon: Icons.ArrowBackward,
		click
	});
}
function renderCalendarSwitchRightButton(label, click) {
	return mithril_default(IconButton, {
		title: label,
		icon: Icons.ArrowForward,
		click
	});
}
function weekTitle(date, weekStart) {
	const startOfTheWeekOffset = getStartOfTheWeekOffset(weekStart);
	const firstDate = getStartOfWeek(date, startOfTheWeekOffset);
	const lastDate = incrementDate(new Date(firstDate), 6);
	if (firstDate.getMonth() !== lastDate.getMonth()) {
		if (firstDate.getFullYear() !== lastDate.getFullYear()) return `${lang.formats.monthShortWithFullYear.format(firstDate)} - ${lang.formats.monthShortWithFullYear.format(lastDate)}`;
		return `${lang.formats.monthShort.format(firstDate)} - ${lang.formats.monthShort.format(lastDate)} ${lang.formats.yearNumeric.format(firstDate)}`;
	} else return `${lang.formats.monthLong.format(firstDate)} ${lang.formats.yearNumeric.format(firstDate)}`;
}
function calendarWeek(date, weekStart) {
	if (weekStart !== WeekStart.MONDAY) return null;
	return lang.get("weekNumber_label", { "{week}": String(getWeekNumber(date)) });
}
function calendarNavConfiguration(viewType, date, weekStart, titleType, switcher) {
	const onBack = () => switcher(viewType, false);
	const onForward = () => switcher(viewType, true);
	switch (viewType) {
		case CalendarViewType.DAY: return {
			back: renderCalendarSwitchLeftButton("prevDay_label", onBack),
			forward: renderCalendarSwitchRightButton("nextDay_label", onForward),
			title: titleType === "short" ? formatMonthWithFullYear(date) : formatDateWithWeekday(date)
		};
		case CalendarViewType.MONTH: return {
			back: renderCalendarSwitchLeftButton("prevMonth_label", onBack),
			forward: renderCalendarSwitchRightButton("nextMonth_label", onForward),
			title: formatMonthWithFullYear(date)
		};
		case CalendarViewType.WEEK: return {
			back: renderCalendarSwitchLeftButton("prevWeek_label", onBack),
			forward: renderCalendarSwitchRightButton("nextWeek_label", onForward),
			title: titleType === "short" ? formatMonthWithFullYear(date) : weekTitle(date, weekStart)
		};
		case CalendarViewType.AGENDA: return {
			back: renderCalendarSwitchLeftButton("prevDay_label", onBack),
			forward: renderCalendarSwitchRightButton("nextDay_label", onForward),
			title: titleType === "short" ? formatMonthWithFullYear(date) : formatDateWithWeekday(date)
		};
	}
}
function askIfShouldSendCalendarUpdatesToAttendees() {
	return new Promise((resolve) => {
		let alertDialog;
		const cancelButton = {
			label: "cancel_action",
			click: () => {
				resolve("cancel");
				alertDialog.close();
			},
			type: ButtonType.Secondary
		};
		const noButton = {
			label: "no_label",
			click: () => {
				resolve("no");
				alertDialog.close();
			},
			type: ButtonType.Secondary
		};
		const yesButton = {
			label: "yes_label",
			click: () => {
				resolve("yes");
				alertDialog.close();
			},
			type: ButtonType.Primary
		};
		const onclose = (positive) => positive ? resolve("yes") : resolve("cancel");
		alertDialog = Dialog.confirmMultiple("sendUpdates_msg", [
			cancelButton,
			noButton,
			yesButton
		], onclose);
	});
}
function getDateFromMousePos({ x, y, targetWidth, targetHeight }, weeks) {
	assert(weeks.length > 0, "Weeks must not be zero length");
	const unitHeight = targetHeight / weeks.length;
	const currentSquareY = Math.floor(y / unitHeight);
	const week = weeks[clamp(currentSquareY, 0, weeks.length - 1)];
	assert(week.length > 0, "Week must not be zero length");
	const unitWidth = targetWidth / week.length;
	const currentSquareX = Math.floor(x / unitWidth);
	return week[clamp(currentSquareX, 0, week.length - 1)];
}
function getTimeFromMousePos({ y, targetHeight }, hourDivision) {
	const sectionHeight = targetHeight / 24;
	const hour = y / sectionHeight;
	const hourRounded = Math.floor(hour);
	const minutesInc = 60 / hourDivision;
	const minute = Math.floor((hour - hourRounded) * hourDivision) * minutesInc;
	return new Time(hourRounded, minute);
}
const SELECTED_DATE_INDICATOR_THICKNESS = 4;
function getIconForViewType(viewType) {
	const lookupTable = {
		[CalendarViewType.DAY]: Icons.TableSingle,
		[CalendarViewType.WEEK]: Icons.TableColumns,
		[CalendarViewType.MONTH]: Icons.Table,
		[CalendarViewType.AGENDA]: Icons.ListUnordered
	};
	return lookupTable[viewType];
}
function shouldDefaultToAmPmTimeFormat() {
	return lang.code === "en";
}
function getCalendarMonth(date, firstDayOfWeekFromOffset, weekdayNarrowFormat) {
	const weeks = [[]];
	const calculationDate = getStartOfDay(date);
	calculationDate.setDate(1);
	const beginningOfMonth = new Date(calculationDate);
	let currentYear = calculationDate.getFullYear();
	let month = calculationDate.getMonth();
	let firstDay;
	if (firstDayOfWeekFromOffset > calculationDate.getDay()) firstDay = calculationDate.getDay() + 7 - firstDayOfWeekFromOffset;
else firstDay = calculationDate.getDay() - firstDayOfWeekFromOffset;
	let dayCount;
	incrementDate(calculationDate, -firstDay);
	for (dayCount = 0; dayCount < firstDay; dayCount++) {
		weeks[0].push({
			date: new Date(calculationDate),
			day: calculationDate.getDate(),
			month: calculationDate.getMonth(),
			year: calculationDate.getFullYear(),
			isPaddingDay: true
		});
		incrementDate(calculationDate, 1);
	}
	while (calculationDate.getMonth() === month) {
		if (weeks[0].length && dayCount % 7 === 0) weeks.push([]);
		const dayInfo = {
			date: new Date(currentYear, month, calculationDate.getDate()),
			year: currentYear,
			month,
			day: calculationDate.getDate(),
			isPaddingDay: false
		};
		weeks[weeks.length - 1].push(dayInfo);
		incrementDate(calculationDate, 1);
		dayCount++;
	}
	while (dayCount < 42) {
		if (dayCount % 7 === 0) weeks.push([]);
		weeks[weeks.length - 1].push({
			day: calculationDate.getDate(),
			year: calculationDate.getFullYear(),
			month: calculationDate.getMonth(),
			date: new Date(calculationDate),
			isPaddingDay: true
		});
		incrementDate(calculationDate, 1);
		dayCount++;
	}
	const weekdays = [];
	const weekdaysDate = new Date();
	incrementDate(weekdaysDate, -weekdaysDate.getDay() + firstDayOfWeekFromOffset);
	for (let i = 0; i < 7; i++) {
		weekdays.push(weekdayNarrowFormat ? lang.formats.weekdayNarrow.format(weekdaysDate) : lang.formats.weekdayShort.format(weekdaysDate));
		incrementDate(weekdaysDate, 1);
	}
	return {
		beginningOfMonth,
		weekdays,
		weeks
	};
}
function formatEventDuration(event, zone, includeTimezone) {
	if (isAllDayEvent(event)) {
		const startTime = getEventStart(event, zone);
		const startString = formatDateWithMonth(startTime);
		const endTime = incrementByRepeatPeriod(getEventEnd(event, zone), RepeatPeriod.DAILY, -1, zone);
		if (isSameDayOfDate(startTime, endTime)) return `${lang.get("allDay_label")}, ${startString}`;
else return `${lang.get("allDay_label")}, ${startString} - ${formatDateWithMonth(endTime)}`;
	} else {
		const startString = formatDateTime(event.startTime);
		let endString;
		if (isSameDay(event.startTime, event.endTime)) endString = formatTime(event.endTime);
else endString = formatDateTime(event.endTime);
		return `${startString} - ${endString} ${includeTimezone ? getTimeZone() : ""}`;
	}
}
const createRepeatRuleFrequencyValues = () => {
	return [
		{
			name: lang.get("calendarRepeatIntervalNoRepeat_label"),
			value: null
		},
		{
			name: lang.get("calendarRepeatIntervalDaily_label"),
			value: RepeatPeriod.DAILY
		},
		{
			name: lang.get("calendarRepeatIntervalWeekly_label"),
			value: RepeatPeriod.WEEKLY
		},
		{
			name: lang.get("calendarRepeatIntervalMonthly_label"),
			value: RepeatPeriod.MONTHLY
		},
		{
			name: lang.get("calendarRepeatIntervalAnnually_label"),
			value: RepeatPeriod.ANNUALLY
		}
	];
};
const createRepeatRuleOptions = () => {
	return [
		{
			name: "calendarRepeatIntervalNoRepeat_label",
			value: null
		},
		{
			name: "calendarRepeatIntervalDaily_label",
			value: RepeatPeriod.DAILY
		},
		{
			name: "calendarRepeatIntervalWeekly_label",
			value: RepeatPeriod.WEEKLY
		},
		{
			name: "calendarRepeatIntervalMonthly_label",
			value: RepeatPeriod.MONTHLY
		},
		{
			name: "calendarRepeatIntervalAnnually_label",
			value: RepeatPeriod.ANNUALLY
		},
		{
			name: "custom_label",
			value: "CUSTOM"
		}
	];
};
const customFrequenciesOptions = [
	{
		name: {
			singular: "day_label",
			plural: "days_label"
		},
		value: RepeatPeriod.DAILY
	},
	{
		name: {
			singular: "week_label",
			plural: "weeks_label"
		},
		value: RepeatPeriod.WEEKLY
	},
	{
		name: {
			singular: "month_label",
			plural: "months_label"
		},
		value: RepeatPeriod.MONTHLY
	},
	{
		name: {
			singular: "year_label",
			plural: "years_label"
		},
		value: RepeatPeriod.ANNUALLY
	}
];
const createCustomEndTypeOptions = () => {
	return [
		{
			name: "calendarRepeatStopConditionNever_label",
			value: EndType.Never
		},
		{
			name: "calendarRepeatStopConditionOccurrences_label",
			value: EndType.Count
		},
		{
			name: "calendarRepeatStopConditionDate_label",
			value: EndType.UntilDate
		}
	];
};
const createIntervalValues = () => numberRange(1, 256).map((n) => ({
	name: String(n),
	value: n,
	ariaValue: String(n)
}));
function humanDescriptionForAlarmInterval(value, locale) {
	if (value.value === 0) return lang.get("calendarReminderIntervalAtEventStart_label");
	return Duration.fromObject(alarmIntervalToLuxonDurationLikeObject(value)).reconfigure({ locale }).toHuman();
}
const createAlarmIntervalItems = (locale) => typedValues(StandardAlarmInterval).map((value) => {
	return {
		value,
		name: humanDescriptionForAlarmInterval(value, locale)
	};
});
const createAttendingItems = () => [
	{
		name: lang.get("attending_label"),
		value: CalendarAttendeeStatus.ACCEPTED,
		ariaValue: lang.get("attending_label")
	},
	{
		name: lang.get("maybeAttending_label"),
		value: CalendarAttendeeStatus.TENTATIVE,
		ariaValue: lang.get("maybeAttending_label")
	},
	{
		name: lang.get("notAttending_label"),
		value: CalendarAttendeeStatus.DECLINED,
		ariaValue: lang.get("notAttending_label")
	},
	{
		name: lang.get("pending_label"),
		value: CalendarAttendeeStatus.NEEDS_ACTION,
		selectable: false,
		ariaValue: lang.get("pending_label")
	}
];
function humanDescriptionForAlarmIntervalUnit(unit) {
	switch (unit) {
		case AlarmIntervalUnit.MINUTE: return lang.get("calendarReminderIntervalUnitMinutes_label");
		case AlarmIntervalUnit.HOUR: return lang.get("calendarReminderIntervalUnitHours_label");
		case AlarmIntervalUnit.DAY: return lang.get("calendarReminderIntervalUnitDays_label");
		case AlarmIntervalUnit.WEEK: return lang.get("calendarReminderIntervalUnitWeeks_label");
	}
}
function formatEventTime({ endTime, startTime }, showTime) {
	switch (showTime) {
		case EventTextTimeOption.START_TIME: return formatTime(startTime);
		case EventTextTimeOption.END_TIME: return ` - ${formatTime(endTime)}`;
		case EventTextTimeOption.START_END_TIME: return `${formatTime(startTime)} - ${formatTime(endTime)}`;
		default: throw new ProgrammingError(`Unknown time option: ${showTime}`);
	}
}
function formatEventTimes(day, event, zone) {
	if (isAllDayEvent(event)) return lang.get("allDay_label");
else {
		const startsBefore = eventStartsBefore(day, zone, event);
		const endsAfter = eventEndsAfterDay(day, zone, event);
		if (startsBefore && endsAfter) return lang.get("allDay_label");
else {
			const startTime = startsBefore ? day : event.startTime;
			const endTime = endsAfter ? getEndOfDayWithZone(day, zone) : event.endTime;
			return formatEventTime({
				startTime,
				endTime
			}, EventTextTimeOption.START_END_TIME);
		}
	}
}
const createCustomRepeatRuleUnitValues = () => {
	return [
		{
			name: humanDescriptionForAlarmIntervalUnit(AlarmIntervalUnit.MINUTE),
			value: AlarmIntervalUnit.MINUTE
		},
		{
			name: humanDescriptionForAlarmIntervalUnit(AlarmIntervalUnit.HOUR),
			value: AlarmIntervalUnit.HOUR
		},
		{
			name: humanDescriptionForAlarmIntervalUnit(AlarmIntervalUnit.DAY),
			value: AlarmIntervalUnit.DAY
		},
		{
			name: humanDescriptionForAlarmIntervalUnit(AlarmIntervalUnit.WEEK),
			value: AlarmIntervalUnit.WEEK
		}
	];
};
const CALENDAR_EVENT_HEIGHT = size.calendar_line_height + 2;
const TEMPORARY_EVENT_OPACITY = .7;
let EventLayoutMode = function(EventLayoutMode$1) {
	/** Take event start and end times into account when laying out. */
	EventLayoutMode$1[EventLayoutMode$1["TimeBasedColumn"] = 0] = "TimeBasedColumn";
	/** Each event is treated as if it would take the whole day when laying out. */
	EventLayoutMode$1[EventLayoutMode$1["DayBasedColumn"] = 1] = "DayBasedColumn";
	return EventLayoutMode$1;
}({});
function layOutEvents(events, zone, renderer, layoutMode) {
	events.sort((e1, e2) => {
		const e1Start = getEventStart(e1, zone);
		const e2Start = getEventStart(e2, zone);
		if (e1Start < e2Start) return -1;
		if (e1Start > e2Start) return 1;
		const e1End = getEventEnd(e1, zone);
		const e2End = getEventEnd(e2, zone);
		if (e1End < e2End) return -1;
		if (e1End > e2End) return 1;
		return 0;
	});
	let lastEventEnding = null;
	let lastEventStart = null;
	let columns = [];
	const children = [];
	const calcEvents = new Map();
	for (const e of events) {
		const calcEvent = getFromMap(calcEvents, e, () => getCalculationEvent(e, zone, layoutMode));
		if (lastEventEnding != null && lastEventStart != null && lastEventEnding <= calcEvent.startTime.getTime() && (layoutMode === EventLayoutMode.DayBasedColumn || !visuallyOverlaps(lastEventStart, lastEventEnding, calcEvent.startTime))) {
			children.push(...renderer(columns));
			columns = [];
			lastEventEnding = null;
			lastEventStart = null;
		}
		let placed = false;
		for (let i = 0; i < columns.length; i++) {
			const col = columns[i];
			const lastEvent = col[col.length - 1];
			const lastCalcEvent = getFromMap(calcEvents, lastEvent, () => getCalculationEvent(lastEvent, zone, layoutMode));
			if (!collidesWith(lastCalcEvent, calcEvent) && (layoutMode === EventLayoutMode.DayBasedColumn || !visuallyOverlaps(lastCalcEvent.startTime, lastCalcEvent.endTime, calcEvent.startTime))) {
				col.push(e);
				placed = true;
				break;
			}
		}
		if (!placed) columns.push([e]);
		if (lastEventEnding == null || lastEventEnding.getTime() < calcEvent.endTime.getTime()) lastEventEnding = calcEvent.endTime;
		if (lastEventStart == null || lastEventStart.getTime() < calcEvent.startTime.getTime()) lastEventStart = calcEvent.startTime;
	}
	children.push(...renderer(columns));
	return children;
}
/** get an event that can be rendered to the screen. in day view, the event is returned as-is, otherwise it's stretched to cover each day
* it occurs on completely. */
function getCalculationEvent(event, zone, eventLayoutMode) {
	if (eventLayoutMode === EventLayoutMode.DayBasedColumn) {
		const calcEvent = clone(event);
		if (isAllDayEvent(event)) {
			calcEvent.startTime = getAllDayDateForTimezone(event.startTime, zone);
			calcEvent.endTime = getAllDayDateForTimezone(event.endTime, zone);
		} else {
			calcEvent.startTime = getStartOfDayWithZone(event.startTime, zone);
			calcEvent.endTime = getStartOfNextDayWithZone(event.endTime, zone);
		}
		return calcEvent;
	} else return event;
}
/**
* This function checks whether two events collide based on their start and end time
* Assuming vertical columns with time going top-to-bottom, this would be true in these cases:
*
* case 1:
* +-----------+
* |           |
* |           |   +----------+
* +-----------+   |          |
*                 |          |
*                 +----------+
* case 2:
* +-----------+
* |           |   +----------+
* |           |   |          |
* |           |   +----------+
* +-----------+
*
* There could be a case where they are flipped vertically, but we don't have them because earlier events will be always first. so the "left" top edge will
* always be "above" the "right" top edge.
*/
function collidesWith(a, b) {
	return a.endTime.getTime() > b.startTime.getTime() && a.startTime.getTime() < b.endTime.getTime();
}
/**
* Due to the minimum height for events they overlap if a short event is directly followed by another event,
* therefore, we check whether the event height is less than the minimum height.
*
* This does not cover all the cases but handles the case when the second event starts right after the first one.
*/
function visuallyOverlaps(firstEventStart, firstEventEnd, secondEventStart) {
	const firstEventStartOnSameDay = isSameDay(firstEventStart, firstEventEnd) ? firstEventStart.getTime() : getStartOfDay(firstEventEnd).getTime();
	const eventDurationMs = firstEventEnd.getTime() - firstEventStartOnSameDay;
	const eventDurationHours = eventDurationMs / 36e5;
	const height = eventDurationHours * size.calendar_hour_height - size.calendar_event_border;
	return firstEventEnd.getTime() === secondEventStart.getTime() && height < size.calendar_line_height;
}
function expandEvent(ev, columnIndex, columns) {
	let colSpan = 1;
	for (let i = columnIndex + 1; i < columns.length; i++) {
		let col = columns[i];
		for (let j = 0; j < col.length; j++) {
			let ev1 = col[j];
			if (collidesWith(ev, ev1) || visuallyOverlaps(ev.startTime, ev.endTime, ev1.startTime)) return colSpan;
		}
		colSpan++;
	}
	return colSpan;
}
function getEventColor(event, groupColors) {
	return (event._ownerGroup && groupColors.get(event._ownerGroup)) ?? defaultCalendarColor;
}
function calendarAttendeeStatusSymbol(status) {
	switch (status) {
		case CalendarAttendeeStatus.ADDED:
		case CalendarAttendeeStatus.NEEDS_ACTION: return "";
		case CalendarAttendeeStatus.TENTATIVE: return "?";
		case CalendarAttendeeStatus.ACCEPTED: return "✓";
		case CalendarAttendeeStatus.DECLINED: return "❌";
		default: throw new Error("Unknown calendar attendee status: " + status);
	}
}
const iconForAttendeeStatus = Object.freeze({
	[CalendarAttendeeStatus.ACCEPTED]: Icons.CircleCheckmark,
	[CalendarAttendeeStatus.TENTATIVE]: Icons.CircleHelp,
	[CalendarAttendeeStatus.DECLINED]: Icons.CircleReject,
	[CalendarAttendeeStatus.NEEDS_ACTION]: Icons.CircleHelp,
	[CalendarAttendeeStatus.ADDED]: Icons.CircleHelp
});
const getGroupColors = memoized((userSettingsGroupRoot) => {
	return userSettingsGroupRoot.groupSettings.reduce((acc, { group, color }) => {
		if (!isValidColorCode("#" + color)) color = defaultCalendarColor;
		acc.set(group, color);
		return acc;
	}, new Map());
});
const getClientOnlyColors = (userId, clientOnlyCalendarsInfo) => {
	const colors = new Map();
	for (const [id, _] of CLIENT_ONLY_CALENDARS) {
		const calendarId = `${userId}#${id}`;
		colors.set(calendarId, clientOnlyCalendarsInfo.get(calendarId)?.color ?? DEFAULT_CLIENT_ONLY_CALENDAR_COLORS.get(id));
	}
	return colors;
};
const getClientOnlyCalendars = (userId, clientOnlyCalendarInfo) => {
	const userCalendars = [];
	for (const [id, key] of CLIENT_ONLY_CALENDARS) {
		const calendarId = `${userId}#${id}`;
		const calendar = clientOnlyCalendarInfo.get(calendarId);
		if (calendar) userCalendars.push({
			...calendar,
			id: calendarId,
			name: calendar.name ? calendar.name : lang.get(key)
		});
	}
	return userCalendars;
};
function getEventType(existingEvent, calendars, ownMailAddresses, userController) {
	const { user, userSettingsGroupRoot } = userController;
	if (user.accountType === AccountType.EXTERNAL) return EventType.EXTERNAL;
	const existingOrganizer = existingEvent.organizer;
	const isOrganizer = existingOrganizer != null && ownMailAddresses.some((a) => cleanMailAddress(a) === existingOrganizer.address);
	if (existingEvent._ownerGroup == null) if (existingOrganizer != null && !isOrganizer) return EventType.INVITE;
else return EventType.OWN;
	const calendarInfoForEvent = calendars.get(existingEvent._ownerGroup) ?? null;
	if (calendarInfoForEvent == null || calendarInfoForEvent.isExternal) return EventType.SHARED_RO;
	/**
	* if the event has a _ownerGroup, it means there is a calendar set to it
	* so, if the user is the owner of said calendar they are free to manage the event however they want
	**/
	if ((isOrganizer || existingOrganizer === null) && calendarInfoForEvent.userIsOwner) return EventType.OWN;
	if (calendarInfoForEvent.shared) {
		const canWrite = hasCapabilityOnGroup(user, calendarInfoForEvent.group, ShareCapability.Write);
		if (canWrite) {
			const organizerAddress = cleanMailAddress(existingOrganizer?.address ?? "");
			const wouldRequireUpdates = existingEvent.attendees != null && existingEvent.attendees.some((a) => cleanMailAddress(a.address.address) !== organizerAddress);
			return wouldRequireUpdates ? EventType.LOCKED : EventType.SHARED_RW;
		} else return EventType.SHARED_RO;
	}
	if (existingOrganizer == null || existingEvent.attendees?.length === 0 || isOrganizer) return EventType.OWN;
else return EventType.INVITE;
}
function shouldDisplayEvent(e, hiddenCalendars) {
	return !hiddenCalendars.has(assertNotNull(e._ownerGroup, "event without ownerGroup in getEventsOnDays"));
}
function daysHaveEvents(eventsOnDays) {
	return eventsOnDays.shortEventsPerDay.some(isNotEmpty) || isNotEmpty(eventsOnDays.longEvents);
}
function changePeriodOnWheel(callback) {
	return (event) => {
		callback(event.deltaY > 0 || event.deltaX > 0);
	};
}
async function showDeletePopup(model, ev, receiver, onClose) {
	if (await model.isRepeatingForDeleting()) createAsyncDropdown({
		lazyButtons: () => Promise.resolve([{
			label: "deleteSingleEventRecurrence_action",
			click: async () => {
				await model.deleteSingle();
				onClose?.();
			}
		}, {
			label: "deleteAllEventRecurrence_action",
			click: () => confirmDeleteClose(model, onClose)
		}]),
		width: 300
	})(ev, receiver);
else confirmDeleteClose(model, onClose);
}
async function confirmDeleteClose(model, onClose) {
	if (!await Dialog.confirm("deleteEventConfirmation_msg")) return;
	await model.deleteAll();
	onClose?.();
}
function getDisplayEventTitle(title) {
	return title ?? title !== "" ? title : lang.get("noTitle_label");
}
function generateRandomColor() {
	const model = new ColorPickerModel(!isColorLight(theme.content_bg));
	return hslToHex(model.getColor(Math.floor(Math.random() * MAX_HUE_ANGLE), 2));
}
function renderCalendarColor(selectedCalendar, groupColors) {
	const color = selectedCalendar ? groupColors.get(selectedCalendar.groupInfo.group) ?? defaultCalendarColor : null;
	return mithril_default(".mt-xs", { style: {
		width: "100px",
		height: "10px",
		background: color ? "#" + color : "transparent"
	} });
}

//#endregion
export { CALENDAR_EVENT_HEIGHT, CalendarEventModel, CalendarNotificationModel, CalendarOperation, EventLayoutMode, EventSaveResult, EventType, ReadonlyReason, SELECTED_DATE_INDICATOR_THICKNESS, TEMPORARY_EVENT_OPACITY, askIfShouldSendCalendarUpdatesToAttendees, assembleCalendarEventEditResult, assembleEditResultAndAssignFromExisting, assignEventIdentity, calendarAttendeeStatusSymbol, calendarNavConfiguration, calendarWeek, changePeriodOnWheel, createAlarmIntervalItems, createAttendingItems, createCustomEndTypeOptions, createCustomRepeatRuleUnitValues, createIntervalValues, createRepeatRuleFrequencyValues, createRepeatRuleOptions, customFrequenciesOptions, daysHaveEvents, eventHasChanged, expandEvent, formatEventDuration, formatEventTime, formatEventTimes, generateRandomColor, getCalendarMonth, getClientOnlyCalendars, getClientOnlyColors, getDateFromMousePos, getDisplayEventTitle, getEventColor, getEventType, getGroupColors, getIconForViewType, getNonOrganizerAttendees, getTimeFromMousePos, hasPlanWithInvites, humanDescriptionForAlarmInterval, humanDescriptionForAlarmIntervalUnit, iconForAttendeeStatus, layOutEvents, makeCalendarEventModel, renderCalendarColor, renderCalendarSwitchLeftButton, renderCalendarSwitchRightButton, shouldDefaultToAmPmTimeFormat, shouldDisplayEvent, showDeletePopup };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FsZW5kYXJHdWlVdGlscy1jaHVuay5qcyIsIm5hbWVzIjpbImluaXRpYWxWYWx1ZXM6IFBhcnRpYWw8U3RyaXBwZWQ8Q2FsZW5kYXJFdmVudD4+IiwiZXZlbnRUeXBlOiBFdmVudFR5cGUiLCJvcGVyYXRpb246IENhbGVuZGFyT3BlcmF0aW9uIiwiY2FsZW5kYXJzOiBSZWFkb25seU1hcDxJZCwgQ2FsZW5kYXJJbmZvPiIsIl9zZWxlY3RlZENhbGVuZGFyOiBDYWxlbmRhckluZm8iLCJ1c2VyQ29udHJvbGxlcjogVXNlckNvbnRyb2xsZXIiLCJpc05ldzogYm9vbGVhbiIsIm93bk1haWxBZGRyZXNzZXM6IFJlYWRvbmx5QXJyYXk8RW5jcnlwdGVkTWFpbEFkZHJlc3M+IiwicmVjaXBpZW50c01vZGVsOiBSZWNpcGllbnRzTW9kZWwiLCJyZXNwb25zZVRvOiBNYWlsIHwgbnVsbCIsInBhc3N3b3JkU3RyZW5ndGhNb2RlbDogKHBhc3N3b3JkOiBzdHJpbmcsIHJlY2lwaWVudEluZm86IFBhcnRpYWxSZWNpcGllbnQpID0+IG51bWJlciIsInNlbmRNYWlsTW9kZWxGYWN0b3J5OiBsYXp5PFNlbmRNYWlsTW9kZWw+IiwidWlVcGRhdGVDYWxsYmFjazogKCkgPT4gdm9pZCIsInY6IENhbGVuZGFySW5mbyIsImdyb3VwU2V0dGluZ3M6IEdyb3VwU2V0dGluZ3NbXSIsImdyb3VwSWQ6IElkIiwiYTogUGFydGlhbFJlY2lwaWVudCIsInJlY2lwaWVudDogUmVjaXBpZW50IiwiYTogQ2FsZW5kYXJFdmVudEF0dGVuZGVlIiwiYWRkcmVzczogc3RyaW5nIiwiY29udGFjdDogQ29udGFjdCB8IG51bGwiLCJhZGRyZXNzOiBFbmNyeXB0ZWRNYWlsQWRkcmVzcyIsInN0YXR1czogQ2FsZW5kYXJBdHRlbmRlZVN0YXR1cyIsInBhc3N3b3JkOiBzdHJpbmciLCJhdHRlbmRlZXM6IFJlYWRvbmx5QXJyYXk8Q2FsZW5kYXJFdmVudEF0dGVuZGVlPiIsInJlc3BvbnNlTW9kZWw6IFNlbmRNYWlsTW9kZWwiLCJpbml0aWFsQXR0ZW5kZWVzOiBSZWFkb25seU1hcDx1bmtub3duLCBDYWxlbmRhckV2ZW50QXR0ZW5kZWU+IiwiY3VycmVudEF0dGVuZGVlczogUmVhZG9ubHlNYXA8dW5rbm93biwgQ2FsZW5kYXJFdmVudEF0dGVuZGVlPiIsImlzT3JnYW5pemVyOiBib29sZWFuIiwiYXR0ZW5kZWVzVG9JbnZpdGU6IFJlYWRvbmx5QXJyYXk8Q2FsZW5kYXJFdmVudEF0dGVuZGVlPiIsImF0dGVuZGVlc1RvVXBkYXRlOiBSZWFkb25seUFycmF5PENhbGVuZGFyRXZlbnRBdHRlbmRlZT4iLCJvcmdhbml6ZXI6IENhbGVuZGFyRXZlbnRBdHRlbmRlZSB8IG51bGwiLCJvd25BdHRlbmRlZTogQ2FsZW5kYXJFdmVudEF0dGVuZGVlIHwgbnVsbCIsImFsbEF0dGVuZGVlczogQXJyYXk8Q2FsZW5kYXJFdmVudEF0dGVuZGVlPiIsImV2ZW50VHlwZTogRXZlbnRUeXBlIiwiYWxhcm1zOiBBcnJheTxBbGFybUludGVydmFsPiIsImRhdGVQcm92aWRlcjogRGF0ZVByb3ZpZGVyIiwidWlVcGRhdGVDYWxsYmFjazogKCkgPT4gdm9pZCIsInRyaWdnZXI6IEFsYXJtSW50ZXJ2YWwgfCBudWxsIiwiYWxhcm1JbnRlcnZhbDogQWxhcm1JbnRlcnZhbCIsImFsYXJtSW50ZXJ2YWxMaXN0OiBBbGFybUludGVydmFsW10iLCJhbGFybU9uZTogQWxhcm1JbnRlcnZhbCIsImFsYXJtVHdvOiBBbGFybUludGVydmFsIiwidGV4dDogc3RyaW5nIiwic2FuaXRpemVyOiBIdG1sU2FuaXRpemVyIiwidWlVcGRhdGVDYWxsYmFjazogKCkgPT4gdm9pZCIsInY6IHN0cmluZyIsIm5vdGlmaWNhdGlvblNlbmRlcjogQ2FsZW5kYXJOb3RpZmljYXRpb25TZW5kZXIiLCJsb2dpbkNvbnRyb2xsZXI6IExvZ2luQ29udHJvbGxlciIsImV2ZW50OiBDYWxlbmRhckV2ZW50IiwicmVjdXJyZW5jZUlkczogQXJyYXk8RGF0ZT4iLCJzZW5kTW9kZWxzOiBDYWxlbmRhck5vdGlmaWNhdGlvblNlbmRNb2RlbHMiLCJpbnZpdGVNb2RlbDogU2VuZE1haWxNb2RlbCIsImNhbmNlbE1vZGVsOiBTZW5kTWFpbE1vZGVsIiwidXBkYXRlTW9kZWw6IFNlbmRNYWlsTW9kZWwiLCJuZXdFdmVudDogQ2FsZW5kYXJFdmVudCIsInJlc3BvbnNlTW9kZWw6IFNlbmRNYWlsTW9kZWwiLCJjYWxlbmRhck1vZGVsOiBDYWxlbmRhck1vZGVsIiwibG9naW5zOiBMb2dpbkNvbnRyb2xsZXIiLCJub3RpZmljYXRpb25Nb2RlbDogQ2FsZW5kYXJOb3RpZmljYXRpb25Nb2RlbCIsImxhenlSZWN1cnJlbmNlSWRzOiAodWlkPzogc3RyaW5nIHwgbnVsbCkgPT4gUHJvbWlzZTxBcnJheTxEYXRlPj4iLCJzaG93UHJvZ3Jlc3M6IFNob3dQcm9ncmVzc0NhbGxiYWNrIiwiem9uZTogc3RyaW5nIiwiZWRpdE1vZGVsczogQ2FsZW5kYXJFdmVudEVkaXRNb2RlbHMiLCJlZGl0TW9kZWxzRm9yUHJvZ2VuaXRvcjogQ2FsZW5kYXJFdmVudEVkaXRNb2RlbHMiLCJleGlzdGluZ0V2ZW50OiBDYWxlbmRhckV2ZW50IiwicmVjdXJyZW5jZUlkczogQXJyYXk8RGF0ZT4iLCJzZW5kTW9kZWxzIiwibmV3RXZlbnQiLCJuZXdBbGFybXMiLCJleGlzdGluZ0luc3RhbmNlOiBDYWxlbmRhckV2ZW50IiwicHJvZ2VuaXRvcjogQ2FsZW5kYXJFdmVudCIsImV4aXN0aW5nQWx0ZXJlZEluc3RhbmNlOiBDYWxlbmRhckV2ZW50IiwidGV4dDogc3RyaW5nIiwidWlVcGRhdGVDYWxsYmFjazogKCkgPT4gdm9pZCIsIm9wZXJhdGlvbjogQ2FsZW5kYXJPcGVyYXRpb24iLCJpbml0aWFsVmFsdWVzOiBQYXJ0aWFsPENhbGVuZGFyRXZlbnQ+IiwicmVjaXBpZW50c01vZGVsOiBSZWNpcGllbnRzTW9kZWwiLCJjYWxlbmRhck1vZGVsOiBDYWxlbmRhck1vZGVsIiwibG9naW5zOiBMb2dpbkNvbnRyb2xsZXIiLCJtYWlsYm94RGV0YWlsOiBNYWlsYm94RGV0YWlsIiwibWFpbGJveFByb3BlcnRpZXM6IE1haWxib3hQcm9wZXJ0aWVzIiwic2VuZE1haWxNb2RlbEZhY3Rvcnk6IGxhenk8U2VuZE1haWxNb2RlbD4iLCJub3RpZmljYXRpb25TZW5kZXI6IENhbGVuZGFyTm90aWZpY2F0aW9uU2VuZGVyIiwiZW50aXR5Q2xpZW50OiBFbnRpdHlDbGllbnQiLCJyZXNwb25zZVRvOiBNYWlsIHwgbnVsbCIsInpvbmU6IHN0cmluZyIsInNob3dQcm9ncmVzczogU2hvd1Byb2dyZXNzQ2FsbGJhY2siLCJ1aVVwZGF0ZUNhbGxiYWNrOiAoKSA9PiB2b2lkIiwibSIsInBhc3N3b3JkOiBzdHJpbmciLCJyZWNpcGllbnRJbmZvOiBQYXJ0aWFsUmVjaXBpZW50IiwiaW5pdGlhbGl6YXRpb25FdmVudDogQ2FsZW5kYXJFdmVudCIsInVpZD86IHN0cmluZyIsIm1ha2VFZGl0TW9kZWxzOiAoaTogU3RyaXBwZWRFbnRpdHk8Q2FsZW5kYXJFdmVudD4pID0+IENhbGVuZGFyRXZlbnRFZGl0TW9kZWxzIiwiYXBwbHlTdHJhdGVnaWVzOiBDYWxlbmRhckV2ZW50QXBwbHlTdHJhdGVnaWVzIiwicmVzb2x2ZVByb2dlbml0b3I6ICgpID0+IFByb21pc2U8Q2FsZW5kYXJFdmVudCB8IG51bGw+IiwiZXhpc3RpbmdJbnN0YW5jZUlkZW50aXR5OiBDYWxlbmRhckV2ZW50IiwiY2xlYW5Jbml0aWFsVmFsdWVzOiBTdHJpcHBlZEVudGl0eTxDYWxlbmRhckV2ZW50PiIsImVkaXRNb2RlbHM6IENhbGVuZGFyRXZlbnRFZGl0TW9kZWxzIiwiYXBwbHk6ICgpID0+IFByb21pc2U8dm9pZD4iLCJtYXlSZXF1aXJlU2VuZGluZ1VwZGF0ZXM6ICgpID0+IGJvb2xlYW4iLCJzdHJhdGVneTogQ2FsZW5kYXJFdmVudE1vZGVsU3RyYXRlZ3kiLCJldmVudFR5cGU6IEV2ZW50VHlwZSIsInVzZXJDb250cm9sbGVyOiBVc2VyQ29udHJvbGxlciIsImRpc3RyaWJ1dG9yOiBDYWxlbmRhck5vdGlmaWNhdGlvblNlbmRlciIsImNhbGVuZGFyczogUmVhZG9ubHlNYXA8SWQsIENhbGVuZGFySW5mbz4iLCJub3c6IENhbGVuZGFyRXZlbnQiLCJwcmV2aW91czogUGFydGlhbDxDYWxlbmRhckV2ZW50PiB8IG51bGwiLCJtb2RlbHM6IENhbGVuZGFyRXZlbnRFZGl0TW9kZWxzIiwiZXhpc3RpbmdFdmVudDogQ2FsZW5kYXJFdmVudCIsInZhbHVlczogQ2FsZW5kYXJFdmVudFZhbHVlcyIsImlkZW50aXR5OiBSZXF1aXJlPFwidWlkXCIsIFBhcnRpYWw8Q2FsZW5kYXJFdmVudElkZW50aXR5Pj4iLCJpZGVudGl0eSIsImFsYXJtczogQ2FsZW5kYXJFdmVudFtcImFsYXJtSW5mb3NcIl0iLCJ1c2VyOiBVc2VyIiwiaW5pdGlhbFZhbHVlczogU3RyaXBwZWRFbnRpdHk8Q2FsZW5kYXJFdmVudD4iLCJldmVudD86IFBhcnRpYWw8Q2FsZW5kYXJFdmVudD4gfCBudWxsIiwib3duZXJHcm91cDogc3RyaW5nIHwgbnVsbCIsImxhYmVsOiBUcmFuc2xhdGlvbktleSIsImNsaWNrOiAoKSA9PiB1bmtub3duIiwiZGF0ZTogRGF0ZSIsIndlZWtTdGFydDogV2Vla1N0YXJ0Iiwidmlld1R5cGU6IENhbGVuZGFyVmlld1R5cGUiLCJ0aXRsZVR5cGU6IFwic2hvcnRcIiB8IFwiZGV0YWlsZWRcIiIsInN3aXRjaGVyOiAodmlld1R5cGU6IENhbGVuZGFyVmlld1R5cGUsIG5leHQ6IGJvb2xlYW4pID0+IHVua25vd24iLCJhbGVydERpYWxvZzogRGlhbG9nIiwicG9zaXRpdmU6IGJvb2xlYW4iLCJ3ZWVrczogQXJyYXk8QXJyYXk8RGF0ZT4+IiwiaG91ckRpdmlzaW9uOiBudW1iZXIiLCJsb29rdXBUYWJsZTogUmVjb3JkPENhbGVuZGFyVmlld1R5cGUsIEFsbEljb25zPiIsImZpcnN0RGF5T2ZXZWVrRnJvbU9mZnNldDogbnVtYmVyIiwid2Vla2RheU5hcnJvd0Zvcm1hdDogYm9vbGVhbiIsIndlZWtzOiBBcnJheTxBcnJheTxDYWxlbmRhckRheT4+Iiwid2Vla2RheXM6IHN0cmluZ1tdIiwiZXZlbnQ6IENhbGVuZGFyRXZlbnRUaW1lcyIsInpvbmU6IHN0cmluZyIsImluY2x1ZGVUaW1lem9uZTogYm9vbGVhbiIsInZhbHVlOiBBbGFybUludGVydmFsIiwibG9jYWxlOiBzdHJpbmciLCJ1bml0OiBBbGFybUludGVydmFsVW5pdCIsInNob3dUaW1lOiBFdmVudFRleHRUaW1lT3B0aW9uIiwiZGF5OiBEYXRlIiwiZXZlbnQ6IENhbGVuZGFyRXZlbnQiLCJzdGFydFRpbWU6IERhdGUiLCJlbmRUaW1lOiBEYXRlIiwiQ0FMRU5EQVJfRVZFTlRfSEVJR0hUOiBudW1iZXIiLCJldmVudHM6IEFycmF5PENhbGVuZGFyRXZlbnQ+IiwicmVuZGVyZXI6IChjb2x1bW5zOiBBcnJheTxBcnJheTxDYWxlbmRhckV2ZW50Pj4pID0+IENoaWxkQXJyYXkiLCJsYXlvdXRNb2RlOiBFdmVudExheW91dE1vZGUiLCJsYXN0RXZlbnRFbmRpbmc6IERhdGUgfCBudWxsIiwibGFzdEV2ZW50U3RhcnQ6IERhdGUgfCBudWxsIiwiY29sdW1uczogQXJyYXk8QXJyYXk8Q2FsZW5kYXJFdmVudD4+IiwiY2hpbGRyZW46IEFycmF5PENoaWxkcmVuPiIsImV2ZW50TGF5b3V0TW9kZTogRXZlbnRMYXlvdXRNb2RlIiwiYTogQ2FsZW5kYXJFdmVudCIsImI6IENhbGVuZGFyRXZlbnQiLCJmaXJzdEV2ZW50U3RhcnQ6IERhdGUiLCJmaXJzdEV2ZW50RW5kOiBEYXRlIiwic2Vjb25kRXZlbnRTdGFydDogRGF0ZSIsImV2OiBDYWxlbmRhckV2ZW50IiwiY29sdW1uSW5kZXg6IG51bWJlciIsImdyb3VwQ29sb3JzOiBHcm91cENvbG9ycyIsInN0YXR1czogQ2FsZW5kYXJBdHRlbmRlZVN0YXR1cyIsImljb25Gb3JBdHRlbmRlZVN0YXR1czogUmVjb3JkPENhbGVuZGFyQXR0ZW5kZWVTdGF0dXMsIEFsbEljb25zPiIsInVzZXJTZXR0aW5nc0dyb3VwUm9vdDogVXNlclNldHRpbmdzR3JvdXBSb290IiwidXNlcklkOiBJZCIsImNsaWVudE9ubHlDYWxlbmRhcnNJbmZvOiBNYXA8SWQsIENsaWVudE9ubHlDYWxlbmRhcnNJbmZvPiIsImNvbG9yczogTWFwPElkLCBzdHJpbmc+IiwiY2xpZW50T25seUNhbGVuZGFySW5mbzogTWFwPElkLCBDbGllbnRPbmx5Q2FsZW5kYXJzSW5mbz4iLCJ1c2VyQ2FsZW5kYXJzOiAoQ2xpZW50T25seUNhbGVuZGFyc0luZm8gJiB7IGlkOiBzdHJpbmc7IG5hbWU6IHN0cmluZyB9KVtdIiwiZXhpc3RpbmdFdmVudDogUGFydGlhbDxDYWxlbmRhckV2ZW50PiIsImNhbGVuZGFyczogUmVhZG9ubHlNYXA8SWQsIENhbGVuZGFySW5mbz4iLCJvd25NYWlsQWRkcmVzc2VzOiBSZWFkb25seUFycmF5PHN0cmluZz4iLCJ1c2VyQ29udHJvbGxlcjogVXNlckNvbnRyb2xsZXIiLCJ3b3VsZFJlcXVpcmVVcGRhdGVzOiBib29sZWFuIiwiZTogQ2FsZW5kYXJFdmVudCIsImhpZGRlbkNhbGVuZGFyczogUmVhZG9ubHlTZXQ8SWQ+IiwiZXZlbnRzT25EYXlzOiBFdmVudHNPbkRheXMiLCJjYWxsYmFjazogKGlzTmV4dDogYm9vbGVhbikgPT4gdW5rbm93biIsImV2ZW50OiBXaGVlbEV2ZW50IiwibW9kZWw6IENhbGVuZGFyRXZlbnRQcmV2aWV3Vmlld01vZGVsIiwiZXY6IE1vdXNlRXZlbnQiLCJyZWNlaXZlcjogSFRNTEVsZW1lbnQiLCJvbkNsb3NlPzogKCkgPT4gdW5rbm93biIsInRpdGxlOiBzdHJpbmciLCJzZWxlY3RlZENhbGVuZGFyOiBDYWxlbmRhckluZm8gfCBudWxsIiwiZ3JvdXBDb2xvcnM6IE1hcDxJZCwgc3RyaW5nPiJdLCJzb3VyY2VzIjpbIi4uL3NyYy9jYWxlbmRhci1hcHAvY2FsZW5kYXIvZ3VpL2V2ZW50ZWRpdG9yLW1vZGVsL0NhbGVuZGFyRXZlbnRXaG9Nb2RlbC50cyIsIi4uL3NyYy9jYWxlbmRhci1hcHAvY2FsZW5kYXIvZ3VpL2V2ZW50ZWRpdG9yLW1vZGVsL0NhbGVuZGFyRXZlbnRBbGFybU1vZGVsLnRzIiwiLi4vc3JjL2NvbW1vbi9taXNjL1Nhbml0aXplZFRleHRWaWV3TW9kZWwudHMiLCIuLi9zcmMvY2FsZW5kYXItYXBwL2NhbGVuZGFyL2d1aS9ldmVudGVkaXRvci1tb2RlbC9DYWxlbmRhck5vdGlmaWNhdGlvbk1vZGVsLnRzIiwiLi4vc3JjL2NhbGVuZGFyLWFwcC9jYWxlbmRhci9ndWkvZXZlbnRlZGl0b3ItbW9kZWwvQ2FsZW5kYXJFdmVudE1vZGVsU3RyYXRlZ3kudHMiLCIuLi9zcmMvY29tbW9uL21pc2MvU2ltcGxlVGV4dFZpZXdNb2RlbC50cyIsIi4uL3NyYy9jYWxlbmRhci1hcHAvY2FsZW5kYXIvZ3VpL2V2ZW50ZWRpdG9yLW1vZGVsL0NhbGVuZGFyRXZlbnRNb2RlbC50cyIsIi4uL3NyYy9jYWxlbmRhci1hcHAvY2FsZW5kYXIvZ3VpL0NhbGVuZGFyR3VpVXRpbHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcblx0Q2FsZW5kYXJFdmVudCxcblx0Q2FsZW5kYXJFdmVudEF0dGVuZGVlLFxuXHRDb250YWN0LFxuXHRjcmVhdGVDYWxlbmRhckV2ZW50QXR0ZW5kZWUsXG5cdGNyZWF0ZUVuY3J5cHRlZE1haWxBZGRyZXNzLFxuXHRFbmNyeXB0ZWRNYWlsQWRkcmVzcyxcblx0R3JvdXBTZXR0aW5ncyxcblx0TWFpbCxcbn0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9hcGkvZW50aXRpZXMvdHV0YW5vdGEvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgUGFydGlhbFJlY2lwaWVudCwgUmVjaXBpZW50LCBSZWNpcGllbnRUeXBlIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL3JlY2lwaWVudHMvUmVjaXBpZW50LmpzXCJcbmltcG9ydCB7IGhhdmVTYW1lSWQsIFN0cmlwcGVkIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL3V0aWxzL0VudGl0eVV0aWxzLmpzXCJcbmltcG9ydCB7IGNsZWFuTWFpbEFkZHJlc3MsIGZpbmRSZWNpcGllbnRXaXRoQWRkcmVzcyB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi91dGlscy9Db21tb25DYWxlbmRhclV0aWxzLmpzXCJcbmltcG9ydCB7IGFzc2VydE5vdE51bGwsIGNsb25lLCBkZWZlciwgRGVmZXJyZWRPYmplY3QsIGZpbmRBbGwsIGxhenksIG5vT3AsIHRyaXNlY3RpbmdEaWZmIH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5pbXBvcnQgeyBDYWxlbmRhckF0dGVuZGVlU3RhdHVzLCBDb252ZXJzYXRpb25UeXBlLCBTaGFyZUNhcGFiaWxpdHkgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vVHV0YW5vdGFDb25zdGFudHMuanNcIlxuaW1wb3J0IHsgUmVjaXBpZW50c01vZGVsLCBSZXNvbHZlTW9kZSB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vYXBpL21haW4vUmVjaXBpZW50c01vZGVsLmpzXCJcbmltcG9ydCB7IEd1ZXN0IH0gZnJvbSBcIi4uLy4uL3ZpZXcvQ2FsZW5kYXJJbnZpdGVzLmpzXCJcbmltcG9ydCB7IGlzU2VjdXJlUGFzc3dvcmQgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL21pc2MvcGFzc3dvcmRzL1Bhc3N3b3JkVXRpbHMuanNcIlxuaW1wb3J0IHsgU2VuZE1haWxNb2RlbCB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vbWFpbEZ1bmN0aW9uYWxpdHkvU2VuZE1haWxNb2RlbC5qc1wiXG5pbXBvcnQgeyBDYWxlbmRhckluZm8gfSBmcm9tIFwiLi4vLi4vbW9kZWwvQ2FsZW5kYXJNb2RlbC5qc1wiXG5pbXBvcnQgeyBoYXNDYXBhYmlsaXR5T25Hcm91cCB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vc2hhcmluZy9Hcm91cFV0aWxzLmpzXCJcbmltcG9ydCB7IFVzZXJDb250cm9sbGVyIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9hcGkvbWFpbi9Vc2VyQ29udHJvbGxlci5qc1wiXG5pbXBvcnQgeyBVc2VyRXJyb3IgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL2FwaS9tYWluL1VzZXJFcnJvci5qc1wiXG5pbXBvcnQgeyBDYWxlbmRhck9wZXJhdGlvbiwgRXZlbnRUeXBlIH0gZnJvbSBcIi4vQ2FsZW5kYXJFdmVudE1vZGVsLmpzXCJcbmltcG9ydCB7IFByb2dyYW1taW5nRXJyb3IgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vZXJyb3IvUHJvZ3JhbW1pbmdFcnJvci5qc1wiXG5pbXBvcnQgeyBDYWxlbmRhck5vdGlmaWNhdGlvblNlbmRNb2RlbHMgfSBmcm9tIFwiLi9DYWxlbmRhck5vdGlmaWNhdGlvbk1vZGVsLmpzXCJcbmltcG9ydCB7IGdldENvbnRhY3REaXNwbGF5TmFtZSB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vY29udGFjdHNGdW5jdGlvbmFsaXR5L0NvbnRhY3RVdGlscy5qc1wiXG5pbXBvcnQgeyBSZWNpcGllbnRGaWVsZCB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vbWFpbEZ1bmN0aW9uYWxpdHkvU2hhcmVkTWFpbFV0aWxzLmpzXCJcbmltcG9ydCB7IGhhc1NvdXJjZVVybCB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vY2FsZW5kYXIvZGF0ZS9DYWxlbmRhclV0aWxzXCJcbmltcG9ydCB7IGxhbmcgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL21pc2MvTGFuZ3VhZ2VWaWV3TW9kZWwuanNcIlxuXG4vKiogdGhlcmUgaXMgbm8gcG9pbnQgaW4gcmV0dXJuaW5nIHJlY2lwaWVudHMsIHRoZSBTZW5kTWFpbE1vZGVsIHdpbGwgcmUtcmVzb2x2ZSB0aGVtIGFueXdheS4gKi9cbnR5cGUgQXR0ZW5kYW5jZU1vZGVsUmVzdWx0ID0ge1xuXHRhdHRlbmRlZXM6IENhbGVuZGFyRXZlbnRbXCJhdHRlbmRlZXNcIl1cblx0b3JnYW5pemVyOiBDYWxlbmRhckV2ZW50W1wib3JnYW5pemVyXCJdXG5cdGlzQ29uZmlkZW50aWFsOiBib29sZWFuXG5cdC8qKiB3aGljaCBjYWxlbmRhciBzaG91bGQgdGhlIHJlc3VsdCBiZSBhc3NpZ25lZCB0byAqL1xuXHRjYWxlbmRhcjogQ2FsZW5kYXJJbmZvXG59ICYgQ2FsZW5kYXJOb3RpZmljYXRpb25TZW5kTW9kZWxzXG5cbi8qKiBtb2RlbCB0byBkZWNvdXBsZSBhdHRlbmRlZSBsaXN0IGVkaXQgb3BlcmF0aW9ucyBmcm9tIG90aGVyIGNoYW5nZXMgdG8gYSBjYWxlbmRhciBldmVudC5cbiAqIHRyYWNrcyBleHRlcm5hbCBwYXNzd29yZHMsIGF0dGVuZGFuY2Ugc3RhdHVzLCBsaXN0IG9mIGF0dGVuZGVlcywgcmVjaXBpZW50cyB0byBpbnZpdGUsXG4gKiB1cGRhdGUsIGNhbmNlbCBhbmQgdGhlIGNhbGVuZGFyIHRoZSBldmVudCBpcyBpbi5cbiAqL1xuZXhwb3J0IGNsYXNzIENhbGVuZGFyRXZlbnRXaG9Nb2RlbCB7XG5cdC8qKiB3ZSBuZWVkIHRvIHJlc29sdmUgcmVjaXBpZW50cyB0byBrbm93IGlmIHdlIG5lZWQgdG8gc2hvdyBhbiBleHRlcm5hbCBwYXNzd29yZCBmaWVsZC4gKi9cblx0cHJpdmF0ZSByZWFkb25seSByZXNvbHZlZFJlY2lwaWVudHM6IE1hcDxzdHJpbmcsIFJlY2lwaWVudD4gPSBuZXcgTWFwKClcblx0cHJpdmF0ZSBwZW5kaW5nUmVjaXBpZW50czogbnVtYmVyID0gMFxuXHRwcml2YXRlIF9yZWNpcGllbnRzU2V0dGxlZDogRGVmZXJyZWRPYmplY3Q8dm9pZD4gPSBkZWZlcigpXG5cdC8qKiBpdCdzIHBvc3NpYmxlIHRoYXQgdGhlIGNvbnN1bWVyIGNhcmVzIGFib3V0IGFsbCB0aGUgcmVjaXBpZW50IGluZm9ybWF0aW9uIGJlaW5nIHJlc29sdmVkLCBidXQgdGhhdCdzIG9ubHkgcG9zc2libGUgaW4gYW4gYXN5bmMgd2F5LiAqL1xuXHRnZXQgcmVjaXBpZW50c1NldHRsZWQoKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0cmV0dXJuIHRoaXMuX3JlY2lwaWVudHNTZXR0bGVkLnByb21pc2Vcblx0fVxuXG5cdC8qKiBleHRlcm5hbCBwYXNzd29yZCBmb3IgYW4gZXh0ZXJuYWwgYXR0ZW5kZWUgd2l0aCBhbiBhZGRyZXNzICovXG5cdHByaXZhdGUgcmVhZG9ubHkgZXh0ZXJuYWxQYXNzd29yZHM6IE1hcDxzdHJpbmcsIHN0cmluZz4gPSBuZXcgTWFwKClcblxuXHQvKiogdG8ga25vdyB3aG8gdG8gdXBkYXRlLCB3ZSBuZWVkIHRvIGtub3cgd2hvIHdhcyBhbHJlYWR5IG9uIHRoZSBndWVzdCBsaXN0LlxuXHQgKiB3ZSBrZWVwIHRoZSBhdHRlbmRlZXMgaW4gbWFwcyBmb3IgZGVkdXBsaWNhdGlvbiwga2V5ZWQgYnkgdGhlaXIgYWRkcmVzcy5cblx0ICogKi9cblx0cHJpdmF0ZSBpbml0aWFsQXR0ZW5kZWVzOiBNYXA8c3RyaW5nLCBDYWxlbmRhckV2ZW50QXR0ZW5kZWU+ID0gbmV3IE1hcCgpXG5cdHByaXZhdGUgaW5pdGlhbE93bkF0dGVuZGVlU3RhdHVzOiBDYWxlbmRhckF0dGVuZGVlU3RhdHVzIHwgbnVsbCA9IG51bGxcblx0LyoqIHdlIG9ubHkgc2hvdyB0aGUgc2VuZCB1cGRhdGUgY2hlY2tib3ggaWYgdGhlcmUgYXJlIGF0dGVuZGVlcyB0aGF0IHJlcXVpcmUgdXBkYXRlcyBmcm9tIHVzLiAqL1xuXHRyZWFkb25seSBpbml0aWFsbHlIYWRPdGhlckF0dGVuZGVlczogYm9vbGVhblxuXHQvKiogdGhlIGN1cnJlbnQgbGlzdCBvZiBhdHRlbmRlZXMuICovXG5cdHByaXZhdGUgX2F0dGVuZGVlczogTWFwPHN0cmluZywgQ2FsZW5kYXJFdmVudEF0dGVuZGVlPiA9IG5ldyBNYXAoKVxuXHQvKiogb3JnYW5pemVyIE1VU1QgYmUgc2V0IGlmIF9vd25BdHRlbmRlZSBpcyAtIHdlJ3JlIGVpdGhlciBib3RoLCB3ZSdyZSBpbnZpdGVkIGFuZCBzb21lb25lIGVsc2UgaXMgb3JnYW5pemVyIG9yIHRoZXJlIGFyZSBubyBndWVzdHMgYXQgYWxsLiAqL1xuXHRwcml2YXRlIF9vcmdhbml6ZXI6IENhbGVuZGFyRXZlbnRBdHRlbmRlZSB8IG51bGwgPSBudWxsXG5cdC8qKiB0aGUgYXR0ZW5kZWUgdGhhdCBoYXMgb25lIG9mIG91ciBtYWlsIGFkZHJlc3Nlcy4gTVVTVCBOT1QgYmUgaW4gX2F0dGVuZGVlcyAqL1xuXHRwcml2YXRlIF9vd25BdHRlbmRlZTogQ2FsZW5kYXJFdmVudEF0dGVuZGVlIHwgbnVsbCA9IG51bGxcblxuXHRwdWJsaWMgaXNDb25maWRlbnRpYWw6IGJvb2xlYW5cblx0LyoqXG5cdCAqIHdoZXRoZXIgdGhpcyB1c2VyIHdpbGwgc2VuZCB1cGRhdGVzIGZvciB0aGlzIGV2ZW50LlxuXHQgKiAqIHRoaXMgbmVlZHMgdG8gYmUgb3VyIGV2ZW50LlxuXHQgKiAqIHdlIG5lZWQgYSBwYWlkIGFjY291bnRcblx0ICogKiB0aGVyZSBuZWVkIHRvIGJlIGNoYW5nZXMgdGhhdCByZXF1aXJlIHVwZGF0aW5nIHRoZSBhdHRlbmRlZXMgKGVnIGFsYXJtcyBkbyBub3QpXG5cdCAqICogdGhlcmUgYWxzbyBuZWVkIHRvIGJlIGF0dGVuZGVlcyB0aGF0IHJlcXVpcmUgdXBkYXRlcy9pbnZpdGVzL2NhbmNlbGxhdGlvbnMvcmVzcG9uc2Vcblx0ICovXG5cdHNob3VsZFNlbmRVcGRhdGVzOiBib29sZWFuID0gZmFsc2VcblxuXHQvKipcblx0ICpcblx0ICogQHBhcmFtIGluaXRpYWxWYWx1ZXNcblx0ICogQHBhcmFtIGV2ZW50VHlwZVxuXHQgKiBAcGFyYW0gb3BlcmF0aW9uIHRoZSBvcGVyYXRpb24gdGhlIHVzZXIgaXMgY3VycmVudGx5IGF0dGVtcHRpbmcuIHdlIGNvdWxkIHVzZSByZWN1cnJlbmNlSWQgb24gaW5pdGlhbHZhbHVlcyBmb3IgdGhpcyBpbmZvcm1hdGlvbiwgYnV0IHRoaXMgaXMgc2FmZXIuXG5cdCAqIEBwYXJhbSBjYWxlbmRhcnNcblx0ICogQHBhcmFtIF9zZWxlY3RlZENhbGVuZGFyXG5cdCAqIEBwYXJhbSB1c2VyQ29udHJvbGxlclxuXHQgKiBAcGFyYW0gaXNOZXcgd2hldGhlciB0aGUgZXZlbnQgaXMgbmV3IChuZXZlciBiZWVuIHNhdmVkKVxuXHQgKiBAcGFyYW0gb3duTWFpbEFkZHJlc3NlcyBhbiBhcnJheSBvZiB0aGUgbWFpbCBhZGRyZXNzZXMgdGhpcyB1c2VyIGNvdWxkIGJlIG1lbnRpb25lZCBhcyBhcyBhbiBhdHRlbmRlZSBvciBvcmdhbml6ZXIuXG5cdCAqIEBwYXJhbSByZWNpcGllbnRzTW9kZWxcblx0ICogQHBhcmFtIHJlc3BvbnNlVG9cblx0ICogQHBhcmFtIHBhc3N3b3JkU3RyZW5ndGhNb2RlbFxuXHQgKiBAcGFyYW0gc2VuZE1haWxNb2RlbEZhY3Rvcnlcblx0ICogQHBhcmFtIHVpVXBkYXRlQ2FsbGJhY2tcblx0ICovXG5cdGNvbnN0cnVjdG9yKFxuXHRcdGluaXRpYWxWYWx1ZXM6IFBhcnRpYWw8U3RyaXBwZWQ8Q2FsZW5kYXJFdmVudD4+LFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgZXZlbnRUeXBlOiBFdmVudFR5cGUsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBvcGVyYXRpb246IENhbGVuZGFyT3BlcmF0aW9uLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgY2FsZW5kYXJzOiBSZWFkb25seU1hcDxJZCwgQ2FsZW5kYXJJbmZvPixcblx0XHQvKiogdGhpcyBzaG91bGQgb25seSBiZSByZWxldmFudCB0byBzYXZpbmcgc28gY291bGQgYmUgcHV0IGluIHRoZSBhcHBseSBzdHJhdGVneSwgYnV0IGF0IHRoZSBtb21lbnQgd2UgcmVzdHJpY3QgYXR0ZW5kZWVzIGRlcGVuZGluZyBvbiB0aGVcblx0XHQgKiBjYWxlbmRhciB3ZSdyZSBzYXZpbmcgdG8uXG5cdFx0ICogdGhpbmsgb2YgaXQgYXMgY29uZmlndXJpbmcgd2hvIGhhcyBhY2Nlc3MgdG8gdGhlIGV2ZW50LlxuXHRcdCAqICovXG5cdFx0cHJpdmF0ZSBfc2VsZWN0ZWRDYWxlbmRhcjogQ2FsZW5kYXJJbmZvLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgdXNlckNvbnRyb2xsZXI6IFVzZXJDb250cm9sbGVyLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgaXNOZXc6IGJvb2xlYW4sXG5cdFx0cHJpdmF0ZSByZWFkb25seSBvd25NYWlsQWRkcmVzc2VzOiBSZWFkb25seUFycmF5PEVuY3J5cHRlZE1haWxBZGRyZXNzPixcblx0XHRwcml2YXRlIHJlYWRvbmx5IHJlY2lwaWVudHNNb2RlbDogUmVjaXBpZW50c01vZGVsLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgcmVzcG9uc2VUbzogTWFpbCB8IG51bGwsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBwYXNzd29yZFN0cmVuZ3RoTW9kZWw6IChwYXNzd29yZDogc3RyaW5nLCByZWNpcGllbnRJbmZvOiBQYXJ0aWFsUmVjaXBpZW50KSA9PiBudW1iZXIsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBzZW5kTWFpbE1vZGVsRmFjdG9yeTogbGF6eTxTZW5kTWFpbE1vZGVsPixcblx0XHRwcml2YXRlIHJlYWRvbmx5IHVpVXBkYXRlQ2FsbGJhY2s6ICgpID0+IHZvaWQgPSBub09wLFxuXHQpIHtcblx0XHR0aGlzLnNldHVwQXR0ZW5kZWVzKGluaXRpYWxWYWx1ZXMpXG5cdFx0Ly8gcmVzb2x2ZSBjdXJyZW50IHJlY2lwaWVudHMgc28gdGhhdCB3ZSBrbm93IHdoYXQgZXh0ZXJuYWwgcGFzc3dvcmRzIHRvIGRpc3BsYXlcblx0XHRjb25zdCByZXNvbHZlUHJvbWlzZXMgPSBpbml0aWFsVmFsdWVzLmF0dGVuZGVlcz8ubWFwKChhKSA9PiB0aGlzLnJlc29sdmVBbmRDYWNoZUFkZHJlc3MoYS5hZGRyZXNzKSkuY29uY2F0KCkgPz8gW11cblx0XHRpZiAoaW5pdGlhbFZhbHVlcy5vcmdhbml6ZXIpIHtcblx0XHRcdHJlc29sdmVQcm9taXNlcy5wdXNoKHRoaXMucmVzb2x2ZUFuZENhY2hlQWRkcmVzcyhpbml0aWFsVmFsdWVzLm9yZ2FuaXplcikpXG5cdFx0fVxuXHRcdFByb21pc2UuYWxsKHJlc29sdmVQcm9taXNlcykudGhlbih0aGlzLnVpVXBkYXRlQ2FsbGJhY2spXG5cblx0XHR0aGlzLmluaXRpYWxseUhhZE90aGVyQXR0ZW5kZWVzID0gdGhpcy5oYXNOb3RpZnlhYmxlT3RoZXJBdHRlbmRlZXMoKVxuXHRcdHRoaXMuaXNDb25maWRlbnRpYWwgPSBpbml0aWFsVmFsdWVzLmludml0ZWRDb25maWRlbnRpYWxseSA/PyBmYWxzZVxuXHR9XG5cblx0c2V0IHNlbGVjdGVkQ2FsZW5kYXIodjogQ2FsZW5kYXJJbmZvKSB7XG5cdFx0LyoqXG5cdFx0ICogd2hlbiBjaGFuZ2luZyB0aGUgY2FsZW5kYXIgb2YgYW4gZXZlbnQsIGlmIHRoZSB1c2VyIGlzIHRoZSBvcmdhbmlzZXJcblx0XHQgKiB0aGV5IGNhbiBsaW5rIGFueSBvZiB0aGVpciBvd25lZCBjYWxlbmRhcnMocHJpdmF0ZSBvciBzaGFyZWQpIHRvIHNhaWQgZXZlbnRcblx0XHQgKiBldmVuIGlmIHRoZSBldmVudCBoYXMgZ3Vlc3RzXG5cdFx0ICoqL1xuXHRcdGlmICghdi51c2VySXNPd25lciAmJiB2LnNoYXJlZCAmJiB0aGlzLl9hdHRlbmRlZXMuc2l6ZSA+IDApIHtcblx0XHRcdHRocm93IG5ldyBQcm9ncmFtbWluZ0Vycm9yKFwidHJpZWQgdG8gc2VsZWN0IHNoYXJlZCBjYWxlbmRhciB3aGlsZSB0aGVyZSBhcmUgZ3Vlc3RzLlwiKVxuXHRcdH0gZWxzZSBpZiAoIXYudXNlcklzT3duZXIgJiYgdi5zaGFyZWQgJiYgdGhpcy5pc05ldyAmJiB0aGlzLl9vcmdhbml6ZXIgIT0gbnVsbCkge1xuXHRcdFx0Ly8gZm9yIG5ldyBldmVudHMsIGl0J3MgcG9zc2libGUgdG8gaGF2ZSBhbiBvcmdhbml6ZXIgYnV0IG5vIGF0dGVuZGVlcyBpZiB5b3Ugb25seSBhZGQgeW91cnNlbGYuXG5cdFx0XHR0aGlzLl9vcmdhbml6ZXIgPSBudWxsXG5cdFx0fVxuXHRcdHRoaXMuX3NlbGVjdGVkQ2FsZW5kYXIgPSB2XG5cdFx0dGhpcy51aVVwZGF0ZUNhbGxiYWNrKClcblx0fVxuXG5cdGdldCBzZWxlY3RlZENhbGVuZGFyKCk6IENhbGVuZGFySW5mbyB7XG5cdFx0cmV0dXJuIHRoaXMuX3NlbGVjdGVkQ2FsZW5kYXJcblx0fVxuXG5cdC8qKlxuXHQgKiB3aGV0aGVyIHRoZSBjdXJyZW50IHVzZXIgY2FuIG1vZGlmeSB0aGUgZ3Vlc3QgbGlzdCBvZiB0aGUgZXZlbnQgZGVwZW5kaW5nIG9uIGV2ZW50IHR5cGUgYW5kIHRoZSBjYWxlbmRhciBpdCdzIGluLlxuXHQgKlxuXHQgKiAqIGF0IHRoZSBtb21lbnQsIHdlIGNhbiBuZXZlciBtb2RpZnkgZ3Vlc3RzIHdoZW4gZWRpdGluZyBvbmx5IHBhcnQgb2YgYSBzZXJpZXMuXG5cdCAqICogc2VsZWN0ZWQgY2FsZW5kYXIgaXMgb3VyIG93bjpcblx0ICogICAqIGV2ZW50IGlzIGludml0ZSAod2UncmUgbm90IG9yZ2FuaXplcik6IGNhbid0IG1vZGlmeSBndWVzdCBsaXN0LCBhbnkgZWRpdCBvcGVyYXRpb24gd2lsbCBiZSBsb2NhbCBvbmx5LlxuXHQgKiAgICogZXZlbnQgaXMgb3VyIG93bjogY2FuIGRvIHdoYXQgd2Ugd2FudC5cblx0ICogKiBpZiB0aGUgc2VsZWN0ZWQgY2FsZW5kYXIgaXMgYSBzaGFyZWQgb25lOlxuXHQgKiAgICogcm86IGRvbid0IHNob3cgZWRpdG9yIGF0IGFsbFxuXHQgKiAgICogcncsIG5ldyBldmVudDogZG9uJ3Qgc2hvdyBhdHRlbmRlZSBsaXN0IGVkaXRvciAtIHdlIGNhbid0IGludml0ZSBpbiBzaGFyZWQgY2FsZW5kYXJzLlxuXHQgKiAgICogcncsIGV4aXN0aW5nIGV2ZW50IHdpdGhvdXQgYXR0ZW5kZWVzOiBub3Qgb3VyIG93biBjYWxlbmRhciwgY2FuJ3QgaW52aXRlLCBkb24ndCBzaG93IGF0dGVuZGVlIGxpc3QuXG5cdCAqICAgKiBydywgZXhpc3RpbmcgZXZlbnQgd2l0aCBhdHRlbmRlZXM6ICB0aGlzIGlzIHRoZSBjYXNlIHdoZXJlIHdlIGNhbiBzZWUgYXR0ZW5kZWVzLCBidXQgY2FuJ3QgZWRpdCB0aGVtLlxuXHQgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnV0IHdlIGFsc28gY2FuJ3QgZWRpdCB0aGUgZXZlbnQgc2luY2UgdGhlcmUgYXJlIGF0dGVuZGVlcyBhbmQgd2UncmVcblx0ICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuYWJsZSB0byBzZW5kIHVwZGF0ZXMuXG5cdCAqL1xuXHRnZXQgY2FuTW9kaWZ5R3Vlc3RzKCk6IGJvb2xlYW4ge1xuXHRcdC8qKlxuXHRcdCAqIGlmIHRoZSB1c2VyIGlzIHRoZSBldmVudCdzIG9yZ2FuaXNlciBhbmQgdGhlIG93bmVyIG9mIGl0cyBsaW5rZWQgY2FsZW5kYXIsIHRoZSB1c2VyIGNhbiBtb2RpZnkgdGhlIGd1ZXN0cyBmcmVlbHlcblx0XHQgKiovXG5cdFx0Y29uc3QgdXNlcklzT3duZXIgPSB0aGlzLmV2ZW50VHlwZSA9PT0gRXZlbnRUeXBlLk9XTiAmJiB0aGlzLnNlbGVjdGVkQ2FsZW5kYXIudXNlcklzT3duZXJcblx0XHRyZXR1cm4gdXNlcklzT3duZXIgfHwgISh0aGlzLnNlbGVjdGVkQ2FsZW5kYXI/LnNoYXJlZCB8fCB0aGlzLmV2ZW50VHlwZSA9PT0gRXZlbnRUeXBlLklOVklURSB8fCB0aGlzLm9wZXJhdGlvbiA9PT0gQ2FsZW5kYXJPcGVyYXRpb24uRWRpdFRoaXMpXG5cdH1cblxuXHQvKipcblx0ICogZmlsdGVyIHRoZSBjYWxlbmRhcnMgYW4gZXZlbnQgY2FuIGJlIHNhdmVkIHRvIGRlcGVuZGluZyBvbiB0aGUgZXZlbnQgdHlwZSwgYXR0ZW5kZWUgc3RhdHVzIGFuZCBlZGl0IG9wZXJhdGlvbi5cblx0ICogUHJldmVudCBtb3ZpbmcgdGhlIGV2ZW50IHRvIGFub3RoZXIgY2FsZW5kYXIgaWYgeW91IG9ubHkgaGF2ZSByZWFkIHBlcm1pc3Npb24gb3IgaWYgdGhlIGV2ZW50IGhhcyBhdHRlbmRlZXMuXG5cdCAqICovXG5cdGdldEF2YWlsYWJsZUNhbGVuZGFycygpOiBSZWFkb25seUFycmF5PENhbGVuZGFySW5mbz4ge1xuXHRcdGNvbnN0IHsgZ3JvdXBTZXR0aW5ncyB9ID0gdGhpcy51c2VyQ29udHJvbGxlci51c2VyU2V0dGluZ3NHcm91cFJvb3Rcblx0XHRjb25zdCBjYWxlbmRhckFycmF5ID0gQXJyYXkuZnJvbSh0aGlzLmNhbGVuZGFycy52YWx1ZXMoKSkuZmlsdGVyKChjYWwpID0+ICF0aGlzLmlzRXh0ZXJuYWxDYWxlbmRhcihncm91cFNldHRpbmdzLCBjYWwuZ3JvdXAuX2lkKSlcblxuXHRcdGlmICh0aGlzLmV2ZW50VHlwZSA9PT0gRXZlbnRUeXBlLkxPQ0tFRCB8fCB0aGlzLm9wZXJhdGlvbiA9PT0gQ2FsZW5kYXJPcGVyYXRpb24uRWRpdFRoaXMpIHtcblx0XHRcdHJldHVybiBbdGhpcy5zZWxlY3RlZENhbGVuZGFyXVxuXHRcdH0gZWxzZSBpZiAodGhpcy5pc05ldyAmJiB0aGlzLl9hdHRlbmRlZXMuc2l6ZSA+IDApIHtcblx0XHRcdC8vIGlmIHdlIGFkZGVkIGd1ZXN0cywgd2UgY2Fubm90IHNlbGVjdCBhIHNoYXJlZCBjYWxlbmRhciB0byBjcmVhdGUgdGhlIGV2ZW50LlxuXHRcdFx0LyoqXG5cdFx0XHQgKiB3aGVuIGNoYW5naW5nIHRoZSBjYWxlbmRhciBvZiBhbiBldmVudCwgaWYgdGhlIHVzZXIgaXMgdGhlIG9yZ2FuaXNlclxuXHRcdFx0ICogdGhleSBjYW4gbGluayBhbnkgb2YgdGhlaXIgb3duZWQgY2FsZW5kYXJzKHByaXZhdGUgb3Igc2hhcmVkKSB0byBzYWlkIGV2ZW50XG5cdFx0XHQgKiBldmVuIGlmIHRoZSBldmVudCBoYXMgZ3Vlc3RzXG5cdFx0XHQgKiovXG5cdFx0XHRyZXR1cm4gY2FsZW5kYXJBcnJheS5maWx0ZXIoKGNhbGVuZGFySW5mbykgPT4gY2FsZW5kYXJJbmZvLnVzZXJJc093bmVyIHx8ICFjYWxlbmRhckluZm8uc2hhcmVkKVxuXHRcdH0gZWxzZSBpZiAodGhpcy5fYXR0ZW5kZWVzLnNpemUgPiAwICYmIHRoaXMuZXZlbnRUeXBlID09PSBFdmVudFR5cGUuT1dOKSB7XG5cdFx0XHRyZXR1cm4gY2FsZW5kYXJBcnJheS5maWx0ZXIoKGNhbGVuZGFySW5mbykgPT4gY2FsZW5kYXJJbmZvLnVzZXJJc093bmVyKVxuXHRcdH0gZWxzZSBpZiAodGhpcy5fYXR0ZW5kZWVzLnNpemUgPiAwIHx8IHRoaXMuZXZlbnRUeXBlID09PSBFdmVudFR5cGUuSU5WSVRFKSB7XG5cdFx0XHQvLyBXZSBkb24ndCBhbGxvdyBpbnZpdGluZyBpbiBhIHNoYXJlZCBjYWxlbmRhci5cblx0XHRcdC8vIElmIHdlIGhhdmUgYXR0ZW5kZWVzLCB3ZSBjYW5ub3Qgc2VsZWN0IGEgc2hhcmVkIGNhbGVuZGFyLlxuXHRcdFx0Ly8gV2UgYWxzbyBkb24ndCBhbGxvdyBhY2NlcHRpbmcgaW52aXRlcyBpbnRvIHNoYXJlZCBjYWxlbmRhcnMuXG5cdFx0XHRyZXR1cm4gY2FsZW5kYXJBcnJheS5maWx0ZXIoKGNhbGVuZGFySW5mbykgPT4gIWNhbGVuZGFySW5mby5zaGFyZWQgfHwgaGF2ZVNhbWVJZChjYWxlbmRhckluZm8uZ3JvdXAsIHRoaXMuc2VsZWN0ZWRDYWxlbmRhci5ncm91cCkpXG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBjYWxlbmRhckFycmF5LmZpbHRlcigoY2FsZW5kYXJJbmZvKSA9PiBoYXNDYXBhYmlsaXR5T25Hcm91cCh0aGlzLnVzZXJDb250cm9sbGVyLnVzZXIsIGNhbGVuZGFySW5mby5ncm91cCwgU2hhcmVDYXBhYmlsaXR5LldyaXRlKSlcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIGlzRXh0ZXJuYWxDYWxlbmRhcihncm91cFNldHRpbmdzOiBHcm91cFNldHRpbmdzW10sIGdyb3VwSWQ6IElkKSB7XG5cdFx0Y29uc3QgZXhpc3RpbmdHcm91cFNldHRpbmdzID0gZ3JvdXBTZXR0aW5ncy5maW5kKChnYykgPT4gZ2MuZ3JvdXAgPT09IGdyb3VwSWQpXG5cdFx0cmV0dXJuIGhhc1NvdXJjZVVybChleGlzdGluZ0dyb3VwU2V0dGluZ3MpXG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIHJlc29sdmVBbmRDYWNoZUFkZHJlc3MoYTogUGFydGlhbFJlY2lwaWVudCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGlmICh0aGlzLnJlc29sdmVkUmVjaXBpZW50cy5oYXMoYS5hZGRyZXNzKSkgcmV0dXJuXG5cdFx0dGhpcy5wZW5kaW5nUmVjaXBpZW50cyA9IHRoaXMucGVuZGluZ1JlY2lwaWVudHMgKyAxXG5cdFx0Y29uc3QgcmVjaXBpZW50ID0gYXdhaXQgdGhpcy5yZWNpcGllbnRzTW9kZWwucmVzb2x2ZShhLCBSZXNvbHZlTW9kZS5FYWdlcikucmVzb2x2ZWQoKVxuXHRcdHRoaXMuY2FjaGVSZWNpcGllbnQocmVjaXBpZW50KVxuXHRcdHRoaXMucGVuZGluZ1JlY2lwaWVudHMgPSB0aGlzLnBlbmRpbmdSZWNpcGllbnRzIC0gMVxuXHRcdGlmICh0aGlzLnBlbmRpbmdSZWNpcGllbnRzID09PSAwKSB7XG5cdFx0XHR0aGlzLl9yZWNpcGllbnRzU2V0dGxlZC5yZXNvbHZlKClcblx0XHRcdHRoaXMuX3JlY2lwaWVudHNTZXR0bGVkID0gZGVmZXIoKVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgY2FjaGVSZWNpcGllbnQocmVjaXBpZW50OiBSZWNpcGllbnQpOiB2b2lkIHtcblx0XHR0aGlzLnJlc29sdmVkUmVjaXBpZW50cy5zZXQocmVjaXBpZW50LmFkZHJlc3MsIHJlY2lwaWVudClcblx0XHRpZiAocmVjaXBpZW50LnR5cGUgIT09IFJlY2lwaWVudFR5cGUuRVhURVJOQUwpIHJldHVyblxuXHRcdHRoaXMuZXh0ZXJuYWxQYXNzd29yZHMuc2V0KHJlY2lwaWVudC5hZGRyZXNzLCByZWNpcGllbnQuY29udGFjdD8ucHJlc2hhcmVkUGFzc3dvcmQgPz8gXCJcIilcblx0XHRpZiAocmVjaXBpZW50LmNvbnRhY3QgIT0gbnVsbCAmJiB0aGlzLl9hdHRlbmRlZXMuaGFzKHJlY2lwaWVudC5hZGRyZXNzKSkge1xuXHRcdFx0Y29uc3QgYXR0ZW5kZWUgPSB0aGlzLl9hdHRlbmRlZXMuZ2V0KHJlY2lwaWVudC5hZGRyZXNzKSFcblx0XHRcdGF0dGVuZGVlLmFkZHJlc3MubmFtZSA9IGdldENvbnRhY3REaXNwbGF5TmFtZShyZWNpcGllbnQuY29udGFjdClcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogaW50ZXJuYWxseSwgd2Ugd2FudCB0byBrZWVwIG91cnNlbHZlcyBhbmQgdGhlIG9yZ2FuaXplciBzZXBhcmF0ZSBmcm9tIHRoZSBvdGhlciBhdHRlbmRlZXNcblx0ICovXG5cdHByaXZhdGUgc2V0dXBBdHRlbmRlZXMoaW5pdGlhbFZhbHVlczogUGFydGlhbDxTdHJpcHBlZDxDYWxlbmRhckV2ZW50Pj4pIHtcblx0XHRjb25zdCBvd25BZGRyZXNzZXMgPSB0aGlzLm93bk1haWxBZGRyZXNzZXMubWFwKChhKSA9PiBjbGVhbk1haWxBZGRyZXNzKGEuYWRkcmVzcykpXG5cblx0XHQvLyBjb252ZXJ0IHRoZSBsaXN0IG9mIGF0dGVuZGVlcyBpbnRvIGEgbWFwIGZvciBlYXNpZXIgdXNlLlxuXHRcdGZvciAoY29uc3QgYSBvZiBpbml0aWFsVmFsdWVzLmF0dGVuZGVlcyA/PyBbXSkge1xuXHRcdFx0Y29uc3QgYXR0ZW5kZWUgPSBjcmVhdGVDYWxlbmRhckV2ZW50QXR0ZW5kZWUoe1xuXHRcdFx0XHRzdGF0dXM6IGEuc3RhdHVzLFxuXHRcdFx0XHRhZGRyZXNzOiBjcmVhdGVFbmNyeXB0ZWRNYWlsQWRkcmVzcyh7XG5cdFx0XHRcdFx0bmFtZTogYS5hZGRyZXNzLm5hbWUsXG5cdFx0XHRcdFx0YWRkcmVzczogY2xlYW5NYWlsQWRkcmVzcyhhLmFkZHJlc3MuYWRkcmVzcyksXG5cdFx0XHRcdH0pLFxuXHRcdFx0fSlcblx0XHRcdC8vIHdlIHdpbGwgcmVtb3ZlIG93biBhdHRlbmRlZXMgKyBvcmdhbml6ZXIgbGF0ZXIuXG5cdFx0XHR0aGlzLmluaXRpYWxBdHRlbmRlZXMuc2V0KGF0dGVuZGVlLmFkZHJlc3MuYWRkcmVzcywgYXR0ZW5kZWUpXG5cdFx0fVxuXG5cdFx0Ly8gZ2V0IHRoZSBvcmdhbml6ZXIgb3V0IG9mIHRoZSBhdHRlbmRlZXMgYW5kIGludG8gYSBzZXBhcmF0ZSBmaWVsZFxuXHRcdGNvbnN0IGluaXRpYWxPcmdhbml6ZXJBZGRyZXNzID1cblx0XHRcdGluaXRpYWxWYWx1ZXMub3JnYW5pemVyID09IG51bGxcblx0XHRcdFx0PyBudWxsXG5cdFx0XHRcdDogY3JlYXRlRW5jcnlwdGVkTWFpbEFkZHJlc3Moe1xuXHRcdFx0XHRcdFx0YWRkcmVzczogY2xlYW5NYWlsQWRkcmVzcyhpbml0aWFsVmFsdWVzLm9yZ2FuaXplci5hZGRyZXNzKSxcblx0XHRcdFx0XHRcdG5hbWU6IGluaXRpYWxWYWx1ZXMub3JnYW5pemVyLm5hbWUsXG5cdFx0XHRcdCAgfSlcblxuXHRcdGlmIChpbml0aWFsT3JnYW5pemVyQWRkcmVzcyAhPSBudWxsKSB7XG5cdFx0XHQvLyBjaGVjayBpZiB0aGUgb3JnYW5pemVyIGlzIGFsc28gaW4gdGhlIGF0dGVuZGVlcyBhcnJheSBhbmQgcmVtb3ZlIHRoZW0gaWYgc29cblx0XHRcdGNvbnN0IG9yZ2FuaXplckF0dGVuZGVlID0gdGhpcy5pbml0aWFsQXR0ZW5kZWVzLmdldChpbml0aWFsT3JnYW5pemVyQWRkcmVzcy5hZGRyZXNzKVxuXHRcdFx0dGhpcy5fb3JnYW5pemVyID1cblx0XHRcdFx0b3JnYW5pemVyQXR0ZW5kZWUgPz9cblx0XHRcdFx0Y3JlYXRlQ2FsZW5kYXJFdmVudEF0dGVuZGVlKHtcblx0XHRcdFx0XHRhZGRyZXNzOiBpbml0aWFsT3JnYW5pemVyQWRkcmVzcyxcblx0XHRcdFx0XHQvLyB0aGUgb3JnYW5pemVyIGFkZGVkIHRoZW1zZWx2ZXMsIGJ1dCBkaWQgbm90IHNwZWNpZnkgaWYgdGhleSdyZSBwYXJ0aWNpcGF0aW5nXG5cdFx0XHRcdFx0c3RhdHVzOiBDYWxlbmRhckF0dGVuZGVlU3RhdHVzLk5FRURTX0FDVElPTixcblx0XHRcdFx0fSlcblx0XHRcdHRoaXMuaW5pdGlhbEF0dGVuZGVlcy5kZWxldGUodGhpcy5fb3JnYW5pemVyLmFkZHJlc3MuYWRkcmVzcylcblx0XHR9XG5cblx0XHQvLyB3ZSBkb24ndCB3YW50IG91cnNlbHZlcyBpbiB0aGUgYXR0ZW5kZWUgbGlzdCwgc2luY2Ugd2UncmUgdXNpbmcgaXQgdG8gdHJhY2sgdXBkYXRlcyB3ZSBuZWVkIHRvIHNlbmQuXG5cdFx0Y29uc3Qgb3duQXR0ZW5kZWVBZGRyZXNzZXMgPSBmaW5kQWxsKEFycmF5LmZyb20odGhpcy5pbml0aWFsQXR0ZW5kZWVzLmtleXMoKSksIChhZGRyZXNzKSA9PiBvd25BZGRyZXNzZXMuaW5jbHVkZXMoYWRkcmVzcykpXG5cdFx0dGhpcy5fb3duQXR0ZW5kZWUgPSB0aGlzLmluaXRpYWxBdHRlbmRlZXMuZ2V0KG93bkF0dGVuZGVlQWRkcmVzc2VzWzBdKSA/PyBudWxsXG5cdFx0dGhpcy5pbml0aWFsT3duQXR0ZW5kZWVTdGF0dXMgPSAodGhpcy5fb3duQXR0ZW5kZWU/LnN0YXR1cyBhcyBDYWxlbmRhckF0dGVuZGVlU3RhdHVzKSA/PyBudWxsXG5cdFx0Zm9yIChjb25zdCBtYXRjaCBvZiBvd25BdHRlbmRlZUFkZHJlc3Nlcykge1xuXHRcdFx0dGhpcy5pbml0aWFsQXR0ZW5kZWVzLmRlbGV0ZShtYXRjaClcblx0XHR9XG5cblx0XHQvLyBzZXQgdXAgdGhlIGF0dGVuZGVlcyBtYXAgdGhhdCB0cmFja3MgdGhlIGFjdHVhbCBjaGFuZ2VzXG5cdFx0Zm9yIChjb25zdCBbaW5pdGlhbEF0dGVuZGVlQWRkcmVzcywgaW5pdGlhbEF0dGVuZGVlXSBvZiB0aGlzLmluaXRpYWxBdHRlbmRlZXMuZW50cmllcygpKSB7XG5cdFx0XHR0aGlzLl9hdHRlbmRlZXMuc2V0KGluaXRpYWxBdHRlbmRlZUFkZHJlc3MsIGNsb25lKGluaXRpYWxBdHRlbmRlZSkpXG5cdFx0fVxuXG5cdFx0Ly8gd2Ugbm93IGhhdmUgY2xlYW5lZCB2ZXJzaW9ucyBvZiBvcmdhbml6ZXIsIG93bkF0dGVuZGVlIGFuZCBvdGhlciBhdHRlbmRlZXMgaW4gc2VwYXJhdGUgZmllbGRzLlxuXHRcdC8vIG5vdyB0aGUgc2FuaXR5IGNoZWNrcy5cblxuXHRcdGlmICh0aGlzLl9vcmdhbml6ZXIgIT0gbnVsbCAmJiB0aGlzLl9hdHRlbmRlZXMuc2l6ZSA9PT0gMCAmJiB0aGlzLl9vd25BdHRlbmRlZSA9PSBudWxsKSB7XG5cdFx0XHQvLyBpZiB0aGVyZSBhcmUgbm8gYXR0ZW5kZWVzIGJlc2lkZXMgdGhlIG9yZ2FuaXplciwgdGhlIG9yZ2FuaXplciBtdXN0IG5vdCBiZSBzcGVjaWZpZWQuXG5cdFx0XHR0aGlzLl9vcmdhbml6ZXIgPSBudWxsXG5cdFx0fVxuXG5cdFx0aWYgKFxuXHRcdFx0dGhpcy5ldmVudFR5cGUgPT09IEV2ZW50VHlwZS5PV04gJiZcblx0XHRcdHRoaXMuX29yZ2FuaXplciAhPSBudWxsICYmXG5cdFx0XHQhb3duQWRkcmVzc2VzLmluY2x1ZGVzKHRoaXMuX29yZ2FuaXplci5hZGRyZXNzLmFkZHJlc3MpICYmXG5cdFx0XHRBcnJheS5mcm9tKHRoaXMuX2F0dGVuZGVlcy52YWx1ZXMoKSkuc29tZSgoYSkgPT4gYS5zdGF0dXMgIT09IENhbGVuZGFyQXR0ZW5kZWVTdGF0dXMuQURERUQpXG5cdFx0KSB7XG5cdFx0XHQvLyB0aGlzIGlzIHRlY2huaWNhbGx5IGFuIGludmFsaWQgc3RhdGUgbm93IHRoYXQgc2hvdWxkIG5vdCBoYXBwZW4gd2l0aCBuZXcgZXZlbnRzLlxuXHRcdFx0Ly8gd2UgcHJldmlvdXNseSBhc3NpZ25lZCB0aGUgZXZlbnQgY3JlYXRvciAod2hpY2ggbWlnaHQgbm90IGJlIHRoZSBjYWxlbmRhciBvd25lcikgdG8gdGhlIG9yZ2FuaXplciBmaWVsZCxcblx0XHRcdC8vIGV2ZW4gd2hlbiB0aGVyZSB3ZXJlIG5vIGF0dGVuZGVlcy5cblx0XHRcdGNvbnNvbGUud2FybihcImdvdCBhbiBldmVudCB3aXRoIGF0dGVuZGVlcyBhbmQgYW4gb3JnYW5pemVyIHRoYXQncyBub3QgdGhlIG93bmVyIG9mIHRoZSBjYWxlbmRhciwgcmVwbGFjaW5nIG9yZ2FuaXplci5cIilcblx0XHRcdHRoaXMuX2F0dGVuZGVlcy5zZXQodGhpcy5fb3JnYW5pemVyLmFkZHJlc3MuYWRkcmVzcywgdGhpcy5fb3JnYW5pemVyKVxuXHRcdFx0dGhpcy5fb3JnYW5pemVyID1cblx0XHRcdFx0dGhpcy5fb3duQXR0ZW5kZWUgPz9cblx0XHRcdFx0Y3JlYXRlQ2FsZW5kYXJFdmVudEF0dGVuZGVlKHtcblx0XHRcdFx0XHRhZGRyZXNzOiBjcmVhdGVFbmNyeXB0ZWRNYWlsQWRkcmVzcyh7XG5cdFx0XHRcdFx0XHRhZGRyZXNzOiBvd25BZGRyZXNzZXNbMF0sXG5cdFx0XHRcdFx0XHRuYW1lOiBcIlwiLFxuXHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdHN0YXR1czogQ2FsZW5kYXJBdHRlbmRlZVN0YXR1cy5BQ0NFUFRFRCxcblx0XHRcdFx0fSlcblx0XHR9XG5cblx0XHRpZiAoXG5cdFx0XHR0aGlzLl9vcmdhbml6ZXIgJiZcblx0XHRcdG93bkFkZHJlc3Nlcy5pbmNsdWRlcyh0aGlzLl9vcmdhbml6ZXIuYWRkcmVzcy5hZGRyZXNzKSAmJlxuXHRcdFx0dGhpcy5fb3JnYW5pemVyLmFkZHJlc3MuYWRkcmVzcyAhPT0gdGhpcy5fb3duQXR0ZW5kZWU/LmFkZHJlc3MuYWRkcmVzc1xuXHRcdCkge1xuXHRcdFx0Ly8gaWYgd2UncmUgdGhlIG9yZ2FuaXplciwgb3duQXR0ZW5kZWUgc2hvdWxkIGJlIHRoZSBzYW1lLiB3ZSBkb24ndCBtb2RpZnkgb3JnYW5pemVyIGhlcmUgYmVjYXVzZSBzb21lb25lIG1pZ2h0IGFscmVhZHkgaGF2ZSBzZW50IGludml0ZXMuXG5cdFx0XHR0aGlzLl9vd25BdHRlbmRlZSA9IHRoaXMuX29yZ2FuaXplclxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBmaWd1cmUgb3V0IGlmIHRoZXJlIGFyZSBjdXJyZW50bHkgb3RoZXIgcGVvcGxlIHRoYXQgbWlnaHQgbmVlZCB0byBiZSBub3RpZmllZCBpZiB0aGlzIGV2ZW50IGlzIG1vZGlmaWVkLlxuXHQgKiBhdHRlbmRlZXMgdGhhdCB3ZXJlIGp1c3QgYWRkZWQgYW5kIG5vdCBpbnZpdGVkIHlldCBhcmUgaWdub3JlZCBmb3IgdGhpcy5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdHByaXZhdGUgaGFzTm90aWZ5YWJsZU90aGVyQXR0ZW5kZWVzKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQvLyBpZiB0aGUgZXZlbnQgaXMgbmV3IHdlIGNhbiBkbyB3aGF0IHdlIHdhbnQgKG5vIGF0dGVuZGVlIHdhcyBub3RpZmllZCB5ZXQpXG5cdFx0XHQhdGhpcy5pc05ldyAmJlxuXHRcdFx0Ly8gaWYgdGhlIGV2ZW50IGlzIG5vdCBuZXcsIGJ1dCB0aGUgYXR0ZW5kZWUgbGlzdCBkaWQgbm90IGhhdmUgYW55IGF0dGVuZGVlcyB0aGF0IHdlcmUgYWxyZWFkeSBub3RpZmllZCxcblx0XHRcdC8vIHRoZXJlIGFyZSBubyBhdHRlbmRlZXMgdGhhdCBhcmUgbm90IGVpdGhlciB1cyBvciB0aGUgb3JnYW5pemVyXG5cdFx0XHRBcnJheS5mcm9tKHRoaXMuaW5pdGlhbEF0dGVuZGVlcy52YWx1ZXMoKSkuc29tZSgoYSkgPT4gYS5zdGF0dXMgIT09IENhbGVuZGFyQXR0ZW5kZWVTdGF0dXMuQURERUQpXG5cdFx0KVxuXHR9XG5cblx0Lypcblx0ICogcmV0dXJuIGEgbGlzdCBvZiBtYWlsIGFkZHJlc3NlcyB0aGF0IHdlIGNhbiBzZXQgYXMgYW4gb3JnYW5pemVyLlxuXHQgKi9cblx0Z2V0IHBvc3NpYmxlT3JnYW5pemVycygpOiBSZWFkb25seUFycmF5PEVuY3J5cHRlZE1haWxBZGRyZXNzPiB7XG5cdFx0aWYgKHRoaXMuZXZlbnRUeXBlICE9PSBFdmVudFR5cGUuT1dOKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fb3JnYW5pemVyID8gW3RoaXMuX29yZ2FuaXplci5hZGRyZXNzXSA6IFtdXG5cdFx0fSBlbHNlIGlmICghdGhpcy5oYXNOb3RpZnlhYmxlT3RoZXJBdHRlbmRlZXMoKSkge1xuXHRcdFx0Ly8gaWYgd2UgaGF2ZSBubyBhdHRlbmRlZXMgdGhhdCByZXF1aXJlIGFuIHVwZGF0ZSwgd2UgY2FuIHVzZSB3aGF0ZXZlciBhZGRyZXNzXG5cdFx0XHRyZXR1cm4gdGhpcy5vd25NYWlsQWRkcmVzc2VzXG5cdFx0fSBlbHNlIGlmICh0aGlzLl9vcmdhbml6ZXIgIT0gbnVsbCAmJiB0aGlzLm93bkd1ZXN0Py5hZGRyZXNzID09PSB0aGlzLl9vcmdhbml6ZXI/LmFkZHJlc3MuYWRkcmVzcykge1xuXHRcdFx0Ly8gaWYgdGhlcmUgYXJlIG90aGVyIGF0dGVuZGVlcyBhbmQgd2UgaGF2ZSBhbiBvcmdhbml6ZXIgdGhhdCdzIHVzLCB3ZSBtdXN0IHVzZSB0aGF0IG9yZ2FuaXplclxuXHRcdFx0Ly8gYmVjYXVzZSBjaGFuZ2luZyB0aGUgb3JnYW5pemVyIGFkZHJlc3MgYWZ0ZXIgdGhlIGF0dGVuZGVlcyB3ZXJlIGludml0ZWQgaXMgc3Vib3B0aW1hbC5cblx0XHRcdHJldHVybiBbdGhpcy5fb3JnYW5pemVyLmFkZHJlc3NdXG5cdFx0fSBlbHNlIGlmICh0aGlzLmV2ZW50VHlwZSA9PT0gRXZlbnRUeXBlLk9XTikge1xuXHRcdFx0cmV0dXJuIHRoaXMub3duTWFpbEFkZHJlc3Nlc1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBzb21ldGhpbmcgaXMgd3JvbmcuXG5cdFx0XHR0aHJvdyBuZXcgUHJvZ3JhbW1pbmdFcnJvcihcImNvdWxkIG5vdCBmaWd1cmUgb3V0IHdoaWNoIGFkZHJlc3NlcyBhcmUgYSB2YWxpZCBvcmdhbml6ZXIgZm9yIHRoaXMgZXZlbnQuXCIpXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIGdldCBvdXIgb3duIGd1ZXN0LCBpZiBhbnlcblx0ICovXG5cdGdldCBvd25HdWVzdCgpOiBHdWVzdCB8IG51bGwge1xuXHRcdHJldHVybiB0aGlzLl9vd25BdHRlbmRlZSAmJiB0aGlzLmdldEd1ZXN0Rm9yQXR0ZW5kZWUodGhpcy5fb3duQXR0ZW5kZWUpXG5cdH1cblxuXHQvKipcblx0ICogZ2V0IHRoZSBjdXJyZW50IG9yZ2FuaXplciBvZiB0aGUgZXZlbnRcblx0ICpcblx0ICogdGhlcmUgaXMgbm8gc2V0dGVyIC0gaWYgd2UncmUgY2hhbmdpbmcgYXR0ZW5kZWVzLCB3ZSdyZSBlbnN1cmVkIHRvIGJlIHRoZSBvcmdhbml6ZXIuXG5cdCAqL1xuXHRnZXQgb3JnYW5pemVyKCk6IEd1ZXN0IHwgbnVsbCB7XG5cdFx0cmV0dXJuIHRoaXMuX29yZ2FuaXplciAmJiB0aGlzLmdldEd1ZXN0Rm9yQXR0ZW5kZWUodGhpcy5fb3JnYW5pemVyKVxuXHR9XG5cblx0LyoqXG5cdCAqIGEgbGlzdCBvZiB0aGUgYXR0ZW5kZWVzIG9mIHRoZSBldmVudCB0aGF0IGFyZSBub3QgdGhlIG9yZ2FuaXplciBvciBvdXJzZWx2ZXMsIHdpdGggdGhlaXIgc3RhdHVzIGFuZCB0eXBlXG5cdCAqL1xuXHRnZXQgZ3Vlc3RzKCk6IFJlYWRvbmx5QXJyYXk8R3Vlc3Q+IHtcblx0XHRyZXR1cm4gQXJyYXkuZnJvbSh0aGlzLl9hdHRlbmRlZXMudmFsdWVzKCkpLm1hcCgoYSkgPT4gdGhpcy5nZXRHdWVzdEZvckF0dGVuZGVlKGEpKVxuXHR9XG5cblx0cHJpdmF0ZSBnZXRHdWVzdEZvckF0dGVuZGVlKGE6IENhbGVuZGFyRXZlbnRBdHRlbmRlZSk6IEd1ZXN0IHtcblx0XHRpZiAodGhpcy5yZXNvbHZlZFJlY2lwaWVudHMuaGFzKGEuYWRkcmVzcy5hZGRyZXNzKSkge1xuXHRcdFx0Y29uc3QgcmVjaXBpZW50OiBSZWNpcGllbnQgPSB0aGlzLnJlc29sdmVkUmVjaXBpZW50cy5nZXQoYS5hZGRyZXNzLmFkZHJlc3MpIVxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0Li4ucmVjaXBpZW50LFxuXHRcdFx0XHRzdGF0dXM6IGEuc3RhdHVzIGFzIENhbGVuZGFyQXR0ZW5kZWVTdGF0dXMsXG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIHRoaXMgaXMgYSB0ZW1wb3Jhcnkgc2l0dWF0aW9uLCBhbiBhdHRlbmRlZSB0aGF0IGlzIHNldCBpbiB0aGlzIG1vZGVsXG5cdFx0XHQvLyB3aWxsIGJlIHJlc29sdmVkIHNvbWV0aW1lIGFmdGVyIGl0IHdhcyBhZGRlZC5cblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGFkZHJlc3M6IGEuYWRkcmVzcy5hZGRyZXNzLFxuXHRcdFx0XHRuYW1lOiBhLmFkZHJlc3MubmFtZSxcblx0XHRcdFx0c3RhdHVzOiBhLnN0YXR1cyBhcyBDYWxlbmRhckF0dGVuZGVlU3RhdHVzLFxuXHRcdFx0XHR0eXBlOiBSZWNpcGllbnRUeXBlLlVOS05PV04sXG5cdFx0XHRcdGNvbnRhY3Q6IG51bGwsXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIGFkZCBhIG1haWwgYWRkcmVzcyB0byB0aGUgbGlzdCBvZiBpbnZpdGVlcy5cblx0ICogdGhlIG9yZ2FuaXplciB3aWxsIGFsd2F5cyBiZSBzZXQgdG8gdGhlIGxhc3Qgb2YgdGhlIGN1cnJlbnQgdXNlcidzIG1haWwgYWRkcmVzc2VzIHRoYXQgaGFzIGJlZW4gYWRkZWQuXG5cdCAqXG5cdCAqIGlmIGFuIGF0dGVuZGVlIGlzIGRlbGV0ZWQgYW4gcmUtYWRkZWQsIHRoZSBzdGF0dXMgaXMgcmV0YWluZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBhZGRyZXNzIHRoZSBtYWlsIGFkZHJlc3MgdG8gc2VuZCB0aGUgaW52aXRlIHRvXG5cdCAqIEBwYXJhbSBjb250YWN0IGEgY29udGFjdCBmb3IgYSBkaXNwbGF5IG5hbWUuXG5cdCAqL1xuXHRhZGRBdHRlbmRlZShhZGRyZXNzOiBzdHJpbmcsIGNvbnRhY3Q6IENvbnRhY3QgfCBudWxsID0gbnVsbCk6IHZvaWQge1xuXHRcdGlmICghdGhpcy5jYW5Nb2RpZnlHdWVzdHMpIHtcblx0XHRcdHRocm93IG5ldyBVc2VyRXJyb3IobGFuZy5tYWtlVHJhbnNsYXRpb24oXCJjYW5ub3RBZGRBdHRlbmRlZXNfbXNnXCIsIFwiQ2Fubm90IGFkZCBhdHRlbmRlZXNcIikpXG5cdFx0fVxuXHRcdGNvbnN0IGNsZWFuQWRkcmVzcyA9IGNsZWFuTWFpbEFkZHJlc3MoYWRkcmVzcylcblx0XHQvLyBXZSBkb24ndCBhZGQgYW4gYXR0ZW5kZWUgaWYgdGhleSBhcmUgYWxyZWFkeSBhbiBhdHRlbmRlZVxuXHRcdGlmICh0aGlzLl9hdHRlbmRlZXMuaGFzKGNsZWFuQWRkcmVzcykgfHwgdGhpcy5fb3JnYW5pemVyPy5hZGRyZXNzLmFkZHJlc3MgPT09IGNsZWFuQWRkcmVzcyB8fCB0aGlzLl9vd25BdHRlbmRlZT8uYWRkcmVzcy5hZGRyZXNzID09PSBjbGVhbkFkZHJlc3MpIHtcblx0XHRcdHJldHVyblxuXHRcdH1cblxuXHRcdGNvbnN0IG93bkF0dGVuZGVlID0gZmluZFJlY2lwaWVudFdpdGhBZGRyZXNzKHRoaXMub3duTWFpbEFkZHJlc3NlcywgY2xlYW5BZGRyZXNzKVxuXHRcdGlmIChvd25BdHRlbmRlZSAhPSBudWxsKSB7XG5cdFx0XHR0aGlzLmFkZE93bkF0dGVuZGVlKG93bkF0dGVuZGVlKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBuYW1lID0gY29udGFjdCAhPSBudWxsID8gZ2V0Q29udGFjdERpc3BsYXlOYW1lKGNvbnRhY3QpIDogXCJcIlxuXHRcdFx0dGhpcy5hZGRPdGhlckF0dGVuZGVlKGNyZWF0ZUVuY3J5cHRlZE1haWxBZGRyZXNzKHsgYWRkcmVzczogY2xlYW5BZGRyZXNzLCBuYW1lIH0pKVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiB0aGlzIGlzIGEgbm8tb3AgaWYgdGhlcmUgYXJlIGFscmVhZHlcblx0ICogQHBhcmFtIGFkZHJlc3MgTVVTVCBiZSBvbmUgb2Ygb3VycyBhbmQgTVVTVCBOT1QgYmUgaW4gdGhlIGF0dGVuZGVlcyBhcnJheSBvciBzZXQgb24gX29yZ2FuaXplclxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cHJpdmF0ZSBhZGRPd25BdHRlbmRlZShhZGRyZXNzOiBFbmNyeXB0ZWRNYWlsQWRkcmVzcyk6IHZvaWQge1xuXHRcdGlmICh0aGlzLmhhc05vdGlmeWFibGVPdGhlckF0dGVuZGVlcygpKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhcImNhbid0IGNoYW5nZSBvcmdhbml6ZXIgaWYgdGhlcmUgYXJlIG90aGVyIGludml0ZWVzIGFscmVhZHlcIilcblx0XHRcdHJldHVyblxuXHRcdH1cblx0XHRjb25zdCBhdHRlbmRlZVRvQWRkID0gY3JlYXRlQ2FsZW5kYXJFdmVudEF0dGVuZGVlKHsgYWRkcmVzcywgc3RhdHVzOiBDYWxlbmRhckF0dGVuZGVlU3RhdHVzLkFDQ0VQVEVEIH0pXG5cdFx0dGhpcy5fb3duQXR0ZW5kZWUgPSBhdHRlbmRlZVRvQWRkXG5cblx0XHQvLyBtYWtlIHN1cmUgdGhhdCB0aGUgb3JnYW5pemVyIG9uIHRoZSBldmVudCBpcyB0aGUgc2FtZSBhZGRyZXNzIGFzIHdlIGFkZGVkIGFzIGFuIG93biBhdHRlbmRlZS5cblx0XHR0aGlzLl9vcmdhbml6ZXIgPSBhdHRlbmRlZVRvQWRkXG5cdFx0aWYgKCF0aGlzLnJlc29sdmVkUmVjaXBpZW50cy5oYXMoYWRkcmVzcy5hZGRyZXNzKSkge1xuXHRcdFx0dGhpcy5yZXNvbHZlQW5kQ2FjaGVBZGRyZXNzKGFkZHJlc3MpLnRoZW4odGhpcy51aVVwZGF0ZUNhbGxiYWNrKVxuXHRcdH1cblx0XHR0aGlzLnVpVXBkYXRlQ2FsbGJhY2soKVxuXHR9XG5cblx0LyoqXG5cdCAqXG5cdCAqIEBwYXJhbSBhZGRyZXNzIG11c3QgTk9UIGJlIG9uZSBvZiBvdXJzLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cHJpdmF0ZSBhZGRPdGhlckF0dGVuZGVlKGFkZHJlc3M6IEVuY3J5cHRlZE1haWxBZGRyZXNzKSB7XG5cdFx0aWYgKHRoaXMuX293bkF0dGVuZGVlID09IG51bGwpIHtcblx0XHRcdC8vIHdlJ3JlIGFkZGluZyBzb21lb25lIHRoYXQncyBub3QgdXMgd2hpbGUgd2UncmUgbm90IGFuIGF0dGVuZGVlLFxuXHRcdFx0Ly8gc28gd2UgYWRkIG91cnNlbHZlcyBhcyBhbiBhdHRlbmRlZSBhbmQgYXMgb3JnYW5pemVyLlxuXHRcdFx0dGhpcy5hZGRPd25BdHRlbmRlZSh0aGlzLm93bk1haWxBZGRyZXNzZXNbMF0pXG5cdFx0fVxuXG5cdFx0YWRkcmVzcy5hZGRyZXNzID0gY2xlYW5NYWlsQWRkcmVzcyhhZGRyZXNzLmFkZHJlc3MpXG5cdFx0Y29uc3QgcHJldmlvdXNBdHRlbmRlZSA9IHRoaXMuaW5pdGlhbEF0dGVuZGVlcy5nZXQoYWRkcmVzcy5hZGRyZXNzKVxuXG5cdFx0Ly8gIHdlIG5vdyBrbm93IHRoYXQgdGhpcyBhZGRyZXNzIGlzIG5vdCBpbiB0aGUgbGlzdCBhbmQgdGhhdCBpdCdzIGFsc29cblx0XHQvLyAgbm90IHVzIHVuZGVyIGFub3RoZXIgYWRkcmVzcyB0aGF0J3MgYWxyZWFkeSBhZGRlZCwgc28gd2UgY2FuIGp1c3QgYWRkIGl0LlxuXHRcdC8vICB3ZSByZXVzZSB0aGUgZW50cnkgZnJvbSB0aGUgaW5pdGlhbCBhdHRlbmRlZXMgaW4gY2FzZSB3ZSBhbHJlYWR5IGhhZCB0aGlzIGF0dGVuZGVlIGF0IHRoZSBzdGFydFxuXHRcdGlmIChwcmV2aW91c0F0dGVuZGVlICE9IG51bGwpIHtcblx0XHRcdHRoaXMuX2F0dGVuZGVlcy5zZXQoYWRkcmVzcy5hZGRyZXNzLCBwcmV2aW91c0F0dGVuZGVlKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9hdHRlbmRlZXMuc2V0KGFkZHJlc3MuYWRkcmVzcywgY3JlYXRlQ2FsZW5kYXJFdmVudEF0dGVuZGVlKHsgYWRkcmVzcywgc3RhdHVzOiBDYWxlbmRhckF0dGVuZGVlU3RhdHVzLkFEREVEIH0pKVxuXHRcdH1cblx0XHRpZiAoIXRoaXMucmVzb2x2ZWRSZWNpcGllbnRzLmhhcyhhZGRyZXNzLmFkZHJlc3MpKSB7XG5cdFx0XHR0aGlzLnJlc29sdmVBbmRDYWNoZUFkZHJlc3MoYWRkcmVzcykudGhlbih0aGlzLnVpVXBkYXRlQ2FsbGJhY2spXG5cdFx0fVxuXHRcdHRoaXMudWlVcGRhdGVDYWxsYmFjaygpXG5cdH1cblxuXHQvKipcblx0ICogcmVtb3ZlIGEgc2luZ2xlIGF0dGVuZGVlIGZyb20gdGhlIGxpc3QuXG5cdCAqICogaWYgaXQncyB0aGUgb3JnYW5pemVyIEFORCB0aGVyZSBhcmUgb3RoZXIgYXR0ZW5kZWVzLCB0aGlzIGlzIGEgbm8tb3AgLSBpZiB0aGVyZSBhcmUgYXR0ZW5kZWVzLCBzb21lb25lIG11c3QgYmUgb3JnYW5pemVyIChhbmQgaXQncyB1cylcblx0ICogKiBpZiBpdCdzIHRoZSBvcmdhbml6ZXIgQU5EIHRoZXJlIGFyZSBubyBvdGhlciBhdHRlbmRlZXMsIHRoaXMgc2V0cyB0aGUgb3JnYW5pemVyIGFuZCBvd25BdHRlbmRlZVxuXHQgKiAqIGlmIGl0J3Mgbm90IHRoZSBvcmdhbml6ZXIsIGJ1dCB0aGUgbGFzdCBub24tb3JnYW5pemVyIGF0dGVuZGVlLCBvbmx5IHJlbW92ZXMgdGhlIGF0dGVuZGVlIGZyb20gdGhlIGxpc3QsIGJ1dCB0aGVcblx0ICogICByZXN1bHQgd2lsbCBoYXZlIGFuIGVtcHR5IGF0dGVuZGVlIGxpc3QgYW5kIG5vIG9yZ2FuaXplciBpZiBubyBvdGhlciBhdHRlbmRlZXMgYXJlIGFkZGVkIGluIHRoZSBtZWFudGltZS5cblx0ICogKiBpZiBpdCdzIG5vdCB0aGUgb3JnYW5pemVyIGJ1dCBub3QgdGhlIGxhc3Qgbm9uLW9yZ2FuaXplciBhdHRlbmRlZSwganVzdCByZW1vdmVzIHRoYXQgYXR0ZW5kZWUgZnJvbSB0aGUgbGlzdC5cblx0ICogQHBhcmFtIGFkZHJlc3MgdGhlIGF0dGVuZGVlIHRvIHJlbW92ZS5cblx0ICovXG5cdHJlbW92ZUF0dGVuZGVlKGFkZHJlc3M6IHN0cmluZykge1xuXHRcdGNvbnN0IGNsZWFuUmVtb3ZlQWRkcmVzcyA9IGNsZWFuTWFpbEFkZHJlc3MoYWRkcmVzcylcblx0XHRpZiAodGhpcy5fb3JnYW5pemVyPy5hZGRyZXNzLmFkZHJlc3MgPT09IGNsZWFuUmVtb3ZlQWRkcmVzcykge1xuXHRcdFx0aWYgKHRoaXMuX2F0dGVuZGVlcy5zaXplID4gMCkge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcInRyaWVkIHRvIHJlbW92ZSBvcmdhbml6ZXIgd2hpbGUgdGhlcmUgYXJlIG90aGVyIGF0dGVuZGVlcywgaWdub3JpbmcuXCIpXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5fb3JnYW5pemVyID0gbnVsbFxuXHRcdFx0XHQvLyB3ZSBtdXN0IGJlIHRoZSBvcmdhbml6ZXIgc2luY2Ugd2UncmUgcmVtb3ZpbmcgZ3Vlc3RzLlxuXHRcdFx0XHR0aGlzLl9vd25BdHRlbmRlZSA9IG51bGxcblxuXHRcdFx0XHR0aGlzLnVpVXBkYXRlQ2FsbGJhY2soKVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAodGhpcy5fYXR0ZW5kZWVzLmhhcyhjbGVhblJlbW92ZUFkZHJlc3MpKSB7XG5cdFx0XHRcdHRoaXMuX2F0dGVuZGVlcy5kZWxldGUoY2xlYW5SZW1vdmVBZGRyZXNzKVxuXHRcdFx0XHRpZiAodGhpcy5fYXR0ZW5kZWVzLnNpemUgPT09IDApIHtcblx0XHRcdFx0XHR0aGlzLl9vcmdhbml6ZXIgPSBudWxsXG5cdFx0XHRcdFx0Ly8gd2UgbXVzdCBiZSB0aGUgb3JnYW5pemVyIHNpbmNlIHdlJ3JlIHJlbW92aW5nIGd1ZXN0cy5cblx0XHRcdFx0XHR0aGlzLl9vd25BdHRlbmRlZSA9IG51bGxcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLnVpVXBkYXRlQ2FsbGJhY2soKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBtb2RpZnkgeW91ciBvd24gYXR0ZW5kYW5jZSB0byB0aGUgc2VsZWN0ZWQgdmFsdWUuXG5cdCAqIGlzIGEgbm8tb3AgaWYgd2UncmUgbm90IGFjdHVhbGx5IGFuIGF0dGVuZGVlXG5cdCAqIEBwYXJhbSBzdGF0dXNcblx0ICovXG5cdHNldE93bkF0dGVuZGFuY2Uoc3RhdHVzOiBDYWxlbmRhckF0dGVuZGVlU3RhdHVzKSB7XG5cdFx0aWYgKHRoaXMuX293bkF0dGVuZGVlKSB0aGlzLl9vd25BdHRlbmRlZS5zdGF0dXMgPSBzdGF0dXNcblx0fVxuXG5cdHNldFByZXNoYXJlZFBhc3N3b3JkKGFkZHJlc3M6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZykge1xuXHRcdHRoaXMuZXh0ZXJuYWxQYXNzd29yZHMuc2V0KGFkZHJlc3MsIHBhc3N3b3JkKVxuXHR9XG5cblx0LyoqIGZvciBhIHN0b3JlZCBhZGRyZXNzLCBnZXQgdGhlIHByZXNoYXJlZCBwYXNzd29yZCBhbmQgYW4gaW5kaWNhdG9yIHZhbHVlIGZvciBpdHMgc3RyZW5ndGggKi9cblx0Z2V0UHJlc2hhcmVkUGFzc3dvcmQoYWRkcmVzczogc3RyaW5nKTogeyBwYXNzd29yZDogc3RyaW5nOyBzdHJlbmd0aDogbnVtYmVyIH0ge1xuXHRcdGNvbnN0IHBhc3N3b3JkID0gdGhpcy5leHRlcm5hbFBhc3N3b3Jkcy5nZXQoYWRkcmVzcykgPz8gXCJcIlxuXHRcdGNvbnN0IHJlY2lwaWVudCA9IHRoaXMucmVzb2x2ZWRSZWNpcGllbnRzLmdldChhZGRyZXNzKVxuXHRcdGNvbnN0IHN0cmVuZ3RoID0gcmVjaXBpZW50ICE9IG51bGwgPyB0aGlzLnBhc3N3b3JkU3RyZW5ndGhNb2RlbChwYXNzd29yZCwgcmVjaXBpZW50KSA6IDBcblx0XHRyZXR1cm4geyBwYXNzd29yZCwgc3RyZW5ndGggfVxuXHR9XG5cblx0LyoqXG5cdCAqIHJldHVybiB3aGV0aGVyIGFueSBvZiB0aGUgYXR0ZW5kZWVzIGhhdmUgYSBwYXNzd29yZCBzZXQgdGhhdCB3YXJyYW50cyBhc2tpbmcgdGhlIHVzZXIgaWYgdGhleSByZWFsbHkgd2FudCB0byB1c2UgaXQuXG5cdCAqXG5cdCAqIGlnbm9yZXMgZW1wdHkgcGFzc3dvcmRzIHNpbmNlIHRob3NlIGFyZSBhbHdheXMgYSBoYXJkIGZhaWwgd2hlbiBzZW5kaW5nIGV4dGVybmFsIG1haWwuXG5cdCAqL1xuXHRoYXNJbnNlY3VyZVBhc3N3b3JkcygpOiBib29sZWFuIHtcblx0XHRpZiAoIXRoaXMuaXNDb25maWRlbnRpYWwpIHtcblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdH1cblx0XHRmb3IgKGNvbnN0IGcgb2YgdGhpcy5fYXR0ZW5kZWVzLnZhbHVlcygpKSB7XG5cdFx0XHRjb25zdCB7IHBhc3N3b3JkLCBzdHJlbmd0aCB9ID0gdGhpcy5nZXRQcmVzaGFyZWRQYXNzd29yZChnLmFkZHJlc3MuYWRkcmVzcylcblx0XHRcdGlmIChwYXNzd29yZCA9PT0gXCJcIiB8fCBpc1NlY3VyZVBhc3N3b3JkKHN0cmVuZ3RoKSkgY29udGludWVcblx0XHRcdHJldHVybiB0cnVlXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlXG5cdH1cblxuXHRwcml2YXRlIHByZXBhcmVTZW5kTW9kZWwoYXR0ZW5kZWVzOiBSZWFkb25seUFycmF5PENhbGVuZGFyRXZlbnRBdHRlbmRlZT4pOiBTZW5kTWFpbE1vZGVsIHwgbnVsbCB7XG5cdFx0aWYgKCF0aGlzLl9vd25BdHRlbmRlZSkgcmV0dXJuIG51bGxcblx0XHRjb25zdCByZWNpcGllbnRzID0gYXR0ZW5kZWVzLm1hcCgoeyBhZGRyZXNzIH0pID0+IGFkZHJlc3MpXG5cdFx0Y29uc3QgbW9kZWwgPSB0aGlzLnNlbmRNYWlsTW9kZWxGYWN0b3J5KClcblx0XHQvLyBkbyBub3QgcGFzcyByZWNpcGllbnRzIGluIHRlbXBsYXRlIGFyZ3VtZW50cyBhcyByZWNpcGllbnQgY2hlY2tzIGluIHNlbmRNYWlsTW9kZWwgYXJlIGRvbmUgaW4gc3luYyBwYXJ0IG9mIHNlbmRcblx0XHRtb2RlbC5pbml0V2l0aFRlbXBsYXRlKFtdLCBcIlwiLCBcIlwiKVxuXG5cdFx0Zm9yIChjb25zdCByZWNpcGllbnQgb2YgcmVjaXBpZW50cykge1xuXHRcdFx0bW9kZWwuYWRkUmVjaXBpZW50KFJlY2lwaWVudEZpZWxkLkJDQywgcmVjaXBpZW50KVxuXHRcdFx0Ly8gT25seSBzZXQgdGhlIHBhc3N3b3JkIGlmIHdlIGhhdmUgYW4gZW50cnkuXG5cdFx0XHQvLyBUaGUgcmVjaXBpZW50cyBtaWdodCBub3QgYmUgcmVzb2x2ZWQgYXQgdGhpcyBwb2ludCB5ZXQsIHNvIHdlIHNob3VsZG4ndCBzZXQgdGhlIHBhc3N3b3JkIG9uIHRoZSBtb2RlbCB1bmxlc3Mgd2UgaGF2ZSBvbmUgZm9yIHN1cmUuXG5cdFx0XHQvLyBTZW5kTWFpbE1vZGVsIHdpbGwgYW55d2F5IHJlc29sdmUgdGhlIHJlY2lwaWVudHMsIGJ1dCBpdCB3b24ndCBkZXRlY3QgdGhlIHJpZ2h0IHBhc3N3b3JkIGlmIGl0J3MgYWxyZWFkeSBwcmUtZmlsbGVkIGJ5IHVzLlxuXHRcdFx0aWYgKHRoaXMuZXh0ZXJuYWxQYXNzd29yZHMuaGFzKHJlY2lwaWVudC5hZGRyZXNzKSkge1xuXHRcdFx0XHRjb25zdCBwYXNzd29yZCA9IGFzc2VydE5vdE51bGwodGhpcy5leHRlcm5hbFBhc3N3b3Jkcy5nZXQocmVjaXBpZW50LmFkZHJlc3MpKVxuXHRcdFx0XHRtb2RlbC5zZXRQYXNzd29yZChyZWNpcGllbnQuYWRkcmVzcywgcGFzc3dvcmQpXG5cdFx0XHR9XG5cdFx0fVxuXHRcdG1vZGVsLnNldFNlbmRlcih0aGlzLl9vd25BdHRlbmRlZS5hZGRyZXNzLmFkZHJlc3MpXG5cdFx0bW9kZWwuc2V0Q29uZmlkZW50aWFsKHRoaXMuaXNDb25maWRlbnRpYWwpXG5cdFx0cmV0dXJuIG1vZGVsXG5cdH1cblxuXHRwcml2YXRlIHByZXBhcmVSZXNwb25zZU1vZGVsKCk6IFNlbmRNYWlsTW9kZWwgfCBudWxsIHtcblx0XHRpZiAodGhpcy5ldmVudFR5cGUgIT09IEV2ZW50VHlwZS5JTlZJVEUgfHwgdGhpcy5fb3duQXR0ZW5kZWUgPT09IG51bGwgfHwgdGhpcy5fb3JnYW5pemVyID09IG51bGwgfHwgdGhpcy5fb3duQXR0ZW5kZWUgPT0gbnVsbCkge1xuXHRcdFx0Ly8gbm90IGNoZWNraW5nIGZvciBpbml0aWFsQXR0ZW5kZWVzLnNpemUgPT09IDAgYmVjYXVzZSB3ZSBhbmQgdGhlIG9yZ2FuaXplciBtaWdodCBiZSB0aGUgb25seSBhdHRlbmRlZXMsIHdoaWNoIGRvIG5vdCBzaG93XG5cdFx0XHQvLyB1cCB0aGVyZS5cblx0XHRcdHJldHVybiBudWxsXG5cdFx0fVxuXG5cdFx0Y29uc3QgaW5pdGlhbE93bkF0dGVuZGVlU3RhdHVzID0gYXNzZXJ0Tm90TnVsbChcblx0XHRcdHRoaXMuaW5pdGlhbE93bkF0dGVuZGVlU3RhdHVzLFxuXHRcdFx0XCJzb21laG93IG1hbmFnZWQgdG8gYmVjb21lIGFuIGF0dGVuZGVlIG9uIGFuIGludml0ZSB3ZSB3ZXJlbid0IGludml0ZWQgdG8gYmVmb3JlXCIsXG5cdFx0KVxuXG5cdFx0aWYgKCEoaW5pdGlhbE93bkF0dGVuZGVlU3RhdHVzICE9PSB0aGlzLl9vd25BdHRlbmRlZS5zdGF0dXMgJiYgdGhpcy5fb3duQXR0ZW5kZWUuc3RhdHVzICE9PSBDYWxlbmRhckF0dGVuZGVlU3RhdHVzLk5FRURTX0FDVElPTikpIHtcblx0XHRcdC8vIGVpdGhlciBvdXIgc3RhdHVzIGRpZCBub3QgYWN0dWFsbHkgY2hhbmdlIG9yIG91ciBuZXcgc3RhdHVzIGlzIFwiTkVFRFNfQUNUSU9OXCJcblx0XHRcdHJldHVybiBudWxsXG5cdFx0fVxuXG5cdFx0Y29uc3QgcmVzcG9uc2VNb2RlbDogU2VuZE1haWxNb2RlbCA9IHRoaXMuc2VuZE1haWxNb2RlbEZhY3RvcnkoKVxuXG5cdFx0aWYgKHRoaXMucmVzcG9uc2VUbyAhPSBudWxsKSB7XG5cdFx0XHQvLyBkbyBub3QgcGFzcyByZWNpcGllbnRzIGluIHRlbXBsYXRlIGFyZ3VtZW50cyBhcyByZWNpcGllbnQgY2hlY2tzIGluIHNlbmRNYWlsTW9kZWwgYXJlIGRvbmUgaW4gc3luYyBwYXJ0IG9mIHNlbmRcblx0XHRcdHJlc3BvbnNlTW9kZWwuaW5pdEFzUmVzcG9uc2UoXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRwcmV2aW91c01haWw6IHRoaXMucmVzcG9uc2VUbyxcblx0XHRcdFx0XHRjb252ZXJzYXRpb25UeXBlOiBDb252ZXJzYXRpb25UeXBlLlJFUExZLFxuXHRcdFx0XHRcdHNlbmRlck1haWxBZGRyZXNzOiB0aGlzLl9vd25BdHRlbmRlZS5hZGRyZXNzLmFkZHJlc3MsXG5cdFx0XHRcdFx0cmVjaXBpZW50czogW10sXG5cdFx0XHRcdFx0YXR0YWNobWVudHM6IFtdLFxuXHRcdFx0XHRcdGJvZHlUZXh0OiBcIlwiLFxuXHRcdFx0XHRcdHN1YmplY3Q6IFwiXCIsXG5cdFx0XHRcdFx0cmVwbHlUb3M6IFtdLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRuZXcgTWFwKCksXG5cdFx0XHQpXG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGRvIG5vdCBwYXNzIHJlY2lwaWVudHMgaW4gdGVtcGxhdGUgYXJndW1lbnRzIGFzIHJlY2lwaWVudCBjaGVja3MgaW4gc2VuZE1haWxNb2RlbCBhcmUgZG9uZSBpbiBzeW5jIHBhcnQgb2Ygc2VuZFxuXHRcdFx0cmVzcG9uc2VNb2RlbC5pbml0V2l0aFRlbXBsYXRlKHt9LCBcIlwiLCBcIlwiKVxuXHRcdH1cblx0XHRyZXNwb25zZU1vZGVsLmFkZFJlY2lwaWVudChSZWNpcGllbnRGaWVsZC5UTywgdGhpcy5fb3JnYW5pemVyLmFkZHJlc3MpXG5cblx0XHRyZXR1cm4gcmVzcG9uc2VNb2RlbFxuXHR9XG5cblx0Z2V0IHJlc3VsdCgpOiBBdHRlbmRhbmNlTW9kZWxSZXN1bHQge1xuXHRcdGlmICh0aGlzLl9zZWxlY3RlZENhbGVuZGFyID09IG51bGwpIHtcblx0XHRcdHRocm93IG5ldyBVc2VyRXJyb3IoXCJub0NhbGVuZGFyX21zZ1wiKVxuXHRcdH1cblxuXHRcdGNvbnN0IGlzT3JnYW5pemVyID0gdGhpcy5fb3JnYW5pemVyICE9IG51bGwgJiYgdGhpcy5fb3duQXR0ZW5kZWU/LmFkZHJlc3MuYWRkcmVzcyA9PT0gdGhpcy5fb3JnYW5pemVyLmFkZHJlc3MuYWRkcmVzc1xuXG5cdFx0Y29uc3Qge1xuXHRcdFx0a2VwdDogYXR0ZW5kZWVzVG9VcGRhdGUsXG5cdFx0XHRkZWxldGVkOiBhdHRlbmRlZXNUb0NhbmNlbCxcblx0XHRcdGFkZGVkOiBhdHRlbmRlZXNUb0ludml0ZSxcblx0XHR9ID0gZ2V0UmVjaXBpZW50TGlzdHModGhpcy5pbml0aWFsQXR0ZW5kZWVzLCB0aGlzLl9hdHRlbmRlZXMsIGlzT3JnYW5pemVyLCB0aGlzLmlzTmV3KVxuXG5cdFx0Y29uc3QgeyBhbGxBdHRlbmRlZXMsIG9yZ2FuaXplclRvUHVibGlzaCB9ID0gYXNzZW1ibGVBdHRlbmRlZXMoYXR0ZW5kZWVzVG9JbnZpdGUsIGF0dGVuZGVlc1RvVXBkYXRlLCB0aGlzLl9vcmdhbml6ZXIsIHRoaXMuX293bkF0dGVuZGVlKVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGF0dGVuZGVlczogYWxsQXR0ZW5kZWVzLFxuXHRcdFx0b3JnYW5pemVyOiBvcmdhbml6ZXJUb1B1Ymxpc2gsXG5cdFx0XHRpc0NvbmZpZGVudGlhbDogdGhpcy5pc0NvbmZpZGVudGlhbCxcblx0XHRcdGNhbmNlbE1vZGVsOiBpc09yZ2FuaXplciAmJiBhdHRlbmRlZXNUb0NhbmNlbC5sZW5ndGggPiAwID8gdGhpcy5wcmVwYXJlU2VuZE1vZGVsKGF0dGVuZGVlc1RvQ2FuY2VsKSA6IG51bGwsXG5cdFx0XHRpbnZpdGVNb2RlbDogaXNPcmdhbml6ZXIgJiYgYXR0ZW5kZWVzVG9JbnZpdGUubGVuZ3RoID4gMCA/IHRoaXMucHJlcGFyZVNlbmRNb2RlbChhdHRlbmRlZXNUb0ludml0ZSkgOiBudWxsLFxuXHRcdFx0dXBkYXRlTW9kZWw6IGlzT3JnYW5pemVyICYmIGF0dGVuZGVlc1RvVXBkYXRlLmxlbmd0aCA+IDAgJiYgdGhpcy5zaG91bGRTZW5kVXBkYXRlcyA/IHRoaXMucHJlcGFyZVNlbmRNb2RlbChhdHRlbmRlZXNUb1VwZGF0ZSkgOiBudWxsLFxuXHRcdFx0cmVzcG9uc2VNb2RlbDogIWlzT3JnYW5pemVyICYmIG9yZ2FuaXplclRvUHVibGlzaCAhPSBudWxsID8gdGhpcy5wcmVwYXJlUmVzcG9uc2VNb2RlbCgpIDogbnVsbCxcblx0XHRcdGNhbGVuZGFyOiB0aGlzLl9zZWxlY3RlZENhbGVuZGFyLFxuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBnZXRSZWNpcGllbnRMaXN0cyhcblx0aW5pdGlhbEF0dGVuZGVlczogUmVhZG9ubHlNYXA8dW5rbm93biwgQ2FsZW5kYXJFdmVudEF0dGVuZGVlPixcblx0Y3VycmVudEF0dGVuZGVlczogUmVhZG9ubHlNYXA8dW5rbm93biwgQ2FsZW5kYXJFdmVudEF0dGVuZGVlPixcblx0aXNPcmdhbml6ZXI6IGJvb2xlYW4sXG5cdGlzTmV3OiBib29sZWFuLFxuKTogUmV0dXJuVHlwZTx0eXBlb2YgdHJpc2VjdGluZ0RpZmY8Q2FsZW5kYXJFdmVudEF0dGVuZGVlPj4ge1xuXHRpZiAoIWlzT3JnYW5pemVyKSB7XG5cdFx0Ly8gaWYgd2UncmUgbm90IHRoZSBvcmdhbml6ZXIsIHdlIGNhbid0IGhhdmUgY2hhbmdlZCB0aGUgZ3Vlc3QgbGlzdC5cblx0XHRyZXR1cm4geyBhZGRlZDogW10sIGRlbGV0ZWQ6IFtdLCBrZXB0OiBBcnJheS5mcm9tKGluaXRpYWxBdHRlbmRlZXMudmFsdWVzKCkpIH1cblx0fSBlbHNlIGlmIChpc05ldykge1xuXHRcdC8vIGEgbmV3IGV2ZW50IHdpbGwgYWx3YXlzIGhhdmUgZXZlcnlvbmUgb24gdGhlIGd1ZXN0IGxpc3QgaGF2ZSB0byBiZSBpbnZpdGVkLlxuXHRcdHJldHVybiB7IGFkZGVkOiBBcnJheS5mcm9tKGN1cnJlbnRBdHRlbmRlZXMudmFsdWVzKCkpLCBkZWxldGVkOiBbXSwga2VwdDogW10gfVxuXHR9IGVsc2Uge1xuXHRcdC8vIGluIHRoaXMgY2FzZSwgdGhlIGd1ZXN0IGxpc3QgbWF5IGhhdmUgY2hhbmdlZCBhcmJpdHJhcmlseVxuXHRcdHJldHVybiB0cmlzZWN0aW5nRGlmZihpbml0aWFsQXR0ZW5kZWVzLCBjdXJyZW50QXR0ZW5kZWVzKVxuXHR9XG59XG5cbi8qKiBnZXQgdGhlIGxpc3Qgb2YgYXR0ZW5kZWVzIGFuZCB0aGUgb3JnYW5pemVyIGFkZHJlc3MgdG8gcHVibGlzaC5cbiAqIHRoZSBhcnJheSBjb250YWlucyB0aGUgb3JnYW5pemVyIGFzIGFuIGF0dGVuZGVlLlxuICpcbiAqIGlmIHRoZXJlJ3Mgb25seSBhbiBvcmdhbml6ZXIgYnV0IG5vIG90aGVyIGF0dGVuZGVlcywgbm8gYXR0ZW5kZWVzIG9yIG9yZ2FuaXplcnMgYXJlIHJldHVybmVkLlxuICogKi9cbmZ1bmN0aW9uIGFzc2VtYmxlQXR0ZW5kZWVzKFxuXHRhdHRlbmRlZXNUb0ludml0ZTogUmVhZG9ubHlBcnJheTxDYWxlbmRhckV2ZW50QXR0ZW5kZWU+LFxuXHRhdHRlbmRlZXNUb1VwZGF0ZTogUmVhZG9ubHlBcnJheTxDYWxlbmRhckV2ZW50QXR0ZW5kZWU+LFxuXHRvcmdhbml6ZXI6IENhbGVuZGFyRXZlbnRBdHRlbmRlZSB8IG51bGwsXG5cdG93bkF0dGVuZGVlOiBDYWxlbmRhckV2ZW50QXR0ZW5kZWUgfCBudWxsLFxuKToge1xuXHRhbGxBdHRlbmRlZXM6IEFycmF5PENhbGVuZGFyRXZlbnRBdHRlbmRlZT5cblx0b3JnYW5pemVyVG9QdWJsaXNoOiBFbmNyeXB0ZWRNYWlsQWRkcmVzcyB8IG51bGxcbn0ge1xuXHRpZiAoXG5cdFx0b3JnYW5pemVyID09IG51bGwgfHxcblx0XHQoYXR0ZW5kZWVzVG9JbnZpdGUubGVuZ3RoICsgYXR0ZW5kZWVzVG9VcGRhdGUubGVuZ3RoID09PSAwICYmIChvd25BdHRlbmRlZSA9PSBudWxsIHx8IG93bkF0dGVuZGVlLmFkZHJlc3MuYWRkcmVzcyA9PT0gb3JnYW5pemVyPy5hZGRyZXNzLmFkZHJlc3MpKVxuXHQpIHtcblx0XHQvLyB0aGVyZSdzIG5vIGF0dGVuZGVlcyBiZXNpZGVzIHRoZSBvcmdhbml6ZXIgKHdoaWNoIG1heSBiZSB1cykgb3IgdGhlcmUncyBubyBvcmdhbml6ZXIgYXQgYWxsLlxuXHRcdHJldHVybiB7IGFsbEF0dGVuZGVlczogW10sIG9yZ2FuaXplclRvUHVibGlzaDogbnVsbCB9XG5cdH1cblx0Y29uc3QgYWxsQXR0ZW5kZWVzOiBBcnJheTxDYWxlbmRhckV2ZW50QXR0ZW5kZWU+ID0gW11cblx0aWYgKG9yZ2FuaXplci5hZGRyZXNzLmFkZHJlc3MgIT09IG93bkF0dGVuZGVlPy5hZGRyZXNzLmFkZHJlc3MpIHtcblx0XHRhbGxBdHRlbmRlZXMucHVzaChvcmdhbml6ZXIpXG5cdH1cblx0aWYgKG93bkF0dGVuZGVlICE9IG51bGwpIHtcblx0XHRhbGxBdHRlbmRlZXMucHVzaChvd25BdHRlbmRlZSlcblx0fVxuXHRhbGxBdHRlbmRlZXMucHVzaCguLi5hdHRlbmRlZXNUb1VwZGF0ZSlcblx0YWxsQXR0ZW5kZWVzLnB1c2goLi4uYXR0ZW5kZWVzVG9JbnZpdGUpXG5cblx0cmV0dXJuIHtcblx0XHRhbGxBdHRlbmRlZXMsXG5cdFx0b3JnYW5pemVyVG9QdWJsaXNoOiBvcmdhbml6ZXIuYWRkcmVzcyxcblx0fVxufVxuIiwiaW1wb3J0IHsgZ2VuZXJhdGVFdmVudEVsZW1lbnRJZCwgc2VyaWFsaXplQWxhcm1JbnRlcnZhbCB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi91dGlscy9Db21tb25DYWxlbmRhclV0aWxzLmpzXCJcbmltcG9ydCB7IG5vT3AsIHJlbW92ZSB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHsgRXZlbnRUeXBlIH0gZnJvbSBcIi4vQ2FsZW5kYXJFdmVudE1vZGVsLmpzXCJcbmltcG9ydCB7IERhdGVQcm92aWRlciB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9EYXRlUHJvdmlkZXIuanNcIlxuaW1wb3J0IHsgQWxhcm1JbnRlcnZhbCwgYWxhcm1JbnRlcnZhbFRvTHV4b25EdXJhdGlvbkxpa2VPYmplY3QgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL2NhbGVuZGFyL2RhdGUvQ2FsZW5kYXJVdGlscy5qc1wiXG5pbXBvcnQgeyBEdXJhdGlvbiB9IGZyb20gXCJsdXhvblwiXG5pbXBvcnQgeyBBbGFybUluZm9UZW1wbGF0ZSB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vYXBpL3dvcmtlci9mYWNhZGVzL2xhenkvQ2FsZW5kYXJGYWNhZGUuanNcIlxuXG5leHBvcnQgdHlwZSBDYWxlbmRhckV2ZW50QWxhcm1Nb2RlbFJlc3VsdCA9IHtcblx0YWxhcm1zOiBBcnJheTxBbGFybUluZm9UZW1wbGF0ZT5cbn1cblxuLyoqXG4gKiBlZGl0IHRoZSBhbGFybXMgc2V0IG9uIGEgY2FsZW5kYXIgZXZlbnQuXG4gKi9cbmV4cG9ydCBjbGFzcyBDYWxlbmRhckV2ZW50QWxhcm1Nb2RlbCB7XG5cdHByaXZhdGUgcmVhZG9ubHkgX2FsYXJtczogQXJyYXk8QWxhcm1JbnRlcnZhbD4gPSBbXVxuXHQvKiogd2UgY2FuIHNldCByZW1pbmRlcnMgb25seSBpZiB3ZSdyZSBhYmxlIHRvIGVkaXQgdGhlIGV2ZW50IG9uIHRoZSBzZXJ2ZXIgYmVjYXVzZSB3ZSBoYXZlIHRvIGFkZCB0aGVtIHRvIHRoZSBlbnRpdHkuICovXG5cdHJlYWRvbmx5IGNhbkVkaXRSZW1pbmRlcnM6IGJvb2xlYW5cblxuXHRjb25zdHJ1Y3Rvcihcblx0XHRldmVudFR5cGU6IEV2ZW50VHlwZSxcblx0XHRhbGFybXM6IEFycmF5PEFsYXJtSW50ZXJ2YWw+ID0gW10sXG5cdFx0cHJpdmF0ZSByZWFkb25seSBkYXRlUHJvdmlkZXI6IERhdGVQcm92aWRlcixcblx0XHRwcml2YXRlIHJlYWRvbmx5IHVpVXBkYXRlQ2FsbGJhY2s6ICgpID0+IHZvaWQgPSBub09wLFxuXHQpIHtcblx0XHR0aGlzLmNhbkVkaXRSZW1pbmRlcnMgPVxuXHRcdFx0ZXZlbnRUeXBlID09PSBFdmVudFR5cGUuT1dOIHx8IGV2ZW50VHlwZSA9PT0gRXZlbnRUeXBlLlNIQVJFRF9SVyB8fCBldmVudFR5cGUgPT09IEV2ZW50VHlwZS5MT0NLRUQgfHwgZXZlbnRUeXBlID09PSBFdmVudFR5cGUuSU5WSVRFXG5cdFx0dGhpcy5fYWxhcm1zID0gWy4uLmFsYXJtc11cblx0fVxuXG5cdC8qKlxuXHQgKiBAcGFyYW0gdHJpZ2dlciB0aGUgaW50ZXJ2YWwgdG8gYWRkLlxuXHQgKi9cblx0YWRkQWxhcm0odHJpZ2dlcjogQWxhcm1JbnRlcnZhbCB8IG51bGwpIHtcblx0XHRpZiAodHJpZ2dlciA9PSBudWxsKSByZXR1cm5cblxuXHRcdC8vIENoZWNrcyBpZiBhbiBhbGFybSB3aXRoIHRoZSBzYW1lIGR1cmF0aW9uIGFscmVhZHkgZXhpc3RzXG5cdFx0Y29uc3QgYWxyZWFkeUhhc0FsYXJtID0gdGhpcy5fYWxhcm1zLnNvbWUoKGUpID0+IHRoaXMuaXNFcXVhbEFsYXJtcyh0cmlnZ2VyLCBlKSlcblx0XHRpZiAoYWxyZWFkeUhhc0FsYXJtKSByZXR1cm5cblxuXHRcdHRoaXMuX2FsYXJtcy5wdXNoKHRyaWdnZXIpXG5cdFx0dGhpcy51aVVwZGF0ZUNhbGxiYWNrKClcblx0fVxuXG5cdC8qKlxuXHQgKiBkZWFjdGl2YXRlIHRoZSBhbGFybSBmb3IgdGhlIGdpdmVuIGludGVydmFsLlxuXHQgKi9cblx0cmVtb3ZlQWxhcm0oYWxhcm1JbnRlcnZhbDogQWxhcm1JbnRlcnZhbCkge1xuXHRcdHJlbW92ZSh0aGlzLl9hbGFybXMsIGFsYXJtSW50ZXJ2YWwpXG5cdFx0dGhpcy51aVVwZGF0ZUNhbGxiYWNrKClcblx0fVxuXG5cdHJlbW92ZUFsbCgpIHtcblx0XHR0aGlzLl9hbGFybXMuc3BsaWNlKDApXG5cdH1cblxuXHRhZGRBbGwoYWxhcm1JbnRlcnZhbExpc3Q6IEFsYXJtSW50ZXJ2YWxbXSkge1xuXHRcdHRoaXMuX2FsYXJtcy5wdXNoKC4uLmFsYXJtSW50ZXJ2YWxMaXN0KVxuXHR9XG5cblx0Z2V0IGFsYXJtcygpOiBSZWFkb25seUFycmF5PEFsYXJtSW50ZXJ2YWw+IHtcblx0XHRyZXR1cm4gdGhpcy5fYWxhcm1zXG5cdH1cblxuXHRnZXQgcmVzdWx0KCk6IENhbGVuZGFyRXZlbnRBbGFybU1vZGVsUmVzdWx0IHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0YWxhcm1zOiBBcnJheS5mcm9tKHRoaXMuX2FsYXJtcy52YWx1ZXMoKSkubWFwKCh0KSA9PiB0aGlzLm1ha2VOZXdBbGFybSh0KSksXG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBtYWtlTmV3QWxhcm0oYWxhcm1JbnRlcnZhbDogQWxhcm1JbnRlcnZhbCk6IEFsYXJtSW5mb1RlbXBsYXRlIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0YWxhcm1JZGVudGlmaWVyOiBnZW5lcmF0ZUV2ZW50RWxlbWVudElkKHRoaXMuZGF0ZVByb3ZpZGVyLm5vdygpKSxcblx0XHRcdHRyaWdnZXI6IHNlcmlhbGl6ZUFsYXJtSW50ZXJ2YWwoYWxhcm1JbnRlcnZhbCksXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIENvbXBhcmVzIHR3byBBbGFybUludGVydmFscyBpZiB0aGV5IGhhdmUgdGhlIHNhbWUgZHVyYXRpb25cblx0ICogZWc6IDYwIG1pbnV0ZXMgPT09IDEgaG91clxuXHQgKiBAcGFyYW0gYWxhcm1PbmUgYmFzZSBpbnRlcnZhbFxuXHQgKiBAcGFyYW0gYWxhcm1Ud28gaW50ZXJ2YWwgdG8gYmUgY29tcGFyZWQgd2l0aFxuXHQgKiBAcmV0dXJuIHRydWUgaWYgdGhleSBoYXZlIHRoZSBzYW1lIGR1cmF0aW9uXG5cdCAqL1xuXHRpc0VxdWFsQWxhcm1zKGFsYXJtT25lOiBBbGFybUludGVydmFsLCBhbGFybVR3bzogQWxhcm1JbnRlcnZhbCk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IGx1eG9uQWxhcm1PbmUgPSBEdXJhdGlvbi5mcm9tRHVyYXRpb25MaWtlKGFsYXJtSW50ZXJ2YWxUb0x1eG9uRHVyYXRpb25MaWtlT2JqZWN0KGFsYXJtT25lKSkuc2hpZnRUb0FsbCgpXG5cdFx0Y29uc3QgbHV4b25BbGFybVR3byA9IER1cmF0aW9uLmZyb21EdXJhdGlvbkxpa2UoYWxhcm1JbnRlcnZhbFRvTHV4b25EdXJhdGlvbkxpa2VPYmplY3QoYWxhcm1Ud28pKS5zaGlmdFRvQWxsKClcblxuXHRcdHJldHVybiBsdXhvbkFsYXJtT25lLmVxdWFscyhsdXhvbkFsYXJtVHdvKVxuXHR9XG59XG4iLCJpbXBvcnQgdHlwZSB7IEh0bWxTYW5pdGl6ZXIgfSBmcm9tIFwiLi9IdG1sU2FuaXRpemVyLmpzXCJcbmltcG9ydCB7IG5vT3AgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcblxuZXhwb3J0IGNsYXNzIFNhbml0aXplZFRleHRWaWV3TW9kZWwge1xuXHRwcml2YXRlIHNhbml0aXplZFRleHQ6IHN0cmluZyB8IG51bGwgPSBudWxsXG5cblx0Y29uc3RydWN0b3IocHJpdmF0ZSB0ZXh0OiBzdHJpbmcsIHByaXZhdGUgcmVhZG9ubHkgc2FuaXRpemVyOiBIdG1sU2FuaXRpemVyLCBwcml2YXRlIHJlYWRvbmx5IHVpVXBkYXRlQ2FsbGJhY2s6ICgpID0+IHZvaWQgPSBub09wKSB7fVxuXG5cdHNldCBjb250ZW50KHY6IHN0cmluZykge1xuXHRcdHRoaXMuc2FuaXRpemVkVGV4dCA9IG51bGxcblx0XHR0aGlzLnRleHQgPSB2XG5cdFx0dGhpcy51aVVwZGF0ZUNhbGxiYWNrKClcblx0fVxuXG5cdGdldCBjb250ZW50KCk6IHN0cmluZyB7XG5cdFx0aWYgKHRoaXMuc2FuaXRpemVkVGV4dCA9PSBudWxsKSB7XG5cdFx0XHR0aGlzLnNhbml0aXplZFRleHQgPSB0aGlzLnNhbml0aXplci5zYW5pdGl6ZUhUTUwodGhpcy50ZXh0LCB7IGJsb2NrRXh0ZXJuYWxDb250ZW50OiBmYWxzZSB9KS5odG1sXG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLnNhbml0aXplZFRleHRcblx0fVxufVxuIiwiaW1wb3J0IHsgU2VuZE1haWxNb2RlbCB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vbWFpbEZ1bmN0aW9uYWxpdHkvU2VuZE1haWxNb2RlbC5qc1wiXG5pbXBvcnQgeyBDYWxlbmRhck5vdGlmaWNhdGlvblNlbmRlciB9IGZyb20gXCIuLi8uLi92aWV3L0NhbGVuZGFyTm90aWZpY2F0aW9uU2VuZGVyLmpzXCJcbmltcG9ydCB7IExvZ2luQ29udHJvbGxlciB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vYXBpL21haW4vTG9naW5Db250cm9sbGVyLmpzXCJcbmltcG9ydCB7IENhbGVuZGFyRXZlbnQgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL2FwaS9lbnRpdGllcy90dXRhbm90YS9UeXBlUmVmcy5qc1wiXG5pbXBvcnQgeyBQcm9ncmFtbWluZ0Vycm9yIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL2Vycm9yL1Byb2dyYW1taW5nRXJyb3IuanNcIlxuaW1wb3J0IHsgQWNjb3VudFR5cGUsIENhbGVuZGFyQXR0ZW5kZWVTdGF0dXMgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vVHV0YW5vdGFDb25zdGFudHMuanNcIlxuaW1wb3J0IHsgY2xvbmUgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB7IFRvb01hbnlSZXF1ZXN0c0Vycm9yIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL2Vycm9yL1Jlc3RFcnJvci5qc1wiXG5pbXBvcnQgeyBVc2VyRXJyb3IgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL2FwaS9tYWluL1VzZXJFcnJvci5qc1wiXG5pbXBvcnQgeyBnZXROb25Pcmdhbml6ZXJBdHRlbmRlZXMgfSBmcm9tIFwiLi9DYWxlbmRhckV2ZW50TW9kZWwuanNcIlxuaW1wb3J0IHsgVXBncmFkZVJlcXVpcmVkRXJyb3IgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL2FwaS9tYWluL1VwZ3JhZGVSZXF1aXJlZEVycm9yLmpzXCJcblxuLyoqIGFsbCB0aGUgcGVvcGxlIHRoYXQgbWF5IGJlIGludGVyZXN0ZWQgaW4gY2hhbmdlcyB0byBhbiBldmVudCBnZXQgc3RvcmVkIGluIHRoZXNlIG1vZGVscy5cbiAqIGlmIG9uZSBvZiB0aGVtIGlzIG51bGwsIGl0J3MgYmVjYXVzZSB0aGVyZSBpcyBubyBvbmUgdGhhdCBuZWVkcyB0aGF0IGtpbmQgb2YgdXBkYXRlLlxuICogKi9cbmV4cG9ydCB0eXBlIENhbGVuZGFyTm90aWZpY2F0aW9uU2VuZE1vZGVscyA9IHtcblx0aW52aXRlTW9kZWw6IFNlbmRNYWlsTW9kZWwgfCBudWxsXG5cdHVwZGF0ZU1vZGVsOiBTZW5kTWFpbE1vZGVsIHwgbnVsbFxuXHRjYW5jZWxNb2RlbDogU2VuZE1haWxNb2RlbCB8IG51bGxcblx0cmVzcG9uc2VNb2RlbDogU2VuZE1haWxNb2RlbCB8IG51bGxcbn1cblxuLyoqIGNvbnRhaW5zIHRoZSBsb2dpYyB0byBkaXN0cmlidXRlIHRoZSBuZWNlc3NhcnkgdXBkYXRlcyB0byB3aG9tIGl0IG1heSBjb25jZXJuXG4gKiAgYW5kIGNoZWNrcyB0aGUgcHJlY29uZGl0aW9uc1xuICogKi9cbmV4cG9ydCBjbGFzcyBDYWxlbmRhck5vdGlmaWNhdGlvbk1vZGVsIHtcblx0Y29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBub3RpZmljYXRpb25TZW5kZXI6IENhbGVuZGFyTm90aWZpY2F0aW9uU2VuZGVyLCBwcml2YXRlIHJlYWRvbmx5IGxvZ2luQ29udHJvbGxlcjogTG9naW5Db250cm9sbGVyKSB7fVxuXG5cdC8qKlxuXHQgKiBzZW5kIGFsbCBub3RpZmljYXRpb25zIHJlcXVpcmVkIGZvciB0aGUgbmV3IGV2ZW50LCBkZXRlcm1pbmVkIGJ5IHRoZSBjb250ZW50cyBvZiB0aGUgc2VuZE1vZGVscyBwYXJhbWV0ZXIuXG5cdCAqXG5cdCAqIHdpbGwgbW9kaWZ5IHRoZSBhdHRlbmRlZSBsaXN0IG9mIG5ld0V2ZW50IGlmIGludml0ZXMvY2FuY2VsbGF0aW9ucyBhcmUgc2VudC5cblx0ICovXG5cdGFzeW5jIHNlbmQoZXZlbnQ6IENhbGVuZGFyRXZlbnQsIHJlY3VycmVuY2VJZHM6IEFycmF5PERhdGU+LCBzZW5kTW9kZWxzOiBDYWxlbmRhck5vdGlmaWNhdGlvblNlbmRNb2RlbHMpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRpZiAoc2VuZE1vZGVscy51cGRhdGVNb2RlbCA9PSBudWxsICYmIHNlbmRNb2RlbHMuY2FuY2VsTW9kZWwgPT0gbnVsbCAmJiBzZW5kTW9kZWxzLmludml0ZU1vZGVsID09IG51bGwgJiYgc2VuZE1vZGVscy5yZXNwb25zZU1vZGVsID09IG51bGwpIHtcblx0XHRcdHJldHVyblxuXHRcdH1cblx0XHRpZiAoXG5cdFx0XHQvLyBzZW5kaW5nIHJlc3BvbnNlcyBpcyBPSyBmb3IgZnJlZSB1c2Vycy5cblx0XHRcdChzZW5kTW9kZWxzLnVwZGF0ZU1vZGVsICE9IG51bGwgfHwgc2VuZE1vZGVscy5jYW5jZWxNb2RlbCAhPSBudWxsIHx8IHNlbmRNb2RlbHMuaW52aXRlTW9kZWwgIT0gbnVsbCkgJiZcblx0XHRcdCEoYXdhaXQgaGFzUGxhbldpdGhJbnZpdGVzKHRoaXMubG9naW5Db250cm9sbGVyKSlcblx0XHQpIHtcblx0XHRcdGNvbnN0IHsgZ2V0QXZhaWxhYmxlUGxhbnNXaXRoQ2FsZW5kYXJJbnZpdGVzIH0gPSBhd2FpdCBpbXBvcnQoXCIuLi8uLi8uLi8uLi9jb21tb24vc3Vic2NyaXB0aW9uL1N1YnNjcmlwdGlvblV0aWxzLmpzXCIpXG5cdFx0XHR0aHJvdyBuZXcgVXBncmFkZVJlcXVpcmVkRXJyb3IoXCJ1cGdyYWRlUmVxdWlyZWRfbXNnXCIsIGF3YWl0IGdldEF2YWlsYWJsZVBsYW5zV2l0aENhbGVuZGFySW52aXRlcygpKVxuXHRcdH1cblx0XHQvLyB3ZSBuZWVkIHRvIGV4Y2x1ZGUgdGhlIGV4Y2x1c2lvbnMgdGhhdCBhcmUgb25seSB0aGVyZSBiZWNhdXNlIG9mIGFsdGVyZWQgaW5zdGFuY2VzIHNwZWNpZmljYWxseVxuXHRcdC8vIHNvIGdvb2dsZSBjYWxlbmRhciBoYW5kbGVzIG91ciBpbnZpdGF0aW9uc1xuXHRcdGNvbnN0IHJlY3VycmVuY2VUaW1lcyA9IHJlY3VycmVuY2VJZHMubWFwKChkYXRlKSA9PiBkYXRlLmdldFRpbWUoKSlcblx0XHRjb25zdCBvcmlnaW5hbEV4Y2x1c2lvbnMgPSBldmVudC5yZXBlYXRSdWxlPy5leGNsdWRlZERhdGVzID8/IFtdXG5cdFx0Y29uc3QgZmlsdGVyZWRFeGNsdXNpb25zID0gb3JpZ2luYWxFeGNsdXNpb25zLmZpbHRlcigoeyBkYXRlIH0pID0+ICFyZWN1cnJlbmNlVGltZXMuaW5jbHVkZXMoZGF0ZS5nZXRUaW1lKCkpKVxuXHRcdGlmIChldmVudC5yZXBlYXRSdWxlICE9IG51bGwpIGV2ZW50LnJlcGVhdFJ1bGUuZXhjbHVkZWREYXRlcyA9IGZpbHRlcmVkRXhjbHVzaW9uc1xuXG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IGludml0ZVByb21pc2UgPSBzZW5kTW9kZWxzLmludml0ZU1vZGVsICE9IG51bGwgPyB0aGlzLnNlbmRJbnZpdGVzKGV2ZW50LCBzZW5kTW9kZWxzLmludml0ZU1vZGVsKSA6IFByb21pc2UucmVzb2x2ZSgpXG5cdFx0XHRjb25zdCBjYW5jZWxQcm9taXNlID0gc2VuZE1vZGVscy5jYW5jZWxNb2RlbCAhPSBudWxsID8gdGhpcy5zZW5kQ2FuY2VsbGF0aW9uKGV2ZW50LCBzZW5kTW9kZWxzLmNhbmNlbE1vZGVsKSA6IFByb21pc2UucmVzb2x2ZSgpXG5cdFx0XHRjb25zdCB1cGRhdGVQcm9taXNlID0gc2VuZE1vZGVscy51cGRhdGVNb2RlbCAhPSBudWxsID8gdGhpcy5zZW5kVXBkYXRlcyhldmVudCwgc2VuZE1vZGVscy51cGRhdGVNb2RlbCkgOiBQcm9taXNlLnJlc29sdmUoKVxuXHRcdFx0Y29uc3QgcmVzcG9uc2VQcm9taXNlID0gc2VuZE1vZGVscy5yZXNwb25zZU1vZGVsICE9IG51bGwgPyB0aGlzLnJlc3BvbmRUb09yZ2FuaXplcihldmVudCwgc2VuZE1vZGVscy5yZXNwb25zZU1vZGVsKSA6IFByb21pc2UucmVzb2x2ZSgpXG5cdFx0XHRhd2FpdCBQcm9taXNlLmFsbChbaW52aXRlUHJvbWlzZSwgY2FuY2VsUHJvbWlzZSwgdXBkYXRlUHJvbWlzZSwgcmVzcG9uc2VQcm9taXNlXSlcblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0aWYgKGV2ZW50LnJlcGVhdFJ1bGUgIT0gbnVsbCkgZXZlbnQucmVwZWF0UnVsZS5leGNsdWRlZERhdGVzID0gb3JpZ2luYWxFeGNsdXNpb25zXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIGludml0ZSBhbGwgbmV3IGF0dGVuZGVlcyBmb3IgYW4gZXZlbnQgYW5kIHNldCB0aGVpciBzdGF0dXMgZnJvbSBcIkFEREVEXCIgdG8gXCJORUVEU19BQ1RJT05cIlxuXHQgKiBAcGFyYW0gZXZlbnQgd2lsbCBiZSBtb2RpZmllZCBpZiBpbnZpdGVzIGFyZSBzZW50LlxuXHQgKiBAcGFyYW0gaW52aXRlTW9kZWxcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHByaXZhdGUgYXN5bmMgc2VuZEludml0ZXMoZXZlbnQ6IENhbGVuZGFyRXZlbnQsIGludml0ZU1vZGVsOiBTZW5kTWFpbE1vZGVsKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0aWYgKGV2ZW50Lm9yZ2FuaXplciA9PSBudWxsIHx8IGludml0ZU1vZGVsPy5hbGxSZWNpcGllbnRzKCkubGVuZ3RoID09PSAwKSB7XG5cdFx0XHR0aHJvdyBuZXcgUHJvZ3JhbW1pbmdFcnJvcihcImV2ZW50IGhhcyBubyBvcmdhbml6ZXIgb3Igbm8gaW52aXRhYmxlIGF0dGVuZGVlcywgY2FuJ3Qgc2VuZCBpbnZpdGVzLlwiKVxuXHRcdH1cblx0XHRjb25zdCBuZXdBdHRlbmRlZXMgPSBnZXROb25Pcmdhbml6ZXJBdHRlbmRlZXMoZXZlbnQpLmZpbHRlcigoYSkgPT4gYS5zdGF0dXMgPT09IENhbGVuZGFyQXR0ZW5kZWVTdGF0dXMuQURERUQpXG5cdFx0YXdhaXQgaW52aXRlTW9kZWwud2FpdEZvclJlc29sdmVkUmVjaXBpZW50cygpXG5cdFx0aWYgKGV2ZW50Lmludml0ZWRDb25maWRlbnRpYWxseSAhPSBudWxsKSB7XG5cdFx0XHRpbnZpdGVNb2RlbC5zZXRDb25maWRlbnRpYWwoZXZlbnQuaW52aXRlZENvbmZpZGVudGlhbGx5KVxuXHRcdH1cblx0XHRhd2FpdCB0aGlzLm5vdGlmaWNhdGlvblNlbmRlci5zZW5kSW52aXRlKGV2ZW50LCBpbnZpdGVNb2RlbClcblx0XHRmb3IgKGNvbnN0IGF0dGVuZGVlIG9mIG5ld0F0dGVuZGVlcykge1xuXHRcdFx0aWYgKGF0dGVuZGVlLnN0YXR1cyA9PT0gQ2FsZW5kYXJBdHRlbmRlZVN0YXR1cy5BRERFRCkge1xuXHRcdFx0XHRhdHRlbmRlZS5zdGF0dXMgPSBDYWxlbmRhckF0dGVuZGVlU3RhdHVzLk5FRURTX0FDVElPTlxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgc2VuZENhbmNlbGxhdGlvbihldmVudDogQ2FsZW5kYXJFdmVudCwgY2FuY2VsTW9kZWw6IFNlbmRNYWlsTW9kZWwpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCB1cGRhdGVkRXZlbnQgPSBjbG9uZShldmVudClcblxuXHRcdHRyeSB7XG5cdFx0XHRpZiAoZXZlbnQuaW52aXRlZENvbmZpZGVudGlhbGx5ICE9IG51bGwpIHtcblx0XHRcdFx0Y2FuY2VsTW9kZWwuc2V0Q29uZmlkZW50aWFsKGV2ZW50Lmludml0ZWRDb25maWRlbnRpYWxseSlcblx0XHRcdH1cblx0XHRcdGF3YWl0IHRoaXMubm90aWZpY2F0aW9uU2VuZGVyLnNlbmRDYW5jZWxsYXRpb24odXBkYXRlZEV2ZW50LCBjYW5jZWxNb2RlbClcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRpZiAoZSBpbnN0YW5jZW9mIFRvb01hbnlSZXF1ZXN0c0Vycm9yKSB7XG5cdFx0XHRcdHRocm93IG5ldyBVc2VyRXJyb3IoXCJtYWlsQWRkcmVzc0RlbGF5X21zZ1wiKSAvLyBUaGlzIHdpbGwgYmUgY2F1Z2h0IGFuZCBvcGVuIGVycm9yIGRpYWxvZ1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhyb3cgZVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgc2VuZFVwZGF0ZXMoZXZlbnQ6IENhbGVuZGFyRXZlbnQsIHVwZGF0ZU1vZGVsOiBTZW5kTWFpbE1vZGVsKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0YXdhaXQgdXBkYXRlTW9kZWwud2FpdEZvclJlc29sdmVkUmVjaXBpZW50cygpXG5cdFx0aWYgKGV2ZW50Lmludml0ZWRDb25maWRlbnRpYWxseSAhPSBudWxsKSB7XG5cdFx0XHR1cGRhdGVNb2RlbC5zZXRDb25maWRlbnRpYWwoZXZlbnQuaW52aXRlZENvbmZpZGVudGlhbGx5KVxuXHRcdH1cblx0XHRhd2FpdCB0aGlzLm5vdGlmaWNhdGlvblNlbmRlci5zZW5kVXBkYXRlKGV2ZW50LCB1cGRhdGVNb2RlbClcblx0fVxuXG5cdC8qKlxuXHQgKiBzZW5kIGEgcmVzcG9uc2UgbWFpbCB0byB0aGUgb3JnYW5pemVyIGFzIHN0YXRlZCBvbiB0aGUgb3JpZ2luYWwgZXZlbnQuIGNhbGxpbmcgdGhpcyBmb3IgYW4gZXZlbnQgdGhhdCBpcyBub3QgYW4gaW52aXRlIG9yXG5cdCAqIGRvZXMgbm90IGNvbnRhaW4gYWRkcmVzcyBhcyBhbiBhdHRlbmRlZSBvciB0aGF0IGhhcyBubyBvcmdhbml6ZXIgaXMgYW4gZXJyb3IuXG5cdCAqIEBwYXJhbSBuZXdFdmVudCB0aGUgZXZlbnQgdG8gc2VuZCB0aGUgdXBkYXRlIGZvciwgdGhpcyBzaG91bGQgYmUgaWRlbnRpY2FsIHRvIGV4aXN0aW5nRXZlbnQgZXhjZXB0IGZvciB0aGUgb3duIHN0YXR1cy5cblx0ICogQHBhcmFtIHJlc3BvbnNlTW9kZWxcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHByaXZhdGUgYXN5bmMgcmVzcG9uZFRvT3JnYW5pemVyKG5ld0V2ZW50OiBDYWxlbmRhckV2ZW50LCByZXNwb25zZU1vZGVsOiBTZW5kTWFpbE1vZGVsKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0YXdhaXQgcmVzcG9uc2VNb2RlbC53YWl0Rm9yUmVzb2x2ZWRSZWNpcGllbnRzKClcblx0XHRpZiAobmV3RXZlbnQuaW52aXRlZENvbmZpZGVudGlhbGx5ICE9IG51bGwpIHtcblx0XHRcdHJlc3BvbnNlTW9kZWwuc2V0Q29uZmlkZW50aWFsKG5ld0V2ZW50Lmludml0ZWRDb25maWRlbnRpYWxseSlcblx0XHR9XG5cblx0XHRhd2FpdCB0aGlzLm5vdGlmaWNhdGlvblNlbmRlci5zZW5kUmVzcG9uc2UobmV3RXZlbnQsIHJlc3BvbnNlTW9kZWwpXG5cdFx0cmVzcG9uc2VNb2RlbC5kaXNwb3NlKClcblx0fVxufVxuXG4vKiogZGV0ZXJtaW5lIGlmIHdlIHNob3VsZCBzaG93IHRoZSBcInNlbmRpbmcgaW52aXRlcyBpcyBub3QgYXZhaWxhYmxlIGZvciB5b3VyIHBsYW4sIHBsZWFzZSB1cGdyYWRlXCIgZGlhbG9nXG4gKiB0byB0aGUgY3VycmVudGx5IGxvZ2dlZCBpbiB1c2VyLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFzUGxhbldpdGhJbnZpdGVzKGxvZ2luQ29udHJvbGxlcjogTG9naW5Db250cm9sbGVyKTogUHJvbWlzZTxib29sZWFuPiB7XG5cdGNvbnN0IHVzZXJDb250cm9sbGVyID0gbG9naW5Db250cm9sbGVyLmdldFVzZXJDb250cm9sbGVyKClcblx0Y29uc3QgeyB1c2VyIH0gPSB1c2VyQ29udHJvbGxlclxuXHRpZiAodXNlci5hY2NvdW50VHlwZSA9PT0gQWNjb3VudFR5cGUuRlJFRSB8fCB1c2VyLmFjY291bnRUeXBlID09PSBBY2NvdW50VHlwZS5FWFRFUk5BTCkge1xuXHRcdHJldHVybiBmYWxzZVxuXHR9XG5cblx0Y29uc3QgY3VzdG9tZXIgPSBhd2FpdCBsb2dpbkNvbnRyb2xsZXIuZ2V0VXNlckNvbnRyb2xsZXIoKS5sb2FkQ3VzdG9tZXIoKVxuXG5cdHJldHVybiAoYXdhaXQgdXNlckNvbnRyb2xsZXIuZ2V0UGxhbkNvbmZpZygpKS5ldmVudEludml0ZXNcbn1cbiIsIi8qKlxuICogdGhpcyBmaWxlIGNvbnRhaW5zIHRoZSBzdHJhdGVnaWVzIHVzZWQgdG8gY3JlYXRlLCBlZGl0IGFuZCBkZWxldGUgY2FsZW5kYXIgZXZlbnRzIHVuZGVyIGRpZmZlcmVudCBzY2VuYXJpb3MuXG4gKiB0aGUgc2NlbmFyaW9zIGFyZSBtb3N0bHkgZGl2aWRlZCBpbnRvIGRlY2lkaW5nIHRoZSB0eXBlIG9mIG9wZXJhdGlvbiAoZWRpdCwgZGVsZXRlLCBjcmVhdGUpXG4gKiBhbmQgdGhlIHNjb3BlIG9mIHRoZSBvcGVyYXRpb24gKG9ubHkgdGhlIGNsaWNrZWQgaW5zdGFuY2Ugb3IgYWxsIGluc3RhbmNlcylcbiAqICovXG5pbXBvcnQgeyBDYWxlbmRhckV2ZW50IH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9hcGkvZW50aXRpZXMvdHV0YW5vdGEvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgYXNzZXJ0RXZlbnRWYWxpZGl0eSwgQ2FsZW5kYXJNb2RlbCB9IGZyb20gXCIuLi8uLi9tb2RlbC9DYWxlbmRhck1vZGVsLmpzXCJcbmltcG9ydCB7IENhbGVuZGFyTm90aWZpY2F0aW9uTW9kZWwgfSBmcm9tIFwiLi9DYWxlbmRhck5vdGlmaWNhdGlvbk1vZGVsLmpzXCJcbmltcG9ydCB7IGFzc2VydE5vdE51bGwsIGlkZW50aXR5IH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5pbXBvcnQgeyBnZW5lcmF0ZVVpZCB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vY2FsZW5kYXIvZGF0ZS9DYWxlbmRhclV0aWxzLmpzXCJcbmltcG9ydCB7XG5cdGFzc2VtYmxlQ2FsZW5kYXJFdmVudEVkaXRSZXN1bHQsXG5cdGFzc2VtYmxlRWRpdFJlc3VsdEFuZEFzc2lnbkZyb21FeGlzdGluZyxcblx0YXNzaWduRXZlbnRJZGVudGl0eSxcblx0Q2FsZW5kYXJFdmVudEVkaXRNb2RlbHMsXG5cdENhbGVuZGFyT3BlcmF0aW9uLFxuXHRTaG93UHJvZ3Jlc3NDYWxsYmFjayxcbn0gZnJvbSBcIi4vQ2FsZW5kYXJFdmVudE1vZGVsLmpzXCJcbmltcG9ydCB7IExvZ2luQ29udHJvbGxlciB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vYXBpL21haW4vTG9naW5Db250cm9sbGVyLmpzXCJcbmltcG9ydCB7IERhdGVUaW1lIH0gZnJvbSBcImx1eG9uXCJcbmltcG9ydCB7IFJlY2lwaWVudEZpZWxkIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9tYWlsRnVuY3Rpb25hbGl0eS9TaGFyZWRNYWlsVXRpbHMuanNcIlxuXG4vKiogd2hlbiBzdGFydGluZyBhbiBlZGl0IG9yIGRlbGV0ZSBvcGVyYXRpb24gb2YgYW4gZXZlbnQsIHdlXG4gKiBuZWVkIHRvIGtub3cgaG93IHRvIGFwcGx5IGl0IGFuZCB3aGV0aGVyIHRvIHNlbmQgdXBkYXRlcy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ2FsZW5kYXJFdmVudE1vZGVsU3RyYXRlZ3kge1xuXHQvKiogYXBwbHkgdGhlIGNoYW5nZXMgdG8gdGhlIHNlcnZlciBhbmQgbm90aWZ5IGF0dGVuZGVlcyAqL1xuXHRhcHBseSgpOiBQcm9taXNlPHZvaWQ+XG5cblx0LyoqIGNoZWNrIGlmIHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBvcGVyYXRpb24gd291bGQgY2F1c2UgdXBkYXRlcyB0byBiZSBzZW50Ki9cblx0bWF5UmVxdWlyZVNlbmRpbmdVcGRhdGVzKCk6IGJvb2xlYW5cblxuXHRlZGl0TW9kZWxzOiBDYWxlbmRhckV2ZW50RWRpdE1vZGVsc1xufVxuXG4vKiogc3RyYXRlZ2llcyB0byBhcHBseSBjYWxlbmRhciBvcGVyYXRpb25zIHdpdGggc29tZSBjb21tb24gc2V0dXAgKi9cbmV4cG9ydCBjbGFzcyBDYWxlbmRhckV2ZW50QXBwbHlTdHJhdGVnaWVzIHtcblx0Y29uc3RydWN0b3IoXG5cdFx0cHJpdmF0ZSByZWFkb25seSBjYWxlbmRhck1vZGVsOiBDYWxlbmRhck1vZGVsLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgbG9naW5zOiBMb2dpbkNvbnRyb2xsZXIsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBub3RpZmljYXRpb25Nb2RlbDogQ2FsZW5kYXJOb3RpZmljYXRpb25Nb2RlbCxcblx0XHRwcml2YXRlIHJlYWRvbmx5IGxhenlSZWN1cnJlbmNlSWRzOiAodWlkPzogc3RyaW5nIHwgbnVsbCkgPT4gUHJvbWlzZTxBcnJheTxEYXRlPj4sXG5cdFx0cHJpdmF0ZSByZWFkb25seSBzaG93UHJvZ3Jlc3M6IFNob3dQcm9ncmVzc0NhbGxiYWNrID0gaWRlbnRpdHksXG5cdFx0cHJpdmF0ZSByZWFkb25seSB6b25lOiBzdHJpbmcsXG5cdCkge31cblxuXHQvKipcblx0ICogc2F2ZSBhIG5ldyBldmVudCB0byB0aGUgc2VsZWN0ZWQgY2FsZW5kYXIsIGludml0ZSBhbGwgYXR0ZW5kZWVzIGV4Y2VwdCBmb3IgdGhlIG9yZ2FuaXplciBhbmQgc2V0IHVwIGFsYXJtcy5cblx0ICovXG5cdGFzeW5jIHNhdmVOZXdFdmVudChlZGl0TW9kZWxzOiBDYWxlbmRhckV2ZW50RWRpdE1vZGVscyk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IHsgZXZlbnRWYWx1ZXMsIG5ld0FsYXJtcywgc2VuZE1vZGVscywgY2FsZW5kYXIgfSA9IGFzc2VtYmxlQ2FsZW5kYXJFdmVudEVkaXRSZXN1bHQoZWRpdE1vZGVscylcblx0XHRjb25zdCB1aWQgPSBnZW5lcmF0ZVVpZChjYWxlbmRhci5ncm91cC5faWQsIERhdGUubm93KCkpXG5cdFx0Y29uc3QgbmV3RXZlbnQgPSBhc3NpZ25FdmVudElkZW50aXR5KGV2ZW50VmFsdWVzLCB7IHVpZCB9KVxuXHRcdGFzc2VydEV2ZW50VmFsaWRpdHkobmV3RXZlbnQpXG5cdFx0Y29uc3QgeyBncm91cFJvb3QgfSA9IGNhbGVuZGFyXG5cblx0XHRhd2FpdCB0aGlzLnNob3dQcm9ncmVzcyhcblx0XHRcdChhc3luYyAoKSA9PiB7XG5cdFx0XHRcdGF3YWl0IHRoaXMubm90aWZpY2F0aW9uTW9kZWwuc2VuZChuZXdFdmVudCwgW10sIHNlbmRNb2RlbHMpXG5cdFx0XHRcdGF3YWl0IHRoaXMuY2FsZW5kYXJNb2RlbC5jcmVhdGVFdmVudChuZXdFdmVudCwgbmV3QWxhcm1zLCB0aGlzLnpvbmUsIGdyb3VwUm9vdClcblx0XHRcdH0pKCksXG5cdFx0KVxuXHR9XG5cblx0LyoqIGFsbCBpbnN0YW5jZXMgb2YgYW4gZXZlbnQgd2lsbCBiZSB1cGRhdGVkLiBpZiB0aGUgcmVjdXJyZW5jZUlkcyBhcmUgaW52YWxpZGF0ZWQgKHJydWxlIG9yIHN0YXJ0VGltZSBjaGFuZ2VkKSxcblx0ICogd2lsbCBkZWxldGUgYWxsIGFsdGVyZWQgaW5zdGFuY2VzIGFuZCBleGNsdXNpb25zLiAqL1xuXHRhc3luYyBzYXZlRW50aXJlRXhpc3RpbmdFdmVudChlZGl0TW9kZWxzRm9yUHJvZ2VuaXRvcjogQ2FsZW5kYXJFdmVudEVkaXRNb2RlbHMsIGV4aXN0aW5nRXZlbnQ6IENhbGVuZGFyRXZlbnQpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCB1aWQgPSBhc3NlcnROb3ROdWxsKGV4aXN0aW5nRXZlbnQudWlkLCBcIm5vIHVpZCB0byB1cGRhdGUgZXhpc3RpbmcgZXZlbnRcIilcblx0XHRhc3NlcnROb3ROdWxsKGV4aXN0aW5nRXZlbnQ/Ll9pZCwgXCJubyBpZCB0byB1cGRhdGUgZXhpc3RpbmcgZXZlbnRcIilcblx0XHRhc3NlcnROb3ROdWxsKGV4aXN0aW5nRXZlbnQ/Ll9vd25lckdyb3VwLCBcIm5vIG93bmVyR3JvdXAgdG8gdXBkYXRlIGV4aXN0aW5nIGV2ZW50XCIpXG5cdFx0YXNzZXJ0Tm90TnVsbChleGlzdGluZ0V2ZW50Py5fcGVybWlzc2lvbnMsIFwibm8gcGVybWlzc2lvbnMgdG8gdXBkYXRlIGV4aXN0aW5nIGV2ZW50XCIpXG5cblx0XHRjb25zdCB7IG5ld0V2ZW50LCBjYWxlbmRhciwgbmV3QWxhcm1zLCBzZW5kTW9kZWxzIH0gPSBhc3NlbWJsZUVkaXRSZXN1bHRBbmRBc3NpZ25Gcm9tRXhpc3RpbmcoXG5cdFx0XHRleGlzdGluZ0V2ZW50LFxuXHRcdFx0ZWRpdE1vZGVsc0ZvclByb2dlbml0b3IsXG5cdFx0XHRDYWxlbmRhck9wZXJhdGlvbi5FZGl0QWxsLFxuXHRcdClcblx0XHRjb25zdCB7IGdyb3VwUm9vdCB9ID0gY2FsZW5kYXJcblx0XHRhd2FpdCB0aGlzLnNob3dQcm9ncmVzcyhcblx0XHRcdChhc3luYyAoKSA9PiB7XG5cdFx0XHRcdGNvbnN0IHJlY3VycmVuY2VJZHM6IEFycmF5PERhdGU+ID0gYXdhaXQgdGhpcy5sYXp5UmVjdXJyZW5jZUlkcyh1aWQpXG5cdFx0XHRcdGF3YWl0IHRoaXMubm90aWZpY2F0aW9uTW9kZWwuc2VuZChuZXdFdmVudCwgcmVjdXJyZW5jZUlkcywgc2VuZE1vZGVscylcblx0XHRcdFx0YXdhaXQgdGhpcy5jYWxlbmRhck1vZGVsLnVwZGF0ZUV2ZW50KG5ld0V2ZW50LCBuZXdBbGFybXMsIHRoaXMuem9uZSwgZ3JvdXBSb290LCBleGlzdGluZ0V2ZW50KVxuXHRcdFx0XHRjb25zdCBpbnZhbGlkYXRlQWx0ZXJlZEluc3RhbmNlcyA9IG5ld0V2ZW50LnJlcGVhdFJ1bGUgJiYgbmV3RXZlbnQucmVwZWF0UnVsZS5leGNsdWRlZERhdGVzLmxlbmd0aCA9PT0gMFxuXG5cdFx0XHRcdGNvbnN0IG5ld0R1cmF0aW9uID0gZWRpdE1vZGVsc0ZvclByb2dlbml0b3Iud2hlbk1vZGVsLmR1cmF0aW9uXG5cdFx0XHRcdGNvbnN0IGluZGV4ID0gYXdhaXQgdGhpcy5jYWxlbmRhck1vZGVsLmdldEV2ZW50c0J5VWlkKHVpZClcblx0XHRcdFx0aWYgKGluZGV4ID09IG51bGwpIHJldHVyblxuXG5cdFx0XHRcdC8vIG5vdGU6IGlmIHdlIGV2ZXIgYWxsb3cgZWRpdGluZyBndWVzdHMgc2VwYXJhdGVseSwgd2UgbmVlZCB0byB1cGRhdGUgdGhpcyB0byBub3QgdXNlIHRoZVxuXHRcdFx0XHQvLyBub3RlOiBwcm9nZW5pdG9yIGVkaXQgbW9kZWxzIHNpbmNlIHRoZSBndWVzdCBsaXN0IG1pZ2h0IGJlIGRpZmZlcmVudCBmcm9tIHRoZSBpbnN0YW5jZVxuXHRcdFx0XHQvLyBub3RlOiB3ZSdyZSBsb29raW5nIGF0LlxuXHRcdFx0XHRmb3IgKGNvbnN0IG9jY3VycmVuY2Ugb2YgaW5kZXguYWx0ZXJlZEluc3RhbmNlcykge1xuXHRcdFx0XHRcdGlmIChpbnZhbGlkYXRlQWx0ZXJlZEluc3RhbmNlcykge1xuXHRcdFx0XHRcdFx0ZWRpdE1vZGVsc0ZvclByb2dlbml0b3Iud2hvTW9kZWwuc2hvdWxkU2VuZFVwZGF0ZXMgPSB0cnVlXG5cdFx0XHRcdFx0XHRjb25zdCB7IHNlbmRNb2RlbHMgfSA9IGFzc2VtYmxlRWRpdFJlc3VsdEFuZEFzc2lnbkZyb21FeGlzdGluZyhvY2N1cnJlbmNlLCBlZGl0TW9kZWxzRm9yUHJvZ2VuaXRvciwgQ2FsZW5kYXJPcGVyYXRpb24uRWRpdFRoaXMpXG5cdFx0XHRcdFx0XHQvLyBpbiBjYXNlcyB3aGVyZSBndWVzdHMgd2VyZSByZW1vdmVkIGFuZCB0aGUgc3RhcnQgdGltZS9yZXBlYXQgcnVsZSBjaGFuZ2VkLCB3ZSBtaWdodFxuXHRcdFx0XHRcdFx0Ly8gaGF2ZSBib3RoIGEgY2FuY2VsIG1vZGVsIChjb250YWluaW5nIHRoZSByZW1vdmVkIHJlY2lwaWVudHMpIGFuZCBhbiB1cGRhdGUgbW9kZWwgKHRoZSByZXN0KVxuXHRcdFx0XHRcdFx0Ly8gd2UncmUgY29weWluZyBhbGwgb2YgdGhlbSB0byBjYW5jZWwgaWYgdGhlIGFsdGVyZWQgaW5zdGFuY2VzIHdlcmUgaW52YWxpZGF0ZWQsIHNpbmNlIHRoZVxuXHRcdFx0XHRcdFx0Ly8gdXBkYXRlIChhbmQgaW52aXRlIGZvciB0aGF0IG1hdHRlcikgaXMgaXJyZWxldmFudCBmb3IgdGhvc2UgaW5zdGFuY2VzLlxuXHRcdFx0XHRcdFx0Zm9yIChjb25zdCByZWNpcGllbnQgb2Ygc2VuZE1vZGVscy5jYW5jZWxNb2RlbD8uYWxsUmVjaXBpZW50cygpID8/IFtdKSB7XG5cdFx0XHRcdFx0XHRcdHNlbmRNb2RlbHMudXBkYXRlTW9kZWw/LmFkZFJlY2lwaWVudChSZWNpcGllbnRGaWVsZC5CQ0MsIHJlY2lwaWVudClcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHNlbmRNb2RlbHMuY2FuY2VsTW9kZWwgPSBzZW5kTW9kZWxzLnVwZGF0ZU1vZGVsXG5cdFx0XHRcdFx0XHRzZW5kTW9kZWxzLnVwZGF0ZU1vZGVsID0gbnVsbFxuXHRcdFx0XHRcdFx0c2VuZE1vZGVscy5pbnZpdGVNb2RlbCA9IG51bGxcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMubm90aWZpY2F0aW9uTW9kZWwuc2VuZChvY2N1cnJlbmNlLCBbXSwgc2VuZE1vZGVscylcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMuY2FsZW5kYXJNb2RlbC5kZWxldGVFdmVudChvY2N1cnJlbmNlKVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRjb25zdCB7IG5ld0V2ZW50LCBuZXdBbGFybXMsIHNlbmRNb2RlbHMgfSA9IGFzc2VtYmxlRWRpdFJlc3VsdEFuZEFzc2lnbkZyb21FeGlzdGluZyhcblx0XHRcdFx0XHRcdFx0b2NjdXJyZW5jZSxcblx0XHRcdFx0XHRcdFx0ZWRpdE1vZGVsc0ZvclByb2dlbml0b3IsXG5cdFx0XHRcdFx0XHRcdENhbGVuZGFyT3BlcmF0aW9uLkVkaXRUaGlzLFxuXHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0Ly8gd2UgbmVlZCB0byB1c2UgdGhlIHRpbWUgd2UgaGFkIGJlZm9yZSwgbm90IHRoZSB0aW1lIG9mIHRoZSBwcm9nZW5pdG9yICh3aGljaCBkaWQgbm90IGNoYW5nZSBzaW5jZSB3ZSBzdGlsbCBoYXZlIGFsdGVyZWQgb2NjdXJyZW5jZXMpXG5cdFx0XHRcdFx0XHRuZXdFdmVudC5zdGFydFRpbWUgPSBvY2N1cnJlbmNlLnN0YXJ0VGltZVxuXHRcdFx0XHRcdFx0bmV3RXZlbnQuZW5kVGltZSA9IERhdGVUaW1lLmZyb21KU0RhdGUobmV3RXZlbnQuc3RhcnRUaW1lLCB7IHpvbmU6IHRoaXMuem9uZSB9KS5wbHVzKG5ld0R1cmF0aW9uKS50b0pTRGF0ZSgpXG5cdFx0XHRcdFx0XHQvLyBhbHRlcmVkIGluc3RhbmNlcyBuZXZlciBoYXZlIGEgcmVwZWF0IHJ1bGVcblx0XHRcdFx0XHRcdG5ld0V2ZW50LnJlcGVhdFJ1bGUgPSBudWxsXG5cdFx0XHRcdFx0XHRhd2FpdCB0aGlzLm5vdGlmaWNhdGlvbk1vZGVsLnNlbmQobmV3RXZlbnQsIFtdLCBzZW5kTW9kZWxzKVxuXHRcdFx0XHRcdFx0YXdhaXQgdGhpcy5jYWxlbmRhck1vZGVsLnVwZGF0ZUV2ZW50KG5ld0V2ZW50LCBuZXdBbGFybXMsIHRoaXMuem9uZSwgZ3JvdXBSb290LCBvY2N1cnJlbmNlKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSkoKSxcblx0XHQpXG5cdH1cblxuXHRhc3luYyBzYXZlTmV3QWx0ZXJlZEluc3RhbmNlKHtcblx0XHRlZGl0TW9kZWxzLFxuXHRcdGVkaXRNb2RlbHNGb3JQcm9nZW5pdG9yLFxuXHRcdGV4aXN0aW5nSW5zdGFuY2UsXG5cdFx0cHJvZ2VuaXRvcixcblx0fToge1xuXHRcdGVkaXRNb2RlbHM6IENhbGVuZGFyRXZlbnRFZGl0TW9kZWxzXG5cdFx0ZWRpdE1vZGVsc0ZvclByb2dlbml0b3I6IENhbGVuZGFyRXZlbnRFZGl0TW9kZWxzXG5cdFx0ZXhpc3RpbmdJbnN0YW5jZTogQ2FsZW5kYXJFdmVudFxuXHRcdHByb2dlbml0b3I6IENhbGVuZGFyRXZlbnRcblx0fSkge1xuXHRcdGF3YWl0IHRoaXMuc2hvd1Byb2dyZXNzKFxuXHRcdFx0KGFzeW5jICgpID0+IHtcblx0XHRcdFx0Ly8gTkVXOiBlZGl0IG1vZGVscyB0aGF0IHdlIHVzZWQgc28gZmFyIGFyZSBmb3IgdGhlIG5ldyBldmVudCAocmVzY2hlZHVsZWQgb25lKS4gdGhpcyBzaG91bGQgYmUgYW4gaW52aXRlLlxuXHRcdFx0XHRjb25zdCB7IG5ld0V2ZW50LCBjYWxlbmRhciwgbmV3QWxhcm1zLCBzZW5kTW9kZWxzIH0gPSBhc3NlbWJsZUVkaXRSZXN1bHRBbmRBc3NpZ25Gcm9tRXhpc3RpbmcoXG5cdFx0XHRcdFx0ZXhpc3RpbmdJbnN0YW5jZSxcblx0XHRcdFx0XHRlZGl0TW9kZWxzLFxuXHRcdFx0XHRcdENhbGVuZGFyT3BlcmF0aW9uLkVkaXRUaGlzLFxuXHRcdFx0XHQpXG5cdFx0XHRcdGF3YWl0IHRoaXMubm90aWZpY2F0aW9uTW9kZWwuc2VuZChuZXdFdmVudCwgW10sIHNlbmRNb2RlbHMpXG5cblx0XHRcdFx0Ly8gT0xEOiBidXQgd2UgbmVlZCB0byB1cGRhdGUgdGhlIGV4aXN0aW5nIG9uZSBhcyB3ZWxsLCB0byBhZGQgYW4gZXhjbHVzaW9uIGZvciB0aGUgb3JpZ2luYWwgaW5zdGFuY2UgdGhhdCB3ZSBlZGl0ZWQuXG5cdFx0XHRcdGVkaXRNb2RlbHNGb3JQcm9nZW5pdG9yLndob01vZGVsLnNob3VsZFNlbmRVcGRhdGVzID0gdHJ1ZVxuXHRcdFx0XHRlZGl0TW9kZWxzRm9yUHJvZ2VuaXRvci53aGVuTW9kZWwuZXhjbHVkZURhdGUoZXhpc3RpbmdJbnN0YW5jZS5zdGFydFRpbWUpXG5cdFx0XHRcdGNvbnN0IHtcblx0XHRcdFx0XHRuZXdFdmVudDogbmV3UHJvZ2VuaXRvcixcblx0XHRcdFx0XHRzZW5kTW9kZWxzOiBwcm9nZW5pdG9yU2VuZE1vZGVscyxcblx0XHRcdFx0XHRuZXdBbGFybXM6IHByb2dlbml0b3JBbGFybXMsXG5cdFx0XHRcdH0gPSBhc3NlbWJsZUVkaXRSZXN1bHRBbmRBc3NpZ25Gcm9tRXhpc3RpbmcocHJvZ2VuaXRvciwgZWRpdE1vZGVsc0ZvclByb2dlbml0b3IsIENhbGVuZGFyT3BlcmF0aW9uLkVkaXRBbGwpXG5cdFx0XHRcdGNvbnN0IHJlY3VycmVuY2VJZHMgPSBhd2FpdCB0aGlzLmxhenlSZWN1cnJlbmNlSWRzKHByb2dlbml0b3IudWlkKVxuXHRcdFx0XHRyZWN1cnJlbmNlSWRzLnB1c2goZXhpc3RpbmdJbnN0YW5jZS5zdGFydFRpbWUpXG5cdFx0XHRcdGF3YWl0IHRoaXMubm90aWZpY2F0aW9uTW9kZWwuc2VuZChuZXdQcm9nZW5pdG9yLCByZWN1cnJlbmNlSWRzLCBwcm9nZW5pdG9yU2VuZE1vZGVscylcblx0XHRcdFx0YXdhaXQgdGhpcy5jYWxlbmRhck1vZGVsLnVwZGF0ZUV2ZW50KG5ld1Byb2dlbml0b3IsIHByb2dlbml0b3JBbGFybXMsIHRoaXMuem9uZSwgY2FsZW5kYXIuZ3JvdXBSb290LCBwcm9nZW5pdG9yKVxuXG5cdFx0XHRcdC8vIE5FV1xuXHRcdFx0XHRjb25zdCB7IGdyb3VwUm9vdCB9ID0gY2FsZW5kYXJcblx0XHRcdFx0YXdhaXQgdGhpcy5jYWxlbmRhck1vZGVsLmNyZWF0ZUV2ZW50KG5ld0V2ZW50LCBuZXdBbGFybXMsIHRoaXMuem9uZSwgZ3JvdXBSb290KVxuXHRcdFx0fSkoKSxcblx0XHQpXG5cdH1cblxuXHRhc3luYyBzYXZlRXhpc3RpbmdBbHRlcmVkSW5zdGFuY2UoZWRpdE1vZGVsczogQ2FsZW5kYXJFdmVudEVkaXRNb2RlbHMsIGV4aXN0aW5nSW5zdGFuY2U6IENhbGVuZGFyRXZlbnQpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCB7IG5ld0V2ZW50LCBjYWxlbmRhciwgbmV3QWxhcm1zLCBzZW5kTW9kZWxzIH0gPSBhc3NlbWJsZUVkaXRSZXN1bHRBbmRBc3NpZ25Gcm9tRXhpc3RpbmcoZXhpc3RpbmdJbnN0YW5jZSwgZWRpdE1vZGVscywgQ2FsZW5kYXJPcGVyYXRpb24uRWRpdFRoaXMpXG5cdFx0Y29uc3QgeyBncm91cFJvb3QgfSA9IGNhbGVuZGFyXG5cdFx0YXdhaXQgdGhpcy5zaG93UHJvZ3Jlc3MoXG5cdFx0XHQoYXN5bmMgKCkgPT4ge1xuXHRcdFx0XHRhd2FpdCB0aGlzLm5vdGlmaWNhdGlvbk1vZGVsLnNlbmQobmV3RXZlbnQsIFtdLCBzZW5kTW9kZWxzKVxuXHRcdFx0XHRhd2FpdCB0aGlzLmNhbGVuZGFyTW9kZWwudXBkYXRlRXZlbnQobmV3RXZlbnQsIG5ld0FsYXJtcywgdGhpcy56b25lLCBncm91cFJvb3QsIGV4aXN0aW5nSW5zdGFuY2UpXG5cdFx0XHR9KSgpLFxuXHRcdClcblx0fVxuXG5cdC8qKiBkZWxldGUgYSB3aG9sZSBldmVudCBhbmQgYWxsIHRoZSBpbnN0YW5jZXMgZ2VuZXJhdGVkIGJ5IGl0ICovXG5cdGFzeW5jIGRlbGV0ZUVudGlyZUV4aXN0aW5nRXZlbnQoZWRpdE1vZGVsczogQ2FsZW5kYXJFdmVudEVkaXRNb2RlbHMsIGV4aXN0aW5nRXZlbnQ6IENhbGVuZGFyRXZlbnQpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRlZGl0TW9kZWxzLndob01vZGVsLnNob3VsZFNlbmRVcGRhdGVzID0gdHJ1ZVxuXHRcdGNvbnN0IHsgc2VuZE1vZGVscyB9ID0gYXNzZW1ibGVDYWxlbmRhckV2ZW50RWRpdFJlc3VsdChlZGl0TW9kZWxzKVxuXHRcdGF3YWl0IHRoaXMuc2hvd1Byb2dyZXNzKFxuXHRcdFx0KGFzeW5jICgpID0+IHtcblx0XHRcdFx0Y29uc3QgYWx0ZXJlZE9jY3VycmVuY2VzID0gYXdhaXQgdGhpcy5jYWxlbmRhck1vZGVsLmdldEV2ZW50c0J5VWlkKGFzc2VydE5vdE51bGwoZXhpc3RpbmdFdmVudC51aWQpKVxuXHRcdFx0XHRpZiAoYWx0ZXJlZE9jY3VycmVuY2VzKSB7XG5cdFx0XHRcdFx0Zm9yIChjb25zdCBvY2N1cnJlbmNlIG9mIGFsdGVyZWRPY2N1cnJlbmNlcy5hbHRlcmVkSW5zdGFuY2VzKSB7XG5cdFx0XHRcdFx0XHRpZiAob2NjdXJyZW5jZS5hdHRlbmRlZXMubGVuZ3RoID09PSAwKSBjb250aW51ZVxuXHRcdFx0XHRcdFx0Y29uc3QgeyBzZW5kTW9kZWxzIH0gPSBhc3NlbWJsZUVkaXRSZXN1bHRBbmRBc3NpZ25Gcm9tRXhpc3Rpbmcob2NjdXJyZW5jZSwgZWRpdE1vZGVscywgQ2FsZW5kYXJPcGVyYXRpb24uRGVsZXRlQWxsKVxuXHRcdFx0XHRcdFx0c2VuZE1vZGVscy5jYW5jZWxNb2RlbCA9IHNlbmRNb2RlbHMudXBkYXRlTW9kZWxcblx0XHRcdFx0XHRcdHNlbmRNb2RlbHMudXBkYXRlTW9kZWwgPSBudWxsXG5cdFx0XHRcdFx0XHRhd2FpdCB0aGlzLm5vdGlmaWNhdGlvbk1vZGVsLnNlbmQob2NjdXJyZW5jZSwgW10sIHNlbmRNb2RlbHMpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0c2VuZE1vZGVscy5jYW5jZWxNb2RlbCA9IHNlbmRNb2RlbHMudXBkYXRlTW9kZWxcblx0XHRcdFx0c2VuZE1vZGVscy51cGRhdGVNb2RlbCA9IG51bGxcblx0XHRcdFx0YXdhaXQgdGhpcy5ub3RpZmljYXRpb25Nb2RlbC5zZW5kKGV4aXN0aW5nRXZlbnQsIFtdLCBzZW5kTW9kZWxzKVxuXHRcdFx0XHRpZiAoZXhpc3RpbmdFdmVudC51aWQgIT0gbnVsbCkge1xuXHRcdFx0XHRcdGF3YWl0IHRoaXMuY2FsZW5kYXJNb2RlbC5kZWxldGVFdmVudHNCeVVpZChleGlzdGluZ0V2ZW50LnVpZClcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBkb2luZyB0aGlzIGV4cGxpY2l0bHkgYmVjYXVzZSB3ZSBtaWdodCBoYXZlIGNsaWNrZWQgYW4gZXZlbnQgdGhhdCdzIG5vdCBsaXN0ZWQgaW5cblx0XHRcdFx0Ly8gdGhlIHVpZCBpbmRleCBmb3Igc29tZSByZWFzb24uIHRoaXMgcHJldmVudHMgYnVncyBmcm9tIGNyZWF0aW5nIHVuZGVsZXRhYmxlIGV2ZW50cy5cblx0XHRcdFx0YXdhaXQgdGhpcy5jYWxlbmRhck1vZGVsLmRlbGV0ZUV2ZW50KGV4aXN0aW5nRXZlbnQpXG5cdFx0XHR9KSgpLFxuXHRcdClcblx0fVxuXG5cdC8qKiBhZGQgYW4gZXhjbHVzaW9uIHRvIHRoZSBwcm9nZW5pdG9yIGFuZCBzZW5kIGFuIHVwZGF0ZS4gKi9cblx0YXN5bmMgZXhjbHVkZVNpbmdsZUluc3RhbmNlKGVkaXRNb2RlbHNGb3JQcm9nZW5pdG9yOiBDYWxlbmRhckV2ZW50RWRpdE1vZGVscywgZXhpc3RpbmdJbnN0YW5jZTogQ2FsZW5kYXJFdmVudCwgcHJvZ2VuaXRvcjogQ2FsZW5kYXJFdmVudCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGF3YWl0IHRoaXMuc2hvd1Byb2dyZXNzKFxuXHRcdFx0KGFzeW5jICgpID0+IHtcblx0XHRcdFx0ZWRpdE1vZGVsc0ZvclByb2dlbml0b3Iud2hvTW9kZWwuc2hvdWxkU2VuZFVwZGF0ZXMgPSB0cnVlXG5cdFx0XHRcdGVkaXRNb2RlbHNGb3JQcm9nZW5pdG9yLndoZW5Nb2RlbC5leGNsdWRlRGF0ZShleGlzdGluZ0luc3RhbmNlLnN0YXJ0VGltZSlcblx0XHRcdFx0Y29uc3QgeyBuZXdFdmVudCwgc2VuZE1vZGVscywgY2FsZW5kYXIsIG5ld0FsYXJtcyB9ID0gYXNzZW1ibGVFZGl0UmVzdWx0QW5kQXNzaWduRnJvbUV4aXN0aW5nKFxuXHRcdFx0XHRcdHByb2dlbml0b3IsXG5cdFx0XHRcdFx0ZWRpdE1vZGVsc0ZvclByb2dlbml0b3IsXG5cdFx0XHRcdFx0Q2FsZW5kYXJPcGVyYXRpb24uRGVsZXRlVGhpcyxcblx0XHRcdFx0KVxuXHRcdFx0XHRjb25zdCByZWN1cnJlbmNlSWRzID0gYXdhaXQgdGhpcy5sYXp5UmVjdXJyZW5jZUlkcyhwcm9nZW5pdG9yLnVpZClcblx0XHRcdFx0YXdhaXQgdGhpcy5ub3RpZmljYXRpb25Nb2RlbC5zZW5kKG5ld0V2ZW50LCByZWN1cnJlbmNlSWRzLCBzZW5kTW9kZWxzKVxuXHRcdFx0XHRhd2FpdCB0aGlzLmNhbGVuZGFyTW9kZWwudXBkYXRlRXZlbnQobmV3RXZlbnQsIG5ld0FsYXJtcywgdGhpcy56b25lLCBjYWxlbmRhci5ncm91cFJvb3QsIHByb2dlbml0b3IpXG5cdFx0XHR9KSgpLFxuXHRcdClcblx0fVxuXG5cdC8qKiBvbmx5IHJlbW92ZSBhIHNpbmdsZSBhbHRlcmVkIGluc3RhbmNlIGZyb20gdGhlIHNlcnZlciAmIHRoZSB1aWQgaW5kZXguIHdpbGwgbm90IG1vZGlmeSB0aGUgcHJvZ2VuaXRvci4gKi9cblx0YXN5bmMgZGVsZXRlQWx0ZXJlZEluc3RhbmNlKGVkaXRNb2RlbHM6IENhbGVuZGFyRXZlbnRFZGl0TW9kZWxzLCBleGlzdGluZ0FsdGVyZWRJbnN0YW5jZTogQ2FsZW5kYXJFdmVudCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGVkaXRNb2RlbHMud2hvTW9kZWwuc2hvdWxkU2VuZFVwZGF0ZXMgPSB0cnVlXG5cdFx0Y29uc3QgeyBzZW5kTW9kZWxzIH0gPSBhc3NlbWJsZUNhbGVuZGFyRXZlbnRFZGl0UmVzdWx0KGVkaXRNb2RlbHMpXG5cdFx0c2VuZE1vZGVscy5jYW5jZWxNb2RlbCA9IHNlbmRNb2RlbHMudXBkYXRlTW9kZWxcblx0XHRzZW5kTW9kZWxzLnVwZGF0ZU1vZGVsID0gbnVsbFxuXHRcdGF3YWl0IHRoaXMuc2hvd1Byb2dyZXNzKFxuXHRcdFx0KGFzeW5jICgpID0+IHtcblx0XHRcdFx0YXdhaXQgdGhpcy5ub3RpZmljYXRpb25Nb2RlbC5zZW5kKGV4aXN0aW5nQWx0ZXJlZEluc3RhbmNlLCBbXSwgc2VuZE1vZGVscylcblx0XHRcdFx0YXdhaXQgdGhpcy5jYWxlbmRhck1vZGVsLmRlbGV0ZUV2ZW50KGV4aXN0aW5nQWx0ZXJlZEluc3RhbmNlKVxuXHRcdFx0fSkoKSxcblx0XHQpXG5cdH1cbn1cbiIsImltcG9ydCB7IG5vT3AgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcblxuLyoqXG4gKiBUZXh0IHZpZXcgbW9kZWwgc3VpdGFibGUgZm9yIGRhdGEgZW50cnkgdGhhdCBpc24ndCByZW5kZXJlZCBhcyBIVE1MXG4gKi9cbmV4cG9ydCBjbGFzcyBTaW1wbGVUZXh0Vmlld01vZGVsIHtcblx0Y29uc3RydWN0b3IocHJpdmF0ZSB0ZXh0OiBzdHJpbmcsIHByaXZhdGUgcmVhZG9ubHkgdWlVcGRhdGVDYWxsYmFjazogKCkgPT4gdm9pZCA9IG5vT3ApIHt9XG5cblx0c2V0IGNvbnRlbnQodGV4dDogc3RyaW5nKSB7XG5cdFx0dGhpcy50ZXh0ID0gdGV4dFxuXHRcdHRoaXMudWlVcGRhdGVDYWxsYmFjaygpXG5cdH1cblxuXHRnZXQgY29udGVudCgpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLnRleHRcblx0fVxufVxuIiwiLyoqXG4gKiBUaGlzIGZpbGUgY29udGFpbnMgdGhlIG1vc3QgaW1wb3J0YW50IGZ1bmN0aW9ucyBhbmQgY2xhc3NlcyB0byBkZXRlcm1pbmUgdGhlIGV2ZW50IHR5cGUsIHRoZSBvcmdhbml6ZXIgb2YgdGhlIGV2ZW50IGFuZCBwb3NzaWJsZVxuICogb3JnYW5pemVycyBpbiBhY2NvcmRhbmNlIHdpdGggdGhlIGNhcGFiaWxpdGllcyBmb3IgZXZlbnRzIChzZWUgdGFibGUpLlxuICpcbiAqIFRoZSBtb3N0IGltcG9ydGFudCByZXN0cmljdGlvbiBpcyB0aGF0IGl0IGlzIGltcG9zc2libGUgdG8gY2hhbmdlIHRoZSBndWVzdCBsaXN0IG9yIHNlbmQgdXBkYXRlcyB0byBhdHRlbmRlZXMgb24gZXZlbnRzIGluXG4gKiBjYWxlbmRhcnMgeW91IGRvIG5vdCBvd24sIHdoaWNoIG1lYW5zIHRoYXQgdGhlIGV2ZW50IGhhcyBubyBvcmdhbml6ZXIgKGd1ZXN0IGxpc3QgaXMgZW1wdHkpIG9yIHRoYXQgdGhlIGV2ZW50IGhhcyBndWVzdHNcbiAqIGFuZCB0aGVyZWZvcmUgYWxzbyBhbiBvcmdhbml6ZXIgdGhhdCdzIG5vdCB1cy5cbiAqXG4gKiBDYXBhYmlsaXR5IGZvciBldmVudHMgaXMgZmFpcmx5IGNvbXBsaWNhdGVkOlxuICogTm90ZTogXCJzaGFyZWRcIiBjYWxlbmRhciBtZWFucyBcIm5vdCBvd25lciBvZiB0aGUgY2FsZW5kYXJcIi4gQ2FsZW5kYXIgYWx3YXlzIGxvb2tzIGxpa2UgcGVyc29uYWwgZm9yIHRoZSBvd25lci5cbiAqIE5vdGU6IFwiaGFzIGF0dGVuZGVlc1wiIGFwcGxpZXMgdG8gZXZlbnRzIGZvciB3aGljaCBpbnZpdGVzIHdlcmUgYWxyZWFkeSBzZW50LiB3aGlsZSBlZGl0aW5nIGFuZCBhZGRpbmcgYXR0ZW5kZWVzLCBcIm5vIGF0dGVuZGVlc1wiIGFwcGxpZXMuXG4gKiBOb3RlOiB0aGUgb25seSBvcmdhbml6ZXIgdGhhdCBhbiBldmVudCBjYW4gaGF2ZSBpcyB0aGUgb3duZXIgb2YgdGhlIGNhbGVuZGFyIHRoZSBldmVudCBpcyBkZWZpbmVkIGluLlxuICpcbiAqIHwgRXZlbnQgU3RhdGVcdFx0XHQgICAgICAgICAgICAgICAgICAgICAgICAgfHwgUG9zc2libGUgb3BlcmF0aW9uc1xuICogfCBjYWxlbmRhciBhY2Nlc3MgIHwgZXZlbnQgb3JpZ2luIHwgaGFzIGF0dGVuZGVlcyB8fCBlZGl0IGRldGFpbHMgIHwgZWRpdCBvd24gYXR0ZW5kYW5jZSB8IG1vZGlmeSBhdHRlbmRlZXMgfCBhZGQgYWxhcm1zIHxcbiAqIHwtLS0tLS0tLS0tLS0tLS0tLS0rLS0tLS0tLS0tLS0tLS0rLS0tLS0tLS0tLS0tLS0tKystLS0tLS0tLS0tLS0tLS0rLS0tLS0tLS0tLS0tLS0tLS0tLS0tKy0tLS0tLS0tLS0tLS0tLS0tLXwtLS0tLS0tLS0tLS18XG4gKiB8IG93biAgICAgICAgICAgICAgfCBjYWxlbmRhciAgICAgfCBubyAgICAgICAgICAgIHx8IHllcyAgICAgICAgICAgfCBuL2EgICAgICAgICAgICAgICAgIHwgeWVzICAgICAgICAgICAgICB8IHllcyAgICAgICAgfFxuICogfCBvd24gICAgICAgICAgICAgIHwgaW52aXRlICAgICAgIHwgbm8gICAgICAgICAgICB8fCBuL2EgICAgICAgICAgIHwgbi9hICAgICAgICAgICAgICAgICB8IG4vYSAgICAgICAgICAgICAgfCB5ZXMgICAgICAgIHxcbiAqIHwgc2hhcmVkIHJ3ICAgICAgICB8IGNhbGVuZGFyICAgICB8IG5vICAgICAgICAgICAgfHwgeWVzICAgICAgICAgICB8IG4vYSAgICAgICAgICAgICAgICAgfCBubyAgICAgICAgICAgICAgIHwgeWVzICAgICAgICB8XG4gKiB8IHNoYXJlZCBydyAgICAgICAgfCBpbnZpdGUgICAgICAgfCBubyAgICAgICAgICAgIHx8IG4vYSAgICAgICAgICAgfCBuL2EgICAgICAgICAgICAgICAgIHwgbi9hICAgICAgICAgICAgICB8IHllcyAgICAgICAgfFxuICogfCBzaGFyZWQgcm8gICAgICAgIHwgYW55ICAgICAgICAgIHwgbm8gICAgICAgICAgICB8fCBubyAgICAgICAgICAgIHwgbi9hICAgICAgICAgICAgICAgICB8IG5vICAgICAgICAgICAgICAgfCBubyAgICAgICAgIHxcbiAqIHwtLS0tLS0tLS0tLS0tLS0tLS0rLS0tLS0tLS0tLS0tLS0rLS0tLS0tLS0tLS0tLS0tKystLS0tLS0tLS0tLS0tLS0rLS0tLS0tLS0tLS0tLS0tLS0tLS0tKy0tLS0tLS0tLS0tLS0tLS0tLXwtLS0tLS0tLS0tLS18XG4gKiB8IG93biAgICAgICAgICAgICAgfCBjYWxlbmRhciAgICAgfCB5ZXMgICAgICAgICAgIHx8IHllcyAgICAgICAgICAgfCB5ZXMgICAgICAgICAgICAgICAgIHwgeWVzICAgICAgICAgICAgICB8IHllcyAgICAgICAgfFxuICogfCBvd24gICAgICAgICAgICAgIHwgaW52aXRlICAgICAgIHwgeWVzICAgICAgICAgICB8fCBubyAgICAgICAgICAgIHwgeWVzICAgICAgICAgICAgICAgICB8IG5vICAgICAgICAgICAgICAgfCB5ZXMgICAgICAgIHxcbiAqIHwgc2hhcmVkIHJ3ICAgICAgICB8IGFueSAgICAgICAgICB8IHllcyAgICAgICAgICAgfHwgbm8gICAgICAgICAgICB8IG5vICAgICAgICAgICAgICAgICAgfCBubyAgICAgICAgICAgICAgIHwgeWVzICAgICAgICB8XG4gKiB8IHNoYXJlZCBybyAgICAgICAgfCBhbnkgICAgICAgICAgfCB5ZXMgICAgICAgICAgIHx8IG5vICAgICAgICAgICAgfCBubyAgICAgICAgICAgICAgICAgIHwgbm8gICAgICAgICAgICAgICB8IG5vICAgICAgICAgfFxuICpcbiAqIFRoZSBmYWlybHkgY29tcGxpY2F0ZWQgZXZlbnQgZWRpdCBvcGVyYXRpb24gaXMgc3BsaXQgaW50byBzZXZlcmFsIHN1Ym1vZGVscyB0aGF0IGFyZSBzdG9yZWQgb24gdGhlIENhbGVuZGFyRXZlbnRNb2RlbC5lZGl0TW9kZWxzIGZpZWxkLlxuICogVGhleSByb3VnaGx5IGNvcnJlc3BvbmQgdG8gdGhlIHF1ZXN0aW9ucyBvZlxuICogKiB3aGVuIGFuZCBob3cgb2Z0ZW4gdGhlIGV2ZW50IGhhcHBlbnMgKHNlZSBDYWxlbmRhckV2ZW50V2hlbk1vZGVsLnRzKVxuICogKiB3aG8gcGFydGljaXBhdGVzIGFuZCBoYXMgYWNjZXNzIHRvIHRoZSBldmVudCAoc2VlIENhbGVuZGFyRXZlbnRXaG9Nb2RlbC50cylcbiAqICogdGhlIGFsYXJtcyB0aGUgY3VycmVudCB1c2VyIHNldCBmb3IgdGhlIGV2ZW50IChDYWxlbmRhckV2ZW50QWxhcm1Nb2RlbC50cylcbiAqICogd2hhdCB0aGUgZXZlbnQgaXMgYWJvdXQgKGRlc2NyaXB0aW9uLCBzdW1tYXJ5KVxuICogKiB3aGVyZSB0aGUgZXZlbnQgdGFrZXMgcGxhY2UgKGxvY2F0aW9uKVxuICpcbiAqIFRoZXNlIGFyZSBpbiBkZXNjZW5kaW5nIG9yZGVyIG9mIGNvbXBsZXhpdHksIHRoZSBsYXN0IHR3byBwb2ludHMgYXJlIGVzc2VudGlhbGx5IGp1c3QgKHJpY2gpdGV4dCBmaWVsZHMuXG4gKlxuICogVGhlIGdlbmVyYWwgZmxvdyBmb3IgZWRpdGluZyBhbiBldmVudCBpcyBhcyBmb2xsb3dzOlxuICogKiBjYWxsIG1ha2VDYWxlbmRhckV2ZW50TW9kZWwgKHByb2JhYmx5IHZpYSB0aGUgbG9jYXRvcikuIFRoZSBtb3N0IGltcG9ydGFudCBkZWNpc2lvbiBoZXJlIGlzIHdoYXQgRXZlbnRUeXBlIHdlIGFyZSBkZWFsaW5nIHdpdGguXG4gKiAqIGVkaXQgdGhlIHByb3BlcnRpZXMgdGhhdCBuZWVkIHRvIGJlIGVkaXRlZFxuICogKiBjYWxsIFwic2F2ZU5ld0V2ZW50XCIgb3IgXCJ1cGRhdGVFeGlzdGluZ0V2ZW50XCIgb24gdGhlIENhbGVuZGFyRXZlbnRNb2RlbC4gaW50ZXJuYWxseSwgdGhpcyBtZWFuczpcbiAqICAgKiB0aGUgbW9kZWwgdGFrZXMgdGhlIGNvbnRlbnRzIG9mIHRoZSBlZGl0TW9kZWxzIGZpZWxkIGFuZCB1c2VzIHRoZW0gdG8gYXNzZW1ibGUgdGhlIHJlc3VsdCBvZiB0aGUgZWRpdCBvcGVyYXRpb25cbiAqICAgKiB0aGUgZXZlbnQgaWRlbnRpdHkgaXMgYXNzaWduZWRcbiAqICAgKiBub3RpZnkgdGhlIGF0dGVuZGVlcyB0aGF0IHRoZSBDYWxlbmRhckV2ZW50V2hvTW9kZWwgZGV0ZXJtaW5lZCBuZWVkIHRvIGJlIG5vdGlmaWVkXG4gKiAgICogc2F2ZSB0aGUgZXZlbnQgYW5kIGl0cyBhbGFybXMgdG8gdGhlIHNlcnZlclxuICpcbiAqIFdoaWxlIGl0J3MgcG9zc2libGUgdG8gY2FsbCB0aGUgc2F2ZSBvcGVyYXRpb24gbXVsdGlwbGUgdGltZXMsIHRoZSBpbnRlbnRpb24gaXMgdG8gdXNlIGEgbmV3IG1vZGVsIGZvciBlYWNoIGVkaXQgb3BlcmF0aW9uLlxuICpcbiAqIEZ1dHVyZSBpbXByb3ZlbWVudHM6IENhbGVuZGFyRXZlbnRNb2RlbCBzaG91bGQgcHJvYmFibHkgYmUgc2V2ZXJhbCBjbGFzc2VzIHdpdGggYSBnZW5lcmljIFwic2F2ZVwiIGFuZCBcImVkaXRNb2RlbHNcIiBpbnRlcmZhY2UgaW5zdGVhZFxuICogb2YgYmVpbmcgY2FwYWJsZSBvZiBkb2luZyB3aGF0ZXZlciBhbmQgYmVpbmcgY29udHJvbGxlZCBieSB0aGUgY2FsbGVyLlxuICogICAgICogaW52aXRlOiBzYXZlIHNlbmRzIHVwZGF0ZSB0byBvcmdhbml6ZXIsIHRoZW4gc2F2ZXMgKGlmIGl0J3MgaW4gb3duIGNhbGVuZGFyKVxuICogICAgICogbmV3IGV2ZW50OiBzYXZlIG5vdGlmaWVzIGF0dGVuZGVlcywgc2F2ZXMgdGhlIGV2ZW50IGFzIG5ldy5cbiAqICAgICAqIGV4aXN0aW5nIGV2ZW50OiB1cGRhdGVzL2ludml0ZXMvY2FuY2VscyBhdHRlbmRlZXMsIHRoZW4gdXBkYXRlcy5cbiAqICAgICAqIGV0Yy5cbiAqL1xuXG5pbXBvcnQgeyBBY2NvdW50VHlwZSB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi9UdXRhbm90YUNvbnN0YW50cy5qc1wiXG5pbXBvcnQge1xuXHRDYWxlbmRhckV2ZW50LFxuXHRDYWxlbmRhckV2ZW50QXR0ZW5kZWUsXG5cdGNyZWF0ZUNhbGVuZGFyRXZlbnQsXG5cdGNyZWF0ZUVuY3J5cHRlZE1haWxBZGRyZXNzLFxuXHRFbmNyeXB0ZWRNYWlsQWRkcmVzcyxcblx0TWFpbCxcblx0TWFpbGJveFByb3BlcnRpZXMsXG59IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vYXBpL2VudGl0aWVzL3R1dGFub3RhL1R5cGVSZWZzLmpzXCJcbmltcG9ydCB7IFVzZXIgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL2FwaS9lbnRpdGllcy9zeXMvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHR5cGUgeyBNYWlsYm94RGV0YWlsIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9tYWlsRnVuY3Rpb25hbGl0eS9NYWlsYm94TW9kZWwuanNcIlxuaW1wb3J0IHtcblx0QWxhcm1JbnRlcnZhbCxcblx0YXJlUmVwZWF0UnVsZXNFcXVhbCxcblx0RGVmYXVsdERhdGVQcm92aWRlcixcblx0ZmluZEZpcnN0UHJpdmF0ZUNhbGVuZGFyLFxuXHRnZXRUaW1lWm9uZSxcblx0aW5jcmVtZW50U2VxdWVuY2UsXG5cdHBhcnNlQWxhcm1JbnRlcnZhbCxcbn0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9jYWxlbmRhci9kYXRlL0NhbGVuZGFyVXRpbHMuanNcIlxuaW1wb3J0IHsgYXJyYXlFcXVhbHNXaXRoUHJlZGljYXRlLCBhc3NlcnROb25OdWxsLCBhc3NlcnROb3ROdWxsLCBpZGVudGl0eSwgbGF6eSwgUmVxdWlyZSB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHsgY2xlYW5NYWlsQWRkcmVzcyB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi91dGlscy9Db21tb25DYWxlbmRhclV0aWxzLmpzXCJcbmltcG9ydCB7IGFzc2VydEV2ZW50VmFsaWRpdHksIENhbGVuZGFySW5mbywgQ2FsZW5kYXJNb2RlbCB9IGZyb20gXCIuLi8uLi9tb2RlbC9DYWxlbmRhck1vZGVsLmpzXCJcbmltcG9ydCB7IE5vdEZvdW5kRXJyb3IsIFBheWxvYWRUb29MYXJnZUVycm9yIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL2Vycm9yL1Jlc3RFcnJvci5qc1wiXG5pbXBvcnQgeyBDYWxlbmRhck5vdGlmaWNhdGlvblNlbmRlciB9IGZyb20gXCIuLi8uLi92aWV3L0NhbGVuZGFyTm90aWZpY2F0aW9uU2VuZGVyLmpzXCJcbmltcG9ydCB7IFNlbmRNYWlsTW9kZWwgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL21haWxGdW5jdGlvbmFsaXR5L1NlbmRNYWlsTW9kZWwuanNcIlxuaW1wb3J0IHsgVXNlckVycm9yIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9hcGkvbWFpbi9Vc2VyRXJyb3IuanNcIlxuaW1wb3J0IHsgRW50aXR5Q2xpZW50IH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL0VudGl0eUNsaWVudC5qc1wiXG5pbXBvcnQgeyBSZWNpcGllbnRzTW9kZWwgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL2FwaS9tYWluL1JlY2lwaWVudHNNb2RlbC5qc1wiXG5pbXBvcnQgeyBMb2dpbkNvbnRyb2xsZXIgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL2FwaS9tYWluL0xvZ2luQ29udHJvbGxlci5qc1wiXG5pbXBvcnQgbSBmcm9tIFwibWl0aHJpbFwiXG5pbXBvcnQgeyBQYXJ0aWFsUmVjaXBpZW50IH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL3JlY2lwaWVudHMvUmVjaXBpZW50LmpzXCJcbmltcG9ydCB7IGdldFBhc3N3b3JkU3RyZW5ndGhGb3JVc2VyIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9taXNjL3Bhc3N3b3Jkcy9QYXNzd29yZFV0aWxzLmpzXCJcbmltcG9ydCB7IENhbGVuZGFyRXZlbnRXaGVuTW9kZWwgfSBmcm9tIFwiLi9DYWxlbmRhckV2ZW50V2hlbk1vZGVsLmpzXCJcbmltcG9ydCB7IENhbGVuZGFyRXZlbnRXaG9Nb2RlbCB9IGZyb20gXCIuL0NhbGVuZGFyRXZlbnRXaG9Nb2RlbC5qc1wiXG5pbXBvcnQgeyBDYWxlbmRhckV2ZW50QWxhcm1Nb2RlbCB9IGZyb20gXCIuL0NhbGVuZGFyRXZlbnRBbGFybU1vZGVsLmpzXCJcbmltcG9ydCB7IFNhbml0aXplZFRleHRWaWV3TW9kZWwgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL21pc2MvU2FuaXRpemVkVGV4dFZpZXdNb2RlbC5qc1wiXG5pbXBvcnQgeyBnZXRTdHJpcHBlZENsb25lLCBTdHJpcHBlZCwgU3RyaXBwZWRFbnRpdHkgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vdXRpbHMvRW50aXR5VXRpbHMuanNcIlxuaW1wb3J0IHsgVXNlckNvbnRyb2xsZXIgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tbW9uL2FwaS9tYWluL1VzZXJDb250cm9sbGVyLmpzXCJcbmltcG9ydCB7IENhbGVuZGFyTm90aWZpY2F0aW9uTW9kZWwsIENhbGVuZGFyTm90aWZpY2F0aW9uU2VuZE1vZGVscyB9IGZyb20gXCIuL0NhbGVuZGFyTm90aWZpY2F0aW9uTW9kZWwuanNcIlxuaW1wb3J0IHsgQ2FsZW5kYXJFdmVudEFwcGx5U3RyYXRlZ2llcywgQ2FsZW5kYXJFdmVudE1vZGVsU3RyYXRlZ3kgfSBmcm9tIFwiLi9DYWxlbmRhckV2ZW50TW9kZWxTdHJhdGVneS5qc1wiXG5pbXBvcnQgeyBQcm9ncmFtbWluZ0Vycm9yIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL2Vycm9yL1Byb2dyYW1taW5nRXJyb3IuanNcIlxuaW1wb3J0IHsgU2ltcGxlVGV4dFZpZXdNb2RlbCB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21tb24vbWlzYy9TaW1wbGVUZXh0Vmlld01vZGVsLmpzXCJcbmltcG9ydCB7IEFsYXJtSW5mb1RlbXBsYXRlIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9hcGkvd29ya2VyL2ZhY2FkZXMvbGF6eS9DYWxlbmRhckZhY2FkZS5qc1wiXG5pbXBvcnQgeyBnZXRFdmVudFR5cGUgfSBmcm9tIFwiLi4vQ2FsZW5kYXJHdWlVdGlscy5qc1wiXG5pbXBvcnQgeyBnZXREZWZhdWx0U2VuZGVyIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbW1vbi9tYWlsRnVuY3Rpb25hbGl0eS9TaGFyZWRNYWlsVXRpbHMuanNcIlxuXG4vKiogdGhlIHR5cGUgb2YgdGhlIGV2ZW50IGRldGVybWluZXMgd2hpY2ggZWRpdCBvcGVyYXRpb25zIGFyZSBhdmFpbGFibGUgdG8gdXMuICovXG5leHBvcnQgY29uc3QgZW51bSBFdmVudFR5cGUge1xuXHQvKiogZXZlbnQgaW4gb3VyIG93biBjYWxlbmRhciBhbmQgd2UgYXJlIG9yZ2FuaXplciAqL1xuXHRPV04gPSBcIm93blwiLFxuXHQvKiogZXZlbnQgaW4gc2hhcmVkIGNhbGVuZGFyIHdpdGggcmVhZCBwZXJtaXNzaW9uICovXG5cdFNIQVJFRF9STyA9IFwic2hhcmVkX3JvXCIsXG5cdC8qKiBldmVudCBpbiBzaGFyZWQgY2FsZW5kYXIgd2l0aCB3cml0ZSBwZXJtaXNzaW9uLCB0aGF0IGhhcyBubyBhdHRlbmRlZXMgKi9cblx0U0hBUkVEX1JXID0gXCJzaGFyZWRfcndcIixcblx0LyoqIHNoYXJlZCB3aXRoIHdyaXRlIHBlcm1pc3Npb25zLCBidXQgd2UgY2FuJ3QgZWRpdCBhbnl0aGluZyBidXQgYWxhcm1zIGJlY2F1c2UgaXQgaGFzIGF0dGVuZGVlcy4gbWlnaHQgYmUgc29tZXRoaW5nIHRoZSBjYWxlbmRhciBvd25lciB3YXMgaW52aXRlZCB0by4gKi9cblx0TE9DS0VEID0gXCJsb2NrZWRcIixcblx0LyoqIGludml0ZSBmcm9tIGNhbGVuZGFyIGludml0YXRpb24gd2hpY2ggaXMgbm90IHN0b3JlZCBpbiBjYWxlbmRhciB5ZXQsIG9yIGV2ZW50IHN0b3JlZCBpbiAqKm93biBjYWxlbmRhcioqIGFuZCB3ZSBhcmUgbm90IG9yZ2FuaXplci4gKi9cblx0SU5WSVRFID0gXCJpbnZpdGVcIixcblx0LyoqIHdlIGFyZSBhbiBleHRlcm5hbCB1c2VyIGFuZCBzZWUgYW4gZXZlbnQgaW4gb3VyIG1haWxib3ggKi9cblx0RVhURVJOQUwgPSBcImV4dGVybmFsXCIsXG59XG5cbmV4cG9ydCBjb25zdCBlbnVtIFJlYWRvbmx5UmVhc29uIHtcblx0LyoqIGl0J3MgYSBzaGFyZWQgZXZlbnQsIHNvIGF0IGxlYXN0IHRoZSBhdHRlbmRlZXMgYXJlIHJlYWQtb25seSAqL1xuXHRTSEFSRUQsXG5cdC8qKiB0aGlzIGVkaXQgb3BlcmF0aW9uIGFwcGxpZXMgdG8gb25seSBwYXJ0IG9mIGEgc2VyaWVzLCBzbyBhdHRlbmRlZXMgYW5kIGNhbGVuZGFyIGFyZSByZWFkLW9ubHkgKi9cblx0U0lOR0xFX0lOU1RBTkNFLFxuXHQvKiogdGhlIG9yZ2FuaXplciBpcyBub3QgdGhlIGN1cnJlbnQgdXNlciAqL1xuXHROT1RfT1JHQU5JWkVSLFxuXHQvKiogdGhlIGV2ZW50IGNhbm5vdCBiZSBlZGl0ZWQgZm9yIGFuIHVuc3BlY2lmaWVkIHJlYXNvbi4gVGhpcyBpcyB0aGUgZGVmYXVsdCB2YWx1ZSAqL1xuXHRVTktOT1dOLFxuXHQvKiogd2UgY2FuIGVkaXQgYW55dGhpbmcgaGVyZSAqL1xuXHROT05FLFxufVxuXG4vKipcbiAqIGNvbXBsZXRlIGNhbGVuZGFyIGV2ZW50IGV4Y2VwdCB0aGUgcGFydHMgdGhhdCBkZWZpbmUgdGhlIGlkZW50aXR5IG9mIHRoZSBldmVudCBpbnN0YW5jZSAoaW4gaWNhbCB0ZXJtcykgYW5kIHRoZSB0ZWNobmljYWwgZmllbGRzLlxuICogd2hlbiB0aGUgZXhjbHVkZWQgZmllbGRzIGFyZSBhZGRlZCwgdGhpcyB0eXBlIGNhbiBiZSB1c2VkIHRvIHNldCB1cCBhIHNlcmllcywgdXBkYXRlIGEgc2VyaWVzIG9yIHJlc2NoZWR1bGUgYW4gaW5zdGFuY2Ugb2YgYSBzZXJpZXNcbiAqIGhhc2hlZFVpZCBpcyBleGNsdWRlZCBzZXBhcmF0ZWx5IHNpbmNlIGl0J3Mgbm90IHJlYWxseSByZWxldmFudCB0byB0aGUgY2xpZW50J3MgbG9naWMuXG4gKi9cbmV4cG9ydCB0eXBlIENhbGVuZGFyRXZlbnRWYWx1ZXMgPSBPbWl0PFN0cmlwcGVkPENhbGVuZGFyRXZlbnQ+LCBFdmVudElkZW50aXR5RmllbGROYW1lcyB8IFwiaGFzaGVkVWlkXCI+XG5cbi8qKlxuICogdGhlIHBhcnRzIG9mIGEgY2FsZW5kYXIgZXZlbnQgdGhhdCBkZWZpbmUgdGhlIGlkZW50aXR5IG9mIHRoZSBldmVudCBpbnN0YW5jZS5cbiAqL1xuZXhwb3J0IHR5cGUgQ2FsZW5kYXJFdmVudElkZW50aXR5ID0gUGljazxTdHJpcHBlZDxDYWxlbmRhckV2ZW50PiwgRXZlbnRJZGVudGl0eUZpZWxkTmFtZXM+XG5cbi8qKlxuICogd2hpY2ggcGFydHMgb2YgYSBjYWxlbmRhciBldmVudCBzZXJpZXMgdG8gYXBwbHkgYW4gZWRpdCBvcGVyYXRpb24gdG8uXG4gKiBjb25zdW1lcnMgbXVzdCB0YWtlIGNhcmUgdG8gb25seSB1c2UgYXBwcm9wcmlhdGUgdmFsdWVzIGZvciB0aGUgb3BlcmF0aW9uXG4gKiBpbiBxdWVzdGlvbiAoaWUgcmVtb3ZpbmcgYSByZXBlYXQgcnVsZSBmcm9tIGEgc2luZ2xlIGV2ZW50IGluIGEgc2VyaWVzIGlzIG5vbnNlbnNpY2FsKVxuICovXG5leHBvcnQgY29uc3QgZW51bSBDYWxlbmRhck9wZXJhdGlvbiB7XG5cdC8qKiBjcmVhdGUgYSBuZXcgZXZlbnQgKi9cblx0Q3JlYXRlLFxuXHQvKiogb25seSBhcHBseSBhbiBlZGl0IHRvIG9ubHkgb25lIHBhcnRpY3VsYXIgaW5zdGFuY2Ugb2YgdGhlIHNlcmllcyAqL1xuXHRFZGl0VGhpcyxcblx0LyoqIERlbGV0ZSBhIHNpbmdsZSBpbnN0YW5jZSBmcm9tIGEgc2VyaWVzLCBhbHRlcmVkIG9yIG5vdCAqL1xuXHREZWxldGVUaGlzLFxuXHQvKiogYXBwbHkgdGhlIGVkaXQgb3BlcmF0aW9uIHRvIGFsbCBpbnN0YW5jZXMgb2YgdGhlIHNlcmllcyovXG5cdEVkaXRBbGwsXG5cdC8qKiBkZWxldGUgdGhlIHdob2xlIHNlcmllcyAqL1xuXHREZWxldGVBbGwsXG59XG5cbi8qKlxuICogZ2V0IHRoZSBtb2RlbHMgZW5hYmxpbmcgY29uc2lzdGVudCBjYWxlbmRhciBldmVudCB1cGRhdGVzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbWFrZUNhbGVuZGFyRXZlbnRNb2RlbChcblx0b3BlcmF0aW9uOiBDYWxlbmRhck9wZXJhdGlvbixcblx0aW5pdGlhbFZhbHVlczogUGFydGlhbDxDYWxlbmRhckV2ZW50Pixcblx0cmVjaXBpZW50c01vZGVsOiBSZWNpcGllbnRzTW9kZWwsXG5cdGNhbGVuZGFyTW9kZWw6IENhbGVuZGFyTW9kZWwsXG5cdGxvZ2luczogTG9naW5Db250cm9sbGVyLFxuXHRtYWlsYm94RGV0YWlsOiBNYWlsYm94RGV0YWlsLFxuXHRtYWlsYm94UHJvcGVydGllczogTWFpbGJveFByb3BlcnRpZXMsXG5cdHNlbmRNYWlsTW9kZWxGYWN0b3J5OiBsYXp5PFNlbmRNYWlsTW9kZWw+LFxuXHRub3RpZmljYXRpb25TZW5kZXI6IENhbGVuZGFyTm90aWZpY2F0aW9uU2VuZGVyLFxuXHRlbnRpdHlDbGllbnQ6IEVudGl0eUNsaWVudCxcblx0cmVzcG9uc2VUbzogTWFpbCB8IG51bGwsXG5cdHpvbmU6IHN0cmluZyA9IGdldFRpbWVab25lKCksXG5cdHNob3dQcm9ncmVzczogU2hvd1Byb2dyZXNzQ2FsbGJhY2sgPSBpZGVudGl0eSxcblx0dWlVcGRhdGVDYWxsYmFjazogKCkgPT4gdm9pZCA9IG0ucmVkcmF3LFxuKTogUHJvbWlzZTxDYWxlbmRhckV2ZW50TW9kZWwgfCBudWxsPiB7XG5cdGNvbnN0IHsgaHRtbFNhbml0aXplciB9ID0gYXdhaXQgaW1wb3J0KFwiLi4vLi4vLi4vLi4vY29tbW9uL21pc2MvSHRtbFNhbml0aXplci5qc1wiKVxuXHRjb25zdCBvd25NYWlsQWRkcmVzc2VzID0gZ2V0T3duTWFpbEFkZHJlc3Nlc1dpdGhEZWZhdWx0U2VuZGVySW5Gcm9udChsb2dpbnMsIG1haWxib3hEZXRhaWwsIG1haWxib3hQcm9wZXJ0aWVzKVxuXHRpZiAob3BlcmF0aW9uID09PSBDYWxlbmRhck9wZXJhdGlvbi5EZWxldGVBbGwgfHwgb3BlcmF0aW9uID09PSBDYWxlbmRhck9wZXJhdGlvbi5FZGl0QWxsKSB7XG5cdFx0YXNzZXJ0Tm9uTnVsbChpbml0aWFsVmFsdWVzLnVpZCwgXCJ0cmllZCB0byBlZGl0L2RlbGV0ZSBhbGwgd2l0aCBub25leGlzdGVudCB1aWRcIilcblx0XHRjb25zdCBpbmRleCA9IGF3YWl0IGNhbGVuZGFyTW9kZWwuZ2V0RXZlbnRzQnlVaWQoaW5pdGlhbFZhbHVlcy51aWQpXG5cdFx0aWYgKGluZGV4ICE9IG51bGwgJiYgaW5kZXgucHJvZ2VuaXRvciAhPSBudWxsKSB7XG5cdFx0XHRpbml0aWFsVmFsdWVzID0gaW5kZXgucHJvZ2VuaXRvclxuXHRcdH1cblx0fVxuXG5cdGNvbnN0IHVzZXIgPSBsb2dpbnMuZ2V0VXNlckNvbnRyb2xsZXIoKS51c2VyXG5cdGNvbnN0IFthbGFybXMsIGNhbGVuZGFyc10gPSBhd2FpdCBQcm9taXNlLmFsbChbXG5cdFx0cmVzb2x2ZUFsYXJtc0ZvckV2ZW50KGluaXRpYWxWYWx1ZXMuYWxhcm1JbmZvcyA/PyBbXSwgY2FsZW5kYXJNb2RlbCwgdXNlciksXG5cdFx0Y2FsZW5kYXJNb2RlbC5nZXRDYWxlbmRhckluZm9zKCksXG5cdF0pXG5cdGNvbnN0IHNlbGVjdGVkQ2FsZW5kYXIgPSBnZXRQcmVzZWxlY3RlZENhbGVuZGFyKGNhbGVuZGFycywgaW5pdGlhbFZhbHVlcylcblx0Y29uc3QgZ2V0UGFzc3dvcmRTdHJlbmd0aCA9IChwYXNzd29yZDogc3RyaW5nLCByZWNpcGllbnRJbmZvOiBQYXJ0aWFsUmVjaXBpZW50KSA9PlxuXHRcdGdldFBhc3N3b3JkU3RyZW5ndGhGb3JVc2VyKHBhc3N3b3JkLCByZWNpcGllbnRJbmZvLCBtYWlsYm94RGV0YWlsLCBsb2dpbnMpXG5cblx0Y29uc3QgZXZlbnRUeXBlID0gZ2V0RXZlbnRUeXBlKFxuXHRcdGluaXRpYWxWYWx1ZXMsXG5cdFx0Y2FsZW5kYXJzLFxuXHRcdG93bk1haWxBZGRyZXNzZXMubWFwKCh7IGFkZHJlc3MgfSkgPT4gYWRkcmVzcyksXG5cdFx0bG9naW5zLmdldFVzZXJDb250cm9sbGVyKCksXG5cdClcblxuXHRjb25zdCBtYWtlRWRpdE1vZGVscyA9IChpbml0aWFsaXphdGlvbkV2ZW50OiBDYWxlbmRhckV2ZW50KSA9PiAoe1xuXHRcdHdoZW5Nb2RlbDogbmV3IENhbGVuZGFyRXZlbnRXaGVuTW9kZWwoaW5pdGlhbGl6YXRpb25FdmVudCwgem9uZSwgdWlVcGRhdGVDYWxsYmFjayksXG5cdFx0d2hvTW9kZWw6IG5ldyBDYWxlbmRhckV2ZW50V2hvTW9kZWwoXG5cdFx0XHRpbml0aWFsaXphdGlvbkV2ZW50LFxuXHRcdFx0ZXZlbnRUeXBlLFxuXHRcdFx0b3BlcmF0aW9uLFxuXHRcdFx0Y2FsZW5kYXJzLFxuXHRcdFx0c2VsZWN0ZWRDYWxlbmRhcixcblx0XHRcdGxvZ2lucy5nZXRVc2VyQ29udHJvbGxlcigpLFxuXHRcdFx0b3BlcmF0aW9uID09PSBDYWxlbmRhck9wZXJhdGlvbi5DcmVhdGUsXG5cdFx0XHRvd25NYWlsQWRkcmVzc2VzLFxuXHRcdFx0cmVjaXBpZW50c01vZGVsLFxuXHRcdFx0cmVzcG9uc2VUbyxcblx0XHRcdGdldFBhc3N3b3JkU3RyZW5ndGgsXG5cdFx0XHRzZW5kTWFpbE1vZGVsRmFjdG9yeSxcblx0XHRcdHVpVXBkYXRlQ2FsbGJhY2ssXG5cdFx0KSxcblx0XHRhbGFybU1vZGVsOiBuZXcgQ2FsZW5kYXJFdmVudEFsYXJtTW9kZWwoZXZlbnRUeXBlLCBhbGFybXMsIG5ldyBEZWZhdWx0RGF0ZVByb3ZpZGVyKCksIHVpVXBkYXRlQ2FsbGJhY2spLFxuXHRcdGxvY2F0aW9uOiBuZXcgU2ltcGxlVGV4dFZpZXdNb2RlbChpbml0aWFsaXphdGlvbkV2ZW50LmxvY2F0aW9uLCB1aVVwZGF0ZUNhbGxiYWNrKSxcblx0XHRzdW1tYXJ5OiBuZXcgU2ltcGxlVGV4dFZpZXdNb2RlbChpbml0aWFsaXphdGlvbkV2ZW50LnN1bW1hcnksIHVpVXBkYXRlQ2FsbGJhY2spLFxuXHRcdGRlc2NyaXB0aW9uOiBuZXcgU2FuaXRpemVkVGV4dFZpZXdNb2RlbChpbml0aWFsaXphdGlvbkV2ZW50LmRlc2NyaXB0aW9uLCBodG1sU2FuaXRpemVyLCB1aVVwZGF0ZUNhbGxiYWNrKSxcblx0fSlcblxuXHRjb25zdCByZWN1cnJlbmNlSWRzID0gYXN5bmMgKHVpZD86IHN0cmluZykgPT5cblx0XHR1aWQgPT0gbnVsbCA/IFtdIDogKGF3YWl0IGNhbGVuZGFyTW9kZWwuZ2V0RXZlbnRzQnlVaWQodWlkKSk/LmFsdGVyZWRJbnN0YW5jZXMubWFwKChpKSA9PiBpLnJlY3VycmVuY2VJZCkgPz8gW11cblx0Y29uc3Qgbm90aWZpY2F0aW9uTW9kZWwgPSBuZXcgQ2FsZW5kYXJOb3RpZmljYXRpb25Nb2RlbChub3RpZmljYXRpb25TZW5kZXIsIGxvZ2lucylcblx0Y29uc3QgYXBwbHlTdHJhdGVnaWVzID0gbmV3IENhbGVuZGFyRXZlbnRBcHBseVN0cmF0ZWdpZXMoY2FsZW5kYXJNb2RlbCwgbG9naW5zLCBub3RpZmljYXRpb25Nb2RlbCwgcmVjdXJyZW5jZUlkcywgc2hvd1Byb2dyZXNzLCB6b25lKVxuXHRjb25zdCBpbml0aWFsT3JEZWZhdWx0VmFsdWVzID0gT2JqZWN0LmFzc2lnbihtYWtlRW1wdHlDYWxlbmRhckV2ZW50KCksIGluaXRpYWxWYWx1ZXMpXG5cdGNvbnN0IGNsZWFuSW5pdGlhbFZhbHVlcyA9IGNsZWFudXBJbml0aWFsVmFsdWVzRm9yRWRpdGluZyhpbml0aWFsT3JEZWZhdWx0VmFsdWVzKVxuXHRjb25zdCBwcm9nZW5pdG9yID0gKCkgPT4gY2FsZW5kYXJNb2RlbC5yZXNvbHZlQ2FsZW5kYXJFdmVudFByb2dlbml0b3IoY2xlYW5Jbml0aWFsVmFsdWVzKVxuXHRjb25zdCBzdHJhdGVneSA9IGF3YWl0IHNlbGVjdFN0cmF0ZWd5KFxuXHRcdG1ha2VFZGl0TW9kZWxzLFxuXHRcdGFwcGx5U3RyYXRlZ2llcyxcblx0XHRvcGVyYXRpb24sXG5cdFx0cHJvZ2VuaXRvcixcblx0XHRjcmVhdGVDYWxlbmRhckV2ZW50KGluaXRpYWxPckRlZmF1bHRWYWx1ZXMpLFxuXHRcdGNsZWFuSW5pdGlhbFZhbHVlcyxcblx0KVxuXHRyZXR1cm4gc3RyYXRlZ3kgJiYgbmV3IENhbGVuZGFyRXZlbnRNb2RlbChzdHJhdGVneSwgZXZlbnRUeXBlLCBvcGVyYXRpb24sIGxvZ2lucy5nZXRVc2VyQ29udHJvbGxlcigpLCBub3RpZmljYXRpb25TZW5kZXIsIGVudGl0eUNsaWVudCwgY2FsZW5kYXJzKVxufVxuXG5hc3luYyBmdW5jdGlvbiBzZWxlY3RTdHJhdGVneShcblx0bWFrZUVkaXRNb2RlbHM6IChpOiBTdHJpcHBlZEVudGl0eTxDYWxlbmRhckV2ZW50PikgPT4gQ2FsZW5kYXJFdmVudEVkaXRNb2RlbHMsXG5cdGFwcGx5U3RyYXRlZ2llczogQ2FsZW5kYXJFdmVudEFwcGx5U3RyYXRlZ2llcyxcblx0b3BlcmF0aW9uOiBDYWxlbmRhck9wZXJhdGlvbixcblx0cmVzb2x2ZVByb2dlbml0b3I6ICgpID0+IFByb21pc2U8Q2FsZW5kYXJFdmVudCB8IG51bGw+LFxuXHRleGlzdGluZ0luc3RhbmNlSWRlbnRpdHk6IENhbGVuZGFyRXZlbnQsXG5cdGNsZWFuSW5pdGlhbFZhbHVlczogU3RyaXBwZWRFbnRpdHk8Q2FsZW5kYXJFdmVudD4sXG4pOiBQcm9taXNlPENhbGVuZGFyRXZlbnRNb2RlbFN0cmF0ZWd5IHwgbnVsbD4ge1xuXHRsZXQgZWRpdE1vZGVsczogQ2FsZW5kYXJFdmVudEVkaXRNb2RlbHNcblx0bGV0IGFwcGx5OiAoKSA9PiBQcm9taXNlPHZvaWQ+XG5cdGxldCBtYXlSZXF1aXJlU2VuZGluZ1VwZGF0ZXM6ICgpID0+IGJvb2xlYW5cblx0aWYgKG9wZXJhdGlvbiA9PT0gQ2FsZW5kYXJPcGVyYXRpb24uQ3JlYXRlKSB7XG5cdFx0ZWRpdE1vZGVscyA9IG1ha2VFZGl0TW9kZWxzKGNsZWFuSW5pdGlhbFZhbHVlcylcblx0XHRhcHBseSA9ICgpID0+IGFwcGx5U3RyYXRlZ2llcy5zYXZlTmV3RXZlbnQoZWRpdE1vZGVscylcblx0XHRtYXlSZXF1aXJlU2VuZGluZ1VwZGF0ZXMgPSAoKSA9PiB0cnVlXG5cdH0gZWxzZSBpZiAob3BlcmF0aW9uID09PSBDYWxlbmRhck9wZXJhdGlvbi5FZGl0VGhpcykge1xuXHRcdGNsZWFuSW5pdGlhbFZhbHVlcy5yZXBlYXRSdWxlID0gbnVsbFxuXHRcdGlmIChjbGVhbkluaXRpYWxWYWx1ZXMucmVjdXJyZW5jZUlkID09IG51bGwpIHtcblx0XHRcdGNvbnN0IHByb2dlbml0b3IgPSBhd2FpdCByZXNvbHZlUHJvZ2VuaXRvcigpXG5cdFx0XHRpZiAocHJvZ2VuaXRvciA9PSBudWxsIHx8IHByb2dlbml0b3IucmVwZWF0UnVsZSA9PSBudWxsKSB7XG5cdFx0XHRcdGNvbnNvbGUud2FybihcIm5vIHJlcGVhdGluZyBwcm9nZW5pdG9yIGR1cmluZyBFZGl0VGhpcyBvcGVyYXRpb24/XCIpXG5cdFx0XHRcdHJldHVybiBudWxsXG5cdFx0XHR9XG5cdFx0XHRhcHBseSA9ICgpID0+XG5cdFx0XHRcdGFwcGx5U3RyYXRlZ2llcy5zYXZlTmV3QWx0ZXJlZEluc3RhbmNlKHtcblx0XHRcdFx0XHRlZGl0TW9kZWxzOiBlZGl0TW9kZWxzLFxuXHRcdFx0XHRcdGVkaXRNb2RlbHNGb3JQcm9nZW5pdG9yOiBtYWtlRWRpdE1vZGVscyhwcm9nZW5pdG9yKSxcblx0XHRcdFx0XHRleGlzdGluZ0luc3RhbmNlOiBleGlzdGluZ0luc3RhbmNlSWRlbnRpdHksXG5cdFx0XHRcdFx0cHJvZ2VuaXRvcjogcHJvZ2VuaXRvcixcblx0XHRcdFx0fSlcblx0XHRcdG1heVJlcXVpcmVTZW5kaW5nVXBkYXRlcyA9ICgpID0+IHRydWVcblx0XHRcdGVkaXRNb2RlbHMgPSBtYWtlRWRpdE1vZGVscyhjbGVhbkluaXRpYWxWYWx1ZXMpXG5cdFx0fSBlbHNlIHtcblx0XHRcdGVkaXRNb2RlbHMgPSBtYWtlRWRpdE1vZGVscyhjbGVhbkluaXRpYWxWYWx1ZXMpXG5cdFx0XHRhcHBseSA9ICgpID0+IGFwcGx5U3RyYXRlZ2llcy5zYXZlRXhpc3RpbmdBbHRlcmVkSW5zdGFuY2UoZWRpdE1vZGVscywgZXhpc3RpbmdJbnN0YW5jZUlkZW50aXR5KVxuXHRcdFx0bWF5UmVxdWlyZVNlbmRpbmdVcGRhdGVzID0gKCkgPT4gYXNzZW1ibGVFZGl0UmVzdWx0QW5kQXNzaWduRnJvbUV4aXN0aW5nKGV4aXN0aW5nSW5zdGFuY2VJZGVudGl0eSwgZWRpdE1vZGVscywgb3BlcmF0aW9uKS5oYXNVcGRhdGVXb3J0aHlDaGFuZ2VzXG5cdFx0fVxuXHR9IGVsc2UgaWYgKG9wZXJhdGlvbiA9PT0gQ2FsZW5kYXJPcGVyYXRpb24uRGVsZXRlVGhpcykge1xuXHRcdGlmIChjbGVhbkluaXRpYWxWYWx1ZXMucmVjdXJyZW5jZUlkID09IG51bGwpIHtcblx0XHRcdGNvbnN0IHByb2dlbml0b3IgPSBhd2FpdCByZXNvbHZlUHJvZ2VuaXRvcigpXG5cdFx0XHRpZiAocHJvZ2VuaXRvciA9PSBudWxsKSB7XG5cdFx0XHRcdHJldHVybiBudWxsXG5cdFx0XHR9XG5cdFx0XHRlZGl0TW9kZWxzID0gbWFrZUVkaXRNb2RlbHMocHJvZ2VuaXRvcilcblx0XHRcdGFwcGx5ID0gKCkgPT4gYXBwbHlTdHJhdGVnaWVzLmV4Y2x1ZGVTaW5nbGVJbnN0YW5jZShlZGl0TW9kZWxzLCBleGlzdGluZ0luc3RhbmNlSWRlbnRpdHksIHByb2dlbml0b3IpXG5cdFx0XHRtYXlSZXF1aXJlU2VuZGluZ1VwZGF0ZXMgPSAoKSA9PiB0cnVlXG5cdFx0fSBlbHNlIHtcblx0XHRcdGVkaXRNb2RlbHMgPSBtYWtlRWRpdE1vZGVscyhjbGVhbkluaXRpYWxWYWx1ZXMpXG5cdFx0XHRhcHBseSA9ICgpID0+IGFwcGx5U3RyYXRlZ2llcy5kZWxldGVBbHRlcmVkSW5zdGFuY2UoZWRpdE1vZGVscywgZXhpc3RpbmdJbnN0YW5jZUlkZW50aXR5KVxuXHRcdFx0bWF5UmVxdWlyZVNlbmRpbmdVcGRhdGVzID0gKCkgPT4gdHJ1ZVxuXHRcdH1cblx0fSBlbHNlIGlmIChvcGVyYXRpb24gPT09IENhbGVuZGFyT3BlcmF0aW9uLkVkaXRBbGwpIHtcblx0XHRjb25zdCBwcm9nZW5pdG9yID0gYXdhaXQgcmVzb2x2ZVByb2dlbml0b3IoKVxuXHRcdGlmIChwcm9nZW5pdG9yID09IG51bGwpIHtcblx0XHRcdHJldHVybiBudWxsXG5cdFx0fVxuXHRcdGVkaXRNb2RlbHMgPSBtYWtlRWRpdE1vZGVscyhjbGVhbkluaXRpYWxWYWx1ZXMpXG5cdFx0YXBwbHkgPSAoKSA9PiBhcHBseVN0cmF0ZWdpZXMuc2F2ZUVudGlyZUV4aXN0aW5nRXZlbnQoZWRpdE1vZGVscywgcHJvZ2VuaXRvcilcblx0XHRtYXlSZXF1aXJlU2VuZGluZ1VwZGF0ZXMgPSAoKSA9PiBhc3NlbWJsZUVkaXRSZXN1bHRBbmRBc3NpZ25Gcm9tRXhpc3RpbmcoZXhpc3RpbmdJbnN0YW5jZUlkZW50aXR5LCBlZGl0TW9kZWxzLCBvcGVyYXRpb24pLmhhc1VwZGF0ZVdvcnRoeUNoYW5nZXNcblx0fSBlbHNlIGlmIChvcGVyYXRpb24gPT09IENhbGVuZGFyT3BlcmF0aW9uLkRlbGV0ZUFsbCkge1xuXHRcdGVkaXRNb2RlbHMgPSBtYWtlRWRpdE1vZGVscyhjbGVhbkluaXRpYWxWYWx1ZXMpXG5cdFx0YXBwbHkgPSAoKSA9PiBhcHBseVN0cmF0ZWdpZXMuZGVsZXRlRW50aXJlRXhpc3RpbmdFdmVudChlZGl0TW9kZWxzLCBleGlzdGluZ0luc3RhbmNlSWRlbnRpdHkpXG5cdFx0bWF5UmVxdWlyZVNlbmRpbmdVcGRhdGVzID0gKCkgPT4gYXNzZW1ibGVFZGl0UmVzdWx0QW5kQXNzaWduRnJvbUV4aXN0aW5nKGV4aXN0aW5nSW5zdGFuY2VJZGVudGl0eSwgZWRpdE1vZGVscywgb3BlcmF0aW9uKS5oYXNVcGRhdGVXb3J0aHlDaGFuZ2VzXG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IFByb2dyYW1taW5nRXJyb3IoYHVua25vd24gY2FsZW5kYXIgb3BlcmF0aW9uOiAke29wZXJhdGlvbn1gKVxuXHR9XG5cblx0cmV0dXJuIHsgYXBwbHksIG1heVJlcXVpcmVTZW5kaW5nVXBkYXRlcywgZWRpdE1vZGVscyB9XG59XG5cbi8qKiByZXR1cm4gYWxsIHRoZSBhdHRlbmRlZXMgaW4gdGhlIGxpc3Qgb2YgYXR0ZW5kZWVzIHRoYXQgYXJlIG5vdCB0aGUgZ2l2ZW4gb3JnYW5pemVyLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE5vbk9yZ2FuaXplckF0dGVuZGVlcyh7XG5cdG9yZ2FuaXplcixcblx0YXR0ZW5kZWVzLFxufTogUGFydGlhbDxQaWNrPFJlYWRvbmx5PENhbGVuZGFyRXZlbnQ+LCBcImF0dGVuZGVlc1wiIHwgXCJvcmdhbml6ZXJcIj4+KTogUmVhZG9ubHlBcnJheTxDYWxlbmRhckV2ZW50QXR0ZW5kZWU+IHtcblx0aWYgKGF0dGVuZGVlcyA9PSBudWxsKSByZXR1cm4gW11cblx0aWYgKG9yZ2FuaXplciA9PSBudWxsKSByZXR1cm4gYXR0ZW5kZWVzXG5cdGNvbnN0IG9yZ2FuaXplckFkZHJlc3MgPSBjbGVhbk1haWxBZGRyZXNzKG9yZ2FuaXplci5hZGRyZXNzKVxuXHRyZXR1cm4gYXR0ZW5kZWVzLmZpbHRlcigoYSkgPT4gY2xlYW5NYWlsQWRkcmVzcyhhLmFkZHJlc3MuYWRkcmVzcykgIT09IG9yZ2FuaXplckFkZHJlc3MpID8/IFtdXG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB0aGUgZXZlbnQgdHlwZSwgdGhlIG9yZ2FuaXplciBvZiB0aGUgZXZlbnQgYW5kIHBvc3NpYmxlIG9yZ2FuaXplcnMgaW4gYWNjb3JkYW5jZSB3aXRoIHRoZSBjYXBhYmlsaXRpZXMgZm9yIGV2ZW50cyAoc2VlIHRhYmxlKS5cbiAqL1xuZXhwb3J0IGNsYXNzIENhbGVuZGFyRXZlbnRNb2RlbCB7XG5cdHByb2Nlc3Npbmc6IGJvb2xlYW4gPSBmYWxzZVxuXG5cdGdldCBlZGl0TW9kZWxzKCk6IENhbGVuZGFyRXZlbnRFZGl0TW9kZWxzIHtcblx0XHRyZXR1cm4gdGhpcy5zdHJhdGVneS5lZGl0TW9kZWxzXG5cdH1cblxuXHRjb25zdHJ1Y3Rvcihcblx0XHRwcml2YXRlIHJlYWRvbmx5IHN0cmF0ZWd5OiBDYWxlbmRhckV2ZW50TW9kZWxTdHJhdGVneSxcblx0XHRwdWJsaWMgcmVhZG9ubHkgZXZlbnRUeXBlOiBFdmVudFR5cGUsXG5cdFx0cHVibGljIHJlYWRvbmx5IG9wZXJhdGlvbjogQ2FsZW5kYXJPcGVyYXRpb24sXG5cdFx0Ly8gVXNlckNvbnRyb2xsZXIgYWxyZWFkeSBrZWVwcyB0cmFjayBvZiB1c2VyIHVwZGF0ZXMsIGl0IGlzIGJldHRlciB0byBub3QgaGF2ZSBvdXIgb3duIHJlZmVyZW5jZSB0byB0aGUgdXNlciwgd2UgbWlnaHQgbWlzc1xuXHRcdC8vIGltcG9ydGFudCB1cGRhdGVzIGxpa2UgcHJlbWl1bSB1cGdyYWRlXG5cdFx0cmVhZG9ubHkgdXNlckNvbnRyb2xsZXI6IFVzZXJDb250cm9sbGVyLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgZGlzdHJpYnV0b3I6IENhbGVuZGFyTm90aWZpY2F0aW9uU2VuZGVyLFxuXHRcdHByaXZhdGUgcmVhZG9ubHkgZW50aXR5Q2xpZW50OiBFbnRpdHlDbGllbnQsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBjYWxlbmRhcnM6IFJlYWRvbmx5TWFwPElkLCBDYWxlbmRhckluZm8+LFxuXHQpIHtcblx0XHR0aGlzLmNhbGVuZGFycyA9IGNhbGVuZGFyc1xuXHR9XG5cblx0YXN5bmMgYXBwbHkoKTogUHJvbWlzZTxFdmVudFNhdmVSZXN1bHQ+IHtcblx0XHRpZiAodGhpcy51c2VyQ29udHJvbGxlci51c2VyLmFjY291bnRUeXBlID09PSBBY2NvdW50VHlwZS5FWFRFUk5BTCkge1xuXHRcdFx0Y29uc29sZS5sb2coXCJkaWQgbm90IGFwcGx5IGV2ZW50IGNoYW5nZXMsIHdlJ3JlIGFuIGV4dGVybmFsIHVzZXIuXCIpXG5cdFx0XHRyZXR1cm4gRXZlbnRTYXZlUmVzdWx0LkZhaWxlZFxuXHRcdH1cblx0XHRpZiAodGhpcy5wcm9jZXNzaW5nKSB7XG5cdFx0XHRyZXR1cm4gRXZlbnRTYXZlUmVzdWx0LkZhaWxlZFxuXHRcdH1cblx0XHR0aGlzLnByb2Nlc3NpbmcgPSB0cnVlXG5cblx0XHR0cnkge1xuXHRcdFx0YXdhaXQgdGhpcy5zdHJhdGVneS5hcHBseSgpXG5cdFx0XHRyZXR1cm4gRXZlbnRTYXZlUmVzdWx0LlNhdmVkXG5cdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0aWYgKGUgaW5zdGFuY2VvZiBQYXlsb2FkVG9vTGFyZ2VFcnJvcikge1xuXHRcdFx0XHR0aHJvdyBuZXcgVXNlckVycm9yKFwicmVxdWVzdFRvb0xhcmdlX21zZ1wiKVxuXHRcdFx0fSBlbHNlIGlmIChlIGluc3RhbmNlb2YgTm90Rm91bmRFcnJvcikge1xuXHRcdFx0XHRyZXR1cm4gRXZlbnRTYXZlUmVzdWx0Lk5vdEZvdW5kXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBlXG5cdFx0XHR9XG5cdFx0fSBmaW5hbGx5IHtcblx0XHRcdHRoaXMucHJvY2Vzc2luZyA9IGZhbHNlXG5cdFx0fVxuXHR9XG5cblx0LyoqIGZhbHNlIGlmIHRoZSBldmVudCBpcyBvbmx5IHBhcnRpYWxseSBvciBub3QgYXQgYWxsIHdyaXRhYmxlICovXG5cdGlzRnVsbHlXcml0YWJsZSgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5ldmVudFR5cGUgPT09IEV2ZW50VHlwZS5PV04gfHwgdGhpcy5ldmVudFR5cGUgPT09IEV2ZW50VHlwZS5TSEFSRURfUldcblx0fVxuXG5cdC8qKiBzb21lIGVkaXQgb3BlcmF0aW9ucyBhcHBseSB0byB0aGUgd2hvbGUgZXZlbnQgc2VyaWVzLlxuXHQgKiB0aGV5IGFyZSBub3QgcG9zc2libGUgaWYgdGhlIG9wZXJhdGlvbiB0aGUgbW9kZWwgd2FzIGNyZWF0ZWQgd2l0aCBvbmx5IGFwcGxpZXMgdG8gYSBzaW5nbGUgaW5zdGFuY2UuXG5cdCAqXG5cdCAqIHJldHVybnMgdHJ1ZSBpZiBzdWNoIG9wZXJhdGlvbnMgY2FuIGJlIGF0dGVtcHRlZC5cblx0ICogKi9cblx0Y2FuRWRpdFNlcmllcygpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5vcGVyYXRpb24gIT09IENhbGVuZGFyT3BlcmF0aW9uLkVkaXRUaGlzICYmICh0aGlzLmV2ZW50VHlwZSA9PT0gRXZlbnRUeXBlLk9XTiB8fCB0aGlzLmV2ZW50VHlwZSA9PT0gRXZlbnRUeXBlLlNIQVJFRF9SVylcblx0fVxuXG5cdGNhbkNoYW5nZUNhbGVuZGFyKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiAoXG5cdFx0XHR0aGlzLm9wZXJhdGlvbiAhPT0gQ2FsZW5kYXJPcGVyYXRpb24uRWRpdFRoaXMgJiZcblx0XHRcdCh0aGlzLmV2ZW50VHlwZSA9PT0gRXZlbnRUeXBlLk9XTiB8fCB0aGlzLmV2ZW50VHlwZSA9PT0gRXZlbnRUeXBlLlNIQVJFRF9SVyB8fCB0aGlzLmV2ZW50VHlwZSA9PT0gRXZlbnRUeXBlLklOVklURSlcblx0XHQpXG5cdH1cblxuXHRpc0Fza2luZ0ZvclVwZGF0ZXNOZWVkZWQoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIChcblx0XHRcdHRoaXMuZXZlbnRUeXBlID09PSBFdmVudFR5cGUuT1dOICYmXG5cdFx0XHQhdGhpcy5lZGl0TW9kZWxzLndob01vZGVsLnNob3VsZFNlbmRVcGRhdGVzICYmXG5cdFx0XHR0aGlzLmVkaXRNb2RlbHMud2hvTW9kZWwuaW5pdGlhbGx5SGFkT3RoZXJBdHRlbmRlZXMgJiZcblx0XHRcdHRoaXMuc3RyYXRlZ3kubWF5UmVxdWlyZVNlbmRpbmdVcGRhdGVzKClcblx0XHQpXG5cdH1cblxuXHRnZXRSZWFkb25seVJlYXNvbigpOiBSZWFkb25seVJlYXNvbiB7XG5cdFx0Y29uc3QgaXNGdWxseVdyaXRhYmxlID0gdGhpcy5pc0Z1bGx5V3JpdGFibGUoKVxuXHRcdGNvbnN0IGNhbkVkaXRTZXJpZXMgPSB0aGlzLmNhbkVkaXRTZXJpZXMoKVxuXHRcdGNvbnN0IGNhbk1vZGlmeUd1ZXN0cyA9IHRoaXMuZWRpdE1vZGVscy53aG9Nb2RlbC5jYW5Nb2RpZnlHdWVzdHNcblxuXHRcdGlmIChpc0Z1bGx5V3JpdGFibGUgJiYgY2FuRWRpdFNlcmllcyAmJiBjYW5Nb2RpZnlHdWVzdHMpIHJldHVybiBSZWFkb25seVJlYXNvbi5OT05FXG5cdFx0aWYgKCFpc0Z1bGx5V3JpdGFibGUgJiYgIWNhbkVkaXRTZXJpZXMgJiYgIWNhbk1vZGlmeUd1ZXN0cykgcmV0dXJuIFJlYWRvbmx5UmVhc29uLk5PVF9PUkdBTklaRVJcblx0XHQvLyBmdWxseSB3cml0YWJsZSBhbmQgIWNhbk1vZGlmeUd1ZXN0cyBoYXBwZW5zIG9uIHNoYXJlZCBjYWxlbmRhcnNcblx0XHRpZiAoIWNhbk1vZGlmeUd1ZXN0cykge1xuXHRcdFx0aWYgKGNhbkVkaXRTZXJpZXMpIHtcblx0XHRcdFx0cmV0dXJuIFJlYWRvbmx5UmVhc29uLlNIQVJFRFxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIFJlYWRvbmx5UmVhc29uLlNJTkdMRV9JTlNUQU5DRVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gUmVhZG9ubHlSZWFzb24uVU5LTk9XTlxuXHR9XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSBub3cgdGhlIG5ldyBldmVudC5cbiAqIEBwYXJhbSBwcmV2aW91cyB0aGUgZXZlbnQgYXMgaXQgb3JpZ2luYWxseSB3YXNcbiAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIGNoYW5nZXMgd2VyZSBtYWRlIHRvIHRoZSBldmVudCB0aGF0IGp1c3RpZnkgc2VuZGluZyB1cGRhdGVzIHRvIGF0dGVuZGVlcy5cbiAqIGV4cG9ydGVkIGZvciB0ZXN0aW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBldmVudEhhc0NoYW5nZWQobm93OiBDYWxlbmRhckV2ZW50LCBwcmV2aW91czogUGFydGlhbDxDYWxlbmRhckV2ZW50PiB8IG51bGwpOiBib29sZWFuIHtcblx0aWYgKHByZXZpb3VzID09IG51bGwpIHJldHVybiB0cnVlXG5cdC8vIHdlIGRvIG5vdCBjaGVjayBmb3IgdGhlIHNlcXVlbmNlIG51bWJlciAoYXMgaXQgc2hvdWxkIGJlIGNoYW5nZWQgd2l0aCBldmVyeSB1cGRhdGUpIG9yIHRoZSBkZWZhdWx0IGluc3RhbmNlIHByb3BlcnRpZXMgc3VjaCBhcyBfaWRcblx0cmV0dXJuIChcblx0XHRub3cuc3RhcnRUaW1lLmdldFRpbWUoKSAhPT0gcHJldmlvdXM/LnN0YXJ0VGltZT8uZ2V0VGltZSgpIHx8XG5cdFx0bm93LmRlc2NyaXB0aW9uICE9PSBwcmV2aW91cz8uZGVzY3JpcHRpb24gfHxcblx0XHRub3cuc3VtbWFyeSAhPT0gcHJldmlvdXMuc3VtbWFyeSB8fFxuXHRcdG5vdy5sb2NhdGlvbiAhPT0gcHJldmlvdXMubG9jYXRpb24gfHxcblx0XHRub3cuZW5kVGltZS5nZXRUaW1lKCkgIT09IHByZXZpb3VzPy5lbmRUaW1lPy5nZXRUaW1lKCkgfHxcblx0XHRub3cuaW52aXRlZENvbmZpZGVudGlhbGx5ICE9PSBwcmV2aW91cy5pbnZpdGVkQ29uZmlkZW50aWFsbHkgfHxcblx0XHQvLyBzaG91bGQgdGhpcyBiZSBhIGhhcmQgZXJyb3IsIHdlIG5ldmVyIHdhbnQgdG8gY2hhbmdlIHRoZSB1aWQgb3IgY29tcGFyZSBldmVudHMgd2l0aCBkaWZmZXJlbnQgVUlEcz9cblx0XHRub3cudWlkICE9PSBwcmV2aW91cy51aWQgfHxcblx0XHQhYXJlUmVwZWF0UnVsZXNFcXVhbChub3cucmVwZWF0UnVsZSwgcHJldmlvdXM/LnJlcGVhdFJ1bGUgPz8gbnVsbCkgfHxcblx0XHQhYXJyYXlFcXVhbHNXaXRoUHJlZGljYXRlKFxuXHRcdFx0bm93LmF0dGVuZGVlcyxcblx0XHRcdHByZXZpb3VzPy5hdHRlbmRlZXMgPz8gW10sXG5cdFx0XHQoYTEsIGEyKSA9PiBhMS5zdGF0dXMgPT09IGEyLnN0YXR1cyAmJiBjbGVhbk1haWxBZGRyZXNzKGExLmFkZHJlc3MuYWRkcmVzcykgPT09IGNsZWFuTWFpbEFkZHJlc3MoYTIuYWRkcmVzcy5hZGRyZXNzKSxcblx0XHQpIHx8IC8vIHdlIGlnbm9yZSB0aGUgbmFtZXNcblx0XHQobm93Lm9yZ2FuaXplciAhPT0gcHJldmlvdXMub3JnYW5pemVyICYmIG5vdy5vcmdhbml6ZXI/LmFkZHJlc3MgIT09IHByZXZpb3VzLm9yZ2FuaXplcj8uYWRkcmVzcylcblx0KSAvLyB3ZSBpZ25vcmUgdGhlIG5hbWVzXG59XG5cbi8qKlxuICogY29uc3RydWN0IGEgdXNhYmxlIGNhbGVuZGFyIGV2ZW50IGZyb20gdGhlIHJlc3VsdCBvZiBvbmUgb3IgbW9yZSBlZGl0IG9wZXJhdGlvbnMuXG4gKiByZXR1cm5zIHRoZSBuZXcgYWxhcm1zIHNlcGFyYXRlbHkgc28gdGhleSBjYW4gYmUgc2V0IHVwXG4gKiBvbiB0aGUgc2VydmVyIGJlZm9yZSBhc3NpZ25pbmcgdGhlIGlkcy5cbiAqIEBwYXJhbSBtb2RlbHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2VtYmxlQ2FsZW5kYXJFdmVudEVkaXRSZXN1bHQobW9kZWxzOiBDYWxlbmRhckV2ZW50RWRpdE1vZGVscyk6IHtcblx0ZXZlbnRWYWx1ZXM6IENhbGVuZGFyRXZlbnRWYWx1ZXNcblx0bmV3QWxhcm1zOiBSZWFkb25seUFycmF5PEFsYXJtSW5mb1RlbXBsYXRlPlxuXHRzZW5kTW9kZWxzOiBDYWxlbmRhck5vdGlmaWNhdGlvblNlbmRNb2RlbHNcblx0Y2FsZW5kYXI6IENhbGVuZGFySW5mb1xufSB7XG5cdGNvbnN0IHdoZW5SZXN1bHQgPSBtb2RlbHMud2hlbk1vZGVsLnJlc3VsdFxuXHRjb25zdCB3aG9SZXN1bHQgPSBtb2RlbHMud2hvTW9kZWwucmVzdWx0XG5cdGNvbnN0IGFsYXJtUmVzdWx0ID0gbW9kZWxzLmFsYXJtTW9kZWwucmVzdWx0XG5cdGNvbnN0IHN1bW1hcnkgPSBtb2RlbHMuc3VtbWFyeS5jb250ZW50XG5cdGNvbnN0IGRlc2NyaXB0aW9uID0gbW9kZWxzLmRlc2NyaXB0aW9uLmNvbnRlbnRcblx0Y29uc3QgbG9jYXRpb24gPSBtb2RlbHMubG9jYXRpb24uY29udGVudFxuXG5cdHJldHVybiB7XG5cdFx0ZXZlbnRWYWx1ZXM6IHtcblx0XHRcdC8vIHdoZW4/XG5cdFx0XHRzdGFydFRpbWU6IHdoZW5SZXN1bHQuc3RhcnRUaW1lLFxuXHRcdFx0ZW5kVGltZTogd2hlblJlc3VsdC5lbmRUaW1lLFxuXHRcdFx0cmVwZWF0UnVsZTogd2hlblJlc3VsdC5yZXBlYXRSdWxlLFxuXHRcdFx0Ly8gd2hhdD9cblx0XHRcdHN1bW1hcnksXG5cdFx0XHRkZXNjcmlwdGlvbixcblx0XHRcdC8vIHdoZXJlP1xuXHRcdFx0bG9jYXRpb24sXG5cdFx0XHQvLyB3aG8/XG5cdFx0XHRpbnZpdGVkQ29uZmlkZW50aWFsbHk6IHdob1Jlc3VsdC5pc0NvbmZpZGVudGlhbCxcblx0XHRcdG9yZ2FuaXplcjogd2hvUmVzdWx0Lm9yZ2FuaXplcixcblx0XHRcdGF0dGVuZGVlczogd2hvUmVzdWx0LmF0dGVuZGVlcyxcblx0XHRcdC8vIGZpZWxkcyByZWxhdGVkIHRvIHRoZSBldmVudCBpbnN0YW5jZSdzIGlkZW50aXR5IGFyZSBleGNsdWRlZC5cblx0XHRcdC8vIHJlbWluZGVycy4gd2lsbCBiZSBzZXQgdXAgc2VwYXJhdGVseS5cblx0XHRcdGFsYXJtSW5mb3M6IFtdLFxuXHRcdH0sXG5cdFx0bmV3QWxhcm1zOiBhbGFybVJlc3VsdC5hbGFybXMsXG5cdFx0c2VuZE1vZGVsczogd2hvUmVzdWx0LFxuXHRcdGNhbGVuZGFyOiB3aG9SZXN1bHQuY2FsZW5kYXIsXG5cdH1cbn1cblxuLyoqIGFzc2VtYmxlIHRoZSBlZGl0IHJlc3VsdCBmcm9tIGFuIGV4aXN0aW5nIGV2ZW50IGVkaXQgb3BlcmF0aW9uIGFuZCBhcHBseSBzb21lIGZpZWxkcyBmcm9tIHRoZSBvcmlnaW5hbCBldmVudFxuICogQHBhcmFtIGV4aXN0aW5nRXZlbnQgdGhlIGV2ZW50IHdlIHdpbGwgYmUgdXBkYXRpbmcgYW5kIHRha2UgaWQsIG93bmVyR3JvdXAgYW5kIHBlcm1pc3Npb25zIGZyb20gYXMgd2VsbCBhcyB0aGUgdWlkLCBzZXF1ZW5jZSB0byBpbmNyZW1lbnQgYW5kIHJlY3VycmVuY2VJZFxuICogQHBhcmFtIGVkaXRNb2RlbHMgdGhlIGVkaXRNb2RlbHMgcHJvdmlkaW5nIHRoZSB2YWx1ZXMgZm9yIHRoZSBuZXcgZXZlbnQuXG4gKiBAcGFyYW0gb3BlcmF0aW9uIGRldGVybWluZXMgdGhlIHNvdXJjZSBvZiB0aGUgcmVjdXJyZW5jZUlkIC0gaW4gdGhlIGNhc2Ugb2YgRWRpdFRoaXMgaXQncyB0aGUgc3RhcnQgdGltZSBvZiB0aGUgb3JpZ2luYWwgZXZlbnQsIG90aGVyd2lzZSBleGlzdGluZ0V2ZW50cycgcmVjdXJyZW5jZUlkIGlzIHVzZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlbWJsZUVkaXRSZXN1bHRBbmRBc3NpZ25Gcm9tRXhpc3RpbmcoZXhpc3RpbmdFdmVudDogQ2FsZW5kYXJFdmVudCwgZWRpdE1vZGVsczogQ2FsZW5kYXJFdmVudEVkaXRNb2RlbHMsIG9wZXJhdGlvbjogQ2FsZW5kYXJPcGVyYXRpb24pIHtcblx0Y29uc3QgYXNzZW1ibGVSZXN1bHQgPSBhc3NlbWJsZUNhbGVuZGFyRXZlbnRFZGl0UmVzdWx0KGVkaXRNb2RlbHMpXG5cdGNvbnN0IHsgdWlkOiBvbGRVaWQsIHNlcXVlbmNlOiBvbGRTZXF1ZW5jZSwgcmVjdXJyZW5jZUlkIH0gPSBleGlzdGluZ0V2ZW50XG5cdGNvbnN0IG5ld0V2ZW50ID0gYXNzaWduRXZlbnRJZGVudGl0eShhc3NlbWJsZVJlc3VsdC5ldmVudFZhbHVlcywge1xuXHRcdHVpZDogb2xkVWlkISxcblx0XHRzZXF1ZW5jZTogaW5jcmVtZW50U2VxdWVuY2Uob2xkU2VxdWVuY2UpLFxuXHRcdHJlY3VycmVuY2VJZDogb3BlcmF0aW9uID09PSBDYWxlbmRhck9wZXJhdGlvbi5FZGl0VGhpcyAmJiByZWN1cnJlbmNlSWQgPT0gbnVsbCA/IGV4aXN0aW5nRXZlbnQuc3RhcnRUaW1lIDogcmVjdXJyZW5jZUlkLFxuXHR9KVxuXG5cdGFzc2VydEV2ZW50VmFsaWRpdHkobmV3RXZlbnQpXG5cblx0bmV3RXZlbnQuX2lkID0gZXhpc3RpbmdFdmVudC5faWRcblx0bmV3RXZlbnQuX293bmVyR3JvdXAgPSBleGlzdGluZ0V2ZW50Ll9vd25lckdyb3VwXG5cdG5ld0V2ZW50Ll9wZXJtaXNzaW9ucyA9IGV4aXN0aW5nRXZlbnQuX3Blcm1pc3Npb25zXG5cblx0cmV0dXJuIHtcblx0XHRoYXNVcGRhdGVXb3J0aHlDaGFuZ2VzOiBldmVudEhhc0NoYW5nZWQobmV3RXZlbnQsIGV4aXN0aW5nRXZlbnQpLFxuXHRcdG5ld0V2ZW50LFxuXHRcdGNhbGVuZGFyOiBhc3NlbWJsZVJlc3VsdC5jYWxlbmRhcixcblx0XHRuZXdBbGFybXM6IGFzc2VtYmxlUmVzdWx0Lm5ld0FsYXJtcyxcblx0XHRzZW5kTW9kZWxzOiBhc3NlbWJsZVJlc3VsdC5zZW5kTW9kZWxzLFxuXHR9XG59XG5cbi8qKlxuICogY29tYmluZSBldmVudCB2YWx1ZXMgd2l0aCB0aGUgZmllbGRzIHJlcXVpcmVkIHRvIGlkZW50aWZ5IGEgcGFydGljdWxhciBpbnN0YW5jZSBvZiB0aGUgZXZlbnQuXG4gKiBAcGFyYW0gdmFsdWVzXG4gKiBAcGFyYW0gaWRlbnRpdHkgc2VxdWVuY2UgKGRlZmF1bHQgXCIwXCIpIGFuZCByZWN1cnJlbmNlSWQgKGRlZmF1bHQgbnVsbCkgYXJlIG9wdGlvbmFsLCBidXQgdGhlIHVpZCBtdXN0IGJlIHNwZWNpZmllZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFzc2lnbkV2ZW50SWRlbnRpdHkodmFsdWVzOiBDYWxlbmRhckV2ZW50VmFsdWVzLCBpZGVudGl0eTogUmVxdWlyZTxcInVpZFwiLCBQYXJ0aWFsPENhbGVuZGFyRXZlbnRJZGVudGl0eT4+KTogQ2FsZW5kYXJFdmVudCB7XG5cdHJldHVybiBjcmVhdGVDYWxlbmRhckV2ZW50KHtcblx0XHRzZXF1ZW5jZTogXCIwXCIsXG5cdFx0cmVjdXJyZW5jZUlkOiBudWxsLFxuXHRcdGhhc2hlZFVpZDogbnVsbCxcblx0XHQuLi52YWx1ZXMsXG5cdFx0Li4uaWRlbnRpdHksXG5cdH0pXG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJlc29sdmVBbGFybXNGb3JFdmVudChhbGFybXM6IENhbGVuZGFyRXZlbnRbXCJhbGFybUluZm9zXCJdLCBjYWxlbmRhck1vZGVsOiBDYWxlbmRhck1vZGVsLCB1c2VyOiBVc2VyKTogUHJvbWlzZTxBcnJheTxBbGFybUludGVydmFsPj4ge1xuXHRjb25zdCBhbGFybUluZm9zID0gYXdhaXQgY2FsZW5kYXJNb2RlbC5sb2FkQWxhcm1zKGFsYXJtcywgdXNlcilcblx0cmV0dXJuIGFsYXJtSW5mb3MubWFwKCh7IGFsYXJtSW5mbyB9KSA9PiBwYXJzZUFsYXJtSW50ZXJ2YWwoYWxhcm1JbmZvLnRyaWdnZXIpKVxufVxuXG5mdW5jdGlvbiBtYWtlRW1wdHlDYWxlbmRhckV2ZW50KCk6IFN0cmlwcGVkRW50aXR5PENhbGVuZGFyRXZlbnQ+IHtcblx0cmV0dXJuIHtcblx0XHRhbGFybUluZm9zOiBbXSxcblx0XHRpbnZpdGVkQ29uZmlkZW50aWFsbHk6IG51bGwsXG5cdFx0aGFzaGVkVWlkOiBudWxsLFxuXHRcdHVpZDogbnVsbCxcblx0XHRyZWN1cnJlbmNlSWQ6IG51bGwsXG5cdFx0ZW5kVGltZTogbmV3IERhdGUoKSxcblx0XHRzdW1tYXJ5OiBcIlwiLFxuXHRcdHN0YXJ0VGltZTogbmV3IERhdGUoKSxcblx0XHRsb2NhdGlvbjogXCJcIixcblx0XHRyZXBlYXRSdWxlOiBudWxsLFxuXHRcdGRlc2NyaXB0aW9uOiBcIlwiLFxuXHRcdGF0dGVuZGVlczogW10sXG5cdFx0b3JnYW5pemVyOiBudWxsLFxuXHRcdHNlcXVlbmNlOiBcIlwiLFxuXHR9XG59XG5cbmZ1bmN0aW9uIGNsZWFudXBJbml0aWFsVmFsdWVzRm9yRWRpdGluZyhpbml0aWFsVmFsdWVzOiBTdHJpcHBlZEVudGl0eTxDYWxlbmRhckV2ZW50Pik6IENhbGVuZGFyRXZlbnQge1xuXHQvLyB0aGUgZXZlbnQgd2UgZ290IHBhc3NlZCBtYXkgYWxyZWFkeSBoYXZlIHNvbWUgdGVjaG5pY2FsIGZpZWxkcyBhc3NpZ25lZCwgc28gd2UgcmVtb3ZlIHRoZW0uXG5cdGNvbnN0IHN0cmlwcGVkID0gZ2V0U3RyaXBwZWRDbG9uZTxDYWxlbmRhckV2ZW50Pihpbml0aWFsVmFsdWVzKVxuXHRjb25zdCByZXN1bHQgPSBjcmVhdGVDYWxlbmRhckV2ZW50KHN0cmlwcGVkKVxuXG5cdC8vIHJlbW92ZSB0aGUgYWxhcm0gaW5mb3MgZnJvbSB0aGUgcmVzdWx0LCB0aGV5IGRvbid0IGNvbnRhaW4gYW55IHVzZWZ1bCBpbmZvcm1hdGlvbiBmb3IgdGhlIGVkaXRpbmcgb3BlcmF0aW9uLlxuXHQvLyBzZWxlY3RlZCBhbGFybXMgYXJlIHJldHVybmVkIGluIHRoZSBlZGl0IHJlc3VsdCBzZXBhcmF0ZSBmcm9tIHRoZSBldmVudC5cblx0cmVzdWx0LmFsYXJtSW5mb3MgPSBbXVxuXG5cdHJldHVybiByZXN1bHRcbn1cblxuLyoqIHdoZXRoZXIgdG8gY2xvc2UgZGlhbG9nICovXG5leHBvcnQgY29uc3QgZW51bSBFdmVudFNhdmVSZXN1bHQge1xuXHRTYXZlZCxcblx0RmFpbGVkLFxuXHROb3RGb3VuZCxcbn1cblxuLyoqIGdlbmVyaWMgZnVuY3Rpb24gdGhhdCBhc3luY2hyb25vdXNseSByZXR1cm5zIHdoYXRldmVyIHR5cGUgdGhlIGNhbGxlciBwYXNzZWQgaW4sIGJ1dCBub3QgbmVjZXNzYXJpbHkgdGhlIHNhbWUgcHJvbWlzZS4gKi9cbmV4cG9ydCB0eXBlIFNob3dQcm9ncmVzc0NhbGxiYWNrID0gPFQ+KGlucHV0OiBQcm9taXNlPFQ+KSA9PiBQcm9taXNlPFQ+XG5cbi8qKiBleHBvcnRlZCBmb3IgdGVzdGluZyAqL1xuZXhwb3J0IHR5cGUgQ2FsZW5kYXJFdmVudEVkaXRNb2RlbHMgPSB7XG5cdHdoZW5Nb2RlbDogQ2FsZW5kYXJFdmVudFdoZW5Nb2RlbFxuXHR3aG9Nb2RlbDogQ2FsZW5kYXJFdmVudFdob01vZGVsXG5cdGFsYXJtTW9kZWw6IENhbGVuZGFyRXZlbnRBbGFybU1vZGVsXG5cdGxvY2F0aW9uOiBTaW1wbGVUZXh0Vmlld01vZGVsXG5cdHN1bW1hcnk6IFNpbXBsZVRleHRWaWV3TW9kZWxcblx0ZGVzY3JpcHRpb246IFNhbml0aXplZFRleHRWaWV3TW9kZWxcbn1cblxuLyoqIHRoZSBmaWVsZHMgdGhhdCB0b2dldGhlciB3aXRoIHRoZSBzdGFydCB0aW1lIHBvaW50IHRvIGEgc3BlY2lmaWMgdmVyc2lvbiBhbmQgaW5zdGFuY2Ugb2YgYW4gZXZlbnQgKi9cbnR5cGUgRXZlbnRJZGVudGl0eUZpZWxkTmFtZXMgPSBcInVpZFwiIHwgXCJzZXF1ZW5jZVwiIHwgXCJyZWN1cnJlbmNlSWRcIlxuXG4vKipcbiAqIHJldHVybiB0aGUgY2FsZW5kYXIgdGhlIGdpdmVuIGV2ZW50IGJlbG9uZ3MgdG8sIGlmIGFueSwgb3RoZXJ3aXNlIGdldCB0aGUgZmlyc3Qgb25lIGZyb20gdGhlIGdpdmVuIGNhbGVuZGFycy5cbiAqIEBwYXJhbSBjYWxlbmRhcnMgbXVzdCBjb250YWluIGF0IGxlYXN0IG9uZSBjYWxlbmRhclxuICogQHBhcmFtIGV2ZW50XG4gKi9cbmZ1bmN0aW9uIGdldFByZXNlbGVjdGVkQ2FsZW5kYXIoY2FsZW5kYXJzOiBSZWFkb25seU1hcDxJZCwgQ2FsZW5kYXJJbmZvPiwgZXZlbnQ/OiBQYXJ0aWFsPENhbGVuZGFyRXZlbnQ+IHwgbnVsbCk6IENhbGVuZGFySW5mbyB7XG5cdGNvbnN0IG93bmVyR3JvdXA6IHN0cmluZyB8IG51bGwgPSBldmVudD8uX293bmVyR3JvdXAgPz8gbnVsbFxuXHRpZiAob3duZXJHcm91cCA9PSBudWxsIHx8ICFjYWxlbmRhcnMuaGFzKG93bmVyR3JvdXApKSB7XG5cdFx0Y29uc3QgY2FsZW5kYXIgPSBmaW5kRmlyc3RQcml2YXRlQ2FsZW5kYXIoY2FsZW5kYXJzKVxuXHRcdGlmICghY2FsZW5kYXIpIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGZpbmQgYSBwcml2YXRlIGNhbGVuZGFyXCIpXG5cdFx0cmV0dXJuIGNhbGVuZGFyXG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGFzc2VydE5vdE51bGwoY2FsZW5kYXJzLmdldChvd25lckdyb3VwKSwgXCJpbnZhbGlkIG93bmVyZ3JvdXAgZm9yIGV4aXN0aW5nIGV2ZW50P1wiKVxuXHR9XG59XG5cbi8qKiBnZXQgdGhlIGxpc3Qgb2YgbWFpbCBhZGRyZXNzZXMgdGhhdCBhcmUgZW5hYmxlZCBmb3IgdGhpcyBtYWlsYm94IHdpdGggdGhlIGNvbmZpZ3VyZWQgc2VuZGVyIG5hbWVzXG4gKiB3aWxsIHB1dCB0aGUgc2VuZGVyIHRoYXQgbWF0Y2hlcyB0aGUgZGVmYXVsdCBzZW5kZXIgYWRkcmVzcyBpbiB0aGUgZmlyc3Qgc3BvdC4gdGhpcyBlbmFibGVzIHVzIHRvIHVzZVxuICogaXQgYXMgYW4gZWFzeSBkZWZhdWx0IHdpdGhvdXQgaGF2aW5nIHRvIHBhc3MgaXQgYXJvdW5kIHNlcGFyYXRlbHkgKi9cbmZ1bmN0aW9uIGdldE93bk1haWxBZGRyZXNzZXNXaXRoRGVmYXVsdFNlbmRlckluRnJvbnQoXG5cdGxvZ2luczogTG9naW5Db250cm9sbGVyLFxuXHRtYWlsYm94RGV0YWlsOiBNYWlsYm94RGV0YWlsLFxuXHRtYWlsYm94UHJvcGVydGllczogTWFpbGJveFByb3BlcnRpZXMsXG4pOiBBcnJheTxFbmNyeXB0ZWRNYWlsQWRkcmVzcz4ge1xuXHRjb25zdCBkZWZhdWx0U2VuZGVyID0gZ2V0RGVmYXVsdFNlbmRlcihsb2dpbnMsIG1haWxib3hEZXRhaWwpXG5cdGNvbnN0IG93bk1haWxBZGRyZXNzZXMgPSBtYWlsYm94UHJvcGVydGllcy5tYWlsQWRkcmVzc1Byb3BlcnRpZXMubWFwKCh7IG1haWxBZGRyZXNzLCBzZW5kZXJOYW1lIH0pID0+XG5cdFx0Y3JlYXRlRW5jcnlwdGVkTWFpbEFkZHJlc3Moe1xuXHRcdFx0YWRkcmVzczogbWFpbEFkZHJlc3MsXG5cdFx0XHRuYW1lOiBzZW5kZXJOYW1lLFxuXHRcdH0pLFxuXHQpXG5cdGNvbnN0IGRlZmF1bHRJbmRleCA9IG93bk1haWxBZGRyZXNzZXMuZmluZEluZGV4KChhZGRyZXNzKSA9PiBhZGRyZXNzLmFkZHJlc3MgPT09IGRlZmF1bHRTZW5kZXIpXG5cdGlmIChkZWZhdWx0SW5kZXggPCAwKSB7XG5cdFx0Ly8gc2hvdWxkIG5vdCBoYXBwZW5cblx0XHRyZXR1cm4gb3duTWFpbEFkZHJlc3Nlc1xuXHR9XG5cdGNvbnN0IGRlZmF1bHRFbmNyeXB0ZWRNYWlsQWRkcmVzcyA9IG93bk1haWxBZGRyZXNzZXMuc3BsaWNlKGRlZmF1bHRJbmRleCwgMSlcblx0cmV0dXJuIFsuLi5kZWZhdWx0RW5jcnlwdGVkTWFpbEFkZHJlc3MsIC4uLm93bk1haWxBZGRyZXNzZXNdXG59XG4iLCJpbXBvcnQgbSwgeyBDaGlsZCwgQ2hpbGRBcnJheSwgQ2hpbGRyZW4gfSBmcm9tIFwibWl0aHJpbFwiXG5pbXBvcnQgdHlwZSB7IFRyYW5zbGF0aW9uS2V5IH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9taXNjL0xhbmd1YWdlVmlld01vZGVsLmpzXCJcbmltcG9ydCB7IGxhbmcgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL21pc2MvTGFuZ3VhZ2VWaWV3TW9kZWwuanNcIlxuaW1wb3J0IHsgQnV0dG9uVHlwZSB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvQnV0dG9uLmpzXCJcbmltcG9ydCB7IEljb25zIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9pY29ucy9JY29ucy5qc1wiXG5pbXBvcnQgeyBEaWFsb2cgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0RpYWxvZy5qc1wiXG5pbXBvcnQgdHlwZSB7IE1vdXNlUG9zQW5kQm91bmRzIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9HdWlVdGlscy5qc1wiXG5pbXBvcnQgeyBUaW1lIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9jYWxlbmRhci9kYXRlL1RpbWUuanNcIlxuaW1wb3J0IHtcblx0YXNzZXJ0LFxuXHRhc3NlcnROb3ROdWxsLFxuXHRjbGFtcCxcblx0Y2xvbmUsXG5cdGdldEZyb21NYXAsXG5cdGdldFN0YXJ0T2ZEYXksXG5cdGluY3JlbWVudERhdGUsXG5cdGlzTm90RW1wdHksXG5cdGlzU2FtZURheSxcblx0aXNTYW1lRGF5T2ZEYXRlLFxuXHRtZW1vaXplZCxcblx0bnVtYmVyUmFuZ2UsXG5cdHR5cGVkVmFsdWVzLFxufSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB7IEljb25CdXR0b24gfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0ljb25CdXR0b24uanNcIlxuaW1wb3J0IHtcblx0Zm9ybWF0RGF0ZVRpbWUsXG5cdGZvcm1hdERhdGVXaXRoTW9udGgsXG5cdGZvcm1hdERhdGVXaXRoV2Vla2RheSxcblx0Zm9ybWF0TW9udGhXaXRoRnVsbFllYXIsXG5cdGZvcm1hdFRpbWUsXG5cdHRpbWVTdHJpbmdGcm9tUGFydHMsXG59IGZyb20gXCIuLi8uLi8uLi9jb21tb24vbWlzYy9Gb3JtYXR0ZXIuanNcIlxuaW1wb3J0IHtcblx0QWxhcm1JbnRlcnZhbCxcblx0YWxhcm1JbnRlcnZhbFRvTHV4b25EdXJhdGlvbkxpa2VPYmplY3QsXG5cdEFsYXJtSW50ZXJ2YWxVbml0LFxuXHRDYWxlbmRhckRheSxcblx0Q2FsZW5kYXJNb250aCxcblx0ZXZlbnRFbmRzQWZ0ZXJEYXksXG5cdGV2ZW50U3RhcnRzQmVmb3JlLFxuXHRnZXRBbGxEYXlEYXRlRm9yVGltZXpvbmUsXG5cdGdldEVuZE9mRGF5V2l0aFpvbmUsXG5cdGdldEV2ZW50RW5kLFxuXHRnZXRFdmVudFN0YXJ0LFxuXHRnZXRTdGFydE9mRGF5V2l0aFpvbmUsXG5cdGdldFN0YXJ0T2ZOZXh0RGF5V2l0aFpvbmUsXG5cdGdldFN0YXJ0T2ZUaGVXZWVrT2Zmc2V0LFxuXHRnZXRTdGFydE9mV2Vlayxcblx0Z2V0VGltZVpvbmUsXG5cdGdldFdlZWtOdW1iZXIsXG5cdGluY3JlbWVudEJ5UmVwZWF0UGVyaW9kLFxuXHRTdGFuZGFyZEFsYXJtSW50ZXJ2YWwsXG59IGZyb20gXCIuLi8uLi8uLi9jb21tb24vY2FsZW5kYXIvZGF0ZS9DYWxlbmRhclV0aWxzLmpzXCJcbmltcG9ydCB7XG5cdEFjY291bnRUeXBlLFxuXHRDYWxlbmRhckF0dGVuZGVlU3RhdHVzLFxuXHRDTElFTlRfT05MWV9DQUxFTkRBUlMsXG5cdERFRkFVTFRfQ0xJRU5UX09OTFlfQ0FMRU5EQVJfQ09MT1JTLFxuXHRkZWZhdWx0Q2FsZW5kYXJDb2xvcixcblx0RW5kVHlwZSxcblx0RXZlbnRUZXh0VGltZU9wdGlvbixcblx0UmVwZWF0UGVyaW9kLFxuXHRTaGFyZUNhcGFiaWxpdHksXG5cdFdlZWtTdGFydCxcbn0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9hcGkvY29tbW9uL1R1dGFub3RhQ29uc3RhbnRzLmpzXCJcbmltcG9ydCB7IEFsbEljb25zIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9JY29uLmpzXCJcbmltcG9ydCB7IFNlbGVjdG9ySXRlbUxpc3QgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL0Ryb3BEb3duU2VsZWN0b3IuanNcIlxuaW1wb3J0IHsgRGF0ZVRpbWUsIER1cmF0aW9uIH0gZnJvbSBcImx1eG9uXCJcbmltcG9ydCB7IENhbGVuZGFyRXZlbnRUaW1lcywgQ2FsZW5kYXJWaWV3VHlwZSwgY2xlYW5NYWlsQWRkcmVzcywgaXNBbGxEYXlFdmVudCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2NvbW1vbi91dGlscy9Db21tb25DYWxlbmRhclV0aWxzLmpzXCJcbmltcG9ydCB7IENhbGVuZGFyRXZlbnQsIFVzZXJTZXR0aW5nc0dyb3VwUm9vdCB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vYXBpL2VudGl0aWVzL3R1dGFub3RhL1R5cGVSZWZzLmpzXCJcbmltcG9ydCB7IFByb2dyYW1taW5nRXJyb3IgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9jb21tb24vZXJyb3IvUHJvZ3JhbW1pbmdFcnJvci5qc1wiXG5pbXBvcnQgeyBzaXplIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvc2l6ZS5qc1wiXG5pbXBvcnQgeyBoc2xUb0hleCwgaXNDb2xvckxpZ2h0LCBpc1ZhbGlkQ29sb3JDb2RlLCBNQVhfSFVFX0FOR0xFIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9Db2xvci5qc1wiXG5pbXBvcnQgeyBHcm91cENvbG9ycyB9IGZyb20gXCIuLi92aWV3L0NhbGVuZGFyVmlldy5qc1wiXG5pbXBvcnQgeyBDYWxlbmRhckluZm8gfSBmcm9tIFwiLi4vbW9kZWwvQ2FsZW5kYXJNb2RlbC5qc1wiXG5pbXBvcnQgeyBFdmVudFR5cGUgfSBmcm9tIFwiLi9ldmVudGVkaXRvci1tb2RlbC9DYWxlbmRhckV2ZW50TW9kZWwuanNcIlxuaW1wb3J0IHsgaGFzQ2FwYWJpbGl0eU9uR3JvdXAgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL3NoYXJpbmcvR3JvdXBVdGlscy5qc1wiXG5pbXBvcnQgeyBFdmVudHNPbkRheXMgfSBmcm9tIFwiLi4vdmlldy9DYWxlbmRhclZpZXdNb2RlbC5qc1wiXG5pbXBvcnQgeyBDYWxlbmRhckV2ZW50UHJldmlld1ZpZXdNb2RlbCB9IGZyb20gXCIuL2V2ZW50cG9wdXAvQ2FsZW5kYXJFdmVudFByZXZpZXdWaWV3TW9kZWwuanNcIlxuaW1wb3J0IHsgY3JlYXRlQXN5bmNEcm9wZG93biB9IGZyb20gXCIuLi8uLi8uLi9jb21tb24vZ3VpL2Jhc2UvRHJvcGRvd24uanNcIlxuaW1wb3J0IHsgVXNlckNvbnRyb2xsZXIgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2FwaS9tYWluL1VzZXJDb250cm9sbGVyLmpzXCJcbmltcG9ydCB7IENsaWVudE9ubHlDYWxlbmRhcnNJbmZvIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9taXNjL0RldmljZUNvbmZpZy5qc1wiXG5pbXBvcnQgeyBTZWxlY3RPcHRpb24gfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL1NlbGVjdC5qc1wiXG5pbXBvcnQgeyBSYWRpb0dyb3VwT3B0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL2NvbW1vbi9ndWkvYmFzZS9SYWRpb0dyb3VwLmpzXCJcbmltcG9ydCB7IENvbG9yUGlja2VyTW9kZWwgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS9iYXNlL2NvbG9yUGlja2VyL0NvbG9yUGlja2VyTW9kZWwuanNcIlxuaW1wb3J0IHsgdGhlbWUgfSBmcm9tIFwiLi4vLi4vLi4vY29tbW9uL2d1aS90aGVtZS5qc1wiXG5cbmV4cG9ydCBpbnRlcmZhY2UgSW50ZXJ2YWxPcHRpb24ge1xuXHR2YWx1ZTogbnVtYmVyXG5cdGFyaWFWYWx1ZTogc3RyaW5nXG5cdG5hbWU6IHN0cmluZ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyQ2FsZW5kYXJTd2l0Y2hMZWZ0QnV0dG9uKGxhYmVsOiBUcmFuc2xhdGlvbktleSwgY2xpY2s6ICgpID0+IHVua25vd24pOiBDaGlsZCB7XG5cdHJldHVybiBtKEljb25CdXR0b24sIHtcblx0XHR0aXRsZTogbGFiZWwsXG5cdFx0aWNvbjogSWNvbnMuQXJyb3dCYWNrd2FyZCxcblx0XHRjbGljayxcblx0fSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlckNhbGVuZGFyU3dpdGNoUmlnaHRCdXR0b24obGFiZWw6IFRyYW5zbGF0aW9uS2V5LCBjbGljazogKCkgPT4gdW5rbm93bik6IENoaWxkIHtcblx0cmV0dXJuIG0oSWNvbkJ1dHRvbiwge1xuXHRcdHRpdGxlOiBsYWJlbCxcblx0XHRpY29uOiBJY29ucy5BcnJvd0ZvcndhcmQsXG5cdFx0Y2xpY2ssXG5cdH0pXG59XG5cbmZ1bmN0aW9uIHdlZWtUaXRsZShkYXRlOiBEYXRlLCB3ZWVrU3RhcnQ6IFdlZWtTdGFydCk6IHN0cmluZyB7XG5cdGNvbnN0IHN0YXJ0T2ZUaGVXZWVrT2Zmc2V0ID0gZ2V0U3RhcnRPZlRoZVdlZWtPZmZzZXQod2Vla1N0YXJ0KVxuXHRjb25zdCBmaXJzdERhdGUgPSBnZXRTdGFydE9mV2VlayhkYXRlLCBzdGFydE9mVGhlV2Vla09mZnNldClcblx0Y29uc3QgbGFzdERhdGUgPSBpbmNyZW1lbnREYXRlKG5ldyBEYXRlKGZpcnN0RGF0ZSksIDYpXG5cblx0aWYgKGZpcnN0RGF0ZS5nZXRNb250aCgpICE9PSBsYXN0RGF0ZS5nZXRNb250aCgpKSB7XG5cdFx0aWYgKGZpcnN0RGF0ZS5nZXRGdWxsWWVhcigpICE9PSBsYXN0RGF0ZS5nZXRGdWxsWWVhcigpKSB7XG5cdFx0XHRyZXR1cm4gYCR7bGFuZy5mb3JtYXRzLm1vbnRoU2hvcnRXaXRoRnVsbFllYXIuZm9ybWF0KGZpcnN0RGF0ZSl9IC0gJHtsYW5nLmZvcm1hdHMubW9udGhTaG9ydFdpdGhGdWxsWWVhci5mb3JtYXQobGFzdERhdGUpfWBcblx0XHR9XG5cdFx0cmV0dXJuIGAke2xhbmcuZm9ybWF0cy5tb250aFNob3J0LmZvcm1hdChmaXJzdERhdGUpfSAtICR7bGFuZy5mb3JtYXRzLm1vbnRoU2hvcnQuZm9ybWF0KGxhc3REYXRlKX0gJHtsYW5nLmZvcm1hdHMueWVhck51bWVyaWMuZm9ybWF0KGZpcnN0RGF0ZSl9YFxuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBgJHtsYW5nLmZvcm1hdHMubW9udGhMb25nLmZvcm1hdChmaXJzdERhdGUpfSAke2xhbmcuZm9ybWF0cy55ZWFyTnVtZXJpYy5mb3JtYXQoZmlyc3REYXRlKX1gXG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE5leHRGb3VydGVlbkRheXMoc3RhcnRPZlRvZGF5OiBEYXRlKTogQXJyYXk8RGF0ZT4ge1xuXHRsZXQgY2FsY3VsYXRpb25EYXRlID0gbmV3IERhdGUoc3RhcnRPZlRvZGF5KVxuXHRjb25zdCBkYXlzOiBEYXRlW10gPSBbXVxuXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgMTQ7IGkrKykge1xuXHRcdGRheXMucHVzaChuZXcgRGF0ZShjYWxjdWxhdGlvbkRhdGUuZ2V0VGltZSgpKSlcblx0XHRjYWxjdWxhdGlvbkRhdGUgPSBpbmNyZW1lbnREYXRlKGNhbGN1bGF0aW9uRGF0ZSwgMSlcblx0fVxuXG5cdHJldHVybiBkYXlzXG59XG5cbmV4cG9ydCB0eXBlIENhbGVuZGFyTmF2Q29uZmlndXJhdGlvbiA9IHsgYmFjazogQ2hpbGQ7IHRpdGxlOiBzdHJpbmc7IGZvcndhcmQ6IENoaWxkIH1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbGVuZGFyV2VlayhkYXRlOiBEYXRlLCB3ZWVrU3RhcnQ6IFdlZWtTdGFydCkge1xuXHQvLyBBY2NvcmRpbmcgdG8gSVNPIDg2MDEsIHdlZWtzIGFsd2F5cyBzdGFydCBvbiBNb25kYXkuIFdlZWsgbnVtYmVyaW5nIHN5c3RlbXMgZm9yXG5cdC8vIHdlZWtzIHRoYXQgZG8gbm90IHN0YXJ0IG9uIE1vbmRheSBhcmUgbm90IHN0cmljdGx5IGRlZmluZWQsIHNvIHdlIG9ubHkgZGlzcGxheVxuXHQvLyBhIHdlZWsgbnVtYmVyIGlmIHRoZSB1c2VyJ3MgY2xpZW50IGlzIGNvbmZpZ3VyZWQgdG8gc3RhcnQgd2Vla3Mgb24gTW9uZGF5XG5cdGlmICh3ZWVrU3RhcnQgIT09IFdlZWtTdGFydC5NT05EQVkpIHtcblx0XHRyZXR1cm4gbnVsbFxuXHR9XG5cblx0cmV0dXJuIGxhbmcuZ2V0KFwid2Vla051bWJlcl9sYWJlbFwiLCB7XG5cdFx0XCJ7d2Vla31cIjogU3RyaW5nKGdldFdlZWtOdW1iZXIoZGF0ZSkpLFxuXHR9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FsZW5kYXJOYXZDb25maWd1cmF0aW9uKFxuXHR2aWV3VHlwZTogQ2FsZW5kYXJWaWV3VHlwZSxcblx0ZGF0ZTogRGF0ZSxcblx0d2Vla1N0YXJ0OiBXZWVrU3RhcnQsXG5cdHRpdGxlVHlwZTogXCJzaG9ydFwiIHwgXCJkZXRhaWxlZFwiLFxuXHRzd2l0Y2hlcjogKHZpZXdUeXBlOiBDYWxlbmRhclZpZXdUeXBlLCBuZXh0OiBib29sZWFuKSA9PiB1bmtub3duLFxuKTogQ2FsZW5kYXJOYXZDb25maWd1cmF0aW9uIHtcblx0Y29uc3Qgb25CYWNrID0gKCkgPT4gc3dpdGNoZXIodmlld1R5cGUsIGZhbHNlKVxuXHRjb25zdCBvbkZvcndhcmQgPSAoKSA9PiBzd2l0Y2hlcih2aWV3VHlwZSwgdHJ1ZSlcblx0c3dpdGNoICh2aWV3VHlwZSkge1xuXHRcdGNhc2UgQ2FsZW5kYXJWaWV3VHlwZS5EQVk6XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRiYWNrOiByZW5kZXJDYWxlbmRhclN3aXRjaExlZnRCdXR0b24oXCJwcmV2RGF5X2xhYmVsXCIsIG9uQmFjayksXG5cdFx0XHRcdGZvcndhcmQ6IHJlbmRlckNhbGVuZGFyU3dpdGNoUmlnaHRCdXR0b24oXCJuZXh0RGF5X2xhYmVsXCIsIG9uRm9yd2FyZCksXG5cdFx0XHRcdHRpdGxlOiB0aXRsZVR5cGUgPT09IFwic2hvcnRcIiA/IGZvcm1hdE1vbnRoV2l0aEZ1bGxZZWFyKGRhdGUpIDogZm9ybWF0RGF0ZVdpdGhXZWVrZGF5KGRhdGUpLFxuXHRcdFx0fVxuXHRcdGNhc2UgQ2FsZW5kYXJWaWV3VHlwZS5NT05USDpcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGJhY2s6IHJlbmRlckNhbGVuZGFyU3dpdGNoTGVmdEJ1dHRvbihcInByZXZNb250aF9sYWJlbFwiLCBvbkJhY2spLFxuXHRcdFx0XHRmb3J3YXJkOiByZW5kZXJDYWxlbmRhclN3aXRjaFJpZ2h0QnV0dG9uKFwibmV4dE1vbnRoX2xhYmVsXCIsIG9uRm9yd2FyZCksXG5cdFx0XHRcdHRpdGxlOiBmb3JtYXRNb250aFdpdGhGdWxsWWVhcihkYXRlKSxcblx0XHRcdH1cblx0XHRjYXNlIENhbGVuZGFyVmlld1R5cGUuV0VFSzpcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGJhY2s6IHJlbmRlckNhbGVuZGFyU3dpdGNoTGVmdEJ1dHRvbihcInByZXZXZWVrX2xhYmVsXCIsIG9uQmFjayksXG5cdFx0XHRcdGZvcndhcmQ6IHJlbmRlckNhbGVuZGFyU3dpdGNoUmlnaHRCdXR0b24oXCJuZXh0V2Vla19sYWJlbFwiLCBvbkZvcndhcmQpLFxuXHRcdFx0XHR0aXRsZTogdGl0bGVUeXBlID09PSBcInNob3J0XCIgPyBmb3JtYXRNb250aFdpdGhGdWxsWWVhcihkYXRlKSA6IHdlZWtUaXRsZShkYXRlLCB3ZWVrU3RhcnQpLFxuXHRcdFx0fVxuXHRcdGNhc2UgQ2FsZW5kYXJWaWV3VHlwZS5BR0VOREE6XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRiYWNrOiByZW5kZXJDYWxlbmRhclN3aXRjaExlZnRCdXR0b24oXCJwcmV2RGF5X2xhYmVsXCIsIG9uQmFjayksXG5cdFx0XHRcdGZvcndhcmQ6IHJlbmRlckNhbGVuZGFyU3dpdGNoUmlnaHRCdXR0b24oXCJuZXh0RGF5X2xhYmVsXCIsIG9uRm9yd2FyZCksXG5cdFx0XHRcdHRpdGxlOiB0aXRsZVR5cGUgPT09IFwic2hvcnRcIiA/IGZvcm1hdE1vbnRoV2l0aEZ1bGxZZWFyKGRhdGUpIDogZm9ybWF0RGF0ZVdpdGhXZWVrZGF5KGRhdGUpLFxuXHRcdFx0fVxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhc2tJZlNob3VsZFNlbmRDYWxlbmRhclVwZGF0ZXNUb0F0dGVuZGVlcygpOiBQcm9taXNlPFwieWVzXCIgfCBcIm5vXCIgfCBcImNhbmNlbFwiPiB7XG5cdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuXHRcdGxldCBhbGVydERpYWxvZzogRGlhbG9nXG5cdFx0Y29uc3QgY2FuY2VsQnV0dG9uID0ge1xuXHRcdFx0bGFiZWw6IFwiY2FuY2VsX2FjdGlvblwiLFxuXHRcdFx0Y2xpY2s6ICgpID0+IHtcblx0XHRcdFx0cmVzb2x2ZShcImNhbmNlbFwiKVxuXHRcdFx0XHRhbGVydERpYWxvZy5jbG9zZSgpXG5cdFx0XHR9LFxuXHRcdFx0dHlwZTogQnV0dG9uVHlwZS5TZWNvbmRhcnksXG5cdFx0fSBhcyBjb25zdFxuXHRcdGNvbnN0IG5vQnV0dG9uID0ge1xuXHRcdFx0bGFiZWw6IFwibm9fbGFiZWxcIixcblx0XHRcdGNsaWNrOiAoKSA9PiB7XG5cdFx0XHRcdHJlc29sdmUoXCJub1wiKVxuXHRcdFx0XHRhbGVydERpYWxvZy5jbG9zZSgpXG5cdFx0XHR9LFxuXHRcdFx0dHlwZTogQnV0dG9uVHlwZS5TZWNvbmRhcnksXG5cdFx0fSBhcyBjb25zdFxuXHRcdGNvbnN0IHllc0J1dHRvbiA9IHtcblx0XHRcdGxhYmVsOiBcInllc19sYWJlbFwiLFxuXHRcdFx0Y2xpY2s6ICgpID0+IHtcblx0XHRcdFx0cmVzb2x2ZShcInllc1wiKVxuXHRcdFx0XHRhbGVydERpYWxvZy5jbG9zZSgpXG5cdFx0XHR9LFxuXHRcdFx0dHlwZTogQnV0dG9uVHlwZS5QcmltYXJ5LFxuXHRcdH0gYXMgY29uc3RcblxuXHRcdGNvbnN0IG9uY2xvc2UgPSAocG9zaXRpdmU6IGJvb2xlYW4pID0+IChwb3NpdGl2ZSA/IHJlc29sdmUoXCJ5ZXNcIikgOiByZXNvbHZlKFwiY2FuY2VsXCIpKVxuXG5cdFx0YWxlcnREaWFsb2cgPSBEaWFsb2cuY29uZmlybU11bHRpcGxlKFwic2VuZFVwZGF0ZXNfbXNnXCIsIFtjYW5jZWxCdXR0b24sIG5vQnV0dG9uLCB5ZXNCdXR0b25dLCBvbmNsb3NlKVxuXHR9KVxufVxuXG4vKipcbiAqIE1hcCB0aGUgbG9jYXRpb24gb2YgYSBtb3VzZSBjbGljayBvbiBhbiBlbGVtZW50IHRvIGEgZ2l2ZSBkYXRlLCBnaXZlbiBhIGxpc3Qgb2Ygd2Vla3NcbiAqIHRoZXJlIHNob3VsZCBiZSBuZWl0aGVyIHplcm8gd2Vla3MsIG5vciB6ZXJvIGxlbmd0aCB3ZWVrc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGF0ZUZyb21Nb3VzZVBvcyh7IHgsIHksIHRhcmdldFdpZHRoLCB0YXJnZXRIZWlnaHQgfTogTW91c2VQb3NBbmRCb3VuZHMsIHdlZWtzOiBBcnJheTxBcnJheTxEYXRlPj4pOiBEYXRlIHtcblx0YXNzZXJ0KHdlZWtzLmxlbmd0aCA+IDAsIFwiV2Vla3MgbXVzdCBub3QgYmUgemVybyBsZW5ndGhcIilcblx0Y29uc3QgdW5pdEhlaWdodCA9IHRhcmdldEhlaWdodCAvIHdlZWtzLmxlbmd0aFxuXHRjb25zdCBjdXJyZW50U3F1YXJlWSA9IE1hdGguZmxvb3IoeSAvIHVuaXRIZWlnaHQpXG5cdGNvbnN0IHdlZWsgPSB3ZWVrc1tjbGFtcChjdXJyZW50U3F1YXJlWSwgMCwgd2Vla3MubGVuZ3RoIC0gMSldXG5cdGFzc2VydCh3ZWVrLmxlbmd0aCA+IDAsIFwiV2VlayBtdXN0IG5vdCBiZSB6ZXJvIGxlbmd0aFwiKVxuXHRjb25zdCB1bml0V2lkdGggPSB0YXJnZXRXaWR0aCAvIHdlZWsubGVuZ3RoXG5cdGNvbnN0IGN1cnJlbnRTcXVhcmVYID0gTWF0aC5mbG9vcih4IC8gdW5pdFdpZHRoKVxuXHRyZXR1cm4gd2Vla1tjbGFtcChjdXJyZW50U3F1YXJlWCwgMCwgd2Vlay5sZW5ndGggLSAxKV1cbn1cblxuLyoqXG4gKiBNYXAgdGhlIHZlcnRpY2FsIHBvc2l0aW9uIG9mIGEgbW91c2UgY2xpY2sgb24gYW4gZWxlbWVudCB0byBhIHRpbWUgb2YgZGF5XG4gKiBAcGFyYW0geVxuICogQHBhcmFtIHRhcmdldEhlaWdodFxuICogQHBhcmFtIGhvdXJEaXZpc2lvbjogaG93IG1hbnkgdGltZXMgdG8gZGl2aWRlIHRoZSBob3VyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUaW1lRnJvbU1vdXNlUG9zKHsgeSwgdGFyZ2V0SGVpZ2h0IH06IE1vdXNlUG9zQW5kQm91bmRzLCBob3VyRGl2aXNpb246IG51bWJlcik6IFRpbWUge1xuXHRjb25zdCBzZWN0aW9uSGVpZ2h0ID0gdGFyZ2V0SGVpZ2h0IC8gMjRcblx0Y29uc3QgaG91ciA9IHkgLyBzZWN0aW9uSGVpZ2h0XG5cdGNvbnN0IGhvdXJSb3VuZGVkID0gTWF0aC5mbG9vcihob3VyKVxuXHRjb25zdCBtaW51dGVzSW5jID0gNjAgLyBob3VyRGl2aXNpb25cblx0Y29uc3QgbWludXRlID0gTWF0aC5mbG9vcigoaG91ciAtIGhvdXJSb3VuZGVkKSAqIGhvdXJEaXZpc2lvbikgKiBtaW51dGVzSW5jXG5cdHJldHVybiBuZXcgVGltZShob3VyUm91bmRlZCwgbWludXRlKVxufVxuXG5leHBvcnQgY29uc3QgU0VMRUNURURfREFURV9JTkRJQ0FUT1JfVEhJQ0tORVNTID0gNFxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SWNvbkZvclZpZXdUeXBlKHZpZXdUeXBlOiBDYWxlbmRhclZpZXdUeXBlKTogQWxsSWNvbnMge1xuXHRjb25zdCBsb29rdXBUYWJsZTogUmVjb3JkPENhbGVuZGFyVmlld1R5cGUsIEFsbEljb25zPiA9IHtcblx0XHRbQ2FsZW5kYXJWaWV3VHlwZS5EQVldOiBJY29ucy5UYWJsZVNpbmdsZSxcblx0XHRbQ2FsZW5kYXJWaWV3VHlwZS5XRUVLXTogSWNvbnMuVGFibGVDb2x1bW5zLFxuXHRcdFtDYWxlbmRhclZpZXdUeXBlLk1PTlRIXTogSWNvbnMuVGFibGUsXG5cdFx0W0NhbGVuZGFyVmlld1R5cGUuQUdFTkRBXTogSWNvbnMuTGlzdFVub3JkZXJlZCxcblx0fVxuXHRyZXR1cm4gbG9va3VwVGFibGVbdmlld1R5cGVdXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG91bGREZWZhdWx0VG9BbVBtVGltZUZvcm1hdCgpOiBib29sZWFuIHtcblx0cmV0dXJuIGxhbmcuY29kZSA9PT0gXCJlblwiXG59XG5cbi8qKlxuICogZ2V0IGFuIG9iamVjdCByZXByZXNlbnRpbmcgdGhlIGNhbGVuZGFyIG1vbnRoIHRoZSBnaXZlbiBkYXRlIGlzIGluLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2FsZW5kYXJNb250aChkYXRlOiBEYXRlLCBmaXJzdERheU9mV2Vla0Zyb21PZmZzZXQ6IG51bWJlciwgd2Vla2RheU5hcnJvd0Zvcm1hdDogYm9vbGVhbik6IENhbGVuZGFyTW9udGgge1xuXHRjb25zdCB3ZWVrczogQXJyYXk8QXJyYXk8Q2FsZW5kYXJEYXk+PiA9IFtbXV1cblx0Y29uc3QgY2FsY3VsYXRpb25EYXRlID0gZ2V0U3RhcnRPZkRheShkYXRlKVxuXHRjYWxjdWxhdGlvbkRhdGUuc2V0RGF0ZSgxKVxuXHRjb25zdCBiZWdpbm5pbmdPZk1vbnRoID0gbmV3IERhdGUoY2FsY3VsYXRpb25EYXRlKVxuXHRsZXQgY3VycmVudFllYXIgPSBjYWxjdWxhdGlvbkRhdGUuZ2V0RnVsbFllYXIoKVxuXHRsZXQgbW9udGggPSBjYWxjdWxhdGlvbkRhdGUuZ2V0TW9udGgoKVxuXHQvLyBhZGQgXCJwYWRkaW5nXCIgZGF5c1xuXHQvLyBnZXREYXkgcmV0dXJucyB0aGUgZGF5IG9mIHRoZSB3ZWVrIChmcm9tIDAgdG8gNikgZm9yIHRoZSBzcGVjaWZpZWQgZGF0ZSAod2l0aCBmaXJzdCBvbmUgYmVpbmcgU3VuZGF5KVxuXHRsZXQgZmlyc3REYXlcblxuXHRpZiAoZmlyc3REYXlPZldlZWtGcm9tT2Zmc2V0ID4gY2FsY3VsYXRpb25EYXRlLmdldERheSgpKSB7XG5cdFx0Zmlyc3REYXkgPSBjYWxjdWxhdGlvbkRhdGUuZ2V0RGF5KCkgKyA3IC0gZmlyc3REYXlPZldlZWtGcm9tT2Zmc2V0XG5cdH0gZWxzZSB7XG5cdFx0Zmlyc3REYXkgPSBjYWxjdWxhdGlvbkRhdGUuZ2V0RGF5KCkgLSBmaXJzdERheU9mV2Vla0Zyb21PZmZzZXRcblx0fVxuXG5cdGxldCBkYXlDb3VudFxuXHRpbmNyZW1lbnREYXRlKGNhbGN1bGF0aW9uRGF0ZSwgLWZpcnN0RGF5KVxuXG5cdGZvciAoZGF5Q291bnQgPSAwOyBkYXlDb3VudCA8IGZpcnN0RGF5OyBkYXlDb3VudCsrKSB7XG5cdFx0d2Vla3NbMF0ucHVzaCh7XG5cdFx0XHRkYXRlOiBuZXcgRGF0ZShjYWxjdWxhdGlvbkRhdGUpLFxuXHRcdFx0ZGF5OiBjYWxjdWxhdGlvbkRhdGUuZ2V0RGF0ZSgpLFxuXHRcdFx0bW9udGg6IGNhbGN1bGF0aW9uRGF0ZS5nZXRNb250aCgpLFxuXHRcdFx0eWVhcjogY2FsY3VsYXRpb25EYXRlLmdldEZ1bGxZZWFyKCksXG5cdFx0XHRpc1BhZGRpbmdEYXk6IHRydWUsXG5cdFx0fSlcblx0XHRpbmNyZW1lbnREYXRlKGNhbGN1bGF0aW9uRGF0ZSwgMSlcblx0fVxuXG5cdC8vIGFkZCBhY3R1YWwgZGF5c1xuXHR3aGlsZSAoY2FsY3VsYXRpb25EYXRlLmdldE1vbnRoKCkgPT09IG1vbnRoKSB7XG5cdFx0aWYgKHdlZWtzWzBdLmxlbmd0aCAmJiBkYXlDb3VudCAlIDcgPT09IDApIHtcblx0XHRcdC8vIHN0YXJ0IG5ldyB3ZWVrXG5cdFx0XHR3ZWVrcy5wdXNoKFtdKVxuXHRcdH1cblxuXHRcdGNvbnN0IGRheUluZm8gPSB7XG5cdFx0XHRkYXRlOiBuZXcgRGF0ZShjdXJyZW50WWVhciwgbW9udGgsIGNhbGN1bGF0aW9uRGF0ZS5nZXREYXRlKCkpLFxuXHRcdFx0eWVhcjogY3VycmVudFllYXIsXG5cdFx0XHRtb250aDogbW9udGgsXG5cdFx0XHRkYXk6IGNhbGN1bGF0aW9uRGF0ZS5nZXREYXRlKCksXG5cdFx0XHRpc1BhZGRpbmdEYXk6IGZhbHNlLFxuXHRcdH1cblx0XHR3ZWVrc1t3ZWVrcy5sZW5ndGggLSAxXS5wdXNoKGRheUluZm8pXG5cdFx0aW5jcmVtZW50RGF0ZShjYWxjdWxhdGlvbkRhdGUsIDEpXG5cdFx0ZGF5Q291bnQrK1xuXHR9XG5cblx0Ly8gYWRkIHJlbWFpbmluZyBcInBhZGRpbmdcIiBkYXlzXG5cdHdoaWxlIChkYXlDb3VudCA8IDQyKSB7XG5cdFx0aWYgKGRheUNvdW50ICUgNyA9PT0gMCkge1xuXHRcdFx0d2Vla3MucHVzaChbXSlcblx0XHR9XG5cblx0XHR3ZWVrc1t3ZWVrcy5sZW5ndGggLSAxXS5wdXNoKHtcblx0XHRcdGRheTogY2FsY3VsYXRpb25EYXRlLmdldERhdGUoKSxcblx0XHRcdHllYXI6IGNhbGN1bGF0aW9uRGF0ZS5nZXRGdWxsWWVhcigpLFxuXHRcdFx0bW9udGg6IGNhbGN1bGF0aW9uRGF0ZS5nZXRNb250aCgpLFxuXHRcdFx0ZGF0ZTogbmV3IERhdGUoY2FsY3VsYXRpb25EYXRlKSxcblx0XHRcdGlzUGFkZGluZ0RheTogdHJ1ZSxcblx0XHR9KVxuXHRcdGluY3JlbWVudERhdGUoY2FsY3VsYXRpb25EYXRlLCAxKVxuXHRcdGRheUNvdW50Kytcblx0fVxuXG5cdGNvbnN0IHdlZWtkYXlzOiBzdHJpbmdbXSA9IFtdXG5cdGNvbnN0IHdlZWtkYXlzRGF0ZSA9IG5ldyBEYXRlKClcblx0aW5jcmVtZW50RGF0ZSh3ZWVrZGF5c0RhdGUsIC13ZWVrZGF5c0RhdGUuZ2V0RGF5KCkgKyBmaXJzdERheU9mV2Vla0Zyb21PZmZzZXQpIC8vIGdldCBmaXJzdCBkYXkgb2Ygd2Vla1xuXG5cdGZvciAobGV0IGkgPSAwOyBpIDwgNzsgaSsrKSB7XG5cdFx0d2Vla2RheXMucHVzaCh3ZWVrZGF5TmFycm93Rm9ybWF0ID8gbGFuZy5mb3JtYXRzLndlZWtkYXlOYXJyb3cuZm9ybWF0KHdlZWtkYXlzRGF0ZSkgOiBsYW5nLmZvcm1hdHMud2Vla2RheVNob3J0LmZvcm1hdCh3ZWVrZGF5c0RhdGUpKVxuXHRcdGluY3JlbWVudERhdGUod2Vla2RheXNEYXRlLCAxKVxuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRiZWdpbm5pbmdPZk1vbnRoLFxuXHRcdHdlZWtkYXlzLFxuXHRcdHdlZWtzLFxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRFdmVudER1cmF0aW9uKGV2ZW50OiBDYWxlbmRhckV2ZW50VGltZXMsIHpvbmU6IHN0cmluZywgaW5jbHVkZVRpbWV6b25lOiBib29sZWFuKTogc3RyaW5nIHtcblx0aWYgKGlzQWxsRGF5RXZlbnQoZXZlbnQpKSB7XG5cdFx0Y29uc3Qgc3RhcnRUaW1lID0gZ2V0RXZlbnRTdGFydChldmVudCwgem9uZSlcblx0XHRjb25zdCBzdGFydFN0cmluZyA9IGZvcm1hdERhdGVXaXRoTW9udGgoc3RhcnRUaW1lKVxuXHRcdGNvbnN0IGVuZFRpbWUgPSBpbmNyZW1lbnRCeVJlcGVhdFBlcmlvZChnZXRFdmVudEVuZChldmVudCwgem9uZSksIFJlcGVhdFBlcmlvZC5EQUlMWSwgLTEsIHpvbmUpXG5cblx0XHRpZiAoaXNTYW1lRGF5T2ZEYXRlKHN0YXJ0VGltZSwgZW5kVGltZSkpIHtcblx0XHRcdHJldHVybiBgJHtsYW5nLmdldChcImFsbERheV9sYWJlbFwiKX0sICR7c3RhcnRTdHJpbmd9YFxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gYCR7bGFuZy5nZXQoXCJhbGxEYXlfbGFiZWxcIil9LCAke3N0YXJ0U3RyaW5nfSAtICR7Zm9ybWF0RGF0ZVdpdGhNb250aChlbmRUaW1lKX1gXG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdGNvbnN0IHN0YXJ0U3RyaW5nID0gZm9ybWF0RGF0ZVRpbWUoZXZlbnQuc3RhcnRUaW1lKVxuXHRcdGxldCBlbmRTdHJpbmdcblxuXHRcdGlmIChpc1NhbWVEYXkoZXZlbnQuc3RhcnRUaW1lLCBldmVudC5lbmRUaW1lKSkge1xuXHRcdFx0ZW5kU3RyaW5nID0gZm9ybWF0VGltZShldmVudC5lbmRUaW1lKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRlbmRTdHJpbmcgPSBmb3JtYXREYXRlVGltZShldmVudC5lbmRUaW1lKVxuXHRcdH1cblxuXHRcdHJldHVybiBgJHtzdGFydFN0cmluZ30gLSAke2VuZFN0cmluZ30gJHtpbmNsdWRlVGltZXpvbmUgPyBnZXRUaW1lWm9uZSgpIDogXCJcIn1gXG5cdH1cbn1cblxuZXhwb3J0IGNvbnN0IGNyZWF0ZVJlcGVhdFJ1bGVGcmVxdWVuY3lWYWx1ZXMgPSAoKTogU2VsZWN0b3JJdGVtTGlzdDxSZXBlYXRQZXJpb2QgfCBudWxsPiA9PiB7XG5cdHJldHVybiBbXG5cdFx0e1xuXHRcdFx0bmFtZTogbGFuZy5nZXQoXCJjYWxlbmRhclJlcGVhdEludGVydmFsTm9SZXBlYXRfbGFiZWxcIiksXG5cdFx0XHR2YWx1ZTogbnVsbCxcblx0XHR9LFxuXHRcdHtcblx0XHRcdG5hbWU6IGxhbmcuZ2V0KFwiY2FsZW5kYXJSZXBlYXRJbnRlcnZhbERhaWx5X2xhYmVsXCIpLFxuXHRcdFx0dmFsdWU6IFJlcGVhdFBlcmlvZC5EQUlMWSxcblx0XHR9LFxuXHRcdHtcblx0XHRcdG5hbWU6IGxhbmcuZ2V0KFwiY2FsZW5kYXJSZXBlYXRJbnRlcnZhbFdlZWtseV9sYWJlbFwiKSxcblx0XHRcdHZhbHVlOiBSZXBlYXRQZXJpb2QuV0VFS0xZLFxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0bmFtZTogbGFuZy5nZXQoXCJjYWxlbmRhclJlcGVhdEludGVydmFsTW9udGhseV9sYWJlbFwiKSxcblx0XHRcdHZhbHVlOiBSZXBlYXRQZXJpb2QuTU9OVEhMWSxcblx0XHR9LFxuXHRcdHtcblx0XHRcdG5hbWU6IGxhbmcuZ2V0KFwiY2FsZW5kYXJSZXBlYXRJbnRlcnZhbEFubnVhbGx5X2xhYmVsXCIpLFxuXHRcdFx0dmFsdWU6IFJlcGVhdFBlcmlvZC5BTk5VQUxMWSxcblx0XHR9LFxuXHRdXG59XG5leHBvcnQgY29uc3QgY3JlYXRlUmVwZWF0UnVsZU9wdGlvbnMgPSAoKTogUmVhZG9ubHlBcnJheTxSYWRpb0dyb3VwT3B0aW9uPFJlcGVhdFBlcmlvZCB8IFwiQ1VTVE9NXCIgfCBudWxsPj4gPT4ge1xuXHRyZXR1cm4gW1xuXHRcdHtcblx0XHRcdG5hbWU6IFwiY2FsZW5kYXJSZXBlYXRJbnRlcnZhbE5vUmVwZWF0X2xhYmVsXCIsXG5cdFx0XHR2YWx1ZTogbnVsbCxcblx0XHR9LFxuXHRcdHtcblx0XHRcdG5hbWU6IFwiY2FsZW5kYXJSZXBlYXRJbnRlcnZhbERhaWx5X2xhYmVsXCIsXG5cdFx0XHR2YWx1ZTogUmVwZWF0UGVyaW9kLkRBSUxZLFxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0bmFtZTogXCJjYWxlbmRhclJlcGVhdEludGVydmFsV2Vla2x5X2xhYmVsXCIsXG5cdFx0XHR2YWx1ZTogUmVwZWF0UGVyaW9kLldFRUtMWSxcblx0XHR9LFxuXHRcdHtcblx0XHRcdG5hbWU6IFwiY2FsZW5kYXJSZXBlYXRJbnRlcnZhbE1vbnRobHlfbGFiZWxcIixcblx0XHRcdHZhbHVlOiBSZXBlYXRQZXJpb2QuTU9OVEhMWSxcblx0XHR9LFxuXHRcdHtcblx0XHRcdG5hbWU6IFwiY2FsZW5kYXJSZXBlYXRJbnRlcnZhbEFubnVhbGx5X2xhYmVsXCIsXG5cdFx0XHR2YWx1ZTogUmVwZWF0UGVyaW9kLkFOTlVBTExZLFxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0bmFtZTogXCJjdXN0b21fbGFiZWxcIixcblx0XHRcdHZhbHVlOiBcIkNVU1RPTVwiLFxuXHRcdH0sXG5cdF1cbn1cblxuZXhwb3J0IGNvbnN0IGN1c3RvbUZyZXF1ZW5jaWVzT3B0aW9ucyA9IFtcblx0e1xuXHRcdG5hbWU6IHsgc2luZ3VsYXI6IFwiZGF5X2xhYmVsXCIsIHBsdXJhbDogXCJkYXlzX2xhYmVsXCIgfSxcblx0XHR2YWx1ZTogUmVwZWF0UGVyaW9kLkRBSUxZLFxuXHR9LFxuXHR7XG5cdFx0bmFtZTogeyBzaW5ndWxhcjogXCJ3ZWVrX2xhYmVsXCIsIHBsdXJhbDogXCJ3ZWVrc19sYWJlbFwiIH0sXG5cdFx0dmFsdWU6IFJlcGVhdFBlcmlvZC5XRUVLTFksXG5cdH0sXG5cdHtcblx0XHRuYW1lOiB7IHNpbmd1bGFyOiBcIm1vbnRoX2xhYmVsXCIsIHBsdXJhbDogXCJtb250aHNfbGFiZWxcIiB9LFxuXHRcdHZhbHVlOiBSZXBlYXRQZXJpb2QuTU9OVEhMWSxcblx0fSxcblx0e1xuXHRcdG5hbWU6IHsgc2luZ3VsYXI6IFwieWVhcl9sYWJlbFwiLCBwbHVyYWw6IFwieWVhcnNfbGFiZWxcIiB9LFxuXHRcdHZhbHVlOiBSZXBlYXRQZXJpb2QuQU5OVUFMTFksXG5cdH0sXG5dXG5cbmV4cG9ydCBjb25zdCBjcmVhdGVDdXN0b21FbmRUeXBlT3B0aW9ucyA9ICgpOiBSZWFkb25seUFycmF5PFJhZGlvR3JvdXBPcHRpb248RW5kVHlwZT4+ID0+IHtcblx0cmV0dXJuIFtcblx0XHR7XG5cdFx0XHRuYW1lOiBcImNhbGVuZGFyUmVwZWF0U3RvcENvbmRpdGlvbk5ldmVyX2xhYmVsXCIsXG5cdFx0XHR2YWx1ZTogRW5kVHlwZS5OZXZlcixcblx0XHR9LFxuXHRcdHtcblx0XHRcdG5hbWU6IFwiY2FsZW5kYXJSZXBlYXRTdG9wQ29uZGl0aW9uT2NjdXJyZW5jZXNfbGFiZWxcIixcblx0XHRcdHZhbHVlOiBFbmRUeXBlLkNvdW50LFxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0bmFtZTogXCJjYWxlbmRhclJlcGVhdFN0b3BDb25kaXRpb25EYXRlX2xhYmVsXCIsXG5cdFx0XHR2YWx1ZTogRW5kVHlwZS5VbnRpbERhdGUsXG5cdFx0fSxcblx0XVxufVxuXG5leHBvcnQgY29uc3QgY3JlYXRlUmVwZWF0UnVsZUVuZFR5cGVWYWx1ZXMgPSAoKTogU2VsZWN0b3JJdGVtTGlzdDxFbmRUeXBlPiA9PiB7XG5cdHJldHVybiBbXG5cdFx0e1xuXHRcdFx0bmFtZTogbGFuZy5nZXQoXCJjYWxlbmRhclJlcGVhdFN0b3BDb25kaXRpb25OZXZlcl9sYWJlbFwiKSxcblx0XHRcdHZhbHVlOiBFbmRUeXBlLk5ldmVyLFxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0bmFtZTogbGFuZy5nZXQoXCJjYWxlbmRhclJlcGVhdFN0b3BDb25kaXRpb25PY2N1cnJlbmNlc19sYWJlbFwiKSxcblx0XHRcdHZhbHVlOiBFbmRUeXBlLkNvdW50LFxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0bmFtZTogbGFuZy5nZXQoXCJjYWxlbmRhclJlcGVhdFN0b3BDb25kaXRpb25EYXRlX2xhYmVsXCIpLFxuXHRcdFx0dmFsdWU6IEVuZFR5cGUuVW50aWxEYXRlLFxuXHRcdH0sXG5cdF1cbn1cbmV4cG9ydCBjb25zdCBjcmVhdGVJbnRlcnZhbFZhbHVlcyA9ICgpOiBJbnRlcnZhbE9wdGlvbltdID0+IG51bWJlclJhbmdlKDEsIDI1NikubWFwKChuKSA9PiAoeyBuYW1lOiBTdHJpbmcobiksIHZhbHVlOiBuLCBhcmlhVmFsdWU6IFN0cmluZyhuKSB9KSlcblxuZXhwb3J0IGZ1bmN0aW9uIGh1bWFuRGVzY3JpcHRpb25Gb3JBbGFybUludGVydmFsPFA+KHZhbHVlOiBBbGFybUludGVydmFsLCBsb2NhbGU6IHN0cmluZyk6IHN0cmluZyB7XG5cdGlmICh2YWx1ZS52YWx1ZSA9PT0gMCkgcmV0dXJuIGxhbmcuZ2V0KFwiY2FsZW5kYXJSZW1pbmRlckludGVydmFsQXRFdmVudFN0YXJ0X2xhYmVsXCIpXG5cblx0cmV0dXJuIER1cmF0aW9uLmZyb21PYmplY3QoYWxhcm1JbnRlcnZhbFRvTHV4b25EdXJhdGlvbkxpa2VPYmplY3QodmFsdWUpKS5yZWNvbmZpZ3VyZSh7IGxvY2FsZTogbG9jYWxlIH0pLnRvSHVtYW4oKVxufVxuXG5leHBvcnQgY29uc3QgY3JlYXRlQWxhcm1JbnRlcnZhbEl0ZW1zID0gKGxvY2FsZTogc3RyaW5nKTogU2VsZWN0b3JJdGVtTGlzdDxBbGFybUludGVydmFsPiA9PlxuXHR0eXBlZFZhbHVlcyhTdGFuZGFyZEFsYXJtSW50ZXJ2YWwpLm1hcCgodmFsdWUpID0+IHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0dmFsdWUsXG5cdFx0XHRuYW1lOiBodW1hbkRlc2NyaXB0aW9uRm9yQWxhcm1JbnRlcnZhbCh2YWx1ZSwgbG9jYWxlKSxcblx0XHR9XG5cdH0pXG5cbmV4cG9ydCBpbnRlcmZhY2UgQXR0ZW5kaW5nSXRlbSBleHRlbmRzIFNlbGVjdE9wdGlvbjxDYWxlbmRhckF0dGVuZGVlU3RhdHVzPiB7XG5cdG5hbWU6IHN0cmluZ1xuXHRzZWxlY3RhYmxlPzogYm9vbGVhblxufVxuXG5leHBvcnQgY29uc3QgY3JlYXRlQXR0ZW5kaW5nSXRlbXMgPSAoKTogQXR0ZW5kaW5nSXRlbVtdID0+IFtcblx0e1xuXHRcdG5hbWU6IGxhbmcuZ2V0KFwiYXR0ZW5kaW5nX2xhYmVsXCIpLFxuXHRcdHZhbHVlOiBDYWxlbmRhckF0dGVuZGVlU3RhdHVzLkFDQ0VQVEVELFxuXHRcdGFyaWFWYWx1ZTogbGFuZy5nZXQoXCJhdHRlbmRpbmdfbGFiZWxcIiksXG5cdH0sXG5cdHtcblx0XHRuYW1lOiBsYW5nLmdldChcIm1heWJlQXR0ZW5kaW5nX2xhYmVsXCIpLFxuXHRcdHZhbHVlOiBDYWxlbmRhckF0dGVuZGVlU3RhdHVzLlRFTlRBVElWRSxcblx0XHRhcmlhVmFsdWU6IGxhbmcuZ2V0KFwibWF5YmVBdHRlbmRpbmdfbGFiZWxcIiksXG5cdH0sXG5cdHtcblx0XHRuYW1lOiBsYW5nLmdldChcIm5vdEF0dGVuZGluZ19sYWJlbFwiKSxcblx0XHR2YWx1ZTogQ2FsZW5kYXJBdHRlbmRlZVN0YXR1cy5ERUNMSU5FRCxcblx0XHRhcmlhVmFsdWU6IGxhbmcuZ2V0KFwibm90QXR0ZW5kaW5nX2xhYmVsXCIpLFxuXHR9LFxuXHR7XG5cdFx0bmFtZTogbGFuZy5nZXQoXCJwZW5kaW5nX2xhYmVsXCIpLFxuXHRcdHZhbHVlOiBDYWxlbmRhckF0dGVuZGVlU3RhdHVzLk5FRURTX0FDVElPTixcblx0XHRzZWxlY3RhYmxlOiBmYWxzZSxcblx0XHRhcmlhVmFsdWU6IGxhbmcuZ2V0KFwicGVuZGluZ19sYWJlbFwiKSxcblx0fSxcbl1cblxuZXhwb3J0IGZ1bmN0aW9uIGh1bWFuRGVzY3JpcHRpb25Gb3JBbGFybUludGVydmFsVW5pdCh1bml0OiBBbGFybUludGVydmFsVW5pdCk6IHN0cmluZyB7XG5cdHN3aXRjaCAodW5pdCkge1xuXHRcdGNhc2UgQWxhcm1JbnRlcnZhbFVuaXQuTUlOVVRFOlxuXHRcdFx0cmV0dXJuIGxhbmcuZ2V0KFwiY2FsZW5kYXJSZW1pbmRlckludGVydmFsVW5pdE1pbnV0ZXNfbGFiZWxcIilcblx0XHRjYXNlIEFsYXJtSW50ZXJ2YWxVbml0LkhPVVI6XG5cdFx0XHRyZXR1cm4gbGFuZy5nZXQoXCJjYWxlbmRhclJlbWluZGVySW50ZXJ2YWxVbml0SG91cnNfbGFiZWxcIilcblx0XHRjYXNlIEFsYXJtSW50ZXJ2YWxVbml0LkRBWTpcblx0XHRcdHJldHVybiBsYW5nLmdldChcImNhbGVuZGFyUmVtaW5kZXJJbnRlcnZhbFVuaXREYXlzX2xhYmVsXCIpXG5cdFx0Y2FzZSBBbGFybUludGVydmFsVW5pdC5XRUVLOlxuXHRcdFx0cmV0dXJuIGxhbmcuZ2V0KFwiY2FsZW5kYXJSZW1pbmRlckludGVydmFsVW5pdFdlZWtzX2xhYmVsXCIpXG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRpbWVTdHJpbmcoZGF0ZTogRGF0ZSwgYW1QbTogYm9vbGVhbik6IHN0cmluZyB7XG5cdHJldHVybiB0aW1lU3RyaW5nRnJvbVBhcnRzKGRhdGUuZ2V0SG91cnMoKSwgZGF0ZS5nZXRNaW51dGVzKCksIGFtUG0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0aW1lU3RyaW5nSW5ab25lKGRhdGU6IERhdGUsIGFtUG06IGJvb2xlYW4sIHpvbmU6IHN0cmluZyk6IHN0cmluZyB7XG5cdGNvbnN0IHsgaG91ciwgbWludXRlIH0gPSBEYXRlVGltZS5mcm9tSlNEYXRlKGRhdGUsIHtcblx0XHR6b25lLFxuXHR9KVxuXHRyZXR1cm4gdGltZVN0cmluZ0Zyb21QYXJ0cyhob3VyLCBtaW51dGUsIGFtUG0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRFdmVudFRpbWUoeyBlbmRUaW1lLCBzdGFydFRpbWUgfTogQ2FsZW5kYXJFdmVudFRpbWVzLCBzaG93VGltZTogRXZlbnRUZXh0VGltZU9wdGlvbik6IHN0cmluZyB7XG5cdHN3aXRjaCAoc2hvd1RpbWUpIHtcblx0XHRjYXNlIEV2ZW50VGV4dFRpbWVPcHRpb24uU1RBUlRfVElNRTpcblx0XHRcdHJldHVybiBmb3JtYXRUaW1lKHN0YXJ0VGltZSlcblxuXHRcdGNhc2UgRXZlbnRUZXh0VGltZU9wdGlvbi5FTkRfVElNRTpcblx0XHRcdHJldHVybiBgIC0gJHtmb3JtYXRUaW1lKGVuZFRpbWUpfWBcblxuXHRcdGNhc2UgRXZlbnRUZXh0VGltZU9wdGlvbi5TVEFSVF9FTkRfVElNRTpcblx0XHRcdHJldHVybiBgJHtmb3JtYXRUaW1lKHN0YXJ0VGltZSl9IC0gJHtmb3JtYXRUaW1lKGVuZFRpbWUpfWBcblxuXHRcdGRlZmF1bHQ6XG5cdFx0XHR0aHJvdyBuZXcgUHJvZ3JhbW1pbmdFcnJvcihgVW5rbm93biB0aW1lIG9wdGlvbjogJHtzaG93VGltZX1gKVxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXRFdmVudFRpbWVzKGRheTogRGF0ZSwgZXZlbnQ6IENhbGVuZGFyRXZlbnQsIHpvbmU6IHN0cmluZyk6IHN0cmluZyB7XG5cdGlmIChpc0FsbERheUV2ZW50KGV2ZW50KSkge1xuXHRcdHJldHVybiBsYW5nLmdldChcImFsbERheV9sYWJlbFwiKVxuXHR9IGVsc2Uge1xuXHRcdGNvbnN0IHN0YXJ0c0JlZm9yZSA9IGV2ZW50U3RhcnRzQmVmb3JlKGRheSwgem9uZSwgZXZlbnQpXG5cdFx0Y29uc3QgZW5kc0FmdGVyID0gZXZlbnRFbmRzQWZ0ZXJEYXkoZGF5LCB6b25lLCBldmVudClcblx0XHRpZiAoc3RhcnRzQmVmb3JlICYmIGVuZHNBZnRlcikge1xuXHRcdFx0cmV0dXJuIGxhbmcuZ2V0KFwiYWxsRGF5X2xhYmVsXCIpXG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IHN0YXJ0VGltZTogRGF0ZSA9IHN0YXJ0c0JlZm9yZSA/IGRheSA6IGV2ZW50LnN0YXJ0VGltZVxuXHRcdFx0Y29uc3QgZW5kVGltZTogRGF0ZSA9IGVuZHNBZnRlciA/IGdldEVuZE9mRGF5V2l0aFpvbmUoZGF5LCB6b25lKSA6IGV2ZW50LmVuZFRpbWVcblx0XHRcdHJldHVybiBmb3JtYXRFdmVudFRpbWUoeyBzdGFydFRpbWUsIGVuZFRpbWUgfSwgRXZlbnRUZXh0VGltZU9wdGlvbi5TVEFSVF9FTkRfVElNRSlcblx0XHR9XG5cdH1cbn1cblxuZXhwb3J0IGNvbnN0IGNyZWF0ZUN1c3RvbVJlcGVhdFJ1bGVVbml0VmFsdWVzID0gKCk6IFNlbGVjdG9ySXRlbUxpc3Q8QWxhcm1JbnRlcnZhbFVuaXQgfCBudWxsPiA9PiB7XG5cdHJldHVybiBbXG5cdFx0e1xuXHRcdFx0bmFtZTogaHVtYW5EZXNjcmlwdGlvbkZvckFsYXJtSW50ZXJ2YWxVbml0KEFsYXJtSW50ZXJ2YWxVbml0Lk1JTlVURSksXG5cdFx0XHR2YWx1ZTogQWxhcm1JbnRlcnZhbFVuaXQuTUlOVVRFLFxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0bmFtZTogaHVtYW5EZXNjcmlwdGlvbkZvckFsYXJtSW50ZXJ2YWxVbml0KEFsYXJtSW50ZXJ2YWxVbml0LkhPVVIpLFxuXHRcdFx0dmFsdWU6IEFsYXJtSW50ZXJ2YWxVbml0LkhPVVIsXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRuYW1lOiBodW1hbkRlc2NyaXB0aW9uRm9yQWxhcm1JbnRlcnZhbFVuaXQoQWxhcm1JbnRlcnZhbFVuaXQuREFZKSxcblx0XHRcdHZhbHVlOiBBbGFybUludGVydmFsVW5pdC5EQVksXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRuYW1lOiBodW1hbkRlc2NyaXB0aW9uRm9yQWxhcm1JbnRlcnZhbFVuaXQoQWxhcm1JbnRlcnZhbFVuaXQuV0VFSyksXG5cdFx0XHR2YWx1ZTogQWxhcm1JbnRlcnZhbFVuaXQuV0VFSyxcblx0XHR9LFxuXHRdXG59XG5leHBvcnQgY29uc3QgQ0FMRU5EQVJfRVZFTlRfSEVJR0hUOiBudW1iZXIgPSBzaXplLmNhbGVuZGFyX2xpbmVfaGVpZ2h0ICsgMlxuZXhwb3J0IGNvbnN0IFRFTVBPUkFSWV9FVkVOVF9PUEFDSVRZID0gMC43XG5cbmV4cG9ydCBjb25zdCBlbnVtIEV2ZW50TGF5b3V0TW9kZSB7XG5cdC8qKiBUYWtlIGV2ZW50IHN0YXJ0IGFuZCBlbmQgdGltZXMgaW50byBhY2NvdW50IHdoZW4gbGF5aW5nIG91dC4gKi9cblx0VGltZUJhc2VkQ29sdW1uLFxuXHQvKiogRWFjaCBldmVudCBpcyB0cmVhdGVkIGFzIGlmIGl0IHdvdWxkIHRha2UgdGhlIHdob2xlIGRheSB3aGVuIGxheWluZyBvdXQuICovXG5cdERheUJhc2VkQ29sdW1uLFxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHdoaWNoIHNvcnRzIGV2ZW50cyBpbnRvIHRoZSBcImNvbHVtbnNcIiBhbmQgXCJyb3dzXCIgYW5kIHJlbmRlcnMgdGhlbSB1c2luZyB7QHBhcmFtIHJlbmRlcmVyfS5cbiAqIENvbHVtbnMgYXJlIGFic3RyYWN0IGFuZCBjYW4gYmUgYWN0dWFsbHkgdGhlIHJvd3MuIEEgc2luZ2xlIGNvbHVtbiBwcm9ncmVzc2VzIGluIHRpbWUgd2hpbGUgbXVsdGlwbGUgY29sdW1ucyBjYW4gaGFwcGVuIGluIHBhcmFsbGVsLlxuICogaW4gb25lIGNvbHVtbiBvbiBhIHNpbmdsZSBkYXkgKGl0IHdpbGwgXCJzdHJldGNoXCIgZXZlbnRzIGZyb20gdGhlIGRheSBzdGFydCB1bnRpbCB0aGUgbmV4dCBkYXkpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gbGF5T3V0RXZlbnRzKFxuXHRldmVudHM6IEFycmF5PENhbGVuZGFyRXZlbnQ+LFxuXHR6b25lOiBzdHJpbmcsXG5cdHJlbmRlcmVyOiAoY29sdW1uczogQXJyYXk8QXJyYXk8Q2FsZW5kYXJFdmVudD4+KSA9PiBDaGlsZEFycmF5LFxuXHRsYXlvdXRNb2RlOiBFdmVudExheW91dE1vZGUsXG4pOiBDaGlsZEFycmF5IHtcblx0ZXZlbnRzLnNvcnQoKGUxLCBlMikgPT4ge1xuXHRcdGNvbnN0IGUxU3RhcnQgPSBnZXRFdmVudFN0YXJ0KGUxLCB6b25lKVxuXHRcdGNvbnN0IGUyU3RhcnQgPSBnZXRFdmVudFN0YXJ0KGUyLCB6b25lKVxuXHRcdGlmIChlMVN0YXJ0IDwgZTJTdGFydCkgcmV0dXJuIC0xXG5cdFx0aWYgKGUxU3RhcnQgPiBlMlN0YXJ0KSByZXR1cm4gMVxuXHRcdGNvbnN0IGUxRW5kID0gZ2V0RXZlbnRFbmQoZTEsIHpvbmUpXG5cdFx0Y29uc3QgZTJFbmQgPSBnZXRFdmVudEVuZChlMiwgem9uZSlcblx0XHRpZiAoZTFFbmQgPCBlMkVuZCkgcmV0dXJuIC0xXG5cdFx0aWYgKGUxRW5kID4gZTJFbmQpIHJldHVybiAxXG5cdFx0cmV0dXJuIDBcblx0fSlcblx0bGV0IGxhc3RFdmVudEVuZGluZzogRGF0ZSB8IG51bGwgPSBudWxsXG5cdGxldCBsYXN0RXZlbnRTdGFydDogRGF0ZSB8IG51bGwgPSBudWxsXG5cdGxldCBjb2x1bW5zOiBBcnJheTxBcnJheTxDYWxlbmRhckV2ZW50Pj4gPSBbXVxuXHRjb25zdCBjaGlsZHJlbjogQXJyYXk8Q2hpbGRyZW4+ID0gW11cblx0Ly8gQ2FjaGUgZm9yIGNhbGN1bGF0aW9uIGV2ZW50c1xuXHRjb25zdCBjYWxjRXZlbnRzID0gbmV3IE1hcCgpXG5cdGZvciAoY29uc3QgZSBvZiBldmVudHMpIHtcblx0XHRjb25zdCBjYWxjRXZlbnQgPSBnZXRGcm9tTWFwKGNhbGNFdmVudHMsIGUsICgpID0+IGdldENhbGN1bGF0aW9uRXZlbnQoZSwgem9uZSwgbGF5b3V0TW9kZSkpXG5cdFx0Ly8gQ2hlY2sgaWYgYSBuZXcgZXZlbnQgZ3JvdXAgbmVlZHMgdG8gYmUgc3RhcnRlZFxuXHRcdGlmIChcblx0XHRcdGxhc3RFdmVudEVuZGluZyAhPSBudWxsICYmXG5cdFx0XHRsYXN0RXZlbnRTdGFydCAhPSBudWxsICYmXG5cdFx0XHRsYXN0RXZlbnRFbmRpbmcgPD0gY2FsY0V2ZW50LnN0YXJ0VGltZS5nZXRUaW1lKCkgJiZcblx0XHRcdChsYXlvdXRNb2RlID09PSBFdmVudExheW91dE1vZGUuRGF5QmFzZWRDb2x1bW4gfHwgIXZpc3VhbGx5T3ZlcmxhcHMobGFzdEV2ZW50U3RhcnQsIGxhc3RFdmVudEVuZGluZywgY2FsY0V2ZW50LnN0YXJ0VGltZSkpXG5cdFx0KSB7XG5cdFx0XHQvLyBUaGUgbGF0ZXN0IGV2ZW50IGlzIGxhdGVyIHRoYW4gYW55IG9mIHRoZSBldmVudCBpbiB0aGVcblx0XHRcdC8vIGN1cnJlbnQgZ3JvdXAuIFRoZXJlIGlzIG5vIG92ZXJsYXAuIE91dHB1dCB0aGUgY3VycmVudFxuXHRcdFx0Ly8gZXZlbnQgZ3JvdXAgYW5kIHN0YXJ0IGEgbmV3IGV2ZW50IGdyb3VwLlxuXHRcdFx0Y2hpbGRyZW4ucHVzaCguLi5yZW5kZXJlcihjb2x1bW5zKSlcblx0XHRcdGNvbHVtbnMgPSBbXSAvLyBUaGlzIHN0YXJ0cyBuZXcgZXZlbnQgZ3JvdXAuXG5cblx0XHRcdGxhc3RFdmVudEVuZGluZyA9IG51bGxcblx0XHRcdGxhc3RFdmVudFN0YXJ0ID0gbnVsbFxuXHRcdH1cblxuXHRcdC8vIFRyeSB0byBwbGFjZSB0aGUgZXZlbnQgaW5zaWRlIHRoZSBleGlzdGluZyBjb2x1bW5zXG5cdFx0bGV0IHBsYWNlZCA9IGZhbHNlXG5cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGNvbHVtbnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGNvbnN0IGNvbCA9IGNvbHVtbnNbaV1cblx0XHRcdGNvbnN0IGxhc3RFdmVudCA9IGNvbFtjb2wubGVuZ3RoIC0gMV1cblx0XHRcdGNvbnN0IGxhc3RDYWxjRXZlbnQgPSBnZXRGcm9tTWFwKGNhbGNFdmVudHMsIGxhc3RFdmVudCwgKCkgPT4gZ2V0Q2FsY3VsYXRpb25FdmVudChsYXN0RXZlbnQsIHpvbmUsIGxheW91dE1vZGUpKVxuXG5cdFx0XHRpZiAoXG5cdFx0XHRcdCFjb2xsaWRlc1dpdGgobGFzdENhbGNFdmVudCwgY2FsY0V2ZW50KSAmJlxuXHRcdFx0XHQobGF5b3V0TW9kZSA9PT0gRXZlbnRMYXlvdXRNb2RlLkRheUJhc2VkQ29sdW1uIHx8ICF2aXN1YWxseU92ZXJsYXBzKGxhc3RDYWxjRXZlbnQuc3RhcnRUaW1lLCBsYXN0Q2FsY0V2ZW50LmVuZFRpbWUsIGNhbGNFdmVudC5zdGFydFRpbWUpKVxuXHRcdFx0KSB7XG5cdFx0XHRcdGNvbC5wdXNoKGUpIC8vIHB1c2ggcmVhbCBldmVudCBoZXJlIG5vdCBjYWxjIGV2ZW50XG5cblx0XHRcdFx0cGxhY2VkID0gdHJ1ZVxuXHRcdFx0XHRicmVha1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIEl0IHdhcyBub3QgcG9zc2libGUgdG8gcGxhY2UgdGhlIGV2ZW50LiBBZGQgYSBuZXcgY29sdW1uXG5cdFx0Ly8gZm9yIHRoZSBjdXJyZW50IGV2ZW50IGdyb3VwLlxuXHRcdGlmICghcGxhY2VkKSB7XG5cdFx0XHRjb2x1bW5zLnB1c2goW2VdKVxuXHRcdH1cblxuXHRcdC8vIFJlbWVtYmVyIHRoZSBsYXRlc3QgZXZlbnQgZW5kIHRpbWUgYW5kIHN0YXJ0IHRpbWUgb2YgdGhlIGN1cnJlbnQgZ3JvdXAuXG5cdFx0Ly8gVGhpcyBpcyBsYXRlciB1c2VkIHRvIGRldGVybWluZSBpZiBhIG5ldyBncm91cHMgc3RhcnRzLlxuXHRcdGlmIChsYXN0RXZlbnRFbmRpbmcgPT0gbnVsbCB8fCBsYXN0RXZlbnRFbmRpbmcuZ2V0VGltZSgpIDwgY2FsY0V2ZW50LmVuZFRpbWUuZ2V0VGltZSgpKSB7XG5cdFx0XHRsYXN0RXZlbnRFbmRpbmcgPSBjYWxjRXZlbnQuZW5kVGltZVxuXHRcdH1cblx0XHRpZiAobGFzdEV2ZW50U3RhcnQgPT0gbnVsbCB8fCBsYXN0RXZlbnRTdGFydC5nZXRUaW1lKCkgPCBjYWxjRXZlbnQuc3RhcnRUaW1lLmdldFRpbWUoKSkge1xuXHRcdFx0bGFzdEV2ZW50U3RhcnQgPSBjYWxjRXZlbnQuc3RhcnRUaW1lXG5cdFx0fVxuXHR9XG5cdGNoaWxkcmVuLnB1c2goLi4ucmVuZGVyZXIoY29sdW1ucykpXG5cdHJldHVybiBjaGlsZHJlblxufVxuXG4vKiogZ2V0IGFuIGV2ZW50IHRoYXQgY2FuIGJlIHJlbmRlcmVkIHRvIHRoZSBzY3JlZW4uIGluIGRheSB2aWV3LCB0aGUgZXZlbnQgaXMgcmV0dXJuZWQgYXMtaXMsIG90aGVyd2lzZSBpdCdzIHN0cmV0Y2hlZCB0byBjb3ZlciBlYWNoIGRheVxuICogaXQgb2NjdXJzIG9uIGNvbXBsZXRlbHkuICovXG5mdW5jdGlvbiBnZXRDYWxjdWxhdGlvbkV2ZW50KGV2ZW50OiBDYWxlbmRhckV2ZW50LCB6b25lOiBzdHJpbmcsIGV2ZW50TGF5b3V0TW9kZTogRXZlbnRMYXlvdXRNb2RlKTogQ2FsZW5kYXJFdmVudCB7XG5cdGlmIChldmVudExheW91dE1vZGUgPT09IEV2ZW50TGF5b3V0TW9kZS5EYXlCYXNlZENvbHVtbikge1xuXHRcdGNvbnN0IGNhbGNFdmVudCA9IGNsb25lKGV2ZW50KVxuXG5cdFx0aWYgKGlzQWxsRGF5RXZlbnQoZXZlbnQpKSB7XG5cdFx0XHRjYWxjRXZlbnQuc3RhcnRUaW1lID0gZ2V0QWxsRGF5RGF0ZUZvclRpbWV6b25lKGV2ZW50LnN0YXJ0VGltZSwgem9uZSlcblx0XHRcdGNhbGNFdmVudC5lbmRUaW1lID0gZ2V0QWxsRGF5RGF0ZUZvclRpbWV6b25lKGV2ZW50LmVuZFRpbWUsIHpvbmUpXG5cdFx0fSBlbHNlIHtcblx0XHRcdGNhbGNFdmVudC5zdGFydFRpbWUgPSBnZXRTdGFydE9mRGF5V2l0aFpvbmUoZXZlbnQuc3RhcnRUaW1lLCB6b25lKVxuXHRcdFx0Y2FsY0V2ZW50LmVuZFRpbWUgPSBnZXRTdGFydE9mTmV4dERheVdpdGhab25lKGV2ZW50LmVuZFRpbWUsIHpvbmUpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGNhbGNFdmVudFxuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBldmVudFxuXHR9XG59XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiBjaGVja3Mgd2hldGhlciB0d28gZXZlbnRzIGNvbGxpZGUgYmFzZWQgb24gdGhlaXIgc3RhcnQgYW5kIGVuZCB0aW1lXG4gKiBBc3N1bWluZyB2ZXJ0aWNhbCBjb2x1bW5zIHdpdGggdGltZSBnb2luZyB0b3AtdG8tYm90dG9tLCB0aGlzIHdvdWxkIGJlIHRydWUgaW4gdGhlc2UgY2FzZXM6XG4gKlxuICogY2FzZSAxOlxuICogKy0tLS0tLS0tLS0tK1xuICogfCAgICAgICAgICAgfFxuICogfCAgICAgICAgICAgfCAgICstLS0tLS0tLS0tK1xuICogKy0tLS0tLS0tLS0tKyAgIHwgICAgICAgICAgfFxuICogICAgICAgICAgICAgICAgIHwgICAgICAgICAgfFxuICogICAgICAgICAgICAgICAgICstLS0tLS0tLS0tK1xuICogY2FzZSAyOlxuICogKy0tLS0tLS0tLS0tK1xuICogfCAgICAgICAgICAgfCAgICstLS0tLS0tLS0tK1xuICogfCAgICAgICAgICAgfCAgIHwgICAgICAgICAgfFxuICogfCAgICAgICAgICAgfCAgICstLS0tLS0tLS0tK1xuICogKy0tLS0tLS0tLS0tK1xuICpcbiAqIFRoZXJlIGNvdWxkIGJlIGEgY2FzZSB3aGVyZSB0aGV5IGFyZSBmbGlwcGVkIHZlcnRpY2FsbHksIGJ1dCB3ZSBkb24ndCBoYXZlIHRoZW0gYmVjYXVzZSBlYXJsaWVyIGV2ZW50cyB3aWxsIGJlIGFsd2F5cyBmaXJzdC4gc28gdGhlIFwibGVmdFwiIHRvcCBlZGdlIHdpbGxcbiAqIGFsd2F5cyBiZSBcImFib3ZlXCIgdGhlIFwicmlnaHRcIiB0b3AgZWRnZS5cbiAqL1xuZnVuY3Rpb24gY29sbGlkZXNXaXRoKGE6IENhbGVuZGFyRXZlbnQsIGI6IENhbGVuZGFyRXZlbnQpOiBib29sZWFuIHtcblx0cmV0dXJuIGEuZW5kVGltZS5nZXRUaW1lKCkgPiBiLnN0YXJ0VGltZS5nZXRUaW1lKCkgJiYgYS5zdGFydFRpbWUuZ2V0VGltZSgpIDwgYi5lbmRUaW1lLmdldFRpbWUoKVxufVxuXG4vKipcbiAqIER1ZSB0byB0aGUgbWluaW11bSBoZWlnaHQgZm9yIGV2ZW50cyB0aGV5IG92ZXJsYXAgaWYgYSBzaG9ydCBldmVudCBpcyBkaXJlY3RseSBmb2xsb3dlZCBieSBhbm90aGVyIGV2ZW50LFxuICogdGhlcmVmb3JlLCB3ZSBjaGVjayB3aGV0aGVyIHRoZSBldmVudCBoZWlnaHQgaXMgbGVzcyB0aGFuIHRoZSBtaW5pbXVtIGhlaWdodC5cbiAqXG4gKiBUaGlzIGRvZXMgbm90IGNvdmVyIGFsbCB0aGUgY2FzZXMgYnV0IGhhbmRsZXMgdGhlIGNhc2Ugd2hlbiB0aGUgc2Vjb25kIGV2ZW50IHN0YXJ0cyByaWdodCBhZnRlciB0aGUgZmlyc3Qgb25lLlxuICovXG5mdW5jdGlvbiB2aXN1YWxseU92ZXJsYXBzKGZpcnN0RXZlbnRTdGFydDogRGF0ZSwgZmlyc3RFdmVudEVuZDogRGF0ZSwgc2Vjb25kRXZlbnRTdGFydDogRGF0ZSk6IGJvb2xlYW4ge1xuXHQvLyBXZSBhcmUgb25seSBpbnRlcmVzdGVkIGluIHRoZSBoZWlnaHQgb24gdGhlIGxhc3QgZGF5IG9mIHRoZSBldmVudCBiZWNhdXNlIGFuIGV2ZW50IGVuZGluZyBsYXRlciB3aWxsIHRha2UgdXAgdGhlIHdob2xlIGNvbHVtbiB1bnRpbCB0aGUgbmV4dCBkYXkgYW55d2F5LlxuXHRjb25zdCBmaXJzdEV2ZW50U3RhcnRPblNhbWVEYXkgPSBpc1NhbWVEYXkoZmlyc3RFdmVudFN0YXJ0LCBmaXJzdEV2ZW50RW5kKSA/IGZpcnN0RXZlbnRTdGFydC5nZXRUaW1lKCkgOiBnZXRTdGFydE9mRGF5KGZpcnN0RXZlbnRFbmQpLmdldFRpbWUoKVxuXHRjb25zdCBldmVudER1cmF0aW9uTXMgPSBmaXJzdEV2ZW50RW5kLmdldFRpbWUoKSAtIGZpcnN0RXZlbnRTdGFydE9uU2FtZURheVxuXHRjb25zdCBldmVudER1cmF0aW9uSG91cnMgPSBldmVudER1cmF0aW9uTXMgLyAoMTAwMCAqIDYwICogNjApXG5cdGNvbnN0IGhlaWdodCA9IGV2ZW50RHVyYXRpb25Ib3VycyAqIHNpemUuY2FsZW5kYXJfaG91cl9oZWlnaHQgLSBzaXplLmNhbGVuZGFyX2V2ZW50X2JvcmRlclxuXHRyZXR1cm4gZmlyc3RFdmVudEVuZC5nZXRUaW1lKCkgPT09IHNlY29uZEV2ZW50U3RhcnQuZ2V0VGltZSgpICYmIGhlaWdodCA8IHNpemUuY2FsZW5kYXJfbGluZV9oZWlnaHRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4cGFuZEV2ZW50KGV2OiBDYWxlbmRhckV2ZW50LCBjb2x1bW5JbmRleDogbnVtYmVyLCBjb2x1bW5zOiBBcnJheTxBcnJheTxDYWxlbmRhckV2ZW50Pj4pOiBudW1iZXIge1xuXHRsZXQgY29sU3BhbiA9IDFcblxuXHRmb3IgKGxldCBpID0gY29sdW1uSW5kZXggKyAxOyBpIDwgY29sdW1ucy5sZW5ndGg7IGkrKykge1xuXHRcdGxldCBjb2wgPSBjb2x1bW5zW2ldXG5cblx0XHRmb3IgKGxldCBqID0gMDsgaiA8IGNvbC5sZW5ndGg7IGorKykge1xuXHRcdFx0bGV0IGV2MSA9IGNvbFtqXVxuXG5cdFx0XHRpZiAoY29sbGlkZXNXaXRoKGV2LCBldjEpIHx8IHZpc3VhbGx5T3ZlcmxhcHMoZXYuc3RhcnRUaW1lLCBldi5lbmRUaW1lLCBldjEuc3RhcnRUaW1lKSkge1xuXHRcdFx0XHRyZXR1cm4gY29sU3BhblxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGNvbFNwYW4rK1xuXHR9XG5cblx0cmV0dXJuIGNvbFNwYW5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEV2ZW50Q29sb3IoZXZlbnQ6IENhbGVuZGFyRXZlbnQsIGdyb3VwQ29sb3JzOiBHcm91cENvbG9ycyk6IHN0cmluZyB7XG5cdHJldHVybiAoZXZlbnQuX293bmVyR3JvdXAgJiYgZ3JvdXBDb2xvcnMuZ2V0KGV2ZW50Ll9vd25lckdyb3VwKSkgPz8gZGVmYXVsdENhbGVuZGFyQ29sb3Jcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbGVuZGFyQXR0ZW5kZWVTdGF0dXNTeW1ib2woc3RhdHVzOiBDYWxlbmRhckF0dGVuZGVlU3RhdHVzKTogc3RyaW5nIHtcblx0c3dpdGNoIChzdGF0dXMpIHtcblx0XHRjYXNlIENhbGVuZGFyQXR0ZW5kZWVTdGF0dXMuQURERUQ6XG5cdFx0Y2FzZSBDYWxlbmRhckF0dGVuZGVlU3RhdHVzLk5FRURTX0FDVElPTjpcblx0XHRcdHJldHVybiBcIlwiXG5cblx0XHRjYXNlIENhbGVuZGFyQXR0ZW5kZWVTdGF0dXMuVEVOVEFUSVZFOlxuXHRcdFx0cmV0dXJuIFwiP1wiXG5cblx0XHRjYXNlIENhbGVuZGFyQXR0ZW5kZWVTdGF0dXMuQUNDRVBURUQ6XG5cdFx0XHRyZXR1cm4gXCLinJNcIlxuXG5cdFx0Y2FzZSBDYWxlbmRhckF0dGVuZGVlU3RhdHVzLkRFQ0xJTkVEOlxuXHRcdFx0cmV0dXJuIFwi4p2MXCJcblxuXHRcdGRlZmF1bHQ6XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIGNhbGVuZGFyIGF0dGVuZGVlIHN0YXR1czogXCIgKyBzdGF0dXMpXG5cdH1cbn1cblxuZXhwb3J0IGNvbnN0IGljb25Gb3JBdHRlbmRlZVN0YXR1czogUmVjb3JkPENhbGVuZGFyQXR0ZW5kZWVTdGF0dXMsIEFsbEljb25zPiA9IE9iamVjdC5mcmVlemUoe1xuXHRbQ2FsZW5kYXJBdHRlbmRlZVN0YXR1cy5BQ0NFUFRFRF06IEljb25zLkNpcmNsZUNoZWNrbWFyayxcblx0W0NhbGVuZGFyQXR0ZW5kZWVTdGF0dXMuVEVOVEFUSVZFXTogSWNvbnMuQ2lyY2xlSGVscCxcblx0W0NhbGVuZGFyQXR0ZW5kZWVTdGF0dXMuREVDTElORURdOiBJY29ucy5DaXJjbGVSZWplY3QsXG5cdFtDYWxlbmRhckF0dGVuZGVlU3RhdHVzLk5FRURTX0FDVElPTl06IEljb25zLkNpcmNsZUhlbHAsXG5cdFtDYWxlbmRhckF0dGVuZGVlU3RhdHVzLkFEREVEXTogSWNvbnMuQ2lyY2xlSGVscCxcbn0pXG5leHBvcnQgY29uc3QgZ2V0R3JvdXBDb2xvcnMgPSBtZW1vaXplZCgodXNlclNldHRpbmdzR3JvdXBSb290OiBVc2VyU2V0dGluZ3NHcm91cFJvb3QpID0+IHtcblx0cmV0dXJuIHVzZXJTZXR0aW5nc0dyb3VwUm9vdC5ncm91cFNldHRpbmdzLnJlZHVjZSgoYWNjLCB7IGdyb3VwLCBjb2xvciB9KSA9PiB7XG5cdFx0aWYgKCFpc1ZhbGlkQ29sb3JDb2RlKFwiI1wiICsgY29sb3IpKSB7XG5cdFx0XHRjb2xvciA9IGRlZmF1bHRDYWxlbmRhckNvbG9yXG5cdFx0fVxuXHRcdGFjYy5zZXQoZ3JvdXAsIGNvbG9yKVxuXHRcdHJldHVybiBhY2Ncblx0fSwgbmV3IE1hcCgpKVxufSlcblxuZXhwb3J0IGNvbnN0IGdldENsaWVudE9ubHlDb2xvcnMgPSAodXNlcklkOiBJZCwgY2xpZW50T25seUNhbGVuZGFyc0luZm86IE1hcDxJZCwgQ2xpZW50T25seUNhbGVuZGFyc0luZm8+KSA9PiB7XG5cdGNvbnN0IGNvbG9yczogTWFwPElkLCBzdHJpbmc+ID0gbmV3IE1hcCgpXG5cdGZvciAoY29uc3QgW2lkLCBfXSBvZiBDTElFTlRfT05MWV9DQUxFTkRBUlMpIHtcblx0XHRjb25zdCBjYWxlbmRhcklkID0gYCR7dXNlcklkfSMke2lkfWBcblx0XHRjb2xvcnMuc2V0KGNhbGVuZGFySWQsIGNsaWVudE9ubHlDYWxlbmRhcnNJbmZvLmdldChjYWxlbmRhcklkKT8uY29sb3IgPz8gREVGQVVMVF9DTElFTlRfT05MWV9DQUxFTkRBUl9DT0xPUlMuZ2V0KGlkKSEpXG5cdH1cblx0cmV0dXJuIGNvbG9yc1xufVxuXG5leHBvcnQgY29uc3QgZ2V0Q2xpZW50T25seUNhbGVuZGFycyA9ICh1c2VySWQ6IElkLCBjbGllbnRPbmx5Q2FsZW5kYXJJbmZvOiBNYXA8SWQsIENsaWVudE9ubHlDYWxlbmRhcnNJbmZvPikgPT4ge1xuXHRjb25zdCB1c2VyQ2FsZW5kYXJzOiAoQ2xpZW50T25seUNhbGVuZGFyc0luZm8gJiB7IGlkOiBzdHJpbmc7IG5hbWU6IHN0cmluZyB9KVtdID0gW11cblxuXHRmb3IgKGNvbnN0IFtpZCwga2V5XSBvZiBDTElFTlRfT05MWV9DQUxFTkRBUlMpIHtcblx0XHRjb25zdCBjYWxlbmRhcklkID0gYCR7dXNlcklkfSMke2lkfWBcblx0XHRjb25zdCBjYWxlbmRhciA9IGNsaWVudE9ubHlDYWxlbmRhckluZm8uZ2V0KGNhbGVuZGFySWQpXG5cdFx0aWYgKGNhbGVuZGFyKSB7XG5cdFx0XHR1c2VyQ2FsZW5kYXJzLnB1c2goe1xuXHRcdFx0XHQuLi5jYWxlbmRhcixcblx0XHRcdFx0aWQ6IGNhbGVuZGFySWQsXG5cdFx0XHRcdG5hbWU6IGNhbGVuZGFyLm5hbWUgPyBjYWxlbmRhci5uYW1lIDogbGFuZy5nZXQoa2V5KSxcblx0XHRcdH0pXG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHVzZXJDYWxlbmRhcnNcbn1cblxuLyoqXG4gKiAgZmluZCBvdXQgaG93IHdlIGVuZGVkIHVwIHdpdGggdGhpcyBldmVudCwgd2hpY2ggZGV0ZXJtaW5lcyB0aGUgY2FwYWJpbGl0aWVzIHdlIGhhdmUgd2l0aCBpdC5cbiAqICBmb3Igc2hhcmVkIGV2ZW50cyBpbiBjYWxlbmRhciB3aGVyZSB3ZSBoYXZlIHJlYWQtd3JpdGUgYWNjZXNzLCB3ZSBjYW4gc3RpbGwgb25seSB2aWV3IGV2ZW50cyB0aGF0IGhhdmVcbiAqICBhdHRlbmRlZXMsIGJlY2F1c2Ugd2UgY291bGQgbm90IHNlbmQgdXBkYXRlcyBhZnRlciB3ZSBlZGl0IHNvbWV0aGluZ1xuICogQHBhcmFtIGV4aXN0aW5nRXZlbnQgdGhlIGV2ZW50IGluIHF1ZXN0aW9uLlxuICogQHBhcmFtIGNhbGVuZGFycyBhIGxpc3Qgb2YgY2FsZW5kYXJzIHRoYXQgdGhpcyB1c2VyIGhhcyBhY2Nlc3MgdG8uXG4gKiBAcGFyYW0gb3duTWFpbEFkZHJlc3NlcyB0aGUgbGlzdCBvZiBtYWlsIGFkZHJlc3NlcyB0aGlzIHVzZXIgbWlnaHQgYmUgdXNpbmcuXG4gKiBAcGFyYW0gdXNlckNvbnRyb2xsZXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEV2ZW50VHlwZShcblx0ZXhpc3RpbmdFdmVudDogUGFydGlhbDxDYWxlbmRhckV2ZW50Pixcblx0Y2FsZW5kYXJzOiBSZWFkb25seU1hcDxJZCwgQ2FsZW5kYXJJbmZvPixcblx0b3duTWFpbEFkZHJlc3NlczogUmVhZG9ubHlBcnJheTxzdHJpbmc+LFxuXHR1c2VyQ29udHJvbGxlcjogVXNlckNvbnRyb2xsZXIsXG4pOiBFdmVudFR5cGUge1xuXHRjb25zdCB7IHVzZXIsIHVzZXJTZXR0aW5nc0dyb3VwUm9vdCB9ID0gdXNlckNvbnRyb2xsZXJcblxuXHRpZiAodXNlci5hY2NvdW50VHlwZSA9PT0gQWNjb3VudFR5cGUuRVhURVJOQUwpIHtcblx0XHRyZXR1cm4gRXZlbnRUeXBlLkVYVEVSTkFMXG5cdH1cblxuXHRjb25zdCBleGlzdGluZ09yZ2FuaXplciA9IGV4aXN0aW5nRXZlbnQub3JnYW5pemVyXG5cdGNvbnN0IGlzT3JnYW5pemVyID0gZXhpc3RpbmdPcmdhbml6ZXIgIT0gbnVsbCAmJiBvd25NYWlsQWRkcmVzc2VzLnNvbWUoKGEpID0+IGNsZWFuTWFpbEFkZHJlc3MoYSkgPT09IGV4aXN0aW5nT3JnYW5pemVyLmFkZHJlc3MpXG5cblx0aWYgKGV4aXN0aW5nRXZlbnQuX293bmVyR3JvdXAgPT0gbnVsbCkge1xuXHRcdGlmIChleGlzdGluZ09yZ2FuaXplciAhPSBudWxsICYmICFpc09yZ2FuaXplcikge1xuXHRcdFx0Ly8gT3duZXJHcm91cCBpcyBub3Qgc2V0IGZvciBldmVudHMgZnJvbSBmaWxlLCBidXQgd2UgYWxzbyByZXF1aXJlIGFuIG9yZ2FuaXplciB0byB0cmVhdCBpdCBhcyBhbiBpbnZpdGUuXG5cdFx0XHRyZXR1cm4gRXZlbnRUeXBlLklOVklURVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBlaXRoZXIgdGhlIG9yZ2FuaXplciBleGlzdHMgYW5kIGl0J3MgdXMsIG9yIHRoZSBvcmdhbml6ZXIgZG9lcyBub3QgZXhpc3QgYW5kIHdlIGNhbiB0cmVhdCB0aGlzIGFzIG91ciBldmVudCxcblx0XHRcdC8vIGxpa2UgZm9yIG5ld2x5IGNyZWF0ZWQgZXZlbnRzLlxuXHRcdFx0cmV0dXJuIEV2ZW50VHlwZS5PV05cblx0XHR9XG5cdH1cblxuXHRjb25zdCBjYWxlbmRhckluZm9Gb3JFdmVudCA9IGNhbGVuZGFycy5nZXQoZXhpc3RpbmdFdmVudC5fb3duZXJHcm91cCkgPz8gbnVsbFxuXHRpZiAoY2FsZW5kYXJJbmZvRm9yRXZlbnQgPT0gbnVsbCB8fCBjYWxlbmRhckluZm9Gb3JFdmVudC5pc0V4dGVybmFsKSB7XG5cdFx0Ly8gZXZlbnQgaGFzIGFuIG93bmVyZ3JvdXAsIGJ1dCBpdCdzIG5vdCBpbiBvbmUgb2Ygb3VyIGNhbGVuZGFycy4gdGhpcyBtaWdodCBhY3R1YWxseSBiZSBhbiBlcnJvci5cblx0XHRyZXR1cm4gRXZlbnRUeXBlLlNIQVJFRF9ST1xuXHR9XG5cblx0LyoqXG5cdCAqIGlmIHRoZSBldmVudCBoYXMgYSBfb3duZXJHcm91cCwgaXQgbWVhbnMgdGhlcmUgaXMgYSBjYWxlbmRhciBzZXQgdG8gaXRcblx0ICogc28sIGlmIHRoZSB1c2VyIGlzIHRoZSBvd25lciBvZiBzYWlkIGNhbGVuZGFyIHRoZXkgYXJlIGZyZWUgdG8gbWFuYWdlIHRoZSBldmVudCBob3dldmVyIHRoZXkgd2FudFxuXHQgKiovXG5cdGlmICgoaXNPcmdhbml6ZXIgfHwgZXhpc3RpbmdPcmdhbml6ZXIgPT09IG51bGwpICYmIGNhbGVuZGFySW5mb0ZvckV2ZW50LnVzZXJJc093bmVyKSB7XG5cdFx0cmV0dXJuIEV2ZW50VHlwZS5PV05cblx0fVxuXG5cdGlmIChjYWxlbmRhckluZm9Gb3JFdmVudC5zaGFyZWQpIHtcblx0XHRjb25zdCBjYW5Xcml0ZSA9IGhhc0NhcGFiaWxpdHlPbkdyb3VwKHVzZXIsIGNhbGVuZGFySW5mb0ZvckV2ZW50Lmdyb3VwLCBTaGFyZUNhcGFiaWxpdHkuV3JpdGUpXG5cdFx0aWYgKGNhbldyaXRlKSB7XG5cdFx0XHRjb25zdCBvcmdhbml6ZXJBZGRyZXNzID0gY2xlYW5NYWlsQWRkcmVzcyhleGlzdGluZ09yZ2FuaXplcj8uYWRkcmVzcyA/PyBcIlwiKVxuXHRcdFx0Y29uc3Qgd291bGRSZXF1aXJlVXBkYXRlczogYm9vbGVhbiA9XG5cdFx0XHRcdGV4aXN0aW5nRXZlbnQuYXR0ZW5kZWVzICE9IG51bGwgJiYgZXhpc3RpbmdFdmVudC5hdHRlbmRlZXMuc29tZSgoYSkgPT4gY2xlYW5NYWlsQWRkcmVzcyhhLmFkZHJlc3MuYWRkcmVzcykgIT09IG9yZ2FuaXplckFkZHJlc3MpXG5cdFx0XHRyZXR1cm4gd291bGRSZXF1aXJlVXBkYXRlcyA/IEV2ZW50VHlwZS5MT0NLRUQgOiBFdmVudFR5cGUuU0hBUkVEX1JXXG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBFdmVudFR5cGUuU0hBUkVEX1JPXG5cdFx0fVxuXHR9XG5cblx0Ly9Gb3IgYW4gZXZlbnQgaW4gYSBwZXJzb25hbCBjYWxlbmRhciB0aGVyZSBhcmUgMyBvcHRpb25zXG5cdGlmIChleGlzdGluZ09yZ2FuaXplciA9PSBudWxsIHx8IGV4aXN0aW5nRXZlbnQuYXR0ZW5kZWVzPy5sZW5ndGggPT09IDAgfHwgaXNPcmdhbml6ZXIpIHtcblx0XHQvLyAxLiB3ZSBhcmUgdGhlIG9yZ2FuaXplciBvZiB0aGUgZXZlbnQgb3IgdGhlIGV2ZW50IGRvZXMgbm90IGhhdmUgYW4gb3JnYW5pemVyIHlldFxuXHRcdC8vIDIuIHdlIGFyZSBub3QgdGhlIG9yZ2FuaXplciBhbmQgdGhlIGV2ZW50IGRvZXMgbm90IGhhdmUgZ3Vlc3RzLiBpdCB3YXMgY3JlYXRlZCBieSBzb21lb25lIHdlIHNoYXJlZCBvdXIgY2FsZW5kYXIgd2l0aCAoYWxzbyBjb25zaWRlcmVkIG91ciBvd24gZXZlbnQpXG5cdFx0cmV0dXJuIEV2ZW50VHlwZS5PV05cblx0fSBlbHNlIHtcblx0XHQvLyAzLiB0aGUgZXZlbnQgaXMgYW4gaW52aXRhdGlvbiB0aGF0IGhhcyBhbm90aGVyIG9yZ2FuaXplciBhbmQvb3IgYXR0ZW5kZWVzLlxuXHRcdHJldHVybiBFdmVudFR5cGUuSU5WSVRFXG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3VsZERpc3BsYXlFdmVudChlOiBDYWxlbmRhckV2ZW50LCBoaWRkZW5DYWxlbmRhcnM6IFJlYWRvbmx5U2V0PElkPik6IGJvb2xlYW4ge1xuXHRyZXR1cm4gIWhpZGRlbkNhbGVuZGFycy5oYXMoYXNzZXJ0Tm90TnVsbChlLl9vd25lckdyb3VwLCBcImV2ZW50IHdpdGhvdXQgb3duZXJHcm91cCBpbiBnZXRFdmVudHNPbkRheXNcIikpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkYXlzSGF2ZUV2ZW50cyhldmVudHNPbkRheXM6IEV2ZW50c09uRGF5cyk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gZXZlbnRzT25EYXlzLnNob3J0RXZlbnRzUGVyRGF5LnNvbWUoaXNOb3RFbXB0eSkgfHwgaXNOb3RFbXB0eShldmVudHNPbkRheXMubG9uZ0V2ZW50cylcbn1cblxuLyoqXG4gKiBBIGhhbmRsZXIgZm9yIGBvbndoZWVsYCB0byBtb3ZlIHRvIGEgZm9yd2FyZHMgb3IgcHJldmlvdXMgdmlldyBiYXNlZCBvbiBtb3VzZSB3aGVlbCBtb3ZlbWVudFxuICogQHJldHVybnMgYSBmdW5jdGlvbiB0byBiZSB1c2VkIGJ5IGBvbndoZWVsYFxuICovXG5leHBvcnQgZnVuY3Rpb24gY2hhbmdlUGVyaW9kT25XaGVlbChjYWxsYmFjazogKGlzTmV4dDogYm9vbGVhbikgPT4gdW5rbm93bik6IChldmVudDogV2hlZWxFdmVudCkgPT4gdm9pZCB7XG5cdHJldHVybiAoZXZlbnQ6IFdoZWVsRXZlbnQpID0+IHtcblx0XHQvLyBHbyB0byB0aGUgbmV4dCBwZXJpb2QgaWYgc2Nyb2xsaW5nIGRvd24gb3IgcmlnaHRcblx0XHRjYWxsYmFjayhldmVudC5kZWx0YVkgPiAwIHx8IGV2ZW50LmRlbHRhWCA+IDApXG5cdH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNob3dEZWxldGVQb3B1cChtb2RlbDogQ2FsZW5kYXJFdmVudFByZXZpZXdWaWV3TW9kZWwsIGV2OiBNb3VzZUV2ZW50LCByZWNlaXZlcjogSFRNTEVsZW1lbnQsIG9uQ2xvc2U/OiAoKSA9PiB1bmtub3duKSB7XG5cdGlmIChhd2FpdCBtb2RlbC5pc1JlcGVhdGluZ0ZvckRlbGV0aW5nKCkpIHtcblx0XHRjcmVhdGVBc3luY0Ryb3Bkb3duKHtcblx0XHRcdGxhenlCdXR0b25zOiAoKSA9PlxuXHRcdFx0XHRQcm9taXNlLnJlc29sdmUoW1xuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxhYmVsOiBcImRlbGV0ZVNpbmdsZUV2ZW50UmVjdXJyZW5jZV9hY3Rpb25cIixcblx0XHRcdFx0XHRcdGNsaWNrOiBhc3luYyAoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdGF3YWl0IG1vZGVsLmRlbGV0ZVNpbmdsZSgpXG5cdFx0XHRcdFx0XHRcdG9uQ2xvc2U/LigpXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGFiZWw6IFwiZGVsZXRlQWxsRXZlbnRSZWN1cnJlbmNlX2FjdGlvblwiLFxuXHRcdFx0XHRcdFx0Y2xpY2s6ICgpID0+IGNvbmZpcm1EZWxldGVDbG9zZShtb2RlbCwgb25DbG9zZSksXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XSksXG5cdFx0XHR3aWR0aDogMzAwLFxuXHRcdH0pKGV2LCByZWNlaXZlcilcblx0fSBlbHNlIHtcblx0XHQvLyBub2luc3BlY3Rpb24gSlNJZ25vcmVkUHJvbWlzZUZyb21DYWxsXG5cdFx0Y29uZmlybURlbGV0ZUNsb3NlKG1vZGVsLCBvbkNsb3NlKVxuXHR9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNvbmZpcm1EZWxldGVDbG9zZShtb2RlbDogQ2FsZW5kYXJFdmVudFByZXZpZXdWaWV3TW9kZWwsIG9uQ2xvc2U/OiAoKSA9PiB1bmtub3duKTogUHJvbWlzZTx2b2lkPiB7XG5cdGlmICghKGF3YWl0IERpYWxvZy5jb25maXJtKFwiZGVsZXRlRXZlbnRDb25maXJtYXRpb25fbXNnXCIpKSkgcmV0dXJuXG5cdGF3YWl0IG1vZGVsLmRlbGV0ZUFsbCgpXG5cdG9uQ2xvc2U/LigpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXREaXNwbGF5RXZlbnRUaXRsZSh0aXRsZTogc3RyaW5nKTogc3RyaW5nIHtcblx0cmV0dXJuIHRpdGxlID8/IHRpdGxlICE9PSBcIlwiID8gdGl0bGUgOiBsYW5nLmdldChcIm5vVGl0bGVfbGFiZWxcIilcbn1cblxuZXhwb3J0IHR5cGUgQ29sb3JTdHJpbmcgPSBzdHJpbmdcblxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlUmFuZG9tQ29sb3IoKTogQ29sb3JTdHJpbmcge1xuXHRjb25zdCBtb2RlbCA9IG5ldyBDb2xvclBpY2tlck1vZGVsKCFpc0NvbG9yTGlnaHQodGhlbWUuY29udGVudF9iZykpXG5cdHJldHVybiBoc2xUb0hleChtb2RlbC5nZXRDb2xvcihNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBNQVhfSFVFX0FOR0xFKSwgMikpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJDYWxlbmRhckNvbG9yKHNlbGVjdGVkQ2FsZW5kYXI6IENhbGVuZGFySW5mbyB8IG51bGwsIGdyb3VwQ29sb3JzOiBNYXA8SWQsIHN0cmluZz4pIHtcblx0Y29uc3QgY29sb3IgPSBzZWxlY3RlZENhbGVuZGFyID8gZ3JvdXBDb2xvcnMuZ2V0KHNlbGVjdGVkQ2FsZW5kYXIuZ3JvdXBJbmZvLmdyb3VwKSA/PyBkZWZhdWx0Q2FsZW5kYXJDb2xvciA6IG51bGxcblx0cmV0dXJuIG0oXCIubXQteHNcIiwge1xuXHRcdHN0eWxlOiB7XG5cdFx0XHR3aWR0aDogXCIxMDBweFwiLFxuXHRcdFx0aGVpZ2h0OiBcIjEwcHhcIixcblx0XHRcdGJhY2tncm91bmQ6IGNvbG9yID8gXCIjXCIgKyBjb2xvciA6IFwidHJhbnNwYXJlbnRcIixcblx0XHR9LFxuXHR9KVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7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