import m from "mithril";
import { assertMainOrNode } from "../../api/common/Env";
import { IconButton } from "./IconButton.js";
assertMainOrNode();
/**
 * An action bar is a bar that contains buttons (either on the left or on the right).
 */
export class ActionBar {
    view(vnode) {
        return m(".action-bar.flex-end.items-center.ml-between-s", vnode.attrs.buttons.map((b) => m(IconButton, b)));
    }
}
//# sourceMappingURL=ActionBar.js.map