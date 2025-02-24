import m from "mithril";
import stream from "mithril/stream";
import { Dialog } from "../../gui/base/Dialog";
import { Table } from "../../gui/base/Table.js";
import { assert, assertNotNull, downcast, findAndRemove, neverNull, remove } from "@tutao/tutanota-utils";
import { lang } from "../../misc/LanguageViewModel";
import { showProgressDialog } from "../../gui/dialogs/ProgressDialog";
import { DropDownSelector } from "../../gui/base/DropDownSelector.js";
import { PreconditionFailedError, TooManyRequestsError } from "../../api/common/error/RestError";
import { TextField } from "../../gui/base/TextField.js";
import { getCapabilityText, getMemberCapability, getSharedGroupName, hasCapabilityOnGroup, isShareableGroupType, isSharedGroupOwner } from "../GroupUtils";
import { sendShareNotificationEmail } from "../GroupSharingUtils";
import { GroupSharingModel } from "../model/GroupSharingModel";
import { locator } from "../../api/main/CommonLocator";
import { UserError } from "../../api/main/UserError";
import { showUserError } from "../../misc/ErrorHandlerImpl";
import { getConfirmation } from "../../gui/base/GuiUtils";
import { getTextsForGroupType } from "../GroupGuiUtils";
import { ResolveMode } from "../../api/main/RecipientsModel";
import { MailRecipientsTextField } from "../../gui/MailRecipientsTextField.js";
import { cleanMailAddress, findRecipientWithAddress } from "../../api/common/utils/CommonCalendarUtils.js";
import { getMailAddressDisplayText } from "../../mailFunctionality/SharedMailUtils.js";
export async function showGroupSharingDialog(groupInfo, allowGroupNameOverride) {
    const groupType = downcast(assertNotNull(groupInfo.groupType));
    assert(isShareableGroupType(groupInfo.groupType), `Group type "${groupType}" must be shareable`);
    const texts = getTextsForGroupType(groupType);
    const recipientsModel = await locator.recipientsModel();
    showProgressDialog("loading_msg", GroupSharingModel.newAsync(groupInfo, locator.eventController, locator.entityClient, locator.logins, locator.mailFacade, locator.shareFacade, locator.groupManagementFacade, recipientsModel)).then((model) => {
        model.onEntityUpdate.map(m.redraw.bind(m));
        let dialog = Dialog.showActionDialog({
            title: "sharing_label",
            type: "EditMedium" /* DialogType.EditMedium */,
            child: () => m(GroupSharingDialogContent, {
                model,
                allowGroupNameOverride,
                texts,
                dialog,
            }),
            okAction: null,
            cancelAction: () => model.dispose(),
            cancelActionTextId: "close_alt",
        });
    });
}
class GroupSharingDialogContent {
    view(vnode) {
        const { model, allowGroupNameOverride, texts, dialog } = vnode.attrs;
        const groupName = getSharedGroupName(model.info, model.logins.getUserController(), allowGroupNameOverride);
        return m(".flex.col.pt-s", [
            m(Table, {
                columnHeading: [lang.makeTranslation("column_heading", texts.participantsLabel(groupName))],
                columnWidths: [".column-width-largest" /* ColumnWidth.Largest */, ".column-width-largest" /* ColumnWidth.Largest */],
                lines: this._renderMemberInfos(model, texts, groupName, dialog).concat(this._renderGroupInvitations(model, texts, groupName)),
                showActionButtonColumn: true,
                addButtonAttrs: hasCapabilityOnGroup(locator.logins.getUserController().user, model.group, "2" /* ShareCapability.Invite */)
                    ? {
                        title: "addParticipant_action",
                        click: () => showAddParticipantDialog(model, texts),
                        icon: "Add" /* Icons.Add */,
                    }
                    : null,
            }),
        ]);
    }
    _renderGroupInvitations(model, texts, groupName) {
        return model.sentGroupInvitations.map((sentGroupInvitation) => {
            let iconBtn = {
                title: "remove_action",
                click: () => {
                    getConfirmation(lang.makeTranslation("confirmation_msg", texts.removeMemberMessage(groupName, sentGroupInvitation.inviteeMailAddress))).confirmed(async () => {
                        await model.cancelInvitation(sentGroupInvitation);
                        m.redraw();
                    });
                },
                icon: "Cancel" /* Icons.Cancel */,
            };
            return {
                cells: () => [
                    {
                        main: sentGroupInvitation.inviteeMailAddress,
                        info: [`${lang.get("invited_label")}, ${getCapabilityText(downcast(sentGroupInvitation.capability))}`],
                        mainStyle: ".i",
                    },
                ],
                actionButtonAttrs: model.canCancelInvitation(sentGroupInvitation) ? iconBtn : null,
            };
        });
    }
    _renderMemberInfos(model, texts, groupName, dialog) {
        return model.memberInfos.map((memberInfo) => {
            return {
                cells: () => [
                    {
                        main: getMailAddressDisplayText(memberInfo.info.name, neverNull(memberInfo.info.mailAddress), false),
                        info: [
                            (isSharedGroupOwner(model.group, memberInfo.member.user) ? lang.get("owner_label") : lang.get("participant_label")) +
                                ", " +
                                getCapabilityText(getMemberCapability(memberInfo, model.group)),
                        ],
                    },
                ],
                actionButtonAttrs: model.canRemoveGroupMember(memberInfo.member)
                    ? {
                        title: "delete_action",
                        icon: "Cancel" /* Icons.Cancel */,
                        click: () => {
                            getConfirmation(lang.makeTranslation("confirmation_msg", texts.removeMemberMessage(groupName, downcast(memberInfo.info.mailAddress)))).confirmed(async () => {
                                await model.removeGroupMember(memberInfo.member);
                                if (model.memberIsSelf(memberInfo.member)) {
                                    dialog.close();
                                }
                                m.redraw();
                            });
                        },
                    }
                    : null,
            };
        });
    }
}
async function showAddParticipantDialog(model, texts) {
    const recipientsText = stream("");
    const recipients = [];
    const capability = stream("0" /* ShareCapability.Read */);
    const realGroupName = getSharedGroupName(model.info, locator.logins.getUserController(), false);
    const customGroupName = getSharedGroupName(model.info, locator.logins.getUserController(), true);
    const search = await locator.recipientsSearchModel();
    const recipientsModel = await locator.recipientsModel();
    let dialog = Dialog.showActionDialog({
        type: "EditMedium" /* DialogType.EditMedium */,
        title: "addParticipant_action",
        child: () => [
            m(".rel", m(MailRecipientsTextField, {
                label: "shareWithEmailRecipient_label",
                text: recipientsText(),
                recipients: recipients,
                disabled: false,
                getRecipientClickedDropdownAttrs: async (address) => [
                    {
                        info: address,
                        center: false,
                        bold: false,
                    },
                    {
                        label: "remove_action",
                        type: "secondary" /* ButtonType.Secondary */,
                        click: () => {
                            const bubbleToRemove = findRecipientWithAddress(recipients, address);
                            if (bubbleToRemove) {
                                remove(recipients, bubbleToRemove);
                            }
                        },
                    },
                ],
                onRecipientAdded: (address, name, contact) => recipients.push(recipientsModel.resolve({ address, name, contact }, ResolveMode.Eager).whenResolved(() => m.redraw())),
                onRecipientRemoved: (address) => findAndRemove(recipients, (recipient) => cleanMailAddress(recipient.address) === cleanMailAddress(address)),
                onTextChanged: recipientsText,
                search,
                maxSuggestionsToShow: 3,
            })),
            m(DropDownSelector, {
                label: "permissions_label",
                items: [
                    {
                        name: getCapabilityText("2" /* ShareCapability.Invite */),
                        value: "2" /* ShareCapability.Invite */,
                    },
                    {
                        name: getCapabilityText("1" /* ShareCapability.Write */),
                        value: "1" /* ShareCapability.Write */,
                    },
                    {
                        name: getCapabilityText("0" /* ShareCapability.Read */),
                        value: "0" /* ShareCapability.Read */,
                    },
                ],
                selectedValue: capability(),
                selectionChangedHandler: capability,
                dropdownWidth: 300,
            }),
            m(TextField, {
                value: realGroupName,
                label: texts.groupNameLabel,
                isReadOnly: true,
                helpLabel: () => {
                    return m("", customGroupName === realGroupName ? null : texts.yourCustomNameLabel(customGroupName));
                },
            }),
            m(".pt", texts.addMemberMessage(customGroupName || realGroupName)),
        ],
        okAction: async () => {
            if (recipients.length === 0) {
                return Dialog.message("noRecipients_msg");
            }
            const { checkPaidSubscription, showPlanUpgradeRequiredDialog } = await import("../../misc/SubscriptionDialogs");
            if (await checkPaidSubscription()) {
                try {
                    const invitedMailAddresses = await showProgressDialog("calendarInvitationProgress_msg", model.sendGroupInvitation(model.info, recipients, capability()));
                    dialog.close();
                    await sendShareNotificationEmail(model.info, invitedMailAddresses, texts);
                }
                catch (e) {
                    if (e instanceof PreconditionFailedError) {
                        if (locator.logins.getUserController().isGlobalAdmin()) {
                            const { getAvailablePlansWithSharing } = await import("../../subscription/SubscriptionUtils.js");
                            const plans = await getAvailablePlansWithSharing();
                            await showPlanUpgradeRequiredDialog(plans);
                        }
                        else {
                            Dialog.message("contactAdmin_msg");
                        }
                    }
                    else if (e instanceof UserError) {
                        showUserError(e);
                    }
                    else if (e instanceof TooManyRequestsError) {
                        Dialog.message("tooManyAttempts_msg");
                    }
                    else {
                        throw e;
                    }
                }
            }
        },
        okActionTextId: "invite_alt",
    }).setCloseHandler(() => {
        dialog.close();
    });
}
//# sourceMappingURL=GroupSharingDialog.js.map