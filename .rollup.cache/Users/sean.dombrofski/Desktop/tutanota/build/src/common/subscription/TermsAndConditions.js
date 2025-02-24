/**
 * The most recently published version of the terms and conditions
 */
import m from "mithril";
import { lang } from "../misc/LanguageViewModel";
import { isApp } from "../api/common/Env";
import { requestFromWebsite } from "../misc/Website";
import { Dialog } from "../gui/base/Dialog";
import { htmlSanitizer } from "../misc/HtmlSanitizer";
import { locator } from "../api/main/CommonLocator.js";
/**
 * The most up-to-date versions of the terms and conditions, privacy statement, and gift card terms
 * must be in sync with the website
 */
export const CURRENT_TERMS_VERSION = "3.2";
export const CURRENT_PRIVACY_VERSION = "3.1";
export const CURRENT_GIFT_CARD_TERMS_VERSION = "1.0";
/**
 * Show a link to the terms and conditions page on the website.
 * In the mobile apps, it will instead open a dialog containing the text
 */
export function renderTermsAndConditionsButton(terms, version) {
    let label;
    let link;
    switch (terms) {
        case "giftCardsTerms-entries" /* TermsSection.GiftCards */:
            label = lang.get("giftCardTerms_label");
            link = "https://tuta.com/giftCardsTerms" /* InfoLink.GiftCardsTerms */;
            break;
        case "terms-entries" /* TermsSection.Terms */:
            label = lang.get("termsAndConditionsLink_label");
            link = "https://tuta.com/terms" /* InfoLink.Terms */;
            break;
        case "privacy-policy-entries" /* TermsSection.Privacy */:
            label = lang.get("privacyLink_label");
            link = "https://tuta.com/privacy-policy" /* InfoLink.Privacy */;
            break;
    }
    return m(`a[href=${link}][target=_blank]`, {
        onclick: (e) => {
            if (isApp()) {
                showServiceTerms(terms, version);
                e.preventDefault();
            }
        },
    }, label);
}
export async function showServiceTerms(section, version) {
    const path = `/${section}/${version}.json`;
    const termsFromWebsite = await requestFromWebsite(path, locator.domainConfigProvider().getCurrentDomainConfig()).then((res) => res.json());
    let visibleLang = lang.code.startsWith("de") ? "de" : "en";
    let dialog;
    let sanitizedTerms;
    function getSection() {
        return htmlSanitizer.sanitizeHTML(termsFromWebsite[visibleLang], {
            blockExternalContent: false,
        }).html;
    }
    let headerBarAttrs = {
        left: [
            {
                label: lang.makeTranslation("lang_toggle", "EN/DE"),
                click: () => {
                    visibleLang = visibleLang === "de" ? "en" : "de";
                    sanitizedTerms = getSection();
                    m.redraw();
                },
                type: "secondary" /* ButtonType.Secondary */,
            },
        ],
        right: [
            {
                label: "ok_action",
                click: () => dialog.close(),
                type: "primary" /* ButtonType.Primary */,
            },
        ],
    };
    sanitizedTerms = getSection();
    dialog = Dialog.largeDialog(headerBarAttrs, {
        view: () => m(".text-break", m.trust(sanitizedTerms)),
    }).show();
}
//# sourceMappingURL=TermsAndConditions.js.map