import { Worker } from "node:worker_threads";
import { MessageDispatcher, Request } from "../../api/common/threading/MessageDispatcher.js";
import { NodeWorkerTransport } from "../../api/common/threading/NodeWorkerTransport.js";
import { createRequire } from "node:module";
const TAG = "[WorkerSqlCipher]";
/** impl for SqlCipherFacade that passes any requests to a node worker thread that's running the sqlite db for the given user id
 * this code is running in the main thread of the node process. */
export class WorkerSqlCipher {
    nativeBindingPath;
    dbPath;
    integrityCheck;
    dispatcher;
    worker;
    constructor(nativeBindingPath, dbPath, integrityCheck) {
        this.nativeBindingPath = nativeBindingPath;
        this.dbPath = dbPath;
        this.integrityCheck = integrityCheck;
        // All entry points are bundled into the same directory
        const require = createRequire(import.meta.url);
        const worker = new Worker(require.resolve("./sqlworker.js"), {
            workerData: { nativeBindingPath, dbPath, integrityCheck },
        }).on("error", (error) => {
            // this is where uncaught errors in the worker end up.
            console.log(TAG, `error in sqlcipher-worker-${worker.threadId}:`, error);
            worker.unref();
            throw error;
        });
        console.log(TAG, `started sqlcipher-worker-${worker.threadId}`);
        this.dispatcher = new MessageDispatcher(new NodeWorkerTransport(worker), {
            info: async (msg) => console.info(`[sqlcipher-worker-${worker.threadId}]`, ...msg.args),
            log: async (msg) => console.log(`[sqlcipher-worker-${worker.threadId}]`, ...msg.args),
            error: async (msg) => console.error(`[sqlcipher-worker-${worker.threadId}]`, ...msg.args),
            warn: async (msg) => console.warn(`[sqlcipher-worker-${worker.threadId}]`, ...msg.args),
            trace: async (msg) => console.trace(`[sqlcipher-worker-${worker.threadId}]`, ...msg.args),
        }, "node-nodeworker");
        this.worker = worker;
    }
    async all(query, params) {
        return this.dispatcher.postRequest(new Request("all", [query, params]));
    }
    async closeDb() {
        return this.dispatcher.postRequest(new Request("closeDb", []));
    }
    async deleteDb(userId) {
        return this.dispatcher.postRequest(new Request("deleteDb", []));
    }
    async get(query, params) {
        return this.dispatcher.postRequest(new Request("get", [query, params]));
    }
    async lockRangesDbAccess(listId) {
        return this.dispatcher.postRequest(new Request("lockRangesDbAccess", [listId]));
    }
    async openDb(userId, dbKey) {
        return this.dispatcher.postRequest(new Request("openDb", [userId, dbKey]));
    }
    async run(query, params) {
        return this.dispatcher.postRequest(new Request("run", [query, params]));
    }
    async unlockRangesDbAccess(listId) {
        return this.dispatcher.postRequest(new Request("unlockRangesDbAccess", [listId]));
    }
}
//# sourceMappingURL=WorkerSqlCipher.js.map