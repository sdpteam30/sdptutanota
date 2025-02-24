import { assertMainOrNode } from "../api/common/Env.js";
import { CustomerPropertiesTypeRef } from "../api/entities/sys/TypeRefs.js";
import { createContact, createContactMailAddress } from "../api/entities/tutanota/TypeRefs.js";
import { fullNameToFirstAndLastName, mailAddressToFirstAndLastName } from "../misc/parsing/MailAddressParser.js";
import { assertNotNull, contains, neverNull, uint8ArrayToBase64 } from "@tutao/tutanota-utils";
import { ALLOWED_IMAGE_FORMATS, EncryptionAuthStatus, GroupType, MAX_ATTACHMENT_SIZE, MAX_BASE64_IMAGE_SIZE, SYSTEM_GROUP_MAIL_ADDRESS, TUTA_MAIL_ADDRESS_DOMAINS, } from "../api/common/TutanotaConstants.js";
import { getEnabledMailAddressesForGroupInfo, getGroupInfoDisplayName } from "../api/common/utils/GroupUtils.js";
import { lang } from "../misc/LanguageViewModel.js";
import { showFileChooser } from "../file/FileController.js";
import { Dialog } from "../gui/base/Dialog.js";
assertMainOrNode();
export const LINE_BREAK = "<br>";
/**
 * Creates a contact with an email address and a name.
 * @param mailAddress The mail address of the contact. Type is OTHER.
 * @param name The name of the contact. If an empty string is provided, the name is parsed from the mail address.
 * @return The contact.
 */
export function createNewContact(user, mailAddress, name) {
    // prepare some contact information. it is only saved if the mail is sent securely
    // use the name or mail address to extract first and last name. first part is used as first name, all other parts as last name
    let firstAndLastName = name.trim() !== "" ? fullNameToFirstAndLastName(name) : mailAddressToFirstAndLastName(mailAddress);
    let contact = createContact({
        _ownerGroup: assertNotNull(user.memberships.find((m) => m.groupType === GroupType.Contact), "called createNewContact as user without contact group mship").group,
        firstName: firstAndLastName.firstName,
        lastName: firstAndLastName.lastName,
        mailAddresses: [
            createContactMailAddress({
                address: mailAddress,
                type: "2" /* ContactAddressType.OTHER */,
                customTypeName: "",
            }),
        ],
        birthdayIso: null,
        comment: "",
        company: "",
        nickname: null,
        oldBirthdayDate: null,
        presharedPassword: null,
        role: "",
        title: null,
        addresses: [],
        oldBirthdayAggregate: null,
        phoneNumbers: [],
        photo: null,
        socialIds: [],
        department: null,
        middleName: null,
        nameSuffix: null,
        phoneticFirst: null,
        phoneticLast: null,
        phoneticMiddle: null,
        customDate: [],
        messengerHandles: [],
        pronouns: [],
        relationships: [],
        websites: [],
    });
    return contact;
}
export function getMailAddressDisplayText(name, mailAddress, preferNameOnly) {
    if (!name) {
        return mailAddress;
    }
    else if (preferNameOnly) {
        return name;
    }
    else {
        return name + " <" + mailAddress + ">";
    }
}
export function getEnabledMailAddressesWithUser(mailboxDetail, userGroupInfo) {
    if (isUserMailbox(mailboxDetail)) {
        return getEnabledMailAddressesForGroupInfo(userGroupInfo);
    }
    else {
        return getEnabledMailAddressesForGroupInfo(mailboxDetail.mailGroupInfo);
    }
}
export function isUserMailbox(mailboxDetails) {
    return mailboxDetails.mailGroup != null && mailboxDetails.mailGroup.user != null;
}
export function getDefaultSender(logins, mailboxDetails) {
    if (isUserMailbox(mailboxDetails)) {
        let props = logins.getUserController().props;
        return props.defaultSender && contains(getEnabledMailAddressesWithUser(mailboxDetails, logins.getUserController().userGroupInfo), props.defaultSender)
            ? props.defaultSender
            : assertNotNull(logins.getUserController().userGroupInfo.mailAddress);
    }
    else {
        return assertNotNull(mailboxDetails.mailGroupInfo.mailAddress);
    }
}
export function isUserEmail(logins, mailboxDetails, address) {
    if (isUserMailbox(mailboxDetails)) {
        return (contains(getEnabledMailAddressesWithUser(mailboxDetails, logins.getUserController().userGroupInfo), address) ||
            logins.getUserController().userGroupInfo.mailAddress === address);
    }
    else {
        return mailboxDetails.mailGroupInfo.mailAddress === address;
    }
}
export function getSenderNameForUser(mailboxDetails, userController) {
    if (isUserMailbox(mailboxDetails)) {
        // external users do not have access to the user group info
        return userController.userGroupInfo.name;
    }
    else {
        return mailboxDetails.mailGroupInfo ? mailboxDetails.mailGroupInfo.name : "";
    }
}
export function getMailboxName(logins, mailboxDetails) {
    if (!logins.isInternalUserLoggedIn()) {
        return lang.get("mailbox_label");
    }
    else if (isUserMailbox(mailboxDetails)) {
        return getDefaultSender(logins, mailboxDetails);
    }
    else {
        return getGroupInfoDisplayName(assertNotNull(mailboxDetails.mailGroupInfo, "mailboxDetails without mailGroupInfo?"));
    }
}
export function getTemplateLanguages(sortedLanguages, entityClient, loginController) {
    return loginController
        .getUserController()
        .loadCustomer()
        .then((customer) => entityClient.load(CustomerPropertiesTypeRef, neverNull(customer.properties)))
        .then((customerProperties) => {
        return sortedLanguages.filter((sL) => customerProperties.notificationMailTemplates.find((nmt) => nmt.language === sL.code));
    })
        .catch(() => []);
}
export function dialogTitleTranslationKey(conversationType) {
    let key;
    switch (conversationType) {
        case "0" /* ConversationType.NEW */:
            key = "newMail_action";
            break;
        case "1" /* ConversationType.REPLY */:
            key = "reply_action";
            break;
        case "2" /* ConversationType.FORWARD */:
            key = "forward_action";
            break;
        default:
            key = "emptyString_msg";
    }
    return key;
}
/**
 * @param files the files that shall be attached.
 * @param maxAttachmentSize the maximum size the new files may have in total to be attached successfully.
 */
