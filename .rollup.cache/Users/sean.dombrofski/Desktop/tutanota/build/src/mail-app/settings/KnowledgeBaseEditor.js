import m from "mithril";
import { KnowledgeBaseEditorModel } from "./KnowledgeBaseEditorModel";
import { noOp, ofClass } from "@tutao/tutanota-utils";
import { TextField } from "../../common/gui/base/TextField.js";
import { Dialog } from "../../common/gui/base/Dialog";
import { lang } from "../../common/misc/LanguageViewModel";
import { locator } from "../../common/api/main/CommonLocator";
import { createAsyncDropdown } from "../../common/gui/base/Dropdown.js";
import { showUserError } from "../../common/misc/ErrorHandlerImpl";
import { elementIdPart, getLetId, listIdPart } from "../../common/api/common/utils/EntityUtils";
import { HtmlEditor } from "../../common/gui/editor/HtmlEditor";
import { UserError } from "../../common/api/main/UserError";
import { TEMPLATE_SHORTCUT_PREFIX } from "../templates/model/TemplatePopupModel";
/**
 *  Editor to edit / add a knowledgeBase entry
 *  Returned promise resolves when the dialog closes
 */
export function showKnowledgeBaseEditor(entry, templateGroupRoot) {
    const { entityClient } = locator;
    const editorModel = new KnowledgeBaseEditorModel(entry, templateGroupRoot, entityClient);
    const closeDialog = () => {
        dialog.close();
    };
    const saveAction = () => {
        editorModel.save().then(closeDialog).catch(ofClass(UserError, showUserError));
    };
    const headerBarAttrs = {
        left: [
            {
                label: "cancel_action",
                click: closeDialog,
                type: "secondary" /* ButtonType.Secondary */,
            },
        ],
        right: [
            {
                label: "save_action",
                click: saveAction,
                type: "primary" /* ButtonType.Primary */,
            },
        ],
        middle: editorModel.entry._id ? "editEntry_label" : "createEntry_action",
    };
    const dialog = Dialog.editDialog(headerBarAttrs, KnowledgeBaseEditor, editorModel);
    dialog.show();
}
class KnowledgeBaseEditor {
    entryContentEditor;
    linkedTemplateButtonAttrs;
    constructor(vnode) {
        const model = vnode.attrs;
        this.linkedTemplateButtonAttrs = {
            title: "linkTemplate_label",
            icon: "Add" /* Icons.Add */,
            colors: "elevated" /* ButtonColor.Elevated */,
            click: (e, dom) => {
                e.stopPropagation();
                createAsyncDropdown({
                    lazyButtons: () => this._createDropdownChildAttrs(model),
                })(e, dom);
            },
            size: 1 /* ButtonSize.Compact */,
        };
        this.entryContentEditor = new HtmlEditor("content_label")
            .showBorders()
            .setMinHeight(500)
            .enableToolbar()
            .setToolbarOptions({
            customButtonAttrs: [this.linkedTemplateButtonAttrs],
        });
        model.setDescriptionProvider(() => {
            return this.entryContentEditor.getValue();
        });
        if (model.isUpdate()) {
            this.entryContentEditor.setValue(model.entry.description);
        }
    }
    _createDropdownChildAttrs(model) {
        return model.availableTemplates.getAsync().then((templates) => {
            if (templates.length > 0) {
                return templates.map((template) => {
                    return {
                        label: lang.makeTranslation("tag", template.tag),
                        click: () => this.entryContentEditor.editor.insertHTML(createTemplateLink(template)),
                    };
                });
            }
            else {
                return [
                    {
                        label: "noEntries_msg",
                        click: noOp,
                    },
                ];
            }
        });
    }
    view(vnode) {
        const model = vnode.attrs;
        return m("", [
            m(TextField, {
                label: "title_placeholder",
                value: model.title(),
                oninput: model.title,
            }),
            m(TextField, {
                label: "keywords_label",
                value: model.keywords(),
                oninput: model.keywords,
            }),
            m(this.entryContentEditor),
        ]);
    }
}
function createTemplateLink(template) {
    const listId = listIdPart(getLetId(template));
    const elementId = elementIdPart(getLetId(template));
    return `<a href="tutatemplate:${listId}/${elementId}">${TEMPLATE_SHORTCUT_PREFIX + template.tag}</a>`;
}
//# sourceMappingURL=KnowledgeBaseEditor.js.map