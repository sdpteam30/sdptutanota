import { deleteInstancesOfType, migrateAllListElements } from "../StandardMigrations.js";
import { MailTypeRef } from "../../../entities/tutanota/TypeRefs.js";
import { createCustomerInfo, CustomerInfoTypeRef, UserTypeRef } from "../../../entities/sys/TypeRefs.js";
export const sys94 = {
    app: "sys",
    version: 94,
    async migrate(storage) {
        // these are due to the mailbody migration
        await deleteInstancesOfType(storage, MailTypeRef);
        await deleteInstancesOfType(storage, UserTypeRef);
        // this is to add the customerInfo.supportInfo field (sys94)
        await migrateAllListElements(CustomerInfoTypeRef, storage, [createCustomerInfo]);
    },
};
//# sourceMappingURL=sys-v94.js.map