import m from "mithril";
import { modal } from "./Modal";
import { animations, opacity, transform } from "../animation/Animations";
import { ease } from "../animation/Easing";
import { px, size } from "../size";
import { focusNext, focusPrevious } from "../../misc/KeyManager";
import { lang } from "../../misc/LanguageViewModel";
import { Keys } from "../../api/common/TutanotaConstants";
import { getSafeAreaInsetBottom, getSafeAreaInsetTop } from "../HtmlUtils";
import { assertNotNull, delay, downcast, filterNull, makeSingleUse, neverNull, noOp } from "@tutao/tutanota-utils";
import { client } from "../../misc/ClientDetector";
import { pureComponent } from "./PureComponent";
import { assertMainOrNode } from "../../api/common/Env";
import { RowButton } from "./buttons/RowButton.js";
import { BaseButton } from "./buttons/BaseButton";
assertMainOrNode();
/**
 * Renders small info message inside the dropdown.
 */
const DropdownInfo = pureComponent(({ center, bold, info }) => {
    return m(".dropdown-info.text-break.selectable" + (center ? ".center" : "") + (bold ? ".b" : ""), info);
});
function isDropDownInfo(dropdownChild) {
    return Object.hasOwn(dropdownChild, "info") && Object.hasOwn(dropdownChild, "center") && Object.hasOwn(dropdownChild, "bold");
}
// Some Android WebViews still don't support DOMRect so we polyfill that
// Implemented according to https://developer.mozilla.org/en-US/docs/Web/API/DOMRectReadOnly and common sense
export class DomRectReadOnlyPolyfilled {
    x;
    y;
    width;
    height;
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    get top() {
        return this.height > 0 ? this.y : this.y + this.height;
    }
    get bottom() {
        return this.height > 0 ? this.y + this.height : this.y;
    }
    get left() {
        return this.width > 0 ? this.x : this.x + this.width;
    }
    get right() {
        return this.width > 0 ? this.x + this.width : this.x;
    }
}
// TODO: add resize listener like in the old Dropdown
export class Dropdown {
    children;
    domDropdown = null;
    origin = null;
    oninit;
    view;
    width;
    shortcuts;
    filterString;
    domInput = null;
    domContents = null;
    isFilterable = false;
    maxHeight = null;
    closeHandler = null;
    focusedBeforeShown = document.activeElement;
    constructor(lazyChildren, width) {
        this.children = [];
        this.width = width;
        this.filterString = "";
        this.oninit = () => {
            this.children = filterNull(lazyChildren());
            this.isFilterable = this.children.length > 10;
            this.children.map((child) => {
                if (isDropDownInfo(child)) {
                    return child;
                }
                const buttonChild = child;
                buttonChild.click = this.wrapClick(child.click ? child.click : () => null);
                return child;
            });
        };
        let _shortcuts = this._createShortcuts();
        this.shortcuts = () => {
            return _shortcuts;
        };
        const inputField = () => {
            return this.isFilterable
                ? m("input.input.dropdown-bar.elevated-bg.doNotClose.button-height.button-min-height.pr-s", {
                    placeholder: lang.get("typeToFilter_label"),
                    oncreate: (vnode) => {
                        this.domInput = downcast(vnode.dom);
                        this.domInput.value = this.filterString;
                    },
                    oninput: () => {
                        this.filterString = neverNull(this.domInput).value;
                    },
                    style: {
                        paddingLeft: px(size.hpad_large * 2),
                    },
                }, this.filterString)
                : null;
        };
        const contents = () => {
            const showingIcons = this.children.some((c) => "icon" in c && typeof c.icon !== "undefined");
            // We need to set the height to the height of the parent which already has the calculated and measured height, otherwise this element might
            // overflow the parent (the overall dropdown container) when there's not enough vertical space to display all items
            return m(".dropdown-content.scroll", {
                role: "Menu" /* AriaRole.Menu */,
                tabindex: "-1" /* TabIndex.Programmatic */,
                oncreate: (vnode) => {
                    this.domContents = vnode.dom;
                },
                onupdate: (vnode) => {
                    if (this.maxHeight == null) {
                        const children = Array.from(vnode.dom.children);
                        this.maxHeight = children.reduce((accumulator, children) => accumulator + children.offsetHeight, 0) + size.vpad;
                        if (this.origin) {
                            // The dropdown-content element is added to the dom has a hidden element first.
                            // The maxHeight is available after the first onupdate call. Then this promise will resolve and we can safely
                            // show the dropdown.
                            // Modal always schedules redraw in oncreate() of a component so we are guaranteed to have onupdate() call.
                            showDropdown(this.origin, assertNotNull(this.domDropdown), this.maxHeight, this.width).then(() => {
                                const firstButton = vnode.dom.getElementsByTagName("button").item(0);
                                if (this.domInput && !client.isMobileDevice()) {
                                    this.domInput.focus();
                                }
                                else if (firstButton !== null) {
                                    firstButton.focus();
                                }
                                else {
                                    this.domContents?.focus();
                                }
                            });
                        }
                    }
                },
                onscroll: (ev) => {
                    const target = ev.target;
                    // needed here to prevent flickering on ios
                    ev.redraw = this.domContents != null && target.scrollTop < 0 && target.scrollTop + this.domContents.offsetHeight > target.scrollHeight;
                },
                style: {
                    top: px(this.getFilterHeight()),
                    bottom: 0,
                },
            }, this.visibleChildren().map((child) => {
                if (isDropDownInfo(child)) {
                    return m(DropdownInfo, child);
                }
                else {
                    return Dropdown.renderDropDownButton(child, showingIcons);
                }
            }));
        };
        const closeBtn = () => {
            return m(BaseButton, {
                label: "close_alt",
                text: lang.get("close_alt"),
                class: "hidden-until-focus content-accent-fg button-content",
                onclick: () => {
                    this.onClose();
                },
            });
        };
        this.view = () => {
            return m(".dropdown-panel.elevated-bg.border-radius.dropdown-shadow.fit-content.flex-column.flex-start", {
                oncreate: (vnode) => {
                    this.domDropdown = vnode.dom;
                    // It is important to set initial opacity so that user doesn't see it with full opacity before animating.
                    this.domDropdown.style.opacity = "0";
                },
                onkeypress: () => {
                    if (this.domInput) {
                        this.domInput.focus();
                    }
                },
            }, [inputField(), contents(), closeBtn()]);
        };
    }
    static renderDropDownButton(child, showingIcons) {
        return m(RowButton, {
            role: "option" /* AriaRole.Option */,
            selected: child.selected,
            label: child.label,
            text: child.text,
            icon: child.icon && showingIcons ? child.icon : showingIcons ? "none" : undefined,
            class: "dropdown-button",
            onclick: child.click ? child.click : noOp,
        });
    }
    wrapClick(fn) {
        return (e, dom) => {
            const r = fn(e, dom);
            this.close();
            return r;
        };
    }
    backgroundClick(e) {
        if (this.domDropdown &&
            !e.target.classList.contains("doNotClose") &&
            (this.domDropdown.contains(e.target) || this.domDropdown.parentNode === e.target)) {
            this.onClose();
        }
    }
    _createShortcuts() {
        return [
            {
                key: Keys.ESC,
                exec: () => this.onClose(),
                help: "close_alt",
            },
            {
                key: Keys.TAB,
                shift: true,
                exec: () => (this.domDropdown ? focusPrevious(this.domDropdown) : false),
                help: "selectPrevious_action",
            },
            {
                key: Keys.TAB,
                shift: false,
                exec: () => (this.domDropdown ? focusNext(this.domDropdown) : false),
                help: "selectNext_action",
            },
            {
                key: Keys.UP,
                exec: () => (this.domDropdown ? focusPrevious(this.domDropdown) : false),
                help: "selectPrevious_action",
            },
            {
                key: Keys.DOWN,
                exec: () => (this.domDropdown ? focusNext(this.domDropdown) : false),
                help: "selectNext_action",
            },
            {
                key: Keys.RETURN,
                exec: () => this.chooseMatch(),
                help: "ok_action",
            },
        ];
    }
    setOrigin(origin) {
        this.origin = origin;
        return this;
    }
    close() {
        modal.remove(this);
    }
    onClose() {
        if (this.closeHandler) {
            this.closeHandler();
        }
        else {
            this.close();
        }
    }
    popState(e) {
        this.onClose();
        return false;
    }
    callingElement() {
        return this.focusedBeforeShown;
    }
    chooseMatch = () => {
        const filterString = this.filterString.toLowerCase();
        let visibleElements = downcast(this.visibleChildren().filter((b) => !isDropDownInfo(b)));
        let matchingButton = visibleElements.length === 1 ? visibleElements[0] : visibleElements.find((b) => lang.getTranslationText(b.label).toLowerCase() === filterString);
        if (this.domInput && document.activeElement === this.domInput && matchingButton && matchingButton.click) {
            matchingButton.click(new MouseEvent("click"), this.domInput);
            return false;
        }
        return true;
    };
    /**
     * Is invoked from modal as the two animations (background layer opacity and dropdown) should run in parallel
     */
    hideAnimation() {
        return Promise.resolve();
    }
    setCloseHandler(handler) {
        this.closeHandler = handler;
        return this;
    }
    visibleChildren() {
        return this.children.filter((b) => {
            if (isDropDownInfo(b)) {
                return b.info.includes(this.filterString.toLowerCase());
            }
            else if (this.isFilterable) {
                const filterable = lang.getTranslationText(b.text ?? b.label);
                return filterable.toLowerCase().includes(this.filterString.toLowerCase());
            }
            else {
                return true;
            }
        });
    }
    getFilterHeight() {
        return this.isFilterable ? size.button_height + size.vpad_xs : 0;
    }
}
export function createDropdown({ lazyButtons, overrideOrigin, width, withBackground, }) {
    return createAsyncDropdown({ lazyButtons: async () => lazyButtons(), overrideOrigin, width, withBackground });
}
export function createAsyncDropdown({ lazyButtons, overrideOrigin, width = 200, withBackground = false, onClose = undefined, }) {
    // not all browsers have the actual button as e.currentTarget, but all of them send it as a second argument (see https://github.com/tutao/tutanota/issues/1110)
    return (_, dom) => {
        const originalButtons = lazyButtons();
        let buttonsResolved = false;
        originalButtons.then(() => {
            buttonsResolved = true;
        });
        let buttons = originalButtons;
        // If the promise is pending and does not resolve in 100ms, show progress dialog
        buttons = Promise.race([
            originalButtons,
            Promise.all([delay(100), import("../dialogs/ProgressDialog.js")]).then(([_, module]) => {
                if (!buttonsResolved) {
                    return module.showProgressDialog("loading_msg", originalButtons);
                }
                else {
                    return originalButtons;
                }
            }),
        ]);
        buttons.then((buttons) => {
            let dropdown = new Dropdown(() => buttons, width);
            if (onClose) {
                dropdown.setCloseHandler(() => {
                    onClose();
                    dropdown.close();
                });
            }
            let buttonRect;
            if (overrideOrigin) {
                buttonRect = overrideOrigin(dom.getBoundingClientRect());
            }
            else {
                // When new instance is created and the old DOM is detached we may have incorrect positioning
                buttonRect = dom.getBoundingClientRect();
            }
            dropdown.setOrigin(buttonRect);
            modal.displayUnique(dropdown, withBackground);
        });
    };
}
export function showDropdownAtPosition(buttons, xPos, yPos, closeHandler = noOp, width = 200) {
    const dropdown = new Dropdown(() => buttons, width);
    const close = makeSingleUse(() => {
        closeHandler();
        dropdown.close();
    });
    dropdown.setOrigin(new DomRectReadOnlyPolyfilled(xPos, yPos, 0, 0));
    dropdown.setCloseHandler(close);
    modal.displayUnique(dropdown, false);
}
/**
 *
 * @param mainButtonAttrs the attributes of the main button. if showDropdown returns false, nothing will happen.
 * @param childAttrs the attributes of the children shown in the dropdown
 * @param showDropdown this will be checked before showing the dropdown
 * @param width width of the dropdown
 * @param onClose callback that is called when the dropdown closes
 * @returns {ButtonAttrs} modified mainButtonAttrs that shows a dropdown on click or
 * button doesn't do anything if showDropdown returns false
 */
