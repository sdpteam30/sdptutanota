import { deleteInstancesOfType } from "../StandardMigrations.js";
import { PushIdentifierTypeRef } from "../../../entities/sys/TypeRefs.js";
export const sys105 = {
    app: "sys",
    version: 105,
    async migrate(storage, _) {
        await deleteInstancesOfType(storage, PushIdentifierTypeRef);
    },
};
//# sourceMappingURL=sys-v105.js.map