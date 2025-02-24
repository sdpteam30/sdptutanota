import { MessageDispatcher, Request } from "../../api/common/threading/MessageDispatcher.js";
import { exposeLocalDelayed } from "../../api/common/WorkerProxy";
import { assertNotNull, defer } from "@tutao/tutanota-utils";
import { DesktopNativeTransport } from "./DesktopNativeTransport.js";
/**
 * this is hosted on the server, but will only be used inside a WebDialog for the desktop client.
 */
export class WebauthnNativeBridge {
    dispatcher;
    impl = defer();
    constructor() {
        const nativeApp = assertNotNull(window.nativeAppWebDialog);
        const transport = new DesktopNativeTransport(nativeApp);
        const that = this;
        const commands = {
            facade: exposeLocalDelayed({
                WebAuthnFacade() {
                    return that.impl.promise;
                },
            }),
        };
        this.dispatcher = new MessageDispatcher(transport, commands, "webauthn-node");
    }
    async init(impl) {
        this.impl.resolve(impl);
        return this.dispatcher.postRequest(new Request("init", []));
    }
}
//# sourceMappingURL=WebauthnNativeBridge.js.map