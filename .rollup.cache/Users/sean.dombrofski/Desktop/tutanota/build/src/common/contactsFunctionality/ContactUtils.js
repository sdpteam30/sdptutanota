import { assertMainOrNode } from "../api/common/Env.js";
import { formatDate } from "../misc/Formatter.js";
import { lang } from "../misc/LanguageViewModel.js";
import { isoDateToBirthday } from "../api/common/utils/BirthdayUtils.js";
assertMainOrNode();
export function getContactDisplayName(contact) {
    if (contact.nickname != null && contact.nickname !== "") {
        return contact.nickname;
    }
    else {
        return `${contact.firstName} ${contact.lastName}`.trim();
    }
}
export function getContactListName(contact) {
    let name = `${contact.firstName} ${contact.lastName}`.trim();
    if (name.length === 0) {
        name = contact.company.trim();
    }
    return name;
}
export function formatBirthdayNumeric(birthday) {
    if (birthday.year) {
        return formatDate(new Date(Number(birthday.year), Number(birthday.month) - 1, Number(birthday.day)));
    }
    else {
        //if no year is specified a leap year is used to allow 2/29 as birthday
        return lang.formats.simpleDateWithoutYear.format(new Date(Number(2016), Number(birthday.month) - 1, Number(birthday.day)));
    }
}
/**
 * Returns the given date of the contact as formatted string using default date formatter including date, month and year.
 * If date contains no year only month and day will be included.
 * If there is no date or an invalid birthday format an empty string returns.
 */
export function formatContactDate(isoDate) {
    if (isoDate) {
        try {
            return formatBirthdayNumeric(isoDateToBirthday(isoDate));
        }
        catch (e) {
            // cant format, cant do anything
        }
    }
    return "";
}
export function getSocialUrl(contactId) {
    let socialUrlType = "";
    let http = "https://";
    let worldwidew = "www.";
    const isSchemePrefixed = contactId.socialId.indexOf("http") !== -1;
    const isWwwDotPrefixed = contactId.socialId.indexOf(worldwidew) !== -1;
    if (!isSchemePrefixed && !isWwwDotPrefixed) {
        switch (contactId.type) {
            case "0" /* ContactSocialType.TWITTER */:
                socialUrlType = "twitter.com/";
                break;
            case "1" /* ContactSocialType.FACEBOOK */:
                socialUrlType = "facebook.com/";
                break;
            case "2" /* ContactSocialType.XING */:
                socialUrlType = "xing.com/profile/";
                break;
            case "3" /* ContactSocialType.LINKED_IN */:
                socialUrlType = "linkedin.com/in/";
        }
    }
    if (isSchemePrefixed) {
        http = "";
    }
    if (isSchemePrefixed || isWwwDotPrefixed) {
        worldwidew = "";
    }
    return `${http}${worldwidew}${socialUrlType}${contactId.socialId.trim()}`;
}
export function getWebsiteUrl(websiteUrl) {
    let http = "https://";
    let worldwidew = "www.";
    const isSchemePrefixed = websiteUrl.indexOf("http") !== -1;
    const isWwwDotPrefixed = websiteUrl.indexOf(worldwidew) !== -1;
    if (isSchemePrefixed) {
        http = "";
    }
    if (isSchemePrefixed || isWwwDotPrefixed) {
        worldwidew = "";
    }
    return `${http}${worldwidew}${websiteUrl}`.trim();
}
export function getMessengerHandleUrl(handle) {
    const replaceNumberExp = new RegExp(/[^0-9+]/g);
    switch (handle.type) {
        case "0" /* ContactMessengerHandleType.SIGNAL */:
            return `sgnl://signal.me/#p/${handle.handle.replaceAll(replaceNumberExp, "")}`;
        case "1" /* ContactMessengerHandleType.WHATSAPP */:
            return `whatsapp://send?phone=${handle.handle.replaceAll(replaceNumberExp, "")}`;
        case "2" /* ContactMessengerHandleType.TELEGRAM */:
            return `tg://resolve?domain=${handle.handle}`;
        case "3" /* ContactMessengerHandleType.DISCORD */:
            return `discord://-/users/${handle.handle}`;
        default:
            return "";
    }
}
export function extractStructuredMailAddresses(addresses) {
    return addresses.map((address) => ({
        address: address.address,
        type: address.type,
        customTypeName: address.customTypeName,
    }));
}
export function extractStructuredAddresses(addresses) {
    return addresses.map((address) => ({
        address: address.address,
        type: address.type,
        customTypeName: address.customTypeName,
    }));
}
export function extractStructuredPhoneNumbers(numbers) {
    return numbers.map((number) => ({
        number: number.number,
        type: number.type,
        customTypeName: number.customTypeName,
    }));
}
export function extractStructuredCustomDates(dates) {
    return dates.map((date) => ({
        dateIso: date.dateIso,
        type: date.type,
        customTypeName: date.customTypeName,
    }));
}
export function extractStructuredWebsites(websites) {
    return websites.map((website) => ({
        url: website.url,
        type: website.type,
        customTypeName: website.customTypeName,
    }));
}
export function extractStructuredRelationships(relationships) {
    return relationships.map((relation) => ({
        person: relation.person,
        type: relation.type,
        customTypeName: relation.customTypeName,
    }));
}
export function extractStructuredMessengerHandle(handles) {
    return handles.map((handle) => ({
        type: handle.type,
        customTypeName: handle.customTypeName,
        handle: handle.handle,
    }));
}
export function validateBirthdayOfContact(contact) {
    if (contact.birthday != null) {
        try {
            isoDateToBirthday(contact.birthday);
            return contact.birthday;
        }
        catch (_) {
            return null;
        }
    }
    else {
        return null;
    }
}
//# sourceMappingURL=ContactUtils.js.map