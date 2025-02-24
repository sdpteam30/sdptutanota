import m from "mithril";
import { DropDownSelector } from "../../common/gui/base/DropDownSelector.js";
import { lang } from "../../common/misc/LanguageViewModel.js";
import { isApp, isDesktop } from "../../common/api/common/Env.js";
import { locator } from "../../common/api/main/CommonLocator.js";
import { renderNotificationPermissionsDialog } from "../../common/settings/NotificationPermissionsDialog.js";
export class NotificationContentSelector {
    view(vnode) {
        return m(DropDownSelector, {
            label: "notificationContent_label",
            // Subject is not available on desktop at the moment.
            items: isDesktop()
                ? [
                    {
                        name: lang.get("notificationPreferenceNoSenderOrSubject_action"),
                        value: "0" /* ExtendedNotificationMode.NoSenderOrSubject */,
                    },
                    {
                        name: lang.get("notificationPreferenceOnlySender_action"),
                        value: "1" /* ExtendedNotificationMode.OnlySender */,
                    },
                ]
                : [
                    {
                        name: lang.get("notificationPreferenceNoSenderOrSubject_action"),
                        value: "0" /* ExtendedNotificationMode.NoSenderOrSubject */,
                    },
                    {
                        name: lang.get("notificationPreferenceOnlySender_action"),
                        value: "1" /* ExtendedNotificationMode.OnlySender */,
                    },
                    {
                        name: lang.get("notificationPreferenceSenderAndSubject_action"),
                        value: "2" /* ExtendedNotificationMode.SenderAndSubject */,
                    },
                ],
            selectedValue: vnode.attrs.extendedNotificationMode,
            selectionChangedHandler: async (newValue) => {
                // Permissions only exist on mobile, so we should not check on other platforms
                if (isApp()) {
                    const isNotificationPermissionGranted = await locator.systemPermissionHandler.hasPermission("2" /* PermissionType.Notification */);
                    if (isNotificationPermissionGranted) {
                        vnode.attrs.onChange(newValue);
                    }
                    else {
                        await renderNotificationPermissionsDialog(() => {
                            // Switch to the targeted setting regardless of whether the permission was granted
                            vnode.attrs.onChange(newValue);
                        });
                    }
                }
                else {
                    vnode.attrs.onChange(newValue);
                }
            },
            dropdownWidth: 250,
        });
    }
}
//# sourceMappingURL=NotificationContentSelector.js.map