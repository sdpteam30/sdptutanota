import m from "mithril";
import { lang } from "../misc/LanguageViewModel.js";
import { neverNull } from "@tutao/tutanota-utils";
import { attachDropdown } from "../gui/base/Dropdown.js";
import { IconButton } from "../gui/base/IconButton.js";
/**
 * Displays data for one push identifier
 */
export class IdentifierRow {
    view(vnode) {
        const dropdownAttrs = attachDropdown({
            mainButtonAttrs: {
                title: "edit_action",
                icon: "More" /* Icons.More */,
                size: 1 /* ButtonSize.Compact */,
            },
            childAttrs: () => [
                {
                    label: vnode.attrs.disabled ? "activate_action" : "deactivate_action",
                    click: vnode.attrs.disableClicked,
                },
                {
                    label: "delete_action",
                    click: vnode.attrs.removeClicked,
                },
            ],
        });
        return m(".flex.flex-column.full-width", [
            m(".flex.items-center.selectable", [
                m("span" + (vnode.attrs.current ? ".b" : ""), vnode.attrs.name),
                vnode.attrs.disabled ? m(".mlr", `(${lang.get("notificationsDisabled_label")})`) : null,
                m(".flex-grow"),
                m(IconButton, dropdownAttrs),
            ]),
            this.renderIdentifier(vnode.attrs),
        ]);
    }
    renderIdentifier({ identifier, formatIdentifier }) {
        const identifierText = formatIdentifier
            ? neverNull(identifier.match(/.{2}/g)).map((el, i) => m("span.pr-s" + (i % 2 === 0 ? ".b" : ""), el))
            : identifier;
        return m(".text-break.small.monospace.mt-negative-hpad-button.selectable", identifierText);
    }
}
//# sourceMappingURL=IdentifierRow.js.map