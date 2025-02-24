import m from "mithril";
export class Divider {
    view({ attrs }) {
        return m("hr.m-0.border-none.full-width", {
            style: {
                height: "1px",
                backgroundColor: attrs.color,
                color: attrs.color,
                ...attrs.style,
            },
        });
    }
}
//# sourceMappingURL=Divider.js.map