import m from "mithril";
import { styles } from "./styles.js";
/**
 * A layout component that organizes the column.
 * Renders a frame for the layout and either mobile header or desktop toolbar.
 */
export class BackgroundColumnLayout {
    view({ attrs }) {
        return m(".list-column.flex.col.fill-absolute", {
            style: {
                backgroundColor: attrs.backgroundColor,
            },
            class: attrs.classes ?? "",
        }, [
            styles.isUsingBottomNavigation() ? attrs.mobileHeader() : attrs.desktopToolbar(),
            m(".flex-grow.rel", attrs.columnLayout),
            attrs.floatingActionButton?.(),
        ]);
    }
}
//# sourceMappingURL=BackgroundColumnLayout.js.map