//@bundleInto:common-min
import { DAY_IN_MILLIS, downcast } from "@tutao/tutanota-utils";
import { isApp, isElectronClient, isIOSApp } from "./Env";
import { ProgrammingError } from "./error/ProgrammingError";
export const MAX_NBR_MOVE_DELETE_MAIL_SERVICE = 50;
// visible for testing
export const MAX_BLOB_SIZE_BYTES = 1024 * 1024 * 10;
export const REQUEST_SIZE_LIMIT_DEFAULT = 1024 * 1024;
export const REQUEST_SIZE_LIMIT_MAP = new Map([
    ["/rest/storage/blobservice", MAX_BLOB_SIZE_BYTES + 100], // overhead for encryption
    ["/rest/tutanota/filedataservice", 1024 * 1024 * 25],
    ["/rest/tutanota/draftservice", 1024 * 1024], // should be large enough
]);
export const SYSTEM_GROUP_MAIL_ADDRESS = "system@tutanota.de";
export const getMailFolderType = (folder) => downcast(folder.folderType);
export function isFolder(folder) {
    return folder.folderType !== MailSetKind.ALL && folder.folderType !== MailSetKind.LABEL && folder.folderType !== MailSetKind.Imported;
}
export function isLabel(folder) {
    return folder.folderType === MailSetKind.LABEL;
}
export const reverse = (objectMap) => Object.keys(objectMap).reduce((r, k) => {
    // @ts-ignore
    const v = objectMap[downcast(k)];
    return Object.assign(r, { [v]: k });
}, {});
export const OUT_OF_OFFICE_SUBJECT_PREFIX = "Auto-reply: ";
export var GroupType;
(function (GroupType) {
    GroupType["User"] = "0";
    GroupType["Admin"] = "1";
    GroupType["MailingList"] = "2";
    GroupType["Customer"] = "3";
    GroupType["External"] = "4";
    GroupType["Mail"] = "5";
    GroupType["Contact"] = "6";
    GroupType["File"] = "7";
    GroupType["LocalAdmin"] = "8";
    GroupType["Calendar"] = "9";
    GroupType["Template"] = "10";
    GroupType["ContactList"] = "11";
})(GroupType || (GroupType = {}));
export const GroupTypeNameByCode = reverse(GroupType);
export const getMembershipGroupType = (membership) => downcast(membership.groupType);
export var MailSetKind;
(function (MailSetKind) {
    MailSetKind["CUSTOM"] = "0";
    MailSetKind["INBOX"] = "1";
    MailSetKind["SENT"] = "2";
    MailSetKind["TRASH"] = "3";
    MailSetKind["ARCHIVE"] = "4";
    MailSetKind["SPAM"] = "5";
    MailSetKind["DRAFT"] = "6";
    MailSetKind["ALL"] = "7";
    MailSetKind["LABEL"] = "8";
    MailSetKind["Imported"] = "9";
})(MailSetKind || (MailSetKind = {}));
export function getMailSetKind(folder) {
    return folder.folderType;
}
export const getContactSocialType = (contactSocialId) => downcast(contactSocialId.type);
export const getCustomDateType = (customDate) => downcast(customDate.type);
export const getRelationshipType = (relationship) => downcast(relationship.type);
export var KdfType;
(function (KdfType) {
    KdfType["Bcrypt"] = "0";
    KdfType["Argon2id"] = "1";
})(KdfType || (KdfType = {}));
// The Kdf type to use when deriving new(!) keys from passwords
export const DEFAULT_KDF_TYPE = KdfType.Argon2id;
export var AccountType;
(function (AccountType) {
    AccountType["SYSTEM"] = "0";
    AccountType["FREE"] = "1";
    AccountType["STARTER"] = "2";
    AccountType["PAID"] = "3";
    AccountType["EXTERNAL"] = "5";
})(AccountType || (AccountType = {}));
export const AccountTypeNames = {
    [AccountType.SYSTEM]: "System",
    [AccountType.FREE]: "Free",
    [AccountType.STARTER]: "Outlook",
    [AccountType.PAID]: "Paid",
    [AccountType.EXTERNAL]: "External",
};
export var CustomDomainType;
(function (CustomDomainType) {
    CustomDomainType["NONE"] = "0";
    CustomDomainType["ONE"] = "1";
    CustomDomainType["THREE"] = "2";
    CustomDomainType["TEN"] = "3";
    CustomDomainType["UNLIMITED"] = "4";
})(CustomDomainType || (CustomDomainType = {}));
export const CustomDomainTypeCount = {
    [CustomDomainType.NONE]: 0,
    [CustomDomainType.ONE]: 1,
    [CustomDomainType.THREE]: 3,
    [CustomDomainType.TEN]: 10,
    [CustomDomainType.UNLIMITED]: -1,
};
export const CustomDomainTypeCountName = {
    [CustomDomainType.NONE]: "0",
    [CustomDomainType.ONE]: "1",
    [CustomDomainType.THREE]: "3",
    [CustomDomainType.TEN]: "10",
    [CustomDomainType.UNLIMITED]: "∞",
};
export var PlanType;
(function (PlanType) {
    PlanType["Premium"] = "0";
    PlanType["Pro"] = "2";
    PlanType["Teams"] = "3";
    PlanType["PremiumBusiness"] = "4";
    PlanType["TeamsBusiness"] = "5";
    PlanType["Revolutionary"] = "6";
    PlanType["Legend"] = "7";
    PlanType["Essential"] = "8";
    PlanType["Advanced"] = "9";
    PlanType["Unlimited"] = "10";
    PlanType["Free"] = "11";
})(PlanType || (PlanType = {}));
export const AvailablePlans = [
    PlanType.Free,
    PlanType.Revolutionary,
    PlanType.Legend,
    PlanType.Essential,
    PlanType.Advanced,
    PlanType.Unlimited,
];
export const NewPaidPlans = [PlanType.Revolutionary, PlanType.Legend, PlanType.Essential, PlanType.Advanced, PlanType.Unlimited];
export const NewBusinessPlans = [PlanType.Essential, PlanType.Advanced, PlanType.Unlimited];
export const NewPersonalPlans = [PlanType.Free, PlanType.Revolutionary, PlanType.Legend];
export const LegacyPlans = [PlanType.Premium, PlanType.PremiumBusiness, PlanType.Teams, PlanType.TeamsBusiness, PlanType.Pro];
export const HighlightedPlans = [PlanType.Revolutionary, PlanType.Advanced];
export const HighestTierPlans = [PlanType.Legend, PlanType.Unlimited];
export const PlanTypeToName = reverse(PlanType);
export var SubscriptionType;
(function (SubscriptionType) {
    SubscriptionType[SubscriptionType["Personal"] = 0] = "Personal";
    SubscriptionType[SubscriptionType["Business"] = 1] = "Business";
    SubscriptionType[SubscriptionType["PaidPersonal"] = 2] = "PaidPersonal";
})(SubscriptionType || (SubscriptionType = {}));
export var BookingItemFeatureType;
(function (BookingItemFeatureType) {
    BookingItemFeatureType["LegacyUsers"] = "0";
    BookingItemFeatureType["Storage"] = "1";
    BookingItemFeatureType["Alias"] = "2";
    BookingItemFeatureType["SharedMailGroup"] = "3";
    BookingItemFeatureType["Whitelabel"] = "4";
    BookingItemFeatureType["ContactForm"] = "5";
    BookingItemFeatureType["WhitelabelChild"] = "6";
    BookingItemFeatureType["LocalAdminGroup"] = "7";
    BookingItemFeatureType["Discount"] = "8";
    BookingItemFeatureType["Sharing"] = "9";
    BookingItemFeatureType["Business"] = "10";
    BookingItemFeatureType["Revolutionary"] = "11";
    BookingItemFeatureType["Legend"] = "12";
    BookingItemFeatureType["Essential"] = "13";
    BookingItemFeatureType["Advanced"] = "14";
    BookingItemFeatureType["Unlimited"] = "15";
})(BookingItemFeatureType || (BookingItemFeatureType = {}));
export const BookingItemFeatureByCode = reverse(BookingItemFeatureType);
export const getPaymentMethodType = (accountingInfo) => downcast(accountingInfo.paymentMethod);
export var PaymentMethodType;
(function (PaymentMethodType) {
    PaymentMethodType["Invoice"] = "0";
    PaymentMethodType["CreditCard"] = "1";
    PaymentMethodType["Sepa"] = "2";
    PaymentMethodType["Paypal"] = "3";
    PaymentMethodType["AccountBalance"] = "4";
    PaymentMethodType["AppStore"] = "5";
})(PaymentMethodType || (PaymentMethodType = {}));
export async function getDefaultPaymentMethod() {
    if (isIOSApp()) {
        return PaymentMethodType.AppStore;
    }
    return PaymentMethodType.CreditCard;
}
export const PaymentMethodTypeToName = reverse(PaymentMethodType);
export const Const = {
    INITIAL_UPGRADE_REMINDER_INTERVAL_MS: 14 * DAY_IN_MILLIS,
    REPEATED_UPGRADE_REMINDER_INTERVAL_MS: 90 * DAY_IN_MILLIS,
    MEMORY_GB_FACTOR: 1000000000,
    MEMORY_WARNING_FACTOR: 0.9,
    // Sets the current date for testing date dependent services. Only available in test environments.
    CURRENT_DATE: null,
    CURRENCY_SYMBOL_EUR: "€",
    DEFAULT_APP_DOMAIN: "app.tuta.com",
    LEGACY_WEBAUTHN_RP_ID: "tutanota.com",
    WEBAUTHN_RP_ID: "tuta.com",
    U2f_APPID_SUFFIX: "/u2f-appid.json",
    // this is fetched from the website assets (even though the server has a hardcoded response for this)
    // we keep it at tutanota.com since we're matching on it in the code and old keys are saved with this
    // URL as appId.
    // we'll still get the contents
    // because it will be redirected to tuta.com after new domain deploy.
    U2F_LEGACY_APPID: "https://tutanota.com/u2f-appid.json",
    EXECUTE_KDF_MIGRATION: true,
};
export const TUTA_MAIL_ADDRESS_DOMAINS = Object.freeze([
    "tuta.com",
    "tutamail.com",
    "tuta.io",
    "tutanota.com",
    "tutanota.de",
    "keemail.me",
]);
export const TUTA_MAIL_ADDRESS_SIGNUP_DOMAINS = TUTA_MAIL_ADDRESS_DOMAINS;
export const DEFAULT_PAID_MAIL_ADDRESS_SIGNUP_DOMAIN = "tuta.com";
export const DEFAULT_FREE_MAIL_ADDRESS_SIGNUP_DOMAIN = "tutamail.com";
// Keep non-const for admin
export var ApprovalStatus;
(function (ApprovalStatus) {
    ApprovalStatus["REGISTRATION_APPROVED"] = "0";
    ApprovalStatus["REGISTRATION_APPROVAL_NEEDED"] = "1";
    ApprovalStatus["SEND_MAILS_APPROVED"] = "2";
    ApprovalStatus["INVOICE_NOT_PAID"] = "3";
    ApprovalStatus["SPAM_SENDER"] = "4";
    ApprovalStatus["DELAYED"] = "5";
    ApprovalStatus["DELAYED_AND_INITIALLY_ACCESSED"] = "6";
    ApprovalStatus["REGISTRATION_APPROVAL_NEEDED_AND_INITIALLY_ACCESSED"] = "7";
    ApprovalStatus["PAID_SUBSCRIPTION_NEEDED"] = "8";
    ApprovalStatus["INITIAL_PAYMENT_PENDING"] = "9";
    ApprovalStatus["NO_ACTIVITY"] = "10";
})(ApprovalStatus || (ApprovalStatus = {}));
export function getCustomerApprovalStatus(customer) {
    return downcast(customer.approvalStatus);
}
export var SpamRuleType;
(function (SpamRuleType) {
    SpamRuleType["WHITELIST"] = "1";
    SpamRuleType["BLACKLIST"] = "2";
    SpamRuleType["DISCARD"] = "3";
})(SpamRuleType || (SpamRuleType = {}));
export function getSpamRuleType(spamRule) {
    return getAsEnumValue(SpamRuleType, spamRule.type);
}
export function getSpamRuleField(spamRule) {
    return downcast(spamRule.field);
}
export var CustomDomainValidationResult;
(function (CustomDomainValidationResult) {
    CustomDomainValidationResult["CUSTOM_DOMAIN_VALIDATION_RESULT_OK"] = "0";
    CustomDomainValidationResult["CUSTOM_DOMAIN_VALIDATION_RESULT_DNS_LOOKUP_FAILED"] = "1";
    CustomDomainValidationResult["CUSTOM_DOMAIN_VALIDATION_RESULT_DOMAIN_NOT_FOUND"] = "2";
    CustomDomainValidationResult["CUSTOM_DOMAIN_VALIDATION_RESULT_NAMESERVER_NOT_FOUND"] = "3";
    CustomDomainValidationResult["CUSTOM_DOMAIN_VALIDATION_RESULT_DOMAIN_NOT_AVAILABLE"] = "4";
    CustomDomainValidationResult["CUSTOM_DOMAIN_VALIDATION_RESULT_VALIDATION_FAILED"] = "5";
})(CustomDomainValidationResult || (CustomDomainValidationResult = {}));
export var CustomDomainCheckResult;
(function (CustomDomainCheckResult) {
    CustomDomainCheckResult["CUSTOM_DOMAIN_CHECK_RESULT_OK"] = "0";
    CustomDomainCheckResult["CUSTOM_DOMAIN_CHECK_RESULT_DNS_LOOKUP_FAILED"] = "1";
    CustomDomainCheckResult["CUSTOM_DOMAIN_CHECK_RESULT_DOMAIN_NOT_FOUND"] = "2";
    CustomDomainCheckResult["CUSTOM_DOMAIN_CHECK_RESULT_NAMESERVER_NOT_FOUND"] = "3";
})(CustomDomainCheckResult || (CustomDomainCheckResult = {}));
export var SecondFactorType;
(function (SecondFactorType) {
    SecondFactorType["u2f"] = "0";
    SecondFactorType["totp"] = "1";
    SecondFactorType["webauthn"] = "2";
})(SecondFactorType || (SecondFactorType = {}));
export const MAX_ATTACHMENT_SIZE = 1024 * 1024 * 25;
export const MAX_LOGO_SIZE = 1024 * 100;
export const MAX_BASE64_IMAGE_SIZE = MAX_LOGO_SIZE;
export const ALLOWED_IMAGE_FORMATS = ["png", "jpg", "jpeg", "svg"];
// Keep non-const for admin
export var FeatureType;
(function (FeatureType) {
    FeatureType["DisableContacts"] = "0";
    FeatureType["DisableMailExport"] = "1";
    FeatureType["InternalCommunication"] = "2";
    FeatureType["DeleteMailsOnPasswordReset"] = "3";
    FeatureType["WhitelabelParent"] = "4";
    FeatureType["WhitelabelChild"] = "5";
    FeatureType["ReplyOnly"] = "6";
    FeatureType["DisableDefaultSignature"] = "7";
    FeatureType["HideBuyDialogs"] = "8";
    FeatureType["DisableCalendar"] = "9";
    FeatureType["ExternalEmailProvider"] = "10";
    /** This is required for non admin users because they are not allowed to access the bookings. */
    FeatureType["BusinessFeatureEnabled"] = "11";
    FeatureType["AffiliatePartner"] = "12";
    FeatureType["KnowledgeBase"] = "13";
    FeatureType["Newsletter"] = "14";
    FeatureType["Unused15"] = "15";
    FeatureType["Unused16"] = "16";
    FeatureType["MultipleUsers"] = "17";
})(FeatureType || (FeatureType = {}));
export const FULL_INDEXED_TIMESTAMP = 0;
export const NOTHING_INDEXED_TIMESTAMP = Math.pow(2, 42) - 1; // maximum Timestamp is 42 bit long (see GeneratedIdData.java)
export const ENTITY_EVENT_BATCH_TTL_DAYS = 45; // 45 days (see InstanceDbMapperEventNotifier.java)
export function getCertificateType(certificateInfo) {
    return downcast(certificateInfo.type);
}
export var RepeatPeriod;
(function (RepeatPeriod) {
    RepeatPeriod["DAILY"] = "0";
    RepeatPeriod["WEEKLY"] = "1";
    RepeatPeriod["MONTHLY"] = "2";
    RepeatPeriod["ANNUALLY"] = "3";
})(RepeatPeriod || (RepeatPeriod = {}));
export const defaultCalendarColor = "2196f3";
export function getWeekStart(userSettings) {
    return downcast(userSettings.startOfTheWeek);
}
export const SECOND_MS = 1000;
export var CounterType;
(function (CounterType) {
    CounterType["Default"] = "0";
    CounterType["Signup"] = "1";
    CounterType["UnreadMails"] = "2";
    CounterType["UserStorageLegacy"] = "3";
    CounterType["GroupStorageLegacy"] = "4";
    CounterType["UserStorage"] = "5";
    CounterType["GroupStorage"] = "6";
})(CounterType || (CounterType = {}));
export const CounterTypeToName = reverse(CounterType);
// The 'code' for the keys is KeyboardEvent.key
export const Keys = Object.freeze({
    NONE: {
        code: "",
        name: "",
    },
    RETURN: {
        code: "enter",
        name: "⏎",
    },
    BACKSPACE: {
        code: "backspace",
        name: "BACKSPACE",
    },
    TAB: {
        code: "tab",
        name: "↹",
    },
    SHIFT: {
        code: "shift",
        name: "⇧",
    },
    CTRL: {
        code: "control",
        name: "CTRL",
    },
    ALT: {
        code: "alt",
        name: "ALT",
    },
    META: {
        code: "meta",
        name: "\u2318",
    },
    // command key (left) (OSX)
    ESC: {
        code: "escape",
        name: "ESC",
    },
    SPACE: {
        code: " ",
        name: "Space",
    },
    PAGE_UP: {
        code: "pageup",
        name: "Page ↑",
    },
    PAGE_DOWN: {
        code: "pagedown",
        name: "Page ↓",
    },
    END: {
        code: "end",
        name: "End",
    },
    HOME: {
        code: "home",
        name: "Home",
    },
    LEFT: {
        code: "arrowleft",
        name: "←",
    },
    UP: {
        code: "arrowup",
        name: "↑",
    },
    RIGHT: {
        code: "arrowright",
        name: "→",
    },
    DOWN: {
        code: "arrowdown",
        name: "↓",
    },
    DELETE: {
        code: "delete",
        name: "DEL",
    },
    "0": {
        code: "0",
        name: "0",
    },
    ONE: {
        code: "1",
        name: "1",
    },
    TWO: {
        code: "2",
        name: "2",
    },
    THREE: {
        code: "3",
        name: "3",
    },
    FOUR: {
        code: "4",
        name: "4",
    },
    FIVE: {
        code: "5",
        name: "5",
    },
    SIX: {
        code: "6",
        name: "6",
    },
    A: {
        code: "a",
        name: "A",
    },
    B: {
        code: "b",
        name: "B",
    },
    C: {
        code: "c",
        name: "C",
    },
    D: {
        code: "d",
        name: "D",
    },
    E: {
        code: "e",
        name: "E",
    },
    F: {
        code: "f",
        name: "F",
    },
    H: {
        code: "h",
        name: "H",
    },
    I: {
        code: "i",
        name: "I",
    },
    J: {
        code: "j",
        name: "J",
    },
    K: {
        code: "k",
        name: "K",
    },
    L: {
        code: "l",
        name: "L",
    },
    M: {
        code: "m",
        name: "M",
    },
    N: {
        code: "n",
        name: "N",
    },
    O: {
        code: "o",
        name: "O",
    },
    P: {
        code: "p",
        name: "P",
    },
    Q: {
        code: "q",
        name: "Q",
    },
    R: {
        code: "r",
        name: "R",
    },
    S: {
        code: "s",
        name: "S",
    },
    T: {
        code: "t",
        name: "T",
    },
    U: {
        code: "u",
        name: "U",
    },
    V: {
        code: "v",
        name: "V",
    },
    F1: {
        code: "f1",
        name: "F1",
    },
    F5: {
        code: "f5",
        name: "F5",
    },
    F11: {
        code: "f11",
        name: "F11",
    },
    F12: {
        code: "f12",
        name: "F12",
    },
});
// Keep non-const for admin
export var ReportedMailFieldType;
(function (ReportedMailFieldType) {
    /**
     * From header address, authenticated.
     */
    ReportedMailFieldType["FROM_ADDRESS"] = "0";
    /**
     * From header address, not authenticated with DMARC.
     */
    ReportedMailFieldType["FROM_ADDRESS_NON_AUTH"] = "1";
    /**
     * From header address domain
     */
    ReportedMailFieldType["FROM_DOMAIN"] = "2";
    /**
     * From header address domain, not authenticated not authenticated with DMARC.
     */
    ReportedMailFieldType["FROM_DOMAIN_NON_AUTH"] = "3";
    /**
     * Email subject
     */
    ReportedMailFieldType["SUBJECT"] = "4";
    /**
     * Link in the body of email
     */
    ReportedMailFieldType["LINK"] = "5";
    /**
     * Domain of the link in the body
     */
    ReportedMailFieldType["LINK_DOMAIN"] = "6";
})(ReportedMailFieldType || (ReportedMailFieldType = {}));
// Keep non-const for admin
export var MailAuthenticationStatus;
(function (MailAuthenticationStatus) {
    /**
     * Disposition: None. All checks have passed.
     */
    MailAuthenticationStatus["AUTHENTICATED"] = "0";
    /**
     * Authentication has failed because of the domain policy or because of the SPF.
     */
    MailAuthenticationStatus["HARD_FAIL"] = "1";
    /**
     * Authentication has failed because of our own policy, most commonly authentication is "missing".
     */
    MailAuthenticationStatus["SOFT_FAIL"] = "2";
    /**
     * Authentication has failed because From header is not valid so we couldn't do authentication checks.
     */
    MailAuthenticationStatus["INVALID_MAIL_FROM"] = "3";
    /**
     * Authentication has failed because From header is missing. Most likely it is some technical message like bounce mail.
     */
    MailAuthenticationStatus["MISSING_MAIL_FROM"] = "4";
})(MailAuthenticationStatus || (MailAuthenticationStatus = {}));
/**
 * The status of the authentication when decrypting an end-to-end encrypted message.
 * Authentication was only introduced when switching to PQ.
 */
