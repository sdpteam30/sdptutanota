import m from "mithril";
export class RecipientButton {
    view({ attrs }) {
        return m("button.mr-button.content-accent-fg.print.small", {
            style: Object.assign({
                "white-space": "normal",
                "word-break": "break-all",
            }, attrs.style),
            onclick: (e) => attrs.click(e, e.target),
        }, [attrs.label]);
    }
}
//# sourceMappingURL=RecipientButton.js.map