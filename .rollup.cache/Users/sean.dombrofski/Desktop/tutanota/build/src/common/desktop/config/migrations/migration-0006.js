async function migrate(oldConfig) {
    Object.assign(oldConfig, {
        desktopConfigVersion: 6,
        offlineStorageEnabled: false,
    });
}
export const migrateClient = migrate;
export const migrateAdmin = migrate;
//# sourceMappingURL=migration-0006.js.map