export var EncryptionAuthStatus;
(function (EncryptionAuthStatus) {
    /** the entity was encrypted with RSA, it had no authentication*/
    EncryptionAuthStatus["RSA_NO_AUTHENTICATION"] = "0";
    /** the entity was encrypted with tuta-crypt and authentication succeeded */
    EncryptionAuthStatus["TUTACRYPT_AUTHENTICATION_SUCCEEDED"] = "1";
    /** the entity was encrypted with tuta-crypt and authentication failed */
    EncryptionAuthStatus["TUTACRYPT_AUTHENTICATION_FAILED"] = "2";
    /** the entity was encrypted symmetrically, with AES, it had no authentication, e.g. secure external mailboxes */
    EncryptionAuthStatus["AES_NO_AUTHENTICATION"] = "3";
    /** the entity was sent by us encrypted with TutaCrypt, so it is authenticated */
    EncryptionAuthStatus["TUTACRYPT_SENDER"] = "4";
    /** the entity was encrypted with RSA although TutaCrypt keys were available */
    EncryptionAuthStatus["RSA_DESPITE_TUTACRYPT"] = "5";
})(EncryptionAuthStatus || (EncryptionAuthStatus = {}));
export var CalendarAttendeeStatus;
(function (CalendarAttendeeStatus) {
    /** invite is not sent yet */
    CalendarAttendeeStatus["ADDED"] = "0";
    /** already invited but did not respond */
    CalendarAttendeeStatus["NEEDS_ACTION"] = "1";
    CalendarAttendeeStatus["ACCEPTED"] = "2";
    CalendarAttendeeStatus["DECLINED"] = "3";
    CalendarAttendeeStatus["TENTATIVE"] = "4";
})(CalendarAttendeeStatus || (CalendarAttendeeStatus = {}));
export function getAttendeeStatus(attendee) {
    return downcast(attendee.status);
}
export var CalendarMethod;
(function (CalendarMethod) {
    CalendarMethod["PUBLISH"] = "PUBLISH";
    CalendarMethod["REQUEST"] = "REQUEST";
    CalendarMethod["REPLY"] = "REPLY";
    CalendarMethod["ADD"] = "ADD";
    CalendarMethod["CANCEL"] = "CANCEL";
    CalendarMethod["REFRESH"] = "REFRESH";
    CalendarMethod["COUNTER"] = "COUNTER";
    CalendarMethod["DECLINECOUNTER"] = "DECLINECOUNTER";
})(CalendarMethod || (CalendarMethod = {}));
export function mailMethodToCalendarMethod(mailMethod) {
    switch (mailMethod) {
        case "1" /* MailMethod.ICAL_PUBLISH */:
            return CalendarMethod.PUBLISH;
        case "2" /* MailMethod.ICAL_REQUEST */:
            return CalendarMethod.REQUEST;
        case "3" /* MailMethod.ICAL_REPLY */:
            return CalendarMethod.REPLY;
        case "4" /* MailMethod.ICAL_ADD */:
            return CalendarMethod.ADD;
        case "5" /* MailMethod.ICAL_CANCEL */:
            return CalendarMethod.CANCEL;
        case "6" /* MailMethod.ICAL_REFRESH */:
            return CalendarMethod.REFRESH;
        case "7" /* MailMethod.ICAL_COUNTER */:
            return CalendarMethod.COUNTER;
        case "8" /* MailMethod.ICAL_DECLINECOUNTER */:
            return CalendarMethod.DECLINECOUNTER;
        default:
            throw new ProgrammingError("Unhandled MailMethod: " + mailMethod);
    }
}
export function getAsEnumValue(enumValues, value) {
    for (const key of Object.getOwnPropertyNames(enumValues)) {
        // @ts-ignore
        const enumValue = enumValues[key];
        if (enumValue === value) {
            return enumValue;
        }
    }
    return null;
}
export function assertEnumValue(enumValues, value) {
    for (const key of Object.getOwnPropertyNames(enumValues)) {
        // @ts-ignore
        const enumValue = enumValues[key];
        if (enumValue === value) {
            return enumValue;
        }
    }
    throw new Error(`Invalid enum value ${value} for ${JSON.stringify(enumValues)}`);
}
export function assertEnumKey(obj, key) {
    if (key in obj) {
        return downcast(key);
    }
    else {
        throw Error("Not valid enum value: " + key);
    }
}
export function getClientType() {
    return isApp() ? "2" /* ClientType.App */ : isElectronClient() ? "1" /* ClientType.Desktop */ : "0" /* ClientType.Browser */;
}
export var UsageTestState;
(function (UsageTestState) {
    UsageTestState["Created"] = "0";
    UsageTestState["Live"] = "1";
    UsageTestState["Paused"] = "2";
    UsageTestState["Finished"] = "3";
})(UsageTestState || (UsageTestState = {}));
export const UsageTestStateToName = reverse(UsageTestState);
export var UsageTestMetricType;
(function (UsageTestMetricType) {
    UsageTestMetricType["Number"] = "0";
    UsageTestMetricType["Enum"] = "1";
    UsageTestMetricType["Likert"] = "2";
})(UsageTestMetricType || (UsageTestMetricType = {}));
export const UsageTestMetricTypeToName = reverse(UsageTestMetricType);
export const OFFLINE_STORAGE_DEFAULT_TIME_RANGE_DAYS = 31;
export var UsageTestParticipationMode;
(function (UsageTestParticipationMode) {
    UsageTestParticipationMode["Once"] = "0";
    UsageTestParticipationMode["Unlimited"] = "1";
})(UsageTestParticipationMode || (UsageTestParticipationMode = {}));
export const UsageTestParticipationModeToName = reverse(UsageTestParticipationMode);
export var TerminationPeriodOptions;
(function (TerminationPeriodOptions) {
    TerminationPeriodOptions["EndOfCurrentPeriod"] = "0";
    TerminationPeriodOptions["FutureDate"] = "1";
})(TerminationPeriodOptions || (TerminationPeriodOptions = {}));
/**
 * Convert the input to KdfType.
 *
 * This actually returns the input without modifying it, as it wraps around TypeScript's 'as' operator, but
 * it also does a runtime check, guaranteeing that the input is truly a KdfType.
 *
 * @param maybe kdf type
 * @return `maybe` as KdfType
 * @throws Error if the input doesn't correspond to a KdfType
 */
