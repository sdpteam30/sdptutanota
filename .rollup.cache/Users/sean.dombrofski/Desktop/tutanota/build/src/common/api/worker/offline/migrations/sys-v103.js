import { deleteInstancesOfType } from "../StandardMigrations.js";
import { AccountingInfoTypeRef } from "../../../entities/sys/TypeRefs.js";
export const sys103 = {
    app: "sys",
    version: 103,
    async migrate(storage, sqlCipherFacade) {
        // delete AccountingInfo to make sure appStoreSubscription is not missing from offlne db
        await deleteInstancesOfType(storage, AccountingInfoTypeRef);
    },
};
//# sourceMappingURL=sys-v103.js.map