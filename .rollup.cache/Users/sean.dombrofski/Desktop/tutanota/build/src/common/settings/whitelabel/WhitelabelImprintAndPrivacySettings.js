import { Dialog } from "../../gui/base/Dialog";
import m from "mithril";
import { TextField } from "../../gui/base/TextField.js";
import { IconButton } from "../../gui/base/IconButton.js";
export class WhitelabelImprintAndPrivacySettings {
    view(vnode) {
        const { privacyStatementUrl, onPrivacyStatementUrlChanged, imprintUrl, onImprintUrlChanged } = vnode.attrs;
        return [
            this.renderWhitelabelImprintSetting(imprintUrl, onImprintUrlChanged),
            this.renderPrivacyPolicySetting(privacyStatementUrl, onPrivacyStatementUrlChanged),
        ];
    }
    renderPrivacyPolicySetting(privacyStatementUrl, onPrivacyStatementUrlChanged) {
        return m(TextField, {
            label: "privacyPolicyUrl_label",
            value: privacyStatementUrl,
            isReadOnly: true,
            injectionsRight: () => onPrivacyStatementUrlChanged
                ? m(IconButton, {
                    title: "edit_action",
                    click: () => this.editPrivacyStatementUrl(privacyStatementUrl, onPrivacyStatementUrlChanged),
                    icon: "Edit" /* Icons.Edit */,
                    size: 1 /* ButtonSize.Compact */,
                })
                : null,
        });
    }
    editPrivacyStatementUrl(privacyStatementUrl, onPrivacyStatementUrlChanged) {
        let dialog = Dialog.showActionDialog({
            title: "privacyLink_label",
            child: {
                view: () => m(TextField, {
                    label: "privacyPolicyUrl_label",
                    value: privacyStatementUrl,
                    type: "url" /* TextFieldType.Url */,
                    oninput: (value) => (privacyStatementUrl = value.trim()),
                }),
            },
            allowOkWithReturn: true,
            okAction: (ok) => {
                if (ok) {
                    onPrivacyStatementUrlChanged(privacyStatementUrl);
                    dialog.close();
                }
            },
        });
        return privacyStatementUrl;
    }
    renderWhitelabelImprintSetting(imprintUrl, onImprintUrlChanged) {
        return m(TextField, {
            label: "imprintUrl_label",
            value: imprintUrl,
            isReadOnly: true,
            injectionsRight: () => onImprintUrlChanged
                ? m(IconButton, {
                    title: "edit_action",
                    click: () => this.showEditImprintDialog(imprintUrl, onImprintUrlChanged),
                    icon: "Edit" /* Icons.Edit */,
                    size: 1 /* ButtonSize.Compact */,
                })
                : null,
        });
    }
    showEditImprintDialog(imprintUrl, onImprintUrlChanged) {
        const dialog = Dialog.showActionDialog({
            title: "imprintUrl_label",
            child: {
                view: () => m(TextField, {
                    label: "imprintUrl_label",
                    value: imprintUrl,
                    type: "url" /* TextFieldType.Url */,
                    oninput: (value) => (imprintUrl = value.trim()),
                }),
            },
            allowOkWithReturn: true,
            okAction: (ok) => {
                if (ok) {
                    onImprintUrlChanged(imprintUrl);
                    dialog.close();
                }
            },
        });
        return imprintUrl;
    }
}
//# sourceMappingURL=WhitelabelImprintAndPrivacySettings.js.map