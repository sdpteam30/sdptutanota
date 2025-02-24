import m from "mithril";
import { lang } from "../misc/LanguageViewModel.js";
import { isAndroidApp } from "../api/common/Env.js";
import { Dialog } from "../gui/base/Dialog.js";
import { locator } from "../api/main/CommonLocator.js";
import { renderSettingsBannerButton } from "./SettingsBannerButton.js";
function renderPermissionButton(permissionName, isPermissionGranted, onclick) {
    return renderSettingsBannerButton(isPermissionGranted ? "granted_msg" : permissionName, onclick, isPermissionGranted);
}
/// Shows a dialog that allows the user to set the notification and battery permissions on mobile.
/// It shows the same screen as the notifications page in the onboarding wizard
export async function renderNotificationPermissionsDialog(onClose) {
    let isNotificationPermissionGranted = await locator.systemPermissionHandler.hasPermission("2" /* PermissionType.Notification */);
    let isBatteryPermissionGranted = await locator.systemPermissionHandler.hasPermission("1" /* PermissionType.IgnoreBatteryOptimization */);
    const headerBarAttrs = {
        left: [
            {
                label: "close_alt",
                click: () => dialog.close(),
                type: "secondary" /* ButtonType.Secondary */,
            },
        ],
        middle: "permissions_label",
        remove: () => onClose(),
    };
    const dialog = Dialog.editSmallDialog(headerBarAttrs, () => m(NotificationPermissionsBody, {
        isNotificationPermissionGranted,
        isBatteryPermissionGranted,
        askForNotificationPermission: (isGranted) => {
            isNotificationPermissionGranted = isGranted;
            m.redraw();
        },
        askForBatteryNotificationPermission: async (isGranted) => {
            isBatteryPermissionGranted = isGranted;
            m.redraw();
        },
    }));
    dialog.show();
}
/// Displays buttons to grant the notification and battery permissions with explaining paragraphs
export class NotificationPermissionsBody {
    view({ attrs }) {
        return [
            m("p.mb-s", lang.get("allowNotifications_msg")),
            renderPermissionButton("grant_notification_permission_action", attrs.isNotificationPermissionGranted, async () => {
                // Ask for the notification permission
                const isNotificationPermissionGranted = await locator.systemPermissionHandler.requestPermission("2" /* PermissionType.Notification */, "grant_notification_permission_action");
                // Register the push notifications if granted
                if (isNotificationPermissionGranted) {
                    locator.pushService.register();
                }
                attrs.askForNotificationPermission(isNotificationPermissionGranted);
            }),
            !isAndroidApp()
                ? null
                : m("section.mt-s.mb", [
                    m("p.mb-s.mt-s", lang.get("allowBatteryPermission_msg")),
                    renderPermissionButton("grant_battery_permission_action", attrs.isBatteryPermissionGranted, async () => {
                        // Ask for permission to disable battery optimisations
                        const isBatteryPermissionGranted = await locator.systemPermissionHandler.requestPermission("1" /* PermissionType.IgnoreBatteryOptimization */, "allowBatteryPermission_msg");
                        attrs.askForBatteryNotificationPermission(isBatteryPermissionGranted);
                    }),
                ]),
        ];
    }
}
//# sourceMappingURL=NotificationPermissionsDialog.js.map