import m from "mithril";
import { Dialog } from "../gui/base/Dialog";
import { lang } from "../misc/LanguageViewModel";
import { createSurveyData, createSwitchAccountTypePostIn } from "../api/entities/sys/TypeRefs.js";
import { AccountType, Const, getPaymentMethodType, Keys, LegacyPlans, NewBusinessPlans, PaymentMethodType, PlanType, PlanTypeToName, } from "../api/common/TutanotaConstants";
import { SubscriptionSelector } from "./SubscriptionSelector";
import stream from "mithril/stream";
import { showProgressDialog } from "../gui/dialogs/ProgressDialog";
import { SwitchSubscriptionDialogModel } from "./SwitchSubscriptionDialogModel";
import { locator } from "../api/main/CommonLocator";
import { SwitchAccountTypeService } from "../api/entities/sys/Services.js";
import { BadRequestError, InvalidDataError, PreconditionFailedError } from "../api/common/error/RestError.js";
import { FeatureListProvider } from "./FeatureListProvider";
import { PriceAndConfigProvider } from "./PriceUtils";
import { assertNotNull, base64ExtToBase64, base64ToUint8Array, delay, downcast } from "@tutao/tutanota-utils";
import { showSwitchToBusinessInvoiceDataDialog } from "./SwitchToBusinessInvoiceDataDialog.js";
import { getByAbbreviation } from "../api/common/CountryList.js";
import { formatNameAndAddress } from "../api/common/utils/CommonFormatter.js";
import { showLeavingUserSurveyWizard } from "./LeavingUserSurveyWizard.js";
import { SURVEY_VERSION_NUMBER } from "./LeavingUserSurveyConstants.js";
import { isIOSApp } from "../api/common/Env.js";
import { showManageThroughAppStoreDialog } from "./PaymentViewer.js";
import { appStorePlanName, hasRunningAppStoreSubscription } from "./SubscriptionUtils.js";
import { MobilePaymentError } from "../api/common/error/MobilePaymentError.js";
import { mailLocator } from "../../mail-app/mailLocator";
import { client } from "../misc/ClientDetector.js";
import { SubscriptionApp } from "./SubscriptionViewer.js";
/**
 * Allows cancelling the subscription (only private use) and switching the subscription to a different paid subscription.
 * Note: Only shown if the user is already a Premium user.
 */
