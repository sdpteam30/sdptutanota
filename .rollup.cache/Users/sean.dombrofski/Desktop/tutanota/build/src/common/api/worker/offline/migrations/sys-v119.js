import { deleteInstancesOfType } from "../StandardMigrations.js";
import { CustomerInfoTypeRef } from "../../../entities/sys/TypeRefs";
export const sys119 = {
    app: "sys",
    version: 119,
    async migrate(storage) {
        await deleteInstancesOfType(storage, CustomerInfoTypeRef);
    },
};
//# sourceMappingURL=sys-v119.js.map