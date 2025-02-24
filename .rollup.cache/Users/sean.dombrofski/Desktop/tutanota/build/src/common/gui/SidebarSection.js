import m from "mithril";
import { lang } from "../misc/LanguageViewModel";
import { theme } from "./theme";
import stream from "mithril/stream";
export class SidebarSection {
    expanded = stream(true);
    view(vnode) {
        const { name, button, hideIfEmpty } = vnode.attrs;
        const content = vnode.children;
        if (hideIfEmpty && content == false)
            return null; // Using loose equality to check if children has any contents
        return m(".sidebar-section", {
            "data-testid": `section:${lang.getTestId(name)}`,
            style: {
                color: theme.navigation_button,
            },
        }, [
            m(".folder-row.flex-space-between.plr-button.pt-s.button-height", [
                m("small.b.align-self-center.text-ellipsis.plr-button", lang.getTranslationText(name).toLocaleUpperCase()),
                button ?? null,
            ]),
            content,
        ]);
    }
}
//# sourceMappingURL=SidebarSection.js.map