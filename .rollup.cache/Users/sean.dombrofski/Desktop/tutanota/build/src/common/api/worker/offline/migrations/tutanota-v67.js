import { deleteInstancesOfType } from "../StandardMigrations.js";
import { ContactTypeRef } from "../../../entities/tutanota/TypeRefs.js";
export const tutanota67 = {
    app: "tutanota",
    version: 67,
    async migrate(storage) {
        await deleteInstancesOfType(storage, ContactTypeRef);
    },
};
//# sourceMappingURL=tutanota-v67.js.map