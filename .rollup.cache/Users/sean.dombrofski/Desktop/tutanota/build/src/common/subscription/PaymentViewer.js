import m from "mithril";
import { assertMainOrNode, isIOSApp } from "../api/common/Env";
import { assertNotNull, last, neverNull, ofClass } from "@tutao/tutanota-utils";
import { lang } from "../misc/LanguageViewModel";
import { AccountingInfoTypeRef, BookingTypeRef, createDebitServicePutData, CustomerTypeRef, InvoiceInfoTypeRef, } from "../api/entities/sys/TypeRefs.js";
import { HtmlEditor, HtmlEditorMode } from "../gui/editor/HtmlEditor";
import { formatPrice, getPaymentMethodInfoText, getPaymentMethodName } from "./PriceUtils";
import * as InvoiceDataDialog from "./InvoiceDataDialog";
import { Table } from "../gui/base/Table.js";
import { formatDate } from "../misc/Formatter";
import { AccountType, AvailablePlans, getDefaultPaymentMethod, getPaymentMethodType, NewPaidPlans, PaymentMethodType, } from "../api/common/TutanotaConstants";
import { BadGatewayError, LockedError, PreconditionFailedError, TooManyRequestsError } from "../api/common/error/RestError";
import { Dialog } from "../gui/base/Dialog";
import { getByAbbreviation } from "../api/common/CountryList";
import * as PaymentDataDialog from "./PaymentDataDialog";
import { showProgressDialog } from "../gui/dialogs/ProgressDialog";
import { getPreconditionFailedPaymentMsg, hasRunningAppStoreSubscription } from "./SubscriptionUtils";
import { DialogHeaderBar } from "../gui/base/DialogHeaderBar";
import { TextField } from "../gui/base/TextField.js";
import { ExpanderButton, ExpanderPanel } from "../gui/base/Expander";
import { locator } from "../api/main/CommonLocator";
import { createNotAvailableForFreeClickHandler } from "../misc/SubscriptionDialogs";
import { CustomerAccountService } from "../api/entities/accounting/Services";
import { DebitService } from "../api/entities/sys/Services";
import { IconButton } from "../gui/base/IconButton.js";
import { formatNameAndAddress } from "../api/common/utils/CommonFormatter.js";
import { client } from "../misc/ClientDetector.js";
import { isUpdateForTypeRef } from "../api/common/utils/EntityUpdateUtils.js";
import { LoginButton } from "../gui/base/buttons/LoginButton.js";
import { ProgrammingError } from "../api/common/error/ProgrammingError.js";
import { showSwitchDialog } from "./SwitchSubscriptionDialog.js";
import { GENERATED_MAX_ID } from "../api/common/utils/EntityUtils.js";
import { createDropdown } from "../gui/base/Dropdown.js";
assertMainOrNode();
/**
 * Displays payment method/invoice data and allows changing them.
 */
