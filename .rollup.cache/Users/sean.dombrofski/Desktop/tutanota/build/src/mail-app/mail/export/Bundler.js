import { FileTypeRef } from "../../../common/api/entities/tutanota/TypeRefs.js";
import { getLetId } from "../../../common/api/common/utils/EntityUtils";
import { promiseMap } from "@tutao/tutanota-utils";
import { getDisplayedSender, getMailBodyText } from "../../../common/api/common/CommonMailUtils.js";
import { loadMailDetails } from "../view/MailViewerUtils.js";
export function makeMailBundle(sanitizer, mail, mailDetails, attachments) {
    const recipientMapper = ({ address, name }) => ({ address, name });
    const body = sanitizer.sanitizeHTML(getMailBodyText(mailDetails.body), {
        blockExternalContent: false,
        allowRelativeLinks: false,
        usePlaceholderForInlineImages: false,
    }).html;
    return {
        mailId: getLetId(mail),
        subject: mail.subject,
        body,
        sender: recipientMapper(getDisplayedSender(mail)),
        to: mailDetails.recipients.toRecipients.map(recipientMapper),
        cc: mailDetails.recipients.ccRecipients.map(recipientMapper),
        bcc: mailDetails.recipients.bccRecipients.map(recipientMapper),
        replyTo: mailDetails.replyTos.map(recipientMapper),
        isDraft: mail.state === "0" /* MailState.DRAFT */,
        isRead: !mail.unread,
        sentOn: mailDetails.sentDate.getTime(),
        receivedOn: mail.receivedDate.getTime(),
        headers: mailDetails.headers?.compressedHeaders ?? mailDetails.headers?.headers ?? null,
        attachments,
    };
}
/**
 * Downloads the mail body and the attachments for an email, to prepare for exporting
 */
export async function downloadMailBundle(mail, mailFacade, entityClient, fileController, sanitizer, cryptoFacade) {
    const mailDetails = await loadMailDetails(mailFacade, mail);
    const files = await promiseMap(mail.attachments, async (fileId) => await entityClient.load(FileTypeRef, fileId));
    const attachments = await promiseMap(await cryptoFacade.enforceSessionKeyUpdateIfNeeded(mail, files), async (file) => await fileController.getAsDataFile(file));
    return makeMailBundle(sanitizer, mail, mailDetails, attachments);
}
//# sourceMappingURL=Bundler.js.map