import m from "mithril";
import { lang } from "../../misc/LanguageViewModel";
import { Icon } from "./Icon";
import { px, size } from "../size";
import { assertMainOrNode } from "../../api/common/Env";
assertMainOrNode();
/** Displays a big message with an option icon above it. */
export class IconMessageBox {
    view({ attrs }) {
        return m(".flex.col.items-center.justify-center.mlr", [
            attrs.icon
                ? m(Icon, {
                    icon: attrs.icon,
                    style: {
                        fill: attrs.color,
                    },
                    class: "icon-message-box",
                })
                : null,
            m(".h2.text-center.text-preline", {
                style: {
                    color: attrs.color,
                },
                "data-testid": `message_box:${lang.getTestId(attrs.message)}`,
            }, lang.getTranslationText(attrs.message)),
        ]);
    }
}
/**
 * A message displaying a text. A message box can be displayed on the background of a column if the column is empty. The text inside of it will be centered vertically, taking the icon into account.
 */
export default class ColumnEmptyMessageBox {
    view({ attrs }) {
        return m(".fill-absolute.flex.col.items-center.justify-center.overflow-hidden", {
            style: {
                backgroundColor: attrs?.backgroundColor,
            },
        }, m(".flex.col.items-center", {
            style: {
                // move up *only* this element, not the whole .fill-absolute parent to not overflow into the items above us
                "margin-top": px(attrs.icon ? -size.icon_message_box - size.vpad_xl : -size.vpad_xl),
            },
        }, [
            // If we pass plain attrs all lifecycle callbacks we attach from the outside will be called twice, once on the wrong element.
            m(IconMessageBox, {
                message: attrs.message,
                icon: attrs.icon,
                color: attrs.color,
            }),
            attrs.bottomContent ?? m(".button-height"),
        ]));
    }
}
//# sourceMappingURL=ColumnEmptyMessageBox.js.map