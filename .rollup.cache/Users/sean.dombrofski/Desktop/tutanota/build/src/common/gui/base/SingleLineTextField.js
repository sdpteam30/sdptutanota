import m from "mithril";
import { Icon, IconSize } from "./Icon.js";
import { px, size } from "../size.js";
import { filterInt } from "@tutao/tutanota-utils";
export var InputMode;
(function (InputMode) {
    InputMode["NONE"] = "none";
    InputMode["NUMERIC"] = "numeric";
    InputMode["TEXT"] = "text";
})(InputMode || (InputMode = {}));
/**
 * Simple single line input field component
 * @see Component attributes: {SingleLineTextFieldAttrs}
 * @example
 * m(SingleLineTextField, {
 *     value: model.value,
 *     ariaLabel: lange.get("placeholder"),
 *     oninput: (newValue: string) => {
 *         model.value = newValue
 *     },
 *     placeholder: lang.get("placeholder"),
 *     disabled: model.isReadonly,
 *     classes: ["custom-text-color"], // Adding new styles
 *     style: {
 *         "font-size": px(size.font_size_base * 1.25) // Overriding the component style
 *     }
 * }),
 */
export class SingleLineTextField {
    domInput;
    view({ attrs }) {
        return attrs.leadingIcon ? this.renderInputWithIcon(attrs) : this.renderInput(attrs);
    }
    renderInputWithIcon(attrs) {
        if (!attrs.leadingIcon) {
            return;
        }
        const fontSizeString = attrs.style?.fontSize;
        const fontSizeNumber = fontSizeString ? filterInt(fontSizeString.replace("px", "")) : NaN;
        const fontSize = isNaN(fontSizeNumber) ? 16 : fontSizeNumber;
        let iconSize;
        let padding;
        if (fontSize > 16 && fontSize < 32) {
            iconSize = IconSize.Large;
            padding = size.icon_size_large;
        }
        else if (fontSize > 32) {
            iconSize = IconSize.XL;
            padding = size.icon_size_xl;
        }
        else {
            iconSize = IconSize.Medium;
            padding = size.icon_size_medium_large;
        }
        return m(".rel.flex.flex-grow", [
            m(".abs.pl-vpad-s.flex.items-center", { style: { top: 0, bottom: 0 } }, m(Icon, {
                size: iconSize,
                icon: attrs.leadingIcon.icon,
                style: { fill: attrs.leadingIcon.color },
            })),
            this.renderInput(attrs, px(padding + size.vpad)),
        ]);
    }
    renderInput(attrs, inputPadding) {
        return m("input.tutaui-text-field", {
            ariaLabel: attrs.ariaLabel,
            value: attrs.value,
            disabled: attrs.disabled ?? false,
            onblur: attrs.onblur,
            onfocus: attrs.onfocus,
            onkeydown: attrs.onkeydown,
            onclick: attrs.onclick,
            oninput: () => {
                if (!attrs.oninput) {
                    console.error("oninput fired without a handler function");
                    return;
                }
                attrs.oninput(this.domInput.value);
            },
            oncreate: (vnode) => {
                this.domInput = vnode.dom;
                if (attrs.oncreate) {
                    attrs.oncreate(vnode);
                }
            },
            placeholder: attrs.placeholder,
            class: this.resolveClasses(attrs.classes, attrs.disabled),
            style: {
                ...(inputPadding ? { paddingLeft: inputPadding } : {}),
                ...attrs.style,
            },
            type: attrs.inputMode === InputMode.NONE ? undefined : attrs.type,
            inputMode: attrs.inputMode,
            readonly: attrs.readonly,
            ...this.getInputProperties(attrs),
        });
    }
    getInputProperties(attrs) {
        if (attrs.type === "number" /* TextFieldType.Number */) {
            const numberAttrs = attrs;
            return { min: numberAttrs.min, max: numberAttrs.max };
        }
        return undefined;
    }
    resolveClasses(classes = [], disabled = false) {
        const classList = [...classes];
        if (disabled) {
            classList.push("disabled");
        }
        return classList.join(" ");
    }
}
//# sourceMappingURL=SingleLineTextField.js.map