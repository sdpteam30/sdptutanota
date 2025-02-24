import m from "mithril";
import { theme } from "../theme";
import { memoized } from "@tutao/tutanota-utils";
import { assertMainOrNode } from "../../api/common/Env";
import { BootIconsSvg } from "./icons/BootIcons";
import { px, size } from "../size.js";
assertMainOrNode();
export var IconSize;
(function (IconSize) {
    IconSize[IconSize["Normal"] = 0] = "Normal";
    IconSize[IconSize["Medium"] = 1] = "Medium";
    IconSize[IconSize["Large"] = 2] = "Large";
    IconSize[IconSize["XL"] = 3] = "XL";
    IconSize[IconSize["XXL"] = 4] = "XXL";
})(IconSize || (IconSize = {}));
let IconsSvg = {};
import("./icons/Icons.js").then((IconsModule) => {
    IconsSvg = IconsModule.IconsSvg;
});
export class Icon {
    root = null;
    tooltip;
    oncreate(vnode) {
        this.root = vnode.dom;
    }
    view(vnode) {
        // @ts-ignore
        const icon = this.getIcon({ icon: vnode.attrs.icon, parameters: vnode.attrs.svgParameters });
        const containerClasses = this.getContainerClasses(vnode.attrs);
        return m(containerClasses, {
            title: vnode.attrs.title ?? null,
            "aria-hidden": "true",
            class: this.getClass(vnode.attrs),
            style: this.getStyle(vnode.attrs.style ?? null),
            // mithril lets us mute the normal redraw that occurs after
            // event callbacks, but TS doesn't know
            onmouseenter: (e) => {
                if (this.root && this.tooltip) {
                    this.moveElementIfOffscreen(this.root, this.tooltip);
                }
                else {
                    e.redraw = false;
                }
            },
        }, icon ? m.trust(icon) : null, vnode.attrs.hoverText &&
            m("span.tooltiptext.max-width-m.break-word", {
                style: { marginRight: "-100vmax" },
                oncreate: (vnode) => {
                    this.tooltip = vnode.dom;
                },
            }, vnode.attrs.hoverText)); // icon is typed, so we may not embed untrusted data
    }
    moveElementIfOffscreen(root, tooltip) {
        tooltip.style.removeProperty("left");
        const tooltipRect = tooltip.getBoundingClientRect();
        // Get the width of the area in pixels that the tooltip penetrates the viewport
        const distanceOver = tooltipRect.x + tooltipRect.width + size.hpad_large - window.innerWidth;
        if (distanceOver > 0) {
            const parentRect = root.getBoundingClientRect();
            // Chromium based browsers return a different value for tooltipRect
            // Compensate by shifting further to the right
            const chromeShift = 20;
            tooltip.style.left = px(-distanceOver - parentRect.width - chromeShift);
        }
    }
    getIcon = memoized((args) => {
        // @ts-ignore
        let rawIcon = BootIconsSvg[args.icon] ?? IconsSvg[args.icon];
        if (typeof rawIcon !== "string")
            return null;
        for (const parameter in args.parameters) {
            rawIcon = rawIcon.replace(`{${parameter}}`, args.parameters[parameter]);
        }
        return rawIcon;
    });
    getStyle(style) {
        style = style ? style : {};
        if (!style.fill) {
            style.fill = theme.content_accent;
        }
        return style;
    }
    getClass(attrs) {
        let cls = "";
        switch (attrs.size) {
            case IconSize.Medium:
                cls += "icon-large ";
                break;
            case IconSize.Large:
                cls += "icon-medium-large ";
                break;
            case IconSize.XL:
                cls += "icon-xl ";
                break;
            case IconSize.XXL:
                cls += "icon-xxl ";
                break;
            case IconSize.Normal:
            default:
                break;
        }
        if (attrs.class) {
            cls += attrs.class;
        }
        return cls;
    }
    getContainerClasses(attrs) {
        const container = attrs.container || "span";
        let classes = container + ".icon";
        if (attrs.hoverText) {
            classes += ".tooltip";
        }
        return classes;
    }
}
export function progressIcon() {
    return m(Icon, {
        icon: "Progress" /* BootIcons.Progress */,
        class: "icon-large icon-progress",
    });
}
//# sourceMappingURL=Icon.js.map