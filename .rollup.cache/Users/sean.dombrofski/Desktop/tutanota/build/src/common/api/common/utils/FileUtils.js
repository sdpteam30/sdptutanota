import { downcast, intersection, isSameTypeRef, toLowerCase } from "@tutao/tutanota-utils";
import { FileTypeRef as TutanotaFileTypeRef } from "../../entities/tutanota/TypeRefs.js";
const _false = () => false;
/**
 * Get the file extension of a filename
 * so
 *  file.txt -> .txt
 *  archive.tar.gz -> .tar.gz
 * @param fileName
 */
export function getFileExtension(fileName) {
    return (fileName.match(/\..+$/) || [""])[0];
}
/**
 * The inverse of getTrailingFileExtension
 * @param fileName
 */
export function getFileBaseName(fileName) {
    const extension = getFileExtension(fileName);
    return fileName.substring(0, extension ? fileName.lastIndexOf(extension) : fileName.length);
}
export function unreserveFileName(fileName) {
    if (fileName === "." || fileName === "..") {
        return `${fileName}_`;
    }
    // CON, CON.txt, COM0 etc. (windows device files)
    const winReservedRe = /^(CON|PRN|LPT[0-9]|COM[0-9]|AUX|NUL)($|\..*$)/i;
    const extension = getFileExtension(fileName);
    const baseName = getFileBaseName(fileName);
    return env.platformId === "win32" && winReservedRe.test(baseName) ? `${baseName}_${extension}` : fileName;
}
/**
 * removes invalid characters from the given filename
 * by replacing them with underscores (non-platform-specific)
 */
export function sanitizeFilename(filename) {
    // / ? < > \ : * | "
    const illegalRe = /[/?<>\\:*|"]/g;
    // unicode control codes
    const controlRe = /[\x00-\x1f\x80-\x9f]/g;
    // trailing period in windows file names
    // this is valid in linux but can't be checked from the browser
    const windowsTrailingRe = /[. ]+$/;
    return unreserveFileName(filename).replace(illegalRe, "_").replace(controlRe, "_").replace(windowsTrailingRe, "_");
}
/**
 * Uniqueify all the names in fileNames, case-insensitively
 * @param filenames
 * @param _taken: file names that are taken but won't be included in the output
 */
export function deduplicateFilenames(filenames, _taken = new Set()) {
    // make taken lowercase aswell for case insensitivity
    const taken = new Set(Array.from(_taken).map(toLowerCase));
    // Check first if we need to do a deduplication
    const deduplicatedNames = new Set(filenames.map(toLowerCase));
    // None of the filenames were duplicated or taken
    if (deduplicatedNames.size === filenames.length && intersection(deduplicatedNames, taken).size === 0) {
        // if all file names are good then just return an identity map
        return Object.fromEntries(filenames.map((f) => [f, [f]])); // convert into map oldname -> [newname]
    }
    const suffix = (name, number) => {
        const basename = name.substring(0, name.indexOf(".")) || name;
        // get the file extension or an empty string
        const ext = (name.match(/\..+$/) || [""])[0];
        return `${basename} (${number})${ext}`;
    };
    // do the deduplication
    const out = {};
    const duplicateCounts = {};
    for (let name of filenames) {
        const lower = name.toLowerCase();
        let dedupName;
        if (duplicateCounts[lower] === undefined) {
            duplicateCounts[lower] = 0;
            dedupName = taken.has(lower) ? suffix(name, ++duplicateCounts[lower]) : name;
        }
        else {
            dedupName = suffix(name, ++duplicateCounts[lower]);
        }
        if (!out[name]) {
            out[name] = [];
        }
        out[name].push(dedupName);
    }
    return out;
}
/**
 * checks if the given filename is a reserved filename on the current platform
 * @param filename
 * @returns {boolean}
 * @private
 */
export function isReservedFilename(filename) {
    // CON, CON.txt, COM0 etc. (windows device files)
    const winReservedRe = /^(CON|PRN|LPT[0-9]|COM[0-9]|AUX|NUL)($|\..*$)/i;
    // .. and .
    const reservedRe = /^\.{1,2}$/;
    return (env.platformId === "win32" && winReservedRe.test(filename)) || reservedRe.test(filename);
}
export function isTutanotaFile(file) {
    return (file._type &&
        typeof file._type === "object" &&
        Object.hasOwn(file._type, "app") &&
        Object.hasOwn(file._type, "type") &&
        isSameTypeRef(downcast(file._type), TutanotaFileTypeRef));
}
export function isDataFile(file) {
    return file._type === "DataFile";
}
export function isFileReference(file) {
    return file._type === "FileReference";
}
export function assertOnlyFileReferences(files) {
    if (files.some((f) => !isFileReference(f)))
        throw new TypeError("not only FileReference");
}
export function assertOnlyDataFiles(files) {
    if (files.some((f) => !isDataFile(f)))
        throw new TypeError("not only DataFiles");
}
export function fileListToArray(fileList) {
    // create an array of files form the FileList because we can not iterate the FileList directly
    let nativeFiles = [];
    for (let i = 0; i < fileList.length; i++) {
        nativeFiles.push(fileList[i]);
    }
    return nativeFiles;
}
//# sourceMappingURL=FileUtils.js.map