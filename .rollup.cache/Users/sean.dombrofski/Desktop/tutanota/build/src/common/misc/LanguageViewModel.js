import { downcast, typedEntries } from "@tutao/tutanota-utils";
import { getWhitelabelCustomizations } from "./WhitelabelCustomizations";
import { assertMainOrNodeBoot } from "../api/common/Env";
assertMainOrNodeBoot();
const translationImportMap = {
    ar: () => import("../../mail-app/translations/ar.js"),
    be: () => import("../../mail-app/translations/be.js"),
    bg: () => import("../../mail-app/translations/bg.js"),
    ca: () => import("../../mail-app/translations/ca.js"),
    cs: () => import("../../mail-app/translations/cs.js"),
    da: () => import("../../mail-app/translations/da.js"),
    de: () => import("../../mail-app/translations/de.js"),
    de_sie: () => import("../../mail-app/translations/de_sie.js"),
    el: () => import("../../mail-app/translations/el.js"),
    en: () => import("../../mail-app/translations/en.js"),
    en_gb: () => import("../../mail-app/translations/en.js"),
    es: () => import("../../mail-app/translations/es.js"),
    et: () => import("../../mail-app/translations/et.js"),
    fa_ir: () => import("../../mail-app/translations/fa_ir.js"),
    fi: () => import("../../mail-app/translations/fi.js"),
    fr: () => import("../../mail-app/translations/fr.js"),
    gl: () => import("../../mail-app/translations/gl.js"),
    he: () => import("../../mail-app/translations/he.js"),
    hi: () => import("../../mail-app/translations/hi.js"),
    hr: () => import("../../mail-app/translations/hr.js"),
    hu: () => import("../../mail-app/translations/hu.js"),
    id: () => import("../../mail-app/translations/id.js"),
    it: () => import("../../mail-app/translations/it.js"),
    ja: () => import("../../mail-app/translations/ja.js"),
    ko: () => import("../../mail-app/translations/ko.js"),
    lt: () => import("../../mail-app/translations/lt.js"),
    lv: () => import("../../mail-app/translations/lv.js"),
    nl: () => import("../../mail-app/translations/nl.js"),
    no: () => import("../../mail-app/translations/no.js"),
    pl: () => import("../../mail-app/translations/pl.js"),
    pt_br: () => import("../../mail-app/translations/pt_br.js"),
    pt_pt: () => import("../../mail-app/translations/pt_pt.js"),
    ro: () => import("../../mail-app/translations/ro.js"),
    ru: () => import("../../mail-app/translations/ru.js"),
    si: () => import("../../mail-app/translations/si.js"),
    sk: () => import("../../mail-app/translations/sk.js"),
    sl: () => import("../../mail-app/translations/sl.js"),
    sr_cyrl: () => import("../../mail-app/translations/sr_cyrl.js"),
    sv: () => import("../../mail-app/translations/sv.js"),
    tr: () => import("../../mail-app/translations/tr.js"),
    uk: () => import("../../mail-app/translations/uk.js"),
    vi: () => import("../../mail-app/translations/vi.js"),
    zh: () => import("../../mail-app/translations/zh.js"),
    zh_hant: () => import("../../mail-app/translations/zh_hant.js"),
};
/**
 * Language = {code, textId}
 * "code" is the 2 letter abbr. of the language ("en", "ar")
 * "textId" corresponds to a code ("languageEnglish_label", "languageArabic_label")
 *
 * lang.get(textId) will return the translated languages
 * languageByCode[code] will return the whole language Object
 * in all cases lang.get(languageByCode[code].textId) will always return the translated language from a code
 */
