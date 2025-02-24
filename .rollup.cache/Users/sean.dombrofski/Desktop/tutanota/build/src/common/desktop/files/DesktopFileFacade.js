import path from "node:path";
import { sha256Hash } from "@tutao/tutanota-crypto";
import { assertNotNull, splitUint8ArrayInChunks, stringToUtf8Uint8Array, uint8ArrayToBase64, uint8ArrayToHex } from "@tutao/tutanota-utils";
import { looksExecutable, nonClobberingFilename } from "../PathUtils.js";
import url from "node:url";
import { Buffer } from "node:buffer";
import { default as stream } from "node:stream";
import { FileOpenError } from "../../api/common/error/FileOpenError.js";
import { lang } from "../../misc/LanguageViewModel.js";
import { log } from "../DesktopLog.js";
import { BuildConfigKey, DesktopConfigKey } from "../config/ConfigKeys.js";
import { CancelledError } from "../../api/common/error/CancelledError.js";
const TAG = "[DesktopFileFacade]";
export class DesktopFileFacade {
    win;
    conf;
    dateProvider;
    fetch;
    electron;
    tfs;
    fs;
    /** We don't want to spam opening file manager all the time so we throttle it. This field is set to the last time we opened it. */
    lastOpenedFileManagerAt;
    constructor(win, conf, dateProvider, fetch, electron, tfs, fs) {
        this.win = win;
        this.conf = conf;
        this.dateProvider = dateProvider;
        this.fetch = fetch;
        this.electron = electron;
        this.tfs = tfs;
        this.fs = fs;
        this.lastOpenedFileManagerAt = null;
    }
    clearFileData() {
        this.tfs.clear();
        return Promise.resolve();
    }
    async deleteFile(filename) {
        return await this.fs.promises.unlink(filename);
    }
    async download(sourceUrl, fileName, headers) {
        const { status, headers: headersIncoming, body } = await this.fetch(sourceUrl, { method: "GET", headers });
        let encryptedFilePath;
        if (status == 200 && body != null) {
            const downloadDirectory = await this.tfs.ensureEncryptedDir();
            encryptedFilePath = path.join(downloadDirectory, fileName);
            const readable = bodyToReadable(body);
            await this.pipeIntoFile(readable, encryptedFilePath);
        }
        else {
            encryptedFilePath = null;
        }
        const result = {
            statusCode: status,
            encryptedFileUri: encryptedFilePath,
            errorId: getHttpHeader(headersIncoming, "error-id"),
            precondition: getHttpHeader(headersIncoming, "precondition"),
            suspensionTime: getHttpHeader(headersIncoming, "suspension-time") ?? getHttpHeader(headersIncoming, "retry-after"),
        };
        log.info(TAG, "Download finished", result.statusCode, result.suspensionTime);
        return result;
    }
    async pipeIntoFile(response, encryptedFilePath) {
        const fileStream = this.fs.createWriteStream(encryptedFilePath, { emitClose: true });
        try {
            await pipeStream(response, fileStream);
            await closeFileStream(fileStream);
        }
        catch (e) {
            // Close first, delete second
            // Also yes, we do need to close it manually:
            // > One important caveat is that if the Readable stream emits an error during processing, the Writable destination is not closed automatically.
            // > If an error occurs, it will be necessary to manually close each stream in order to prevent memory leaks.
            // see https://nodejs.org/api/stream.html#readablepipedestination-options
            await closeFileStream(fileStream);
            await this.fs.promises.unlink(encryptedFilePath);
            throw e;
        }
    }
    async getMimeType(file) {
        return await getMimeTypeForFile(file);
    }
    async getName(file) {
        return path.basename(file);
    }
    async getSize(fileUri) {
        const stats = await this.fs.promises.stat(fileUri);
        return stats.size;
    }
    async hashFile(fileUri) {
        const data = await this.fs.promises.readFile(fileUri);
        const checksum = sha256Hash(data).slice(0, 6);
        return uint8ArrayToBase64(checksum);
    }
    async joinFiles(filename, files) {
        const downloadDirectory = await this.tfs.ensureUnencrytpedDir();
        const filesInDirectory = await this.fs.promises.readdir(downloadDirectory);
        const newFilename = nonClobberingFilename(filesInDirectory, filename);
        const fileUri = path.join(downloadDirectory, newFilename);
        const outStream = this.fs.createWriteStream(fileUri, { autoClose: false });
        for (const infile of files) {
            await new Promise((resolve, reject) => {
                const readStream = this.fs.createReadStream(infile);
                readStream.on("end", resolve);
                readStream.on("error", reject);
                readStream.pipe(outStream, { end: false });
            });
        }
        await closeFileStream(outStream);
        return fileUri;
    }
    open(location /* , mimeType: string omitted */) {
        const tryOpen = () => this.electron.shell
            .openPath(location) // may resolve with "" or an error message
            .catch(() => "failed to open path.")
            .then((errMsg) => (errMsg === "" ? Promise.resolve() : Promise.reject(new FileOpenError("Could not open " + location + ", " + errMsg))));
        // only windows will happily execute a just downloaded program
        if (process.platform === "win32" && looksExecutable(location)) {
            return this.electron.dialog
                .showMessageBox({
                type: "warning",
                buttons: [lang.get("yes_label"), lang.get("no_label")],
                title: lang.get("executableOpen_label"),
                message: lang.get("executableOpen_msg"),
                defaultId: 1, // default button
            })
                .then(({ response }) => {
                if (response === 0) {
                    return tryOpen();
                }
                else {
                    return Promise.resolve();
                }
            });
        }
        else {
            return tryOpen();
        }
    }
    async openFileChooser(boundingRect, filter) {
        const opts = { properties: ["openFile", "multiSelections"] };
        if (filter != null) {
            opts.filters = [{ name: "Filter", extensions: filter.slice() }];
        }
        const { filePaths } = await this.electron.dialog.showOpenDialog(this.win._browserWindow, opts);
        return filePaths;
    }
    openFolderChooser() {
        // open folder dialog
        return this.electron.dialog
            .showOpenDialog(this.win._browserWindow, {
            properties: ["openDirectory"],
        })
            .then(({ filePaths }) => filePaths[0] ?? null);
    }
    async putFileIntoDownloadsFolder(localFileUri, fileNameToUse) {
        const savePath = await this.pickSavePath(fileNameToUse);
        await this.fs.promises.mkdir(path.dirname(savePath), {
            recursive: true,
        });
        await this.fs.promises.copyFile(localFileUri, savePath);
        await this.showInFileExplorer(savePath);
        return savePath;
    }
    async splitFile(fileUri, maxChunkSizeBytes) {
        const tempDir = await this.tfs.ensureUnencrytpedDir();
        const fullBytes = await this.fs.promises.readFile(fileUri);
        const chunks = splitUint8ArrayInChunks(maxChunkSizeBytes, fullBytes);
        // this could just be randomized, we don't seem to care about the blob file names
        const filenameHash = uint8ArrayToHex(sha256Hash(stringToUtf8Uint8Array(fileUri)));
        const chunkPaths = [];
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const fileName = `${filenameHash}.${i}.blob`;
            const chunkPath = path.join(tempDir, fileName);
            await this.fs.promises.writeFile(chunkPath, chunk);
            chunkPaths.push(chunkPath);
        }
        return chunkPaths;
    }
    async upload(fileUri, targetUrl, method, headers) {
        const fileStream = this.fs.createReadStream(fileUri);
        const stat = await this.fs.promises.stat(fileUri);
        headers["Content-Length"] = `${stat.size}`;
        const response = await this.fetch(targetUrl, { method, headers, body: fileStream });
        let responseBody;
        if ((response.status == 200 || response.status == 201) && response.body != null) {
            const readable = bodyToReadable(response.body);
            responseBody = await readStreamToBuffer(readable);
        }
        else {
            // this is questionable, should probably change the type
            responseBody = new Uint8Array([]);
        }
        return {
            statusCode: assertNotNull(response.status),
            errorId: getHttpHeader(response.headers, "error-id"),
            precondition: getHttpHeader(response.headers, "precondition"),
            suspensionTime: getHttpHeader(response.headers, "suspension-time") ?? getHttpHeader(response.headers, "retry-after"),
            responseBody,
        };
    }
    // this is only used to write decrypted data into our tmp
    async writeDataFile(file) {
        return await this.tfs.writeToDisk(file.data, "decrypted");
    }
    async writeDataFileToDirectory(file, directory) {
        const filePath = path.join(directory, file.name);
        await this.fs.promises.writeFile(filePath, file.data);
        return filePath;
    }
    // this is used to read unencrypted data from arbitrary locations
    async readDataFile(uriOrPath) {
        try {
            uriOrPath = url.fileURLToPath(uriOrPath);
        }
        catch (e) {
            // the thing already was a path, or at least not an URI
        }
        const name = path.basename(uriOrPath);
        try {
            const [data, mimeType] = await Promise.all([this.fs.promises.readFile(uriOrPath), this.getMimeType(uriOrPath)]);
            if (data == null)
                return null;
            return {
                _type: "DataFile",
                data,
                name,
                mimeType,
                size: data.length,
                id: undefined,
            };
        }
        catch (e) {
            return null;
        }
    }
    /** select a non-colliding name in the configured downloadPath, preferably with the given file name
     * public for testing */
    async pickSavePath(filename) {
        const defaultDownloadPath = await this.conf.getVar(DesktopConfigKey.defaultDownloadPath);
        if (defaultDownloadPath != null) {
            const fileName = path.basename(filename);
            return path.join(defaultDownloadPath, nonClobberingFilename(await this.fs.promises.readdir(defaultDownloadPath), fileName));
        }
        else {
            const { canceled, filePath } = await this.electron.dialog.showSaveDialog({
                defaultPath: path.join(this.electron.app.getPath("downloads"), filename),
            });
            if (canceled) {
                throw new CancelledError("Path selection cancelled");
            }
            else {
                return assertNotNull(filePath);
            }
        }
    }
    /** public for testing */
    async showInFileExplorer(savePath) {
        // See doc for _lastOpenedFileManagerAt on why we do this throttling.
        const lastOpenedFileManagerAt = this.lastOpenedFileManagerAt;
        const fileManagerTimeout = await this.conf.getConst(BuildConfigKey.fileManagerTimeout);
        if (lastOpenedFileManagerAt == null || this.dateProvider.now() - lastOpenedFileManagerAt > fileManagerTimeout) {
            this.lastOpenedFileManagerAt = this.dateProvider.now();
            await this.electron.shell.openPath(path.dirname(savePath));
        }
    }
}
export async function getMimeTypeForFile(file) {
    const ext = path.extname(file).slice(1);
    const { mimes } = await import("../flat-mimes.js");
    const candidates = mimes[ext];
    // sometimes there are multiple options, but we'll take the first and reorder if issues arise.
    return candidates != null ? candidates[0] : "application/octet-stream";
}
function closeFileStream(stream) {
    return new Promise((resolve) => {
        stream.on("close", resolve);
        stream.close();
    });
}
export async function readStreamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const data = [];
        stream.on("data", (chunk) => {
            data.push(chunk);
        });
        stream.on("end", () => {
            resolve(Buffer.concat(data));
        });
        stream.on("error", (err) => {
            reject(err);
        });
    });
}
function getHttpHeader(headers, name) {
    // All headers are in lowercase. Lowercase them just to be sure
    return headers.get(name.toLowerCase());
}
function pipeStream(stream, into) {
    return new Promise((resolve, reject) => {
        stream.on("error", reject);
        stream.pipe(into);
        into.on("finish", resolve);
        into.on("error", reject);
    });
}
function bodyToReadable(body) {
    // https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/65542
    return stream.Readable.fromWeb(body);
}
//# sourceMappingURL=DesktopFileFacade.js.map