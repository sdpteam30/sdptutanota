import m from "mithril";
/**
 * Handles requests for opening settings paths from native.
 */
export class OpenSettingsHandler {
    logins;
    constructor(logins) {
        this.logins = logins;
    }
    async openSettings(path) {
        await this.logins.waitForFullLogin();
        m.route.set(`/settings/:folder`, { folder: path });
    }
}
//# sourceMappingURL=OpenSettingsHandler.js.map