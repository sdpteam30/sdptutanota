import m from "mithril";
import { numberRange } from "@tutao/tutanota-utils";
import { size } from "../size";
import { createDropdown } from "./Dropdown.js";
import { lang } from "../../misc/LanguageViewModel";
import { animations, height, opacity } from "../animation/Animations";
import { client } from "../../misc/ClientDetector";
import { ToggleButton } from "./buttons/ToggleButton.js";
import { IconButton } from "./IconButton.js";
export class RichTextToolbar {
    selectedSize = size.font_size_base;
    constructor({ attrs }) {
        try {
            this.selectedSize = parseInt(attrs.editor.squire.getFontInfo().size.slice(0, -2));
        }
        catch (e) {
            this.selectedSize = size.font_size_base;
        }
    }
    oncreate(vnode) {
        const dom = vnode.dom;
        dom.style.height = "0";
        animateToolbar(dom, true);
    }
    onbeforeremove(vnode) {
        return animateToolbar(vnode.dom, false);
    }
    view({ attrs }) {
        return m(".elevated-bg.overflow-hidden", {
            style: {
                top: "0px",
                position: client.browser === "Safari" /* BrowserType.SAFARI */
                    ? client.isMacOS
                        ? "-webkit-sticky" // safari on macos
                        : "inherit" // sticky changes the rendering order on iOS
                    : "sticky", // normal browsers
            },
        }, [
            m(".flex-end.wrap.items-center.mb-xs.mt-xs.ml-between-s", this.renderStyleButtons(attrs), this.renderCustomButtons(attrs), this.renderAlignDropDown(attrs), this.renderSizeButtons(attrs), this.renderRemoveFormattingButton(attrs)),
        ]);
    }
    renderStyleButtons(attrs) {
        const { editor, imageButtonClickHandler } = attrs;
        return [
            this.renderStyleToggleButton("b", lang.get("formatTextBold_msg") + " (Ctrl + B)", "Bold" /* Icons.Bold */, editor),
            this.renderStyleToggleButton("i", lang.get("formatTextItalic_msg") + " (Ctrl + I)", "Italic" /* Icons.Italic */, editor),
            this.renderStyleToggleButton("u", lang.get("formatTextUnderline_msg") + " (Ctrl + U)", "Underline" /* Icons.Underline */, editor),
            this.renderStyleToggleButton("c", lang.get("formatTextMonospace_msg"), "Code" /* Icons.Code */, editor),
            this.renderStyleToggleButton("a", editor.hasStyle("a") ? lang.get("breakLink_action") : lang.get("makeLink_action"), "Link" /* Icons.Link */, editor),
            this.renderListToggleButton("ol", lang.get("formatTextOl_msg") + " (Ctrl + Shift + 9)", "ListOrdered" /* Icons.ListOrdered */, editor),
            this.renderListToggleButton("ul", lang.get("formatTextUl_msg") + " (Ctrl + Shift + 8)", "ListUnordered" /* Icons.ListUnordered */, editor),
            imageButtonClickHandler
                ? m(IconButton, {
                    title: "insertImage_action",
                    click: (ev) => imageButtonClickHandler(ev, editor),
                    icon: "Picture" /* Icons.Picture */,
                    size: 1 /* ButtonSize.Compact */,
                })
                : null,
        ];
    }
    renderStyleToggleButton(style, title, icon, editor) {
        return this.renderToggleButton(lang.makeTranslation(title, title), icon, () => editor.setStyle(!editor.hasStyle(style), style), () => editor.hasStyle(style));
    }
    renderListToggleButton(listing, title, icon, editor) {
        return this.renderToggleButton(lang.makeTranslation(title, title), icon, () => editor.styles.listing === listing
            ? editor.squire.removeList()
            : listing === "ul"
                ? editor.squire.makeUnorderedList()
                : editor.squire.makeOrderedList(), () => editor.styles.listing === listing);
    }
    renderToggleButton(title, icon, click, isSelected) {
        return m(ToggleButton, {
            title: title,
            onToggled: click,
            icon: icon,
            toggled: isSelected(),
            size: 1 /* ButtonSize.Compact */,
        });
    }
    renderCustomButtons(attrs) {
        return (attrs.customButtonAttrs ?? []).map((attrs) => m(IconButton, attrs));
    }
    renderAlignDropDown(attrs) {
        if (attrs.alignmentEnabled === false) {
            return null;
        }
        const alignButtonAttrs = (alignment, title, icon) => {
            return {
                label: title,
                click: () => {
                    attrs.editor.squire.setTextAlignment(alignment);
                    setTimeout(() => attrs.editor.squire.focus(), 100); // blur for the editor is fired after the handler for some reason
                    m.redraw();
                },
                icon: icon,
            };
        };
        return m(IconButton, {
            // label: () => "▼",
            title: "formatTextAlignment_msg",
            icon: this.alignIcon(attrs),
            size: 1 /* ButtonSize.Compact */,
            click: (e, dom) => {
                e.stopPropagation();
                createDropdown({
                    width: 200,
                    lazyButtons: () => [
                        alignButtonAttrs("left", "formatTextLeft_msg", "AlignLeft" /* Icons.AlignLeft */),
                        alignButtonAttrs("center", "formatTextCenter_msg", "AlignCenter" /* Icons.AlignCenter */),
                        alignButtonAttrs("right", "formatTextRight_msg", "AlignRight" /* Icons.AlignRight */),
                        alignButtonAttrs("justify", "formatTextJustify_msg", "AlignJustified" /* Icons.AlignJustified */),
                    ],
                })(e, dom);
            },
        });
    }
    alignIcon(attrs) {
        switch (attrs.editor.styles.alignment) {
            case "left":
                return "AlignLeft" /* Icons.AlignLeft */;
            case "center":
                return "AlignCenter" /* Icons.AlignCenter */;
            case "right":
                return "AlignRight" /* Icons.AlignRight */;
            case "justify":
                return "AlignJustified" /* Icons.AlignJustified */;
        }
    }
    renderSizeButtons({ editor }) {
        return m(IconButton, {
            title: "formatTextFontSize_msg",
            icon: "FontSize" /* Icons.FontSize */,
            size: 1 /* ButtonSize.Compact */,
            click: (e, dom) => {
                e.stopPropagation();
                createDropdown({
                    lazyButtons: () => numberRange(8, 144).map((n) => {
                        return {
                            label: lang.makeTranslation("font_size_" + n, n.toString()),
                            click: () => {
                                editor.squire.setFontSize(n);
                                this.selectedSize = n;
                                setTimeout(() => editor.squire.focus(), 100); // blur for the editor is fired after the handler for some reason
                                m.redraw();
                            },
                        };
                    }),
                })(e, dom);
            },
        });
    }
    renderRemoveFormattingButton(attrs) {
        if (attrs.fontSizeEnabled === false) {
            return null;
        }
        return m(IconButton, {
            title: "removeFormatting_action",
            icon: "FormatClear" /* Icons.FormatClear */,
            click: (e) => {
                e.stopPropagation();
                attrs.editor.squire.removeAllFormatting();
            },
            size: 1 /* ButtonSize.Compact */,
        });
    }
}
export function animateToolbar(dom, appear) {
    let childHeight = Array.from(dom.children)
        .map((domElement) => domElement.offsetHeight)
        .reduce((current, previous) => Math.max(current, previous), 0);
    return animations.add(dom, [height(appear ? 0 : childHeight, appear ? childHeight : 0), appear ? opacity(0, 1, false) : opacity(1, 0, false)]).then(() => {
        if (appear) {
            dom.style.height = "";
        }
    });
}
//# sourceMappingURL=RichTextToolbar.js.map