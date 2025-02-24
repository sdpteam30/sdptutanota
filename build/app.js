import "./dist-chunk.js";
import { ProgrammingError } from "./ProgrammingError-chunk.js";
import { assertMainOrNodeBoot, bootFinished, isApp, isDesktop, isIOSApp, isOfflineStorageAvailable } from "./Env-chunk.js";
import { AppType, client } from "./ClientDetector-chunk.js";
import { mithril_default } from "./mithril-chunk.js";
import { assertNotNull, neverNull } from "./dist2-chunk.js";
import "./WhitelabelCustomizations-chunk.js";
import { lang, languageCodeToTag, languages } from "./LanguageViewModel-chunk.js";
import { styles } from "./styles-chunk.js";
import "./theme-chunk.js";
import "./TutanotaConstants-chunk.js";
import "./KeyManager-chunk.js";
import { windowFacade } from "./WindowFacade-chunk.js";
import { root } from "./RootView-chunk.js";
import "./size-chunk.js";
import "./HtmlUtils-chunk.js";
import "./luxon-chunk.js";
import "./EntityUtils-chunk.js";
import "./TypeModels-chunk.js";
import "./TypeRefs-chunk.js";
import "./CommonCalendarUtils-chunk.js";
import "./TypeModels2-chunk.js";
import "./TypeRefs2-chunk.js";
import "./ParserCombinator-chunk.js";
import "./CalendarUtils-chunk.js";
import "./ImportExportUtils-chunk.js";
import "./FormatValidator-chunk.js";
import "./stream-chunk.js";
import { deviceConfig } from "./DeviceConfig-chunk.js";
import { Logger, replaceNativeLogger } from "./Logger-chunk.js";
import { disableErrorHandlingDuringLogout, handleUncaughtError } from "./ErrorHandler-chunk.js";
import "./EntityFunctions-chunk.js";
import "./TypeModels3-chunk.js";
import "./ModelInfo-chunk.js";
import "./ErrorUtils-chunk.js";
import "./RestError-chunk.js";
import "./SetupMultipleError-chunk.js";
import "./OutOfSyncError-chunk.js";
import "./CancelledError-chunk.js";
import "./EventQueue-chunk.js";
import { CacheMode } from "./EntityRestClient-chunk.js";
import "./SuspensionError-chunk.js";
import "./LoginIncompleteError-chunk.js";
import "./CryptoError-chunk.js";
import "./error-chunk.js";
import "./RecipientsNotFoundError-chunk.js";
import "./DbError-chunk.js";
import "./QuotaExceededError-chunk.js";
import "./DeviceStorageUnavailableError-chunk.js";
import "./MailBodyTooLargeError-chunk.js";
import "./ImportError-chunk.js";
import "./WebauthnError-chunk.js";
import "./PermissionError-chunk.js";
import "./MessageDispatcher-chunk.js";
import "./WorkerProxy-chunk.js";
import "./EntityUpdateUtils-chunk.js";
import "./dist3-chunk.js";
import "./KeyLoaderFacade-chunk.js";
import { SessionType } from "./SessionType-chunk.js";

//#region src/mail-app/ApplicationPaths.ts
function applicationPaths({ login, termination, mail, externalLogin, contact, contactList, search, settings, calendar, signup, giftcard, recover, webauthn, webauthnmobile }) {
	return {
		"/login": login,
		"/termination": termination,
		"/signup": signup,
		"/recover": recover,
		"/mailto": mail,
		"/mail": mail,
		"/mail/:folderId": mail,
		"/mail/:folderId/:mailId": mail,
		"/ext": externalLogin,
		"/contact": contact,
		"/contact/:listId": contact,
		"/contact/:listId/:contactId": contact,
		"/contactlist": contactList,
		"/contactlist/:listId": contactList,
		"/contactlist/:listId/:Id": contactList,
		"/search/:category": search,
		"/search/:category/:id": search,
		"/settings": settings,
		"/settings/:folder": settings,
		"/settings/:folder/:id": settings,
		"/calendar": calendar,
		"/calendar/:view": calendar,
		"/calendar/:view/:date": calendar,
		"/giftcard/": giftcard,
		"/webauthn": webauthn,
		"/webauthnmobile": webauthnmobile
	};
}

//#endregion
//#region src/mail-app/app.ts
assertMainOrNodeBoot();
bootFinished();
const urlQueryParams = mithril_default.parseQueryString(location.search);
assignEnvPlatformId(urlQueryParams);
replaceNativeLogger(window, new Logger());
let currentView = null;
window.tutao = {
	client,
	m: mithril_default,
	lang,
	root,
	currentView,
	locator: null
};
client.init(navigator.userAgent, navigator.platform, AppType.Mail);
if (!client.isSupported()) throw new Error("Unsupported");
setupExceptionHandling();
const urlPrefixes = extractPathPrefixes();
window.tutao.appState = urlPrefixes;
const startRoute = getStartUrl(urlQueryParams);
history.replaceState(null, "", urlPrefixes.prefix + startRoute);
registerForMailto();
import("./en-chunk.js").then((en) => lang.init(en.default)).then(async () => {
	await import("./main-styles-chunk.js");
	const { initCommonLocator } = await import("./CommonLocator2-chunk.js");
	const { mailLocator } = await import("./mailLocator2-chunk.js");
	await mailLocator.init();
	initCommonLocator(mailLocator);
	const { setupNavShortcuts } = await import("./NavShortcuts-chunk.js");
	setupNavShortcuts();
	const { BottomNav } = await import("./BottomNav2-chunk.js");
	windowFacade.init(mailLocator.logins, mailLocator.connectivityModel, (visible) => {
		mailLocator.indexerFacade?.onVisibilityChanged(!document.hidden);
	});
	if (isDesktop()) import("./UpdatePrompt-chunk.js").then(({ registerForUpdates }) => registerForUpdates(mailLocator.desktopSettingsFacade));
	const userLanguage = deviceConfig.getLanguage() && languages.find((l) => l.code === deviceConfig.getLanguage());
	if (userLanguage) {
		const language = {
			code: userLanguage.code,
			languageTag: languageCodeToTag(userLanguage.code)
		};
		lang.setLanguage(language).catch((e) => {
			console.error("Failed to fetch translation: " + userLanguage.code, e);
		});
		if (isDesktop()) mailLocator.desktopSettingsFacade.changeLanguage(language.code, language.languageTag);
	}
	mailLocator.logins.addPostLoginAction(() => mailLocator.postLoginActions());
	mailLocator.logins.addPostLoginAction(async () => {
		return {
			async onPartialLoginSuccess() {
				if (isApp()) {
					mailLocator.fileApp.clearFileData().catch((e) => console.log("Failed to clean file data", e));
					const syncManager = mailLocator.nativeContactsSyncManager();
					if (syncManager.isEnabled() && isIOSApp()) {
						const canSync = await syncManager.canSync();
						if (!canSync) {
							await syncManager.disableSync();
							return;
						}
					}
					syncManager.syncContacts();
				}
				await mailLocator.mailboxModel.init();
				await mailLocator.mailModel.init();
			},
			async onFullLoginSuccess() {
				if (isOfflineStorageAvailable()) {
					await mailLocator.logins.loadCustomizations(CacheMode.WriteOnly);
					mithril_default.redraw();
				}
				if (mailLocator.mailModel.canManageLabels() && !mailLocator.logins.getUserController().props.defaultLabelCreated) {
					const { TutanotaPropertiesTypeRef } = await import("./TypeRefs3-chunk.js");
					const reloadTutanotaProperties = await mailLocator.entityClient.loadRoot(TutanotaPropertiesTypeRef, mailLocator.logins.getUserController().user.userGroup.group, { cacheMode: CacheMode.WriteOnly });
					if (!reloadTutanotaProperties.defaultLabelCreated) {
						const mailboxDetail = await mailLocator.mailboxModel.getMailboxDetails();
						mailLocator.mailFacade.createLabel(assertNotNull(mailboxDetail[0].mailbox._ownerGroup), {
							name: lang.get("importantLabel_label"),
							color: "#FEDC59"
						}).then(() => {
							mailLocator.logins.getUserController().props.defaultLabelCreated = true;
							mailLocator.entityClient.update(mailLocator.logins.getUserController().props);
						});
					}
				}
			}
		};
	});
	if (isOfflineStorageAvailable()) {
		const { CachePostLoginAction } = await import("./CachePostLoginAction-chunk.js");
		mailLocator.logins.addPostLoginAction(async () => new CachePostLoginAction(await mailLocator.calendarModel(), mailLocator.entityClient, mailLocator.progressTracker, mailLocator.cacheStorage, mailLocator.logins));
	}
	if (isDesktop()) mailLocator.logins.addPostLoginAction(async () => {
		return {
			onPartialLoginSuccess: async () => {},
			onFullLoginSuccess: async (event) => {
				if (event.sessionType === SessionType.Persistent) {
					const controller = await mailLocator.mailExportController();
					controller.resumeIfNeeded();
				}
			}
		};
	});
	styles.init(mailLocator.themeController);
	const contactViewResolver = makeViewResolver({
		prepareRoute: async () => {
			const { ContactView } = await import("./ContactView2-chunk.js");
			const drawerAttrsFactory = await mailLocator.drawerAttrsFactory();
			return {
				component: ContactView,
				cache: {
					drawerAttrsFactory,
					header: await mailLocator.appHeaderAttrs(),
					contactViewModel: await mailLocator.contactViewModel(),
					contactListViewModel: await mailLocator.contactListViewModel()
				}
			};
		},
		prepareAttrs: (cache) => ({
			drawerAttrs: cache.drawerAttrsFactory(),
			header: cache.header,
			contactViewModel: cache.contactViewModel,
			contactListViewModel: cache.contactListViewModel
		})
	}, mailLocator.logins);
	const paths = applicationPaths({
		login: makeViewResolver({
			prepareRoute: async () => {
				const migrator = await mailLocator.credentialFormatMigrator();
				await migrator.migrate();
				const { LoginView } = await import("./LoginView-chunk.js");
				const makeViewModel = await mailLocator.loginViewModelFactory();
				return {
					component: LoginView,
					cache: { makeViewModel }
				};
			},
			prepareAttrs: ({ makeViewModel }) => ({
				targetPath: "/mail",
				makeViewModel
			}),
			requireLogin: false
		}, mailLocator.logins),
		termination: makeViewResolver({
			prepareRoute: async () => {
				const { TerminationViewModel } = await import("./TerminationViewModel-chunk.js");
				const { TerminationView } = await import("./TerminationView-chunk.js");
				return {
					component: TerminationView,
					cache: {
						makeViewModel: () => new TerminationViewModel(mailLocator.logins, mailLocator.secondFactorHandler, mailLocator.serviceExecutor, mailLocator.entityClient),
						header: await mailLocator.appHeaderAttrs()
					}
				};
			},
			prepareAttrs: ({ makeViewModel, header }) => ({
				makeViewModel,
				header
			}),
			requireLogin: false
		}, mailLocator.logins),
		contact: contactViewResolver,
		contactList: contactViewResolver,
		externalLogin: makeViewResolver({
			prepareRoute: async () => {
				const { ExternalLoginView } = await import("./ExternalLoginView-chunk.js");
				const makeViewModel = await mailLocator.externalLoginViewModelFactory();
				return {
					component: ExternalLoginView,
					cache: {
						header: await mailLocator.appHeaderAttrs(),
						makeViewModel
					}
				};
			},
			prepareAttrs: ({ header, makeViewModel }) => ({
				header,
				viewModelFactory: makeViewModel
			}),
			requireLogin: false
		}, mailLocator.logins),
		mail: makeViewResolver({
			prepareRoute: async (previousCache) => {
				const { MailView } = await import("./MailView-chunk.js");
				return {
					component: MailView,
					cache: previousCache ?? {
						drawerAttrsFactory: await mailLocator.drawerAttrsFactory(),
						cache: {
							mailList: null,
							selectedFolder: null,
							conversationViewModel: null,
							conversationViewPreference: null
						},
						header: await mailLocator.appHeaderAttrs(),
						mailViewModel: await mailLocator.mailViewModel()
					}
				};
			},
			prepareAttrs: ({ drawerAttrsFactory, cache, header, mailViewModel }) => ({
				drawerAttrs: drawerAttrsFactory(),
				cache,
				header,
				desktopSystemFacade: mailLocator.desktopSystemFacade,
				mailViewModel
			})
		}, mailLocator.logins),
		settings: makeViewResolver({
			prepareRoute: async () => {
				const { SettingsView } = await import("./SettingsView-chunk.js");
				const drawerAttrsFactory = await mailLocator.drawerAttrsFactory();
				return {
					component: SettingsView,
					cache: {
						drawerAttrsFactory,
						header: await mailLocator.appHeaderAttrs()
					}
				};
			},
			prepareAttrs: (cache) => ({
				drawerAttrs: cache.drawerAttrsFactory(),
				header: cache.header,
				logins: mailLocator.logins
			})
		}, mailLocator.logins),
		search: makeViewResolver({
			prepareRoute: async () => {
				const { SearchView } = await import("./SearchView-chunk.js");
				const drawerAttrsFactory = await mailLocator.drawerAttrsFactory();
				return {
					component: SearchView,
					cache: {
						drawerAttrsFactory,
						header: await mailLocator.appHeaderAttrs(),
						searchViewModelFactory: await mailLocator.searchViewModelFactory(),
						contactModel: mailLocator.contactModel
					}
				};
			},
			prepareAttrs: (cache) => ({
				drawerAttrs: cache.drawerAttrsFactory(),
				header: cache.header,
				makeViewModel: cache.searchViewModelFactory,
				contactModel: cache.contactModel
			})
		}, mailLocator.logins),
		calendar: makeViewResolver({
			prepareRoute: async (cache) => {
				const { CalendarView } = await import("./CalendarView-chunk.js");
				const { lazySearchBar } = await import("./LazySearchBar2-chunk.js");
				const drawerAttrsFactory = await mailLocator.drawerAttrsFactory();
				return {
					component: CalendarView,
					cache: cache ?? {
						drawerAttrsFactory,
						header: await mailLocator.appHeaderAttrs(),
						calendarViewModel: await mailLocator.calendarViewModel(),
						bottomNav: () => mithril_default(BottomNav),
						lazySearchBar: () => mithril_default(lazySearchBar, { placeholder: lang.get("searchCalendar_placeholder") })
					}
				};
			},
			prepareAttrs: ({ header, calendarViewModel, drawerAttrsFactory, bottomNav, lazySearchBar }) => ({
				drawerAttrs: drawerAttrsFactory(),
				header,
				calendarViewModel,
				bottomNav,
				lazySearchBar
			})
		}, mailLocator.logins),
		signup: { async onmatch() {
			const { showSignupDialog } = await import("./LoginUtils2-chunk.js");
			const urlParams = mithril_default.parseQueryString(location.search.substring(1) + "&" + location.hash.substring(1));
			showSignupDialog(urlParams);
			const canonicalEl = document.querySelector("link[rel=canonical]");
			if (canonicalEl) canonicalEl.href = "https://app.tuta.com/signup";
			mithril_default.route.set("/login", {
				noAutoLogin: true,
				keepSession: true
			});
			mithril_default.route.set("/login", {
				noAutoLogin: true,
				keepSession: true
			});
			return null;
		} },
		giftcard: { async onmatch() {
			const { showGiftCardDialog } = await import("./LoginUtils2-chunk.js");
			showGiftCardDialog(location.hash);
			mithril_default.route.set("/login", {
				noAutoLogin: true,
				keepSession: true
			});
			return null;
		} },
		recover: { async onmatch(args) {
			const { showRecoverDialog } = await import("./LoginUtils2-chunk.js");
			const resetAction = args.resetAction === "password" || args.resetAction === "secondFactor" ? args.resetAction : "password";
			const mailAddress = typeof args.mailAddress === "string" ? args.mailAddress : "";
			showRecoverDialog(mailAddress, resetAction);
			mithril_default.route.set("/login", { noAutoLogin: true });
			return null;
		} },
		webauthn: makeOldViewResolver(async () => {
			const { BrowserWebauthn } = await import("./BrowserWebauthn2-chunk.js");
			const { NativeWebauthnView } = await import("./NativeWebauthnView-chunk.js");
			const { WebauthnNativeBridge } = await import("./WebauthnNativeBridge-chunk.js");
			const domainConfig$1 = mailLocator.domainConfigProvider().getDomainConfigForHostname(location.hostname, location.protocol, location.port);
			const creds = navigator.credentials;
			return new NativeWebauthnView(new BrowserWebauthn(creds, domainConfig$1), new WebauthnNativeBridge());
		}, {
			requireLogin: false,
			cacheView: false
		}, mailLocator.logins),
		webauthnmobile: makeViewResolver({
			prepareRoute: async () => {
				const { MobileWebauthnView } = await import("./MobileWebauthnView-chunk.js");
				const { BrowserWebauthn } = await import("./BrowserWebauthn2-chunk.js");
				const domainConfig$1 = mailLocator.domainConfigProvider().getDomainConfigForHostname(location.hostname, location.protocol, location.port);
				return {
					component: MobileWebauthnView,
					cache: { browserWebauthn: new BrowserWebauthn(navigator.credentials, domainConfig$1) }
				};
			},
			prepareAttrs: (cache) => cache,
			requireLogin: false
		}, mailLocator.logins)
	});
	mithril_default.route.prefix = neverNull(urlPrefixes.prefix).replace(/(?:%[a-f89][a-f0-9])+/gim, decodeURIComponent);
	const resolvers = { "/": { onmatch: (args, requestedPath) => forceLogin(args, requestedPath) } };
	for (let path in paths) resolvers[path] = paths[path];
	resolvers["/:path..."] = { onmatch: async () => {
		const { NotFoundPage } = await import("./NotFoundPage-chunk.js");
		return { view: () => mithril_default(root, mithril_default(NotFoundPage)) };
	} };
	mithril_default.route(document.body, startRoute, resolvers);
	if (isApp() || isDesktop()) await mailLocator.native.init();
	if (isDesktop()) {
		const { exposeNativeInterface } = await import("./ExposeNativeInterface-chunk.js");
		mailLocator.logins.addPostLoginAction(async () => exposeNativeInterface(mailLocator.native).postLoginActions);
	}
	const domainConfig = mailLocator.domainConfigProvider().getCurrentDomainConfig();
	const serviceworker = await import("./ServiceWorkerClient-chunk.js");
	serviceworker.init(domainConfig);
	printJobsMessage(domainConfig);
});
function forceLogin(args, requestedPath) {
	if (requestedPath.indexOf("#mail") !== -1) mithril_default.route.set(`/ext${location.hash}`);
else if (requestedPath.startsWith("/#")) mithril_default.route.set("/login");
else {
		let pathWithoutParameter = requestedPath.indexOf("?") > 0 ? requestedPath.substring(0, requestedPath.indexOf("?")) : requestedPath;
		if (pathWithoutParameter.trim() === "/") {
			let newQueryString = mithril_default.buildQueryString(args);
			mithril_default.route.set(`/login` + (newQueryString.length > 0 ? "?" + newQueryString : ""));
		} else mithril_default.route.set(`/login?requestedPath=${encodeURIComponent(requestedPath)}`);
	}
}
function setupExceptionHandling() {
	window.addEventListener("error", function(evt) {
		/**
		* evt.error is not always set, e.g. not for "content.js:1963 Uncaught DOMException: Failed to read
		* the 'selectionStart' property from 'HTMLInputElement': The input element's type ('email')
		* does not support selection."
		*
		* checking for defaultPrevented is necessary to prevent devTools eval errors to be thrown in here until
		* https://chromium-review.googlesource.com/c/v8/v8/+/3660253
		* is in the chromium version used by our electron client.
		* see https://stackoverflow.com/questions/72396527/evalerror-possible-side-effect-in-debug-evaluate-in-google-chrome
		* */
		if (evt.error && !evt.defaultPrevented) {
			handleUncaughtError(evt.error);
			evt.preventDefault();
		}
	});
	window.addEventListener("unhandledrejection", function(evt) {
		handleUncaughtError(evt.reason);
		evt.preventDefault();
	});
}
/**
* Wrap top-level component with necessary logic.
* Note: I can't make type inference work with attributes and components because of how broken mithril typedefs are so they are "never" by default and you
* have to specify generic types manually.
* @template FullAttrs type of the attributes that the component takes
* @template ComponentType type of the component
* @template RouteCache info that is prepared async on route change and can be used later to create attributes on every render. Is also persisted between
* the route changes.
* @param param
* @param param.prepareRoute called once per route change. Use it for everything async that should happen before the route change. The result is preserved for
* as long as RouteResolver lives if you need to persist things between routes. It receives the route cache from the previous call if there was one.
* @param param.prepareAttrs called once per redraw. The result of it will be added to TopLevelAttrs to make full attributes.
* @param param.requireLogin enforce login policy to either redirect to the login page or reload
* @param logins logincontroller to ask about login state
*/
function makeViewResolver({ prepareRoute, prepareAttrs, requireLogin }, logins) {
	requireLogin = requireLogin ?? true;
	let cache;
	return {
		async onmatch(args, requestedPath) {
			if (requireLogin && !logins.isUserLoggedIn()) {
				forceLogin(args, requestedPath);
				return null;
			} else if (!requireLogin && logins.isUserLoggedIn() && !args.keepSession) {
				await disableErrorHandlingDuringLogout();
				await logins.logout(false);
				windowFacade.reload(args);
				return null;
			} else {
				const prepared = await prepareRoute(cache);
				cache = prepared.cache;
				return prepared.component;
			}
		},
		render(vnode) {
			const args = mithril_default.route.param();
			const requestedPath = mithril_default.route.get();
			const c = vnode.tag;
			const attrs = {
				requestedPath,
				args,
				...prepareAttrs(assertNotNull(cache))
			};
			return mithril_default(root, mithril_default(c, {
				...attrs,
				oncreate({ state }) {
					window.tutao.currentView = state;
				}
			}));
		}
	};
}
function makeOldViewResolver(makeView, { requireLogin, cacheView } = {}, logins) {
	requireLogin = requireLogin ?? true;
	cacheView = cacheView ?? true;
	const viewCache = { view: null };
	return {
		onmatch: async (args, requestedPath) => {
			if (requireLogin && !logins.isUserLoggedIn()) forceLogin(args, requestedPath);
else if (!requireLogin && logins.isUserLoggedIn()) {
				await disableErrorHandlingDuringLogout();
				await logins.logout(false);
				windowFacade.reload(args);
			} else {
				let promise;
				if (viewCache.view == null) promise = makeView(args, requestedPath).then((view) => {
					if (cacheView) viewCache.view = view;
					return view;
				});
else promise = Promise.resolve(viewCache.view);
				Promise.all([promise]).then(([view]) => {
					view.updateUrl?.(args, requestedPath);
					window.tutao.currentView = view;
				});
				return promise;
			}
		},
		render: (vnode) => {
			return mithril_default(root, vnode);
		}
	};
}
function assignEnvPlatformId(urlQueryParams$1) {
	const platformId = urlQueryParams$1["platformId"];
	if (isApp() || isDesktop()) if (isApp() && (platformId === "android" || platformId === "ios") || isDesktop() && (platformId === "linux" || platformId === "win32" || platformId === "darwin")) env.platformId = platformId;
else throw new ProgrammingError(`Invalid platform id: ${String(platformId)}`);
}
function extractPathPrefixes() {
	const prefix = location.pathname.endsWith("/") ? location.pathname.substring(0, location.pathname.length - 1) : location.pathname;
	const prefixWithoutFile = prefix.includes(".") ? prefix.substring(0, prefix.lastIndexOf("/")) : prefix;
	return Object.freeze({
		prefix,
		prefixWithoutFile
	});
}
function getStartUrl(urlQueryParams$1) {
	let redirectTo = urlQueryParams$1["r"];
	if (redirectTo) {
		delete urlQueryParams$1["r"];
		if (typeof redirectTo !== "string") redirectTo = "";
	} else redirectTo = "";
	let newQueryString = mithril_default.buildQueryString(urlQueryParams$1);
	if (newQueryString.length > 0) newQueryString = "?" + newQueryString;
	let target = redirectTo + newQueryString;
	if (target === "" || target[0] !== "/") target = "/" + target;
	if (!new URL(urlPrefixes.prefix + target, window.location.href).hash) target += location.hash;
	return target;
}
function registerForMailto() {
	if (window.parent === window && !isDesktop() && typeof navigator.registerProtocolHandler === "function") {
		let origin = location.origin;
		try {
			navigator.registerProtocolHandler("mailto", origin + "/mailto#url=%s", "Tuta Mail");
		} catch (e) {
			console.log("Failed to register a mailto: protocol handler ", e);
		}
	}
}
function printJobsMessage(domainConfig) {
	if (env.dist && domainConfig.firstPartyDomain) console.log(`

........................................
........................................
........................................
........@@@@@@@@@@@@@@@@@@@@@@@.........
.....@....@@@@@@@@@@@@@@@@@@@@@@@.......
.....@@@....@@@@@@@@@@@@@@@@@@@@@@@.....
.....@@@@@..............................    Do you care about privacy?
.....@@@@@...@@@@@@@@@@@@@@@@@@@@@@.....
.....@@@@...@@@@@@@@@@@@@@@@@@@@@@@.....    Work at Tuta! Fight for our rights!
.....@@@@...@@@@@@@@@@@@@@@@@@@@@@......
.....@@@...@@@@@@@@@@@@@@@@@@@@@@.......    https://tuta.com/jobs
.....@@@...@@@@@@@@@@@@@@@@@@@@@@.......
.....@@...@@@@@@@@@@@@@@@@@@@@@@........
.....@@...@@@@@@@@@@@@@@@@@@@@@@........
.....@...@@@@@@@@@@@@@@@@@@@@@@.........
.....@...@@@@@@@@@@@@@@@@@@@@@@.........
........@@@@@@@@@@@@@@@@@@@@@@..........
.......@@@@@@@@@@@@@@@@@@@@@@...........
.......@@@@@@@@@@@@@@@@@@@@@@...........
........................................
........................................
........................................

`);
}

