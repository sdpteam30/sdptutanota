/**
 * Implementation of Transport which delegates to CenterIpcHandler/WebContents.
 * Should be instantiated per WebContents.
 */
export class ElectronWebContentsTransport {
    webContents;
    config;
    constructor(webContents, config) {
        this.webContents = webContents;
        this.config = config;
    }
    postMessage(message) {
        if (this.webContents.isDestroyed())
            return;
        this.webContents.send(this.config.mainToRenderEvent, message);
    }
    setMessageHandler(handler) {
        if (this.webContents.isDestroyed())
            return;
        this.webContents.ipc.handle(this.config.renderToMainEvent, (ev, arg) => handler(arg));
    }
}
//# sourceMappingURL=ElectronWebContentsTransport.js.map