import m from "mithril";
import { px, size } from "../size";
import { DefaultAnimationTime } from "../animation/Animations";
import { theme } from "../theme";
import { lang } from "../../misc/LanguageViewModel";
import { isKeyPressed, useKeyHandler } from "../../misc/KeyManager";
import { Keys } from "../../api/common/TutanotaConstants";
import { getOperatingClasses } from "./GuiUtils";
export const inputLineHeight = size.font_size_base + 8;
const inputMarginTop = size.font_size_small + size.hpad_small + 3;
// this is not always correct because font size can be bigger/smaller, and we ideally should take that into account
const baseLabelPosition = 21;
// it should fit
// compact button + 1 px border + 1 px padding to keep things centered = 32
// 24px line-height + 12px label + some space between them = 36 + ?
const minInputHeight = 46;
export class TextField {
    active;
    onblur = null;
    domInput;
    _domWrapper;
    _domLabel;
    _domInputWrapper;
    _didAutofill;
    constructor() {
        this.active = false;
    }
    view(vnode) {
        const a = vnode.attrs;
        const maxWidth = a.maxWidth;
        const labelBase = !this.active && a.value === "" && !a.isReadOnly && !this._didAutofill && !a.injectionsLeft;
        const labelTransitionSpeed = DefaultAnimationTime / 2;
        const doShowBorder = a.doShowBorder !== false;
        const borderWidth = this.active ? "2px" : "1px";
        const borderColor = this.active ? theme.content_accent : theme.content_border;
        return m(".text-field.rel.overflow-hidden", {
            id: vnode.attrs.id,
            oncreate: (vnode) => (this._domWrapper = vnode.dom),
            onclick: (e) => (a.onclick ? a.onclick(e, this._domInputWrapper) : this.focus(e, a)),
            "aria-haspopup": a.hasPopup,
            class: a.class != null ? a.class : "pt" + " " + getOperatingClasses(a.disabled),
            style: maxWidth
                ? {
                    maxWidth: px(maxWidth),
                    ...a.style,
                }
                : { ...a.style },
        }, [
            m("label.abs.text-ellipsis.noselect.z1.i.pr-s", {
                "aria-hidden": "true",
                class: this.active ? "content-accent-fg" : "" + " " + getOperatingClasses(a.disabled),
                oncreate: (vnode) => {
                    this._domLabel = vnode.dom;
                },
                style: {
                    fontSize: `${labelBase ? size.font_size_base : size.font_size_small}px`,
                    transform: `translateY(${labelBase ? baseLabelPosition : 0}px)`,
                    transition: `transform ${labelTransitionSpeed}ms ease-out, font-size ${labelTransitionSpeed}ms  ease-out`,
                },
            }, lang.getTranslationText(a.label)),
            m(".flex.flex-column", [
                // another wrapper to fix IE 11 min-height bug https://github.com/philipwalton/flexbugs#3-min-height-on-a-flex-container-wont-apply-to-its-flex-items
                m(".flex.items-end.flex-wrap", {
                    // .flex-wrap
                    style: {
                        "min-height": px(minInputHeight),
                        // 2 px border
                        "padding-bottom": this.active ? px(0) : px(1),
                        "border-bottom": doShowBorder ? `${borderWidth} solid ${borderColor}` : "",
                    },
                }, [
                    a.injectionsLeft ? a.injectionsLeft() : null, // additional wrapper element for bubble input field. input field should always be in one line with right injections
                    m(".inputWrapper.flex-space-between.items-end", {
                        style: {
                            minHeight: px(minInputHeight - 2), // minus padding
                        },
                        oncreate: (vnode) => (this._domInputWrapper = vnode.dom),
                    }, [
                        a.type !== "area" /* TextFieldType.Area */ ? this._getInputField(a) : this._getTextArea(a),
                        a.injectionsRight
                            ? m(".flex-end.items-center", {
                                style: { minHeight: px(minInputHeight - 2) },
                            }, a.injectionsRight())
                            : null,
                    ]),
                ]),
            ]),
            a.helpLabel
                ? m("small.noselect", {
                    onclick: (e) => {
                        e.stopPropagation();
                    },
                }, a.helpLabel())
                : [],
        ]);
    }
    _getInputField(a) {
        if (a.isReadOnly) {
            return m(".text-break.selectable", {
                style: {
                    marginTop: px(inputMarginTop),
                    lineHeight: px(inputLineHeight),
                },
                "data-testid": `tf:${lang.getTestId(a.label)}`,
            }, a.value);
        }
        else {
            // Due to modern browser's 'smart' password managers that try to autofill everything
            // that remotely resembles a password field, we prepend invisible inputs to password fields
            // that shouldn't be autofilled.
            // since the autofill algorithm looks at inputs that come before and after the password field we need
            // three dummies.
            const autofillGuard = a.autocompleteAs === "off" /* Autocomplete.off */
                ? [
                    m("input.abs", {
                        style: {
                            opacity: "0",
                            height: "0",
                        },
                        tabIndex: "-1" /* TabIndex.Programmatic */,
                        type: "text" /* TextFieldType.Text */,
                    }),
                    m("input.abs", {
                        style: {
                            opacity: "0",
                            height: "0",
                        },
                        tabIndex: "-1" /* TabIndex.Programmatic */,
                        type: "password" /* TextFieldType.Password */,
                    }),
                    m("input.abs", {
                        style: {
                            opacity: "0",
                            height: "0",
                        },
                        tabIndex: "-1" /* TabIndex.Programmatic */,
                        type: "text" /* TextFieldType.Text */,
                    }),
                ]
                : [];
            return m(".flex-grow.rel", autofillGuard.concat([
                m("input.input" + (a.alignRight ? ".right" : ""), {
                    autocomplete: a.autocompleteAs ?? "",
                    autocapitalize: a.autocapitalize,
                    type: a.type,
                    min: a.min,
                    max: a.max,
                    "aria-label": lang.getTranslationText(a.label),
                    disabled: a.disabled,
                    class: getOperatingClasses(a.disabled) + " text",
                    oncreate: (vnode) => {
                        this.domInput = vnode.dom;
                        a.onDomInputCreated?.(this.domInput);
                        this.domInput.value = a.value;
                        if (a.type !== "area" /* TextFieldType.Area */) {
                            ;
                            vnode.dom.addEventListener("animationstart", (e) => {
                                if (e.animationName === "onAutoFillStart") {
                                    this._didAutofill = true;
                                    m.redraw();
                                }
                                else if (e.animationName === "onAutoFillCancel") {
                                    this._didAutofill = false;
                                    m.redraw();
                                }
                            });
                        }
                    },
                    onfocus: (e) => {
                        this.focus(e, a);
                        a.onfocus?.(this._domWrapper, this.domInput);
                    },
                    onblur: (e) => this.blur(e, a),
                    onkeydown: (e) => {
                        const handled = useKeyHandler(e, a.keyHandler);
                        if (!isKeyPressed(e.key, Keys.F1, Keys.TAB, Keys.ESC)) {
                            // When we are in a text field we don't want keys propagated up to act as hotkeys
                            e.stopPropagation();
                        }
                        return handled;
                    },
                    onupdate: () => {
                        // only change the value if the value has changed otherwise the cursor in Safari and in the iOS App cannot be positioned.
                        if (this.domInput.value !== a.value) {
                            this.domInput.value = a.value;
                        }
                    },
                    oninput: () => {
                        a.oninput?.(this.domInput.value, this.domInput);
                    },
                    onremove: () => {
                        // We clean up any value that might still be in DOM e.g. password
                        if (this.domInput)
                            this.domInput.value = "";
                    },
                    style: {
                        maxWidth: a.maxWidth,
                        minWidth: px(20),
                        // fix for edge browser. buttons are cut off in small windows otherwise
                        lineHeight: px(inputLineHeight),
                        fontSize: a.fontSize,
                    },
                    "data-testid": `tf:${lang.getTestId(a.label)}`,
                }),
            ]));
        }
    }
    _getTextArea(a) {
        if (a.isReadOnly) {
            return m(".text-prewrap.text-break.selectable", {
                style: {
                    marginTop: px(inputMarginTop),
                    lineHeight: px(inputLineHeight),
                },
            }, a.value);
        }
        else {
            return m("textarea.input-area.text-pre", {
                "aria-label": lang.getTranslationText(a.label),
                disabled: a.disabled,
                autocapitalize: a.autocapitalize,
                class: getOperatingClasses(a.disabled) + " text",
                oncreate: (vnode) => {
                    this.domInput = vnode.dom;
                    this.domInput.value = a.value;
                    this.domInput.style.height = px(Math.max(a.value.split("\n").length, 1) * inputLineHeight); // display all lines on creation of text area
                },
                onfocus: (e) => this.focus(e, a),
                onblur: (e) => this.blur(e, a),
                onkeydown: (e) => useKeyHandler(e, a.keyHandler),
                oninput: () => {
                    this.domInput.style.height = "0px";
                    this.domInput.style.height = px(this.domInput.scrollHeight);
                    a.oninput?.(this.domInput.value, this.domInput);
                },
                onupdate: () => {
                    // only change the value if the value has changed otherwise the cursor in Safari and in the iOS App cannot be positioned.
                    if (this.domInput.value !== a.value) {
                        this.domInput.value = a.value;
                    }
                },
                style: {
                    marginTop: px(inputMarginTop),
                    lineHeight: px(inputLineHeight),
                    minWidth: px(20), // fix for edge browser. buttons are cut off in small windows otherwise
                    fontSize: a.fontSize,
                },
            });
        }
    }
    focus(e, a) {
        if (!this.active && !a.disabled && !a.isReadOnly) {
            this.active = true;
            this.domInput.focus();
            this._domWrapper.classList.add("active");
        }
    }
    blur(e, a) {
        this._domWrapper.classList.remove("active");
        this.active = false;
        if (a.onblur instanceof Function)
            a.onblur(e);
    }
    isEmpty(value) {
        return value === "";
    }
}
//# sourceMappingURL=TextField.js.map