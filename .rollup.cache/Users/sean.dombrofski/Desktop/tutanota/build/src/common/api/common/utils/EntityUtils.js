import { base64ExtToBase64, base64ToBase64Ext, base64ToBase64Url, base64ToUint8Array, base64UrlToBase64, clone, compare, hexToBase64, isSameTypeRef, pad, repeat, stringToUtf8Uint8Array, uint8ArrayToBase64, utf8Uint8ArrayToString, } from "@tutao/tutanota-utils";
import { Cardinality, ValueType } from "../EntityConstants.js";
/**
 * the maximum ID for elements stored on the server (number with the length of 10 bytes) => 2^80 - 1
 */
export const GENERATED_MAX_ID = "zzzzzzzzzzzz";
/**
 * The minimum ID for elements with generated id stored on the server
 */
export const GENERATED_MIN_ID = "------------";
/**
 * The byte length of a generated id
 */
export const GENERATED_ID_BYTES_LENGTH = 9;
/**
 * The byte length of a custom Id used by mail set entries
 * 4 bytes timestamp (1024ms resolution)
 * 9 bytes mail element Id
 */
export const MAIL_SET_ENTRY_ID_BYTE_LENGTH = 13;
/**
 * The minimum ID for elements with custom id stored on the server
 */
export const CUSTOM_MIN_ID = "";
/**
 * the maximum custom element id is enforced to be less than 256 bytes on the server. decoding this as Base64Url gives 255 bytes.
 *
 * NOTE: this is currently only used as a marker value when caching CalenderEvent and MailSetEntry.
 */
export const CUSTOM_MAX_ID = repeat("_", 340);
export const RANGE_ITEM_LIMIT = 1000;
export const LOAD_MULTIPLE_LIMIT = 100;
export const POST_MULTIPLE_LIMIT = 100;
/**
 * Tests if one id is bigger than another.
 * For generated IDs we use base64ext which is sortable.
 * For custom IDs we use base64url which is not sortable, so we convert them to string before comparing.
 * Important: using this for custom IDs works only with custom IDs which are derived from strings.
 *
 * @param firstId The element id that is tested if it is bigger.
 * @param secondId The element id that is tested against.
 * @param typeModel optional - the type the Ids belong to. this can be used to compare custom IDs.
 * @return True if firstId is bigger than secondId, false otherwise.
 */
export function firstBiggerThanSecond(firstId, secondId, typeModel) {
    if (typeModel?.values._id.type === ValueType.CustomId) {
        return firstBiggerThanSecondCustomId(firstId, secondId);
    }
    else {
        // if the number of digits is bigger, then the id is bigger, otherwise we can use the lexicographical comparison
        if (firstId.length > secondId.length) {
            return true;
        }
        else if (secondId.length > firstId.length) {
            return false;
        }
        else {
            return firstId > secondId;
        }
    }
}
export function firstBiggerThanSecondCustomId(firstId, secondId) {
    return compare(customIdToUint8array(firstId), customIdToUint8array(secondId)) === 1;
}
export function customIdToUint8array(id) {
    if (id === "") {
        return new Uint8Array();
    }
    return base64ToUint8Array(base64UrlToBase64(id));
}
export function compareNewestFirst(id1, id2) {
    let firstId = id1 instanceof Array ? id1[1] : id1;
    let secondId = id2 instanceof Array ? id2[1] : id2;
    if (firstId === secondId) {
        return 0;
    }
    else {
        return firstBiggerThanSecond(firstId, secondId) ? -1 : 1;
    }
}
export function compareOldestFirst(id1, id2) {
    let firstId = id1 instanceof Array ? id1[1] : id1;
    let secondId = id2 instanceof Array ? id2[1] : id2;
    if (firstId === secondId) {
        return 0;
    }
    else {
        return firstBiggerThanSecond(firstId, secondId) ? 1 : -1;
    }
}
export function sortCompareByReverseId(entity1, entity2) {
    return compareNewestFirst(getElementId(entity1), getElementId(entity2));
}
export function sortCompareById(entity1, entity2) {
    return compareOldestFirst(getElementId(entity1), getElementId(entity2));
}
/**
 * Compares the ids of two elements.
 * @pre Both entities are either ElementTypes or ListElementTypes
 * @param id1
 * @param id2
 * @returns True if the ids are the same, false otherwise
 */
