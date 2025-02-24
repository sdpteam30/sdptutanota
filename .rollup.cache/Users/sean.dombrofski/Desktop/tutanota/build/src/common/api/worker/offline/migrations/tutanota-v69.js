import { addOwnerKeyVersion, addValue, migrateAllElements, migrateAllListElements, removeValue, renameAttribute } from "../StandardMigrations.js";
import { CalendarEventTypeRef, CalendarEventUpdateTypeRef, CalendarGroupRootTypeRef, ContactListEntryTypeRef, ContactListGroupRootTypeRef, ContactListTypeRef, ContactTypeRef, EmailTemplateTypeRef, FileSystemTypeRef, FileTypeRef, KnowledgeBaseEntryTypeRef, MailboxPropertiesTypeRef, MailBoxTypeRef, MailDetailsBlobTypeRef, MailDetailsDraftTypeRef, MailFolderTypeRef, MailTypeRef, TemplateGroupRootTypeRef, TutanotaPropertiesTypeRef, UserSettingsGroupRootTypeRef, } from "../../../entities/tutanota/TypeRefs.js";
import { CryptoProtocolVersion } from "../../../common/TutanotaConstants.js";
export const tutanota69 = {
    app: "tutanota",
    version: 69,
    async migrate(storage) {
        const encryptedElementTypes = [
            FileSystemTypeRef,
            MailBoxTypeRef,
            ContactListTypeRef,
            TutanotaPropertiesTypeRef,
            CalendarGroupRootTypeRef,
            UserSettingsGroupRootTypeRef,
            ContactListGroupRootTypeRef,
            MailboxPropertiesTypeRef,
            TemplateGroupRootTypeRef,
        ];
        const encryptedListElementTypes = [
            FileTypeRef,
            ContactTypeRef,
            MailTypeRef,
            MailFolderTypeRef,
            CalendarEventTypeRef,
            CalendarEventUpdateTypeRef,
            EmailTemplateTypeRef,
            MailDetailsDraftTypeRef,
            MailDetailsBlobTypeRef,
            ContactListEntryTypeRef,
            KnowledgeBaseEntryTypeRef,
        ];
        for (const type of encryptedElementTypes) {
            await migrateAllElements(type, storage, [addOwnerKeyVersion()]);
        }
        for (const type of encryptedListElementTypes) {
            await migrateAllListElements(type, storage, [addOwnerKeyVersion()]);
        }
        await migrateAllListElements(MailTypeRef, storage, [addVersionsToBucketKey()]);
        await migrateAllElements(TutanotaPropertiesTypeRef, storage, [renameAttribute("groupEncEntropy", "userEncEntropy"), addValue("userKeyVersion", null)]);
        await migrateAllElements(MailBoxTypeRef, storage, [removeValue("symEncShareBucketKey")]);
    },
};
function addVersionsToBucketKey() {
    return function (entity) {
        const bucketKey = entity["bucketKey"];
        if (bucketKey != null) {
            bucketKey["recipientKeyVersion"] = "0";
            bucketKey["senderKeyVersion"] = bucketKey["protocolVersion"] === CryptoProtocolVersion.TUTA_CRYPT ? "0" : null;
            for (const instanceSessionKey of bucketKey["bucketEncSessionKeys"]) {
                instanceSessionKey["symKeyVersion"] = "0";
            }
        }
        return entity;
    };
}
//# sourceMappingURL=tutanota-v69.js.map