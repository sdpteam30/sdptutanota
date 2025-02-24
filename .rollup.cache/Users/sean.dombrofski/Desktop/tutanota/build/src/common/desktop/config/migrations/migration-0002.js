async function migrate(oldConfig) {
    Object.assign(oldConfig, {
        desktopConfigVersion: 2,
        mailExportMode: process.platform === "win32" ? "msg" : "eml",
    });
}
export const migrateClient = migrate;
export const migrateAdmin = migrate;
//# sourceMappingURL=migration-0002.js.map