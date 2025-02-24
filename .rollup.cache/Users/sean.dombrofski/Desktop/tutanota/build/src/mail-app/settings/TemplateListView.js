import m from "mithril";
import { showTemplateEditor } from "./TemplateEditor";
import { EmailTemplateTypeRef } from "../../common/api/entities/tutanota/TypeRefs.js";
import { isSameId } from "../../common/api/common/utils/EntityUtils";
import { searchInTemplates, TEMPLATE_SHORTCUT_PREFIX } from "../templates/model/TemplatePopupModel";
import { hasCapabilityOnGroup } from "../../common/sharing/GroupUtils";
import { ListColumnWrapper } from "../../common/gui/ListColumnWrapper";
import { memoized, noOp } from "@tutao/tutanota-utils";
import { assertMainOrNode } from "../../common/api/common/Env";
import { SelectableRowContainer } from "../../common/gui/SelectableRowContainer.js";
import { ListElementListModel } from "../../common/misc/ListElementListModel.js";
import ColumnEmptyMessageBox from "../../common/gui/base/ColumnEmptyMessageBox.js";
import { theme } from "../../common/gui/theme.js";
import { List } from "../../common/gui/base/List.js";
import { size } from "../../common/gui/size.js";
import { TemplateDetailsViewer } from "./TemplateDetailsViewer.js";
import { listSelectionKeyboardShortcuts, onlySingleSelection } from "../../common/gui/base/ListUtils.js";
import { IconButton } from "../../common/gui/base/IconButton.js";
import { BaseSearchBar } from "../../common/gui/base/BaseSearchBar.js";
import { lang } from "../../common/misc/LanguageViewModel.js";
import { keyManager } from "../../common/misc/KeyManager.js";
import { isUpdateForTypeRef } from "../../common/api/common/utils/EntityUpdateUtils.js";
import { ListAutoSelectBehavior } from "../../common/misc/DeviceConfig.js";
assertMainOrNode();
/**
 *  List that is rendered within the template Settings
 */
export class TemplateListView {
    groupInstance;
    entityClient;
    logins;
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
            const templateRow = new TemplateRow();
            m.render(dom, templateRow.render());
            return templateRow;
        },
    };
    shortcuts = listSelectionKeyboardShortcuts(0 /* MultiselectMode.Disabled */, () => this.listModel);
    constructor(groupInstance, entityClient, logins, updateDetailsViewer, focusDetailsViewer) {
        this.groupInstance = groupInstance;
        this.entityClient = entityClient;
        this.logins = logins;
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
                const allEntries = await this.entityClient.loadAll(EmailTemplateTypeRef, this.templateListId());
                return { items: allEntries, complete: true };
            },
            loadSingle: (_listId, elementId) => {
                return this.entityClient.load(EmailTemplateTypeRef, [this.templateListId(), elementId]);
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
                placeholder: lang.get("searchTemplates_placeholder"),
            }), this.userCanEdit()
                ? m(".mr-negative-s", m(IconButton, {
                    title: "addTemplate_label",
                    icon: "Add" /* Icons.Add */,
                    click: () => {
                        showTemplateEditor(null, this.groupInstance.groupRoot);
                    },
                }))
                : null),
        }, this.listModel.isEmptyAndDone()
            ? m(ColumnEmptyMessageBox, {
                color: theme.list_message_bg,
                icon: "ListAlt" /* Icons.ListAlt */,
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
            const { instanceListId, instanceId, operation } = update;
            if (isUpdateForTypeRef(EmailTemplateTypeRef, update) && isSameId(this.templateListId(), instanceListId)) {
                await this.listModel.entityEventReceived(instanceListId, instanceId, operation);
            }
        }
        // we need to make another search in case items have changed
        this.updateQuery(this.searchQuery);
        m.redraw();
    }
    onSelectionChanged = memoized((item) => {
        const detailsViewer = item == null ? null : new TemplateDetailsViewer(item, this.entityClient, () => !this.userCanEdit());
        this.updateDetailsViewer(detailsViewer);
    });
    queryFilter(item) {
        return this.searchQuery === "" ? true : this.resultItemIds.includes(item._id);
    }
    updateQuery(query) {
        this.searchQuery = query;
        this.resultItemIds = searchInTemplates(this.searchQuery, this.listModel.getUnfilteredAsArray()).map((item) => item._id);
        this.listModel.reapplyFilter();
    }
    userCanEdit() {
        return hasCapabilityOnGroup(this.logins.getUserController().user, this.groupInstance.group, "1" /* ShareCapability.Write */);
    }
    templateListId() {
        return this.groupInstance.groupRoot.templates;
    }
}
export class TemplateRow {
    top = 0;
    domElement = null; // set from List
    entity = null;
    selectionUpdater;
    titleDom;
    idDom;
    constructor() { }
    update(template, selected) {
        this.entity = template;
        this.selectionUpdater(selected, false);
        this.titleDom.textContent = template.title;
        this.idDom.textContent = TEMPLATE_SHORTCUT_PREFIX + template.tag;
    }
    render() {
        return m(SelectableRowContainer, {
            onSelectedChangeRef: (updater) => (this.selectionUpdater = updater),
        }, m(".flex.col", [
            m("", [
                m(".text-ellipsis.badge-line-height", {
                    oncreate: (vnode) => (this.titleDom = vnode.dom),
                }),
            ]),
            m(".smaller.mt-xxs", {
                oncreate: (vnode) => (this.idDom = vnode.dom),
            }),
        ]));
    }
}
//# sourceMappingURL=TemplateListView.js.map