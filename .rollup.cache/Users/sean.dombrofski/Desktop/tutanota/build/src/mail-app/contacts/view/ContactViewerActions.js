import m from "mithril";
import { IconButton } from "../../../common/gui/base/IconButton.js";
import { keyManager } from "../../../common/misc/KeyManager.js";
import { Keys } from "../../../common/api/common/TutanotaConstants.js";
/**
 * Displays actions for contact or multiple contacts.
 * Also registers shortcuts
 */
export class ContactViewerActions {
    shortcuts = [];
    view({ attrs }) {
        const { contacts, onDelete, onEdit, onMerge, onExport } = attrs;
        const actionButtons = [];
        if (this.canEdit(contacts)) {
            actionButtons.push(m(IconButton, {
                title: "edit_action",
                click: () => onEdit(contacts[0]),
                icon: "Edit" /* Icons.Edit */,
            }));
        }
        else if (this.canMerge(contacts)) {
            actionButtons.push(m(IconButton, {
                title: "merge_action",
                click: () => onMerge(contacts[0], contacts[1]),
                icon: "People" /* Icons.People */,
            }));
        }
        if (this.canExport(contacts)) {
            actionButtons.push(m(IconButton, {
                title: "export_action",
                click: () => onExport(contacts),
                icon: "Export" /* Icons.Export */,
            }));
        }
        if (this.canDelete(contacts)) {
            actionButtons.push(m(IconButton, {
                title: "delete_action",
                click: () => onDelete(contacts),
                icon: "Trash" /* Icons.Trash */,
            }));
        }
        return actionButtons;
    }
    onupdate(vnode) {
        keyManager.unregisterShortcuts(this.shortcuts);
        this.shortcuts.length = 0;
        const { contacts, onEdit, onDelete, onMerge, onExport } = vnode.attrs;
        if (this.canEdit(contacts)) {
            this.shortcuts.push({
                key: Keys.E,
                exec: () => {
                    onEdit(contacts[0]);
                },
                help: "edit_action",
            });
        }
        if (this.canMerge(contacts)) {
            this.shortcuts.push({
                key: Keys.M,
                ctrlOrCmd: true,
                exec: () => {
                    onMerge(contacts[0], contacts[1]);
                },
                help: "merge_action",
            });
        }
        if (this.canExport(contacts)) {
            this.shortcuts.push({
                key: Keys.E,
                ctrlOrCmd: true,
                exec: () => {
                    onExport(contacts);
                },
                help: "export_action",
            });
        }
        keyManager.registerShortcuts(this.shortcuts);
    }
    onremove() {
        keyManager.unregisterShortcuts(this.shortcuts);
    }
    canExport(contacts) {
        return contacts.length > 0;
    }
    canMerge(contacts) {
        return contacts.length === 2;
    }
    canDelete(contacts) {
        return contacts.length > 0;
    }
    canEdit(contacts) {
        return contacts.length === 1;
    }
}
//# sourceMappingURL=ContactViewerActions.js.map