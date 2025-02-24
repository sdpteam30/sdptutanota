import { Icon, IconSize } from "../Icon.js";
import { lang } from "../../../misc/LanguageViewModel.js";
import m from "mithril";
import { Card } from "../Card.js";
import { getColors } from "../Button.js";
import { BaseButton } from "./BaseButton.js";
/**
 * A dark NavButton-like button with an arrow.
 */
export class SectionButton {
    view(vnode) {
        const { leftIcon, injectionLeft, onclick, injectionRight, rightIcon, isDisabled, text } = vnode.attrs;
        const leftPart = m.fragment({}, [
            leftIcon == null
                ? null
                : m(Icon, {
                    icon: leftIcon.icon,
                    style: { fill: leftIcon.fill ?? getColors("content" /* ButtonColor.Content */).button },
                    title: lang.get(leftIcon.title),
                    size: IconSize.Medium,
                }),
            injectionLeft == null ? null : injectionLeft,
        ]);
        const rightPart = m.fragment({}, [
            injectionRight == null ? null : injectionRight,
            rightIcon == null
                ? m(Icon, {
                    icon: "ArrowForward" /* Icons.ArrowForward */,
                    style: { fill: getColors("content" /* ButtonColor.Content */).button },
                    title: lang.get("next_action"),
                    size: IconSize.Medium,
                })
                : m(Icon, {
                    icon: rightIcon.icon,
                    style: { fill: rightIcon.fill ?? getColors("content" /* ButtonColor.Content */).button },
                    title: lang.get(rightIcon.title),
                    size: IconSize.Medium,
                }),
        ]);
        return m(BaseButton, {
            class: `flash button-min-height flex items-center full-width ${vnode.attrs.classes ?? ""}`,
            label: text,
            disabled: isDisabled,
            role: "menuitem" /* AriaRole.MenuItem */,
            onclick,
        }, m(Card, { classes: ["flex", "justify-between", "flex-grow", "items-start"] }, [
            leftIcon || injectionLeft ? m(".flex.items-center.mr-s", [leftPart]) : null,
            m("span.flex-grow.full-width.white-space", lang.getTranslationText(text)),
            rightPart,
        ]));
    }
}
//# sourceMappingURL=SectionButton.js.map