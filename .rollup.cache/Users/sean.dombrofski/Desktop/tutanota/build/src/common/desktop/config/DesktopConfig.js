import { defer, downcast } from "@tutao/tutanota-utils";
import { DesktopConfigEncKey, DesktopConfigKey } from "./ConfigKeys";
import { log } from "../DesktopLog";
import { ProgrammingError } from "../../api/common/error/ProgrammingError";
import { CryptoError } from "@tutao/tutanota-crypto/error.js";
/**
 * manages build and user config
 */
export class DesktopConfig {
    migrator;
    keyStoreFacade;
    cryptoFacade;
    buildConfig;
    desktopConfig; // user preferences as set for this installation
    desktopConfigFile;
    onValueSetListeners = {};
    constructor(migrator, keyStoreFacade, cryptoFacade) {
        this.migrator = migrator;
        this.keyStoreFacade = keyStoreFacade;
        this.cryptoFacade = cryptoFacade;
        this.buildConfig = defer();
        this.desktopConfig = defer();
    }
    async init(buildConfigFile, desktopConfigFile) {
        const packageJson = await buildConfigFile.readJSON();
        const buildConfig = packageJson["tutao-config"];
        this.buildConfig.resolve(buildConfig);
        this.desktopConfigFile = desktopConfigFile;
        const defaultConf = buildConfig["defaultDesktopConfig"];
        // create default config if none exists
        await this.desktopConfigFile.ensurePresence(defaultConf);
        const userConf = (await this.desktopConfigFile.readJSON()) || defaultConf;
        const populatedConfig = Object.assign({}, defaultConf, userConf);
        const desktopConfig = await this.migrator.applyMigrations(downcast(buildConfig["configMigrationFunction"]), populatedConfig);
        await this.desktopConfigFile.writeJSON(desktopConfig);
        this.desktopConfig.resolve(desktopConfig);
    }
    async getConst(key) {
        const config = await this.buildConfig.promise;
        return key ? config[key] : config;
    }
    async getVar(key) {
        const desktopConfig = await this.desktopConfig.promise;
        if (key in DesktopConfigKey) {
            return desktopConfig[key];
        }
        else if (key in DesktopConfigEncKey) {
            return this.getEncryptedVar(key);
        }
    }
    async getEncryptedVar(key) {
        const desktopConfig = await this.desktopConfig.promise;
        const encryptedValue = desktopConfig[key];
        if (!encryptedValue) {
            return null;
        }
        const deviceKey = await this.keyStoreFacade.getDeviceKey();
        try {
            return this.cryptoFacade.aesDecryptObject(deviceKey, downcast(encryptedValue));
        }
        catch (e) {
            if (e instanceof CryptoError) {
                log.error(`Could not decrypt encrypted var ${key}`, e);
                await this.setVar(key, null);
                return null;
            }
        }
    }
    async setEncryptedVar(key, value) {
        const deviceKey = await this.keyStoreFacade.getDeviceKey();
        let encryptedValue;
        if (value != null) {
            encryptedValue = this.cryptoFacade.aesEncryptObject(deviceKey, value);
        }
        else {
            encryptedValue = null;
        }
        const desktopConfig = await this.desktopConfig.promise;
        desktopConfig[key] = encryptedValue;
    }
    /**
     * change the runtime-defined config and write it to disk
     * @param key value to change. a key of "any" will replace the conf object with value.
     * @param value the new value
     * @returns {never|Promise<any>|Promise<void>|*}
     */
    async setVar(key, value) {
        const desktopConfig = await this.desktopConfig.promise;
        if (Object.values(DesktopConfigKey).includes(downcast(key))) {
            desktopConfig[key] = value;
        }
        else if (Object.values(DesktopConfigEncKey).includes(downcast(key))) {
            if (value == null) {
                desktopConfig[key] = value;
            }
            else {
                await this.setEncryptedVar(key, value);
            }
        }
        else {
            throw new ProgrammingError("Unknown config key: " + key);
        }
        await this.saveAndNotify(key, value);
    }
    async saveAndNotify(key, value) {
        const desktopConfig = await this.desktopConfig.promise;
        await this.desktopConfigFile.writeJSON(desktopConfig);
        this.notifyChangeListeners(key, value);
    }
    /**
     * listen to changes in the config
     * @param key the value you want to listen for. a key of "any" will be called with the complete config for any changes to the config.
     * @param cb a function that's called when the config changes. argument is the new value or the entire config object in case of the "any" event.
     * @returns {DesktopConfig}
     */
    on(key, cb) {
        return this.addListener(key, { cb, once: false });
    }
    once(key, cb) {
        return this.addListener(key, { cb, once: true });
    }
    addListener(key, callback) {
        if (!this.onValueSetListeners[key]) {
            this.onValueSetListeners[key] = [callback];
        }
        else {
            this.onValueSetListeners[key].push(callback);
        }
        return this;
    }
    removeAllListeners(key) {
        if (key) {
            this.onValueSetListeners[key] = [];
        }
        else {
            this.onValueSetListeners = {};
        }
        return this;
    }
    removeListener(key, cb) {
        if (!this.onValueSetListeners[key])
            return this;
        const indexOfListener = this.onValueSetListeners[key].findIndex((listener) => listener.cb === cb);
        this.onValueSetListeners[key].splice(indexOfListener, 1);
        return this;
    }
    notifyChangeListeners(key, value) {
        const listeners = this.onValueSetListeners[key];
        if (listeners == null)
            return;
        for (const { cb } of listeners)
            cb(value);
        this.onValueSetListeners[key] = listeners.filter((listener) => !listener.once);
    }
}
//# sourceMappingURL=DesktopConfig.js.map