export function asKdfType(maybe) {
    if (Object.values(KdfType).includes(maybe)) {
        return maybe;
    }
    throw new Error("bad kdf type");
}
export var CryptoProtocolVersion;
(function (CryptoProtocolVersion) {
    CryptoProtocolVersion["RSA"] = "0";
    CryptoProtocolVersion["SYMMETRIC_ENCRYPTION"] = "1";
    CryptoProtocolVersion["TUTA_CRYPT"] = "2";
})(CryptoProtocolVersion || (CryptoProtocolVersion = {}));
export function asCryptoProtoocolVersion(maybe) {
    if (Object.values(CryptoProtocolVersion).includes(maybe)) {
        return maybe;
    }
    throw new Error("bad protocol version");
}
export var GroupKeyRotationType;
(function (GroupKeyRotationType) {
    GroupKeyRotationType["User"] = "0";
    GroupKeyRotationType["AdminGroupKeyRotationSingleUserAccount"] = "1";
    GroupKeyRotationType["Team"] = "2";
    GroupKeyRotationType["UserArea"] = "3";
    GroupKeyRotationType["Customer"] = "4";
    GroupKeyRotationType["AdminGroupKeyRotationMultipleUserAccount"] = "5";
    GroupKeyRotationType["AdminGroupKeyRotationMultipleAdminAccount"] = "6";
})(GroupKeyRotationType || (GroupKeyRotationType = {}));
export const GroupKeyRotationTypeNameByCode = reverse(GroupKeyRotationType);
export const EXTERNAL_CALENDAR_SYNC_INTERVAL = 60 * 30 * 1000; // 30 minutes
export const DEFAULT_ERROR = "defaultError";
export var PublicKeyIdentifierType;
(function (PublicKeyIdentifierType) {
    PublicKeyIdentifierType["MAIL_ADDRESS"] = "0";
    PublicKeyIdentifierType["GROUP_ID"] = "1";
    PublicKeyIdentifierType["KEY_ROTATION_ID"] = "2";
})(PublicKeyIdentifierType || (PublicKeyIdentifierType = {}));
export var BlobAccessTokenKind;
(function (BlobAccessTokenKind) {
    BlobAccessTokenKind["Archive"] = "0";
    BlobAccessTokenKind["Instances"] = "1";
})(BlobAccessTokenKind || (BlobAccessTokenKind = {}));
export function asPublicKeyIdentifier(maybe) {
    if (Object.values(PublicKeyIdentifierType).includes(maybe)) {
        return maybe;
    }
    throw new Error("bad key identifier type");
}
export const CLIENT_ONLY_CALENDAR_BIRTHDAYS_BASE_ID = "clientOnly_birthdays";
export const CLIENT_ONLY_CALENDARS = new Map([[CLIENT_ONLY_CALENDAR_BIRTHDAYS_BASE_ID, "birthdayCalendar_label"]]);
export const DEFAULT_CLIENT_ONLY_CALENDAR_COLORS = new Map([[CLIENT_ONLY_CALENDAR_BIRTHDAYS_BASE_ID, "FF9933"]]);
export const MAX_LABELS_PER_MAIL = 5;
//# sourceMappingURL=TutanotaConstants.js.map