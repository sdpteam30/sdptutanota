import m from "mithril";
import { px, size } from "../gui/size";
import { lang } from "../misc/LanguageViewModel";
import { Icon } from "../gui/base/Icon";
import { SegmentControl } from "../gui/base/SegmentControl";
import { Const, PlanType } from "../api/common/TutanotaConstants";
import { InfoIcon } from "../gui/base/InfoIcon.js";
import { theme } from "../gui/theme.js";
import { isReferenceDateWithinCyberMondayCampaign } from "../misc/CyberMondayUtils.js";
import { isIOSApp } from "../api/common/Env";
export function getActiveSubscriptionActionButtonReplacement() {
    return () => m(".buyOptionBox.content-accent-fg.center-vertically.text-center", {
        style: {
            "border-radius": px(size.border_radius_small),
        },
    }, lang.get("pricing.currentPlan_label"));
}
export const BOX_MARGIN = 10;
export class BuyOptionDetails {
    featuresExpanded = false;
    featureListItemSelector = ".flex";
    onbeforeupdate(vnode, old) {
        // the expand css class renders an animation which is used when the feature list is expanded
        // the animation should only be shown when the user clicked on the feature expansion button which changes the expanded state
        // thus to check whether the button was pressed, the BuyOptionBox before update must not be expanded but the BuyOptionBox after update is
        // otherwise mithril sometimes updates the view and renders the animation even though nothing changed
        if (vnode.attrs.featuresExpanded && !old.attrs.featuresExpanded) {
            this.featureListItemSelector = ".flex.expand";
        }
        else {
            this.featureListItemSelector = ".flex";
        }
    }
    view(vnode) {
        const { attrs } = vnode;
        this.featuresExpanded = attrs.featuresExpanded || false;
        return m(".mt.pl", attrs.categories.map((fc) => {
            return [
                this.renderCategoryTitle(fc, attrs.renderCategoryTitle),
                fc.features
                    .filter((f) => !f.omit || this.featuresExpanded)
                    .map((f) => m(this.featureListItemSelector, { key: f.key }, [
                    f.heart
                        ? m(Icon, {
                            icon: "Heart" /* BootIcons.Heart */,
                            style: attrs.iconStyle,
                        })
                        : m(Icon, { icon: f.antiFeature ? "Cancel" /* Icons.Cancel */ : "Checkmark" /* Icons.Checkmark */, style: attrs.iconStyle }),
                    m(".small.text-left.align-self-center.pl-s.button-height.flex-grow.min-width-0.break-word", [m("span", f.text)]),
                    f.toolTip ? m(InfoIcon, { text: f.toolTip }) : null,
                ])),
                this.renderPlaceholders(fc),
            ];
        }));
    }
    renderCategoryTitle(fc, renderCategoryTitle) {
        if (fc.title && this.featuresExpanded) {
            return [
                m(".b.text-left.align-self-center.pl-s.button-height.flex-grow.min-width-0.break-word", ""),
                m(".b.text-left.align-self-center.pl-s.button-height.flex-grow.min-width-0.break-word", renderCategoryTitle ? fc.title : ""),
            ];
        }
        else {
            return [];
        }
    }
    renderPlaceholders(fc) {
        if (!this.featuresExpanded) {
            return [];
        }
        else {
            const placeholderCount = fc.featureCount.max - fc.features.length;
            return [...Array(placeholderCount)].map(() => m(".button-height", ""));
        }
    }
}
export class BuyOptionBox {
    view(vnode) {
        const { attrs } = vnode;
        const isCyberMonday = isReferenceDateWithinCyberMondayCampaign(Const.CURRENT_DATE ?? new Date());
        const isLegendPlan = attrs.targetSubscription === PlanType.Legend;
        const isYearly = (attrs.selectedPaymentInterval == null ? attrs.accountPaymentInterval : attrs.selectedPaymentInterval()) === 12 /* PaymentInterval.Yearly */;
        const shouldApplyCyberMondayDesign = isLegendPlan && isCyberMonday && isYearly;
        return m(".fg-black", {
            style: {
                width: px(attrs.width),
                padding: "10px",
                height: "100%",
            },
        }, [
            m(".buyOptionBox" + (attrs.highlighted ? (shouldApplyCyberMondayDesign ? ".highlighted.cyberMonday" : ".highlighted") : ""), {
                style: {
                    display: "flex",
                    "flex-direction": "column",
                    "min-height": px(attrs.height),
                    "border-radius": "3px",
                    height: "100%",
                },
            }, [
                shouldApplyCyberMondayDesign ? this.renderCyberMondayRibbon() : this.renderBonusMonthsRibbon(attrs.bonusMonths),
                typeof attrs.heading === "string" ? this.renderHeading(attrs.heading) : attrs.heading,
                this.renderPrice(attrs.price, isYearly ? attrs.referencePrice : undefined),
                m(".small.text-center", attrs.priceHint ? lang.getTranslationText(attrs.priceHint) : lang.get("emptyString_msg")),
                m(".small.text-center.pb-ml", lang.getTranslationText(attrs.helpLabel)),
                this.renderPaymentIntervalControl(attrs.selectedPaymentInterval, shouldApplyCyberMondayDesign),
                attrs.actionButton
                    ? m(".button-min-height", {
                        style: {
                            "margin-top": "auto",
                        },
                    }, attrs.actionButton())
                    : null,
            ]),
        ]);
    }
    renderPrice(price, strikethroughPrice) {
        return m(".pt-ml.text-center", { style: { display: "grid", "grid-template-columns": "1fr auto 1fr", "align-items": "center" } }, strikethroughPrice != null && strikethroughPrice.trim() !== ""
            ? m(".span.strike", {
                style: {
                    color: theme.content_button,
                    fontSize: px(size.font_size_base),
                    justifySelf: "end",
                    margin: "auto 0.4em 0 0",
                    padding: "0.4em 0",
                },
            }, strikethroughPrice)
            : m(""), m(".h1", price), m(""));
    }
    renderBonusMonthsRibbon(bonusMonths) {
        return bonusMonths > 0 ? this.renderRibbon(`+${bonusMonths} ${lang.get("pricing.months_label")}`) : null;
    }
    renderRibbon(text) {
        return m(".ribbon-horizontal", m(".text-center.b", { style: { padding: px(3) } }, text));
    }
    renderCyberMondayRibbon() {
        const text = isIOSApp() ? "DEAL" : lang.get("pricing.cyberMonday_label");
        return m(".ribbon-horizontal.ribbon-horizontal-cyber-monday", m(".text-center.b", { style: { padding: px(3) } }, text));
    }
    renderPaymentIntervalControl(paymentInterval, shouldApplyCyberMonday) {
        const paymentIntervalItems = [
            { name: lang.get("pricing.yearly_label"), value: 12 /* PaymentInterval.Yearly */ },
            { name: lang.get("pricing.monthly_label"), value: 1 /* PaymentInterval.Monthly */ },
        ];
        return paymentInterval
            ? m(SegmentControl, {
                selectedValue: paymentInterval(),
                items: paymentIntervalItems,
                onValueSelected: (v) => {
                    paymentInterval?.(v);
                    m.redraw();
                },
                shouldApplyCyberMonday,
            })
            : null;
    }
    renderHeading(heading) {
        return m(
        // we need some margin for the discount banner for longer translations shown on the website
        `.h4.text-center.mb-small-line-height.flex.col.center-horizontally.mlr-l.dialog-header`, {
            style: {
                "font-size": heading.length > 20 ? "smaller" : undefined,
            },
        }, heading);
    }
}
//# sourceMappingURL=BuyOptionBox.js.map