import m from "mithril";
import { isAndroidApp } from "../../../../api/common/Env.js";
import { SetupPageLayout } from "./SetupPageLayout.js";
import { NotificationPermissionsBody } from "../../../../settings/NotificationPermissionsDialog.js";
export class SetupNotificationsPage {
    view({ attrs }) {
        return m(SetupPageLayout, { image: "notifications" }, m(NotificationPermissionsBody, {
            isNotificationPermissionGranted: attrs.data.isNotificationPermissionGranted,
            isBatteryPermissionGranted: attrs.data.isBatteryPermissionGranted,
            askForNotificationPermission: (isGranted) => attrs.setIsNotificationPermissionGranted(isGranted),
            askForBatteryNotificationPermission: (isGranted) => attrs.setIsBatteryNotificationPermissionGranted(isGranted),
        }));
    }
}
export class SetupNotificationsPageAttrs {
    systemPermissionHandler;
    hidePagingButtonForPage = false;
    data;
    // Cache the permission values to avoid the page becoming disabled while on it.
    isPageVisible;
    constructor(permissionData, visiblityStream, systemPermissionHandler) {
        this.systemPermissionHandler = systemPermissionHandler;
        this.isPageVisible = this.isPageNeeded(permissionData);
        this.data = permissionData;
        visiblityStream.map((isVisible) => {
            // Redraw the page when the user resumes the app to check for changes in permissions
            if (isVisible) {
                this.systemPermissionHandler
                    .queryPermissionsState(["2" /* PermissionType.Notification */, "1" /* PermissionType.IgnoreBatteryOptimization */])
                    .then((permissionState) => {
                    this.data = {
                        isNotificationPermissionGranted: permissionState.get("2" /* PermissionType.Notification */) ?? false,
                        isBatteryPermissionGranted: permissionState.get("1" /* PermissionType.IgnoreBatteryOptimization */) ?? false,
                    };
                    m.redraw();
                });
            }
        });
    }
    setIsNotificationPermissionGranted(isGranted) {
        this.data = {
            ...this.data,
            isNotificationPermissionGranted: isGranted,
        };
        m.redraw();
    }
    setIsBatteryNotificationPermissionGranted(isGranted) {
        this.data = {
            ...this.data,
            isBatteryPermissionGranted: isGranted,
        };
        m.redraw();
    }
    isPageNeeded(data) {
        // Skip this page if the needed permissions are already granted
        if (isAndroidApp()) {
            return !data.isNotificationPermissionGranted || !data.isBatteryPermissionGranted;
        }
        return !data.isNotificationPermissionGranted;
    }
    headerTitle() {
        return "notificationSettings_action";
    }
    nextAction(showDialogs) {
        // next action not available for this page
        return Promise.resolve(true);
    }
    isSkipAvailable() {
        return false;
    }
    isEnabled() {
        return this.isPageVisible;
    }
}
//# sourceMappingURL=SetupNotificationsPage.js.map