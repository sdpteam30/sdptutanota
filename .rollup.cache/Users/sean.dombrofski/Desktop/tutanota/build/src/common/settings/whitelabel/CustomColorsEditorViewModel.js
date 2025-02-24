import { assertMainOrNode } from "../../api/common/Env";
import { assertNotNull, clone, debounceStart, downcast } from "@tutao/tutanota-utils";
import { isValidColorCode } from "../../gui/base/Color";
import stream from "mithril/stream";
assertMainOrNode();
export class CustomColorsEditorViewModel {
    _customizations;
    _whitelabelConfig;
    _whitelabelDomainInfo;
    _accentColor;
    _baseTheme;
    _themeController;
    _entityClient;
    _loginController;
    _themeBeforePreview;
    builtTheme;
    constructor(currentTheme, themeCustomizations, whitelabelConfig, whitelabelDomainInfo, themeController, entityClient, loginController) {
        this._themeBeforePreview = Object.freeze(currentTheme);
        this._customizations = clone(themeCustomizations);
        this._whitelabelDomainInfo = whitelabelDomainInfo;
        this._whitelabelConfig = whitelabelConfig;
        this._themeController = themeController;
        this._entityClient = entityClient;
        this._loginController = loginController;
        this.builtTheme = stream();
        const baseThemeId = themeCustomizations.base ?? "light";
        const accentColor = themeCustomizations.content_accent ?? this._themeController.getDefaultTheme().content_accent;
        this.changeBaseTheme(baseThemeId);
        this.changeAccentColor(accentColor);
    }
    init() {
        this._applyEditedTheme();
    }
    get customColors() {
        const base = this._themeController.getBaseTheme(this.baseThemeId);
        return Object.keys(base)
            .map((key) => key)
            .filter((name) => !this._shallBeExcluded(name))
            .map((key) => key)
            .sort((a, b) => a.localeCompare(b))
            .map((key) => {
            const value = this._customizations[key] ?? "";
            // @ts-ignore we already checked that it's safe
            const defaultValue = base[key];
            return {
                name: key,
                value,
                defaultValue: assertNotNull(defaultValue),
                valid: this._isValidColorValue(value),
            };
        });
    }
    get accentColor() {
        return this._accentColor;
    }
    get customizations() {
        return this._customizations;
    }
    get baseThemeId() {
        return this._baseTheme;
    }
    getDefaultColor(colorName) {
        return assertNotNull(this._themeController.getBaseTheme(this.baseThemeId)[colorName]);
    }
    changeAccentColor(accentColor) {
        this._accentColor = accentColor;
        this.addCustomization("list_accent_fg", accentColor);
        this.addCustomization("content_accent", accentColor);
        this.addCustomization("content_button_selected", accentColor);
        this.addCustomization("navigation_button_selected", accentColor);
        this.addCustomization("header_button_selected", accentColor);
        this._applyEditedTheme();
    }
    changeBaseTheme(baseThemeId) {
        this._baseTheme = baseThemeId;
        this.addCustomization("base", baseThemeId);
        this._applyEditedTheme();
    }
    /**
     * Try to save changes. if there are invalid color values in the theme doesn't save and returns false, else saves and returns true
     */
    async save() {
        const colors = Object.keys(this.customizations).filter((name) => name !== "logo" && name !== "themeId" && name !== "base");
        for (let i = 0; i < colors.length; i++) {
            if (!this._isValidColorValue(this.customizations[colors[i]] ?? "")) {
                return false;
            }
        }
        this.addCustomization("themeId", this._whitelabelDomainInfo.domain);
        this._whitelabelConfig.jsonTheme = JSON.stringify(this.customizations);
        await this._entityClient.update(this._whitelabelConfig);
        if (!this._loginController.isWhitelabel()) {
            await this.resetActiveClientTheme();
        }
        return true;
    }
    async resetActiveClientTheme() {
        await this._themeController.applyCustomizations(downcast(Object.assign({}, {
            base: null,
        }, this._themeBeforePreview)), false);
    }
    addCustomization(nameOfKey, colorValue) {
        // @ts-ignore it's pretty hard to define what we want
        this.customizations[nameOfKey] = colorValue;
        this._applyEditedTheme();
    }
    _isValidColorValue(colorValue) {
        return isValidColorCode(colorValue.trim()) || colorValue.trim() === "";
    }
    /**
     * These values shall be excluded when rendering the advanced TextFields
     * @return boolean, true iff provided parameter 'name' shall be excluded
     */
    _shallBeExcluded(name) {
        const excludedColors = [
            "logo",
            "themeId",
            "base",
            "list_accent_fg",
            "content_button_selected",
            "navigation_button_selected",
            "header_button_selected",
            "content_accent",
            "content_accent_cyber_monday",
            "content_bg_cyber_monday",
            "content_border_cyber_monday",
        ];
        return excludedColors.includes(name);
    }
    _applyEditedTheme = debounceStart(100, () => {
        this._removeEmptyCustomizations();
        this._themeController.applyCustomizations(this._filterAndReturnCustomizations(), false);
    });
    _removeEmptyCustomizations() {
        this._customizations = downcast(Object.fromEntries(Object.entries(this.customizations).filter(([k, v]) => v !== "")));
    }
    /**
     *  filters out all invalid color values from ThemeCustomizations whilst keeping logo, base and themeId
     */
    _filterAndReturnCustomizations() {
        const colorValues = Object.entries(this.customizations).filter(([n, v]) => n !== "themeId" && n !== "base" && n !== "logo");
        const filteredColorValues = colorValues.filter(([n, v]) => this._isValidColorValue(downcast(v)));
        for (const [n, v] of Object.entries(this.customizations)) {
            if (n === "themeId" || n === "base" || n === "logo") {
                filteredColorValues.push([n, v]);
            }
        }
        return downcast(Object.fromEntries(filteredColorValues));
    }
}
//# sourceMappingURL=CustomColorsEditorViewModel.js.map