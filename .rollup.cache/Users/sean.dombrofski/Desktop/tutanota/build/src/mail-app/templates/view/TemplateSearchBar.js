import m from "mithril";
import { lang } from "../../../common/misc/LanguageViewModel";
import { inputLineHeight, px } from "../../../common/gui/size";
import { keyboardEventToKeyPress } from "../../../common/misc/KeyManager";
import { theme } from "../../../common/gui/theme";
import { assertNotNull } from "@tutao/tutanota-utils";
export class TemplateSearchBar {
    domInput = null;
    view(vnode) {
        const a = vnode.attrs;
        return m(".inputWrapper.pt-xs.pb-xs", {
            style: {
                "border-bottom": `1px solid ${theme.content_border}`,
            },
        }, this._getInputField(a));
    }
    _getInputField(a) {
        return m("input.input", {
            placeholder: a.placeholder && lang.getTranslationText(a.placeholder),
            oncreate: (vnode) => {
                this.domInput = vnode.dom;
                this.domInput.value = a.value();
                this.domInput.focus();
            },
            onkeydown: (e) => {
                const key = keyboardEventToKeyPress(e);
                return a.keyHandler != null ? a.keyHandler(key) : true;
            },
            oninput: () => {
                const domInput = assertNotNull(this.domInput);
                a.value(domInput.value);
                a.oninput?.(domInput.value, domInput);
            },
            style: {
                lineHeight: px(inputLineHeight),
            },
        });
    }
}
//# sourceMappingURL=TemplateSearchBar.js.map