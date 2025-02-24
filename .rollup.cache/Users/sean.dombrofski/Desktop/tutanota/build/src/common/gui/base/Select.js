import m from "mithril";
import { modal } from "./Modal.js";
import { assertNotNull } from "@tutao/tutanota-utils";
import { px, size } from "../size.js";
import { Keys } from "../../api/common/TutanotaConstants.js";
import { focusNext, focusPrevious, isKeyPressed } from "../../misc/KeyManager.js";
import { showDropdown } from "./Dropdown.js";
import { lang } from "../../misc/LanguageViewModel.js";
import { Icon, IconSize } from "./Icon.js";
import { getColors } from "./Button.js";
import { getSafeAreaInsetBottom, getSafeAreaInsetTop } from "../HtmlUtils.js";
import { theme } from "../theme.js";
/**
 * Select component
 * @see Component attributes: {SelectAttributes}
 * @example
 *
 * interface CalendarSelectItem extends SelectOption<string> {
 *   color: string
 * 	 name: string
 * }
 *
 * m(Select<CalendarSelectItem, string>, {
 *   classes: ["custom-margins"],
 *   onChange: (val) => {
 * 	   this.selected = val
 *   },
 * 	 options: this.options,
 * 	 expanded: true,
 * 	 selected: this.selected,
 * 	 renderOption: (option) => {
 * 	   return m(".flex.items-center.gap-vpad-xs", [
 * 	     m("div", { style: { width: "24px", height: "24px", borderRadius: "50%", backgroundColor: option.color } }),
 *       m("span", option.name),
 * 	   ])
 * 	 },
 * 	 renderDisplay: (option) => m("span", { style: { color: "red" } }, option.name),
 * 	 ariaLabel: "Calendar"
 * }),
 */
