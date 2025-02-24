import m from "mithril";
import { isUpdateForTypeRef } from "../../common/api/common/utils/EntityUpdateUtils.js";
import stream from "mithril/stream";
import { PushIdentifierTypeRef } from "../../common/api/entities/sys/TypeRefs.js";
import { locator } from "../../common/api/main/CommonLocator.js";
import { lang } from "../../common/misc/LanguageViewModel.js";
import { IconButton } from "../../common/gui/base/IconButton.js";
import { isApp, isBrowser, isDesktop } from "../../common/api/common/Env.js";
import { noOp, ofClass } from "@tutao/tutanota-utils";
import { mailLocator } from "../mailLocator.js";
import { NotificationContentSelector } from "./NotificationContentSelector.js";
import { NotificationTargetsList } from "../../common/settings/NotificationTargetsList.js";
import { AppType } from "../../common/misc/ClientConstants.js";
import { NotFoundError } from "../../common/api/common/error/RestError.js";
import { IdentifierRow } from "../../common/settings/IdentifierRow.js";
import { DropDownSelector } from "../../common/gui/base/DropDownSelector.js";
export class NotificationSettingsViewer {
    currentIdentifier = null;
    extendedNotificationMode = null;
    expanded;
    user;
    identifiers;
    hasNotificationPermission = true;
    receiveCalendarNotifications = true;
    constructor() {
        this.expanded = stream(false);
        this.identifiers = [];
        this.user = locator.logins.getUserController().user;
        this.loadPushIdentifiers();
        if (isApp() || isDesktop()) {
            const promises = [locator.pushService.getExtendedNotificationMode()];
            if (isApp()) {
                promises.push(locator.systemPermissionHandler.hasPermission("2" /* PermissionType.Notification */), locator.pushService.getReceiveCalendarNotificationConfig());
            }
            Promise.all(promises).then(([extendedNotificationMode, hasPermission, canReceiveCalendarNotifications]) => {
                this.extendedNotificationMode = extendedNotificationMode;
                if (isApp()) {
                    if (this.hasNotificationPermission !== hasPermission)
                        this.hasNotificationPermission = hasPermission;
                    if (this.receiveCalendarNotifications !== canReceiveCalendarNotifications)
                        this.receiveCalendarNotifications = canReceiveCalendarNotifications;
                }
                m.redraw();
            });
        }
    }
    togglePushIdentifier(identifier) {
        identifier.disabled = !identifier.disabled;
        locator.entityClient.update(identifier).then(() => m.redraw);
        if (!isBrowser() && identifier.identifier === this.currentIdentifier) {
            if (identifier.disabled) {
                locator.pushService.invalidateAlarmsForUser(this.user._id);
            }
            else {
                locator.pushService.reRegister();
            }
        }
    }
    view() {
        const rowAdd = m(".full-width.flex-space-between.items-center.mb-s", [
            lang.get("emailPushNotification_action"),
            m(IconButton, {
                title: "emailPushNotification_action",
                click: () => this.showAddEmailNotificationDialog(),
                icon: "Add" /* Icons.Add */,
                size: 1 /* ButtonSize.Compact */,
            }),
        ]);
        const rows = this.identifiers
            .map((identifier) => {
            const isCurrentDevice = (isApp() || isDesktop()) && identifier.identifier === this.currentIdentifier;
            return m(IdentifierRow, {
                name: this.identifierDisplayName(isCurrentDevice, identifier.pushServiceType, identifier.displayName),
                disabled: identifier.disabled,
                identifier: identifier.identifier,
                current: isCurrentDevice,
                removeClicked: () => {
                    locator.entityClient.erase(identifier).catch(ofClass(NotFoundError, noOp));
                },
                formatIdentifier: identifier.pushServiceType !== "2" /* PushServiceType.EMAIL */,
                disableClicked: () => this.togglePushIdentifier(identifier),
            });
        })
            .sort((l, r) => +r.attrs.current - +l.attrs.current);
        return m(".fill-absolute.scroll.plr-l.pb-xl", [
            m(".flex.col", [
                m(".flex-space-between.items-center.mt-l.mb-s", [m(".h4", lang.get("notificationSettings_action"))]),
                this.extendedNotificationMode
                    ? m(NotificationContentSelector, {
                        extendedNotificationMode: this.extendedNotificationMode,
                        onChange: (value) => {
                            locator.pushService.setExtendedNotificationMode(value);
                            this.extendedNotificationMode = value;
                            // We can assume "true" because onChange is only triggered if permission was granted
                            this.hasNotificationPermission = true;
                        },
                    })
                    : null,
                isApp() ? this.renderCalendarNotificationsDropdown() : null,
                m(NotificationTargetsList, { rows, rowAdd, onExpandedChange: this.expanded }),
            ]),
        ]);
    }
    renderCalendarNotificationsDropdown() {
        return m(DropDownSelector, {
            label: "receiveCalendarNotifications_label",
            items: [
                {
                    name: lang.get("activated_label"),
                    value: true,
                },
                {
                    name: lang.get("deactivated_label"),
                    value: false,
                },
            ],
            selectedValue: this.receiveCalendarNotifications,
            selectionChangedHandler: async (value) => {
                if (this.receiveCalendarNotifications !== value) {
                    locator.pushService.setReceiveCalendarNotificationConfig(value);
                    this.receiveCalendarNotifications = value;
                    if (value) {
                        await locator.pushService.reRegister();
                    }
                    else {
                        await locator.pushService.invalidateAlarmsForUser(this.user._id);
                    }
                }
            },
            disabled: !this.hasNotificationPermission,
            selectedValueDisplay: !this.hasNotificationPermission ? lang.get("deactivated_label") : undefined,
        });
    }
    async showAddEmailNotificationDialog() {
        const dialog = await mailLocator.addNotificationEmailDialog();
        dialog.show();
    }
    identifierDisplayName(current, type, displayName) {
        if (current) {
            return lang.get("pushIdentifierCurrentDevice_label");
        }
        else if (displayName) {
            return displayName;
        }
        else {
            return ["Android FCM", "iOS", lang.get("adminEmailSettings_action"), "Android Tutanota"][Number(type)];
        }
    }
    async loadPushIdentifiers() {
        this.currentIdentifier = this.getCurrentIdentifier();
        const list = this.user.pushIdentifierList;
        if (list) {
            this.identifiers = (await locator.entityClient.loadAll(PushIdentifierTypeRef, list.list)).filter((identifier) => identifier.app === AppType.Mail || identifier.app === AppType.Integrated); // Filter out calendar targets
            m.redraw();
        }
    }
    getCurrentIdentifier() {
        if (isApp() || isDesktop()) {
            const identifier = mailLocator.pushService.getLoadedPushIdentifier()?.identifier;
            return identifier ? identifier : null;
        }
        return null;
    }
    async entityEventsReceived(updates) {
        for (let update of updates) {
            if (isUpdateForTypeRef(PushIdentifierTypeRef, update)) {
                await this.loadPushIdentifiers();
            }
        }
    }
}
//# sourceMappingURL=NotificationSettingsViewer.js.map