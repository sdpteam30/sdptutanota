import { lang } from "../../../common/misc/LanguageViewModel";
import { sortCompareByReverseId } from "../../../common/api/common/utils/EntityUtils";
export const ContactMailAddressTypeToLabel = {
    ["0" /* ContactAddressType.PRIVATE */]: "private_label",
    ["1" /* ContactAddressType.WORK */]: "work_label",
    ["2" /* ContactAddressType.OTHER */]: "other_label",
    ["3" /* ContactAddressType.CUSTOM */]: "custom_label",
};
export function getContactAddressTypeLabel(type, custom) {
    if (type === "3" /* ContactAddressType.CUSTOM */) {
        return lang.makeTranslation("custom", custom);
    }
    else {
        let key = ContactMailAddressTypeToLabel[type];
        return key;
    }
}
export const ContactPhoneNumberTypeToLabel = {
    ["0" /* ContactPhoneNumberType.PRIVATE */]: "private_label",
    ["1" /* ContactPhoneNumberType.WORK */]: "work_label",
    ["2" /* ContactPhoneNumberType.MOBILE */]: "mobile_label",
    ["3" /* ContactPhoneNumberType.FAX */]: "fax_label",
    ["4" /* ContactPhoneNumberType.OTHER */]: "other_label",
    ["5" /* ContactPhoneNumberType.CUSTOM */]: "custom_label",
};
export function getContactPhoneNumberTypeLabel(type, custom) {
    if (type === "5" /* ContactPhoneNumberType.CUSTOM */) {
        return lang.makeTranslation("custom", custom);
    }
    else {
        let key = ContactPhoneNumberTypeToLabel[type];
        return key;
    }
}
export const ContactSocialTypeToLabel = {
    ["0" /* ContactSocialType.TWITTER */]: "twitter_label",
    ["1" /* ContactSocialType.FACEBOOK */]: "facebook_label",
    ["2" /* ContactSocialType.XING */]: "xing_label",
    ["3" /* ContactSocialType.LINKED_IN */]: "linkedin_label",
    ["4" /* ContactSocialType.OTHER */]: "other_label",
    ["5" /* ContactSocialType.CUSTOM */]: "custom_label",
};
export function getContactSocialTypeLabel(type, custom) {
    if (type === "5" /* ContactSocialType.CUSTOM */) {
        return lang.makeTranslation("custom", custom);
    }
    else {
        let key = ContactSocialTypeToLabel[type];
        return key;
    }
}
export const ContactRelationshipTypeToLabel = {
    ["0" /* ContactRelationshipType.PARENT */]: "parent_label",
    ["1" /* ContactRelationshipType.BROTHER */]: "brother_label",
    ["2" /* ContactRelationshipType.SISTER */]: "sister_label",
    ["3" /* ContactRelationshipType.CHILD */]: "child_label",
    ["4" /* ContactRelationshipType.FRIEND */]: "friend_label",
    ["5" /* ContactRelationshipType.RELATIVE */]: "relative_label",
    ["6" /* ContactRelationshipType.SPOUSE */]: "spouse_label",
    ["7" /* ContactRelationshipType.PARTNER */]: "partner_label",
    ["8" /* ContactRelationshipType.ASSISTANT */]: "assistant_label",
    ["9" /* ContactRelationshipType.MANAGER */]: "manager_label",
    ["10" /* ContactRelationshipType.OTHER */]: "other_label",
    ["11" /* ContactRelationshipType.CUSTOM */]: "custom_label",
};
export function getContactRelationshipTypeToLabel(type, custom) {
    if (type === "11" /* ContactRelationshipType.CUSTOM */) {
        return lang.makeTranslation("custom", custom);
    }
    else {
        let key = ContactRelationshipTypeToLabel[type];
        return key;
    }
}
export const ContactMessengerHandleTypeToLabel = {
    ["0" /* ContactMessengerHandleType.SIGNAL */]: "signal_label",
    ["1" /* ContactMessengerHandleType.WHATSAPP */]: "whatsapp_label",
    ["2" /* ContactMessengerHandleType.TELEGRAM */]: "telegram_label",
    ["3" /* ContactMessengerHandleType.DISCORD */]: "discord_label",
    ["4" /* ContactMessengerHandleType.OTHER */]: "other_label",
    ["5" /* ContactMessengerHandleType.CUSTOM */]: "custom_label",
};
export function getContactMessengerHandleTypeToLabel(type, custom) {
    if (type === "5" /* ContactMessengerHandleType.CUSTOM */) {
        return lang.makeTranslation("custom", custom);
    }
    else {
        let key = ContactMessengerHandleTypeToLabel[type];
        return key;
    }
}
export const ContactCustomDateTypeToLabel = {
    ["0" /* ContactCustomDateType.ANNIVERSARY */]: "anniversary_label",
    ["1" /* ContactCustomDateType.OTHER */]: "other_label",
    ["2" /* ContactCustomDateType.CUSTOM */]: "custom_label",
};
export function getContactCustomDateTypeToLabel(type, custom) {
    if (type === "2" /* ContactCustomDateType.CUSTOM */) {
        return lang.makeTranslation("custom", custom);
    }
    else {
        let key = ContactCustomDateTypeToLabel[type];
        return key;
    }
}
export const ContactCustomWebsiteTypeToLabel = {
    ["0" /* ContactWebsiteType.PRIVATE */]: "private_label",
    ["1" /* ContactWebsiteType.WORK */]: "work_label",
    ["2" /* ContactWebsiteType.OTHER */]: "other_label",
    ["3" /* ContactWebsiteType.CUSTOM */]: "custom_label",
};
export function getContactCustomWebsiteTypeToLabel(type, custom) {
    if (type === "3" /* ContactWebsiteType.CUSTOM */) {
        return lang.makeTranslation("custom", custom);
    }
    else {
        let key = ContactCustomWebsiteTypeToLabel[type];
        return key;
    }
}
/**
 * Sorts by the following preferences:
 * 1. first name
 * 2. second name
 * 3. first email address
 * 4. id
 * Missing fields are sorted below existing fields
 */