export const LanguageNames = Object.freeze({
    ar: "languageArabic_label",
    be: "languageBelarusian_label",
    bg: "languageBulgarian_label",
    ca: "languageCatalan_label",
    cs: "languageCzech_label",
    da: "languageDanish_label",
    de: "languageGerman_label",
    de_sie: "languageGermanSie_label",
    el: "languageGreek_label",
    en: "languageEnglish_label",
    en_gb: "languageEnglishUk_label",
    es: "languageSpanish_label",
    et: "languageEstonian_label",
    fa_ir: "languagePersian_label",
    fi: "languageFinnish_label",
    fr: "languageFrench_label",
    gl: "languageGalician_label",
    he: "languageHebrew_label",
    hi: "languageHindi_label",
    hr: "languageCroatian_label",
    hu: "languageHungarian_label",
    id: "languageIndonesian_label",
    it: "languageItalian_label",
    ja: "languageJapanese_label",
    ko: "languageKorean_label",
    lt: "languageLithuanian_label",
    lv: "languageLatvian_label",
    nl: "languageDutch_label",
    no: "languageNorwegian_label",
    pl: "languagePolish_label",
    pt_br: "languagePortugeseBrazil_label",
    pt_pt: "languagePortugesePortugal_label",
    ro: "languageRomanian_label",
    ru: "languageRussian_label",
    si: "languageSinhalese_label",
    sk: "languageSlovak_label",
    sl: "languageSlovenian_label",
    sr_cyrl: "languageSerbian_label",
    sv: "languageSwedish_label",
    tr: "languageTurkish_label",
    uk: "languageUkrainian_label",
    vi: "languageVietnamese_label",
    zh: "languageChineseSimplified_label",
    zh_hant: "languageChineseTraditional_label",
});
export const LanguageActualNames = Object.freeze({
    ar: "العربية",
    be: "Беларуская",
    bg: "Български",
    ca: "Català",
    cs: "Čeština",
    da: "Dansk",
    de: "Deutsch",
    de_sie: "Deutsch (Sie)",
    el: "Ελληνική",
    en: "English",
    en_gb: "English (UK)",
    es: "Español",
    et: "Eesti keel",
    fa_ir: "فارسی",
    fi: "suomi",
    fr: "Français",
    gl: "Galego",
    he: "עברית",
    hi: "हिंदी",
    hr: "Hrvatski",
    hu: "Magyar",
    id: "Indonesia",
    it: "Italiano",
    ja: "日本語",
    ko: "한국어",
    lt: "Lietuvių",
    lv: "Latviešu",
    nl: "Nederlands",
    no: "Norsk",
    pl: "polski",
    pt_br: "Português, Brasil",
    pt_pt: "Português, Portugal",
    ro: "Română",
    ru: "Русский",
    si: "සිංහල",
    sk: "Slovenčina",
    sl: "slovenščina",
    sr_cyrl: "Srpski",
    sv: "Svenska",
    tr: "Türkçe",
    uk: "Українська",
    vi: "Tiếng Việt",
    zh: "简体中文",
    zh_hant: "繁體中文",
});
export const languageByCode = {};
// cannot import typedEntries here for some reason
for (let [code, textId] of downcast(Object.entries(LanguageNames))) {
    languageByCode[code] = {
        code,
        textId,
    };
}
export const languages = typedEntries(LanguageNames).map(([code, textId]) => {
    return {
        code,
        textId,
    };
});
export const languageNative = typedEntries(LanguageActualNames).map(([code, textName]) => {
    return {
        code,
        textName,
    };
});
/**
 * Provides all localizations of strings on our gui.
 *
 * The translations are defined on JSON files. See the folder 'translations' for examples.
 * The actual identifier is camel case and the type is appended by an underscore.
 * Types: label, action, msg, title, alt, placeholder
 *
 * @constructor
 */
