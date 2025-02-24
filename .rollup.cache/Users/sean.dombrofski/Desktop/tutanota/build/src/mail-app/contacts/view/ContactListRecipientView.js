import m from "mithril";
import { assertMainOrNode } from "../../../common/api/common/Env.js";
import { ListColumnWrapper } from "../../../common/gui/ListColumnWrapper.js";
import ColumnEmptyMessageBox from "../../../common/gui/base/ColumnEmptyMessageBox.js";
import { theme } from "../../../common/gui/theme.js";
import { List } from "../../../common/gui/base/List.js";
import { noOp } from "@tutao/tutanota-utils";
import { checkboxOpacity, scaleXHide, scaleXShow, selectableRowAnimParams, SelectableRowContainer, shouldAlwaysShowMultiselectCheckbox, } from "../../../common/gui/SelectableRowContainer.js";
import { px, size } from "../../../common/gui/size.js";
import { shiftByForCheckbox, translateXHide, translateXShow } from "./ContactRow.js";
import { styles } from "../../../common/gui/styles.js";
assertMainOrNode();
export class ContactListRecipientView {
    viewModel = null;
    view({ attrs: { viewModel, focusDetailsViewer } }) {
        this.viewModel = viewModel;
        const listModel = this.viewModel.listModel;
        return m(ListColumnWrapper, {
            headerContent: null,
        }, listModel == null || listModel.isEmptyAndDone()
            ? m(ColumnEmptyMessageBox, {
                color: theme.list_message_bg,
                message: "noEntries_msg",
                icon: "People" /* Icons.People */,
            })
            : m(List, {
                renderConfig: this.renderConfig,
                state: listModel.state,
                onLoadMore: () => listModel.loadMore(),
                onRetryLoading: () => listModel.retryLoading(),
                onStopLoading: () => listModel.stopLoading(),
                onSingleSelection: (item) => {
                    listModel.onSingleSelection(item);
                    focusDetailsViewer();
                },
                onSingleTogglingMultiselection: (item) => {
                    listModel.onSingleInclusiveSelection(item, styles.isSingleColumnLayout());
                },
                onRangeSelectionTowards: (item) => {
                    listModel.selectRangeTowards(item);
                },
            }));
    }
    renderConfig = {
        itemHeight: size.list_row_height,
        multiselectionAllowed: 1 /* MultiselectMode.Enabled */,
        swipe: null,
        createElement: (dom) => {
            const recipientEntryRow = new RecipientRow((entity) => this.viewModel?.listModel?.onSingleExclusiveSelection(entity));
            m.render(dom, recipientEntryRow.render());
            return recipientEntryRow;
        },
    };
}
export class RecipientRow {
    onSelected;
    top = 0;
    domElement = null; // set from List
    checkboxDom;
    checkboxWasVisible = shouldAlwaysShowMultiselectCheckbox();
    entity = null;
    selectionUpdater;
    titleDom;
    idDom;
    constructor(onSelected) {
        this.onSelected = onSelected;
    }
    update(entry, selected, isInMultiSelect) {
        this.entity = entry;
        this.selectionUpdater(selected, false);
        this.showCheckboxAnimated(shouldAlwaysShowMultiselectCheckbox() || isInMultiSelect);
        checkboxOpacity(this.checkboxDom, selected);
        this.checkboxDom.checked = selected && isInMultiSelect;
        this.titleDom.textContent = entry.emailAddress;
    }
    showCheckboxAnimated(show) {
        if (this.checkboxWasVisible === show)
            return;
        if (show) {
            this.titleDom.style.paddingRight = shiftByForCheckbox;
            const addressAnim = this.titleDom.animate({ transform: [translateXHide, translateXShow] }, selectableRowAnimParams);
            const checkboxAnim = this.checkboxDom.animate({ transform: [scaleXHide, scaleXShow] }, selectableRowAnimParams);
            Promise.all([addressAnim.finished, checkboxAnim.finished]).then(() => {
                addressAnim.cancel();
                checkboxAnim.cancel();
                this.showCheckbox(show);
            }, noOp);
        }
        else {
            this.titleDom.style.paddingRight = "0";
            const addressAnim = this.titleDom.animate({ transform: [translateXShow, translateXHide] }, selectableRowAnimParams);
            const checkboxAnim = this.checkboxDom.animate({ transform: [scaleXShow, scaleXHide] }, selectableRowAnimParams);
            Promise.all([addressAnim.finished, checkboxAnim.finished]).then(() => {
                addressAnim.cancel();
                checkboxAnim.cancel();
                this.showCheckbox(show);
            }, noOp);
        }
        this.checkboxWasVisible = show;
    }
    render() {
        return m(SelectableRowContainer, {
            oncreate: (vnode) => {
                Promise.resolve().then(() => this.showCheckbox(shouldAlwaysShowMultiselectCheckbox()));
            },
            onSelectedChangeRef: (updater) => (this.selectionUpdater = updater),
        }, m(".mt-xs.abs", [
            m(".text-ellipsis.smaller.mt-xxs", {
                style: {
                    height: px(9),
                },
            }),
            m("input.checkbox.list-checkbox", {
                type: "checkbox",
                style: {
                    transformOrigin: "left",
                },
                onclick: (e) => {
                    e.stopPropagation();
                },
                onchange: () => {
                    if (this.entity)
                        this.onSelected(this.entity, this.checkboxDom.checked);
                },
                oncreate: (vnode) => {
                    this.checkboxDom = vnode.dom;
                    checkboxOpacity(this.checkboxDom, false);
                },
            }),
            m(".text-ellipsis.smaller.mt-xxs", {
                style: {
                    height: px(9),
                },
            }),
        ]), m(".flex.col.overflow-hidden.flex-grow", [
            m("", [
                m(".text-ellipsis.smaller.mt-xxs", {
                    style: {
                        height: px(9),
                    },
                }),
                m(".text-ellipsis.badge-line-height", {
                    oncreate: (vnode) => (this.titleDom = vnode.dom),
                }),
                m(".text-ellipsis.smaller.mt-xxs", {
                    style: {
                        height: px(9),
                    },
                }),
            ]),
        ]));
    }
    showCheckbox(show) {
        let translate;
        let scale;
        let padding;
        if (show) {
            translate = translateXShow;
            scale = scaleXShow;
            padding = shiftByForCheckbox;
        }
        else {
            translate = translateXHide;
            scale = scaleXHide;
            padding = "0";
        }
        this.titleDom.style.transform = translate;
        this.titleDom.style.paddingRight = padding;
        this.checkboxDom.style.transform = scale;
        // Stop the hidden checkbox from entering the tab index
        this.checkboxDom.style.display = show ? "" : "none";
    }
}
//# sourceMappingURL=ContactListRecipientView.js.map