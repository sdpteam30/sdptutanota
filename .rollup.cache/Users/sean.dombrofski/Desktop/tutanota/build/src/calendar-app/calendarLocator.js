import { assertMainOrNode, isAndroidApp, isApp, isBrowser, isDesktop, isElectronClient, isIOSApp, isTest } from "../common/api/common/Env.js";
import { EventController } from "../common/api/main/EventController.js";
import { MailboxModel } from "../common/mailFunctionality/MailboxModel.js";
import { EntityClient } from "../common/api/common/EntityClient.js";
import { ProgressTracker } from "../common/api/main/ProgressTracker.js";
import { bootstrapWorker } from "../common/api/main/WorkerClient.js";
import { CALENDAR_MIME_TYPE, guiDownload } from "../common/file/FileController.js";
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
import { assertNotNull, defer, LazyLoaded, lazyMemoized, noOp } from "@tutao/tutanota-utils";
import { NoZoneDateProvider } from "../common/api/common/utils/NoZoneDateProvider.js";
import { OfflineIndicatorViewModel } from "../common/gui/base/OfflineIndicatorViewModel.js";
import { ScopedRouter, ThrottledRouter } from "../common/gui/ScopedRouter.js";
import { deviceConfig } from "../common/misc/DeviceConfig.js";
import { getEnabledMailAddressesWithUser } from "../common/mailFunctionality/SharedMailUtils.js";
import { CLIENT_ONLY_CALENDARS, Const, DEFAULT_CLIENT_ONLY_CALENDAR_COLORS, FeatureType, GroupType, KdfType } from "../common/api/common/TutanotaConstants.js";
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
import { NativeThemeFacade, ThemeController, WebThemeFacade } from "../common/gui/ThemeController.js";
import { theme } from "../common/gui/theme.js";
import { CalendarSearchModel } from "./calendar/search/model/CalendarSearchModel.js";
import { CALENDAR_PREFIX } from "../common/misc/RouteChange.js";
import { AppType } from "../common/misc/ClientConstants.js";
import { locator } from "../common/api/main/CommonLocator.js";
import { showSnackBar } from "../common/gui/base/SnackBar.js";
import { DbError } from "../common/api/common/error/DbError.js";
import { lang } from "../common/misc/LanguageViewModel.js";
assertMainOrNode();
class CalendarLocator {
    eventController;
    search;
    mailboxModel;
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
    giftCardFacade;
    groupManagementFacade;
    configFacade;
    calendarFacade;
    mailFacade;
    shareFacade;
    counterFacade;
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
    mailImporter;
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
    nativeInterfaces = null;
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
    async searchViewModelFactory() {
        const { CalendarSearchViewModel } = await import("./calendar/search/view/CalendarSearchViewModel.js");
        const redraw = await this.redraw();
        const searchRouter = await this.scopedSearchRouter();
        const calendarEventsRepository = await this.calendarEventsRepository();
        return () => {
            return new CalendarSearchViewModel(searchRouter, this.search, this.logins, this.entityClient, this.eventController, this.calendarFacade, this.progressTracker, calendarEventsRepository, redraw, deviceConfig.getClientOnlyCalendars());
        };
    }
    async calendarSearchViewModelFactory() {
        const { CalendarSearchViewModel } = await import("./calendar/search/view/CalendarSearchViewModel.js");
        const redraw = await this.redraw();
        const searchRouter = await this.scopedSearchRouter();
        const calendarEventsRepository = await this.calendarEventsRepository();
        return () => {
            return new CalendarSearchViewModel(searchRouter, this.search, this.logins, this.entityClient, this.eventController, this.calendarFacade, this.progressTracker, calendarEventsRepository, redraw, deviceConfig.getClientOnlyCalendars());
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
    async receivedGroupInvitationsModel(groupType) {
        const { ReceivedGroupInvitationsModel } = await import("../common/sharing/model/ReceivedGroupInvitationsModel.js");
        return new ReceivedGroupInvitationsModel(groupType, this.eventController, this.entityClient, this.logins);
    }
    calendarViewModel = lazyMemoized(async () => {
        const { CalendarViewModel } = await import("./calendar/view/CalendarViewModel.js");
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
            return false;
        });
    }
    async calendarEventModel(editMode, event, mailboxDetail, mailboxProperties, responseTo) {
        const [{ makeCalendarEventModel }, { getTimeZone }, { calendarNotificationSender }] = await Promise.all([
            import("./calendar/gui/eventeditor-model/CalendarEventModel.js"),
            import("../common/calendar/date/CalendarUtils.js"),
            import("./calendar/view/CalendarNotificationSender.js"),
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
            : new AppsCredentialRemovalHandler(this.pushService, this.configFacade, async () => {
                // nothing needs to be specifically done for the calendar app right now.
                noOp();
            });
    }
    async loginViewModelFactory() {
        const { LoginViewModel } = await import("../common/login/LoginViewModel.js");
        const credentialsRemovalHandler = await calendarLocator.credentialsRemovalHandler();
        const { MobileAppLock, NoOpAppLock } = await import("../common/login/AppLock.js");
        const appLock = isApp()
            ? new MobileAppLock(assertNotNull(this.nativeInterfaces).mobileSystemFacade, assertNotNull(this.nativeInterfaces).nativeCredentialsFacade)
            : new NoOpAppLock();
        return () => {
            const domainConfig = isBrowser()
                ? calendarLocator.domainConfigProvider().getDomainConfigForHostname(location.hostname, location.protocol, location.port)
                : // in this case, we know that we have a staticUrl set that we need to use
                    calendarLocator.domainConfigProvider().getCurrentDomainConfig();
            return new LoginViewModel(calendarLocator.logins, calendarLocator.credentialsProvider, calendarLocator.secondFactorHandler, deviceConfig, domainConfig, credentialsRemovalHandler, isBrowser() ? null : this.pushService, appLock);
        };
    }
    getNativeInterface(name) {
        if (!this.nativeInterfaces) {
            throw new ProgrammingError(`Tried to use ${name} in web`);
        }
        return this.nativeInterfaces[name];
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
        const { loginFacade, customerFacade, giftCardFacade, groupManagementFacade, configFacade, calendarFacade, mailFacade, shareFacade, counterFacade, bookingFacade, mailAddressFacade, blobFacade, userManagementFacade, recoverCodeFacade, restInterface, serviceExecutor, cryptoFacade, cacheStorage, random, eventBus, entropyFacade, workerFacade, sqlCipherFacade, contactFacade, } = this.worker.getWorkerInterface();
        this.loginFacade = loginFacade;
        this.customerFacade = customerFacade;
        this.giftCardFacade = giftCardFacade;
        this.groupManagementFacade = groupManagementFacade;
        this.configFacade = configFacade;
        this.calendarFacade = calendarFacade;
        this.mailFacade = mailFacade;
        this.shareFacade = shareFacade;
        this.counterFacade = counterFacade;
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
        this.eventController = new EventController(calendarLocator.logins);
        this.progressTracker = new ProgressTracker();
        this.search = new CalendarSearchModel(() => this.calendarEventsRepository());
        this.entityClient = new EntityClient(restInterface);
        this.cryptoFacade = cryptoFacade;
        this.cacheStorage = cacheStorage;
        this.entropyFacade = entropyFacade;
        this.workerFacade = workerFacade;
        this.connectivityModel = new WebsocketConnectivityModel(eventBus);
        this.mailboxModel = new MailboxModel(this.eventController, this.entityClient, this.logins);
        this.operationProgressTracker = new OperationProgressTracker();
        this.infoMessageHandler = new InfoMessageHandler((state) => {
            // calendar does not have index, so nothing needs to be handled here
            noOp();
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
            const { createNativeInterfaces, createDesktopInterfaces } = await import("../common/native/main/NativeInterfaceFactory.js");
            const { OpenCalendarHandler } = await import("../common/native/main/OpenCalendarHandler.js");
            const openCalendarHandler = new OpenCalendarHandler(this.logins);
            const { OpenSettingsHandler } = await import("../common/native/main/OpenSettingsHandler.js");
            const openSettingsHandler = new OpenSettingsHandler(this.logins);
            this.webMobileFacade = new WebMobileFacade(this.connectivityModel, CALENDAR_PREFIX);
            this.nativeInterfaces = createNativeInterfaces(this.webMobileFacade, new WebDesktopFacade(this.logins, async () => this.native), new WebInterWindowEventFacade(this.logins, windowFacade, deviceConfig), new WebCommonNativeFacade(this.logins, this.mailboxModel, this.usageTestController, async () => this.fileApp, async () => this.pushService, this.handleFileImport.bind(this), async (_userId, _address, _requestedPath) => { }, (userId) => openCalendarHandler.openCalendar(userId), AppType.Calendar, (path) => openSettingsHandler.openSettings(path)), cryptoFacade, calendarFacade, this.entityClient, this.logins, AppType.Calendar);
            if (isElectronClient()) {
                const desktopInterfaces = createDesktopInterfaces(this.native);
                this.searchTextFacade = desktopInterfaces.searchTextFacade;
                this.interWindowEventSender = desktopInterfaces.interWindowEventSender;
                this.webAuthn = new WebauthnClient(new WebAuthnFacadeSendDispatcher(this.native), this.domainConfigProvider(), isApp());
                if (isDesktop()) {
                    this.desktopSettingsFacade = desktopInterfaces.desktopSettingsFacade;
                    this.desktopSystemFacade = desktopInterfaces.desktopSystemFacade;
                }
            }
            else if (isAndroidApp() || isIOSApp()) {
                const { SystemPermissionHandler } = await import("../common/native/main/SystemPermissionHandler.js");
                this.systemPermissionHandler = new SystemPermissionHandler(this.systemFacade);
                this.webAuthn = new WebauthnClient(new WebAuthnFacadeSendDispatcher(this.native), this.domainConfigProvider(), isApp());
            }
        }
        if (this.webAuthn == null) {
            this.webAuthn = new WebauthnClient(new BrowserWebauthn(navigator.credentials, this.domainConfigProvider().getCurrentDomainConfig()), this.domainConfigProvider(), isApp());
        }
        this.secondFactorHandler = new SecondFactorHandler(this.eventController, this.entityClient, this.webAuthn, this.loginFacade, this.domainConfigProvider());
        this.credentialsProvider = await this.createCredentialsProvider();
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
                case "newPlans": {
                    const { NewPlansNews } = await import("../common/misc/news/items/NewPlansNews.js");
                    return new NewPlansNews(this.newsModel, this.logins.getUserController());
                }
                case "newPlansOfferEnding": {
                    const { NewPlansOfferEndingNews } = await import("../common/misc/news/items/NewPlansOfferEndingNews.js");
                    return new NewPlansOfferEndingNews(this.newsModel, this.logins.getUserController());
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
        this.contactModel = new ContactModel(this.entityClient, this.logins, this.eventController, () => {
            throw new DbError("Calendar cannot search for contacts through db");
        });
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
        const selectedThemeFacade = isApp() || isDesktop()
            ? new NativeThemeFacade(new LazyLoaded(async () => calendarLocator.themeFacade))
            : new WebThemeFacade(deviceConfig);
        const lazySanitizer = isTest()
            ? () => Promise.resolve(sanitizerStub)
            : () => import("../common/misc/HtmlSanitizer").then(({ htmlSanitizer }) => htmlSanitizer);
        this.themeController = new ThemeController(theme, selectedThemeFacade, lazySanitizer, AppType.Calendar);
        // For native targets WebCommonNativeFacade notifies themeController because Android and Desktop do not seem to work reliably via media queries
        if (selectedThemeFacade instanceof WebThemeFacade) {
            selectedThemeFacade.addDarkListener(() => calendarLocator.themeController.reloadTheme());
        }
    }
    async handleFileImport(filesUris) {
        const files = await this.fileApp.getFilesMetaData(filesUris);
        const areAllICSFiles = files.every((file) => file.mimeType === CALENDAR_MIME_TYPE);
        if (areAllICSFiles) {
            const { importCalendarFile, parseCalendarFile } = await import("../common/calendar/import/CalendarImporter.js");
            let parsedEvents = [];
            for (const fileRef of files) {
                const dataFile = await this.fileApp.readDataFile(fileRef.location);
                if (dataFile == null)
                    continue;
                const data = parseCalendarFile(dataFile);
                parsedEvents.push(...data.contents);
            }
            await importCalendarFile(await this.calendarModel(), this.logins.getUserController(), parsedEvents);
        }
    }
    calendarModel = lazyMemoized(async () => {
        const { DefaultDateProvider } = await import("../common/calendar/date/CalendarUtils");
        const { CalendarModel } = await import("./calendar/model/CalendarModel");
        const timeZone = new DefaultDateProvider().timeZone();
        return new CalendarModel(notifications, this.alarmScheduler, this.eventController, this.serviceExecutor, this.logins, this.progressTracker, this.entityClient, this.mailboxModel, this.calendarFacade, this.fileController, timeZone, !isBrowser() ? this.externalCalendarFacade : null, deviceConfig, !isBrowser() ? this.pushService : null);
    });
    calendarInviteHandler = lazyMemoized(async () => {
        const { CalendarInviteHandler } = await import("./calendar/view/CalendarInvites.js");
        const { calendarNotificationSender } = await import("./calendar/view/CalendarNotificationSender.js");
        return new CalendarInviteHandler(this.mailboxModel, await this.calendarModel(), this.logins, calendarNotificationSender, (...arg) => this.sendMailModel(...arg));
    });
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
        const { getEventType } = await import("./calendar/gui/CalendarGuiUtils.js");
        const { CalendarEventPreviewViewModel } = await import("./calendar/gui/eventpopup/CalendarEventPreviewViewModel.js");
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
        const { CalendarContactPreviewViewModel } = await import("./calendar/gui/eventpopup/CalendarContactPreviewViewModel.js");
        return new CalendarContactPreviewViewModel(event, contact, canEdit);
    }
    postLoginActions = lazyMemoized(async () => {
        const { PostLoginActions } = await import("../common/login/PostLoginActions");
        return new PostLoginActions(this.credentialsProvider, this.secondFactorHandler, this.connectivityModel, this.logins, await this.noZoneDateProvider(), this.entityClient, this.userManagementFacade, this.customerFacade, this.themeController, () => this.showSetupWizard(), () => this.handleExternalSync(), () => this.setUpClientOnlyCalendars());
    });
    showSetupWizard = async () => {
        if (isApp()) {
            const { showSetupWizard } = await import("../common/native/main/wizard/SetupWizard.js");
            return showSetupWizard(this.systemPermissionHandler, this.webMobileFacade, null, this.systemFacade, this.credentialsProvider, null, deviceConfig, false);
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
    // For testing argon2 migration after login. The production server will reject this request.
    // This can be removed when we enable the migration.
    async changeToBycrypt(passphrase) {
        const currentUser = this.logins.getUserController().user;
        return this.loginFacade.migrateKdfType(KdfType.Bcrypt, passphrase, currentUser);
    }
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
export const calendarLocator = new CalendarLocator();
if (typeof window !== "undefined") {
    window.tutao.locator = calendarLocator;
}
//# sourceMappingURL=calendarLocator.js.map