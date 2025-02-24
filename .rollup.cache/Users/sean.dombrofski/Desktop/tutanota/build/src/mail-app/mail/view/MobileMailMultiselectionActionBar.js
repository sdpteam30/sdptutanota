import m from "mithril";
import { IconButton } from "../../../common/gui/base/IconButton.js";
import { promptAndDeleteMails, showMoveMailsDropdown } from "./MailGuiUtils.js";
import { DROPDOWN_MARGIN } from "../../../common/gui/base/Dropdown.js";
import { MobileBottomActionBar } from "../../../common/gui/MobileBottomActionBar.js";
import { LabelsPopup } from "./LabelsPopup.js";
import { allInSameMailbox } from "../model/MailUtils";
// Note: The MailViewerToolbar is the counterpart for this on non-mobile views. Please update there too if needed
export class MobileMailMultiselectionActionBar {
    dom = null;
    view({ attrs }) {
        const { mails, selectNone, mailModel, mailboxModel } = attrs;
        return m(MobileBottomActionBar, {
            oncreate: ({ dom }) => (this.dom = dom),
        }, [
            m(IconButton, {
                icon: "Trash" /* Icons.Trash */,
                title: "delete_action",
                click: () => promptAndDeleteMails(mailModel, mails, selectNone),
            }),
            mailModel.isMovingMailsAllowed()
                ? m(IconButton, {
                    icon: "Folder" /* Icons.Folder */,
                    title: "move_action",
                    click: (e, dom) => {
                        const referenceDom = this.dom ?? dom;
                        showMoveMailsDropdown(mailboxModel, mailModel, referenceDom.getBoundingClientRect(), mails, {
                            onSelected: () => selectNone,
                            width: referenceDom.offsetWidth - DROPDOWN_MARGIN * 2,
                        });
                    },
                })
                : null,
            mailModel.canAssignLabels() && allInSameMailbox(mails)
                ? m(IconButton, {
                    icon: "Label" /* Icons.Label */,
                    title: "assignLabel_action",
                    click: (e, dom) => {
                        const referenceDom = this.dom ?? dom;
                        if (mails.length !== 0) {
                            const popup = new LabelsPopup(referenceDom, referenceDom.getBoundingClientRect(), referenceDom.offsetWidth - DROPDOWN_MARGIN * 2, mailModel.getLabelsForMails(mails), mailModel.getLabelStatesForMails(mails), (addedLabels, removedLabels) => mailModel.applyLabels(mails, addedLabels, removedLabels));
                            popup.show();
                        }
                    },
                })
                : null,
            m(IconButton, {
                icon: "Eye" /* Icons.Eye */,
                title: "markRead_action",
                click: () => {
                    mailModel.markMails(mails, false);
                },
            }),
            m(IconButton, {
                icon: "NoEye" /* Icons.NoEye */,
                title: "markUnread_action",
                click: () => {
                    mailModel.markMails(mails, true);
                },
            }),
        ]);
    }
}
//# sourceMappingURL=MobileMailMultiselectionActionBar.js.map