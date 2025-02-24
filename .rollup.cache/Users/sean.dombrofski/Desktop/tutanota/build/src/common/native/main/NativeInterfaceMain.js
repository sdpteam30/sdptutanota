import { assertMainOrNode, isAndroidApp, isElectronClient, isIOSApp } from "../../api/common/Env";
import { MessageDispatcher, Request } from "../../api/common/threading/MessageDispatcher.js";
import { defer } from "@tutao/tutanota-utils";
import { ProgrammingError } from "../../api/common/error/ProgrammingError";
import { IosNativeTransport } from "./IosNativeTransport.js";
import { AndroidNativeTransport } from "./AndroidNativeTransport.js";
import { DesktopNativeTransport } from "./DesktopNativeTransport.js";
assertMainOrNode();
/** the side of the node-main interface that's running in the browser windows renderer/main thread. */
export class NativeInterfaceMain {
    globalDispatcher;
    _dispatchDeferred = defer();
    _appUpdateListener = null;
    constructor(globalDispatcher) {
        this.globalDispatcher = globalDispatcher;
    }
    async init() {
        let transport;
        if (isAndroidApp()) {
            const androidTransport = new AndroidNativeTransport(window);
            androidTransport.start();
            transport = androidTransport;
        }
        else if (isIOSApp()) {
            transport = new IosNativeTransport(window);
        }
        else if (isElectronClient()) {
            transport = new DesktopNativeTransport(window.nativeApp);
        }
        else {
            throw new ProgrammingError("Tried to create a native interface in the browser");
        }
        // Ensure that we have messaged native with "init" before we allow anyone else to make native requests
        const queue = new MessageDispatcher(transport, {
            ipc: (request) => this.globalDispatcher.dispatch(request.args[0], request.args[1], request.args.slice(2)),
        }, "main-worker");
        await queue.postRequest(new Request("ipc", ["CommonSystemFacade", "initializeRemoteBridge"]));
        this._dispatchDeferred.resolve(queue);
    }
    // for testing
    async initWithQueue(queue) {
        this._dispatchDeferred.resolve(queue);
    }
    /**
     * Send a request to the native side.
     */
    async invokeNative(requestType, args) {
        const dispatch = await this._dispatchDeferred.promise;
        return dispatch.postRequest(new Request(requestType, args));
    }
    /**
     * Saves a listener method to be called when an app update has been downloaded on the native side.
     */
    setAppUpdateListener(listener) {
        this._appUpdateListener = listener;
    }
    /**
     * Call the update listener if set.
     */
    handleUpdateDownload() {
        this._appUpdateListener?.();
    }
}
//# sourceMappingURL=NativeInterfaceMain.js.map