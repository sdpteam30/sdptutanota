import { lang } from "../misc/LanguageViewModel";
import { GroupType } from "../api/common/TutanotaConstants";
import { getDefaultGroupName } from "./GroupUtils";
const CALENDAR_SHARING_TEXTS = () => ({
    groupNameLabel: "calendarName_label",
    participantsLabel: (groupName) => lang.get("calendarParticipants_label", {
        "{name}": groupName,
    }),
    acceptEmailSubject: lang.get("shareCalendarAcceptEmailSubject_msg"),
    acceptEmailBody: (userName, invitee, groupName) => lang.get("shareCalendarAcceptEmailBody_msg", {
        "{invitee}": invitee,
        "{calendarName}": groupName,
        "{recipientName}": userName,
    }),
    declineEmailSubject: lang.get("shareCalendarDeclineEmailSubject_msg"),
    declineEmailBody: (userName, invitee, groupName) => lang.get("shareCalendarDeclineEmailBody_msg", {
        "{invitee}": invitee,
        "{calendarName}": groupName,
        "{recipientName}": userName,
    }),
    shareEmailSubject: lang.get("shareCalendarInvitationEmailSubject_msg"),
    shareEmailBody: (sender, calendarName) => lang.get("shareCalendarInvitationEmailBody_msg", {
        // Sender is displayed like Name <mail.address@tutanota.com>. Less-than and greater-than must be encoded for HTML
        "{inviter}": sender,
        "{calendarName}": calendarName,
    }),
    addMemberMessage: (_) => `${lang.get("shareCalendarWarning_msg")} ${lang.get("shareWarningAliases_msg")}`,
    removeMemberMessage: (calendarName, invitee) => lang.get("removeCalendarParticipantConfirm_msg", {
        "{participant}": invitee,
        "{calendarName}": calendarName,
    }),
    alreadyGroupMemberMessage: "sharedCalendarAlreadyMember_msg",
    receivedGroupInvitationMessage: `${lang.get("shareCalendarWarning_msg")} ${lang.get("shareWarningAliases_msg")}`,
    sharedGroupDefaultCustomName: (groupOwnerName) => getDefaultGroupName(GroupType.Calendar),
    yourCustomNameLabel: (groupName) => lang.get("calendarCustomName_label", {
        "{customName}": groupName,
    }),
});
const TEMPLATE_SHARING_TEXTS = () => ({
    groupNameLabel: "templateGroupName_label",
    participantsLabel: (groupName) => lang.get("sharedGroupParticipants_label", {
        "{groupName}": groupName,
    }),
    acceptEmailSubject: lang.get("acceptTemplateGroupEmailSubject_msg"),
    acceptEmailBody: (userName, invitee, groupName) => `${lang.get("sharedGroupAcceptEmailBody_msg", {
        "{recipientName}": userName,
        "{invitee}": invitee,
        "{groupName}": groupName,
    })} ${lang.get("automatedMessage_msg")}`,
    declineEmailSubject: lang.get("declineTemplateGroupEmailSubject_msg"),
    declineEmailBody: (userName, invitee, groupName) => `${lang.get("sharedGroupDeclineEmailBody_msg", {
        "{recipientName}": userName,
        "{invitee}": invitee,
        "{groupName}": groupName,
    })} ${lang.get("automatedMessage_msg")}`,
    shareEmailSubject: lang.get("shareTemplateGroupEmailSubject_msg"),
    shareEmailBody: (sharer, groupName) => lang.get("shareTemplateGroupEmailBody_msg", {
        "{inviter}": sharer,
        "{groupName}": groupName,
    }),
    addMemberMessage: (groupName) => `${lang.get("shareGroupWarning_msg")} ${lang.get("shareWarningAliases_msg")}`,
    removeMemberMessage: (groupName, member) => lang.get("removeSharedMemberConfirm_msg", {
        "{member}": member,
        "{groupName}": groupName,
    }),
    alreadyGroupMemberMessage: "alreadySharedGroupMember_msg",
    receivedGroupInvitationMessage: `${lang.get("shareGroupWarning_msg")} ${lang.get("shareWarningAliases_msg")}`,
    sharedGroupDefaultCustomName: (invitation) => lang.get("sharedTemplateGroupDefaultName_label", {
        "{ownerName}": invitation.inviterName || invitation.inviterMailAddress,
    }),
    yourCustomNameLabel: (groupName) => lang.get("customName_label", {
        "{customName}": groupName,
    }),
});
const CONTACT_LIST_SHARING_TEXTS = () => ({
    groupNameLabel: "contactListName_label",
    participantsLabel: (groupName) => lang.get("sharedGroupParticipants_label", {
        "{groupName}": groupName,
    }),
    acceptEmailSubject: lang.get("acceptContactListEmailSubject_msg"),
    acceptEmailBody: (userName, invitee, groupName) => `${lang.get("sharedGroupAcceptEmailBody_msg", {
        "{recipientName}": userName,
        "{invitee}": invitee,
        "{groupName}": groupName,
    })} ${lang.get("automatedMessage_msg")}`,
    declineEmailSubject: lang.get("declineContactListEmailSubject_msg"),
    declineEmailBody: (userName, invitee, groupName) => `${lang.get("sharedGroupDeclineEmailBody_msg", {
        "{recipientName}": userName,
        "{invitee}": invitee,
        "{groupName}": groupName,
    })} ${lang.get("automatedMessage_msg")}`,
    shareEmailSubject: lang.get("shareContactListEmailSubject_msg"),
    shareEmailBody: (sharer, groupName) => `${lang.get("shareContactListEmailBody_msg", {
        "{inviter}": sharer,
        "{groupName}": groupName,
    })} ${lang.get("automatedMessage_msg")}`,
    addMemberMessage: (groupName) => `${lang.get("shareGroupWarning_msg")} ${lang.get("shareWarningAliases_msg")}`,
    removeMemberMessage: (groupName, member) => lang.get("removeSharedMemberConfirm_msg", {
        "{member}": member,
        "{groupName}": groupName,
    }),
    alreadyGroupMemberMessage: "alreadySharedGroupMember_msg",
    receivedGroupInvitationMessage: `${lang.get("shareGroupWarning_msg")} ${lang.get("shareWarningAliases_msg")}`,
    sharedGroupDefaultCustomName: (invitation) => lang.get("sharedContactListDefaultName_label", {
        "{ownerName}": invitation.inviterName || invitation.inviterMailAddress,
    }),
    yourCustomNameLabel: (groupName) => lang.get("customName_label", {
        "{customName}": groupName,
    }),
});
export function getTextsForGroupType(groupType) {
    switch (groupType) {
        case GroupType.Calendar:
            return CALENDAR_SHARING_TEXTS();
        case GroupType.Template:
            return TEMPLATE_SHARING_TEXTS();
        case GroupType.ContactList:
            return CONTACT_LIST_SHARING_TEXTS();
    }
}
//# sourceMappingURL=GroupGuiUtils.js.map