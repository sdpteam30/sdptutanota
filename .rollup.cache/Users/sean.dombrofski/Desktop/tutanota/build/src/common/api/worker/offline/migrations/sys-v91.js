import { migrateAllElements, removeValue } from "../StandardMigrations.js";
import { CustomerTypeRef } from "../../../entities/sys/TypeRefs.js";
export const sys91 = {
    app: "sys",
    version: 91,
    async migrate(storage) {
        await migrateAllElements(CustomerTypeRef, storage, [removeValue("contactFormUserGroups"), removeValue("contactFormUserAreaGroups")]);
    },
};
//# sourceMappingURL=sys-v91.js.map