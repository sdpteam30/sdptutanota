import m from "mithril";
import { assertNotNull } from "@tutao/tutanota-utils";
import { TextField } from "../../common/gui/base/TextField.js";
import { getLanguageCode } from "./TemplateEditorModel";
import { showTemplateEditor } from "./TemplateEditor";
import { Dialog } from "../../common/gui/base/Dialog";
import { lang, languageByCode } from "../../common/misc/LanguageViewModel";
import { TemplateGroupRootTypeRef } from "../../common/api/entities/tutanota/TypeRefs.js";
import { locator } from "../../common/api/main/CommonLocator";
import { TEMPLATE_SHORTCUT_PREFIX } from "../templates/model/TemplatePopupModel";
import { ActionBar } from "../../common/gui/base/ActionBar.js";
import { htmlSanitizer } from "../../common/misc/HtmlSanitizer.js";
export class TemplateDetailsViewer {
    template;
    entityClient;
    isReadOnly;
    // we're not memoizing the translated language name since this is not a proper mithril component and may stick around after a language
    // switch.
    sanitizedContents;
    constructor(template, entityClient, isReadOnly) {
        this.template = template;
        this.entityClient = entityClient;
        this.isReadOnly = isReadOnly;
        this.sanitizedContents = template.contents.map((emailTemplateContent) => ({
            text: htmlSanitizer.sanitizeHTML(emailTemplateContent.text, { blockExternalContent: false, allowRelativeLinks: true }).html,
            languageCodeTextId: languageByCode[getLanguageCode(emailTemplateContent)].textId,
        }));
    }
    renderView = () => {
        return m("#user-viewer.fill-absolute.scroll.plr-l.pb-floating", [this.renderTitleLine(), this.renderContent()]);
    };
    renderTitleLine() {
        return m(".flex.mt-l.center-vertically", [
            m(".h4.text-ellipsis", this.template.title),
            !this.isReadOnly()
                ? m(ActionBar, {
                    buttons: [
                        {
                            title: "edit_action",
                            icon: "Edit" /* Icons.Edit */,
                            click: () => this.editTemplate(),
                        },
                        {
                            title: "remove_action",
                            icon: "Trash" /* Icons.Trash */,
                            click: () => this.deleteTemplate(),
                        },
                    ],
                })
                : null,
        ]);
    }
    renderContent() {
        return m("", [
            m(TextField, {
                label: "shortcut_label",
                value: TEMPLATE_SHORTCUT_PREFIX + assertNotNull(this.template.tag, "template without tag!"),
                isReadOnly: true,
            }),
            this.sanitizedContents.map(({ text, languageCodeTextId }) => {
                return m(".flex.flex-column", [m(".h4.mt-l", lang.get(languageCodeTextId)), m(".editor-border.text-break", m.trust(text))]);
            }),
        ]);
    }
    async deleteTemplate() {
        if (!(await Dialog.confirm("deleteTemplate_msg")))
            return;
        await this.entityClient.erase(this.template);
    }
    async editTemplate() {
        const { template } = this;
        const groupRoot = await locator.entityClient.load(TemplateGroupRootTypeRef, assertNotNull(template._ownerGroup, "template without ownerGroup!"));
        showTemplateEditor(template, groupRoot);
    }
    entityEventsReceived(updates) {
        return Promise.resolve();
    }
}
//# sourceMappingURL=TemplateDetailsViewer.js.map