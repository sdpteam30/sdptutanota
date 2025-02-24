import m from "mithril";
import { assertMainOrNode } from "../../../../common/api/common/Env";
import { downcast } from "@tutao/tutanota-utils";
import { List } from "../../../../common/gui/base/List.js";
import { size } from "../../../../common/gui/size.js";
import ColumnEmptyMessageBox from "../../../../common/gui/base/ColumnEmptyMessageBox.js";
import { theme } from "../../../../common/gui/theme.js";
import { styles } from "../../../../common/gui/styles.js";
import { KindaCalendarRow } from "../../gui/CalendarRow.js";
assertMainOrNode();
export class CalendarSearchResultListEntry {
    entry;
    constructor(entry) {
        this.entry = entry;
    }
    get _id() {
        return this.entry._id;
    }
}
export class CalendarSearchListView {
    listModel;
    constructor({ attrs }) {
        this.listModel = attrs.listModel;
    }
    view({ attrs }) {
        this.listModel = attrs.listModel;
        const icon = "Calendar" /* BootIcons.Calendar */;
        const renderConfig = this.calendarRenderConfig;
        return attrs.listModel.isEmptyAndDone()
            ? m(ColumnEmptyMessageBox, {
                icon,
                message: "searchNoResults_msg",
                color: theme.list_message_bg,
            })
            : m(List, {
                state: attrs.listModel.state,
                renderConfig,
                onLoadMore: () => {
                    attrs.listModel?.loadMore();
                },
                onRetryLoading: () => {
                    attrs.listModel?.retryLoading();
                },
                onSingleSelection: (item) => {
                    attrs.listModel?.onSingleSelection(item);
                    attrs.onSingleSelection(item);
                },
                onSingleTogglingMultiselection: (item) => {
                    attrs.listModel.onSingleInclusiveSelection(item, styles.isSingleColumnLayout());
                },
                onRangeSelectionTowards: (item) => {
                    attrs.listModel.selectRangeTowards(item);
                },
                onStopLoading() {
                    if (attrs.cancelCallback != null) {
                        attrs.cancelCallback();
                    }
                    attrs.listModel.stopLoading();
                },
            });
    }
    calendarRenderConfig = {
        itemHeight: size.list_row_height,
        multiselectionAllowed: 0 /* MultiselectMode.Disabled */,
        swipe: null,
        createElement: (dom) => {
            const row = new SearchResultListRow(new KindaCalendarRow(dom));
            m.render(dom, row.render());
            return row;
        },
    };
}
export class SearchResultListRow {
    top;
    // set from List
    domElement = null;
    // this is our own entry which we need for some reason (probably easier to deal with than a lot of sum type entries)
    _entity = null;
    get entity() {
        return this._entity;
    }
    _delegate;
    constructor(delegate) {
        this._delegate = delegate;
        this.top = 0;
    }
    update(entry, selected, isInMultiSelect) {
        this._delegate.domElement = this.domElement;
        this._entity = entry;
        this._delegate.update(downcast(entry.entry), selected, isInMultiSelect);
    }
    render() {
        return this._delegate.render();
    }
}
//# sourceMappingURL=CalendarSearchListView.js.map