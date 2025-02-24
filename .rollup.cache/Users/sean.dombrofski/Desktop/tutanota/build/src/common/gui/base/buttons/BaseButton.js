import m from "mithril";
import { assertNotNull } from "@tutao/tutanota-utils";
import { lang } from "../../../misc/LanguageViewModel.js";
export class BaseButton {
    dom = null;
    view({ attrs, children }) {
        const disabled = attrs.disabled ? true : null;
        const pressed = booleanToAttributeValue(attrs.pressed);
        const selected = booleanToAttributeValue(attrs.selected);
        return m("button", {
            title: lang.getTranslationText(attrs.label),
            disabled,
            "aria-disabled": disabled,
            pressed,
            "aria-pressed": pressed,
            "aria-selected": selected,
            onclick: (event) => attrs.onclick(event, assertNotNull(this.dom)),
            onkeydown: attrs.onkeydown,
            class: attrs.class,
            style: attrs.style,
            role: attrs.role,
            "data-testid": `btn:${lang.getTestId(attrs.label)}`,
        }, [attrs.icon ? this.renderIcon(attrs.icon, attrs.iconWrapperSelector) : null, attrs.text ?? null, children]);
    }
    renderIcon(icon, selector) {
        return m(selector ?? "span", { ariaHidden: true, tabindex: "-1" /* TabIndex.Programmatic */ }, icon);
    }
    oncreate(vnode) {
        this.dom = vnode.dom;
    }
}
function booleanToAttributeValue(value) {
    return value != null ? String(value) : null;
}
//# sourceMappingURL=BaseButton.js.map