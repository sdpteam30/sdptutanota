import m from "mithril";
import { CounterBadge } from "../../../common/gui/base/CounterBadge";
import { getNavButtonIconBackground, theme } from "../../../common/gui/theme";
import { lang } from "../../../common/misc/LanguageViewModel";
import { px } from "../../../common/gui/size";
import { styles } from "../../../common/gui/styles";
import { promptAndDeleteMails } from "./MailGuiUtils";
import { MailTypeRef } from "../../../common/api/entities/tutanota/TypeRefs.js";
import { isSameId } from "../../../common/api/common/utils/EntityUtils";
import { noOp, promiseMap } from "@tutao/tutanota-utils";
import { isUpdateForTypeRef } from "../../../common/api/common/utils/EntityUpdateUtils.js";
import { IconButton } from "../../../common/gui/base/IconButton.js";
import { mailLocator } from "../../mailLocator.js";
const COUNTER_POS_OFFSET = px(-8);
export class MinimizedEditorOverlay {
    _listener;
    _eventController;
    constructor(vnode) {
        const { minimizedEditor, viewModel, eventController } = vnode.attrs;
        this._eventController = eventController;
        this._listener = (updates, eventOwnerGroupId) => {
            return promiseMap(updates, (update) => {
                if (isUpdateForTypeRef(MailTypeRef, update) && update.operation === "2" /* OperationType.DELETE */) {
                    let draft = minimizedEditor.sendMailModel.getDraft();
                    if (draft && isSameId(draft._id, [update.instanceListId, update.instanceId])) {
                        viewModel.removeMinimizedEditor(minimizedEditor);
                    }
                }
            });
        };
        eventController.addEntityListener(this._listener);
    }
    onremove() {
        this._eventController.removeEntityListener(this._listener);
    }
    view(vnode) {
        const { minimizedEditor, viewModel, eventController } = vnode.attrs;
        const subject = minimizedEditor.sendMailModel.getSubject();
        return m(".elevated-bg.pl.border-radius", [
            m(CounterBadge, {
                count: viewModel.getMinimizedEditors().indexOf(minimizedEditor) + 1,
                position: {
                    top: COUNTER_POS_OFFSET,
                    right: COUNTER_POS_OFFSET,
                },
                color: theme.navigation_button_icon,
                background: getNavButtonIconBackground(),
            }),
            m(".flex.justify-between.pb-xs.pt-xs", [
                m(".flex.col.justify-center.min-width-0.flex-grow", {
                    onclick: () => viewModel.reopenMinimizedEditor(minimizedEditor),
                }, [
                    m(".b.text-ellipsis", subject ? subject : lang.get("newMail_action")),
                    m(".small.text-ellipsis", getStatusMessage(minimizedEditor.saveStatus())),
                ]),
                m(".flex.items-center.justify-right", [
                    !styles.isSingleColumnLayout()
                        ? m(IconButton, {
                            title: "edit_action",
                            click: () => viewModel.reopenMinimizedEditor(minimizedEditor),
                            icon: "Edit" /* Icons.Edit */,
                        })
                        : null,
                    m(IconButton, {
                        title: "delete_action",
                        click: () => this._onDeleteClicked(minimizedEditor, viewModel),
                        icon: "Trash" /* Icons.Trash */,
                    }),
                    m(IconButton, {
                        title: "close_alt",
                        click: () => viewModel.removeMinimizedEditor(minimizedEditor),
                        icon: "Cancel" /* Icons.Cancel */,
                    }),
                ]),
            ]),
        ]);
    }
    _onDeleteClicked(minimizedEditor, viewModel) {
        const model = minimizedEditor.sendMailModel;
        viewModel.removeMinimizedEditor(minimizedEditor);
        // only delete once save has finished
        minimizedEditor.saveStatus.map(async ({ status }) => {
            if (status !== 0 /* SaveStatusEnum.Saving */) {
                const draft = model.draft;
                if (draft) {
                    await promptAndDeleteMails(mailLocator.mailModel, [draft], noOp);
                }
            }
        });
    }
}
function getStatusMessage(saveStatus) {
    switch (saveStatus.status) {
        case 0 /* SaveStatusEnum.Saving */:
            return lang.get("save_msg");
        case 2 /* SaveStatusEnum.NotSaved */:
            switch (saveStatus.reason) {
                case 1 /* SaveErrorReason.ConnectionLost */:
                    return lang.get("draftNotSavedConnectionLost_msg");
                default:
                    return lang.get("draftNotSaved_msg");
            }
        case 1 /* SaveStatusEnum.Saved */:
            return lang.get("draftSaved_msg");
        default:
            return "";
    }
}
//# sourceMappingURL=MinimizedEditorOverlay.js.map