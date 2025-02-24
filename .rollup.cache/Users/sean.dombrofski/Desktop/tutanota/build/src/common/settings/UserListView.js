import m from "mithril";
import { NotFoundError } from "../api/common/error/RestError.js";
import { size } from "../gui/size.js";
import { GroupInfoTypeRef, GroupMemberTypeRef } from "../api/entities/sys/TypeRefs.js";
import { contains, LazyLoaded, noOp } from "@tutao/tutanota-utils";
import { UserViewer } from "./UserViewer.js";
import { FeatureType, GroupType } from "../api/common/TutanotaConstants.js";
import { Icon } from "../gui/base/Icon.js";
import { compareGroupInfos } from "../api/common/utils/GroupUtils.js";
import { elementIdPart } from "../api/common/utils/EntityUtils.js";
import { ListColumnWrapper } from "../gui/ListColumnWrapper.js";
import { assertMainOrNode } from "../api/common/Env.js";
import { locator } from "../api/main/CommonLocator.js";
import * as AddUserDialog from "./AddUserDialog.js";
import { SelectableRowContainer, setVisibility } from "../gui/SelectableRowContainer.js";
import { List } from "../gui/base/List.js";
import { listSelectionKeyboardShortcuts } from "../gui/base/ListUtils.js";
import ColumnEmptyMessageBox from "../gui/base/ColumnEmptyMessageBox.js";
import { theme } from "../gui/theme.js";
import { BaseSearchBar } from "../gui/base/BaseSearchBar.js";
import { IconButton } from "../gui/base/IconButton.js";
import { attachDropdown } from "../gui/base/Dropdown.js";
import { lang } from "../misc/LanguageViewModel.js";
import { keyManager } from "../misc/KeyManager.js";
import { isUpdateFor, isUpdateForTypeRef } from "../api/common/utils/EntityUpdateUtils.js";
import { ListAutoSelectBehavior } from "../misc/DeviceConfig.js";
import { ListElementListModel } from "../misc/ListElementListModel";
assertMainOrNode();
/**
 * Displays a list with users that are available to manage by the current user.
 * Global admins see all users.
 * Local admins see only their assigned users.
 */
