import m from "mithril";
import { DialogHeaderBar } from "./DialogHeaderBar";
import { px } from "../size";
import { resolveMaybeLazy } from "@tutao/tutanota-utils";
/**
 * injects additional content on the right of a dialog
 */
export class DialogInjectionRight {
    view({ attrs }) {
        const { component, componentAttrs } = attrs;
        if (attrs.visible()) {
            return m(".flex-grow-shrink-auto.flex-transition.ml-s.rel.dialog.dialog-width-m.elevated-bg.dropdown-shadow.border-radius", [
                m(DialogHeaderBar, resolveMaybeLazy(attrs.headerAttrs)),
                m(".dialog-container.scroll.plr-l", m(component, componentAttrs)),
            ]);
        }
        else {
            return m(".flex-hide.flex-transition.rel", {
                style: {
                    maxWidth: px(0),
                },
            });
        }
    }
}
//# sourceMappingURL=DialogInjectionRight.js.map