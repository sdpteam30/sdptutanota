/* generated file, don't edit. */
export class SettingsFacadeReceiveDispatcher {
    facade;
    constructor(facade) {
        this.facade = facade;
    }
    async dispatch(method, arg) {
        switch (method) {
            case "getStringConfigValue": {
                const name = arg[0];
                return this.facade.getStringConfigValue(name);
            }
            case "setStringConfigValue": {
                const name = arg[0];
                const value = arg[1];
                return this.facade.setStringConfigValue(name, value);
            }
            case "getBooleanConfigValue": {
                const name = arg[0];
                return this.facade.getBooleanConfigValue(name);
            }
            case "setBooleanConfigValue": {
                const name = arg[0];
                const value = arg[1];
                return this.facade.setBooleanConfigValue(name, value);
            }
            case "getUpdateInfo": {
                return this.facade.getUpdateInfo();
            }
            case "registerMailto": {
                return this.facade.registerMailto();
            }
            case "unregisterMailto": {
                return this.facade.unregisterMailto();
            }
            case "integrateDesktop": {
                return this.facade.integrateDesktop();
            }
            case "unIntegrateDesktop": {
                return this.facade.unIntegrateDesktop();
            }
            case "getSpellcheckLanguages": {
                return this.facade.getSpellcheckLanguages();
            }
            case "getIntegrationInfo": {
                return this.facade.getIntegrationInfo();
            }
            case "enableAutoLaunch": {
                return this.facade.enableAutoLaunch();
            }
            case "disableAutoLaunch": {
                return this.facade.disableAutoLaunch();
            }
            case "manualUpdate": {
                return this.facade.manualUpdate();
            }
            case "changeLanguage": {
                const code = arg[0];
                const languageTag = arg[1];
                return this.facade.changeLanguage(code, languageTag);
            }
        }
    }
}
//# sourceMappingURL=SettingsFacadeReceiveDispatcher.js.map