import { defer } from "@tutao/tutanota-utils";
export class DesktopCommonSystemFacade {
    window;
    logger;
    initDefer = defer();
    constructor(window, logger) {
        this.window = window;
        this.logger = logger;
    }
    async initializeRemoteBridge() {
        this.initDefer.resolve();
    }
    async reload(query) {
        this.initDefer = defer();
        this.window.reload(query);
    }
    async awaitForInit() {
        await this.initDefer.promise;
    }
    async getLog() {
        return this.logger.getEntries().join("\n");
    }
}
//# sourceMappingURL=DesktopCommonSystemFacade.js.map