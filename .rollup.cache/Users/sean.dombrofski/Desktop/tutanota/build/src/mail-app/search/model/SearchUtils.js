import m from "mithril";
import { assertNotNull, base64ToBase64Url, base64UrlToBase64, decodeBase64, filterInt, getDayShifted, getEndOfDay, getStartOfDay, incrementMonth, isSameTypeRef, stringToBase64, } from "@tutao/tutanota-utils";
import { throttleRoute } from "../../../common/misc/RouteChange";
import { assertMainOrNode } from "../../../common/api/common/Env";
import { CalendarEventTypeRef, ContactTypeRef, MailTypeRef } from "../../../common/api/entities/tutanota/TypeRefs";
import { typeModels } from "../../../common/api/entities/tutanota/TypeModels.js";
import { locator } from "../../../common/api/main/CommonLocator.js";
import { getElementId, LEGACY_BCC_RECIPIENTS_ID, LEGACY_BODY_ID, LEGACY_CC_RECIPIENTS_ID, LEGACY_TO_RECIPIENTS_ID, } from "../../../common/api/common/utils/EntityUtils.js";
assertMainOrNode();
const FIXED_FREE_SEARCH_DAYS = 28;
const SEARCH_CATEGORIES = [
    {
        name: "mail" /* SearchCategoryTypes.mail */,
        typeRef: MailTypeRef,
    },
    {
        name: "contact" /* SearchCategoryTypes.contact */,
        typeRef: ContactTypeRef,
    },
    {
        name: "calendar" /* SearchCategoryTypes.calendar */,
        typeRef: CalendarEventTypeRef,
    },
];
/** get the TypeRef that corresponds to the selected category (as taken from the URL: <host>/search/<category>?<query> */
export function getSearchType(category) {
    return assertNotNull(SEARCH_CATEGORIES.find((c) => c.name === category)).typeRef;
}
export const SEARCH_MAIL_FIELDS = [
    {
        textId: "all_label",
        field: null,
        attributeIds: null,
    },
    {
        textId: "subject_label",
        field: "subject",
        attributeIds: [typeModels.Mail.values["subject"].id],
    },
    {
        textId: "mailBody_label",
        field: "body",
        attributeIds: [LEGACY_BODY_ID /** id of the legacy typeModels.Mail.associations["body"] */],
    },
    {
        textId: "from_label",
        field: "from",
        attributeIds: [typeModels.Mail.associations["sender"].id],
    },
    {
        textId: "to_label",
        field: "to",
        attributeIds: [
            LEGACY_TO_RECIPIENTS_ID /** id of the legacy Mail.toRecipients */,
            LEGACY_CC_RECIPIENTS_ID /** id of the legacy Mail.ccRecipients */,
            LEGACY_BCC_RECIPIENTS_ID /** id of the legacy Mail.bccRecipients */,
        ],
    },
    {
        textId: "attachmentName_label",
        field: "attachment",
        attributeIds: [typeModels.Mail.associations["attachments"].id],
    },
];
const routeSetThrottled = throttleRoute();
export function setSearchUrl(url) {
    if (url !== m.route.get()) {
        routeSetThrottled(url, {});
    }
}
export function searchCategoryForRestriction(restriction) {
    return assertNotNull(SEARCH_CATEGORIES.find((c) => isSameTypeRef(c.typeRef, restriction.type))).name;
}
// Gets the resulting URL if the output of `getSearchParameters()` was routed to
export function getSearchUrl(query, restriction, selectionKey = null) {
    const { path, params } = getSearchParameters(query, restriction, selectionKey);
    return m.buildPathname(path, params);
}
export function getSearchParameters(query, restriction, selectionKey) {
    const category = searchCategoryForRestriction(restriction);
    const params = {
        query: query ?? "",
        category,
    };
    // a bit annoying but avoids putting unnecessary things into the url (if we would put undefined into it)
    if (restriction.start) {
        params.start = restriction.start;
    }
    if (restriction.end) {
        params.end = restriction.end;
    }
    if (restriction.folderIds.length > 0) {
        params.folder = restriction.folderIds;
    }
    if (restriction.field) {
        params.field = restriction.field;
    }
    if (restriction.eventSeries != null) {
        params.eventSeries = String(restriction.eventSeries);
    }
    return {
        path: "/search/:category" + (selectionKey ? "/" + selectionKey : ""),
        params: params,
    };
}
export function getFreeSearchStartDate() {
    return getStartOfDay(getDayShifted(new Date(), -FIXED_FREE_SEARCH_DAYS));
}
/**
 * Adjusts the restriction according to the account type if necessary
 */
