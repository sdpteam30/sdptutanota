/**
 * <ul>
 *   <li>The client sends {WorkerRequest}s to the worker and the worker answers with either an {WorkerResponse} or a {WorkerError}.
 *   <li>The worker sends {ClientCommands}s to the client. The commands are executed by the client (without any response to the worker).
 * </ul>
 */
import { isWorker } from "../Env.js";
import { objToError } from "../utils/ErrorUtils.js";
export class Request {
    type;
    requestType;
    /** should be selected and assigned by the message dispatcher or on deserialization only. */
    id = null;
    args;
    constructor(type, args) {
        this.type = "request";
        this.requestType = type;
        this.id = null;
        this.args = args.slice();
    }
}
export class Response {
    type;
    id;
    value;
    constructor(id, value) {
        this.type = "response";
        this.id = id;
        this.value = value;
    }
}
export class RequestError {
    type;
    id;
    error;
    constructor(id, error) {
        this.type = "requestError";
        this.id = id;
        this.error = errorToObj(error); // the structured clone algorithm is not able to clone errors
    }
}
/**
 * Handles remote invocations (e.g. worker or native calls).
 */
export class MessageDispatcher {
    transport;
    commands;
    idPrefix;
    /**
     * Map from request id that have been sent to the callback that will be
     * executed on the results sent by the worker.
     */
    _messages;
    nextId;
    constructor(transport, commands, idPrefix) {
        this.transport = transport;
        this.commands = commands;
        this.idPrefix = idPrefix;
        this._messages = {};
        this.nextId = makeRequestIdGenerator(idPrefix);
        this.transport.setMessageHandler((msg) => this.handleMessage(msg));
    }
    postRequest(msg) {
        msg.id = this.nextId();
        return new Promise((resolve, reject) => {
            this._messages[msg.id] = {
                resolve,
                reject,
            };
            try {
                this.transport.postMessage(msg);
            }
            catch (e) {
                console.log("error payload:", msg);
                throw e;
            }
        });
    }
    handleMessage(message) {
        if (message.type === "response") {
            const pendingRequest = this._messages[message.id];
            if (pendingRequest != null) {
                pendingRequest.resolve(message.value);
                delete this._messages[message.id];
            }
            else {
                console.warn(`Unexpected response: ${message.id} (was the page reloaded?)`);
            }
        }
        else if (message.type === "requestError") {
            const pendingRequest = this._messages[message.id];
            if (pendingRequest != null) {
                pendingRequest.reject(objToError(message.error));
                delete this._messages[message.id];
            }
            else {
                console.warn(`Unexpected error response: ${message.id} (was the page reloaded?)`);
            }
        }
        else if (message.type === "request") {
            const command = this.commands[message.requestType];
            if (command != null) {
                const commandResult = command(message);
                // Every method exposed via worker protocol must return a promise. Failure to do so is a violation of contract so we
                // try to catch it early and throw an error.
                if (commandResult == null || typeof commandResult.then !== "function") {
                    throw new Error(`Handler returned non-promise result: ${message.requestType}`);
                }
                commandResult.then((value) => {
                    this.transport.postMessage(new Response(message.id, value));
                }, (error) => {
                    this.transport.postMessage(new RequestError(message.id, error));
                });
            }
            else {
                let error = new Error(`unexpected request: ${message.id}, ${message.requestType}`);
                if (isWorker()) {
                    this.transport.postMessage(new RequestError(message.id, error));
                }
                else {
                    throw error;
                }
            }
        }
        else {
            throw new Error(`Unexpected request type: ${JSON.stringify(message)}`);
        }
    }
}
export function makeRequestIdGenerator(prefix) {
    let requestId = 0;
    return () => {
        if (requestId >= Number.MAX_SAFE_INTEGER) {
            requestId = 0;
        }
        return prefix + requestId++;
    };
}
// Serialize error stack traces, when they are sent via the websocket.
export function errorToObj(error) {
    const errorErased = error;
    return {
        name: errorErased.name,
        message: errorErased.message,
        stack: errorErased.stack,
        data: errorErased.data,
    };
}
//# sourceMappingURL=MessageDispatcher.js.map