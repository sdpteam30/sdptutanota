import m from "mithril";
export class ListColumnWrapper {
    view(vnode) {
        return m(".flex.flex-column.fill-absolute", [
            vnode.attrs.headerContent ? m(".flex.flex-column.justify-center.plr-safe-inset", vnode.attrs.headerContent) : null,
            m(".rel.flex-grow", vnode.children),
        ]);
    }
}
//# sourceMappingURL=ListColumnWrapper.js.map