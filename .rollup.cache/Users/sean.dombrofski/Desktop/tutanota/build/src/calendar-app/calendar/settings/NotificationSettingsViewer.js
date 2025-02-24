import m from "mithril";
import stream from "mithril/stream";
import { PushIdentifierTypeRef } from "../../../common/api/entities/sys/TypeRefs.js";
import { isApp, isBrowser, isDesktop } from "../../../common/api/common/Env.js";
import { lang } from "../../../common/misc/LanguageViewModel.js";
import { IdentifierRow } from "../../../common/settings/IdentifierRow.js";
import { noOp, ofClass } from "@tutao/tutanota-utils";
import { NotFoundError } from "../../../common/api/common/error/RestError.js";
import { NotificationTargetsList } from "../../../common/settings/NotificationTargetsList.js";
import { isUpdateForTypeRef } from "../../../common/api/common/utils/EntityUpdateUtils.js";
import { calendarLocator } from "../../calendarLocator.js";
import { AppType } from "../../../common/misc/ClientConstants.js";
import { locator } from "../../../common/api/main/CommonLocator.js";
export class NotificationSettingsViewer {
    currentIdentifier = null;
    expanded;
    user;
    identifiers;
    constructor() {
        this.expanded = stream(false);
        this.identifiers = [];
        this.user = calendarLocator.logins.getUserController().user;
        this.loadPushIdentifiers();
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
        const rows = this.identifiers
            .map((identifier) => {
            const isCurrentDevice = (isApp() || isDesktop()) && identifier.identifier === this.currentIdentifier;
            return m(IdentifierRow, {
                name: this.identifierDisplayName(isCurrentDevice, identifier.pushServiceType, identifier.displayName),
                disabled: identifier.disabled,
                identifier: identifier.identifier,
                current: isCurrentDevice,
                removeClicked: () => {
                    calendarLocator.entityClient.erase(identifier).catch(ofClass(NotFoundError, noOp));
                },
                formatIdentifier: identifier.pushServiceType !== "2" /* PushServiceType.EMAIL */,
                disableClicked: () => this.togglePushIdentifier(identifier),
            });
        })
            .sort((l, r) => +r.attrs.current - +l.attrs.current);
        return m(".fill-absolute.scroll.plr-l.pb-xl", [
            m(".flex.col", [
                m(".flex-space-between.items-center.mt-l.mb-s", [m(".h4", lang.get("notificationSettings_action"))]),
                m(NotificationTargetsList, { rowAdd: null, rows, onExpandedChange: this.expanded }),
            ]),
        ]);
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
            this.identifiers = (await calendarLocator.entityClient.loadAll(PushIdentifierTypeRef, list.list)).filter((identifier) => identifier.app === AppType.Calendar); // Filter out mail targets
            m.redraw();
        }
    }
    getCurrentIdentifier() {
        const identifier = calendarLocator.pushService.getLoadedPushIdentifier()?.identifier;
        return (isApp() || isDesktop()) && identifier ? identifier : null;
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