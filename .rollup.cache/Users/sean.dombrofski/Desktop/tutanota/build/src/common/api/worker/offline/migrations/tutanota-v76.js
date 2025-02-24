import { migrateAllElements, removeValue } from "../StandardMigrations";
import { MailboxGroupRootTypeRef } from "../../../entities/tutanota/TypeRefs";
export const tutanota76 = {
    app: "tutanota",
    version: 76,
    async migrate(storage) {
        await migrateAllElements(MailboxGroupRootTypeRef, storage, [removeValue("whitelistRequests")]);
    },
};
//# sourceMappingURL=tutanota-v76.js.map