import { lang } from "../LanguageViewModel.js";
import m from "mithril";
import { ExternalLink } from "../../gui/base/ExternalLink.js";
/**
 * This component shows a "More info" message with a link to a given destination.
 */
export class MoreInfoLink {
    view(vnode) {
        let specialType;
        switch (vnode.attrs.link) {
            case "https://tuta.com" /* InfoLink.HomePage */:
                specialType = "me";
                break;
            case "https://tuta.com/imprint" /* InfoLink.About */:
                specialType = "license";
                break;
            case "https://tuta.com/privacy-policy" /* InfoLink.Privacy */:
                specialType = "privacy-policy";
                break;
            case "https://tuta.com/terms" /* InfoLink.Terms */:
            case "https://tuta.com/giftCardsTerms" /* InfoLink.GiftCardsTerms */:
                specialType = "terms-of-service";
                break;
            default:
                specialType = undefined;
                break;
        }
        return m("p", {
            class: `${vnode.attrs.class} ${vnode.attrs.isSmall ? "small" : ""}`,
        }, lang.get("moreInfo_msg") + " ", m("span.text-break", {
            class: vnode.attrs.isSmall ? "small" : "",
        }, [
            m(ExternalLink, {
                href: vnode.attrs.link,
                isCompanySite: true,
                specialType,
            }),
        ]));
    }
}
//# sourceMappingURL=MoreInfoLink.js.map