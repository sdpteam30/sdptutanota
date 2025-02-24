import { DesktopConfigEncKey, DesktopConfigKey } from "../config/ConfigKeys.js";
import { remove } from "@tutao/tutanota-utils";
const DEFAULT_EXTENDED_NOTIFICATION_MODE = "0" /* ExtendedNotificationMode.NoSenderOrSubject */;
export class SseStorage {
    conf;
    constructor(conf) {
        this.conf = conf;
    }
    async getSseInfo() {
        return (await this.conf.getVar(DesktopConfigEncKey.sseInfo));
    }
    async storePushIdentifier(identifier, userId, sseOrigin) {
        const previousSseInfo = await this.getSseInfo();
        let newSseInfo;
        if (!previousSseInfo) {
            newSseInfo = {
                identifier,
                userIds: [userId],
                sseOrigin,
            };
        }
        else {
            newSseInfo = previousSseInfo;
            newSseInfo.identifier = identifier;
            newSseInfo.sseOrigin = sseOrigin;
            if (!newSseInfo.userIds.includes(userId)) {
                newSseInfo.userIds.push(userId);
            }
        }
        await this.conf.setVar(DesktopConfigEncKey.sseInfo, newSseInfo);
        // Provide right defaults for extended notification mode.
        //  - Start with "nothing" as a conservative default
        //  - If notifications were not used before, enable extended notifications
        if (previousSseInfo == null || !previousSseInfo.userIds.includes(userId)) {
            await this.setExtendedNotificationConfig(userId, "1" /* ExtendedNotificationMode.OnlySender */);
        }
    }
    async removeUser(userId) {
        const sseInfo = await this.getSseInfo();
        if (sseInfo != null) {
            remove(sseInfo.userIds, userId);
            await this.conf.setVar(DesktopConfigEncKey.sseInfo, sseInfo);
            return sseInfo;
        }
        else {
            return null;
        }
    }
    async getMissedNotificationCheckTime() {
        const value = await this.conf.getVar(DesktopConfigKey.lastMissedNotificationCheckTime);
        return value ?? null;
    }
    async recordMissedNotificationCheckTime() {
        await this.conf.setVar(DesktopConfigKey.lastMissedNotificationCheckTime, Date.now());
    }
    async getLastProcessedNotificationId() {
        const value = await this.conf.getVar(DesktopConfigKey.lastProcessedNotificationId);
        return value ?? null;
    }
    async setLastProcessedNotificationId(id) {
        await this.conf.setVar(DesktopConfigKey.lastProcessedNotificationId, id);
    }
    async getHeartbeatTimeoutSec() {
        const value = await this.conf.getVar(DesktopConfigKey.heartbeatTimeoutInSeconds);
        return value ?? null;
    }
    async setHeartbeatTimeoutSec(timeout) {
        await this.conf.setVar(DesktopConfigKey.heartbeatTimeoutInSeconds, timeout);
    }
    async getExtendedNotificationConfig(userId) {
        const object = (await this.conf.getVar(DesktopConfigKey.extendedNotificationMode)) ?? {};
        return object[userId] ?? DEFAULT_EXTENDED_NOTIFICATION_MODE;
    }
    async setExtendedNotificationConfig(userId, mode) {
        const object = (await this.conf.getVar(DesktopConfigKey.extendedNotificationMode)) ?? {};
        object[userId] = mode;
        return this.conf.setVar(DesktopConfigKey.extendedNotificationMode, object);
    }
    async clear() {
        await this.conf.setVar(DesktopConfigKey.lastMissedNotificationCheckTime, null);
        await this.conf.setVar(DesktopConfigKey.lastProcessedNotificationId, null);
        await this.conf.setVar(DesktopConfigKey.heartbeatTimeoutInSeconds, null);
        await this.conf.setVar(DesktopConfigEncKey.sseInfo, null);
    }
}
//# sourceMappingURL=SseStorage.js.map