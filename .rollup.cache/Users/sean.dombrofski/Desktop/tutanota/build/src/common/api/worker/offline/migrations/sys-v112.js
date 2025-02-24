import { migrateAllElements, removeValue } from "../StandardMigrations";
import { MailboxGroupRootTypeRef } from "../../../entities/tutanota/TypeRefs";
export const sys112 = {
    app: "sys",
    version: 112,
    async migrate(storage) {
        await migrateAllElements(MailboxGroupRootTypeRef, storage, [removeValue("whitelistedDomains")]);
    },
};
//# sourceMappingURL=sys-v112.js.map