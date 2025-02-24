import { createMailAddressProperties, createMailboxProperties, MailboxGroupRootTypeRef, MailboxPropertiesTypeRef, MailBoxTypeRef, } from "../api/entities/tutanota/TypeRefs.js";
import { GroupInfoTypeRef, GroupTypeRef } from "../api/entities/sys/TypeRefs.js";
import stream from "mithril/stream";
import { assertNotNull, lazyMemoized, ofClass } from "@tutao/tutanota-utils";
import { getEnabledMailAddressesWithUser } from "./SharedMailUtils.js";
import { PreconditionFailedError } from "../api/common/error/RestError.js";
import { isUpdateForTypeRef } from "../api/common/utils/EntityUpdateUtils.js";
import m from "mithril";
import { ProgrammingError } from "../api/common/error/ProgrammingError.js";
import { isSameId } from "../api/common/utils/EntityUtils.js";
export class MailboxModel {
    eventController;
    entityClient;
    logins;
    /** Empty stream until init() is finished, exposed mostly for map()-ing, use getMailboxDetails to get a promise */
    mailboxDetails = stream();
    initialization = null;
    /**
     * Map from MailboxGroupRoot id to MailboxProperties
     * A way to avoid race conditions in case we try to create mailbox properties from multiple places.
     *
     */
    mailboxPropertiesPromises = new Map();
    constructor(eventController, entityClient, logins) {
        this.eventController = eventController;
        this.entityClient = entityClient;
        this.logins = logins;
    }
    // only init listeners once
    initListeners = lazyMemoized(() => {
        this.eventController.addEntityListener((updates, eventOwnerGroupId) => this.entityEventsReceived(updates, eventOwnerGroupId));
    });
    init() {
        // if we are in the process of loading do not start another one in parallel
        if (this.initialization) {
            return this.initialization;
        }
        this.initListeners();
        return this._init();
    }
    _init() {
        const mailGroupMemberships = this.logins.getUserController().getMailGroupMemberships();
        const mailBoxDetailsPromises = mailGroupMemberships.map((m) => this.mailboxDetailsFromMembership(m));
        this.initialization = Promise.all(mailBoxDetailsPromises).then((details) => {
            this.mailboxDetails(details);
        });
        return this.initialization.catch((e) => {
            console.warn("mailbox model initialization failed!", e);
            this.initialization = null;
            throw e;
        });
    }
    /**
     * load mailbox details from a mailgroup membership
     */
    async mailboxDetailsFromMembership(membership) {
        const [mailboxGroupRoot, mailGroupInfo, mailGroup] = await Promise.all([
            this.entityClient.load(MailboxGroupRootTypeRef, membership.group),
            this.entityClient.load(GroupInfoTypeRef, membership.groupInfo),
            this.entityClient.load(GroupTypeRef, membership.group),
        ]);
        const mailbox = await this.entityClient.load(MailBoxTypeRef, mailboxGroupRoot.mailbox);
        return {
            mailbox,
            mailGroupInfo,
            mailGroup,
            mailboxGroupRoot,
        };
    }
    /**
     * Get the list of MailboxDetails that this user has access to from their memberships.
     *
     * Will wait for successful initialization.
     */
    async getMailboxDetails() {
        // If details are there, use them
        if (this.mailboxDetails()) {
            return this.mailboxDetails();
        }
        else {
            // If they are not there, trigger loading again (just in case) but do not fail and wait until we actually have the details.
            // This is so that the rest of the app is not in the broken state if details fail to load but is just waiting until the success.
            return new Promise((resolve) => {
                this.init();
                const end = this.mailboxDetails.map((details) => {
                    resolve(details);
                    end.end(true);
                });
            });
        }
    }
    async getMailboxDetailByMailboxId(mailboxId) {
        const allDetails = await this.getMailboxDetails();
        return allDetails.find((detail) => isSameId(detail.mailbox._id, mailboxId)) ?? null;
    }
    async getMailboxDetailsForMailGroup(mailGroupId) {
        const mailboxDetails = await this.getMailboxDetails();
        return assertNotNull(mailboxDetails.find((md) => mailGroupId === md.mailGroup._id), "Mailbox detail for mail group does not exist");
    }
    async getUserMailboxDetails() {
        const userMailGroupMembership = this.logins.getUserController().getUserMailGroupMembership();
        const mailboxDetails = await this.getMailboxDetails();
        return assertNotNull(mailboxDetails.find((md) => md.mailGroup._id === userMailGroupMembership.group), "Mailbox detail for user does not exist");
    }
    async entityEventsReceived(updates, eventOwnerGroupId) {
        for (const update of updates) {
            if (isUpdateForTypeRef(GroupInfoTypeRef, update)) {
                if (update.operation === "1" /* OperationType.UPDATE */) {
                    await this._init();
                    m.redraw();
                }
            }
            else if (this.logins.getUserController().isUpdateForLoggedInUserInstance(update, eventOwnerGroupId)) {
                let newMemberships = this.logins.getUserController().getMailGroupMemberships();
                const mailboxDetails = await this.getMailboxDetails();
                if (newMemberships.length !== mailboxDetails.length) {
                    await this._init();
                    m.redraw();
                }
            }
        }
    }
    async getMailboxProperties(mailboxGroupRoot) {
        // MailboxProperties is an encrypted instance that is created lazily. When we create it the reference is automatically written to the MailboxGroupRoot.
        // Unfortunately we will only get updated new MailboxGroupRoot with the next EntityUpdate.
        // To prevent parallel creation attempts we do two things:
        //  - we save the loading promise to avoid calling setup() twice in parallel
        //  - we set mailboxProperties reference manually (we could save the id elsewhere but it's easier this way)
        // If we are already loading/creating, just return it to avoid races
        const existingPromise = this.mailboxPropertiesPromises.get(mailboxGroupRoot._id);
        if (existingPromise) {
            return existingPromise;
        }
        const promise = this.loadOrCreateMailboxProperties(mailboxGroupRoot);
        this.mailboxPropertiesPromises.set(mailboxGroupRoot._id, promise);
        return promise.finally(() => this.mailboxPropertiesPromises.delete(mailboxGroupRoot._id));
    }
    async loadOrCreateMailboxProperties(mailboxGroupRoot) {
        if (!mailboxGroupRoot.mailboxProperties) {
            mailboxGroupRoot.mailboxProperties = await this.entityClient
                .setup(null, createMailboxProperties({
                _ownerGroup: mailboxGroupRoot._ownerGroup ?? "",
                reportMovedMails: "0",
                mailAddressProperties: [],
            }))
                .catch(ofClass(PreconditionFailedError, (e) => {
                // We try to prevent race conditions but they can still happen with multiple clients trying ot create mailboxProperties at the same time.
                // We send special precondition from the server with an existing id.
                if (e.data && e.data.startsWith("exists:")) {
                    const existingId = e.data.substring("exists:".length);
                    console.log("mailboxProperties already exists", existingId);
                    return existingId;
                }
                else {
                    throw new ProgrammingError(`Could not create mailboxProperties, precondition: ${e.data}`);
                }
            }));
        }
        const mailboxProperties = await this.entityClient.load(MailboxPropertiesTypeRef, mailboxGroupRoot.mailboxProperties);
        if (mailboxProperties.mailAddressProperties.length === 0) {
            await this.migrateFromOldSenderName(mailboxGroupRoot, mailboxProperties);
        }
        return mailboxProperties;
    }
    /** If there was no sender name configured before take the user's name and assign it to all email addresses. */
    async migrateFromOldSenderName(mailboxGroupRoot, mailboxProperties) {
        const userGroupInfo = this.logins.getUserController().userGroupInfo;
        const legacySenderName = userGroupInfo.name;
        const mailboxDetails = await this.getMailboxDetailsForMailGroup(mailboxGroupRoot._id);
        const mailAddresses = getEnabledMailAddressesWithUser(mailboxDetails, userGroupInfo);
        for (const mailAddress of mailAddresses) {
            mailboxProperties.mailAddressProperties.push(createMailAddressProperties({
                mailAddress,
                senderName: legacySenderName,
            }));
        }
        await this.entityClient.update(mailboxProperties);
    }
}
//# sourceMappingURL=MailboxModel.js.map