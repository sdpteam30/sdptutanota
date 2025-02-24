import { Checkbox } from "../../../common/gui/base/Checkbox.js";
import { lang } from "../../../common/misc/LanguageViewModel";
import m from "mithril";
import { Dialog } from "../../../common/gui/base/Dialog";
import { showSnackBar } from "../../../common/gui/base/SnackBar";
function confirmMailReportDialog(mailModel, mailboxDetails) {
    return new Promise((resolve) => {
        let shallRememberDecision = false;
        const child = () => m(Checkbox, {
            label: () => lang.get("rememberDecision_msg"),
            checked: shallRememberDecision,
            onChecked: (v) => (shallRememberDecision = v),
            helpLabel: "changeMailSettings_msg",
        });
        async function updateSpamReportSetting(areMailsReported) {
            if (shallRememberDecision) {
                const reportMovedMails = areMailsReported ? "1" /* ReportMovedMailsType.AUTOMATICALLY_ONLY_SPAM */ : "3" /* ReportMovedMailsType.NEVER */;
                await mailModel.saveReportMovedMails(mailboxDetails.mailboxGroupRoot, reportMovedMails);
            }
            resolve(areMailsReported);
            dialog.close();
        }
        const yesButton = {
            label: "yes_label",
            click: () => updateSpamReportSetting(true),
            type: "primary" /* ButtonType.Primary */,
        };
        const noButton = {
            label: "no_label",
            click: () => updateSpamReportSetting(false),
            type: "secondary" /* ButtonType.Secondary */,
        };
        // onclose is called when dialog is closed by ESC or back button. In this case we don't want to report spam.
        const onclose = () => {
            resolve(false);
        };
        const dialog = Dialog.confirmMultiple(lang.makeTranslation("unencryptedTransmission_msg", lang.get("unencryptedTransmission_msg") + " " + lang.get("allowOperation_msg")), [noButton, yesButton], onclose, child);
    });
}
/**
 * Check if the user wants to report mails as spam when they are moved to the spam folder and report them.
 * May open a dialog for confirmation and otherwise shows a Snackbar before reporting to the server.
 */
export async function reportMailsAutomatically(mailReportType, mailboxModel, mailModel, mailboxDetails, mails) {
    if (mailReportType !== "1" /* MailReportType.SPAM */) {
        return;
    }
    const mailboxProperties = await mailboxModel.getMailboxProperties(mailboxDetails.mailboxGroupRoot);
    let allowUndoing = true; // decides if a snackbar is shown to prevent the server request
    let isReportable = false;
    if (!mailboxProperties || mailboxProperties.reportMovedMails === "0" /* ReportMovedMailsType.ALWAYS_ASK */) {
        isReportable = await confirmMailReportDialog(mailModel, mailboxDetails);
        allowUndoing = false;
    }
    else if (mailboxProperties.reportMovedMails === "1" /* ReportMovedMailsType.AUTOMATICALLY_ONLY_SPAM */) {
        isReportable = true;
    }
    else if (mailboxProperties.reportMovedMails === "3" /* ReportMovedMailsType.NEVER */) {
        // no report
    }
    if (isReportable) {
        // only show the snackbar to undo the report if the user was not asked already
        if (allowUndoing) {
            let undoClicked = false;
            showSnackBar({
                message: "undoMailReport_msg",
                button: {
                    label: "cancel_action",
                    click: () => (undoClicked = true),
                },
                onClose: () => {
                    if (!undoClicked) {
                        mailModel.reportMails(mailReportType, mails);
                    }
                },
            });
        }
        else {
            mailModel.reportMails(mailReportType, mails);
        }
    }
}
//# sourceMappingURL=MailReportDialog.js.map