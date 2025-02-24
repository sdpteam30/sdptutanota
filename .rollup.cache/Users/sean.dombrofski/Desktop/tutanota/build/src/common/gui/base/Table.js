import m from "mithril";
import { lang } from "../../misc/LanguageViewModel";
import { progressIcon } from "./Icon";
import { downcast, neverNull } from "@tutao/tutanota-utils";
import { createDropdown } from "./Dropdown.js";
import { assertMainOrNode } from "../../api/common/Env";
import { IconButton } from "./IconButton.js";
import { px, size } from "../size.js";
import { InfoIcon } from "./InfoIcon.js";
assertMainOrNode();
/**
 * Shows a table of TableLine entries. The last column of the table may show action buttons for each TableLine and/or an add button.
 * The table shows a loading spinner until updateEntries() is called the first time.
 */
export class Table {
    view(vnode) {
        const a = vnode.attrs;
        const loading = !a.lines;
        const alignments = a.columnAlignments || [];
        const lineAttrs = a.lines
            ? a.lines.map((lineAttrs) => this.createLine(lineAttrs, a.showActionButtonColumn, a.columnWidths, false, alignments, false))
            : [];
        return m("", { class: a.class }, [
            m(`table.table${a.columnHeading ? ".table-header-border" : ""}`, [
                (a.columnHeading
                    ? [
                        this.createLine({
                            cells: () => a.columnHeading.map((header) => {
                                const text = this.isTableHeading(header) ? header.label : header;
                                const info = this.isTableHeading(header) && header.helpText ? [lang.getTranslationText(header.helpText)] : undefined;
                                return {
                                    main: lang.getTranslationText(text),
                                    info: info,
                                };
                            }),
                            actionButtonAttrs: loading ? null : a.addButtonAttrs,
                        }, a.showActionButtonColumn, a.columnWidths, true, alignments, a.verticalColumnHeadings ?? false, true),
                    ]
                    : []).concat(lineAttrs),
            ]),
            loading ? m(".flex-center.items-center.button-height", progressIcon()) : null,
            !loading && neverNull(a.lines).length === 0 ? m(".flex-center.items-center.button-height", lang.get("noEntries_msg")) : null,
        ]);
    }
    isTableHeading(textIdOrFunction) {
        return textIdOrFunction.label !== undefined;
    }
    createLine(lineAttrs, showActionButtonColumn, columnWidths, bold, columnAlignments, verticalText, useHelpButton = false) {
        let cells;
        if (typeof lineAttrs.cells == "function") {
            cells = lineAttrs.cells().map((cellTextData, index) => m("td" + columnWidths[index], m("", { class: useHelpButton ? "flex items-center height-100p full-width" : "" }, m(".text-ellipsis.pr.pt-s" +
                (bold ? ".b" : "") +
                (cellTextData.click ? ".click" : "" + (cellTextData.mainStyle ? cellTextData.mainStyle : "")) +
                (columnAlignments[index] ? ".right" : ""), {
                title: cellTextData.main,
                // show the text as tooltip, so ellipsed lines can be shown
                onclick: cellTextData.click
                    ? (event) => {
                        const dom = downcast(event.target);
                        cellTextData.click(event, dom);
                    }
                    : undefined,
            }, verticalText ? m("span.vertical-text", cellTextData.main) : cellTextData.main), Table.renderHelpText(cellTextData, useHelpButton))));
        }
        else {
            cells = lineAttrs.cells.map((text, index) => m("td.text-ellipsis.pr.pt-s.pb-s." + columnWidths[index] + (bold ? ".b" : "") + (columnAlignments[index] ? ".right" : ""), {
                title: text, // show the text as tooltip, so ellipsed lines can be shown
            }, verticalText ? m("span.vertical-text", text) : text));
        }
        if (showActionButtonColumn) {
            cells.push(m("td", {
                style: {
                    width: px(size.button_height_compact),
                },
            }, lineAttrs.actionButtonAttrs ? m(IconButton, lineAttrs.actionButtonAttrs) : []));
        }
        return m("tr.selectable", cells);
    }
    static renderHelpText(cellTextData, useHelpButton) {
        const info = cellTextData.info;
        if (info == null) {
            return undefined;
        }
        if (useHelpButton) {
            return m(InfoIcon, { text: info.join("\n") });
        }
        else {
            return m(".small.text-ellipsis.pr" + (cellTextData.click ? ".click" : ""), {
                onclick: cellTextData.click
                    ? (event) => {
                        const dom = downcast(event.target);
                        cellTextData.click(event, dom);
                    }
                    : undefined,
            }, info.map((line) => m("", line)));
        }
    }
}
export function createRowActions(instance, currentElement, indexOfElement, prefixActions = []) {
    const elements = instance.getArray();
    const makeButtonAttrs = () => [
        ...prefixActions,
        indexOfElement > 1
            ? {
                label: "moveToTop_action",
                click: () => {
                    elements.splice(indexOfElement, 1);
                    elements.unshift(currentElement);
                    instance.updateInstance();
                },
            }
            : null,
        indexOfElement > 0
            ? {
                label: "moveUp_action",
                click: () => {
                    let prev = elements[indexOfElement - 1];
                    elements[indexOfElement - 1] = currentElement;
                    elements[indexOfElement] = prev;
                    instance.updateInstance();
                },
            }
            : null,
        indexOfElement < instance.getArray().length - 1
            ? {
                label: "moveDown_action",
                click: () => {
                    let next = elements[indexOfElement + 1];
                    elements[indexOfElement + 1] = currentElement;
                    elements[indexOfElement] = next;
                    instance.updateInstance();
                },
            }
            : null,
        indexOfElement < instance.getArray().length - 2
            ? {
                label: "moveToBottom_action",
                click: () => {
                    elements.splice(indexOfElement, 1);
                    elements.push(currentElement);
                    instance.updateInstance();
                },
            }
            : null,
        {
            label: "delete_action",
            click: () => {
                elements.splice(indexOfElement, 1);
                instance.updateInstance();
            },
        },
    ];
    return {
        title: "edit_action",
        click: createDropdown({ lazyButtons: makeButtonAttrs, width: 260 }),
        icon: "More" /* Icons.More */,
        size: 1 /* ButtonSize.Compact */,
    };
}
//# sourceMappingURL=Table.js.map