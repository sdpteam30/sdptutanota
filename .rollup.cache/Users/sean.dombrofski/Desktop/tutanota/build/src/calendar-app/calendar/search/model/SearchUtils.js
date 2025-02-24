import m from "mithril";
import { base64ToBase64Url, base64UrlToBase64, decodeBase64, filterInt, getEndOfDay, getStartOfDay, incrementMonth, stringToBase64, } from "@tutao/tutanota-utils";
import { throttleRoute } from "../../../../common/misc/RouteChange";
import { assertMainOrNode } from "../../../../common/api/common/Env";
import { CalendarEventTypeRef } from "../../../../common/api/entities/tutanota/TypeRefs";
import { getElementId } from "../../../../common/api/common/utils/EntityUtils.js";
assertMainOrNode();
const FIXED_FREE_SEARCH_DAYS = 28;
const routeSetThrottled = throttleRoute();
export function setSearchUrl(url) {
    if (url !== m.route.get()) {
        routeSetThrottled(url, {});
    }
}
export function getSearchUrl(query, restriction, selectionKey) {
    const params = {
        query: query ?? "",
        category: "calendar" /* SearchCategoryTypes.calendar */,
    };
    // a bit annoying but avoids putting unnecessary things into the url (if we woudl put undefined into it)
    if (restriction.start) {
        params.start = restriction.start;
    }
    if (restriction.end) {
        params.end = restriction.end;
    }
    if (restriction.folderIds.length > 0) {
        params.folder = restriction.folderIds;
    }
    if (restriction.eventSeries != null) {
        params.eventSeries = String(restriction.eventSeries);
    }
    return {
        path: "/search/:category" + (selectionKey ? "/" + selectionKey : ""),
        params: params,
    };
}
/**
 * Adjusts the restriction according to the account type if necessary
 */
export function createRestriction(start, end, folderIds, eventSeries) {
    return {
        type: CalendarEventTypeRef,
        start: start,
        end: end,
        field: null,
        attributeIds: null,
        folderIds,
        eventSeries,
    };
}
/**
 * Adjusts the restriction according to the account type if necessary
 */
export function getRestriction(route) {
    let start = null;
    let end = null;
    let folderIds = [];
    let eventSeries = true;
    if (route.startsWith("/calendar") || route.startsWith("/search/calendar")) {
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
        if (start == null) {
            const now = new Date();
            now.setDate(1);
            start = getStartOfDay(now).getTime();
        }
        if (end == null) {
            const endDate = incrementMonth(new Date(start), 3);
            endDate.setDate(0);
            end = getEndOfDay(endDate).getTime();
        }
    }
    else {
        throw new Error("invalid type " + route);
    }
    return createRestriction(start, end, folderIds, eventSeries);
}
export function decodeCalendarSearchKey(searchKey) {
    return JSON.parse(decodeBase64("utf-8", base64UrlToBase64(searchKey)));
}
export function encodeCalendarSearchKey(event) {
    const eventStartTime = event.startTime.getTime();
    return base64ToBase64Url(stringToBase64(JSON.stringify({ start: eventStartTime, id: getElementId(event) })));
}
//# sourceMappingURL=SearchUtils.js.map