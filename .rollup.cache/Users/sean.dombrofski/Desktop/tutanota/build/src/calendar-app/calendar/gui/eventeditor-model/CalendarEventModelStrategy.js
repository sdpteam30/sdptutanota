import { assertEventValidity } from "../../model/CalendarModel.js";
import { assertNotNull, identity } from "@tutao/tutanota-utils";
import { generateUid } from "../../../../common/calendar/date/CalendarUtils.js";
import { assembleCalendarEventEditResult, assembleEditResultAndAssignFromExisting, assignEventIdentity, } from "./CalendarEventModel.js";
import { DateTime } from "luxon";
import { RecipientField } from "../../../../common/mailFunctionality/SharedMailUtils.js";
/** strategies to apply calendar operations with some common setup */
export class CalendarEventApplyStrategies {
    calendarModel;
    logins;
    notificationModel;
    lazyRecurrenceIds;
    showProgress;
    zone;
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
        const { newEvent, calendar, newAlarms, sendModels } = assembleEditResultAndAssignFromExisting(existingEvent, editModelsForProgenitor, 3 /* CalendarOperation.EditAll */);
        const { groupRoot } = calendar;
        await this.showProgress((async () => {
            const recurrenceIds = await this.lazyRecurrenceIds(uid);
            await this.notificationModel.send(newEvent, recurrenceIds, sendModels);
            await this.calendarModel.updateEvent(newEvent, newAlarms, this.zone, groupRoot, existingEvent);
            const invalidateAlteredInstances = newEvent.repeatRule && newEvent.repeatRule.excludedDates.length === 0;
            const newDuration = editModelsForProgenitor.whenModel.duration;
            const index = await this.calendarModel.getEventsByUid(uid);
            if (index == null)
                return;
            // note: if we ever allow editing guests separately, we need to update this to not use the
            // note: progenitor edit models since the guest list might be different from the instance
            // note: we're looking at.
            for (const occurrence of index.alteredInstances) {
                if (invalidateAlteredInstances) {
                    editModelsForProgenitor.whoModel.shouldSendUpdates = true;
                    const { sendModels } = assembleEditResultAndAssignFromExisting(occurrence, editModelsForProgenitor, 1 /* CalendarOperation.EditThis */);
                    // in cases where guests were removed and the start time/repeat rule changed, we might
                    // have both a cancel model (containing the removed recipients) and an update model (the rest)
                    // we're copying all of them to cancel if the altered instances were invalidated, since the
                    // update (and invite for that matter) is irrelevant for those instances.
                    for (const recipient of sendModels.cancelModel?.allRecipients() ?? []) {
                        sendModels.updateModel?.addRecipient(RecipientField.BCC, recipient);
                    }
                    sendModels.cancelModel = sendModels.updateModel;
                    sendModels.updateModel = null;
                    sendModels.inviteModel = null;
                    await this.notificationModel.send(occurrence, [], sendModels);
                    await this.calendarModel.deleteEvent(occurrence);
                }
                else {
                    const { newEvent, newAlarms, sendModels } = assembleEditResultAndAssignFromExisting(occurrence, editModelsForProgenitor, 1 /* CalendarOperation.EditThis */);
                    // we need to use the time we had before, not the time of the progenitor (which did not change since we still have altered occurrences)
                    newEvent.startTime = occurrence.startTime;
                    newEvent.endTime = DateTime.fromJSDate(newEvent.startTime, { zone: this.zone }).plus(newDuration).toJSDate();
                    // altered instances never have a repeat rule
                    newEvent.repeatRule = null;
                    await this.notificationModel.send(newEvent, [], sendModels);
                    await this.calendarModel.updateEvent(newEvent, newAlarms, this.zone, groupRoot, occurrence);
                }
            }
        })());
    }
    async saveNewAlteredInstance({ editModels, editModelsForProgenitor, existingInstance, progenitor, }) {
        await this.showProgress((async () => {
            // NEW: edit models that we used so far are for the new event (rescheduled one). this should be an invite.
            const { newEvent, calendar, newAlarms, sendModels } = assembleEditResultAndAssignFromExisting(existingInstance, editModels, 1 /* CalendarOperation.EditThis */);
            await this.notificationModel.send(newEvent, [], sendModels);
            // OLD: but we need to update the existing one as well, to add an exclusion for the original instance that we edited.
            editModelsForProgenitor.whoModel.shouldSendUpdates = true;
            editModelsForProgenitor.whenModel.excludeDate(existingInstance.startTime);
            const { newEvent: newProgenitor, sendModels: progenitorSendModels, newAlarms: progenitorAlarms, } = assembleEditResultAndAssignFromExisting(progenitor, editModelsForProgenitor, 3 /* CalendarOperation.EditAll */);
            const recurrenceIds = await this.lazyRecurrenceIds(progenitor.uid);
            recurrenceIds.push(existingInstance.startTime);
            await this.notificationModel.send(newProgenitor, recurrenceIds, progenitorSendModels);
            await this.calendarModel.updateEvent(newProgenitor, progenitorAlarms, this.zone, calendar.groupRoot, progenitor);
            // NEW
            const { groupRoot } = calendar;
            await this.calendarModel.createEvent(newEvent, newAlarms, this.zone, groupRoot);
        })());
    }
    async saveExistingAlteredInstance(editModels, existingInstance) {
        const { newEvent, calendar, newAlarms, sendModels } = assembleEditResultAndAssignFromExisting(existingInstance, editModels, 1 /* CalendarOperation.EditThis */);
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
            if (alteredOccurrences) {
                for (const occurrence of alteredOccurrences.alteredInstances) {
                    if (occurrence.attendees.length === 0)
                        continue;
                    const { sendModels } = assembleEditResultAndAssignFromExisting(occurrence, editModels, 4 /* CalendarOperation.DeleteAll */);
                    sendModels.cancelModel = sendModels.updateModel;
                    sendModels.updateModel = null;
                    await this.notificationModel.send(occurrence, [], sendModels);
                }
            }
            sendModels.cancelModel = sendModels.updateModel;
            sendModels.updateModel = null;
            await this.notificationModel.send(existingEvent, [], sendModels);
            if (existingEvent.uid != null) {
                await this.calendarModel.deleteEventsByUid(existingEvent.uid);
            }
            // doing this explicitly because we might have clicked an event that's not listed in
            // the uid index for some reason. this prevents bugs from creating undeletable events.
            await this.calendarModel.deleteEvent(existingEvent);
        })());
    }
    /** add an exclusion to the progenitor and send an update. */
    async excludeSingleInstance(editModelsForProgenitor, existingInstance, progenitor) {
        await this.showProgress((async () => {
            editModelsForProgenitor.whoModel.shouldSendUpdates = true;
            editModelsForProgenitor.whenModel.excludeDate(existingInstance.startTime);
            const { newEvent, sendModels, calendar, newAlarms } = assembleEditResultAndAssignFromExisting(progenitor, editModelsForProgenitor, 2 /* CalendarOperation.DeleteThis */);
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
}
//# sourceMappingURL=CalendarEventModelStrategy.js.map