import m from "mithril";
import { DropDownSelector } from "../../gui/base/DropDownSelector.js";
import { Dialog } from "../../gui/base/Dialog";
import { TextField } from "../../gui/base/TextField.js";
import { IconButton } from "../../gui/base/IconButton.js";
export class WhitelabelRegistrationSettings {
    constructor(vnode) { }
    view(vnode) {
        const { currentRegistrationDomain, possibleRegistrationDomains, onRegistrationDomainSelected, whitelabelCode, onWhitelabelCodeChanged } = vnode.attrs;
        return m("", [
            this._renderRegistrationDomain(currentRegistrationDomain, possibleRegistrationDomains, onRegistrationDomainSelected),
            this._renderWhitelabelCodeField(whitelabelCode, onWhitelabelCodeChanged),
        ]);
    }
    _renderRegistrationDomain(currentRegistrationDomain, possibleRegistrationDomains, onRegistrationDomainSelected) {
        return m(DropDownSelector, {
            label: "whitelabelRegistrationEmailDomain_label",
            selectedValue: currentRegistrationDomain,
            items: possibleRegistrationDomains,
            selectionChangedHandler: onRegistrationDomainSelected
                ? (selectedValue) => {
                    onRegistrationDomainSelected(selectedValue);
                }
                : null,
            disabled: !onRegistrationDomainSelected,
        });
    }
    _renderWhitelabelCodeField(whitelabelCode, onWhitelabelCodeChanged) {
        return m(TextField, {
            label: "whitelabelRegistrationCode_label",
            value: whitelabelCode,
            isReadOnly: true,
            injectionsRight: () => onWhitelabelCodeChanged
                ? m(IconButton, {
                    title: "edit_action",
                    click: () => this.editRegistrationCode(whitelabelCode, onWhitelabelCodeChanged),
                    icon: "Edit" /* Icons.Edit */,
                    size: 1 /* ButtonSize.Compact */,
                })
                : null,
        });
    }
    editRegistrationCode(whitelabelCode, onWhitelabelCodeChanged) {
        Dialog.showTextInputDialog({
            title: "edit_action",
            label: "whitelabelRegistrationCode_label",
            defaultValue: whitelabelCode,
        }).then((newCode) => {
            onWhitelabelCodeChanged(newCode);
        });
    }
}
//# sourceMappingURL=WhitelabelRegistrationSettings.js.map