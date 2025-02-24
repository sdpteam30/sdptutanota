import m from "mithril";
export default class Badge {
    view(vnode) {
        return m(".b.teamLabel.pl-s.pr-s.border-radius.no-wrap" + (vnode.attrs.classes || ""), vnode.children);
    }
}
//# sourceMappingURL=Badge.js.map