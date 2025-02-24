import m from "mithril";
import { assertMainOrNode } from "../../../common/api/common/Env";
import { downcast, isSameTypeRef } from "@tutao/tutanota-utils";
import { MailRow } from "../../mail/view/MailRow";
import { List } from "../../../common/gui/base/List.js";
import { size } from "../../../common/gui/size.js";
import { KindaContactRow } from "../../contacts/view/ContactListView.js";
import { CalendarEventTypeRef, ContactTypeRef } from "../../../common/api/entities/tutanota/TypeRefs.js";
import ColumnEmptyMessageBox from "../../../common/gui/base/ColumnEmptyMessageBox.js";
import { theme } from "../../../common/gui/theme.js";
import { styles } from "../../../common/gui/styles.js";
import { KindaCalendarRow } from "../../../calendar-app/calendar/gui/CalendarRow.js";
assertMainOrNode();
export class SearchResultListEntry {
    entry;
    constructor(entry) {
        this.entry = entry;
    }
    get _id() {
        return this.entry._id;
    }
}
export class SearchListView {
    attrs;
    get listModel() {
        return this.attrs.listModel;
    }
    constructor({ attrs }) {
        this.attrs = attrs;
    }
    view({ attrs }) {
        this.attrs = attrs;
        const { icon, renderConfig } = this.getRenderItems(attrs.currentType);
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
    getRenderItems(type) {
        if (isSameTypeRef(type, ContactTypeRef)) {
            return {
                icon: "Contacts" /* BootIcons.Contacts */,
                renderConfig: this.contactRenderConfig,
            };
        }
        else if (isSameTypeRef(type, CalendarEventTypeRef)) {
            return {
                icon: "Calendar" /* BootIcons.Calendar */,
                renderConfig: this.calendarRenderConfig,
            };
        }
        else {
            return {
                icon: "Mail" /* BootIcons.Mail */,
                renderConfig: this.mailRenderConfig,
            };
        }
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
    mailRenderConfig = {
        itemHeight: size.list_row_height,
        multiselectionAllowed: 1 /* MultiselectMode.Enabled */,
        swipe: null,
        createElement: (dom) => {
            const row = new SearchResultListRow(new MailRow(true, (mail) => this.attrs.getLabelsForMail(mail), () => row.entity && this.listModel.onSingleExclusiveSelection(row.entity)));
            m.render(dom, row.render());
            return row;
        },
    };
    contactRenderConfig = {
        itemHeight: size.list_row_height,
        multiselectionAllowed: 1 /* MultiselectMode.Enabled */,
        swipe: null,
        createElement: (dom) => {
            const row = new SearchResultListRow(new KindaContactRow(dom, () => row.entity && this.listModel.onSingleExclusiveSelection(row.entity)));
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
//# sourceMappingURL=SearchListView.js.map