import m from "mithril";
import ColumnEmptyMessageBox from "../../../common/gui/base/ColumnEmptyMessageBox";
import { lang } from "../../../common/misc/LanguageViewModel";
import { theme } from "../../../common/gui/theme";
import { assertMainOrNode } from "../../../common/api/common/Env";
import { Button } from "../../../common/gui/base/Button.js";
assertMainOrNode();
/**
 * The ContactViewer displays the action buttons for multiple selected contacts.
 */
export class MultiContactViewer {
    view({ attrs }) {
        return [
            m(ColumnEmptyMessageBox, {
                message: getContactSelectionMessage(attrs.selectedEntities.length),
                icon: "Contacts" /* BootIcons.Contacts */,
                color: theme.content_message_bg,
                bottomContent: attrs.selectedEntities.length > 0
                    ? m(Button, {
                        label: "cancel_action",
                        type: "secondary" /* ButtonType.Secondary */,
                        click: () => attrs.selectNone(),
                    })
                    : undefined,
                backgroundColor: theme.navigation_bg,
            }),
        ];
    }
}
export function getContactSelectionMessage(numberEntities) {
    if (numberEntities === 0) {
        return lang.getTranslation("noContact_msg");
    }
    else {
        return lang.getTranslation("nbrOfContactsSelected_msg", {
            "{1}": numberEntities,
        });
    }
}
//# sourceMappingURL=MultiContactViewer.js.map