import m from "mithril";
import { Dialog } from "../../common/gui/base/Dialog";
import { lang } from "../../common/misc/LanguageViewModel";
import { isMailAddress } from "../../common/misc/FormatValidator";
import { formatBirthdayNumeric, formatContactDate } from "../../common/contactsFunctionality/ContactUtils.js";
import { GroupType, Keys, } from "../../common/api/common/TutanotaConstants";
import { createBirthday, createContact, createContactAddress, createContactCustomDate, createContactMailAddress, createContactMessengerHandle, createContactPhoneNumber, createContactPronouns, createContactRelationship, createContactSocialId, createContactWebsite, } from "../../common/api/entities/tutanota/TypeRefs.js";
import { assertNotNull, clone, downcast, findAndRemove, lastIndex, lastThrow, noOp, typedEntries } from "@tutao/tutanota-utils";
import { assertMainOrNode } from "../../common/api/common/Env";
import { windowFacade } from "../../common/misc/WindowFacade";
import { LockedError, NotFoundError, PayloadTooLargeError } from "../../common/api/common/error/RestError";
import { birthdayToIsoDate } from "../../common/api/common/utils/BirthdayUtils";
import { ContactCustomDateTypeToLabel, ContactCustomWebsiteTypeToLabel, ContactMailAddressTypeToLabel, ContactMessengerHandleTypeToLabel, ContactPhoneNumberTypeToLabel, ContactRelationshipTypeToLabel, ContactSocialTypeToLabel, getContactAddressTypeLabel, getContactCustomDateTypeToLabel, getContactCustomWebsiteTypeToLabel, getContactMessengerHandleTypeToLabel, getContactPhoneNumberTypeLabel, getContactRelationshipTypeToLabel, getContactSocialTypeLabel, } from "./view/ContactGuiUtils";
import { parseBirthday } from "../../common/misc/DateParser";
import { TextField } from "../../common/gui/base/TextField.js";
import { timestampToGeneratedId } from "../../common/api/common/utils/EntityUtils";
import { ContactAggregateEditor } from "./ContactAggregateEditor";
import { DefaultAnimationTime } from "../../common/gui/animation/Animations";
import { ProgrammingError } from "../../common/api/common/error/ProgrammingError.js";
import { locator } from "../../common/api/main/CommonLocator.js";
import { formatDate } from "../../common/misc/Formatter.js";
import { PasswordField } from "../../common/misc/passwords/PasswordField.js";
assertMainOrNode();
const TAG = "[ContactEditor]";
export class ContactEditor {
    entityClient;
    newContactIdReceiver;
    dialog;
    hasInvalidBirthday;
    mailAddresses;
    phoneNumbers;
    addresses;
    socialIds;
    websites;
    relationships;
    messengerHandles;
    pronouns;
    customDates;
    birthday;
    windowCloseUnsubscribe;
    isNewContact;
    contact;
    listId;
    saving = false;
    /*
     * The contact that should be update or the contact list that the new contact should be written to must be provided
     * @param entityClient
     * @param contact An existing or new contact. If null a new contact is created.
     * @param listId The list id of the new contact.
     * @param newContactIdReceiver. Is called receiving the contact id as soon as the new contact was saved.
     */
    constructor(entityClient, contact, listId, newContactIdReceiver = null) {
        this.entityClient = entityClient;
        this.newContactIdReceiver = newContactIdReceiver;
        this.contact = contact
            ? clone(contact)
            : createContact({
                mailAddresses: [],
                title: null,
                socialIds: [],
                role: "",
                presharedPassword: null,
                photo: null,
                phoneNumbers: [],
                oldBirthdayDate: null,
                nickname: null,
                lastName: "",
                firstName: "",
                company: "",
                comment: "",
                birthdayIso: null,
                addresses: [],
                oldBirthdayAggregate: null,
                department: null,
                middleName: null,
                nameSuffix: null,
                phoneticFirst: null,
                phoneticLast: null,
                phoneticMiddle: null,
                customDate: [],
                messengerHandles: [],
                pronouns: [],
                relationships: [],
                websites: [],
            });
        this.isNewContact = contact?._id == null;
        if (this.isNewContact && listId == null) {
            throw new ProgrammingError("must provide contact with Id to edit or listId for the new contact");
        }
        else {
            this.listId = listId ? listId : assertNotNull(contact, "got an existing contact without id")._id[0];
        }
        const id = (entity) => entity._id || this.newId();
        this.mailAddresses = this.contact.mailAddresses.map((address) => [address, id(address)]);
        this.mailAddresses.push(this.newMailAddress());
        this.phoneNumbers = this.contact.phoneNumbers.map((phoneNumber) => [phoneNumber, id(phoneNumber)]);
        this.phoneNumbers.push(this.newPhoneNumber());
        this.addresses = this.contact.addresses.map((address) => [address, id(address)]);
        this.addresses.push(this.newAddress());
        this.socialIds = this.contact.socialIds.map((socialId) => [socialId, id(socialId)]);
        this.socialIds.push(this.newSocialId());
        this.websites = this.contact.websites.map((website) => [website, id(website)]);
        this.websites.push(this.newWebsite());
        this.relationships = this.contact.relationships.map((relation) => [relation, id(relation)]);
        this.relationships.push(this.newRelationship());
        this.messengerHandles = this.contact.messengerHandles.map((handler) => [handler, id(handler)]);
        this.messengerHandles.push(this.newMessengerHandler());
        this.pronouns = this.contact.pronouns.map((pronoun) => [pronoun, id(pronoun)]);
        this.pronouns.push(this.newPronoun());
        this.customDates = this.contact.customDate.map((date) => [
            {
                ...date,
                date: formatContactDate(date.dateIso),
                isValid: true,
            },
            id(date),
        ]);
        this.customDates.push(this.newCustomDate());
        this.hasInvalidBirthday = false;
        this.birthday = formatContactDate(this.contact.birthdayIso) || "";
        this.dialog = this.createDialog();
        this.windowCloseUnsubscribe = noOp;
    }
    oncreate() {
        this.windowCloseUnsubscribe = windowFacade.addWindowCloseListener(() => { });
    }
    onremove() {
        this.windowCloseUnsubscribe();
    }
    view() {
        return m("#contact-editor", [
            m(".wrapping-row", [this.renderFirstNameField(), this.renderLastNameField()]),
            m(".wrapping-row", [this.renderField("middleName", "middleName_placeholder"), this.renderTitleField()]),
            m(".wrapping-row", [this.renderField("nameSuffix", "nameSuffix_placeholder"), this.renderField("phoneticFirst", "phoneticFirst_placeholder")]),
            m(".wrapping-row", [
                this.renderField("phoneticMiddle", "phoneticMiddle_placeholder"),
                this.renderField("phoneticLast", "phoneticLast_placeholder"),
            ]),
            m(".wrapping-row", [this.renderField("nickname", "nickname_placeholder"), this.renderBirthdayField()]),
            m(".wrapping-row", [
                this.renderRoleField(),
                this.renderField("department", "department_placeholder"),
                this.renderCompanyField(),
                this.renderCommentField(),
            ]),
            m(".wrapping-row", [
                m(".custom-dates.mt-xl", [
                    m(".h4", lang.get("dates_label")),
                    m(".aggregateEditors", [
                        this.customDates.map(([date, id], index) => {
                            const lastEditor = index === lastIndex(this.customDates);
                            return this.renderCustomDatesEditor(id, !lastEditor, date);
                        }),
                    ]),
                ]),
                m(".mail.mt-xl", [
                    m(".h4", lang.get("email_label")),
                    m(".aggregateEditors", [
                        this.mailAddresses.map(([address, id], index) => {
                            const lastEditor = index === lastIndex(this.mailAddresses);
                            return this.renderMailAddressesEditor(id, !lastEditor, address);
                        }),
                    ]),
                ]),
                m(".phone.mt-xl", [
                    m(".h4", lang.get("phone_label")),
                    m(".aggregateEditors", [
                        this.phoneNumbers.map(([phoneNumber, id], index) => {
                            const lastEditor = index === lastIndex(this.phoneNumbers);
                            return this.renderPhonesEditor(id, !lastEditor, phoneNumber);
                        }),
                    ]),
                ]),
                m(".relationship.mt-xl", [
                    m(".h4", lang.get("relationships_label")),
                    m(".aggregateEditors", [
                        this.relationships.map(([relationship, id], index) => {
                            const lastEditor = index === lastIndex(this.relationships);
                            return this.renderRelationshipsEditor(id, !lastEditor, relationship);
                        }),
                    ]),
                ]),
                m(".address.mt-xl", [
                    m(".h4", lang.get("address_label")),
                    m(".aggregateEditors", [
                        this.addresses.map(([address, id], index) => {
                            const lastEditor = index === lastIndex(this.addresses);
                            return this.renderAddressesEditor(id, !lastEditor, address);
                        }),
                    ]),
                ]),
            ]),
            m(".wrapping-row", [
                m(".pronouns.mt-xl", [
                    m(".h4", lang.get("pronouns_label")),
                    m(".aggregateEditors", [
                        this.pronouns.map(([pronouns, id], index) => {
                            const lastEditor = index === lastIndex(this.pronouns);
                            return this.renderPronounsEditor(id, !lastEditor, pronouns);
                        }),
                    ]),
                ]),
                m(".social.mt-xl", [
                    m(".h4", lang.get("social_label")),
                    m(".aggregateEditors", [
                        this.socialIds.map(([socialId, id], index) => {
                            const lastEditor = index === lastIndex(this.socialIds);
                            return this.renderSocialsEditor(id, !lastEditor, socialId);
                        }),
                    ]),
                ]),
                m(".website.mt-xl", [
                    m(".h4", lang.get("websites_label")),
                    m(".aggregateEditors", [
                        this.websites.map(([website, id], index) => {
                            const lastEditor = index === lastIndex(this.websites);
                            return this.renderWebsitesEditor(id, !lastEditor, website);
                        }),
                    ]),
                ]),
                m(".instant-message.mt-xl", [
                    m(".h4", lang.get("messenger_handles_label")),
                    m(".aggregateEditors", [
                        this.messengerHandles.map(([handle, id], index) => {
                            const lastEditor = index === lastIndex(this.messengerHandles);
                            return this.renderMessengerHandleEditor(id, !lastEditor, handle);
                        }),
                    ]),
                ]),
            ]),
            this.renderPresharedPasswordField(),
            m(".pb"),
        ]);
    }
    show() {
        this.dialog.show();
    }
    close() {
        this.dialog.close();
    }
    /**
     * * validate the input data
     * * create or update the contact, depending on status
     * * if successful, close the dialog.
     *
     * will not call the save function again if the operation is already running
     * @private
     */
    async validateAndSave() {
        if (this.hasInvalidBirthday) {
            return Dialog.message("invalidBirthday_msg");
        }
        if (this.saving) {
            // not showing a message. if the resource is locked, we'll show one when appropriate.
            return;
        }
        this.saving = true;
        this.contact.mailAddresses = this.mailAddresses.map((e) => e[0]).filter((e) => e.address.trim().length > 0);
        this.contact.phoneNumbers = this.phoneNumbers.map((e) => e[0]).filter((e) => e.number.trim().length > 0);
        this.contact.addresses = this.addresses.map((e) => e[0]).filter((e) => e.address.trim().length > 0);
        this.contact.socialIds = this.socialIds.map((e) => e[0]).filter((e) => e.socialId.trim().length > 0);
        this.contact.customDate = this.customDates.map((e) => e[0]).filter((e) => e.dateIso.trim().length > 0);
        this.contact.relationships = this.relationships.map((e) => e[0]).filter((e) => e.person.trim().length > 0);
        this.contact.websites = this.websites.map((e) => e[0]).filter((e) => e.url.length > 0);
        this.contact.messengerHandles = this.messengerHandles.map((e) => e[0]).filter((e) => e.handle.length > 0);
        this.contact.pronouns = this.pronouns.map((e) => e[0]).filter((e) => e.pronouns.length > 0);
        try {
            if (this.isNewContact) {
                await this.saveNewContact();
            }
            else {
                await this.updateExistingContact();
            }
            this.close();
        }
        catch (e) {
            this.saving = false;
            if (e instanceof PayloadTooLargeError) {
                return Dialog.message("requestTooLarge_msg");
            }
            if (e instanceof LockedError) {
                return Dialog.message("operationStillActive_msg");
            }
        }
        // if we got here, we're closing the dialog and don't have to reset this.saving
    }
    async updateExistingContact() {
        try {
            await this.entityClient.update(this.contact);
        }
        catch (e) {
            if (e instanceof NotFoundError) {
                console.log(TAG, `could not update contact ${this.contact._id}: not found`);
            }
        }
    }
    async saveNewContact() {
        this.contact._ownerGroup = assertNotNull(locator.logins.getUserController().user.memberships.find((m) => m.groupType === GroupType.Contact), "did not find contact group membership").group;
        const contactId = await this.entityClient.setup(this.listId, this.contact);
        if (this.newContactIdReceiver) {
            this.newContactIdReceiver(contactId);
        }
    }
    renderCustomDatesEditor(id, allowCancel, date) {
        let dateHelpText = () => {
            let bday = createBirthday({
                day: "22",
                month: "9",
                year: "2000",
            });
            return !date.isValid
                ? lang.getTranslation("invalidDateFormat_msg", {
                    "{1}": formatBirthdayNumeric(bday),
                })
                : lang.getTranslation("emptyString_msg");
        };
        const typeLabels = typedEntries(ContactCustomDateTypeToLabel);
        return m(ContactAggregateEditor, {
            value: date.date,
            fieldType: "text" /* TextFieldType.Text */,
            label: getContactCustomDateTypeToLabel(downcast(date.type), date.customTypeName),
            helpLabel: dateHelpText(),
            cancelAction: () => {
                findAndRemove(this.customDates, (t) => t[1] === id);
            },
            onUpdate: (value) => {
                date.date = value;
                if (value.trim().length > 0) {
                    let parsedDate = parseBirthday(value, (referenceDate) => formatDate(referenceDate));
                    if (parsedDate) {
                        try {
                            date.dateIso = birthdayToIsoDate(parsedDate);
                            if (date === lastThrow(this.customDates)[0])
                                this.customDates.push(this.newCustomDate());
                            date.isValid = true;
                        }
                        catch (e) {
                            date.isValid = false;
                        }
                    }
                    else {
                        date.isValid = false;
                    }
                }
                else {
                    date.isValid = true;
                }
            },
            animateCreate: !date.dateIso,
            allowCancel,
            key: id,
            typeLabels,
            onTypeSelected: (type) => this.onTypeSelected(type === "2" /* ContactCustomDateType.CUSTOM */, type, date),
        });
    }
    renderMailAddressesEditor(id, allowCancel, mailAddress) {
        let helpLabel;
        if (mailAddress.address.trim().length > 0 && !isMailAddress(mailAddress.address.trim(), false)) {
            helpLabel = "invalidInputFormat_msg";
        }
        else {
            helpLabel = "emptyString_msg";
        }
        const typeLabels = typedEntries(ContactMailAddressTypeToLabel);
        return m(ContactAggregateEditor, {
            value: mailAddress.address,
            fieldType: "email" /* TextFieldType.Email */,
            label: getContactAddressTypeLabel(downcast(mailAddress.type), mailAddress.customTypeName),
            helpLabel,
            cancelAction: () => {
                findAndRemove(this.mailAddresses, (t) => t[1] === id);
            },
            onUpdate: (value) => {
                mailAddress.address = value;
                if (mailAddress === lastThrow(this.mailAddresses)[0])
                    this.mailAddresses.push(this.newAddress());
            },
            animateCreate: !mailAddress.address,
            allowCancel,
            key: id,
            typeLabels,
            onTypeSelected: (type) => this.onTypeSelected(type === "3" /* ContactAddressType.CUSTOM */, type, mailAddress),
        });
    }
    renderPhonesEditor(id, allowCancel, phoneNumber) {
        const typeLabels = typedEntries(ContactPhoneNumberTypeToLabel);
        return m(ContactAggregateEditor, {
            value: phoneNumber.number,
            fieldType: "text" /* TextFieldType.Text */,
            label: getContactPhoneNumberTypeLabel(downcast(phoneNumber.type), phoneNumber.customTypeName),
            helpLabel: "emptyString_msg",
            cancelAction: () => {
                findAndRemove(this.phoneNumbers, (t) => t[1] === id);
            },
            onUpdate: (value) => {
                phoneNumber.number = value;
                if (phoneNumber === lastThrow(this.phoneNumbers)[0])
                    this.phoneNumbers.push(this.newPhoneNumber());
            },
            animateCreate: !phoneNumber.number,
            allowCancel,
            key: id,
            typeLabels,
            onTypeSelected: (type) => this.onTypeSelected(type === "5" /* ContactPhoneNumberType.CUSTOM */, type, phoneNumber),
        });
    }
    renderAddressesEditor(id, allowCancel, address) {
        const typeLabels = typedEntries(ContactMailAddressTypeToLabel);
        return m(ContactAggregateEditor, {
            value: address.address,
            fieldType: "area" /* TextFieldType.Area */,
            label: getContactAddressTypeLabel(downcast(address.type), address.customTypeName),
            helpLabel: "emptyString_msg",
            cancelAction: () => {
                findAndRemove(this.addresses, (t) => t[1] === id);
            },
            onUpdate: (value) => {
                address.address = value;
                if (address === lastThrow(this.addresses)[0])
                    this.addresses.push(this.newAddress());
            },
            animateCreate: !address.address,
            allowCancel,
            key: id,
            typeLabels,
            onTypeSelected: (type) => this.onTypeSelected(type === "3" /* ContactAddressType.CUSTOM */, type, address),
        });
    }
    renderSocialsEditor(id, allowCancel, socialId) {
        const typeLabels = typedEntries(ContactSocialTypeToLabel);
        return m(ContactAggregateEditor, {
            value: socialId.socialId,
            fieldType: "text" /* TextFieldType.Text */,
            label: getContactSocialTypeLabel(downcast(socialId.type), socialId.customTypeName),
            helpLabel: "emptyString_msg",
            autocapitalizeTextField: "none" /* Autocapitalize.none */,
            cancelAction: () => {
                findAndRemove(this.socialIds, (t) => t[1] === id);
            },
            onUpdate: (value) => {
                socialId.socialId = value;
                if (socialId === lastThrow(this.socialIds)[0])
                    this.socialIds.push(this.newSocialId());
            },
            animateCreate: !socialId.socialId,
            allowCancel,
            key: id,
            typeLabels,
            onTypeSelected: (type) => this.onTypeSelected(type === "5" /* ContactSocialType.CUSTOM */, type, socialId),
        });
    }
    renderWebsitesEditor(id, allowCancel, website) {
        const typeLabels = typedEntries(ContactCustomWebsiteTypeToLabel);
        return m(ContactAggregateEditor, {
            value: website.url,
            fieldType: "text" /* TextFieldType.Text */,
            label: getContactCustomWebsiteTypeToLabel(downcast(website.type), website.customTypeName),
            helpLabel: "emptyString_msg",
            autocapitalizeTextField: "none" /* Autocapitalize.none */,
            cancelAction: () => {
                findAndRemove(this.websites, (t) => t[1] === id);
            },
            onUpdate: (value) => {
                website.url = value;
                if (website === lastThrow(this.websites)[0])
                    this.websites.push(this.newWebsite());
            },
            animateCreate: !website.url,
            allowCancel,
            key: id,
            typeLabels,
            onTypeSelected: (type) => this.onTypeSelected(type === "3" /* ContactWebsiteType.CUSTOM */, type, website),
        });
    }
    renderRelationshipsEditor(id, allowCancel, relationship) {
        const typeLabels = typedEntries(ContactRelationshipTypeToLabel);
        return m(ContactAggregateEditor, {
            value: relationship.person,
            fieldType: "text" /* TextFieldType.Text */,
            label: getContactRelationshipTypeToLabel(downcast(relationship.type), relationship.customTypeName),
            helpLabel: "emptyString_msg",
            cancelAction: () => {
                findAndRemove(this.relationships, (t) => t[1] === id);
            },
            onUpdate: (value) => {
                relationship.person = value;
                if (relationship === lastThrow(this.relationships)[0])
                    this.relationships.push(this.newRelationship());
            },
            animateCreate: !relationship.person,
            allowCancel,
            key: id,
            typeLabels,
            onTypeSelected: (type) => this.onTypeSelected(type === "11" /* ContactRelationshipType.CUSTOM */, type, relationship),
        });
    }
    renderMessengerHandleEditor(id, allowCancel, messengerHandle) {
        const typeLabels = typedEntries(ContactMessengerHandleTypeToLabel);
        return m(ContactAggregateEditor, {
            value: messengerHandle.handle,
            fieldType: "text" /* TextFieldType.Text */,
            label: getContactMessengerHandleTypeToLabel(downcast(messengerHandle.type), messengerHandle.customTypeName),
            helpLabel: "emptyString_msg",
            autocapitalizeTextField: "none" /* Autocapitalize.none */,
            cancelAction: () => {
                findAndRemove(this.messengerHandles, (t) => t[1] === id);
            },
            onUpdate: (value) => {
                messengerHandle.handle = value;
                if (messengerHandle === lastThrow(this.messengerHandles)[0])
                    this.messengerHandles.push(this.newMessengerHandler());
            },
            animateCreate: !messengerHandle.handle,
            allowCancel,
            key: id,
            typeLabels,
            onTypeSelected: (type) => this.onTypeSelected(type === "5" /* ContactMessengerHandleType.CUSTOM */, type, messengerHandle),
        });
    }
    renderPronounsEditor(id, allowCancel, pronouns) {
        const typeLabels = typedEntries({ "0": "language_label" });
        return m(ContactAggregateEditor, {
            value: pronouns.pronouns,
            fieldType: "text" /* TextFieldType.Text */,
            label: lang.makeTranslation("lang", pronouns.language),
            helpLabel: "emptyString_msg",
            autocapitalizeTextField: "none" /* Autocapitalize.none */,
            cancelAction: () => {
                findAndRemove(this.pronouns, (t) => t[1] === id);
            },
            onUpdate: (value) => {
                pronouns.pronouns = value;
                if (pronouns === lastThrow(this.pronouns)[0])
                    this.pronouns.push(this.newPronoun());
            },
            animateCreate: !pronouns.pronouns,
            allowCancel,
            key: id,
            typeLabels,
            onTypeSelected: () => this.onLanguageSelect(pronouns),
        });
    }
    renderCommentField() {
        return m(StandaloneField, {
            label: "comment_label",
            value: this.contact.comment,
            oninput: (value) => (this.contact.comment = value),
            type: "area" /* TextFieldType.Area */,
        });
    }
    renderFirstNameField() {
        return m(StandaloneField, {
            label: "firstName_placeholder",
            value: this.contact.firstName,
            oninput: (value) => (this.contact.firstName = value),
        });
    }
    renderField(fieldName, label) {
        return m(StandaloneField, {
            label,
            value: (this.contact[fieldName] ?? ""),
            oninput: (value) => {
                // Typescript will complain about it as an Unnecessary type check, but when the code gets
                // transpiled to javascript, without the check, we can pass any value
                if (typeof value === "string") {
                    this.contact[fieldName] = downcast(value);
                }
            },
        });
    }
    renderLastNameField() {
        return m(StandaloneField, {
            label: "lastName_placeholder",
            value: this.contact.lastName,
            oninput: (value) => (this.contact.lastName = value),
        });
    }
    renderBirthdayField() {
        let birthdayHelpText = () => {
            let bday = createBirthday({
                day: "22",
                month: "9",
                year: "2000",
            });
            return this.hasInvalidBirthday
                ? lang.get("invalidDateFormat_msg", {
                    "{1}": formatBirthdayNumeric(bday),
                })
                : "";
        };
        return m(StandaloneField, {
            label: "birthday_alt",
            value: this.birthday,
            helpLabel: birthdayHelpText,
            oninput: (value) => {
                this.birthday = value;
                if (value.trim().length === 0) {
                    this.contact.birthdayIso = null;
                    this.hasInvalidBirthday = false;
                }
                else {
                    let birthday = parseBirthday(value, (referenceDate) => formatDate(referenceDate));
                    if (birthday) {
                        try {
                            this.contact.birthdayIso = birthdayToIsoDate(birthday);
                            this.hasInvalidBirthday = false;
                        }
                        catch (e) {
                            this.hasInvalidBirthday = true;
                        }
                    }
                    else {
                        this.hasInvalidBirthday = true;
                    }
                }
            },
        });
    }
    renderCompanyField() {
        return m(StandaloneField, {
            label: "company_label",
            value: this.contact.company,
            oninput: (value) => (this.contact.company = value),
        });
    }
    renderRoleField() {
        return m(StandaloneField, {
            label: "role_placeholder",
            value: this.contact.role,
            oninput: (value) => (this.contact.role = value),
        });
    }
    renderTitleField() {
        return m(StandaloneField, {
            label: "title_placeholder",
            value: this.contact.title || "",
            oninput: (value) => (this.contact.title = value),
        });
    }
    renderPresharedPasswordField() {
        if (!this.isNewContact && !this.contact.presharedPassword) {
            return null;
        }
        return m(".wrapping-row", [
            m(".passwords.mt-xl", [
                m(".h4", lang.get("presharedPassword_label")),
                m(PasswordField, {
                    value: this.contact.presharedPassword ?? "",
                    autocompleteAs: "new-password" /* Autocomplete.newPassword */,
                    oninput: (value) => (this.contact.presharedPassword = value),
                }),
            ]),
            m(".spacer"),
        ]);
    }
    createCloseButtonAttrs() {
        return {
            label: "close_alt",
            click: () => this.close(),
            type: "secondary" /* ButtonType.Secondary */,
        };
    }
    newPhoneNumber() {
        const phoneNumber = createContactPhoneNumber({
            type: "2" /* ContactPhoneNumberType.MOBILE */,
            customTypeName: "",
            number: "",
        });
        return [phoneNumber, this.newId()];
    }
    newMailAddress() {
        const mailAddress = createContactMailAddress({
            type: "1" /* ContactAddressType.WORK */,
            customTypeName: "",
            address: "",
        });
        return [mailAddress, this.newId()];
    }
    newAddress() {
        const address = createContactAddress({
            type: "1" /* ContactAddressType.WORK */,
            customTypeName: "",
            address: "",
        });
        return [address, this.newId()];
    }
    newSocialId() {
        const socialId = createContactSocialId({
            type: "0" /* ContactSocialType.TWITTER */,
            customTypeName: "",
            socialId: "",
        });
        return [socialId, this.newId()];
    }
    newRelationship() {
        const relationship = createContactRelationship({
            person: "",
            type: "8" /* ContactRelationshipType.ASSISTANT */,
            customTypeName: "",
        });
        return [relationship, this.newId()];
    }
    newMessengerHandler() {
        const messengerHandler = createContactMessengerHandle({
            handle: "",
            type: "0" /* ContactMessengerHandleType.SIGNAL */,
            customTypeName: "",
        });
        return [messengerHandler, this.newId()];
    }
    newPronoun() {
        const contactPronouns = createContactPronouns({
            language: "",
            pronouns: "",
        });
        return [contactPronouns, this.newId()];
    }
    newCustomDate() {
        const contactDate = createContactCustomDate({
            dateIso: "",
            type: "0" /* ContactCustomDateType.ANNIVERSARY */,
            customTypeName: "",
        });
        return [{ ...contactDate, date: "", isValid: true }, this.newId()];
    }
    newWebsite() {
        const website = createContactWebsite({
            type: "0" /* ContactWebsiteType.PRIVATE */,
            url: "",
            customTypeName: "",
        });
        return [website, this.newId()];
    }
    newId() {
        return timestampToGeneratedId(Date.now());
    }
    onTypeSelected(isCustom, key, aggregate) {
        if (isCustom) {
            setTimeout(() => {
                Dialog.showTextInputDialog({
                    title: "customLabel_label",
                    label: "customLabel_label",
                    defaultValue: aggregate.customTypeName,
                }).then((name) => {
                    aggregate.customTypeName = name;
                    aggregate.type = key;
                });
            }, DefaultAnimationTime); // wait till the dropdown is hidden
        }
        else {
            aggregate.type = key;
        }
    }
    onLanguageSelect(pronouns) {
        setTimeout(() => {
            Dialog.showTextInputDialog({
                title: "language_label",
                label: "language_label",
                defaultValue: pronouns.language.length > 0 ? pronouns.language : "",
            }).then((name) => {
                pronouns.language = name;
            });
        }, DefaultAnimationTime); // wait till the dropdown is hidden
    }
    createDialog() {
        const headerBarAttrs = {
            left: [this.createCloseButtonAttrs()],
            middle: lang.makeTranslation("name", this.contact.firstName + " " + this.contact.lastName),
            right: [
                {
                    label: "save_action",
                    click: () => this.validateAndSave(),
                    type: "primary" /* ButtonType.Primary */,
                },
            ],
        };
        return Dialog.largeDialog(headerBarAttrs, this)
            .addShortcut({
            key: Keys.ESC,
            exec: () => this.close(),
            help: "close_alt",
        })
            .addShortcut({
            key: Keys.S,
            ctrlOrCmd: true,
            exec: () => {
                // noinspection JSIgnoredPromiseFromCall
                this.validateAndSave();
            },
            help: "save_action",
        })
            .setCloseHandler(() => this.close());
    }
}
/** Renders TextField with wrapper and padding element to align them all. */
class StandaloneField {
    view({ attrs }) {
        return m(".flex.child-grow", [m(TextField, attrs), m(".icon-button")]);
    }
}
//# sourceMappingURL=ContactEditor.js.map