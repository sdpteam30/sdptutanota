import { elementIdPart, listIdPart } from "./EntityUtils.js";
export function createReferencingInstance(tutanotaFile) {
    return {
        blobs: tutanotaFile.blobs,
        elementId: elementIdPart(tutanotaFile._id),
        listId: listIdPart(tutanotaFile._id),
        entity: tutanotaFile,
    };
}
//# sourceMappingURL=BlobUtils.js.map