export class PaymentViewer {
    invoiceAddressField;
    customer = null;
    accountingInfo = null;
    postings = [];
    outstandingBookingsPrice = null;
    balance = 0;
    invoiceInfo = null;
    postingsExpanded = false;
    constructor() {
        this.invoiceAddressField = new HtmlEditor()
            .setMinHeight(140)
            .showBorders()
            .setMode(HtmlEditorMode.HTML)
            .setHtmlMonospace(false)
            .setReadOnly(true)
            .setPlaceholderId("invoiceAddress_label");
        this.loadData();
        this.view = this.view.bind(this);
    }
    view() {
        return m("#invoicing-settings.fill-absolute.scroll.plr-l", {
            role: "group",
        }, [this.renderInvoiceData(), this.renderPaymentMethod(), this.renderPostings()]);
    }
    async loadData() {
        this.customer = await locator.logins.getUserController().loadCustomer();
        const customerInfo = await locator.logins.getUserController().loadCustomerInfo();
        const accountingInfo = await locator.entityClient.load(AccountingInfoTypeRef, customerInfo.accountingInfo);
        this.updateAccountingInfoData(accountingInfo);
        this.invoiceInfo = await locator.entityClient.load(InvoiceInfoTypeRef, neverNull(accountingInfo.invoiceInfo));
        m.redraw();
        await this.loadPostings();
    }
    renderPaymentMethod() {
        const paymentMethodHelpLabel = () => {
            if (this.accountingInfo && getPaymentMethodType(this.accountingInfo) === PaymentMethodType.Invoice) {
                return lang.get("paymentProcessingTime_msg");
            }
            return "";
        };
        const paymentMethod = this.accountingInfo
            ? getPaymentMethodName(getPaymentMethodType(neverNull(this.accountingInfo))) + " " + getPaymentMethodInfoText(neverNull(this.accountingInfo))
            : lang.get("loading_msg");
        return m(TextField, {
            label: "paymentMethod_label",
            value: paymentMethod,
            helpLabel: paymentMethodHelpLabel,
            isReadOnly: true,
            injectionsRight: () => m(IconButton, {
                title: "paymentMethod_label",
                click: (e, dom) => this.handlePaymentMethodClick(e, dom),
                icon: "Edit" /* Icons.Edit */,
                size: 1 /* ButtonSize.Compact */,
            }),
        });
    }
    async handlePaymentMethodClick(e, dom) {
        if (this.accountingInfo == null) {
            return;
        }
        const currentPaymentMethod = getPaymentMethodType(this.accountingInfo);
        if (isIOSApp()) {
            // Paid users trying to change payment method on iOS with an active subscription
            if (currentPaymentMethod !== PaymentMethodType.AppStore && this.customer?.type === AccountType.PAID) {
                return Dialog.message(lang.getTranslation("storePaymentMethodChange_msg", { "{AppStorePaymentChange}": "https://tuta.com/support/#appstore-payment-change" /* InfoLink.AppStorePaymentChange */ }));
            }
            return locator.mobilePaymentsFacade.showSubscriptionConfigView();
        }
        else if (hasRunningAppStoreSubscription(this.accountingInfo)) {
            return showManageThroughAppStoreDialog();
        }
        else if (currentPaymentMethod == PaymentMethodType.AppStore && this.customer?.type === AccountType.PAID) {
            // For now we do not allow changing payment method for Paid accounts that use AppStore,
            // they must downgrade to Free first.
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
                return showManageThroughAppStoreDialog();
            }
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
        }
        else {
            const showPaymentMethodDialog = createNotAvailableForFreeClickHandler(NewPaidPlans, () => this.accountingInfo && this.changePaymentMethod(), 
            // iOS app is checked above
            () => locator.logins.getUserController().isPaidAccount());
            showPaymentMethodDialog(e, dom);
        }
    }
    changeInvoiceData() {
        if (this.accountingInfo) {
            const accountingInfo = neverNull(this.accountingInfo);
            const invoiceCountry = accountingInfo.invoiceCountry ? getByAbbreviation(accountingInfo.invoiceCountry) : null;
            InvoiceDataDialog.show(neverNull(neverNull(this.customer).businessUse), {
                invoiceAddress: formatNameAndAddress(accountingInfo.invoiceName, accountingInfo.invoiceAddress),
                country: invoiceCountry,
                vatNumber: accountingInfo.invoiceVatIdNo,
            }, accountingInfo);
        }
    }
    changePaymentMethod() {
        if (this.accountingInfo && hasRunningAppStoreSubscription(this.accountingInfo)) {
            throw new ProgrammingError("Active AppStore subscription");
        }
        let nextPayment = this.amountOwed() * -1;
        showProgressDialog("pleaseWait_msg", locator.bookingFacade.getCurrentPrice().then((priceServiceReturn) => {
            return Math.max(nextPayment, Number(neverNull(priceServiceReturn.currentPriceThisPeriod).price), Number(neverNull(priceServiceReturn.currentPriceNextPeriod).price));
        }))
            .then((price) => getDefaultPaymentMethod().then((paymentMethod) => {
            return { price, paymentMethod };
        }))
            .then(({ price, paymentMethod }) => {
            return PaymentDataDialog.show(neverNull(this.customer), neverNull(this.accountingInfo), price, paymentMethod).then((success) => {
                if (success) {
                    if (this.isPayButtonVisible()) {
                        return this.showPayDialog(this.amountOwed());
                    }
                }
            });
        });
    }
    renderPostings() {
        if (!this.postings || this.postings.length === 0) {
            return null;
        }
        else {
            const balance = this.balance;
            return [
                m(".h4.mt-l", lang.get("currentBalance_label")),
                m(".flex.center-horizontally.center-vertically.col", [
                    m("div.h4.pt.pb" + (this.isAmountOwed() ? ".content-accent-fg" : ""), formatPrice(balance, true) + (this.accountBalance() !== balance ? ` (${formatPrice(this.accountBalance(), true)})` : "")),
                    this.accountBalance() !== balance
                        ? m(".small" + (this.accountBalance() < 0 ? ".content-accent-fg" : ""), lang.get("unprocessedBookings_msg", {
                            "{amount}": formatPrice(assertNotNull(this.outstandingBookingsPrice), true),
                        }))
                        : null,
                    this.isPayButtonVisible()
                        ? m(".pb", {
                            style: {
                                width: "200px",
                            },
                        }, m(LoginButton, {
                            label: "invoicePay_action",
                            onclick: () => this.showPayDialog(this.amountOwed()),
                        }))
                        : null,
                ]),
                this.accountingInfo &&
                    this.accountingInfo.paymentMethod !== PaymentMethodType.Invoice &&
                    (this.isAmountOwed() || (this.invoiceInfo && this.invoiceInfo.paymentErrorInfo))
                    ? this.invoiceInfo && this.invoiceInfo.paymentErrorInfo
                        ? m(".small.underline.b", lang.get(getPreconditionFailedPaymentMsg(this.invoiceInfo.paymentErrorInfo.errorCode)))
                        : m(".small.underline.b", lang.get("failedDebitAttempt_msg"))
                    : null,
                m(".flex-space-between.items-center.mt-l.mb-s", [
                    m(".h4", lang.get("postings_label")),
                    m(ExpanderButton, {
                        label: "show_action",
                        expanded: this.postingsExpanded,
                        onExpandedChange: (expanded) => (this.postingsExpanded = expanded),
                    }),
                ]),
                m(ExpanderPanel, {
                    expanded: this.postingsExpanded,
                }, m(Table, {
                    columnHeading: ["type_label", "amount_label"],
                    columnWidths: [".column-width-largest" /* ColumnWidth.Largest */, ".column-width-small" /* ColumnWidth.Small */, ".column-width-small" /* ColumnWidth.Small */],
                    columnAlignments: [false, true, false],
                    showActionButtonColumn: true,
                    lines: this.postings.map((posting) => this.postingLineAttrs(posting)),
                })),
                m(".small", lang.get("invoiceSettingDescription_msg") + " " + lang.get("laterInvoicingInfo_msg")),
            ];
        }
    }
    postingLineAttrs(posting) {
        return {
            cells: () => [
                {
                    main: getPostingTypeText(posting),
                    info: [formatDate(posting.valueDate)],
                },
                {
                    main: formatPrice(Number(posting.amount), true),
                },
            ],
            actionButtonAttrs: posting.type === "1" /* PostingType.UsageFee */ || posting.type === "2" /* PostingType.Credit */ || posting.type === "9" /* PostingType.SalesCommission */
                ? {
                    title: "download_action",
                    icon: "Download" /* Icons.Download */,
                    size: 1 /* ButtonSize.Compact */,
                    click: (e, dom) => {
                        if (this.customer?.businessUse) {
                            createDropdown({
                                width: 300,
                                lazyButtons: () => [
                                    {
                                        label: "downloadInvoicePdf_action",
                                        click: () => this.doPdfInvoiceDownload(posting),
                                    },
                                    {
                                        label: "downloadInvoiceXml_action",
                                        click: () => this.doXrechnungInvoiceDownload(posting),
                                    },
                                ],
                            })(e, dom);
                        }
                        else {
                            this.doPdfInvoiceDownload(posting);
                        }
                    },
                }
                : null,
        };
    }
    async doPdfInvoiceDownload(posting) {
        if (client.compressionStreamSupported()) {
            return showProgressDialog("pleaseWait_msg", locator.customerFacade.generatePdfInvoice(neverNull(posting.invoiceNumber))).then((pdfInvoice) => locator.fileController.saveDataFile(pdfInvoice));
        }
        else {
            if (client.device == "Android" /* DeviceType.ANDROID */) {
                return Dialog.message("invoiceFailedWebview_msg", () => m("div", m("a", { href: "https://tuta.com/faq#webview" /* InfoLink.Webview */, target: "_blank" }, "https://tuta.com/faq#webview" /* InfoLink.Webview */)));
            }
            else if (client.isIos()) {
                return Dialog.message("invoiceFailedIOS_msg");
            }
            else {
                return Dialog.message("invoiceFailedBrowser_msg");
            }
        }
    }
    async doXrechnungInvoiceDownload(posting) {
        return showProgressDialog("pleaseWait_msg", locator.customerFacade.generateXRechnungInvoice(neverNull(posting.invoiceNumber)).then((xInvoice) => locator.fileController.saveDataFile(xInvoice)));
    }
    updateAccountingInfoData(accountingInfo) {
        this.accountingInfo = accountingInfo;
        this.invoiceAddressField.setValue(formatNameAndAddress(accountingInfo.invoiceName, accountingInfo.invoiceAddress, accountingInfo.invoiceCountry ?? undefined));
        m.redraw();
    }
    accountBalance() {
        return this.balance - assertNotNull(this.outstandingBookingsPrice);
    }
    amountOwed() {
        if (this.balance != null) {
            let balance = this.balance;
            if (balance < 0) {
                return balance;
            }
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
            m.redraw();
        });
    }
    async entityEventsReceived(updates) {
        for (const update of updates) {
            await this.processEntityUpdate(update);
        }
    }
    async processEntityUpdate(update) {
        const { instanceId } = update;
        if (isUpdateForTypeRef(AccountingInfoTypeRef, update)) {
            const accountingInfo = await locator.entityClient.load(AccountingInfoTypeRef, instanceId);
            this.updateAccountingInfoData(accountingInfo);
        }
        else if (isUpdateForTypeRef(CustomerTypeRef, update)) {
            this.customer = await locator.logins.getUserController().loadCustomer();
            m.redraw();
        }
        else if (isUpdateForTypeRef(InvoiceInfoTypeRef, update)) {
            this.invoiceInfo = await locator.entityClient.load(InvoiceInfoTypeRef, instanceId);
            m.redraw();
        }
    }
    isPayButtonVisible() {
        return (this.accountingInfo != null &&
            (this.accountingInfo.paymentMethod === PaymentMethodType.CreditCard || this.accountingInfo.paymentMethod === PaymentMethodType.Paypal) &&
            this.isAmountOwed());
    }
    showPayDialog(openBalance) {
        return showPayConfirmDialog(openBalance)
            .then((confirmed) => {
            if (confirmed) {
                return showProgressDialog("pleaseWait_msg", locator.serviceExecutor
                    .put(DebitService, createDebitServicePutData({ invoice: null }))
                    .catch(ofClass(LockedError, () => "operationStillActive_msg"))
                    .catch(ofClass(PreconditionFailedError, (error) => getPreconditionFailedPaymentMsg(error.data)))
                    .catch(ofClass(BadGatewayError, () => "paymentProviderNotAvailableError_msg"))
                    .catch(ofClass(TooManyRequestsError, () => "tooManyAttempts_msg")));
            }
        })
            .then((errorId) => {
            if (errorId) {
                return Dialog.message(errorId);
            }
            else {
                return this.loadPostings();
            }
        });
    }
    renderInvoiceData() {
        return [
            m(".flex-space-between.items-center.mt-l.mb-s", [
                m(".h4", lang.get("invoiceData_msg")),
                m(IconButton, {
                    title: "invoiceData_msg",
                    click: createNotAvailableForFreeClickHandler(NewPaidPlans, () => this.changeInvoiceData(), () => locator.logins.getUserController().isPaidAccount()),
                    icon: "Edit" /* Icons.Edit */,
                    size: 1 /* ButtonSize.Compact */,
                }),
            ]),
            m(this.invoiceAddressField),
            this.accountingInfo && this.accountingInfo.invoiceVatIdNo.trim().length > 0
                ? m(TextField, {
                    label: "invoiceVatIdNo_label",
                    value: this.accountingInfo ? this.accountingInfo.invoiceVatIdNo : lang.get("loading_msg"),
                    isReadOnly: true,
                })
                : null,
        ];
    }
}
function showPayConfirmDialog(price) {
    return new Promise((resolve) => {
        let dialog;
        const doAction = (res) => {
            dialog.close();
            resolve(res);
        };
        const actionBarAttrs = {
            left: [
                {
                    label: "cancel_action",
                    click: () => doAction(false),
                    type: "secondary" /* ButtonType.Secondary */,
                },
            ],
            right: [
                {
                    label: "invoicePay_action",
                    click: () => doAction(true),
                    type: "primary" /* ButtonType.Primary */,
                },
            ],
            middle: "adminPayment_action",
        };
        dialog = new Dialog("EditSmall" /* DialogType.EditSmall */, {
            view: () => [
                m(DialogHeaderBar, actionBarAttrs),
                m(".plr-l.pb", m("", [
                    m(".pt", lang.get("invoicePayConfirm_msg")),
                    m(TextField, {
                        label: "price_label",
                        value: formatPrice(-price, true),
                        isReadOnly: true,
                    }),
                ])),
            ],
        })
            .setCloseHandler(() => doAction(false))
            .show();
    });
}
function getPostingTypeText(posting) {
    switch (posting.type) {
        case "1" /* PostingType.UsageFee */:
            return lang.get("invoice_label");
        case "2" /* PostingType.Credit */:
            return lang.get("credit_label");
        case "5" /* PostingType.Payment */:
            return lang.get("adminPayment_action");
        case "6" /* PostingType.Refund */:
            return lang.get("refund_label");
        case "8" /* PostingType.GiftCard */:
            return Number(posting.amount) < 0 ? lang.get("boughtGiftCardPosting_label") : lang.get("redeemedGiftCardPosting_label");
        case "9" /* PostingType.SalesCommission */:
            return Number(posting.amount) < 0 ? lang.get("cancelledReferralCreditPosting_label") : lang.get("referralCreditPosting_label");
        default:
            return "";
        // Generic, Dispute, Suspension, SuspensionCancel
    }
}
export async function showManageThroughAppStoreDialog() {
    const confirmed = await Dialog.confirm(lang.getTranslation("storeSubscription_msg", {
        "{AppStorePayment}": "https://tuta.com/support/#appstore-payments" /* InfoLink.AppStorePayment */,
    }));
    if (confirmed) {
        window.open("https://apps.apple.com/account/subscriptions", "_blank", "noopener,noreferrer");
    }
}
//# sourceMappingURL=PaymentViewer.js.map