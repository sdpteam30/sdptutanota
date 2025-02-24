import m from "mithril";
import { assertMainOrNode } from "../../api/common/Env";
import { Dialog } from "../../gui/base/Dialog";
import { Keys } from "../../api/common/TutanotaConstants";
import { CustomColorEditor } from "./CustomColorEditor";
assertMainOrNode();
export function show(model) {
    model.init();
    model.builtTheme.map(() => m.redraw());
    const form = {
        view: () => {
            return m(".pb", [
                m(CustomColorEditor, {
                    model: model,
                }),
            ]);
        },
    };
    const cancelAction = () => {
        model.resetActiveClientTheme().then(() => dialog.close());
    };
    const okAction = async () => {
        if (await model.save()) {
            dialog.close();
        }
        else {
            return Dialog.message("correctValues_msg");
        }
    };
    let actionBarAttrs = {
        left: [
            {
                label: "cancel_action",
                click: cancelAction,
                type: "secondary" /* ButtonType.Secondary */,
            },
        ],
        right: [
            {
                label: "ok_action",
                click: okAction,
                type: "primary" /* ButtonType.Primary */,
            },
        ],
        middle: "customColors_label",
    };
    let dialog = Dialog.largeDialog(actionBarAttrs, form)
        .addShortcut({
        key: Keys.ESC,
        exec: cancelAction,
        help: "close_alt",
    })
        .setCloseHandler(cancelAction)
        .show();
}
//# sourceMappingURL=EditCustomColorsDialog.js.map