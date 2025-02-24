//@bundleInto:common-min
import { ProgrammingError } from "./error/ProgrammingError.js";
// keep in sync with LaunchHtml.js meta tag title
export const LOGIN_TITLE = "Mail. Done. Right. Tuta Mail Login & Sign up for an Ad-free Mailbox";
export const Mode = Object.freeze({
    Browser: "Browser",
    App: "App",
    Test: "Test",
    Playground: "Playground",
    Desktop: "Desktop",
    Admin: "Admin",
});
export function getWebsocketBaseUrl(domainConfig) {
    return (domainConfig.apiUrl
        // replaces http: with ws: and https: with wss:
        .replace(/^http/, "ws"));
}
/** Returns the origin which should be used for API requests. */
export function getApiBaseUrl(domainConfig) {
    if (isIOSApp()) {
        // http:// -> api:// and https:// -> apis://
        return domainConfig.apiUrl.replace(/^http/, "api");
    }
    else {
        return domainConfig.apiUrl;
    }
}
export function isIOSApp() {
    if (isApp() && env.platformId == null) {
        throw new ProgrammingError("PlatformId is not set!");
    }
    return env.mode === Mode.App && env.platformId === "ios";
}
/**
 * Return true if an Apple device; used for checking if CTRL or CMD/Meta should be used as the primary modifier
 */
export function isAppleDevice() {
    return env.platformId === "darwin" || isIOSApp();
}
export function isAndroidApp() {
    if (isApp() && env.platformId == null) {
        throw new ProgrammingError("PlatformId is not set!");
    }
    return env.mode === Mode.App && env.platformId === "android";
}
export function isApp() {
    return env.mode === Mode.App;
}
export function isDesktop() {
    return env.mode === Mode.Desktop;
}
export function isBrowser() {
    return env.mode === Mode.Browser;
}
export function ifDesktop(obj) {
    return isDesktop() ? obj : null;
}
let worker = typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
let node = typeof process === "object" && typeof process.versions === "object" && typeof process.versions.node !== "undefined";
export function isMain() {
    return !worker && !node;
}
export function isWebClient() {
    return env.mode === Mode.Browser;
}
export function isAdminClient() {
    return env.mode === Mode.Admin;
}
export function isElectronClient() {
    return isDesktop() || isAdminClient();
}
export function isMainOrNode() {
    return !worker || node || env.mode === Mode.Test;
}
export function isWorkerOrNode() {
    return worker || node || env.mode === Mode.Test;
}
export function isWorker() {
    return worker;
}
export function isTest() {
    return env.mode === Mode.Test;
}
export function isDesktopMainThread() {
    return node && typeof env !== "undefined" && (env.mode === Mode.Desktop || env.mode === Mode.Admin);
}
let boot = !isDesktopMainThread() && !isWorker();
/**
 * A hackaround. Set by bundler.
 * Rolldown doesn't inline const enums at the moment, so we can't assert the loading order.
 * If not set defaults to true
 */
const assertionsEnabled = typeof LOAD_ASSERTIONS === "undefined" || LOAD_ASSERTIONS;
export function assertMainOrNode() {
    if (!assertionsEnabled)
        return;
    if (!isMainOrNode()) {
        throw new Error("this code must not run in the worker thread");
    }
    if (boot) {
        throw new Error("this main code must not be loaded at boot time");
    }
}
export function assertMainOrNodeBoot() {
    if (!assertionsEnabled)
        return;
    if (!isMainOrNode()) {
        throw new Error("this code must not run in the worker thread");
    }
}
export function assertWorkerOrNode() {
    if (!assertionsEnabled)
        return;
    if (!isWorkerOrNode()) {
        throw new Error("this code must not run in the gui thread");
    }
}
export function bootFinished() {
    boot = false;
}
/**
 * Whether or not we will be using an offline cache (doesn't take into account if credentials are stored)
 */
export function isOfflineStorageAvailable() {
    return !isBrowser();
}
//# sourceMappingURL=Env.js.map