import { EmailTemplateTypeRef, KnowledgeBaseEntryTypeRef } from "../../../common/api/entities/tutanota/TypeRefs.js";
import { knowledgeBaseSearch } from "./KnowledgeBaseSearchFilter.js";
import { lang } from "../../../common/misc/LanguageViewModel.js";
import stream from "mithril/stream";
import { downcast, LazyLoaded, noOp, promiseMap, SortedArray } from "@tutao/tutanota-utils";
import { getElementId, getEtId, getLetId, isSameId } from "../../../common/api/common/utils/EntityUtils.js";
import { loadTemplateGroupInstance } from "../../templates/model/TemplatePopupModel.js";
import { hasCapabilityOnGroup } from "../../../common/sharing/GroupUtils.js";
import { isUpdateForTypeRef } from "../../../common/api/common/utils/EntityUpdateUtils.js";
export const SELECT_NEXT_ENTRY = "next";
function compareKnowledgeBaseEntriesForSort(entry1, entry2) {
    return entry1.title.localeCompare(entry2.title);
}
/**
 *   Model that holds main logic for the Knowledgebase.
 */
export class KnowledgeBaseModel {
    _allEntries;
    filteredEntries;
    selectedEntry;
    _allKeywords;
    _matchedKeywordsInContent;
    _filterValue;
    _eventController;
    _entityClient;
    _entityEventReceived;
    _groupInstances;
    _initialized;
    userController;
    constructor(eventController, entityClient, userController) {
        this._eventController = eventController;
        this._entityClient = entityClient;
        this.userController = userController;
        this._allEntries = SortedArray.empty(compareKnowledgeBaseEntriesForSort);
        this._allKeywords = [];
        this._matchedKeywordsInContent = [];
        this.filteredEntries = stream(this._allEntries.array);
        this.selectedEntry = stream(null);
        this._filterValue = "";
        this._entityEventReceived = (updates) => {
            return this._entityUpdate(updates);
        };
        this._eventController.addEntityListener(this._entityEventReceived);
        this._groupInstances = [];
        this._allKeywords = [];
        this.filteredEntries(this._allEntries.array);
        this.selectedEntry(this.containsResult() ? this.filteredEntries()[0] : null);
        this._initialized = new LazyLoaded(() => {
            const templateMemberships = this.userController.getTemplateMemberships();
            let newGroupInstances = [];
            return promiseMap(templateMemberships, (membership) => loadTemplateGroupInstance(membership, entityClient))
                .then((groupInstances) => {
                newGroupInstances = groupInstances;
                return loadKnowledgebaseEntries(groupInstances, entityClient);
            })
                .then((knowledgebaseEntries) => {
                this._allEntries.insertAll(knowledgebaseEntries);
                this._groupInstances = newGroupInstances;
                this.initAllKeywords();
                return this;
            });
        });
    }
    init() {
        return this._initialized.getAsync();
    }
    isInitialized() {
        return this._initialized.isLoaded();
    }
    getTemplateGroupInstances() {
        return this._groupInstances;
    }
    initAllKeywords() {
        this._allKeywords = [];
        this._matchedKeywordsInContent = [];
        for (const entry of this._allEntries.array) {
            for (const keyword of entry.keywords) {
                this._allKeywords.push(keyword.keyword);
            }
        }
    }
    isSelectedEntry(entry) {
        return this.selectedEntry() === entry;
    }
    containsResult() {
        return this.filteredEntries().length > 0;
    }
    getAllKeywords() {
        return this._allKeywords.sort();
    }
    getMatchedKeywordsInContent() {
        return this._matchedKeywordsInContent;
    }
    getLanguageFromTemplate(template) {
        const clientLanguage = lang.code;
        const hasClientLanguage = template.contents.some((content) => content.languageCode === clientLanguage);
        if (hasClientLanguage) {
            return clientLanguage;
        }
        return downcast(template.contents[0].languageCode);
    }
    sortEntriesByMatchingKeywords(emailContent) {
        this._matchedKeywordsInContent = [];
        const emailContentNoTags = emailContent.replace(/(<([^>]+)>)/gi, ""); // remove all html tags
        for (const keyword of this._allKeywords) {
            if (emailContentNoTags.includes(keyword)) {
                this._matchedKeywordsInContent.push(keyword);
            }
        }
        this._allEntries = SortedArray.from(this._allEntries.array, (a, b) => this._compareEntriesByMatchedKeywords(a, b));
        this._filterValue = "";
        this.filteredEntries(this._allEntries.array);
    }
    _compareEntriesByMatchedKeywords(entry1, entry2) {
        const difference = this._getMatchedKeywordsNumber(entry2) - this._getMatchedKeywordsNumber(entry1);
        return difference === 0 ? compareKnowledgeBaseEntriesForSort(entry1, entry2) : difference;
    }
    _getMatchedKeywordsNumber(entry) {
        let matches = 0;
        for (const k of entry.keywords) {
            if (this._matchedKeywordsInContent.includes(k.keyword)) {
                matches++;
            }
        }
        return matches;
    }
    filter(input) {
        this._filterValue = input;
        const inputTrimmed = input.trim();
        if (inputTrimmed) {
            this.filteredEntries(knowledgeBaseSearch(inputTrimmed, this._allEntries.array));
        }
        else {
            this.filteredEntries(this._allEntries.array);
        }
    }
    selectNextEntry(action) {
        // returns true if selection is changed
        const selectedIndex = this.getSelectedEntryIndex();
        const nextIndex = selectedIndex + (action === SELECT_NEXT_ENTRY ? 1 : -1);
        if (nextIndex >= 0 && nextIndex < this.filteredEntries().length) {
            const nextSelectedEntry = this.filteredEntries()[nextIndex];
            this.selectedEntry(nextSelectedEntry);
            return true;
        }
        return false;
    }
    getSelectedEntryIndex() {
        const selectedEntry = this.selectedEntry();
        if (selectedEntry == null) {
            return -1;
        }
        return this.filteredEntries().indexOf(selectedEntry);
    }
    _removeFromAllKeywords(keyword) {
        const index = this._allKeywords.indexOf(keyword);
        if (index > -1) {
            this._allKeywords.splice(index, 1);
        }
    }
    dispose() {
        this._eventController.removeEntityListener(this._entityEventReceived);
    }
    loadTemplate(templateId) {
        return this._entityClient.load(EmailTemplateTypeRef, templateId);
    }
    isReadOnly(entry) {
        const instance = this._groupInstances.find((instance) => isSameId(entry._ownerGroup, getEtId(instance.group)));
        return !instance || !hasCapabilityOnGroup(this.userController.user, instance.group, "1" /* ShareCapability.Write */);
    }
    _entityUpdate(updates) {
        return promiseMap(updates, (update) => {
            if (isUpdateForTypeRef(KnowledgeBaseEntryTypeRef, update)) {
                if (update.operation === "0" /* OperationType.CREATE */) {
                    return this._entityClient.load(KnowledgeBaseEntryTypeRef, [update.instanceListId, update.instanceId]).then((entry) => {
                        this._allEntries.insert(entry);
                        this.filter(this._filterValue);
                    });
                }
                else if (update.operation === "1" /* OperationType.UPDATE */) {
                    return this._entityClient.load(KnowledgeBaseEntryTypeRef, [update.instanceListId, update.instanceId]).then((updatedEntry) => {
                        this._allEntries.removeFirst((e) => isSameId(getElementId(e), update.instanceId));
                        this._allEntries.insert(updatedEntry);
                        this.filter(this._filterValue);
                        const oldSelectedEntry = this.selectedEntry();
                        if (oldSelectedEntry && isSameId(oldSelectedEntry._id, updatedEntry._id)) {
                            this.selectedEntry(updatedEntry);
                        }
                    });
                }
                else if (update.operation === "2" /* OperationType.DELETE */) {
                    const selected = this.selectedEntry();
                    if (selected && isSameId(getLetId(selected), [update.instanceListId, update.instanceId])) {
                        this.selectedEntry(null);
                    }
                    this._allEntries.removeFirst((e) => isSameId(getElementId(e), update.instanceId));
                    this.filter(this._filterValue);
                }
            }
        }).then(noOp);
    }
}
function loadKnowledgebaseEntries(templateGroups, entityClient) {
    return promiseMap(templateGroups, (group) => entityClient.loadAll(KnowledgeBaseEntryTypeRef, group.groupRoot.knowledgeBase)).then((groupedTemplates) => groupedTemplates.flat());
}
//# sourceMappingURL=KnowledgeBaseModel.js.map