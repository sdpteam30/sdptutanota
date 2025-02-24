import m from "mithril";
import { IconButton } from "../../../common/gui/base/IconButton.js";
import { promptAndDeleteMails, showMoveMailsDropdown } from "./MailGuiUtils.js";
import { noOp, ofClass } from "@tutao/tutanota-utils";
import { UserError } from "../../../common/api/main/UserError.js";
import { showUserError } from "../../../common/misc/ErrorHandlerImpl.js";
import { createDropdown } from "../../../common/gui/base/Dropdown.js";
import { editDraft, mailViewerMoreActions } from "./MailViewerUtils.js";
import { isApp } from "../../../common/api/common/Env.js";
import { locator } from "../../../common/api/main/CommonLocator.js";
import { showProgressDialog } from "../../../common/gui/dialogs/ProgressDialog.js";
import { lang } from "../../../common/misc/LanguageViewModel.js";
import { Dialog } from "../../../common/gui/base/Dialog.js";
import { Table } from "../../../common/gui/base/Table.js";
import { ExpanderButton, ExpanderPanel } from "../../../common/gui/base/Expander.js";
import stream from "mithril/stream";
import { exportMails } from "../export/Exporter.js";
import { LabelsPopup } from "./LabelsPopup.js";
import { allInSameMailbox } from "../model/MailUtils";
import { styles } from "../../../common/gui/styles";
// Note: this is only used for non-mobile views. Please also update MobileMailMultiselectionActionBar or MobileMailActionBar
export class MailViewerActions {
    view(vnode) {
        return m(".flex.ml-between-s.items-center", [
            this.renderSingleMailActions(vnode.attrs),
            vnode.attrs.mailViewerViewModel ? m(".nav-bar-spacer") : null,
            this.renderActions(vnode.attrs),
            this.renderMoreButton(vnode.attrs.mailViewerViewModel),
        ]);
    }
    renderActions(attrs) {
        const mailModel = attrs.mailViewerViewModel ? attrs.mailViewerViewModel.mailModel : attrs.mailModel;
        if (!mailModel || !attrs.mails) {
            return null;
        }
        else if (attrs.mailViewerViewModel) {
            return [
                this.renderDeleteButton(mailModel, attrs.mails, attrs.selectNone ?? noOp),
                attrs.mailViewerViewModel.canForwardOrMove() ? this.renderMoveButton(attrs.mailboxModel, mailModel, attrs.mails) : null,
                attrs.mailModel.canAssignLabels() ? this.renderLabelButton(mailModel, attrs.mails) : null,
                attrs.mailViewerViewModel.isDraftMail() ? null : this.renderReadButton(attrs),
            ];
        }
        else if (attrs.mails.length > 0) {
            return [
                this.renderDeleteButton(mailModel, attrs.mails, attrs.selectNone ?? noOp),
                attrs.mailModel.isMovingMailsAllowed() ? this.renderMoveButton(attrs.mailboxModel, mailModel, attrs.mails) : null,
                attrs.mailModel.canAssignLabels() && allInSameMailbox(attrs.mails) ? this.renderLabelButton(mailModel, attrs.mails) : null,
                this.renderReadButton(attrs),
                this.renderExportButton(attrs),
            ];
        }
    }
    /*
     * Actions that can only be taken on a single mail (reply, forward, edit, assign)
     * Will only return actions if there is a mailViewerViewModel
     * */
    renderSingleMailActions(attrs) {
        // mailViewerViewModel means we are viewing one mail; if there is only the mailModel, it is coming from a MultiViewer
        if (attrs.mailViewerViewModel) {
            if (attrs.mailViewerViewModel.isAnnouncement()) {
                return [];
            }
            else if (attrs.mailViewerViewModel.isDraftMail()) {
                return [this.renderEditButton(attrs.mailViewerViewModel)];
            }
            else if (attrs.mailViewerViewModel.canForwardOrMove()) {
                return [this.renderReplyButton(attrs.mailViewerViewModel), this.renderForwardButton(attrs.mailViewerViewModel)];
            }
            else {
                return [this.renderReplyButton(attrs.mailViewerViewModel)];
            }
        }
        else {
            return [];
        }
    }
    renderDeleteButton(mailModel, mails, selectNone) {
        return m(IconButton, {
            title: "delete_action",
            click: () => {
                promptAndDeleteMails(mailModel, mails, selectNone);
            },
            icon: "Trash" /* Icons.Trash */,
        });
    }
    renderMoveButton(mailboxModel, mailModel, mails) {
        return m(IconButton, {
            title: "move_action",
            icon: "Folder" /* Icons.Folder */,
            click: (e, dom) => showMoveMailsDropdown(mailboxModel, mailModel, dom.getBoundingClientRect(), mails),
        });
    }
    renderLabelButton(mailModel, mails) {
        return m(IconButton, {
            title: "assignLabel_action",
            icon: "Label" /* Icons.Label */,
            click: (_, dom) => {
                const popup = new LabelsPopup(dom, dom.getBoundingClientRect(), styles.isDesktopLayout() ? 300 : 200, mailModel.getLabelsForMails(mails), mailModel.getLabelStatesForMails(mails), (addedLabels, removedLabels) => mailModel.applyLabels(mails, addedLabels, removedLabels));
                popup.show();
            },
        });
    }
    renderReadButton({ mailModel, mailViewerViewModel, mails }) {
        const markAction = mailViewerViewModel
            ? (unread) => mailViewerViewModel.setUnread(unread)
            : (unread) => mailModel.markMails(mails, unread);
        const markReadButton = m(IconButton, {
            title: "markRead_action",
            click: () => markAction(false),
            icon: "Eye" /* Icons.Eye */,
        });
        const markUnreadButton = m(IconButton, {
            title: "markUnread_action",
            click: () => markAction(true),
            icon: "NoEye" /* Icons.NoEye */,
        });
        // mailViewerViewModel means we are viewing one mail; if there is only the mailModel, it is coming from a MultiViewer
        if (mailViewerViewModel) {
            if (mailViewerViewModel.isUnread()) {
                return markReadButton;
            }
            else {
                return markUnreadButton;
            }
        }
        return [markReadButton, markUnreadButton];
    }
    renderExportButton(attrs) {
        if (!isApp() && attrs.mailModel.isExportingMailsAllowed()) {
            const operation = locator.operationProgressTracker.startNewOperation();
            const ac = new AbortController();
            const headerBarAttrs = {
                left: [
                    {
                        label: "cancel_action",
                        click: () => ac.abort(),
                        type: "secondary" /* ButtonType.Secondary */,
                    },
                ],
                middle: "emptyString_msg",
            };
            return m(IconButton, {
                title: "export_action",
                click: () => showProgressDialog(lang.getTranslation("mailExportProgress_msg", {
                    "{current}": Math.round((operation.progress() / 100) * attrs.mails.length).toFixed(0),
                    "{total}": attrs.mails.length,
                }), exportMails(attrs.mails, locator.mailFacade, locator.entityClient, locator.fileController, locator.cryptoFacade, operation.id, ac.signal)
                    .then((result) => this.handleExportEmailsResult(result.failed))
                    .finally(operation.done), operation.progress, true, headerBarAttrs),
                icon: "Export" /* Icons.Export */,
            });
        }
    }
    handleExportEmailsResult(mailList) {
        if (mailList && mailList.length > 0) {
            const lines = mailList.map((mail) => ({
                cells: [mail.sender.address, mail.subject],
                actionButtonAttrs: null,
            }));
            const expanded = stream(false);
            const dialog = Dialog.createActionDialog({
                title: "failedToExport_title",
                child: () => m("", [
                    m(".pt-m", lang.get("failedToExport_msg")),
                    m(".flex-start.items-center", [
                        m(ExpanderButton, {
                            label: lang.makeTranslation("hide_show", `${lang.get(expanded() ? "hide_action" : "show_action")} ${lang.get("failedToExport_label", { "{0}": mailList.length })}`),
                            expanded: expanded(),
                            onExpandedChange: expanded,
                        }),
                    ]),
                    m(ExpanderPanel, {
                        expanded: expanded(),
                    }, m(Table, {
                        columnHeading: ["email_label", "subject_label"],
                        columnWidths: [".column-width-largest" /* ColumnWidth.Largest */, ".column-width-largest" /* ColumnWidth.Largest */],
                        showActionButtonColumn: false,
                        lines,
                    })),
                ]),
                okAction: () => dialog.close(),
                allowCancel: false,
                okActionTextId: "ok_action",
                type: "EditMedium" /* DialogType.EditMedium */,
            });
            dialog.show();
        }
    }
    renderReplyButton(viewModel) {
        const actions = [];
        actions.push(m(IconButton, {
            title: "reply_action",
            click: () => viewModel.reply(false),
            icon: "Reply" /* Icons.Reply */,
        }));
        if (viewModel.canReplyAll()) {
            actions.push(m(IconButton, {
                title: "replyAll_action",
                click: () => viewModel.reply(true),
                icon: "ReplyAll" /* Icons.ReplyAll */,
            }));
        }
        return actions;
    }
    renderForwardButton(viewModel) {
        return m(IconButton, {
            title: "forward_action",
            click: () => viewModel.forward().catch(ofClass(UserError, showUserError)),
            icon: "Forward" /* Icons.Forward */,
        });
    }
    renderMoreButton(viewModel) {
        let actions = [];
        if (viewModel) {
            actions = mailViewerMoreActions(viewModel, false);
        }
        return actions.length > 0
            ? m(IconButton, {
                title: "more_label",
                icon: "More" /* Icons.More */,
                click: createDropdown({
                    lazyButtons: () => actions,
                    width: 300,
                }),
            })
            : null;
    }
    renderEditButton(viewModel) {
        return m(IconButton, {
            title: "edit_action",
            click: () => editDraft(viewModel),
            icon: "Edit" /* Icons.Edit */,
        });
    }
}
//# sourceMappingURL=MailViewerToolbar.js.map