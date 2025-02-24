import m from "mithril";
import { Keys } from "../../api/common/TutanotaConstants.js";
import { isKeyPressed } from "../../misc/KeyManager.js";
/**
 * Switch component with variants
 * @see Component attributes: {SwitchAttrs}
 * @example
 * m(Switch,
 *     {
 *         classes: ["my-custom-switch-class"],
 *         checked: this.checked,
 *         onclick: (checked: boolean) => {
 *             this.checked = checked
 *             console.log(this.checked)
 *         },
 *         togglePillPosition: "right",
 *         ariaLabel: "Test Switch",
 *         disabled: false,
 *         variant: "normal",
 *     },
 *     "My label",
 * ),
 */
export class Switch {
    checkboxDom;
    view({ attrs: { disabled, variant, ariaLabel, checked, onclick, togglePillPosition, classes }, children }) {
        const childrenArr = [children, this.buildTogglePillComponent(checked, onclick, disabled)];
        if (togglePillPosition === "left") {
            childrenArr.reverse();
        }
        return m("label.tutaui-switch.flash", {
            class: this.resolveClasses(classes, disabled, variant),
            role: "switch" /* AriaRole.Switch */,
            ariaLabel: ariaLabel,
            ariaChecked: String(checked),
            ariaDisabled: disabled ? "true" : undefined,
            tabIndex: Number(disabled ? "-1" /* TabIndex.Programmatic */ : "0" /* TabIndex.Default */),
            onkeydown: (e) => {
                if (isKeyPressed(e.key, Keys.SPACE, Keys.RETURN)) {
                    e.preventDefault();
                    this.checkboxDom?.click();
                }
            },
        }, childrenArr);
    }
    buildTogglePillComponent(checked = false, onclick, disabled) {
        return m("span.tutaui-toggle-pill", {
            class: this.checkboxDom?.checked ? "checked" : "unchecked",
        }, m("input[type='checkbox']", {
            role: "switch" /* AriaRole.Switch */,
            onclick: () => {
                onclick(this.checkboxDom?.checked ?? false);
            },
            oncreate: ({ dom }) => {
                this.checkboxDom = dom;
                this.checkboxDom.checked = checked;
            },
            tabIndex: "-1" /* TabIndex.Programmatic */,
            disabled: disabled ? true : undefined,
        }));
    }
    resolveClasses(classes = [], disabled = false, variant = "normal") {
        const classList = [...classes];
        if (disabled)
            classList.push("disabled", "click-disabled");
        else
            classList.push("click");
        if (variant === "expanded")
            classList.push("justify-between", "full-width");
        else
            classList.push("fit-content");
        return classList.join(" ");
    }
}
//# sourceMappingURL=Switch.js.map