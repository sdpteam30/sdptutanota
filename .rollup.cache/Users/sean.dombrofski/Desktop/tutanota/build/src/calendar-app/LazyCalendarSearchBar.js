import m from "mithril";
import { LazyLoaded } from "@tutao/tutanota-utils";
/**
 * Lazy wrapper around SearchBar which unfortunately resides in the search chunk right now and cannot be imported from some files.
 *
 * Ideally this would be a generic component but it's not simple to implement.
 */
export class LazyCalendarSearchBar {
    static searchBar = new LazyLoaded(async () => {
        const { searchBar } = await import("./calendar/search/CalendarSearchBar.js");
        m.redraw();
        return searchBar;
    });
    oninit(vnode) {
        LazyCalendarSearchBar.searchBar.load();
    }
    view(vnode) {
        const searchBar = LazyCalendarSearchBar.searchBar.getSync();
        if (searchBar) {
            return m(searchBar, vnode.attrs);
        }
        else {
            return null;
        }
    }
}
export const lazyCalendarSearchBar = new LazyCalendarSearchBar();
//# sourceMappingURL=LazyCalendarSearchBar.js.map