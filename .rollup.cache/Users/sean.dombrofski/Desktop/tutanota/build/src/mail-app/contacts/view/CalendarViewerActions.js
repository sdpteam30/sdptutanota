import m from "mithril";
import { IconButton } from "../../../common/gui/base/IconButton.js";
import { keyManager } from "../../../common/misc/KeyManager.js";
import { Keys } from "../../../common/api/common/TutanotaConstants.js";
/**
 * Displays actions for calendar event in search view
 * Also registers shortcuts
 */
export class CalendarViewerActions {
    shortcuts = [];
    view({ attrs }) {
        const { event, onDelete, onEdit, onExport } = attrs;
        const actionButtons = [];
        if (event != null) {
            if (this.canEdit(event)) {
                actionButtons.push(m(IconButton, {
                    title: "edit_action",
                    click: () => onEdit(event),
                    icon: "Edit" /* Icons.Edit */,
                }));
            }
            if (this.canExport(event)) {
                actionButtons.push(m(IconButton, {
                    title: "export_action",
                    click: () => onExport(event),
                    icon: "Export" /* Icons.Export */,
                }));
            }
            if (this.canDelete(event)) {
                actionButtons.push(m(IconButton, {
                    title: "delete_action",
                    click: () => onDelete(event),
                    icon: "Trash" /* Icons.Trash */,
                }));
            }
        }
        return actionButtons;
    }
    onupdate(vnode) {
        keyManager.unregisterShortcuts(this.shortcuts);
        this.shortcuts.length = 0;
        const { event, onEdit, onDelete, onExport } = vnode.attrs;
        if (event == null)
            return;
        if (this.canEdit(event)) {
            this.shortcuts.push({
                key: Keys.E,
                exec: () => {
                    onEdit(event);
                },
                help: "edit_action",
            });
        }
        if (this.canExport(event)) {
            this.shortcuts.push({
                key: Keys.E,
                ctrlOrCmd: true,
                exec: () => {
                    onExport(event);
                },
                help: "export_action",
            });
        }
        keyManager.registerShortcuts(this.shortcuts);
    }
    onremove() {
        keyManager.unregisterShortcuts(this.shortcuts);
    }
    canExport(event) {
        return true;
    }
    canDelete(event) {
        return true;
    }
    canEdit(event) {
        return true;
    }
}
//# sourceMappingURL=CalendarViewerActions.js.map