import m from "mithril";
import { landmarkAttrs } from "../AriaUtils.js";
import { px, size, size as sizes } from "../size.js";
import { theme } from "../theme.js";
/**
 * Base layout for the header in desktop layout.
 */
export class DesktopBaseHeader {
    view(vnode) {
        return m(".header-nav.flex.items-center.rel", [this.renderLogo(), vnode.children]);
    }
    renderLogo() {
        return m(".logo-height", {
            ...landmarkAttrs("banner" /* AriaLandmarks.Banner */, "Tuta logo"),
            style: {
                "margin-left": px(sizes.drawer_menu_width + size.hpad + size.hpad_button),
            },
        }, m.trust(theme.logo));
    }
}
//# sourceMappingURL=DesktopBaseHeader.js.map