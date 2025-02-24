/**
 *  A {@link MailAddressNameChanger} intended for admins to set names for aliases bound to user mailboxes.
 *  We can't normally update instances for the groups we are not member of so we do it via a service.
 */
export class AnotherUserMailAddressNameChanger {
    mailAddressFacade;
    mailGroupId;
    userId;
    constructor(mailAddressFacade, mailGroupId, userId) {
        this.mailAddressFacade = mailAddressFacade;
        this.mailGroupId = mailGroupId;
        this.userId = userId;
    }
    getSenderNames() {
        return this.mailAddressFacade.getSenderNames(this.mailGroupId, this.userId);
    }
    setSenderName(address, name) {
        return this.mailAddressFacade.setSenderName(this.mailGroupId, address, name, this.userId);
    }
    removeSenderName(address) {
        return this.mailAddressFacade.removeSenderName(this.mailGroupId, address, this.userId);
    }
}
//# sourceMappingURL=AnotherUserMailAddressNameChanger.js.map