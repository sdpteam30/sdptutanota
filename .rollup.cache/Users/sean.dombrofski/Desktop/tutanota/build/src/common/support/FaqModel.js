import { lang, LanguageViewModel } from "../misc/LanguageViewModel";
import { delay, downcast, LazyLoaded } from "@tutao/tutanota-utils";
import { search } from "../api/common/utils/PlainTextSearch";
import { ProgrammingError } from "../api/common/error/ProgrammingError.js";
import { htmlSanitizer } from "../misc/HtmlSanitizer.js";
const FAQ_PREFIX = "faq.";
const MARKDOWN_SUFFIX = "_markdown";
/**
 * Loads FAQ entries from tuta.com for different languages and allows searching
 *
 * NOTE: it's only exported for testing!
 */
export class FaqModel {
    list = null;
    currentLanguageCode = null;
    faqLanguages = null;
    lazyLoaded;
    websiteBaseUrl = "https://tuta.com";
    get faqLang() {
        if (this.faqLanguages == null) {
            throw new ProgrammingError("faq not initialized!");
        }
        return this.faqLanguages;
    }
    constructor() {
        this.lazyLoaded = new LazyLoaded(() => {
            return Promise.all([this.fetchFAQ("en"), this.fetchFAQ(lang.code)]).then(([defaultTranslations, currentLanguageTranslations]) => {
                if (defaultTranslations != null || currentLanguageTranslations != null) {
                    const faqLanguageViewModel = new LanguageViewModel();
                    faqLanguageViewModel.initWithTranslations(lang.code, lang.languageTag, defaultTranslations, currentLanguageTranslations);
                    this.faqLanguages = faqLanguageViewModel;
                }
            });
        });
    }
    async init(websiteBaseUrl) {
        //resetting the lazy reload whenever the language preference change to clear caching.
        if (this.currentLanguageCode !== lang.code) {
            this.lazyLoaded.reset();
        }
        this.websiteBaseUrl = websiteBaseUrl;
        await this.lazyLoaded.getAsync();
        this.getList();
    }
    /**
     * will return an AsyncGenerator yielding faq entries that contain the given query and mark the query occurrences
     * with <mark> tags. it is safe to insert the results of this call into the DOM.
     *
     */
    async *search(query) {
        const cleanQuery = query.trim();
        if (cleanQuery === "") {
            return [];
        }
        else {
            const searchableList = this.getList().map((item) => {
                return {
                    ...item,
                    // join tags to search with plaintext search
                    tags: item.tags.join(", "),
                };
            });
            // we could probably convert this to an AsyncGenerator to spread the load of searching the entries as well, but it's pretty snappy atm.
            const markedResults = search(cleanQuery, searchableList, ["tags", "title", "text"], true);
            for (const result of markedResults) {
                // this delay is needed to make the next iteration be scheduled on the next macro task.
                // just yielding/awaiting creates a micro task that doesn't let the event loop run.
                await delay(1);
                yield this.sanitizeEntry(result);
            }
        }
    }
    sanitizeEntry(result) {
        return {
            id: result.id,
            title: htmlSanitizer.sanitizeHTML(result.title).html,
            tags: result.tags.split(", ").map((tag) => htmlSanitizer.sanitizeHTML(tag).html),
            text: htmlSanitizer.sanitizeHTML(result.text, { blockExternalContent: false }).html,
        };
    }
    /**
     * fetch the entries for the given lang code from the web site
     */
    async fetchFAQ(langCode) {
        const faqPath = `${this.websiteBaseUrl}/faq-entries/${langCode}.json`;
        const translations = await fetch(faqPath)
            .then((response) => response.json())
            .then((language) => language.keys)
            .catch((error) => {
            console.log("Failed to fetch FAQ entries", error);
            return {};
        });
        return {
            code: langCode,
            keys: translations,
        };
    }
    /**
     * return the current faqEntry list if it fits the current language code
     * otherwise, recreate the list for current lang and then return it
     */
    getList() {
        if (this.list == null && this.faqLanguages == null) {
            return [];
        }
        if (this.list == null || this.currentLanguageCode !== lang.code) {
            this.currentLanguageCode = lang.code;
            const faqNames = Object.keys(this.faqLang.fallback.keys);
            this.list = faqNames
                .filter((key) => key.startsWith(FAQ_PREFIX) && key.endsWith(MARKDOWN_SUFFIX))
                .map((titleKey) => titleKey.substring(FAQ_PREFIX.length, titleKey.indexOf(MARKDOWN_SUFFIX)))
                .map((name) => this.createFAQ(name));
        }
        return this.list;
    }
    /**
     * convert the raw translations for an id to a structured FaqEntry
     */
    createFAQ(id) {
        return {
            id: id,
            title: this.faqLang.get(downcast(`faq.${id}_title`)),
            text: this.faqLang.get(downcast(`faq.${id}_markdown`)),
            tags: this.getTags(`faq.${id}_tags`).split(", "),
        };
    }
    getTags(id) {
        try {
            return this.faqLang.get(downcast(id));
        }
        catch (e) {
            return "";
        }
    }
}
export const faq = new FaqModel();
//# sourceMappingURL=FaqModel.js.map