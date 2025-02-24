import m from "mithril";
import stream from "mithril/stream";
import { mapNullable, neverNull, noOp, ofClass } from "@tutao/tutanota-utils";
import { createWizardDialog, emitWizardEvent, wizardPageWrapper } from "../../gui/base/WizardDialog.js";
import { Dialog } from "../../gui/base/Dialog";
import { LoginForm } from "../../../common/login/LoginForm";
import { CredentialsSelector } from "../../../common/login/CredentialsSelector";
import { showProgressDialog } from "../../gui/dialogs/ProgressDialog";
import { SignupForm } from "../SignupForm";
import { UserError } from "../../api/main/UserError";
import { showUserError } from "../../misc/ErrorHandlerImpl";
import { AccountingInfoTypeRef, CustomerInfoTypeRef } from "../../api/entities/sys/TypeRefs.js";
import { locator } from "../../api/main/CommonLocator";
import { getTokenFromUrl, renderAcceptGiftCardTermsCheckbox, renderGiftCardSvg } from "./GiftCardUtils";
import { CancelledError } from "../../api/common/error/CancelledError";
import { lang } from "../../misc/LanguageViewModel";
import { getLoginErrorMessage, handleExpectedLoginError } from "../../misc/LoginUtils";
import { RecoverCodeField } from "../../settings/login/RecoverCodeDialog.js";
import { HabReminderImage } from "../../gui/base/icons/Icons";
import { PaymentMethodType, PlanType } from "../../api/common/TutanotaConstants";
import { formatPrice, getPaymentMethodName, PriceAndConfigProvider } from "../PriceUtils";
import { TextField } from "../../gui/base/TextField.js";
import { elementIdPart, isSameId } from "../../api/common/utils/EntityUtils";
import { NotAuthorizedError, NotFoundError } from "../../api/common/error/RestError.js";
import { getByAbbreviation } from "../../api/common/CountryList.js";
import { renderCountryDropdown } from "../../gui/base/GuiUtils.js";
import { LoginButton } from "../../gui/base/buttons/LoginButton.js";
class RedeemGiftCardModel {
    config;
    giftCardFacade;
    credentialsProvider;
    secondFactorHandler;
    logins;
    entityClient;
    mailAddress = "";
    newAccountData = null;
    credentialsMethod = 1 /* GetCredentialsMethod.Signup */;
    // accountingInfo is loaded after the user logs in, before redeeming the gift card
    accountingInfo = null;
    constructor(config, giftCardFacade, credentialsProvider, secondFactorHandler, logins, entityClient) {
        this.config = config;
        this.giftCardFacade = giftCardFacade;
        this.credentialsProvider = credentialsProvider;
        this.secondFactorHandler = secondFactorHandler;
        this.logins = logins;
        this.entityClient = entityClient;
    }
    get giftCardInfo() {
        return this.config.giftCardInfo;
    }
    get giftCardId() {
        return elementIdPart(this.giftCardInfo.giftCard);
    }
    get key() {
        return this.config.key;
    }
    get premiumPrice() {
        return this.config.premiumPrice;
    }
    get message() {
        return this.config.giftCardInfo.message;
    }
    get paymentMethod() {
        return this.accountingInfo?.paymentMethod ?? PaymentMethodType.AccountBalance;
    }
    get storedCredentials() {
        return this.config.storedCredentials;
    }
    async loginWithStoredCredentials(encryptedCredentials) {
        if (this.logins.isUserLoggedIn() && isSameId(this.logins.getUserController().user._id, encryptedCredentials.userId)) {
            // If the user is logged in already (because they selected credentials and then went back) we dont have to do
            // anything, so just move on
            await this.postLogin();
        }
        else {
            await this.logins.logout(false);
            const credentials = await this.credentialsProvider.getDecryptedCredentialsByUserId(encryptedCredentials.userId);
            if (credentials) {
                await this.logins.resumeSession(credentials, null, null);
                await this.postLogin();
            }
        }
    }
    async loginWithFormCredentials(mailAddress, password) {
        this.mailAddress = mailAddress;
        // If they try to login with a mail address that is stored, we want to swap out the old session with a new one
        await this.logins.logout(false);
        await this.logins.createSession(mailAddress, password, 1 /* SessionType.Temporary */);
        await this.postLogin();
    }
    async handleNewSignup(newAccountData) {
        if (newAccountData || this.newAccountData) {
            // if there's an existing account it means the signup form was readonly
            // because we came back from the next page after having already signed up
            if (!this.newAccountData) {
                this.newAccountData = newAccountData;
            }
            const { mailAddress, password } = neverNull(newAccountData || this.newAccountData);
            this.mailAddress = mailAddress;
            await this.logins.createSession(mailAddress, password, 1 /* SessionType.Temporary */);
            await this.postLogin();
        }
    }
    async redeemGiftCard(country) {
        if (country == null) {
            throw new UserError("invoiceCountryInfoBusiness_msg");
        }
        return this.giftCardFacade
            .redeemGiftCard(this.giftCardId, this.key, country?.a ?? null)
            .catch(ofClass(NotFoundError, () => {
            throw new UserError("invalidGiftCard_msg");
        }))
            .catch(ofClass(NotAuthorizedError, (e) => {
            throw new UserError(lang.makeTranslation("error_msg", e.message));
        }));
    }
    async postLogin() {
        if (!this.logins.getUserController().isGlobalAdmin()) {
            throw new UserError("onlyAccountAdminFeature_msg");
        }
        await this.secondFactorHandler.closeWaitingForSecondFactorDialog();
        const customer = await this.logins.getUserController().loadCustomer();
        const customerInfo = await this.entityClient.load(CustomerInfoTypeRef, customer.customerInfo);
        this.accountingInfo = await this.entityClient.load(AccountingInfoTypeRef, customerInfo.accountingInfo);
        if (PaymentMethodType.AppStore === this.accountingInfo.paymentMethod) {
            throw new UserError("redeemGiftCardWithAppStoreSubscription_msg");
        }
        if (customer.businessUse) {
            throw new UserError("onlyPrivateAccountFeature_msg");
        }
    }
}
/**
 * This page gives the user the option to either signup or login to an account with which to redeem their gift card.
 */
