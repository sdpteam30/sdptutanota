import { makeTaggedLogger } from "../DesktopLog";
import { ProgrammingError } from "../../api/common/error/ProgrammingError.js";
import { reverse } from "../../api/common/TutanotaConstants.js";
const log = makeTaggedLogger("[SSE]");
export var ConnectionState;
(function (ConnectionState) {
    /** Not connecting or trying to connect. */
    ConnectionState[ConnectionState["disconnected"] = 0] = "disconnected";
    /** Will try to reconnect after timeout. */
    ConnectionState[ConnectionState["delayedReconnect"] = 1] = "delayedReconnect";
    /** Started the connection. */
    ConnectionState[ConnectionState["connecting"] = 2] = "connecting";
    /** Received the response, connection is usable. */
    ConnectionState[ConnectionState["connected"] = 3] = "connected";
})(ConnectionState || (ConnectionState = {}));
/**
 * Generic Server Sent Events client.
 * Does automatically reconnect.
 */
export class SseClient {
    net;
    delay;
    scheduler;
    listener = null;
    _state = { state: ConnectionState.disconnected };
    readTimeoutSec = null;
    heartBeatListenerHandle = undefined;
    set state(newState) {
        const stateName = reverse(ConnectionState)[newState.state];
        log.debug("state:", stateName);
        this._state = newState;
    }
    get state() {
        return this._state;
    }
    constructor(net, delay, scheduler) {
        this.net = net;
        this.delay = delay;
        this.scheduler = scheduler;
    }
    async connect(options) {
        log.debug("connect");
        switch (this.state.state) {
            case ConnectionState.delayedReconnect:
                this.scheduler.unscheduleTimeout(this.state.timeout);
                break;
            case ConnectionState.connecting:
            case ConnectionState.connected:
                await this.disconnect();
                break;
            case ConnectionState.disconnected:
                break;
            // go on with connection
        }
        this.doConnect(options);
    }
    doConnect(options) {
        let attempt;
        switch (this.state.state) {
            case ConnectionState.disconnected:
                attempt = 1;
                break;
            case ConnectionState.delayedReconnect:
                attempt = this.state.attempt;
                // go on with connection
                break;
            case ConnectionState.connecting:
            case ConnectionState.connected:
                throw new ProgrammingError("Invalid state: already connecting");
        }
        const { url, headers } = options;
        const connection = this.net.request(url, {
            headers: {
                "Content-Type": "application/json",
                Connection: "Keep-Alive",
                "Keep-Alive": "header",
                Accept: "text/event-stream",
                ...headers,
            },
            method: "GET",
        });
        connection
            .on("socket", (s) => {
            // We add this listener purely as a workaround for some problem with net module.
            // The problem is that sometimes request gets stuck after handshake - does not process unless some event
            // handler is called (and it works more reliably with console.log()).
            // This makes the request magically unstuck, probably console.log does some I/O and/or socket things.
            s.on("lookup", () => log.debug("lookup"));
        })
            .on("response", async (res) => {
            log.debug("established SSE connection with code", res.statusCode);
            this.state = { state: ConnectionState.connected, connection, options, receivedHeartbeat: false };
            this.resetHeartbeatListener();
            if (res.statusCode === 403 || res.statusCode === 401) {
                await this.listener?.onNotAuthenticated();
                await this.disconnect();
                return;
            }
            res.setEncoding("utf8");
            let resData = "";
            res.on("data", (d) => {
                // add new data to the buffer
                resData += d;
                const lines = resData.split("\n");
                resData = lines.pop() ?? ""; // put the last line back into the buffer
                for (const l of lines) {
                    const trimmedLine = l.trim();
                    if (trimmedLine === "") {
                        log.debug("heartbeat");
                        this.onHeartbeat();
                    }
                    else {
                        this.listener?.onNewMessage(trimmedLine);
                    }
                }
            })
                .on("close", () => {
                log.debug("response closed");
                // This event is fired also when we close the connection manually. In this case we do not want to reconnect.
                if (this.state.state != ConnectionState.disconnected)
                    this.delayedReconnect();
            })
                .on("error", (e) => {
                log.error("response error:", e);
                // This event is fired also when we close the connection manually. In this case we do not want to reconnect.
                if (this.state.state != ConnectionState.disconnected)
                    this.delayedReconnect();
            });
        })
            .on("information", () => log.debug("information"))
            .on("connect", () => log.debug("connect:"))
            .on("error", (e) => {
            log.error("error:", e.message);
            if (this.state.state === ConnectionState.connecting) {
                this.exponentialBackoffReconnect();
            }
        })
            .end();
        this.state = { state: ConnectionState.connecting, connection, attempt, options };
    }
    async disconnect() {
        const state = this.state;
        switch (state.state) {
            case ConnectionState.delayedReconnect:
                this.scheduler.unscheduleTimeout(state.timeout);
                this.state = { state: ConnectionState.disconnected };
                break;
            case ConnectionState.connected:
            case ConnectionState.connecting:
                return new Promise((resolve) => {
                    state.connection.once("close", () => {
                        this.state = { state: ConnectionState.disconnected };
                        resolve();
                    });
                    state.connection.destroy();
                });
        }
    }
    setEventListener(listener) {
        this.listener = listener;
    }
    setReadTimeout(timeoutSeconds) {
        this.readTimeoutSec = timeoutSeconds;
        this.resetHeartbeatListener();
        this.onHeartbeat();
    }
    exponentialBackoffReconnect() {
        if (this.state.state != ConnectionState.connecting) {
            throw new ProgrammingError("Invalid state: not connecting");
        }
        log.debug("Scheduling exponential reconnect");
        const timeout = this.scheduler.scheduleAfter(() => this.retryConnect(), this.delay.reconnectDelay(this.state.attempt));
        this.state = { state: ConnectionState.delayedReconnect, attempt: this.state.attempt + 1, options: this.state.options, timeout };
    }
    delayedReconnect() {
        if (this.state.state != ConnectionState.connected) {
            throw new ProgrammingError("Invalid state: not connected");
        }
        log.debug("Scheduling delayed reconnect");
        const timeout = this.scheduler.scheduleAfter(() => this.retryConnect(), this.delay.initialConnectionDelay());
        this.state = { state: ConnectionState.delayedReconnect, attempt: 0, options: this.state.options, timeout };
    }
    async retryConnect() {
        if (this.state.state !== ConnectionState.delayedReconnect) {
            throw new ProgrammingError("Invalid state: not in delayed reconnect");
        }
        this.doConnect(this.state.options);
    }
    onHeartbeat() {
        if (this.state.state === ConnectionState.connected) {
            this.state = { ...this.state, receivedHeartbeat: true };
        }
    }
    resetHeartbeatListener() {
        // It will check if the heartbeat was received periodically.
        // Theoretically we need to reset this every time we connect but
        // the server will send us the timeout right after the connection anyway.
        if (this.heartBeatListenerHandle != null)
            this.scheduler.unschedulePeriodic(this.heartBeatListenerHandle);
        this.heartBeatListenerHandle = this.scheduler.schedulePeriodic(async () => {
            const state = this.state;
            if (state.state === ConnectionState.connected) {
                if (state.receivedHeartbeat) {
                    this.state = { ...state, receivedHeartbeat: false };
                }
                else {
                    await this.disconnect();
                    this.doConnect(state.options);
                }
            }
        }, Math.floor(this.readTimeoutSec * 1.2 * 1000));
    }
}
//# sourceMappingURL=SseClient.js.map