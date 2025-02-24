import { assertMainOrNode } from "../api/common/Env.js";
import { GroupInfoTypeRef, GroupTypeRef } from "../api/entities/sys/TypeRefs.js";
import { ContactListGroupRootTypeRef, ContactListTypeRef, ContactTypeRef, } from "../api/entities/tutanota/TypeRefs.js";
import { getFirstOrThrow, isNotNull, LazyLoaded, ofClass, promiseMap } from "@tutao/tutanota-utils";
import stream from "mithril/stream";
import { loadMultipleFromLists } from "../api/common/EntityClient.js";
import { LoginIncompleteError } from "../api/common/error/LoginIncompleteError.js";
import { cleanMailAddress } from "../api/common/utils/CommonCalendarUtils.js";
import { DbError } from "../api/common/error/DbError.js";
import { compareOldestFirst, getEtId } from "../api/common/utils/EntityUtils.js";
import { NotAuthorizedError, NotFoundError } from "../api/common/error/RestError.js";
assertMainOrNode();
export class ContactModel {
    entityClient;
    loginController;
    eventController;
    contactSearch;
    contactListId;
    contactListInfo = stream();
    constructor(entityClient, loginController, eventController, contactSearch) {
        this.entityClient = entityClient;
        this.loginController = loginController;
        this.eventController = eventController;
        this.contactSearch = contactSearch;
        this.contactListId = lazyContactListId(loginController, this.entityClient);
        this.eventController.addEntityListener(this.entityEventsReceived);
    }
    async getLoadedContactListInfos() {
        // prevent re-loading them when we already have them
        // this is not perfect and might still start loads in parallel
        if (this.contactListInfo() === undefined) {
            await this.loadContactLists();
        }
        return this.contactListInfo();
    }
    /** might be empty if not loaded yet */
    getOwnContactListInfos() {
        return this.contactListInfo.map((contactListInfos) => contactListInfos.filter((info) => info.isOwner));
    }
    /** might be empty if not loaded yet */
    getSharedContactListInfos() {
        return this.contactListInfo.map((contactListInfos) => contactListInfos.filter((info) => !info.isOwner));
    }
    /** Id of the contact list. Is null for external users. */
    getContactListId() {
        return this.contactListId.getAsync();
    }
    /**
     * Provides the first contact (starting with oldest contact) that contains the given email address. Uses the index search if available, otherwise loads all contacts.
     */
    async searchForContact(mailAddress) {
        //searching for contacts depends on searchFacade._db to be initialized. If the user has not logged in online the respective promise will never resolve.
        if (!this.loginController.isFullyLoggedIn()) {
            throw new LoginIncompleteError("cannot search for contacts as online login is not completed");
        }
        const cleanedMailAddress = cleanMailAddress(mailAddress);
        let result;
        try {
            result = await this.contactSearch('"' + cleanedMailAddress + '"', "mailAddress", 0);
        }
        catch (e) {
            // If IndexedDB is not supported or isn't working for some reason we load contacts from the server and
            // search manually.
            if (e instanceof DbError) {
                const listId = await this.getContactListId();
                if (listId) {
                    const contacts = await this.entityClient.loadAll(ContactTypeRef, listId);
                    return contacts.find((contact) => contact.mailAddresses.some((a) => cleanMailAddress(a.address) === cleanedMailAddress)) ?? null;
                }
                else {
                    return null;
                }
            }
            else {
                throw e;
            }
        }
        // the result is sorted from newest to oldest, but we want to return the oldest first like before
        result.results.sort(compareOldestFirst);
        for (const contactId of result.results) {
            try {
                const contact = await this.entityClient.load(ContactTypeRef, contactId);
                if (contact.mailAddresses.some((a) => cleanMailAddress(a.address) === cleanedMailAddress)) {
                    return contact;
                }
            }
            catch (e) {
                if (e instanceof NotFoundError || e instanceof NotAuthorizedError) {
                    continue;
                }
                else {
                    throw e;
                }
            }
        }
        return null;
    }
    /**
     * @pre locator.search.indexState().indexingSupported
     */
    async searchForContacts(query, field, minSuggestionCount) {
        if (!this.loginController.isFullyLoggedIn()) {
            throw new LoginIncompleteError("cannot search for contacts as online login is not completed");
        }
        const result = await this.contactSearch(query, field, minSuggestionCount);
        return await loadMultipleFromLists(ContactTypeRef, this.entityClient, result.results);
    }
    async searchForContactLists(query) {
        if (!this.loginController.isFullyLoggedIn()) {
            throw new LoginIncompleteError("cannot search for contact lists as online login is not completed");
        }
        const contactLists = await this.getLoadedContactListInfos();
        return contactLists.filter((contactList) => contactList.name.toLowerCase().includes(query));
    }
    async loadContactFromId(contactId) {
        if (!this.loginController.isFullyLoggedIn()) {
            throw new LoginIncompleteError("cannot search for contact lists as online login is not completed");
        }
        return await this.entityClient.load(ContactTypeRef, contactId);
    }
    async getContactGroupId() {
        return getFirstOrThrow(this.loginController.getUserController().getContactGroupMemberships()).group;
    }
    async loadContactLists() {
        const userController = this.loginController.getUserController();
        const contactListMemberships = userController.getContactListMemberships();
        const contactListInfo = (await promiseMap(await promiseMap(contactListMemberships, (rlm) => this.entityClient.load(GroupInfoTypeRef, rlm.groupInfo)), 
        // need to catch both NotFoundError and NotAuthorizedError, as we might still have a membership for a short time
        // when the group root is already deleted, or we deleted our membership
        (groupInfo) => this.getContactListInfo(groupInfo)
            .catch(ofClass(NotFoundError, () => null))
            .catch(ofClass(NotAuthorizedError, () => null)))).filter(isNotNull);
        this.contactListInfo(contactListInfo);
    }
    async getContactListInfo(groupInfo) {
        const group = await this.entityClient.load(GroupTypeRef, groupInfo.group);
        const groupRoot = await this.entityClient.load(ContactListGroupRootTypeRef, groupInfo.group);
        const userController = this.loginController.getUserController();
        const { getSharedGroupName } = await import("../sharing/GroupUtils.js");
        const { hasCapabilityOnGroup, isSharedGroupOwner } = await import("../sharing/GroupUtils.js");
        return {
            name: getSharedGroupName(groupInfo, userController, true),
            group,
            groupInfo,
            groupRoot,
            isOwner: isSharedGroupOwner(group, getEtId(userController.user)),
            canEdit: hasCapabilityOnGroup(userController.user, group, "1" /* ShareCapability.Write */),
        };
    }
    entityEventsReceived = async (updates, eventOwnerGroupId) => {
        for (const update of updates) {
            if (this.loginController.getUserController().isUpdateForLoggedInUserInstance(update, eventOwnerGroupId)) {
                await this.loadContactLists();
            }
        }
    };
}
export function lazyContactListId(logins, entityClient) {
    return new LazyLoaded(() => {
        return entityClient
            .loadRoot(ContactListTypeRef, logins.getUserController().user.userGroup.group)
            .then((contactList) => {
            return contactList.contacts;
        })
            .catch(ofClass(NotFoundError, (e) => {
            if (!logins.getUserController().isInternalUser()) {
                return null; // external users have no contact list.
            }
            else {
                throw e;
            }
        }));
    });
}
//# sourceMappingURL=ContactModel.js.map