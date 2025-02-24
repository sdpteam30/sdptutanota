import { create } from "../../common/utils/EntityUtils.js";
import { TypeRef } from "@tutao/tutanota-utils";
import { typeModels } from "./TypeModels.js";
export const AccountingInfoTypeRef = new TypeRef("sys", "AccountingInfo");
export function createAccountingInfo(values) {
    return Object.assign(create(typeModels.AccountingInfo, AccountingInfoTypeRef), values);
}
export const AdminGroupKeyDistributionElementTypeRef = new TypeRef("sys", "AdminGroupKeyDistributionElement");
export function createAdminGroupKeyDistributionElement(values) {
    return Object.assign(create(typeModels.AdminGroupKeyDistributionElement, AdminGroupKeyDistributionElementTypeRef), values);
}
export const AdminGroupKeyRotationGetOutTypeRef = new TypeRef("sys", "AdminGroupKeyRotationGetOut");
export function createAdminGroupKeyRotationGetOut(values) {
    return Object.assign(create(typeModels.AdminGroupKeyRotationGetOut, AdminGroupKeyRotationGetOutTypeRef), values);
}
export const AdminGroupKeyRotationPostInTypeRef = new TypeRef("sys", "AdminGroupKeyRotationPostIn");
export function createAdminGroupKeyRotationPostIn(values) {
    return Object.assign(create(typeModels.AdminGroupKeyRotationPostIn, AdminGroupKeyRotationPostInTypeRef), values);
}
export const AdminGroupKeyRotationPutInTypeRef = new TypeRef("sys", "AdminGroupKeyRotationPutIn");
export function createAdminGroupKeyRotationPutIn(values) {
    return Object.assign(create(typeModels.AdminGroupKeyRotationPutIn, AdminGroupKeyRotationPutInTypeRef), values);
}
export const AffiliatePartnerKpiMonthSummaryTypeRef = new TypeRef("sys", "AffiliatePartnerKpiMonthSummary");
export function createAffiliatePartnerKpiMonthSummary(values) {
    return Object.assign(create(typeModels.AffiliatePartnerKpiMonthSummary, AffiliatePartnerKpiMonthSummaryTypeRef), values);
}
export const AffiliatePartnerKpiServiceGetOutTypeRef = new TypeRef("sys", "AffiliatePartnerKpiServiceGetOut");
export function createAffiliatePartnerKpiServiceGetOut(values) {
    return Object.assign(create(typeModels.AffiliatePartnerKpiServiceGetOut, AffiliatePartnerKpiServiceGetOutTypeRef), values);
}
export const AlarmInfoTypeRef = new TypeRef("sys", "AlarmInfo");
export function createAlarmInfo(values) {
    return Object.assign(create(typeModels.AlarmInfo, AlarmInfoTypeRef), values);
}
export const AlarmNotificationTypeRef = new TypeRef("sys", "AlarmNotification");
export function createAlarmNotification(values) {
    return Object.assign(create(typeModels.AlarmNotification, AlarmNotificationTypeRef), values);
}
export const AlarmServicePostTypeRef = new TypeRef("sys", "AlarmServicePost");
export function createAlarmServicePost(values) {
    return Object.assign(create(typeModels.AlarmServicePost, AlarmServicePostTypeRef), values);
}
export const AppStoreSubscriptionGetInTypeRef = new TypeRef("sys", "AppStoreSubscriptionGetIn");
export function createAppStoreSubscriptionGetIn(values) {
    return Object.assign(create(typeModels.AppStoreSubscriptionGetIn, AppStoreSubscriptionGetInTypeRef), values);
}
export const AppStoreSubscriptionGetOutTypeRef = new TypeRef("sys", "AppStoreSubscriptionGetOut");
export function createAppStoreSubscriptionGetOut(values) {
    return Object.assign(create(typeModels.AppStoreSubscriptionGetOut, AppStoreSubscriptionGetOutTypeRef), values);
}
export const ArchiveRefTypeRef = new TypeRef("sys", "ArchiveRef");
export function createArchiveRef(values) {
    return Object.assign(create(typeModels.ArchiveRef, ArchiveRefTypeRef), values);
}
export const ArchiveTypeTypeRef = new TypeRef("sys", "ArchiveType");
export function createArchiveType(values) {
    return Object.assign(create(typeModels.ArchiveType, ArchiveTypeTypeRef), values);
}
export const AuditLogEntryTypeRef = new TypeRef("sys", "AuditLogEntry");
export function createAuditLogEntry(values) {
    return Object.assign(create(typeModels.AuditLogEntry, AuditLogEntryTypeRef), values);
}
export const AuditLogRefTypeRef = new TypeRef("sys", "AuditLogRef");
export function createAuditLogRef(values) {
    return Object.assign(create(typeModels.AuditLogRef, AuditLogRefTypeRef), values);
}
export const AuthenticatedDeviceTypeRef = new TypeRef("sys", "AuthenticatedDevice");
export function createAuthenticatedDevice(values) {
    return Object.assign(create(typeModels.AuthenticatedDevice, AuthenticatedDeviceTypeRef), values);
}
export const AuthenticationTypeRef = new TypeRef("sys", "Authentication");
export function createAuthentication(values) {
    return Object.assign(create(typeModels.Authentication, AuthenticationTypeRef), values);
}
export const AutoLoginDataDeleteTypeRef = new TypeRef("sys", "AutoLoginDataDelete");
export function createAutoLoginDataDelete(values) {
    return Object.assign(create(typeModels.AutoLoginDataDelete, AutoLoginDataDeleteTypeRef), values);
}
export const AutoLoginDataGetTypeRef = new TypeRef("sys", "AutoLoginDataGet");
export function createAutoLoginDataGet(values) {
    return Object.assign(create(typeModels.AutoLoginDataGet, AutoLoginDataGetTypeRef), values);
}
export const AutoLoginDataReturnTypeRef = new TypeRef("sys", "AutoLoginDataReturn");
export function createAutoLoginDataReturn(values) {
    return Object.assign(create(typeModels.AutoLoginDataReturn, AutoLoginDataReturnTypeRef), values);
}
export const AutoLoginPostReturnTypeRef = new TypeRef("sys", "AutoLoginPostReturn");
export function createAutoLoginPostReturn(values) {
    return Object.assign(create(typeModels.AutoLoginPostReturn, AutoLoginPostReturnTypeRef), values);
}
export const BlobTypeRef = new TypeRef("sys", "Blob");
export function createBlob(values) {
    return Object.assign(create(typeModels.Blob, BlobTypeRef), values);
}
export const BlobReferenceTokenWrapperTypeRef = new TypeRef("sys", "BlobReferenceTokenWrapper");
export function createBlobReferenceTokenWrapper(values) {
    return Object.assign(create(typeModels.BlobReferenceTokenWrapper, BlobReferenceTokenWrapperTypeRef), values);
}
export const BookingTypeRef = new TypeRef("sys", "Booking");
export function createBooking(values) {
    return Object.assign(create(typeModels.Booking, BookingTypeRef), values);
}
export const BookingItemTypeRef = new TypeRef("sys", "BookingItem");
export function createBookingItem(values) {
    return Object.assign(create(typeModels.BookingItem, BookingItemTypeRef), values);
}
export const BookingsRefTypeRef = new TypeRef("sys", "BookingsRef");
export function createBookingsRef(values) {
    return Object.assign(create(typeModels.BookingsRef, BookingsRefTypeRef), values);
}
export const BootstrapFeatureTypeRef = new TypeRef("sys", "BootstrapFeature");
export function createBootstrapFeature(values) {
    return Object.assign(create(typeModels.BootstrapFeature, BootstrapFeatureTypeRef), values);
}
export const Braintree3ds2RequestTypeRef = new TypeRef("sys", "Braintree3ds2Request");
export function createBraintree3ds2Request(values) {
    return Object.assign(create(typeModels.Braintree3ds2Request, Braintree3ds2RequestTypeRef), values);
}
export const Braintree3ds2ResponseTypeRef = new TypeRef("sys", "Braintree3ds2Response");
export function createBraintree3ds2Response(values) {
    return Object.assign(create(typeModels.Braintree3ds2Response, Braintree3ds2ResponseTypeRef), values);
}
export const BrandingDomainDataTypeRef = new TypeRef("sys", "BrandingDomainData");
export function createBrandingDomainData(values) {
    return Object.assign(create(typeModels.BrandingDomainData, BrandingDomainDataTypeRef), values);
}
export const BrandingDomainDeleteDataTypeRef = new TypeRef("sys", "BrandingDomainDeleteData");
export function createBrandingDomainDeleteData(values) {
    return Object.assign(create(typeModels.BrandingDomainDeleteData, BrandingDomainDeleteDataTypeRef), values);
}
export const BrandingDomainGetReturnTypeRef = new TypeRef("sys", "BrandingDomainGetReturn");
export function createBrandingDomainGetReturn(values) {
    return Object.assign(create(typeModels.BrandingDomainGetReturn, BrandingDomainGetReturnTypeRef), values);
}
export const BucketTypeRef = new TypeRef("sys", "Bucket");
export function createBucket(values) {
    return Object.assign(create(typeModels.Bucket, BucketTypeRef), values);
}
export const BucketKeyTypeRef = new TypeRef("sys", "BucketKey");
export function createBucketKey(values) {
    return Object.assign(create(typeModels.BucketKey, BucketKeyTypeRef), values);
}
export const BucketPermissionTypeRef = new TypeRef("sys", "BucketPermission");
export function createBucketPermission(values) {
    return Object.assign(create(typeModels.BucketPermission, BucketPermissionTypeRef), values);
}
export const CalendarAdvancedRepeatRuleTypeRef = new TypeRef("sys", "CalendarAdvancedRepeatRule");
export function createCalendarAdvancedRepeatRule(values) {
    return Object.assign(create(typeModels.CalendarAdvancedRepeatRule, CalendarAdvancedRepeatRuleTypeRef), values);
}
export const CalendarEventRefTypeRef = new TypeRef("sys", "CalendarEventRef");
export function createCalendarEventRef(values) {
    return Object.assign(create(typeModels.CalendarEventRef, CalendarEventRefTypeRef), values);
}
export const CertificateInfoTypeRef = new TypeRef("sys", "CertificateInfo");
export function createCertificateInfo(values) {
    return Object.assign(create(typeModels.CertificateInfo, CertificateInfoTypeRef), values);
}
export const ChallengeTypeRef = new TypeRef("sys", "Challenge");
export function createChallenge(values) {
    return Object.assign(create(typeModels.Challenge, ChallengeTypeRef), values);
}
export const ChangeKdfPostInTypeRef = new TypeRef("sys", "ChangeKdfPostIn");
export function createChangeKdfPostIn(values) {
    return Object.assign(create(typeModels.ChangeKdfPostIn, ChangeKdfPostInTypeRef), values);
}
export const ChangePasswordPostInTypeRef = new TypeRef("sys", "ChangePasswordPostIn");
export function createChangePasswordPostIn(values) {
    return Object.assign(create(typeModels.ChangePasswordPostIn, ChangePasswordPostInTypeRef), values);
}
export const ChatTypeRef = new TypeRef("sys", "Chat");
export function createChat(values) {
    return Object.assign(create(typeModels.Chat, ChatTypeRef), values);
}
export const CloseSessionServicePostTypeRef = new TypeRef("sys", "CloseSessionServicePost");
export function createCloseSessionServicePost(values) {
    return Object.assign(create(typeModels.CloseSessionServicePost, CloseSessionServicePostTypeRef), values);
}
export const CreateCustomerServerPropertiesDataTypeRef = new TypeRef("sys", "CreateCustomerServerPropertiesData");
export function createCreateCustomerServerPropertiesData(values) {
    return Object.assign(create(typeModels.CreateCustomerServerPropertiesData, CreateCustomerServerPropertiesDataTypeRef), values);
}
export const CreateCustomerServerPropertiesReturnTypeRef = new TypeRef("sys", "CreateCustomerServerPropertiesReturn");
export function createCreateCustomerServerPropertiesReturn(values) {
    return Object.assign(create(typeModels.CreateCustomerServerPropertiesReturn, CreateCustomerServerPropertiesReturnTypeRef), values);
}
export const CreateSessionDataTypeRef = new TypeRef("sys", "CreateSessionData");
export function createCreateSessionData(values) {
    return Object.assign(create(typeModels.CreateSessionData, CreateSessionDataTypeRef), values);
}
export const CreateSessionReturnTypeRef = new TypeRef("sys", "CreateSessionReturn");
export function createCreateSessionReturn(values) {
    return Object.assign(create(typeModels.CreateSessionReturn, CreateSessionReturnTypeRef), values);
}
export const CreditCardTypeRef = new TypeRef("sys", "CreditCard");
export function createCreditCard(values) {
    return Object.assign(create(typeModels.CreditCard, CreditCardTypeRef), values);
}
export const CustomDomainCheckGetInTypeRef = new TypeRef("sys", "CustomDomainCheckGetIn");
export function createCustomDomainCheckGetIn(values) {
    return Object.assign(create(typeModels.CustomDomainCheckGetIn, CustomDomainCheckGetInTypeRef), values);
}
export const CustomDomainCheckGetOutTypeRef = new TypeRef("sys", "CustomDomainCheckGetOut");
export function createCustomDomainCheckGetOut(values) {
    return Object.assign(create(typeModels.CustomDomainCheckGetOut, CustomDomainCheckGetOutTypeRef), values);
}
export const CustomDomainDataTypeRef = new TypeRef("sys", "CustomDomainData");
export function createCustomDomainData(values) {
    return Object.assign(create(typeModels.CustomDomainData, CustomDomainDataTypeRef), values);
}
export const CustomDomainReturnTypeRef = new TypeRef("sys", "CustomDomainReturn");
export function createCustomDomainReturn(values) {
    return Object.assign(create(typeModels.CustomDomainReturn, CustomDomainReturnTypeRef), values);
}
export const CustomerTypeRef = new TypeRef("sys", "Customer");
export function createCustomer(values) {
    return Object.assign(create(typeModels.Customer, CustomerTypeRef), values);
}
export const CustomerAccountTerminationPostInTypeRef = new TypeRef("sys", "CustomerAccountTerminationPostIn");
export function createCustomerAccountTerminationPostIn(values) {
    return Object.assign(create(typeModels.CustomerAccountTerminationPostIn, CustomerAccountTerminationPostInTypeRef), values);
}
export const CustomerAccountTerminationPostOutTypeRef = new TypeRef("sys", "CustomerAccountTerminationPostOut");
export function createCustomerAccountTerminationPostOut(values) {
    return Object.assign(create(typeModels.CustomerAccountTerminationPostOut, CustomerAccountTerminationPostOutTypeRef), values);
}
export const CustomerAccountTerminationRequestTypeRef = new TypeRef("sys", "CustomerAccountTerminationRequest");
export function createCustomerAccountTerminationRequest(values) {
    return Object.assign(create(typeModels.CustomerAccountTerminationRequest, CustomerAccountTerminationRequestTypeRef), values);
}
export const CustomerInfoTypeRef = new TypeRef("sys", "CustomerInfo");
export function createCustomerInfo(values) {
    return Object.assign(create(typeModels.CustomerInfo, CustomerInfoTypeRef), values);
}
export const CustomerPropertiesTypeRef = new TypeRef("sys", "CustomerProperties");
export function createCustomerProperties(values) {
    return Object.assign(create(typeModels.CustomerProperties, CustomerPropertiesTypeRef), values);
}
export const CustomerServerPropertiesTypeRef = new TypeRef("sys", "CustomerServerProperties");
export function createCustomerServerProperties(values) {
    return Object.assign(create(typeModels.CustomerServerProperties, CustomerServerPropertiesTypeRef), values);
}
export const DateWrapperTypeRef = new TypeRef("sys", "DateWrapper");
export function createDateWrapper(values) {
    return Object.assign(create(typeModels.DateWrapper, DateWrapperTypeRef), values);
}
export const DebitServicePutDataTypeRef = new TypeRef("sys", "DebitServicePutData");
export function createDebitServicePutData(values) {
    return Object.assign(create(typeModels.DebitServicePutData, DebitServicePutDataTypeRef), values);
}
export const DeleteCustomerDataTypeRef = new TypeRef("sys", "DeleteCustomerData");
export function createDeleteCustomerData(values) {
    return Object.assign(create(typeModels.DeleteCustomerData, DeleteCustomerDataTypeRef), values);
}
export const DnsRecordTypeRef = new TypeRef("sys", "DnsRecord");
export function createDnsRecord(values) {
    return Object.assign(create(typeModels.DnsRecord, DnsRecordTypeRef), values);
}
export const DomainInfoTypeRef = new TypeRef("sys", "DomainInfo");
export function createDomainInfo(values) {
    return Object.assign(create(typeModels.DomainInfo, DomainInfoTypeRef), values);
}
export const DomainMailAddressAvailabilityDataTypeRef = new TypeRef("sys", "DomainMailAddressAvailabilityData");
export function createDomainMailAddressAvailabilityData(values) {
    return Object.assign(create(typeModels.DomainMailAddressAvailabilityData, DomainMailAddressAvailabilityDataTypeRef), values);
}
export const DomainMailAddressAvailabilityReturnTypeRef = new TypeRef("sys", "DomainMailAddressAvailabilityReturn");
export function createDomainMailAddressAvailabilityReturn(values) {
    return Object.assign(create(typeModels.DomainMailAddressAvailabilityReturn, DomainMailAddressAvailabilityReturnTypeRef), values);
}
export const EmailSenderListElementTypeRef = new TypeRef("sys", "EmailSenderListElement");
export function createEmailSenderListElement(values) {
    return Object.assign(create(typeModels.EmailSenderListElement, EmailSenderListElementTypeRef), values);
}
export const EntityEventBatchTypeRef = new TypeRef("sys", "EntityEventBatch");
export function createEntityEventBatch(values) {
    return Object.assign(create(typeModels.EntityEventBatch, EntityEventBatchTypeRef), values);
}
export const EntityUpdateTypeRef = new TypeRef("sys", "EntityUpdate");
export function createEntityUpdate(values) {
    return Object.assign(create(typeModels.EntityUpdate, EntityUpdateTypeRef), values);
}
export const ExceptionTypeRef = new TypeRef("sys", "Exception");
export function createException(values) {
    return Object.assign(create(typeModels.Exception, ExceptionTypeRef), values);
}
export const ExternalPropertiesReturnTypeRef = new TypeRef("sys", "ExternalPropertiesReturn");
export function createExternalPropertiesReturn(values) {
    return Object.assign(create(typeModels.ExternalPropertiesReturn, ExternalPropertiesReturnTypeRef), values);
}
export const ExternalUserReferenceTypeRef = new TypeRef("sys", "ExternalUserReference");
export function createExternalUserReference(values) {
    return Object.assign(create(typeModels.ExternalUserReference, ExternalUserReferenceTypeRef), values);
}
export const FeatureTypeRef = new TypeRef("sys", "Feature");
export function createFeature(values) {
    return Object.assign(create(typeModels.Feature, FeatureTypeRef), values);
}
export const FileTypeRef = new TypeRef("sys", "File");
export function createFile(values) {
    return Object.assign(create(typeModels.File, FileTypeRef), values);
}
export const GeneratedIdWrapperTypeRef = new TypeRef("sys", "GeneratedIdWrapper");
export function createGeneratedIdWrapper(values) {
    return Object.assign(create(typeModels.GeneratedIdWrapper, GeneratedIdWrapperTypeRef), values);
}
export const GiftCardTypeRef = new TypeRef("sys", "GiftCard");
export function createGiftCard(values) {
    return Object.assign(create(typeModels.GiftCard, GiftCardTypeRef), values);
}
export const GiftCardCreateDataTypeRef = new TypeRef("sys", "GiftCardCreateData");
export function createGiftCardCreateData(values) {
    return Object.assign(create(typeModels.GiftCardCreateData, GiftCardCreateDataTypeRef), values);
}
export const GiftCardCreateReturnTypeRef = new TypeRef("sys", "GiftCardCreateReturn");
export function createGiftCardCreateReturn(values) {
    return Object.assign(create(typeModels.GiftCardCreateReturn, GiftCardCreateReturnTypeRef), values);
}
export const GiftCardDeleteDataTypeRef = new TypeRef("sys", "GiftCardDeleteData");
export function createGiftCardDeleteData(values) {
    return Object.assign(create(typeModels.GiftCardDeleteData, GiftCardDeleteDataTypeRef), values);
}
export const GiftCardGetReturnTypeRef = new TypeRef("sys", "GiftCardGetReturn");
export function createGiftCardGetReturn(values) {
    return Object.assign(create(typeModels.GiftCardGetReturn, GiftCardGetReturnTypeRef), values);
}
export const GiftCardOptionTypeRef = new TypeRef("sys", "GiftCardOption");
export function createGiftCardOption(values) {
    return Object.assign(create(typeModels.GiftCardOption, GiftCardOptionTypeRef), values);
}
export const GiftCardRedeemDataTypeRef = new TypeRef("sys", "GiftCardRedeemData");
export function createGiftCardRedeemData(values) {
    return Object.assign(create(typeModels.GiftCardRedeemData, GiftCardRedeemDataTypeRef), values);
}
export const GiftCardRedeemGetReturnTypeRef = new TypeRef("sys", "GiftCardRedeemGetReturn");
export function createGiftCardRedeemGetReturn(values) {
    return Object.assign(create(typeModels.GiftCardRedeemGetReturn, GiftCardRedeemGetReturnTypeRef), values);
}
export const GiftCardsRefTypeRef = new TypeRef("sys", "GiftCardsRef");
export function createGiftCardsRef(values) {
    return Object.assign(create(typeModels.GiftCardsRef, GiftCardsRefTypeRef), values);
}
export const GroupTypeRef = new TypeRef("sys", "Group");
export function createGroup(values) {
    return Object.assign(create(typeModels.Group, GroupTypeRef), values);
}
export const GroupInfoTypeRef = new TypeRef("sys", "GroupInfo");
export function createGroupInfo(values) {
    return Object.assign(create(typeModels.GroupInfo, GroupInfoTypeRef), values);
}
export const GroupKeyTypeRef = new TypeRef("sys", "GroupKey");
export function createGroupKey(values) {
    return Object.assign(create(typeModels.GroupKey, GroupKeyTypeRef), values);
}
export const GroupKeyRotationDataTypeRef = new TypeRef("sys", "GroupKeyRotationData");
export function createGroupKeyRotationData(values) {
    return Object.assign(create(typeModels.GroupKeyRotationData, GroupKeyRotationDataTypeRef), values);
}
export const GroupKeyRotationInfoGetOutTypeRef = new TypeRef("sys", "GroupKeyRotationInfoGetOut");
export function createGroupKeyRotationInfoGetOut(values) {
    return Object.assign(create(typeModels.GroupKeyRotationInfoGetOut, GroupKeyRotationInfoGetOutTypeRef), values);
}
export const GroupKeyRotationPostInTypeRef = new TypeRef("sys", "GroupKeyRotationPostIn");
export function createGroupKeyRotationPostIn(values) {
    return Object.assign(create(typeModels.GroupKeyRotationPostIn, GroupKeyRotationPostInTypeRef), values);
}
export const GroupKeyUpdateTypeRef = new TypeRef("sys", "GroupKeyUpdate");
export function createGroupKeyUpdate(values) {
    return Object.assign(create(typeModels.GroupKeyUpdate, GroupKeyUpdateTypeRef), values);
}
export const GroupKeyUpdateDataTypeRef = new TypeRef("sys", "GroupKeyUpdateData");
export function createGroupKeyUpdateData(values) {
    return Object.assign(create(typeModels.GroupKeyUpdateData, GroupKeyUpdateDataTypeRef), values);
}
export const GroupKeyUpdatesRefTypeRef = new TypeRef("sys", "GroupKeyUpdatesRef");
export function createGroupKeyUpdatesRef(values) {
    return Object.assign(create(typeModels.GroupKeyUpdatesRef, GroupKeyUpdatesRefTypeRef), values);
}
export const GroupKeysRefTypeRef = new TypeRef("sys", "GroupKeysRef");
export function createGroupKeysRef(values) {
    return Object.assign(create(typeModels.GroupKeysRef, GroupKeysRefTypeRef), values);
}
export const GroupMemberTypeRef = new TypeRef("sys", "GroupMember");
export function createGroupMember(values) {
    return Object.assign(create(typeModels.GroupMember, GroupMemberTypeRef), values);
}
export const GroupMembershipTypeRef = new TypeRef("sys", "GroupMembership");
export function createGroupMembership(values) {
    return Object.assign(create(typeModels.GroupMembership, GroupMembershipTypeRef), values);
}
export const GroupMembershipKeyDataTypeRef = new TypeRef("sys", "GroupMembershipKeyData");
export function createGroupMembershipKeyData(values) {
    return Object.assign(create(typeModels.GroupMembershipKeyData, GroupMembershipKeyDataTypeRef), values);
}
export const GroupMembershipUpdateDataTypeRef = new TypeRef("sys", "GroupMembershipUpdateData");
export function createGroupMembershipUpdateData(values) {
    return Object.assign(create(typeModels.GroupMembershipUpdateData, GroupMembershipUpdateDataTypeRef), values);
}
export const GroupRootTypeRef = new TypeRef("sys", "GroupRoot");
export function createGroupRoot(values) {
    return Object.assign(create(typeModels.GroupRoot, GroupRootTypeRef), values);
}
export const IdTupleWrapperTypeRef = new TypeRef("sys", "IdTupleWrapper");
export function createIdTupleWrapper(values) {
    return Object.assign(create(typeModels.IdTupleWrapper, IdTupleWrapperTypeRef), values);
}
export const InstanceSessionKeyTypeRef = new TypeRef("sys", "InstanceSessionKey");
export function createInstanceSessionKey(values) {
    return Object.assign(create(typeModels.InstanceSessionKey, InstanceSessionKeyTypeRef), values);
}
export const InvoiceTypeRef = new TypeRef("sys", "Invoice");
export function createInvoice(values) {
    return Object.assign(create(typeModels.Invoice, InvoiceTypeRef), values);
}
export const InvoiceDataGetInTypeRef = new TypeRef("sys", "InvoiceDataGetIn");
export function createInvoiceDataGetIn(values) {
    return Object.assign(create(typeModels.InvoiceDataGetIn, InvoiceDataGetInTypeRef), values);
}
export const InvoiceDataGetOutTypeRef = new TypeRef("sys", "InvoiceDataGetOut");
export function createInvoiceDataGetOut(values) {
    return Object.assign(create(typeModels.InvoiceDataGetOut, InvoiceDataGetOutTypeRef), values);
}
export const InvoiceDataItemTypeRef = new TypeRef("sys", "InvoiceDataItem");
export function createInvoiceDataItem(values) {
    return Object.assign(create(typeModels.InvoiceDataItem, InvoiceDataItemTypeRef), values);
}
export const InvoiceInfoTypeRef = new TypeRef("sys", "InvoiceInfo");
export function createInvoiceInfo(values) {
    return Object.assign(create(typeModels.InvoiceInfo, InvoiceInfoTypeRef), values);
}
export const InvoiceItemTypeRef = new TypeRef("sys", "InvoiceItem");
export function createInvoiceItem(values) {
    return Object.assign(create(typeModels.InvoiceItem, InvoiceItemTypeRef), values);
}
export const KeyMacTypeRef = new TypeRef("sys", "KeyMac");
export function createKeyMac(values) {
    return Object.assign(create(typeModels.KeyMac, KeyMacTypeRef), values);
}
export const KeyPairTypeRef = new TypeRef("sys", "KeyPair");
export function createKeyPair(values) {
    return Object.assign(create(typeModels.KeyPair, KeyPairTypeRef), values);
}
export const KeyRotationTypeRef = new TypeRef("sys", "KeyRotation");
export function createKeyRotation(values) {
    return Object.assign(create(typeModels.KeyRotation, KeyRotationTypeRef), values);
}
export const KeyRotationsRefTypeRef = new TypeRef("sys", "KeyRotationsRef");
export function createKeyRotationsRef(values) {
    return Object.assign(create(typeModels.KeyRotationsRef, KeyRotationsRefTypeRef), values);
}
export const LocationServiceGetReturnTypeRef = new TypeRef("sys", "LocationServiceGetReturn");
export function createLocationServiceGetReturn(values) {
    return Object.assign(create(typeModels.LocationServiceGetReturn, LocationServiceGetReturnTypeRef), values);
}
export const LoginTypeRef = new TypeRef("sys", "Login");
export function createLogin(values) {
    return Object.assign(create(typeModels.Login, LoginTypeRef), values);
}
export const MailAddressAliasTypeRef = new TypeRef("sys", "MailAddressAlias");
export function createMailAddressAlias(values) {
    return Object.assign(create(typeModels.MailAddressAlias, MailAddressAliasTypeRef), values);
}
export const MailAddressAliasGetInTypeRef = new TypeRef("sys", "MailAddressAliasGetIn");
export function createMailAddressAliasGetIn(values) {
    return Object.assign(create(typeModels.MailAddressAliasGetIn, MailAddressAliasGetInTypeRef), values);
}
export const MailAddressAliasServiceDataTypeRef = new TypeRef("sys", "MailAddressAliasServiceData");
export function createMailAddressAliasServiceData(values) {
    return Object.assign(create(typeModels.MailAddressAliasServiceData, MailAddressAliasServiceDataTypeRef), values);
}
export const MailAddressAliasServiceDataDeleteTypeRef = new TypeRef("sys", "MailAddressAliasServiceDataDelete");
export function createMailAddressAliasServiceDataDelete(values) {
    return Object.assign(create(typeModels.MailAddressAliasServiceDataDelete, MailAddressAliasServiceDataDeleteTypeRef), values);
}
export const MailAddressAliasServiceReturnTypeRef = new TypeRef("sys", "MailAddressAliasServiceReturn");
export function createMailAddressAliasServiceReturn(values) {
    return Object.assign(create(typeModels.MailAddressAliasServiceReturn, MailAddressAliasServiceReturnTypeRef), values);
}
export const MailAddressAvailabilityTypeRef = new TypeRef("sys", "MailAddressAvailability");
export function createMailAddressAvailability(values) {
    return Object.assign(create(typeModels.MailAddressAvailability, MailAddressAvailabilityTypeRef), values);
}
export const MailAddressToGroupTypeRef = new TypeRef("sys", "MailAddressToGroup");
export function createMailAddressToGroup(values) {
    return Object.assign(create(typeModels.MailAddressToGroup, MailAddressToGroupTypeRef), values);
}
export const MembershipAddDataTypeRef = new TypeRef("sys", "MembershipAddData");
export function createMembershipAddData(values) {
    return Object.assign(create(typeModels.MembershipAddData, MembershipAddDataTypeRef), values);
}
export const MembershipPutInTypeRef = new TypeRef("sys", "MembershipPutIn");
export function createMembershipPutIn(values) {
    return Object.assign(create(typeModels.MembershipPutIn, MembershipPutInTypeRef), values);
}
export const MembershipRemoveDataTypeRef = new TypeRef("sys", "MembershipRemoveData");
export function createMembershipRemoveData(values) {
    return Object.assign(create(typeModels.MembershipRemoveData, MembershipRemoveDataTypeRef), values);
}
export const MissedNotificationTypeRef = new TypeRef("sys", "MissedNotification");
export function createMissedNotification(values) {
    return Object.assign(create(typeModels.MissedNotification, MissedNotificationTypeRef), values);
}
export const MultipleMailAddressAvailabilityDataTypeRef = new TypeRef("sys", "MultipleMailAddressAvailabilityData");
export function createMultipleMailAddressAvailabilityData(values) {
    return Object.assign(create(typeModels.MultipleMailAddressAvailabilityData, MultipleMailAddressAvailabilityDataTypeRef), values);
}
export const MultipleMailAddressAvailabilityReturnTypeRef = new TypeRef("sys", "MultipleMailAddressAvailabilityReturn");
export function createMultipleMailAddressAvailabilityReturn(values) {
    return Object.assign(create(typeModels.MultipleMailAddressAvailabilityReturn, MultipleMailAddressAvailabilityReturnTypeRef), values);
}
export const NotificationInfoTypeRef = new TypeRef("sys", "NotificationInfo");
export function createNotificationInfo(values) {
    return Object.assign(create(typeModels.NotificationInfo, NotificationInfoTypeRef), values);
}
export const NotificationMailTemplateTypeRef = new TypeRef("sys", "NotificationMailTemplate");
export function createNotificationMailTemplate(values) {
    return Object.assign(create(typeModels.NotificationMailTemplate, NotificationMailTemplateTypeRef), values);
}
export const NotificationSessionKeyTypeRef = new TypeRef("sys", "NotificationSessionKey");
export function createNotificationSessionKey(values) {
    return Object.assign(create(typeModels.NotificationSessionKey, NotificationSessionKeyTypeRef), values);
}
export const OrderProcessingAgreementTypeRef = new TypeRef("sys", "OrderProcessingAgreement");
export function createOrderProcessingAgreement(values) {
    return Object.assign(create(typeModels.OrderProcessingAgreement, OrderProcessingAgreementTypeRef), values);
}
export const OtpChallengeTypeRef = new TypeRef("sys", "OtpChallenge");
export function createOtpChallenge(values) {
    return Object.assign(create(typeModels.OtpChallenge, OtpChallengeTypeRef), values);
}
export const PaymentDataServiceGetDataTypeRef = new TypeRef("sys", "PaymentDataServiceGetData");
export function createPaymentDataServiceGetData(values) {
    return Object.assign(create(typeModels.PaymentDataServiceGetData, PaymentDataServiceGetDataTypeRef), values);
}
export const PaymentDataServiceGetReturnTypeRef = new TypeRef("sys", "PaymentDataServiceGetReturn");
export function createPaymentDataServiceGetReturn(values) {
    return Object.assign(create(typeModels.PaymentDataServiceGetReturn, PaymentDataServiceGetReturnTypeRef), values);
}
export const PaymentDataServicePostDataTypeRef = new TypeRef("sys", "PaymentDataServicePostData");
export function createPaymentDataServicePostData(values) {
    return Object.assign(create(typeModels.PaymentDataServicePostData, PaymentDataServicePostDataTypeRef), values);
}
export const PaymentDataServicePutDataTypeRef = new TypeRef("sys", "PaymentDataServicePutData");
export function createPaymentDataServicePutData(values) {
    return Object.assign(create(typeModels.PaymentDataServicePutData, PaymentDataServicePutDataTypeRef), values);
}
export const PaymentDataServicePutReturnTypeRef = new TypeRef("sys", "PaymentDataServicePutReturn");
export function createPaymentDataServicePutReturn(values) {
    return Object.assign(create(typeModels.PaymentDataServicePutReturn, PaymentDataServicePutReturnTypeRef), values);
}
export const PaymentErrorInfoTypeRef = new TypeRef("sys", "PaymentErrorInfo");
export function createPaymentErrorInfo(values) {
    return Object.assign(create(typeModels.PaymentErrorInfo, PaymentErrorInfoTypeRef), values);
}
export const PermissionTypeRef = new TypeRef("sys", "Permission");
export function createPermission(values) {
    return Object.assign(create(typeModels.Permission, PermissionTypeRef), values);
}
export const PlanConfigurationTypeRef = new TypeRef("sys", "PlanConfiguration");
export function createPlanConfiguration(values) {
    return Object.assign(create(typeModels.PlanConfiguration, PlanConfigurationTypeRef), values);
}
export const PlanPricesTypeRef = new TypeRef("sys", "PlanPrices");
export function createPlanPrices(values) {
    return Object.assign(create(typeModels.PlanPrices, PlanPricesTypeRef), values);
}
export const PlanServiceGetOutTypeRef = new TypeRef("sys", "PlanServiceGetOut");
export function createPlanServiceGetOut(values) {
    return Object.assign(create(typeModels.PlanServiceGetOut, PlanServiceGetOutTypeRef), values);
}
export const PriceDataTypeRef = new TypeRef("sys", "PriceData");
export function createPriceData(values) {
    return Object.assign(create(typeModels.PriceData, PriceDataTypeRef), values);
}
export const PriceItemDataTypeRef = new TypeRef("sys", "PriceItemData");
export function createPriceItemData(values) {
    return Object.assign(create(typeModels.PriceItemData, PriceItemDataTypeRef), values);
}
export const PriceRequestDataTypeRef = new TypeRef("sys", "PriceRequestData");
export function createPriceRequestData(values) {
    return Object.assign(create(typeModels.PriceRequestData, PriceRequestDataTypeRef), values);
}
export const PriceServiceDataTypeRef = new TypeRef("sys", "PriceServiceData");
export function createPriceServiceData(values) {
    return Object.assign(create(typeModels.PriceServiceData, PriceServiceDataTypeRef), values);
}
export const PriceServiceReturnTypeRef = new TypeRef("sys", "PriceServiceReturn");
export function createPriceServiceReturn(values) {
    return Object.assign(create(typeModels.PriceServiceReturn, PriceServiceReturnTypeRef), values);
}
export const PubDistributionKeyTypeRef = new TypeRef("sys", "PubDistributionKey");
export function createPubDistributionKey(values) {
    return Object.assign(create(typeModels.PubDistributionKey, PubDistributionKeyTypeRef), values);
}
export const PubEncKeyDataTypeRef = new TypeRef("sys", "PubEncKeyData");
export function createPubEncKeyData(values) {
    return Object.assign(create(typeModels.PubEncKeyData, PubEncKeyDataTypeRef), values);
}
export const PublicKeyGetInTypeRef = new TypeRef("sys", "PublicKeyGetIn");
export function createPublicKeyGetIn(values) {
    return Object.assign(create(typeModels.PublicKeyGetIn, PublicKeyGetInTypeRef), values);
}
export const PublicKeyGetOutTypeRef = new TypeRef("sys", "PublicKeyGetOut");
export function createPublicKeyGetOut(values) {
    return Object.assign(create(typeModels.PublicKeyGetOut, PublicKeyGetOutTypeRef), values);
}
export const PublicKeyPutInTypeRef = new TypeRef("sys", "PublicKeyPutIn");
export function createPublicKeyPutIn(values) {
    return Object.assign(create(typeModels.PublicKeyPutIn, PublicKeyPutInTypeRef), values);
}
export const PushIdentifierTypeRef = new TypeRef("sys", "PushIdentifier");
export function createPushIdentifier(values) {
    return Object.assign(create(typeModels.PushIdentifier, PushIdentifierTypeRef), values);
}
export const PushIdentifierListTypeRef = new TypeRef("sys", "PushIdentifierList");
export function createPushIdentifierList(values) {
    return Object.assign(create(typeModels.PushIdentifierList, PushIdentifierListTypeRef), values);
}
export const ReceivedGroupInvitationTypeRef = new TypeRef("sys", "ReceivedGroupInvitation");
export function createReceivedGroupInvitation(values) {
    return Object.assign(create(typeModels.ReceivedGroupInvitation, ReceivedGroupInvitationTypeRef), values);
}
export const RecoverCodeTypeRef = new TypeRef("sys", "RecoverCode");
export function createRecoverCode(values) {
    return Object.assign(create(typeModels.RecoverCode, RecoverCodeTypeRef), values);
}
export const RecoverCodeDataTypeRef = new TypeRef("sys", "RecoverCodeData");
export function createRecoverCodeData(values) {
    return Object.assign(create(typeModels.RecoverCodeData, RecoverCodeDataTypeRef), values);
}
export const ReferralCodeGetInTypeRef = new TypeRef("sys", "ReferralCodeGetIn");
export function createReferralCodeGetIn(values) {
    return Object.assign(create(typeModels.ReferralCodeGetIn, ReferralCodeGetInTypeRef), values);
}
export const ReferralCodePostInTypeRef = new TypeRef("sys", "ReferralCodePostIn");
export function createReferralCodePostIn(values) {
    return Object.assign(create(typeModels.ReferralCodePostIn, ReferralCodePostInTypeRef), values);
}
export const ReferralCodePostOutTypeRef = new TypeRef("sys", "ReferralCodePostOut");
export function createReferralCodePostOut(values) {
    return Object.assign(create(typeModels.ReferralCodePostOut, ReferralCodePostOutTypeRef), values);
}
export const RegistrationCaptchaServiceDataTypeRef = new TypeRef("sys", "RegistrationCaptchaServiceData");
export function createRegistrationCaptchaServiceData(values) {
    return Object.assign(create(typeModels.RegistrationCaptchaServiceData, RegistrationCaptchaServiceDataTypeRef), values);
}
export const RegistrationCaptchaServiceGetDataTypeRef = new TypeRef("sys", "RegistrationCaptchaServiceGetData");
export function createRegistrationCaptchaServiceGetData(values) {
    return Object.assign(create(typeModels.RegistrationCaptchaServiceGetData, RegistrationCaptchaServiceGetDataTypeRef), values);
}
export const RegistrationCaptchaServiceReturnTypeRef = new TypeRef("sys", "RegistrationCaptchaServiceReturn");
export function createRegistrationCaptchaServiceReturn(values) {
    return Object.assign(create(typeModels.RegistrationCaptchaServiceReturn, RegistrationCaptchaServiceReturnTypeRef), values);
}
export const RegistrationReturnTypeRef = new TypeRef("sys", "RegistrationReturn");
export function createRegistrationReturn(values) {
    return Object.assign(create(typeModels.RegistrationReturn, RegistrationReturnTypeRef), values);
}
export const RegistrationServiceDataTypeRef = new TypeRef("sys", "RegistrationServiceData");
export function createRegistrationServiceData(values) {
    return Object.assign(create(typeModels.RegistrationServiceData, RegistrationServiceDataTypeRef), values);
}
export const RejectedSenderTypeRef = new TypeRef("sys", "RejectedSender");
export function createRejectedSender(values) {
    return Object.assign(create(typeModels.RejectedSender, RejectedSenderTypeRef), values);
}
export const RejectedSendersRefTypeRef = new TypeRef("sys", "RejectedSendersRef");
export function createRejectedSendersRef(values) {
    return Object.assign(create(typeModels.RejectedSendersRef, RejectedSendersRefTypeRef), values);
}
export const RepeatRuleTypeRef = new TypeRef("sys", "RepeatRule");
export function createRepeatRule(values) {
    return Object.assign(create(typeModels.RepeatRule, RepeatRuleTypeRef), values);
}
export const ResetFactorsDeleteDataTypeRef = new TypeRef("sys", "ResetFactorsDeleteData");
export function createResetFactorsDeleteData(values) {
    return Object.assign(create(typeModels.ResetFactorsDeleteData, ResetFactorsDeleteDataTypeRef), values);
}
export const ResetPasswordPostInTypeRef = new TypeRef("sys", "ResetPasswordPostIn");
export function createResetPasswordPostIn(values) {
    return Object.assign(create(typeModels.ResetPasswordPostIn, ResetPasswordPostInTypeRef), values);
}
export const RootInstanceTypeRef = new TypeRef("sys", "RootInstance");
export function createRootInstance(values) {
    return Object.assign(create(typeModels.RootInstance, RootInstanceTypeRef), values);
}
export const SaltDataTypeRef = new TypeRef("sys", "SaltData");
export function createSaltData(values) {
    return Object.assign(create(typeModels.SaltData, SaltDataTypeRef), values);
}
export const SaltReturnTypeRef = new TypeRef("sys", "SaltReturn");
export function createSaltReturn(values) {
    return Object.assign(create(typeModels.SaltReturn, SaltReturnTypeRef), values);
}
export const SecondFactorTypeRef = new TypeRef("sys", "SecondFactor");
export function createSecondFactor(values) {
    return Object.assign(create(typeModels.SecondFactor, SecondFactorTypeRef), values);
}
export const SecondFactorAuthAllowedReturnTypeRef = new TypeRef("sys", "SecondFactorAuthAllowedReturn");
export function createSecondFactorAuthAllowedReturn(values) {
    return Object.assign(create(typeModels.SecondFactorAuthAllowedReturn, SecondFactorAuthAllowedReturnTypeRef), values);
}
export const SecondFactorAuthDataTypeRef = new TypeRef("sys", "SecondFactorAuthData");
export function createSecondFactorAuthData(values) {
    return Object.assign(create(typeModels.SecondFactorAuthData, SecondFactorAuthDataTypeRef), values);
}
export const SecondFactorAuthDeleteDataTypeRef = new TypeRef("sys", "SecondFactorAuthDeleteData");
export function createSecondFactorAuthDeleteData(values) {
    return Object.assign(create(typeModels.SecondFactorAuthDeleteData, SecondFactorAuthDeleteDataTypeRef), values);
}
export const SecondFactorAuthGetDataTypeRef = new TypeRef("sys", "SecondFactorAuthGetData");
export function createSecondFactorAuthGetData(values) {
    return Object.assign(create(typeModels.SecondFactorAuthGetData, SecondFactorAuthGetDataTypeRef), values);
}
export const SecondFactorAuthGetReturnTypeRef = new TypeRef("sys", "SecondFactorAuthGetReturn");
export function createSecondFactorAuthGetReturn(values) {
    return Object.assign(create(typeModels.SecondFactorAuthGetReturn, SecondFactorAuthGetReturnTypeRef), values);
}
export const SecondFactorAuthenticationTypeRef = new TypeRef("sys", "SecondFactorAuthentication");
export function createSecondFactorAuthentication(values) {
    return Object.assign(create(typeModels.SecondFactorAuthentication, SecondFactorAuthenticationTypeRef), values);
}
export const SendRegistrationCodeDataTypeRef = new TypeRef("sys", "SendRegistrationCodeData");
export function createSendRegistrationCodeData(values) {
    return Object.assign(create(typeModels.SendRegistrationCodeData, SendRegistrationCodeDataTypeRef), values);
}
export const SendRegistrationCodeReturnTypeRef = new TypeRef("sys", "SendRegistrationCodeReturn");
export function createSendRegistrationCodeReturn(values) {
    return Object.assign(create(typeModels.SendRegistrationCodeReturn, SendRegistrationCodeReturnTypeRef), values);
}
export const SentGroupInvitationTypeRef = new TypeRef("sys", "SentGroupInvitation");
export function createSentGroupInvitation(values) {
    return Object.assign(create(typeModels.SentGroupInvitation, SentGroupInvitationTypeRef), values);
}
export const SessionTypeRef = new TypeRef("sys", "Session");
export function createSession(values) {
    return Object.assign(create(typeModels.Session, SessionTypeRef), values);
}
export const SignOrderProcessingAgreementDataTypeRef = new TypeRef("sys", "SignOrderProcessingAgreementData");
export function createSignOrderProcessingAgreementData(values) {
    return Object.assign(create(typeModels.SignOrderProcessingAgreementData, SignOrderProcessingAgreementDataTypeRef), values);
}
export const SseConnectDataTypeRef = new TypeRef("sys", "SseConnectData");
export function createSseConnectData(values) {
    return Object.assign(create(typeModels.SseConnectData, SseConnectDataTypeRef), values);
}
export const StringWrapperTypeRef = new TypeRef("sys", "StringWrapper");
export function createStringWrapper(values) {
    return Object.assign(create(typeModels.StringWrapper, StringWrapperTypeRef), values);
}
export const SurveyDataTypeRef = new TypeRef("sys", "SurveyData");
export function createSurveyData(values) {
    return Object.assign(create(typeModels.SurveyData, SurveyDataTypeRef), values);
}
export const SwitchAccountTypePostInTypeRef = new TypeRef("sys", "SwitchAccountTypePostIn");
export function createSwitchAccountTypePostIn(values) {
    return Object.assign(create(typeModels.SwitchAccountTypePostIn, SwitchAccountTypePostInTypeRef), values);
}
export const SystemKeysReturnTypeRef = new TypeRef("sys", "SystemKeysReturn");
export function createSystemKeysReturn(values) {
    return Object.assign(create(typeModels.SystemKeysReturn, SystemKeysReturnTypeRef), values);
}
export const TakeOverDeletedAddressDataTypeRef = new TypeRef("sys", "TakeOverDeletedAddressData");
export function createTakeOverDeletedAddressData(values) {
    return Object.assign(create(typeModels.TakeOverDeletedAddressData, TakeOverDeletedAddressDataTypeRef), values);
}
export const TypeInfoTypeRef = new TypeRef("sys", "TypeInfo");
export function createTypeInfo(values) {
    return Object.assign(create(typeModels.TypeInfo, TypeInfoTypeRef), values);
}
export const U2fChallengeTypeRef = new TypeRef("sys", "U2fChallenge");
export function createU2fChallenge(values) {
    return Object.assign(create(typeModels.U2fChallenge, U2fChallengeTypeRef), values);
}
export const U2fKeyTypeRef = new TypeRef("sys", "U2fKey");
export function createU2fKey(values) {
    return Object.assign(create(typeModels.U2fKey, U2fKeyTypeRef), values);
}
export const U2fRegisteredDeviceTypeRef = new TypeRef("sys", "U2fRegisteredDevice");
export function createU2fRegisteredDevice(values) {
    return Object.assign(create(typeModels.U2fRegisteredDevice, U2fRegisteredDeviceTypeRef), values);
}
export const U2fResponseDataTypeRef = new TypeRef("sys", "U2fResponseData");
export function createU2fResponseData(values) {
    return Object.assign(create(typeModels.U2fResponseData, U2fResponseDataTypeRef), values);
}
export const UpdatePermissionKeyDataTypeRef = new TypeRef("sys", "UpdatePermissionKeyData");
export function createUpdatePermissionKeyData(values) {
    return Object.assign(create(typeModels.UpdatePermissionKeyData, UpdatePermissionKeyDataTypeRef), values);
}
export const UpdateSessionKeysPostInTypeRef = new TypeRef("sys", "UpdateSessionKeysPostIn");
export function createUpdateSessionKeysPostIn(values) {
    return Object.assign(create(typeModels.UpdateSessionKeysPostIn, UpdateSessionKeysPostInTypeRef), values);
}
export const UpgradePriceServiceDataTypeRef = new TypeRef("sys", "UpgradePriceServiceData");
export function createUpgradePriceServiceData(values) {
    return Object.assign(create(typeModels.UpgradePriceServiceData, UpgradePriceServiceDataTypeRef), values);
}
export const UpgradePriceServiceReturnTypeRef = new TypeRef("sys", "UpgradePriceServiceReturn");
export function createUpgradePriceServiceReturn(values) {
    return Object.assign(create(typeModels.UpgradePriceServiceReturn, UpgradePriceServiceReturnTypeRef), values);
}
export const UserTypeRef = new TypeRef("sys", "User");
export function createUser(values) {
    return Object.assign(create(typeModels.User, UserTypeRef), values);
}
export const UserAlarmInfoTypeRef = new TypeRef("sys", "UserAlarmInfo");
export function createUserAlarmInfo(values) {
    return Object.assign(create(typeModels.UserAlarmInfo, UserAlarmInfoTypeRef), values);
}
export const UserAlarmInfoListTypeTypeRef = new TypeRef("sys", "UserAlarmInfoListType");
export function createUserAlarmInfoListType(values) {
    return Object.assign(create(typeModels.UserAlarmInfoListType, UserAlarmInfoListTypeTypeRef), values);
}
export const UserAreaGroupsTypeRef = new TypeRef("sys", "UserAreaGroups");
export function createUserAreaGroups(values) {
    return Object.assign(create(typeModels.UserAreaGroups, UserAreaGroupsTypeRef), values);
}
export const UserAuthenticationTypeRef = new TypeRef("sys", "UserAuthentication");
export function createUserAuthentication(values) {
    return Object.assign(create(typeModels.UserAuthentication, UserAuthenticationTypeRef), values);
}
export const UserDataDeleteTypeRef = new TypeRef("sys", "UserDataDelete");
export function createUserDataDelete(values) {
    return Object.assign(create(typeModels.UserDataDelete, UserDataDeleteTypeRef), values);
}
export const UserExternalAuthInfoTypeRef = new TypeRef("sys", "UserExternalAuthInfo");
export function createUserExternalAuthInfo(values) {
    return Object.assign(create(typeModels.UserExternalAuthInfo, UserExternalAuthInfoTypeRef), values);
}
export const UserGroupKeyDistributionTypeRef = new TypeRef("sys", "UserGroupKeyDistribution");
export function createUserGroupKeyDistribution(values) {
    return Object.assign(create(typeModels.UserGroupKeyDistribution, UserGroupKeyDistributionTypeRef), values);
}
export const UserGroupKeyRotationDataTypeRef = new TypeRef("sys", "UserGroupKeyRotationData");
export function createUserGroupKeyRotationData(values) {
    return Object.assign(create(typeModels.UserGroupKeyRotationData, UserGroupKeyRotationDataTypeRef), values);
}
export const UserGroupKeyRotationPostInTypeRef = new TypeRef("sys", "UserGroupKeyRotationPostIn");
export function createUserGroupKeyRotationPostIn(values) {
    return Object.assign(create(typeModels.UserGroupKeyRotationPostIn, UserGroupKeyRotationPostInTypeRef), values);
}
export const UserGroupRootTypeRef = new TypeRef("sys", "UserGroupRoot");
export function createUserGroupRoot(values) {
    return Object.assign(create(typeModels.UserGroupRoot, UserGroupRootTypeRef), values);
}
export const VariableExternalAuthInfoTypeRef = new TypeRef("sys", "VariableExternalAuthInfo");
export function createVariableExternalAuthInfo(values) {
    return Object.assign(create(typeModels.VariableExternalAuthInfo, VariableExternalAuthInfoTypeRef), values);
}
export const VerifierTokenServiceInTypeRef = new TypeRef("sys", "VerifierTokenServiceIn");
export function createVerifierTokenServiceIn(values) {
    return Object.assign(create(typeModels.VerifierTokenServiceIn, VerifierTokenServiceInTypeRef), values);
}
export const VerifierTokenServiceOutTypeRef = new TypeRef("sys", "VerifierTokenServiceOut");
export function createVerifierTokenServiceOut(values) {
    return Object.assign(create(typeModels.VerifierTokenServiceOut, VerifierTokenServiceOutTypeRef), values);
}
export const VerifyRegistrationCodeDataTypeRef = new TypeRef("sys", "VerifyRegistrationCodeData");
export function createVerifyRegistrationCodeData(values) {
    return Object.assign(create(typeModels.VerifyRegistrationCodeData, VerifyRegistrationCodeDataTypeRef), values);
}
export const VersionTypeRef = new TypeRef("sys", "Version");
export function createVersion(values) {
    return Object.assign(create(typeModels.Version, VersionTypeRef), values);
}
export const VersionDataTypeRef = new TypeRef("sys", "VersionData");
export function createVersionData(values) {
    return Object.assign(create(typeModels.VersionData, VersionDataTypeRef), values);
}
export const VersionInfoTypeRef = new TypeRef("sys", "VersionInfo");
export function createVersionInfo(values) {
    return Object.assign(create(typeModels.VersionInfo, VersionInfoTypeRef), values);
}
export const VersionReturnTypeRef = new TypeRef("sys", "VersionReturn");
export function createVersionReturn(values) {
    return Object.assign(create(typeModels.VersionReturn, VersionReturnTypeRef), values);
}
export const WebauthnResponseDataTypeRef = new TypeRef("sys", "WebauthnResponseData");
export function createWebauthnResponseData(values) {
    return Object.assign(create(typeModels.WebauthnResponseData, WebauthnResponseDataTypeRef), values);
}
export const WebsocketCounterDataTypeRef = new TypeRef("sys", "WebsocketCounterData");
export function createWebsocketCounterData(values) {
    return Object.assign(create(typeModels.WebsocketCounterData, WebsocketCounterDataTypeRef), values);
}
export const WebsocketCounterValueTypeRef = new TypeRef("sys", "WebsocketCounterValue");
export function createWebsocketCounterValue(values) {
    return Object.assign(create(typeModels.WebsocketCounterValue, WebsocketCounterValueTypeRef), values);
}
export const WebsocketEntityDataTypeRef = new TypeRef("sys", "WebsocketEntityData");
export function createWebsocketEntityData(values) {
    return Object.assign(create(typeModels.WebsocketEntityData, WebsocketEntityDataTypeRef), values);
}
export const WebsocketLeaderStatusTypeRef = new TypeRef("sys", "WebsocketLeaderStatus");
export function createWebsocketLeaderStatus(values) {
    return Object.assign(create(typeModels.WebsocketLeaderStatus, WebsocketLeaderStatusTypeRef), values);
}
export const WhitelabelChildTypeRef = new TypeRef("sys", "WhitelabelChild");
export function createWhitelabelChild(values) {
    return Object.assign(create(typeModels.WhitelabelChild, WhitelabelChildTypeRef), values);
}
export const WhitelabelChildrenRefTypeRef = new TypeRef("sys", "WhitelabelChildrenRef");
export function createWhitelabelChildrenRef(values) {
    return Object.assign(create(typeModels.WhitelabelChildrenRef, WhitelabelChildrenRefTypeRef), values);
}
export const WhitelabelConfigTypeRef = new TypeRef("sys", "WhitelabelConfig");
export function createWhitelabelConfig(values) {
    return Object.assign(create(typeModels.WhitelabelConfig, WhitelabelConfigTypeRef), values);
}
export const WhitelabelParentTypeRef = new TypeRef("sys", "WhitelabelParent");
export function createWhitelabelParent(values) {
    return Object.assign(create(typeModels.WhitelabelParent, WhitelabelParentTypeRef), values);
}
//# sourceMappingURL=TypeRefs.js.map