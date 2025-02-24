import { addValue, deleteInstancesOfType, migrateAllListElements, removeValue } from "../StandardMigrations";
import { MailFolderTypeRef, TutanotaPropertiesTypeRef } from "../../../entities/tutanota/TypeRefs";
export const tutanota77 = {
    app: "tutanota",
    version: 77,
    async migrate(storage) {
        await migrateAllListElements(MailFolderTypeRef, storage, [removeValue("isLabel"), addValue("color", null)]);
        await deleteInstancesOfType(storage, TutanotaPropertiesTypeRef);
    },
};
//# sourceMappingURL=tutanota-v77.js.map