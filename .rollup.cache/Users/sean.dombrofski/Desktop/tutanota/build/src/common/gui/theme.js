import { assertMainOrNodeBoot } from "../api/common/Env";
import { isColorLight } from "./base/Color";
import { logoDefaultGrey, tutaDunkel, tutaRed } from "./builtinThemes";
import { getTutaLogoSvg } from "./base/Logo.js";
assertMainOrNodeBoot();
const themeSingleton = {};
// ThemeController.updateTheme updates the object in place, so this will always be current.
// There are few alternative ways this could have been implemented:
//  * make each property on this singleton a getter that defers to themeController
//  * make this singleton a proxy that does the same thing
// We keep this singleton available because it is convenient to refer to, and already everywhere in the code before the addition of ThemeController.
export const theme = themeSingleton;
export const themeOptions = (isCalendarApp) => [
    {
        name: "systemThemePref_label",
        value: "auto:light|dark",
    },
    {
        name: "light_label",
        value: "light",
    },
    {
        name: "dark_label",
        value: "dark",
    },
    {
        name: isCalendarApp ? "light_red_label" : "light_blue_label",
        value: "light_secondary",
    },
    {
        name: isCalendarApp ? "dark_red_label" : "dark_blue_label",
        value: "dark_secondary",
    },
];
export function getContentButtonIconBackground() {
    return theme.content_button_icon_bg || theme.content_button; // fallback for the new color content_button_icon_bg
}
export function getNavButtonIconBackground() {
    return theme.navigation_button_icon_bg || theme.navigation_button; // fallback for the new color content_button_icon_bg
}
export function getElevatedBackground() {
    return theme.elevated_bg || theme.content_bg;
}
export function getNavigationMenuBg() {
    return theme.navigation_menu_bg || theme.navigation_bg;
}
export function getNavigationMenuIcon() {
    return theme.navigation_menu_icon || theme.navigation_button_icon;
}
export function getLightOrDarkTutaLogo(isCalendarApp) {
    // Use tuta logo with our brand colors
    const isCalendarTheme = (theme.themeId === "light" && isCalendarApp) || (theme.themeId === "light_secondary" && !isCalendarApp);
    if (isColorLight(theme.content_bg) && !isCalendarTheme) {
        return getTutaLogoSvg(tutaRed, tutaDunkel);
    }
    else {
        return getTutaLogoSvg(logoDefaultGrey, logoDefaultGrey);
    }
}
//# sourceMappingURL=theme.js.map