export async function showSwitchDialog(customer, customerInfo, accountingInfo, lastBooking, acceptedPlans, reason) {
    if (hasRunningAppStoreSubscription(accountingInfo) && !isIOSApp()) {
        await showManageThroughAppStoreDialog();
        return;
    }
    const [featureListProvider, priceAndConfigProvider] = await showProgressDialog("pleaseWait_msg", Promise.all([
        FeatureListProvider.getInitializedInstance(locator.domainConfigProvider().getCurrentDomainConfig()),
        PriceAndConfigProvider.getInitializedInstance(null, locator.serviceExecutor, null),
    ]));
    const model = new SwitchSubscriptionDialogModel(customer, accountingInfo, await locator.logins.getUserController().getPlanType(), lastBooking);
    const cancelAction = () => {
        dialog.close();
    };
    const headerBarAttrs = {
        left: [
            {
                label: "cancel_action",
                click: cancelAction,
                type: "secondary" /* ButtonType.Secondary */,
            },
        ],
        right: [],
        middle: "subscription_label",
    };
    const currentPlanInfo = model.currentPlanInfo;
    const businessUse = stream(currentPlanInfo.businessUse);
    const paymentInterval = stream(12 /* PaymentInterval.Yearly */); // always default to yearly
    const multipleUsersAllowed = model.multipleUsersStillSupportedLegacy();
    const dialog = Dialog.largeDialog(headerBarAttrs, {
        view: () => m(".pt", m(SubscriptionSelector, {
            options: {
                businessUse,
                paymentInterval: paymentInterval,
            },
            priceInfoTextId: priceAndConfigProvider.getPriceInfoMessage(),
            msg: reason,
            boxWidth: 230,
            boxHeight: 270,
            acceptedPlans: acceptedPlans,
            currentPlanType: currentPlanInfo.planType,
            allowSwitchingPaymentInterval: currentPlanInfo.paymentInterval !== 12 /* PaymentInterval.Yearly */,
            actionButtons: subscriptionActionButtons,
            featureListProvider: featureListProvider,
            priceAndConfigProvider,
            multipleUsersAllowed,
        })),
    })
        .addShortcut({
        key: Keys.ESC,
        exec: cancelAction,
        help: "close_alt",
    })
        .setCloseHandler(cancelAction);
    const subscriptionActionButtons = {
        [PlanType.Free]: () => ({
            label: "pricing.select_action",
            onclick: () => onSwitchToFree(customer, dialog, currentPlanInfo),
        }),
        [PlanType.Revolutionary]: createPlanButton(dialog, PlanType.Revolutionary, currentPlanInfo, paymentInterval, accountingInfo),
        [PlanType.Legend]: createPlanButton(dialog, PlanType.Legend, currentPlanInfo, paymentInterval, accountingInfo),
        [PlanType.Essential]: createPlanButton(dialog, PlanType.Essential, currentPlanInfo, paymentInterval, accountingInfo),
        [PlanType.Advanced]: createPlanButton(dialog, PlanType.Advanced, currentPlanInfo, paymentInterval, accountingInfo),
        [PlanType.Unlimited]: createPlanButton(dialog, PlanType.Unlimited, currentPlanInfo, paymentInterval, accountingInfo),
    };
    dialog.show();
    return;
}
async function onSwitchToFree(customer, dialog, currentPlanInfo) {
    if (isIOSApp()) {
        // We want the user to disable renewal in AppStore before they try to downgrade on our side
        const ownership = await locator.mobilePaymentsFacade.queryAppStoreSubscriptionOwnership(base64ToUint8Array(base64ExtToBase64(customer._id)));
        if (ownership === "0" /* MobilePaymentSubscriptionOwnership.Owner */ && (await locator.mobilePaymentsFacade.isAppStoreRenewalEnabled())) {
            await locator.mobilePaymentsFacade.showSubscriptionConfigView();
            await showProgressDialog("pleaseWait_msg", waitUntilRenewalDisabled());
            if (await locator.mobilePaymentsFacade.isAppStoreRenewalEnabled()) {
                console.log("AppStore renewal is still enabled, canceling downgrade");
                // User probably did not disable the renewal still, cancel
                return;
            }
        }
    }
    const reason = await showLeavingUserSurveyWizard(true, true);
    const data = reason.submitted && reason.category && reason.reason
        ? createSurveyData({
            category: reason.category,
            reason: reason.reason,
            details: reason.details,
            version: SURVEY_VERSION_NUMBER,
        })
        : null;
    const newPlanType = await cancelSubscription(dialog, currentPlanInfo, customer, data);
    if (newPlanType === PlanType.Free) {
        for (const importedMailSet of mailLocator.mailModel.getImportedMailSets())
            mailLocator.mailModel.finallyDeleteCustomMailFolder(importedMailSet);
    }
}
async function waitUntilRenewalDisabled() {
    for (let i = 0; i < 3; i++) {
        // Wait a bit before checking, it takes a bit to propagate
        await delay(2000);
        if (!(await locator.mobilePaymentsFacade.isAppStoreRenewalEnabled())) {
            return;
        }
    }
}
async function doSwitchToPaidPlan(accountingInfo, newPaymentInterval, targetSubscription, dialog, currentPlanInfo) {
    if (isIOSApp() && getPaymentMethodType(accountingInfo) === PaymentMethodType.AppStore) {
        const customerIdBytes = base64ToUint8Array(base64ExtToBase64(assertNotNull(locator.logins.getUserController().user.customer)));
        dialog.close();
        try {
            await locator.mobilePaymentsFacade.requestSubscriptionToPlan(appStorePlanName(targetSubscription), newPaymentInterval, customerIdBytes);
        }
        catch (e) {
            if (e instanceof MobilePaymentError) {
                console.error("AppStore subscription failed", e);
                Dialog.message("appStoreSubscriptionError_msg", e.message);
            }
            else {
                throw e;
            }
        }
    }
    else {
        if (currentPlanInfo.paymentInterval !== newPaymentInterval) {
            await locator.customerFacade.changePaymentInterval(accountingInfo, newPaymentInterval);
        }
        await switchSubscription(targetSubscription, dialog, currentPlanInfo);
    }
}
function createPlanButton(dialog, targetSubscription, currentPlanInfo, newPaymentInterval, accountingInfo) {
    return () => ({
        label: "buy_action",
        onclick: async () => {
            // Show an extra dialog in the case that someone is upgrading from a legacy plan to a new plan because they can't revert.
            if (LegacyPlans.includes(currentPlanInfo.planType) &&
                !(await Dialog.confirm(lang.getTranslation("upgradePlan_msg", { "{plan}": PlanTypeToName[targetSubscription] })))) {
                return;
            }
            await showProgressDialog("pleaseWait_msg", doSwitchToPaidPlan(accountingInfo, newPaymentInterval(), targetSubscription, dialog, currentPlanInfo));
        },
    });
}
function handleSwitchAccountPreconditionFailed(e) {
    const reason = e.data;
    if (reason == null) {
        return Dialog.message("unknownError_msg");
    }
    else {
        let detailMsg;
        switch (reason) {
            case "unsubscribe.too_many_users" /* UnsubscribeFailureReason.TOO_MANY_ENABLED_USERS */:
                detailMsg = lang.get("accountSwitchTooManyActiveUsers_msg");
                break;
            case "unsubscribe.custom_mail_address" /* UnsubscribeFailureReason.CUSTOM_MAIL_ADDRESS */:
                detailMsg = lang.get("accountSwitchCustomMailAddress_msg");
                break;
            case "unsubscribe.too_many_calendars" /* UnsubscribeFailureReason.TOO_MANY_CALENDARS */:
                detailMsg = lang.get("accountSwitchMultipleCalendars_msg");
                break;
            case "unsubscirbe.invalid_calendar_type" /* UnsubscribeFailureReason.CALENDAR_TYPE */:
                detailMsg = lang.get("accountSwitchSharedCalendar_msg");
                break;
            case "unsubscribe.too_many_aliases" /* UnsubscribeFailureReason.TOO_MANY_ALIASES */:
            case "bookingservice.too_many_aliases" /* BookingFailureReason.TOO_MANY_ALIASES */:
                detailMsg = lang.get("accountSwitchAliases_msg");
                break;
            case "unsubscribe.too_much_storage" /* UnsubscribeFailureReason.TOO_MUCH_STORAGE_USED */:
            case "bookingservice.too_much_storage_used" /* BookingFailureReason.TOO_MUCH_STORAGE_USED */:
                detailMsg = lang.get("storageCapacityTooManyUsedForBooking_msg");
                break;
            case "unsubscribe.too_many_domains" /* UnsubscribeFailureReason.TOO_MANY_DOMAINS */:
            case "bookingservice.too_many_domains" /* BookingFailureReason.TOO_MANY_DOMAINS */:
                detailMsg = lang.get("tooManyCustomDomains_msg");
                break;
            case "unsubscribe.has_template_group" /* UnsubscribeFailureReason.HAS_TEMPLATE_GROUP */:
            case "bookingservice.has_template_group" /* BookingFailureReason.HAS_TEMPLATE_GROUP */:
                detailMsg = lang.get("deleteTemplateGroups_msg");
                break;
            case "unsubscribe.whitelabel_domain_active" /* UnsubscribeFailureReason.WHITELABEL_DOMAIN_ACTIVE */:
            case "bookingservice.whitelabel_domain_active" /* BookingFailureReason.WHITELABEL_DOMAIN_ACTIVE */:
                detailMsg = lang.get("whitelabelDomainExisting_msg");
                break;
            case "unsubscribe.has_contact_list_group" /* UnsubscribeFailureReason.HAS_CONTACT_LIST_GROUP */:
                detailMsg = lang.get("contactListExisting_msg");
                break;
            case "unsubscribe.not_enough_credit" /* UnsubscribeFailureReason.NOT_ENOUGH_CREDIT */:
                return Dialog.message("insufficientBalanceError_msg");
            case "unsubscribe.invoice_not_paid" /* UnsubscribeFailureReason.INVOICE_NOT_PAID */:
                return Dialog.message("invoiceNotPaidSwitch_msg");
            case "unsubscribe.active_appstore_subscription" /* UnsubscribeFailureReason.ACTIVE_APPSTORE_SUBSCRIPTION */:
                if (isIOSApp()) {
                    return locator.mobilePaymentsFacade.showSubscriptionConfigView();
                }
                else {
                    return showManageThroughAppStoreDialog();
                }
            case "unsubscribe.label_limit_exceeded" /* UnsubscribeFailureReason.LABEL_LIMIT_EXCEEDED */:
                return Dialog.message("labelLimitExceeded_msg");
            default:
                throw e;
        }
        return Dialog.message(lang.getTranslation("accountSwitchNotPossible_msg", {
            "{detailMsg}": detailMsg,
        }));
    }
}
/**
 * @param customer
 * @param currentPlanInfo
 * @param surveyData
 * @returns the new plan type after the attempt.
 */
