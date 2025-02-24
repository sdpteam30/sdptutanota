import m from "mithril";
import { isNavButtonSelected, NavButton } from "../gui/base/NavButton.js";
export class SettingsFolderRow {
    view(vnode) {
        const { mainButtonAttrs, extraButton } = vnode.attrs;
        const isSelected = isNavButtonSelected(mainButtonAttrs);
        const selector = `.folder-row.flex-start.pl-button.pr-m${isSelected ? ".row-selected" : ""}`;
        return m(selector, [m(NavButton, mainButtonAttrs), extraButton && isSelected ? extraButton : null]);
    }
}
//# sourceMappingURL=SettingsFolderRow.js.map