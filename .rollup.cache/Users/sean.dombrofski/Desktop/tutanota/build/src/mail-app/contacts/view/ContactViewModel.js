import { ListElementListModel } from "../../../common/misc/ListElementListModel.js";
import { ContactTypeRef } from "../../../common/api/entities/tutanota/TypeRefs.js";
import { compareContacts } from "./ContactGuiUtils.js";
import { assertNotNull, lazyMemoized } from "@tutao/tutanota-utils";
import { getElementId } from "../../../common/api/common/utils/EntityUtils.js";
import { isUpdateForTypeRef } from "../../../common/api/common/utils/EntityUpdateUtils.js";
import { ListAutoSelectBehavior } from "../../../common/misc/DeviceConfig.js";
/** ViewModel for the overall contact view. */
export class ContactViewModel {
    contactModel;
    entityClient;
    eventController;
    router;
    updateUi;
    contactListId;
    /** id of the contact we are trying to load based on the url */
    targetContactId = null;
    sortByFirstName = true;
    listModelStateStream = null;
    constructor(contactModel, entityClient, eventController, router, updateUi) {
        this.contactModel = contactModel;
        this.entityClient = entityClient;
        this.eventController = eventController;
        this.router = router;
        this.updateUi = updateUi;
    }
    listModel = new ListElementListModel({
        fetch: async () => {
            const items = await this.entityClient.loadAll(ContactTypeRef, this.contactListId);
            return { items, complete: true };
        },
        loadSingle: async (_listId, elementId) => {
            const listId = await this.contactModel.getContactListId();
            if (listId == null)
                return null;
            return this.entityClient.load(ContactTypeRef, [listId, elementId]);
        },
        sortCompare: (c1, c2) => compareContacts(c1, c2, this.sortByFirstName),
        autoSelectBehavior: () => ListAutoSelectBehavior.NONE,
    });
    async init(contactListId) {
        // update url if the view was just opened
        if (contactListId == null)
            this.updateUrl();
        if (this.contactListId)
            return;
        this.contactListId = assertNotNull(await this.contactModel.getContactListId(), "not available for external users");
        this.initOnce();
        await this.listModel.loadInitial();
    }
    async selectContact(contactId) {
        // We are loading all contacts at once anyway so we are not worried about starting parallel loads for target
        await this.loadAndSelect(contactId);
    }
    initOnce = lazyMemoized(() => {
        this.eventController.addEntityListener(this.entityListener);
        this.listModelStateStream = this.listModel.stateStream.map(() => {
            this.updateUi();
            this.updateUrl();
        });
    });
    updateUrl() {
        const contactId = this.targetContactId ??
            (!this.listModel.state.inMultiselect && this.listModel.getSelectedAsArray().length === 1
                ? getElementId(this.listModel.getSelectedAsArray()[0])
                : null);
        if (contactId) {
            this.router.routeTo(`/contact/:listId/:contactId`, { listId: this.contactListId, contactId: contactId });
        }
        else {
            this.router.routeTo(`/contact/:listId`, { listId: this.contactListId });
        }
    }
    entityListener = async (updates) => {
        for (const update of updates) {
            const { instanceListId, instanceId, operation } = update;
            if (isUpdateForTypeRef(ContactTypeRef, update) && instanceListId === this.contactListId) {
                await this.listModel.entityEventReceived(instanceListId, instanceId, operation);
            }
        }
    };
    async loadAndSelect(contactId) {
        const listId = this.contactListId;
        this.targetContactId = contactId;
        await this.listModel.loadAndSelect(contactId, () => this.contactListId !== listId && this.targetContactId === contactId);
        // if we reached the goal and the target wasn't swapped in between
        if (this.targetContactId === contactId) {
            this.targetContactId = null;
        }
    }
    setSortByFirstName(sorting) {
        this.sortByFirstName = sorting;
        this.listModel.sort();
    }
    listState() {
        return this.listModel.state;
    }
    dispose() {
        this.eventController.removeEntityListener(this.entityListener);
        this.listModelStateStream?.end(true);
        this.listModelStateStream = null;
    }
}
//# sourceMappingURL=ContactViewModel.js.map