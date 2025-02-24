import { ListModel } from "./ListModel";
import { getElementId, isSameId } from "../api/common/utils/EntityUtils";
/**
 * List model that provides ListElement functionality.
 *
 * Internally wraps around a ListModel<ElementType, Id>.
 */
export class ListElementListModel {
    listModel;
    config;
    get state() {
        return this.listModel.state;
    }
    get differentItemsSelected() {
        return this.listModel.differentItemsSelected;
    }
    get stateStream() {
        return this.listModel.stateStream;
    }
    constructor(config) {
        const theBestConfig = {
            ...config,
            isSameId,
            getItemId: getElementId,
        };
        this.listModel = new ListModel(theBestConfig);
        this.config = theBestConfig;
    }
    async entityEventReceived(listId, elementId, operation) {
        if (operation === "0" /* OperationType.CREATE */ || operation === "1" /* OperationType.UPDATE */) {
            // load the element without range checks for now
            const entity = await this.config.loadSingle(listId, elementId);
            if (!entity) {
                return;
            }
            // Wait for any pending loading
            return this.listModel.waitLoad(() => {
                if (operation === "0" /* OperationType.CREATE */) {
                    if (this.listModel.canInsertItem(entity)) {
                        this.listModel.insertLoadedItem(entity);
                    }
                }
                else if (operation === "1" /* OperationType.UPDATE */) {
                    this.listModel.updateLoadedItem(entity);
                }
            });
        }
        else if (operation === "2" /* OperationType.DELETE */) {
            // await this.swipeHandler?.animating
            await this.listModel.deleteLoadedItem(elementId);
        }
    }
    async loadAndSelect(itemId, shouldStop, finder = (item) => isSameId(getElementId(item), itemId)) {
        return this.listModel.loadAndSelect(finder, shouldStop);
    }
    isItemSelected(itemId) {
        return this.listModel.isItemSelected(itemId);
    }
    enterMultiselect() {
        return this.listModel.enterMultiselect();
    }
    stopLoading() {
        return this.listModel.stopLoading();
    }
    isEmptyAndDone() {
        return this.listModel.isEmptyAndDone();
    }
    isSelectionEmpty() {
        return this.listModel.isSelectionEmpty();
    }
    getUnfilteredAsArray() {
        return this.listModel.getUnfilteredAsArray();
    }
    sort() {
        return this.listModel.sort();
    }
    async loadMore() {
        return this.listModel.loadMore();
    }
    async loadAll() {
        return this.listModel.loadAll();
    }
    async retryLoading() {
        return this.listModel.retryLoading();
    }
    onSingleSelection(item) {
        return this.listModel.onSingleSelection(item);
    }
    onSingleInclusiveSelection(item, clearSelectionOnMultiSelectStart) {
        return this.listModel.onSingleInclusiveSelection(item, clearSelectionOnMultiSelectStart);
    }
    onSingleExclusiveSelection(item) {
        return this.listModel.onSingleExclusiveSelection(item);
    }
    selectRangeTowards(item) {
        return this.listModel.selectRangeTowards(item);
    }
    areAllSelected() {
        return this.listModel.areAllSelected();
    }
    selectNone() {
        return this.listModel.selectNone();
    }
    selectAll() {
        return this.listModel.selectAll();
    }
    selectPrevious(multiselect) {
        return this.listModel.selectPrevious(multiselect);
    }
    selectNext(multiselect) {
        return this.listModel.selectNext(multiselect);
    }
    cancelLoadAll() {
        return this.listModel.cancelLoadAll();
    }
    async loadInitial() {
        return this.listModel.loadInitial();
    }
    reapplyFilter() {
        return this.listModel.reapplyFilter();
    }
    setFilter(filter) {
        return this.listModel.setFilter(filter);
    }
    getSelectedAsArray() {
        return this.listModel.getSelectedAsArray();
    }
    isLoadedCompletely() {
        return this.listModel.isLoadedCompletely();
    }
    updateLoadingStatus(status) {
        return this.listModel.updateLoadingStatus(status);
    }
}
//# sourceMappingURL=ListElementListModel.js.map