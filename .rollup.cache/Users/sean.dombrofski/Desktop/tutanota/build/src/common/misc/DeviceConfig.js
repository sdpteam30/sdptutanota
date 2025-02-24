import { base64ToUint8Array, typedEntries, uint8ArrayToBase64 } from "@tutao/tutanota-utils";
import { ProgrammingError } from "../api/common/error/ProgrammingError";
import { assertMainOrNodeBoot, isApp } from "../api/common/Env";
import { client } from "./ClientDetector";
import stream from "mithril/stream";
assertMainOrNodeBoot();
export const defaultThemePreference = "auto:light|dark";
export var ListAutoSelectBehavior;
(function (ListAutoSelectBehavior) {
    ListAutoSelectBehavior[ListAutoSelectBehavior["NONE"] = 0] = "NONE";
    ListAutoSelectBehavior[ListAutoSelectBehavior["OLDER"] = 1] = "OLDER";
    ListAutoSelectBehavior[ListAutoSelectBehavior["NEWER"] = 2] = "NEWER";
})(ListAutoSelectBehavior || (ListAutoSelectBehavior = {}));
/**
 * Device config for internal user auto login. Only one config per device is stored.
 */
export class DeviceConfig {
    _version;
    localStorage;
    static Version = 4;
    static LocalStorageKey = "tutanotaConfig";
    config;
    lastSyncStream = stream(new Map());
    constructor(_version, localStorage) {
        this._version = _version;
        this.localStorage = localStorage;
        this.init();
    }
    init() {
        const loadedConfig = this.loadConfigFromLocalStorage() ?? {};
        let doSave = false;
        if (loadedConfig._version != null && loadedConfig._version !== DeviceConfig.Version) {
            migrateConfig(loadedConfig);
            doSave = true;
        }
        let signupToken;
        if (loadedConfig._signupToken) {
            signupToken = loadedConfig._signupToken;
        }
        else {
            let bytes = new Uint8Array(6);
            let crypto = window.crypto;
            crypto.getRandomValues(bytes);
            signupToken = uint8ArrayToBase64(bytes);
            doSave = true;
        }
        this.config = {
            _version: DeviceConfig.Version,
            _credentials: loadedConfig._credentials ? new Map(typedEntries(loadedConfig._credentials)) : new Map(),
            _credentialEncryptionMode: loadedConfig._credentialEncryptionMode ?? null,
            _encryptedCredentialsKey: loadedConfig._encryptedCredentialsKey ?? null,
            acknowledgedNewsItems: loadedConfig.acknowledgedNewsItems ?? [],
            _themeId: loadedConfig._themeId ?? defaultThemePreference,
            scheduledAlarmModelVersionPerUser: loadedConfig.scheduledAlarmModelVersionPerUser ?? {},
            _language: loadedConfig._language ?? null,
            _defaultCalendarView: loadedConfig._defaultCalendarView ?? {},
            _hiddenCalendars: loadedConfig._hiddenCalendars ?? {},
            expandedMailFolders: loadedConfig.expandedMailFolders ?? {},
            _testDeviceId: loadedConfig._testDeviceId ?? null,
            _testAssignments: loadedConfig._testAssignments ?? null,
            _signupToken: signupToken,
            offlineTimeRangeDaysByUser: loadedConfig.offlineTimeRangeDaysByUser ?? {},
            conversationViewShowOnlySelectedMail: loadedConfig.conversationViewShowOnlySelectedMail ?? false,
            syncContactsWithPhonePreference: loadedConfig.syncContactsWithPhonePreference ?? {},
            isCalendarDaySelectorExpanded: loadedConfig.isCalendarDaySelectorExpanded ?? false,
            mailAutoSelectBehavior: loadedConfig.mailAutoSelectBehavior ?? (isApp() ? ListAutoSelectBehavior.NONE : ListAutoSelectBehavior.OLDER),
            isSetupComplete: loadedConfig.isSetupComplete ?? false,
            isCredentialsMigratedToNative: loadedConfig.isCredentialsMigratedToNative ?? false,
            lastExternalCalendarSync: loadedConfig.lastExternalCalendarSync ?? {},
            clientOnlyCalendars: loadedConfig.clientOnlyCalendars ? new Map(typedEntries(loadedConfig.clientOnlyCalendars)) : new Map(),
            events: loadedConfig.events ?? [],
            lastRatingPromptedDate: loadedConfig.lastRatingPromptedDate ?? null,
            retryRatingPromptAfter: loadedConfig.retryRatingPromptAfter ?? null,
        };
        this.lastSyncStream(new Map(Object.entries(this.config.lastExternalCalendarSync)));
        // We need to write the config if there was a migration and if we generate the signup token and if.
        // We do not save the config if there was no config. The config is stored when some value changes.
        if (doSave) {
            this.writeToStorage();
        }
    }
    loadConfigFromLocalStorage() {
        if (this.localStorage == null) {
            return null;
        }
        const loadedConfigString = this.localStorage.getItem(DeviceConfig.LocalStorageKey);
        if (loadedConfigString == null) {
            return null;
        }
        try {
            return JSON.parse(loadedConfigString);
        }
        catch (e) {
            console.warn("Could not parse device config");
            return null;
        }
    }
    storeCredentials(credentials) {
        this.config._credentials.set(credentials.credentialInfo.userId, credentials);
        this.writeToStorage();
    }
    getCredentialsByUserId(userId) {
        return this.config._credentials.get(userId) ?? null;
    }
    getCredentials() {
        return Array.from(this.config._credentials.values());
    }
    async deleteByUserId(userId) {
        this.config._credentials.delete(userId);
        this.writeToStorage();
    }
    async clearCredentialsData() {
        this.config._credentials.clear();
        this.config._encryptedCredentialsKey = null;
        this.config._credentialEncryptionMode = null;
        this.writeToStorage();
    }
    getSignupToken() {
        return this.config._signupToken;
    }
    getScheduledAlarmsModelVersion(userId) {
        return this.config.scheduledAlarmModelVersionPerUser[userId] ?? null;
    }
    setScheduledAlarmsModelVersion(userId, version) {
        this.config.scheduledAlarmModelVersionPerUser[userId] = version;
        this.writeToStorage();
    }
    setNoAlarmsScheduled() {
        this.config.scheduledAlarmModelVersionPerUser = {};
        this.writeToStorage();
    }
    getIsSetupComplete() {
        return this.config.isSetupComplete ?? false;
    }
    setIsSetupComplete(value) {
        this.config.isSetupComplete = value;
        this.writeToStorage();
    }
    getIsCredentialsMigratedToNative() {
        return this.config.isCredentialsMigratedToNative ?? false;
    }
    setIsCredentialsMigratedToNative(value) {
        this.config.isCredentialsMigratedToNative = value;
        this.writeToStorage();
    }
    getLastExternalCalendarSync() {
        return this.lastSyncStream();
    }
    setLastExternalCalendarSync(value) {
        this.config.lastExternalCalendarSync = Object.fromEntries(value);
        this.writeToStorage();
        this.lastSyncStream(value);
    }
    updateLastSync(groupId, lastSyncStatus = "Success" /* SyncStatus.Success */) {
        const lastExternalCalendarSync = this.getLastExternalCalendarSync();
        const lastSuccessfulSync = lastSyncStatus === "Success" /* SyncStatus.Success */ ? Date.now() : lastExternalCalendarSync.get(groupId)?.lastSuccessfulSync;
        lastExternalCalendarSync.set(groupId, { lastSuccessfulSync, lastSyncStatus });
        this.setLastExternalCalendarSync(lastExternalCalendarSync);
    }
    getLastSyncStream() {
        return this.lastSyncStream;
    }
    removeLastSync(groupId) {
        const lastExternalCalendarSync = this.getLastExternalCalendarSync();
        if (lastExternalCalendarSync.delete(groupId))
            this.setLastExternalCalendarSync(lastExternalCalendarSync);
    }
    getLanguage() {
        return this.config._language;
    }
    setLanguage(language) {
        this.config._language = language;
        this.writeToStorage();
    }
    writeToStorage() {
        try {
            if (this.localStorage != null) {
                this.localStorage.setItem(DeviceConfig.LocalStorageKey, JSON.stringify(this.config, (key, value) => {
                    if (key === "_credentials") {
                        return Object.fromEntries(this.config._credentials.entries());
                    }
                    else if (key === "clientOnlyCalendars") {
                        return Object.fromEntries(this.config.clientOnlyCalendars.entries());
                    }
                    else {
                        return value;
                    }
                }));
            }
        }
        catch (e) {
            // may occur in Safari < 11 in incognito mode because it throws a QuotaExceededError
            // DOMException will occurr if all cookies are disabled
            console.log("could not store config", e);
        }
    }
    getTheme() {
        return this.config._themeId;
    }
    setTheme(theme) {
        if (this.config._themeId !== theme) {
            this.config._themeId = theme;
            this.writeToStorage();
        }
    }
    getDefaultCalendarView(userId) {
        return this.config._defaultCalendarView[userId];
    }
    setDefaultCalendarView(userId, defaultView) {
        if (this.config._defaultCalendarView[userId] !== defaultView) {
            this.config._defaultCalendarView[userId] = defaultView;
            this.writeToStorage();
        }
    }
    getHiddenCalendars(user) {
        return this.config._hiddenCalendars[user] ?? [];
    }
    setHiddenCalendars(user, calendars) {
        if (this.config._hiddenCalendars[user] !== calendars) {
            this.config._hiddenCalendars[user] = calendars;
            this.writeToStorage();
        }
    }
    getExpandedFolders(user) {
        return this.config.expandedMailFolders[user] ?? [];
    }
    setExpandedFolders(user, folders) {
        if (this.config.expandedMailFolders[user] !== folders) {
            this.config.expandedMailFolders[user] = folders;
            this.writeToStorage();
        }
    }
    hasAcknowledgedNewsItemForDevice(newsItemId) {
        return this.config.acknowledgedNewsItems.includes(newsItemId);
    }
    acknowledgeNewsItemForDevice(newsItemId) {
        if (!this.config.acknowledgedNewsItems.includes(newsItemId)) {
            this.config.acknowledgedNewsItems.push(newsItemId);
            this.writeToStorage();
        }
    }
    async getCredentialEncryptionMode() {
        return this.config._credentialEncryptionMode;
    }
    async getCredentialsEncryptionKey() {
        return this.config._encryptedCredentialsKey ? base64ToUint8Array(this.config._encryptedCredentialsKey) : null;
    }
    async getTestDeviceId() {
        return this.config._testDeviceId;
    }
    async storeTestDeviceId(testDeviceId) {
        this.config._testDeviceId = testDeviceId;
        this.writeToStorage();
    }
    async getAssignments() {
        return this.config._testAssignments;
    }
    async storeAssignments(persistedAssignmentData) {
        this.config._testAssignments = persistedAssignmentData;
        this.writeToStorage();
    }
    getOfflineTimeRangeDays(userId) {
        return this.config.offlineTimeRangeDaysByUser[userId];
    }
    setOfflineTimeRangeDays(userId, days) {
        this.config.offlineTimeRangeDaysByUser[userId] = days;
        this.writeToStorage();
    }
    getConversationViewShowOnlySelectedMail() {
        return this.config.conversationViewShowOnlySelectedMail;
    }
    setConversationViewShowOnlySelectedMail(setting) {
        this.config.conversationViewShowOnlySelectedMail = setting;
        this.writeToStorage();
    }
    getUserSyncContactsWithPhonePreference(id) {
        return this.config.syncContactsWithPhonePreference[id] ?? null;
    }
    setUserSyncContactsWithPhonePreference(user, value) {
        this.config.syncContactsWithPhonePreference[user] = value;
        this.writeToStorage();
    }
    isCalendarDaySelectorExpanded() {
        return this.config.isCalendarDaySelectorExpanded;
    }
    setCalendarDaySelectorExpanded(expanded) {
        this.config.isCalendarDaySelectorExpanded = expanded;
        this.writeToStorage();
    }
    getMailAutoSelectBehavior() {
        return this.config.mailAutoSelectBehavior;
    }
    setMailAutoSelectBehavior(action) {
        this.config.mailAutoSelectBehavior = action;
        this.writeToStorage();
    }
    getClientOnlyCalendars() {
        return this.config.clientOnlyCalendars;
    }
    updateClientOnlyCalendars(calendarId, clientOnlyCalendarConfig) {
        this.config.clientOnlyCalendars.set(calendarId, clientOnlyCalendarConfig);
        this.writeToStorage();
    }
    writeEvents(events) {
        this.config.events = events.map((date) => date.getTime());
        this.writeToStorage();
    }
    /**
     * Gets a list of dates on which a certain event has occurred. Could be email sent, replied, contact created etc.
     *
     * Only present on iOS.
     */
    getEvents() {
        return (this.config.events ?? []).flatMap((timestamp) => {
            try {
                return new Date(timestamp);
            }
            catch (e) {
                return [];
            }
        });
    }
    setLastRatingPromptedDate(date) {
        this.config.lastRatingPromptedDate = date.getTime();
        this.writeToStorage();
    }
    /**
     * Gets the last date on which the user was prompted to rate the app.
     */
    getLastRatingPromptedDate() {
        if (this.config.lastRatingPromptedDate == null) {
            return null;
        }
        try {
            return new Date(this.config.lastRatingPromptedDate);
        }
        catch (e) {
            return null;
        }
    }
    /**
     * Sets the date of the earliest possible next date from which another rating can be requested from the user.
     */
    setRetryRatingPromptAfter(date) {
        this.config.retryRatingPromptAfter = date.getTime();
        this.writeToStorage();
    }
    /**
     * Gets the date of the earliest possible next date from which another rating can be requested from the user.
     */
    getRetryRatingPromptAfter() {
        if (this.config.retryRatingPromptAfter == null) {
            return null;
        }
        try {
            return new Date(this.config.retryRatingPromptAfter);
        }
        catch (e) {
            return null;
        }
    }
}
export function migrateConfig(loadedConfig) {
    if (loadedConfig === DeviceConfig.Version) {
        throw new ProgrammingError("Should not migrate credentials, current version");
    }
    if (loadedConfig._version < 2) {
        loadedConfig._credentials = [];
    }
    if (loadedConfig._version < 3) {
        migrateConfigV2to3(loadedConfig);
    }
}
/**
 * Migrate from V2 of the config to V3
 *
 * Exported for testing
 */
export function migrateConfigV2to3(loadedConfig) {
    const oldCredentialsArray = loadedConfig._credentials;
    loadedConfig._credentials = {};
    for (let credential of oldCredentialsArray) {
        let login, type;
        if (credential.mailAddress.includes("@")) {
            login = credential.mailAddress;
            type = "internal";
        }
        else {
            // in version 2 external users had userId as their email address
            // We use encryption stub in this version
            login = credential.userId;
            type = "external";
        }
        loadedConfig._credentials[credential.userId] = {
            credentialInfo: {
                login,
                userId: credential.userId,
                type,
            },
            encryptedPassword: credential.encryptedPassword,
            accessToken: credential.accessToken,
            encryptedPassphraseKey: null, // should not be present
        };
    }
}
export const deviceConfig = new DeviceConfig(DeviceConfig.Version, client.localStorage() ? localStorage : null);
//# sourceMappingURL=DeviceConfig.js.map