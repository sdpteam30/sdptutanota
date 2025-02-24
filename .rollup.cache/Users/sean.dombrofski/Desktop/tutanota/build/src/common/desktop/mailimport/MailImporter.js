import { Dialog } from "../../gui/base/Dialog.js";
import { lang } from "../../misc/LanguageViewModel.js";
import { DialogHeaderBar } from "../../gui/base/DialogHeaderBar.js";
import m from "mithril";
import { DropDownSelector } from "../../gui/base/DropDownSelector.js";
import { repeat } from "@tutao/tutanota-utils";
/**
 * Shows a dialog with the users folders that are able to import mails.
 * @param indentedFolders List of user's folders
 * @param okAction
 */
export function folderSelectionDialog(indentedFolders, okAction) {
    let selectedIndentedFolder = indentedFolders[0];
    const dialog = new Dialog("EditSmall" /* DialogType.EditSmall */, {
        view: () => [
            m(DialogHeaderBar, {
                left: [
                    {
                        type: "secondary" /* ButtonType.Secondary */,
                        label: "cancel_action",
                        click: () => {
                            dialog.close();
                        },
                    },
                ],
                middle: "mailFolder_label",
                right: [
                    {
                        type: "primary" /* ButtonType.Primary */,
                        label: "pricing.select_action",
                        click: () => {
                            okAction(dialog, selectedIndentedFolder.folder);
                        },
                    },
                ],
            }),
            m(".dialog-max-height.plr-l.pt.pb.text-break.scroll", [
                m(".text-break.selectable", lang.get("mailImportSelection_label")),
                m(DropDownSelector, {
                    label: "mailFolder_label",
                    items: indentedFolders.map((mailFolder) => {
                        return {
                            name: repeat(".", mailFolder.level) + mailFolder.folder.name,
                            value: mailFolder.folder,
                        };
                    }),
                    selectedValue: selectedIndentedFolder.folder,
                    selectionChangedHandler: (v) => (selectedIndentedFolder.folder = v),
                    icon: "Expand" /* BootIcons.Expand */,
                }),
            ]),
        ],
    }).show();
}
//# sourceMappingURL=MailImporter.js.map