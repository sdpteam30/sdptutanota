import { migrateAllListElements, removeValue } from "../StandardMigrations.js";
import { FileTypeRef } from "../../../entities/tutanota/TypeRefs.js";
export const tutanota64 = {
    app: "tutanota",
    version: 64,
    async migrate(storage) {
        // We have fully removed FileData
        migrateAllListElements(FileTypeRef, storage, [removeValue("data")]);
    },
};
//# sourceMappingURL=tutanota-v64.js.map