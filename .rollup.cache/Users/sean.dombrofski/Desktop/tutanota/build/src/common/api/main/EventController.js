import { downcast, identity, noOp } from "@tutao/tutanota-utils";
import stream from "mithril/stream";
import { assertMainOrNode } from "../common/Env";
assertMainOrNode();
const TAG = "[EventController]";
export class EventController {
    logins;
    countersStream = stream();
    entityListeners = new Set();
    constructor(logins) {
        this.logins = logins;
    }
    addEntityListener(listener) {
        if (this.entityListeners.has(listener)) {
            console.warn(TAG, "Adding the same listener twice!");
        }
        else {
            this.entityListeners.add(listener);
        }
    }
    removeEntityListener(listener) {
        const wasRemoved = this.entityListeners.delete(listener);
        if (!wasRemoved) {
            console.warn(TAG, "Could not remove listener, possible leak?", listener);
        }
    }
    getCountersStream() {
        // Create copy so it's never ended
        return this.countersStream.map(identity);
    }
    async onEntityUpdateReceived(entityUpdates, eventOwnerGroupId) {
        let loginsUpdates = Promise.resolve();
        if (this.logins.isUserLoggedIn()) {
            // the UserController must be notified first as other event receivers depend on it to be up-to-date
            loginsUpdates = this.logins.getUserController().entityEventsReceived(entityUpdates, eventOwnerGroupId);
        }
        return loginsUpdates
            .then(async () => {
            // sequentially to prevent parallel loading of instances
            for (const listener of this.entityListeners) {
                let entityUpdatesData = downcast(entityUpdates);
                await listener(entityUpdatesData, eventOwnerGroupId);
            }
        })
            .then(noOp);
    }
    async onCountersUpdateReceived(update) {
        this.countersStream(update);
    }
}
//# sourceMappingURL=EventController.js.map