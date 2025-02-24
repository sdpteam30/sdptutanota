import { CalendarEventTypeRef } from "../../entities/tutanota/TypeRefs.js";
import { freezeMap, getTypeId } from "@tutao/tutanota-utils";
import { CUSTOM_MAX_ID, CUSTOM_MIN_ID, firstBiggerThanSecond, getElementId, LOAD_MULTIPLE_LIMIT } from "../../common/utils/EntityUtils.js";
import { resolveTypeReference } from "../../common/EntityFunctions.js";
import { ProgrammingError } from "../../common/error/ProgrammingError.js";
/**
 * wrapper for a TypeRef -> CustomCacheHandler map that's needed because we can't
 * use TypeRefs directly as map keys due to object identity not matching.
 *
 * it is mostly read-only
 */
export class CustomCacheHandlerMap {
    handlers;
    constructor(...args) {
        const handlers = new Map();
        for (const { ref, handler } of args) {
            const key = getTypeId(ref);
            handlers.set(key, handler);
        }
        this.handlers = freezeMap(handlers);
    }
    get(typeRef) {
        const typeId = getTypeId(typeRef);
        // map is frozen after the constructor. constructor arg types are set up to uphold this invariant.
        return this.handlers.get(typeId);
    }
}
/**
 * implements range loading in JS because the custom Ids of calendar events prevent us from doing
 * this effectively in the database.
 */
export class CustomCalendarEventCacheHandler {
    entityRestClient;
    constructor(entityRestClient) {
        this.entityRestClient = entityRestClient;
    }
    async loadRange(storage, listId, start, count, reverse) {
        const range = await storage.getRangeForList(CalendarEventTypeRef, listId);
        //if offline db for this list is empty load from server
        let rawList = [];
        if (range == null) {
            let chunk = [];
            let currentMin = CUSTOM_MIN_ID;
            while (true) {
                chunk = await this.entityRestClient.loadRange(CalendarEventTypeRef, listId, currentMin, LOAD_MULTIPLE_LIMIT, false);
                rawList.push(...chunk);
                if (chunk.length < LOAD_MULTIPLE_LIMIT)
                    break;
                currentMin = getElementId(chunk[chunk.length - 1]);
            }
            for (const event of rawList) {
                await storage.put(event);
            }
            // we have all events now
            await storage.setNewRangeForList(CalendarEventTypeRef, listId, CUSTOM_MIN_ID, CUSTOM_MAX_ID);
        }
        else {
            this.assertCorrectRange(range);
            rawList = await storage.getWholeList(CalendarEventTypeRef, listId);
            console.log(`CalendarEvent list ${listId} has ${rawList.length} events`);
        }
        const typeModel = await resolveTypeReference(CalendarEventTypeRef);
        const sortedList = reverse
            ? rawList
                .filter((calendarEvent) => firstBiggerThanSecond(start, getElementId(calendarEvent), typeModel))
                .sort((a, b) => (firstBiggerThanSecond(getElementId(b), getElementId(a), typeModel) ? 1 : -1))
            : rawList
                .filter((calendarEvent) => firstBiggerThanSecond(getElementId(calendarEvent), start, typeModel))
                .sort((a, b) => (firstBiggerThanSecond(getElementId(a), getElementId(b), typeModel) ? 1 : -1));
        return sortedList.slice(0, count);
    }
    assertCorrectRange(range) {
        if (range.lower !== CUSTOM_MIN_ID || range.upper !== CUSTOM_MAX_ID) {
            throw new ProgrammingError(`Invalid range for CalendarEvent: ${JSON.stringify(range)}`);
        }
    }
    async getElementIdsInCacheRange(storage, listId, ids) {
        const range = await storage.getRangeForList(CalendarEventTypeRef, listId);
        if (range) {
            this.assertCorrectRange(range);
            // assume none of the given Ids are already cached to make sure they are loaded now
            return ids;
        }
        else {
            return [];
        }
    }
}
export class CustomMailEventCacheHandler {
    async shouldLoadOnCreateEvent() {
        // New emails should be pre-cached.
        //  - we need them to display the folder contents
        //  - will very likely be loaded by indexer later
        //  - we might have the instance in offline cache already because of notification process
        return true;
    }
}
//# sourceMappingURL=CustomCacheHandler.js.map