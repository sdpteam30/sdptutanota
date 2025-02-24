import { lang } from "../../../common/misc/LanguageViewModel.js";
import { makeInvitationCalendarFile } from "../export/CalendarExporter.js";
import { getAttendeeStatus, mailMethodToCalendarMethod } from "../../../common/api/common/TutanotaConstants.js";
import { getTimeZone } from "../../../common/calendar/date/CalendarUtils.js";
import { createCalendarEventAttendee } from "../../../common/api/entities/tutanota/TypeRefs.js";
import { assertNotNull, noOp, ofClass } from "@tutao/tutanota-utils";
import { windowFacade } from "../../../common/misc/WindowFacade.js";
import { RecipientsNotFoundError } from "../../../common/api/common/error/RecipientsNotFoundError.js";
import { cleanMailAddress, findAttendeeInAddresses, findRecipientWithAddress } from "../../../common/api/common/utils/CommonCalendarUtils.js";
import { ProgrammingError } from "../../../common/api/common/error/ProgrammingError.js";
import { calendarAttendeeStatusSymbol, formatEventDuration } from "../gui/CalendarGuiUtils.js";
import { RecipientField } from "../../../common/mailFunctionality/SharedMailUtils.js";
export class CalendarNotificationSender {
    /** Used for knowing how many emails are in the process of being sent. */
    countDownLatch;
    constructor() {
        this.countDownLatch = 0;
    }
    sendInvite(event, sendMailModel) {
        const message = lang.get("eventInviteMail_msg", {
            "{event}": event.summary,
        });
        const sender = assertOrganizer(event).address;
        return this.sendCalendarFile({
            sendMailModel,
            method: "2" /* MailMethod.ICAL_REQUEST */,
            subject: message,
            body: makeInviteEmailBody(sender, event, message),
            event,
            sender,
        });
    }
    sendUpdate(event, sendMailModel) {
        const message = lang.get("eventUpdated_msg", {
            "{event}": event.summary,
        });
        const sender = assertOrganizer(event).address;
        return this.sendCalendarFile({
            sendMailModel,
            method: "2" /* MailMethod.ICAL_REQUEST */,
            subject: message,
            body: makeInviteEmailBody(sender, event, message),
            event,
            sender,
        });
    }
    sendCancellation(event, sendMailModel) {
        const message = lang.get("eventCancelled_msg", {
            "{event}": event.summary,
        });
        const sender = assertOrganizer(event).address;
        return this.sendCalendarFile({
            sendMailModel,
            method: "5" /* MailMethod.ICAL_CANCEL */,
            subject: message,
            body: makeInviteEmailBody(sender, event, message),
            event,
            sender,
        }).catch(ofClass(RecipientsNotFoundError, (e) => {
            // we want to delete the event even if the recipient is not an existing tutanota address
            // and just exclude them from sending out updates but leave the event untouched for other recipients
            const invalidRecipients = e.message.split("\n");
            let hasRemovedRecipient = false;
            for (const invalidRecipient of invalidRecipients) {
                const recipientInfo = findRecipientWithAddress(sendMailModel.bccRecipients(), invalidRecipient);
                if (recipientInfo) {
                    hasRemovedRecipient = sendMailModel.removeRecipient(recipientInfo, RecipientField.BCC, false) || hasRemovedRecipient;
                }
            }
            // only try sending again if we successfully removed a recipient and there are still other recipients
            if (hasRemovedRecipient && sendMailModel.allRecipients().length) {
                return this.sendCancellation(event, sendMailModel);
            }
        }));
    }
    /**
     * send a response mail to the organizer of an event
     * @param event the event to respond to (included as a .ics file attachment)
     * @param sendMailModel used to actually send the mail
     */
    async sendResponse(event, sendMailModel) {
        const sendAs = sendMailModel.getSender();
        const message = lang.get("repliedToEventInvite_msg", {
            "{event}": event.summary,
        });
        const organizer = assertOrganizer(event);
        const body = makeInviteEmailBody(organizer.address, event, message);
        return this.sendCalendarFile({
            event,
            sendMailModel,
            method: "3" /* MailMethod.ICAL_REPLY */,
            subject: message,
            body: body,
            sender: sendAs,
        });
    }
    async sendCalendarFile({ sendMailModel, method, subject, event, body, sender, }) {
        const inviteFile = makeInvitationCalendarFile(event, mailMethodToCalendarMethod(method), new Date(), getTimeZone());
        sendMailModel.setSender(sender);
        sendMailModel.attachFiles([inviteFile]);
        sendMailModel.setSubject(subject);
        sendMailModel.setBody(body);
        this.sendStart();
        await sendMailModel.send(method).finally(() => this.sendEnd());
    }
    _windowUnsubscribe = null;
    sendStart() {
        this.countDownLatch++;
        if (this.countDownLatch === 1) {
            this._windowUnsubscribe = windowFacade.addWindowCloseListener(noOp);
        }
    }
    sendEnd() {
        this.countDownLatch--;
        if (this.countDownLatch === 0 && this._windowUnsubscribe) {
            this._windowUnsubscribe();
            this._windowUnsubscribe = null;
        }
    }
}
function summaryLine(event) {
    return newLine(lang.get("name_label"), event.summary);
}
function whenLine(event) {
    const duration = formatEventDuration(event, getTimeZone(), true);
    return newLine(lang.get("when_label"), duration);
}
function organizerLabel(organizer, a) {
    return cleanMailAddress(organizer.address) === cleanMailAddress(a.address.address) ? `(${lang.get("organizer_label")})` : "";
}
function newLine(label, content) {
    return `<div style="display: flex; margin-top: 8px"><div style="min-width: 120px"><b style="float:right; margin-right:16px">${label}:</b></div>${content}</div>`;
}
function attendeesLine(event) {
    const { organizer } = event;
    let attendees = "";
    // If organizer is already in the attendees, we don't have to add them separately.
    if (organizer && !findAttendeeInAddresses(event.attendees, [organizer.address])) {
        attendees = makeAttendee(organizer, createCalendarEventAttendee({
            address: organizer,
            status: "0",
        }));
    }
    attendees += event.attendees.map((a) => makeAttendee(assertNotNull(organizer), a)).join("\n");
    return newLine(lang.get("who_label"), `<div>${attendees}</div>`);
}
function makeAttendee(organizer, attendee) {
    return `<div>
${attendee.address.name || ""} ${attendee.address.address}
${organizerLabel(organizer, attendee)}
${calendarAttendeeStatusSymbol(getAttendeeStatus(attendee))}</div>`;
}
function locationLine(event) {
    return event.location ? newLine(lang.get("location_label"), event.location) : "";
}
function descriptionLine(event) {
    return event.description ? newLine(lang.get("description_label"), `<div>${event.description}</div>`) : "";
}
function makeInviteEmailBody(sender, event, message) {
    return `
	<div style="max-width: 685px; margin: 0 auto">
	  	<h2 style="text-align: center">${message}</h2>
  		<div style="margin: 0 auto">
  			${summaryLine(event)}
    		${whenLine(event)}
    		${locationLine(event)}
    		${attendeesLine(event)}
    		${descriptionLine(event)}
  		</div>
	</div>`;
}
function assertOrganizer(event) {
    if (event.organizer == null) {
        throw new ProgrammingError("Cannot send event update without organizer");
    }
    return event.organizer;
}
export const calendarNotificationSender = new CalendarNotificationSender();
//# sourceMappingURL=CalendarNotificationSender.js.map