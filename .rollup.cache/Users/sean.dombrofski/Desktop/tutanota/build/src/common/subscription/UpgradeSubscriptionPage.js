import m from "mithril";
import stream from "mithril/stream";
import { lang } from "../misc/LanguageViewModel";
import { SubscriptionSelector } from "./SubscriptionSelector";
import { Button } from "../gui/base/Button.js";
import { Dialog } from "../gui/base/Dialog";
import { emitWizardEvent } from "../gui/base/WizardDialog.js";
import { DefaultAnimationTime } from "../gui/animation/Animations";
import { Const, Keys, PlanType, SubscriptionType } from "../api/common/TutanotaConstants";
import { Checkbox } from "../gui/base/Checkbox.js";
import { locator } from "../api/main/CommonLocator";
import { asPaymentInterval } from "./PriceUtils.js";
import { stringToSubscriptionType } from "../misc/LoginUtils.js";
import { isReferenceDateWithinCyberMondayCampaign } from "../misc/CyberMondayUtils.js";
/** Subscription type passed from the website */
export const PlanTypeParameter = Object.freeze({
    FREE: "free",
    REVOLUTIONARY: "revolutionary",
    LEGEND: "legend",
    ESSENTIAL: "essential",
    ADVANCED: "advanced",
    UNLIMITED: "unlimited",
});
export class UpgradeSubscriptionPage {
    _dom = null;
    __signupFreeTest;
    __signupPaidTest;
    upgradeType = null;
    oncreate(vnode) {
        this._dom = vnode.dom;
        const subscriptionParameters = vnode.attrs.data.subscriptionParameters;
        this.upgradeType = vnode.attrs.data.upgradeType;
        this.__signupFreeTest = locator.usageTestController.getTest("signup.free");
        this.__signupFreeTest.active = false;
        this.__signupPaidTest = locator.usageTestController.getTest("signup.paid");
        this.__signupPaidTest.active = false;
        if (subscriptionParameters) {
            const paymentInterval = subscriptionParameters.interval
                ? asPaymentInterval(subscriptionParameters.interval)
                : 12 /* PaymentInterval.Yearly */;
            // We automatically route to the next page; when we want to go back from the second page, we do not want to keep calling nextPage
            vnode.attrs.data.subscriptionParameters = null;
            vnode.attrs.data.options.paymentInterval = stream(paymentInterval);
            this.goToNextPageWithPreselectedSubscription(subscriptionParameters, vnode.attrs.data);
        }
    }
    view(vnode) {
        const data = vnode.attrs.data;
        let availablePlans = vnode.attrs.data.acceptedPlans;
        // newAccountData is filled in when signing up and then going back in the signup process
        // If the user has selected a tuta.com address we want to prevent them from selecting a free plan at this point
        if (!!data.newAccountData && data.newAccountData.mailAddress.includes("tuta.com") && availablePlans.includes(PlanType.Free)) {
            availablePlans = availablePlans.filter((plan) => plan != PlanType.Free);
        }
        const isYearly = data.options.paymentInterval() === 12 /* PaymentInterval.Yearly */;
        const isCyberMonday = isReferenceDateWithinCyberMondayCampaign(Const.CURRENT_DATE ?? new Date());
        const shouldApplyCyberMonday = isYearly && isCyberMonday;
        const subscriptionActionButtons = {
            [PlanType.Free]: () => {
                return {
                    label: "pricing.select_action",
                    onclick: () => this.selectFree(data),
                };
            },
            [PlanType.Revolutionary]: this.createUpgradeButton(data, PlanType.Revolutionary),
            [PlanType.Legend]: () => ({
                label: shouldApplyCyberMonday ? "pricing.cyber_monday_select_action" : "pricing.select_action",
                class: shouldApplyCyberMonday ? "accent-bg-cyber-monday" : undefined,
                onclick: () => this.setNonFreeDataAndGoToNextPage(data, PlanType.Legend),
            }),
            [PlanType.Essential]: this.createUpgradeButton(data, PlanType.Essential),
            [PlanType.Advanced]: this.createUpgradeButton(data, PlanType.Advanced),
            [PlanType.Unlimited]: this.createUpgradeButton(data, PlanType.Unlimited),
        };
        return m(".pt", [
            m(SubscriptionSelector, {
                options: data.options,
                priceInfoTextId: data.priceInfoTextId,
                boxWidth: 230,
                boxHeight: 270,
                acceptedPlans: availablePlans,
                allowSwitchingPaymentInterval: data.upgradeType !== "Switch" /* UpgradeType.Switch */,
                currentPlanType: data.currentPlan,
                actionButtons: subscriptionActionButtons,
                featureListProvider: vnode.attrs.data.featureListProvider,
                priceAndConfigProvider: vnode.attrs.data.planPrices,
                multipleUsersAllowed: vnode.attrs.data.multipleUsersAllowed,
                msg: data.msg,
            }),
        ]);
    }
    selectFree(data) {
        // Confirmation of free subscription selection (click on subscription selector)
        if (this.__signupPaidTest) {
            this.__signupPaidTest.active = false;
        }
        if (this.__signupFreeTest && this.upgradeType == "Signup" /* UpgradeType.Signup */) {
            this.__signupFreeTest.active = true;
            this.__signupFreeTest.getStage(0).complete();
        }
        confirmFreeSubscription().then((confirmed) => {
            if (confirmed) {
                // Confirmation of free/business dialog (click on ok)
                this.__signupFreeTest?.getStage(1).complete();
                data.type = PlanType.Free;
                data.price = null;
                data.nextYearPrice = null;
                this.showNextPage();
            }
        });
    }
    showNextPage() {
        if (this._dom) {
            emitWizardEvent(this._dom, "showNextWizardDialogPage" /* WizardEventType.SHOW_NEXT_PAGE */);
        }
    }
    goToNextPageWithPreselectedSubscription(subscriptionParameters, data) {
        let subscriptionType;
        try {
            subscriptionType = subscriptionParameters.type == null ? null : stringToSubscriptionType(subscriptionParameters.type);
        }
        catch (e) {
            subscriptionType = null;
        }
        if (subscriptionType === SubscriptionType.Personal || subscriptionType === SubscriptionType.PaidPersonal) {
            // we have to individually change the data so that when returning we show the chose subscription type (private/business) | false = private, true = business
            data.options.businessUse(false);
            switch (subscriptionParameters.subscription) {
                case PlanTypeParameter.FREE:
                    this.selectFree(data);
                    break;
                case PlanTypeParameter.REVOLUTIONARY:
                    this.setNonFreeDataAndGoToNextPage(data, PlanType.Revolutionary);
                    break;
                case PlanTypeParameter.LEGEND:
                    this.setNonFreeDataAndGoToNextPage(data, PlanType.Legend);
                    break;
                default:
                    console.log("Unknown subscription passed: ", subscriptionParameters);
                    break;
            }
        }
        else if (subscriptionType === SubscriptionType.Business) {
            data.options.businessUse(true);
            switch (subscriptionParameters.subscription) {
                case PlanTypeParameter.ESSENTIAL:
                    this.setNonFreeDataAndGoToNextPage(data, PlanType.Essential);
                    break;
                case PlanTypeParameter.ADVANCED:
                    this.setNonFreeDataAndGoToNextPage(data, PlanType.Advanced);
                    break;
                case PlanTypeParameter.UNLIMITED:
                    this.setNonFreeDataAndGoToNextPage(data, PlanType.Unlimited);
                    break;
                default:
                    console.log("Unknown subscription passed: ", subscriptionParameters);
                    break;
            }
        }
        else {
            console.log("Unknown subscription type passed: ", subscriptionParameters);
        }
    }
    setNonFreeDataAndGoToNextPage(data, planType) {
        // Confirmation of paid subscription selection (click on subscription selector)
        if (this.__signupFreeTest) {
            this.__signupFreeTest.active = false;
        }
        if (this.__signupPaidTest && this.upgradeType == "Signup" /* UpgradeType.Signup */) {
            this.__signupPaidTest.active = true;
            this.__signupPaidTest.getStage(0).complete();
        }
        data.type = planType;
        const { planPrices, options } = data;
        try {
            // `data.price.rawPrice` is used for the amount parameter in the Braintree credit card verification call, so we do not include currency locale outside iOS.
            data.price = planPrices.getSubscriptionPriceWithCurrency(options.paymentInterval(), data.type, "1" /* UpgradePriceType.PlanActualPrice */);
            const nextYear = planPrices.getSubscriptionPriceWithCurrency(options.paymentInterval(), data.type, "2" /* UpgradePriceType.PlanNextYearsPrice */);
            data.nextYearPrice = data.price.rawPrice !== nextYear.rawPrice ? nextYear : null;
        }
        catch (e) {
            console.error(e);
            Dialog.message("appStoreNotAvailable_msg");
            return;
        }
        this.showNextPage();
    }
    createUpgradeButton(data, planType) {
        return () => ({
            label: "pricing.select_action",
            onclick: () => this.setNonFreeDataAndGoToNextPage(data, planType),
        });
    }
}
function confirmFreeSubscription() {
    return new Promise((resolve) => {
        let oneAccountValue = stream(false);
        let privateUseValue = stream(false);
        let dialog;
        const closeAction = (confirmed) => {
            dialog.close();
            setTimeout(() => resolve(confirmed), DefaultAnimationTime);
        };
        const isFormValid = () => oneAccountValue() && privateUseValue();
        dialog = new Dialog("Alert" /* DialogType.Alert */, {
            view: () => [
                // m(".h2.pb", lang.get("confirmFreeAccount_label")),
                m("#dialog-message.dialog-contentButtonsBottom.text-break.text-prewrap.selectable", lang.getTranslationText("freeAccountInfo_msg")),
                m(".dialog-contentButtonsBottom", [
                    m(Checkbox, {
                        label: () => lang.get("confirmNoOtherFreeAccount_msg"),
                        checked: oneAccountValue(),
                        onChecked: oneAccountValue,
                    }),
                    m(Checkbox, {
                        label: () => lang.get("confirmPrivateUse_msg"),
                        checked: privateUseValue(),
                        onChecked: privateUseValue,
                    }),
                ]),
                m(".flex-center.dialog-buttons", [
                    m(Button, {
                        label: "cancel_action",
                        click: () => closeAction(false),
                        type: "secondary" /* ButtonType.Secondary */,
                    }),
                    m(Button, {
                        label: "ok_action",
                        click: () => {
                            if (isFormValid())
                                closeAction(true);
                        },
                        type: "primary" /* ButtonType.Primary */,
                    }),
                ]),
            ],
        })
            .setCloseHandler(() => closeAction(false))
            .addShortcut({
            key: Keys.ESC,
            shift: false,
            exec: () => closeAction(false),
            help: "cancel_action",
        })
            .addShortcut({
            key: Keys.RETURN,
            shift: false,
            exec: () => {
                if (isFormValid())
                    closeAction(true);
            },
            help: "ok_action",
        })
            .show();
    });
}
export class UpgradeSubscriptionPageAttrs {
    data;
    constructor(upgradeData) {
        this.data = upgradeData;
    }
    headerTitle() {
        return "subscription_label";
    }
    nextAction(showErrorDialog) {
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
//# sourceMappingURL=UpgradeSubscriptionPage.js.map