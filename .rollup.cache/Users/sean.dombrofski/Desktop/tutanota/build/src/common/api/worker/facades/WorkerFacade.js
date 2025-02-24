import { aes256RandomKey, keyToBase64 } from "@tutao/tutanota-crypto";
/**
 *  Loose collection of functions that should be run on the worker side e.g. because they take too much time and don't belong anywhere else.
 *  (read: kitchen sink).
 */
export class WorkerFacade {
    async generateSsePushIdentifer() {
        return keyToBase64(aes256RandomKey());
    }
    async getLog() {
        const global = self;
        const logger = global.logger;
        if (logger) {
            return logger.getEntries();
        }
        else {
            return [];
        }
    }
    async urlify(html) {
        const { urlify } = await import("../Urlifier.js");
        return urlify(html);
    }
}
//# sourceMappingURL=WorkerFacade.js.map