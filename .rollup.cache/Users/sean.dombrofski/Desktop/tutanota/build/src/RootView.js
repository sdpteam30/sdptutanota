import m from "mithril";
import { modal } from "./common/gui/base/Modal";
import { overlay } from "./common/gui/base/Overlay";
import { styles } from "./common/gui/styles";
import { assertMainOrNodeBoot, isApp } from "./common/api/common/Env";
import { Keys } from "./common/api/common/TutanotaConstants.js";
import { isKeyPressed } from "./common/misc/KeyManager.js";
assertMainOrNodeBoot();
// global, in case we have multiple instances for some reason
/** What we infer to be the user's preferred navigation type. */
export let currentNavigationType = isApp() ? 1 /* PrimaryNavigationType.Touch */ : 2 /* PrimaryNavigationType.Mouse */;
/**
 * View which wraps anything that we render.
 * It has overlay, modal and the main layers. It also defines some global handlers for better visual indication depending on the interaction.
 */
export class RootView {
    dom = null;
    constructor() {
        // still "old-style" component, we don't want to lose "this" reference
        this.view = this.view.bind(this);
    }
    view(vnode) {
        return m("#root" + (styles.isUsingBottomNavigation() ? ".mobile" : ""), {
            oncreate: (vnode) => {
                this.dom = vnode.dom;
            },
            // use pointer events instead of mousedown/touchdown because mouse events are still fired for touch on mobile
            onpointerup: (e) => {
                if (e.pointerType === "mouse") {
                    this.switchNavType(2 /* PrimaryNavigationType.Mouse */);
                }
                else {
                    // can be "touch" or "pen", treat them the same for now
                    this.switchNavType(1 /* PrimaryNavigationType.Touch */);
                }
                e.redraw = false;
            },
            onkeyup: (e) => {
                // tab key can be pressed in some other situations e.g. editor but it would be switched back quickly again if needed.
                if (isKeyPressed(e.key, Keys.TAB, Keys.UP, Keys.DOWN, Keys.J, Keys.K)) {
                    this.switchNavType(0 /* PrimaryNavigationType.Keyboard */);
                }
                e.redraw = false;
            },
            // See styles for usages of these classes.
            // We basically use them in css combinators as a query for when to show certain interaction indicators.
            class: this.classForType(),
            style: {
                height: "100%",
            },
        }, [m(overlay), m(modal), vnode.children]);
    }
    switchNavType(newType) {
        if (currentNavigationType === newType) {
            return;
        }
        this.dom?.classList.remove(this.classForType());
        currentNavigationType = newType;
        this.dom?.classList.add(this.classForType());
    }
    classForType() {
        switch (currentNavigationType) {
            case 0 /* PrimaryNavigationType.Keyboard */:
                return "keyboard-nav";
            case 2 /* PrimaryNavigationType.Mouse */:
                return "mouse-nav";
            case 1 /* PrimaryNavigationType.Touch */:
                return "touch-nav";
        }
    }
}
export const root = new RootView();
//# sourceMappingURL=RootView.js.map