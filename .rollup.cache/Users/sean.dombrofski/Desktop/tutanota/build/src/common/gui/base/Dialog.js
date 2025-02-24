import m from "mithril";
import { modal } from "./Modal";
import { alpha, animations, DefaultAnimationTime, opacity, transform } from "../animation/Animations";
import { ease } from "../animation/Easing";
import { lang } from "../../misc/LanguageViewModel";
import { focusNext, focusPrevious, keyManager } from "../../misc/KeyManager";
import { getElevatedBackground } from "../theme";
import { px, size } from "../size";
import { HabReminderImage } from "./icons/Icons";
import { windowFacade } from "../../misc/WindowFacade";
import { Button } from "./Button.js";
import { DialogHeaderBar } from "./DialogHeaderBar";
import { TextField } from "./TextField.js";
import { DropDownSelector } from "./DropDownSelector.js";
import { DEFAULT_ERROR, Keys } from "../../api/common/TutanotaConstants";
import { styles } from "../styles";
import { assertNotNull, getAsLazy, identity, mapLazily, noOp } from "@tutao/tutanota-utils";
import { DialogInjectionRight } from "./DialogInjectionRight";
import { assertMainOrNode } from "../../api/common/Env";
import { isOfflineError } from "../../api/common/utils/ErrorUtils.js";
import Stream from "mithril/stream";
assertMainOrNode();
export const INPUT = "input, textarea, div[contenteditable='true']";
export class Dialog {
    static keyboardHeight = 0;
    domDialog = null;
    _shortcuts;
    view;
    visible;
    focusOnLoadFunction;
    wasFocusOnLoadCalled;
    closeHandler = null;
    focusedBeforeShown = null;
    injectionRightAttrs = null;
    constructor(dialogType, childComponent) {
        this.visible = false;
        this.focusOnLoadFunction = () => this.defaultFocusOnLoad(assertNotNull(this.domDialog));
        this.wasFocusOnLoadCalled = false;
        this._shortcuts = [
            {
                key: Keys.TAB,
                shift: true,
                exec: () => (this.domDialog ? focusPrevious(this.domDialog) : false),
                help: "selectPrevious_action",
            },
            {
                key: Keys.TAB,
                shift: false,
                exec: () => (this.domDialog ? focusNext(this.domDialog) : false),
                help: "selectNext_action",
            },
        ];
        this.view = () => {
            const marginPx = px(size.hpad);
            const isEditLarge = dialogType === "EditLarge" /* DialogType.EditLarge */;
            const sidesMargin = styles.isSingleColumnLayout() && isEditLarge ? "4px" : marginPx;
            return m(this.getDialogWrapperClasses(dialogType), {
                style: {
                    paddingTop: "env(safe-area-inset-top)",
                    paddingLeft: "env(safe-area-inset-left)",
                    paddingRight: "env(safe-area-inset-right)",
                },
            }, 
            /** controls vertical alignment
             * we need overflow-hidden (actually resulting in min-height: 0 instead of auto)
             * here because otherwise the content of the dialog may make this wrapper grow bigger outside
             * the window on some browsers, e.g. upgrade reminder on Firefox mobile */
            m(".flex.justify-center.align-self-stretch.rel.overflow-hidden" + (isEditLarge ? ".flex-grow" : ".transition-margin"), {
                // controls horizontal alignment
                style: {
                    marginTop: marginPx,
                    marginLeft: sidesMargin,
                    marginRight: sidesMargin,
                    "margin-bottom": Dialog.keyboardHeight > 0 ? px(Dialog.keyboardHeight) : isEditLarge ? 0 : marginPx,
                },
            }, [
                m(this.getDialogStyle(dialogType), {
                    role: "dialog" /* AriaWindow.Dialog */,
                    "aria-modal": "true",
                    "aria-labelledby": "dialog-title",
                    "aria-describedby": "dialog-message",
                    onclick: (e) => e.stopPropagation(),
                    // do not propagate clicks on the dialog as the Modal expects all propagated clicks to be clicks on the background
                    oncreate: (vnode) => {
                        this.domDialog = vnode.dom;
                        let animation = null;
                        if (isEditLarge) {
                            this.domDialog.style.transform = `translateY(${window.innerHeight}px)`;
                            animation = animations.add(this.domDialog, transform("translateY" /* TransformEnum.TranslateY */, window.innerHeight, 0));
                        }
                        else {
                            const bgcolor = getElevatedBackground();
                            const children = Array.from(this.domDialog.children);
                            for (let child of children) {
                                child.style.opacity = "0";
                            }
                            this.domDialog.style.backgroundColor = `rgba(0, 0, 0, 0)`;
                            animation = Promise.all([
                                animations.add(this.domDialog, alpha("backgroundColor" /* AlphaEnum.BackgroundColor */, bgcolor, 0, 1)),
                                animations.add(children, opacity(0, 1, true), {
                                    delay: DefaultAnimationTime / 2,
                                }),
                            ]);
                        }
                        // select first input field. blur first to avoid that users can enter text in the previously focused element while the animation is running
                        window.requestAnimationFrame(() => {
                            const activeElement = document.activeElement;
                            if (activeElement && typeof activeElement.blur === "function") {
                                activeElement.blur();
                            }
                        });
                        animation.then(() => {
                            this.focusOnLoadFunction(assertNotNull(this.domDialog));
                            this.wasFocusOnLoadCalled = true;
                            // Fall back to the CSS classes after completing the opening animation.
                            // Because `bgcolor` is only calculated on create and not on theme change.
                            if (this.domDialog != null && !isEditLarge) {
                                this.domDialog.style.removeProperty("background-color");
                            }
                        });
                    },
                }, m(childComponent)),
                this.injectionRightAttrs ? m(DialogInjectionRight, this.injectionRightAttrs) : null,
            ]));
        };
    }
    setInjectionRight(injectionRightAttrs) {
        this.injectionRightAttrs = injectionRightAttrs;
    }
    defaultFocusOnLoad(dom) {
        const inputs = Array.from(dom.querySelectorAll(INPUT));
        const scrollableWrapper = dom.querySelector(".dialog-container.scroll");
        if (inputs.length > 0) {
            inputs[0].focus();
        }
        else if (!scrollableWrapper) {
            let button = dom.querySelector("button");
            if (button) {
                button.focus();
            }
        }
        else {
            scrollableWrapper.tabIndex = Number("0" /* TabIndex.Default */);
            scrollableWrapper.focus();
        }
    }
    /**
     * By default the focus is set on the first text field after this dialog is fully visible. This behavior can be overwritten by calling this function.
     * If it has already been called, then calls it instantly
     */
    setFocusOnLoadFunction(callback) {
        this.focusOnLoadFunction = callback;
        if (this.wasFocusOnLoadCalled) {
            this.focusOnLoadFunction(assertNotNull(this.domDialog));
        }
    }
    getDialogWrapperClasses(dialogType) {
        // change direction of axis to handle resize of dialogs (iOS keyboard open changes size)
        let dialogWrapperStyle = ".fill-absolute.flex.items-stretch.flex-column";
        if (dialogType === "EditLarge" /* DialogType.EditLarge */) {
            dialogWrapperStyle += ".flex-start";
        }
        else {
            dialogWrapperStyle += ".flex-center"; // vertical alignment
        }
        return dialogWrapperStyle;
    }
    getDialogStyle(dialogType) {
        let dialogStyle = ".dialog.elevated-bg.flex-grow.border-radius-top";
        if (dialogType === "Progress" /* DialogType.Progress */) {
            dialogStyle += ".dialog-width-s.dialog-progress.border-radius-bottom";
        }
        else if (dialogType === "Alert" /* DialogType.Alert */) {
            dialogStyle += ".dialog-width-alert.pt.border-radius-bottom";
        }
        else if (dialogType === "Reminder" /* DialogType.Reminder */) {
            dialogStyle += ".dialog-width-m.pt.flex.flex-column.border-radius-bottom";
        }
        else if (dialogType === "EditSmall" /* DialogType.EditSmall */) {
            dialogStyle += ".dialog-width-s.flex.flex-column.border-radius-bottom";
        }
        else if (dialogType === "EditMedium" /* DialogType.EditMedium */) {
            dialogStyle += ".dialog-width-m.border-radius-bottom";
        }
        else if (dialogType === "EditLarge" /* DialogType.EditLarge */ || dialogType === "EditLarger" /* DialogType.EditLarger */) {
            dialogStyle += ".dialog-width-l";
        }
        return dialogStyle;
    }
    addShortcut(shortcut) {
        this._shortcuts.push(shortcut);
        if (this.visible) {
            keyManager.registerModalShortcuts([shortcut]);
        }
        return this;
    }
    /**
     * Sets a close handler to the dialog. If set the handler will be notified when onClose is called on the dialog.
     * The handler must is then responsible for closing the dialog.
     */
    setCloseHandler(closeHandler) {
        this.closeHandler = closeHandler;
        return this;
    }
    shortcuts() {
        return this._shortcuts;
    }
    show() {
        this.focusedBeforeShown = document.activeElement;
        modal.display(this);
        this.visible = true;
        return this;
    }
    /**
     * Removes the dialog from the current view.
     */
    close() {
        this.visible = false;
        modal.remove(this);
    }
    /**
     * Should be called to close a dialog. Notifies the closeHandler about the close attempt.
     */
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
    /**
     * Is invoked from modal as the two animations (background layer opacity and dropdown) should run in parallel
     * @returns {Promise.<void>}
     */
    hideAnimation() {
        let bgcolor = getElevatedBackground();
        if (this.domDialog) {
            return Promise.all([
                animations.add(this.domDialog.children, opacity(1, 0, true)),
                animations.add(this.domDialog, alpha("backgroundColor" /* AlphaEnum.BackgroundColor */, bgcolor, 1, 0), {
                    delay: DefaultAnimationTime / 2,
                    easing: ease.linear,
                }),
            ]).then(noOp);
        }
        else {
            return Promise.resolve();
        }
    }
    backgroundClick(e) { }
    /**
     * show a dialog with only a "ok" button
     *
     * @param messageIdOrMessageFunction the text to display
     * @param infoToAppend {?string | lazy<Children>} some text or UI elements to show below the message
     * @returns {Promise<void>} a promise that resolves after the dialog is fully closed
     */
    static message(messageIdOrMessageFunction, infoToAppend) {
        return new Promise((resolve) => {
            let dialog;
            const closeAction = () => {
                dialog.close();
                setTimeout(() => resolve(), DefaultAnimationTime);
            };
            let lines = lang.getTranslationText(messageIdOrMessageFunction).split("\n");
            let testId = `dialog:${lang.getTestId(messageIdOrMessageFunction)}`;
            if (typeof infoToAppend === "string") {
                lines.push(infoToAppend);
            }
            const buttonAttrs = {
                label: "ok_action",
                click: closeAction,
                type: "primary" /* ButtonType.Primary */,
            };
            dialog = new Dialog("Alert" /* DialogType.Alert */, {
                view: () => [
                    m(".dialog-max-height.dialog-contentButtonsBottom.text-break.text-prewrap.selectable.scroll", {
                        "data-testid": testId,
                    }, [lines.map((line) => m(".text-break.selectable", line)), typeof infoToAppend == "function" ? infoToAppend() : null]),
                    m(".flex-center.dialog-buttons", m(Button, buttonAttrs)),
                ],
            })
                .setCloseHandler(closeAction)
                .addShortcut({
                key: Keys.RETURN,
                shift: false,
                exec: closeAction,
                help: "close_alt",
            })
                .addShortcut({
                key: Keys.ESC,
                shift: false,
                exec: closeAction,
                help: "close_alt",
            })
                .show();
        });
    }
    /**
     * fallback for cases where we can't directly download and open a file
     */
    static legacyDownload(filename, url) {
        return new Promise((resolve) => {
            let dialog;
            const closeAction = () => {
                dialog.close();
                setTimeout(() => resolve(), DefaultAnimationTime);
            };
            const closeButtonAttrs = {
                label: "close_alt",
                click: closeAction,
                type: "primary" /* ButtonType.Primary */,
            };
            const downloadButtonAttrs = {
                label: "download_action",
                click: () => {
                    const popup = open("", "_blank");
                    if (popup) {
                        popup.location = url;
                    }
                    dialog.close();
                    resolve();
                },
                type: "primary" /* ButtonType.Primary */,
            };
            dialog = new Dialog("Alert" /* DialogType.Alert */, {
                view: () => m("", [
                    m(".dialog-contentButtonsBottom.text-break", [m(Button, downloadButtonAttrs), m(".pt", lang.get("saveDownloadNotPossibleIos_msg"))]),
                    m(".flex-center.dialog-buttons", m(Button, closeButtonAttrs)),
                ]),
            })
                .setCloseHandler(closeAction)
                .show();
        });
    }
    /**
     * Simpler version of {@link Dialog#confirmMultiple} with just two options: no and yes (or another confirmation).
     * @return Promise, which is resolved with user selection - true for confirm, false for cancel.
     */
    static confirm(messageIdOrMessageFunction, confirmId = "ok_action", infoToAppend) {
        return new Promise((resolve) => {
            const closeAction = (conf) => {
                dialog.close();
                setTimeout(() => resolve(conf), DefaultAnimationTime);
            };
            const buttonAttrs = [
                {
                    label: "cancel_action",
                    click: () => closeAction(false),
                    type: "secondary" /* ButtonType.Secondary */,
                },
                {
                    label: confirmId,
                    click: () => closeAction(true),
                    type: "primary" /* ButtonType.Primary */,
                },
            ];
            const dialog = Dialog.confirmMultiple(messageIdOrMessageFunction, buttonAttrs, resolve, infoToAppend);
        });
    }
    /**
     * Show a dialog with multiple selection options below the message.
     * @param messageIdOrMessageFunction which displayed in the body
     * @param buttons which are displayed below
     * @param onclose which is called on shortcut or when dialog is closed any other way (e.g. back navigation). Not called when pressing
     * one of the buttons.
     * @param infoToAppend additional UI elements to show below the message
     */
    static confirmMultiple(messageIdOrMessageFunction, buttons, onclose, infoToAppend) {
        let dialog;
        const closeAction = (positive) => {
            dialog.close();
            setTimeout(() => onclose && onclose(positive), DefaultAnimationTime);
        };
        // Wrap in a function to ensure that m() is called in every view() update for the infoToAppend
        function getContent() {
            const additionalChild = typeof infoToAppend === "string"
                ? m(".dialog-contentButtonsBottom.text-break.selectable", infoToAppend)
                : typeof infoToAppend === "function"
                    ? infoToAppend()
                    : null;
            return [lang.getTranslationText(messageIdOrMessageFunction), additionalChild];
        }
        dialog = new Dialog("Alert" /* DialogType.Alert */, {
            view: () => [
                m("#dialog-message.dialog-max-height.dialog-contentButtonsBottom.text-break.text-prewrap.selectable.scroll", getContent()),
                buttons.length === 0
                    ? null
                    : m(".flex-center.dialog-buttons", buttons.map((a) => m(Button, a))),
            ],
        })
            .setCloseHandler(() => closeAction(false))
            .addShortcut({
            key: Keys.ESC,
            shift: false,
            exec: () => closeAction(false),
            help: "cancel_action",
        });
        dialog.show();
        return dialog;
    }
    /** show a dialog with several buttons on the bottom and return the option that was selected.
     *
     * never resolves if the user escapes out of the dialog without selecting an option.
     * */
    static choice(message, choices) {
        return new Promise((resolve) => {
            const choose = (choice) => {
                dialog.close();
                setTimeout(() => resolve(choice), DefaultAnimationTime);
            };
            const buttonAttrs = choices.map((choice) => {
                return {
                    label: choice.text,
                    click: () => choose(choice.value),
                    type: "secondary" /* ButtonType.Secondary */,
                };
            });
            const dialog = Dialog.confirmMultiple(message, buttonAttrs);
        });
    }
    /**
     * Shows a (not-cancellable) multiple-choice dialog.
     * @returns the selected option.
     */
    static choiceVertical(message, choices) {
        return new Promise((resolve) => {
            const choose = (choice) => {
                dialog.close();
                setTimeout(() => resolve(choice), DefaultAnimationTime);
            };
            const buttonAttrs = choices.map((choice) => {
                return {
                    label: choice.text,
                    click: () => choose(choice.value),
                    type: choice.type === "primary" ? "primary" /* ButtonType.Primary */ : "secondary" /* ButtonType.Secondary */,
                };
            });
            // Wrap in a function to ensure that m() is called in every view() update for the infoToAppend
            function getContent() {
                return lang.getTranslationText(message);
            }
            const dialog = new Dialog("Alert" /* DialogType.Alert */, {
                view: () => m(".flex.flex-column.pl-l.pr-l.pb-s", [
                    m("#dialog-message.dialog-max-height.text-break.text-prewrap.selectable.scroll", getContent()),
                    buttonAttrs.length === 0
                        ? null
                        : m(".flex.flex-column", buttonAttrs.map((a) => m(Button, a))),
                ]),
            });
            dialog.show();
        });
    }
    /**
     * show a dialog (resp. monologue) with no buttons that can not be closed, not even with ESC.
     */
    static deadEnd(message) {
        const dialog = Dialog.confirmMultiple(message, []);
        dialog.addShortcut({
            key: Keys.ESC,
            shift: false,
            exec: noOp,
            help: "emptyString_msg",
        });
        dialog.addShortcut({
            key: Keys.F1,
            shift: false,
            exec: noOp,
            help: "emptyString_msg",
        });
    }
    // used in admin client
    static save(title, saveAction, child) {
        return new Promise((resolve) => {
            let saveDialog;
            const closeAction = () => {
                saveDialog.close();
                setTimeout(() => resolve(), DefaultAnimationTime);
            };
            const onOk = () => {
                saveAction().then(() => {
                    saveDialog.close();
                    setTimeout(() => resolve(), DefaultAnimationTime);
                });
            };
            const actionBarAttrs = {
                left: [
                    {
                        label: "close_alt",
                        click: closeAction,
                        type: "secondary" /* ButtonType.Secondary */,
                    },
                ],
                right: [
                    {
                        label: "save_action",
                        click: onOk,
                        type: "primary" /* ButtonType.Primary */,
                    },
                ],
                middle: lang.makeTranslation("title", title()),
            };
            saveDialog = new Dialog("EditMedium" /* DialogType.EditMedium */, {
                view: () => m("", [m(DialogHeaderBar, actionBarAttrs), m(".plr-l.pb.text-break", m(child))]),
            })
                .setCloseHandler(closeAction)
                .show();
        });
    }
    static reminder(title, message) {
        return new Promise((resolve) => {
            let dialog;
            const closeAction = (res) => {
                dialog.close();
                setTimeout(() => resolve(res), DefaultAnimationTime);
            };
            const buttonAttrs = [
                {
                    label: "upgradeReminderCancel_action",
                    click: () => closeAction(false),
                    type: "secondary" /* ButtonType.Secondary */,
                },
                {
                    label: "showMoreUpgrade_action",
                    click: () => closeAction(true),
                    type: "primary" /* ButtonType.Primary */,
                },
            ];
            dialog = new Dialog("Reminder" /* DialogType.Reminder */, {
                view: () => [
                    m(".dialog-contentButtonsBottom.text-break.scroll", [
                        m(".h2.pb", title),
                        m(".flex-direction-change.items-center", [
                            m("#dialog-message.pb", message),
                            m("img[src=" + HabReminderImage + "].dialog-img.mb.bg-white.border-radius", {
                                style: {
                                    "min-width": "150px",
                                },
                            }),
                        ]),
                    ]),
                    m(".flex-center.dialog-buttons.flex-no-grow-no-shrink-auto", buttonAttrs.map((a) => m(Button, a))),
                ],
            })
                .setCloseHandler(() => closeAction(false))
                .addShortcut({
                key: Keys.ESC,
                shift: false,
                exec: () => closeAction(false),
                help: "cancel_action",
            })
                .show();
        });
    }
    /**
     * Shows a dialog with a text field input and ok/cancel buttons.
     * @param   props.child either a component (object with view function that returns a Children) or a naked view Function
     * @param   props.validator Called when "Ok" is clicked. Must return null if the input is valid or an error messageID if it is invalid, so an error message is shown.
     * @param   props.okAction called after successful validation.
     * @param   props.cancelAction called when allowCancel is true and the cancel button/shortcut was pressed.
     * @returns the Dialog
     */
    static showActionDialog(props) {
        let dialog = this.createActionDialog(props);
        return dialog.show();
    }
    static createActionDialog(props) {
        let dialog;
        const { title, child, okAction, validator, allowCancel, allowOkWithReturn, okActionTextId, cancelActionTextId, cancelAction, type } = Object.assign({}, {
            allowCancel: true,
            allowOkWithReturn: false,
            okActionTextId: "ok_action",
            cancelActionTextId: "cancel_action",
            type: "EditSmall" /* DialogType.EditSmall */,
            errorMessageStream: Stream(DEFAULT_ERROR), // No error = errorMessageStream value is an empty string ""
        }, props);
        const doCancel = () => {
            if (cancelAction) {
                cancelAction(dialog);
            }
            dialog.close();
        };
        const doAction = () => {
            if (!okAction) {
                return;
            }
            let validationResult = null;
            if (validator) {
                validationResult = validator();
            }
            let finalizer = Promise.resolve(validationResult).then((error_id) => {
                if (error_id) {
                    Dialog.message(error_id);
                }
                else {
                    okAction(dialog);
                }
            });
            if (validationResult instanceof Promise) {
                // breaking hard circular dependency
                import("../dialogs/ProgressDialog").then((module) => module.showProgressDialog("pleaseWait_msg", finalizer));
            }
        };
        const actionBarAttrs = {
            left: mapLazily(allowCancel, (allow) => allow
                ? [
                    {
                        label: cancelActionTextId,
                        click: doCancel,
                        type: "secondary" /* ButtonType.Secondary */,
                    },
                ]
                : []),
            right: okAction
                ? [
                    {
                        label: okActionTextId,
                        click: doAction,
                        type: "primary" /* ButtonType.Primary */,
                    },
                ]
                : [],
            middle: title,
        };
        dialog = new Dialog(type, {
            view: () => [
                m(DialogHeaderBar, actionBarAttrs),
                m(".dialog-max-height.plr-l.pb.text-break.scroll", ["function" === typeof child ? child() : m(child)]),
            ],
        }).setCloseHandler(doCancel);
        dialog.addShortcut({
            key: Keys.ESC,
            shift: false,
            exec: mapLazily(allowCancel, (allow) => allow && doCancel()),
            help: "cancel_action",
            enabled: getAsLazy(allowCancel),
        });
        if (allowOkWithReturn) {
            dialog.addShortcut({
                key: Keys.RETURN,
                shift: false,
                exec: doAction,
                help: "ok_action",
            });
        }
        return dialog;
    }
    /**
     * Shows a dialog with a text field input and ok/cancel buttons.
     * @returns A promise resolving to the entered text. The returned promise is only resolved if "ok" is clicked.
     */
    static showTextInputDialog(props) {
        return new Promise((resolve) => {
            Dialog.showProcessTextInputDialog(props, async (value) => resolve(value));
        });
    }
    /**
     * Shows a dialog with a text field input and ok/cancel buttons. In contrast to {@link showTextInputDialog} the entered text is not returned but processed in the okAction.
     */
    static showProcessTextInputDialog(props, okAction) {
        let textFieldType = props.textFieldType ?? "text" /* TextFieldType.Text */;
        let result = props.defaultValue ?? "";
        Dialog.showActionDialog({
            title: props.title,
            child: () => m(TextField, {
                label: props.label,
                value: result,
                type: textFieldType,
                oninput: (newValue) => (result = newValue),
                helpLabel: () => (props.infoMsgId ? lang.getTranslationText(props.infoMsgId) : ""),
            }),
            validator: () => (props.inputValidator ? props.inputValidator(result) : null),
            allowOkWithReturn: true,
            okAction: async (dialog) => {
                try {
                    await okAction(result);
                    dialog.close();
                }
                catch (error) {
                    if (!isOfflineError(error)) {
                        dialog.close();
                    }
                    throw error;
                }
            },
        });
    }
    /**
     * Shows a dialog with a text area input and ok/cancel buttons.
     * @param titleId title of the dialog
     * @param labelIdOrLabelFunction label of the text area
     * @param infoMsgId help label of the text area
     * @param value initial value
     * @returns A promise resolving to the entered text. The returned promise is only resolved if "ok" is clicked.
     */
    static showTextAreaInputDialog(titleId, labelIdOrLabelFunction, infoMsgId, value) {
        return new Promise((resolve) => {
            let result = value;
            Dialog.showActionDialog({
                title: titleId,
                child: {
                    view: () => m(TextField, {
                        label: labelIdOrLabelFunction,
                        helpLabel: () => (infoMsgId ? lang.get(infoMsgId) : ""),
                        value: result,
                        oninput: (newValue) => (result = newValue),
                        type: "area" /* TextFieldType.Area */,
                    }),
                },
                okAction: (dialog) => {
                    resolve(result);
                    dialog.close();
                },
            });
        });
    }
    /**
     * Show a dialog with a dropdown selector
     * @param titleId title of the dialog
     * @param label label of the dropdown selector
     * @param infoMsgId help label of the dropdown selector
     * @param items selection set
     * @param initialValue initial value
     * @param dropdownWidth width of the dropdown
     * @returns A promise resolving to the selected item. The returned promise is only resolved if "ok" is clicked.
     */
    static showDropDownSelectionDialog(titleId, label, infoMsgId, items, initialValue, dropdownWidth) {
        let selectedValue = initialValue;
        return new Promise((resolve) => {
            Dialog.showActionDialog({
                title: titleId,
                child: {
                    view: () => 
                    // identity as type assertion
                    m(DropDownSelector, identity({
                        label,
                        items,
                        selectedValue: selectedValue,
                        selectionChangedHandler: (newValue) => (selectedValue = newValue),
                    })),
                },
                okAction: (dialog) => {
                    resolve(selectedValue);
                    dialog.close();
                },
            });
        });
    }
    /** @deprecated use editDialog*/
    static largeDialog(headerBarAttrs, child) {
        return new Dialog("EditLarge" /* DialogType.EditLarge */, {
            view: () => {
                return m("", [m(DialogHeaderBar, headerBarAttrs), m(".dialog-container.scroll", m(".fill-absolute.plr-l", m(child)))]);
            },
        });
    }
    static editDialog(headerBarAttrs, child, childAttrs) {
        return new Dialog("EditLarge" /* DialogType.EditLarge */, {
            view: () => m("", [
                /** fixed-height header with a title, left and right buttons that's fixed to the top of the dialog's area */
                headerBarAttrs.noHeader ? null : m(DialogHeaderBar, headerBarAttrs),
                /** variable-size child container that may be scrollable. */
                m(".dialog-container.scroll.hide-outline", m(".fill-absolute.plr-l", m(child, childAttrs))),
            ]),
        });
    }
    static editMediumDialog(headerBarAttrs, child, childAttrs, dialogStyle) {
        return new Dialog("EditMedium" /* DialogType.EditMedium */, {
            view: () => m(".flex.col.border-radius", { style: dialogStyle }, [
                /** fixed-height header with a title, left and right buttons that's fixed to the top of the dialog's area */
                headerBarAttrs.noHeader ? null : m(DialogHeaderBar, headerBarAttrs),
                /** variable-size child container that may be scrollable. */
                m(".scroll.hide-outline.plr-l.flex-grow", { style: { "overflow-x": "hidden" } }, m(child, childAttrs)),
            ]),
        });
    }
    static editSmallDialog(headerBarAttrs, child) {
        return new Dialog("EditSmall" /* DialogType.EditSmall */, {
            view: () => [
                /** fixed-height header with a title, left and right buttons that's fixed to the top of the dialog's area */
                headerBarAttrs.noHeader ? null : m(DialogHeaderBar, headerBarAttrs),
                /** variable-size child container that may be scrollable. */
                m(".scroll.hide-outline.plr-l", child()),
            ],
        });
    }
    static async viewerDialog(title, child, childAttrs) {
        return new Promise((resolve) => {
            let dialog;
            const close = () => {
                dialog.close();
                resolve();
            };
            const headerAttrs = {
                left: [
                    {
                        label: "close_alt",
                        click: close,
                        type: "secondary" /* ButtonType.Secondary */,
                    },
                ],
                middle: title,
            };
            dialog = Dialog.editDialog(headerAttrs, child, childAttrs)
                .setCloseHandler(close)
                .addShortcut({
                key: Keys.ESC,
                exec: close,
                help: "close_alt",
            })
                .show();
        });
    }
    static onKeyboardSizeChanged(newSize) {
        Dialog.keyboardHeight = newSize;
        m.redraw();
    }
}
windowFacade.addKeyboardSizeListener(Dialog.onKeyboardSizeChanged);
//# sourceMappingURL=Dialog.js.map