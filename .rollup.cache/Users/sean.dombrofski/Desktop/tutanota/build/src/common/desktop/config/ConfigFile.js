import path from "node:path";
const instances = {};
/**
 * get an instance of ConfigFile pointing at a certain path
 * @param p {string} path to file the configFile should write to
 * @param fs the fs object returned by "import fs from ''fs"
 */
export function getConfigFile(p, f, fs) {
    const fullpath = path.join(p, f);
    if (!Object.keys(instances).includes(fullpath)) {
        instances[fullpath] = new ConfigFile(p, fullpath, fs);
    }
    return instances[fullpath];
}
export class ConfigFile {
    filePath;
    fullpath;
    fs;
    accessPromise;
    /**
     * @param filePath path to the file the json objects should be stored in
     **/
    constructor(filePath, fullpath, fs) {
        this.filePath = filePath;
        this.fullpath = fullpath;
        this.fs = fs;
        this.accessPromise = Promise.resolve();
    }
    ensurePresence(defaultObj) {
        try {
            this.fs.accessSync(this.fullpath, this.fs.constants.F_OK);
        }
        catch (e) {
            return this.writeJSON(defaultObj || {});
        }
        return Promise.resolve();
    }
    readJSON() {
        this.accessPromise = this.accessPromise
            .then(() => this.fs.promises.readFile(this.fullpath, "utf8"))
            .then((t) => JSON.parse(t))
            .catch((e) => {
            // catch needed to make future reads/writes work
            console.error("failed to read config!", e);
        });
        return this.accessPromise;
    }
    /**
     * asynchronously write an object to a file.
     * multiple writes are handled in a fifo manner to prevent race conditions that could
     * cause the file to contain invalid json
     * deliberately not using async to make sure the chain of writes doesn't branch.
     *
     * @param obj the object to serialize
     * @returns {Promise<void>} resolves when the object has been written
     */
    writeJSON(obj) {
        this.accessPromise = this.accessPromise
            .then(() => this.fs.promises.mkdir(this.filePath, { recursive: true }))
            .then(() => JSON.stringify(obj, null, 2))
            .then((json) => this.fs.promises.writeFile(this.fullpath, json))
            .catch((e) => {
            console.error("failed to write conf:", e);
        });
        return this.accessPromise;
    }
}
//# sourceMappingURL=ConfigFile.js.map