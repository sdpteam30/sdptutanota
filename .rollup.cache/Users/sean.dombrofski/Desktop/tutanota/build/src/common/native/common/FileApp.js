import { promiseMap } from "@tutao/tutanota-utils";
export class NativeFileApp {
    fileFacade;
    exportFacade;
    constructor(fileFacade, exportFacade) {
        this.fileFacade = fileFacade;
        this.exportFacade = exportFacade;
    }
    /**
     * Open the file
     * @param file The uri of the file
     */
    open(file) {
        return this.fileFacade.open(file.location, file.mimeType);
    }
    /**
     * Opens a file chooser to select a file.
     * @param boundingRect The file chooser is opened next to the rectangle.
     * @param filter an optional list of allowed file extensions
     */
    async openFileChooser(boundingRect, filter, isFileOnly = false) {
        /* The file chooser opens next to a location specified by srcRect on larger devices (iPad).
         * The rectangle must be specifed using values for x, y, height and width.
         */
        const srcRect = {
            x: Math.round(boundingRect.left),
            y: Math.round(boundingRect.top),
            width: Math.round(boundingRect.width),
            height: Math.round(boundingRect.height),
        };
        const files = await this.fileFacade.openFileChooser(srcRect, filter ?? null, isFileOnly);
        return promiseMap(files, this.uriToFileRef.bind(this));
    }
    openFolderChooser() {
        return this.fileFacade.openFolderChooser();
    }
    /**
     * Deletes the file.
     * @param  file The uri of the file to delete.
     */
    deleteFile(file) {
        return this.fileFacade.deleteFile(file);
    }
    /**
     * Returns the name of the file
     * @param file The uri of the file
     */
    getName(file) {
        return this.fileFacade.getName(file);
    }
    /**
     * Returns the mime type of the file
     * @param file The uri of the file
     */
    getMimeType(file) {
        return this.fileFacade.getMimeType(file);
    }
    /**
     * Returns the byte size of a file
     * @param file The uri of the file
     */
    getSize(file) {
        return this.fileFacade.getSize(file);
    }
    /**
     * Copies the file into downloads folder and notifies system and user about that
     * @param localFileUri URI for the source file
     * @returns {*} absolute path of the destination file
     */
    putFileIntoDownloadsFolder(localFileUri, fileNameToUse) {
        return this.fileFacade.putFileIntoDownloadsFolder(localFileUri, fileNameToUse);
    }
    async writeDataFile(data) {
        const fileUri = await this.fileFacade.writeDataFile(data);
        return {
            _type: "FileReference",
            name: data.name,
            mimeType: data.mimeType,
            size: data.size,
            location: fileUri,
        };
    }
    /**
     * Uploads the binary data of a file to tutadb
     */
    upload(fileUrl, targetUrl, method, headers) {
        return this.fileFacade.upload(fileUrl, targetUrl, method, headers);
    }
    /**
     * Downloads the binary data of a file from tutadb and stores it in the internal memory.
     * @returns Resolves to the URI of the downloaded file
     */
    download(sourceUrl, filename, headers) {
        return this.fileFacade.download(sourceUrl, filename, headers);
    }
    /**
     * Get the shortened (first six bytes) of the SHA256 of the file.
     * @param fileUri
     * @return Base64 encoded, shortened SHA256 hash of the file
     */
    hashFile(fileUri) {
        return this.fileFacade.hashFile(fileUri);
    }
    clearFileData() {
        return this.fileFacade.clearFileData();
    }
    /**
     * take a file location in the form of
     *   - a uri like file:///home/user/cat.jpg
     *   - an absolute file path like C:\Users\cat.jpg
     * and return a DataFile populated
     * with data and metadata of that file on disk.
     *
     * returns null
     *   - if invoked in apps, because they use FileRef, not DataFile
     *   - if file can't be opened for any reason
     *   - if path is not absolute
     */
    async readDataFile(uriOrPath) {
        return this.fileFacade.readDataFile(uriOrPath);
    }
    /**
     * Generate an MSG file from the mail bundle and save it in the temp export directory
     * @param bundle
     * @param fileName
     * @returns {Promise<*>}
     */
    mailToMsg(bundle, fileName) {
        return this.exportFacade.mailToMsg(bundle, fileName);
    }
    /**
     * drag given file names from the temp directory
     * @returns {Promise<*>}
     * @param fileNames: relative paths to files from the export directory
     */
    startNativeDrag(fileNames) {
        return this.exportFacade.startNativeDrag(fileNames);
    }
    saveToExportDir(file) {
        return this.exportFacade.saveToExportDir(file);
    }
    checkFileExistsInExportDir(path) {
        return this.exportFacade.checkFileExistsInExportDir(path);
    }
    getFilesMetaData(filesUris) {
        return promiseMap(filesUris, async (uri) => {
            const [name, mimeType, size] = await Promise.all([this.getName(uri), this.getMimeType(uri), this.getSize(uri)]);
            return {
                _type: "FileReference",
                name,
                mimeType,
                size,
                location: uri,
            };
        });
    }
    uriToFileRef(uri) {
        return Promise.all([this.getName(uri), this.getMimeType(uri), this.getSize(uri)]).then(([name, mimeType, size]) => ({
            _type: "FileReference",
            name,
            mimeType,
            size,
            location: uri,
        }));
    }
    /**
     * Joins the given files into one single file with a given name. The file is place in the app's temporary decrypted directory.
     * @param filename the resulting filename
     * @param files The files to join.
     *
     */
    joinFiles(filename, files) {
        return this.fileFacade.joinFiles(filename, files);
    }
    /**
     * Splits the given file into chunks of the given maximum size. The chunks will be placed in the temporary decrypted directory.
     * @param fileUri
     * @param maxChunkSizeBytes
     */
    async splitFile(fileUri, maxChunkSizeBytes) {
        return this.fileFacade.splitFile(fileUri, maxChunkSizeBytes);
    }
}
//# sourceMappingURL=FileApp.js.map