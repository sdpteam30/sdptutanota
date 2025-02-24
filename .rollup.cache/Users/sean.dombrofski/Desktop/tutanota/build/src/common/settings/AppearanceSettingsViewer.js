import m from "mithril";
import { getLanguage, lang, languageCodeToTag, languageNative } from "../misc/LanguageViewModel.js";
import { styles } from "../gui/styles.js";
import { DropDownSelector } from "../gui/base/DropDownSelector.js";
import { deviceConfig } from "../misc/DeviceConfig.js";
import { downcast, incrementDate, noOp, promiseMap } from "@tutao/tutanota-utils";
import { UserSettingsGroupRootTypeRef } from "../../common/api/entities/tutanota/TypeRefs.js";
import { getHourCycle } from "../../common/misc/Formatter";
import { themeOptions } from "../../common/gui/theme";
import { isDesktop } from "../../common/api/common/Env";
import { locator } from "../../common/api/main/CommonLocator";
import { isUpdateForTypeRef } from "../../common/api/common/utils/EntityUpdateUtils.js";
import { client } from "../misc/ClientDetector.js";
export class AppearanceSettingsViewer {
    _customThemes = null;
    oncreate() {
        locator.themeController.getCustomThemes().then((themes) => {
            this._customThemes = themes;
            m.redraw();
        });
    }
    view() {
        const actualLanguageItems = languageNative
            .map((language) => {
            return {
                name: language.textName,
                value: language.code,
            };
        })
            .sort((l1, l2) => l1.name.localeCompare(l2.name));
        const languageItems = actualLanguageItems.concat({
            name: lang.get("automatic_label"),
            value: null,
        });
        const languageDropDownAttrs = {
            label: "language_label",
            items: languageItems,
            // DropdownSelectorN uses `===` to compare items so if the language is not set then `undefined` will not match `null`
            selectedValue: deviceConfig.getLanguage() || null,
            selectionChangedHandler: async (value) => {
                deviceConfig.setLanguage(value);
                const newLanguage = value
                    ? {
                        code: value,
                        languageTag: languageCodeToTag(value),
                    }
                    : getLanguage();
                await lang.setLanguage(newLanguage);
                if (isDesktop()) {
                    await locator.desktopSettingsFacade.changeLanguage(newLanguage.code, newLanguage.languageTag);
                }
                styles.updateStyle("main");
                m.redraw();
            },
        };
        const userSettingsGroupRoot = locator.logins.getUserController().userSettingsGroupRoot;
        const hourFormatDropDownAttrs = {
            label: "timeFormat_label",
            items: [
                {
                    name: lang.get("timeFormatTwentyFourHour_label"),
                    value: "0" /* TimeFormat.TWENTY_FOUR_HOURS */,
                },
                {
                    name: lang.get("timeFormatTwelveHour_label"),
                    value: "1" /* TimeFormat.TWELVE_HOURS */,
                },
            ],
            selectedValue: downcast(userSettingsGroupRoot.timeFormat),
            selectionChangedHandler: (value) => {
                userSettingsGroupRoot.timeFormat = value;
                locator.entityClient.update(userSettingsGroupRoot);
            },
        };
        const weekdayFormat = new Intl.DateTimeFormat(lang.languageTag, {
            weekday: "long",
        });
        const calcDate = new Date();
        const sundayName = weekdayFormat.format(incrementDate(calcDate, -calcDate.getDay())); // Sunday as reference
        const mondayName = weekdayFormat.format(incrementDate(calcDate, 1)); // Monday is one day later
        const saturdayName = weekdayFormat.format(incrementDate(calcDate, 5)); // Saturday is five days later
        const weekStartDropDownAttrs = {
            label: "weekStart_label",
            items: [
                {
                    name: mondayName,
                    value: "0" /* WeekStart.MONDAY */,
                },
                {
                    name: saturdayName,
                    value: "2" /* WeekStart.SATURDAY */,
                },
                {
                    name: sundayName,
                    value: "1" /* WeekStart.SUNDAY */,
                },
            ],
            selectedValue: downcast(userSettingsGroupRoot.startOfTheWeek),
            selectionChangedHandler: (value) => {
                userSettingsGroupRoot.startOfTheWeek = value;
                locator.entityClient.update(userSettingsGroupRoot);
            },
        };
        return m(".fill-absolute.scroll.plr-l.pb-xl", [
            m(".h4.mt-l", lang.get("settingsForDevice_label")),
            m(DropDownSelector, languageDropDownAttrs),
            this._renderThemeSelector(),
            m(".h4.mt-l", lang.get("userSettings_label")),
            m(DropDownSelector, hourFormatDropDownAttrs),
            m(DropDownSelector, weekStartDropDownAttrs),
        ]);
    }
    _renderThemeSelector() {
        if (!locator.themeController.shouldAllowChangingTheme() || this._customThemes == null) {
            return null;
        }
        const customOptions = this._customThemes.map((themeId) => {
            return {
                name: themeId,
                value: themeId,
            };
        });
        const themeDropDownAttrs = {
            label: "switchColorTheme_action",
            items: [...themeOptions(client.isCalendarApp()).map(({ name, value }) => ({ name: lang.get(name), value: value })), ...customOptions],
            selectedValue: locator.themeController.themePreference,
            selectionChangedHandler: (value) => locator.themeController.setThemePreference(value),
            dropdownWidth: 300,
        };
        return m(DropDownSelector, themeDropDownAttrs);
    }
    entityEventsReceived(updates) {
        return promiseMap(updates, (update) => {
            if (isUpdateForTypeRef(UserSettingsGroupRootTypeRef, update)) {
                return locator.entityClient.load(UserSettingsGroupRootTypeRef, update.instanceId).then((settings) => {
                    lang.updateFormats({
                        hourCycle: getHourCycle(settings),
                    });
                    m.redraw();
                });
            }
        }).then(noOp);
    }
}
//# sourceMappingURL=AppearanceSettingsViewer.js.map