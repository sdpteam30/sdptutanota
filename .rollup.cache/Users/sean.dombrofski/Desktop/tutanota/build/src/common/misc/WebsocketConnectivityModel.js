import stream from "mithril/stream";
import { identity } from "@tutao/tutanota-utils";
/** A web page thread view on websocket/event bus. */
export class WebsocketConnectivityModel {
    eventBus;
    wsState = stream(2 /* WsConnectionState.terminated */);
    leaderStatus = false;
    constructor(eventBus) {
        this.eventBus = eventBus;
    }
    async updateWebSocketState(wsConnectionState) {
        this.wsState(wsConnectionState);
    }
    async onLeaderStatusChanged(leaderStatus) {
        this.leaderStatus = leaderStatus.leaderStatus;
    }
    isLeader() {
        return this.leaderStatus;
    }
    wsConnection() {
        // .map() to make a defensive copy
        return this.wsState.map(identity);
    }
    tryReconnect(closeIfOpen, enableAutomaticState, delay = null) {
        return this.eventBus.tryReconnect(closeIfOpen, enableAutomaticState, delay);
    }
    close(option) {
        return this.eventBus.close(option);
    }
}
//# sourceMappingURL=WebsocketConnectivityModel.js.map