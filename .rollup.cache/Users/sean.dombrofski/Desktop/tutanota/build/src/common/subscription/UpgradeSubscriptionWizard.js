import { defer } from "@tutao/tutanota-utils";
import { AvailablePlans, getDefaultPaymentMethod, getPaymentMethodType, NewPaidPlans, PlanType, } from "../api/common/TutanotaConstants";
import { getByAbbreviation } from "../api/common/CountryList";
import { UpgradeSubscriptionPage, UpgradeSubscriptionPageAttrs } from "./UpgradeSubscriptionPage";
import m from "mithril";
import stream from "mithril/stream";
import { lang } from "../misc/LanguageViewModel";
import { createWizardDialog, wizardPageWrapper } from "../gui/base/WizardDialog.js";
import { InvoiceAndPaymentDataPage, InvoiceAndPaymentDataPageAttrs } from "./InvoiceAndPaymentDataPage";
import { UpgradeCongratulationsPage, UpgradeCongratulationsPageAttrs } from "./UpgradeCongratulationsPage.js";
import { SignupPage, SignupPageAttrs } from "./SignupPage";
import { assertMainOrNode, isIOSApp } from "../api/common/Env";
import { locator } from "../api/main/CommonLocator";
import { FeatureListProvider } from "./FeatureListProvider";
import { queryAppStoreSubscriptionOwnership } from "./SubscriptionUtils";
import { UpgradeConfirmSubscriptionPage } from "./UpgradeConfirmSubscriptionPage.js";
import { asPaymentInterval, PriceAndConfigProvider } from "./PriceUtils";
import { formatNameAndAddress } from "../api/common/utils/CommonFormatter.js";
assertMainOrNode();
export async function showUpgradeWizard(logins, acceptedPlans = NewPaidPlans, msg) {
    const [customer, accountingInfo] = await Promise.all([logins.getUserController().loadCustomer(), logins.getUserController().loadAccountingInfo()]);
    const priceDataProvider = await PriceAndConfigProvider.getInitializedInstance(null, locator.serviceExecutor, null);
    const prices = priceDataProvider.getRawPricingData();
    const domainConfig = locator.domainConfigProvider().getCurrentDomainConfig();
    const featureListProvider = await FeatureListProvider.getInitializedInstance(domainConfig);
    const upgradeData = {
        options: {
            businessUse: stream(prices.business),
            paymentInterval: stream(asPaymentInterval(accountingInfo.paymentInterval)),
        },
        invoiceData: {
            invoiceAddress: formatNameAndAddress(accountingInfo.invoiceName, accountingInfo.invoiceAddress),
            country: accountingInfo.invoiceCountry ? getByAbbreviation(accountingInfo.invoiceCountry) : null,
            vatNumber: accountingInfo.invoiceVatIdNo, // only for EU countries otherwise empty
        },
        paymentData: {
            paymentMethod: getPaymentMethodType(accountingInfo) || (await getDefaultPaymentMethod()),
            creditCardData: null,
        },
        price: null,
        type: PlanType.Revolutionary,
        nextYearPrice: null,
        accountingInfo: accountingInfo,
        customer: customer,
        newAccountData: null,
        registrationDataId: null,
        priceInfoTextId: priceDataProvider.getPriceInfoMessage(),
        upgradeType: "Initial" /* UpgradeType.Initial */,
        // Free used to be always selected here for current plan, but resulted in it displaying "free" as current plan for legacy users
        currentPlan: logins.getUserController().isFreeAccount() ? PlanType.Free : null,
        subscriptionParameters: null,
        planPrices: priceDataProvider,
        featureListProvider: featureListProvider,
        referralCode: null,
        multipleUsersAllowed: false,
        acceptedPlans,
        msg: msg != null ? msg : null,
    };
    const wizardPages = [
        wizardPageWrapper(UpgradeSubscriptionPage, new UpgradeSubscriptionPageAttrs(upgradeData)),
        wizardPageWrapper(InvoiceAndPaymentDataPage, new InvoiceAndPaymentDataPageAttrs(upgradeData)),
        wizardPageWrapper(UpgradeConfirmSubscriptionPage, new InvoiceAndPaymentDataPageAttrs(upgradeData)),
    ];
    if (isIOSApp()) {
        wizardPages.splice(1, 1); // do not show this page on AppStore payment since we are only able to show this single payment method on iOS
    }
    const deferred = defer();
    const wizardBuilder = createWizardDialog(upgradeData, wizardPages, async () => {
        deferred.resolve();
    }, "EditLarge" /* DialogType.EditLarge */);
    wizardBuilder.dialog.show();
    return deferred.promise;
}
export async function loadSignupWizard(subscriptionParameters, registrationDataId, referralCode, acceptedPlans = AvailablePlans) {
    const usageTestModel = locator.usageTestModel;
    usageTestModel.setStorageBehavior(1 /* StorageBehavior.Ephemeral */);
    locator.usageTestController.setTests(await usageTestModel.loadActiveUsageTests());
    const priceDataProvider = await PriceAndConfigProvider.getInitializedInstance(registrationDataId, locator.serviceExecutor, referralCode);
    const prices = priceDataProvider.getRawPricingData();
    const domainConfig = locator.domainConfigProvider().getCurrentDomainConfig();
    const featureListProvider = await FeatureListProvider.getInitializedInstance(domainConfig);
    let message;
    if (isIOSApp()) {
        const appstoreSubscriptionOwnership = await queryAppStoreSubscriptionOwnership(null);
        // if we are on iOS app we only show other plans if AppStore payments are enabled and there's no subscription for this Apple ID.
        if (appstoreSubscriptionOwnership !== "2" /* MobilePaymentSubscriptionOwnership.NoSubscription */) {
            acceptedPlans = acceptedPlans.filter((plan) => plan === PlanType.Free);
        }
        message =
            appstoreSubscriptionOwnership != "2" /* MobilePaymentSubscriptionOwnership.NoSubscription */
                ? lang.getTranslation("storeMultiSubscriptionError_msg", { "{AppStorePayment}": "https://tuta.com/support/#appstore-payments" /* InfoLink.AppStorePayment */ })
                : null;
    }
    else {
        message = null;
    }
    const signupData = {
        options: {
            businessUse: stream(prices.business),
            paymentInterval: stream(12 /* PaymentInterval.Yearly */),
        },
        invoiceData: {
            invoiceAddress: "",
            country: null,
            vatNumber: "", // only for EU countries otherwise empty
        },
        paymentData: {
            paymentMethod: await getDefaultPaymentMethod(),
            creditCardData: null,
        },
        price: null,
        nextYearPrice: null,
        type: PlanType.Free,
        accountingInfo: null,
        customer: null,
        newAccountData: null,
        registrationDataId,
        priceInfoTextId: priceDataProvider.getPriceInfoMessage(),
        upgradeType: "Signup" /* UpgradeType.Signup */,
        planPrices: priceDataProvider,
        currentPlan: null,
        subscriptionParameters: subscriptionParameters,
        featureListProvider: featureListProvider,
        referralCode,
        multipleUsersAllowed: false,
        acceptedPlans,
        msg: message,
    };
    const invoiceAttrs = new InvoiceAndPaymentDataPageAttrs(signupData);
    const wizardPages = [
        wizardPageWrapper(UpgradeSubscriptionPage, new UpgradeSubscriptionPageAttrs(signupData)),
        wizardPageWrapper(SignupPage, new SignupPageAttrs(signupData)),
        wizardPageWrapper(InvoiceAndPaymentDataPage, invoiceAttrs), // this page will login the user after signing up with newaccount data
        wizardPageWrapper(UpgradeConfirmSubscriptionPage, invoiceAttrs), // this page will login the user if they are not login for iOS payment through AppStore
        wizardPageWrapper(UpgradeCongratulationsPage, new UpgradeCongratulationsPageAttrs(signupData)),
    ];
    if (isIOSApp()) {
        wizardPages.splice(2, 1); // do not show this page on AppStore payment since we are only able to show this single payment method on iOS
    }
    const wizardBuilder = createWizardDialog(signupData, wizardPages, async () => {
        if (locator.logins.isUserLoggedIn()) {
            // this ensures that all created sessions during signup process are closed
            // either by clicking on `cancel`, closing the window, or confirm on the UpgradeCongratulationsPage
            await locator.logins.logout(false);
        }
        if (signupData.newAccountData) {
            m.route.set("/login", {
                noAutoLogin: true,
                loginWith: signupData.newAccountData.mailAddress,
            });
        }
        else {
            m.route.set("/login", {
                noAutoLogin: true,
            });
        }
    }, "EditLarge" /* DialogType.EditLarge */);
    // for signup specifically, we only want the invoice and payment page as well as the confirmation page to show up if signing up for a paid account (and the user did not go back to the first page!)
    invoiceAttrs.setEnabledFunction(() => signupData.type !== PlanType.Free && wizardBuilder.attrs.currentPage !== wizardPages[0]);
    wizardBuilder.dialog.show();
}
//# sourceMappingURL=UpgradeSubscriptionWizard.js.map