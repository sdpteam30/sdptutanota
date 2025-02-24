import { migrateAllListElements, removeValue } from "../StandardMigrations";
import { MailFolderTypeRef } from "../../../entities/tutanota/TypeRefs";
export const tutanota83 = {
    app: "tutanota",
    version: 83,
    async migrate(storage) {
        await migrateAllListElements(MailFolderTypeRef, storage, [removeValue("mails"), removeValue("isMailSet")]);
    },
};
//# sourceMappingURL=tutanota-v83.js.map