import { log } from "./DesktopLog";
import { getFromMap } from "@tutao/tutanota-utils";
import { base64ToKey, keyToBase64 } from "@tutao/tutanota-crypto";
import { DeviceStorageUnavailableError } from "../api/common/error/DeviceStorageUnavailableError.js";
import { CancelledError } from "../api/common/error/CancelledError";
export const DeviceKeySpec = Object.freeze({
    serviceName: "tutanota-vault",
    accountName: "tuta",
    cached: true,
});
export const CredentialsKeySpec = Object.freeze({
    serviceName: "tutanota-credentials",
    accountName: "tutanota-credentials",
    // Credentials key should not be cached, we should ask it every time we operate on credentials (there's already intermediate in web to avoid asking
    // too many times)
    cached: false,
});
/** Interface for accessing/generating/caching keys. */
export class DesktopKeyStoreFacade {
    secretStorage;
    crypto;
    resolvedKeys = new Map();
    constructor(secretStorage, crypto) {
        this.secretStorage = secretStorage;
        this.crypto = crypto;
    }
    /**
     * get the key used to encrypt alarms and settings
     */
    async getDeviceKey() {
        // Device key can be cached
        return this.resolveKey(DeviceKeySpec);
    }
    /**
     * get the key used to encrypt saved credentials
     */
    async getKeyChainKey() {
        return this.resolveKey(CredentialsKeySpec);
    }
    resolveKey(spec) {
        // Asking for the same key in parallel easily breaks gnome-keyring so we cache the promise.
        const entry = getFromMap(this.resolvedKeys, spec, () => this.fetchOrGenerateKey(spec));
        if (spec.cached) {
            // We only want to cache *successful* promises, otherwise we have no chance to retry.
            return entry.catch((e) => {
                this.resolvedKeys.delete(spec);
                throw e;
            });
        }
        else {
            // If we don't want to cache the key we remove it in any case.
            return entry.finally(() => {
                this.resolvedKeys.delete(spec);
            });
        }
    }
    async fetchOrGenerateKey(spec) {
        log.debug("resolving key...", spec.serviceName);
        try {
            return (await this.fetchKey(spec)) ?? (await this.generateAndStoreKey(spec));
        }
        catch (e) {
            log.warn("Failed to resolve/generate key: ", spec.serviceName, e);
            if (e instanceof CancelledError) {
                throw e;
            }
            throw new DeviceStorageUnavailableError("failed to resolve/generate key", e);
        }
    }
    async fetchKey(spec) {
        const base64 = await this.secretStorage.getPassword(spec.serviceName, spec.accountName);
        if (base64 == null) {
            return null;
        }
        return base64ToKey(base64);
    }
    async generateAndStoreKey(spec) {
        log.warn(`key ${spec.serviceName} not found, generating a new one`);
        const key = this.crypto.generateDeviceKey();
        const base64 = keyToBase64(key);
        await this.secretStorage.setPassword(spec.serviceName, spec.accountName, base64);
        return key;
    }
}
//# sourceMappingURL=DesktopKeyStoreFacade.js.map