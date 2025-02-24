import m from "mithril";
import { client } from "../misc/ClientDetector.js";
import { assertMainOrNode, isApp, isDesktop } from "../api/common/Env";
import { lang } from "../misc/LanguageViewModel.js";
import { defer, mapNullable } from "@tutao/tutanota-utils";
import { showProgressDialog } from "../gui/dialogs/ProgressDialog";
import { windowFacade } from "../misc/WindowFacade.js";
import { Button } from "../gui/base/Button.js";
import { landmarkAttrs, liveDataAttrs } from "../gui/AriaUtils";
import { LoginForm } from "./LoginForm.js";
import { CredentialsSelector } from "./CredentialsSelector.js";
import { getWhitelabelCustomizations } from "../misc/WhitelabelCustomizations.js";
import { createAsyncDropdown } from "../gui/base/Dropdown.js";
import { IconButton } from "../gui/base/IconButton.js";
import { BaseTopLevelView } from "../gui/BaseTopLevelView.js";
import { LoginScreenHeader } from "../gui/LoginScreenHeader.js";
import { styles } from "../gui/styles.js";
import { locator } from "../api/main/CommonLocator.js";
import { renderInfoLinks } from "../gui/RenderLoginInfoLinks.js";
import { showSnackBar } from "../gui/base/SnackBar.js";
assertMainOrNode();
/** create a string provider that changes periodically until promise is resolved */
function makeDynamicLoggingInMessage(promise) {
    const messageArray = [
        "dynamicLoginDecryptingMails_msg",
        "dynamicLoginOrganizingCalendarEvents_msg",
        "dynamicLoginSortingContacts_msg",
        "dynamicLoginUpdatingOfflineDatabase_msg",
        "dynamicLoginCyclingToWork_msg",
        "dynamicLoginRestockingTutaFridge_msg",
        "dynamicLoginPreparingRocketLaunch_msg",
        "dynamicLoginSwitchingOnPrivacy_msg",
    ];
    let currentMessage = "login_msg";
    let messageIndex = 0;
    const messageIntervalId = setInterval(() => {
        currentMessage = messageArray[messageIndex];
        messageIndex = ++messageIndex % 8;
        m.redraw();
    }, 4000 /** spinner spins every 2s */);
    promise.finally(() => clearInterval(messageIntervalId));
    return () => currentMessage;
}
export class LoginView extends BaseTopLevelView {
    viewModel;
    defaultRedirect;
    initPromise;
    moreExpanded;
    // we save the login form because we need access to the password input field inside of it for when "loginWith" is set in the url,
    // in order to focus it
    loginForm;
    selectedRedirect;
    bottomMargin = 0;
    constructor({ attrs }) {
        super();
        this.defaultRedirect = attrs.targetPath;
        this.selectedRedirect = this.defaultRedirect;
        this.loginForm = defer();
        this.moreExpanded = false;
        this.viewModel = attrs.makeViewModel();
        this.initPromise = this.viewModel.init().then(m.redraw);
    }
    keyboardListener = (keyboardSize) => {
        this.bottomMargin = keyboardSize;
        m.redraw();
    };
    view({ attrs }) {
        return m("#login-view.main-view.flex.col.nav-bg", {
            oncreate: () => windowFacade.addKeyboardSizeListener(this.keyboardListener),
            onremove: () => windowFacade.removeKeyboardSizeListener(this.keyboardListener),
            style: {
                marginBottom: this.bottomMargin + "px",
            },
        }, [
            m(LoginScreenHeader),
            m(".flex-grow.flex-center.scroll", m(".flex.col.flex-grow-shrink-auto.max-width-m.plr-l." + (styles.isSingleColumnLayout() ? "pt" : "pt-l"), {
                ...landmarkAttrs("main" /* AriaLandmarks.Main */, isApp() || isDesktop() ? lang.get("addAccount_action") : lang.get("login_label")),
                oncreate: (vnode) => {
                    ;
                    vnode.dom.focus();
                },
            }, [
                m(".content-bg.border-radius-big.pb", {
                    class: styles.isSingleColumnLayout() ? "plr-l" : "plr-2l",
                }, this._renderFormForDisplayMode(), this.renderMoreOptions()),
                m(".flex-grow"),
                !(isApp() || isDesktop()) && this.viewModel.shouldShowAppButtons() ? this._renderAppButtons() : null,
                renderInfoLinks(),
            ])),
        ]);
    }
    _renderFormForDisplayMode() {
        switch (this.viewModel.displayMode) {
            case "deleteCredentials" /* DisplayMode.DeleteCredentials */:
            case "credentials" /* DisplayMode.Credentials */:
                return this._renderCredentialsSelector();
            case "form" /* DisplayMode.Form */:
                return this._renderLoginForm();
        }
    }
    renderMoreOptions() {
        return m(".flex-center.flex-column", [
            this._loginAnotherLinkVisible()
                ? m(Button, {
                    label: "loginOtherAccount_action",
                    type: "secondary" /* ButtonType.Secondary */,
                    click: () => {
                        this.viewModel.showLoginForm();
                    },
                })
                : null,
            this._deleteCredentialsLinkVisible()
                ? m(Button, {
                    label: this.viewModel.displayMode === "deleteCredentials" /* DisplayMode.DeleteCredentials */ ? "cancel_action" : "removeAccount_action",
                    type: "secondary" /* ButtonType.Secondary */,
                    click: () => this._switchDeleteCredentialsState(),
                })
                : null,
            this._knownCredentialsLinkVisible()
                ? m(Button, {
                    label: "knownCredentials_label",
                    type: "secondary" /* ButtonType.Secondary */,
                    click: () => this.viewModel.showCredentials(),
                })
                : null,
            this._signupLinkVisible()
                ? m(Button, {
                    label: "register_label",
                    type: "secondary" /* ButtonType.Secondary */,
                    click: () => m.route.set("/signup"),
                })
                : null,
            this._switchThemeLinkVisible()
                ? m(Button, {
                    label: "switchColorTheme_action",
                    type: "secondary" /* ButtonType.Secondary */,
                    click: this.themeSwitchListener(),
                })
                : null,
            this._recoverLoginVisible()
                ? m(Button, {
                    label: "recoverAccountAccess_action",
                    click: () => {
                        m.route.set("/recover");
                    },
                    type: "secondary" /* ButtonType.Secondary */,
                })
                : null,
        ]);
    }
    themeSwitchListener() {
        return createAsyncDropdown({
            lazyButtons: async () => {
                const defaultButtons = [
                    {
                        label: "systemThemePref_label",
                        click: () => locator.themeController.setThemePreference("auto:light|dark"),
                    },
                    {
                        label: "light_label",
                        click: () => locator.themeController.setThemePreference("light"),
                    },
                    {
                        label: "dark_label",
                        click: () => locator.themeController.setThemePreference("dark"),
                    },
                    {
                        label: client.isCalendarApp() ? "light_red_label" : "light_blue_label",
                        click: () => locator.themeController.setThemePreference("light_secondary"),
                    },
                    {
                        label: client.isCalendarApp() ? "dark_red_label" : "dark_blue_label",
                        click: () => locator.themeController.setThemePreference("dark_secondary"),
                    },
                ];
                const customButtons = (await locator.themeController.getCustomThemes()).map((themeId) => {
                    return {
                        label: lang.makeTranslation(themeId, themeId),
                        click: () => locator.themeController.setThemePreference(themeId),
                    };
                });
                return defaultButtons.concat(customButtons);
            },
            width: 300,
        });
    }
    _signupLinkVisible() {
        return this.viewModel.displayMode === "form" /* DisplayMode.Form */ && this.viewModel.shouldShowSignup();
    }
    _loginAnotherLinkVisible() {
        return this.viewModel.displayMode === "credentials" /* DisplayMode.Credentials */ || this.viewModel.displayMode === "deleteCredentials" /* DisplayMode.DeleteCredentials */;
    }
    _deleteCredentialsLinkVisible() {
        return this.viewModel.displayMode === "credentials" /* DisplayMode.Credentials */ || this.viewModel.displayMode === "deleteCredentials" /* DisplayMode.DeleteCredentials */;
    }
    _knownCredentialsLinkVisible() {
        return this.viewModel.displayMode === "form" /* DisplayMode.Form */ && this.viewModel.getSavedCredentials().length > 0;
    }
    _switchThemeLinkVisible() {
        return locator.themeController.shouldAllowChangingTheme();
    }
    _recoverLoginVisible() {
        return this.viewModel.shouldShowRecover();
    }
    _renderLoginForm() {
        return m(".flex.col.pb", [
            m(LoginForm, {
                oncreate: (vnode) => {
                    const form = vnode;
                    this.loginForm.resolve(form.state);
                },
                onremove: () => {
                    // we need to re-resolve this promise sometimes and for that we
                    // need a new promise. otherwise, callbacks that are registered after
                    // this point never get called because they have been registered after
                    // it was resolved the first time.
                    this.loginForm = defer();
                },
                onSubmit: () => this._loginWithProgressDialog(),
                mailAddress: this.viewModel.mailAddress,
                password: this.viewModel.password,
                savePassword: this.viewModel.savePassword,
                helpText: lang.getTranslationText(this.viewModel.helpText),
                invalidCredentials: this.viewModel.state === "InvalidCredentials" /* LoginState.InvalidCredentials */,
                showRecoveryOption: this._recoverLoginVisible(),
                accessExpired: this.viewModel.state === "AccessExpired" /* LoginState.AccessExpired */,
            }),
        ]);
    }
    async _loginWithProgressDialog() {
        const loginPromise = this.viewModel.login();
        const dynamicMessage = makeDynamicLoggingInMessage(loginPromise);
        await showProgressDialog(dynamicMessage, loginPromise);
        if (this.viewModel.state === "LoggedIn" /* LoginState.LoggedIn */) {
            m.route.set(this.selectedRedirect);
        }
    }
    _renderCredentialsSelector() {
        return m(".flex.col.pb-l", [
            m(".small.center.statusTextColor", {
                ...liveDataAttrs(),
                class: styles.isSingleColumnLayout() ? "" : "pt-xs",
            }, lang.getTranslationText(this.viewModel.helpText)),
            m(CredentialsSelector, {
                credentials: this.viewModel.getSavedCredentials(),
                onCredentialsSelected: async (c) => {
                    await this.viewModel.useCredentials(c);
                    await this._loginWithProgressDialog();
                },
                onCredentialsDeleted: this.viewModel.displayMode === "deleteCredentials" /* DisplayMode.DeleteCredentials */
                    ? (credentials) => {
                        this.viewModel.deleteCredentials(credentials).then((result) => {
                            if (result == "networkError") {
                                showSnackBar({
                                    message: "deleteCredentialOffline_msg",
                                    button: {
                                        label: "ok_action",
                                        click: () => { },
                                    },
                                });
                            }
                            m.redraw();
                        });
                    }
                    : null,
            }),
        ]);
    }
    _renderAppButtons() {
        return m(".flex-center.pt-l.ml-between-s", [
            client.isDesktopDevice() || client.device === "Android" /* DeviceType.ANDROID */
                ? m(IconButton, {
                    title: "appInfoAndroidImageAlt_alt",
                    click: (e) => {
                        this._openUrl("https://play.google.com/store/apps/details?id=de.tutao.tutanota");
                        e.preventDefault();
                    },
                    icon: "Android" /* BootIcons.Android */,
                })
                : null,
            client.isDesktopDevice() || client.device === "iPad" /* DeviceType.IPAD */ || client.device === "iPhone" /* DeviceType.IPHONE */
                ? m(IconButton, {
                    title: "appInfoIosImageAlt_alt",
                    click: (e) => {
                        this._openUrl("https://itunes.apple.com/app/tutanota/id922429609?mt=8&uo=4&at=10lSfb");
                        e.preventDefault();
                    },
                    icon: "Apple" /* BootIcons.Apple */,
                })
                : null,
            client.isDesktopDevice() || client.device === "Android" /* DeviceType.ANDROID */
                ? m(IconButton, {
                    title: "appInfoFDroidImageAlt_alt",
                    click: (e) => {
                        this._openUrl("https://f-droid.org/packages/de.tutao.tutanota/");
                        e.preventDefault();
                    },
                    icon: "FDroid" /* BootIcons.FDroid */,
                })
                : null,
        ]);
    }
    onNewUrl(args, requestedPath) {
        if (args.requestedPath) {
            this.selectedRedirect = args.requestedPath;
        }
        else if (args.action) {
            // Action needs be forwarded this way in order to be able to deal with cases where a user is not logged in and clicks
            // on the support link on our website (https://app.tuta.com?action=supportMail)
            this.selectedRedirect = `/mail?action=${args.action}`;
        }
        else {
            this.selectedRedirect = this.defaultRedirect;
        }
        this.handleLoginArguments(args, requestedPath);
    }
    async handleLoginArguments(args, requestedPath) {
        await this.initPromise;
        // since we wait for something async here the URL might have already changed and
        // we shouldn't handle any outdated URL changes.
        if (m.route.get() !== requestedPath)
            return;
        const autoLogin = args.noAutoLogin == null || args.noAutoLogin === false;
        if (autoLogin) {
            if (args.userId) {
                await this.viewModel.useUserId(args.userId);
            }
            if (this.viewModel.canLogin()) {
                this._loginWithProgressDialog();
                m.redraw();
                return;
            }
        }
        if (args.loginWith) {
            this.viewModel.showLoginForm();
        }
        // We want to focus password field if login field is already filled in
        if (args.loginWith) {
            this.loginForm.promise.then((loginForm) => {
                loginForm.mailAddressTextField.value = "";
                loginForm.passwordTextField.value = "";
                this.viewModel.mailAddress(args.loginWith ?? "");
                this.viewModel.password("");
                loginForm.passwordTextField.focus();
            });
        }
        m.redraw();
    }
    _openUrl(url) {
        window.open(url, "_blank");
    }
    _switchDeleteCredentialsState() {
        this.viewModel.switchDeleteState();
    }
}
export function getWhitelabelRegistrationDomains() {
    return mapNullable(getWhitelabelCustomizations(window), (c) => c.registrationDomains) || [];
}
//# sourceMappingURL=LoginView.js.map