import { lang } from "../misc/LanguageViewModel.js";
import { ExpanderButton, ExpanderPanel } from "../gui/base/Expander.js";
import m from "mithril";
/**
 * Lists notification device targets
 */
export class NotificationTargetsList {
    view(vnode) {
        return m("", [
            m(".flex-space-between.items-center.mt-s.mb-s", [
                m(".h5", lang.get("notificationTargets_label")),
                m(ExpanderButton, {
                    label: "show_action",
                    expanded: vnode.attrs.onExpandedChange(),
                    onExpandedChange: vnode.attrs.onExpandedChange,
                }),
            ]),
            m(ExpanderPanel, {
                expanded: vnode.attrs.onExpandedChange(),
            }, m(".flex.flex-column.items-end.mb", [vnode.attrs.rowAdd, ...vnode.attrs.rows])),
            m(".small", lang.get("pushIdentifierInfoMessage_msg")),
        ]);
    }
}
//# sourceMappingURL=NotificationTargetsList.js.map