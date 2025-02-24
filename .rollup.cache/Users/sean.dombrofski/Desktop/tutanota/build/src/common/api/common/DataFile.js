export function createDataFile(name, mimeType, data, cid) {
    return {
        _type: "DataFile",
        name: name,
        mimeType: getCleanedMimeType(mimeType),
        data: data,
        size: data.byteLength,
        id: undefined,
        cid,
    };
}
export function convertToDataFile(file, data) {
    if ("_type" in file) {
        return {
            _type: "DataFile",
            name: file.name,
            mimeType: getCleanedMimeType(file.mimeType),
            data: data,
            size: data.byteLength,
            id: file._id,
            cid: file.cid ?? undefined,
        };
    }
    else {
        return {
            _type: "DataFile",
            name: file.name,
            mimeType: getCleanedMimeType(file.type),
            data: data,
            size: data.byteLength,
            id: undefined, // file read from filesystem, does not have an id because it has not been stored in tutanota.
        };
    }
}
/** make sure we have a valid mime type by replacing empty ones with "application/octet-stream" and
 * removing double quotes and single quotes*/
export function getCleanedMimeType(mimeType) {
    if (!mimeType || mimeType.trim() === "") {
        return "application/octet-stream";
    }
    else {
        return mimeType.replace(/"/g, "").replace(/'/g, "");
    }
}
//# sourceMappingURL=DataFile.js.map