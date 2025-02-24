import m from "mithril";
export class CounterBadge {
    _hovered = false;
    constructor(vnode) {
        this._hovered = false;
    }
    view(vnode) {
        const { count, position, background, color, showFullCount } = vnode.attrs;
        return count > 0
            ? m(".counter-badge.z2", {
                class: position ? "abs" : "",
                onmouseenter: () => {
                    this._hovered = true;
                },
                onmouseleave: () => {
                    this._hovered = false;
                },
                style: {
                    width: position?.width,
                    top: position?.top,
                    bottom: position?.bottom,
                    right: position?.right,
                    left: position?.left,
                    height: position?.height,
                    "z-index": position?.zIndex,
                    background,
                    color,
                },
            }, count < 99 || this._hovered || showFullCount ? count : "99+")
            : null;
    }
}
//# sourceMappingURL=CounterBadge.js.map