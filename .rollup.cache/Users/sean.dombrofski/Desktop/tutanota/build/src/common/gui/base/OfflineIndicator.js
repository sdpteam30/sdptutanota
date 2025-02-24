import m from "mithril";
import { isSameDayOfDate, noOp } from "@tutao/tutanota-utils";
import { lang } from "../../misc/LanguageViewModel";
/**
 * the first line of the offline indicator shows if we're offline or online and
 * adds action prompts (if any)
 * it's returned as a span so the consumer can decide how to layout it.
 */
function attrToFirstLine(attr) {
    const { state } = attr;
    switch (state) {
        case 3 /* OfflineIndicatorState.Online */:
        case 2 /* OfflineIndicatorState.Synchronizing */:
            return m("span", lang.get("online_label"));
        case 0 /* OfflineIndicatorState.Offline */:
            return m("span", [lang.get("offline_label"), m("span.b.content-accent-fg.mlr-s", lang.get("reconnect_action"))]);
        case 1 /* OfflineIndicatorState.Connecting */:
            return m("span", lang.get("offline_label"));
    }
}
/**
 * the second line provides additional information about the current state.
 * it's returned as a span so the consumer can decide how to layout it.
 */
function attrToSecondLine(a) {
    switch (a.state) {
        case 3 /* OfflineIndicatorState.Online */:
            return m("span", lang.get("upToDate_label"));
        case 0 /* OfflineIndicatorState.Offline */:
            if (a.lastUpdate) {
                return m("span", lang.get("lastSync_label", { "{date}": formatDate(a.lastUpdate) }));
            }
            else {
                // never synced, don't show last sync label
                return null;
            }
        case 2 /* OfflineIndicatorState.Synchronizing */:
            return m("span", lang.get("synchronizing_label", { "{progress}": formatPercentage(a.progress) }));
        case 1 /* OfflineIndicatorState.Connecting */:
            return m("span", lang.get("reconnecting_label"));
    }
}
/**
 * format a number as a percentage string with 0 = 0% and 1 = 100%
 */
function formatPercentage(percentage) {
    return `${Math.round(percentage * 100)}%`;
}
/*
 * format a date either as a time without date (if it's today) or
 * as a date without time
 */
function formatDate(date) {
    return isSameDayOfDate(new Date(), date) ? lang.formats.time.format(date) : lang.formats.simpleDate.format(date);
}
export class OfflineIndicator {
    view(vnode) {
        const a = vnode.attrs;
        const isOffline = a.state === 0 /* OfflineIndicatorState.Offline */;
        return m("button.small", {
            class: a.isSingleColumn ? "center mb-xs" : "mlr-l flex col",
            type: "button",
            href: "#",
            tabindex: "0",
            role: "button",
            "aria-disabled": !isOffline,
            onclick: isOffline ? a.reconnectAction : noOp,
        }, a.isSingleColumn ? attrToFirstLine(a) : [attrToFirstLine(a), attrToSecondLine(a)]);
    }
}
//# sourceMappingURL=OfflineIndicator.js.map