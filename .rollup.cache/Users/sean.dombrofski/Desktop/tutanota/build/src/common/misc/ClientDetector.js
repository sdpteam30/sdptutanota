import { assertMainOrNodeBoot, isApp, Mode } from "../api/common/Env";
import { AppType } from "./ClientConstants";
assertMainOrNodeBoot();
export class ClientDetector {
    userAgent;
    browser;
    browserVersion;
    device;
    overflowAuto;
    isMacOS;
    appType;
    constructor() { }
    init(userAgent, platform, appType = AppType.Integrated) {
        this.userAgent = userAgent;
        this.browser = "Other" /* BrowserType.OTHER */;
        this.browserVersion = 0;
        this.device = "Desktop" /* DeviceType.DESKTOP */;
        this.appType = appType;
        this._setBrowserAndVersion();
        this._setDeviceInfo();
        this.overflowAuto = this.cssPropertyValueSupported("overflow", "overlay") ? "overlay" : "auto";
        this.isMacOS = platform.indexOf("Mac") !== -1;
    }
    /**
     * This function uses syntax constructs which we want to make sure are supported. If they are not then this file cannot be imported.
     */
    syntaxChecks() {
        // By default rollup disables tree-shaking inside the try-catch.
        try {
            const arrowFunction = () => {
                return 1;
            };
            let aLet = 2;
            function* testGenerator() { }
            async function testAsync() { }
            function testDefaultArgs(a = 2) { }
            testGenerator();
            testAsync();
            testDefaultArgs();
            const anArray = [1, 2, 3];
            const spreadArray = [...anArray];
            const dynamicString = "";
            const impossibleCondition = arrowFunction() === aLet;
            if (impossibleCondition) {
                import(dynamicString);
            }
            const objectSyntax = {
                [dynamicString]: true,
                testFn() { },
                get accessor() {
                    return null;
                },
                set accessor(newValue) { },
            };
            const templateString = `test ${dynamicString}`;
            const x = 1;
            const y = 2;
            const propertyShorthand = {
                x,
                y,
            };
            const { x: x2, y: y2 } = propertyShorthand;
            const [a1, a2, ...arest] = anArray;
            class WithStatisMember {
                static aFuncton() { }
            }
            for (const item of testGenerator()) {
                /* empty */
            }
        }
        catch (e) {
            /* empty */
        }
    }
    testBuiltins() {
        return (typeof Set !== "undefined" &&
            typeof Map !== "undefined" &&
            typeof Array.prototype.includes === "function" &&
            typeof Object.entries === "function" &&
            typeof Object.values === "function" &&
            typeof Object.fromEntries === "function" &&
            typeof Symbol !== "undefined" &&
            typeof Uint8Array !== "undefined" &&
            typeof Proxy !== "undefined" &&
            typeof Reflect !== "undefined" &&
            typeof Promise.prototype.finally !== "undefined" &&
            typeof String.prototype.replaceAll === "function" &&
            typeof BigInt !== "undefined");
    }
    testCss() {
        try {
            document.querySelector("blockquote:not(blockquote blockquote)");
            document.querySelectorAll(":where(.mouse-nav)");
            return true;
        }
        catch (e) {
            return false;
        }
    }
    /**
     * Browsers which support these features are supported
     */
    isSupported() {
        this.syntaxChecks();
        return this.isSupportedBrowserVersion() && this.testBuiltins() && this.websockets() && this.testCss();
    }
    isMobileDevice() {
        return this.device !== "Desktop" /* DeviceType.DESKTOP */;
    }
    isDesktopDevice() {
        return this.device === "Desktop" /* DeviceType.DESKTOP */;
    }
    /**
     * @see https://github.com/Modernizr/Modernizr/blob/5e3f359bfc9aa511543ece60bd8a6ea8aa7defd3/feature-detects/websockets.js
     */
    websockets() {
        return "WebSocket" in window && window.WebSocket.CLOSING === 2;
    }
    localStorage() {
        try {
            return localStorage != null;
        }
        catch (e) {
            // DOMException is thrown if all cookies are disabled
            return false;
        }
    }
    /**
     * We need WebAssembly for Argon2.
     *
     * @returns true if webassembly is supported
     */
    webassembly() {
        return typeof WebAssembly === "object" && typeof WebAssembly.instantiate === "function";
    }
    /**
     * @see https://github.com/Modernizr/Modernizr/blob/master/feature-detects/history.js
     */
    history() {
        return window.history && "pushState" in window.history;
    }
    /**
     * @see https://github.com/Modernizr/Modernizr/blob/master/feature-detects/network/xhr2.js
     */
    xhr2() {
        return "XMLHttpRequest" in window;
    }
    indexedDb() {
        try {
            return window.indexedDB != null;
        }
        catch (e) {
            return false;
        }
    }
    _setBrowserAndVersion() {
        const operaIndex1 = this.userAgent.indexOf("Opera");
        const operaIndex2 = this.userAgent.indexOf("OPR/");
        const firefoxIndex = this.userAgent.indexOf("Firefox/");
        const paleMoonIndex = this.userAgent.indexOf("PaleMoon/");
        const iceweaselIndex = this.userAgent.indexOf("Iceweasel/");
        const chromeIndex = this.userAgent.indexOf("Chrome/");
        const chromeIosIndex = this.userAgent.indexOf("CriOS/");
        const safariIndex = this.userAgent.indexOf("Safari/");
        const edgeIndex = this.userAgent.indexOf("Edge"); // "Old" edge based on EdgeHTML, "new" one based on Blink has only "Edg"
        const androidIndex = this.userAgent.indexOf("Android");
        let versionIndex = -1;
        if (edgeIndex !== -1) {
            this.browser = "Edge" /* BrowserType.EDGE */;
            versionIndex = edgeIndex + 5;
        }
        else if (operaIndex1 !== -1) {
            this.browser = "Opera" /* BrowserType.OPERA */;
            versionIndex = this.userAgent.indexOf("Version/");
            if (versionIndex !== -1) {
                versionIndex += 8;
            }
            else {
                versionIndex = operaIndex1 + 6;
            }
        }
        else if (operaIndex2 !== -1) {
            this.browser = "Opera" /* BrowserType.OPERA */;
            versionIndex = operaIndex2 + 4;
        }
        else if ((firefoxIndex !== -1 || iceweaselIndex !== -1) && operaIndex1 === -1 && operaIndex2 === -1 && paleMoonIndex === -1) {
            // Opera may pretend to be Firefox, so it is skipped
            this.browser = "Firefox" /* BrowserType.FIREFOX */;
            if (firefoxIndex !== -1) {
                versionIndex = firefoxIndex + 8;
            }
            else {
                versionIndex = iceweaselIndex + 10;
            }
        }
        else if (chromeIndex !== -1) {
            this.browser = "Chrome" /* BrowserType.CHROME */;
            versionIndex = chromeIndex + 7;
        }
        else if (androidIndex !== -1) {
            // default android browser
            // keep this check after Chrome, Firefox and Opera, because the Android browser does not identify itself in any other way
            this.browser = "Android" /* BrowserType.ANDROID */;
            versionIndex = androidIndex + 8;
        }
        else if (chromeIosIndex !== -1) {
            this.browser = "Chrome" /* BrowserType.CHROME */;
            versionIndex = chromeIosIndex + 6;
        }
        else if (safariIndex !== -1 && chromeIndex === -1) {
            // Chrome and black berry pretends to be Safari, so it is skipped
            this.browser = "Safari" /* BrowserType.SAFARI */;
            // Safari prints its version after "Version/"
            versionIndex = this.userAgent.indexOf("Version/");
            if (versionIndex !== -1) {
                versionIndex += 8;
            }
            else {
                // Other browsers on iOS do not usually send Version/ and we can assume that they're Safari
                this.extractIosVersion();
                return;
            }
        }
        else if (this.userAgent.match(/iPad.*AppleWebKit/) || this.userAgent.match(/iPhone.*AppleWebKit/)) {
            // iPad and iPhone do not send the Safari this.userAgent when HTML-apps are directly started from the homescreen a browser version is sent neither
            // after "OS" the iOS version is sent, so use that one
            // Also there are a lot of browsers on iOS but they all are based on Safari so we can use the same extraction mechanism for all of them.
            this.extractIosVersion();
            return;
        }
        if (versionIndex !== -1) {
            const mainVersionEndIndex = this.userAgent.indexOf(".", versionIndex);
            if (mainVersionEndIndex !== -1) {
                try {
                    this.browserVersion = Number(this.userAgent.substring(versionIndex, mainVersionEndIndex + 2)); // we recognize one digit after the '.'
                }
                catch (e) {
                    /* empty */
                }
            }
        }
        // if the version is not valid, the browser type is not valid, so set it to other
        if (this.browserVersion === 0) {
            this.browser = "Other" /* BrowserType.OTHER */;
        }
    }
    extractIosVersion() {
        // Extracting version does not work with iPad OS WebView because it's not in the userAgent. We could look it up
        // from Webkit version but maybe we don't need that for now.
        const versionIndex = this.userAgent.indexOf(" OS ");
        if (versionIndex !== -1) {
            this.browser = "Safari" /* BrowserType.SAFARI */;
            try {
                // in case of versions like 12_1_1 get substring 12_1 and convert it to 12.1
                let pos = versionIndex + 4;
                let hadNan = false;
                while (pos < this.userAgent.length) {
                    pos++;
                    if (isNaN(Number(this.userAgent.charAt(pos)))) {
                        if (hadNan) {
                            break;
                        }
                        else {
                            hadNan = true;
                        }
                    }
                }
                const numberString = this.userAgent.substring(versionIndex + 4, pos);
                this.browserVersion = Number(numberString.replace(/_/g, "."));
            }
            catch (e) {
                /* empty */
            }
        }
    }
    _setDeviceInfo() {
        this.device = "Desktop" /* DeviceType.DESKTOP */;
        if (this.userAgent.match(/iPad.*AppleWebKit/) != null || // iPadOS does not differ in UserAgent from Safari on macOS. Use hack with TouchEvent to detect iPad
            // Desktop Chrome has TouchEvent but it also has Chrome in it. Mobile iOS has CriOS in it and not Chrome.
            (/Macintosh; Intel Mac OS X.*AppleWebKit/.test(this.userAgent) && window.TouchEvent && /.*Chrome.*/.test(this.userAgent) === false)) {
            this.device = "iPad" /* DeviceType.IPAD */;
        }
        else if (this.userAgent.match(/iPhone.*AppleWebKit/) != null) {
            this.device = "iPhone" /* DeviceType.IPHONE */;
        }
        else if (this.userAgent.match(/Android/) != null) {
            if (this.userAgent.match(/Ubuntu/) != null) {
                this.device = "Other mobile" /* DeviceType.OTHER_MOBILE */;
            }
            else {
                this.device = "Android" /* DeviceType.ANDROID */;
            }
        }
        else if (this.userAgent.match(/Windows NT/) != null) {
            this.device = "Desktop" /* DeviceType.DESKTOP */;
        }
        else if (this.userAgent.match(/Mobile/) != null || this.userAgent.match(/Tablet/) != null) {
            this.device = "Other mobile" /* DeviceType.OTHER_MOBILE */;
        }
    }
    isTouchSupported() {
        return "ontouchstart" in window;
    }
    isIos() {
        return this.device === "iPad" /* DeviceType.IPAD */ || this.device === "iPhone" /* DeviceType.IPHONE */;
    }
    cssPropertyValueSupported(prop, value) {
        let d = document.createElement("div");
        d.style[prop] = value;
        return d.style[prop] === value;
    }
    getIdentifier() {
        if (env.mode === Mode.App) {
            if (this.appType === AppType.Integrated)
                throw new Error("AppType.Integrated is not allowed for mobile apps");
            const appType = this.appType === AppType.Mail ? "Mail" : "Calendar";
            return `${client.device} ${appType} App`;
        }
        else if (env.mode === Mode.Browser) {
            return client.browser + " Browser";
        }
        else if (env.platformId === "linux") {
            return "Linux Desktop";
        }
        else if (env.platformId === "darwin") {
            return "Mac Desktop";
        }
        else if (env.platformId === "win32") {
            return "Windows Desktop";
        }
        return "Unknown";
    }
    isSupportedBrowserVersion() {
        return this.notOldFirefox() && this.notOldChrome();
    }
    notOldFirefox() {
        // issue only occurs for old Firefox browsers
        // https://github.com/tutao/tutanota/issues/835
        return this.browser !== "Firefox" /* BrowserType.FIREFOX */ || this.browserVersion > 40;
    }
    notOldChrome() {
        return this.browser !== "Chrome" /* BrowserType.CHROME */ || this.browserVersion > 55;
    }
    needsMicrotaskHack() {
        return (this.isIos() ||
            this.browser === "Safari" /* BrowserType.SAFARI */ ||
            (this.browser === "Firefox" /* BrowserType.FIREFOX */ && this.browserVersion <= 60) ||
            (this.browser === "Chrome" /* BrowserType.CHROME */ && this.browserVersion < 59));
    }
    needsExplicitIDBIds() {
        return this.browser === "Safari" /* BrowserType.SAFARI */ && this.browserVersion < 12.2;
    }
    browserData() {
        return {
            needsMicrotaskHack: this.needsMicrotaskHack(),
            needsExplicitIDBIds: this.needsExplicitIDBIds(),
            indexedDbSupported: this.indexedDb(),
        };
    }
    compressionStreamSupported() {
        return typeof CompressionStream !== "undefined";
    }
    isCalendarApp() {
        return isApp() && this.appType === AppType.Calendar;
    }
    isMailApp() {
        return isApp() && this.appType === AppType.Mail;
    }
}
export const client = new ClientDetector();
//# sourceMappingURL=ClientDetector.js.map