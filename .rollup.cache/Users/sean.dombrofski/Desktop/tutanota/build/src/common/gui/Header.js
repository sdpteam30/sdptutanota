import m from "mithril";
import { NavBar } from "./base/NavBar.js";
import { isSelectedPrefix, NavButton } from "./base/NavButton.js";
import { FeatureType } from "../api/common/TutanotaConstants.js";
import { CALENDAR_PREFIX, CONTACTLIST_PREFIX, CONTACTS_PREFIX, MAIL_PREFIX } from "../misc/RouteChange.js";
import { assertMainOrNode } from "../api/common/Env.js";
import { OfflineIndicator } from "./base/OfflineIndicator.js";
import { locator } from "../api/main/CommonLocator.js";
import { ProgressBar } from "./base/ProgressBar.js";
import { DesktopBaseHeader } from "./base/DesktopBaseHeader.js";
assertMainOrNode();
export class Header {
    view({ attrs }) {
        return m(DesktopBaseHeader, [m(ProgressBar, { progress: attrs.offlineIndicatorModel.getProgress() }), this.renderNavigation(attrs)]);
    }
    /**
     * render the search and navigation bar in three-column layouts. if there is a navigation, also render an offline indicator.
     * @private
     */
    renderNavigation(attrs) {
        return m(".flex-grow.flex.justify-end.items-center", [
            attrs.searchBar ? attrs.searchBar() : null,
            m(OfflineIndicator, attrs.offlineIndicatorModel.getCurrentAttrs()),
            m(".nav-bar-spacer"),
            m(NavBar, this.renderButtons()),
        ]);
    }
    renderButtons() {
        // We assign click listeners to buttons to move focus correctly if the view is already open
        return [
            m(NavButton, {
                label: "emails_label",
                icon: () => "Mail" /* BootIcons.Mail */,
                href: MAIL_PREFIX,
                isSelectedPrefix: MAIL_PREFIX,
                colors: "header" /* NavButtonColor.Header */,
            }),
            // not available for external mailboxes
            locator.logins.isInternalUserLoggedIn() && !locator.logins.isEnabled(FeatureType.DisableContacts)
                ? m(NavButton, {
                    label: "contacts_label",
                    icon: () => "Contacts" /* BootIcons.Contacts */,
                    href: CONTACTS_PREFIX,
                    isSelectedPrefix: isSelectedPrefix(CONTACTS_PREFIX) || isSelectedPrefix(CONTACTLIST_PREFIX),
                    colors: "header" /* NavButtonColor.Header */,
                })
                : null,
            // not available for external mailboxes
            locator.logins.isInternalUserLoggedIn() && !locator.logins.isEnabled(FeatureType.DisableCalendar)
                ? m(NavButton, {
                    label: "calendar_label",
                    icon: () => "Calendar" /* BootIcons.Calendar */,
                    href: CALENDAR_PREFIX,
                    colors: "header" /* NavButtonColor.Header */,
                    click: () => m.route.get().startsWith(CALENDAR_PREFIX),
                })
                : null,
        ];
    }
}
//# sourceMappingURL=Header.js.map