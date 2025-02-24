import { parseCalendarFile } from "../../../common/calendar/import/CalendarImporter.js";
import { locator } from "../../../common/api/main/CommonLocator.js";
import { CalendarAttendeeStatus, CalendarMethod, FeatureType, getAsEnumValue } from "../../../common/api/common/TutanotaConstants.js";
import { assert, assertNotNull, clone, filterInt, noOp } from "@tutao/tutanota-utils";
import { findFirstPrivateCalendar } from "../../../common/calendar/date/CalendarUtils.js";
import { Dialog } from "../../../common/gui/base/Dialog.js";
import { UserError } from "../../../common/api/main/UserError.js";
import { findAttendeeInAddresses } from "../../../common/api/common/utils/CommonCalendarUtils.js";
import { CalendarNotificationModel } from "../gui/eventeditor-model/CalendarNotificationModel.js";
import { ResolveMode } from "../../../common/api/main/RecipientsModel.js";
import { isCustomizationEnabledForCustomer } from "../../../common/api/common/utils/CustomerUtils.js";
import { getEventType } from "../gui/CalendarGuiUtils.js";
import { RecipientField } from "../../../common/mailFunctionality/SharedMailUtils.js";
import { lang } from "../../../common/misc/LanguageViewModel.js";
async function getParsedEvent(fileData) {
    try {
        const { contents, method } = await parseCalendarFile(fileData);
        const uid = contents[0].event.uid;
        if (uid == null)
            return null;
        assert(!contents.some((c) => c.event.uid !== uid), "received invite with multiple events, but mismatched UIDs");
        return {
            events: contents.map((c) => c.event),
            uid,
            method: getAsEnumValue(CalendarMethod, method) || CalendarMethod.PUBLISH,
        };
    }
    catch (e) {
        console.log(e);
        return null;
    }
}
export async function showEventDetails(event, eventBubbleRect, mail) {
    const [latestEvent, { CalendarEventPopup }, { CalendarEventPreviewViewModel }, { htmlSanitizer }] = await Promise.all([
        getLatestEvent(event),
        import("../gui/eventpopup/CalendarEventPopup.js"),
        import("../gui/eventpopup/CalendarEventPreviewViewModel.js"),
        import("../../../common/misc/HtmlSanitizer.js"),
    ]);
    let eventType;
    let editModelsFactory;
    let hasBusinessFeature;
    let ownAttendee = null;
    const lazyIndexEntry = async () => (latestEvent.uid != null ? locator.calendarFacade.getEventsByUid(latestEvent.uid) : null);
    if (!locator.logins.getUserController().isInternalUser()) {
        // external users cannot delete/edit events as they have no calendar.
        eventType = "external" /* EventType.EXTERNAL */;
        editModelsFactory = () => new Promise(noOp);
        hasBusinessFeature = false;
    }
    else {
        const [calendarInfos, mailboxDetails, customer] = await Promise.all([
            (await locator.calendarModel()).getCalendarInfos(),
            locator.mailboxModel.getUserMailboxDetails(),
            locator.logins.getUserController().loadCustomer(),
        ]);
        const mailboxProperties = await locator.mailboxModel.getMailboxProperties(mailboxDetails.mailboxGroupRoot);
        const ownMailAddresses = mailboxProperties.mailAddressProperties.map(({ mailAddress }) => mailAddress);
        ownAttendee = findAttendeeInAddresses(latestEvent.attendees, ownMailAddresses);
        eventType = getEventType(latestEvent, calendarInfos, ownMailAddresses, locator.logins.getUserController());
        editModelsFactory = (mode) => locator.calendarEventModel(mode, latestEvent, mailboxDetails, mailboxProperties, mail);
        hasBusinessFeature =
            isCustomizationEnabledForCustomer(customer, FeatureType.BusinessFeatureEnabled) || (await locator.logins.getUserController().isNewPaidPlan());
    }
    const viewModel = new CalendarEventPreviewViewModel(latestEvent, await locator.calendarModel(), eventType, hasBusinessFeature, ownAttendee, lazyIndexEntry, editModelsFactory);
    new CalendarEventPopup(viewModel, eventBubbleRect, htmlSanitizer).show();
}
export async function getEventsFromFile(file, invitedConfidentially) {
    const dataFile = await locator.fileController.getAsDataFile(file);
    const contents = await getParsedEvent(dataFile);
    for (const event of contents?.events ?? []) {
        event.invitedConfidentially = invitedConfidentially;
    }
    return contents;
}
/**
 * Returns the latest version for the given event by uid and recurrenceId. If the event is not in
 * any calendar (because it has not been stored yet, e.g. in case of invite)
 * the given event is returned.
 */
