import { migrateAllListElements } from "../StandardMigrations";
import { CustomerInfoTypeRef } from "../../../entities/sys/TypeRefs.js";
export const sys114 = {
    app: "sys",
    version: 114,
    async migrate(storage) {
        await migrateAllListElements(CustomerInfoTypeRef, storage, [addUnlimitedLabelsToPlanConfiguration()]);
    },
};
function addUnlimitedLabelsToPlanConfiguration() {
    return function addUnlimitedLabelsToPlanConfigurationMigration(entity) {
        if (entity.customPlan != null) {
            entity.customPlan.unlimitedLabels = false;
        }
        return entity;
    };
}
//# sourceMappingURL=sys-v114.js.map