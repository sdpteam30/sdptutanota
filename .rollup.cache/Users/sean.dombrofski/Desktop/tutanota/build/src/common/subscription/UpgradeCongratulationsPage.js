import m from "mithril";
import { lang } from "../misc/LanguageViewModel";
import { emitWizardEvent } from "../gui/base/WizardDialog.js";
import { locator } from "../api/main/CommonLocator";
import { RecoverCodeField } from "../settings/login/RecoverCodeDialog.js";
import { VisSignupImage } from "../gui/base/icons/Icons.js";
import { PlanType } from "../api/common/TutanotaConstants.js";
import { LoginButton } from "../gui/base/buttons/LoginButton.js";
export class UpgradeCongratulationsPage {
    dom;
    __signupPaidTest;
    __signupFreeTest;
    oncreate(vnode) {
        this.__signupPaidTest = locator.usageTestController.getTest("signup.paid");
        this.__signupFreeTest = locator.usageTestController.getTest("signup.free");
        this.dom = vnode.dom;
    }
    view({ attrs }) {
        const { newAccountData } = attrs.data;
        return [
            m(".center.h4.pt", lang.get("accountCreationCongratulation_msg")),
            newAccountData
                ? m(".plr-l", [
                    m(RecoverCodeField, {
                        showMessage: true,
                        recoverCode: newAccountData.recoverCode,
                        image: {
                            src: VisSignupImage,
                            alt: "vitor_alt",
                        },
                    }),
                ])
                : null,
            m(".flex-center.full-width.pt-l", m(LoginButton, {
                label: "ok_action",
                class: "small-login-button",
                onclick: () => {
                    if (attrs.data.type === PlanType.Free) {
                        const recoveryConfirmationStageFree = this.__signupFreeTest?.getStage(5);
                        recoveryConfirmationStageFree?.setMetric({
                            name: "switchedFromPaid",
                            value: (this.__signupPaidTest?.isStarted() ?? false).toString(),
                        });
                        recoveryConfirmationStageFree?.complete();
                    }
                    this.close(attrs.data, this.dom);
                },
            })),
        ];
    }
    close(data, dom) {
        let promise = Promise.resolve();
        if (data.newAccountData && locator.logins.isUserLoggedIn()) {
            promise = locator.logins.logout(false);
        }
        promise.then(() => {
            emitWizardEvent(dom, "showNextWizardDialogPage" /* WizardEventType.SHOW_NEXT_PAGE */);
        });
    }
}
export class UpgradeCongratulationsPageAttrs {
    data;
    preventGoBack = true;
    hidePagingButtonForPage = true;
    constructor(upgradeData) {
        this.data = upgradeData;
    }
    headerTitle() {
        return "accountCongratulations_msg";
    }
    nextAction(showDialogs) {
        // next action not available for this page
        return Promise.resolve(true);
    }
    isSkipAvailable() {
        return false;
    }
    isEnabled() {
        return true;
    }
}
//# sourceMappingURL=UpgradeCongratulationsPage.js.map