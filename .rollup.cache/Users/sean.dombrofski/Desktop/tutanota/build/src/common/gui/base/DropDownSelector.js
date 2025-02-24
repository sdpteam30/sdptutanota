import m from "mithril";
import { TextField } from "./TextField.js";
import { createDropdown } from "./Dropdown.js";
import { noOp } from "@tutao/tutanota-utils";
import { lang } from "../../misc/LanguageViewModel";
import { getOperatingClasses } from "./GuiUtils";
import { assertMainOrNode } from "../../api/common/Env";
import { IconButton } from "./IconButton.js";
assertMainOrNode();
export class DropDownSelector {
    view(vnode) {
        const a = vnode.attrs;
        return m(TextField, {
            label: a.label,
            value: this.valueToText(a, a.selectedValue) || "",
            helpLabel: a.helpLabel,
            isReadOnly: true,
            onclick: a.disabled ? noOp : this.createDropdown(a),
            class: "click " + (a.class == null ? "mt" : a.class) + " " + getOperatingClasses(a.disabled),
            style: a.style,
            injectionsRight: () => a.disabled
                ? null
                : // This whole thing with the button is not ideal. We shouldn't have a proper button with its own state layer, we should have the whole
                    // selector be interactive. Just putting an icon here doesn't work either because the selector disappears from tabindex even if you set it
                    // explicitly (at least in FF).
                    // Ideally we should also set correct role ("option") and highlight only parts of what is not text field (without help text in the bottom.
                    // We could hack some of this in here, but we should probably redo it from scratch with the right HTML structure.
                    m(".flex.items-center.justify-center", {
                        style: {
                            width: "30px",
                            height: "30px",
                        },
                    }, m(IconButton, {
                        icon: a.icon ? a.icon : "Expand" /* BootIcons.Expand */,
                        title: "show_action",
                        click: a.disabled ? noOp : this.createDropdown(a),
                        size: 1 /* ButtonSize.Compact */,
                    })),
            doShowBorder: a.doShowBorder,
        });
    }
    createDropdown(a) {
        return createDropdown({
            lazyButtons: () => {
                return a.items
                    .filter((item) => item.selectable !== false)
                    .map((item) => {
                    return {
                        label: lang.makeTranslation(item.name, item.name),
                        click: () => {
                            a.selectionChangedHandler?.(item.value);
                            m.redraw();
                        },
                        selected: a.selectedValue === item.value,
                    };
                });
            },
            width: a.dropdownWidth,
        });
    }
    valueToText(a, value) {
        if (a.selectedValueDisplay) {
            return a.selectedValueDisplay;
        }
        const selectedItem = a.items.find((item) => item.value === a.selectedValue);
        if (selectedItem) {
            return selectedItem.name;
        }
        else {
            console.log(`Dropdown ${lang.getTranslationText(a.label)} couldn't find element for value: ${String(JSON.stringify(value))}`);
            return null;
        }
    }
}
//# sourceMappingURL=DropDownSelector.js.map