import { ListLoadingState } from "../gui/base/List.js";
import { assertNonNull, binarySearch, defer, findBy, findLast, first, getFirstOrThrow, last, lastThrow, memoizedWithHiddenArgument, remove, setAddAll, setEquals, setMap, settledThen, } from "@tutao/tutanota-utils";
import Stream from "mithril/stream";
import stream from "mithril/stream";
import { PageSize } from "../gui/base/ListUtils.js";
import { isOfflineError } from "../api/common/utils/ErrorUtils.js";
import { ListAutoSelectBehavior } from "./DeviceConfig.js";
/** ListModel that does the state upkeep for the List, including loading state, loaded items, selection and filters*/
export class ListModel {
    config;
    constructor(config) {
        this.config = config;
    }
    loadState = "created";
    loading = Promise.resolve();
    filter = null;
    rangeSelectionAnchorItem = null;
    get state() {
        return this.stateStream();
    }
    get rawState() {
        return this.rawStateStream();
    }
    defaultRawStateStream = {
        unfilteredItems: [],
        filteredItems: [],
        inMultiselect: false,
        loadingStatus: ListLoadingState.Idle,
        loadingAll: false,
        selectedItems: new Set(),
        activeItem: null,
    };
    rawStateStream = stream(this.defaultRawStateStream);
    stateStream = this.rawStateStream.map((state) => {
        const activeItem = state.activeItem;
        const foundIndex = activeItem ? binarySearch(state.filteredItems, activeItem, (l, r) => this.config.sortCompare(l, r)) : -1;
        const activeIndex = foundIndex < 0 ? null : foundIndex;
        return { ...state, items: state.filteredItems, activeIndex };
    });
    differentItemsSelected = Stream.scan((acc, state) => {
        const newSelectedIds = setMap(state.selectedItems, (item) => this.config.getItemId(item));
        const oldSelectedIds = setMap(acc, (item) => this.config.getItemId(item));
        if (setEquals(oldSelectedIds, newSelectedIds)) {
            // Stream.scan type definitions does not take it into account
            return Stream.SKIP;
        }
        else {
            return state.selectedItems;
        }
    }, new Set(), this.stateStream);
    updateState(newStatePart) {
        this.rawStateStream({ ...this.rawState, ...newStatePart });
    }
    waitUtilInit() {
        const deferred = defer();
        const subscription = this.rawStateStream.map(() => {
            if (this.loadState === "initialized") {
                Promise.resolve().then(() => {
                    subscription.end(true);
                    deferred.resolve(undefined);
                });
            }
        });
        return deferred.promise;
    }
    async loadInitial() {
        if (this.loadState !== "created") {
            return;
        }
        this.loadState = "initialized";
        await this.doLoad();
    }
    async loadMore() {
        if (this.rawState.loadingStatus === ListLoadingState.Loading) {
            return this.loading;
        }
        if (this.loadState !== "initialized" || this.rawState.loadingStatus !== ListLoadingState.Idle) {
            return;
        }
        await this.doLoad();
    }
    async retryLoading() {
        if (this.loadState !== "initialized" || this.rawState.loadingStatus !== ListLoadingState.ConnectionLost) {
            return;
        }
        await this.doLoad();
    }
    updateLoadingStatus(status) {
        if (this.rawState.loadingStatus === status)
            return;
        this.updateState({ loadingStatus: status });
    }
    async doLoad() {
        this.updateLoadingStatus(ListLoadingState.Loading);
        this.loading = Promise.resolve().then(async () => {
            const lastFetchedItem = last(this.rawState.unfilteredItems);
            try {
                const { items: newItems, complete } = await this.config.fetch(lastFetchedItem, PageSize);
                // if the loading was cancelled in the meantime, don't insert anything so that it's not confusing
                if (this.state.loadingStatus === ListLoadingState.ConnectionLost) {
                    return;
                }
                const newUnfilteredItems = [...this.rawState.unfilteredItems, ...newItems];
                newUnfilteredItems.sort(this.config.sortCompare);
                const newFilteredItems = [...this.rawState.filteredItems, ...this.applyFilter(newItems)];
                newFilteredItems.sort(this.config.sortCompare);
                const loadingStatus = complete ? ListLoadingState.Done : ListLoadingState.Idle;
                this.updateState({ loadingStatus, unfilteredItems: newUnfilteredItems, filteredItems: newFilteredItems });
            }
            catch (e) {
                this.updateLoadingStatus(ListLoadingState.ConnectionLost);
                if (!isOfflineError(e)) {
                    throw e;
                }
            }
        });
        return this.loading;
    }
    applyFilter(newItems) {
        return newItems.filter(this.filter ?? (() => true));
    }
    setFilter(filter) {
        this.filter = filter;
        this.reapplyFilter();
    }
    reapplyFilter() {
        const newFilteredItems = this.applyFilter(this.rawState.unfilteredItems);
        const newSelectedItems = new Set(this.applyFilter([...this.state.selectedItems]));
        this.updateState({ filteredItems: newFilteredItems, selectedItems: newSelectedItems });
    }
    onSingleSelection(item) {
        this.updateState({ selectedItems: new Set([item]), inMultiselect: false, activeItem: item });
        this.rangeSelectionAnchorItem = item;
    }
    /** An item was added to the selection. If multiselect was not on, discard previous single selection and only added selected item to the selection. */
    onSingleExclusiveSelection(item) {
        if (!this.rawState.inMultiselect) {
            this.updateState({ selectedItems: new Set([item]), inMultiselect: true, activeItem: item });
            this.rangeSelectionAnchorItem = item;
        }
        else {
            const selectedItems = new Set(this.state.selectedItems);
            if (selectedItems.has(item)) {
                selectedItems.delete(item);
            }
            else {
                selectedItems.add(item);
            }
            if (selectedItems.size === 0) {
                this.updateState({ selectedItems, inMultiselect: false, activeItem: null });
                this.rangeSelectionAnchorItem = null;
            }
            else {
                this.updateState({ selectedItems, inMultiselect: true, activeItem: item });
                this.rangeSelectionAnchorItem = item;
            }
        }
    }
    /** An item was added to the selection. If multiselect was not on, add previous single selection and newly added selected item to the selection. */
    onSingleInclusiveSelection(item, clearSelectionOnMultiSelectStart) {
        // If it isn't in MultiSelect, we discard all previous items
        // and start a new set of selected items in MultiSelect mode
        // we do it only if the user is on singleColumnMode, because
        // there are different expected behaviors there
        if (!this.state.inMultiselect && clearSelectionOnMultiSelectStart) {
            this.selectNone();
        }
        const selectedItems = new Set(this.state.selectedItems);
        if (this.state.inMultiselect && selectedItems.has(item)) {
            selectedItems.delete(item);
        }
        else {
            selectedItems.add(item);
        }
        if (selectedItems.size === 0) {
            this.updateState({ selectedItems, inMultiselect: false, activeItem: null });
            this.rangeSelectionAnchorItem = null;
        }
        else {
            this.updateState({ selectedItems, inMultiselect: true, activeItem: item });
            this.rangeSelectionAnchorItem = item;
        }
    }
    async loadAndSelect(finder, shouldStop) {
        await this.waitUtilInit();
        let foundItem = undefined;
        while (
        // if we did find the target mail, stop
        // make sure to call this before shouldStop or we might stop before trying to find an item
        // this can probably be optimized to be binary search in most (all?) cases
        !(foundItem = this.rawState.unfilteredItems.find(finder)) &&
            !shouldStop() &&
            // if we are done loading, stop
            this.rawState.loadingStatus !== ListLoadingState.Done &&
            // if we are offline, stop
            this.rawState.loadingStatus !== ListLoadingState.ConnectionLost) {
            await this.loadMore();
        }
        if (foundItem) {
            this.onSingleSelection(foundItem);
        }
        return foundItem ?? null;
    }
    selectRangeTowards(item) {
        const selectedItems = new Set(this.state.selectedItems);
        if (selectedItems.size === 0) {
            selectedItems.add(item);
        }
        else {
            // we are trying to find the item that's closest to the clicked one
            // and after that we will select everything between the closest and the clicked one
            const clickedItemIndex = this.state.items.indexOf(item);
            let nearestSelectedIndex = null;
            // find absolute min based on the distance (closest)
            for (const selectedItem of selectedItems) {
                const currentSelectedItemIndex = this.state.items.indexOf(selectedItem);
                if (nearestSelectedIndex == null || Math.abs(clickedItemIndex - currentSelectedItemIndex) < Math.abs(clickedItemIndex - nearestSelectedIndex)) {
                    nearestSelectedIndex = currentSelectedItemIndex;
                }
            }
            assertNonNull(nearestSelectedIndex);
            const itemsToAddToSelection = [];
            if (nearestSelectedIndex < clickedItemIndex) {
                for (let i = nearestSelectedIndex + 1; i <= clickedItemIndex; i++) {
                    itemsToAddToSelection.push(this.state.items[i]);
                }
            }
            else {
                for (let i = clickedItemIndex; i < nearestSelectedIndex; i++) {
                    itemsToAddToSelection.push(this.state.items[i]);
                }
            }
            setAddAll(selectedItems, itemsToAddToSelection);
        }
        this.updateState({ selectedItems, inMultiselect: true, activeItem: item });
        this.rangeSelectionAnchorItem = item;
    }
    selectPrevious(multiselect) {
        const oldActiveItem = this.rawState.activeItem;
        const newActiveItem = this.getPreviousItem(oldActiveItem);
        if (newActiveItem != null) {
            if (!multiselect) {
                this.onSingleSelection(newActiveItem);
            }
            else {
                const selectedItems = new Set(this.state.selectedItems);
                this.rangeSelectionAnchorItem = this.rangeSelectionAnchorItem ?? first(this.state.items);
                if (!this.rangeSelectionAnchorItem)
                    return;
                const previousActiveIndex = this.state.activeIndex ?? 0;
                const towardsAnchor = this.config.sortCompare(oldActiveItem ?? getFirstOrThrow(this.state.items), this.rangeSelectionAnchorItem) > 0;
                if (towardsAnchor) {
                    // remove
                    selectedItems.delete(this.state.items[previousActiveIndex]);
                }
                else {
                    // add
                    selectedItems.add(newActiveItem);
                }
                this.updateState({ activeItem: newActiveItem, selectedItems, inMultiselect: true });
            }
        }
    }
    getPreviousItem(oldActiveItem) {
        return oldActiveItem == null
            ? first(this.state.items)
            : findLast(this.state.items, (item) => this.config.sortCompare(item, oldActiveItem) < 0) ?? first(this.state.items);
    }
    selectNext(multiselect) {
        const oldActiveItem = this.rawState.activeItem;
        const lastItem = last(this.state.items);
        const newActiveItem = this.getNextItem(oldActiveItem, lastItem);
        if (newActiveItem != null) {
            if (!multiselect) {
                this.onSingleSelection(newActiveItem);
            }
            else {
                const selectedItems = new Set(this.state.selectedItems);
                this.rangeSelectionAnchorItem = this.rangeSelectionAnchorItem ?? first(this.state.items);
                if (!this.rangeSelectionAnchorItem)
                    return;
                const previousActiveIndex = this.state.activeIndex ?? 0;
                const towardsAnchor = this.config.sortCompare(oldActiveItem ?? getFirstOrThrow(this.state.items), this.rangeSelectionAnchorItem) < 0;
                if (towardsAnchor) {
                    selectedItems.delete(this.state.items[previousActiveIndex]);
                }
                else {
                    selectedItems.add(newActiveItem);
                }
                this.updateState({ selectedItems, inMultiselect: true, activeItem: newActiveItem });
            }
        }
    }
    getNextItem(oldActiveItem, lastItem) {
        return oldActiveItem == null
            ? first(this.state.items)
            : lastItem && this.config.sortCompare(lastItem, oldActiveItem) <= 0
                ? lastItem
                : this.state.items.find((item) => this.config.sortCompare(item, oldActiveItem) > 0) ?? first(this.state.items);
    }
    areAllSelected() {
        return this.rawState.inMultiselect && this.state.selectedItems.size === this.state.items.length;
    }
    selectAll() {
        this.updateState({ selectedItems: new Set(this.state.items), activeItem: null, inMultiselect: true });
        this.rangeSelectionAnchorItem = null;
    }
    selectNone() {
        this.rangeSelectionAnchorItem = null;
        this.updateState({ selectedItems: new Set(), inMultiselect: false });
    }
    isItemSelected(itemId) {
        return findBy(this.state.selectedItems, (item) => this.config.isSameId(this.config.getItemId(item), itemId)) != null;
    }
    getSelectedAsArray = memoizedWithHiddenArgument(() => this.state, (state) => [...state.selectedItems]);
    isSelectionEmpty = memoizedWithHiddenArgument(() => this.state, (state) => state.selectedItems.size === 0);
    getUnfilteredAsArray = memoizedWithHiddenArgument(() => this.rawState, (state) => [...state.unfilteredItems]);
    enterMultiselect() {
        // avoid having the viewed item as a preselected one which might be confusing.
        this.selectNone();
        this.updateState({ inMultiselect: true });
    }
    sort() {
        const filteredItems = this.rawState.filteredItems.slice().sort(this.config.sortCompare);
        const unfilteredItems = this.rawState.filteredItems.slice().sort(this.config.sortCompare);
        this.updateState({ filteredItems, unfilteredItems });
    }
    isLoadedCompletely() {
        return this.rawState.loadingStatus === ListLoadingState.Done;
    }
    cancelLoadAll() {
        if (this.state.loadingAll) {
            this.updateState({ loadingAll: false });
        }
    }
    async loadAll() {
        if (this.rawState.loadingAll)
            return;
        this.updateState({ loadingAll: true });
        try {
            while (this.rawState.loadingAll && !this.isLoadedCompletely()) {
                await this.loadMore();
                this.selectAll();
            }
        }
        finally {
            this.cancelLoadAll();
        }
    }
    isEmptyAndDone() {
        return this.state.items.length === 0 && this.state.loadingStatus === ListLoadingState.Done;
    }
    stopLoading() {
        if (this.state.loadingStatus === ListLoadingState.Loading) {
            // We can't really cancel ongoing requests, but we can prevent more requests from happening
            this.updateState({ loadingStatus: ListLoadingState.ConnectionLost });
        }
    }
    waitLoad(what) {
        return settledThen(this.loading, what);
    }
    insertLoadedItem(item) {
        if (this.rawState.unfilteredItems.some((unfilteredItem) => this.hasSameId(unfilteredItem, item))) {
            return;
        }
        // can we do something like binary search?
        const unfilteredItems = this.rawState.unfilteredItems.concat(item).sort(this.config.sortCompare);
        const filteredItems = this.rawState.filteredItems.concat(this.applyFilter([item])).sort(this.config.sortCompare);
        this.updateState({ filteredItems, unfilteredItems });
    }
    updateLoadedItem(item) {
        // We cannot use binary search here because the sort order of items can change based on an entity update, and we need to find the position of the
        // old entity by id in order to remove it.
        // Since every item id is unique and there's no scenario where the same item appears twice but in different lists, we can safely sort just
        // by the item id, ignoring the list id
        // update unfiltered list: find the position, take out the old item and put the updated one
        const positionToUpdateUnfiltered = this.rawState.unfilteredItems.findIndex((unfilteredItem) => this.hasSameId(unfilteredItem, item));
        const unfilteredItems = this.rawState.unfilteredItems.slice();
        if (positionToUpdateUnfiltered >= 0) {
            unfilteredItems.splice(positionToUpdateUnfiltered, 1, item);
            unfilteredItems.sort(this.config.sortCompare);
        }
        // update filtered list & selected items
        const positionToUpdateFiltered = this.rawState.filteredItems.findIndex((filteredItem) => this.hasSameId(filteredItem, item));
        const filteredItems = this.rawState.filteredItems.slice();
        const selectedItems = new Set(this.rawState.selectedItems);
        if (positionToUpdateFiltered >= 0) {
            const [oldItem] = filteredItems.splice(positionToUpdateFiltered, 1, item);
            filteredItems.sort(this.config.sortCompare);
            if (selectedItems.delete(oldItem)) {
                selectedItems.add(item);
            }
        }
        // keep active item up-to-date
        const activeItemUpdated = this.rawState.activeItem != null && this.hasSameId(this.rawState.activeItem, item);
        const newActiveItem = this.rawState.activeItem;
        if (positionToUpdateUnfiltered !== -1 || positionToUpdateFiltered !== -1 || activeItemUpdated) {
            this.updateState({ unfilteredItems, filteredItems, selectedItems, activeItem: newActiveItem });
        }
        // keep anchor up-to-date
        if (this.rangeSelectionAnchorItem != null && this.hasSameId(this.rangeSelectionAnchorItem, item)) {
            this.rangeSelectionAnchorItem = item;
        }
    }
    deleteLoadedItem(itemId) {
        return settledThen(this.loading, () => {
            const item = this.rawState.filteredItems.find((e) => this.config.isSameId(this.config.getItemId(e), itemId));
            const selectedItems = new Set(this.rawState.selectedItems);
            let newActiveItem;
            if (item) {
                const wasRemoved = selectedItems.delete(item);
                if (this.rawState.filteredItems.length > 1) {
                    const desiredBehavior = this.config.autoSelectBehavior?.() ?? null;
                    if (wasRemoved) {
                        if (desiredBehavior === ListAutoSelectBehavior.NONE || this.state.inMultiselect) {
                            selectedItems.clear();
                        }
                        else if (desiredBehavior === ListAutoSelectBehavior.NEWER) {
                            newActiveItem = this.getPreviousItem(item);
                        }
                        else {
                            newActiveItem = item === last(this.state.items) ? this.getPreviousItem(item) : this.getNextItem(item, null);
                        }
                    }
                    if (newActiveItem) {
                        selectedItems.add(newActiveItem);
                    }
                    else {
                        newActiveItem = this.rawState.activeItem;
                    }
                }
                const filteredItems = this.rawState.filteredItems.slice();
                remove(filteredItems, item);
                const unfilteredItems = this.rawState.unfilteredItems.slice();
                remove(unfilteredItems, item);
                this.updateState({ filteredItems, selectedItems, unfilteredItems, activeItem: newActiveItem });
            }
        });
    }
    getLastItem() {
        if (this.rawState.unfilteredItems.length > 0) {
            return lastThrow(this.rawState.unfilteredItems);
        }
        else {
            return null;
        }
    }
    hasSameId(item1, item2) {
        const id1 = this.config.getItemId(item1);
        const id2 = this.config.getItemId(item2);
        return this.config.isSameId(id1, id2);
    }
    canInsertItem(entity) {
        if (this.state.loadingStatus === ListLoadingState.Done) {
            return true;
        }
        // new element is in the loaded range or newer than the first element
        const lastElement = this.getLastItem();
        return lastElement != null && this.config.sortCompare(entity, lastElement) < 0;
    }
}
export function selectionAttrsForList(listModel) {
    return {
        selected: listModel?.areAllSelected() ?? false,
        selectNone: () => listModel?.selectNone(),
        selectAll: () => listModel?.selectAll(),
    };
}
//# sourceMappingURL=ListModel.js.map