import m from "mithril";
import { IconButton } from "./base/IconButton.js";
/** Toolbar with optional delete & edit actions at the bottom of single-column layout. */
export class MobileActionBar {
    view(vnode) {
        const { attrs } = vnode;
        return m(".bottom-nav.bottom-action-bar.flex.items-center.plr-l", {
            style: {
                justifyContent: "space-around",
            },
        }, attrs.actions.map((action) => m(IconButton, {
            title: action.title,
            icon: action.icon,
            click: action.action,
        })));
    }
}
//# sourceMappingURL=MobileActionBar.js.map