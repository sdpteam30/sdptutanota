import { addValue, migrateAllElements, migrateAllListElements, removeValue } from "../StandardMigrations.js";
import { GroupKeyTypeRef, GroupTypeRef } from "../../../entities/sys/TypeRefs.js";
export const sys111 = {
    app: "sys",
    version: 111,
    async migrate(storage) {
        await migrateAllElements(GroupTypeRef, storage, [removeValue("pubAdminGroupEncGKey"), addValue("pubAdminGroupEncGKey", null)]);
        await migrateAllListElements(GroupKeyTypeRef, storage, [removeValue("pubAdminGroupEncGKey"), addValue("pubAdminGroupEncGKey", null)]);
    },
};
//# sourceMappingURL=sys-v111.js.map