import m from "mithril";
import { landmarkAttrs } from "../AriaUtils";
import { assertMainOrNode } from "../../api/common/Env";
assertMainOrNode();
export class NavBar {
    view({ children }) {
        return m("nav.nav-bar.flex-end", landmarkAttrs("navigation" /* AriaLandmarks.Navigation */, "top"), children.map((child) => m(".plr-nav-button", child)));
    }
}
//# sourceMappingURL=NavBar.js.map