import { decodeNativeMessage, encodeNativeMessage } from "../common/NativeLineProtocol.js";
import { base64ToUint8Array, utf8Uint8ArrayToString } from "@tutao/tutanota-utils";
import { assertMainOrNode } from "../../api/common/Env.js";
assertMainOrNode();
/**
 * Transport for communication between ios native and webview
 * Messages are passed from native via as eval()-type call which invokes sendMessageFromApp, see WebViewBridge.swift
 * window.tutao.nativeApp is injected during webview initialization
 */
export class IosNativeTransport {
    window;
    messageHandler = null;
    constructor(window) {
        this.window = window;
        this.window.tutao.nativeApp = this;
    }
    postMessage(message) {
        const encoded = encodeNativeMessage(message);
        // @ts-ignore this is set in the WebViewBrigde on Ios
        this.window.webkit.messageHandlers.nativeApp.postMessage(encoded);
    }
    setMessageHandler(handler) {
        this.messageHandler = handler;
    }
    receiveMessageFromApp(msg64) {
        const handler = this.messageHandler;
        if (handler) {
            const msg = utf8Uint8ArrayToString(base64ToUint8Array(msg64));
            const parsed = decodeNativeMessage(msg);
            handler(parsed);
        }
        else {
            console.warn("Request from native but no handler is set!");
        }
    }
}
//# sourceMappingURL=IosNativeTransport.js.map