export class UserListView {
    updateDetailsViewer;
    focusDetailsViewer;
    canImportUsers;
    onImportUsers;
    onExportUsers;
    searchQuery = "";
    listModel;
    renderConfig = {
        createElement: (dom) => {
            const row = new UserRow((groupInfo) => this.isAdmin(groupInfo));
            m.render(dom, row.render());
            return row;
        },
        itemHeight: size.list_row_height,
        swipe: null,
        multiselectionAllowed: 0 /* MultiselectMode.Disabled */,
    };
    listId;
    adminUserGroupInfoIds = [];
    listStateSubscription = null;
    listSelectionSubscription = null;
    constructor(updateDetailsViewer, focusDetailsViewer, canImportUsers, onImportUsers, onExportUsers) {
        this.updateDetailsViewer = updateDetailsViewer;
        this.focusDetailsViewer = focusDetailsViewer;
        this.canImportUsers = canImportUsers;
        this.onImportUsers = onImportUsers;
        this.onExportUsers = onExportUsers;
        // doing it after "onSelectionChanged" is initialized
        this.listModel = this.makeListModel();
        this.listId = new LazyLoaded(async () => {
            const customer = await locator.logins.getUserController().loadCustomer();
            return customer.userGroups;
        });
        this.listModel.loadInitial();
        this.oncreate = this.oncreate.bind(this);
        this.onremove = this.onremove.bind(this);
        this.view = this.view.bind(this);
    }
    shortcuts = listSelectionKeyboardShortcuts(0 /* MultiselectMode.Disabled */, () => this.listModel);
    oncreate() {
        keyManager.registerShortcuts(this.shortcuts);
    }
    view() {
        if (locator.logins.isEnabled(FeatureType.WhitelabelChild)) {
            return null;
        }
        return m(ListColumnWrapper, {
            headerContent: m(".flex.flex-space-between.center-vertically.plr-l", m(BaseSearchBar, {
                text: this.searchQuery,
                onInput: (text) => this.updateQuery(text),
                busy: false,
                onKeyDown: (e) => e.stopPropagation(),
                onClear: () => {
                    this.searchQuery = "";
                    this.listModel.reapplyFilter();
                },
                placeholder: lang.get("searchUsers_placeholder"),
            }), m(".mr-negative-s", m(IconButton, {
                title: "addUsers_action",
                icon: "Add" /* Icons.Add */,
                click: () => this.addButtonClicked(),
            }), this.renderImportButton())),
        }, this.listModel.isEmptyAndDone()
            ? m(ColumnEmptyMessageBox, {
                color: theme.list_message_bg,
                icon: "Contacts" /* BootIcons.Contacts */,
                message: "noEntries_msg",
            })
            : m(List, {
                renderConfig: this.renderConfig,
                state: this.listModel.state,
                onLoadMore: () => this.listModel.loadMore(),
                onRetryLoading: () => this.listModel.retryLoading(),
                onStopLoading: () => this.listModel.stopLoading(),
                onSingleSelection: (item) => {
                    this.listModel.onSingleSelection(item);
                    this.focusDetailsViewer();
                },
                onSingleTogglingMultiselection: noOp,
                onRangeSelectionTowards: noOp,
            }));
    }
    renderImportButton() {
        if (this.canImportUsers()) {
            return m(IconButton, attachDropdown({
                mainButtonAttrs: {
                    title: "more_label",
                    icon: "More" /* Icons.More */,
                },
                childAttrs: () => [
                    {
                        label: "importUsers_action",
                        click: () => {
                            this.onImportUsers();
                        },
                    },
                    {
                        label: "exportUsers_action",
                        click: () => {
                            this.onExportUsers();
                        },
                    },
                ],
            }));
        }
        else {
            return null;
        }
    }
    onremove() {
        keyManager.unregisterShortcuts(this.shortcuts);
        this.listStateSubscription?.end(true);
        this.listSelectionSubscription?.end(true);
    }
    async loadAdmins() {
        const adminGroupMembership = locator.logins.getUserController().user.memberships.find((gm) => gm.groupType === GroupType.Admin);
        if (adminGroupMembership == null) {
            return;
        }
        const members = await locator.entityClient.loadAll(GroupMemberTypeRef, adminGroupMembership.groupMember[0]);
        this.adminUserGroupInfoIds = members.map((adminGroupMember) => elementIdPart(adminGroupMember.userGroupInfo));
    }
    isAdmin(userGroupInfo) {
        return contains(this.adminUserGroupInfoIds, userGroupInfo._id[1]);
    }
    addButtonClicked() {
        AddUserDialog.show();
    }
    async entityEventsReceived(updates) {
        for (const update of updates) {
            const { instanceListId, instanceId, operation } = update;
            if (isUpdateForTypeRef(GroupInfoTypeRef, update) && this.listId.getSync() === instanceListId) {
                await this.listModel.entityEventReceived(instanceListId, instanceId, operation);
            }
            else if (isUpdateFor(locator.logins.getUserController().user, update)) {
                await this.loadAdmins();
                this.listModel.reapplyFilter();
            }
            m.redraw();
        }
    }
    makeListModel() {
        const listModel = new ListElementListModel({
            sortCompare: compareGroupInfos,
            fetch: async (_lastFetchedEntity) => {
                await this.loadAdmins();
                const listId = await this.listId.getAsync();
                const allUserGroupInfos = await locator.entityClient.loadAll(GroupInfoTypeRef, listId);
                return { items: allUserGroupInfos, complete: true };
            },
            loadSingle: async (_listId, elementId) => {
                const listId = await this.listId.getAsync();
                try {
                    return await locator.entityClient.load(GroupInfoTypeRef, [listId, elementId]);
                }
                catch (e) {
                    if (e instanceof NotFoundError) {
                        // we return null if the GroupInfo does not exist
                        return null;
                    }
                    else {
                        throw e;
                    }
                }
            },
            autoSelectBehavior: () => ListAutoSelectBehavior.OLDER,
        });
        listModel.setFilter((gi) => this.groupFilter() && this.queryFilter(gi));
        this.listStateSubscription?.end(true);
        this.listStateSubscription = listModel.stateStream.map((state) => {
            m.redraw();
        });
        this.listSelectionSubscription?.end(true);
        this.listSelectionSubscription = listModel.differentItemsSelected.map((newSelection) => {
            let detailsViewer;
            if (newSelection.size === 0) {
                detailsViewer = null;
            }
            else {
                const item = newSelection.values().next().value;
                detailsViewer = new UserViewer(item, this.isAdmin(item));
            }
            this.updateDetailsViewer(detailsViewer);
            m.redraw();
        });
        return listModel;
    }
    queryFilter(gi) {
        const lowercaseSearch = this.searchQuery.toLowerCase();
        return (gi.name.toLowerCase().includes(lowercaseSearch) ||
            (!!gi.mailAddress && gi.mailAddress?.toLowerCase().includes(lowercaseSearch)) ||
            gi.mailAddressAliases.some((mai) => mai.mailAddress.toLowerCase().includes(lowercaseSearch)));
    }
    groupFilter = () => {
        return locator.logins.getUserController().isGlobalAdmin();
    };
    updateQuery(query) {
        this.searchQuery = query;
        this.listModel.reapplyFilter();
    }
}
export class UserRow {
    isAdmin;
    top = 0;
    domElement = null; // set from List
    entity = null;
    nameDom;
    addressDom;
    adminIconDom;
    deletedIconDom;
    selectionUpdater;
    constructor(isAdmin) {
        this.isAdmin = isAdmin;
    }
    update(groupInfo, selected) {
        this.entity = groupInfo;
        this.selectionUpdater(selected, false);
        this.nameDom.textContent = groupInfo.name;
        this.addressDom.textContent = groupInfo.mailAddress ? groupInfo.mailAddress : "";
        setVisibility(this.adminIconDom, this.isAdmin(groupInfo));
        setVisibility(this.deletedIconDom, groupInfo.deleted != null);
    }
    /**
     * Only the structure is managed by mithril. We set all contents on our own (see update) in order to avoid the vdom overhead (not negligible on mobiles)
     */
    render() {
        return m(SelectableRowContainer, {
            onSelectedChangeRef: (updater) => (this.selectionUpdater = updater),
        }, m(".flex.col.flex-grow", [
            m(".badge-line-height", [
                m("", {
                    oncreate: (vnode) => (this.nameDom = vnode.dom),
                }),
            ]),
            m(".flex-space-between.mt-xxs", [
                m(".smaller", {
                    oncreate: (vnode) => (this.addressDom = vnode.dom),
                }),
                m(".icons.flex", [
                    m(Icon, {
                        icon: "Settings" /* BootIcons.Settings */,
                        oncreate: (vnode) => (this.adminIconDom = vnode.dom),
                        class: "svg-list-accent-fg",
                        style: {
                            display: "none",
                        },
                    }),
                    m(Icon, {
                        icon: "Trash" /* Icons.Trash */,
                        oncreate: (vnode) => (this.deletedIconDom = vnode.dom),
                        class: "svg-list-accent-fg",
                        style: {
                            display: "none",
                        },
                    }),
                ]),
            ]),
        ]));
    }
}
//# sourceMappingURL=UserListView.js.map