async function tryDowngradePremiumToFree(customer, currentPlanInfo, surveyData) {
    const switchAccountTypeData = createSwitchAccountTypePostIn({
        accountType: AccountType.FREE,
        date: Const.CURRENT_DATE,
        customer: customer._id,
        specialPriceUserSingle: null,
        referralCode: null,
        plan: PlanType.Free,
        surveyData: surveyData,
        app: client.isCalendarApp() ? SubscriptionApp.Calendar : SubscriptionApp.Mail,
    });
    try {
        await locator.serviceExecutor.post(SwitchAccountTypeService, switchAccountTypeData);
        await locator.customerFacade.switchPremiumToFreeGroup();
        return PlanType.Free;
    }
    catch (e) {
        if (e instanceof PreconditionFailedError) {
            await handleSwitchAccountPreconditionFailed(e);
        }
        else if (e instanceof InvalidDataError) {
            await Dialog.message("accountSwitchTooManyActiveUsers_msg");
        }
        else if (e instanceof BadRequestError) {
            await Dialog.message("deactivatePremiumWithCustomDomainError_msg");
        }
        else {
            throw e;
        }
        return currentPlanInfo.planType;
    }
}
async function cancelSubscription(dialog, currentPlanInfo, customer, surveyData = null) {
    const confirmCancelSubscription = Dialog.confirm("unsubscribeConfirm_msg", "ok_action", () => {
        return m(".pt", m("ul.usage-test-opt-in-bullets", [
            m("li", lang.get("importedMailsWillBeDeleted_label")),
            m("li", lang.get("accountWillBeDeactivatedIn6Month_label")),
            m("li", lang.get("accountWillHaveLessStorage_label")),
        ]));
    });
    if (!(await confirmCancelSubscription)) {
        return currentPlanInfo.planType;
    }
    try {
        return await showProgressDialog("pleaseWait_msg", tryDowngradePremiumToFree(customer, currentPlanInfo, surveyData));
    }
    finally {
        dialog.close();
    }
}
async function switchSubscription(targetSubscription, dialog, currentPlanInfo) {
    if (targetSubscription === currentPlanInfo.planType) {
        return currentPlanInfo.planType;
    }
    const userController = locator.logins.getUserController();
    const customer = await userController.loadCustomer();
    if (!customer.businessUse && NewBusinessPlans.includes(downcast(targetSubscription))) {
        const accountingInfo = await userController.loadAccountingInfo();
        const invoiceData = {
            invoiceAddress: formatNameAndAddress(accountingInfo.invoiceName, accountingInfo.invoiceAddress),
            country: accountingInfo.invoiceCountry ? getByAbbreviation(accountingInfo.invoiceCountry) : null,
            vatNumber: accountingInfo.invoiceVatIdNo, // only for EU countries otherwise empty
        };
        const updatedInvoiceData = await showSwitchToBusinessInvoiceDataDialog(customer, invoiceData, accountingInfo);
        if (!updatedInvoiceData) {
            return currentPlanInfo.planType;
        }
    }
    try {
        const postIn = createSwitchAccountTypePostIn({
            accountType: AccountType.PAID,
            plan: targetSubscription,
            date: Const.CURRENT_DATE,
            referralCode: null,
            customer: customer._id,
            specialPriceUserSingle: null,
            surveyData: null,
            app: client.isCalendarApp() ? SubscriptionApp.Calendar : SubscriptionApp.Mail,
        });
        try {
            await showProgressDialog("pleaseWait_msg", locator.serviceExecutor.post(SwitchAccountTypeService, postIn));
            return targetSubscription;
        }
        catch (e) {
            if (e instanceof PreconditionFailedError) {
                await handleSwitchAccountPreconditionFailed(e);
                return currentPlanInfo.planType;
            }
            throw e;
        }
    }
    finally {
        dialog.close();
    }
}
//# sourceMappingURL=SwitchSubscriptionDialog.js.map