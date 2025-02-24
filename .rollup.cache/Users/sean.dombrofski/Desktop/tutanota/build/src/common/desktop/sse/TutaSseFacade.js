import { makeTaggedLogger } from "../DesktopLog.js";
import { typeModels } from "../../api/entities/sys/TypeModels.js";
import { assertNotNull, base64ToBase64Url, filterInt, neverNull, stringToUtf8Uint8Array, uint8ArrayToBase64 } from "@tutao/tutanota-utils";
import { handleRestError } from "../../api/common/error/RestError.js";
const log = makeTaggedLogger("[SSEFacade]");
export const MISSED_NOTIFICATION_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days
export class TutaSseFacade {
    sseStorage;
    notificationHandler;
    sseClient;
    crypto;
    appVersion;
    fetch;
    date;
    currentSseInfo = null;
    constructor(sseStorage, notificationHandler, sseClient, crypto, appVersion, fetch, date) {
        this.sseStorage = sseStorage;
        this.notificationHandler = notificationHandler;
        this.sseClient = sseClient;
        this.crypto = crypto;
        this.appVersion = appVersion;
        this.fetch = fetch;
        this.date = date;
        sseClient.setEventListener(this);
    }
    async connect() {
        if (await this.hasNotificationTTLExpired()) {
            await this.notificationHandler.onLocalDataInvalidated();
            await this.sseStorage.clear();
            return;
        }
        if (this.currentSseInfo != null) {
            await this.disconnect();
        }
        const sseInfo = await this.sseStorage.getSseInfo();
        if (sseInfo == null) {
            log.debug("No SSE info");
            return;
        }
        const url = this.getSseUrl(sseInfo, sseInfo.userIds[0]);
        const headers = {
            v: typeModels.MissedNotification.version,
            cv: this.appVersion,
        };
        const timeout = await this.sseStorage.getHeartbeatTimeoutSec();
        if (timeout != null) {
            this.sseClient.setReadTimeout(timeout);
        }
        await this.sseClient.connect({ url, headers });
        this.currentSseInfo = sseInfo;
    }
    /**
     * We remember the last time we connected or fetched missed notification and if since the last time we did the the TTL time has
     * expired, we certainly missed some updates.
     * We need to unschedule all alarms and to tell web part that we would like alarms to be scheduled all over.
     */
    async hasNotificationTTLExpired() {
        const lastMissedNotificationCheckTime = await this.sseStorage.getMissedNotificationCheckTime();
        log.debug("last missed notification check:", {
            lastMissedNotificationCheckTime,
        });
        return lastMissedNotificationCheckTime != null && this.date.now() - lastMissedNotificationCheckTime > MISSED_NOTIFICATION_TTL;
    }
    getSseUrl(sseInfo, userId) {
        const url = new URL(sseInfo.sseOrigin);
        url.pathname = "sse";
        url.searchParams.append("_body", this.requestJson(sseInfo.identifier, userId));
        return url;
    }
    requestJson(identifier, userId) {
        return JSON.stringify({
            _format: "0",
            identifier: identifier,
            userIds: [
                {
                    _id: this.crypto.generateId(4),
                    value: userId,
                },
            ],
        });
    }
    async onNotification() {
        if ((await this.sseStorage.getMissedNotificationCheckTime()) == null) {
            // We set default value for  the case when Push identifier was added but no notifications were received. Then more than
            // MISSED_NOTIFICATION_TTL has passed and notifications has expired
            await this.sseStorage.recordMissedNotificationCheckTime();
        }
        if (await this.hasNotificationTTLExpired()) {
            await this.notificationHandler.onLocalDataInvalidated();
            return;
        }
        let missedNotification;
        try {
            missedNotification = await this.downloadMissedNotification();
        }
        catch (e) {
            log.warn("Failed to download missed notification", e);
            return;
        }
        await this.sseStorage.setLastProcessedNotificationId(assertNotNull(missedNotification.lastProcessedNotificationId));
        await this.sseStorage.recordMissedNotificationCheckTime();
        const sseInfo = this.currentSseInfo;
        if (sseInfo == null)
            return;
        for (const notificationInfo of missedNotification.notificationInfos) {
            await this.notificationHandler.onMailNotification(sseInfo, notificationInfo);
        }
        for (const alarmNotification of missedNotification.alarmNotifications) {
            await this.notificationHandler.onAlarmNotification(alarmNotification);
        }
    }
    async downloadMissedNotification() {
        const sseInfo = assertNotNull(this.currentSseInfo);
        const url = this.makeMissedNotificationUrl(sseInfo);
        log.debug("downloading missed notification");
        const headers = {
            userIds: sseInfo.userIds[0],
            v: typeModels.MissedNotification.version,
            cv: this.appVersion,
        };
        const lastProcessedId = await this.sseStorage.getLastProcessedNotificationId();
        if (lastProcessedId) {
            headers["lastProcessedNotificationId"] = lastProcessedId;
        }
        const res = await this.fetch(url, { headers });
        if (!res.ok) {
            throw handleRestError(neverNull(res.status), url, res.headers.get("error-id"), null);
        }
        else {
            const json = await res.json();
            log.debug("downloaded missed notification");
            return json;
        }
    }
    makeMissedNotificationUrl(sseInfo) {
        const { identifier, sseOrigin } = sseInfo;
        const customId = uint8ArrayToBase64(stringToUtf8Uint8Array(identifier));
        const url = new URL(sseOrigin);
        url.pathname = "rest/sys/missednotification/" + base64ToBase64Url(customId);
        return url.toString();
    }
    async onNewMessage(message) {
        if (message === "data: notification") {
            log.debug("notification");
            await this.onNotification();
            // deal with it
        }
        else if (message.startsWith("data: heartbeatTimeout:")) {
            const timeoutString = message.split(":").at(2);
            log.debug("heartbeatTimeout", timeoutString);
            const timeout = timeoutString == null ? null : filterInt(timeoutString);
            if (timeout != null && !isNaN(timeout)) {
                await this.sseStorage.setHeartbeatTimeoutSec(timeout);
                this.sseClient.setReadTimeout(timeout);
            }
        }
    }
    async onNotAuthenticated() {
        // invalid userids
        log.debug("got NotAuthenticated, deleting userId");
        let lastSseInfo = this.currentSseInfo;
        this.currentSseInfo = null;
        if (lastSseInfo == null) {
            log.warn("NotAuthorized while not connected?");
            return;
        }
        const firstUser = lastSseInfo.userIds.at(0);
        await this.removeUserIdInternal(firstUser);
    }
    async removeUser(userId) {
        await this.removeUserIdInternal(userId);
        await this.connect();
    }
    async removeUserIdInternal(userId) {
        let sseInfo;
        if (userId != null) {
            sseInfo = await this.sseStorage.removeUser(userId);
            await this.notificationHandler.onUserRemoved(userId);
        }
        else {
            sseInfo = await this.sseStorage.getSseInfo();
        }
        if (sseInfo?.userIds.length === 0) {
            log.debug("No user ids, skipping reconnect");
            await this.notificationHandler.onLocalDataInvalidated();
            await this.sseStorage.clear();
        }
    }
    async reconnect() {
        await this.disconnect();
        await this.connect();
    }
    async disconnect() {
        this.currentSseInfo = null;
        await this.sseClient.disconnect();
    }
}
//# sourceMappingURL=TutaSseFacade.js.map