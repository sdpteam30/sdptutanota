import { deleteInstancesOfType, migrateAllListElements } from "../StandardMigrations.js";
import { BucketPermissionTypeRef, GroupTypeRef, UserTypeRef } from "../../../entities/sys/TypeRefs.js";
import { CryptoProtocolVersion } from "../../../common/TutanotaConstants.js";
import { MailTypeRef } from "../../../entities/tutanota/TypeRefs.js";
export const sys92 = {
    app: "sys",
    version: 92,
    async migrate(storage) {
        await migrateAllListElements(BucketPermissionTypeRef, storage, [addProtocolVersion]);
        await migrateAllListElements(MailTypeRef, storage, [
            (e) => {
                if (e.bucketKey) {
                    addProtocolVersion(e.bucketKey);
                }
                return e;
            },
        ]);
        // KeyPair was changed
        await deleteInstancesOfType(storage, GroupTypeRef);
        // We also delete UserType ref to disable offline login. Otherwise, clients will see an unexpected error message with pure offline login.
        await deleteInstancesOfType(storage, UserTypeRef);
    },
};
function addProtocolVersion(entity) {
    if (entity.pubEncBucketKey) {
        entity.protocolVersion = CryptoProtocolVersion.RSA;
    }
    else {
        entity.protocolVersion = CryptoProtocolVersion.SYMMETRIC_ENCRYPTION;
    }
    return entity;
}
//# sourceMappingURL=sys-v92.js.map