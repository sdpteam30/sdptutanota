import m from "mithril";
import { DropDownSelector } from "../../gui/base/DropDownSelector.js";
export class WhitelabelGermanLanguageFileSettings {
    constructor(vnode) { }
    view(vnode) {
        const { customGermanLanguageFile, onGermanLanguageFileChanged } = vnode.attrs;
        return this._renderDefaultGermanLanguageFileSettings(customGermanLanguageFile, onGermanLanguageFileChanged);
    }
    _renderDefaultGermanLanguageFileSettings(customGermanLanguageFile, onGermanLanguageFileChanged) {
        const items = [
            {
                name: "Deutsch (Du)",
                value: "de",
            },
            {
                name: "Deutsch (Sie)",
                value: "de_sie",
            },
        ];
        const selectedValue = customGermanLanguageFile ?? items[0].value;
        const defaultGermanLanguageFileDropDownAttrs = {
            label: "germanLanguageFile_label",
            items,
            selectedValue: selectedValue,
            selectionChangedHandler: onGermanLanguageFileChanged,
        };
        return m(DropDownSelector, defaultGermanLanguageFileDropDownAttrs);
    }
}
//# sourceMappingURL=WhitelabelGermanLanguageFileSettings.js.map