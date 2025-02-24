import m from "mithril";
import { displayOverlay } from "./base/Overlay";
import { px, size } from "./size";
import { assertMainOrNode } from "../api/common/Env";
import { lang } from "../misc/LanguageViewModel";
import { Keys } from "../api/common/TutanotaConstants";
import { locator } from "../api/main/CommonLocator";
import { isKeyPressed } from "../misc/KeyManager.js";
import { IconButton } from "./base/IconButton.js";
import { ToggleButton } from "./base/buttons/ToggleButton.js";
import { styles } from "./styles.js";
import { getSafeAreaInsetBottom } from "./HtmlUtils.js";
assertMainOrNode();
/**
 * search bar for the Ctrl+F in-page search of the Desktop client
 * gets loaded asynchronously, shouldn't be in the web bundle
 */
export class SearchInPageOverlay {
    closeFunction;
    domInput;
    matchCase = false;
    numberOfMatches = 0;
    currentMatch = 0;
    skipNextBlur = false;
    constructor() {
        this.closeFunction = null;
    }
    open() {
        if (locator.logins.isUserLoggedIn()) {
            if (!this.closeFunction) {
                this.closeFunction = displayOverlay(() => this.getRect(), this.getComponent(), "slide-bottom");
            }
            else {
                //already open, refocus
                console.log("refocusing");
                this.domInput.focus();
                this.domInput.select();
            }
            m.redraw();
        }
    }
    close() {
        if (this.closeFunction) {
            this.closeFunction();
            locator.searchTextFacade.stopFindInPage();
            this.closeFunction = null;
        }
        m.redraw();
    }
    getRect() {
        const bottomNavHeight = size.bottom_nav_bar + getSafeAreaInsetBottom();
        return {
            height: px(size.navbar_height_mobile),
            // Place the search overlay on top of the bottom nav bar
            bottom: px(styles.isUsingBottomNavigation() ? -bottomNavHeight : 0),
            right: px(0),
            left: px(0),
        };
    }
    inputField = () => {
        return m("input#search-overlay-input.dropdown-bar.elevated-bg.pl-l.button-height.inputWrapper", {
            placeholder: lang.get("searchPage_action"),
            oncreate: (vnode) => {
                this.domInput = vnode.dom;
                this.domInput.focus();
            },
            onblur: () => {
                if (this.skipNextBlur) {
                    this.skipNextBlur = false;
                    this.domInput.focus();
                }
                else {
                    locator.searchTextFacade.setSearchOverlayState(false, false);
                }
            },
            onfocus: () => locator.searchTextFacade.setSearchOverlayState(true, false),
            oninput: () => this.find(true, true),
            style: {
                width: px(250),
                top: 0,
                height: px(size.button_height),
                left: 0,
            },
        }, "");
    };
    find = async (forward, findNext) => {
        this.skipNextBlur = true;
        const r = await locator.searchTextFacade.findInPage(this.domInput.value, forward, this.matchCase, findNext);
        this.applyNextResult(r);
    };
    applyNextResult(result) {
        if (result == null) {
            this.numberOfMatches = 0;
            this.currentMatch = 0;
        }
        else {
            const { activeMatchOrdinal, matches } = result;
            if (matches === 1) {
                /* the search bar loses focus without any events when there
                 *  are no results except for the search bar itself. this enables
                 *  us to retain focus. */
                this.domInput.blur();
                this.domInput.focus();
            }
            this.numberOfMatches = matches - 1;
            this.currentMatch = activeMatchOrdinal - 1;
        }
        m.redraw();
    }
    getComponent() {
        const handleMouseUp = (event) => this.handleMouseUp(event);
        return {
            view: (_) => {
                return m(".flex.flex-space-between", {
                    oncreate: () => window.addEventListener("mouseup", handleMouseUp),
                    onremove: () => window.removeEventListener("mouseup", handleMouseUp),
                }, [
                    m(".flex-start.center-vertically", {
                        onkeydown: (e) => {
                            if (isKeyPressed(e.key, Keys.ESC)) {
                                this.close();
                            }
                            // prevent key from getting picked up by shortcuts etc.
                            e.stopPropagation();
                            return true;
                        },
                    }, [
                        this.inputField(),
                        m(IconButton, {
                            title: "previous_action",
                            icon: "ArrowBackward" /* Icons.ArrowBackward */,
                            click: () => this.find(false, true),
                        }),
                        m(IconButton, {
                            title: "next_action",
                            icon: "ArrowForward" /* Icons.ArrowForward */,
                            click: () => this.find(true, true),
                        }),
                        m(ToggleButton, {
                            title: "matchCase_alt",
                            icon: "MatchCase" /* Icons.MatchCase */,
                            toggled: this.matchCase,
                            onToggled: () => {
                                this.matchCase = !this.matchCase;
                                this.find(true, false);
                            },
                        }),
                        m("div.pl-m", this.numberOfMatches > 0 ? `${this.currentMatch}/${this.numberOfMatches}` : lang.get("searchNoResults_msg")),
                    ]),
                    m(IconButton, {
                        title: "close_alt",
                        icon: "Cancel" /* Icons.Cancel */,
                        click: () => this.close(),
                    }),
                ]);
            },
        };
    }
    /*
     * we're catching enter key events on the main thread while the search overlay is open to enable
     * next-result-via-enter behaviour.
     *
     * since losing focus on the overlay via issuing a search request seems to be indistinguishable
     * from losing it via click/tab we need to check if anything else was clicked and tell the main thread to
     * not search the next result for enter key events (otherwise we couldn't type newlines while the overlay is open)
     */
    handleMouseUp(e) {
        if (!(e.target instanceof Element && e.target.id !== "search-overlay-input"))
            return;
        locator.searchTextFacade.setSearchOverlayState(false, true);
    }
}
export const searchInPageOverlay = new SearchInPageOverlay();
//# sourceMappingURL=SearchInPageOverlay.js.map