//#endregion
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwibmFtZXMiOlsiY3VycmVudFZpZXc6IENvbXBvbmVudDx1bmtub3duPiB8IG51bGwiLCJjYW5vbmljYWxFbDogSFRNTExpbmtFbGVtZW50IHwgbnVsbCIsImFyZ3M6IGFueSIsImRvbWFpbkNvbmZpZyIsInJlc29sdmVyczogUm91dGVEZWZzIiwiYXJnczogUmVjb3JkPHN0cmluZywgRGljdD4iLCJyZXF1ZXN0ZWRQYXRoOiBzdHJpbmciLCJsb2dpbnM6IExvZ2luQ29udHJvbGxlciIsImNhY2hlOiBSb3V0ZUNhY2hlIHwgbnVsbCIsInZub2RlOiBWbm9kZTxDb21wb25lbnRUeXBlPiIsIm1ha2VWaWV3OiAoYXJnczogb2JqZWN0LCByZXF1ZXN0ZWRQYXRoOiBzdHJpbmcpID0+IFByb21pc2U8VG9wTGV2ZWxWaWV3PiIsInZpZXdDYWNoZTogeyB2aWV3OiBUb3BMZXZlbFZpZXcgfCBudWxsIH0iLCJwcm9taXNlOiBQcm9taXNlPFRvcExldmVsVmlldz4iLCJ1cmxRdWVyeVBhcmFtczogTWl0aHJpbC5QYXJhbXMiLCJ1cmxRdWVyeVBhcmFtcyIsImRvbWFpbkNvbmZpZzogRG9tYWluQ29uZmlnIl0sInNvdXJjZXMiOlsiLi4vc3JjL21haWwtYXBwL0FwcGxpY2F0aW9uUGF0aHMudHMiLCIuLi9zcmMvbWFpbC1hcHAvYXBwLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIEBidW5kbGVJbnRvOmJvb3RcblxuaW1wb3J0IHsgUm91dGVSZXNvbHZlciB9IGZyb20gXCJtaXRocmlsXCJcblxuZXhwb3J0IHR5cGUgQXBwbGljYXRpb25QYXRocyA9IFJlY29yZDxzdHJpbmcsIFJvdXRlUmVzb2x2ZXI+XG50eXBlIFZpZXdSZXNvbHZlcnMgPSB7XG5cdGxvZ2luOiBSb3V0ZVJlc29sdmVyXG5cdHRlcm1pbmF0aW9uOiBSb3V0ZVJlc29sdmVyXG5cdG1haWw6IFJvdXRlUmVzb2x2ZXJcblx0ZXh0ZXJuYWxMb2dpbjogUm91dGVSZXNvbHZlclxuXHRjb250YWN0OiBSb3V0ZVJlc29sdmVyXG5cdGNvbnRhY3RMaXN0OiBSb3V0ZVJlc29sdmVyXG5cdHNlYXJjaDogUm91dGVSZXNvbHZlclxuXHRzZXR0aW5nczogUm91dGVSZXNvbHZlclxuXHRjYWxlbmRhcjogUm91dGVSZXNvbHZlclxuXHRzaWdudXA6IFJvdXRlUmVzb2x2ZXJcblx0Z2lmdGNhcmQ6IFJvdXRlUmVzb2x2ZXJcblx0cmVjb3ZlcjogUm91dGVSZXNvbHZlclxuXHR3ZWJhdXRobjogUm91dGVSZXNvbHZlclxuXHR3ZWJhdXRobm1vYmlsZTogUm91dGVSZXNvbHZlclxufVxuXG5leHBvcnQgZnVuY3Rpb24gYXBwbGljYXRpb25QYXRocyh7XG5cdGxvZ2luLFxuXHR0ZXJtaW5hdGlvbixcblx0bWFpbCxcblx0ZXh0ZXJuYWxMb2dpbixcblx0Y29udGFjdCxcblx0Y29udGFjdExpc3QsXG5cdHNlYXJjaCxcblx0c2V0dGluZ3MsXG5cdGNhbGVuZGFyLFxuXHRzaWdudXAsXG5cdGdpZnRjYXJkLFxuXHRyZWNvdmVyLFxuXHR3ZWJhdXRobixcblx0d2ViYXV0aG5tb2JpbGUsXG59OiBWaWV3UmVzb2x2ZXJzKTogQXBwbGljYXRpb25QYXRocyB7XG5cdHJldHVybiB7XG5cdFx0XCIvbG9naW5cIjogbG9naW4sXG5cdFx0XCIvdGVybWluYXRpb25cIjogdGVybWluYXRpb24sXG5cdFx0XCIvc2lnbnVwXCI6IHNpZ251cCxcblx0XHRcIi9yZWNvdmVyXCI6IHJlY292ZXIsXG5cdFx0XCIvbWFpbHRvXCI6IG1haWwsXG5cdFx0XCIvbWFpbFwiOiBtYWlsLFxuXHRcdFwiL21haWwvOmZvbGRlcklkXCI6IG1haWwsXG5cdFx0XCIvbWFpbC86Zm9sZGVySWQvOm1haWxJZFwiOiBtYWlsLFxuXHRcdFwiL2V4dFwiOiBleHRlcm5hbExvZ2luLFxuXHRcdFwiL2NvbnRhY3RcIjogY29udGFjdCxcblx0XHRcIi9jb250YWN0LzpsaXN0SWRcIjogY29udGFjdCxcblx0XHRcIi9jb250YWN0LzpsaXN0SWQvOmNvbnRhY3RJZFwiOiBjb250YWN0LFxuXHRcdFwiL2NvbnRhY3RsaXN0XCI6IGNvbnRhY3RMaXN0LFxuXHRcdFwiL2NvbnRhY3RsaXN0LzpsaXN0SWRcIjogY29udGFjdExpc3QsXG5cdFx0XCIvY29udGFjdGxpc3QvOmxpc3RJZC86SWRcIjogY29udGFjdExpc3QsXG5cdFx0XCIvc2VhcmNoLzpjYXRlZ29yeVwiOiBzZWFyY2gsXG5cdFx0XCIvc2VhcmNoLzpjYXRlZ29yeS86aWRcIjogc2VhcmNoLFxuXHRcdFwiL3NldHRpbmdzXCI6IHNldHRpbmdzLFxuXHRcdFwiL3NldHRpbmdzLzpmb2xkZXJcIjogc2V0dGluZ3MsXG5cdFx0XCIvc2V0dGluZ3MvOmZvbGRlci86aWRcIjogc2V0dGluZ3MsXG5cdFx0XCIvY2FsZW5kYXJcIjogY2FsZW5kYXIsXG5cdFx0XCIvY2FsZW5kYXIvOnZpZXdcIjogY2FsZW5kYXIsXG5cdFx0XCIvY2FsZW5kYXIvOnZpZXcvOmRhdGVcIjogY2FsZW5kYXIsXG5cdFx0XCIvZ2lmdGNhcmQvXCI6IGdpZnRjYXJkLFxuXHRcdFwiL3dlYmF1dGhuXCI6IHdlYmF1dGhuLFxuXHRcdFwiL3dlYmF1dGhubW9iaWxlXCI6IHdlYmF1dGhubW9iaWxlLFxuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQYXRoQmFzZXMoKTogQXJyYXk8c3RyaW5nPiB7XG5cdGNvbnN0IHBhdGhzID0gT2JqZWN0LmtleXMoYXBwbGljYXRpb25QYXRocyh7fSBhcyBhbnkpKVxuXHRjb25zdCB1bmlxdWVQYXRoQmFzZXMgPSBuZXcgU2V0KHBhdGhzLm1hcCgocGF0aCkgPT4gcGF0aC5zcGxpdChcIi9cIilbMV0pKVxuXHRyZXR1cm4gQXJyYXkuZnJvbSh1bmlxdWVQYXRoQmFzZXMpXG59XG4iLCJpbXBvcnQgeyBjbGllbnQgfSBmcm9tIFwiLi4vY29tbW9uL21pc2MvQ2xpZW50RGV0ZWN0b3IuanNcIlxuaW1wb3J0IG0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IE1pdGhyaWwsIHsgQ2hpbGRyZW4sIENsYXNzQ29tcG9uZW50LCBDb21wb25lbnQsIFJvdXRlRGVmcywgUm91dGVSZXNvbHZlciwgVm5vZGUsIFZub2RlRE9NIH0gZnJvbSBcIm1pdGhyaWxcIlxuaW1wb3J0IHsgbGFuZywgbGFuZ3VhZ2VDb2RlVG9UYWcsIGxhbmd1YWdlcyB9IGZyb20gXCIuLi9jb21tb24vbWlzYy9MYW5ndWFnZVZpZXdNb2RlbC5qc1wiXG5pbXBvcnQgeyByb290IH0gZnJvbSBcIi4uL1Jvb3RWaWV3LmpzXCJcbmltcG9ydCB7IGFzc2VydE5vdE51bGwsIG5ldmVyTnVsbCB9IGZyb20gXCJAdHV0YW8vdHV0YW5vdGEtdXRpbHNcIlxuaW1wb3J0IHsgd2luZG93RmFjYWRlIH0gZnJvbSBcIi4uL2NvbW1vbi9taXNjL1dpbmRvd0ZhY2FkZS5qc1wiXG5pbXBvcnQgeyBzdHlsZXMgfSBmcm9tIFwiLi4vY29tbW9uL2d1aS9zdHlsZXMuanNcIlxuaW1wb3J0IHsgZGV2aWNlQ29uZmlnIH0gZnJvbSBcIi4uL2NvbW1vbi9taXNjL0RldmljZUNvbmZpZy5qc1wiXG5pbXBvcnQgeyBMb2dnZXIsIHJlcGxhY2VOYXRpdmVMb2dnZXIgfSBmcm9tIFwiLi4vY29tbW9uL2FwaS9jb21tb24vTG9nZ2VyLmpzXCJcbmltcG9ydCB7IGFwcGxpY2F0aW9uUGF0aHMgfSBmcm9tIFwiLi9BcHBsaWNhdGlvblBhdGhzLmpzXCJcbmltcG9ydCB7IFByb2dyYW1taW5nRXJyb3IgfSBmcm9tIFwiLi4vY29tbW9uL2FwaS9jb21tb24vZXJyb3IvUHJvZ3JhbW1pbmdFcnJvci5qc1wiXG5pbXBvcnQgdHlwZSB7IExvZ2luVmlldywgTG9naW5WaWV3QXR0cnMgfSBmcm9tIFwiLi4vY29tbW9uL2xvZ2luL0xvZ2luVmlldy5qc1wiXG5pbXBvcnQgdHlwZSB7IExvZ2luVmlld01vZGVsIH0gZnJvbSBcIi4uL2NvbW1vbi9sb2dpbi9Mb2dpblZpZXdNb2RlbC5qc1wiXG5pbXBvcnQgeyBUZXJtaW5hdGlvblZpZXcsIFRlcm1pbmF0aW9uVmlld0F0dHJzIH0gZnJvbSBcIi4uL2NvbW1vbi90ZXJtaW5hdGlvbi9UZXJtaW5hdGlvblZpZXcuanNcIlxuaW1wb3J0IHsgVGVybWluYXRpb25WaWV3TW9kZWwgfSBmcm9tIFwiLi4vY29tbW9uL3Rlcm1pbmF0aW9uL1Rlcm1pbmF0aW9uVmlld01vZGVsLmpzXCJcbmltcG9ydCB7IE1vYmlsZVdlYmF1dGhuQXR0cnMsIE1vYmlsZVdlYmF1dGhuVmlldyB9IGZyb20gXCIuLi9jb21tb24vbG9naW4vTW9iaWxlV2ViYXV0aG5WaWV3LmpzXCJcbmltcG9ydCB7IEJyb3dzZXJXZWJhdXRobiB9IGZyb20gXCIuLi9jb21tb24vbWlzYy8yZmEvd2ViYXV0aG4vQnJvd3NlcldlYmF1dGhuLmpzXCJcbmltcG9ydCB7IENhbGVuZGFyVmlldywgQ2FsZW5kYXJWaWV3QXR0cnMgfSBmcm9tIFwiLi4vY2FsZW5kYXItYXBwL2NhbGVuZGFyL3ZpZXcvQ2FsZW5kYXJWaWV3LmpzXCJcbmltcG9ydCB7IERyYXdlck1lbnVBdHRycyB9IGZyb20gXCIuLi9jb21tb24vZ3VpL25hdi9EcmF3ZXJNZW51LmpzXCJcbmltcG9ydCB7IE1haWxWaWV3LCBNYWlsVmlld0F0dHJzLCBNYWlsVmlld0NhY2hlIH0gZnJvbSBcIi4vbWFpbC92aWV3L01haWxWaWV3LmpzXCJcbmltcG9ydCB7IENvbnRhY3RWaWV3LCBDb250YWN0Vmlld0F0dHJzIH0gZnJvbSBcIi4vY29udGFjdHMvdmlldy9Db250YWN0Vmlldy5qc1wiXG5pbXBvcnQgeyBTZXR0aW5nc1ZpZXcgfSBmcm9tIFwiLi9zZXR0aW5ncy9TZXR0aW5nc1ZpZXcuanNcIlxuaW1wb3J0IHsgU2VhcmNoVmlldywgU2VhcmNoVmlld0F0dHJzIH0gZnJvbSBcIi4vc2VhcmNoL3ZpZXcvU2VhcmNoVmlldy5qc1wiXG5pbXBvcnQgeyBUb3BMZXZlbEF0dHJzLCBUb3BMZXZlbFZpZXcgfSBmcm9tIFwiLi4vVG9wTGV2ZWxWaWV3LmpzXCJcbmltcG9ydCB7IEFwcEhlYWRlckF0dHJzIH0gZnJvbSBcIi4uL2NvbW1vbi9ndWkvSGVhZGVyLmpzXCJcbmltcG9ydCB7IENhbGVuZGFyVmlld01vZGVsIH0gZnJvbSBcIi4uL2NhbGVuZGFyLWFwcC9jYWxlbmRhci92aWV3L0NhbGVuZGFyVmlld01vZGVsLmpzXCJcbmltcG9ydCB7IEV4dGVybmFsTG9naW5WaWV3LCBFeHRlcm5hbExvZ2luVmlld0F0dHJzLCBFeHRlcm5hbExvZ2luVmlld01vZGVsIH0gZnJvbSBcIi4vbWFpbC92aWV3L0V4dGVybmFsTG9naW5WaWV3LmpzXCJcbmltcG9ydCB7IExvZ2luQ29udHJvbGxlciB9IGZyb20gXCIuLi9jb21tb24vYXBpL21haW4vTG9naW5Db250cm9sbGVyLmpzXCJcbmltcG9ydCB0eXBlIHsgTWFpbFZpZXdNb2RlbCB9IGZyb20gXCIuL21haWwvdmlldy9NYWlsVmlld01vZGVsLmpzXCJcbmltcG9ydCB7IFNlYXJjaFZpZXdNb2RlbCB9IGZyb20gXCIuL3NlYXJjaC92aWV3L1NlYXJjaFZpZXdNb2RlbC5qc1wiXG5pbXBvcnQgeyBDb250YWN0Vmlld01vZGVsIH0gZnJvbSBcIi4vY29udGFjdHMvdmlldy9Db250YWN0Vmlld01vZGVsLmpzXCJcbmltcG9ydCB7IENvbnRhY3RMaXN0Vmlld01vZGVsIH0gZnJvbSBcIi4vY29udGFjdHMvdmlldy9Db250YWN0TGlzdFZpZXdNb2RlbC5qc1wiXG5pbXBvcnQgeyBhc3NlcnRNYWluT3JOb2RlQm9vdCwgYm9vdEZpbmlzaGVkLCBpc0FwcCwgaXNEZXNrdG9wLCBpc0lPU0FwcCwgaXNPZmZsaW5lU3RvcmFnZUF2YWlsYWJsZSB9IGZyb20gXCIuLi9jb21tb24vYXBpL2NvbW1vbi9FbnYuanNcIlxuaW1wb3J0IHsgU2V0dGluZ3NWaWV3QXR0cnMgfSBmcm9tIFwiLi4vY29tbW9uL3NldHRpbmdzL0ludGVyZmFjZXMuanNcIlxuaW1wb3J0IHsgZGlzYWJsZUVycm9ySGFuZGxpbmdEdXJpbmdMb2dvdXQsIGhhbmRsZVVuY2F1Z2h0RXJyb3IgfSBmcm9tIFwiLi4vY29tbW9uL21pc2MvRXJyb3JIYW5kbGVyLmpzXCJcbmltcG9ydCB7IEFwcFR5cGUgfSBmcm9tIFwiLi4vY29tbW9uL21pc2MvQ2xpZW50Q29uc3RhbnRzLmpzXCJcbmltcG9ydCB7IENvbnRhY3RNb2RlbCB9IGZyb20gXCIuLi9jb21tb24vY29udGFjdHNGdW5jdGlvbmFsaXR5L0NvbnRhY3RNb2RlbC5qc1wiXG5pbXBvcnQgeyBDYWNoZU1vZGUgfSBmcm9tIFwiLi4vY29tbW9uL2FwaS93b3JrZXIvcmVzdC9FbnRpdHlSZXN0Q2xpZW50XCJcbmltcG9ydCB7IFNlc3Npb25UeXBlIH0gZnJvbSBcIi4uL2NvbW1vbi9hcGkvY29tbW9uL1Nlc3Npb25UeXBlLmpzXCJcblxuYXNzZXJ0TWFpbk9yTm9kZUJvb3QoKVxuYm9vdEZpbmlzaGVkKClcblxuY29uc3QgdXJsUXVlcnlQYXJhbXMgPSBtLnBhcnNlUXVlcnlTdHJpbmcobG9jYXRpb24uc2VhcmNoKVxuXG5hc3NpZ25FbnZQbGF0Zm9ybUlkKHVybFF1ZXJ5UGFyYW1zKVxucmVwbGFjZU5hdGl2ZUxvZ2dlcih3aW5kb3csIG5ldyBMb2dnZXIoKSlcblxubGV0IGN1cnJlbnRWaWV3OiBDb21wb25lbnQ8dW5rbm93bj4gfCBudWxsID0gbnVsbFxud2luZG93LnR1dGFvID0ge1xuXHRjbGllbnQsXG5cdG0sXG5cdGxhbmcsXG5cdHJvb3QsXG5cdGN1cnJlbnRWaWV3LFxuXHRsb2NhdG9yOiBudWxsLFxufVxuXG5jbGllbnQuaW5pdChuYXZpZ2F0b3IudXNlckFnZW50LCBuYXZpZ2F0b3IucGxhdGZvcm0sIEFwcFR5cGUuTWFpbClcblxuaWYgKCFjbGllbnQuaXNTdXBwb3J0ZWQoKSkge1xuXHR0aHJvdyBuZXcgRXJyb3IoXCJVbnN1cHBvcnRlZFwiKVxufVxuXG4vLyBTZXR1cCBleGNlcHRpb24gaGFuZGxpbmcgYWZ0ZXIgY2hlY2tpbmcgZm9yIGNsaWVudCBzdXBwb3J0LCBiZWNhdXNlIGluIGFuZHJvaWQgdGhlIEVycm9yIGlzIGNhdWdodCBieSB0aGUgdW5oYW5kbGVkIHJlamVjdGlvbiBoYW5kbGVyXG4vLyBhbmQgdGhlbiB0aGUgXCJVcGRhdGUgV2ViVmlld1wiIG1lc3NhZ2Ugd2lsbCBuZXZlciBiZSBzaG93XG4vLyB3ZSBzdGlsbCB3YW50IHRvIGRvIHRoaXMgQVNBUCBzbyB3ZSBjYW4gaGFuZGxlIG90aGVyIGVycm9yc1xuc2V0dXBFeGNlcHRpb25IYW5kbGluZygpXG5cbi8vIElmIHRoZSB3ZWJhcHAgaXMgc2VydmVkIHVuZGVyIHNvbWUgZm9sZGVyIGUuZy4gL2J1aWxkIHdlIHdhbnQgdG8gY29uc2lkZXIgdGhpcyBvdXIgcm9vdFxuY29uc3QgdXJsUHJlZml4ZXMgPSBleHRyYWN0UGF0aFByZWZpeGVzKClcbi8vIFdyaXRlIGl0IGhlcmUgZm9yIHRoZSBXb3JrZXJDbGllbnQgc28gdGhhdCBpdCBjYW4gbG9hZCByZWxhdGl2ZSB3b3JrZXIgZWFzaWx5LiBTaG91bGQgZG8gaXQgaGVyZSBzbyB0aGF0IGl0IGRvZXNuJ3QgYnJlYWsgYWZ0ZXIgSE1SLlxud2luZG93LnR1dGFvLmFwcFN0YXRlID0gdXJsUHJlZml4ZXNcblxuY29uc3Qgc3RhcnRSb3V0ZSA9IGdldFN0YXJ0VXJsKHVybFF1ZXJ5UGFyYW1zKVxuaGlzdG9yeS5yZXBsYWNlU3RhdGUobnVsbCwgXCJcIiwgdXJsUHJlZml4ZXMucHJlZml4ICsgc3RhcnRSb3V0ZSlcblxucmVnaXN0ZXJGb3JNYWlsdG8oKVxuXG5pbXBvcnQoXCIuL3RyYW5zbGF0aW9ucy9lbi5qc1wiKVxuXHQudGhlbigoZW4pID0+IGxhbmcuaW5pdChlbi5kZWZhdWx0KSlcblx0LnRoZW4oYXN5bmMgKCkgPT4ge1xuXHRcdGF3YWl0IGltcG9ydChcIi4uL2NvbW1vbi9ndWkvbWFpbi1zdHlsZXMuanNcIilcblxuXHRcdC8vIGRvIHRoaXMgYWZ0ZXIgbGFuZyBpbml0aWFsaXplZFxuXHRcdGNvbnN0IHsgaW5pdENvbW1vbkxvY2F0b3IgfSA9IGF3YWl0IGltcG9ydChcIi4uL2NvbW1vbi9hcGkvbWFpbi9Db21tb25Mb2NhdG9yLmpzXCIpXG5cdFx0Y29uc3QgeyBtYWlsTG9jYXRvciB9ID0gYXdhaXQgaW1wb3J0KFwiLi9tYWlsTG9jYXRvci5qc1wiKVxuXHRcdGF3YWl0IG1haWxMb2NhdG9yLmluaXQoKVxuXG5cdFx0aW5pdENvbW1vbkxvY2F0b3IobWFpbExvY2F0b3IpXG5cblx0XHRjb25zdCB7IHNldHVwTmF2U2hvcnRjdXRzIH0gPSBhd2FpdCBpbXBvcnQoXCIuLi9jb21tb24vbWlzYy9OYXZTaG9ydGN1dHMuanNcIilcblx0XHRzZXR1cE5hdlNob3J0Y3V0cygpXG5cblx0XHRjb25zdCB7IEJvdHRvbU5hdiB9ID0gYXdhaXQgaW1wb3J0KFwiLi9ndWkvQm90dG9tTmF2LmpzXCIpXG5cblx0XHQvLyB0aGlzIG5lZWRzIHRvIHN0YXkgYWZ0ZXIgY2xpZW50LmluaXRcblx0XHR3aW5kb3dGYWNhZGUuaW5pdChtYWlsTG9jYXRvci5sb2dpbnMsIG1haWxMb2NhdG9yLmNvbm5lY3Rpdml0eU1vZGVsLCAodmlzaWJsZSkgPT4ge1xuXHRcdFx0bWFpbExvY2F0b3IuaW5kZXhlckZhY2FkZT8ub25WaXNpYmlsaXR5Q2hhbmdlZCghZG9jdW1lbnQuaGlkZGVuKVxuXHRcdH0pXG5cdFx0aWYgKGlzRGVza3RvcCgpKSB7XG5cdFx0XHRpbXBvcnQoXCIuLi9jb21tb24vbmF0aXZlL21haW4vVXBkYXRlUHJvbXB0LmpzXCIpLnRoZW4oKHsgcmVnaXN0ZXJGb3JVcGRhdGVzIH0pID0+IHJlZ2lzdGVyRm9yVXBkYXRlcyhtYWlsTG9jYXRvci5kZXNrdG9wU2V0dGluZ3NGYWNhZGUpKVxuXHRcdH1cblxuXHRcdGNvbnN0IHVzZXJMYW5ndWFnZSA9IGRldmljZUNvbmZpZy5nZXRMYW5ndWFnZSgpICYmIGxhbmd1YWdlcy5maW5kKChsKSA9PiBsLmNvZGUgPT09IGRldmljZUNvbmZpZy5nZXRMYW5ndWFnZSgpKVxuXG5cdFx0aWYgKHVzZXJMYW5ndWFnZSkge1xuXHRcdFx0Y29uc3QgbGFuZ3VhZ2UgPSB7XG5cdFx0XHRcdGNvZGU6IHVzZXJMYW5ndWFnZS5jb2RlLFxuXHRcdFx0XHRsYW5ndWFnZVRhZzogbGFuZ3VhZ2VDb2RlVG9UYWcodXNlckxhbmd1YWdlLmNvZGUpLFxuXHRcdFx0fVxuXHRcdFx0bGFuZy5zZXRMYW5ndWFnZShsYW5ndWFnZSkuY2F0Y2goKGUpID0+IHtcblx0XHRcdFx0Y29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBmZXRjaCB0cmFuc2xhdGlvbjogXCIgKyB1c2VyTGFuZ3VhZ2UuY29kZSwgZSlcblx0XHRcdH0pXG5cblx0XHRcdGlmIChpc0Rlc2t0b3AoKSkge1xuXHRcdFx0XHRtYWlsTG9jYXRvci5kZXNrdG9wU2V0dGluZ3NGYWNhZGUuY2hhbmdlTGFuZ3VhZ2UobGFuZ3VhZ2UuY29kZSwgbGFuZ3VhZ2UubGFuZ3VhZ2VUYWcpXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0bWFpbExvY2F0b3IubG9naW5zLmFkZFBvc3RMb2dpbkFjdGlvbigoKSA9PiBtYWlsTG9jYXRvci5wb3N0TG9naW5BY3Rpb25zKCkpXG5cdFx0bWFpbExvY2F0b3IubG9naW5zLmFkZFBvc3RMb2dpbkFjdGlvbihhc3luYyAoKSA9PiB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRhc3luYyBvblBhcnRpYWxMb2dpblN1Y2Nlc3MoKSB7XG5cdFx0XHRcdFx0aWYgKGlzQXBwKCkpIHtcblx0XHRcdFx0XHRcdG1haWxMb2NhdG9yLmZpbGVBcHAuY2xlYXJGaWxlRGF0YSgpLmNhdGNoKChlKSA9PiBjb25zb2xlLmxvZyhcIkZhaWxlZCB0byBjbGVhbiBmaWxlIGRhdGFcIiwgZSkpXG5cdFx0XHRcdFx0XHRjb25zdCBzeW5jTWFuYWdlciA9IG1haWxMb2NhdG9yLm5hdGl2ZUNvbnRhY3RzU3luY01hbmFnZXIoKVxuXHRcdFx0XHRcdFx0aWYgKHN5bmNNYW5hZ2VyLmlzRW5hYmxlZCgpICYmIGlzSU9TQXBwKCkpIHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgY2FuU3luYyA9IGF3YWl0IHN5bmNNYW5hZ2VyLmNhblN5bmMoKVxuXHRcdFx0XHRcdFx0XHRpZiAoIWNhblN5bmMpIHtcblx0XHRcdFx0XHRcdFx0XHRhd2FpdCBzeW5jTWFuYWdlci5kaXNhYmxlU3luYygpXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHN5bmNNYW5hZ2VyLnN5bmNDb250YWN0cygpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGF3YWl0IG1haWxMb2NhdG9yLm1haWxib3hNb2RlbC5pbml0KClcblx0XHRcdFx0XHRhd2FpdCBtYWlsTG9jYXRvci5tYWlsTW9kZWwuaW5pdCgpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGFzeW5jIG9uRnVsbExvZ2luU3VjY2VzcygpIHtcblx0XHRcdFx0XHQvLyBXZSBtaWdodCBoYXZlIG91dGRhdGVkIEN1c3RvbWVyIGZlYXR1cmVzLCBmb3JjZSByZWxvYWQgdGhlIGN1c3RvbWVyIHRvIG1ha2Ugc3VyZSB0aGUgY3VzdG9taXphdGlvbnMgYXJlIHVwLXRvLWRhdGVcblx0XHRcdFx0XHRpZiAoaXNPZmZsaW5lU3RvcmFnZUF2YWlsYWJsZSgpKSB7XG5cdFx0XHRcdFx0XHRhd2FpdCBtYWlsTG9jYXRvci5sb2dpbnMubG9hZEN1c3RvbWl6YXRpb25zKENhY2hlTW9kZS5Xcml0ZU9ubHkpXG5cdFx0XHRcdFx0XHRtLnJlZHJhdygpXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKG1haWxMb2NhdG9yLm1haWxNb2RlbC5jYW5NYW5hZ2VMYWJlbHMoKSAmJiAhbWFpbExvY2F0b3IubG9naW5zLmdldFVzZXJDb250cm9sbGVyKCkucHJvcHMuZGVmYXVsdExhYmVsQ3JlYXRlZCkge1xuXHRcdFx0XHRcdFx0Y29uc3QgeyBUdXRhbm90YVByb3BlcnRpZXNUeXBlUmVmIH0gPSBhd2FpdCBpbXBvcnQoXCIuLi9jb21tb24vYXBpL2VudGl0aWVzL3R1dGFub3RhL1R5cGVSZWZzXCIpXG5cdFx0XHRcdFx0XHRjb25zdCByZWxvYWRUdXRhbm90YVByb3BlcnRpZXMgPSBhd2FpdCBtYWlsTG9jYXRvci5lbnRpdHlDbGllbnQubG9hZFJvb3QoXG5cdFx0XHRcdFx0XHRcdFR1dGFub3RhUHJvcGVydGllc1R5cGVSZWYsXG5cdFx0XHRcdFx0XHRcdG1haWxMb2NhdG9yLmxvZ2lucy5nZXRVc2VyQ29udHJvbGxlcigpLnVzZXIudXNlckdyb3VwLmdyb3VwLFxuXHRcdFx0XHRcdFx0XHR7IGNhY2hlTW9kZTogQ2FjaGVNb2RlLldyaXRlT25seSB9LFxuXHRcdFx0XHRcdFx0KVxuXG5cdFx0XHRcdFx0XHRpZiAoIXJlbG9hZFR1dGFub3RhUHJvcGVydGllcy5kZWZhdWx0TGFiZWxDcmVhdGVkKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IG1haWxib3hEZXRhaWwgPSBhd2FpdCBtYWlsTG9jYXRvci5tYWlsYm94TW9kZWwuZ2V0TWFpbGJveERldGFpbHMoKVxuXG5cdFx0XHRcdFx0XHRcdG1haWxMb2NhdG9yLm1haWxGYWNhZGVcblx0XHRcdFx0XHRcdFx0XHQuY3JlYXRlTGFiZWwoYXNzZXJ0Tm90TnVsbChtYWlsYm94RGV0YWlsWzBdLm1haWxib3guX293bmVyR3JvdXApLCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRuYW1lOiBsYW5nLmdldChcImltcG9ydGFudExhYmVsX2xhYmVsXCIpLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y29sb3I6IFwiI0ZFREM1OVwiLFxuXHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0LnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0bWFpbExvY2F0b3IubG9naW5zLmdldFVzZXJDb250cm9sbGVyKCkucHJvcHMuZGVmYXVsdExhYmVsQ3JlYXRlZCA9IHRydWVcblx0XHRcdFx0XHRcdFx0XHRcdG1haWxMb2NhdG9yLmVudGl0eUNsaWVudC51cGRhdGUobWFpbExvY2F0b3IubG9naW5zLmdldFVzZXJDb250cm9sbGVyKCkucHJvcHMpXG5cdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHR9XG5cdFx0fSlcblxuXHRcdGlmIChpc09mZmxpbmVTdG9yYWdlQXZhaWxhYmxlKCkpIHtcblx0XHRcdGNvbnN0IHsgQ2FjaGVQb3N0TG9naW5BY3Rpb24gfSA9IGF3YWl0IGltcG9ydChcIi4uL2NvbW1vbi9vZmZsaW5lL0NhY2hlUG9zdExvZ2luQWN0aW9uLmpzXCIpXG5cdFx0XHRtYWlsTG9jYXRvci5sb2dpbnMuYWRkUG9zdExvZ2luQWN0aW9uKFxuXHRcdFx0XHRhc3luYyAoKSA9PlxuXHRcdFx0XHRcdG5ldyBDYWNoZVBvc3RMb2dpbkFjdGlvbihcblx0XHRcdFx0XHRcdGF3YWl0IG1haWxMb2NhdG9yLmNhbGVuZGFyTW9kZWwoKSxcblx0XHRcdFx0XHRcdG1haWxMb2NhdG9yLmVudGl0eUNsaWVudCxcblx0XHRcdFx0XHRcdG1haWxMb2NhdG9yLnByb2dyZXNzVHJhY2tlcixcblx0XHRcdFx0XHRcdG1haWxMb2NhdG9yLmNhY2hlU3RvcmFnZSxcblx0XHRcdFx0XHRcdG1haWxMb2NhdG9yLmxvZ2lucyxcblx0XHRcdFx0XHQpLFxuXHRcdFx0KVxuXHRcdH1cblxuXHRcdGlmIChpc0Rlc2t0b3AoKSkge1xuXHRcdFx0bWFpbExvY2F0b3IubG9naW5zLmFkZFBvc3RMb2dpbkFjdGlvbihhc3luYyAoKSA9PiB7XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0b25QYXJ0aWFsTG9naW5TdWNjZXNzOiBhc3luYyAoKSA9PiB7fSxcblx0XHRcdFx0XHRvbkZ1bGxMb2dpblN1Y2Nlc3M6IGFzeW5jIChldmVudCkgPT4ge1xuXHRcdFx0XHRcdFx0Ly8gbm90IGEgdGVtcG9yYXJ5IGFrYSBzaWdudXAgbG9naW5cblx0XHRcdFx0XHRcdGlmIChldmVudC5zZXNzaW9uVHlwZSA9PT0gU2Vzc2lvblR5cGUuUGVyc2lzdGVudCkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBjb250cm9sbGVyID0gYXdhaXQgbWFpbExvY2F0b3IubWFpbEV4cG9ydENvbnRyb2xsZXIoKVxuXHRcdFx0XHRcdFx0XHRjb250cm9sbGVyLnJlc3VtZUlmTmVlZGVkKClcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdH1cblxuXHRcdHN0eWxlcy5pbml0KG1haWxMb2NhdG9yLnRoZW1lQ29udHJvbGxlcilcblxuXHRcdGNvbnN0IGNvbnRhY3RWaWV3UmVzb2x2ZXIgPSBtYWtlVmlld1Jlc29sdmVyPFxuXHRcdFx0Q29udGFjdFZpZXdBdHRycyxcblx0XHRcdENvbnRhY3RWaWV3LFxuXHRcdFx0e1xuXHRcdFx0XHRkcmF3ZXJBdHRyc0ZhY3Rvcnk6ICgpID0+IERyYXdlck1lbnVBdHRyc1xuXHRcdFx0XHRoZWFkZXI6IEFwcEhlYWRlckF0dHJzXG5cdFx0XHRcdGNvbnRhY3RWaWV3TW9kZWw6IENvbnRhY3RWaWV3TW9kZWxcblx0XHRcdFx0Y29udGFjdExpc3RWaWV3TW9kZWw6IENvbnRhY3RMaXN0Vmlld01vZGVsXG5cdFx0XHR9XG5cdFx0Pihcblx0XHRcdHtcblx0XHRcdFx0cHJlcGFyZVJvdXRlOiBhc3luYyAoKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgeyBDb250YWN0VmlldyB9ID0gYXdhaXQgaW1wb3J0KFwiLi9jb250YWN0cy92aWV3L0NvbnRhY3RWaWV3LmpzXCIpXG5cdFx0XHRcdFx0Y29uc3QgZHJhd2VyQXR0cnNGYWN0b3J5ID0gYXdhaXQgbWFpbExvY2F0b3IuZHJhd2VyQXR0cnNGYWN0b3J5KClcblx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0Y29tcG9uZW50OiBDb250YWN0Vmlldyxcblx0XHRcdFx0XHRcdGNhY2hlOiB7XG5cdFx0XHRcdFx0XHRcdGRyYXdlckF0dHJzRmFjdG9yeSxcblx0XHRcdFx0XHRcdFx0aGVhZGVyOiBhd2FpdCBtYWlsTG9jYXRvci5hcHBIZWFkZXJBdHRycygpLFxuXHRcdFx0XHRcdFx0XHRjb250YWN0Vmlld01vZGVsOiBhd2FpdCBtYWlsTG9jYXRvci5jb250YWN0Vmlld01vZGVsKCksXG5cdFx0XHRcdFx0XHRcdGNvbnRhY3RMaXN0Vmlld01vZGVsOiBhd2FpdCBtYWlsTG9jYXRvci5jb250YWN0TGlzdFZpZXdNb2RlbCgpLFxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHByZXBhcmVBdHRyczogKGNhY2hlKSA9PiAoe1xuXHRcdFx0XHRcdGRyYXdlckF0dHJzOiBjYWNoZS5kcmF3ZXJBdHRyc0ZhY3RvcnkoKSxcblx0XHRcdFx0XHRoZWFkZXI6IGNhY2hlLmhlYWRlcixcblx0XHRcdFx0XHRjb250YWN0Vmlld01vZGVsOiBjYWNoZS5jb250YWN0Vmlld01vZGVsLFxuXHRcdFx0XHRcdGNvbnRhY3RMaXN0Vmlld01vZGVsOiBjYWNoZS5jb250YWN0TGlzdFZpZXdNb2RlbCxcblx0XHRcdFx0fSksXG5cdFx0XHR9LFxuXHRcdFx0bWFpbExvY2F0b3IubG9naW5zLFxuXHRcdClcblxuXHRcdGNvbnN0IHBhdGhzID0gYXBwbGljYXRpb25QYXRocyh7XG5cdFx0XHRsb2dpbjogbWFrZVZpZXdSZXNvbHZlcjxMb2dpblZpZXdBdHRycywgTG9naW5WaWV3LCB7IG1ha2VWaWV3TW9kZWw6ICgpID0+IExvZ2luVmlld01vZGVsIH0+KFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cHJlcGFyZVJvdXRlOiBhc3luYyAoKSA9PiB7XG5cdFx0XHRcdFx0XHRjb25zdCBtaWdyYXRvciA9IGF3YWl0IG1haWxMb2NhdG9yLmNyZWRlbnRpYWxGb3JtYXRNaWdyYXRvcigpXG5cdFx0XHRcdFx0XHRhd2FpdCBtaWdyYXRvci5taWdyYXRlKClcblxuXHRcdFx0XHRcdFx0Y29uc3QgeyBMb2dpblZpZXcgfSA9IGF3YWl0IGltcG9ydChcIi4uL2NvbW1vbi9sb2dpbi9Mb2dpblZpZXcuanNcIilcblx0XHRcdFx0XHRcdGNvbnN0IG1ha2VWaWV3TW9kZWwgPSBhd2FpdCBtYWlsTG9jYXRvci5sb2dpblZpZXdNb2RlbEZhY3RvcnkoKVxuXHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0Y29tcG9uZW50OiBMb2dpblZpZXcsXG5cdFx0XHRcdFx0XHRcdGNhY2hlOiB7XG5cdFx0XHRcdFx0XHRcdFx0bWFrZVZpZXdNb2RlbCxcblx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHByZXBhcmVBdHRyczogKHsgbWFrZVZpZXdNb2RlbCB9KSA9PiAoeyB0YXJnZXRQYXRoOiBcIi9tYWlsXCIsIG1ha2VWaWV3TW9kZWwgfSksXG5cdFx0XHRcdFx0cmVxdWlyZUxvZ2luOiBmYWxzZSxcblx0XHRcdFx0fSxcblx0XHRcdFx0bWFpbExvY2F0b3IubG9naW5zLFxuXHRcdFx0KSxcblx0XHRcdHRlcm1pbmF0aW9uOiBtYWtlVmlld1Jlc29sdmVyPFxuXHRcdFx0XHRUZXJtaW5hdGlvblZpZXdBdHRycyxcblx0XHRcdFx0VGVybWluYXRpb25WaWV3LFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bWFrZVZpZXdNb2RlbDogKCkgPT4gVGVybWluYXRpb25WaWV3TW9kZWxcblx0XHRcdFx0XHRoZWFkZXI6IEFwcEhlYWRlckF0dHJzXG5cdFx0XHRcdH1cblx0XHRcdD4oXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRwcmVwYXJlUm91dGU6IGFzeW5jICgpID0+IHtcblx0XHRcdFx0XHRcdGNvbnN0IHsgVGVybWluYXRpb25WaWV3TW9kZWwgfSA9IGF3YWl0IGltcG9ydChcIi4uL2NvbW1vbi90ZXJtaW5hdGlvbi9UZXJtaW5hdGlvblZpZXdNb2RlbC5qc1wiKVxuXHRcdFx0XHRcdFx0Y29uc3QgeyBUZXJtaW5hdGlvblZpZXcgfSA9IGF3YWl0IGltcG9ydChcIi4uL2NvbW1vbi90ZXJtaW5hdGlvbi9UZXJtaW5hdGlvblZpZXcuanNcIilcblx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdGNvbXBvbmVudDogVGVybWluYXRpb25WaWV3LFxuXHRcdFx0XHRcdFx0XHRjYWNoZToge1xuXHRcdFx0XHRcdFx0XHRcdG1ha2VWaWV3TW9kZWw6ICgpID0+XG5cdFx0XHRcdFx0XHRcdFx0XHRuZXcgVGVybWluYXRpb25WaWV3TW9kZWwoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG1haWxMb2NhdG9yLmxvZ2lucyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0bWFpbExvY2F0b3Iuc2Vjb25kRmFjdG9ySGFuZGxlcixcblx0XHRcdFx0XHRcdFx0XHRcdFx0bWFpbExvY2F0b3Iuc2VydmljZUV4ZWN1dG9yLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRtYWlsTG9jYXRvci5lbnRpdHlDbGllbnQsXG5cdFx0XHRcdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0XHRcdGhlYWRlcjogYXdhaXQgbWFpbExvY2F0b3IuYXBwSGVhZGVyQXR0cnMoKSxcblx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHByZXBhcmVBdHRyczogKHsgbWFrZVZpZXdNb2RlbCwgaGVhZGVyIH0pID0+ICh7IG1ha2VWaWV3TW9kZWwsIGhlYWRlciB9KSxcblx0XHRcdFx0XHRyZXF1aXJlTG9naW46IGZhbHNlLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRtYWlsTG9jYXRvci5sb2dpbnMsXG5cdFx0XHQpLFxuXHRcdFx0Y29udGFjdDogY29udGFjdFZpZXdSZXNvbHZlcixcblx0XHRcdGNvbnRhY3RMaXN0OiBjb250YWN0Vmlld1Jlc29sdmVyLFxuXHRcdFx0ZXh0ZXJuYWxMb2dpbjogbWFrZVZpZXdSZXNvbHZlcjxcblx0XHRcdFx0RXh0ZXJuYWxMb2dpblZpZXdBdHRycyxcblx0XHRcdFx0RXh0ZXJuYWxMb2dpblZpZXcsXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRoZWFkZXI6IEFwcEhlYWRlckF0dHJzXG5cdFx0XHRcdFx0bWFrZVZpZXdNb2RlbDogKCkgPT4gRXh0ZXJuYWxMb2dpblZpZXdNb2RlbFxuXHRcdFx0XHR9XG5cdFx0XHQ+KFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cHJlcGFyZVJvdXRlOiBhc3luYyAoKSA9PiB7XG5cdFx0XHRcdFx0XHRjb25zdCB7IEV4dGVybmFsTG9naW5WaWV3IH0gPSBhd2FpdCBpbXBvcnQoXCIuL21haWwvdmlldy9FeHRlcm5hbExvZ2luVmlldy5qc1wiKVxuXHRcdFx0XHRcdFx0Y29uc3QgbWFrZVZpZXdNb2RlbCA9IGF3YWl0IG1haWxMb2NhdG9yLmV4dGVybmFsTG9naW5WaWV3TW9kZWxGYWN0b3J5KClcblx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdGNvbXBvbmVudDogRXh0ZXJuYWxMb2dpblZpZXcsXG5cdFx0XHRcdFx0XHRcdGNhY2hlOiB7IGhlYWRlcjogYXdhaXQgbWFpbExvY2F0b3IuYXBwSGVhZGVyQXR0cnMoKSwgbWFrZVZpZXdNb2RlbCB9LFxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0cHJlcGFyZUF0dHJzOiAoeyBoZWFkZXIsIG1ha2VWaWV3TW9kZWwgfSkgPT4gKHsgaGVhZGVyLCB2aWV3TW9kZWxGYWN0b3J5OiBtYWtlVmlld01vZGVsIH0pLFxuXHRcdFx0XHRcdHJlcXVpcmVMb2dpbjogZmFsc2UsXG5cdFx0XHRcdH0sXG5cdFx0XHRcdG1haWxMb2NhdG9yLmxvZ2lucyxcblx0XHRcdCksXG5cdFx0XHRtYWlsOiBtYWtlVmlld1Jlc29sdmVyPFxuXHRcdFx0XHRNYWlsVmlld0F0dHJzLFxuXHRcdFx0XHRNYWlsVmlldyxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGRyYXdlckF0dHJzRmFjdG9yeTogKCkgPT4gRHJhd2VyTWVudUF0dHJzXG5cdFx0XHRcdFx0Y2FjaGU6IE1haWxWaWV3Q2FjaGVcblx0XHRcdFx0XHRoZWFkZXI6IEFwcEhlYWRlckF0dHJzXG5cdFx0XHRcdFx0bWFpbFZpZXdNb2RlbDogTWFpbFZpZXdNb2RlbFxuXHRcdFx0XHR9XG5cdFx0XHQ+KFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cHJlcGFyZVJvdXRlOiBhc3luYyAocHJldmlvdXNDYWNoZSkgPT4ge1xuXHRcdFx0XHRcdFx0Y29uc3QgeyBNYWlsVmlldyB9ID0gYXdhaXQgaW1wb3J0KFwiLi9tYWlsL3ZpZXcvTWFpbFZpZXcuanNcIilcblx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdGNvbXBvbmVudDogTWFpbFZpZXcsXG5cdFx0XHRcdFx0XHRcdGNhY2hlOiBwcmV2aW91c0NhY2hlID8/IHtcblx0XHRcdFx0XHRcdFx0XHRkcmF3ZXJBdHRyc0ZhY3Rvcnk6IGF3YWl0IG1haWxMb2NhdG9yLmRyYXdlckF0dHJzRmFjdG9yeSgpLFxuXHRcdFx0XHRcdFx0XHRcdGNhY2hlOiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRtYWlsTGlzdDogbnVsbCxcblx0XHRcdFx0XHRcdFx0XHRcdHNlbGVjdGVkRm9sZGVyOiBudWxsLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y29udmVyc2F0aW9uVmlld01vZGVsOiBudWxsLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y29udmVyc2F0aW9uVmlld1ByZWZlcmVuY2U6IG51bGwsXG5cdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHRoZWFkZXI6IGF3YWl0IG1haWxMb2NhdG9yLmFwcEhlYWRlckF0dHJzKCksXG5cdFx0XHRcdFx0XHRcdFx0bWFpbFZpZXdNb2RlbDogYXdhaXQgbWFpbExvY2F0b3IubWFpbFZpZXdNb2RlbCgpLFxuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0cHJlcGFyZUF0dHJzOiAoeyBkcmF3ZXJBdHRyc0ZhY3RvcnksIGNhY2hlLCBoZWFkZXIsIG1haWxWaWV3TW9kZWwgfSkgPT4gKHtcblx0XHRcdFx0XHRcdGRyYXdlckF0dHJzOiBkcmF3ZXJBdHRyc0ZhY3RvcnkoKSxcblx0XHRcdFx0XHRcdGNhY2hlLFxuXHRcdFx0XHRcdFx0aGVhZGVyLFxuXHRcdFx0XHRcdFx0ZGVza3RvcFN5c3RlbUZhY2FkZTogbWFpbExvY2F0b3IuZGVza3RvcFN5c3RlbUZhY2FkZSxcblx0XHRcdFx0XHRcdG1haWxWaWV3TW9kZWwsXG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdH0sXG5cdFx0XHRcdG1haWxMb2NhdG9yLmxvZ2lucyxcblx0XHRcdCksXG5cdFx0XHRzZXR0aW5nczogbWFrZVZpZXdSZXNvbHZlcjxcblx0XHRcdFx0U2V0dGluZ3NWaWV3QXR0cnMsXG5cdFx0XHRcdFNldHRpbmdzVmlldyxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGRyYXdlckF0dHJzRmFjdG9yeTogKCkgPT4gRHJhd2VyTWVudUF0dHJzXG5cdFx0XHRcdFx0aGVhZGVyOiBBcHBIZWFkZXJBdHRyc1xuXHRcdFx0XHR9XG5cdFx0XHQ+KFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cHJlcGFyZVJvdXRlOiBhc3luYyAoKSA9PiB7XG5cdFx0XHRcdFx0XHRjb25zdCB7IFNldHRpbmdzVmlldyB9ID0gYXdhaXQgaW1wb3J0KFwiLi9zZXR0aW5ncy9TZXR0aW5nc1ZpZXcuanNcIilcblx0XHRcdFx0XHRcdGNvbnN0IGRyYXdlckF0dHJzRmFjdG9yeSA9IGF3YWl0IG1haWxMb2NhdG9yLmRyYXdlckF0dHJzRmFjdG9yeSgpXG5cdFx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHRjb21wb25lbnQ6IFNldHRpbmdzVmlldyxcblx0XHRcdFx0XHRcdFx0Y2FjaGU6IHtcblx0XHRcdFx0XHRcdFx0XHRkcmF3ZXJBdHRyc0ZhY3RvcnksXG5cdFx0XHRcdFx0XHRcdFx0aGVhZGVyOiBhd2FpdCBtYWlsTG9jYXRvci5hcHBIZWFkZXJBdHRycygpLFxuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0cHJlcGFyZUF0dHJzOiAoY2FjaGUpID0+ICh7XG5cdFx0XHRcdFx0XHRkcmF3ZXJBdHRyczogY2FjaGUuZHJhd2VyQXR0cnNGYWN0b3J5KCksXG5cdFx0XHRcdFx0XHRoZWFkZXI6IGNhY2hlLmhlYWRlcixcblx0XHRcdFx0XHRcdGxvZ2luczogbWFpbExvY2F0b3IubG9naW5zLFxuXHRcdFx0XHRcdH0pLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRtYWlsTG9jYXRvci5sb2dpbnMsXG5cdFx0XHQpLFxuXHRcdFx0c2VhcmNoOiBtYWtlVmlld1Jlc29sdmVyPFxuXHRcdFx0XHRTZWFyY2hWaWV3QXR0cnMsXG5cdFx0XHRcdFNlYXJjaFZpZXcsXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRkcmF3ZXJBdHRyc0ZhY3Rvcnk6ICgpID0+IERyYXdlck1lbnVBdHRyc1xuXHRcdFx0XHRcdGhlYWRlcjogQXBwSGVhZGVyQXR0cnNcblx0XHRcdFx0XHRzZWFyY2hWaWV3TW9kZWxGYWN0b3J5OiAoKSA9PiBTZWFyY2hWaWV3TW9kZWxcblx0XHRcdFx0XHRjb250YWN0TW9kZWw6IENvbnRhY3RNb2RlbFxuXHRcdFx0XHR9XG5cdFx0XHQ+KFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cHJlcGFyZVJvdXRlOiBhc3luYyAoKSA9PiB7XG5cdFx0XHRcdFx0XHRjb25zdCB7IFNlYXJjaFZpZXcgfSA9IGF3YWl0IGltcG9ydChcIi4vc2VhcmNoL3ZpZXcvU2VhcmNoVmlldy5qc1wiKVxuXHRcdFx0XHRcdFx0Y29uc3QgZHJhd2VyQXR0cnNGYWN0b3J5ID0gYXdhaXQgbWFpbExvY2F0b3IuZHJhd2VyQXR0cnNGYWN0b3J5KClcblx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdGNvbXBvbmVudDogU2VhcmNoVmlldyxcblx0XHRcdFx0XHRcdFx0Y2FjaGU6IHtcblx0XHRcdFx0XHRcdFx0XHRkcmF3ZXJBdHRyc0ZhY3RvcnksXG5cdFx0XHRcdFx0XHRcdFx0aGVhZGVyOiBhd2FpdCBtYWlsTG9jYXRvci5hcHBIZWFkZXJBdHRycygpLFxuXHRcdFx0XHRcdFx0XHRcdHNlYXJjaFZpZXdNb2RlbEZhY3Rvcnk6IGF3YWl0IG1haWxMb2NhdG9yLnNlYXJjaFZpZXdNb2RlbEZhY3RvcnkoKSxcblx0XHRcdFx0XHRcdFx0XHRjb250YWN0TW9kZWw6IG1haWxMb2NhdG9yLmNvbnRhY3RNb2RlbCxcblx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHByZXBhcmVBdHRyczogKGNhY2hlKSA9PiAoe1xuXHRcdFx0XHRcdFx0ZHJhd2VyQXR0cnM6IGNhY2hlLmRyYXdlckF0dHJzRmFjdG9yeSgpLFxuXHRcdFx0XHRcdFx0aGVhZGVyOiBjYWNoZS5oZWFkZXIsXG5cdFx0XHRcdFx0XHRtYWtlVmlld01vZGVsOiBjYWNoZS5zZWFyY2hWaWV3TW9kZWxGYWN0b3J5LFxuXHRcdFx0XHRcdFx0Y29udGFjdE1vZGVsOiBjYWNoZS5jb250YWN0TW9kZWwsXG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdH0sXG5cdFx0XHRcdG1haWxMb2NhdG9yLmxvZ2lucyxcblx0XHRcdCksXG5cdFx0XHRjYWxlbmRhcjogbWFrZVZpZXdSZXNvbHZlcjxcblx0XHRcdFx0Q2FsZW5kYXJWaWV3QXR0cnMsXG5cdFx0XHRcdENhbGVuZGFyVmlldyxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGRyYXdlckF0dHJzRmFjdG9yeTogKCkgPT4gRHJhd2VyTWVudUF0dHJzXG5cdFx0XHRcdFx0aGVhZGVyOiBBcHBIZWFkZXJBdHRyc1xuXHRcdFx0XHRcdGNhbGVuZGFyVmlld01vZGVsOiBDYWxlbmRhclZpZXdNb2RlbFxuXHRcdFx0XHRcdGJvdHRvbU5hdjogKCkgPT4gQ2hpbGRyZW5cblx0XHRcdFx0XHRsYXp5U2VhcmNoQmFyOiAoKSA9PiBDaGlsZHJlblxuXHRcdFx0XHR9XG5cdFx0XHQ+KFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cHJlcGFyZVJvdXRlOiBhc3luYyAoY2FjaGUpID0+IHtcblx0XHRcdFx0XHRcdGNvbnN0IHsgQ2FsZW5kYXJWaWV3IH0gPSBhd2FpdCBpbXBvcnQoXCIuLi9jYWxlbmRhci1hcHAvY2FsZW5kYXIvdmlldy9DYWxlbmRhclZpZXcuanNcIilcblx0XHRcdFx0XHRcdGNvbnN0IHsgbGF6eVNlYXJjaEJhciB9ID0gYXdhaXQgaW1wb3J0KFwiLi9MYXp5U2VhcmNoQmFyLmpzXCIpXG5cdFx0XHRcdFx0XHRjb25zdCBkcmF3ZXJBdHRyc0ZhY3RvcnkgPSBhd2FpdCBtYWlsTG9jYXRvci5kcmF3ZXJBdHRyc0ZhY3RvcnkoKVxuXHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0Y29tcG9uZW50OiBDYWxlbmRhclZpZXcsXG5cdFx0XHRcdFx0XHRcdGNhY2hlOiBjYWNoZSA/PyB7XG5cdFx0XHRcdFx0XHRcdFx0ZHJhd2VyQXR0cnNGYWN0b3J5LFxuXHRcdFx0XHRcdFx0XHRcdGhlYWRlcjogYXdhaXQgbWFpbExvY2F0b3IuYXBwSGVhZGVyQXR0cnMoKSxcblx0XHRcdFx0XHRcdFx0XHRjYWxlbmRhclZpZXdNb2RlbDogYXdhaXQgbWFpbExvY2F0b3IuY2FsZW5kYXJWaWV3TW9kZWwoKSxcblx0XHRcdFx0XHRcdFx0XHRib3R0b21OYXY6ICgpID0+IG0oQm90dG9tTmF2KSxcblx0XHRcdFx0XHRcdFx0XHRsYXp5U2VhcmNoQmFyOiAoKSA9PlxuXHRcdFx0XHRcdFx0XHRcdFx0bShsYXp5U2VhcmNoQmFyLCB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHBsYWNlaG9sZGVyOiBsYW5nLmdldChcInNlYXJjaENhbGVuZGFyX3BsYWNlaG9sZGVyXCIpLFxuXHRcdFx0XHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRwcmVwYXJlQXR0cnM6ICh7IGhlYWRlciwgY2FsZW5kYXJWaWV3TW9kZWwsIGRyYXdlckF0dHJzRmFjdG9yeSwgYm90dG9tTmF2LCBsYXp5U2VhcmNoQmFyIH0pID0+ICh7XG5cdFx0XHRcdFx0XHRkcmF3ZXJBdHRyczogZHJhd2VyQXR0cnNGYWN0b3J5KCksXG5cdFx0XHRcdFx0XHRoZWFkZXIsXG5cdFx0XHRcdFx0XHRjYWxlbmRhclZpZXdNb2RlbCxcblx0XHRcdFx0XHRcdGJvdHRvbU5hdixcblx0XHRcdFx0XHRcdGxhenlTZWFyY2hCYXIsXG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdH0sXG5cdFx0XHRcdG1haWxMb2NhdG9yLmxvZ2lucyxcblx0XHRcdCksXG5cblx0XHRcdC8qKlxuXHRcdFx0ICogVGhlIGZvbGxvd2luZyByZXNvbHZlcnMgYXJlIHByb2dyYW1tZWQgYnkgaGFuZCBpbnN0ZWFkIG9mIHVzaW5nIGNyZWF0ZVZpZXdSZXNvbHZlcigpIGluIG9yZGVyIHRvIGJlIGFibGUgdG8gcHJvcGVybHkgcmVkaXJlY3Rcblx0XHRcdCAqIHRvIHRoZSBsb2dpbiBwYWdlIHdpdGhvdXQgaGF2aW5nIHRvIGRlYWwgd2l0aCBhIHRvbiBvZiBjb25kaXRpb25hbCBsb2dpYyBpbiB0aGUgTG9naW5WaWV3TW9kZWwgYW5kIHRvIGF2b2lkIHNvbWUgb2YgdGhlIGRlZmF1bHRcblx0XHRcdCAqIGJlaGF2aW91ciBvZiByZXNvbHZlcnMgY3JlYXRlZCB3aXRoIGNyZWF0ZVZpZXdSZXNvbHZlcigpLCBlLmcuIGNhY2hpbmcuXG5cdFx0XHQgKi9cblx0XHRcdHNpZ251cDoge1xuXHRcdFx0XHRhc3luYyBvbm1hdGNoKCkge1xuXHRcdFx0XHRcdGNvbnN0IHsgc2hvd1NpZ251cERpYWxvZyB9ID0gYXdhaXQgaW1wb3J0KFwiLi4vY29tbW9uL21pc2MvTG9naW5VdGlscy5qc1wiKVxuXG5cdFx0XHRcdFx0Ly8gV2UgaGF2ZSB0byBtYW51YWxseSBwYXJzZSBpdCBiZWNhdXNlIG1pdGhyaWwgZG9lcyBub3QgcHV0IGhhc2ggaW50byBhcmdzIG9mIG9ubWF0Y2hcblx0XHRcdFx0XHRjb25zdCB1cmxQYXJhbXMgPSBtLnBhcnNlUXVlcnlTdHJpbmcobG9jYXRpb24uc2VhcmNoLnN1YnN0cmluZygxKSArIFwiJlwiICsgbG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSkpXG5cdFx0XHRcdFx0c2hvd1NpZ251cERpYWxvZyh1cmxQYXJhbXMpXG5cblx0XHRcdFx0XHQvLyBDaGFuZ2UgdGhlIGhyZWYgb2YgdGhlIGNhbm9uaWNhbCBsaW5rIGVsZW1lbnQgdG8gbWFrZSB0aGUgL3NpZ251cCBwYXRoIGluZGV4ZWQuXG5cdFx0XHRcdFx0Ly8gU2luY2UgdGhpcyBpcyBqdXN0IGZvciBzZWFyY2ggY3Jhd2xlcnMsIHdlIGRvIG5vdCBoYXZlIHRvIGNoYW5nZSBpdCBhZ2FpbiBsYXRlci5cblx0XHRcdFx0XHQvLyBXZSBrbm93IGF0IGxlYXN0IEdvb2dsZSBjcmF3bGVyIGV4ZWN1dGVzIGpzIHRvIHJlbmRlciB0aGUgYXBwbGljYXRpb24uXG5cdFx0XHRcdFx0Y29uc3QgY2Fub25pY2FsRWw6IEhUTUxMaW5rRWxlbWVudCB8IG51bGwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwibGlua1tyZWw9Y2Fub25pY2FsXVwiKVxuXHRcdFx0XHRcdGlmIChjYW5vbmljYWxFbCkge1xuXHRcdFx0XHRcdFx0Y2Fub25pY2FsRWwuaHJlZiA9IFwiaHR0cHM6Ly9hcHAudHV0YS5jb20vc2lnbnVwXCJcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyB3aGVuIHRoZSB1c2VyIHByZXNzZXMgdGhlIGJyb3dzZXIgYmFjayBidXR0b24sIHdlIHdvdWxkIGdldCBhIC9sb2dpbiByb3V0ZSB3aXRob3V0IGFyZ3VtZW50c1xuXHRcdFx0XHRcdC8vIGluIHRoZSBwb3BzdGF0ZSBldmVudCwgbG9nZ2luZyB1cyBvdXQgYW5kIHJlbG9hZGluZyB0aGUgcGFnZSBiZWZvcmUgd2UgaGF2ZSBhIGNoYW5jZSB0byAoYXN5bmNocm9ub3VzbHkpIGFzayBmb3IgY29uZmlybWF0aW9uXG5cdFx0XHRcdFx0Ly8gb25tYXRjaCBvZiB0aGUgbG9naW4gdmlldyBpcyBjYWxsZWQgYWZ0ZXIgdGhlIHBvcHN0YXRlIGhhbmRsZXIsIGJ1dCBiZWZvcmUgYW55IGFzeW5jaHJvbm91cyBvcGVyYXRpb25zIHdlbnQgYWhlYWQuXG5cdFx0XHRcdFx0Ly8gZHVwbGljYXRpbmcgdGhlIGhpc3RvcnkgZW50cnkgYWxsb3dzIHVzIHRvIGtlZXAgdGhlIGFyZ3VtZW50cyBmb3IgYSBzaW5nbGUgYmFjayBidXR0b24gcHJlc3MgYW5kIHJ1biBvdXIgb3duIGNvZGUgdG8gaGFuZGxlIGl0XG5cdFx0XHRcdFx0bS5yb3V0ZS5zZXQoXCIvbG9naW5cIiwge1xuXHRcdFx0XHRcdFx0bm9BdXRvTG9naW46IHRydWUsXG5cdFx0XHRcdFx0XHRrZWVwU2Vzc2lvbjogdHJ1ZSxcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdG0ucm91dGUuc2V0KFwiL2xvZ2luXCIsIHtcblx0XHRcdFx0XHRcdG5vQXV0b0xvZ2luOiB0cnVlLFxuXHRcdFx0XHRcdFx0a2VlcFNlc3Npb246IHRydWUsXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRyZXR1cm4gbnVsbFxuXHRcdFx0XHR9LFxuXHRcdFx0fSxcblx0XHRcdGdpZnRjYXJkOiB7XG5cdFx0XHRcdGFzeW5jIG9ubWF0Y2goKSB7XG5cdFx0XHRcdFx0Y29uc3QgeyBzaG93R2lmdENhcmREaWFsb2cgfSA9IGF3YWl0IGltcG9ydChcIi4uL2NvbW1vbi9taXNjL0xvZ2luVXRpbHMuanNcIilcblx0XHRcdFx0XHRzaG93R2lmdENhcmREaWFsb2cobG9jYXRpb24uaGFzaClcblx0XHRcdFx0XHRtLnJvdXRlLnNldChcIi9sb2dpblwiLCB7XG5cdFx0XHRcdFx0XHRub0F1dG9Mb2dpbjogdHJ1ZSxcblx0XHRcdFx0XHRcdGtlZXBTZXNzaW9uOiB0cnVlLFxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0cmV0dXJuIG51bGxcblx0XHRcdFx0fSxcblx0XHRcdH0sXG5cdFx0XHRyZWNvdmVyOiB7XG5cdFx0XHRcdGFzeW5jIG9ubWF0Y2goYXJnczogYW55KSB7XG5cdFx0XHRcdFx0Y29uc3QgeyBzaG93UmVjb3ZlckRpYWxvZyB9ID0gYXdhaXQgaW1wb3J0KFwiLi4vY29tbW9uL21pc2MvTG9naW5VdGlscy5qc1wiKVxuXHRcdFx0XHRcdGNvbnN0IHJlc2V0QWN0aW9uID0gYXJncy5yZXNldEFjdGlvbiA9PT0gXCJwYXNzd29yZFwiIHx8IGFyZ3MucmVzZXRBY3Rpb24gPT09IFwic2Vjb25kRmFjdG9yXCIgPyBhcmdzLnJlc2V0QWN0aW9uIDogXCJwYXNzd29yZFwiXG5cdFx0XHRcdFx0Y29uc3QgbWFpbEFkZHJlc3MgPSB0eXBlb2YgYXJncy5tYWlsQWRkcmVzcyA9PT0gXCJzdHJpbmdcIiA/IGFyZ3MubWFpbEFkZHJlc3MgOiBcIlwiXG5cdFx0XHRcdFx0c2hvd1JlY292ZXJEaWFsb2cobWFpbEFkZHJlc3MsIHJlc2V0QWN0aW9uKVxuXHRcdFx0XHRcdG0ucm91dGUuc2V0KFwiL2xvZ2luXCIsIHtcblx0XHRcdFx0XHRcdG5vQXV0b0xvZ2luOiB0cnVlLFxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0cmV0dXJuIG51bGxcblx0XHRcdFx0fSxcblx0XHRcdH0sXG5cdFx0XHR3ZWJhdXRobjogbWFrZU9sZFZpZXdSZXNvbHZlcihcblx0XHRcdFx0YXN5bmMgKCkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IHsgQnJvd3NlcldlYmF1dGhuIH0gPSBhd2FpdCBpbXBvcnQoXCIuLi9jb21tb24vbWlzYy8yZmEvd2ViYXV0aG4vQnJvd3NlcldlYmF1dGhuLmpzXCIpXG5cdFx0XHRcdFx0Y29uc3QgeyBOYXRpdmVXZWJhdXRoblZpZXcgfSA9IGF3YWl0IGltcG9ydChcIi4uL2NvbW1vbi9sb2dpbi9OYXRpdmVXZWJhdXRoblZpZXcuanNcIilcblx0XHRcdFx0XHRjb25zdCB7IFdlYmF1dGhuTmF0aXZlQnJpZGdlIH0gPSBhd2FpdCBpbXBvcnQoXCIuLi9jb21tb24vbmF0aXZlL21haW4vV2ViYXV0aG5OYXRpdmVCcmlkZ2UuanNcIilcblx0XHRcdFx0XHQvLyBnZXRDdXJyZW50RG9tYWluQ29uZmlnKCkgdGFrZXMgZW52LnN0YXRpY1VybCBpbnRvIGFjY291bnQgYnV0IHdlIGFjdHVhbGx5IGRvbid0IGNhcmUgYWJvdXQgaXQgaW4gdGhpcyBjYXNlLlxuXHRcdFx0XHRcdC8vIFNjZW5hcmlvIHdoZW4gaXQgY2FuIGRpZmZlcjogbG9jYWwgZGVza3RvcCBjbGllbnQgd2hpY2ggb3BlbnMgd2ViYXV0aG4gd2luZG93IGFuZCB0aGF0IHdpbmRvdyBpcyBhbHNvIGJ1aWx0IHdpdGggdGhlIHN0YXRpYyBVUkwgYmVjYXVzZVxuXHRcdFx0XHRcdC8vIGl0IGlzIHRoZSBzYW1lIGNsaWVudCBidWlsZC5cblx0XHRcdFx0XHRjb25zdCBkb21haW5Db25maWcgPSBtYWlsTG9jYXRvci5kb21haW5Db25maWdQcm92aWRlcigpLmdldERvbWFpbkNvbmZpZ0Zvckhvc3RuYW1lKGxvY2F0aW9uLmhvc3RuYW1lLCBsb2NhdGlvbi5wcm90b2NvbCwgbG9jYXRpb24ucG9ydClcblx0XHRcdFx0XHRjb25zdCBjcmVkcyA9IG5hdmlnYXRvci5jcmVkZW50aWFsc1xuXHRcdFx0XHRcdHJldHVybiBuZXcgTmF0aXZlV2ViYXV0aG5WaWV3KG5ldyBCcm93c2VyV2ViYXV0aG4oY3JlZHMsIGRvbWFpbkNvbmZpZyksIG5ldyBXZWJhdXRobk5hdGl2ZUJyaWRnZSgpKVxuXHRcdFx0XHR9LFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmVxdWlyZUxvZ2luOiBmYWxzZSxcblx0XHRcdFx0XHRjYWNoZVZpZXc6IGZhbHNlLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRtYWlsTG9jYXRvci5sb2dpbnMsXG5cdFx0XHQpLFxuXHRcdFx0d2ViYXV0aG5tb2JpbGU6IG1ha2VWaWV3UmVzb2x2ZXI8XG5cdFx0XHRcdE1vYmlsZVdlYmF1dGhuQXR0cnMsXG5cdFx0XHRcdE1vYmlsZVdlYmF1dGhuVmlldyxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGJyb3dzZXJXZWJhdXRobjogQnJvd3NlcldlYmF1dGhuXG5cdFx0XHRcdH1cblx0XHRcdD4oXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRwcmVwYXJlUm91dGU6IGFzeW5jICgpID0+IHtcblx0XHRcdFx0XHRcdGNvbnN0IHsgTW9iaWxlV2ViYXV0aG5WaWV3IH0gPSBhd2FpdCBpbXBvcnQoXCIuLi9jb21tb24vbG9naW4vTW9iaWxlV2ViYXV0aG5WaWV3LmpzXCIpXG5cdFx0XHRcdFx0XHRjb25zdCB7IEJyb3dzZXJXZWJhdXRobiB9ID0gYXdhaXQgaW1wb3J0KFwiLi4vY29tbW9uL21pc2MvMmZhL3dlYmF1dGhuL0Jyb3dzZXJXZWJhdXRobi5qc1wiKVxuXHRcdFx0XHRcdFx0Ly8gc2VlIC93ZWJhdXRobiB2aWV3IHJlc29sdmVyIGZvciB0aGUgZXhwbGFuYXRpb25cblx0XHRcdFx0XHRcdGNvbnN0IGRvbWFpbkNvbmZpZyA9IG1haWxMb2NhdG9yLmRvbWFpbkNvbmZpZ1Byb3ZpZGVyKCkuZ2V0RG9tYWluQ29uZmlnRm9ySG9zdG5hbWUobG9jYXRpb24uaG9zdG5hbWUsIGxvY2F0aW9uLnByb3RvY29sLCBsb2NhdGlvbi5wb3J0KVxuXHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0Y29tcG9uZW50OiBNb2JpbGVXZWJhdXRoblZpZXcsXG5cdFx0XHRcdFx0XHRcdGNhY2hlOiB7XG5cdFx0XHRcdFx0XHRcdFx0YnJvd3NlcldlYmF1dGhuOiBuZXcgQnJvd3NlcldlYmF1dGhuKG5hdmlnYXRvci5jcmVkZW50aWFscywgZG9tYWluQ29uZmlnKSxcblx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHByZXBhcmVBdHRyczogKGNhY2hlKSA9PiBjYWNoZSxcblx0XHRcdFx0XHRyZXF1aXJlTG9naW46IGZhbHNlLFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRtYWlsTG9jYXRvci5sb2dpbnMsXG5cdFx0XHQpLFxuXHRcdH0pXG5cblx0XHQvLyBJbiBzb21lIGNhc2VzIG91ciBwcmVmaXggY2FuIGhhdmUgbm9uLWFzY2lpIGNoYXJhY3RlcnMsIGRlcGVuZGluZyBvbiB0aGUgcGF0aCB0aGUgd2ViYXBwIGlzIHNlcnZlZCBmcm9tXG5cdFx0Ly8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9NaXRocmlsSlMvbWl0aHJpbC5qcy9pc3N1ZXMvMjY1OVxuXHRcdG0ucm91dGUucHJlZml4ID0gbmV2ZXJOdWxsKHVybFByZWZpeGVzLnByZWZpeCkucmVwbGFjZSgvKD86JVthLWY4OV1bYS1mMC05XSkrL2dpbSwgZGVjb2RlVVJJQ29tcG9uZW50KVxuXG5cdFx0Ly8ga2VlcCBpbiBzeW5jIHdpdGggUmV3cml0ZUFwcFJlc291cmNlVXJsSGFuZGxlci5qYXZhXG5cdFx0Y29uc3QgcmVzb2x2ZXJzOiBSb3V0ZURlZnMgPSB7XG5cdFx0XHRcIi9cIjoge1xuXHRcdFx0XHRvbm1hdGNoOiAoYXJncywgcmVxdWVzdGVkUGF0aCkgPT4gZm9yY2VMb2dpbihhcmdzLCByZXF1ZXN0ZWRQYXRoKSxcblx0XHRcdH0sXG5cdFx0fVxuXG5cdFx0Zm9yIChsZXQgcGF0aCBpbiBwYXRocykge1xuXHRcdFx0cmVzb2x2ZXJzW3BhdGhdID0gcGF0aHNbcGF0aF1cblx0XHR9XG5cblx0XHQvLyBhcHBlbmQgY2F0Y2ggYWxsIGF0IHRoZSBlbmQgYmVjYXVzZSBtaXRocmlsIHdpbGwgc3RvcCBhdCB0aGUgZmlyc3QgbWF0Y2hcblx0XHRyZXNvbHZlcnNbXCIvOnBhdGguLi5cIl0gPSB7XG5cdFx0XHRvbm1hdGNoOiBhc3luYyAoKSA9PiB7XG5cdFx0XHRcdGNvbnN0IHsgTm90Rm91bmRQYWdlIH0gPSBhd2FpdCBpbXBvcnQoXCIuLi9jb21tb24vZ3VpL2Jhc2UvTm90Rm91bmRQYWdlLmpzXCIpXG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0dmlldzogKCkgPT4gbShyb290LCBtKE5vdEZvdW5kUGFnZSkpLFxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdH1cblxuXHRcdC8vIGtlZXAgaW4gc3luYyB3aXRoIFJld3JpdGVBcHBSZXNvdXJjZVVybEhhbmRsZXIuamF2YVxuXHRcdG0ucm91dGUoZG9jdW1lbnQuYm9keSwgc3RhcnRSb3V0ZSwgcmVzb2x2ZXJzKVxuXG5cdFx0Ly8gV2UgbmVlZCB0byBpbml0aWFsaXplIG5hdGl2ZSBvbmNlIHdlIHN0YXJ0IHRoZSBtaXRocmlsIHJvdXRpbmcsIHNwZWNpZmljYWxseSBmb3IgdGhlIGNhc2Ugb2YgbWFpbHRvIGhhbmRsaW5nIGluIGFuZHJvaWRcblx0XHQvLyBJZiBuYXRpdmUgc3RhcnRzIHRlbGxpbmcgdGhlIHdlYiBzaWRlIHRvIG5hdmlnYXRlIHRvbyBlYXJseSwgbWl0aHJpbCB3b24ndCBiZSByZWFkeSBhbmQgdGhlIHJlcXVlc3RzIHdpbGwgYmUgbG9zdFxuXHRcdGlmIChpc0FwcCgpIHx8IGlzRGVza3RvcCgpKSB7XG5cdFx0XHRhd2FpdCBtYWlsTG9jYXRvci5uYXRpdmUuaW5pdCgpXG5cdFx0fVxuXHRcdGlmIChpc0Rlc2t0b3AoKSkge1xuXHRcdFx0Y29uc3QgeyBleHBvc2VOYXRpdmVJbnRlcmZhY2UgfSA9IGF3YWl0IGltcG9ydChcIi4uL2NvbW1vbi9hcGkvY29tbW9uL0V4cG9zZU5hdGl2ZUludGVyZmFjZS5qc1wiKVxuXHRcdFx0bWFpbExvY2F0b3IubG9naW5zLmFkZFBvc3RMb2dpbkFjdGlvbihhc3luYyAoKSA9PiBleHBvc2VOYXRpdmVJbnRlcmZhY2UobWFpbExvY2F0b3IubmF0aXZlKS5wb3N0TG9naW5BY3Rpb25zKVxuXHRcdH1cblx0XHQvLyBhZnRlciB3ZSBzZXQgdXAgcHJlZml4V2l0aG91dEZpbGVcblx0XHRjb25zdCBkb21haW5Db25maWcgPSBtYWlsTG9jYXRvci5kb21haW5Db25maWdQcm92aWRlcigpLmdldEN1cnJlbnREb21haW5Db25maWcoKVxuXHRcdGNvbnN0IHNlcnZpY2V3b3JrZXIgPSBhd2FpdCBpbXBvcnQoXCIuLi9jb21tb24vc2VydmljZXdvcmtlci9TZXJ2aWNlV29ya2VyQ2xpZW50LmpzXCIpXG5cdFx0c2VydmljZXdvcmtlci5pbml0KGRvbWFpbkNvbmZpZylcblxuXHRcdHByaW50Sm9ic01lc3NhZ2UoZG9tYWluQ29uZmlnKVxuXHR9KVxuXG5mdW5jdGlvbiBmb3JjZUxvZ2luKGFyZ3M6IFJlY29yZDxzdHJpbmcsIERpY3Q+LCByZXF1ZXN0ZWRQYXRoOiBzdHJpbmcpIHtcblx0aWYgKHJlcXVlc3RlZFBhdGguaW5kZXhPZihcIiNtYWlsXCIpICE9PSAtMSkge1xuXHRcdG0ucm91dGUuc2V0KGAvZXh0JHtsb2NhdGlvbi5oYXNofWApXG5cdH0gZWxzZSBpZiAocmVxdWVzdGVkUGF0aC5zdGFydHNXaXRoKFwiLyNcIikpIHtcblx0XHQvLyB3ZSBkbyBub3QgYWxsb3cgYW55IG90aGVyIGhhc2hlcyBleGNlcHQgXCIjbWFpbFwiLiB0aGlzIHByZXZlbnRzIGxvZ2luIGxvb3BzLlxuXHRcdG0ucm91dGUuc2V0KFwiL2xvZ2luXCIpXG5cdH0gZWxzZSB7XG5cdFx0bGV0IHBhdGhXaXRob3V0UGFyYW1ldGVyID0gcmVxdWVzdGVkUGF0aC5pbmRleE9mKFwiP1wiKSA+IDAgPyByZXF1ZXN0ZWRQYXRoLnN1YnN0cmluZygwLCByZXF1ZXN0ZWRQYXRoLmluZGV4T2YoXCI/XCIpKSA6IHJlcXVlc3RlZFBhdGhcblxuXHRcdGlmIChwYXRoV2l0aG91dFBhcmFtZXRlci50cmltKCkgPT09IFwiL1wiKSB7XG5cdFx0XHRsZXQgbmV3UXVlcnlTdHJpbmcgPSBtLmJ1aWxkUXVlcnlTdHJpbmcoYXJncylcblx0XHRcdG0ucm91dGUuc2V0KGAvbG9naW5gICsgKG5ld1F1ZXJ5U3RyaW5nLmxlbmd0aCA+IDAgPyBcIj9cIiArIG5ld1F1ZXJ5U3RyaW5nIDogXCJcIikpXG5cdFx0fSBlbHNlIHtcblx0XHRcdG0ucm91dGUuc2V0KGAvbG9naW4/cmVxdWVzdGVkUGF0aD0ke2VuY29kZVVSSUNvbXBvbmVudChyZXF1ZXN0ZWRQYXRoKX1gKVxuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBzZXR1cEV4Y2VwdGlvbkhhbmRsaW5nKCkge1xuXHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIGZ1bmN0aW9uIChldnQpIHtcblx0XHQvKipcblx0XHQgKiBldnQuZXJyb3IgaXMgbm90IGFsd2F5cyBzZXQsIGUuZy4gbm90IGZvciBcImNvbnRlbnQuanM6MTk2MyBVbmNhdWdodCBET01FeGNlcHRpb246IEZhaWxlZCB0byByZWFkXG5cdFx0ICogdGhlICdzZWxlY3Rpb25TdGFydCcgcHJvcGVydHkgZnJvbSAnSFRNTElucHV0RWxlbWVudCc6IFRoZSBpbnB1dCBlbGVtZW50J3MgdHlwZSAoJ2VtYWlsJylcblx0XHQgKiBkb2VzIG5vdCBzdXBwb3J0IHNlbGVjdGlvbi5cIlxuXHRcdCAqXG5cdFx0ICogY2hlY2tpbmcgZm9yIGRlZmF1bHRQcmV2ZW50ZWQgaXMgbmVjZXNzYXJ5IHRvIHByZXZlbnQgZGV2VG9vbHMgZXZhbCBlcnJvcnMgdG8gYmUgdGhyb3duIGluIGhlcmUgdW50aWxcblx0XHQgKiBodHRwczovL2Nocm9taXVtLXJldmlldy5nb29nbGVzb3VyY2UuY29tL2MvdjgvdjgvKy8zNjYwMjUzXG5cdFx0ICogaXMgaW4gdGhlIGNocm9taXVtIHZlcnNpb24gdXNlZCBieSBvdXIgZWxlY3Ryb24gY2xpZW50LlxuXHRcdCAqIHNlZSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy83MjM5NjUyNy9ldmFsZXJyb3ItcG9zc2libGUtc2lkZS1lZmZlY3QtaW4tZGVidWctZXZhbHVhdGUtaW4tZ29vZ2xlLWNocm9tZVxuXHRcdCAqICovXG5cdFx0aWYgKGV2dC5lcnJvciAmJiAhZXZ0LmRlZmF1bHRQcmV2ZW50ZWQpIHtcblx0XHRcdGhhbmRsZVVuY2F1Z2h0RXJyb3IoZXZ0LmVycm9yKVxuXHRcdFx0ZXZ0LnByZXZlbnREZWZhdWx0KClcblx0XHR9XG5cdH0pXG5cdC8vIEhhbmRsZSB1bmhhbmRsZWQgbmF0aXZlIEpTIFByb21pc2UgcmVqZWN0aW9uc1xuXHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInVuaGFuZGxlZHJlamVjdGlvblwiLCBmdW5jdGlvbiAoZXZ0KSB7XG5cdFx0aGFuZGxlVW5jYXVnaHRFcnJvcihldnQucmVhc29uKVxuXHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpXG5cdH0pXG59XG5cbi8qKlxuICogV3JhcCB0b3AtbGV2ZWwgY29tcG9uZW50IHdpdGggbmVjZXNzYXJ5IGxvZ2ljLlxuICogTm90ZTogSSBjYW4ndCBtYWtlIHR5cGUgaW5mZXJlbmNlIHdvcmsgd2l0aCBhdHRyaWJ1dGVzIGFuZCBjb21wb25lbnRzIGJlY2F1c2Ugb2YgaG93IGJyb2tlbiBtaXRocmlsIHR5cGVkZWZzIGFyZSBzbyB0aGV5IGFyZSBcIm5ldmVyXCIgYnkgZGVmYXVsdCBhbmQgeW91XG4gKiBoYXZlIHRvIHNwZWNpZnkgZ2VuZXJpYyB0eXBlcyBtYW51YWxseS5cbiAqIEB0ZW1wbGF0ZSBGdWxsQXR0cnMgdHlwZSBvZiB0aGUgYXR0cmlidXRlcyB0aGF0IHRoZSBjb21wb25lbnQgdGFrZXNcbiAqIEB0ZW1wbGF0ZSBDb21wb25lbnRUeXBlIHR5cGUgb2YgdGhlIGNvbXBvbmVudFxuICogQHRlbXBsYXRlIFJvdXRlQ2FjaGUgaW5mbyB0aGF0IGlzIHByZXBhcmVkIGFzeW5jIG9uIHJvdXRlIGNoYW5nZSBhbmQgY2FuIGJlIHVzZWQgbGF0ZXIgdG8gY3JlYXRlIGF0dHJpYnV0ZXMgb24gZXZlcnkgcmVuZGVyLiBJcyBhbHNvIHBlcnNpc3RlZCBiZXR3ZWVuXG4gKiB0aGUgcm91dGUgY2hhbmdlcy5cbiAqIEBwYXJhbSBwYXJhbVxuICogQHBhcmFtIHBhcmFtLnByZXBhcmVSb3V0ZSBjYWxsZWQgb25jZSBwZXIgcm91dGUgY2hhbmdlLiBVc2UgaXQgZm9yIGV2ZXJ5dGhpbmcgYXN5bmMgdGhhdCBzaG91bGQgaGFwcGVuIGJlZm9yZSB0aGUgcm91dGUgY2hhbmdlLiBUaGUgcmVzdWx0IGlzIHByZXNlcnZlZCBmb3JcbiAqIGFzIGxvbmcgYXMgUm91dGVSZXNvbHZlciBsaXZlcyBpZiB5b3UgbmVlZCB0byBwZXJzaXN0IHRoaW5ncyBiZXR3ZWVuIHJvdXRlcy4gSXQgcmVjZWl2ZXMgdGhlIHJvdXRlIGNhY2hlIGZyb20gdGhlIHByZXZpb3VzIGNhbGwgaWYgdGhlcmUgd2FzIG9uZS5cbiAqIEBwYXJhbSBwYXJhbS5wcmVwYXJlQXR0cnMgY2FsbGVkIG9uY2UgcGVyIHJlZHJhdy4gVGhlIHJlc3VsdCBvZiBpdCB3aWxsIGJlIGFkZGVkIHRvIFRvcExldmVsQXR0cnMgdG8gbWFrZSBmdWxsIGF0dHJpYnV0ZXMuXG4gKiBAcGFyYW0gcGFyYW0ucmVxdWlyZUxvZ2luIGVuZm9yY2UgbG9naW4gcG9saWN5IHRvIGVpdGhlciByZWRpcmVjdCB0byB0aGUgbG9naW4gcGFnZSBvciByZWxvYWRcbiAqIEBwYXJhbSBsb2dpbnMgbG9naW5jb250cm9sbGVyIHRvIGFzayBhYm91dCBsb2dpbiBzdGF0ZVxuICovXG5mdW5jdGlvbiBtYWtlVmlld1Jlc29sdmVyPEZ1bGxBdHRycyBleHRlbmRzIFRvcExldmVsQXR0cnMgPSBuZXZlciwgQ29tcG9uZW50VHlwZSBleHRlbmRzIFRvcExldmVsVmlldzxGdWxsQXR0cnM+ID0gbmV2ZXIsIFJvdXRlQ2FjaGUgPSB1bmRlZmluZWQ+KFxuXHR7XG5cdFx0cHJlcGFyZVJvdXRlLFxuXHRcdHByZXBhcmVBdHRycyxcblx0XHRyZXF1aXJlTG9naW4sXG5cdH06IHtcblx0XHRwcmVwYXJlUm91dGU6IChjYWNoZTogUm91dGVDYWNoZSB8IG51bGwpID0+IFByb21pc2U8eyBjb21wb25lbnQ6IENsYXNzPENvbXBvbmVudFR5cGU+OyBjYWNoZTogUm91dGVDYWNoZSB9PlxuXHRcdHByZXBhcmVBdHRyczogKGNhY2hlOiBSb3V0ZUNhY2hlKSA9PiBPbWl0PEZ1bGxBdHRycywga2V5b2YgVG9wTGV2ZWxBdHRycz5cblx0XHRyZXF1aXJlTG9naW4/OiBib29sZWFuXG5cdH0sXG5cdGxvZ2luczogTG9naW5Db250cm9sbGVyLFxuKTogUm91dGVSZXNvbHZlciB7XG5cdHJlcXVpcmVMb2dpbiA9IHJlcXVpcmVMb2dpbiA/PyB0cnVlXG5cdGxldCBjYWNoZTogUm91dGVDYWNoZSB8IG51bGxcblxuXHQvLyBhIGJpdCBvZiBjb250ZXh0IGZvciB3aHkgd2UgZG8gdGhpbmdzIHRoZSB3YXkgd2UgZG8uIENvbnN0cmFpbnRzOlxuXHQvLyAgLSB2aWV3IG11c3QgYmUgaW1wb3J0ZWQgYXN5bmMgaW4gb25tYXRjaFxuXHQvLyAgLSB2aWV3IHNoYWxsIG5vdCBiZSBjcmVhdGVkIG1hbnVhbGx5LCB3ZSBkbyBub3Qgd2FudCB0byBob2xkIG9uIHRvIHRoZSBpbnN0YW5jZVxuXHQvLyAgLSB3ZSB3YW50IHRvIHBhc3MgYWRkaXRpb25hbCBwYXJhbWV0ZXJzIHRvIHRoZSB2aWV3XG5cdC8vICAtIHZpZXcgc2hvdWxkIG5vdCBiZSBjcmVhdGVkIHR3aWNlIGFuZCBuZWl0aGVyIGl0cyBkZXBlbmRlbmNpZXNcblx0Ly8gIC0gd2UgZWl0aGVyIG5lZWQgdG8gY2FsbCB1cGRhdGVVcmwgb3IgcGFzcyByZXF1ZXN0ZWRQYXRoIGFuZCBhcmdzIGFzIGF0dHJpYnV0ZXNcblx0cmV0dXJuIHtcblx0XHQvLyBvbm1hdGNoKCkgaXMgY2FsbGVkIGZvciBldmVyeSBVUkwgY2hhbmdlXG5cdFx0YXN5bmMgb25tYXRjaChhcmdzOiBSZWNvcmQ8c3RyaW5nLCBEaWN0PiwgcmVxdWVzdGVkUGF0aDogc3RyaW5nKTogUHJvbWlzZTxDbGFzczxDb21wb25lbnRUeXBlPiB8IG51bGw+IHtcblx0XHRcdC8vIGVuZm9yY2UgdmFsaWQgbG9naW4gc3RhdGUgZmlyc3QuXG5cdFx0XHQvLyB3ZSBoYXZlIHZpZXdzIHdpdGggcmVxdWlyZUxvZ2luOiB0cnVlIGFuZCB2aWV3cyB3aXRoIHJlcXVpcmVMb2dpbjogZmFsc2UsIGVhY2ggb2Ygd2hpY2ggZW5mb3JjZSBiZWluZyBsb2dnZWQgaW4gb3IgYmVpbmcgbG9nZ2VkIG91dCByZXNwZWN0aXZlbHkuXG5cdFx0XHQvLyBpbiB0aGUgbG9nb3V0IGNhc2UgKHdoZXJlIHJlcXVpcmVMb2dpbjogZmFsc2UpIHRoaXMgd2lsbCBmb3JjZSBhIHJlbG9hZC5cblx0XHRcdC8vIHRoZSBsb2dpbiB2aWV3IGlzIHNwZWNpYWwgaW4gdGhhdCBpdCBoYXMgcmVxdWlyZWxvZ2luOiBmYWxzZSwgYnV0IGNhbiBiZSBsb2dnZWQgaW4gYWZ0ZXIgYWNjb3VudCBjcmVhdGlvbiBkdXJpbmcgc2lnbnVwLlxuXHRcdFx0Ly8gdG8gaGFuZGxlIGJhY2sgYnV0dG9uIHByZXNzZXMgd2hlcmUgdGhlIHVzZXIgZGVjaWRlcyB0byBzdGF5IG9uIHRoZSBwYWdlIGFmdGVyIGFsbCAod2Ugc2hvdyBhIGNvbmZpcm1hdGlvbilcblx0XHRcdC8vIHdlIG5lZWQgdG8gcHJldmVudCB0aGUgbG9nb3V0L3JlbG9hZC4gdGhpcyBpcyB0aGUgcHVycG9zZSBvZiB0aGUga2VlcFNlc3Npb24gYXJndW1lbnQuXG5cdFx0XHQvLyB0aGUgc2lnbnVwIHdpemFyZCB0aGF0IHNldHMgaXQgaGFuZGxlcyB0aGUgc2Vzc2lvbiBpdHNlbGYuXG5cdFx0XHRpZiAocmVxdWlyZUxvZ2luICYmICFsb2dpbnMuaXNVc2VyTG9nZ2VkSW4oKSkge1xuXHRcdFx0XHRmb3JjZUxvZ2luKGFyZ3MsIHJlcXVlc3RlZFBhdGgpXG5cdFx0XHRcdHJldHVybiBudWxsXG5cdFx0XHR9IGVsc2UgaWYgKCFyZXF1aXJlTG9naW4gJiYgbG9naW5zLmlzVXNlckxvZ2dlZEluKCkgJiYgIWFyZ3Mua2VlcFNlc3Npb24pIHtcblx0XHRcdFx0YXdhaXQgZGlzYWJsZUVycm9ySGFuZGxpbmdEdXJpbmdMb2dvdXQoKVxuXHRcdFx0XHRhd2FpdCBsb2dpbnMubG9nb3V0KGZhbHNlKVxuXHRcdFx0XHR3aW5kb3dGYWNhZGUucmVsb2FkKGFyZ3MpXG5cdFx0XHRcdHJldHVybiBudWxsXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBwcmVwYXJlZCA9IGF3YWl0IHByZXBhcmVSb3V0ZShjYWNoZSlcblx0XHRcdFx0Y2FjaGUgPSBwcmVwYXJlZC5jYWNoZVxuXHRcdFx0XHRyZXR1cm4gcHJlcGFyZWQuY29tcG9uZW50XG5cdFx0XHR9XG5cdFx0fSxcblx0XHQvLyByZW5kZXIoKSBpcyBjYWxsZWQgb24gZXZlcnkgcmVuZGVyXG5cdFx0cmVuZGVyKHZub2RlOiBWbm9kZTxDb21wb25lbnRUeXBlPik6IENoaWxkcmVuIHtcblx0XHRcdGNvbnN0IGFyZ3MgPSBtLnJvdXRlLnBhcmFtKClcblx0XHRcdGNvbnN0IHJlcXVlc3RlZFBhdGggPSBtLnJvdXRlLmdldCgpXG5cdFx0XHQvLyByZXN1bHQgb2Ygb25tYXRjaCgpIGlzIHBhc3NlZCBpbnRvIG0oKSBieSBtdGhyaWwgYW5kIHRoZW4gZ2l2ZW4gdG8gdXMgaGVyZVxuXHRcdFx0Ly8gSXQgaXMgbm90IHdoYXQgd2Ugd2FudCBhcyB3ZSB3YW50IHRvIHBhc3MgZmV3IHRoaW5ncyB0byBpdCBidXQgaXQncyBoYXJtbGVzcyBiZWNhdXNlXG5cdFx0XHQvLyBpdCBqdXN0IGNyZWF0ZXMgYSB2bm9kZSBidXQgZG9lc24ndCByZW5kZXIgaXQuXG5cdFx0XHQvLyBXaGF0IHdlIGRvIGlzIGdyYWIgdGhlIGNsYXNzIGZyb20gdGhhdCB2bm9kZS4gV2UgY291bGQgaGF2ZSBkb25lIGl0IGRpZmZlcmVudGx5IGJ1dCB0aGlzXG5cdFx0XHQvLyB3YXkgd2UgZG9uJ3QgZG8gYW55IG1vcmUgY2FjaGluZyB0aGFuIE1pdGhyaWwgd291bGQgZG8gYW55d2F5LlxuXG5cdFx0XHQvLyBUUyBjYW4ndCBwcm92ZSB0aGF0IGl0J3MgdGhlIHJpZ2h0IGNvbXBvbmVudCBhbmQgdGhlIG1pdGhyaWwgdHlwaW5ncyBhcmUgZ2VuZXJhbGx5IHNsaWdodGx5IGJyb2tlblxuXHRcdFx0Y29uc3QgYyA9IHZub2RlLnRhZyBhcyB1bmtub3duIGFzIENsYXNzPENsYXNzQ29tcG9uZW50PEZ1bGxBdHRycz4+XG5cblx0XHRcdC8vIGRvd25jYXN0IGJlY2F1c2Ugd2UgdHMgY2FuJ3QgcmVhbGx5IHByb3ZlIG9yIGVuZm9yY2UgdGhhdCBhZGRpdGlvbmFsIGF0dHJzIGhhdmUgY29tcGF0aWJsZSByZXF1ZXN0ZWRQYXRoIGFuZCBhcmdzXG5cdFx0XHRjb25zdCBhdHRycyA9IHsgcmVxdWVzdGVkUGF0aCwgYXJncywgLi4ucHJlcGFyZUF0dHJzKGFzc2VydE5vdE51bGwoY2FjaGUpKSB9IGFzIEZ1bGxBdHRyc1xuXHRcdFx0cmV0dXJuIG0oXG5cdFx0XHRcdHJvb3QsXG5cdFx0XHRcdG0oYywge1xuXHRcdFx0XHRcdC4uLmF0dHJzLFxuXHRcdFx0XHRcdG9uY3JlYXRlKHsgc3RhdGUgfTogVm5vZGVET008RnVsbEF0dHJzLCBDb21wb25lbnRUeXBlPikge1xuXHRcdFx0XHRcdFx0d2luZG93LnR1dGFvLmN1cnJlbnRWaWV3ID0gc3RhdGVcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHR9KSxcblx0XHRcdClcblx0XHR9LFxuXHR9XG59XG5cbmZ1bmN0aW9uIG1ha2VPbGRWaWV3UmVzb2x2ZXIoXG5cdG1ha2VWaWV3OiAoYXJnczogb2JqZWN0LCByZXF1ZXN0ZWRQYXRoOiBzdHJpbmcpID0+IFByb21pc2U8VG9wTGV2ZWxWaWV3Pixcblx0eyByZXF1aXJlTG9naW4sIGNhY2hlVmlldyB9OiB7IHJlcXVpcmVMb2dpbj86IGJvb2xlYW47IGNhY2hlVmlldz86IGJvb2xlYW4gfSA9IHt9LFxuXHRsb2dpbnM6IExvZ2luQ29udHJvbGxlcixcbik6IFJvdXRlUmVzb2x2ZXIge1xuXHRyZXF1aXJlTG9naW4gPSByZXF1aXJlTG9naW4gPz8gdHJ1ZVxuXHRjYWNoZVZpZXcgPSBjYWNoZVZpZXcgPz8gdHJ1ZVxuXG5cdGNvbnN0IHZpZXdDYWNoZTogeyB2aWV3OiBUb3BMZXZlbFZpZXcgfCBudWxsIH0gPSB7IHZpZXc6IG51bGwgfVxuXHRyZXR1cm4ge1xuXHRcdG9ubWF0Y2g6IGFzeW5jIChhcmdzLCByZXF1ZXN0ZWRQYXRoKSA9PiB7XG5cdFx0XHRpZiAocmVxdWlyZUxvZ2luICYmICFsb2dpbnMuaXNVc2VyTG9nZ2VkSW4oKSkge1xuXHRcdFx0XHRmb3JjZUxvZ2luKGFyZ3MsIHJlcXVlc3RlZFBhdGgpXG5cdFx0XHR9IGVsc2UgaWYgKCFyZXF1aXJlTG9naW4gJiYgbG9naW5zLmlzVXNlckxvZ2dlZEluKCkpIHtcblx0XHRcdFx0YXdhaXQgZGlzYWJsZUVycm9ySGFuZGxpbmdEdXJpbmdMb2dvdXQoKVxuXHRcdFx0XHRhd2FpdCBsb2dpbnMubG9nb3V0KGZhbHNlKVxuXHRcdFx0XHR3aW5kb3dGYWNhZGUucmVsb2FkKGFyZ3MpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRsZXQgcHJvbWlzZTogUHJvbWlzZTxUb3BMZXZlbFZpZXc+XG5cblx0XHRcdFx0aWYgKHZpZXdDYWNoZS52aWV3ID09IG51bGwpIHtcblx0XHRcdFx0XHRwcm9taXNlID0gbWFrZVZpZXcoYXJncywgcmVxdWVzdGVkUGF0aCkudGhlbigodmlldykgPT4ge1xuXHRcdFx0XHRcdFx0aWYgKGNhY2hlVmlldykge1xuXHRcdFx0XHRcdFx0XHR2aWV3Q2FjaGUudmlldyA9IHZpZXdcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0cmV0dXJuIHZpZXdcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUodmlld0NhY2hlLnZpZXcpXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRQcm9taXNlLmFsbChbcHJvbWlzZV0pLnRoZW4oKFt2aWV3XSkgPT4ge1xuXHRcdFx0XHRcdHZpZXcudXBkYXRlVXJsPy4oYXJncywgcmVxdWVzdGVkUGF0aClcblx0XHRcdFx0XHR3aW5kb3cudHV0YW8uY3VycmVudFZpZXcgPSB2aWV3XG5cdFx0XHRcdH0pXG5cdFx0XHRcdHJldHVybiBwcm9taXNlXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRyZW5kZXI6ICh2bm9kZSkgPT4ge1xuXHRcdFx0cmV0dXJuIG0ocm9vdCwgdm5vZGUpXG5cdFx0fSxcblx0fVxufVxuXG4vLyBQbGF0Zm9ybUlkIGlzIHBhc3NlZCBieSB0aGUgbmF0aXZlIHBhcnQgaW4gdGhlIFVSTFxuZnVuY3Rpb24gYXNzaWduRW52UGxhdGZvcm1JZCh1cmxRdWVyeVBhcmFtczogTWl0aHJpbC5QYXJhbXMpIHtcblx0Y29uc3QgcGxhdGZvcm1JZCA9IHVybFF1ZXJ5UGFyYW1zW1wicGxhdGZvcm1JZFwiXVxuXG5cdGlmIChpc0FwcCgpIHx8IGlzRGVza3RvcCgpKSB7XG5cdFx0aWYgKFxuXHRcdFx0KGlzQXBwKCkgJiYgKHBsYXRmb3JtSWQgPT09IFwiYW5kcm9pZFwiIHx8IHBsYXRmb3JtSWQgPT09IFwiaW9zXCIpKSB8fFxuXHRcdFx0KGlzRGVza3RvcCgpICYmIChwbGF0Zm9ybUlkID09PSBcImxpbnV4XCIgfHwgcGxhdGZvcm1JZCA9PT0gXCJ3aW4zMlwiIHx8IHBsYXRmb3JtSWQgPT09IFwiZGFyd2luXCIpKVxuXHRcdCkge1xuXHRcdFx0ZW52LnBsYXRmb3JtSWQgPSBwbGF0Zm9ybUlkXG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBQcm9ncmFtbWluZ0Vycm9yKGBJbnZhbGlkIHBsYXRmb3JtIGlkOiAke1N0cmluZyhwbGF0Zm9ybUlkKX1gKVxuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBleHRyYWN0UGF0aFByZWZpeGVzKCk6IFJlYWRvbmx5PHsgcHJlZml4OiBzdHJpbmc7IHByZWZpeFdpdGhvdXRGaWxlOiBzdHJpbmcgfT4ge1xuXHRjb25zdCBwcmVmaXggPSBsb2NhdGlvbi5wYXRobmFtZS5lbmRzV2l0aChcIi9cIikgPyBsb2NhdGlvbi5wYXRobmFtZS5zdWJzdHJpbmcoMCwgbG9jYXRpb24ucGF0aG5hbWUubGVuZ3RoIC0gMSkgOiBsb2NhdGlvbi5wYXRobmFtZVxuXHRjb25zdCBwcmVmaXhXaXRob3V0RmlsZSA9IHByZWZpeC5pbmNsdWRlcyhcIi5cIikgPyBwcmVmaXguc3Vic3RyaW5nKDAsIHByZWZpeC5sYXN0SW5kZXhPZihcIi9cIikpIDogcHJlZml4XG5cdHJldHVybiBPYmplY3QuZnJlZXplKHsgcHJlZml4LCBwcmVmaXhXaXRob3V0RmlsZSB9KVxufVxuXG5mdW5jdGlvbiBnZXRTdGFydFVybCh1cmxRdWVyeVBhcmFtczogTWl0aHJpbC5QYXJhbXMpOiBzdHJpbmcge1xuXHQvLyBSZWRpcmVjdGlvbiB0cmlnZ2VyZWQgYnkgdGhlIHNlcnZlciBvciBzZXJ2aWNlIHdvcmtlciAoZS5nLiB0aGUgdXNlciByZWxvYWRzIC9tYWlsL2lkIGJ5IHByZXNzaW5nXG5cdC8vIEY1IGFuZCB3ZSB3YW50IHRvIG9wZW4gL2xvZ2luP3I9bWFpbC9pZCkuXG5cblx0Ly8gV2Ugd2FudCB0byBidWlsZCBhIG5ldyBVUkwgYmFzZWQgb24gdGhlIHJlZGlyZWN0IHBhcmFtZXRlciBhbmQgb3VyIGN1cnJlbnQgcGF0aCBhbmQgaGFzaC5cblxuXHQvLyB0YWtlIHJlZGlyZWN0IHBhcmFtZXRlciBmcm9tIHRoZSBxdWVyeSBwYXJhbXNcblx0Ly8gcmVtb3ZlIGl0IGZyb20gdGhlIHF1ZXJ5IHBhcmFtcyAoc28gdGhhdCB3ZSBkb24ndCBsb29wKVxuXHRsZXQgcmVkaXJlY3RUbyA9IHVybFF1ZXJ5UGFyYW1zW1wiclwiXVxuXHRpZiAocmVkaXJlY3RUbykge1xuXHRcdGRlbGV0ZSB1cmxRdWVyeVBhcmFtc1tcInJcIl1cblxuXHRcdGlmICh0eXBlb2YgcmVkaXJlY3RUbyAhPT0gXCJzdHJpbmdcIikge1xuXHRcdFx0cmVkaXJlY3RUbyA9IFwiXCJcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0cmVkaXJlY3RUbyA9IFwiXCJcblx0fVxuXG5cdC8vIGJ1aWxkIG5ldyBxdWVyeSwgdGhpcyB0aW1lIHdpdGhvdXQgcmVkaXJlY3Rcblx0bGV0IG5ld1F1ZXJ5U3RyaW5nID0gbS5idWlsZFF1ZXJ5U3RyaW5nKHVybFF1ZXJ5UGFyYW1zKVxuXG5cdGlmIChuZXdRdWVyeVN0cmluZy5sZW5ndGggPiAwKSB7XG5cdFx0bmV3UXVlcnlTdHJpbmcgPSBcIj9cIiArIG5ld1F1ZXJ5U3RyaW5nXG5cdH1cblxuXHRsZXQgdGFyZ2V0ID0gcmVkaXJlY3RUbyArIG5ld1F1ZXJ5U3RyaW5nXG5cblx0aWYgKHRhcmdldCA9PT0gXCJcIiB8fCB0YXJnZXRbMF0gIT09IFwiL1wiKSB0YXJnZXQgPSBcIi9cIiArIHRhcmdldFxuXG5cdC8vIE9ubHkgYXBwZW5kIGN1cnJlbnQgaGFzaCBpZiB0aGVyZSdzIG5vIGhhc2ggaW4gdGhlIHJlZGlyZWN0IGFscmVhZHkuXG5cdC8vIE1vc3QgYnJvd3NlcnMgd2lsbCBrZWVwIHRoZSBoYXNoIGFyb3VuZCBldmVuIGFmdGVyIHRoZSByZWRpcmVjdCB1bmxlc3MgdGhlcmUncyBhbm90aGVyIG9uZSBwcm92aWRlZC5cblx0Ly8gSW4gb3VyIGNhc2UgdGhlIGhhc2ggaXMgZW5jb2RlZCBhcyBwYXJ0IG9mIHRoZSBxdWVyeSBhbmQgaXMgbm90IGRlZHVwbGljYXRlZCBsaWtlIGRlc2NyaWJlZCBhYm92ZSBzbyB3ZSBoYXZlIHRvIG1hbnVhbGx5IGRvIGl0LCBvdGhlcndpc2Ugd2UgZW5kXG5cdC8vIHVwIHdpdGggZG91YmxlIGhhc2hlcy5cblx0aWYgKCFuZXcgVVJMKHVybFByZWZpeGVzLnByZWZpeCArIHRhcmdldCwgd2luZG93LmxvY2F0aW9uLmhyZWYpLmhhc2gpIHtcblx0XHR0YXJnZXQgKz0gbG9jYXRpb24uaGFzaFxuXHR9XG5cdHJldHVybiB0YXJnZXRcbn1cblxuZnVuY3Rpb24gcmVnaXN0ZXJGb3JNYWlsdG8oKSB7XG5cdC8vIGRvbid0IGRvIHRoaXMgaWYgd2UncmUgaW4gYW4gaWZyYW1lLCBpbiBhbiBhcHAgb3IgdGhlIG5hdmlnYXRvciBkb2Vzbid0IGFsbG93IHVzIHRvIGRvIHRoaXMuXG5cdGlmICh3aW5kb3cucGFyZW50ID09PSB3aW5kb3cgJiYgIWlzRGVza3RvcCgpICYmIHR5cGVvZiBuYXZpZ2F0b3IucmVnaXN0ZXJQcm90b2NvbEhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdGxldCBvcmlnaW4gPSBsb2NhdGlvbi5vcmlnaW5cblx0XHR0cnkge1xuXHRcdFx0Ly8gQHRzLWlnbm9yZSB0aGlyZCBhcmd1bWVudCByZW1vdmVkIGZyb20gc3BlYywgYnV0IHVzZSBpcyBzdGlsbCByZWNvbW1lbmRlZFxuXHRcdFx0bmF2aWdhdG9yLnJlZ2lzdGVyUHJvdG9jb2xIYW5kbGVyKFwibWFpbHRvXCIsIG9yaWdpbiArIFwiL21haWx0byN1cmw9JXNcIiwgXCJUdXRhIE1haWxcIilcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHQvLyBDYXRjaCBTZWN1cml0eUVycm9yJ3MgYW5kIHNvbWUgb3RoZXIgY2FzZXMgd2hlbiB3ZSBhcmUgbm90IGFsbG93ZWQgdG8gcmVnaXN0ZXIgYSBoYW5kbGVyXG5cdFx0XHRjb25zb2xlLmxvZyhcIkZhaWxlZCB0byByZWdpc3RlciBhIG1haWx0bzogcHJvdG9jb2wgaGFuZGxlciBcIiwgZSlcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gcHJpbnRKb2JzTWVzc2FnZShkb21haW5Db25maWc6IERvbWFpbkNvbmZpZykge1xuXHRpZiAoZW52LmRpc3QgJiYgZG9tYWluQ29uZmlnLmZpcnN0UGFydHlEb21haW4pIHtcblx0XHRjb25zb2xlLmxvZyhgXG5cbi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbi4uLi4uLi4uQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAuLi4uLi4uLi5cbi4uLi4uQC4uLi5AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQC4uLi4uLi5cbi4uLi4uQEBALi4uLkBAQEBAQEBAQEBAQEBAQEBAQEBAQEBALi4uLi5cbi4uLi4uQEBAQEAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4gICAgRG8geW91IGNhcmUgYWJvdXQgcHJpdmFjeT9cbi4uLi4uQEBAQEAuLi5AQEBAQEBAQEBAQEBAQEBAQEBAQEBALi4uLi5cbi4uLi4uQEBAQC4uLkBAQEBAQEBAQEBAQEBAQEBAQEBAQEBALi4uLi4gICAgV29yayBhdCBUdXRhISBGaWdodCBmb3Igb3VyIHJpZ2h0cyFcbi4uLi4uQEBAQC4uLkBAQEBAQEBAQEBAQEBAQEBAQEBAQEAuLi4uLi5cbi4uLi4uQEBALi4uQEBAQEBAQEBAQEBAQEBAQEBAQEBAQC4uLi4uLi4gICAgaHR0cHM6Ly90dXRhLmNvbS9qb2JzXG4uLi4uLkBAQC4uLkBAQEBAQEBAQEBAQEBAQEBAQEBAQEAuLi4uLi4uXG4uLi4uLkBALi4uQEBAQEBAQEBAQEBAQEBAQEBAQEBAQC4uLi4uLi4uXG4uLi4uLkBALi4uQEBAQEBAQEBAQEBAQEBAQEBAQEBAQC4uLi4uLi4uXG4uLi4uLkAuLi5AQEBAQEBAQEBAQEBAQEBAQEBAQEBALi4uLi4uLi4uXG4uLi4uLkAuLi5AQEBAQEBAQEBAQEBAQEBAQEBAQEBALi4uLi4uLi4uXG4uLi4uLi4uLkBAQEBAQEBAQEBAQEBAQEBAQEBAQEAuLi4uLi4uLi4uXG4uLi4uLi4uQEBAQEBAQEBAQEBAQEBAQEBAQEBAQC4uLi4uLi4uLi4uXG4uLi4uLi4uQEBAQEBAQEBAQEBAQEBAQEBAQEBAQC4uLi4uLi4uLi4uXG4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5cbmApXG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXNCTyxTQUFTLGlCQUFpQixFQUNoQyxPQUNBLGFBQ0EsTUFDQSxlQUNBLFNBQ0EsYUFDQSxRQUNBLFVBQ0EsVUFDQSxRQUNBLFVBQ0EsU0FDQSxVQUNBLGdCQUNlLEVBQW9CO0FBQ25DLFFBQU87RUFDTixVQUFVO0VBQ1YsZ0JBQWdCO0VBQ2hCLFdBQVc7RUFDWCxZQUFZO0VBQ1osV0FBVztFQUNYLFNBQVM7RUFDVCxtQkFBbUI7RUFDbkIsMkJBQTJCO0VBQzNCLFFBQVE7RUFDUixZQUFZO0VBQ1osb0JBQW9CO0VBQ3BCLCtCQUErQjtFQUMvQixnQkFBZ0I7RUFDaEIsd0JBQXdCO0VBQ3hCLDRCQUE0QjtFQUM1QixxQkFBcUI7RUFDckIseUJBQXlCO0VBQ3pCLGFBQWE7RUFDYixxQkFBcUI7RUFDckIseUJBQXlCO0VBQ3pCLGFBQWE7RUFDYixtQkFBbUI7RUFDbkIseUJBQXlCO0VBQ3pCLGNBQWM7RUFDZCxhQUFhO0VBQ2IsbUJBQW1CO0NBQ25CO0FBQ0Q7Ozs7QUN6QkQsc0JBQXNCO0FBQ3RCLGNBQWM7QUFFZCxNQUFNLGlCQUFpQixnQkFBRSxpQkFBaUIsU0FBUyxPQUFPO0FBRTFELG9CQUFvQixlQUFlO0FBQ25DLG9CQUFvQixR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