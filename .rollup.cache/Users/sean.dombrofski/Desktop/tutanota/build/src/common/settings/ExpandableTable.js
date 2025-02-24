import m from "mithril";
import stream from "mithril/stream";
import { Table } from "../gui/base/Table.js";
import { SettingsExpander } from "./SettingsExpander.js";
export class ExpandableTable {
    expanded;
    constructor() {
        this.expanded = stream(false);
    }
    view(vnode) {
        const { title, table, infoLinkId, infoMsg, expanded, onExpand } = vnode.attrs;
        return m(SettingsExpander, {
            title,
            infoLinkId,
            infoMsg,
            onExpand,
            expanded: expanded || this.expanded,
        }, m(Table, table));
    }
}
//# sourceMappingURL=ExpandableTable.js.map