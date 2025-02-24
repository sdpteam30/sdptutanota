import { RootInstanceTypeRef } from "../entities/sys/TypeRefs.js";
import { CUSTOM_MIN_ID, elementIdPart, firstBiggerThanSecond, GENERATED_MIN_ID, getElementId, getLetId, listIdPart, RANGE_ITEM_LIMIT, } from "./utils/EntityUtils";
import { Type, ValueType } from "./EntityConstants.js";
import { downcast, groupByAndMap, last, promiseMap } from "@tutao/tutanota-utils";
import { resolveTypeReference } from "./EntityFunctions";
import { NotAuthorizedError, NotFoundError } from "./error/RestError.js";
export class EntityClient {
    _target;
    constructor(target) {
        this._target = target;
    }
    /**
     * Important: we can't pass functions through the bridge, so we can't pass ownerKeyProvider from the page context.
     */
    load(typeRef, id, opts = {}) {
        return this._target.load(typeRef, id, opts);
    }
    async loadAll(typeRef, listId, start) {
        const typeModel = await resolveTypeReference(typeRef);
        if (!start) {
            start = typeModel.values["_id"].type === ValueType.GeneratedId ? GENERATED_MIN_ID : CUSTOM_MIN_ID;
        }
        const elements = await this.loadRange(typeRef, listId, start, RANGE_ITEM_LIMIT, false);
        if (elements.length === RANGE_ITEM_LIMIT) {
            let lastElementId = getLetId(elements[elements.length - 1])[1];
            const nextElements = await this.loadAll(typeRef, listId, lastElementId);
            return elements.concat(nextElements);
        }
        else {
            return elements;
        }
    }
    async loadReverseRangeBetween(typeRef, listId, start, end, rangeItemLimit = RANGE_ITEM_LIMIT) {
        const typeModel = await resolveTypeReference(typeRef);
        if (typeModel.type !== Type.ListElement)
            throw new Error("only ListElement types are permitted");
        const loadedEntities = await this._target.loadRange(typeRef, listId, start, rangeItemLimit, true);
        const filteredEntities = loadedEntities.filter((entity) => firstBiggerThanSecond(getElementId(entity), end, typeModel));
        if (filteredEntities.length === rangeItemLimit) {
            const lastElementId = getElementId(filteredEntities[loadedEntities.length - 1]);
            const { elements: remainingEntities, loadedCompletely } = await this.loadReverseRangeBetween(typeRef, listId, lastElementId, end, rangeItemLimit);
            return {
                elements: filteredEntities.concat(remainingEntities),
                loadedCompletely,
            };
        }
        else {
            return {
                elements: filteredEntities,
                loadedCompletely: wasReverseRangeCompletelyLoaded(rangeItemLimit, loadedEntities, filteredEntities),
            };
        }
    }
    loadRange(typeRef, listId, start, count, reverse, opts = {}) {
        return this._target.loadRange(typeRef, listId, start, count, reverse, opts);
    }
    /**
     * load multiple does not guarantee order or completeness of returned elements.
     */
    loadMultiple(typeRef, listId, elementIds, ownerEncSessionKeyProvider, opts = {}) {
        return this._target.loadMultiple(typeRef, listId, elementIds, ownerEncSessionKeyProvider, opts);
    }
    setup(listId, instance, extraHeaders, options) {
        return this._target.setup(listId, instance, extraHeaders, options);
    }
    setupMultipleEntities(listId, instances) {
        return this._target.setupMultiple(listId, instances);
    }
    update(instance, options) {
        return this._target.update(instance, options);
    }
    erase(instance, options) {
        return this._target.erase(instance, options);
    }
    async loadRoot(typeRef, groupId, opts = {}) {
        const typeModel = await resolveTypeReference(typeRef);
        const rootId = [groupId, typeModel.rootId];
        const root = await this.load(RootInstanceTypeRef, rootId, opts);
        return this.load(typeRef, downcast(root.reference), opts);
    }
}
function wasReverseRangeCompletelyLoaded(rangeItemLimit, loadedEntities, filteredEntities) {
    if (loadedEntities.length < rangeItemLimit) {
        const lastLoaded = last(loadedEntities);
        const lastFiltered = last(filteredEntities);
        if (!lastLoaded) {
            return true;
        }
        return lastLoaded === lastFiltered;
    }
    return false;
}
/**
 * load multiple instances of the same type concurrently from multiple lists using
 * one request per list if possible
 *
 * @returns an array of all the instances excluding the ones throwing NotFoundError or NotAuthorizedError, in arbitrary order.
 */
export async function loadMultipleFromLists(type, entityClient, toLoad) {
    if (toLoad.length === 0) {
        return [];
    }
    const indexedEventIds = groupByAndMap(toLoad, listIdPart, elementIdPart);
    return (await promiseMap(indexedEventIds, async ([listId, elementIds]) => {
        try {
            return await entityClient.loadMultiple(type, listId, elementIds);
        }
        catch (e) {
            // these are thrown if the list itself is inaccessible. elements will just be missing
            // in the loadMultiple result.
            if (e instanceof NotFoundError || e instanceof NotAuthorizedError) {
                console.log(`could not load entities of type ${type} from list ${listId}: ${e.name}`);
                return [];
            }
            else {
                throw e;
            }
        }
    }, { concurrency: 3 })).flat();
}
//# sourceMappingURL=EntityClient.js.map