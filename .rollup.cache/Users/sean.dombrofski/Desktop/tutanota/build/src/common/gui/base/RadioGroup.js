import { lang } from "../../misc/LanguageViewModel";
import m from "mithril";
import { isKeyPressed } from "../../misc/KeyManager.js";
import { Keys } from "../../api/common/TutanotaConstants.js";
/**
 * Component which shows selection for a single choice.
 */
export class RadioGroup {
    view({ attrs }) {
        return m("ul.unstyled-list.flex.col.gap-vpad", {
            ariaLabel: lang.getTranslationText(attrs.ariaLabel),
            role: "radiogroup" /* AriaRole.RadioGroup */,
        }, attrs.options.map((option) => this.renderOption(attrs.name, option, attrs.selectedOption, attrs.classes?.join(" "), attrs.onOptionSelected, attrs.injectionMap)));
    }
    renderOption(groupName, option, selectedOption, optionClass, onOptionSelected, injectionMap) {
        const name = lang.getTranslationText(groupName);
        const valueString = String(option.value);
        const isSelected = option.value === selectedOption;
        // IDs used to link the label and description for accessibility
        const optionId = `${name}-${valueString}`;
        // The wrapper is needed because <input> is self-closing and will not take the label as a child
        return m("li.flex.gap-vpad.cursor-pointer.full-width.flash", {
            class: optionClass ?? "",
            onclick: () => {
                console.log("Clicked?");
                onOptionSelected(option.value);
            },
        }, [
            m("input[type=radio].m-0.big-radio.content-accent-accent", {
                /* The `name` attribute defines the group the radio button belongs to. Not the name/label of the radio button itself.
                 * See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio#defining_a_radio_group
                 */
                name: lang.getTranslationText(groupName),
                value: valueString,
                id: optionId,
                // Handle changes in value from the attributes
                checked: isSelected ? true : null,
                onkeydown: (event) => {
                    if (isKeyPressed(event.key, Keys.RETURN)) {
                        onOptionSelected(option.value);
                    }
                    return true;
                },
            }),
            m(".flex.flex-column.full-width", [
                m("label.cursor-pointer", { for: optionId }, lang.getTranslationText(option.name)),
                this.getInjection(String(option.value), injectionMap),
            ]),
        ]);
    }
    getInjection(key, injectionMap) {
        if (!injectionMap || !injectionMap.has(key)) {
            return null;
        }
        return injectionMap.get(key);
    }
}
//# sourceMappingURL=RadioGroup.js.map