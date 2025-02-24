import { ProgrammingError } from "../../common/error/ProgrammingError";
export class AdminClientDummyEntityRestCache {
    async entityEventsReceived(batch) {
        return batch.events;
    }
    async erase(instance) {
        throw new ProgrammingError("erase not implemented");
    }
    async load(_typeRef, _id, _opts) {
        throw new ProgrammingError("load not implemented");
    }
    async loadMultiple(typeRef, listId, elementIds) {
        throw new ProgrammingError("loadMultiple not implemented");
    }
    async loadRange(typeRef, listId, start, count, reverse) {
        throw new ProgrammingError("loadRange not implemented");
    }
    async purgeStorage() {
        return;
    }
    async setup(listId, instance, extraHeaders) {
        throw new ProgrammingError("setup not implemented");
    }
    async setupMultiple(listId, instances) {
        throw new ProgrammingError("setupMultiple not implemented");
    }
    async update(instance) {
        throw new ProgrammingError("update not implemented");
    }
    async getLastEntityEventBatchForGroup(groupId) {
        return null;
    }
    async setLastEntityEventBatchForGroup(groupId, batchId) {
        return;
    }
    async recordSyncTime() {
        return;
    }
    async timeSinceLastSyncMs() {
        return null;
    }
    async isOutOfSync() {
        return false;
    }
}
//# sourceMappingURL=AdminClientDummyEntityRestCache.js.map