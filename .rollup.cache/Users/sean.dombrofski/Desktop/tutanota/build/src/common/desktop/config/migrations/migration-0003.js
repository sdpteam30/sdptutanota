import { downcast } from "@tutao/tutanota-utils";
import { log } from "../../DesktopLog";
async function migrate(oldConfig, crypto, keyStoreFacade) {
    Object.assign(oldConfig, {
        desktopConfigVersion: 3,
    });
    if (oldConfig.pushIdentifier) {
        try {
            const deviceKey = await keyStoreFacade.getDeviceKey();
            Object.assign(oldConfig, {
                sseInfo: crypto.aesEncryptObject(deviceKey, downcast(oldConfig.pushIdentifier)),
            });
        }
        catch (e) {
            // cannot read device key, just remove sseInfo from old config
            log.warn("migration003: could not read device key, will not save sseInfo", e);
        }
        delete oldConfig.pushIdentifier;
    }
}
export const migrateClient = migrate;
export const migrateAdmin = migrate;
//# sourceMappingURL=migration-0003.js.map