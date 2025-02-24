import m from "mithril";
import SquireEditor from "squire-rte";
import { defer } from "@tutao/tutanota-utils";
import { px } from "../size";
import { Dialog } from "../base/Dialog";
import { isMailAddress } from "../../misc/FormatValidator";
import { HTML_EDITOR_LINE_HEIGHT } from "./HtmlEditor.js";
export class Editor {
    minHeight;
    sanitizer;
    staticLineAmount;
    squire;
    initialized = defer();
    domElement = null;
    showOutline = false;
    enabled = true;
    readOnly = false;
    createsLists = true;
    userHasPasted = false;
    styleActions = Object.freeze({
        b: [() => this.squire.bold(), () => this.squire.removeBold(), () => this.styles.b],
        i: [() => this.squire.italic(), () => this.squire.removeItalic(), () => this.styles.i],
        u: [() => this.squire.underline(), () => this.squire.removeUnderline(), () => this.styles.u],
        c: [() => this.squire.setFontFace("monospace"), () => this.squire.setFontFace(null), () => this.styles.c],
        a: [() => this.makeLink(), () => this.squire.removeLink(), () => this.styles.a],
    });
    styles = {
        b: false,
        i: false,
        u: false,
        c: false,
        a: false,
        alignment: "left",
        listing: null,
    };
    /**
     * squire 2.0 removed the isPaste argument from the sanitizeToDomFragment function.
     * since sanitizeToDomFragment is called before squire's willPaste event is fired, we
     * can't have our sanitization strategy depend on the willPaste event.
     *
     * we therefore add our own paste handler to the dom element squire uses and set a
     * flag once we detect a paste and reset it when squire next fires the "input" event.
     *
     * * user pastes
     * * "paste" event on dom sets flag
     * * sanitizeToDomFragment is called by squire
     * * "input" event on squire resets flag.
     */
    pasteListener = (_) => (this.userHasPasted = true);
    constructor(minHeight, sanitizer, staticLineAmount) {
        this.minHeight = minHeight;
        this.sanitizer = sanitizer;
        this.staticLineAmount = staticLineAmount;
        this.onremove = this.onremove.bind(this);
        this.onbeforeupdate = this.onbeforeupdate.bind(this);
        this.view = this.view.bind(this);
    }
    onbeforeupdate() {
        // do not update the dom part managed by squire
        return this.squire == null;
    }
    onremove() {
        this.domElement?.removeEventListener("paste", this.pasteListener);
        if (this.squire) {
            this.squire.destroy();
            this.squire = null;
            this.initialized = defer();
        }
    }
    view() {
        return m(".selectable", {
            role: "textbox",
            "aria-multiline": "true",
            "data-testid": "text_editor",
            tabindex: "0" /* TabIndex.Default */,
            oncreate: (vnode) => this.initSquire(vnode.dom),
            class: `flex-grow ${this.showOutline ? "" : "hide-outline"}`,
            style: this.staticLineAmount
                ? {
                    "max-height": px(this.staticLineAmount * HTML_EDITOR_LINE_HEIGHT),
                    "min-height:": px(this.staticLineAmount * HTML_EDITOR_LINE_HEIGHT),
                    overflow: "scroll",
                }
                : this.minHeight
                    ? {
                        "min-height": px(this.minHeight),
                    }
                    : {},
        });
    }
    isEmpty() {
        return !this.squire || this.squire.getHTML() === "<div><br></div>";
    }
    getValue() {
        return this.isEmpty() ? "" : this.squire.getHTML();
    }
    addChangeListener(callback) {
        this.squire.addEventListener("input", callback);
    }
    setMinHeight(minHeight) {
        this.minHeight = minHeight;
        return this;
    }
    setShowOutline(show) {
        this.showOutline = show;
    }
    /**
     * Sets a static amount 'n' of lines the Editor should always render/allow.
     * When using n+1 lines, the editor will instead begin to be scrollable.
     * Currently, this overwrites min-height.
     */
    setStaticNumberOfLines(numberOfLines) {
        this.staticLineAmount = numberOfLines;
        return this;
    }
    setCreatesLists(createsLists) {
        this.createsLists = createsLists;
        return this;
    }
    initSquire(domElement) {
        this.squire = new SquireEditor(domElement, {
            sanitizeToDOMFragment: (html) => this.sanitizer(html, this.userHasPasted),
            blockAttributes: {
                dir: "auto",
            },
        });
        // Suppress paste events if pasting while disabled
        this.squire.addEventListener("willPaste", (e) => {
            if (!this.isEnabled()) {
                e.preventDefault();
            }
        });
        this.squire.addEventListener("input", (_) => (this.userHasPasted = false));
        domElement.addEventListener("paste", this.pasteListener);
        this.squire.addEventListener("pathChange", () => {
            this.getStylesAtPath();
            m.redraw(); // allow richtexttoolbar to redraw elements
        });
        this.domElement = domElement;
        // the _editor might have been disabled before the dom element was there
        this.setEnabled(this.enabled);
        this.initialized.resolve();
    }
    setEnabled(enabled) {
        this.enabled = enabled;
        this.updateContentEditableAttribute();
    }
    setReadOnly(readOnly) {
        this.readOnly = readOnly;
        this.updateContentEditableAttribute();
    }
    isReadOnly() {
        return this.readOnly;
    }
    isEnabled() {
        return this.enabled;
    }
    setHTML(html) {
        this.squire.setHTML(html);
    }
    getHTML() {
        return this.squire.getHTML();
    }
    setStyle(state, style) {
        ;
        (state ? this.styleActions[style][0] : this.styleActions[style][1])();
    }
    hasStyle = (style) => (this.squire ? this.styleActions[style][2]() : false);
    getStylesAtPath = () => {
        if (!this.squire) {
            return;
        }
        let pathSegments = this.squire.getPath().split(">");
        // lists
        const ulIndex = pathSegments.lastIndexOf("UL");
        const olIndex = pathSegments.lastIndexOf("OL");
        if (ulIndex === -1) {
            if (olIndex > -1) {
                this.styles.listing = "ol";
            }
            else {
                this.styles.listing = null;
            }
        }
        else if (olIndex === -1) {
            if (ulIndex > -1) {
                this.styles.listing = "ul";
            }
            else {
                this.styles.listing = null;
            }
        }
        else if (olIndex > ulIndex) {
            this.styles.listing = "ol";
        }
        else {
            this.styles.listing = "ul";
        }
        //links
        this.styles.a = pathSegments.includes("A");
        // alignment
        let alignment = pathSegments.find((f) => f.includes("align"));
        if (alignment !== undefined) {
            switch (alignment.split(".")[1].substring(6)) {
                case "left":
                    this.styles.alignment = "left";
                    break;
                case "right":
                    this.styles.alignment = "right";
                    break;
                case "center":
                    this.styles.alignment = "center";
                    break;
                default:
                    this.styles.alignment = "justify";
            }
        }
        else {
            this.styles.alignment = "left";
        }
        // font
        this.styles.c = pathSegments.some((f) => f.includes("monospace"));
        // decorations
        this.styles.b = this.squire.hasFormat("b");
        this.styles.u = this.squire.hasFormat("u");
        this.styles.i = this.squire.hasFormat("i");
    };
    makeLink() {
        Dialog.showTextInputDialog({
            title: "makeLink_action",
            label: "url_label",
            textFieldType: "url" /* TextFieldType.Url */,
        }).then((url) => {
            if (isMailAddress(url, false)) {
                url = "mailto:" + url;
            }
            else if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("mailto:") && !url.startsWith("{")) {
                url = "https://" + url;
            }
            this.squire.makeLink(url);
        });
    }
    insertImage(srcAttr, attrs) {
        return this.squire.insertImage(srcAttr, attrs);
    }
    /**
     * Inserts the given html content at the current cursor position.
     */
    insertHTML(html) {
        this.squire.insertHTML(html);
    }
    getDOM() {
        return this.squire.getRoot();
    }
    getCursorPosition() {
        return this.squire.getCursorPosition();
    }
    focus() {
        this.squire.focus();
        this.getStylesAtPath();
    }
    isAttached() {
        return this.squire != null;
    }
    getSelectedText() {
        return this.squire.getSelectedText();
    }
    addEventListener(type, handler) {
        this.squire.addEventListener(type, handler);
    }
    setSelection(range) {
        this.squire.setSelection(range);
    }
    /**
     * Convenience function for this.isEnabled() && !this.isReadOnly()
     */
    isEditable() {
        return this.isEnabled() && !this.isReadOnly();
    }
    updateContentEditableAttribute() {
        if (this.domElement) {
            this.domElement.setAttribute("contenteditable", String(this.isEditable()));
        }
    }
}
//# sourceMappingURL=Editor.js.map