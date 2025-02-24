import { downcast } from "@tutao/tutanota-utils";
/**
 * @returns ALWAYS_ASK if not set yet.
 */
export function getReportMovedMailsType(props) {
    if (!props) {
        return "0" /* ReportMovedMailsType.ALWAYS_ASK */;
    }
    return downcast(props.reportMovedMails);
}
export function getSenderName(mailboxProperties, senderAddress) {
    return mailboxProperties.mailAddressProperties.find((a) => a.mailAddress === senderAddress)?.senderName ?? null;
}
//# sourceMappingURL=MailboxPropertiesUtils.js.map