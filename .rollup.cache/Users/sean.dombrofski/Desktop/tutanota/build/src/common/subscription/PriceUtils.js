import { Const, PaymentMethodType, PlanType, PlanTypeToName } from "../api/common/TutanotaConstants";
import { assertTranslation, lang } from "../misc/LanguageViewModel";
import { assertNotNull, downcast, neverNull } from "@tutao/tutanota-utils";
import { createUpgradePriceServiceData } from "../api/entities/sys/TypeRefs.js";
import { UpgradePriceService } from "../api/entities/sys/Services";
import { ProgrammingError } from "../api/common/error/ProgrammingError.js";
import { UserError } from "../api/main/UserError.js";
import { isIOSApp } from "../api/common/Env";
import { locator } from "../api/main/CommonLocator.js";
import { isReferenceDateWithinCyberMondayCampaign } from "../misc/CyberMondayUtils.js";
export function asPaymentInterval(paymentInterval) {
    if (typeof paymentInterval === "string") {
        paymentInterval = Number(paymentInterval);
    }
    switch (paymentInterval) {
        // additional cast to make this robust against changes to the PaymentInterval enum.
        case Number(1 /* PaymentInterval.Monthly */):
            return 1 /* PaymentInterval.Monthly */;
        case Number(12 /* PaymentInterval.Yearly */):
            return 12 /* PaymentInterval.Yearly */;
        default:
            throw new ProgrammingError(`invalid payment interval: ${paymentInterval}`);
    }
}
export function getPaymentMethodName(paymentMethod) {
    if (paymentMethod === PaymentMethodType.Invoice) {
        return lang.get("paymentMethodOnAccount_label");
    }
    else if (paymentMethod === PaymentMethodType.CreditCard) {
        return lang.get("paymentMethodCreditCard_label");
    }
    else if (paymentMethod === PaymentMethodType.Sepa) {
        return "SEPA";
    }
    else if (paymentMethod === PaymentMethodType.Paypal) {
        return "PayPal";
    }
    else if (paymentMethod === PaymentMethodType.AccountBalance) {
        return lang.get("paymentMethodAccountBalance_label");
    }
    else if (paymentMethod === PaymentMethodType.AppStore) {
        return "App Store";
    }
    else {
        return "<" + lang.get("comboBoxSelectionNone_msg") + ">";
    }
}
export function getPaymentMethodInfoText(accountingInfo) {
    if (accountingInfo.paymentMethodInfo) {
        return accountingInfo.paymentMethod === PaymentMethodType.CreditCard
            ? lang.get("endsWith_label") + " " + neverNull(accountingInfo.paymentMethodInfo)
            : neverNull(accountingInfo.paymentMethodInfo);
    }
    else {
        return "";
    }
}
export function formatPriceDataWithInfo(priceData) {
    return formatPriceWithInfo(formatPrice(Number(priceData.price), true), asPaymentInterval(priceData.paymentInterval), priceData.taxIncluded);
}
// Used on website, keep it in sync
export function formatPrice(value, includeCurrency) {
    // round to two digits first because small deviations may exist at far away decimal places
    value = Math.round(value * 100) / 100;
    if (includeCurrency) {
        return value % 1 !== 0 ? lang.formats.priceWithCurrency.format(value) : lang.formats.priceWithCurrencyWithoutFractionDigits.format(value);
    }
    else {
        return value % 1 !== 0 ? lang.formats.priceWithoutCurrency.format(value) : lang.formats.priceWithoutCurrencyWithoutFractionDigits.format(value);
    }
}
/**
 * Formats the monthly price of the subscription (even for yearly subscriptions).
 */
export function formatMonthlyPrice(subscriptionPrice, paymentInterval) {
    const monthlyPrice = paymentInterval === 12 /* PaymentInterval.Yearly */ ? subscriptionPrice / Number(12 /* PaymentInterval.Yearly */) : subscriptionPrice;
    return formatPrice(monthlyPrice, true);
}
/**
 * Formats the yearly price for the full year (not monthly).
 */
