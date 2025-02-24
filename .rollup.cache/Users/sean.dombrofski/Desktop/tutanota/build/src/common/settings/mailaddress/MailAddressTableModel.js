import { MailboxPropertiesTypeRef } from "../../api/entities/tutanota/TypeRefs.js";
import { getAvailableDomains } from "./MailAddressesUtils.js";
import { GroupInfoTypeRef } from "../../api/entities/sys/TypeRefs.js";
import { assertNotNull, lazyMemoized } from "@tutao/tutanota-utils";
import { LimitReachedError } from "../../api/common/error/RestError.js";
import { UserError } from "../../api/main/UserError.js";
import { UpgradeRequiredError } from "../../api/main/UpgradeRequiredError.js";
import { getAvailableMatchingPlans } from "../../subscription/SubscriptionUtils.js";
import { isUpdateFor, isUpdateForTypeRef } from "../../api/common/utils/EntityUpdateUtils.js";
import { isTutaMailAddress } from "../../mailFunctionality/SharedMailUtils.js";
export var AddressStatus;
(function (AddressStatus) {
    AddressStatus[AddressStatus["Primary"] = 0] = "Primary";
    AddressStatus[AddressStatus["Alias"] = 1] = "Alias";
    AddressStatus[AddressStatus["DisabledAlias"] = 2] = "DisabledAlias";
    AddressStatus[AddressStatus["Custom"] = 3] = "Custom";
})(AddressStatus || (AddressStatus = {}));
/** Model for showing the list of mail addresses and optionally adding more, enabling/disabling/setting names for them. */
export class MailAddressTableModel {
    entityClient;
    serviceExecutor;
    mailAddressFacade;
    logins;
    eventController;
    userGroupInfo;
    nameChanger;
    redraw;
    nameMappings = null;
    onLegacyPlan = false;
    aliasCount = null;
    init = lazyMemoized(async () => {
        this.eventController.addEntityListener(this.entityEventsReceived);
        // important: "not on legacy plan" is true for free plans
        const userController = this.logins.getUserController();
        this.onLegacyPlan = userController.isLegacyPlan(await userController.getPlanType());
        await this.loadNames();
        this.redraw();
        await this.loadAliasCount();
        this.redraw();
    });
    constructor(entityClient, serviceExecutor, mailAddressFacade, logins, eventController, userGroupInfo, nameChanger, redraw) {
        this.entityClient = entityClient;
        this.serviceExecutor = serviceExecutor;
        this.mailAddressFacade = mailAddressFacade;
        this.logins = logins;
        this.eventController = eventController;
        this.userGroupInfo = userGroupInfo;
        this.nameChanger = nameChanger;
        this.redraw = redraw;
    }
    dispose() {
        this.eventController.removeEntityListener(this.entityEventsReceived);
    }
    userCanModifyAliases() {
        return this.logins.getUserController().isGlobalAdmin();
    }
    aliasLimitIncludesCustomDomains() {
        return this.onLegacyPlan;
    }
    addresses() {
        const { nameMappings } = this;
        if (nameMappings == null) {
            return [];
        }
        const primaryAddress = assertNotNull(this.userGroupInfo.mailAddress);
        const primaryAddressInfo = {
            name: nameMappings.get(primaryAddress) ?? "",
            address: primaryAddress,
            status: AddressStatus.Primary,
        };
        const aliasesInfo = this.userGroupInfo.mailAddressAliases
            .slice()
            .sort((a, b) => (a.mailAddress > b.mailAddress ? 1 : -1))
            .map(({ mailAddress, enabled }) => {
            const status = 
            // O(aliases * TUTA_MAIL_ADDRESS_DOMAINS)
            isTutaMailAddress(mailAddress) ? (enabled ? AddressStatus.Alias : AddressStatus.DisabledAlias) : AddressStatus.Custom;
            return {
                name: nameMappings.get(mailAddress) ?? "",
                address: mailAddress,
                status,
            };
        });
        return [primaryAddressInfo, ...aliasesInfo];
    }
    async setAliasName(address, senderName) {
        this.nameMappings = await this.nameChanger.setSenderName(address, senderName);
        this.redraw();
    }
    /**
     * Add an alias.
     * @throws if an error occurred, such as a LimitReachedError if too many aliases were added
     */
    async addAlias(alias, senderName) {
        try {
            await this.mailAddressFacade.addMailAlias(this.userGroupInfo.group, alias);
            await this.setAliasName(alias, senderName);
        }
        catch (e) {
            if (e instanceof LimitReachedError) {
                await this.handleTooManyAliases();
            }
            throw e;
        }
    }
    getAvailableDomains() {
        return getAvailableDomains(this.logins);
    }
    async setAliasStatus(address, restore) {
        await this.mailAddressFacade.setMailAliasStatus(this.userGroupInfo.group, address, restore);
        this.redraw();
        this.nameMappings = await this.nameChanger.removeSenderName(address);
        this.redraw();
    }
    defaultSenderName() {
        return this.userGroupInfo.name;
    }
    entityEventsReceived = async (updates) => {
        for (const update of updates) {
            if (isUpdateForTypeRef(MailboxPropertiesTypeRef, update) && update.operation === "1" /* OperationType.UPDATE */) {
                await this.loadNames();
            }
            else if (isUpdateFor(this.userGroupInfo, update) && update.operation === "1" /* OperationType.UPDATE */) {
                this.userGroupInfo = await this.entityClient.load(GroupInfoTypeRef, this.userGroupInfo._id);
                await this.loadAliasCount();
            }
        }
        this.redraw();
    };
    async loadNames() {
        this.nameMappings = await this.nameChanger.getSenderNames();
    }
    async loadAliasCount() {
        this.aliasCount = await this.mailAddressFacade.getAliasCounters(this.userGroupInfo.group);
    }
    /**
     * Chooses the correct error to throw.
     * @throws UpgradeRequiredError if the customer can upgrade to a plan with more aliases
     * @throws UserError if the customer cannot add more aliases
     */
    async handleTooManyAliases() {
        // Determine if there is an available plan we can switch to that would let the user add an alias.
        // If so, show an upgrade dialog. Otherwise, inform the user that they reached the maximum number of aliases.
        const plansWithMoreAliases = await getAvailableMatchingPlans(this.serviceExecutor, (config) => Number(config.nbrOfAliases) > this.userGroupInfo.mailAddressAliases.length);
        if (plansWithMoreAliases.length > 0) {
            throw new UpgradeRequiredError("moreAliasesRequired_msg", plansWithMoreAliases);
        }
        else {
            throw new UserError("adminMaxNbrOfAliasesReached_msg");
        }
    }
}
//# sourceMappingURL=MailAddressTableModel.js.map