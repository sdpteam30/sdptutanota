import m from "mithril";
import stream from "mithril/stream";
import { Editor } from "./Editor.js";
import { lang } from "../../misc/LanguageViewModel";
import { px } from "../size";
import { htmlSanitizer } from "../../misc/HtmlSanitizer";
import { assertNotNull } from "@tutao/tutanota-utils";
import { DropDownSelector } from "../base/DropDownSelector.js";
import { RichTextToolbar } from "../base/RichTextToolbar.js";
export var HtmlEditorMode;
(function (HtmlEditorMode) {
    HtmlEditorMode["HTML"] = "html";
    HtmlEditorMode["WYSIWYG"] = "what you see is what you get";
})(HtmlEditorMode || (HtmlEditorMode = {}));
export const HTML_EDITOR_LINE_HEIGHT = 24; // Height required for one line in the HTML editor
export class HtmlEditor {
    label;
    injections;
    editor;
    mode = HtmlEditorMode.WYSIWYG;
    active = false;
    domTextArea = null;
    _showBorders = false;
    minHeight = null;
    placeholderId = null;
    placeholderDomElement = null;
    value = stream("");
    htmlMonospace = true;
    modeSwitcherLabel = null;
    toolbarEnabled = false;
    toolbarAttrs = {};
    staticLineAmount = null; // Static amount of lines the editor shall allow at all times
    constructor(label, injections) {
        this.label = label;
        this.injections = injections;
        this.editor = new Editor(null, (html) => htmlSanitizer.sanitizeFragment(html, { blockExternalContent: false }).fragment, null);
        this.view = this.view.bind(this);
        this.initializeEditorListeners();
    }
    view() {
        const modeSwitcherLabel = this.modeSwitcherLabel;
        let borderClasses = this._showBorders
            ? this.active && this.editor.isEnabled()
                ? ".editor-border-active.border-radius"
                : ".editor-border.border-radius." + (modeSwitcherLabel != null ? ".editor-no-top-border" : "")
            : "";
        const renderedInjections = this.injections?.() ?? null;
        const getPlaceholder = () => !this.active && this.isEmpty()
            ? m(".abs.text-ellipsis.noselect.z1.i.pr-s", {
                oncreate: (vnode) => (this.placeholderDomElement = vnode.dom),
                onclick: () => this.mode === HtmlEditorMode.WYSIWYG ? assertNotNull(this.editor.domElement).focus() : assertNotNull(this.domTextArea).focus(),
            }, this.placeholderId ? lang.get(this.placeholderId) : "")
            : null;
        return m(".html-editor" + (this.mode === HtmlEditorMode.WYSIWYG ? ".text-break" : ""), { class: this.editor.isEnabled() ? "" : "disabled" }, [
            modeSwitcherLabel != null
                ? m(DropDownSelector, {
                    label: modeSwitcherLabel,
                    items: [
                        { name: lang.get("richText_label"), value: HtmlEditorMode.WYSIWYG },
                        { name: lang.get("htmlSourceCode_label"), value: HtmlEditorMode.HTML },
                    ],
                    selectedValue: this.mode,
                    selectionChangedHandler: (mode) => {
                        this.mode = mode;
                        this.setValue(this.value());
                        this.initializeEditorListeners();
                    },
                })
                : null,
            this.label ? m(".small.mt-form", lang.getTranslationText(this.label)) : null,
            m(borderClasses, [
                getPlaceholder(),
                this.mode === HtmlEditorMode.WYSIWYG
                    ? m(".wysiwyg.rel.overflow-hidden.selectable", [
                        this.editor.isEnabled() && (this.toolbarEnabled || renderedInjections)
                            ? [
                                m(".flex-end.sticky.pb-2", [
                                    this.toolbarEnabled ? m(RichTextToolbar, Object.assign({ editor: this.editor }, this.toolbarAttrs)) : null,
                                    renderedInjections,
                                ]),
                                m("hr.hr.mb-s"),
                            ]
                            : null,
                        m(this.editor, {
                            oncreate: () => {
                                this.editor.initialized.promise.then(() => this.editor.setHTML(this.value()));
                            },
                            onremove: () => {
                                this.value(this.getValue());
                            },
                        }),
                    ])
                    : m(".html", m("textarea.input-area.selectable", {
                        oncreate: (vnode) => {
                            this.domTextArea = vnode.dom;
                            if (!this.isEmpty()) {
                                this.domTextArea.value = this.value();
                            }
                        },
                        onfocus: () => this.focus(),
                        onblur: () => this.blur(),
                        oninput: () => {
                            if (this.domTextArea) {
                                this.domTextArea.style.height = "0px";
                                this.domTextArea.style.height = this.domTextArea.scrollHeight + "px";
                            }
                        },
                        style: this.staticLineAmount
                            ? {
                                "max-height": px(this.staticLineAmount * HTML_EDITOR_LINE_HEIGHT),
                                "min-height": px(this.staticLineAmount * HTML_EDITOR_LINE_HEIGHT),
                                overflow: "scroll",
                            }
                            : {
                                "font-family": this.htmlMonospace ? "monospace" : "inherit",
                                "min-height": this.minHeight ? px(this.minHeight) : "initial",
                            },
                        disabled: !this.editor.isEnabled(),
                        readonly: this.editor.isReadOnly(),
                    })),
            ]),
        ]);
    }
    initializeEditorListeners() {
        this.editor.initialized.promise.then(() => {
            const dom = assertNotNull(this.editor?.domElement);
            dom.onfocus = () => this.focus();
            dom.onblur = () => this.blur();
        });
    }
    focus() {
        this.active = true;
        m.redraw();
    }
    blur() {
        this.active = false;
        if (this.mode === HtmlEditorMode.WYSIWYG) {
            this.value(this.editor.getValue());
        }
        else {
            this.value(assertNotNull(this.domTextArea).value);
        }
    }
    setModeSwitcher(label) {
        this.modeSwitcherLabel = label;
        return this;
    }
    showBorders() {
        this._showBorders = true;
        return this;
    }
    setMinHeight(height) {
        this.minHeight = height;
        this.editor.setMinHeight(height);
        return this;
    }
    /**
     * Sets a static amount 'n' of lines the Editor should always render/allow.
     * When using n+1 lines, the editor will instead begin to be scrollable.
     * Currently, this overwrites min-height.
     */
    setStaticNumberOfLines(numberOfLines) {
        this.staticLineAmount = numberOfLines;
        this.editor.setStaticNumberOfLines(numberOfLines);
        return this;
    }
    setPlaceholderId(placeholderId) {
        this.placeholderId = placeholderId;
        return this;
    }
    getValue() {
        if (this.mode === HtmlEditorMode.WYSIWYG) {
            if (this.editor.isAttached()) {
                return this.editor.getHTML();
            }
            else {
                return this.value();
            }
        }
        else {
            if (this.domTextArea) {
                return htmlSanitizer.sanitizeHTML(this.domTextArea.value, { blockExternalContent: false }).html;
            }
            else {
                return this.value();
            }
        }
    }
    /**
     * squire HTML editor usually has some HTML when appearing empty, sometimes we don't want that content.
     */
    getTrimmedValue() {
        return this.isEmpty() ? "" : this.getValue();
    }
    setValue(html) {
        if (this.mode === HtmlEditorMode.WYSIWYG) {
            this.editor.initialized.promise.then(() => this.editor.setHTML(html));
        }
        else if (this.domTextArea) {
            this.domTextArea.value = html;
        }
        this.value(html);
        return this;
    }
    setShowOutline(show) {
        this.editor.setShowOutline(show);
        return this;
    }
    isActive() {
        return this.active;
    }
    isEmpty() {
        // either nothing or default squire content
        return this.value() === "" || new RegExp(/^<div( dir=["'][A-z]*["'])?><br><\/div>$/).test(this.value());
    }
    /** set whether the dialog should be editable.*/
    setEnabled(enabled) {
        this.editor.setEnabled(enabled);
        if (this.domTextArea) {
            this.domTextArea.disabled = !enabled;
        }
        return this;
    }
    setReadOnly(readOnly) {
        this.editor.setReadOnly(readOnly);
        if (this.domTextArea) {
            this.domTextArea.readOnly = readOnly;
        }
        return this;
    }
    setMode(mode) {
        this.mode = mode;
        return this;
    }
    setHtmlMonospace(monospace) {
        this.htmlMonospace = monospace;
        return this;
    }
    /** show the rich text toolbar */
    enableToolbar() {
        this.toolbarEnabled = true;
        return this;
    }
    isToolbarEnabled() {
        return this.toolbarEnabled;
    }
    /** toggle the visibility of the rich text toolbar */
    toggleToolbar() {
        this.toolbarEnabled = !this.toolbarEnabled;
        return this;
    }
    setToolbarOptions(attrs) {
        this.toolbarAttrs = attrs;
        return this;
    }
}
//# sourceMappingURL=HtmlEditor.js.map