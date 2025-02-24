import m from "mithril";
import { IconButton } from "../../../common/gui/base/IconButton.js";
import { createDropdown, Dropdown, DROPDOWN_MARGIN } from "../../../common/gui/base/Dropdown.js";
import { UserError } from "../../../common/api/main/UserError.js";
import { showUserError } from "../../../common/misc/ErrorHandlerImpl.js";
import { promptAndDeleteMails, showMoveMailsDropdown } from "./MailGuiUtils.js";
import { noOp, ofClass } from "@tutao/tutanota-utils";
import { modal } from "../../../common/gui/base/Modal.js";
import { editDraft, mailViewerMoreActions } from "./MailViewerUtils.js";
import { px, size } from "../../../common/gui/size.js";
import { LabelsPopup } from "./LabelsPopup.js";
export class MobileMailActionBar {
    dom = null;
    view(vnode) {
        const { attrs } = vnode;
        const { viewModel } = attrs;
        let actions;
        if (viewModel.isAnnouncement()) {
            actions = [this.placeholder(), this.placeholder(), this.deleteButton(attrs), this.placeholder(), this.moreButton(attrs)];
        }
        else if (viewModel.isDraftMail()) {
            actions = [this.placeholder(), this.placeholder(), this.deleteButton(attrs), this.moveButton(attrs), this.editButton(attrs)];
        }
        else if (viewModel.canForwardOrMove()) {
            actions = [this.replyButton(attrs), this.forwardButton(attrs), this.deleteButton(attrs), this.moveButton(attrs), this.moreButton(attrs)];
        }
        else {
            actions = [this.replyButton(attrs), this.placeholder(), this.deleteButton(attrs), this.placeholder(), this.moreButton(attrs)];
        }
        return m(".bottom-nav.bottom-action-bar.flex.items-center.plr-l.justify-between", {
            oncreate: (vnode) => {
                this.dom = vnode.dom;
            },
        }, [actions]);
    }
    placeholder() {
        return m("", {
            style: {
                width: px(size.button_height),
            },
        });
    }
    moveButton({ viewModel }) {
        return m(IconButton, {
            title: "move_action",
            click: (e, dom) => showMoveMailsDropdown(viewModel.mailboxModel, viewModel.mailModel, dom.getBoundingClientRect(), [viewModel.mail], {
                width: this.dropdownWidth(),
                withBackground: true,
            }),
            icon: "Folder" /* Icons.Folder */,
        });
    }
    dropdownWidth() {
        return this.dom?.offsetWidth ? this.dom.offsetWidth - DROPDOWN_MARGIN * 2 : undefined;
    }
    moreButton({ viewModel }) {
        return m(IconButton, {
            title: "more_label",
            click: createDropdown({
                lazyButtons: () => {
                    const moreButtons = [];
                    if (viewModel.mailModel.canAssignLabels()) {
                        moreButtons.push({
                            label: "assignLabel_action",
                            click: (event, dom) => {
                                const referenceDom = this.dom ?? dom;
                                const popup = new LabelsPopup(referenceDom, referenceDom.getBoundingClientRect(), this.dropdownWidth() ?? 200, viewModel.mailModel.getLabelsForMails([viewModel.mail]), viewModel.mailModel.getLabelStatesForMails([viewModel.mail]), (addedLabels, removedLabels) => viewModel.mailModel.applyLabels([viewModel.mail], addedLabels, removedLabels));
                                setTimeout(() => {
                                    popup.show();
                                }, 16);
                            },
                            icon: "Label" /* Icons.Label */,
                        });
                    }
                    return [...moreButtons, ...mailViewerMoreActions(viewModel)];
                },
                width: this.dropdownWidth(),
                withBackground: true,
            }),
            icon: "More" /* Icons.More */,
        });
    }
    deleteButton({ viewModel }) {
        return m(IconButton, {
            title: "delete_action",
            click: () => promptAndDeleteMails(viewModel.mailModel, [viewModel.mail], noOp),
            icon: "Trash" /* Icons.Trash */,
        });
    }
    forwardButton({ viewModel }) {
        return m(IconButton, {
            title: "forward_action",
            click: () => viewModel.forward().catch(ofClass(UserError, showUserError)),
            icon: "Forward" /* Icons.Forward */,
        });
    }
    replyButton({ viewModel }) {
        return m(IconButton, {
            title: "reply_action",
            click: viewModel.canReplyAll()
                ? (e, dom) => {
                    const dropdown = new Dropdown(() => {
                        const buttons = [];
                        buttons.push({
                            label: "replyAll_action",
                            icon: "ReplyAll" /* Icons.ReplyAll */,
                            click: () => viewModel.reply(true),
                        });
                        buttons.push({
                            label: "reply_action",
                            icon: "Reply" /* Icons.Reply */,
                            click: () => viewModel.reply(false),
                        });
                        return buttons;
                    }, this.dropdownWidth() ?? 300);
                    const domRect = this.dom?.getBoundingClientRect() ?? dom.getBoundingClientRect();
                    dropdown.setOrigin(domRect);
                    modal.displayUnique(dropdown, true);
                }
                : () => viewModel.reply(false),
            icon: viewModel.canReplyAll() ? "ReplyAll" /* Icons.ReplyAll */ : "Reply" /* Icons.Reply */,
        });
    }
    editButton(attrs) {
        return m(IconButton, {
            title: "edit_action",
            icon: "Edit" /* Icons.Edit */,
            click: () => editDraft(attrs.viewModel),
        });
    }
}
//# sourceMappingURL=MobileMailActionBar.js.map