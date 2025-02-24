import m from "mithril";
import { assertMainOrNode, isIOSApp } from "../api/common/Env";
import { AccountType, AccountTypeNames, ApprovalStatus, AvailablePlans, BookingItemFeatureType, Const, getPaymentMethodType, LegacyPlans, NewPaidPlans, PaymentMethodType, } from "../api/common/TutanotaConstants";
import { AccountingInfoTypeRef, BookingTypeRef, createAppStoreSubscriptionGetIn, CustomerInfoTypeRef, CustomerTypeRef, GiftCardTypeRef, GroupInfoTypeRef, OrderProcessingAgreementTypeRef, UserTypeRef, } from "../api/entities/sys/TypeRefs.js";
import { assertNotNull, base64ExtToBase64, base64ToUint8Array, downcast, incrementDate, neverNull, promiseMap, stringToBase64 } from "@tutao/tutanota-utils";
import { lang } from "../misc/LanguageViewModel";
import { asPaymentInterval, formatPrice, formatPriceDataWithInfo } from "./PriceUtils";
import { formatDate, formatStorageSize } from "../misc/Formatter";
import { showUpgradeWizard } from "./UpgradeSubscriptionWizard";
import { showSwitchDialog } from "./SwitchSubscriptionDialog";
import stream from "mithril/stream";
import * as SignOrderAgreementDialog from "./SignOrderProcessingAgreementDialog";
import { NotFoundError } from "../api/common/error/RestError";
import { appStorePlanName, getCurrentCount, getTotalStorageCapacityPerCustomer, isAutoResponderActive, isEventInvitesActive, isSharingActive, isWhitelabelActive, queryAppStoreSubscriptionOwnership, } from "./SubscriptionUtils";
import { TextField } from "../gui/base/TextField.js";
import { Dialog } from "../gui/base/Dialog";
import { Table } from "../gui/base/Table.js";
import { showPurchaseGiftCardDialog } from "./giftcards/PurchaseGiftCardDialog";
import { loadGiftCards, showGiftCardToShare } from "./giftcards/GiftCardUtils";
import { locator } from "../api/main/CommonLocator";
import { GiftCardMessageEditorField } from "./giftcards/GiftCardMessageEditorField";
import { attachDropdown } from "../gui/base/Dropdown.js";
import { createNotAvailableForFreeClickHandler } from "../misc/SubscriptionDialogs";
import { SettingsExpander } from "../settings/SettingsExpander.js";
import { elementIdPart, GENERATED_MAX_ID, getEtId } from "../api/common/utils/EntityUtils";
import { CURRENT_GIFT_CARD_TERMS_VERSION, CURRENT_PRIVACY_VERSION, CURRENT_TERMS_VERSION, renderTermsAndConditionsButton, } from "./TermsAndConditions";
import { DropDownSelector } from "../gui/base/DropDownSelector.js";
import { IconButton } from "../gui/base/IconButton.js";
import { getDisplayNameOfPlanType } from "./FeatureListProvider";
import { isUpdateForTypeRef } from "../api/common/utils/EntityUpdateUtils.js";
import { showProgressDialog } from "../gui/dialogs/ProgressDialog";
import { MobilePaymentError } from "../api/common/error/MobilePaymentError";
import { showManageThroughAppStoreDialog } from "./PaymentViewer.js";
import { client } from "../misc/ClientDetector.js";
import { AppStoreSubscriptionService } from "../api/entities/sys/Services.js";
import { AppType } from "../misc/ClientConstants.js";
import { ProgrammingError } from "../api/common/error/ProgrammingError.js";
assertMainOrNode();
const DAY = 1000 * 60 * 60 * 24;
/*
 * Identifies from which app the user subscribed from
 */
