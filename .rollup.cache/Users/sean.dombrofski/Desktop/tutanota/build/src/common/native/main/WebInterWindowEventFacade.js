/**
 * receiving side of the InterWindowEventBus
 */
export class WebInterWindowEventFacade {
    logins;
    windowFacade;
    deviceConfig;
    constructor(logins, windowFacade, deviceConfig) {
        this.logins = logins;
        this.windowFacade = windowFacade;
        this.deviceConfig = deviceConfig;
    }
    async localUserDataInvalidated(userId) {
        if (this.logins.isUserLoggedIn() && userId === this.logins.getUserController().userId) {
            await this.logins.logout(false);
            // we don't want to reload before returning because
            // someone is waiting for our response.
            Promise.resolve().then(() => this.windowFacade.reload({ noAutoLogin: true }));
        }
    }
    async reloadDeviceConfig() {
        this.deviceConfig.init();
    }
}
//# sourceMappingURL=WebInterWindowEventFacade.js.map