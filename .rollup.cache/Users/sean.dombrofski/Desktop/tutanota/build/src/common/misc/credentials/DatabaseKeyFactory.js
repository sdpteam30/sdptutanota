//@bundleInto:common
import { isOfflineStorageAvailable } from "../../api/common/Env";
/**
 * Factory for generating an offline storage database key
 * Will return null whenever offline storage is not available
 */
export class DatabaseKeyFactory {
    crypto;
    constructor(crypto) {
        this.crypto = crypto;
    }
    async generateKey() {
        return isOfflineStorageAvailable() ? this.crypto.generateKey() : null;
    }
}
//# sourceMappingURL=DatabaseKeyFactory.js.map