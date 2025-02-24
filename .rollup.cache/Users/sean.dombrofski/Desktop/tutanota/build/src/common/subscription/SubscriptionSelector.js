import m from "mithril";
import { lang } from "../misc/LanguageViewModel";
import { BOX_MARGIN, BuyOptionBox, BuyOptionDetails, getActiveSubscriptionActionButtonReplacement } from "./BuyOptionBox";
import { SegmentControl } from "../gui/base/SegmentControl";
import { formatMonthlyPrice } from "./PriceUtils";
import { getDisplayNameOfPlanType, } from "./FeatureListProvider";
import { ProgrammingError } from "../api/common/error/ProgrammingError";
import { Button } from "../gui/base/Button.js";
import { downcast, NBSP } from "@tutao/tutanota-utils";
import { Const, CustomDomainTypeCountName, HighlightedPlans, LegacyPlans, NewBusinessPlans, NewPersonalPlans, PlanType, PlanTypeToName, } from "../api/common/TutanotaConstants.js";
import { px } from "../gui/size.js";
import { LoginButton } from "../gui/base/buttons/LoginButton.js";
import { isIOSApp } from "../api/common/Env";
import { isReferenceDateWithinCyberMondayCampaign } from "../misc/CyberMondayUtils.js";
import { theme } from "../gui/theme.js";
const BusinessUseItems = [
    {
        name: lang.get("pricing.privateUse_label"),
        value: false,
    },
    {
        name: lang.get("pricing.businessUse_label"),
        value: true,
    },
];
export function getActionButtonBySubscription(actionButtons, subscription) {
    const ret = actionButtons[subscription];
    if (ret == null) {
        throw new ProgrammingError("Plan is not valid");
    }
    return () => m(LoginButton, ret());
}
export class SubscriptionSelector {
    containerDOM = null;
    featuresExpanded = {
        [PlanType.Free]: false,
        [PlanType.Revolutionary]: false,
        [PlanType.Legend]: false,
        [PlanType.Essential]: false,
        [PlanType.Advanced]: false,
        [PlanType.Unlimited]: false,
        All: false,
    };
    oninit(vnode) {
        const acceptedPlans = vnode.attrs.acceptedPlans;
        const onlyBusinessPlansAccepted = acceptedPlans.every((plan) => NewBusinessPlans.includes(plan));
        if (onlyBusinessPlansAccepted) {
            // if only business plans are accepted, we show them first even if the current plan is a personal plan
            vnode.attrs.options.businessUse(true);
        }
    }
    renderHeadline(msg, currentPlanType, priceInfoTextId, isBusiness, isCyberMonday) {
        const wrapInDiv = (text, style) => {
            return m(".b.center", { style }, text);
        };
        if (msg) {
            return wrapInDiv(lang.getTranslationText(msg));
        }
        else if (currentPlanType != null && LegacyPlans.includes(currentPlanType)) {
            return wrapInDiv(lang.get("currentPlanDiscontinued_msg"));
        }
        if (priceInfoTextId && lang.exists(priceInfoTextId)) {
            return wrapInDiv(lang.get(priceInfoTextId));
        }
        if (isCyberMonday && !isBusiness) {
            return wrapInDiv(lang.get("pricing.cyber_monday_msg"), { width: "230px", margin: "1em auto 0 auto" });
        }
    }
    view(vnode) {
        // Add BuyOptionBox margin twice to the boxWidth received
        const { acceptedPlans, priceInfoTextId, msg, featureListProvider, currentPlanType, options, boxWidth } = vnode.attrs;
        const columnWidth = boxWidth + BOX_MARGIN * 2;
        const inMobileView = (this.containerDOM && this.containerDOM.clientWidth < columnWidth * 2) == true;
        const featureExpander = this.renderFeatureExpanders(inMobileView, featureListProvider); // renders all feature expanders, both for every single subscription option but also for the whole list
        let additionalInfo;
        let plans;
        const currentPlan = currentPlanType;
        const signup = currentPlan == null;
        const onlyBusinessPlansAccepted = acceptedPlans.every((plan) => NewBusinessPlans.includes(plan));
        const onlyPersonalPlansAccepted = acceptedPlans.every((plan) => NewPersonalPlans.includes(plan));
        // Show the business segmentControl for signup, if both personal & business plans are allowed
        const showBusinessSelector = !onlyBusinessPlansAccepted && !onlyPersonalPlansAccepted && !isIOSApp();
        const isCyberMonday = isReferenceDateWithinCyberMondayCampaign(Const.CURRENT_DATE ?? new Date());
        let subscriptionPeriodInfoMsg = !signup && currentPlan !== PlanType.Free ? lang.get("switchSubscriptionInfo_msg") + " " : "";
        if (options.businessUse()) {
            plans = [PlanType.Essential, PlanType.Advanced, PlanType.Unlimited];
            subscriptionPeriodInfoMsg += lang.get("pricing.subscriptionPeriodInfoBusiness_msg");
        }
        else {
            if (inMobileView) {
                if (isCyberMonday) {
                    plans = [PlanType.Legend, PlanType.Revolutionary, PlanType.Free];
                }
                else {
                    plans = [PlanType.Revolutionary, PlanType.Legend, PlanType.Free];
                }
            }
            else {
                if (isCyberMonday) {
                    plans = [PlanType.Free, PlanType.Legend, PlanType.Revolutionary];
                }
                else {
                    plans = [PlanType.Free, PlanType.Revolutionary, PlanType.Legend];
                }
            }
            subscriptionPeriodInfoMsg += lang.get("pricing.subscriptionPeriodInfoPrivate_msg");
        }
        const shouldShowFirstYearDiscountNotice = !isIOSApp() && isCyberMonday && !options.businessUse() && options.paymentInterval() === 12 /* PaymentInterval.Yearly */;
        additionalInfo = m(".flex.flex-column.items-center", [
            featureExpander.All, // global feature expander
            m(".smaller.mb.center", subscriptionPeriodInfoMsg),
            shouldShowFirstYearDiscountNotice && m(".smaller.mb.center", `* ${lang.get("pricing.legendAsterisk_msg")}`),
        ]);
        const buyBoxesViewPlacement = plans
            .filter((plan) => acceptedPlans.includes(plan) || currentPlanType === plan)
            .map((personalPlan, i) => {
            // only show category title for the leftmost item
            return [
                this.renderBuyOptionBox(vnode.attrs, inMobileView, personalPlan, isCyberMonday),
                this.renderBuyOptionDetails(vnode.attrs, i === 0, personalPlan, featureExpander, isCyberMonday),
            ];
        });
        return m("", { lang: lang.code }, [
            showBusinessSelector
                ? m(SegmentControl, {
                    selectedValue: options.businessUse(),
                    onValueSelected: options.businessUse,
                    items: BusinessUseItems,
                })
                : null,
            this.renderHeadline(msg, currentPlanType, priceInfoTextId, options.businessUse(), isCyberMonday),
            m(".flex.center-horizontally.wrap", {
                "data-testid": "dialog:select-subscription",
                oncreate: (vnode) => {
                    this.containerDOM = vnode.dom;
                    m.redraw();
                },
                style: {
                    "column-gap": px(BOX_MARGIN),
                },
            }, m(".plans-grid", buyBoxesViewPlacement.flat()), additionalInfo),
        ]);
    }
    renderBuyOptionBox(attrs, inMobileView, planType, isCyberMonday) {
        return m("", {
            style: {
                width: attrs.boxWidth ? px(attrs.boxWidth) : px(230),
            },
        }, m(BuyOptionBox, this.createBuyOptionBoxAttr(attrs, planType, inMobileView, isCyberMonday)));
    }
    renderBuyOptionDetails(attrs, renderCategoryTitle, planType, featureExpander, isCyberMonday) {
        return m("", {
            style: { width: attrs.boxWidth ? px(attrs.boxWidth) : px(230) },
        }, m(BuyOptionDetails, this.createBuyOptionBoxDetailsAttr(attrs, planType, renderCategoryTitle, isCyberMonday)), featureExpander[planType]);
    }
    createBuyOptionBoxAttr(selectorAttrs, targetSubscription, mobile, isCyberMonday) {
        const { priceAndConfigProvider } = selectorAttrs;
        // we highlight the center box if this is a signup or the current subscription type is Free
        const interval = selectorAttrs.options.paymentInterval();
        const upgradingToPaidAccount = !selectorAttrs.currentPlanType || selectorAttrs.currentPlanType === PlanType.Free;
        const isHighlighted = (() => {
            if (isCyberMonday) {
                return targetSubscription === PlanType.Legend;
            }
            return upgradingToPaidAccount && HighlightedPlans.includes(targetSubscription);
        })();
        const multiuser = NewBusinessPlans.includes(targetSubscription) || LegacyPlans.includes(targetSubscription) || selectorAttrs.multipleUsersAllowed;
        const subscriptionPrice = priceAndConfigProvider.getSubscriptionPrice(interval, targetSubscription, "1" /* UpgradePriceType.PlanActualPrice */);
        let priceStr;
        let referencePriceStr = undefined;
        let priceType;
        if (isIOSApp()) {
            const prices = priceAndConfigProvider.getMobilePrices().get(PlanTypeToName[targetSubscription].toLowerCase());
            if (prices != null) {
                if (isCyberMonday && targetSubscription === PlanType.Legend && interval == 12 /* PaymentInterval.Yearly */) {
                    const revolutionaryPrice = priceAndConfigProvider.getMobilePrices().get(PlanTypeToName[PlanType.Revolutionary].toLowerCase());
                    priceStr = revolutionaryPrice?.displayYearlyPerMonth ?? NBSP;
                    // if there is a discount for this plan we show the original price as reference
                    referencePriceStr = prices?.displayYearlyPerMonth;
                    priceType = 1 /* PriceType.YearlyPerMonth */;
                }
                else {
                    switch (interval) {
                        case 1 /* PaymentInterval.Monthly */:
                            priceStr = prices.displayMonthlyPerMonth;
                            priceType = 0 /* PriceType.MonthlyPerMonth */;
                            break;
                        case 12 /* PaymentInterval.Yearly */:
                            priceStr = prices.displayYearlyPerYear;
                            priceType = 2 /* PriceType.YearlyPerYear */;
                            break;
                    }
                }
            }
            else {
                // when can this happen?
                priceType = 0 /* PriceType.MonthlyPerMonth */;
                priceStr = NBSP;
                referencePriceStr = NBSP;
            }
        }
        else {
            priceType = interval == 1 /* PaymentInterval.Monthly */ ? 0 /* PriceType.MonthlyPerMonth */ : 1 /* PriceType.YearlyPerMonth */;
            const referencePrice = priceAndConfigProvider.getSubscriptionPrice(interval, targetSubscription, "0" /* UpgradePriceType.PlanReferencePrice */);
            priceStr = formatMonthlyPrice(subscriptionPrice, interval);
            if (referencePrice > subscriptionPrice) {
                // if there is a discount for this plan we show the original price as reference
                referencePriceStr = formatMonthlyPrice(referencePrice, interval);
            }
            else if (interval == 12 /* PaymentInterval.Yearly */ && subscriptionPrice !== 0 && !isCyberMonday) {
                // if there is no discount for any plan then we show the monthly price as reference
                const monthlyReferencePrice = priceAndConfigProvider.getSubscriptionPrice(1 /* PaymentInterval.Monthly */, targetSubscription, "1" /* UpgradePriceType.PlanActualPrice */);
                referencePriceStr = formatMonthlyPrice(monthlyReferencePrice, 1 /* PaymentInterval.Monthly */);
            }
        }
        // If we are on the cyber monday campaign, we want to let the user know the discount is just for the first year.
        const asteriskOrEmptyString = !isIOSApp() && isCyberMonday && targetSubscription === PlanType.Legend && interval === 12 /* PaymentInterval.Yearly */ ? "*" : "";
        return {
            heading: getDisplayNameOfPlanType(targetSubscription),
            actionButton: selectorAttrs.currentPlanType === targetSubscription
                ? getActiveSubscriptionActionButtonReplacement()
                : getActionButtonBySubscription(selectorAttrs.actionButtons, targetSubscription),
            price: priceStr,
            referencePrice: referencePriceStr,
            priceHint: lang.makeTranslation("price_hint", `${getPriceHint(subscriptionPrice, priceType, multiuser)}${asteriskOrEmptyString}`),
            helpLabel: getHelpLabel(targetSubscription, selectorAttrs.options.businessUse()),
            width: selectorAttrs.boxWidth,
            height: selectorAttrs.boxHeight,
            selectedPaymentInterval: selectorAttrs.allowSwitchingPaymentInterval && targetSubscription !== PlanType.Free ? selectorAttrs.options.paymentInterval : null,
            accountPaymentInterval: interval,
            highlighted: isHighlighted,
            mobile,
            bonusMonths: targetSubscription !== PlanType.Free && interval === 12 /* PaymentInterval.Yearly */
                ? Number(selectorAttrs.priceAndConfigProvider.getRawPricingData().bonusMonthsForYearlyPlan)
                : 0,
            targetSubscription,
        };
    }
    createBuyOptionBoxDetailsAttr(selectorAttrs, targetSubscription, renderCategoryTitle, isCyberMonday) {
        const { featureListProvider } = selectorAttrs;
        const subscriptionFeatures = featureListProvider.getFeatureList(targetSubscription);
        const categoriesToShow = subscriptionFeatures.categories
            .map((fc) => {
            return localizeFeatureCategory(fc, targetSubscription, selectorAttrs);
        })
            .filter((fc) => fc != null);
        const isLegend = targetSubscription === PlanType.Legend;
        const isYearly = selectorAttrs.options.paymentInterval() === 12 /* PaymentInterval.Yearly */;
        return {
            categories: categoriesToShow,
            featuresExpanded: this.featuresExpanded[targetSubscription] || this.featuresExpanded.All,
            renderCategoryTitle,
            iconStyle: isCyberMonday && isYearly && isLegend ? { fill: theme.content_accent_cyber_monday } : undefined,
        };
    }
    /**
     * Renders the feature expanders depending on whether currently displaying the feature list in single-column layout or in multi-column layout.
     * If a specific expander is not needed and thus should not be renderer, null | undefined is returned
     */
    renderFeatureExpanders(inMobileView, featureListProvider) {
        if (!featureListProvider.featureLoadingDone()) {
            // the feature list is not available
            return {
                [PlanType.Free]: null,
                [PlanType.Revolutionary]: null,
                [PlanType.Legend]: null,
                [PlanType.Essential]: null,
                [PlanType.Advanced]: null,
                [PlanType.Unlimited]: null,
                All: null,
            };
        }
        if (inMobileView) {
            // In single-column layout every subscription type has its own feature expander.
            if (this.featuresExpanded.All) {
                for (const k in this.featuresExpanded) {
                    this.featuresExpanded[k] = true;
                }
            }
            return {
                [PlanType.Free]: this.renderExpander(PlanType.Free),
                [PlanType.Revolutionary]: this.renderExpander(PlanType.Revolutionary),
                [PlanType.Legend]: this.renderExpander(PlanType.Legend),
                [PlanType.Advanced]: this.renderExpander(PlanType.Advanced),
                [PlanType.Essential]: this.renderExpander(PlanType.Essential),
                [PlanType.Unlimited]: this.renderExpander(PlanType.Unlimited),
                All: null,
            };
        }
        else {
            for (const k in this.featuresExpanded) {
                this.featuresExpanded[k] = this.featuresExpanded.All; // in multi-column layout the specific feature expanders should follow the global one
            }
            return Object.assign({}, { All: this.renderExpander("All") });
        }
    }
    /**
     * Renders a single feature expander.
     * @param subType The current expander that should be rendered
     * @private
     */
    renderExpander(subType) {
        return this.featuresExpanded[subType]
            ? null
            : m(Button, {
                label: "pricing.showAllFeatures",
                type: "secondary" /* ButtonType.Secondary */,
                click: (event) => {
                    this.featuresExpanded[subType] = !this.featuresExpanded[subType];
                    event.stopPropagation();
                },
            });
    }
}
function localizeFeatureListItem(item, targetSubscription, attrs) {
    const text = tryGetTranslation(item.text, getReplacement(item.replacements, targetSubscription, attrs));
    if (text == null) {
        return null;
    }
    if (!item.toolTip) {
        return { text, key: item.text, antiFeature: item.antiFeature, omit: item.omit, heart: !!item.heart };
    }
    else {
        const toolTipText = tryGetTranslation(item.toolTip);
        if (toolTipText === null) {
            return null;
        }
        const toolTip = item.toolTip.endsWith("_markdown") ? m.trust(toolTipText) : toolTipText;
        return { text, toolTip, key: item.text, antiFeature: item.antiFeature, omit: item.omit, heart: !!item.heart };
    }
}
function localizeFeatureCategory(category, targetSubscription, attrs) {
    const title = tryGetTranslation(category.title);
    const features = downcast(category.features.map((f) => localizeFeatureListItem(f, targetSubscription, attrs)).filter((it) => it != null));
    return { title, key: category.title, features, featureCount: category.featureCount };
}
function tryGetTranslation(key, replacements) {
    try {
        return lang.get(key, replacements);
    }
    catch (e) {
        console.log("could not translate feature text for key", key, "hiding feature item");
        return null;
    }
}
/**
 * get a string to insert into a translation with a slot.
 * if no key is found, undefined is returned and nothing is replaced.
 */
