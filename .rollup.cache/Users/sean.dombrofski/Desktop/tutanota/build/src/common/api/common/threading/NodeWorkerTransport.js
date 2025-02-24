/** transport impl for the node main thread */
export class NodeWorkerTransport {
    worker;
    /** typed for the main thread that creates the worker and for the thread itself that gets a parentPort instance */
    constructor(worker) {
        this.worker = worker;
    }
    postMessage(message) {
        return this.worker.postMessage(message);
    }
    setMessageHandler(handler) {
        this.worker.on("message", (ev) => handler(ev));
    }
}
//# sourceMappingURL=NodeWorkerTransport.js.map