import { ListElementListModel } from "../../../common/misc/ListElementListModel.js";
import { ContactListEntryTypeRef, ContactListGroupRootTypeRef, ContactTypeRef, createContactListEntry, } from "../../../common/api/entities/tutanota/TypeRefs.js";
import { getEtId, isSameId } from "../../../common/api/common/utils/EntityUtils.js";
import { arrayEquals, debounce, lazyMemoized, memoized } from "@tutao/tutanota-utils";
import stream from "mithril/stream";
import { locator } from "../../../common/api/main/CommonLocator.js";
import { isUpdateForTypeRef } from "../../../common/api/common/utils/EntityUpdateUtils.js";
import { ListAutoSelectBehavior } from "../../../common/misc/DeviceConfig.js";
export class ContactListViewModel {
    entityClient;
    groupManagementFacade;
    loginController;
    eventController;
    contactModel;
    contactListInvitations;
    router;
    updateUi;
    selectedContactList = null;
    contactsForSelectedEntry = [];
    listModelStateStream = null;
    sortedContactListInfos = stream([]);
    sortedSharedContactListInfos = stream([]);
    constructor(entityClient, groupManagementFacade, loginController, eventController, contactModel, contactListInvitations, router, updateUi) {
        this.entityClient = entityClient;
        this.groupManagementFacade = groupManagementFacade;
        this.loginController = loginController;
        this.eventController = eventController;
        this.contactModel = contactModel;
        this.contactListInvitations = contactListInvitations;
        this.router = router;
        this.updateUi = updateUi;
    }
    async showListAndEntry(listId, entryId) {
        this.selectedContactList = listId ?? null;
        // make sure that we have the list infos before we check whether the passed one is in them
        await this.init();
        // checking that no one changed the list in the meantime concurrently
        if (this.selectedContactList === listId && !this.getContactListInfoForEntryListId(listId)) {
            this.selectedContactList = null;
        }
        await this.listModel?.loadInitial();
        if (listId && entryId) {
            this.loadAndSelect(listId, entryId);
        }
    }
    init = lazyMemoized(async () => {
        this.eventController.addEntityListener(this.entityEventsReceived);
        this.sortedContactListInfos = this.contactModel.getOwnContactListInfos().map((infos) => {
            this.updateUi();
            return infos.slice().sort((a, b) => a.name.localeCompare(b.name));
        });
        this.sortedSharedContactListInfos = this.contactModel.getSharedContactListInfos().map((infos) => {
            this.updateUi();
            return infos.slice().sort((a, b) => a.name.localeCompare(b.name));
        });
        this.contactListInvitations.init();
        // dispose() of the model will end this stream, no need to unsubscribe manually
        this.contactListInvitations.invitations.map(this.updateUi);
        await this.contactModel.getLoadedContactListInfos();
    });
    get listModel() {
        return this.selectedContactList ? this._listModel(this.selectedContactList) : null;
    }
    _listModel = memoized((listId) => {
        const newListModel = new ListElementListModel({
            fetch: async () => {
                const items = await this.getRecipientsForList(listId);
                return { items, complete: true };
            },
            loadSingle: async (_listId, elementId) => {
                return this.entityClient.load(ContactListEntryTypeRef, [listId, elementId]);
            },
            sortCompare: (rl1, rl2) => rl1.emailAddress.localeCompare(rl2.emailAddress),
            autoSelectBehavior: () => ListAutoSelectBehavior.OLDER,
        });
        this.listModelStateStream?.end(true);
        this.listModelStateStream = newListModel.stateStream.map(() => {
            this.contactsForSelectedEntry = [];
            this.updateUi();
            this.updateUrl();
            this.getContactsForSelectedContactListEntry();
        });
        return newListModel;
    });
    async loadAndSelect(listId, contactListEntryId) {
        await this.listModel?.loadAndSelect(contactListEntryId, () => this.selectedContactList !== listId);
    }
    getContactListId() {
        return this.contactModel.getContactListId();
    }
    getOwnContactListInfos() {
        return this.sortedContactListInfos() ?? [];
    }
    getSharedContactListInfos() {
        return this.sortedSharedContactListInfos() ?? [];
    }
    getContactListInvitations() {
        return this.contactListInvitations.invitations();
    }
    getContactsForSelectedContactListEntry = debounce(50, async () => {
        const selected = this.getSelectedContactListEntries();
        if (selected?.length === 1) {
            const searchedContacts = await this.contactModel.searchForContacts(selected[0].emailAddress, "mailAddress", 10);
            // need an exact match
            const contacts = searchedContacts.filter((contact) => contact.mailAddresses.map((mailAddress) => mailAddress.address).includes(selected[0].emailAddress));
            const nowSelected = this.getSelectedContactListEntries() ?? [];
            if (arrayEquals(selected, nowSelected)) {
                this.contactsForSelectedEntry = contacts;
            }
        }
        else {
            return [];
        }
        this.updateUi();
    });
    updateUrl() {
        if (!this.listModel?.state.inMultiselect) {
            const recipient = this.getSelectedContactListEntries();
            if (recipient && recipient.length === 1) {
                this.router.routeTo(`/contactlist/:listId/:itemId`, {
                    listId: this.selectedContactList,
                    itemId: recipient[0]._id[1],
                });
                return;
            }
        }
        if (this.selectedContactList) {
            this.router.routeTo(`/contactlist/:listId`, { listId: this.selectedContactList });
        }
        else {
            this.router.routeTo(`/contactlist`, {});
        }
    }
    async canCreateContactList() {
        const planConfig = await this.loginController.getUserController().getPlanConfig();
        return planConfig.contactList;
    }
    async addContactList(name, recipients) {
        const newGroup = await this.groupManagementFacade.createContactListGroup(name);
        const newContactList = await this.entityClient.load(ContactListGroupRootTypeRef, newGroup._id);
        this.addRecipientstoContactList(recipients, newContactList);
    }
    async addRecipientstoContactList(addresses, contactListGroupRoot) {
        const currentRecipients = await this.getRecipientsForList(contactListGroupRoot.entries);
        const listAddresses = currentRecipients.map((entry) => entry.emailAddress);
        for (const address of addresses) {
            if (!listAddresses.includes(address)) {
                const recipient = createContactListEntry({
                    _ownerGroup: contactListGroupRoot._id,
                    emailAddress: address,
                });
                this.addEntryOnList(contactListGroupRoot.entries, recipient);
            }
        }
    }
    addEntryOnList(recipientsId, recipient) {
        this.entityClient.setup(recipientsId, recipient);
    }
    entityEventsReceived = async (updates) => {
        for (const update of updates) {
            if (this.selectedContactList) {
                const { instanceListId, instanceId, operation } = update;
                if (isUpdateForTypeRef(ContactListEntryTypeRef, update) && isSameId(this.selectedContactList, instanceListId)) {
                    await this.listModel?.entityEventReceived(instanceListId, instanceId, operation);
                }
                else if (isUpdateForTypeRef(ContactTypeRef, update)) {
                    this.getContactsForSelectedContactListEntry();
                }
            }
            this.updateUi();
        }
    };
    updateSelectedContactList(selected) {
        this.selectedContactList = selected;
        this.listModel?.loadInitial();
    }
    updateContactList(contactListInfo, name, addresses) {
        // the name is stored on both GroupInfo (own contact list) and UserSettingsGroupRoot (contact lists shared with us)
        // note: make sure to handle shared contact lists when implementing sharing
        contactListInfo.name = name;
        contactListInfo.groupInfo.name = name;
        this.entityClient.update(contactListInfo.groupInfo);
    }
    getSelectedContactListInfo() {
        return this.selectedContactList ? this.getContactListInfoForEntryListId(this.selectedContactList) : null;
    }
    getSelectedContactListEntries() {
        return this.listModel?.getSelectedAsArray();
    }
    async getRecipientsForList(listId) {
        return await this.entityClient.loadAll(ContactListEntryTypeRef, listId);
    }
    deleteContactList(contactList) {
        this.groupManagementFacade.deleteContactListGroup(contactList.groupRoot);
    }
    async deleteContactListEntries(recipients) {
        for (const recipient of recipients) {
            await this.entityClient.erase(recipient);
        }
    }
    removeUserFromContactList(contactList) {
        return locator.groupManagementFacade.removeUserFromGroup(getEtId(this.loginController.getUserController().user), contactList.groupInfo.group);
    }
    async deleteSelectedEntries() {
        await this.deleteContactListEntries(this.getSelectedContactListEntries() ?? []);
    }
    getContactListInfoForEntryListId(listId) {
        return (this.getOwnContactListInfos().find((contactList) => contactList.groupRoot.entries === listId) ??
            this.getSharedContactListInfos().find((contactList) => contactList.groupRoot.entries === listId) ??
            null);
    }
    dispose() {
        this.eventController.removeEntityListener(this.entityEventsReceived);
        this.sortedContactListInfos.end(true);
        this.sortedSharedContactListInfos.end(true);
        this.contactListInvitations.dispose();
    }
}
//# sourceMappingURL=ContactListViewModel.js.map