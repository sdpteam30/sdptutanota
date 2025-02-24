import { Dialog } from "../../../common/gui/base/Dialog.js";
import m from "mithril";
import { Checkbox } from "../../../common/gui/base/Checkbox.js";
import { defer } from "@tutao/tutanota-utils";
import { lang } from "../../../common/misc/LanguageViewModel.js";
/**
 * Displays a list of contact books to import contacts from.
 */
export class ImportNativeContactBooksDialog {
    contactBooks;
    selectedContactBooks;
    constructor(contactBooks) {
        this.contactBooks = contactBooks;
        this.selectedContactBooks = new Set(this.contactBooks.map((book) => book.id));
    }
    show() {
        const deferred = defer();
        const dialog = Dialog.showActionDialog({
            title: "importContacts_label",
            type: "EditMedium" /* DialogType.EditMedium */,
            allowCancel: true,
            child: () => {
                return m(".scroll", this.contactBooks.map((book) => this.renderRow(book)));
            },
            okAction: () => {
                deferred.resolve(this.contactBooks.filter((book) => this.selectedContactBooks.has(book.id)));
                dialog.close();
            },
            cancelAction: () => deferred.resolve(null),
        });
        return deferred.promise;
    }
    renderRow(book) {
        const checked = this.selectedContactBooks.has(book.id);
        return m(".flex.items-center", m(Checkbox, {
            checked,
            label: () => book.name ?? lang.get("pushIdentifierCurrentDevice_label"),
            onChecked: () => {
                if (checked) {
                    this.selectedContactBooks.delete(book.id);
                }
                else {
                    this.selectedContactBooks.add(book.id);
                }
            },
        }));
    }
}
//# sourceMappingURL=ImportNativeContactBooksDialog.js.map