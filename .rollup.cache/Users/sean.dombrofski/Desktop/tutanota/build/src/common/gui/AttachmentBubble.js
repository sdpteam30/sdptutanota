import m from "mithril";
import { Button } from "./base/Button.js";
import { formatStorageSize } from "../misc/Formatter.js";
import { defer, noOp } from "@tutao/tutanota-utils";
import { modal } from "./base/Modal.js";
import { focusNext, focusPrevious } from "../misc/KeyManager.js";
import { Keys } from "../api/common/TutanotaConstants.js";
import { px } from "./size.js";
import { Icon } from "./base/Icon.js";
import { theme } from "./theme.js";
import { animations, height, opacity, transform, width } from "./animation/Animations.js";
import { ease } from "./animation/Easing.js";
import { getFileBaseName, getFileExtension, isTutanotaFile } from "../api/common/utils/FileUtils.js";
import { getSafeAreaInsetBottom } from "./HtmlUtils.js";
import { hasError } from "../api/common/utils/ErrorUtils.js";
import { BubbleButton, bubbleButtonHeight, bubbleButtonPadding } from "./base/buttons/BubbleButton.js";
import { CALENDAR_MIME_TYPE, MAIL_MIME_TYPES, VCARD_MIME_TYPES } from "../file/FileController.js";
import { lang } from "../misc/LanguageViewModel.js";
export var AttachmentType;
(function (AttachmentType) {
    AttachmentType[AttachmentType["GENERIC"] = 0] = "GENERIC";
    AttachmentType[AttachmentType["CONTACT"] = 1] = "CONTACT";
    AttachmentType[AttachmentType["CALENDAR"] = 2] = "CALENDAR";
    AttachmentType[AttachmentType["MAIL"] = 3] = "MAIL";
})(AttachmentType || (AttachmentType = {}));
export class AttachmentBubble {
    dom = null;
    view(vnode) {
        const { attachment } = vnode.attrs;
        if (isTutanotaFile(attachment) && hasError(attachment)) {
            return m(BubbleButton, {
                label: "emptyString_msg",
                text: "corrupted_msg",
                icon: "Warning" /* Icons.Warning */,
                onclick: noOp,
            });
        }
        else {
            const extension = getFileExtension(attachment.name);
            const rest = getFileBaseName(attachment.name);
            return m(BubbleButton, {
                label: lang.makeTranslation("attachment_name", attachment.name),
                text: lang.makeTranslation("attachment_base_name", rest),
                icon: getAttachmentIcon(vnode.attrs.type),
                onclick: () => {
                    showAttachmentDetailsPopup(this.dom, vnode.attrs).then(() => this.dom?.focus());
                },
            }, `${extension}, ${formatStorageSize(Number(attachment.size))}`);
        }
    }
    oncreate(vnode) {
        this.dom = vnode.dom;
    }
}
async function showAttachmentDetailsPopup(dom, attrs) {
    const parentRect = dom.getBoundingClientRect();
    const panel = new AttachmentDetailsPopup(parentRect, parentRect.width, attrs);
    panel.show();
    return panel.deferAfterClose;
}
function getAttachmentIcon(type) {
    switch (type) {
        case AttachmentType.CONTACT:
            return "People" /* Icons.People */;
        case AttachmentType.CALENDAR:
            return "Calendar" /* BootIcons.Calendar */;
        default:
            return "Attachment" /* Icons.Attachment */;
    }
}
export function getAttachmentType(mimeType) {
    if (Object.values(VCARD_MIME_TYPES).includes(mimeType)) {
        return AttachmentType.CONTACT;
    }
    else if (mimeType === CALENDAR_MIME_TYPE) {
        return AttachmentType.CALENDAR;
    }
    else if (Object.values(MAIL_MIME_TYPES).includes(mimeType)) {
        return AttachmentType.MAIL;
    }
    return AttachmentType.GENERIC;
}
export class AttachmentDetailsPopup {
    targetRect;
    targetWidth;
    attrs;
    _shortcuts = [];
    domContent = null;
    domPanel = null;
    closeDefer = defer();
    focusedBeforeShown = null;
    get deferAfterClose() {
        return this.closeDefer.promise;
    }
    constructor(targetRect, targetWidth, attrs) {
        this.targetRect = targetRect;
        this.targetWidth = targetWidth;
        this.attrs = attrs;
        this._shortcuts.push({
            key: Keys.ESC,
            exec: () => this.onClose(),
            help: "close_alt",
        });
        this._shortcuts.push({
            key: Keys.TAB,
            shift: true,
            exec: () => (this.domContent ? focusPrevious(this.domContent) : false),
            help: "selectPrevious_action",
        });
        this._shortcuts.push({
            key: Keys.TAB,
            shift: false,
            exec: () => (this.domContent ? focusNext(this.domContent) : false),
            help: "selectNext_action",
        });
        if (attrs.open) {
            this._shortcuts.push({
                key: Keys.O,
                exec: () => this.thenClose(attrs.open),
                help: "open_action",
            });
        }
        if (attrs.download) {
            this._shortcuts.push({
                key: Keys.D,
                exec: () => this.thenClose(attrs.download),
                help: "download_action",
            });
        }
        if (attrs.remove) {
            this._shortcuts.push({
                key: Keys.DELETE,
                exec: () => this.thenClose(attrs.remove),
                help: "remove_action",
            });
        }
        if (attrs.fileImport) {
            this._shortcuts.push({
                key: Keys.I,
                exec: () => this.thenClose(attrs.fileImport),
                help: "import_action",
            });
        }
        this.view = this.view.bind(this);
    }
    view() {
        return m(".abs.bubble-color.border-radius.overflow-hidden.flex.flex-column", {
            class: bubbleButtonPadding(),
            style: {
                width: px(this.targetWidth),
                // see hack description below. if #5587 persists, we might try visibility: hidden instead?
                opacity: "0",
            },
            oncreate: (vnode) => {
                this.domPanel = vnode.dom;
                // This is a hack to get "natural" view size but render it invisibly first and then show the panel with inferred size.
                // also focus the first tabbable element in the content after the panel opens.
                deferToNextFrame(() => this.animatePanel().then(() => this.domContent && focusNext(this.domContent)));
            },
            onclick: () => this.onClose(),
        }, this.renderContent());
    }
    renderContent() {
        // We are trying to make some contents look like the attachment button to make the transition look smooth.
        // It is somewhat harder as it looks different with mobile layout.
        const { remove, open, download, attachment, fileImport, type } = this.attrs;
        return m(".flex.mb-s.pr", {
            oncreate: (vnode) => (this.domContent = vnode.dom),
        }, [
            m(Icon, {
                icon: getAttachmentIcon(type),
                class: "pr-s flex items-center",
                style: {
                    fill: theme.button_bubble_fg,
                    "background-color": "initial",
                    minHeight: px(bubbleButtonHeight()),
                },
            }),
            //  flex-grow to cover the bubble in case it's bigger than our content
            m(".flex.col.flex-grow", {
                style: {
                    minHeight: px(bubbleButtonHeight()),
                    // set line-height to position the text like in the button
                    lineHeight: px(bubbleButtonHeight()),
                },
            }, m(".span.break-all.smaller", attachment.name), 
            // bottom info is inside the same column as file text to align them
            m(".flex.row.justify-between.items-center", [
                m("span.smaller", `${formatStorageSize(Number(attachment.size))}`),
                m(".flex.no-wrap", [
                    remove ? m(Button, { type: "secondary" /* ButtonType.Secondary */, label: "remove_action", click: () => this.thenClose(remove) }) : null,
                    fileImport
                        ? m(Button, {
                            type: "secondary" /* ButtonType.Secondary */,
                            label: "import_action",
                            click: () => this.thenClose(fileImport),
                        })
                        : null,
                    open ? m(Button, { type: "secondary" /* ButtonType.Secondary */, label: "open_action", click: () => this.thenClose(open) }) : null,
                    download ? m(Button, { type: "secondary" /* ButtonType.Secondary */, label: "download_action", click: () => this.thenClose(download) }) : null,
                ]),
            ])),
        ]);
    }
    thenClose(action) {
        action?.();
        this.onClose();
    }
    async animatePanel() {
        const { targetRect, domPanel, domContent } = this;
        if (domPanel == null || domContent == null)
            return;
        const initialHeight = bubbleButtonHeight();
        // there is a possibility that we get 0 here in some circumstances, but it's unclear when.
        // might have something to do with the opacity: 0 hack above or because the original 24ms
        // delay was not enough. https://github.com/tutao/tutanota/issues/5587
        // 85 is a value that fits for a single line of attachment name, but looks weird for more while
        // keeping the buttons accessible.
        // if the reports continue, we can ask for logs.
        const targetHeight = domContent.offsetHeight === 0 ? 85 : domContent.offsetHeight;
        if (domContent.offsetHeight === 0) {
            console.log("got offsetHeight 0, panel contains content:", domPanel.contains(domContent), "content style:", domContent.style, "panel style:", domPanel.style);
        }
        // for very short attachment bubbles, we need to set a min width so the buttons fit.
        const targetWidth = Math.max(targetRect.width, 300);
        domPanel.style.width = px(targetRect.width);
        domPanel.style.height = px(initialHeight);
        // add half the difference between .button height of 44px and 30px for pixel-perfect positioning
        domPanel.style.top = px(targetRect.top);
        //Verify if the attachment bubble is going to overflow the screen
        //if yes, invert the side of the margin and discount the bubble width
        if (targetRect.left + targetWidth > window.innerWidth) {
            domPanel.style.right = px(24);
        }
        else {
            domPanel.style.left = px(targetRect.left);
        }
        const mutations = [opacity(0, 1, true), height(initialHeight, targetHeight)];
        if (targetRect.width !== targetWidth) {
            mutations.push(width(targetRect.width, targetWidth));
        }
        // space below the panel after it fully extends minus a bit.
        const spaceBelow = window.innerHeight - getSafeAreaInsetBottom() - targetRect.top - targetHeight - initialHeight;
        if (spaceBelow < 0) {
            mutations.push(transform("translateY" /* TransformEnum.TranslateY */, 0, spaceBelow));
        }
        await animations.add(domPanel, mutations, {
            easing: ease.out,
        });
    }
    show() {
        this.focusedBeforeShown = document.activeElement;
        modal.displayUnique(this, true);
    }
    backgroundClick(e) {
        modal.remove(this);
    }
    async hideAnimation() {
        if (this.domPanel == null)
            return;
        const startHeight = this.domPanel.offsetHeight;
        const startWidth = this.domPanel.offsetWidth;
        await animations.add(this.domPanel, [height(startHeight, 30), width(startWidth, this.targetWidth), opacity(1, 0, false)], {
            easing: ease.out,
        });
    }
    onClose() {
        modal.remove(this);
        this.closeDefer.resolve();
    }
    shortcuts() {
        return this._shortcuts;
    }
    popState(e) {
        modal.remove(this);
        return false;
    }
    callingElement() {
        return this.focusedBeforeShown;
    }
}
/** try and execute stuff after the next rendering frame */
const deferToNextFrame = (fn) => {
    window.requestAnimationFrame(() => {
        window.requestAnimationFrame(fn);
    });
};
//# sourceMappingURL=AttachmentBubble.js.map