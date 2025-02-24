import { assertNotNull, clone, deepEqual, defer, downcast, filterInt, getFromMap, isSameDay, symmetricDifference, } from "@tutao/tutanota-utils";
import { CalendarMethod, EXTERNAL_CALENDAR_SYNC_INTERVAL, FeatureType } from "../../../common/api/common/TutanotaConstants";
import { createDateWrapper, createMembershipRemoveData, GroupInfoTypeRef, GroupTypeRef, UserAlarmInfoTypeRef, } from "../../../common/api/entities/sys/TypeRefs.js";
import { CalendarEventTypeRef, CalendarEventUpdateTypeRef, CalendarGroupRootTypeRef, createDefaultAlarmInfo, createGroupSettings, FileTypeRef, UserSettingsGroupRootTypeRef, } from "../../../common/api/entities/tutanota/TypeRefs.js";
import { isApp, isDesktop } from "../../../common/api/common/Env";
import { LockedError, NotAuthorizedError, NotFoundError, PreconditionFailedError } from "../../../common/api/common/error/RestError";
import { ParserError } from "../../../common/misc/parsing/ParserCombinator";
import { NoopProgressMonitor } from "../../../common/api/common/utils/ProgressMonitor";
import { elementIdPart, getElementId, isSameId, listIdPart, removeTechnicalFields } from "../../../common/api/common/utils/EntityUtils";
import m from "mithril";
import { MembershipService } from "../../../common/api/entities/sys/Services";
import { findAttendeeInAddresses, serializeAlarmInterval } from "../../../common/api/common/utils/CommonCalendarUtils.js";
import { TutanotaError } from "@tutao/tutanota-error";
import { SessionKeyNotFoundError } from "../../../common/api/common/error/SessionKeyNotFoundError.js";
import { ObservableLazyLoaded } from "../../../common/api/common/utils/ObservableLazyLoaded.js";
import { formatDateWithWeekdayAndTime, formatTime } from "../../../common/misc/Formatter.js";
import { isUpdateFor, isUpdateForTypeRef } from "../../../common/api/common/utils/EntityUpdateUtils.js";
import { assignEventId, checkEventValidity, getTimeZone, hasSourceUrl, } from "../../../common/calendar/date/CalendarUtils.js";
import { isSharedGroupOwner, loadGroupMembers } from "../../../common/sharing/GroupUtils.js";
import { locator } from "../../../common/api/main/CommonLocator.js";
import { EventImportRejectionReason, parseCalendarStringData, sortOutParsedEvents } from "../../../common/calendar/import/ImportExportUtils.js";
import { UserError } from "../../../common/api/main/UserError.js";
import { lang } from "../../../common/misc/LanguageViewModel.js";
const TAG = "[CalendarModel]";
export function assertEventValidity(event) {
    switch (checkEventValidity(event)) {
        case 0 /* CalendarEventValidity.InvalidContainsInvalidDate */:
            throw new UserError("invalidDate_msg");
        case 1 /* CalendarEventValidity.InvalidEndBeforeStart */:
            throw new UserError("startAfterEnd_label");
        case 2 /* CalendarEventValidity.InvalidPre1970 */:
            // shouldn't happen while the check in setStartDate is still there, resetting the date each time
            throw new UserError("pre1970Start_msg");
        case 3 /* CalendarEventValidity.Valid */:
        // event is valid, nothing to do
    }
}
export class CalendarModel {
    notifications;
    alarmScheduler;
    serviceExecutor;
    logins;
    progressTracker;
    entityClient;
    mailboxModel;
    calendarFacade;
    fileController;
    zone;
    externalCalendarFacade;
    deviceConfig;
    pushService;
    /**
     * Map from calendar event element id to the deferred object with a promise of getting CREATE event for this calendar event. We need to do that because
     * entity updates for CalendarEvent and UserAlarmInfo come in different batches and we need to wait for the event when we want to process new alarm.
     *
     * We use the counter to remove the pending request from map when all alarms are processed. We want to do that in case the event gets updated and we need
     * to wait for the new version of the event.
     */
    pendingAlarmRequests = new Map();
    userAlarmToAlarmInfo = new Map();
    fileIdToSkippedCalendarEventUpdates = new Map();
    readProgressMonitor;
    /**
     * Map from group id to CalendarInfo
     */
    calendarInfos = new ObservableLazyLoaded(() => {
        const monitor = this.readProgressMonitor.next().value;
        const calendarInfoPromise = this.loadOrCreateCalendarInfo(monitor);
        monitor.completed();
        return calendarInfoPromise;
    }, new Map());
    constructor(notifications, alarmScheduler, eventController, serviceExecutor, logins, progressTracker, entityClient, mailboxModel, calendarFacade, fileController, zone, externalCalendarFacade, deviceConfig, pushService) {
        this.notifications = notifications;
        this.alarmScheduler = alarmScheduler;
        this.serviceExecutor = serviceExecutor;
        this.logins = logins;
        this.progressTracker = progressTracker;
        this.entityClient = entityClient;
        this.mailboxModel = mailboxModel;
        this.calendarFacade = calendarFacade;
        this.fileController = fileController;
        this.zone = zone;
        this.externalCalendarFacade = externalCalendarFacade;
        this.deviceConfig = deviceConfig;
        this.pushService = pushService;
        this.readProgressMonitor = oneShotProgressMonitorGenerator(progressTracker, logins.getUserController());
        eventController.addEntityListener((updates, eventOwnerGroupId) => this.entityEventsReceived(updates, eventOwnerGroupId));
    }
    getCalendarInfos() {
        return this.calendarInfos.getAsync();
    }
    getCalendarInfosStream() {
        return this.calendarInfos.stream;
    }
    async createEvent(event, alarmInfos, zone, groupRoot) {
        await this.doCreate(event, zone, groupRoot, alarmInfos);
    }
    /** Update existing event when time did not change */
    async updateEvent(newEvent, newAlarms, zone, groupRoot, existingEvent) {
        if (existingEvent._id == null) {
            throw new Error("Invalid existing event for update: no id");
        }
        if (existingEvent.uid != null && newEvent.uid !== existingEvent.uid) {
            throw new Error("Invalid existing event for update: mismatched uids.");
        }
        // in cases where start time or calendar changed, we need to change the event id and so need to delete/recreate.
        // it's also possible that the event has to be moved from the long event list to the short event list or vice versa.
        if (existingEvent._ownerGroup !== groupRoot._id ||
            newEvent.startTime.getTime() !== existingEvent.startTime.getTime() ||
            (await didLongStateChange(newEvent, existingEvent, zone))) {
            // We should reload the instance here because session key and permissions are updated when we recreate event.
            await this.doCreate(newEvent, zone, groupRoot, newAlarms, existingEvent);
            return await this.entityClient.load(CalendarEventTypeRef, newEvent._id);
        }
        else {
            newEvent._ownerGroup = groupRoot._id;
            // We can't load updated event here because cache is not updated yet. We also shouldn't need to load it, we have the latest
            // version
            await this.calendarFacade.updateCalendarEvent(newEvent, newAlarms, existingEvent);
            return newEvent;
        }
    }
    /** Load map from group/groupRoot ID to the calendar info */
    async loadCalendarInfos(progressMonitor) {
        const userController = this.logins.getUserController();
        const notFoundMemberships = [];
        const groupInstances = [];
        for (const membership of userController.getCalendarMemberships()) {
            try {
                const result = await Promise.all([
                    this.entityClient.load(CalendarGroupRootTypeRef, membership.group),
                    this.entityClient.load(GroupInfoTypeRef, membership.groupInfo),
                    this.entityClient.load(GroupTypeRef, membership.group),
                ]);
                groupInstances.push(result);
            }
            catch (e) {
                if (e instanceof NotFoundError) {
                    notFoundMemberships.push(membership);
                }
                else {
                    throw e;
                }
            }
            progressMonitor.workDone(3);
        }
        const calendarInfos = new Map();
        const groupSettings = userController.userSettingsGroupRoot.groupSettings;
        for (const [groupRoot, groupInfo, group] of groupInstances) {
            try {
                const groupMembers = await loadGroupMembers(group, this.entityClient);
                const shared = groupMembers.length > 1;
                const userIsOwner = !shared || isSharedGroupOwner(group, userController.userId);
                const isExternal = hasSourceUrl(groupSettings.find((groupSettings) => groupSettings.group === group._id));
                calendarInfos.set(groupRoot._id, {
                    groupRoot,
                    groupInfo,
                    group: group,
                    shared,
                    userIsOwner,
                    isExternal,
                });
            }
            catch (e) {
                if (e instanceof NotAuthorizedError) {
                    console.log("NotAuthorizedError when initializing calendar. Calendar has been removed ");
                }
                else {
                    throw e;
                }
            }
        }
        // cleanup inconsistent memberships
        for (const membership of notFoundMemberships) {
            // noinspection ES6MissingAwait
            this.serviceExecutor
                .delete(MembershipService, createMembershipRemoveData({
                user: userController.userId,
                group: membership.group,
            }))
                .catch((e) => console.log("error cleaning up membership for group: ", membership.group));
        }
        return calendarInfos;
    }
    async fetchExternalCalendar(url) {
        if (!this.externalCalendarFacade)
            throw new Error(`externalCalendarFacade is ${typeof this.externalCalendarFacade} at CalendarModel`);
        const calendarStr = await this.externalCalendarFacade?.fetchExternalCalendar(url);
        return calendarStr ?? "";
    }
    scheduleExternalCalendarSync() {
        setInterval(() => {
            this.syncExternalCalendars().catch((e) => console.error(e.message));
        }, EXTERNAL_CALENDAR_SYNC_INTERVAL);
    }
    async syncExternalCalendars(groupSettings = null, syncInterval = EXTERNAL_CALENDAR_SYNC_INTERVAL, longErrorMessage = false, forceSync = false) {
        if (!this.externalCalendarFacade || !locator.logins.isFullyLoggedIn()) {
            return;
        }
        let existingGroupSettings = groupSettings;
        const userController = this.logins.getUserController();
        const groupRootsPromises = [];
        let calendarGroupRootsList = [];
        for (const membership of userController.getCalendarMemberships()) {
            groupRootsPromises.push(this.entityClient.load(CalendarGroupRootTypeRef, membership.group));
        }
        calendarGroupRootsList = await Promise.all(groupRootsPromises);
        if (!existingGroupSettings) {
            const { groupSettings: gSettings } = await locator.entityClient.load(UserSettingsGroupRootTypeRef, userController.user.userGroup.group);
            existingGroupSettings = gSettings;
        }
        const skippedCalendars = new Map();
        for (const { sourceUrl, group, name } of existingGroupSettings) {
            if (!sourceUrl) {
                continue;
            }
            const lastSyncEntry = this.deviceConfig.getLastExternalCalendarSync().get(group);
            const offset = 1000; // Add an offset to account for cpu speed when storing or generating timestamps
            const shouldSkipSync = !forceSync &&
                lastSyncEntry?.lastSyncStatus === "Success" /* SyncStatus.Success */ &&
                lastSyncEntry.lastSuccessfulSync &&
                Date.now() + offset - lastSyncEntry.lastSuccessfulSync < syncInterval;
            if (shouldSkipSync)
                continue;
            const currentCalendarGroupRoot = calendarGroupRootsList.find((calendarGroupRoot) => isSameId(calendarGroupRoot._id, group)) ?? null;
            if (!currentCalendarGroupRoot) {
                console.error(`Trying to sync a calendar the user isn't subscribed to anymore: ${group}`);
                continue;
            }
            let parsedExternalEvents = [];
            try {
                const externalCalendar = await this.fetchExternalCalendar(sourceUrl);
                parsedExternalEvents = parseCalendarStringData(externalCalendar, getTimeZone()).contents;
            }
            catch (error) {
                let calendarName = name;
                if (!calendarName) {
                    const calendars = await this.getCalendarInfos();
                    calendarName = calendars.get(group)?.groupInfo.name;
                }
                skippedCalendars.set(group, { calendarName, error });
                continue;
            }
            const existingEventList = await loadAllEvents(currentCalendarGroupRoot);
            const operationsLog = {
                skipped: [],
                updated: [],
                created: [],
                deleted: [],
            };
            /**
             * Sync strategy
             * - Replace duplicates
             * - Add new
             * - Remove rest
             */
            const { rejectedEvents, eventsForCreation } = sortOutParsedEvents(parsedExternalEvents, existingEventList, currentCalendarGroupRoot, getTimeZone());
            const duplicates = rejectedEvents.get(EventImportRejectionReason.Duplicate) ?? [];
            // Replacing duplicates with changes
            for (const duplicatedEvent of duplicates) {
                const existingEvent = existingEventList.find((event) => event.uid === duplicatedEvent.uid);
                if (!existingEvent) {
                    console.warn("Found a duplicate without an existing event!");
                    continue;
                }
                if (this.eventHasSameFields(duplicatedEvent, existingEvent)) {
                    operationsLog.skipped.push(duplicatedEvent);
                    continue;
                }
                await this.updateEventWithExternal(existingEvent, duplicatedEvent);
                operationsLog.updated.push(duplicatedEvent);
            }
            console.log(TAG, `${operationsLog.skipped.length} events skipped (duplication without changes)`);
            console.log(TAG, `${operationsLog.updated.length} events updated (duplication with changes)`);
            // Add new event
            for (const { event } of eventsForCreation) {
                assignEventId(event, getTimeZone(), currentCalendarGroupRoot);
                // Reset ownerEncSessionKey because it cannot be set for new entity, it will be assigned by the CryptoFacade
                event._ownerEncSessionKey = null;
                if (event.repeatRule != null) {
                    event.repeatRule.excludedDates = event.repeatRule.excludedDates.map(({ date }) => createDateWrapper({ date }));
                }
                // Reset permissions because server will assign them
                downcast(event)._permissions = null;
                event._ownerGroup = currentCalendarGroupRoot._id;
                assertEventValidity(event);
                operationsLog.created.push(event);
            }
            await this.calendarFacade.saveImportedCalendarEvents(eventsForCreation, 0);
            console.log(TAG, `${operationsLog.created.length} events created`);
            // Remove rest
            const eventsToRemove = existingEventList.filter((existingEvent) => !parsedExternalEvents.some((externalEvent) => externalEvent.event.uid === existingEvent.uid));
            for (const event of eventsToRemove) {
                await this.deleteEvent(event).catch((err) => {
                    if (err instanceof NotFoundError) {
                        return console.log(`Already deleted event`, event);
                    }
                    throw err;
                });
                operationsLog.deleted.push(event);
            }
            console.log(TAG, `${operationsLog.deleted.length} events removed`);
            this.deviceConfig.updateLastSync(group);
        }
        if (skippedCalendars.size) {
            let errorMessage = lang.get("iCalSync_error") + (longErrorMessage ? "\n\n" : "");
            for (const [group, details] of skippedCalendars.entries()) {
                if (longErrorMessage)
                    errorMessage += `${details.calendarName} - ${details.error.message}\n`;
                this.deviceConfig.updateLastSync(group, "Failed" /* SyncStatus.Failed */);
            }
            throw new Error(errorMessage);
        }
    }
    eventHasSameFields(a, b) {
        return (a.startTime.valueOf() === b.startTime.valueOf() &&
            a.endTime.valueOf() === b.endTime.valueOf() &&
            deepEqual({ ...a.attendees }, { ...b.attendees }) &&
            a.summary === b.summary &&
            a.sequence === b.sequence &&
            a.location === b.location &&
            a.description === b.description &&
            deepEqual(a.organizer, b.organizer) &&
            deepEqual(a.repeatRule, b.repeatRule) &&
            a.recurrenceId?.valueOf() === b.recurrenceId?.valueOf());
    }
    async loadOrCreateCalendarInfo(progressMonitor) {
        const { findFirstPrivateCalendar } = await import("../../../common/calendar/date/CalendarUtils.js");
        const calendarInfos = await this.loadCalendarInfos(progressMonitor);
        if (!this.logins.isInternalUserLoggedIn() || findFirstPrivateCalendar(calendarInfos)) {
            return calendarInfos;
        }
        else {
            await this.createCalendar("", null, [], null);
            return await this.loadCalendarInfos(progressMonitor);
        }
    }
    async createCalendar(name, color, alarms, sourceUrl) {
        // when a calendar group is added, a group membership is added to the user. we might miss this websocket event
        // during startup if the websocket is not connected fast enough. Therefore, we explicitly update the user
        // this should be removed once we handle missed events during startup
        const { user, group } = await this.calendarFacade.addCalendar(name);
        this.logins.getUserController().user = user;
        const serializedAlarms = alarms.map((alarm) => createDefaultAlarmInfo({ trigger: serializeAlarmInterval(alarm) }));
        if (color != null) {
            const { userSettingsGroupRoot } = this.logins.getUserController();
            const newGroupSettings = createGroupSettings({
                group: group._id,
                color: color,
                name: null,
                defaultAlarmsList: serializedAlarms,
                sourceUrl,
            });
            userSettingsGroupRoot.groupSettings.push(newGroupSettings);
            await this.entityClient.update(userSettingsGroupRoot);
        }
        return group;
    }
    async doCreate(event, zone, groupRoot, alarmInfos, existingEvent) {
        // If the event was copied it might still carry some fields for re-encryption. We can't reuse them.
        removeTechnicalFields(event);
        const { assignEventId } = await import("../../../common/calendar/date/CalendarUtils");
        // if values of the existing events have changed that influence the alarm time then delete the old event and create a new
        // one.
        assignEventId(event, zone, groupRoot);
        // Reset ownerEncSessionKey because it cannot be set for new entity, it will be assigned by the CryptoFacade
        event._ownerEncSessionKey = null;
        if (event.repeatRule != null) {
            event.repeatRule.excludedDates = event.repeatRule.excludedDates.map(({ date }) => createDateWrapper({ date }));
        }
        // Reset permissions because server will assign them
        downcast(event)._permissions = null;
        event._ownerGroup = groupRoot._id;
        return await this.calendarFacade.saveCalendarEvent(event, alarmInfos, existingEvent ?? null);
    }
    async deleteEvent(event) {
        return await this.entityClient.erase(event);
    }
    /**
     * get the "primary" event of a series - the one that contains the repeat rule and is not a repeated or a rescheduled instance.
     *
     * note about recurrenceId in event series https://stackoverflow.com/questions/11456406/recurrence-id-in-icalendar-rfc-5545
     */
    async resolveCalendarEventProgenitor({ uid }) {
        return (await this.getEventsByUid(assertNotNull(uid, "could not resolve progenitor: no uid")))?.progenitor ?? null;
    }
    async loadAndProcessCalendarUpdates() {
        const { mailboxGroupRoot } = await this.mailboxModel.getUserMailboxDetails();
        const { calendarEventUpdates } = mailboxGroupRoot;
        if (calendarEventUpdates == null)
            return;
        const invites = await this.entityClient.loadAll(CalendarEventUpdateTypeRef, calendarEventUpdates.list);
        for (const invite of invites) {
            await this.handleCalendarEventUpdate(invite);
        }
    }
    /**
     * Get calendar infos, creating a new calendar info if none exist
     * Not async because we want to return the result directly if it is available when called
     * otherwise we return a promise
     */
    getCalendarInfosCreateIfNeeded() {
        if (this.calendarInfos.isLoaded() && this.calendarInfos.getLoaded().size > 0) {
            return this.calendarInfos.getLoaded();
        }
        return Promise.resolve().then(async () => {
            const calendars = await this.calendarInfos.getAsync();
            if (calendars.size > 0) {
                return calendars;
            }
            else {
                await this.createCalendar("", null, [], null);
                return this.calendarInfos.reload();
            }
        });
    }
    async getCalendarDataForUpdate(fileId) {
        try {
            // We are not supposed to load files without the key provider, but we hope that the key
            // was already resolved and the entity updated.
            const file = await this.entityClient.load(FileTypeRef, fileId);
            const dataFile = await this.fileController.getAsDataFile(file);
            const { parseCalendarFile } = await import("../../../common/calendar/import/CalendarImporter.js");
            return await parseCalendarFile(dataFile);
        }
        catch (e) {
            if (e instanceof SessionKeyNotFoundError) {
                // owner enc session key not updated yet - see NoOwnerEncSessionKeyForCalendarEventError's comment
                throw new NoOwnerEncSessionKeyForCalendarEventError("no owner enc session key found on the calendar data's file");
            }
            if (e instanceof ParserError || e instanceof NotFoundError) {
                console.warn(TAG, "could not get calendar update data", e);
                return null;
            }
            throw e;
        }
    }
    async handleCalendarEventUpdate(update) {
        // we want to delete the CalendarEventUpdate after we are done, even, in some cases, if something went wrong.
        try {
            const parsedCalendarData = await this.getCalendarDataForUpdate(update.file);
            if (parsedCalendarData != null) {
                await this.processCalendarData(update.sender, parsedCalendarData);
            }
        }
        catch (e) {
            if (e instanceof NotAuthorizedError) {
                // we might be authorized in the near future if some permission is delayed, unlikely to be permanent.
                console.warn(TAG, "could not process calendar update: not authorized", e);
                return;
            }
            else if (e instanceof PreconditionFailedError) {
                // unclear where precon would be thrown, probably in the blob store?
                console.warn(TAG, "could not process calendar update: precondition failed", e);
                return;
            }
            else if (e instanceof LockedError) {
                // we can try again after the lock is released
                console.warn(TAG, "could not process calendar update: locked", e);
                return;
            }
            else if (e instanceof NotFoundError) {
                // either the updated event(s) or the file data could not be found,
                // so we should try to delete since the update itself is obsolete.
                console.warn(TAG, "could not process calendar update: not found", e);
            }
            else if (e instanceof NoOwnerEncSessionKeyForCalendarEventError) {
                // we will get an update with the mail and sk soon, then we'll be able to finish this.
                // we will re-enter this function and erase it then.
                this.fileIdToSkippedCalendarEventUpdates.set(elementIdPart(update.file), update);
                console.warn(TAG, `could not process calendar update: ${e.message}`, e);
                return;
            }
            else {
                // unknown error that may lead to permanently stuck update if not cleared
                // this includes CryptoErrors due to #5753 that we want to still monitor
                // but now they only occur once
                console.warn(TAG, "could not process calendar update:", e);
                await this.eraseUpdate(update);
                throw e;
            }
        }
        await this.eraseUpdate(update);
    }
    /**
     * try to delete a calendar update from the server, ignoring errors
     * @param update the update to erase
     * @private
     */
    async eraseUpdate(update) {
        try {
            await this.entityClient.erase(update);
        }
        catch (e) {
            console.log(TAG, "failed to delete update:", e.name);
        }
    }
    /** whether the operation could be performed or not */
    async deleteEventsByUid(uid) {
        const entry = await this.calendarFacade.getEventsByUid(uid);
        if (entry == null) {
            console.log("could not find an uid index entry to delete event");
            return;
        }
        // not doing this in parallel because we would get locked errors
        for (const e of entry.alteredInstances) {
            await this.deleteEvent(e);
        }
        if (entry.progenitor) {
            await this.deleteEvent(entry.progenitor);
        }
    }
    /** process a calendar update retrieved from the server automatically. will not apply updates to event series that do not
     *  exist on the server yet (that's being done by calling processCalendarEventMessage manually)
     * public for testing */
    async processCalendarData(sender, calendarData) {
        if (calendarData.contents.length === 0) {
            console.log(TAG, `Calendar update with no events, ignoring`);
            return;
        }
        if (calendarData.contents[0].event.uid == null) {
            console.log(TAG, "invalid event update without UID, ignoring.");
            return;
        }
        // we can have multiple cases here:
        // 1. calendarData has one event and it's the progenitor
        // 2. calendarData has one event and it's an altered occurrence
        // 3. it's both (thunderbird sends ical files with multiple events)
        // Load the events bypassing the cache because we might have already processed some updates and they might have changed the events we are about to load.
        // We want to operate on the latest events only, otherwise we might lose some data.
        const dbEvents = await this.calendarFacade.getEventsByUid(calendarData.contents[0].event.uid, 1 /* CachingMode.Bypass */);
        if (dbEvents == null) {
            // if we ever want to display event invites in the calendar before accepting them,
            // we probably need to do something else here.
            console.log(TAG, "received event update for event that has not been saved to the server, ignoring.");
            return;
        }
        const method = calendarData.method;
        for (const content of calendarData.contents) {
            const updateAlarms = content.alarms;
            const updateEvent = content.event;
            // this automatically applies REQUESTs for creating parts of the existing event series that do not exist yet
            // like accepting another altered instance invite or accepting the progenitor after accepting only an altered instance.
            await this.processCalendarEventMessage(sender, method, updateEvent, updateAlarms, dbEvents);
        }
    }
    /**
     * Processing calendar update - bring events in calendar up-to-date with ical data sent via email.
     * calendar data are currently processed for
     * - REQUEST: here we have two cases:
     *     - there is an existing event: we apply the update to that event and do the necessary changes to the other parts of the series that may already exist
     *     - there is no existing event: create the event as received, and do the necessary changes to the other parts of the series that may already exist
     * - REPLY: update attendee status,
     * - CANCEL: we delete existing event instance
     *
     * @param sender
     * @param method
     * @param updateEvent the actual instance that needs to be updated
     * @param updateAlarms
     * @param target either the existing event to update or the calendar group Id to create the event in in case of a new event.
     */
    async processCalendarEventMessage(sender, method, updateEvent, updateAlarms, target) {
        const updateEventTime = updateEvent.recurrenceId?.getTime();
        const targetDbEvent = updateEventTime == null ? target.progenitor : target.alteredInstances.find((e) => e.recurrenceId.getTime() === updateEventTime);
        if (targetDbEvent == null) {
            if (method === CalendarMethod.REQUEST) {
                // we got a REQUEST for which we do not have a saved version of the particular instance (progenitor or altered)
                // it may be
                // - a single-instance update that created this altered instance
                // - the user got the progenitor invite for a series. it's possible that there's
                //   already altered instances of this series on the server.
                return await this.processCalendarAccept(target, updateEvent, updateAlarms);
            }
            else if (target.progenitor?.repeatRule != null && updateEvent.recurrenceId != null && method === CalendarMethod.CANCEL) {
                // some calendaring apps send a cancellation for an altered instance with a RECURRENCE-ID when
                // users delete a single instance from a series even though that instance was never published as altered.
                // we can just add the exclusion to the progenitor. this would be another argument for marking
                // altered-instance-exclusions in some way distinct from "normal" exclusions
                target.alteredInstances.push(updateEvent);
                // this will now modify the progenitor to have the required exclusions
                return await this.processCalendarUpdate(target, target.progenitor, target.progenitor);
            }
            else {
                console.log(TAG, `got something that's not a REQUEST for nonexistent server event on uid:`, method);
                return;
            }
        }
        const sentByOrganizer = targetDbEvent.organizer != null && targetDbEvent.organizer.address === sender;
        if (method === CalendarMethod.REPLY) {
            return this.processCalendarReply(sender, targetDbEvent, updateEvent);
        }
        else if (sentByOrganizer && method === CalendarMethod.REQUEST) {
            return await this.processCalendarUpdate(target, targetDbEvent, updateEvent);
        }
        else if (sentByOrganizer && method === CalendarMethod.CANCEL) {
            return await this.processCalendarCancellation(targetDbEvent);
        }
        else {
            console.log(TAG, `${method} update sent not by organizer, ignoring.`);
        }
    }
    /** process either a request for an existing progenitor or an existing altered instance.
     * @param dbTarget the uid entry containing the other events that are known to us that belong to this event series.
     * @param dbEvent the version of updateEvent stored on the server. must be identical to dbTarget.progenitor or one of dbTarget.alteredInstances
     * @param updateEvent the event that contains the new version of dbEvent. */
    async processCalendarUpdate(dbTarget, dbEvent, updateEvent) {
        console.log(TAG, "processing request for existing event instance");
        const { repeatRuleWithExcludedAlteredInstances } = await import("../gui/eventeditor-model/CalendarEventWhenModel.js");
        // some providers do not increment the sequence for all edit operations (like google when changing the summary)
        // we'd rather apply the same update too often than miss some, and this enables us to update our own status easily
        // without having to increment the sequence.
        if (filterInt(dbEvent.sequence) > filterInt(updateEvent.sequence)) {
            console.log(TAG, "got update for outdated event version, ignoring.");
            return;
        }
        if (updateEvent.recurrenceId == null && updateEvent.repeatRule != null) {
            // the update is for a repeating progenitor. we need to exclude all known altered instances from its repeat rule.
            updateEvent.repeatRule = repeatRuleWithExcludedAlteredInstances(updateEvent, dbTarget.alteredInstances.map((r) => r.recurrenceId), this.zone);
        }
        // If the update is for the altered occurrence, we do not need to update the progenitor, it already has the exclusion.
        // If we get into this function we already have the altered occurrence in db.
        // write the progenitor back to the uid index entry so that the subsequent updates from the same file get the updated instance
        dbTarget.progenitor = (await this.updateEventWithExternal(dbEvent, updateEvent));
    }
    /**
     * do not call this for anything but a REQUEST
     * @param dbTarget the progenitor that must have a repeat rule and an exclusion for this event to be accepted, the known altered instances and the ownergroup.
     * @param updateEvent the event to create
     * @param alarms alarms to set up for this user/event
     */
    async processCalendarAccept(dbTarget, updateEvent, alarms) {
        console.log(TAG, "processing new instance request");
        const { repeatRuleWithExcludedAlteredInstances } = await import("../gui/eventeditor-model/CalendarEventWhenModel.js");
        if (updateEvent.recurrenceId != null && dbTarget.progenitor != null && dbTarget.progenitor.repeatRule != null) {
            // request for a new altered instance. we'll try adding the exclusion for this instance to the progenitor if possible
            // since not all calendar apps add altered instances to the list of exclusions.
            const updatedProgenitor = clone(dbTarget.progenitor);
            updatedProgenitor.repeatRule = repeatRuleWithExcludedAlteredInstances(updatedProgenitor, [updateEvent.recurrenceId], this.zone);
            dbTarget.progenitor = (await this.doUpdateEvent(dbTarget.progenitor, updatedProgenitor));
        }
        else if (updateEvent.recurrenceId == null && updateEvent.repeatRule != null && dbTarget.alteredInstances.length > 0) {
            // request to add the progenitor to the calendar. we have to exclude all altered instances that are known to us from it.
            updateEvent.repeatRule = repeatRuleWithExcludedAlteredInstances(updateEvent, dbTarget.alteredInstances.map((r) => r.recurrenceId), this.zone);
        }
        let calendarGroupRoot;
        try {
            calendarGroupRoot = await this.entityClient.load(CalendarGroupRootTypeRef, dbTarget.ownerGroup);
        }
        catch (e) {
            if (!(e instanceof NotFoundError) && !(e instanceof NotAuthorizedError))
                throw e;
            console.log(TAG, "tried to create new progenitor or got new altered instance for progenitor in nonexistent/inaccessible calendar, ignoring");
            return;
        }
        return await this.doCreate(updateEvent, "", calendarGroupRoot, alarms);
    }
    /** Someone replied whether they attend an event or not. this MUST be applied to all instances in our
     * model since we keep attendee lists in sync for now. */
    async processCalendarReply(sender, dbEvent, updateEvent) {
        console.log("processing calendar reply");
        // first check if the sender of the email is in the attendee list
        const replyAttendee = findAttendeeInAddresses(updateEvent.attendees, [sender]);
        if (replyAttendee == null) {
            console.log(TAG, "Sender is not among attendees, ignoring", replyAttendee);
            return;
        }
        const newEvent = clone(dbEvent);
        // check if the attendee is still in the attendee list of the latest event
        const dbAttendee = findAttendeeInAddresses(newEvent.attendees, [replyAttendee.address.address]);
        if (dbAttendee == null) {
            console.log(TAG, "attendee was not found", dbEvent._id, replyAttendee);
            return;
        }
        dbAttendee.status = replyAttendee.status;
        await this.doUpdateEvent(dbEvent, newEvent);
    }
    /** handle an event cancellation - either the whole series (progenitor got cancelled)
     * or the altered occurrence. */
    async processCalendarCancellation(dbEvent) {
        console.log(TAG, "processing cancellation");
        // not having UID is technically an error, but we'll do our best (the event came from the server after all)
        if (dbEvent.recurrenceId == null && dbEvent.uid != null) {
            return await this.deleteEventsByUid(dbEvent.uid);
        }
        else {
            // either this has a recurrenceId and we only delete that instance
            // or we don't have a uid to get all instances.
            return await this.entityClient.erase(dbEvent);
        }
    }
    /**
     * Update {@param dbEvent} stored on the server with {@param icsEvent} from the ics file.
     */
    async updateEventWithExternal(dbEvent, icsEvent) {
        const newEvent = clone(dbEvent);
        newEvent.startTime = icsEvent.startTime;
        newEvent.endTime = icsEvent.endTime;
        newEvent.attendees = icsEvent.attendees;
        newEvent.summary = icsEvent.summary;
        newEvent.sequence = icsEvent.sequence;
        newEvent.location = icsEvent.location;
        newEvent.description = icsEvent.description;
        newEvent.organizer = icsEvent.organizer;
        newEvent.repeatRule = icsEvent.repeatRule;
        newEvent.recurrenceId = icsEvent.recurrenceId;
        return await this.doUpdateEvent(dbEvent, newEvent);
    }
    async doUpdateEvent(dbEvent, newEvent) {
        const [alarms, groupRoot] = await Promise.all([
            this.loadAlarms(dbEvent.alarmInfos, this.logins.getUserController().user),
            this.entityClient.load(CalendarGroupRootTypeRef, assertNotNull(dbEvent._ownerGroup)),
        ]);
        const alarmInfos = alarms.map((a) => a.alarmInfo);
        return await this.updateEvent(newEvent, alarmInfos, "", groupRoot, dbEvent);
    }
    async init() {
        await this.scheduleAlarmsLocally();
        await this.loadAndProcessCalendarUpdates();
    }
    async scheduleAlarmsLocally() {
        if (!this.localAlarmsEnabled())
            return;
        const pushIdentifier = this.pushService?.getLoadedPushIdentifier();
        if (pushIdentifier && pushIdentifier.disabled) {
            return console.log("Push identifier disabled. Skipping alarm schedule");
        }
        const eventsWithInfos = await this.calendarFacade.loadAlarmEvents();
        const scheduler = await this.alarmScheduler();
        for (let { event, userAlarmInfos } of eventsWithInfos) {
            for (let userAlarmInfo of userAlarmInfos) {
                this.scheduleUserAlarmInfo(event, userAlarmInfo, scheduler);
            }
        }
    }
    async loadAlarms(alarmInfos, user) {
        const { alarmInfoList } = user;
        if (alarmInfoList == null) {
            return [];
        }
        const ids = alarmInfos.filter((alarmInfoId) => isSameId(listIdPart(alarmInfoId), alarmInfoList.alarms));
        if (ids.length === 0) {
            return [];
        }
        return this.entityClient.loadMultiple(UserAlarmInfoTypeRef, listIdPart(ids[0]), ids.map(elementIdPart));
    }
    async deleteCalendar(calendar) {
        await this.calendarFacade.deleteCalendar(calendar.groupRoot._id);
        this.deviceConfig.removeLastSync(calendar.group._id);
    }
    async getEventsByUid(uid) {
        return this.calendarFacade.getEventsByUid(uid);
    }
    async entityEventsReceived(updates, eventOwnerGroupId) {
        const calendarInfos = await this.calendarInfos.getAsync();
        // We iterate over the alarms twice: once to collect them and to set the counter correctly and the second time to actually process them.
        const alarmEventsToProcess = [];
        for (const entityEventData of updates) {
            // apps handle alarms natively. this code is a candidate to move into
            // a generic web/native alarm handler
            if (isUpdateForTypeRef(UserAlarmInfoTypeRef, entityEventData) && !isApp()) {
                if (entityEventData.operation === "0" /* OperationType.CREATE */) {
                    // Updates for UserAlarmInfo and CalendarEvent come in a
                    // separate batches and there's a race between loading of the
                    // UserAlarmInfo and creation of the event.
                    // We try to load UserAlarmInfo. Then we wait until the
                    // CalendarEvent is there (which might already be true)
                    // and load it.
                    // All alarms for the same event come in the same batch so
                    try {
                        const userAlarmInfo = await this.entityClient.load(UserAlarmInfoTypeRef, [entityEventData.instanceListId, entityEventData.instanceId]);
                        alarmEventsToProcess.push(userAlarmInfo);
                        const deferredEvent = this.getPendingAlarmRequest(userAlarmInfo.alarmInfo.calendarRef.elementId);
                        deferredEvent.pendingAlarmCounter++;
                    }
                    catch (e) {
                        if (e instanceof NotFoundError) {
                            console.log(TAG, e, "Event or alarm were not found: ", entityEventData, e);
                        }
                        else {
                            throw e;
                        }
                    }
                }
                else if (entityEventData.operation === "2" /* OperationType.DELETE */ && !isApp()) {
                    await this.cancelUserAlarmInfo(entityEventData.instanceId);
                }
            }
            else if (isUpdateForTypeRef(CalendarEventTypeRef, entityEventData)) {
                if (entityEventData.operation === "0" /* OperationType.CREATE */ || entityEventData.operation === "1" /* OperationType.UPDATE */) {
                    const deferredEvent = this.getPendingAlarmRequest(entityEventData.instanceId);
                    deferredEvent.deferred.resolve(undefined);
                }
            }
            else if (isUpdateForTypeRef(CalendarEventUpdateTypeRef, entityEventData) && entityEventData.operation === "0" /* OperationType.CREATE */) {
                try {
                    const invite = await this.entityClient.load(CalendarEventUpdateTypeRef, [entityEventData.instanceListId, entityEventData.instanceId]);
                    await this.handleCalendarEventUpdate(invite);
                }
                catch (e) {
                    if (e instanceof NotFoundError) {
                        console.log(TAG, "invite not found", [entityEventData.instanceListId, entityEventData.instanceId], e);
                    }
                    else {
                        throw e;
                    }
                }
            }
            else if (isUpdateForTypeRef(FileTypeRef, entityEventData)) {
                // with a file update, the owner enc session key should be present now so we can try to process any skipped calendar event updates
                // (see NoOwnerEncSessionKeyForCalendarEventError's comment)
                const skippedCalendarEventUpdate = this.fileIdToSkippedCalendarEventUpdates.get(entityEventData.instanceId);
                if (skippedCalendarEventUpdate) {
                    try {
                        await this.handleCalendarEventUpdate(skippedCalendarEventUpdate);
                    }
                    catch (e) {
                        if (e instanceof NotFoundError) {
                            console.log(TAG, "invite not found", [entityEventData.instanceListId, entityEventData.instanceId], e);
                        }
                        else {
                            throw e;
                        }
                    }
                    finally {
                        this.fileIdToSkippedCalendarEventUpdates.delete(entityEventData.instanceId);
                    }
                }
            }
            else if (this.logins.getUserController().isUpdateForLoggedInUserInstance(entityEventData, eventOwnerGroupId)) {
                const calendarMemberships = this.logins.getUserController().getCalendarMemberships();
                const oldGroupIds = new Set(calendarInfos.keys());
                const newGroupIds = new Set(calendarMemberships.map((m) => m.group));
                const diff = symmetricDifference(oldGroupIds, newGroupIds);
                if (diff.size !== 0) {
                    this.calendarInfos.reload();
                }
            }
            else if (isUpdateForTypeRef(GroupInfoTypeRef, entityEventData)) {
                // the batch does not belong to that group so we need to find if we actually care about the related GroupInfo
                for (const { groupInfo } of calendarInfos.values()) {
                    if (isUpdateFor(groupInfo, entityEventData)) {
                        this.calendarInfos.reload();
                        break;
                    }
                }
            }
        }
        if (!isApp()) {
            const pushIdentifier = this.pushService?.getLoadedPushIdentifier();
            if (pushIdentifier && pushIdentifier.disabled) {
                return console.log("Push identifier disabled. Skipping alarm schedule");
            }
        }
        // in the apps, this array is guaranteed to be empty.
        for (const userAlarmInfo of alarmEventsToProcess) {
            const { listId, elementId } = userAlarmInfo.alarmInfo.calendarRef;
            const deferredEvent = this.getPendingAlarmRequest(elementId);
            // Don't wait for the deferred event promise because it can lead to a deadlock.
            // Since issue #2264 we process event batches sequentially and the
            // deferred event can never be resolved until the calendar event update is received.
            deferredEvent.deferred.promise = deferredEvent.deferred.promise.then(async () => {
                deferredEvent.pendingAlarmCounter--;
                if (deferredEvent.pendingAlarmCounter === 0) {
                    this.pendingAlarmRequests.delete(elementId);
                }
                const calendarEvent = await this.entityClient.load(CalendarEventTypeRef, [listId, elementId]);
                const scheduler = await this.alarmScheduler();
                try {
                    this.scheduleUserAlarmInfo(calendarEvent, userAlarmInfo, scheduler);
                }
                catch (e) {
                    if (e instanceof NotFoundError) {
                        console.log(TAG, "event not found", [listId, elementId]);
                    }
                    else {
                        throw e;
                    }
                }
            });
        }
    }
    getPendingAlarmRequest(elementId) {
        return getFromMap(this.pendingAlarmRequests, elementId, () => ({ pendingAlarmCounter: 0, deferred: defer() }));
    }
    localAlarmsEnabled() {
        return !isApp() && !isDesktop() && this.logins.isInternalUserLoggedIn() && !this.logins.isEnabled(FeatureType.DisableCalendar);
    }
    scheduleUserAlarmInfo(event, userAlarmInfo, scheduler) {
        this.userAlarmToAlarmInfo.set(getElementId(userAlarmInfo), userAlarmInfo.alarmInfo.alarmIdentifier);
        scheduler.scheduleAlarm(event, userAlarmInfo.alarmInfo, event.repeatRule, (eventTime, summary) => {
            const { title, body } = formatNotificationForDisplay(eventTime, summary);
            this.notifications.showNotification("Calendar" /* NotificationType.Calendar */, title, {
                body,
            }, () => m.route.set("/calendar"));
        });
    }
    async cancelUserAlarmInfo(userAlarmInfoId) {
        const identifier = this.userAlarmToAlarmInfo.get(userAlarmInfoId);
        if (identifier) {
            const alarmScheduler = await this.alarmScheduler();
            alarmScheduler.cancelAlarm(identifier);
        }
    }
    // VisibleForTesting
    getFileIdToSkippedCalendarEventUpdates() {
        return this.fileIdToSkippedCalendarEventUpdates;
    }
    getBirthdayEventTitle(contactName) {
        return lang.get("birthdayEvent_title", {
            "{name}": contactName,
        });
    }
    getAgeString(age) {
        return lang.get("birthdayEventAge_title", { "{age}": age });
    }
}
/** return false when the given events (representing the new and old version of the same event) are both long events
 * or both short events, true otherwise */
