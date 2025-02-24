import { calendarEventHasMoreThanOneOccurrencesLeft } from "../../../../common/calendar/date/CalendarUtils.js";
import { getNonOrganizerAttendees } from "../eventeditor-model/CalendarEventModel.js";
import { NotFoundError } from "../../../../common/api/common/error/RestError.js";
import { ProgrammingError } from "../../../../common/api/common/error/ProgrammingError.js";
import m from "mithril";
import { clone } from "@tutao/tutanota-utils";
import { EventEditorDialog } from "../eventeditor-view/CalendarEventEditDialog.js";
/**
 * makes decisions about which operations are available from the popup and knows how to implement them depending on the event's type.
 */
export class CalendarEventPreviewViewModel {
    calendarEvent;
    calendarModel;
    eventType;
    hasBusinessFeature;
    lazyIndexEntry;
    eventModelFactory;
    uiUpdateCallback;
    canEdit;
    canDelete;
    canSendUpdates;
    /** for editing, an event that has only one non-deleted instance is still considered repeating
     * because we might reschedule that instance and then unexclude some deleted instances.
     *
     * the ability to edit a single instance also depends on the event type:
     *    * OWN -> I can do what I want
     *    * SHARED_RW -> can edit single instance as if it was my own (since single instance editing locks attendees anyway)
     *    * SHARED_RO, LOCKED, EXTERNAL -> cannot edit at all
     *    * INVITE -> we're not the organizer, we can only set our own attendance globally and send it back to the organizer.
     *          probably the best reason to make single-instance attendee editing possible asap.
     */
    isRepeatingForEditing;
    sanitizedDescription = null;
    processing = false;
    _ownAttendee;
    /**
     *
     * @param calendarEvent the event to display in the popup
     * @param calendarModel the calendar model where the event can be updated/deleted
     * @param eventType
     * @param hasBusinessFeature if the current user is allowed to do certain operations.
     * @param ownAttendee will be cloned to have a copy that's not influencing the actual event but can be changed to quickly update the UI
     * @param lazyIndexEntry async function to resolve the progenitor of the shown event
     * @param eventModelFactory
     * @param uiUpdateCallback
     */
    constructor(calendarEvent, calendarModel, eventType, hasBusinessFeature, ownAttendee, lazyIndexEntry, eventModelFactory, uiUpdateCallback = m.redraw) {
        this.calendarEvent = calendarEvent;
        this.calendarModel = calendarModel;
        this.eventType = eventType;
        this.hasBusinessFeature = hasBusinessFeature;
        this.lazyIndexEntry = lazyIndexEntry;
        this.eventModelFactory = eventModelFactory;
        this.uiUpdateCallback = uiUpdateCallback;
        this._ownAttendee = clone(ownAttendee);
        if (this.calendarEvent._ownerGroup == null) {
            this.canEdit = false;
            this.canDelete = false;
            this.canSendUpdates = false;
        }
        else {
            // partially editable (adding alarms) counts as editable.
            this.canEdit =
                this.eventType === "own" /* EventType.OWN */ ||
                    this.eventType === "shared_rw" /* EventType.SHARED_RW */ ||
                    this.eventType === "locked" /* EventType.LOCKED */ ||
                    this.eventType === "invite" /* EventType.INVITE */;
            this.canDelete = this.canEdit || this.eventType === "invite" /* EventType.INVITE */;
            this.canSendUpdates = hasBusinessFeature && this.eventType === "own" /* EventType.OWN */ && getNonOrganizerAttendees(calendarEvent).length > 0;
        }
        this.isRepeatingForEditing =
            (calendarEvent.repeatRule != null || calendarEvent.recurrenceId != null) && (eventType === "own" /* EventType.OWN */ || eventType === "shared_rw" /* EventType.SHARED_RW */);
    }
    /** for deleting, an event that has only one non-deleted instance behaves as if it wasn't repeating
     * because deleting the last instance is the same as deleting the whole event from the pov of the user.
     */
    async isRepeatingForDeleting() {
        const index = await this.lazyIndexEntry();
        if (index == null)
            return false;
        return calendarEventHasMoreThanOneOccurrencesLeft(index);
    }
    get ownAttendee() {
        return this._ownAttendee;
    }
    /** return an object enabling us to set and display the participation correctly if this is an event we're invited to, null otherwise.
     * note that the Promise<unknown> type on setParticipation prevents us from leaking errors when consumers call it and try to catch errors without
     * awaiting it (they get an async call without await warning) */
    getParticipationSetterAndThen(action) {
        if (this.ownAttendee == null || this.eventType !== "invite" /* EventType.INVITE */)
            return null;
        return {
            ownAttendee: this.ownAttendee,
            setParticipation: async (status) => {
                await this.setOwnAttendance(status);
                action();
            },
        };
    }
    async setOwnAttendance(status) {
        if (this.calendarEvent.organizer == null || this.ownAttendee == null || this.processing || this._ownAttendee?.status === status)
            return;
        const oldStatus = this.ownAttendee.status;
        this.processing = true;
        try {
            this.ownAttendee.status = status;
            this.uiUpdateCallback();
            // no per-instance attendees yet.
            const model = await this.eventModelFactory(3 /* CalendarOperation.EditAll */);
            if (model) {
                model.editModels.whoModel.setOwnAttendance(status);
                model.editModels.whoModel.isConfidential = this.calendarEvent.invitedConfidentially ?? false;
                await model.apply();
            }
            else {
                this.ownAttendee.status = oldStatus;
            }
        }
        catch (e) {
            this.ownAttendee.status = oldStatus;
            throw e;
        }
        finally {
            this.processing = false;
        }
    }
    /** add an exclusion for this event instances start time on the original event.
     * if this is a rescheduled instance, we will just delete the event because the progenitor already
     * has an exclusion for this time.
     * */
    async deleteSingle() {
        try {
            const model = await this.eventModelFactory(2 /* CalendarOperation.DeleteThis */);
            await model?.apply();
        }
        catch (e) {
            if (!(e instanceof NotFoundError)) {
                throw e;
            }
        }
    }
    async deleteAll() {
        try {
            const model = await this.eventModelFactory(4 /* CalendarOperation.DeleteAll */);
            await model?.apply();
        }
        catch (e) {
            if (!(e instanceof NotFoundError)) {
                throw e;
            }
        }
    }
    async editSingle() {
        const model = await this.eventModelFactory(1 /* CalendarOperation.EditThis */);
        if (model == null) {
            return;
        }
        try {
            const eventEditor = new EventEditorDialog();
            return await eventEditor.showExistingCalendarEventEditDialog(model, {
                uid: this.calendarEvent.uid,
                sequence: this.calendarEvent.sequence,
                recurrenceId: this.calendarEvent.startTime,
            });
        }
        catch (err) {
            if (err instanceof NotFoundError) {
                console.log("occurrence not found when clicking on the event");
            }
            else {
                throw err;
            }
        }
        throw new ProgrammingError("not implemented");
    }
    async editAll() {
        const model = await this.eventModelFactory(3 /* CalendarOperation.EditAll */);
        if (model == null) {
            return;
        }
        try {
            const eventEditor = new EventEditorDialog();
            return await eventEditor.showExistingCalendarEventEditDialog(model, {
                uid: this.calendarEvent.uid,
                sequence: this.calendarEvent.sequence,
                recurrenceId: null,
            });
        }
        catch (err) {
            if (err instanceof NotFoundError) {
                console.log("calendar event not found when clicking on the event");
            }
            else {
                throw err;
            }
        }
    }
    async sendUpdates() {
        const model = await this.eventModelFactory(3 /* CalendarOperation.EditAll */);
        if (model == null) {
            return 1 /* EventSaveResult.Failed */;
        }
        try {
            model.editModels.whoModel.shouldSendUpdates = true;
            await model.apply();
            return 0 /* EventSaveResult.Saved */;
        }
        finally {
            model.editModels.whoModel.shouldSendUpdates = false;
        }
    }
    async sanitizeDescription() {
        const { htmlSanitizer } = await import("../../../../common/misc/HtmlSanitizer.js");
        this.sanitizedDescription = htmlSanitizer.sanitizeHTML(this.calendarEvent.description, {
            blockExternalContent: true,
        }).html;
    }
    getSanitizedDescription() {
        return this.sanitizedDescription;
    }
}
//# sourceMappingURL=CalendarEventPreviewViewModel.js.map