import m from "mithril";
import { Dialog } from "../../gui/base/Dialog.js";
import { formatDateWithMonth, formatStorageSize } from "../../misc/Formatter.js";
import { lang } from "../../misc/LanguageViewModel.js";
import { getFirstOrThrow, neverNull } from "@tutao/tutanota-utils";
import { GroupType } from "../../api/common/TutanotaConstants.js";
import { Table } from "../../gui/base/Table.js";
import { showProgressDialog } from "../../gui/dialogs/ProgressDialog.js";
import { TextField } from "../../gui/base/TextField.js";
import { DropDownSelector } from "../../gui/base/DropDownSelector.js";
import { assertMainOrNode } from "../../api/common/Env.js";
import { IconButton } from "../../gui/base/IconButton.js";
import { showBuyDialog } from "../../subscription/BuyDialog.js";
assertMainOrNode();
export class GroupDetailsView {
    model;
    constructor(model) {
        this.model = model;
    }
    /**
     * render the header that tells us what type of group we have here
     * @private
     */
    renderHeader() {
        return m(".h4.mt-l", getGroupTypeDisplayName(this.model.getGroupType()));
    }
    renderView() {
        return m("#user-viewer.fill-absolute.scroll.plr-l", [this.renderHeader(), this.renderCommonInfo(), this.renderMailGroupInfo()]);
    }
    /**
     * render the fields that are common to all group types
     * @private
     */
    renderCommonInfo() {
        return [this.renderCreatedTextField(), this.renderNameField(), this.renderStatusSelector(), this.renderMembersTable()];
    }
    renderCreatedTextField() {
        return m(TextField, { label: "created_label", value: formatDateWithMonth(this.model.getCreationDate()), isReadOnly: true });
    }
    /**
     * render the information that only shared mailboxes have
     * @private
     */
    renderMailGroupInfo() {
        return [
            this.renderUsedStorage(),
            m(TextField, {
                label: "mailAddress_label",
                value: this.model.getGroupMailAddress(),
                isReadOnly: true,
            }),
            m(TextField, {
                label: "mailName_label",
                value: this.model.getGroupSenderName(),
                isReadOnly: true,
                injectionsRight: () => m(IconButton, {
                    icon: "Edit" /* Icons.Edit */,
                    title: "setSenderName_action",
                    click: () => {
                        this.showChangeSenderNameDialog();
                    },
                }),
            }),
        ];
    }
    renderStatusSelector() {
        const attrs = {
            label: "state_label",
            items: [
                {
                    name: lang.get("activated_label"),
                    value: false,
                },
                {
                    name: lang.get("deactivated_label"),
                    value: true,
                },
            ],
            selectedValue: !this.model.isGroupActive(),
            selectionChangedHandler: (deactivate) => this.onActivationStatusChanged(deactivate),
        };
        return m(DropDownSelector, attrs);
    }
    async onActivationStatusChanged(deactivate) {
        const buyParams = await showProgressDialog("pleaseWait_msg", this.model.validateGroupActivationStatus(deactivate));
        if (!buyParams)
            return;
        const confirmed = await showBuyDialog(buyParams);
        if (!confirmed)
            return;
        await showProgressDialog("pleaseWait_msg", this.model.executeGroupBuy(deactivate));
    }
    renderNameField() {
        return m(TextField, {
            label: "name_label",
            value: this.model.getGroupName(),
            isReadOnly: true,
            injectionsRight: () => m(IconButton, {
                title: "edit_action",
                click: () => this.showChangeNameDialog(),
                icon: "Edit" /* Icons.Edit */,
                size: 1 /* ButtonSize.Compact */,
            }),
        });
    }
    showChangeNameDialog() {
        Dialog.showProcessTextInputDialog({
            title: "edit_action",
            label: "name_label",
            defaultValue: this.model.getGroupName(),
            inputValidator: (newName) => this.model.validateGroupName(newName),
        }, (newName) => this.model.changeGroupName(newName));
    }
    showChangeSenderNameDialog() {
        Dialog.showProcessTextInputDialog({
            title: "edit_action",
            label: "name_label",
            defaultValue: this.model.getGroupSenderName(),
        }, (newName) => this.model.changeGroupSenderName(newName));
    }
    renderUsedStorage() {
        const usedStorage = this.model.getUsedStorage();
        const formattedStorage = usedStorage ? formatStorageSize(usedStorage) : lang.get("loading_msg");
        return m(TextField, {
            label: "storageCapacityUsed_label",
            value: formattedStorage,
            isReadOnly: true,
        });
    }
    async showAddMemberDialog() {
        const possibleMembers = await this.model.getPossibleMembers();
        if (possibleMembers.length === 0) {
            return Dialog.message("noValidMembersToAdd_msg");
        }
        let currentSelection = getFirstOrThrow(possibleMembers).value;
        const addUserToGroupOkAction = (dialog) => {
            // noinspection JSIgnoredPromiseFromCall
            showProgressDialog("pleaseWait_msg", this.model.addUserToGroup(currentSelection));
            dialog.close();
        };
        Dialog.showActionDialog({
            title: "addUserToGroup_label",
            child: {
                view: () => m(DropDownSelector, {
                    label: "account_label",
                    items: possibleMembers,
                    selectedValue: currentSelection,
                    selectionChangedHandler: (newSelected) => (currentSelection = newSelected),
                    dropdownWidth: 250,
                }),
            },
            allowOkWithReturn: true,
            okAction: addUserToGroupOkAction,
        });
    }
    async entityEventsReceived(updates) {
        return this.model.entityEventsReceived(updates);
    }
    renderMembersTable() {
        if (!this.model.isGroupActive())
            return null;
        const addUserButtonAttrs = {
            title: "addUserToGroup_label",
            click: () => this.showAddMemberDialog(),
            icon: "Add" /* Icons.Add */,
            size: 1 /* ButtonSize.Compact */,
        };
        const lines = this.model.getMembersInfo().map((userGroupInfo) => {
            const removeButtonAttrs = {
                title: "remove_action",
                click: () => showProgressDialog("pleaseWait_msg", this.model.removeGroupMember(userGroupInfo)),
                icon: "Cancel" /* Icons.Cancel */,
                size: 1 /* ButtonSize.Compact */,
            };
            return {
                cells: [userGroupInfo.name, neverNull(userGroupInfo.mailAddress)],
                actionButtonAttrs: removeButtonAttrs,
            };
        });
        const membersTableAttrs = {
            columnHeading: ["name_label", "mailAddress_label"],
            columnWidths: [".column-width-largest" /* ColumnWidth.Largest */, ".column-width-largest" /* ColumnWidth.Largest */],
            showActionButtonColumn: true,
            addButtonAttrs: addUserButtonAttrs,
            lines,
        };
        return [m(".h5.mt-l.mb-s", lang.get("groupMembers_label")), m(Table, membersTableAttrs)];
    }
}
export function getGroupTypeDisplayName(groupType) {
    if (groupType == null) {
        return "";
    }
    else if (groupType === GroupType.Mail) {
        return lang.get("sharedMailbox_label");
    }
    else if (groupType === GroupType.User) {
        return lang.get("userColumn_label");
    }
    else if (groupType === GroupType.Template) {
        return lang.get("templateGroup_label");
    }
    else {
        return groupType; // just for testing
    }
}
//# sourceMappingURL=GroupDetailsView.js.map