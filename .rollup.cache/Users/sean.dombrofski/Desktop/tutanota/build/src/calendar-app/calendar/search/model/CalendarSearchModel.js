import stream from "mithril/stream";
import { arrayEquals, assertNonNull, assertNotNull, incrementMonth, isSameTypeRef, tokenize } from "@tutao/tutanota-utils";
import { assertMainOrNode } from "../../../../common/api/common/Env";
import { listIdPart } from "../../../../common/api/common/utils/EntityUtils.js";
assertMainOrNode();
export class CalendarSearchModel {
    calendarModel;
    result;
    // we store this as a reference to the currently running search. if we don't, we only have the last result's query info
    // to compare against incoming new queries
    lastQueryString;
    lastQuery;
    lastSearchPromise;
    cancelSignal;
    constructor(calendarModel) {
        this.calendarModel = calendarModel;
        this.result = stream();
        this.lastQueryString = stream("");
        this.lastQuery = null;
        this.lastSearchPromise = Promise.resolve();
        this.cancelSignal = stream(false);
    }
    async search(searchQuery, progressTracker) {
        if (this.lastQuery && searchQueryEquals(searchQuery, this.lastQuery)) {
            return this.lastSearchPromise;
        }
        this.lastQuery = searchQuery;
        const { query, restriction, minSuggestionCount, maxResults } = searchQuery;
        this.lastQueryString(query);
        let result = this.result();
        if (result && !isSameTypeRef(restriction.type, result.restriction.type)) {
            // reset the result in case only the search type has changed
            this.result(null);
        }
        if (query.trim() === "") {
            // if there was an empty query, just send empty result
            const result = {
                query: query,
                restriction: restriction,
                results: [],
                currentIndexTimestamp: 0,
                lastReadSearchIndexRow: [],
                maxResults: 0,
                matchWordOrder: false,
                moreResults: [],
                moreResultsEntries: [],
            };
            this.result(result);
            this.lastSearchPromise = Promise.resolve(result);
        }
        else {
            // we interpret restriction.start as the start of the first day of the first month we want to search
            // restriction.end is the end of the last day of the last month we want to search
            let currentDate = new Date(assertNotNull(restriction.start));
            const endDate = new Date(assertNotNull(restriction.end));
            const calendarModel = await this.calendarModel();
            const daysInMonths = [];
            while (currentDate.getTime() <= endDate.getTime()) {
                daysInMonths.push(currentDate);
                currentDate = incrementMonth(currentDate, 1);
            }
            const calendarResult = {
                // index related, keep empty
                currentIndexTimestamp: 0,
                moreResults: [],
                moreResultsEntries: [],
                lastReadSearchIndexRow: [],
                // data that is relevant to calendar search
                matchWordOrder: false,
                restriction,
                results: [],
                query,
            };
            const monitorHandle = progressTracker.registerMonitorSync(daysInMonths.length);
            const monitor = assertNotNull(progressTracker.getMonitor(monitorHandle));
            if (this.cancelSignal()) {
                this.result(calendarResult);
                this.lastSearchPromise = Promise.resolve(calendarResult);
                return this.lastSearchPromise;
            }
            const hasNewPaidPlan = await calendarModel.canLoadBirthdaysCalendar();
            if (hasNewPaidPlan) {
                await calendarModel.loadContactsBirthdays();
            }
            await calendarModel.loadMonthsIfNeeded(daysInMonths, monitor, this.cancelSignal);
            monitor.completed();
            const eventsForDays = calendarModel.getEventsForMonths()();
            assertNonNull(restriction.start);
            assertNonNull(restriction.end);
            const tokens = tokenize(query.trim());
            // we want event instances that occur on multiple days to only appear once, but want
            // separate instances of event series to occur on their own.
            const alreadyAdded = new Set();
            if (this.cancelSignal()) {
                this.result(calendarResult);
                this.lastSearchPromise = Promise.resolve(calendarResult);
                return this.lastSearchPromise;
            }
            const followCommonRestrictions = (key, event) => {
                if (alreadyAdded.has(key)) {
                    // we only need the first event in the series, the view will load & then generate
                    // the series for the searched time range.
                    return false;
                }
                if (restriction.folderIds.length > 0 && !restriction.folderIds.includes(listIdPart(event._id))) {
                    // check that the event is in the searched calendar.
                    return false;
                }
                if (restriction.eventSeries === false && event.repeatRule != null) {
                    // applied "repeating" search filter
                    return false;
                }
                return true;
            };
            if (tokens.length > 0) {
                // we're iterating by event first to only have to sanitize the description once.
                // that's a smaller savings than one might think because for the vast majority of
                // events we're probably not matching and looking into the description anyway.
                for (const [startOfDay, eventsOnDay] of eventsForDays) {
                    eventLoop: for (const event of eventsOnDay) {
                        if (!(startOfDay >= restriction.start && startOfDay <= restriction.end)) {
                            continue;
                        }
                        const key = idToKey(event._id);
                        if (!followCommonRestrictions(key, event)) {
                            continue;
                        }
                        for (const token of tokens) {
                            if (event.summary.toLowerCase().includes(token)) {
                                alreadyAdded.add(key);
                                calendarResult.results.push(event._id);
                                continue eventLoop;
                            }
                        }
                        // checking the summary was cheap, now we store the sanitized description to check it against
                        // all tokens.
                        const descriptionToSearch = event.description.replaceAll(/(<[^>]+>)/gi, " ").toLowerCase();
                        for (const token of tokens) {
                            if (descriptionToSearch.includes(token)) {
                                alreadyAdded.add(key);
                                calendarResult.results.push(event._id);
                                continue eventLoop;
                            }
                        }
                        if (this.cancelSignal()) {
                            this.result(calendarResult);
                            this.lastSearchPromise = Promise.resolve(calendarResult);
                            return this.lastSearchPromise;
                        }
                    }
                }
                const startDate = new Date(restriction.start);
                const endDate = new Date(restriction.end);
                if (hasNewPaidPlan) {
                    const birthdayEvents = Array.from(calendarModel.getBirthdayEvents().values()).flat();
                    eventLoop: for (const eventRegistry of birthdayEvents) {
                        // Birthdays should still appear on search even if the date itself doesn't comply to the whole restriction
                        // we only care about months
                        const month = eventRegistry.event.startTime.getMonth();
                        if (!(month >= startDate.getMonth() && month <= endDate.getMonth())) {
                            continue;
                        }
                        const key = idToKey(eventRegistry.event._id);
                        if (!followCommonRestrictions(key, eventRegistry.event)) {
                            continue;
                        }
                        for (const token of tokens) {
                            if (eventRegistry.event.summary.toLowerCase().includes(token)) {
                                alreadyAdded.add(key);
                                calendarResult.results.push(eventRegistry.event._id);
                                continue eventLoop;
                            }
                        }
                        if (this.cancelSignal()) {
                            this.result(calendarResult);
                            this.lastSearchPromise = Promise.resolve(calendarResult);
                            return this.lastSearchPromise;
                        }
                    }
                }
            }
            this.result(calendarResult);
            this.lastSearchPromise = Promise.resolve(calendarResult);
        }
        return this.lastSearchPromise;
    }
    isNewSearch(query, restriction) {
        let isNew = false;
        let lastQuery = this.lastQuery;
        if (lastQuery == null) {
            isNew = true;
        }
        else if (lastQuery.query !== query) {
            isNew = true;
        }
        else if (lastQuery.restriction !== restriction) {
            // both are the same instance
            isNew = !isSameSearchRestriction(restriction, lastQuery.restriction);
        }
        if (isNew)
            this.sendCancelSignal();
        return isNew;
    }
    sendCancelSignal() {
        this.cancelSignal(true);
        this.cancelSignal.end(true);
        this.cancelSignal = stream(false);
    }
}
function idToKey(id) {
    return id.join("/");
}
function searchQueryEquals(a, b) {
    return (a.query === b.query &&
        isSameSearchRestriction(a.restriction, b.restriction) &&
        a.minSuggestionCount === b.minSuggestionCount &&
        a.maxResults === b.maxResults);
}
export function isSameSearchRestriction(a, b) {
    const isSameAttributeIds = a.attributeIds === b.attributeIds || (!!a.attributeIds && !!b.attributeIds && arrayEquals(a.attributeIds, b.attributeIds));
    return (isSameTypeRef(a.type, b.type) &&
        a.start === b.start &&
        a.end === b.end &&
        isSameAttributeIds &&
        (a.eventSeries === b.eventSeries || (a.eventSeries === null && b.eventSeries === true) || (a.eventSeries === true && b.eventSeries === null)) &&
        arrayEquals(a.folderIds, b.folderIds));
}
export function areResultsForTheSameQuery(a, b) {
    return a.query === b.query && isSameSearchRestriction(a.restriction, b.restriction);
}
export function hasMoreResults(searchResult) {
    return (searchResult.moreResults.length > 0 ||
        (searchResult.lastReadSearchIndexRow.length > 0 && searchResult.lastReadSearchIndexRow.every(([word, id]) => id !== 0)));
}
//# sourceMappingURL=CalendarSearchModel.js.map