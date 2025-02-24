import { migrateAllElements, migrateAllListElements, removeValue } from "../StandardMigrations.js";
import { GroupInfoTypeRef, GroupTypeRef } from "../../../entities/sys/TypeRefs.js";
export const sys120 = {
    app: "sys",
    version: 120,
    async migrate(storage) {
        await migrateAllListElements(GroupInfoTypeRef, storage, [removeValue("localAdmin")]);
        await migrateAllElements(GroupTypeRef, storage, [removeValue("administratedGroups")]);
    },
};
//# sourceMappingURL=sys-v120.js.map