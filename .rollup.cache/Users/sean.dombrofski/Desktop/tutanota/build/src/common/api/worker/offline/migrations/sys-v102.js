import { deleteInstancesOfType } from "../StandardMigrations.js";
import { GroupTypeRef, UserGroupRootTypeRef, UserTypeRef } from "../../../entities/sys/TypeRefs.js";
export const sys102 = {
    app: "sys",
    version: 102,
    async migrate(storage, sqlCipherFacade) {
        await deleteInstancesOfType(storage, UserGroupRootTypeRef); // to ensure keyRotations is populated
        await deleteInstancesOfType(storage, GroupTypeRef); // to ensure formerGroupKeys is populated
        // We also delete UserType ref to disable offline login. Otherwise, clients will see an unexpected error message with pure offline login.
        await deleteInstancesOfType(storage, UserTypeRef);
    },
};
//# sourceMappingURL=sys-v102.js.map