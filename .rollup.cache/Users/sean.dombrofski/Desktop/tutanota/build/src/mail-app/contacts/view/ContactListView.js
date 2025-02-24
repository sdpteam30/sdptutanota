import m from "mithril";
import { size } from "../../../common/gui/size";
import { ListColumnWrapper } from "../../../common/gui/ListColumnWrapper";
import { assertMainOrNode } from "../../../common/api/common/Env";
import { List } from "../../../common/gui/base/List.js";
import { ContactRow } from "./ContactRow.js";
import ColumnEmptyMessageBox from "../../../common/gui/base/ColumnEmptyMessageBox.js";
import { theme } from "../../../common/gui/theme.js";
import { styles } from "../../../common/gui/styles.js";
import { shouldAlwaysShowMultiselectCheckbox } from "../../../common/gui/SelectableRowContainer.js";
assertMainOrNode();
export class ContactListView {
    contactViewModel = null;
    view({ attrs: { contactViewModel, onSingleSelection } }) {
        this.contactViewModel = contactViewModel;
        return m(ListColumnWrapper, {
            headerContent: null,
        }, contactViewModel.listModel.isEmptyAndDone()
            ? m(ColumnEmptyMessageBox, {
                color: theme.list_message_bg,
                message: "noContacts_msg",
                icon: "Contacts" /* BootIcons.Contacts */,
            })
            : m(List, {
                renderConfig: this.renderConfig,
                state: contactViewModel.listState(),
                // should not be called anyway
                onLoadMore: () => { },
                onRetryLoading: () => {
                    contactViewModel.listModel.retryLoading();
                },
                onSingleSelection: (item) => {
                    contactViewModel.listModel.onSingleSelection(item);
                    onSingleSelection();
                },
                onSingleTogglingMultiselection: (item) => {
                    contactViewModel.listModel.onSingleInclusiveSelection(item, styles.isSingleColumnLayout());
                },
                onRangeSelectionTowards: (item) => {
                    contactViewModel.listModel.selectRangeTowards(item);
                },
                onStopLoading() {
                    contactViewModel.listModel.stopLoading();
                },
            }));
    }
    renderConfig = {
        itemHeight: size.list_row_height,
        multiselectionAllowed: 1 /* MultiselectMode.Enabled */,
        swipe: null,
        createElement: (dom) => {
            return new KindaContactRow(dom, (item) => this.contactViewModel?.listModel.onSingleExclusiveSelection(item));
        },
    };
}
export class KindaContactRow {
    cr;
    domElement;
    entity = null;
    constructor(dom, onToggleSelection, shouldShowCheckbox = () => shouldAlwaysShowMultiselectCheckbox()) {
        this.cr = new ContactRow(onToggleSelection, shouldShowCheckbox);
        this.domElement = dom;
        m.render(dom, this.cr.render());
    }
    update(item, selected, multiselect) {
        this.entity = item;
        this.cr.update(item, selected, multiselect);
    }
    render() {
        return this.cr.render();
    }
}
//# sourceMappingURL=ContactListView.js.map