import { __toESM } from "./chunk-chunk.js";
import { ProgrammingError } from "./ProgrammingError-chunk.js";
import { assertMainOrNode, isApp, isIOSApp } from "./Env-chunk.js";
import { AppType, DeviceType, client } from "./ClientDetector-chunk.js";
import { mithril_default } from "./mithril-chunk.js";
import { NBSP, TypeRef, assertNotNull, base64ExtToBase64, base64ToUint8Array, defer, delay, downcast, getFirstOrThrow, incrementDate, last, neverNull, noOp, ofClass, pMap, stringToBase64, typedValues, uint8ArrayToBase64 } from "./dist2-chunk.js";
import { InfoLink, lang } from "./LanguageViewModel-chunk.js";
import { DefaultAnimationTime } from "./styles-chunk.js";
import { getColorLuminance, isMonochrome, theme } from "./theme-chunk.js";
import { AccountType, AccountTypeNames, ApprovalStatus, AvailablePlans, BookingFailureReason, BookingItemFeatureType, Const, CustomDomainTypeCountName, DEFAULT_FREE_MAIL_ADDRESS_SIGNUP_DOMAIN, DEFAULT_PAID_MAIL_ADDRESS_SIGNUP_DOMAIN, FeatureType, HighlightedPlans, Keys, LegacyPlans, NewBusinessPlans, NewPaidPlans, NewPersonalPlans, OperationType, PaymentDataResultType, PaymentMethodType, PaymentMethodTypeToName, PlanType, PlanTypeToName, PostingType, SubscriptionType, TUTA_MAIL_ADDRESS_SIGNUP_DOMAINS, UnsubscribeFailureReason, getClientType, getDefaultPaymentMethod, getPaymentMethodType } from "./TutanotaConstants-chunk.js";
import { px, size } from "./size-chunk.js";
import { GENERATED_MAX_ID, elementIdPart, getEtId } from "./EntityUtils-chunk.js";
import { AccountingInfoTypeRef, BookingTypeRef, CustomerInfoTypeRef, CustomerTypeRef, GiftCardTypeRef, GroupInfoTypeRef, InvoiceInfoTypeRef, OrderProcessingAgreementTypeRef, UserTypeRef, createAppStoreSubscriptionGetIn, createCreditCard, createDebitServicePutData, createRegistrationCaptchaServiceData, createRegistrationCaptchaServiceGetData, createSignOrderProcessingAgreementData, createSurveyData, createSwitchAccountTypePostIn } from "./TypeRefs2-chunk.js";
import { isMailAddress, isValidCreditCardNumber } from "./FormatValidator-chunk.js";
import { require_stream } from "./stream-chunk.js";
import { deviceConfig } from "./DeviceConfig-chunk.js";
import { MobilePaymentError } from "./ErrorUtils-chunk.js";
import { AccessDeactivatedError, AccessExpiredError, BadGatewayError, BadRequestError, InvalidDataError, LockedError, NotFoundError, PreconditionFailedError, TooManyRequestsError } from "./RestError-chunk.js";
import { isUpdateForTypeRef } from "./EntityUpdateUtils-chunk.js";
import { SessionType } from "./SessionType-chunk.js";
import { AppStoreSubscriptionService, DebitService, LocationService, RegistrationCaptchaService, SignOrderProcessingAgreementService, SwitchAccountTypeService } from "./Services-chunk.js";
import { BaseButton, Button, ButtonType } from "./Button-chunk.js";
import { Icons, PayPalLogo, VisSignupImage } from "./Icons-chunk.js";
import { DialogHeaderBar } from "./DialogHeaderBar-chunk.js";
import { Countries, CountryType, getByAbbreviation } from "./CountryList-chunk.js";
import { Autocapitalize, Autocomplete, Dialog, DialogType, DropDownSelector, TextField, attachDropdown, createDropdown, ifAllowedTutaLinks, inputLineHeight$1 as inputLineHeight, renderCountryDropdown } from "./Dialog-chunk.js";
import { BootIcons, Icon } from "./Icon-chunk.js";
import { ButtonSize, IconButton } from "./IconButton-chunk.js";
import { formatDate, formatMailAddressFromParts, formatStorageSize } from "./Formatter-chunk.js";
import { locator } from "./CommonLocator-chunk.js";
import { showProgressDialog } from "./ProgressDialog-chunk.js";
import { getMailAddressDisplayText, isTutaMailAddress } from "./SharedMailUtils-chunk.js";
import { createNotAvailableForFreeClickHandler } from "./SubscriptionDialogs-chunk.js";
import { ExternalLink } from "./ExternalLink-chunk.js";
import { Checkbox } from "./Checkbox-chunk.js";
import { ExpanderButton, ExpanderPanel } from "./Expander-chunk.js";
import { RatingCheckResult, getRatingAllowed, showAppRatingDialog } from "./InAppRatingDialog-chunk.js";
import { isCustomizationEnabledForCustomer } from "./CustomerUtils-chunk.js";
import { mailLocator } from "./mailLocator-chunk.js";
import { LoginButton } from "./LoginButton-chunk.js";
import { ColumnWidth, Table } from "./Table-chunk.js";
import { HtmlEditor, HtmlEditorMode } from "./HtmlEditor-chunk.js";
import { getWhitelabelRegistrationDomains, stringToSubscriptionType } from "./LoginUtils-chunk.js";
import { StorageBehavior } from "./UsageTestModel-chunk.js";
import { formatNameAndAddress } from "./CommonFormatter-chunk.js";
import { PasswordForm, PasswordModel } from "./PasswordForm-chunk.js";
import { WizardEventType, createWizardDialog, emitWizardEvent, wizardPageWrapper } from "./WizardDialog-chunk.js";
import { SegmentControl } from "./SegmentControl-chunk.js";
import { UpgradeType, appStorePlanName, getCurrentCount, getLazyLoadedPayPalUrl, getPreconditionFailedPaymentMsg, getTotalStorageCapacityPerCustomer, hasRunningAppStoreSubscription, isAutoResponderActive, isEventInvitesActive, isSharingActive, isWhitelabelActive, queryAppStoreSubscriptionOwnership } from "./SubscriptionUtils-chunk.js";
import { RecoverCodeField } from "./RecoverCodeDialog-chunk.js";
import { isPaidPlanDomain } from "./MailAddressesUtils-chunk.js";
import { FeatureListProvider, PaymentInterval, PriceAndConfigProvider, PriceType, UpgradePriceType, asPaymentInterval, formatMonthlyPrice, formatPrice, formatPriceDataWithInfo, formatPriceWithInfo, getDisplayNameOfPlanType, getPaymentMethodInfoText, getPaymentMethodName, isReferenceDateWithinCyberMondayCampaign } from "./PriceUtils-chunk.js";
import { BOX_MARGIN, BuyOptionBox, BuyOptionDetails, CURRENT_GIFT_CARD_TERMS_VERSION, CURRENT_PRIVACY_VERSION, CURRENT_TERMS_VERSION, GiftCardMessageEditorField, GiftCardStatus, TermsSection, getActiveSubscriptionActionButtonReplacement, loadGiftCards, renderTermsAndConditionsButton, showGiftCardToShare, showPurchaseGiftCardDialog } from "./PurchaseGiftCardDialog-chunk.js";
import { MessageBox } from "./MessageBox-chunk.js";
import { SURVEY_VERSION_NUMBER, showLeavingUserSurveyWizard } from "./LeavingUserSurveyWizard-chunk.js";

//#region src/common/subscription/SubscriptionSelector.ts
const BusinessUseItems = [{
	name: lang.get("pricing.privateUse_label"),
	value: false
}, {
	name: lang.get("pricing.businessUse_label"),
	value: true
}];
function getActionButtonBySubscription(actionButtons, subscription) {
	const ret = actionButtons[subscription];
	if (ret == null) throw new ProgrammingError("Plan is not valid");
	return () => mithril_default(LoginButton, ret());
}
var SubscriptionSelector = class {
	containerDOM = null;
	featuresExpanded = {
		[PlanType.Free]: false,
		[PlanType.Revolutionary]: false,
		[PlanType.Legend]: false,
		[PlanType.Essential]: false,
		[PlanType.Advanced]: false,
		[PlanType.Unlimited]: false,
		All: false
	};
	oninit(vnode) {
		const acceptedPlans = vnode.attrs.acceptedPlans;
		const onlyBusinessPlansAccepted = acceptedPlans.every((plan) => NewBusinessPlans.includes(plan));
		if (onlyBusinessPlansAccepted) vnode.attrs.options.businessUse(true);
	}
	renderHeadline(msg, currentPlanType, priceInfoTextId, isBusiness, isCyberMonday) {
		const wrapInDiv = (text, style) => {
			return mithril_default(".b.center", { style }, text);
		};
		if (msg) return wrapInDiv(lang.getTranslationText(msg));
else if (currentPlanType != null && LegacyPlans.includes(currentPlanType)) return wrapInDiv(lang.get("currentPlanDiscontinued_msg"));
		if (priceInfoTextId && lang.exists(priceInfoTextId)) return wrapInDiv(lang.get(priceInfoTextId));
		if (isCyberMonday && !isBusiness) return wrapInDiv(lang.get("pricing.cyber_monday_msg"), {
			width: "230px",
			margin: "1em auto 0 auto"
		});
	}
	view(vnode) {
		const { acceptedPlans, priceInfoTextId, msg, featureListProvider, currentPlanType, options, boxWidth } = vnode.attrs;
		const columnWidth = boxWidth + BOX_MARGIN * 2;
		const inMobileView = (this.containerDOM && this.containerDOM.clientWidth < columnWidth * 2) == true;
		const featureExpander = this.renderFeatureExpanders(inMobileView, featureListProvider);
		let additionalInfo;
		let plans;
		const currentPlan = currentPlanType;
		const signup$1 = currentPlan == null;
		const onlyBusinessPlansAccepted = acceptedPlans.every((plan) => NewBusinessPlans.includes(plan));
		const onlyPersonalPlansAccepted = acceptedPlans.every((plan) => NewPersonalPlans.includes(plan));
		const showBusinessSelector = !onlyBusinessPlansAccepted && !onlyPersonalPlansAccepted && !isIOSApp();
		const isCyberMonday = isReferenceDateWithinCyberMondayCampaign(Const.CURRENT_DATE ?? new Date());
		let subscriptionPeriodInfoMsg = !signup$1 && currentPlan !== PlanType.Free ? lang.get("switchSubscriptionInfo_msg") + " " : "";
		if (options.businessUse()) {
			plans = [
				PlanType.Essential,
				PlanType.Advanced,
				PlanType.Unlimited
			];
			subscriptionPeriodInfoMsg += lang.get("pricing.subscriptionPeriodInfoBusiness_msg");
		} else {
			if (inMobileView) if (isCyberMonday) plans = [
				PlanType.Legend,
				PlanType.Revolutionary,
				PlanType.Free
			];
else plans = [
				PlanType.Revolutionary,
				PlanType.Legend,
				PlanType.Free
			];
else if (isCyberMonday) plans = [
				PlanType.Free,
				PlanType.Legend,
				PlanType.Revolutionary
			];
else plans = [
				PlanType.Free,
				PlanType.Revolutionary,
				PlanType.Legend
			];
			subscriptionPeriodInfoMsg += lang.get("pricing.subscriptionPeriodInfoPrivate_msg");
		}
		const shouldShowFirstYearDiscountNotice = !isIOSApp() && isCyberMonday && !options.businessUse() && options.paymentInterval() === PaymentInterval.Yearly;
		additionalInfo = mithril_default(".flex.flex-column.items-center", [
			featureExpander.All,
			mithril_default(".smaller.mb.center", subscriptionPeriodInfoMsg),
			shouldShowFirstYearDiscountNotice && mithril_default(".smaller.mb.center", `* ${lang.get("pricing.legendAsterisk_msg")}`)
		]);
		const buyBoxesViewPlacement = plans.filter((plan) => acceptedPlans.includes(plan) || currentPlanType === plan).map((personalPlan, i) => {
			return [this.renderBuyOptionBox(vnode.attrs, inMobileView, personalPlan, isCyberMonday), this.renderBuyOptionDetails(vnode.attrs, i === 0, personalPlan, featureExpander, isCyberMonday)];
		});
		return mithril_default("", { lang: lang.code }, [
			showBusinessSelector ? mithril_default(SegmentControl, {
				selectedValue: options.businessUse(),
				onValueSelected: options.businessUse,
				items: BusinessUseItems
			}) : null,
			this.renderHeadline(msg, currentPlanType, priceInfoTextId, options.businessUse(), isCyberMonday),
			mithril_default(".flex.center-horizontally.wrap", {
				"data-testid": "dialog:select-subscription",
				oncreate: (vnode$1) => {
					this.containerDOM = vnode$1.dom;
					mithril_default.redraw();
				},
				style: { "column-gap": px(BOX_MARGIN) }
			}, mithril_default(".plans-grid", buyBoxesViewPlacement.flat()), additionalInfo)
		]);
	}
	renderBuyOptionBox(attrs, inMobileView, planType, isCyberMonday) {
		return mithril_default("", { style: { width: attrs.boxWidth ? px(attrs.boxWidth) : px(230) } }, mithril_default(BuyOptionBox, this.createBuyOptionBoxAttr(attrs, planType, inMobileView, isCyberMonday)));
	}
	renderBuyOptionDetails(attrs, renderCategoryTitle, planType, featureExpander, isCyberMonday) {
		return mithril_default("", { style: { width: attrs.boxWidth ? px(attrs.boxWidth) : px(230) } }, mithril_default(BuyOptionDetails, this.createBuyOptionBoxDetailsAttr(attrs, planType, renderCategoryTitle, isCyberMonday)), featureExpander[planType]);
	}
	createBuyOptionBoxAttr(selectorAttrs, targetSubscription, mobile, isCyberMonday) {
		const { priceAndConfigProvider } = selectorAttrs;
		const interval = selectorAttrs.options.paymentInterval();
		const upgradingToPaidAccount = !selectorAttrs.currentPlanType || selectorAttrs.currentPlanType === PlanType.Free;
		const isHighlighted = (() => {
			if (isCyberMonday) return targetSubscription === PlanType.Legend;
			return upgradingToPaidAccount && HighlightedPlans.includes(targetSubscription);
		})();
		const multiuser = NewBusinessPlans.includes(targetSubscription) || LegacyPlans.includes(targetSubscription) || selectorAttrs.multipleUsersAllowed;
		const subscriptionPrice = priceAndConfigProvider.getSubscriptionPrice(interval, targetSubscription, UpgradePriceType.PlanActualPrice);
		let priceStr;
		let referencePriceStr = undefined;
		let priceType;
		if (isIOSApp()) {
			const prices = priceAndConfigProvider.getMobilePrices().get(PlanTypeToName[targetSubscription].toLowerCase());
			if (prices != null) if (isCyberMonday && targetSubscription === PlanType.Legend && interval == PaymentInterval.Yearly) {
				const revolutionaryPrice = priceAndConfigProvider.getMobilePrices().get(PlanTypeToName[PlanType.Revolutionary].toLowerCase());
				priceStr = revolutionaryPrice?.displayYearlyPerMonth ?? NBSP;
				referencePriceStr = prices?.displayYearlyPerMonth;
				priceType = PriceType.YearlyPerMonth;
			} else switch (interval) {
				case PaymentInterval.Monthly:
					priceStr = prices.displayMonthlyPerMonth;
					priceType = PriceType.MonthlyPerMonth;
					break;
				case PaymentInterval.Yearly:
					priceStr = prices.displayYearlyPerYear;
					priceType = PriceType.YearlyPerYear;
					break;
			}
else {
				priceType = PriceType.MonthlyPerMonth;
				priceStr = NBSP;
				referencePriceStr = NBSP;
			}
		} else {
			priceType = interval == PaymentInterval.Monthly ? PriceType.MonthlyPerMonth : PriceType.YearlyPerMonth;
			const referencePrice = priceAndConfigProvider.getSubscriptionPrice(interval, targetSubscription, UpgradePriceType.PlanReferencePrice);
			priceStr = formatMonthlyPrice(subscriptionPrice, interval);
			if (referencePrice > subscriptionPrice) referencePriceStr = formatMonthlyPrice(referencePrice, interval);
else if (interval == PaymentInterval.Yearly && subscriptionPrice !== 0 && !isCyberMonday) {
				const monthlyReferencePrice = priceAndConfigProvider.getSubscriptionPrice(PaymentInterval.Monthly, targetSubscription, UpgradePriceType.PlanActualPrice);
				referencePriceStr = formatMonthlyPrice(monthlyReferencePrice, PaymentInterval.Monthly);
			}
		}
		const asteriskOrEmptyString = !isIOSApp() && isCyberMonday && targetSubscription === PlanType.Legend && interval === PaymentInterval.Yearly ? "*" : "";
		return {
			heading: getDisplayNameOfPlanType(targetSubscription),
			actionButton: selectorAttrs.currentPlanType === targetSubscription ? getActiveSubscriptionActionButtonReplacement() : getActionButtonBySubscription(selectorAttrs.actionButtons, targetSubscription),
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
			bonusMonths: targetSubscription !== PlanType.Free && interval === PaymentInterval.Yearly ? Number(selectorAttrs.priceAndConfigProvider.getRawPricingData().bonusMonthsForYearlyPlan) : 0,
			targetSubscription
		};
	}
	createBuyOptionBoxDetailsAttr(selectorAttrs, targetSubscription, renderCategoryTitle, isCyberMonday) {
		const { featureListProvider } = selectorAttrs;
		const subscriptionFeatures = featureListProvider.getFeatureList(targetSubscription);
		const categoriesToShow = subscriptionFeatures.categories.map((fc) => {
			return localizeFeatureCategory(fc, targetSubscription, selectorAttrs);
		}).filter((fc) => fc != null);
		const isLegend = targetSubscription === PlanType.Legend;
		const isYearly = selectorAttrs.options.paymentInterval() === PaymentInterval.Yearly;
		return {
			categories: categoriesToShow,
			featuresExpanded: this.featuresExpanded[targetSubscription] || this.featuresExpanded.All,
			renderCategoryTitle,
			iconStyle: isCyberMonday && isYearly && isLegend ? { fill: theme.content_accent_cyber_monday } : undefined
		};
	}
	/**
	* Renders the feature expanders depending on whether currently displaying the feature list in single-column layout or in multi-column layout.
	* If a specific expander is not needed and thus should not be renderer, null | undefined is returned
	*/
	renderFeatureExpanders(inMobileView, featureListProvider) {
		if (!featureListProvider.featureLoadingDone()) return {
			[PlanType.Free]: null,
			[PlanType.Revolutionary]: null,
			[PlanType.Legend]: null,
			[PlanType.Essential]: null,
			[PlanType.Advanced]: null,
			[PlanType.Unlimited]: null,
			All: null
		};
		if (inMobileView) {
			if (this.featuresExpanded.All) for (const k in this.featuresExpanded) this.featuresExpanded[k] = true;
			return {
				[PlanType.Free]: this.renderExpander(PlanType.Free),
				[PlanType.Revolutionary]: this.renderExpander(PlanType.Revolutionary),
				[PlanType.Legend]: this.renderExpander(PlanType.Legend),
				[PlanType.Advanced]: this.renderExpander(PlanType.Advanced),
				[PlanType.Essential]: this.renderExpander(PlanType.Essential),
				[PlanType.Unlimited]: this.renderExpander(PlanType.Unlimited),
				All: null
			};
		} else {
			for (const k in this.featuresExpanded) this.featuresExpanded[k] = this.featuresExpanded.All;
			return Object.assign({}, { All: this.renderExpander("All") });
		}
	}
	/**
	* Renders a single feature expander.
	* @param subType The current expander that should be rendered
	* @private
	*/
	renderExpander(subType) {
		return this.featuresExpanded[subType] ? null : mithril_default(Button, {
			label: "pricing.showAllFeatures",
			type: ButtonType.Secondary,
			click: (event) => {
				this.featuresExpanded[subType] = !this.featuresExpanded[subType];
				event.stopPropagation();
			}
		});
	}
};
function localizeFeatureListItem(item, targetSubscription, attrs) {
	const text = tryGetTranslation(item.text, getReplacement(item.replacements, targetSubscription, attrs));
	if (text == null) return null;
	if (!item.toolTip) return {
		text,
		key: item.text,
		antiFeature: item.antiFeature,
		omit: item.omit,
		heart: !!item.heart
	};
else {
		const toolTipText = tryGetTranslation(item.toolTip);
		if (toolTipText === null) return null;
		const toolTip = item.toolTip.endsWith("_markdown") ? mithril_default.trust(toolTipText) : toolTipText;
		return {
			text,
			toolTip,
			key: item.text,
			antiFeature: item.antiFeature,
			omit: item.omit,
			heart: !!item.heart
		};
	}
}
function localizeFeatureCategory(category, targetSubscription, attrs) {
	const title = tryGetTranslation(category.title);
	const features = downcast(category.features.map((f) => localizeFeatureListItem(f, targetSubscription, attrs)).filter((it) => it != null));
	return {
		title,
		key: category.title,
		features,
		featureCount: category.featureCount
	};
}
function tryGetTranslation(key, replacements) {
	try {
		return lang.get(key, replacements);
	} catch (e) {
		console.log("could not translate feature text for key", key, "hiding feature item");
		return null;
	}
}
function getReplacement(key, subscription, attrs) {
	const { priceAndConfigProvider } = attrs;
	switch (key) {
		case "customDomains": {
			const customDomainType = downcast(priceAndConfigProvider.getPlanPricesForPlan(subscription).planConfiguration.customDomainType);
			return { "{amount}": CustomDomainTypeCountName[customDomainType] };
		}
		case "mailAddressAliases": return { "{amount}": priceAndConfigProvider.getPlanPricesForPlan(subscription).planConfiguration.nbrOfAliases };
		case "storage": return { "{amount}": priceAndConfigProvider.getPlanPricesForPlan(subscription).planConfiguration.storageGb };
		case "label": return { "{amount}": priceAndConfigProvider.getPlanPricesForPlan(subscription).planConfiguration.maxLabels };
	}
}
function getHelpLabel(planType, businessUse) {
	if (planType === PlanType.Free) return "pricing.upgradeLater_msg";
	return businessUse ? "pricing.excludesTaxes_msg" : "pricing.includesTaxes_msg";
}
function getPriceHint(subscriptionPrice, priceType, multiuser) {
	if (subscriptionPrice > 0) switch (priceType) {
		case PriceType.YearlyPerYear: return lang.get("pricing.perYear_label");
		case PriceType.YearlyPerMonth: if (multiuser) return lang.get("pricing.perUserMonthPaidYearly_label");
else return lang.get("pricing.perMonthPaidYearly_label");
		case PriceType.MonthlyPerMonth: if (multiuser) return lang.get("pricing.perUserMonth_label");
else return lang.get("pricing.perMonth_label");
	}
	return "";
}

//#endregion
//#region src/common/subscription/SwitchSubscriptionDialogModel.ts
var SwitchSubscriptionDialogModel = class {
	currentPlanInfo;
	constructor(customer, accountingInfo, planType, lastBooking) {
		this.customer = customer;
		this.accountingInfo = accountingInfo;
		this.planType = planType;
		this.lastBooking = lastBooking;
		this.currentPlanInfo = this._initCurrentPlanInfo();
	}
	_initCurrentPlanInfo() {
		const paymentInterval = asPaymentInterval(this.accountingInfo.paymentInterval);
		return {
			businessUse: this.customer.businessUse,
			planType: this.planType,
			paymentInterval
		};
	}
	/**
	* Check if the user's current plan has multiple users due to a legacy agreement and will continue to do so if the user switches plans.
	*
	* @return true if multiple users are supported due to legacy, false if not; note that returning false does not mean that the current plan does not actually support multiple users
	*/
	multipleUsersStillSupportedLegacy() {
		if (isCustomizationEnabledForCustomer(this.customer, FeatureType.MultipleUsers)) return true;
		if (LegacyPlans.includes(this.planType)) {
			const userItem = this.lastBooking.items.find((item) => item.featureType === BookingItemFeatureType.LegacyUsers);
			const sharedMailItem = this.lastBooking.items.find((item) => item.featureType === BookingItemFeatureType.SharedMailGroup);
			const userCount = Number(userItem?.currentCount);
			const sharedMailCount = sharedMailItem ? Number(sharedMailItem.currentCount) : 0;
			return userCount + sharedMailCount > 1;
		}
		return false;
	}
};

//#endregion
//#region src/common/subscription/InvoiceDataInput.ts
var import_stream$7 = __toESM(require_stream(), 1);
let InvoiceDataInputLocation = function(InvoiceDataInputLocation$1) {
	InvoiceDataInputLocation$1[InvoiceDataInputLocation$1["InWizard"] = 0] = "InWizard";
	InvoiceDataInputLocation$1[InvoiceDataInputLocation$1["Other"] = 1] = "Other";
	return InvoiceDataInputLocation$1;
}({});
var InvoiceDataInput = class {
	invoiceAddressComponent;
	selectedCountry;
	vatNumber = "";
	__paymentPaypalTest;
	constructor(businessUse, invoiceData, location = InvoiceDataInputLocation.Other) {
		this.businessUse = businessUse;
		this.location = location;
		this.__paymentPaypalTest = locator.usageTestController.getTest("payment.paypal");
		this.invoiceAddressComponent = new HtmlEditor().setStaticNumberOfLines(5).showBorders().setPlaceholderId("invoiceAddress_label").setMode(HtmlEditorMode.HTML).setHtmlMonospace(false).setValue(invoiceData.invoiceAddress);
		this.selectedCountry = (0, import_stream$7.default)(invoiceData.country);
		this.view = this.view.bind(this);
		this.oncreate = this.oncreate.bind(this);
	}
	view() {
		return [
			this.businessUse || this.location !== InvoiceDataInputLocation.InWizard ? mithril_default("", [mithril_default(".pt", mithril_default(this.invoiceAddressComponent)), mithril_default(".small", lang.get(this.businessUse ? "invoiceAddressInfoBusiness_msg" : "invoiceAddressInfoPrivate_msg"))]) : null,
			renderCountryDropdown({
				selectedCountry: this.selectedCountry(),
				onSelectionChanged: this.selectedCountry,
				helpLabel: () => lang.get("invoiceCountryInfoConsumer_msg")
			}),
			this.isVatIdFieldVisible() ? mithril_default(TextField, {
				label: "invoiceVatIdNo_label",
				value: this.vatNumber,
				oninput: (value) => this.vatNumber = value,
				helpLabel: () => lang.get("invoiceVatIdNoInfoBusiness_msg")
			}) : null
		];
	}
	oncreate() {
		locator.serviceExecutor.get(LocationService, null).then((location) => {
			if (!this.selectedCountry()) {
				const country = Countries.find((c) => c.a === location.country);
				if (country) {
					this.selectedCountry(country);
					mithril_default.redraw();
				}
			}
		});
	}
	validateInvoiceData() {
		const address = this.getAddress();
		const countrySelected = this.selectedCountry() != null;
		if (this.businessUse) {
			if (address.trim() === "" || address.split("\n").length > 5) return "invoiceAddressInfoBusiness_msg";
else if (!countrySelected) return "invoiceCountryInfoBusiness_msg";
		} else if (!countrySelected) return "invoiceCountryInfoBusiness_msg";
else if (address.split("\n").length > 4) return "invoiceAddressInfoBusiness_msg";
		this.__paymentPaypalTest?.getStage(3).complete();
		return null;
	}
	getInvoiceData() {
		const address = this.getAddress();
		const selectedCountry = this.selectedCountry();
		return {
			invoiceAddress: address,
			country: selectedCountry,
			vatNumber: selectedCountry?.t === CountryType.EU && this.businessUse ? this.vatNumber : ""
		};
	}
	isVatIdFieldVisible() {
		const selectedCountry = this.selectedCountry();
		return this.businessUse && selectedCountry != null && selectedCountry.t === CountryType.EU;
	}
	getAddress() {
		return this.invoiceAddressComponent.getValue().split("\n").filter((line) => line.trim().length > 0).join("\n");
	}
};

//#endregion
//#region src/common/subscription/SimplifiedCreditCardInput.ts
function restoreSelection(domInput) {
	const { selectionStart, selectionEnd, selectionDirection } = domInput;
	const isAtEnd = domInput.value.length === selectionStart;
	setTimeout(() => {
		const currentLength = domInput.value.length;
		domInput.setSelectionRange(isAtEnd ? currentLength : selectionStart, isAtEnd ? currentLength : selectionEnd, selectionDirection ?? undefined);
	}, 0);
}
var SimplifiedCreditCardInput = class {
	dateFieldLeft = false;
	numberFieldLeft = false;
	cvvFieldLeft = false;
	ccNumberDom = null;
	expDateDom = null;
	view(vnode) {
		let { viewModel } = vnode.attrs;
		return [
			mithril_default(TextField, {
				label: "creditCardNumber_label",
				helpLabel: () => this.renderCcNumberHelpLabel(viewModel),
				value: viewModel.creditCardNumber,
				oninput: (newValue) => {
					viewModel.creditCardNumber = newValue;
					restoreSelection(this.ccNumberDom);
				},
				onblur: () => this.numberFieldLeft = true,
				autocompleteAs: Autocomplete.ccNumber,
				onDomInputCreated: (dom) => this.ccNumberDom = dom
			}),
			mithril_default(TextField, {
				label: "creditCardExpirationDateWithFormat_label",
				value: viewModel.expirationDate,
				helpLabel: () => this.dateFieldLeft ? lang.get(viewModel.getExpirationDateErrorHint() ?? "emptyString_msg") : lang.get("emptyString_msg"),
				onblur: () => this.dateFieldLeft = true,
				oninput: (newValue) => {
					viewModel.expirationDate = newValue;
					restoreSelection(this.expDateDom);
				},
				onDomInputCreated: (dom) => this.expDateDom = dom,
				autocompleteAs: Autocomplete.ccExp
			}),
			mithril_default(TextField, {
				label: lang.makeTranslation("cvv", viewModel.getCvvLabel()),
				value: viewModel.cvv,
				helpLabel: () => this.renderCvvNumberHelpLabel(viewModel),
				oninput: (newValue) => viewModel.cvv = newValue,
				onblur: () => this.cvvFieldLeft = true,
				autocompleteAs: Autocomplete.ccCsc
			})
		];
	}
	renderCcNumberHelpLabel(model) {
		const hint = model.getCreditCardNumberHint();
		const error = model.getCreditCardNumberErrorHint();
		if (this.numberFieldLeft) if (hint) return error ? lang.get("creditCardHintWithError_msg", {
			"{hint}": hint,
			"{errorText}": error
		}) : hint;
else return error ? error : lang.get("emptyString_msg");
else return hint ?? lang.get("emptyString_msg");
	}
	renderCvvNumberHelpLabel(model) {
		const cvvHint = model.getCvvHint();
		const cvvError = model.getCvvErrorHint();
		if (this.cvvFieldLeft) if (cvvHint) return cvvError ? lang.get("creditCardHintWithError_msg", {
			"{hint}": cvvHint,
			"{errorText}": cvvError
		}) : cvvHint;
else return cvvError ? cvvError : lang.get("emptyString_msg");
else return cvvHint ?? lang.get("emptyString_msg");
	}
};

//#endregion
//#region src/common/subscription/SimplifiedCreditCardInputModel.ts
let CardType = function(CardType$1) {
	CardType$1["Amex"] = "Amex";
	CardType$1["Visa"] = "Visa";
	CardType$1["Mastercard"] = "Mastercard";
	CardType$1["Maestro"] = "Maestro";
	CardType$1["Discover"] = "Discover";
	CardType$1["Other"] = "Other";
	return CardType$1;
}({});
function getCardTypeRange(cc) {
	for (let cardType of typedValues(CardType)) {
		if (cardType === CardType.Other) continue;
		for (let range of CardPrefixRanges[cardType]) {
			const lowestRange = range[0].padEnd(8, "0");
			const highestRange = range[1].padEnd(8, "9");
			const lowestCC = cc.slice(0, 8).padEnd(8, "0");
			const highestCC = cc.slice(0, 8).padEnd(8, "9");
			if (lowestRange <= lowestCC && highestCC <= highestRange) return cardType;
		}
	}
	return CardType.Other;
}
const CardSpecs = Object.freeze({
	[CardType.Visa]: {
		cvvLength: 3,
		cvvName: "CVV",
		name: "Visa"
	},
	[CardType.Mastercard]: {
		cvvLength: 3,
		cvvName: "CVC",
		name: "Mastercard"
	},
	[CardType.Maestro]: {
		cvvLength: 3,
		cvvName: "CVV",
		name: "Maestro"
	},
	[CardType.Amex]: {
		cvvLength: 4,
		cvvName: "CSC",
		name: "American Express"
	},
	[CardType.Discover]: {
		cvvLength: 3,
		cvvName: "CVD",
		name: "Discover"
	},
	[CardType.Other]: {
		cvvLength: null,
		cvvName: "CVV",
		name: null
	}
});
const CardPrefixRanges = Object.freeze({
	[CardType.Visa]: [["4", "4"]],
	[CardType.Mastercard]: [["51", "55"], ["2221", "2720"]],
	[CardType.Maestro]: [
		["6759", "6759"],
		["676770", "676770"],
		["676774", "676774"],
		["5018", "5018"],
		["5020", "5020"],
		["5038", "5038"],
		["5893", "5893"],
		["6304", "6304"],
		["6759", "6759"],
		["6761", "6763"]
	],
	[CardType.Amex]: [["34", "34"], ["37", "37"]],
	[CardType.Discover]: [
		["6011", "6011"],
		["644", "649"],
		["65", "65"],
		["622126", "622925"]
	],
	[CardType.Other]: [[]]
});
const allDigits = [
	"0",
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9"
];
const definiteMonthDigits = [
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9"
];
const secondMonthDigits = [
	"0",
	"1",
	"2"
];
const separator = "/";
const niceSeparator = ` ${separator} `;
/**
* completely strip all whitespace from a string
* @param s the string to clean up
*/
function stripWhitespace(s) {
	return s.replace(/\s/g, "");
}
function stripNonDigits(s) {
	return s.replace(/\D/g, "");
}
function isDigitString(s) {
	if (s.length === 0) return false;
	const matches = s.match(/\d/g);
	return matches != null && matches.length === s.length;
}
/**
* take a function that corrects whitespace on input that does not contain whitespace
* and return one that does the same on input that contains arbitrary whitespace.
* @param fn a function that does not deal with whitespace-containing or empty input
*/
function normalizeInput(fn) {
	return (v, ov = "") => {
		v = stripWhitespace(v);
		if (v === "") return v;
		ov = stripWhitespace(ov);
		return fn(v, ov);
	};
}
function nomDigitsUntilLength(rest, ret, length) {
	while (rest.length > 0 && ret.length < length) {
		const next = rest[0];
		rest = rest.slice(1);
		if (allDigits.includes(next)) ret += next;
else {
			rest = "";
			break;
		}
	}
	return {
		rest,
		ret
	};
}
const inferExpirationDate = normalizeInput(inferNormalizedExpirationDate);
/**
*
* @param value non-empty string without whitespace specifying a (potentially partial) date as a sequence of 0 to 6 digits.
* @param oldDate previous value
*/
function inferNormalizedExpirationDate(value, oldDate) {
	if (oldDate.startsWith(value) && value.endsWith(separator)) return value.slice(0, -1);
	if (!allDigits.includes(value[0])) return "";
	let rest = value;
	let ret = "";
	if (definiteMonthDigits.includes(rest[0])) {
		ret = "0" + rest[0];
		rest = rest.slice(1);
	} else if (rest[0] === "0") {
		ret = "0";
		rest = rest.slice(1);
		if (rest[0] === "0") return "0";
else if (allDigits.includes(rest[0])) {
			ret = "0" + rest[0];
			rest = rest.slice(1);
		} else return "0";
	} else if (value.length > 1) {
		rest = rest.slice(1);
		if (secondMonthDigits.includes(rest[0])) {
			ret = "1" + rest[0];
			rest = rest.slice(1);
		} else if (allDigits.includes(rest[0])) ret = "01";
else if (rest[0] === separator) ret = "01";
else return "1";
	} else return "1";
	let hadSlash = false;
	while (rest.startsWith(separator)) {
		hadSlash = true;
		rest = rest.slice(1);
	}
	if (ret.length === 2 && rest.length > 0 || hadSlash || value.length > oldDate.length) ret += separator;
	({rest, ret} = nomDigitsUntilLength(rest, ret, "xx/xx".length));
	if (!ret.endsWith("/20")) return ret.replace(separator, niceSeparator);
	({ret} = nomDigitsUntilLength(rest, ret, "xx/xxxx".length));
	return ret.replace(separator, niceSeparator);
}
/**
* take a sequence of digits and other characters, strip non-digits and group the rest into space-separated groups.
* @param value non-empty string without whitespace specifying a (potentially partial) credit card number
* @param groups most credit card number digits are grouped in groups of 4, but there are exceptions
*/
function groupCreditCardNumber(value, groups = [
	4,
	4,
	4,
	4,
	4
]) {
	value = stripNonDigits(value);
	value = value.slice(0, 20);
	let ret = value.slice(0, groups[0]);
	value = value.slice(groups[0]);
	for (let i = 1; i < groups.length && value.length > 0; i++) {
		ret += " ";
		ret += value.slice(0, groups[i]);
		value = value.slice(groups[i]);
	}
	return ret;
}
function getExpirationMonthAndYear(expirationDate) {
	if (expirationDate.length < "xx / xx".length || !expirationDate.includes(" / ")) return null;
	const [monthString, yearString] = expirationDate.split(" / ").map((p) => p.trim());
	if (!isDigitString(monthString) || !isDigitString(yearString)) return null;
	const monthNumber = Number(monthString);
	if (monthNumber < 1 || monthNumber > 12) return null;
	const yearNumber = Number(yearString);
	if (yearString.length === 4 && yearString.startsWith("20")) return {
		year: Math.floor(yearNumber) - 2e3,
		month: Math.floor(monthNumber)
	};
else if (yearString.length === 2) return {
		year: Math.floor(yearNumber),
		month: Math.floor(monthNumber)
	};
else return null;
}
var SimplifiedCreditCardViewModel = class {
	_cardHolderName = "";
	_creditCardNumber = "";
	_cvv = "";
	_expirationDate = "";
	creditCardType = CardType.Other;
	constructor(lang$1) {
		this.lang = lang$1;
	}
	get expirationDate() {
		return this._expirationDate;
	}
	set expirationDate(value) {
		this._expirationDate = inferExpirationDate(value, this._expirationDate);
	}
	get cvv() {
		return this._cvv;
	}
	set cvv(value) {
		const correctedCvv = stripWhitespace(stripNonDigits(value));
		this._cvv = correctedCvv.slice(0, 4);
	}
	get creditCardNumber() {
		return this._creditCardNumber;
	}
	set creditCardNumber(value) {
		let cleanedNumber = stripNonDigits(stripWhitespace(value));
		this.creditCardType = getCardTypeRange(cleanedNumber);
		this._creditCardNumber = this.creditCardType === CardType.Amex ? groupCreditCardNumber(cleanedNumber, [
			4,
			6,
			5,
			5
		]) : groupCreditCardNumber(cleanedNumber);
	}
	get cardHolderName() {
		return this._cardHolderName;
	}
	set cardHolderName(value) {}
	validateCreditCardPaymentData() {
		const cc = this.getCreditCardData();
		const invalidNumber = this.validateCreditCardNumber(cc.number);
		if (invalidNumber) return invalidNumber;
		const invalidCVV = this.validateCVV(cc.cvv);
		if (invalidCVV) return invalidCVV;
		const invalidExpirationDate = this.getExpirationDateErrorHint();
		if (invalidExpirationDate) return invalidExpirationDate;
		return null;
	}
	validateCreditCardNumber(number) {
		if (number === "") return "creditCardNumberFormat_msg";
else if (!isValidCreditCardNumber(number)) return "creditCardNumberInvalid_msg";
		return null;
	}
	validateCVV(cvv) {
		if (cvv.length < 3 || cvv.length > 4) return "creditCardCVVFormat_label";
		return null;
	}
	getCreditCardNumberHint() {
		const spec = CardSpecs[this.creditCardType];
		if (this.creditCardType === CardType.Other) return null;
		return spec.name;
	}
	getCreditCardNumberErrorHint() {
		return this.validateCreditCardNumber(this._creditCardNumber) ? this.lang.get("creditCardNumberInvalid_msg") : null;
	}
	/**
	* return a translation string detailing what's wrong with the
	* contents of the expiration date field, if any.
	*/
	getExpirationDateErrorHint() {
		const expiration = getExpirationMonthAndYear(this._expirationDate);
		if (expiration == null) return "creditCardExprationDateInvalid_msg";
		const today = new Date();
		const currentYear = today.getFullYear() - 2e3;
		const currentMonth = today.getMonth() + 1;
		const { year, month } = expiration;
		if (year > currentYear || year === currentYear && month >= currentMonth) return null;
		return "creditCardExpired_msg";
	}
	getCvvHint() {
		if (this.creditCardType === CardType.Other) return null;
else {
			const spec = CardSpecs[this.creditCardType];
			return this.lang.get("creditCardCvvHint_msg", {
				"{currentDigits}": this.cvv.length,
				"{totalDigits}": spec.cvvLength
			});
		}
	}
	getCvvErrorHint() {
		const spec = CardSpecs[this.creditCardType];
		return this.validateCVV(this.cvv) ? this.lang.get("creditCardSpecificCVVInvalid_msg", { "{securityCode}": spec.cvvName }) : null;
	}
	getCvvLabel() {
		if (this.creditCardType === CardType.Other) return this.lang.get("creditCardCvvLabelLong_label", { "{cvvName}": CardSpecs[CardType.Other].cvvName });
else {
			const spec = CardSpecs[this.creditCardType];
			return this.lang.get("creditCardCvvLabelLong_label", { "{cvvName}": spec.cvvName });
		}
	}
	getCreditCardData() {
		const expiration = getExpirationMonthAndYear(this._expirationDate);
		let cc = createCreditCard({
			number: stripWhitespace(this._creditCardNumber),
			cardHolderName: this._cardHolderName,
			cvv: this._cvv,
			expirationMonth: expiration ? String(expiration.month) : "",
			expirationYear: expiration ? String(expiration.year) : ""
		});
		return cc;
	}
	setCreditCardData(data) {
		if (data) {
			this.creditCardNumber = data.number;
			this.cvv = data.cvv;
			if (data.expirationMonth && data.expirationYear) this.expirationDate = data.expirationMonth + " / " + data.expirationYear;
		} else {
			this._creditCardNumber = "";
			this._cvv = "";
			this._expirationDate = "";
		}
	}
};

//#endregion
//#region src/common/subscription/PaymentMethodInput.ts
var PaymentMethodInput = class {
	ccViewModel;
	_payPalAttrs;
	_selectedCountry;
	_selectedPaymentMethod;
	_subscriptionOptions;
	_accountingInfo;
	_entityEventListener;
	__paymentPaypalTest;
	constructor(subscriptionOptions, selectedCountry, accountingInfo, payPalRequestUrl, defaultPaymentMethod) {
		this._selectedCountry = selectedCountry;
		this._subscriptionOptions = subscriptionOptions;
		this.ccViewModel = new SimplifiedCreditCardViewModel(lang);
		this._accountingInfo = accountingInfo;
		this._payPalAttrs = {
			payPalRequestUrl,
			accountingInfo: this._accountingInfo
		};
		this.__paymentPaypalTest = locator.usageTestController.getTest("payment.paypal");
		this._entityEventListener = (updates) => {
			return pMap(updates, (update) => {
				if (isUpdateForTypeRef(AccountingInfoTypeRef, update)) return locator.entityClient.load(AccountingInfoTypeRef, update.instanceId).then((accountingInfo$1) => {
					this.__paymentPaypalTest?.getStage(2).complete();
					this._accountingInfo = accountingInfo$1;
					this._payPalAttrs.accountingInfo = accountingInfo$1;
					mithril_default.redraw();
				});
			}).then(noOp);
		};
		this._selectedPaymentMethod = defaultPaymentMethod;
	}
	oncreate() {
		locator.eventController.addEntityListener(this._entityEventListener);
	}
	onremove() {
		locator.eventController.removeEntityListener(this._entityEventListener);
	}
	view() {
		switch (this._selectedPaymentMethod) {
			case PaymentMethodType.Invoice: return mithril_default(".flex-center", mithril_default(MessageBox, { style: { marginTop: px(16) } }, this.isOnAccountAllowed() ? lang.get("paymentMethodOnAccount_msg") + " " + lang.get("paymentProcessingTime_msg") : lang.get("paymentMethodNotAvailable_msg")));
			case PaymentMethodType.AccountBalance: return mithril_default(".flex-center", mithril_default(MessageBox, { style: { marginTop: px(16) } }, lang.get("paymentMethodAccountBalance_msg")));
			case PaymentMethodType.Paypal: return mithril_default(PaypalInput, this._payPalAttrs);
			default: return mithril_default(SimplifiedCreditCardInput, { viewModel: this.ccViewModel });
		}
	}
	isOnAccountAllowed() {
		const country = this._selectedCountry();
		if (!country) return false;
else if (this._accountingInfo.paymentMethod === PaymentMethodType.Invoice) return true;
else if (this._subscriptionOptions.businessUse() && country.t !== CountryType.OTHER) return true;
else return false;
	}
	isPaypalAssigned() {
		return isPaypalAssigned(this._accountingInfo);
	}
	validatePaymentData() {
		if (!this._selectedPaymentMethod) return "invoicePaymentMethodInfo_msg";
else if (this._selectedPaymentMethod === PaymentMethodType.Invoice) if (!this.isOnAccountAllowed()) return "paymentMethodNotAvailable_msg";
else return null;
else if (this._selectedPaymentMethod === PaymentMethodType.Paypal) return isPaypalAssigned(this._accountingInfo) ? null : "paymentDataPayPalLogin_msg";
else if (this._selectedPaymentMethod === PaymentMethodType.CreditCard) return this.ccViewModel.validateCreditCardPaymentData();
else return null;
	}
	updatePaymentMethod(value, paymentData) {
		this._selectedPaymentMethod = value;
		if (value === PaymentMethodType.CreditCard) {
			if (paymentData) this.ccViewModel.setCreditCardData(paymentData.creditCardData);
			if (this.__paymentPaypalTest) this.__paymentPaypalTest.active = false;
		} else if (value === PaymentMethodType.Paypal) {
			this._payPalAttrs.payPalRequestUrl.getAsync().then(() => mithril_default.redraw());
			if (this.__paymentPaypalTest) this.__paymentPaypalTest.active = true;
			this.__paymentPaypalTest?.getStage(0).complete();
		}
		mithril_default.redraw();
	}
	getPaymentData() {
		return {
			paymentMethod: this._selectedPaymentMethod,
			creditCardData: this._selectedPaymentMethod === PaymentMethodType.CreditCard ? this.ccViewModel.getCreditCardData() : null
		};
	}
	getVisiblePaymentMethods() {
		const availablePaymentMethods = [{
			name: lang.get("paymentMethodCreditCard_label"),
			value: PaymentMethodType.CreditCard
		}, {
			name: "PayPal",
			value: PaymentMethodType.Paypal
		}];
		if (this._subscriptionOptions.businessUse() || this._accountingInfo.paymentMethod === PaymentMethodType.Invoice) availablePaymentMethods.push({
			name: lang.get("paymentMethodOnAccount_label"),
			value: PaymentMethodType.Invoice
		});
		if (this._accountingInfo.paymentMethod === PaymentMethodType.AccountBalance) availablePaymentMethods.push({
			name: lang.get("paymentMethodAccountBalance_label"),
			value: PaymentMethodType.AccountBalance
		});
		return availablePaymentMethods;
	}
};
var PaypalInput = class {
	__paymentPaypalTest;
	constructor() {
		this.__paymentPaypalTest = locator.usageTestController.getTest("payment.paypal");
	}
	view(vnode) {
		let attrs = vnode.attrs;
		return [mithril_default(".flex-center", { style: { "margin-top": "50px" } }, mithril_default(BaseButton, {
			label: lang.makeTranslation("PayPal", "PayPal"),
			icon: mithril_default(".payment-logo.flex", mithril_default.trust(PayPalLogo)),
			class: "border border-radius bg-white button-height plr",
			onclick: () => {
				this.__paymentPaypalTest?.getStage(1).complete();
				if (attrs.payPalRequestUrl.isLoaded()) window.open(attrs.payPalRequestUrl.getLoaded());
else showProgressDialog("payPalRedirect_msg", attrs.payPalRequestUrl.getAsync()).then((url) => window.open(url));
			}
		})), mithril_default(".small.pt.center", isPaypalAssigned(attrs.accountingInfo) ? lang.get("paymentDataPayPalFinished_msg", { "{accountAddress}": attrs.accountingInfo.paymentMethodInfo ?? "" }) : lang.get("paymentDataPayPalLogin_msg"))];
	}
};
function isPaypalAssigned(accountingInfo) {
	return accountingInfo.paypalBillingAgreement != null;
}

//#endregion
//#region src/common/subscription/InvoiceAndPaymentDataPage.ts
var import_stream$6 = __toESM(require_stream(), 1);
var InvoiceAndPaymentDataPage = class {
	_paymentMethodInput = null;
	_invoiceDataInput = null;
	_availablePaymentMethods = null;
	_selectedPaymentMethod;
	dom;
	__signupPaidTest;
	__paymentPaypalTest;
	constructor() {
		this.__signupPaidTest = locator.usageTestController.getTest("signup.paid");
		this.__paymentPaypalTest = locator.usageTestController.getTest("payment.paypal");
		this._selectedPaymentMethod = (0, import_stream$6.default)();
		this._selectedPaymentMethod.map((method) => neverNull(this._paymentMethodInput).updatePaymentMethod(method));
	}
	onremove(vnode) {
		const data = vnode.attrs.data;
		if (this._invoiceDataInput && this._paymentMethodInput) {
			data.invoiceData = this._invoiceDataInput.getInvoiceData();
			data.paymentData = this._paymentMethodInput.getPaymentData();
		}
	}
	oncreate(vnode) {
		this.dom = vnode.dom;
		const data = vnode.attrs.data;
		if (this._invoiceDataInput && this._paymentMethodInput) {
			data.invoiceData = this._invoiceDataInput.getInvoiceData();
			data.paymentData = this._paymentMethodInput.getPaymentData();
		}
		let login = Promise.resolve(null);
		if (!locator.logins.isUserLoggedIn()) login = locator.logins.createSession(neverNull(data.newAccountData).mailAddress, neverNull(data.newAccountData).password, SessionType.Temporary).then((newSessionData) => newSessionData.credentials);
		login.then(() => {
			if (!data.accountingInfo || !data.customer) return locator.logins.getUserController().loadCustomer().then((customer) => {
				data.customer = customer;
				return locator.logins.getUserController().loadCustomerInfo();
			}).then((customerInfo) => locator.entityClient.load(AccountingInfoTypeRef, customerInfo.accountingInfo).then((accountingInfo) => {
				data.accountingInfo = accountingInfo;
			}));
		}).then(() => getDefaultPaymentMethod()).then((defaultPaymentMethod) => {
			this._invoiceDataInput = new InvoiceDataInput(data.options.businessUse(), data.invoiceData, InvoiceDataInputLocation.InWizard);
			let payPalRequestUrl = getLazyLoadedPayPalUrl();
			if (locator.logins.isUserLoggedIn()) locator.logins.waitForFullLogin().then(() => payPalRequestUrl.getAsync());
			this._paymentMethodInput = new PaymentMethodInput(data.options, this._invoiceDataInput.selectedCountry, neverNull(data.accountingInfo), payPalRequestUrl, defaultPaymentMethod);
			this._availablePaymentMethods = this._paymentMethodInput.getVisiblePaymentMethods();
			this._selectedPaymentMethod(data.paymentData.paymentMethod);
			this._paymentMethodInput.updatePaymentMethod(data.paymentData.paymentMethod, data.paymentData);
		});
	}
	view(vnode) {
		const a = vnode.attrs;
		const onNextClick = () => {
			const invoiceDataInput = assertNotNull(this._invoiceDataInput);
			const paymentMethodInput = assertNotNull(this._paymentMethodInput);
			let error = invoiceDataInput.validateInvoiceData() || paymentMethodInput.validatePaymentData();
			if (error) return Dialog.message(error).then(() => null);
else {
				a.data.invoiceData = invoiceDataInput.getInvoiceData();
				a.data.paymentData = paymentMethodInput.getPaymentData();
				return showProgressDialog("updatePaymentDataBusy_msg", Promise.resolve().then(() => {
					let customer = neverNull(a.data.customer);
					if (customer.businessUse !== a.data.options.businessUse()) {
						customer.businessUse = a.data.options.businessUse();
						return locator.entityClient.update(customer);
					}
				}).then(() => updatePaymentData(a.data.options.paymentInterval(), a.data.invoiceData, a.data.paymentData, null, a.data.upgradeType === UpgradeType.Signup, neverNull(a.data.price?.rawPrice), neverNull(a.data.accountingInfo)).then((success) => {
					if (success) {
						const paymentMethodConfirmationStage = this.__signupPaidTest?.getStage(4);
						paymentMethodConfirmationStage?.setMetric({
							name: "paymentMethod",
							value: PaymentMethodTypeToName[a.data.paymentData.paymentMethod]
						});
						paymentMethodConfirmationStage?.complete();
						emitWizardEvent(this.dom, WizardEventType.SHOW_NEXT_PAGE);
					}
				})));
			}
		};
		return mithril_default(".pt", this._availablePaymentMethods ? [
			mithril_default(SegmentControl, {
				items: this._availablePaymentMethods,
				selectedValue: this._selectedPaymentMethod(),
				onValueSelected: this._selectedPaymentMethod
			}),
			mithril_default(".flex-space-around.flex-wrap.pt", [mithril_default(".flex-grow-shrink-half.plr-l", { style: { minWidth: "260px" } }, mithril_default(neverNull(this._invoiceDataInput))), mithril_default(".flex-grow-shrink-half.plr-l", { style: { minWidth: "260px" } }, mithril_default(neverNull(this._paymentMethodInput)))]),
			mithril_default(".flex-center.full-width.pt-l", mithril_default(LoginButton, {
				label: "next_action",
				class: "small-login-button",
				onclick: onNextClick
			}))
		] : null);
	}
};
var InvoiceAndPaymentDataPageAttrs = class {
	data;
	_enabled = () => true;
	constructor(upgradeData) {
		this.data = upgradeData;
	}
	nextAction(showErrorDialog) {
		return Promise.resolve(true);
	}
	headerTitle() {
		return "adminPayment_action";
	}
	isSkipAvailable() {
		return false;
	}
	isEnabled() {
		return this._enabled();
	}
	/**
	* Set the enabled function for isEnabled
	* @param enabled
	*/
	setEnabledFunction(enabled) {
		this._enabled = enabled;
	}
};
async function updatePaymentData(paymentInterval, invoiceData, paymentData, confirmedCountry, isSignup, price, accountingInfo) {
	const paymentResult = await locator.customerFacade.updatePaymentData(paymentInterval, invoiceData, paymentData, confirmedCountry);
	const statusCode = paymentResult.result;
	if (statusCode === PaymentDataResultType.OK) {
		let braintree3ds = paymentResult.braintree3dsRequest;
		if (braintree3ds) return verifyCreditCard(accountingInfo, braintree3ds, price);
else return true;
	} else if (statusCode === PaymentDataResultType.COUNTRY_MISMATCH) {
		const countryName = invoiceData.country ? invoiceData.country.n : "";
		const confirmMessage = lang.getTranslation("confirmCountry_msg", { "{1}": countryName });
		const confirmed = await Dialog.confirm(confirmMessage);
		if (confirmed) return updatePaymentData(paymentInterval, invoiceData, paymentData, invoiceData.country, isSignup, price, accountingInfo);
else return false;
	} else if (statusCode === PaymentDataResultType.INVALID_VATID_NUMBER) await Dialog.message(lang.makeTranslation("invalidVatIdNumber_msg", lang.get("invalidVatIdNumber_msg") + (isSignup ? " " + lang.get("accountWasStillCreated_msg") : "")));
else if (statusCode === PaymentDataResultType.CREDIT_CARD_DECLINED) await Dialog.message(lang.makeTranslation("creditCardDeclined_msg", lang.get("creditCardDeclined_msg") + (isSignup ? " " + lang.get("accountWasStillCreated_msg") : "")));
else if (statusCode === PaymentDataResultType.CREDIT_CARD_CVV_INVALID) await Dialog.message("creditCardCVVInvalid_msg");
else if (statusCode === PaymentDataResultType.PAYMENT_PROVIDER_NOT_AVAILABLE) await Dialog.message(lang.makeTranslation("paymentProviderNotAvailableError_msg", lang.get("paymentProviderNotAvailableError_msg") + (isSignup ? " " + lang.get("accountWasStillCreated_msg") : "")));
else if (statusCode === PaymentDataResultType.OTHER_PAYMENT_ACCOUNT_REJECTED) await Dialog.message(lang.makeTranslation("paymentAccountRejected_msg", lang.get("paymentAccountRejected_msg") + (isSignup ? " " + lang.get("accountWasStillCreated_msg") : "")));
else if (statusCode === PaymentDataResultType.CREDIT_CARD_DATE_INVALID) await Dialog.message("creditCardExprationDateInvalid_msg");
else if (statusCode === PaymentDataResultType.CREDIT_CARD_NUMBER_INVALID) await Dialog.message(lang.makeTranslation("creditCardNumberInvalid_msg", lang.get("creditCardNumberInvalid_msg") + (isSignup ? " " + lang.get("accountWasStillCreated_msg") : "")));
else if (statusCode === PaymentDataResultType.COULD_NOT_VERIFY_VATID) await Dialog.message(lang.makeTranslation("invalidVatIdValidationFailed_msg", lang.get("invalidVatIdValidationFailed_msg") + (isSignup ? " " + lang.get("accountWasStillCreated_msg") : "")));
else if (statusCode === PaymentDataResultType.CREDIT_CARD_VERIFICATION_LIMIT_REACHED) await Dialog.message(lang.makeTranslation("creditCardVerificationLimitReached_msg", lang.get("creditCardVerificationLimitReached_msg") + (isSignup ? " " + lang.get("accountWasStillCreated_msg") : "")));
else await Dialog.message(lang.makeTranslation("otherPaymentProviderError_msg", lang.get("otherPaymentProviderError_msg") + (isSignup ? " " + lang.get("accountWasStillCreated_msg") : "")));
	return false;
}
/**
* Displays a progress dialog that allows to cancel the verification and opens a new window to do the actual verification with the bank.
*/
function verifyCreditCard(accountingInfo, braintree3ds, price) {
	return locator.entityClient.load(InvoiceInfoTypeRef, neverNull(accountingInfo.invoiceInfo)).then((invoiceInfo) => {
		let invoiceInfoWrapper = { invoiceInfo };
		let resolve;
		let progressDialogPromise = new Promise((res) => resolve = res);
		let progressDialog;
		const closeAction = () => {
			progressDialog.close();
			setTimeout(() => resolve(false), DefaultAnimationTime);
		};
		progressDialog = new Dialog(DialogType.Alert, { view: () => [mithril_default(".dialog-contentButtonsBottom.text-break.selectable", lang.get("creditCardPendingVerification_msg")), mithril_default(".flex-center.dialog-buttons", mithril_default(Button, {
			label: "cancel_action",
			click: closeAction,
			type: ButtonType.Primary
		}))] }).setCloseHandler(closeAction).addShortcut({
			key: Keys.RETURN,
			shift: false,
			exec: closeAction,
			help: "close_alt"
		}).addShortcut({
			key: Keys.ESC,
			shift: false,
			exec: closeAction,
			help: "close_alt"
		});
		let entityEventListener = (updates, eventOwnerGroupId) => {
			return pMap(updates, (update) => {
				if (isUpdateForTypeRef(InvoiceInfoTypeRef, update)) return locator.entityClient.load(InvoiceInfoTypeRef, update.instanceId).then((invoiceInfo$1) => {
					invoiceInfoWrapper.invoiceInfo = invoiceInfo$1;
					if (!invoiceInfo$1.paymentErrorInfo) {
						progressDialog.close();
						resolve(true);
					} else if (invoiceInfo$1.paymentErrorInfo && invoiceInfo$1.paymentErrorInfo.errorCode === "card.3ds2_pending") {} else if (invoiceInfo$1.paymentErrorInfo && invoiceInfo$1.paymentErrorInfo.errorCode !== null) {
						let error = "3dsFailedOther";
						switch (invoiceInfo$1.paymentErrorInfo.errorCode) {
							case "card.cvv_invalid":
								error = "cvvInvalid";
								break;
							case "card.number_invalid":
								error = "ccNumberInvalid";
								break;
							case "card.date_invalid":
								error = "expirationDate";
								break;
							case "card.insufficient_funds":
								error = "insufficientFunds";
								break;
							case "card.expired_card":
								error = "cardExpired";
								break;
							case "card.3ds2_failed":
								error = "3dsFailed";
								break;
						}
						Dialog.message(getPreconditionFailedPaymentMsg(invoiceInfo$1.paymentErrorInfo.errorCode));
						resolve(false);
						progressDialog.close();
					}
					mithril_default.redraw();
				});
			}).then(noOp);
		};
		locator.eventController.addEntityListener(entityEventListener);
		const app = client.isCalendarApp() ? "calendar" : "mail";
		let params = `clientToken=${encodeURIComponent(braintree3ds.clientToken)}&nonce=${encodeURIComponent(braintree3ds.nonce)}&bin=${encodeURIComponent(braintree3ds.bin)}&price=${encodeURIComponent(price)}&message=${encodeURIComponent(lang.get("creditCardVerification_msg"))}&clientType=${getClientType()}&app=${app}`;
		Dialog.message("creditCardVerificationNeededPopup_msg").then(() => {
			const paymentUrlString = locator.domainConfigProvider().getCurrentDomainConfig().paymentUrl;
			const paymentUrl = new URL(paymentUrlString);
			paymentUrl.hash += params;
			window.open(paymentUrl);
			progressDialog.show();
		});
		return progressDialogPromise.finally(() => locator.eventController.removeEntityListener(entityEventListener));
	});
}

//#endregion
//#region src/common/subscription/SwitchToBusinessInvoiceDataDialog.ts
function showSwitchToBusinessInvoiceDataDialog(customer, invoiceData, accountingInfo) {
	if (customer.businessUse) throw new ProgrammingError("cannot show invoice data dialog if the customer is already a business customer");
	const invoiceDataInput = new InvoiceDataInput(true, invoiceData, InvoiceDataInputLocation.InWizard);
	const result = defer();
	const confirmAction = async () => {
		let error = invoiceDataInput.validateInvoiceData();
		if (error) Dialog.message(error);
else {
			showProgressDialog("pleaseWait_msg", result.promise);
			const success = await updatePaymentData(asPaymentInterval(accountingInfo.paymentInterval), invoiceDataInput.getInvoiceData(), null, null, false, "0", accountingInfo).catch(ofClass(BadRequestError, () => {
				Dialog.message("paymentMethodNotAvailable_msg");
				return false;
			})).catch((e) => {
				result.reject(e);
			});
			if (success) {
				dialog.close();
				result.resolve(true);
			} else result.resolve(false);
		}
	};
	const cancelAction = () => result.resolve(false);
	const dialog = Dialog.showActionDialog({
		title: "invoiceData_msg",
		child: { view: () => mithril_default("#changeInvoiceDataDialog", [mithril_default(invoiceDataInput)]) },
		okAction: confirmAction,
		cancelAction,
		allowCancel: true,
		okActionTextId: "save_action"
	});
	return result.promise;
}

//#endregion
//#region src/common/native/common/generatedipc/MobilePaymentSubscriptionOwnership.ts
let MobilePaymentSubscriptionOwnership = function(MobilePaymentSubscriptionOwnership$1) {
	MobilePaymentSubscriptionOwnership$1["Owner"] = "0";
	MobilePaymentSubscriptionOwnership$1["NotOwner"] = "1";
	MobilePaymentSubscriptionOwnership$1["NoSubscription"] = "2";
	return MobilePaymentSubscriptionOwnership$1;
}({});

//#endregion
//#region src/common/subscription/InvoiceDataDialog.ts
function show$1(businessUse, invoiceData, accountingInfo, headingId, infoMessageId) {
	const invoiceDataInput = new InvoiceDataInput(businessUse, invoiceData);
	const confirmAction = () => {
		let error = invoiceDataInput.validateInvoiceData();
		if (error) Dialog.message(error);
else updatePaymentData(asPaymentInterval(accountingInfo.paymentInterval), invoiceDataInput.getInvoiceData(), null, null, false, "0", accountingInfo).then((success) => {
			if (success) dialog.close();
		}).catch(ofClass(BadRequestError, (e) => {
			Dialog.message("paymentMethodNotAvailable_msg");
		}));
	};
	const dialog = Dialog.showActionDialog({
		title: headingId ? headingId : "invoiceData_msg",
		child: { view: () => mithril_default("#changeInvoiceDataDialog", [infoMessageId ? mithril_default(".pt", lang.get(infoMessageId)) : null, mithril_default(invoiceDataInput)]) },
		okAction: confirmAction,
		allowCancel: true,
		okActionTextId: "save_action"
	});
	return dialog;
}

//#endregion
//#region src/common/subscription/PaymentDataDialog.ts
var import_stream$5 = __toESM(require_stream(), 1);
async function show(customer, accountingInfo, price, defaultPaymentMethod) {
	const payPalRequestUrl = getLazyLoadedPayPalUrl();
	const invoiceData = {
		invoiceAddress: formatNameAndAddress(accountingInfo.invoiceName, accountingInfo.invoiceAddress),
		country: accountingInfo.invoiceCountry ? getByAbbreviation(accountingInfo.invoiceCountry) : null,
		vatNumber: accountingInfo.invoiceVatIdNo
	};
	const subscriptionOptions = {
		businessUse: (0, import_stream$5.default)(assertNotNull(customer.businessUse)),
		paymentInterval: (0, import_stream$5.default)(asPaymentInterval(accountingInfo.paymentInterval))
	};
	const paymentMethodInput = new PaymentMethodInput(subscriptionOptions, (0, import_stream$5.default)(invoiceData.country), neverNull(accountingInfo), payPalRequestUrl, defaultPaymentMethod);
	const availablePaymentMethods = paymentMethodInput.getVisiblePaymentMethods();
	let selectedPaymentMethod = accountingInfo.paymentMethod;
	paymentMethodInput.updatePaymentMethod(selectedPaymentMethod);
	const selectedPaymentMethodChangedHandler = async (value) => {
		if (value === PaymentMethodType.Paypal && !payPalRequestUrl.isLoaded()) await showProgressDialog("pleaseWait_msg", payPalRequestUrl.getAsync());
		selectedPaymentMethod = value;
		paymentMethodInput.updatePaymentMethod(value);
	};
	const didLinkPaypal = () => selectedPaymentMethod === PaymentMethodType.Paypal && paymentMethodInput.isPaypalAssigned();
	return new Promise((resolve) => {
		const confirmAction = () => {
			let error = paymentMethodInput.validatePaymentData();
			if (error) Dialog.message(error);
else {
				const finish = (success) => {
					if (success) {
						dialog.close();
						resolve(true);
					}
				};
				if (didLinkPaypal()) finish(true);
else showProgressDialog("updatePaymentDataBusy_msg", updatePaymentData(subscriptionOptions.paymentInterval(), invoiceData, paymentMethodInput.getPaymentData(), invoiceData.country, false, price + "", accountingInfo)).then(finish);
			}
		};
		const dialog = Dialog.showActionDialog({
			title: "adminPayment_action",
			child: { view: () => mithril_default("#changePaymentDataDialog", { style: { minHeight: px(310) } }, [mithril_default(DropDownSelector, {
				label: "paymentMethod_label",
				items: availablePaymentMethods,
				selectedValue: selectedPaymentMethod,
				selectionChangedHandler: selectedPaymentMethodChangedHandler,
				dropdownWidth: 250
			}), mithril_default(paymentMethodInput)]) },
			okAction: confirmAction,
			allowCancel: () => !didLinkPaypal(),
			okActionTextId: didLinkPaypal() ? "close_alt" : "save_action",
			cancelAction: () => resolve(false)
		});
	});
}

//#endregion
//#region src/common/api/entities/accounting/TypeRefs.ts
const CustomerAccountPostingTypeRef = new TypeRef("accounting", "CustomerAccountPosting");
const CustomerAccountReturnTypeRef = new TypeRef("accounting", "CustomerAccountReturn");

//#endregion
//#region src/common/api/entities/accounting/Services.ts
const CustomerAccountService = Object.freeze({
	app: "accounting",
	name: "CustomerAccountService",
	get: {
		data: null,
		return: CustomerAccountReturnTypeRef
	},
	post: null,
	put: null,
	delete: null
});

//#endregion
//#region src/common/subscription/PaymentViewer.ts
assertMainOrNode();
var PaymentViewer = class {
	invoiceAddressField;
	customer = null;
	accountingInfo = null;
	postings = [];
	outstandingBookingsPrice = null;
	balance = 0;
	invoiceInfo = null;
	postingsExpanded = false;
	constructor() {
		this.invoiceAddressField = new HtmlEditor().setMinHeight(140).showBorders().setMode(HtmlEditorMode.HTML).setHtmlMonospace(false).setReadOnly(true).setPlaceholderId("invoiceAddress_label");
		this.loadData();
		this.view = this.view.bind(this);
	}
	view() {
		return mithril_default("#invoicing-settings.fill-absolute.scroll.plr-l", { role: "group" }, [
			this.renderInvoiceData(),
			this.renderPaymentMethod(),
			this.renderPostings()
		]);
	}
	async loadData() {
		this.customer = await locator.logins.getUserController().loadCustomer();
		const customerInfo = await locator.logins.getUserController().loadCustomerInfo();
		const accountingInfo = await locator.entityClient.load(AccountingInfoTypeRef, customerInfo.accountingInfo);
		this.updateAccountingInfoData(accountingInfo);
		this.invoiceInfo = await locator.entityClient.load(InvoiceInfoTypeRef, neverNull(accountingInfo.invoiceInfo));
		mithril_default.redraw();
		await this.loadPostings();
	}
	renderPaymentMethod() {
		const paymentMethodHelpLabel = () => {
			if (this.accountingInfo && getPaymentMethodType(this.accountingInfo) === PaymentMethodType.Invoice) return lang.get("paymentProcessingTime_msg");
			return "";
		};
		const paymentMethod = this.accountingInfo ? getPaymentMethodName(getPaymentMethodType(neverNull(this.accountingInfo))) + " " + getPaymentMethodInfoText(neverNull(this.accountingInfo)) : lang.get("loading_msg");
		return mithril_default(TextField, {
			label: "paymentMethod_label",
			value: paymentMethod,
			helpLabel: paymentMethodHelpLabel,
			isReadOnly: true,
			injectionsRight: () => mithril_default(IconButton, {
				title: "paymentMethod_label",
				click: (e, dom) => this.handlePaymentMethodClick(e, dom),
				icon: Icons.Edit,
				size: ButtonSize.Compact
			})
		});
	}
	async handlePaymentMethodClick(e, dom) {
		if (this.accountingInfo == null) return;
		const currentPaymentMethod = getPaymentMethodType(this.accountingInfo);
		if (isIOSApp()) {
			if (currentPaymentMethod !== PaymentMethodType.AppStore && this.customer?.type === AccountType.PAID) return Dialog.message(lang.getTranslation("storePaymentMethodChange_msg", { "{AppStorePaymentChange}": InfoLink.AppStorePaymentChange }));
			return locator.mobilePaymentsFacade.showSubscriptionConfigView();
		} else if (hasRunningAppStoreSubscription(this.accountingInfo)) return showManageThroughAppStoreDialog();
else if (currentPaymentMethod == PaymentMethodType.AppStore && this.customer?.type === AccountType.PAID) {
			const isResubscribe = await Dialog.choice(lang.getTranslation("storeDowngradeOrResubscribe_msg", { "{AppStoreDowngrade}": InfoLink.AppStoreDowngrade }), [{
				text: "changePlan_action",
				value: false
			}, {
				text: "resubscribe_action",
				value: true
			}]);
			if (isResubscribe) return showManageThroughAppStoreDialog();
else {
				const customerInfo = await locator.logins.getUserController().loadCustomerInfo();
				const bookings = await locator.entityClient.loadRange(BookingTypeRef, assertNotNull(customerInfo.bookings).items, GENERATED_MAX_ID, 1, true);
				const lastBooking = last(bookings);
				if (lastBooking == null) {
					console.warn("No booking but payment method is AppStore?");
					return;
				}
				return showSwitchDialog(this.customer, customerInfo, this.accountingInfo, lastBooking, AvailablePlans, null);
			}
		} else {
			const showPaymentMethodDialog = createNotAvailableForFreeClickHandler(
				NewPaidPlans,
				() => this.accountingInfo && this.changePaymentMethod(),
				// iOS app is checked above
				() => locator.logins.getUserController().isPaidAccount()
);
			showPaymentMethodDialog(e, dom);
		}
	}
	changeInvoiceData() {
		if (this.accountingInfo) {
			const accountingInfo = neverNull(this.accountingInfo);
			const invoiceCountry = accountingInfo.invoiceCountry ? getByAbbreviation(accountingInfo.invoiceCountry) : null;
			show$1(neverNull(neverNull(this.customer).businessUse), {
				invoiceAddress: formatNameAndAddress(accountingInfo.invoiceName, accountingInfo.invoiceAddress),
				country: invoiceCountry,
				vatNumber: accountingInfo.invoiceVatIdNo
			}, accountingInfo);
		}
	}
	changePaymentMethod() {
		if (this.accountingInfo && hasRunningAppStoreSubscription(this.accountingInfo)) throw new ProgrammingError("Active AppStore subscription");
		let nextPayment = this.amountOwed() * -1;
		showProgressDialog("pleaseWait_msg", locator.bookingFacade.getCurrentPrice().then((priceServiceReturn) => {
			return Math.max(nextPayment, Number(neverNull(priceServiceReturn.currentPriceThisPeriod).price), Number(neverNull(priceServiceReturn.currentPriceNextPeriod).price));
		})).then((price) => getDefaultPaymentMethod().then((paymentMethod) => {
			return {
				price,
				paymentMethod
			};
		})).then(({ price, paymentMethod }) => {
			return show(neverNull(this.customer), neverNull(this.accountingInfo), price, paymentMethod).then((success) => {
				if (success) {
					if (this.isPayButtonVisible()) return this.showPayDialog(this.amountOwed());
				}
			});
		});
	}
	renderPostings() {
		if (!this.postings || this.postings.length === 0) return null;
else {
			const balance = this.balance;
			return [
				mithril_default(".h4.mt-l", lang.get("currentBalance_label")),
				mithril_default(".flex.center-horizontally.center-vertically.col", [
					mithril_default("div.h4.pt.pb" + (this.isAmountOwed() ? ".content-accent-fg" : ""), formatPrice(balance, true) + (this.accountBalance() !== balance ? ` (${formatPrice(this.accountBalance(), true)})` : "")),
					this.accountBalance() !== balance ? mithril_default(".small" + (this.accountBalance() < 0 ? ".content-accent-fg" : ""), lang.get("unprocessedBookings_msg", { "{amount}": formatPrice(assertNotNull(this.outstandingBookingsPrice), true) })) : null,
					this.isPayButtonVisible() ? mithril_default(".pb", { style: { width: "200px" } }, mithril_default(LoginButton, {
						label: "invoicePay_action",
						onclick: () => this.showPayDialog(this.amountOwed())
					})) : null
				]),
				this.accountingInfo && this.accountingInfo.paymentMethod !== PaymentMethodType.Invoice && (this.isAmountOwed() || this.invoiceInfo && this.invoiceInfo.paymentErrorInfo) ? this.invoiceInfo && this.invoiceInfo.paymentErrorInfo ? mithril_default(".small.underline.b", lang.get(getPreconditionFailedPaymentMsg(this.invoiceInfo.paymentErrorInfo.errorCode))) : mithril_default(".small.underline.b", lang.get("failedDebitAttempt_msg")) : null,
				mithril_default(".flex-space-between.items-center.mt-l.mb-s", [mithril_default(".h4", lang.get("postings_label")), mithril_default(ExpanderButton, {
					label: "show_action",
					expanded: this.postingsExpanded,
					onExpandedChange: (expanded) => this.postingsExpanded = expanded
				})]),
				mithril_default(ExpanderPanel, { expanded: this.postingsExpanded }, mithril_default(Table, {
					columnHeading: ["type_label", "amount_label"],
					columnWidths: [
						ColumnWidth.Largest,
						ColumnWidth.Small,
						ColumnWidth.Small
					],
					columnAlignments: [
						false,
						true,
						false
					],
					showActionButtonColumn: true,
					lines: this.postings.map((posting) => this.postingLineAttrs(posting))
				})),
				mithril_default(".small", lang.get("invoiceSettingDescription_msg") + " " + lang.get("laterInvoicingInfo_msg"))
			];
		}
	}
	postingLineAttrs(posting) {
		return {
			cells: () => [{
				main: getPostingTypeText(posting),
				info: [formatDate(posting.valueDate)]
			}, { main: formatPrice(Number(posting.amount), true) }],
			actionButtonAttrs: posting.type === PostingType.UsageFee || posting.type === PostingType.Credit || posting.type === PostingType.SalesCommission ? {
				title: "download_action",
				icon: Icons.Download,
				size: ButtonSize.Compact,
				click: (e, dom) => {
					if (this.customer?.businessUse) createDropdown({
						width: 300,
						lazyButtons: () => [{
							label: "downloadInvoicePdf_action",
							click: () => this.doPdfInvoiceDownload(posting)
						}, {
							label: "downloadInvoiceXml_action",
							click: () => this.doXrechnungInvoiceDownload(posting)
						}]
					})(e, dom);
else this.doPdfInvoiceDownload(posting);
				}
			} : null
		};
	}
	async doPdfInvoiceDownload(posting) {
		if (client.compressionStreamSupported()) return showProgressDialog("pleaseWait_msg", locator.customerFacade.generatePdfInvoice(neverNull(posting.invoiceNumber))).then((pdfInvoice) => locator.fileController.saveDataFile(pdfInvoice));
else if (client.device == DeviceType.ANDROID) return Dialog.message("invoiceFailedWebview_msg", () => mithril_default("div", mithril_default("a", {
			href: InfoLink.Webview,
			target: "_blank"
		}, InfoLink.Webview)));
else if (client.isIos()) return Dialog.message("invoiceFailedIOS_msg");
else return Dialog.message("invoiceFailedBrowser_msg");
	}
	async doXrechnungInvoiceDownload(posting) {
		return showProgressDialog("pleaseWait_msg", locator.customerFacade.generateXRechnungInvoice(neverNull(posting.invoiceNumber)).then((xInvoice) => locator.fileController.saveDataFile(xInvoice)));
	}
	updateAccountingInfoData(accountingInfo) {
		this.accountingInfo = accountingInfo;
		this.invoiceAddressField.setValue(formatNameAndAddress(accountingInfo.invoiceName, accountingInfo.invoiceAddress, accountingInfo.invoiceCountry ?? undefined));
		mithril_default.redraw();
	}
	accountBalance() {
		return this.balance - assertNotNull(this.outstandingBookingsPrice);
	}
	amountOwed() {
		if (this.balance != null) {
			let balance = this.balance;
			if (balance < 0) return balance;
		}
		return 0;
	}
	isAmountOwed() {
		return this.amountOwed() < 0;
	}
	loadPostings() {
		return locator.serviceExecutor.get(CustomerAccountService, null).then((result) => {
			this.postings = result.postings;
			this.outstandingBookingsPrice = Number(result.outstandingBookingsPrice);
			this.balance = Number(result.balance);
			mithril_default.redraw();
		});
	}
	async entityEventsReceived(updates) {
		for (const update of updates) await this.processEntityUpdate(update);
	}
	async processEntityUpdate(update) {
		const { instanceId } = update;
		if (isUpdateForTypeRef(AccountingInfoTypeRef, update)) {
			const accountingInfo = await locator.entityClient.load(AccountingInfoTypeRef, instanceId);
			this.updateAccountingInfoData(accountingInfo);
		} else if (isUpdateForTypeRef(CustomerTypeRef, update)) {
			this.customer = await locator.logins.getUserController().loadCustomer();
			mithril_default.redraw();
		} else if (isUpdateForTypeRef(InvoiceInfoTypeRef, update)) {
			this.invoiceInfo = await locator.entityClient.load(InvoiceInfoTypeRef, instanceId);
			mithril_default.redraw();
		}
	}
	isPayButtonVisible() {
		return this.accountingInfo != null && (this.accountingInfo.paymentMethod === PaymentMethodType.CreditCard || this.accountingInfo.paymentMethod === PaymentMethodType.Paypal) && this.isAmountOwed();
	}
	showPayDialog(openBalance) {
		return showPayConfirmDialog(openBalance).then((confirmed) => {
			if (confirmed) return showProgressDialog("pleaseWait_msg", locator.serviceExecutor.put(DebitService, createDebitServicePutData({ invoice: null })).catch(ofClass(LockedError, () => "operationStillActive_msg")).catch(ofClass(PreconditionFailedError, (error) => getPreconditionFailedPaymentMsg(error.data))).catch(ofClass(BadGatewayError, () => "paymentProviderNotAvailableError_msg")).catch(ofClass(TooManyRequestsError, () => "tooManyAttempts_msg")));
		}).then((errorId) => {
			if (errorId) return Dialog.message(errorId);
else return this.loadPostings();
		});
	}
	renderInvoiceData() {
		return [
			mithril_default(".flex-space-between.items-center.mt-l.mb-s", [mithril_default(".h4", lang.get("invoiceData_msg")), mithril_default(IconButton, {
				title: "invoiceData_msg",
				click: createNotAvailableForFreeClickHandler(NewPaidPlans, () => this.changeInvoiceData(), () => locator.logins.getUserController().isPaidAccount()),
				icon: Icons.Edit,
				size: ButtonSize.Compact
			})]),
			mithril_default(this.invoiceAddressField),
			this.accountingInfo && this.accountingInfo.invoiceVatIdNo.trim().length > 0 ? mithril_default(TextField, {
				label: "invoiceVatIdNo_label",
				value: this.accountingInfo ? this.accountingInfo.invoiceVatIdNo : lang.get("loading_msg"),
				isReadOnly: true
			}) : null
		];
	}
};
function showPayConfirmDialog(price) {
	return new Promise((resolve) => {
		let dialog;
		const doAction = (res) => {
			dialog.close();
			resolve(res);
		};
		const actionBarAttrs = {
			left: [{
				label: "cancel_action",
				click: () => doAction(false),
				type: ButtonType.Secondary
			}],
			right: [{
				label: "invoicePay_action",
				click: () => doAction(true),
				type: ButtonType.Primary
			}],
			middle: "adminPayment_action"
		};
		dialog = new Dialog(DialogType.EditSmall, { view: () => [mithril_default(DialogHeaderBar, actionBarAttrs), mithril_default(".plr-l.pb", mithril_default("", [mithril_default(".pt", lang.get("invoicePayConfirm_msg")), mithril_default(TextField, {
			label: "price_label",
			value: formatPrice(-price, true),
			isReadOnly: true
		})]))] }).setCloseHandler(() => doAction(false)).show();
	});
}
function getPostingTypeText(posting) {
	switch (posting.type) {
		case PostingType.UsageFee: return lang.get("invoice_label");
		case PostingType.Credit: return lang.get("credit_label");
		case PostingType.Payment: return lang.get("adminPayment_action");
		case PostingType.Refund: return lang.get("refund_label");
		case PostingType.GiftCard: return Number(posting.amount) < 0 ? lang.get("boughtGiftCardPosting_label") : lang.get("redeemedGiftCardPosting_label");
		case PostingType.SalesCommission: return Number(posting.amount) < 0 ? lang.get("cancelledReferralCreditPosting_label") : lang.get("referralCreditPosting_label");
		default: return "";
	}
}
async function showManageThroughAppStoreDialog() {
	const confirmed = await Dialog.confirm(lang.getTranslation("storeSubscription_msg", { "{AppStorePayment}": InfoLink.AppStorePayment }));
	if (confirmed) window.open("https://apps.apple.com/account/subscriptions", "_blank", "noopener,noreferrer");
}

//#endregion
//#region src/common/subscription/UpgradeSubscriptionPage.ts
var import_stream$4 = __toESM(require_stream(), 1);
const PlanTypeParameter = Object.freeze({
	FREE: "free",
	REVOLUTIONARY: "revolutionary",
	LEGEND: "legend",
	ESSENTIAL: "essential",
	ADVANCED: "advanced",
	UNLIMITED: "unlimited"
});
var UpgradeSubscriptionPage = class {
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
			const paymentInterval = subscriptionParameters.interval ? asPaymentInterval(subscriptionParameters.interval) : PaymentInterval.Yearly;
			vnode.attrs.data.subscriptionParameters = null;
			vnode.attrs.data.options.paymentInterval = (0, import_stream$4.default)(paymentInterval);
			this.goToNextPageWithPreselectedSubscription(subscriptionParameters, vnode.attrs.data);
		}
	}
	view(vnode) {
		const data = vnode.attrs.data;
		let availablePlans = vnode.attrs.data.acceptedPlans;
		if (!!data.newAccountData && data.newAccountData.mailAddress.includes("tuta.com") && availablePlans.includes(PlanType.Free)) availablePlans = availablePlans.filter((plan) => plan != PlanType.Free);
		const isYearly = data.options.paymentInterval() === PaymentInterval.Yearly;
		const isCyberMonday = isReferenceDateWithinCyberMondayCampaign(Const.CURRENT_DATE ?? new Date());
		const shouldApplyCyberMonday = isYearly && isCyberMonday;
		const subscriptionActionButtons = {
			[PlanType.Free]: () => {
				return {
					label: "pricing.select_action",
					onclick: () => this.selectFree(data)
				};
			},
			[PlanType.Revolutionary]: this.createUpgradeButton(data, PlanType.Revolutionary),
			[PlanType.Legend]: () => ({
				label: shouldApplyCyberMonday ? "pricing.cyber_monday_select_action" : "pricing.select_action",
				class: shouldApplyCyberMonday ? "accent-bg-cyber-monday" : undefined,
				onclick: () => this.setNonFreeDataAndGoToNextPage(data, PlanType.Legend)
			}),
			[PlanType.Essential]: this.createUpgradeButton(data, PlanType.Essential),
			[PlanType.Advanced]: this.createUpgradeButton(data, PlanType.Advanced),
			[PlanType.Unlimited]: this.createUpgradeButton(data, PlanType.Unlimited)
		};
		return mithril_default(".pt", [mithril_default(SubscriptionSelector, {
			options: data.options,
			priceInfoTextId: data.priceInfoTextId,
			boxWidth: 230,
			boxHeight: 270,
			acceptedPlans: availablePlans,
			allowSwitchingPaymentInterval: data.upgradeType !== UpgradeType.Switch,
			currentPlanType: data.currentPlan,
			actionButtons: subscriptionActionButtons,
			featureListProvider: vnode.attrs.data.featureListProvider,
			priceAndConfigProvider: vnode.attrs.data.planPrices,
			multipleUsersAllowed: vnode.attrs.data.multipleUsersAllowed,
			msg: data.msg
		})]);
	}
	selectFree(data) {
		if (this.__signupPaidTest) this.__signupPaidTest.active = false;
		if (this.__signupFreeTest && this.upgradeType == UpgradeType.Signup) {
			this.__signupFreeTest.active = true;
			this.__signupFreeTest.getStage(0).complete();
		}
		confirmFreeSubscription().then((confirmed) => {
			if (confirmed) {
				this.__signupFreeTest?.getStage(1).complete();
				data.type = PlanType.Free;
				data.price = null;
				data.nextYearPrice = null;
				this.showNextPage();
			}
		});
	}
	showNextPage() {
		if (this._dom) emitWizardEvent(this._dom, WizardEventType.SHOW_NEXT_PAGE);
	}
	goToNextPageWithPreselectedSubscription(subscriptionParameters, data) {
		let subscriptionType;
		try {
			subscriptionType = subscriptionParameters.type == null ? null : stringToSubscriptionType(subscriptionParameters.type);
		} catch (e) {
			subscriptionType = null;
		}
		if (subscriptionType === SubscriptionType.Personal || subscriptionType === SubscriptionType.PaidPersonal) {
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
		} else if (subscriptionType === SubscriptionType.Business) {
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
		} else console.log("Unknown subscription type passed: ", subscriptionParameters);
	}
	setNonFreeDataAndGoToNextPage(data, planType) {
		if (this.__signupFreeTest) this.__signupFreeTest.active = false;
		if (this.__signupPaidTest && this.upgradeType == UpgradeType.Signup) {
			this.__signupPaidTest.active = true;
			this.__signupPaidTest.getStage(0).complete();
		}
		data.type = planType;
		const { planPrices, options } = data;
		try {
			data.price = planPrices.getSubscriptionPriceWithCurrency(options.paymentInterval(), data.type, UpgradePriceType.PlanActualPrice);
			const nextYear = planPrices.getSubscriptionPriceWithCurrency(options.paymentInterval(), data.type, UpgradePriceType.PlanNextYearsPrice);
			data.nextYearPrice = data.price.rawPrice !== nextYear.rawPrice ? nextYear : null;
		} catch (e) {
			console.error(e);
			Dialog.message("appStoreNotAvailable_msg");
			return;
		}
		this.showNextPage();
	}
	createUpgradeButton(data, planType) {
		return () => ({
			label: "pricing.select_action",
			onclick: () => this.setNonFreeDataAndGoToNextPage(data, planType)
		});
	}
};
function confirmFreeSubscription() {
	return new Promise((resolve) => {
		let oneAccountValue = (0, import_stream$4.default)(false);
		let privateUseValue = (0, import_stream$4.default)(false);
		let dialog;
		const closeAction = (confirmed) => {
			dialog.close();
			setTimeout(() => resolve(confirmed), DefaultAnimationTime);
		};
		const isFormValid = () => oneAccountValue() && privateUseValue();
		dialog = new Dialog(DialogType.Alert, { view: () => [
			mithril_default("#dialog-message.dialog-contentButtonsBottom.text-break.text-prewrap.selectable", lang.getTranslationText("freeAccountInfo_msg")),
			mithril_default(".dialog-contentButtonsBottom", [mithril_default(Checkbox, {
				label: () => lang.get("confirmNoOtherFreeAccount_msg"),
				checked: oneAccountValue(),
				onChecked: oneAccountValue
			}), mithril_default(Checkbox, {
				label: () => lang.get("confirmPrivateUse_msg"),
				checked: privateUseValue(),
				onChecked: privateUseValue
			})]),
			mithril_default(".flex-center.dialog-buttons", [mithril_default(Button, {
				label: "cancel_action",
				click: () => closeAction(false),
				type: ButtonType.Secondary
			}), mithril_default(Button, {
				label: "ok_action",
				click: () => {
					if (isFormValid()) closeAction(true);
				},
				type: ButtonType.Primary
			})])
		] }).setCloseHandler(() => closeAction(false)).addShortcut({
			key: Keys.ESC,
			shift: false,
			exec: () => closeAction(false),
			help: "cancel_action"
		}).addShortcut({
			key: Keys.RETURN,
			shift: false,
			exec: () => {
				if (isFormValid()) closeAction(true);
			},
			help: "ok_action"
		}).show();
	});
}
var UpgradeSubscriptionPageAttrs = class {
	data;
	constructor(upgradeData) {
		this.data = upgradeData;
	}
	headerTitle() {
		return "subscription_label";
	}
	nextAction(showErrorDialog) {
		return Promise.resolve(true);
	}
	isSkipAvailable() {
		return false;
	}
	isEnabled() {
		return true;
	}
};

//#endregion
//#region src/common/subscription/UpgradeCongratulationsPage.ts
var UpgradeCongratulationsPage = class {
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
			mithril_default(".center.h4.pt", lang.get("accountCreationCongratulation_msg")),
			newAccountData ? mithril_default(".plr-l", [mithril_default(RecoverCodeField, {
				showMessage: true,
				recoverCode: newAccountData.recoverCode,
				image: {
					src: VisSignupImage,
					alt: "vitor_alt"
				}
			})]) : null,
			mithril_default(".flex-center.full-width.pt-l", mithril_default(LoginButton, {
				label: "ok_action",
				class: "small-login-button",
				onclick: () => {
					if (attrs.data.type === PlanType.Free) {
						const recoveryConfirmationStageFree = this.__signupFreeTest?.getStage(5);
						recoveryConfirmationStageFree?.setMetric({
							name: "switchedFromPaid",
							value: (this.__signupPaidTest?.isStarted() ?? false).toString()
						});
						recoveryConfirmationStageFree?.complete();
					}
					this.close(attrs.data, this.dom);
				}
			}))
		];
	}
	close(data, dom) {
		let promise = Promise.resolve();
		if (data.newAccountData && locator.logins.isUserLoggedIn()) promise = locator.logins.logout(false);
		promise.then(() => {
			emitWizardEvent(dom, WizardEventType.SHOW_NEXT_PAGE);
		});
	}
};
var UpgradeCongratulationsPageAttrs = class {
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
		return Promise.resolve(true);
	}
	isSkipAvailable() {
		return false;
	}
	isEnabled() {
		return true;
	}
};

//#endregion
//#region src/common/settings/SelectMailAddressForm.ts
assertMainOrNode();
const VALID_MESSAGE_ID = "mailAddressAvailable_msg";
var SelectMailAddressForm = class {
	username;
	messageId;
	checkAddressTimeout;
	isVerificationBusy;
	lastAttrs;
	constructor({ attrs }) {
		this.lastAttrs = attrs;
		this.isVerificationBusy = false;
		this.checkAddressTimeout = null;
		this.username = "";
		this.messageId = "mailAddressNeutral_msg";
	}
	onupdate(vnode) {
		if (this.lastAttrs.selectedDomain.domain !== vnode.attrs.selectedDomain.domain) this.verifyMailAddress(vnode.attrs);
		this.lastAttrs = vnode.attrs;
	}
	view({ attrs }) {
		if (attrs.injectionsRightButtonAttrs?.click) {
			const originalCallback = attrs.injectionsRightButtonAttrs.click;
			attrs.injectionsRightButtonAttrs.click = (event, dom) => {
				originalCallback(event, dom);
				this.username = "";
				this.messageId = "mailAddressNeutral_msg";
			};
		}
		return mithril_default(TextField, {
			label: "mailAddress_label",
			value: this.username,
			alignRight: true,
			autocompleteAs: Autocomplete.newPassword,
			autocapitalize: Autocapitalize.none,
			helpLabel: () => this.addressHelpLabel(),
			fontSize: px(size.font_size_smaller),
			oninput: (value) => {
				this.username = value;
				this.verifyMailAddress(attrs);
			},
			injectionsRight: () => [mithril_default(".flex.items-end.align-self-end", { style: {
				"padding-bottom": "1px",
				flex: "1 1 auto",
				fontSize: px(size.font_size_smaller),
				lineHeight: px(inputLineHeight)
			} }, `@${attrs.selectedDomain.domain}`), attrs.availableDomains.length > 1 ? mithril_default(IconButton, attachDropdown({
				mainButtonAttrs: {
					title: "domain_label",
					icon: BootIcons.Expand,
					size: ButtonSize.Compact
				},
				childAttrs: () => attrs.availableDomains.map((domain) => this.createDropdownItemAttrs(domain, attrs)),
				showDropdown: () => true,
				width: 250
			})) : attrs.injectionsRightButtonAttrs ? mithril_default(IconButton, attrs.injectionsRightButtonAttrs) : null]
		});
	}
	getCleanMailAddress(attrs) {
		return formatMailAddressFromParts(this.username, attrs.selectedDomain.domain);
	}
	addressHelpLabel() {
		return this.isVerificationBusy ? mithril_default(".flex.items-center.mt-s", [this.progressIcon(), lang.get("mailAddressBusy_msg")]) : mithril_default(".mt-s", lang.get(this.messageId ?? VALID_MESSAGE_ID));
	}
	progressIcon() {
		return mithril_default(Icon, {
			icon: BootIcons.Progress,
			class: "icon-progress mr-s"
		});
	}
	createDropdownItemAttrs(domainData, attrs) {
		return {
			label: lang.makeTranslation("domain", domainData.domain),
			click: () => {
				attrs.onDomainChanged(domainData);
			},
			icon: domainData.isPaid ? BootIcons.Premium : undefined
		};
	}
	onBusyStateChanged(isBusy, onBusyStateChanged) {
		this.isVerificationBusy = isBusy;
		onBusyStateChanged(isBusy);
		mithril_default.redraw();
	}
	onValidationFinished(email, validationResult, onValidationResult) {
		this.messageId = validationResult.errorId;
		onValidationResult(email, validationResult);
	}
	verifyMailAddress(attrs) {
		const { onValidationResult, onBusyStateChanged } = attrs;
		if (this.checkAddressTimeout) clearTimeout(this.checkAddressTimeout);
		const cleanMailAddress = this.getCleanMailAddress(attrs);
		const cleanUsername = this.username.trim().toLowerCase();
		if (cleanUsername === "") {
			this.onValidationFinished(cleanMailAddress, {
				isValid: false,
				errorId: "mailAddressNeutral_msg"
			}, onValidationResult);
			this.onBusyStateChanged(false, onBusyStateChanged);
			return;
		} else if (!isMailAddress(cleanMailAddress, true) || isTutaMailAddress(cleanMailAddress) && cleanUsername.length < 3) {
			this.onValidationFinished(cleanMailAddress, {
				isValid: false,
				errorId: "mailAddressInvalid_msg"
			}, onValidationResult);
			this.onBusyStateChanged(false, onBusyStateChanged);
			return;
		}
		this.onBusyStateChanged(true, onBusyStateChanged);
		this.checkAddressTimeout = setTimeout(async () => {
			if (this.getCleanMailAddress(attrs) !== cleanMailAddress) return;
			let result;
			try {
				const available = await locator.mailAddressFacade.isMailAddressAvailable(cleanMailAddress);
				result = available ? {
					isValid: true,
					errorId: null
				} : {
					isValid: false,
					errorId: attrs.mailAddressNAError ?? "mailAddressNA_msg"
				};
			} catch (e) {
				if (e instanceof AccessDeactivatedError) result = {
					isValid: false,
					errorId: "mailAddressDelay_msg"
				};
else throw e;
			} finally {
				if (this.getCleanMailAddress(attrs) === cleanMailAddress) this.onBusyStateChanged(false, onBusyStateChanged);
			}
			if (this.getCleanMailAddress(attrs) === cleanMailAddress) this.onValidationFinished(cleanMailAddress, result, onValidationResult);
		}, 500);
	}
};

//#endregion
//#region src/common/subscription/Captcha.ts
function parseCaptchaInput(captchaInput) {
	if (captchaInput.match(/^[0-2]?[0-9]:[0-5]?[0-9]$/)) {
		let [h, m] = captchaInput.trim().split(":").map((t) => Number(t));
		if (h > 24) return null;
		return [h % 12, m].map((a) => String(a).padStart(2, "0")).join(":");
	} else return null;
}
async function runCaptchaFlow(mailAddress, isBusinessUse, isPaidSubscription, campaignToken) {
	try {
		const captchaReturn = await locator.serviceExecutor.get(RegistrationCaptchaService, createRegistrationCaptchaServiceGetData({
			token: campaignToken,
			mailAddress,
			signupToken: deviceConfig.getSignupToken(),
			businessUseSelected: isBusinessUse,
			paidSubscriptionSelected: isPaidSubscription
		}));
		if (captchaReturn.challenge) try {
			return await showCaptchaDialog(captchaReturn.challenge, captchaReturn.token);
		} catch (e) {
			if (e instanceof InvalidDataError) {
				await Dialog.message("createAccountInvalidCaptcha_msg");
				return runCaptchaFlow(mailAddress, isBusinessUse, isPaidSubscription, campaignToken);
			} else if (e instanceof AccessExpiredError) {
				await Dialog.message("createAccountAccessDeactivated_msg");
				return null;
			} else throw e;
		}
else return captchaReturn.token;
	} catch (e) {
		if (e instanceof AccessDeactivatedError) {
			await Dialog.message("createAccountAccessDeactivated_msg");
			return null;
		} else throw e;
	}
}
function showCaptchaDialog(challenge, token) {
	return new Promise((resolve, reject) => {
		let dialog;
		let captchaInput = "";
		const cancelAction = () => {
			dialog.close();
			resolve(null);
		};
		const okAction = () => {
			let parsedInput = parseCaptchaInput(captchaInput);
			if (parsedInput == null) {
				Dialog.message("captchaEnter_msg");
				return;
			}
			const minuteOnesPlace = parsedInput[parsedInput.length - 1];
			if (minuteOnesPlace !== "0" && minuteOnesPlace !== "5") {
				Dialog.message("createAccountInvalidCaptcha_msg");
				return;
			}
			dialog.close();
			locator.serviceExecutor.post(RegistrationCaptchaService, createRegistrationCaptchaServiceData({
				token,
				response: parsedInput
			})).then(() => {
				resolve(token);
			}).catch((e) => {
				reject(e);
			});
		};
		let actionBarAttrs = {
			left: [{
				label: "cancel_action",
				click: cancelAction,
				type: ButtonType.Secondary
			}],
			right: [{
				label: "ok_action",
				click: okAction,
				type: ButtonType.Primary
			}],
			middle: "captchaDisplay_label"
		};
		const imageData = `data:image/png;base64,${uint8ArrayToBase64(challenge)}`;
		dialog = new Dialog(DialogType.EditSmall, { view: () => {
			let captchaFilter = {};
			if (theme.elevated_bg != null && isMonochrome(theme.elevated_bg)) captchaFilter = { filter: `invert(${1 - getColorLuminance(theme.elevated_bg)}` };
			return [mithril_default(DialogHeaderBar, actionBarAttrs), mithril_default(".plr-l.pb", [mithril_default("img.pt-ml.center-h.block", {
				src: imageData,
				alt: lang.get("captchaDisplay_label"),
				style: captchaFilter
			}), mithril_default(TextField, {
				label: lang.makeTranslation("captcha_input", lang.get("captchaInput_label") + " (hh:mm)"),
				helpLabel: () => lang.get("captchaInfo_msg"),
				value: captchaInput,
				oninput: (value) => captchaInput = value
			})])];
		} }).setCloseHandler(cancelAction).show();
	});
}

//#endregion
//#region src/common/subscription/SignupForm.ts
var import_stream$3 = __toESM(require_stream(), 1);
var SignupForm = class {
	passwordModel;
	_confirmTerms;
	_confirmAge;
	_code;
	selectedDomain;
	_mailAddressFormErrorId = null;
	_mailAddress;
	_isMailVerificationBusy;
	__mailValid;
	__lastMailValidationError;
	__signupFreeTest;
	__signupPaidTest;
	availableDomains = (locator.domainConfigProvider().getCurrentDomainConfig().firstPartyDomain ? TUTA_MAIL_ADDRESS_SIGNUP_DOMAINS : getWhitelabelRegistrationDomains()).map((domain) => ({
		domain,
		isPaid: isPaidPlanDomain(domain)
	}));
	constructor(vnode) {
		this.selectedDomain = getFirstOrThrow(this.availableDomains);
		if (vnode.attrs.isPaidSubscription()) this.selectedDomain = this.availableDomains.find((domain) => domain.domain === DEFAULT_PAID_MAIL_ADDRESS_SIGNUP_DOMAIN) ?? this.selectedDomain;
else this.selectedDomain = this.availableDomains.find((domain) => domain.domain === DEFAULT_FREE_MAIL_ADDRESS_SIGNUP_DOMAIN) ?? this.selectedDomain;
		this.__mailValid = (0, import_stream$3.default)(false);
		this.__lastMailValidationError = (0, import_stream$3.default)(null);
		this.passwordModel = new PasswordModel(locator.usageTestController, locator.logins, {
			checkOldPassword: false,
			enforceStrength: true,
			reservedStrings: () => this._mailAddress ? [this._mailAddress.split("@")[0]] : []
		}, this.__mailValid);
		this.__signupFreeTest = locator.usageTestController.getTest("signup.free");
		this.__signupPaidTest = locator.usageTestController.getTest("signup.paid");
		this._confirmTerms = (0, import_stream$3.default)(false);
		this._confirmAge = (0, import_stream$3.default)(false);
		this._code = (0, import_stream$3.default)("");
		this._isMailVerificationBusy = false;
		this._mailAddressFormErrorId = "mailAddressNeutral_msg";
	}
	view(vnode) {
		const a = vnode.attrs;
		const mailAddressFormAttrs = {
			selectedDomain: this.selectedDomain,
			onDomainChanged: (domain) => {
				if (!domain.isPaid || a.isPaidSubscription()) this.selectedDomain = domain;
else Dialog.confirm(lang.makeTranslation("confirm_msg", `${lang.get("paidEmailDomainSignup_msg")}\n${lang.get("changePaidPlan_msg")}`)).then((confirmed) => {
					if (confirmed) vnode.attrs.onChangePlan();
				});
			},
			availableDomains: this.availableDomains,
			onValidationResult: (email, validationResult) => {
				this.__mailValid(validationResult.isValid);
				if (validationResult.isValid) {
					this._mailAddress = email;
					this.passwordModel.recalculatePasswordStrength();
					this._mailAddressFormErrorId = null;
				} else this._mailAddressFormErrorId = validationResult.errorId;
			},
			onBusyStateChanged: (isBusy) => {
				this._isMailVerificationBusy = isBusy;
			}
		};
		const confirmTermsCheckBoxAttrs = {
			label: renderTermsLabel,
			checked: this._confirmTerms(),
			onChecked: this._confirmTerms
		};
		const confirmAgeCheckBoxAttrs = {
			label: () => lang.get("ageConfirmation_msg"),
			checked: this._confirmAge(),
			onChecked: this._confirmAge
		};
		const submit = () => {
			if (this._isMailVerificationBusy) return;
			if (a.readonly) {
				this.__completePreviousStages();
				return a.onComplete(null);
			}
			const errorMessage = this._mailAddressFormErrorId || this.passwordModel.getErrorMessageId() || (!this._confirmTerms() ? "termsAcceptedNeutral_msg" : null);
			if (errorMessage) {
				Dialog.message(errorMessage);
				return;
			}
			const ageConfirmPromise = this._confirmAge() ? Promise.resolve(true) : Dialog.confirm("parentConfirmation_msg", "paymentDataValidation_action");
			ageConfirmPromise.then((confirmed) => {
				if (confirmed) {
					this.__completePreviousStages();
					return signup(this._mailAddress, this.passwordModel.getNewPassword(), this._code(), a.isBusinessUse(), a.isPaidSubscription(), a.campaign()).then((newAccountData) => {
						a.onComplete(newAccountData ? newAccountData : null);
					});
				}
			});
		};
		return mithril_default("#signup-account-dialog.flex-center", mithril_default(".flex-grow-shrink-auto.max-width-m.pt.pb.plr-l", [a.readonly ? mithril_default(TextField, {
			label: "mailAddress_label",
			value: a.prefilledMailAddress ?? "",
			autocompleteAs: Autocomplete.newPassword,
			isReadOnly: true
		}) : [
			mithril_default(SelectMailAddressForm, mailAddressFormAttrs),
			a.isPaidSubscription() ? mithril_default(".small.mt-s", lang.get("configureCustomDomainAfterSignup_msg"), [mithril_default(ExternalLink, {
				href: InfoLink.DomainInfo,
				isCompanySite: true
			})]) : null,
			mithril_default(PasswordForm, {
				model: this.passwordModel,
				passwordInfoKey: "passwordImportance_msg"
			}),
			getWhitelabelRegistrationDomains().length > 0 ? mithril_default(TextField, {
				value: this._code(),
				oninput: this._code,
				label: "whitelabelRegistrationCode_label"
			}) : null,
			mithril_default(Checkbox, confirmTermsCheckBoxAttrs),
			mithril_default("div", renderTermsAndConditionsButton(TermsSection.Terms, CURRENT_TERMS_VERSION)),
			mithril_default("div", renderTermsAndConditionsButton(TermsSection.Privacy, CURRENT_PRIVACY_VERSION)),
			mithril_default(Checkbox, confirmAgeCheckBoxAttrs)
		], mithril_default(".mt-l.mb-l", mithril_default(LoginButton, {
			label: "next_action",
			onclick: submit
		}))]));
	}
	async __completePreviousStages() {
		if (this.__signupFreeTest) {
			await this.__signupFreeTest.getStage(2).complete();
			await this.__signupFreeTest.getStage(3).complete();
			await this.__signupFreeTest.getStage(4).complete();
		}
		if (this.__signupPaidTest) {
			await this.__signupPaidTest.getStage(1).complete();
			await this.__signupPaidTest.getStage(2).complete();
			await this.__signupPaidTest.getStage(3).complete();
		}
	}
};
function renderTermsLabel() {
	return lang.get("termsAndConditions_label");
}
/**
* @return Signs the user up, if no captcha is needed or it has been solved correctly
*/
function signup(mailAddress, pw, registrationCode, isBusinessUse, isPaidSubscription, campaign) {
	const { customerFacade } = locator;
	const operation = locator.operationProgressTracker.startNewOperation();
	return showProgressDialog("createAccountRunning_msg", customerFacade.generateSignupKeys(operation.id).then((keyPairs) => {
		return runCaptchaFlow(mailAddress, isBusinessUse, isPaidSubscription, campaign).then(async (regDataId) => {
			if (regDataId) {
				const app = client.isCalendarApp() ? SubscriptionApp.Calendar : SubscriptionApp.Mail;
				return customerFacade.signup(keyPairs, AccountType.FREE, regDataId, mailAddress, pw, registrationCode, lang.code, app).then((recoverCode) => {
					return {
						mailAddress,
						password: pw,
						recoverCode
					};
				});
			}
		});
	}), operation.progress).catch(ofClass(InvalidDataError, () => {
		Dialog.message("invalidRegistrationCode_msg");
	})).finally(() => operation.done());
}

//#endregion
//#region src/common/subscription/SignupPage.ts
var SignupPage = class {
	dom;
	oncreate(vnode) {
		this.dom = vnode.dom;
	}
	view(vnode) {
		const data = vnode.attrs.data;
		const newAccountData = data.newAccountData;
		let mailAddress = undefined;
		if (newAccountData) mailAddress = newAccountData.mailAddress;
		return mithril_default(SignupForm, {
			onComplete: (newAccountData$1) => {
				if (newAccountData$1) data.newAccountData = newAccountData$1;
				emitWizardEvent(this.dom, WizardEventType.SHOW_NEXT_PAGE);
			},
			onChangePlan: () => {
				emitWizardEvent(this.dom, WizardEventType.SHOW_PREVIOUS_PAGE);
			},
			isBusinessUse: data.options.businessUse,
			isPaidSubscription: () => data.type !== PlanType.Free,
			campaign: () => data.registrationDataId,
			prefilledMailAddress: mailAddress,
			readonly: !!newAccountData
		});
	}
};
var SignupPageAttrs = class {
	data;
	constructor(signupData) {
		this.data = signupData;
	}
	headerTitle() {
		const title = getDisplayNameOfPlanType(this.data.type);
		if (this.data.type === PlanType.Essential || this.data.type === PlanType.Advanced) return lang.makeTranslation("signup_business", title + " Business");
else return lang.makeTranslation("signup_title", title);
	}
	nextAction(showErrorDialog) {
		return Promise.resolve(true);
	}
	isSkipAvailable() {
		return false;
	}
	isEnabled() {
		return true;
	}
};

//#endregion
//#region src/common/native/common/generatedipc/MobilePaymentResultType.ts
let MobilePaymentResultType = function(MobilePaymentResultType$1) {
	MobilePaymentResultType$1["Success"] = "0";
	MobilePaymentResultType$1["Cancelled"] = "1";
	MobilePaymentResultType$1["Pending"] = "2";
	return MobilePaymentResultType$1;
}({});

//#endregion
//#region src/common/subscription/UpgradeConfirmSubscriptionPage.ts
var UpgradeConfirmSubscriptionPage = class {
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
		if (data.paymentData.paymentMethod === PaymentMethodType.AppStore) {
			const success = await this.handleAppStorePayment(data);
			if (!success) return;
		}
		const serviceData = createSwitchAccountTypePostIn({
			accountType: AccountType.PAID,
			customer: null,
			plan: data.type,
			date: Const.CURRENT_DATE,
			referralCode: data.referralCode,
			specialPriceUserSingle: null,
			surveyData: null,
			app: client.isCalendarApp() ? SubscriptionApp.Calendar : SubscriptionApp.Mail
		});
		showProgressDialog("pleaseWait_msg", locator.serviceExecutor.post(SwitchAccountTypeService, serviceData).then(() => {
			return locator.customerFacade.switchFreeToPremiumGroup();
		})).then(() => {
			const orderConfirmationStage = this.__signupPaidTest?.getStage(5);
			orderConfirmationStage?.setMetric({
				name: "paymentMethod",
				value: PaymentMethodTypeToName[data.paymentData.paymentMethod]
			});
			orderConfirmationStage?.setMetric({
				name: "switchedFromFree",
				value: (this.__signupFreeTest?.isStarted() ?? false).toString()
			});
			orderConfirmationStage?.complete();
			return this.close(data, this.dom);
		}).then(async () => {
			const ratingCheckResult = await getRatingAllowed(new Date(), deviceConfig, isIOSApp());
			if (ratingCheckResult === RatingCheckResult.RATING_ALLOWED) setTimeout(async () => {
				void showAppRatingDialog();
			}, 2e3);
		}).catch(ofClass(PreconditionFailedError, (e) => {
			Dialog.message(lang.makeTranslation("precondition_failed", lang.get(getPreconditionFailedPaymentMsg(e.data)) + (data.upgradeType === UpgradeType.Signup ? " " + lang.get("accountWasStillCreated_msg") : "")));
		})).catch(ofClass(BadGatewayError, (e) => {
			Dialog.message(lang.makeTranslation("payment_failed", lang.get("paymentProviderNotAvailableError_msg") + (data.upgradeType === UpgradeType.Signup ? " " + lang.get("accountWasStillCreated_msg") : "")));
		}));
	}
	/** @return whether subscribed successfully */
	async handleAppStorePayment(data) {
		if (!locator.logins.isUserLoggedIn()) await locator.logins.createSession(neverNull(data.newAccountData).mailAddress, neverNull(data.newAccountData).password, SessionType.Temporary);
		const customerId = locator.logins.getUserController().user.customer;
		const customerIdBytes = base64ToUint8Array(base64ExtToBase64(customerId));
		try {
			const result = await showProgressDialog("pleaseWait_msg", locator.mobilePaymentsFacade.requestSubscriptionToPlan(appStorePlanName(data.type), data.options.paymentInterval(), customerIdBytes));
			if (result.result !== MobilePaymentResultType.Success) return false;
		} catch (e) {
			if (e instanceof MobilePaymentError) {
				console.error("AppStore subscription failed", e);
				Dialog.message("appStoreSubscriptionError_msg", e.message);
				return false;
			} else throw e;
		}
		return await updatePaymentData(data.options.paymentInterval(), data.invoiceData, data.paymentData, null, data.newAccountData != null, null, data.accountingInfo);
	}
	renderConfirmSubscription(attrs) {
		const isYearly = attrs.data.options.paymentInterval() === PaymentInterval.Yearly;
		const subscription = isYearly ? lang.get("pricing.yearly_label") : lang.get("pricing.monthly_label");
		return [
			mithril_default(".center.h4.pt", lang.get("upgradeConfirm_msg")),
			mithril_default(".pt.pb.plr-l", [
				mithril_default(TextField, {
					label: "subscription_label",
					value: getDisplayNameOfPlanType(attrs.data.type),
					isReadOnly: true
				}),
				mithril_default(TextField, {
					label: "paymentInterval_label",
					value: subscription,
					isReadOnly: true
				}),
				mithril_default(TextField, {
					label: isYearly && attrs.data.nextYearPrice ? "priceFirstYear_label" : "price_label",
					value: buildPriceString(attrs.data.price?.displayPrice ?? "0", attrs.data.options),
					isReadOnly: true
				}),
				this.renderPriceNextYear(attrs),
				mithril_default(TextField, {
					label: "paymentMethod_label",
					value: getPaymentMethodName(attrs.data.paymentData.paymentMethod),
					isReadOnly: true
				})
			]),
			mithril_default(".smaller.center.pt-l", attrs.data.options.businessUse() ? lang.get("pricing.subscriptionPeriodInfoBusiness_msg") : lang.get("pricing.subscriptionPeriodInfoPrivate_msg")),
			mithril_default(".flex-center.full-width.pt-l", mithril_default(LoginButton, {
				label: "buy_action",
				class: "small-login-button",
				onclick: () => this.upgrade(attrs.data)
			}))
		];
	}
	renderPriceNextYear(attrs) {
		return attrs.data.nextYearPrice ? mithril_default(TextField, {
			label: "priceForNextYear_label",
			value: buildPriceString(attrs.data.nextYearPrice.displayPrice, attrs.data.options),
			isReadOnly: true
		}) : null;
	}
	close(data, dom) {
		emitWizardEvent(dom, WizardEventType.SHOW_NEXT_PAGE);
	}
};
function buildPriceString(price, options) {
	return formatPriceWithInfo(price, options.paymentInterval(), !options.businessUse());
}

//#endregion
//#region src/common/subscription/UpgradeSubscriptionWizard.ts
var import_stream$2 = __toESM(require_stream(), 1);
assertMainOrNode();
async function showUpgradeWizard(logins, acceptedPlans = NewPaidPlans, msg) {
	const [customer, accountingInfo] = await Promise.all([logins.getUserController().loadCustomer(), logins.getUserController().loadAccountingInfo()]);
	const priceDataProvider = await PriceAndConfigProvider.getInitializedInstance(null, locator.serviceExecutor, null);
	const prices = priceDataProvider.getRawPricingData();
	const domainConfig = locator.domainConfigProvider().getCurrentDomainConfig();
	const featureListProvider = await FeatureListProvider.getInitializedInstance(domainConfig);
	const upgradeData = {
		options: {
			businessUse: (0, import_stream$2.default)(prices.business),
			paymentInterval: (0, import_stream$2.default)(asPaymentInterval(accountingInfo.paymentInterval))
		},
		invoiceData: {
			invoiceAddress: formatNameAndAddress(accountingInfo.invoiceName, accountingInfo.invoiceAddress),
			country: accountingInfo.invoiceCountry ? getByAbbreviation(accountingInfo.invoiceCountry) : null,
			vatNumber: accountingInfo.invoiceVatIdNo
		},
		paymentData: {
			paymentMethod: getPaymentMethodType(accountingInfo) || await getDefaultPaymentMethod(),
			creditCardData: null
		},
		price: null,
		type: PlanType.Revolutionary,
		nextYearPrice: null,
		accountingInfo,
		customer,
		newAccountData: null,
		registrationDataId: null,
		priceInfoTextId: priceDataProvider.getPriceInfoMessage(),
		upgradeType: UpgradeType.Initial,
		currentPlan: logins.getUserController().isFreeAccount() ? PlanType.Free : null,
		subscriptionParameters: null,
		planPrices: priceDataProvider,
		featureListProvider,
		referralCode: null,
		multipleUsersAllowed: false,
		acceptedPlans,
		msg: msg != null ? msg : null
	};
	const wizardPages = [
		wizardPageWrapper(UpgradeSubscriptionPage, new UpgradeSubscriptionPageAttrs(upgradeData)),
		wizardPageWrapper(InvoiceAndPaymentDataPage, new InvoiceAndPaymentDataPageAttrs(upgradeData)),
		wizardPageWrapper(UpgradeConfirmSubscriptionPage, new InvoiceAndPaymentDataPageAttrs(upgradeData))
	];
	if (isIOSApp()) wizardPages.splice(1, 1);
	const deferred = defer();
	const wizardBuilder = createWizardDialog(upgradeData, wizardPages, async () => {
		deferred.resolve();
	}, DialogType.EditLarge);
	wizardBuilder.dialog.show();
	return deferred.promise;
}
async function loadSignupWizard(subscriptionParameters, registrationDataId, referralCode, acceptedPlans = AvailablePlans) {
	const usageTestModel = locator.usageTestModel;
	usageTestModel.setStorageBehavior(StorageBehavior.Ephemeral);
	locator.usageTestController.setTests(await usageTestModel.loadActiveUsageTests());
	const priceDataProvider = await PriceAndConfigProvider.getInitializedInstance(registrationDataId, locator.serviceExecutor, referralCode);
	const prices = priceDataProvider.getRawPricingData();
	const domainConfig = locator.domainConfigProvider().getCurrentDomainConfig();
	const featureListProvider = await FeatureListProvider.getInitializedInstance(domainConfig);
	let message;
	if (isIOSApp()) {
		const appstoreSubscriptionOwnership = await queryAppStoreSubscriptionOwnership(null);
		if (appstoreSubscriptionOwnership !== MobilePaymentSubscriptionOwnership.NoSubscription) acceptedPlans = acceptedPlans.filter((plan) => plan === PlanType.Free);
		message = appstoreSubscriptionOwnership != MobilePaymentSubscriptionOwnership.NoSubscription ? lang.getTranslation("storeMultiSubscriptionError_msg", { "{AppStorePayment}": InfoLink.AppStorePayment }) : null;
	} else message = null;
	const signupData = {
		options: {
			businessUse: (0, import_stream$2.default)(prices.business),
			paymentInterval: (0, import_stream$2.default)(PaymentInterval.Yearly)
		},
		invoiceData: {
			invoiceAddress: "",
			country: null,
			vatNumber: ""
		},
		paymentData: {
			paymentMethod: await getDefaultPaymentMethod(),
			creditCardData: null
		},
		price: null,
		nextYearPrice: null,
		type: PlanType.Free,
		accountingInfo: null,
		customer: null,
		newAccountData: null,
		registrationDataId,
		priceInfoTextId: priceDataProvider.getPriceInfoMessage(),
		upgradeType: UpgradeType.Signup,
		planPrices: priceDataProvider,
		currentPlan: null,
		subscriptionParameters,
		featureListProvider,
		referralCode,
		multipleUsersAllowed: false,
		acceptedPlans,
		msg: message
	};
	const invoiceAttrs = new InvoiceAndPaymentDataPageAttrs(signupData);
	const wizardPages = [
		wizardPageWrapper(UpgradeSubscriptionPage, new UpgradeSubscriptionPageAttrs(signupData)),
		wizardPageWrapper(SignupPage, new SignupPageAttrs(signupData)),
		wizardPageWrapper(InvoiceAndPaymentDataPage, invoiceAttrs),
		wizardPageWrapper(UpgradeConfirmSubscriptionPage, invoiceAttrs),
		wizardPageWrapper(UpgradeCongratulationsPage, new UpgradeCongratulationsPageAttrs(signupData))
	];
	if (isIOSApp()) wizardPages.splice(2, 1);
	const wizardBuilder = createWizardDialog(signupData, wizardPages, async () => {
		if (locator.logins.isUserLoggedIn()) await locator.logins.logout(false);
		if (signupData.newAccountData) mithril_default.route.set("/login", {
			noAutoLogin: true,
			loginWith: signupData.newAccountData.mailAddress
		});
else mithril_default.route.set("/login", { noAutoLogin: true });
	}, DialogType.EditLarge);
	invoiceAttrs.setEnabledFunction(() => signupData.type !== PlanType.Free && wizardBuilder.attrs.currentPage !== wizardPages[0]);
	wizardBuilder.dialog.show();
}

//#endregion
//#region src/common/subscription/SignOrderProcessingAgreementDialog.ts
assertMainOrNode();
const PRINT_DIV_ID = "print-div";
const agreementTexts = {
	"1_en": {
		heading: "<div class=\"papertext\"><h3 style=\"text-align: center;\" id=\"Orderprocessingagreement-Orderprocessingagreement\">Order processing agreement</h3><p style=\"text-align: center;\">between</p>",
		content: "<p style=\"text-align: center;\">-&nbsp;controller -<br>hereinafter referred to as the Client</p><p style=\"text-align: center;\">and</p><p style=\"text-align: center;\">Tutao GmbH, Deisterstr. 17a, 30449 Hannover, Germany</p><p style=\"text-align: center;\">-&nbsp;processor -<br>hereinafter referred to as the Supplier</p><p style=\"text-align: center;\">&nbsp;</p><h4 id=\"Orderprocessingagreement-1.Subjectmatteranddurationoftheagreement\">1.&nbsp;Subject matter and duration of the agreement</h4><p>The Subject matter of the agreement results from the Terms and Conditions of Tutao GmbH in its current version, see <span class=\"nolink\">https://tuta.com/terms</span>, which is referred to here (hereinafter referred to as Service Agreement). The Supplier processes personal data for the Client according to Art. 4 no. 2 and Art. 28 GDPR based on this agreement.</p><p>The duration of this Agreement corresponds to the selected term of policy in the selected tariff.</p><h4 id=\"Orderprocessingagreement-2.Purpose,TypeofDataandCategoriesofDataSubjects\">2. Purpose, Type of Data and Categories of Data Subjects</h4><p>For the initiation of a contractual relationship and for service provision</p><ul><li>the newly registered email address</li></ul><p>is collected as inventory data.</p><p>For invoicing and determining the VAT</p><ul><li>the domicile of the customer (country)</li><li>the invoicing address</li><li>the VAT identification number (only for business customers of some countries)</li></ul><p>is collected as inventory data.</p><p>For the transaction of payments the following payment data (inventory data) is collected depending on the chosen payment method:</p><ul><li>Banking details (account number and sort code and IBAN/BIC, if necessary bank name, account holder),</li><li>credit card data,</li><li>PayPal user name.</li></ul><p>For the execution of direct debiting, the banking details are shared with the authorized credit institution. For the execution of PayPal payments, the PayPal data is shared with PayPal (Europe). For the execution of credit card payments, the credit card data is shared with the payment service provider&nbsp;Braintree&nbsp;for subprocessing. This includes the transfer of personal data into a third country (USA). An agreement entered into with Braintree defines appropriate safeguards and demands that the data is only processed in compliance with the GDPR and only for the purpose of execution of payments. This agreement can be examined here:&nbsp;<span class=\"nolink\">https://www.braintreepayments.com/assets/Braintree-PSA-Model-Clauses-March2018.pdf</span></p><p>Tutanota provides services for saving, editing, presentation and electronic transmission of data, such as email service, contact management and data storage. Within the context of this content data, personal data of the Client may be processed. All textual content is encrypted for the user and its communication partners in a way that even Tutao GmbH has no access to the data.&nbsp;</p><p>In order to maintain email server operations, for error diagnosis and for prevention of abuse, mail server logs are stored max. 30 days. These logs contain sender and recipient email addresses and time of connection, but no customer IP addresses.&nbsp;</p><p>In order to maintain operations, for prevention of abuse and and for visitors analysis, IP addresses of users are processed. Storage only takes place for IP addresses made anonymous which are therefore not personal data any more.</p><p>With the exception of payment data, the personal data including the email address is not disclosed to third parties. However, Tutao GmbH can be legally bound to provide content data (in case of a valid German court order) and inventory data to prosecution services. There will be no sale of data.</p><p>The undertaking of the contractually agreed Processing of Data shall be carried out exclusively within a Member State of the European Union (EU) or within a Member State of the European Economic Area (EEA). Each and every Transfer of Data to a State which is not a Member State of either the EU or the EEA requires the prior agreement of the Client and shall only occur if the specific Conditions of Article 44 et seq. GDPR have been fulfilled.</p><p>The Categories of Data Subjects comprise the users set up in Tutanota by the Client and these users' communication partners.</p><h4 id=\"Orderprocessingagreement-3.TechnicalandOrganizationalMeasures\">3. Technical and Organizational Measures</h4><p>(1) Before the commencement of processing, the Supplier shall document the execution of the necessary Technical and Organizational Measures, set out in advance of the awarding of the Agreement, specifically with regard to the detailed execution of the Agreement, and shall present these documented measures to the Client for inspection. Upon acceptance by the Client, the documented measures become the foundation of the Agreement. Insofar as the inspection/audit by the Client shows the need for amendments, such amendments shall be implemented by mutual agreement.</p><p>(2) The Supplier shall establish the security in accordance with Article 28 Paragraph 3 Point c, and Article 32 GDPR in particular in conjunction with Article 5 Paragraph 1, and Paragraph 2 GDPR. The measures to be taken are measures of data security and measures that guarantee a protection level appropriate to the risk concerning confidentiality, integrity, availability and resilience of the systems. The state of the art, implementation costs, the nature, scope and purposes of processing as well as the probability of occurrence and the severity of the risk to the rights and freedoms of natural persons within the meaning of Article 32 Paragraph 1 GDPR must be taken into account. [Details in Appendix 1]</p><p>(3) The Technical and Organizational Measures are subject to technical progress and further development. In this respect, it is permissible for the Supplier to implement alternative adequate measures. In so doing, the security level of the defined measures must not be reduced. Substantial changes must be documented.</p><h4 id=\"Orderprocessingagreement-4.Rectification,restrictionanderasureofdata\"><span>4. Rectification, restriction and erasure of data</span></h4><p>(1) The Supplier may not on its own authority rectify, erase or restrict the processing of data that is being processed on behalf of the Client, but only on documented instructions from the Client. <br>Insofar as a Data Subject contacts the Supplier directly concerning a rectification, erasure, or restriction of processing, the Supplier will immediately forward the Data Subject’s request to the Client.</p><p>(2) Insofar as it is included in the scope of services, the erasure policy, ‘right to be forgotten’, rectification, data portability and access shall be ensured by the Supplier in accordance with documented instructions from the Client without undue delay.</p><h4 id=\"Orderprocessingagreement-5.QualityassuranceandotherdutiesoftheSupplier\">5. Quality assurance and other duties of the Supplier&nbsp;</h4><p align=\"justify\">In addition to complying with the rules set out in this Agreement, the Supplier shall comply with the statutory requirements referred to in Articles 28 to 33 GDPR; accordingly, the Supplier ensures, in particular, compliance with the following requirements:</p><ol><li><p align=\"justify\">The Supplier is not obliged to appoint a Data Protection Officer. Mr. Arne Moehle, phone: +49 511 202801-11, arne.moehle@tutao.de, is designated as the Contact Person on behalf of the Supplier.</p></li><li><p align=\"justify\">Confidentiality in accordance with Article 28 Paragraph 3 Sentence 2 Point b, Articles 29 and 32 Paragraph 4 GDPR. The Supplier entrusts only such employees with the data processing outlined in this Agreement who have been bound to confidentiality and have previously been familiarized with the data protection provisions relevant to their work. The Supplier and any person acting under its authority who has access to personal data, shall not process that data unless on instructions from the Client, which includes the powers granted in this Agreement, unless required to do so by law.</p></li><li><p align=\"justify\">Implementation of and compliance with all Technical and Organizational Measures necessary for this Agreement in accordance with Article 28 Paragraph 3 Sentence 2 Point c, Article 32 GDPR [details in Appendix 1].</p></li><li><p align=\"justify\">The Client and the Supplier shall cooperate, on request, with the supervisory authority in performance of its tasks.</p></li><li><p align=\"justify\">The Client shall be informed immediately of any inspections and measures conducted by the supervisory authority, insofar as they relate to this Agreement. This also applies insofar as the Supplier is under investigation or is party to an investigation by a competent authority in connection with infringements to any Civil or Criminal Law, or Administrative Rule or Regulation regarding the processing of personal data in connection with the processing of this Agreement.</p></li><li><p align=\"justify\">Insofar as the Client is subject to an inspection by the supervisory authority, an administrative or summary offense or criminal procedure, a liability claim by a Data Subject or by a third party or any other claim in connection with the Agreement data processing by the Supplier, the Supplier shall make every effort to support the Client.</p></li><li><p align=\"justify\">The Supplier shall periodically monitor the internal processes and the Technical and Organizational Measures to ensure that processing within his area of responsibility is in accordance with the requirements of applicable data protection law and the protection of the rights of the data subject.</p></li><li><p align=\"justify\">Verifiability of the Technical and Organizational Measures conducted by the Client as part of the Client’s supervisory powers referred to in item 7 of this Agreement.</p></li></ol><h4 id=\"Orderprocessingagreement-6.Subcontracting\">6. Subcontracting</h4><p align=\"justify\">(1) Subcontracting for the purpose of this Agreement is to be understood as meaning services which relate directly to the provision of the principal service. This does not include ancillary services, such as telecommunication services, postal / transport services, maintenance and user support services or the disposal of data carriers, as well as other measures to ensure the confidentiality, availability, integrity and resilience of the hardware and software of data processing equipment. The Supplier shall, however, be obliged to make appropriate and legally binding contractual arrangements and take appropriate inspection measures to ensure the data protection and the data security of the Client's data, even in the case of outsourced ancillary services.</p><p align=\"justify\">(2) The Supplier may commission subcontractors (additional contract processors) only after prior explicit written or documented consent from the Client.&nbsp;</p><p align=\"justify\">(3) Outsourcing to subcontractors or changing the existing subcontractor are permissible when:</p><ul><li>The Supplier submits such an outsourcing to a subcontractor to the Client in writing or in text form with appropriate advance notice; and</li><li>The Client has not objected to the planned outsourcing in writing or in text form by the date of handing over the data to the Supplier; and</li><li>The subcontracting is based on a contractual agreement in accordance with Article 28 paragraphs 2-4 GDPR.</li></ul><p align=\"justify\">(4) The transfer of personal data from the Client to the subcontractor and the subcontractors commencement of the data processing shall only be undertaken after compliance with all requirements has been achieved.</p><p align=\"justify\">(5) If the subcontractor provides the agreed service outside the EU/EEA, the Supplier shall ensure compliance with EU Data Protection Regulations by appropriate measures. The same applies if service providers are to be used within the meaning of Paragraph 1 Sentence 2.</p><p align=\"justify\">(6) Further outsourcing by the subcontractor requires the express consent of the main Client (at the minimum in text form);</p><p align=\"justify\">(7) All contractual provisions in the contract chain shall be communicated to and agreed with each and every additional subcontractor.</p><h4 class=\"western\" id=\"Orderprocessingagreement-7.SupervisorypowersoftheClient\">7. Supervisory powers of the Client</h4><p align=\"justify\">(1) The Client has the right, after consultation with the Supplier, to carry out inspections or to have them carried out by an auditor to be designated in each individual case. It has the right to convince itself of the compliance with this agreement by the Supplier in his business operations by means of random checks, which are ordinarily to be announced in good time.</p><p align=\"justify\">(2) The Supplier shall ensure that the Client is able to verify compliance with the obligations of the Supplier in accordance with Article 28 GDPR. The Supplier undertakes to give the Client the necessary information on request and, in particular, to demonstrate the execution of the Technical and Organizational Measures.</p><p align=\"justify\">(3) Evidence of such measures, which concern not only the specific Agreement, may be provided by</p><ul><li>Compliance with approved Codes of Conduct pursuant to Article 40 GDPR;</li><li>Certification according to an approved certification procedure in accordance with Article 42 GDPR;</li><li>Current auditor’s certificates, reports or excerpts from reports provided by independent bodies (e.g. auditor, Data Protection Officer, IT security department, data privacy auditor, quality auditor)</li><li>A suitable certification by IT security or data protection auditing (e.g. according to BSI-Grundschutz (IT Baseline Protection certification developed by the German&nbsp; Federal Office for Security in Information Technology (BSI)) or ISO/IEC 27001).</li></ul><p align=\"justify\">(4) The Supplier may claim remuneration for enabling Client inspections.&nbsp;</p><h4 class=\"western\" id=\"Orderprocessingagreement-8.CommunicationinthecaseofinfringementsbytheSupplier\">8. Communication in the case of infringements by the Supplier</h4><p align=\"justify\">(1) The Supplier shall assist the Client in complying with the obligations concerning the security of personal data, reporting requirements for data breaches, data protection impact assessments and prior consultations, referred to in Articles 32 to 36 of the GDPR. These include:</p><ol><li>Ensuring an appropriate level of protection through Technical and Organizational Measures that take into account the circumstances and purposes of the processing as well as the projected probability and severity of a possible infringement of the law as a result of security vulnerabilities and that enable an immediate detection of relevant infringement events.</li><li>The obligation to report a personal data breach immediately to the Client</li><li>The duty to assist the Client with regard to the Client’s obligation to provide information to the Data Subject concerned and to immediately provide the Client with all relevant information in this regard.</li><li>Supporting the Client with its data protection impact assessment</li><li>Supporting the Client with regard to prior consultation of the supervisory authority</li></ol><p align=\"justify\">(2) The Supplier may claim compensation for support services which are not included in the description of the services and which are not attributable to failures on the part of the Supplier.</p><h4 class=\"western\" id=\"Orderprocessingagreement-9.AuthorityoftheClienttoissueinstructions\">9. Authority of the Client to issue instructions</h4><p>(1) The Client shall immediately confirm oral instructions (at the minimum in text form).</p><p>(2) The Supplier shall inform the Client immediately if he considers that an instruction violates Data Protection Regulations. The Supplier shall then be entitled to suspend the execution of the relevant instructions until the Client confirms or changes them.</p><h4 class=\"western\" id=\"Orderprocessingagreement-10.Deletionandreturnofpersonaldata\">10. Deletion and return of personal data</h4><p>(1) Copies or duplicates of the data shall never be created without the knowledge of the Client, with the exception of back-up copies as far as they are necessary to ensure orderly data processing, as well as data required to meet regulatory requirements to retain data.</p><p>(2) After conclusion of the contracted work, or earlier upon request by the Client, at the latest upon termination of the Service Agreement, the Supplier shall hand over to the Client or – subject to prior consent – destroy all documents, processing and utilization results, and data sets related to the Agreement that have come into its possession, in a data-protection compliant manner. The same applies to any and all connected test, waste, redundant and discarded material. The log of the destruction or deletion shall be provided on request.</p><p>(3) Documentation which is used to demonstrate orderly data processing in accordance with the Agreement shall be stored beyond the contract duration by the Supplier in accordance with the respective retention periods. It may hand such documentation over to the Client at the end of the contract duration to relieve the Supplier of this contractual obligation.</p><h4 id=\"Orderprocessingagreement-11.Finalprovisions\">11. Final provisions</h4><p align=\"justify\">(1) This agreement shall be governed by and construed in accordance with German law. Place of jurisdiction shall be Hanover, Germany.</p><p align=\"justify\">(2) Any changes of or amendments to this Agreement must be in writing to become effective. This includes any alteration of this written form clause.</p><p align=\"justify\" class=\"western\">(3) Should any provision of this Agreement be or become legally invalid or if there is any void that needs to be filled, the validity of the remainder of the agreement shall not be affected thereby. Invalid provisions shall be replaced by common consent with such provisions which come as close as possible to the intended result of the invalid provision. In the event of gaps such provision shall come into force by common consent which comes as close as possible to the intended result of the agreement, should the matter have been considered in advance.</p><p align=\"justify\">&nbsp;</p>",
		appendix: "<div class=\"pagebreak\" style=\"break-before:always;\"><p></p><h4 id=\"Orderprocessingagreement-Appendix1-TechnicalandOrganizationalMeasures\">Appendix 1 - Technical and Organizational Measures&nbsp;</h4><p>System administrators are hereinafter referred to as \"DevOps\". The following Technical and Organizational Measures have been implemented:</p><ol><li>Entrance control: All systems are located in ISO 27001 certified&nbsp;data centers in Germany. Only DevOps are granted access to the physical systems.</li><li>Authentication access control: User access is secured with strong password protection according to the internal Password Policy or public key access control as well as second factor authentication (e.g. YubiKey).&nbsp;User access is managed by DevOps.</li><li>Authorization access control: Data records are secured with role based permissions. Permissions are managed by DevOps.</li><li>Data medium control: All hard discs containing personal data are encrypted. File permissions are allocated to DevOps users/roles as well as application users/roles to make sure no unauthorized access to files is allowed from logged in users and processes.</li><li>Transfer control: Transfer of personal data to other parties is being logged.&nbsp;Logs include the user/process that initiated the input, the type of personal data and the timestamp. The logs are kept for 6 months.</li><li>Input control: Input of new and updated as well as deletion of personal data is logged. Logs include the user/process that initiated the input, the type of personal data and the timestamp. The logs are kept for 6 months.</li><li>Transport control: Transport of personal data from and to the system are secured with strong SSL and/or end-to-end encryption.</li><li>Confidentiality: Personal data is stored end-to-end encrypted wherever possible.</li><li>Restoration control: All systems have a second network interface with access for DevOps only. This interface allows access even if the main interface is blocked. Components of the system can be restarted in case of error conditions. A DDOS mitigation service is automatically activated if a DDOS attack occurs that makes the system inaccessible.</li><li>Reliability:&nbsp;&nbsp;DevOps monitor all systems and are notified if any component of the system fails to be able to bring it up again immediately.</li><li>Data integrity: Automatic error correction on data mediums and also on database level make sure that data integrity is guaranteed. Additionally the integrity of end-to-end encrypted personal data is guaranteed through MACs during encryption and decryption.</li><li>Instruction control: All employees are aware of the purposes of processing and regularly complete&nbsp;an internal security awareness program. (Sub)processors are instructed by written contracts.</li><li>Availability control: All systems are located in ISO 27001 certified&nbsp;data centers in Germany which guarantee the physical availability and connection of the systems. All long-term data is stored as three replicas on different servers or in a RAID system. Backups are created prior to updating critical parts of the system.</li><li>Separability: Separate processing for personal data is set up as required.</li><li>Resilience: All systems use highly scalable components that are designed for much higher load than actually needed. All systems are expandable very quickly to continuously allow processing higher loads.</li></ol></div>\n</div>"
	},
	"1_de": {
		heading: "<div class=\"papertext\"><h2 style=\"text-align: center;\" id=\"VertragzurAuftragsverarbeitung-VertragzurAuftragsverarbeitung\">Vertrag zur Auftragsverarbeitung</h2><p style=\"text-align: center;\">zwischen</p>",
		content: "<p style=\"text-align: center;\">-&nbsp;Verantwortlicher -<br>nachstehend Auftraggeber genannt&nbsp;</p><p style=\"text-align: center;\">und</p><p style=\"text-align: center;\">Tutao GmbH, Deisterstr. 17a, 30449 Hannover</p><p style=\"text-align: center;\">-&nbsp;Auftragsverarbeiter -<br>nachstehend&nbsp;Auftragnehmer genannt</p><p style=\"text-align: center;\">&nbsp;</p><h2 id=\"VertragzurAuftragsverarbeitung-1.GegenstandundDauer\">1.&nbsp;Gegenstand und Dauer</h2><p>Der Gegenstand des Auftrags ergibt sich aus den AGB der Tutao GmbH in der jeweils gültigen Version, siehe <span class=\"nolink\">https://tuta.com/terms</span>, auf die hier verwiesen wird (im Folgenden Leistungsvereinbarung). Der&nbsp;Auftragnehmer verarbeitet dabei personenbezogene Daten für den Auftraggeber&nbsp;im Sinne von Art. 4 Nr. 2 und Art. 28 DS-GVO auf Grundlage dieses Vertrages.</p><p>Die Dauer dieses Auftrags entspricht der im jeweiligen Tarif gewählten Vertragslaufzeit.</p><h2 id=\"VertragzurAuftragsverarbeitung-2.Zweck,DatenkategorienundbetroffenePersonen\">2. Zweck, Datenkategorien und betroffene Personen</h2><p>Zur Begründung eines Vertragsverhältnisses, und zur Leistungserbringung wird</p><ul><li>die neu registrierte E-Mail-Adresse</li></ul><p>als Bestandsdatum erfasst.</p><p>Für die Rechnungsstellung und Bestimmung der Umsatzsteuer&nbsp;werden</p><ul><li>der Sitz des Kunden (Land)</li><li>die Rechnungsadresse</li><li>die&nbsp;USt-IdNr. (nur für Geschäftskunden bestimmter Länder)</li></ul><p>als Bestandsdaten erfasst.</p><p>Zur Abwicklung von Zahlungen werden, je nach gewählter Zahlungsart, die folgenden Zahlungsdaten (Bestandsdaten) erfasst:</p><ul><li>Bankverbindung (Kontonummer und BLZ bzw. IBAN/BIC, ggf. Bankname, Kontoinhaber),</li><li>Kreditkartendaten,</li><li>der PayPal-Nutzername.</li></ul><p>Zur Abwicklung von Lastschriften wird die Bankverbindung an das beauftragte Kreditinstitut weitergegeben. <span>Zur Abwicklung von PayPal-Zahlungen werden die PayPal-Zahlungsdaten an PayPal (Europe) weitergegeben. </span>Zur Abwicklung von&nbsp;Kreditkartenzahlungen werden die Kreditkartendaten zur Auftragsverarbeitung an den Zahlungsdienstleister&nbsp;Braintree&nbsp;weitergegeben. Hierbei handelt es sich um eine Übermittlung von personenbezogenen Daten an ein Drittland. Ein mit Braintree geschlossener Vertrag sieht geeignete Garantien vor und stellt sicher, dass die weitergegebenen Daten nur im Einklang mit der DSGVO und lediglich zur Abwicklung von Zahlungen verwendet werden. Dieser Vertrag kann&nbsp;hier eingesehen werden:&nbsp;<span class=\"nolink\">https://www.braintreepayments.com/assets/Braintree-PSA-Model-Clauses-March2018.pdf</span></p><p>Tutanota stellt Dienste zur Speicherung, Bearbeitung, Darstellung und elektronischem Versand von Daten bereit, wie z.B. E-Mail-Service, Kontaktverwaltung und Datenablage. Im Rahmen dieser Inhaltsdaten können personenbezogene Daten des Auftraggebers verarbeitet werden. Alle textuellen Inhalte werden verschlüsselt für den Nutzer und dessen Kommunikationspartner gespeichert, so dass die Tutao GmbH selbst keinen Zugriff auf diese Daten hat.</p><p>Zur Aufrechterhaltung des&nbsp;Mailserver-Betriebs, zur Fehlerdiagnose und zur Verhinderung von Missbrauch werden Mail-Server-Logs maximal 30 Tage gespeichert. Diese enthalten Sender- und Empfänger-E-Mail-Adressen sowie den Zeitpunkt der Verbindung, jedoch keine IP-Adressen der Benutzer.</p><p>Zur Sicherstellung des Betriebs, zur&nbsp;Verhinderung von Missbrauch und zur&nbsp;Besucherauswertung werden IP-Adressen der Benutzer verarbeitet. <span>Eine Speicherung erfolgt nur für anonymisierte und damit nicht mehr </span><span>personenbezogene </span><span>IP-Adressen.</span></p><p>Mit Ausnahme der Zahlungsdaten werden die personenbezogenen Daten inklusive der E-Mail-Adresse nicht an Dritte weitergegeben. Jedoch kann Tutao GmbH rechtlich verpflichtet werden Inhaltsdaten (bei Vorlage eines gültigen deutschen Gerichtsbeschlusses) sowie&nbsp;Bestandsdaten an Strafverfolgungsbehörden auszuliefern. Es erfolgt kein Verkauf von Daten.</p><p>Die Erbringung der vertraglich vereinbarten Datenverarbeitung findet ausschließlich in einem Mitgliedsstaat der Europäischen Union oder in einem anderen Vertragsstaat des Abkommens über den Europäischen Wirtschaftsraum statt.&nbsp;Jede Verlagerung in ein Drittland bedarf der vorherigen Zustimmung des Auftraggebers und darf nur erfolgen, wenn die besonderen Voraussetzungen der Art. 44 ff. DS-GVO erfüllt sind.&nbsp;</p><p>Die Kategorien der durch die Verarbeitung betroffenen Personen umfassen die durch den Auftraggeber in Tutanota eingerichtete Nutzer und deren Kommunikationspartner.</p><h2 id=\"VertragzurAuftragsverarbeitung-3.Technisch-organisatorischeMaßnahmen\">3. Technisch-organisatorische Maßnahmen</h2><p>(1) Der&nbsp;Auftragnehmer hat die Umsetzung der im Vorfeld der Auftragsvergabe dargelegten und erforderlichen technischen und organisatorischen Maßnahmen vor Beginn der Verarbeitung, insbesondere hinsichtlich der konkreten Auftragsdurchführung zu dokumentieren und dem&nbsp;Auftraggeber zur Prüfung zu übergeben. Bei Akzeptanz durch den&nbsp;Auftraggeber&nbsp;werden die dokumentierten Maßnahmen Grundlage des Auftrags. Soweit die Prüfung des&nbsp;Auftraggebers einen Anpassungsbedarf ergibt, ist dieser einvernehmlich umzusetzen</p><p align=\"justify\">(2) Der Auftragnehmer hat die Sicherheit gem. Art. 28 Abs. 3 lit. c, 32 DS-GVO insbesondere in Verbindung mit Art. 5 Abs. 1, Abs. 2 DS-GVO herzustellen. Insgesamt handelt es sich bei den zu treffenden Maßnahmen um Maßnahmen der Datensicherheit und zur Gewährleistung eines dem Risiko angemessenen Schutzniveaus hinsichtlich der Vertraulichkeit, der Integrität, der Verfügbarkeit sowie der Belastbarkeit der Systeme. Dabei sind der Stand der Technik, die Implementierungskosten und die Art, der Umfang und die Zwecke der Verarbeitung sowie die unterschiedliche Eintrittswahrscheinlichkeit und Schwere des Risikos für die Rechte und Freiheiten natürlicher Personen im Sinne von Art. 32 Abs. 1 DS-GVO zu berücksichtigen [Einzelheiten in Anlage 1].</p><p align=\"justify\">(3) Die technischen und organisatorischen Maßnahmen unterliegen dem technischen Fortschritt und der Weiterentwicklung. Insoweit ist es dem Auftragnehmer gestattet, alternative adäquate Maßnahmen umzusetzen. Dabei darf das Sicherheitsniveau der festgelegten Maßnahmen nicht unterschritten werden. Wesentliche Änderungen sind zu dokumentieren.</p><h2 id=\"VertragzurAuftragsverarbeitung-4.Berichtigung,EinschränkungundLöschungvonDaten\">4. Berichtigung, Einschränkung und Löschung von Daten</h2><p align=\"justify\">(1) Der Auftragnehmer darf die Daten, die im Auftrag verarbeitet werden, nicht eigenmächtig sondern nur nach dokumentierter Weisung des Auftraggebers berichtigen, löschen oder deren Verarbeitung einschränken. Soweit eine betroffene Person sich diesbezüglich unmittelbar an den Auftragnehmer wendet, wird der Auftragnehmer dieses Ersuchen unverzüglich an den Auftraggeber weiterleiten.</p><p align=\"justify\">(2) Soweit vom Leistungsumfang umfasst, sind Löschkonzept, Recht auf Vergessenwerden, Berichtigung, Datenportabilität und Auskunft nach dokumentierter Weisung des Auftraggebers unmittelbar durch den Auftragnehmer sicherzustellen.</p><h2 id=\"VertragzurAuftragsverarbeitung-5.QualitätssicherungundsonstigePflichtendesAuftragnehmers\">5. Qualitätssicherung und sonstige Pflichten des Auftragnehmers</h2><p align=\"justify\">Der Auftragnehmer hat zusätzlich zu der Einhaltung der Regelungen dieses Auftrags gesetzliche Pflichten gemäß Art. 28 bis 33 DS-GVO; insofern gewährleistet er insbesondere die Einhaltung folgender Vorgaben:</p><ol><li><p align=\"justify\">Der Auftragnehmer ist nicht zur Bestellung eines Datenschutzbeauftragten verpflichtet. Als Ansprechpartner beim Auftragnehmer wird Herr Arne Möhle, Telefon: 0511 202801-11, arne.moehle@tutao.de, benannt.</p></li><li><p align=\"justify\">Die Wahrung der Vertraulichkeit gemäß Art. 28 Abs. 3 S. 2 lit. b, 29, 32 Abs. 4 DS-GVO. Der Auftragnehmer setzt bei der Durchführung der Arbeiten nur Beschäftigte ein, die auf die Vertraulichkeit verpflichtet und zuvor mit den für sie relevanten Bestimmungen zum Datenschutz vertraut gemacht wurden. Der Auftragnehmer und jede dem Auftragnehmer unterstellte Person, die Zugang zu personenbezogenen Daten hat, dürfen diese Daten ausschließlich entsprechend der Weisung des Auftraggebers verarbeiten einschließlich der in diesem Vertrag eingeräumten Befugnisse, es sei denn, dass sie gesetzlich zur Verarbeitung verpflichtet sind.</p></li><li><p align=\"justify\">Die Umsetzung und Einhaltung aller für diesen Auftrag erforderlichen technischen und organisatorischen Maßnahmen gemäß Art. 28 Abs. 3 S. 2 lit. c, 32 DS-GVO [Einzelheiten in Anlage 1].</p></li><li><p align=\"justify\">Der Auftraggeber und der Auftragnehmer arbeiten auf Anfrage mit der Aufsichtsbehörde bei der Erfüllung ihrer Aufgaben zusammen.</p></li><li><p align=\"justify\">Die unverzügliche Information des Auftragnehmers über Kontrollhandlungen und Maßnahmen der Aufsichtsbehörde, soweit sie sich auf diesen Auftrag beziehen. Dies gilt auch, soweit eine zuständige Behörde im Rahmen eines Ordnungswidrigkeits- oder Strafverfahrens in Bezug auf die Verarbeitung personenbezogener Daten bei der Auftragsverarbeitung beim Auftragnehmer ermittelt.</p></li><li><p align=\"justify\">Soweit der Auftraggeber seinerseits einer Kontrolle der Aufsichtsbehörde, einem Ordnungswidrigkeits- oder Strafverfahren, dem Haftungsanspruch einer betroffenen Person oder eines Dritten oder einem anderen Anspruch im Zusammenhang mit der Auftragsverarbeitung beim Auftragnehmer ausgesetzt ist, hat ihn der Auftragnehmer nach besten Kräften zu unterstützen.</p></li><li><p align=\"justify\">Der Auftragnehmer kontrolliert regelmäßig die internen Prozesse sowie die technischen und organisatorischen Maßnahmen, um zu gewährleisten, dass die Verarbeitung in seinem Verantwortungsbereich im Einklang mit den Anforderungen des geltenden Datenschutzrechts erfolgt und der Schutz der Rechte der betroffenen Person gewährleistet wird.</p></li><li><p align=\"justify\">Nachweisbarkeit der getroffenen technischen und organisatorischen Maßnahmen gegenüber dem Auftraggeber im Rahmen seiner Kontrollbefugnisse nach Ziffer 7 dieses Vertrages.</p></li></ol><h2 id=\"VertragzurAuftragsverarbeitung-6.Unterauftragsverhältnisse\">6. Unterauftragsverhältnisse</h2><p align=\"justify\">(1) Als Unterauftragsverhältnisse im Sinne dieser Regelung sind solche Dienstleistungen zu verstehen, die sich unmittelbar auf die Erbringung der Hauptleistung beziehen. Nicht hierzu gehören Nebenleistungen, die der Auftragnehmer wie z.B. Telekommunikationsleistungen, Post-/Transportdienstleistungen, Wartung und Benutzerservice oder die Entsorgung von Datenträgern sowie sonstige Maßnahmen zur Sicherstellung der Vertraulichkeit, Verfügbarkeit, Integrität und Belastbarkeit der Hard- und Software von Datenverarbeitungsanlagen in Anspruch nimmt. Der Auftragnehmer ist jedoch verpflichtet, zur Gewährleistung des Datenschutzes und der Datensicherheit der Daten des Auftraggebers auch bei ausgelagerten Nebenleistungen angemessene und gesetzeskonforme vertragliche Vereinbarungen sowie Kontrollmaßnahmen zu ergreifen.</p><p align=\"justify\">(2) Der Auftragnehmer darf Unterauftragnehmer (weitere Auftragsverarbeiter) nur nach vorheriger ausdrücklicher schriftlicher bzw. dokumentierter Zustimmung des Auftraggebers beauftragen.</p><p align=\"justify\">(3) Die Auslagerung auf Unterauftragnehmer sowie der&nbsp;Wechsel der bestehenden Unterauftragnehmer sind zulässig, soweit:</p><ul><li>der Auftragnehmer eine solche Auslagerung auf Unterauftragnehmer dem Auftraggeber eine angemessene Zeit vorab schriftlich oder in Textform anzeigt und</li><li>der Auftraggeber nicht bis zum Zeitpunkt der Übergabe der Daten gegenüber dem Auftragnehmer schriftlich oder in Textform Einspruch gegen die geplante Auslagerung erhebt und</li><li>eine vertragliche Vereinbarung nach Maßgabe des Art. 28 Abs. 2-4 DS-GVO zugrunde gelegt wird.</li></ul><p align=\"justify\">(4) Die Weitergabe von personenbezogenen Daten des Auftraggebers an den Unterauftragnehmer und dessen erstmaliges Tätigwerden sind erst mit Vorliegen aller Voraussetzungen für eine Unterbeauftragung gestattet.</p><p align=\"justify\">(5) Erbringt der Unterauftragnehmer die vereinbarte Leistung außerhalb der EU/des EWR stellt der Auftragnehmer die datenschutzrechtliche Zulässigkeit durch entsprechende Maßnahmen sicher. Gleiches gilt, wenn Dienstleister im Sinne von Abs. 1 Satz 2 eingesetzt werden sollen.</p><p align=\"justify\">(6) Eine weitere Auslagerung durch den Unterauftragnehmer bedarf der ausdrücklichen Zustimmung des Hauptauftraggebers (mind. Textform).</p><p align=\"justify\">(7) Sämtliche vertraglichen Regelungen in der Vertragskette sind auch dem weiteren Unterauftragnehmer aufzuerlegen.</p><h2 class=\"western\" id=\"VertragzurAuftragsverarbeitung-7.KontrollrechtedesAuftraggebers\">7. Kontrollrechte des Auftraggebers</h2><p align=\"justify\">(1) Der Auftraggeber hat das Recht, im Benehmen mit dem Auftragnehmer Überprüfungen durchzuführen oder durch im Einzelfall zu benennende Prüfer durchführen zu lassen. Er hat das Recht, sich durch Stichprobenkontrollen, die in der Regel rechtzeitig anzumelden sind, von der Einhaltung dieser Vereinbarung durch den Auftragnehmer in dessen Geschäftsbetrieb zu überzeugen.</p><p align=\"justify\">(2) Der Auftragnehmer stellt sicher, dass sich der Auftraggeber von der Einhaltung der Pflichten des Auftragnehmers nach Art. 28 DS-GVO überzeugen kann. Der Auftragnehmer verpflichtet sich, dem Auftraggeber auf Anforderung die erforderlichen Auskünfte zu erteilen und insbesondere die Umsetzung der technischen und organisatorischen Maßnahmen nachzuweisen.</p><p align=\"justify\">(3) Der Nachweis solcher Maßnahmen, die nicht nur den konkreten Auftrag betreffen, kann erfolgen durch</p><ul><li>die Einhaltung genehmigter Verhaltensregeln gemäß Art. 40 DS-GVO;</li><li>die Zertifizierung nach einem genehmigten Zertifizierungsverfahren gemäß Art. 42 DS-GVO;</li><li>aktuelle Testate, Berichte oder Berichtsauszüge unabhängiger Instanzen (z.B. Wirtschaftsprüfer, Revision, Datenschutzbeauftragter, IT-Sicherheitsabteilung, Datenschutzauditoren, Qualitätsauditoren);</li><li>eine geeignete Zertifizierung durch IT-Sicherheits- oder Datenschutzaudit (z.B. nach BSI-Grundschutz).</li></ul><p align=\"justify\">(4) Für die Ermöglichung von Kontrollen durch den Auftraggeber kann der Auftragnehmer einen Vergütungsanspruch geltend machen.</p><h2 class=\"western\" id=\"VertragzurAuftragsverarbeitung-8.MitteilungbeiVerstößendesAuftragnehmers\">8. Mitteilung bei Verstößen des Auftragnehmers</h2><p align=\"justify\">(1) Der Auftragnehmer unterstützt den Auftraggeber bei der Einhaltung der in den Artikeln 32 bis 36 der DS-GVO genannten Pflichten zur Sicherheit personenbezogener Daten, Meldepflichten bei Datenpannen, Datenschutz-Folgeabschätzungen und vorherige Konsultationen. Hierzu gehören u.a.</p><ol><li><p align=\"justify\">die Sicherstellung eines angemessenen Schutzniveaus durch technische und organisatorische Maßnahmen, die die Umstände und Zwecke der Verarbeitung sowie die prognostizierte Wahrscheinlichkeit und Schwere einer möglichen Rechtsverletzung durch Sicherheitslücken berücksichtigen und eine sofortige Feststellung von relevanten Verletzungsereignissen ermöglichen</p></li><li><p align=\"justify\">die Verpflichtung, Verletzungen personenbezogener Daten unverzüglich an den Auftraggeber zu melden</p></li><li><p align=\"justify\">die Verpflichtung, dem Auftraggeber im Rahmen seiner Informationspflicht gegenüber dem Betroffenen zu unterstützen und ihm in diesem Zusammenhang sämtliche relevante Informationen unverzüglich zur Verfügung zu stellen</p></li><li><p align=\"justify\">die Unterstützung des Auftraggebers für dessen Datenschutz-Folgenabschätzung</p></li><li><p align=\"justify\">die Unterstützung des Auftraggebers im Rahmen vorheriger Konsultationen mit der Aufsichtsbehörde</p></li></ol><p align=\"justify\">(2) Für Unterstützungsleistungen, die nicht in der Leistungsbeschreibung enthalten oder nicht auf ein Fehlverhalten des Auftragnehmers zurückzuführen sind, kann der Auftragnehmer eine Vergütung beanspruchen.</p><h2 class=\"western\" id=\"VertragzurAuftragsverarbeitung-9.WeisungsbefugnisdesAuftraggebers\">9. Weisungsbefugnis des Auftraggebers</h2><p align=\"justify\">(1) Mündliche Weisungen bestätigt der Auftraggeber unverzüglich (mind. Textform).</p><p align=\"justify\">(2) Der Auftragnehmer hat den Auftraggeber unverzüglich zu informieren, wenn er der Meinung ist, eine Weisung verstoße gegen Datenschutzvorschriften. Der Auftragnehmer ist berechtigt, die Durchführung der entsprechenden Weisung solange auszusetzen, bis sie durch den Auftraggeber bestätigt oder geändert wird.</p><h2 class=\"western\" id=\"VertragzurAuftragsverarbeitung-10.LöschungundRückgabevonpersonenbezogenenDaten\">10. Löschung und Rückgabe von personenbezogenen Daten</h2><p align=\"justify\">(1) Kopien oder Duplikate der Daten werden ohne Wissen des Auftraggebers nicht erstellt. Hiervon ausgenommen sind Sicherheitskopien, soweit sie zur Gewährleistung einer ordnungsgemäßen Datenverarbeitung erforderlich sind, sowie Daten, die im Hinblick auf die Einhaltung gesetzlicher Aufbewahrungspflichten erforderlich sind.</p><p align=\"justify\">(2) Nach Abschluss der vertraglich vereinbarten Arbeiten oder früher nach Aufforderung durch den Auftraggeber – spätestens mit Beendigung der Leistungsvereinbarung – hat der Auftragnehmer sämtliche in seinen Besitz gelangten Unterlagen, erstellte Verarbeitungs- und Nutzungsergebnisse sowie Datenbestände, die im Zusammenhang mit dem Auftragsverhältnis stehen, dem Auftraggeber auszuhändigen oder nach vorheriger Zustimmung datenschutzgerecht zu vernichten. Gleiches gilt für Test- und Ausschussmaterial. Das Protokoll der Löschung ist auf Anforderung vorzulegen.</p><p align=\"justify\">(3) Dokumentationen, die dem Nachweis der auftrags- und ordnungsgemäßen Datenverarbeitung dienen, sind durch den Auftragnehmer entsprechend der jeweiligen Aufbewahrungsfristen über das Vertragsende hinaus aufzubewahren. Er kann sie zu seiner Entlastung bei Vertragsende dem Auftraggeber übergeben.</p><h2 id=\"VertragzurAuftragsverarbeitung-11.Schlussbestimmungen\">11. Schlussbestimmungen</h2><p align=\"justify\">(1) <span>Dieser Vertrag unterliegt dem Recht der Bundesrepublik Deutschland. Gerichtsstand ist Hannover.</span></p><p align=\"justify\"><span>(2) Änderungen und Ergänzungen dieses Vertrags bedürfen der Schriftform. Dies gilt auch für den Verzicht auf das Schriftformerfordernis.</span></p><p align=\"justify\" class=\"western\">(3) <span>Sollten einzelne Bestimmungen dieses Vertrags unwirksam sein oder werden, so wird dadurch die Gültigkeit der übrigen Bestimmungen nicht berührt. Die Vertragsparteien verpflichten sich in diesen Fällen, anstelle der etwa unwirksamen Bestimmung(en) – mit Wirkung von Beginn der Unwirksamkeit an – eine Ersatzregelung oder ggf. einen neuen wirksamen Vertrag zu vereinbaren, die bzw. der dem wirtschaftlichen gewollten Zweck der unwirksamen Bestimmung(en) weitgehend entspricht oder am nächsten kommt. Dies gilt auch für den Fall, dass der Vertrag eine Regelungslücke enthalten sollte.</span></p><p align=\"justify\">&nbsp;</p>",
		appendix: "<div class=\"pagebreak\" style=\"break-before:always;\"><p></p><h2 id=\"VertragzurAuftragsverarbeitung-Anlage1(TechnischeundorganisatorischeMaßnahmen)\">Anlage 1 (Technische und organisatorische Maßnahmen)</h2><p>Die Systemadministratoren werden im Folgenden \"DevOps\" genannt. Folgende Maßnahmen wurden getroffen:</p><ol><li>Zutrittskontrolle: Alle Systeme sind in ISO 27001 zertifizierten Rechenzentren in Deutschland gehostet. Nur DevOps haben Zutritt zu den physischen Systemen.</li><li>Zugangskontrolle/Benutzerkontrolle: Der Zugriff durch Benutzer ist mit starken Passwörtern entsprechend den internen Passwortregeln oder Public-Key-Zugriff und Zwei-Faktor-Authentifizierung (e.g. YubiKey) gesichert.&nbsp;Benutzerzugriff wird von DevOps verwaltet.</li><li>Zugriffskontrolle/Speicherkontrolle: Datensätze sind mit rollenbasierten Berechtigungen geschützt. Berechtigungen werden von DevOps verwaltet.</li><li>Datenträgerkontrolle: <span>Alle Festplatten mit personenbezogenen Daten sind verschüsselt. Dateiberechtigungen sind für DevOps sowie Anwendungen so vergeben, dass unberechtigter Zugriff auf Dateien von eingeloggten Benutzern und Prozessen verhindert wird.</span></li><li>Übertragungskontrolle/Weitergabekontrolle: Weitergabe von personenbezogenen Daten an andere Empfänger wird protokolliert.&nbsp;Die Protokolle enthalten den Benutzer/Prozess, der die Eingabe initiiert hat, die Kategorie personenbezogener Daten und den Zeitstempel. Die Protokolle werden für sechs Monate aufgehoben.</li><li>Eingabekontrolle: Eingabe von neuen und aktualisierten sowie die Löschung von personenbezogenen Daten wird protokolliert. <span>Die Protokolle enthalten den Benutzer/Prozess, der die Eingabe initiiert hat, die Kategorie personenbezogener Daten und den Zeitstempel. Die Protokolle werden für sechs Monate aufgehoben.</span></li><li>Transportkontrolle: Übertragung von personenbezogenen Daten von und zu den Systemen ist durch starke SSL-Verschlüsselung und/oder Ende-zu-Ende-Verschlüsselung gesichert.</li><li>Vertraulichkeit: Personenbezogene Daten werden soweit möglich Ende-zu-Ende verschlüsselte gespeichert.</li><li>Wiederherstellbarkeit: Alle Systeme haben eine zweite Netzwerkschnittstelle, die nur den Zugriff von DevOps erlaubt. Diese Schnittstelle erlaubt den Zugriff selbst wenn die Hauptschnittstelle blockiert ist. Komponenten des Systems können im Fehlerfall neu gestartet werden. Ein Dienst zum Schutz vor DDOS-Angriffen wird automatisch gestartet, wenn solch ein Angriff erkannt wird.</li><li>Zuverlässigkeit:&nbsp;&nbsp;DevOps überwachen alle Systeme und werden automatisch benachrichtigt, wenn eine Komponente des Systems ausfällt, um diese sofort wieder aktivieren zu können.</li><li>Datenintegrität: Automatische Fehlerkorrektur auf Datenträgern und auf Datenbankebene stellt sicher, dass die Datenintegrität gewahrt bleibt. Zusätzlich wird die Integrität der Ende-zu-Ende verschlüsselten personenbezogenen Daten durch MACs bei der Ver- und Entschlüsselung sichergestellt.</li><li>Auftragskontrolle: Alle Mitarbeiter kennen die Zwecke der Verarbeitung und absolvieren regelmäßig ein internes Sicherheitstraining. Unterauftragnehmer werden nur schriftlich beauftragt.</li><li>Verfügbarkeitskontrolle: <span>Alle Systeme sind in ISO 27001 zertifizierten Rechenzentren in Deutschland gehostet, die die physische Verfügbarkeit und Verbindung der Systeme sicherstellen</span>. Alle langfristig gespeicherten Daten werden dreifach repliziert auf unterschiedlichen Servern oder in einem RAID-System abgelegt. Vor der Aktualisierung kritischer Teile des Systems werden Backups angelegt.</li><li>Trennbarkeit: Getrennte Verarbeitung von personenbezogenen Daten ist bedarfsabhängig eingerichtet.</li><li>Belastbarkeit: Alle Systeme bestehen aus hochskalierbaren Komponenten, die für viel höhere Lasten als tatsächlich benötigt ausgelegt sind. Alle Systeme sind kurzfristig erweiterbar, um kontinuierlich steigende Lasten verarbeiten zu können.</li></ol></div>\n</div>"
	}
};
function showForSigning(customer, accountingInfo) {
	const signAction = (dialog) => {
		let data = createSignOrderProcessingAgreementData({
			version,
			customerAddress: addressEditor.getValue()
		});
		if (addressEditor.getValue().trim().split("\n").length < 3) Dialog.message("contractorInfo_msg");
else locator.serviceExecutor.post(SignOrderProcessingAgreementService, data).then(() => dialog.close());
	};
	const version = "1_" + (lang.code === "de" ? "de" : "en");
	const addressEditor = new HtmlEditor().setMinHeight(120).showBorders().setPlaceholderId("contractor_label").setMode(HtmlEditorMode.HTML).setHtmlMonospace(false).setValue(formatNameAndAddress(accountingInfo.invoiceName, accountingInfo.invoiceAddress));
	Dialog.showActionDialog({
		title: "orderProcessingAgreement_label",
		okAction: signAction,
		okActionTextId: "sign_action",
		type: DialogType.EditLarge,
		child: () => {
			const text = agreementTexts[version];
			return mithril_default(".pt", [
				mithril_default.trust(text.heading),
				mithril_default(".flex-center", mithril_default(".dialog-width-s", [mithril_default(addressEditor), mithril_default(".small", lang.get("contractorInfo_msg"))])),
				mithril_default.trust(text.content),
				mithril_default.trust(text.appendix)
			]);
		}
	});
}
function printElementContent(elem) {
	const root = document.getElementById("root");
	const body = document.body;
	if (!elem || !root || !body) return;
	let printDiv = document.getElementById(PRINT_DIV_ID);
	if (!printDiv) {
		printDiv = document.createElement("DIV");
		printDiv.id = PRINT_DIV_ID;
		body.appendChild(printDiv);
		const classes = root.className.split(" ");
		classes.push("noprint");
		root.className = classes.join(" ");
	}
	printDiv.innerHTML = elem.innerHTML;
	printDiv.classList.add("noscreen");
	window.print();
}
function cleanupPrintElement() {
	const root = document.getElementById("root");
	const body = document.body;
	const printDiv = document.getElementById(PRINT_DIV_ID);
	if (!printDiv || !root || !body) return;
	body.removeChild(printDiv);
	root.className = root.className.split(" ").filter((c) => c !== "noprint").join(" ");
}
function showForViewing(agreement, signerUserGroupInfo) {
	Dialog.showActionDialog({
		title: "orderProcessingAgreement_label",
		okAction: !isApp() && "function" === typeof window.print ? () => printElementContent(document.getElementById("agreement-content")) : null,
		okActionTextId: "print_action",
		cancelActionTextId: "close_alt",
		type: DialogType.EditLarge,
		child: () => {
			const text = agreementTexts[agreement.version];
			return mithril_default("#agreement-content.pt", { onremove: cleanupPrintElement }, [
				mithril_default.trust(text.heading),
				mithril_default("p.text-center.text-prewrap", agreement.customerAddress),
				mithril_default.trust(text.content),
				mithril_default("i", lang.get("signedOn_msg", { "{date}": formatDate(agreement.signatureDate) }) + " " + lang.get("by_label") + " " + getMailAddressDisplayText(signerUserGroupInfo.name, neverNull(signerUserGroupInfo.mailAddress), false)),
				mithril_default("hr"),
				mithril_default.trust(text.appendix)
			]);
		}
	});
}

//#endregion
//#region src/common/settings/SettingsExpander.ts
var SettingsExpander = class {
	oncreate(vnode) {
		vnode.attrs.expanded.map((expanded) => {
			if (expanded && vnode.attrs.onExpand) vnode.attrs.onExpand();
		});
	}
	view(vnode) {
		const { title, buttonText, infoLinkId, infoMsg, expanded } = vnode.attrs;
		return [
			mithril_default(".flex-space-between.items-center.mb-s.mt-l", [mithril_default(".h4", lang.getTranslationText(title)), mithril_default(ExpanderButton, {
				label: buttonText || "show_action",
				expanded: expanded(),
				onExpandedChange: expanded
			})]),
			mithril_default(ExpanderPanel, { expanded: expanded() }, vnode.children),
			infoMsg ? mithril_default("small", lang.getTranslationText(infoMsg)) : null,
			infoLinkId ? ifAllowedTutaLinks(locator.logins, infoLinkId, (link) => mithril_default("small.text-break", [mithril_default(`a[href=${link}][target=_blank]`, link)])) : null
		];
	}
};

//#endregion
//#region src/common/subscription/SubscriptionViewer.ts
var import_stream$1 = __toESM(require_stream(), 1);
assertMainOrNode();
const DAY = 864e5;
let SubscriptionApp = function(SubscriptionApp$1) {
	SubscriptionApp$1["Mail"] = "0";
	SubscriptionApp$1["Calendar"] = "1";
	return SubscriptionApp$1;
}({});
var SubscriptionViewer = class {
	view;
	_subscriptionFieldValue;
	_orderAgreementFieldValue;
	_selectedSubscriptionInterval;
	_currentPriceFieldValue;
	_nextPriceFieldValue;
	_usersFieldValue;
	_storageFieldValue;
	_emailAliasFieldValue;
	_groupsFieldValue;
	_whitelabelFieldValue;
	_sharingFieldValue;
	_eventInvitesFieldValue;
	_autoResponderFieldValue;
	_periodEndDate = null;
	_nextPeriodPriceVisible = null;
	_customer = null;
	_customerInfo = null;
	_accountingInfo = null;
	_lastBooking = null;
	_orderAgreement = null;
	currentPlanType;
	_isCancelled = null;
	_giftCards;
	_giftCardsExpanded;
	constructor(currentPlanType, mobilePaymentsFacade) {
		this.mobilePaymentsFacade = mobilePaymentsFacade;
		this.currentPlanType = currentPlanType;
		const isPremiumPredicate = () => locator.logins.getUserController().isPaidAccount();
		this._giftCards = new Map();
		loadGiftCards(assertNotNull(locator.logins.getUserController().user.customer)).then((giftCards) => {
			for (const giftCard of giftCards) this._giftCards.set(elementIdPart(giftCard._id), giftCard);
		});
		this._giftCardsExpanded = (0, import_stream$1.default)(false);
		this.view = () => {
			return mithril_default("#subscription-settings.fill-absolute.scroll.plr-l", [
				mithril_default(".h4.mt-l", lang.get("currentlyBooked_label")),
				mithril_default(TextField, {
					label: "subscription_label",
					value: this._subscriptionFieldValue(),
					oninput: this._subscriptionFieldValue,
					isReadOnly: true,
					injectionsRight: () => locator.logins.getUserController().isFreeAccount() ? mithril_default(IconButton, {
						title: "upgrade_action",
						click: () => showProgressDialog("pleaseWait_msg", this.handleUpgradeSubscription()),
						icon: Icons.Edit,
						size: ButtonSize.Compact
					}) : !this._isCancelled ? mithril_default(IconButton, {
						title: "subscription_label",
						click: () => this.onSubscriptionClick(),
						icon: Icons.Edit,
						size: ButtonSize.Compact
					}) : null
				}),
				this.showOrderAgreement() ? this.renderAgreement() : null,
				this.showPriceData() ? this.renderIntervals() : null,
				this.showPriceData() && this._nextPeriodPriceVisible && this._periodEndDate ? mithril_default(TextField, {
					label: lang.getTranslation("priceFrom_label", { "{date}": formatDate(new Date(neverNull(this._periodEndDate).getTime() + DAY)) }),
					helpLabel: () => lang.get("nextSubscriptionPrice_msg"),
					value: this._nextPriceFieldValue(),
					oninput: this._nextPriceFieldValue,
					isReadOnly: true
				}) : null,
				mithril_default(".small.mt-s", renderTermsAndConditionsButton(TermsSection.Terms, CURRENT_TERMS_VERSION)),
				mithril_default(".small.mt-s", renderTermsAndConditionsButton(TermsSection.Privacy, CURRENT_PRIVACY_VERSION)),
				mithril_default(SettingsExpander, {
					title: "giftCards_label",
					infoMsg: "giftCardSection_label",
					expanded: this._giftCardsExpanded
				}, renderGiftCardTable(Array.from(this._giftCards.values()), isPremiumPredicate)),
				LegacyPlans.includes(this.currentPlanType) ? [
					mithril_default(".h4.mt-l", lang.get("adminPremiumFeatures_action")),
					mithril_default(TextField, {
						label: "storageCapacity_label",
						value: this._storageFieldValue(),
						oninput: this._storageFieldValue,
						isReadOnly: true
					}),
					mithril_default(TextField, {
						label: "mailAddressAliases_label",
						value: this._emailAliasFieldValue(),
						oninput: this._emailAliasFieldValue,
						isReadOnly: true
					}),
					mithril_default(TextField, {
						label: "pricing.comparisonSharingCalendar_msg",
						value: this._sharingFieldValue(),
						oninput: this._sharingFieldValue,
						isReadOnly: true
					}),
					mithril_default(TextField, {
						label: "pricing.comparisonEventInvites_msg",
						value: this._eventInvitesFieldValue(),
						oninput: this._eventInvitesFieldValue,
						isReadOnly: true
					}),
					mithril_default(TextField, {
						label: "pricing.comparisonOutOfOffice_msg",
						value: this._autoResponderFieldValue(),
						oninput: this._autoResponderFieldValue,
						isReadOnly: true
					}),
					mithril_default(TextField, {
						label: "whitelabel.login_title",
						value: this._whitelabelFieldValue(),
						oninput: this._whitelabelFieldValue,
						isReadOnly: true
					}),
					mithril_default(TextField, {
						label: "whitelabel.custom_title",
						value: this._whitelabelFieldValue(),
						oninput: this._whitelabelFieldValue,
						isReadOnly: true
					})
				] : []
			]);
		};
		locator.entityClient.load(CustomerTypeRef, neverNull(locator.logins.getUserController().user.customer)).then((customer) => {
			this.updateCustomerData(customer);
			return locator.logins.getUserController().loadCustomerInfo();
		}).then((customerInfo) => {
			this._customerInfo = customerInfo;
			return locator.entityClient.load(AccountingInfoTypeRef, customerInfo.accountingInfo);
		}).then((accountingInfo) => {
			this.updateAccountInfoData(accountingInfo);
			this.updatePriceInfo();
		});
		const loadingString = lang.get("loading_msg");
		this._currentPriceFieldValue = (0, import_stream$1.default)(loadingString);
		this._subscriptionFieldValue = (0, import_stream$1.default)(loadingString);
		this._orderAgreementFieldValue = (0, import_stream$1.default)(loadingString);
		this._nextPriceFieldValue = (0, import_stream$1.default)(loadingString);
		this._usersFieldValue = (0, import_stream$1.default)(loadingString);
		this._storageFieldValue = (0, import_stream$1.default)(loadingString);
		this._emailAliasFieldValue = (0, import_stream$1.default)(loadingString);
		this._groupsFieldValue = (0, import_stream$1.default)(loadingString);
		this._whitelabelFieldValue = (0, import_stream$1.default)(loadingString);
		this._sharingFieldValue = (0, import_stream$1.default)(loadingString);
		this._eventInvitesFieldValue = (0, import_stream$1.default)(loadingString);
		this._autoResponderFieldValue = (0, import_stream$1.default)(loadingString);
		this._selectedSubscriptionInterval = (0, import_stream$1.default)(null);
		this.updateBookings();
	}
	onSubscriptionClick() {
		const paymentMethod = this._accountingInfo ? getPaymentMethodType(this._accountingInfo) : null;
		if (isIOSApp() && (paymentMethod == null || paymentMethod == PaymentMethodType.AppStore)) this.handleAppStoreSubscriptionChange();
else if (paymentMethod == PaymentMethodType.AppStore && this._accountingInfo?.appStoreSubscription) return showManageThroughAppStoreDialog();
else if (this._accountingInfo && this._customer && this._customerInfo && this._lastBooking) showSwitchDialog(this._customer, this._customerInfo, this._accountingInfo, this._lastBooking, AvailablePlans, null);
	}
	async handleUpgradeSubscription() {
		if (isIOSApp()) {
			const appStoreSubscriptionOwnership = await queryAppStoreSubscriptionOwnership(null);
			if (appStoreSubscriptionOwnership !== MobilePaymentSubscriptionOwnership.NoSubscription) return Dialog.message(lang.getTranslation("storeMultiSubscriptionError_msg", { "{AppStorePayment}": InfoLink.AppStorePayment }));
		}
		return showUpgradeWizard(locator.logins);
	}
	async handleAppStoreSubscriptionChange() {
		if (!this.mobilePaymentsFacade) throw Error("Not allowed to change AppStore subscription from web client");
		let customer;
		let accountingInfo;
		if (this._customer && this._accountingInfo) {
			customer = this._customer;
			accountingInfo = this._accountingInfo;
		} else return;
		const appStoreSubscriptionOwnership = await queryAppStoreSubscriptionOwnership(base64ToUint8Array(base64ExtToBase64(customer._id)));
		const isAppStorePayment = getPaymentMethodType(accountingInfo) === PaymentMethodType.AppStore;
		const userStatus = customer.approvalStatus;
		const hasAnActiveSubscription = isAppStorePayment && accountingInfo.appStoreSubscription != null;
		if (hasAnActiveSubscription && !await this.canManageAppStoreSubscriptionInApp(accountingInfo, appStoreSubscriptionOwnership)) return;
		if (appStoreSubscriptionOwnership === MobilePaymentSubscriptionOwnership.NotOwner) return Dialog.message(lang.getTranslation("storeMultiSubscriptionError_msg", { "{AppStorePayment}": InfoLink.AppStorePayment }));
else if (isAppStorePayment && appStoreSubscriptionOwnership === MobilePaymentSubscriptionOwnership.NoSubscription && userStatus === ApprovalStatus.REGISTRATION_APPROVED) return Dialog.message(lang.getTranslation("storeNoSubscription_msg", { "{AppStorePayment}": InfoLink.AppStorePayment }));
else if (appStoreSubscriptionOwnership === MobilePaymentSubscriptionOwnership.NoSubscription) {
			const isResubscribe = await Dialog.choice(lang.getTranslation("storeDowngradeOrResubscribe_msg", { "{AppStoreDowngrade}": InfoLink.AppStoreDowngrade }), [{
				text: "changePlan_action",
				value: false
			}, {
				text: "resubscribe_action",
				value: true
			}]);
			if (isResubscribe) {
				const planType = await locator.logins.getUserController().getPlanType();
				const customerId = locator.logins.getUserController().user.customer;
				const customerIdBytes = base64ToUint8Array(base64ExtToBase64(customerId));
				try {
					await this.mobilePaymentsFacade.requestSubscriptionToPlan(appStorePlanName(planType), asPaymentInterval(accountingInfo.paymentInterval), customerIdBytes);
				} catch (e) {
					if (e instanceof MobilePaymentError) {
						console.error("AppStore subscription failed", e);
						Dialog.message("appStoreSubscriptionError_msg", e.message);
					} else throw e;
				}
			} else if (this._customerInfo && this._lastBooking) return showSwitchDialog(customer, this._customerInfo, accountingInfo, this._lastBooking, AvailablePlans, null);
		} else if (this._customerInfo && this._lastBooking) return showSwitchDialog(customer, this._customerInfo, accountingInfo, this._lastBooking, AvailablePlans, null);
	}
	async canManageAppStoreSubscriptionInApp(accountingInfo, ownership) {
		if (ownership === MobilePaymentSubscriptionOwnership.NotOwner) return true;
		const appStoreSubscriptionData = await locator.serviceExecutor.get(AppStoreSubscriptionService, createAppStoreSubscriptionGetIn({ subscriptionId: elementIdPart(assertNotNull(accountingInfo.appStoreSubscription)) }));
		if (!appStoreSubscriptionData || appStoreSubscriptionData.app == null) throw new ProgrammingError("Failed to determine subscription origin");
		const isMailSubscription = appStoreSubscriptionData.app === SubscriptionApp.Mail;
		if (client.isCalendarApp() && isMailSubscription) return await this.handleAppOpen(SubscriptionApp.Mail);
else if (!client.isCalendarApp() && !isMailSubscription) return await this.handleAppOpen(SubscriptionApp.Calendar);
		return true;
	}
	async handleAppOpen(app) {
		const appName = app === SubscriptionApp.Calendar ? "Tuta Calendar" : "Tuta Mail";
		const dialogResult = await Dialog.confirm(lang.getTranslation("handleSubscriptionOnApp_msg", { "{1}": appName }), "yes_label");
		const query = stringToBase64(`settings=subscription`);
		if (!dialogResult) return false;
		if (app === SubscriptionApp.Calendar) locator.systemFacade.openCalendarApp(query);
else locator.systemFacade.openMailApp(query);
		return false;
	}
	openAppDialogCallback(open, app) {
		if (!open) return;
		const appName = app === AppType.Mail ? "Tuta Mail" : "Tuta Calendar";
	}
	showOrderAgreement() {
		return locator.logins.getUserController().isPaidAccount() && (this._customer != null && this._customer.businessUse || this._customer != null && (this._customer.orderProcessingAgreement != null || this._customer.orderProcessingAgreementNeeded));
	}
	async updateCustomerData(customer) {
		this._customer = customer;
		if (customer.orderProcessingAgreement) this._orderAgreement = await locator.entityClient.load(OrderProcessingAgreementTypeRef, customer.orderProcessingAgreement);
else this._orderAgreement = null;
		if (customer.orderProcessingAgreementNeeded) this._orderAgreementFieldValue(lang.get("signingNeeded_msg"));
else if (this._orderAgreement) this._orderAgreementFieldValue(lang.get("signedOn_msg", { "{date}": formatDate(this._orderAgreement.signatureDate) }));
else this._orderAgreementFieldValue(lang.get("notSigned_msg"));
		mithril_default.redraw();
	}
	showPriceData() {
		const isAppStorePayment = this._accountingInfo && getPaymentMethodType(this._accountingInfo) === PaymentMethodType.AppStore;
		return locator.logins.getUserController().isPaidAccount() && !isIOSApp() && !isAppStorePayment;
	}
	async updatePriceInfo() {
		if (!this.showPriceData()) return;
		const priceServiceReturn = await locator.bookingFacade.getCurrentPrice();
		if (priceServiceReturn.currentPriceThisPeriod != null && priceServiceReturn.currentPriceNextPeriod != null) {
			if (priceServiceReturn.currentPriceThisPeriod.price !== priceServiceReturn.currentPriceNextPeriod.price) {
				this._currentPriceFieldValue(formatPriceDataWithInfo(priceServiceReturn.currentPriceThisPeriod));
				this._nextPriceFieldValue(formatPriceDataWithInfo(neverNull(priceServiceReturn.currentPriceNextPeriod)));
				this._nextPeriodPriceVisible = true;
			} else {
				this._currentPriceFieldValue(formatPriceDataWithInfo(priceServiceReturn.currentPriceThisPeriod));
				this._nextPeriodPriceVisible = false;
			}
			this._periodEndDate = priceServiceReturn.periodEndDate;
			mithril_default.redraw();
		}
	}
	updateAccountInfoData(accountingInfo) {
		this._accountingInfo = accountingInfo;
		this._selectedSubscriptionInterval(asPaymentInterval(accountingInfo.paymentInterval));
		mithril_default.redraw();
	}
	async updateSubscriptionField() {
		const userController = locator.logins.getUserController();
		const accountType = downcast(userController.user.accountType);
		const planType = await userController.getPlanType();
		this._subscriptionFieldValue(_getAccountTypeName(accountType, planType));
	}
	async updateBookings() {
		const userController = locator.logins.getUserController();
		const customer = await userController.loadCustomer();
		let customerInfo;
		try {
			customerInfo = await userController.loadCustomerInfo();
		} catch (e) {
			if (e instanceof NotFoundError) {
				console.log("could not update bookings as customer info does not exist (moved between free/premium lists)");
				return;
			} else throw e;
		}
		this._customerInfo = customerInfo;
		const bookings = await locator.entityClient.loadRange(BookingTypeRef, neverNull(customerInfo.bookings).items, GENERATED_MAX_ID, 1, true);
		this._lastBooking = bookings.length > 0 ? bookings[bookings.length - 1] : null;
		this._customer = customer;
		this.currentPlanType = await userController.getPlanType();
		const planConfig = await userController.getPlanConfig();
		await this.updateSubscriptionField();
		await Promise.all([
			this.updateUserField(),
			this.updateStorageField(customer, customerInfo),
			this.updateAliasField(),
			this.updateGroupsField(),
			this.updateWhitelabelField(planConfig),
			this.updateSharingField(planConfig),
			this.updateEventInvitesField(planConfig),
			this.updateAutoResponderField(planConfig)
		]);
		mithril_default.redraw();
	}
	async updateUserField() {
		this._usersFieldValue("" + Math.max(1, getCurrentCount(BookingItemFeatureType.LegacyUsers, this._lastBooking)));
	}
	async updateStorageField(customer, customerInfo) {
		const usedStorage = await locator.customerFacade.readUsedCustomerStorage(getEtId(customer));
		const usedStorageFormatted = formatStorageSize(Number(usedStorage));
		const totalStorageFormatted = formatStorageSize(getTotalStorageCapacityPerCustomer(customer, customerInfo, this._lastBooking) * Const.MEMORY_GB_FACTOR);
		this._storageFieldValue(lang.get("amountUsedOf_label", {
			"{amount}": usedStorageFormatted,
			"{totalAmount}": totalStorageFormatted
		}));
	}
	async updateAliasField() {
		const counters = await locator.mailAddressFacade.getAliasCounters(locator.logins.getUserController().user.userGroup.group);
		this._emailAliasFieldValue(lang.get("amountUsedAndActivatedOf_label", {
			"{used}": counters.usedAliases,
			"{active}": counters.enabledAliases,
			"{totalAmount}": counters.totalAliases
		}));
	}
	async updateGroupsField() {
		const sharedMailCount = getCurrentCount(BookingItemFeatureType.SharedMailGroup, this._lastBooking);
		const sharedMailText = sharedMailCount + " " + lang.get(sharedMailCount === 1 ? "sharedMailbox_label" : "sharedMailboxes_label");
		this._groupsFieldValue(sharedMailText);
	}
	async updateWhitelabelField(planConfig) {
		if (isWhitelabelActive(this._lastBooking, planConfig)) this._whitelabelFieldValue(lang.get("active_label"));
else this._whitelabelFieldValue(lang.get("deactivated_label"));
	}
	async updateSharingField(planConfig) {
		if (isSharingActive(this._lastBooking, planConfig)) this._sharingFieldValue(lang.get("active_label"));
else this._sharingFieldValue(lang.get("deactivated_label"));
	}
	async updateEventInvitesField(planConfig) {
		if (!this._customer) this._eventInvitesFieldValue("");
else if (isEventInvitesActive(this._lastBooking, planConfig)) this._eventInvitesFieldValue(lang.get("active_label"));
else this._eventInvitesFieldValue(lang.get("deactivated_label"));
	}
	async updateAutoResponderField(planConfig) {
		if (!this._customer) this._autoResponderFieldValue("");
else if (isAutoResponderActive(this._lastBooking, planConfig)) this._autoResponderFieldValue(lang.get("active_label"));
else this._autoResponderFieldValue(lang.get("deactivated_label"));
	}
	async entityEventsReceived(updates) {
		await pMap(updates, (update) => this.processUpdate(update));
	}
	async processUpdate(update) {
		const { instanceListId, instanceId } = update;
		if (isUpdateForTypeRef(AccountingInfoTypeRef, update)) {
			const accountingInfo = await locator.entityClient.load(AccountingInfoTypeRef, instanceId);
			this.updateAccountInfoData(accountingInfo);
			return await this.updatePriceInfo();
		} else if (isUpdateForTypeRef(UserTypeRef, update)) {
			await this.updateBookings();
			return await this.updatePriceInfo();
		} else if (isUpdateForTypeRef(BookingTypeRef, update)) {
			await this.updateBookings();
			return await this.updatePriceInfo();
		} else if (isUpdateForTypeRef(CustomerTypeRef, update)) {
			const customer = await locator.entityClient.load(CustomerTypeRef, instanceId);
			return await this.updateCustomerData(customer);
		} else if (isUpdateForTypeRef(CustomerInfoTypeRef, update)) {
			await this.updateBookings();
			return await this.updatePriceInfo();
		} else if (isUpdateForTypeRef(GiftCardTypeRef, update)) {
			const giftCard = await locator.entityClient.load(GiftCardTypeRef, [instanceListId, instanceId]);
			this._giftCards.set(elementIdPart(giftCard._id), giftCard);
			if (update.operation === OperationType.CREATE) this._giftCardsExpanded(true);
		}
	}
	renderIntervals() {
		const isAppStorePayment = this._accountingInfo && getPaymentMethodType(this._accountingInfo) === PaymentMethodType.AppStore;
		if (isIOSApp() || isAppStorePayment) return;
		const subscriptionPeriods = [
			{
				name: lang.get("pricing.yearly_label"),
				value: PaymentInterval.Yearly
			},
			{
				name: lang.get("pricing.monthly_label"),
				value: PaymentInterval.Monthly
			},
			{
				name: lang.get("loading_msg"),
				value: null,
				selectable: false
			}
		];
		const bonusMonths = this._lastBooking ? Number(this._lastBooking.bonusMonth) : 0;
		return [
			mithril_default(DropDownSelector, {
				label: "paymentInterval_label",
				helpLabel: () => this.getChargeDateText(),
				items: subscriptionPeriods,
				selectedValue: this._selectedSubscriptionInterval(),
				dropdownWidth: 300,
				selectionChangedHandler: (value) => {
					if (this._accountingInfo) showChangeSubscriptionIntervalDialog(this._accountingInfo, value, this._periodEndDate);
				}
			}),
			bonusMonths === 0 ? null : mithril_default(TextField, {
				label: "bonus_label",
				value: lang.get("bonusMonth_msg", { "{months}": bonusMonths }),
				isReadOnly: true
			}),
			mithril_default(TextField, {
				label: this._nextPeriodPriceVisible && this._periodEndDate ? lang.getTranslation("priceTill_label", { "{date}": formatDate(this._periodEndDate) }) : "price_label",
				value: this._currentPriceFieldValue(),
				oninput: this._currentPriceFieldValue,
				isReadOnly: true,
				helpLabel: () => this._customer && this._customer.businessUse === true ? lang.get("pricing.subscriptionPeriodInfoBusiness_msg") : null
			})
		];
	}
	renderAgreement() {
		return mithril_default(TextField, {
			label: "orderProcessingAgreement_label",
			helpLabel: () => lang.get("orderProcessingAgreementInfo_msg"),
			value: this._orderAgreementFieldValue(),
			oninput: this._orderAgreementFieldValue,
			isReadOnly: true,
			injectionsRight: () => {
				if (this._orderAgreement && this._customer && this._customer.orderProcessingAgreementNeeded) return [this.renderSignProcessingAgreementAction(), this.renderShowProcessingAgreementAction()];
else if (this._orderAgreement) return [this.renderShowProcessingAgreementAction()];
else if (this._customer && this._customer.orderProcessingAgreementNeeded) return [this.renderSignProcessingAgreementAction()];
else return [];
			}
		});
	}
	renderShowProcessingAgreementAction() {
		return mithril_default(IconButton, {
			title: "show_action",
			click: () => locator.entityClient.load(GroupInfoTypeRef, neverNull(this._orderAgreement).signerUserGroupInfo).then((signerUserGroupInfo) => showForViewing(neverNull(this._orderAgreement), signerUserGroupInfo)),
			icon: Icons.Download,
			size: ButtonSize.Compact
		});
	}
	renderSignProcessingAgreementAction() {
		return mithril_default(IconButton, {
			title: "sign_action",
			click: () => showForSigning(neverNull(this._customer), neverNull(this._accountingInfo)),
			icon: Icons.Edit,
			size: ButtonSize.Compact
		});
	}
	getChargeDateText() {
		if (this._periodEndDate) {
			const chargeDate = formatDate(incrementDate(new Date(this._periodEndDate), 1));
			return lang.get("nextChargeOn_label", { "{chargeDate}": chargeDate });
		} else return "";
	}
};
function _getAccountTypeName(type, subscription) {
	if (type === AccountType.PAID) return getDisplayNameOfPlanType(subscription);
else return AccountTypeNames[type];
}
function showChangeSubscriptionIntervalDialog(accountingInfo, paymentInterval, periodEndDate) {
	if (accountingInfo && accountingInfo.invoiceCountry && asPaymentInterval(accountingInfo.paymentInterval) !== paymentInterval) {
		const confirmationMessage = periodEndDate ? lang.getTranslation("subscriptionChangePeriod_msg", { "{1}": formatDate(periodEndDate) }) : "subscriptionChange_msg";
		Dialog.confirm(confirmationMessage).then(async (confirmed) => {
			if (confirmed) await locator.customerFacade.changePaymentInterval(accountingInfo, paymentInterval);
		});
	}
}
function renderGiftCardTable(giftCards, isPremiumPredicate) {
	const addButtonAttrs = {
		title: "buyGiftCard_label",
		click: createNotAvailableForFreeClickHandler(NewPaidPlans, () => showPurchaseGiftCardDialog(), isPremiumPredicate),
		icon: Icons.Add,
		size: ButtonSize.Compact
	};
	const columnHeading = ["purchaseDate_label", "value_label"];
	const columnWidths = [
		ColumnWidth.Largest,
		ColumnWidth.Small,
		ColumnWidth.Small
	];
	const lines = giftCards.filter((giftCard) => giftCard.status === GiftCardStatus.Usable).map((giftCard) => {
		return {
			cells: [formatDate(giftCard.orderDate), formatPrice(parseFloat(giftCard.value), true)],
			actionButtonAttrs: attachDropdown({
				mainButtonAttrs: {
					title: "options_action",
					icon: Icons.More,
					size: ButtonSize.Compact
				},
				childAttrs: () => [{
					label: "view_label",
					click: () => showGiftCardToShare(giftCard)
				}, {
					label: "edit_action",
					click: () => {
						let message = (0, import_stream$1.default)(giftCard.message);
						Dialog.showActionDialog({
							title: "editMessage_label",
							child: () => mithril_default(".flex-center", mithril_default(GiftCardMessageEditorField, {
								message: message(),
								onMessageChanged: message
							})),
							okAction: (dialog) => {
								giftCard.message = message();
								locator.entityClient.update(giftCard).then(() => dialog.close()).catch(() => Dialog.message("giftCardUpdateError_msg"));
								showGiftCardToShare(giftCard);
							},
							okActionTextId: "save_action",
							type: DialogType.EditSmall
						});
					}
				}]
			})
		};
	});
	return [mithril_default(Table, {
		addButtonAttrs,
		columnHeading,
		columnWidths,
		lines,
		showActionButtonColumn: true
	}), mithril_default(".small", renderTermsAndConditionsButton(TermsSection.GiftCards, CURRENT_GIFT_CARD_TERMS_VERSION))];
}

//#endregion
//#region src/common/subscription/SwitchSubscriptionDialog.ts
var import_stream = __toESM(require_stream(), 1);
async function showSwitchDialog(customer, customerInfo, accountingInfo, lastBooking, acceptedPlans, reason) {
	if (hasRunningAppStoreSubscription(accountingInfo) && !isIOSApp()) {
		await showManageThroughAppStoreDialog();
		return;
	}
	const [featureListProvider, priceAndConfigProvider] = await showProgressDialog("pleaseWait_msg", Promise.all([FeatureListProvider.getInitializedInstance(locator.domainConfigProvider().getCurrentDomainConfig()), PriceAndConfigProvider.getInitializedInstance(null, locator.serviceExecutor, null)]));
	const model = new SwitchSubscriptionDialogModel(customer, accountingInfo, await locator.logins.getUserController().getPlanType(), lastBooking);
	const cancelAction = () => {
		dialog.close();
	};
	const headerBarAttrs = {
		left: [{
			label: "cancel_action",
			click: cancelAction,
			type: ButtonType.Secondary
		}],
		right: [],
		middle: "subscription_label"
	};
	const currentPlanInfo = model.currentPlanInfo;
	const businessUse = (0, import_stream.default)(currentPlanInfo.businessUse);
	const paymentInterval = (0, import_stream.default)(PaymentInterval.Yearly);
	const multipleUsersAllowed = model.multipleUsersStillSupportedLegacy();
	const dialog = Dialog.largeDialog(headerBarAttrs, { view: () => mithril_default(".pt", mithril_default(SubscriptionSelector, {
		options: {
			businessUse,
			paymentInterval
		},
		priceInfoTextId: priceAndConfigProvider.getPriceInfoMessage(),
		msg: reason,
		boxWidth: 230,
		boxHeight: 270,
		acceptedPlans,
		currentPlanType: currentPlanInfo.planType,
		allowSwitchingPaymentInterval: currentPlanInfo.paymentInterval !== PaymentInterval.Yearly,
		actionButtons: subscriptionActionButtons,
		featureListProvider,
		priceAndConfigProvider,
		multipleUsersAllowed
	})) }).addShortcut({
		key: Keys.ESC,
		exec: cancelAction,
		help: "close_alt"
	}).setCloseHandler(cancelAction);
	const subscriptionActionButtons = {
		[PlanType.Free]: () => ({
			label: "pricing.select_action",
			onclick: () => onSwitchToFree(customer, dialog, currentPlanInfo)
		}),
		[PlanType.Revolutionary]: createPlanButton(dialog, PlanType.Revolutionary, currentPlanInfo, paymentInterval, accountingInfo),
		[PlanType.Legend]: createPlanButton(dialog, PlanType.Legend, currentPlanInfo, paymentInterval, accountingInfo),
		[PlanType.Essential]: createPlanButton(dialog, PlanType.Essential, currentPlanInfo, paymentInterval, accountingInfo),
		[PlanType.Advanced]: createPlanButton(dialog, PlanType.Advanced, currentPlanInfo, paymentInterval, accountingInfo),
		[PlanType.Unlimited]: createPlanButton(dialog, PlanType.Unlimited, currentPlanInfo, paymentInterval, accountingInfo)
	};
	dialog.show();
	return;
}
async function onSwitchToFree(customer, dialog, currentPlanInfo) {
	if (isIOSApp()) {
		const ownership = await locator.mobilePaymentsFacade.queryAppStoreSubscriptionOwnership(base64ToUint8Array(base64ExtToBase64(customer._id)));
		if (ownership === MobilePaymentSubscriptionOwnership.Owner && await locator.mobilePaymentsFacade.isAppStoreRenewalEnabled()) {
			await locator.mobilePaymentsFacade.showSubscriptionConfigView();
			await showProgressDialog("pleaseWait_msg", waitUntilRenewalDisabled());
			if (await locator.mobilePaymentsFacade.isAppStoreRenewalEnabled()) {
				console.log("AppStore renewal is still enabled, canceling downgrade");
				return;
			}
		}
	}
	const reason = await showLeavingUserSurveyWizard(true, true);
	const data = reason.submitted && reason.category && reason.reason ? createSurveyData({
		category: reason.category,
		reason: reason.reason,
		details: reason.details,
		version: SURVEY_VERSION_NUMBER
	}) : null;
	const newPlanType = await cancelSubscription(dialog, currentPlanInfo, customer, data);
	if (newPlanType === PlanType.Free) for (const importedMailSet of mailLocator.mailModel.getImportedMailSets()) mailLocator.mailModel.finallyDeleteCustomMailFolder(importedMailSet);
}
async function waitUntilRenewalDisabled() {
	for (let i = 0; i < 3; i++) {
		await delay(2e3);
		if (!await locator.mobilePaymentsFacade.isAppStoreRenewalEnabled()) return;
	}
}
async function doSwitchToPaidPlan(accountingInfo, newPaymentInterval, targetSubscription, dialog, currentPlanInfo) {
	if (isIOSApp() && getPaymentMethodType(accountingInfo) === PaymentMethodType.AppStore) {
		const customerIdBytes = base64ToUint8Array(base64ExtToBase64(assertNotNull(locator.logins.getUserController().user.customer)));
		dialog.close();
		try {
			await locator.mobilePaymentsFacade.requestSubscriptionToPlan(appStorePlanName(targetSubscription), newPaymentInterval, customerIdBytes);
		} catch (e) {
			if (e instanceof MobilePaymentError) {
				console.error("AppStore subscription failed", e);
				Dialog.message("appStoreSubscriptionError_msg", e.message);
			} else throw e;
		}
	} else {
		if (currentPlanInfo.paymentInterval !== newPaymentInterval) await locator.customerFacade.changePaymentInterval(accountingInfo, newPaymentInterval);
		await switchSubscription(targetSubscription, dialog, currentPlanInfo);
	}
}
function createPlanButton(dialog, targetSubscription, currentPlanInfo, newPaymentInterval, accountingInfo) {
	return () => ({
		label: "buy_action",
		onclick: async () => {
			if (LegacyPlans.includes(currentPlanInfo.planType) && !await Dialog.confirm(lang.getTranslation("upgradePlan_msg", { "{plan}": PlanTypeToName[targetSubscription] }))) return;
			await showProgressDialog("pleaseWait_msg", doSwitchToPaidPlan(accountingInfo, newPaymentInterval(), targetSubscription, dialog, currentPlanInfo));
		}
	});
}
function handleSwitchAccountPreconditionFailed(e) {
	const reason = e.data;
	if (reason == null) return Dialog.message("unknownError_msg");
else {
		let detailMsg;
		switch (reason) {
			case UnsubscribeFailureReason.TOO_MANY_ENABLED_USERS:
				detailMsg = lang.get("accountSwitchTooManyActiveUsers_msg");
				break;
			case UnsubscribeFailureReason.CUSTOM_MAIL_ADDRESS:
				detailMsg = lang.get("accountSwitchCustomMailAddress_msg");
				break;
			case UnsubscribeFailureReason.TOO_MANY_CALENDARS:
				detailMsg = lang.get("accountSwitchMultipleCalendars_msg");
				break;
			case UnsubscribeFailureReason.CALENDAR_TYPE:
				detailMsg = lang.get("accountSwitchSharedCalendar_msg");
				break;
			case UnsubscribeFailureReason.TOO_MANY_ALIASES:
			case BookingFailureReason.TOO_MANY_ALIASES:
				detailMsg = lang.get("accountSwitchAliases_msg");
				break;
			case UnsubscribeFailureReason.TOO_MUCH_STORAGE_USED:
			case BookingFailureReason.TOO_MUCH_STORAGE_USED:
				detailMsg = lang.get("storageCapacityTooManyUsedForBooking_msg");
				break;
			case UnsubscribeFailureReason.TOO_MANY_DOMAINS:
			case BookingFailureReason.TOO_MANY_DOMAINS:
				detailMsg = lang.get("tooManyCustomDomains_msg");
				break;
			case UnsubscribeFailureReason.HAS_TEMPLATE_GROUP:
			case BookingFailureReason.HAS_TEMPLATE_GROUP:
				detailMsg = lang.get("deleteTemplateGroups_msg");
				break;
			case UnsubscribeFailureReason.WHITELABEL_DOMAIN_ACTIVE:
			case BookingFailureReason.WHITELABEL_DOMAIN_ACTIVE:
				detailMsg = lang.get("whitelabelDomainExisting_msg");
				break;
			case UnsubscribeFailureReason.HAS_CONTACT_LIST_GROUP:
				detailMsg = lang.get("contactListExisting_msg");
				break;
			case UnsubscribeFailureReason.NOT_ENOUGH_CREDIT: return Dialog.message("insufficientBalanceError_msg");
			case UnsubscribeFailureReason.INVOICE_NOT_PAID: return Dialog.message("invoiceNotPaidSwitch_msg");
			case UnsubscribeFailureReason.ACTIVE_APPSTORE_SUBSCRIPTION: if (isIOSApp()) return locator.mobilePaymentsFacade.showSubscriptionConfigView();
else return showManageThroughAppStoreDialog();
			case UnsubscribeFailureReason.LABEL_LIMIT_EXCEEDED: return Dialog.message("labelLimitExceeded_msg");
			default: throw e;
		}
		return Dialog.message(lang.getTranslation("accountSwitchNotPossible_msg", { "{detailMsg}": detailMsg }));
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
		surveyData,
		app: client.isCalendarApp() ? SubscriptionApp.Calendar : SubscriptionApp.Mail
	});
	try {
		await locator.serviceExecutor.post(SwitchAccountTypeService, switchAccountTypeData);
		await locator.customerFacade.switchPremiumToFreeGroup();
		return PlanType.Free;
	} catch (e) {
		if (e instanceof PreconditionFailedError) await handleSwitchAccountPreconditionFailed(e);
else if (e instanceof InvalidDataError) await Dialog.message("accountSwitchTooManyActiveUsers_msg");
else if (e instanceof BadRequestError) await Dialog.message("deactivatePremiumWithCustomDomainError_msg");
else throw e;
		return currentPlanInfo.planType;
	}
}
async function cancelSubscription(dialog, currentPlanInfo, customer, surveyData = null) {
	const confirmCancelSubscription = Dialog.confirm("unsubscribeConfirm_msg", "ok_action", () => {
		return mithril_default(".pt", mithril_default("ul.usage-test-opt-in-bullets", [
			mithril_default("li", lang.get("importedMailsWillBeDeleted_label")),
			mithril_default("li", lang.get("accountWillBeDeactivatedIn6Month_label")),
			mithril_default("li", lang.get("accountWillHaveLessStorage_label"))
		]));
	});
	if (!await confirmCancelSubscription) return currentPlanInfo.planType;
	try {
		return await showProgressDialog("pleaseWait_msg", tryDowngradePremiumToFree(customer, currentPlanInfo, surveyData));
	} finally {
		dialog.close();
	}
}
async function switchSubscription(targetSubscription, dialog, currentPlanInfo) {
	if (targetSubscription === currentPlanInfo.planType) return currentPlanInfo.planType;
	const userController = locator.logins.getUserController();
	const customer = await userController.loadCustomer();
	if (!customer.businessUse && NewBusinessPlans.includes(downcast(targetSubscription))) {
		const accountingInfo = await userController.loadAccountingInfo();
		const invoiceData = {
			invoiceAddress: formatNameAndAddress(accountingInfo.invoiceName, accountingInfo.invoiceAddress),
			country: accountingInfo.invoiceCountry ? getByAbbreviation(accountingInfo.invoiceCountry) : null,
			vatNumber: accountingInfo.invoiceVatIdNo
		};
		const updatedInvoiceData = await showSwitchToBusinessInvoiceDataDialog(customer, invoiceData, accountingInfo);
		if (!updatedInvoiceData) return currentPlanInfo.planType;
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
			app: client.isCalendarApp() ? SubscriptionApp.Calendar : SubscriptionApp.Mail
		});
		try {
			await showProgressDialog("pleaseWait_msg", locator.serviceExecutor.post(SwitchAccountTypeService, postIn));
			return targetSubscription;
		} catch (e) {
			if (e instanceof PreconditionFailedError) {
				await handleSwitchAccountPreconditionFailed(e);
				return currentPlanInfo.planType;
			}
			throw e;
		}
	} finally {
		dialog.close();
	}
}

//#endregion
export { PaymentViewer, SelectMailAddressForm, SettingsExpander, SignupForm, SubscriptionViewer, loadSignupWizard, showSwitchDialog, showUpgradeWizard };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3dpdGNoU3Vic2NyaXB0aW9uRGlhbG9nLWNodW5rLmpzIiwibmFtZXMiOlsiQnVzaW5lc3NVc2VJdGVtczogU2VnbWVudENvbnRyb2xJdGVtPGJvb2xlYW4+W10iLCJhY3Rpb25CdXR0b25zOiBTdWJzY3JpcHRpb25BY3Rpb25CdXR0b25zIiwic3Vic2NyaXB0aW9uOiBBdmFpbGFibGVQbGFuVHlwZSIsInZub2RlOiBWbm9kZTxTdWJzY3JpcHRpb25TZWxlY3RvckF0dHI+IiwibXNnOiBNYXliZVRyYW5zbGF0aW9uIHwgbnVsbCIsImN1cnJlbnRQbGFuVHlwZTogUGxhblR5cGUgfCBudWxsIiwicHJpY2VJbmZvVGV4dElkOiBUcmFuc2xhdGlvbktleSB8IG51bGwiLCJpc0J1c2luZXNzOiBib29sZWFuIiwiaXNDeWJlck1vbmRheTogYm9vbGVhbiIsInRleHQ6IHN0cmluZyIsInN0eWxlPzogUmVjb3JkPHN0cmluZywgYW55PiIsImluTW9iaWxlVmlldzogYm9vbGVhbiIsImFkZGl0aW9uYWxJbmZvOiBDaGlsZHJlbiIsInBsYW5zOiBBdmFpbGFibGVQbGFuVHlwZVtdIiwic2lnbnVwIiwidm5vZGUiLCJhdHRyczogU3Vic2NyaXB0aW9uU2VsZWN0b3JBdHRyIiwicGxhblR5cGU6IEF2YWlsYWJsZVBsYW5UeXBlIiwicmVuZGVyQ2F0ZWdvcnlUaXRsZTogYm9vbGVhbiIsImZlYXR1cmVFeHBhbmRlcjogUmVjb3JkPEV4cGFuZGVyVGFyZ2V0cywgQ2hpbGRyZW4+Iiwic2VsZWN0b3JBdHRyczogU3Vic2NyaXB0aW9uU2VsZWN0b3JBdHRyIiwidGFyZ2V0U3Vic2NyaXB0aW9uOiBBdmFpbGFibGVQbGFuVHlwZSIsIm1vYmlsZTogYm9vbGVhbiIsInByaWNlU3RyOiBzdHJpbmciLCJyZWZlcmVuY2VQcmljZVN0cjogc3RyaW5nIHwgdW5kZWZpbmVkIiwicHJpY2VUeXBlOiBQcmljZVR5cGUiLCJpbk1vYmlsZVZpZXc6IGJvb2xlYW4gfCBudWxsIiwiZmVhdHVyZUxpc3RQcm92aWRlcjogRmVhdHVyZUxpc3RQcm92aWRlciIsInN1YlR5cGU6IEV4cGFuZGVyVGFyZ2V0cyIsIml0ZW06IEZlYXR1cmVMaXN0SXRlbSIsInRhcmdldFN1YnNjcmlwdGlvbjogUGxhblR5cGUiLCJjYXRlZ29yeTogRmVhdHVyZUNhdGVnb3J5Iiwia2V5OiBUcmFuc2xhdGlvbktleSIsInJlcGxhY2VtZW50cz86IFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IG51bWJlcj4iLCJrZXk6IFJlcGxhY2VtZW50S2V5IHwgdW5kZWZpbmVkIiwic3Vic2NyaXB0aW9uOiBQbGFuVHlwZSIsInBsYW5UeXBlOiBQbGFuVHlwZSIsImJ1c2luZXNzVXNlOiBib29sZWFuIiwic3Vic2NyaXB0aW9uUHJpY2U6IG51bWJlciIsIm11bHRpdXNlcjogYm9vbGVhbiIsImN1c3RvbWVyOiBDdXN0b21lciIsImFjY291bnRpbmdJbmZvOiBBY2NvdW50aW5nSW5mbyIsInBsYW5UeXBlOiBQbGFuVHlwZSIsImxhc3RCb29raW5nOiBCb29raW5nIiwicGF5bWVudEludGVydmFsOiBQYXltZW50SW50ZXJ2YWwiLCJidXNpbmVzc1VzZTogYm9vbGVhbiIsImludm9pY2VEYXRhOiBJbnZvaWNlRGF0YSIsImxvY2F0aW9uOiBMb2NhdGlvblNlcnZpY2VHZXRSZXR1cm4iLCJkb21JbnB1dDogSFRNTElucHV0RWxlbWVudCIsInZub2RlOiBWbm9kZTxTaW1wbGlmaWVkQ3JlZGl0Q2FyZEF0dHJzPiIsIm1vZGVsOiBTaW1wbGlmaWVkQ3JlZGl0Q2FyZFZpZXdNb2RlbCIsImNjOiBzdHJpbmciLCJDYXJkUHJlZml4UmFuZ2VzOiBSZWNvcmQ8Q2FyZFR5cGUsIE51bWJlclN0cmluZ1tdW10+Iiwiczogc3RyaW5nIiwiZm46IFN0cmluZ0lucHV0Q29ycmVjdGVyIiwidjogc3RyaW5nIiwib3Y6IHN0cmluZyIsInJlc3Q6IHN0cmluZyIsInJldDogc3RyaW5nIiwibGVuZ3RoOiBudW1iZXIiLCJ2YWx1ZTogc3RyaW5nIiwib2xkRGF0ZTogc3RyaW5nIiwiZ3JvdXBzOiBudW1iZXJbXSIsImV4cGlyYXRpb25EYXRlOiBzdHJpbmciLCJsYW5nOiBMYW5ndWFnZVZpZXdNb2RlbCIsIm51bWJlcjogc3RyaW5nIiwiY3Z2OiBzdHJpbmciLCJkYXRhOiBDcmVkaXRDYXJkIHwgbnVsbCIsInN1YnNjcmlwdGlvbk9wdGlvbnM6IFNlbGVjdGVkU3Vic2NyaXB0aW9uT3B0aW9ucyIsInNlbGVjdGVkQ291bnRyeTogU3RyZWFtPENvdW50cnkgfCBudWxsPiIsImFjY291bnRpbmdJbmZvOiBBY2NvdW50aW5nSW5mbyIsInBheVBhbFJlcXVlc3RVcmw6IExhenlMb2FkZWQ8c3RyaW5nPiIsImRlZmF1bHRQYXltZW50TWV0aG9kOiBQYXltZW50TWV0aG9kVHlwZSIsImFjY291bnRpbmdJbmZvIiwidmFsdWU6IFBheW1lbnRNZXRob2RUeXBlIiwicGF5bWVudERhdGE/OiBQYXltZW50RGF0YSIsInZub2RlOiBWbm9kZTxQYXlwYWxBdHRycz4iLCJ2bm9kZTogVm5vZGU8V2l6YXJkUGFnZUF0dHJzPFVwZ3JhZGVTdWJzY3JpcHRpb25EYXRhPj4iLCJ2bm9kZTogVm5vZGVET008V2l6YXJkUGFnZUF0dHJzPFVwZ3JhZGVTdWJzY3JpcHRpb25EYXRhPj4iLCJsb2dpbjogUHJvbWlzZTxDcmVkZW50aWFscyB8IG51bGw+IiwiZGVmYXVsdFBheW1lbnRNZXRob2Q6IFBheW1lbnRNZXRob2RUeXBlIiwidXBncmFkZURhdGE6IFVwZ3JhZGVTdWJzY3JpcHRpb25EYXRhIiwic2hvd0Vycm9yRGlhbG9nOiBib29sZWFuIiwiZW5hYmxlZDogKCkgPT4gYm9vbGVhbiIsInBheW1lbnRJbnRlcnZhbDogUGF5bWVudEludGVydmFsIiwiaW52b2ljZURhdGE6IEludm9pY2VEYXRhIiwicGF5bWVudERhdGE6IFBheW1lbnREYXRhIHwgbnVsbCIsImNvbmZpcm1lZENvdW50cnk6IENvdW50cnkgfCBudWxsIiwiaXNTaWdudXA6IGJvb2xlYW4iLCJwcmljZTogc3RyaW5nIHwgbnVsbCIsImFjY291bnRpbmdJbmZvOiBBY2NvdW50aW5nSW5mbyIsImJyYWludHJlZTNkczogQnJhaW50cmVlM2RzMlJlcXVlc3QiLCJwcmljZTogc3RyaW5nIiwicmVzb2x2ZTogKGFyZzA6IGJvb2xlYW4pID0+IHZvaWQiLCJwcm9ncmVzc0RpYWxvZ1Byb21pc2U6IFByb21pc2U8Ym9vbGVhbj4iLCJwcm9ncmVzc0RpYWxvZzogRGlhbG9nIiwiZW50aXR5RXZlbnRMaXN0ZW5lcjogRW50aXR5RXZlbnRzTGlzdGVuZXIiLCJ1cGRhdGVzOiBSZWFkb25seUFycmF5PEVudGl0eVVwZGF0ZURhdGE+IiwiZXZlbnRPd25lckdyb3VwSWQ6IElkIiwiaW52b2ljZUluZm8iLCJjdXN0b21lcjogQ3VzdG9tZXIiLCJpbnZvaWNlRGF0YTogSW52b2ljZURhdGEiLCJhY2NvdW50aW5nSW5mbzogQWNjb3VudGluZ0luZm8iLCJzaG93IiwiYnVzaW5lc3NVc2U6IGJvb2xlYW4iLCJpbnZvaWNlRGF0YTogSW52b2ljZURhdGEiLCJhY2NvdW50aW5nSW5mbzogQWNjb3VudGluZ0luZm8iLCJoZWFkaW5nSWQ/OiBUcmFuc2xhdGlvbktleSIsImluZm9NZXNzYWdlSWQ/OiBUcmFuc2xhdGlvbktleSIsImN1c3RvbWVyOiBDdXN0b21lciIsImFjY291bnRpbmdJbmZvOiBBY2NvdW50aW5nSW5mbyIsInByaWNlOiBudW1iZXIiLCJkZWZhdWx0UGF5bWVudE1ldGhvZDogUGF5bWVudE1ldGhvZFR5cGUiLCJ2YWx1ZTogUGF5bWVudE1ldGhvZFR5cGUiLCJzdWNjZXNzOiBib29sZWFuIiwiQ3VzdG9tZXJBY2NvdW50UG9zdGluZ1R5cGVSZWY6IFR5cGVSZWY8Q3VzdG9tZXJBY2NvdW50UG9zdGluZz4iLCJDdXN0b21lckFjY291bnRSZXR1cm5UeXBlUmVmOiBUeXBlUmVmPEN1c3RvbWVyQWNjb3VudFJldHVybj4iLCJlOiBNb3VzZUV2ZW50IiwiZG9tOiBIVE1MRWxlbWVudCIsImN1cnJlbnRQYXltZW50TWV0aG9kOiBQYXltZW50TWV0aG9kVHlwZSB8IG51bGwiLCJwb3N0aW5nOiBDdXN0b21lckFjY291bnRQb3N0aW5nIiwiYWNjb3VudGluZ0luZm86IEFjY291bnRpbmdJbmZvIiwidXBkYXRlczogUmVhZG9ubHlBcnJheTxFbnRpdHlVcGRhdGVEYXRhPiIsInVwZGF0ZTogRW50aXR5VXBkYXRlRGF0YSIsIm9wZW5CYWxhbmNlOiBudW1iZXIiLCJlcnJvcklkOiBUcmFuc2xhdGlvbktleVR5cGUgfCB2b2lkIiwicHJpY2U6IG51bWJlciIsImRpYWxvZzogRGlhbG9nIiwicmVzOiBib29sZWFuIiwiYWN0aW9uQmFyQXR0cnM6IERpYWxvZ0hlYWRlckJhckF0dHJzIiwidm5vZGU6IFZub2RlRE9NPFdpemFyZFBhZ2VBdHRyczxVcGdyYWRlU3Vic2NyaXB0aW9uRGF0YT4+IiwicGF5bWVudEludGVydmFsOiBQYXltZW50SW50ZXJ2YWwiLCJ2bm9kZTogVm5vZGU8V2l6YXJkUGFnZUF0dHJzPFVwZ3JhZGVTdWJzY3JpcHRpb25EYXRhPj4iLCJzdWJzY3JpcHRpb25BY3Rpb25CdXR0b25zOiBTdWJzY3JpcHRpb25BY3Rpb25CdXR0b25zIiwiZGF0YTogVXBncmFkZVN1YnNjcmlwdGlvbkRhdGEiLCJzdWJzY3JpcHRpb25QYXJhbWV0ZXJzOiBTdWJzY3JpcHRpb25QYXJhbWV0ZXJzIiwic3Vic2NyaXB0aW9uVHlwZTogU3Vic2NyaXB0aW9uVHlwZSB8IG51bGwiLCJwbGFuVHlwZTogUGxhblR5cGUiLCJkaWFsb2c6IERpYWxvZyIsImNvbmZpcm1lZDogYm9vbGVhbiIsInVwZ3JhZGVEYXRhOiBVcGdyYWRlU3Vic2NyaXB0aW9uRGF0YSIsInNob3dFcnJvckRpYWxvZzogYm9vbGVhbiIsInZub2RlOiBWbm9kZURPTTxXaXphcmRQYWdlQXR0cnM8VXBncmFkZVN1YnNjcmlwdGlvbkRhdGE+PiIsImRhdGE6IFVwZ3JhZGVTdWJzY3JpcHRpb25EYXRhIiwiZG9tOiBIVE1MRWxlbWVudCIsInVwZ3JhZGVEYXRhOiBVcGdyYWRlU3Vic2NyaXB0aW9uRGF0YSIsInNob3dEaWFsb2dzOiBib29sZWFuIiwidm5vZGU6IFZub2RlPFNlbGVjdE1haWxBZGRyZXNzRm9ybUF0dHJzPiIsImF0dHJzOiBTZWxlY3RNYWlsQWRkcmVzc0Zvcm1BdHRycyIsImRvbWFpbkRhdGE6IEVtYWlsRG9tYWluRGF0YSIsImlzQnVzeTogYm9vbGVhbiIsIm9uQnVzeVN0YXRlQ2hhbmdlZDogKGFyZzA6IGJvb2xlYW4pID0+IHVua25vd24iLCJlbWFpbDogc3RyaW5nIiwidmFsaWRhdGlvblJlc3VsdDogVmFsaWRhdGlvblJlc3VsdCIsIm9uVmFsaWRhdGlvblJlc3VsdDogU2VsZWN0TWFpbEFkZHJlc3NGb3JtQXR0cnNbXCJvblZhbGlkYXRpb25SZXN1bHRcIl0iLCJyZXN1bHQ6IFZhbGlkYXRpb25SZXN1bHQiLCJjYXB0Y2hhSW5wdXQ6IHN0cmluZyIsIm1haWxBZGRyZXNzOiBzdHJpbmciLCJpc0J1c2luZXNzVXNlOiBib29sZWFuIiwiaXNQYWlkU3Vic2NyaXB0aW9uOiBib29sZWFuIiwiY2FtcGFpZ25Ub2tlbjogc3RyaW5nIHwgbnVsbCIsImNoYWxsZW5nZTogVWludDhBcnJheSIsInRva2VuOiBzdHJpbmciLCJkaWFsb2c6IERpYWxvZyIsImFjdGlvbkJhckF0dHJzOiBEaWFsb2dIZWFkZXJCYXJBdHRycyIsInZub2RlOiBWbm9kZTxTaWdudXBGb3JtQXR0cnM+IiwibWFpbEFkZHJlc3NGb3JtQXR0cnM6IFNlbGVjdE1haWxBZGRyZXNzRm9ybUF0dHJzIiwiY29uZmlybVRlcm1zQ2hlY2tCb3hBdHRyczogQ2hlY2tib3hBdHRycyIsImNvbmZpcm1BZ2VDaGVja0JveEF0dHJzOiBDaGVja2JveEF0dHJzIiwibWFpbEFkZHJlc3M6IHN0cmluZyIsInB3OiBzdHJpbmciLCJyZWdpc3RyYXRpb25Db2RlOiBzdHJpbmciLCJpc0J1c2luZXNzVXNlOiBib29sZWFuIiwiaXNQYWlkU3Vic2NyaXB0aW9uOiBib29sZWFuIiwiY2FtcGFpZ246IHN0cmluZyB8IG51bGwiLCJ2bm9kZTogVm5vZGVET008V2l6YXJkUGFnZUF0dHJzPFVwZ3JhZGVTdWJzY3JpcHRpb25EYXRhPj4iLCJ2bm9kZTogVm5vZGU8V2l6YXJkUGFnZUF0dHJzPFVwZ3JhZGVTdWJzY3JpcHRpb25EYXRhPj4iLCJtYWlsQWRkcmVzczogdW5kZWZpbmVkIHwgc3RyaW5nIiwibmV3QWNjb3VudERhdGEiLCJzaWdudXBEYXRhOiBVcGdyYWRlU3Vic2NyaXB0aW9uRGF0YSIsInNob3dFcnJvckRpYWxvZzogYm9vbGVhbiIsInZub2RlOiBWbm9kZURPTTxXaXphcmRQYWdlQXR0cnM8VXBncmFkZVN1YnNjcmlwdGlvbkRhdGE+PiIsImRhdGE6IFVwZ3JhZGVTdWJzY3JpcHRpb25EYXRhIiwiYXR0cnM6IFdpemFyZFBhZ2VBdHRyczxVcGdyYWRlU3Vic2NyaXB0aW9uRGF0YT4iLCJkb206IEhUTUxFbGVtZW50IiwicHJpY2U6IHN0cmluZyIsIm9wdGlvbnM6IFNlbGVjdGVkU3Vic2NyaXB0aW9uT3B0aW9ucyIsImxvZ2luczogTG9naW5Db250cm9sbGVyIiwiYWNjZXB0ZWRQbGFuczogQXZhaWxhYmxlUGxhblR5cGVbXSIsIm1zZz86IE1heWJlVHJhbnNsYXRpb24iLCJ1cGdyYWRlRGF0YTogVXBncmFkZVN1YnNjcmlwdGlvbkRhdGEiLCJzdWJzY3JpcHRpb25QYXJhbWV0ZXJzOiBTdWJzY3JpcHRpb25QYXJhbWV0ZXJzIHwgbnVsbCIsInJlZ2lzdHJhdGlvbkRhdGFJZDogc3RyaW5nIHwgbnVsbCIsInJlZmVycmFsQ29kZTogc3RyaW5nIHwgbnVsbCIsIm1lc3NhZ2U6IE1heWJlVHJhbnNsYXRpb24gfCBudWxsIiwic2lnbnVwRGF0YTogVXBncmFkZVN1YnNjcmlwdGlvbkRhdGEiLCJjdXN0b21lcjogQ3VzdG9tZXIiLCJhY2NvdW50aW5nSW5mbzogQWNjb3VudGluZ0luZm8iLCJkaWFsb2c6IERpYWxvZyIsImVsZW06IEhUTUxFbGVtZW50IHwgbnVsbCIsImFncmVlbWVudDogT3JkZXJQcm9jZXNzaW5nQWdyZWVtZW50Iiwic2lnbmVyVXNlckdyb3VwSW5mbzogR3JvdXBJbmZvIiwidm5vZGU6IFZub2RlPFNldHRpbmdzRXhwYW5kZXJBdHRycz4iLCJjdXJyZW50UGxhblR5cGU6IFBsYW5UeXBlIiwibW9iaWxlUGF5bWVudHNGYWNhZGU6IE1vYmlsZVBheW1lbnRzRmFjYWRlIHwgbnVsbCIsImFjY291bnRpbmdJbmZvOiBBY2NvdW50aW5nSW5mbyIsIm93bmVyc2hpcDogTW9iaWxlUGF5bWVudFN1YnNjcmlwdGlvbk93bmVyc2hpcCIsImFwcDogU3Vic2NyaXB0aW9uQXBwIiwib3BlbjogYm9vbGVhbiIsImFwcDogQXBwVHlwZS5NYWlsIHwgQXBwVHlwZS5DYWxlbmRhciIsImN1c3RvbWVyOiBDdXN0b21lciIsImFjY291bnRUeXBlOiBBY2NvdW50VHlwZSIsImN1c3RvbWVySW5mbzogQ3VzdG9tZXJJbmZvIiwicGxhbkNvbmZpZzogUGxhbkNvbmZpZ3VyYXRpb24iLCJ1cGRhdGVzOiBSZWFkb25seUFycmF5PEVudGl0eVVwZGF0ZURhdGE+IiwidXBkYXRlOiBFbnRpdHlVcGRhdGVEYXRhIiwic3Vic2NyaXB0aW9uUGVyaW9kczogU2VsZWN0b3JJdGVtTGlzdDxQYXltZW50SW50ZXJ2YWwgfCBudWxsPiIsInZhbHVlOiBudW1iZXIiLCJ0eXBlOiBBY2NvdW50VHlwZSIsInN1YnNjcmlwdGlvbjogUGxhblR5cGUiLCJwYXltZW50SW50ZXJ2YWw6IFBheW1lbnRJbnRlcnZhbCIsInBlcmlvZEVuZERhdGU6IERhdGUgfCBudWxsIiwiZ2lmdENhcmRzOiBHaWZ0Q2FyZFtdIiwiaXNQcmVtaXVtUHJlZGljYXRlOiAoKSA9PiBib29sZWFuIiwiYWRkQnV0dG9uQXR0cnM6IEljb25CdXR0b25BdHRycyIsImNvbHVtbkhlYWRpbmc6IFtUcmFuc2xhdGlvbktleSwgVHJhbnNsYXRpb25LZXldIiwiZGlhbG9nOiBEaWFsb2ciLCJjdXN0b21lcjogQ3VzdG9tZXIiLCJjdXN0b21lckluZm86IEN1c3RvbWVySW5mbyIsImFjY291bnRpbmdJbmZvOiBBY2NvdW50aW5nSW5mbyIsImxhc3RCb29raW5nOiBCb29raW5nIiwiYWNjZXB0ZWRQbGFuczogQXZhaWxhYmxlUGxhblR5cGVbXSIsInJlYXNvbjogTWF5YmVUcmFuc2xhdGlvbiB8IG51bGwiLCJoZWFkZXJCYXJBdHRyczogRGlhbG9nSGVhZGVyQmFyQXR0cnMiLCJkaWFsb2c6IERpYWxvZyIsInN1YnNjcmlwdGlvbkFjdGlvbkJ1dHRvbnM6IFN1YnNjcmlwdGlvbkFjdGlvbkJ1dHRvbnMiLCJjdXJyZW50UGxhbkluZm86IEN1cnJlbnRQbGFuSW5mbyIsIm5ld1BheW1lbnRJbnRlcnZhbDogUGF5bWVudEludGVydmFsIiwidGFyZ2V0U3Vic2NyaXB0aW9uOiBQbGFuVHlwZSIsIm5ld1BheW1lbnRJbnRlcnZhbDogc3RyZWFtPFBheW1lbnRJbnRlcnZhbD4iLCJlOiBQcmVjb25kaXRpb25GYWlsZWRFcnJvciIsImRldGFpbE1zZzogc3RyaW5nIiwic3VydmV5RGF0YTogU3VydmV5RGF0YSB8IG51bGwiLCJpbnZvaWNlRGF0YTogSW52b2ljZURhdGEiXSwic291cmNlcyI6WyIuLi9zcmMvY29tbW9uL3N1YnNjcmlwdGlvbi9TdWJzY3JpcHRpb25TZWxlY3Rvci50cyIsIi4uL3NyYy9jb21tb24vc3Vic2NyaXB0aW9uL1N3aXRjaFN1YnNjcmlwdGlvbkRpYWxvZ01vZGVsLnRzIiwiLi4vc3JjL2NvbW1vbi9zdWJzY3JpcHRpb24vSW52b2ljZURhdGFJbnB1dC50cyIsIi4uL3NyYy9jb21tb24vc3Vic2NyaXB0aW9uL1NpbXBsaWZpZWRDcmVkaXRDYXJkSW5wdXQudHMiLCIuLi9zcmMvY29tbW9uL3N1YnNjcmlwdGlvbi9TaW1wbGlmaWVkQ3JlZGl0Q2FyZElucHV0TW9kZWwudHMiLCIuLi9zcmMvY29tbW9uL3N1YnNjcmlwdGlvbi9QYXltZW50TWV0aG9kSW5wdXQudHMiLCIuLi9zcmMvY29tbW9uL3N1YnNjcmlwdGlvbi9JbnZvaWNlQW5kUGF5bWVudERhdGFQYWdlLnRzIiwiLi4vc3JjL2NvbW1vbi9zdWJzY3JpcHRpb24vU3dpdGNoVG9CdXNpbmVzc0ludm9pY2VEYXRhRGlhbG9nLnRzIiwiLi4vc3JjL2NvbW1vbi9uYXRpdmUvY29tbW9uL2dlbmVyYXRlZGlwYy9Nb2JpbGVQYXltZW50U3Vic2NyaXB0aW9uT3duZXJzaGlwLnRzIiwiLi4vc3JjL2NvbW1vbi9zdWJzY3JpcHRpb24vSW52b2ljZURhdGFEaWFsb2cudHMiLCIuLi9zcmMvY29tbW9uL3N1YnNjcmlwdGlvbi9QYXltZW50RGF0YURpYWxvZy50cyIsIi4uL3NyYy9jb21tb24vYXBpL2VudGl0aWVzL2FjY291bnRpbmcvVHlwZVJlZnMudHMiLCIuLi9zcmMvY29tbW9uL2FwaS9lbnRpdGllcy9hY2NvdW50aW5nL1NlcnZpY2VzLnRzIiwiLi4vc3JjL2NvbW1vbi9zdWJzY3JpcHRpb24vUGF5bWVudFZpZXdlci50cyIsIi4uL3NyYy9jb21tb24vc3Vic2NyaXB0aW9uL1VwZ3JhZGVTdWJzY3JpcHRpb25QYWdlLnRzIiwiLi4vc3JjL2NvbW1vbi9zdWJzY3JpcHRpb24vVXBncmFkZUNvbmdyYXR1bGF0aW9uc1BhZ2UudHMiLCIuLi9zcmMvY29tbW9uL3NldHRpbmdzL1NlbGVjdE1haWxBZGRyZXNzRm9ybS50cyIsIi4uL3NyYy9jb21tb24vc3Vic2NyaXB0aW9uL0NhcHRjaGEudHMiLCIuLi9zcmMvY29tbW9uL3N1YnNjcmlwdGlvbi9TaWdudXBGb3JtLnRzIiwiLi4vc3JjL2NvbW1vbi9zdWJzY3JpcHRpb24vU2lnbnVwUGFnZS50cyIsIi4uL3NyYy9jb21tb24vbmF0aXZlL2NvbW1vbi9nZW5lcmF0ZWRpcGMvTW9iaWxlUGF5bWVudFJlc3VsdFR5cGUudHMiLCIuLi9zcmMvY29tbW9uL3N1YnNjcmlwdGlvbi9VcGdyYWRlQ29uZmlybVN1YnNjcmlwdGlvblBhZ2UudHMiLCIuLi9zcmMvY29tbW9uL3N1YnNjcmlwdGlvbi9VcGdyYWRlU3Vic2NyaXB0aW9uV2l6YXJkLnRzIiwiLi4vc3JjL2NvbW1vbi9zdWJzY3JpcHRpb24vU2lnbk9yZGVyUHJvY2Vzc2luZ0FncmVlbWVudERpYWxvZy50cyIsIi4uL3NyYy9jb21tb24vc2V0dGluZ3MvU2V0dGluZ3NFeHBhbmRlci50cyIsIi4uL3NyYy9jb21tb24vc3Vic2NyaXB0aW9uL1N1YnNjcmlwdGlvblZpZXdlci50cyIsIi4uL3NyYy9jb21tb24vc3Vic2NyaXB0aW9uL1N3aXRjaFN1YnNjcmlwdGlvbkRpYWxvZy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbSwgeyBDaGlsZHJlbiwgQ29tcG9uZW50LCBWbm9kZSB9IGZyb20gXCJtaXRocmlsXCJcbmltcG9ydCB0eXBlIHsgTWF5YmVUcmFuc2xhdGlvbiwgVHJhbnNsYXRpb25LZXkgfSBmcm9tIFwiLi4vbWlzYy9MYW5ndWFnZVZpZXdNb2RlbFwiXG5pbXBvcnQgeyBsYW5nIH0gZnJvbSBcIi4uL21pc2MvTGFuZ3VhZ2VWaWV3TW9kZWxcIlxuaW1wb3J0IHR5cGUgeyBCdXlPcHRpb25Cb3hBdHRyLCBCdXlPcHRpb25EZXRhaWxzQXR0ciB9IGZyb20gXCIuL0J1eU9wdGlvbkJveFwiXG5pbXBvcnQgeyBCT1hfTUFSR0lOLCBCdXlPcHRpb25Cb3gsIEJ1eU9wdGlvbkRldGFpbHMsIGdldEFjdGl2ZVN1YnNjcmlwdGlvbkFjdGlvbkJ1dHRvblJlcGxhY2VtZW50IH0gZnJvbSBcIi4vQnV5T3B0aW9uQm94XCJcbmltcG9ydCB0eXBlIHsgU2VnbWVudENvbnRyb2xJdGVtIH0gZnJvbSBcIi4uL2d1aS9iYXNlL1NlZ21lbnRDb250cm9sXCJcbmltcG9ydCB7IFNlZ21lbnRDb250cm9sIH0gZnJvbSBcIi4uL2d1aS9iYXNlL1NlZ21lbnRDb250cm9sXCJcbmltcG9ydCB7IGZvcm1hdE1vbnRobHlQcmljZSwgUGF5bWVudEludGVydmFsLCBQcmljZUFuZENvbmZpZ1Byb3ZpZGVyLCBQcmljZVR5cGUgfSBmcm9tIFwiLi9QcmljZVV0aWxzXCJcbmltcG9ydCB7XG5cdEZlYXR1cmVDYXRlZ29yeSxcblx0RmVhdHVyZUxpc3RJdGVtLFxuXHRGZWF0dXJlTGlzdFByb3ZpZGVyLFxuXHRnZXREaXNwbGF5TmFtZU9mUGxhblR5cGUsXG5cdFJlcGxhY2VtZW50S2V5LFxuXHRTZWxlY3RlZFN1YnNjcmlwdGlvbk9wdGlvbnMsXG5cdFVwZ3JhZGVQcmljZVR5cGUsXG59IGZyb20gXCIuL0ZlYXR1cmVMaXN0UHJvdmlkZXJcIlxuaW1wb3J0IHsgUHJvZ3JhbW1pbmdFcnJvciB9IGZyb20gXCIuLi9hcGkvY29tbW9uL2Vycm9yL1Byb2dyYW1taW5nRXJyb3JcIlxuaW1wb3J0IHsgQnV0dG9uLCBCdXR0b25UeXBlIH0gZnJvbSBcIi4uL2d1aS9iYXNlL0J1dHRvbi5qc1wiXG5pbXBvcnQgeyBkb3duY2FzdCwgbGF6eSwgTkJTUCB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHtcblx0QXZhaWxhYmxlUGxhblR5cGUsXG5cdENvbnN0LFxuXHRDdXN0b21Eb21haW5UeXBlLFxuXHRDdXN0b21Eb21haW5UeXBlQ291bnROYW1lLFxuXHRIaWdobGlnaHRlZFBsYW5zLFxuXHRMZWdhY3lQbGFucyxcblx0TmV3QnVzaW5lc3NQbGFucyxcblx0TmV3UGVyc29uYWxQbGFucyxcblx0UGxhblR5cGUsXG5cdFBsYW5UeXBlVG9OYW1lLFxufSBmcm9tIFwiLi4vYXBpL2NvbW1vbi9UdXRhbm90YUNvbnN0YW50cy5qc1wiXG5pbXBvcnQgeyBweCB9IGZyb20gXCIuLi9ndWkvc2l6ZS5qc1wiXG5pbXBvcnQgeyBMb2dpbkJ1dHRvbiwgTG9naW5CdXR0b25BdHRycyB9IGZyb20gXCIuLi9ndWkvYmFzZS9idXR0b25zL0xvZ2luQnV0dG9uLmpzXCJcbmltcG9ydCB7IGlzSU9TQXBwIH0gZnJvbSBcIi4uL2FwaS9jb21tb24vRW52XCJcbmltcG9ydCB7IGlzUmVmZXJlbmNlRGF0ZVdpdGhpbkN5YmVyTW9uZGF5Q2FtcGFpZ24gfSBmcm9tIFwiLi4vbWlzYy9DeWJlck1vbmRheVV0aWxzLmpzXCJcbmltcG9ydCB7IHRoZW1lIH0gZnJvbSBcIi4uL2d1aS90aGVtZS5qc1wiXG5cbmNvbnN0IEJ1c2luZXNzVXNlSXRlbXM6IFNlZ21lbnRDb250cm9sSXRlbTxib29sZWFuPltdID0gW1xuXHR7XG5cdFx0bmFtZTogbGFuZy5nZXQoXCJwcmljaW5nLnByaXZhdGVVc2VfbGFiZWxcIiksXG5cdFx0dmFsdWU6IGZhbHNlLFxuXHR9LFxuXHR7XG5cdFx0bmFtZTogbGFuZy5nZXQoXCJwcmljaW5nLmJ1c2luZXNzVXNlX2xhYmVsXCIpLFxuXHRcdHZhbHVlOiB0cnVlLFxuXHR9LFxuXVxuXG5leHBvcnQgdHlwZSBTdWJzY3JpcHRpb25BY3Rpb25CdXR0b25zID0gUmVjb3JkPEF2YWlsYWJsZVBsYW5UeXBlLCBsYXp5PExvZ2luQnV0dG9uQXR0cnM+PlxuXG5leHBvcnQgdHlwZSBTdWJzY3JpcHRpb25TZWxlY3RvckF0dHIgPSB7XG5cdG9wdGlvbnM6IFNlbGVjdGVkU3Vic2NyaXB0aW9uT3B0aW9uc1xuXHRwcmljZUluZm9UZXh0SWQ6IFRyYW5zbGF0aW9uS2V5IHwgbnVsbFxuXHRhY3Rpb25CdXR0b25zOiBTdWJzY3JpcHRpb25BY3Rpb25CdXR0b25zXG5cdGJveFdpZHRoOiBudW1iZXJcblx0Ym94SGVpZ2h0OiBudW1iZXJcblx0Y3VycmVudFBsYW5UeXBlOiBQbGFuVHlwZSB8IG51bGxcblx0YWxsb3dTd2l0Y2hpbmdQYXltZW50SW50ZXJ2YWw6IGJvb2xlYW5cblx0ZmVhdHVyZUxpc3RQcm92aWRlcjogRmVhdHVyZUxpc3RQcm92aWRlclxuXHRwcmljZUFuZENvbmZpZ1Byb3ZpZGVyOiBQcmljZUFuZENvbmZpZ1Byb3ZpZGVyXG5cdGFjY2VwdGVkUGxhbnM6IEF2YWlsYWJsZVBsYW5UeXBlW11cblx0bXVsdGlwbGVVc2Vyc0FsbG93ZWQ6IGJvb2xlYW5cblx0bXNnOiBNYXliZVRyYW5zbGF0aW9uIHwgbnVsbFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWN0aW9uQnV0dG9uQnlTdWJzY3JpcHRpb24oYWN0aW9uQnV0dG9uczogU3Vic2NyaXB0aW9uQWN0aW9uQnV0dG9ucywgc3Vic2NyaXB0aW9uOiBBdmFpbGFibGVQbGFuVHlwZSk6IGxhenk8Q2hpbGRyZW4+IHtcblx0Y29uc3QgcmV0ID0gYWN0aW9uQnV0dG9uc1tzdWJzY3JpcHRpb25dXG5cdGlmIChyZXQgPT0gbnVsbCkge1xuXHRcdHRocm93IG5ldyBQcm9ncmFtbWluZ0Vycm9yKFwiUGxhbiBpcyBub3QgdmFsaWRcIilcblx0fVxuXHRyZXR1cm4gKCkgPT4gbShMb2dpbkJ1dHRvbiwgcmV0KCkpXG59XG5cbnR5cGUgRXhwYW5kZXJUYXJnZXRzID0gQXZhaWxhYmxlUGxhblR5cGUgfCBcIkFsbFwiXG5cbmV4cG9ydCBjbGFzcyBTdWJzY3JpcHRpb25TZWxlY3RvciBpbXBsZW1lbnRzIENvbXBvbmVudDxTdWJzY3JpcHRpb25TZWxlY3RvckF0dHI+IHtcblx0cHJpdmF0ZSBjb250YWluZXJET006IEVsZW1lbnQgfCBudWxsID0gbnVsbFxuXHRwcml2YXRlIGZlYXR1cmVzRXhwYW5kZWQ6IHsgW0sgaW4gRXhwYW5kZXJUYXJnZXRzXTogYm9vbGVhbiB9ID0ge1xuXHRcdFtQbGFuVHlwZS5GcmVlXTogZmFsc2UsXG5cdFx0W1BsYW5UeXBlLlJldm9sdXRpb25hcnldOiBmYWxzZSxcblx0XHRbUGxhblR5cGUuTGVnZW5kXTogZmFsc2UsXG5cdFx0W1BsYW5UeXBlLkVzc2VudGlhbF06IGZhbHNlLFxuXHRcdFtQbGFuVHlwZS5BZHZhbmNlZF06IGZhbHNlLFxuXHRcdFtQbGFuVHlwZS5VbmxpbWl0ZWRdOiBmYWxzZSxcblx0XHRBbGw6IGZhbHNlLFxuXHR9XG5cblx0b25pbml0KHZub2RlOiBWbm9kZTxTdWJzY3JpcHRpb25TZWxlY3RvckF0dHI+KTogYW55IHtcblx0XHRjb25zdCBhY2NlcHRlZFBsYW5zID0gdm5vZGUuYXR0cnMuYWNjZXB0ZWRQbGFuc1xuXHRcdGNvbnN0IG9ubHlCdXNpbmVzc1BsYW5zQWNjZXB0ZWQgPSBhY2NlcHRlZFBsYW5zLmV2ZXJ5KChwbGFuKSA9PiBOZXdCdXNpbmVzc1BsYW5zLmluY2x1ZGVzKHBsYW4pKVxuXG5cdFx0aWYgKG9ubHlCdXNpbmVzc1BsYW5zQWNjZXB0ZWQpIHtcblx0XHRcdC8vIGlmIG9ubHkgYnVzaW5lc3MgcGxhbnMgYXJlIGFjY2VwdGVkLCB3ZSBzaG93IHRoZW0gZmlyc3QgZXZlbiBpZiB0aGUgY3VycmVudCBwbGFuIGlzIGEgcGVyc29uYWwgcGxhblxuXHRcdFx0dm5vZGUuYXR0cnMub3B0aW9ucy5idXNpbmVzc1VzZSh0cnVlKVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgcmVuZGVySGVhZGxpbmUoXG5cdFx0bXNnOiBNYXliZVRyYW5zbGF0aW9uIHwgbnVsbCxcblx0XHRjdXJyZW50UGxhblR5cGU6IFBsYW5UeXBlIHwgbnVsbCxcblx0XHRwcmljZUluZm9UZXh0SWQ6IFRyYW5zbGF0aW9uS2V5IHwgbnVsbCxcblx0XHRpc0J1c2luZXNzOiBib29sZWFuLFxuXHRcdGlzQ3liZXJNb25kYXk6IGJvb2xlYW4sXG5cdCk6IENoaWxkcmVuIHtcblx0XHRjb25zdCB3cmFwSW5EaXYgPSAodGV4dDogc3RyaW5nLCBzdHlsZT86IFJlY29yZDxzdHJpbmcsIGFueT4pID0+IHtcblx0XHRcdHJldHVybiBtKFwiLmIuY2VudGVyXCIsIHsgc3R5bGUgfSwgdGV4dClcblx0XHR9XG5cblx0XHRpZiAobXNnKSB7XG5cdFx0XHRyZXR1cm4gd3JhcEluRGl2KGxhbmcuZ2V0VHJhbnNsYXRpb25UZXh0KG1zZykpXG5cdFx0fSBlbHNlIGlmIChjdXJyZW50UGxhblR5cGUgIT0gbnVsbCAmJiBMZWdhY3lQbGFucy5pbmNsdWRlcyhjdXJyZW50UGxhblR5cGUpKSB7XG5cdFx0XHRyZXR1cm4gd3JhcEluRGl2KGxhbmcuZ2V0KFwiY3VycmVudFBsYW5EaXNjb250aW51ZWRfbXNnXCIpKVxuXHRcdH1cblxuXHRcdGlmIChwcmljZUluZm9UZXh0SWQgJiYgbGFuZy5leGlzdHMocHJpY2VJbmZvVGV4dElkKSkge1xuXHRcdFx0cmV0dXJuIHdyYXBJbkRpdihsYW5nLmdldChwcmljZUluZm9UZXh0SWQpKVxuXHRcdH1cblxuXHRcdGlmIChpc0N5YmVyTW9uZGF5ICYmICFpc0J1c2luZXNzKSB7XG5cdFx0XHRyZXR1cm4gd3JhcEluRGl2KGxhbmcuZ2V0KFwicHJpY2luZy5jeWJlcl9tb25kYXlfbXNnXCIpLCB7IHdpZHRoOiBcIjIzMHB4XCIsIG1hcmdpbjogXCIxZW0gYXV0byAwIGF1dG9cIiB9KVxuXHRcdH1cblx0fVxuXG5cdHZpZXcodm5vZGU6IFZub2RlPFN1YnNjcmlwdGlvblNlbGVjdG9yQXR0cj4pOiBDaGlsZHJlbiB7XG5cdFx0Ly8gQWRkIEJ1eU9wdGlvbkJveCBtYXJnaW4gdHdpY2UgdG8gdGhlIGJveFdpZHRoIHJlY2VpdmVkXG5cdFx0Y29uc3QgeyBhY2NlcHRlZFBsYW5zLCBwcmljZUluZm9UZXh0SWQsIG1zZywgZmVhdHVyZUxpc3RQcm92aWRlciwgY3VycmVudFBsYW5UeXBlLCBvcHRpb25zLCBib3hXaWR0aCB9ID0gdm5vZGUuYXR0cnNcblxuXHRcdGNvbnN0IGNvbHVtbldpZHRoID0gYm94V2lkdGggKyBCT1hfTUFSR0lOICogMlxuXHRcdGNvbnN0IGluTW9iaWxlVmlldzogYm9vbGVhbiA9ICh0aGlzLmNvbnRhaW5lckRPTSAmJiB0aGlzLmNvbnRhaW5lckRPTS5jbGllbnRXaWR0aCA8IGNvbHVtbldpZHRoICogMikgPT0gdHJ1ZVxuXHRcdGNvbnN0IGZlYXR1cmVFeHBhbmRlciA9IHRoaXMucmVuZGVyRmVhdHVyZUV4cGFuZGVycyhpbk1vYmlsZVZpZXcsIGZlYXR1cmVMaXN0UHJvdmlkZXIpIC8vIHJlbmRlcnMgYWxsIGZlYXR1cmUgZXhwYW5kZXJzLCBib3RoIGZvciBldmVyeSBzaW5nbGUgc3Vic2NyaXB0aW9uIG9wdGlvbiBidXQgYWxzbyBmb3IgdGhlIHdob2xlIGxpc3Rcblx0XHRsZXQgYWRkaXRpb25hbEluZm86IENoaWxkcmVuXG5cblx0XHRsZXQgcGxhbnM6IEF2YWlsYWJsZVBsYW5UeXBlW11cblx0XHRjb25zdCBjdXJyZW50UGxhbiA9IGN1cnJlbnRQbGFuVHlwZVxuXHRcdGNvbnN0IHNpZ251cCA9IGN1cnJlbnRQbGFuID09IG51bGxcblxuXHRcdGNvbnN0IG9ubHlCdXNpbmVzc1BsYW5zQWNjZXB0ZWQgPSBhY2NlcHRlZFBsYW5zLmV2ZXJ5KChwbGFuKSA9PiBOZXdCdXNpbmVzc1BsYW5zLmluY2x1ZGVzKHBsYW4pKVxuXHRcdGNvbnN0IG9ubHlQZXJzb25hbFBsYW5zQWNjZXB0ZWQgPSBhY2NlcHRlZFBsYW5zLmV2ZXJ5KChwbGFuKSA9PiBOZXdQZXJzb25hbFBsYW5zLmluY2x1ZGVzKHBsYW4pKVxuXHRcdC8vIFNob3cgdGhlIGJ1c2luZXNzIHNlZ21lbnRDb250cm9sIGZvciBzaWdudXAsIGlmIGJvdGggcGVyc29uYWwgJiBidXNpbmVzcyBwbGFucyBhcmUgYWxsb3dlZFxuXHRcdGNvbnN0IHNob3dCdXNpbmVzc1NlbGVjdG9yID0gIW9ubHlCdXNpbmVzc1BsYW5zQWNjZXB0ZWQgJiYgIW9ubHlQZXJzb25hbFBsYW5zQWNjZXB0ZWQgJiYgIWlzSU9TQXBwKClcblxuXHRcdGNvbnN0IGlzQ3liZXJNb25kYXkgPSBpc1JlZmVyZW5jZURhdGVXaXRoaW5DeWJlck1vbmRheUNhbXBhaWduKENvbnN0LkNVUlJFTlRfREFURSA/PyBuZXcgRGF0ZSgpKVxuXG5cdFx0bGV0IHN1YnNjcmlwdGlvblBlcmlvZEluZm9Nc2cgPSAhc2lnbnVwICYmIGN1cnJlbnRQbGFuICE9PSBQbGFuVHlwZS5GcmVlID8gbGFuZy5nZXQoXCJzd2l0Y2hTdWJzY3JpcHRpb25JbmZvX21zZ1wiKSArIFwiIFwiIDogXCJcIlxuXHRcdGlmIChvcHRpb25zLmJ1c2luZXNzVXNlKCkpIHtcblx0XHRcdHBsYW5zID0gW1BsYW5UeXBlLkVzc2VudGlhbCwgUGxhblR5cGUuQWR2YW5jZWQsIFBsYW5UeXBlLlVubGltaXRlZF1cblx0XHRcdHN1YnNjcmlwdGlvblBlcmlvZEluZm9Nc2cgKz0gbGFuZy5nZXQoXCJwcmljaW5nLnN1YnNjcmlwdGlvblBlcmlvZEluZm9CdXNpbmVzc19tc2dcIilcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKGluTW9iaWxlVmlldykge1xuXHRcdFx0XHRpZiAoaXNDeWJlck1vbmRheSkge1xuXHRcdFx0XHRcdHBsYW5zID0gW1BsYW5UeXBlLkxlZ2VuZCwgUGxhblR5cGUuUmV2b2x1dGlvbmFyeSwgUGxhblR5cGUuRnJlZV1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRwbGFucyA9IFtQbGFuVHlwZS5SZXZvbHV0aW9uYXJ5LCBQbGFuVHlwZS5MZWdlbmQsIFBsYW5UeXBlLkZyZWVdXG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmIChpc0N5YmVyTW9uZGF5KSB7XG5cdFx0XHRcdFx0cGxhbnMgPSBbUGxhblR5cGUuRnJlZSwgUGxhblR5cGUuTGVnZW5kLCBQbGFuVHlwZS5SZXZvbHV0aW9uYXJ5XVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHBsYW5zID0gW1BsYW5UeXBlLkZyZWUsIFBsYW5UeXBlLlJldm9sdXRpb25hcnksIFBsYW5UeXBlLkxlZ2VuZF1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0c3Vic2NyaXB0aW9uUGVyaW9kSW5mb01zZyArPSBsYW5nLmdldChcInByaWNpbmcuc3Vic2NyaXB0aW9uUGVyaW9kSW5mb1ByaXZhdGVfbXNnXCIpXG5cdFx0fVxuXG5cdFx0Y29uc3Qgc2hvdWxkU2hvd0ZpcnN0WWVhckRpc2NvdW50Tm90aWNlID0gIWlzSU9TQXBwKCkgJiYgaXNDeWJlck1vbmRheSAmJiAhb3B0aW9ucy5idXNpbmVzc1VzZSgpICYmIG9wdGlvbnMucGF5bWVudEludGVydmFsKCkgPT09IFBheW1lbnRJbnRlcnZhbC5ZZWFybHlcblxuXHRcdGFkZGl0aW9uYWxJbmZvID0gbShcIi5mbGV4LmZsZXgtY29sdW1uLml0ZW1zLWNlbnRlclwiLCBbXG5cdFx0XHRmZWF0dXJlRXhwYW5kZXIuQWxsLCAvLyBnbG9iYWwgZmVhdHVyZSBleHBhbmRlclxuXHRcdFx0bShcIi5zbWFsbGVyLm1iLmNlbnRlclwiLCBzdWJzY3JpcHRpb25QZXJpb2RJbmZvTXNnKSxcblx0XHRcdHNob3VsZFNob3dGaXJzdFllYXJEaXNjb3VudE5vdGljZSAmJiBtKFwiLnNtYWxsZXIubWIuY2VudGVyXCIsIGAqICR7bGFuZy5nZXQoXCJwcmljaW5nLmxlZ2VuZEFzdGVyaXNrX21zZ1wiKX1gKSxcblx0XHRdKVxuXG5cdFx0Y29uc3QgYnV5Qm94ZXNWaWV3UGxhY2VtZW50ID0gcGxhbnNcblx0XHRcdC5maWx0ZXIoKHBsYW4pID0+IGFjY2VwdGVkUGxhbnMuaW5jbHVkZXMocGxhbikgfHwgY3VycmVudFBsYW5UeXBlID09PSBwbGFuKVxuXHRcdFx0Lm1hcCgocGVyc29uYWxQbGFuLCBpKSA9PiB7XG5cdFx0XHRcdC8vIG9ubHkgc2hvdyBjYXRlZ29yeSB0aXRsZSBmb3IgdGhlIGxlZnRtb3N0IGl0ZW1cblx0XHRcdFx0cmV0dXJuIFtcblx0XHRcdFx0XHR0aGlzLnJlbmRlckJ1eU9wdGlvbkJveCh2bm9kZS5hdHRycywgaW5Nb2JpbGVWaWV3LCBwZXJzb25hbFBsYW4sIGlzQ3liZXJNb25kYXkpLFxuXHRcdFx0XHRcdHRoaXMucmVuZGVyQnV5T3B0aW9uRGV0YWlscyh2bm9kZS5hdHRycywgaSA9PT0gMCwgcGVyc29uYWxQbGFuLCBmZWF0dXJlRXhwYW5kZXIsIGlzQ3liZXJNb25kYXkpLFxuXHRcdFx0XHRdXG5cdFx0XHR9KVxuXG5cdFx0cmV0dXJuIG0oXCJcIiwgeyBsYW5nOiBsYW5nLmNvZGUgfSwgW1xuXHRcdFx0c2hvd0J1c2luZXNzU2VsZWN0b3Jcblx0XHRcdFx0PyBtKFNlZ21lbnRDb250cm9sLCB7XG5cdFx0XHRcdFx0XHRzZWxlY3RlZFZhbHVlOiBvcHRpb25zLmJ1c2luZXNzVXNlKCksXG5cdFx0XHRcdFx0XHRvblZhbHVlU2VsZWN0ZWQ6IG9wdGlvbnMuYnVzaW5lc3NVc2UsXG5cdFx0XHRcdFx0XHRpdGVtczogQnVzaW5lc3NVc2VJdGVtcyxcblx0XHRcdFx0ICB9KVxuXHRcdFx0XHQ6IG51bGwsXG5cdFx0XHR0aGlzLnJlbmRlckhlYWRsaW5lKG1zZywgY3VycmVudFBsYW5UeXBlLCBwcmljZUluZm9UZXh0SWQsIG9wdGlvbnMuYnVzaW5lc3NVc2UoKSwgaXNDeWJlck1vbmRheSksXG5cdFx0XHRtKFxuXHRcdFx0XHRcIi5mbGV4LmNlbnRlci1ob3Jpem9udGFsbHkud3JhcFwiLFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0XCJkYXRhLXRlc3RpZFwiOiBcImRpYWxvZzpzZWxlY3Qtc3Vic2NyaXB0aW9uXCIsXG5cdFx0XHRcdFx0b25jcmVhdGU6ICh2bm9kZSkgPT4ge1xuXHRcdFx0XHRcdFx0dGhpcy5jb250YWluZXJET00gPSB2bm9kZS5kb20gYXMgSFRNTEVsZW1lbnRcblx0XHRcdFx0XHRcdG0ucmVkcmF3KClcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdFx0XHRcImNvbHVtbi1nYXBcIjogcHgoQk9YX01BUkdJTiksXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0fSxcblx0XHRcdFx0bShcIi5wbGFucy1ncmlkXCIsIGJ1eUJveGVzVmlld1BsYWNlbWVudC5mbGF0KCkpLFxuXHRcdFx0XHRhZGRpdGlvbmFsSW5mbyxcblx0XHRcdCksXG5cdFx0XSlcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyQnV5T3B0aW9uQm94KGF0dHJzOiBTdWJzY3JpcHRpb25TZWxlY3RvckF0dHIsIGluTW9iaWxlVmlldzogYm9vbGVhbiwgcGxhblR5cGU6IEF2YWlsYWJsZVBsYW5UeXBlLCBpc0N5YmVyTW9uZGF5OiBib29sZWFuKTogQ2hpbGRyZW4ge1xuXHRcdHJldHVybiBtKFxuXHRcdFx0XCJcIixcblx0XHRcdHtcblx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHR3aWR0aDogYXR0cnMuYm94V2lkdGggPyBweChhdHRycy5ib3hXaWR0aCkgOiBweCgyMzApLFxuXHRcdFx0XHR9LFxuXHRcdFx0fSxcblx0XHRcdG0oQnV5T3B0aW9uQm94LCB0aGlzLmNyZWF0ZUJ1eU9wdGlvbkJveEF0dHIoYXR0cnMsIHBsYW5UeXBlLCBpbk1vYmlsZVZpZXcsIGlzQ3liZXJNb25kYXkpKSxcblx0XHQpXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckJ1eU9wdGlvbkRldGFpbHMoXG5cdFx0YXR0cnM6IFN1YnNjcmlwdGlvblNlbGVjdG9yQXR0cixcblx0XHRyZW5kZXJDYXRlZ29yeVRpdGxlOiBib29sZWFuLFxuXHRcdHBsYW5UeXBlOiBBdmFpbGFibGVQbGFuVHlwZSxcblx0XHRmZWF0dXJlRXhwYW5kZXI6IFJlY29yZDxFeHBhbmRlclRhcmdldHMsIENoaWxkcmVuPixcblx0XHRpc0N5YmVyTW9uZGF5OiBib29sZWFuLCAvLyBjaGFuZ2UgdG8gaXNEaXNjb3VudEZvckFueVBsYW5BdmFpbGFibGUgd2hlbiByZW1vdmluZyB0aGUgY3liZXIgbW9uZGF5IGltcGxlbWVudGF0aW9uXG5cdCk6IENoaWxkcmVuIHtcblx0XHRyZXR1cm4gbShcblx0XHRcdFwiXCIsXG5cdFx0XHR7XG5cdFx0XHRcdHN0eWxlOiB7IHdpZHRoOiBhdHRycy5ib3hXaWR0aCA/IHB4KGF0dHJzLmJveFdpZHRoKSA6IHB4KDIzMCkgfSxcblx0XHRcdH0sXG5cdFx0XHRtKEJ1eU9wdGlvbkRldGFpbHMsIHRoaXMuY3JlYXRlQnV5T3B0aW9uQm94RGV0YWlsc0F0dHIoYXR0cnMsIHBsYW5UeXBlLCByZW5kZXJDYXRlZ29yeVRpdGxlLCBpc0N5YmVyTW9uZGF5KSksXG5cdFx0XHRmZWF0dXJlRXhwYW5kZXJbcGxhblR5cGVdLFxuXHRcdClcblx0fVxuXG5cdHByaXZhdGUgY3JlYXRlQnV5T3B0aW9uQm94QXR0cihcblx0XHRzZWxlY3RvckF0dHJzOiBTdWJzY3JpcHRpb25TZWxlY3RvckF0dHIsXG5cdFx0dGFyZ2V0U3Vic2NyaXB0aW9uOiBBdmFpbGFibGVQbGFuVHlwZSxcblx0XHRtb2JpbGU6IGJvb2xlYW4sXG5cdFx0aXNDeWJlck1vbmRheTogYm9vbGVhbixcblx0KTogQnV5T3B0aW9uQm94QXR0ciB7XG5cdFx0Y29uc3QgeyBwcmljZUFuZENvbmZpZ1Byb3ZpZGVyIH0gPSBzZWxlY3RvckF0dHJzXG5cblx0XHQvLyB3ZSBoaWdobGlnaHQgdGhlIGNlbnRlciBib3ggaWYgdGhpcyBpcyBhIHNpZ251cCBvciB0aGUgY3VycmVudCBzdWJzY3JpcHRpb24gdHlwZSBpcyBGcmVlXG5cdFx0Y29uc3QgaW50ZXJ2YWwgPSBzZWxlY3RvckF0dHJzLm9wdGlvbnMucGF5bWVudEludGVydmFsKClcblx0XHRjb25zdCB1cGdyYWRpbmdUb1BhaWRBY2NvdW50ID0gIXNlbGVjdG9yQXR0cnMuY3VycmVudFBsYW5UeXBlIHx8IHNlbGVjdG9yQXR0cnMuY3VycmVudFBsYW5UeXBlID09PSBQbGFuVHlwZS5GcmVlXG5cdFx0Y29uc3QgaXNIaWdobGlnaHRlZCA9ICgoKSA9PiB7XG5cdFx0XHRpZiAoaXNDeWJlck1vbmRheSkge1xuXHRcdFx0XHRyZXR1cm4gdGFyZ2V0U3Vic2NyaXB0aW9uID09PSBQbGFuVHlwZS5MZWdlbmRcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHVwZ3JhZGluZ1RvUGFpZEFjY291bnQgJiYgSGlnaGxpZ2h0ZWRQbGFucy5pbmNsdWRlcyh0YXJnZXRTdWJzY3JpcHRpb24pXG5cdFx0fSkoKVxuXHRcdGNvbnN0IG11bHRpdXNlciA9IE5ld0J1c2luZXNzUGxhbnMuaW5jbHVkZXModGFyZ2V0U3Vic2NyaXB0aW9uKSB8fCBMZWdhY3lQbGFucy5pbmNsdWRlcyh0YXJnZXRTdWJzY3JpcHRpb24pIHx8IHNlbGVjdG9yQXR0cnMubXVsdGlwbGVVc2Vyc0FsbG93ZWRcblxuXHRcdGNvbnN0IHN1YnNjcmlwdGlvblByaWNlID0gcHJpY2VBbmRDb25maWdQcm92aWRlci5nZXRTdWJzY3JpcHRpb25QcmljZShpbnRlcnZhbCwgdGFyZ2V0U3Vic2NyaXB0aW9uLCBVcGdyYWRlUHJpY2VUeXBlLlBsYW5BY3R1YWxQcmljZSlcblxuXHRcdGxldCBwcmljZVN0cjogc3RyaW5nXG5cdFx0bGV0IHJlZmVyZW5jZVByaWNlU3RyOiBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlZmluZWRcblx0XHRsZXQgcHJpY2VUeXBlOiBQcmljZVR5cGVcblx0XHRpZiAoaXNJT1NBcHAoKSkge1xuXHRcdFx0Y29uc3QgcHJpY2VzID0gcHJpY2VBbmRDb25maWdQcm92aWRlci5nZXRNb2JpbGVQcmljZXMoKS5nZXQoUGxhblR5cGVUb05hbWVbdGFyZ2V0U3Vic2NyaXB0aW9uXS50b0xvd2VyQ2FzZSgpKVxuXHRcdFx0aWYgKHByaWNlcyAhPSBudWxsKSB7XG5cdFx0XHRcdGlmIChpc0N5YmVyTW9uZGF5ICYmIHRhcmdldFN1YnNjcmlwdGlvbiA9PT0gUGxhblR5cGUuTGVnZW5kICYmIGludGVydmFsID09IFBheW1lbnRJbnRlcnZhbC5ZZWFybHkpIHtcblx0XHRcdFx0XHRjb25zdCByZXZvbHV0aW9uYXJ5UHJpY2UgPSBwcmljZUFuZENvbmZpZ1Byb3ZpZGVyLmdldE1vYmlsZVByaWNlcygpLmdldChQbGFuVHlwZVRvTmFtZVtQbGFuVHlwZS5SZXZvbHV0aW9uYXJ5XS50b0xvd2VyQ2FzZSgpKVxuXHRcdFx0XHRcdHByaWNlU3RyID0gcmV2b2x1dGlvbmFyeVByaWNlPy5kaXNwbGF5WWVhcmx5UGVyTW9udGggPz8gTkJTUFxuXHRcdFx0XHRcdC8vIGlmIHRoZXJlIGlzIGEgZGlzY291bnQgZm9yIHRoaXMgcGxhbiB3ZSBzaG93IHRoZSBvcmlnaW5hbCBwcmljZSBhcyByZWZlcmVuY2Vcblx0XHRcdFx0XHRyZWZlcmVuY2VQcmljZVN0ciA9IHByaWNlcz8uZGlzcGxheVllYXJseVBlck1vbnRoXG5cdFx0XHRcdFx0cHJpY2VUeXBlID0gUHJpY2VUeXBlLlllYXJseVBlck1vbnRoXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c3dpdGNoIChpbnRlcnZhbCkge1xuXHRcdFx0XHRcdFx0Y2FzZSBQYXltZW50SW50ZXJ2YWwuTW9udGhseTpcblx0XHRcdFx0XHRcdFx0cHJpY2VTdHIgPSBwcmljZXMuZGlzcGxheU1vbnRobHlQZXJNb250aFxuXHRcdFx0XHRcdFx0XHRwcmljZVR5cGUgPSBQcmljZVR5cGUuTW9udGhseVBlck1vbnRoXG5cdFx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdFx0XHRjYXNlIFBheW1lbnRJbnRlcnZhbC5ZZWFybHk6XG5cdFx0XHRcdFx0XHRcdHByaWNlU3RyID0gcHJpY2VzLmRpc3BsYXlZZWFybHlQZXJZZWFyXG5cdFx0XHRcdFx0XHRcdHByaWNlVHlwZSA9IFByaWNlVHlwZS5ZZWFybHlQZXJZZWFyXG5cdFx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyB3aGVuIGNhbiB0aGlzIGhhcHBlbj9cblx0XHRcdFx0cHJpY2VUeXBlID0gUHJpY2VUeXBlLk1vbnRobHlQZXJNb250aFxuXHRcdFx0XHRwcmljZVN0ciA9IE5CU1Bcblx0XHRcdFx0cmVmZXJlbmNlUHJpY2VTdHIgPSBOQlNQXG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHByaWNlVHlwZSA9IGludGVydmFsID09IFBheW1lbnRJbnRlcnZhbC5Nb250aGx5ID8gUHJpY2VUeXBlLk1vbnRobHlQZXJNb250aCA6IFByaWNlVHlwZS5ZZWFybHlQZXJNb250aFxuXHRcdFx0Y29uc3QgcmVmZXJlbmNlUHJpY2UgPSBwcmljZUFuZENvbmZpZ1Byb3ZpZGVyLmdldFN1YnNjcmlwdGlvblByaWNlKGludGVydmFsLCB0YXJnZXRTdWJzY3JpcHRpb24sIFVwZ3JhZGVQcmljZVR5cGUuUGxhblJlZmVyZW5jZVByaWNlKVxuXHRcdFx0cHJpY2VTdHIgPSBmb3JtYXRNb250aGx5UHJpY2Uoc3Vic2NyaXB0aW9uUHJpY2UsIGludGVydmFsKVxuXHRcdFx0aWYgKHJlZmVyZW5jZVByaWNlID4gc3Vic2NyaXB0aW9uUHJpY2UpIHtcblx0XHRcdFx0Ly8gaWYgdGhlcmUgaXMgYSBkaXNjb3VudCBmb3IgdGhpcyBwbGFuIHdlIHNob3cgdGhlIG9yaWdpbmFsIHByaWNlIGFzIHJlZmVyZW5jZVxuXHRcdFx0XHRyZWZlcmVuY2VQcmljZVN0ciA9IGZvcm1hdE1vbnRobHlQcmljZShyZWZlcmVuY2VQcmljZSwgaW50ZXJ2YWwpXG5cdFx0XHR9IGVsc2UgaWYgKGludGVydmFsID09IFBheW1lbnRJbnRlcnZhbC5ZZWFybHkgJiYgc3Vic2NyaXB0aW9uUHJpY2UgIT09IDAgJiYgIWlzQ3liZXJNb25kYXkpIHtcblx0XHRcdFx0Ly8gaWYgdGhlcmUgaXMgbm8gZGlzY291bnQgZm9yIGFueSBwbGFuIHRoZW4gd2Ugc2hvdyB0aGUgbW9udGhseSBwcmljZSBhcyByZWZlcmVuY2Vcblx0XHRcdFx0Y29uc3QgbW9udGhseVJlZmVyZW5jZVByaWNlID0gcHJpY2VBbmRDb25maWdQcm92aWRlci5nZXRTdWJzY3JpcHRpb25QcmljZShcblx0XHRcdFx0XHRQYXltZW50SW50ZXJ2YWwuTW9udGhseSxcblx0XHRcdFx0XHR0YXJnZXRTdWJzY3JpcHRpb24sXG5cdFx0XHRcdFx0VXBncmFkZVByaWNlVHlwZS5QbGFuQWN0dWFsUHJpY2UsXG5cdFx0XHRcdClcblx0XHRcdFx0cmVmZXJlbmNlUHJpY2VTdHIgPSBmb3JtYXRNb250aGx5UHJpY2UobW9udGhseVJlZmVyZW5jZVByaWNlLCBQYXltZW50SW50ZXJ2YWwuTW9udGhseSlcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBJZiB3ZSBhcmUgb24gdGhlIGN5YmVyIG1vbmRheSBjYW1wYWlnbiwgd2Ugd2FudCB0byBsZXQgdGhlIHVzZXIga25vdyB0aGUgZGlzY291bnQgaXMganVzdCBmb3IgdGhlIGZpcnN0IHllYXIuXG5cdFx0Y29uc3QgYXN0ZXJpc2tPckVtcHR5U3RyaW5nID0gIWlzSU9TQXBwKCkgJiYgaXNDeWJlck1vbmRheSAmJiB0YXJnZXRTdWJzY3JpcHRpb24gPT09IFBsYW5UeXBlLkxlZ2VuZCAmJiBpbnRlcnZhbCA9PT0gUGF5bWVudEludGVydmFsLlllYXJseSA/IFwiKlwiIDogXCJcIlxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGhlYWRpbmc6IGdldERpc3BsYXlOYW1lT2ZQbGFuVHlwZSh0YXJnZXRTdWJzY3JpcHRpb24pLFxuXHRcdFx0YWN0aW9uQnV0dG9uOlxuXHRcdFx0XHRzZWxlY3RvckF0dHJzLmN1cnJlbnRQbGFuVHlwZSA9PT0gdGFyZ2V0U3Vic2NyaXB0aW9uXG5cdFx0XHRcdFx0PyBnZXRBY3RpdmVTdWJzY3JpcHRpb25BY3Rpb25CdXR0b25SZXBsYWNlbWVudCgpXG5cdFx0XHRcdFx0OiBnZXRBY3Rpb25CdXR0b25CeVN1YnNjcmlwdGlvbihzZWxlY3RvckF0dHJzLmFjdGlvbkJ1dHRvbnMsIHRhcmdldFN1YnNjcmlwdGlvbiksXG5cdFx0XHRwcmljZTogcHJpY2VTdHIsXG5cdFx0XHRyZWZlcmVuY2VQcmljZTogcmVmZXJlbmNlUHJpY2VTdHIsXG5cdFx0XHRwcmljZUhpbnQ6IGxhbmcubWFrZVRyYW5zbGF0aW9uKFwicHJpY2VfaGludFwiLCBgJHtnZXRQcmljZUhpbnQoc3Vic2NyaXB0aW9uUHJpY2UsIHByaWNlVHlwZSwgbXVsdGl1c2VyKX0ke2FzdGVyaXNrT3JFbXB0eVN0cmluZ31gKSxcblx0XHRcdGhlbHBMYWJlbDogZ2V0SGVscExhYmVsKHRhcmdldFN1YnNjcmlwdGlvbiwgc2VsZWN0b3JBdHRycy5vcHRpb25zLmJ1c2luZXNzVXNlKCkpLFxuXHRcdFx0d2lkdGg6IHNlbGVjdG9yQXR0cnMuYm94V2lkdGgsXG5cdFx0XHRoZWlnaHQ6IHNlbGVjdG9yQXR0cnMuYm94SGVpZ2h0LFxuXHRcdFx0c2VsZWN0ZWRQYXltZW50SW50ZXJ2YWw6XG5cdFx0XHRcdHNlbGVjdG9yQXR0cnMuYWxsb3dTd2l0Y2hpbmdQYXltZW50SW50ZXJ2YWwgJiYgdGFyZ2V0U3Vic2NyaXB0aW9uICE9PSBQbGFuVHlwZS5GcmVlID8gc2VsZWN0b3JBdHRycy5vcHRpb25zLnBheW1lbnRJbnRlcnZhbCA6IG51bGwsXG5cdFx0XHRhY2NvdW50UGF5bWVudEludGVydmFsOiBpbnRlcnZhbCxcblx0XHRcdGhpZ2hsaWdodGVkOiBpc0hpZ2hsaWdodGVkLFxuXHRcdFx0bW9iaWxlLFxuXHRcdFx0Ym9udXNNb250aHM6XG5cdFx0XHRcdHRhcmdldFN1YnNjcmlwdGlvbiAhPT0gUGxhblR5cGUuRnJlZSAmJiBpbnRlcnZhbCA9PT0gUGF5bWVudEludGVydmFsLlllYXJseVxuXHRcdFx0XHRcdD8gTnVtYmVyKHNlbGVjdG9yQXR0cnMucHJpY2VBbmRDb25maWdQcm92aWRlci5nZXRSYXdQcmljaW5nRGF0YSgpLmJvbnVzTW9udGhzRm9yWWVhcmx5UGxhbilcblx0XHRcdFx0XHQ6IDAsXG5cdFx0XHR0YXJnZXRTdWJzY3JpcHRpb24sXG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBjcmVhdGVCdXlPcHRpb25Cb3hEZXRhaWxzQXR0cihcblx0XHRzZWxlY3RvckF0dHJzOiBTdWJzY3JpcHRpb25TZWxlY3RvckF0dHIsXG5cdFx0dGFyZ2V0U3Vic2NyaXB0aW9uOiBBdmFpbGFibGVQbGFuVHlwZSxcblx0XHRyZW5kZXJDYXRlZ29yeVRpdGxlOiBib29sZWFuLFxuXHRcdGlzQ3liZXJNb25kYXk6IGJvb2xlYW4sXG5cdCk6IEJ1eU9wdGlvbkRldGFpbHNBdHRyIHtcblx0XHRjb25zdCB7IGZlYXR1cmVMaXN0UHJvdmlkZXIgfSA9IHNlbGVjdG9yQXR0cnNcblx0XHRjb25zdCBzdWJzY3JpcHRpb25GZWF0dXJlcyA9IGZlYXR1cmVMaXN0UHJvdmlkZXIuZ2V0RmVhdHVyZUxpc3QodGFyZ2V0U3Vic2NyaXB0aW9uKVxuXHRcdGNvbnN0IGNhdGVnb3JpZXNUb1Nob3cgPSBzdWJzY3JpcHRpb25GZWF0dXJlcy5jYXRlZ29yaWVzXG5cdFx0XHQubWFwKChmYykgPT4ge1xuXHRcdFx0XHRyZXR1cm4gbG9jYWxpemVGZWF0dXJlQ2F0ZWdvcnkoZmMsIHRhcmdldFN1YnNjcmlwdGlvbiwgc2VsZWN0b3JBdHRycylcblx0XHRcdH0pXG5cdFx0XHQuZmlsdGVyKChmYyk6IGZjIGlzIEJ1eU9wdGlvbkRldGFpbHNBdHRyW1wiY2F0ZWdvcmllc1wiXVswXSA9PiBmYyAhPSBudWxsKVxuXG5cdFx0Y29uc3QgaXNMZWdlbmQgPSB0YXJnZXRTdWJzY3JpcHRpb24gPT09IFBsYW5UeXBlLkxlZ2VuZFxuXHRcdGNvbnN0IGlzWWVhcmx5ID0gc2VsZWN0b3JBdHRycy5vcHRpb25zLnBheW1lbnRJbnRlcnZhbCgpID09PSBQYXltZW50SW50ZXJ2YWwuWWVhcmx5XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0Y2F0ZWdvcmllczogY2F0ZWdvcmllc1RvU2hvdyxcblx0XHRcdGZlYXR1cmVzRXhwYW5kZWQ6IHRoaXMuZmVhdHVyZXNFeHBhbmRlZFt0YXJnZXRTdWJzY3JpcHRpb25dIHx8IHRoaXMuZmVhdHVyZXNFeHBhbmRlZC5BbGwsXG5cdFx0XHRyZW5kZXJDYXRlZ29yeVRpdGxlLFxuXHRcdFx0aWNvblN0eWxlOiBpc0N5YmVyTW9uZGF5ICYmIGlzWWVhcmx5ICYmIGlzTGVnZW5kID8geyBmaWxsOiB0aGVtZS5jb250ZW50X2FjY2VudF9jeWJlcl9tb25kYXkgfSA6IHVuZGVmaW5lZCxcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmVuZGVycyB0aGUgZmVhdHVyZSBleHBhbmRlcnMgZGVwZW5kaW5nIG9uIHdoZXRoZXIgY3VycmVudGx5IGRpc3BsYXlpbmcgdGhlIGZlYXR1cmUgbGlzdCBpbiBzaW5nbGUtY29sdW1uIGxheW91dCBvciBpbiBtdWx0aS1jb2x1bW4gbGF5b3V0LlxuXHQgKiBJZiBhIHNwZWNpZmljIGV4cGFuZGVyIGlzIG5vdCBuZWVkZWQgYW5kIHRodXMgc2hvdWxkIG5vdCBiZSByZW5kZXJlciwgbnVsbCB8IHVuZGVmaW5lZCBpcyByZXR1cm5lZFxuXHQgKi9cblx0cHJpdmF0ZSByZW5kZXJGZWF0dXJlRXhwYW5kZXJzKGluTW9iaWxlVmlldzogYm9vbGVhbiB8IG51bGwsIGZlYXR1cmVMaXN0UHJvdmlkZXI6IEZlYXR1cmVMaXN0UHJvdmlkZXIpOiBSZWNvcmQ8RXhwYW5kZXJUYXJnZXRzLCBDaGlsZHJlbj4ge1xuXHRcdGlmICghZmVhdHVyZUxpc3RQcm92aWRlci5mZWF0dXJlTG9hZGluZ0RvbmUoKSkge1xuXHRcdFx0Ly8gdGhlIGZlYXR1cmUgbGlzdCBpcyBub3QgYXZhaWxhYmxlXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRbUGxhblR5cGUuRnJlZV06IG51bGwsXG5cdFx0XHRcdFtQbGFuVHlwZS5SZXZvbHV0aW9uYXJ5XTogbnVsbCxcblx0XHRcdFx0W1BsYW5UeXBlLkxlZ2VuZF06IG51bGwsXG5cdFx0XHRcdFtQbGFuVHlwZS5Fc3NlbnRpYWxdOiBudWxsLFxuXHRcdFx0XHRbUGxhblR5cGUuQWR2YW5jZWRdOiBudWxsLFxuXHRcdFx0XHRbUGxhblR5cGUuVW5saW1pdGVkXTogbnVsbCxcblx0XHRcdFx0QWxsOiBudWxsLFxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoaW5Nb2JpbGVWaWV3KSB7XG5cdFx0XHQvLyBJbiBzaW5nbGUtY29sdW1uIGxheW91dCBldmVyeSBzdWJzY3JpcHRpb24gdHlwZSBoYXMgaXRzIG93biBmZWF0dXJlIGV4cGFuZGVyLlxuXHRcdFx0aWYgKHRoaXMuZmVhdHVyZXNFeHBhbmRlZC5BbGwpIHtcblx0XHRcdFx0Zm9yIChjb25zdCBrIGluIHRoaXMuZmVhdHVyZXNFeHBhbmRlZCkge1xuXHRcdFx0XHRcdHRoaXMuZmVhdHVyZXNFeHBhbmRlZFtrIGFzIEV4cGFuZGVyVGFyZ2V0c10gPSB0cnVlXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFtQbGFuVHlwZS5GcmVlXTogdGhpcy5yZW5kZXJFeHBhbmRlcihQbGFuVHlwZS5GcmVlKSxcblx0XHRcdFx0W1BsYW5UeXBlLlJldm9sdXRpb25hcnldOiB0aGlzLnJlbmRlckV4cGFuZGVyKFBsYW5UeXBlLlJldm9sdXRpb25hcnkpLFxuXHRcdFx0XHRbUGxhblR5cGUuTGVnZW5kXTogdGhpcy5yZW5kZXJFeHBhbmRlcihQbGFuVHlwZS5MZWdlbmQpLFxuXHRcdFx0XHRbUGxhblR5cGUuQWR2YW5jZWRdOiB0aGlzLnJlbmRlckV4cGFuZGVyKFBsYW5UeXBlLkFkdmFuY2VkKSxcblx0XHRcdFx0W1BsYW5UeXBlLkVzc2VudGlhbF06IHRoaXMucmVuZGVyRXhwYW5kZXIoUGxhblR5cGUuRXNzZW50aWFsKSxcblx0XHRcdFx0W1BsYW5UeXBlLlVubGltaXRlZF06IHRoaXMucmVuZGVyRXhwYW5kZXIoUGxhblR5cGUuVW5saW1pdGVkKSxcblx0XHRcdFx0QWxsOiBudWxsLFxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRmb3IgKGNvbnN0IGsgaW4gdGhpcy5mZWF0dXJlc0V4cGFuZGVkKSB7XG5cdFx0XHRcdHRoaXMuZmVhdHVyZXNFeHBhbmRlZFtrIGFzIEV4cGFuZGVyVGFyZ2V0c10gPSB0aGlzLmZlYXR1cmVzRXhwYW5kZWQuQWxsIC8vIGluIG11bHRpLWNvbHVtbiBsYXlvdXQgdGhlIHNwZWNpZmljIGZlYXR1cmUgZXhwYW5kZXJzIHNob3VsZCBmb2xsb3cgdGhlIGdsb2JhbCBvbmVcblx0XHRcdH1cblx0XHRcdHJldHVybiBPYmplY3QuYXNzaWduKHt9IGFzIFJlY29yZDxFeHBhbmRlclRhcmdldHMsIENoaWxkcmVuPiwgeyBBbGw6IHRoaXMucmVuZGVyRXhwYW5kZXIoXCJBbGxcIikgfSlcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmVuZGVycyBhIHNpbmdsZSBmZWF0dXJlIGV4cGFuZGVyLlxuXHQgKiBAcGFyYW0gc3ViVHlwZSBUaGUgY3VycmVudCBleHBhbmRlciB0aGF0IHNob3VsZCBiZSByZW5kZXJlZFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cHJpdmF0ZSByZW5kZXJFeHBhbmRlcihzdWJUeXBlOiBFeHBhbmRlclRhcmdldHMpOiBDaGlsZHJlbiB7XG5cdFx0cmV0dXJuIHRoaXMuZmVhdHVyZXNFeHBhbmRlZFtzdWJUeXBlXVxuXHRcdFx0PyBudWxsXG5cdFx0XHQ6IG0oQnV0dG9uLCB7XG5cdFx0XHRcdFx0bGFiZWw6IFwicHJpY2luZy5zaG93QWxsRmVhdHVyZXNcIixcblx0XHRcdFx0XHR0eXBlOiBCdXR0b25UeXBlLlNlY29uZGFyeSxcblx0XHRcdFx0XHRjbGljazogKGV2ZW50KSA9PiB7XG5cdFx0XHRcdFx0XHR0aGlzLmZlYXR1cmVzRXhwYW5kZWRbc3ViVHlwZV0gPSAhdGhpcy5mZWF0dXJlc0V4cGFuZGVkW3N1YlR5cGVdXG5cdFx0XHRcdFx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKVxuXHRcdFx0XHRcdH0sXG5cdFx0XHQgIH0pXG5cdH1cbn1cblxuZnVuY3Rpb24gbG9jYWxpemVGZWF0dXJlTGlzdEl0ZW0oXG5cdGl0ZW06IEZlYXR1cmVMaXN0SXRlbSxcblx0dGFyZ2V0U3Vic2NyaXB0aW9uOiBQbGFuVHlwZSxcblx0YXR0cnM6IFN1YnNjcmlwdGlvblNlbGVjdG9yQXR0cixcbik6IEJ1eU9wdGlvbkRldGFpbHNBdHRyW1wiY2F0ZWdvcmllc1wiXVswXVtcImZlYXR1cmVzXCJdWzBdIHwgbnVsbCB7XG5cdGNvbnN0IHRleHQgPSB0cnlHZXRUcmFuc2xhdGlvbihpdGVtLnRleHQsIGdldFJlcGxhY2VtZW50KGl0ZW0ucmVwbGFjZW1lbnRzLCB0YXJnZXRTdWJzY3JpcHRpb24sIGF0dHJzKSlcblx0aWYgKHRleHQgPT0gbnVsbCkge1xuXHRcdHJldHVybiBudWxsXG5cdH1cblx0aWYgKCFpdGVtLnRvb2xUaXApIHtcblx0XHRyZXR1cm4geyB0ZXh0LCBrZXk6IGl0ZW0udGV4dCwgYW50aUZlYXR1cmU6IGl0ZW0uYW50aUZlYXR1cmUsIG9taXQ6IGl0ZW0ub21pdCwgaGVhcnQ6ICEhaXRlbS5oZWFydCB9XG5cdH0gZWxzZSB7XG5cdFx0Y29uc3QgdG9vbFRpcFRleHQgPSB0cnlHZXRUcmFuc2xhdGlvbihpdGVtLnRvb2xUaXApXG5cdFx0aWYgKHRvb2xUaXBUZXh0ID09PSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdH1cblx0XHRjb25zdCB0b29sVGlwID0gaXRlbS50b29sVGlwLmVuZHNXaXRoKFwiX21hcmtkb3duXCIpID8gbS50cnVzdCh0b29sVGlwVGV4dCkgOiB0b29sVGlwVGV4dFxuXHRcdHJldHVybiB7IHRleHQsIHRvb2xUaXAsIGtleTogaXRlbS50ZXh0LCBhbnRpRmVhdHVyZTogaXRlbS5hbnRpRmVhdHVyZSwgb21pdDogaXRlbS5vbWl0LCBoZWFydDogISFpdGVtLmhlYXJ0IH1cblx0fVxufVxuXG5mdW5jdGlvbiBsb2NhbGl6ZUZlYXR1cmVDYXRlZ29yeShcblx0Y2F0ZWdvcnk6IEZlYXR1cmVDYXRlZ29yeSxcblx0dGFyZ2V0U3Vic2NyaXB0aW9uOiBQbGFuVHlwZSxcblx0YXR0cnM6IFN1YnNjcmlwdGlvblNlbGVjdG9yQXR0cixcbik6IEJ1eU9wdGlvbkRldGFpbHNBdHRyW1wiY2F0ZWdvcmllc1wiXVswXSB8IG51bGwge1xuXHRjb25zdCB0aXRsZSA9IHRyeUdldFRyYW5zbGF0aW9uKGNhdGVnb3J5LnRpdGxlKVxuXHRjb25zdCBmZWF0dXJlcyA9IGRvd25jYXN0PHsgdGV4dDogc3RyaW5nOyB0b29sVGlwPzogbS5DaGlsZDsga2V5OiBzdHJpbmc7IGFudGlGZWF0dXJlPzogYm9vbGVhbiB8IHVuZGVmaW5lZDsgb21pdDogYm9vbGVhbjsgaGVhcnQ6IGJvb2xlYW4gfVtdPihcblx0XHRjYXRlZ29yeS5mZWF0dXJlcy5tYXAoKGYpID0+IGxvY2FsaXplRmVhdHVyZUxpc3RJdGVtKGYsIHRhcmdldFN1YnNjcmlwdGlvbiwgYXR0cnMpKS5maWx0ZXIoKGl0KSA9PiBpdCAhPSBudWxsKSxcblx0KVxuXHRyZXR1cm4geyB0aXRsZSwga2V5OiBjYXRlZ29yeS50aXRsZSwgZmVhdHVyZXMsIGZlYXR1cmVDb3VudDogY2F0ZWdvcnkuZmVhdHVyZUNvdW50IH1cbn1cblxuZnVuY3Rpb24gdHJ5R2V0VHJhbnNsYXRpb24oa2V5OiBUcmFuc2xhdGlvbktleSwgcmVwbGFjZW1lbnRzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nIHwgbnVtYmVyPik6IHN0cmluZyB8IG51bGwge1xuXHR0cnkge1xuXHRcdHJldHVybiBsYW5nLmdldChrZXksIHJlcGxhY2VtZW50cylcblx0fSBjYXRjaCAoZSkge1xuXHRcdGNvbnNvbGUubG9nKFwiY291bGQgbm90IHRyYW5zbGF0ZSBmZWF0dXJlIHRleHQgZm9yIGtleVwiLCBrZXksIFwiaGlkaW5nIGZlYXR1cmUgaXRlbVwiKVxuXHRcdHJldHVybiBudWxsXG5cdH1cbn1cblxuLyoqXG4gKiBnZXQgYSBzdHJpbmcgdG8gaW5zZXJ0IGludG8gYSB0cmFuc2xhdGlvbiB3aXRoIGEgc2xvdC5cbiAqIGlmIG5vIGtleSBpcyBmb3VuZCwgdW5kZWZpbmVkIGlzIHJldHVybmVkIGFuZCBub3RoaW5nIGlzIHJlcGxhY2VkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmVwbGFjZW1lbnQoXG5cdGtleTogUmVwbGFjZW1lbnRLZXkgfCB1bmRlZmluZWQsXG5cdHN1YnNjcmlwdGlvbjogUGxhblR5cGUsXG5cdGF0dHJzOiBTdWJzY3JpcHRpb25TZWxlY3RvckF0dHIsXG4pOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCBudW1iZXI+IHwgdW5kZWZpbmVkIHtcblx0Y29uc3QgeyBwcmljZUFuZENvbmZpZ1Byb3ZpZGVyIH0gPSBhdHRyc1xuXHRzd2l0Y2ggKGtleSkge1xuXHRcdGNhc2UgXCJjdXN0b21Eb21haW5zXCI6IHtcblx0XHRcdGNvbnN0IGN1c3RvbURvbWFpblR5cGUgPSBkb3duY2FzdDxDdXN0b21Eb21haW5UeXBlPihwcmljZUFuZENvbmZpZ1Byb3ZpZGVyLmdldFBsYW5QcmljZXNGb3JQbGFuKHN1YnNjcmlwdGlvbikucGxhbkNvbmZpZ3VyYXRpb24uY3VzdG9tRG9tYWluVHlwZSlcblx0XHRcdHJldHVybiB7IFwie2Ftb3VudH1cIjogQ3VzdG9tRG9tYWluVHlwZUNvdW50TmFtZVtjdXN0b21Eb21haW5UeXBlXSB9XG5cdFx0fVxuXHRcdGNhc2UgXCJtYWlsQWRkcmVzc0FsaWFzZXNcIjpcblx0XHRcdHJldHVybiB7IFwie2Ftb3VudH1cIjogcHJpY2VBbmRDb25maWdQcm92aWRlci5nZXRQbGFuUHJpY2VzRm9yUGxhbihzdWJzY3JpcHRpb24pLnBsYW5Db25maWd1cmF0aW9uLm5ick9mQWxpYXNlcyB9XG5cdFx0Y2FzZSBcInN0b3JhZ2VcIjpcblx0XHRcdHJldHVybiB7IFwie2Ftb3VudH1cIjogcHJpY2VBbmRDb25maWdQcm92aWRlci5nZXRQbGFuUHJpY2VzRm9yUGxhbihzdWJzY3JpcHRpb24pLnBsYW5Db25maWd1cmF0aW9uLnN0b3JhZ2VHYiB9XG5cdFx0Y2FzZSBcImxhYmVsXCI6IHtcblx0XHRcdHJldHVybiB7IFwie2Ftb3VudH1cIjogcHJpY2VBbmRDb25maWdQcm92aWRlci5nZXRQbGFuUHJpY2VzRm9yUGxhbihzdWJzY3JpcHRpb24pLnBsYW5Db25maWd1cmF0aW9uLm1heExhYmVscyB9XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGdldEhlbHBMYWJlbChwbGFuVHlwZTogUGxhblR5cGUsIGJ1c2luZXNzVXNlOiBib29sZWFuKTogVHJhbnNsYXRpb25LZXkge1xuXHRpZiAocGxhblR5cGUgPT09IFBsYW5UeXBlLkZyZWUpIHJldHVybiBcInByaWNpbmcudXBncmFkZUxhdGVyX21zZ1wiXG5cdHJldHVybiBidXNpbmVzc1VzZSA/IFwicHJpY2luZy5leGNsdWRlc1RheGVzX21zZ1wiIDogXCJwcmljaW5nLmluY2x1ZGVzVGF4ZXNfbXNnXCJcbn1cblxuZnVuY3Rpb24gZ2V0UHJpY2VIaW50KHN1YnNjcmlwdGlvblByaWNlOiBudW1iZXIsIHByaWNlVHlwZTogUHJpY2VUeXBlLCBtdWx0aXVzZXI6IGJvb2xlYW4pOiBzdHJpbmcge1xuXHRpZiAoc3Vic2NyaXB0aW9uUHJpY2UgPiAwKSB7XG5cdFx0c3dpdGNoIChwcmljZVR5cGUpIHtcblx0XHRcdGNhc2UgUHJpY2VUeXBlLlllYXJseVBlclllYXI6XG5cdFx0XHRcdC8vIHdlIGRvIG5vdCBzdXBwb3J0IG11bHRpdXNlciBoZXJlXG5cdFx0XHRcdHJldHVybiBsYW5nLmdldChcInByaWNpbmcucGVyWWVhcl9sYWJlbFwiKVxuXHRcdFx0Y2FzZSBQcmljZVR5cGUuWWVhcmx5UGVyTW9udGg6XG5cdFx0XHRcdGlmIChtdWx0aXVzZXIpIHtcblx0XHRcdFx0XHRyZXR1cm4gbGFuZy5nZXQoXCJwcmljaW5nLnBlclVzZXJNb250aFBhaWRZZWFybHlfbGFiZWxcIilcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gbGFuZy5nZXQoXCJwcmljaW5nLnBlck1vbnRoUGFpZFllYXJseV9sYWJlbFwiKVxuXHRcdFx0XHR9XG5cdFx0XHRjYXNlIFByaWNlVHlwZS5Nb250aGx5UGVyTW9udGg6XG5cdFx0XHRcdGlmIChtdWx0aXVzZXIpIHtcblx0XHRcdFx0XHRyZXR1cm4gbGFuZy5nZXQoXCJwcmljaW5nLnBlclVzZXJNb250aF9sYWJlbFwiKVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiBsYW5nLmdldChcInByaWNpbmcucGVyTW9udGhfbGFiZWxcIilcblx0XHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gXCJcIlxufVxuIiwiaW1wb3J0IHsgQm9va2luZ0l0ZW1GZWF0dXJlVHlwZSwgRmVhdHVyZVR5cGUsIExlZ2FjeVBsYW5zLCBQbGFuVHlwZSB9IGZyb20gXCIuLi9hcGkvY29tbW9uL1R1dGFub3RhQ29uc3RhbnRzXCJcbmltcG9ydCB0eXBlIHsgQWNjb3VudGluZ0luZm8sIEJvb2tpbmcsIEN1c3RvbWVyIH0gZnJvbSBcIi4uL2FwaS9lbnRpdGllcy9zeXMvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgYXNQYXltZW50SW50ZXJ2YWwsIFBheW1lbnRJbnRlcnZhbCB9IGZyb20gXCIuL1ByaWNlVXRpbHNcIlxuaW1wb3J0IHsgaXNDdXN0b21pemF0aW9uRW5hYmxlZEZvckN1c3RvbWVyIH0gZnJvbSBcIi4uL2FwaS9jb21tb24vdXRpbHMvQ3VzdG9tZXJVdGlscy5qc1wiXG5cbmV4cG9ydCB0eXBlIEN1cnJlbnRQbGFuSW5mbyA9IHtcblx0YnVzaW5lc3NVc2U6IGJvb2xlYW5cblx0cGxhblR5cGU6IFBsYW5UeXBlXG5cdHBheW1lbnRJbnRlcnZhbDogUGF5bWVudEludGVydmFsXG59XG5cbmV4cG9ydCBjbGFzcyBTd2l0Y2hTdWJzY3JpcHRpb25EaWFsb2dNb2RlbCB7XG5cdGN1cnJlbnRQbGFuSW5mbzogQ3VycmVudFBsYW5JbmZvXG5cblx0Y29uc3RydWN0b3IoXG5cdFx0cHJpdmF0ZSByZWFkb25seSBjdXN0b21lcjogQ3VzdG9tZXIsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBhY2NvdW50aW5nSW5mbzogQWNjb3VudGluZ0luZm8sXG5cdFx0cHJpdmF0ZSByZWFkb25seSBwbGFuVHlwZTogUGxhblR5cGUsXG5cdFx0cHJpdmF0ZSByZWFkb25seSBsYXN0Qm9va2luZzogQm9va2luZyxcblx0KSB7XG5cdFx0dGhpcy5jdXJyZW50UGxhbkluZm8gPSB0aGlzLl9pbml0Q3VycmVudFBsYW5JbmZvKClcblx0fVxuXG5cdF9pbml0Q3VycmVudFBsYW5JbmZvKCk6IEN1cnJlbnRQbGFuSW5mbyB7XG5cdFx0Y29uc3QgcGF5bWVudEludGVydmFsOiBQYXltZW50SW50ZXJ2YWwgPSBhc1BheW1lbnRJbnRlcnZhbCh0aGlzLmFjY291bnRpbmdJbmZvLnBheW1lbnRJbnRlcnZhbClcblx0XHRyZXR1cm4ge1xuXHRcdFx0YnVzaW5lc3NVc2U6IHRoaXMuY3VzdG9tZXIuYnVzaW5lc3NVc2UsXG5cdFx0XHRwbGFuVHlwZTogdGhpcy5wbGFuVHlwZSxcblx0XHRcdHBheW1lbnRJbnRlcnZhbCxcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2sgaWYgdGhlIHVzZXIncyBjdXJyZW50IHBsYW4gaGFzIG11bHRpcGxlIHVzZXJzIGR1ZSB0byBhIGxlZ2FjeSBhZ3JlZW1lbnQgYW5kIHdpbGwgY29udGludWUgdG8gZG8gc28gaWYgdGhlIHVzZXIgc3dpdGNoZXMgcGxhbnMuXG5cdCAqXG5cdCAqIEByZXR1cm4gdHJ1ZSBpZiBtdWx0aXBsZSB1c2VycyBhcmUgc3VwcG9ydGVkIGR1ZSB0byBsZWdhY3ksIGZhbHNlIGlmIG5vdDsgbm90ZSB0aGF0IHJldHVybmluZyBmYWxzZSBkb2VzIG5vdCBtZWFuIHRoYXQgdGhlIGN1cnJlbnQgcGxhbiBkb2VzIG5vdCBhY3R1YWxseSBzdXBwb3J0IG11bHRpcGxlIHVzZXJzXG5cdCAqL1xuXHRtdWx0aXBsZVVzZXJzU3RpbGxTdXBwb3J0ZWRMZWdhY3koKTogYm9vbGVhbiB7XG5cdFx0aWYgKGlzQ3VzdG9taXphdGlvbkVuYWJsZWRGb3JDdXN0b21lcih0aGlzLmN1c3RvbWVyLCBGZWF0dXJlVHlwZS5NdWx0aXBsZVVzZXJzKSkge1xuXHRcdFx0cmV0dXJuIHRydWVcblx0XHR9XG5cblx0XHRpZiAoTGVnYWN5UGxhbnMuaW5jbHVkZXModGhpcy5wbGFuVHlwZSkpIHtcblx0XHRcdGNvbnN0IHVzZXJJdGVtID0gdGhpcy5sYXN0Qm9va2luZy5pdGVtcy5maW5kKChpdGVtKSA9PiBpdGVtLmZlYXR1cmVUeXBlID09PSBCb29raW5nSXRlbUZlYXR1cmVUeXBlLkxlZ2FjeVVzZXJzKVxuXHRcdFx0Y29uc3Qgc2hhcmVkTWFpbEl0ZW0gPSB0aGlzLmxhc3RCb29raW5nLml0ZW1zLmZpbmQoKGl0ZW0pID0+IGl0ZW0uZmVhdHVyZVR5cGUgPT09IEJvb2tpbmdJdGVtRmVhdHVyZVR5cGUuU2hhcmVkTWFpbEdyb3VwKVxuXG5cdFx0XHQvLyBBIHVzZXIgdGhhdCBoYXMgUGxhblR5cGUuUHJlbWl1bSB3aWxsIGFsd2F5cyBoYXZlIExlZ2FjeVVzZXJzIGJvb2tlZC5cblx0XHRcdGNvbnN0IHVzZXJDb3VudCA9IE51bWJlcih1c2VySXRlbT8uY3VycmVudENvdW50KVxuXG5cdFx0XHQvLyBUaGVzZSBtYXkgYmUgYm9va2VkIGJ1dCBub3QgYWx3YXlzLlxuXHRcdFx0Y29uc3Qgc2hhcmVkTWFpbENvdW50ID0gc2hhcmVkTWFpbEl0ZW0gPyBOdW1iZXIoc2hhcmVkTWFpbEl0ZW0uY3VycmVudENvdW50KSA6IDBcblxuXHRcdFx0cmV0dXJuIHVzZXJDb3VudCArIHNoYXJlZE1haWxDb3VudCA+IDFcblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2Vcblx0fVxufVxuIiwiaW1wb3J0IG0sIHsgQ2hpbGRyZW4sIENvbXBvbmVudCB9IGZyb20gXCJtaXRocmlsXCJcbmltcG9ydCB0eXBlIHsgVHJhbnNsYXRpb25LZXkgfSBmcm9tIFwiLi4vbWlzYy9MYW5ndWFnZVZpZXdNb2RlbFwiXG5pbXBvcnQgeyBsYW5nIH0gZnJvbSBcIi4uL21pc2MvTGFuZ3VhZ2VWaWV3TW9kZWxcIlxuaW1wb3J0IHR5cGUgeyBDb3VudHJ5IH0gZnJvbSBcIi4uL2FwaS9jb21tb24vQ291bnRyeUxpc3RcIlxuaW1wb3J0IHsgQ291bnRyaWVzLCBDb3VudHJ5VHlwZSB9IGZyb20gXCIuLi9hcGkvY29tbW9uL0NvdW50cnlMaXN0XCJcbmltcG9ydCB7IEh0bWxFZGl0b3IsIEh0bWxFZGl0b3JNb2RlIH0gZnJvbSBcIi4uL2d1aS9lZGl0b3IvSHRtbEVkaXRvclwiXG5pbXBvcnQgdHlwZSB7IExvY2F0aW9uU2VydmljZUdldFJldHVybiB9IGZyb20gXCIuLi9hcGkvZW50aXRpZXMvc3lzL1R5cGVSZWZzLmpzXCJcbmltcG9ydCB7IHJlbmRlckNvdW50cnlEcm9wZG93biB9IGZyb20gXCIuLi9ndWkvYmFzZS9HdWlVdGlsc1wiXG5pbXBvcnQgeyBUZXh0RmllbGQgfSBmcm9tIFwiLi4vZ3VpL2Jhc2UvVGV4dEZpZWxkLmpzXCJcbmltcG9ydCB0eXBlIHsgSW52b2ljZURhdGEgfSBmcm9tIFwiLi4vYXBpL2NvbW1vbi9UdXRhbm90YUNvbnN0YW50c1wiXG5pbXBvcnQgeyBMb2NhdGlvblNlcnZpY2UgfSBmcm9tIFwiLi4vYXBpL2VudGl0aWVzL3N5cy9TZXJ2aWNlc1wiXG5pbXBvcnQgeyBsb2NhdG9yIH0gZnJvbSBcIi4uL2FwaS9tYWluL0NvbW1vbkxvY2F0b3JcIlxuaW1wb3J0IFN0cmVhbSBmcm9tIFwibWl0aHJpbC9zdHJlYW1cIlxuaW1wb3J0IHN0cmVhbSBmcm9tIFwibWl0aHJpbC9zdHJlYW1cIlxuaW1wb3J0IHsgVXNhZ2VUZXN0IH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11c2FnZXRlc3RzXCJcblxuZXhwb3J0IGVudW0gSW52b2ljZURhdGFJbnB1dExvY2F0aW9uIHtcblx0SW5XaXphcmQgPSAwLFxuXHRPdGhlciA9IDEsXG59XG5cbmV4cG9ydCBjbGFzcyBJbnZvaWNlRGF0YUlucHV0IGltcGxlbWVudHMgQ29tcG9uZW50IHtcblx0cHJpdmF0ZSByZWFkb25seSBpbnZvaWNlQWRkcmVzc0NvbXBvbmVudDogSHRtbEVkaXRvclxuXHRwdWJsaWMgcmVhZG9ubHkgc2VsZWN0ZWRDb3VudHJ5OiBTdHJlYW08Q291bnRyeSB8IG51bGw+XG5cdHByaXZhdGUgdmF0TnVtYmVyOiBzdHJpbmcgPSBcIlwiXG5cdHByaXZhdGUgX19wYXltZW50UGF5cGFsVGVzdD86IFVzYWdlVGVzdFxuXG5cdGNvbnN0cnVjdG9yKHByaXZhdGUgYnVzaW5lc3NVc2U6IGJvb2xlYW4sIGludm9pY2VEYXRhOiBJbnZvaWNlRGF0YSwgcHJpdmF0ZSByZWFkb25seSBsb2NhdGlvbiA9IEludm9pY2VEYXRhSW5wdXRMb2NhdGlvbi5PdGhlcikge1xuXHRcdHRoaXMuX19wYXltZW50UGF5cGFsVGVzdCA9IGxvY2F0b3IudXNhZ2VUZXN0Q29udHJvbGxlci5nZXRUZXN0KFwicGF5bWVudC5wYXlwYWxcIilcblxuXHRcdHRoaXMuaW52b2ljZUFkZHJlc3NDb21wb25lbnQgPSBuZXcgSHRtbEVkaXRvcigpXG5cdFx0XHQuc2V0U3RhdGljTnVtYmVyT2ZMaW5lcyg1KVxuXHRcdFx0LnNob3dCb3JkZXJzKClcblx0XHRcdC5zZXRQbGFjZWhvbGRlcklkKFwiaW52b2ljZUFkZHJlc3NfbGFiZWxcIilcblx0XHRcdC5zZXRNb2RlKEh0bWxFZGl0b3JNb2RlLkhUTUwpXG5cdFx0XHQuc2V0SHRtbE1vbm9zcGFjZShmYWxzZSlcblx0XHRcdC5zZXRWYWx1ZShpbnZvaWNlRGF0YS5pbnZvaWNlQWRkcmVzcylcblxuXHRcdHRoaXMuc2VsZWN0ZWRDb3VudHJ5ID0gc3RyZWFtKGludm9pY2VEYXRhLmNvdW50cnkpXG5cblx0XHR0aGlzLnZpZXcgPSB0aGlzLnZpZXcuYmluZCh0aGlzKVxuXHRcdHRoaXMub25jcmVhdGUgPSB0aGlzLm9uY3JlYXRlLmJpbmQodGhpcylcblx0fVxuXG5cdHZpZXcoKTogQ2hpbGRyZW4ge1xuXHRcdHJldHVybiBbXG5cdFx0XHR0aGlzLmJ1c2luZXNzVXNlIHx8IHRoaXMubG9jYXRpb24gIT09IEludm9pY2VEYXRhSW5wdXRMb2NhdGlvbi5JbldpemFyZFxuXHRcdFx0XHQ/IG0oXCJcIiwgW1xuXHRcdFx0XHRcdFx0bShcIi5wdFwiLCBtKHRoaXMuaW52b2ljZUFkZHJlc3NDb21wb25lbnQpKSxcblx0XHRcdFx0XHRcdG0oXCIuc21hbGxcIiwgbGFuZy5nZXQodGhpcy5idXNpbmVzc1VzZSA/IFwiaW52b2ljZUFkZHJlc3NJbmZvQnVzaW5lc3NfbXNnXCIgOiBcImludm9pY2VBZGRyZXNzSW5mb1ByaXZhdGVfbXNnXCIpKSxcblx0XHRcdFx0ICBdKVxuXHRcdFx0XHQ6IG51bGwsXG5cdFx0XHRyZW5kZXJDb3VudHJ5RHJvcGRvd24oe1xuXHRcdFx0XHRzZWxlY3RlZENvdW50cnk6IHRoaXMuc2VsZWN0ZWRDb3VudHJ5KCksXG5cdFx0XHRcdG9uU2VsZWN0aW9uQ2hhbmdlZDogdGhpcy5zZWxlY3RlZENvdW50cnksXG5cdFx0XHRcdGhlbHBMYWJlbDogKCkgPT4gbGFuZy5nZXQoXCJpbnZvaWNlQ291bnRyeUluZm9Db25zdW1lcl9tc2dcIiksXG5cdFx0XHR9KSxcblx0XHRcdHRoaXMuaXNWYXRJZEZpZWxkVmlzaWJsZSgpXG5cdFx0XHRcdD8gbShUZXh0RmllbGQsIHtcblx0XHRcdFx0XHRcdGxhYmVsOiBcImludm9pY2VWYXRJZE5vX2xhYmVsXCIsXG5cdFx0XHRcdFx0XHR2YWx1ZTogdGhpcy52YXROdW1iZXIsXG5cdFx0XHRcdFx0XHRvbmlucHV0OiAodmFsdWUpID0+ICh0aGlzLnZhdE51bWJlciA9IHZhbHVlKSxcblx0XHRcdFx0XHRcdGhlbHBMYWJlbDogKCkgPT4gbGFuZy5nZXQoXCJpbnZvaWNlVmF0SWROb0luZm9CdXNpbmVzc19tc2dcIiksXG5cdFx0XHRcdCAgfSlcblx0XHRcdFx0OiBudWxsLFxuXHRcdF1cblx0fVxuXG5cdG9uY3JlYXRlKCkge1xuXHRcdGxvY2F0b3Iuc2VydmljZUV4ZWN1dG9yLmdldChMb2NhdGlvblNlcnZpY2UsIG51bGwpLnRoZW4oKGxvY2F0aW9uOiBMb2NhdGlvblNlcnZpY2VHZXRSZXR1cm4pID0+IHtcblx0XHRcdGlmICghdGhpcy5zZWxlY3RlZENvdW50cnkoKSkge1xuXHRcdFx0XHRjb25zdCBjb3VudHJ5ID0gQ291bnRyaWVzLmZpbmQoKGMpID0+IGMuYSA9PT0gbG9jYXRpb24uY291bnRyeSlcblxuXHRcdFx0XHRpZiAoY291bnRyeSkge1xuXHRcdFx0XHRcdHRoaXMuc2VsZWN0ZWRDb3VudHJ5KGNvdW50cnkpXG5cdFx0XHRcdFx0bS5yZWRyYXcoKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSlcblx0fVxuXG5cdHZhbGlkYXRlSW52b2ljZURhdGEoKTogVHJhbnNsYXRpb25LZXkgfCBudWxsIHtcblx0XHRjb25zdCBhZGRyZXNzID0gdGhpcy5nZXRBZGRyZXNzKClcblx0XHRjb25zdCBjb3VudHJ5U2VsZWN0ZWQgPSB0aGlzLnNlbGVjdGVkQ291bnRyeSgpICE9IG51bGxcblxuXHRcdGlmICh0aGlzLmJ1c2luZXNzVXNlKSB7XG5cdFx0XHRpZiAoYWRkcmVzcy50cmltKCkgPT09IFwiXCIgfHwgYWRkcmVzcy5zcGxpdChcIlxcblwiKS5sZW5ndGggPiA1KSB7XG5cdFx0XHRcdHJldHVybiBcImludm9pY2VBZGRyZXNzSW5mb0J1c2luZXNzX21zZ1wiXG5cdFx0XHR9IGVsc2UgaWYgKCFjb3VudHJ5U2VsZWN0ZWQpIHtcblx0XHRcdFx0cmV0dXJuIFwiaW52b2ljZUNvdW50cnlJbmZvQnVzaW5lc3NfbXNnXCJcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKCFjb3VudHJ5U2VsZWN0ZWQpIHtcblx0XHRcdFx0cmV0dXJuIFwiaW52b2ljZUNvdW50cnlJbmZvQnVzaW5lc3NfbXNnXCIgLy8gdXNlIGJ1c2luZXNzIHRleHQgaGVyZSBiZWNhdXNlIGl0IGZpdHMgYmV0dGVyXG5cdFx0XHR9IGVsc2UgaWYgKGFkZHJlc3Muc3BsaXQoXCJcXG5cIikubGVuZ3RoID4gNCkge1xuXHRcdFx0XHRyZXR1cm4gXCJpbnZvaWNlQWRkcmVzc0luZm9CdXNpbmVzc19tc2dcIlxuXHRcdFx0fVxuXHRcdH1cblx0XHR0aGlzLl9fcGF5bWVudFBheXBhbFRlc3Q/LmdldFN0YWdlKDMpLmNvbXBsZXRlKClcblx0XHQvLyBubyBlcnJvclxuXHRcdHJldHVybiBudWxsXG5cdH1cblxuXHRnZXRJbnZvaWNlRGF0YSgpOiBJbnZvaWNlRGF0YSB7XG5cdFx0Y29uc3QgYWRkcmVzcyA9IHRoaXMuZ2V0QWRkcmVzcygpXG5cdFx0Y29uc3Qgc2VsZWN0ZWRDb3VudHJ5ID0gdGhpcy5zZWxlY3RlZENvdW50cnkoKVxuXHRcdHJldHVybiB7XG5cdFx0XHRpbnZvaWNlQWRkcmVzczogYWRkcmVzcyxcblx0XHRcdGNvdW50cnk6IHNlbGVjdGVkQ291bnRyeSxcblx0XHRcdHZhdE51bWJlcjogc2VsZWN0ZWRDb3VudHJ5Py50ID09PSBDb3VudHJ5VHlwZS5FVSAmJiB0aGlzLmJ1c2luZXNzVXNlID8gdGhpcy52YXROdW1iZXIgOiBcIlwiLFxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgaXNWYXRJZEZpZWxkVmlzaWJsZSgpOiBib29sZWFuIHtcblx0XHRjb25zdCBzZWxlY3RlZENvdW50cnkgPSB0aGlzLnNlbGVjdGVkQ291bnRyeSgpXG5cdFx0cmV0dXJuIHRoaXMuYnVzaW5lc3NVc2UgJiYgc2VsZWN0ZWRDb3VudHJ5ICE9IG51bGwgJiYgc2VsZWN0ZWRDb3VudHJ5LnQgPT09IENvdW50cnlUeXBlLkVVXG5cdH1cblxuXHRwcml2YXRlIGdldEFkZHJlc3MoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5pbnZvaWNlQWRkcmVzc0NvbXBvbmVudFxuXHRcdFx0LmdldFZhbHVlKClcblx0XHRcdC5zcGxpdChcIlxcblwiKVxuXHRcdFx0LmZpbHRlcigobGluZSkgPT4gbGluZS50cmltKCkubGVuZ3RoID4gMClcblx0XHRcdC5qb2luKFwiXFxuXCIpXG5cdH1cbn1cbiIsImltcG9ydCBtLCB7IENoaWxkcmVuLCBDb21wb25lbnQsIFZub2RlIH0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHsgQXV0b2NvbXBsZXRlLCBUZXh0RmllbGQgfSBmcm9tIFwiLi4vZ3VpL2Jhc2UvVGV4dEZpZWxkLmpzXCJcbmltcG9ydCB7IFNpbXBsaWZpZWRDcmVkaXRDYXJkVmlld01vZGVsIH0gZnJvbSBcIi4vU2ltcGxpZmllZENyZWRpdENhcmRJbnB1dE1vZGVsLmpzXCJcbmltcG9ydCB7IGxhbmcsIFRyYW5zbGF0aW9uS2V5IH0gZnJvbSBcIi4uL21pc2MvTGFuZ3VhZ2VWaWV3TW9kZWwuanNcIlxuaW1wb3J0IHsgU3RhZ2UgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXVzYWdldGVzdHNcIlxuaW1wb3J0IHsgQ3JlZGl0Q2FyZCB9IGZyb20gXCIuLi9hcGkvZW50aXRpZXMvc3lzL1R5cGVSZWZzLmpzXCJcblxuZXhwb3J0IHR5cGUgU2ltcGxpZmllZENyZWRpdENhcmRBdHRycyA9IHtcblx0dmlld01vZGVsOiBTaW1wbGlmaWVkQ3JlZGl0Q2FyZFZpZXdNb2RlbFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIENDVmlld01vZGVsIHtcblx0dmFsaWRhdGVDcmVkaXRDYXJkUGF5bWVudERhdGEoKTogVHJhbnNsYXRpb25LZXkgfCBudWxsXG5cblx0c2V0Q3JlZGl0Q2FyZERhdGEoZGF0YTogQ3JlZGl0Q2FyZCB8IG51bGwpOiB2b2lkXG5cblx0Z2V0Q3JlZGl0Q2FyZERhdGEoKTogQ3JlZGl0Q2FyZFxufVxuXG4vLyBjaGFuZ2luZyB0aGUgY29udGVudCAoaWUgZ3JvdXBpbmcpIHNldHMgc2VsZWN0aW9uIHRvIHRoZSBlbmQsIHRoaXMgcmVzdG9yZXMgaXQgYWZ0ZXIgdGhlIG5leHQgcmVkcmF3LlxuZnVuY3Rpb24gcmVzdG9yZVNlbGVjdGlvbihkb21JbnB1dDogSFRNTElucHV0RWxlbWVudCkge1xuXHRjb25zdCB7IHNlbGVjdGlvblN0YXJ0LCBzZWxlY3Rpb25FbmQsIHNlbGVjdGlvbkRpcmVjdGlvbiB9ID0gZG9tSW5wdXRcblx0Y29uc3QgaXNBdEVuZCA9IGRvbUlucHV0LnZhbHVlLmxlbmd0aCA9PT0gc2VsZWN0aW9uU3RhcnRcblx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0Y29uc3QgY3VycmVudExlbmd0aCA9IGRvbUlucHV0LnZhbHVlLmxlbmd0aFxuXHRcdC8vIHdlJ3JlIGFkZGluZyBjaGFyYWN0ZXJzLCBzbyBqdXN0IHJlLXVzaW5nIHRoZSBpbmRleCBmYWlscyBiZWNhdXNlIGF0IHRoZSB0aW1lIHdlIHNldCB0aGUgc2VsZWN0aW9uLCB0aGUgc3RyaW5nIGlzIGxvbmdlciB0aGFuIGl0IHdhcy5cblx0XHQvLyB0aGlzIG1vc3RseSB3b3JrcywgYnV0IGZhaWxzIGluIGNhc2VzIHdoZXJlIHdlJ3JlIGFkZGluZyBzdHVmZiBpbiB0aGUgbWlkZGxlIG9mIHRoZSBzdHJpbmcuXG5cdFx0ZG9tSW5wdXQuc2V0U2VsZWN0aW9uUmFuZ2UoaXNBdEVuZCA/IGN1cnJlbnRMZW5ndGggOiBzZWxlY3Rpb25TdGFydCwgaXNBdEVuZCA/IGN1cnJlbnRMZW5ndGggOiBzZWxlY3Rpb25FbmQsIHNlbGVjdGlvbkRpcmVjdGlvbiA/PyB1bmRlZmluZWQpXG5cdH0sIDApXG59XG5cbmV4cG9ydCBjbGFzcyBTaW1wbGlmaWVkQ3JlZGl0Q2FyZElucHV0IGltcGxlbWVudHMgQ29tcG9uZW50PFNpbXBsaWZpZWRDcmVkaXRDYXJkQXR0cnM+IHtcblx0ZGF0ZUZpZWxkTGVmdDogYm9vbGVhbiA9IGZhbHNlXG5cdG51bWJlckZpZWxkTGVmdDogYm9vbGVhbiA9IGZhbHNlXG5cdGN2dkZpZWxkTGVmdDogYm9vbGVhbiA9IGZhbHNlXG5cdGNjTnVtYmVyRG9tOiBIVE1MSW5wdXRFbGVtZW50IHwgbnVsbCA9IG51bGxcblx0ZXhwRGF0ZURvbTogSFRNTElucHV0RWxlbWVudCB8IG51bGwgPSBudWxsXG5cblx0dmlldyh2bm9kZTogVm5vZGU8U2ltcGxpZmllZENyZWRpdENhcmRBdHRycz4pOiBDaGlsZHJlbiB7XG5cdFx0bGV0IHsgdmlld01vZGVsIH0gPSB2bm9kZS5hdHRyc1xuXG5cdFx0cmV0dXJuIFtcblx0XHRcdG0oVGV4dEZpZWxkLCB7XG5cdFx0XHRcdGxhYmVsOiBcImNyZWRpdENhcmROdW1iZXJfbGFiZWxcIixcblx0XHRcdFx0aGVscExhYmVsOiAoKSA9PiB0aGlzLnJlbmRlckNjTnVtYmVySGVscExhYmVsKHZpZXdNb2RlbCksXG5cdFx0XHRcdHZhbHVlOiB2aWV3TW9kZWwuY3JlZGl0Q2FyZE51bWJlcixcblx0XHRcdFx0b25pbnB1dDogKG5ld1ZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0dmlld01vZGVsLmNyZWRpdENhcmROdW1iZXIgPSBuZXdWYWx1ZVxuXHRcdFx0XHRcdHJlc3RvcmVTZWxlY3Rpb24odGhpcy5jY051bWJlckRvbSEpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdG9uYmx1cjogKCkgPT4gKHRoaXMubnVtYmVyRmllbGRMZWZ0ID0gdHJ1ZSksXG5cdFx0XHRcdGF1dG9jb21wbGV0ZUFzOiBBdXRvY29tcGxldGUuY2NOdW1iZXIsXG5cdFx0XHRcdG9uRG9tSW5wdXRDcmVhdGVkOiAoZG9tKSA9PiAodGhpcy5jY051bWJlckRvbSA9IGRvbSksXG5cdFx0XHR9KSxcblx0XHRcdG0oVGV4dEZpZWxkLCB7XG5cdFx0XHRcdGxhYmVsOiBcImNyZWRpdENhcmRFeHBpcmF0aW9uRGF0ZVdpdGhGb3JtYXRfbGFiZWxcIixcblx0XHRcdFx0dmFsdWU6IHZpZXdNb2RlbC5leHBpcmF0aW9uRGF0ZSxcblx0XHRcdFx0Ly8gd2Ugb25seSBzaG93IHRoZSBoaW50IGlmIHRoZSBmaWVsZCBpcyBub3QgZW1wdHkgYW5kIG5vdCBzZWxlY3RlZCB0byBhdm9pZCBzaG93aW5nIGVycm9ycyB3aGlsZSB0aGUgdXNlciBpcyB0eXBpbmcuXG5cdFx0XHRcdGhlbHBMYWJlbDogKCkgPT4gKHRoaXMuZGF0ZUZpZWxkTGVmdCA/IGxhbmcuZ2V0KHZpZXdNb2RlbC5nZXRFeHBpcmF0aW9uRGF0ZUVycm9ySGludCgpID8/IFwiZW1wdHlTdHJpbmdfbXNnXCIpIDogbGFuZy5nZXQoXCJlbXB0eVN0cmluZ19tc2dcIikpLFxuXHRcdFx0XHRvbmJsdXI6ICgpID0+ICh0aGlzLmRhdGVGaWVsZExlZnQgPSB0cnVlKSxcblx0XHRcdFx0b25pbnB1dDogKG5ld1ZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0dmlld01vZGVsLmV4cGlyYXRpb25EYXRlID0gbmV3VmFsdWVcblx0XHRcdFx0XHRyZXN0b3JlU2VsZWN0aW9uKHRoaXMuZXhwRGF0ZURvbSEpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdG9uRG9tSW5wdXRDcmVhdGVkOiAoZG9tKSA9PiAodGhpcy5leHBEYXRlRG9tID0gZG9tKSxcblx0XHRcdFx0YXV0b2NvbXBsZXRlQXM6IEF1dG9jb21wbGV0ZS5jY0V4cCxcblx0XHRcdH0pLFxuXHRcdFx0bShUZXh0RmllbGQsIHtcblx0XHRcdFx0bGFiZWw6IGxhbmcubWFrZVRyYW5zbGF0aW9uKFwiY3Z2XCIsIHZpZXdNb2RlbC5nZXRDdnZMYWJlbCgpKSxcblx0XHRcdFx0dmFsdWU6IHZpZXdNb2RlbC5jdnYsXG5cdFx0XHRcdGhlbHBMYWJlbDogKCkgPT4gdGhpcy5yZW5kZXJDdnZOdW1iZXJIZWxwTGFiZWwodmlld01vZGVsKSxcblx0XHRcdFx0b25pbnB1dDogKG5ld1ZhbHVlKSA9PiAodmlld01vZGVsLmN2diA9IG5ld1ZhbHVlKSxcblx0XHRcdFx0b25ibHVyOiAoKSA9PiAodGhpcy5jdnZGaWVsZExlZnQgPSB0cnVlKSxcblx0XHRcdFx0YXV0b2NvbXBsZXRlQXM6IEF1dG9jb21wbGV0ZS5jY0NzYyxcblx0XHRcdH0pLFxuXHRcdF1cblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyQ2NOdW1iZXJIZWxwTGFiZWwobW9kZWw6IFNpbXBsaWZpZWRDcmVkaXRDYXJkVmlld01vZGVsKTogQ2hpbGRyZW4ge1xuXHRcdGNvbnN0IGhpbnQgPSBtb2RlbC5nZXRDcmVkaXRDYXJkTnVtYmVySGludCgpXG5cdFx0Y29uc3QgZXJyb3IgPSBtb2RlbC5nZXRDcmVkaXRDYXJkTnVtYmVyRXJyb3JIaW50KClcblx0XHQvLyB3ZSBvbmx5IGRyYXcgdGhlIGhpbnQgaWYgdGhlIG51bWJlciBmaWVsZCB3YXMgZW50ZXJlZCAmIGV4aXRlZCBiZWZvcmVcblx0XHRpZiAodGhpcy5udW1iZXJGaWVsZExlZnQpIHtcblx0XHRcdGlmIChoaW50KSB7XG5cdFx0XHRcdHJldHVybiBlcnJvciA/IGxhbmcuZ2V0KFwiY3JlZGl0Q2FyZEhpbnRXaXRoRXJyb3JfbXNnXCIsIHsgXCJ7aGludH1cIjogaGludCwgXCJ7ZXJyb3JUZXh0fVwiOiBlcnJvciB9KSA6IGhpbnRcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBlcnJvciA/IGVycm9yIDogbGFuZy5nZXQoXCJlbXB0eVN0cmluZ19tc2dcIilcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGhpbnQgPz8gbGFuZy5nZXQoXCJlbXB0eVN0cmluZ19tc2dcIilcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckN2dk51bWJlckhlbHBMYWJlbChtb2RlbDogU2ltcGxpZmllZENyZWRpdENhcmRWaWV3TW9kZWwpOiBDaGlsZHJlbiB7XG5cdFx0Y29uc3QgY3Z2SGludCA9IG1vZGVsLmdldEN2dkhpbnQoKVxuXHRcdGNvbnN0IGN2dkVycm9yID0gbW9kZWwuZ2V0Q3Z2RXJyb3JIaW50KClcblx0XHRpZiAodGhpcy5jdnZGaWVsZExlZnQpIHtcblx0XHRcdGlmIChjdnZIaW50KSB7XG5cdFx0XHRcdHJldHVybiBjdnZFcnJvciA/IGxhbmcuZ2V0KFwiY3JlZGl0Q2FyZEhpbnRXaXRoRXJyb3JfbXNnXCIsIHsgXCJ7aGludH1cIjogY3Z2SGludCwgXCJ7ZXJyb3JUZXh0fVwiOiBjdnZFcnJvciB9KSA6IGN2dkhpbnRcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBjdnZFcnJvciA/IGN2dkVycm9yIDogbGFuZy5nZXQoXCJlbXB0eVN0cmluZ19tc2dcIilcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGN2dkhpbnQgPz8gbGFuZy5nZXQoXCJlbXB0eVN0cmluZ19tc2dcIilcblx0XHR9XG5cdH1cbn1cbiIsImltcG9ydCB7IGNyZWF0ZUNyZWRpdENhcmQsIENyZWRpdENhcmQgfSBmcm9tIFwiLi4vYXBpL2VudGl0aWVzL3N5cy9UeXBlUmVmcy5qc1wiXG5pbXBvcnQgeyBMYW5ndWFnZVZpZXdNb2RlbCwgVHJhbnNsYXRpb25LZXkgfSBmcm9tIFwiLi4vbWlzYy9MYW5ndWFnZVZpZXdNb2RlbC5qc1wiXG5pbXBvcnQgeyBDQ1ZpZXdNb2RlbCB9IGZyb20gXCIuL1NpbXBsaWZpZWRDcmVkaXRDYXJkSW5wdXQuanNcIlxuaW1wb3J0IHsgaXNWYWxpZENyZWRpdENhcmROdW1iZXIgfSBmcm9tIFwiLi4vbWlzYy9Gb3JtYXRWYWxpZGF0b3IuanNcIlxuaW1wb3J0IHsgdHlwZWRWYWx1ZXMgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcblxuLy8gd2UncmUgdXNpbmcgc3RyaW5nIHZhbHVlcyB0byBtYWtlIGl0IGVhc3kgdG8gaXRlcmF0ZSBhbGwgY2FyZCB0eXBlc1xuZXhwb3J0IGVudW0gQ2FyZFR5cGUge1xuXHRBbWV4ID0gXCJBbWV4XCIsXG5cdFZpc2EgPSBcIlZpc2FcIixcblx0TWFzdGVyY2FyZCA9IFwiTWFzdGVyY2FyZFwiLFxuXHRNYWVzdHJvID0gXCJNYWVzdHJvXCIsXG5cdERpc2NvdmVyID0gXCJEaXNjb3ZlclwiLFxuXHRPdGhlciA9IFwiT3RoZXJcIixcbn1cblxuLyoqXG4gKiBUcmllcyB0byBmaW5kIHRoZSBjcmVkaXQgY2FyZCBpc3N1ZXIgYnkgY3JlZGl0IGNhcmQgbnVtYmVyLlxuICogVGhlcmVmb3JlLCBpdCBpcyBjaGVja2VkIHdoZXRoZXIgdGhlIHR5cGVkIGluIG51bWJlciBpcyBpbiBhIGtub3duIHJhbmdlLlxuICogSW5wdXQgTVVTVCBiZSBzYW5pdGl6ZWQgdG8gb25seSBjb250YWluIG51bWVyaWNhbCBkaWdpdHNcbiAqIEBwYXJhbSBjYyB0aGUgY3JlZGl0IGNhcmQgbnVtYmVyIHR5cGVkIGluIGJ5IHRoZSB1c2VyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDYXJkVHlwZVJhbmdlKGNjOiBzdHJpbmcpOiBDYXJkVHlwZSB7XG5cdGZvciAobGV0IGNhcmRUeXBlIG9mIHR5cGVkVmFsdWVzKENhcmRUeXBlKSkge1xuXHRcdGlmIChjYXJkVHlwZSA9PT0gQ2FyZFR5cGUuT3RoZXIpIGNvbnRpbnVlXG5cdFx0Zm9yIChsZXQgcmFuZ2Ugb2YgQ2FyZFByZWZpeFJhbmdlc1tjYXJkVHlwZV0pIHtcblx0XHRcdGNvbnN0IGxvd2VzdFJhbmdlID0gcmFuZ2VbMF0ucGFkRW5kKDgsIFwiMFwiKVxuXHRcdFx0Y29uc3QgaGlnaGVzdFJhbmdlID0gcmFuZ2VbMV0ucGFkRW5kKDgsIFwiOVwiKVxuXHRcdFx0Y29uc3QgbG93ZXN0Q0MgPSBjYy5zbGljZSgwLCA4KS5wYWRFbmQoOCwgXCIwXCIpXG5cdFx0XHRjb25zdCBoaWdoZXN0Q0MgPSBjYy5zbGljZSgwLCA4KS5wYWRFbmQoOCwgXCI5XCIpXG5cdFx0XHRpZiAobG93ZXN0UmFuZ2UgPD0gbG93ZXN0Q0MgJiYgaGlnaGVzdENDIDw9IGhpZ2hlc3RSYW5nZSkge1xuXHRcdFx0XHRyZXR1cm4gY2FyZFR5cGVcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIENhcmRUeXBlLk90aGVyXG59XG5cbnR5cGUgQ2FyZFNwZWMgPSB7IGN2dkxlbmd0aDogbnVtYmVyIHwgbnVsbDsgY3Z2TmFtZTogc3RyaW5nOyBuYW1lOiBzdHJpbmcgfCBudWxsIH1cblxuLy8gd2UgY2FuJ3QgaGF2ZSBlbnVtcyB3aXRoXG5jb25zdCBDYXJkU3BlY3MgPSBPYmplY3QuZnJlZXplKHtcblx0W0NhcmRUeXBlLlZpc2FdOiB7IGN2dkxlbmd0aDogMywgY3Z2TmFtZTogXCJDVlZcIiwgbmFtZTogXCJWaXNhXCIgfSxcblx0W0NhcmRUeXBlLk1hc3RlcmNhcmRdOiB7IGN2dkxlbmd0aDogMywgY3Z2TmFtZTogXCJDVkNcIiwgbmFtZTogXCJNYXN0ZXJjYXJkXCIgfSxcblx0W0NhcmRUeXBlLk1hZXN0cm9dOiB7IGN2dkxlbmd0aDogMywgY3Z2TmFtZTogXCJDVlZcIiwgbmFtZTogXCJNYWVzdHJvXCIgfSxcblx0W0NhcmRUeXBlLkFtZXhdOiB7IGN2dkxlbmd0aDogNCwgY3Z2TmFtZTogXCJDU0NcIiwgbmFtZTogXCJBbWVyaWNhbiBFeHByZXNzXCIgfSxcblx0W0NhcmRUeXBlLkRpc2NvdmVyXTogeyBjdnZMZW5ndGg6IDMsIGN2dk5hbWU6IFwiQ1ZEXCIsIG5hbWU6IFwiRGlzY292ZXJcIiB9LFxuXHRbQ2FyZFR5cGUuT3RoZXJdOiB7IGN2dkxlbmd0aDogbnVsbCwgY3Z2TmFtZTogXCJDVlZcIiwgbmFtZTogbnVsbCB9LFxufSlcblxuLy8gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUGF5bWVudF9jYXJkX251bWJlclxuY29uc3QgQ2FyZFByZWZpeFJhbmdlczogUmVjb3JkPENhcmRUeXBlLCBOdW1iZXJTdHJpbmdbXVtdPiA9IE9iamVjdC5mcmVlemUoe1xuXHRbQ2FyZFR5cGUuVmlzYV06IFtbXCI0XCIsIFwiNFwiXV0sXG5cdFtDYXJkVHlwZS5NYXN0ZXJjYXJkXTogW1xuXHRcdFtcIjUxXCIsIFwiNTVcIl0sXG5cdFx0W1wiMjIyMVwiLCBcIjI3MjBcIl0sXG5cdF0sXG5cdFtDYXJkVHlwZS5NYWVzdHJvXTogW1xuXHRcdFtcIjY3NTlcIiwgXCI2NzU5XCJdLFxuXHRcdFtcIjY3Njc3MFwiLCBcIjY3Njc3MFwiXSxcblx0XHRbXCI2NzY3NzRcIiwgXCI2NzY3NzRcIl0sXG5cdFx0W1wiNTAxOFwiLCBcIjUwMThcIl0sXG5cdFx0W1wiNTAyMFwiLCBcIjUwMjBcIl0sXG5cdFx0W1wiNTAzOFwiLCBcIjUwMzhcIl0sXG5cdFx0W1wiNTg5M1wiLCBcIjU4OTNcIl0sXG5cdFx0W1wiNjMwNFwiLCBcIjYzMDRcIl0sXG5cdFx0W1wiNjc1OVwiLCBcIjY3NTlcIl0sXG5cdFx0W1wiNjc2MVwiLCBcIjY3NjNcIl0sXG5cdF0sXG5cdFtDYXJkVHlwZS5BbWV4XTogW1xuXHRcdFtcIjM0XCIsIFwiMzRcIl0sXG5cdFx0W1wiMzdcIiwgXCIzN1wiXSxcblx0XSxcblx0W0NhcmRUeXBlLkRpc2NvdmVyXTogW1xuXHRcdFtcIjYwMTFcIiwgXCI2MDExXCJdLFxuXHRcdFtcIjY0NFwiLCBcIjY0OVwiXSxcblx0XHRbXCI2NVwiLCBcIjY1XCJdLFxuXHRcdFtcIjYyMjEyNlwiLCBcIjYyMjkyNVwiXSxcblx0XSxcblx0W0NhcmRUeXBlLk90aGVyXTogW1tdXSxcbn0pXG50eXBlIFN0cmluZ0lucHV0Q29ycmVjdGVyID0gKHZhbHVlOiBzdHJpbmcsIG9sZFZhbHVlPzogc3RyaW5nKSA9PiBzdHJpbmdcblxuY29uc3QgYWxsRGlnaXRzID0gW1wiMFwiLCBcIjFcIiwgXCIyXCIsIFwiM1wiLCBcIjRcIiwgXCI1XCIsIFwiNlwiLCBcIjdcIiwgXCI4XCIsIFwiOVwiXVxuY29uc3QgZGVmaW5pdGVNb250aERpZ2l0cyA9IFtcIjJcIiwgXCIzXCIsIFwiNFwiLCBcIjVcIiwgXCI2XCIsIFwiN1wiLCBcIjhcIiwgXCI5XCJdXG5jb25zdCBzZWNvbmRNb250aERpZ2l0cyA9IFtcIjBcIiwgXCIxXCIsIFwiMlwiXVxuY29uc3Qgc2VwYXJhdG9yID0gXCIvXCJcbmNvbnN0IG5pY2VTZXBhcmF0b3IgPSBgICR7c2VwYXJhdG9yfSBgXG5cbi8qKlxuICogY29tcGxldGVseSBzdHJpcCBhbGwgd2hpdGVzcGFjZSBmcm9tIGEgc3RyaW5nXG4gKiBAcGFyYW0gcyB0aGUgc3RyaW5nIHRvIGNsZWFuIHVwXG4gKi9cbmZ1bmN0aW9uIHN0cmlwV2hpdGVzcGFjZShzOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRyZXR1cm4gcy5yZXBsYWNlKC9cXHMvZywgXCJcIilcbn1cblxuZnVuY3Rpb24gc3RyaXBOb25EaWdpdHMoczogc3RyaW5nKTogc3RyaW5nIHtcblx0cmV0dXJuIHMucmVwbGFjZSgvXFxEL2csIFwiXCIpXG59XG5cbi8qKlxuICogdHJ1ZSBpZiBzIGNvbnRhaW5zIGNoYXJhY3RlcnMgYW5kIGFsbCBvZiB0aGVtIGFyZSBkaWdpdHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc0RpZ2l0U3RyaW5nKHM6IHN0cmluZykge1xuXHRpZiAocy5sZW5ndGggPT09IDApIHJldHVybiBmYWxzZVxuXHRjb25zdCBtYXRjaGVzID0gcy5tYXRjaCgvXFxkL2cpXG5cdHJldHVybiBtYXRjaGVzICE9IG51bGwgJiYgbWF0Y2hlcy5sZW5ndGggPT09IHMubGVuZ3RoXG59XG5cbi8qKlxuICogdGFrZSBhIGZ1bmN0aW9uIHRoYXQgY29ycmVjdHMgd2hpdGVzcGFjZSBvbiBpbnB1dCB0aGF0IGRvZXMgbm90IGNvbnRhaW4gd2hpdGVzcGFjZVxuICogYW5kIHJldHVybiBvbmUgdGhhdCBkb2VzIHRoZSBzYW1lIG9uIGlucHV0IHRoYXQgY29udGFpbnMgYXJiaXRyYXJ5IHdoaXRlc3BhY2UuXG4gKiBAcGFyYW0gZm4gYSBmdW5jdGlvbiB0aGF0IGRvZXMgbm90IGRlYWwgd2l0aCB3aGl0ZXNwYWNlLWNvbnRhaW5pbmcgb3IgZW1wdHkgaW5wdXRcbiAqL1xuZnVuY3Rpb24gbm9ybWFsaXplSW5wdXQoZm46IFN0cmluZ0lucHV0Q29ycmVjdGVyKTogU3RyaW5nSW5wdXRDb3JyZWN0ZXIge1xuXHRyZXR1cm4gKHY6IHN0cmluZywgb3Y6IHN0cmluZyA9IFwiXCIpID0+IHtcblx0XHR2ID0gc3RyaXBXaGl0ZXNwYWNlKHYpXG5cdFx0aWYgKHYgPT09IFwiXCIpIHJldHVybiB2XG5cdFx0b3YgPSBzdHJpcFdoaXRlc3BhY2Uob3YpXG5cdFx0cmV0dXJuIGZuKHYsIG92KVxuXHR9XG59XG5cbi8qXG4gKiB0YWtlIGRpZ2l0cyBmcm9tIHRoZSBzdGFydCBvZiByZXN0IGFuZCBhZGQgdGhlbSB0byB0aGUgZW5kIG9mIHJldCB1bnRpbCBhIG5vbi1kaWdpdCBpcyBlbmNvdW50ZXJlZC5cbiAqIGRpc2NhcmRzIHJlc3QgZnJvbSBmaXJzdCBub24tZGlnaXQuXG4gKlxuICogcmV0dXJucyBtb2RpZmllZCByZXN0IGFuZCByZXRcbiAqL1xuZnVuY3Rpb24gbm9tRGlnaXRzVW50aWxMZW5ndGgocmVzdDogc3RyaW5nLCByZXQ6IHN0cmluZywgbGVuZ3RoOiBudW1iZXIpOiB7IHJlc3Q6IHN0cmluZzsgcmV0OiBzdHJpbmcgfSB7XG5cdHdoaWxlIChyZXN0Lmxlbmd0aCA+IDAgJiYgcmV0Lmxlbmd0aCA8IGxlbmd0aCkge1xuXHRcdGNvbnN0IG5leHQgPSByZXN0WzBdXG5cdFx0cmVzdCA9IHJlc3Quc2xpY2UoMSlcblx0XHRpZiAoYWxsRGlnaXRzLmluY2x1ZGVzKG5leHQpKSB7XG5cdFx0XHRyZXQgKz0gbmV4dFxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXN0ID0gXCJcIlxuXHRcdFx0YnJlYWtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHsgcmVzdCwgcmV0IH1cbn1cblxuLyoqXG4gKiB0YWtlIGEgZGF0ZSBpbnB1dCBzdHJpbmcgYW5kIGEgcHJldmlvdXMgdmFsdWUgdG8gcmVuZGVyIGEgdmVyc2lvbiB0aGF0J3Mgbm9uLWFtYmlndW91c1xuICogYW5kIGNvbmZvcm1zIHRvIGEgdmFsaWQgcHJlZml4IG9mIHRoZSBcIk1NIC8gWVlcIiBvciBcIk1NIC8gWVlZWVwiIGZvcm1hdCBpbiB0aGUgMjAwMC0yMDk5IGRhdGUgcmFuZ2UuXG4gKiAtIHNob3VsZCB3b3JrIHdpdGggcHJlLWVtcHRpdmVseSBhZGRpbmcvcmVtb3ZpbmcgdGhlIGJhY2tzbGFzaFxuICogLSBzaG91bGQgcmVmb3JtYXQgcGFzdGVkIGlucHV0XG4gKiAtIGlnbm9yZXMgaW52YWxpZCBpbnB1dCBjaGFyYWN0ZXJzIGFuZCBhbnkgbGVmdG92ZXIgaW5wdXQuXG4gKlxuICogRVhBTVBMRVM6IG5ldywgb2xkIC0+IG91dHB1dCAoZm9yIG1vcmUsIGxvb2sgYXQgdGhlIENyZWRpdENhcmRWaWV3TW9kZWxUZXN0LnRzKTpcbiAqIFwiMVwiIC0+IFwiMVwiIFx0XHRcdFx0YW1iaWd1b3VzLCB3ZSBjYW4ndCBjb21wbGV0ZSB0aGlzXG4gKiBcIjAwXCIsIFwiMFwiIC0+IFwiMFwiICAgICBcdGludmFsaWQgaW5wdXQgY2hhcmFjdGVyXG4gKiBcIjNcIiwgXCJcIiAtPiBcIjAzIC8gXCIgICAgICAgdGhpcyBtdXN0IGJlIG1hcmNoLCB0aGVyZSBhcmUgbm8gbW9udGhzIHN0YXJ0aW5nIHdpdGggM1xuICogXCIxM1wiLCBcIjFcIiAtPiBcIjAxIC8gM1wiICAgIDEzIGFzIGEgbW9udGggaXMgaW52YWxpZCwgdGhlIDEgbXVzdCBoYXZlIGJlZW4gamFudWFyeSBhbmQgMyBwYXJ0IG9mIHRoZSB5ZWFyXG4gKiBcIjAxIC9cIiwgXCIwMSAvIDJcIiAtPiBcIjAxXCIgcHJlLWVtcHRpdmVseSByZW1vdmUgYmFja3NsYXNoIGlmIHRoZSB1c2VyIGJhY2tzcGFjZXMgYWNyb3NzIGl0XG4gKiBcIjAxMjZcIiwgXCJcIiAtPiBcIjAxIC8gMjZcIiAgaWYgdGhlIGlucHV0IGlzIHZhbGlkLCB3ZSBzdGlsbCBhZGQgdGhlIHNlcGFyYXRvciBldmVuIHdoZW4gcGFzdGluZy5cbiAqXG4gKiBAcGFyYW0gdmFsdWUgdGhlIG5ldyB2YWx1ZSBvZiB0aGUgKHBvdGVudGlhbGx5IHBhcnRpYWwpIGV4cGlyYXRpb24gZGF0ZVxuICogQHBhcmFtIG9sZERhdGUgdGhlIHByZXZpb3VzIHZhbHVlLCBuZWVkZWQgZm9yIHNvbWUgc3BlY2lhbCBiYWNrc3BhY2UgaGFuZGxpbmcuXG4gKi9cbmV4cG9ydCBjb25zdCBpbmZlckV4cGlyYXRpb25EYXRlID0gbm9ybWFsaXplSW5wdXQoaW5mZXJOb3JtYWxpemVkRXhwaXJhdGlvbkRhdGUpXG5cbi8qKlxuICpcbiAqIEBwYXJhbSB2YWx1ZSBub24tZW1wdHkgc3RyaW5nIHdpdGhvdXQgd2hpdGVzcGFjZSBzcGVjaWZ5aW5nIGEgKHBvdGVudGlhbGx5IHBhcnRpYWwpIGRhdGUgYXMgYSBzZXF1ZW5jZSBvZiAwIHRvIDYgZGlnaXRzLlxuICogQHBhcmFtIG9sZERhdGUgcHJldmlvdXMgdmFsdWVcbiAqL1xuZnVuY3Rpb24gaW5mZXJOb3JtYWxpemVkRXhwaXJhdGlvbkRhdGUodmFsdWU6IHN0cmluZywgb2xkRGF0ZTogc3RyaW5nKTogc3RyaW5nIHtcblx0aWYgKG9sZERhdGUuc3RhcnRzV2l0aCh2YWx1ZSkgJiYgdmFsdWUuZW5kc1dpdGgoc2VwYXJhdG9yKSkge1xuXHRcdC8vIHByb2JhYmx5IHVzZWQgYmFja3NwYWNlLiBpbiB0aGlzIGNhc2UsIHdlIG5lZWQgdG8gcmVtb3ZlIHRoZSBzZXBhcmF0b3Jcblx0XHQvLyBpbiBhIHNwZWNpYWwgd2F5IHRvIGJlIGNvbnNpc3RlbnQuXG5cdFx0cmV0dXJuIHZhbHVlLnNsaWNlKDAsIC0xKVxuXHR9XG5cdGlmICghYWxsRGlnaXRzLmluY2x1ZGVzKHZhbHVlWzBdKSkgcmV0dXJuIFwiXCJcblx0bGV0IHJlc3QgPSB2YWx1ZVxuXHRsZXQgcmV0ID0gXCJcIlxuXHRpZiAoZGVmaW5pdGVNb250aERpZ2l0cy5pbmNsdWRlcyhyZXN0WzBdKSkge1xuXHRcdC8vIHdlIGFscmVhZHkga25vdyB3aGF0IG1vbnRoIHRoaXMgbXVzdCBiZSAodHlwZWQgd2l0aG91dCBsZWFkaW5nIHplcm8pXG5cdFx0cmV0ID0gXCIwXCIgKyByZXN0WzBdXG5cdFx0cmVzdCA9IHJlc3Quc2xpY2UoMSlcblx0fSBlbHNlIHtcblx0XHQvLyB3ZSBkb24ndCBrbm93IHlldCBpZiB3ZSBoYXZlIDAxLCAwMiwgLi4uLCAwOSBvciAxMCwgMTEsIDEyXG5cdFx0aWYgKHJlc3RbMF0gPT09IFwiMFwiKSB7XG5cdFx0XHRyZXQgPSBcIjBcIlxuXHRcdFx0cmVzdCA9IHJlc3Quc2xpY2UoMSlcblx0XHRcdGlmIChyZXN0WzBdID09PSBcIjBcIikge1xuXHRcdFx0XHQvLyBzdGFydGVkIHdpdGggXCIwMFwiXG5cdFx0XHRcdHJldHVybiBcIjBcIlxuXHRcdFx0fSBlbHNlIGlmIChhbGxEaWdpdHMuaW5jbHVkZXMocmVzdFswXSkpIHtcblx0XHRcdFx0Ly8gc3RhcnRlZCB3aXRoIFwiMHhcIiB4IGJlaW5nIGEgZGlnaXRcblx0XHRcdFx0cmV0ID0gXCIwXCIgKyByZXN0WzBdXG5cdFx0XHRcdHJlc3QgPSByZXN0LnNsaWNlKDEpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBzdGFydGVkIHdpdGggMHggeCBub3QgYmVpbmcgYSBub24temVybyBkaWdpdC5cblx0XHRcdFx0cmV0dXJuIFwiMFwiXG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICh2YWx1ZS5sZW5ndGggPiAxKSB7XG5cdFx0XHQvKiBpbnB1dCBzdGFydGVkIHdpdGggMSAqL1xuXHRcdFx0cmVzdCA9IHJlc3Quc2xpY2UoMSlcblx0XHRcdGlmIChzZWNvbmRNb250aERpZ2l0cy5pbmNsdWRlcyhyZXN0WzBdKSkge1xuXHRcdFx0XHRyZXQgPSBcIjFcIiArIHJlc3RbMF1cblx0XHRcdFx0cmVzdCA9IHJlc3Quc2xpY2UoMSlcblx0XHRcdH0gZWxzZSBpZiAoYWxsRGlnaXRzLmluY2x1ZGVzKHJlc3RbMF0pKSB7XG5cdFx0XHRcdC8vIGFueSBkaWdpdCBvdGhlciB0aGFuIDAsMSwyIGFmdGVyIFwiMVwiIG11c3QgbWVhbiBqYW51YXJ5XG5cdFx0XHRcdHJldCA9IFwiMDFcIlxuXHRcdFx0XHQvLyBub3QgcmVtb3ZpbmcgYSBzbGFzaCBvciBpbnB1dCB0aGF0J3MgcGFydCBvZiB0aGUgeWVhciBoZXJlLlxuXHRcdFx0fSBlbHNlIGlmIChyZXN0WzBdID09PSBzZXBhcmF0b3IpIHtcblx0XHRcdFx0cmV0ID0gXCIwMVwiXG5cdFx0XHRcdC8vIG5vdCBzdHJpcHBpbmcgc2VwYXJhdG9yIGhlcmUsIHdlIGRvIHRoYXQgbGF0ZXIgYW55d2F5XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyAxeC4uLiAtPiB4IGlzIGludmFsaWQgaW4gdGhpcyBwb3NpdGlvblxuXHRcdFx0XHRyZXR1cm4gXCIxXCJcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0LyogaW5wdXQgd2FzIGV4YWN0bHkgXCIxXCIgKi9cblx0XHRcdHJldHVybiBcIjFcIlxuXHRcdH1cblx0fVxuXG5cdGxldCBoYWRTbGFzaCA9IGZhbHNlXG5cdHdoaWxlIChyZXN0LnN0YXJ0c1dpdGgoc2VwYXJhdG9yKSkge1xuXHRcdGhhZFNsYXNoID0gdHJ1ZVxuXHRcdHJlc3QgPSByZXN0LnNsaWNlKDEpXG5cdH1cblxuXHRpZiAoKHJldC5sZW5ndGggPT09IDIgJiYgcmVzdC5sZW5ndGggPiAwKSB8fCBoYWRTbGFzaCB8fCB2YWx1ZS5sZW5ndGggPiBvbGREYXRlLmxlbmd0aCkge1xuXHRcdC8vIGlmIHRoZXJlIGlzIG1vcmUgaW5wdXQgb3IgdGhlIHVzZXIgYWRkZWQgYSBzbGFzaCBhdCB0aGUgZW5kIG9mIHRoZSBtb250aCBvciB0aGUgbW9udGgganVzdCBnb3QgZmluaXNoZWQsXG5cdFx0Ly8gd2UgbmVlZCBhIHNsYXNoXG5cdFx0cmV0ICs9IHNlcGFyYXRvclxuXHR9XG5cblx0Ly8gd2UgaGF2ZSBhIG1vbnRoICsgc2xhc2ggKyBwb3RlbnRpYWxseSBmaXJzdCB5ZWFyIGRpZ2l0XG5cdC8vIHJlc3QgY29udGFpbnMgb25seSB0aGUgcGFydCBvZiB0aGUgaW5wdXQgdGhhdCBpcyByZWxldmFudCB0byB0aGUgeWVhclxuXHQ7KHsgcmVzdCwgcmV0IH0gPSBub21EaWdpdHNVbnRpbExlbmd0aChyZXN0LCByZXQsIFwieHgveHhcIi5sZW5ndGgpKVxuXG5cdGlmICghcmV0LmVuZHNXaXRoKFwiLzIwXCIpKSB7XG5cdFx0Ly8gd2Ugb25seSBjb25zaWRlciB5ZWFycyBpbiB0aGUgMjAwMC0yMDk5IHJhbmdlIHZhbGlkLCB3aGljaFxuXHRcdC8vIG1lYW5zIHdlIGNhbiBhc3N1bWUgdHdvLWRpZ2l0IHllYXIgYW5kIHJldHVybi5cblx0XHRyZXR1cm4gcmV0LnJlcGxhY2Uoc2VwYXJhdG9yLCBuaWNlU2VwYXJhdG9yKVxuXHR9XG5cblx0Oyh7IHJldCB9ID0gbm9tRGlnaXRzVW50aWxMZW5ndGgocmVzdCwgcmV0LCBcInh4L3h4eHhcIi5sZW5ndGgpKVxuXG5cdHJldHVybiByZXQucmVwbGFjZShzZXBhcmF0b3IsIG5pY2VTZXBhcmF0b3IpXG59XG5cbi8qKlxuICogdGFrZSBhIHNlcXVlbmNlIG9mIGRpZ2l0cyBhbmQgb3RoZXIgY2hhcmFjdGVycywgc3RyaXAgbm9uLWRpZ2l0cyBhbmQgZ3JvdXAgdGhlIHJlc3QgaW50byBzcGFjZS1zZXBhcmF0ZWQgZ3JvdXBzLlxuICogQHBhcmFtIHZhbHVlIG5vbi1lbXB0eSBzdHJpbmcgd2l0aG91dCB3aGl0ZXNwYWNlIHNwZWNpZnlpbmcgYSAocG90ZW50aWFsbHkgcGFydGlhbCkgY3JlZGl0IGNhcmQgbnVtYmVyXG4gKiBAcGFyYW0gZ3JvdXBzIG1vc3QgY3JlZGl0IGNhcmQgbnVtYmVyIGRpZ2l0cyBhcmUgZ3JvdXBlZCBpbiBncm91cHMgb2YgNCwgYnV0IHRoZXJlIGFyZSBleGNlcHRpb25zXG4gKi9cbmZ1bmN0aW9uIGdyb3VwQ3JlZGl0Q2FyZE51bWJlcih2YWx1ZTogc3RyaW5nLCBncm91cHM6IG51bWJlcltdID0gWzQsIDQsIDQsIDQsIDRdKTogc3RyaW5nIHtcblx0dmFsdWUgPSBzdHJpcE5vbkRpZ2l0cyh2YWx1ZSlcblx0dmFsdWUgPSB2YWx1ZS5zbGljZSgwLCAyMClcblx0bGV0IHJldCA9IHZhbHVlLnNsaWNlKDAsIGdyb3Vwc1swXSlcblx0dmFsdWUgPSB2YWx1ZS5zbGljZShncm91cHNbMF0pXG5cdGZvciAobGV0IGkgPSAxOyBpIDwgZ3JvdXBzLmxlbmd0aCAmJiB2YWx1ZS5sZW5ndGggPiAwOyBpKyspIHtcblx0XHRyZXQgKz0gXCIgXCJcblx0XHRyZXQgKz0gdmFsdWUuc2xpY2UoMCwgZ3JvdXBzW2ldKVxuXHRcdHZhbHVlID0gdmFsdWUuc2xpY2UoZ3JvdXBzW2ldKVxuXHR9XG5cdHJldHVybiByZXRcbn1cblxuLypcbiAqIGV4dHJhY3QgYSBudW1lcmljIG1vbnRoIGFuZCB5ZWFyIGZyb20gYW4gZXhwaXJhdGlvbiBkYXRlIGluIHRoZSBmb3JtIFwiTS4uLiAvIFkuLi5cIlxuICogaWYgdGhlIGZvcm1hdCBpcyBpbnZhbGlkICh3cm9uZyBzZXBhcmF0b3IsIG1vbnRoIG5vdCAxIC0gMTIsIGludmFsaWQgbnVtYmVycywgeWVhciBub3QgaW4gMjAwMCAtIDIwOTkgcmFuZ2UpIHJldHVybiBudWxsLlxuICogb3RoZXJ3aXNlLCByZXR1cm4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIHllYXIgYW5kIG1vbnRoIHByb3BlcnRpZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRFeHBpcmF0aW9uTW9udGhBbmRZZWFyKGV4cGlyYXRpb25EYXRlOiBzdHJpbmcpOiB7IHllYXI6IG51bWJlcjsgbW9udGg6IG51bWJlciB9IHwgbnVsbCB7XG5cdGlmIChleHBpcmF0aW9uRGF0ZS5sZW5ndGggPCBcInh4IC8geHhcIi5sZW5ndGggfHwgIWV4cGlyYXRpb25EYXRlLmluY2x1ZGVzKFwiIC8gXCIpKSB7XG5cdFx0cmV0dXJuIG51bGxcblx0fVxuXHRjb25zdCBbbW9udGhTdHJpbmcsIHllYXJTdHJpbmddID0gZXhwaXJhdGlvbkRhdGUuc3BsaXQoXCIgLyBcIikubWFwKChwKSA9PiBwLnRyaW0oKSlcblx0aWYgKCFpc0RpZ2l0U3RyaW5nKG1vbnRoU3RyaW5nKSB8fCAhaXNEaWdpdFN0cmluZyh5ZWFyU3RyaW5nKSkge1xuXHRcdHJldHVybiBudWxsXG5cdH1cblx0Y29uc3QgbW9udGhOdW1iZXIgPSBOdW1iZXIobW9udGhTdHJpbmcpXG5cdGlmIChtb250aE51bWJlciA8IDEgfHwgbW9udGhOdW1iZXIgPiAxMikge1xuXHRcdHJldHVybiBudWxsXG5cdH1cblx0Y29uc3QgeWVhck51bWJlciA9IE51bWJlcih5ZWFyU3RyaW5nKVxuXHRpZiAoeWVhclN0cmluZy5sZW5ndGggPT09IDQgJiYgeWVhclN0cmluZy5zdGFydHNXaXRoKFwiMjBcIikpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0eWVhcjogTWF0aC5mbG9vcih5ZWFyTnVtYmVyKSAtIDIwMDAsXG5cdFx0XHRtb250aDogTWF0aC5mbG9vcihtb250aE51bWJlciksXG5cdFx0fVxuXHR9IGVsc2UgaWYgKHllYXJTdHJpbmcubGVuZ3RoID09PSAyKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHllYXI6IE1hdGguZmxvb3IoeWVhck51bWJlciksXG5cdFx0XHRtb250aDogTWF0aC5mbG9vcihtb250aE51bWJlciksXG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBudWxsXG5cdH1cbn1cblxuZXhwb3J0IGNsYXNzIFNpbXBsaWZpZWRDcmVkaXRDYXJkVmlld01vZGVsIGltcGxlbWVudHMgQ0NWaWV3TW9kZWwge1xuXHRwcml2YXRlIF9jYXJkSG9sZGVyTmFtZTogc3RyaW5nID0gXCJcIlxuXHRwcml2YXRlIF9jcmVkaXRDYXJkTnVtYmVyOiBzdHJpbmcgPSBcIlwiXG5cdHByaXZhdGUgX2N2djogc3RyaW5nID0gXCJcIlxuXHRwcml2YXRlIF9leHBpcmF0aW9uRGF0ZTogc3RyaW5nID0gXCJcIlxuXG5cdHByaXZhdGUgY3JlZGl0Q2FyZFR5cGU6IENhcmRUeXBlID0gQ2FyZFR5cGUuT3RoZXJcblxuXHRjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IGxhbmc6IExhbmd1YWdlVmlld01vZGVsKSB7fVxuXG5cdGdldCBleHBpcmF0aW9uRGF0ZSgpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLl9leHBpcmF0aW9uRGF0ZVxuXHR9XG5cblx0c2V0IGV4cGlyYXRpb25EYXRlKHZhbHVlOiBzdHJpbmcpIHtcblx0XHR0aGlzLl9leHBpcmF0aW9uRGF0ZSA9IGluZmVyRXhwaXJhdGlvbkRhdGUodmFsdWUsIHRoaXMuX2V4cGlyYXRpb25EYXRlKVxuXHR9XG5cblx0Z2V0IGN2digpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLl9jdnZcblx0fVxuXG5cdHNldCBjdnYodmFsdWU6IHN0cmluZykge1xuXHRcdGNvbnN0IGNvcnJlY3RlZEN2diA9IHN0cmlwV2hpdGVzcGFjZShzdHJpcE5vbkRpZ2l0cyh2YWx1ZSkpXG5cdFx0dGhpcy5fY3Z2ID0gY29ycmVjdGVkQ3Z2LnNsaWNlKDAsIDQpXG5cdH1cblxuXHRnZXQgY3JlZGl0Q2FyZE51bWJlcigpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLl9jcmVkaXRDYXJkTnVtYmVyXG5cdH1cblxuXHRzZXQgY3JlZGl0Q2FyZE51bWJlcih2YWx1ZTogc3RyaW5nKSB7XG5cdFx0bGV0IGNsZWFuZWROdW1iZXIgPSBzdHJpcE5vbkRpZ2l0cyhzdHJpcFdoaXRlc3BhY2UodmFsdWUpKVxuXHRcdHRoaXMuY3JlZGl0Q2FyZFR5cGUgPSBnZXRDYXJkVHlwZVJhbmdlKGNsZWFuZWROdW1iZXIpXG5cdFx0dGhpcy5fY3JlZGl0Q2FyZE51bWJlciA9XG5cdFx0XHR0aGlzLmNyZWRpdENhcmRUeXBlID09PSBDYXJkVHlwZS5BbWV4ID8gZ3JvdXBDcmVkaXRDYXJkTnVtYmVyKGNsZWFuZWROdW1iZXIsIFs0LCA2LCA1LCA1XSkgOiBncm91cENyZWRpdENhcmROdW1iZXIoY2xlYW5lZE51bWJlcilcblx0fVxuXG5cdGdldCBjYXJkSG9sZGVyTmFtZSgpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLl9jYXJkSG9sZGVyTmFtZVxuXHR9XG5cblx0c2V0IGNhcmRIb2xkZXJOYW1lKHZhbHVlOiBzdHJpbmcpIHtcblx0XHQvLyBuby1vcCBmb3Igbm93LlxuXHR9XG5cblx0dmFsaWRhdGVDcmVkaXRDYXJkUGF5bWVudERhdGEoKTogVHJhbnNsYXRpb25LZXkgfCBudWxsIHtcblx0XHRjb25zdCBjYyA9IHRoaXMuZ2V0Q3JlZGl0Q2FyZERhdGEoKVxuXHRcdGNvbnN0IGludmFsaWROdW1iZXIgPSB0aGlzLnZhbGlkYXRlQ3JlZGl0Q2FyZE51bWJlcihjYy5udW1iZXIpXG5cdFx0aWYgKGludmFsaWROdW1iZXIpIHtcblx0XHRcdHJldHVybiBpbnZhbGlkTnVtYmVyXG5cdFx0fVxuXHRcdGNvbnN0IGludmFsaWRDVlYgPSB0aGlzLnZhbGlkYXRlQ1ZWKGNjLmN2dilcblx0XHRpZiAoaW52YWxpZENWVikge1xuXHRcdFx0cmV0dXJuIGludmFsaWRDVlZcblx0XHR9XG5cdFx0Y29uc3QgaW52YWxpZEV4cGlyYXRpb25EYXRlID0gdGhpcy5nZXRFeHBpcmF0aW9uRGF0ZUVycm9ySGludCgpXG5cdFx0aWYgKGludmFsaWRFeHBpcmF0aW9uRGF0ZSkge1xuXHRcdFx0cmV0dXJuIGludmFsaWRFeHBpcmF0aW9uRGF0ZVxuXHRcdH1cblx0XHRyZXR1cm4gbnVsbFxuXHR9XG5cblx0dmFsaWRhdGVDcmVkaXRDYXJkTnVtYmVyKG51bWJlcjogc3RyaW5nKTogVHJhbnNsYXRpb25LZXkgfCBudWxsIHtcblx0XHRpZiAobnVtYmVyID09PSBcIlwiKSB7XG5cdFx0XHRyZXR1cm4gXCJjcmVkaXRDYXJkTnVtYmVyRm9ybWF0X21zZ1wiXG5cdFx0fSBlbHNlIGlmICghaXNWYWxpZENyZWRpdENhcmROdW1iZXIobnVtYmVyKSkge1xuXHRcdFx0cmV0dXJuIFwiY3JlZGl0Q2FyZE51bWJlckludmFsaWRfbXNnXCJcblx0XHR9XG5cdFx0cmV0dXJuIG51bGxcblx0fVxuXG5cdHZhbGlkYXRlQ1ZWKGN2djogc3RyaW5nKTogVHJhbnNsYXRpb25LZXkgfCBudWxsIHtcblx0XHRpZiAoY3Z2Lmxlbmd0aCA8IDMgfHwgY3Z2Lmxlbmd0aCA+IDQpIHtcblx0XHRcdHJldHVybiBcImNyZWRpdENhcmRDVlZGb3JtYXRfbGFiZWxcIlxuXHRcdH1cblx0XHRyZXR1cm4gbnVsbFxuXHR9XG5cblx0Z2V0Q3JlZGl0Q2FyZE51bWJlckhpbnQoKTogc3RyaW5nIHwgbnVsbCB7XG5cdFx0Y29uc3Qgc3BlYyA9IENhcmRTcGVjc1t0aGlzLmNyZWRpdENhcmRUeXBlXVxuXHRcdGlmICh0aGlzLmNyZWRpdENhcmRUeXBlID09PSBDYXJkVHlwZS5PdGhlcikge1xuXHRcdFx0cmV0dXJuIG51bGxcblx0XHR9XG5cdFx0cmV0dXJuIHNwZWMubmFtZVxuXHR9XG5cblx0Z2V0Q3JlZGl0Q2FyZE51bWJlckVycm9ySGludCgpOiBzdHJpbmcgfCBudWxsIHtcblx0XHRyZXR1cm4gdGhpcy52YWxpZGF0ZUNyZWRpdENhcmROdW1iZXIodGhpcy5fY3JlZGl0Q2FyZE51bWJlcikgPyB0aGlzLmxhbmcuZ2V0KFwiY3JlZGl0Q2FyZE51bWJlckludmFsaWRfbXNnXCIpIDogbnVsbFxuXHR9XG5cblx0LyoqXG5cdCAqIHJldHVybiBhIHRyYW5zbGF0aW9uIHN0cmluZyBkZXRhaWxpbmcgd2hhdCdzIHdyb25nIHdpdGggdGhlXG5cdCAqIGNvbnRlbnRzIG9mIHRoZSBleHBpcmF0aW9uIGRhdGUgZmllbGQsIGlmIGFueS5cblx0ICovXG5cdGdldEV4cGlyYXRpb25EYXRlRXJyb3JIaW50KCk6IFRyYW5zbGF0aW9uS2V5IHwgbnVsbCB7XG5cdFx0Y29uc3QgZXhwaXJhdGlvbiA9IGdldEV4cGlyYXRpb25Nb250aEFuZFllYXIodGhpcy5fZXhwaXJhdGlvbkRhdGUpXG5cdFx0aWYgKGV4cGlyYXRpb24gPT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuIFwiY3JlZGl0Q2FyZEV4cHJhdGlvbkRhdGVJbnZhbGlkX21zZ1wiXG5cdFx0fVxuXHRcdGNvbnN0IHRvZGF5ID0gbmV3IERhdGUoKVxuXHRcdGNvbnN0IGN1cnJlbnRZZWFyID0gdG9kYXkuZ2V0RnVsbFllYXIoKSAtIDIwMDBcblx0XHRjb25zdCBjdXJyZW50TW9udGggPSB0b2RheS5nZXRNb250aCgpICsgMVxuXHRcdGNvbnN0IHsgeWVhciwgbW9udGggfSA9IGV4cGlyYXRpb25cblx0XHRpZiAoeWVhciA+IGN1cnJlbnRZZWFyIHx8ICh5ZWFyID09PSBjdXJyZW50WWVhciAmJiBtb250aCA+PSBjdXJyZW50TW9udGgpKSB7XG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdH1cblx0XHRyZXR1cm4gXCJjcmVkaXRDYXJkRXhwaXJlZF9tc2dcIlxuXHR9XG5cblx0Z2V0Q3Z2SGludCgpOiBzdHJpbmcgfCBudWxsIHtcblx0XHRpZiAodGhpcy5jcmVkaXRDYXJkVHlwZSA9PT0gQ2FyZFR5cGUuT3RoZXIpIHtcblx0XHRcdHJldHVybiBudWxsXG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IHNwZWMgPSBDYXJkU3BlY3NbdGhpcy5jcmVkaXRDYXJkVHlwZV1cblx0XHRcdHJldHVybiB0aGlzLmxhbmcuZ2V0KFwiY3JlZGl0Q2FyZEN2dkhpbnRfbXNnXCIsIHsgXCJ7Y3VycmVudERpZ2l0c31cIjogdGhpcy5jdnYubGVuZ3RoLCBcInt0b3RhbERpZ2l0c31cIjogc3BlYy5jdnZMZW5ndGggfSlcblx0XHR9XG5cdH1cblxuXHRnZXRDdnZFcnJvckhpbnQoKTogc3RyaW5nIHwgbnVsbCB7XG5cdFx0Y29uc3Qgc3BlYyA9IENhcmRTcGVjc1t0aGlzLmNyZWRpdENhcmRUeXBlXVxuXHRcdHJldHVybiB0aGlzLnZhbGlkYXRlQ1ZWKHRoaXMuY3Z2KSA/IHRoaXMubGFuZy5nZXQoXCJjcmVkaXRDYXJkU3BlY2lmaWNDVlZJbnZhbGlkX21zZ1wiLCB7IFwie3NlY3VyaXR5Q29kZX1cIjogc3BlYy5jdnZOYW1lIH0pIDogbnVsbFxuXHR9XG5cblx0Z2V0Q3Z2TGFiZWwoKTogc3RyaW5nIHtcblx0XHRpZiAodGhpcy5jcmVkaXRDYXJkVHlwZSA9PT0gQ2FyZFR5cGUuT3RoZXIpIHtcblx0XHRcdHJldHVybiB0aGlzLmxhbmcuZ2V0KFwiY3JlZGl0Q2FyZEN2dkxhYmVsTG9uZ19sYWJlbFwiLCB7IFwie2N2dk5hbWV9XCI6IENhcmRTcGVjc1tDYXJkVHlwZS5PdGhlcl0uY3Z2TmFtZSB9KVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBzcGVjID0gQ2FyZFNwZWNzW3RoaXMuY3JlZGl0Q2FyZFR5cGVdXG5cdFx0XHRyZXR1cm4gdGhpcy5sYW5nLmdldChcImNyZWRpdENhcmRDdnZMYWJlbExvbmdfbGFiZWxcIiwgeyBcIntjdnZOYW1lfVwiOiBzcGVjLmN2dk5hbWUgfSlcblx0XHR9XG5cdH1cblxuXHRnZXRDcmVkaXRDYXJkRGF0YSgpOiBDcmVkaXRDYXJkIHtcblx0XHRjb25zdCBleHBpcmF0aW9uID0gZ2V0RXhwaXJhdGlvbk1vbnRoQW5kWWVhcih0aGlzLl9leHBpcmF0aW9uRGF0ZSlcblx0XHRsZXQgY2MgPSBjcmVhdGVDcmVkaXRDYXJkKHtcblx0XHRcdG51bWJlcjogc3RyaXBXaGl0ZXNwYWNlKHRoaXMuX2NyZWRpdENhcmROdW1iZXIpLFxuXHRcdFx0Y2FyZEhvbGRlck5hbWU6IHRoaXMuX2NhcmRIb2xkZXJOYW1lLFxuXHRcdFx0Y3Z2OiB0aGlzLl9jdnYsXG5cdFx0XHRleHBpcmF0aW9uTW9udGg6IGV4cGlyYXRpb24gPyBTdHJpbmcoZXhwaXJhdGlvbi5tb250aCkgOiBcIlwiLFxuXHRcdFx0ZXhwaXJhdGlvblllYXI6IGV4cGlyYXRpb24gPyBTdHJpbmcoZXhwaXJhdGlvbi55ZWFyKSA6IFwiXCIsXG5cdFx0fSlcblx0XHRyZXR1cm4gY2Ncblx0fVxuXG5cdHNldENyZWRpdENhcmREYXRhKGRhdGE6IENyZWRpdENhcmQgfCBudWxsKTogdm9pZCB7XG5cdFx0aWYgKGRhdGEpIHtcblx0XHRcdHRoaXMuY3JlZGl0Q2FyZE51bWJlciA9IGRhdGEubnVtYmVyXG5cdFx0XHR0aGlzLmN2diA9IGRhdGEuY3Z2XG5cblx0XHRcdGlmIChkYXRhLmV4cGlyYXRpb25Nb250aCAmJiBkYXRhLmV4cGlyYXRpb25ZZWFyKSB7XG5cdFx0XHRcdHRoaXMuZXhwaXJhdGlvbkRhdGUgPSBkYXRhLmV4cGlyYXRpb25Nb250aCArIFwiIC8gXCIgKyBkYXRhLmV4cGlyYXRpb25ZZWFyXG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX2NyZWRpdENhcmROdW1iZXIgPSBcIlwiXG5cdFx0XHR0aGlzLl9jdnYgPSBcIlwiXG5cdFx0XHR0aGlzLl9leHBpcmF0aW9uRGF0ZSA9IFwiXCJcblx0XHR9XG5cdH1cbn1cbiIsImltcG9ydCBtLCB7IENoaWxkcmVuLCBWbm9kZSB9IGZyb20gXCJtaXRocmlsXCJcbmltcG9ydCB0eXBlIHsgVHJhbnNsYXRpb25LZXkgfSBmcm9tIFwiLi4vbWlzYy9MYW5ndWFnZVZpZXdNb2RlbFwiXG5pbXBvcnQgeyBsYW5nIH0gZnJvbSBcIi4uL21pc2MvTGFuZ3VhZ2VWaWV3TW9kZWxcIlxuaW1wb3J0IHR5cGUgeyBDb3VudHJ5IH0gZnJvbSBcIi4uL2FwaS9jb21tb24vQ291bnRyeUxpc3RcIlxuaW1wb3J0IHsgQ291bnRyeVR5cGUgfSBmcm9tIFwiLi4vYXBpL2NvbW1vbi9Db3VudHJ5TGlzdFwiXG5pbXBvcnQgeyBQYXltZW50RGF0YSwgUGF5bWVudE1ldGhvZFR5cGUgfSBmcm9tIFwiLi4vYXBpL2NvbW1vbi9UdXRhbm90YUNvbnN0YW50c1wiXG5pbXBvcnQgeyBQYXlQYWxMb2dvIH0gZnJvbSBcIi4uL2d1aS9iYXNlL2ljb25zL0ljb25zXCJcbmltcG9ydCB7IExhenlMb2FkZWQsIG5vT3AsIHByb21pc2VNYXAgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB7IHNob3dQcm9ncmVzc0RpYWxvZyB9IGZyb20gXCIuLi9ndWkvZGlhbG9ncy9Qcm9ncmVzc0RpYWxvZ1wiXG5pbXBvcnQgdHlwZSB7IEFjY291bnRpbmdJbmZvIH0gZnJvbSBcIi4uL2FwaS9lbnRpdGllcy9zeXMvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgQWNjb3VudGluZ0luZm9UeXBlUmVmIH0gZnJvbSBcIi4uL2FwaS9lbnRpdGllcy9zeXMvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgbG9jYXRvciB9IGZyb20gXCIuLi9hcGkvbWFpbi9Db21tb25Mb2NhdG9yXCJcbmltcG9ydCB7IE1lc3NhZ2VCb3ggfSBmcm9tIFwiLi4vZ3VpL2Jhc2UvTWVzc2FnZUJveC5qc1wiXG5pbXBvcnQgeyBweCB9IGZyb20gXCIuLi9ndWkvc2l6ZVwiXG5pbXBvcnQgU3RyZWFtIGZyb20gXCJtaXRocmlsL3N0cmVhbVwiXG5pbXBvcnQgeyBVc2FnZVRlc3QgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXVzYWdldGVzdHNcIlxuaW1wb3J0IHsgU2VsZWN0ZWRTdWJzY3JpcHRpb25PcHRpb25zIH0gZnJvbSBcIi4vRmVhdHVyZUxpc3RQcm92aWRlclwiXG5pbXBvcnQgeyBDQ1ZpZXdNb2RlbCwgU2ltcGxpZmllZENyZWRpdENhcmRJbnB1dCB9IGZyb20gXCIuL1NpbXBsaWZpZWRDcmVkaXRDYXJkSW5wdXQuanNcIlxuaW1wb3J0IHsgU2ltcGxpZmllZENyZWRpdENhcmRWaWV3TW9kZWwgfSBmcm9tIFwiLi9TaW1wbGlmaWVkQ3JlZGl0Q2FyZElucHV0TW9kZWwuanNcIlxuaW1wb3J0IHsgaXNVcGRhdGVGb3JUeXBlUmVmIH0gZnJvbSBcIi4uL2FwaS9jb21tb24vdXRpbHMvRW50aXR5VXBkYXRlVXRpbHMuanNcIlxuaW1wb3J0IHsgRW50aXR5RXZlbnRzTGlzdGVuZXIgfSBmcm9tIFwiLi4vYXBpL21haW4vRXZlbnRDb250cm9sbGVyLmpzXCJcbmltcG9ydCB7IEJhc2VCdXR0b24gfSBmcm9tIFwiLi4vZ3VpL2Jhc2UvYnV0dG9ucy9CYXNlQnV0dG9uLmpzXCJcblxuLyoqXG4gKiBDb21wb25lbnQgdG8gZGlzcGxheSB0aGUgaW5wdXQgZmllbGRzIGZvciBhIHBheW1lbnQgbWV0aG9kLiBUaGUgc2VsZWN0b3IgdG8gc3dpdGNoIGJldHdlZW4gcGF5bWVudCBtZXRob2RzIGlzIG5vdCBpbmNsdWRlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIFBheW1lbnRNZXRob2RJbnB1dCB7XG5cdHByaXZhdGUgcmVhZG9ubHkgY2NWaWV3TW9kZWw6IENDVmlld01vZGVsXG5cdF9wYXlQYWxBdHRyczogUGF5cGFsQXR0cnNcblx0X3NlbGVjdGVkQ291bnRyeTogU3RyZWFtPENvdW50cnkgfCBudWxsPlxuXHRfc2VsZWN0ZWRQYXltZW50TWV0aG9kOiBQYXltZW50TWV0aG9kVHlwZVxuXHRfc3Vic2NyaXB0aW9uT3B0aW9uczogU2VsZWN0ZWRTdWJzY3JpcHRpb25PcHRpb25zXG5cdF9hY2NvdW50aW5nSW5mbzogQWNjb3VudGluZ0luZm9cblx0X2VudGl0eUV2ZW50TGlzdGVuZXI6IEVudGl0eUV2ZW50c0xpc3RlbmVyXG5cdHByaXZhdGUgX19wYXltZW50UGF5cGFsVGVzdD86IFVzYWdlVGVzdFxuXG5cdGNvbnN0cnVjdG9yKFxuXHRcdHN1YnNjcmlwdGlvbk9wdGlvbnM6IFNlbGVjdGVkU3Vic2NyaXB0aW9uT3B0aW9ucyxcblx0XHRzZWxlY3RlZENvdW50cnk6IFN0cmVhbTxDb3VudHJ5IHwgbnVsbD4sXG5cdFx0YWNjb3VudGluZ0luZm86IEFjY291bnRpbmdJbmZvLFxuXHRcdHBheVBhbFJlcXVlc3RVcmw6IExhenlMb2FkZWQ8c3RyaW5nPixcblx0XHRkZWZhdWx0UGF5bWVudE1ldGhvZDogUGF5bWVudE1ldGhvZFR5cGUsXG5cdCkge1xuXHRcdHRoaXMuX3NlbGVjdGVkQ291bnRyeSA9IHNlbGVjdGVkQ291bnRyeVxuXHRcdHRoaXMuX3N1YnNjcmlwdGlvbk9wdGlvbnMgPSBzdWJzY3JpcHRpb25PcHRpb25zXG5cdFx0dGhpcy5jY1ZpZXdNb2RlbCA9IG5ldyBTaW1wbGlmaWVkQ3JlZGl0Q2FyZFZpZXdNb2RlbChsYW5nKVxuXHRcdHRoaXMuX2FjY291bnRpbmdJbmZvID0gYWNjb3VudGluZ0luZm9cblx0XHR0aGlzLl9wYXlQYWxBdHRycyA9IHtcblx0XHRcdHBheVBhbFJlcXVlc3RVcmwsXG5cdFx0XHRhY2NvdW50aW5nSW5mbzogdGhpcy5fYWNjb3VudGluZ0luZm8sXG5cdFx0fVxuXHRcdHRoaXMuX19wYXltZW50UGF5cGFsVGVzdCA9IGxvY2F0b3IudXNhZ2VUZXN0Q29udHJvbGxlci5nZXRUZXN0KFwicGF5bWVudC5wYXlwYWxcIilcblxuXHRcdHRoaXMuX2VudGl0eUV2ZW50TGlzdGVuZXIgPSAodXBkYXRlcykgPT4ge1xuXHRcdFx0cmV0dXJuIHByb21pc2VNYXAodXBkYXRlcywgKHVwZGF0ZSkgPT4ge1xuXHRcdFx0XHRpZiAoaXNVcGRhdGVGb3JUeXBlUmVmKEFjY291bnRpbmdJbmZvVHlwZVJlZiwgdXBkYXRlKSkge1xuXHRcdFx0XHRcdHJldHVybiBsb2NhdG9yLmVudGl0eUNsaWVudC5sb2FkKEFjY291bnRpbmdJbmZvVHlwZVJlZiwgdXBkYXRlLmluc3RhbmNlSWQpLnRoZW4oKGFjY291bnRpbmdJbmZvKSA9PiB7XG5cdFx0XHRcdFx0XHR0aGlzLl9fcGF5bWVudFBheXBhbFRlc3Q/LmdldFN0YWdlKDIpLmNvbXBsZXRlKClcblx0XHRcdFx0XHRcdHRoaXMuX2FjY291bnRpbmdJbmZvID0gYWNjb3VudGluZ0luZm9cblx0XHRcdFx0XHRcdHRoaXMuX3BheVBhbEF0dHJzLmFjY291bnRpbmdJbmZvID0gYWNjb3VudGluZ0luZm9cblx0XHRcdFx0XHRcdG0ucmVkcmF3KClcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9XG5cdFx0XHR9KS50aGVuKG5vT3ApXG5cdFx0fVxuXG5cdFx0dGhpcy5fc2VsZWN0ZWRQYXltZW50TWV0aG9kID0gZGVmYXVsdFBheW1lbnRNZXRob2Rcblx0fVxuXG5cdG9uY3JlYXRlKCkge1xuXHRcdGxvY2F0b3IuZXZlbnRDb250cm9sbGVyLmFkZEVudGl0eUxpc3RlbmVyKHRoaXMuX2VudGl0eUV2ZW50TGlzdGVuZXIpXG5cdH1cblxuXHRvbnJlbW92ZSgpIHtcblx0XHRsb2NhdG9yLmV2ZW50Q29udHJvbGxlci5yZW1vdmVFbnRpdHlMaXN0ZW5lcih0aGlzLl9lbnRpdHlFdmVudExpc3RlbmVyKVxuXHR9XG5cblx0dmlldygpOiBDaGlsZHJlbiB7XG5cdFx0c3dpdGNoICh0aGlzLl9zZWxlY3RlZFBheW1lbnRNZXRob2QpIHtcblx0XHRcdGNhc2UgUGF5bWVudE1ldGhvZFR5cGUuSW52b2ljZTpcblx0XHRcdFx0cmV0dXJuIG0oXG5cdFx0XHRcdFx0XCIuZmxleC1jZW50ZXJcIixcblx0XHRcdFx0XHRtKFxuXHRcdFx0XHRcdFx0TWVzc2FnZUJveCxcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRcdFx0XHRtYXJnaW5Ub3A6IHB4KDE2KSxcblx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHR0aGlzLmlzT25BY2NvdW50QWxsb3dlZCgpXG5cdFx0XHRcdFx0XHRcdD8gbGFuZy5nZXQoXCJwYXltZW50TWV0aG9kT25BY2NvdW50X21zZ1wiKSArIFwiIFwiICsgbGFuZy5nZXQoXCJwYXltZW50UHJvY2Vzc2luZ1RpbWVfbXNnXCIpXG5cdFx0XHRcdFx0XHRcdDogbGFuZy5nZXQoXCJwYXltZW50TWV0aG9kTm90QXZhaWxhYmxlX21zZ1wiKSxcblx0XHRcdFx0XHQpLFxuXHRcdFx0XHQpXG5cdFx0XHRjYXNlIFBheW1lbnRNZXRob2RUeXBlLkFjY291bnRCYWxhbmNlOlxuXHRcdFx0XHRyZXR1cm4gbShcblx0XHRcdFx0XHRcIi5mbGV4LWNlbnRlclwiLFxuXHRcdFx0XHRcdG0oXG5cdFx0XHRcdFx0XHRNZXNzYWdlQm94LFxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRzdHlsZToge1xuXHRcdFx0XHRcdFx0XHRcdG1hcmdpblRvcDogcHgoMTYpLFxuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdGxhbmcuZ2V0KFwicGF5bWVudE1ldGhvZEFjY291bnRCYWxhbmNlX21zZ1wiKSxcblx0XHRcdFx0XHQpLFxuXHRcdFx0XHQpXG5cdFx0XHRjYXNlIFBheW1lbnRNZXRob2RUeXBlLlBheXBhbDpcblx0XHRcdFx0cmV0dXJuIG0oUGF5cGFsSW5wdXQsIHRoaXMuX3BheVBhbEF0dHJzKVxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuIG0oU2ltcGxpZmllZENyZWRpdENhcmRJbnB1dCwgeyB2aWV3TW9kZWw6IHRoaXMuY2NWaWV3TW9kZWwgYXMgU2ltcGxpZmllZENyZWRpdENhcmRWaWV3TW9kZWwgfSlcblx0XHR9XG5cdH1cblxuXHRpc09uQWNjb3VudEFsbG93ZWQoKTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgY291bnRyeSA9IHRoaXMuX3NlbGVjdGVkQ291bnRyeSgpXG5cblx0XHRpZiAoIWNvdW50cnkpIHtcblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdH0gZWxzZSBpZiAodGhpcy5fYWNjb3VudGluZ0luZm8ucGF5bWVudE1ldGhvZCA9PT0gUGF5bWVudE1ldGhvZFR5cGUuSW52b2ljZSkge1xuXHRcdFx0cmV0dXJuIHRydWVcblx0XHR9IGVsc2UgaWYgKHRoaXMuX3N1YnNjcmlwdGlvbk9wdGlvbnMuYnVzaW5lc3NVc2UoKSAmJiBjb3VudHJ5LnQgIT09IENvdW50cnlUeXBlLk9USEVSKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHR9XG5cdH1cblxuXHRpc1BheXBhbEFzc2lnbmVkKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiBpc1BheXBhbEFzc2lnbmVkKHRoaXMuX2FjY291bnRpbmdJbmZvKVxuXHR9XG5cblx0dmFsaWRhdGVQYXltZW50RGF0YSgpOiBUcmFuc2xhdGlvbktleSB8IG51bGwge1xuXHRcdGlmICghdGhpcy5fc2VsZWN0ZWRQYXltZW50TWV0aG9kKSB7XG5cdFx0XHRyZXR1cm4gXCJpbnZvaWNlUGF5bWVudE1ldGhvZEluZm9fbXNnXCJcblx0XHR9IGVsc2UgaWYgKHRoaXMuX3NlbGVjdGVkUGF5bWVudE1ldGhvZCA9PT0gUGF5bWVudE1ldGhvZFR5cGUuSW52b2ljZSkge1xuXHRcdFx0aWYgKCF0aGlzLmlzT25BY2NvdW50QWxsb3dlZCgpKSB7XG5cdFx0XHRcdHJldHVybiBcInBheW1lbnRNZXRob2ROb3RBdmFpbGFibGVfbXNnXCJcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBudWxsXG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICh0aGlzLl9zZWxlY3RlZFBheW1lbnRNZXRob2QgPT09IFBheW1lbnRNZXRob2RUeXBlLlBheXBhbCkge1xuXHRcdFx0cmV0dXJuIGlzUGF5cGFsQXNzaWduZWQodGhpcy5fYWNjb3VudGluZ0luZm8pID8gbnVsbCA6IFwicGF5bWVudERhdGFQYXlQYWxMb2dpbl9tc2dcIlxuXHRcdH0gZWxzZSBpZiAodGhpcy5fc2VsZWN0ZWRQYXltZW50TWV0aG9kID09PSBQYXltZW50TWV0aG9kVHlwZS5DcmVkaXRDYXJkKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5jY1ZpZXdNb2RlbC52YWxpZGF0ZUNyZWRpdENhcmRQYXltZW50RGF0YSgpXG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBudWxsXG5cdFx0fVxuXHR9XG5cblx0dXBkYXRlUGF5bWVudE1ldGhvZCh2YWx1ZTogUGF5bWVudE1ldGhvZFR5cGUsIHBheW1lbnREYXRhPzogUGF5bWVudERhdGEpIHtcblx0XHR0aGlzLl9zZWxlY3RlZFBheW1lbnRNZXRob2QgPSB2YWx1ZVxuXG5cdFx0aWYgKHZhbHVlID09PSBQYXltZW50TWV0aG9kVHlwZS5DcmVkaXRDYXJkKSB7XG5cdFx0XHRpZiAocGF5bWVudERhdGEpIHtcblx0XHRcdFx0dGhpcy5jY1ZpZXdNb2RlbC5zZXRDcmVkaXRDYXJkRGF0YShwYXltZW50RGF0YS5jcmVkaXRDYXJkRGF0YSlcblx0XHRcdH1cblxuXHRcdFx0aWYgKHRoaXMuX19wYXltZW50UGF5cGFsVGVzdCkge1xuXHRcdFx0XHR0aGlzLl9fcGF5bWVudFBheXBhbFRlc3QuYWN0aXZlID0gZmFsc2Vcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKHZhbHVlID09PSBQYXltZW50TWV0aG9kVHlwZS5QYXlwYWwpIHtcblx0XHRcdHRoaXMuX3BheVBhbEF0dHJzLnBheVBhbFJlcXVlc3RVcmwuZ2V0QXN5bmMoKS50aGVuKCgpID0+IG0ucmVkcmF3KCkpXG5cblx0XHRcdGlmICh0aGlzLl9fcGF5bWVudFBheXBhbFRlc3QpIHtcblx0XHRcdFx0dGhpcy5fX3BheW1lbnRQYXlwYWxUZXN0LmFjdGl2ZSA9IHRydWVcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5fX3BheW1lbnRQYXlwYWxUZXN0Py5nZXRTdGFnZSgwKS5jb21wbGV0ZSgpXG5cdFx0fVxuXG5cdFx0bS5yZWRyYXcoKVxuXHR9XG5cblx0Z2V0UGF5bWVudERhdGEoKTogUGF5bWVudERhdGEge1xuXHRcdHJldHVybiB7XG5cdFx0XHRwYXltZW50TWV0aG9kOiB0aGlzLl9zZWxlY3RlZFBheW1lbnRNZXRob2QsXG5cdFx0XHRjcmVkaXRDYXJkRGF0YTogdGhpcy5fc2VsZWN0ZWRQYXltZW50TWV0aG9kID09PSBQYXltZW50TWV0aG9kVHlwZS5DcmVkaXRDYXJkID8gdGhpcy5jY1ZpZXdNb2RlbC5nZXRDcmVkaXRDYXJkRGF0YSgpIDogbnVsbCxcblx0XHR9XG5cdH1cblxuXHRnZXRWaXNpYmxlUGF5bWVudE1ldGhvZHMoKTogQXJyYXk8e1xuXHRcdG5hbWU6IHN0cmluZ1xuXHRcdHZhbHVlOiBQYXltZW50TWV0aG9kVHlwZVxuXHR9PiB7XG5cdFx0Y29uc3QgYXZhaWxhYmxlUGF5bWVudE1ldGhvZHMgPSBbXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWU6IGxhbmcuZ2V0KFwicGF5bWVudE1ldGhvZENyZWRpdENhcmRfbGFiZWxcIiksXG5cdFx0XHRcdHZhbHVlOiBQYXltZW50TWV0aG9kVHlwZS5DcmVkaXRDYXJkLFxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0bmFtZTogXCJQYXlQYWxcIixcblx0XHRcdFx0dmFsdWU6IFBheW1lbnRNZXRob2RUeXBlLlBheXBhbCxcblx0XHRcdH0sXG5cdFx0XVxuXG5cdFx0Ly8gc2hvdyBiYW5rIHRyYW5zZmVyIGluIGNhc2Ugb2YgYnVzaW5lc3MgdXNlLCBldmVuIGlmIGl0IGlzIG5vdCBhdmFpbGFibGUgZm9yIHRoZSBzZWxlY3RlZCBjb3VudHJ5XG5cdFx0aWYgKHRoaXMuX3N1YnNjcmlwdGlvbk9wdGlvbnMuYnVzaW5lc3NVc2UoKSB8fCB0aGlzLl9hY2NvdW50aW5nSW5mby5wYXltZW50TWV0aG9kID09PSBQYXltZW50TWV0aG9kVHlwZS5JbnZvaWNlKSB7XG5cdFx0XHRhdmFpbGFibGVQYXltZW50TWV0aG9kcy5wdXNoKHtcblx0XHRcdFx0bmFtZTogbGFuZy5nZXQoXCJwYXltZW50TWV0aG9kT25BY2NvdW50X2xhYmVsXCIpLFxuXHRcdFx0XHR2YWx1ZTogUGF5bWVudE1ldGhvZFR5cGUuSW52b2ljZSxcblx0XHRcdH0pXG5cdFx0fVxuXG5cdFx0Ly8gc2hvdyBhY2NvdW50IGJhbGFuY2Ugb25seSBpZiB0aGlzIGlzIHRoZSBjdXJyZW50IHBheW1lbnQgbWV0aG9kXG5cdFx0aWYgKHRoaXMuX2FjY291bnRpbmdJbmZvLnBheW1lbnRNZXRob2QgPT09IFBheW1lbnRNZXRob2RUeXBlLkFjY291bnRCYWxhbmNlKSB7XG5cdFx0XHRhdmFpbGFibGVQYXltZW50TWV0aG9kcy5wdXNoKHtcblx0XHRcdFx0bmFtZTogbGFuZy5nZXQoXCJwYXltZW50TWV0aG9kQWNjb3VudEJhbGFuY2VfbGFiZWxcIiksXG5cdFx0XHRcdHZhbHVlOiBQYXltZW50TWV0aG9kVHlwZS5BY2NvdW50QmFsYW5jZSxcblx0XHRcdH0pXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGF2YWlsYWJsZVBheW1lbnRNZXRob2RzXG5cdH1cbn1cblxudHlwZSBQYXlwYWxBdHRycyA9IHtcblx0cGF5UGFsUmVxdWVzdFVybDogTGF6eUxvYWRlZDxzdHJpbmc+XG5cdGFjY291bnRpbmdJbmZvOiBBY2NvdW50aW5nSW5mb1xufVxuXG5jbGFzcyBQYXlwYWxJbnB1dCB7XG5cdHByaXZhdGUgX19wYXltZW50UGF5cGFsVGVzdD86IFVzYWdlVGVzdFxuXG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMuX19wYXltZW50UGF5cGFsVGVzdCA9IGxvY2F0b3IudXNhZ2VUZXN0Q29udHJvbGxlci5nZXRUZXN0KFwicGF5bWVudC5wYXlwYWxcIilcblx0fVxuXG5cdHZpZXcodm5vZGU6IFZub2RlPFBheXBhbEF0dHJzPik6IENoaWxkcmVuIHtcblx0XHRsZXQgYXR0cnMgPSB2bm9kZS5hdHRyc1xuXHRcdHJldHVybiBbXG5cdFx0XHRtKFxuXHRcdFx0XHRcIi5mbGV4LWNlbnRlclwiLFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRcdFwibWFyZ2luLXRvcFwiOiBcIjUwcHhcIixcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRtKEJhc2VCdXR0b24sIHtcblx0XHRcdFx0XHRsYWJlbDogbGFuZy5tYWtlVHJhbnNsYXRpb24oXCJQYXlQYWxcIiwgXCJQYXlQYWxcIiksXG5cdFx0XHRcdFx0aWNvbjogbShcIi5wYXltZW50LWxvZ28uZmxleFwiLCBtLnRydXN0KFBheVBhbExvZ28pKSxcblx0XHRcdFx0XHRjbGFzczogXCJib3JkZXIgYm9yZGVyLXJhZGl1cyBiZy13aGl0ZSBidXR0b24taGVpZ2h0IHBsclwiLFxuXHRcdFx0XHRcdG9uY2xpY2s6ICgpID0+IHtcblx0XHRcdFx0XHRcdHRoaXMuX19wYXltZW50UGF5cGFsVGVzdD8uZ2V0U3RhZ2UoMSkuY29tcGxldGUoKVxuXHRcdFx0XHRcdFx0aWYgKGF0dHJzLnBheVBhbFJlcXVlc3RVcmwuaXNMb2FkZWQoKSkge1xuXHRcdFx0XHRcdFx0XHR3aW5kb3cub3BlbihhdHRycy5wYXlQYWxSZXF1ZXN0VXJsLmdldExvYWRlZCgpKVxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0c2hvd1Byb2dyZXNzRGlhbG9nKFwicGF5UGFsUmVkaXJlY3RfbXNnXCIsIGF0dHJzLnBheVBhbFJlcXVlc3RVcmwuZ2V0QXN5bmMoKSkudGhlbigodXJsKSA9PiB3aW5kb3cub3Blbih1cmwpKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdH0pLFxuXHRcdFx0KSxcblx0XHRcdG0oXG5cdFx0XHRcdFwiLnNtYWxsLnB0LmNlbnRlclwiLFxuXHRcdFx0XHRpc1BheXBhbEFzc2lnbmVkKGF0dHJzLmFjY291bnRpbmdJbmZvKVxuXHRcdFx0XHRcdD8gbGFuZy5nZXQoXCJwYXltZW50RGF0YVBheVBhbEZpbmlzaGVkX21zZ1wiLCB7XG5cdFx0XHRcdFx0XHRcdFwie2FjY291bnRBZGRyZXNzfVwiOiBhdHRycy5hY2NvdW50aW5nSW5mby5wYXltZW50TWV0aG9kSW5mbyA/PyBcIlwiLFxuXHRcdFx0XHRcdCAgfSlcblx0XHRcdFx0XHQ6IGxhbmcuZ2V0KFwicGF5bWVudERhdGFQYXlQYWxMb2dpbl9tc2dcIiksXG5cdFx0XHQpLFxuXHRcdF1cblx0fVxufVxuXG5mdW5jdGlvbiBpc1BheXBhbEFzc2lnbmVkKGFjY291bnRpbmdJbmZvOiBBY2NvdW50aW5nSW5mbyk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gYWNjb3VudGluZ0luZm8ucGF5cGFsQmlsbGluZ0FncmVlbWVudCAhPSBudWxsXG59XG4iLCJpbXBvcnQgbSwgeyBDaGlsZHJlbiwgVm5vZGUsIFZub2RlRE9NIH0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHsgRGlhbG9nLCBEaWFsb2dUeXBlIH0gZnJvbSBcIi4uL2d1aS9iYXNlL0RpYWxvZ1wiXG5pbXBvcnQgeyBsYW5nLCB0eXBlIFRyYW5zbGF0aW9uS2V5IH0gZnJvbSBcIi4uL21pc2MvTGFuZ3VhZ2VWaWV3TW9kZWxcIlxuaW1wb3J0IHR5cGUgeyBVcGdyYWRlU3Vic2NyaXB0aW9uRGF0YSB9IGZyb20gXCIuL1VwZ3JhZGVTdWJzY3JpcHRpb25XaXphcmRcIlxuaW1wb3J0IHsgSW52b2ljZURhdGFJbnB1dCwgSW52b2ljZURhdGFJbnB1dExvY2F0aW9uIH0gZnJvbSBcIi4vSW52b2ljZURhdGFJbnB1dFwiXG5pbXBvcnQgeyBQYXltZW50TWV0aG9kSW5wdXQgfSBmcm9tIFwiLi9QYXltZW50TWV0aG9kSW5wdXRcIlxuaW1wb3J0IHN0cmVhbSBmcm9tIFwibWl0aHJpbC9zdHJlYW1cIlxuaW1wb3J0IFN0cmVhbSBmcm9tIFwibWl0aHJpbC9zdHJlYW1cIlxuaW1wb3J0IHtcblx0Z2V0Q2xpZW50VHlwZSxcblx0Z2V0RGVmYXVsdFBheW1lbnRNZXRob2QsXG5cdEludm9pY2VEYXRhLFxuXHRLZXlzLFxuXHRQYXltZW50RGF0YSxcblx0UGF5bWVudERhdGFSZXN1bHRUeXBlLFxuXHRQYXltZW50TWV0aG9kVHlwZSxcblx0UGF5bWVudE1ldGhvZFR5cGVUb05hbWUsXG59IGZyb20gXCIuLi9hcGkvY29tbW9uL1R1dGFub3RhQ29uc3RhbnRzXCJcbmltcG9ydCB7IHNob3dQcm9ncmVzc0RpYWxvZyB9IGZyb20gXCIuLi9ndWkvZGlhbG9ncy9Qcm9ncmVzc0RpYWxvZ1wiXG5pbXBvcnQgdHlwZSB7IEFjY291bnRpbmdJbmZvLCBCcmFpbnRyZWUzZHMyUmVxdWVzdCB9IGZyb20gXCIuLi9hcGkvZW50aXRpZXMvc3lzL1R5cGVSZWZzLmpzXCJcbmltcG9ydCB7IEFjY291bnRpbmdJbmZvVHlwZVJlZiwgSW52b2ljZUluZm9UeXBlUmVmIH0gZnJvbSBcIi4uL2FwaS9lbnRpdGllcy9zeXMvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgYXNzZXJ0Tm90TnVsbCwgbmV2ZXJOdWxsLCBub09wLCBwcm9taXNlTWFwIH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5pbXBvcnQgeyBnZXRMYXp5TG9hZGVkUGF5UGFsVXJsLCBnZXRQcmVjb25kaXRpb25GYWlsZWRQYXltZW50TXNnLCBQYXltZW50RXJyb3JDb2RlLCBVcGdyYWRlVHlwZSB9IGZyb20gXCIuL1N1YnNjcmlwdGlvblV0aWxzXCJcbmltcG9ydCB7IEJ1dHRvbiwgQnV0dG9uVHlwZSB9IGZyb20gXCIuLi9ndWkvYmFzZS9CdXR0b24uanNcIlxuaW1wb3J0IHR5cGUgeyBTZWdtZW50Q29udHJvbEl0ZW0gfSBmcm9tIFwiLi4vZ3VpL2Jhc2UvU2VnbWVudENvbnRyb2xcIlxuaW1wb3J0IHsgU2VnbWVudENvbnRyb2wgfSBmcm9tIFwiLi4vZ3VpL2Jhc2UvU2VnbWVudENvbnRyb2xcIlxuaW1wb3J0IHR5cGUgeyBXaXphcmRQYWdlQXR0cnMsIFdpemFyZFBhZ2VOIH0gZnJvbSBcIi4uL2d1aS9iYXNlL1dpemFyZERpYWxvZy5qc1wiXG5pbXBvcnQgeyBlbWl0V2l6YXJkRXZlbnQsIFdpemFyZEV2ZW50VHlwZSB9IGZyb20gXCIuLi9ndWkvYmFzZS9XaXphcmREaWFsb2cuanNcIlxuaW1wb3J0IHR5cGUgeyBDb3VudHJ5IH0gZnJvbSBcIi4uL2FwaS9jb21tb24vQ291bnRyeUxpc3RcIlxuaW1wb3J0IHsgRGVmYXVsdEFuaW1hdGlvblRpbWUgfSBmcm9tIFwiLi4vZ3VpL2FuaW1hdGlvbi9BbmltYXRpb25zXCJcbmltcG9ydCB7IGxvY2F0b3IgfSBmcm9tIFwiLi4vYXBpL21haW4vQ29tbW9uTG9jYXRvclwiXG5pbXBvcnQgeyBDcmVkZW50aWFscyB9IGZyb20gXCIuLi9taXNjL2NyZWRlbnRpYWxzL0NyZWRlbnRpYWxzXCJcbmltcG9ydCB7IFNlc3Npb25UeXBlIH0gZnJvbSBcIi4uL2FwaS9jb21tb24vU2Vzc2lvblR5cGUuanNcIlxuaW1wb3J0IHsgVXNhZ2VUZXN0IH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11c2FnZXRlc3RzXCJcbmltcG9ydCB7IFBheW1lbnRJbnRlcnZhbCB9IGZyb20gXCIuL1ByaWNlVXRpbHMuanNcIlxuaW1wb3J0IHsgRW50aXR5VXBkYXRlRGF0YSwgaXNVcGRhdGVGb3JUeXBlUmVmIH0gZnJvbSBcIi4uL2FwaS9jb21tb24vdXRpbHMvRW50aXR5VXBkYXRlVXRpbHMuanNcIlxuaW1wb3J0IHsgRW50aXR5RXZlbnRzTGlzdGVuZXIgfSBmcm9tIFwiLi4vYXBpL21haW4vRXZlbnRDb250cm9sbGVyLmpzXCJcbmltcG9ydCB7IExvZ2luQnV0dG9uIH0gZnJvbSBcIi4uL2d1aS9iYXNlL2J1dHRvbnMvTG9naW5CdXR0b24uanNcIlxuaW1wb3J0IHsgY2xpZW50IH0gZnJvbSBcIi4uL21pc2MvQ2xpZW50RGV0ZWN0b3IuanNcIlxuXG4vKipcbiAqIFdpemFyZCBwYWdlIGZvciBlZGl0aW5nIGludm9pY2UgYW5kIHBheW1lbnQgZGF0YS5cbiAqL1xuZXhwb3J0IGNsYXNzIEludm9pY2VBbmRQYXltZW50RGF0YVBhZ2UgaW1wbGVtZW50cyBXaXphcmRQYWdlTjxVcGdyYWRlU3Vic2NyaXB0aW9uRGF0YT4ge1xuXHRwcml2YXRlIF9wYXltZW50TWV0aG9kSW5wdXQ6IFBheW1lbnRNZXRob2RJbnB1dCB8IG51bGwgPSBudWxsXG5cdHByaXZhdGUgX2ludm9pY2VEYXRhSW5wdXQ6IEludm9pY2VEYXRhSW5wdXQgfCBudWxsID0gbnVsbFxuXHRwcml2YXRlIF9hdmFpbGFibGVQYXltZW50TWV0aG9kczogQXJyYXk8U2VnbWVudENvbnRyb2xJdGVtPFBheW1lbnRNZXRob2RUeXBlPj4gfCBudWxsID0gbnVsbFxuXHRwcml2YXRlIF9zZWxlY3RlZFBheW1lbnRNZXRob2Q6IFN0cmVhbTxQYXltZW50TWV0aG9kVHlwZT5cblx0cHJpdmF0ZSBkb20hOiBIVE1MRWxlbWVudFxuXHRwcml2YXRlIF9fc2lnbnVwUGFpZFRlc3Q/OiBVc2FnZVRlc3Rcblx0cHJpdmF0ZSBfX3BheW1lbnRQYXlwYWxUZXN0PzogVXNhZ2VUZXN0XG5cblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5fX3NpZ251cFBhaWRUZXN0ID0gbG9jYXRvci51c2FnZVRlc3RDb250cm9sbGVyLmdldFRlc3QoXCJzaWdudXAucGFpZFwiKVxuXHRcdHRoaXMuX19wYXltZW50UGF5cGFsVGVzdCA9IGxvY2F0b3IudXNhZ2VUZXN0Q29udHJvbGxlci5nZXRUZXN0KFwicGF5bWVudC5wYXlwYWxcIilcblxuXHRcdHRoaXMuX3NlbGVjdGVkUGF5bWVudE1ldGhvZCA9IHN0cmVhbSgpXG5cblx0XHR0aGlzLl9zZWxlY3RlZFBheW1lbnRNZXRob2QubWFwKChtZXRob2QpID0+IG5ldmVyTnVsbCh0aGlzLl9wYXltZW50TWV0aG9kSW5wdXQpLnVwZGF0ZVBheW1lbnRNZXRob2QobWV0aG9kKSlcblx0fVxuXG5cdG9ucmVtb3ZlKHZub2RlOiBWbm9kZTxXaXphcmRQYWdlQXR0cnM8VXBncmFkZVN1YnNjcmlwdGlvbkRhdGE+Pikge1xuXHRcdGNvbnN0IGRhdGEgPSB2bm9kZS5hdHRycy5kYXRhXG5cblx0XHQvLyBUT0RPIGNoZWNrIGlmIGNvcnJlY3QgcGxhY2UgdG8gdXBkYXRlIHRoZXNlXG5cdFx0aWYgKHRoaXMuX2ludm9pY2VEYXRhSW5wdXQgJiYgdGhpcy5fcGF5bWVudE1ldGhvZElucHV0KSB7XG5cdFx0XHRkYXRhLmludm9pY2VEYXRhID0gdGhpcy5faW52b2ljZURhdGFJbnB1dC5nZXRJbnZvaWNlRGF0YSgpXG5cdFx0XHRkYXRhLnBheW1lbnREYXRhID0gdGhpcy5fcGF5bWVudE1ldGhvZElucHV0LmdldFBheW1lbnREYXRhKClcblx0XHR9XG5cdH1cblxuXHRvbmNyZWF0ZSh2bm9kZTogVm5vZGVET008V2l6YXJkUGFnZUF0dHJzPFVwZ3JhZGVTdWJzY3JpcHRpb25EYXRhPj4pIHtcblx0XHR0aGlzLmRvbSA9IHZub2RlLmRvbSBhcyBIVE1MRWxlbWVudFxuXHRcdGNvbnN0IGRhdGEgPSB2bm9kZS5hdHRycy5kYXRhXG5cblx0XHQvLyBUT0RPIGNoZWNrIGlmIGNvcnJlY3QgcGxhY2UgdG8gdXBkYXRlIHRoZXNlXG5cdFx0aWYgKHRoaXMuX2ludm9pY2VEYXRhSW5wdXQgJiYgdGhpcy5fcGF5bWVudE1ldGhvZElucHV0KSB7XG5cdFx0XHRkYXRhLmludm9pY2VEYXRhID0gdGhpcy5faW52b2ljZURhdGFJbnB1dC5nZXRJbnZvaWNlRGF0YSgpXG5cdFx0XHRkYXRhLnBheW1lbnREYXRhID0gdGhpcy5fcGF5bWVudE1ldGhvZElucHV0LmdldFBheW1lbnREYXRhKClcblx0XHR9XG5cblx0XHRsZXQgbG9naW46IFByb21pc2U8Q3JlZGVudGlhbHMgfCBudWxsPiA9IFByb21pc2UucmVzb2x2ZShudWxsKVxuXG5cdFx0aWYgKCFsb2NhdG9yLmxvZ2lucy5pc1VzZXJMb2dnZWRJbigpKSB7XG5cdFx0XHRsb2dpbiA9IGxvY2F0b3IubG9naW5zXG5cdFx0XHRcdC5jcmVhdGVTZXNzaW9uKG5ldmVyTnVsbChkYXRhLm5ld0FjY291bnREYXRhKS5tYWlsQWRkcmVzcywgbmV2ZXJOdWxsKGRhdGEubmV3QWNjb3VudERhdGEpLnBhc3N3b3JkLCBTZXNzaW9uVHlwZS5UZW1wb3JhcnkpXG5cdFx0XHRcdC50aGVuKChuZXdTZXNzaW9uRGF0YSkgPT4gbmV3U2Vzc2lvbkRhdGEuY3JlZGVudGlhbHMpXG5cdFx0fVxuXG5cdFx0bG9naW5cblx0XHRcdC50aGVuKCgpID0+IHtcblx0XHRcdFx0aWYgKCFkYXRhLmFjY291bnRpbmdJbmZvIHx8ICFkYXRhLmN1c3RvbWVyKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGxvY2F0b3IubG9naW5zXG5cdFx0XHRcdFx0XHQuZ2V0VXNlckNvbnRyb2xsZXIoKVxuXHRcdFx0XHRcdFx0LmxvYWRDdXN0b21lcigpXG5cdFx0XHRcdFx0XHQudGhlbigoY3VzdG9tZXIpID0+IHtcblx0XHRcdFx0XHRcdFx0ZGF0YS5jdXN0b21lciA9IGN1c3RvbWVyXG5cdFx0XHRcdFx0XHRcdHJldHVybiBsb2NhdG9yLmxvZ2lucy5nZXRVc2VyQ29udHJvbGxlcigpLmxvYWRDdXN0b21lckluZm8oKVxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdC50aGVuKChjdXN0b21lckluZm8pID0+XG5cdFx0XHRcdFx0XHRcdGxvY2F0b3IuZW50aXR5Q2xpZW50LmxvYWQoQWNjb3VudGluZ0luZm9UeXBlUmVmLCBjdXN0b21lckluZm8uYWNjb3VudGluZ0luZm8pLnRoZW4oKGFjY291bnRpbmdJbmZvKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0ZGF0YS5hY2NvdW50aW5nSW5mbyA9IGFjY291bnRpbmdJbmZvXG5cdFx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdFx0KVxuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oKCkgPT4gZ2V0RGVmYXVsdFBheW1lbnRNZXRob2QoKSlcblx0XHRcdC50aGVuKChkZWZhdWx0UGF5bWVudE1ldGhvZDogUGF5bWVudE1ldGhvZFR5cGUpID0+IHtcblx0XHRcdFx0dGhpcy5faW52b2ljZURhdGFJbnB1dCA9IG5ldyBJbnZvaWNlRGF0YUlucHV0KGRhdGEub3B0aW9ucy5idXNpbmVzc1VzZSgpLCBkYXRhLmludm9pY2VEYXRhLCBJbnZvaWNlRGF0YUlucHV0TG9jYXRpb24uSW5XaXphcmQpXG5cdFx0XHRcdGxldCBwYXlQYWxSZXF1ZXN0VXJsID0gZ2V0TGF6eUxvYWRlZFBheVBhbFVybCgpXG5cblx0XHRcdFx0aWYgKGxvY2F0b3IubG9naW5zLmlzVXNlckxvZ2dlZEluKCkpIHtcblx0XHRcdFx0XHRsb2NhdG9yLmxvZ2lucy53YWl0Rm9yRnVsbExvZ2luKCkudGhlbigoKSA9PiBwYXlQYWxSZXF1ZXN0VXJsLmdldEFzeW5jKCkpXG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0aGlzLl9wYXltZW50TWV0aG9kSW5wdXQgPSBuZXcgUGF5bWVudE1ldGhvZElucHV0KFxuXHRcdFx0XHRcdGRhdGEub3B0aW9ucyxcblx0XHRcdFx0XHR0aGlzLl9pbnZvaWNlRGF0YUlucHV0LnNlbGVjdGVkQ291bnRyeSxcblx0XHRcdFx0XHRuZXZlck51bGwoZGF0YS5hY2NvdW50aW5nSW5mbyksXG5cdFx0XHRcdFx0cGF5UGFsUmVxdWVzdFVybCxcblx0XHRcdFx0XHRkZWZhdWx0UGF5bWVudE1ldGhvZCxcblx0XHRcdFx0KVxuXHRcdFx0XHR0aGlzLl9hdmFpbGFibGVQYXltZW50TWV0aG9kcyA9IHRoaXMuX3BheW1lbnRNZXRob2RJbnB1dC5nZXRWaXNpYmxlUGF5bWVudE1ldGhvZHMoKVxuXG5cdFx0XHRcdHRoaXMuX3NlbGVjdGVkUGF5bWVudE1ldGhvZChkYXRhLnBheW1lbnREYXRhLnBheW1lbnRNZXRob2QpXG5cblx0XHRcdFx0dGhpcy5fcGF5bWVudE1ldGhvZElucHV0LnVwZGF0ZVBheW1lbnRNZXRob2QoZGF0YS5wYXltZW50RGF0YS5wYXltZW50TWV0aG9kLCBkYXRhLnBheW1lbnREYXRhKVxuXHRcdFx0fSlcblx0fVxuXG5cdHZpZXcodm5vZGU6IFZub2RlPFdpemFyZFBhZ2VBdHRyczxVcGdyYWRlU3Vic2NyaXB0aW9uRGF0YT4+KTogQ2hpbGRyZW4ge1xuXHRcdGNvbnN0IGEgPSB2bm9kZS5hdHRyc1xuXG5cdFx0Y29uc3Qgb25OZXh0Q2xpY2sgPSAoKSA9PiB7XG5cdFx0XHRjb25zdCBpbnZvaWNlRGF0YUlucHV0ID0gYXNzZXJ0Tm90TnVsbCh0aGlzLl9pbnZvaWNlRGF0YUlucHV0KVxuXHRcdFx0Y29uc3QgcGF5bWVudE1ldGhvZElucHV0ID0gYXNzZXJ0Tm90TnVsbCh0aGlzLl9wYXltZW50TWV0aG9kSW5wdXQpXG5cdFx0XHRsZXQgZXJyb3IgPSBpbnZvaWNlRGF0YUlucHV0LnZhbGlkYXRlSW52b2ljZURhdGEoKSB8fCBwYXltZW50TWV0aG9kSW5wdXQudmFsaWRhdGVQYXltZW50RGF0YSgpXG5cblx0XHRcdGlmIChlcnJvcikge1xuXHRcdFx0XHRyZXR1cm4gRGlhbG9nLm1lc3NhZ2UoZXJyb3IpLnRoZW4oKCkgPT4gbnVsbClcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGEuZGF0YS5pbnZvaWNlRGF0YSA9IGludm9pY2VEYXRhSW5wdXQuZ2V0SW52b2ljZURhdGEoKVxuXHRcdFx0XHRhLmRhdGEucGF5bWVudERhdGEgPSBwYXltZW50TWV0aG9kSW5wdXQuZ2V0UGF5bWVudERhdGEoKVxuXHRcdFx0XHRyZXR1cm4gc2hvd1Byb2dyZXNzRGlhbG9nKFxuXHRcdFx0XHRcdFwidXBkYXRlUGF5bWVudERhdGFCdXN5X21zZ1wiLFxuXHRcdFx0XHRcdFByb21pc2UucmVzb2x2ZSgpXG5cdFx0XHRcdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdGxldCBjdXN0b21lciA9IG5ldmVyTnVsbChhLmRhdGEuY3VzdG9tZXIpXG5cblx0XHRcdFx0XHRcdFx0aWYgKGN1c3RvbWVyLmJ1c2luZXNzVXNlICE9PSBhLmRhdGEub3B0aW9ucy5idXNpbmVzc1VzZSgpKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y3VzdG9tZXIuYnVzaW5lc3NVc2UgPSBhLmRhdGEub3B0aW9ucy5idXNpbmVzc1VzZSgpXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGxvY2F0b3IuZW50aXR5Q2xpZW50LnVwZGF0ZShjdXN0b21lcilcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdC50aGVuKCgpID0+XG5cdFx0XHRcdFx0XHRcdHVwZGF0ZVBheW1lbnREYXRhKFxuXHRcdFx0XHRcdFx0XHRcdGEuZGF0YS5vcHRpb25zLnBheW1lbnRJbnRlcnZhbCgpLFxuXHRcdFx0XHRcdFx0XHRcdGEuZGF0YS5pbnZvaWNlRGF0YSxcblx0XHRcdFx0XHRcdFx0XHRhLmRhdGEucGF5bWVudERhdGEsXG5cdFx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0XHRhLmRhdGEudXBncmFkZVR5cGUgPT09IFVwZ3JhZGVUeXBlLlNpZ251cCxcblx0XHRcdFx0XHRcdFx0XHRuZXZlck51bGwoYS5kYXRhLnByaWNlPy5yYXdQcmljZSksXG5cdFx0XHRcdFx0XHRcdFx0bmV2ZXJOdWxsKGEuZGF0YS5hY2NvdW50aW5nSW5mbyksXG5cdFx0XHRcdFx0XHRcdCkudGhlbigoc3VjY2VzcykgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdGlmIChzdWNjZXNzKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBQYXltZW50IG1ldGhvZCBjb25maXJtYXRpb24gKGNsaWNrIG9uIG5leHQpLCBzZW5kIHNlbGVjdGVkIHBheW1lbnQgbWV0aG9kIGFzIGFuIGVudW1cblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IHBheW1lbnRNZXRob2RDb25maXJtYXRpb25TdGFnZSA9IHRoaXMuX19zaWdudXBQYWlkVGVzdD8uZ2V0U3RhZ2UoNClcblx0XHRcdFx0XHRcdFx0XHRcdHBheW1lbnRNZXRob2RDb25maXJtYXRpb25TdGFnZT8uc2V0TWV0cmljKHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0bmFtZTogXCJwYXltZW50TWV0aG9kXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHZhbHVlOiBQYXltZW50TWV0aG9kVHlwZVRvTmFtZVthLmRhdGEucGF5bWVudERhdGEucGF5bWVudE1ldGhvZF0sXG5cdFx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdFx0cGF5bWVudE1ldGhvZENvbmZpcm1hdGlvblN0YWdlPy5jb21wbGV0ZSgpXG5cdFx0XHRcdFx0XHRcdFx0XHRlbWl0V2l6YXJkRXZlbnQodGhpcy5kb20sIFdpemFyZEV2ZW50VHlwZS5TSE9XX05FWFRfUEFHRSlcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdFx0KSxcblx0XHRcdFx0KVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBtKFxuXHRcdFx0XCIucHRcIixcblx0XHRcdHRoaXMuX2F2YWlsYWJsZVBheW1lbnRNZXRob2RzXG5cdFx0XHRcdD8gW1xuXHRcdFx0XHRcdFx0bShTZWdtZW50Q29udHJvbCwge1xuXHRcdFx0XHRcdFx0XHRpdGVtczogdGhpcy5fYXZhaWxhYmxlUGF5bWVudE1ldGhvZHMsXG5cdFx0XHRcdFx0XHRcdHNlbGVjdGVkVmFsdWU6IHRoaXMuX3NlbGVjdGVkUGF5bWVudE1ldGhvZCgpLFxuXHRcdFx0XHRcdFx0XHRvblZhbHVlU2VsZWN0ZWQ6IHRoaXMuX3NlbGVjdGVkUGF5bWVudE1ldGhvZCxcblx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdFx0bShcIi5mbGV4LXNwYWNlLWFyb3VuZC5mbGV4LXdyYXAucHRcIiwgW1xuXHRcdFx0XHRcdFx0XHRtKFxuXHRcdFx0XHRcdFx0XHRcdFwiLmZsZXgtZ3Jvdy1zaHJpbmstaGFsZi5wbHItbFwiLFxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdG1pbldpZHRoOiBcIjI2MHB4XCIsXG5cdFx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0bShuZXZlck51bGwodGhpcy5faW52b2ljZURhdGFJbnB1dCkpLFxuXHRcdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0XHRtKFxuXHRcdFx0XHRcdFx0XHRcdFwiLmZsZXgtZ3Jvdy1zaHJpbmstaGFsZi5wbHItbFwiLFxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdG1pbldpZHRoOiBcIjI2MHB4XCIsXG5cdFx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0bShuZXZlck51bGwodGhpcy5fcGF5bWVudE1ldGhvZElucHV0KSksXG5cdFx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0XHRdKSxcblx0XHRcdFx0XHRcdG0oXG5cdFx0XHRcdFx0XHRcdFwiLmZsZXgtY2VudGVyLmZ1bGwtd2lkdGgucHQtbFwiLFxuXHRcdFx0XHRcdFx0XHRtKExvZ2luQnV0dG9uLCB7XG5cdFx0XHRcdFx0XHRcdFx0bGFiZWw6IFwibmV4dF9hY3Rpb25cIixcblx0XHRcdFx0XHRcdFx0XHRjbGFzczogXCJzbWFsbC1sb2dpbi1idXR0b25cIixcblx0XHRcdFx0XHRcdFx0XHRvbmNsaWNrOiBvbk5leHRDbGljayxcblx0XHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHQgIF1cblx0XHRcdFx0OiBudWxsLFxuXHRcdClcblx0fVxufVxuXG5leHBvcnQgY2xhc3MgSW52b2ljZUFuZFBheW1lbnREYXRhUGFnZUF0dHJzIGltcGxlbWVudHMgV2l6YXJkUGFnZUF0dHJzPFVwZ3JhZGVTdWJzY3JpcHRpb25EYXRhPiB7XG5cdGRhdGE6IFVwZ3JhZGVTdWJzY3JpcHRpb25EYXRhXG5cdF9lbmFibGVkOiAoKSA9PiBib29sZWFuID0gKCkgPT4gdHJ1ZVxuXG5cdGNvbnN0cnVjdG9yKHVwZ3JhZGVEYXRhOiBVcGdyYWRlU3Vic2NyaXB0aW9uRGF0YSkge1xuXHRcdHRoaXMuZGF0YSA9IHVwZ3JhZGVEYXRhXG5cdH1cblxuXHRuZXh0QWN0aW9uKHNob3dFcnJvckRpYWxvZzogYm9vbGVhbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSlcblx0fVxuXG5cdGhlYWRlclRpdGxlKCk6IFRyYW5zbGF0aW9uS2V5IHtcblx0XHRyZXR1cm4gXCJhZG1pblBheW1lbnRfYWN0aW9uXCJcblx0fVxuXG5cdGlzU2tpcEF2YWlsYWJsZSgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gZmFsc2Vcblx0fVxuXG5cdGlzRW5hYmxlZCgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5fZW5hYmxlZCgpXG5cdH1cblxuXHQvKipcblx0ICogU2V0IHRoZSBlbmFibGVkIGZ1bmN0aW9uIGZvciBpc0VuYWJsZWRcblx0ICogQHBhcmFtIGVuYWJsZWRcblx0ICovXG5cdHNldEVuYWJsZWRGdW5jdGlvbjxUPihlbmFibGVkOiAoKSA9PiBib29sZWFuKSB7XG5cdFx0dGhpcy5fZW5hYmxlZCA9IGVuYWJsZWRcblx0fVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBkYXRlUGF5bWVudERhdGEoXG5cdHBheW1lbnRJbnRlcnZhbDogUGF5bWVudEludGVydmFsLFxuXHRpbnZvaWNlRGF0YTogSW52b2ljZURhdGEsXG5cdHBheW1lbnREYXRhOiBQYXltZW50RGF0YSB8IG51bGwsXG5cdGNvbmZpcm1lZENvdW50cnk6IENvdW50cnkgfCBudWxsLFxuXHRpc1NpZ251cDogYm9vbGVhbixcblx0cHJpY2U6IHN0cmluZyB8IG51bGwsXG5cdGFjY291bnRpbmdJbmZvOiBBY2NvdW50aW5nSW5mbyxcbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRjb25zdCBwYXltZW50UmVzdWx0ID0gYXdhaXQgbG9jYXRvci5jdXN0b21lckZhY2FkZS51cGRhdGVQYXltZW50RGF0YShwYXltZW50SW50ZXJ2YWwsIGludm9pY2VEYXRhLCBwYXltZW50RGF0YSwgY29uZmlybWVkQ291bnRyeSlcblx0Y29uc3Qgc3RhdHVzQ29kZSA9IHBheW1lbnRSZXN1bHQucmVzdWx0XG5cblx0aWYgKHN0YXR1c0NvZGUgPT09IFBheW1lbnREYXRhUmVzdWx0VHlwZS5PSykge1xuXHRcdC8vIHNob3cgZGlhbG9nXG5cdFx0bGV0IGJyYWludHJlZTNkcyA9IHBheW1lbnRSZXN1bHQuYnJhaW50cmVlM2RzUmVxdWVzdFxuXHRcdGlmIChicmFpbnRyZWUzZHMpIHtcblx0XHRcdHJldHVybiB2ZXJpZnlDcmVkaXRDYXJkKGFjY291bnRpbmdJbmZvLCBicmFpbnRyZWUzZHMsIHByaWNlISlcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRydWVcblx0XHR9XG5cdH0gZWxzZSBpZiAoc3RhdHVzQ29kZSA9PT0gUGF5bWVudERhdGFSZXN1bHRUeXBlLkNPVU5UUllfTUlTTUFUQ0gpIHtcblx0XHRjb25zdCBjb3VudHJ5TmFtZSA9IGludm9pY2VEYXRhLmNvdW50cnkgPyBpbnZvaWNlRGF0YS5jb3VudHJ5Lm4gOiBcIlwiXG5cdFx0Y29uc3QgY29uZmlybU1lc3NhZ2UgPSBsYW5nLmdldFRyYW5zbGF0aW9uKFwiY29uZmlybUNvdW50cnlfbXNnXCIsIHtcblx0XHRcdFwiezF9XCI6IGNvdW50cnlOYW1lLFxuXHRcdH0pXG5cdFx0Y29uc3QgY29uZmlybWVkID0gYXdhaXQgRGlhbG9nLmNvbmZpcm0oY29uZmlybU1lc3NhZ2UpXG5cdFx0aWYgKGNvbmZpcm1lZCkge1xuXHRcdFx0cmV0dXJuIHVwZGF0ZVBheW1lbnREYXRhKHBheW1lbnRJbnRlcnZhbCwgaW52b2ljZURhdGEsIHBheW1lbnREYXRhLCBpbnZvaWNlRGF0YS5jb3VudHJ5LCBpc1NpZ251cCwgcHJpY2UsIGFjY291bnRpbmdJbmZvKSAvLyBhZGQgY29uZmlybWVkIGludm9pY2UgY291bnRyeVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gZmFsc2Vcblx0XHR9XG5cdH0gZWxzZSBpZiAoc3RhdHVzQ29kZSA9PT0gUGF5bWVudERhdGFSZXN1bHRUeXBlLklOVkFMSURfVkFUSURfTlVNQkVSKSB7XG5cdFx0YXdhaXQgRGlhbG9nLm1lc3NhZ2UoXG5cdFx0XHRsYW5nLm1ha2VUcmFuc2xhdGlvbihcImludmFsaWRWYXRJZE51bWJlcl9tc2dcIiwgbGFuZy5nZXQoXCJpbnZhbGlkVmF0SWROdW1iZXJfbXNnXCIpICsgKGlzU2lnbnVwID8gXCIgXCIgKyBsYW5nLmdldChcImFjY291bnRXYXNTdGlsbENyZWF0ZWRfbXNnXCIpIDogXCJcIikpLFxuXHRcdClcblx0fSBlbHNlIGlmIChzdGF0dXNDb2RlID09PSBQYXltZW50RGF0YVJlc3VsdFR5cGUuQ1JFRElUX0NBUkRfREVDTElORUQpIHtcblx0XHRhd2FpdCBEaWFsb2cubWVzc2FnZShcblx0XHRcdGxhbmcubWFrZVRyYW5zbGF0aW9uKFwiY3JlZGl0Q2FyZERlY2xpbmVkX21zZ1wiLCBsYW5nLmdldChcImNyZWRpdENhcmREZWNsaW5lZF9tc2dcIikgKyAoaXNTaWdudXAgPyBcIiBcIiArIGxhbmcuZ2V0KFwiYWNjb3VudFdhc1N0aWxsQ3JlYXRlZF9tc2dcIikgOiBcIlwiKSksXG5cdFx0KVxuXHR9IGVsc2UgaWYgKHN0YXR1c0NvZGUgPT09IFBheW1lbnREYXRhUmVzdWx0VHlwZS5DUkVESVRfQ0FSRF9DVlZfSU5WQUxJRCkge1xuXHRcdGF3YWl0IERpYWxvZy5tZXNzYWdlKFwiY3JlZGl0Q2FyZENWVkludmFsaWRfbXNnXCIpXG5cdH0gZWxzZSBpZiAoc3RhdHVzQ29kZSA9PT0gUGF5bWVudERhdGFSZXN1bHRUeXBlLlBBWU1FTlRfUFJPVklERVJfTk9UX0FWQUlMQUJMRSkge1xuXHRcdGF3YWl0IERpYWxvZy5tZXNzYWdlKFxuXHRcdFx0bGFuZy5tYWtlVHJhbnNsYXRpb24oXG5cdFx0XHRcdFwicGF5bWVudFByb3ZpZGVyTm90QXZhaWxhYmxlRXJyb3JfbXNnXCIsXG5cdFx0XHRcdGxhbmcuZ2V0KFwicGF5bWVudFByb3ZpZGVyTm90QXZhaWxhYmxlRXJyb3JfbXNnXCIpICsgKGlzU2lnbnVwID8gXCIgXCIgKyBsYW5nLmdldChcImFjY291bnRXYXNTdGlsbENyZWF0ZWRfbXNnXCIpIDogXCJcIiksXG5cdFx0XHQpLFxuXHRcdClcblx0fSBlbHNlIGlmIChzdGF0dXNDb2RlID09PSBQYXltZW50RGF0YVJlc3VsdFR5cGUuT1RIRVJfUEFZTUVOVF9BQ0NPVU5UX1JFSkVDVEVEKSB7XG5cdFx0YXdhaXQgRGlhbG9nLm1lc3NhZ2UoXG5cdFx0XHRsYW5nLm1ha2VUcmFuc2xhdGlvbihcblx0XHRcdFx0XCJwYXltZW50QWNjb3VudFJlamVjdGVkX21zZ1wiLFxuXHRcdFx0XHRsYW5nLmdldChcInBheW1lbnRBY2NvdW50UmVqZWN0ZWRfbXNnXCIpICsgKGlzU2lnbnVwID8gXCIgXCIgKyBsYW5nLmdldChcImFjY291bnRXYXNTdGlsbENyZWF0ZWRfbXNnXCIpIDogXCJcIiksXG5cdFx0XHQpLFxuXHRcdClcblx0fSBlbHNlIGlmIChzdGF0dXNDb2RlID09PSBQYXltZW50RGF0YVJlc3VsdFR5cGUuQ1JFRElUX0NBUkRfREFURV9JTlZBTElEKSB7XG5cdFx0YXdhaXQgRGlhbG9nLm1lc3NhZ2UoXCJjcmVkaXRDYXJkRXhwcmF0aW9uRGF0ZUludmFsaWRfbXNnXCIpXG5cdH0gZWxzZSBpZiAoc3RhdHVzQ29kZSA9PT0gUGF5bWVudERhdGFSZXN1bHRUeXBlLkNSRURJVF9DQVJEX05VTUJFUl9JTlZBTElEKSB7XG5cdFx0YXdhaXQgRGlhbG9nLm1lc3NhZ2UoXG5cdFx0XHRsYW5nLm1ha2VUcmFuc2xhdGlvbihcblx0XHRcdFx0XCJjcmVkaXRDYXJkTnVtYmVySW52YWxpZF9tc2dcIixcblx0XHRcdFx0bGFuZy5nZXQoXCJjcmVkaXRDYXJkTnVtYmVySW52YWxpZF9tc2dcIikgKyAoaXNTaWdudXAgPyBcIiBcIiArIGxhbmcuZ2V0KFwiYWNjb3VudFdhc1N0aWxsQ3JlYXRlZF9tc2dcIikgOiBcIlwiKSxcblx0XHRcdCksXG5cdFx0KVxuXHR9IGVsc2UgaWYgKHN0YXR1c0NvZGUgPT09IFBheW1lbnREYXRhUmVzdWx0VHlwZS5DT1VMRF9OT1RfVkVSSUZZX1ZBVElEKSB7XG5cdFx0YXdhaXQgRGlhbG9nLm1lc3NhZ2UoXG5cdFx0XHRsYW5nLm1ha2VUcmFuc2xhdGlvbihcblx0XHRcdFx0XCJpbnZhbGlkVmF0SWRWYWxpZGF0aW9uRmFpbGVkX21zZ1wiLFxuXHRcdFx0XHRsYW5nLmdldChcImludmFsaWRWYXRJZFZhbGlkYXRpb25GYWlsZWRfbXNnXCIpICsgKGlzU2lnbnVwID8gXCIgXCIgKyBsYW5nLmdldChcImFjY291bnRXYXNTdGlsbENyZWF0ZWRfbXNnXCIpIDogXCJcIiksXG5cdFx0XHQpLFxuXHRcdClcblx0fSBlbHNlIGlmIChzdGF0dXNDb2RlID09PSBQYXltZW50RGF0YVJlc3VsdFR5cGUuQ1JFRElUX0NBUkRfVkVSSUZJQ0FUSU9OX0xJTUlUX1JFQUNIRUQpIHtcblx0XHRhd2FpdCBEaWFsb2cubWVzc2FnZShcblx0XHRcdGxhbmcubWFrZVRyYW5zbGF0aW9uKFxuXHRcdFx0XHRcImNyZWRpdENhcmRWZXJpZmljYXRpb25MaW1pdFJlYWNoZWRfbXNnXCIsXG5cdFx0XHRcdGxhbmcuZ2V0KFwiY3JlZGl0Q2FyZFZlcmlmaWNhdGlvbkxpbWl0UmVhY2hlZF9tc2dcIikgKyAoaXNTaWdudXAgPyBcIiBcIiArIGxhbmcuZ2V0KFwiYWNjb3VudFdhc1N0aWxsQ3JlYXRlZF9tc2dcIikgOiBcIlwiKSxcblx0XHRcdCksXG5cdFx0KVxuXHR9IGVsc2Uge1xuXHRcdGF3YWl0IERpYWxvZy5tZXNzYWdlKFxuXHRcdFx0bGFuZy5tYWtlVHJhbnNsYXRpb24oXG5cdFx0XHRcdFwib3RoZXJQYXltZW50UHJvdmlkZXJFcnJvcl9tc2dcIixcblx0XHRcdFx0bGFuZy5nZXQoXCJvdGhlclBheW1lbnRQcm92aWRlckVycm9yX21zZ1wiKSArIChpc1NpZ251cCA/IFwiIFwiICsgbGFuZy5nZXQoXCJhY2NvdW50V2FzU3RpbGxDcmVhdGVkX21zZ1wiKSA6IFwiXCIpLFxuXHRcdFx0KSxcblx0XHQpXG5cdH1cblxuXHRyZXR1cm4gZmFsc2Vcbn1cblxuLyoqXG4gKiBEaXNwbGF5cyBhIHByb2dyZXNzIGRpYWxvZyB0aGF0IGFsbG93cyB0byBjYW5jZWwgdGhlIHZlcmlmaWNhdGlvbiBhbmQgb3BlbnMgYSBuZXcgd2luZG93IHRvIGRvIHRoZSBhY3R1YWwgdmVyaWZpY2F0aW9uIHdpdGggdGhlIGJhbmsuXG4gKi9cbmZ1bmN0aW9uIHZlcmlmeUNyZWRpdENhcmQoYWNjb3VudGluZ0luZm86IEFjY291bnRpbmdJbmZvLCBicmFpbnRyZWUzZHM6IEJyYWludHJlZTNkczJSZXF1ZXN0LCBwcmljZTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG5cdHJldHVybiBsb2NhdG9yLmVudGl0eUNsaWVudC5sb2FkKEludm9pY2VJbmZvVHlwZVJlZiwgbmV2ZXJOdWxsKGFjY291bnRpbmdJbmZvLmludm9pY2VJbmZvKSkudGhlbigoaW52b2ljZUluZm8pID0+IHtcblx0XHRsZXQgaW52b2ljZUluZm9XcmFwcGVyID0ge1xuXHRcdFx0aW52b2ljZUluZm8sXG5cdFx0fVxuXHRcdGxldCByZXNvbHZlOiAoYXJnMDogYm9vbGVhbikgPT4gdm9pZFxuXHRcdGxldCBwcm9ncmVzc0RpYWxvZ1Byb21pc2U6IFByb21pc2U8Ym9vbGVhbj4gPSBuZXcgUHJvbWlzZSgocmVzKSA9PiAocmVzb2x2ZSA9IHJlcykpXG5cdFx0bGV0IHByb2dyZXNzRGlhbG9nOiBEaWFsb2dcblxuXHRcdGNvbnN0IGNsb3NlQWN0aW9uID0gKCkgPT4ge1xuXHRcdFx0Ly8gdXNlciBkaWQgbm90IGNvbXBsZXRlIHRoZSAzZHMgZGlhbG9nIGFuZCBQYXltZW50RGF0YVNlcnZpY2UuUE9TVCB3YXMgbm90IGludm9rZWRcblx0XHRcdHByb2dyZXNzRGlhbG9nLmNsb3NlKClcblx0XHRcdHNldFRpbWVvdXQoKCkgPT4gcmVzb2x2ZShmYWxzZSksIERlZmF1bHRBbmltYXRpb25UaW1lKVxuXHRcdH1cblxuXHRcdHByb2dyZXNzRGlhbG9nID0gbmV3IERpYWxvZyhEaWFsb2dUeXBlLkFsZXJ0LCB7XG5cdFx0XHR2aWV3OiAoKSA9PiBbXG5cdFx0XHRcdG0oXCIuZGlhbG9nLWNvbnRlbnRCdXR0b25zQm90dG9tLnRleHQtYnJlYWsuc2VsZWN0YWJsZVwiLCBsYW5nLmdldChcImNyZWRpdENhcmRQZW5kaW5nVmVyaWZpY2F0aW9uX21zZ1wiKSksXG5cdFx0XHRcdG0oXG5cdFx0XHRcdFx0XCIuZmxleC1jZW50ZXIuZGlhbG9nLWJ1dHRvbnNcIixcblx0XHRcdFx0XHRtKEJ1dHRvbiwge1xuXHRcdFx0XHRcdFx0bGFiZWw6IFwiY2FuY2VsX2FjdGlvblwiLFxuXHRcdFx0XHRcdFx0Y2xpY2s6IGNsb3NlQWN0aW9uLFxuXHRcdFx0XHRcdFx0dHlwZTogQnV0dG9uVHlwZS5QcmltYXJ5LFxuXHRcdFx0XHRcdH0pLFxuXHRcdFx0XHQpLFxuXHRcdFx0XSxcblx0XHR9KVxuXHRcdFx0LnNldENsb3NlSGFuZGxlcihjbG9zZUFjdGlvbilcblx0XHRcdC5hZGRTaG9ydGN1dCh7XG5cdFx0XHRcdGtleTogS2V5cy5SRVRVUk4sXG5cdFx0XHRcdHNoaWZ0OiBmYWxzZSxcblx0XHRcdFx0ZXhlYzogY2xvc2VBY3Rpb24sXG5cdFx0XHRcdGhlbHA6IFwiY2xvc2VfYWx0XCIsXG5cdFx0XHR9KVxuXHRcdFx0LmFkZFNob3J0Y3V0KHtcblx0XHRcdFx0a2V5OiBLZXlzLkVTQyxcblx0XHRcdFx0c2hpZnQ6IGZhbHNlLFxuXHRcdFx0XHRleGVjOiBjbG9zZUFjdGlvbixcblx0XHRcdFx0aGVscDogXCJjbG9zZV9hbHRcIixcblx0XHRcdH0pXG5cdFx0bGV0IGVudGl0eUV2ZW50TGlzdGVuZXI6IEVudGl0eUV2ZW50c0xpc3RlbmVyID0gKHVwZGF0ZXM6IFJlYWRvbmx5QXJyYXk8RW50aXR5VXBkYXRlRGF0YT4sIGV2ZW50T3duZXJHcm91cElkOiBJZCkgPT4ge1xuXHRcdFx0cmV0dXJuIHByb21pc2VNYXAodXBkYXRlcywgKHVwZGF0ZSkgPT4ge1xuXHRcdFx0XHRpZiAoaXNVcGRhdGVGb3JUeXBlUmVmKEludm9pY2VJbmZvVHlwZVJlZiwgdXBkYXRlKSkge1xuXHRcdFx0XHRcdHJldHVybiBsb2NhdG9yLmVudGl0eUNsaWVudC5sb2FkKEludm9pY2VJbmZvVHlwZVJlZiwgdXBkYXRlLmluc3RhbmNlSWQpLnRoZW4oKGludm9pY2VJbmZvKSA9PiB7XG5cdFx0XHRcdFx0XHRpbnZvaWNlSW5mb1dyYXBwZXIuaW52b2ljZUluZm8gPSBpbnZvaWNlSW5mb1xuXHRcdFx0XHRcdFx0aWYgKCFpbnZvaWNlSW5mby5wYXltZW50RXJyb3JJbmZvKSB7XG5cdFx0XHRcdFx0XHRcdC8vIHVzZXIgc3VjY2Vzc2Z1bGx5IHZlcmlmaWVkIHRoZSBjYXJkXG5cdFx0XHRcdFx0XHRcdHByb2dyZXNzRGlhbG9nLmNsb3NlKClcblx0XHRcdFx0XHRcdFx0cmVzb2x2ZSh0cnVlKVxuXHRcdFx0XHRcdFx0fSBlbHNlIGlmIChpbnZvaWNlSW5mby5wYXltZW50RXJyb3JJbmZvICYmIGludm9pY2VJbmZvLnBheW1lbnRFcnJvckluZm8uZXJyb3JDb2RlID09PSBcImNhcmQuM2RzMl9wZW5kaW5nXCIpIHtcblx0XHRcdFx0XHRcdFx0Ly8ga2VlcCB3YWl0aW5nLiB0aGlzIGVycm9yIGNvZGUgaXMgc2V0IGJlZm9yZSBzdGFydGluZyB0aGUgM0RTMiB2ZXJpZmljYXRpb24gYW5kIHdlIGp1c3QgcmVjZWl2ZWQgdGhlIGV2ZW50IHZlcnkgbGF0ZVxuXHRcdFx0XHRcdFx0fSBlbHNlIGlmIChpbnZvaWNlSW5mby5wYXltZW50RXJyb3JJbmZvICYmIGludm9pY2VJbmZvLnBheW1lbnRFcnJvckluZm8uZXJyb3JDb2RlICE9PSBudWxsKSB7XG5cdFx0XHRcdFx0XHRcdC8vIHZlcmlmaWNhdGlvbiBlcnJvciBkdXJpbmcgM2RzIHZlcmlmaWNhdGlvblxuXHRcdFx0XHRcdFx0XHRsZXQgZXJyb3IgPSBcIjNkc0ZhaWxlZE90aGVyXCJcblxuXHRcdFx0XHRcdFx0XHRzd2l0Y2ggKGludm9pY2VJbmZvLnBheW1lbnRFcnJvckluZm8uZXJyb3JDb2RlIGFzIFBheW1lbnRFcnJvckNvZGUpIHtcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiY2FyZC5jdnZfaW52YWxpZFwiOlxuXHRcdFx0XHRcdFx0XHRcdFx0ZXJyb3IgPSBcImN2dkludmFsaWRcIlxuXHRcdFx0XHRcdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiY2FyZC5udW1iZXJfaW52YWxpZFwiOlxuXHRcdFx0XHRcdFx0XHRcdFx0ZXJyb3IgPSBcImNjTnVtYmVySW52YWxpZFwiXG5cdFx0XHRcdFx0XHRcdFx0XHRicmVha1xuXG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSBcImNhcmQuZGF0ZV9pbnZhbGlkXCI6XG5cdFx0XHRcdFx0XHRcdFx0XHRlcnJvciA9IFwiZXhwaXJhdGlvbkRhdGVcIlxuXHRcdFx0XHRcdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0XHRcdFx0XHRjYXNlIFwiY2FyZC5pbnN1ZmZpY2llbnRfZnVuZHNcIjpcblx0XHRcdFx0XHRcdFx0XHRcdGVycm9yID0gXCJpbnN1ZmZpY2llbnRGdW5kc1wiXG5cdFx0XHRcdFx0XHRcdFx0XHRicmVha1xuXHRcdFx0XHRcdFx0XHRcdGNhc2UgXCJjYXJkLmV4cGlyZWRfY2FyZFwiOlxuXHRcdFx0XHRcdFx0XHRcdFx0ZXJyb3IgPSBcImNhcmRFeHBpcmVkXCJcblx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRcdFx0XHRcdFx0Y2FzZSBcImNhcmQuM2RzMl9mYWlsZWRcIjpcblx0XHRcdFx0XHRcdFx0XHRcdGVycm9yID0gXCIzZHNGYWlsZWRcIlxuXHRcdFx0XHRcdFx0XHRcdFx0YnJlYWtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdERpYWxvZy5tZXNzYWdlKGdldFByZWNvbmRpdGlvbkZhaWxlZFBheW1lbnRNc2coaW52b2ljZUluZm8ucGF5bWVudEVycm9ySW5mby5lcnJvckNvZGUpKVxuXHRcdFx0XHRcdFx0XHRyZXNvbHZlKGZhbHNlKVxuXHRcdFx0XHRcdFx0XHRwcm9ncmVzc0RpYWxvZy5jbG9zZSgpXG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdG0ucmVkcmF3KClcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9XG5cdFx0XHR9KS50aGVuKG5vT3ApXG5cdFx0fVxuXG5cdFx0bG9jYXRvci5ldmVudENvbnRyb2xsZXIuYWRkRW50aXR5TGlzdGVuZXIoZW50aXR5RXZlbnRMaXN0ZW5lcilcblx0XHRjb25zdCBhcHAgPSBjbGllbnQuaXNDYWxlbmRhckFwcCgpID8gXCJjYWxlbmRhclwiIDogXCJtYWlsXCJcblx0XHRsZXQgcGFyYW1zID0gYGNsaWVudFRva2VuPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGJyYWludHJlZTNkcy5jbGllbnRUb2tlbil9Jm5vbmNlPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGJyYWludHJlZTNkcy5ub25jZSl9JmJpbj0ke2VuY29kZVVSSUNvbXBvbmVudChcblx0XHRcdGJyYWludHJlZTNkcy5iaW4sXG5cdFx0KX0mcHJpY2U9JHtlbmNvZGVVUklDb21wb25lbnQocHJpY2UpfSZtZXNzYWdlPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGxhbmcuZ2V0KFwiY3JlZGl0Q2FyZFZlcmlmaWNhdGlvbl9tc2dcIikpfSZjbGllbnRUeXBlPSR7Z2V0Q2xpZW50VHlwZSgpfSZhcHA9JHthcHB9YFxuXHRcdERpYWxvZy5tZXNzYWdlKFwiY3JlZGl0Q2FyZFZlcmlmaWNhdGlvbk5lZWRlZFBvcHVwX21zZ1wiKS50aGVuKCgpID0+IHtcblx0XHRcdGNvbnN0IHBheW1lbnRVcmxTdHJpbmcgPSBsb2NhdG9yLmRvbWFpbkNvbmZpZ1Byb3ZpZGVyKCkuZ2V0Q3VycmVudERvbWFpbkNvbmZpZygpLnBheW1lbnRVcmxcblx0XHRcdGNvbnN0IHBheW1lbnRVcmwgPSBuZXcgVVJMKHBheW1lbnRVcmxTdHJpbmcpXG5cdFx0XHRwYXltZW50VXJsLmhhc2ggKz0gcGFyYW1zXG5cdFx0XHR3aW5kb3cub3BlbihwYXltZW50VXJsKVxuXHRcdFx0cHJvZ3Jlc3NEaWFsb2cuc2hvdygpXG5cdFx0fSlcblx0XHRyZXR1cm4gcHJvZ3Jlc3NEaWFsb2dQcm9taXNlLmZpbmFsbHkoKCkgPT4gbG9jYXRvci5ldmVudENvbnRyb2xsZXIucmVtb3ZlRW50aXR5TGlzdGVuZXIoZW50aXR5RXZlbnRMaXN0ZW5lcikpXG5cdH0pXG59XG4iLCJpbXBvcnQgbSBmcm9tIFwibWl0aHJpbFwiXG5pbXBvcnQgeyBEaWFsb2cgfSBmcm9tIFwiLi4vZ3VpL2Jhc2UvRGlhbG9nXCJcbmltcG9ydCB7IEludm9pY2VEYXRhSW5wdXQsIEludm9pY2VEYXRhSW5wdXRMb2NhdGlvbiB9IGZyb20gXCIuL0ludm9pY2VEYXRhSW5wdXRcIlxuaW1wb3J0IHsgdXBkYXRlUGF5bWVudERhdGEgfSBmcm9tIFwiLi9JbnZvaWNlQW5kUGF5bWVudERhdGFQYWdlXCJcbmltcG9ydCB7IEJhZFJlcXVlc3RFcnJvciB9IGZyb20gXCIuLi9hcGkvY29tbW9uL2Vycm9yL1Jlc3RFcnJvclwiXG5pbXBvcnQgdHlwZSB7IEFjY291bnRpbmdJbmZvLCBDdXN0b21lciB9IGZyb20gXCIuLi9hcGkvZW50aXRpZXMvc3lzL1R5cGVSZWZzLmpzXCJcbmltcG9ydCB7IHNob3dQcm9ncmVzc0RpYWxvZyB9IGZyb20gXCIuLi9ndWkvZGlhbG9ncy9Qcm9ncmVzc0RpYWxvZ1wiXG5pbXBvcnQgdHlwZSB7IEludm9pY2VEYXRhIH0gZnJvbSBcIi4uL2FwaS9jb21tb24vVHV0YW5vdGFDb25zdGFudHNcIlxuaW1wb3J0IHsgYXNQYXltZW50SW50ZXJ2YWwgfSBmcm9tIFwiLi9QcmljZVV0aWxzLmpzXCJcbmltcG9ydCB7IGRlZmVyLCBvZkNsYXNzIH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5pbXBvcnQgeyBQcm9ncmFtbWluZ0Vycm9yIH0gZnJvbSBcIi4uL2FwaS9jb21tb24vZXJyb3IvUHJvZ3JhbW1pbmdFcnJvci5qc1wiXG5cbi8qKlxuICogU2hvd3MgYSBkaWFsb2cgdG8gdXBkYXRlIHRoZSBpbnZvaWNlIGRhdGEgZm9yIGJ1c2luZXNzIHVzZS4gU3dpdGNoZXMgdGhlIGFjY291bnQgdG8gYnVzaW5lc3MgdXNlIGJlZm9yZSBhY3R1YWxseSBzYXZpbmcgdGhlIG5ldyBpbnZvaWNlIGRhdGFcbiAqIGJlY2F1c2Ugb25seSB3aGVuIHRoZSBhY2NvdW50IGlzIHNldCB0byBidXNpbmVzcyB1c2Ugc29tZSBwYXltZW50IGRhdGEgbGlrZSB2YXQgaWQgbnVtYmVyIG1heSBiZSBzYXZlZC5cbiAqIEByZXR1cm4gdHJ1ZSwgaWYgdGhlIGJ1c2luZXNzIGludm9pY2VEYXRhIHdhcyB3cml0dGVuIHN1Y2Nlc3NmdWxseVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2hvd1N3aXRjaFRvQnVzaW5lc3NJbnZvaWNlRGF0YURpYWxvZyhjdXN0b21lcjogQ3VzdG9tZXIsIGludm9pY2VEYXRhOiBJbnZvaWNlRGF0YSwgYWNjb3VudGluZ0luZm86IEFjY291bnRpbmdJbmZvKTogUHJvbWlzZTxib29sZWFuPiB7XG5cdGlmIChjdXN0b21lci5idXNpbmVzc1VzZSkge1xuXHRcdHRocm93IG5ldyBQcm9ncmFtbWluZ0Vycm9yKFwiY2Fubm90IHNob3cgaW52b2ljZSBkYXRhIGRpYWxvZyBpZiB0aGUgY3VzdG9tZXIgaXMgYWxyZWFkeSBhIGJ1c2luZXNzIGN1c3RvbWVyXCIpXG5cdH1cblx0Y29uc3QgaW52b2ljZURhdGFJbnB1dCA9IG5ldyBJbnZvaWNlRGF0YUlucHV0KHRydWUsIGludm9pY2VEYXRhLCBJbnZvaWNlRGF0YUlucHV0TG9jYXRpb24uSW5XaXphcmQpXG5cblx0Y29uc3QgcmVzdWx0ID0gZGVmZXI8Ym9vbGVhbj4oKVxuXHRjb25zdCBjb25maXJtQWN0aW9uID0gYXN5bmMgKCkgPT4ge1xuXHRcdGxldCBlcnJvciA9IGludm9pY2VEYXRhSW5wdXQudmFsaWRhdGVJbnZvaWNlRGF0YSgpXG5cblx0XHRpZiAoZXJyb3IpIHtcblx0XHRcdERpYWxvZy5tZXNzYWdlKGVycm9yKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRzaG93UHJvZ3Jlc3NEaWFsb2coXCJwbGVhc2VXYWl0X21zZ1wiLCByZXN1bHQucHJvbWlzZSlcblxuXHRcdFx0Y29uc3Qgc3VjY2VzcyA9IGF3YWl0IHVwZGF0ZVBheW1lbnREYXRhKFxuXHRcdFx0XHRhc1BheW1lbnRJbnRlcnZhbChhY2NvdW50aW5nSW5mby5wYXltZW50SW50ZXJ2YWwpLFxuXHRcdFx0XHRpbnZvaWNlRGF0YUlucHV0LmdldEludm9pY2VEYXRhKCksXG5cdFx0XHRcdG51bGwsXG5cdFx0XHRcdG51bGwsXG5cdFx0XHRcdGZhbHNlLFxuXHRcdFx0XHRcIjBcIixcblx0XHRcdFx0YWNjb3VudGluZ0luZm8sXG5cdFx0XHQpXG5cdFx0XHRcdC5jYXRjaChcblx0XHRcdFx0XHRvZkNsYXNzKEJhZFJlcXVlc3RFcnJvciwgKCkgPT4ge1xuXHRcdFx0XHRcdFx0RGlhbG9nLm1lc3NhZ2UoXCJwYXltZW50TWV0aG9kTm90QXZhaWxhYmxlX21zZ1wiKVxuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdClcblx0XHRcdFx0LmNhdGNoKChlKSA9PiB7XG5cdFx0XHRcdFx0cmVzdWx0LnJlamVjdChlKVxuXHRcdFx0XHR9KVxuXHRcdFx0aWYgKHN1Y2Nlc3MpIHtcblx0XHRcdFx0ZGlhbG9nLmNsb3NlKClcblx0XHRcdFx0cmVzdWx0LnJlc29sdmUodHJ1ZSlcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJlc3VsdC5yZXNvbHZlKGZhbHNlKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGNvbnN0IGNhbmNlbEFjdGlvbiA9ICgpID0+IHJlc3VsdC5yZXNvbHZlKGZhbHNlKVxuXG5cdGNvbnN0IGRpYWxvZyA9IERpYWxvZy5zaG93QWN0aW9uRGlhbG9nKHtcblx0XHR0aXRsZTogXCJpbnZvaWNlRGF0YV9tc2dcIixcblx0XHRjaGlsZDoge1xuXHRcdFx0dmlldzogKCkgPT5cblx0XHRcdFx0bShcIiNjaGFuZ2VJbnZvaWNlRGF0YURpYWxvZ1wiLCBbXG5cdFx0XHRcdFx0Ly8gaW5mb01lc3NhZ2VJZCA/IG0oXCIucHRcIiwgbGFuZy5nZXQoaW5mb01lc3NhZ2VJZCkpIDogbnVsbCxcblx0XHRcdFx0XHRtKGludm9pY2VEYXRhSW5wdXQpLFxuXHRcdFx0XHRdKSxcblx0XHR9LFxuXHRcdG9rQWN0aW9uOiBjb25maXJtQWN0aW9uLFxuXHRcdGNhbmNlbEFjdGlvbjogY2FuY2VsQWN0aW9uLFxuXHRcdGFsbG93Q2FuY2VsOiB0cnVlLFxuXHRcdG9rQWN0aW9uVGV4dElkOiBcInNhdmVfYWN0aW9uXCIsXG5cdH0pXG5cblx0cmV0dXJuIHJlc3VsdC5wcm9taXNlXG59XG4iLCIvKiBnZW5lcmF0ZWQgZmlsZSwgZG9uJ3QgZWRpdC4gKi9cblxuZXhwb3J0IGNvbnN0IGVudW0gTW9iaWxlUGF5bWVudFN1YnNjcmlwdGlvbk93bmVyc2hpcCB7XG5cdE93bmVyID0gXCIwXCIsXG5cdE5vdE93bmVyID0gXCIxXCIsXG5cdE5vU3Vic2NyaXB0aW9uID0gXCIyXCIsXG59XG4iLCJpbXBvcnQgbSBmcm9tIFwibWl0aHJpbFwiXG5pbXBvcnQgeyBEaWFsb2cgfSBmcm9tIFwiLi4vZ3VpL2Jhc2UvRGlhbG9nXCJcbmltcG9ydCB0eXBlIHsgVHJhbnNsYXRpb25LZXkgfSBmcm9tIFwiLi4vbWlzYy9MYW5ndWFnZVZpZXdNb2RlbFwiXG5pbXBvcnQgeyBsYW5nIH0gZnJvbSBcIi4uL21pc2MvTGFuZ3VhZ2VWaWV3TW9kZWxcIlxuaW1wb3J0IHsgSW52b2ljZURhdGFJbnB1dCB9IGZyb20gXCIuL0ludm9pY2VEYXRhSW5wdXRcIlxuaW1wb3J0IHsgdXBkYXRlUGF5bWVudERhdGEgfSBmcm9tIFwiLi9JbnZvaWNlQW5kUGF5bWVudERhdGFQYWdlXCJcbmltcG9ydCB7IEJhZFJlcXVlc3RFcnJvciB9IGZyb20gXCIuLi9hcGkvY29tbW9uL2Vycm9yL1Jlc3RFcnJvclwiXG5pbXBvcnQgdHlwZSB7IEFjY291bnRpbmdJbmZvIH0gZnJvbSBcIi4uL2FwaS9lbnRpdGllcy9zeXMvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHR5cGUgeyBJbnZvaWNlRGF0YSB9IGZyb20gXCIuLi9hcGkvY29tbW9uL1R1dGFub3RhQ29uc3RhbnRzXCJcbmltcG9ydCB7IG9mQ2xhc3MgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB7IGFzUGF5bWVudEludGVydmFsIH0gZnJvbSBcIi4vUHJpY2VVdGlscy5qc1wiXG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93KFxuXHRidXNpbmVzc1VzZTogYm9vbGVhbixcblx0aW52b2ljZURhdGE6IEludm9pY2VEYXRhLFxuXHRhY2NvdW50aW5nSW5mbzogQWNjb3VudGluZ0luZm8sXG5cdGhlYWRpbmdJZD86IFRyYW5zbGF0aW9uS2V5LFxuXHRpbmZvTWVzc2FnZUlkPzogVHJhbnNsYXRpb25LZXksXG4pOiBEaWFsb2cge1xuXHRjb25zdCBpbnZvaWNlRGF0YUlucHV0ID0gbmV3IEludm9pY2VEYXRhSW5wdXQoYnVzaW5lc3NVc2UsIGludm9pY2VEYXRhKVxuXG5cdGNvbnN0IGNvbmZpcm1BY3Rpb24gPSAoKSA9PiB7XG5cdFx0bGV0IGVycm9yID0gaW52b2ljZURhdGFJbnB1dC52YWxpZGF0ZUludm9pY2VEYXRhKClcblxuXHRcdGlmIChlcnJvcikge1xuXHRcdFx0RGlhbG9nLm1lc3NhZ2UoZXJyb3IpXG5cdFx0fSBlbHNlIHtcblx0XHRcdHVwZGF0ZVBheW1lbnREYXRhKGFzUGF5bWVudEludGVydmFsKGFjY291bnRpbmdJbmZvLnBheW1lbnRJbnRlcnZhbCksIGludm9pY2VEYXRhSW5wdXQuZ2V0SW52b2ljZURhdGEoKSwgbnVsbCwgbnVsbCwgZmFsc2UsIFwiMFwiLCBhY2NvdW50aW5nSW5mbylcblx0XHRcdFx0LnRoZW4oKHN1Y2Nlc3MpID0+IHtcblx0XHRcdFx0XHRpZiAoc3VjY2Vzcykge1xuXHRcdFx0XHRcdFx0ZGlhbG9nLmNsb3NlKClcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChcblx0XHRcdFx0XHRvZkNsYXNzKEJhZFJlcXVlc3RFcnJvciwgKGUpID0+IHtcblx0XHRcdFx0XHRcdERpYWxvZy5tZXNzYWdlKFwicGF5bWVudE1ldGhvZE5vdEF2YWlsYWJsZV9tc2dcIilcblx0XHRcdFx0XHR9KSxcblx0XHRcdFx0KVxuXHRcdH1cblx0fVxuXG5cdGNvbnN0IGRpYWxvZyA9IERpYWxvZy5zaG93QWN0aW9uRGlhbG9nKHtcblx0XHR0aXRsZTogaGVhZGluZ0lkID8gaGVhZGluZ0lkIDogXCJpbnZvaWNlRGF0YV9tc2dcIixcblx0XHRjaGlsZDoge1xuXHRcdFx0dmlldzogKCkgPT4gbShcIiNjaGFuZ2VJbnZvaWNlRGF0YURpYWxvZ1wiLCBbaW5mb01lc3NhZ2VJZCA/IG0oXCIucHRcIiwgbGFuZy5nZXQoaW5mb01lc3NhZ2VJZCkpIDogbnVsbCwgbShpbnZvaWNlRGF0YUlucHV0KV0pLFxuXHRcdH0sXG5cdFx0b2tBY3Rpb246IGNvbmZpcm1BY3Rpb24sXG5cdFx0YWxsb3dDYW5jZWw6IHRydWUsXG5cdFx0b2tBY3Rpb25UZXh0SWQ6IFwic2F2ZV9hY3Rpb25cIixcblx0fSlcblx0cmV0dXJuIGRpYWxvZ1xufVxuIiwiaW1wb3J0IG0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHN0cmVhbSBmcm9tIFwibWl0aHJpbC9zdHJlYW1cIlxuaW1wb3J0IHsgRGlhbG9nIH0gZnJvbSBcIi4uL2d1aS9iYXNlL0RpYWxvZ1wiXG5pbXBvcnQgeyBsYW5nIH0gZnJvbSBcIi4uL21pc2MvTGFuZ3VhZ2VWaWV3TW9kZWxcIlxuaW1wb3J0IHsgZ2V0QnlBYmJyZXZpYXRpb24gfSBmcm9tIFwiLi4vYXBpL2NvbW1vbi9Db3VudHJ5TGlzdFwiXG5pbXBvcnQgeyBQYXltZW50TWV0aG9kSW5wdXQgfSBmcm9tIFwiLi9QYXltZW50TWV0aG9kSW5wdXRcIlxuaW1wb3J0IHsgdXBkYXRlUGF5bWVudERhdGEgfSBmcm9tIFwiLi9JbnZvaWNlQW5kUGF5bWVudERhdGFQYWdlXCJcbmltcG9ydCB7IHB4IH0gZnJvbSBcIi4uL2d1aS9zaXplXCJcbmltcG9ydCB7IHNob3dQcm9ncmVzc0RpYWxvZyB9IGZyb20gXCIuLi9ndWkvZGlhbG9ncy9Qcm9ncmVzc0RpYWxvZ1wiXG5pbXBvcnQgeyBnZXREZWZhdWx0UGF5bWVudE1ldGhvZCwgUGF5bWVudE1ldGhvZFR5cGUgfSBmcm9tIFwiLi4vYXBpL2NvbW1vbi9UdXRhbm90YUNvbnN0YW50c1wiXG5pbXBvcnQgeyBhc3NlcnROb3ROdWxsLCBuZXZlck51bGwgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB0eXBlIHsgQWNjb3VudGluZ0luZm8sIEN1c3RvbWVyIH0gZnJvbSBcIi4uL2FwaS9lbnRpdGllcy9zeXMvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgRHJvcERvd25TZWxlY3RvciB9IGZyb20gXCIuLi9ndWkvYmFzZS9Ecm9wRG93blNlbGVjdG9yLmpzXCJcbmltcG9ydCB7IGFzUGF5bWVudEludGVydmFsIH0gZnJvbSBcIi4vUHJpY2VVdGlscy5qc1wiXG5pbXBvcnQgeyBnZXRMYXp5TG9hZGVkUGF5UGFsVXJsIH0gZnJvbSBcIi4vU3Vic2NyaXB0aW9uVXRpbHMuanNcIlxuaW1wb3J0IHsgbG9jYXRvciB9IGZyb20gXCIuLi9hcGkvbWFpbi9Db21tb25Mb2NhdG9yLmpzXCJcbmltcG9ydCB7IGZvcm1hdE5hbWVBbmRBZGRyZXNzIH0gZnJvbSBcIi4uL2FwaS9jb21tb24vdXRpbHMvQ29tbW9uRm9ybWF0dGVyLmpzXCJcblxuLyoqXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgcGF5bWVudCBkYXRhIHVwZGF0ZSB3YXMgc3VjY2Vzc2Z1bFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2hvdyhjdXN0b21lcjogQ3VzdG9tZXIsIGFjY291bnRpbmdJbmZvOiBBY2NvdW50aW5nSW5mbywgcHJpY2U6IG51bWJlciwgZGVmYXVsdFBheW1lbnRNZXRob2Q6IFBheW1lbnRNZXRob2RUeXBlKTogUHJvbWlzZTxib29sZWFuPiB7XG5cdGNvbnN0IHBheVBhbFJlcXVlc3RVcmwgPSBnZXRMYXp5TG9hZGVkUGF5UGFsVXJsKClcblx0Y29uc3QgaW52b2ljZURhdGEgPSB7XG5cdFx0aW52b2ljZUFkZHJlc3M6IGZvcm1hdE5hbWVBbmRBZGRyZXNzKGFjY291bnRpbmdJbmZvLmludm9pY2VOYW1lLCBhY2NvdW50aW5nSW5mby5pbnZvaWNlQWRkcmVzcyksXG5cdFx0Y291bnRyeTogYWNjb3VudGluZ0luZm8uaW52b2ljZUNvdW50cnkgPyBnZXRCeUFiYnJldmlhdGlvbihhY2NvdW50aW5nSW5mby5pbnZvaWNlQ291bnRyeSkgOiBudWxsLFxuXHRcdHZhdE51bWJlcjogYWNjb3VudGluZ0luZm8uaW52b2ljZVZhdElkTm8sXG5cdH1cblx0Y29uc3Qgc3Vic2NyaXB0aW9uT3B0aW9ucyA9IHtcblx0XHRidXNpbmVzc1VzZTogc3RyZWFtKGFzc2VydE5vdE51bGwoY3VzdG9tZXIuYnVzaW5lc3NVc2UpKSxcblx0XHRwYXltZW50SW50ZXJ2YWw6IHN0cmVhbShhc1BheW1lbnRJbnRlcnZhbChhY2NvdW50aW5nSW5mby5wYXltZW50SW50ZXJ2YWwpKSxcblx0fVxuXHRjb25zdCBwYXltZW50TWV0aG9kSW5wdXQgPSBuZXcgUGF5bWVudE1ldGhvZElucHV0KFxuXHRcdHN1YnNjcmlwdGlvbk9wdGlvbnMsXG5cdFx0c3RyZWFtKGludm9pY2VEYXRhLmNvdW50cnkpLFxuXHRcdG5ldmVyTnVsbChhY2NvdW50aW5nSW5mbyksXG5cdFx0cGF5UGFsUmVxdWVzdFVybCxcblx0XHRkZWZhdWx0UGF5bWVudE1ldGhvZCxcblx0KVxuXHRjb25zdCBhdmFpbGFibGVQYXltZW50TWV0aG9kcyA9IHBheW1lbnRNZXRob2RJbnB1dC5nZXRWaXNpYmxlUGF5bWVudE1ldGhvZHMoKVxuXG5cdGxldCBzZWxlY3RlZFBheW1lbnRNZXRob2QgPSBhY2NvdW50aW5nSW5mby5wYXltZW50TWV0aG9kIGFzIFBheW1lbnRNZXRob2RUeXBlXG5cdHBheW1lbnRNZXRob2RJbnB1dC51cGRhdGVQYXltZW50TWV0aG9kKHNlbGVjdGVkUGF5bWVudE1ldGhvZClcblx0Y29uc3Qgc2VsZWN0ZWRQYXltZW50TWV0aG9kQ2hhbmdlZEhhbmRsZXIgPSBhc3luYyAodmFsdWU6IFBheW1lbnRNZXRob2RUeXBlKSA9PiB7XG5cdFx0aWYgKHZhbHVlID09PSBQYXltZW50TWV0aG9kVHlwZS5QYXlwYWwgJiYgIXBheVBhbFJlcXVlc3RVcmwuaXNMb2FkZWQoKSkge1xuXHRcdFx0YXdhaXQgc2hvd1Byb2dyZXNzRGlhbG9nKFwicGxlYXNlV2FpdF9tc2dcIiwgcGF5UGFsUmVxdWVzdFVybC5nZXRBc3luYygpKVxuXHRcdH1cblx0XHRzZWxlY3RlZFBheW1lbnRNZXRob2QgPSB2YWx1ZVxuXHRcdHBheW1lbnRNZXRob2RJbnB1dC51cGRhdGVQYXltZW50TWV0aG9kKHZhbHVlKVxuXHR9XG5cblx0Y29uc3QgZGlkTGlua1BheXBhbCA9ICgpID0+IHNlbGVjdGVkUGF5bWVudE1ldGhvZCA9PT0gUGF5bWVudE1ldGhvZFR5cGUuUGF5cGFsICYmIHBheW1lbnRNZXRob2RJbnB1dC5pc1BheXBhbEFzc2lnbmVkKClcblxuXHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRjb25zdCBjb25maXJtQWN0aW9uID0gKCkgPT4ge1xuXHRcdFx0bGV0IGVycm9yID0gcGF5bWVudE1ldGhvZElucHV0LnZhbGlkYXRlUGF5bWVudERhdGEoKVxuXG5cdFx0XHRpZiAoZXJyb3IpIHtcblx0XHRcdFx0RGlhbG9nLm1lc3NhZ2UoZXJyb3IpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBmaW5pc2ggPSAoc3VjY2VzczogYm9vbGVhbikgPT4ge1xuXHRcdFx0XHRcdGlmIChzdWNjZXNzKSB7XG5cdFx0XHRcdFx0XHRkaWFsb2cuY2xvc2UoKVxuXHRcdFx0XHRcdFx0cmVzb2x2ZSh0cnVlKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIHVwZGF0ZVBheW1lbnREYXRhIGdldHMgZG9uZSB3aGVuIHRoZSBiaWcgcGF5cGFsIGJ1dHRvbiBpcyBjbGlja2VkXG5cdFx0XHRcdGlmIChkaWRMaW5rUGF5cGFsKCkpIHtcblx0XHRcdFx0XHRmaW5pc2godHJ1ZSlcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRzaG93UHJvZ3Jlc3NEaWFsb2coXG5cdFx0XHRcdFx0XHRcInVwZGF0ZVBheW1lbnREYXRhQnVzeV9tc2dcIixcblx0XHRcdFx0XHRcdHVwZGF0ZVBheW1lbnREYXRhKFxuXHRcdFx0XHRcdFx0XHRzdWJzY3JpcHRpb25PcHRpb25zLnBheW1lbnRJbnRlcnZhbCgpLFxuXHRcdFx0XHRcdFx0XHRpbnZvaWNlRGF0YSxcblx0XHRcdFx0XHRcdFx0cGF5bWVudE1ldGhvZElucHV0LmdldFBheW1lbnREYXRhKCksXG5cdFx0XHRcdFx0XHRcdGludm9pY2VEYXRhLmNvdW50cnksXG5cdFx0XHRcdFx0XHRcdGZhbHNlLFxuXHRcdFx0XHRcdFx0XHRwcmljZSArIFwiXCIsXG5cdFx0XHRcdFx0XHRcdGFjY291bnRpbmdJbmZvLFxuXHRcdFx0XHRcdFx0KSxcblx0XHRcdFx0XHQpLnRoZW4oZmluaXNoKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Y29uc3QgZGlhbG9nID0gRGlhbG9nLnNob3dBY3Rpb25EaWFsb2coe1xuXHRcdFx0dGl0bGU6IFwiYWRtaW5QYXltZW50X2FjdGlvblwiLFxuXHRcdFx0Y2hpbGQ6IHtcblx0XHRcdFx0dmlldzogKCkgPT5cblx0XHRcdFx0XHRtKFxuXHRcdFx0XHRcdFx0XCIjY2hhbmdlUGF5bWVudERhdGFEaWFsb2dcIixcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0c3R5bGU6IHtcblx0XHRcdFx0XHRcdFx0XHRtaW5IZWlnaHQ6IHB4KDMxMCksXG5cdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0W1xuXHRcdFx0XHRcdFx0XHRtKERyb3BEb3duU2VsZWN0b3IsIHtcblx0XHRcdFx0XHRcdFx0XHRsYWJlbDogXCJwYXltZW50TWV0aG9kX2xhYmVsXCIsXG5cdFx0XHRcdFx0XHRcdFx0aXRlbXM6IGF2YWlsYWJsZVBheW1lbnRNZXRob2RzLFxuXHRcdFx0XHRcdFx0XHRcdHNlbGVjdGVkVmFsdWU6IHNlbGVjdGVkUGF5bWVudE1ldGhvZCxcblx0XHRcdFx0XHRcdFx0XHRzZWxlY3Rpb25DaGFuZ2VkSGFuZGxlcjogc2VsZWN0ZWRQYXltZW50TWV0aG9kQ2hhbmdlZEhhbmRsZXIsXG5cdFx0XHRcdFx0XHRcdFx0ZHJvcGRvd25XaWR0aDogMjUwLFxuXHRcdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRcdFx0bShwYXltZW50TWV0aG9kSW5wdXQpLFxuXHRcdFx0XHRcdFx0XSxcblx0XHRcdFx0XHQpLFxuXHRcdFx0fSxcblx0XHRcdG9rQWN0aW9uOiBjb25maXJtQWN0aW9uLFxuXHRcdFx0Ly8gaWYgdGhleSd2ZSBqdXN0IGdvbmUgdGhyb3VnaCB0aGUgcHJvY2VzcyBvZiBsaW5raW5nIGEgcGF5cGFsIGFjY291bnQsIGRvbid0IG9mZmVyIGEgY2FuY2VsIGJ1dHRvblxuXHRcdFx0YWxsb3dDYW5jZWw6ICgpID0+ICFkaWRMaW5rUGF5cGFsKCksXG5cdFx0XHRva0FjdGlvblRleHRJZDogZGlkTGlua1BheXBhbCgpID8gXCJjbG9zZV9hbHRcIiA6IFwic2F2ZV9hY3Rpb25cIixcblx0XHRcdGNhbmNlbEFjdGlvbjogKCkgPT4gcmVzb2x2ZShmYWxzZSksXG5cdFx0fSlcblx0fSlcbn1cbiIsImltcG9ydCB7IGNyZWF0ZSwgU3RyaXBwZWQsIFN0cmlwcGVkRW50aXR5IH0gZnJvbSBcIi4uLy4uL2NvbW1vbi91dGlscy9FbnRpdHlVdGlscy5qc1wiXG5pbXBvcnQgeyBUeXBlUmVmIH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5pbXBvcnQgeyB0eXBlTW9kZWxzIH0gZnJvbSBcIi4vVHlwZU1vZGVscy5qc1wiXG5cblxuZXhwb3J0IGNvbnN0IEN1c3RvbWVyQWNjb3VudFBvc3RpbmdUeXBlUmVmOiBUeXBlUmVmPEN1c3RvbWVyQWNjb3VudFBvc3Rpbmc+ID0gbmV3IFR5cGVSZWYoXCJhY2NvdW50aW5nXCIsIFwiQ3VzdG9tZXJBY2NvdW50UG9zdGluZ1wiKVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ3VzdG9tZXJBY2NvdW50UG9zdGluZyh2YWx1ZXM6IFN0cmlwcGVkRW50aXR5PEN1c3RvbWVyQWNjb3VudFBvc3Rpbmc+KTogQ3VzdG9tZXJBY2NvdW50UG9zdGluZyB7XG5cdHJldHVybiBPYmplY3QuYXNzaWduKGNyZWF0ZSh0eXBlTW9kZWxzLkN1c3RvbWVyQWNjb3VudFBvc3RpbmcsIEN1c3RvbWVyQWNjb3VudFBvc3RpbmdUeXBlUmVmKSwgdmFsdWVzKVxufVxuXG5leHBvcnQgdHlwZSBDdXN0b21lckFjY291bnRQb3N0aW5nID0ge1xuXHRfdHlwZTogVHlwZVJlZjxDdXN0b21lckFjY291bnRQb3N0aW5nPjtcblxuXHRfaWQ6IElkO1xuXHRhbW91bnQ6IE51bWJlclN0cmluZztcblx0aW52b2ljZU51bWJlcjogbnVsbCB8IHN0cmluZztcblx0dHlwZTogTnVtYmVyU3RyaW5nO1xuXHR2YWx1ZURhdGU6IERhdGU7XG59XG5leHBvcnQgY29uc3QgQ3VzdG9tZXJBY2NvdW50UmV0dXJuVHlwZVJlZjogVHlwZVJlZjxDdXN0b21lckFjY291bnRSZXR1cm4+ID0gbmV3IFR5cGVSZWYoXCJhY2NvdW50aW5nXCIsIFwiQ3VzdG9tZXJBY2NvdW50UmV0dXJuXCIpXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDdXN0b21lckFjY291bnRSZXR1cm4odmFsdWVzOiBTdHJpcHBlZEVudGl0eTxDdXN0b21lckFjY291bnRSZXR1cm4+KTogQ3VzdG9tZXJBY2NvdW50UmV0dXJuIHtcblx0cmV0dXJuIE9iamVjdC5hc3NpZ24oY3JlYXRlKHR5cGVNb2RlbHMuQ3VzdG9tZXJBY2NvdW50UmV0dXJuLCBDdXN0b21lckFjY291bnRSZXR1cm5UeXBlUmVmKSwgdmFsdWVzKVxufVxuXG5leHBvcnQgdHlwZSBDdXN0b21lckFjY291bnRSZXR1cm4gPSB7XG5cdF90eXBlOiBUeXBlUmVmPEN1c3RvbWVyQWNjb3VudFJldHVybj47XG5cdF9lcnJvcnM6IE9iamVjdDtcblxuXHRfZm9ybWF0OiBOdW1iZXJTdHJpbmc7XG5cdF9vd25lckdyb3VwOiBudWxsIHwgSWQ7XG5cdF9vd25lclB1YmxpY0VuY1Nlc3Npb25LZXk6IG51bGwgfCBVaW50OEFycmF5O1xuXHRfcHVibGljQ3J5cHRvUHJvdG9jb2xWZXJzaW9uOiBudWxsIHwgTnVtYmVyU3RyaW5nO1xuXHRiYWxhbmNlOiBOdW1iZXJTdHJpbmc7XG5cdG91dHN0YW5kaW5nQm9va2luZ3NQcmljZTogTnVtYmVyU3RyaW5nO1xuXG5cdHBvc3RpbmdzOiBDdXN0b21lckFjY291bnRQb3N0aW5nW107XG59XG4iLCJpbXBvcnQgeyBDdXN0b21lckFjY291bnRSZXR1cm5UeXBlUmVmIH0gZnJvbSBcIi4vVHlwZVJlZnMuanNcIlxuXG5leHBvcnQgY29uc3QgQ3VzdG9tZXJBY2NvdW50U2VydmljZSA9IE9iamVjdC5mcmVlemUoe1xuXHRhcHA6IFwiYWNjb3VudGluZ1wiLFxuXHRuYW1lOiBcIkN1c3RvbWVyQWNjb3VudFNlcnZpY2VcIixcblx0Z2V0OiB7IGRhdGE6IG51bGwsIHJldHVybjogQ3VzdG9tZXJBY2NvdW50UmV0dXJuVHlwZVJlZiB9LFxuXHRwb3N0OiBudWxsLFxuXHRwdXQ6IG51bGwsXG5cdGRlbGV0ZTogbnVsbCxcbn0gYXMgY29uc3QpIiwiaW1wb3J0IG0sIHsgQ2hpbGRyZW4gfSBmcm9tIFwibWl0aHJpbFwiXG5pbXBvcnQgeyBhc3NlcnRNYWluT3JOb2RlLCBpc0lPU0FwcCB9IGZyb20gXCIuLi9hcGkvY29tbW9uL0VudlwiXG5pbXBvcnQgeyBhc3NlcnROb3ROdWxsLCBsYXN0LCBuZXZlck51bGwsIG9mQ2xhc3MgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB7IEluZm9MaW5rLCBsYW5nLCBUcmFuc2xhdGlvbktleSB9IGZyb20gXCIuLi9taXNjL0xhbmd1YWdlVmlld01vZGVsXCJcbmltcG9ydCB7XG5cdEFjY291bnRpbmdJbmZvLFxuXHRBY2NvdW50aW5nSW5mb1R5cGVSZWYsXG5cdEJvb2tpbmdUeXBlUmVmLFxuXHRjcmVhdGVEZWJpdFNlcnZpY2VQdXREYXRhLFxuXHRDdXN0b21lcixcblx0Q3VzdG9tZXJUeXBlUmVmLFxuXHRJbnZvaWNlSW5mbyxcblx0SW52b2ljZUluZm9UeXBlUmVmLFxufSBmcm9tIFwiLi4vYXBpL2VudGl0aWVzL3N5cy9UeXBlUmVmcy5qc1wiXG5pbXBvcnQgeyBIdG1sRWRpdG9yLCBIdG1sRWRpdG9yTW9kZSB9IGZyb20gXCIuLi9ndWkvZWRpdG9yL0h0bWxFZGl0b3JcIlxuaW1wb3J0IHsgZm9ybWF0UHJpY2UsIGdldFBheW1lbnRNZXRob2RJbmZvVGV4dCwgZ2V0UGF5bWVudE1ldGhvZE5hbWUgfSBmcm9tIFwiLi9QcmljZVV0aWxzXCJcbmltcG9ydCAqIGFzIEludm9pY2VEYXRhRGlhbG9nIGZyb20gXCIuL0ludm9pY2VEYXRhRGlhbG9nXCJcbmltcG9ydCB7IEljb25zIH0gZnJvbSBcIi4uL2d1aS9iYXNlL2ljb25zL0ljb25zXCJcbmltcG9ydCB7IENvbHVtbldpZHRoLCBUYWJsZSwgVGFibGVMaW5lQXR0cnMgfSBmcm9tIFwiLi4vZ3VpL2Jhc2UvVGFibGUuanNcIlxuaW1wb3J0IHsgQnV0dG9uVHlwZSB9IGZyb20gXCIuLi9ndWkvYmFzZS9CdXR0b24uanNcIlxuaW1wb3J0IHsgZm9ybWF0RGF0ZSB9IGZyb20gXCIuLi9taXNjL0Zvcm1hdHRlclwiXG5pbXBvcnQge1xuXHRBY2NvdW50VHlwZSxcblx0QXZhaWxhYmxlUGxhbnMsXG5cdGdldERlZmF1bHRQYXltZW50TWV0aG9kLFxuXHRnZXRQYXltZW50TWV0aG9kVHlwZSxcblx0TmV3UGFpZFBsYW5zLFxuXHRQYXltZW50TWV0aG9kVHlwZSxcblx0UG9zdGluZ1R5cGUsXG59IGZyb20gXCIuLi9hcGkvY29tbW9uL1R1dGFub3RhQ29uc3RhbnRzXCJcbmltcG9ydCB7IEJhZEdhdGV3YXlFcnJvciwgTG9ja2VkRXJyb3IsIFByZWNvbmRpdGlvbkZhaWxlZEVycm9yLCBUb29NYW55UmVxdWVzdHNFcnJvciB9IGZyb20gXCIuLi9hcGkvY29tbW9uL2Vycm9yL1Jlc3RFcnJvclwiXG5pbXBvcnQgeyBEaWFsb2csIERpYWxvZ1R5cGUgfSBmcm9tIFwiLi4vZ3VpL2Jhc2UvRGlhbG9nXCJcbmltcG9ydCB7IGdldEJ5QWJicmV2aWF0aW9uIH0gZnJvbSBcIi4uL2FwaS9jb21tb24vQ291bnRyeUxpc3RcIlxuaW1wb3J0ICogYXMgUGF5bWVudERhdGFEaWFsb2cgZnJvbSBcIi4vUGF5bWVudERhdGFEaWFsb2dcIlxuaW1wb3J0IHsgc2hvd1Byb2dyZXNzRGlhbG9nIH0gZnJvbSBcIi4uL2d1aS9kaWFsb2dzL1Byb2dyZXNzRGlhbG9nXCJcbmltcG9ydCB7IGdldFByZWNvbmRpdGlvbkZhaWxlZFBheW1lbnRNc2csIGhhc1J1bm5pbmdBcHBTdG9yZVN1YnNjcmlwdGlvbiB9IGZyb20gXCIuL1N1YnNjcmlwdGlvblV0aWxzXCJcbmltcG9ydCB0eXBlIHsgRGlhbG9nSGVhZGVyQmFyQXR0cnMgfSBmcm9tIFwiLi4vZ3VpL2Jhc2UvRGlhbG9nSGVhZGVyQmFyXCJcbmltcG9ydCB7IERpYWxvZ0hlYWRlckJhciB9IGZyb20gXCIuLi9ndWkvYmFzZS9EaWFsb2dIZWFkZXJCYXJcIlxuaW1wb3J0IHsgVGV4dEZpZWxkIH0gZnJvbSBcIi4uL2d1aS9iYXNlL1RleHRGaWVsZC5qc1wiXG5pbXBvcnQgdHlwZSB7IEN1c3RvbWVyQWNjb3VudFBvc3RpbmcgfSBmcm9tIFwiLi4vYXBpL2VudGl0aWVzL2FjY291bnRpbmcvVHlwZVJlZnNcIlxuaW1wb3J0IHsgRXhwYW5kZXJCdXR0b24sIEV4cGFuZGVyUGFuZWwgfSBmcm9tIFwiLi4vZ3VpL2Jhc2UvRXhwYW5kZXJcIlxuaW1wb3J0IHsgbG9jYXRvciB9IGZyb20gXCIuLi9hcGkvbWFpbi9Db21tb25Mb2NhdG9yXCJcbmltcG9ydCB7IGNyZWF0ZU5vdEF2YWlsYWJsZUZvckZyZWVDbGlja0hhbmRsZXIgfSBmcm9tIFwiLi4vbWlzYy9TdWJzY3JpcHRpb25EaWFsb2dzXCJcbmltcG9ydCB7IFRyYW5zbGF0aW9uS2V5VHlwZSB9IGZyb20gXCIuLi9taXNjL1RyYW5zbGF0aW9uS2V5XCJcbmltcG9ydCB7IEN1c3RvbWVyQWNjb3VudFNlcnZpY2UgfSBmcm9tIFwiLi4vYXBpL2VudGl0aWVzL2FjY291bnRpbmcvU2VydmljZXNcIlxuaW1wb3J0IHsgRGViaXRTZXJ2aWNlIH0gZnJvbSBcIi4uL2FwaS9lbnRpdGllcy9zeXMvU2VydmljZXNcIlxuaW1wb3J0IHsgSWNvbkJ1dHRvbiB9IGZyb20gXCIuLi9ndWkvYmFzZS9JY29uQnV0dG9uLmpzXCJcbmltcG9ydCB7IEJ1dHRvblNpemUgfSBmcm9tIFwiLi4vZ3VpL2Jhc2UvQnV0dG9uU2l6ZS5qc1wiXG5pbXBvcnQgeyBmb3JtYXROYW1lQW5kQWRkcmVzcyB9IGZyb20gXCIuLi9hcGkvY29tbW9uL3V0aWxzL0NvbW1vbkZvcm1hdHRlci5qc1wiXG5pbXBvcnQgeyBjbGllbnQgfSBmcm9tIFwiLi4vbWlzYy9DbGllbnREZXRlY3Rvci5qc1wiXG5pbXBvcnQgeyBEZXZpY2VUeXBlIH0gZnJvbSBcIi4uL21pc2MvQ2xpZW50Q29uc3RhbnRzLmpzXCJcbmltcG9ydCB7IEVudGl0eVVwZGF0ZURhdGEsIGlzVXBkYXRlRm9yVHlwZVJlZiB9IGZyb20gXCIuLi9hcGkvY29tbW9uL3V0aWxzL0VudGl0eVVwZGF0ZVV0aWxzLmpzXCJcbmltcG9ydCB7IExvZ2luQnV0dG9uIH0gZnJvbSBcIi4uL2d1aS9iYXNlL2J1dHRvbnMvTG9naW5CdXR0b24uanNcIlxuaW1wb3J0IHR5cGUgeyBVcGRhdGFibGVTZXR0aW5nc1ZpZXdlciB9IGZyb20gXCIuLi9zZXR0aW5ncy9JbnRlcmZhY2VzLmpzXCJcbmltcG9ydCB7IFByb2dyYW1taW5nRXJyb3IgfSBmcm9tIFwiLi4vYXBpL2NvbW1vbi9lcnJvci9Qcm9ncmFtbWluZ0Vycm9yLmpzXCJcbmltcG9ydCB7IHNob3dTd2l0Y2hEaWFsb2cgfSBmcm9tIFwiLi9Td2l0Y2hTdWJzY3JpcHRpb25EaWFsb2cuanNcIlxuaW1wb3J0IHsgR0VORVJBVEVEX01BWF9JRCB9IGZyb20gXCIuLi9hcGkvY29tbW9uL3V0aWxzL0VudGl0eVV0aWxzLmpzXCJcbmltcG9ydCB7IGNyZWF0ZURyb3Bkb3duIH0gZnJvbSBcIi4uL2d1aS9iYXNlL0Ryb3Bkb3duLmpzXCJcblxuYXNzZXJ0TWFpbk9yTm9kZSgpXG5cbi8qKlxuICogRGlzcGxheXMgcGF5bWVudCBtZXRob2QvaW52b2ljZSBkYXRhIGFuZCBhbGxvd3MgY2hhbmdpbmcgdGhlbS5cbiAqL1xuZXhwb3J0IGNsYXNzIFBheW1lbnRWaWV3ZXIgaW1wbGVtZW50cyBVcGRhdGFibGVTZXR0aW5nc1ZpZXdlciB7XG5cdHByaXZhdGUgcmVhZG9ubHkgaW52b2ljZUFkZHJlc3NGaWVsZDogSHRtbEVkaXRvclxuXHRwcml2YXRlIGN1c3RvbWVyOiBDdXN0b21lciB8IG51bGwgPSBudWxsXG5cdHByaXZhdGUgYWNjb3VudGluZ0luZm86IEFjY291bnRpbmdJbmZvIHwgbnVsbCA9IG51bGxcblx0cHJpdmF0ZSBwb3N0aW5nczogcmVhZG9ubHkgQ3VzdG9tZXJBY2NvdW50UG9zdGluZ1tdID0gW11cblx0cHJpdmF0ZSBvdXRzdGFuZGluZ0Jvb2tpbmdzUHJpY2U6IG51bWJlciB8IG51bGwgPSBudWxsXG5cdHByaXZhdGUgYmFsYW5jZTogbnVtYmVyID0gMFxuXHRwcml2YXRlIGludm9pY2VJbmZvOiBJbnZvaWNlSW5mbyB8IG51bGwgPSBudWxsXG5cdHByaXZhdGUgcG9zdGluZ3NFeHBhbmRlZDogYm9vbGVhbiA9IGZhbHNlXG5cblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5pbnZvaWNlQWRkcmVzc0ZpZWxkID0gbmV3IEh0bWxFZGl0b3IoKVxuXHRcdFx0LnNldE1pbkhlaWdodCgxNDApXG5cdFx0XHQuc2hvd0JvcmRlcnMoKVxuXHRcdFx0LnNldE1vZGUoSHRtbEVkaXRvck1vZGUuSFRNTClcblx0XHRcdC5zZXRIdG1sTW9ub3NwYWNlKGZhbHNlKVxuXHRcdFx0LnNldFJlYWRPbmx5KHRydWUpXG5cdFx0XHQuc2V0UGxhY2Vob2xkZXJJZChcImludm9pY2VBZGRyZXNzX2xhYmVsXCIpXG5cdFx0dGhpcy5sb2FkRGF0YSgpXG5cdFx0dGhpcy52aWV3ID0gdGhpcy52aWV3LmJpbmQodGhpcylcblx0fVxuXG5cdHZpZXcoKTogQ2hpbGRyZW4ge1xuXHRcdHJldHVybiBtKFxuXHRcdFx0XCIjaW52b2ljaW5nLXNldHRpbmdzLmZpbGwtYWJzb2x1dGUuc2Nyb2xsLnBsci1sXCIsXG5cdFx0XHR7XG5cdFx0XHRcdHJvbGU6IFwiZ3JvdXBcIixcblx0XHRcdH0sXG5cdFx0XHRbdGhpcy5yZW5kZXJJbnZvaWNlRGF0YSgpLCB0aGlzLnJlbmRlclBheW1lbnRNZXRob2QoKSwgdGhpcy5yZW5kZXJQb3N0aW5ncygpXSxcblx0XHQpXG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIGxvYWREYXRhKCkge1xuXHRcdHRoaXMuY3VzdG9tZXIgPSBhd2FpdCBsb2NhdG9yLmxvZ2lucy5nZXRVc2VyQ29udHJvbGxlcigpLmxvYWRDdXN0b21lcigpXG5cdFx0Y29uc3QgY3VzdG9tZXJJbmZvID0gYXdhaXQgbG9jYXRvci5sb2dpbnMuZ2V0VXNlckNvbnRyb2xsZXIoKS5sb2FkQ3VzdG9tZXJJbmZvKClcblxuXHRcdGNvbnN0IGFjY291bnRpbmdJbmZvID0gYXdhaXQgbG9jYXRvci5lbnRpdHlDbGllbnQubG9hZChBY2NvdW50aW5nSW5mb1R5cGVSZWYsIGN1c3RvbWVySW5mby5hY2NvdW50aW5nSW5mbylcblx0XHR0aGlzLnVwZGF0ZUFjY291bnRpbmdJbmZvRGF0YShhY2NvdW50aW5nSW5mbylcblx0XHR0aGlzLmludm9pY2VJbmZvID0gYXdhaXQgbG9jYXRvci5lbnRpdHlDbGllbnQubG9hZChJbnZvaWNlSW5mb1R5cGVSZWYsIG5ldmVyTnVsbChhY2NvdW50aW5nSW5mby5pbnZvaWNlSW5mbykpXG5cdFx0bS5yZWRyYXcoKVxuXHRcdGF3YWl0IHRoaXMubG9hZFBvc3RpbmdzKClcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyUGF5bWVudE1ldGhvZCgpOiBDaGlsZHJlbiB7XG5cdFx0Y29uc3QgcGF5bWVudE1ldGhvZEhlbHBMYWJlbCA9ICgpID0+IHtcblx0XHRcdGlmICh0aGlzLmFjY291bnRpbmdJbmZvICYmIGdldFBheW1lbnRNZXRob2RUeXBlKHRoaXMuYWNjb3VudGluZ0luZm8pID09PSBQYXltZW50TWV0aG9kVHlwZS5JbnZvaWNlKSB7XG5cdFx0XHRcdHJldHVybiBsYW5nLmdldChcInBheW1lbnRQcm9jZXNzaW5nVGltZV9tc2dcIilcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIFwiXCJcblx0XHR9XG5cblx0XHRjb25zdCBwYXltZW50TWV0aG9kID0gdGhpcy5hY2NvdW50aW5nSW5mb1xuXHRcdFx0PyBnZXRQYXltZW50TWV0aG9kTmFtZShnZXRQYXltZW50TWV0aG9kVHlwZShuZXZlck51bGwodGhpcy5hY2NvdW50aW5nSW5mbykpKSArIFwiIFwiICsgZ2V0UGF5bWVudE1ldGhvZEluZm9UZXh0KG5ldmVyTnVsbCh0aGlzLmFjY291bnRpbmdJbmZvKSlcblx0XHRcdDogbGFuZy5nZXQoXCJsb2FkaW5nX21zZ1wiKVxuXG5cdFx0cmV0dXJuIG0oVGV4dEZpZWxkLCB7XG5cdFx0XHRsYWJlbDogXCJwYXltZW50TWV0aG9kX2xhYmVsXCIsXG5cdFx0XHR2YWx1ZTogcGF5bWVudE1ldGhvZCxcblx0XHRcdGhlbHBMYWJlbDogcGF5bWVudE1ldGhvZEhlbHBMYWJlbCxcblx0XHRcdGlzUmVhZE9ubHk6IHRydWUsXG5cdFx0XHRpbmplY3Rpb25zUmlnaHQ6ICgpID0+XG5cdFx0XHRcdG0oSWNvbkJ1dHRvbiwge1xuXHRcdFx0XHRcdHRpdGxlOiBcInBheW1lbnRNZXRob2RfbGFiZWxcIixcblx0XHRcdFx0XHRjbGljazogKGUsIGRvbSkgPT4gdGhpcy5oYW5kbGVQYXltZW50TWV0aG9kQ2xpY2soZSwgZG9tKSxcblx0XHRcdFx0XHRpY29uOiBJY29ucy5FZGl0LFxuXHRcdFx0XHRcdHNpemU6IEJ1dHRvblNpemUuQ29tcGFjdCxcblx0XHRcdFx0fSksXG5cdFx0fSlcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgaGFuZGxlUGF5bWVudE1ldGhvZENsaWNrKGU6IE1vdXNlRXZlbnQsIGRvbTogSFRNTEVsZW1lbnQpIHtcblx0XHRpZiAodGhpcy5hY2NvdW50aW5nSW5mbyA9PSBudWxsKSB7XG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cdFx0Y29uc3QgY3VycmVudFBheW1lbnRNZXRob2Q6IFBheW1lbnRNZXRob2RUeXBlIHwgbnVsbCA9IGdldFBheW1lbnRNZXRob2RUeXBlKHRoaXMuYWNjb3VudGluZ0luZm8pXG5cdFx0aWYgKGlzSU9TQXBwKCkpIHtcblx0XHRcdC8vIFBhaWQgdXNlcnMgdHJ5aW5nIHRvIGNoYW5nZSBwYXltZW50IG1ldGhvZCBvbiBpT1Mgd2l0aCBhbiBhY3RpdmUgc3Vic2NyaXB0aW9uXG5cdFx0XHRpZiAoY3VycmVudFBheW1lbnRNZXRob2QgIT09IFBheW1lbnRNZXRob2RUeXBlLkFwcFN0b3JlICYmIHRoaXMuY3VzdG9tZXI/LnR5cGUgPT09IEFjY291bnRUeXBlLlBBSUQpIHtcblx0XHRcdFx0cmV0dXJuIERpYWxvZy5tZXNzYWdlKGxhbmcuZ2V0VHJhbnNsYXRpb24oXCJzdG9yZVBheW1lbnRNZXRob2RDaGFuZ2VfbXNnXCIsIHsgXCJ7QXBwU3RvcmVQYXltZW50Q2hhbmdlfVwiOiBJbmZvTGluay5BcHBTdG9yZVBheW1lbnRDaGFuZ2UgfSkpXG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBsb2NhdG9yLm1vYmlsZVBheW1lbnRzRmFjYWRlLnNob3dTdWJzY3JpcHRpb25Db25maWdWaWV3KClcblx0XHR9IGVsc2UgaWYgKGhhc1J1bm5pbmdBcHBTdG9yZVN1YnNjcmlwdGlvbih0aGlzLmFjY291bnRpbmdJbmZvKSkge1xuXHRcdFx0cmV0dXJuIHNob3dNYW5hZ2VUaHJvdWdoQXBwU3RvcmVEaWFsb2coKVxuXHRcdH0gZWxzZSBpZiAoY3VycmVudFBheW1lbnRNZXRob2QgPT0gUGF5bWVudE1ldGhvZFR5cGUuQXBwU3RvcmUgJiYgdGhpcy5jdXN0b21lcj8udHlwZSA9PT0gQWNjb3VudFR5cGUuUEFJRCkge1xuXHRcdFx0Ly8gRm9yIG5vdyB3ZSBkbyBub3QgYWxsb3cgY2hhbmdpbmcgcGF5bWVudCBtZXRob2QgZm9yIFBhaWQgYWNjb3VudHMgdGhhdCB1c2UgQXBwU3RvcmUsXG5cdFx0XHQvLyB0aGV5IG11c3QgZG93bmdyYWRlIHRvIEZyZWUgZmlyc3QuXG5cblx0XHRcdGNvbnN0IGlzUmVzdWJzY3JpYmUgPSBhd2FpdCBEaWFsb2cuY2hvaWNlKFxuXHRcdFx0XHRsYW5nLmdldFRyYW5zbGF0aW9uKFwic3RvcmVEb3duZ3JhZGVPclJlc3Vic2NyaWJlX21zZ1wiLCB7IFwie0FwcFN0b3JlRG93bmdyYWRlfVwiOiBJbmZvTGluay5BcHBTdG9yZURvd25ncmFkZSB9KSxcblx0XHRcdFx0W1xuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHRleHQ6IFwiY2hhbmdlUGxhbl9hY3Rpb25cIixcblx0XHRcdFx0XHRcdHZhbHVlOiBmYWxzZSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHRleHQ6IFwicmVzdWJzY3JpYmVfYWN0aW9uXCIsXG5cdFx0XHRcdFx0XHR2YWx1ZTogdHJ1ZSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRdLFxuXHRcdFx0KVxuXHRcdFx0aWYgKGlzUmVzdWJzY3JpYmUpIHtcblx0XHRcdFx0cmV0dXJuIHNob3dNYW5hZ2VUaHJvdWdoQXBwU3RvcmVEaWFsb2coKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3QgY3VzdG9tZXJJbmZvID0gYXdhaXQgbG9jYXRvci5sb2dpbnMuZ2V0VXNlckNvbnRyb2xsZXIoKS5sb2FkQ3VzdG9tZXJJbmZvKClcblx0XHRcdFx0Y29uc3QgYm9va2luZ3MgPSBhd2FpdCBsb2NhdG9yLmVudGl0eUNsaWVudC5sb2FkUmFuZ2UoQm9va2luZ1R5cGVSZWYsIGFzc2VydE5vdE51bGwoY3VzdG9tZXJJbmZvLmJvb2tpbmdzKS5pdGVtcywgR0VORVJBVEVEX01BWF9JRCwgMSwgdHJ1ZSlcblx0XHRcdFx0Y29uc3QgbGFzdEJvb2tpbmcgPSBsYXN0KGJvb2tpbmdzKVxuXHRcdFx0XHRpZiAobGFzdEJvb2tpbmcgPT0gbnVsbCkge1xuXHRcdFx0XHRcdGNvbnNvbGUud2FybihcIk5vIGJvb2tpbmcgYnV0IHBheW1lbnQgbWV0aG9kIGlzIEFwcFN0b3JlP1wiKVxuXHRcdFx0XHRcdHJldHVyblxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBzaG93U3dpdGNoRGlhbG9nKHRoaXMuY3VzdG9tZXIsIGN1c3RvbWVySW5mbywgdGhpcy5hY2NvdW50aW5nSW5mbywgbGFzdEJvb2tpbmcsIEF2YWlsYWJsZVBsYW5zLCBudWxsKVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBzaG93UGF5bWVudE1ldGhvZERpYWxvZyA9IGNyZWF0ZU5vdEF2YWlsYWJsZUZvckZyZWVDbGlja0hhbmRsZXIoXG5cdFx0XHRcdE5ld1BhaWRQbGFucyxcblx0XHRcdFx0KCkgPT4gdGhpcy5hY2NvdW50aW5nSW5mbyAmJiB0aGlzLmNoYW5nZVBheW1lbnRNZXRob2QoKSxcblx0XHRcdFx0Ly8gaU9TIGFwcCBpcyBjaGVja2VkIGFib3ZlXG5cdFx0XHRcdCgpID0+IGxvY2F0b3IubG9naW5zLmdldFVzZXJDb250cm9sbGVyKCkuaXNQYWlkQWNjb3VudCgpLFxuXHRcdFx0KVxuXG5cdFx0XHRzaG93UGF5bWVudE1ldGhvZERpYWxvZyhlLCBkb20pXG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBjaGFuZ2VJbnZvaWNlRGF0YSgpIHtcblx0XHRpZiAodGhpcy5hY2NvdW50aW5nSW5mbykge1xuXHRcdFx0Y29uc3QgYWNjb3VudGluZ0luZm8gPSBuZXZlck51bGwodGhpcy5hY2NvdW50aW5nSW5mbylcblx0XHRcdGNvbnN0IGludm9pY2VDb3VudHJ5ID0gYWNjb3VudGluZ0luZm8uaW52b2ljZUNvdW50cnkgPyBnZXRCeUFiYnJldmlhdGlvbihhY2NvdW50aW5nSW5mby5pbnZvaWNlQ291bnRyeSkgOiBudWxsXG5cdFx0XHRJbnZvaWNlRGF0YURpYWxvZy5zaG93KFxuXHRcdFx0XHRuZXZlck51bGwobmV2ZXJOdWxsKHRoaXMuY3VzdG9tZXIpLmJ1c2luZXNzVXNlKSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGludm9pY2VBZGRyZXNzOiBmb3JtYXROYW1lQW5kQWRkcmVzcyhhY2NvdW50aW5nSW5mby5pbnZvaWNlTmFtZSwgYWNjb3VudGluZ0luZm8uaW52b2ljZUFkZHJlc3MpLFxuXHRcdFx0XHRcdGNvdW50cnk6IGludm9pY2VDb3VudHJ5LFxuXHRcdFx0XHRcdHZhdE51bWJlcjogYWNjb3VudGluZ0luZm8uaW52b2ljZVZhdElkTm8sXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGFjY291bnRpbmdJbmZvLFxuXHRcdFx0KVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgY2hhbmdlUGF5bWVudE1ldGhvZCgpIHtcblx0XHRpZiAodGhpcy5hY2NvdW50aW5nSW5mbyAmJiBoYXNSdW5uaW5nQXBwU3RvcmVTdWJzY3JpcHRpb24odGhpcy5hY2NvdW50aW5nSW5mbykpIHtcblx0XHRcdHRocm93IG5ldyBQcm9ncmFtbWluZ0Vycm9yKFwiQWN0aXZlIEFwcFN0b3JlIHN1YnNjcmlwdGlvblwiKVxuXHRcdH1cblxuXHRcdGxldCBuZXh0UGF5bWVudCA9IHRoaXMuYW1vdW50T3dlZCgpICogLTFcblx0XHRzaG93UHJvZ3Jlc3NEaWFsb2coXG5cdFx0XHRcInBsZWFzZVdhaXRfbXNnXCIsXG5cdFx0XHRsb2NhdG9yLmJvb2tpbmdGYWNhZGUuZ2V0Q3VycmVudFByaWNlKCkudGhlbigocHJpY2VTZXJ2aWNlUmV0dXJuKSA9PiB7XG5cdFx0XHRcdHJldHVybiBNYXRoLm1heChcblx0XHRcdFx0XHRuZXh0UGF5bWVudCxcblx0XHRcdFx0XHROdW1iZXIobmV2ZXJOdWxsKHByaWNlU2VydmljZVJldHVybi5jdXJyZW50UHJpY2VUaGlzUGVyaW9kKS5wcmljZSksXG5cdFx0XHRcdFx0TnVtYmVyKG5ldmVyTnVsbChwcmljZVNlcnZpY2VSZXR1cm4uY3VycmVudFByaWNlTmV4dFBlcmlvZCkucHJpY2UpLFxuXHRcdFx0XHQpXG5cdFx0XHR9KSxcblx0XHQpXG5cdFx0XHQudGhlbigocHJpY2UpID0+XG5cdFx0XHRcdGdldERlZmF1bHRQYXltZW50TWV0aG9kKCkudGhlbigocGF5bWVudE1ldGhvZCkgPT4ge1xuXHRcdFx0XHRcdHJldHVybiB7IHByaWNlLCBwYXltZW50TWV0aG9kIH1cblx0XHRcdFx0fSksXG5cdFx0XHQpXG5cdFx0XHQudGhlbigoeyBwcmljZSwgcGF5bWVudE1ldGhvZCB9KSA9PiB7XG5cdFx0XHRcdHJldHVybiBQYXltZW50RGF0YURpYWxvZy5zaG93KG5ldmVyTnVsbCh0aGlzLmN1c3RvbWVyKSwgbmV2ZXJOdWxsKHRoaXMuYWNjb3VudGluZ0luZm8pLCBwcmljZSwgcGF5bWVudE1ldGhvZCkudGhlbigoc3VjY2VzcykgPT4ge1xuXHRcdFx0XHRcdGlmIChzdWNjZXNzKSB7XG5cdFx0XHRcdFx0XHRpZiAodGhpcy5pc1BheUJ1dHRvblZpc2libGUoKSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gdGhpcy5zaG93UGF5RGlhbG9nKHRoaXMuYW1vdW50T3dlZCgpKVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSlcblx0XHRcdH0pXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlclBvc3RpbmdzKCk6IENoaWxkcmVuIHtcblx0XHRpZiAoIXRoaXMucG9zdGluZ3MgfHwgdGhpcy5wb3N0aW5ncy5sZW5ndGggPT09IDApIHtcblx0XHRcdHJldHVybiBudWxsXG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IGJhbGFuY2UgPSB0aGlzLmJhbGFuY2Vcblx0XHRcdHJldHVybiBbXG5cdFx0XHRcdG0oXCIuaDQubXQtbFwiLCBsYW5nLmdldChcImN1cnJlbnRCYWxhbmNlX2xhYmVsXCIpKSxcblx0XHRcdFx0bShcIi5mbGV4LmNlbnRlci1ob3Jpem9udGFsbHkuY2VudGVyLXZlcnRpY2FsbHkuY29sXCIsIFtcblx0XHRcdFx0XHRtKFxuXHRcdFx0XHRcdFx0XCJkaXYuaDQucHQucGJcIiArICh0aGlzLmlzQW1vdW50T3dlZCgpID8gXCIuY29udGVudC1hY2NlbnQtZmdcIiA6IFwiXCIpLFxuXHRcdFx0XHRcdFx0Zm9ybWF0UHJpY2UoYmFsYW5jZSwgdHJ1ZSkgKyAodGhpcy5hY2NvdW50QmFsYW5jZSgpICE9PSBiYWxhbmNlID8gYCAoJHtmb3JtYXRQcmljZSh0aGlzLmFjY291bnRCYWxhbmNlKCksIHRydWUpfSlgIDogXCJcIiksXG5cdFx0XHRcdFx0KSxcblx0XHRcdFx0XHR0aGlzLmFjY291bnRCYWxhbmNlKCkgIT09IGJhbGFuY2Vcblx0XHRcdFx0XHRcdD8gbShcblx0XHRcdFx0XHRcdFx0XHRcIi5zbWFsbFwiICsgKHRoaXMuYWNjb3VudEJhbGFuY2UoKSA8IDAgPyBcIi5jb250ZW50LWFjY2VudC1mZ1wiIDogXCJcIiksXG5cdFx0XHRcdFx0XHRcdFx0bGFuZy5nZXQoXCJ1bnByb2Nlc3NlZEJvb2tpbmdzX21zZ1wiLCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcInthbW91bnR9XCI6IGZvcm1hdFByaWNlKGFzc2VydE5vdE51bGwodGhpcy5vdXRzdGFuZGluZ0Jvb2tpbmdzUHJpY2UpLCB0cnVlKSxcblx0XHRcdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRcdCAgKVxuXHRcdFx0XHRcdFx0OiBudWxsLFxuXHRcdFx0XHRcdHRoaXMuaXNQYXlCdXR0b25WaXNpYmxlKClcblx0XHRcdFx0XHRcdD8gbShcblx0XHRcdFx0XHRcdFx0XHRcIi5wYlwiLFxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdHN0eWxlOiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHdpZHRoOiBcIjIwMHB4XCIsXG5cdFx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0bShMb2dpbkJ1dHRvbiwge1xuXHRcdFx0XHRcdFx0XHRcdFx0bGFiZWw6IFwiaW52b2ljZVBheV9hY3Rpb25cIixcblx0XHRcdFx0XHRcdFx0XHRcdG9uY2xpY2s6ICgpID0+IHRoaXMuc2hvd1BheURpYWxvZyh0aGlzLmFtb3VudE93ZWQoKSksXG5cdFx0XHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0XHQgIClcblx0XHRcdFx0XHRcdDogbnVsbCxcblx0XHRcdFx0XSksXG5cdFx0XHRcdHRoaXMuYWNjb3VudGluZ0luZm8gJiZcblx0XHRcdFx0dGhpcy5hY2NvdW50aW5nSW5mby5wYXltZW50TWV0aG9kICE9PSBQYXltZW50TWV0aG9kVHlwZS5JbnZvaWNlICYmXG5cdFx0XHRcdCh0aGlzLmlzQW1vdW50T3dlZCgpIHx8ICh0aGlzLmludm9pY2VJbmZvICYmIHRoaXMuaW52b2ljZUluZm8ucGF5bWVudEVycm9ySW5mbykpXG5cdFx0XHRcdFx0PyB0aGlzLmludm9pY2VJbmZvICYmIHRoaXMuaW52b2ljZUluZm8ucGF5bWVudEVycm9ySW5mb1xuXHRcdFx0XHRcdFx0PyBtKFwiLnNtYWxsLnVuZGVybGluZS5iXCIsIGxhbmcuZ2V0KGdldFByZWNvbmRpdGlvbkZhaWxlZFBheW1lbnRNc2codGhpcy5pbnZvaWNlSW5mby5wYXltZW50RXJyb3JJbmZvLmVycm9yQ29kZSkpKVxuXHRcdFx0XHRcdFx0OiBtKFwiLnNtYWxsLnVuZGVybGluZS5iXCIsIGxhbmcuZ2V0KFwiZmFpbGVkRGViaXRBdHRlbXB0X21zZ1wiKSlcblx0XHRcdFx0XHQ6IG51bGwsXG5cdFx0XHRcdG0oXCIuZmxleC1zcGFjZS1iZXR3ZWVuLml0ZW1zLWNlbnRlci5tdC1sLm1iLXNcIiwgW1xuXHRcdFx0XHRcdG0oXCIuaDRcIiwgbGFuZy5nZXQoXCJwb3N0aW5nc19sYWJlbFwiKSksXG5cdFx0XHRcdFx0bShFeHBhbmRlckJ1dHRvbiwge1xuXHRcdFx0XHRcdFx0bGFiZWw6IFwic2hvd19hY3Rpb25cIixcblx0XHRcdFx0XHRcdGV4cGFuZGVkOiB0aGlzLnBvc3RpbmdzRXhwYW5kZWQsXG5cdFx0XHRcdFx0XHRvbkV4cGFuZGVkQ2hhbmdlOiAoZXhwYW5kZWQpID0+ICh0aGlzLnBvc3RpbmdzRXhwYW5kZWQgPSBleHBhbmRlZCksXG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdF0pLFxuXHRcdFx0XHRtKFxuXHRcdFx0XHRcdEV4cGFuZGVyUGFuZWwsXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0ZXhwYW5kZWQ6IHRoaXMucG9zdGluZ3NFeHBhbmRlZCxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdG0oVGFibGUsIHtcblx0XHRcdFx0XHRcdGNvbHVtbkhlYWRpbmc6IFtcInR5cGVfbGFiZWxcIiwgXCJhbW91bnRfbGFiZWxcIl0sXG5cdFx0XHRcdFx0XHRjb2x1bW5XaWR0aHM6IFtDb2x1bW5XaWR0aC5MYXJnZXN0LCBDb2x1bW5XaWR0aC5TbWFsbCwgQ29sdW1uV2lkdGguU21hbGxdLFxuXHRcdFx0XHRcdFx0Y29sdW1uQWxpZ25tZW50czogW2ZhbHNlLCB0cnVlLCBmYWxzZV0sXG5cdFx0XHRcdFx0XHRzaG93QWN0aW9uQnV0dG9uQ29sdW1uOiB0cnVlLFxuXHRcdFx0XHRcdFx0bGluZXM6IHRoaXMucG9zdGluZ3MubWFwKChwb3N0aW5nOiBDdXN0b21lckFjY291bnRQb3N0aW5nKSA9PiB0aGlzLnBvc3RpbmdMaW5lQXR0cnMocG9zdGluZykpLFxuXHRcdFx0XHRcdH0pLFxuXHRcdFx0XHQpLFxuXHRcdFx0XHRtKFwiLnNtYWxsXCIsIGxhbmcuZ2V0KFwiaW52b2ljZVNldHRpbmdEZXNjcmlwdGlvbl9tc2dcIikgKyBcIiBcIiArIGxhbmcuZ2V0KFwibGF0ZXJJbnZvaWNpbmdJbmZvX21zZ1wiKSksXG5cdFx0XHRdXG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBwb3N0aW5nTGluZUF0dHJzKHBvc3Rpbmc6IEN1c3RvbWVyQWNjb3VudFBvc3RpbmcpOiBUYWJsZUxpbmVBdHRycyB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGNlbGxzOiAoKSA9PiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRtYWluOiBnZXRQb3N0aW5nVHlwZVRleHQocG9zdGluZyksXG5cdFx0XHRcdFx0aW5mbzogW2Zvcm1hdERhdGUocG9zdGluZy52YWx1ZURhdGUpXSxcblx0XHRcdFx0fSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG1haW46IGZvcm1hdFByaWNlKE51bWJlcihwb3N0aW5nLmFtb3VudCksIHRydWUpLFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHRcdGFjdGlvbkJ1dHRvbkF0dHJzOlxuXHRcdFx0XHRwb3N0aW5nLnR5cGUgPT09IFBvc3RpbmdUeXBlLlVzYWdlRmVlIHx8IHBvc3RpbmcudHlwZSA9PT0gUG9zdGluZ1R5cGUuQ3JlZGl0IHx8IHBvc3RpbmcudHlwZSA9PT0gUG9zdGluZ1R5cGUuU2FsZXNDb21taXNzaW9uXG5cdFx0XHRcdFx0PyB7XG5cdFx0XHRcdFx0XHRcdHRpdGxlOiBcImRvd25sb2FkX2FjdGlvblwiLFxuXHRcdFx0XHRcdFx0XHRpY29uOiBJY29ucy5Eb3dubG9hZCxcblx0XHRcdFx0XHRcdFx0c2l6ZTogQnV0dG9uU2l6ZS5Db21wYWN0LFxuXHRcdFx0XHRcdFx0XHRjbGljazogKGUsIGRvbSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdGlmICh0aGlzLmN1c3RvbWVyPy5idXNpbmVzc1VzZSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Y3JlYXRlRHJvcGRvd24oe1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR3aWR0aDogMzAwLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRsYXp5QnV0dG9uczogKCkgPT4gW1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGxhYmVsOiBcImRvd25sb2FkSW52b2ljZVBkZl9hY3Rpb25cIixcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNsaWNrOiAoKSA9PiB0aGlzLmRvUGRmSW52b2ljZURvd25sb2FkKHBvc3RpbmcpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0bGFiZWw6IFwiZG93bmxvYWRJbnZvaWNlWG1sX2FjdGlvblwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2xpY2s6ICgpID0+IHRoaXMuZG9YcmVjaG51bmdJbnZvaWNlRG93bmxvYWQocG9zdGluZyksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XSxcblx0XHRcdFx0XHRcdFx0XHRcdH0pKGUsIGRvbSlcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0dGhpcy5kb1BkZkludm9pY2VEb3dubG9hZChwb3N0aW5nKVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHQgIH1cblx0XHRcdFx0XHQ6IG51bGwsXG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBkb1BkZkludm9pY2VEb3dubG9hZChwb3N0aW5nOiBDdXN0b21lckFjY291bnRQb3N0aW5nKTogUHJvbWlzZTx1bmtub3duPiB7XG5cdFx0aWYgKGNsaWVudC5jb21wcmVzc2lvblN0cmVhbVN1cHBvcnRlZCgpKSB7XG5cdFx0XHRyZXR1cm4gc2hvd1Byb2dyZXNzRGlhbG9nKFwicGxlYXNlV2FpdF9tc2dcIiwgbG9jYXRvci5jdXN0b21lckZhY2FkZS5nZW5lcmF0ZVBkZkludm9pY2UobmV2ZXJOdWxsKHBvc3RpbmcuaW52b2ljZU51bWJlcikpKS50aGVuKChwZGZJbnZvaWNlKSA9PlxuXHRcdFx0XHRsb2NhdG9yLmZpbGVDb250cm9sbGVyLnNhdmVEYXRhRmlsZShwZGZJbnZvaWNlKSxcblx0XHRcdClcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKGNsaWVudC5kZXZpY2UgPT0gRGV2aWNlVHlwZS5BTkRST0lEKSB7XG5cdFx0XHRcdHJldHVybiBEaWFsb2cubWVzc2FnZShcImludm9pY2VGYWlsZWRXZWJ2aWV3X21zZ1wiLCAoKSA9PiBtKFwiZGl2XCIsIG0oXCJhXCIsIHsgaHJlZjogSW5mb0xpbmsuV2VidmlldywgdGFyZ2V0OiBcIl9ibGFua1wiIH0sIEluZm9MaW5rLldlYnZpZXcpKSlcblx0XHRcdH0gZWxzZSBpZiAoY2xpZW50LmlzSW9zKCkpIHtcblx0XHRcdFx0cmV0dXJuIERpYWxvZy5tZXNzYWdlKFwiaW52b2ljZUZhaWxlZElPU19tc2dcIilcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBEaWFsb2cubWVzc2FnZShcImludm9pY2VGYWlsZWRCcm93c2VyX21zZ1wiKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgZG9YcmVjaG51bmdJbnZvaWNlRG93bmxvYWQocG9zdGluZzogQ3VzdG9tZXJBY2NvdW50UG9zdGluZykge1xuXHRcdHJldHVybiBzaG93UHJvZ3Jlc3NEaWFsb2coXG5cdFx0XHRcInBsZWFzZVdhaXRfbXNnXCIsXG5cdFx0XHRsb2NhdG9yLmN1c3RvbWVyRmFjYWRlLmdlbmVyYXRlWFJlY2hudW5nSW52b2ljZShuZXZlck51bGwocG9zdGluZy5pbnZvaWNlTnVtYmVyKSkudGhlbigoeEludm9pY2UpID0+IGxvY2F0b3IuZmlsZUNvbnRyb2xsZXIuc2F2ZURhdGFGaWxlKHhJbnZvaWNlKSksXG5cdFx0KVxuXHR9XG5cblx0cHJpdmF0ZSB1cGRhdGVBY2NvdW50aW5nSW5mb0RhdGEoYWNjb3VudGluZ0luZm86IEFjY291bnRpbmdJbmZvKSB7XG5cdFx0dGhpcy5hY2NvdW50aW5nSW5mbyA9IGFjY291bnRpbmdJbmZvXG5cblx0XHR0aGlzLmludm9pY2VBZGRyZXNzRmllbGQuc2V0VmFsdWUoXG5cdFx0XHRmb3JtYXROYW1lQW5kQWRkcmVzcyhhY2NvdW50aW5nSW5mby5pbnZvaWNlTmFtZSwgYWNjb3VudGluZ0luZm8uaW52b2ljZUFkZHJlc3MsIGFjY291bnRpbmdJbmZvLmludm9pY2VDb3VudHJ5ID8/IHVuZGVmaW5lZCksXG5cdFx0KVxuXG5cdFx0bS5yZWRyYXcoKVxuXHR9XG5cblx0cHJpdmF0ZSBhY2NvdW50QmFsYW5jZSgpOiBudW1iZXIge1xuXHRcdHJldHVybiB0aGlzLmJhbGFuY2UgLSBhc3NlcnROb3ROdWxsKHRoaXMub3V0c3RhbmRpbmdCb29raW5nc1ByaWNlKVxuXHR9XG5cblx0cHJpdmF0ZSBhbW91bnRPd2VkKCk6IG51bWJlciB7XG5cdFx0aWYgKHRoaXMuYmFsYW5jZSAhPSBudWxsKSB7XG5cdFx0XHRsZXQgYmFsYW5jZSA9IHRoaXMuYmFsYW5jZVxuXG5cdFx0XHRpZiAoYmFsYW5jZSA8IDApIHtcblx0XHRcdFx0cmV0dXJuIGJhbGFuY2Vcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gMFxuXHR9XG5cblx0cHJpdmF0ZSBpc0Ftb3VudE93ZWQoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRoaXMuYW1vdW50T3dlZCgpIDwgMFxuXHR9XG5cblx0cHJpdmF0ZSBsb2FkUG9zdGluZ3MoKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0cmV0dXJuIGxvY2F0b3Iuc2VydmljZUV4ZWN1dG9yLmdldChDdXN0b21lckFjY291bnRTZXJ2aWNlLCBudWxsKS50aGVuKChyZXN1bHQpID0+IHtcblx0XHRcdHRoaXMucG9zdGluZ3MgPSByZXN1bHQucG9zdGluZ3Ncblx0XHRcdHRoaXMub3V0c3RhbmRpbmdCb29raW5nc1ByaWNlID0gTnVtYmVyKHJlc3VsdC5vdXRzdGFuZGluZ0Jvb2tpbmdzUHJpY2UpXG5cdFx0XHR0aGlzLmJhbGFuY2UgPSBOdW1iZXIocmVzdWx0LmJhbGFuY2UpXG5cdFx0XHRtLnJlZHJhdygpXG5cdFx0fSlcblx0fVxuXG5cdGFzeW5jIGVudGl0eUV2ZW50c1JlY2VpdmVkKHVwZGF0ZXM6IFJlYWRvbmx5QXJyYXk8RW50aXR5VXBkYXRlRGF0YT4pOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRmb3IgKGNvbnN0IHVwZGF0ZSBvZiB1cGRhdGVzKSB7XG5cdFx0XHRhd2FpdCB0aGlzLnByb2Nlc3NFbnRpdHlVcGRhdGUodXBkYXRlKVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgcHJvY2Vzc0VudGl0eVVwZGF0ZSh1cGRhdGU6IEVudGl0eVVwZGF0ZURhdGEpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCB7IGluc3RhbmNlSWQgfSA9IHVwZGF0ZVxuXG5cdFx0aWYgKGlzVXBkYXRlRm9yVHlwZVJlZihBY2NvdW50aW5nSW5mb1R5cGVSZWYsIHVwZGF0ZSkpIHtcblx0XHRcdGNvbnN0IGFjY291bnRpbmdJbmZvID0gYXdhaXQgbG9jYXRvci5lbnRpdHlDbGllbnQubG9hZChBY2NvdW50aW5nSW5mb1R5cGVSZWYsIGluc3RhbmNlSWQpXG5cdFx0XHR0aGlzLnVwZGF0ZUFjY291bnRpbmdJbmZvRGF0YShhY2NvdW50aW5nSW5mbylcblx0XHR9IGVsc2UgaWYgKGlzVXBkYXRlRm9yVHlwZVJlZihDdXN0b21lclR5cGVSZWYsIHVwZGF0ZSkpIHtcblx0XHRcdHRoaXMuY3VzdG9tZXIgPSBhd2FpdCBsb2NhdG9yLmxvZ2lucy5nZXRVc2VyQ29udHJvbGxlcigpLmxvYWRDdXN0b21lcigpXG5cdFx0XHRtLnJlZHJhdygpXG5cdFx0fSBlbHNlIGlmIChpc1VwZGF0ZUZvclR5cGVSZWYoSW52b2ljZUluZm9UeXBlUmVmLCB1cGRhdGUpKSB7XG5cdFx0XHR0aGlzLmludm9pY2VJbmZvID0gYXdhaXQgbG9jYXRvci5lbnRpdHlDbGllbnQubG9hZChJbnZvaWNlSW5mb1R5cGVSZWYsIGluc3RhbmNlSWQpXG5cdFx0XHRtLnJlZHJhdygpXG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBpc1BheUJ1dHRvblZpc2libGUoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIChcblx0XHRcdHRoaXMuYWNjb3VudGluZ0luZm8gIT0gbnVsbCAmJlxuXHRcdFx0KHRoaXMuYWNjb3VudGluZ0luZm8ucGF5bWVudE1ldGhvZCA9PT0gUGF5bWVudE1ldGhvZFR5cGUuQ3JlZGl0Q2FyZCB8fCB0aGlzLmFjY291bnRpbmdJbmZvLnBheW1lbnRNZXRob2QgPT09IFBheW1lbnRNZXRob2RUeXBlLlBheXBhbCkgJiZcblx0XHRcdHRoaXMuaXNBbW91bnRPd2VkKClcblx0XHQpXG5cdH1cblxuXHRwcml2YXRlIHNob3dQYXlEaWFsb2cob3BlbkJhbGFuY2U6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuXHRcdHJldHVybiBzaG93UGF5Q29uZmlybURpYWxvZyhvcGVuQmFsYW5jZSlcblx0XHRcdC50aGVuKChjb25maXJtZWQpID0+IHtcblx0XHRcdFx0aWYgKGNvbmZpcm1lZCkge1xuXHRcdFx0XHRcdHJldHVybiBzaG93UHJvZ3Jlc3NEaWFsb2coXG5cdFx0XHRcdFx0XHRcInBsZWFzZVdhaXRfbXNnXCIsXG5cdFx0XHRcdFx0XHRsb2NhdG9yLnNlcnZpY2VFeGVjdXRvclxuXHRcdFx0XHRcdFx0XHQucHV0KERlYml0U2VydmljZSwgY3JlYXRlRGViaXRTZXJ2aWNlUHV0RGF0YSh7IGludm9pY2U6IG51bGwgfSkpXG5cdFx0XHRcdFx0XHRcdC5jYXRjaChvZkNsYXNzKExvY2tlZEVycm9yLCAoKSA9PiBcIm9wZXJhdGlvblN0aWxsQWN0aXZlX21zZ1wiIGFzIFRyYW5zbGF0aW9uS2V5KSlcblx0XHRcdFx0XHRcdFx0LmNhdGNoKG9mQ2xhc3MoUHJlY29uZGl0aW9uRmFpbGVkRXJyb3IsIChlcnJvcikgPT4gZ2V0UHJlY29uZGl0aW9uRmFpbGVkUGF5bWVudE1zZyhlcnJvci5kYXRhKSkpXG5cdFx0XHRcdFx0XHRcdC5jYXRjaChvZkNsYXNzKEJhZEdhdGV3YXlFcnJvciwgKCkgPT4gXCJwYXltZW50UHJvdmlkZXJOb3RBdmFpbGFibGVFcnJvcl9tc2dcIiBhcyBUcmFuc2xhdGlvbktleSkpXG5cdFx0XHRcdFx0XHRcdC5jYXRjaChvZkNsYXNzKFRvb01hbnlSZXF1ZXN0c0Vycm9yLCAoKSA9PiBcInRvb01hbnlBdHRlbXB0c19tc2dcIiBhcyBUcmFuc2xhdGlvbktleSkpLFxuXHRcdFx0XHRcdClcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHRcdC50aGVuKChlcnJvcklkOiBUcmFuc2xhdGlvbktleVR5cGUgfCB2b2lkKSA9PiB7XG5cdFx0XHRcdGlmIChlcnJvcklkKSB7XG5cdFx0XHRcdFx0cmV0dXJuIERpYWxvZy5tZXNzYWdlKGVycm9ySWQpXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMubG9hZFBvc3RpbmdzKClcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVySW52b2ljZURhdGEoKTogQ2hpbGRyZW4ge1xuXHRcdHJldHVybiBbXG5cdFx0XHRtKFwiLmZsZXgtc3BhY2UtYmV0d2Vlbi5pdGVtcy1jZW50ZXIubXQtbC5tYi1zXCIsIFtcblx0XHRcdFx0bShcIi5oNFwiLCBsYW5nLmdldChcImludm9pY2VEYXRhX21zZ1wiKSksXG5cdFx0XHRcdG0oSWNvbkJ1dHRvbiwge1xuXHRcdFx0XHRcdHRpdGxlOiBcImludm9pY2VEYXRhX21zZ1wiLFxuXHRcdFx0XHRcdGNsaWNrOiBjcmVhdGVOb3RBdmFpbGFibGVGb3JGcmVlQ2xpY2tIYW5kbGVyKFxuXHRcdFx0XHRcdFx0TmV3UGFpZFBsYW5zLFxuXHRcdFx0XHRcdFx0KCkgPT4gdGhpcy5jaGFuZ2VJbnZvaWNlRGF0YSgpLFxuXHRcdFx0XHRcdFx0KCkgPT4gbG9jYXRvci5sb2dpbnMuZ2V0VXNlckNvbnRyb2xsZXIoKS5pc1BhaWRBY2NvdW50KCksXG5cdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRpY29uOiBJY29ucy5FZGl0LFxuXHRcdFx0XHRcdHNpemU6IEJ1dHRvblNpemUuQ29tcGFjdCxcblx0XHRcdFx0fSksXG5cdFx0XHRdKSxcblx0XHRcdG0odGhpcy5pbnZvaWNlQWRkcmVzc0ZpZWxkKSxcblx0XHRcdHRoaXMuYWNjb3VudGluZ0luZm8gJiYgdGhpcy5hY2NvdW50aW5nSW5mby5pbnZvaWNlVmF0SWROby50cmltKCkubGVuZ3RoID4gMFxuXHRcdFx0XHQ/IG0oVGV4dEZpZWxkLCB7XG5cdFx0XHRcdFx0XHRsYWJlbDogXCJpbnZvaWNlVmF0SWROb19sYWJlbFwiLFxuXHRcdFx0XHRcdFx0dmFsdWU6IHRoaXMuYWNjb3VudGluZ0luZm8gPyB0aGlzLmFjY291bnRpbmdJbmZvLmludm9pY2VWYXRJZE5vIDogbGFuZy5nZXQoXCJsb2FkaW5nX21zZ1wiKSxcblx0XHRcdFx0XHRcdGlzUmVhZE9ubHk6IHRydWUsXG5cdFx0XHRcdCAgfSlcblx0XHRcdFx0OiBudWxsLFxuXHRcdF1cblx0fVxufVxuXG5mdW5jdGlvbiBzaG93UGF5Q29uZmlybURpYWxvZyhwcmljZTogbnVtYmVyKTogUHJvbWlzZTxib29sZWFuPiB7XG5cdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuXHRcdGxldCBkaWFsb2c6IERpYWxvZ1xuXG5cdFx0Y29uc3QgZG9BY3Rpb24gPSAocmVzOiBib29sZWFuKSA9PiB7XG5cdFx0XHRkaWFsb2cuY2xvc2UoKVxuXHRcdFx0cmVzb2x2ZShyZXMpXG5cdFx0fVxuXG5cdFx0Y29uc3QgYWN0aW9uQmFyQXR0cnM6IERpYWxvZ0hlYWRlckJhckF0dHJzID0ge1xuXHRcdFx0bGVmdDogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGFiZWw6IFwiY2FuY2VsX2FjdGlvblwiLFxuXHRcdFx0XHRcdGNsaWNrOiAoKSA9PiBkb0FjdGlvbihmYWxzZSksXG5cdFx0XHRcdFx0dHlwZTogQnV0dG9uVHlwZS5TZWNvbmRhcnksXG5cdFx0XHRcdH0sXG5cdFx0XHRdLFxuXHRcdFx0cmlnaHQ6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxhYmVsOiBcImludm9pY2VQYXlfYWN0aW9uXCIsXG5cdFx0XHRcdFx0Y2xpY2s6ICgpID0+IGRvQWN0aW9uKHRydWUpLFxuXHRcdFx0XHRcdHR5cGU6IEJ1dHRvblR5cGUuUHJpbWFyeSxcblx0XHRcdFx0fSxcblx0XHRcdF0sXG5cdFx0XHRtaWRkbGU6IFwiYWRtaW5QYXltZW50X2FjdGlvblwiLFxuXHRcdH1cblx0XHRkaWFsb2cgPSBuZXcgRGlhbG9nKERpYWxvZ1R5cGUuRWRpdFNtYWxsLCB7XG5cdFx0XHR2aWV3OiAoKTogQ2hpbGRyZW4gPT4gW1xuXHRcdFx0XHRtKERpYWxvZ0hlYWRlckJhciwgYWN0aW9uQmFyQXR0cnMpLFxuXHRcdFx0XHRtKFxuXHRcdFx0XHRcdFwiLnBsci1sLnBiXCIsXG5cdFx0XHRcdFx0bShcIlwiLCBbXG5cdFx0XHRcdFx0XHRtKFwiLnB0XCIsIGxhbmcuZ2V0KFwiaW52b2ljZVBheUNvbmZpcm1fbXNnXCIpKSxcblx0XHRcdFx0XHRcdG0oVGV4dEZpZWxkLCB7XG5cdFx0XHRcdFx0XHRcdGxhYmVsOiBcInByaWNlX2xhYmVsXCIsXG5cdFx0XHRcdFx0XHRcdHZhbHVlOiBmb3JtYXRQcmljZSgtcHJpY2UsIHRydWUpLFxuXHRcdFx0XHRcdFx0XHRpc1JlYWRPbmx5OiB0cnVlLFxuXHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0XSksXG5cdFx0XHRcdCksXG5cdFx0XHRdLFxuXHRcdH0pXG5cdFx0XHQuc2V0Q2xvc2VIYW5kbGVyKCgpID0+IGRvQWN0aW9uKGZhbHNlKSlcblx0XHRcdC5zaG93KClcblx0fSlcbn1cblxuZnVuY3Rpb24gZ2V0UG9zdGluZ1R5cGVUZXh0KHBvc3Rpbmc6IEN1c3RvbWVyQWNjb3VudFBvc3RpbmcpOiBzdHJpbmcge1xuXHRzd2l0Y2ggKHBvc3RpbmcudHlwZSkge1xuXHRcdGNhc2UgUG9zdGluZ1R5cGUuVXNhZ2VGZWU6XG5cdFx0XHRyZXR1cm4gbGFuZy5nZXQoXCJpbnZvaWNlX2xhYmVsXCIpXG5cblx0XHRjYXNlIFBvc3RpbmdUeXBlLkNyZWRpdDpcblx0XHRcdHJldHVybiBsYW5nLmdldChcImNyZWRpdF9sYWJlbFwiKVxuXG5cdFx0Y2FzZSBQb3N0aW5nVHlwZS5QYXltZW50OlxuXHRcdFx0cmV0dXJuIGxhbmcuZ2V0KFwiYWRtaW5QYXltZW50X2FjdGlvblwiKVxuXG5cdFx0Y2FzZSBQb3N0aW5nVHlwZS5SZWZ1bmQ6XG5cdFx0XHRyZXR1cm4gbGFuZy5nZXQoXCJyZWZ1bmRfbGFiZWxcIilcblxuXHRcdGNhc2UgUG9zdGluZ1R5cGUuR2lmdENhcmQ6XG5cdFx0XHRyZXR1cm4gTnVtYmVyKHBvc3RpbmcuYW1vdW50KSA8IDAgPyBsYW5nLmdldChcImJvdWdodEdpZnRDYXJkUG9zdGluZ19sYWJlbFwiKSA6IGxhbmcuZ2V0KFwicmVkZWVtZWRHaWZ0Q2FyZFBvc3RpbmdfbGFiZWxcIilcblxuXHRcdGNhc2UgUG9zdGluZ1R5cGUuU2FsZXNDb21taXNzaW9uOlxuXHRcdFx0cmV0dXJuIE51bWJlcihwb3N0aW5nLmFtb3VudCkgPCAwID8gbGFuZy5nZXQoXCJjYW5jZWxsZWRSZWZlcnJhbENyZWRpdFBvc3RpbmdfbGFiZWxcIikgOiBsYW5nLmdldChcInJlZmVycmFsQ3JlZGl0UG9zdGluZ19sYWJlbFwiKVxuXG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBcIlwiXG5cdFx0Ly8gR2VuZXJpYywgRGlzcHV0ZSwgU3VzcGVuc2lvbiwgU3VzcGVuc2lvbkNhbmNlbFxuXHR9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzaG93TWFuYWdlVGhyb3VnaEFwcFN0b3JlRGlhbG9nKCk6IFByb21pc2U8dm9pZD4ge1xuXHRjb25zdCBjb25maXJtZWQgPSBhd2FpdCBEaWFsb2cuY29uZmlybShcblx0XHRsYW5nLmdldFRyYW5zbGF0aW9uKFwic3RvcmVTdWJzY3JpcHRpb25fbXNnXCIsIHtcblx0XHRcdFwie0FwcFN0b3JlUGF5bWVudH1cIjogSW5mb0xpbmsuQXBwU3RvcmVQYXltZW50LFxuXHRcdH0pLFxuXHQpXG5cdGlmIChjb25maXJtZWQpIHtcblx0XHR3aW5kb3cub3BlbihcImh0dHBzOi8vYXBwcy5hcHBsZS5jb20vYWNjb3VudC9zdWJzY3JpcHRpb25zXCIsIFwiX2JsYW5rXCIsIFwibm9vcGVuZXIsbm9yZWZlcnJlclwiKVxuXHR9XG59XG4iLCJpbXBvcnQgbSwgeyBDaGlsZHJlbiwgVm5vZGUsIFZub2RlRE9NIH0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHN0cmVhbSBmcm9tIFwibWl0aHJpbC9zdHJlYW1cIlxuaW1wb3J0IHsgbGFuZywgdHlwZSBUcmFuc2xhdGlvbktleSB9IGZyb20gXCIuLi9taXNjL0xhbmd1YWdlVmlld01vZGVsXCJcbmltcG9ydCB0eXBlIHsgU3Vic2NyaXB0aW9uUGFyYW1ldGVycywgVXBncmFkZVN1YnNjcmlwdGlvbkRhdGEgfSBmcm9tIFwiLi9VcGdyYWRlU3Vic2NyaXB0aW9uV2l6YXJkXCJcbmltcG9ydCB7IFN1YnNjcmlwdGlvbkFjdGlvbkJ1dHRvbnMsIFN1YnNjcmlwdGlvblNlbGVjdG9yIH0gZnJvbSBcIi4vU3Vic2NyaXB0aW9uU2VsZWN0b3JcIlxuaW1wb3J0IHsgQnV0dG9uLCBCdXR0b25UeXBlIH0gZnJvbSBcIi4uL2d1aS9iYXNlL0J1dHRvbi5qc1wiXG5pbXBvcnQgeyBVcGdyYWRlVHlwZSB9IGZyb20gXCIuL1N1YnNjcmlwdGlvblV0aWxzXCJcbmltcG9ydCB7IERpYWxvZywgRGlhbG9nVHlwZSB9IGZyb20gXCIuLi9ndWkvYmFzZS9EaWFsb2dcIlxuaW1wb3J0IHR5cGUgeyBXaXphcmRQYWdlQXR0cnMsIFdpemFyZFBhZ2VOIH0gZnJvbSBcIi4uL2d1aS9iYXNlL1dpemFyZERpYWxvZy5qc1wiXG5pbXBvcnQgeyBlbWl0V2l6YXJkRXZlbnQsIFdpemFyZEV2ZW50VHlwZSB9IGZyb20gXCIuLi9ndWkvYmFzZS9XaXphcmREaWFsb2cuanNcIlxuaW1wb3J0IHsgRGVmYXVsdEFuaW1hdGlvblRpbWUgfSBmcm9tIFwiLi4vZ3VpL2FuaW1hdGlvbi9BbmltYXRpb25zXCJcbmltcG9ydCB7IENvbnN0LCBLZXlzLCBQbGFuVHlwZSwgU3Vic2NyaXB0aW9uVHlwZSB9IGZyb20gXCIuLi9hcGkvY29tbW9uL1R1dGFub3RhQ29uc3RhbnRzXCJcbmltcG9ydCB7IENoZWNrYm94IH0gZnJvbSBcIi4uL2d1aS9iYXNlL0NoZWNrYm94LmpzXCJcbmltcG9ydCB7IGxvY2F0b3IgfSBmcm9tIFwiLi4vYXBpL21haW4vQ29tbW9uTG9jYXRvclwiXG5pbXBvcnQgeyBVc2FnZVRlc3QgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXVzYWdldGVzdHNcIlxuaW1wb3J0IHsgVXBncmFkZVByaWNlVHlwZSB9IGZyb20gXCIuL0ZlYXR1cmVMaXN0UHJvdmlkZXJcIlxuaW1wb3J0IHsgYXNQYXltZW50SW50ZXJ2YWwsIFBheW1lbnRJbnRlcnZhbCB9IGZyb20gXCIuL1ByaWNlVXRpbHMuanNcIlxuaW1wb3J0IHsgbGF6eSB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHsgTG9naW5CdXR0b25BdHRycyB9IGZyb20gXCIuLi9ndWkvYmFzZS9idXR0b25zL0xvZ2luQnV0dG9uLmpzXCJcbmltcG9ydCB7IHN0cmluZ1RvU3Vic2NyaXB0aW9uVHlwZSB9IGZyb20gXCIuLi9taXNjL0xvZ2luVXRpbHMuanNcIlxuaW1wb3J0IHsgaXNSZWZlcmVuY2VEYXRlV2l0aGluQ3liZXJNb25kYXlDYW1wYWlnbiB9IGZyb20gXCIuLi9taXNjL0N5YmVyTW9uZGF5VXRpbHMuanNcIlxuXG4vKiogU3Vic2NyaXB0aW9uIHR5cGUgcGFzc2VkIGZyb20gdGhlIHdlYnNpdGUgKi9cbmV4cG9ydCBjb25zdCBQbGFuVHlwZVBhcmFtZXRlciA9IE9iamVjdC5mcmVlemUoe1xuXHRGUkVFOiBcImZyZWVcIixcblx0UkVWT0xVVElPTkFSWTogXCJyZXZvbHV0aW9uYXJ5XCIsXG5cdExFR0VORDogXCJsZWdlbmRcIixcblx0RVNTRU5USUFMOiBcImVzc2VudGlhbFwiLFxuXHRBRFZBTkNFRDogXCJhZHZhbmNlZFwiLFxuXHRVTkxJTUlURUQ6IFwidW5saW1pdGVkXCIsXG59KVxuXG5leHBvcnQgY2xhc3MgVXBncmFkZVN1YnNjcmlwdGlvblBhZ2UgaW1wbGVtZW50cyBXaXphcmRQYWdlTjxVcGdyYWRlU3Vic2NyaXB0aW9uRGF0YT4ge1xuXHRwcml2YXRlIF9kb206IEhUTUxFbGVtZW50IHwgbnVsbCA9IG51bGxcblx0cHJpdmF0ZSBfX3NpZ251cEZyZWVUZXN0PzogVXNhZ2VUZXN0XG5cdHByaXZhdGUgX19zaWdudXBQYWlkVGVzdD86IFVzYWdlVGVzdFxuXHRwcml2YXRlIHVwZ3JhZGVUeXBlOiBVcGdyYWRlVHlwZSB8IG51bGwgPSBudWxsXG5cblx0b25jcmVhdGUodm5vZGU6IFZub2RlRE9NPFdpemFyZFBhZ2VBdHRyczxVcGdyYWRlU3Vic2NyaXB0aW9uRGF0YT4+KTogdm9pZCB7XG5cdFx0dGhpcy5fZG9tID0gdm5vZGUuZG9tIGFzIEhUTUxFbGVtZW50XG5cdFx0Y29uc3Qgc3Vic2NyaXB0aW9uUGFyYW1ldGVycyA9IHZub2RlLmF0dHJzLmRhdGEuc3Vic2NyaXB0aW9uUGFyYW1ldGVyc1xuXHRcdHRoaXMudXBncmFkZVR5cGUgPSB2bm9kZS5hdHRycy5kYXRhLnVwZ3JhZGVUeXBlXG5cblx0XHR0aGlzLl9fc2lnbnVwRnJlZVRlc3QgPSBsb2NhdG9yLnVzYWdlVGVzdENvbnRyb2xsZXIuZ2V0VGVzdChcInNpZ251cC5mcmVlXCIpXG5cdFx0dGhpcy5fX3NpZ251cEZyZWVUZXN0LmFjdGl2ZSA9IGZhbHNlXG5cblx0XHR0aGlzLl9fc2lnbnVwUGFpZFRlc3QgPSBsb2NhdG9yLnVzYWdlVGVzdENvbnRyb2xsZXIuZ2V0VGVzdChcInNpZ251cC5wYWlkXCIpXG5cdFx0dGhpcy5fX3NpZ251cFBhaWRUZXN0LmFjdGl2ZSA9IGZhbHNlXG5cblx0XHRpZiAoc3Vic2NyaXB0aW9uUGFyYW1ldGVycykge1xuXHRcdFx0Y29uc3QgcGF5bWVudEludGVydmFsOiBQYXltZW50SW50ZXJ2YWwgPSBzdWJzY3JpcHRpb25QYXJhbWV0ZXJzLmludGVydmFsXG5cdFx0XHRcdD8gYXNQYXltZW50SW50ZXJ2YWwoc3Vic2NyaXB0aW9uUGFyYW1ldGVycy5pbnRlcnZhbClcblx0XHRcdFx0OiBQYXltZW50SW50ZXJ2YWwuWWVhcmx5XG5cdFx0XHQvLyBXZSBhdXRvbWF0aWNhbGx5IHJvdXRlIHRvIHRoZSBuZXh0IHBhZ2U7IHdoZW4gd2Ugd2FudCB0byBnbyBiYWNrIGZyb20gdGhlIHNlY29uZCBwYWdlLCB3ZSBkbyBub3Qgd2FudCB0byBrZWVwIGNhbGxpbmcgbmV4dFBhZ2Vcblx0XHRcdHZub2RlLmF0dHJzLmRhdGEuc3Vic2NyaXB0aW9uUGFyYW1ldGVycyA9IG51bGxcblx0XHRcdHZub2RlLmF0dHJzLmRhdGEub3B0aW9ucy5wYXltZW50SW50ZXJ2YWwgPSBzdHJlYW0ocGF5bWVudEludGVydmFsKVxuXHRcdFx0dGhpcy5nb1RvTmV4dFBhZ2VXaXRoUHJlc2VsZWN0ZWRTdWJzY3JpcHRpb24oc3Vic2NyaXB0aW9uUGFyYW1ldGVycywgdm5vZGUuYXR0cnMuZGF0YSlcblx0XHR9XG5cdH1cblxuXHR2aWV3KHZub2RlOiBWbm9kZTxXaXphcmRQYWdlQXR0cnM8VXBncmFkZVN1YnNjcmlwdGlvbkRhdGE+Pik6IENoaWxkcmVuIHtcblx0XHRjb25zdCBkYXRhID0gdm5vZGUuYXR0cnMuZGF0YVxuXHRcdGxldCBhdmFpbGFibGVQbGFucyA9IHZub2RlLmF0dHJzLmRhdGEuYWNjZXB0ZWRQbGFuc1xuXHRcdC8vIG5ld0FjY291bnREYXRhIGlzIGZpbGxlZCBpbiB3aGVuIHNpZ25pbmcgdXAgYW5kIHRoZW4gZ29pbmcgYmFjayBpbiB0aGUgc2lnbnVwIHByb2Nlc3Ncblx0XHQvLyBJZiB0aGUgdXNlciBoYXMgc2VsZWN0ZWQgYSB0dXRhLmNvbSBhZGRyZXNzIHdlIHdhbnQgdG8gcHJldmVudCB0aGVtIGZyb20gc2VsZWN0aW5nIGEgZnJlZSBwbGFuIGF0IHRoaXMgcG9pbnRcblx0XHRpZiAoISFkYXRhLm5ld0FjY291bnREYXRhICYmIGRhdGEubmV3QWNjb3VudERhdGEubWFpbEFkZHJlc3MuaW5jbHVkZXMoXCJ0dXRhLmNvbVwiKSAmJiBhdmFpbGFibGVQbGFucy5pbmNsdWRlcyhQbGFuVHlwZS5GcmVlKSkge1xuXHRcdFx0YXZhaWxhYmxlUGxhbnMgPSBhdmFpbGFibGVQbGFucy5maWx0ZXIoKHBsYW4pID0+IHBsYW4gIT0gUGxhblR5cGUuRnJlZSlcblx0XHR9XG5cblx0XHRjb25zdCBpc1llYXJseSA9IGRhdGEub3B0aW9ucy5wYXltZW50SW50ZXJ2YWwoKSA9PT0gUGF5bWVudEludGVydmFsLlllYXJseVxuXHRcdGNvbnN0IGlzQ3liZXJNb25kYXkgPSBpc1JlZmVyZW5jZURhdGVXaXRoaW5DeWJlck1vbmRheUNhbXBhaWduKENvbnN0LkNVUlJFTlRfREFURSA/PyBuZXcgRGF0ZSgpKVxuXHRcdGNvbnN0IHNob3VsZEFwcGx5Q3liZXJNb25kYXkgPSBpc1llYXJseSAmJiBpc0N5YmVyTW9uZGF5XG5cblx0XHRjb25zdCBzdWJzY3JpcHRpb25BY3Rpb25CdXR0b25zOiBTdWJzY3JpcHRpb25BY3Rpb25CdXR0b25zID0ge1xuXHRcdFx0W1BsYW5UeXBlLkZyZWVdOiAoKSA9PiB7XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0bGFiZWw6IFwicHJpY2luZy5zZWxlY3RfYWN0aW9uXCIsXG5cdFx0XHRcdFx0b25jbGljazogKCkgPT4gdGhpcy5zZWxlY3RGcmVlKGRhdGEpLFxuXHRcdFx0XHR9IGFzIExvZ2luQnV0dG9uQXR0cnNcblx0XHRcdH0sXG5cdFx0XHRbUGxhblR5cGUuUmV2b2x1dGlvbmFyeV06IHRoaXMuY3JlYXRlVXBncmFkZUJ1dHRvbihkYXRhLCBQbGFuVHlwZS5SZXZvbHV0aW9uYXJ5KSxcblx0XHRcdFtQbGFuVHlwZS5MZWdlbmRdOiAoKSA9PiAoe1xuXHRcdFx0XHRsYWJlbDogc2hvdWxkQXBwbHlDeWJlck1vbmRheSA/IFwicHJpY2luZy5jeWJlcl9tb25kYXlfc2VsZWN0X2FjdGlvblwiIDogXCJwcmljaW5nLnNlbGVjdF9hY3Rpb25cIixcblx0XHRcdFx0Y2xhc3M6IHNob3VsZEFwcGx5Q3liZXJNb25kYXkgPyBcImFjY2VudC1iZy1jeWJlci1tb25kYXlcIiA6IHVuZGVmaW5lZCxcblx0XHRcdFx0b25jbGljazogKCkgPT4gdGhpcy5zZXROb25GcmVlRGF0YUFuZEdvVG9OZXh0UGFnZShkYXRhLCBQbGFuVHlwZS5MZWdlbmQpLFxuXHRcdFx0fSksXG5cdFx0XHRbUGxhblR5cGUuRXNzZW50aWFsXTogdGhpcy5jcmVhdGVVcGdyYWRlQnV0dG9uKGRhdGEsIFBsYW5UeXBlLkVzc2VudGlhbCksXG5cdFx0XHRbUGxhblR5cGUuQWR2YW5jZWRdOiB0aGlzLmNyZWF0ZVVwZ3JhZGVCdXR0b24oZGF0YSwgUGxhblR5cGUuQWR2YW5jZWQpLFxuXHRcdFx0W1BsYW5UeXBlLlVubGltaXRlZF06IHRoaXMuY3JlYXRlVXBncmFkZUJ1dHRvbihkYXRhLCBQbGFuVHlwZS5VbmxpbWl0ZWQpLFxuXHRcdH1cblx0XHRyZXR1cm4gbShcIi5wdFwiLCBbXG5cdFx0XHRtKFN1YnNjcmlwdGlvblNlbGVjdG9yLCB7XG5cdFx0XHRcdG9wdGlvbnM6IGRhdGEub3B0aW9ucyxcblx0XHRcdFx0cHJpY2VJbmZvVGV4dElkOiBkYXRhLnByaWNlSW5mb1RleHRJZCxcblx0XHRcdFx0Ym94V2lkdGg6IDIzMCxcblx0XHRcdFx0Ym94SGVpZ2h0OiAyNzAsXG5cdFx0XHRcdGFjY2VwdGVkUGxhbnM6IGF2YWlsYWJsZVBsYW5zLFxuXHRcdFx0XHRhbGxvd1N3aXRjaGluZ1BheW1lbnRJbnRlcnZhbDogZGF0YS51cGdyYWRlVHlwZSAhPT0gVXBncmFkZVR5cGUuU3dpdGNoLFxuXHRcdFx0XHRjdXJyZW50UGxhblR5cGU6IGRhdGEuY3VycmVudFBsYW4sXG5cdFx0XHRcdGFjdGlvbkJ1dHRvbnM6IHN1YnNjcmlwdGlvbkFjdGlvbkJ1dHRvbnMsXG5cdFx0XHRcdGZlYXR1cmVMaXN0UHJvdmlkZXI6IHZub2RlLmF0dHJzLmRhdGEuZmVhdHVyZUxpc3RQcm92aWRlcixcblx0XHRcdFx0cHJpY2VBbmRDb25maWdQcm92aWRlcjogdm5vZGUuYXR0cnMuZGF0YS5wbGFuUHJpY2VzLFxuXHRcdFx0XHRtdWx0aXBsZVVzZXJzQWxsb3dlZDogdm5vZGUuYXR0cnMuZGF0YS5tdWx0aXBsZVVzZXJzQWxsb3dlZCxcblx0XHRcdFx0bXNnOiBkYXRhLm1zZyxcblx0XHRcdH0pLFxuXHRcdF0pXG5cdH1cblxuXHRzZWxlY3RGcmVlKGRhdGE6IFVwZ3JhZGVTdWJzY3JpcHRpb25EYXRhKSB7XG5cdFx0Ly8gQ29uZmlybWF0aW9uIG9mIGZyZWUgc3Vic2NyaXB0aW9uIHNlbGVjdGlvbiAoY2xpY2sgb24gc3Vic2NyaXB0aW9uIHNlbGVjdG9yKVxuXHRcdGlmICh0aGlzLl9fc2lnbnVwUGFpZFRlc3QpIHtcblx0XHRcdHRoaXMuX19zaWdudXBQYWlkVGVzdC5hY3RpdmUgPSBmYWxzZVxuXHRcdH1cblxuXHRcdGlmICh0aGlzLl9fc2lnbnVwRnJlZVRlc3QgJiYgdGhpcy51cGdyYWRlVHlwZSA9PSBVcGdyYWRlVHlwZS5TaWdudXApIHtcblx0XHRcdHRoaXMuX19zaWdudXBGcmVlVGVzdC5hY3RpdmUgPSB0cnVlXG5cdFx0XHR0aGlzLl9fc2lnbnVwRnJlZVRlc3QuZ2V0U3RhZ2UoMCkuY29tcGxldGUoKVxuXHRcdH1cblx0XHRjb25maXJtRnJlZVN1YnNjcmlwdGlvbigpLnRoZW4oKGNvbmZpcm1lZCkgPT4ge1xuXHRcdFx0aWYgKGNvbmZpcm1lZCkge1xuXHRcdFx0XHQvLyBDb25maXJtYXRpb24gb2YgZnJlZS9idXNpbmVzcyBkaWFsb2cgKGNsaWNrIG9uIG9rKVxuXHRcdFx0XHR0aGlzLl9fc2lnbnVwRnJlZVRlc3Q/LmdldFN0YWdlKDEpLmNvbXBsZXRlKClcblx0XHRcdFx0ZGF0YS50eXBlID0gUGxhblR5cGUuRnJlZVxuXHRcdFx0XHRkYXRhLnByaWNlID0gbnVsbFxuXHRcdFx0XHRkYXRhLm5leHRZZWFyUHJpY2UgPSBudWxsXG5cdFx0XHRcdHRoaXMuc2hvd05leHRQYWdlKClcblx0XHRcdH1cblx0XHR9KVxuXHR9XG5cblx0c2hvd05leHRQYWdlKCk6IHZvaWQge1xuXHRcdGlmICh0aGlzLl9kb20pIHtcblx0XHRcdGVtaXRXaXphcmRFdmVudCh0aGlzLl9kb20sIFdpemFyZEV2ZW50VHlwZS5TSE9XX05FWFRfUEFHRSlcblx0XHR9XG5cdH1cblxuXHRnb1RvTmV4dFBhZ2VXaXRoUHJlc2VsZWN0ZWRTdWJzY3JpcHRpb24oc3Vic2NyaXB0aW9uUGFyYW1ldGVyczogU3Vic2NyaXB0aW9uUGFyYW1ldGVycywgZGF0YTogVXBncmFkZVN1YnNjcmlwdGlvbkRhdGEpOiB2b2lkIHtcblx0XHRsZXQgc3Vic2NyaXB0aW9uVHlwZTogU3Vic2NyaXB0aW9uVHlwZSB8IG51bGxcblx0XHR0cnkge1xuXHRcdFx0c3Vic2NyaXB0aW9uVHlwZSA9IHN1YnNjcmlwdGlvblBhcmFtZXRlcnMudHlwZSA9PSBudWxsID8gbnVsbCA6IHN0cmluZ1RvU3Vic2NyaXB0aW9uVHlwZShzdWJzY3JpcHRpb25QYXJhbWV0ZXJzLnR5cGUpXG5cdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0c3Vic2NyaXB0aW9uVHlwZSA9IG51bGxcblx0XHR9XG5cblx0XHRpZiAoc3Vic2NyaXB0aW9uVHlwZSA9PT0gU3Vic2NyaXB0aW9uVHlwZS5QZXJzb25hbCB8fCBzdWJzY3JpcHRpb25UeXBlID09PSBTdWJzY3JpcHRpb25UeXBlLlBhaWRQZXJzb25hbCkge1xuXHRcdFx0Ly8gd2UgaGF2ZSB0byBpbmRpdmlkdWFsbHkgY2hhbmdlIHRoZSBkYXRhIHNvIHRoYXQgd2hlbiByZXR1cm5pbmcgd2Ugc2hvdyB0aGUgY2hvc2Ugc3Vic2NyaXB0aW9uIHR5cGUgKHByaXZhdGUvYnVzaW5lc3MpIHwgZmFsc2UgPSBwcml2YXRlLCB0cnVlID0gYnVzaW5lc3Ncblx0XHRcdGRhdGEub3B0aW9ucy5idXNpbmVzc1VzZShmYWxzZSlcblxuXHRcdFx0c3dpdGNoIChzdWJzY3JpcHRpb25QYXJhbWV0ZXJzLnN1YnNjcmlwdGlvbikge1xuXHRcdFx0XHRjYXNlIFBsYW5UeXBlUGFyYW1ldGVyLkZSRUU6XG5cdFx0XHRcdFx0dGhpcy5zZWxlY3RGcmVlKGRhdGEpXG5cdFx0XHRcdFx0YnJlYWtcblxuXHRcdFx0XHRjYXNlIFBsYW5UeXBlUGFyYW1ldGVyLlJFVk9MVVRJT05BUlk6XG5cdFx0XHRcdFx0dGhpcy5zZXROb25GcmVlRGF0YUFuZEdvVG9OZXh0UGFnZShkYXRhLCBQbGFuVHlwZS5SZXZvbHV0aW9uYXJ5KVxuXHRcdFx0XHRcdGJyZWFrXG5cblx0XHRcdFx0Y2FzZSBQbGFuVHlwZVBhcmFtZXRlci5MRUdFTkQ6XG5cdFx0XHRcdFx0dGhpcy5zZXROb25GcmVlRGF0YUFuZEdvVG9OZXh0UGFnZShkYXRhLCBQbGFuVHlwZS5MZWdlbmQpXG5cdFx0XHRcdFx0YnJlYWtcblxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdGNvbnNvbGUubG9nKFwiVW5rbm93biBzdWJzY3JpcHRpb24gcGFzc2VkOiBcIiwgc3Vic2NyaXB0aW9uUGFyYW1ldGVycylcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoc3Vic2NyaXB0aW9uVHlwZSA9PT0gU3Vic2NyaXB0aW9uVHlwZS5CdXNpbmVzcykge1xuXHRcdFx0ZGF0YS5vcHRpb25zLmJ1c2luZXNzVXNlKHRydWUpXG5cblx0XHRcdHN3aXRjaCAoc3Vic2NyaXB0aW9uUGFyYW1ldGVycy5zdWJzY3JpcHRpb24pIHtcblx0XHRcdFx0Y2FzZSBQbGFuVHlwZVBhcmFtZXRlci5FU1NFTlRJQUw6XG5cdFx0XHRcdFx0dGhpcy5zZXROb25GcmVlRGF0YUFuZEdvVG9OZXh0UGFnZShkYXRhLCBQbGFuVHlwZS5Fc3NlbnRpYWwpXG5cdFx0XHRcdFx0YnJlYWtcblxuXHRcdFx0XHRjYXNlIFBsYW5UeXBlUGFyYW1ldGVyLkFEVkFOQ0VEOlxuXHRcdFx0XHRcdHRoaXMuc2V0Tm9uRnJlZURhdGFBbmRHb1RvTmV4dFBhZ2UoZGF0YSwgUGxhblR5cGUuQWR2YW5jZWQpXG5cdFx0XHRcdFx0YnJlYWtcblxuXHRcdFx0XHRjYXNlIFBsYW5UeXBlUGFyYW1ldGVyLlVOTElNSVRFRDpcblx0XHRcdFx0XHR0aGlzLnNldE5vbkZyZWVEYXRhQW5kR29Ub05leHRQYWdlKGRhdGEsIFBsYW5UeXBlLlVubGltaXRlZClcblx0XHRcdFx0XHRicmVha1xuXG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coXCJVbmtub3duIHN1YnNjcmlwdGlvbiBwYXNzZWQ6IFwiLCBzdWJzY3JpcHRpb25QYXJhbWV0ZXJzKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUubG9nKFwiVW5rbm93biBzdWJzY3JpcHRpb24gdHlwZSBwYXNzZWQ6IFwiLCBzdWJzY3JpcHRpb25QYXJhbWV0ZXJzKVxuXHRcdH1cblx0fVxuXG5cdHNldE5vbkZyZWVEYXRhQW5kR29Ub05leHRQYWdlKGRhdGE6IFVwZ3JhZGVTdWJzY3JpcHRpb25EYXRhLCBwbGFuVHlwZTogUGxhblR5cGUpOiB2b2lkIHtcblx0XHQvLyBDb25maXJtYXRpb24gb2YgcGFpZCBzdWJzY3JpcHRpb24gc2VsZWN0aW9uIChjbGljayBvbiBzdWJzY3JpcHRpb24gc2VsZWN0b3IpXG5cdFx0aWYgKHRoaXMuX19zaWdudXBGcmVlVGVzdCkge1xuXHRcdFx0dGhpcy5fX3NpZ251cEZyZWVUZXN0LmFjdGl2ZSA9IGZhbHNlXG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuX19zaWdudXBQYWlkVGVzdCAmJiB0aGlzLnVwZ3JhZGVUeXBlID09IFVwZ3JhZGVUeXBlLlNpZ251cCkge1xuXHRcdFx0dGhpcy5fX3NpZ251cFBhaWRUZXN0LmFjdGl2ZSA9IHRydWVcblx0XHRcdHRoaXMuX19zaWdudXBQYWlkVGVzdC5nZXRTdGFnZSgwKS5jb21wbGV0ZSgpXG5cdFx0fVxuXHRcdGRhdGEudHlwZSA9IHBsYW5UeXBlXG5cdFx0Y29uc3QgeyBwbGFuUHJpY2VzLCBvcHRpb25zIH0gPSBkYXRhXG5cdFx0dHJ5IHtcblx0XHRcdC8vIGBkYXRhLnByaWNlLnJhd1ByaWNlYCBpcyB1c2VkIGZvciB0aGUgYW1vdW50IHBhcmFtZXRlciBpbiB0aGUgQnJhaW50cmVlIGNyZWRpdCBjYXJkIHZlcmlmaWNhdGlvbiBjYWxsLCBzbyB3ZSBkbyBub3QgaW5jbHVkZSBjdXJyZW5jeSBsb2NhbGUgb3V0c2lkZSBpT1MuXG5cdFx0XHRkYXRhLnByaWNlID0gcGxhblByaWNlcy5nZXRTdWJzY3JpcHRpb25QcmljZVdpdGhDdXJyZW5jeShvcHRpb25zLnBheW1lbnRJbnRlcnZhbCgpLCBkYXRhLnR5cGUsIFVwZ3JhZGVQcmljZVR5cGUuUGxhbkFjdHVhbFByaWNlKVxuXHRcdFx0Y29uc3QgbmV4dFllYXIgPSBwbGFuUHJpY2VzLmdldFN1YnNjcmlwdGlvblByaWNlV2l0aEN1cnJlbmN5KG9wdGlvbnMucGF5bWVudEludGVydmFsKCksIGRhdGEudHlwZSwgVXBncmFkZVByaWNlVHlwZS5QbGFuTmV4dFllYXJzUHJpY2UpXG5cdFx0XHRkYXRhLm5leHRZZWFyUHJpY2UgPSBkYXRhLnByaWNlLnJhd1ByaWNlICE9PSBuZXh0WWVhci5yYXdQcmljZSA/IG5leHRZZWFyIDogbnVsbFxuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoZSlcblx0XHRcdERpYWxvZy5tZXNzYWdlKFwiYXBwU3RvcmVOb3RBdmFpbGFibGVfbXNnXCIpXG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cdFx0dGhpcy5zaG93TmV4dFBhZ2UoKVxuXHR9XG5cblx0Y3JlYXRlVXBncmFkZUJ1dHRvbihkYXRhOiBVcGdyYWRlU3Vic2NyaXB0aW9uRGF0YSwgcGxhblR5cGU6IFBsYW5UeXBlKTogbGF6eTxMb2dpbkJ1dHRvbkF0dHJzPiB7XG5cdFx0cmV0dXJuICgpID0+ICh7XG5cdFx0XHRsYWJlbDogXCJwcmljaW5nLnNlbGVjdF9hY3Rpb25cIixcblx0XHRcdG9uY2xpY2s6ICgpID0+IHRoaXMuc2V0Tm9uRnJlZURhdGFBbmRHb1RvTmV4dFBhZ2UoZGF0YSwgcGxhblR5cGUpLFxuXHRcdH0pXG5cdH1cbn1cblxuZnVuY3Rpb24gY29uZmlybUZyZWVTdWJzY3JpcHRpb24oKTogUHJvbWlzZTxib29sZWFuPiB7XG5cdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuXHRcdGxldCBvbmVBY2NvdW50VmFsdWUgPSBzdHJlYW0oZmFsc2UpXG5cdFx0bGV0IHByaXZhdGVVc2VWYWx1ZSA9IHN0cmVhbShmYWxzZSlcblx0XHRsZXQgZGlhbG9nOiBEaWFsb2dcblxuXHRcdGNvbnN0IGNsb3NlQWN0aW9uID0gKGNvbmZpcm1lZDogYm9vbGVhbikgPT4ge1xuXHRcdFx0ZGlhbG9nLmNsb3NlKClcblx0XHRcdHNldFRpbWVvdXQoKCkgPT4gcmVzb2x2ZShjb25maXJtZWQpLCBEZWZhdWx0QW5pbWF0aW9uVGltZSlcblx0XHR9XG5cdFx0Y29uc3QgaXNGb3JtVmFsaWQgPSAoKSA9PiBvbmVBY2NvdW50VmFsdWUoKSAmJiBwcml2YXRlVXNlVmFsdWUoKVxuXHRcdGRpYWxvZyA9IG5ldyBEaWFsb2coRGlhbG9nVHlwZS5BbGVydCwge1xuXHRcdFx0dmlldzogKCkgPT4gW1xuXHRcdFx0XHQvLyBtKFwiLmgyLnBiXCIsIGxhbmcuZ2V0KFwiY29uZmlybUZyZWVBY2NvdW50X2xhYmVsXCIpKSxcblx0XHRcdFx0bShcIiNkaWFsb2ctbWVzc2FnZS5kaWFsb2ctY29udGVudEJ1dHRvbnNCb3R0b20udGV4dC1icmVhay50ZXh0LXByZXdyYXAuc2VsZWN0YWJsZVwiLCBsYW5nLmdldFRyYW5zbGF0aW9uVGV4dChcImZyZWVBY2NvdW50SW5mb19tc2dcIikpLFxuXHRcdFx0XHRtKFwiLmRpYWxvZy1jb250ZW50QnV0dG9uc0JvdHRvbVwiLCBbXG5cdFx0XHRcdFx0bShDaGVja2JveCwge1xuXHRcdFx0XHRcdFx0bGFiZWw6ICgpID0+IGxhbmcuZ2V0KFwiY29uZmlybU5vT3RoZXJGcmVlQWNjb3VudF9tc2dcIiksXG5cdFx0XHRcdFx0XHRjaGVja2VkOiBvbmVBY2NvdW50VmFsdWUoKSxcblx0XHRcdFx0XHRcdG9uQ2hlY2tlZDogb25lQWNjb3VudFZhbHVlLFxuXHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdG0oQ2hlY2tib3gsIHtcblx0XHRcdFx0XHRcdGxhYmVsOiAoKSA9PiBsYW5nLmdldChcImNvbmZpcm1Qcml2YXRlVXNlX21zZ1wiKSxcblx0XHRcdFx0XHRcdGNoZWNrZWQ6IHByaXZhdGVVc2VWYWx1ZSgpLFxuXHRcdFx0XHRcdFx0b25DaGVja2VkOiBwcml2YXRlVXNlVmFsdWUsXG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdF0pLFxuXHRcdFx0XHRtKFwiLmZsZXgtY2VudGVyLmRpYWxvZy1idXR0b25zXCIsIFtcblx0XHRcdFx0XHRtKEJ1dHRvbiwge1xuXHRcdFx0XHRcdFx0bGFiZWw6IFwiY2FuY2VsX2FjdGlvblwiLFxuXHRcdFx0XHRcdFx0Y2xpY2s6ICgpID0+IGNsb3NlQWN0aW9uKGZhbHNlKSxcblx0XHRcdFx0XHRcdHR5cGU6IEJ1dHRvblR5cGUuU2Vjb25kYXJ5LFxuXHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdG0oQnV0dG9uLCB7XG5cdFx0XHRcdFx0XHRsYWJlbDogXCJva19hY3Rpb25cIixcblx0XHRcdFx0XHRcdGNsaWNrOiAoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdGlmIChpc0Zvcm1WYWxpZCgpKSBjbG9zZUFjdGlvbih0cnVlKVxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdHR5cGU6IEJ1dHRvblR5cGUuUHJpbWFyeSxcblx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XSksXG5cdFx0XHRdLFxuXHRcdH0pXG5cdFx0XHQuc2V0Q2xvc2VIYW5kbGVyKCgpID0+IGNsb3NlQWN0aW9uKGZhbHNlKSlcblx0XHRcdC5hZGRTaG9ydGN1dCh7XG5cdFx0XHRcdGtleTogS2V5cy5FU0MsXG5cdFx0XHRcdHNoaWZ0OiBmYWxzZSxcblx0XHRcdFx0ZXhlYzogKCkgPT4gY2xvc2VBY3Rpb24oZmFsc2UpLFxuXHRcdFx0XHRoZWxwOiBcImNhbmNlbF9hY3Rpb25cIixcblx0XHRcdH0pXG5cdFx0XHQuYWRkU2hvcnRjdXQoe1xuXHRcdFx0XHRrZXk6IEtleXMuUkVUVVJOLFxuXHRcdFx0XHRzaGlmdDogZmFsc2UsXG5cdFx0XHRcdGV4ZWM6ICgpID0+IHtcblx0XHRcdFx0XHRpZiAoaXNGb3JtVmFsaWQoKSkgY2xvc2VBY3Rpb24odHJ1ZSlcblx0XHRcdFx0fSxcblx0XHRcdFx0aGVscDogXCJva19hY3Rpb25cIixcblx0XHRcdH0pXG5cdFx0XHQuc2hvdygpXG5cdH0pXG59XG5cbmV4cG9ydCBjbGFzcyBVcGdyYWRlU3Vic2NyaXB0aW9uUGFnZUF0dHJzIGltcGxlbWVudHMgV2l6YXJkUGFnZUF0dHJzPFVwZ3JhZGVTdWJzY3JpcHRpb25EYXRhPiB7XG5cdGRhdGE6IFVwZ3JhZGVTdWJzY3JpcHRpb25EYXRhXG5cblx0Y29uc3RydWN0b3IodXBncmFkZURhdGE6IFVwZ3JhZGVTdWJzY3JpcHRpb25EYXRhKSB7XG5cdFx0dGhpcy5kYXRhID0gdXBncmFkZURhdGFcblx0fVxuXG5cdGhlYWRlclRpdGxlKCk6IFRyYW5zbGF0aW9uS2V5IHtcblx0XHRyZXR1cm4gXCJzdWJzY3JpcHRpb25fbGFiZWxcIlxuXHR9XG5cblx0bmV4dEFjdGlvbihzaG93RXJyb3JEaWFsb2c6IGJvb2xlYW4pOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHQvLyBuZXh0IGFjdGlvbiBub3QgYXZhaWxhYmxlIGZvciB0aGlzIHBhZ2Vcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpXG5cdH1cblxuXHRpc1NraXBBdmFpbGFibGUoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIGZhbHNlXG5cdH1cblxuXHRpc0VuYWJsZWQoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRydWVcblx0fVxufVxuIiwiaW1wb3J0IG0sIHsgQ2hpbGRyZW4sIFZub2RlLCBWbm9kZURPTSB9IGZyb20gXCJtaXRocmlsXCJcbmltcG9ydCB7IGxhbmcsIHR5cGUgVHJhbnNsYXRpb25LZXkgfSBmcm9tIFwiLi4vbWlzYy9MYW5ndWFnZVZpZXdNb2RlbFwiXG5pbXBvcnQgdHlwZSB7IFVwZ3JhZGVTdWJzY3JpcHRpb25EYXRhIH0gZnJvbSBcIi4vVXBncmFkZVN1YnNjcmlwdGlvbldpemFyZFwiXG5pbXBvcnQgdHlwZSB7IFdpemFyZFBhZ2VBdHRycywgV2l6YXJkUGFnZU4gfSBmcm9tIFwiLi4vZ3VpL2Jhc2UvV2l6YXJkRGlhbG9nLmpzXCJcbmltcG9ydCB7IGVtaXRXaXphcmRFdmVudCwgV2l6YXJkRXZlbnRUeXBlIH0gZnJvbSBcIi4uL2d1aS9iYXNlL1dpemFyZERpYWxvZy5qc1wiXG5pbXBvcnQgeyBsb2NhdG9yIH0gZnJvbSBcIi4uL2FwaS9tYWluL0NvbW1vbkxvY2F0b3JcIlxuaW1wb3J0IHsgVXNhZ2VUZXN0IH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11c2FnZXRlc3RzXCJcbmltcG9ydCB7IFJlY292ZXJDb2RlRmllbGQgfSBmcm9tIFwiLi4vc2V0dGluZ3MvbG9naW4vUmVjb3ZlckNvZGVEaWFsb2cuanNcIlxuaW1wb3J0IHsgVmlzU2lnbnVwSW1hZ2UgfSBmcm9tIFwiLi4vZ3VpL2Jhc2UvaWNvbnMvSWNvbnMuanNcIlxuaW1wb3J0IHsgUGxhblR5cGUgfSBmcm9tIFwiLi4vYXBpL2NvbW1vbi9UdXRhbm90YUNvbnN0YW50cy5qc1wiXG5pbXBvcnQgeyBMb2dpbkJ1dHRvbiB9IGZyb20gXCIuLi9ndWkvYmFzZS9idXR0b25zL0xvZ2luQnV0dG9uLmpzXCJcblxuZXhwb3J0IGNsYXNzIFVwZ3JhZGVDb25ncmF0dWxhdGlvbnNQYWdlIGltcGxlbWVudHMgV2l6YXJkUGFnZU48VXBncmFkZVN1YnNjcmlwdGlvbkRhdGE+IHtcblx0cHJpdmF0ZSBkb20hOiBIVE1MRWxlbWVudFxuXHRwcml2YXRlIF9fc2lnbnVwUGFpZFRlc3Q/OiBVc2FnZVRlc3Rcblx0cHJpdmF0ZSBfX3NpZ251cEZyZWVUZXN0PzogVXNhZ2VUZXN0XG5cblx0b25jcmVhdGUodm5vZGU6IFZub2RlRE9NPFdpemFyZFBhZ2VBdHRyczxVcGdyYWRlU3Vic2NyaXB0aW9uRGF0YT4+KSB7XG5cdFx0dGhpcy5fX3NpZ251cFBhaWRUZXN0ID0gbG9jYXRvci51c2FnZVRlc3RDb250cm9sbGVyLmdldFRlc3QoXCJzaWdudXAucGFpZFwiKVxuXHRcdHRoaXMuX19zaWdudXBGcmVlVGVzdCA9IGxvY2F0b3IudXNhZ2VUZXN0Q29udHJvbGxlci5nZXRUZXN0KFwic2lnbnVwLmZyZWVcIilcblxuXHRcdHRoaXMuZG9tID0gdm5vZGUuZG9tIGFzIEhUTUxFbGVtZW50XG5cdH1cblxuXHR2aWV3KHsgYXR0cnMgfTogVm5vZGU8V2l6YXJkUGFnZUF0dHJzPFVwZ3JhZGVTdWJzY3JpcHRpb25EYXRhPj4pOiBDaGlsZHJlbiB7XG5cdFx0Y29uc3QgeyBuZXdBY2NvdW50RGF0YSB9ID0gYXR0cnMuZGF0YVxuXG5cdFx0cmV0dXJuIFtcblx0XHRcdG0oXCIuY2VudGVyLmg0LnB0XCIsIGxhbmcuZ2V0KFwiYWNjb3VudENyZWF0aW9uQ29uZ3JhdHVsYXRpb25fbXNnXCIpKSxcblx0XHRcdG5ld0FjY291bnREYXRhXG5cdFx0XHRcdD8gbShcIi5wbHItbFwiLCBbXG5cdFx0XHRcdFx0XHRtKFJlY292ZXJDb2RlRmllbGQsIHtcblx0XHRcdFx0XHRcdFx0c2hvd01lc3NhZ2U6IHRydWUsXG5cdFx0XHRcdFx0XHRcdHJlY292ZXJDb2RlOiBuZXdBY2NvdW50RGF0YS5yZWNvdmVyQ29kZSxcblx0XHRcdFx0XHRcdFx0aW1hZ2U6IHtcblx0XHRcdFx0XHRcdFx0XHRzcmM6IFZpc1NpZ251cEltYWdlLFxuXHRcdFx0XHRcdFx0XHRcdGFsdDogXCJ2aXRvcl9hbHRcIixcblx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHQgIF0pXG5cdFx0XHRcdDogbnVsbCxcblx0XHRcdG0oXG5cdFx0XHRcdFwiLmZsZXgtY2VudGVyLmZ1bGwtd2lkdGgucHQtbFwiLFxuXHRcdFx0XHRtKExvZ2luQnV0dG9uLCB7XG5cdFx0XHRcdFx0bGFiZWw6IFwib2tfYWN0aW9uXCIsXG5cdFx0XHRcdFx0Y2xhc3M6IFwic21hbGwtbG9naW4tYnV0dG9uXCIsXG5cdFx0XHRcdFx0b25jbGljazogKCkgPT4ge1xuXHRcdFx0XHRcdFx0aWYgKGF0dHJzLmRhdGEudHlwZSA9PT0gUGxhblR5cGUuRnJlZSkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCByZWNvdmVyeUNvbmZpcm1hdGlvblN0YWdlRnJlZSA9IHRoaXMuX19zaWdudXBGcmVlVGVzdD8uZ2V0U3RhZ2UoNSlcblxuXHRcdFx0XHRcdFx0XHRyZWNvdmVyeUNvbmZpcm1hdGlvblN0YWdlRnJlZT8uc2V0TWV0cmljKHtcblx0XHRcdFx0XHRcdFx0XHRuYW1lOiBcInN3aXRjaGVkRnJvbVBhaWRcIixcblx0XHRcdFx0XHRcdFx0XHR2YWx1ZTogKHRoaXMuX19zaWdudXBQYWlkVGVzdD8uaXNTdGFydGVkKCkgPz8gZmFsc2UpLnRvU3RyaW5nKCksXG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdHJlY292ZXJ5Q29uZmlybWF0aW9uU3RhZ2VGcmVlPy5jb21wbGV0ZSgpXG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHRoaXMuY2xvc2UoYXR0cnMuZGF0YSwgdGhpcy5kb20pXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0fSksXG5cdFx0XHQpLFxuXHRcdF1cblx0fVxuXG5cdHByaXZhdGUgY2xvc2UoZGF0YTogVXBncmFkZVN1YnNjcmlwdGlvbkRhdGEsIGRvbTogSFRNTEVsZW1lbnQpIHtcblx0XHRsZXQgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpXG5cblx0XHRpZiAoZGF0YS5uZXdBY2NvdW50RGF0YSAmJiBsb2NhdG9yLmxvZ2lucy5pc1VzZXJMb2dnZWRJbigpKSB7XG5cdFx0XHRwcm9taXNlID0gbG9jYXRvci5sb2dpbnMubG9nb3V0KGZhbHNlKVxuXHRcdH1cblxuXHRcdHByb21pc2UudGhlbigoKSA9PiB7XG5cdFx0XHRlbWl0V2l6YXJkRXZlbnQoZG9tLCBXaXphcmRFdmVudFR5cGUuU0hPV19ORVhUX1BBR0UpXG5cdFx0fSlcblx0fVxufVxuXG5leHBvcnQgY2xhc3MgVXBncmFkZUNvbmdyYXR1bGF0aW9uc1BhZ2VBdHRycyBpbXBsZW1lbnRzIFdpemFyZFBhZ2VBdHRyczxVcGdyYWRlU3Vic2NyaXB0aW9uRGF0YT4ge1xuXHRkYXRhOiBVcGdyYWRlU3Vic2NyaXB0aW9uRGF0YVxuXHRwcmV2ZW50R29CYWNrID0gdHJ1ZVxuXHRoaWRlUGFnaW5nQnV0dG9uRm9yUGFnZSA9IHRydWVcblxuXHRjb25zdHJ1Y3Rvcih1cGdyYWRlRGF0YTogVXBncmFkZVN1YnNjcmlwdGlvbkRhdGEpIHtcblx0XHR0aGlzLmRhdGEgPSB1cGdyYWRlRGF0YVxuXHR9XG5cblx0aGVhZGVyVGl0bGUoKTogVHJhbnNsYXRpb25LZXkge1xuXHRcdHJldHVybiBcImFjY291bnRDb25ncmF0dWxhdGlvbnNfbXNnXCJcblx0fVxuXG5cdG5leHRBY3Rpb24oc2hvd0RpYWxvZ3M6IGJvb2xlYW4pOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHQvLyBuZXh0IGFjdGlvbiBub3QgYXZhaWxhYmxlIGZvciB0aGlzIHBhZ2Vcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpXG5cdH1cblxuXHRpc1NraXBBdmFpbGFibGUoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIGZhbHNlXG5cdH1cblxuXHRpc0VuYWJsZWQoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRydWVcblx0fVxufVxuIiwiaW1wb3J0IG0sIHsgQ2hpbGRyZW4sIENvbXBvbmVudCwgVm5vZGUgfSBmcm9tIFwibWl0aHJpbFwiXG5pbXBvcnQgdHlwZSB7IFRyYW5zbGF0aW9uS2V5IH0gZnJvbSBcIi4uL21pc2MvTGFuZ3VhZ2VWaWV3TW9kZWwuanNcIlxuaW1wb3J0IHsgbGFuZyB9IGZyb20gXCIuLi9taXNjL0xhbmd1YWdlVmlld01vZGVsLmpzXCJcbmltcG9ydCB7IGlzTWFpbEFkZHJlc3MgfSBmcm9tIFwiLi4vbWlzYy9Gb3JtYXRWYWxpZGF0b3IuanNcIlxuaW1wb3J0IHsgQWNjZXNzRGVhY3RpdmF0ZWRFcnJvciB9IGZyb20gXCIuLi9hcGkvY29tbW9uL2Vycm9yL1Jlc3RFcnJvci5qc1wiXG5pbXBvcnQgeyBmb3JtYXRNYWlsQWRkcmVzc0Zyb21QYXJ0cyB9IGZyb20gXCIuLi9taXNjL0Zvcm1hdHRlci5qc1wiXG5pbXBvcnQgeyBJY29uIH0gZnJvbSBcIi4uL2d1aS9iYXNlL0ljb24uanNcIlxuaW1wb3J0IHsgbG9jYXRvciB9IGZyb20gXCIuLi9hcGkvbWFpbi9Db21tb25Mb2NhdG9yLmpzXCJcbmltcG9ydCB7IGFzc2VydE1haW5Pck5vZGUgfSBmcm9tIFwiLi4vYXBpL2NvbW1vbi9FbnYuanNcIlxuaW1wb3J0IHsgcHgsIHNpemUgfSBmcm9tIFwiLi4vZ3VpL3NpemUuanNcIlxuaW1wb3J0IHsgQXV0b2NhcGl0YWxpemUsIEF1dG9jb21wbGV0ZSwgaW5wdXRMaW5lSGVpZ2h0LCBUZXh0RmllbGQgfSBmcm9tIFwiLi4vZ3VpL2Jhc2UvVGV4dEZpZWxkLmpzXCJcbmltcG9ydCB7IGF0dGFjaERyb3Bkb3duLCBEcm9wZG93bkJ1dHRvbkF0dHJzIH0gZnJvbSBcIi4uL2d1aS9iYXNlL0Ryb3Bkb3duLmpzXCJcbmltcG9ydCB7IEljb25CdXR0b24sIEljb25CdXR0b25BdHRycyB9IGZyb20gXCIuLi9ndWkvYmFzZS9JY29uQnV0dG9uLmpzXCJcbmltcG9ydCB7IEJ1dHRvblNpemUgfSBmcm9tIFwiLi4vZ3VpL2Jhc2UvQnV0dG9uU2l6ZS5qc1wiXG5pbXBvcnQgeyBFbWFpbERvbWFpbkRhdGEgfSBmcm9tIFwiLi9tYWlsYWRkcmVzcy9NYWlsQWRkcmVzc2VzVXRpbHMuanNcIlxuaW1wb3J0IHsgQm9vdEljb25zIH0gZnJvbSBcIi4uL2d1aS9iYXNlL2ljb25zL0Jvb3RJY29ucy5qc1wiXG5pbXBvcnQgeyBpc1R1dGFNYWlsQWRkcmVzcyB9IGZyb20gXCIuLi9tYWlsRnVuY3Rpb25hbGl0eS9TaGFyZWRNYWlsVXRpbHMuanNcIlxuXG5hc3NlcnRNYWluT3JOb2RlKClcblxuY29uc3QgVkFMSURfTUVTU0FHRV9JRCA9IFwibWFpbEFkZHJlc3NBdmFpbGFibGVfbXNnXCJcblxuZXhwb3J0IGludGVyZmFjZSBTZWxlY3RNYWlsQWRkcmVzc0Zvcm1BdHRycyB7XG5cdHNlbGVjdGVkRG9tYWluOiBFbWFpbERvbWFpbkRhdGFcblx0YXZhaWxhYmxlRG9tYWluczogcmVhZG9ubHkgRW1haWxEb21haW5EYXRhW11cblx0b25WYWxpZGF0aW9uUmVzdWx0OiAoZW1haWxBZGRyZXNzOiBzdHJpbmcsIHZhbGlkYXRpb25SZXN1bHQ6IFZhbGlkYXRpb25SZXN1bHQpID0+IHVua25vd25cblx0b25CdXN5U3RhdGVDaGFuZ2VkOiAoaXNCdXN5OiBib29sZWFuKSA9PiB1bmtub3duXG5cdGluamVjdGlvbnNSaWdodEJ1dHRvbkF0dHJzPzogSWNvbkJ1dHRvbkF0dHJzIHwgbnVsbFxuXHRvbkRvbWFpbkNoYW5nZWQ6IChkb21haW46IEVtYWlsRG9tYWluRGF0YSkgPT4gdW5rbm93blxuXHRtYWlsQWRkcmVzc05BRXJyb3I/OiBUcmFuc2xhdGlvbktleVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFZhbGlkYXRpb25SZXN1bHQge1xuXHRpc1ZhbGlkOiBib29sZWFuXG5cdGVycm9ySWQ6IFRyYW5zbGF0aW9uS2V5IHwgbnVsbFxufVxuXG5leHBvcnQgY2xhc3MgU2VsZWN0TWFpbEFkZHJlc3NGb3JtIGltcGxlbWVudHMgQ29tcG9uZW50PFNlbGVjdE1haWxBZGRyZXNzRm9ybUF0dHJzPiB7XG5cdHByaXZhdGUgdXNlcm5hbWU6IHN0cmluZ1xuXHRwcml2YXRlIG1lc3NhZ2VJZDogVHJhbnNsYXRpb25LZXkgfCBudWxsXG5cdHByaXZhdGUgY2hlY2tBZGRyZXNzVGltZW91dDogVGltZW91dElEIHwgbnVsbFxuXHRwcml2YXRlIGlzVmVyaWZpY2F0aW9uQnVzeTogYm9vbGVhblxuXHRwcml2YXRlIGxhc3RBdHRyczogU2VsZWN0TWFpbEFkZHJlc3NGb3JtQXR0cnNcblxuXHRjb25zdHJ1Y3Rvcih7IGF0dHJzIH06IFZub2RlPFNlbGVjdE1haWxBZGRyZXNzRm9ybUF0dHJzPikge1xuXHRcdHRoaXMubGFzdEF0dHJzID0gYXR0cnNcblx0XHR0aGlzLmlzVmVyaWZpY2F0aW9uQnVzeSA9IGZhbHNlXG5cdFx0dGhpcy5jaGVja0FkZHJlc3NUaW1lb3V0ID0gbnVsbFxuXHRcdHRoaXMudXNlcm5hbWUgPSBcIlwiXG5cdFx0dGhpcy5tZXNzYWdlSWQgPSBcIm1haWxBZGRyZXNzTmV1dHJhbF9tc2dcIlxuXHR9XG5cblx0b251cGRhdGUodm5vZGU6IFZub2RlPFNlbGVjdE1haWxBZGRyZXNzRm9ybUF0dHJzPikge1xuXHRcdGlmICh0aGlzLmxhc3RBdHRycy5zZWxlY3RlZERvbWFpbi5kb21haW4gIT09IHZub2RlLmF0dHJzLnNlbGVjdGVkRG9tYWluLmRvbWFpbikge1xuXHRcdFx0dGhpcy52ZXJpZnlNYWlsQWRkcmVzcyh2bm9kZS5hdHRycylcblx0XHR9XG5cdFx0dGhpcy5sYXN0QXR0cnMgPSB2bm9kZS5hdHRyc1xuXHR9XG5cblx0dmlldyh7IGF0dHJzIH06IFZub2RlPFNlbGVjdE1haWxBZGRyZXNzRm9ybUF0dHJzPik6IENoaWxkcmVuIHtcblx0XHQvLyB0aGlzIGlzIGEgc2VtaS1nb29kIGhhY2sgdG8gcmVzZXQgdGhlIHVzZXJuYW1lIGFmdGVyIHRoZSB1c2VyIHByZXNzZWQgXCJva1wiXG5cdFx0Ly8gdGhpcyBiZWhhdmlvciBpcyBub3QgbmVjZXNzYXJpbHkgZXhwZWN0ZWQsIGUuZy4gaWYgdGhlIHVzZXIgZW50ZXJzIGFuIGludmFsaWQgZW1haWwgYWRkcmVzcyBhbmQgcHJlc3NlcyBcIm9rXCIgd2UgbWlnaHQgbm90IHdhbnQgdG8gY2xlYXIgdGhlXG5cdFx0Ly8gdXNlcm5hbWUgZmllbGQuIHdlIHdvdWxkIG5lZWQgdG8gZmluZCBhIHdheSB0byBjbGVhciB0aGUgZmllbGQgZnJvbSB0aGUgb3V0c2lkZSB0byBzb2x2ZSB0aGlzLlxuXHRcdGlmIChhdHRycy5pbmplY3Rpb25zUmlnaHRCdXR0b25BdHRycz8uY2xpY2spIHtcblx0XHRcdGNvbnN0IG9yaWdpbmFsQ2FsbGJhY2sgPSBhdHRycy5pbmplY3Rpb25zUmlnaHRCdXR0b25BdHRycy5jbGlja1xuXG5cdFx0XHRhdHRycy5pbmplY3Rpb25zUmlnaHRCdXR0b25BdHRycy5jbGljayA9IChldmVudCwgZG9tKSA9PiB7XG5cdFx0XHRcdG9yaWdpbmFsQ2FsbGJhY2soZXZlbnQsIGRvbSlcblx0XHRcdFx0dGhpcy51c2VybmFtZSA9IFwiXCJcblx0XHRcdFx0dGhpcy5tZXNzYWdlSWQgPSBcIm1haWxBZGRyZXNzTmV1dHJhbF9tc2dcIlxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBtKFRleHRGaWVsZCwge1xuXHRcdFx0bGFiZWw6IFwibWFpbEFkZHJlc3NfbGFiZWxcIixcblx0XHRcdHZhbHVlOiB0aGlzLnVzZXJuYW1lLFxuXHRcdFx0YWxpZ25SaWdodDogdHJ1ZSxcblx0XHRcdGF1dG9jb21wbGV0ZUFzOiBBdXRvY29tcGxldGUubmV3UGFzc3dvcmQsXG5cdFx0XHRhdXRvY2FwaXRhbGl6ZTogQXV0b2NhcGl0YWxpemUubm9uZSxcblx0XHRcdGhlbHBMYWJlbDogKCkgPT4gdGhpcy5hZGRyZXNzSGVscExhYmVsKCksXG5cdFx0XHRmb250U2l6ZTogcHgoc2l6ZS5mb250X3NpemVfc21hbGxlciksXG5cdFx0XHRvbmlucHV0OiAodmFsdWUpID0+IHtcblx0XHRcdFx0dGhpcy51c2VybmFtZSA9IHZhbHVlXG5cdFx0XHRcdHRoaXMudmVyaWZ5TWFpbEFkZHJlc3MoYXR0cnMpXG5cdFx0XHR9LFxuXHRcdFx0aW5qZWN0aW9uc1JpZ2h0OiAoKSA9PiBbXG5cdFx0XHRcdG0oXG5cdFx0XHRcdFx0XCIuZmxleC5pdGVtcy1lbmQuYWxpZ24tc2VsZi1lbmRcIixcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRzdHlsZToge1xuXHRcdFx0XHRcdFx0XHRcInBhZGRpbmctYm90dG9tXCI6IFwiMXB4XCIsXG5cdFx0XHRcdFx0XHRcdGZsZXg6IFwiMSAxIGF1dG9cIixcblx0XHRcdFx0XHRcdFx0Zm9udFNpemU6IHB4KHNpemUuZm9udF9zaXplX3NtYWxsZXIpLFxuXHRcdFx0XHRcdFx0XHRsaW5lSGVpZ2h0OiBweChpbnB1dExpbmVIZWlnaHQpLFxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGBAJHthdHRycy5zZWxlY3RlZERvbWFpbi5kb21haW59YCxcblx0XHRcdFx0KSxcblx0XHRcdFx0YXR0cnMuYXZhaWxhYmxlRG9tYWlucy5sZW5ndGggPiAxXG5cdFx0XHRcdFx0PyBtKFxuXHRcdFx0XHRcdFx0XHRJY29uQnV0dG9uLFxuXHRcdFx0XHRcdFx0XHRhdHRhY2hEcm9wZG93bih7XG5cdFx0XHRcdFx0XHRcdFx0bWFpbkJ1dHRvbkF0dHJzOiB7XG5cdFx0XHRcdFx0XHRcdFx0XHR0aXRsZTogXCJkb21haW5fbGFiZWxcIixcblx0XHRcdFx0XHRcdFx0XHRcdGljb246IEJvb3RJY29ucy5FeHBhbmQsXG5cdFx0XHRcdFx0XHRcdFx0XHRzaXplOiBCdXR0b25TaXplLkNvbXBhY3QsXG5cdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHRjaGlsZEF0dHJzOiAoKSA9PiBhdHRycy5hdmFpbGFibGVEb21haW5zLm1hcCgoZG9tYWluKSA9PiB0aGlzLmNyZWF0ZURyb3Bkb3duSXRlbUF0dHJzKGRvbWFpbiwgYXR0cnMpKSxcblx0XHRcdFx0XHRcdFx0XHRzaG93RHJvcGRvd246ICgpID0+IHRydWUsXG5cdFx0XHRcdFx0XHRcdFx0d2lkdGg6IDI1MCxcblx0XHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0ICApXG5cdFx0XHRcdFx0OiBhdHRycy5pbmplY3Rpb25zUmlnaHRCdXR0b25BdHRyc1xuXHRcdFx0XHRcdD8gbShJY29uQnV0dG9uLCBhdHRycy5pbmplY3Rpb25zUmlnaHRCdXR0b25BdHRycylcblx0XHRcdFx0XHQ6IG51bGwsXG5cdFx0XHRdLFxuXHRcdH0pXG5cdH1cblxuXHRwcml2YXRlIGdldENsZWFuTWFpbEFkZHJlc3MoYXR0cnM6IFNlbGVjdE1haWxBZGRyZXNzRm9ybUF0dHJzKSB7XG5cdFx0cmV0dXJuIGZvcm1hdE1haWxBZGRyZXNzRnJvbVBhcnRzKHRoaXMudXNlcm5hbWUsIGF0dHJzLnNlbGVjdGVkRG9tYWluLmRvbWFpbilcblx0fVxuXG5cdHByaXZhdGUgYWRkcmVzc0hlbHBMYWJlbCgpOiBDaGlsZHJlbiB7XG5cdFx0cmV0dXJuIHRoaXMuaXNWZXJpZmljYXRpb25CdXN5XG5cdFx0XHQ/IG0oXCIuZmxleC5pdGVtcy1jZW50ZXIubXQtc1wiLCBbdGhpcy5wcm9ncmVzc0ljb24oKSwgbGFuZy5nZXQoXCJtYWlsQWRkcmVzc0J1c3lfbXNnXCIpXSlcblx0XHRcdDogbShcIi5tdC1zXCIsIGxhbmcuZ2V0KHRoaXMubWVzc2FnZUlkID8/IFZBTElEX01FU1NBR0VfSUQpKVxuXHR9XG5cblx0cHJpdmF0ZSBwcm9ncmVzc0ljb24oKTogQ2hpbGRyZW4ge1xuXHRcdHJldHVybiBtKEljb24sIHtcblx0XHRcdGljb246IEJvb3RJY29ucy5Qcm9ncmVzcyxcblx0XHRcdGNsYXNzOiBcImljb24tcHJvZ3Jlc3MgbXItc1wiLFxuXHRcdH0pXG5cdH1cblxuXHRwcml2YXRlIGNyZWF0ZURyb3Bkb3duSXRlbUF0dHJzKGRvbWFpbkRhdGE6IEVtYWlsRG9tYWluRGF0YSwgYXR0cnM6IFNlbGVjdE1haWxBZGRyZXNzRm9ybUF0dHJzKTogRHJvcGRvd25CdXR0b25BdHRycyB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGxhYmVsOiBsYW5nLm1ha2VUcmFuc2xhdGlvbihcImRvbWFpblwiLCBkb21haW5EYXRhLmRvbWFpbiksXG5cdFx0XHRjbGljazogKCkgPT4ge1xuXHRcdFx0XHRhdHRycy5vbkRvbWFpbkNoYW5nZWQoZG9tYWluRGF0YSlcblx0XHRcdH0sXG5cdFx0XHRpY29uOiBkb21haW5EYXRhLmlzUGFpZCA/IEJvb3RJY29ucy5QcmVtaXVtIDogdW5kZWZpbmVkLFxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgb25CdXN5U3RhdGVDaGFuZ2VkKGlzQnVzeTogYm9vbGVhbiwgb25CdXN5U3RhdGVDaGFuZ2VkOiAoYXJnMDogYm9vbGVhbikgPT4gdW5rbm93bik6IHZvaWQge1xuXHRcdHRoaXMuaXNWZXJpZmljYXRpb25CdXN5ID0gaXNCdXN5XG5cdFx0b25CdXN5U3RhdGVDaGFuZ2VkKGlzQnVzeSlcblx0XHRtLnJlZHJhdygpXG5cdH1cblxuXHRwcml2YXRlIG9uVmFsaWRhdGlvbkZpbmlzaGVkKFxuXHRcdGVtYWlsOiBzdHJpbmcsXG5cdFx0dmFsaWRhdGlvblJlc3VsdDogVmFsaWRhdGlvblJlc3VsdCxcblx0XHRvblZhbGlkYXRpb25SZXN1bHQ6IFNlbGVjdE1haWxBZGRyZXNzRm9ybUF0dHJzW1wib25WYWxpZGF0aW9uUmVzdWx0XCJdLFxuXHQpOiB2b2lkIHtcblx0XHR0aGlzLm1lc3NhZ2VJZCA9IHZhbGlkYXRpb25SZXN1bHQuZXJyb3JJZFxuXHRcdG9uVmFsaWRhdGlvblJlc3VsdChlbWFpbCwgdmFsaWRhdGlvblJlc3VsdClcblx0fVxuXG5cdHByaXZhdGUgdmVyaWZ5TWFpbEFkZHJlc3MoYXR0cnM6IFNlbGVjdE1haWxBZGRyZXNzRm9ybUF0dHJzKSB7XG5cdFx0Y29uc3QgeyBvblZhbGlkYXRpb25SZXN1bHQsIG9uQnVzeVN0YXRlQ2hhbmdlZCB9ID0gYXR0cnNcblx0XHRpZiAodGhpcy5jaGVja0FkZHJlc3NUaW1lb3V0KSBjbGVhclRpbWVvdXQodGhpcy5jaGVja0FkZHJlc3NUaW1lb3V0KVxuXG5cdFx0Y29uc3QgY2xlYW5NYWlsQWRkcmVzcyA9IHRoaXMuZ2V0Q2xlYW5NYWlsQWRkcmVzcyhhdHRycylcblx0XHRjb25zdCBjbGVhblVzZXJuYW1lID0gdGhpcy51c2VybmFtZS50cmltKCkudG9Mb3dlckNhc2UoKVxuXG5cdFx0aWYgKGNsZWFuVXNlcm5hbWUgPT09IFwiXCIpIHtcblx0XHRcdHRoaXMub25WYWxpZGF0aW9uRmluaXNoZWQoXG5cdFx0XHRcdGNsZWFuTWFpbEFkZHJlc3MsXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpc1ZhbGlkOiBmYWxzZSxcblx0XHRcdFx0XHRlcnJvcklkOiBcIm1haWxBZGRyZXNzTmV1dHJhbF9tc2dcIixcblx0XHRcdFx0fSxcblx0XHRcdFx0b25WYWxpZGF0aW9uUmVzdWx0LFxuXHRcdFx0KVxuXHRcdFx0dGhpcy5vbkJ1c3lTdGF0ZUNoYW5nZWQoZmFsc2UsIG9uQnVzeVN0YXRlQ2hhbmdlZClcblxuXHRcdFx0cmV0dXJuXG5cdFx0fSBlbHNlIGlmICghaXNNYWlsQWRkcmVzcyhjbGVhbk1haWxBZGRyZXNzLCB0cnVlKSB8fCAoaXNUdXRhTWFpbEFkZHJlc3MoY2xlYW5NYWlsQWRkcmVzcykgJiYgY2xlYW5Vc2VybmFtZS5sZW5ndGggPCAzKSkge1xuXHRcdFx0dGhpcy5vblZhbGlkYXRpb25GaW5pc2hlZChcblx0XHRcdFx0Y2xlYW5NYWlsQWRkcmVzcyxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlzVmFsaWQ6IGZhbHNlLFxuXHRcdFx0XHRcdGVycm9ySWQ6IFwibWFpbEFkZHJlc3NJbnZhbGlkX21zZ1wiLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRvblZhbGlkYXRpb25SZXN1bHQsXG5cdFx0XHQpXG5cdFx0XHR0aGlzLm9uQnVzeVN0YXRlQ2hhbmdlZChmYWxzZSwgb25CdXN5U3RhdGVDaGFuZ2VkKVxuXG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cblx0XHR0aGlzLm9uQnVzeVN0YXRlQ2hhbmdlZCh0cnVlLCBvbkJ1c3lTdGF0ZUNoYW5nZWQpXG5cblx0XHR0aGlzLmNoZWNrQWRkcmVzc1RpbWVvdXQgPSBzZXRUaW1lb3V0KGFzeW5jICgpID0+IHtcblx0XHRcdGlmICh0aGlzLmdldENsZWFuTWFpbEFkZHJlc3MoYXR0cnMpICE9PSBjbGVhbk1haWxBZGRyZXNzKSByZXR1cm5cblxuXHRcdFx0bGV0IHJlc3VsdDogVmFsaWRhdGlvblJlc3VsdFxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Y29uc3QgYXZhaWxhYmxlID0gYXdhaXQgbG9jYXRvci5tYWlsQWRkcmVzc0ZhY2FkZS5pc01haWxBZGRyZXNzQXZhaWxhYmxlKGNsZWFuTWFpbEFkZHJlc3MpXG5cdFx0XHRcdHJlc3VsdCA9IGF2YWlsYWJsZVxuXHRcdFx0XHRcdD8geyBpc1ZhbGlkOiB0cnVlLCBlcnJvcklkOiBudWxsIH1cblx0XHRcdFx0XHQ6IHtcblx0XHRcdFx0XHRcdFx0aXNWYWxpZDogZmFsc2UsXG5cdFx0XHRcdFx0XHRcdGVycm9ySWQ6IGF0dHJzLm1haWxBZGRyZXNzTkFFcnJvciA/PyBcIm1haWxBZGRyZXNzTkFfbXNnXCIsXG5cdFx0XHRcdFx0ICB9XG5cdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdGlmIChlIGluc3RhbmNlb2YgQWNjZXNzRGVhY3RpdmF0ZWRFcnJvcikge1xuXHRcdFx0XHRcdHJlc3VsdCA9IHsgaXNWYWxpZDogZmFsc2UsIGVycm9ySWQ6IFwibWFpbEFkZHJlc3NEZWxheV9tc2dcIiB9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhyb3cgZVxuXHRcdFx0XHR9XG5cdFx0XHR9IGZpbmFsbHkge1xuXHRcdFx0XHRpZiAodGhpcy5nZXRDbGVhbk1haWxBZGRyZXNzKGF0dHJzKSA9PT0gY2xlYW5NYWlsQWRkcmVzcykge1xuXHRcdFx0XHRcdHRoaXMub25CdXN5U3RhdGVDaGFuZ2VkKGZhbHNlLCBvbkJ1c3lTdGF0ZUNoYW5nZWQpXG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKHRoaXMuZ2V0Q2xlYW5NYWlsQWRkcmVzcyhhdHRycykgPT09IGNsZWFuTWFpbEFkZHJlc3MpIHtcblx0XHRcdFx0dGhpcy5vblZhbGlkYXRpb25GaW5pc2hlZChjbGVhbk1haWxBZGRyZXNzLCByZXN1bHQsIG9uVmFsaWRhdGlvblJlc3VsdClcblx0XHRcdH1cblx0XHR9LCA1MDApXG5cdH1cbn1cbiIsImltcG9ydCB7IGxvY2F0b3IgfSBmcm9tIFwiLi4vYXBpL21haW4vQ29tbW9uTG9jYXRvci5qc1wiXG5pbXBvcnQgeyBSZWdpc3RyYXRpb25DYXB0Y2hhU2VydmljZSB9IGZyb20gXCIuLi9hcGkvZW50aXRpZXMvc3lzL1NlcnZpY2VzLmpzXCJcbmltcG9ydCB7IGNyZWF0ZVJlZ2lzdHJhdGlvbkNhcHRjaGFTZXJ2aWNlRGF0YSwgY3JlYXRlUmVnaXN0cmF0aW9uQ2FwdGNoYVNlcnZpY2VHZXREYXRhIH0gZnJvbSBcIi4uL2FwaS9lbnRpdGllcy9zeXMvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgZGV2aWNlQ29uZmlnIH0gZnJvbSBcIi4uL21pc2MvRGV2aWNlQ29uZmlnLmpzXCJcbmltcG9ydCB7IEFjY2Vzc0RlYWN0aXZhdGVkRXJyb3IsIEFjY2Vzc0V4cGlyZWRFcnJvciwgSW52YWxpZERhdGFFcnJvciB9IGZyb20gXCIuLi9hcGkvY29tbW9uL2Vycm9yL1Jlc3RFcnJvci5qc1wiXG5pbXBvcnQgeyBEaWFsb2csIERpYWxvZ1R5cGUgfSBmcm9tIFwiLi4vZ3VpL2Jhc2UvRGlhbG9nLmpzXCJcbmltcG9ydCB7IERpYWxvZ0hlYWRlckJhciwgRGlhbG9nSGVhZGVyQmFyQXR0cnMgfSBmcm9tIFwiLi4vZ3VpL2Jhc2UvRGlhbG9nSGVhZGVyQmFyLmpzXCJcbmltcG9ydCB7IEJ1dHRvblR5cGUgfSBmcm9tIFwiLi4vZ3VpL2Jhc2UvQnV0dG9uLmpzXCJcbmltcG9ydCB7IGxhbmcgfSBmcm9tIFwiLi4vbWlzYy9MYW5ndWFnZVZpZXdNb2RlbC5qc1wiXG5pbXBvcnQgbSwgeyBDaGlsZHJlbiB9IGZyb20gXCJtaXRocmlsXCJcbmltcG9ydCB7IFRleHRGaWVsZCB9IGZyb20gXCIuLi9ndWkvYmFzZS9UZXh0RmllbGQuanNcIlxuaW1wb3J0IHsgdWludDhBcnJheVRvQmFzZTY0IH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5pbXBvcnQgeyB0aGVtZSB9IGZyb20gXCIuLi9ndWkvdGhlbWVcIlxuaW1wb3J0IHsgZ2V0Q29sb3JMdW1pbmFuY2UsIGlzTW9ub2Nocm9tZSB9IGZyb20gXCIuLi9ndWkvYmFzZS9Db2xvclwiXG5cbi8qKlxuICogQWNjZXB0cyBtdWx0aXBsZSBmb3JtYXRzIGZvciBhIHRpbWUgb2YgZGF5IGFuZCBhbHdheXMgcmV0dXJucyAxMmgtZm9ybWF0IHdpdGggbGVhZGluZyB6ZXJvcy5cbiAqIEBwYXJhbSBjYXB0Y2hhSW5wdXRcbiAqIEByZXR1cm5zIHtzdHJpbmd9IEhIOk1NIGlmIHBhcnNlZCwgbnVsbCBvdGhlcndpc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQ2FwdGNoYUlucHV0KGNhcHRjaGFJbnB1dDogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG5cdGlmIChjYXB0Y2hhSW5wdXQubWF0Y2goL15bMC0yXT9bMC05XTpbMC01XT9bMC05XSQvKSkge1xuXHRcdGxldCBbaCwgbV0gPSBjYXB0Y2hhSW5wdXRcblx0XHRcdC50cmltKClcblx0XHRcdC5zcGxpdChcIjpcIilcblx0XHRcdC5tYXAoKHQpID0+IE51bWJlcih0KSlcblxuXHRcdC8vIHJlZ2V4IGNvcnJlY3RseSBtYXRjaGVzIDAtNTkgbWludXRlcywgYnV0IG1hdGNoZXMgaG91cnMgMC0yOSwgc28gd2UgbmVlZCB0byBtYWtlIHN1cmUgaG91cnMgaXMgMC0yNFxuXHRcdGlmIChoID4gMjQpIHtcblx0XHRcdHJldHVybiBudWxsXG5cdFx0fVxuXG5cdFx0cmV0dXJuIFtoICUgMTIsIG1dLm1hcCgoYSkgPT4gU3RyaW5nKGEpLnBhZFN0YXJ0KDIsIFwiMFwiKSkuam9pbihcIjpcIilcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gbnVsbFxuXHR9XG59XG5cbi8qKlxuICogQHJldHVybnMgdGhlIGF1dGggdG9rZW4gZm9yIHRoZSBzaWdudXAgaWYgdGhlIGNhcHRjaGEgd2FzIHNvbHZlZCBvciBubyBjYXB0Y2hhIHdhcyBuZWNlc3NhcnksIG51bGwgb3RoZXJ3aXNlXG4gKlxuICogVE9ETzpcbiAqICAqIFJlZmFjdG9yIHRva2VuIHVzYWdlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5DYXB0Y2hhRmxvdyhcblx0bWFpbEFkZHJlc3M6IHN0cmluZyxcblx0aXNCdXNpbmVzc1VzZTogYm9vbGVhbixcblx0aXNQYWlkU3Vic2NyaXB0aW9uOiBib29sZWFuLFxuXHRjYW1wYWlnblRva2VuOiBzdHJpbmcgfCBudWxsLFxuKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XG5cdHRyeSB7XG5cdFx0Y29uc3QgY2FwdGNoYVJldHVybiA9IGF3YWl0IGxvY2F0b3Iuc2VydmljZUV4ZWN1dG9yLmdldChcblx0XHRcdFJlZ2lzdHJhdGlvbkNhcHRjaGFTZXJ2aWNlLFxuXHRcdFx0Y3JlYXRlUmVnaXN0cmF0aW9uQ2FwdGNoYVNlcnZpY2VHZXREYXRhKHtcblx0XHRcdFx0dG9rZW46IGNhbXBhaWduVG9rZW4sXG5cdFx0XHRcdG1haWxBZGRyZXNzLFxuXHRcdFx0XHRzaWdudXBUb2tlbjogZGV2aWNlQ29uZmlnLmdldFNpZ251cFRva2VuKCksXG5cdFx0XHRcdGJ1c2luZXNzVXNlU2VsZWN0ZWQ6IGlzQnVzaW5lc3NVc2UsXG5cdFx0XHRcdHBhaWRTdWJzY3JpcHRpb25TZWxlY3RlZDogaXNQYWlkU3Vic2NyaXB0aW9uLFxuXHRcdFx0fSksXG5cdFx0KVxuXHRcdGlmIChjYXB0Y2hhUmV0dXJuLmNoYWxsZW5nZSkge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0cmV0dXJuIGF3YWl0IHNob3dDYXB0Y2hhRGlhbG9nKGNhcHRjaGFSZXR1cm4uY2hhbGxlbmdlLCBjYXB0Y2hhUmV0dXJuLnRva2VuKVxuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRpZiAoZSBpbnN0YW5jZW9mIEludmFsaWREYXRhRXJyb3IpIHtcblx0XHRcdFx0XHRhd2FpdCBEaWFsb2cubWVzc2FnZShcImNyZWF0ZUFjY291bnRJbnZhbGlkQ2FwdGNoYV9tc2dcIilcblx0XHRcdFx0XHRyZXR1cm4gcnVuQ2FwdGNoYUZsb3cobWFpbEFkZHJlc3MsIGlzQnVzaW5lc3NVc2UsIGlzUGFpZFN1YnNjcmlwdGlvbiwgY2FtcGFpZ25Ub2tlbilcblx0XHRcdFx0fSBlbHNlIGlmIChlIGluc3RhbmNlb2YgQWNjZXNzRXhwaXJlZEVycm9yKSB7XG5cdFx0XHRcdFx0YXdhaXQgRGlhbG9nLm1lc3NhZ2UoXCJjcmVhdGVBY2NvdW50QWNjZXNzRGVhY3RpdmF0ZWRfbXNnXCIpXG5cdFx0XHRcdFx0cmV0dXJuIG51bGxcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aHJvdyBlXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGNhcHRjaGFSZXR1cm4udG9rZW5cblx0XHR9XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRpZiAoZSBpbnN0YW5jZW9mIEFjY2Vzc0RlYWN0aXZhdGVkRXJyb3IpIHtcblx0XHRcdGF3YWl0IERpYWxvZy5tZXNzYWdlKFwiY3JlYXRlQWNjb3VudEFjY2Vzc0RlYWN0aXZhdGVkX21zZ1wiKVxuXHRcdFx0cmV0dXJuIG51bGxcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgZVxuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBzaG93Q2FwdGNoYURpYWxvZyhjaGFsbGVuZ2U6IFVpbnQ4QXJyYXksIHRva2VuOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcblx0cmV0dXJuIG5ldyBQcm9taXNlPHN0cmluZyB8IG51bGw+KChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRsZXQgZGlhbG9nOiBEaWFsb2dcblx0XHRsZXQgY2FwdGNoYUlucHV0ID0gXCJcIlxuXG5cdFx0Y29uc3QgY2FuY2VsQWN0aW9uID0gKCkgPT4ge1xuXHRcdFx0ZGlhbG9nLmNsb3NlKClcblx0XHRcdHJlc29sdmUobnVsbClcblx0XHR9XG5cblx0XHRjb25zdCBva0FjdGlvbiA9ICgpID0+IHtcblx0XHRcdGxldCBwYXJzZWRJbnB1dCA9IHBhcnNlQ2FwdGNoYUlucHV0KGNhcHRjaGFJbnB1dClcblxuXHRcdFx0Ly8gVXNlciBlbnRlcmVkIGFuIGluY29ycmVjdGx5IGZvcm1hdHRlZCB0aW1lXG5cdFx0XHRpZiAocGFyc2VkSW5wdXQgPT0gbnVsbCkge1xuXHRcdFx0XHREaWFsb2cubWVzc2FnZShcImNhcHRjaGFFbnRlcl9tc2dcIilcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHR9XG5cblx0XHRcdC8vIFRoZSB1c2VyIGVudGVyZWQgYSBjb3JyZWN0bHkgZm9ybWF0dGVkIHRpbWUsIGJ1dCBub3Qgb25lIHRoYXQgb3VyIGNhcHRjaGEgd2lsbCBldmVyIGdpdmUgb3V0IChpLmUuIG5vdCAqMCBvciAqNSlcblx0XHRcdGNvbnN0IG1pbnV0ZU9uZXNQbGFjZSA9IHBhcnNlZElucHV0W3BhcnNlZElucHV0Lmxlbmd0aCAtIDFdXG5cdFx0XHRpZiAobWludXRlT25lc1BsYWNlICE9PSBcIjBcIiAmJiBtaW51dGVPbmVzUGxhY2UgIT09IFwiNVwiKSB7XG5cdFx0XHRcdERpYWxvZy5tZXNzYWdlKFwiY3JlYXRlQWNjb3VudEludmFsaWRDYXB0Y2hhX21zZ1wiKVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdH1cblxuXHRcdFx0ZGlhbG9nLmNsb3NlKClcblx0XHRcdGxvY2F0b3Iuc2VydmljZUV4ZWN1dG9yXG5cdFx0XHRcdC5wb3N0KFJlZ2lzdHJhdGlvbkNhcHRjaGFTZXJ2aWNlLCBjcmVhdGVSZWdpc3RyYXRpb25DYXB0Y2hhU2VydmljZURhdGEoeyB0b2tlbiwgcmVzcG9uc2U6IHBhcnNlZElucHV0IH0pKVxuXHRcdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0cmVzb2x2ZSh0b2tlbilcblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKChlKSA9PiB7XG5cdFx0XHRcdFx0cmVqZWN0KGUpXG5cdFx0XHRcdH0pXG5cdFx0fVxuXG5cdFx0bGV0IGFjdGlvbkJhckF0dHJzOiBEaWFsb2dIZWFkZXJCYXJBdHRycyA9IHtcblx0XHRcdGxlZnQ6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxhYmVsOiBcImNhbmNlbF9hY3Rpb25cIixcblx0XHRcdFx0XHRjbGljazogY2FuY2VsQWN0aW9uLFxuXHRcdFx0XHRcdHR5cGU6IEJ1dHRvblR5cGUuU2Vjb25kYXJ5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHRcdHJpZ2h0OiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsYWJlbDogXCJva19hY3Rpb25cIixcblx0XHRcdFx0XHRjbGljazogb2tBY3Rpb24sXG5cdFx0XHRcdFx0dHlwZTogQnV0dG9uVHlwZS5QcmltYXJ5LFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHRcdG1pZGRsZTogXCJjYXB0Y2hhRGlzcGxheV9sYWJlbFwiLFxuXHRcdH1cblx0XHRjb25zdCBpbWFnZURhdGEgPSBgZGF0YTppbWFnZS9wbmc7YmFzZTY0LCR7dWludDhBcnJheVRvQmFzZTY0KGNoYWxsZW5nZSl9YFxuXG5cdFx0ZGlhbG9nID0gbmV3IERpYWxvZyhEaWFsb2dUeXBlLkVkaXRTbWFsbCwge1xuXHRcdFx0dmlldzogKCk6IENoaWxkcmVuID0+IHtcblx0XHRcdFx0Ly8gVGhlIGNhcHRjaGEgaXMgYmxhY2stb24td2hpdGUsIHdoaWNoIHdpbGwgbm90IGxvb2sgY29ycmVjdCBvbiBhbnl0aGluZyB3aGVyZSB0aGUgYmFja2dyb3VuZCBpcyBub3Rcblx0XHRcdFx0Ly8gd2hpdGUuIFdlIGNhbiB1c2UgQ1NTIGZpbHRlcnMgdG8gZml4IHRoaXMuXG5cdFx0XHRcdGxldCBjYXB0Y2hhRmlsdGVyID0ge31cblx0XHRcdFx0aWYgKHRoZW1lLmVsZXZhdGVkX2JnICE9IG51bGwgJiYgaXNNb25vY2hyb21lKHRoZW1lLmVsZXZhdGVkX2JnKSkge1xuXHRcdFx0XHRcdGNhcHRjaGFGaWx0ZXIgPSB7XG5cdFx0XHRcdFx0XHRmaWx0ZXI6IGBpbnZlcnQoJHsxLjAgLSBnZXRDb2xvckx1bWluYW5jZSh0aGVtZS5lbGV2YXRlZF9iZyl9YCxcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIFtcblx0XHRcdFx0XHRtKERpYWxvZ0hlYWRlckJhciwgYWN0aW9uQmFyQXR0cnMpLFxuXHRcdFx0XHRcdG0oXCIucGxyLWwucGJcIiwgW1xuXHRcdFx0XHRcdFx0bShcImltZy5wdC1tbC5jZW50ZXItaC5ibG9ja1wiLCB7XG5cdFx0XHRcdFx0XHRcdHNyYzogaW1hZ2VEYXRhLFxuXHRcdFx0XHRcdFx0XHRhbHQ6IGxhbmcuZ2V0KFwiY2FwdGNoYURpc3BsYXlfbGFiZWxcIiksXG5cdFx0XHRcdFx0XHRcdHN0eWxlOiBjYXB0Y2hhRmlsdGVyLFxuXHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0XHRtKFRleHRGaWVsZCwge1xuXHRcdFx0XHRcdFx0XHRsYWJlbDogbGFuZy5tYWtlVHJhbnNsYXRpb24oXCJjYXB0Y2hhX2lucHV0XCIsIGxhbmcuZ2V0KFwiY2FwdGNoYUlucHV0X2xhYmVsXCIpICsgXCIgKGhoOm1tKVwiKSxcblx0XHRcdFx0XHRcdFx0aGVscExhYmVsOiAoKSA9PiBsYW5nLmdldChcImNhcHRjaGFJbmZvX21zZ1wiKSxcblx0XHRcdFx0XHRcdFx0dmFsdWU6IGNhcHRjaGFJbnB1dCxcblx0XHRcdFx0XHRcdFx0b25pbnB1dDogKHZhbHVlKSA9PiAoY2FwdGNoYUlucHV0ID0gdmFsdWUpLFxuXHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0XSksXG5cdFx0XHRcdF1cblx0XHRcdH0sXG5cdFx0fSlcblx0XHRcdC5zZXRDbG9zZUhhbmRsZXIoY2FuY2VsQWN0aW9uKVxuXHRcdFx0LnNob3coKVxuXHR9KVxufVxuIiwiaW1wb3J0IG0sIHsgQ2hpbGRyZW4sIENvbXBvbmVudCwgVm5vZGUgfSBmcm9tIFwibWl0aHJpbFwiXG5pbXBvcnQgc3RyZWFtIGZyb20gXCJtaXRocmlsL3N0cmVhbVwiXG5pbXBvcnQgU3RyZWFtIGZyb20gXCJtaXRocmlsL3N0cmVhbVwiXG5pbXBvcnQgeyBEaWFsb2cgfSBmcm9tIFwiLi4vZ3VpL2Jhc2UvRGlhbG9nXCJcbmltcG9ydCB7IEF1dG9jb21wbGV0ZSwgVGV4dEZpZWxkIH0gZnJvbSBcIi4uL2d1aS9iYXNlL1RleHRGaWVsZC5qc1wiXG5pbXBvcnQgeyBnZXRXaGl0ZWxhYmVsUmVnaXN0cmF0aW9uRG9tYWlucyB9IGZyb20gXCIuLi9sb2dpbi9Mb2dpblZpZXcuanNcIlxuaW1wb3J0IHR5cGUgeyBOZXdBY2NvdW50RGF0YSB9IGZyb20gXCIuL1VwZ3JhZGVTdWJzY3JpcHRpb25XaXphcmRcIlxuaW1wb3J0IHsgU2VsZWN0TWFpbEFkZHJlc3NGb3JtLCBTZWxlY3RNYWlsQWRkcmVzc0Zvcm1BdHRycyB9IGZyb20gXCIuLi8uLi9jb21tb24vc2V0dGluZ3MvU2VsZWN0TWFpbEFkZHJlc3NGb3JtLmpzXCJcbmltcG9ydCB7XG5cdEFjY291bnRUeXBlLFxuXHRERUZBVUxUX0ZSRUVfTUFJTF9BRERSRVNTX1NJR05VUF9ET01BSU4sXG5cdERFRkFVTFRfUEFJRF9NQUlMX0FERFJFU1NfU0lHTlVQX0RPTUFJTixcblx0VFVUQV9NQUlMX0FERFJFU1NfU0lHTlVQX0RPTUFJTlMsXG59IGZyb20gXCIuLi9hcGkvY29tbW9uL1R1dGFub3RhQ29uc3RhbnRzXCJcblxuaW1wb3J0IHR5cGUgeyBDaGVja2JveEF0dHJzIH0gZnJvbSBcIi4uL2d1aS9iYXNlL0NoZWNrYm94LmpzXCJcbmltcG9ydCB7IENoZWNrYm94IH0gZnJvbSBcIi4uL2d1aS9iYXNlL0NoZWNrYm94LmpzXCJcbmltcG9ydCB0eXBlIHsgbGF6eSB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHsgZ2V0Rmlyc3RPclRocm93LCBvZkNsYXNzIH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5pbXBvcnQgdHlwZSB7IFRyYW5zbGF0aW9uS2V5IH0gZnJvbSBcIi4uL21pc2MvTGFuZ3VhZ2VWaWV3TW9kZWxcIlxuaW1wb3J0IHsgSW5mb0xpbmssIGxhbmcgfSBmcm9tIFwiLi4vbWlzYy9MYW5ndWFnZVZpZXdNb2RlbFwiXG5pbXBvcnQgeyBzaG93UHJvZ3Jlc3NEaWFsb2cgfSBmcm9tIFwiLi4vZ3VpL2RpYWxvZ3MvUHJvZ3Jlc3NEaWFsb2dcIlxuaW1wb3J0IHsgSW52YWxpZERhdGFFcnJvciB9IGZyb20gXCIuLi9hcGkvY29tbW9uL2Vycm9yL1Jlc3RFcnJvclwiXG5pbXBvcnQgeyBsb2NhdG9yIH0gZnJvbSBcIi4uL2FwaS9tYWluL0NvbW1vbkxvY2F0b3JcIlxuaW1wb3J0IHsgQ1VSUkVOVF9QUklWQUNZX1ZFUlNJT04sIENVUlJFTlRfVEVSTVNfVkVSU0lPTiwgcmVuZGVyVGVybXNBbmRDb25kaXRpb25zQnV0dG9uLCBUZXJtc1NlY3Rpb24gfSBmcm9tIFwiLi9UZXJtc0FuZENvbmRpdGlvbnNcIlxuaW1wb3J0IHsgVXNhZ2VUZXN0IH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11c2FnZXRlc3RzXCJcbmltcG9ydCB7IHJ1bkNhcHRjaGFGbG93IH0gZnJvbSBcIi4vQ2FwdGNoYS5qc1wiXG5pbXBvcnQgeyBFbWFpbERvbWFpbkRhdGEsIGlzUGFpZFBsYW5Eb21haW4gfSBmcm9tIFwiLi4vc2V0dGluZ3MvbWFpbGFkZHJlc3MvTWFpbEFkZHJlc3Nlc1V0aWxzLmpzXCJcbmltcG9ydCB7IExvZ2luQnV0dG9uIH0gZnJvbSBcIi4uL2d1aS9iYXNlL2J1dHRvbnMvTG9naW5CdXR0b24uanNcIlxuaW1wb3J0IHsgRXh0ZXJuYWxMaW5rIH0gZnJvbSBcIi4uL2d1aS9iYXNlL0V4dGVybmFsTGluay5qc1wiXG5pbXBvcnQgeyBQYXNzd29yZEZvcm0sIFBhc3N3b3JkTW9kZWwgfSBmcm9tIFwiLi4vc2V0dGluZ3MvUGFzc3dvcmRGb3JtLmpzXCJcbmltcG9ydCB7IGNsaWVudCB9IGZyb20gXCIuLi9taXNjL0NsaWVudERldGVjdG9yXCJcbmltcG9ydCB7IFN1YnNjcmlwdGlvbkFwcCB9IGZyb20gXCIuL1N1YnNjcmlwdGlvblZpZXdlclwiXG5cbmV4cG9ydCB0eXBlIFNpZ251cEZvcm1BdHRycyA9IHtcblx0LyoqIEhhbmRsZSBhIG5ldyBhY2NvdW50IHNpZ251cC4gaWYgcmVhZG9ubHkgdGhlbiB0aGUgYXJndW1lbnQgd2lsbCBhbHdheXMgYmUgbnVsbCAqL1xuXHRvbkNvbXBsZXRlOiAoYXJnMDogTmV3QWNjb3VudERhdGEgfCBudWxsKSA9PiB2b2lkXG5cdG9uQ2hhbmdlUGxhbjogKCkgPT4gdm9pZFxuXHRpc0J1c2luZXNzVXNlOiBsYXp5PGJvb2xlYW4+XG5cdGlzUGFpZFN1YnNjcmlwdGlvbjogbGF6eTxib29sZWFuPlxuXHRjYW1wYWlnbjogbGF6eTxzdHJpbmcgfCBudWxsPlxuXHQvLyBvbmx5IHVzZWQgaWYgcmVhZG9ubHkgaXMgdHJ1ZVxuXHRwcmVmaWxsZWRNYWlsQWRkcmVzcz86IHN0cmluZyB8IHVuZGVmaW5lZFxuXHRyZWFkb25seTogYm9vbGVhblxufVxuXG5leHBvcnQgY2xhc3MgU2lnbnVwRm9ybSBpbXBsZW1lbnRzIENvbXBvbmVudDxTaWdudXBGb3JtQXR0cnM+IHtcblx0cHJpdmF0ZSByZWFkb25seSBwYXNzd29yZE1vZGVsOiBQYXNzd29yZE1vZGVsXG5cdHByaXZhdGUgcmVhZG9ubHkgX2NvbmZpcm1UZXJtczogU3RyZWFtPGJvb2xlYW4+XG5cdHByaXZhdGUgcmVhZG9ubHkgX2NvbmZpcm1BZ2U6IFN0cmVhbTxib29sZWFuPlxuXHRwcml2YXRlIHJlYWRvbmx5IF9jb2RlOiBTdHJlYW08c3RyaW5nPlxuXHRwcml2YXRlIHNlbGVjdGVkRG9tYWluOiBFbWFpbERvbWFpbkRhdGFcblx0cHJpdmF0ZSBfbWFpbEFkZHJlc3NGb3JtRXJyb3JJZDogVHJhbnNsYXRpb25LZXkgfCBudWxsID0gbnVsbFxuXHRwcml2YXRlIF9tYWlsQWRkcmVzcyE6IHN0cmluZ1xuXHRwcml2YXRlIF9pc01haWxWZXJpZmljYXRpb25CdXN5OiBib29sZWFuXG5cdHByaXZhdGUgcmVhZG9ubHkgX19tYWlsVmFsaWQ6IFN0cmVhbTxib29sZWFuPlxuXHRwcml2YXRlIHJlYWRvbmx5IF9fbGFzdE1haWxWYWxpZGF0aW9uRXJyb3I6IFN0cmVhbTxUcmFuc2xhdGlvbktleSB8IG51bGw+XG5cdHByaXZhdGUgX19zaWdudXBGcmVlVGVzdD86IFVzYWdlVGVzdFxuXHRwcml2YXRlIF9fc2lnbnVwUGFpZFRlc3Q/OiBVc2FnZVRlc3RcblxuXHRwcml2YXRlIHJlYWRvbmx5IGF2YWlsYWJsZURvbWFpbnM6IHJlYWRvbmx5IEVtYWlsRG9tYWluRGF0YVtdID0gKGxvY2F0b3IuZG9tYWluQ29uZmlnUHJvdmlkZXIoKS5nZXRDdXJyZW50RG9tYWluQ29uZmlnKCkuZmlyc3RQYXJ0eURvbWFpblxuXHRcdD8gVFVUQV9NQUlMX0FERFJFU1NfU0lHTlVQX0RPTUFJTlNcblx0XHQ6IGdldFdoaXRlbGFiZWxSZWdpc3RyYXRpb25Eb21haW5zKClcblx0KS5tYXAoKGRvbWFpbikgPT4gKHsgZG9tYWluLCBpc1BhaWQ6IGlzUGFpZFBsYW5Eb21haW4oZG9tYWluKSB9KSlcblxuXHRjb25zdHJ1Y3Rvcih2bm9kZTogVm5vZGU8U2lnbnVwRm9ybUF0dHJzPikge1xuXHRcdHRoaXMuc2VsZWN0ZWREb21haW4gPSBnZXRGaXJzdE9yVGhyb3codGhpcy5hdmFpbGFibGVEb21haW5zKVxuXHRcdC8vIHR1dGEuY29tIGdldHMgcHJlZmVyZW5jZSB1c2VyIGlzIHNpZ25pbmcgdXAgZm9yIGEgcGFpZCBhY2NvdW50IGFuZCBpdCBpcyBhdmFpbGFibGVcblx0XHRpZiAodm5vZGUuYXR0cnMuaXNQYWlkU3Vic2NyaXB0aW9uKCkpIHtcblx0XHRcdHRoaXMuc2VsZWN0ZWREb21haW4gPSB0aGlzLmF2YWlsYWJsZURvbWFpbnMuZmluZCgoZG9tYWluKSA9PiBkb21haW4uZG9tYWluID09PSBERUZBVUxUX1BBSURfTUFJTF9BRERSRVNTX1NJR05VUF9ET01BSU4pID8/IHRoaXMuc2VsZWN0ZWREb21haW5cblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5zZWxlY3RlZERvbWFpbiA9IHRoaXMuYXZhaWxhYmxlRG9tYWlucy5maW5kKChkb21haW4pID0+IGRvbWFpbi5kb21haW4gPT09IERFRkFVTFRfRlJFRV9NQUlMX0FERFJFU1NfU0lHTlVQX0RPTUFJTikgPz8gdGhpcy5zZWxlY3RlZERvbWFpblxuXHRcdH1cblxuXHRcdHRoaXMuX19tYWlsVmFsaWQgPSBzdHJlYW0oZmFsc2UpXG5cdFx0dGhpcy5fX2xhc3RNYWlsVmFsaWRhdGlvbkVycm9yID0gc3RyZWFtKG51bGwpXG5cdFx0dGhpcy5wYXNzd29yZE1vZGVsID0gbmV3IFBhc3N3b3JkTW9kZWwoXG5cdFx0XHRsb2NhdG9yLnVzYWdlVGVzdENvbnRyb2xsZXIsXG5cdFx0XHRsb2NhdG9yLmxvZ2lucyxcblx0XHRcdHtcblx0XHRcdFx0Y2hlY2tPbGRQYXNzd29yZDogZmFsc2UsXG5cdFx0XHRcdGVuZm9yY2VTdHJlbmd0aDogdHJ1ZSxcblx0XHRcdFx0cmVzZXJ2ZWRTdHJpbmdzOiAoKSA9PiAodGhpcy5fbWFpbEFkZHJlc3MgPyBbdGhpcy5fbWFpbEFkZHJlc3Muc3BsaXQoXCJAXCIpWzBdXSA6IFtdKSxcblx0XHRcdH0sXG5cdFx0XHR0aGlzLl9fbWFpbFZhbGlkLFxuXHRcdClcblxuXHRcdHRoaXMuX19zaWdudXBGcmVlVGVzdCA9IGxvY2F0b3IudXNhZ2VUZXN0Q29udHJvbGxlci5nZXRUZXN0KFwic2lnbnVwLmZyZWVcIilcblx0XHR0aGlzLl9fc2lnbnVwUGFpZFRlc3QgPSBsb2NhdG9yLnVzYWdlVGVzdENvbnRyb2xsZXIuZ2V0VGVzdChcInNpZ251cC5wYWlkXCIpXG5cblx0XHR0aGlzLl9jb25maXJtVGVybXMgPSBzdHJlYW08Ym9vbGVhbj4oZmFsc2UpXG5cdFx0dGhpcy5fY29uZmlybUFnZSA9IHN0cmVhbTxib29sZWFuPihmYWxzZSlcblx0XHR0aGlzLl9jb2RlID0gc3RyZWFtKFwiXCIpXG5cdFx0dGhpcy5faXNNYWlsVmVyaWZpY2F0aW9uQnVzeSA9IGZhbHNlXG5cdFx0dGhpcy5fbWFpbEFkZHJlc3NGb3JtRXJyb3JJZCA9IFwibWFpbEFkZHJlc3NOZXV0cmFsX21zZ1wiXG5cdH1cblxuXHR2aWV3KHZub2RlOiBWbm9kZTxTaWdudXBGb3JtQXR0cnM+KTogQ2hpbGRyZW4ge1xuXHRcdGNvbnN0IGEgPSB2bm9kZS5hdHRyc1xuXG5cdFx0Y29uc3QgbWFpbEFkZHJlc3NGb3JtQXR0cnM6IFNlbGVjdE1haWxBZGRyZXNzRm9ybUF0dHJzID0ge1xuXHRcdFx0c2VsZWN0ZWREb21haW46IHRoaXMuc2VsZWN0ZWREb21haW4sXG5cdFx0XHRvbkRvbWFpbkNoYW5nZWQ6IChkb21haW4pID0+IHtcblx0XHRcdFx0aWYgKCFkb21haW4uaXNQYWlkIHx8IGEuaXNQYWlkU3Vic2NyaXB0aW9uKCkpIHtcblx0XHRcdFx0XHR0aGlzLnNlbGVjdGVkRG9tYWluID0gZG9tYWluXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0RGlhbG9nLmNvbmZpcm0obGFuZy5tYWtlVHJhbnNsYXRpb24oXCJjb25maXJtX21zZ1wiLCBgJHtsYW5nLmdldChcInBhaWRFbWFpbERvbWFpblNpZ251cF9tc2dcIil9XFxuJHtsYW5nLmdldChcImNoYW5nZVBhaWRQbGFuX21zZ1wiKX1gKSkudGhlbihcblx0XHRcdFx0XHRcdChjb25maXJtZWQpID0+IHtcblx0XHRcdFx0XHRcdFx0aWYgKGNvbmZpcm1lZCkge1xuXHRcdFx0XHRcdFx0XHRcdHZub2RlLmF0dHJzLm9uQ2hhbmdlUGxhbigpXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0YXZhaWxhYmxlRG9tYWluczogdGhpcy5hdmFpbGFibGVEb21haW5zLFxuXHRcdFx0b25WYWxpZGF0aW9uUmVzdWx0OiAoZW1haWwsIHZhbGlkYXRpb25SZXN1bHQpID0+IHtcblx0XHRcdFx0dGhpcy5fX21haWxWYWxpZCh2YWxpZGF0aW9uUmVzdWx0LmlzVmFsaWQpXG5cblx0XHRcdFx0aWYgKHZhbGlkYXRpb25SZXN1bHQuaXNWYWxpZCkge1xuXHRcdFx0XHRcdHRoaXMuX21haWxBZGRyZXNzID0gZW1haWxcblx0XHRcdFx0XHR0aGlzLnBhc3N3b3JkTW9kZWwucmVjYWxjdWxhdGVQYXNzd29yZFN0cmVuZ3RoKClcblx0XHRcdFx0XHR0aGlzLl9tYWlsQWRkcmVzc0Zvcm1FcnJvcklkID0gbnVsbFxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMuX21haWxBZGRyZXNzRm9ybUVycm9ySWQgPSB2YWxpZGF0aW9uUmVzdWx0LmVycm9ySWRcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdG9uQnVzeVN0YXRlQ2hhbmdlZDogKGlzQnVzeSkgPT4ge1xuXHRcdFx0XHR0aGlzLl9pc01haWxWZXJpZmljYXRpb25CdXN5ID0gaXNCdXN5XG5cdFx0XHR9LFxuXHRcdH1cblx0XHRjb25zdCBjb25maXJtVGVybXNDaGVja0JveEF0dHJzOiBDaGVja2JveEF0dHJzID0ge1xuXHRcdFx0bGFiZWw6IHJlbmRlclRlcm1zTGFiZWwsXG5cdFx0XHRjaGVja2VkOiB0aGlzLl9jb25maXJtVGVybXMoKSxcblx0XHRcdG9uQ2hlY2tlZDogdGhpcy5fY29uZmlybVRlcm1zLFxuXHRcdH1cblx0XHRjb25zdCBjb25maXJtQWdlQ2hlY2tCb3hBdHRyczogQ2hlY2tib3hBdHRycyA9IHtcblx0XHRcdGxhYmVsOiAoKSA9PiBsYW5nLmdldChcImFnZUNvbmZpcm1hdGlvbl9tc2dcIiksXG5cdFx0XHRjaGVja2VkOiB0aGlzLl9jb25maXJtQWdlKCksXG5cdFx0XHRvbkNoZWNrZWQ6IHRoaXMuX2NvbmZpcm1BZ2UsXG5cdFx0fVxuXG5cdFx0Y29uc3Qgc3VibWl0ID0gKCkgPT4ge1xuXHRcdFx0aWYgKHRoaXMuX2lzTWFpbFZlcmlmaWNhdGlvbkJ1c3kpIHJldHVyblxuXG5cdFx0XHRpZiAoYS5yZWFkb25seSkge1xuXHRcdFx0XHQvLyBFbWFpbCBmaWVsZCBpcyByZWFkLW9ubHksIGFjY291bnQgaGFzIGFscmVhZHkgYmVlbiBjcmVhdGVkIGJ1dCB1c2VyIHN3aXRjaGVkIGZyb20gZGlmZmVyZW50IHN1YnNjcmlwdGlvbi5cblx0XHRcdFx0dGhpcy5fX2NvbXBsZXRlUHJldmlvdXNTdGFnZXMoKVxuXG5cdFx0XHRcdHJldHVybiBhLm9uQ29tcGxldGUobnVsbClcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgZXJyb3JNZXNzYWdlID1cblx0XHRcdFx0dGhpcy5fbWFpbEFkZHJlc3NGb3JtRXJyb3JJZCB8fCB0aGlzLnBhc3N3b3JkTW9kZWwuZ2V0RXJyb3JNZXNzYWdlSWQoKSB8fCAoIXRoaXMuX2NvbmZpcm1UZXJtcygpID8gXCJ0ZXJtc0FjY2VwdGVkTmV1dHJhbF9tc2dcIiA6IG51bGwpXG5cblx0XHRcdGlmIChlcnJvck1lc3NhZ2UpIHtcblx0XHRcdFx0RGlhbG9nLm1lc3NhZ2UoZXJyb3JNZXNzYWdlKVxuXHRcdFx0XHRyZXR1cm5cblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgYWdlQ29uZmlybVByb21pc2UgPSB0aGlzLl9jb25maXJtQWdlKCkgPyBQcm9taXNlLnJlc29sdmUodHJ1ZSkgOiBEaWFsb2cuY29uZmlybShcInBhcmVudENvbmZpcm1hdGlvbl9tc2dcIiwgXCJwYXltZW50RGF0YVZhbGlkYXRpb25fYWN0aW9uXCIpXG5cdFx0XHRhZ2VDb25maXJtUHJvbWlzZS50aGVuKChjb25maXJtZWQpID0+IHtcblx0XHRcdFx0aWYgKGNvbmZpcm1lZCkge1xuXHRcdFx0XHRcdHRoaXMuX19jb21wbGV0ZVByZXZpb3VzU3RhZ2VzKClcblxuXHRcdFx0XHRcdHJldHVybiBzaWdudXAoXG5cdFx0XHRcdFx0XHR0aGlzLl9tYWlsQWRkcmVzcyxcblx0XHRcdFx0XHRcdHRoaXMucGFzc3dvcmRNb2RlbC5nZXROZXdQYXNzd29yZCgpLFxuXHRcdFx0XHRcdFx0dGhpcy5fY29kZSgpLFxuXHRcdFx0XHRcdFx0YS5pc0J1c2luZXNzVXNlKCksXG5cdFx0XHRcdFx0XHRhLmlzUGFpZFN1YnNjcmlwdGlvbigpLFxuXHRcdFx0XHRcdFx0YS5jYW1wYWlnbigpLFxuXHRcdFx0XHRcdCkudGhlbigobmV3QWNjb3VudERhdGEpID0+IHtcblx0XHRcdFx0XHRcdGEub25Db21wbGV0ZShuZXdBY2NvdW50RGF0YSA/IG5ld0FjY291bnREYXRhIDogbnVsbClcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdH1cblxuXHRcdHJldHVybiBtKFxuXHRcdFx0XCIjc2lnbnVwLWFjY291bnQtZGlhbG9nLmZsZXgtY2VudGVyXCIsXG5cdFx0XHRtKFwiLmZsZXgtZ3Jvdy1zaHJpbmstYXV0by5tYXgtd2lkdGgtbS5wdC5wYi5wbHItbFwiLCBbXG5cdFx0XHRcdGEucmVhZG9ubHlcblx0XHRcdFx0XHQ/IG0oVGV4dEZpZWxkLCB7XG5cdFx0XHRcdFx0XHRcdGxhYmVsOiBcIm1haWxBZGRyZXNzX2xhYmVsXCIsXG5cdFx0XHRcdFx0XHRcdHZhbHVlOiBhLnByZWZpbGxlZE1haWxBZGRyZXNzID8/IFwiXCIsXG5cdFx0XHRcdFx0XHRcdGF1dG9jb21wbGV0ZUFzOiBBdXRvY29tcGxldGUubmV3UGFzc3dvcmQsXG5cdFx0XHRcdFx0XHRcdGlzUmVhZE9ubHk6IHRydWUsXG5cdFx0XHRcdFx0ICB9KVxuXHRcdFx0XHRcdDogW1xuXHRcdFx0XHRcdFx0XHRtKFNlbGVjdE1haWxBZGRyZXNzRm9ybSwgbWFpbEFkZHJlc3NGb3JtQXR0cnMpLCAvLyBMZWF2ZSBhcyBpc1xuXHRcdFx0XHRcdFx0XHRhLmlzUGFpZFN1YnNjcmlwdGlvbigpXG5cdFx0XHRcdFx0XHRcdFx0PyBtKFwiLnNtYWxsLm10LXNcIiwgbGFuZy5nZXQoXCJjb25maWd1cmVDdXN0b21Eb21haW5BZnRlclNpZ251cF9tc2dcIiksIFtcblx0XHRcdFx0XHRcdFx0XHRcdFx0bShFeHRlcm5hbExpbmssIHsgaHJlZjogSW5mb0xpbmsuRG9tYWluSW5mbywgaXNDb21wYW55U2l0ZTogdHJ1ZSB9KSxcblx0XHRcdFx0XHRcdFx0XHQgIF0pXG5cdFx0XHRcdFx0XHRcdFx0OiBudWxsLFxuXHRcdFx0XHRcdFx0XHRtKFBhc3N3b3JkRm9ybSwge1xuXHRcdFx0XHRcdFx0XHRcdG1vZGVsOiB0aGlzLnBhc3N3b3JkTW9kZWwsXG5cdFx0XHRcdFx0XHRcdFx0cGFzc3dvcmRJbmZvS2V5OiBcInBhc3N3b3JkSW1wb3J0YW5jZV9tc2dcIixcblx0XHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0XHRcdGdldFdoaXRlbGFiZWxSZWdpc3RyYXRpb25Eb21haW5zKCkubGVuZ3RoID4gMFxuXHRcdFx0XHRcdFx0XHRcdD8gbShUZXh0RmllbGQsIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0dmFsdWU6IHRoaXMuX2NvZGUoKSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0b25pbnB1dDogdGhpcy5fY29kZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0bGFiZWw6IFwid2hpdGVsYWJlbFJlZ2lzdHJhdGlvbkNvZGVfbGFiZWxcIixcblx0XHRcdFx0XHRcdFx0XHQgIH0pXG5cdFx0XHRcdFx0XHRcdFx0OiBudWxsLFxuXHRcdFx0XHRcdFx0XHRtKENoZWNrYm94LCBjb25maXJtVGVybXNDaGVja0JveEF0dHJzKSxcblx0XHRcdFx0XHRcdFx0bShcImRpdlwiLCByZW5kZXJUZXJtc0FuZENvbmRpdGlvbnNCdXR0b24oVGVybXNTZWN0aW9uLlRlcm1zLCBDVVJSRU5UX1RFUk1TX1ZFUlNJT04pKSxcblx0XHRcdFx0XHRcdFx0bShcImRpdlwiLCByZW5kZXJUZXJtc0FuZENvbmRpdGlvbnNCdXR0b24oVGVybXNTZWN0aW9uLlByaXZhY3ksIENVUlJFTlRfUFJJVkFDWV9WRVJTSU9OKSksXG5cdFx0XHRcdFx0XHRcdG0oQ2hlY2tib3gsIGNvbmZpcm1BZ2VDaGVja0JveEF0dHJzKSxcblx0XHRcdFx0XHQgIF0sXG5cdFx0XHRcdG0oXG5cdFx0XHRcdFx0XCIubXQtbC5tYi1sXCIsXG5cdFx0XHRcdFx0bShMb2dpbkJ1dHRvbiwge1xuXHRcdFx0XHRcdFx0bGFiZWw6IFwibmV4dF9hY3Rpb25cIixcblx0XHRcdFx0XHRcdG9uY2xpY2s6IHN1Ym1pdCxcblx0XHRcdFx0XHR9KSxcblx0XHRcdFx0KSxcblx0XHRcdF0pLFxuXHRcdClcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgX19jb21wbGV0ZVByZXZpb3VzU3RhZ2VzKCkge1xuXHRcdC8vIE9ubHkgdGhlIHN0YXJ0ZWQgdGVzdCdzIChlaXRoZXIgZnJlZSBvciBwYWlkIGNsaWNrZWQpIHN0YWdlcyBhcmUgY29tcGxldGVkIGhlcmVcblx0XHRpZiAodGhpcy5fX3NpZ251cEZyZWVUZXN0KSB7XG5cdFx0XHQvLyBNYWtlIHN1cmUgdGhhdCB0aGUgcHJldmlvdXMgdHdvIHBpbmdzICh2YWxpZCBlbWFpbCArIHZhbGlkIHBhc3N3b3JkcykgaGF2ZSBiZWVuIHNlbnQgaW4gdGhlIGNvcnJlY3Qgb3JkZXJcblx0XHRcdGF3YWl0IHRoaXMuX19zaWdudXBGcmVlVGVzdC5nZXRTdGFnZSgyKS5jb21wbGV0ZSgpXG5cdFx0XHRhd2FpdCB0aGlzLl9fc2lnbnVwRnJlZVRlc3QuZ2V0U3RhZ2UoMykuY29tcGxldGUoKVxuXG5cdFx0XHQvLyBDcmVkZW50aWFscyBjb25maXJtYXRpb24gKGNsaWNrIG9uIG5leHQpXG5cdFx0XHRhd2FpdCB0aGlzLl9fc2lnbnVwRnJlZVRlc3QuZ2V0U3RhZ2UoNCkuY29tcGxldGUoKVxuXHRcdH1cblxuXHRcdGlmICh0aGlzLl9fc2lnbnVwUGFpZFRlc3QpIHtcblx0XHRcdC8vIE1ha2Ugc3VyZSB0aGF0IHRoZSBwcmV2aW91cyB0d28gcGluZ3MgKHZhbGlkIGVtYWlsICsgdmFsaWQgcGFzc3dvcmRzKSBoYXZlIGJlZW4gc2VudCBpbiB0aGUgY29ycmVjdCBvcmRlclxuXHRcdFx0YXdhaXQgdGhpcy5fX3NpZ251cFBhaWRUZXN0LmdldFN0YWdlKDEpLmNvbXBsZXRlKClcblx0XHRcdGF3YWl0IHRoaXMuX19zaWdudXBQYWlkVGVzdC5nZXRTdGFnZSgyKS5jb21wbGV0ZSgpXG5cblx0XHRcdC8vIENyZWRlbnRpYWxzIGNvbmZpcm1hdGlvbiAoY2xpY2sgb24gbmV4dClcblx0XHRcdGF3YWl0IHRoaXMuX19zaWdudXBQYWlkVGVzdC5nZXRTdGFnZSgzKS5jb21wbGV0ZSgpXG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIHJlbmRlclRlcm1zTGFiZWwoKTogQ2hpbGRyZW4ge1xuXHRyZXR1cm4gbGFuZy5nZXQoXCJ0ZXJtc0FuZENvbmRpdGlvbnNfbGFiZWxcIilcbn1cblxuLyoqXG4gKiBAcmV0dXJuIFNpZ25zIHRoZSB1c2VyIHVwLCBpZiBubyBjYXB0Y2hhIGlzIG5lZWRlZCBvciBpdCBoYXMgYmVlbiBzb2x2ZWQgY29ycmVjdGx5XG4gKi9cbmZ1bmN0aW9uIHNpZ251cChcblx0bWFpbEFkZHJlc3M6IHN0cmluZyxcblx0cHc6IHN0cmluZyxcblx0cmVnaXN0cmF0aW9uQ29kZTogc3RyaW5nLFxuXHRpc0J1c2luZXNzVXNlOiBib29sZWFuLFxuXHRpc1BhaWRTdWJzY3JpcHRpb246IGJvb2xlYW4sXG5cdGNhbXBhaWduOiBzdHJpbmcgfCBudWxsLFxuKTogUHJvbWlzZTxOZXdBY2NvdW50RGF0YSB8IHZvaWQ+IHtcblx0Y29uc3QgeyBjdXN0b21lckZhY2FkZSB9ID0gbG9jYXRvclxuXHRjb25zdCBvcGVyYXRpb24gPSBsb2NhdG9yLm9wZXJhdGlvblByb2dyZXNzVHJhY2tlci5zdGFydE5ld09wZXJhdGlvbigpXG5cdHJldHVybiBzaG93UHJvZ3Jlc3NEaWFsb2coXG5cdFx0XCJjcmVhdGVBY2NvdW50UnVubmluZ19tc2dcIixcblx0XHRjdXN0b21lckZhY2FkZS5nZW5lcmF0ZVNpZ251cEtleXMob3BlcmF0aW9uLmlkKS50aGVuKChrZXlQYWlycykgPT4ge1xuXHRcdFx0cmV0dXJuIHJ1bkNhcHRjaGFGbG93KG1haWxBZGRyZXNzLCBpc0J1c2luZXNzVXNlLCBpc1BhaWRTdWJzY3JpcHRpb24sIGNhbXBhaWduKS50aGVuKGFzeW5jIChyZWdEYXRhSWQpID0+IHtcblx0XHRcdFx0aWYgKHJlZ0RhdGFJZCkge1xuXHRcdFx0XHRcdGNvbnN0IGFwcCA9IGNsaWVudC5pc0NhbGVuZGFyQXBwKCkgPyBTdWJzY3JpcHRpb25BcHAuQ2FsZW5kYXIgOiBTdWJzY3JpcHRpb25BcHAuTWFpbFxuXHRcdFx0XHRcdHJldHVybiBjdXN0b21lckZhY2FkZVxuXHRcdFx0XHRcdFx0LnNpZ251cChrZXlQYWlycywgQWNjb3VudFR5cGUuRlJFRSwgcmVnRGF0YUlkLCBtYWlsQWRkcmVzcywgcHcsIHJlZ2lzdHJhdGlvbkNvZGUsIGxhbmcuY29kZSwgYXBwKVxuXHRcdFx0XHRcdFx0LnRoZW4oKHJlY292ZXJDb2RlKSA9PiB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdFx0bWFpbEFkZHJlc3MsXG5cdFx0XHRcdFx0XHRcdFx0cGFzc3dvcmQ6IHB3LFxuXHRcdFx0XHRcdFx0XHRcdHJlY292ZXJDb2RlLFxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdH0pLFxuXHRcdG9wZXJhdGlvbi5wcm9ncmVzcyxcblx0KVxuXHRcdC5jYXRjaChcblx0XHRcdG9mQ2xhc3MoSW52YWxpZERhdGFFcnJvciwgKCkgPT4ge1xuXHRcdFx0XHREaWFsb2cubWVzc2FnZShcImludmFsaWRSZWdpc3RyYXRpb25Db2RlX21zZ1wiKVxuXHRcdFx0fSksXG5cdFx0KVxuXHRcdC5maW5hbGx5KCgpID0+IG9wZXJhdGlvbi5kb25lKCkpXG59XG4iLCJpbXBvcnQgbSwgeyBDaGlsZHJlbiwgVm5vZGUsIFZub2RlRE9NIH0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHR5cGUgeyBVcGdyYWRlU3Vic2NyaXB0aW9uRGF0YSB9IGZyb20gXCIuL1VwZ3JhZGVTdWJzY3JpcHRpb25XaXphcmRcIlxuaW1wb3J0IHR5cGUgeyBXaXphcmRQYWdlQXR0cnMsIFdpemFyZFBhZ2VOIH0gZnJvbSBcIi4uL2d1aS9iYXNlL1dpemFyZERpYWxvZy5qc1wiXG5pbXBvcnQgeyBlbWl0V2l6YXJkRXZlbnQsIFdpemFyZEV2ZW50VHlwZSB9IGZyb20gXCIuLi9ndWkvYmFzZS9XaXphcmREaWFsb2cuanNcIlxuaW1wb3J0IHsgU2lnbnVwRm9ybSB9IGZyb20gXCIuL1NpZ251cEZvcm1cIlxuaW1wb3J0IHsgZ2V0RGlzcGxheU5hbWVPZlBsYW5UeXBlIH0gZnJvbSBcIi4vRmVhdHVyZUxpc3RQcm92aWRlclwiXG5pbXBvcnQgeyBQbGFuVHlwZSB9IGZyb20gXCIuLi9hcGkvY29tbW9uL1R1dGFub3RhQ29uc3RhbnRzLmpzXCJcbmltcG9ydCB7IGxhbmcsIFRyYW5zbGF0aW9uLCBUcmFuc2xhdGlvbktleSB9IGZyb20gXCIuLi9taXNjL0xhbmd1YWdlVmlld01vZGVsLmpzXCJcblxuZXhwb3J0IGNsYXNzIFNpZ251cFBhZ2UgaW1wbGVtZW50cyBXaXphcmRQYWdlTjxVcGdyYWRlU3Vic2NyaXB0aW9uRGF0YT4ge1xuXHRwcml2YXRlIGRvbSE6IEhUTUxFbGVtZW50XG5cblx0b25jcmVhdGUodm5vZGU6IFZub2RlRE9NPFdpemFyZFBhZ2VBdHRyczxVcGdyYWRlU3Vic2NyaXB0aW9uRGF0YT4+KSB7XG5cdFx0dGhpcy5kb20gPSB2bm9kZS5kb20gYXMgSFRNTEVsZW1lbnRcblx0fVxuXG5cdHZpZXcodm5vZGU6IFZub2RlPFdpemFyZFBhZ2VBdHRyczxVcGdyYWRlU3Vic2NyaXB0aW9uRGF0YT4+KTogQ2hpbGRyZW4ge1xuXHRcdGNvbnN0IGRhdGEgPSB2bm9kZS5hdHRycy5kYXRhXG5cdFx0Y29uc3QgbmV3QWNjb3VudERhdGEgPSBkYXRhLm5ld0FjY291bnREYXRhXG5cdFx0bGV0IG1haWxBZGRyZXNzOiB1bmRlZmluZWQgfCBzdHJpbmcgPSB1bmRlZmluZWRcblx0XHRpZiAobmV3QWNjb3VudERhdGEpIG1haWxBZGRyZXNzID0gbmV3QWNjb3VudERhdGEubWFpbEFkZHJlc3Ncblx0XHRyZXR1cm4gbShTaWdudXBGb3JtLCB7XG5cdFx0XHRvbkNvbXBsZXRlOiAobmV3QWNjb3VudERhdGEpID0+IHtcblx0XHRcdFx0aWYgKG5ld0FjY291bnREYXRhKSBkYXRhLm5ld0FjY291bnREYXRhID0gbmV3QWNjb3VudERhdGFcblx0XHRcdFx0ZW1pdFdpemFyZEV2ZW50KHRoaXMuZG9tLCBXaXphcmRFdmVudFR5cGUuU0hPV19ORVhUX1BBR0UpXG5cdFx0XHR9LFxuXHRcdFx0b25DaGFuZ2VQbGFuOiAoKSA9PiB7XG5cdFx0XHRcdGVtaXRXaXphcmRFdmVudCh0aGlzLmRvbSwgV2l6YXJkRXZlbnRUeXBlLlNIT1dfUFJFVklPVVNfUEFHRSlcblx0XHRcdH0sXG5cdFx0XHRpc0J1c2luZXNzVXNlOiBkYXRhLm9wdGlvbnMuYnVzaW5lc3NVc2UsXG5cdFx0XHRpc1BhaWRTdWJzY3JpcHRpb246ICgpID0+IGRhdGEudHlwZSAhPT0gUGxhblR5cGUuRnJlZSxcblx0XHRcdGNhbXBhaWduOiAoKSA9PiBkYXRhLnJlZ2lzdHJhdGlvbkRhdGFJZCxcblx0XHRcdHByZWZpbGxlZE1haWxBZGRyZXNzOiBtYWlsQWRkcmVzcyxcblx0XHRcdHJlYWRvbmx5OiAhIW5ld0FjY291bnREYXRhLFxuXHRcdH0pXG5cdH1cbn1cblxuZXhwb3J0IGNsYXNzIFNpZ251cFBhZ2VBdHRycyBpbXBsZW1lbnRzIFdpemFyZFBhZ2VBdHRyczxVcGdyYWRlU3Vic2NyaXB0aW9uRGF0YT4ge1xuXHRkYXRhOiBVcGdyYWRlU3Vic2NyaXB0aW9uRGF0YVxuXG5cdGNvbnN0cnVjdG9yKHNpZ251cERhdGE6IFVwZ3JhZGVTdWJzY3JpcHRpb25EYXRhKSB7XG5cdFx0dGhpcy5kYXRhID0gc2lnbnVwRGF0YVxuXHR9XG5cblx0aGVhZGVyVGl0bGUoKTogVHJhbnNsYXRpb24ge1xuXHRcdGNvbnN0IHRpdGxlID0gZ2V0RGlzcGxheU5hbWVPZlBsYW5UeXBlKHRoaXMuZGF0YS50eXBlKVxuXG5cdFx0aWYgKHRoaXMuZGF0YS50eXBlID09PSBQbGFuVHlwZS5Fc3NlbnRpYWwgfHwgdGhpcy5kYXRhLnR5cGUgPT09IFBsYW5UeXBlLkFkdmFuY2VkKSB7XG5cdFx0XHRyZXR1cm4gbGFuZy5tYWtlVHJhbnNsYXRpb24oXCJzaWdudXBfYnVzaW5lc3NcIiwgdGl0bGUgKyBcIiBCdXNpbmVzc1wiKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gbGFuZy5tYWtlVHJhbnNsYXRpb24oXCJzaWdudXBfdGl0bGVcIiwgdGl0bGUpXG5cdFx0fVxuXHR9XG5cblx0bmV4dEFjdGlvbihzaG93RXJyb3JEaWFsb2c6IGJvb2xlYW4pOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHQvLyBuZXh0IGFjdGlvbiBub3QgYXZhaWxhYmxlIGZvciB0aGlzIHBhZ2Vcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpXG5cdH1cblxuXHRpc1NraXBBdmFpbGFibGUoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIGZhbHNlXG5cdH1cblxuXHRpc0VuYWJsZWQoKTogYm9vbGVhbiB7XG5cdFx0cmV0dXJuIHRydWVcblx0fVxufVxuIiwiLyogZ2VuZXJhdGVkIGZpbGUsIGRvbid0IGVkaXQuICovXG5cbmV4cG9ydCBjb25zdCBlbnVtIE1vYmlsZVBheW1lbnRSZXN1bHRUeXBlIHtcblx0U3VjY2VzcyA9IFwiMFwiLFxuXHRDYW5jZWxsZWQgPSBcIjFcIixcblx0UGVuZGluZyA9IFwiMlwiLFxufVxuIiwiaW1wb3J0IG0sIHsgQ2hpbGRyZW4sIFZub2RlLCBWbm9kZURPTSB9IGZyb20gXCJtaXRocmlsXCJcbmltcG9ydCB7IERpYWxvZyB9IGZyb20gXCIuLi9ndWkvYmFzZS9EaWFsb2dcIlxuaW1wb3J0IHsgbGFuZyB9IGZyb20gXCIuLi9taXNjL0xhbmd1YWdlVmlld01vZGVsXCJcbmltcG9ydCB7IGZvcm1hdFByaWNlV2l0aEluZm8sIGdldFBheW1lbnRNZXRob2ROYW1lLCBQYXltZW50SW50ZXJ2YWwgfSBmcm9tIFwiLi9QcmljZVV0aWxzXCJcbmltcG9ydCB7IGNyZWF0ZVN3aXRjaEFjY291bnRUeXBlUG9zdEluIH0gZnJvbSBcIi4uL2FwaS9lbnRpdGllcy9zeXMvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgQWNjb3VudFR5cGUsIENvbnN0LCBQYXltZW50TWV0aG9kVHlwZSwgUGF5bWVudE1ldGhvZFR5cGVUb05hbWUgfSBmcm9tIFwiLi4vYXBpL2NvbW1vbi9UdXRhbm90YUNvbnN0YW50c1wiXG5pbXBvcnQgeyBzaG93UHJvZ3Jlc3NEaWFsb2cgfSBmcm9tIFwiLi4vZ3VpL2RpYWxvZ3MvUHJvZ3Jlc3NEaWFsb2dcIlxuaW1wb3J0IHR5cGUgeyBVcGdyYWRlU3Vic2NyaXB0aW9uRGF0YSB9IGZyb20gXCIuL1VwZ3JhZGVTdWJzY3JpcHRpb25XaXphcmRcIlxuaW1wb3J0IHsgQmFkR2F0ZXdheUVycm9yLCBQcmVjb25kaXRpb25GYWlsZWRFcnJvciB9IGZyb20gXCIuLi9hcGkvY29tbW9uL2Vycm9yL1Jlc3RFcnJvclwiXG5pbXBvcnQgeyBhcHBTdG9yZVBsYW5OYW1lLCBnZXRQcmVjb25kaXRpb25GYWlsZWRQYXltZW50TXNnLCBVcGdyYWRlVHlwZSB9IGZyb20gXCIuL1N1YnNjcmlwdGlvblV0aWxzXCJcbmltcG9ydCB0eXBlIHsgV2l6YXJkUGFnZUF0dHJzLCBXaXphcmRQYWdlTiB9IGZyb20gXCIuLi9ndWkvYmFzZS9XaXphcmREaWFsb2cuanNcIlxuaW1wb3J0IHsgZW1pdFdpemFyZEV2ZW50LCBXaXphcmRFdmVudFR5cGUgfSBmcm9tIFwiLi4vZ3VpL2Jhc2UvV2l6YXJkRGlhbG9nLmpzXCJcbmltcG9ydCB7IFRleHRGaWVsZCB9IGZyb20gXCIuLi9ndWkvYmFzZS9UZXh0RmllbGQuanNcIlxuaW1wb3J0IHsgYmFzZTY0RXh0VG9CYXNlNjQsIGJhc2U2NFRvVWludDhBcnJheSwgbmV2ZXJOdWxsLCBvZkNsYXNzIH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5pbXBvcnQgeyBsb2NhdG9yIH0gZnJvbSBcIi4uL2FwaS9tYWluL0NvbW1vbkxvY2F0b3JcIlxuaW1wb3J0IHsgU3dpdGNoQWNjb3VudFR5cGVTZXJ2aWNlIH0gZnJvbSBcIi4uL2FwaS9lbnRpdGllcy9zeXMvU2VydmljZXNcIlxuaW1wb3J0IHsgVXNhZ2VUZXN0IH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11c2FnZXRlc3RzXCJcbmltcG9ydCB7IGdldERpc3BsYXlOYW1lT2ZQbGFuVHlwZSwgU2VsZWN0ZWRTdWJzY3JpcHRpb25PcHRpb25zIH0gZnJvbSBcIi4vRmVhdHVyZUxpc3RQcm92aWRlclwiXG5pbXBvcnQgeyBMb2dpbkJ1dHRvbiB9IGZyb20gXCIuLi9ndWkvYmFzZS9idXR0b25zL0xvZ2luQnV0dG9uLmpzXCJcbmltcG9ydCB7IE1vYmlsZVBheW1lbnRSZXN1bHRUeXBlIH0gZnJvbSBcIi4uL25hdGl2ZS9jb21tb24vZ2VuZXJhdGVkaXBjL01vYmlsZVBheW1lbnRSZXN1bHRUeXBlXCJcbmltcG9ydCB7IHVwZGF0ZVBheW1lbnREYXRhIH0gZnJvbSBcIi4vSW52b2ljZUFuZFBheW1lbnREYXRhUGFnZVwiXG5pbXBvcnQgeyBTZXNzaW9uVHlwZSB9IGZyb20gXCIuLi9hcGkvY29tbW9uL1Nlc3Npb25UeXBlXCJcbmltcG9ydCB7IE1vYmlsZVBheW1lbnRFcnJvciB9IGZyb20gXCIuLi9hcGkvY29tbW9uL2Vycm9yL01vYmlsZVBheW1lbnRFcnJvci5qc1wiXG5pbXBvcnQgeyBnZXRSYXRpbmdBbGxvd2VkLCBSYXRpbmdDaGVja1Jlc3VsdCB9IGZyb20gXCIuLi9yYXRpbmdzL0luQXBwUmF0aW5nVXRpbHMuanNcIlxuaW1wb3J0IHsgc2hvd0FwcFJhdGluZ0RpYWxvZyB9IGZyb20gXCIuLi9yYXRpbmdzL0luQXBwUmF0aW5nRGlhbG9nLmpzXCJcbmltcG9ydCB7IGRldmljZUNvbmZpZyB9IGZyb20gXCIuLi9taXNjL0RldmljZUNvbmZpZy5qc1wiXG5pbXBvcnQgeyBpc0lPU0FwcCB9IGZyb20gXCIuLi9hcGkvY29tbW9uL0Vudi5qc1wiXG5pbXBvcnQgeyBjbGllbnQgfSBmcm9tIFwiLi4vbWlzYy9DbGllbnREZXRlY3Rvci5qc1wiXG5pbXBvcnQgeyBTdWJzY3JpcHRpb25BcHAgfSBmcm9tIFwiLi9TdWJzY3JpcHRpb25WaWV3ZXIuanNcIlxuXG5leHBvcnQgY2xhc3MgVXBncmFkZUNvbmZpcm1TdWJzY3JpcHRpb25QYWdlIGltcGxlbWVudHMgV2l6YXJkUGFnZU48VXBncmFkZVN1YnNjcmlwdGlvbkRhdGE+IHtcblx0cHJpdmF0ZSBkb20hOiBIVE1MRWxlbWVudFxuXHRwcml2YXRlIF9fc2lnbnVwUGFpZFRlc3Q/OiBVc2FnZVRlc3Rcblx0cHJpdmF0ZSBfX3NpZ251cEZyZWVUZXN0PzogVXNhZ2VUZXN0XG5cblx0b25jcmVhdGUodm5vZGU6IFZub2RlRE9NPFdpemFyZFBhZ2VBdHRyczxVcGdyYWRlU3Vic2NyaXB0aW9uRGF0YT4+KSB7XG5cdFx0dGhpcy5fX3NpZ251cFBhaWRUZXN0ID0gbG9jYXRvci51c2FnZVRlc3RDb250cm9sbGVyLmdldFRlc3QoXCJzaWdudXAucGFpZFwiKVxuXHRcdHRoaXMuX19zaWdudXBGcmVlVGVzdCA9IGxvY2F0b3IudXNhZ2VUZXN0Q29udHJvbGxlci5nZXRUZXN0KFwic2lnbnVwLmZyZWVcIilcblxuXHRcdHRoaXMuZG9tID0gdm5vZGUuZG9tIGFzIEhUTUxFbGVtZW50XG5cdH1cblxuXHR2aWV3KHsgYXR0cnMgfTogVm5vZGU8V2l6YXJkUGFnZUF0dHJzPFVwZ3JhZGVTdWJzY3JpcHRpb25EYXRhPj4pOiBDaGlsZHJlbiB7XG5cdFx0cmV0dXJuIHRoaXMucmVuZGVyQ29uZmlybVN1YnNjcmlwdGlvbihhdHRycylcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgdXBncmFkZShkYXRhOiBVcGdyYWRlU3Vic2NyaXB0aW9uRGF0YSkge1xuXHRcdC8vIFdlIHJldHVybiBlYXJseSBiZWNhdXNlIHdlIGRvIHRoZSB1cGdyYWRlIGFmdGVyIHRoZSB1c2VyIGhhcyBzdWJtaXR0ZWQgcGF5bWVudCB3aGljaCBpcyBvbiB0aGUgY29uZmlybWF0aW9uIHBhZ2Vcblx0XHRpZiAoZGF0YS5wYXltZW50RGF0YS5wYXltZW50TWV0aG9kID09PSBQYXltZW50TWV0aG9kVHlwZS5BcHBTdG9yZSkge1xuXHRcdFx0Y29uc3Qgc3VjY2VzcyA9IGF3YWl0IHRoaXMuaGFuZGxlQXBwU3RvcmVQYXltZW50KGRhdGEpXG5cdFx0XHRpZiAoIXN1Y2Nlc3MpIHtcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Y29uc3Qgc2VydmljZURhdGEgPSBjcmVhdGVTd2l0Y2hBY2NvdW50VHlwZVBvc3RJbih7XG5cdFx0XHRhY2NvdW50VHlwZTogQWNjb3VudFR5cGUuUEFJRCxcblx0XHRcdGN1c3RvbWVyOiBudWxsLFxuXHRcdFx0cGxhbjogZGF0YS50eXBlLFxuXHRcdFx0ZGF0ZTogQ29uc3QuQ1VSUkVOVF9EQVRFLFxuXHRcdFx0cmVmZXJyYWxDb2RlOiBkYXRhLnJlZmVycmFsQ29kZSxcblx0XHRcdHNwZWNpYWxQcmljZVVzZXJTaW5nbGU6IG51bGwsXG5cdFx0XHRzdXJ2ZXlEYXRhOiBudWxsLFxuXHRcdFx0YXBwOiBjbGllbnQuaXNDYWxlbmRhckFwcCgpID8gU3Vic2NyaXB0aW9uQXBwLkNhbGVuZGFyIDogU3Vic2NyaXB0aW9uQXBwLk1haWwsXG5cdFx0fSlcblx0XHRzaG93UHJvZ3Jlc3NEaWFsb2coXG5cdFx0XHRcInBsZWFzZVdhaXRfbXNnXCIsXG5cdFx0XHRsb2NhdG9yLnNlcnZpY2VFeGVjdXRvci5wb3N0KFN3aXRjaEFjY291bnRUeXBlU2VydmljZSwgc2VydmljZURhdGEpLnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gbG9jYXRvci5jdXN0b21lckZhY2FkZS5zd2l0Y2hGcmVlVG9QcmVtaXVtR3JvdXAoKVxuXHRcdFx0fSksXG5cdFx0KVxuXHRcdFx0LnRoZW4oKCkgPT4ge1xuXHRcdFx0XHQvLyBPcmRlciBjb25maXJtYXRpb24gKGNsaWNrIG9uIEJ1eSksIHNlbmQgc2VsZWN0ZWQgcGF5bWVudCBtZXRob2QgYXMgYW4gZW51bVxuXHRcdFx0XHRjb25zdCBvcmRlckNvbmZpcm1hdGlvblN0YWdlID0gdGhpcy5fX3NpZ251cFBhaWRUZXN0Py5nZXRTdGFnZSg1KVxuXHRcdFx0XHRvcmRlckNvbmZpcm1hdGlvblN0YWdlPy5zZXRNZXRyaWMoe1xuXHRcdFx0XHRcdG5hbWU6IFwicGF5bWVudE1ldGhvZFwiLFxuXHRcdFx0XHRcdHZhbHVlOiBQYXltZW50TWV0aG9kVHlwZVRvTmFtZVtkYXRhLnBheW1lbnREYXRhLnBheW1lbnRNZXRob2RdLFxuXHRcdFx0XHR9KVxuXHRcdFx0XHRvcmRlckNvbmZpcm1hdGlvblN0YWdlPy5zZXRNZXRyaWMoe1xuXHRcdFx0XHRcdG5hbWU6IFwic3dpdGNoZWRGcm9tRnJlZVwiLFxuXHRcdFx0XHRcdHZhbHVlOiAodGhpcy5fX3NpZ251cEZyZWVUZXN0Py5pc1N0YXJ0ZWQoKSA/PyBmYWxzZSkudG9TdHJpbmcoKSxcblx0XHRcdFx0fSlcblx0XHRcdFx0b3JkZXJDb25maXJtYXRpb25TdGFnZT8uY29tcGxldGUoKVxuXG5cdFx0XHRcdHJldHVybiB0aGlzLmNsb3NlKGRhdGEsIHRoaXMuZG9tKVxuXHRcdFx0fSlcblx0XHRcdC50aGVuKGFzeW5jICgpID0+IHtcblx0XHRcdFx0Y29uc3QgcmF0aW5nQ2hlY2tSZXN1bHQgPSBhd2FpdCBnZXRSYXRpbmdBbGxvd2VkKG5ldyBEYXRlKCksIGRldmljZUNvbmZpZywgaXNJT1NBcHAoKSlcblx0XHRcdFx0aWYgKHJhdGluZ0NoZWNrUmVzdWx0ID09PSBSYXRpbmdDaGVja1Jlc3VsdC5SQVRJTkdfQUxMT1dFRCkge1xuXHRcdFx0XHRcdHNldFRpbWVvdXQoYXN5bmMgKCkgPT4ge1xuXHRcdFx0XHRcdFx0dm9pZCBzaG93QXBwUmF0aW5nRGlhbG9nKClcblx0XHRcdFx0XHR9LCAyMDAwKVxuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKFxuXHRcdFx0XHRvZkNsYXNzKFByZWNvbmRpdGlvbkZhaWxlZEVycm9yLCAoZSkgPT4ge1xuXHRcdFx0XHRcdERpYWxvZy5tZXNzYWdlKFxuXHRcdFx0XHRcdFx0bGFuZy5tYWtlVHJhbnNsYXRpb24oXG5cdFx0XHRcdFx0XHRcdFwicHJlY29uZGl0aW9uX2ZhaWxlZFwiLFxuXHRcdFx0XHRcdFx0XHRsYW5nLmdldChnZXRQcmVjb25kaXRpb25GYWlsZWRQYXltZW50TXNnKGUuZGF0YSkpICtcblx0XHRcdFx0XHRcdFx0XHQoZGF0YS51cGdyYWRlVHlwZSA9PT0gVXBncmFkZVR5cGUuU2lnbnVwID8gXCIgXCIgKyBsYW5nLmdldChcImFjY291bnRXYXNTdGlsbENyZWF0ZWRfbXNnXCIpIDogXCJcIiksXG5cdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdClcblx0XHRcdFx0fSksXG5cdFx0XHQpXG5cdFx0XHQuY2F0Y2goXG5cdFx0XHRcdG9mQ2xhc3MoQmFkR2F0ZXdheUVycm9yLCAoZSkgPT4ge1xuXHRcdFx0XHRcdERpYWxvZy5tZXNzYWdlKFxuXHRcdFx0XHRcdFx0bGFuZy5tYWtlVHJhbnNsYXRpb24oXG5cdFx0XHRcdFx0XHRcdFwicGF5bWVudF9mYWlsZWRcIixcblx0XHRcdFx0XHRcdFx0bGFuZy5nZXQoXCJwYXltZW50UHJvdmlkZXJOb3RBdmFpbGFibGVFcnJvcl9tc2dcIikgK1xuXHRcdFx0XHRcdFx0XHRcdChkYXRhLnVwZ3JhZGVUeXBlID09PSBVcGdyYWRlVHlwZS5TaWdudXAgPyBcIiBcIiArIGxhbmcuZ2V0KFwiYWNjb3VudFdhc1N0aWxsQ3JlYXRlZF9tc2dcIikgOiBcIlwiKSxcblx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHR9KSxcblx0XHRcdClcblx0fVxuXG5cdC8qKiBAcmV0dXJuIHdoZXRoZXIgc3Vic2NyaWJlZCBzdWNjZXNzZnVsbHkgKi9cblx0cHJpdmF0ZSBhc3luYyBoYW5kbGVBcHBTdG9yZVBheW1lbnQoZGF0YTogVXBncmFkZVN1YnNjcmlwdGlvbkRhdGEpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRpZiAoIWxvY2F0b3IubG9naW5zLmlzVXNlckxvZ2dlZEluKCkpIHtcblx0XHRcdGF3YWl0IGxvY2F0b3IubG9naW5zLmNyZWF0ZVNlc3Npb24obmV2ZXJOdWxsKGRhdGEubmV3QWNjb3VudERhdGEpLm1haWxBZGRyZXNzLCBuZXZlck51bGwoZGF0YS5uZXdBY2NvdW50RGF0YSkucGFzc3dvcmQsIFNlc3Npb25UeXBlLlRlbXBvcmFyeSlcblx0XHR9XG5cblx0XHRjb25zdCBjdXN0b21lcklkID0gbG9jYXRvci5sb2dpbnMuZ2V0VXNlckNvbnRyb2xsZXIoKS51c2VyLmN1c3RvbWVyIVxuXHRcdGNvbnN0IGN1c3RvbWVySWRCeXRlcyA9IGJhc2U2NFRvVWludDhBcnJheShiYXNlNjRFeHRUb0Jhc2U2NChjdXN0b21lcklkKSlcblxuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCByZXN1bHQgPSBhd2FpdCBzaG93UHJvZ3Jlc3NEaWFsb2coXG5cdFx0XHRcdFwicGxlYXNlV2FpdF9tc2dcIixcblx0XHRcdFx0bG9jYXRvci5tb2JpbGVQYXltZW50c0ZhY2FkZS5yZXF1ZXN0U3Vic2NyaXB0aW9uVG9QbGFuKGFwcFN0b3JlUGxhbk5hbWUoZGF0YS50eXBlKSwgZGF0YS5vcHRpb25zLnBheW1lbnRJbnRlcnZhbCgpLCBjdXN0b21lcklkQnl0ZXMpLFxuXHRcdFx0KVxuXHRcdFx0aWYgKHJlc3VsdC5yZXN1bHQgIT09IE1vYmlsZVBheW1lbnRSZXN1bHRUeXBlLlN1Y2Nlc3MpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlXG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0aWYgKGUgaW5zdGFuY2VvZiBNb2JpbGVQYXltZW50RXJyb3IpIHtcblx0XHRcdFx0Y29uc29sZS5lcnJvcihcIkFwcFN0b3JlIHN1YnNjcmlwdGlvbiBmYWlsZWRcIiwgZSlcblx0XHRcdFx0RGlhbG9nLm1lc3NhZ2UoXCJhcHBTdG9yZVN1YnNjcmlwdGlvbkVycm9yX21zZ1wiLCBlLm1lc3NhZ2UpXG5cdFx0XHRcdHJldHVybiBmYWxzZVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhyb3cgZVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBhd2FpdCB1cGRhdGVQYXltZW50RGF0YShcblx0XHRcdGRhdGEub3B0aW9ucy5wYXltZW50SW50ZXJ2YWwoKSxcblx0XHRcdGRhdGEuaW52b2ljZURhdGEsXG5cdFx0XHRkYXRhLnBheW1lbnREYXRhLFxuXHRcdFx0bnVsbCxcblx0XHRcdGRhdGEubmV3QWNjb3VudERhdGEgIT0gbnVsbCxcblx0XHRcdG51bGwsXG5cdFx0XHRkYXRhLmFjY291bnRpbmdJbmZvISxcblx0XHQpXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckNvbmZpcm1TdWJzY3JpcHRpb24oYXR0cnM6IFdpemFyZFBhZ2VBdHRyczxVcGdyYWRlU3Vic2NyaXB0aW9uRGF0YT4pIHtcblx0XHRjb25zdCBpc1llYXJseSA9IGF0dHJzLmRhdGEub3B0aW9ucy5wYXltZW50SW50ZXJ2YWwoKSA9PT0gUGF5bWVudEludGVydmFsLlllYXJseVxuXHRcdGNvbnN0IHN1YnNjcmlwdGlvbiA9IGlzWWVhcmx5ID8gbGFuZy5nZXQoXCJwcmljaW5nLnllYXJseV9sYWJlbFwiKSA6IGxhbmcuZ2V0KFwicHJpY2luZy5tb250aGx5X2xhYmVsXCIpXG5cblx0XHRyZXR1cm4gW1xuXHRcdFx0bShcIi5jZW50ZXIuaDQucHRcIiwgbGFuZy5nZXQoXCJ1cGdyYWRlQ29uZmlybV9tc2dcIikpLFxuXHRcdFx0bShcIi5wdC5wYi5wbHItbFwiLCBbXG5cdFx0XHRcdG0oVGV4dEZpZWxkLCB7XG5cdFx0XHRcdFx0bGFiZWw6IFwic3Vic2NyaXB0aW9uX2xhYmVsXCIsXG5cdFx0XHRcdFx0dmFsdWU6IGdldERpc3BsYXlOYW1lT2ZQbGFuVHlwZShhdHRycy5kYXRhLnR5cGUpLFxuXHRcdFx0XHRcdGlzUmVhZE9ubHk6IHRydWUsXG5cdFx0XHRcdH0pLFxuXHRcdFx0XHRtKFRleHRGaWVsZCwge1xuXHRcdFx0XHRcdGxhYmVsOiBcInBheW1lbnRJbnRlcnZhbF9sYWJlbFwiLFxuXHRcdFx0XHRcdHZhbHVlOiBzdWJzY3JpcHRpb24sXG5cdFx0XHRcdFx0aXNSZWFkT25seTogdHJ1ZSxcblx0XHRcdFx0fSksXG5cdFx0XHRcdG0oVGV4dEZpZWxkLCB7XG5cdFx0XHRcdFx0bGFiZWw6IGlzWWVhcmx5ICYmIGF0dHJzLmRhdGEubmV4dFllYXJQcmljZSA/IFwicHJpY2VGaXJzdFllYXJfbGFiZWxcIiA6IFwicHJpY2VfbGFiZWxcIixcblx0XHRcdFx0XHR2YWx1ZTogYnVpbGRQcmljZVN0cmluZyhhdHRycy5kYXRhLnByaWNlPy5kaXNwbGF5UHJpY2UgPz8gXCIwXCIsIGF0dHJzLmRhdGEub3B0aW9ucyksXG5cdFx0XHRcdFx0aXNSZWFkT25seTogdHJ1ZSxcblx0XHRcdFx0fSksXG5cdFx0XHRcdHRoaXMucmVuZGVyUHJpY2VOZXh0WWVhcihhdHRycyksXG5cdFx0XHRcdG0oVGV4dEZpZWxkLCB7XG5cdFx0XHRcdFx0bGFiZWw6IFwicGF5bWVudE1ldGhvZF9sYWJlbFwiLFxuXHRcdFx0XHRcdHZhbHVlOiBnZXRQYXltZW50TWV0aG9kTmFtZShhdHRycy5kYXRhLnBheW1lbnREYXRhLnBheW1lbnRNZXRob2QpLFxuXHRcdFx0XHRcdGlzUmVhZE9ubHk6IHRydWUsXG5cdFx0XHRcdH0pLFxuXHRcdFx0XSksXG5cdFx0XHRtKFxuXHRcdFx0XHRcIi5zbWFsbGVyLmNlbnRlci5wdC1sXCIsXG5cdFx0XHRcdGF0dHJzLmRhdGEub3B0aW9ucy5idXNpbmVzc1VzZSgpXG5cdFx0XHRcdFx0PyBsYW5nLmdldChcInByaWNpbmcuc3Vic2NyaXB0aW9uUGVyaW9kSW5mb0J1c2luZXNzX21zZ1wiKVxuXHRcdFx0XHRcdDogbGFuZy5nZXQoXCJwcmljaW5nLnN1YnNjcmlwdGlvblBlcmlvZEluZm9Qcml2YXRlX21zZ1wiKSxcblx0XHRcdCksXG5cdFx0XHRtKFxuXHRcdFx0XHRcIi5mbGV4LWNlbnRlci5mdWxsLXdpZHRoLnB0LWxcIixcblx0XHRcdFx0bShMb2dpbkJ1dHRvbiwge1xuXHRcdFx0XHRcdGxhYmVsOiBcImJ1eV9hY3Rpb25cIixcblx0XHRcdFx0XHRjbGFzczogXCJzbWFsbC1sb2dpbi1idXR0b25cIixcblx0XHRcdFx0XHRvbmNsaWNrOiAoKSA9PiB0aGlzLnVwZ3JhZGUoYXR0cnMuZGF0YSksXG5cdFx0XHRcdH0pLFxuXHRcdFx0KSxcblx0XHRdXG5cdH1cblxuXHRwcml2YXRlIHJlbmRlclByaWNlTmV4dFllYXIoYXR0cnM6IFdpemFyZFBhZ2VBdHRyczxVcGdyYWRlU3Vic2NyaXB0aW9uRGF0YT4pIHtcblx0XHRyZXR1cm4gYXR0cnMuZGF0YS5uZXh0WWVhclByaWNlXG5cdFx0XHQ/IG0oVGV4dEZpZWxkLCB7XG5cdFx0XHRcdFx0bGFiZWw6IFwicHJpY2VGb3JOZXh0WWVhcl9sYWJlbFwiLFxuXHRcdFx0XHRcdHZhbHVlOiBidWlsZFByaWNlU3RyaW5nKGF0dHJzLmRhdGEubmV4dFllYXJQcmljZS5kaXNwbGF5UHJpY2UsIGF0dHJzLmRhdGEub3B0aW9ucyksXG5cdFx0XHRcdFx0aXNSZWFkT25seTogdHJ1ZSxcblx0XHRcdCAgfSlcblx0XHRcdDogbnVsbFxuXHR9XG5cblx0cHJpdmF0ZSBjbG9zZShkYXRhOiBVcGdyYWRlU3Vic2NyaXB0aW9uRGF0YSwgZG9tOiBIVE1MRWxlbWVudCkge1xuXHRcdGVtaXRXaXphcmRFdmVudChkb20sIFdpemFyZEV2ZW50VHlwZS5TSE9XX05FWFRfUEFHRSlcblx0fVxufVxuXG5mdW5jdGlvbiBidWlsZFByaWNlU3RyaW5nKHByaWNlOiBzdHJpbmcsIG9wdGlvbnM6IFNlbGVjdGVkU3Vic2NyaXB0aW9uT3B0aW9ucyk6IHN0cmluZyB7XG5cdHJldHVybiBmb3JtYXRQcmljZVdpdGhJbmZvKHByaWNlLCBvcHRpb25zLnBheW1lbnRJbnRlcnZhbCgpLCAhb3B0aW9ucy5idXNpbmVzc1VzZSgpKVxufVxuIiwiaW1wb3J0IHR5cGUgeyBIZXggfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB7IGRlZmVyIH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5pbXBvcnQgeyBBY2NvdW50aW5nSW5mbywgQ3VzdG9tZXIgfSBmcm9tIFwiLi4vYXBpL2VudGl0aWVzL3N5cy9UeXBlUmVmcy5qc1wiXG5pbXBvcnQge1xuXHRBdmFpbGFibGVQbGFucyxcblx0QXZhaWxhYmxlUGxhblR5cGUsXG5cdGdldERlZmF1bHRQYXltZW50TWV0aG9kLFxuXHRnZXRQYXltZW50TWV0aG9kVHlwZSxcblx0SW52b2ljZURhdGEsXG5cdE5ld1BhaWRQbGFucyxcblx0UGF5bWVudERhdGEsXG5cdFBsYW5UeXBlLFxufSBmcm9tIFwiLi4vYXBpL2NvbW1vbi9UdXRhbm90YUNvbnN0YW50c1wiXG5pbXBvcnQgeyBnZXRCeUFiYnJldmlhdGlvbiB9IGZyb20gXCIuLi9hcGkvY29tbW9uL0NvdW50cnlMaXN0XCJcbmltcG9ydCB7IFVwZ3JhZGVTdWJzY3JpcHRpb25QYWdlLCBVcGdyYWRlU3Vic2NyaXB0aW9uUGFnZUF0dHJzIH0gZnJvbSBcIi4vVXBncmFkZVN1YnNjcmlwdGlvblBhZ2VcIlxuaW1wb3J0IG0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHN0cmVhbSBmcm9tIFwibWl0aHJpbC9zdHJlYW1cIlxuaW1wb3J0IHsgSW5mb0xpbmssIGxhbmcsIFRyYW5zbGF0aW9uS2V5LCBNYXliZVRyYW5zbGF0aW9uIH0gZnJvbSBcIi4uL21pc2MvTGFuZ3VhZ2VWaWV3TW9kZWxcIlxuaW1wb3J0IHsgY3JlYXRlV2l6YXJkRGlhbG9nLCB3aXphcmRQYWdlV3JhcHBlciB9IGZyb20gXCIuLi9ndWkvYmFzZS9XaXphcmREaWFsb2cuanNcIlxuaW1wb3J0IHsgSW52b2ljZUFuZFBheW1lbnREYXRhUGFnZSwgSW52b2ljZUFuZFBheW1lbnREYXRhUGFnZUF0dHJzIH0gZnJvbSBcIi4vSW52b2ljZUFuZFBheW1lbnREYXRhUGFnZVwiXG5pbXBvcnQgeyBVcGdyYWRlQ29uZ3JhdHVsYXRpb25zUGFnZSwgVXBncmFkZUNvbmdyYXR1bGF0aW9uc1BhZ2VBdHRycyB9IGZyb20gXCIuL1VwZ3JhZGVDb25ncmF0dWxhdGlvbnNQYWdlLmpzXCJcbmltcG9ydCB7IFNpZ251cFBhZ2UsIFNpZ251cFBhZ2VBdHRycyB9IGZyb20gXCIuL1NpZ251cFBhZ2VcIlxuaW1wb3J0IHsgYXNzZXJ0TWFpbk9yTm9kZSwgaXNJT1NBcHAgfSBmcm9tIFwiLi4vYXBpL2NvbW1vbi9FbnZcIlxuaW1wb3J0IHsgbG9jYXRvciB9IGZyb20gXCIuLi9hcGkvbWFpbi9Db21tb25Mb2NhdG9yXCJcbmltcG9ydCB7IFN0b3JhZ2VCZWhhdmlvciB9IGZyb20gXCIuLi9taXNjL1VzYWdlVGVzdE1vZGVsXCJcbmltcG9ydCB7IEZlYXR1cmVMaXN0UHJvdmlkZXIsIFNlbGVjdGVkU3Vic2NyaXB0aW9uT3B0aW9ucyB9IGZyb20gXCIuL0ZlYXR1cmVMaXN0UHJvdmlkZXJcIlxuaW1wb3J0IHsgcXVlcnlBcHBTdG9yZVN1YnNjcmlwdGlvbk93bmVyc2hpcCwgVXBncmFkZVR5cGUgfSBmcm9tIFwiLi9TdWJzY3JpcHRpb25VdGlsc1wiXG5pbXBvcnQgeyBVcGdyYWRlQ29uZmlybVN1YnNjcmlwdGlvblBhZ2UgfSBmcm9tIFwiLi9VcGdyYWRlQ29uZmlybVN1YnNjcmlwdGlvblBhZ2UuanNcIlxuaW1wb3J0IHsgYXNQYXltZW50SW50ZXJ2YWwsIFBheW1lbnRJbnRlcnZhbCwgUHJpY2VBbmRDb25maWdQcm92aWRlciwgU3Vic2NyaXB0aW9uUHJpY2UgfSBmcm9tIFwiLi9QcmljZVV0aWxzXCJcbmltcG9ydCB7IGZvcm1hdE5hbWVBbmRBZGRyZXNzIH0gZnJvbSBcIi4uL2FwaS9jb21tb24vdXRpbHMvQ29tbW9uRm9ybWF0dGVyLmpzXCJcbmltcG9ydCB7IExvZ2luQ29udHJvbGxlciB9IGZyb20gXCIuLi9hcGkvbWFpbi9Mb2dpbkNvbnRyb2xsZXIuanNcIlxuaW1wb3J0IHsgTW9iaWxlUGF5bWVudFN1YnNjcmlwdGlvbk93bmVyc2hpcCB9IGZyb20gXCIuLi9uYXRpdmUvY29tbW9uL2dlbmVyYXRlZGlwYy9Nb2JpbGVQYXltZW50U3Vic2NyaXB0aW9uT3duZXJzaGlwLmpzXCJcbmltcG9ydCB7IERpYWxvZ1R5cGUgfSBmcm9tIFwiLi4vZ3VpL2Jhc2UvRGlhbG9nLmpzXCJcblxuYXNzZXJ0TWFpbk9yTm9kZSgpXG5leHBvcnQgdHlwZSBTdWJzY3JpcHRpb25QYXJhbWV0ZXJzID0ge1xuXHRzdWJzY3JpcHRpb246IHN0cmluZyB8IG51bGxcblx0dHlwZTogc3RyaW5nIHwgbnVsbFxuXHRpbnRlcnZhbDogc3RyaW5nIHwgbnVsbCAvLyB0eXBlZCBhcyBzdHJpbmcgYmVjYXVzZSBtLnBhcnNlUXVlcnlTdHJpbmcgcmV0dXJucyBhbiBvYmplY3Qgd2l0aCBzdHJpbmdzXG59XG5cbmV4cG9ydCB0eXBlIE5ld0FjY291bnREYXRhID0ge1xuXHRtYWlsQWRkcmVzczogc3RyaW5nXG5cdHJlY292ZXJDb2RlOiBIZXhcblx0cGFzc3dvcmQ6IHN0cmluZ1xufVxuZXhwb3J0IHR5cGUgVXBncmFkZVN1YnNjcmlwdGlvbkRhdGEgPSB7XG5cdG9wdGlvbnM6IFNlbGVjdGVkU3Vic2NyaXB0aW9uT3B0aW9uc1xuXHRpbnZvaWNlRGF0YTogSW52b2ljZURhdGFcblx0cGF5bWVudERhdGE6IFBheW1lbnREYXRhXG5cdHR5cGU6IFBsYW5UeXBlXG5cdHByaWNlOiBTdWJzY3JpcHRpb25QcmljZSB8IG51bGxcblx0bmV4dFllYXJQcmljZTogU3Vic2NyaXB0aW9uUHJpY2UgfCBudWxsXG5cdGFjY291bnRpbmdJbmZvOiBBY2NvdW50aW5nSW5mbyB8IG51bGxcblx0Ly8gbm90IGluaXRpYWxseSBzZXQgZm9yIHNpZ251cCBidXQgbG9hZGVkIGluIEludm9pY2VBbmRQYXltZW50RGF0YVBhZ2Vcblx0Y3VzdG9tZXI6IEN1c3RvbWVyIHwgbnVsbFxuXHQvLyBub3QgaW5pdGlhbGx5IHNldCBmb3Igc2lnbnVwIGJ1dCBsb2FkZWQgaW4gSW52b2ljZUFuZFBheW1lbnREYXRhUGFnZVxuXHRuZXdBY2NvdW50RGF0YTogTmV3QWNjb3VudERhdGEgfCBudWxsXG5cdHJlZ2lzdHJhdGlvbkRhdGFJZDogc3RyaW5nIHwgbnVsbFxuXHRwcmljZUluZm9UZXh0SWQ6IFRyYW5zbGF0aW9uS2V5IHwgbnVsbFxuXHR1cGdyYWRlVHlwZTogVXBncmFkZVR5cGVcblx0cGxhblByaWNlczogUHJpY2VBbmRDb25maWdQcm92aWRlclxuXHRjdXJyZW50UGxhbjogUGxhblR5cGUgfCBudWxsXG5cdHN1YnNjcmlwdGlvblBhcmFtZXRlcnM6IFN1YnNjcmlwdGlvblBhcmFtZXRlcnMgfCBudWxsXG5cdGZlYXR1cmVMaXN0UHJvdmlkZXI6IEZlYXR1cmVMaXN0UHJvdmlkZXJcblx0cmVmZXJyYWxDb2RlOiBzdHJpbmcgfCBudWxsXG5cdG11bHRpcGxlVXNlcnNBbGxvd2VkOiBib29sZWFuXG5cdGFjY2VwdGVkUGxhbnM6IEF2YWlsYWJsZVBsYW5UeXBlW11cblx0bXNnOiBNYXliZVRyYW5zbGF0aW9uIHwgbnVsbFxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2hvd1VwZ3JhZGVXaXphcmQobG9naW5zOiBMb2dpbkNvbnRyb2xsZXIsIGFjY2VwdGVkUGxhbnM6IEF2YWlsYWJsZVBsYW5UeXBlW10gPSBOZXdQYWlkUGxhbnMsIG1zZz86IE1heWJlVHJhbnNsYXRpb24pOiBQcm9taXNlPHZvaWQ+IHtcblx0Y29uc3QgW2N1c3RvbWVyLCBhY2NvdW50aW5nSW5mb10gPSBhd2FpdCBQcm9taXNlLmFsbChbbG9naW5zLmdldFVzZXJDb250cm9sbGVyKCkubG9hZEN1c3RvbWVyKCksIGxvZ2lucy5nZXRVc2VyQ29udHJvbGxlcigpLmxvYWRBY2NvdW50aW5nSW5mbygpXSlcblxuXHRjb25zdCBwcmljZURhdGFQcm92aWRlciA9IGF3YWl0IFByaWNlQW5kQ29uZmlnUHJvdmlkZXIuZ2V0SW5pdGlhbGl6ZWRJbnN0YW5jZShudWxsLCBsb2NhdG9yLnNlcnZpY2VFeGVjdXRvciwgbnVsbClcblxuXHRjb25zdCBwcmljZXMgPSBwcmljZURhdGFQcm92aWRlci5nZXRSYXdQcmljaW5nRGF0YSgpXG5cdGNvbnN0IGRvbWFpbkNvbmZpZyA9IGxvY2F0b3IuZG9tYWluQ29uZmlnUHJvdmlkZXIoKS5nZXRDdXJyZW50RG9tYWluQ29uZmlnKClcblx0Y29uc3QgZmVhdHVyZUxpc3RQcm92aWRlciA9IGF3YWl0IEZlYXR1cmVMaXN0UHJvdmlkZXIuZ2V0SW5pdGlhbGl6ZWRJbnN0YW5jZShkb21haW5Db25maWcpXG5cdGNvbnN0IHVwZ3JhZGVEYXRhOiBVcGdyYWRlU3Vic2NyaXB0aW9uRGF0YSA9IHtcblx0XHRvcHRpb25zOiB7XG5cdFx0XHRidXNpbmVzc1VzZTogc3RyZWFtKHByaWNlcy5idXNpbmVzcyksXG5cdFx0XHRwYXltZW50SW50ZXJ2YWw6IHN0cmVhbShhc1BheW1lbnRJbnRlcnZhbChhY2NvdW50aW5nSW5mby5wYXltZW50SW50ZXJ2YWwpKSxcblx0XHR9LFxuXHRcdGludm9pY2VEYXRhOiB7XG5cdFx0XHRpbnZvaWNlQWRkcmVzczogZm9ybWF0TmFtZUFuZEFkZHJlc3MoYWNjb3VudGluZ0luZm8uaW52b2ljZU5hbWUsIGFjY291bnRpbmdJbmZvLmludm9pY2VBZGRyZXNzKSxcblx0XHRcdGNvdW50cnk6IGFjY291bnRpbmdJbmZvLmludm9pY2VDb3VudHJ5ID8gZ2V0QnlBYmJyZXZpYXRpb24oYWNjb3VudGluZ0luZm8uaW52b2ljZUNvdW50cnkpIDogbnVsbCxcblx0XHRcdHZhdE51bWJlcjogYWNjb3VudGluZ0luZm8uaW52b2ljZVZhdElkTm8sIC8vIG9ubHkgZm9yIEVVIGNvdW50cmllcyBvdGhlcndpc2UgZW1wdHlcblx0XHR9LFxuXHRcdHBheW1lbnREYXRhOiB7XG5cdFx0XHRwYXltZW50TWV0aG9kOiBnZXRQYXltZW50TWV0aG9kVHlwZShhY2NvdW50aW5nSW5mbykgfHwgKGF3YWl0IGdldERlZmF1bHRQYXltZW50TWV0aG9kKCkpLFxuXHRcdFx0Y3JlZGl0Q2FyZERhdGE6IG51bGwsXG5cdFx0fSxcblx0XHRwcmljZTogbnVsbCxcblx0XHR0eXBlOiBQbGFuVHlwZS5SZXZvbHV0aW9uYXJ5LFxuXHRcdG5leHRZZWFyUHJpY2U6IG51bGwsXG5cdFx0YWNjb3VudGluZ0luZm86IGFjY291bnRpbmdJbmZvLFxuXHRcdGN1c3RvbWVyOiBjdXN0b21lcixcblx0XHRuZXdBY2NvdW50RGF0YTogbnVsbCxcblx0XHRyZWdpc3RyYXRpb25EYXRhSWQ6IG51bGwsXG5cdFx0cHJpY2VJbmZvVGV4dElkOiBwcmljZURhdGFQcm92aWRlci5nZXRQcmljZUluZm9NZXNzYWdlKCksXG5cdFx0dXBncmFkZVR5cGU6IFVwZ3JhZGVUeXBlLkluaXRpYWwsXG5cdFx0Ly8gRnJlZSB1c2VkIHRvIGJlIGFsd2F5cyBzZWxlY3RlZCBoZXJlIGZvciBjdXJyZW50IHBsYW4sIGJ1dCByZXN1bHRlZCBpbiBpdCBkaXNwbGF5aW5nIFwiZnJlZVwiIGFzIGN1cnJlbnQgcGxhbiBmb3IgbGVnYWN5IHVzZXJzXG5cdFx0Y3VycmVudFBsYW46IGxvZ2lucy5nZXRVc2VyQ29udHJvbGxlcigpLmlzRnJlZUFjY291bnQoKSA/IFBsYW5UeXBlLkZyZWUgOiBudWxsLFxuXHRcdHN1YnNjcmlwdGlvblBhcmFtZXRlcnM6IG51bGwsXG5cdFx0cGxhblByaWNlczogcHJpY2VEYXRhUHJvdmlkZXIsXG5cdFx0ZmVhdHVyZUxpc3RQcm92aWRlcjogZmVhdHVyZUxpc3RQcm92aWRlcixcblx0XHRyZWZlcnJhbENvZGU6IG51bGwsXG5cdFx0bXVsdGlwbGVVc2Vyc0FsbG93ZWQ6IGZhbHNlLFxuXHRcdGFjY2VwdGVkUGxhbnMsXG5cdFx0bXNnOiBtc2cgIT0gbnVsbCA/IG1zZyA6IG51bGwsXG5cdH1cblxuXHRjb25zdCB3aXphcmRQYWdlcyA9IFtcblx0XHR3aXphcmRQYWdlV3JhcHBlcihVcGdyYWRlU3Vic2NyaXB0aW9uUGFnZSwgbmV3IFVwZ3JhZGVTdWJzY3JpcHRpb25QYWdlQXR0cnModXBncmFkZURhdGEpKSxcblx0XHR3aXphcmRQYWdlV3JhcHBlcihJbnZvaWNlQW5kUGF5bWVudERhdGFQYWdlLCBuZXcgSW52b2ljZUFuZFBheW1lbnREYXRhUGFnZUF0dHJzKHVwZ3JhZGVEYXRhKSksXG5cdFx0d2l6YXJkUGFnZVdyYXBwZXIoVXBncmFkZUNvbmZpcm1TdWJzY3JpcHRpb25QYWdlLCBuZXcgSW52b2ljZUFuZFBheW1lbnREYXRhUGFnZUF0dHJzKHVwZ3JhZGVEYXRhKSksXG5cdF1cblx0aWYgKGlzSU9TQXBwKCkpIHtcblx0XHR3aXphcmRQYWdlcy5zcGxpY2UoMSwgMSkgLy8gZG8gbm90IHNob3cgdGhpcyBwYWdlIG9uIEFwcFN0b3JlIHBheW1lbnQgc2luY2Ugd2UgYXJlIG9ubHkgYWJsZSB0byBzaG93IHRoaXMgc2luZ2xlIHBheW1lbnQgbWV0aG9kIG9uIGlPU1xuXHR9XG5cblx0Y29uc3QgZGVmZXJyZWQgPSBkZWZlcjx2b2lkPigpXG5cdGNvbnN0IHdpemFyZEJ1aWxkZXIgPSBjcmVhdGVXaXphcmREaWFsb2coXG5cdFx0dXBncmFkZURhdGEsXG5cdFx0d2l6YXJkUGFnZXMsXG5cdFx0YXN5bmMgKCkgPT4ge1xuXHRcdFx0ZGVmZXJyZWQucmVzb2x2ZSgpXG5cdFx0fSxcblx0XHREaWFsb2dUeXBlLkVkaXRMYXJnZSxcblx0KVxuXHR3aXphcmRCdWlsZGVyLmRpYWxvZy5zaG93KClcblx0cmV0dXJuIGRlZmVycmVkLnByb21pc2Vcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWRTaWdudXBXaXphcmQoXG5cdHN1YnNjcmlwdGlvblBhcmFtZXRlcnM6IFN1YnNjcmlwdGlvblBhcmFtZXRlcnMgfCBudWxsLFxuXHRyZWdpc3RyYXRpb25EYXRhSWQ6IHN0cmluZyB8IG51bGwsXG5cdHJlZmVycmFsQ29kZTogc3RyaW5nIHwgbnVsbCxcblx0YWNjZXB0ZWRQbGFuczogQXZhaWxhYmxlUGxhblR5cGVbXSA9IEF2YWlsYWJsZVBsYW5zLFxuKTogUHJvbWlzZTx2b2lkPiB7XG5cdGNvbnN0IHVzYWdlVGVzdE1vZGVsID0gbG9jYXRvci51c2FnZVRlc3RNb2RlbFxuXG5cdHVzYWdlVGVzdE1vZGVsLnNldFN0b3JhZ2VCZWhhdmlvcihTdG9yYWdlQmVoYXZpb3IuRXBoZW1lcmFsKVxuXHRsb2NhdG9yLnVzYWdlVGVzdENvbnRyb2xsZXIuc2V0VGVzdHMoYXdhaXQgdXNhZ2VUZXN0TW9kZWwubG9hZEFjdGl2ZVVzYWdlVGVzdHMoKSlcblxuXHRjb25zdCBwcmljZURhdGFQcm92aWRlciA9IGF3YWl0IFByaWNlQW5kQ29uZmlnUHJvdmlkZXIuZ2V0SW5pdGlhbGl6ZWRJbnN0YW5jZShyZWdpc3RyYXRpb25EYXRhSWQsIGxvY2F0b3Iuc2VydmljZUV4ZWN1dG9yLCByZWZlcnJhbENvZGUpXG5cdGNvbnN0IHByaWNlcyA9IHByaWNlRGF0YVByb3ZpZGVyLmdldFJhd1ByaWNpbmdEYXRhKClcblx0Y29uc3QgZG9tYWluQ29uZmlnID0gbG9jYXRvci5kb21haW5Db25maWdQcm92aWRlcigpLmdldEN1cnJlbnREb21haW5Db25maWcoKVxuXHRjb25zdCBmZWF0dXJlTGlzdFByb3ZpZGVyID0gYXdhaXQgRmVhdHVyZUxpc3RQcm92aWRlci5nZXRJbml0aWFsaXplZEluc3RhbmNlKGRvbWFpbkNvbmZpZylcblxuXHRsZXQgbWVzc2FnZTogTWF5YmVUcmFuc2xhdGlvbiB8IG51bGxcblx0aWYgKGlzSU9TQXBwKCkpIHtcblx0XHRjb25zdCBhcHBzdG9yZVN1YnNjcmlwdGlvbk93bmVyc2hpcCA9IGF3YWl0IHF1ZXJ5QXBwU3RvcmVTdWJzY3JpcHRpb25Pd25lcnNoaXAobnVsbClcblx0XHQvLyBpZiB3ZSBhcmUgb24gaU9TIGFwcCB3ZSBvbmx5IHNob3cgb3RoZXIgcGxhbnMgaWYgQXBwU3RvcmUgcGF5bWVudHMgYXJlIGVuYWJsZWQgYW5kIHRoZXJlJ3Mgbm8gc3Vic2NyaXB0aW9uIGZvciB0aGlzIEFwcGxlIElELlxuXHRcdGlmIChhcHBzdG9yZVN1YnNjcmlwdGlvbk93bmVyc2hpcCAhPT0gTW9iaWxlUGF5bWVudFN1YnNjcmlwdGlvbk93bmVyc2hpcC5Ob1N1YnNjcmlwdGlvbikge1xuXHRcdFx0YWNjZXB0ZWRQbGFucyA9IGFjY2VwdGVkUGxhbnMuZmlsdGVyKChwbGFuKSA9PiBwbGFuID09PSBQbGFuVHlwZS5GcmVlKVxuXHRcdH1cblx0XHRtZXNzYWdlID1cblx0XHRcdGFwcHN0b3JlU3Vic2NyaXB0aW9uT3duZXJzaGlwICE9IE1vYmlsZVBheW1lbnRTdWJzY3JpcHRpb25Pd25lcnNoaXAuTm9TdWJzY3JpcHRpb25cblx0XHRcdFx0PyBsYW5nLmdldFRyYW5zbGF0aW9uKFwic3RvcmVNdWx0aVN1YnNjcmlwdGlvbkVycm9yX21zZ1wiLCB7IFwie0FwcFN0b3JlUGF5bWVudH1cIjogSW5mb0xpbmsuQXBwU3RvcmVQYXltZW50IH0pXG5cdFx0XHRcdDogbnVsbFxuXHR9IGVsc2Uge1xuXHRcdG1lc3NhZ2UgPSBudWxsXG5cdH1cblxuXHRjb25zdCBzaWdudXBEYXRhOiBVcGdyYWRlU3Vic2NyaXB0aW9uRGF0YSA9IHtcblx0XHRvcHRpb25zOiB7XG5cdFx0XHRidXNpbmVzc1VzZTogc3RyZWFtKHByaWNlcy5idXNpbmVzcyksXG5cdFx0XHRwYXltZW50SW50ZXJ2YWw6IHN0cmVhbShQYXltZW50SW50ZXJ2YWwuWWVhcmx5KSxcblx0XHR9LFxuXHRcdGludm9pY2VEYXRhOiB7XG5cdFx0XHRpbnZvaWNlQWRkcmVzczogXCJcIixcblx0XHRcdGNvdW50cnk6IG51bGwsXG5cdFx0XHR2YXROdW1iZXI6IFwiXCIsIC8vIG9ubHkgZm9yIEVVIGNvdW50cmllcyBvdGhlcndpc2UgZW1wdHlcblx0XHR9LFxuXHRcdHBheW1lbnREYXRhOiB7XG5cdFx0XHRwYXltZW50TWV0aG9kOiBhd2FpdCBnZXREZWZhdWx0UGF5bWVudE1ldGhvZCgpLFxuXHRcdFx0Y3JlZGl0Q2FyZERhdGE6IG51bGwsXG5cdFx0fSxcblx0XHRwcmljZTogbnVsbCxcblx0XHRuZXh0WWVhclByaWNlOiBudWxsLFxuXHRcdHR5cGU6IFBsYW5UeXBlLkZyZWUsXG5cdFx0YWNjb3VudGluZ0luZm86IG51bGwsXG5cdFx0Y3VzdG9tZXI6IG51bGwsXG5cdFx0bmV3QWNjb3VudERhdGE6IG51bGwsXG5cdFx0cmVnaXN0cmF0aW9uRGF0YUlkLFxuXHRcdHByaWNlSW5mb1RleHRJZDogcHJpY2VEYXRhUHJvdmlkZXIuZ2V0UHJpY2VJbmZvTWVzc2FnZSgpLFxuXHRcdHVwZ3JhZGVUeXBlOiBVcGdyYWRlVHlwZS5TaWdudXAsXG5cdFx0cGxhblByaWNlczogcHJpY2VEYXRhUHJvdmlkZXIsXG5cdFx0Y3VycmVudFBsYW46IG51bGwsXG5cdFx0c3Vic2NyaXB0aW9uUGFyYW1ldGVyczogc3Vic2NyaXB0aW9uUGFyYW1ldGVycyxcblx0XHRmZWF0dXJlTGlzdFByb3ZpZGVyOiBmZWF0dXJlTGlzdFByb3ZpZGVyLFxuXHRcdHJlZmVycmFsQ29kZSxcblx0XHRtdWx0aXBsZVVzZXJzQWxsb3dlZDogZmFsc2UsXG5cdFx0YWNjZXB0ZWRQbGFucyxcblx0XHRtc2c6IG1lc3NhZ2UsXG5cdH1cblxuXHRjb25zdCBpbnZvaWNlQXR0cnMgPSBuZXcgSW52b2ljZUFuZFBheW1lbnREYXRhUGFnZUF0dHJzKHNpZ251cERhdGEpXG5cblx0Y29uc3Qgd2l6YXJkUGFnZXMgPSBbXG5cdFx0d2l6YXJkUGFnZVdyYXBwZXIoVXBncmFkZVN1YnNjcmlwdGlvblBhZ2UsIG5ldyBVcGdyYWRlU3Vic2NyaXB0aW9uUGFnZUF0dHJzKHNpZ251cERhdGEpKSxcblx0XHR3aXphcmRQYWdlV3JhcHBlcihTaWdudXBQYWdlLCBuZXcgU2lnbnVwUGFnZUF0dHJzKHNpZ251cERhdGEpKSxcblx0XHR3aXphcmRQYWdlV3JhcHBlcihJbnZvaWNlQW5kUGF5bWVudERhdGFQYWdlLCBpbnZvaWNlQXR0cnMpLCAvLyB0aGlzIHBhZ2Ugd2lsbCBsb2dpbiB0aGUgdXNlciBhZnRlciBzaWduaW5nIHVwIHdpdGggbmV3YWNjb3VudCBkYXRhXG5cdFx0d2l6YXJkUGFnZVdyYXBwZXIoVXBncmFkZUNvbmZpcm1TdWJzY3JpcHRpb25QYWdlLCBpbnZvaWNlQXR0cnMpLCAvLyB0aGlzIHBhZ2Ugd2lsbCBsb2dpbiB0aGUgdXNlciBpZiB0aGV5IGFyZSBub3QgbG9naW4gZm9yIGlPUyBwYXltZW50IHRocm91Z2ggQXBwU3RvcmVcblx0XHR3aXphcmRQYWdlV3JhcHBlcihVcGdyYWRlQ29uZ3JhdHVsYXRpb25zUGFnZSwgbmV3IFVwZ3JhZGVDb25ncmF0dWxhdGlvbnNQYWdlQXR0cnMoc2lnbnVwRGF0YSkpLFxuXHRdXG5cblx0aWYgKGlzSU9TQXBwKCkpIHtcblx0XHR3aXphcmRQYWdlcy5zcGxpY2UoMiwgMSkgLy8gZG8gbm90IHNob3cgdGhpcyBwYWdlIG9uIEFwcFN0b3JlIHBheW1lbnQgc2luY2Ugd2UgYXJlIG9ubHkgYWJsZSB0byBzaG93IHRoaXMgc2luZ2xlIHBheW1lbnQgbWV0aG9kIG9uIGlPU1xuXHR9XG5cblx0Y29uc3Qgd2l6YXJkQnVpbGRlciA9IGNyZWF0ZVdpemFyZERpYWxvZyhcblx0XHRzaWdudXBEYXRhLFxuXHRcdHdpemFyZFBhZ2VzLFxuXHRcdGFzeW5jICgpID0+IHtcblx0XHRcdGlmIChsb2NhdG9yLmxvZ2lucy5pc1VzZXJMb2dnZWRJbigpKSB7XG5cdFx0XHRcdC8vIHRoaXMgZW5zdXJlcyB0aGF0IGFsbCBjcmVhdGVkIHNlc3Npb25zIGR1cmluZyBzaWdudXAgcHJvY2VzcyBhcmUgY2xvc2VkXG5cdFx0XHRcdC8vIGVpdGhlciBieSBjbGlja2luZyBvbiBgY2FuY2VsYCwgY2xvc2luZyB0aGUgd2luZG93LCBvciBjb25maXJtIG9uIHRoZSBVcGdyYWRlQ29uZ3JhdHVsYXRpb25zUGFnZVxuXHRcdFx0XHRhd2FpdCBsb2NhdG9yLmxvZ2lucy5sb2dvdXQoZmFsc2UpXG5cdFx0XHR9XG5cblx0XHRcdGlmIChzaWdudXBEYXRhLm5ld0FjY291bnREYXRhKSB7XG5cdFx0XHRcdG0ucm91dGUuc2V0KFwiL2xvZ2luXCIsIHtcblx0XHRcdFx0XHRub0F1dG9Mb2dpbjogdHJ1ZSxcblx0XHRcdFx0XHRsb2dpbldpdGg6IHNpZ251cERhdGEubmV3QWNjb3VudERhdGEubWFpbEFkZHJlc3MsXG5cdFx0XHRcdH0pXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRtLnJvdXRlLnNldChcIi9sb2dpblwiLCB7XG5cdFx0XHRcdFx0bm9BdXRvTG9naW46IHRydWUsXG5cdFx0XHRcdH0pXG5cdFx0XHR9XG5cdFx0fSxcblx0XHREaWFsb2dUeXBlLkVkaXRMYXJnZSxcblx0KVxuXG5cdC8vIGZvciBzaWdudXAgc3BlY2lmaWNhbGx5LCB3ZSBvbmx5IHdhbnQgdGhlIGludm9pY2UgYW5kIHBheW1lbnQgcGFnZSBhcyB3ZWxsIGFzIHRoZSBjb25maXJtYXRpb24gcGFnZSB0byBzaG93IHVwIGlmIHNpZ25pbmcgdXAgZm9yIGEgcGFpZCBhY2NvdW50IChhbmQgdGhlIHVzZXIgZGlkIG5vdCBnbyBiYWNrIHRvIHRoZSBmaXJzdCBwYWdlISlcblx0aW52b2ljZUF0dHJzLnNldEVuYWJsZWRGdW5jdGlvbigoKSA9PiBzaWdudXBEYXRhLnR5cGUgIT09IFBsYW5UeXBlLkZyZWUgJiYgd2l6YXJkQnVpbGRlci5hdHRycy5jdXJyZW50UGFnZSAhPT0gd2l6YXJkUGFnZXNbMF0pXG5cblx0d2l6YXJkQnVpbGRlci5kaWFsb2cuc2hvdygpXG59XG4iLCJpbXBvcnQgbSBmcm9tIFwibWl0aHJpbFwiXG5pbXBvcnQgeyBEaWFsb2csIERpYWxvZ1R5cGUgfSBmcm9tIFwiLi4vZ3VpL2Jhc2UvRGlhbG9nXCJcbmltcG9ydCB7IGxhbmcgfSBmcm9tIFwiLi4vbWlzYy9MYW5ndWFnZVZpZXdNb2RlbFwiXG5pbXBvcnQgeyBhc3NlcnRNYWluT3JOb2RlLCBpc0FwcCB9IGZyb20gXCIuLi9hcGkvY29tbW9uL0VudlwiXG5pbXBvcnQgeyBmb3JtYXREYXRlIH0gZnJvbSBcIi4uL21pc2MvRm9ybWF0dGVyXCJcbmltcG9ydCB7IEh0bWxFZGl0b3IsIEh0bWxFZGl0b3JNb2RlIH0gZnJvbSBcIi4uL2d1aS9lZGl0b3IvSHRtbEVkaXRvclwiXG5pbXBvcnQgdHlwZSB7IEFjY291bnRpbmdJbmZvLCBDdXN0b21lciwgR3JvdXBJbmZvLCBPcmRlclByb2Nlc3NpbmdBZ3JlZW1lbnQgfSBmcm9tIFwiLi4vYXBpL2VudGl0aWVzL3N5cy9UeXBlUmVmcy5qc1wiXG5pbXBvcnQgeyBjcmVhdGVTaWduT3JkZXJQcm9jZXNzaW5nQWdyZWVtZW50RGF0YSB9IGZyb20gXCIuLi9hcGkvZW50aXRpZXMvc3lzL1R5cGVSZWZzLmpzXCJcbmltcG9ydCB7IG5ldmVyTnVsbCB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHsgbG9jYXRvciB9IGZyb20gXCIuLi9hcGkvbWFpbi9Db21tb25Mb2NhdG9yXCJcbmltcG9ydCB7IFNpZ25PcmRlclByb2Nlc3NpbmdBZ3JlZW1lbnRTZXJ2aWNlIH0gZnJvbSBcIi4uL2FwaS9lbnRpdGllcy9zeXMvU2VydmljZXNcIlxuaW1wb3J0IHsgZm9ybWF0TmFtZUFuZEFkZHJlc3MgfSBmcm9tIFwiLi4vYXBpL2NvbW1vbi91dGlscy9Db21tb25Gb3JtYXR0ZXIuanNcIlxuaW1wb3J0IHsgZ2V0TWFpbEFkZHJlc3NEaXNwbGF5VGV4dCB9IGZyb20gXCIuLi9tYWlsRnVuY3Rpb25hbGl0eS9TaGFyZWRNYWlsVXRpbHMuanNcIlxuXG5hc3NlcnRNYWluT3JOb2RlKClcbmNvbnN0IFBSSU5UX0RJVl9JRCA9IFwicHJpbnQtZGl2XCJcbmNvbnN0IGFncmVlbWVudFRleHRzID0ge1xuXHRcIjFfZW5cIjoge1xuXHRcdGhlYWRpbmc6XG5cdFx0XHQnPGRpdiBjbGFzcz1cInBhcGVydGV4dFwiPjxoMyBzdHlsZT1cInRleHQtYWxpZ246IGNlbnRlcjtcIiBpZD1cIk9yZGVycHJvY2Vzc2luZ2FncmVlbWVudC1PcmRlcnByb2Nlc3NpbmdhZ3JlZW1lbnRcIj5PcmRlciBwcm9jZXNzaW5nIGFncmVlbWVudDwvaDM+PHAgc3R5bGU9XCJ0ZXh0LWFsaWduOiBjZW50ZXI7XCI+YmV0d2VlbjwvcD4nLFxuXHRcdGNvbnRlbnQ6XG5cdFx0XHQnPHAgc3R5bGU9XCJ0ZXh0LWFsaWduOiBjZW50ZXI7XCI+LSZuYnNwO2NvbnRyb2xsZXIgLTxicj5oZXJlaW5hZnRlciByZWZlcnJlZCB0byBhcyB0aGUgQ2xpZW50PC9wPjxwIHN0eWxlPVwidGV4dC1hbGlnbjogY2VudGVyO1wiPmFuZDwvcD48cCBzdHlsZT1cInRleHQtYWxpZ246IGNlbnRlcjtcIj5UdXRhbyBHbWJILCBEZWlzdGVyc3RyLiAxN2EsIDMwNDQ5IEhhbm5vdmVyLCBHZXJtYW55PC9wPjxwIHN0eWxlPVwidGV4dC1hbGlnbjogY2VudGVyO1wiPi0mbmJzcDtwcm9jZXNzb3IgLTxicj5oZXJlaW5hZnRlciByZWZlcnJlZCB0byBhcyB0aGUgU3VwcGxpZXI8L3A+PHAgc3R5bGU9XCJ0ZXh0LWFsaWduOiBjZW50ZXI7XCI+Jm5ic3A7PC9wPjxoNCBpZD1cIk9yZGVycHJvY2Vzc2luZ2FncmVlbWVudC0xLlN1YmplY3RtYXR0ZXJhbmRkdXJhdGlvbm9mdGhlYWdyZWVtZW50XCI+MS4mbmJzcDtTdWJqZWN0IG1hdHRlciBhbmQgZHVyYXRpb24gb2YgdGhlIGFncmVlbWVudDwvaDQ+PHA+VGhlIFN1YmplY3QgbWF0dGVyIG9mIHRoZSBhZ3JlZW1lbnQgcmVzdWx0cyBmcm9tIHRoZSBUZXJtcyBhbmQgQ29uZGl0aW9ucyBvZiBUdXRhbyBHbWJIIGluIGl0cyBjdXJyZW50IHZlcnNpb24sIHNlZSA8c3BhbiBjbGFzcz1cIm5vbGlua1wiPmh0dHBzOi8vdHV0YS5jb20vdGVybXM8L3NwYW4+LCB3aGljaCBpcyByZWZlcnJlZCB0byBoZXJlIChoZXJlaW5hZnRlciByZWZlcnJlZCB0byBhcyBTZXJ2aWNlIEFncmVlbWVudCkuIFRoZSBTdXBwbGllciBwcm9jZXNzZXMgcGVyc29uYWwgZGF0YSBmb3IgdGhlIENsaWVudCBhY2NvcmRpbmcgdG8gQXJ0LiA0IG5vLiAyIGFuZCBBcnQuIDI4IEdEUFIgYmFzZWQgb24gdGhpcyBhZ3JlZW1lbnQuPC9wPjxwPlRoZSBkdXJhdGlvbiBvZiB0aGlzIEFncmVlbWVudCBjb3JyZXNwb25kcyB0byB0aGUgc2VsZWN0ZWQgdGVybSBvZiBwb2xpY3kgaW4gdGhlIHNlbGVjdGVkIHRhcmlmZi48L3A+PGg0IGlkPVwiT3JkZXJwcm9jZXNzaW5nYWdyZWVtZW50LTIuUHVycG9zZSxUeXBlb2ZEYXRhYW5kQ2F0ZWdvcmllc29mRGF0YVN1YmplY3RzXCI+Mi4gUHVycG9zZSwgVHlwZSBvZiBEYXRhIGFuZCBDYXRlZ29yaWVzIG9mIERhdGEgU3ViamVjdHM8L2g0PjxwPkZvciB0aGUgaW5pdGlhdGlvbiBvZiBhIGNvbnRyYWN0dWFsIHJlbGF0aW9uc2hpcCBhbmQgZm9yIHNlcnZpY2UgcHJvdmlzaW9uPC9wPjx1bD48bGk+dGhlIG5ld2x5IHJlZ2lzdGVyZWQgZW1haWwgYWRkcmVzczwvbGk+PC91bD48cD5pcyBjb2xsZWN0ZWQgYXMgaW52ZW50b3J5IGRhdGEuPC9wPjxwPkZvciBpbnZvaWNpbmcgYW5kIGRldGVybWluaW5nIHRoZSBWQVQ8L3A+PHVsPjxsaT50aGUgZG9taWNpbGUgb2YgdGhlIGN1c3RvbWVyIChjb3VudHJ5KTwvbGk+PGxpPnRoZSBpbnZvaWNpbmcgYWRkcmVzczwvbGk+PGxpPnRoZSBWQVQgaWRlbnRpZmljYXRpb24gbnVtYmVyIChvbmx5IGZvciBidXNpbmVzcyBjdXN0b21lcnMgb2Ygc29tZSBjb3VudHJpZXMpPC9saT48L3VsPjxwPmlzIGNvbGxlY3RlZCBhcyBpbnZlbnRvcnkgZGF0YS48L3A+PHA+Rm9yIHRoZSB0cmFuc2FjdGlvbiBvZiBwYXltZW50cyB0aGUgZm9sbG93aW5nIHBheW1lbnQgZGF0YSAoaW52ZW50b3J5IGRhdGEpIGlzIGNvbGxlY3RlZCBkZXBlbmRpbmcgb24gdGhlIGNob3NlbiBwYXltZW50IG1ldGhvZDo8L3A+PHVsPjxsaT5CYW5raW5nIGRldGFpbHMgKGFjY291bnQgbnVtYmVyIGFuZCBzb3J0IGNvZGUgYW5kIElCQU4vQklDLCBpZiBuZWNlc3NhcnkgYmFuayBuYW1lLCBhY2NvdW50IGhvbGRlciksPC9saT48bGk+Y3JlZGl0IGNhcmQgZGF0YSw8L2xpPjxsaT5QYXlQYWwgdXNlciBuYW1lLjwvbGk+PC91bD48cD5Gb3IgdGhlIGV4ZWN1dGlvbiBvZiBkaXJlY3QgZGViaXRpbmcsIHRoZSBiYW5raW5nIGRldGFpbHMgYXJlIHNoYXJlZCB3aXRoIHRoZSBhdXRob3JpemVkIGNyZWRpdCBpbnN0aXR1dGlvbi4gRm9yIHRoZSBleGVjdXRpb24gb2YgUGF5UGFsIHBheW1lbnRzLCB0aGUgUGF5UGFsIGRhdGEgaXMgc2hhcmVkIHdpdGggUGF5UGFsIChFdXJvcGUpLiBGb3IgdGhlIGV4ZWN1dGlvbiBvZiBjcmVkaXQgY2FyZCBwYXltZW50cywgdGhlIGNyZWRpdCBjYXJkIGRhdGEgaXMgc2hhcmVkIHdpdGggdGhlIHBheW1lbnQgc2VydmljZSBwcm92aWRlciZuYnNwO0JyYWludHJlZSZuYnNwO2ZvciBzdWJwcm9jZXNzaW5nLiBUaGlzIGluY2x1ZGVzIHRoZSB0cmFuc2ZlciBvZiBwZXJzb25hbCBkYXRhIGludG8gYSB0aGlyZCBjb3VudHJ5IChVU0EpLiBBbiBhZ3JlZW1lbnQgZW50ZXJlZCBpbnRvIHdpdGggQnJhaW50cmVlIGRlZmluZXMgYXBwcm9wcmlhdGUgc2FmZWd1YXJkcyBhbmQgZGVtYW5kcyB0aGF0IHRoZSBkYXRhIGlzIG9ubHkgcHJvY2Vzc2VkIGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgR0RQUiBhbmQgb25seSBmb3IgdGhlIHB1cnBvc2Ugb2YgZXhlY3V0aW9uIG9mIHBheW1lbnRzLiBUaGlzIGFncmVlbWVudCBjYW4gYmUgZXhhbWluZWQgaGVyZTombmJzcDs8c3BhbiBjbGFzcz1cIm5vbGlua1wiPmh0dHBzOi8vd3d3LmJyYWludHJlZXBheW1lbnRzLmNvbS9hc3NldHMvQnJhaW50cmVlLVBTQS1Nb2RlbC1DbGF1c2VzLU1hcmNoMjAxOC5wZGY8L3NwYW4+PC9wPjxwPlR1dGFub3RhIHByb3ZpZGVzIHNlcnZpY2VzIGZvciBzYXZpbmcsIGVkaXRpbmcsIHByZXNlbnRhdGlvbiBhbmQgZWxlY3Ryb25pYyB0cmFuc21pc3Npb24gb2YgZGF0YSwgc3VjaCBhcyBlbWFpbCBzZXJ2aWNlLCBjb250YWN0IG1hbmFnZW1lbnQgYW5kIGRhdGEgc3RvcmFnZS4gV2l0aGluIHRoZSBjb250ZXh0IG9mIHRoaXMgY29udGVudCBkYXRhLCBwZXJzb25hbCBkYXRhIG9mIHRoZSBDbGllbnQgbWF5IGJlIHByb2Nlc3NlZC4gQWxsIHRleHR1YWwgY29udGVudCBpcyBlbmNyeXB0ZWQgZm9yIHRoZSB1c2VyIGFuZCBpdHMgY29tbXVuaWNhdGlvbiBwYXJ0bmVycyBpbiBhIHdheSB0aGF0IGV2ZW4gVHV0YW8gR21iSCBoYXMgbm8gYWNjZXNzIHRvIHRoZSBkYXRhLiZuYnNwOzwvcD48cD5JbiBvcmRlciB0byBtYWludGFpbiBlbWFpbCBzZXJ2ZXIgb3BlcmF0aW9ucywgZm9yIGVycm9yIGRpYWdub3NpcyBhbmQgZm9yIHByZXZlbnRpb24gb2YgYWJ1c2UsIG1haWwgc2VydmVyIGxvZ3MgYXJlIHN0b3JlZCBtYXguIDMwIGRheXMuIFRoZXNlIGxvZ3MgY29udGFpbiBzZW5kZXIgYW5kIHJlY2lwaWVudCBlbWFpbCBhZGRyZXNzZXMgYW5kIHRpbWUgb2YgY29ubmVjdGlvbiwgYnV0IG5vIGN1c3RvbWVyIElQIGFkZHJlc3Nlcy4mbmJzcDs8L3A+PHA+SW4gb3JkZXIgdG8gbWFpbnRhaW4gb3BlcmF0aW9ucywgZm9yIHByZXZlbnRpb24gb2YgYWJ1c2UgYW5kIGFuZCBmb3IgdmlzaXRvcnMgYW5hbHlzaXMsIElQIGFkZHJlc3NlcyBvZiB1c2VycyBhcmUgcHJvY2Vzc2VkLiBTdG9yYWdlIG9ubHkgdGFrZXMgcGxhY2UgZm9yIElQIGFkZHJlc3NlcyBtYWRlIGFub255bW91cyB3aGljaCBhcmUgdGhlcmVmb3JlIG5vdCBwZXJzb25hbCBkYXRhIGFueSBtb3JlLjwvcD48cD5XaXRoIHRoZSBleGNlcHRpb24gb2YgcGF5bWVudCBkYXRhLCB0aGUgcGVyc29uYWwgZGF0YSBpbmNsdWRpbmcgdGhlIGVtYWlsIGFkZHJlc3MgaXMgbm90IGRpc2Nsb3NlZCB0byB0aGlyZCBwYXJ0aWVzLiBIb3dldmVyLCBUdXRhbyBHbWJIIGNhbiBiZSBsZWdhbGx5IGJvdW5kIHRvIHByb3ZpZGUgY29udGVudCBkYXRhIChpbiBjYXNlIG9mIGEgdmFsaWQgR2VybWFuIGNvdXJ0IG9yZGVyKSBhbmQgaW52ZW50b3J5IGRhdGEgdG8gcHJvc2VjdXRpb24gc2VydmljZXMuIFRoZXJlIHdpbGwgYmUgbm8gc2FsZSBvZiBkYXRhLjwvcD48cD5UaGUgdW5kZXJ0YWtpbmcgb2YgdGhlIGNvbnRyYWN0dWFsbHkgYWdyZWVkIFByb2Nlc3Npbmcgb2YgRGF0YSBzaGFsbCBiZSBjYXJyaWVkIG91dCBleGNsdXNpdmVseSB3aXRoaW4gYSBNZW1iZXIgU3RhdGUgb2YgdGhlIEV1cm9wZWFuIFVuaW9uIChFVSkgb3Igd2l0aGluIGEgTWVtYmVyIFN0YXRlIG9mIHRoZSBFdXJvcGVhbiBFY29ub21pYyBBcmVhIChFRUEpLiBFYWNoIGFuZCBldmVyeSBUcmFuc2ZlciBvZiBEYXRhIHRvIGEgU3RhdGUgd2hpY2ggaXMgbm90IGEgTWVtYmVyIFN0YXRlIG9mIGVpdGhlciB0aGUgRVUgb3IgdGhlIEVFQSByZXF1aXJlcyB0aGUgcHJpb3IgYWdyZWVtZW50IG9mIHRoZSBDbGllbnQgYW5kIHNoYWxsIG9ubHkgb2NjdXIgaWYgdGhlIHNwZWNpZmljIENvbmRpdGlvbnMgb2YgQXJ0aWNsZSA0NCBldCBzZXEuIEdEUFIgaGF2ZSBiZWVuIGZ1bGZpbGxlZC48L3A+PHA+VGhlIENhdGVnb3JpZXMgb2YgRGF0YSBTdWJqZWN0cyBjb21wcmlzZSB0aGUgdXNlcnMgc2V0IHVwIGluIFR1dGFub3RhIGJ5IHRoZSBDbGllbnQgYW5kIHRoZXNlIHVzZXJzXFwnIGNvbW11bmljYXRpb24gcGFydG5lcnMuPC9wPjxoNCBpZD1cIk9yZGVycHJvY2Vzc2luZ2FncmVlbWVudC0zLlRlY2huaWNhbGFuZE9yZ2FuaXphdGlvbmFsTWVhc3VyZXNcIj4zLiBUZWNobmljYWwgYW5kIE9yZ2FuaXphdGlvbmFsIE1lYXN1cmVzPC9oND48cD4oMSkgQmVmb3JlIHRoZSBjb21tZW5jZW1lbnQgb2YgcHJvY2Vzc2luZywgdGhlIFN1cHBsaWVyIHNoYWxsIGRvY3VtZW50IHRoZSBleGVjdXRpb24gb2YgdGhlIG5lY2Vzc2FyeSBUZWNobmljYWwgYW5kIE9yZ2FuaXphdGlvbmFsIE1lYXN1cmVzLCBzZXQgb3V0IGluIGFkdmFuY2Ugb2YgdGhlIGF3YXJkaW5nIG9mIHRoZSBBZ3JlZW1lbnQsIHNwZWNpZmljYWxseSB3aXRoIHJlZ2FyZCB0byB0aGUgZGV0YWlsZWQgZXhlY3V0aW9uIG9mIHRoZSBBZ3JlZW1lbnQsIGFuZCBzaGFsbCBwcmVzZW50IHRoZXNlIGRvY3VtZW50ZWQgbWVhc3VyZXMgdG8gdGhlIENsaWVudCBmb3IgaW5zcGVjdGlvbi4gVXBvbiBhY2NlcHRhbmNlIGJ5IHRoZSBDbGllbnQsIHRoZSBkb2N1bWVudGVkIG1lYXN1cmVzIGJlY29tZSB0aGUgZm91bmRhdGlvbiBvZiB0aGUgQWdyZWVtZW50LiBJbnNvZmFyIGFzIHRoZSBpbnNwZWN0aW9uL2F1ZGl0IGJ5IHRoZSBDbGllbnQgc2hvd3MgdGhlIG5lZWQgZm9yIGFtZW5kbWVudHMsIHN1Y2ggYW1lbmRtZW50cyBzaGFsbCBiZSBpbXBsZW1lbnRlZCBieSBtdXR1YWwgYWdyZWVtZW50LjwvcD48cD4oMikgVGhlIFN1cHBsaWVyIHNoYWxsIGVzdGFibGlzaCB0aGUgc2VjdXJpdHkgaW4gYWNjb3JkYW5jZSB3aXRoIEFydGljbGUgMjggUGFyYWdyYXBoIDMgUG9pbnQgYywgYW5kIEFydGljbGUgMzIgR0RQUiBpbiBwYXJ0aWN1bGFyIGluIGNvbmp1bmN0aW9uIHdpdGggQXJ0aWNsZSA1IFBhcmFncmFwaCAxLCBhbmQgUGFyYWdyYXBoIDIgR0RQUi4gVGhlIG1lYXN1cmVzIHRvIGJlIHRha2VuIGFyZSBtZWFzdXJlcyBvZiBkYXRhIHNlY3VyaXR5IGFuZCBtZWFzdXJlcyB0aGF0IGd1YXJhbnRlZSBhIHByb3RlY3Rpb24gbGV2ZWwgYXBwcm9wcmlhdGUgdG8gdGhlIHJpc2sgY29uY2VybmluZyBjb25maWRlbnRpYWxpdHksIGludGVncml0eSwgYXZhaWxhYmlsaXR5IGFuZCByZXNpbGllbmNlIG9mIHRoZSBzeXN0ZW1zLiBUaGUgc3RhdGUgb2YgdGhlIGFydCwgaW1wbGVtZW50YXRpb24gY29zdHMsIHRoZSBuYXR1cmUsIHNjb3BlIGFuZCBwdXJwb3NlcyBvZiBwcm9jZXNzaW5nIGFzIHdlbGwgYXMgdGhlIHByb2JhYmlsaXR5IG9mIG9jY3VycmVuY2UgYW5kIHRoZSBzZXZlcml0eSBvZiB0aGUgcmlzayB0byB0aGUgcmlnaHRzIGFuZCBmcmVlZG9tcyBvZiBuYXR1cmFsIHBlcnNvbnMgd2l0aGluIHRoZSBtZWFuaW5nIG9mIEFydGljbGUgMzIgUGFyYWdyYXBoIDEgR0RQUiBtdXN0IGJlIHRha2VuIGludG8gYWNjb3VudC4gW0RldGFpbHMgaW4gQXBwZW5kaXggMV08L3A+PHA+KDMpIFRoZSBUZWNobmljYWwgYW5kIE9yZ2FuaXphdGlvbmFsIE1lYXN1cmVzIGFyZSBzdWJqZWN0IHRvIHRlY2huaWNhbCBwcm9ncmVzcyBhbmQgZnVydGhlciBkZXZlbG9wbWVudC4gSW4gdGhpcyByZXNwZWN0LCBpdCBpcyBwZXJtaXNzaWJsZSBmb3IgdGhlIFN1cHBsaWVyIHRvIGltcGxlbWVudCBhbHRlcm5hdGl2ZSBhZGVxdWF0ZSBtZWFzdXJlcy4gSW4gc28gZG9pbmcsIHRoZSBzZWN1cml0eSBsZXZlbCBvZiB0aGUgZGVmaW5lZCBtZWFzdXJlcyBtdXN0IG5vdCBiZSByZWR1Y2VkLiBTdWJzdGFudGlhbCBjaGFuZ2VzIG11c3QgYmUgZG9jdW1lbnRlZC48L3A+PGg0IGlkPVwiT3JkZXJwcm9jZXNzaW5nYWdyZWVtZW50LTQuUmVjdGlmaWNhdGlvbixyZXN0cmljdGlvbmFuZGVyYXN1cmVvZmRhdGFcIj48c3Bhbj40LiBSZWN0aWZpY2F0aW9uLCByZXN0cmljdGlvbiBhbmQgZXJhc3VyZSBvZiBkYXRhPC9zcGFuPjwvaDQ+PHA+KDEpIFRoZSBTdXBwbGllciBtYXkgbm90IG9uIGl0cyBvd24gYXV0aG9yaXR5IHJlY3RpZnksIGVyYXNlIG9yIHJlc3RyaWN0IHRoZSBwcm9jZXNzaW5nIG9mIGRhdGEgdGhhdCBpcyBiZWluZyBwcm9jZXNzZWQgb24gYmVoYWxmIG9mIHRoZSBDbGllbnQsIGJ1dCBvbmx5IG9uIGRvY3VtZW50ZWQgaW5zdHJ1Y3Rpb25zIGZyb20gdGhlIENsaWVudC4gPGJyPkluc29mYXIgYXMgYSBEYXRhIFN1YmplY3QgY29udGFjdHMgdGhlIFN1cHBsaWVyIGRpcmVjdGx5IGNvbmNlcm5pbmcgYSByZWN0aWZpY2F0aW9uLCBlcmFzdXJlLCBvciByZXN0cmljdGlvbiBvZiBwcm9jZXNzaW5nLCB0aGUgU3VwcGxpZXIgd2lsbCBpbW1lZGlhdGVseSBmb3J3YXJkIHRoZSBEYXRhIFN1YmplY3TigJlzIHJlcXVlc3QgdG8gdGhlIENsaWVudC48L3A+PHA+KDIpIEluc29mYXIgYXMgaXQgaXMgaW5jbHVkZWQgaW4gdGhlIHNjb3BlIG9mIHNlcnZpY2VzLCB0aGUgZXJhc3VyZSBwb2xpY3ksIOKAmHJpZ2h0IHRvIGJlIGZvcmdvdHRlbuKAmSwgcmVjdGlmaWNhdGlvbiwgZGF0YSBwb3J0YWJpbGl0eSBhbmQgYWNjZXNzIHNoYWxsIGJlIGVuc3VyZWQgYnkgdGhlIFN1cHBsaWVyIGluIGFjY29yZGFuY2Ugd2l0aCBkb2N1bWVudGVkIGluc3RydWN0aW9ucyBmcm9tIHRoZSBDbGllbnQgd2l0aG91dCB1bmR1ZSBkZWxheS48L3A+PGg0IGlkPVwiT3JkZXJwcm9jZXNzaW5nYWdyZWVtZW50LTUuUXVhbGl0eWFzc3VyYW5jZWFuZG90aGVyZHV0aWVzb2Z0aGVTdXBwbGllclwiPjUuIFF1YWxpdHkgYXNzdXJhbmNlIGFuZCBvdGhlciBkdXRpZXMgb2YgdGhlIFN1cHBsaWVyJm5ic3A7PC9oND48cCBhbGlnbj1cImp1c3RpZnlcIj5JbiBhZGRpdGlvbiB0byBjb21wbHlpbmcgd2l0aCB0aGUgcnVsZXMgc2V0IG91dCBpbiB0aGlzIEFncmVlbWVudCwgdGhlIFN1cHBsaWVyIHNoYWxsIGNvbXBseSB3aXRoIHRoZSBzdGF0dXRvcnkgcmVxdWlyZW1lbnRzIHJlZmVycmVkIHRvIGluIEFydGljbGVzIDI4IHRvIDMzIEdEUFI7IGFjY29yZGluZ2x5LCB0aGUgU3VwcGxpZXIgZW5zdXJlcywgaW4gcGFydGljdWxhciwgY29tcGxpYW5jZSB3aXRoIHRoZSBmb2xsb3dpbmcgcmVxdWlyZW1lbnRzOjwvcD48b2w+PGxpPjxwIGFsaWduPVwianVzdGlmeVwiPlRoZSBTdXBwbGllciBpcyBub3Qgb2JsaWdlZCB0byBhcHBvaW50IGEgRGF0YSBQcm90ZWN0aW9uIE9mZmljZXIuIE1yLiBBcm5lIE1vZWhsZSwgcGhvbmU6ICs0OSA1MTEgMjAyODAxLTExLCBhcm5lLm1vZWhsZUB0dXRhby5kZSwgaXMgZGVzaWduYXRlZCBhcyB0aGUgQ29udGFjdCBQZXJzb24gb24gYmVoYWxmIG9mIHRoZSBTdXBwbGllci48L3A+PC9saT48bGk+PHAgYWxpZ249XCJqdXN0aWZ5XCI+Q29uZmlkZW50aWFsaXR5IGluIGFjY29yZGFuY2Ugd2l0aCBBcnRpY2xlIDI4IFBhcmFncmFwaCAzIFNlbnRlbmNlIDIgUG9pbnQgYiwgQXJ0aWNsZXMgMjkgYW5kIDMyIFBhcmFncmFwaCA0IEdEUFIuIFRoZSBTdXBwbGllciBlbnRydXN0cyBvbmx5IHN1Y2ggZW1wbG95ZWVzIHdpdGggdGhlIGRhdGEgcHJvY2Vzc2luZyBvdXRsaW5lZCBpbiB0aGlzIEFncmVlbWVudCB3aG8gaGF2ZSBiZWVuIGJvdW5kIHRvIGNvbmZpZGVudGlhbGl0eSBhbmQgaGF2ZSBwcmV2aW91c2x5IGJlZW4gZmFtaWxpYXJpemVkIHdpdGggdGhlIGRhdGEgcHJvdGVjdGlvbiBwcm92aXNpb25zIHJlbGV2YW50IHRvIHRoZWlyIHdvcmsuIFRoZSBTdXBwbGllciBhbmQgYW55IHBlcnNvbiBhY3RpbmcgdW5kZXIgaXRzIGF1dGhvcml0eSB3aG8gaGFzIGFjY2VzcyB0byBwZXJzb25hbCBkYXRhLCBzaGFsbCBub3QgcHJvY2VzcyB0aGF0IGRhdGEgdW5sZXNzIG9uIGluc3RydWN0aW9ucyBmcm9tIHRoZSBDbGllbnQsIHdoaWNoIGluY2x1ZGVzIHRoZSBwb3dlcnMgZ3JhbnRlZCBpbiB0aGlzIEFncmVlbWVudCwgdW5sZXNzIHJlcXVpcmVkIHRvIGRvIHNvIGJ5IGxhdy48L3A+PC9saT48bGk+PHAgYWxpZ249XCJqdXN0aWZ5XCI+SW1wbGVtZW50YXRpb24gb2YgYW5kIGNvbXBsaWFuY2Ugd2l0aCBhbGwgVGVjaG5pY2FsIGFuZCBPcmdhbml6YXRpb25hbCBNZWFzdXJlcyBuZWNlc3NhcnkgZm9yIHRoaXMgQWdyZWVtZW50IGluIGFjY29yZGFuY2Ugd2l0aCBBcnRpY2xlIDI4IFBhcmFncmFwaCAzIFNlbnRlbmNlIDIgUG9pbnQgYywgQXJ0aWNsZSAzMiBHRFBSIFtkZXRhaWxzIGluIEFwcGVuZGl4IDFdLjwvcD48L2xpPjxsaT48cCBhbGlnbj1cImp1c3RpZnlcIj5UaGUgQ2xpZW50IGFuZCB0aGUgU3VwcGxpZXIgc2hhbGwgY29vcGVyYXRlLCBvbiByZXF1ZXN0LCB3aXRoIHRoZSBzdXBlcnZpc29yeSBhdXRob3JpdHkgaW4gcGVyZm9ybWFuY2Ugb2YgaXRzIHRhc2tzLjwvcD48L2xpPjxsaT48cCBhbGlnbj1cImp1c3RpZnlcIj5UaGUgQ2xpZW50IHNoYWxsIGJlIGluZm9ybWVkIGltbWVkaWF0ZWx5IG9mIGFueSBpbnNwZWN0aW9ucyBhbmQgbWVhc3VyZXMgY29uZHVjdGVkIGJ5IHRoZSBzdXBlcnZpc29yeSBhdXRob3JpdHksIGluc29mYXIgYXMgdGhleSByZWxhdGUgdG8gdGhpcyBBZ3JlZW1lbnQuIFRoaXMgYWxzbyBhcHBsaWVzIGluc29mYXIgYXMgdGhlIFN1cHBsaWVyIGlzIHVuZGVyIGludmVzdGlnYXRpb24gb3IgaXMgcGFydHkgdG8gYW4gaW52ZXN0aWdhdGlvbiBieSBhIGNvbXBldGVudCBhdXRob3JpdHkgaW4gY29ubmVjdGlvbiB3aXRoIGluZnJpbmdlbWVudHMgdG8gYW55IENpdmlsIG9yIENyaW1pbmFsIExhdywgb3IgQWRtaW5pc3RyYXRpdmUgUnVsZSBvciBSZWd1bGF0aW9uIHJlZ2FyZGluZyB0aGUgcHJvY2Vzc2luZyBvZiBwZXJzb25hbCBkYXRhIGluIGNvbm5lY3Rpb24gd2l0aCB0aGUgcHJvY2Vzc2luZyBvZiB0aGlzIEFncmVlbWVudC48L3A+PC9saT48bGk+PHAgYWxpZ249XCJqdXN0aWZ5XCI+SW5zb2ZhciBhcyB0aGUgQ2xpZW50IGlzIHN1YmplY3QgdG8gYW4gaW5zcGVjdGlvbiBieSB0aGUgc3VwZXJ2aXNvcnkgYXV0aG9yaXR5LCBhbiBhZG1pbmlzdHJhdGl2ZSBvciBzdW1tYXJ5IG9mZmVuc2Ugb3IgY3JpbWluYWwgcHJvY2VkdXJlLCBhIGxpYWJpbGl0eSBjbGFpbSBieSBhIERhdGEgU3ViamVjdCBvciBieSBhIHRoaXJkIHBhcnR5IG9yIGFueSBvdGhlciBjbGFpbSBpbiBjb25uZWN0aW9uIHdpdGggdGhlIEFncmVlbWVudCBkYXRhIHByb2Nlc3NpbmcgYnkgdGhlIFN1cHBsaWVyLCB0aGUgU3VwcGxpZXIgc2hhbGwgbWFrZSBldmVyeSBlZmZvcnQgdG8gc3VwcG9ydCB0aGUgQ2xpZW50LjwvcD48L2xpPjxsaT48cCBhbGlnbj1cImp1c3RpZnlcIj5UaGUgU3VwcGxpZXIgc2hhbGwgcGVyaW9kaWNhbGx5IG1vbml0b3IgdGhlIGludGVybmFsIHByb2Nlc3NlcyBhbmQgdGhlIFRlY2huaWNhbCBhbmQgT3JnYW5pemF0aW9uYWwgTWVhc3VyZXMgdG8gZW5zdXJlIHRoYXQgcHJvY2Vzc2luZyB3aXRoaW4gaGlzIGFyZWEgb2YgcmVzcG9uc2liaWxpdHkgaXMgaW4gYWNjb3JkYW5jZSB3aXRoIHRoZSByZXF1aXJlbWVudHMgb2YgYXBwbGljYWJsZSBkYXRhIHByb3RlY3Rpb24gbGF3IGFuZCB0aGUgcHJvdGVjdGlvbiBvZiB0aGUgcmlnaHRzIG9mIHRoZSBkYXRhIHN1YmplY3QuPC9wPjwvbGk+PGxpPjxwIGFsaWduPVwianVzdGlmeVwiPlZlcmlmaWFiaWxpdHkgb2YgdGhlIFRlY2huaWNhbCBhbmQgT3JnYW5pemF0aW9uYWwgTWVhc3VyZXMgY29uZHVjdGVkIGJ5IHRoZSBDbGllbnQgYXMgcGFydCBvZiB0aGUgQ2xpZW504oCZcyBzdXBlcnZpc29yeSBwb3dlcnMgcmVmZXJyZWQgdG8gaW4gaXRlbSA3IG9mIHRoaXMgQWdyZWVtZW50LjwvcD48L2xpPjwvb2w+PGg0IGlkPVwiT3JkZXJwcm9jZXNzaW5nYWdyZWVtZW50LTYuU3ViY29udHJhY3RpbmdcIj42LiBTdWJjb250cmFjdGluZzwvaDQ+PHAgYWxpZ249XCJqdXN0aWZ5XCI+KDEpIFN1YmNvbnRyYWN0aW5nIGZvciB0aGUgcHVycG9zZSBvZiB0aGlzIEFncmVlbWVudCBpcyB0byBiZSB1bmRlcnN0b29kIGFzIG1lYW5pbmcgc2VydmljZXMgd2hpY2ggcmVsYXRlIGRpcmVjdGx5IHRvIHRoZSBwcm92aXNpb24gb2YgdGhlIHByaW5jaXBhbCBzZXJ2aWNlLiBUaGlzIGRvZXMgbm90IGluY2x1ZGUgYW5jaWxsYXJ5IHNlcnZpY2VzLCBzdWNoIGFzIHRlbGVjb21tdW5pY2F0aW9uIHNlcnZpY2VzLCBwb3N0YWwgLyB0cmFuc3BvcnQgc2VydmljZXMsIG1haW50ZW5hbmNlIGFuZCB1c2VyIHN1cHBvcnQgc2VydmljZXMgb3IgdGhlIGRpc3Bvc2FsIG9mIGRhdGEgY2FycmllcnMsIGFzIHdlbGwgYXMgb3RoZXIgbWVhc3VyZXMgdG8gZW5zdXJlIHRoZSBjb25maWRlbnRpYWxpdHksIGF2YWlsYWJpbGl0eSwgaW50ZWdyaXR5IGFuZCByZXNpbGllbmNlIG9mIHRoZSBoYXJkd2FyZSBhbmQgc29mdHdhcmUgb2YgZGF0YSBwcm9jZXNzaW5nIGVxdWlwbWVudC4gVGhlIFN1cHBsaWVyIHNoYWxsLCBob3dldmVyLCBiZSBvYmxpZ2VkIHRvIG1ha2UgYXBwcm9wcmlhdGUgYW5kIGxlZ2FsbHkgYmluZGluZyBjb250cmFjdHVhbCBhcnJhbmdlbWVudHMgYW5kIHRha2UgYXBwcm9wcmlhdGUgaW5zcGVjdGlvbiBtZWFzdXJlcyB0byBlbnN1cmUgdGhlIGRhdGEgcHJvdGVjdGlvbiBhbmQgdGhlIGRhdGEgc2VjdXJpdHkgb2YgdGhlIENsaWVudFxcJ3MgZGF0YSwgZXZlbiBpbiB0aGUgY2FzZSBvZiBvdXRzb3VyY2VkIGFuY2lsbGFyeSBzZXJ2aWNlcy48L3A+PHAgYWxpZ249XCJqdXN0aWZ5XCI+KDIpIFRoZSBTdXBwbGllciBtYXkgY29tbWlzc2lvbiBzdWJjb250cmFjdG9ycyAoYWRkaXRpb25hbCBjb250cmFjdCBwcm9jZXNzb3JzKSBvbmx5IGFmdGVyIHByaW9yIGV4cGxpY2l0IHdyaXR0ZW4gb3IgZG9jdW1lbnRlZCBjb25zZW50IGZyb20gdGhlIENsaWVudC4mbmJzcDs8L3A+PHAgYWxpZ249XCJqdXN0aWZ5XCI+KDMpIE91dHNvdXJjaW5nIHRvIHN1YmNvbnRyYWN0b3JzIG9yIGNoYW5naW5nIHRoZSBleGlzdGluZyBzdWJjb250cmFjdG9yIGFyZSBwZXJtaXNzaWJsZSB3aGVuOjwvcD48dWw+PGxpPlRoZSBTdXBwbGllciBzdWJtaXRzIHN1Y2ggYW4gb3V0c291cmNpbmcgdG8gYSBzdWJjb250cmFjdG9yIHRvIHRoZSBDbGllbnQgaW4gd3JpdGluZyBvciBpbiB0ZXh0IGZvcm0gd2l0aCBhcHByb3ByaWF0ZSBhZHZhbmNlIG5vdGljZTsgYW5kPC9saT48bGk+VGhlIENsaWVudCBoYXMgbm90IG9iamVjdGVkIHRvIHRoZSBwbGFubmVkIG91dHNvdXJjaW5nIGluIHdyaXRpbmcgb3IgaW4gdGV4dCBmb3JtIGJ5IHRoZSBkYXRlIG9mIGhhbmRpbmcgb3ZlciB0aGUgZGF0YSB0byB0aGUgU3VwcGxpZXI7IGFuZDwvbGk+PGxpPlRoZSBzdWJjb250cmFjdGluZyBpcyBiYXNlZCBvbiBhIGNvbnRyYWN0dWFsIGFncmVlbWVudCBpbiBhY2NvcmRhbmNlIHdpdGggQXJ0aWNsZSAyOCBwYXJhZ3JhcGhzIDItNCBHRFBSLjwvbGk+PC91bD48cCBhbGlnbj1cImp1c3RpZnlcIj4oNCkgVGhlIHRyYW5zZmVyIG9mIHBlcnNvbmFsIGRhdGEgZnJvbSB0aGUgQ2xpZW50IHRvIHRoZSBzdWJjb250cmFjdG9yIGFuZCB0aGUgc3ViY29udHJhY3RvcnMgY29tbWVuY2VtZW50IG9mIHRoZSBkYXRhIHByb2Nlc3Npbmcgc2hhbGwgb25seSBiZSB1bmRlcnRha2VuIGFmdGVyIGNvbXBsaWFuY2Ugd2l0aCBhbGwgcmVxdWlyZW1lbnRzIGhhcyBiZWVuIGFjaGlldmVkLjwvcD48cCBhbGlnbj1cImp1c3RpZnlcIj4oNSkgSWYgdGhlIHN1YmNvbnRyYWN0b3IgcHJvdmlkZXMgdGhlIGFncmVlZCBzZXJ2aWNlIG91dHNpZGUgdGhlIEVVL0VFQSwgdGhlIFN1cHBsaWVyIHNoYWxsIGVuc3VyZSBjb21wbGlhbmNlIHdpdGggRVUgRGF0YSBQcm90ZWN0aW9uIFJlZ3VsYXRpb25zIGJ5IGFwcHJvcHJpYXRlIG1lYXN1cmVzLiBUaGUgc2FtZSBhcHBsaWVzIGlmIHNlcnZpY2UgcHJvdmlkZXJzIGFyZSB0byBiZSB1c2VkIHdpdGhpbiB0aGUgbWVhbmluZyBvZiBQYXJhZ3JhcGggMSBTZW50ZW5jZSAyLjwvcD48cCBhbGlnbj1cImp1c3RpZnlcIj4oNikgRnVydGhlciBvdXRzb3VyY2luZyBieSB0aGUgc3ViY29udHJhY3RvciByZXF1aXJlcyB0aGUgZXhwcmVzcyBjb25zZW50IG9mIHRoZSBtYWluIENsaWVudCAoYXQgdGhlIG1pbmltdW0gaW4gdGV4dCBmb3JtKTs8L3A+PHAgYWxpZ249XCJqdXN0aWZ5XCI+KDcpIEFsbCBjb250cmFjdHVhbCBwcm92aXNpb25zIGluIHRoZSBjb250cmFjdCBjaGFpbiBzaGFsbCBiZSBjb21tdW5pY2F0ZWQgdG8gYW5kIGFncmVlZCB3aXRoIGVhY2ggYW5kIGV2ZXJ5IGFkZGl0aW9uYWwgc3ViY29udHJhY3Rvci48L3A+PGg0IGNsYXNzPVwid2VzdGVyblwiIGlkPVwiT3JkZXJwcm9jZXNzaW5nYWdyZWVtZW50LTcuU3VwZXJ2aXNvcnlwb3dlcnNvZnRoZUNsaWVudFwiPjcuIFN1cGVydmlzb3J5IHBvd2VycyBvZiB0aGUgQ2xpZW50PC9oND48cCBhbGlnbj1cImp1c3RpZnlcIj4oMSkgVGhlIENsaWVudCBoYXMgdGhlIHJpZ2h0LCBhZnRlciBjb25zdWx0YXRpb24gd2l0aCB0aGUgU3VwcGxpZXIsIHRvIGNhcnJ5IG91dCBpbnNwZWN0aW9ucyBvciB0byBoYXZlIHRoZW0gY2FycmllZCBvdXQgYnkgYW4gYXVkaXRvciB0byBiZSBkZXNpZ25hdGVkIGluIGVhY2ggaW5kaXZpZHVhbCBjYXNlLiBJdCBoYXMgdGhlIHJpZ2h0IHRvIGNvbnZpbmNlIGl0c2VsZiBvZiB0aGUgY29tcGxpYW5jZSB3aXRoIHRoaXMgYWdyZWVtZW50IGJ5IHRoZSBTdXBwbGllciBpbiBoaXMgYnVzaW5lc3Mgb3BlcmF0aW9ucyBieSBtZWFucyBvZiByYW5kb20gY2hlY2tzLCB3aGljaCBhcmUgb3JkaW5hcmlseSB0byBiZSBhbm5vdW5jZWQgaW4gZ29vZCB0aW1lLjwvcD48cCBhbGlnbj1cImp1c3RpZnlcIj4oMikgVGhlIFN1cHBsaWVyIHNoYWxsIGVuc3VyZSB0aGF0IHRoZSBDbGllbnQgaXMgYWJsZSB0byB2ZXJpZnkgY29tcGxpYW5jZSB3aXRoIHRoZSBvYmxpZ2F0aW9ucyBvZiB0aGUgU3VwcGxpZXIgaW4gYWNjb3JkYW5jZSB3aXRoIEFydGljbGUgMjggR0RQUi4gVGhlIFN1cHBsaWVyIHVuZGVydGFrZXMgdG8gZ2l2ZSB0aGUgQ2xpZW50IHRoZSBuZWNlc3NhcnkgaW5mb3JtYXRpb24gb24gcmVxdWVzdCBhbmQsIGluIHBhcnRpY3VsYXIsIHRvIGRlbW9uc3RyYXRlIHRoZSBleGVjdXRpb24gb2YgdGhlIFRlY2huaWNhbCBhbmQgT3JnYW5pemF0aW9uYWwgTWVhc3VyZXMuPC9wPjxwIGFsaWduPVwianVzdGlmeVwiPigzKSBFdmlkZW5jZSBvZiBzdWNoIG1lYXN1cmVzLCB3aGljaCBjb25jZXJuIG5vdCBvbmx5IHRoZSBzcGVjaWZpYyBBZ3JlZW1lbnQsIG1heSBiZSBwcm92aWRlZCBieTwvcD48dWw+PGxpPkNvbXBsaWFuY2Ugd2l0aCBhcHByb3ZlZCBDb2RlcyBvZiBDb25kdWN0IHB1cnN1YW50IHRvIEFydGljbGUgNDAgR0RQUjs8L2xpPjxsaT5DZXJ0aWZpY2F0aW9uIGFjY29yZGluZyB0byBhbiBhcHByb3ZlZCBjZXJ0aWZpY2F0aW9uIHByb2NlZHVyZSBpbiBhY2NvcmRhbmNlIHdpdGggQXJ0aWNsZSA0MiBHRFBSOzwvbGk+PGxpPkN1cnJlbnQgYXVkaXRvcuKAmXMgY2VydGlmaWNhdGVzLCByZXBvcnRzIG9yIGV4Y2VycHRzIGZyb20gcmVwb3J0cyBwcm92aWRlZCBieSBpbmRlcGVuZGVudCBib2RpZXMgKGUuZy4gYXVkaXRvciwgRGF0YSBQcm90ZWN0aW9uIE9mZmljZXIsIElUIHNlY3VyaXR5IGRlcGFydG1lbnQsIGRhdGEgcHJpdmFjeSBhdWRpdG9yLCBxdWFsaXR5IGF1ZGl0b3IpPC9saT48bGk+QSBzdWl0YWJsZSBjZXJ0aWZpY2F0aW9uIGJ5IElUIHNlY3VyaXR5IG9yIGRhdGEgcHJvdGVjdGlvbiBhdWRpdGluZyAoZS5nLiBhY2NvcmRpbmcgdG8gQlNJLUdydW5kc2NodXR6IChJVCBCYXNlbGluZSBQcm90ZWN0aW9uIGNlcnRpZmljYXRpb24gZGV2ZWxvcGVkIGJ5IHRoZSBHZXJtYW4mbmJzcDsgRmVkZXJhbCBPZmZpY2UgZm9yIFNlY3VyaXR5IGluIEluZm9ybWF0aW9uIFRlY2hub2xvZ3kgKEJTSSkpIG9yIElTTy9JRUMgMjcwMDEpLjwvbGk+PC91bD48cCBhbGlnbj1cImp1c3RpZnlcIj4oNCkgVGhlIFN1cHBsaWVyIG1heSBjbGFpbSByZW11bmVyYXRpb24gZm9yIGVuYWJsaW5nIENsaWVudCBpbnNwZWN0aW9ucy4mbmJzcDs8L3A+PGg0IGNsYXNzPVwid2VzdGVyblwiIGlkPVwiT3JkZXJwcm9jZXNzaW5nYWdyZWVtZW50LTguQ29tbXVuaWNhdGlvbmludGhlY2FzZW9maW5mcmluZ2VtZW50c2J5dGhlU3VwcGxpZXJcIj44LiBDb21tdW5pY2F0aW9uIGluIHRoZSBjYXNlIG9mIGluZnJpbmdlbWVudHMgYnkgdGhlIFN1cHBsaWVyPC9oND48cCBhbGlnbj1cImp1c3RpZnlcIj4oMSkgVGhlIFN1cHBsaWVyIHNoYWxsIGFzc2lzdCB0aGUgQ2xpZW50IGluIGNvbXBseWluZyB3aXRoIHRoZSBvYmxpZ2F0aW9ucyBjb25jZXJuaW5nIHRoZSBzZWN1cml0eSBvZiBwZXJzb25hbCBkYXRhLCByZXBvcnRpbmcgcmVxdWlyZW1lbnRzIGZvciBkYXRhIGJyZWFjaGVzLCBkYXRhIHByb3RlY3Rpb24gaW1wYWN0IGFzc2Vzc21lbnRzIGFuZCBwcmlvciBjb25zdWx0YXRpb25zLCByZWZlcnJlZCB0byBpbiBBcnRpY2xlcyAzMiB0byAzNiBvZiB0aGUgR0RQUi4gVGhlc2UgaW5jbHVkZTo8L3A+PG9sPjxsaT5FbnN1cmluZyBhbiBhcHByb3ByaWF0ZSBsZXZlbCBvZiBwcm90ZWN0aW9uIHRocm91Z2ggVGVjaG5pY2FsIGFuZCBPcmdhbml6YXRpb25hbCBNZWFzdXJlcyB0aGF0IHRha2UgaW50byBhY2NvdW50IHRoZSBjaXJjdW1zdGFuY2VzIGFuZCBwdXJwb3NlcyBvZiB0aGUgcHJvY2Vzc2luZyBhcyB3ZWxsIGFzIHRoZSBwcm9qZWN0ZWQgcHJvYmFiaWxpdHkgYW5kIHNldmVyaXR5IG9mIGEgcG9zc2libGUgaW5mcmluZ2VtZW50IG9mIHRoZSBsYXcgYXMgYSByZXN1bHQgb2Ygc2VjdXJpdHkgdnVsbmVyYWJpbGl0aWVzIGFuZCB0aGF0IGVuYWJsZSBhbiBpbW1lZGlhdGUgZGV0ZWN0aW9uIG9mIHJlbGV2YW50IGluZnJpbmdlbWVudCBldmVudHMuPC9saT48bGk+VGhlIG9ibGlnYXRpb24gdG8gcmVwb3J0IGEgcGVyc29uYWwgZGF0YSBicmVhY2ggaW1tZWRpYXRlbHkgdG8gdGhlIENsaWVudDwvbGk+PGxpPlRoZSBkdXR5IHRvIGFzc2lzdCB0aGUgQ2xpZW50IHdpdGggcmVnYXJkIHRvIHRoZSBDbGllbnTigJlzIG9ibGlnYXRpb24gdG8gcHJvdmlkZSBpbmZvcm1hdGlvbiB0byB0aGUgRGF0YSBTdWJqZWN0IGNvbmNlcm5lZCBhbmQgdG8gaW1tZWRpYXRlbHkgcHJvdmlkZSB0aGUgQ2xpZW50IHdpdGggYWxsIHJlbGV2YW50IGluZm9ybWF0aW9uIGluIHRoaXMgcmVnYXJkLjwvbGk+PGxpPlN1cHBvcnRpbmcgdGhlIENsaWVudCB3aXRoIGl0cyBkYXRhIHByb3RlY3Rpb24gaW1wYWN0IGFzc2Vzc21lbnQ8L2xpPjxsaT5TdXBwb3J0aW5nIHRoZSBDbGllbnQgd2l0aCByZWdhcmQgdG8gcHJpb3IgY29uc3VsdGF0aW9uIG9mIHRoZSBzdXBlcnZpc29yeSBhdXRob3JpdHk8L2xpPjwvb2w+PHAgYWxpZ249XCJqdXN0aWZ5XCI+KDIpIFRoZSBTdXBwbGllciBtYXkgY2xhaW0gY29tcGVuc2F0aW9uIGZvciBzdXBwb3J0IHNlcnZpY2VzIHdoaWNoIGFyZSBub3QgaW5jbHVkZWQgaW4gdGhlIGRlc2NyaXB0aW9uIG9mIHRoZSBzZXJ2aWNlcyBhbmQgd2hpY2ggYXJlIG5vdCBhdHRyaWJ1dGFibGUgdG8gZmFpbHVyZXMgb24gdGhlIHBhcnQgb2YgdGhlIFN1cHBsaWVyLjwvcD48aDQgY2xhc3M9XCJ3ZXN0ZXJuXCIgaWQ9XCJPcmRlcnByb2Nlc3NpbmdhZ3JlZW1lbnQtOS5BdXRob3JpdHlvZnRoZUNsaWVudHRvaXNzdWVpbnN0cnVjdGlvbnNcIj45LiBBdXRob3JpdHkgb2YgdGhlIENsaWVudCB0byBpc3N1ZSBpbnN0cnVjdGlvbnM8L2g0PjxwPigxKSBUaGUgQ2xpZW50IHNoYWxsIGltbWVkaWF0ZWx5IGNvbmZpcm0gb3JhbCBpbnN0cnVjdGlvbnMgKGF0IHRoZSBtaW5pbXVtIGluIHRleHQgZm9ybSkuPC9wPjxwPigyKSBUaGUgU3VwcGxpZXIgc2hhbGwgaW5mb3JtIHRoZSBDbGllbnQgaW1tZWRpYXRlbHkgaWYgaGUgY29uc2lkZXJzIHRoYXQgYW4gaW5zdHJ1Y3Rpb24gdmlvbGF0ZXMgRGF0YSBQcm90ZWN0aW9uIFJlZ3VsYXRpb25zLiBUaGUgU3VwcGxpZXIgc2hhbGwgdGhlbiBiZSBlbnRpdGxlZCB0byBzdXNwZW5kIHRoZSBleGVjdXRpb24gb2YgdGhlIHJlbGV2YW50IGluc3RydWN0aW9ucyB1bnRpbCB0aGUgQ2xpZW50IGNvbmZpcm1zIG9yIGNoYW5nZXMgdGhlbS48L3A+PGg0IGNsYXNzPVwid2VzdGVyblwiIGlkPVwiT3JkZXJwcm9jZXNzaW5nYWdyZWVtZW50LTEwLkRlbGV0aW9uYW5kcmV0dXJub2ZwZXJzb25hbGRhdGFcIj4xMC4gRGVsZXRpb24gYW5kIHJldHVybiBvZiBwZXJzb25hbCBkYXRhPC9oND48cD4oMSkgQ29waWVzIG9yIGR1cGxpY2F0ZXMgb2YgdGhlIGRhdGEgc2hhbGwgbmV2ZXIgYmUgY3JlYXRlZCB3aXRob3V0IHRoZSBrbm93bGVkZ2Ugb2YgdGhlIENsaWVudCwgd2l0aCB0aGUgZXhjZXB0aW9uIG9mIGJhY2stdXAgY29waWVzIGFzIGZhciBhcyB0aGV5IGFyZSBuZWNlc3NhcnkgdG8gZW5zdXJlIG9yZGVybHkgZGF0YSBwcm9jZXNzaW5nLCBhcyB3ZWxsIGFzIGRhdGEgcmVxdWlyZWQgdG8gbWVldCByZWd1bGF0b3J5IHJlcXVpcmVtZW50cyB0byByZXRhaW4gZGF0YS48L3A+PHA+KDIpIEFmdGVyIGNvbmNsdXNpb24gb2YgdGhlIGNvbnRyYWN0ZWQgd29yaywgb3IgZWFybGllciB1cG9uIHJlcXVlc3QgYnkgdGhlIENsaWVudCwgYXQgdGhlIGxhdGVzdCB1cG9uIHRlcm1pbmF0aW9uIG9mIHRoZSBTZXJ2aWNlIEFncmVlbWVudCwgdGhlIFN1cHBsaWVyIHNoYWxsIGhhbmQgb3ZlciB0byB0aGUgQ2xpZW50IG9yIOKAkyBzdWJqZWN0IHRvIHByaW9yIGNvbnNlbnQg4oCTIGRlc3Ryb3kgYWxsIGRvY3VtZW50cywgcHJvY2Vzc2luZyBhbmQgdXRpbGl6YXRpb24gcmVzdWx0cywgYW5kIGRhdGEgc2V0cyByZWxhdGVkIHRvIHRoZSBBZ3JlZW1lbnQgdGhhdCBoYXZlIGNvbWUgaW50byBpdHMgcG9zc2Vzc2lvbiwgaW4gYSBkYXRhLXByb3RlY3Rpb24gY29tcGxpYW50IG1hbm5lci4gVGhlIHNhbWUgYXBwbGllcyB0byBhbnkgYW5kIGFsbCBjb25uZWN0ZWQgdGVzdCwgd2FzdGUsIHJlZHVuZGFudCBhbmQgZGlzY2FyZGVkIG1hdGVyaWFsLiBUaGUgbG9nIG9mIHRoZSBkZXN0cnVjdGlvbiBvciBkZWxldGlvbiBzaGFsbCBiZSBwcm92aWRlZCBvbiByZXF1ZXN0LjwvcD48cD4oMykgRG9jdW1lbnRhdGlvbiB3aGljaCBpcyB1c2VkIHRvIGRlbW9uc3RyYXRlIG9yZGVybHkgZGF0YSBwcm9jZXNzaW5nIGluIGFjY29yZGFuY2Ugd2l0aCB0aGUgQWdyZWVtZW50IHNoYWxsIGJlIHN0b3JlZCBiZXlvbmQgdGhlIGNvbnRyYWN0IGR1cmF0aW9uIGJ5IHRoZSBTdXBwbGllciBpbiBhY2NvcmRhbmNlIHdpdGggdGhlIHJlc3BlY3RpdmUgcmV0ZW50aW9uIHBlcmlvZHMuIEl0IG1heSBoYW5kIHN1Y2ggZG9jdW1lbnRhdGlvbiBvdmVyIHRvIHRoZSBDbGllbnQgYXQgdGhlIGVuZCBvZiB0aGUgY29udHJhY3QgZHVyYXRpb24gdG8gcmVsaWV2ZSB0aGUgU3VwcGxpZXIgb2YgdGhpcyBjb250cmFjdHVhbCBvYmxpZ2F0aW9uLjwvcD48aDQgaWQ9XCJPcmRlcnByb2Nlc3NpbmdhZ3JlZW1lbnQtMTEuRmluYWxwcm92aXNpb25zXCI+MTEuIEZpbmFsIHByb3Zpc2lvbnM8L2g0PjxwIGFsaWduPVwianVzdGlmeVwiPigxKSBUaGlzIGFncmVlbWVudCBzaGFsbCBiZSBnb3Zlcm5lZCBieSBhbmQgY29uc3RydWVkIGluIGFjY29yZGFuY2Ugd2l0aCBHZXJtYW4gbGF3LiBQbGFjZSBvZiBqdXJpc2RpY3Rpb24gc2hhbGwgYmUgSGFub3ZlciwgR2VybWFueS48L3A+PHAgYWxpZ249XCJqdXN0aWZ5XCI+KDIpIEFueSBjaGFuZ2VzIG9mIG9yIGFtZW5kbWVudHMgdG8gdGhpcyBBZ3JlZW1lbnQgbXVzdCBiZSBpbiB3cml0aW5nIHRvIGJlY29tZSBlZmZlY3RpdmUuIFRoaXMgaW5jbHVkZXMgYW55IGFsdGVyYXRpb24gb2YgdGhpcyB3cml0dGVuIGZvcm0gY2xhdXNlLjwvcD48cCBhbGlnbj1cImp1c3RpZnlcIiBjbGFzcz1cIndlc3Rlcm5cIj4oMykgU2hvdWxkIGFueSBwcm92aXNpb24gb2YgdGhpcyBBZ3JlZW1lbnQgYmUgb3IgYmVjb21lIGxlZ2FsbHkgaW52YWxpZCBvciBpZiB0aGVyZSBpcyBhbnkgdm9pZCB0aGF0IG5lZWRzIHRvIGJlIGZpbGxlZCwgdGhlIHZhbGlkaXR5IG9mIHRoZSByZW1haW5kZXIgb2YgdGhlIGFncmVlbWVudCBzaGFsbCBub3QgYmUgYWZmZWN0ZWQgdGhlcmVieS4gSW52YWxpZCBwcm92aXNpb25zIHNoYWxsIGJlIHJlcGxhY2VkIGJ5IGNvbW1vbiBjb25zZW50IHdpdGggc3VjaCBwcm92aXNpb25zIHdoaWNoIGNvbWUgYXMgY2xvc2UgYXMgcG9zc2libGUgdG8gdGhlIGludGVuZGVkIHJlc3VsdCBvZiB0aGUgaW52YWxpZCBwcm92aXNpb24uIEluIHRoZSBldmVudCBvZiBnYXBzIHN1Y2ggcHJvdmlzaW9uIHNoYWxsIGNvbWUgaW50byBmb3JjZSBieSBjb21tb24gY29uc2VudCB3aGljaCBjb21lcyBhcyBjbG9zZSBhcyBwb3NzaWJsZSB0byB0aGUgaW50ZW5kZWQgcmVzdWx0IG9mIHRoZSBhZ3JlZW1lbnQsIHNob3VsZCB0aGUgbWF0dGVyIGhhdmUgYmVlbiBjb25zaWRlcmVkIGluIGFkdmFuY2UuPC9wPjxwIGFsaWduPVwianVzdGlmeVwiPiZuYnNwOzwvcD4nLFxuXHRcdGFwcGVuZGl4OlxuXHRcdFx0JzxkaXYgY2xhc3M9XCJwYWdlYnJlYWtcIiBzdHlsZT1cImJyZWFrLWJlZm9yZTphbHdheXM7XCI+PHA+PC9wPjxoNCBpZD1cIk9yZGVycHJvY2Vzc2luZ2FncmVlbWVudC1BcHBlbmRpeDEtVGVjaG5pY2FsYW5kT3JnYW5pemF0aW9uYWxNZWFzdXJlc1wiPkFwcGVuZGl4IDEgLSBUZWNobmljYWwgYW5kIE9yZ2FuaXphdGlvbmFsIE1lYXN1cmVzJm5ic3A7PC9oND48cD5TeXN0ZW0gYWRtaW5pc3RyYXRvcnMgYXJlIGhlcmVpbmFmdGVyIHJlZmVycmVkIHRvIGFzIFwiRGV2T3BzXCIuIFRoZSBmb2xsb3dpbmcgVGVjaG5pY2FsIGFuZCBPcmdhbml6YXRpb25hbCBNZWFzdXJlcyBoYXZlIGJlZW4gaW1wbGVtZW50ZWQ6PC9wPjxvbD48bGk+RW50cmFuY2UgY29udHJvbDogQWxsIHN5c3RlbXMgYXJlIGxvY2F0ZWQgaW4gSVNPIDI3MDAxIGNlcnRpZmllZCZuYnNwO2RhdGEgY2VudGVycyBpbiBHZXJtYW55LiBPbmx5IERldk9wcyBhcmUgZ3JhbnRlZCBhY2Nlc3MgdG8gdGhlIHBoeXNpY2FsIHN5c3RlbXMuPC9saT48bGk+QXV0aGVudGljYXRpb24gYWNjZXNzIGNvbnRyb2w6IFVzZXIgYWNjZXNzIGlzIHNlY3VyZWQgd2l0aCBzdHJvbmcgcGFzc3dvcmQgcHJvdGVjdGlvbiBhY2NvcmRpbmcgdG8gdGhlIGludGVybmFsIFBhc3N3b3JkIFBvbGljeSBvciBwdWJsaWMga2V5IGFjY2VzcyBjb250cm9sIGFzIHdlbGwgYXMgc2Vjb25kIGZhY3RvciBhdXRoZW50aWNhdGlvbiAoZS5nLiBZdWJpS2V5KS4mbmJzcDtVc2VyIGFjY2VzcyBpcyBtYW5hZ2VkIGJ5IERldk9wcy48L2xpPjxsaT5BdXRob3JpemF0aW9uIGFjY2VzcyBjb250cm9sOiBEYXRhIHJlY29yZHMgYXJlIHNlY3VyZWQgd2l0aCByb2xlIGJhc2VkIHBlcm1pc3Npb25zLiBQZXJtaXNzaW9ucyBhcmUgbWFuYWdlZCBieSBEZXZPcHMuPC9saT48bGk+RGF0YSBtZWRpdW0gY29udHJvbDogQWxsIGhhcmQgZGlzY3MgY29udGFpbmluZyBwZXJzb25hbCBkYXRhIGFyZSBlbmNyeXB0ZWQuIEZpbGUgcGVybWlzc2lvbnMgYXJlIGFsbG9jYXRlZCB0byBEZXZPcHMgdXNlcnMvcm9sZXMgYXMgd2VsbCBhcyBhcHBsaWNhdGlvbiB1c2Vycy9yb2xlcyB0byBtYWtlIHN1cmUgbm8gdW5hdXRob3JpemVkIGFjY2VzcyB0byBmaWxlcyBpcyBhbGxvd2VkIGZyb20gbG9nZ2VkIGluIHVzZXJzIGFuZCBwcm9jZXNzZXMuPC9saT48bGk+VHJhbnNmZXIgY29udHJvbDogVHJhbnNmZXIgb2YgcGVyc29uYWwgZGF0YSB0byBvdGhlciBwYXJ0aWVzIGlzIGJlaW5nIGxvZ2dlZC4mbmJzcDtMb2dzIGluY2x1ZGUgdGhlIHVzZXIvcHJvY2VzcyB0aGF0IGluaXRpYXRlZCB0aGUgaW5wdXQsIHRoZSB0eXBlIG9mIHBlcnNvbmFsIGRhdGEgYW5kIHRoZSB0aW1lc3RhbXAuIFRoZSBsb2dzIGFyZSBrZXB0IGZvciA2IG1vbnRocy48L2xpPjxsaT5JbnB1dCBjb250cm9sOiBJbnB1dCBvZiBuZXcgYW5kIHVwZGF0ZWQgYXMgd2VsbCBhcyBkZWxldGlvbiBvZiBwZXJzb25hbCBkYXRhIGlzIGxvZ2dlZC4gTG9ncyBpbmNsdWRlIHRoZSB1c2VyL3Byb2Nlc3MgdGhhdCBpbml0aWF0ZWQgdGhlIGlucHV0LCB0aGUgdHlwZSBvZiBwZXJzb25hbCBkYXRhIGFuZCB0aGUgdGltZXN0YW1wLiBUaGUgbG9ncyBhcmUga2VwdCBmb3IgNiBtb250aHMuPC9saT48bGk+VHJhbnNwb3J0IGNvbnRyb2w6IFRyYW5zcG9ydCBvZiBwZXJzb25hbCBkYXRhIGZyb20gYW5kIHRvIHRoZSBzeXN0ZW0gYXJlIHNlY3VyZWQgd2l0aCBzdHJvbmcgU1NMIGFuZC9vciBlbmQtdG8tZW5kIGVuY3J5cHRpb24uPC9saT48bGk+Q29uZmlkZW50aWFsaXR5OiBQZXJzb25hbCBkYXRhIGlzIHN0b3JlZCBlbmQtdG8tZW5kIGVuY3J5cHRlZCB3aGVyZXZlciBwb3NzaWJsZS48L2xpPjxsaT5SZXN0b3JhdGlvbiBjb250cm9sOiBBbGwgc3lzdGVtcyBoYXZlIGEgc2Vjb25kIG5ldHdvcmsgaW50ZXJmYWNlIHdpdGggYWNjZXNzIGZvciBEZXZPcHMgb25seS4gVGhpcyBpbnRlcmZhY2UgYWxsb3dzIGFjY2VzcyBldmVuIGlmIHRoZSBtYWluIGludGVyZmFjZSBpcyBibG9ja2VkLiBDb21wb25lbnRzIG9mIHRoZSBzeXN0ZW0gY2FuIGJlIHJlc3RhcnRlZCBpbiBjYXNlIG9mIGVycm9yIGNvbmRpdGlvbnMuIEEgRERPUyBtaXRpZ2F0aW9uIHNlcnZpY2UgaXMgYXV0b21hdGljYWxseSBhY3RpdmF0ZWQgaWYgYSBERE9TIGF0dGFjayBvY2N1cnMgdGhhdCBtYWtlcyB0aGUgc3lzdGVtIGluYWNjZXNzaWJsZS48L2xpPjxsaT5SZWxpYWJpbGl0eTombmJzcDsmbmJzcDtEZXZPcHMgbW9uaXRvciBhbGwgc3lzdGVtcyBhbmQgYXJlIG5vdGlmaWVkIGlmIGFueSBjb21wb25lbnQgb2YgdGhlIHN5c3RlbSBmYWlscyB0byBiZSBhYmxlIHRvIGJyaW5nIGl0IHVwIGFnYWluIGltbWVkaWF0ZWx5LjwvbGk+PGxpPkRhdGEgaW50ZWdyaXR5OiBBdXRvbWF0aWMgZXJyb3IgY29ycmVjdGlvbiBvbiBkYXRhIG1lZGl1bXMgYW5kIGFsc28gb24gZGF0YWJhc2UgbGV2ZWwgbWFrZSBzdXJlIHRoYXQgZGF0YSBpbnRlZ3JpdHkgaXMgZ3VhcmFudGVlZC4gQWRkaXRpb25hbGx5IHRoZSBpbnRlZ3JpdHkgb2YgZW5kLXRvLWVuZCBlbmNyeXB0ZWQgcGVyc29uYWwgZGF0YSBpcyBndWFyYW50ZWVkIHRocm91Z2ggTUFDcyBkdXJpbmcgZW5jcnlwdGlvbiBhbmQgZGVjcnlwdGlvbi48L2xpPjxsaT5JbnN0cnVjdGlvbiBjb250cm9sOiBBbGwgZW1wbG95ZWVzIGFyZSBhd2FyZSBvZiB0aGUgcHVycG9zZXMgb2YgcHJvY2Vzc2luZyBhbmQgcmVndWxhcmx5IGNvbXBsZXRlJm5ic3A7YW4gaW50ZXJuYWwgc2VjdXJpdHkgYXdhcmVuZXNzIHByb2dyYW0uIChTdWIpcHJvY2Vzc29ycyBhcmUgaW5zdHJ1Y3RlZCBieSB3cml0dGVuIGNvbnRyYWN0cy48L2xpPjxsaT5BdmFpbGFiaWxpdHkgY29udHJvbDogQWxsIHN5c3RlbXMgYXJlIGxvY2F0ZWQgaW4gSVNPIDI3MDAxIGNlcnRpZmllZCZuYnNwO2RhdGEgY2VudGVycyBpbiBHZXJtYW55IHdoaWNoIGd1YXJhbnRlZSB0aGUgcGh5c2ljYWwgYXZhaWxhYmlsaXR5IGFuZCBjb25uZWN0aW9uIG9mIHRoZSBzeXN0ZW1zLiBBbGwgbG9uZy10ZXJtIGRhdGEgaXMgc3RvcmVkIGFzIHRocmVlIHJlcGxpY2FzIG9uIGRpZmZlcmVudCBzZXJ2ZXJzIG9yIGluIGEgUkFJRCBzeXN0ZW0uIEJhY2t1cHMgYXJlIGNyZWF0ZWQgcHJpb3IgdG8gdXBkYXRpbmcgY3JpdGljYWwgcGFydHMgb2YgdGhlIHN5c3RlbS48L2xpPjxsaT5TZXBhcmFiaWxpdHk6IFNlcGFyYXRlIHByb2Nlc3NpbmcgZm9yIHBlcnNvbmFsIGRhdGEgaXMgc2V0IHVwIGFzIHJlcXVpcmVkLjwvbGk+PGxpPlJlc2lsaWVuY2U6IEFsbCBzeXN0ZW1zIHVzZSBoaWdobHkgc2NhbGFibGUgY29tcG9uZW50cyB0aGF0IGFyZSBkZXNpZ25lZCBmb3IgbXVjaCBoaWdoZXIgbG9hZCB0aGFuIGFjdHVhbGx5IG5lZWRlZC4gQWxsIHN5c3RlbXMgYXJlIGV4cGFuZGFibGUgdmVyeSBxdWlja2x5IHRvIGNvbnRpbnVvdXNseSBhbGxvdyBwcm9jZXNzaW5nIGhpZ2hlciBsb2Fkcy48L2xpPjwvb2w+PC9kaXY+XFxuJyArXG5cdFx0XHRcIjwvZGl2PlwiLFxuXHR9LFxuXHRcIjFfZGVcIjoge1xuXHRcdGhlYWRpbmc6XG5cdFx0XHQnPGRpdiBjbGFzcz1cInBhcGVydGV4dFwiPjxoMiBzdHlsZT1cInRleHQtYWxpZ246IGNlbnRlcjtcIiBpZD1cIlZlcnRyYWd6dXJBdWZ0cmFnc3ZlcmFyYmVpdHVuZy1WZXJ0cmFnenVyQXVmdHJhZ3N2ZXJhcmJlaXR1bmdcIj5WZXJ0cmFnIHp1ciBBdWZ0cmFnc3ZlcmFyYmVpdHVuZzwvaDI+PHAgc3R5bGU9XCJ0ZXh0LWFsaWduOiBjZW50ZXI7XCI+endpc2NoZW48L3A+Jyxcblx0XHRjb250ZW50OlxuXHRcdFx0JzxwIHN0eWxlPVwidGV4dC1hbGlnbjogY2VudGVyO1wiPi0mbmJzcDtWZXJhbnR3b3J0bGljaGVyIC08YnI+bmFjaHN0ZWhlbmQgQXVmdHJhZ2dlYmVyIGdlbmFubnQmbmJzcDs8L3A+PHAgc3R5bGU9XCJ0ZXh0LWFsaWduOiBjZW50ZXI7XCI+dW5kPC9wPjxwIHN0eWxlPVwidGV4dC1hbGlnbjogY2VudGVyO1wiPlR1dGFvIEdtYkgsIERlaXN0ZXJzdHIuIDE3YSwgMzA0NDkgSGFubm92ZXI8L3A+PHAgc3R5bGU9XCJ0ZXh0LWFsaWduOiBjZW50ZXI7XCI+LSZuYnNwO0F1ZnRyYWdzdmVyYXJiZWl0ZXIgLTxicj5uYWNoc3RlaGVuZCZuYnNwO0F1ZnRyYWduZWhtZXIgZ2VuYW5udDwvcD48cCBzdHlsZT1cInRleHQtYWxpZ246IGNlbnRlcjtcIj4mbmJzcDs8L3A+PGgyIGlkPVwiVmVydHJhZ3p1ckF1ZnRyYWdzdmVyYXJiZWl0dW5nLTEuR2VnZW5zdGFuZHVuZERhdWVyXCI+MS4mbmJzcDtHZWdlbnN0YW5kIHVuZCBEYXVlcjwvaDI+PHA+RGVyIEdlZ2Vuc3RhbmQgZGVzIEF1ZnRyYWdzIGVyZ2lidCBzaWNoIGF1cyBkZW4gQUdCIGRlciBUdXRhbyBHbWJIIGluIGRlciBqZXdlaWxzIGfDvGx0aWdlbiBWZXJzaW9uLCBzaWVoZSA8c3BhbiBjbGFzcz1cIm5vbGlua1wiPmh0dHBzOi8vdHV0YS5jb20vdGVybXM8L3NwYW4+LCBhdWYgZGllIGhpZXIgdmVyd2llc2VuIHdpcmQgKGltIEZvbGdlbmRlbiBMZWlzdHVuZ3N2ZXJlaW5iYXJ1bmcpLiBEZXImbmJzcDtBdWZ0cmFnbmVobWVyIHZlcmFyYmVpdGV0IGRhYmVpIHBlcnNvbmVuYmV6b2dlbmUgRGF0ZW4gZsO8ciBkZW4gQXVmdHJhZ2dlYmVyJm5ic3A7aW0gU2lubmUgdm9uIEFydC4gNCBOci4gMiB1bmQgQXJ0LiAyOCBEUy1HVk8gYXVmIEdydW5kbGFnZSBkaWVzZXMgVmVydHJhZ2VzLjwvcD48cD5EaWUgRGF1ZXIgZGllc2VzIEF1ZnRyYWdzIGVudHNwcmljaHQgZGVyIGltIGpld2VpbGlnZW4gVGFyaWYgZ2V3w6RobHRlbiBWZXJ0cmFnc2xhdWZ6ZWl0LjwvcD48aDIgaWQ9XCJWZXJ0cmFnenVyQXVmdHJhZ3N2ZXJhcmJlaXR1bmctMi5ad2VjayxEYXRlbmthdGVnb3JpZW51bmRiZXRyb2ZmZW5lUGVyc29uZW5cIj4yLiBad2VjaywgRGF0ZW5rYXRlZ29yaWVuIHVuZCBiZXRyb2ZmZW5lIFBlcnNvbmVuPC9oMj48cD5adXIgQmVncsO8bmR1bmcgZWluZXMgVmVydHJhZ3N2ZXJow6RsdG5pc3NlcywgdW5kIHp1ciBMZWlzdHVuZ3NlcmJyaW5ndW5nIHdpcmQ8L3A+PHVsPjxsaT5kaWUgbmV1IHJlZ2lzdHJpZXJ0ZSBFLU1haWwtQWRyZXNzZTwvbGk+PC91bD48cD5hbHMgQmVzdGFuZHNkYXR1bSBlcmZhc3N0LjwvcD48cD5Gw7xyIGRpZSBSZWNobnVuZ3NzdGVsbHVuZyB1bmQgQmVzdGltbXVuZyBkZXIgVW1zYXR6c3RldWVyJm5ic3A7d2VyZGVuPC9wPjx1bD48bGk+ZGVyIFNpdHogZGVzIEt1bmRlbiAoTGFuZCk8L2xpPjxsaT5kaWUgUmVjaG51bmdzYWRyZXNzZTwvbGk+PGxpPmRpZSZuYnNwO1VTdC1JZE5yLiAobnVyIGbDvHIgR2VzY2jDpGZ0c2t1bmRlbiBiZXN0aW1tdGVyIEzDpG5kZXIpPC9saT48L3VsPjxwPmFscyBCZXN0YW5kc2RhdGVuIGVyZmFzc3QuPC9wPjxwPlp1ciBBYndpY2tsdW5nIHZvbiBaYWhsdW5nZW4gd2VyZGVuLCBqZSBuYWNoIGdld8OkaGx0ZXIgWmFobHVuZ3NhcnQsIGRpZSBmb2xnZW5kZW4gWmFobHVuZ3NkYXRlbiAoQmVzdGFuZHNkYXRlbikgZXJmYXNzdDo8L3A+PHVsPjxsaT5CYW5rdmVyYmluZHVuZyAoS29udG9udW1tZXIgdW5kIEJMWiBiencuIElCQU4vQklDLCBnZ2YuIEJhbmtuYW1lLCBLb250b2luaGFiZXIpLDwvbGk+PGxpPktyZWRpdGthcnRlbmRhdGVuLDwvbGk+PGxpPmRlciBQYXlQYWwtTnV0emVybmFtZS48L2xpPjwvdWw+PHA+WnVyIEFid2lja2x1bmcgdm9uIExhc3RzY2hyaWZ0ZW4gd2lyZCBkaWUgQmFua3ZlcmJpbmR1bmcgYW4gZGFzIGJlYXVmdHJhZ3RlIEtyZWRpdGluc3RpdHV0IHdlaXRlcmdlZ2ViZW4uIDxzcGFuPlp1ciBBYndpY2tsdW5nIHZvbiBQYXlQYWwtWmFobHVuZ2VuIHdlcmRlbiBkaWUgUGF5UGFsLVphaGx1bmdzZGF0ZW4gYW4gUGF5UGFsIChFdXJvcGUpIHdlaXRlcmdlZ2ViZW4uIDwvc3Bhbj5adXIgQWJ3aWNrbHVuZyB2b24mbmJzcDtLcmVkaXRrYXJ0ZW56YWhsdW5nZW4gd2VyZGVuIGRpZSBLcmVkaXRrYXJ0ZW5kYXRlbiB6dXIgQXVmdHJhZ3N2ZXJhcmJlaXR1bmcgYW4gZGVuIFphaGx1bmdzZGllbnN0bGVpc3RlciZuYnNwO0JyYWludHJlZSZuYnNwO3dlaXRlcmdlZ2ViZW4uIEhpZXJiZWkgaGFuZGVsdCBlcyBzaWNoIHVtIGVpbmUgw5xiZXJtaXR0bHVuZyB2b24gcGVyc29uZW5iZXpvZ2VuZW4gRGF0ZW4gYW4gZWluIERyaXR0bGFuZC4gRWluIG1pdCBCcmFpbnRyZWUgZ2VzY2hsb3NzZW5lciBWZXJ0cmFnIHNpZWh0IGdlZWlnbmV0ZSBHYXJhbnRpZW4gdm9yIHVuZCBzdGVsbHQgc2ljaGVyLCBkYXNzIGRpZSB3ZWl0ZXJnZWdlYmVuZW4gRGF0ZW4gbnVyIGltIEVpbmtsYW5nIG1pdCBkZXIgRFNHVk8gdW5kIGxlZGlnbGljaCB6dXIgQWJ3aWNrbHVuZyB2b24gWmFobHVuZ2VuIHZlcndlbmRldCB3ZXJkZW4uIERpZXNlciBWZXJ0cmFnIGthbm4mbmJzcDtoaWVyIGVpbmdlc2VoZW4gd2VyZGVuOiZuYnNwOzxzcGFuIGNsYXNzPVwibm9saW5rXCI+aHR0cHM6Ly93d3cuYnJhaW50cmVlcGF5bWVudHMuY29tL2Fzc2V0cy9CcmFpbnRyZWUtUFNBLU1vZGVsLUNsYXVzZXMtTWFyY2gyMDE4LnBkZjwvc3Bhbj48L3A+PHA+VHV0YW5vdGEgc3RlbGx0IERpZW5zdGUgenVyIFNwZWljaGVydW5nLCBCZWFyYmVpdHVuZywgRGFyc3RlbGx1bmcgdW5kIGVsZWt0cm9uaXNjaGVtIFZlcnNhbmQgdm9uIERhdGVuIGJlcmVpdCwgd2llIHouQi4gRS1NYWlsLVNlcnZpY2UsIEtvbnRha3R2ZXJ3YWx0dW5nIHVuZCBEYXRlbmFibGFnZS4gSW0gUmFobWVuIGRpZXNlciBJbmhhbHRzZGF0ZW4ga8O2bm5lbiBwZXJzb25lbmJlem9nZW5lIERhdGVuIGRlcyBBdWZ0cmFnZ2ViZXJzIHZlcmFyYmVpdGV0IHdlcmRlbi4gQWxsZSB0ZXh0dWVsbGVuIEluaGFsdGUgd2VyZGVuIHZlcnNjaGzDvHNzZWx0IGbDvHIgZGVuIE51dHplciB1bmQgZGVzc2VuIEtvbW11bmlrYXRpb25zcGFydG5lciBnZXNwZWljaGVydCwgc28gZGFzcyBkaWUgVHV0YW8gR21iSCBzZWxic3Qga2VpbmVuIFp1Z3JpZmYgYXVmIGRpZXNlIERhdGVuIGhhdC48L3A+PHA+WnVyIEF1ZnJlY2h0ZXJoYWx0dW5nIGRlcyZuYnNwO01haWxzZXJ2ZXItQmV0cmllYnMsIHp1ciBGZWhsZXJkaWFnbm9zZSB1bmQgenVyIFZlcmhpbmRlcnVuZyB2b24gTWlzc2JyYXVjaCB3ZXJkZW4gTWFpbC1TZXJ2ZXItTG9ncyBtYXhpbWFsIDMwIFRhZ2UgZ2VzcGVpY2hlcnQuIERpZXNlIGVudGhhbHRlbiBTZW5kZXItIHVuZCBFbXBmw6RuZ2VyLUUtTWFpbC1BZHJlc3NlbiBzb3dpZSBkZW4gWmVpdHB1bmt0IGRlciBWZXJiaW5kdW5nLCBqZWRvY2gga2VpbmUgSVAtQWRyZXNzZW4gZGVyIEJlbnV0emVyLjwvcD48cD5adXIgU2ljaGVyc3RlbGx1bmcgZGVzIEJldHJpZWJzLCB6dXImbmJzcDtWZXJoaW5kZXJ1bmcgdm9uIE1pc3NicmF1Y2ggdW5kIHp1ciZuYnNwO0Jlc3VjaGVyYXVzd2VydHVuZyB3ZXJkZW4gSVAtQWRyZXNzZW4gZGVyIEJlbnV0emVyIHZlcmFyYmVpdGV0LiA8c3Bhbj5FaW5lIFNwZWljaGVydW5nIGVyZm9sZ3QgbnVyIGbDvHIgYW5vbnltaXNpZXJ0ZSB1bmQgZGFtaXQgbmljaHQgbWVociA8L3NwYW4+PHNwYW4+cGVyc29uZW5iZXpvZ2VuZSA8L3NwYW4+PHNwYW4+SVAtQWRyZXNzZW4uPC9zcGFuPjwvcD48cD5NaXQgQXVzbmFobWUgZGVyIFphaGx1bmdzZGF0ZW4gd2VyZGVuIGRpZSBwZXJzb25lbmJlem9nZW5lbiBEYXRlbiBpbmtsdXNpdmUgZGVyIEUtTWFpbC1BZHJlc3NlIG5pY2h0IGFuIERyaXR0ZSB3ZWl0ZXJnZWdlYmVuLiBKZWRvY2gga2FubiBUdXRhbyBHbWJIIHJlY2h0bGljaCB2ZXJwZmxpY2h0ZXQgd2VyZGVuIEluaGFsdHNkYXRlbiAoYmVpIFZvcmxhZ2UgZWluZXMgZ8O8bHRpZ2VuIGRldXRzY2hlbiBHZXJpY2h0c2Jlc2NobHVzc2VzKSBzb3dpZSZuYnNwO0Jlc3RhbmRzZGF0ZW4gYW4gU3RyYWZ2ZXJmb2xndW5nc2JlaMO2cmRlbiBhdXN6dWxpZWZlcm4uIEVzIGVyZm9sZ3Qga2VpbiBWZXJrYXVmIHZvbiBEYXRlbi48L3A+PHA+RGllIEVyYnJpbmd1bmcgZGVyIHZlcnRyYWdsaWNoIHZlcmVpbmJhcnRlbiBEYXRlbnZlcmFyYmVpdHVuZyBmaW5kZXQgYXVzc2NobGllw59saWNoIGluIGVpbmVtIE1pdGdsaWVkc3N0YWF0IGRlciBFdXJvcMOkaXNjaGVuIFVuaW9uIG9kZXIgaW4gZWluZW0gYW5kZXJlbiBWZXJ0cmFnc3N0YWF0IGRlcyBBYmtvbW1lbnMgw7xiZXIgZGVuIEV1cm9ww6Rpc2NoZW4gV2lydHNjaGFmdHNyYXVtIHN0YXR0LiZuYnNwO0plZGUgVmVybGFnZXJ1bmcgaW4gZWluIERyaXR0bGFuZCBiZWRhcmYgZGVyIHZvcmhlcmlnZW4gWnVzdGltbXVuZyBkZXMgQXVmdHJhZ2dlYmVycyB1bmQgZGFyZiBudXIgZXJmb2xnZW4sIHdlbm4gZGllIGJlc29uZGVyZW4gVm9yYXVzc2V0enVuZ2VuIGRlciBBcnQuIDQ0IGZmLiBEUy1HVk8gZXJmw7xsbHQgc2luZC4mbmJzcDs8L3A+PHA+RGllIEthdGVnb3JpZW4gZGVyIGR1cmNoIGRpZSBWZXJhcmJlaXR1bmcgYmV0cm9mZmVuZW4gUGVyc29uZW4gdW1mYXNzZW4gZGllIGR1cmNoIGRlbiBBdWZ0cmFnZ2ViZXIgaW4gVHV0YW5vdGEgZWluZ2VyaWNodGV0ZSBOdXR6ZXIgdW5kIGRlcmVuIEtvbW11bmlrYXRpb25zcGFydG5lci48L3A+PGgyIGlkPVwiVmVydHJhZ3p1ckF1ZnRyYWdzdmVyYXJiZWl0dW5nLTMuVGVjaG5pc2NoLW9yZ2FuaXNhdG9yaXNjaGVNYcOfbmFobWVuXCI+My4gVGVjaG5pc2NoLW9yZ2FuaXNhdG9yaXNjaGUgTWHDn25haG1lbjwvaDI+PHA+KDEpIERlciZuYnNwO0F1ZnRyYWduZWhtZXIgaGF0IGRpZSBVbXNldHp1bmcgZGVyIGltIFZvcmZlbGQgZGVyIEF1ZnRyYWdzdmVyZ2FiZSBkYXJnZWxlZ3RlbiB1bmQgZXJmb3JkZXJsaWNoZW4gdGVjaG5pc2NoZW4gdW5kIG9yZ2FuaXNhdG9yaXNjaGVuIE1hw59uYWhtZW4gdm9yIEJlZ2lubiBkZXIgVmVyYXJiZWl0dW5nLCBpbnNiZXNvbmRlcmUgaGluc2ljaHRsaWNoIGRlciBrb25rcmV0ZW4gQXVmdHJhZ3NkdXJjaGbDvGhydW5nIHp1IGRva3VtZW50aWVyZW4gdW5kIGRlbSZuYnNwO0F1ZnRyYWdnZWJlciB6dXIgUHLDvGZ1bmcgenUgw7xiZXJnZWJlbi4gQmVpIEFremVwdGFueiBkdXJjaCBkZW4mbmJzcDtBdWZ0cmFnZ2ViZXImbmJzcDt3ZXJkZW4gZGllIGRva3VtZW50aWVydGVuIE1hw59uYWhtZW4gR3J1bmRsYWdlIGRlcyBBdWZ0cmFncy4gU293ZWl0IGRpZSBQcsO8ZnVuZyBkZXMmbmJzcDtBdWZ0cmFnZ2ViZXJzIGVpbmVuIEFucGFzc3VuZ3NiZWRhcmYgZXJnaWJ0LCBpc3QgZGllc2VyIGVpbnZlcm5laG1saWNoIHVtenVzZXR6ZW48L3A+PHAgYWxpZ249XCJqdXN0aWZ5XCI+KDIpIERlciBBdWZ0cmFnbmVobWVyIGhhdCBkaWUgU2ljaGVyaGVpdCBnZW0uIEFydC4gMjggQWJzLiAzIGxpdC4gYywgMzIgRFMtR1ZPIGluc2Jlc29uZGVyZSBpbiBWZXJiaW5kdW5nIG1pdCBBcnQuIDUgQWJzLiAxLCBBYnMuIDIgRFMtR1ZPIGhlcnp1c3RlbGxlbi4gSW5zZ2VzYW10IGhhbmRlbHQgZXMgc2ljaCBiZWkgZGVuIHp1IHRyZWZmZW5kZW4gTWHDn25haG1lbiB1bSBNYcOfbmFobWVuIGRlciBEYXRlbnNpY2hlcmhlaXQgdW5kIHp1ciBHZXfDpGhybGVpc3R1bmcgZWluZXMgZGVtIFJpc2lrbyBhbmdlbWVzc2VuZW4gU2NodXR6bml2ZWF1cyBoaW5zaWNodGxpY2ggZGVyIFZlcnRyYXVsaWNoa2VpdCwgZGVyIEludGVncml0w6R0LCBkZXIgVmVyZsO8Z2JhcmtlaXQgc293aWUgZGVyIEJlbGFzdGJhcmtlaXQgZGVyIFN5c3RlbWUuIERhYmVpIHNpbmQgZGVyIFN0YW5kIGRlciBUZWNobmlrLCBkaWUgSW1wbGVtZW50aWVydW5nc2tvc3RlbiB1bmQgZGllIEFydCwgZGVyIFVtZmFuZyB1bmQgZGllIFp3ZWNrZSBkZXIgVmVyYXJiZWl0dW5nIHNvd2llIGRpZSB1bnRlcnNjaGllZGxpY2hlIEVpbnRyaXR0c3dhaHJzY2hlaW5saWNoa2VpdCB1bmQgU2Nod2VyZSBkZXMgUmlzaWtvcyBmw7xyIGRpZSBSZWNodGUgdW5kIEZyZWloZWl0ZW4gbmF0w7xybGljaGVyIFBlcnNvbmVuIGltIFNpbm5lIHZvbiBBcnQuIDMyIEFicy4gMSBEUy1HVk8genUgYmVyw7xja3NpY2h0aWdlbiBbRWluemVsaGVpdGVuIGluIEFubGFnZSAxXS48L3A+PHAgYWxpZ249XCJqdXN0aWZ5XCI+KDMpIERpZSB0ZWNobmlzY2hlbiB1bmQgb3JnYW5pc2F0b3Jpc2NoZW4gTWHDn25haG1lbiB1bnRlcmxpZWdlbiBkZW0gdGVjaG5pc2NoZW4gRm9ydHNjaHJpdHQgdW5kIGRlciBXZWl0ZXJlbnR3aWNrbHVuZy4gSW5zb3dlaXQgaXN0IGVzIGRlbSBBdWZ0cmFnbmVobWVyIGdlc3RhdHRldCwgYWx0ZXJuYXRpdmUgYWTDpHF1YXRlIE1hw59uYWhtZW4gdW16dXNldHplbi4gRGFiZWkgZGFyZiBkYXMgU2ljaGVyaGVpdHNuaXZlYXUgZGVyIGZlc3RnZWxlZ3RlbiBNYcOfbmFobWVuIG5pY2h0IHVudGVyc2Nocml0dGVuIHdlcmRlbi4gV2VzZW50bGljaGUgw4RuZGVydW5nZW4gc2luZCB6dSBkb2t1bWVudGllcmVuLjwvcD48aDIgaWQ9XCJWZXJ0cmFnenVyQXVmdHJhZ3N2ZXJhcmJlaXR1bmctNC5CZXJpY2h0aWd1bmcsRWluc2NocsOkbmt1bmd1bmRMw7ZzY2h1bmd2b25EYXRlblwiPjQuIEJlcmljaHRpZ3VuZywgRWluc2NocsOkbmt1bmcgdW5kIEzDtnNjaHVuZyB2b24gRGF0ZW48L2gyPjxwIGFsaWduPVwianVzdGlmeVwiPigxKSBEZXIgQXVmdHJhZ25laG1lciBkYXJmIGRpZSBEYXRlbiwgZGllIGltIEF1ZnRyYWcgdmVyYXJiZWl0ZXQgd2VyZGVuLCBuaWNodCBlaWdlbm3DpGNodGlnIHNvbmRlcm4gbnVyIG5hY2ggZG9rdW1lbnRpZXJ0ZXIgV2Vpc3VuZyBkZXMgQXVmdHJhZ2dlYmVycyBiZXJpY2h0aWdlbiwgbMO2c2NoZW4gb2RlciBkZXJlbiBWZXJhcmJlaXR1bmcgZWluc2NocsOkbmtlbi4gU293ZWl0IGVpbmUgYmV0cm9mZmVuZSBQZXJzb24gc2ljaCBkaWVzYmV6w7xnbGljaCB1bm1pdHRlbGJhciBhbiBkZW4gQXVmdHJhZ25laG1lciB3ZW5kZXQsIHdpcmQgZGVyIEF1ZnRyYWduZWhtZXIgZGllc2VzIEVyc3VjaGVuIHVudmVyesO8Z2xpY2ggYW4gZGVuIEF1ZnRyYWdnZWJlciB3ZWl0ZXJsZWl0ZW4uPC9wPjxwIGFsaWduPVwianVzdGlmeVwiPigyKSBTb3dlaXQgdm9tIExlaXN0dW5nc3VtZmFuZyB1bWZhc3N0LCBzaW5kIEzDtnNjaGtvbnplcHQsIFJlY2h0IGF1ZiBWZXJnZXNzZW53ZXJkZW4sIEJlcmljaHRpZ3VuZywgRGF0ZW5wb3J0YWJpbGl0w6R0IHVuZCBBdXNrdW5mdCBuYWNoIGRva3VtZW50aWVydGVyIFdlaXN1bmcgZGVzIEF1ZnRyYWdnZWJlcnMgdW5taXR0ZWxiYXIgZHVyY2ggZGVuIEF1ZnRyYWduZWhtZXIgc2ljaGVyenVzdGVsbGVuLjwvcD48aDIgaWQ9XCJWZXJ0cmFnenVyQXVmdHJhZ3N2ZXJhcmJlaXR1bmctNS5RdWFsaXTDpHRzc2ljaGVydW5ndW5kc29uc3RpZ2VQZmxpY2h0ZW5kZXNBdWZ0cmFnbmVobWVyc1wiPjUuIFF1YWxpdMOkdHNzaWNoZXJ1bmcgdW5kIHNvbnN0aWdlIFBmbGljaHRlbiBkZXMgQXVmdHJhZ25laG1lcnM8L2gyPjxwIGFsaWduPVwianVzdGlmeVwiPkRlciBBdWZ0cmFnbmVobWVyIGhhdCB6dXPDpHR6bGljaCB6dSBkZXIgRWluaGFsdHVuZyBkZXIgUmVnZWx1bmdlbiBkaWVzZXMgQXVmdHJhZ3MgZ2VzZXR6bGljaGUgUGZsaWNodGVuIGdlbcOkw58gQXJ0LiAyOCBiaXMgMzMgRFMtR1ZPOyBpbnNvZmVybiBnZXfDpGhybGVpc3RldCBlciBpbnNiZXNvbmRlcmUgZGllIEVpbmhhbHR1bmcgZm9sZ2VuZGVyIFZvcmdhYmVuOjwvcD48b2w+PGxpPjxwIGFsaWduPVwianVzdGlmeVwiPkRlciBBdWZ0cmFnbmVobWVyIGlzdCBuaWNodCB6dXIgQmVzdGVsbHVuZyBlaW5lcyBEYXRlbnNjaHV0emJlYXVmdHJhZ3RlbiB2ZXJwZmxpY2h0ZXQuIEFscyBBbnNwcmVjaHBhcnRuZXIgYmVpbSBBdWZ0cmFnbmVobWVyIHdpcmQgSGVyciBBcm5lIE3DtmhsZSwgVGVsZWZvbjogMDUxMSAyMDI4MDEtMTEsIGFybmUubW9laGxlQHR1dGFvLmRlLCBiZW5hbm50LjwvcD48L2xpPjxsaT48cCBhbGlnbj1cImp1c3RpZnlcIj5EaWUgV2FocnVuZyBkZXIgVmVydHJhdWxpY2hrZWl0IGdlbcOkw58gQXJ0LiAyOCBBYnMuIDMgUy4gMiBsaXQuIGIsIDI5LCAzMiBBYnMuIDQgRFMtR1ZPLiBEZXIgQXVmdHJhZ25laG1lciBzZXR6dCBiZWkgZGVyIER1cmNoZsO8aHJ1bmcgZGVyIEFyYmVpdGVuIG51ciBCZXNjaMOkZnRpZ3RlIGVpbiwgZGllIGF1ZiBkaWUgVmVydHJhdWxpY2hrZWl0IHZlcnBmbGljaHRldCB1bmQgenV2b3IgbWl0IGRlbiBmw7xyIHNpZSByZWxldmFudGVuIEJlc3RpbW11bmdlbiB6dW0gRGF0ZW5zY2h1dHogdmVydHJhdXQgZ2VtYWNodCB3dXJkZW4uIERlciBBdWZ0cmFnbmVobWVyIHVuZCBqZWRlIGRlbSBBdWZ0cmFnbmVobWVyIHVudGVyc3RlbGx0ZSBQZXJzb24sIGRpZSBadWdhbmcgenUgcGVyc29uZW5iZXpvZ2VuZW4gRGF0ZW4gaGF0LCBkw7xyZmVuIGRpZXNlIERhdGVuIGF1c3NjaGxpZcOfbGljaCBlbnRzcHJlY2hlbmQgZGVyIFdlaXN1bmcgZGVzIEF1ZnRyYWdnZWJlcnMgdmVyYXJiZWl0ZW4gZWluc2NobGllw59saWNoIGRlciBpbiBkaWVzZW0gVmVydHJhZyBlaW5nZXLDpHVtdGVuIEJlZnVnbmlzc2UsIGVzIHNlaSBkZW5uLCBkYXNzIHNpZSBnZXNldHpsaWNoIHp1ciBWZXJhcmJlaXR1bmcgdmVycGZsaWNodGV0IHNpbmQuPC9wPjwvbGk+PGxpPjxwIGFsaWduPVwianVzdGlmeVwiPkRpZSBVbXNldHp1bmcgdW5kIEVpbmhhbHR1bmcgYWxsZXIgZsO8ciBkaWVzZW4gQXVmdHJhZyBlcmZvcmRlcmxpY2hlbiB0ZWNobmlzY2hlbiB1bmQgb3JnYW5pc2F0b3Jpc2NoZW4gTWHDn25haG1lbiBnZW3DpMOfIEFydC4gMjggQWJzLiAzIFMuIDIgbGl0LiBjLCAzMiBEUy1HVk8gW0VpbnplbGhlaXRlbiBpbiBBbmxhZ2UgMV0uPC9wPjwvbGk+PGxpPjxwIGFsaWduPVwianVzdGlmeVwiPkRlciBBdWZ0cmFnZ2ViZXIgdW5kIGRlciBBdWZ0cmFnbmVobWVyIGFyYmVpdGVuIGF1ZiBBbmZyYWdlIG1pdCBkZXIgQXVmc2ljaHRzYmVow7ZyZGUgYmVpIGRlciBFcmbDvGxsdW5nIGlocmVyIEF1ZmdhYmVuIHp1c2FtbWVuLjwvcD48L2xpPjxsaT48cCBhbGlnbj1cImp1c3RpZnlcIj5EaWUgdW52ZXJ6w7xnbGljaGUgSW5mb3JtYXRpb24gZGVzIEF1ZnRyYWduZWhtZXJzIMO8YmVyIEtvbnRyb2xsaGFuZGx1bmdlbiB1bmQgTWHDn25haG1lbiBkZXIgQXVmc2ljaHRzYmVow7ZyZGUsIHNvd2VpdCBzaWUgc2ljaCBhdWYgZGllc2VuIEF1ZnRyYWcgYmV6aWVoZW4uIERpZXMgZ2lsdCBhdWNoLCBzb3dlaXQgZWluZSB6dXN0w6RuZGlnZSBCZWjDtnJkZSBpbSBSYWhtZW4gZWluZXMgT3JkbnVuZ3N3aWRyaWdrZWl0cy0gb2RlciBTdHJhZnZlcmZhaHJlbnMgaW4gQmV6dWcgYXVmIGRpZSBWZXJhcmJlaXR1bmcgcGVyc29uZW5iZXpvZ2VuZXIgRGF0ZW4gYmVpIGRlciBBdWZ0cmFnc3ZlcmFyYmVpdHVuZyBiZWltIEF1ZnRyYWduZWhtZXIgZXJtaXR0ZWx0LjwvcD48L2xpPjxsaT48cCBhbGlnbj1cImp1c3RpZnlcIj5Tb3dlaXQgZGVyIEF1ZnRyYWdnZWJlciBzZWluZXJzZWl0cyBlaW5lciBLb250cm9sbGUgZGVyIEF1ZnNpY2h0c2JlaMO2cmRlLCBlaW5lbSBPcmRudW5nc3dpZHJpZ2tlaXRzLSBvZGVyIFN0cmFmdmVyZmFocmVuLCBkZW0gSGFmdHVuZ3NhbnNwcnVjaCBlaW5lciBiZXRyb2ZmZW5lbiBQZXJzb24gb2RlciBlaW5lcyBEcml0dGVuIG9kZXIgZWluZW0gYW5kZXJlbiBBbnNwcnVjaCBpbSBadXNhbW1lbmhhbmcgbWl0IGRlciBBdWZ0cmFnc3ZlcmFyYmVpdHVuZyBiZWltIEF1ZnRyYWduZWhtZXIgYXVzZ2VzZXR6dCBpc3QsIGhhdCBpaG4gZGVyIEF1ZnRyYWduZWhtZXIgbmFjaCBiZXN0ZW4gS3LDpGZ0ZW4genUgdW50ZXJzdMO8dHplbi48L3A+PC9saT48bGk+PHAgYWxpZ249XCJqdXN0aWZ5XCI+RGVyIEF1ZnRyYWduZWhtZXIga29udHJvbGxpZXJ0IHJlZ2VsbcOkw59pZyBkaWUgaW50ZXJuZW4gUHJvemVzc2Ugc293aWUgZGllIHRlY2huaXNjaGVuIHVuZCBvcmdhbmlzYXRvcmlzY2hlbiBNYcOfbmFobWVuLCB1bSB6dSBnZXfDpGhybGVpc3RlbiwgZGFzcyBkaWUgVmVyYXJiZWl0dW5nIGluIHNlaW5lbSBWZXJhbnR3b3J0dW5nc2JlcmVpY2ggaW0gRWlua2xhbmcgbWl0IGRlbiBBbmZvcmRlcnVuZ2VuIGRlcyBnZWx0ZW5kZW4gRGF0ZW5zY2h1dHpyZWNodHMgZXJmb2xndCB1bmQgZGVyIFNjaHV0eiBkZXIgUmVjaHRlIGRlciBiZXRyb2ZmZW5lbiBQZXJzb24gZ2V3w6RocmxlaXN0ZXQgd2lyZC48L3A+PC9saT48bGk+PHAgYWxpZ249XCJqdXN0aWZ5XCI+TmFjaHdlaXNiYXJrZWl0IGRlciBnZXRyb2ZmZW5lbiB0ZWNobmlzY2hlbiB1bmQgb3JnYW5pc2F0b3Jpc2NoZW4gTWHDn25haG1lbiBnZWdlbsO8YmVyIGRlbSBBdWZ0cmFnZ2ViZXIgaW0gUmFobWVuIHNlaW5lciBLb250cm9sbGJlZnVnbmlzc2UgbmFjaCBaaWZmZXIgNyBkaWVzZXMgVmVydHJhZ2VzLjwvcD48L2xpPjwvb2w+PGgyIGlkPVwiVmVydHJhZ3p1ckF1ZnRyYWdzdmVyYXJiZWl0dW5nLTYuVW50ZXJhdWZ0cmFnc3ZlcmjDpGx0bmlzc2VcIj42LiBVbnRlcmF1ZnRyYWdzdmVyaMOkbHRuaXNzZTwvaDI+PHAgYWxpZ249XCJqdXN0aWZ5XCI+KDEpIEFscyBVbnRlcmF1ZnRyYWdzdmVyaMOkbHRuaXNzZSBpbSBTaW5uZSBkaWVzZXIgUmVnZWx1bmcgc2luZCBzb2xjaGUgRGllbnN0bGVpc3R1bmdlbiB6dSB2ZXJzdGVoZW4sIGRpZSBzaWNoIHVubWl0dGVsYmFyIGF1ZiBkaWUgRXJicmluZ3VuZyBkZXIgSGF1cHRsZWlzdHVuZyBiZXppZWhlbi4gTmljaHQgaGllcnp1IGdlaMO2cmVuIE5lYmVubGVpc3R1bmdlbiwgZGllIGRlciBBdWZ0cmFnbmVobWVyIHdpZSB6LkIuIFRlbGVrb21tdW5pa2F0aW9uc2xlaXN0dW5nZW4sIFBvc3QtL1RyYW5zcG9ydGRpZW5zdGxlaXN0dW5nZW4sIFdhcnR1bmcgdW5kIEJlbnV0emVyc2VydmljZSBvZGVyIGRpZSBFbnRzb3JndW5nIHZvbiBEYXRlbnRyw6RnZXJuIHNvd2llIHNvbnN0aWdlIE1hw59uYWhtZW4genVyIFNpY2hlcnN0ZWxsdW5nIGRlciBWZXJ0cmF1bGljaGtlaXQsIFZlcmbDvGdiYXJrZWl0LCBJbnRlZ3JpdMOkdCB1bmQgQmVsYXN0YmFya2VpdCBkZXIgSGFyZC0gdW5kIFNvZnR3YXJlIHZvbiBEYXRlbnZlcmFyYmVpdHVuZ3NhbmxhZ2VuIGluIEFuc3BydWNoIG5pbW10LiBEZXIgQXVmdHJhZ25laG1lciBpc3QgamVkb2NoIHZlcnBmbGljaHRldCwgenVyIEdld8OkaHJsZWlzdHVuZyBkZXMgRGF0ZW5zY2h1dHplcyB1bmQgZGVyIERhdGVuc2ljaGVyaGVpdCBkZXIgRGF0ZW4gZGVzIEF1ZnRyYWdnZWJlcnMgYXVjaCBiZWkgYXVzZ2VsYWdlcnRlbiBOZWJlbmxlaXN0dW5nZW4gYW5nZW1lc3NlbmUgdW5kIGdlc2V0emVza29uZm9ybWUgdmVydHJhZ2xpY2hlIFZlcmVpbmJhcnVuZ2VuIHNvd2llIEtvbnRyb2xsbWHDn25haG1lbiB6dSBlcmdyZWlmZW4uPC9wPjxwIGFsaWduPVwianVzdGlmeVwiPigyKSBEZXIgQXVmdHJhZ25laG1lciBkYXJmIFVudGVyYXVmdHJhZ25laG1lciAod2VpdGVyZSBBdWZ0cmFnc3ZlcmFyYmVpdGVyKSBudXIgbmFjaCB2b3JoZXJpZ2VyIGF1c2Ryw7xja2xpY2hlciBzY2hyaWZ0bGljaGVyIGJ6dy4gZG9rdW1lbnRpZXJ0ZXIgWnVzdGltbXVuZyBkZXMgQXVmdHJhZ2dlYmVycyBiZWF1ZnRyYWdlbi48L3A+PHAgYWxpZ249XCJqdXN0aWZ5XCI+KDMpIERpZSBBdXNsYWdlcnVuZyBhdWYgVW50ZXJhdWZ0cmFnbmVobWVyIHNvd2llIGRlciZuYnNwO1dlY2hzZWwgZGVyIGJlc3RlaGVuZGVuIFVudGVyYXVmdHJhZ25laG1lciBzaW5kIHp1bMOkc3NpZywgc293ZWl0OjwvcD48dWw+PGxpPmRlciBBdWZ0cmFnbmVobWVyIGVpbmUgc29sY2hlIEF1c2xhZ2VydW5nIGF1ZiBVbnRlcmF1ZnRyYWduZWhtZXIgZGVtIEF1ZnRyYWdnZWJlciBlaW5lIGFuZ2VtZXNzZW5lIFplaXQgdm9yYWIgc2NocmlmdGxpY2ggb2RlciBpbiBUZXh0Zm9ybSBhbnplaWd0IHVuZDwvbGk+PGxpPmRlciBBdWZ0cmFnZ2ViZXIgbmljaHQgYmlzIHp1bSBaZWl0cHVua3QgZGVyIMOcYmVyZ2FiZSBkZXIgRGF0ZW4gZ2VnZW7DvGJlciBkZW0gQXVmdHJhZ25laG1lciBzY2hyaWZ0bGljaCBvZGVyIGluIFRleHRmb3JtIEVpbnNwcnVjaCBnZWdlbiBkaWUgZ2VwbGFudGUgQXVzbGFnZXJ1bmcgZXJoZWJ0IHVuZDwvbGk+PGxpPmVpbmUgdmVydHJhZ2xpY2hlIFZlcmVpbmJhcnVuZyBuYWNoIE1hw59nYWJlIGRlcyBBcnQuIDI4IEFicy4gMi00IERTLUdWTyB6dWdydW5kZSBnZWxlZ3Qgd2lyZC48L2xpPjwvdWw+PHAgYWxpZ249XCJqdXN0aWZ5XCI+KDQpIERpZSBXZWl0ZXJnYWJlIHZvbiBwZXJzb25lbmJlem9nZW5lbiBEYXRlbiBkZXMgQXVmdHJhZ2dlYmVycyBhbiBkZW4gVW50ZXJhdWZ0cmFnbmVobWVyIHVuZCBkZXNzZW4gZXJzdG1hbGlnZXMgVMOkdGlnd2VyZGVuIHNpbmQgZXJzdCBtaXQgVm9ybGllZ2VuIGFsbGVyIFZvcmF1c3NldHp1bmdlbiBmw7xyIGVpbmUgVW50ZXJiZWF1ZnRyYWd1bmcgZ2VzdGF0dGV0LjwvcD48cCBhbGlnbj1cImp1c3RpZnlcIj4oNSkgRXJicmluZ3QgZGVyIFVudGVyYXVmdHJhZ25laG1lciBkaWUgdmVyZWluYmFydGUgTGVpc3R1bmcgYXXDn2VyaGFsYiBkZXIgRVUvZGVzIEVXUiBzdGVsbHQgZGVyIEF1ZnRyYWduZWhtZXIgZGllIGRhdGVuc2NodXR6cmVjaHRsaWNoZSBadWzDpHNzaWdrZWl0IGR1cmNoIGVudHNwcmVjaGVuZGUgTWHDn25haG1lbiBzaWNoZXIuIEdsZWljaGVzIGdpbHQsIHdlbm4gRGllbnN0bGVpc3RlciBpbSBTaW5uZSB2b24gQWJzLiAxIFNhdHogMiBlaW5nZXNldHp0IHdlcmRlbiBzb2xsZW4uPC9wPjxwIGFsaWduPVwianVzdGlmeVwiPig2KSBFaW5lIHdlaXRlcmUgQXVzbGFnZXJ1bmcgZHVyY2ggZGVuIFVudGVyYXVmdHJhZ25laG1lciBiZWRhcmYgZGVyIGF1c2Ryw7xja2xpY2hlbiBadXN0aW1tdW5nIGRlcyBIYXVwdGF1ZnRyYWdnZWJlcnMgKG1pbmQuIFRleHRmb3JtKS48L3A+PHAgYWxpZ249XCJqdXN0aWZ5XCI+KDcpIFPDpG10bGljaGUgdmVydHJhZ2xpY2hlbiBSZWdlbHVuZ2VuIGluIGRlciBWZXJ0cmFnc2tldHRlIHNpbmQgYXVjaCBkZW0gd2VpdGVyZW4gVW50ZXJhdWZ0cmFnbmVobWVyIGF1Znp1ZXJsZWdlbi48L3A+PGgyIGNsYXNzPVwid2VzdGVyblwiIGlkPVwiVmVydHJhZ3p1ckF1ZnRyYWdzdmVyYXJiZWl0dW5nLTcuS29udHJvbGxyZWNodGVkZXNBdWZ0cmFnZ2ViZXJzXCI+Ny4gS29udHJvbGxyZWNodGUgZGVzIEF1ZnRyYWdnZWJlcnM8L2gyPjxwIGFsaWduPVwianVzdGlmeVwiPigxKSBEZXIgQXVmdHJhZ2dlYmVyIGhhdCBkYXMgUmVjaHQsIGltIEJlbmVobWVuIG1pdCBkZW0gQXVmdHJhZ25laG1lciDDnGJlcnByw7xmdW5nZW4gZHVyY2h6dWbDvGhyZW4gb2RlciBkdXJjaCBpbSBFaW56ZWxmYWxsIHp1IGJlbmVubmVuZGUgUHLDvGZlciBkdXJjaGbDvGhyZW4genUgbGFzc2VuLiBFciBoYXQgZGFzIFJlY2h0LCBzaWNoIGR1cmNoIFN0aWNocHJvYmVua29udHJvbGxlbiwgZGllIGluIGRlciBSZWdlbCByZWNodHplaXRpZyBhbnp1bWVsZGVuIHNpbmQsIHZvbiBkZXIgRWluaGFsdHVuZyBkaWVzZXIgVmVyZWluYmFydW5nIGR1cmNoIGRlbiBBdWZ0cmFnbmVobWVyIGluIGRlc3NlbiBHZXNjaMOkZnRzYmV0cmllYiB6dSDDvGJlcnpldWdlbi48L3A+PHAgYWxpZ249XCJqdXN0aWZ5XCI+KDIpIERlciBBdWZ0cmFnbmVobWVyIHN0ZWxsdCBzaWNoZXIsIGRhc3Mgc2ljaCBkZXIgQXVmdHJhZ2dlYmVyIHZvbiBkZXIgRWluaGFsdHVuZyBkZXIgUGZsaWNodGVuIGRlcyBBdWZ0cmFnbmVobWVycyBuYWNoIEFydC4gMjggRFMtR1ZPIMO8YmVyemV1Z2VuIGthbm4uIERlciBBdWZ0cmFnbmVobWVyIHZlcnBmbGljaHRldCBzaWNoLCBkZW0gQXVmdHJhZ2dlYmVyIGF1ZiBBbmZvcmRlcnVuZyBkaWUgZXJmb3JkZXJsaWNoZW4gQXVza8O8bmZ0ZSB6dSBlcnRlaWxlbiB1bmQgaW5zYmVzb25kZXJlIGRpZSBVbXNldHp1bmcgZGVyIHRlY2huaXNjaGVuIHVuZCBvcmdhbmlzYXRvcmlzY2hlbiBNYcOfbmFobWVuIG5hY2h6dXdlaXNlbi48L3A+PHAgYWxpZ249XCJqdXN0aWZ5XCI+KDMpIERlciBOYWNod2VpcyBzb2xjaGVyIE1hw59uYWhtZW4sIGRpZSBuaWNodCBudXIgZGVuIGtvbmtyZXRlbiBBdWZ0cmFnIGJldHJlZmZlbiwga2FubiBlcmZvbGdlbiBkdXJjaDwvcD48dWw+PGxpPmRpZSBFaW5oYWx0dW5nIGdlbmVobWlndGVyIFZlcmhhbHRlbnNyZWdlbG4gZ2Vtw6TDnyBBcnQuIDQwIERTLUdWTzs8L2xpPjxsaT5kaWUgWmVydGlmaXppZXJ1bmcgbmFjaCBlaW5lbSBnZW5laG1pZ3RlbiBaZXJ0aWZpemllcnVuZ3N2ZXJmYWhyZW4gZ2Vtw6TDnyBBcnQuIDQyIERTLUdWTzs8L2xpPjxsaT5ha3R1ZWxsZSBUZXN0YXRlLCBCZXJpY2h0ZSBvZGVyIEJlcmljaHRzYXVzesO8Z2UgdW5hYmjDpG5naWdlciBJbnN0YW56ZW4gKHouQi4gV2lydHNjaGFmdHNwcsO8ZmVyLCBSZXZpc2lvbiwgRGF0ZW5zY2h1dHpiZWF1ZnRyYWd0ZXIsIElULVNpY2hlcmhlaXRzYWJ0ZWlsdW5nLCBEYXRlbnNjaHV0emF1ZGl0b3JlbiwgUXVhbGl0w6R0c2F1ZGl0b3Jlbik7PC9saT48bGk+ZWluZSBnZWVpZ25ldGUgWmVydGlmaXppZXJ1bmcgZHVyY2ggSVQtU2ljaGVyaGVpdHMtIG9kZXIgRGF0ZW5zY2h1dHphdWRpdCAoei5CLiBuYWNoIEJTSS1HcnVuZHNjaHV0eikuPC9saT48L3VsPjxwIGFsaWduPVwianVzdGlmeVwiPig0KSBGw7xyIGRpZSBFcm3DtmdsaWNodW5nIHZvbiBLb250cm9sbGVuIGR1cmNoIGRlbiBBdWZ0cmFnZ2ViZXIga2FubiBkZXIgQXVmdHJhZ25laG1lciBlaW5lbiBWZXJnw7x0dW5nc2Fuc3BydWNoIGdlbHRlbmQgbWFjaGVuLjwvcD48aDIgY2xhc3M9XCJ3ZXN0ZXJuXCIgaWQ9XCJWZXJ0cmFnenVyQXVmdHJhZ3N2ZXJhcmJlaXR1bmctOC5NaXR0ZWlsdW5nYmVpVmVyc3TDtsOfZW5kZXNBdWZ0cmFnbmVobWVyc1wiPjguIE1pdHRlaWx1bmcgYmVpIFZlcnN0w7bDn2VuIGRlcyBBdWZ0cmFnbmVobWVyczwvaDI+PHAgYWxpZ249XCJqdXN0aWZ5XCI+KDEpIERlciBBdWZ0cmFnbmVobWVyIHVudGVyc3TDvHR6dCBkZW4gQXVmdHJhZ2dlYmVyIGJlaSBkZXIgRWluaGFsdHVuZyBkZXIgaW4gZGVuIEFydGlrZWxuIDMyIGJpcyAzNiBkZXIgRFMtR1ZPIGdlbmFubnRlbiBQZmxpY2h0ZW4genVyIFNpY2hlcmhlaXQgcGVyc29uZW5iZXpvZ2VuZXIgRGF0ZW4sIE1lbGRlcGZsaWNodGVuIGJlaSBEYXRlbnBhbm5lbiwgRGF0ZW5zY2h1dHotRm9sZ2VhYnNjaMOkdHp1bmdlbiB1bmQgdm9yaGVyaWdlIEtvbnN1bHRhdGlvbmVuLiBIaWVyenUgZ2Vow7ZyZW4gdS5hLjwvcD48b2w+PGxpPjxwIGFsaWduPVwianVzdGlmeVwiPmRpZSBTaWNoZXJzdGVsbHVuZyBlaW5lcyBhbmdlbWVzc2VuZW4gU2NodXR6bml2ZWF1cyBkdXJjaCB0ZWNobmlzY2hlIHVuZCBvcmdhbmlzYXRvcmlzY2hlIE1hw59uYWhtZW4sIGRpZSBkaWUgVW1zdMOkbmRlIHVuZCBad2Vja2UgZGVyIFZlcmFyYmVpdHVuZyBzb3dpZSBkaWUgcHJvZ25vc3RpemllcnRlIFdhaHJzY2hlaW5saWNoa2VpdCB1bmQgU2Nod2VyZSBlaW5lciBtw7ZnbGljaGVuIFJlY2h0c3ZlcmxldHp1bmcgZHVyY2ggU2ljaGVyaGVpdHNsw7xja2VuIGJlcsO8Y2tzaWNodGlnZW4gdW5kIGVpbmUgc29mb3J0aWdlIEZlc3RzdGVsbHVuZyB2b24gcmVsZXZhbnRlbiBWZXJsZXR6dW5nc2VyZWlnbmlzc2VuIGVybcO2Z2xpY2hlbjwvcD48L2xpPjxsaT48cCBhbGlnbj1cImp1c3RpZnlcIj5kaWUgVmVycGZsaWNodHVuZywgVmVybGV0enVuZ2VuIHBlcnNvbmVuYmV6b2dlbmVyIERhdGVuIHVudmVyesO8Z2xpY2ggYW4gZGVuIEF1ZnRyYWdnZWJlciB6dSBtZWxkZW48L3A+PC9saT48bGk+PHAgYWxpZ249XCJqdXN0aWZ5XCI+ZGllIFZlcnBmbGljaHR1bmcsIGRlbSBBdWZ0cmFnZ2ViZXIgaW0gUmFobWVuIHNlaW5lciBJbmZvcm1hdGlvbnNwZmxpY2h0IGdlZ2Vuw7xiZXIgZGVtIEJldHJvZmZlbmVuIHp1IHVudGVyc3TDvHR6ZW4gdW5kIGlobSBpbiBkaWVzZW0gWnVzYW1tZW5oYW5nIHPDpG10bGljaGUgcmVsZXZhbnRlIEluZm9ybWF0aW9uZW4gdW52ZXJ6w7xnbGljaCB6dXIgVmVyZsO8Z3VuZyB6dSBzdGVsbGVuPC9wPjwvbGk+PGxpPjxwIGFsaWduPVwianVzdGlmeVwiPmRpZSBVbnRlcnN0w7x0enVuZyBkZXMgQXVmdHJhZ2dlYmVycyBmw7xyIGRlc3NlbiBEYXRlbnNjaHV0ei1Gb2xnZW5hYnNjaMOkdHp1bmc8L3A+PC9saT48bGk+PHAgYWxpZ249XCJqdXN0aWZ5XCI+ZGllIFVudGVyc3TDvHR6dW5nIGRlcyBBdWZ0cmFnZ2ViZXJzIGltIFJhaG1lbiB2b3JoZXJpZ2VyIEtvbnN1bHRhdGlvbmVuIG1pdCBkZXIgQXVmc2ljaHRzYmVow7ZyZGU8L3A+PC9saT48L29sPjxwIGFsaWduPVwianVzdGlmeVwiPigyKSBGw7xyIFVudGVyc3TDvHR6dW5nc2xlaXN0dW5nZW4sIGRpZSBuaWNodCBpbiBkZXIgTGVpc3R1bmdzYmVzY2hyZWlidW5nIGVudGhhbHRlbiBvZGVyIG5pY2h0IGF1ZiBlaW4gRmVobHZlcmhhbHRlbiBkZXMgQXVmdHJhZ25laG1lcnMgenVyw7xja3p1ZsO8aHJlbiBzaW5kLCBrYW5uIGRlciBBdWZ0cmFnbmVobWVyIGVpbmUgVmVyZ8O8dHVuZyBiZWFuc3BydWNoZW4uPC9wPjxoMiBjbGFzcz1cIndlc3Rlcm5cIiBpZD1cIlZlcnRyYWd6dXJBdWZ0cmFnc3ZlcmFyYmVpdHVuZy05LldlaXN1bmdzYmVmdWduaXNkZXNBdWZ0cmFnZ2ViZXJzXCI+OS4gV2Vpc3VuZ3NiZWZ1Z25pcyBkZXMgQXVmdHJhZ2dlYmVyczwvaDI+PHAgYWxpZ249XCJqdXN0aWZ5XCI+KDEpIE3DvG5kbGljaGUgV2Vpc3VuZ2VuIGJlc3TDpHRpZ3QgZGVyIEF1ZnRyYWdnZWJlciB1bnZlcnrDvGdsaWNoIChtaW5kLiBUZXh0Zm9ybSkuPC9wPjxwIGFsaWduPVwianVzdGlmeVwiPigyKSBEZXIgQXVmdHJhZ25laG1lciBoYXQgZGVuIEF1ZnRyYWdnZWJlciB1bnZlcnrDvGdsaWNoIHp1IGluZm9ybWllcmVuLCB3ZW5uIGVyIGRlciBNZWludW5nIGlzdCwgZWluZSBXZWlzdW5nIHZlcnN0b8OfZSBnZWdlbiBEYXRlbnNjaHV0enZvcnNjaHJpZnRlbi4gRGVyIEF1ZnRyYWduZWhtZXIgaXN0IGJlcmVjaHRpZ3QsIGRpZSBEdXJjaGbDvGhydW5nIGRlciBlbnRzcHJlY2hlbmRlbiBXZWlzdW5nIHNvbGFuZ2UgYXVzenVzZXR6ZW4sIGJpcyBzaWUgZHVyY2ggZGVuIEF1ZnRyYWdnZWJlciBiZXN0w6R0aWd0IG9kZXIgZ2XDpG5kZXJ0IHdpcmQuPC9wPjxoMiBjbGFzcz1cIndlc3Rlcm5cIiBpZD1cIlZlcnRyYWd6dXJBdWZ0cmFnc3ZlcmFyYmVpdHVuZy0xMC5Mw7ZzY2h1bmd1bmRSw7xja2dhYmV2b25wZXJzb25lbmJlem9nZW5lbkRhdGVuXCI+MTAuIEzDtnNjaHVuZyB1bmQgUsO8Y2tnYWJlIHZvbiBwZXJzb25lbmJlem9nZW5lbiBEYXRlbjwvaDI+PHAgYWxpZ249XCJqdXN0aWZ5XCI+KDEpIEtvcGllbiBvZGVyIER1cGxpa2F0ZSBkZXIgRGF0ZW4gd2VyZGVuIG9obmUgV2lzc2VuIGRlcyBBdWZ0cmFnZ2ViZXJzIG5pY2h0IGVyc3RlbGx0LiBIaWVydm9uIGF1c2dlbm9tbWVuIHNpbmQgU2ljaGVyaGVpdHNrb3BpZW4sIHNvd2VpdCBzaWUgenVyIEdld8OkaHJsZWlzdHVuZyBlaW5lciBvcmRudW5nc2dlbcOkw59lbiBEYXRlbnZlcmFyYmVpdHVuZyBlcmZvcmRlcmxpY2ggc2luZCwgc293aWUgRGF0ZW4sIGRpZSBpbSBIaW5ibGljayBhdWYgZGllIEVpbmhhbHR1bmcgZ2VzZXR6bGljaGVyIEF1ZmJld2FocnVuZ3NwZmxpY2h0ZW4gZXJmb3JkZXJsaWNoIHNpbmQuPC9wPjxwIGFsaWduPVwianVzdGlmeVwiPigyKSBOYWNoIEFic2NobHVzcyBkZXIgdmVydHJhZ2xpY2ggdmVyZWluYmFydGVuIEFyYmVpdGVuIG9kZXIgZnLDvGhlciBuYWNoIEF1ZmZvcmRlcnVuZyBkdXJjaCBkZW4gQXVmdHJhZ2dlYmVyIOKAkyBzcMOkdGVzdGVucyBtaXQgQmVlbmRpZ3VuZyBkZXIgTGVpc3R1bmdzdmVyZWluYmFydW5nIOKAkyBoYXQgZGVyIEF1ZnRyYWduZWhtZXIgc8OkbXRsaWNoZSBpbiBzZWluZW4gQmVzaXR6IGdlbGFuZ3RlbiBVbnRlcmxhZ2VuLCBlcnN0ZWxsdGUgVmVyYXJiZWl0dW5ncy0gdW5kIE51dHp1bmdzZXJnZWJuaXNzZSBzb3dpZSBEYXRlbmJlc3TDpG5kZSwgZGllIGltIFp1c2FtbWVuaGFuZyBtaXQgZGVtIEF1ZnRyYWdzdmVyaMOkbHRuaXMgc3RlaGVuLCBkZW0gQXVmdHJhZ2dlYmVyIGF1c3p1aMOkbmRpZ2VuIG9kZXIgbmFjaCB2b3JoZXJpZ2VyIFp1c3RpbW11bmcgZGF0ZW5zY2h1dHpnZXJlY2h0IHp1IHZlcm5pY2h0ZW4uIEdsZWljaGVzIGdpbHQgZsO8ciBUZXN0LSB1bmQgQXVzc2NodXNzbWF0ZXJpYWwuIERhcyBQcm90b2tvbGwgZGVyIEzDtnNjaHVuZyBpc3QgYXVmIEFuZm9yZGVydW5nIHZvcnp1bGVnZW4uPC9wPjxwIGFsaWduPVwianVzdGlmeVwiPigzKSBEb2t1bWVudGF0aW9uZW4sIGRpZSBkZW0gTmFjaHdlaXMgZGVyIGF1ZnRyYWdzLSB1bmQgb3JkbnVuZ3NnZW3DpMOfZW4gRGF0ZW52ZXJhcmJlaXR1bmcgZGllbmVuLCBzaW5kIGR1cmNoIGRlbiBBdWZ0cmFnbmVobWVyIGVudHNwcmVjaGVuZCBkZXIgamV3ZWlsaWdlbiBBdWZiZXdhaHJ1bmdzZnJpc3RlbiDDvGJlciBkYXMgVmVydHJhZ3NlbmRlIGhpbmF1cyBhdWZ6dWJld2FocmVuLiBFciBrYW5uIHNpZSB6dSBzZWluZXIgRW50bGFzdHVuZyBiZWkgVmVydHJhZ3NlbmRlIGRlbSBBdWZ0cmFnZ2ViZXIgw7xiZXJnZWJlbi48L3A+PGgyIGlkPVwiVmVydHJhZ3p1ckF1ZnRyYWdzdmVyYXJiZWl0dW5nLTExLlNjaGx1c3NiZXN0aW1tdW5nZW5cIj4xMS4gU2NobHVzc2Jlc3RpbW11bmdlbjwvaDI+PHAgYWxpZ249XCJqdXN0aWZ5XCI+KDEpIDxzcGFuPkRpZXNlciBWZXJ0cmFnIHVudGVybGllZ3QgZGVtIFJlY2h0IGRlciBCdW5kZXNyZXB1YmxpayBEZXV0c2NobGFuZC4gR2VyaWNodHNzdGFuZCBpc3QgSGFubm92ZXIuPC9zcGFuPjwvcD48cCBhbGlnbj1cImp1c3RpZnlcIj48c3Bhbj4oMikgw4RuZGVydW5nZW4gdW5kIEVyZ8Okbnp1bmdlbiBkaWVzZXMgVmVydHJhZ3MgYmVkw7xyZmVuIGRlciBTY2hyaWZ0Zm9ybS4gRGllcyBnaWx0IGF1Y2ggZsO8ciBkZW4gVmVyemljaHQgYXVmIGRhcyBTY2hyaWZ0Zm9ybWVyZm9yZGVybmlzLjwvc3Bhbj48L3A+PHAgYWxpZ249XCJqdXN0aWZ5XCIgY2xhc3M9XCJ3ZXN0ZXJuXCI+KDMpIDxzcGFuPlNvbGx0ZW4gZWluemVsbmUgQmVzdGltbXVuZ2VuIGRpZXNlcyBWZXJ0cmFncyB1bndpcmtzYW0gc2VpbiBvZGVyIHdlcmRlbiwgc28gd2lyZCBkYWR1cmNoIGRpZSBHw7xsdGlna2VpdCBkZXIgw7xicmlnZW4gQmVzdGltbXVuZ2VuIG5pY2h0IGJlcsO8aHJ0LiBEaWUgVmVydHJhZ3NwYXJ0ZWllbiB2ZXJwZmxpY2h0ZW4gc2ljaCBpbiBkaWVzZW4gRsOkbGxlbiwgYW5zdGVsbGUgZGVyIGV0d2EgdW53aXJrc2FtZW4gQmVzdGltbXVuZyhlbikg4oCTIG1pdCBXaXJrdW5nIHZvbiBCZWdpbm4gZGVyIFVud2lya3NhbWtlaXQgYW4g4oCTIGVpbmUgRXJzYXR6cmVnZWx1bmcgb2RlciBnZ2YuIGVpbmVuIG5ldWVuIHdpcmtzYW1lbiBWZXJ0cmFnIHp1IHZlcmVpbmJhcmVuLCBkaWUgYnp3LiBkZXIgZGVtIHdpcnRzY2hhZnRsaWNoZW4gZ2V3b2xsdGVuIFp3ZWNrIGRlciB1bndpcmtzYW1lbiBCZXN0aW1tdW5nKGVuKSB3ZWl0Z2VoZW5kIGVudHNwcmljaHQgb2RlciBhbSBuw6RjaHN0ZW4ga29tbXQuIERpZXMgZ2lsdCBhdWNoIGbDvHIgZGVuIEZhbGwsIGRhc3MgZGVyIFZlcnRyYWcgZWluZSBSZWdlbHVuZ3Nsw7xja2UgZW50aGFsdGVuIHNvbGx0ZS48L3NwYW4+PC9wPjxwIGFsaWduPVwianVzdGlmeVwiPiZuYnNwOzwvcD4nLFxuXHRcdGFwcGVuZGl4OlxuXHRcdFx0JzxkaXYgY2xhc3M9XCJwYWdlYnJlYWtcIiBzdHlsZT1cImJyZWFrLWJlZm9yZTphbHdheXM7XCI+PHA+PC9wPjxoMiBpZD1cIlZlcnRyYWd6dXJBdWZ0cmFnc3ZlcmFyYmVpdHVuZy1BbmxhZ2UxKFRlY2huaXNjaGV1bmRvcmdhbmlzYXRvcmlzY2hlTWHDn25haG1lbilcIj5BbmxhZ2UgMSAoVGVjaG5pc2NoZSB1bmQgb3JnYW5pc2F0b3Jpc2NoZSBNYcOfbmFobWVuKTwvaDI+PHA+RGllIFN5c3RlbWFkbWluaXN0cmF0b3JlbiB3ZXJkZW4gaW0gRm9sZ2VuZGVuIFwiRGV2T3BzXCIgZ2VuYW5udC4gRm9sZ2VuZGUgTWHDn25haG1lbiB3dXJkZW4gZ2V0cm9mZmVuOjwvcD48b2w+PGxpPlp1dHJpdHRza29udHJvbGxlOiBBbGxlIFN5c3RlbWUgc2luZCBpbiBJU08gMjcwMDEgemVydGlmaXppZXJ0ZW4gUmVjaGVuemVudHJlbiBpbiBEZXV0c2NobGFuZCBnZWhvc3RldC4gTnVyIERldk9wcyBoYWJlbiBadXRyaXR0IHp1IGRlbiBwaHlzaXNjaGVuIFN5c3RlbWVuLjwvbGk+PGxpPlp1Z2FuZ3Nrb250cm9sbGUvQmVudXR6ZXJrb250cm9sbGU6IERlciBadWdyaWZmIGR1cmNoIEJlbnV0emVyIGlzdCBtaXQgc3RhcmtlbiBQYXNzd8O2cnRlcm4gZW50c3ByZWNoZW5kIGRlbiBpbnRlcm5lbiBQYXNzd29ydHJlZ2VsbiBvZGVyIFB1YmxpYy1LZXktWnVncmlmZiB1bmQgWndlaS1GYWt0b3ItQXV0aGVudGlmaXppZXJ1bmcgKGUuZy4gWXViaUtleSkgZ2VzaWNoZXJ0LiZuYnNwO0JlbnV0emVyenVncmlmZiB3aXJkIHZvbiBEZXZPcHMgdmVyd2FsdGV0LjwvbGk+PGxpPlp1Z3JpZmZza29udHJvbGxlL1NwZWljaGVya29udHJvbGxlOiBEYXRlbnPDpHR6ZSBzaW5kIG1pdCByb2xsZW5iYXNpZXJ0ZW4gQmVyZWNodGlndW5nZW4gZ2VzY2jDvHR6dC4gQmVyZWNodGlndW5nZW4gd2VyZGVuIHZvbiBEZXZPcHMgdmVyd2FsdGV0LjwvbGk+PGxpPkRhdGVudHLDpGdlcmtvbnRyb2xsZTogPHNwYW4+QWxsZSBGZXN0cGxhdHRlbiBtaXQgcGVyc29uZW5iZXpvZ2VuZW4gRGF0ZW4gc2luZCB2ZXJzY2jDvHNzZWx0LiBEYXRlaWJlcmVjaHRpZ3VuZ2VuIHNpbmQgZsO8ciBEZXZPcHMgc293aWUgQW53ZW5kdW5nZW4gc28gdmVyZ2ViZW4sIGRhc3MgdW5iZXJlY2h0aWd0ZXIgWnVncmlmZiBhdWYgRGF0ZWllbiB2b24gZWluZ2Vsb2dndGVuIEJlbnV0emVybiB1bmQgUHJvemVzc2VuIHZlcmhpbmRlcnQgd2lyZC48L3NwYW4+PC9saT48bGk+w5xiZXJ0cmFndW5nc2tvbnRyb2xsZS9XZWl0ZXJnYWJla29udHJvbGxlOiBXZWl0ZXJnYWJlIHZvbiBwZXJzb25lbmJlem9nZW5lbiBEYXRlbiBhbiBhbmRlcmUgRW1wZsOkbmdlciB3aXJkIHByb3Rva29sbGllcnQuJm5ic3A7RGllIFByb3Rva29sbGUgZW50aGFsdGVuIGRlbiBCZW51dHplci9Qcm96ZXNzLCBkZXIgZGllIEVpbmdhYmUgaW5pdGlpZXJ0IGhhdCwgZGllIEthdGVnb3JpZSBwZXJzb25lbmJlem9nZW5lciBEYXRlbiB1bmQgZGVuIFplaXRzdGVtcGVsLiBEaWUgUHJvdG9rb2xsZSB3ZXJkZW4gZsO8ciBzZWNocyBNb25hdGUgYXVmZ2Vob2Jlbi48L2xpPjxsaT5FaW5nYWJla29udHJvbGxlOiBFaW5nYWJlIHZvbiBuZXVlbiB1bmQgYWt0dWFsaXNpZXJ0ZW4gc293aWUgZGllIEzDtnNjaHVuZyB2b24gcGVyc29uZW5iZXpvZ2VuZW4gRGF0ZW4gd2lyZCBwcm90b2tvbGxpZXJ0LiA8c3Bhbj5EaWUgUHJvdG9rb2xsZSBlbnRoYWx0ZW4gZGVuIEJlbnV0emVyL1Byb3plc3MsIGRlciBkaWUgRWluZ2FiZSBpbml0aWllcnQgaGF0LCBkaWUgS2F0ZWdvcmllIHBlcnNvbmVuYmV6b2dlbmVyIERhdGVuIHVuZCBkZW4gWmVpdHN0ZW1wZWwuIERpZSBQcm90b2tvbGxlIHdlcmRlbiBmw7xyIHNlY2hzIE1vbmF0ZSBhdWZnZWhvYmVuLjwvc3Bhbj48L2xpPjxsaT5UcmFuc3BvcnRrb250cm9sbGU6IMOcYmVydHJhZ3VuZyB2b24gcGVyc29uZW5iZXpvZ2VuZW4gRGF0ZW4gdm9uIHVuZCB6dSBkZW4gU3lzdGVtZW4gaXN0IGR1cmNoIHN0YXJrZSBTU0wtVmVyc2NobMO8c3NlbHVuZyB1bmQvb2RlciBFbmRlLXp1LUVuZGUtVmVyc2NobMO8c3NlbHVuZyBnZXNpY2hlcnQuPC9saT48bGk+VmVydHJhdWxpY2hrZWl0OiBQZXJzb25lbmJlem9nZW5lIERhdGVuIHdlcmRlbiBzb3dlaXQgbcO2Z2xpY2ggRW5kZS16dS1FbmRlIHZlcnNjaGzDvHNzZWx0ZSBnZXNwZWljaGVydC48L2xpPjxsaT5XaWVkZXJoZXJzdGVsbGJhcmtlaXQ6IEFsbGUgU3lzdGVtZSBoYWJlbiBlaW5lIHp3ZWl0ZSBOZXR6d2Vya3NjaG5pdHRzdGVsbGUsIGRpZSBudXIgZGVuIFp1Z3JpZmYgdm9uIERldk9wcyBlcmxhdWJ0LiBEaWVzZSBTY2huaXR0c3RlbGxlIGVybGF1YnQgZGVuIFp1Z3JpZmYgc2VsYnN0IHdlbm4gZGllIEhhdXB0c2Nobml0dHN0ZWxsZSBibG9ja2llcnQgaXN0LiBLb21wb25lbnRlbiBkZXMgU3lzdGVtcyBrw7ZubmVuIGltIEZlaGxlcmZhbGwgbmV1IGdlc3RhcnRldCB3ZXJkZW4uIEVpbiBEaWVuc3QgenVtIFNjaHV0eiB2b3IgRERPUy1BbmdyaWZmZW4gd2lyZCBhdXRvbWF0aXNjaCBnZXN0YXJ0ZXQsIHdlbm4gc29sY2ggZWluIEFuZ3JpZmYgZXJrYW5udCB3aXJkLjwvbGk+PGxpPlp1dmVybMOkc3NpZ2tlaXQ6Jm5ic3A7Jm5ic3A7RGV2T3BzIMO8YmVyd2FjaGVuIGFsbGUgU3lzdGVtZSB1bmQgd2VyZGVuIGF1dG9tYXRpc2NoIGJlbmFjaHJpY2h0aWd0LCB3ZW5uIGVpbmUgS29tcG9uZW50ZSBkZXMgU3lzdGVtcyBhdXNmw6RsbHQsIHVtIGRpZXNlIHNvZm9ydCB3aWVkZXIgYWt0aXZpZXJlbiB6dSBrw7ZubmVuLjwvbGk+PGxpPkRhdGVuaW50ZWdyaXTDpHQ6IEF1dG9tYXRpc2NoZSBGZWhsZXJrb3JyZWt0dXIgYXVmIERhdGVudHLDpGdlcm4gdW5kIGF1ZiBEYXRlbmJhbmtlYmVuZSBzdGVsbHQgc2ljaGVyLCBkYXNzIGRpZSBEYXRlbmludGVncml0w6R0IGdld2FocnQgYmxlaWJ0LiBadXPDpHR6bGljaCB3aXJkIGRpZSBJbnRlZ3JpdMOkdCBkZXIgRW5kZS16dS1FbmRlIHZlcnNjaGzDvHNzZWx0ZW4gcGVyc29uZW5iZXpvZ2VuZW4gRGF0ZW4gZHVyY2ggTUFDcyBiZWkgZGVyIFZlci0gdW5kIEVudHNjaGzDvHNzZWx1bmcgc2ljaGVyZ2VzdGVsbHQuPC9saT48bGk+QXVmdHJhZ3Nrb250cm9sbGU6IEFsbGUgTWl0YXJiZWl0ZXIga2VubmVuIGRpZSBad2Vja2UgZGVyIFZlcmFyYmVpdHVuZyB1bmQgYWJzb2x2aWVyZW4gcmVnZWxtw6TDn2lnIGVpbiBpbnRlcm5lcyBTaWNoZXJoZWl0c3RyYWluaW5nLiBVbnRlcmF1ZnRyYWduZWhtZXIgd2VyZGVuIG51ciBzY2hyaWZ0bGljaCBiZWF1ZnRyYWd0LjwvbGk+PGxpPlZlcmbDvGdiYXJrZWl0c2tvbnRyb2xsZTogPHNwYW4+QWxsZSBTeXN0ZW1lIHNpbmQgaW4gSVNPIDI3MDAxIHplcnRpZml6aWVydGVuIFJlY2hlbnplbnRyZW4gaW4gRGV1dHNjaGxhbmQgZ2Vob3N0ZXQsIGRpZSBkaWUgcGh5c2lzY2hlIFZlcmbDvGdiYXJrZWl0IHVuZCBWZXJiaW5kdW5nIGRlciBTeXN0ZW1lIHNpY2hlcnN0ZWxsZW48L3NwYW4+LiBBbGxlIGxhbmdmcmlzdGlnIGdlc3BlaWNoZXJ0ZW4gRGF0ZW4gd2VyZGVuIGRyZWlmYWNoIHJlcGxpemllcnQgYXVmIHVudGVyc2NoaWVkbGljaGVuIFNlcnZlcm4gb2RlciBpbiBlaW5lbSBSQUlELVN5c3RlbSBhYmdlbGVndC4gVm9yIGRlciBBa3R1YWxpc2llcnVuZyBrcml0aXNjaGVyIFRlaWxlIGRlcyBTeXN0ZW1zIHdlcmRlbiBCYWNrdXBzIGFuZ2VsZWd0LjwvbGk+PGxpPlRyZW5uYmFya2VpdDogR2V0cmVubnRlIFZlcmFyYmVpdHVuZyB2b24gcGVyc29uZW5iZXpvZ2VuZW4gRGF0ZW4gaXN0IGJlZGFyZnNhYmjDpG5naWcgZWluZ2VyaWNodGV0LjwvbGk+PGxpPkJlbGFzdGJhcmtlaXQ6IEFsbGUgU3lzdGVtZSBiZXN0ZWhlbiBhdXMgaG9jaHNrYWxpZXJiYXJlbiBLb21wb25lbnRlbiwgZGllIGbDvHIgdmllbCBow7ZoZXJlIExhc3RlbiBhbHMgdGF0c8OkY2hsaWNoIGJlbsO2dGlndCBhdXNnZWxlZ3Qgc2luZC4gQWxsZSBTeXN0ZW1lIHNpbmQga3VyemZyaXN0aWcgZXJ3ZWl0ZXJiYXIsIHVtIGtvbnRpbnVpZXJsaWNoIHN0ZWlnZW5kZSBMYXN0ZW4gdmVyYXJiZWl0ZW4genUga8O2bm5lbi48L2xpPjwvb2w+PC9kaXY+XFxuJyArXG5cdFx0XHRcIjwvZGl2PlwiLFxuXHR9LFxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hvd0ZvclNpZ25pbmcoY3VzdG9tZXI6IEN1c3RvbWVyLCBhY2NvdW50aW5nSW5mbzogQWNjb3VudGluZ0luZm8pIHtcblx0Y29uc3Qgc2lnbkFjdGlvbiA9IChkaWFsb2c6IERpYWxvZykgPT4ge1xuXHRcdGxldCBkYXRhID0gY3JlYXRlU2lnbk9yZGVyUHJvY2Vzc2luZ0FncmVlbWVudERhdGEoe1xuXHRcdFx0dmVyc2lvbjogdmVyc2lvbixcblx0XHRcdGN1c3RvbWVyQWRkcmVzczogYWRkcmVzc0VkaXRvci5nZXRWYWx1ZSgpLFxuXHRcdH0pXG5cblx0XHRpZiAoYWRkcmVzc0VkaXRvci5nZXRWYWx1ZSgpLnRyaW0oKS5zcGxpdChcIlxcblwiKS5sZW5ndGggPCAzKSB7XG5cdFx0XHREaWFsb2cubWVzc2FnZShcImNvbnRyYWN0b3JJbmZvX21zZ1wiKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRsb2NhdG9yLnNlcnZpY2VFeGVjdXRvci5wb3N0KFNpZ25PcmRlclByb2Nlc3NpbmdBZ3JlZW1lbnRTZXJ2aWNlLCBkYXRhKS50aGVuKCgpID0+IGRpYWxvZy5jbG9zZSgpKVxuXHRcdH1cblx0fVxuXG5cdGNvbnN0IHZlcnNpb24gPSBcIjFfXCIgKyAobGFuZy5jb2RlID09PSBcImRlXCIgPyBcImRlXCIgOiBcImVuXCIpXG5cdGNvbnN0IGFkZHJlc3NFZGl0b3IgPSBuZXcgSHRtbEVkaXRvcigpXG5cdFx0LnNldE1pbkhlaWdodCgxMjApXG5cdFx0LnNob3dCb3JkZXJzKClcblx0XHQuc2V0UGxhY2Vob2xkZXJJZChcImNvbnRyYWN0b3JfbGFiZWxcIilcblx0XHQuc2V0TW9kZShIdG1sRWRpdG9yTW9kZS5IVE1MKVxuXHRcdC5zZXRIdG1sTW9ub3NwYWNlKGZhbHNlKVxuXHRcdC5zZXRWYWx1ZShmb3JtYXROYW1lQW5kQWRkcmVzcyhhY2NvdW50aW5nSW5mby5pbnZvaWNlTmFtZSwgYWNjb3VudGluZ0luZm8uaW52b2ljZUFkZHJlc3MpKVxuXHREaWFsb2cuc2hvd0FjdGlvbkRpYWxvZyh7XG5cdFx0dGl0bGU6IFwib3JkZXJQcm9jZXNzaW5nQWdyZWVtZW50X2xhYmVsXCIsXG5cdFx0b2tBY3Rpb246IHNpZ25BY3Rpb24sXG5cdFx0b2tBY3Rpb25UZXh0SWQ6IFwic2lnbl9hY3Rpb25cIixcblx0XHR0eXBlOiBEaWFsb2dUeXBlLkVkaXRMYXJnZSxcblx0XHRjaGlsZDogKCkgPT4ge1xuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0Y29uc3QgdGV4dCA9IGFncmVlbWVudFRleHRzW3ZlcnNpb25dXG5cdFx0XHRyZXR1cm4gbShcIi5wdFwiLCBbXG5cdFx0XHRcdG0udHJ1c3QodGV4dC5oZWFkaW5nKSxcblx0XHRcdFx0bShcIi5mbGV4LWNlbnRlclwiLCBtKFwiLmRpYWxvZy13aWR0aC1zXCIsIFttKGFkZHJlc3NFZGl0b3IpLCBtKFwiLnNtYWxsXCIsIGxhbmcuZ2V0KFwiY29udHJhY3RvckluZm9fbXNnXCIpKV0pKSxcblx0XHRcdFx0bS50cnVzdCh0ZXh0LmNvbnRlbnQpLFxuXHRcdFx0XHRtLnRydXN0KHRleHQuYXBwZW5kaXgpLFxuXHRcdFx0XSlcblx0XHR9LFxuXHR9KVxufVxuXG4vLyB0aGlzIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIHNvbWUgc3R5bGUgY29tYmluYXRpb25zXG4vLyBjYXVzZSBzZXZlcmFsIGJyb3dzZXJzIG5vdCB0byBwcmludFxuLy8gdGhlIGNvbnRlbnQgYmVsb3cgdGhlIGZvbGRcbmZ1bmN0aW9uIHByaW50RWxlbWVudENvbnRlbnQoZWxlbTogSFRNTEVsZW1lbnQgfCBudWxsKSB7XG5cdGNvbnN0IHJvb3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJvb3RcIilcblx0Y29uc3QgYm9keSA9IGRvY3VtZW50LmJvZHlcblx0aWYgKCFlbGVtIHx8ICFyb290IHx8ICFib2R5KSByZXR1cm5cblx0bGV0IHByaW50RGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoUFJJTlRfRElWX0lEKVxuXG5cdGlmICghcHJpbnREaXYpIHtcblx0XHRwcmludERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJESVZcIilcblx0XHRwcmludERpdi5pZCA9IFBSSU5UX0RJVl9JRFxuXHRcdGJvZHkuYXBwZW5kQ2hpbGQocHJpbnREaXYpXG5cdFx0Y29uc3QgY2xhc3NlcyA9IHJvb3QuY2xhc3NOYW1lLnNwbGl0KFwiIFwiKVxuXHRcdGNsYXNzZXMucHVzaChcIm5vcHJpbnRcIilcblx0XHRyb290LmNsYXNzTmFtZSA9IGNsYXNzZXMuam9pbihcIiBcIilcblx0fVxuXG5cdHByaW50RGl2LmlubmVySFRNTCA9IGVsZW0uaW5uZXJIVE1MXG5cdHByaW50RGl2LmNsYXNzTGlzdC5hZGQoXCJub3NjcmVlblwiKVxuXHR3aW5kb3cucHJpbnQoKVxufVxuXG5mdW5jdGlvbiBjbGVhbnVwUHJpbnRFbGVtZW50KCkge1xuXHRjb25zdCByb290ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyb290XCIpXG5cdGNvbnN0IGJvZHkgPSBkb2N1bWVudC5ib2R5XG5cdGNvbnN0IHByaW50RGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoUFJJTlRfRElWX0lEKVxuXHRpZiAoIXByaW50RGl2IHx8ICFyb290IHx8ICFib2R5KSByZXR1cm5cblx0Ym9keS5yZW1vdmVDaGlsZChwcmludERpdilcblx0cm9vdC5jbGFzc05hbWUgPSByb290LmNsYXNzTmFtZVxuXHRcdC5zcGxpdChcIiBcIilcblx0XHQuZmlsdGVyKChjKSA9PiBjICE9PSBcIm5vcHJpbnRcIilcblx0XHQuam9pbihcIiBcIilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3dGb3JWaWV3aW5nKGFncmVlbWVudDogT3JkZXJQcm9jZXNzaW5nQWdyZWVtZW50LCBzaWduZXJVc2VyR3JvdXBJbmZvOiBHcm91cEluZm8pIHtcblx0RGlhbG9nLnNob3dBY3Rpb25EaWFsb2coe1xuXHRcdHRpdGxlOiBcIm9yZGVyUHJvY2Vzc2luZ0FncmVlbWVudF9sYWJlbFwiLFxuXHRcdG9rQWN0aW9uOiAhaXNBcHAoKSAmJiBcImZ1bmN0aW9uXCIgPT09IHR5cGVvZiB3aW5kb3cucHJpbnQgPyAoKSA9PiBwcmludEVsZW1lbnRDb250ZW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWdyZWVtZW50LWNvbnRlbnRcIikpIDogbnVsbCxcblx0XHRva0FjdGlvblRleHRJZDogXCJwcmludF9hY3Rpb25cIixcblx0XHRjYW5jZWxBY3Rpb25UZXh0SWQ6IFwiY2xvc2VfYWx0XCIsXG5cdFx0dHlwZTogRGlhbG9nVHlwZS5FZGl0TGFyZ2UsXG5cdFx0Y2hpbGQ6ICgpID0+IHtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdGNvbnN0IHRleHQgPSBhZ3JlZW1lbnRUZXh0c1thZ3JlZW1lbnQudmVyc2lvbl1cblx0XHRcdHJldHVybiBtKFxuXHRcdFx0XHRcIiNhZ3JlZW1lbnQtY29udGVudC5wdFwiLFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0b25yZW1vdmU6IGNsZWFudXBQcmludEVsZW1lbnQsXG5cdFx0XHRcdH0sXG5cdFx0XHRcdFtcblx0XHRcdFx0XHRtLnRydXN0KHRleHQuaGVhZGluZyksXG5cdFx0XHRcdFx0bShcInAudGV4dC1jZW50ZXIudGV4dC1wcmV3cmFwXCIsIGFncmVlbWVudC5jdXN0b21lckFkZHJlc3MpLFxuXHRcdFx0XHRcdG0udHJ1c3QodGV4dC5jb250ZW50KSxcblx0XHRcdFx0XHRtKFxuXHRcdFx0XHRcdFx0XCJpXCIsXG5cdFx0XHRcdFx0XHRsYW5nLmdldChcInNpZ25lZE9uX21zZ1wiLCB7XG5cdFx0XHRcdFx0XHRcdFwie2RhdGV9XCI6IGZvcm1hdERhdGUoYWdyZWVtZW50LnNpZ25hdHVyZURhdGUpLFxuXHRcdFx0XHRcdFx0fSkgK1xuXHRcdFx0XHRcdFx0XHRcIiBcIiArXG5cdFx0XHRcdFx0XHRcdGxhbmcuZ2V0KFwiYnlfbGFiZWxcIikgK1xuXHRcdFx0XHRcdFx0XHRcIiBcIiArXG5cdFx0XHRcdFx0XHRcdGdldE1haWxBZGRyZXNzRGlzcGxheVRleHQoc2lnbmVyVXNlckdyb3VwSW5mby5uYW1lLCBuZXZlck51bGwoc2lnbmVyVXNlckdyb3VwSW5mby5tYWlsQWRkcmVzcyksIGZhbHNlKSxcblx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdG0oXCJoclwiKSxcblx0XHRcdFx0XHRtLnRydXN0KHRleHQuYXBwZW5kaXgpLFxuXHRcdFx0XHRdLFxuXHRcdFx0KVxuXHRcdH0sXG5cdH0pXG59XG4iLCJpbXBvcnQgdHlwZSB7IEluZm9MaW5rLCBUcmFuc2xhdGlvbktleSwgTWF5YmVUcmFuc2xhdGlvbiB9IGZyb20gXCIuLi9taXNjL0xhbmd1YWdlVmlld01vZGVsLmpzXCJcbmltcG9ydCB7IGxhbmcgfSBmcm9tIFwiLi4vbWlzYy9MYW5ndWFnZVZpZXdNb2RlbC5qc1wiXG5pbXBvcnQgbSwgeyBDaGlsZHJlbiwgQ29tcG9uZW50LCBWbm9kZSB9IGZyb20gXCJtaXRocmlsXCJcbmltcG9ydCB7IEV4cGFuZGVyQnV0dG9uLCBFeHBhbmRlclBhbmVsIH0gZnJvbSBcIi4uL2d1aS9iYXNlL0V4cGFuZGVyLmpzXCJcbmltcG9ydCB7IGlmQWxsb3dlZFR1dGFMaW5rcyB9IGZyb20gXCIuLi9ndWkvYmFzZS9HdWlVdGlscy5qc1wiXG5pbXBvcnQgdHlwZSB7IGxhenksIFRodW5rIH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5pbXBvcnQgU3RyZWFtIGZyb20gXCJtaXRocmlsL3N0cmVhbVwiXG5pbXBvcnQgeyBsb2NhdG9yIH0gZnJvbSBcIi4uL2FwaS9tYWluL0NvbW1vbkxvY2F0b3IuanNcIlxuXG5leHBvcnQgdHlwZSBTZXR0aW5nc0V4cGFuZGVyQXR0cnMgPSB7XG5cdHRpdGxlOiBNYXliZVRyYW5zbGF0aW9uXG5cdGJ1dHRvblRleHQ/OiBNYXliZVRyYW5zbGF0aW9uXG5cdGluZm9Nc2c/OiBNYXliZVRyYW5zbGF0aW9uXG5cdGluZm9MaW5rSWQ/OiBJbmZvTGluayB8IHVuZGVmaW5lZFxuXHRvbkV4cGFuZD86IFRodW5rIHwgdW5kZWZpbmVkXG5cdGV4cGFuZGVkOiBTdHJlYW08Ym9vbGVhbj5cbn1cblxuZXhwb3J0IGNsYXNzIFNldHRpbmdzRXhwYW5kZXIgaW1wbGVtZW50cyBDb21wb25lbnQ8U2V0dGluZ3NFeHBhbmRlckF0dHJzPiB7XG5cdG9uY3JlYXRlKHZub2RlOiBWbm9kZTxTZXR0aW5nc0V4cGFuZGVyQXR0cnM+KSB7XG5cdFx0dm5vZGUuYXR0cnMuZXhwYW5kZWQubWFwKChleHBhbmRlZCkgPT4ge1xuXHRcdFx0aWYgKGV4cGFuZGVkICYmIHZub2RlLmF0dHJzLm9uRXhwYW5kKSB7XG5cdFx0XHRcdHZub2RlLmF0dHJzLm9uRXhwYW5kKClcblx0XHRcdH1cblx0XHR9KVxuXHR9XG5cblx0dmlldyh2bm9kZTogVm5vZGU8U2V0dGluZ3NFeHBhbmRlckF0dHJzPik6IENoaWxkcmVuIHtcblx0XHRjb25zdCB7IHRpdGxlLCBidXR0b25UZXh0LCBpbmZvTGlua0lkLCBpbmZvTXNnLCBleHBhbmRlZCB9ID0gdm5vZGUuYXR0cnNcblx0XHRyZXR1cm4gW1xuXHRcdFx0bShcIi5mbGV4LXNwYWNlLWJldHdlZW4uaXRlbXMtY2VudGVyLm1iLXMubXQtbFwiLCBbXG5cdFx0XHRcdG0oXCIuaDRcIiwgbGFuZy5nZXRUcmFuc2xhdGlvblRleHQodGl0bGUpKSxcblx0XHRcdFx0bShFeHBhbmRlckJ1dHRvbiwge1xuXHRcdFx0XHRcdGxhYmVsOiBidXR0b25UZXh0IHx8IFwic2hvd19hY3Rpb25cIixcblx0XHRcdFx0XHRleHBhbmRlZDogZXhwYW5kZWQoKSxcblx0XHRcdFx0XHRvbkV4cGFuZGVkQ2hhbmdlOiBleHBhbmRlZCxcblx0XHRcdFx0fSksXG5cdFx0XHRdKSxcblx0XHRcdG0oXG5cdFx0XHRcdEV4cGFuZGVyUGFuZWwsXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRleHBhbmRlZDogZXhwYW5kZWQoKSxcblx0XHRcdFx0fSxcblx0XHRcdFx0dm5vZGUuY2hpbGRyZW4sXG5cdFx0XHQpLFxuXHRcdFx0aW5mb01zZyA/IG0oXCJzbWFsbFwiLCBsYW5nLmdldFRyYW5zbGF0aW9uVGV4dChpbmZvTXNnKSkgOiBudWxsLFxuXHRcdFx0aW5mb0xpbmtJZCA/IGlmQWxsb3dlZFR1dGFMaW5rcyhsb2NhdG9yLmxvZ2lucywgaW5mb0xpbmtJZCwgKGxpbmspID0+IG0oXCJzbWFsbC50ZXh0LWJyZWFrXCIsIFttKGBhW2hyZWY9JHtsaW5rfV1bdGFyZ2V0PV9ibGFua11gLCBsaW5rKV0pKSA6IG51bGwsXG5cdFx0XVxuXHR9XG59XG4iLCJpbXBvcnQgbSwgeyBDaGlsZHJlbiB9IGZyb20gXCJtaXRocmlsXCJcbmltcG9ydCB7IGFzc2VydE1haW5Pck5vZGUsIGlzSU9TQXBwIH0gZnJvbSBcIi4uL2FwaS9jb21tb24vRW52XCJcbmltcG9ydCB7XG5cdEFjY291bnRUeXBlLFxuXHRBY2NvdW50VHlwZU5hbWVzLFxuXHRBcHByb3ZhbFN0YXR1cyxcblx0QXZhaWxhYmxlUGxhbnMsXG5cdEJvb2tpbmdJdGVtRmVhdHVyZVR5cGUsXG5cdENvbnN0LFxuXHRnZXRQYXltZW50TWV0aG9kVHlwZSxcblx0TGVnYWN5UGxhbnMsXG5cdE5ld1BhaWRQbGFucyxcblx0T3BlcmF0aW9uVHlwZSxcblx0UGF5bWVudE1ldGhvZFR5cGUsXG5cdFBsYW5UeXBlLFxufSBmcm9tIFwiLi4vYXBpL2NvbW1vbi9UdXRhbm90YUNvbnN0YW50c1wiXG5pbXBvcnQge1xuXHRBY2NvdW50aW5nSW5mbyxcblx0QWNjb3VudGluZ0luZm9UeXBlUmVmLFxuXHRCb29raW5nLFxuXHRCb29raW5nVHlwZVJlZixcblx0Y3JlYXRlQXBwU3RvcmVTdWJzY3JpcHRpb25HZXRJbixcblx0Q3VzdG9tZXIsXG5cdEN1c3RvbWVySW5mbyxcblx0Q3VzdG9tZXJJbmZvVHlwZVJlZixcblx0Q3VzdG9tZXJUeXBlUmVmLFxuXHRHaWZ0Q2FyZCxcblx0R2lmdENhcmRUeXBlUmVmLFxuXHRHcm91cEluZm9UeXBlUmVmLFxuXHRPcmRlclByb2Nlc3NpbmdBZ3JlZW1lbnQsXG5cdE9yZGVyUHJvY2Vzc2luZ0FncmVlbWVudFR5cGVSZWYsXG5cdFBsYW5Db25maWd1cmF0aW9uLFxuXHRVc2VyVHlwZVJlZixcbn0gZnJvbSBcIi4uL2FwaS9lbnRpdGllcy9zeXMvVHlwZVJlZnMuanNcIlxuaW1wb3J0IHsgYXNzZXJ0Tm90TnVsbCwgYmFzZTY0RXh0VG9CYXNlNjQsIGJhc2U2NFRvVWludDhBcnJheSwgZG93bmNhc3QsIGluY3JlbWVudERhdGUsIG5ldmVyTnVsbCwgcHJvbWlzZU1hcCwgc3RyaW5nVG9CYXNlNjQgfSBmcm9tIFwiQHR1dGFvL3R1dGFub3RhLXV0aWxzXCJcbmltcG9ydCB7IEluZm9MaW5rLCBsYW5nLCBUcmFuc2xhdGlvbktleSB9IGZyb20gXCIuLi9taXNjL0xhbmd1YWdlVmlld01vZGVsXCJcbmltcG9ydCB7IEljb25zIH0gZnJvbSBcIi4uL2d1aS9iYXNlL2ljb25zL0ljb25zXCJcbmltcG9ydCB7IGFzUGF5bWVudEludGVydmFsLCBmb3JtYXRQcmljZSwgZm9ybWF0UHJpY2VEYXRhV2l0aEluZm8sIFBheW1lbnRJbnRlcnZhbCB9IGZyb20gXCIuL1ByaWNlVXRpbHNcIlxuaW1wb3J0IHsgZm9ybWF0RGF0ZSwgZm9ybWF0U3RvcmFnZVNpemUgfSBmcm9tIFwiLi4vbWlzYy9Gb3JtYXR0ZXJcIlxuaW1wb3J0IHsgc2hvd1VwZ3JhZGVXaXphcmQgfSBmcm9tIFwiLi9VcGdyYWRlU3Vic2NyaXB0aW9uV2l6YXJkXCJcbmltcG9ydCB7IHNob3dTd2l0Y2hEaWFsb2cgfSBmcm9tIFwiLi9Td2l0Y2hTdWJzY3JpcHRpb25EaWFsb2dcIlxuaW1wb3J0IHN0cmVhbSBmcm9tIFwibWl0aHJpbC9zdHJlYW1cIlxuaW1wb3J0IFN0cmVhbSBmcm9tIFwibWl0aHJpbC9zdHJlYW1cIlxuaW1wb3J0ICogYXMgU2lnbk9yZGVyQWdyZWVtZW50RGlhbG9nIGZyb20gXCIuL1NpZ25PcmRlclByb2Nlc3NpbmdBZ3JlZW1lbnREaWFsb2dcIlxuaW1wb3J0IHsgTm90Rm91bmRFcnJvciB9IGZyb20gXCIuLi9hcGkvY29tbW9uL2Vycm9yL1Jlc3RFcnJvclwiXG5pbXBvcnQge1xuXHRhcHBTdG9yZVBsYW5OYW1lLFxuXHRnZXRDdXJyZW50Q291bnQsXG5cdGdldFRvdGFsU3RvcmFnZUNhcGFjaXR5UGVyQ3VzdG9tZXIsXG5cdGlzQXV0b1Jlc3BvbmRlckFjdGl2ZSxcblx0aXNFdmVudEludml0ZXNBY3RpdmUsXG5cdGlzU2hhcmluZ0FjdGl2ZSxcblx0aXNXaGl0ZWxhYmVsQWN0aXZlLFxuXHRxdWVyeUFwcFN0b3JlU3Vic2NyaXB0aW9uT3duZXJzaGlwLFxufSBmcm9tIFwiLi9TdWJzY3JpcHRpb25VdGlsc1wiXG5pbXBvcnQgeyBUZXh0RmllbGQgfSBmcm9tIFwiLi4vZ3VpL2Jhc2UvVGV4dEZpZWxkLmpzXCJcbmltcG9ydCB7IERpYWxvZywgRGlhbG9nVHlwZSB9IGZyb20gXCIuLi9ndWkvYmFzZS9EaWFsb2dcIlxuaW1wb3J0IHsgQ29sdW1uV2lkdGgsIFRhYmxlIH0gZnJvbSBcIi4uL2d1aS9iYXNlL1RhYmxlLmpzXCJcbmltcG9ydCB7IHNob3dQdXJjaGFzZUdpZnRDYXJkRGlhbG9nIH0gZnJvbSBcIi4vZ2lmdGNhcmRzL1B1cmNoYXNlR2lmdENhcmREaWFsb2dcIlxuaW1wb3J0IHsgR2lmdENhcmRTdGF0dXMsIGxvYWRHaWZ0Q2FyZHMsIHNob3dHaWZ0Q2FyZFRvU2hhcmUgfSBmcm9tIFwiLi9naWZ0Y2FyZHMvR2lmdENhcmRVdGlsc1wiXG5pbXBvcnQgeyBsb2NhdG9yIH0gZnJvbSBcIi4uL2FwaS9tYWluL0NvbW1vbkxvY2F0b3JcIlxuaW1wb3J0IHsgR2lmdENhcmRNZXNzYWdlRWRpdG9yRmllbGQgfSBmcm9tIFwiLi9naWZ0Y2FyZHMvR2lmdENhcmRNZXNzYWdlRWRpdG9yRmllbGRcIlxuaW1wb3J0IHsgYXR0YWNoRHJvcGRvd24gfSBmcm9tIFwiLi4vZ3VpL2Jhc2UvRHJvcGRvd24uanNcIlxuaW1wb3J0IHsgY3JlYXRlTm90QXZhaWxhYmxlRm9yRnJlZUNsaWNrSGFuZGxlciB9IGZyb20gXCIuLi9taXNjL1N1YnNjcmlwdGlvbkRpYWxvZ3NcIlxuaW1wb3J0IHsgU2V0dGluZ3NFeHBhbmRlciB9IGZyb20gXCIuLi9zZXR0aW5ncy9TZXR0aW5nc0V4cGFuZGVyLmpzXCJcbmltcG9ydCB7IGVsZW1lbnRJZFBhcnQsIEdFTkVSQVRFRF9NQVhfSUQsIGdldEV0SWQgfSBmcm9tIFwiLi4vYXBpL2NvbW1vbi91dGlscy9FbnRpdHlVdGlsc1wiXG5pbXBvcnQge1xuXHRDVVJSRU5UX0dJRlRfQ0FSRF9URVJNU19WRVJTSU9OLFxuXHRDVVJSRU5UX1BSSVZBQ1lfVkVSU0lPTixcblx0Q1VSUkVOVF9URVJNU19WRVJTSU9OLFxuXHRyZW5kZXJUZXJtc0FuZENvbmRpdGlvbnNCdXR0b24sXG5cdFRlcm1zU2VjdGlvbixcbn0gZnJvbSBcIi4vVGVybXNBbmRDb25kaXRpb25zXCJcbmltcG9ydCB7IERyb3BEb3duU2VsZWN0b3IsIFNlbGVjdG9ySXRlbUxpc3QgfSBmcm9tIFwiLi4vZ3VpL2Jhc2UvRHJvcERvd25TZWxlY3Rvci5qc1wiXG5pbXBvcnQgeyBJY29uQnV0dG9uLCBJY29uQnV0dG9uQXR0cnMgfSBmcm9tIFwiLi4vZ3VpL2Jhc2UvSWNvbkJ1dHRvbi5qc1wiXG5pbXBvcnQgeyBCdXR0b25TaXplIH0gZnJvbSBcIi4uL2d1aS9iYXNlL0J1dHRvblNpemUuanNcIlxuaW1wb3J0IHsgZ2V0RGlzcGxheU5hbWVPZlBsYW5UeXBlIH0gZnJvbSBcIi4vRmVhdHVyZUxpc3RQcm92aWRlclwiXG5pbXBvcnQgeyBFbnRpdHlVcGRhdGVEYXRhLCBpc1VwZGF0ZUZvclR5cGVSZWYgfSBmcm9tIFwiLi4vYXBpL2NvbW1vbi91dGlscy9FbnRpdHlVcGRhdGVVdGlscy5qc1wiXG5pbXBvcnQgeyBzaG93UHJvZ3Jlc3NEaWFsb2cgfSBmcm9tIFwiLi4vZ3VpL2RpYWxvZ3MvUHJvZ3Jlc3NEaWFsb2dcIlxuaW1wb3J0IHsgTW9iaWxlUGF5bWVudHNGYWNhZGUgfSBmcm9tIFwiLi4vbmF0aXZlL2NvbW1vbi9nZW5lcmF0ZWRpcGMvTW9iaWxlUGF5bWVudHNGYWNhZGVcIlxuaW1wb3J0IHsgTW9iaWxlUGF5bWVudFN1YnNjcmlwdGlvbk93bmVyc2hpcCB9IGZyb20gXCIuLi9uYXRpdmUvY29tbW9uL2dlbmVyYXRlZGlwYy9Nb2JpbGVQYXltZW50U3Vic2NyaXB0aW9uT3duZXJzaGlwXCJcbmltcG9ydCB7IE1vYmlsZVBheW1lbnRFcnJvciB9IGZyb20gXCIuLi9hcGkvY29tbW9uL2Vycm9yL01vYmlsZVBheW1lbnRFcnJvclwiXG5pbXBvcnQgeyBzaG93TWFuYWdlVGhyb3VnaEFwcFN0b3JlRGlhbG9nIH0gZnJvbSBcIi4vUGF5bWVudFZpZXdlci5qc1wiXG5pbXBvcnQgdHlwZSB7IFVwZGF0YWJsZVNldHRpbmdzVmlld2VyIH0gZnJvbSBcIi4uL3NldHRpbmdzL0ludGVyZmFjZXMuanNcIlxuaW1wb3J0IHsgY2xpZW50IH0gZnJvbSBcIi4uL21pc2MvQ2xpZW50RGV0ZWN0b3IuanNcIlxuaW1wb3J0IHsgQXBwU3RvcmVTdWJzY3JpcHRpb25TZXJ2aWNlIH0gZnJvbSBcIi4uL2FwaS9lbnRpdGllcy9zeXMvU2VydmljZXMuanNcIlxuaW1wb3J0IHsgQXBwVHlwZSB9IGZyb20gXCIuLi9taXNjL0NsaWVudENvbnN0YW50cy5qc1wiXG5pbXBvcnQgeyBQcm9ncmFtbWluZ0Vycm9yIH0gZnJvbSBcIi4uL2FwaS9jb21tb24vZXJyb3IvUHJvZ3JhbW1pbmdFcnJvci5qc1wiXG5cbmFzc2VydE1haW5Pck5vZGUoKVxuY29uc3QgREFZID0gMTAwMCAqIDYwICogNjAgKiAyNFxuXG4vKlxuICogSWRlbnRpZmllcyBmcm9tIHdoaWNoIGFwcCB0aGUgdXNlciBzdWJzY3JpYmVkIGZyb21cbiAqL1xuZXhwb3J0IGVudW0gU3Vic2NyaXB0aW9uQXBwIHtcblx0TWFpbCA9IFwiMFwiLFxuXHRDYWxlbmRhciA9IFwiMVwiLFxufVxuXG5leHBvcnQgY2xhc3MgU3Vic2NyaXB0aW9uVmlld2VyIGltcGxlbWVudHMgVXBkYXRhYmxlU2V0dGluZ3NWaWV3ZXIge1xuXHRyZWFkb25seSB2aWV3OiBVcGRhdGFibGVTZXR0aW5nc1ZpZXdlcltcInZpZXdcIl1cblx0cHJpdmF0ZSBfc3Vic2NyaXB0aW9uRmllbGRWYWx1ZTogU3RyZWFtPHN0cmluZz5cblx0cHJpdmF0ZSBfb3JkZXJBZ3JlZW1lbnRGaWVsZFZhbHVlOiBTdHJlYW08c3RyaW5nPlxuXHRwcml2YXRlIF9zZWxlY3RlZFN1YnNjcmlwdGlvbkludGVydmFsOiBTdHJlYW08UGF5bWVudEludGVydmFsIHwgbnVsbD5cblx0cHJpdmF0ZSBfY3VycmVudFByaWNlRmllbGRWYWx1ZTogU3RyZWFtPHN0cmluZz5cblx0cHJpdmF0ZSBfbmV4dFByaWNlRmllbGRWYWx1ZTogU3RyZWFtPHN0cmluZz5cblx0cHJpdmF0ZSBfdXNlcnNGaWVsZFZhbHVlOiBTdHJlYW08c3RyaW5nPlxuXHRwcml2YXRlIF9zdG9yYWdlRmllbGRWYWx1ZTogU3RyZWFtPHN0cmluZz5cblx0cHJpdmF0ZSBfZW1haWxBbGlhc0ZpZWxkVmFsdWU6IFN0cmVhbTxzdHJpbmc+XG5cdHByaXZhdGUgX2dyb3Vwc0ZpZWxkVmFsdWU6IFN0cmVhbTxzdHJpbmc+XG5cdHByaXZhdGUgX3doaXRlbGFiZWxGaWVsZFZhbHVlOiBTdHJlYW08c3RyaW5nPlxuXHRwcml2YXRlIF9zaGFyaW5nRmllbGRWYWx1ZTogU3RyZWFtPHN0cmluZz5cblx0cHJpdmF0ZSBfZXZlbnRJbnZpdGVzRmllbGRWYWx1ZTogU3RyZWFtPHN0cmluZz5cblx0cHJpdmF0ZSBfYXV0b1Jlc3BvbmRlckZpZWxkVmFsdWU6IFN0cmVhbTxzdHJpbmc+XG5cdHByaXZhdGUgX3BlcmlvZEVuZERhdGU6IERhdGUgfCBudWxsID0gbnVsbFxuXHRwcml2YXRlIF9uZXh0UGVyaW9kUHJpY2VWaXNpYmxlOiBib29sZWFuIHwgbnVsbCA9IG51bGxcblx0cHJpdmF0ZSBfY3VzdG9tZXI6IEN1c3RvbWVyIHwgbnVsbCA9IG51bGxcblx0cHJpdmF0ZSBfY3VzdG9tZXJJbmZvOiBDdXN0b21lckluZm8gfCBudWxsID0gbnVsbFxuXHRwcml2YXRlIF9hY2NvdW50aW5nSW5mbzogQWNjb3VudGluZ0luZm8gfCBudWxsID0gbnVsbFxuXHRwcml2YXRlIF9sYXN0Qm9va2luZzogQm9va2luZyB8IG51bGwgPSBudWxsXG5cdHByaXZhdGUgX29yZGVyQWdyZWVtZW50OiBPcmRlclByb2Nlc3NpbmdBZ3JlZW1lbnQgfCBudWxsID0gbnVsbFxuXHRwcml2YXRlIGN1cnJlbnRQbGFuVHlwZTogUGxhblR5cGVcblx0cHJpdmF0ZSBfaXNDYW5jZWxsZWQ6IGJvb2xlYW4gfCBudWxsID0gbnVsbFxuXHRwcml2YXRlIF9naWZ0Q2FyZHM6IE1hcDxJZCwgR2lmdENhcmQ+XG5cdHByaXZhdGUgX2dpZnRDYXJkc0V4cGFuZGVkOiBTdHJlYW08Ym9vbGVhbj5cblxuXHRjb25zdHJ1Y3RvcihjdXJyZW50UGxhblR5cGU6IFBsYW5UeXBlLCBwcml2YXRlIHJlYWRvbmx5IG1vYmlsZVBheW1lbnRzRmFjYWRlOiBNb2JpbGVQYXltZW50c0ZhY2FkZSB8IG51bGwpIHtcblx0XHR0aGlzLmN1cnJlbnRQbGFuVHlwZSA9IGN1cnJlbnRQbGFuVHlwZVxuXHRcdGNvbnN0IGlzUHJlbWl1bVByZWRpY2F0ZSA9ICgpID0+IGxvY2F0b3IubG9naW5zLmdldFVzZXJDb250cm9sbGVyKCkuaXNQYWlkQWNjb3VudCgpXG5cblx0XHR0aGlzLl9naWZ0Q2FyZHMgPSBuZXcgTWFwKClcblx0XHRsb2FkR2lmdENhcmRzKGFzc2VydE5vdE51bGwobG9jYXRvci5sb2dpbnMuZ2V0VXNlckNvbnRyb2xsZXIoKS51c2VyLmN1c3RvbWVyKSkudGhlbigoZ2lmdENhcmRzKSA9PiB7XG5cdFx0XHRmb3IgKGNvbnN0IGdpZnRDYXJkIG9mIGdpZnRDYXJkcykge1xuXHRcdFx0XHR0aGlzLl9naWZ0Q2FyZHMuc2V0KGVsZW1lbnRJZFBhcnQoZ2lmdENhcmQuX2lkKSwgZ2lmdENhcmQpXG5cdFx0XHR9XG5cdFx0fSlcblx0XHR0aGlzLl9naWZ0Q2FyZHNFeHBhbmRlZCA9IHN0cmVhbTxib29sZWFuPihmYWxzZSlcblxuXHRcdHRoaXMudmlldyA9ICgpOiBDaGlsZHJlbiA9PiB7XG5cdFx0XHRyZXR1cm4gbShcIiNzdWJzY3JpcHRpb24tc2V0dGluZ3MuZmlsbC1hYnNvbHV0ZS5zY3JvbGwucGxyLWxcIiwgW1xuXHRcdFx0XHRtKFwiLmg0Lm10LWxcIiwgbGFuZy5nZXQoXCJjdXJyZW50bHlCb29rZWRfbGFiZWxcIikpLFxuXHRcdFx0XHRtKFRleHRGaWVsZCwge1xuXHRcdFx0XHRcdGxhYmVsOiBcInN1YnNjcmlwdGlvbl9sYWJlbFwiLFxuXHRcdFx0XHRcdHZhbHVlOiB0aGlzLl9zdWJzY3JpcHRpb25GaWVsZFZhbHVlKCksXG5cdFx0XHRcdFx0b25pbnB1dDogdGhpcy5fc3Vic2NyaXB0aW9uRmllbGRWYWx1ZSxcblx0XHRcdFx0XHRpc1JlYWRPbmx5OiB0cnVlLFxuXHRcdFx0XHRcdGluamVjdGlvbnNSaWdodDogKCkgPT5cblx0XHRcdFx0XHRcdGxvY2F0b3IubG9naW5zLmdldFVzZXJDb250cm9sbGVyKCkuaXNGcmVlQWNjb3VudCgpXG5cdFx0XHRcdFx0XHRcdD8gbShJY29uQnV0dG9uLCB7XG5cdFx0XHRcdFx0XHRcdFx0XHR0aXRsZTogXCJ1cGdyYWRlX2FjdGlvblwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2xpY2s6ICgpID0+IHNob3dQcm9ncmVzc0RpYWxvZyhcInBsZWFzZVdhaXRfbXNnXCIsIHRoaXMuaGFuZGxlVXBncmFkZVN1YnNjcmlwdGlvbigpKSxcblx0XHRcdFx0XHRcdFx0XHRcdGljb246IEljb25zLkVkaXQsXG5cdFx0XHRcdFx0XHRcdFx0XHRzaXplOiBCdXR0b25TaXplLkNvbXBhY3QsXG5cdFx0XHRcdFx0XHRcdCAgfSlcblx0XHRcdFx0XHRcdFx0OiAhdGhpcy5faXNDYW5jZWxsZWRcblx0XHRcdFx0XHRcdFx0PyBtKEljb25CdXR0b24sIHtcblx0XHRcdFx0XHRcdFx0XHRcdHRpdGxlOiBcInN1YnNjcmlwdGlvbl9sYWJlbFwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2xpY2s6ICgpID0+IHRoaXMub25TdWJzY3JpcHRpb25DbGljaygpLFxuXHRcdFx0XHRcdFx0XHRcdFx0aWNvbjogSWNvbnMuRWRpdCxcblx0XHRcdFx0XHRcdFx0XHRcdHNpemU6IEJ1dHRvblNpemUuQ29tcGFjdCxcblx0XHRcdFx0XHRcdFx0ICB9KVxuXHRcdFx0XHRcdFx0XHQ6IG51bGwsXG5cdFx0XHRcdH0pLFxuXHRcdFx0XHR0aGlzLnNob3dPcmRlckFncmVlbWVudCgpID8gdGhpcy5yZW5kZXJBZ3JlZW1lbnQoKSA6IG51bGwsXG5cdFx0XHRcdHRoaXMuc2hvd1ByaWNlRGF0YSgpID8gdGhpcy5yZW5kZXJJbnRlcnZhbHMoKSA6IG51bGwsXG5cdFx0XHRcdHRoaXMuc2hvd1ByaWNlRGF0YSgpICYmIHRoaXMuX25leHRQZXJpb2RQcmljZVZpc2libGUgJiYgdGhpcy5fcGVyaW9kRW5kRGF0ZVxuXHRcdFx0XHRcdD8gbShUZXh0RmllbGQsIHtcblx0XHRcdFx0XHRcdFx0bGFiZWw6IGxhbmcuZ2V0VHJhbnNsYXRpb24oXCJwcmljZUZyb21fbGFiZWxcIiwge1xuXHRcdFx0XHRcdFx0XHRcdFwie2RhdGV9XCI6IGZvcm1hdERhdGUobmV3IERhdGUobmV2ZXJOdWxsKHRoaXMuX3BlcmlvZEVuZERhdGUpLmdldFRpbWUoKSArIERBWSkpLFxuXHRcdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRcdFx0aGVscExhYmVsOiAoKSA9PiBsYW5nLmdldChcIm5leHRTdWJzY3JpcHRpb25QcmljZV9tc2dcIiksXG5cdFx0XHRcdFx0XHRcdHZhbHVlOiB0aGlzLl9uZXh0UHJpY2VGaWVsZFZhbHVlKCksXG5cdFx0XHRcdFx0XHRcdG9uaW5wdXQ6IHRoaXMuX25leHRQcmljZUZpZWxkVmFsdWUsXG5cdFx0XHRcdFx0XHRcdGlzUmVhZE9ubHk6IHRydWUsXG5cdFx0XHRcdFx0ICB9KVxuXHRcdFx0XHRcdDogbnVsbCxcblx0XHRcdFx0bShcIi5zbWFsbC5tdC1zXCIsIHJlbmRlclRlcm1zQW5kQ29uZGl0aW9uc0J1dHRvbihUZXJtc1NlY3Rpb24uVGVybXMsIENVUlJFTlRfVEVSTVNfVkVSU0lPTikpLFxuXHRcdFx0XHRtKFwiLnNtYWxsLm10LXNcIiwgcmVuZGVyVGVybXNBbmRDb25kaXRpb25zQnV0dG9uKFRlcm1zU2VjdGlvbi5Qcml2YWN5LCBDVVJSRU5UX1BSSVZBQ1lfVkVSU0lPTikpLFxuXHRcdFx0XHRtKFxuXHRcdFx0XHRcdFNldHRpbmdzRXhwYW5kZXIsXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dGl0bGU6IFwiZ2lmdENhcmRzX2xhYmVsXCIsXG5cdFx0XHRcdFx0XHRpbmZvTXNnOiBcImdpZnRDYXJkU2VjdGlvbl9sYWJlbFwiLFxuXHRcdFx0XHRcdFx0ZXhwYW5kZWQ6IHRoaXMuX2dpZnRDYXJkc0V4cGFuZGVkLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0cmVuZGVyR2lmdENhcmRUYWJsZShBcnJheS5mcm9tKHRoaXMuX2dpZnRDYXJkcy52YWx1ZXMoKSksIGlzUHJlbWl1bVByZWRpY2F0ZSksXG5cdFx0XHRcdCksXG5cdFx0XHRcdExlZ2FjeVBsYW5zLmluY2x1ZGVzKHRoaXMuY3VycmVudFBsYW5UeXBlKVxuXHRcdFx0XHRcdD8gW1xuXHRcdFx0XHRcdFx0XHRtKFwiLmg0Lm10LWxcIiwgbGFuZy5nZXQoXCJhZG1pblByZW1pdW1GZWF0dXJlc19hY3Rpb25cIikpLFxuXHRcdFx0XHRcdFx0XHRtKFRleHRGaWVsZCwge1xuXHRcdFx0XHRcdFx0XHRcdGxhYmVsOiBcInN0b3JhZ2VDYXBhY2l0eV9sYWJlbFwiLFxuXHRcdFx0XHRcdFx0XHRcdHZhbHVlOiB0aGlzLl9zdG9yYWdlRmllbGRWYWx1ZSgpLFxuXHRcdFx0XHRcdFx0XHRcdG9uaW5wdXQ6IHRoaXMuX3N0b3JhZ2VGaWVsZFZhbHVlLFxuXHRcdFx0XHRcdFx0XHRcdGlzUmVhZE9ubHk6IHRydWUsXG5cdFx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdFx0XHRtKFRleHRGaWVsZCwge1xuXHRcdFx0XHRcdFx0XHRcdGxhYmVsOiBcIm1haWxBZGRyZXNzQWxpYXNlc19sYWJlbFwiLFxuXHRcdFx0XHRcdFx0XHRcdHZhbHVlOiB0aGlzLl9lbWFpbEFsaWFzRmllbGRWYWx1ZSgpLFxuXHRcdFx0XHRcdFx0XHRcdG9uaW5wdXQ6IHRoaXMuX2VtYWlsQWxpYXNGaWVsZFZhbHVlLFxuXHRcdFx0XHRcdFx0XHRcdGlzUmVhZE9ubHk6IHRydWUsXG5cdFx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdFx0XHRtKFRleHRGaWVsZCwge1xuXHRcdFx0XHRcdFx0XHRcdGxhYmVsOiBcInByaWNpbmcuY29tcGFyaXNvblNoYXJpbmdDYWxlbmRhcl9tc2dcIixcblx0XHRcdFx0XHRcdFx0XHR2YWx1ZTogdGhpcy5fc2hhcmluZ0ZpZWxkVmFsdWUoKSxcblx0XHRcdFx0XHRcdFx0XHRvbmlucHV0OiB0aGlzLl9zaGFyaW5nRmllbGRWYWx1ZSxcblx0XHRcdFx0XHRcdFx0XHRpc1JlYWRPbmx5OiB0cnVlLFxuXHRcdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRcdFx0bShUZXh0RmllbGQsIHtcblx0XHRcdFx0XHRcdFx0XHRsYWJlbDogXCJwcmljaW5nLmNvbXBhcmlzb25FdmVudEludml0ZXNfbXNnXCIsXG5cdFx0XHRcdFx0XHRcdFx0dmFsdWU6IHRoaXMuX2V2ZW50SW52aXRlc0ZpZWxkVmFsdWUoKSxcblx0XHRcdFx0XHRcdFx0XHRvbmlucHV0OiB0aGlzLl9ldmVudEludml0ZXNGaWVsZFZhbHVlLFxuXHRcdFx0XHRcdFx0XHRcdGlzUmVhZE9ubHk6IHRydWUsXG5cdFx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdFx0XHRtKFRleHRGaWVsZCwge1xuXHRcdFx0XHRcdFx0XHRcdGxhYmVsOiBcInByaWNpbmcuY29tcGFyaXNvbk91dE9mT2ZmaWNlX21zZ1wiLFxuXHRcdFx0XHRcdFx0XHRcdHZhbHVlOiB0aGlzLl9hdXRvUmVzcG9uZGVyRmllbGRWYWx1ZSgpLFxuXHRcdFx0XHRcdFx0XHRcdG9uaW5wdXQ6IHRoaXMuX2F1dG9SZXNwb25kZXJGaWVsZFZhbHVlLFxuXHRcdFx0XHRcdFx0XHRcdGlzUmVhZE9ubHk6IHRydWUsXG5cdFx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdFx0XHRtKFRleHRGaWVsZCwge1xuXHRcdFx0XHRcdFx0XHRcdGxhYmVsOiBcIndoaXRlbGFiZWwubG9naW5fdGl0bGVcIixcblx0XHRcdFx0XHRcdFx0XHR2YWx1ZTogdGhpcy5fd2hpdGVsYWJlbEZpZWxkVmFsdWUoKSxcblx0XHRcdFx0XHRcdFx0XHRvbmlucHV0OiB0aGlzLl93aGl0ZWxhYmVsRmllbGRWYWx1ZSxcblx0XHRcdFx0XHRcdFx0XHRpc1JlYWRPbmx5OiB0cnVlLFxuXHRcdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRcdFx0bShUZXh0RmllbGQsIHtcblx0XHRcdFx0XHRcdFx0XHRsYWJlbDogXCJ3aGl0ZWxhYmVsLmN1c3RvbV90aXRsZVwiLFxuXHRcdFx0XHRcdFx0XHRcdHZhbHVlOiB0aGlzLl93aGl0ZWxhYmVsRmllbGRWYWx1ZSgpLFxuXHRcdFx0XHRcdFx0XHRcdG9uaW5wdXQ6IHRoaXMuX3doaXRlbGFiZWxGaWVsZFZhbHVlLFxuXHRcdFx0XHRcdFx0XHRcdGlzUmVhZE9ubHk6IHRydWUsXG5cdFx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdCAgXVxuXHRcdFx0XHRcdDogW10sXG5cdFx0XHRdKVxuXHRcdH1cblxuXHRcdGxvY2F0b3IuZW50aXR5Q2xpZW50XG5cdFx0XHQubG9hZChDdXN0b21lclR5cGVSZWYsIG5ldmVyTnVsbChsb2NhdG9yLmxvZ2lucy5nZXRVc2VyQ29udHJvbGxlcigpLnVzZXIuY3VzdG9tZXIpKVxuXHRcdFx0LnRoZW4oKGN1c3RvbWVyKSA9PiB7XG5cdFx0XHRcdHRoaXMudXBkYXRlQ3VzdG9tZXJEYXRhKGN1c3RvbWVyKVxuXHRcdFx0XHRyZXR1cm4gbG9jYXRvci5sb2dpbnMuZ2V0VXNlckNvbnRyb2xsZXIoKS5sb2FkQ3VzdG9tZXJJbmZvKClcblx0XHRcdH0pXG5cdFx0XHQudGhlbigoY3VzdG9tZXJJbmZvKSA9PiB7XG5cdFx0XHRcdHRoaXMuX2N1c3RvbWVySW5mbyA9IGN1c3RvbWVySW5mb1xuXHRcdFx0XHRyZXR1cm4gbG9jYXRvci5lbnRpdHlDbGllbnQubG9hZChBY2NvdW50aW5nSW5mb1R5cGVSZWYsIGN1c3RvbWVySW5mby5hY2NvdW50aW5nSW5mbylcblx0XHRcdH0pXG5cdFx0XHQudGhlbigoYWNjb3VudGluZ0luZm8pID0+IHtcblx0XHRcdFx0dGhpcy51cGRhdGVBY2NvdW50SW5mb0RhdGEoYWNjb3VudGluZ0luZm8pXG5cdFx0XHRcdHRoaXMudXBkYXRlUHJpY2VJbmZvKClcblx0XHRcdH0pXG5cdFx0Y29uc3QgbG9hZGluZ1N0cmluZyA9IGxhbmcuZ2V0KFwibG9hZGluZ19tc2dcIilcblx0XHR0aGlzLl9jdXJyZW50UHJpY2VGaWVsZFZhbHVlID0gc3RyZWFtKGxvYWRpbmdTdHJpbmcpXG5cdFx0dGhpcy5fc3Vic2NyaXB0aW9uRmllbGRWYWx1ZSA9IHN0cmVhbShsb2FkaW5nU3RyaW5nKVxuXHRcdHRoaXMuX29yZGVyQWdyZWVtZW50RmllbGRWYWx1ZSA9IHN0cmVhbShsb2FkaW5nU3RyaW5nKVxuXHRcdHRoaXMuX25leHRQcmljZUZpZWxkVmFsdWUgPSBzdHJlYW0obG9hZGluZ1N0cmluZylcblx0XHR0aGlzLl91c2Vyc0ZpZWxkVmFsdWUgPSBzdHJlYW0obG9hZGluZ1N0cmluZylcblx0XHR0aGlzLl9zdG9yYWdlRmllbGRWYWx1ZSA9IHN0cmVhbShsb2FkaW5nU3RyaW5nKVxuXHRcdHRoaXMuX2VtYWlsQWxpYXNGaWVsZFZhbHVlID0gc3RyZWFtKGxvYWRpbmdTdHJpbmcpXG5cdFx0dGhpcy5fZ3JvdXBzRmllbGRWYWx1ZSA9IHN0cmVhbShsb2FkaW5nU3RyaW5nKVxuXHRcdHRoaXMuX3doaXRlbGFiZWxGaWVsZFZhbHVlID0gc3RyZWFtKGxvYWRpbmdTdHJpbmcpXG5cdFx0dGhpcy5fc2hhcmluZ0ZpZWxkVmFsdWUgPSBzdHJlYW0obG9hZGluZ1N0cmluZylcblx0XHR0aGlzLl9ldmVudEludml0ZXNGaWVsZFZhbHVlID0gc3RyZWFtKGxvYWRpbmdTdHJpbmcpXG5cdFx0dGhpcy5fYXV0b1Jlc3BvbmRlckZpZWxkVmFsdWUgPSBzdHJlYW0obG9hZGluZ1N0cmluZylcblx0XHR0aGlzLl9zZWxlY3RlZFN1YnNjcmlwdGlvbkludGVydmFsID0gc3RyZWFtPFBheW1lbnRJbnRlcnZhbCB8IG51bGw+KG51bGwpXG5cblx0XHR0aGlzLnVwZGF0ZUJvb2tpbmdzKClcblx0fVxuXG5cdHByaXZhdGUgb25TdWJzY3JpcHRpb25DbGljaygpIHtcblx0XHRjb25zdCBwYXltZW50TWV0aG9kID0gdGhpcy5fYWNjb3VudGluZ0luZm8gPyBnZXRQYXltZW50TWV0aG9kVHlwZSh0aGlzLl9hY2NvdW50aW5nSW5mbykgOiBudWxsXG5cblx0XHRpZiAoaXNJT1NBcHAoKSAmJiAocGF5bWVudE1ldGhvZCA9PSBudWxsIHx8IHBheW1lbnRNZXRob2QgPT0gUGF5bWVudE1ldGhvZFR5cGUuQXBwU3RvcmUpKSB7XG5cdFx0XHQvLyBjYXNlIDE6IHdlIGFyZSBpbiBpT1MgYXBwIGFuZCB3ZSBlaXRoZXIgYXJlIG5vdCBwYXlpbmcgb3IgYXJlIGFscmVhZHkgb24gQXBwU3RvcmVcblx0XHRcdHRoaXMuaGFuZGxlQXBwU3RvcmVTdWJzY3JpcHRpb25DaGFuZ2UoKVxuXHRcdH0gZWxzZSBpZiAocGF5bWVudE1ldGhvZCA9PSBQYXltZW50TWV0aG9kVHlwZS5BcHBTdG9yZSAmJiB0aGlzLl9hY2NvdW50aW5nSW5mbz8uYXBwU3RvcmVTdWJzY3JpcHRpb24pIHtcblx0XHRcdC8vIGNhc2UgMjogd2UgaGF2ZSBhIHJ1bm5pbmcgQXBwU3RvcmUgc3Vic2NyaXB0aW9uIGJ1dCB0aGlzIGlzIG5vdCBhbiBpT1MgYXBwXG5cblx0XHRcdC8vIElmIHRoZXJlJ3MgYSBydW5uaW5nIEFwcCBTdG9yZSBzdWJzY3JpcHRpb24gaXQgbXVzdCBiZSBtYW5hZ2VkIHRocm91Z2ggQXBwbGUuXG5cdFx0XHQvLyBUaGlzIGluY2x1ZGVzIHRoZSBjYXNlIHdoZXJlIHJlbmV3YWwgaXMgYWxyZWFkeSBkaXNhYmxlZCwgYnV0IGl0J3Mgbm90IGV4cGlyZWQgeWV0LlxuXHRcdFx0Ly8gUnVubmluZyBzdWJzY3JpcHRpb24gY2Fubm90IGJlIGNoYW5nZWQgZnJvbSBvdGhlciBjbGllbnQsIGJ1dCBpdCBjYW4gc3RpbGwgYmUgbWFuYWdlZCB0aHJvdWdoIGlPUyBhcHAgb3Igd2hlbiBzdWJzY3JpcHRpb24gZXhwaXJlcy5cblx0XHRcdHJldHVybiBzaG93TWFuYWdlVGhyb3VnaEFwcFN0b3JlRGlhbG9nKClcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gb3RoZXIgY2FzZXMgKG5vdCBpT1MgYXBwLCBub3QgYXBwIHN0b3JlIHBheW1lbnQgbWV0aG9kLCBubyBydW5uaW5nIEFwcFN0b3JlIHN1YnNjcmlwdGlvbiwgaU9TIGJ1dCBhbm90aGVyIHBheW1lbnQgbWV0aG9kKVxuXHRcdFx0aWYgKHRoaXMuX2FjY291bnRpbmdJbmZvICYmIHRoaXMuX2N1c3RvbWVyICYmIHRoaXMuX2N1c3RvbWVySW5mbyAmJiB0aGlzLl9sYXN0Qm9va2luZykge1xuXHRcdFx0XHRzaG93U3dpdGNoRGlhbG9nKHRoaXMuX2N1c3RvbWVyLCB0aGlzLl9jdXN0b21lckluZm8sIHRoaXMuX2FjY291bnRpbmdJbmZvLCB0aGlzLl9sYXN0Qm9va2luZywgQXZhaWxhYmxlUGxhbnMsIG51bGwpXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBoYW5kbGVVcGdyYWRlU3Vic2NyaXB0aW9uKCkge1xuXHRcdGlmIChpc0lPU0FwcCgpKSB7XG5cdFx0XHQvLyBXZSBwYXNzIGBudWxsYCBiZWNhdXNlIHdlIGV4cGVjdCBubyBzdWJzY3JpcHRpb24gd2hlbiB1cGdyYWRpbmdcblx0XHRcdGNvbnN0IGFwcFN0b3JlU3Vic2NyaXB0aW9uT3duZXJzaGlwID0gYXdhaXQgcXVlcnlBcHBTdG9yZVN1YnNjcmlwdGlvbk93bmVyc2hpcChudWxsKVxuXG5cdFx0XHRpZiAoYXBwU3RvcmVTdWJzY3JpcHRpb25Pd25lcnNoaXAgIT09IE1vYmlsZVBheW1lbnRTdWJzY3JpcHRpb25Pd25lcnNoaXAuTm9TdWJzY3JpcHRpb24pIHtcblx0XHRcdFx0cmV0dXJuIERpYWxvZy5tZXNzYWdlKFxuXHRcdFx0XHRcdGxhbmcuZ2V0VHJhbnNsYXRpb24oXCJzdG9yZU11bHRpU3Vic2NyaXB0aW9uRXJyb3JfbXNnXCIsIHtcblx0XHRcdFx0XHRcdFwie0FwcFN0b3JlUGF5bWVudH1cIjogSW5mb0xpbmsuQXBwU3RvcmVQYXltZW50LFxuXHRcdFx0XHRcdH0pLFxuXHRcdFx0XHQpXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHNob3dVcGdyYWRlV2l6YXJkKGxvY2F0b3IubG9naW5zKVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBoYW5kbGVBcHBTdG9yZVN1YnNjcmlwdGlvbkNoYW5nZSgpIHtcblx0XHRpZiAoIXRoaXMubW9iaWxlUGF5bWVudHNGYWNhZGUpIHtcblx0XHRcdHRocm93IEVycm9yKFwiTm90IGFsbG93ZWQgdG8gY2hhbmdlIEFwcFN0b3JlIHN1YnNjcmlwdGlvbiBmcm9tIHdlYiBjbGllbnRcIilcblx0XHR9XG5cblx0XHRsZXQgY3VzdG9tZXJcblx0XHRsZXQgYWNjb3VudGluZ0luZm9cblx0XHRpZiAodGhpcy5fY3VzdG9tZXIgJiYgdGhpcy5fYWNjb3VudGluZ0luZm8pIHtcblx0XHRcdGN1c3RvbWVyID0gdGhpcy5fY3VzdG9tZXJcblx0XHRcdGFjY291bnRpbmdJbmZvID0gdGhpcy5fYWNjb3VudGluZ0luZm9cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0Y29uc3QgYXBwU3RvcmVTdWJzY3JpcHRpb25Pd25lcnNoaXAgPSBhd2FpdCBxdWVyeUFwcFN0b3JlU3Vic2NyaXB0aW9uT3duZXJzaGlwKGJhc2U2NFRvVWludDhBcnJheShiYXNlNjRFeHRUb0Jhc2U2NChjdXN0b21lci5faWQpKSlcblx0XHRjb25zdCBpc0FwcFN0b3JlUGF5bWVudCA9IGdldFBheW1lbnRNZXRob2RUeXBlKGFjY291bnRpbmdJbmZvKSA9PT0gUGF5bWVudE1ldGhvZFR5cGUuQXBwU3RvcmVcblx0XHRjb25zdCB1c2VyU3RhdHVzID0gY3VzdG9tZXIuYXBwcm92YWxTdGF0dXNcblx0XHRjb25zdCBoYXNBbkFjdGl2ZVN1YnNjcmlwdGlvbiA9IGlzQXBwU3RvcmVQYXltZW50ICYmIGFjY291bnRpbmdJbmZvLmFwcFN0b3JlU3Vic2NyaXB0aW9uICE9IG51bGxcblxuXHRcdGlmIChoYXNBbkFjdGl2ZVN1YnNjcmlwdGlvbiAmJiAhKGF3YWl0IHRoaXMuY2FuTWFuYWdlQXBwU3RvcmVTdWJzY3JpcHRpb25JbkFwcChhY2NvdW50aW5nSW5mbywgYXBwU3RvcmVTdWJzY3JpcHRpb25Pd25lcnNoaXApKSkge1xuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0Ly8gU2hvdyBhIGRpYWxvZyBvbmx5IGlmIHRoZSB1c2VyJ3MgQXBwbGUgYWNjb3VudCdzIGxhc3QgdHJhbnNhY3Rpb24gd2FzIHdpdGggdGhpcyBjdXN0b21lciBJRFxuXHRcdC8vXG5cdFx0Ly8gVGhpcyBwcmV2ZW50cyB0aGUgdXNlciBmcm9tIGFjY2lkZW50YWxseSBjaGFuZ2luZyBhIHN1YnNjcmlwdGlvbiB0aGF0IHRoZXkgZG9uJ3Qgb3duXG5cdFx0aWYgKGFwcFN0b3JlU3Vic2NyaXB0aW9uT3duZXJzaGlwID09PSBNb2JpbGVQYXltZW50U3Vic2NyaXB0aW9uT3duZXJzaGlwLk5vdE93bmVyKSB7XG5cdFx0XHQvLyBUaGVyZSdzIGEgc3Vic2NyaXB0aW9uIHdpdGggdGhpcyBhcHBsZSBhY2NvdW50IHRoYXQgZG9lc24ndCBiZWxvbmcgdG8gdGhpcyB1c2VyXG5cdFx0XHRyZXR1cm4gRGlhbG9nLm1lc3NhZ2UoXG5cdFx0XHRcdGxhbmcuZ2V0VHJhbnNsYXRpb24oXCJzdG9yZU11bHRpU3Vic2NyaXB0aW9uRXJyb3JfbXNnXCIsIHtcblx0XHRcdFx0XHRcIntBcHBTdG9yZVBheW1lbnR9XCI6IEluZm9MaW5rLkFwcFN0b3JlUGF5bWVudCxcblx0XHRcdFx0fSksXG5cdFx0XHQpXG5cdFx0fSBlbHNlIGlmIChcblx0XHRcdGlzQXBwU3RvcmVQYXltZW50ICYmXG5cdFx0XHRhcHBTdG9yZVN1YnNjcmlwdGlvbk93bmVyc2hpcCA9PT0gTW9iaWxlUGF5bWVudFN1YnNjcmlwdGlvbk93bmVyc2hpcC5Ob1N1YnNjcmlwdGlvbiAmJlxuXHRcdFx0dXNlclN0YXR1cyA9PT0gQXBwcm92YWxTdGF0dXMuUkVHSVNUUkFUSU9OX0FQUFJPVkVEXG5cdFx0KSB7XG5cdFx0XHQvLyBVc2VyIGhhcyBhbiBvbmdvaW5nIHN1YnNjcmlwdGlvbnMgYnV0IG5vdCBvbiB0aGUgY3VycmVudCBBcHBsZSBBY2NvdW50LCBzbyB3ZSBzaG91bGRuJ3QgYWxsb3cgdGhlbSB0byBjaGFuZ2UgdGhlaXIgcGxhbiB3aXRoIHRoaXMgYWNjb3VudFxuXHRcdFx0Ly8gaW5zdGVhZCBvZiB0aGUgYWNjb3VudCBvd25lciBvZiB0aGUgc3Vic2NyaXB0aW9uc1xuXHRcdFx0cmV0dXJuIERpYWxvZy5tZXNzYWdlKGxhbmcuZ2V0VHJhbnNsYXRpb24oXCJzdG9yZU5vU3Vic2NyaXB0aW9uX21zZ1wiLCB7IFwie0FwcFN0b3JlUGF5bWVudH1cIjogSW5mb0xpbmsuQXBwU3RvcmVQYXltZW50IH0pKVxuXHRcdH0gZWxzZSBpZiAoYXBwU3RvcmVTdWJzY3JpcHRpb25Pd25lcnNoaXAgPT09IE1vYmlsZVBheW1lbnRTdWJzY3JpcHRpb25Pd25lcnNoaXAuTm9TdWJzY3JpcHRpb24pIHtcblx0XHRcdC8vIFVzZXIgaGFzIG5vIG9uZ29pbmcgc3Vic2NyaXB0aW9uIGFuZCBpc24ndCBhcHByb3ZlZC4gV2Ugc2hvdWxkIGFsbG93IHRoZW0gdG8gZG93bmdyYWRlIHRoZWlyIGFjY291bnRzIG9yIHJlc3Vic2NyaWJlIGFuZFxuXHRcdFx0Ly8gcmVzdGFydCBhbiBBcHBsZSBTdWJzY3JpcHRpb24gZmxvd1xuXHRcdFx0Y29uc3QgaXNSZXN1YnNjcmliZSA9IGF3YWl0IERpYWxvZy5jaG9pY2UoXG5cdFx0XHRcdGxhbmcuZ2V0VHJhbnNsYXRpb24oXCJzdG9yZURvd25ncmFkZU9yUmVzdWJzY3JpYmVfbXNnXCIsIHsgXCJ7QXBwU3RvcmVEb3duZ3JhZGV9XCI6IEluZm9MaW5rLkFwcFN0b3JlRG93bmdyYWRlIH0pLFxuXHRcdFx0XHRbXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dGV4dDogXCJjaGFuZ2VQbGFuX2FjdGlvblwiLFxuXHRcdFx0XHRcdFx0dmFsdWU6IGZhbHNlLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dGV4dDogXCJyZXN1YnNjcmliZV9hY3Rpb25cIixcblx0XHRcdFx0XHRcdHZhbHVlOiB0cnVlLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdF0sXG5cdFx0XHQpXG5cblx0XHRcdGlmIChpc1Jlc3Vic2NyaWJlKSB7XG5cdFx0XHRcdGNvbnN0IHBsYW5UeXBlID0gYXdhaXQgbG9jYXRvci5sb2dpbnMuZ2V0VXNlckNvbnRyb2xsZXIoKS5nZXRQbGFuVHlwZSgpXG5cdFx0XHRcdGNvbnN0IGN1c3RvbWVySWQgPSBsb2NhdG9yLmxvZ2lucy5nZXRVc2VyQ29udHJvbGxlcigpLnVzZXIuY3VzdG9tZXIhXG5cdFx0XHRcdGNvbnN0IGN1c3RvbWVySWRCeXRlcyA9IGJhc2U2NFRvVWludDhBcnJheShiYXNlNjRFeHRUb0Jhc2U2NChjdXN0b21lcklkKSlcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLm1vYmlsZVBheW1lbnRzRmFjYWRlLnJlcXVlc3RTdWJzY3JpcHRpb25Ub1BsYW4oXG5cdFx0XHRcdFx0XHRhcHBTdG9yZVBsYW5OYW1lKHBsYW5UeXBlKSxcblx0XHRcdFx0XHRcdGFzUGF5bWVudEludGVydmFsKGFjY291bnRpbmdJbmZvLnBheW1lbnRJbnRlcnZhbCksXG5cdFx0XHRcdFx0XHRjdXN0b21lcklkQnl0ZXMsXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0aWYgKGUgaW5zdGFuY2VvZiBNb2JpbGVQYXltZW50RXJyb3IpIHtcblx0XHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoXCJBcHBTdG9yZSBzdWJzY3JpcHRpb24gZmFpbGVkXCIsIGUpXG5cdFx0XHRcdFx0XHREaWFsb2cubWVzc2FnZShcImFwcFN0b3JlU3Vic2NyaXB0aW9uRXJyb3JfbXNnXCIsIGUubWVzc2FnZSlcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dGhyb3cgZVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aWYgKHRoaXMuX2N1c3RvbWVySW5mbyAmJiB0aGlzLl9sYXN0Qm9va2luZykge1xuXHRcdFx0XHRcdHJldHVybiBzaG93U3dpdGNoRGlhbG9nKGN1c3RvbWVyLCB0aGlzLl9jdXN0b21lckluZm8sIGFjY291bnRpbmdJbmZvLCB0aGlzLl9sYXN0Qm9va2luZywgQXZhaWxhYmxlUGxhbnMsIG51bGwpXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKHRoaXMuX2N1c3RvbWVySW5mbyAmJiB0aGlzLl9sYXN0Qm9va2luZykge1xuXHRcdFx0XHRyZXR1cm4gc2hvd1N3aXRjaERpYWxvZyhjdXN0b21lciwgdGhpcy5fY3VzdG9tZXJJbmZvLCBhY2NvdW50aW5nSW5mbywgdGhpcy5fbGFzdEJvb2tpbmcsIEF2YWlsYWJsZVBsYW5zLCBudWxsKVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgY2FuTWFuYWdlQXBwU3RvcmVTdWJzY3JpcHRpb25JbkFwcChhY2NvdW50aW5nSW5mbzogQWNjb3VudGluZ0luZm8sIG93bmVyc2hpcDogTW9iaWxlUGF5bWVudFN1YnNjcmlwdGlvbk93bmVyc2hpcCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdGlmIChvd25lcnNoaXAgPT09IE1vYmlsZVBheW1lbnRTdWJzY3JpcHRpb25Pd25lcnNoaXAuTm90T3duZXIpIHtcblx0XHRcdHJldHVybiB0cnVlXG5cdFx0fVxuXG5cdFx0Y29uc3QgYXBwU3RvcmVTdWJzY3JpcHRpb25EYXRhID0gYXdhaXQgbG9jYXRvci5zZXJ2aWNlRXhlY3V0b3IuZ2V0KFxuXHRcdFx0QXBwU3RvcmVTdWJzY3JpcHRpb25TZXJ2aWNlLFxuXHRcdFx0Y3JlYXRlQXBwU3RvcmVTdWJzY3JpcHRpb25HZXRJbih7IHN1YnNjcmlwdGlvbklkOiBlbGVtZW50SWRQYXJ0KGFzc2VydE5vdE51bGwoYWNjb3VudGluZ0luZm8uYXBwU3RvcmVTdWJzY3JpcHRpb24pKSB9KSxcblx0XHQpXG5cblx0XHRpZiAoIWFwcFN0b3JlU3Vic2NyaXB0aW9uRGF0YSB8fCBhcHBTdG9yZVN1YnNjcmlwdGlvbkRhdGEuYXBwID09IG51bGwpIHtcblx0XHRcdHRocm93IG5ldyBQcm9ncmFtbWluZ0Vycm9yKFwiRmFpbGVkIHRvIGRldGVybWluZSBzdWJzY3JpcHRpb24gb3JpZ2luXCIpXG5cdFx0fVxuXG5cdFx0Y29uc3QgaXNNYWlsU3Vic2NyaXB0aW9uID0gYXBwU3RvcmVTdWJzY3JpcHRpb25EYXRhLmFwcCA9PT0gU3Vic2NyaXB0aW9uQXBwLk1haWxcblxuXHRcdGlmIChjbGllbnQuaXNDYWxlbmRhckFwcCgpICYmIGlzTWFpbFN1YnNjcmlwdGlvbikge1xuXHRcdFx0cmV0dXJuIGF3YWl0IHRoaXMuaGFuZGxlQXBwT3BlbihTdWJzY3JpcHRpb25BcHAuTWFpbClcblx0XHR9IGVsc2UgaWYgKCFjbGllbnQuaXNDYWxlbmRhckFwcCgpICYmICFpc01haWxTdWJzY3JpcHRpb24pIHtcblx0XHRcdHJldHVybiBhd2FpdCB0aGlzLmhhbmRsZUFwcE9wZW4oU3Vic2NyaXB0aW9uQXBwLkNhbGVuZGFyKVxuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlXG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIGhhbmRsZUFwcE9wZW4oYXBwOiBTdWJzY3JpcHRpb25BcHApIHtcblx0XHRjb25zdCBhcHBOYW1lID0gYXBwID09PSBTdWJzY3JpcHRpb25BcHAuQ2FsZW5kYXIgPyBcIlR1dGEgQ2FsZW5kYXJcIiA6IFwiVHV0YSBNYWlsXCJcblx0XHRjb25zdCBkaWFsb2dSZXN1bHQgPSBhd2FpdCBEaWFsb2cuY29uZmlybShsYW5nLmdldFRyYW5zbGF0aW9uKFwiaGFuZGxlU3Vic2NyaXB0aW9uT25BcHBfbXNnXCIsIHsgXCJ7MX1cIjogYXBwTmFtZSB9KSwgXCJ5ZXNfbGFiZWxcIilcblx0XHRjb25zdCBxdWVyeSA9IHN0cmluZ1RvQmFzZTY0KGBzZXR0aW5ncz1zdWJzY3JpcHRpb25gKVxuXG5cdFx0aWYgKCFkaWFsb2dSZXN1bHQpIHtcblx0XHRcdHJldHVybiBmYWxzZVxuXHRcdH1cblxuXHRcdGlmIChhcHAgPT09IFN1YnNjcmlwdGlvbkFwcC5DYWxlbmRhcikge1xuXHRcdFx0bG9jYXRvci5zeXN0ZW1GYWNhZGUub3BlbkNhbGVuZGFyQXBwKHF1ZXJ5KVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRsb2NhdG9yLnN5c3RlbUZhY2FkZS5vcGVuTWFpbEFwcChxdWVyeSlcblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2Vcblx0fVxuXG5cdHByaXZhdGUgb3BlbkFwcERpYWxvZ0NhbGxiYWNrKG9wZW46IGJvb2xlYW4sIGFwcDogQXBwVHlwZS5NYWlsIHwgQXBwVHlwZS5DYWxlbmRhcikge1xuXHRcdGlmICghb3Blbikge1xuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0Y29uc3QgYXBwTmFtZSA9IGFwcCA9PT0gQXBwVHlwZS5NYWlsID8gXCJUdXRhIE1haWxcIiA6IFwiVHV0YSBDYWxlbmRhclwiXG5cdH1cblxuXHRwcml2YXRlIHNob3dPcmRlckFncmVlbWVudCgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0bG9jYXRvci5sb2dpbnMuZ2V0VXNlckNvbnRyb2xsZXIoKS5pc1BhaWRBY2NvdW50KCkgJiZcblx0XHRcdCgodGhpcy5fY3VzdG9tZXIgIT0gbnVsbCAmJiB0aGlzLl9jdXN0b21lci5idXNpbmVzc1VzZSkgfHxcblx0XHRcdFx0KHRoaXMuX2N1c3RvbWVyICE9IG51bGwgJiYgKHRoaXMuX2N1c3RvbWVyLm9yZGVyUHJvY2Vzc2luZ0FncmVlbWVudCAhPSBudWxsIHx8IHRoaXMuX2N1c3RvbWVyLm9yZGVyUHJvY2Vzc2luZ0FncmVlbWVudE5lZWRlZCkpKVxuXHRcdClcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgdXBkYXRlQ3VzdG9tZXJEYXRhKGN1c3RvbWVyOiBDdXN0b21lcik6IFByb21pc2U8dm9pZD4ge1xuXHRcdHRoaXMuX2N1c3RvbWVyID0gY3VzdG9tZXJcblxuXHRcdGlmIChjdXN0b21lci5vcmRlclByb2Nlc3NpbmdBZ3JlZW1lbnQpIHtcblx0XHRcdHRoaXMuX29yZGVyQWdyZWVtZW50ID0gYXdhaXQgbG9jYXRvci5lbnRpdHlDbGllbnQubG9hZChPcmRlclByb2Nlc3NpbmdBZ3JlZW1lbnRUeXBlUmVmLCBjdXN0b21lci5vcmRlclByb2Nlc3NpbmdBZ3JlZW1lbnQpXG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX29yZGVyQWdyZWVtZW50ID0gbnVsbFxuXHRcdH1cblxuXHRcdGlmIChjdXN0b21lci5vcmRlclByb2Nlc3NpbmdBZ3JlZW1lbnROZWVkZWQpIHtcblx0XHRcdHRoaXMuX29yZGVyQWdyZWVtZW50RmllbGRWYWx1ZShsYW5nLmdldChcInNpZ25pbmdOZWVkZWRfbXNnXCIpKVxuXHRcdH0gZWxzZSBpZiAodGhpcy5fb3JkZXJBZ3JlZW1lbnQpIHtcblx0XHRcdHRoaXMuX29yZGVyQWdyZWVtZW50RmllbGRWYWx1ZShcblx0XHRcdFx0bGFuZy5nZXQoXCJzaWduZWRPbl9tc2dcIiwge1xuXHRcdFx0XHRcdFwie2RhdGV9XCI6IGZvcm1hdERhdGUodGhpcy5fb3JkZXJBZ3JlZW1lbnQuc2lnbmF0dXJlRGF0ZSksXG5cdFx0XHRcdH0pLFxuXHRcdFx0KVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9vcmRlckFncmVlbWVudEZpZWxkVmFsdWUobGFuZy5nZXQoXCJub3RTaWduZWRfbXNnXCIpKVxuXHRcdH1cblxuXHRcdG0ucmVkcmF3KClcblx0fVxuXG5cdHByaXZhdGUgc2hvd1ByaWNlRGF0YSgpOiBib29sZWFuIHtcblx0XHRjb25zdCBpc0FwcFN0b3JlUGF5bWVudCA9IHRoaXMuX2FjY291bnRpbmdJbmZvICYmIGdldFBheW1lbnRNZXRob2RUeXBlKHRoaXMuX2FjY291bnRpbmdJbmZvKSA9PT0gUGF5bWVudE1ldGhvZFR5cGUuQXBwU3RvcmVcblx0XHRyZXR1cm4gbG9jYXRvci5sb2dpbnMuZ2V0VXNlckNvbnRyb2xsZXIoKS5pc1BhaWRBY2NvdW50KCkgJiYgIWlzSU9TQXBwKCkgJiYgIWlzQXBwU3RvcmVQYXltZW50XG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIHVwZGF0ZVByaWNlSW5mbygpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRpZiAoIXRoaXMuc2hvd1ByaWNlRGF0YSgpKSB7XG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cblx0XHRjb25zdCBwcmljZVNlcnZpY2VSZXR1cm4gPSBhd2FpdCBsb2NhdG9yLmJvb2tpbmdGYWNhZGUuZ2V0Q3VycmVudFByaWNlKClcblx0XHRpZiAocHJpY2VTZXJ2aWNlUmV0dXJuLmN1cnJlbnRQcmljZVRoaXNQZXJpb2QgIT0gbnVsbCAmJiBwcmljZVNlcnZpY2VSZXR1cm4uY3VycmVudFByaWNlTmV4dFBlcmlvZCAhPSBudWxsKSB7XG5cdFx0XHRpZiAocHJpY2VTZXJ2aWNlUmV0dXJuLmN1cnJlbnRQcmljZVRoaXNQZXJpb2QucHJpY2UgIT09IHByaWNlU2VydmljZVJldHVybi5jdXJyZW50UHJpY2VOZXh0UGVyaW9kLnByaWNlKSB7XG5cdFx0XHRcdHRoaXMuX2N1cnJlbnRQcmljZUZpZWxkVmFsdWUoZm9ybWF0UHJpY2VEYXRhV2l0aEluZm8ocHJpY2VTZXJ2aWNlUmV0dXJuLmN1cnJlbnRQcmljZVRoaXNQZXJpb2QpKVxuXG5cdFx0XHRcdHRoaXMuX25leHRQcmljZUZpZWxkVmFsdWUoZm9ybWF0UHJpY2VEYXRhV2l0aEluZm8obmV2ZXJOdWxsKHByaWNlU2VydmljZVJldHVybi5jdXJyZW50UHJpY2VOZXh0UGVyaW9kKSkpXG5cblx0XHRcdFx0dGhpcy5fbmV4dFBlcmlvZFByaWNlVmlzaWJsZSA9IHRydWVcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuX2N1cnJlbnRQcmljZUZpZWxkVmFsdWUoZm9ybWF0UHJpY2VEYXRhV2l0aEluZm8ocHJpY2VTZXJ2aWNlUmV0dXJuLmN1cnJlbnRQcmljZVRoaXNQZXJpb2QpKVxuXG5cdFx0XHRcdHRoaXMuX25leHRQZXJpb2RQcmljZVZpc2libGUgPSBmYWxzZVxuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLl9wZXJpb2RFbmREYXRlID0gcHJpY2VTZXJ2aWNlUmV0dXJuLnBlcmlvZEVuZERhdGVcblx0XHRcdG0ucmVkcmF3KClcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIHVwZGF0ZUFjY291bnRJbmZvRGF0YShhY2NvdW50aW5nSW5mbzogQWNjb3VudGluZ0luZm8pIHtcblx0XHR0aGlzLl9hY2NvdW50aW5nSW5mbyA9IGFjY291bnRpbmdJbmZvXG5cblx0XHR0aGlzLl9zZWxlY3RlZFN1YnNjcmlwdGlvbkludGVydmFsKGFzUGF5bWVudEludGVydmFsKGFjY291bnRpbmdJbmZvLnBheW1lbnRJbnRlcnZhbCkpXG5cblx0XHRtLnJlZHJhdygpXG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIHVwZGF0ZVN1YnNjcmlwdGlvbkZpZWxkKCkge1xuXHRcdGNvbnN0IHVzZXJDb250cm9sbGVyID0gbG9jYXRvci5sb2dpbnMuZ2V0VXNlckNvbnRyb2xsZXIoKVxuXHRcdGNvbnN0IGFjY291bnRUeXBlOiBBY2NvdW50VHlwZSA9IGRvd25jYXN0KHVzZXJDb250cm9sbGVyLnVzZXIuYWNjb3VudFR5cGUpXG5cdFx0Y29uc3QgcGxhblR5cGUgPSBhd2FpdCB1c2VyQ29udHJvbGxlci5nZXRQbGFuVHlwZSgpXG5cblx0XHR0aGlzLl9zdWJzY3JpcHRpb25GaWVsZFZhbHVlKF9nZXRBY2NvdW50VHlwZU5hbWUoYWNjb3VudFR5cGUsIHBsYW5UeXBlKSlcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgdXBkYXRlQm9va2luZ3MoKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3QgdXNlckNvbnRyb2xsZXIgPSBsb2NhdG9yLmxvZ2lucy5nZXRVc2VyQ29udHJvbGxlcigpXG5cblx0XHRjb25zdCBjdXN0b21lciA9IGF3YWl0IHVzZXJDb250cm9sbGVyLmxvYWRDdXN0b21lcigpXG5cdFx0bGV0IGN1c3RvbWVySW5mbzogQ3VzdG9tZXJJbmZvXG5cdFx0dHJ5IHtcblx0XHRcdGN1c3RvbWVySW5mbyA9IGF3YWl0IHVzZXJDb250cm9sbGVyLmxvYWRDdXN0b21lckluZm8oKVxuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdGlmIChlIGluc3RhbmNlb2YgTm90Rm91bmRFcnJvcikge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcImNvdWxkIG5vdCB1cGRhdGUgYm9va2luZ3MgYXMgY3VzdG9tZXIgaW5mbyBkb2VzIG5vdCBleGlzdCAobW92ZWQgYmV0d2VlbiBmcmVlL3ByZW1pdW0gbGlzdHMpXCIpXG5cdFx0XHRcdHJldHVyblxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhyb3cgZVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMuX2N1c3RvbWVySW5mbyA9IGN1c3RvbWVySW5mb1xuXHRcdGNvbnN0IGJvb2tpbmdzID0gYXdhaXQgbG9jYXRvci5lbnRpdHlDbGllbnQubG9hZFJhbmdlKEJvb2tpbmdUeXBlUmVmLCBuZXZlck51bGwoY3VzdG9tZXJJbmZvLmJvb2tpbmdzKS5pdGVtcywgR0VORVJBVEVEX01BWF9JRCwgMSwgdHJ1ZSlcblx0XHR0aGlzLl9sYXN0Qm9va2luZyA9IGJvb2tpbmdzLmxlbmd0aCA+IDAgPyBib29raW5nc1tib29raW5ncy5sZW5ndGggLSAxXSA6IG51bGxcblx0XHR0aGlzLl9jdXN0b21lciA9IGN1c3RvbWVyXG5cdFx0dGhpcy5jdXJyZW50UGxhblR5cGUgPSBhd2FpdCB1c2VyQ29udHJvbGxlci5nZXRQbGFuVHlwZSgpXG5cblx0XHRjb25zdCBwbGFuQ29uZmlnID0gYXdhaXQgdXNlckNvbnRyb2xsZXIuZ2V0UGxhbkNvbmZpZygpXG5cdFx0YXdhaXQgdGhpcy51cGRhdGVTdWJzY3JpcHRpb25GaWVsZCgpXG5cblx0XHRhd2FpdCBQcm9taXNlLmFsbChbXG5cdFx0XHR0aGlzLnVwZGF0ZVVzZXJGaWVsZCgpLFxuXHRcdFx0dGhpcy51cGRhdGVTdG9yYWdlRmllbGQoY3VzdG9tZXIsIGN1c3RvbWVySW5mbyksXG5cdFx0XHR0aGlzLnVwZGF0ZUFsaWFzRmllbGQoKSxcblx0XHRcdHRoaXMudXBkYXRlR3JvdXBzRmllbGQoKSxcblx0XHRcdHRoaXMudXBkYXRlV2hpdGVsYWJlbEZpZWxkKHBsYW5Db25maWcpLFxuXHRcdFx0dGhpcy51cGRhdGVTaGFyaW5nRmllbGQocGxhbkNvbmZpZyksXG5cdFx0XHR0aGlzLnVwZGF0ZUV2ZW50SW52aXRlc0ZpZWxkKHBsYW5Db25maWcpLFxuXHRcdFx0dGhpcy51cGRhdGVBdXRvUmVzcG9uZGVyRmllbGQocGxhbkNvbmZpZyksXG5cdFx0XSlcblx0XHRtLnJlZHJhdygpXG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIHVwZGF0ZVVzZXJGaWVsZCgpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHR0aGlzLl91c2Vyc0ZpZWxkVmFsdWUoXCJcIiArIE1hdGgubWF4KDEsIGdldEN1cnJlbnRDb3VudChCb29raW5nSXRlbUZlYXR1cmVUeXBlLkxlZ2FjeVVzZXJzLCB0aGlzLl9sYXN0Qm9va2luZykpKVxuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyB1cGRhdGVTdG9yYWdlRmllbGQoY3VzdG9tZXI6IEN1c3RvbWVyLCBjdXN0b21lckluZm86IEN1c3RvbWVySW5mbyk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IHVzZWRTdG9yYWdlID0gYXdhaXQgbG9jYXRvci5jdXN0b21lckZhY2FkZS5yZWFkVXNlZEN1c3RvbWVyU3RvcmFnZShnZXRFdElkKGN1c3RvbWVyKSlcblx0XHRjb25zdCB1c2VkU3RvcmFnZUZvcm1hdHRlZCA9IGZvcm1hdFN0b3JhZ2VTaXplKE51bWJlcih1c2VkU3RvcmFnZSkpXG5cdFx0Y29uc3QgdG90YWxTdG9yYWdlRm9ybWF0dGVkID0gZm9ybWF0U3RvcmFnZVNpemUoZ2V0VG90YWxTdG9yYWdlQ2FwYWNpdHlQZXJDdXN0b21lcihjdXN0b21lciwgY3VzdG9tZXJJbmZvLCB0aGlzLl9sYXN0Qm9va2luZykgKiBDb25zdC5NRU1PUllfR0JfRkFDVE9SKVxuXG5cdFx0dGhpcy5fc3RvcmFnZUZpZWxkVmFsdWUoXG5cdFx0XHRsYW5nLmdldChcImFtb3VudFVzZWRPZl9sYWJlbFwiLCB7XG5cdFx0XHRcdFwie2Ftb3VudH1cIjogdXNlZFN0b3JhZ2VGb3JtYXR0ZWQsXG5cdFx0XHRcdFwie3RvdGFsQW1vdW50fVwiOiB0b3RhbFN0b3JhZ2VGb3JtYXR0ZWQsXG5cdFx0XHR9KSxcblx0XHQpXG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIHVwZGF0ZUFsaWFzRmllbGQoKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Ly8gd2UgcGFzcyBpbiB0aGUgdXNlciBncm91cCBpZCBoZXJlIGV2ZW4gdGhvdWdoIGZvciBsZWdhY3kgcGxhbnMgdGhlIGlkIGlzIGlnbm9yZWRcblx0XHRjb25zdCBjb3VudGVycyA9IGF3YWl0IGxvY2F0b3IubWFpbEFkZHJlc3NGYWNhZGUuZ2V0QWxpYXNDb3VudGVycyhsb2NhdG9yLmxvZ2lucy5nZXRVc2VyQ29udHJvbGxlcigpLnVzZXIudXNlckdyb3VwLmdyb3VwKVxuXHRcdHRoaXMuX2VtYWlsQWxpYXNGaWVsZFZhbHVlKFxuXHRcdFx0bGFuZy5nZXQoXCJhbW91bnRVc2VkQW5kQWN0aXZhdGVkT2ZfbGFiZWxcIiwge1xuXHRcdFx0XHRcInt1c2VkfVwiOiBjb3VudGVycy51c2VkQWxpYXNlcyxcblx0XHRcdFx0XCJ7YWN0aXZlfVwiOiBjb3VudGVycy5lbmFibGVkQWxpYXNlcyxcblx0XHRcdFx0XCJ7dG90YWxBbW91bnR9XCI6IGNvdW50ZXJzLnRvdGFsQWxpYXNlcyxcblx0XHRcdH0pLFxuXHRcdClcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgdXBkYXRlR3JvdXBzRmllbGQoKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3Qgc2hhcmVkTWFpbENvdW50ID0gZ2V0Q3VycmVudENvdW50KEJvb2tpbmdJdGVtRmVhdHVyZVR5cGUuU2hhcmVkTWFpbEdyb3VwLCB0aGlzLl9sYXN0Qm9va2luZylcblx0XHQvLyBQbHVyYWwgZm9ybXMgYW5kIG51bWJlciBwbGFjZW1lbnQgaW5zaWRlIHRoZSBzdHJpbmcgc2hvdWxkIGJlIGhhbmRsZWQgYnkgdGhlIHRyYW5zbGF0aW9uIGZyYW1ld29yaywgYnV0IHRoaXMgaXMgd2hhdCB3ZSBnb3Qgbm93LlxuXHRcdGNvbnN0IHNoYXJlZE1haWxUZXh0ID0gc2hhcmVkTWFpbENvdW50ICsgXCIgXCIgKyBsYW5nLmdldChzaGFyZWRNYWlsQ291bnQgPT09IDEgPyBcInNoYXJlZE1haWxib3hfbGFiZWxcIiA6IFwic2hhcmVkTWFpbGJveGVzX2xhYmVsXCIpXG5cdFx0dGhpcy5fZ3JvdXBzRmllbGRWYWx1ZShzaGFyZWRNYWlsVGV4dClcblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgdXBkYXRlV2hpdGVsYWJlbEZpZWxkKHBsYW5Db25maWc6IFBsYW5Db25maWd1cmF0aW9uKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0aWYgKGlzV2hpdGVsYWJlbEFjdGl2ZSh0aGlzLl9sYXN0Qm9va2luZywgcGxhbkNvbmZpZykpIHtcblx0XHRcdHRoaXMuX3doaXRlbGFiZWxGaWVsZFZhbHVlKGxhbmcuZ2V0KFwiYWN0aXZlX2xhYmVsXCIpKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl93aGl0ZWxhYmVsRmllbGRWYWx1ZShsYW5nLmdldChcImRlYWN0aXZhdGVkX2xhYmVsXCIpKVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgdXBkYXRlU2hhcmluZ0ZpZWxkKHBsYW5Db25maWc6IFBsYW5Db25maWd1cmF0aW9uKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0aWYgKGlzU2hhcmluZ0FjdGl2ZSh0aGlzLl9sYXN0Qm9va2luZywgcGxhbkNvbmZpZykpIHtcblx0XHRcdHRoaXMuX3NoYXJpbmdGaWVsZFZhbHVlKGxhbmcuZ2V0KFwiYWN0aXZlX2xhYmVsXCIpKVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9zaGFyaW5nRmllbGRWYWx1ZShsYW5nLmdldChcImRlYWN0aXZhdGVkX2xhYmVsXCIpKVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgYXN5bmMgdXBkYXRlRXZlbnRJbnZpdGVzRmllbGQocGxhbkNvbmZpZzogUGxhbkNvbmZpZ3VyYXRpb24pOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRpZiAoIXRoaXMuX2N1c3RvbWVyKSB7XG5cdFx0XHR0aGlzLl9ldmVudEludml0ZXNGaWVsZFZhbHVlKFwiXCIpXG5cdFx0fSBlbHNlIGlmIChpc0V2ZW50SW52aXRlc0FjdGl2ZSh0aGlzLl9sYXN0Qm9va2luZywgcGxhbkNvbmZpZykpIHtcblx0XHRcdHRoaXMuX2V2ZW50SW52aXRlc0ZpZWxkVmFsdWUobGFuZy5nZXQoXCJhY3RpdmVfbGFiZWxcIikpXG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX2V2ZW50SW52aXRlc0ZpZWxkVmFsdWUobGFuZy5nZXQoXCJkZWFjdGl2YXRlZF9sYWJlbFwiKSlcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIHVwZGF0ZUF1dG9SZXNwb25kZXJGaWVsZChwbGFuQ29uZmlnOiBQbGFuQ29uZmlndXJhdGlvbik6IFByb21pc2U8dm9pZD4ge1xuXHRcdGlmICghdGhpcy5fY3VzdG9tZXIpIHtcblx0XHRcdHRoaXMuX2F1dG9SZXNwb25kZXJGaWVsZFZhbHVlKFwiXCIpXG5cdFx0fSBlbHNlIGlmIChpc0F1dG9SZXNwb25kZXJBY3RpdmUodGhpcy5fbGFzdEJvb2tpbmcsIHBsYW5Db25maWcpKSB7XG5cdFx0XHR0aGlzLl9hdXRvUmVzcG9uZGVyRmllbGRWYWx1ZShsYW5nLmdldChcImFjdGl2ZV9sYWJlbFwiKSlcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5fYXV0b1Jlc3BvbmRlckZpZWxkVmFsdWUobGFuZy5nZXQoXCJkZWFjdGl2YXRlZF9sYWJlbFwiKSlcblx0XHR9XG5cdH1cblxuXHRhc3luYyBlbnRpdHlFdmVudHNSZWNlaXZlZCh1cGRhdGVzOiBSZWFkb25seUFycmF5PEVudGl0eVVwZGF0ZURhdGE+KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0YXdhaXQgcHJvbWlzZU1hcCh1cGRhdGVzLCAodXBkYXRlKSA9PiB0aGlzLnByb2Nlc3NVcGRhdGUodXBkYXRlKSlcblx0fVxuXG5cdGFzeW5jIHByb2Nlc3NVcGRhdGUodXBkYXRlOiBFbnRpdHlVcGRhdGVEYXRhKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3QgeyBpbnN0YW5jZUxpc3RJZCwgaW5zdGFuY2VJZCB9ID0gdXBkYXRlXG5cblx0XHRpZiAoaXNVcGRhdGVGb3JUeXBlUmVmKEFjY291bnRpbmdJbmZvVHlwZVJlZiwgdXBkYXRlKSkge1xuXHRcdFx0Y29uc3QgYWNjb3VudGluZ0luZm8gPSBhd2FpdCBsb2NhdG9yLmVudGl0eUNsaWVudC5sb2FkKEFjY291bnRpbmdJbmZvVHlwZVJlZiwgaW5zdGFuY2VJZClcblx0XHRcdHRoaXMudXBkYXRlQWNjb3VudEluZm9EYXRhKGFjY291bnRpbmdJbmZvKVxuXHRcdFx0cmV0dXJuIGF3YWl0IHRoaXMudXBkYXRlUHJpY2VJbmZvKClcblx0XHR9IGVsc2UgaWYgKGlzVXBkYXRlRm9yVHlwZVJlZihVc2VyVHlwZVJlZiwgdXBkYXRlKSkge1xuXHRcdFx0YXdhaXQgdGhpcy51cGRhdGVCb29raW5ncygpXG5cdFx0XHRyZXR1cm4gYXdhaXQgdGhpcy51cGRhdGVQcmljZUluZm8oKVxuXHRcdH0gZWxzZSBpZiAoaXNVcGRhdGVGb3JUeXBlUmVmKEJvb2tpbmdUeXBlUmVmLCB1cGRhdGUpKSB7XG5cdFx0XHRhd2FpdCB0aGlzLnVwZGF0ZUJvb2tpbmdzKClcblx0XHRcdHJldHVybiBhd2FpdCB0aGlzLnVwZGF0ZVByaWNlSW5mbygpXG5cdFx0fSBlbHNlIGlmIChpc1VwZGF0ZUZvclR5cGVSZWYoQ3VzdG9tZXJUeXBlUmVmLCB1cGRhdGUpKSB7XG5cdFx0XHRjb25zdCBjdXN0b21lciA9IGF3YWl0IGxvY2F0b3IuZW50aXR5Q2xpZW50LmxvYWQoQ3VzdG9tZXJUeXBlUmVmLCBpbnN0YW5jZUlkKVxuXHRcdFx0cmV0dXJuIGF3YWl0IHRoaXMudXBkYXRlQ3VzdG9tZXJEYXRhKGN1c3RvbWVyKVxuXHRcdH0gZWxzZSBpZiAoaXNVcGRhdGVGb3JUeXBlUmVmKEN1c3RvbWVySW5mb1R5cGVSZWYsIHVwZGF0ZSkpIHtcblx0XHRcdC8vIG5lZWRlZCB0byB1cGRhdGUgdGhlIGRpc3BsYXllZCBwbGFuXG5cdFx0XHRhd2FpdCB0aGlzLnVwZGF0ZUJvb2tpbmdzKClcblx0XHRcdHJldHVybiBhd2FpdCB0aGlzLnVwZGF0ZVByaWNlSW5mbygpXG5cdFx0fSBlbHNlIGlmIChpc1VwZGF0ZUZvclR5cGVSZWYoR2lmdENhcmRUeXBlUmVmLCB1cGRhdGUpKSB7XG5cdFx0XHRjb25zdCBnaWZ0Q2FyZCA9IGF3YWl0IGxvY2F0b3IuZW50aXR5Q2xpZW50LmxvYWQoR2lmdENhcmRUeXBlUmVmLCBbaW5zdGFuY2VMaXN0SWQsIGluc3RhbmNlSWRdKVxuXHRcdFx0dGhpcy5fZ2lmdENhcmRzLnNldChlbGVtZW50SWRQYXJ0KGdpZnRDYXJkLl9pZCksIGdpZnRDYXJkKVxuXHRcdFx0aWYgKHVwZGF0ZS5vcGVyYXRpb24gPT09IE9wZXJhdGlvblR5cGUuQ1JFQVRFKSB0aGlzLl9naWZ0Q2FyZHNFeHBhbmRlZCh0cnVlKVxuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgcmVuZGVySW50ZXJ2YWxzKCkge1xuXHRcdGNvbnN0IGlzQXBwU3RvcmVQYXltZW50ID0gdGhpcy5fYWNjb3VudGluZ0luZm8gJiYgZ2V0UGF5bWVudE1ldGhvZFR5cGUodGhpcy5fYWNjb3VudGluZ0luZm8pID09PSBQYXltZW50TWV0aG9kVHlwZS5BcHBTdG9yZVxuXHRcdGlmIChpc0lPU0FwcCgpIHx8IGlzQXBwU3RvcmVQYXltZW50KSB7XG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cblx0XHRjb25zdCBzdWJzY3JpcHRpb25QZXJpb2RzOiBTZWxlY3Rvckl0ZW1MaXN0PFBheW1lbnRJbnRlcnZhbCB8IG51bGw+ID0gW1xuXHRcdFx0e1xuXHRcdFx0XHRuYW1lOiBsYW5nLmdldChcInByaWNpbmcueWVhcmx5X2xhYmVsXCIpLFxuXHRcdFx0XHR2YWx1ZTogUGF5bWVudEludGVydmFsLlllYXJseSxcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdG5hbWU6IGxhbmcuZ2V0KFwicHJpY2luZy5tb250aGx5X2xhYmVsXCIpLFxuXHRcdFx0XHR2YWx1ZTogUGF5bWVudEludGVydmFsLk1vbnRobHksXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRuYW1lOiBsYW5nLmdldChcImxvYWRpbmdfbXNnXCIpLFxuXHRcdFx0XHR2YWx1ZTogbnVsbCxcblx0XHRcdFx0c2VsZWN0YWJsZTogZmFsc2UsXG5cdFx0XHR9LFxuXHRcdF1cblxuXHRcdGNvbnN0IGJvbnVzTW9udGhzID0gdGhpcy5fbGFzdEJvb2tpbmcgPyBOdW1iZXIodGhpcy5fbGFzdEJvb2tpbmcuYm9udXNNb250aCkgOiAwXG5cdFx0cmV0dXJuIFtcblx0XHRcdG0oRHJvcERvd25TZWxlY3Rvciwge1xuXHRcdFx0XHRsYWJlbDogXCJwYXltZW50SW50ZXJ2YWxfbGFiZWxcIixcblx0XHRcdFx0aGVscExhYmVsOiAoKSA9PiB0aGlzLmdldENoYXJnZURhdGVUZXh0KCksXG5cdFx0XHRcdGl0ZW1zOiBzdWJzY3JpcHRpb25QZXJpb2RzLFxuXHRcdFx0XHRzZWxlY3RlZFZhbHVlOiB0aGlzLl9zZWxlY3RlZFN1YnNjcmlwdGlvbkludGVydmFsKCksXG5cdFx0XHRcdGRyb3Bkb3duV2lkdGg6IDMwMCxcblx0XHRcdFx0c2VsZWN0aW9uQ2hhbmdlZEhhbmRsZXI6ICh2YWx1ZTogbnVtYmVyKSA9PiB7XG5cdFx0XHRcdFx0aWYgKHRoaXMuX2FjY291bnRpbmdJbmZvKSB7XG5cdFx0XHRcdFx0XHRzaG93Q2hhbmdlU3Vic2NyaXB0aW9uSW50ZXJ2YWxEaWFsb2codGhpcy5fYWNjb3VudGluZ0luZm8sIHZhbHVlLCB0aGlzLl9wZXJpb2RFbmREYXRlKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdH0pLFxuXHRcdFx0Ym9udXNNb250aHMgPT09IDBcblx0XHRcdFx0PyBudWxsXG5cdFx0XHRcdDogbShUZXh0RmllbGQsIHtcblx0XHRcdFx0XHRcdGxhYmVsOiBcImJvbnVzX2xhYmVsXCIsXG5cdFx0XHRcdFx0XHR2YWx1ZTogbGFuZy5nZXQoXCJib251c01vbnRoX21zZ1wiLCB7IFwie21vbnRoc31cIjogYm9udXNNb250aHMgfSksXG5cdFx0XHRcdFx0XHRpc1JlYWRPbmx5OiB0cnVlLFxuXHRcdFx0XHQgIH0pLFxuXHRcdFx0bShUZXh0RmllbGQsIHtcblx0XHRcdFx0bGFiZWw6XG5cdFx0XHRcdFx0dGhpcy5fbmV4dFBlcmlvZFByaWNlVmlzaWJsZSAmJiB0aGlzLl9wZXJpb2RFbmREYXRlXG5cdFx0XHRcdFx0XHQ/IGxhbmcuZ2V0VHJhbnNsYXRpb24oXCJwcmljZVRpbGxfbGFiZWxcIiwge1xuXHRcdFx0XHRcdFx0XHRcdFwie2RhdGV9XCI6IGZvcm1hdERhdGUodGhpcy5fcGVyaW9kRW5kRGF0ZSksXG5cdFx0XHRcdFx0XHQgIH0pXG5cdFx0XHRcdFx0XHQ6IFwicHJpY2VfbGFiZWxcIixcblx0XHRcdFx0dmFsdWU6IHRoaXMuX2N1cnJlbnRQcmljZUZpZWxkVmFsdWUoKSxcblx0XHRcdFx0b25pbnB1dDogdGhpcy5fY3VycmVudFByaWNlRmllbGRWYWx1ZSxcblx0XHRcdFx0aXNSZWFkT25seTogdHJ1ZSxcblx0XHRcdFx0aGVscExhYmVsOiAoKSA9PiAodGhpcy5fY3VzdG9tZXIgJiYgdGhpcy5fY3VzdG9tZXIuYnVzaW5lc3NVc2UgPT09IHRydWUgPyBsYW5nLmdldChcInByaWNpbmcuc3Vic2NyaXB0aW9uUGVyaW9kSW5mb0J1c2luZXNzX21zZ1wiKSA6IG51bGwpLFxuXHRcdFx0fSksXG5cdFx0XVxuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJBZ3JlZW1lbnQoKSB7XG5cdFx0cmV0dXJuIG0oVGV4dEZpZWxkLCB7XG5cdFx0XHRsYWJlbDogXCJvcmRlclByb2Nlc3NpbmdBZ3JlZW1lbnRfbGFiZWxcIixcblx0XHRcdGhlbHBMYWJlbDogKCkgPT4gbGFuZy5nZXQoXCJvcmRlclByb2Nlc3NpbmdBZ3JlZW1lbnRJbmZvX21zZ1wiKSxcblx0XHRcdHZhbHVlOiB0aGlzLl9vcmRlckFncmVlbWVudEZpZWxkVmFsdWUoKSxcblx0XHRcdG9uaW5wdXQ6IHRoaXMuX29yZGVyQWdyZWVtZW50RmllbGRWYWx1ZSxcblx0XHRcdGlzUmVhZE9ubHk6IHRydWUsXG5cdFx0XHRpbmplY3Rpb25zUmlnaHQ6ICgpID0+IHtcblx0XHRcdFx0aWYgKHRoaXMuX29yZGVyQWdyZWVtZW50ICYmIHRoaXMuX2N1c3RvbWVyICYmIHRoaXMuX2N1c3RvbWVyLm9yZGVyUHJvY2Vzc2luZ0FncmVlbWVudE5lZWRlZCkge1xuXHRcdFx0XHRcdHJldHVybiBbdGhpcy5yZW5kZXJTaWduUHJvY2Vzc2luZ0FncmVlbWVudEFjdGlvbigpLCB0aGlzLnJlbmRlclNob3dQcm9jZXNzaW5nQWdyZWVtZW50QWN0aW9uKCldXG5cdFx0XHRcdH0gZWxzZSBpZiAodGhpcy5fb3JkZXJBZ3JlZW1lbnQpIHtcblx0XHRcdFx0XHRyZXR1cm4gW3RoaXMucmVuZGVyU2hvd1Byb2Nlc3NpbmdBZ3JlZW1lbnRBY3Rpb24oKV1cblx0XHRcdFx0fSBlbHNlIGlmICh0aGlzLl9jdXN0b21lciAmJiB0aGlzLl9jdXN0b21lci5vcmRlclByb2Nlc3NpbmdBZ3JlZW1lbnROZWVkZWQpIHtcblx0XHRcdFx0XHRyZXR1cm4gW3RoaXMucmVuZGVyU2lnblByb2Nlc3NpbmdBZ3JlZW1lbnRBY3Rpb24oKV1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gW11cblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHR9KVxuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJTaG93UHJvY2Vzc2luZ0FncmVlbWVudEFjdGlvbigpIHtcblx0XHRyZXR1cm4gbShJY29uQnV0dG9uLCB7XG5cdFx0XHR0aXRsZTogXCJzaG93X2FjdGlvblwiLFxuXHRcdFx0Y2xpY2s6ICgpID0+XG5cdFx0XHRcdGxvY2F0b3IuZW50aXR5Q2xpZW50XG5cdFx0XHRcdFx0LmxvYWQoR3JvdXBJbmZvVHlwZVJlZiwgbmV2ZXJOdWxsKHRoaXMuX29yZGVyQWdyZWVtZW50KS5zaWduZXJVc2VyR3JvdXBJbmZvKVxuXHRcdFx0XHRcdC50aGVuKChzaWduZXJVc2VyR3JvdXBJbmZvKSA9PiBTaWduT3JkZXJBZ3JlZW1lbnREaWFsb2cuc2hvd0ZvclZpZXdpbmcobmV2ZXJOdWxsKHRoaXMuX29yZGVyQWdyZWVtZW50KSwgc2lnbmVyVXNlckdyb3VwSW5mbykpLFxuXHRcdFx0aWNvbjogSWNvbnMuRG93bmxvYWQsXG5cdFx0XHRzaXplOiBCdXR0b25TaXplLkNvbXBhY3QsXG5cdFx0fSlcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyU2lnblByb2Nlc3NpbmdBZ3JlZW1lbnRBY3Rpb24oKSB7XG5cdFx0cmV0dXJuIG0oSWNvbkJ1dHRvbiwge1xuXHRcdFx0dGl0bGU6IFwic2lnbl9hY3Rpb25cIixcblx0XHRcdGNsaWNrOiAoKSA9PiBTaWduT3JkZXJBZ3JlZW1lbnREaWFsb2cuc2hvd0ZvclNpZ25pbmcobmV2ZXJOdWxsKHRoaXMuX2N1c3RvbWVyKSwgbmV2ZXJOdWxsKHRoaXMuX2FjY291bnRpbmdJbmZvKSksXG5cdFx0XHRpY29uOiBJY29ucy5FZGl0LFxuXHRcdFx0c2l6ZTogQnV0dG9uU2l6ZS5Db21wYWN0LFxuXHRcdH0pXG5cdH1cblxuXHRwcml2YXRlIGdldENoYXJnZURhdGVUZXh0KCk6IHN0cmluZyB7XG5cdFx0aWYgKHRoaXMuX3BlcmlvZEVuZERhdGUpIHtcblx0XHRcdGNvbnN0IGNoYXJnZURhdGUgPSBmb3JtYXREYXRlKGluY3JlbWVudERhdGUobmV3IERhdGUodGhpcy5fcGVyaW9kRW5kRGF0ZSksIDEpKVxuXHRcdFx0cmV0dXJuIGxhbmcuZ2V0KFwibmV4dENoYXJnZU9uX2xhYmVsXCIsIHsgXCJ7Y2hhcmdlRGF0ZX1cIjogY2hhcmdlRGF0ZSB9KVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gXCJcIlxuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBfZ2V0QWNjb3VudFR5cGVOYW1lKHR5cGU6IEFjY291bnRUeXBlLCBzdWJzY3JpcHRpb246IFBsYW5UeXBlKTogc3RyaW5nIHtcblx0aWYgKHR5cGUgPT09IEFjY291bnRUeXBlLlBBSUQpIHtcblx0XHRyZXR1cm4gZ2V0RGlzcGxheU5hbWVPZlBsYW5UeXBlKHN1YnNjcmlwdGlvbilcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gQWNjb3VudFR5cGVOYW1lc1t0eXBlXVxuXHR9XG59XG5cbmZ1bmN0aW9uIHNob3dDaGFuZ2VTdWJzY3JpcHRpb25JbnRlcnZhbERpYWxvZyhhY2NvdW50aW5nSW5mbzogQWNjb3VudGluZ0luZm8sIHBheW1lbnRJbnRlcnZhbDogUGF5bWVudEludGVydmFsLCBwZXJpb2RFbmREYXRlOiBEYXRlIHwgbnVsbCk6IHZvaWQge1xuXHRpZiAoYWNjb3VudGluZ0luZm8gJiYgYWNjb3VudGluZ0luZm8uaW52b2ljZUNvdW50cnkgJiYgYXNQYXltZW50SW50ZXJ2YWwoYWNjb3VudGluZ0luZm8ucGF5bWVudEludGVydmFsKSAhPT0gcGF5bWVudEludGVydmFsKSB7XG5cdFx0Y29uc3QgY29uZmlybWF0aW9uTWVzc2FnZSA9IHBlcmlvZEVuZERhdGVcblx0XHRcdD8gbGFuZy5nZXRUcmFuc2xhdGlvbihcInN1YnNjcmlwdGlvbkNoYW5nZVBlcmlvZF9tc2dcIiwge1xuXHRcdFx0XHRcdFwiezF9XCI6IGZvcm1hdERhdGUocGVyaW9kRW5kRGF0ZSksXG5cdFx0XHQgIH0pXG5cdFx0XHQ6IFwic3Vic2NyaXB0aW9uQ2hhbmdlX21zZ1wiXG5cblx0XHREaWFsb2cuY29uZmlybShjb25maXJtYXRpb25NZXNzYWdlKS50aGVuKGFzeW5jIChjb25maXJtZWQpID0+IHtcblx0XHRcdGlmIChjb25maXJtZWQpIHtcblx0XHRcdFx0YXdhaXQgbG9jYXRvci5jdXN0b21lckZhY2FkZS5jaGFuZ2VQYXltZW50SW50ZXJ2YWwoYWNjb3VudGluZ0luZm8sIHBheW1lbnRJbnRlcnZhbClcblx0XHRcdH1cblx0XHR9KVxuXHR9XG59XG5cbmZ1bmN0aW9uIHJlbmRlckdpZnRDYXJkVGFibGUoZ2lmdENhcmRzOiBHaWZ0Q2FyZFtdLCBpc1ByZW1pdW1QcmVkaWNhdGU6ICgpID0+IGJvb2xlYW4pOiBDaGlsZHJlbiB7XG5cdGNvbnN0IGFkZEJ1dHRvbkF0dHJzOiBJY29uQnV0dG9uQXR0cnMgPSB7XG5cdFx0dGl0bGU6IFwiYnV5R2lmdENhcmRfbGFiZWxcIixcblx0XHRjbGljazogY3JlYXRlTm90QXZhaWxhYmxlRm9yRnJlZUNsaWNrSGFuZGxlcihOZXdQYWlkUGxhbnMsICgpID0+IHNob3dQdXJjaGFzZUdpZnRDYXJkRGlhbG9nKCksIGlzUHJlbWl1bVByZWRpY2F0ZSksXG5cdFx0aWNvbjogSWNvbnMuQWRkLFxuXHRcdHNpemU6IEJ1dHRvblNpemUuQ29tcGFjdCxcblx0fVxuXHRjb25zdCBjb2x1bW5IZWFkaW5nOiBbVHJhbnNsYXRpb25LZXksIFRyYW5zbGF0aW9uS2V5XSA9IFtcInB1cmNoYXNlRGF0ZV9sYWJlbFwiLCBcInZhbHVlX2xhYmVsXCJdXG5cdGNvbnN0IGNvbHVtbldpZHRocyA9IFtDb2x1bW5XaWR0aC5MYXJnZXN0LCBDb2x1bW5XaWR0aC5TbWFsbCwgQ29sdW1uV2lkdGguU21hbGxdXG5cdGNvbnN0IGxpbmVzID0gZ2lmdENhcmRzXG5cdFx0LmZpbHRlcigoZ2lmdENhcmQpID0+IGdpZnRDYXJkLnN0YXR1cyA9PT0gR2lmdENhcmRTdGF0dXMuVXNhYmxlKVxuXHRcdC5tYXAoKGdpZnRDYXJkKSA9PiB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRjZWxsczogW2Zvcm1hdERhdGUoZ2lmdENhcmQub3JkZXJEYXRlKSwgZm9ybWF0UHJpY2UocGFyc2VGbG9hdChnaWZ0Q2FyZC52YWx1ZSksIHRydWUpXSxcblx0XHRcdFx0YWN0aW9uQnV0dG9uQXR0cnM6IGF0dGFjaERyb3Bkb3duKHtcblx0XHRcdFx0XHRtYWluQnV0dG9uQXR0cnM6IHtcblx0XHRcdFx0XHRcdHRpdGxlOiBcIm9wdGlvbnNfYWN0aW9uXCIsXG5cdFx0XHRcdFx0XHRpY29uOiBJY29ucy5Nb3JlLFxuXHRcdFx0XHRcdFx0c2l6ZTogQnV0dG9uU2l6ZS5Db21wYWN0LFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0Y2hpbGRBdHRyczogKCkgPT4gW1xuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRsYWJlbDogXCJ2aWV3X2xhYmVsXCIsXG5cdFx0XHRcdFx0XHRcdGNsaWNrOiAoKSA9PiBzaG93R2lmdENhcmRUb1NoYXJlKGdpZnRDYXJkKSxcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGxhYmVsOiBcImVkaXRfYWN0aW9uXCIsXG5cdFx0XHRcdFx0XHRcdGNsaWNrOiAoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0bGV0IG1lc3NhZ2UgPSBzdHJlYW0oZ2lmdENhcmQubWVzc2FnZSlcblx0XHRcdFx0XHRcdFx0XHREaWFsb2cuc2hvd0FjdGlvbkRpYWxvZyh7XG5cdFx0XHRcdFx0XHRcdFx0XHR0aXRsZTogXCJlZGl0TWVzc2FnZV9sYWJlbFwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y2hpbGQ6ICgpID0+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdG0oXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XCIuZmxleC1jZW50ZXJcIixcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRtKEdpZnRDYXJkTWVzc2FnZUVkaXRvckZpZWxkLCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRtZXNzYWdlOiBtZXNzYWdlKCksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRvbk1lc3NhZ2VDaGFuZ2VkOiBtZXNzYWdlLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0XHRcdFx0b2tBY3Rpb246IChkaWFsb2c6IERpYWxvZykgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRnaWZ0Q2FyZC5tZXNzYWdlID0gbWVzc2FnZSgpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGxvY2F0b3IuZW50aXR5Q2xpZW50XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0LnVwZGF0ZShnaWZ0Q2FyZClcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQudGhlbigoKSA9PiBkaWFsb2cuY2xvc2UoKSlcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQuY2F0Y2goKCkgPT4gRGlhbG9nLm1lc3NhZ2UoXCJnaWZ0Q2FyZFVwZGF0ZUVycm9yX21zZ1wiKSlcblx0XHRcdFx0XHRcdFx0XHRcdFx0c2hvd0dpZnRDYXJkVG9TaGFyZShnaWZ0Q2FyZClcblx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0XHRva0FjdGlvblRleHRJZDogXCJzYXZlX2FjdGlvblwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0dHlwZTogRGlhbG9nVHlwZS5FZGl0U21hbGwsXG5cdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XSxcblx0XHRcdFx0fSksXG5cdFx0XHR9XG5cdFx0fSlcblx0cmV0dXJuIFtcblx0XHRtKFRhYmxlLCB7XG5cdFx0XHRhZGRCdXR0b25BdHRycyxcblx0XHRcdGNvbHVtbkhlYWRpbmcsXG5cdFx0XHRjb2x1bW5XaWR0aHMsXG5cdFx0XHRsaW5lcyxcblx0XHRcdHNob3dBY3Rpb25CdXR0b25Db2x1bW46IHRydWUsXG5cdFx0fSksXG5cdFx0bShcIi5zbWFsbFwiLCByZW5kZXJUZXJtc0FuZENvbmRpdGlvbnNCdXR0b24oVGVybXNTZWN0aW9uLkdpZnRDYXJkcywgQ1VSUkVOVF9HSUZUX0NBUkRfVEVSTVNfVkVSU0lPTikpLFxuXHRdXG59XG4iLCJpbXBvcnQgbSBmcm9tIFwibWl0aHJpbFwiXG5pbXBvcnQgeyBEaWFsb2cgfSBmcm9tIFwiLi4vZ3VpL2Jhc2UvRGlhbG9nXCJcbmltcG9ydCB7IGxhbmcsIE1heWJlVHJhbnNsYXRpb24gfSBmcm9tIFwiLi4vbWlzYy9MYW5ndWFnZVZpZXdNb2RlbFwiXG5pbXBvcnQgeyBCdXR0b25UeXBlIH0gZnJvbSBcIi4uL2d1aS9iYXNlL0J1dHRvbi5qc1wiXG5pbXBvcnQgeyBBY2NvdW50aW5nSW5mbywgQm9va2luZywgY3JlYXRlU3VydmV5RGF0YSwgY3JlYXRlU3dpdGNoQWNjb3VudFR5cGVQb3N0SW4sIEN1c3RvbWVyLCBDdXN0b21lckluZm8sIFN1cnZleURhdGEgfSBmcm9tIFwiLi4vYXBpL2VudGl0aWVzL3N5cy9UeXBlUmVmcy5qc1wiXG5pbXBvcnQge1xuXHRBY2NvdW50VHlwZSxcblx0QXZhaWxhYmxlUGxhblR5cGUsXG5cdEJvb2tpbmdGYWlsdXJlUmVhc29uLFxuXHRDb25zdCxcblx0Z2V0UGF5bWVudE1ldGhvZFR5cGUsXG5cdEludm9pY2VEYXRhLFxuXHRLZXlzLFxuXHRMZWdhY3lQbGFucyxcblx0TmV3QnVzaW5lc3NQbGFucyxcblx0UGF5bWVudE1ldGhvZFR5cGUsXG5cdFBsYW5UeXBlLFxuXHRQbGFuVHlwZVRvTmFtZSxcblx0VW5zdWJzY3JpYmVGYWlsdXJlUmVhc29uLFxufSBmcm9tIFwiLi4vYXBpL2NvbW1vbi9UdXRhbm90YUNvbnN0YW50c1wiXG5pbXBvcnQgeyBTdWJzY3JpcHRpb25BY3Rpb25CdXR0b25zLCBTdWJzY3JpcHRpb25TZWxlY3RvciB9IGZyb20gXCIuL1N1YnNjcmlwdGlvblNlbGVjdG9yXCJcbmltcG9ydCBzdHJlYW0gZnJvbSBcIm1pdGhyaWwvc3RyZWFtXCJcbmltcG9ydCB7IHNob3dQcm9ncmVzc0RpYWxvZyB9IGZyb20gXCIuLi9ndWkvZGlhbG9ncy9Qcm9ncmVzc0RpYWxvZ1wiXG5pbXBvcnQgeyBEaWFsb2dIZWFkZXJCYXJBdHRycyB9IGZyb20gXCIuLi9ndWkvYmFzZS9EaWFsb2dIZWFkZXJCYXJcIlxuaW1wb3J0IHR5cGUgeyBDdXJyZW50UGxhbkluZm8gfSBmcm9tIFwiLi9Td2l0Y2hTdWJzY3JpcHRpb25EaWFsb2dNb2RlbFwiXG5pbXBvcnQgeyBTd2l0Y2hTdWJzY3JpcHRpb25EaWFsb2dNb2RlbCB9IGZyb20gXCIuL1N3aXRjaFN1YnNjcmlwdGlvbkRpYWxvZ01vZGVsXCJcbmltcG9ydCB7IGxvY2F0b3IgfSBmcm9tIFwiLi4vYXBpL21haW4vQ29tbW9uTG9jYXRvclwiXG5pbXBvcnQgeyBTd2l0Y2hBY2NvdW50VHlwZVNlcnZpY2UgfSBmcm9tIFwiLi4vYXBpL2VudGl0aWVzL3N5cy9TZXJ2aWNlcy5qc1wiXG5pbXBvcnQgeyBCYWRSZXF1ZXN0RXJyb3IsIEludmFsaWREYXRhRXJyb3IsIFByZWNvbmRpdGlvbkZhaWxlZEVycm9yIH0gZnJvbSBcIi4uL2FwaS9jb21tb24vZXJyb3IvUmVzdEVycm9yLmpzXCJcbmltcG9ydCB7IEZlYXR1cmVMaXN0UHJvdmlkZXIgfSBmcm9tIFwiLi9GZWF0dXJlTGlzdFByb3ZpZGVyXCJcbmltcG9ydCB7IFBheW1lbnRJbnRlcnZhbCwgUHJpY2VBbmRDb25maWdQcm92aWRlciB9IGZyb20gXCIuL1ByaWNlVXRpbHNcIlxuaW1wb3J0IHsgYXNzZXJ0Tm90TnVsbCwgYmFzZTY0RXh0VG9CYXNlNjQsIGJhc2U2NFRvVWludDhBcnJheSwgZGVsYXksIGRvd25jYXN0LCBsYXp5IH0gZnJvbSBcIkB0dXRhby90dXRhbm90YS11dGlsc1wiXG5pbXBvcnQgeyBzaG93U3dpdGNoVG9CdXNpbmVzc0ludm9pY2VEYXRhRGlhbG9nIH0gZnJvbSBcIi4vU3dpdGNoVG9CdXNpbmVzc0ludm9pY2VEYXRhRGlhbG9nLmpzXCJcbmltcG9ydCB7IGdldEJ5QWJicmV2aWF0aW9uIH0gZnJvbSBcIi4uL2FwaS9jb21tb24vQ291bnRyeUxpc3QuanNcIlxuaW1wb3J0IHsgZm9ybWF0TmFtZUFuZEFkZHJlc3MgfSBmcm9tIFwiLi4vYXBpL2NvbW1vbi91dGlscy9Db21tb25Gb3JtYXR0ZXIuanNcIlxuaW1wb3J0IHsgTG9naW5CdXR0b25BdHRycyB9IGZyb20gXCIuLi9ndWkvYmFzZS9idXR0b25zL0xvZ2luQnV0dG9uLmpzXCJcbmltcG9ydCB7IHNob3dMZWF2aW5nVXNlclN1cnZleVdpemFyZCB9IGZyb20gXCIuL0xlYXZpbmdVc2VyU3VydmV5V2l6YXJkLmpzXCJcbmltcG9ydCB7IFNVUlZFWV9WRVJTSU9OX05VTUJFUiB9IGZyb20gXCIuL0xlYXZpbmdVc2VyU3VydmV5Q29uc3RhbnRzLmpzXCJcbmltcG9ydCB7IGlzSU9TQXBwIH0gZnJvbSBcIi4uL2FwaS9jb21tb24vRW52LmpzXCJcbmltcG9ydCB7IE1vYmlsZVBheW1lbnRTdWJzY3JpcHRpb25Pd25lcnNoaXAgfSBmcm9tIFwiLi4vbmF0aXZlL2NvbW1vbi9nZW5lcmF0ZWRpcGMvTW9iaWxlUGF5bWVudFN1YnNjcmlwdGlvbk93bmVyc2hpcC5qc1wiXG5pbXBvcnQgeyBzaG93TWFuYWdlVGhyb3VnaEFwcFN0b3JlRGlhbG9nIH0gZnJvbSBcIi4vUGF5bWVudFZpZXdlci5qc1wiXG5pbXBvcnQgeyBhcHBTdG9yZVBsYW5OYW1lLCBoYXNSdW5uaW5nQXBwU3RvcmVTdWJzY3JpcHRpb24gfSBmcm9tIFwiLi9TdWJzY3JpcHRpb25VdGlscy5qc1wiXG5pbXBvcnQgeyBNb2JpbGVQYXltZW50RXJyb3IgfSBmcm9tIFwiLi4vYXBpL2NvbW1vbi9lcnJvci9Nb2JpbGVQYXltZW50RXJyb3IuanNcIlxuaW1wb3J0IHsgbWFpbExvY2F0b3IgfSBmcm9tIFwiLi4vLi4vbWFpbC1hcHAvbWFpbExvY2F0b3JcIlxuaW1wb3J0IHsgY2xpZW50IH0gZnJvbSBcIi4uL21pc2MvQ2xpZW50RGV0ZWN0b3IuanNcIlxuaW1wb3J0IHsgU3Vic2NyaXB0aW9uQXBwIH0gZnJvbSBcIi4vU3Vic2NyaXB0aW9uVmlld2VyLmpzXCJcblxuLyoqXG4gKiBBbGxvd3MgY2FuY2VsbGluZyB0aGUgc3Vic2NyaXB0aW9uIChvbmx5IHByaXZhdGUgdXNlKSBhbmQgc3dpdGNoaW5nIHRoZSBzdWJzY3JpcHRpb24gdG8gYSBkaWZmZXJlbnQgcGFpZCBzdWJzY3JpcHRpb24uXG4gKiBOb3RlOiBPbmx5IHNob3duIGlmIHRoZSB1c2VyIGlzIGFscmVhZHkgYSBQcmVtaXVtIHVzZXIuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzaG93U3dpdGNoRGlhbG9nKFxuXHRjdXN0b21lcjogQ3VzdG9tZXIsXG5cdGN1c3RvbWVySW5mbzogQ3VzdG9tZXJJbmZvLFxuXHRhY2NvdW50aW5nSW5mbzogQWNjb3VudGluZ0luZm8sXG5cdGxhc3RCb29raW5nOiBCb29raW5nLFxuXHRhY2NlcHRlZFBsYW5zOiBBdmFpbGFibGVQbGFuVHlwZVtdLFxuXHRyZWFzb246IE1heWJlVHJhbnNsYXRpb24gfCBudWxsLFxuKTogUHJvbWlzZTx2b2lkPiB7XG5cdGlmIChoYXNSdW5uaW5nQXBwU3RvcmVTdWJzY3JpcHRpb24oYWNjb3VudGluZ0luZm8pICYmICFpc0lPU0FwcCgpKSB7XG5cdFx0YXdhaXQgc2hvd01hbmFnZVRocm91Z2hBcHBTdG9yZURpYWxvZygpXG5cdFx0cmV0dXJuXG5cdH1cblxuXHRjb25zdCBbZmVhdHVyZUxpc3RQcm92aWRlciwgcHJpY2VBbmRDb25maWdQcm92aWRlcl0gPSBhd2FpdCBzaG93UHJvZ3Jlc3NEaWFsb2coXG5cdFx0XCJwbGVhc2VXYWl0X21zZ1wiLFxuXHRcdFByb21pc2UuYWxsKFtcblx0XHRcdEZlYXR1cmVMaXN0UHJvdmlkZXIuZ2V0SW5pdGlhbGl6ZWRJbnN0YW5jZShsb2NhdG9yLmRvbWFpbkNvbmZpZ1Byb3ZpZGVyKCkuZ2V0Q3VycmVudERvbWFpbkNvbmZpZygpKSxcblx0XHRcdFByaWNlQW5kQ29uZmlnUHJvdmlkZXIuZ2V0SW5pdGlhbGl6ZWRJbnN0YW5jZShudWxsLCBsb2NhdG9yLnNlcnZpY2VFeGVjdXRvciwgbnVsbCksXG5cdFx0XSksXG5cdClcblx0Y29uc3QgbW9kZWwgPSBuZXcgU3dpdGNoU3Vic2NyaXB0aW9uRGlhbG9nTW9kZWwoY3VzdG9tZXIsIGFjY291bnRpbmdJbmZvLCBhd2FpdCBsb2NhdG9yLmxvZ2lucy5nZXRVc2VyQ29udHJvbGxlcigpLmdldFBsYW5UeXBlKCksIGxhc3RCb29raW5nKVxuXHRjb25zdCBjYW5jZWxBY3Rpb24gPSAoKSA9PiB7XG5cdFx0ZGlhbG9nLmNsb3NlKClcblx0fVxuXG5cdGNvbnN0IGhlYWRlckJhckF0dHJzOiBEaWFsb2dIZWFkZXJCYXJBdHRycyA9IHtcblx0XHRsZWZ0OiBbXG5cdFx0XHR7XG5cdFx0XHRcdGxhYmVsOiBcImNhbmNlbF9hY3Rpb25cIixcblx0XHRcdFx0Y2xpY2s6IGNhbmNlbEFjdGlvbixcblx0XHRcdFx0dHlwZTogQnV0dG9uVHlwZS5TZWNvbmRhcnksXG5cdFx0XHR9LFxuXHRcdF0sXG5cdFx0cmlnaHQ6IFtdLFxuXHRcdG1pZGRsZTogXCJzdWJzY3JpcHRpb25fbGFiZWxcIixcblx0fVxuXHRjb25zdCBjdXJyZW50UGxhbkluZm8gPSBtb2RlbC5jdXJyZW50UGxhbkluZm9cblx0Y29uc3QgYnVzaW5lc3NVc2UgPSBzdHJlYW0oY3VycmVudFBsYW5JbmZvLmJ1c2luZXNzVXNlKVxuXHRjb25zdCBwYXltZW50SW50ZXJ2YWwgPSBzdHJlYW0oUGF5bWVudEludGVydmFsLlllYXJseSkgLy8gYWx3YXlzIGRlZmF1bHQgdG8geWVhcmx5XG5cdGNvbnN0IG11bHRpcGxlVXNlcnNBbGxvd2VkID0gbW9kZWwubXVsdGlwbGVVc2Vyc1N0aWxsU3VwcG9ydGVkTGVnYWN5KClcblxuXHRjb25zdCBkaWFsb2c6IERpYWxvZyA9IERpYWxvZy5sYXJnZURpYWxvZyhoZWFkZXJCYXJBdHRycywge1xuXHRcdHZpZXc6ICgpID0+XG5cdFx0XHRtKFxuXHRcdFx0XHRcIi5wdFwiLFxuXHRcdFx0XHRtKFN1YnNjcmlwdGlvblNlbGVjdG9yLCB7XG5cdFx0XHRcdFx0b3B0aW9uczoge1xuXHRcdFx0XHRcdFx0YnVzaW5lc3NVc2UsXG5cdFx0XHRcdFx0XHRwYXltZW50SW50ZXJ2YWw6IHBheW1lbnRJbnRlcnZhbCxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHByaWNlSW5mb1RleHRJZDogcHJpY2VBbmRDb25maWdQcm92aWRlci5nZXRQcmljZUluZm9NZXNzYWdlKCksXG5cdFx0XHRcdFx0bXNnOiByZWFzb24sXG5cdFx0XHRcdFx0Ym94V2lkdGg6IDIzMCxcblx0XHRcdFx0XHRib3hIZWlnaHQ6IDI3MCxcblx0XHRcdFx0XHRhY2NlcHRlZFBsYW5zOiBhY2NlcHRlZFBsYW5zLFxuXHRcdFx0XHRcdGN1cnJlbnRQbGFuVHlwZTogY3VycmVudFBsYW5JbmZvLnBsYW5UeXBlLFxuXHRcdFx0XHRcdGFsbG93U3dpdGNoaW5nUGF5bWVudEludGVydmFsOiBjdXJyZW50UGxhbkluZm8ucGF5bWVudEludGVydmFsICE9PSBQYXltZW50SW50ZXJ2YWwuWWVhcmx5LFxuXHRcdFx0XHRcdGFjdGlvbkJ1dHRvbnM6IHN1YnNjcmlwdGlvbkFjdGlvbkJ1dHRvbnMsXG5cdFx0XHRcdFx0ZmVhdHVyZUxpc3RQcm92aWRlcjogZmVhdHVyZUxpc3RQcm92aWRlcixcblx0XHRcdFx0XHRwcmljZUFuZENvbmZpZ1Byb3ZpZGVyLFxuXHRcdFx0XHRcdG11bHRpcGxlVXNlcnNBbGxvd2VkLFxuXHRcdFx0XHR9KSxcblx0XHRcdCksXG5cdH0pXG5cdFx0LmFkZFNob3J0Y3V0KHtcblx0XHRcdGtleTogS2V5cy5FU0MsXG5cdFx0XHRleGVjOiBjYW5jZWxBY3Rpb24sXG5cdFx0XHRoZWxwOiBcImNsb3NlX2FsdFwiLFxuXHRcdH0pXG5cdFx0LnNldENsb3NlSGFuZGxlcihjYW5jZWxBY3Rpb24pXG5cdGNvbnN0IHN1YnNjcmlwdGlvbkFjdGlvbkJ1dHRvbnM6IFN1YnNjcmlwdGlvbkFjdGlvbkJ1dHRvbnMgPSB7XG5cdFx0W1BsYW5UeXBlLkZyZWVdOiAoKSA9PlxuXHRcdFx0KHtcblx0XHRcdFx0bGFiZWw6IFwicHJpY2luZy5zZWxlY3RfYWN0aW9uXCIsXG5cdFx0XHRcdG9uY2xpY2s6ICgpID0+IG9uU3dpdGNoVG9GcmVlKGN1c3RvbWVyLCBkaWFsb2csIGN1cnJlbnRQbGFuSW5mbyksXG5cdFx0XHR9IHNhdGlzZmllcyBMb2dpbkJ1dHRvbkF0dHJzKSxcblx0XHRbUGxhblR5cGUuUmV2b2x1dGlvbmFyeV06IGNyZWF0ZVBsYW5CdXR0b24oZGlhbG9nLCBQbGFuVHlwZS5SZXZvbHV0aW9uYXJ5LCBjdXJyZW50UGxhbkluZm8sIHBheW1lbnRJbnRlcnZhbCwgYWNjb3VudGluZ0luZm8pLFxuXHRcdFtQbGFuVHlwZS5MZWdlbmRdOiBjcmVhdGVQbGFuQnV0dG9uKGRpYWxvZywgUGxhblR5cGUuTGVnZW5kLCBjdXJyZW50UGxhbkluZm8sIHBheW1lbnRJbnRlcnZhbCwgYWNjb3VudGluZ0luZm8pLFxuXHRcdFtQbGFuVHlwZS5Fc3NlbnRpYWxdOiBjcmVhdGVQbGFuQnV0dG9uKGRpYWxvZywgUGxhblR5cGUuRXNzZW50aWFsLCBjdXJyZW50UGxhbkluZm8sIHBheW1lbnRJbnRlcnZhbCwgYWNjb3VudGluZ0luZm8pLFxuXHRcdFtQbGFuVHlwZS5BZHZhbmNlZF06IGNyZWF0ZVBsYW5CdXR0b24oZGlhbG9nLCBQbGFuVHlwZS5BZHZhbmNlZCwgY3VycmVudFBsYW5JbmZvLCBwYXltZW50SW50ZXJ2YWwsIGFjY291bnRpbmdJbmZvKSxcblx0XHRbUGxhblR5cGUuVW5saW1pdGVkXTogY3JlYXRlUGxhbkJ1dHRvbihkaWFsb2csIFBsYW5UeXBlLlVubGltaXRlZCwgY3VycmVudFBsYW5JbmZvLCBwYXltZW50SW50ZXJ2YWwsIGFjY291bnRpbmdJbmZvKSxcblx0fVxuXHRkaWFsb2cuc2hvdygpXG5cdHJldHVyblxufVxuXG5hc3luYyBmdW5jdGlvbiBvblN3aXRjaFRvRnJlZShjdXN0b21lcjogQ3VzdG9tZXIsIGRpYWxvZzogRGlhbG9nLCBjdXJyZW50UGxhbkluZm86IEN1cnJlbnRQbGFuSW5mbykge1xuXHRpZiAoaXNJT1NBcHAoKSkge1xuXHRcdC8vIFdlIHdhbnQgdGhlIHVzZXIgdG8gZGlzYWJsZSByZW5ld2FsIGluIEFwcFN0b3JlIGJlZm9yZSB0aGV5IHRyeSB0byBkb3duZ3JhZGUgb24gb3VyIHNpZGVcblx0XHRjb25zdCBvd25lcnNoaXAgPSBhd2FpdCBsb2NhdG9yLm1vYmlsZVBheW1lbnRzRmFjYWRlLnF1ZXJ5QXBwU3RvcmVTdWJzY3JpcHRpb25Pd25lcnNoaXAoYmFzZTY0VG9VaW50OEFycmF5KGJhc2U2NEV4dFRvQmFzZTY0KGN1c3RvbWVyLl9pZCkpKVxuXHRcdGlmIChvd25lcnNoaXAgPT09IE1vYmlsZVBheW1lbnRTdWJzY3JpcHRpb25Pd25lcnNoaXAuT3duZXIgJiYgKGF3YWl0IGxvY2F0b3IubW9iaWxlUGF5bWVudHNGYWNhZGUuaXNBcHBTdG9yZVJlbmV3YWxFbmFibGVkKCkpKSB7XG5cdFx0XHRhd2FpdCBsb2NhdG9yLm1vYmlsZVBheW1lbnRzRmFjYWRlLnNob3dTdWJzY3JpcHRpb25Db25maWdWaWV3KClcblxuXHRcdFx0YXdhaXQgc2hvd1Byb2dyZXNzRGlhbG9nKFwicGxlYXNlV2FpdF9tc2dcIiwgd2FpdFVudGlsUmVuZXdhbERpc2FibGVkKCkpXG5cblx0XHRcdGlmIChhd2FpdCBsb2NhdG9yLm1vYmlsZVBheW1lbnRzRmFjYWRlLmlzQXBwU3RvcmVSZW5ld2FsRW5hYmxlZCgpKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiQXBwU3RvcmUgcmVuZXdhbCBpcyBzdGlsbCBlbmFibGVkLCBjYW5jZWxpbmcgZG93bmdyYWRlXCIpXG5cdFx0XHRcdC8vIFVzZXIgcHJvYmFibHkgZGlkIG5vdCBkaXNhYmxlIHRoZSByZW5ld2FsIHN0aWxsLCBjYW5jZWxcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Y29uc3QgcmVhc29uID0gYXdhaXQgc2hvd0xlYXZpbmdVc2VyU3VydmV5V2l6YXJkKHRydWUsIHRydWUpXG5cdGNvbnN0IGRhdGEgPVxuXHRcdHJlYXNvbi5zdWJtaXR0ZWQgJiYgcmVhc29uLmNhdGVnb3J5ICYmIHJlYXNvbi5yZWFzb25cblx0XHRcdD8gY3JlYXRlU3VydmV5RGF0YSh7XG5cdFx0XHRcdFx0Y2F0ZWdvcnk6IHJlYXNvbi5jYXRlZ29yeSxcblx0XHRcdFx0XHRyZWFzb246IHJlYXNvbi5yZWFzb24sXG5cdFx0XHRcdFx0ZGV0YWlsczogcmVhc29uLmRldGFpbHMsXG5cdFx0XHRcdFx0dmVyc2lvbjogU1VSVkVZX1ZFUlNJT05fTlVNQkVSLFxuXHRcdFx0ICB9KVxuXHRcdFx0OiBudWxsXG5cdGNvbnN0IG5ld1BsYW5UeXBlID0gYXdhaXQgY2FuY2VsU3Vic2NyaXB0aW9uKGRpYWxvZywgY3VycmVudFBsYW5JbmZvLCBjdXN0b21lciwgZGF0YSlcblxuXHRpZiAobmV3UGxhblR5cGUgPT09IFBsYW5UeXBlLkZyZWUpIHtcblx0XHRmb3IgKGNvbnN0IGltcG9ydGVkTWFpbFNldCBvZiBtYWlsTG9jYXRvci5tYWlsTW9kZWwuZ2V0SW1wb3J0ZWRNYWlsU2V0cygpKSBtYWlsTG9jYXRvci5tYWlsTW9kZWwuZmluYWxseURlbGV0ZUN1c3RvbU1haWxGb2xkZXIoaW1wb3J0ZWRNYWlsU2V0KVxuXHR9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHdhaXRVbnRpbFJlbmV3YWxEaXNhYmxlZCgpIHtcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCAzOyBpKyspIHtcblx0XHQvLyBXYWl0IGEgYml0IGJlZm9yZSBjaGVja2luZywgaXQgdGFrZXMgYSBiaXQgdG8gcHJvcGFnYXRlXG5cdFx0YXdhaXQgZGVsYXkoMjAwMClcblx0XHRpZiAoIShhd2FpdCBsb2NhdG9yLm1vYmlsZVBheW1lbnRzRmFjYWRlLmlzQXBwU3RvcmVSZW5ld2FsRW5hYmxlZCgpKSkge1xuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXHR9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGRvU3dpdGNoVG9QYWlkUGxhbihcblx0YWNjb3VudGluZ0luZm86IEFjY291bnRpbmdJbmZvLFxuXHRuZXdQYXltZW50SW50ZXJ2YWw6IFBheW1lbnRJbnRlcnZhbCxcblx0dGFyZ2V0U3Vic2NyaXB0aW9uOiBQbGFuVHlwZSxcblx0ZGlhbG9nOiBEaWFsb2csXG5cdGN1cnJlbnRQbGFuSW5mbzogQ3VycmVudFBsYW5JbmZvLFxuKSB7XG5cdGlmIChpc0lPU0FwcCgpICYmIGdldFBheW1lbnRNZXRob2RUeXBlKGFjY291bnRpbmdJbmZvKSA9PT0gUGF5bWVudE1ldGhvZFR5cGUuQXBwU3RvcmUpIHtcblx0XHRjb25zdCBjdXN0b21lcklkQnl0ZXMgPSBiYXNlNjRUb1VpbnQ4QXJyYXkoYmFzZTY0RXh0VG9CYXNlNjQoYXNzZXJ0Tm90TnVsbChsb2NhdG9yLmxvZ2lucy5nZXRVc2VyQ29udHJvbGxlcigpLnVzZXIuY3VzdG9tZXIpKSlcblx0XHRkaWFsb2cuY2xvc2UoKVxuXHRcdHRyeSB7XG5cdFx0XHRhd2FpdCBsb2NhdG9yLm1vYmlsZVBheW1lbnRzRmFjYWRlLnJlcXVlc3RTdWJzY3JpcHRpb25Ub1BsYW4oYXBwU3RvcmVQbGFuTmFtZSh0YXJnZXRTdWJzY3JpcHRpb24pLCBuZXdQYXltZW50SW50ZXJ2YWwsIGN1c3RvbWVySWRCeXRlcylcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRpZiAoZSBpbnN0YW5jZW9mIE1vYmlsZVBheW1lbnRFcnJvcikge1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKFwiQXBwU3RvcmUgc3Vic2NyaXB0aW9uIGZhaWxlZFwiLCBlKVxuXHRcdFx0XHREaWFsb2cubWVzc2FnZShcImFwcFN0b3JlU3Vic2NyaXB0aW9uRXJyb3JfbXNnXCIsIGUubWVzc2FnZSlcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRocm93IGVcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0aWYgKGN1cnJlbnRQbGFuSW5mby5wYXltZW50SW50ZXJ2YWwgIT09IG5ld1BheW1lbnRJbnRlcnZhbCkge1xuXHRcdFx0YXdhaXQgbG9jYXRvci5jdXN0b21lckZhY2FkZS5jaGFuZ2VQYXltZW50SW50ZXJ2YWwoYWNjb3VudGluZ0luZm8sIG5ld1BheW1lbnRJbnRlcnZhbClcblx0XHR9XG5cdFx0YXdhaXQgc3dpdGNoU3Vic2NyaXB0aW9uKHRhcmdldFN1YnNjcmlwdGlvbiwgZGlhbG9nLCBjdXJyZW50UGxhbkluZm8pXG5cdH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlUGxhbkJ1dHRvbihcblx0ZGlhbG9nOiBEaWFsb2csXG5cdHRhcmdldFN1YnNjcmlwdGlvbjogUGxhblR5cGUsXG5cdGN1cnJlbnRQbGFuSW5mbzogQ3VycmVudFBsYW5JbmZvLFxuXHRuZXdQYXltZW50SW50ZXJ2YWw6IHN0cmVhbTxQYXltZW50SW50ZXJ2YWw+LFxuXHRhY2NvdW50aW5nSW5mbzogQWNjb3VudGluZ0luZm8sXG4pOiBsYXp5PExvZ2luQnV0dG9uQXR0cnM+IHtcblx0cmV0dXJuICgpID0+ICh7XG5cdFx0bGFiZWw6IFwiYnV5X2FjdGlvblwiLFxuXHRcdG9uY2xpY2s6IGFzeW5jICgpID0+IHtcblx0XHRcdC8vIFNob3cgYW4gZXh0cmEgZGlhbG9nIGluIHRoZSBjYXNlIHRoYXQgc29tZW9uZSBpcyB1cGdyYWRpbmcgZnJvbSBhIGxlZ2FjeSBwbGFuIHRvIGEgbmV3IHBsYW4gYmVjYXVzZSB0aGV5IGNhbid0IHJldmVydC5cblx0XHRcdGlmIChcblx0XHRcdFx0TGVnYWN5UGxhbnMuaW5jbHVkZXMoY3VycmVudFBsYW5JbmZvLnBsYW5UeXBlKSAmJlxuXHRcdFx0XHQhKGF3YWl0IERpYWxvZy5jb25maXJtKGxhbmcuZ2V0VHJhbnNsYXRpb24oXCJ1cGdyYWRlUGxhbl9tc2dcIiwgeyBcIntwbGFufVwiOiBQbGFuVHlwZVRvTmFtZVt0YXJnZXRTdWJzY3JpcHRpb25dIH0pKSlcblx0XHRcdCkge1xuXHRcdFx0XHRyZXR1cm5cblx0XHRcdH1cblx0XHRcdGF3YWl0IHNob3dQcm9ncmVzc0RpYWxvZyhcInBsZWFzZVdhaXRfbXNnXCIsIGRvU3dpdGNoVG9QYWlkUGxhbihhY2NvdW50aW5nSW5mbywgbmV3UGF5bWVudEludGVydmFsKCksIHRhcmdldFN1YnNjcmlwdGlvbiwgZGlhbG9nLCBjdXJyZW50UGxhbkluZm8pKVxuXHRcdH0sXG5cdH0pXG59XG5cbmZ1bmN0aW9uIGhhbmRsZVN3aXRjaEFjY291bnRQcmVjb25kaXRpb25GYWlsZWQoZTogUHJlY29uZGl0aW9uRmFpbGVkRXJyb3IpOiBQcm9taXNlPHZvaWQ+IHtcblx0Y29uc3QgcmVhc29uID0gZS5kYXRhXG5cblx0aWYgKHJlYXNvbiA9PSBudWxsKSB7XG5cdFx0cmV0dXJuIERpYWxvZy5tZXNzYWdlKFwidW5rbm93bkVycm9yX21zZ1wiKVxuXHR9IGVsc2Uge1xuXHRcdGxldCBkZXRhaWxNc2c6IHN0cmluZ1xuXG5cdFx0c3dpdGNoIChyZWFzb24pIHtcblx0XHRcdGNhc2UgVW5zdWJzY3JpYmVGYWlsdXJlUmVhc29uLlRPT19NQU5ZX0VOQUJMRURfVVNFUlM6XG5cdFx0XHRcdGRldGFpbE1zZyA9IGxhbmcuZ2V0KFwiYWNjb3VudFN3aXRjaFRvb01hbnlBY3RpdmVVc2Vyc19tc2dcIilcblx0XHRcdFx0YnJlYWtcblxuXHRcdFx0Y2FzZSBVbnN1YnNjcmliZUZhaWx1cmVSZWFzb24uQ1VTVE9NX01BSUxfQUREUkVTUzpcblx0XHRcdFx0ZGV0YWlsTXNnID0gbGFuZy5nZXQoXCJhY2NvdW50U3dpdGNoQ3VzdG9tTWFpbEFkZHJlc3NfbXNnXCIpXG5cdFx0XHRcdGJyZWFrXG5cblx0XHRcdGNhc2UgVW5zdWJzY3JpYmVGYWlsdXJlUmVhc29uLlRPT19NQU5ZX0NBTEVOREFSUzpcblx0XHRcdFx0ZGV0YWlsTXNnID0gbGFuZy5nZXQoXCJhY2NvdW50U3dpdGNoTXVsdGlwbGVDYWxlbmRhcnNfbXNnXCIpXG5cdFx0XHRcdGJyZWFrXG5cblx0XHRcdGNhc2UgVW5zdWJzY3JpYmVGYWlsdXJlUmVhc29uLkNBTEVOREFSX1RZUEU6XG5cdFx0XHRcdGRldGFpbE1zZyA9IGxhbmcuZ2V0KFwiYWNjb3VudFN3aXRjaFNoYXJlZENhbGVuZGFyX21zZ1wiKVxuXHRcdFx0XHRicmVha1xuXG5cdFx0XHRjYXNlIFVuc3Vic2NyaWJlRmFpbHVyZVJlYXNvbi5UT09fTUFOWV9BTElBU0VTOlxuXHRcdFx0Y2FzZSBCb29raW5nRmFpbHVyZVJlYXNvbi5UT09fTUFOWV9BTElBU0VTOlxuXHRcdFx0XHRkZXRhaWxNc2cgPSBsYW5nLmdldChcImFjY291bnRTd2l0Y2hBbGlhc2VzX21zZ1wiKVxuXHRcdFx0XHRicmVha1xuXG5cdFx0XHRjYXNlIFVuc3Vic2NyaWJlRmFpbHVyZVJlYXNvbi5UT09fTVVDSF9TVE9SQUdFX1VTRUQ6XG5cdFx0XHRjYXNlIEJvb2tpbmdGYWlsdXJlUmVhc29uLlRPT19NVUNIX1NUT1JBR0VfVVNFRDpcblx0XHRcdFx0ZGV0YWlsTXNnID0gbGFuZy5nZXQoXCJzdG9yYWdlQ2FwYWNpdHlUb29NYW55VXNlZEZvckJvb2tpbmdfbXNnXCIpXG5cdFx0XHRcdGJyZWFrXG5cblx0XHRcdGNhc2UgVW5zdWJzY3JpYmVGYWlsdXJlUmVhc29uLlRPT19NQU5ZX0RPTUFJTlM6XG5cdFx0XHRjYXNlIEJvb2tpbmdGYWlsdXJlUmVhc29uLlRPT19NQU5ZX0RPTUFJTlM6XG5cdFx0XHRcdGRldGFpbE1zZyA9IGxhbmcuZ2V0KFwidG9vTWFueUN1c3RvbURvbWFpbnNfbXNnXCIpXG5cdFx0XHRcdGJyZWFrXG5cblx0XHRcdGNhc2UgVW5zdWJzY3JpYmVGYWlsdXJlUmVhc29uLkhBU19URU1QTEFURV9HUk9VUDpcblx0XHRcdGNhc2UgQm9va2luZ0ZhaWx1cmVSZWFzb24uSEFTX1RFTVBMQVRFX0dST1VQOlxuXHRcdFx0XHRkZXRhaWxNc2cgPSBsYW5nLmdldChcImRlbGV0ZVRlbXBsYXRlR3JvdXBzX21zZ1wiKVxuXHRcdFx0XHRicmVha1xuXG5cdFx0XHRjYXNlIFVuc3Vic2NyaWJlRmFpbHVyZVJlYXNvbi5XSElURUxBQkVMX0RPTUFJTl9BQ1RJVkU6XG5cdFx0XHRjYXNlIEJvb2tpbmdGYWlsdXJlUmVhc29uLldISVRFTEFCRUxfRE9NQUlOX0FDVElWRTpcblx0XHRcdFx0ZGV0YWlsTXNnID0gbGFuZy5nZXQoXCJ3aGl0ZWxhYmVsRG9tYWluRXhpc3RpbmdfbXNnXCIpXG5cdFx0XHRcdGJyZWFrXG5cblx0XHRcdGNhc2UgVW5zdWJzY3JpYmVGYWlsdXJlUmVhc29uLkhBU19DT05UQUNUX0xJU1RfR1JPVVA6XG5cdFx0XHRcdGRldGFpbE1zZyA9IGxhbmcuZ2V0KFwiY29udGFjdExpc3RFeGlzdGluZ19tc2dcIilcblx0XHRcdFx0YnJlYWtcblxuXHRcdFx0Y2FzZSBVbnN1YnNjcmliZUZhaWx1cmVSZWFzb24uTk9UX0VOT1VHSF9DUkVESVQ6XG5cdFx0XHRcdHJldHVybiBEaWFsb2cubWVzc2FnZShcImluc3VmZmljaWVudEJhbGFuY2VFcnJvcl9tc2dcIilcblxuXHRcdFx0Y2FzZSBVbnN1YnNjcmliZUZhaWx1cmVSZWFzb24uSU5WT0lDRV9OT1RfUEFJRDpcblx0XHRcdFx0cmV0dXJuIERpYWxvZy5tZXNzYWdlKFwiaW52b2ljZU5vdFBhaWRTd2l0Y2hfbXNnXCIpXG5cblx0XHRcdGNhc2UgVW5zdWJzY3JpYmVGYWlsdXJlUmVhc29uLkFDVElWRV9BUFBTVE9SRV9TVUJTQ1JJUFRJT046XG5cdFx0XHRcdGlmIChpc0lPU0FwcCgpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGxvY2F0b3IubW9iaWxlUGF5bWVudHNGYWNhZGUuc2hvd1N1YnNjcmlwdGlvbkNvbmZpZ1ZpZXcoKVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiBzaG93TWFuYWdlVGhyb3VnaEFwcFN0b3JlRGlhbG9nKClcblx0XHRcdFx0fVxuXG5cdFx0XHRjYXNlIFVuc3Vic2NyaWJlRmFpbHVyZVJlYXNvbi5MQUJFTF9MSU1JVF9FWENFRURFRDpcblx0XHRcdFx0cmV0dXJuIERpYWxvZy5tZXNzYWdlKFwibGFiZWxMaW1pdEV4Y2VlZGVkX21zZ1wiKVxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0dGhyb3cgZVxuXHRcdH1cblxuXHRcdHJldHVybiBEaWFsb2cubWVzc2FnZShcblx0XHRcdGxhbmcuZ2V0VHJhbnNsYXRpb24oXCJhY2NvdW50U3dpdGNoTm90UG9zc2libGVfbXNnXCIsIHtcblx0XHRcdFx0XCJ7ZGV0YWlsTXNnfVwiOiBkZXRhaWxNc2csXG5cdFx0XHR9KSxcblx0XHQpXG5cdH1cbn1cblxuLyoqXG4gKiBAcGFyYW0gY3VzdG9tZXJcbiAqIEBwYXJhbSBjdXJyZW50UGxhbkluZm9cbiAqIEBwYXJhbSBzdXJ2ZXlEYXRhXG4gKiBAcmV0dXJucyB0aGUgbmV3IHBsYW4gdHlwZSBhZnRlciB0aGUgYXR0ZW1wdC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gdHJ5RG93bmdyYWRlUHJlbWl1bVRvRnJlZShjdXN0b21lcjogQ3VzdG9tZXIsIGN1cnJlbnRQbGFuSW5mbzogQ3VycmVudFBsYW5JbmZvLCBzdXJ2ZXlEYXRhOiBTdXJ2ZXlEYXRhIHwgbnVsbCk6IFByb21pc2U8UGxhblR5cGU+IHtcblx0Y29uc3Qgc3dpdGNoQWNjb3VudFR5cGVEYXRhID0gY3JlYXRlU3dpdGNoQWNjb3VudFR5cGVQb3N0SW4oe1xuXHRcdGFjY291bnRUeXBlOiBBY2NvdW50VHlwZS5GUkVFLFxuXHRcdGRhdGU6IENvbnN0LkNVUlJFTlRfREFURSxcblx0XHRjdXN0b21lcjogY3VzdG9tZXIuX2lkLFxuXHRcdHNwZWNpYWxQcmljZVVzZXJTaW5nbGU6IG51bGwsXG5cdFx0cmVmZXJyYWxDb2RlOiBudWxsLFxuXHRcdHBsYW46IFBsYW5UeXBlLkZyZWUsXG5cdFx0c3VydmV5RGF0YTogc3VydmV5RGF0YSxcblx0XHRhcHA6IGNsaWVudC5pc0NhbGVuZGFyQXBwKCkgPyBTdWJzY3JpcHRpb25BcHAuQ2FsZW5kYXIgOiBTdWJzY3JpcHRpb25BcHAuTWFpbCxcblx0fSlcblx0dHJ5IHtcblx0XHRhd2FpdCBsb2NhdG9yLnNlcnZpY2VFeGVjdXRvci5wb3N0KFN3aXRjaEFjY291bnRUeXBlU2VydmljZSwgc3dpdGNoQWNjb3VudFR5cGVEYXRhKVxuXHRcdGF3YWl0IGxvY2F0b3IuY3VzdG9tZXJGYWNhZGUuc3dpdGNoUHJlbWl1bVRvRnJlZUdyb3VwKClcblx0XHRyZXR1cm4gUGxhblR5cGUuRnJlZVxuXHR9IGNhdGNoIChlKSB7XG5cdFx0aWYgKGUgaW5zdGFuY2VvZiBQcmVjb25kaXRpb25GYWlsZWRFcnJvcikge1xuXHRcdFx0YXdhaXQgaGFuZGxlU3dpdGNoQWNjb3VudFByZWNvbmRpdGlvbkZhaWxlZChlKVxuXHRcdH0gZWxzZSBpZiAoZSBpbnN0YW5jZW9mIEludmFsaWREYXRhRXJyb3IpIHtcblx0XHRcdGF3YWl0IERpYWxvZy5tZXNzYWdlKFwiYWNjb3VudFN3aXRjaFRvb01hbnlBY3RpdmVVc2Vyc19tc2dcIilcblx0XHR9IGVsc2UgaWYgKGUgaW5zdGFuY2VvZiBCYWRSZXF1ZXN0RXJyb3IpIHtcblx0XHRcdGF3YWl0IERpYWxvZy5tZXNzYWdlKFwiZGVhY3RpdmF0ZVByZW1pdW1XaXRoQ3VzdG9tRG9tYWluRXJyb3JfbXNnXCIpXG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IGVcblx0XHR9XG5cdFx0cmV0dXJuIGN1cnJlbnRQbGFuSW5mby5wbGFuVHlwZVxuXHR9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNhbmNlbFN1YnNjcmlwdGlvbihcblx0ZGlhbG9nOiBEaWFsb2csXG5cdGN1cnJlbnRQbGFuSW5mbzogQ3VycmVudFBsYW5JbmZvLFxuXHRjdXN0b21lcjogQ3VzdG9tZXIsXG5cdHN1cnZleURhdGE6IFN1cnZleURhdGEgfCBudWxsID0gbnVsbCxcbik6IFByb21pc2U8UGxhblR5cGU+IHtcblx0Y29uc3QgY29uZmlybUNhbmNlbFN1YnNjcmlwdGlvbiA9IERpYWxvZy5jb25maXJtKFwidW5zdWJzY3JpYmVDb25maXJtX21zZ1wiLCBcIm9rX2FjdGlvblwiLCAoKSA9PiB7XG5cdFx0cmV0dXJuIG0oXG5cdFx0XHRcIi5wdFwiLFxuXHRcdFx0bShcInVsLnVzYWdlLXRlc3Qtb3B0LWluLWJ1bGxldHNcIiwgW1xuXHRcdFx0XHRtKFwibGlcIiwgbGFuZy5nZXQoXCJpbXBvcnRlZE1haWxzV2lsbEJlRGVsZXRlZF9sYWJlbFwiKSksXG5cdFx0XHRcdG0oXCJsaVwiLCBsYW5nLmdldChcImFjY291bnRXaWxsQmVEZWFjdGl2YXRlZEluNk1vbnRoX2xhYmVsXCIpKSxcblx0XHRcdFx0bShcImxpXCIsIGxhbmcuZ2V0KFwiYWNjb3VudFdpbGxIYXZlTGVzc1N0b3JhZ2VfbGFiZWxcIikpLFxuXHRcdFx0XSksXG5cdFx0KVxuXHR9KVxuXG5cdGlmICghKGF3YWl0IGNvbmZpcm1DYW5jZWxTdWJzY3JpcHRpb24pKSB7XG5cdFx0cmV0dXJuIGN1cnJlbnRQbGFuSW5mby5wbGFuVHlwZVxuXHR9XG5cblx0dHJ5IHtcblx0XHRyZXR1cm4gYXdhaXQgc2hvd1Byb2dyZXNzRGlhbG9nKFwicGxlYXNlV2FpdF9tc2dcIiwgdHJ5RG93bmdyYWRlUHJlbWl1bVRvRnJlZShjdXN0b21lciwgY3VycmVudFBsYW5JbmZvLCBzdXJ2ZXlEYXRhKSlcblx0fSBmaW5hbGx5IHtcblx0XHRkaWFsb2cuY2xvc2UoKVxuXHR9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHN3aXRjaFN1YnNjcmlwdGlvbih0YXJnZXRTdWJzY3JpcHRpb246IFBsYW5UeXBlLCBkaWFsb2c6IERpYWxvZywgY3VycmVudFBsYW5JbmZvOiBDdXJyZW50UGxhbkluZm8pOiBQcm9taXNlPFBsYW5UeXBlPiB7XG5cdGlmICh0YXJnZXRTdWJzY3JpcHRpb24gPT09IGN1cnJlbnRQbGFuSW5mby5wbGFuVHlwZSkge1xuXHRcdHJldHVybiBjdXJyZW50UGxhbkluZm8ucGxhblR5cGVcblx0fVxuXG5cdGNvbnN0IHVzZXJDb250cm9sbGVyID0gbG9jYXRvci5sb2dpbnMuZ2V0VXNlckNvbnRyb2xsZXIoKVxuXHRjb25zdCBjdXN0b21lciA9IGF3YWl0IHVzZXJDb250cm9sbGVyLmxvYWRDdXN0b21lcigpXG5cdGlmICghY3VzdG9tZXIuYnVzaW5lc3NVc2UgJiYgTmV3QnVzaW5lc3NQbGFucy5pbmNsdWRlcyhkb3duY2FzdCh0YXJnZXRTdWJzY3JpcHRpb24pKSkge1xuXHRcdGNvbnN0IGFjY291bnRpbmdJbmZvID0gYXdhaXQgdXNlckNvbnRyb2xsZXIubG9hZEFjY291bnRpbmdJbmZvKClcblx0XHRjb25zdCBpbnZvaWNlRGF0YTogSW52b2ljZURhdGEgPSB7XG5cdFx0XHRpbnZvaWNlQWRkcmVzczogZm9ybWF0TmFtZUFuZEFkZHJlc3MoYWNjb3VudGluZ0luZm8uaW52b2ljZU5hbWUsIGFjY291bnRpbmdJbmZvLmludm9pY2VBZGRyZXNzKSxcblx0XHRcdGNvdW50cnk6IGFjY291bnRpbmdJbmZvLmludm9pY2VDb3VudHJ5ID8gZ2V0QnlBYmJyZXZpYXRpb24oYWNjb3VudGluZ0luZm8uaW52b2ljZUNvdW50cnkpIDogbnVsbCxcblx0XHRcdHZhdE51bWJlcjogYWNjb3VudGluZ0luZm8uaW52b2ljZVZhdElkTm8sIC8vIG9ubHkgZm9yIEVVIGNvdW50cmllcyBvdGhlcndpc2UgZW1wdHlcblx0XHR9XG5cdFx0Y29uc3QgdXBkYXRlZEludm9pY2VEYXRhID0gYXdhaXQgc2hvd1N3aXRjaFRvQnVzaW5lc3NJbnZvaWNlRGF0YURpYWxvZyhjdXN0b21lciwgaW52b2ljZURhdGEsIGFjY291bnRpbmdJbmZvKVxuXHRcdGlmICghdXBkYXRlZEludm9pY2VEYXRhKSB7XG5cdFx0XHRyZXR1cm4gY3VycmVudFBsYW5JbmZvLnBsYW5UeXBlXG5cdFx0fVxuXHR9XG5cblx0dHJ5IHtcblx0XHRjb25zdCBwb3N0SW4gPSBjcmVhdGVTd2l0Y2hBY2NvdW50VHlwZVBvc3RJbih7XG5cdFx0XHRhY2NvdW50VHlwZTogQWNjb3VudFR5cGUuUEFJRCxcblx0XHRcdHBsYW46IHRhcmdldFN1YnNjcmlwdGlvbixcblx0XHRcdGRhdGU6IENvbnN0LkNVUlJFTlRfREFURSxcblx0XHRcdHJlZmVycmFsQ29kZTogbnVsbCxcblx0XHRcdGN1c3RvbWVyOiBjdXN0b21lci5faWQsXG5cdFx0XHRzcGVjaWFsUHJpY2VVc2VyU2luZ2xlOiBudWxsLFxuXHRcdFx0c3VydmV5RGF0YTogbnVsbCxcblx0XHRcdGFwcDogY2xpZW50LmlzQ2FsZW5kYXJBcHAoKSA/IFN1YnNjcmlwdGlvbkFwcC5DYWxlbmRhciA6IFN1YnNjcmlwdGlvbkFwcC5NYWlsLFxuXHRcdH0pXG5cblx0XHR0cnkge1xuXHRcdFx0YXdhaXQgc2hvd1Byb2dyZXNzRGlhbG9nKFwicGxlYXNlV2FpdF9tc2dcIiwgbG9jYXRvci5zZXJ2aWNlRXhlY3V0b3IucG9zdChTd2l0Y2hBY2NvdW50VHlwZVNlcnZpY2UsIHBvc3RJbikpXG5cdFx0XHRyZXR1cm4gdGFyZ2V0U3Vic2NyaXB0aW9uXG5cdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0aWYgKGUgaW5zdGFuY2VvZiBQcmVjb25kaXRpb25GYWlsZWRFcnJvcikge1xuXHRcdFx0XHRhd2FpdCBoYW5kbGVTd2l0Y2hBY2NvdW50UHJlY29uZGl0aW9uRmFpbGVkKGUpXG5cblx0XHRcdFx0cmV0dXJuIGN1cnJlbnRQbGFuSW5mby5wbGFuVHlwZVxuXHRcdFx0fVxuXHRcdFx0dGhyb3cgZVxuXHRcdH1cblx0fSBmaW5hbGx5IHtcblx0XHRkaWFsb2cuY2xvc2UoKVxuXHR9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXNDQSxNQUFNQSxtQkFBa0QsQ0FDdkQ7Q0FDQyxNQUFNLEtBQUssSUFBSSwyQkFBMkI7Q0FDMUMsT0FBTztBQUNQLEdBQ0Q7Q0FDQyxNQUFNLEtBQUssSUFBSSw0QkFBNEI7Q0FDM0MsT0FBTztBQUNQLENBQ0Q7QUFtQk0sU0FBUyw4QkFBOEJDLGVBQTBDQyxjQUFpRDtDQUN4SSxNQUFNLE1BQU0sY0FBYztBQUMxQixLQUFJLE9BQU8sS0FDVixPQUFNLElBQUksaUJBQWlCO0FBRTVCLFFBQU8sTUFBTSxnQkFBRSxhQUFhLEtBQUssQ0FBQztBQUNsQztJQUlZLHVCQUFOLE1BQTBFO0NBQ2hGLEFBQVEsZUFBK0I7Q0FDdkMsQUFBUSxtQkFBd0Q7R0FDOUQsU0FBUyxPQUFPO0dBQ2hCLFNBQVMsZ0JBQWdCO0dBQ3pCLFNBQVMsU0FBUztHQUNsQixTQUFTLFlBQVk7R0FDckIsU0FBUyxXQUFXO0dBQ3BCLFNBQVMsWUFBWTtFQUN0QixLQUFLO0NBQ0w7Q0FFRCxPQUFPQyxPQUE2QztFQUNuRCxNQUFNLGdCQUFnQixNQUFNLE1BQU07RUFDbEMsTUFBTSw0QkFBNEIsY0FBYyxNQUFNLENBQUMsU0FBUyxpQkFBaUIsU0FBUyxLQUFLLENBQUM7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