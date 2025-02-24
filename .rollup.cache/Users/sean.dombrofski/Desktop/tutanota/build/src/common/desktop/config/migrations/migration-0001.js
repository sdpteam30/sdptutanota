async function migrate(oldConfig) {
    Object.assign(oldConfig, {
        desktopConfigVersion: 1,
        showAutoUpdateOption: true,
    });
}
export const migrateClient = migrate;
export const migrateAdmin = migrate;
//# sourceMappingURL=migration-0001.js.map