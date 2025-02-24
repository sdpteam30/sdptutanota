import m from "mithril";
import { px, size } from "../../../common/gui/size";
import { Keys } from "../../../common/api/common/TutanotaConstants";
import { isKeyPressed } from "../../../common/misc/KeyManager";
import { TEMPLATE_POPUP_HEIGHT } from "./TemplateConstants.js";
import { memoized } from "@tutao/tutanota-utils";
import { htmlSanitizer } from "../../../common/misc/HtmlSanitizer.js";
import { theme } from "../../../common/gui/theme.js";
export class TemplateExpander {
    sanitizedText = memoized((text) => htmlSanitizer.sanitizeHTML(text, {
        blockExternalContent: false,
        allowRelativeLinks: true,
    }).html);
    view({ attrs }) {
        const { model, template } = attrs;
        const selectedContent = model.getSelectedContent();
        return m(".flex.flex-column.flex-grow.scroll.ml-s", {
            style: {
                // maxHeight has to be set, because otherwise the content would overflow outside the flexbox (-44 because of header height)
                maxHeight: px(TEMPLATE_POPUP_HEIGHT - size.button_height),
            },
            onkeydown: (e) => {
                if (isKeyPressed(e.key, Keys.TAB)) {
                    e.preventDefault();
                }
            },
        }, [
            m(".text-break.smaller.b.text-center", {
                style: {
                    "border-bottom": `1px solid ${theme.content_border}`,
                },
            }, template.title),
            m(".text-break.flex-grow.pr.overflow-y-visible.pt", selectedContent ? m.trust(this.sanitizedText(selectedContent.text)) : null),
        ]);
    }
}
//# sourceMappingURL=TemplateExpander.js.map