import m from "mithril";
export class SourceCodeViewer {
    view(vnode) {
        const { rawHtml } = vnode.attrs;
        return m("p.selectable", rawHtml);
    }
}
//# sourceMappingURL=SourceCodeViewer.js.map