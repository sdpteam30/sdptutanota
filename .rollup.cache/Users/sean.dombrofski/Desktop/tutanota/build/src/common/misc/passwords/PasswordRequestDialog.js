/**
 * Requests a password from the user. Stays open until the caller sets the error message to "".
 * @param props.action will be executed as an attempt to apply new password. Error message is the return value.
 */
import { PasswordField } from "./PasswordField.js";
import { Dialog, INPUT } from "../../gui/base/Dialog.js";
import m from "mithril";
import { isKeyPressed } from "../KeyManager.js";
import { Keys } from "../../api/common/TutanotaConstants.js";
import { Icon } from "../../gui/base/Icon.js";
export function showRequestPasswordDialog(props) {
    const title = props.title ? props.title : "password_label";
    let value = "";
    let state = { type: "idle", message: "" };
    const doAction = async () => {
        state = { type: "progress" };
        m.redraw();
        const errorMessage = await props.action(value);
        state = { type: "idle", message: errorMessage };
        m.redraw();
    };
    const child = {
        view: () => {
            const savedState = state;
            return savedState.type == "idle"
                ? m("", [
                    props.messageText ? m(".pt", props.messageText) : null,
                    m(PasswordField, {
                        label: title,
                        helpLabel: () => savedState.message,
                        value: value,
                        oninput: (newValue) => (value = newValue),
                        autocompleteAs: "off" /* Autocomplete.off */,
                        keyHandler: (key) => {
                            if (isKeyPressed(key.key, Keys.RETURN)) {
                                doAction();
                                return false;
                            }
                            return true;
                        },
                    }),
                ])
                : m(Icon, {
                    icon: "Progress" /* BootIcons.Progress */,
                    class: "icon-xl icon-progress block mt mb",
                    style: {
                        marginLeft: "auto",
                        marginRight: "auto",
                    },
                });
        },
    };
    const dialog = Dialog.showActionDialog({
        title,
        child: child,
        allowOkWithReturn: true,
        okAction: () => doAction(),
        cancelActionTextId: props.cancel?.textId,
        allowCancel: props.cancel != null,
        cancelAction: () => {
            props?.cancel?.action?.();
            dialog.close();
        },
    });
    // the password form contains some dummy inputs that would be focused by
    // the default focusOnLoad
    dialog.setFocusOnLoadFunction((dom) => {
        const inputs = Array.from(dom.querySelectorAll(INPUT));
        inputs[inputs.length - 1].focus();
    });
    return dialog;
}
//# sourceMappingURL=PasswordRequestDialog.js.map