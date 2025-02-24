import { MessageDispatcher, Request } from "../common/threading/MessageDispatcher.js";
import { WebWorkerTransport } from "../common/threading/Transport.js";
import { assertMainOrNode } from "../common/Env";
import { client } from "../../misc/ClientDetector";
import { defer, downcast } from "@tutao/tutanota-utils";
import { handleUncaughtError } from "../../misc/ErrorHandler";
import { exposeLocalDelayed, exposeRemote } from "../common/WorkerProxy";
import { objToError } from "../common/utils/ErrorUtils.js";
assertMainOrNode();
export class WorkerClient {
    _deferredInitialized = defer();
    _isInitialized = false;
    _dispatcher;
    constructor() {
        this.initialized.then(() => {
            this._isInitialized = true;
        });
    }
    get initialized() {
        return this._deferredInitialized.promise;
    }
    async init(locator) {
        if (env.mode !== "Test") {
            const { prefixWithoutFile } = window.tutao.appState;
            // In apps/desktop we load HTML file and url ends on path/index.html so we want to load path/WorkerBootstrap.js.
            // In browser we load at domain.com or localhost/path (locally) and we want to load domain.com/WorkerBootstrap.js or
            // localhost/path/WorkerBootstrap.js respectively.
            // Service worker has similar logic but it has luxury of knowing that it's served as sw.js.
            const workerUrl = prefixWithoutFile + "/worker-bootstrap.js";
            const worker = new Worker(workerUrl, { type: "module" });
            this._dispatcher = new MessageDispatcher(new WebWorkerTransport(worker), this.queueCommands(locator), "main-worker");
            await this._dispatcher.postRequest(new Request("setup", [window.env, this.getInitialEntropy(), client.browserData()]));
            worker.onerror = (e) => {
                throw new Error(`could not setup worker: ${e.name} ${e.stack} ${e.message} ${e}`);
            };
        }
        else {
            // node: we do not use workers but connect the client and the worker queues directly with each other
            // attention: do not load directly with require() here because in the browser SystemJS would load the WorkerImpl in the client although this code is not executed
            // @ts-ignore
            const WorkerImpl = globalThis.testWorker;
            const workerImpl = new WorkerImpl(this, true);
            await workerImpl.init(client.browserData());
            workerImpl._queue._transport = {
                postMessage: (msg) => this._dispatcher.handleMessage(msg),
            };
            this._dispatcher = new MessageDispatcher({
                postMessage: function (msg) {
                    workerImpl._queue.handleMessage(msg);
                },
            }, this.queueCommands(locator), "main-worker");
        }
        this._deferredInitialized.resolve();
    }
    queueCommands(locator) {
        return {
            execNative: (message) => locator.native.invokeNative(downcast(message.args[0]), downcast(message.args[1])),
            error: (message) => {
                handleUncaughtError(objToError(message.args[0]));
                return Promise.resolve();
            },
            facade: exposeLocalDelayed({
                async loginListener() {
                    return locator.loginListener;
                },
                async wsConnectivityListener() {
                    return locator.connectivityModel;
                },
                async progressTracker() {
                    return locator.progressTracker;
                },
                async eventController() {
                    return locator.eventController;
                },
                async operationProgressTracker() {
                    return locator.operationProgressTracker;
                },
                async infoMessageHandler() {
                    return locator.infoMessageHandler;
                },
            }),
        };
    }
    getWorkerInterface() {
        return exposeRemote(async (request) => this._postRequest(request));
    }
    restRequest(...args) {
        return this._postRequest(new Request("restRequest", args));
    }
    /** @private visible for tests */
    async _postRequest(msg) {
        await this.initialized;
        return this._dispatcher.postRequest(msg);
    }
    reset() {
        return this._postRequest(new Request("reset", []));
    }
    /**
     * Add data from either secure random source or Math.random as entropy.
     */
    getInitialEntropy() {
        const valueList = new Uint32Array(16);
        crypto.getRandomValues(valueList);
        const entropy = [];
        for (let i = 0; i < valueList.length; i++) {
            // 32 because we have 32-bit values Uint32Array
            entropy.push({
                source: "random",
                entropy: 32,
                data: valueList[i],
            });
        }
        return entropy;
    }
}
export function bootstrapWorker(locator) {
    const worker = new WorkerClient();
    const start = Date.now();
    worker.init(locator).then(() => console.log("worker init time (ms):", Date.now() - start));
    return worker;
}
//# sourceMappingURL=WorkerClient.js.map