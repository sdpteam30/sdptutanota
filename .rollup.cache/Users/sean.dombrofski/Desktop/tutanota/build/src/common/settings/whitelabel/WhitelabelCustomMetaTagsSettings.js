import { TextField } from "../../gui/base/TextField.js";
import { Dialog } from "../../gui/base/Dialog";
import { lang } from "../../misc/LanguageViewModel";
import m from "mithril";
import { IconButton } from "../../gui/base/IconButton.js";
export class WhitelabelCustomMetaTagsSettings {
    view(vnode) {
        const { metaTags, onMetaTagsChanged } = vnode.attrs;
        const customMetaTagsDefined = metaTags.length > 0;
        return m(TextField, {
            label: "customMetaTags_label",
            value: customMetaTagsDefined ? lang.get("activated_label") : lang.get("deactivated_label"),
            isReadOnly: true,
            injectionsRight: () => onMetaTagsChanged
                ? m(IconButton, {
                    title: "edit_action",
                    click: () => this.showEditMetaTagsDialog(metaTags, onMetaTagsChanged),
                    icon: "Edit" /* Icons.Edit */,
                    size: 1 /* ButtonSize.Compact */,
                })
                : null,
        });
    }
    showEditMetaTagsDialog(metaTags, onMetaTagsChanged) {
        let dialog = Dialog.showActionDialog({
            title: "customMetaTags_label",
            child: {
                view: () => m(TextField, {
                    label: "customMetaTags_label",
                    value: metaTags,
                    type: "area" /* TextFieldType.Area */,
                    oninput: (value) => {
                        metaTags = value;
                    },
                }),
            },
            okAction: (ok) => {
                if (ok) {
                    onMetaTagsChanged(metaTags);
                    dialog.close();
                }
            },
        });
    }
}
//# sourceMappingURL=WhitelabelCustomMetaTagsSettings.js.map