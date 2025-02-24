import { getContactDisplayName } from "../../contactsFunctionality/ContactUtils.js";
import { BoundedExecutor, LazyLoaded } from "@tutao/tutanota-utils";
import { ContactTypeRef } from "../entities/tutanota/TypeRefs";
import { cleanMailAddress } from "../common/utils/CommonCalendarUtils.js";
import { createNewContact, isTutaMailAddress } from "../../mailFunctionality/SharedMailUtils.js";
export var ResolveMode;
(function (ResolveMode) {
    ResolveMode[ResolveMode["Lazy"] = 0] = "Lazy";
    ResolveMode[ResolveMode["Eager"] = 1] = "Eager";
})(ResolveMode || (ResolveMode = {}));
export class RecipientsModel {
    contactModel;
    loginController;
    mailFacade;
    entityClient;
    executor = new BoundedExecutor(5);
    constructor(contactModel, loginController, mailFacade, entityClient) {
        this.contactModel = contactModel;
        this.loginController = loginController;
        this.mailFacade = mailFacade;
        this.entityClient = entityClient;
    }
    /**
     * Start resolving a recipient
     * If resolveLazily === true, Then resolution will not be initiated (i.e. no server calls will be made) until the first call to `resolved`
     */
    resolve(recipient, resolveMode) {
        return new ResolvableRecipientImpl(recipient, this.contactModel, this.loginController, (mailAddress) => this.executor.run(this.resolveRecipientType(mailAddress)), this.entityClient, resolveMode);
    }
    resolveRecipientType = (mailAddress) => async () => {
        const keyData = await this.mailFacade.getRecipientKeyData(mailAddress);
        return keyData == null ? "external" /* RecipientType.EXTERNAL */ : "internal" /* RecipientType.INTERNAL */;
    };
}
class ResolvableRecipientImpl {
    contactModel;
    loginController;
    typeResolver;
    entityClient;
    _address;
    _name;
    lazyType;
    lazyContact;
    initialType = "unknown" /* RecipientType.UNKNOWN */;
    initialContact = null;
    overrideContact = null;
    get address() {
        return this._address;
    }
    get name() {
        return this._name ?? "";
    }
    get type() {
        return this.lazyType.getSync() ?? this.initialType;
    }
    get contact() {
        return this.lazyContact.getSync() ?? this.initialContact;
    }
    constructor(arg, contactModel, loginController, typeResolver, entityClient, resolveMode) {
        this.contactModel = contactModel;
        this.loginController = loginController;
        this.typeResolver = typeResolver;
        this.entityClient = entityClient;
        if (isTutaMailAddress(arg.address) || arg.type === "internal" /* RecipientType.INTERNAL */) {
            this.initialType = "internal" /* RecipientType.INTERNAL */;
            this._address = cleanMailAddress(arg.address);
        }
        else if (arg.type) {
            this.initialType = arg.type;
            this._address = arg.address;
        }
        else {
            this._address = arg.address;
        }
        this._name = arg.name ?? null;
        if (!(arg.contact instanceof Array)) {
            this.initialContact = arg.contact ?? null;
        }
        this.lazyType = new LazyLoaded(() => this.resolveType());
        this.lazyContact = new LazyLoaded(async () => {
            const contact = await this.resolveContact(arg.contact);
            // sometimes we create resolvable contact and then dissect it into parts and resolve it again in which case we will default to an empty name
            // (see the getter) but we actually want the name from contact.
            if (contact != null && (this._name == null || this._name === "")) {
                this._name = getContactDisplayName(contact);
            }
            return contact;
        });
        if (resolveMode === ResolveMode.Eager) {
            this.lazyType.load();
            this.lazyContact.load();
        }
    }
    setName(newName) {
        this._name = newName;
    }
    setContact(newContact) {
        this.overrideContact = newContact;
        this.lazyContact.reload();
    }
    async resolved() {
        await Promise.all([this.lazyType.getAsync(), this.lazyContact.getAsync()]);
        return {
            address: this.address,
            name: this.name,
            type: this.type,
            contact: this.contact,
        };
    }
    isResolved() {
        // We are only resolved when both type and contact are non-null and finished
        return this.lazyType.isLoaded() && this.lazyContact.isLoaded();
    }
    whenResolved(handler) {
        this.resolved().then(handler);
        return this;
    }
    /**
     * Determine whether recipient is INTERNAL or EXTERNAL based on the existence of key data (external recipients don't have any)
     */
    async resolveType() {
        if (this.initialType === "unknown" /* RecipientType.UNKNOWN */) {
            const cleanedAddress = cleanMailAddress(this.address);
            const recipientType = await this.typeResolver(cleanedAddress);
            if (recipientType === "internal" /* RecipientType.INTERNAL */) {
                // we know this is one of ours, so it's safe to clean it up
                this._address = cleanedAddress;
            }
            return recipientType;
        }
        else {
            return this.initialType;
        }
    }
    /**
     * Resolve the recipients contact.
     * If {@param contact} is an Id, the contact will be loaded directly
     * Otherwise, the contact will be searched for in the ContactModel
     */
    async resolveContact(contact) {
        try {
            if (this.overrideContact) {
                return this.overrideContact;
            }
            else if ((await this.contactModel.getContactListId()) == null) {
                console.log("can't resolve contacts for users with no contact list id");
                return null;
            }
            else if (contact instanceof Array) {
                return await this.entityClient.load(ContactTypeRef, contact);
            }
            else if (contact == null) {
                const foundContact = await this.contactModel.searchForContact(this.address);
                if (foundContact) {
                    return foundContact;
                }
                else {
                    // we don't want to create a mixed-case contact if the address is an internal one.
                    // after lazyType is loaded, if it resolves to RecipientType.INTERNAL, we have the
                    // cleaned address in this.address.
                    await this.lazyType;
                    return createNewContact(this.loginController.getUserController().user, this.address, this.name);
                }
            }
            else {
                return contact;
            }
        }
        catch (e) {
            console.log("error resolving contact", e);
            return null;
        }
    }
}
//# sourceMappingURL=RecipientsModel.js.map