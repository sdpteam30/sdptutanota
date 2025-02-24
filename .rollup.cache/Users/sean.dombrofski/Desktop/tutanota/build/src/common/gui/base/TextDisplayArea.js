import m from "mithril";
import { lang } from "../../misc/LanguageViewModel";
import { theme } from "../theme";
import { inputLineHeight, px, size } from "../size";
/**
 * Simple text area to display some preformated non-editable text.
 */
export class TextDisplayArea {
    view(vnode) {
        return m(".flex.flex-grow.flex-column.text.pt", [
            m("label.text-ellipsis.noselect.z1.i.pr-s", {
                style: {
                    fontSize: px(size.font_size_small),
                },
            }, lang.getTranslationText(vnode.attrs.label)),
            m(".text-pre.flex-grow", {
                style: {
                    borderBottom: `1px solid ${theme.content_border}`,
                    lineHeight: px(inputLineHeight),
                    minHeight: px(inputLineHeight),
                },
                isReadOnly: true,
            }, vnode.attrs.value),
        ]);
    }
}
//# sourceMappingURL=TextDisplayArea.js.map