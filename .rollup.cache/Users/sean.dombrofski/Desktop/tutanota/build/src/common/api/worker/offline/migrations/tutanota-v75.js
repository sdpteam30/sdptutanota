import { deleteInstancesOfType } from "../StandardMigrations.js";
import { UserSettingsGroupRootTypeRef } from "../../../entities/tutanota/TypeRefs.js";
import { AuditLogEntryTypeRef, GroupInfoTypeRef } from "../../../entities/sys/TypeRefs.js";
import { GroupType } from "../../../common/TutanotaConstants.js";
import { getElementId, getListId } from "../../../common/utils/EntityUtils.js";
export const tutanota75 = {
    app: "tutanota",
    version: 75,
    async migrate(storage) {
        await deleteInstancesOfType(storage, UserSettingsGroupRootTypeRef);
        // required to throw the LoginIncompleteError when trying async login
        const groupInfos = await storage.getRawListElementsOfType(GroupInfoTypeRef);
        for (const groupInfo of groupInfos) {
            if (groupInfo.groupType !== GroupType.User)
                continue;
            await storage.deleteIfExists(GroupInfoTypeRef, getListId(groupInfo), getElementId(groupInfo));
        }
        await deleteInstancesOfType(storage, AuditLogEntryTypeRef);
    },
};
//# sourceMappingURL=tutanota-v75.js.map