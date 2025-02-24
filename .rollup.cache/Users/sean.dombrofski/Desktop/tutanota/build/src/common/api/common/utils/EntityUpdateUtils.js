import { isSameTypeRefByAttr } from "@tutao/tutanota-utils";
import { isSameId } from "./EntityUtils.js";
export function isUpdateForTypeRef(typeRef, update) {
    return isSameTypeRefByAttr(typeRef, update.application, update.type);
}
export function isUpdateFor(entity, update) {
    const typeRef = entity._type;
    return (isUpdateForTypeRef(typeRef, update) &&
        (update.instanceListId === "" ? isSameId(update.instanceId, entity._id) : isSameId([update.instanceListId, update.instanceId], entity._id)));
}
export function containsEventOfType(events, type, elementId) {
    return events.some((event) => event.operation === type && event.instanceId === elementId);
}
export function getEventOfType(events, type, elementId) {
    return events.find((event) => event.operation === type && event.instanceId === elementId) ?? null;
}
//# sourceMappingURL=EntityUpdateUtils.js.map