import { lang, languageByCode, languages } from "../../common/misc/LanguageViewModel";
import { createEmailTemplateContent } from "../../common/api/entities/tutanota/TypeRefs.js";
import { clone, downcast } from "@tutao/tutanota-utils";
import { createEmailTemplate, EmailTemplateTypeRef } from "../../common/api/entities/tutanota/TypeRefs.js";
import stream from "mithril/stream";
import { difference, getFirstOrThrow, remove } from "@tutao/tutanota-utils";
import { getElementId, isSameId } from "../../common/api/common/utils/EntityUtils";
import { UserError } from "../../common/api/main/UserError";
export class TemplateEditorModel {
    template;
    title;
    tag;
    selectedContent;
    _templateGroupRoot;
    _entityClient;
    _contentProvider;
    constructor(template, templateGroupRoot, entityClient) {
        this.template = template ? clone(template) : createEmailTemplate({ tag: "", title: "", contents: [] });
        this.title = stream("");
        this.tag = stream("");
        const contents = this.template.contents;
        this.selectedContent = stream(contents.length > 0 ? getFirstOrThrow(contents) : this.createContent(lang.code));
        this._templateGroupRoot = templateGroupRoot;
        this._entityClient = entityClient;
        this._contentProvider = null;
    }
    isUpdate() {
        return this.template._id != null;
    }
    setContentProvider(provider) {
        this._contentProvider = provider;
    }
    createContent(languageCode) {
        const emailTemplateContent = createEmailTemplateContent({
            languageCode: languageCode,
            text: "",
        });
        this.template.contents.push(emailTemplateContent);
        return emailTemplateContent;
    }
    updateContent() {
        const selectedContent = this.selectedContent();
        if (selectedContent && this._contentProvider) {
            selectedContent.text = this._contentProvider();
        }
    }
    removeContent() {
        const content = this.selectedContent();
        if (content) {
            remove(this.template.contents, content);
        }
    }
    /**
     * Returns all languages that are available for creating new template content. Returns them in alphabetic order sorted by name.
     * @returns {Array<{name: string, value: LanguageCode}>}
     */
    getAdditionalLanguages() {
        return difference(languages, this.getAddedLanguages(), (lang1, lang2) => lang1.code === lang2.code);
    }
    getAddedLanguages() {
        return this.template.contents.map((content) => languageByCode[getLanguageCode(content)]);
    }
    tagAlreadyExists() {
        if (this.template._id) {
            // the current edited template should not be included in find()
            return this._entityClient.loadAll(EmailTemplateTypeRef, this._templateGroupRoot.templates).then((allTemplates) => {
                const filteredTemplates = allTemplates.filter((template) => !isSameId(getElementId(this.template), getElementId(template)));
                return filteredTemplates.some((template) => template.tag.toLowerCase() === this.template.tag.toLowerCase());
            });
        }
        else {
            return this._entityClient.loadAll(EmailTemplateTypeRef, this._templateGroupRoot.templates).then((allTemplates) => {
                return allTemplates.some((template) => template.tag.toLowerCase() === this.template.tag.toLowerCase());
            });
        }
    }
    save() {
        if (!this.title()) {
            return Promise.reject(new UserError("emptyTitle_msg"));
        }
        if (!this.tag()) {
            return Promise.reject(new UserError("emptyShortcut_msg"));
        }
        this.updateContent();
        this.template.title = this.title().trim();
        this.template.tag = this.tag().trim();
        return this.tagAlreadyExists().then(async (exists) => {
            if (exists) {
                return Promise.reject(new UserError("templateShortcutExists_msg"));
            }
            else if (this.template._id) {
                return this._entityClient.update(this.template);
            }
            else {
                this.template._ownerGroup = this._templateGroupRoot._id;
                return this._entityClient.setup(this._templateGroupRoot.templates, this.template);
            }
        });
    }
}
export function getLanguageCode(content) {
    return downcast(content.languageCode);
}
export function getLanguageName(content) {
    return languageByCode[getLanguageCode(content)].textId;
}
//# sourceMappingURL=TemplateEditorModel.js.map