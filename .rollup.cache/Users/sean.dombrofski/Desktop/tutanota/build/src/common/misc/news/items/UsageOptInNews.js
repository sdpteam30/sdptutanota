import m from "mithril";
import { locator } from "../../../api/main/CommonLocator.js";
import { lang } from "../../LanguageViewModel.js";
import { Dialog } from "../../../gui/base/Dialog.js";
import { Button } from "../../../gui/base/Button.js";
import { MoreInfoLink } from "../MoreInfoLink.js";
/**
 * News item that informs users about the usage data opt-in.
 */
export class UsageOptInNews {
    newsModel;
    usageTestModel;
    constructor(newsModel, usageTestModel) {
        this.newsModel = newsModel;
        this.usageTestModel = usageTestModel;
    }
    isShown() {
        return Promise.resolve(locator.usageTestModel.showOptInIndicator());
    }
    render(newsId) {
        const closeAction = (optedIn) => {
            this.newsModel
                .acknowledgeNews(newsId.newsItemId)
                .then(() => {
                if (optedIn) {
                    Dialog.message("userUsageDataOptInThankYouOptedIn_msg");
                }
                else if (optedIn !== undefined) {
                    Dialog.message("userUsageDataOptInThankYouOptedOut_msg");
                }
            })
                .then(m.redraw);
        };
        const buttonAttrs = [
            {
                label: "decideLater_action",
                click: () => closeAction(),
                type: "secondary" /* ButtonType.Secondary */,
            },
            {
                label: "deactivate_action",
                click: () => {
                    const decision = false;
                    this.usageTestModel.setOptInDecision(decision).then(() => closeAction(decision));
                },
                type: "secondary" /* ButtonType.Secondary */,
            },
            {
                label: "activate_action",
                click: () => {
                    const decision = true;
                    this.usageTestModel.setOptInDecision(decision).then(() => closeAction(decision));
                },
                type: "primary" /* ButtonType.Primary */,
            },
        ];
        return m(".full-width", [
            m(".h4", lang.get("userUsageDataOptIn_title")),
            m(".pb", lang.get("userUsageDataOptInExplanation_msg")),
            m("ul.usage-test-opt-in-bullets", [
                m("li", lang.get("userUsageDataOptInStatement1_msg")),
                m("li", lang.get("userUsageDataOptInStatement2_msg")),
                m("li", lang.get("userUsageDataOptInStatement3_msg")),
                m("li", lang.get("userUsageDataOptInStatement4_msg")),
            ]),
            m(MoreInfoLink, { link: "https://tuta.com/privacy-policy" /* InfoLink.Privacy */ }),
            m(".flex-end.flex-no-grow-no-shrink-auto.flex-wrap", buttonAttrs.map((a) => m(Button, a))),
        ]);
    }
}
//# sourceMappingURL=UsageOptInNews.js.map