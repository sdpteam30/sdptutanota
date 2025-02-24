import { migrateAllElements } from "../StandardMigrations";
import { createMailBox, MailBoxTypeRef } from "../../../entities/tutanota/TypeRefs";
export const tutanota77 = {
    app: "tutanota",
    version: 77,
    async migrate(storage) {
        // tutanotaV77 adds the ImportMailService and corresponding types
        // additionally the model adds the new value importedAttachments (GeneratedId) to the MailBox type
        await migrateAllElements(MailBoxTypeRef, storage, [createMailBox]); // initialize importedAttachments
    },
};
//# sourceMappingURL=tutanota77.js.map