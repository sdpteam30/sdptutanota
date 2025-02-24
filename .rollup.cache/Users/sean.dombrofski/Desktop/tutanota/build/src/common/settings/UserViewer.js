import m from "mithril";
import { assertMainOrNode } from "../api/common/Env.js";
import { Dialog } from "../gui/base/Dialog.js";
import { formatDateWithMonth, formatStorageSize } from "../misc/Formatter.js";
import { lang } from "../misc/LanguageViewModel.js";
import { GroupInfoTypeRef, GroupTypeRef, UserTypeRef } from "../api/entities/sys/TypeRefs.js";
import { asyncFind, getFirstOrThrow, LazyLoaded, neverNull, ofClass, promiseMap } from "@tutao/tutanota-utils";
import { BookingItemFeatureType, GroupType } from "../api/common/TutanotaConstants.js";
import { BadRequestError, NotAuthorizedError, PreconditionFailedError } from "../api/common/error/RestError.js";
import { Table } from "../gui/base/Table.js";
import { getGroupTypeDisplayName } from "./groups/GroupDetailsView.js";
import { SecondFactorsEditForm } from "./login/secondfactor/SecondFactorsEditForm.js";
import { showProgressDialog } from "../gui/dialogs/ProgressDialog.js";
import { HtmlEditor as Editor, HtmlEditorMode } from "../gui/editor/HtmlEditor.js";
import { checkAndImportUserData, CSV_USER_FORMAT } from "./ImportUsersViewer.js";
import { MailAddressTable } from "./mailaddress/MailAddressTable.js";
import { compareGroupInfos, getGroupInfoDisplayName } from "../api/common/utils/GroupUtils.js";
import { isSameId } from "../api/common/utils/EntityUtils.js";
import { showBuyDialog } from "../subscription/BuyDialog.js";
import { TextField } from "../gui/base/TextField.js";
import { locator } from "../api/main/CommonLocator.js";
import { DropDownSelector } from "../gui/base/DropDownSelector.js";
import { showChangeOwnPasswordDialog, showChangeUserPasswordAsAdminDialog } from "./login/ChangePasswordDialogs.js";
import { IconButton } from "../gui/base/IconButton.js";
import { progressIcon } from "../gui/base/Icon.js";
import { toFeatureType } from "../subscription/SubscriptionUtils.js";
import { isUpdateForTypeRef } from "../api/common/utils/EntityUpdateUtils.js";
assertMainOrNode();
export class UserViewer {
    userGroupInfo;
    isAdmin;
    user = new LazyLoaded(() => this.loadUser());
    customer = new LazyLoaded(() => this.loadCustomer());
    teamGroupInfos = new LazyLoaded(() => this.loadTeamGroupInfos());
    groupsTableAttrs = null;
    secondFactorsForm;
    usedStorage = null;
    mailAddressTableModel = null;
    mailAddressTableExpanded;
    constructor(userGroupInfo, isAdmin) {
        this.userGroupInfo = userGroupInfo;
        this.isAdmin = isAdmin;
        this.userGroupInfo = userGroupInfo;
        this.mailAddressTableExpanded = false;
        this.secondFactorsForm = new SecondFactorsEditForm(this.user, locator.domainConfigProvider(), locator.loginFacade, this.isAdmin, !!this.userGroupInfo.deleted);
        this.teamGroupInfos.getAsync().then(async (availableTeamGroupInfos) => {
            if (availableTeamGroupInfos.length > 0) {
                this.groupsTableAttrs = {
                    columnHeading: ["name_label", "groupType_label"],
                    columnWidths: [".column-width-largest" /* ColumnWidth.Largest */, ".column-width-small" /* ColumnWidth.Small */],
                    showActionButtonColumn: true,
                    addButtonAttrs: {
                        title: "addGroup_label",
                        icon: "Add" /* Icons.Add */,
                        click: () => this.showAddUserToGroupDialog(),
                    },
                    lines: [],
                };
                await this.updateGroups();
            }
        });
        this.user.getAsync().then(async (user) => {
            const mailMembership = await asyncFind(user.memberships, async (ship) => {
                return ship.groupType === GroupType.Mail && (await locator.entityClient.load(GroupTypeRef, ship.group)).user === user._id;
            });
            if (mailMembership == null) {
                console.error("User doesn't have a mailbox?", user._id);
                return;
            }
            this.mailAddressTableModel = this.isItMe()
                ? await locator.mailAddressTableModelForOwnMailbox()
                : await locator.mailAddressTableModelForAdmin(mailMembership.group, user._id, this.userGroupInfo);
            m.redraw();
        });
        this.updateUsedStorageAndAdminFlag();
    }
    renderView() {
        const changePasswordButtonAttrs = {
            title: "changePassword_label",
            click: () => this.changePassword(),
            icon: "Edit" /* Icons.Edit */,
            size: 1 /* ButtonSize.Compact */,
        };
        const passwordFieldAttrs = {
            label: "password_label",
            value: "***",
            injectionsRight: () => [m(IconButton, changePasswordButtonAttrs)],
            isReadOnly: true,
        };
        return m("#user-viewer.fill-absolute.scroll.plr-l.pb-floating", [
            m(".h4.mt-l", lang.get("userSettings_label")),
            m("", [
                m(TextField, {
                    label: "mailAddress_label",
                    value: this.userGroupInfo.mailAddress ?? "",
                    isReadOnly: true,
                }),
                m(TextField, {
                    label: "created_label",
                    value: formatDateWithMonth(this.userGroupInfo.created),
                    isReadOnly: true,
                }),
                m(TextField, {
                    label: "storageCapacityUsed_label",
                    value: this.usedStorage ? formatStorageSize(this.usedStorage) : lang.get("loading_msg"),
                    isReadOnly: true,
                }),
            ]),
            m("", [
                this.renderName(),
                m(TextField, passwordFieldAttrs),
                locator.logins.getUserController().isGlobalAdmin() ? this.renderAdminStatusSelector() : null,
                this.renderUserStatusSelector(),
            ]),
            m(this.secondFactorsForm),
            this.groupsTableAttrs ? m(".h4.mt-l.mb-s", lang.get("groups_label")) : null,
            this.groupsTableAttrs ? m(Table, this.groupsTableAttrs) : null,
            this.mailAddressTableModel
                ? m(MailAddressTable, {
                    model: this.mailAddressTableModel,
                    expanded: this.mailAddressTableExpanded,
                    onExpanded: (newExpanded) => (this.mailAddressTableExpanded = newExpanded),
                })
                : progressIcon(),
        ]);
    }
    renderName() {
        const name = this.userGroupInfo.name;
        return m(TextField, {
            label: "name_label",
            value: name,
            isReadOnly: true,
            injectionsRight: () => m(IconButton, {
                title: "edit_action",
                click: () => this.onChangeName(name),
                icon: "Edit" /* Icons.Edit */,
                size: 1 /* ButtonSize.Compact */,
            }),
        });
    }
    onChangeName(name) {
        Dialog.showProcessTextInputDialog({
            title: "edit_action",
            label: "name_label",
            defaultValue: name,
        }, (newName) => {
            this.userGroupInfo.name = newName;
            return locator.entityClient.update(this.userGroupInfo);
        });
    }
    renderAdminStatusSelector() {
        return m(DropDownSelector, {
            label: "globalAdmin_label",
            items: [
                {
                    name: lang.get("no_label"),
                    value: false,
                },
                {
                    name: lang.get("yes_label"),
                    value: true,
                },
            ],
            selectedValue: this.isAdmin,
            selectionChangedHandler: (value) => {
                if (this.userGroupInfo.deleted) {
                    Dialog.message("userAccountDeactivated_msg");
                }
                else if (this.isItMe()) {
                    Dialog.message("removeOwnAdminFlagInfo_msg");
                }
                else {
                    showProgressDialog("pleaseWait_msg", this.user
                        .getAsync()
                        .then((user) => locator.userManagementFacade.changeAdminFlag(user, value))
                        .catch(ofClass(PreconditionFailedError, (e) => {
                        if (e.data && e.data === "usergroup.pending-key-rotation") {
                            Dialog.message("makeAdminPendingUserGroupKeyRotationError_msg");
                        }
                        else if (e.data === "multiadmingroup.pending-key-rotation") {
                            // when a multi admin key rotation is scheduled we do not want to introduce new members into the admin group
                            Dialog.message("cannotAddAdminWhenMultiAdminKeyRotationScheduled_msg");
                        }
                        else {
                            throw e;
                        }
                    })));
                }
            },
        });
    }
    renderUserStatusSelector() {
        return m(DropDownSelector, {
            label: "state_label",
            items: [
                {
                    name: lang.get("activated_label"),
                    value: true,
                },
                {
                    name: lang.get("deactivated_label"),
                    value: false,
                },
            ],
            selectedValue: this.userGroupInfo.deleted == null,
            selectionChangedHandler: (activate) => {
                if (this.isAdmin) {
                    Dialog.message("deactivateOwnAccountInfo_msg");
                }
                else if (activate) {
                    this.restoreUser();
                }
                else {
                    this.deleteUser();
                }
            },
        });
    }
    isItMe() {
        return isSameId(locator.logins.getUserController().userGroupInfo._id, this.userGroupInfo._id);
    }
    changePassword() {
        if (this.isItMe()) {
            showChangeOwnPasswordDialog();
        }
        else if (this.isAdmin) {
            Dialog.message("changeAdminPassword_msg");
        }
        else {
            this.user.getAsync().then((user) => {
                showChangeUserPasswordAsAdminDialog(user);
            });
        }
    }
    async updateGroups() {
        if (this.groupsTableAttrs) {
            const user = await this.user.getAsync();
            const customer = await this.customer.getAsync();
            this.groupsTableAttrs.lines = await promiseMap(this.getTeamMemberships(user, customer), async (m) => {
                const groupInfo = await locator.entityClient.load(GroupInfoTypeRef, m.groupInfo);
                return {
                    cells: [getGroupInfoDisplayName(groupInfo), getGroupTypeDisplayName(neverNull(m.groupType))],
                    actionButtonAttrs: {
                        title: "remove_action",
                        click: () => {
                            showProgressDialog("pleaseWait_msg", locator.groupManagementFacade.removeUserFromGroup(user._id, groupInfo.group)).catch(ofClass(NotAuthorizedError, (e) => {
                                Dialog.message("removeUserFromGroupNotAdministratedUserError_msg");
                            }));
                        },
                        icon: "Cancel" /* Icons.Cancel */,
                    },
                };
            }, {
                concurrency: 5,
            });
        }
    }
    async showAddUserToGroupDialog() {
        const user = await this.user.getAsync();
        if (this.userGroupInfo.deleted) {
            Dialog.message("userAccountDeactivated_msg");
        }
        else {
            const globalAdmin = locator.logins.isGlobalAdminUserLoggedIn();
            const availableGroupInfos = this.teamGroupInfos
                .getLoaded()
                .filter((g) => 
            // global admins may add all groups
            globalAdmin &&
                // can't add deleted groups
                !g.deleted &&
                // can't add if the user is already in the group
                !user.memberships.some((m) => isSameId(m.groupInfo, g._id)))
                .sort(compareGroupInfos);
            if (availableGroupInfos.length > 0) {
                const dropdownItems = availableGroupInfos.map((g) => ({
                    name: getGroupInfoDisplayName(g),
                    value: g,
                }));
                let selectedGroupInfo = getFirstOrThrow(availableGroupInfos);
                Dialog.showActionDialog({
                    title: "addUserToGroup_label",
                    child: {
                        view: () => m(DropDownSelector, {
                            label: "group_label",
                            items: dropdownItems,
                            selectedValue: selectedGroupInfo,
                            selectionChangedHandler: (selection) => (selectedGroupInfo = selection),
                            dropdownWidth: 250,
                        }),
                    },
                    allowOkWithReturn: true,
                    okAction: (dialog) => {
                        showProgressDialog("pleaseWait_msg", locator.groupManagementFacade.addUserToGroup(user, selectedGroupInfo.group));
                        dialog.close();
                    },
                });
            }
        }
    }
    async updateUsedStorageAndAdminFlag() {
        const user = await this.user.getAsync();
        this.isAdmin = this.isAdminUser(user);
        try {
            this.usedStorage = await locator.userManagementFacade.readUsedUserStorage(user);
            m.redraw();
        }
        catch (e) {
            // may happen if the user gets the admin flag removed, so ignore it
            if (!(e instanceof BadRequestError)) {
                throw e;
            }
        }
    }
    getTeamMemberships(user, customer) {
        return user.memberships.filter((m) => m.groupInfo[0] === customer.teamGroups);
    }
    isAdminUser(user) {
        return user.memberships.some((m) => m.groupType === GroupType.Admin);
    }
    async deleteUser() {
        const planType = await locator.logins.getUserController().getPlanType();
        const newPlan = await locator.logins.getUserController().isNewPaidPlan();
        const confirmed = await showBuyDialog({
            featureType: newPlan ? toFeatureType(planType) : BookingItemFeatureType.LegacyUsers,
            bookingText: "cancelUserAccounts_label",
            count: -1,
            freeAmount: 0,
            reactivate: false,
        });
        if (confirmed) {
            return locator.userManagementFacade
                .deleteUser(await this.user.getAsync(), false)
                .catch(ofClass(PreconditionFailedError, () => Dialog.message("stillReferencedFromContactForm_msg")));
        }
    }
    async restoreUser() {
        const planType = await locator.logins.getUserController().getPlanType();
        const newPlan = await locator.logins.getUserController().isNewPaidPlan();
        const confirmed = await showBuyDialog({
            featureType: newPlan ? toFeatureType(planType) : BookingItemFeatureType.LegacyUsers,
            bookingText: "bookingItemUsersIncluding_label",
            count: 1,
            freeAmount: 0,
            reactivate: true,
        });
        if (confirmed) {
            await locator.userManagementFacade
                .deleteUser(await this.user.getAsync(), true)
                .catch(ofClass(PreconditionFailedError, () => Dialog.message("emailAddressInUse_msg")));
        }
    }
    async entityEventsReceived(updates) {
        for (const update of updates) {
            const { instanceListId, instanceId, operation } = update;
            if (isUpdateForTypeRef(GroupInfoTypeRef, update) &&
                operation === "1" /* OperationType.UPDATE */ &&
                isSameId(this.userGroupInfo._id, [neverNull(instanceListId), instanceId])) {
                this.userGroupInfo = await locator.entityClient.load(GroupInfoTypeRef, this.userGroupInfo._id);
                await this.updateUsedStorageAndAdminFlag();
                m.redraw();
            }
            else if (isUpdateForTypeRef(UserTypeRef, update) &&
                operation === "1" /* OperationType.UPDATE */ &&
                this.user.isLoaded() &&
                isSameId(this.user.getLoaded()._id, instanceId)) {
                this.user.reset();
                await this.updateUsedStorageAndAdminFlag();
                await this.updateGroups();
            }
            await this.secondFactorsForm.entityEventReceived(update);
        }
        m.redraw();
    }
    loadUser() {
        return locator.entityClient.load(GroupTypeRef, this.userGroupInfo.group).then((userGroup) => {
            return locator.entityClient.load(UserTypeRef, neverNull(userGroup.user));
        });
    }
    loadCustomer() {
        return locator.logins.getUserController().loadCustomer();
    }
    loadTeamGroupInfos() {
        return this.customer.getAsync().then((customer) => locator.entityClient.loadAll(GroupInfoTypeRef, customer.teamGroups));
    }
}
/**
 * Show editor for adding the csv values of the users.
 */
export function showUserImportDialog(customDomains) {
    let editor = new Editor("enterAsCSV_msg").showBorders().setMode(HtmlEditorMode.HTML).setValue(CSV_USER_FORMAT).setMinHeight(200);
    let form = {
        view: () => {
            return [m(editor)];
        },
    };
    Dialog.showActionDialog({
        title: "importUsers_action",
        child: form,
        okAction: (csvDialog) => {
            let closeCsvDialog = checkAndImportUserData(editor.getValue(), customDomains);
            if (closeCsvDialog) {
                csvDialog.close();
            }
        },
    });
}
//# sourceMappingURL=UserViewer.js.map