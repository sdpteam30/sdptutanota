import m from "mithril";
import { KnowledgeBaseEntryTypeRef } from "../../common/api/entities/tutanota/TypeRefs.js";
import { lang } from "../../common/misc/LanguageViewModel";
import { size } from "../../common/gui/size";
import { isSameId, listIdPart } from "../../common/api/common/utils/EntityUtils";
import { hasCapabilityOnGroup } from "../../common/sharing/GroupUtils";
import { ListColumnWrapper } from "../../common/gui/ListColumnWrapper";
import { KnowledgeBaseEntryView } from "../knowledgebase/view/KnowledgeBaseEntryView";
import { memoized, NBSP, noOp } from "@tutao/tutanota-utils";
import { assertMainOrNode } from "../../common/api/common/Env";
import { SelectableRowContainer } from "../../common/gui/SelectableRowContainer.js";
import { ListElementListModel } from "../../common/misc/ListElementListModel.js";
import { listSelectionKeyboardShortcuts, onlySingleSelection } from "../../common/gui/base/ListUtils.js";
import { List } from "../../common/gui/base/List.js";
import { BaseSearchBar } from "../../common/gui/base/BaseSearchBar.js";
import { IconButton } from "../../common/gui/base/IconButton.js";
import ColumnEmptyMessageBox from "../../common/gui/base/ColumnEmptyMessageBox.js";
import { theme } from "../../common/gui/theme.js";
import { knowledgeBaseSearch } from "../knowledgebase/model/KnowledgeBaseSearchFilter.js";
import { showKnowledgeBaseEditor } from "./KnowledgeBaseEditor.js";
import { keyManager } from "../../common/misc/KeyManager.js";
import { isUpdateForTypeRef } from "../../common/api/common/utils/EntityUpdateUtils.js";
import { ListAutoSelectBehavior } from "../../common/misc/DeviceConfig.js";
assertMainOrNode();
/**
 *  List that is rendered within the knowledgeBase Settings
 */
