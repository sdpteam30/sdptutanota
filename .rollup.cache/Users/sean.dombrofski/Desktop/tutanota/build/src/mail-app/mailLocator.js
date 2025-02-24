import { assertMainOrNode, isAndroidApp, isApp, isBrowser, isDesktop, isElectronClient, isIOSApp, isTest } from "../common/api/common/Env.js";
import { EventController } from "../common/api/main/EventController.js";
import { SearchModel } from "./search/model/SearchModel.js";
import { MailboxModel } from "../common/mailFunctionality/MailboxModel.js";
import { MinimizedMailEditorViewModel } from "./mail/model/MinimizedMailEditorViewModel.js";
import { EntityClient } from "../common/api/common/EntityClient.js";
import { ProgressTracker } from "../common/api/main/ProgressTracker.js";
import { bootstrapWorker } from "../common/api/main/WorkerClient.js";
import { CALENDAR_MIME_TYPE, guiDownload, MAIL_MIME_TYPES, VCARD_MIME_TYPES } from "../common/file/FileController.js";
import { SecondFactorHandler } from "../common/misc/2fa/SecondFactorHandler.js";
import { WebauthnClient } from "../common/misc/2fa/webauthn/WebauthnClient.js";
import { LoginController } from "../common/api/main/LoginController.js";
import { UsageTestController } from "@tutao/tutanota-usagetests";
import { EphemeralUsageTestStorage, UsageTestModel } from "../common/misc/UsageTestModel.js";
import { NewsModel } from "../common/misc/news/NewsModel.js";
import { PageContextLoginListener } from "../common/api/main/PageContextLoginListener.js";
import { WebsocketConnectivityModel } from "../common/misc/WebsocketConnectivityModel.js";
import { OperationProgressTracker } from "../common/api/main/OperationProgressTracker.js";
import { InfoMessageHandler } from "../common/gui/InfoMessageHandler.js";
import { assert, assertNotNull, defer, LazyLoaded, lazyMemoized, noOp } from "@tutao/tutanota-utils";
import { NoZoneDateProvider } from "../common/api/common/utils/NoZoneDateProvider.js";
import { OfflineIndicatorViewModel } from "../common/gui/base/OfflineIndicatorViewModel.js";
import { ScopedRouter, ThrottledRouter } from "../common/gui/ScopedRouter.js";
import { deviceConfig } from "../common/misc/DeviceConfig.js";
import { InboxRuleHandler } from "./mail/model/InboxRuleHandler.js";
import { getEnabledMailAddressesWithUser } from "../common/mailFunctionality/SharedMailUtils.js";
import { CLIENT_ONLY_CALENDARS, Const, DEFAULT_CLIENT_ONLY_CALENDAR_COLORS, FeatureType, GroupType } from "../common/api/common/TutanotaConstants.js";
import { showProgressDialog } from "../common/gui/dialogs/ProgressDialog.js";
import { DomainConfigProvider } from "../common/api/common/DomainConfigProvider.js";
import { ProgrammingError } from "../common/api/common/error/ProgrammingError.js";
import { EntropyCollector } from "../common/api/main/EntropyCollector.js";
import { notifications } from "../common/gui/Notifications.js";
import { windowFacade } from "../common/misc/WindowFacade.js";
import { BrowserWebauthn } from "../common/misc/2fa/webauthn/BrowserWebauthn.js";
import { FileControllerBrowser } from "../common/file/FileControllerBrowser.js";
import { FileControllerNative } from "../common/file/FileControllerNative.js";
import { SchedulerImpl } from "../common/api/common/utils/Scheduler.js";
import { isCustomizationEnabledForCustomer } from "../common/api/common/utils/CustomerUtils.js";
import { NativeContactsSyncManager } from "./contacts/model/NativeContactsSyncManager.js";
import { NativeThemeFacade, ThemeController, WebThemeFacade } from "../common/gui/ThemeController.js";
import { theme } from "../common/gui/theme.js";
import { MAIL_PREFIX } from "../common/misc/RouteChange.js";
import { getDisplayedSender } from "../common/api/common/CommonMailUtils.js";
import { MailModel } from "./mail/model/MailModel.js";
import { locator } from "../common/api/main/CommonLocator.js";
import { showSnackBar } from "../common/gui/base/SnackBar.js";
import { isMailInSpamOrTrash } from "./mail/model/MailChecks.js";
import { AppType } from "../common/misc/ClientConstants.js";
import { lang } from "../common/misc/LanguageViewModel.js";
import { MailImporter } from "./mail/import/MailImporter.js";
assertMainOrNode();
class MailLocator {
    eventController;
    search;
    mailboxModel;
    mailModel;
    minimizedMailModel;
    contactModel;
    entityClient;
    progressTracker;
    credentialsProvider;
    worker;
    fileController;
    secondFactorHandler;
    webAuthn;
    loginFacade;
    logins;
    header;
    customerFacade;
    keyLoaderFacade;
    giftCardFacade;
    groupManagementFacade;
    configFacade;
    calendarFacade;
    mailFacade;
    shareFacade;
    counterFacade;
    indexerFacade;
    searchFacade;
    bookingFacade;
    mailAddressFacade;
    blobFacade;
    userManagementFacade;
    recoverCodeFacade;
    contactFacade;
    usageTestController;
    usageTestModel;
    newsModel;
    serviceExecutor;
    cryptoFacade;
    searchTextFacade;
    desktopSettingsFacade;
    desktopSystemFacade;
    exportFacade;
    webMobileFacade;
    systemPermissionHandler;
    interWindowEventSender;
    cacheStorage;
    workerFacade;
    loginListener;
    random;
    connectivityModel;
    operationProgressTracker;
    infoMessageHandler;
    themeController;
    Const;
    bulkMailLoader;
    mailExportFacade;
    nativeInterfaces = null;
    mailImporter = null;
    entropyFacade;
    sqlCipherFacade;
    recipientsModel = lazyMemoized(async () => {
        const { RecipientsModel } = await import("../common/api/main/RecipientsModel.js");
        return new RecipientsModel(this.contactModel, this.logins, this.mailFacade, this.entityClient);
    });
    async noZoneDateProvider() {
        return new NoZoneDateProvider();
    }
    async sendMailModel(mailboxDetails, mailboxProperties) {
        const factory = await this.sendMailModelSyncFactory(mailboxDetails, mailboxProperties);
        return factory();
    }
    redraw = lazyMemoized(async () => {
        const m = await import("mithril");
        return m.redraw;
    });
    offlineIndicatorViewModel = lazyMemoized(async () => {
        return new OfflineIndicatorViewModel(this.cacheStorage, this.loginListener, this.connectivityModel, this.logins, this.progressTracker, await this.redraw());
    });
    async appHeaderAttrs() {
        return {
            offlineIndicatorModel: await this.offlineIndicatorViewModel(),
            newsModel: this.newsModel,
        };
    }
    mailViewModel = lazyMemoized(async () => {
        const { MailViewModel } = await import("../mail-app/mail/view/MailViewModel.js");
        const conversationViewModelFactory = await this.conversationViewModelFactory();
        const router = new ScopedRouter(this.throttledRouter(), "/mail");
        return new MailViewModel(this.mailboxModel, this.mailModel, this.entityClient, this.eventController, this.connectivityModel, this.cacheStorage, conversationViewModelFactory, this.mailOpenedListener, deviceConfig, this.inboxRuleHanlder(), router, await this.redraw());
    });
    affiliateViewModel = lazyMemoized(async () => {
        const { AffiliateViewModel } = await import("../common/settings/AffiliateViewModel.js");
        return new AffiliateViewModel();
    });
    inboxRuleHanlder() {
        return new InboxRuleHandler(this.mailFacade, this.logins);
    }
    async searchViewModelFactory() {
        const { SearchViewModel } = await import("../mail-app/search/view/SearchViewModel.js");
        const conversationViewModelFactory = await this.conversationViewModelFactory();
        const redraw = await this.redraw();
        const searchRouter = await this.scopedSearchRouter();
        const calendarEventsRepository = await this.calendarEventsRepository();
        return () => {
            return new SearchViewModel(searchRouter, this.search, this.searchFacade, this.mailboxModel, this.logins, this.indexerFacade, this.entityClient, this.eventController, this.mailOpenedListener, this.calendarFacade, this.progressTracker, conversationViewModelFactory, calendarEventsRepository, redraw, deviceConfig.getMailAutoSelectBehavior(), deviceConfig.getClientOnlyCalendars());
        };
    }
    throttledRouter = lazyMemoized(() => new ThrottledRouter());
    scopedSearchRouter = lazyMemoized(async () => {
        const { SearchRouter } = await import("../common/search/view/SearchRouter.js");
        return new SearchRouter(new ScopedRouter(this.throttledRouter(), "/search"));
    });
    unscopedSearchRouter = lazyMemoized(async () => {
        const { SearchRouter } = await import("../common/search/view/SearchRouter.js");
        return new SearchRouter(this.throttledRouter());
    });
    mailOpenedListener = {
        onEmailOpened: isDesktop()
            ? (mail) => {
                this.desktopSystemFacade.sendSocketMessage(getDisplayedSender(mail).address);
            }
            : noOp,
    };
    contactViewModel = lazyMemoized(async () => {
        const { ContactViewModel } = await import("../mail-app/contacts/view/ContactViewModel.js");
        const router = new ScopedRouter(this.throttledRouter(), "/contact");
        return new ContactViewModel(this.contactModel, this.entityClient, this.eventController, router, await this.redraw());
    });
    contactListViewModel = lazyMemoized(async () => {
        const { ContactListViewModel } = await import("../mail-app/contacts/view/ContactListViewModel.js");
        const router = new ScopedRouter(this.throttledRouter(), "/contactlist");
        return new ContactListViewModel(this.entityClient, this.groupManagementFacade, this.logins, this.eventController, this.contactModel, await this.receivedGroupInvitationsModel(GroupType.ContactList), router, await this.redraw());
    });
    async receivedGroupInvitationsModel(groupType) {
        const { ReceivedGroupInvitationsModel } = await import("../common/sharing/model/ReceivedGroupInvitationsModel.js");
        return new ReceivedGroupInvitationsModel(groupType, this.eventController, this.entityClient, this.logins);
    }
    calendarViewModel = lazyMemoized(async () => {
        const { CalendarViewModel } = await import("../calendar-app/calendar/view/CalendarViewModel.js");
        const { DefaultDateProvider } = await import("../common/calendar/date/CalendarUtils");
        const timeZone = new DefaultDateProvider().timeZone();
        return new CalendarViewModel(this.logins, async (mode, event) => {
            const mailboxDetail = await this.mailboxModel.getUserMailboxDetails();
            const mailboxProperties = await this.mailboxModel.getMailboxProperties(mailboxDetail.mailboxGroupRoot);
            return await this.calendarEventModel(mode, event, mailboxDetail, mailboxProperties, null);
        }, (...args) => this.calendarEventPreviewModel(...args), (...args) => this.calendarContactPreviewModel(...args), await this.calendarModel(), await this.calendarEventsRepository(), this.entityClient, this.eventController, this.progressTracker, deviceConfig, await this.receivedGroupInvitationsModel(GroupType.Calendar), timeZone, this.mailboxModel, this.contactModel);
    });
    calendarEventsRepository = lazyMemoized(async () => {
        const { CalendarEventsRepository } = await import("../common/calendar/date/CalendarEventsRepository.js");
        const { DefaultDateProvider } = await import("../common/calendar/date/CalendarUtils");
        const timeZone = new DefaultDateProvider().timeZone();
        return new CalendarEventsRepository(await this.calendarModel(), this.calendarFacade, timeZone, this.entityClient, this.eventController, this.contactModel, this.logins);
    });
    /** This ugly bit exists because CalendarEventWhoModel wants a sync factory. */
    async sendMailModelSyncFactory(mailboxDetails, mailboxProperties) {
        const { SendMailModel } = await import("../common/mailFunctionality/SendMailModel.js");
        const recipientsModel = await this.recipientsModel();
        const dateProvider = await this.noZoneDateProvider();
        return () => new SendMailModel(this.mailFacade, this.entityClient, this.logins, this.mailboxModel, this.contactModel, this.eventController, mailboxDetails, recipientsModel, dateProvider, mailboxProperties, async (mail) => {
            return await isMailInSpamOrTrash(mail, mailLocator.mailModel);
        });
    }
    async calendarEventModel(editMode, event, mailboxDetail, mailboxProperties, responseTo) {
        const [{ makeCalendarEventModel }, { getTimeZone }, { calendarNotificationSender }] = await Promise.all([
            import("../calendar-app/calendar/gui/eventeditor-model/CalendarEventModel.js"),
            import("../common/calendar/date/CalendarUtils.js"),
            import("../calendar-app/calendar/view/CalendarNotificationSender.js"),
        ]);
        const sendMailModelFactory = await this.sendMailModelSyncFactory(mailboxDetail, mailboxProperties);
        const showProgress = (p) => showProgressDialog("pleaseWait_msg", p);
        return await makeCalendarEventModel(editMode, event, await this.recipientsModel(), await this.calendarModel(), this.logins, mailboxDetail, mailboxProperties, sendMailModelFactory, calendarNotificationSender, this.entityClient, responseTo, getTimeZone(), showProgress);
    }
    async recipientsSearchModel() {
        const { RecipientsSearchModel } = await import("../common/misc/RecipientsSearchModel.js");
        const suggestionsProvider = await this.contactSuggestionProvider();
        return new RecipientsSearchModel(await this.recipientsModel(), this.contactModel, suggestionsProvider, this.entityClient);
    }
    async contactSuggestionProvider() {
        if (isApp()) {
            const { MobileContactSuggestionProvider } = await import("../common/native/main/MobileContactSuggestionProvider.js");
            return new MobileContactSuggestionProvider(this.mobileContactsFacade);
        }
        else {
            return {
                async getContactSuggestions(_query) {
                    return [];
                },
            };
        }
    }
    conversationViewModelFactory = async () => {
        const { ConversationViewModel } = await import("../mail-app/mail/view/ConversationViewModel.js");
        const factory = await this.mailViewerViewModelFactory();
        const m = await import("mithril");
        return (options) => {
            return new ConversationViewModel(options, (options) => factory(options), this.entityClient, this.eventController, deviceConfig, this.mailModel, m.redraw);
        };
    };
    async conversationViewModel(options) {
        const factory = await this.conversationViewModelFactory();
        return factory(options);
    }
    contactImporter = async () => {
        const { ContactImporter } = await import("../mail-app/contacts/ContactImporter.js");
        return new ContactImporter(this.contactFacade, this.systemPermissionHandler, isApp() ? this.mobileContactsFacade : null, isApp() ? this.nativeContactsSyncManager() : null);
    };
    async mailViewerViewModelFactory() {
        const { MailViewerViewModel } = await import("../mail-app/mail/view/MailViewerViewModel.js");
        return ({ mail, showFolder }) => new MailViewerViewModel(mail, showFolder, this.entityClient, this.mailboxModel, this.mailModel, this.contactModel, this.configFacade, this.fileController, this.logins, async (mailboxDetails) => {
            const mailboxProperties = await this.mailboxModel.getMailboxProperties(mailboxDetails.mailboxGroupRoot);
            return this.sendMailModel(mailboxDetails, mailboxProperties);
        }, this.eventController, this.workerFacade, this.search, this.mailFacade, this.cryptoFacade, () => this.contactImporter());
    }
    async externalLoginViewModelFactory() {
        const { ExternalLoginViewModel } = await import("./mail/view/ExternalLoginView.js");
        return () => new ExternalLoginViewModel(this.credentialsProvider);
    }
    get deviceConfig() {
        return deviceConfig;
    }
    get native() {
        return this.getNativeInterface("native");
    }
    get fileApp() {
        return this.getNativeInterface("fileApp");
    }
    get pushService() {
        return this.getNativeInterface("pushService");
    }
    get commonSystemFacade() {
        return this.getNativeInterface("commonSystemFacade");
    }
    get themeFacade() {
        return this.getNativeInterface("themeFacade");
    }
    get externalCalendarFacade() {
        return this.getNativeInterface("externalCalendarFacade");
    }
    get systemFacade() {
        return this.getNativeInterface("mobileSystemFacade");
    }
    get mobileContactsFacade() {
        return this.getNativeInterface("mobileContactsFacade");
    }
    get nativeCredentialsFacade() {
        return this.getNativeInterface("nativeCredentialsFacade");
    }
    get mobilePaymentsFacade() {
        return this.getNativeInterface("mobilePaymentsFacade");
    }
    async mailAddressTableModelForOwnMailbox() {
        const { MailAddressTableModel } = await import("../common/settings/mailaddress/MailAddressTableModel.js");
        const nameChanger = await this.ownMailAddressNameChanger();
        return new MailAddressTableModel(this.entityClient, this.serviceExecutor, this.mailAddressFacade, this.logins, this.eventController, this.logins.getUserController().userGroupInfo, nameChanger, await this.redraw());
    }
    async mailAddressTableModelForAdmin(mailGroupId, userId, userGroupInfo) {
        const { MailAddressTableModel } = await import("../common/settings/mailaddress/MailAddressTableModel.js");
        const nameChanger = await this.adminNameChanger(mailGroupId, userId);
        return new MailAddressTableModel(this.entityClient, this.serviceExecutor, this.mailAddressFacade, this.logins, this.eventController, userGroupInfo, nameChanger, await this.redraw());
    }
    async ownMailAddressNameChanger() {
        const { OwnMailAddressNameChanger } = await import("../common/settings/mailaddress/OwnMailAddressNameChanger.js");
        return new OwnMailAddressNameChanger(this.mailboxModel, this.entityClient);
    }
    async adminNameChanger(mailGroupId, userId) {
        const { AnotherUserMailAddressNameChanger } = await import("../common/settings/mailaddress/AnotherUserMailAddressNameChanger.js");
        return new AnotherUserMailAddressNameChanger(this.mailAddressFacade, mailGroupId, userId);
    }
    async drawerAttrsFactory() {
        return () => ({
            logins: this.logins,
            newsModel: this.newsModel,
            desktopSystemFacade: this.desktopSystemFacade,
        });
    }
    domainConfigProvider() {
        return new DomainConfigProvider();
    }
    async credentialsRemovalHandler() {
        const { NoopCredentialRemovalHandler, AppsCredentialRemovalHandler } = await import("../common/login/CredentialRemovalHandler.js");
        return isBrowser()
            ? new NoopCredentialRemovalHandler()
            : new AppsCredentialRemovalHandler(this.pushService, this.configFacade, async (login, userId) => {
                if (isApp()) {
                    await mailLocator.nativeContactsSyncManager().disableSync(userId, login);
                }
                await mailLocator.indexerFacade.deleteIndex(userId);
                if (isDesktop()) {
                    await mailLocator.exportFacade.clearExportState(userId);
                }
            });
    }
    async loginViewModelFactory() {
        const { LoginViewModel } = await import("../common/login/LoginViewModel.js");
        const credentialsRemovalHandler = await mailLocator.credentialsRemovalHandler();
        const { MobileAppLock, NoOpAppLock } = await import("../common/login/AppLock.js");
        const appLock = isApp()
            ? new MobileAppLock(assertNotNull(this.nativeInterfaces).mobileSystemFacade, assertNotNull(this.nativeInterfaces).nativeCredentialsFacade)
            : new NoOpAppLock();
        return () => {
            const domainConfig = isBrowser()
                ? mailLocator.domainConfigProvider().getDomainConfigForHostname(location.hostname, location.protocol, location.port)
                : // in this case, we know that we have a staticUrl set that we need to use
                    mailLocator.domainConfigProvider().getCurrentDomainConfig();
            return new LoginViewModel(mailLocator.logins, mailLocator.credentialsProvider, mailLocator.secondFactorHandler, deviceConfig, domainConfig, credentialsRemovalHandler, isBrowser() ? null : this.pushService, appLock);
        };
    }
    getNativeInterface(name) {
        if (!this.nativeInterfaces) {
            throw new ProgrammingError(`Tried to use ${name} in web`);
        }
        return this.nativeInterfaces[name];
    }
    getMailImporter() {
        if (this.mailImporter == null) {
            throw new ProgrammingError(`Tried to use mail importer in web or mobile`);
        }
        return this.mailImporter;
    }
    _workerDeferred;
    _entropyCollector;
    _deferredInitialized = defer();
    get initialized() {
        return this._deferredInitialized.promise;
    }
    constructor() {
        this._workerDeferred = defer();
    }
    async init() {
        // Split init in two separate parts: creating modules and causing side effects.
        // We would like to do both on normal init but on HMR we just want to replace modules without a new worker. If we create a new
        // worker we end up losing state on the worker side (including our session).
        this.worker = bootstrapWorker(this);
        await this._createInstances();
        this._entropyCollector = new EntropyCollector(this.entropyFacade, await this.scheduler(), window);
        this._entropyCollector.start();
        this._deferredInitialized.resolve();
    }
    async _createInstances() {
        const { loginFacade, customerFacade, giftCardFacade, groupManagementFacade, configFacade, calendarFacade, mailFacade, shareFacade, counterFacade, indexerFacade, searchFacade, bookingFacade, mailAddressFacade, blobFacade, userManagementFacade, recoverCodeFacade, restInterface, serviceExecutor, cryptoFacade, cacheStorage, random, eventBus, entropyFacade, workerFacade, sqlCipherFacade, contactFacade, bulkMailLoader, mailExportFacade, } = this.worker.getWorkerInterface();
        this.loginFacade = loginFacade;
        this.customerFacade = customerFacade;
        this.giftCardFacade = giftCardFacade;
        this.groupManagementFacade = groupManagementFacade;
        this.configFacade = configFacade;
        this.calendarFacade = calendarFacade;
        this.mailFacade = mailFacade;
        this.shareFacade = shareFacade;
        this.counterFacade = counterFacade;
        this.indexerFacade = indexerFacade;
        this.searchFacade = searchFacade;
        this.bookingFacade = bookingFacade;
        this.mailAddressFacade = mailAddressFacade;
        this.blobFacade = blobFacade;
        this.userManagementFacade = userManagementFacade;
        this.recoverCodeFacade = recoverCodeFacade;
        this.contactFacade = contactFacade;
        this.serviceExecutor = serviceExecutor;
        this.sqlCipherFacade = sqlCipherFacade;
        this.logins = new LoginController(this.loginFacade, async () => this.loginListener, () => this.worker.reset());
        // Should be called elsewhere later e.g. in CommonLocator
        this.logins.init();
        this.eventController = new EventController(mailLocator.logins);
        this.progressTracker = new ProgressTracker();
        this.search = new SearchModel(this.searchFacade, () => this.calendarEventsRepository());
        this.entityClient = new EntityClient(restInterface);
        this.cryptoFacade = cryptoFacade;
        this.cacheStorage = cacheStorage;
        this.entropyFacade = entropyFacade;
        this.workerFacade = workerFacade;
        this.bulkMailLoader = bulkMailLoader;
        this.mailExportFacade = mailExportFacade;
        this.connectivityModel = new WebsocketConnectivityModel(eventBus);
        this.mailboxModel = new MailboxModel(this.eventController, this.entityClient, this.logins);
        this.mailModel = new MailModel(notifications, this.mailboxModel, this.eventController, this.entityClient, this.logins, this.mailFacade, this.connectivityModel, this.inboxRuleHanlder());
        this.operationProgressTracker = new OperationProgressTracker();
        this.infoMessageHandler = new InfoMessageHandler((state) => {
            mailLocator.search.indexState(state);
        });
        this.usageTestModel = new UsageTestModel({
            [0 /* StorageBehavior.Persist */]: deviceConfig,
            [1 /* StorageBehavior.Ephemeral */]: new EphemeralUsageTestStorage(),
        }, {
            now() {
                return Date.now();
            },
            timeZone() {
                throw new Error("Not implemented by this provider");
            },
        }, this.serviceExecutor, this.entityClient, this.logins, this.eventController, () => this.usageTestController);
        this.usageTestController = new UsageTestController(this.usageTestModel);
        this.Const = Const;
        if (!isBrowser()) {
            const { WebDesktopFacade } = await import("../common/native/main/WebDesktopFacade");
            const { WebMobileFacade } = await import("../common/native/main/WebMobileFacade.js");
            const { WebCommonNativeFacade } = await import("../common/native/main/WebCommonNativeFacade.js");
            const { WebInterWindowEventFacade } = await import("../common/native/main/WebInterWindowEventFacade.js");
            const { WebAuthnFacadeSendDispatcher } = await import("../common/native/common/generatedipc/WebAuthnFacadeSendDispatcher.js");
            const { OpenMailboxHandler } = await import("./native/main/OpenMailboxHandler.js");
            const { createNativeInterfaces, createDesktopInterfaces } = await import("../common/native/main/NativeInterfaceFactory.js");
            const openMailboxHandler = new OpenMailboxHandler(this.logins, this.mailModel, this.mailboxModel);
            const { OpenCalendarHandler } = await import("../common/native/main/OpenCalendarHandler.js");
            const openCalendarHandler = new OpenCalendarHandler(this.logins);
            const { OpenSettingsHandler } = await import("../common/native/main/OpenSettingsHandler.js");
            const openSettingsHandler = new OpenSettingsHandler(this.logins);
            this.webMobileFacade = new WebMobileFacade(this.connectivityModel, MAIL_PREFIX);
            this.nativeInterfaces = createNativeInterfaces(this.webMobileFacade, new WebDesktopFacade(this.logins, async () => this.native), new WebInterWindowEventFacade(this.logins, windowFacade, deviceConfig), new WebCommonNativeFacade(this.logins, this.mailboxModel, this.usageTestController, async () => this.fileApp, async () => this.pushService, this.handleFileImport.bind(this), (userId, address, requestedPath) => openMailboxHandler.openMailbox(userId, address, requestedPath), (userId) => openCalendarHandler.openCalendar(userId), AppType.Integrated, (path) => openSettingsHandler.openSettings(path)), cryptoFacade, calendarFacade, this.entityClient, this.logins, AppType.Integrated);
            this.credentialsProvider = await this.createCredentialsProvider();
            if (isElectronClient()) {
                const desktopInterfaces = createDesktopInterfaces(this.native);
                this.searchTextFacade = desktopInterfaces.searchTextFacade;
                this.interWindowEventSender = desktopInterfaces.interWindowEventSender;
                this.webAuthn = new WebauthnClient(new WebAuthnFacadeSendDispatcher(this.native), this.domainConfigProvider(), isApp());
                if (isDesktop()) {
                    this.desktopSettingsFacade = desktopInterfaces.desktopSettingsFacade;
                    this.desktopSystemFacade = desktopInterfaces.desktopSystemFacade;
                    this.mailImporter = new MailImporter(this.domainConfigProvider(), this.logins, this.mailboxModel, this.entityClient, this.eventController, this.credentialsProvider, desktopInterfaces.nativeMailImportFacade, openSettingsHandler);
                    this.exportFacade = desktopInterfaces.exportFacade;
                }
            }
            else if (isAndroidApp() || isIOSApp()) {
                const { SystemPermissionHandler } = await import("../common/native/main/SystemPermissionHandler.js");
                this.systemPermissionHandler = new SystemPermissionHandler(this.systemFacade);
                this.webAuthn = new WebauthnClient(new WebAuthnFacadeSendDispatcher(this.native), this.domainConfigProvider(), isApp());
            }
        }
        else {
            this.credentialsProvider = await this.createCredentialsProvider();
        }
        if (this.webAuthn == null) {
            this.webAuthn = new WebauthnClient(new BrowserWebauthn(navigator.credentials, this.domainConfigProvider().getCurrentDomainConfig()), this.domainConfigProvider(), isApp());
        }
        this.secondFactorHandler = new SecondFactorHandler(this.eventController, this.entityClient, this.webAuthn, this.loginFacade, this.domainConfigProvider());
        this.loginListener = new PageContextLoginListener(this.secondFactorHandler, this.credentialsProvider);
        this.random = random;
        this.newsModel = new NewsModel(this.serviceExecutor, deviceConfig, async (name) => {
            switch (name) {
                case "usageOptIn": {
                    const { UsageOptInNews } = await import("../common/misc/news/items/UsageOptInNews.js");
                    return new UsageOptInNews(this.newsModel, this.usageTestModel);
                }
                case "recoveryCode": {
                    const { RecoveryCodeNews } = await import("../common/misc/news/items/RecoveryCodeNews.js");
                    return new RecoveryCodeNews(this.newsModel, this.logins.getUserController(), this.recoverCodeFacade);
                }
                case "pinBiometrics": {
                    const { PinBiometricsNews } = await import("../common/misc/news/items/PinBiometricsNews.js");
                    return new PinBiometricsNews(this.newsModel, this.credentialsProvider, this.logins.getUserController().userId);
                }
                case "referralLink": {
                    const { ReferralLinkNews } = await import("../common/misc/news/items/ReferralLinkNews.js");
                    const dateProvider = await this.noZoneDateProvider();
                    return new ReferralLinkNews(this.newsModel, dateProvider, this.logins.getUserController());
                }
                case "richNotifications": {
                    const { RichNotificationsNews } = await import("../common/misc/news/items/RichNotificationsNews.js");
                    return new RichNotificationsNews(this.newsModel, isApp() || isDesktop() ? this.pushService : null);
                }
                default:
                    console.log(`No implementation for news named '${name}'`);
                    return null;
            }
        });
        this.fileController =
            this.nativeInterfaces == null
                ? new FileControllerBrowser(blobFacade, guiDownload)
                : new FileControllerNative(blobFacade, guiDownload, this.nativeInterfaces.fileApp);
        const { ContactModel } = await import("../common/contactsFunctionality/ContactModel.js");
        this.contactModel = new ContactModel(this.entityClient, this.logins, this.eventController, async (query, field, minSuggestionCount, maxResults) => {
            const { createRestriction } = await import("./search/model/SearchUtils.js");
            return mailLocator.searchFacade.search(query, createRestriction("contact" /* SearchCategoryTypes.contact */, null, null, field, [], null), minSuggestionCount, maxResults);
        });
        this.minimizedMailModel = new MinimizedMailEditorViewModel();
        // THEME
        // We need it because we want to run tests in node and real HTMLSanitizer does not work there.
        const sanitizerStub = {
            sanitizeHTML: () => {
                return {
                    html: "",
                    blockedExternalContent: 0,
                    inlineImageCids: [],
                    links: [],
                };
            },
            sanitizeSVG(svg, configExtra) {
                throw new Error("stub!");
            },
            sanitizeFragment(html, configExtra) {
                throw new Error("stub!");
            },
        };
        const selectedThemeFacade = isApp() || isDesktop() ? new NativeThemeFacade(new LazyLoaded(async () => mailLocator.themeFacade)) : new WebThemeFacade(deviceConfig);
        const lazySanitizer = isTest()
            ? () => Promise.resolve(sanitizerStub)
            : () => import("../common/misc/HtmlSanitizer").then(({ htmlSanitizer }) => htmlSanitizer);
        this.themeController = new ThemeController(theme, selectedThemeFacade, lazySanitizer, AppType.Mail);
        // For native targets WebCommonNativeFacade notifies themeController because Android and Desktop do not seem to work reliably via media queries
        if (selectedThemeFacade instanceof WebThemeFacade) {
            selectedThemeFacade.addDarkListener(() => mailLocator.themeController.reloadTheme());
        }
    }
    calendarModel = lazyMemoized(async () => {
        const { DefaultDateProvider } = await import("../common/calendar/date/CalendarUtils");
        const { CalendarModel } = await import("../calendar-app/calendar/model/CalendarModel");
        const timeZone = new DefaultDateProvider().timeZone();
        return new CalendarModel(notifications, this.alarmScheduler, this.eventController, this.serviceExecutor, this.logins, this.progressTracker, this.entityClient, this.mailboxModel, this.calendarFacade, this.fileController, timeZone, !isBrowser() ? this.externalCalendarFacade : null, deviceConfig, !isBrowser() ? this.pushService : null);
    });
    calendarInviteHandler = lazyMemoized(async () => {
        const { CalendarInviteHandler } = await import("../calendar-app/calendar/view/CalendarInvites.js");
        const { calendarNotificationSender } = await import("../calendar-app/calendar/view/CalendarNotificationSender.js");
        return new CalendarInviteHandler(this.mailboxModel, await this.calendarModel(), this.logins, calendarNotificationSender, (...arg) => this.sendMailModel(...arg));
    });
    async handleFileImport(filesUris) {
        const files = await this.fileApp.getFilesMetaData(filesUris);
        const areAllFilesVCard = files.every((file) => file.mimeType === VCARD_MIME_TYPES.X_VCARD || file.mimeType === VCARD_MIME_TYPES.VCARD);
        const areAllFilesICS = files.every((file) => file.mimeType === CALENDAR_MIME_TYPE);
        const areAllFilesMail = files.every((file) => file.mimeType === MAIL_MIME_TYPES.EML || file.mimeType === MAIL_MIME_TYPES.MBOX);
        if (areAllFilesVCard) {
            const importer = await this.contactImporter();
            const { parseContacts } = await import("../mail-app/contacts/ContactImporter.js");
            // For now, we just handle .vcf files, so we don't need to care about the file type
            const contacts = await parseContacts(files, this.fileApp);
            const vCardData = contacts.join("\n");
            const contactListId = assertNotNull(await this.contactModel.getContactListId());
            await importer.importContactsFromFile(vCardData, contactListId);
        }
        else if (areAllFilesICS) {
            const calendarModel = await this.calendarModel();
            const groupSettings = this.logins.getUserController().userSettingsGroupRoot.groupSettings;
            const calendarInfos = await calendarModel.getCalendarInfos();
            const groupColors = groupSettings.reduce((acc, gc) => {
                acc.set(gc.group, gc.color);
                return acc;
            }, new Map());
            const { calendarSelectionDialog, parseCalendarFile } = await import("../common/calendar/import/CalendarImporter.js");
            const { handleCalendarImport } = await import("../common/calendar/import/CalendarImporterDialog.js");
            let parsedEvents = [];
            for (const fileRef of files) {
                const dataFile = await this.fileApp.readDataFile(fileRef.location);
                if (dataFile == null)
                    continue;
                const data = parseCalendarFile(dataFile);
                parsedEvents.push(...data.contents);
            }
            calendarSelectionDialog(Array.from(calendarInfos.values()), this.logins.getUserController(), groupColors, (dialog, selectedCalendar) => {
                dialog.close();
                handleCalendarImport(selectedCalendar.groupRoot, parsedEvents);
            });
        }
    }
    alarmScheduler = lazyMemoized(async () => {
        const { AlarmScheduler } = await import("../common/calendar/date/AlarmScheduler");
        const { DefaultDateProvider } = await import("../common/calendar/date/CalendarUtils");
        const dateProvider = new DefaultDateProvider();
        return new AlarmScheduler(dateProvider, await this.scheduler());
    });
    async scheduler() {
        const dateProvider = await this.noZoneDateProvider();
        return new SchedulerImpl(dateProvider, window, window);
    }
    async calendarEventPreviewModel(selectedEvent, calendars) {
        const { findAttendeeInAddresses } = await import("../common/api/common/utils/CommonCalendarUtils.js");
        const { getEventType } = await import("../calendar-app/calendar/gui/CalendarGuiUtils.js");
        const { CalendarEventPreviewViewModel } = await import("../calendar-app/calendar/gui/eventpopup/CalendarEventPreviewViewModel.js");
        const mailboxDetails = await this.mailboxModel.getUserMailboxDetails();
        const mailboxProperties = await this.mailboxModel.getMailboxProperties(mailboxDetails.mailboxGroupRoot);
        const userController = this.logins.getUserController();
        const customer = await userController.loadCustomer();
        const ownMailAddresses = getEnabledMailAddressesWithUser(mailboxDetails, userController.userGroupInfo);
        const ownAttendee = findAttendeeInAddresses(selectedEvent.attendees, ownMailAddresses);
        const eventType = getEventType(selectedEvent, calendars, ownMailAddresses, userController);
        const hasBusinessFeature = isCustomizationEnabledForCustomer(customer, FeatureType.BusinessFeatureEnabled) || (await userController.isNewPaidPlan());
        const lazyIndexEntry = async () => (selectedEvent.uid != null ? this.calendarFacade.getEventsByUid(selectedEvent.uid) : null);
        const popupModel = new CalendarEventPreviewViewModel(selectedEvent, await this.calendarModel(), eventType, hasBusinessFeature, ownAttendee, lazyIndexEntry, async (mode) => this.calendarEventModel(mode, selectedEvent, mailboxDetails, mailboxProperties, null));
        // If we have a preview model we want to display the description
        // so makes sense to already sanitize it after building the event
        await popupModel.sanitizeDescription();
        return popupModel;
    }
    async calendarContactPreviewModel(event, contact, canEdit) {
        const { CalendarContactPreviewViewModel } = await import("../calendar-app/calendar/gui/eventpopup/CalendarContactPreviewViewModel.js");
        return new CalendarContactPreviewViewModel(event, contact, canEdit);
    }
    nativeContactsSyncManager = lazyMemoized(() => {
        assert(isApp(), "isApp");
        return new NativeContactsSyncManager(this.logins, this.mobileContactsFacade, this.entityClient, this.eventController, this.contactModel, deviceConfig);
    });
    postLoginActions = lazyMemoized(async () => {
        const { PostLoginActions } = await import("../common/login/PostLoginActions");
        return new PostLoginActions(this.credentialsProvider, this.secondFactorHandler, this.connectivityModel, this.logins, await this.noZoneDateProvider(), this.entityClient, this.userManagementFacade, this.customerFacade, this.themeController, () => this.showSetupWizard(), () => this.handleExternalSync(), () => this.setUpClientOnlyCalendars());
    });
    showSetupWizard = async () => {
        if (isApp()) {
            const { showSetupWizard } = await import("../common/native/main/wizard/SetupWizard.js");
            return showSetupWizard(this.systemPermissionHandler, this.webMobileFacade, await this.contactImporter(), this.systemFacade, this.credentialsProvider, await this.nativeContactsSyncManager(), deviceConfig, true);
        }
    };
    async handleExternalSync() {
        const calendarModel = await locator.calendarModel();
        if (isApp() || isDesktop()) {
            calendarModel.syncExternalCalendars().catch(async (e) => {
                showSnackBar({
                    message: lang.makeTranslation("exception_msg", e.message),
                    button: {
                        label: "ok_action",
                        click: noOp,
                    },
                    waitingTime: 1000,
                });
            });
            calendarModel.scheduleExternalCalendarSync();
        }
    }
    setUpClientOnlyCalendars() {
        let configs = deviceConfig.getClientOnlyCalendars();
        for (const [id, name] of CLIENT_ONLY_CALENDARS.entries()) {
            const calendarId = `${this.logins.getUserController().userId}#${id}`;
            const config = configs.get(calendarId);
            if (!config)
                deviceConfig.updateClientOnlyCalendars(calendarId, {
                    name: lang.get(name),
                    color: DEFAULT_CLIENT_ONLY_CALENDAR_COLORS.get(id),
                });
        }
    }
    credentialFormatMigrator = lazyMemoized(async () => {
        const { CredentialFormatMigrator } = await import("../common/misc/credentials/CredentialFormatMigrator.js");
        if (isDesktop()) {
            return new CredentialFormatMigrator(deviceConfig, this.nativeCredentialsFacade, null);
        }
        else if (isApp()) {
            return new CredentialFormatMigrator(deviceConfig, this.nativeCredentialsFacade, this.systemFacade);
        }
        else {
            return new CredentialFormatMigrator(deviceConfig, null, null);
        }
    });
    async addNotificationEmailDialog() {
        const { AddNotificationEmailDialog } = await import("../mail-app/settings/AddNotificationEmailDialog.js");
        return new AddNotificationEmailDialog(this.logins, this.entityClient);
    }
    mailExportController = lazyMemoized(async () => {
        const { htmlSanitizer } = await import("../common/misc/HtmlSanitizer");
        const { MailExportController } = await import("./native/main/MailExportController.js");
        return new MailExportController(this.mailExportFacade, htmlSanitizer, this.exportFacade, this.logins, this.mailboxModel, await this.scheduler());
    });
    /**
     * Factory method for credentials provider that will return an instance injected with the implementations appropriate for the platform.
     */
    async createCredentialsProvider() {
        const { CredentialsProvider } = await import("../common/misc/credentials/CredentialsProvider.js");
        if (isDesktop() || isApp()) {
            return new CredentialsProvider(this.nativeCredentialsFacade, this.sqlCipherFacade, isDesktop() ? this.interWindowEventSender : null);
        }
        else {
            const { WebCredentialsFacade } = await import("../common/misc/credentials/WebCredentialsFacade.js");
            return new CredentialsProvider(new WebCredentialsFacade(deviceConfig), null, null);
        }
    }
}
export const mailLocator = new MailLocator();
if (typeof window !== "undefined") {
    window.tutao.locator = mailLocator;
}
//# sourceMappingURL=mailLocator.js.map