async function migrate(oldConfig) {
    Object.assign(oldConfig, {
        desktopConfigVersion: 0,
    });
}
export const migrateClient = migrate;
export const migrateAdmin = migrate;
//# sourceMappingURL=migration-0000.js.map