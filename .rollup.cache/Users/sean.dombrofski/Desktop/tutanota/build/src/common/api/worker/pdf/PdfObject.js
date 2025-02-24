import { GENERATION_NUMBER, NEW_LINE } from "./PdfConstants.js";
/**
 * Class representing objects in PDF.
 * Holds data in form of an associative array which mirror the actual PDF object's "object dictionary"
 */
export class PdfObject {
    objectNumber;
    bytePosition = -1;
    objectDictionary = new Map();
    constructor(objectNumber, objectDictionary) {
        this.objectNumber = objectNumber;
        this.objectDictionary = objectDictionary;
    }
    getDictionary() {
        return this.objectDictionary;
    }
    getObjectNumber() {
        return this.objectNumber;
    }
    getBytePosition() {
        return this.bytePosition;
    }
    /**
     * Set the dictionary of the object to be one with all references resolved (string, string)
     */
    setResolvedDictionary(map) {
        this.objectDictionary = map;
    }
    /**
     * Set the byte-position of the object which is the byte in the PDF file at which the object's declaration starts
     */
    setBytePosition(bytePosition) {
        this.bytePosition = bytePosition;
    }
    /**
     * Encode the object into a Uint8Array to enable writing it into a buffer / file
     * @param textEncoder
     */
    encodeToUInt8Array(textEncoder) {
        return new Uint8Array([...textEncoder.encode(this.parseObjectHead()), ...textEncoder.encode(this.parseObjectTail())]);
    }
    /**
     * Convert the object's head data into PDF syntax
     */
    parseObjectHead() {
        let head = `${this.objectNumber} ${GENERATION_NUMBER} obj${NEW_LINE}<<${NEW_LINE}`;
        for (const [key, val] of this.objectDictionary) {
            if (typeof val !== "string")
                throw new Error(`Unresolved reference in object: ${this.objectNumber}. Unresolved reference found as value of: "${key}". Cannot encode an object that has unresolved references, aborting...`);
            head += `/${key} ${val}`;
        }
        head += `${NEW_LINE}>>${NEW_LINE}`;
        return head;
    }
    /**
     * Convert the object's tail data into PDF syntax
     */
    parseObjectTail() {
        return `endobj${NEW_LINE}`;
    }
}
//# sourceMappingURL=PdfObject.js.map