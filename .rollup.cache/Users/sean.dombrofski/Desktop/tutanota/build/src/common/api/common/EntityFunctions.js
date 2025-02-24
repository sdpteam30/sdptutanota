import { Type } from "./EntityConstants.js";
import { typeModels as baseTypeModels } from "../entities/base/TypeModels.js";
import { typeModels as sysTypeModels } from "../entities/sys/TypeModels.js";
import { typeModels as tutanotaTypeModels } from "../entities/tutanota/TypeModels.js";
import { typeModels as monitorTypeModels } from "../entities/monitor/TypeModels.js";
import { typeModels as accountingTypeModels } from "../entities/accounting/TypeModels.js";
import { typeModels as gossipTypeModels } from "../entities/gossip/TypeModels.js";
import { typeModels as storageTypeModels } from "../entities/storage/TypeModels.js";
import { typeModels as usageTypeModels } from "../entities/usage/TypeModels.js";
import sysModelInfo from "../entities/sys/ModelInfo.js";
import baseModelInfo from "../entities/base/ModelInfo.js";
import tutanotaModelInfo from "../entities/tutanota/ModelInfo.js";
import monitorModelInfo from "../entities/monitor/ModelInfo.js";
import accountingModelInfo from "../entities/accounting/ModelInfo.js";
import gossipModelInfo from "../entities/gossip/ModelInfo.js";
import storageModelInfo from "../entities/storage/ModelInfo.js";
import usageModelInfo from "../entities/usage/ModelInfo.js";
/**
 * Model maps are needed for static analysis and dead-code elimination.
 * We access most types through the TypeRef but also sometimes we include them completely dynamically (e.g. encryption of aggregates).
 * This means that we need to tell our bundler which ones do exist so that they are included.
 */
export const typeModels = Object.freeze({
    base: baseTypeModels,
    sys: sysTypeModels,
    tutanota: tutanotaTypeModels,
    monitor: monitorTypeModels,
    accounting: accountingTypeModels,
    gossip: gossipTypeModels,
    storage: storageTypeModels,
    usage: usageTypeModels,
});
export const modelInfos = {
    base: baseModelInfo,
    sys: sysModelInfo,
    tutanota: tutanotaModelInfo,
    monitor: monitorModelInfo,
    accounting: accountingModelInfo,
    gossip: gossipModelInfo,
    storage: storageModelInfo,
    usage: usageModelInfo,
};
/**
 * Convert a {@link TypeRef} to a {@link TypeModel} that it refers to.
 *
 * This function is async so that we can possibly load typeModels on demand instead of bundling them with the JS files.
 *
 * @param typeRef the typeRef for which we will return the typeModel.
 */
export async function resolveTypeReference(typeRef) {
    // @ts-ignore
    const modelMap = typeModels[typeRef.app];
    const typeModel = modelMap[typeRef.type];
    if (typeModel == null) {
        throw new Error("Cannot find TypeRef: " + JSON.stringify(typeRef));
    }
    else {
        return typeModel;
    }
}
export function _verifyType(typeModel) {
    if (typeModel.type !== Type.Element && typeModel.type !== Type.ListElement && typeModel.type !== Type.BlobElement) {
        throw new Error("only Element, ListElement and BlobElement types are permitted, was: " + typeModel.type);
    }
}
//# sourceMappingURL=EntityFunctions.js.map