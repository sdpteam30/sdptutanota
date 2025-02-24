import { isNotNull } from "@tutao/tutanota-utils";
/**
 * makes decisions about which operations are available from the popup and knows how to implement them depending on the event's type.
 */
export class CalendarContactPreviewViewModel {
    event;
    contact;
    _canEdit;
    /**
     *
     * @param event the event that was interacted with
     * @param contact the contact to display in the popup
     * @param _canEdit allow editing the contact if available
     */
    constructor(event, contact, _canEdit = false) {
        this.event = event;
        this.contact = contact;
        this._canEdit = _canEdit;
    }
    get canEdit() {
        return this._canEdit && isNotNull(this.contact);
    }
}
//# sourceMappingURL=CalendarContactPreviewViewModel.js.map