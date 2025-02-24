import { KnowledgeBaseDialogContent } from "./KnowledgeBaseDialogContent.js";
import { showTemplatePopupInEditor } from "../../templates/view/TemplatePopup.js";
import { lang } from "../../../common/misc/LanguageViewModel.js";
import { createDropdown } from "../../../common/gui/base/Dropdown.js";
import stream from "mithril/stream";
import { getSharedGroupName } from "../../../common/sharing/GroupUtils.js";
export function createKnowledgeBaseDialogInjection(knowledgeBase, templateModel, editor) {
    const knowledgebaseAttrs = {
        onTemplateSelect: (template) => {
            showTemplatePopupInEditor(templateModel, editor, template, "");
        },
        model: knowledgeBase,
    };
    const isDialogVisible = stream(false);
    return {
        visible: isDialogVisible,
        headerAttrs: _createHeaderAttrs(knowledgebaseAttrs, isDialogVisible),
        componentAttrs: knowledgebaseAttrs,
        component: KnowledgeBaseDialogContent,
    };
}
function _createHeaderAttrs(attrs, isDialogVisible) {
    return () => {
        const selectedEntry = attrs.model.selectedEntry();
        return selectedEntry ? createEntryViewHeader(selectedEntry, attrs.model) : createListViewHeader(attrs.model, isDialogVisible);
    };
}
function createEntryViewHeader(entry, model) {
    return {
        left: [
            {
                label: "back_action",
                click: () => model.selectedEntry(null),
                type: "secondary" /* ButtonType.Secondary */,
            },
        ],
        middle: "knowledgebase_label",
    };
}
function createListViewHeader(model, isDialogVisible) {
    return {
        left: () => [
            {
                label: "close_alt",
                click: () => isDialogVisible(false),
                type: "primary" /* ButtonType.Primary */,
            },
        ],
        middle: "knowledgebase_label",
        right: [createAddButtonAttrs(model)],
    };
}
function createAddButtonAttrs(model) {
    const templateGroupInstances = model.getTemplateGroupInstances();
    if (templateGroupInstances.length === 1) {
        return {
            label: "add_action",
            click: () => {
                showKnowledgeBaseEditor(null, templateGroupInstances[0].groupRoot);
            },
            type: "primary" /* ButtonType.Primary */,
        };
    }
    else {
        return {
            label: "add_action",
            type: "primary" /* ButtonType.Primary */,
            click: createDropdown({
                lazyButtons: () => templateGroupInstances.map((groupInstances) => {
                    return {
                        label: lang.makeTranslation("group_name", getSharedGroupName(groupInstances.groupInfo, model.userController, true)),
                        click: () => {
                            showKnowledgeBaseEditor(null, groupInstances.groupRoot);
                        },
                    };
                }),
            }),
        };
    }
}
function showKnowledgeBaseEditor(entryToEdit, groupRoot) {
    import("../../settings/KnowledgeBaseEditor.js").then((editor) => {
        editor.showKnowledgeBaseEditor(entryToEdit, groupRoot);
    });
}
//# sourceMappingURL=KnowledgeBaseDialog.js.map