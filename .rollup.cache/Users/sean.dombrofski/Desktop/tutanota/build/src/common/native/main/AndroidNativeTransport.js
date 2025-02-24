import { decodeNativeMessage, encodeNativeMessage } from "../common/NativeLineProtocol.js";
import { defer } from "@tutao/tutanota-utils";
import { assertMainOrNode } from "../../api/common/Env.js";
assertMainOrNode();
/**
 * Transport for communication between android native and webview, using WebMessagePorts for two-way communication.
 * The interface `nativeApp.startWebMessageChannel` is defined in Native.java in order to initiate the setup of the port channel
 */
export class AndroidNativeTransport {
    window;
    messageHandler = null;
    deferredPort = defer();
    constructor(window) {
        this.window = window;
    }
    /**
     * Creates a global `window.onmessage` handler, and then tells native to create the messageport channel
     */
    start() {
        // We will receive a message from native after the call to
        // window.nativeApp.startWebMessageChannel
        this.window.onmessage = (message) => {
            // All further messages to and from native will be via this port
            const port = message.ports[0];
            port.onmessage = (messageEvent) => {
                const handler = this.messageHandler;
                if (handler) {
                    // We can be sure we have a string here, because
                    // Android only allows sending strings across MessagePorts
                    const response = decodeNativeMessage(messageEvent.data);
                    handler(response);
                }
            };
            this.deferredPort.resolve(port);
        };
        // window.nativeApp is defined in Native.java using WebView.addJavaScriptInterface
        // The native side needs to initialize the WebMessagePorts
        // We have to tell it when we are ready, otherwise it will happen too early and we won't receive the message event
        this.window.nativeApp.startWebMessageChannel();
    }
    postMessage(message) {
        const encoded = encodeNativeMessage(message);
        this.deferredPort.promise.then((port) => port.postMessage(encoded));
    }
    setMessageHandler(handler) {
        this.messageHandler = handler;
    }
}
//# sourceMappingURL=AndroidNativeTransport.js.map