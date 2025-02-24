import m from "mithril";
import { getReferralLink, ReferralLinkViewer } from "../misc/news/items/ReferralLinkViewer.js";
import { locator } from "../api/main/CommonLocator.js";
/**
 * Section in user settings to display the referral link and let users share it.
 */
export class ReferralSettingsViewer {
    referralLink = "";
    constructor() {
        this.refreshReferralLink();
    }
    view() {
        return m(".mt-l.plr-l.pb-xl", m(ReferralLinkViewer, { referralLink: this.referralLink }));
    }
    async entityEventsReceived(updates) {
        // can be a noop because the referral code will never change once it was created
        // we trigger creation in the constructor if there is no code yet
    }
    refreshReferralLink() {
        getReferralLink(locator.logins.getUserController()).then((link) => {
            this.referralLink = link;
            m.redraw();
        });
    }
}
//# sourceMappingURL=ReferralSettingsViewer.js.map