export class Select {
    isExpanded = false;
    dropdownContainer;
    key = 0;
    view({ attrs: { onchange, options, renderOption, renderDisplay, classes, selected, placeholder, expanded, disabled, ariaLabel, iconColor, id, noIcon, keepFocus, tabIndex, onclose, dropdownPosition, }, }) {
        return m("button.tutaui-select-trigger.clickable", {
            id,
            class: this.resolveClasses(classes, disabled, expanded),
            onclick: (event) => event.currentTarget &&
                this.renderDropdown(options, event.currentTarget, onchange, renderOption, keepFocus ?? false, selected?.value, onclose, dropdownPosition),
            role: "combobox" /* AriaRole.Combobox */,
            ariaLabel,
            disabled: disabled,
            ariaExpanded: String(this.isExpanded),
            tabIndex: tabIndex ?? Number(disabled ? "-1" /* TabIndex.Programmatic */ : "0" /* TabIndex.Default */),
            value: selected?.ariaValue,
        }, [
            selected != null ? renderDisplay(selected) : this.renderPlaceholder(placeholder),
            noIcon !== true
                ? m(Icon, {
                    icon: "Expand" /* BootIcons.Expand */,
                    container: "div",
                    class: `fit-content transition-transform`,
                    size: IconSize.Medium,
                    style: {
                        fill: iconColor ?? getColors("content" /* ButtonColor.Content */).button,
                    },
                })
                : null,
        ]);
    }
    resolveClasses(classes = [], disabled = false, expanded = false) {
        const classList = [...classes];
        if (disabled) {
            classList.push("disabled", "click-disabled");
        }
        else {
            classList.push("flash");
        }
        if (expanded) {
            classList.push("full-width");
        }
        else {
            classList.push("fit-content");
        }
        return classList.join(" ");
    }
    renderPlaceholder(placeholder) {
        if (placeholder == null || typeof placeholder === "string") {
            return m("span.placeholder", placeholder ?? lang.get("noSelection_msg"));
        }
        return placeholder;
    }
    renderDropdown(options, dom, onSelect, renderOptions, keepFocus, selected, onClose, dropdownPosition) {
        const optionListContainer = new OptionListContainer(options, (option) => {
            return m.fragment({
                key: ++this.key,
                oncreate: ({ dom }) => this.setupOption(dom, onSelect, option, optionListContainer, selected),
            }, [renderOptions(option)]);
        }, dom.getBoundingClientRect().width, keepFocus, dropdownPosition);
        optionListContainer.onClose = () => {
            optionListContainer.close();
            onClose?.();
            this.isExpanded = false;
        };
        optionListContainer.setOrigin(dom.getBoundingClientRect());
        this.isExpanded = true;
        this.dropdownContainer = optionListContainer;
        modal.displayUnique(optionListContainer, false);
    }
    setupOption(dom, onSelect, option, optionListContainer, selected) {
        dom.onclick = this.wrapOnChange.bind(this, onSelect, option, optionListContainer);
        if (!("disabled" in dom)) {
            // We have to set the tabIndex to make sure that it'll be focusable by tabbing
            dom.tabIndex = Number("0" /* TabIndex.Default */);
            // We have to set the cursor pointer as a fallback of renderOptions that doesn't set it
            if (!dom.style.cursor) {
                dom.style.cursor = "pointer";
            }
            if (!dom.role) {
                dom.role = "option" /* AriaRole.Option */;
            }
            dom.ariaSelected = `${selected === option.value}`;
        }
        dom.onkeydown = (e) => {
            if (isKeyPressed(e.key, Keys.SPACE, Keys.RETURN)) {
                e.preventDefault();
                this.wrapOnChange(onSelect, option, optionListContainer);
            }
        };
    }
    wrapOnChange(callback, option, container) {
        callback(option);
        container.onClose();
    }
}
class OptionListContainer {
    items;
    buildFunction;
    domDropdown = null;
    view;
    origin = null;
    shortcuts;
    width;
    domContents = null;
    maxHeight = null;
    focusedBeforeShown = document.activeElement;
    children = [];
    constructor(items, buildFunction, width, keepFocus, dropdownPosition) {
        this.items = items;
        this.buildFunction = buildFunction;
        this.width = width;
        this.shortcuts = this.buildShortcuts;
        this.items.map((newItems) => {
            this.children = [];
            this.children.push(newItems.length === 0 ? this.renderNoItem() : newItems.map((item) => this.buildFunction(item)));
        });
        this.view = () => {
            return m(".dropdown-panel-scrollable.elevated-bg.border-radius.dropdown-shadow.fit-content", {
                oncreate: (vnode) => {
                    this.domDropdown = vnode.dom;
                    // It is important to set initial opacity so that user doesn't see it with full opacity before animating.
                    this.domDropdown.style.opacity = "0";
                },
            }, m(".dropdown-content.scroll.flex.flex-column", {
                role: "listbox" /* AriaRole.Listbox */,
                tabindex: "-1" /* TabIndex.Programmatic */,
                oncreate: (vnode) => {
                    this.domContents = vnode.dom;
                },
                onupdate: (vnode) => {
                    if (this.maxHeight == null) {
                        const children = Array.from(vnode.dom.children);
                        this.maxHeight = Math.min(400 + size.vpad, children.reduce((accumulator, children) => accumulator + children.offsetHeight, 0) + size.vpad); // size.pad accounts for top and bottom padding
                        if (this.origin) {
                            // The dropdown-content element is added to the dom has a hidden element first.
                            // The maxHeight is available after the first onupdate call. Then this promise will resolve and we can safely
                            // show the dropdown.
                            // Modal always schedules redraw in oncreate() of a component so we are guaranteed to have onupdate() call.
                            showDropdown(this.origin, assertNotNull(this.domDropdown), this.maxHeight, this.width, dropdownPosition).then(() => {
                                const selectedOption = vnode.dom.querySelector("[aria-selected='true']");
                                if (selectedOption && !keepFocus) {
                                    selectedOption.focus();
                                }
                                else if (!keepFocus && (!this.domDropdown || focusNext(this.domDropdown))) {
                                    this.domContents?.focus();
                                }
                            });
                        }
                    }
                    else {
                        this.updateDropdownSize(vnode);
                    }
                },
                onscroll: (ev) => {
                    const target = ev.target;
                    // needed here to prevent flickering on ios
                    ev.redraw =
                        this.domContents != null && target.scrollTop < 0 && target.scrollTop + this.domContents.offsetHeight > target.scrollHeight;
                },
            }, this.children));
        };
    }
    updateDropdownSize(vnode) {
        if (!(this.origin && this.domDropdown)) {
            return;
        }
        const upperSpace = this.origin.top - getSafeAreaInsetTop();
        const lowerSpace = window.innerHeight - this.origin.bottom - getSafeAreaInsetBottom();
        const children = Array.from(vnode.dom.children);
        const contentHeight = Math.min(400 + size.vpad, children.reduce((accumulator, children) => accumulator + children.offsetHeight, 0) + size.vpad);
        this.maxHeight = lowerSpace > upperSpace ? Math.min(contentHeight, lowerSpace) : Math.min(contentHeight, upperSpace);
        const newHeight = px(this.maxHeight);
        if (this.domDropdown.style.height !== newHeight)
            this.domDropdown.style.height = newHeight;
    }
    renderNoItem() {
        return m("span.placeholder.text-center", { color: theme.list_message_bg }, lang.get("noEntries_msg"));
    }
    backgroundClick = (e) => {
        if (this.domDropdown &&
            !e.target.classList.contains("doNotClose") &&
            (this.domDropdown.contains(e.target) || this.domDropdown.parentNode === e.target)) {
            this.onClose();
        }
    };
    buildShortcuts() {
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
        ];
    }
    setOrigin(origin) {
        this.origin = origin;
        return this;
    }
    close() {
        modal.remove(this);
    }
    hideAnimation() {
        return Promise.resolve();
    }
    onClose() {
        this.close();
    }
    popState(e) {
        this.onClose();
        return false;
    }
    callingElement() {
        return this.focusedBeforeShown;
    }
}
//# sourceMappingURL=Select.js.map