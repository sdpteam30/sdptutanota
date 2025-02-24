import { downcast } from "@tutao/tutanota-utils";
/**
 * Queue transport for both WorkerClient and WorkerImpl
 */
export class WebWorkerTransport {
    worker;
    constructor(worker) {
        this.worker = worker;
    }
    postMessage(message) {
        return this.worker.postMessage(message);
    }
    setMessageHandler(handler) {
        this.worker.onmessage = (ev) => handler(downcast(ev.data));
    }
}
//# sourceMappingURL=Transport.js.map