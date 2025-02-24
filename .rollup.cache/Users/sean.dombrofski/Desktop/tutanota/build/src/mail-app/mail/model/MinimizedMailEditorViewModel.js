import { lastThrow, remove } from "@tutao/tutanota-utils";
import { isSameId } from "../../../common/api/common/utils/EntityUtils";
/**
 * handles minimized Editors
 */
export class MinimizedMailEditorViewModel {
    _minimizedEditors;
    constructor() {
        this._minimizedEditors = [];
    }
    minimizeMailEditor(dialog, sendMailModel, dispose, saveStatus, closeOverlayFunction) {
        dialog.close();
        // disallow creation of duplicate minimized mails
        if (!this._minimizedEditors.some((editor) => editor.dialog === dialog)) {
            this._minimizedEditors.push({
                sendMailModel: sendMailModel,
                dialog: dialog,
                dispose: dispose,
                saveStatus,
                closeOverlayFunction,
            });
        }
        return lastThrow(this._minimizedEditors);
    }
    // fully removes and reopens clicked mail
    reopenMinimizedEditor(editor) {
        editor.closeOverlayFunction();
        editor.dialog.show();
        remove(this._minimizedEditors, editor);
    }
    // fully removes clicked mail
    removeMinimizedEditor(editor) {
        editor.closeOverlayFunction();
        editor.dispose();
        remove(this._minimizedEditors, editor);
    }
    getMinimizedEditors() {
        return this._minimizedEditors;
    }
    getEditorForDraft(mail) {
        return (this.getMinimizedEditors().find((e) => {
            const draft = e.sendMailModel.getDraft();
            return draft ? isSameId(draft._id, mail._id) : null;
        }) ?? null);
    }
}
//# sourceMappingURL=MinimizedMailEditorViewModel.js.map