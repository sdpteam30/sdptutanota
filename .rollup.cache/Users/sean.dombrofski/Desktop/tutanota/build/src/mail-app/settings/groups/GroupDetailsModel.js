import { createGroupInfo, CustomerTypeRef, GroupInfoTypeRef, GroupMemberTypeRef, GroupTypeRef, UserTypeRef, } from "../../../common/api/entities/sys/TypeRefs.js";
import { assertNotNull, getFirstOrThrow, LazyLoaded, neverNull, promiseMap } from "@tutao/tutanota-utils";
import { GENERATED_MIN_ID, isSameId } from "../../../common/api/common/utils/EntityUtils.js";
import { BookingItemFeatureType, GroupType } from "../../../common/api/common/TutanotaConstants.js";
import { lang } from "../../../common/misc/LanguageViewModel.js";
import { locator } from "../../../common/api/main/CommonLocator.js";
import { BadRequestError, NotAuthorizedError, PreconditionFailedError } from "../../../common/api/common/error/RestError.js";
import { compareGroupInfos, getGroupInfoDisplayName } from "../../../common/api/common/utils/GroupUtils.js";
import { MailboxPropertiesTypeRef } from "../../../common/api/entities/tutanota/TypeRefs.js";
import { UserError } from "../../../common/api/main/UserError.js";
import { toFeatureType } from "../../../common/subscription/SubscriptionUtils.js";
import { isUpdateForTypeRef } from "../../../common/api/common/utils/EntityUpdateUtils.js";
export class GroupDetailsModel {
    entityClient;
    updateViewCallback;
    groupInfo;
    group;
    usedStorageInBytes;
    members;
    senderName;
    constructor(groupInfo, entityClient, updateViewCallback) {
        this.entityClient = entityClient;
        this.updateViewCallback = updateViewCallback;
        this.entityClient = entityClient;
        this.groupInfo = groupInfo;
        this.group = new LazyLoaded(() => this.entityClient.load(GroupTypeRef, this.groupInfo.group));
        this.group.getAsync().then(() => this.updateViewCallback());
        this.members = new LazyLoaded(async () => {
            const group = await this.group.getAsync();
            // load only up to 200 members to avoid too long loading, like for account groups
            const groupMembers = await this.entityClient.loadRange(GroupMemberTypeRef, group.members, GENERATED_MIN_ID, 200, false);
            return promiseMap(groupMembers, (member) => this.entityClient.load(GroupInfoTypeRef, member.userGroupInfo));
        });
        // noinspection JSIgnoredPromiseFromCall
        this.updateMembers();
        if (this.groupInfo.groupType === GroupType.Mail) {
            this.senderName = new LazyLoaded(() => this.loadSenderName());
            // noinspection JSIgnoredPromiseFromCall
            this.updateSenderName();
        }
        // noinspection JSIgnoredPromiseFromCall
        this.updateUsedStorage();
    }
    isMailGroup() {
        return this.groupInfo.groupType === GroupType.Mail;
    }
    async loadSenderName() {
        const names = await locator.mailAddressFacade.getSenderNames(this.groupInfo.group);
        return getFirstOrThrow(Array.from(names.values()));
    }
    isGroupActive() {
        return this.groupInfo.deleted == null;
    }
    getGroupType() {
        return this.group.isLoaded() ? this.group.getLoaded().type : null;
    }
    getGroupName() {
        return this.groupInfo.name;
    }
    getUsedStorage() {
        return this.usedStorageInBytes;
    }
    getCreationDate() {
        return this.groupInfo.created;
    }
    getMembersInfo() {
        return this.members.isLoaded() ? this.members.getLoaded() : [];
    }
    getGroupMailAddress() {
        return this.groupInfo.mailAddress ?? "";
    }
    getGroupSenderName() {
        return this.senderName.isLoaded() ? this.senderName.getLoaded() : lang.get("loading_msg");
    }
    /**
     * remove the group of the given groupInfo from this group
     */
    async removeGroupMember(userGroupInfo) {
        try {
            const userGroup = await this.entityClient.load(GroupTypeRef, userGroupInfo.group);
            return locator.groupManagementFacade.removeUserFromGroup(assertNotNull(userGroup.user), this.groupInfo.group);
        }
        catch (e) {
            if (!(e instanceof NotAuthorizedError))
                throw e;
            throw new UserError("removeUserFromGroupNotAdministratedError_msg");
        }
    }
    async executeGroupBuy(deactivate) {
        const group = await this.group.getAsync();
        try {
            return await locator.groupManagementFacade.deactivateGroup(group, !deactivate);
        }
        catch (e) {
            if (!(e instanceof PreconditionFailedError))
                throw e;
            if (!deactivate) {
                throw new UserError("emailAddressInUse_msg");
            }
            else {
                throw new UserError("stillReferencedFromContactForm_msg");
            }
        }
    }
    changeGroupName(newName) {
        const newGroupInfo = createGroupInfo(this.groupInfo);
        newGroupInfo.name = newName;
        return this.entityClient.update(newGroupInfo);
    }
    async changeGroupSenderName(newName) {
        if (this.senderName.isLoaded() && this.senderName.getLoaded() === newName)
            return;
        const mailGroupId = await this.groupInfo.group;
        await locator.mailAddressFacade.setSenderName(mailGroupId, this.getGroupMailAddress(), newName);
        // we may not be a member of the group and therefore won't necessarily receive updates
        // for updated mailbox properties.
        this.senderName.reset();
        // noinspection ES6MissingAwait
        this.senderName.getAsync();
        this.updateViewCallback();
    }
    validateGroupName(newName) {
        if (this.group.isLoaded() && this.group.getLoaded().type === GroupType.MailingList && newName.trim() === "") {
            return "enterName_msg";
        }
        else {
            return null;
        }
    }
    /**
     * validate if the given deactivation/activation is valid for this group and return information about the item to book, if any
     * @param deactivate true if the group should be deactivated
     * @return the relevant BookingParams if the activation/deactivatian may go ahead, null otherwise (no action necessary)
     */
    async validateGroupActivationStatus(deactivate) {
        if (deactivate !== this.isGroupActive()) {
            console.log("tried to set activation status to current status.");
            return null;
        }
        const members = await this.members.getAsync();
        if (deactivate && members.length > 0) {
            throw new UserError("groupNotEmpty_msg");
        }
        else {
            const userController = locator.logins.getUserController();
            const planType = await userController.getPlanType();
            const useLegacyBookingItem = await userController.useLegacyBookingItem();
            const bookingItemType = useLegacyBookingItem ? toFeatureType(planType) : BookingItemFeatureType.SharedMailGroup;
            const bookingText = deactivate ? "cancelSharedMailbox_label" : "sharedMailbox_label";
            return {
                featureType: bookingItemType,
                bookingText: bookingText,
                count: deactivate ? -1 : 1,
                freeAmount: 0,
                reactivate: !deactivate,
            };
        }
    }
    async getPossibleMembers() {
        const customer = await this.entityClient.load(CustomerTypeRef, neverNull(locator.logins.getUserController().user.customer));
        const userGroupInfos = await this.entityClient.loadAll(GroupInfoTypeRef, customer.userGroups);
        // remove all users that are already member
        let globalAdmin = locator.logins.isGlobalAdminUserLoggedIn();
        let availableUserGroupInfos = userGroupInfos.filter((userGroupInfo) => {
            if (!globalAdmin // if we are not a  global admin we may not add anyone, don't filter
            ) {
                return false;
            }
            else {
                // only show users that are not deleted and not already in the group.
                return !userGroupInfo.deleted && !this.members.getLoaded().some((m) => isSameId(m._id, userGroupInfo._id));
            }
        });
        availableUserGroupInfos.sort(compareGroupInfos);
        return availableUserGroupInfos.map((g) => ({ name: getGroupInfoDisplayName(g), value: g.group }));
    }
    async addUserToGroup(group) {
        const userGroup = await this.entityClient.load(GroupTypeRef, group);
        const user = await this.entityClient.load(UserTypeRef, neverNull(userGroup.user));
        return locator.groupManagementFacade.addUserToGroup(user, this.groupInfo.group);
    }
    async updateMembers() {
        this.members.reset();
        await this.members.getAsync();
        this.updateViewCallback();
    }
    async updateSenderName() {
        this.senderName.reset();
        await this.senderName.getAsync();
        this.updateViewCallback();
    }
    async updateUsedStorage() {
        if (this.isMailGroup()) {
            try {
                this.usedStorageInBytes = await locator.groupManagementFacade.readUsedSharedMailGroupStorage(await this.group.getAsync());
            }
            catch (e) {
                if (!(e instanceof BadRequestError))
                    throw e;
                // may happen if the user gets the admin flag removed
            }
        }
        else {
            this.usedStorageInBytes = 0;
        }
        this.updateViewCallback();
    }
    async entityEventsReceived(updates) {
        await promiseMap(updates, async (update) => {
            const { instanceListId, instanceId, operation } = update;
            if (isUpdateForTypeRef(GroupInfoTypeRef, update) && operation === "1" /* OperationType.UPDATE */) {
                const updatedUserGroupInfo = await this.entityClient.load(GroupInfoTypeRef, this.groupInfo._id);
                if (isSameId(this.groupInfo._id, [assertNotNull(instanceListId, "got groupInfo update without instanceListId"), instanceId])) {
                    this.groupInfo = updatedUserGroupInfo;
                    return this.updateUsedStorage();
                }
                else {
                    // a member name may have changed
                    return this.updateMembers();
                }
            }
            else if (isUpdateForTypeRef(GroupMemberTypeRef, update) &&
                this.group.isLoaded() &&
                this.group.getLoaded().members === assertNotNull(instanceListId, "got a groupMember update without instanceListId")) {
                // the members have changed
                return this.updateMembers();
            }
            else if (this.isMailGroup() && isUpdateForTypeRef(MailboxPropertiesTypeRef, update) && update.operation === "1" /* OperationType.UPDATE */) {
                // the sender name belonging to this group may have changed.
                // noinspection ES6MissingAwait
                this.updateSenderName();
            }
        });
    }
}
//# sourceMappingURL=GroupDetailsModel.js.map