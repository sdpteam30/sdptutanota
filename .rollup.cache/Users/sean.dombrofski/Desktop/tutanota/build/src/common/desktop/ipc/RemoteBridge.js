import { ElectronWebContentsTransport } from "./ElectronWebContentsTransport.js";
import { MessageDispatcher, Request } from "../../api/common/threading/MessageDispatcher.js";
import { DesktopFacadeSendDispatcher } from "../../native/common/generatedipc/DesktopFacadeSendDispatcher.js";
import { CommonNativeFacadeSendDispatcher } from "../../native/common/generatedipc/CommonNativeFacadeSendDispatcher.js";
import { InterWindowEventFacadeSendDispatcher } from "../../native/common/generatedipc/InterWindowEventFacadeSendDispatcher.js";
const primaryIpcConfig = {
    renderToMainEvent: "to-main",
    mainToRenderEvent: "to-renderer",
};
export class RemoteBridge {
    dispatcherFactory;
    facadeHandlerFactory;
    constructor(dispatcherFactory, facadeHandlerFactory) {
        this.dispatcherFactory = dispatcherFactory;
        this.facadeHandlerFactory = facadeHandlerFactory;
    }
    createBridge(window) {
        const webContents = window._browserWindow.webContents;
        const { desktopCommonSystemFacade, windowCleanup, dispatcher } = this.dispatcherFactory(window);
        const facadeHandler = this.facadeHandlerFactory(window);
        const transport = new ElectronWebContentsTransport(webContents, primaryIpcConfig);
        const messageDispatcher = new MessageDispatcher(transport, {
            facade: facadeHandler,
            ipc: async ({ args }) => {
                const [facade, method, ...methodArgs] = args;
                return await dispatcher.dispatch(facade, method, methodArgs);
            },
        }, "node-main");
        const nativeInterface = {
            invokeNative: async (requestType, args) => {
                await desktopCommonSystemFacade.awaitForInit();
                return messageDispatcher.postRequest(new Request(requestType, args));
            },
        };
        return {
            desktopFacade: new DesktopFacadeSendDispatcher(nativeInterface),
            commonNativeFacade: new CommonNativeFacadeSendDispatcher(nativeInterface),
            interWindowEventSender: new InterWindowEventFacadeSendDispatcher(nativeInterface),
            windowCleanup,
        };
    }
    unsubscribe(ipc) {
        ipc.removeHandler(primaryIpcConfig.renderToMainEvent);
    }
}
//# sourceMappingURL=RemoteBridge.js.map