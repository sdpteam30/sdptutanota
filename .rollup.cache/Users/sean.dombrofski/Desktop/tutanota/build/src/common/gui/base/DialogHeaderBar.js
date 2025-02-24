import m from "mithril";
import { Button } from "./Button.js";
import { resolveMaybeLazy } from "@tutao/tutanota-utils";
import { lang } from "../../misc/LanguageViewModel.js";
/**
 * An action bar is a bar that contains buttons (either on the left or on the right).
 */
export class DialogHeaderBar {
    view(vnode) {
        const a = Object.assign({}, {
            left: [],
            right: [],
        }, vnode.attrs);
        let columnClass = a.middle ? ".flex-third.overflow-hidden" : ".flex-half.overflow-hidden";
        return m(".dialog-header.plr-l.flex-space-between.dialog-header-line-height", {
            oncreate: ({ dom }) => {
                if (a.create)
                    a.create(dom);
            },
            onremove: () => {
                if (a.remove)
                    a.remove();
            },
            class: vnode.attrs.class,
        }, [
            m(columnClass + ".ml-negative-s", resolveMaybeLazy(a.left).map((a) => m(Button, a))), // ellipsis is not working if the text is directly in the flex element, so create a child div for it
            a.middle
                ? m("#dialog-title.flex-third-middle.overflow-hidden.flex.justify-center.items-center.b", {
                    "data-testid": `dialog:${lang.getTestId(a.middle)}`,
                }, [m(".text-ellipsis", lang.getTranslationText(a.middle))])
                : null,
            m(columnClass + ".mr-negative-s.flex.justify-end", resolveMaybeLazy(a.right).map((a) => m(Button, a))),
        ]);
    }
}
//# sourceMappingURL=DialogHeaderBar.js.map