export class KnowledgeBaseListView {
    entityClient;
    logins;
    templateGroupRoot;
    templateGroup;
    updateDetailsViewer;
    focusDetailsViewer;
    searchQuery = "";
    resultItemIds = [];
    listModel;
    listStateSubscription = null;
    renderConfig = {
        itemHeight: size.list_row_height,
        multiselectionAllowed: 0 /* MultiselectMode.Disabled */,
        swipe: null,
        createElement: (dom) => {
            const knowledgebaseRow = new KnowledgeBaseRow();
            m.render(dom, knowledgebaseRow.render());
            return knowledgebaseRow;
        },
    };
    shortcuts = listSelectionKeyboardShortcuts(0 /* MultiselectMode.Disabled */, () => this.listModel);
    constructor(entityClient, logins, templateGroupRoot, templateGroup, updateDetailsViewer, focusDetailsViewer) {
        this.entityClient = entityClient;
        this.logins = logins;
        this.templateGroupRoot = templateGroupRoot;
        this.templateGroup = templateGroup;
        this.updateDetailsViewer = updateDetailsViewer;
        this.focusDetailsViewer = focusDetailsViewer;
        this.listModel = this.makeListModel();
        this.listModel.loadInitial();
        // hacks for old components
        this.view = this.view.bind(this);
        this.oncreate = this.oncreate.bind(this);
        this.onremove = this.onremove.bind(this);
    }
    oncreate() {
        keyManager.registerShortcuts(this.shortcuts);
    }
    onremove() {
        keyManager.unregisterShortcuts(this.shortcuts);
    }
    makeListModel() {
        const listModel = new ListElementListModel({
            sortCompare: (a, b) => {
                const titleA = a.title.toUpperCase();
                const titleB = b.title.toUpperCase();
                return titleA < titleB ? -1 : titleA > titleB ? 1 : 0;
            },
            fetch: async (_lastFetchedEntity, _count) => {
                // load all entries at once to apply custom sort order
                const allEntries = await this.entityClient.loadAll(KnowledgeBaseEntryTypeRef, this.getListId());
                return { items: allEntries, complete: true };
            },
            loadSingle: (_listId, elementId) => {
                return this.entityClient.load(KnowledgeBaseEntryTypeRef, [this.getListId(), elementId]);
            },
            autoSelectBehavior: () => ListAutoSelectBehavior.OLDER,
        });
        listModel.setFilter((item) => this.queryFilter(item));
        this.listStateSubscription?.end(true);
        this.listStateSubscription = listModel.stateStream.map((state) => {
            this.onSelectionChanged(onlySingleSelection(state));
            m.redraw();
        });
        return listModel;
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
                    this.resultItemIds = [];
                    this.listModel.reapplyFilter();
                },
                placeholder: lang.get("searchKnowledgebase_placeholder"),
            }), this.userCanEdit()
                ? m(".mr-negative-s", m(IconButton, {
                    title: "addEntry_label",
                    icon: "Add" /* Icons.Add */,
                    click: () => {
                        showKnowledgeBaseEditor(null, this.templateGroupRoot);
                    },
                }))
                : null),
        }, this.listModel.isEmptyAndDone()
            ? m(ColumnEmptyMessageBox, {
                color: theme.list_message_bg,
                icon: "Book" /* Icons.Book */,
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
    async entityEventsReceived(updates) {
        for (const update of updates) {
            if (isUpdateForTypeRef(KnowledgeBaseEntryTypeRef, update) && isSameId(this.getListId(), update.instanceListId)) {
                await this.listModel.entityEventReceived(update.instanceListId, update.instanceId, update.operation);
            }
        }
        // we need to make another search in case items have changed
        this.updateQuery(this.searchQuery);
        m.redraw();
    }
    onSelectionChanged = memoized((item) => {
        const detailsViewer = item == null ? null : new KnowledgeBaseSettingsDetailsViewer(item, !this.userCanEdit());
        this.updateDetailsViewer(detailsViewer);
    });
    queryFilter(item) {
        return this.searchQuery === "" ? true : this.resultItemIds.includes(item._id);
    }
    updateQuery(query) {
        this.searchQuery = query;
        this.resultItemIds = knowledgeBaseSearch(this.searchQuery, this.listModel.getUnfilteredAsArray()).map((item) => item._id);
        this.listModel.reapplyFilter();
    }
    userCanEdit() {
        return hasCapabilityOnGroup(this.logins.getUserController().user, this.templateGroup, "1" /* ShareCapability.Write */);
    }
    getListId() {
        return this.templateGroupRoot.knowledgeBase;
    }
}
export class KnowledgeBaseRow {
    top = 0;
    domElement = null;
    entity = null;
    entryTitleDom;
    selectionUpdater;
    update(entry, selected) {
        this.entity = entry;
        this.selectionUpdater(selected, false);
        this.entryTitleDom.textContent = entry.title;
    }
    render() {
        return m(SelectableRowContainer, {
            onSelectedChangeRef: (updater) => (this.selectionUpdater = updater),
        }, m(".flex.col", [
            m(".text-ellipsis.badge-line-height", {
                oncreate: (vnode) => (this.entryTitleDom = vnode.dom),
            }),
            // to create a second row
            m(".smaller.mt-xxs", NBSP),
        ]));
    }
}
export class KnowledgeBaseSettingsDetailsViewer {
    entry;
    readonly;
    constructor(entry, readonly) {
        this.entry = entry;
        this.readonly = readonly;
    }
    renderView() {
        return m(".plr-l", m(KnowledgeBaseEntryView, {
            entry: this.entry,
            onTemplateSelected: (templateId) => m.route.set(`/settings/templates/${listIdPart(templateId)}}`),
            readonly: this.readonly,
        }));
    }
    entityEventsReceived(updates) {
        return Promise.resolve();
    }
}
//# sourceMappingURL=KnowledgeBaseListView.js.map