import { PdfObject } from "./PdfObject.js";
import { GENERATION_NUMBER, NEW_LINE } from "./PdfConstants.js";
/**
 * PDF object with an additional stream.
 * The stream requires different encoding syntax
 */
export class PdfStreamObject extends PdfObject {
    stream;
    constructor(objectNumber, objectDictionary, stream, streamEncoding) {
        super(objectNumber, objectDictionary);
        this.stream = stream;
        if (streamEncoding !== "NONE") {
            this.objectDictionary.set("Filter", streamEncoding);
        }
        this.objectDictionary.set("Length", stream.byteLength.toString());
    }
    encodeToUInt8Array(textEncoder) {
        return new Uint8Array([...textEncoder.encode(this.parseObjectHead()), ...this.stream, ...textEncoder.encode(this.parseObjectTail())]);
    }
    parseObjectHead() {
        let head = `${this.objectNumber} ${GENERATION_NUMBER} obj${NEW_LINE}<<${NEW_LINE}`;
        for (const [key, val] of this.objectDictionary) {
            head += `/${key} ${val}`;
        }
        head += `${NEW_LINE}>>${NEW_LINE}stream${NEW_LINE}`;
        return head;
    }
    parseObjectTail() {
        return `${NEW_LINE}endstream${NEW_LINE}endobj${NEW_LINE}`;
    }
}
//# sourceMappingURL=PdfStreamObject.js.map