import m from "mithril";
import { px } from "../size";
import { DefaultAnimationTime } from "../animation/Animations";
import { displayOverlay } from "./Overlay";
import { Button } from "./Button.js";
import { assertMainOrNode } from "../../api/common/Env";
assertMainOrNode();
const notificationQueue = [];
let currentAnimationTimeout = null;
class NotificationOverlay {
    view(vnode) {
        return m(".notification-overlay-content.flex.flex-column.flex-space-between", [
            m(vnode.attrs.message),
            m(".flex.justify-end.flex-wrap", vnode.attrs.buttons.map((b) => m(Button, b))),
        ]);
    }
}
/**
 * @param message What will be shown inside notification
 * @param closeButtonAttrs To define the close button in the notification
 * @param buttons The postpone button is automatically added and does not have to be passed from outside
 */
export function show(message, closeButtonAttrs, buttons) {
    notificationQueue.push({
        message,
        buttons,
        closeButtonAttrs,
    });
    if (notificationQueue.length > 1) {
        // another notification is already visible. Next notification will be shown when closing current notification
        return;
    }
    showNextNotification();
}
function showNextNotification() {
    const { message, buttons, closeButtonAttrs } = notificationQueue[0];
    currentAnimationTimeout = null;
    const width = window.innerWidth;
    const margin = (width - Math.min(400, width)) / 2;
    const allButtons = buttons.slice();
    const overlayRect = {
        width: "fit-content",
        top: px(0),
        left: px(0),
        right: px(0),
    };
    const closeFunction = displayOverlay(() => overlayRect, {
        view: () => m(NotificationOverlay, {
            message,
            buttons: allButtons,
        }),
    }, "slide-top", undefined, "dropdown-shadow center-h notification-min-width");
    const closeAndOpenNext = () => {
        if (currentAnimationTimeout !== null) {
            return;
        }
        closeFunction();
        notificationQueue.shift();
        if (notificationQueue.length > 0) {
            currentAnimationTimeout = setTimeout(showNextNotification, 2 * DefaultAnimationTime);
        }
    };
    // close the notification by default when pressing any button
    for (const b of allButtons) {
        const originClickHandler = b.click;
        b.click = (e, dom) => {
            originClickHandler?.(e, dom);
            closeAndOpenNext();
        };
    }
    // add the postpone button
    const closeFinalAttrs = Object.assign({}, {
        label: "close_alt",
        click: closeAndOpenNext,
        type: "secondary" /* ButtonType.Secondary */,
    }, closeButtonAttrs);
    closeFinalAttrs.click = (e, dom) => {
        closeButtonAttrs.click?.(e, dom);
        closeAndOpenNext();
    };
    allButtons.unshift(closeFinalAttrs);
    m.redraw();
}
//# sourceMappingURL=NotificationOverlay.js.map