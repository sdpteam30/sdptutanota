import { createPushIdentifier, PushIdentifierTypeRef } from "../../api/entities/sys/TypeRefs.js";
import { assertNotNull } from "@tutao/tutanota-utils";
import { lang } from "../../misc/LanguageViewModel";
import { isAndroidApp, isApp, isDesktop, isIOSApp } from "../../api/common/Env";
import { client } from "../../misc/ClientDetector";
import { getElementId } from "../../api/common/utils/EntityUtils";
import { locator } from "../../api/main/CommonLocator";
import { DeviceStorageUnavailableError } from "../../api/common/error/DeviceStorageUnavailableError";
import modelInfo from "../../api/entities/sys/ModelInfo.js";
// keep in sync with SYS_MODEL_VERSION in app-android/app/build.gradle
// keep in sync with SYS_MODEL_VERSION in app-android/calendar/build.gradle.kts
// keep in sync with app-ios/TutanotaSharedFramework/Utils/Utils.swift
const MOBILE_SYS_MODEL_VERSION = 99;
function effectiveModelVersion() {
    // on desktop we use generated classes
    // on mobile we use hand-written classes
    return isDesktop() ? modelInfo.version : MOBILE_SYS_MODEL_VERSION;
}
export class NativePushServiceApp {
    nativePushFacade;
    logins;
    cryptoFacade;
    entityClient;
    deviceConfig;
    calendarFacade;
    app;
    _currentIdentifier = null;
    constructor(nativePushFacade, logins, cryptoFacade, entityClient, deviceConfig, calendarFacade, app) {
        this.nativePushFacade = nativePushFacade;
        this.logins = logins;
        this.cryptoFacade = cryptoFacade;
        this.entityClient = entityClient;
        this.deviceConfig = deviceConfig;
        this.calendarFacade = calendarFacade;
        this.app = app;
    }
    async register() {
        console.log("Registering for push notifications for app", this.app);
        if (isAndroidApp() || isDesktop()) {
            try {
                const identifier = (await this.loadPushIdentifierFromNative()) ?? (await locator.workerFacade.generateSsePushIdentifer());
                const pushIdentifier = (await this.loadPushIdentifier(identifier)) ?? (await this.createPushIdentifierInstance(identifier, "3" /* PushServiceType.SSE */));
                this._currentIdentifier = { identifier, disabled: pushIdentifier.disabled };
                await this.storePushIdentifierLocally(pushIdentifier); // Also sets the extended notification mode to SENDER_AND_SUBJECT if the user is new
                const userId = this.logins.getUserController().userId;
                if (!(await locator.pushService.allowReceiveCalendarNotifications())) {
                    await this.nativePushFacade.invalidateAlarmsForUser(userId);
                }
                else {
                    await this.scheduleAlarmsIfNeeded(pushIdentifier);
                }
                await this.initPushNotifications();
            }
            catch (e) {
                if (e instanceof DeviceStorageUnavailableError) {
                    console.warn("Device storage is unavailable, cannot register for push notifications", e);
                }
                else {
                    throw e;
                }
            }
        }
        else if (isIOSApp()) {
            const identifier = await this.loadPushIdentifierFromNative();
            if (identifier) {
                const pushIdentifier = (await this.loadPushIdentifier(identifier)) ?? (await this.createPushIdentifierInstance(identifier, "1" /* PushServiceType.IOS */));
                this._currentIdentifier = { identifier, disabled: pushIdentifier.disabled };
                if (pushIdentifier.language !== lang.code) {
                    pushIdentifier.language = lang.code;
                    locator.entityClient.update(pushIdentifier);
                }
                await this.storePushIdentifierLocally(pushIdentifier);
                const userId = this.logins.getUserController().userId;
                if (!(await locator.pushService.allowReceiveCalendarNotifications())) {
                    await this.nativePushFacade.invalidateAlarmsForUser(userId);
                }
                else {
                    await this.scheduleAlarmsIfNeeded(pushIdentifier);
                }
            }
            else {
                console.log("Push notifications were rejected by user");
            }
        }
    }
    async reRegister() {
        console.log("re-registering for push notifications, setting no alarms as scheduled");
        this.deviceConfig.setNoAlarmsScheduled();
        if (this.logins.isUserLoggedIn()) {
            await this.logins.waitForFullLogin();
            return this.register();
        }
        else {
            return Promise.resolve();
        }
    }
    async invalidateAlarmsForUser(userId) {
        return this.nativePushFacade.invalidateAlarmsForUser(userId);
    }
    removeUserFromNotifications(userId) {
        return this.nativePushFacade.removeUser(userId);
    }
    loadPushIdentifierFromNative() {
        return this.nativePushFacade.getPushIdentifier();
    }
    async storePushIdentifierLocally(pushIdentifier) {
        const userId = this.logins.getUserController().user._id;
        const sk = assertNotNull(await this.cryptoFacade.resolveSessionKeyForInstanceBinary(pushIdentifier));
        const origin = assertNotNull(env.staticUrl);
        await this.nativePushFacade.storePushIdentifierLocally(pushIdentifier.identifier, userId, origin, getElementId(pushIdentifier), sk);
    }
    async loadPushIdentifier(identifier) {
        const list = assertNotNull(this.logins.getUserController().user.pushIdentifierList);
        const identifiers = await this.entityClient.loadAll(PushIdentifierTypeRef, list.list);
        return identifiers.find((i) => i.identifier === identifier) ?? null;
    }
    async createPushIdentifierInstance(identifier, pushServiceType) {
        const list = assertNotNull(this.logins.getUserController().user.pushIdentifierList?.list);
        const pushIdentifier = createPushIdentifier({
            _area: "0",
            _owner: this.logins.getUserController().userGroupInfo.group,
            _ownerGroup: this.logins.getUserController().userGroupInfo.group,
            displayName: client.getIdentifier(),
            pushServiceType: pushServiceType,
            identifier,
            language: lang.code,
            disabled: false,
            lastUsageTime: new Date(),
            lastNotificationDate: null,
            app: this.app,
        });
        const id = await this.entityClient.setup(list, pushIdentifier);
        return this.entityClient.load(PushIdentifierTypeRef, [list, id]);
    }
    async closePushNotification(addresses) {
        await this.nativePushFacade.closePushNotifications(addresses);
    }
    getLoadedPushIdentifier() {
        return this._currentIdentifier;
    }
    getExtendedNotificationMode() {
        return this.nativePushFacade.getExtendedNotificationConfig(this.logins.getUserController().userId);
    }
    async setExtendedNotificationMode(type) {
        await this.nativePushFacade.setExtendedNotificationConfig(this.logins.getUserController().userId, type);
    }
    initPushNotifications() {
        return this.nativePushFacade.initPushNotifications();
    }
    async scheduleAlarmsIfNeeded(pushIdentifier) {
        if (this._currentIdentifier?.disabled) {
            return;
        }
        const userId = this.logins.getUserController().user._id;
        // The native part might have alarms stored for the older model version and they might miss some new fields.
        // We need to remove all of them, re-download and re-schedule all of them.
        const scheduledAlarmsModelVersion = this.deviceConfig.getScheduledAlarmsModelVersion(userId);
        if (scheduledAlarmsModelVersion == null || scheduledAlarmsModelVersion < effectiveModelVersion()) {
            console.log(`Alarms not scheduled for user ${userId} (stored v ${scheduledAlarmsModelVersion}), scheduling`);
            await this.nativePushFacade.invalidateAlarmsForUser(userId);
            await this.calendarFacade.scheduleAlarmsForNewDevice(pushIdentifier);
            // tell native to delete all alarms for the user
            this.deviceConfig.setScheduledAlarmsModelVersion(userId, effectiveModelVersion());
        }
    }
    async setReceiveCalendarNotificationConfig(value) {
        await this.nativePushFacade.setReceiveCalendarNotificationConfig(this.getLoadedPushIdentifier().identifier, value);
    }
    async getReceiveCalendarNotificationConfig() {
        const pushIdentifier = this.getLoadedPushIdentifier();
        if (!pushIdentifier)
            return true;
        return await this.nativePushFacade.getReceiveCalendarNotificationConfig(pushIdentifier.identifier);
    }
    async allowReceiveCalendarNotifications() {
        return !isApp() || (await this.getReceiveCalendarNotificationConfig());
    }
}
//# sourceMappingURL=NativePushServiceApp.js.map