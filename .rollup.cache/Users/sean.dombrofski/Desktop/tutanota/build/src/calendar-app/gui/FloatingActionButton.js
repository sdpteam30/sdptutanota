import m from "mithril";
import { IconButton } from "../../common/gui/base/IconButton.js";
export class FloatingActionButton {
    view({ attrs: { title, colors, icon, action } }) {
        return m("span.float-action-button.posb-ml.posr-ml.accent-bg.fab-shadow", m(IconButton, {
            colors,
            icon,
            title,
            click: action,
            size: 2 /* ButtonSize.Large */,
        }));
    }
}
//# sourceMappingURL=FloatingActionButton.js.map