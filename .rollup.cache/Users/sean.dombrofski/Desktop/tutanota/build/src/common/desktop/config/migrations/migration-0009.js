import { DesktopConfigKey } from "../ConfigKeys.js";
export const migrateClient = async function (oldConfig) {
    Object.assign(oldConfig, {
        desktopConfigVersion: 9,
        [DesktopConfigKey.mailboxExportState]: {},
    });
};
export const migrateAdmin = async (oldConfig) => {
    Object.assign(oldConfig, {
        desktopConfigVersion: 9,
    });
};
//# sourceMappingURL=migration-0009.js.map