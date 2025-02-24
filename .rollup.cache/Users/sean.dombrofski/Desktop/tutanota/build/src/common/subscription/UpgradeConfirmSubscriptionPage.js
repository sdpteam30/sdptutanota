import m from "mithril";
import { Dialog } from "../gui/base/Dialog";
import { lang } from "../misc/LanguageViewModel";
import { formatPriceWithInfo, getPaymentMethodName } from "./PriceUtils";
import { createSwitchAccountTypePostIn } from "../api/entities/sys/TypeRefs.js";
import { AccountType, Const, PaymentMethodType, PaymentMethodTypeToName } from "../api/common/TutanotaConstants";
import { showProgressDialog } from "../gui/dialogs/ProgressDialog";
import { BadGatewayError, PreconditionFailedError } from "../api/common/error/RestError";
import { appStorePlanName, getPreconditionFailedPaymentMsg } from "./SubscriptionUtils";
import { emitWizardEvent } from "../gui/base/WizardDialog.js";
import { TextField } from "../gui/base/TextField.js";
import { base64ExtToBase64, base64ToUint8Array, neverNull, ofClass } from "@tutao/tutanota-utils";
import { locator } from "../api/main/CommonLocator";
import { SwitchAccountTypeService } from "../api/entities/sys/Services";
import { getDisplayNameOfPlanType } from "./FeatureListProvider";
import { LoginButton } from "../gui/base/buttons/LoginButton.js";
import { updatePaymentData } from "./InvoiceAndPaymentDataPage";
import { MobilePaymentError } from "../api/common/error/MobilePaymentError.js";
import { getRatingAllowed, RatingCheckResult } from "../ratings/InAppRatingUtils.js";
import { showAppRatingDialog } from "../ratings/InAppRatingDialog.js";
import { deviceConfig } from "../misc/DeviceConfig.js";
import { isIOSApp } from "../api/common/Env.js";
import { client } from "../misc/ClientDetector.js";
import { SubscriptionApp } from "./SubscriptionViewer.js";
export class UpgradeConfirmSubscriptionPage {
    dom;
    __signupPaidTest;
    __signupFreeTest;
    oncreate(vnode) {
        this.__signupPaidTest = locator.usageTestController.getTest("signup.paid");
        this.__signupFreeTest = locator.usageTestController.getTest("signup.free");
        this.dom = vnode.dom;
    }
    view({ attrs }) {
        return this.renderConfirmSubscription(attrs);
    }
    async upgrade(data) {
        // We return early because we do the upgrade after the user has submitted payment which is on the confirmation page
        if (data.paymentData.paymentMethod === PaymentMethodType.AppStore) {
            const success = await this.handleAppStorePayment(data);
            if (!success) {
                return;
            }
        }
        const serviceData = createSwitchAccountTypePostIn({
            accountType: AccountType.PAID,
            customer: null,
            plan: data.type,
            date: Const.CURRENT_DATE,
            referralCode: data.referralCode,
            specialPriceUserSingle: null,
            surveyData: null,
            app: client.isCalendarApp() ? SubscriptionApp.Calendar : SubscriptionApp.Mail,
        });
        showProgressDialog("pleaseWait_msg", locator.serviceExecutor.post(SwitchAccountTypeService, serviceData).then(() => {
            return locator.customerFacade.switchFreeToPremiumGroup();
        }))
            .then(() => {
            // Order confirmation (click on Buy), send selected payment method as an enum
            const orderConfirmationStage = this.__signupPaidTest?.getStage(5);
            orderConfirmationStage?.setMetric({
                name: "paymentMethod",
                value: PaymentMethodTypeToName[data.paymentData.paymentMethod],
            });
            orderConfirmationStage?.setMetric({
                name: "switchedFromFree",
                value: (this.__signupFreeTest?.isStarted() ?? false).toString(),
            });
            orderConfirmationStage?.complete();
            return this.close(data, this.dom);
        })
            .then(async () => {
            const ratingCheckResult = await getRatingAllowed(new Date(), deviceConfig, isIOSApp());
            if (ratingCheckResult === RatingCheckResult.RATING_ALLOWED) {
                setTimeout(async () => {
                    void showAppRatingDialog();
                }, 2000);
            }
        })
            .catch(ofClass(PreconditionFailedError, (e) => {
            Dialog.message(lang.makeTranslation("precondition_failed", lang.get(getPreconditionFailedPaymentMsg(e.data)) +
                (data.upgradeType === "Signup" /* UpgradeType.Signup */ ? " " + lang.get("accountWasStillCreated_msg") : "")));
        }))
            .catch(ofClass(BadGatewayError, (e) => {
            Dialog.message(lang.makeTranslation("payment_failed", lang.get("paymentProviderNotAvailableError_msg") +
                (data.upgradeType === "Signup" /* UpgradeType.Signup */ ? " " + lang.get("accountWasStillCreated_msg") : "")));
        }));
    }
    /** @return whether subscribed successfully */
    async handleAppStorePayment(data) {
        if (!locator.logins.isUserLoggedIn()) {
            await locator.logins.createSession(neverNull(data.newAccountData).mailAddress, neverNull(data.newAccountData).password, 1 /* SessionType.Temporary */);
        }
        const customerId = locator.logins.getUserController().user.customer;
        const customerIdBytes = base64ToUint8Array(base64ExtToBase64(customerId));
        try {
            const result = await showProgressDialog("pleaseWait_msg", locator.mobilePaymentsFacade.requestSubscriptionToPlan(appStorePlanName(data.type), data.options.paymentInterval(), customerIdBytes));
            if (result.result !== "0" /* MobilePaymentResultType.Success */) {
                return false;
            }
        }
        catch (e) {
            if (e instanceof MobilePaymentError) {
                console.error("AppStore subscription failed", e);
                Dialog.message("appStoreSubscriptionError_msg", e.message);
                return false;
            }
            else {
                throw e;
            }
        }
        return await updatePaymentData(data.options.paymentInterval(), data.invoiceData, data.paymentData, null, data.newAccountData != null, null, data.accountingInfo);
    }
    renderConfirmSubscription(attrs) {
        const isYearly = attrs.data.options.paymentInterval() === 12 /* PaymentInterval.Yearly */;
        const subscription = isYearly ? lang.get("pricing.yearly_label") : lang.get("pricing.monthly_label");
        return [
            m(".center.h4.pt", lang.get("upgradeConfirm_msg")),
            m(".pt.pb.plr-l", [
                m(TextField, {
                    label: "subscription_label",
                    value: getDisplayNameOfPlanType(attrs.data.type),
                    isReadOnly: true,
                }),
                m(TextField, {
                    label: "paymentInterval_label",
                    value: subscription,
                    isReadOnly: true,
                }),
                m(TextField, {
                    label: isYearly && attrs.data.nextYearPrice ? "priceFirstYear_label" : "price_label",
                    value: buildPriceString(attrs.data.price?.displayPrice ?? "0", attrs.data.options),
                    isReadOnly: true,
                }),
                this.renderPriceNextYear(attrs),
                m(TextField, {
                    label: "paymentMethod_label",
                    value: getPaymentMethodName(attrs.data.paymentData.paymentMethod),
                    isReadOnly: true,
                }),
            ]),
            m(".smaller.center.pt-l", attrs.data.options.businessUse()
                ? lang.get("pricing.subscriptionPeriodInfoBusiness_msg")
                : lang.get("pricing.subscriptionPeriodInfoPrivate_msg")),
            m(".flex-center.full-width.pt-l", m(LoginButton, {
                label: "buy_action",
                class: "small-login-button",
                onclick: () => this.upgrade(attrs.data),
            })),
        ];
    }
    renderPriceNextYear(attrs) {
        return attrs.data.nextYearPrice
            ? m(TextField, {
                label: "priceForNextYear_label",
                value: buildPriceString(attrs.data.nextYearPrice.displayPrice, attrs.data.options),
                isReadOnly: true,
            })
            : null;
    }
    close(data, dom) {
        emitWizardEvent(dom, "showNextWizardDialogPage" /* WizardEventType.SHOW_NEXT_PAGE */);
    }
}
function buildPriceString(price, options) {
    return formatPriceWithInfo(price, options.paymentInterval(), !options.businessUse());
}
//# sourceMappingURL=UpgradeConfirmSubscriptionPage.js.map