export function compareContacts(contact1, contact2, sortByFirstName = true) {
    let c1First = contact1.firstName.trim();
    let c2First = contact2.firstName.trim();
    let c1Last = contact1.lastName.trim();
    let c2Last = contact2.lastName.trim();
    let c1MailLength = contact1.mailAddresses.length;
    let c2MailLength = contact2.mailAddresses.length;
    let [c1Primary, c1Secondary] = sortByFirstName ? [c1First, c1Last] : [c1Last, c1First];
    let [c2Primary, c2Secondary] = sortByFirstName ? [c2First, c2Last] : [c2Last, c2First];
    // If the contact doesn't have either the first or the last name, use company as the first name. We cannot just make a string out of it
    // and compare it because we would lose priority of first name over last name and set name over unset name.
    if (!c1Primary && !c1Secondary) {
        c1Primary = contact1.company;
    }
    if (!c2Primary && !c2Secondary) {
        c2Primary = contact2.company;
    }
    if (c1Primary && !c2Primary) {
        return -1;
    }
    else if (c2Primary && !c1Primary) {
        return 1;
    }
    else {
        let result = c1Primary.localeCompare(c2Primary);
        if (result === 0) {
            if (c1Secondary && !c2Secondary) {
                return -1;
            }
            else if (c2Secondary && !c1Secondary) {
                return 1;
            }
            else {
                result = c1Secondary.localeCompare(c2Secondary);
            }
        }
        if (result === 0) {
            // names are equal or no names in contact
            if (c1MailLength > 0 && c2MailLength === 0) {
                return -1;
            }
            else if (c2MailLength > 0 && c1MailLength === 0) {
                return 1;
            }
            else if (c1MailLength === 0 && c2MailLength === 0) {
                // see Multiselect with shift and up arrow not working properly #152 at github
                return sortCompareByReverseId(contact1, contact2);
            }
            else {
                result = contact1.mailAddresses[0].address.trim().localeCompare(contact2.mailAddresses[0].address.trim());
                if (result === 0) {
                    // see Multiselect with shift and up arrow not working properly #152 at github
                    return sortCompareByReverseId(contact1, contact2);
                }
                else {
                    return result;
                }
            }
        }
        else {
            return result;
        }
    }
}
//# sourceMappingURL=ContactGuiUtils.js.map