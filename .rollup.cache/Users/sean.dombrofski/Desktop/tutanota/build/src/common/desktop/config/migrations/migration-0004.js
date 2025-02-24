async function migrateSpellcheckTrue(oldConfig) {
    Object.assign(oldConfig, {
        desktopConfigVersion: 4,
        spellcheck: true,
    });
}
async function migrateSpellcheckFalse(oldConfig) {
    Object.assign(oldConfig, {
        desktopConfigVersion: 4,
        spellcheck: false,
    });
}
export const migrateClient = migrateSpellcheckTrue;
export const migrateAdmin = migrateSpellcheckFalse;
//# sourceMappingURL=migration-0004.js.map