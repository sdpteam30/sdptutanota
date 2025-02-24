import m from "mithril";
import { px } from "../../../../common/gui/size.js";
import { modal } from "../../../../common/gui/base/Modal.js";
import { DROPDOWN_MARGIN, showDropdown } from "../../../../common/gui/base/Dropdown.js";
import { Keys } from "../../../../common/api/common/TutanotaConstants.js";
import { IconButton } from "../../../../common/gui/base/IconButton.js";
import { ContactPreviewView } from "./ContactPreviewView.js";
import { client } from "../../../../common/misc/ClientDetector.js";
import { ContactEditor } from "../../../../mail-app/contacts/ContactEditor.js";
import { locator } from "../../../../common/api/main/CommonLocator.js";
import { listIdPart } from "../../../../common/api/common/utils/EntityUtils.js";
import { stringToBase64 } from "@tutao/tutanota-utils";
import { calendarLocator } from "../../../calendarLocator.js";
import { Dialog } from "../../../../common/gui/base/Dialog.js";
/**
 * small modal displaying all relevant information about a contact in a compact fashion. offers limited editing capabilities to participants in the
 * form with quick action buttons such as edit contact.
 */
export class ContactEventPopup {
    model;
    eventBubbleRect;
    _shortcuts = [];
    dom = null;
    focusedBeforeShown = null;
    /**
     * @param model
     * @param eventBubbleRect the rect where the event bubble was displayed that was clicked (if any)
     */
    constructor(model, eventBubbleRect) {
        this.model = model;
        this.eventBubbleRect = eventBubbleRect;
        this.setupShortcuts();
        this.view = this.view.bind(this);
    }
    handleEditButtonClick = async (ev, receiver) => {
        if (client.isCalendarApp()) {
            if (!(await Dialog.confirm("openMailApp_msg", "yes_label")))
                return;
            const query = `contactId=${stringToBase64(this.model.contact._id.join("/"))}`;
            calendarLocator.systemFacade.openMailApp(stringToBase64(query));
            return;
        }
        new ContactEditor(locator.entityClient, this.model.contact, listIdPart(this.model.contact._id), m.redraw).show();
    };
    view() {
        return m(".abs.elevated-bg.plr.pb.border-radius.dropdown-shadow.flex.flex-column", {
            style: {
                // minus margin, need to apply it now to not overflow later
                width: px(Math.min(window.innerWidth - DROPDOWN_MARGIN * 2, 400)),
                // see hack description below
                opacity: "0",
                // because calendar event bubbles have 1px border, we want to align
                margin: "1px",
            },
            oncreate: (vnode) => {
                this.dom = vnode.dom;
                // This is a hack to get "natural" view size but render it without opacity first and then show dropdown with inferred
                // size.
                setTimeout(() => {
                    showDropdown(this.eventBubbleRect, this.dom, this.dom.offsetHeight, 400);
                    // Move the keyboard focus into the popup's buttons when it is shown
                    const firstButton = vnode.dom.firstElementChild?.firstElementChild;
                    firstButton?.focus();
                }, 24);
            },
        }, [
            m(".flex.flex-end", [this.renderEditButton(), this.renderCloseButton()]),
            m(".flex-grow", [
                m(ContactPreviewView, {
                    event: this.model.event,
                    contact: this.model.contact,
                }),
            ]),
        ]);
    }
    renderEditButton() {
        if (!this.model.canEdit)
            return null;
        return m(IconButton, { title: "edit_action", icon: "ManageContact" /* Icons.ManageContact */, click: this.handleEditButtonClick });
    }
    renderCloseButton() {
        return m(IconButton, {
            title: "close_alt",
            click: () => this.close(),
            icon: "Cancel" /* Icons.Cancel */,
        });
    }
    show() {
        this.focusedBeforeShown = document.activeElement;
        modal.display(this, false);
    }
    close() {
        modal.remove(this);
    }
    backgroundClick(e) {
        modal.remove(this);
    }
    hideAnimation() {
        return Promise.resolve();
    }
    onClose() {
        this.close();
    }
    shortcuts() {
        return this._shortcuts;
    }
    popState(e) {
        modal.remove(this);
        return false;
    }
    callingElement() {
        return this.focusedBeforeShown;
    }
    setupShortcuts() {
        const close = {
            key: Keys.ESC,
            exec: () => this.close(),
            help: "close_alt",
        };
        const edit = {
            key: Keys.E,
            exec: () => this.handleEditButtonClick(new MouseEvent("click", {}), this.dom),
            help: "edit_action",
        };
        this._shortcuts.push(close);
        if (this.model.canEdit) {
            this._shortcuts.push(edit);
        }
    }
}
//# sourceMappingURL=CalendarContactPopup.js.map