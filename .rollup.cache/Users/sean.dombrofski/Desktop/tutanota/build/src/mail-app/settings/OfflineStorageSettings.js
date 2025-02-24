import { OFFLINE_STORAGE_DEFAULT_TIME_RANGE_DAYS } from "../../common/api/common/TutanotaConstants.js";
import { isOfflineStorageAvailable } from "../../common/api/common/Env.js";
import { assert } from "@tutao/tutanota-utils";
/**
 * A model for handling offline storage configuration
 * Accessing setters and getters will throw if you are not in a context where an offline database is available
 * Some logic is duplicated from OfflineStorage
 */
export class OfflineStorageSettingsModel {
    userController;
    deviceConfig;
    _isInitialized = false;
    isEnabled = null;
    // the default value will never actually be used
    timeRange = OFFLINE_STORAGE_DEFAULT_TIME_RANGE_DAYS;
    // Native interfaces are lazy to allow us to unconditionally construct the SettingsModel
    // If we are not in a native context, then they should never be accessed
    constructor(userController, deviceConfig) {
        this.userController = userController;
        this.deviceConfig = deviceConfig;
    }
    available() {
        return this._isInitialized && isOfflineStorageAvailable() && !!this.isEnabled;
    }
    assertAvailable() {
        assert(this.available(), "Not initialized or not available");
    }
    /**
     * get stored time range, will error out if offlineStorage isn't available.
     * if the user account is free, always returns the default time range and
     * resets the stored value if it's different from the default.
     */
    getTimeRange() {
        this.assertAvailable();
        if (this.userController.isFreeAccount() && this.timeRange !== OFFLINE_STORAGE_DEFAULT_TIME_RANGE_DAYS) {
            this.setTimeRange(OFFLINE_STORAGE_DEFAULT_TIME_RANGE_DAYS).catch((e) => console.log("error while resetting storage time range:", e));
            this.timeRange = OFFLINE_STORAGE_DEFAULT_TIME_RANGE_DAYS;
            return OFFLINE_STORAGE_DEFAULT_TIME_RANGE_DAYS;
        }
        return this.timeRange;
    }
    async setTimeRange(days) {
        this.assertAvailable();
        await this.deviceConfig.setOfflineTimeRangeDays(this.userController.userId, days);
        this.timeRange = days;
    }
    async init() {
        this.isEnabled = isOfflineStorageAvailable();
        if (this.isEnabled) {
            const stored = this.deviceConfig.getOfflineTimeRangeDays(this.userController.userId);
            if (stored != null) {
                this.timeRange = stored;
            }
        }
        this._isInitialized = true;
    }
}
//# sourceMappingURL=OfflineStorageSettings.js.map