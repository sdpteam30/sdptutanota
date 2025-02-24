import { migrateAllElements, migrateAllListElements } from "../StandardMigrations.js";
import { CustomerInfoTypeRef, UserTypeRef } from "../../../entities/sys/TypeRefs.js";
import { KdfType } from "../../../common/TutanotaConstants.js";
export const sys90 = {
    app: "sys",
    version: 90,
    async migrate(storage) {
        // we've added a new field to PlanConfig and we want to make sure that it's correct in the future
        // anyone who has a custom plan at the moment does not have the contact list
        await migrateAllListElements(CustomerInfoTypeRef, storage, [
            (oldCustomerInfo) => {
                if (oldCustomerInfo.customPlan) {
                    oldCustomerInfo.customPlan.contactList = false;
                }
                return oldCustomerInfo;
            },
        ]);
        // we forgot to include this in v89 migration
        await migrateAllElements(UserTypeRef, storage, [
            (user) => {
                if (!user.kdfVersion) {
                    user.kdfVersion = KdfType.Bcrypt;
                }
                return user;
            },
        ]);
    },
};
//# sourceMappingURL=sys-v90.js.map