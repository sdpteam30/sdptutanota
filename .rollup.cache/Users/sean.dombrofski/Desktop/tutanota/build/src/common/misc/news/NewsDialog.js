import m from "mithril";
import { DialogHeaderBar } from "../../gui/base/DialogHeaderBar.js";
import { lang } from "../LanguageViewModel.js";
import { Dialog } from "../../gui/base/Dialog.js";
import { Keys } from "../../api/common/TutanotaConstants.js";
import { NewsList } from "./NewsList.js";
import { progressIcon } from "../../gui/base/Icon.js";
export function showNewsDialog(newsModel) {
    const closeButton = {
        label: "close_alt",
        type: "secondary" /* ButtonType.Secondary */,
        click: () => {
            closeAction();
        },
    };
    const closeAction = () => {
        dialog.close();
    };
    const header = {
        left: [closeButton],
        middle: "news_label",
    };
    let loaded = false;
    newsModel.loadNewsIds().then(() => {
        loaded = true;
        m.redraw();
    });
    const child = {
        view: () => {
            return [
                m("", [
                    loaded
                        ? m(NewsList, {
                            liveNewsIds: newsModel.liveNewsIds,
                            liveNewsListItems: newsModel.liveNewsListItems,
                        })
                        : m(".flex-center.mt-l", m(".flex-v-center", [m(".full-width.flex-center", progressIcon()), m("p", lang.getTranslationText("pleaseWait_msg"))])),
                ]),
            ];
        },
    };
    const dialog = new Dialog("EditLarge" /* DialogType.EditLarge */, {
        view: () => {
            return m("", [m(DialogHeaderBar, header), m(".dialog-container.scroll", m(".fill-absolute", m(child)))]);
        },
    }).addShortcut({
        key: Keys.ESC,
        exec: () => {
            closeAction();
        },
        help: "close_alt",
    });
    dialog.show();
}
//# sourceMappingURL=NewsDialog.js.map