export class LanguageViewModel {
    translations;
    fallback;
    code;
    languageTag;
    staticTranslations;
    formats;
    constructor() {
        this.translations = {};
        this.fallback = {};
        this.staticTranslations = {};
    }
    init(en) {
        this.translations = en;
        this.fallback = en; // always load english as fallback
        this.code = "en";
        const language = getLanguage();
        return this.setLanguage(language) // Service worker currently caches only English. We don't want the whole app to fail if we cannot fetch the language.
            .catch((e) => {
            console.warn("Could not set language", language, e);
            this._setLanguageTag("en-US");
        });
    }
    addStaticTranslation(key, text) {
        this.staticTranslations[key] = text;
    }
    initWithTranslations(code, languageTag, fallBackTranslations, translations) {
        this.translations = translations;
        this.fallback = fallBackTranslations;
        this.code = code;
    }
    setLanguage(lang) {
        this._setLanguageTag(lang.languageTag);
        if (this.code === lang.code) {
            return Promise.resolve();
        }
        // we don't support multiple language files for en so just use the one and only.
        const code = lang.code.startsWith("en") ? "en" : lang.code;
        return translationImportMap[code]().then((translationsModule) => {
            this.translations = translationsModule.default;
            this.code = lang.code;
        });
    }
    /**
     * must be invoked at startup from LanguageViewModel to initialize all DateTimeFormats
     * @param tag
     */
    _setLanguageTag(tag) {
        this.languageTag = tag;
        this.updateFormats({});
    }
    updateFormats(options) {
        const tag = this.languageTag;
        this.formats = {
            simpleDate: new Intl.DateTimeFormat(tag, {
                day: "numeric",
                month: "numeric",
                year: "numeric",
            }),
            dateWithMonth: new Intl.DateTimeFormat(tag, {
                day: "numeric",
                month: "short",
                year: "numeric",
            }),
            dateWithoutYear: Intl.DateTimeFormat(tag, {
                day: "numeric",
                month: "short",
            }),
            simpleDateWithoutYear: Intl.DateTimeFormat(tag, {
                day: "numeric",
                month: "numeric",
            }),
            dateWithWeekday: new Intl.DateTimeFormat(tag, {
                weekday: "short",
                day: "numeric",
                month: "short",
            }),
            dateWithWeekdayWoMonth: new Intl.DateTimeFormat(tag, {
                weekday: "short",
                day: "numeric",
            }),
            dateWithWeekdayAndYear: new Intl.DateTimeFormat(tag, {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
            }),
            dateWithWeekdayAndYearLong: new Intl.DateTimeFormat(tag, {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
            }),
            dateWithWeekdayAndTime: new Intl.DateTimeFormat(tag, Object.assign({}, {
                weekday: "short",
                day: "numeric",
                month: "short",
                hour: "numeric",
                minute: "numeric",
            }, options)),
            time: new Intl.DateTimeFormat(tag, Object.assign({}, {
                hour: "numeric",
                minute: "numeric",
            }, options)),
            shortTime: new Intl.DateTimeFormat(tag, Object.assign({}, {
                hour: "numeric",
            }, options)),
            dateTime: new Intl.DateTimeFormat(tag, Object.assign({}, {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
            }, options)),
            dateTimeShort: new Intl.DateTimeFormat(tag, Object.assign({}, {
                day: "numeric",
                month: "numeric",
                year: "numeric",
                hour: "numeric",
            }, options)),
            weekdayShort: new Intl.DateTimeFormat(tag, {
                weekday: "short",
            }),
            weekdayNarrow: new Intl.DateTimeFormat(tag, {
                weekday: "narrow",
            }),
            priceWithCurrency: new Intl.NumberFormat(tag, {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 2,
            }),
            priceWithCurrencyWithoutFractionDigits: new Intl.NumberFormat(tag, {
                style: "currency",
                currency: "EUR",
                maximumFractionDigits: 0,
                minimumFractionDigits: 0,
            }),
            priceWithoutCurrency: new Intl.NumberFormat(tag, {
                style: "decimal",
                minimumFractionDigits: 2,
            }),
            priceWithoutCurrencyWithoutFractionDigits: new Intl.NumberFormat(tag, {
                style: "decimal",
                maximumFractionDigits: 0,
                minimumFractionDigits: 0,
            }),
            monthLong: new Intl.DateTimeFormat(tag, {
                month: "long",
            }),
            monthShort: new Intl.DateTimeFormat(tag, {
                month: "short",
            }),
            monthShortWithFullYear: new Intl.DateTimeFormat(tag, {
                month: "short",
                year: "numeric",
            }),
            monthWithYear: new Intl.DateTimeFormat(tag, {
                month: "long",
                year: "2-digit",
            }),
            monthWithFullYear: new Intl.DateTimeFormat(tag, {
                month: "long",
                year: "numeric",
            }),
            yearNumeric: new Intl.DateTimeFormat(tag, {
                year: "numeric",
            }),
            shortMonthYear2Digit: new Intl.DateTimeFormat(tag, {
                month: "2-digit",
                year: "2-digit",
            }),
        };
    }
    exists(id) {
        try {
            this.get(id);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    /**
     * Resolve TranslationKey to Translation.
     */
    getTranslation(id, replacements) {
        return this.makeTranslation(id, this.get(id, replacements));
    }
    /**
     * Should only be used to write the text of a TranslationKey to the dom.
     */
    getTranslationText(value) {
        return typeof value === "object" ? value.text : lang.get(value);
    }
    /**
     * Legacy. Use getTranslation instead.
     *
     * Should only be used to write the text of a TranslationKey to the dom.
     */
    get(id, replacements) {
        if (id == null) {
            return "";
        }
        if (id === "emptyString_msg") {
            return "\u2008";
        }
        let text = this.translations.keys[id];
        if (!text) {
            // try fallback language
            text = this.fallback.keys[id];
            if (!text) {
                // try static definitions
                text = this.staticTranslations[id];
                if (!text) {
                    throw new Error("no translation found for id " + id);
                }
            }
        }
        for (let param in replacements) {
            text = text.replaceAll(param, String(replacements[param]));
        }
        return text;
    }
    getTestId(value) {
        return typeof value === "object" ? value.testId : value;
    }
    /**
     * Creates a Translation. Only to be used in rare cases where we can't use a
     * TranslationKey (e.g. rendering the name of a folder).
     * @param testId
     * @param unresolved
     */
    makeTranslation(testId, unresolved) {
        let text = typeof unresolved === "function" ? unresolved() : unresolved;
        return { testId: testId, text };
    }
}
/**
 * Gets the default language derived from the browser language.
 * @param restrictions An array of language codes the selection should be restricted to
 */
export function getLanguageNoDefault(restrictions) {
    // navigator.languages can be an empty array on android 5.x devices
    let languageTags;
    if (typeof navigator !== "undefined") {
        languageTags = navigator.languages && navigator.languages.length > 0 ? navigator.languages : [navigator.language];
    }
    else if (typeof process !== "undefined" && typeof process.env !== "undefined") {
        const locale = process.env.LC_ALL || process.env.LC_MESSAGES || process.env.LANG || process.env.LANGUAGE || process.env.LC_NAME;
        if (locale) {
            languageTags = [locale.split(".")[0].replace("_", "-")];
        }
    }
    if (languageTags) {
        for (let tag of languageTags) {
            let code = getSubstitutedLanguageCode(tag, restrictions);
            if (code) {
                return {
                    code: code,
                    languageTag: tag,
                };
            }
        }
    }
    return null;
}
/**
 * Gets the default language derived from the browser language.
 * @param restrictions An array of language codes the selection should be restricted to
 */
export function getLanguage(restrictions) {
    const language = getLanguageNoDefault(restrictions);
    if (language)
        return language;
    if (restrictions == null || restrictions.indexOf("en") !== -1) {
        return {
            code: "en",
            languageTag: "en-US",
        };
    }
    else {
        return {
            code: restrictions[0],
            languageTag: restrictions[0].replace("/_/g", "-"),
        };
    }
}
export function getSubstitutedLanguageCode(tag, restrictions) {
    let code = tag.toLowerCase().replace("-", "_");
    let language = languages.find((l) => l.code === code && (restrictions == null || restrictions.indexOf(l.code) !== -1));
    if (language == null) {
        if (code === "zh_hk" || code === "zh_tw") {
            language = languages.find((l) => l.code === "zh_hant");
        }
        else {
            let basePart = getBasePart(code);
            language = languages.find((l) => getBasePart(l.code) === basePart && (restrictions == null || restrictions.indexOf(l.code) !== -1));
        }
    }
    if (language) {
        let customizations = null;
        // accessing `window` throws an error on desktop, and this file is imported by DesktopMain
        if (typeof window !== "undefined") {
            customizations = getWhitelabelCustomizations(window);
        }
        const germanCode = customizations?.germanLanguageCode;
        if (language.code === "de" && germanCode != null) {
            return downcast(germanCode);
        }
        else {
            return language.code;
        }
    }
    else {
        return null;
    }
}
function getBasePart(code) {
    const indexOfUnderscore = code.indexOf("_");
    if (indexOfUnderscore > 0) {
        return code.substring(0, indexOfUnderscore);
    }
    else {
        return code;
    }
}
export function getAvailableLanguageCode(code) {
    return getSubstitutedLanguageCode(code) || "en";
}
/**
 * pt_br -> pt-BR
 * @param code
 */
export function languageCodeToTag(code) {
    if (code === "de_sie") {
        return "de";
    }
    const indexOfUnderscore = code.indexOf("_");
    if (indexOfUnderscore === -1) {
        return code;
    }
    else {
        const [before, after] = code.split("_");
        return `${before}-${after.toUpperCase()}`;
    }
}
export const assertTranslation = downcast;
export const lang = new LanguageViewModel();
//# sourceMappingURL=LanguageViewModel.js.map