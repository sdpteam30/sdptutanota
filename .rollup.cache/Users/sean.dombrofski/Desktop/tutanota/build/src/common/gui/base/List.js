import m from "mithril";
import { debounce, memoized, numberRange } from "@tutao/tutanota-utils";
import { px, size } from "../size.js";
import { isKeyPressed } from "../../misc/KeyManager.js";
import { Keys } from "../../api/common/TutanotaConstants.js";
import { client } from "../../misc/ClientDetector.js";
import { progressIcon } from "./Icon.js";
import { Button } from "./Button.js";
import { ListSwipeHandler } from "./ListSwipeHandler.js";
import { applySafeAreaInsetMarginLR } from "../HtmlUtils.js";
import { theme } from "../theme.js";
import { ProgrammingError } from "../../api/common/error/ProgrammingError.js";
import { styles } from "../styles.js";
export var ListLoadingState;
(function (ListLoadingState) {
    /** not loading anything */
    ListLoadingState[ListLoadingState["Idle"] = 0] = "Idle";
    ListLoadingState[ListLoadingState["Loading"] = 1] = "Loading";
    /** loading was cancelled, e.g. because of the network error or explicit user request */
    ListLoadingState[ListLoadingState["ConnectionLost"] = 2] = "ConnectionLost";
    /** finished loading */
    ListLoadingState[ListLoadingState["Done"] = 3] = "Done";
})(ListLoadingState || (ListLoadingState = {}));
const ScrollBuffer = 15;
/** Displays the items in the virtual list. Can also display progress/cancelled loading state. */
export class List {
    innerDom = null;
    containerDom = null;
    rows = [];
    state = null;
    currentPosition = 0;
    lastAttrs;
    domSwipeSpacerLeft;
    domSwipeSpacerRight;
    loadingIndicatorChildDom;
    swipeHandler;
    width = 0;
    height = 0;
    // remember the last time we needed to scroll somewhere
    activeIndex = null;
    lastThemeId = theme.themeId;
    view({ attrs }) {
        const oldAttrs = this.lastAttrs;
        this.lastAttrs = attrs;
        return m(".list-container.overflow-y-scroll.nofocus.overflow-x-hidden.fill-absolute", {
            "data-testid": "unordered_list",
            oncreate: ({ dom }) => {
                this.containerDom = dom;
                // Some of the tech-savvy users like to disable *all* "experimental features" in their Safari devices and there's also a toggle to disable
                // ResizeObserver. Since the app works without it anyway we just fall back to not handling the resize events.
                if (typeof ResizeObserver !== "undefined") {
                    new ResizeObserver(() => {
                        this.updateSize();
                    }).observe(this.containerDom);
                }
                else {
                    requestAnimationFrame(() => this.updateSize());
                }
                this.swipeHandler = this.createSwipeHandler();
            },
            onscroll: () => {
                this.onScroll(attrs);
            },
        }, this.renderSwipeItems(attrs), 
        // we need rel for the status indicator
        m("ul.list.rel.click", {
            oncreate: ({ dom }) => {
                this.innerDom = dom;
                this.initializeDom(dom, attrs);
                this.updateDomElements(attrs);
                this.state = attrs.state;
                this.lastThemeId = theme.themeId;
                if (styles.isSingleColumnLayout())
                    this.innerDom.focus();
            },
            onupdate: ({ dom }) => {
                if (oldAttrs.renderConfig !== attrs.renderConfig) {
                    // reset everything
                    console.log("list renderConfig has changed, reset");
                    // m.render actually does diffing if you call it on the same dom element again which is not something that we want, we want completely
                    // new dom elements (at least that's the simplest and most reliable way to reset).
                    // so we trick mithril into thinking that nothing was rendered before. mithril will reset the DOM for us too.
                    // @ts-ignore
                    dom.vnodes = null;
                    this.initializeDom(dom, attrs);
                }
                // if the state has changed or the theme has changed we need to update the DOM
                if (this.state !== attrs.state || this.lastThemeId !== theme.themeId) {
                    this.updateDomElements(attrs);
                    this.state = attrs.state;
                }
                this.lastThemeId = theme.themeId;
            },
            onscroll: () => {
                attrs.onLoadMore();
            },
        }));
    }
    createSwipeHandler() {
        return new ListSwipeHandler(this.containerDom, {
            width: () => this.width,
            domSwipeSpacerLeft: () => this.domSwipeSpacerLeft,
            domSwipeSpacerRight: () => this.domSwipeSpacerRight,
            getRowForPosition: (coord) => this.getRowForPosition(coord),
            onSwipeLeft: async (el) => this.lastAttrs.renderConfig.swipe?.swipeLeft(el) ?? 0 /* ListSwipeDecision.Cancel */,
            onSwipeRight: async (el) => this.lastAttrs.renderConfig.swipe?.swipeRight(el) ?? 0 /* ListSwipeDecision.Cancel */,
        });
    }
    getRowForPosition(clientCoordiante) {
        const touchAreaOffset = this.containerDom.getBoundingClientRect().top;
        const relativeYPosition = this.currentPosition + clientCoordiante.y - touchAreaOffset;
        const itemIndex = Math.floor(relativeYPosition / this.lastAttrs.renderConfig.itemHeight);
        const targetElementPosition = itemIndex * this.lastAttrs.renderConfig.itemHeight;
        // We could find the entity just by indexing into it but we would need to scan the rows to find the right one anyway
        // Assuming that the rows are used in the order of their position we could use binary search
        return this.rows.find((ve) => ve.top === targetElementPosition) ?? null;
    }
    VIRTUAL_LIST_LENGTH = 100;
    initializeDom(dom, attrs) {
        const rows = [];
        m.render(dom, 
        // hardcoded number of elements for now
        [numberRange(0, this.VIRTUAL_LIST_LENGTH - 1).map(() => this.createRow(attrs, rows)), this.renderStatusRow()]);
        this.rows = rows;
        if (rows.length !== this.VIRTUAL_LIST_LENGTH) {
            throw new ProgrammingError(`invalid rows length, expected ${this.VIRTUAL_LIST_LENGTH} rows, got ${this.rows.length}`);
        }
        if (attrs.renderConfig.swipe) {
            this.swipeHandler?.attach();
        }
        else {
            this.swipeHandler.detach();
        }
    }
    onScroll(attrs) {
        const visibleElementHeight = this.updateDomElements(attrs);
        this.loadMoreIfNecessary(attrs, visibleElementHeight);
    }
    createRow(attrs, rows) {
        return m("li.list-row.nofocus", {
            draggable: attrs.renderConfig.dragStart ? "true" : undefined,
            tabindex: "0" /* TabIndex.Default */,
            oncreate: (vnode) => {
                const dom = vnode.dom;
                const row = {
                    row: attrs.renderConfig.createElement(dom),
                    domElement: dom,
                    top: -1,
                    entity: null,
                };
                rows.push(row);
                this.setRowEventListeners(attrs, dom, row);
            },
        });
    }
    setRowEventListeners(attrs, domElement, row) {
        const LONG_PRESS_DURATION_MS = 400;
        let touchStartTime = null;
        domElement.onclick = (e) => {
            if (!touchStartTime || Date.now() - touchStartTime < LONG_PRESS_DURATION_MS) {
                if (row.entity)
                    this.handleEvent(row.entity, e);
            }
        };
        domElement.onkeyup = (e) => {
            if (isKeyPressed(e.key, Keys.SPACE, Keys.RETURN)) {
                if (row.entity)
                    this.handleEvent(row.entity, e);
            }
        };
        // Handle highlighting the row when tabbed onto or out of
        const onFocus = (focusType) => {
            return (e) => {
                const dom = e.target;
                // Activate the background colour in `SelectableRowContainer`
                // TODO: Transition to `state-bg`
                if (dom && dom.firstElementChild) {
                    dom.firstElementChild?.dispatchEvent(new FocusEvent(focusType));
                }
            };
        };
        domElement.onfocus = onFocus("focus");
        domElement.onblur = onFocus("blur");
        domElement.ondragstart = (e) => {
            // The quick change of the background color is to prevent a white background appearing in dark mode
            if (row.domElement)
                row.domElement.style.background = theme.navigation_bg;
            requestAnimationFrame(() => {
                if (row.domElement)
                    row.domElement.style.background = "";
            });
            if (attrs.renderConfig.dragStart) {
                if (row.entity && this.state)
                    attrs.renderConfig.dragStart(e, row.entity, this.state.selectedItems);
            }
        };
        if (attrs.renderConfig.multiselectionAllowed === 1 /* MultiselectMode.Enabled */) {
            let timeoutId;
            let touchStartCoords = null;
            domElement.addEventListener("touchstart", (e) => {
                touchStartTime = Date.now();
                // Activate multi selection after pause
                timeoutId = setTimeout(() => {
                    // check that virtualRow.entity exists because we had error feedbacks about it
                    if (row.entity) {
                        attrs.onSingleTogglingMultiselection(row.entity);
                    }
                    m.redraw();
                }, LONG_PRESS_DURATION_MS);
                touchStartCoords = {
                    x: e.touches[0].pageX,
                    y: e.touches[0].pageY,
                };
            });
            const touchEnd = () => {
                if (timeoutId)
                    clearTimeout(timeoutId);
            };
            domElement.addEventListener("touchend", touchEnd);
            domElement.addEventListener("touchcancel", touchEnd);
            domElement.addEventListener("touchmove", (e) => {
                // If the user moved the finger too much by any axis, don't count it as a long press
                const maxDistance = 30;
                const touch = e.touches[0];
                if (touchStartCoords &&
                    timeoutId &&
                    (Math.abs(touch.pageX - touchStartCoords.x) > maxDistance || Math.abs(touch.pageY - touchStartCoords.y) > maxDistance)) {
                    clearTimeout(timeoutId);
                }
            });
        }
    }
    /**
     * Updates the given list of selected items with a click on the given clicked item. Takes ctrl and shift key events into consideration for multi selection.
     * If ctrl is pressed the selection status of the clickedItem is toggled.
     * If shift is pressed, all items beginning from the nearest selected item to the clicked item are additionally selected.
     * If neither ctrl nor shift are pressed only the clicked item is selected.
     */
    handleEvent(clickedEntity, event) {
        // normal click changes the selection to a single
        // ctrl click toggles the selection for an item and enables multiselect
        // shift click selects a lot of things and enabled multiselect
        // (there are also key press handlers but they are invoked from another place)
        let changeType;
        if ((client.isMobileDevice() && this.lastAttrs.state.inMultiselect) || event.ctrlKey || (client.isMacOS && event.metaKey)) {
            changeType = "togglingIncludingSingle";
        }
        else if (event.shiftKey) {
            changeType = "range";
        }
        else {
            changeType = "single";
        }
        this.changeSelection(clickedEntity, changeType);
    }
    /**
     * changeType:
     *  * single: one item selection (not multiselect)
     *  * togglingIncludingSingle: if not in multiselect, start multiselect. Turns multiselect on or off for the item. Includes the item from single selection
     *    when turning multiselect on.
     *  * togglingNewMultiselect: if not in multiselect, start multiselect. Turns multiselect on or off for the item. Only selected item will be in multiselect
     *    when turning multiselect on.
     *  * range: range selection, extends the range until the selected item
     */
    changeSelection(clickedEntity, changeType) {
        switch (changeType) {
            case "single":
                this.lastAttrs.onSingleSelection(clickedEntity);
                break;
            case "togglingIncludingSingle":
                if (this.lastAttrs.renderConfig.multiselectionAllowed === 1 /* MultiselectMode.Enabled */) {
                    this.lastAttrs.onSingleTogglingMultiselection(clickedEntity);
                }
                break;
            case "range":
                if (this.lastAttrs.renderConfig.multiselectionAllowed === 1 /* MultiselectMode.Enabled */) {
                    this.lastAttrs.onRangeSelectionTowards(clickedEntity);
                }
                break;
        }
    }
    updateDomElements(attrs) {
        // if resize didn't kick in yet, measure it right away once
        if (this.height === 0)
            this.height = this.containerDom.clientHeight;
        const rowHeight = attrs.renderConfig.itemHeight;
        // plus loading indicator
        // should depend on whether we are completely loaded maybe?
        const statusHeight = attrs.state.loadingStatus === ListLoadingState.Done ? 0 : size.list_row_height;
        this.innerDom.style.height = px(attrs.state.items.length * rowHeight + statusHeight);
        if (attrs.state.activeIndex != null && attrs.state.activeIndex !== this.activeIndex) {
            const index = attrs.state.activeIndex;
            const desiredPosition = attrs.state.activeIndex * rowHeight;
            if (desiredPosition > this.containerDom.scrollTop + this.height || desiredPosition < this.containerDom.scrollTop) {
                console.log("active item out of screen, scrolling to", index, desiredPosition);
                this.currentPosition = this.containerDom.scrollTop = desiredPosition;
            }
            else {
                this.currentPosition = this.containerDom.scrollTop;
            }
        }
        else {
            this.currentPosition = this.containerDom.scrollTop;
        }
        this.activeIndex = attrs.state.activeIndex;
        const visibleElements = 2 * Math.ceil(this.height / rowHeight / 2); // divide and multiply by two to get an even number
        const visibleElementsHeight = visibleElements * rowHeight;
        const bufferHeight = ScrollBuffer * rowHeight;
        const maxStartPosition = rowHeight * attrs.state.items.length - bufferHeight * 2 - visibleElementsHeight;
        let nextPosition = this.currentPosition - (this.currentPosition % rowHeight) - bufferHeight;
        if (nextPosition < 0) {
            nextPosition = 0;
        }
        else if (nextPosition > maxStartPosition) {
            nextPosition = maxStartPosition;
        }
        for (const row of this.rows) {
            row.top = nextPosition;
            nextPosition += rowHeight;
            const pos = row.top / rowHeight;
            const item = attrs.state.items[pos];
            row.entity = item;
            if (!item) {
                row.domElement.style.display = "none";
            }
            else {
                row.domElement.style.display = "";
                row.domElement.style.transform = `translateY(${row.top}px)`;
                row.row.update(item, attrs.state.selectedItems.has(item), attrs.state.inMultiselect);
            }
            // Focus the selected row so it can receive keyboard events if the user has just changed it
            if (attrs.state.selectedItems.has(item) && (!this.state?.selectedItems.has(item) || this.state == null)) {
                row.domElement.focus();
            }
        }
        this.updateStatus(attrs.state.loadingStatus);
        this.loadMoreIfNecessary(attrs, visibleElementsHeight);
        return visibleElementsHeight;
    }
    updateStatus = memoized((status) => {
        switch (status) {
            case ListLoadingState.Idle:
            case ListLoadingState.Done:
                m.render(this.loadingIndicatorChildDom, null);
                this.loadingIndicatorChildDom.style.display = "none";
                break;
            case ListLoadingState.Loading:
                m.render(this.loadingIndicatorChildDom, this.renderLoadingIndicator());
                this.loadingIndicatorChildDom.style.display = "";
                break;
            case ListLoadingState.ConnectionLost:
                m.render(this.loadingIndicatorChildDom, this.renderConnectionLostIndicator());
                this.loadingIndicatorChildDom.style.display = "";
                break;
        }
    });
    renderLoadingIndicator() {
        return m(".flex-center.items-center", {
            style: {
                height: px(size.list_row_height),
                width: "100%",
                position: "absolute",
                gap: px(size.hpad_small),
            },
        }, progressIcon(), m(Button, {
            label: "cancel_action",
            type: "primary" /* ButtonType.Primary */,
            click: () => this.lastAttrs.onStopLoading(),
        }));
    }
    renderConnectionLostIndicator() {
        return m(".plr-l.flex-center.items-center", {
            style: {
                height: px(size.list_row_height),
            },
        }, m(Button, {
            label: "loadMore_action",
            type: "primary" /* ButtonType.Primary */,
            click: () => this.retryLoading(),
        }));
    }
    retryLoading() {
        this.lastAttrs.onRetryLoading();
    }
    async loadMoreIfNecessary(attrs, visibleElementsHeight) {
        // WARNING this is hacky:
        // lastBunchVisible depends on visibleElementsHeight which is set inside _createVirtualRows which might not have completed by the time we
        // reach here, so waiting for domDeferred guarantees that oncreate has finished running, and in turn that _createVirtualRows has completed
        const lastBunchVisible = this.currentPosition > attrs.state.items.length * attrs.renderConfig.itemHeight - visibleElementsHeight * 2;
        if (lastBunchVisible && attrs.state.loadingStatus == ListLoadingState.Idle) {
            await attrs.onLoadMore();
        }
    }
    renderStatusRow() {
        return m("li.list-row", {
            style: {
                bottom: 0,
                height: px(size.list_row_height),
                display: this.shouldDisplayStatusRow() ? "none" : null,
            },
            oncreate: (vnode) => {
                this.loadingIndicatorChildDom = vnode.dom;
            },
        });
    }
    shouldDisplayStatusRow() {
        return this.state?.loadingStatus === ListLoadingState.Done || this.state?.loadingStatus === ListLoadingState.Idle;
    }
    renderSwipeItems(attrs) {
        if (attrs.renderConfig.swipe == null) {
            return null;
        }
        return [
            m(".swipe-spacer.flex.items-center.justify-end.pr-l.blue", {
                oncreate: (vnode) => (this.domSwipeSpacerLeft = vnode.dom),
                tabindex: "-1" /* TabIndex.Programmatic */,
                "aria-hidden": "true",
                style: {
                    height: px(attrs.renderConfig.itemHeight),
                    transform: `translateY(-${attrs.renderConfig.itemHeight}px)`,
                    position: "absolute",
                    "z-index": 1,
                    // width: px(this.width),
                },
            }, attrs.renderConfig.swipe.renderLeftSpacer()),
            m(".swipe-spacer.flex.items-center.pl-l.red", {
                oncreate: (vnode) => (this.domSwipeSpacerRight = vnode.dom),
                tabindex: "-1" /* TabIndex.Programmatic */,
                "aria-hidden": "true",
                style: {
                    height: px(attrs.renderConfig.itemHeight),
                    transform: `translateY(-${attrs.renderConfig.itemHeight}px)`,
                    position: "absolute",
                    "z-index": 1,
                    // width: px(this.width),
                },
            }, attrs.renderConfig.swipe.renderRightSpacer()),
        ];
    }
    updateSize() {
        const containerDom = this.containerDom;
        if (containerDom && this.domSwipeSpacerLeft && this.domSwipeSpacerRight) {
            this.domSwipeSpacerLeft.style.opacity = "0";
            this.domSwipeSpacerRight.style.opacity = "0";
            this.doUpdateWidth(containerDom);
        }
    }
    doUpdateWidth = debounce(60, (containerDom) => {
        this.width = containerDom.clientWidth;
        this.height = containerDom.clientHeight;
        if (this.swipeHandler) {
            // with different zoom levels Blink does weird things and shows parts of elements that it shouldn't so we shift them around by a pixel
            const translateX = this.width + 1;
            this.domSwipeSpacerLeft.style.width = px(this.width);
            this.domSwipeSpacerRight.style.width = px(this.width);
            this.domSwipeSpacerLeft.style.transform = `translateX(${-translateX}px) translateY(0px)`;
            this.domSwipeSpacerRight.style.transform = `translateX(${translateX}px) translateY(0px)`;
            for (const row of this.rows) {
                if (row.domElement)
                    applySafeAreaInsetMarginLR(row.domElement);
            }
            this.domSwipeSpacerLeft.style.opacity = "1";
            this.domSwipeSpacerRight.style.opacity = "1";
        }
    });
}
//# sourceMappingURL=List.js.map