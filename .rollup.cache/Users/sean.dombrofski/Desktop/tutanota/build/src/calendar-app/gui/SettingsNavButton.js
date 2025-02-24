import { Icon, IconSize } from "../../common/gui/base/Icon.js";
import { lang } from "../../common/misc/LanguageViewModel.js";
import m from "mithril";
import { BaseButton } from "../../common/gui/base/buttons/BaseButton.js";
import { lazyStringValue } from "@tutao/tutanota-utils";
export class SettingsNavButton {
    view({ attrs }) {
        const child = m(BaseButton, {
            label: attrs.label,
            text: m("span.flex-grow", lang.getTranslationText(attrs.label)),
            icon: attrs.icon
                ? m(Icon, {
                    icon: attrs.icon?.(),
                    container: "div",
                    class: "center-h",
                    size: IconSize.Large,
                })
                : null,
            onclick: attrs.click,
            class: `flex justify-start full-width gap-vpad pl-vpad-m pr-m items-center`,
        }, m(Icon, {
            icon: "ArrowForward" /* Icons.ArrowForward */,
            container: "div",
            class: "center-h items-ends",
            size: IconSize.Large,
        }));
        if (!attrs.href) {
            return child;
        }
        return m(m.route.Link, {
            href: lazyStringValue(attrs.href),
            title: attrs.label,
            selector: `a.noselect.items-center.click.no-text-decoration ${attrs.class ?? ""}`,
        }, child);
    }
}
//# sourceMappingURL=SettingsNavButton.js.map