import m from "mithril";
import { GroupInfoTypeRef, GroupMemberTypeRef } from "../../../common/api/entities/sys/TypeRefs.js";
import { LazyLoaded, memoized, noOp } from "@tutao/tutanota-utils";
import { GroupDetailsView } from "../../../common/settings/groups/GroupDetailsView.js";
import * as AddGroupDialog from "./AddGroupDialog.js";
import { Icon } from "../../../common/gui/base/Icon.js";
import { locator } from "../../../common/api/main/CommonLocator.js";
import { ListColumnWrapper } from "../../../common/gui/ListColumnWrapper.js";
import { assertMainOrNode } from "../../../common/api/common/Env.js";
import { GroupDetailsModel } from "./GroupDetailsModel.js";
import { SelectableRowContainer, setVisibility } from "../../../common/gui/SelectableRowContainer.js";
import { List } from "../../../common/gui/base/List.js";
import { size } from "../../../common/gui/size.js";
import { ListElementListModel } from "../../../common/misc/ListElementListModel.js";
import { compareGroupInfos } from "../../../common/api/common/utils/GroupUtils.js";
import { NotFoundError } from "../../../common/api/common/error/RestError.js";
import { listSelectionKeyboardShortcuts, onlySingleSelection } from "../../../common/gui/base/ListUtils.js";
import { keyManager } from "../../../common/misc/KeyManager.js";
import { BaseSearchBar } from "../../../common/gui/base/BaseSearchBar.js";
import { lang } from "../../../common/misc/LanguageViewModel.js";
import ColumnEmptyMessageBox from "../../../common/gui/base/ColumnEmptyMessageBox.js";
import { theme } from "../../../common/gui/theme.js";
import { IconButton } from "../../../common/gui/base/IconButton.js";
import { NewPaidPlans } from "../../../common/api/common/TutanotaConstants.js";
import { isUpdateForTypeRef } from "../../../common/api/common/utils/EntityUpdateUtils.js";
import { ListAutoSelectBehavior } from "../../../common/misc/DeviceConfig.js";
assertMainOrNode();
const className = "group-list";
export class GroupListView {
    updateDetailsViewer;
    focusDetailsViewer;
    searchQuery = "";
    listModel;
    renderConfig = {
        itemHeight: size.list_row_height,
        multiselectionAllowed: 0 /* MultiselectMode.Disabled */,
        swipe: null,
        createElement: (dom) => {
            const groupRow = new GroupRow();
            m.render(dom, groupRow.render());
            return groupRow;
        },
    };
    listId;
    listStateSubscription = null;
    constructor(updateDetailsViewer, focusDetailsViewer) {
        this.updateDetailsViewer = updateDetailsViewer;
        this.focusDetailsViewer = focusDetailsViewer;
        this.listModel = this.makeListModel();
        this.listId = new LazyLoaded(() => {
            return locator.logins
                .getUserController()
                .loadCustomer()
                .then((customer) => {
                return customer.teamGroups;
            });
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
                placeholder: lang.get("searchMailboxes_placeholder"),
            }), m(".mr-negative-s", m(IconButton, {
                title: "createSharedMailbox_label",
                icon: "Add" /* Icons.Add */,
                click: () => this.addButtonClicked(),
            }))),
        }, this.listModel.isEmptyAndDone()
            ? m(ColumnEmptyMessageBox, {
                color: theme.list_message_bg,
                icon: "People" /* Icons.People */,
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
    onremove() {
        keyManager.unregisterShortcuts(this.shortcuts);
        this.listStateSubscription?.end(true);
    }
    async addButtonClicked() {
        if (await locator.logins.getUserController().isNewPaidPlan()) {
            AddGroupDialog.show();
        }
        else {
            const msg = lang.makeTranslation("upgrade_text", lang.get("newPaidPlanRequired_msg") + " " + lang.get("sharedMailboxesMultiUser_msg"));
            const wizard = await import("../../../common/subscription/UpgradeSubscriptionWizard");
            await wizard.showUpgradeWizard(locator.logins, NewPaidPlans, msg);
        }
    }
    async entityEventsReceived(updates) {
        for (const update of updates) {
            const { instanceListId, instanceId, operation } = update;
            if (isUpdateForTypeRef(GroupInfoTypeRef, update) && this.listId.getSync() === instanceListId) {
                await this.listModel.entityEventReceived(instanceListId, instanceId, operation);
            }
            else if (isUpdateForTypeRef(GroupMemberTypeRef, update)) {
                this.listModel.reapplyFilter();
            }
            m.redraw();
        }
    }
    makeListModel() {
        const listModel = new ListElementListModel({
            sortCompare: compareGroupInfos,
            fetch: async (_lastFetchedEntity, _count) => {
                // load all entries at once to apply custom sort order
                const listId = await this.listId.getAsync();
                const allGroupInfos = await locator.entityClient.loadAll(GroupInfoTypeRef, listId);
                return { items: allGroupInfos, complete: true };
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
        listModel.setFilter((item) => this.groupFilter() && this.queryFilter(item));
        this.listStateSubscription?.end(true);
        this.listStateSubscription = listModel.stateStream.map((state) => {
            this.onSelectionChanged(onlySingleSelection(state));
            m.redraw();
        });
        return listModel;
    }
    onSelectionChanged = memoized((item) => {
        if (item) {
            const newSelectionModel = new GroupDetailsModel(item, locator.entityClient, m.redraw);
            const detailsViewer = item == null ? null : new GroupDetailsView(newSelectionModel);
            this.updateDetailsViewer(detailsViewer);
        }
    });
    queryFilter(gi) {
        const lowercaseSearch = this.searchQuery.toLowerCase();
        return gi.name.toLowerCase().includes(lowercaseSearch) || (!!gi.mailAddress && gi.mailAddress?.toLowerCase().includes(lowercaseSearch));
    }
    groupFilter = () => {
        return locator.logins.getUserController().isGlobalAdmin();
    };
    updateQuery(query) {
        this.searchQuery = query;
        this.listModel.reapplyFilter();
    }
}
export class GroupRow {
    top = 0;
    domElement = null; // set from List
    entity = null;
    nameDom;
    addressDom;
    deletedIconDom;
    localAdminIconDom;
    mailIconDom;
    selectionUpdater;
    constructor() { }
    update(groupInfo, selected) {
        this.entity = groupInfo;
        this.selectionUpdater(selected, false);
        this.nameDom.textContent = groupInfo.name;
        this.addressDom.textContent = groupInfo.mailAddress ?? "";
        setVisibility(this.deletedIconDom, groupInfo.deleted != null);
        // mail group or local admin group
        if (groupInfo.mailAddress) {
            this.localAdminIconDom.style.display = "none";
            this.mailIconDom.style.display = "";
        }
        else {
            this.localAdminIconDom.style.display = "";
            this.mailIconDom.style.display = "none";
        }
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
                        icon: "Trash" /* Icons.Trash */,
                        oncreate: (vnode) => (this.deletedIconDom = vnode.dom),
                        class: "svg-list-accent-fg",
                        style: {
                            display: "none",
                        },
                    }),
                    m(Icon, {
                        icon: "Settings" /* BootIcons.Settings */,
                        oncreate: (vnode) => (this.localAdminIconDom = vnode.dom),
                        class: "svg-list-accent-fg",
                        style: {
                            display: "none",
                        },
                    }),
                    m(Icon, {
                        icon: "Mail" /* BootIcons.Mail */,
                        oncreate: (vnode) => (this.mailIconDom = vnode.dom),
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
//# sourceMappingURL=GroupListView.js.map