class GiftCardWelcomePage {
    dom;
    oncreate(vnodeDOM) {
        this.dom = vnodeDOM.dom;
    }
    view(vnode) {
        const a = vnode.attrs;
        const nextPage = (method) => {
            locator.logins.logout(false).then(() => {
                a.data.credentialsMethod = method;
                emitWizardEvent(this.dom, "showNextWizardDialogPage" /* WizardEventType.SHOW_NEXT_PAGE */);
            });
        };
        return [
            m(".flex-center.full-width.pt-l", m(".pt-l", // Needed to center SVG
            {
                style: {
                    width: "480px",
                },
            }, renderGiftCardSvg(parseFloat(a.data.giftCardInfo.value), null, a.data.message))),
            m(".flex-center.full-width.pt-l", m(LoginButton, {
                label: "existingAccount_label",
                class: "small-login-button",
                onclick: () => nextPage(0 /* GetCredentialsMethod.Login */),
            })),
            m(".flex-center.full-width.pt-l.pb", m(LoginButton, {
                label: "register_label",
                class: "small-login-button",
                onclick: () => nextPage(1 /* GetCredentialsMethod.Signup */),
            })),
        ];
    }
}
/**
 * This page will either show a signup or login form depending on how they choose to select their credentials
 * When they go to the next page the will be logged in.
 */
