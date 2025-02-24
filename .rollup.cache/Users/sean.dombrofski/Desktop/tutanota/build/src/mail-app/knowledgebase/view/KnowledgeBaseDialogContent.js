import m from "mithril";
import { KNOWLEDGEBASE_LIST_ENTRY_HEIGHT, KnowledgeBaseListEntry } from "./KnowledgeBaseListEntry.js";
import { lang } from "../../../common/misc/LanguageViewModel.js";
import stream from "mithril/stream";
import { KnowledgeBaseEntryView } from "./KnowledgeBaseEntryView.js";
import { NotFoundError } from "../../../common/api/common/error/RestError.js";
import { Dialog } from "../../../common/gui/base/Dialog.js";
import { TextField } from "../../../common/gui/base/TextField.js";
import { makeListSelectionChangedScrollHandler } from "../../../common/gui/base/GuiUtils.js";
import { ofClass } from "@tutao/tutanota-utils";
/**
 *  Renders the SearchBar and the pages (list, entry, template) of the knowledgeBase besides the MailEditor
 */
export class KnowledgeBaseDialogContent {
    _streams;
    filterValue = "";
    _selectionChangedListener;
    constructor() {
        this._streams = [];
    }
    oncreate({ attrs }) {
        const { model } = attrs;
        this._streams.push(stream.combine(() => {
            m.redraw();
        }, [model.selectedEntry, model.filteredEntries]));
    }
    onremove() {
        for (let stream of this._streams) {
            stream.end(true);
        }
    }
    view({ attrs }) {
        const model = attrs.model;
        const selectedEntry = model.selectedEntry();
        return selectedEntry
            ? m(KnowledgeBaseEntryView, {
                entry: selectedEntry,
                onTemplateSelected: (templateId) => {
                    model
                        .loadTemplate(templateId)
                        .then((fetchedTemplate) => {
                        attrs.onTemplateSelect(fetchedTemplate);
                    })
                        .catch(ofClass(NotFoundError, () => Dialog.message("templateNotExists_msg")));
                },
                readonly: model.isReadOnly(selectedEntry),
            })
            : [
                m(TextField, {
                    label: "filter_label",
                    value: this.filterValue,
                    oninput: (value) => {
                        this.filterValue = value;
                        model.filter(value);
                        m.redraw();
                    },
                }),
                this._renderKeywords(model),
                this._renderList(model, attrs),
            ];
    }
    _renderKeywords(model) {
        const matchedKeywords = model.getMatchedKeywordsInContent();
        return m(".flex.mt-s.wrap", [
            matchedKeywords.length > 0 ? m(".small.full-width", lang.get("matchingKeywords_label")) : null,
            matchedKeywords.map((keyword) => {
                return m(".keyword-bubble-no-padding.plr-button.pl-s.pr-s.border-radius.no-wrap.mr-s.min-content", keyword);
            }),
        ]);
    }
    _renderList(model, attrs) {
        return m(".mt-s.scroll", {
            oncreate: (vnode) => {
                this._selectionChangedListener = model.selectedEntry.map(makeListSelectionChangedScrollHandler(vnode.dom, KNOWLEDGEBASE_LIST_ENTRY_HEIGHT, model.getSelectedEntryIndex.bind(model)));
            },
            onbeforeremove: () => {
                this._selectionChangedListener.end();
            },
        }, [
            model.containsResult()
                ? model.filteredEntries().map((entry) => this._renderListEntry(model, entry))
                : m(".center", lang.get("noEntryFound_label")),
        ]);
    }
    _renderListEntry(model, entry) {
        return m(".flex.flex-column.click.hoverable-list-item", [
            m(".flex", {
                onclick: () => {
                    model.selectedEntry(entry);
                },
            }, [
                m(KnowledgeBaseListEntry, {
                    entry: entry,
                }),
                m("", {
                    style: {
                        width: "17.1px",
                        height: "16px",
                    },
                }),
            ]),
        ]);
    }
}
//# sourceMappingURL=KnowledgeBaseDialogContent.js.map