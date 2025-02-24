import { modelInfos } from "../../common/EntityFunctions.js";
import { typedKeys } from "@tutao/tutanota-utils";
import { ProgrammingError } from "../../common/error/ProgrammingError.js";
export async function migrateAllListElements(typeRef, storage, migrations) {
    let entities = await storage.getRawListElementsOfType(typeRef);
    for (const migration of migrations) {
        // @ts-ignore need better types for migrations
        entities = entities.map(migration);
    }
    for (const entity of entities) {
        entity._type = typeRef;
        await storage.put(entity);
    }
}
export async function migrateAllElements(typeRef, storage, migrations) {
    let entities = await storage.getRawElementsOfType(typeRef);
    for (const migration of migrations) {
        // @ts-ignore need better types for migrations
        entities = entities.map(migration);
    }
    for (const entity of entities) {
        entity._type = typeRef;
        await storage.put(entity);
    }
}
export function renameAttribute(oldName, newName) {
    return function (entity) {
        entity[newName] = entity[oldName];
        delete entity[oldName];
        return entity;
    };
}
export function addOwnerKeyVersion() {
    return function (entity) {
        entity["_ownerKeyVersion"] = entity["_ownerEncSessionKey"] == null ? null : "0";
        return entity;
    };
}
export function removeValue(valueName) {
    return function (entity) {
        delete entity[valueName];
        return entity;
    };
}
export function addValue(valueName, value) {
    return function (entity) {
        entity[valueName] = value;
        return entity;
    };
}
export function booleanToNumberValue(attribute) {
    return function (entity) {
        // same default value mapping as in the tutadb migration
        entity[attribute] = entity[attribute] ? "1" : "0";
        return entity;
    };
}
export function changeCardinalityFromAnyToZeroOrOne(attribute) {
    return function (entity) {
        const value = entity[attribute];
        if (!Array.isArray(value)) {
            throw new ProgrammingError("Can only migrate from cardinality ANY.");
        }
        const length = value.length;
        if (length === 0) {
            entity[attribute] = null;
        }
        else if (length === 1) {
            entity[attribute] = value[0];
        }
        else {
            throw new ProgrammingError(`not possible to migrate ANY to ZERO_OR_ONE with array length > 1. actual length: ${length}`);
        }
        return entity;
    };
}
export async function clearDatabase(storage) {
    await storage.purgeStorage();
    await writeModelVersions(storage);
}
export function deleteInstancesOfType(storage, type) {
    return storage.deleteAllOfType(type);
}
async function writeModelVersions(storage) {
    for (const app of typedKeys(modelInfos)) {
        const key = `${app}-version`;
        let version = modelInfos[app].version;
        await storage.setStoredModelVersion(app, version);
    }
}
//# sourceMappingURL=StandardMigrations.js.map