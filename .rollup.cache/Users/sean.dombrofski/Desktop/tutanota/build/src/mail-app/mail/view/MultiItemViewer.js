import m from "mithril";
import { assertMainOrNode } from "../../../common/api/common/Env";
import ColumnEmptyMessageBox from "../../../common/gui/base/ColumnEmptyMessageBox";
import { lang } from "../../../common/misc/LanguageViewModel";
import { theme } from "../../../common/gui/theme";
import { Button } from "../../../common/gui/base/Button.js";
import { progressIcon } from "../../../common/gui/base/Icon.js";
assertMainOrNode();
export class MultiItemViewer {
    view({ attrs }) {
        const { selectedEntities } = attrs;
        return [
            m(".flex.col.fill-absolute", m(".flex-grow.rel.overflow-hidden", m(ColumnEmptyMessageBox, {
                message: attrs.getSelectionMessage(selectedEntities),
                icon: "Mail" /* BootIcons.Mail */,
                color: theme.content_message_bg,
                backgroundColor: theme.navigation_bg,
                bottomContent: this.renderEmptyMessageButtons(attrs),
            }))),
        ];
    }
    renderEmptyMessageButtons({ loadingAll, stopLoadAll, selectedEntities, selectNone, loadAll }) {
        return loadingAll === "loading"
            ? m(".flex.items-center", [
                m(Button, {
                    label: "cancel_action",
                    type: "secondary" /* ButtonType.Secondary */,
                    click: () => {
                        stopLoadAll();
                    },
                }),
                m(".flex.items-center.plr-button", progressIcon()),
            ])
            : selectedEntities.length === 0
                ? null
                : m(".flex", [
                    m(Button, {
                        label: "cancel_action",
                        type: "secondary" /* ButtonType.Secondary */,
                        click: () => {
                            selectNone();
                        },
                    }),
                    loadingAll === "can_load"
                        ? m(Button, {
                            label: "loadAll_action",
                            type: "secondary" /* ButtonType.Secondary */,
                            click: () => {
                                loadAll();
                            },
                        })
                        : null,
                ]);
    }
}
export function getMailSelectionMessage(selectedEntities) {
    let nbrOfSelectedMails = selectedEntities.length;
    if (nbrOfSelectedMails === 0) {
        return lang.getTranslation("noMail_msg");
    }
    else if (nbrOfSelectedMails === 1) {
        return lang.getTranslation("oneMailSelected_msg");
    }
    else {
        return lang.getTranslation("nbrOfMailsSelected_msg", {
            "{1}": nbrOfSelectedMails,
        });
    }
}
//# sourceMappingURL=MultiItemViewer.js.map