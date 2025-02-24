/**
 * entry point to the sqlite worker threads. one is created for each user's offline database.
 * it's possible for multiple windows to access the same sqlite database through the same thread.
 * it must be ensured that there is never more than one thread accessing the same database.
 *
 * its purpose is
 * * to trap console.log calls when it is created
 * * then create an instance of DesktopSqlCipher
 * * then wait for commands, pass them to the DesktopSqlCihper and return the results
 *
 * trapping the console.log is necessary for the output to be spliced into our logging system. using
 * the default console.log from a worker writes directly to stdout.
 * */
import { parentPort, workerData } from "node:worker_threads";
import { DesktopSqlCipher } from "./db/DesktopSqlCipher.js";
import { MessageDispatcher, Request } from "../api/common/threading/MessageDispatcher.js";
import { NodeWorkerTransport } from "../api/common/threading/NodeWorkerTransport.js";
if (parentPort != null) {
    try {
        const sqlCipherFacade = new DesktopSqlCipher(workerData.nativeBindingPath, workerData.dbPath, workerData.integrityCheck);
        const commands = {
            all: (msg) => sqlCipherFacade.all(msg.args[0], msg.args[1]),
            closeDb: async () => {
                await sqlCipherFacade.closeDb();
                // this lets the thread exit once the port is the only thing on the event loop
                parentPort?.unref();
            },
            deleteDb: (msg) => sqlCipherFacade.deleteDb(msg.args[0]),
            get: (msg) => sqlCipherFacade.get(msg.args[0], msg.args[1]),
            lockRangesDbAccess: (msg) => sqlCipherFacade.lockRangesDbAccess(msg.args[0]),
            openDb: (msg) => sqlCipherFacade.openDb(msg.args[0], msg.args[1]),
            run: (msg) => sqlCipherFacade.run(msg.args[0], msg.args[1]),
            unlockRangesDbAccess: (msg) => sqlCipherFacade.unlockRangesDbAccess(msg.args[0]),
        };
        const workerTransport = new MessageDispatcher(new NodeWorkerTransport(parentPort), commands, "nodeworker-node");
        console.info = (...args) => workerTransport.postRequest(new Request("info", args));
        console.log = (...args) => workerTransport.postRequest(new Request("log", args));
        console.error = (...args) => workerTransport.postRequest(new Request("error", args));
        console.warn = (...args) => workerTransport.postRequest(new Request("warn", args));
        console.trace = (...args) => workerTransport.postRequest(new Request("trace", args));
        console.log("set up sql cipher done");
    }
    catch (e) {
        parentPort.unref();
    }
}
else {
    // if there's no parent port, there's nothing we can do really
    process.exit(1);
}
//# sourceMappingURL=sqlworker.js.map