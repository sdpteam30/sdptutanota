import m from "mithril";
import { Dialog } from "../../common/gui/base/Dialog";
import { lang } from "../../common/misc/LanguageViewModel";
import { MailSetKind } from "../../common/api/common/TutanotaConstants";
import { isDomainName, isMailAddress, isRegularExpression } from "../../common/misc/FormatValidator";
import { getInboxRuleTypeNameMapping } from "../mail/model/InboxRuleHandler";
import { createInboxRule } from "../../common/api/entities/tutanota/TypeRefs.js";
import stream from "mithril/stream";
import { DropDownSelector } from "../../common/gui/base/DropDownSelector.js";
import { TextField } from "../../common/gui/base/TextField.js";
import { neverNull } from "@tutao/tutanota-utils";
import { LockedError } from "../../common/api/common/error/RestError";
import { showNotAvailableForFreeDialog } from "../../common/misc/SubscriptionDialogs";
import { elementIdPart, isSameId } from "../../common/api/common/utils/EntityUtils";
import { assertMainOrNode } from "../../common/api/common/Env";
import { locator } from "../../common/api/main/CommonLocator";
import { isOfflineError } from "../../common/api/common/utils/ErrorUtils.js";
import { mailLocator } from "../mailLocator.js";
import { assertSystemFolderOfType, getExistingRuleForType, getFolderName, getIndentedFolderNameForDropdown, getPathToFolderString, } from "../mail/model/MailUtils.js";
assertMainOrNode();
export async function show(mailBoxDetail, ruleOrTemplate) {
    if (locator.logins.getUserController().isFreeAccount()) {
        showNotAvailableForFreeDialog();
    }
    else if (mailBoxDetail && mailBoxDetail.mailbox.folders) {
        const folders = await mailLocator.mailModel.getMailboxFoldersForId(mailBoxDetail.mailbox.folders._id);
        let targetFolders = folders.getIndentedList().map((folderInfo) => {
            return {
                name: getIndentedFolderNameForDropdown(folderInfo),
                value: folderInfo.folder,
            };
        });
        const inboxRuleType = stream(ruleOrTemplate.type);
        const inboxRuleValue = stream(ruleOrTemplate.value);
        const selectedFolder = ruleOrTemplate.targetFolder == null ? null : folders.getFolderById(elementIdPart(ruleOrTemplate.targetFolder));
        const inboxRuleTarget = stream(selectedFolder ?? assertSystemFolderOfType(folders, MailSetKind.ARCHIVE));
        let form = () => [
            m(DropDownSelector, {
                items: getInboxRuleTypeNameMapping(),
                label: "inboxRuleField_label",
                selectedValue: inboxRuleType(),
                selectionChangedHandler: inboxRuleType,
            }),
            m(TextField, {
                label: "inboxRuleValue_label",
                autocapitalize: "none" /* Autocapitalize.none */,
                value: inboxRuleValue(),
                oninput: inboxRuleValue,
                helpLabel: () => inboxRuleType() !== "4" /* InboxRuleType.SUBJECT_CONTAINS */ && inboxRuleType() !== "5" /* InboxRuleType.MAIL_HEADER_CONTAINS */
                    ? lang.get("emailSenderPlaceholder_label")
                    : lang.get("emptyString_msg"),
            }),
            m(DropDownSelector, {
                label: "inboxRuleTargetFolder_label",
                items: targetFolders,
                selectedValue: inboxRuleTarget(),
                selectedValueDisplay: getFolderName(inboxRuleTarget()),
                selectionChangedHandler: inboxRuleTarget,
                helpLabel: () => getPathToFolderString(folders, inboxRuleTarget(), true),
            }),
        ];
        const addInboxRuleOkAction = (dialog) => {
            let rule = createInboxRule({
                type: inboxRuleType(),
                value: getCleanedValue(inboxRuleType(), inboxRuleValue()),
                targetFolder: inboxRuleTarget()._id,
            });
            const props = locator.logins.getUserController().props;
            const inboxRules = props.inboxRules;
            const ruleId = ruleOrTemplate._id;
            props.inboxRules = ruleId == null ? [...inboxRules, rule] : inboxRules.map((inboxRule) => (isSameId(inboxRule._id, ruleId) ? rule : inboxRule));
            locator.entityClient
                .update(props)
                .then(() => {
                dialog.close();
            })
                .catch((error) => {
                if (isOfflineError(error)) {
                    props.inboxRules = inboxRules;
                    //do not close
                    throw error;
                }
                else if (error instanceof LockedError) {
                    dialog.close();
                }
                else {
                    props.inboxRules = inboxRules;
                    dialog.close();
                    throw error;
                }
            });
        };
        Dialog.showActionDialog({
            title: "addInboxRule_action",
            child: form,
            validator: () => validateInboxRuleInput(inboxRuleType(), inboxRuleValue(), ruleOrTemplate._id),
            allowOkWithReturn: true,
            okAction: addInboxRuleOkAction,
        });
    }
}
export function createInboxRuleTemplate(ruleType, value) {
    return {
        type: ruleType ?? "0" /* InboxRuleType.FROM_EQUALS */,
        value: getCleanedValue(neverNull(ruleType), value || ""),
    };
}
function validateInboxRuleInput(type, value, ruleId) {
    let currentCleanedValue = getCleanedValue(type, value);
    if (currentCleanedValue === "") {
        return "inboxRuleEnterValue_msg";
    }
    else if (isInvalidRegex(currentCleanedValue)) {
        return "invalidRegexSyntax_msg";
    }
    else if (type !== "4" /* InboxRuleType.SUBJECT_CONTAINS */ &&
        type !== "5" /* InboxRuleType.MAIL_HEADER_CONTAINS */ &&
        !isRegularExpression(currentCleanedValue) &&
        !isDomainName(currentCleanedValue) &&
        !isMailAddress(currentCleanedValue, false)) {
        return "inboxRuleInvalidEmailAddress_msg";
    }
    else {
        let existingRule = getExistingRuleForType(locator.logins.getUserController().props, currentCleanedValue, type);
        if (existingRule && (!ruleId || (ruleId && !isSameId(existingRule._id, ruleId)))) {
            return "inboxRuleAlreadyExists_msg";
        }
    }
    return null;
}
function getCleanedValue(type, value) {
    if (type === "4" /* InboxRuleType.SUBJECT_CONTAINS */ || type === "5" /* InboxRuleType.MAIL_HEADER_CONTAINS */) {
        return value;
    }
    else {
        return value.trim().toLowerCase();
    }
}
/**
 * @param value
 * @returns true if provided string is a regex and it's unparseable by RegExp, else false
 * @private
 */
function isInvalidRegex(value) {
    if (!isRegularExpression(value))
        return false; // not a regular expression is not an invalid regular expression
    try {
        // RegExp ctor throws a ParseError if invalid regex
        let regExp = new RegExp(value.substring(1, value.length - 1));
    }
    catch (e) {
        return true;
    }
    return false;
}
//# sourceMappingURL=AddInboxRuleDialog.js.map