export var SubscriptionApp;
(function (SubscriptionApp) {
    SubscriptionApp["Mail"] = "0";
    SubscriptionApp["Calendar"] = "1";
})(SubscriptionApp || (SubscriptionApp = {}));
export class SubscriptionViewer {
    mobilePaymentsFacade;
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
            for (const giftCard of giftCards) {
                this._giftCards.set(elementIdPart(giftCard._id), giftCard);
            }
        });
        this._giftCardsExpanded = stream(false);
        this.view = () => {
            return m("#subscription-settings.fill-absolute.scroll.plr-l", [
                m(".h4.mt-l", lang.get("currentlyBooked_label")),
                m(TextField, {
                    label: "subscription_label",
                    value: this._subscriptionFieldValue(),
                    oninput: this._subscriptionFieldValue,
                    isReadOnly: true,
                    injectionsRight: () => locator.logins.getUserController().isFreeAccount()
                        ? m(IconButton, {
                            title: "upgrade_action",
                            click: () => showProgressDialog("pleaseWait_msg", this.handleUpgradeSubscription()),
                            icon: "Edit" /* Icons.Edit */,
                            size: 1 /* ButtonSize.Compact */,
                        })
                        : !this._isCancelled
                            ? m(IconButton, {
                                title: "subscription_label",
                                click: () => this.onSubscriptionClick(),
                                icon: "Edit" /* Icons.Edit */,
                                size: 1 /* ButtonSize.Compact */,
                            })
                            : null,
                }),
                this.showOrderAgreement() ? this.renderAgreement() : null,
                this.showPriceData() ? this.renderIntervals() : null,
                this.showPriceData() && this._nextPeriodPriceVisible && this._periodEndDate
                    ? m(TextField, {
                        label: lang.getTranslation("priceFrom_label", {
                            "{date}": formatDate(new Date(neverNull(this._periodEndDate).getTime() + DAY)),
                        }),
                        helpLabel: () => lang.get("nextSubscriptionPrice_msg"),
                        value: this._nextPriceFieldValue(),
                        oninput: this._nextPriceFieldValue,
                        isReadOnly: true,
                    })
                    : null,
                m(".small.mt-s", renderTermsAndConditionsButton("terms-entries" /* TermsSection.Terms */, CURRENT_TERMS_VERSION)),
                m(".small.mt-s", renderTermsAndConditionsButton("privacy-policy-entries" /* TermsSection.Privacy */, CURRENT_PRIVACY_VERSION)),
                m(SettingsExpander, {
                    title: "giftCards_label",
                    infoMsg: "giftCardSection_label",
                    expanded: this._giftCardsExpanded,
                }, renderGiftCardTable(Array.from(this._giftCards.values()), isPremiumPredicate)),
                LegacyPlans.includes(this.currentPlanType)
                    ? [
                        m(".h4.mt-l", lang.get("adminPremiumFeatures_action")),
                        m(TextField, {
                            label: "storageCapacity_label",
                            value: this._storageFieldValue(),
                            oninput: this._storageFieldValue,
                            isReadOnly: true,
                        }),
                        m(TextField, {
                            label: "mailAddressAliases_label",
                            value: this._emailAliasFieldValue(),
                            oninput: this._emailAliasFieldValue,
                            isReadOnly: true,
                        }),
                        m(TextField, {
                            label: "pricing.comparisonSharingCalendar_msg",
                            value: this._sharingFieldValue(),
                            oninput: this._sharingFieldValue,
                            isReadOnly: true,
                        }),
                        m(TextField, {
                            label: "pricing.comparisonEventInvites_msg",
                            value: this._eventInvitesFieldValue(),
                            oninput: this._eventInvitesFieldValue,
                            isReadOnly: true,
                        }),
                        m(TextField, {
                            label: "pricing.comparisonOutOfOffice_msg",
                            value: this._autoResponderFieldValue(),
                            oninput: this._autoResponderFieldValue,
                            isReadOnly: true,
                        }),
                        m(TextField, {
                            label: "whitelabel.login_title",
                            value: this._whitelabelFieldValue(),
                            oninput: this._whitelabelFieldValue,
                            isReadOnly: true,
                        }),
                        m(TextField, {
                            label: "whitelabel.custom_title",
                            value: this._whitelabelFieldValue(),
                            oninput: this._whitelabelFieldValue,
                            isReadOnly: true,
                        }),
                    ]
                    : [],
            ]);
        };
        locator.entityClient
            .load(CustomerTypeRef, neverNull(locator.logins.getUserController().user.customer))
            .then((customer) => {
            this.updateCustomerData(customer);
            return locator.logins.getUserController().loadCustomerInfo();
        })
            .then((customerInfo) => {
            this._customerInfo = customerInfo;
            return locator.entityClient.load(AccountingInfoTypeRef, customerInfo.accountingInfo);
        })
            .then((accountingInfo) => {
            this.updateAccountInfoData(accountingInfo);
            this.updatePriceInfo();
        });
        const loadingString = lang.get("loading_msg");
        this._currentPriceFieldValue = stream(loadingString);
        this._subscriptionFieldValue = stream(loadingString);
        this._orderAgreementFieldValue = stream(loadingString);
        this._nextPriceFieldValue = stream(loadingString);
        this._usersFieldValue = stream(loadingString);
        this._storageFieldValue = stream(loadingString);
        this._emailAliasFieldValue = stream(loadingString);
        this._groupsFieldValue = stream(loadingString);
        this._whitelabelFieldValue = stream(loadingString);
        this._sharingFieldValue = stream(loadingString);
        this._eventInvitesFieldValue = stream(loadingString);
        this._autoResponderFieldValue = stream(loadingString);
        this._selectedSubscriptionInterval = stream(null);
        this.updateBookings();
    }
    onSubscriptionClick() {
        const paymentMethod = this._accountingInfo ? getPaymentMethodType(this._accountingInfo) : null;
        if (isIOSApp() && (paymentMethod == null || paymentMethod == PaymentMethodType.AppStore)) {
            // case 1: we are in iOS app and we either are not paying or are already on AppStore
            this.handleAppStoreSubscriptionChange();
        }
        else if (paymentMethod == PaymentMethodType.AppStore && this._accountingInfo?.appStoreSubscription) {
            // case 2: we have a running AppStore subscription but this is not an iOS app
            // If there's a running App Store subscription it must be managed through Apple.
            // This includes the case where renewal is already disabled, but it's not expired yet.
            // Running subscription cannot be changed from other client, but it can still be managed through iOS app or when subscription expires.
            return showManageThroughAppStoreDialog();
        }
        else {
            // other cases (not iOS app, not app store payment method, no running AppStore subscription, iOS but another payment method)
            if (this._accountingInfo && this._customer && this._customerInfo && this._lastBooking) {
                showSwitchDialog(this._customer, this._customerInfo, this._accountingInfo, this._lastBooking, AvailablePlans, null);
            }
        }
    }
    async handleUpgradeSubscription() {
        if (isIOSApp()) {
            // We pass `null` because we expect no subscription when upgrading
            const appStoreSubscriptionOwnership = await queryAppStoreSubscriptionOwnership(null);
            if (appStoreSubscriptionOwnership !== "2" /* MobilePaymentSubscriptionOwnership.NoSubscription */) {
                return Dialog.message(lang.getTranslation("storeMultiSubscriptionError_msg", {
                    "{AppStorePayment}": "https://tuta.com/support/#appstore-payments" /* InfoLink.AppStorePayment */,
                }));
            }
        }
        return showUpgradeWizard(locator.logins);
    }
    async handleAppStoreSubscriptionChange() {
        if (!this.mobilePaymentsFacade) {
            throw Error("Not allowed to change AppStore subscription from web client");
        }
        let customer;
        let accountingInfo;
        if (this._customer && this._accountingInfo) {
            customer = this._customer;
            accountingInfo = this._accountingInfo;
        }
        else {
            return;
        }
        const appStoreSubscriptionOwnership = await queryAppStoreSubscriptionOwnership(base64ToUint8Array(base64ExtToBase64(customer._id)));
        const isAppStorePayment = getPaymentMethodType(accountingInfo) === PaymentMethodType.AppStore;
        const userStatus = customer.approvalStatus;
        const hasAnActiveSubscription = isAppStorePayment && accountingInfo.appStoreSubscription != null;
        if (hasAnActiveSubscription && !(await this.canManageAppStoreSubscriptionInApp(accountingInfo, appStoreSubscriptionOwnership))) {
            return;
        }
        // Show a dialog only if the user's Apple account's last transaction was with this customer ID
        //
        // This prevents the user from accidentally changing a subscription that they don't own
        if (appStoreSubscriptionOwnership === "1" /* MobilePaymentSubscriptionOwnership.NotOwner */) {
            // There's a subscription with this apple account that doesn't belong to this user
            return Dialog.message(lang.getTranslation("storeMultiSubscriptionError_msg", {
                "{AppStorePayment}": "https://tuta.com/support/#appstore-payments" /* InfoLink.AppStorePayment */,
            }));
        }
        else if (isAppStorePayment &&
            appStoreSubscriptionOwnership === "2" /* MobilePaymentSubscriptionOwnership.NoSubscription */ &&
            userStatus === ApprovalStatus.REGISTRATION_APPROVED) {
            // User has an ongoing subscriptions but not on the current Apple Account, so we shouldn't allow them to change their plan with this account
            // instead of the account owner of the subscriptions
            return Dialog.message(lang.getTranslation("storeNoSubscription_msg", { "{AppStorePayment}": "https://tuta.com/support/#appstore-payments" /* InfoLink.AppStorePayment */ }));
        }
        else if (appStoreSubscriptionOwnership === "2" /* MobilePaymentSubscriptionOwnership.NoSubscription */) {
            // User has no ongoing subscription and isn't approved. We should allow them to downgrade their accounts or resubscribe and
            // restart an Apple Subscription flow
            const isResubscribe = await Dialog.choice(lang.getTranslation("storeDowngradeOrResubscribe_msg", { "{AppStoreDowngrade}": "https://tuta.com/support/#appstore-subscription-downgrade" /* InfoLink.AppStoreDowngrade */ }), [
                {
                    text: "changePlan_action",
                    value: false,
                },
                {
                    text: "resubscribe_action",
                    value: true,
                },
            ]);
            if (isResubscribe) {
                const planType = await locator.logins.getUserController().getPlanType();
                const customerId = locator.logins.getUserController().user.customer;
                const customerIdBytes = base64ToUint8Array(base64ExtToBase64(customerId));
                try {
                    await this.mobilePaymentsFacade.requestSubscriptionToPlan(appStorePlanName(planType), asPaymentInterval(accountingInfo.paymentInterval), customerIdBytes);
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
                if (this._customerInfo && this._lastBooking) {
                    return showSwitchDialog(customer, this._customerInfo, accountingInfo, this._lastBooking, AvailablePlans, null);
                }
            }
        }
        else {
            if (this._customerInfo && this._lastBooking) {
                return showSwitchDialog(customer, this._customerInfo, accountingInfo, this._lastBooking, AvailablePlans, null);
            }
        }
    }
    async canManageAppStoreSubscriptionInApp(accountingInfo, ownership) {
        if (ownership === "1" /* MobilePaymentSubscriptionOwnership.NotOwner */) {
            return true;
        }
        const appStoreSubscriptionData = await locator.serviceExecutor.get(AppStoreSubscriptionService, createAppStoreSubscriptionGetIn({ subscriptionId: elementIdPart(assertNotNull(accountingInfo.appStoreSubscription)) }));
        if (!appStoreSubscriptionData || appStoreSubscriptionData.app == null) {
            throw new ProgrammingError("Failed to determine subscription origin");
        }
        const isMailSubscription = appStoreSubscriptionData.app === SubscriptionApp.Mail;
        if (client.isCalendarApp() && isMailSubscription) {
            return await this.handleAppOpen(SubscriptionApp.Mail);
        }
        else if (!client.isCalendarApp() && !isMailSubscription) {
            return await this.handleAppOpen(SubscriptionApp.Calendar);
        }
        return true;
    }
    async handleAppOpen(app) {
        const appName = app === SubscriptionApp.Calendar ? "Tuta Calendar" : "Tuta Mail";
        const dialogResult = await Dialog.confirm(lang.getTranslation("handleSubscriptionOnApp_msg", { "{1}": appName }), "yes_label");
        const query = stringToBase64(`settings=subscription`);
        if (!dialogResult) {
            return false;
        }
        if (app === SubscriptionApp.Calendar) {
            locator.systemFacade.openCalendarApp(query);
        }
        else {
            locator.systemFacade.openMailApp(query);
        }
        return false;
    }
    openAppDialogCallback(open, app) {
        if (!open) {
            return;
        }
        const appName = app === AppType.Mail ? "Tuta Mail" : "Tuta Calendar";
    }
    showOrderAgreement() {
        return (locator.logins.getUserController().isPaidAccount() &&
            ((this._customer != null && this._customer.businessUse) ||
                (this._customer != null && (this._customer.orderProcessingAgreement != null || this._customer.orderProcessingAgreementNeeded))));
    }
    async updateCustomerData(customer) {
        this._customer = customer;
        if (customer.orderProcessingAgreement) {
            this._orderAgreement = await locator.entityClient.load(OrderProcessingAgreementTypeRef, customer.orderProcessingAgreement);
        }
        else {
            this._orderAgreement = null;
        }
        if (customer.orderProcessingAgreementNeeded) {
            this._orderAgreementFieldValue(lang.get("signingNeeded_msg"));
        }
        else if (this._orderAgreement) {
            this._orderAgreementFieldValue(lang.get("signedOn_msg", {
                "{date}": formatDate(this._orderAgreement.signatureDate),
            }));
        }
        else {
            this._orderAgreementFieldValue(lang.get("notSigned_msg"));
        }
        m.redraw();
    }
    showPriceData() {
        const isAppStorePayment = this._accountingInfo && getPaymentMethodType(this._accountingInfo) === PaymentMethodType.AppStore;
        return locator.logins.getUserController().isPaidAccount() && !isIOSApp() && !isAppStorePayment;
    }
    async updatePriceInfo() {
        if (!this.showPriceData()) {
            return;
        }
        const priceServiceReturn = await locator.bookingFacade.getCurrentPrice();
        if (priceServiceReturn.currentPriceThisPeriod != null && priceServiceReturn.currentPriceNextPeriod != null) {
            if (priceServiceReturn.currentPriceThisPeriod.price !== priceServiceReturn.currentPriceNextPeriod.price) {
                this._currentPriceFieldValue(formatPriceDataWithInfo(priceServiceReturn.currentPriceThisPeriod));
                this._nextPriceFieldValue(formatPriceDataWithInfo(neverNull(priceServiceReturn.currentPriceNextPeriod)));
                this._nextPeriodPriceVisible = true;
            }
            else {
                this._currentPriceFieldValue(formatPriceDataWithInfo(priceServiceReturn.currentPriceThisPeriod));
                this._nextPeriodPriceVisible = false;
            }
            this._periodEndDate = priceServiceReturn.periodEndDate;
            m.redraw();
        }
    }
    updateAccountInfoData(accountingInfo) {
        this._accountingInfo = accountingInfo;
        this._selectedSubscriptionInterval(asPaymentInterval(accountingInfo.paymentInterval));
        m.redraw();
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
        }
        catch (e) {
            if (e instanceof NotFoundError) {
                console.log("could not update bookings as customer info does not exist (moved between free/premium lists)");
                return;
            }
            else {
                throw e;
            }
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
            this.updateAutoResponderField(planConfig),
        ]);
        m.redraw();
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
            "{totalAmount}": totalStorageFormatted,
        }));
    }
    async updateAliasField() {
        // we pass in the user group id here even though for legacy plans the id is ignored
        const counters = await locator.mailAddressFacade.getAliasCounters(locator.logins.getUserController().user.userGroup.group);
        this._emailAliasFieldValue(lang.get("amountUsedAndActivatedOf_label", {
            "{used}": counters.usedAliases,
            "{active}": counters.enabledAliases,
            "{totalAmount}": counters.totalAliases,
        }));
    }
    async updateGroupsField() {
        const sharedMailCount = getCurrentCount(BookingItemFeatureType.SharedMailGroup, this._lastBooking);
        // Plural forms and number placement inside the string should be handled by the translation framework, but this is what we got now.
        const sharedMailText = sharedMailCount + " " + lang.get(sharedMailCount === 1 ? "sharedMailbox_label" : "sharedMailboxes_label");
        this._groupsFieldValue(sharedMailText);
    }
    async updateWhitelabelField(planConfig) {
        if (isWhitelabelActive(this._lastBooking, planConfig)) {
            this._whitelabelFieldValue(lang.get("active_label"));
        }
        else {
            this._whitelabelFieldValue(lang.get("deactivated_label"));
        }
    }
    async updateSharingField(planConfig) {
        if (isSharingActive(this._lastBooking, planConfig)) {
            this._sharingFieldValue(lang.get("active_label"));
        }
        else {
            this._sharingFieldValue(lang.get("deactivated_label"));
        }
    }
    async updateEventInvitesField(planConfig) {
        if (!this._customer) {
            this._eventInvitesFieldValue("");
        }
        else if (isEventInvitesActive(this._lastBooking, planConfig)) {
            this._eventInvitesFieldValue(lang.get("active_label"));
        }
        else {
            this._eventInvitesFieldValue(lang.get("deactivated_label"));
        }
    }
    async updateAutoResponderField(planConfig) {
        if (!this._customer) {
            this._autoResponderFieldValue("");
        }
        else if (isAutoResponderActive(this._lastBooking, planConfig)) {
            this._autoResponderFieldValue(lang.get("active_label"));
        }
        else {
            this._autoResponderFieldValue(lang.get("deactivated_label"));
        }
    }
    async entityEventsReceived(updates) {
        await promiseMap(updates, (update) => this.processUpdate(update));
    }
    async processUpdate(update) {
        const { instanceListId, instanceId } = update;
        if (isUpdateForTypeRef(AccountingInfoTypeRef, update)) {
            const accountingInfo = await locator.entityClient.load(AccountingInfoTypeRef, instanceId);
            this.updateAccountInfoData(accountingInfo);
            return await this.updatePriceInfo();
        }
        else if (isUpdateForTypeRef(UserTypeRef, update)) {
            await this.updateBookings();
            return await this.updatePriceInfo();
        }
        else if (isUpdateForTypeRef(BookingTypeRef, update)) {
            await this.updateBookings();
            return await this.updatePriceInfo();
        }
        else if (isUpdateForTypeRef(CustomerTypeRef, update)) {
            const customer = await locator.entityClient.load(CustomerTypeRef, instanceId);
            return await this.updateCustomerData(customer);
        }
        else if (isUpdateForTypeRef(CustomerInfoTypeRef, update)) {
            // needed to update the displayed plan
            await this.updateBookings();
            return await this.updatePriceInfo();
        }
        else if (isUpdateForTypeRef(GiftCardTypeRef, update)) {
            const giftCard = await locator.entityClient.load(GiftCardTypeRef, [instanceListId, instanceId]);
            this._giftCards.set(elementIdPart(giftCard._id), giftCard);
            if (update.operation === "0" /* OperationType.CREATE */)
                this._giftCardsExpanded(true);
        }
    }
    renderIntervals() {
        const isAppStorePayment = this._accountingInfo && getPaymentMethodType(this._accountingInfo) === PaymentMethodType.AppStore;
        if (isIOSApp() || isAppStorePayment) {
            return;
        }
        const subscriptionPeriods = [
            {
                name: lang.get("pricing.yearly_label"),
                value: 12 /* PaymentInterval.Yearly */,
            },
            {
                name: lang.get("pricing.monthly_label"),
                value: 1 /* PaymentInterval.Monthly */,
            },
            {
                name: lang.get("loading_msg"),
                value: null,
                selectable: false,
            },
        ];
        const bonusMonths = this._lastBooking ? Number(this._lastBooking.bonusMonth) : 0;
        return [
            m(DropDownSelector, {
                label: "paymentInterval_label",
                helpLabel: () => this.getChargeDateText(),
                items: subscriptionPeriods,
                selectedValue: this._selectedSubscriptionInterval(),
                dropdownWidth: 300,
                selectionChangedHandler: (value) => {
                    if (this._accountingInfo) {
                        showChangeSubscriptionIntervalDialog(this._accountingInfo, value, this._periodEndDate);
                    }
                },
            }),
            bonusMonths === 0
                ? null
                : m(TextField, {
                    label: "bonus_label",
                    value: lang.get("bonusMonth_msg", { "{months}": bonusMonths }),
                    isReadOnly: true,
                }),
            m(TextField, {
                label: this._nextPeriodPriceVisible && this._periodEndDate
                    ? lang.getTranslation("priceTill_label", {
                        "{date}": formatDate(this._periodEndDate),
                    })
                    : "price_label",
                value: this._currentPriceFieldValue(),
                oninput: this._currentPriceFieldValue,
                isReadOnly: true,
                helpLabel: () => (this._customer && this._customer.businessUse === true ? lang.get("pricing.subscriptionPeriodInfoBusiness_msg") : null),
            }),
        ];
    }
    renderAgreement() {
        return m(TextField, {
            label: "orderProcessingAgreement_label",
            helpLabel: () => lang.get("orderProcessingAgreementInfo_msg"),
            value: this._orderAgreementFieldValue(),
            oninput: this._orderAgreementFieldValue,
            isReadOnly: true,
            injectionsRight: () => {
                if (this._orderAgreement && this._customer && this._customer.orderProcessingAgreementNeeded) {
                    return [this.renderSignProcessingAgreementAction(), this.renderShowProcessingAgreementAction()];
                }
                else if (this._orderAgreement) {
                    return [this.renderShowProcessingAgreementAction()];
                }
                else if (this._customer && this._customer.orderProcessingAgreementNeeded) {
                    return [this.renderSignProcessingAgreementAction()];
                }
                else {
                    return [];
                }
            },
        });
    }
    renderShowProcessingAgreementAction() {
        return m(IconButton, {
            title: "show_action",
            click: () => locator.entityClient
                .load(GroupInfoTypeRef, neverNull(this._orderAgreement).signerUserGroupInfo)
                .then((signerUserGroupInfo) => SignOrderAgreementDialog.showForViewing(neverNull(this._orderAgreement), signerUserGroupInfo)),
            icon: "Download" /* Icons.Download */,
            size: 1 /* ButtonSize.Compact */,
        });
    }
    renderSignProcessingAgreementAction() {
        return m(IconButton, {
            title: "sign_action",
            click: () => SignOrderAgreementDialog.showForSigning(neverNull(this._customer), neverNull(this._accountingInfo)),
            icon: "Edit" /* Icons.Edit */,
            size: 1 /* ButtonSize.Compact */,
        });
    }
    getChargeDateText() {
        if (this._periodEndDate) {
            const chargeDate = formatDate(incrementDate(new Date(this._periodEndDate), 1));
            return lang.get("nextChargeOn_label", { "{chargeDate}": chargeDate });
        }
        else {
            return "";
        }
    }
}
function _getAccountTypeName(type, subscription) {
    if (type === AccountType.PAID) {
        return getDisplayNameOfPlanType(subscription);
    }
    else {
        return AccountTypeNames[type];
    }
}
function showChangeSubscriptionIntervalDialog(accountingInfo, paymentInterval, periodEndDate) {
    if (accountingInfo && accountingInfo.invoiceCountry && asPaymentInterval(accountingInfo.paymentInterval) !== paymentInterval) {
        const confirmationMessage = periodEndDate
            ? lang.getTranslation("subscriptionChangePeriod_msg", {
                "{1}": formatDate(periodEndDate),
            })
            : "subscriptionChange_msg";
        Dialog.confirm(confirmationMessage).then(async (confirmed) => {
            if (confirmed) {
                await locator.customerFacade.changePaymentInterval(accountingInfo, paymentInterval);
            }
        });
    }
}
function renderGiftCardTable(giftCards, isPremiumPredicate) {
    const addButtonAttrs = {
        title: "buyGiftCard_label",
        click: createNotAvailableForFreeClickHandler(NewPaidPlans, () => showPurchaseGiftCardDialog(), isPremiumPredicate),
        icon: "Add" /* Icons.Add */,
        size: 1 /* ButtonSize.Compact */,
    };
    const columnHeading = ["purchaseDate_label", "value_label"];
    const columnWidths = [".column-width-largest" /* ColumnWidth.Largest */, ".column-width-small" /* ColumnWidth.Small */, ".column-width-small" /* ColumnWidth.Small */];
    const lines = giftCards
        .filter((giftCard) => giftCard.status === "1" /* GiftCardStatus.Usable */)
        .map((giftCard) => {
        return {
            cells: [formatDate(giftCard.orderDate), formatPrice(parseFloat(giftCard.value), true)],
            actionButtonAttrs: attachDropdown({
                mainButtonAttrs: {
                    title: "options_action",
                    icon: "More" /* Icons.More */,
                    size: 1 /* ButtonSize.Compact */,
                },
                childAttrs: () => [
                    {
                        label: "view_label",
                        click: () => showGiftCardToShare(giftCard),
                    },
                    {
                        label: "edit_action",
                        click: () => {
                            let message = stream(giftCard.message);
                            Dialog.showActionDialog({
                                title: "editMessage_label",
                                child: () => m(".flex-center", m(GiftCardMessageEditorField, {
                                    message: message(),
                                    onMessageChanged: message,
                                })),
                                okAction: (dialog) => {
                                    giftCard.message = message();
                                    locator.entityClient
                                        .update(giftCard)
                                        .then(() => dialog.close())
                                        .catch(() => Dialog.message("giftCardUpdateError_msg"));
                                    showGiftCardToShare(giftCard);
                                },
                                okActionTextId: "save_action",
                                type: "EditSmall" /* DialogType.EditSmall */,
                            });
                        },
                    },
                ],
            }),
        };
    });
    return [
        m(Table, {
            addButtonAttrs,
            columnHeading,
            columnWidths,
            lines,
            showActionButtonColumn: true,
        }),
        m(".small", renderTermsAndConditionsButton("giftCardsTerms-entries" /* TermsSection.GiftCards */, CURRENT_GIFT_CARD_TERMS_VERSION)),
    ];
}
//# sourceMappingURL=SubscriptionViewer.js.map