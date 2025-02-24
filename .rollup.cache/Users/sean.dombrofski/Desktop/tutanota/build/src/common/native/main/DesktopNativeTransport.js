import { assertMainOrNode } from "../../api/common/Env.js";
assertMainOrNode();
/**
 * Transport for communication between electron native and webview
 * Uses window.nativeApp, which is injected by the preload script in desktop mode
 * electron can handle message passing without jsonification
 */
export class DesktopNativeTransport {
    nativeApp;
    constructor(nativeApp) {
        this.nativeApp = nativeApp;
    }
    postMessage(message) {
        this.nativeApp.invoke(message);
    }
    setMessageHandler(handler) {
        this.nativeApp.attach(handler);
    }
}
//# sourceMappingURL=DesktopNativeTransport.js.map