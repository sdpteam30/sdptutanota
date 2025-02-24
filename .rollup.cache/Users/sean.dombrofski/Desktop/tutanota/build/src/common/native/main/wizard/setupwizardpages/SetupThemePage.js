import m from "mithril";
import { lang } from "../../../../misc/LanguageViewModel.js";
import { RadioSelector } from "../../../../gui/base/RadioSelector.js";
import { themeOptions } from "../../../../gui/theme.js";
import { SetupPageLayout } from "./SetupPageLayout.js";
import { locator } from "../../../../api/main/CommonLocator.js";
import { client } from "../../../../misc/ClientDetector.js";
export class SetupThemePage {
    // The whitelabel themes formatted as `RadioSelectorOption`s.
    customThemes = null;
    oninit() {
        // Get the whitelabel themes from the theme controller and map them to `RadioSelector` options.
        locator.themeController.getCustomThemes().then((customThemes) => {
            this.customThemes = customThemes.map((themeId) => {
                return { name: lang.makeTranslation(themeId, themeId), value: themeId };
            });
            m.redraw();
        });
    }
    view() {
        return m(SetupPageLayout, {
            image: "theme",
        }, m("p.full-width", lang.get("theme_title")), 
        // We need to await the promise from `themeController.getCustomThemes()`, so we delay rendering the `RadioSelector` until it does.
        this.customThemes == null
            ? null
            : m(RadioSelector, {
                name: "theme_label",
                options: [...themeOptions(client.isCalendarApp()), ...this.customThemes],
                class: "mb-s",
                selectedOption: locator.themeController.themePreference,
                onOptionSelected: (option) => {
                    locator.themeController.setThemePreference(option, true);
                },
            }));
    }
}
export class SetupThemePageAttrs {
    hidePagingButtonForPage = false;
    data = null;
    headerTitle() {
        return "appearanceSettings_label";
    }
    nextAction(showDialogs) {
        // next action not available for this page
        return Promise.resolve(true);
    }
    isSkipAvailable() {
        return false;
    }
    isEnabled() {
        return true;
    }
}
//# sourceMappingURL=SetupThemePage.js.map