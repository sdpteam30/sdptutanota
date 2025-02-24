import { create } from "../../common/utils/EntityUtils.js";
import { TypeRef } from "@tutao/tutanota-utils";
import { typeModels } from "./TypeModels.js";
export const AdvancedRepeatRuleTypeRef = new TypeRef("tutanota", "AdvancedRepeatRule");
export function createAdvancedRepeatRule(values) {
    return Object.assign(create(typeModels.AdvancedRepeatRule, AdvancedRepeatRuleTypeRef), values);
}
export const ApplyLabelServicePostInTypeRef = new TypeRef("tutanota", "ApplyLabelServicePostIn");
export function createApplyLabelServicePostIn(values) {
    return Object.assign(create(typeModels.ApplyLabelServicePostIn, ApplyLabelServicePostInTypeRef), values);
}
export const AttachmentKeyDataTypeRef = new TypeRef("tutanota", "AttachmentKeyData");
export function createAttachmentKeyData(values) {
    return Object.assign(create(typeModels.AttachmentKeyData, AttachmentKeyDataTypeRef), values);
}
export const BirthdayTypeRef = new TypeRef("tutanota", "Birthday");
export function createBirthday(values) {
    return Object.assign(create(typeModels.Birthday, BirthdayTypeRef), values);
}
export const BodyTypeRef = new TypeRef("tutanota", "Body");
export function createBody(values) {
    return Object.assign(create(typeModels.Body, BodyTypeRef), values);
}
export const CalendarDeleteDataTypeRef = new TypeRef("tutanota", "CalendarDeleteData");
export function createCalendarDeleteData(values) {
    return Object.assign(create(typeModels.CalendarDeleteData, CalendarDeleteDataTypeRef), values);
}
export const CalendarEventTypeRef = new TypeRef("tutanota", "CalendarEvent");
export function createCalendarEvent(values) {
    return Object.assign(create(typeModels.CalendarEvent, CalendarEventTypeRef), values);
}
export const CalendarEventAttendeeTypeRef = new TypeRef("tutanota", "CalendarEventAttendee");
export function createCalendarEventAttendee(values) {
    return Object.assign(create(typeModels.CalendarEventAttendee, CalendarEventAttendeeTypeRef), values);
}
export const CalendarEventIndexRefTypeRef = new TypeRef("tutanota", "CalendarEventIndexRef");
export function createCalendarEventIndexRef(values) {
    return Object.assign(create(typeModels.CalendarEventIndexRef, CalendarEventIndexRefTypeRef), values);
}
export const CalendarEventUidIndexTypeRef = new TypeRef("tutanota", "CalendarEventUidIndex");
export function createCalendarEventUidIndex(values) {
    return Object.assign(create(typeModels.CalendarEventUidIndex, CalendarEventUidIndexTypeRef), values);
}
export const CalendarEventUpdateTypeRef = new TypeRef("tutanota", "CalendarEventUpdate");
export function createCalendarEventUpdate(values) {
    return Object.assign(create(typeModels.CalendarEventUpdate, CalendarEventUpdateTypeRef), values);
}
export const CalendarEventUpdateListTypeRef = new TypeRef("tutanota", "CalendarEventUpdateList");
export function createCalendarEventUpdateList(values) {
    return Object.assign(create(typeModels.CalendarEventUpdateList, CalendarEventUpdateListTypeRef), values);
}
export const CalendarGroupRootTypeRef = new TypeRef("tutanota", "CalendarGroupRoot");
export function createCalendarGroupRoot(values) {
    return Object.assign(create(typeModels.CalendarGroupRoot, CalendarGroupRootTypeRef), values);
}
export const CalendarRepeatRuleTypeRef = new TypeRef("tutanota", "CalendarRepeatRule");
export function createCalendarRepeatRule(values) {
    return Object.assign(create(typeModels.CalendarRepeatRule, CalendarRepeatRuleTypeRef), values);
}
export const ContactTypeRef = new TypeRef("tutanota", "Contact");
export function createContact(values) {
    return Object.assign(create(typeModels.Contact, ContactTypeRef), values);
}
export const ContactAddressTypeRef = new TypeRef("tutanota", "ContactAddress");
export function createContactAddress(values) {
    return Object.assign(create(typeModels.ContactAddress, ContactAddressTypeRef), values);
}
export const ContactCustomDateTypeRef = new TypeRef("tutanota", "ContactCustomDate");
export function createContactCustomDate(values) {
    return Object.assign(create(typeModels.ContactCustomDate, ContactCustomDateTypeRef), values);
}
export const ContactListTypeRef = new TypeRef("tutanota", "ContactList");
export function createContactList(values) {
    return Object.assign(create(typeModels.ContactList, ContactListTypeRef), values);
}
export const ContactListEntryTypeRef = new TypeRef("tutanota", "ContactListEntry");
export function createContactListEntry(values) {
    return Object.assign(create(typeModels.ContactListEntry, ContactListEntryTypeRef), values);
}
export const ContactListGroupRootTypeRef = new TypeRef("tutanota", "ContactListGroupRoot");
export function createContactListGroupRoot(values) {
    return Object.assign(create(typeModels.ContactListGroupRoot, ContactListGroupRootTypeRef), values);
}
export const ContactMailAddressTypeRef = new TypeRef("tutanota", "ContactMailAddress");
export function createContactMailAddress(values) {
    return Object.assign(create(typeModels.ContactMailAddress, ContactMailAddressTypeRef), values);
}
export const ContactMessengerHandleTypeRef = new TypeRef("tutanota", "ContactMessengerHandle");
export function createContactMessengerHandle(values) {
    return Object.assign(create(typeModels.ContactMessengerHandle, ContactMessengerHandleTypeRef), values);
}
export const ContactPhoneNumberTypeRef = new TypeRef("tutanota", "ContactPhoneNumber");
export function createContactPhoneNumber(values) {
    return Object.assign(create(typeModels.ContactPhoneNumber, ContactPhoneNumberTypeRef), values);
}
export const ContactPronounsTypeRef = new TypeRef("tutanota", "ContactPronouns");
export function createContactPronouns(values) {
    return Object.assign(create(typeModels.ContactPronouns, ContactPronounsTypeRef), values);
}
export const ContactRelationshipTypeRef = new TypeRef("tutanota", "ContactRelationship");
export function createContactRelationship(values) {
    return Object.assign(create(typeModels.ContactRelationship, ContactRelationshipTypeRef), values);
}
export const ContactSocialIdTypeRef = new TypeRef("tutanota", "ContactSocialId");
export function createContactSocialId(values) {
    return Object.assign(create(typeModels.ContactSocialId, ContactSocialIdTypeRef), values);
}
export const ContactWebsiteTypeRef = new TypeRef("tutanota", "ContactWebsite");
export function createContactWebsite(values) {
    return Object.assign(create(typeModels.ContactWebsite, ContactWebsiteTypeRef), values);
}
export const ConversationEntryTypeRef = new TypeRef("tutanota", "ConversationEntry");
export function createConversationEntry(values) {
    return Object.assign(create(typeModels.ConversationEntry, ConversationEntryTypeRef), values);
}
export const CreateExternalUserGroupDataTypeRef = new TypeRef("tutanota", "CreateExternalUserGroupData");
export function createCreateExternalUserGroupData(values) {
    return Object.assign(create(typeModels.CreateExternalUserGroupData, CreateExternalUserGroupDataTypeRef), values);
}
export const CreateGroupPostReturnTypeRef = new TypeRef("tutanota", "CreateGroupPostReturn");
export function createCreateGroupPostReturn(values) {
    return Object.assign(create(typeModels.CreateGroupPostReturn, CreateGroupPostReturnTypeRef), values);
}
export const CreateMailFolderDataTypeRef = new TypeRef("tutanota", "CreateMailFolderData");
export function createCreateMailFolderData(values) {
    return Object.assign(create(typeModels.CreateMailFolderData, CreateMailFolderDataTypeRef), values);
}
export const CreateMailFolderReturnTypeRef = new TypeRef("tutanota", "CreateMailFolderReturn");
export function createCreateMailFolderReturn(values) {
    return Object.assign(create(typeModels.CreateMailFolderReturn, CreateMailFolderReturnTypeRef), values);
}
export const CreateMailGroupDataTypeRef = new TypeRef("tutanota", "CreateMailGroupData");
export function createCreateMailGroupData(values) {
    return Object.assign(create(typeModels.CreateMailGroupData, CreateMailGroupDataTypeRef), values);
}
export const CustomerAccountCreateDataTypeRef = new TypeRef("tutanota", "CustomerAccountCreateData");
export function createCustomerAccountCreateData(values) {
    return Object.assign(create(typeModels.CustomerAccountCreateData, CustomerAccountCreateDataTypeRef), values);
}
export const DefaultAlarmInfoTypeRef = new TypeRef("tutanota", "DefaultAlarmInfo");
export function createDefaultAlarmInfo(values) {
    return Object.assign(create(typeModels.DefaultAlarmInfo, DefaultAlarmInfoTypeRef), values);
}
export const DeleteGroupDataTypeRef = new TypeRef("tutanota", "DeleteGroupData");
export function createDeleteGroupData(values) {
    return Object.assign(create(typeModels.DeleteGroupData, DeleteGroupDataTypeRef), values);
}
export const DeleteMailDataTypeRef = new TypeRef("tutanota", "DeleteMailData");
export function createDeleteMailData(values) {
    return Object.assign(create(typeModels.DeleteMailData, DeleteMailDataTypeRef), values);
}
export const DeleteMailFolderDataTypeRef = new TypeRef("tutanota", "DeleteMailFolderData");
export function createDeleteMailFolderData(values) {
    return Object.assign(create(typeModels.DeleteMailFolderData, DeleteMailFolderDataTypeRef), values);
}
export const DraftAttachmentTypeRef = new TypeRef("tutanota", "DraftAttachment");
export function createDraftAttachment(values) {
    return Object.assign(create(typeModels.DraftAttachment, DraftAttachmentTypeRef), values);
}
export const DraftCreateDataTypeRef = new TypeRef("tutanota", "DraftCreateData");
export function createDraftCreateData(values) {
    return Object.assign(create(typeModels.DraftCreateData, DraftCreateDataTypeRef), values);
}
export const DraftCreateReturnTypeRef = new TypeRef("tutanota", "DraftCreateReturn");
export function createDraftCreateReturn(values) {
    return Object.assign(create(typeModels.DraftCreateReturn, DraftCreateReturnTypeRef), values);
}
export const DraftDataTypeRef = new TypeRef("tutanota", "DraftData");
export function createDraftData(values) {
    return Object.assign(create(typeModels.DraftData, DraftDataTypeRef), values);
}
export const DraftRecipientTypeRef = new TypeRef("tutanota", "DraftRecipient");
export function createDraftRecipient(values) {
    return Object.assign(create(typeModels.DraftRecipient, DraftRecipientTypeRef), values);
}
export const DraftUpdateDataTypeRef = new TypeRef("tutanota", "DraftUpdateData");
export function createDraftUpdateData(values) {
    return Object.assign(create(typeModels.DraftUpdateData, DraftUpdateDataTypeRef), values);
}
export const DraftUpdateReturnTypeRef = new TypeRef("tutanota", "DraftUpdateReturn");
export function createDraftUpdateReturn(values) {
    return Object.assign(create(typeModels.DraftUpdateReturn, DraftUpdateReturnTypeRef), values);
}
export const EmailTemplateTypeRef = new TypeRef("tutanota", "EmailTemplate");
export function createEmailTemplate(values) {
    return Object.assign(create(typeModels.EmailTemplate, EmailTemplateTypeRef), values);
}
export const EmailTemplateContentTypeRef = new TypeRef("tutanota", "EmailTemplateContent");
export function createEmailTemplateContent(values) {
    return Object.assign(create(typeModels.EmailTemplateContent, EmailTemplateContentTypeRef), values);
}
export const EncryptTutanotaPropertiesDataTypeRef = new TypeRef("tutanota", "EncryptTutanotaPropertiesData");
export function createEncryptTutanotaPropertiesData(values) {
    return Object.assign(create(typeModels.EncryptTutanotaPropertiesData, EncryptTutanotaPropertiesDataTypeRef), values);
}
export const EncryptedMailAddressTypeRef = new TypeRef("tutanota", "EncryptedMailAddress");
export function createEncryptedMailAddress(values) {
    return Object.assign(create(typeModels.EncryptedMailAddress, EncryptedMailAddressTypeRef), values);
}
export const EntropyDataTypeRef = new TypeRef("tutanota", "EntropyData");
export function createEntropyData(values) {
    return Object.assign(create(typeModels.EntropyData, EntropyDataTypeRef), values);
}
export const ExternalUserDataTypeRef = new TypeRef("tutanota", "ExternalUserData");
export function createExternalUserData(values) {
    return Object.assign(create(typeModels.ExternalUserData, ExternalUserDataTypeRef), values);
}
export const FileTypeRef = new TypeRef("tutanota", "File");
export function createFile(values) {
    return Object.assign(create(typeModels.File, FileTypeRef), values);
}
export const FileSystemTypeRef = new TypeRef("tutanota", "FileSystem");
export function createFileSystem(values) {
    return Object.assign(create(typeModels.FileSystem, FileSystemTypeRef), values);
}
export const GroupInvitationDeleteDataTypeRef = new TypeRef("tutanota", "GroupInvitationDeleteData");
export function createGroupInvitationDeleteData(values) {
    return Object.assign(create(typeModels.GroupInvitationDeleteData, GroupInvitationDeleteDataTypeRef), values);
}
export const GroupInvitationPostDataTypeRef = new TypeRef("tutanota", "GroupInvitationPostData");
export function createGroupInvitationPostData(values) {
    return Object.assign(create(typeModels.GroupInvitationPostData, GroupInvitationPostDataTypeRef), values);
}
export const GroupInvitationPostReturnTypeRef = new TypeRef("tutanota", "GroupInvitationPostReturn");
export function createGroupInvitationPostReturn(values) {
    return Object.assign(create(typeModels.GroupInvitationPostReturn, GroupInvitationPostReturnTypeRef), values);
}
export const GroupInvitationPutDataTypeRef = new TypeRef("tutanota", "GroupInvitationPutData");
export function createGroupInvitationPutData(values) {
    return Object.assign(create(typeModels.GroupInvitationPutData, GroupInvitationPutDataTypeRef), values);
}
export const GroupSettingsTypeRef = new TypeRef("tutanota", "GroupSettings");
export function createGroupSettings(values) {
    return Object.assign(create(typeModels.GroupSettings, GroupSettingsTypeRef), values);
}
export const HeaderTypeRef = new TypeRef("tutanota", "Header");
export function createHeader(values) {
    return Object.assign(create(typeModels.Header, HeaderTypeRef), values);
}
export const ImapFolderTypeRef = new TypeRef("tutanota", "ImapFolder");
export function createImapFolder(values) {
    return Object.assign(create(typeModels.ImapFolder, ImapFolderTypeRef), values);
}
export const ImapSyncConfigurationTypeRef = new TypeRef("tutanota", "ImapSyncConfiguration");
export function createImapSyncConfiguration(values) {
    return Object.assign(create(typeModels.ImapSyncConfiguration, ImapSyncConfigurationTypeRef), values);
}
export const ImapSyncStateTypeRef = new TypeRef("tutanota", "ImapSyncState");
export function createImapSyncState(values) {
    return Object.assign(create(typeModels.ImapSyncState, ImapSyncStateTypeRef), values);
}
export const ImportAttachmentTypeRef = new TypeRef("tutanota", "ImportAttachment");
export function createImportAttachment(values) {
    return Object.assign(create(typeModels.ImportAttachment, ImportAttachmentTypeRef), values);
}
export const ImportMailDataTypeRef = new TypeRef("tutanota", "ImportMailData");
export function createImportMailData(values) {
    return Object.assign(create(typeModels.ImportMailData, ImportMailDataTypeRef), values);
}
export const ImportMailDataMailReferenceTypeRef = new TypeRef("tutanota", "ImportMailDataMailReference");
export function createImportMailDataMailReference(values) {
    return Object.assign(create(typeModels.ImportMailDataMailReference, ImportMailDataMailReferenceTypeRef), values);
}
export const ImportMailGetInTypeRef = new TypeRef("tutanota", "ImportMailGetIn");
export function createImportMailGetIn(values) {
    return Object.assign(create(typeModels.ImportMailGetIn, ImportMailGetInTypeRef), values);
}
export const ImportMailGetOutTypeRef = new TypeRef("tutanota", "ImportMailGetOut");
export function createImportMailGetOut(values) {
    return Object.assign(create(typeModels.ImportMailGetOut, ImportMailGetOutTypeRef), values);
}
export const ImportMailPostInTypeRef = new TypeRef("tutanota", "ImportMailPostIn");
export function createImportMailPostIn(values) {
    return Object.assign(create(typeModels.ImportMailPostIn, ImportMailPostInTypeRef), values);
}
export const ImportMailPostOutTypeRef = new TypeRef("tutanota", "ImportMailPostOut");
export function createImportMailPostOut(values) {
    return Object.assign(create(typeModels.ImportMailPostOut, ImportMailPostOutTypeRef), values);
}
export const ImportMailStateTypeRef = new TypeRef("tutanota", "ImportMailState");
export function createImportMailState(values) {
    return Object.assign(create(typeModels.ImportMailState, ImportMailStateTypeRef), values);
}
export const ImportedMailTypeRef = new TypeRef("tutanota", "ImportedMail");
export function createImportedMail(values) {
    return Object.assign(create(typeModels.ImportedMail, ImportedMailTypeRef), values);
}
export const InboxRuleTypeRef = new TypeRef("tutanota", "InboxRule");
export function createInboxRule(values) {
    return Object.assign(create(typeModels.InboxRule, InboxRuleTypeRef), values);
}
export const InternalGroupDataTypeRef = new TypeRef("tutanota", "InternalGroupData");
export function createInternalGroupData(values) {
    return Object.assign(create(typeModels.InternalGroupData, InternalGroupDataTypeRef), values);
}
export const InternalRecipientKeyDataTypeRef = new TypeRef("tutanota", "InternalRecipientKeyData");
export function createInternalRecipientKeyData(values) {
    return Object.assign(create(typeModels.InternalRecipientKeyData, InternalRecipientKeyDataTypeRef), values);
}
export const KnowledgeBaseEntryTypeRef = new TypeRef("tutanota", "KnowledgeBaseEntry");
export function createKnowledgeBaseEntry(values) {
    return Object.assign(create(typeModels.KnowledgeBaseEntry, KnowledgeBaseEntryTypeRef), values);
}
export const KnowledgeBaseEntryKeywordTypeRef = new TypeRef("tutanota", "KnowledgeBaseEntryKeyword");
export function createKnowledgeBaseEntryKeyword(values) {
    return Object.assign(create(typeModels.KnowledgeBaseEntryKeyword, KnowledgeBaseEntryKeywordTypeRef), values);
}
export const ListUnsubscribeDataTypeRef = new TypeRef("tutanota", "ListUnsubscribeData");
export function createListUnsubscribeData(values) {
    return Object.assign(create(typeModels.ListUnsubscribeData, ListUnsubscribeDataTypeRef), values);
}
export const MailTypeRef = new TypeRef("tutanota", "Mail");
export function createMail(values) {
    return Object.assign(create(typeModels.Mail, MailTypeRef), values);
}
export const MailAddressTypeRef = new TypeRef("tutanota", "MailAddress");
export function createMailAddress(values) {
    return Object.assign(create(typeModels.MailAddress, MailAddressTypeRef), values);
}
export const MailAddressPropertiesTypeRef = new TypeRef("tutanota", "MailAddressProperties");
export function createMailAddressProperties(values) {
    return Object.assign(create(typeModels.MailAddressProperties, MailAddressPropertiesTypeRef), values);
}
export const MailBagTypeRef = new TypeRef("tutanota", "MailBag");
export function createMailBag(values) {
    return Object.assign(create(typeModels.MailBag, MailBagTypeRef), values);
}
export const MailBoxTypeRef = new TypeRef("tutanota", "MailBox");
export function createMailBox(values) {
    return Object.assign(create(typeModels.MailBox, MailBoxTypeRef), values);
}
export const MailDetailsTypeRef = new TypeRef("tutanota", "MailDetails");
export function createMailDetails(values) {
    return Object.assign(create(typeModels.MailDetails, MailDetailsTypeRef), values);
}
export const MailDetailsBlobTypeRef = new TypeRef("tutanota", "MailDetailsBlob");
export function createMailDetailsBlob(values) {
    return Object.assign(create(typeModels.MailDetailsBlob, MailDetailsBlobTypeRef), values);
}
export const MailDetailsDraftTypeRef = new TypeRef("tutanota", "MailDetailsDraft");
export function createMailDetailsDraft(values) {
    return Object.assign(create(typeModels.MailDetailsDraft, MailDetailsDraftTypeRef), values);
}
export const MailDetailsDraftsRefTypeRef = new TypeRef("tutanota", "MailDetailsDraftsRef");
export function createMailDetailsDraftsRef(values) {
    return Object.assign(create(typeModels.MailDetailsDraftsRef, MailDetailsDraftsRefTypeRef), values);
}
export const MailExportTokenServicePostOutTypeRef = new TypeRef("tutanota", "MailExportTokenServicePostOut");
export function createMailExportTokenServicePostOut(values) {
    return Object.assign(create(typeModels.MailExportTokenServicePostOut, MailExportTokenServicePostOutTypeRef), values);
}
export const MailFolderTypeRef = new TypeRef("tutanota", "MailFolder");
export function createMailFolder(values) {
    return Object.assign(create(typeModels.MailFolder, MailFolderTypeRef), values);
}
export const MailFolderRefTypeRef = new TypeRef("tutanota", "MailFolderRef");
export function createMailFolderRef(values) {
    return Object.assign(create(typeModels.MailFolderRef, MailFolderRefTypeRef), values);
}
export const MailSetEntryTypeRef = new TypeRef("tutanota", "MailSetEntry");
export function createMailSetEntry(values) {
    return Object.assign(create(typeModels.MailSetEntry, MailSetEntryTypeRef), values);
}
export const MailboxGroupRootTypeRef = new TypeRef("tutanota", "MailboxGroupRoot");
export function createMailboxGroupRoot(values) {
    return Object.assign(create(typeModels.MailboxGroupRoot, MailboxGroupRootTypeRef), values);
}
export const MailboxPropertiesTypeRef = new TypeRef("tutanota", "MailboxProperties");
export function createMailboxProperties(values) {
    return Object.assign(create(typeModels.MailboxProperties, MailboxPropertiesTypeRef), values);
}
export const MailboxServerPropertiesTypeRef = new TypeRef("tutanota", "MailboxServerProperties");
export function createMailboxServerProperties(values) {
    return Object.assign(create(typeModels.MailboxServerProperties, MailboxServerPropertiesTypeRef), values);
}
export const ManageLabelServiceDeleteInTypeRef = new TypeRef("tutanota", "ManageLabelServiceDeleteIn");
export function createManageLabelServiceDeleteIn(values) {
    return Object.assign(create(typeModels.ManageLabelServiceDeleteIn, ManageLabelServiceDeleteInTypeRef), values);
}
export const ManageLabelServiceLabelDataTypeRef = new TypeRef("tutanota", "ManageLabelServiceLabelData");
export function createManageLabelServiceLabelData(values) {
    return Object.assign(create(typeModels.ManageLabelServiceLabelData, ManageLabelServiceLabelDataTypeRef), values);
}
export const ManageLabelServicePostInTypeRef = new TypeRef("tutanota", "ManageLabelServicePostIn");
export function createManageLabelServicePostIn(values) {
    return Object.assign(create(typeModels.ManageLabelServicePostIn, ManageLabelServicePostInTypeRef), values);
}
export const MoveMailDataTypeRef = new TypeRef("tutanota", "MoveMailData");
export function createMoveMailData(values) {
    return Object.assign(create(typeModels.MoveMailData, MoveMailDataTypeRef), values);
}
export const NewDraftAttachmentTypeRef = new TypeRef("tutanota", "NewDraftAttachment");
export function createNewDraftAttachment(values) {
    return Object.assign(create(typeModels.NewDraftAttachment, NewDraftAttachmentTypeRef), values);
}
export const NewImportAttachmentTypeRef = new TypeRef("tutanota", "NewImportAttachment");
export function createNewImportAttachment(values) {
    return Object.assign(create(typeModels.NewImportAttachment, NewImportAttachmentTypeRef), values);
}
export const NewsIdTypeRef = new TypeRef("tutanota", "NewsId");
export function createNewsId(values) {
    return Object.assign(create(typeModels.NewsId, NewsIdTypeRef), values);
}
export const NewsInTypeRef = new TypeRef("tutanota", "NewsIn");
export function createNewsIn(values) {
    return Object.assign(create(typeModels.NewsIn, NewsInTypeRef), values);
}
export const NewsOutTypeRef = new TypeRef("tutanota", "NewsOut");
export function createNewsOut(values) {
    return Object.assign(create(typeModels.NewsOut, NewsOutTypeRef), values);
}
export const NotificationMailTypeRef = new TypeRef("tutanota", "NotificationMail");
export function createNotificationMail(values) {
    return Object.assign(create(typeModels.NotificationMail, NotificationMailTypeRef), values);
}
export const OutOfOfficeNotificationTypeRef = new TypeRef("tutanota", "OutOfOfficeNotification");
export function createOutOfOfficeNotification(values) {
    return Object.assign(create(typeModels.OutOfOfficeNotification, OutOfOfficeNotificationTypeRef), values);
}
export const OutOfOfficeNotificationMessageTypeRef = new TypeRef("tutanota", "OutOfOfficeNotificationMessage");
export function createOutOfOfficeNotificationMessage(values) {
    return Object.assign(create(typeModels.OutOfOfficeNotificationMessage, OutOfOfficeNotificationMessageTypeRef), values);
}
export const OutOfOfficeNotificationRecipientListTypeRef = new TypeRef("tutanota", "OutOfOfficeNotificationRecipientList");
export function createOutOfOfficeNotificationRecipientList(values) {
    return Object.assign(create(typeModels.OutOfOfficeNotificationRecipientList, OutOfOfficeNotificationRecipientListTypeRef), values);
}
export const PhishingMarkerWebsocketDataTypeRef = new TypeRef("tutanota", "PhishingMarkerWebsocketData");
export function createPhishingMarkerWebsocketData(values) {
    return Object.assign(create(typeModels.PhishingMarkerWebsocketData, PhishingMarkerWebsocketDataTypeRef), values);
}
export const PhotosRefTypeRef = new TypeRef("tutanota", "PhotosRef");
export function createPhotosRef(values) {
    return Object.assign(create(typeModels.PhotosRef, PhotosRefTypeRef), values);
}
export const ReceiveInfoServiceDataTypeRef = new TypeRef("tutanota", "ReceiveInfoServiceData");
export function createReceiveInfoServiceData(values) {
    return Object.assign(create(typeModels.ReceiveInfoServiceData, ReceiveInfoServiceDataTypeRef), values);
}
export const RecipientsTypeRef = new TypeRef("tutanota", "Recipients");
export function createRecipients(values) {
    return Object.assign(create(typeModels.Recipients, RecipientsTypeRef), values);
}
export const RemoteImapSyncInfoTypeRef = new TypeRef("tutanota", "RemoteImapSyncInfo");
export function createRemoteImapSyncInfo(values) {
    return Object.assign(create(typeModels.RemoteImapSyncInfo, RemoteImapSyncInfoTypeRef), values);
}
export const ReportMailPostDataTypeRef = new TypeRef("tutanota", "ReportMailPostData");
export function createReportMailPostData(values) {
    return Object.assign(create(typeModels.ReportMailPostData, ReportMailPostDataTypeRef), values);
}
export const ReportedMailFieldMarkerTypeRef = new TypeRef("tutanota", "ReportedMailFieldMarker");
export function createReportedMailFieldMarker(values) {
    return Object.assign(create(typeModels.ReportedMailFieldMarker, ReportedMailFieldMarkerTypeRef), values);
}
export const SecureExternalRecipientKeyDataTypeRef = new TypeRef("tutanota", "SecureExternalRecipientKeyData");
export function createSecureExternalRecipientKeyData(values) {
    return Object.assign(create(typeModels.SecureExternalRecipientKeyData, SecureExternalRecipientKeyDataTypeRef), values);
}
export const SendDraftDataTypeRef = new TypeRef("tutanota", "SendDraftData");
export function createSendDraftData(values) {
    return Object.assign(create(typeModels.SendDraftData, SendDraftDataTypeRef), values);
}
export const SendDraftReturnTypeRef = new TypeRef("tutanota", "SendDraftReturn");
export function createSendDraftReturn(values) {
    return Object.assign(create(typeModels.SendDraftReturn, SendDraftReturnTypeRef), values);
}
export const SharedGroupDataTypeRef = new TypeRef("tutanota", "SharedGroupData");
export function createSharedGroupData(values) {
    return Object.assign(create(typeModels.SharedGroupData, SharedGroupDataTypeRef), values);
}
export const SimpleMoveMailPostInTypeRef = new TypeRef("tutanota", "SimpleMoveMailPostIn");
export function createSimpleMoveMailPostIn(values) {
    return Object.assign(create(typeModels.SimpleMoveMailPostIn, SimpleMoveMailPostInTypeRef), values);
}
export const SpamResultsTypeRef = new TypeRef("tutanota", "SpamResults");
export function createSpamResults(values) {
    return Object.assign(create(typeModels.SpamResults, SpamResultsTypeRef), values);
}
export const SubfilesTypeRef = new TypeRef("tutanota", "Subfiles");
export function createSubfiles(values) {
    return Object.assign(create(typeModels.Subfiles, SubfilesTypeRef), values);
}
export const SupportCategoryTypeRef = new TypeRef("tutanota", "SupportCategory");
export function createSupportCategory(values) {
    return Object.assign(create(typeModels.SupportCategory, SupportCategoryTypeRef), values);
}
export const SupportDataTypeRef = new TypeRef("tutanota", "SupportData");
export function createSupportData(values) {
    return Object.assign(create(typeModels.SupportData, SupportDataTypeRef), values);
}
export const SupportTopicTypeRef = new TypeRef("tutanota", "SupportTopic");
export function createSupportTopic(values) {
    return Object.assign(create(typeModels.SupportTopic, SupportTopicTypeRef), values);
}
export const SymEncInternalRecipientKeyDataTypeRef = new TypeRef("tutanota", "SymEncInternalRecipientKeyData");
export function createSymEncInternalRecipientKeyData(values) {
    return Object.assign(create(typeModels.SymEncInternalRecipientKeyData, SymEncInternalRecipientKeyDataTypeRef), values);
}
export const TemplateGroupRootTypeRef = new TypeRef("tutanota", "TemplateGroupRoot");
export function createTemplateGroupRoot(values) {
    return Object.assign(create(typeModels.TemplateGroupRoot, TemplateGroupRootTypeRef), values);
}
export const TranslationGetInTypeRef = new TypeRef("tutanota", "TranslationGetIn");
export function createTranslationGetIn(values) {
    return Object.assign(create(typeModels.TranslationGetIn, TranslationGetInTypeRef), values);
}
export const TranslationGetOutTypeRef = new TypeRef("tutanota", "TranslationGetOut");
export function createTranslationGetOut(values) {
    return Object.assign(create(typeModels.TranslationGetOut, TranslationGetOutTypeRef), values);
}
export const TutanotaPropertiesTypeRef = new TypeRef("tutanota", "TutanotaProperties");
export function createTutanotaProperties(values) {
    return Object.assign(create(typeModels.TutanotaProperties, TutanotaPropertiesTypeRef), values);
}
export const UnreadMailStatePostInTypeRef = new TypeRef("tutanota", "UnreadMailStatePostIn");
export function createUnreadMailStatePostIn(values) {
    return Object.assign(create(typeModels.UnreadMailStatePostIn, UnreadMailStatePostInTypeRef), values);
}
export const UpdateMailFolderDataTypeRef = new TypeRef("tutanota", "UpdateMailFolderData");
export function createUpdateMailFolderData(values) {
    return Object.assign(create(typeModels.UpdateMailFolderData, UpdateMailFolderDataTypeRef), values);
}
export const UserAccountCreateDataTypeRef = new TypeRef("tutanota", "UserAccountCreateData");
export function createUserAccountCreateData(values) {
    return Object.assign(create(typeModels.UserAccountCreateData, UserAccountCreateDataTypeRef), values);
}
export const UserAccountUserDataTypeRef = new TypeRef("tutanota", "UserAccountUserData");
export function createUserAccountUserData(values) {
    return Object.assign(create(typeModels.UserAccountUserData, UserAccountUserDataTypeRef), values);
}
export const UserAreaGroupDataTypeRef = new TypeRef("tutanota", "UserAreaGroupData");
export function createUserAreaGroupData(values) {
    return Object.assign(create(typeModels.UserAreaGroupData, UserAreaGroupDataTypeRef), values);
}
export const UserAreaGroupDeleteDataTypeRef = new TypeRef("tutanota", "UserAreaGroupDeleteData");
export function createUserAreaGroupDeleteData(values) {
    return Object.assign(create(typeModels.UserAreaGroupDeleteData, UserAreaGroupDeleteDataTypeRef), values);
}
export const UserAreaGroupPostDataTypeRef = new TypeRef("tutanota", "UserAreaGroupPostData");
export function createUserAreaGroupPostData(values) {
    return Object.assign(create(typeModels.UserAreaGroupPostData, UserAreaGroupPostDataTypeRef), values);
}
export const UserSettingsGroupRootTypeRef = new TypeRef("tutanota", "UserSettingsGroupRoot");
export function createUserSettingsGroupRoot(values) {
    return Object.assign(create(typeModels.UserSettingsGroupRoot, UserSettingsGroupRootTypeRef), values);
}
//# sourceMappingURL=TypeRefs.js.map