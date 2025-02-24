import { lang } from "../misc/LanguageViewModel.js";
import m from "mithril";
import { ExpanderButton, ExpanderPanel } from "../gui/base/Expander.js";
import { ifAllowedTutaLinks } from "../gui/base/GuiUtils.js";
import { locator } from "../api/main/CommonLocator.js";
export class SettingsExpander {
    oncreate(vnode) {
        vnode.attrs.expanded.map((expanded) => {
            if (expanded && vnode.attrs.onExpand) {
                vnode.attrs.onExpand();
            }
        });
    }
    view(vnode) {
        const { title, buttonText, infoLinkId, infoMsg, expanded } = vnode.attrs;
        return [
            m(".flex-space-between.items-center.mb-s.mt-l", [
                m(".h4", lang.getTranslationText(title)),
                m(ExpanderButton, {
                    label: buttonText || "show_action",
                    expanded: expanded(),
                    onExpandedChange: expanded,
                }),
            ]),
            m(ExpanderPanel, {
                expanded: expanded(),
            }, vnode.children),
            infoMsg ? m("small", lang.getTranslationText(infoMsg)) : null,
            infoLinkId ? ifAllowedTutaLinks(locator.logins, infoLinkId, (link) => m("small.text-break", [m(`a[href=${link}][target=_blank]`, link)])) : null,
        ];
    }
}
//# sourceMappingURL=SettingsExpander.js.map