export function isSameId(id1, id2) {
    if (id1 === null || id2 === null) {
        return false;
    }
    else if (id1 instanceof Array && id2 instanceof Array) {
        return id1[0] === id2[0] && id1[1] === id2[1];
    }
    else {
        return id1 === id2;
    }
}
export function haveSameId(entity1, entity2) {
    return isSameId(entity1._id, entity2._id);
}
export function containsId(ids, id) {
    return ids.some((idInArray) => isSameId(idInArray, id));
}
export function getEtId(entity) {
    return entity._id;
}
export function getLetId(entity) {
    if (typeof entity._id === "undefined") {
        throw new Error("listId is not defined for " + (typeof entity._type === "undefined" ? JSON.stringify(entity) : entity));
    }
    return entity._id;
}
export function getElementId(entity) {
    return elementIdPart(getLetId(entity));
}
export function getListId(entity) {
    return listIdPart(getLetId(entity));
}
export function listIdPart(id) {
    return id[0];
}
export function elementIdPart(id) {
    return id[1];
}
/**
 * Converts a string to a custom id. Attention: the custom id must be intended to be derived from a string.
 */
export function stringToCustomId(string) {
    return uint8arrayToCustomId(stringToUtf8Uint8Array(string));
}
export function uint8arrayToCustomId(array) {
    return base64ToBase64Url(uint8ArrayToBase64(array));
}
/**
 * Converts a custom id to a string. Attention: the custom id must be intended to be derived from a string.
 */
export function customIdToString(customId) {
    return utf8Uint8ArrayToString(base64ToUint8Array(base64UrlToBase64(customId)));
}
export function create(typeModel, typeRef, createDefaultValue = _getDefaultValue) {
    let i = {
        _type: typeRef,
    };
    for (let valueName of Object.keys(typeModel.values)) {
        let value = typeModel.values[valueName];
        i[valueName] = createDefaultValue(valueName, value);
    }
    for (let associationName of Object.keys(typeModel.associations)) {
        let association = typeModel.associations[associationName];
        if (association.cardinality === Cardinality.Any) {
            i[associationName] = [];
        }
        else {
            // set to null even if the cardinality is One. we could think about calling create recursively,
            // but that would require us to resolve type refs (async) and recursively merge the result with
            // the provided values
            i[associationName] = null;
        }
    }
    return i;
}
function _getDefaultValue(valueName, value) {
    if (valueName === "_format") {
        return "0";
    }
    else if (valueName === "_id") {
        return null; // aggregate ids are set in the worker, list ids must be set explicitely and element ids are created on the server
    }
    else if (valueName === "_permissions") {
        return null;
    }
    else if (value.cardinality === Cardinality.ZeroOrOne) {
        return null;
    }
    else {
        switch (value.type) {
            case ValueType.Bytes:
                return new Uint8Array(0);
            case ValueType.Date:
                return new Date();
            case ValueType.Number:
                return "0";
            case ValueType.String:
                return "";
            case ValueType.Boolean:
                return false;
            case ValueType.CustomId:
            case ValueType.GeneratedId:
                return null;
            // we have to use null although the value must be set to something different
        }
    }
    throw new Error(`no default value for ${JSON.stringify(value)}`);
}
/**
 * Converts a timestamp number to a GeneratedId (the counter is set to zero) in hex format.
 *
 * @param timestamp The timestamp of the GeneratedId
 * @return The GeneratedId as hex string.
 */
export function timestampToHexGeneratedId(timestamp, serverBytes) {
    let id = timestamp * 4; // shifted 2 bits left, so the value covers 44 bits overall (42 timestamp + 2 shifted)
    let hex = id.toString(16) + "00000" + pad(serverBytes, 2); // add one zero for the missing 4 bits plus 4 more (2 bytes) plus 2 more for the server id to get 9 bytes
    // add leading zeros to reach 9 bytes (GeneratedId length) = 18 hex
    for (let length = hex.length; length < 18; length++) {
        hex = "0" + hex;
    }
    return hex;
}
/**
 * Converts a timestamp number to a GeneratedId (the counter and server bits are set to zero).
 *
 * @param timestamp The timestamp of the GeneratedId
 * @return The GeneratedId.
 */
export function timestampToGeneratedId(timestamp, serverBytes = 0) {
    let hex = timestampToHexGeneratedId(timestamp, serverBytes);
    return base64ToBase64Ext(hexToBase64(hex));
}
/**
 * Extracts the timestamp from a GeneratedId
 * @param base64Ext The id as base64Ext
 * @returns The timestamp of the GeneratedId
 */
