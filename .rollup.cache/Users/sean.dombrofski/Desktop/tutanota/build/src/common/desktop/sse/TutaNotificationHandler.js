import { CredentialEncryptionMode } from "../../misc/credentials/CredentialEncryptionMode.js";
import { assertNotNull, base64ToBase64Url, neverNull } from "@tutao/tutanota-utils";
import { log } from "../DesktopLog";
import tutanotaModelInfo from "../../api/entities/tutanota/ModelInfo";
import { handleRestError } from "../../api/common/error/RestError";
const TAG = "[notifications]";
export class TutaNotificationHandler {
    windowManager;
    nativeCredentialFacade;
    sseStorage;
    notifier;
    alarmScheduler;
    alarmStorage;
    lang;
    fetch;
    appVersion;
    constructor(windowManager, nativeCredentialFacade, sseStorage, notifier, alarmScheduler, alarmStorage, lang, fetch, appVersion) {
        this.windowManager = windowManager;
        this.nativeCredentialFacade = nativeCredentialFacade;
        this.sseStorage = sseStorage;
        this.notifier = notifier;
        this.alarmScheduler = alarmScheduler;
        this.alarmStorage = alarmStorage;
        this.lang = lang;
        this.fetch = fetch;
        this.appVersion = appVersion;
    }
    async onMailNotification(sseInfo, notificationInfo) {
        const appWindow = this.windowManager.getAll().find((window) => window.getUserId() === notificationInfo.userId);
        if (appWindow && appWindow.isFocused()) {
            // no need for notification if user is looking right at the window
            return;
        }
        // we can't download the email if we don't have access to credentials
        const canShowExtendedNotification = (await this.nativeCredentialFacade.getCredentialEncryptionMode()) === CredentialEncryptionMode.DEVICE_LOCK &&
            (await this.sseStorage.getExtendedNotificationConfig(notificationInfo.userId)) !== "0" /* ExtendedNotificationMode.NoSenderOrSubject */;
        if (!canShowExtendedNotification) {
            const notificationId = notificationInfo.mailId
                ? `${notificationInfo.mailId.listId},${notificationInfo.mailId?.listElementId}`
                : notificationInfo.userId;
            this.notifier.submitGroupedNotification(this.lang.get("pushNewMail_msg"), notificationInfo.mailAddress, notificationId, (res) => this.onMailNotificationClick(res, notificationInfo));
            return;
        }
        const mailMetadata = await this.downloadMailMetadata(sseInfo, notificationInfo);
        if (mailMetadata == null)
            return;
        this.notifier.submitGroupedNotification(mailMetadata.sender.address, mailMetadata.firstRecipient?.address ?? "", mailMetadata._id.join(","), (res) => this.onMailNotificationClick(res, notificationInfo));
    }
    onMailNotificationClick(res, notificationInfo) {
        if (res === "click" /* NotificationResult.Click */) {
            let requestedPath;
            if (notificationInfo.mailId) {
                const mailIdParam = encodeURIComponent(`${notificationInfo.mailId.listId},${notificationInfo.mailId.listElementId}`);
                requestedPath = `?mail=${mailIdParam}`;
            }
            else {
                requestedPath = null;
            }
            this.windowManager.openMailBox({
                userId: notificationInfo.userId,
                mailAddress: notificationInfo.mailAddress,
            }, requestedPath);
        }
    }
    async downloadMailMetadata(sseInfo, ni) {
        const url = this.makeMailMetadataUrl(sseInfo, assertNotNull(ni.mailId));
        // decrypt access token
        const credentials = await this.nativeCredentialFacade.loadByUserId(ni.userId);
        if (credentials == null) {
            log.warn(`Not found credentials to download notification, userId ${ni.userId}`);
            return null;
        }
        log.debug(TAG, "downloading mail notification metadata");
        const headers = {
            v: tutanotaModelInfo.version.toString(),
            cv: this.appVersion,
            accessToken: credentials.accessToken,
        };
        try {
            const response = await this.fetch(url, { headers });
            if (!response.ok) {
                throw handleRestError(neverNull(response.status), url.toString(), response.headers.get("Error-Id"), null);
            }
            const parsedResponse = await response.json();
            return parsedResponse;
        }
        catch (e) {
            log.debug(TAG, "Error fetching mail metadata, " + e.message);
            return null;
        }
    }
    makeMailMetadataUrl(sseInfo, mailId) {
        const url = new URL(sseInfo.sseOrigin);
        url.pathname = `rest/tutanota/mail/${base64ToBase64Url(mailId.listId)}/${base64ToBase64Url(mailId.listElementId)}`;
        return url;
    }
    async onAlarmNotification(alarmNotification) {
        await this.alarmScheduler.handleAlarmNotification(alarmNotification);
    }
    async onUserRemoved(userId) {
        await this.alarmScheduler.unscheduleAllAlarms(userId);
    }
    async onLocalDataInvalidated() {
        await this.alarmScheduler.unscheduleAllAlarms();
        await this.alarmStorage.removePushIdentifierKeys();
        await this.windowManager.invalidateAlarms();
    }
}
//# sourceMappingURL=TutaNotificationHandler.js.map