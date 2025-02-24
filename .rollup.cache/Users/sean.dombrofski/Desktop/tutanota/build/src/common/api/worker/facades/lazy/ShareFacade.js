import { GroupInfoTypeRef } from "../../../entities/sys/TypeRefs.js";
import { createGroupInvitationDeleteData, createGroupInvitationPostData, createGroupInvitationPutData, createSharedGroupData, InternalRecipientKeyDataTypeRef, } from "../../../entities/tutanota/TypeRefs.js";
import { isSameTypeRef, neverNull } from "@tutao/tutanota-utils";
import { RecipientsNotFoundError } from "../../../common/error/RecipientsNotFoundError.js";
import { assertWorkerOrNode } from "../../../common/Env.js";
import { aes256RandomKey, bitArrayToUint8Array, encryptKey, uint8ArrayToBitArray } from "@tutao/tutanota-crypto";
import { GroupInvitationService } from "../../../entities/tutanota/Services.js";
import { parseKeyVersion } from "../KeyLoaderFacade.js";
import { encryptBytes, encryptKeyWithVersionedKey, encryptString } from "../../crypto/CryptoWrapper.js";
assertWorkerOrNode();
export class ShareFacade {
    userFacade;
    cryptoFacade;
    serviceExecutor;
    entityClient;
    keyLoaderFacade;
    constructor(userFacade, cryptoFacade, serviceExecutor, entityClient, keyLoaderFacade) {
        this.userFacade = userFacade;
        this.cryptoFacade = cryptoFacade;
        this.serviceExecutor = serviceExecutor;
        this.entityClient = entityClient;
        this.keyLoaderFacade = keyLoaderFacade;
    }
    async sendGroupInvitation(sharedGroupInfo, recipientMailAddresses, shareCapability) {
        const sharedGroupKey = await this.keyLoaderFacade.getCurrentSymGroupKey(sharedGroupInfo.group);
        const invitationData = await this.prepareGroupInvitation(sharedGroupKey, sharedGroupInfo, recipientMailAddresses, shareCapability);
        return this.sendGroupInvitationRequest(invitationData);
    }
    async sendGroupInvitationRequest(invitationData) {
        return this.serviceExecutor.post(GroupInvitationService, invitationData);
    }
    async prepareGroupInvitation(sharedGroupKey, sharedGroupInfo, recipientMailAddresses, shareCapability) {
        const userGroupInfo = await this.entityClient.load(GroupInfoTypeRef, this.userFacade.getLoggedInUser().userGroup.groupInfo);
        const userGroupInfoSessionKey = await this.cryptoFacade.resolveSessionKeyForInstance(userGroupInfo);
        const sharedGroupInfoSessionKey = await this.cryptoFacade.resolveSessionKeyForInstance(sharedGroupInfo);
        const bucketKey = aes256RandomKey();
        const invitationSessionKey = aes256RandomKey();
        const sharedGroupEncInviterGroupInfoKey = encryptKeyWithVersionedKey(sharedGroupKey, neverNull(userGroupInfoSessionKey));
        const sharedGroupEncSharedGroupInfoKey = encryptKeyWithVersionedKey(sharedGroupKey, neverNull(sharedGroupInfoSessionKey));
        const sharedGroupData = createSharedGroupData({
            sessionEncInviterName: encryptString(invitationSessionKey, userGroupInfo.name),
            sessionEncSharedGroupKey: encryptBytes(invitationSessionKey, bitArrayToUint8Array(sharedGroupKey.object)),
            sessionEncSharedGroupName: encryptString(invitationSessionKey, sharedGroupInfo.name),
            bucketEncInvitationSessionKey: encryptKey(bucketKey, invitationSessionKey),
            capability: shareCapability,
            sharedGroup: sharedGroupInfo.group,
            sharedGroupEncInviterGroupInfoKey: sharedGroupEncInviterGroupInfoKey.key,
            sharedGroupEncSharedGroupInfoKey: sharedGroupEncSharedGroupInfoKey.key,
            sharedGroupKeyVersion: String(sharedGroupKey.version),
        });
        const invitationData = createGroupInvitationPostData({
            sharedGroupData,
            internalKeyData: [],
        });
        const notFoundRecipients = [];
        for (let mailAddress of recipientMailAddresses) {
            const keyData = await this.cryptoFacade.encryptBucketKeyForInternalRecipient(userGroupInfo.group, bucketKey, mailAddress, notFoundRecipients);
            if (keyData && isSameTypeRef(keyData._type, InternalRecipientKeyDataTypeRef)) {
                invitationData.internalKeyData.push(keyData);
            }
        }
        if (notFoundRecipients.length > 0) {
            throw new RecipientsNotFoundError(notFoundRecipients.join("\n"));
        }
        return invitationData;
    }
    async acceptGroupInvitation(invitation) {
        const userGroupInfo = await this.entityClient.load(GroupInfoTypeRef, this.userFacade.getLoggedInUser().userGroup.groupInfo);
        const userGroupInfoSessionKey = await this.cryptoFacade.resolveSessionKeyForInstance(userGroupInfo);
        const sharedGroupKey = { object: uint8ArrayToBitArray(invitation.sharedGroupKey), version: parseKeyVersion(invitation.sharedGroupKeyVersion) };
        const userGroupKey = this.userFacade.getCurrentUserGroupKey();
        const userGroupEncGroupKey = encryptKeyWithVersionedKey(userGroupKey, sharedGroupKey.object);
        const sharedGroupEncInviteeGroupInfoKey = encryptKeyWithVersionedKey(sharedGroupKey, neverNull(userGroupInfoSessionKey));
        const serviceData = createGroupInvitationPutData({
            receivedInvitation: invitation._id,
            userGroupEncGroupKey: userGroupEncGroupKey.key,
            sharedGroupEncInviteeGroupInfoKey: sharedGroupEncInviteeGroupInfoKey.key,
            userGroupKeyVersion: userGroupEncGroupKey.encryptingKeyVersion.toString(),
            sharedGroupKeyVersion: sharedGroupEncInviteeGroupInfoKey.encryptingKeyVersion.toString(),
        });
        await this.serviceExecutor.put(GroupInvitationService, serviceData);
    }
    async rejectOrCancelGroupInvitation(receivedGroupInvitationId) {
        const serviceData = createGroupInvitationDeleteData({
            receivedInvitation: receivedGroupInvitationId,
        });
        await this.serviceExecutor.delete(GroupInvitationService, serviceData);
    }
}
//# sourceMappingURL=ShareFacade.js.map