async function didLongStateChange(newEvent, existingEvent, zone) {
    const { isLongEvent } = await import("../../../common/calendar/date/CalendarUtils.js");
    return isLongEvent(newEvent, zone) !== isLongEvent(existingEvent, zone);
}
/**
 * This is used due us receiving calendar events before updateOwnerEncSessionKey gets triggered, and thus we can't load calendar data attachments. This is
 * required due to our permission system and the fact that bucket keys are not immediately accessible from File, only Mail.
 *
 * This is a limitation that should be addressed in the future.
 */
class NoOwnerEncSessionKeyForCalendarEventError extends TutanotaError {
    constructor(message) {
        super("NoOwnerEncSessionKeyForCalendarEventError", message);
    }
}
/**
 * yield the given monitor one time and then switch to noOp monitors forever
 */
function* oneShotProgressMonitorGenerator(progressTracker, userController) {
    // load all calendars. if there is no calendar yet, create one
    // we load three instances per calendar / CalendarGroupRoot / GroupInfo / Group
    const workPerCalendar = 3;
    const totalWork = userController.getCalendarMemberships().length * workPerCalendar;
    // the first time we want a real progress monitor but any time we would reload we don't need it
    const realMonitorId = progressTracker.registerMonitorSync(totalWork);
    const realMonitor = assertNotNull(progressTracker.getMonitor(realMonitorId));
    yield realMonitor;
    while (true) {
        yield new NoopProgressMonitor();
    }
}
export function formatNotificationForDisplay(eventTime, summary) {
    let dateString;
    if (isSameDay(eventTime, new Date())) {
        dateString = formatTime(eventTime);
    }
    else {
        dateString = formatDateWithWeekdayAndTime(eventTime);
    }
    const body = `${dateString} ${summary}`;
    return { body, title: body };
}
async function loadAllEvents(groupRoot) {
    return Promise.all([
        locator.entityClient.loadAll(CalendarEventTypeRef, groupRoot.longEvents),
        locator.entityClient.loadAll(CalendarEventTypeRef, groupRoot.shortEvents),
    ]).then((results) => results.flat());
}
//# sourceMappingURL=CalendarModel.js.map