import { EmailTemplateTypeRef } from "../../common/api/entities/tutanota/TypeRefs.js";
import { createKnowledgeBaseEntry } from "../../common/api/entities/tutanota/TypeRefs.js";
import { clone, deduplicate, LazyLoaded, localeCompare, noOp, ofClass } from "@tutao/tutanota-utils";
import stream from "mithril/stream";
import { NotFoundError } from "../../common/api/common/error/RestError";
import { UserError } from "../../common/api/main/UserError";
import { createKnowledgeBaseEntryKeyword } from "../../common/api/entities/tutanota/TypeRefs.js";
export class KnowledgeBaseEditorModel {
    title;
    keywords;
    _entityClient;
    _templateGroupRoot;
    entry;
    availableTemplates;
    _descriptionProvider;
    constructor(entry, templateGroupInstances, entityClient) {
        this.title = stream(entry ? entry.title : "");
        this.keywords = stream(entry ? keywordsToString(entry.keywords) : "");
        this._entityClient = entityClient;
        this._templateGroupRoot = templateGroupInstances;
        this.entry = entry ? clone(entry) : createKnowledgeBaseEntry({ description: "", title: "", keywords: [] });
        this._descriptionProvider = null;
        this.availableTemplates = new LazyLoaded(() => {
            return this._entityClient.loadAll(EmailTemplateTypeRef, this._templateGroupRoot.templates);
        }, []);
    }
    isUpdate() {
        return this.entry._id != null;
    }
    save() {
        if (!this.title()) {
            return Promise.reject(new UserError("emptyTitle_msg"));
        }
        this.entry.title = this.title();
        this.entry.keywords = stringToKeywords(this.keywords());
        if (this._descriptionProvider) {
            this.entry.description = this._descriptionProvider();
        }
        if (this.entry._id) {
            return this._entityClient.update(this.entry).catch(ofClass(NotFoundError, noOp));
        }
        else {
            this.entry._ownerGroup = this._templateGroupRoot._id;
            return this._entityClient.setup(this._templateGroupRoot.knowledgeBase, this.entry);
        }
    }
    setDescriptionProvider(provider) {
        this._descriptionProvider = provider;
    }
}
/**
 * get keywords as a space separated string
 * @param keywords
 */
function keywordsToString(keywords) {
    return keywords.map((keyword) => keyword.keyword).join(" ");
}
function stringToKeywords(keywords) {
    return deduplicate(keywords.split(" ").filter(Boolean))
        .sort(localeCompare)
        .map((keyword) => createKnowledgeBaseEntryKeyword({
        keyword,
    }));
}
//# sourceMappingURL=KnowledgeBaseEditorModel.js.map