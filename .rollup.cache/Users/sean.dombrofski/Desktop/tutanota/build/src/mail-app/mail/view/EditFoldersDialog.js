import { modal } from "../../../common/gui/base/Modal.js";
import { assertNotNull, noOp } from "@tutao/tutanota-utils";
import { focusNext, focusPrevious, keyManager } from "../../../common/misc/KeyManager.js";
import { Keys } from "../../../common/api/common/TutanotaConstants.js";
import m from "mithril";
import { alpha, animations, DefaultAnimationTime, opacity } from "../../../common/gui/animation/Animations.js";
import { getElevatedBackground, theme } from "../../../common/gui/theme.js";
import { INPUT } from "../../../common/gui/base/Dialog.js";
import { ease } from "../../../common/gui/animation/Easing.js";
import { px, size } from "../../../common/gui/size.js";
import { styles } from "../../../common/gui/styles.js";
import { LoginButton } from "../../../common/gui/base/buttons/LoginButton.js";
export class EditFoldersDialog {
    folderList;
    visible;
    _shortcuts;
    _domDialog = null;
    /** The element that was focused before we've shown the component so that we can return it back upon closing. */
    focusedBeforeShown = null;
    _closeHandler = null;
    usedBottomNavBefore = styles.isUsingBottomNavigation();
    constructor(folderList) {
        this.folderList = folderList;
        this.visible = false;
        this._shortcuts = [
            {
                key: Keys.RETURN,
                shift: false,
                exec: () => this.close(),
                help: "close_alt",
            },
            {
                key: Keys.ESC,
                shift: false,
                exec: () => this.close(),
                help: "close_alt",
            },
            {
                key: Keys.TAB,
                shift: true,
                exec: () => (this._domDialog ? focusPrevious(this._domDialog) : false),
                help: "selectPrevious_action",
            },
            {
                key: Keys.TAB,
                shift: false,
                exec: () => (this._domDialog ? focusNext(this._domDialog) : false),
                help: "selectNext_action",
            },
        ];
        this.view = this.view.bind(this);
    }
    view() {
        if (this.usedBottomNavBefore !== styles.isUsingBottomNavigation()) {
            this.close();
        }
        this.usedBottomNavBefore = styles.isUsingBottomNavigation();
        const marginTop = this.usedBottomNavBefore ? "env(safe-area-inset-top)" : px(size.navbar_height);
        return m(".flex.col", {
            style: {
                width: px(size.first_col_max_width - size.button_height),
                height: `calc(100% - ${marginTop})`,
                // for the header
                marginTop,
                marginLeft: px(size.button_height),
            },
            onclick: (e) => e.stopPropagation(),
            // do not propagate clicks on the dialog as the Modal expects all propagated clicks to be clicks on the background
            oncreate: (vnode) => {
                this._domDialog = vnode.dom;
                let animation = null;
                const bgcolor = theme.navigation_bg;
                const children = Array.from(this._domDialog.children);
                for (let child of children) {
                    child.style.opacity = "0";
                }
                this._domDialog.style.backgroundColor = `rgba(0, 0, 0, 0)`;
                animation = Promise.all([
                    animations.add(this._domDialog, alpha("backgroundColor" /* AlphaEnum.BackgroundColor */, bgcolor, 0, 1)),
                    animations.add(children, opacity(0, 1, true), {
                        delay: DefaultAnimationTime / 2,
                    }),
                ]);
                // select first input field. blur first to avoid that users can enter text in the previously focused element while the animation is running
                window.requestAnimationFrame(() => {
                    const activeElement = document.activeElement;
                    if (activeElement && typeof activeElement.blur === "function") {
                        activeElement.blur();
                    }
                });
                animation.then(() => {
                    this.defaultFocusOnLoad();
                });
            },
        }, [
            m(".plr-button.mt.mb", m(LoginButton, {
                label: "done_action",
                onclick: () => this.close(),
            })),
            m(".scroll.overflow-x-hidden.flex.col.flex-grow", {
                onscroll: (e) => {
                    const target = e.target;
                    target.style.borderTop = `1px solid ${theme.content_border}`;
                },
            }, this.folderList()),
        ]);
    }
    defaultFocusOnLoad() {
        const dom = assertNotNull(this._domDialog);
        let inputs = Array.from(dom.querySelectorAll(INPUT));
        if (inputs.length > 0) {
            inputs[0].focus();
        }
        else {
            let button = dom.querySelector("button");
            if (button) {
                button.focus();
            }
        }
    }
    hideAnimation() {
        let bgcolor = getElevatedBackground();
        if (this._domDialog) {
            return Promise.all([
                animations.add(this._domDialog.children, opacity(1, 0, true)),
                animations.add(this._domDialog, alpha("backgroundColor" /* AlphaEnum.BackgroundColor */, bgcolor, 1, 0), {
                    delay: DefaultAnimationTime / 2,
                    easing: ease.linear,
                }),
            ]).then(noOp);
        }
        else {
            return Promise.resolve();
        }
    }
    show() {
        this.focusedBeforeShown = document.activeElement;
        modal.display(this);
        this.visible = true;
        return this;
    }
    close() {
        this.visible = false;
        modal.remove(this);
    }
    /**
     * Should be called to close a dialog. Notifies the closeHandler about the close attempt.
     */
    onClose() {
        if (this._closeHandler) {
            this._closeHandler();
        }
        else {
            this.close();
        }
    }
    shortcuts() {
        return this._shortcuts;
    }
    backgroundClick(e) { }
    popState(e) {
        this.onClose();
        return false;
    }
    callingElement() {
        return this.focusedBeforeShown;
    }
    addShortcut(shortcut) {
        this._shortcuts.push(shortcut);
        if (this.visible) {
            keyManager.registerModalShortcuts([shortcut]);
        }
        return this;
    }
    static showEdit(folders) {
        new EditFoldersDialog(folders).show();
    }
}
//# sourceMappingURL=EditFoldersDialog.js.map