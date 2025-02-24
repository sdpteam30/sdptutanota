import * as electron from "electron";
export class DesktopSettingsFacade {
    conf;
    utils;
    integrator;
    updater;
    lang;
    constructor(conf, utils, integrator, updater, lang) {
        this.conf = conf;
        this.utils = utils;
        this.integrator = integrator;
        this.updater = updater;
        this.lang = lang;
    }
    async changeLanguage(code, languageTag) {
        return this.lang.setLanguage({ code, languageTag });
    }
    async manualUpdate() {
        return this.updater.manualUpdate();
    }
    async enableAutoLaunch() {
        return this.integrator.enableAutoLaunch();
    }
    async disableAutoLaunch() {
        return this.integrator.disableAutoLaunch();
    }
    async getBooleanConfigValue(name) {
        return this.conf.getVar(name);
    }
    async getStringConfigValue(name) {
        return this.conf.getVar(name);
    }
    async setBooleanConfigValue(name, value) {
        await this.conf.setVar(name, value);
    }
    async setStringConfigValue(name, value) {
        await this.conf.setVar(name, value);
    }
    async getIntegrationInfo() {
        const [isAutoLaunchEnabled, isIntegrated, isUpdateAvailable] = await Promise.all([
            this.integrator.isAutoLaunchEnabled(),
            this.integrator.isIntegrated(),
            this.updater.updateInfo != null,
        ]);
        return {
            isIntegrated,
            isAutoLaunchEnabled,
            isMailtoHandler: this.utils.checkIsMailtoHandler(),
            isUpdateAvailable,
        };
    }
    async getSpellcheckLanguages() {
        return electron.session.defaultSession.availableSpellCheckerLanguages;
    }
    async getUpdateInfo() {
        return this.updater.updateInfo;
    }
    async integrateDesktop() {
        await this.integrator.integrate();
    }
    async unIntegrateDesktop() {
        await this.integrator.unintegrate();
    }
    async registerMailto() {
        await this.utils.registerAsMailtoHandler();
    }
    async unregisterMailto() {
        await this.utils.unregisterAsMailtoHandler();
    }
}
//# sourceMappingURL=DesktopSettingsFacade.js.map