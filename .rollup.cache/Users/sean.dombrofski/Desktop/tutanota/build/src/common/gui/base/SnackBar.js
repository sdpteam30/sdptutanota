import m from "mithril";
import { px, size } from "../size";
import { DefaultAnimationTime } from "../animation/Animations";
import { displayOverlay } from "./Overlay";
import { Button } from "./Button.js";
import { lang } from "../../misc/LanguageViewModel";
import { styles } from "../styles";
import { assertMainOrNode } from "../../api/common/Env";
import { debounce } from "@tutao/tutanota-utils";
assertMainOrNode();
export const SNACKBAR_SHOW_TIME = 6000;
const MAX_SNACKBAR_WIDTH = 400;
const notificationQueue = [];
let currentAnimationTimeout = null;
class SnackBar {
    view(vnode) {
        // use same padding as MinimizedEditor
        return m(".snackbar-content.flex.flex-space-between.border-radius.plr.pb-xs.pt-xs", [
            m(".flex.center-vertically.smaller", lang.getTranslationText(vnode.attrs.message)),
            vnode.attrs.button ? m(".flex-end.center-vertically.pl", m(Button, vnode.attrs.button)) : null,
        ]);
    }
}
function makeButtonAttrsForSnackBar(button) {
    return {
        label: button.label,
        click: button.click,
        type: "secondary" /* ButtonType.Secondary */,
    };
}
/**
 * Shows a SnackBar overlay at the bottom for low priority notifications that do not require (but might allow) user interaction and disappear after 6 seconds.
 * @param message The message to be shown. It must be short enough to ensure it is always shown in 2 lines of text at max in any language.
 * @param snackBarButton will close the snackbar if it is clicked (onClose() will be called)
 * @param onClose called when the snackbar is closed (either by timeout or button click)
 * @param waitingTime number of milliseconds to wait before showing the snackbar
 */
export async function showSnackBar(args) {
    const { message, button, onClose, waitingTime } = args;
    const triggerSnackbar = () => {
        const buttonAttrs = makeButtonAttrsForSnackBar(button);
        notificationQueue.push({
            message: message,
            button: buttonAttrs,
            onClose: onClose ?? null,
        });
        if (notificationQueue.length > 1) {
            //Next notification will be shown when closing current notification
            return;
        }
        showNextNotification();
    };
    if (waitingTime) {
        debounce(waitingTime, triggerSnackbar)();
        return;
    }
    else {
        triggerSnackbar();
    }
}
function getSnackBarPosition() {
    // The snackbar will be moved up from off the bottom of the viewport by the transformation animation.
    const snackBarMargin = styles.isUsingBottomNavigation() ? size.hpad : size.hpad_medium;
    const leftOffset = styles.isDesktopLayout() ? size.drawer_menu_width : 0;
    const snackBarWidth = Math.min(window.innerWidth - leftOffset - 2 * snackBarMargin, MAX_SNACKBAR_WIDTH);
    return {
        bottom: px(snackBarMargin),
        // The SnackBar is only shown at the right in single column layout
        left: styles.isSingleColumnLayout() ? px(window.innerWidth - snackBarMargin - snackBarWidth) : px(leftOffset + snackBarMargin),
        width: px(snackBarWidth),
        zIndex: 400 /* LayerType.Overlay */,
    };
}
function showNextNotification() {
    const { message, button, onClose } = notificationQueue[0]; //we shift later because it is still shown
    currentAnimationTimeout = null;
    const closeFunction = displayOverlay(() => getSnackBarPosition(), {
        view: () => m(SnackBar, {
            message,
            button,
        }),
    }, "slide-bottom", undefined, "minimized-shadow");
    const closeAndOpenNext = () => {
        if (currentAnimationTimeout !== null) {
            return;
        }
        closeFunction();
        if (onClose) {
            onClose();
        }
        notificationQueue.shift();
        if (notificationQueue.length > 0) {
            currentAnimationTimeout = setTimeout(showNextNotification, 2 * DefaultAnimationTime);
        }
    };
    // close the notification by default when pressing the button
    if (button) {
        const originClickHandler = button.click;
        button.click = (e, dom) => {
            clearTimeout(autoRemoveTimer);
            originClickHandler?.(e, dom);
            closeAndOpenNext();
        };
    }
    const autoRemoveTimer = setTimeout(closeAndOpenNext, SNACKBAR_SHOW_TIME);
    m.redraw();
}
//# sourceMappingURL=SnackBar.js.map