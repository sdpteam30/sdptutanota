import m from "mithril";
import { theme } from "../theme";
import { assertMainOrNode } from "../../api/common/Env";
assertMainOrNode();
/**
 * A message box displaying a text. A message box can be displayed on the background of a column if the column is empty.
 */
export class MessageBox {
    view({ attrs, children }) {
        return m(".justify-center.items-start.dialog-width-s.pt.pb.plr.border-radius", {
            style: Object.assign({
                "white-space": "pre-wrap",
                "text-align": "center",
                border: `2px solid ${theme.content_border}`,
            }, attrs.style),
        }, children);
    }
}
//# sourceMappingURL=MessageBox.js.map