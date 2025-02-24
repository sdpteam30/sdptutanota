import m from "mithril";
import ColumnEmptyMessageBox from "../../gui/base/ColumnEmptyMessageBox.js";
import { theme } from "../../gui/theme.js";
/**
 * Renders the user's list of unacknowledged news.
 */
export class NewsList {
    view(vnode) {
        if (vnode.attrs.liveNewsIds.length === 0) {
            return m(ColumnEmptyMessageBox, {
                message: "noNews_msg",
                icon: "Bulb" /* Icons.Bulb */,
                color: theme.content_message_bg,
            });
        }
        return m("", vnode.attrs.liveNewsIds.map((liveNewsId) => {
            const newsListItem = vnode.attrs.liveNewsListItems[liveNewsId.newsItemName];
            return m(".pt.pl-l.pr-l.flex.fill.border-grey.left.list-border-bottom", { key: liveNewsId.newsItemId }, newsListItem.render(liveNewsId));
        }));
    }
}
//# sourceMappingURL=NewsList.js.map