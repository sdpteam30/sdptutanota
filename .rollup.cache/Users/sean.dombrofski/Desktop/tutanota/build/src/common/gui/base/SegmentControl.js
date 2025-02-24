import m from "mithril";
import { px } from "../size";
export class SegmentControl {
    view(vnode) {
        const { shouldApplyCyberMonday, selectedValue, items, itemMaxWidth } = vnode.attrs;
        return [
            m(".segmentControl.flex.center-horizontally.button-height", {
                role: "tablist",
                class: vnode.attrs.class,
            }, items.map((item) => m("button.segmentControlItem.flex.center-horizontally.center-vertically.text-ellipsis.small" +
                (item.value === selectedValue
                    ? `.segmentControl-border-active${shouldApplyCyberMonday ? "-cyber-monday" : ""}.content-accent-fg${shouldApplyCyberMonday ? "-cyber-monday" : ""}`
                    : ".segmentControl-border"), {
                style: {
                    flex: "0 1 " + (typeof itemMaxWidth !== "undefined" ? px(itemMaxWidth) : px(120)),
                },
                title: item.name,
                role: "tab",
                "aria-selected": String(item.value === selectedValue),
                onclick: () => this._onSelected(item, vnode.attrs),
            }, item.name))),
        ];
    }
    _onSelected(item, attrs) {
        if (item.value !== attrs.selectedValue) {
            attrs.onValueSelected(item.value);
        }
    }
}
//# sourceMappingURL=SegmentControl.js.map