export function getReplacement(key, subscription, attrs) {
    const { priceAndConfigProvider } = attrs;
    switch (key) {
        case "customDomains": {
            const customDomainType = downcast(priceAndConfigProvider.getPlanPricesForPlan(subscription).planConfiguration.customDomainType);
            return { "{amount}": CustomDomainTypeCountName[customDomainType] };
        }
        case "mailAddressAliases":
            return { "{amount}": priceAndConfigProvider.getPlanPricesForPlan(subscription).planConfiguration.nbrOfAliases };
        case "storage":
            return { "{amount}": priceAndConfigProvider.getPlanPricesForPlan(subscription).planConfiguration.storageGb };
        case "label": {
            return { "{amount}": priceAndConfigProvider.getPlanPricesForPlan(subscription).planConfiguration.maxLabels };
        }
    }
}
function getHelpLabel(planType, businessUse) {
    if (planType === PlanType.Free)
        return "pricing.upgradeLater_msg";
    return businessUse ? "pricing.excludesTaxes_msg" : "pricing.includesTaxes_msg";
}
function getPriceHint(subscriptionPrice, priceType, multiuser) {
    if (subscriptionPrice > 0) {
        switch (priceType) {
            case 2 /* PriceType.YearlyPerYear */:
                // we do not support multiuser here
                return lang.get("pricing.perYear_label");
            case 1 /* PriceType.YearlyPerMonth */:
                if (multiuser) {
                    return lang.get("pricing.perUserMonthPaidYearly_label");
                }
                else {
                    return lang.get("pricing.perMonthPaidYearly_label");
                }
            case 0 /* PriceType.MonthlyPerMonth */:
                if (multiuser) {
                    return lang.get("pricing.perUserMonth_label");
                }
                else {
                    return lang.get("pricing.perMonth_label");
                }
        }
    }
    return "";
}
//# sourceMappingURL=SubscriptionSelector.js.map