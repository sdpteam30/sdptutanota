import { showSpellcheckLanguageDialog } from "../../gui/dialogs/SpellcheckLanguageDialog";
import { Keys } from "../../api/common/TutanotaConstants.js";
export class WebDesktopFacade {
    logins;
    nativeInterface;
    constructor(logins, nativeInterface) {
        this.logins = logins;
        this.nativeInterface = nativeInterface;
    }
    print() {
        window.print();
        return Promise.resolve();
    }
    async showSpellcheckDropdown() {
        await showSpellcheckLanguageDialog();
    }
    async applySearchResultToOverlay(result) {
        const { searchInPageOverlay } = await import("../../gui/SearchInPageOverlay.js");
        searchInPageOverlay.applyNextResult(result);
        return Promise.resolve();
    }
    async openFindInPage() {
        const { searchInPageOverlay } = await import("../../gui/SearchInPageOverlay.js");
        searchInPageOverlay.open();
        return Promise.resolve();
    }
    async reportError(errorInfo) {
        const { showErrorNotification } = await import("../../misc/ErrorReporter.js");
        await this.logins.waitForPartialLogin();
        await showErrorNotification(errorInfo);
    }
    /**
     * Updates the link-reveal on hover when the main thread detects that
     * the hovered url changed. Will _not_ update if hovering a in link app (starts with 2nd argument)
     */
    async updateTargetUrl(url, appPath) {
        let linkToolTip = document.getElementById("link-tt");
        if (!linkToolTip) {
            linkToolTip = document.createElement("DIV");
            linkToolTip.id = "link-tt";
            document.body.appendChild(linkToolTip);
        }
        if (url === "" || url.startsWith(appPath)) {
            linkToolTip.className = "";
        }
        else {
            linkToolTip.innerText = url;
            linkToolTip.className = "reveal";
        }
        return Promise.resolve();
    }
    /**
     * this is only used in the admin client to sync the DB view with the inbox
     */
    async openCustomer(mailAddress) {
        const m = await import("mithril");
        if (typeof mailAddress === "string" && m.route.get().startsWith("/customer")) {
            m.route.set(`/customer?query=${encodeURIComponent(mailAddress)}`);
            console.log("switching to customer", mailAddress);
        }
    }
    async addShortcuts(shortcuts) {
        const baseShortcut = {
            exec: () => true,
            ctrlOrCmd: false,
            alt: false,
            meta: false,
            help: "emptyString_msg",
            key: Keys.F,
        };
        const fixedShortcuts = shortcuts.map((nsc) => Object.assign({}, baseShortcut, nsc));
        const { keyManager } = await import("../../misc/KeyManager.js");
        keyManager.registerDesktopShortcuts(fixedShortcuts);
    }
    async appUpdateDownloaded() {
        const native = await this.nativeInterface();
        native.handleUpdateDownload();
    }
}
//# sourceMappingURL=WebDesktopFacade.js.map