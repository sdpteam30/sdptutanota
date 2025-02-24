import m from "mithril";
/**
 * Simple single line input field component
 * @see Component attributes: {TextAreaAttrs}
 * @example
 * m(TextArea, {
 *     value: model.value,
 *     oninput: (newValue: string) => {
 *         model.value = newValue
 *     },
 *     placeholder: "placeholder",
 *     disabled: model.isReadonly,
 *     classes: ["custom-font-size"], // Adding new styles
 *     style: {
 *         "font-size": px(size.font_size_base * 1.25) // Overriding the component style
 *     }
 * }),
 */
export class TextArea {
    domInput;
    oncreate(vnode) {
        this.domInput = vnode.dom;
    }
    view({ attrs }) {
        return m("textarea.tutaui-text-field", {
            value: attrs.value,
            rows: attrs.maxLines ?? 3,
            disabled: attrs.disabled ?? false,
            oninput: () => {
                if (!attrs.oninput) {
                    console.error("oninput fired without a handler function");
                    return;
                }
                attrs.oninput(this.domInput.value);
            },
            placeholder: attrs.placeholder,
            class: this.resolveClasses(attrs.classes, attrs.disabled),
            style: {
                ...attrs.style,
                resize: !attrs.resizable ? "none" : "vertical",
            },
        });
    }
    resolveClasses(classes = [], disabled = false) {
        const classList = [...classes];
        if (disabled) {
            classList.push("disabled");
        }
        return classList.join(" ");
    }
}
//# sourceMappingURL=TextArea.js.map