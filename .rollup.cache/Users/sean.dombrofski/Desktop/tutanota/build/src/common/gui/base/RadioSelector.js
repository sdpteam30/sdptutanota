import { lang } from "../../misc/LanguageViewModel";
import m from "mithril";
import { theme } from "../theme";
/**
 * Component which shows selection for a single choice.
 */
export class RadioSelector {
    view({ attrs }) {
        return attrs.options.map((option) => this.renderOption(attrs.name, option, attrs.selectedOption, attrs.class, attrs.onOptionSelected));
    }
    renderOption(groupName, option, selectedOption, optionClass, onOptionSelected) {
        const name = lang.getTranslationText(groupName);
        const valueString = String(option.value);
        const isSelected = option.value === selectedOption;
        // IDs used to link the label and description for accessibility
        const optionId = name + valueString;
        const attrClasses = optionClass != null ? " " + optionClass : "";
        // The wrapper is needed because <input> is self-closing and will not take the label as a child
        return m(".state-bg.border.border-radius.flex.items-center.mb.pl-l.pr", {
            // Make the option the same size as a button if a description is not given
            class: "button-min-width button-min-height" + attrClasses,
            style: {
                borderColor: isSelected ? theme.content_accent : theme.content_border,
                borderWidth: "2px",
                height: "fit-content",
            },
            onclick: () => {
                onOptionSelected(option.value);
            },
        }, [
            m("input[type=radio].m-0.mr-button.content-accent-accent", {
                /* The `name` attribute defines the group the radio button belongs to. Not the name/label of the radio button itself.
                 * See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio#defining_a_radio_group
                 */
                name: lang.getTranslationText(groupName),
                value: valueString,
                id: optionId,
                // Handle changes in value from the attributes
                checked: isSelected ? true : null,
            }),
            m("label.b.left.pt-xs.pb-xs", { for: optionId }, lang.getTranslationText(option.name)),
        ]);
    }
}
//# sourceMappingURL=RadioSelector.js.map