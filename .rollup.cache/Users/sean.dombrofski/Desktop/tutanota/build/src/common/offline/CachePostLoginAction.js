import { CalendarEventTypeRef } from "../api/entities/tutanota/TypeRefs.js";
import { CUSTOM_MIN_ID } from "../api/common/utils/EntityUtils.js";
import { promiseMap } from "@tutao/tutanota-utils";
import { NoopProgressMonitor } from "../api/common/utils/ProgressMonitor.js";
export class CachePostLoginAction {
    calendarModel;
    entityClient;
    progressTracker;
    cacheStorage;
    logins;
    constructor(calendarModel, entityClient, progressTracker, cacheStorage, logins) {
        this.calendarModel = calendarModel;
        this.entityClient = entityClient;
        this.progressTracker = progressTracker;
        this.cacheStorage = cacheStorage;
        this.logins = logins;
    }
    async onFullLoginSuccess(loggedInEvent) {
        // we use an ephemeral cache for non-persistent sessions which doesn't
        // support or save calendar events, so it's pointless to preload them.
        if (loggedInEvent.sessionType !== 2 /* SessionType.Persistent */)
            return;
        //
        // 3 work to load calendar info, 2 work to load short and long events
        const workPerCalendar = 3 + 2;
        const totalWork = this.logins.getUserController().getCalendarMemberships().length * workPerCalendar;
        const monitorHandle = await this.progressTracker.registerMonitor(totalWork);
        const progressMonitor = this.progressTracker.getMonitor(monitorHandle) ?? new NoopProgressMonitor();
        const calendarInfos = await this.calendarModel.getCalendarInfos();
        await promiseMap(calendarInfos.values(), async ({ groupRoot }) => {
            await Promise.all([
                this.entityClient.loadAll(CalendarEventTypeRef, groupRoot.longEvents, CUSTOM_MIN_ID).then(() => progressMonitor.workDone(1)),
                this.entityClient.loadAll(CalendarEventTypeRef, groupRoot.shortEvents, CUSTOM_MIN_ID).then(() => progressMonitor.workDone(1)),
            ]);
        });
        progressMonitor.completed();
        // Clear the excluded data (i.e. trash and spam lists, old data) in the offline storage.
        await this.cacheStorage.clearExcludedData();
    }
    async onPartialLoginSuccess(loggedInEvent) {
        return Promise.resolve();
    }
}
//# sourceMappingURL=CachePostLoginAction.js.map