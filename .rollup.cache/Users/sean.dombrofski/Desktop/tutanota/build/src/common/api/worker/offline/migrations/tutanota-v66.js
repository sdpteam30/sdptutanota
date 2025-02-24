import { migrateAllListElements } from "../StandardMigrations.js";
import { createMail, MailTypeRef } from "../../../entities/tutanota/TypeRefs.js";
export const tutanota66 = {
    app: "tutanota",
    version: 66,
    async migrate(storage) {
        await migrateAllListElements(MailTypeRef, storage, [createMail]); // initializes encryptionAuthStatus
    },
};
//# sourceMappingURL=tutanota-v66.js.map