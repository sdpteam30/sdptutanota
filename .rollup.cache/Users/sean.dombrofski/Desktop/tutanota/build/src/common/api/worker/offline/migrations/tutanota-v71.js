import { deleteInstancesOfType } from "../StandardMigrations.js";
import { ReceivedGroupInvitationTypeRef, SentGroupInvitationTypeRef, UserGroupRootTypeRef } from "../../../entities/sys/TypeRefs.js";
export const tutanota71 = {
    app: "tutanota",
    version: 71,
    async migrate(storage) {
        await deleteInstancesOfType(storage, UserGroupRootTypeRef);
        await deleteInstancesOfType(storage, ReceivedGroupInvitationTypeRef);
        await deleteInstancesOfType(storage, SentGroupInvitationTypeRef);
    },
};
//# sourceMappingURL=tutanota-v71.js.map