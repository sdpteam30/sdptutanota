import { search } from "../../../common/api/common/utils/PlainTextSearch.js";
export function knowledgeBaseSearch(input, allEntries) {
    return search(input, allEntries, ["title", "description", "keywords.keyword"], false);
}
//# sourceMappingURL=KnowledgeBaseSearchFilter.js.map