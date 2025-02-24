import { createMailAddressProperties } from "../../api/entities/tutanota/TypeRefs.js";
import { findAndRemove } from "@tutao/tutanota-utils";
/** Name changer for personal mailbox of the currently logged-in user. */
export class OwnMailAddressNameChanger {
    mailboxModel;
    entityClient;
    constructor(mailboxModel, entityClient) {
        this.mailboxModel = mailboxModel;
        this.entityClient = entityClient;
    }
    async getSenderNames() {
        const mailboxProperties = await this.getMailboxProperties();
        return this.collectMap(mailboxProperties);
    }
    async setSenderName(address, name) {
        const mailboxDetails = await this.mailboxModel.getUserMailboxDetails();
        const mailboxProperties = await this.mailboxModel.getMailboxProperties(mailboxDetails.mailboxGroupRoot);
        let aliasConfig = mailboxProperties.mailAddressProperties.find((p) => p.mailAddress === address);
        if (aliasConfig == null) {
            aliasConfig = createMailAddressProperties({ mailAddress: address, senderName: name });
            mailboxProperties.mailAddressProperties.push(aliasConfig);
        }
        else {
            aliasConfig.senderName = name;
        }
        await this.entityClient.update(mailboxProperties);
        return this.collectMap(mailboxProperties);
    }
    async removeSenderName(address) {
        const mailboxDetails = await this.mailboxModel.getUserMailboxDetails();
        const mailboxProperties = await this.mailboxModel.getMailboxProperties(mailboxDetails.mailboxGroupRoot);
        findAndRemove(mailboxProperties.mailAddressProperties, (p) => p.mailAddress === address);
        await this.entityClient.update(mailboxProperties);
        return this.collectMap(mailboxProperties);
    }
    collectMap(mailboxProperties) {
        const result = new Map();
        for (const properties of mailboxProperties.mailAddressProperties) {
            result.set(properties.mailAddress, properties.senderName);
        }
        return result;
    }
    async getMailboxProperties() {
        const mailboxDetails = await this.mailboxModel.getUserMailboxDetails();
        return await this.mailboxModel.getMailboxProperties(mailboxDetails.mailboxGroupRoot);
    }
}
//# sourceMappingURL=OwnMailAddressNameChanger.js.map