import m from "mithril";
import { theme } from "../../../common/gui/theme.js";
import { ContactViewer } from "./ContactViewer.js";
import { responsiveCardHMargin } from "../../../common/gui/cards.js";
/** Wraps contact viewer in a nice card. */
export class ContactCardViewer {
    view({ attrs }) {
        const { contact, onWriteMail, editAction, deleteAction, extendedActions } = attrs;
        return [
            m(".border-radius-big.rel", {
                class: responsiveCardHMargin(),
                style: {
                    backgroundColor: theme.content_bg,
                    ...attrs.style,
                },
            }, m(ContactViewer, {
                contact,
                onWriteMail,
                editAction,
                deleteAction,
                extendedActions,
            })),
            m(".mt-l"),
        ];
    }
}
//# sourceMappingURL=ContactCardViewer.js.map