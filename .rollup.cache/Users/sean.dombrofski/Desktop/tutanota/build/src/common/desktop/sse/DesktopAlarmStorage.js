import { elementIdPart } from "../../api/common/utils/EntityUtils";
import { DesktopConfigKey } from "../config/ConfigKeys";
import { base64ToUint8Array, findAllAndRemove, uint8ArrayToBase64 } from "@tutao/tutanota-utils";
import { log } from "../DesktopLog";
/**
 * manages session keys used for decrypting alarm notifications, encrypting & persisting them to disk
 */
export class DesktopAlarmStorage {
    conf;
    cryptoFacade;
    keyStoreFacade;
    /** push identifier id to key */
    sessionKeys;
    constructor(conf, cryptoFacade, keyStoreFacade) {
        this.conf = conf;
        this.cryptoFacade = cryptoFacade;
        this.keyStoreFacade = keyStoreFacade;
        this.sessionKeys = {};
    }
    /**
     * encrypt & store a session key to disk
     * @param pushIdentifierId pushIdentifier the key belongs to
     * @param pushIdentifierSessionKey unencrypted B64 encoded key to store
     * @returns {*}
     */
    async storePushIdentifierSessionKey(pushIdentifierId, pushIdentifierSessionKey) {
        const keys = (await this.conf.getVar(DesktopConfigKey.pushEncSessionKeys)) || {};
        if (!keys[pushIdentifierId]) {
            this.sessionKeys[pushIdentifierId] = uint8ArrayToBase64(pushIdentifierSessionKey);
            return this.keyStoreFacade.getDeviceKey().then((pw) => {
                keys[pushIdentifierId] = uint8ArrayToBase64(this.cryptoFacade.aes256EncryptKey(pw, pushIdentifierSessionKey));
                return this.conf.setVar(DesktopConfigKey.pushEncSessionKeys, keys);
            });
        }
        return Promise.resolve();
    }
    removePushIdentifierKeys() {
        this.sessionKeys = {};
        return this.conf.setVar(DesktopConfigKey.pushEncSessionKeys, null);
    }
    removePushIdentifierKey(piId) {
        log.debug("Remove push identifier key. elementId=" + piId);
        delete this.sessionKeys[piId];
        return this.conf.setVar(DesktopConfigKey.pushEncSessionKeys, this.sessionKeys);
    }
    /**
     * try to get a B64 encoded PushIdentifierSessionKey that can decrypt a notificationSessionKey from memory or decrypt it from disk storage
     * @param notificationSessionKey one notificationSessionKey from an alarmNotification.
     * @return {Promise<?Base64>} a stored pushIdentifierSessionKey that should be able to decrypt the given notificationSessionKey
     */
    async getPushIdentifierSessionKey(notificationSessionKey) {
        const pw = await this.keyStoreFacade.getDeviceKey();
        const pushIdentifierId = elementIdPart(notificationSessionKey.pushIdentifier);
        if (this.sessionKeys[pushIdentifierId]) {
            return base64ToUint8Array(this.sessionKeys[pushIdentifierId]);
        }
        else {
            const keys = (await this.conf.getVar(DesktopConfigKey.pushEncSessionKeys)) || {};
            const sessionKeyFromConf = keys[pushIdentifierId];
            if (sessionKeyFromConf == null) {
                // key with this id is not saved in local conf, so we can't resolve it
                return null;
            }
            try {
                const decryptedKey = this.cryptoFacade.unauthenticatedAes256DecryptKey(pw, base64ToUint8Array(sessionKeyFromConf));
                this.sessionKeys[pushIdentifierId] = uint8ArrayToBase64(decryptedKey);
                return decryptedKey;
            }
            catch (e) {
                console.warn("could not decrypt pushIdentifierSessionKey");
                return null;
            }
        }
    }
    async storeAlarm(alarm) {
        const allAlarms = await this.getScheduledAlarms();
        findAllAndRemove(allAlarms, (an) => an.alarmInfo.alarmIdentifier === alarm.alarmInfo.alarmIdentifier);
        allAlarms.push(alarm);
        await this._saveAlarms(allAlarms);
    }
    async deleteAlarm(identifier) {
        const allAlarms = await this.getScheduledAlarms();
        findAllAndRemove(allAlarms, (an) => an.alarmInfo.alarmIdentifier === identifier);
        await this._saveAlarms(allAlarms);
    }
    /**
     * If userId is null then we delete alarms for all users
     */
    async deleteAllAlarms(userId) {
        if (userId == null) {
            return this._saveAlarms([]);
        }
        else {
            const allScheduledAlarms = await this.getScheduledAlarms();
            findAllAndRemove(allScheduledAlarms, (alarm) => alarm.user === userId);
            return this._saveAlarms(allScheduledAlarms);
        }
    }
    async getScheduledAlarms() {
        // the model for alarm notifications changed and we may have stored some that are missing the
        // excludedDates field.
        // to be able to decrypt & map these we need to at least add a plausible value there
        // we'll unschedule, redownload and reschedule the fixed instances after login.
        const alarms = await this.conf.getVar(DesktopConfigKey.scheduledAlarms);
        return (alarms?.map((a) => {
            if (!a.repeatRule)
                return a;
            a.repeatRule = { excludedDates: [], ...a.repeatRule };
            return a;
        }) || []);
    }
    _saveAlarms(alarms) {
        return this.conf.setVar(DesktopConfigKey.scheduledAlarms, alarms);
    }
}
//# sourceMappingURL=DesktopAlarmStorage.js.map