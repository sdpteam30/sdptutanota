import { addValue, migrateAllElements } from "../StandardMigrations.js";
import { TutanotaPropertiesTypeRef } from "../../../entities/tutanota/TypeRefs.js";
/**
 * Migration to patch up the broken tutanota-v77 migration.
 *
 * We write default value which might be out of sync with the server but we have an extra check for that where
 * we use this property.
 */
export const offline2 = {
    app: "offline",
    version: 2,
    async migrate(storage, _) {
        await migrateAllElements(TutanotaPropertiesTypeRef, storage, [addValue("defaultLabelCreated", false)]);
    },
};
//# sourceMappingURL=offline2.js.map