export function checkAttachmentSize(files, maxAttachmentSize = MAX_ATTACHMENT_SIZE) {
    let totalSize = 0;
    const attachableFiles = [];
    const tooBigFiles = [];
    for (const file of files) {
        if (totalSize + Number(file.size) > maxAttachmentSize) {
            tooBigFiles.push(file.name);
        }
        else {
            totalSize += Number(file.size);
            attachableFiles.push(file);
        }
    }
    return {
        attachableFiles,
        tooBigFiles,
    };
}
export var RecipientField;
(function (RecipientField) {
    RecipientField["TO"] = "to";
    RecipientField["CC"] = "cc";
    RecipientField["BCC"] = "bcc";
})(RecipientField || (RecipientField = {}));
export function isTutaMailAddress(mailAddress) {
    return TUTA_MAIL_ADDRESS_DOMAINS.some((tutaDomain) => mailAddress.endsWith("@" + tutaDomain));
}
export function hasValidEncryptionAuthForTeamOrSystemMail({ encryptionAuthStatus }) {
    switch (encryptionAuthStatus) {
        // emails before tuta-crypt had no encryptionAuthStatus
        case null:
        case undefined:
        case EncryptionAuthStatus.RSA_NO_AUTHENTICATION:
        case EncryptionAuthStatus.TUTACRYPT_AUTHENTICATION_SUCCEEDED:
        case EncryptionAuthStatus.TUTACRYPT_SENDER: // should only be set for sent NOT received mails
            return true;
        case EncryptionAuthStatus.AES_NO_AUTHENTICATION:
        case EncryptionAuthStatus.TUTACRYPT_AUTHENTICATION_FAILED:
        default:
            // we have to be able to handle future cases, to be safe we say that they are not valid encryptionAuth
            return false;
    }
}
/**
 * Is this a system notification?
 */
export function isSystemNotification(mail) {
    const { confidential, sender, state } = mail;
    return (state === "2" /* MailState.RECEIVED */ &&
        confidential &&
        hasValidEncryptionAuthForTeamOrSystemMail(mail) &&
        (sender.address === SYSTEM_GROUP_MAIL_ADDRESS ||
            // New emails will have sender set to system and will only have replyTo set to no-reply
            // but we should keep displaying old emails correctly.
            isNoReplyTeamAddress(sender.address)));
}
export function isNoReplyTeamAddress(address) {
    return address === "no-reply@tutao.de" || address === "no-reply@tutanota.de";
}
export function insertInlineImageB64ClickHandler(ev, handler) {
    showFileChooser(true, ALLOWED_IMAGE_FORMATS).then((files) => {
        const tooBig = [];
        for (let file of files) {
            if (file.size > MAX_BASE64_IMAGE_SIZE) {
                tooBig.push(file);
            }
            else {
                const b64 = uint8ArrayToBase64(file.data);
                const dataUrlString = `data:${file.mimeType};base64,${b64}`;
                handler.insertImage(dataUrlString, {
                    style: "max-width: 100%",
                });
            }
        }
        if (tooBig.length > 0) {
            Dialog.message(lang.getTranslation("tooBigInlineImages_msg", {
                "{size}": MAX_BASE64_IMAGE_SIZE / 1024,
            }));
        }
    });
}
//# sourceMappingURL=SharedMailUtils.js.map