class GiftCardCredentialsPage {
    domElement = null;
    loginFormHelpText = lang.get("emptyString_msg");
    mailAddress = stream("");
    password = stream("");
    oncreate(vnode) {
        this.domElement = vnode.dom;
    }
    view(vnode) {
        const data = vnode.attrs.data;
        switch (data.credentialsMethod) {
            case 0 /* GetCredentialsMethod.Login */:
                return this.renderLoginPage(data);
            case 1 /* GetCredentialsMethod.Signup */:
                return this.renderSignupPage(data);
        }
    }
    onremove() {
        this.password("");
    }
    renderLoginPage(model) {
        return [
            m(".flex-grow.flex-center.scroll", m(".flex-grow-shrink-auto.max-width-s.pt.plr-l", [this.renderLoginForm(model), this.renderCredentialsSelector(model)])),
        ];
    }
    renderLoginForm(model) {
        return m(LoginForm, {
            onSubmit: async (mailAddress, password) => {
                if (mailAddress === "" || password === "") {
                    this.loginFormHelpText = lang.get("loginFailed_msg");
                }
                else {
                    try {
                        // If they try to login with a mail address that is stored, we want to swap out the old session with a new one
                        await showProgressDialog("pleaseWait_msg", model.loginWithFormCredentials(this.mailAddress(), this.password()));
                        emitWizardEvent(this.domElement, "showNextWizardDialogPage" /* WizardEventType.SHOW_NEXT_PAGE */);
                    }
                    catch (e) {
                        if (e instanceof UserError) {
                            showUserError(e);
                        }
                        else {
                            this.loginFormHelpText = lang.getTranslationText(getLoginErrorMessage(e, false));
                        }
                    }
                }
            },
            mailAddress: this.mailAddress,
            password: this.password,
            helpText: this.loginFormHelpText,
        });
    }
    renderCredentialsSelector(model) {
        if (model.storedCredentials.length === 0) {
            return null;
        }
        return m(CredentialsSelector, {
            credentials: model.storedCredentials,
            onCredentialsSelected: async (encryptedCredentials) => {
                try {
                    await showProgressDialog("pleaseWait_msg", model.loginWithStoredCredentials(encryptedCredentials));
                    emitWizardEvent(this.domElement, "showNextWizardDialogPage" /* WizardEventType.SHOW_NEXT_PAGE */);
                }
                catch (e) {
                    if (e instanceof UserError) {
                        showUserError(e);
                    }
                    else {
                        this.loginFormHelpText = lang.getTranslationText(getLoginErrorMessage(e, false));
                        handleExpectedLoginError(e, noOp);
                    }
                }
            },
        });
    }
    renderSignupPage(model) {
        return m(SignupForm, {
            // After having an account created we log them in to be in the same state as if they had selected an existing account
            onComplete: (newAccountData) => {
                showProgressDialog("pleaseWait_msg", model
                    .handleNewSignup(newAccountData)
                    .then(() => {
                    emitWizardEvent(this.domElement, "showNextWizardDialogPage" /* WizardEventType.SHOW_NEXT_PAGE */);
                    m.redraw();
                })
                    .catch((e) => {
                    // TODO when would login fail here and how does it get handled? can we attempt to login again?
                    Dialog.message("giftCardLoginError_msg");
                    m.route.set("/login", {
                        noAutoLogin: true,
                    });
                }));
            },
            onChangePlan: () => {
                emitWizardEvent(this.domElement, "showPreviousWizardDialogPage" /* WizardEventType.SHOW_PREVIOUS_PAGE */);
            },
            readonly: model.newAccountData != null,
            prefilledMailAddress: model.newAccountData ? model.newAccountData.mailAddress : "",
            isBusinessUse: () => false,
            isPaidSubscription: () => true,
            campaign: () => null,
        });
    }
}
class RedeemGiftCardPage {
    confirmed = false;
    showCountryDropdown;
    country;
    dom;
    constructor({ attrs }) {
        // we expect that the accounting info is actually available by now,
        // but we optional chain because invoiceCountry is nullable anyway
        this.country = mapNullable(attrs.data.accountingInfo?.invoiceCountry, getByAbbreviation);
        // if a country is already set, then we don't need to ask for one
        this.showCountryDropdown = this.country == null;
    }
    oncreate(vnodeDOM) {
        this.dom = vnodeDOM.dom;
    }
    view(vnode) {
        const model = vnode.attrs.data;
        const isFree = locator.logins.getUserController().isFreeAccount();
        return m("", [
            mapNullable(model.newAccountData?.recoverCode, (code) => m(".pt-l.plr-l", m(RecoverCodeField, {
                showMessage: true,
                recoverCode: code,
            }))),
            isFree ? this.renderInfoForFreeAccounts(model) : this.renderInfoForPaidAccounts(model),
            m(".flex-center.full-width.pt-l", m("", {
                style: {
                    maxWidth: "620px",
                },
            }, [
                this.showCountryDropdown
                    ? renderCountryDropdown({
                        selectedCountry: this.country,
                        onSelectionChanged: (country) => (this.country = country),
                        helpLabel: () => lang.get("invoiceCountryInfoConsumer_msg"),
                    })
                    : null,
                renderAcceptGiftCardTermsCheckbox(this.confirmed, (confirmed) => (this.confirmed = confirmed)),
            ])),
            m(".flex-center.full-width.pt-s.pb", m(LoginButton, {
                label: "redeem_label",
                class: "small-login-button",
                onclick: () => {
                    if (!this.confirmed) {
                        Dialog.message("termsAcceptedNeutral_msg");
                        return;
                    }
                    model
                        .redeemGiftCard(this.country)
                        .then(() => emitWizardEvent(this.dom, "closeWizardDialog" /* WizardEventType.CLOSE_DIALOG */))
                        .catch(ofClass(UserError, showUserError))
                        .catch(ofClass(CancelledError, noOp));
                },
            })),
        ]);
    }
    getCreditOrDebitMessage(model) {
        const remainingAmount = Number(model.giftCardInfo.value) - model.premiumPrice;
        if (remainingAmount > 0) {
            return `${lang.get("giftCardUpgradeNotifyCredit_msg", {
                "{price}": formatPrice(model.premiumPrice, true),
                "{amount}": formatPrice(remainingAmount, true),
            })} ${lang.get("creditUsageOptions_msg")}`;
        }
        else if (remainingAmount < 0) {
            return lang.get("giftCardUpgradeNotifyDebit_msg", {
                "{price}": formatPrice(model.premiumPrice, true),
                "{amount}": formatPrice(remainingAmount * -1, true),
            });
        }
        else {
            return "";
        }
    }
    renderInfoForFreeAccounts(model) {
        return [
            m(".pt-l.plr-l", `${lang.get("giftCardUpgradeNotifyRevolutionary_msg")} ${this.getCreditOrDebitMessage(model)}`),
            m(".center.h4.pt", lang.get("upgradeConfirm_msg")),
            m(".flex-space-around.flex-wrap", [
                m(".flex-grow-shrink-half.plr-l", [
                    m(TextField, {
                        label: "subscription_label",
                        value: "Revolutionary",
                        isReadOnly: true,
                    }),
                    m(TextField, {
                        label: "paymentInterval_label",
                        value: lang.get("pricing.yearly_label"),
                        isReadOnly: true,
                    }),
                    m(TextField, {
                        label: "price_label",
                        value: formatPrice(Number(model.premiumPrice), true) + " " + lang.get("pricing.perYear_label"),
                        isReadOnly: true,
                    }),
                    m(TextField, {
                        label: "paymentMethod_label",
                        value: getPaymentMethodName(model.paymentMethod),
                        isReadOnly: true,
                    }),
                ]),
                m(".flex-grow-shrink-half.plr-l.flex-center.items-end", m("img[src=" + HabReminderImage + "].pt.bg-white.border-radius", {
                    style: {
                        width: "200px",
                    },
                })),
            ]),
        ];
    }
    renderInfoForPaidAccounts(model) {
        return [
            m(".pt-l.plr-l.flex-center", `${lang.get("giftCardCreditNotify_msg", {
                "{credit}": formatPrice(Number(model.giftCardInfo.value), true),
            })} ${lang.get("creditUsageOptions_msg")}`),
            m(".flex-grow-shrink-half.plr-l.flex-center.items-end", m("img[src=" + HabReminderImage + "].pt.bg-white.border-radius", {
                style: {
                    width: "200px",
                },
            })),
        ];
    }
}
export async function loadRedeemGiftCardWizard(hashFromUrl) {
    const model = await loadModel(hashFromUrl);
    const wizardPages = [
        wizardPageWrapper(GiftCardWelcomePage, {
            data: model,
            headerTitle: () => "giftCard_label",
            nextAction: async () => true,
            isSkipAvailable: () => false,
            isEnabled: () => true,
        }),
        wizardPageWrapper(GiftCardCredentialsPage, {
            data: model,
            headerTitle: () => (model.credentialsMethod === 1 /* GetCredentialsMethod.Signup */ ? "register_label" : "login_label"),
            nextAction: async () => true,
            isSkipAvailable: () => false,
            isEnabled: () => true,
        }),
        wizardPageWrapper(RedeemGiftCardPage, {
            data: model,
            headerTitle: () => "redeem_label",
            nextAction: async () => true,
            isSkipAvailable: () => false,
            isEnabled: () => true,
        }),
    ];
    return createWizardDialog(model, wizardPages, async () => {
        const urlParams = model.mailAddress ? { loginWith: model.mailAddress, noAutoLogin: true } : {};
        m.route.set("/login", urlParams);
    }, "EditLarge" /* DialogType.EditLarge */).dialog;
}
async function loadModel(hashFromUrl) {
    const { id, key } = await getTokenFromUrl(hashFromUrl);
    const giftCardInfo = await locator.giftCardFacade.getGiftCardInfo(id, key);
    const storedCredentials = await locator.credentialsProvider.getInternalCredentialsInfos();
    const pricesDataProvider = await PriceAndConfigProvider.getInitializedInstance(null, locator.serviceExecutor, null);
    return new RedeemGiftCardModel({
        giftCardInfo,
        key,
        premiumPrice: pricesDataProvider.getSubscriptionPrice(12 /* PaymentInterval.Yearly */, PlanType.Revolutionary, "1" /* UpgradePriceType.PlanActualPrice */),
        storedCredentials,
    }, locator.giftCardFacade, locator.credentialsProvider, locator.secondFactorHandler, locator.logins, locator.entityClient);
}
//# sourceMappingURL=RedeemGiftCardWizard.js.map