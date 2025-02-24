import m from "mithril";
import { Button } from "../../../gui/base/Button.js";
import { getReferralLink, ReferralLinkViewer } from "./ReferralLinkViewer.js";
import { generatedIdToTimestamp } from "../../../api/common/utils/EntityUtils.js";
import { getDayShifted, neverNull } from "@tutao/tutanota-utils";
const REFERRAL_NEWS_DISPLAY_THRESHOLD_DAYS = 7;
/**
 * News item that informs users about option to refer friends. Only shown after the customer exists at least 7 days.
 *
 * Not shown for non-admin users.
 */
export class ReferralLinkNews {
    newsModel;
    dateProvider;
    userController;
    referralLink = "";
    constructor(newsModel, dateProvider, userController) {
        this.newsModel = newsModel;
        this.dateProvider = dateProvider;
        this.userController = userController;
    }
    async isShown() {
        // Do not show this for business customers yet (not allowed to create referral links)
        if ((await this.userController.loadCustomer()).businessUse === true) {
            return false;
        }
        // Create the referral link
        this.referralLink = await getReferralLink(this.userController);
        // Decode the date the user was generated from the timestamp in the user ID
        const customerCreatedTime = generatedIdToTimestamp(neverNull(this.userController.user.customer));
        return (this.userController.isGlobalAdmin() &&
            getDayShifted(new Date(customerCreatedTime), REFERRAL_NEWS_DISPLAY_THRESHOLD_DAYS) <= new Date(this.dateProvider.now()));
    }
    render(newsId) {
        const buttonAttrs = [
            {
                label: "close_alt",
                click: () => this.newsModel.acknowledgeNews(newsId.newsItemId).then(m.redraw),
                type: "secondary" /* ButtonType.Secondary */,
            },
        ];
        return m(".full-width", [
            m(ReferralLinkViewer, { referralLink: this.referralLink }),
            m(".flex-end.flex-no-grow-no-shrink-auto.flex-wrap", buttonAttrs.map((a) => m(Button, a))),
        ]);
    }
}
//# sourceMappingURL=ReferralLinkNews.js.map