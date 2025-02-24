import { DesktopConfigKey } from "./config/ConfigKeys";
import electron from "electron";
const LIGHT_FALLBACK_THEME = {
    themeId: "light-fallback",
    content_bg: "#ffffff",
    header_bg: "#ffffff",
    navigation_bg: "#f6f6f6",
};
/**
 * ThemeManager impl like in other native parts.
 * 4 methods correspond to ThemeFacade from web plus two convenience methods getCurrentTheme() and getCurrentThemeWithFallback().
 */
export class DesktopThemeFacade {
    config;
    wm;
    nativeTheme;
    constructor(config, wm, nativeTheme) {
        this.config = config;
        this.wm = wm;
        this.nativeTheme = nativeTheme;
    }
    init() {
        electron.nativeTheme.on("updated", () => {
            for (const window of this.wm.getAll()) {
                window.commonNativeFacade.updateTheme();
                window.updateBackgroundColor();
            }
        });
    }
    getThemePreference() {
        return this.config.getVar(DesktopConfigKey.selectedTheme);
    }
    async setThemePreference(themeId) {
        await this.config.setVar(DesktopConfigKey.selectedTheme, themeId);
        await this.applyTheme();
    }
    async getThemes() {
        return (await this.config.getVar(DesktopConfigKey.themes)) || [];
    }
    async setThemes(themes) {
        await this.config.setVar(DesktopConfigKey.themes, themes);
        await this.applyTheme();
    }
    async getCurrentTheme() {
        const themeId = await this.resolveThemePreference();
        const themes = await this.getThemes();
        return themes.find((t) => t.themeId === themeId) ?? null;
    }
    async getCurrentThemeWithFallback() {
        const theme = await this.getCurrentTheme();
        return theme ? { ...LIGHT_FALLBACK_THEME, ...theme } : LIGHT_FALLBACK_THEME;
    }
    async prefersDark() {
        return this.nativeTheme.shouldUseDarkColors;
    }
    async applyTheme() {
        for (const window of this.wm.getAll()) {
            await window.updateBackgroundColor();
        }
    }
    async resolveThemePreference() {
        const pref = await this.getThemePreference();
        if (pref === "auto:light|dark") {
            return this.nativeTheme.shouldUseDarkColors ? "dark" : "light";
        }
        else {
            return pref ?? "light";
        }
    }
}
//# sourceMappingURL=DesktopThemeFacade.js.map