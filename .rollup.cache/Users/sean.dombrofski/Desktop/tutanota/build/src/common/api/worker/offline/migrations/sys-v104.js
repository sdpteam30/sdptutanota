import { migrateAllElements, removeValue } from "../StandardMigrations.js";
import { UserTypeRef } from "../../../entities/sys/TypeRefs.js";
export const sys104 = {
    app: "sys",
    version: 104,
    async migrate(storage, _) {
        // SystemModelV104 removes phoneNumbers from the USER_TYPE
        await migrateAllElements(UserTypeRef, storage, [removeValue("phoneNumbers")]);
    },
};
//# sourceMappingURL=sys-v104.js.map