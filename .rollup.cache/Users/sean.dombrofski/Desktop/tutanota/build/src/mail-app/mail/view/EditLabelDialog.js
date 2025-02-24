import { Dialog } from "../../../common/gui/base/Dialog";
import { TextField } from "../../../common/gui/base/TextField";
import m from "mithril";
import { isOfflineError } from "../../../common/api/common/utils/ErrorUtils";
import { LockedError, PreconditionFailedError } from "../../../common/api/common/error/RestError";
import { ColorPickerView } from "../../../common/gui/base/colorPicker/ColorPickerView";
import { showNotAvailableForFreeDialog } from "../../../common/misc/SubscriptionDialogs";
const LIMIT_EXCEEDED_ERROR = "limitReached";
export async function showEditLabelDialog(mailbox, mailViewModel, label) {
    let name = label ? label.name : "";
    let color = label && label.color ? label.color : "";
    async function onOkClicked(dialog) {
        dialog.close();
        try {
            if (label) {
                // editing a label
                await mailViewModel.editLabel(label, { name, color });
            }
            else if (mailbox) {
                // adding a label
                await mailViewModel.createLabel(mailbox, { name, color });
            }
        }
        catch (error) {
            if (error instanceof PreconditionFailedError) {
                if (error.data === LIMIT_EXCEEDED_ERROR) {
                    showNotAvailableForFreeDialog();
                }
                else {
                    Dialog.message("unknownError_msg");
                }
            }
            else if (isOfflineError(error) || !(error instanceof LockedError)) {
                throw error;
            }
        }
    }
    Dialog.showActionDialog({
        title: label ? "editLabel_action" : "addLabel_action",
        allowCancel: true,
        okAction: (dialog) => {
            onOkClicked(dialog);
        },
        child: () => m(".flex.col.gap-vpad", [
            m(TextField, {
                label: "name_label",
                value: name,
                oninput: (newName) => {
                    name = newName;
                },
            }),
            m(ColorPickerView, {
                value: color,
                onselect: (newColor) => {
                    color = newColor;
                },
            }),
        ]),
    });
}
//# sourceMappingURL=EditLabelDialog.js.map