export function generatedIdToTimestamp(base64Ext) {
    const base64 = base64ExtToBase64(base64Ext);
    const decodedbB4 = atob(base64);
    let numberResult = 0;
    // Timestamp is in the first 42 bits
    for (let i = 0; i < 5; i++) {
        // We "shift" each number by 8 bits to the left: numberResult << 8
        numberResult = numberResult * 256;
        numberResult += decodedbB4.charCodeAt(i);
    }
    // We need to shift the whole number to the left by 2 bits (because 42 bits is encoded in 6 bytes)
    numberResult = numberResult * 4;
    // We take only last two highest bits from the last byte
    numberResult += decodedbB4.charCodeAt(5) >>> 6;
    return numberResult;
}
const base64extEncodedIdLength = GENERATED_MAX_ID.length;
const base64extAlphabet = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";
export function isValidGeneratedId(id) {
    const test = (id) => id.length === base64extEncodedIdLength && Array.from(id).every((char) => base64extAlphabet.includes(char));
    return typeof id === "string" ? test(id) : id.every(test);
}
export function isElementEntity(e) {
    return typeof e._id === "string";
}
export function assertIsEntity(entity, type) {
    if (isSameTypeRef(entity._type, type)) {
        return true;
    }
    else {
        return false;
    }
}
export function assertIsEntity2(type) {
    return (e) => assertIsEntity(e, type);
}
/**
 * Remove some hidden technical fields from the entity.
 *
 * Only use for new entities, the {@param entity} won't be usable for updates anymore after this.
 */
export function removeTechnicalFields(entity) {
    // we want to restrict outer function to entity types but internally we also want to handle aggregates
    function _removeTechnicalFields(erased) {
        for (const key of Object.keys(erased)) {
            if (key.startsWith("_finalEncrypted") || key.startsWith("_defaultEncrypted") || key.startsWith("_errors")) {
                delete erased[key];
            }
            else {
                const value = erased[key];
                if (value instanceof Object) {
                    _removeTechnicalFields(value);
                }
            }
        }
    }
    _removeTechnicalFields(entity);
}
/**
 * get a clone of a (partial) entity that does not contain any fields that would indicate that it was ever persisted anywhere.
 * @param entity the entity to strip
 */
export function getStrippedClone(entity) {
    const cloned = clone(entity);
    removeTechnicalFields(cloned);
    removeIdentityFields(cloned);
    return cloned;
}
/**
 * remove fields that do not contain user defined data but are related to finding/accessing the entity on the server
 */
function removeIdentityFields(entity) {
    const keysToDelete = ["_id", "_ownerGroup", "_ownerEncSessionKey", "_ownerKeyVersion", "_permissions"];
    function _removeIdentityFields(erased) {
        for (const key of Object.keys(erased)) {
            if (keysToDelete.includes(key)) {
                delete erased[key];
            }
            else {
                const value = erased[key];
                if (value instanceof Object) {
                    _removeIdentityFields(value);
                }
            }
        }
    }
    _removeIdentityFields(entity);
}
/** construct a mail set entry Id for a given mail. see MailFolderHelper.java */
export function constructMailSetEntryId(receiveDate, mailId) {
    const buffer = new DataView(new ArrayBuffer(MAIL_SET_ENTRY_ID_BYTE_LENGTH));
    const mailIdBytes = base64ToUint8Array(base64ExtToBase64(mailId));
    // shifting the received timestamp by 10 bit reduces the resolution from 1ms to 1024ms.
    // truncating to 4 bytes leaves us with enough space for epoch + 4_294_967_295 not-quite-seconds
    // (until around 2109-05-15 15:00)
    const timestamp = BigInt(Math.trunc(receiveDate.getTime()));
    const truncatedReceiveDate = (timestamp >> 10n) & 0x00000000ffffffffn;
    // we don't need the leading zeroes
    buffer.setBigUint64(0, truncatedReceiveDate << 32n);
    for (let i = 0; i < mailIdBytes.length; i++) {
        buffer.setUint8(i + 4, mailIdBytes[i]);
    }
    return uint8arrayToCustomId(new Uint8Array(buffer.buffer));
}
export function deconstructMailSetEntryId(id) {
    const buffer = customIdToUint8array(id);
    const timestampBytes = buffer.slice(0, 4);
    const generatedIdBytes = buffer.slice(4);
    const timestamp1024 = (timestampBytes[0] << 24) | (timestampBytes[1] << 16) | (timestampBytes[2] << 8) | timestampBytes[3];
    const timestamp = timestamp1024 * 1024;
    const mailId = base64ToBase64Ext(uint8ArrayToBase64(generatedIdBytes));
    return { receiveDate: new Date(timestamp), mailId };
}
export const LEGACY_TO_RECIPIENTS_ID = 112;
export const LEGACY_CC_RECIPIENTS_ID = 113;
export const LEGACY_BCC_RECIPIENTS_ID = 114;
export const LEGACY_BODY_ID = 116;
//# sourceMappingURL=EntityUtils.js.map