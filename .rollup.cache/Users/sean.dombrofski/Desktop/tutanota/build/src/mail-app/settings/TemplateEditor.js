import m from "mithril";
import { TextField } from "../../common/gui/base/TextField.js";
import { Dialog } from "../../common/gui/base/Dialog";
import { createDropdown } from "../../common/gui/base/Dropdown.js";
import { lang } from "../../common/misc/LanguageViewModel";
import { getLanguageName, TemplateEditorModel } from "./TemplateEditorModel";
import { locator } from "../../common/api/main/CommonLocator";
import { showUserError } from "../../common/misc/ErrorHandlerImpl";
import { UserError } from "../../common/api/main/UserError";
import { HtmlEditor } from "../../common/gui/editor/HtmlEditor";
import { ofClass } from "@tutao/tutanota-utils";
import { IconButton } from "../../common/gui/base/IconButton.js";
/**
 * Creates an Editor Popup in which you can create a new template or edit an existing one
 */
export function showTemplateEditor(template, templateGroupRoot) {
    const entityClient = locator.entityClient;
    const editorModel = new TemplateEditorModel(template, templateGroupRoot, entityClient);
    const dialogCloseAction = () => {
        dialog.close();
    };
    const saveAction = () => {
        editorModel
            .save()
            .then(() => {
            dialogCloseAction();
        })
            .catch(ofClass(UserError, showUserError));
    };
    let headerBarAttrs = {
        left: [
            {
                label: "cancel_action",
                click: dialogCloseAction,
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
        middle: editorModel.template._id ? "editTemplate_action" : "createTemplate_action",
    };
    const dialog = Dialog.editDialog(headerBarAttrs, TemplateEditor, {
        model: editorModel,
    });
    dialog.show();
}
class TemplateEditor {
    model;
    templateContentEditor;
    constructor(vnode) {
        this.model = vnode.attrs.model;
        this.templateContentEditor = new HtmlEditor("content_label").showBorders().setMinHeight(500).enableToolbar();
        this.model.setContentProvider(() => {
            return this.templateContentEditor.getValue();
        });
        // init all input fields
        this.model.title(this.model.template.title);
        this.model.tag(this.model.template.tag);
        const content = this.model.selectedContent();
        if (content) {
            this.templateContentEditor.setValue(content.text);
        }
    }
    view() {
        return m("", [
            m(TextField, {
                label: "title_placeholder",
                value: this.model.title(),
                oninput: this.model.title,
            }),
            m(TextField, {
                label: "shortcut_label",
                autocapitalize: "none" /* Autocapitalize.none */,
                value: this.model.tag(),
                oninput: this.model.tag,
            }),
            m(TextField, {
                label: "language_label",
                value: this.model.selectedContent() ? lang.getTranslationText(getLanguageName(this.model.selectedContent())) : "",
                injectionsRight: () => m(".flex.ml-between-s", [
                    this.model.getAddedLanguages().length > 1 ? [this.renderRemoveLangButton(), this.renderSelectLangButton()] : null,
                    this.renderAddLangButton(),
                ]),
                isReadOnly: true,
            }),
            m(this.templateContentEditor),
        ]);
    }
    renderAddLangButton() {
        return m(IconButton, {
            title: "addLanguage_action",
            icon: "Add" /* Icons.Add */,
            size: 1 /* ButtonSize.Compact */,
            click: createDropdown({
                lazyButtons: () => this.model
                    .getAdditionalLanguages()
                    .sort((a, b) => lang.get(a.textId).localeCompare(lang.get(b.textId)))
                    .map((lang) => this.createAddNewLanguageButtonAttrs(lang)),
                width: 250,
            }),
        });
    }
    renderSelectLangButton() {
        return m(IconButton, {
            title: "languages_label",
            icon: "Language" /* Icons.Language */,
            size: 1 /* ButtonSize.Compact */,
            click: createDropdown({
                lazyButtons: () => {
                    // save current content with language & create a dropdwon with all added languages & an option to add a new language
                    this.model.updateContent();
                    return this.model.template.contents.map((content) => {
                        return {
                            label: getLanguageName(content),
                            click: () => {
                                this.model.selectedContent(content);
                                this.templateContentEditor.setValue(content.text);
                            },
                        };
                    });
                },
            }),
        });
    }
    renderRemoveLangButton() {
        return m(IconButton, {
            title: "removeLanguage_action",
            icon: "Trash" /* Icons.Trash */,
            click: () => this.removeLanguage(),
            size: 1 /* ButtonSize.Compact */,
        });
    }
    removeLanguage() {
        return Dialog.confirm(lang.getTranslation("deleteLanguageConfirmation_msg", {
            "{language}": getLanguageName(this.model.selectedContent()),
        })).then((confirmed) => {
            if (confirmed) {
                this.model.removeContent();
                this.model.selectedContent(this.model.template.contents[0]);
                this.templateContentEditor.setValue(this.model.selectedContent().text);
            }
            return confirmed;
        });
    }
    createAddNewLanguageButtonAttrs(lang) {
        return {
            label: lang.textId,
            click: () => {
                // save the current state of the content editor in the model,
                // because we will overwrite it when a new language is added
                this.model.updateContent();
                const newContent = this.model.createContent(lang.code);
                this.model.selectedContent(newContent);
                this.templateContentEditor.setValue("");
            },
        };
    }
}
//# sourceMappingURL=TemplateEditor.js.map