export async function getLatestEvent(event) {
    const uid = event.uid;
    if (uid == null)
        return event;
    const existingEvents = await locator.calendarFacade.getEventsByUid(uid);
    // If the file we are opening is newer than the one which we have on the server, update server version.
    // Should not happen normally but can happen when e.g. reply and update were sent one after another before we accepted
    // the invite. Then accepting first invite and then opening update should give us updated version.
    const existingEvent = event.recurrenceId == null
        ? existingEvents?.progenitor // the progenitor does not have a recurrence id and is always first in uid index
        : existingEvents?.alteredInstances.find((e) => e.recurrenceId === event.recurrenceId);
    if (existingEvent == null)
        return event;
    if (filterInt(existingEvent.sequence) < filterInt(event.sequence)) {
        const calendarModel = await locator.calendarModel();
        return await calendarModel.updateEventWithExternal(existingEvent, event);
    }
    else {
        return existingEvent;
    }
}
export class CalendarInviteHandler {
    mailboxModel;
    calendarModel;
    logins;
    calendarNotificationSender;
    sendMailModelFactory;
    constructor(mailboxModel, calendarModel, logins, calendarNotificationSender, sendMailModelFactory) {
        this.mailboxModel = mailboxModel;
        this.calendarModel = calendarModel;
        this.logins = logins;
        this.calendarNotificationSender = calendarNotificationSender;
        this.sendMailModelFactory = sendMailModelFactory;
    }
    /**
     * Sends a quick reply for the given event and saves the event to the first private calendar.
     * @param event the CalendarEvent to respond to, will be serialized and sent back with updated status, then saved.
     * @param attendee the attendee that should respond to the mail
     * @param decision the new status of the attendee
     * @param previousMail the mail to respond to
     */
    async replyToEventInvitation(event, attendee, decision, previousMail, mailboxDetails) {
        const eventClone = clone(event);
        const foundAttendee = assertNotNull(findAttendeeInAddresses(eventClone.attendees, [attendee.address.address]), "attendee was not found in event clone");
        foundAttendee.status = decision;
        const notificationModel = new CalendarNotificationModel(this.calendarNotificationSender, this.logins);
        //NOTE: mailDetails are getting passed through because the calendar does not have access to the mail folder structure
        //	which is needed to find mailboxdetails by mail. This may be fixed by static mail ids which are being worked on currently.
        //  This function is only called by EventBanner from the mail app so this should be okay.
        const responseModel = await this.getResponseModelForMail(previousMail, mailboxDetails, attendee.address.address);
        try {
            await notificationModel.send(eventClone, [], { responseModel, inviteModel: null, cancelModel: null, updateModel: null });
        }
        catch (e) {
            if (e instanceof UserError) {
                await Dialog.message(lang.makeTranslation("confirm_msg", e.message));
                return 0 /* ReplyResult.ReplyNotSent */;
            }
            else {
                throw e;
            }
        }
        const calendars = await this.calendarModel.getCalendarInfos();
        const type = getEventType(event, calendars, [attendee.address.address], this.logins.getUserController());
        if (type === "shared_ro" /* EventType.SHARED_RO */ || type === "locked" /* EventType.LOCKED */) {
            // if the Event type is shared read only, the event will be updated by the response, trying to update the calendar here will result in error
            // since there is no write permission. (Same issue can happen with locked, no write permission)
            return 1 /* ReplyResult.ReplySent */;
        }
        const calendar = findFirstPrivateCalendar(calendars);
        if (calendar == null)
            return 0 /* ReplyResult.ReplyNotSent */;
        if (decision !== CalendarAttendeeStatus.DECLINED && eventClone.uid != null) {
            const dbEvents = await this.calendarModel.getEventsByUid(eventClone.uid);
            await this.calendarModel.processCalendarEventMessage(previousMail.sender.address, CalendarMethod.REQUEST, eventClone, [], dbEvents ?? { ownerGroup: calendar.group._id, progenitor: null, alteredInstances: [] });
        }
        return 1 /* ReplyResult.ReplySent */;
    }
    async getResponseModelForMail(previousMail, mailboxDetails, responder) {
        //NOTE: mailDetails are getting passed through because the calendar does not have access to the mail folder structure
        //	which is needed to find mailboxdetails by mail. This may be fixed by static mail ids which are being worked on currently
        const mailboxProperties = await this.mailboxModel.getMailboxProperties(mailboxDetails.mailboxGroupRoot);
        const model = await this.sendMailModelFactory(mailboxDetails, mailboxProperties);
        await model.initAsResponse({
            previousMail,
            conversationType: "1" /* ConversationType.REPLY */,
            senderMailAddress: responder,
            recipients: [],
            attachments: [],
            subject: "",
            bodyText: "",
            replyTos: [],
        }, new Map());
        await model.addRecipient(RecipientField.TO, previousMail.sender, ResolveMode.Eager);
        // Send confidential reply to confidential mails and the other way around.
        // If the contact is removed or the password is not there the user would see an error but they wouldn't be
        // able to reply anyway (unless they fix it).
        model.setConfidential(previousMail.confidential);
        return model;
    }
}
//# sourceMappingURL=CalendarInvites.js.map