export function formatPriceWithInfo(formattedPrice, paymentInterval, taxIncluded) {
    const netOrGross = taxIncluded ? lang.get("gross_label") : lang.get("net_label");
    const yearlyOrMonthly = paymentInterval === 12 /* PaymentInterval.Yearly */ ? lang.get("pricing.perYear_label") : lang.get("pricing.perMonth_label");
    return `${formattedPrice} ${yearlyOrMonthly} (${netOrGross})`;
}
/**
 * Provides the price item from the given priceData for the given featureType. Returns null if no such item is available.
 */
export function getPriceItem(priceData, featureType) {
    return priceData?.items.find((item) => item.featureType === featureType) ?? null;
}
export function getCountFromPriceData(priceData, featureType) {
    const priceItem = getPriceItem(priceData, featureType);
    return priceItem ? Number(priceItem.count) : 0;
}
/**
 * Returns the price for the feature type from the price data if available. otherwise 0.
 * @return The price
 */
export function getPriceFromPriceData(priceData, featureType) {
    let item = getPriceItem(priceData, featureType);
    if (item) {
        return Number(item.price);
    }
    else {
        return 0;
    }
}
export class PriceAndConfigProvider {
    upgradePriceData = null;
    planPrices = null;
    isReferralCodeSignup = false;
    mobilePrices = null;
    constructor() { }
    async init(registrationDataId, serviceExecutor, referralCode) {
        const data = createUpgradePriceServiceData({
            date: Const.CURRENT_DATE,
            campaign: registrationDataId,
            referralCode: referralCode,
        });
        this.upgradePriceData = await serviceExecutor.get(UpgradePriceService, data);
        if (isIOSApp()) {
            this.mobilePrices = new Map();
            const allPrices = await locator.mobilePaymentsFacade.getPlanPrices();
            for (const plan of allPrices) {
                this.mobilePrices.set(plan.name, plan);
            }
        }
        this.isReferralCodeSignup = referralCode != null;
        this.planPrices = this.upgradePriceData.plans;
    }
    static async getInitializedInstance(registrationDataId, serviceExecutor, referralCode) {
        // There should be only one method to request a discount either referralCode or a promotion
        if (referralCode != null && registrationDataId != null) {
            throw new UserError("referralSignupCampaignError_msg");
        }
        const priceDataProvider = new PriceAndConfigProvider();
        await priceDataProvider.init(registrationDataId, serviceExecutor, referralCode);
        return priceDataProvider;
    }
    getSubscriptionPrice(paymentInterval, subscription, type) {
        return paymentInterval === 12 /* PaymentInterval.Yearly */
            ? this.getYearlySubscriptionPrice(subscription, type)
            : this.getMonthlySubscriptionPrice(subscription, type);
    }
    /**
     * Returns the subscription price with the currency formatting on iOS and as a plain period seperated number on other platforms
     */
    getSubscriptionPriceWithCurrency(paymentInterval, subscription, type) {
        const price = this.getSubscriptionPrice(paymentInterval, subscription, type);
        const rawPrice = price.toString();
        if (isIOSApp()) {
            return this.getAppStorePaymentsSubscriptionPrice(subscription, paymentInterval, rawPrice, type);
        }
        else {
            const price = this.getSubscriptionPrice(paymentInterval, subscription, type);
            return { displayPrice: formatPrice(price, true), rawPrice: price.toString() };
        }
    }
    getAppStorePaymentsSubscriptionPrice(subscription, paymentInterval, rawPrice, type) {
        const planName = PlanTypeToName[subscription];
        const applePrices = this.getMobilePrices().get(planName.toLowerCase());
        if (!applePrices) {
            throw new Error(`no such iOS plan ${planName}`);
        }
        const isCyberMonday = isReferenceDateWithinCyberMondayCampaign(Const.CURRENT_DATE ?? new Date());
        switch (paymentInterval) {
            case 1 /* PaymentInterval.Monthly */:
                return { displayPrice: applePrices.displayMonthlyPerMonth, rawPrice: applePrices.rawMonthlyPerMonth };
            case 12 /* PaymentInterval.Yearly */:
                return { displayPrice: applePrices.displayYearlyPerYear, rawPrice: applePrices.rawYearlyPerYear };
        }
    }
    getRawPricingData() {
        return assertNotNull(this.upgradePriceData);
    }
    getYearlySubscriptionPrice(subscription, upgrade) {
        const prices = this.getPlanPricesForPlan(subscription);
        const monthlyPrice = getPriceForUpgradeType(upgrade, prices);
        const discount = upgrade === "1" /* UpgradePriceType.PlanActualPrice */ ? Number(prices.firstYearDiscount) : 0;
        return monthlyPrice * 10 - discount;
    }
    getMonthlySubscriptionPrice(subscription, upgrade) {
        const prices = this.getPlanPricesForPlan(subscription);
        return getPriceForUpgradeType(upgrade, prices);
    }
    getMobilePrices() {
        return assertNotNull(this.mobilePrices);
    }
    getPlanPricesForPlan(subscription) {
        const planPrices = assertNotNull(this.planPrices, "called getPlanPricesForPlan before init");
        return assertNotNull(planPrices.find((prices) => PlanTypeToName[subscription] === prices.planName), "plan type not found");
    }
    getPriceInfoMessage() {
        const rawData = this.getRawPricingData();
        const bonusMonthMessage = getReasonForBonusMonths(Number(rawData.bonusMonthsForYearlyPlan), this.isReferralCodeSignup);
        if (bonusMonthMessage) {
            return bonusMonthMessage;
        }
        else if (rawData.messageTextId) {
            // text id that is specified by a promotion.
            return assertTranslation(rawData.messageTextId);
        }
        else {
            return null;
        }
    }
}
function getPriceForUpgradeType(upgrade, prices) {
    switch (upgrade) {
        case "0" /* UpgradePriceType.PlanReferencePrice */:
            return Number(prices.monthlyReferencePrice);
        case "1" /* UpgradePriceType.PlanActualPrice */:
        case "2" /* UpgradePriceType.PlanNextYearsPrice */:
            return Number(prices.monthlyPrice);
        case "3" /* UpgradePriceType.AdditionalUserPrice */:
            return Number(prices.additionalUserPriceMonthly);
        case "4" /* UpgradePriceType.ContactFormPrice_UNUSED */:
            throw new ProgrammingError("invalid price type");
    }
}
function descendingSubscriptionOrder() {
    return [PlanType.Unlimited, PlanType.Advanced, PlanType.Legend, PlanType.Essential, PlanType.Revolutionary];
}
/**
 * Returns true if the targetSubscription plan is considered to be a lower (~ cheaper) subscription plan
 * Is based on the order of business and non-business subscriptions as defined in descendingSubscriptionOrder
 */
export function isSubscriptionDowngrade(targetSubscription, currentSubscription) {
    const order = descendingSubscriptionOrder();
    if (Object.values(PlanType).includes(downcast(currentSubscription))) {
        return order.indexOf(targetSubscription) > order.indexOf(downcast(currentSubscription));
    }
    else {
        return false;
    }
}
/**
 * Helper function to determine the reason for bonus months that have be provided by the UpgradePriceService
 * @param bonusMonths The amount of bonus month
 * @param isReferralCodeSignup Indication if a referral code has been used to query the bonus months.
 */
function getReasonForBonusMonths(bonusMonths, isReferralCodeSignup) {
    if (bonusMonths == 12) {
        return "chooseYearlyForOffer_msg";
    }
    else if (bonusMonths == 1) {
        return "referralSignup_msg";
    }
    else if (bonusMonths == 0 && isReferralCodeSignup) {
        return "referralSignupInvalid_msg";
    }
    else {
        return null;
    }
}
//# sourceMappingURL=PriceUtils.js.map