export function createRestriction(searchCategory, start, end, field, folderIds, eventSeries) {
    if (locator.logins.getUserController().isFreeAccount() && searchCategory === "mail" /* SearchCategoryTypes.mail */) {
        start = null;
        end = getFreeSearchStartDate().getTime();
        field = null;
        folderIds = [];
        eventSeries = null;
    }
    let r = {
        type: getSearchType(searchCategory),
        start: start,
        end: end,
        field: null,
        attributeIds: null,
        folderIds,
        eventSeries,
    };
    if (!field) {
        return r;
    }
    if (searchCategory === "mail" /* SearchCategoryTypes.mail */) {
        let fieldData = SEARCH_MAIL_FIELDS.find((f) => f.field === field);
        if (fieldData) {
            r.field = field;
            r.attributeIds = fieldData.attributeIds;
        }
    }
    else if (searchCategory === "contact" /* SearchCategoryTypes.contact */) {
        // nothing to do, the calendar restriction was completely set up already.
    }
    else if (searchCategory === "calendar" /* SearchCategoryTypes.calendar */) {
        if (field === "recipient") {
            r.field = field;
            r.attributeIds = [
                typeModels.Contact.values["firstName"].id,
                typeModels.Contact.values["lastName"].id,
                typeModels.Contact.associations["mailAddresses"].id,
            ];
        }
        else if (field === "mailAddress") {
            r.field = field;
            r.attributeIds = [typeModels.Contact.associations["mailAddresses"].id];
        }
    }
    return r;
}
/**
 * Adjusts the restriction according to the account type if necessary
 */
export function getRestriction(route) {
    let category;
    let start = null;
    let end = null;
    let field = null;
    let folderIds = [];
    let eventSeries = null;
    if (route.startsWith("/mail") || route.startsWith("/search/mail")) {
        category = "mail" /* SearchCategoryTypes.mail */;
        if (route.startsWith("/search/mail")) {
            try {
                // mithril will parse boolean but not numbers
                const { params } = m.parsePathname(route);
                if (typeof params["start"] === "string") {
                    start = filterInt(params["start"]);
                }
                if (typeof params["end"] === "string") {
                    end = filterInt(params["end"]);
                }
                if (typeof params["field"] === "string") {
                    const fieldString = params["field"];
                    field = SEARCH_MAIL_FIELDS.find((f) => f.field === fieldString)?.field ?? null;
                }
                if (Array.isArray(params["folder"])) {
                    folderIds = params["folder"];
                }
            }
            catch (e) {
                console.log("invalid query: " + route, e);
            }
        }
    }
    else if (route.startsWith("/contact") || route.startsWith("/search/contact")) {
        category = "contact" /* SearchCategoryTypes.contact */;
    }
    else if (route.startsWith("/calendar") || route.startsWith("/search/calendar")) {
        const { params } = m.parsePathname(route);
        try {
            if (typeof params["eventSeries"] === "boolean") {
                eventSeries = params["eventSeries"];
            }
            if (typeof params["start"] === "string") {
                start = filterInt(params["start"]);
            }
            if (typeof params["end"] === "string") {
                end = filterInt(params["end"]);
            }
            const folder = params["folder"];
            if (Array.isArray(folder)) {
                folderIds = folder;
            }
        }
        catch (e) {
            console.log("invalid query: " + route, e);
        }
        category = "calendar" /* SearchCategoryTypes.calendar */;
        if (start == null || locator.logins.getUserController().isFreeAccount()) {
            const now = new Date();
            now.setDate(1);
            start = getStartOfDay(now).getTime();
        }
        if (end == null || locator.logins.getUserController().isFreeAccount()) {
            const endDate = incrementMonth(new Date(start), 3);
            endDate.setDate(0);
            end = getEndOfDay(endDate).getTime();
        }
    }
    else {
        throw new Error("invalid type " + route);
    }
    return createRestriction(category, start, end, field, folderIds, eventSeries);
}
export function decodeCalendarSearchKey(searchKey) {
    return JSON.parse(decodeBase64("utf-8", base64UrlToBase64(searchKey)));
}
export function encodeCalendarSearchKey(event) {
    const eventStartTime = event.startTime.getTime();
    return base64ToBase64Url(stringToBase64(JSON.stringify({ start: eventStartTime, id: getElementId(event) })));
}
//# sourceMappingURL=SearchUtils.js.map