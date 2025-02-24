import { migrateAllElements, migrateAllListElements, removeValue } from "../StandardMigrations.js";
import { MailboxGroupRootTypeRef, MailTypeRef } from "../../../entities/tutanota/TypeRefs.js";
export const tutanota65 = {
    app: "tutanota",
    version: 65,
    async migrate(storage) {
        migrateAllListElements(MailTypeRef, storage, [removeValue("restrictions")]);
        migrateAllElements(MailboxGroupRootTypeRef, storage, [
            removeValue("contactFormUserContactForm"),
            removeValue("targetMailGroupContactForm"),
            removeValue("participatingContactForms"),
        ]);
    },
};
//# sourceMappingURL=tutanota-v65.js.map