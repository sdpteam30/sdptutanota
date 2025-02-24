import stream from "mithril/stream";
import { assertMainOrNodeBoot, isApp, isDesktop } from "../api/common/Env";
import { downcast, findAndRemove, mapAndFilterNull, typedValues } from "@tutao/tutanota-utils";
import m from "mithril";
import { logoDefaultGrey, themes } from "./builtinThemes";
import { getWhitelabelCustomizations } from "../misc/WhitelabelCustomizations";
import { getCalendarLogoSvg, getMailLogoSvg } from "./base/Logo";
import { AppType } from "../misc/ClientConstants.js";
assertMainOrNodeBoot();
export const defaultThemeId = "light";
export class ThemeController {
    themeFacade;
    htmlSanitizer;
    app;
    theme;
    _themeId;
    _themePreference;
    // Subscribe to this to get theme change events. Cannot be used to update the theme
    observableThemeId;
    initialized;
    constructor(themeSingleton, themeFacade, htmlSanitizer, app) {
        this.themeFacade = themeFacade;
        this.htmlSanitizer = htmlSanitizer;
        this.app = app;
        // this will be overwritten quickly
        this._themeId = defaultThemeId;
        this._themePreference = "auto:light|dark";
        this.theme = Object.assign(themeSingleton, this.getDefaultTheme());
        this.observableThemeId = stream(this.themeId);
        // We run them in parallel to initialize as soon as possible
        this.initialized = Promise.all([this._initializeTheme(), this.updateSavedBuiltinThemes()]);
    }
    async _initializeTheme() {
        // If being accessed from a custom domain, the definition of whitelabelCustomizations is added to index.js serverside upon request
        // see RootHandler::applyWhitelabelFileModifications.
        const whitelabelCustomizations = getWhitelabelCustomizations(window);
        if (whitelabelCustomizations && whitelabelCustomizations.theme) {
            // no need to persist anything if we are on whitelabel domain
            const assembledTheme = await this.applyCustomizations(whitelabelCustomizations.theme, false);
            this._themePreference = assembledTheme.themeId;
        }
        else {
            // It is theme info passed from native to be applied as early as possible.
            // Important! Do not blindly apply location.search, someone could try to do prototype pollution.
            // We check environment and also filter out __proto__
            // mithril's parseQueryString does not follow standard exactly so we try to use the same thing we use on the native side
            const themeJson = window.location.href ? new URL(window.location.href).searchParams.get("theme") : null;
            if ((isApp() || isDesktop()) && themeJson) {
                const parsedTheme = this.parseCustomizations(themeJson);
                // We also don't need to save anything in this case
                await this.applyCustomizations(parsedTheme, false);
            }
            // If it's a first start we might get a fallback theme from native. We can apply it for a short time but we should switch to the full, resolved
            // theme after that.
            await this.setThemePreference((await this.themeFacade.getThemePreference()) ?? this._themePreference);
        }
    }
    parseCustomizations(stringTheme) {
        // Filter out __proto__ to avoid prototype pollution. We use Object.assign() which is not susceptible to it but it doesn't hurt.
        return JSON.parse(stringTheme, (k, v) => (k === "__proto__" ? undefined : v));
    }
    async updateSavedBuiltinThemes() {
        // In case we change built-in themes we want to save new copy on the device.
        for (const theme of typedValues(themes())) {
            await this.updateSavedThemeDefinition(theme);
        }
        // Remove blue theme because we don't have it anymore
        const oldThemes = (await this.themeFacade.getThemes());
        findAndRemove(oldThemes, (t) => t.themeId === "blue");
        await this.themeFacade.setThemes(oldThemes);
        // Check if the blue theme was selected and fallback for auto
        const themePreference = await this.themeFacade.getThemePreference();
        if (!themePreference || themePreference !== "blue")
            return;
        await this.setThemePreference("auto:light|dark", true);
    }
    async reloadTheme() {
        const themePreference = await this.themeFacade.getThemePreference();
        if (!themePreference)
            return;
        await this.setThemePreference(themePreference, false);
    }
    get themeId() {
        return this._themeId;
    }
    get themePreference() {
        return this._themePreference;
    }
    async getTheme(themeId) {
        if (themes()[themeId]) {
            // Make a defensive copy so that original theme definition is not modified.
            return Object.assign({}, themes()[themeId]);
        }
        else {
            const loadedThemes = (await this.themeFacade.getThemes());
            const customTheme = loadedThemes.find((t) => t.themeId === themeId);
            if (customTheme) {
                await this.sanitizeTheme(customTheme);
                return customTheme;
            }
            else {
                return this.getDefaultTheme();
            }
        }
    }
    getCurrentTheme() {
        return Object.assign({}, this.theme);
    }
    /**
     * Set the theme, if permanent is true then the locally saved theme will be updated
     */
    async setThemePreference(newThemePreference, permanent = true) {
        const themeId = await this.resolveThemePreference(newThemePreference);
        const newTheme = await this.getTheme(themeId);
        this.applyTrustedTheme(newTheme, themeId);
        this._themePreference = newThemePreference;
        if (permanent) {
            await this.themeFacade.setThemePreference(newThemePreference);
        }
    }
    async resolveThemePreference(newThemePreference) {
        if (newThemePreference === "auto:light|dark") {
            return (await this.themeFacade.prefersDark()) ? "dark" : "light";
        }
        else {
            return newThemePreference;
        }
    }
    applyTrustedTheme(newTheme, newThemeId) {
        // Theme object is effectively a singleton and is imported everywhere. It must be updated in place.
        // see theme.js
        // Clear all the keys first.
        for (const key of Object.keys(this.theme)) {
            delete downcast(this.theme)[key];
        }
        // Write new keys on it later. First default theme as base (so that optional values are correctly filled in) and then the new theme.
        Object.assign(this.theme, this.getDefaultTheme(), newTheme);
        this._themeId = newThemeId;
        this.observableThemeId(newThemeId);
        m.redraw();
    }
    /**
     * Apply the custom theme, if permanent === true, then the new theme will be saved
     */
    async applyCustomizations(customizations, permanent = true) {
        const updatedTheme = this.assembleTheme(customizations);
        // Set no logo until we sanitize it.
        const filledWithoutLogo = Object.assign({}, updatedTheme, {
            logo: "",
        });
        this.applyTrustedTheme(filledWithoutLogo, filledWithoutLogo.themeId);
        await this.sanitizeTheme(updatedTheme);
        // Now apply with the logo
        this.applyTrustedTheme(updatedTheme, filledWithoutLogo.themeId);
        if (permanent) {
            this._themePreference = updatedTheme.themeId;
            await this.updateSavedThemeDefinition(updatedTheme);
            await this.themeFacade.setThemePreference(updatedTheme.themeId);
        }
        return updatedTheme;
    }
    async storeCustomThemeForCustomizations(customizations) {
        const newTheme = this.assembleTheme(customizations);
        await this.updateSavedThemeDefinition(newTheme);
    }
    async sanitizeTheme(theme) {
        if (theme.logo) {
            const logo = theme.logo;
            const htmlSanitizer = await this.htmlSanitizer();
            theme.logo = htmlSanitizer.sanitizeHTML(logo).html;
        }
    }
    /**
     * Save theme to the storage.
     */
    async updateSavedThemeDefinition(updatedTheme) {
        const nonNullTheme = Object.assign({}, this.getDefaultTheme(), updatedTheme);
        await this.sanitizeTheme(nonNullTheme);
        const oldThemes = (await this.themeFacade.getThemes());
        findAndRemove(oldThemes, (t) => t.themeId === updatedTheme.themeId);
        oldThemes.push(nonNullTheme);
        await this.themeFacade.setThemes(oldThemes);
        return nonNullTheme;
    }
    getDefaultTheme() {
        return Object.assign({}, themes()[defaultThemeId]);
    }
    getBaseTheme(baseId) {
        // Make a defensive copy so that original theme definition is not modified.
        return Object.assign({}, themes()[baseId]);
    }
    shouldAllowChangingTheme() {
        return window.whitelabelCustomizations == null;
    }
    /**
     * Assembles a new theme object from customizations.
     */
    assembleTheme(customizations) {
        if (!customizations.base) {
            return Object.assign({}, customizations);
        }
        else if (customizations.base && customizations.logo) {
            return Object.assign({}, this.getBaseTheme(customizations.base), customizations);
        }
        else {
            const themeWithoutLogo = Object.assign({}, this.getBaseTheme(customizations.base), customizations);
            // This is a whitelabel theme where logo has not been overwritten.
            // Generate a logo with muted colors. We do not want to color our logo in
            // some random color.
            const grayedLogo = this.app === AppType.Calendar
                ? getCalendarLogoSvg(logoDefaultGrey, logoDefaultGrey, logoDefaultGrey)
                : getMailLogoSvg(logoDefaultGrey, logoDefaultGrey, logoDefaultGrey);
            return { ...themeWithoutLogo, ...{ logo: grayedLogo } };
        }
    }
    async getCustomThemes() {
        return mapAndFilterNull(await this.themeFacade.getThemes(), (theme) => {
            return !(theme.themeId in themes()) ? theme.themeId : null;
        });
    }
}
export class NativeThemeFacade {
    themeFacade;
    constructor(themeFacade) {
        this.themeFacade = themeFacade;
    }
    async getThemePreference() {
        const dispatcher = await this.themeFacade.getAsync();
        return dispatcher.getThemePreference();
    }
    async setThemePreference(theme) {
        const dispatcher = await this.themeFacade.getAsync();
        return dispatcher.setThemePreference(theme);
    }
    async getThemes() {
        const dispatcher = await this.themeFacade.getAsync();
        return (await dispatcher.getThemes());
    }
    async setThemes(themes) {
        const dispatcher = await this.themeFacade.getAsync();
        return dispatcher.setThemes(themes);
    }
    async prefersDark() {
        const dispatcher = await this.themeFacade.getAsync();
        return dispatcher.prefersDark();
    }
}
export class WebThemeFacade {
    deviceConfig;
    mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
    constructor(deviceConfig) {
        this.deviceConfig = deviceConfig;
    }
    async getThemePreference() {
        return this.deviceConfig.getTheme();
    }
    async setThemePreference(theme) {
        return this.deviceConfig.setTheme(theme);
    }
    async getThemes() {
        // no-op
        return [];
    }
    async setThemes(themes) {
        // no-op
    }
    async prefersDark() {
        return this.mediaQuery?.matches ?? false;
    }
    addDarkListener(listener) {
        this.mediaQuery?.addEventListener("change", listener);
    }
}
//# sourceMappingURL=ThemeController.js.map