export function attachDropdown({ mainButtonAttrs, childAttrs, showDropdown = () => true, width, overrideOrigin, onClose, }) {
    return Object.assign({}, mainButtonAttrs, {
        click: (e, dom) => {
            if (showDropdown()) {
                const dropDownFn = createAsyncDropdown({
                    lazyButtons: () => Promise.resolve(childAttrs()),
                    overrideOrigin,
                    width,
                    onClose,
                });
                dropDownFn(e, dom);
                e.stopPropagation();
            }
        },
    });
}
export const DROPDOWN_MARGIN = 4;
export function showDropdown(origin, domDropdown, contentHeight, contentWidth, position) {
    // |------------------|    |------------------|    |------------------|    |------------------|
    // |                  |    |                  |    |                  |    |                  |
    // |      |-------|   |    |  |-------|       |    |  |-----------^   |    |  ^-----------|   |
    // |      | elem  |   |    |  | elem  |       |    |  | dropdown  |   |    |  | dropdown  |   |
    // |      |-------|   |    |  |-------|       |    |  |<----------|   |    |  |---------->|   |
    // |  |<----------|   |    |  |---------->|   |    |      |-------|   |    |  |-------|       |
    // |  | dropdown  |   |    |  | dropdown  |   |    |      | elem  |   |    |  | elem  |       |
    // /  |-----------V   |    |  V-----------|   |    |      |-------|   |    |  |-------|       |
    //
    // Decide were to open dropdown. We open the dropdown depending on the position of the touched element.
    // For that we devide the screen into four parts which are upper/lower and right/left part of the screen.
    // If the element is in the upper right part for example we try to open the dropdown below the touched element
    // starting from the right edge of the touched element.
    // If the element is in the lower left part of the screen we open the dropdown above the element
    // starting from the left edge of the touched element.
    // If the dropdown width does not fit from its calculated starting position we open it from the edge of the screen.
    const leftEdgeOfElement = origin.left;
    const rightEdgeOfElement = origin.right;
    const bottomEdgeOfElement = origin.bottom;
    const topEdgeOfElement = origin.top;
    const upperSpace = origin.top - getSafeAreaInsetTop();
    const lowerSpace = window.innerHeight - origin.bottom - getSafeAreaInsetBottom();
    const leftSpace = origin.left;
    const rightSpace = window.innerWidth - origin.right;
    let transformOrigin = "";
    let maxHeight;
    const showBelow = (!position && lowerSpace > upperSpace) || position === "bottom";
    if (showBelow) {
        // element is in the upper part of the screen, dropdown should be below the element
        transformOrigin += "top";
        domDropdown.style.top = bottomEdgeOfElement + "px";
        domDropdown.style.bottom = "";
        maxHeight = Math.min(contentHeight, lowerSpace);
    }
    else {
        // element is in the lower part of the screen, dropdown should be above the element
        transformOrigin += "bottom";
        domDropdown.style.top = "";
        // position bottom is defined from the bottom edge of the screen
        // and not like the viewport origin which starts at top/left
        domDropdown.style.bottom = px(window.innerHeight - topEdgeOfElement);
        maxHeight = Math.min(contentHeight, upperSpace);
    }
    transformOrigin += leftSpace < rightSpace ? " left" : " right";
    const dropdownMaxWidth = window.innerWidth - DROPDOWN_MARGIN * 2;
    const dropdownWidth = Math.max(contentWidth, domDropdown.getBoundingClientRect().width);
    let width = dropdownWidth;
    let leftStyle = null;
    let rightStyle = null;
    if (width >= dropdownMaxWidth) {
        // If the dropdown is wider than the viewport, it takes the entire width (- margins) and text is cut off
        domDropdown.classList.remove("fit-content");
        leftStyle = DROPDOWN_MARGIN;
        width = dropdownMaxWidth;
    }
    else if (leftSpace < rightSpace) {
        // element is in the left part of the screen, dropdown should extend to the right from the element
        const availableSpaceForDropdown = window.innerWidth - leftEdgeOfElement;
        let leftEdgeOfDropdown = leftEdgeOfElement;
        if (availableSpaceForDropdown < dropdownWidth) {
            // If the dropdown does not fit, we shift it by the required amount
            const shiftForDropdown = leftEdgeOfDropdown + dropdownWidth - window.innerWidth + DROPDOWN_MARGIN;
            leftEdgeOfDropdown = leftEdgeOfElement - shiftForDropdown;
        }
        leftStyle = Math.max(DROPDOWN_MARGIN, leftEdgeOfDropdown);
    }
    else {
        // element is in the right part of the screen, dropdown should extend to the left from the element
        const availableSpaceForDropdown = origin.right;
        let rightEdgeOfDropdown = rightEdgeOfElement;
        if (availableSpaceForDropdown < dropdownWidth) {
            // If the dropdown does not fit, we shift it by the required amount. If it still does not fit, we reduce the width.
            const shiftForDropdown = dropdownWidth - rightEdgeOfDropdown + DROPDOWN_MARGIN;
            rightEdgeOfDropdown = rightEdgeOfElement + shiftForDropdown;
        }
        // position right is defined from the right edge of the screen
        // and not like the viewport origin which starts at top/left
        rightStyle = Math.max(DROPDOWN_MARGIN, window.innerWidth - rightEdgeOfDropdown);
    }
    domDropdown.style.left = leftStyle != null ? px(leftStyle) : "";
    domDropdown.style.right = rightStyle != null ? px(rightStyle) : "";
    domDropdown.style.width = px(width);
    domDropdown.style.height = px(maxHeight);
    domDropdown.style.transformOrigin = transformOrigin;
    return animations.add(domDropdown, [opacity(0, 1, true), transform("scale" /* TransformEnum.Scale */, 0.5, 1)], {
        easing: ease.out,
    });
}
//# sourceMappingURL=Dropdown.js.map