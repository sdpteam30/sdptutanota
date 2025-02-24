import { addValue, migrateAllElements } from "../StandardMigrations";
import { MailBoxTypeRef } from "../../../entities/tutanota/TypeRefs";
import { GENERATED_MIN_ID } from "../../../common/utils/EntityUtils";
export const tutanota79 = {
    app: "tutanota",
    version: 79,
    async migrate(storage) {
        await migrateAllElements(MailBoxTypeRef, storage, [addValue("importedAttachments", GENERATED_MIN_ID), addValue("mailImportStates", GENERATED_MIN_ID)]);
    },
};
//# sourceMappingURL=tutanota-v79.js.map