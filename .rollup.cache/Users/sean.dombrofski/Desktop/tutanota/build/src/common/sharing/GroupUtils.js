import { GroupInfoTypeRef, GroupMemberTypeRef, ReceivedGroupInvitationTypeRef, UserGroupRootTypeRef, } from "../api/entities/sys/TypeRefs.js";
import { GroupType, GroupTypeNameByCode } from "../api/common/TutanotaConstants";
import { getEtId, isSameId } from "../api/common/utils/EntityUtils";
import { lang } from "../misc/LanguageViewModel";
import { downcast, ofClass, promiseMap } from "@tutao/tutanota-utils";
import { NotFoundError } from "../api/common/error/RestError";
/**
 * Whether or not a user has a given capability for a shared group. If the group type is not shareable, this will always return false
 * @param user
 * @param group
 * @param requiredCapability
 * @returns {boolean}
 */
export function hasCapabilityOnGroup(user, group, requiredCapability) {
    if (!isShareableGroupType(downcast(group.type))) {
        return false;
    }
    if (isSharedGroupOwner(group, user._id)) {
        return true;
    }
    const membership = user.memberships.find((gm) => isSameId(gm.group, group._id));
    if (membership) {
        return membership.capability != null && Number(requiredCapability) <= Number(membership.capability);
    }
    return false;
}
export function isSharedGroupOwner(sharedGroup, user) {
    return !!(sharedGroup.user && isSameId(sharedGroup.user, typeof user === "string" ? user : getEtId(user)));
}
export function getCapabilityText(capability) {
    switch (capability) {
        case "2" /* ShareCapability.Invite */:
            return lang.get("groupCapabilityInvite_label");
        case "1" /* ShareCapability.Write */:
            return lang.get("groupCapabilityWrite_label");
        case "0" /* ShareCapability.Read */:
            return lang.get("groupCapabilityRead_label");
        default:
            return lang.get("comboBoxSelectionNone_msg");
    }
}
export function getMemberCapability(memberInfo, group) {
    if (isSharedGroupOwner(group, memberInfo.member.user)) {
        return "2" /* ShareCapability.Invite */;
    }
    return downcast(memberInfo.member.capability);
}
export function loadGroupMembers(group, entityClient) {
    return entityClient
        .loadAll(GroupMemberTypeRef, group.members)
        .then((members) => promiseMap(members, (member) => loadGroupInfoForMember(member, entityClient)));
}
export function loadGroupInfoForMember(groupMember, entityClient) {
    return entityClient.load(GroupInfoTypeRef, groupMember.userGroupInfo).then((userGroupInfo) => {
        return {
            member: groupMember,
            info: userGroupInfo,
        };
    });
}
export function getDefaultGroupName(groupType) {
    switch (groupType) {
        case GroupType.Calendar:
            return lang.get("privateCalendar_label");
        case GroupType.Template:
            return lang.get("templateGroupDefaultName_label");
        default:
            return GroupTypeNameByCode[groupType];
    }
}
export function loadReceivedGroupInvitations(userController, entityClient, type) {
    return entityClient
        .load(UserGroupRootTypeRef, userController.userGroupInfo.group)
        .then((userGroupRoot) => entityClient.loadAll(ReceivedGroupInvitationTypeRef, userGroupRoot.invitations))
        .then((invitations) => invitations.filter((invitation) => getInvitationGroupType(invitation) === type))
        .catch(ofClass(NotFoundError, () => []));
}
// Group invitations without a type set were sent when Calendars were the only shareable kind of user group
const DEFAULT_GROUP_TYPE = GroupType.Calendar;
export function getInvitationGroupType(invitation) {
    return invitation.groupType === null ? DEFAULT_GROUP_TYPE : invitation.groupType;
}
export function isTemplateGroup(groupType) {
    return groupType === GroupType.Template;
}
export function isShareableGroupType(groupType) {
    // Should be synchronised with GroupType::isShareableGroup in tutadb
    return groupType === GroupType.Calendar || groupType === GroupType.Template || groupType === GroupType.ContactList;
}
export const TemplateGroupPreconditionFailedReason = Object.freeze({
    BUSINESS_FEATURE_REQUIRED: "templategroup.business_feature_required",
    UNLIMITED_REQUIRED: "templategroup.unlimited_required",
});
export function getSharedGroupName(groupInfo, { userSettingsGroupRoot }, allowGroupNameOverride) {
    return getNullableSharedGroupName(groupInfo, userSettingsGroupRoot, allowGroupNameOverride) ?? getDefaultGroupName(downcast(groupInfo.groupType));
}
/**
 * Get shared group name or default to null.
 * Needed in order to make translations of default template group names work in SettingsView
 */
export function getNullableSharedGroupName(groupInfo, userSettingsGroupRoot, allowGroupNameOverride) {
    const groupSettings = userSettingsGroupRoot.groupSettings.find((gc) => gc.group === groupInfo.group);
    // return (allowGroupNameOverride && groupSettings && groupSettings.name) || groupInfo.name || getDefaultGroupName(downcast(groupInfo.groupType))
    return (allowGroupNameOverride && groupSettings && groupSettings.name) || groupInfo.name || null;
}
//# sourceMappingURL=GroupUtils.js.map