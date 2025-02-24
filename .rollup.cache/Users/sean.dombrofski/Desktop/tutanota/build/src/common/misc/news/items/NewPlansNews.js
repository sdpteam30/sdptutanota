import m from "mithril";
import { lang } from "../../LanguageViewModel.js";
import { Button } from "../../../gui/base/Button.js";
import { showUpgradeWizardOrSwitchSubscriptionDialog } from "../../SubscriptionDialogs.js";
/**
 * News item that informs admin users about the new pricing model.
 */
export class NewPlansNews {
    newsModel;
    userController;
    constructor(newsModel, userController) {
        this.newsModel = newsModel;
        this.userController = userController;
    }
    async isShown() {
        if (!this.userController.isGlobalAdmin()) {
            return false;
        }
        // // Do not show this for customers that are already on a new plan
        return !(await this.userController.isNewPaidPlan());
    }
    render(newsId) {
        const lnk = "https://tuta.com/privacy-policy" /* InfoLink.Privacy */;
        const acknowledgeAction = () => {
            this.newsModel.acknowledgeNews(newsId.newsItemId).then(m.redraw);
        };
        const buttonAttrs = [
            {
                label: "decideLater_action",
                click: () => acknowledgeAction(),
                type: "secondary" /* ButtonType.Secondary */,
            },
            {
                label: "showMoreUpgrade_action",
                click: async () => {
                    await showUpgradeWizardOrSwitchSubscriptionDialog(this.userController);
                    if (await this.userController.isNewPaidPlan()) {
                        acknowledgeAction();
                    }
                },
                type: "primary" /* ButtonType.Primary */,
            },
        ];
        return m(".full-width", [
            m(".h4", lang.get("newPlansNews_title")),
            m(".pb", lang.get("newPlansExplanation_msg", {
                "{plan1}": "Revolutionary",
                "{plan2}": "Legend",
            })),
            m(".pb", lang.get("newPlansOfferExplanation_msg")),
            m(".flex-end.flex-no-grow-no-shrink-auto.flex-wrap", buttonAttrs.map((a) => m(Button, a))),
        ]);
    }
}
//# sourceMappingURL=NewPlansNews.js.map