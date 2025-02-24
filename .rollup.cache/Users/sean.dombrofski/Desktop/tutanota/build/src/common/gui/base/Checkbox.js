import m from "mithril";
import { BootIconsSvg } from "./icons/BootIcons";
import { lang } from "../../misc/LanguageViewModel";
import { theme } from "../theme.js";
import { encodeSVG, getOperatingClasses } from "./GuiUtils.js";
export class Checkbox {
    focused = false;
    _domInput = null;
    static checkedIcon = encodeSVG(BootIconsSvg["CheckboxSelected" /* BootIcons.CheckboxSelected */]);
    static uncheckedIcon = encodeSVG(BootIconsSvg["Checkbox" /* BootIcons.Checkbox */]);
    view(vnode) {
        const a = vnode.attrs;
        const helpLabelText = lang.getTranslationText(a.helpLabel ? a.helpLabel : "emptyString_msg");
        const helpLabel = a.helpLabel ? m(`small.block.content-fg${Checkbox.getBreakClass(helpLabelText)}`, helpLabelText) : [];
        const userClasses = a.class == null ? "" : " " + a.class;
        return m(`.pt`, {
            "aria-disabled": String(a.disabled),
            class: getOperatingClasses(a.disabled, "click flash") + userClasses,
            onclick: (e) => {
                if (e.target !== this._domInput) {
                    this.toggle(e, a); // event is bubbling in IE besides we invoke e.stopPropagation()
                }
            },
        }, m(`label${Checkbox.getBreakClass(a.label())}`, {
            class: `${this.focused ? "content-accent-fg" : "content-fg"} ${getOperatingClasses(a.disabled, "click")}`,
        }, [
            m("input[type=checkbox].icon.checkbox-override", {
                oncreate: (vnode) => (this._domInput = vnode.dom),
                onchange: (e) => this.toggle(e, a),
                checked: a.checked,
                onfocus: () => (this.focused = true),
                onblur: () => (this.focused = false),
                class: getOperatingClasses(a.disabled, "click"),
                style: {
                    cursor: a.disabled ? "default" : "pointer",
                    "background-color": theme.content_accent,
                    "mask-image": `url("${a.checked ? Checkbox.checkedIcon : Checkbox.uncheckedIcon}")`,
                },
                disabled: a.disabled,
            }),
            a.label(),
            helpLabel,
        ]));
    }
    static getBreakClass(text) {
        if (typeof text !== "string" || text.includes(" ")) {
            return ".break-word";
        }
        else {
            return ".break-all";
        }
    }
    toggle(event, attrs) {
        if (!attrs.disabled) {
            attrs.onChecked(!attrs.checked);
        }
        event.stopPropagation();
        if (this._domInput) {
            this._domInput.focus();
        }
    }
}
//# sourceMappingURL=Checkbox.js.map