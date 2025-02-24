import m from "mithril";
import { Keys } from "../../api/common/TutanotaConstants.js";
import { isKeyPressed } from "../../misc/KeyManager.js";
export class ExternalLink {
    view({ attrs }) {
        return m("a.underline", {
            href: attrs.href,
            target: "_blank",
            class: attrs.class,
            rel: `external noreferrer ${attrs.isCompanySite ? "" : "nofollow"} ${attrs.specialType ?? ""}`,
            // Allow keyboard usage in modals etc.
            tabindex: "0" /* TabIndex.Default */,
            onkeydown: (e) => {
                if (isKeyPressed(e.key, Keys.RETURN)) {
                    e.stopPropagation();
                }
            },
        }, attrs.text ?? attrs.href);
    }
}
//# sourceMappingURL=ExternalLink.js.map