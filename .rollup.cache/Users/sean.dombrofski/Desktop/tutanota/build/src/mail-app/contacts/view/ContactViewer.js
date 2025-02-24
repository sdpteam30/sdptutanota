import m from "mithril";
import { lang } from "../../../common/misc/LanguageViewModel";
import { TextField } from "../../../common/gui/base/TextField.js";
import { getContactSocialType, getCustomDateType, getRelationshipType, } from "../../../common/api/common/TutanotaConstants";
import { assertNotNull, downcast, memoized, NBSP, noOp } from "@tutao/tutanota-utils";
import { getContactAddressTypeLabel, getContactCustomDateTypeToLabel, getContactCustomWebsiteTypeToLabel, getContactMessengerHandleTypeToLabel, getContactPhoneNumberTypeLabel, getContactRelationshipTypeToLabel, getContactSocialTypeLabel, } from "./ContactGuiUtils";
import { formatContactDate, getMessengerHandleUrl, getSocialUrl, getWebsiteUrl } from "../../../common/contactsFunctionality/ContactUtils.js";
import { assertMainOrNode } from "../../../common/api/common/Env";
import { IconButton } from "../../../common/gui/base/IconButton.js";
import { attachDropdown } from "../../../common/gui/base/Dropdown.js";
import { getContactTitle } from "../../../common/gui/base/GuiUtils.js";
assertMainOrNode();
/**
 *  Displays information about a single contact
 */
export class ContactViewer {
    contactAppellation = memoized(getContactTitle);
    contactPhoneticName = memoized((contact) => {
        const firstName = contact.phoneticFirst ?? "";
        const middleName = contact.phoneticMiddle ? ` ${contact.phoneticMiddle}` : "";
        const lastName = contact.phoneticLast ? ` ${contact.phoneticLast}` : "";
        const phoneticName = (firstName + middleName + lastName).trim();
        return phoneticName.length > 0 ? phoneticName : null;
    });
    formattedBirthday = memoized((contact) => {
        return this.hasBirthday(contact) ? formatContactDate(contact.birthdayIso) : null;
    });
    hasBirthday(contact) {
        return contact.birthdayIso != null;
    }
    view({ attrs }) {
        const { contact, onWriteMail } = attrs;
        const phoneticName = this.contactPhoneticName(attrs.contact);
        return m(".plr-l.pb-floating.mlr-safe-inset", [
            m("", [
                m(".flex-space-between.flex-wrap.mt-m", m(".left.flex-grow-shrink-150", [
                    m(".h2.selectable.text-break", [
                        this.contactAppellation(contact),
                        NBSP, // alignment in case nothing is present here
                    ]),
                    phoneticName ? m("", phoneticName) : null,
                    contact.pronouns.length > 0 ? this.renderPronounsInfo(contact) : null,
                    contact.nickname ? m("", `"${contact.nickname}"`) : null,
                    m("", this.renderJobInformation(contact)),
                    this.hasBirthday(contact) ? m("", this.formattedBirthday(contact)) : null,
                ]), this.renderActions(contact, attrs)),
                m("hr.hr.mt.mb"),
            ]),
            this.renderCustomDatesAndRelationships(contact),
            this.renderMailAddressesAndPhones(contact, onWriteMail),
            this.renderAddressesAndSocialIds(contact),
            this.renderWebsitesAndInstantMessengers(contact),
            this.renderComment(contact),
        ]);
    }
    renderExtendedActions(contact, attrs) {
        return m.fragment({}, [this.renderEditButton(contact, attrs), this.renderDeleteButton(contact, attrs)]);
    }
    renderEditButton(contact, attrs) {
        if (!attrs.editAction) {
            return null;
        }
        return m(IconButton, {
            title: "edit_action",
            icon: "Edit" /* Icons.Edit */,
            click: () => assertNotNull(attrs.editAction, "Invalid Edit action in Contact Viewer")(contact),
        });
    }
    renderDeleteButton(contact, attrs) {
        if (!attrs.deleteAction) {
            return null;
        }
        return m(IconButton, {
            title: "delete_action",
            icon: "Trash" /* Icons.Trash */,
            click: () => assertNotNull(attrs.deleteAction, "Invalid Delete action in Contact Viewer")([contact]),
        });
    }
    renderActionsDropdown(contact, attrs) {
        const actions = [];
        if (attrs.editAction) {
            actions.push({
                label: "edit_action",
                icon: "Edit" /* Icons.Edit */,
                click: () => {
                    assertNotNull(attrs.editAction, "Edit action in Contact Viewer has disappeared")(contact);
                },
            });
        }
        if (attrs.deleteAction) {
            actions.push({
                label: "delete_action",
                icon: "Trash" /* Icons.Trash */,
                click: () => {
                    assertNotNull(attrs.deleteAction, "Delete action in Contact Viewer has disappeared")([contact]);
                },
            });
        }
        if (actions.length === 0) {
            return null;
        }
        return m(".flex-end", m(IconButton, attachDropdown({
            mainButtonAttrs: {
                title: "more_label",
                icon: "More" /* Icons.More */,
            },
            childAttrs: () => actions,
        })));
    }
    renderActions(contact, attrs) {
        if (!contact || !(attrs.editAction || attrs.deleteAction)) {
            return null;
        }
        if (attrs.extendedActions) {
            return this.renderExtendedActions(contact, attrs);
        }
        return this.renderActionsDropdown(contact, attrs);
    }
    renderJobInformation(contact) {
        const spacerFunction = () => m("span.plr-s", {
            style: {
                fontWeight: "900",
            },
        }, " · ");
        return insertBetween([
            contact.role ? m("span", contact.role) : null,
            contact.department ? m("span", contact.department) : null,
            contact.company ? m("span", contact.company) : null,
        ], spacerFunction);
    }
    renderPronounsInfo(contact) {
        const spacerFunction = () => m("span.plr-s", {
            style: {
                fontWeight: "900",
            },
        }, " · ");
        return insertBetween(contact.pronouns.map((pronouns) => {
            let language = "";
            if (pronouns.language != "") {
                language = `${pronouns.language}: `;
            }
            return m("span", `${language}${pronouns.pronouns}`);
        }), spacerFunction);
    }
    renderAddressesAndSocialIds(contact) {
        const addresses = contact.addresses.map((element) => this.renderAddress(element));
        const socials = contact.socialIds.map((element) => this.renderSocialId(element));
        return addresses.length > 0 || socials.length > 0
            ? m(".wrapping-row", [
                m(".address.mt-l", addresses.length > 0 ? [m(".h4", lang.get("address_label")), m(".aggregateEditors", addresses)] : null),
                m(".social.mt-l", socials.length > 0 ? [m(".h4", lang.get("social_label")), m(".aggregateEditors", socials)] : null),
            ])
            : null;
    }
    renderWebsitesAndInstantMessengers(contact) {
        const websites = contact.websites.map((element) => this.renderWebsite(element));
        const instantMessengers = contact.messengerHandles.map((element) => this.renderMessengerHandle(element));
        return websites.length > 0 || instantMessengers.length > 0
            ? m(".wrapping-row", [
                m(".website.mt-l", websites.length > 0 ? [m(".h4", lang.get("websites_label")), m(".aggregateEditors", websites)] : null),
                m(".messenger-handles.mt-l", instantMessengers.length > 0 ? [m(".h4", lang.get("messenger_handles_label")), m(".aggregateEditors", instantMessengers)] : null),
            ])
            : null;
    }
    renderCustomDatesAndRelationships(contact) {
        const dates = contact.customDate.map((element) => m(TextField, {
            label: getContactCustomDateTypeToLabel(getCustomDateType(element), element.customTypeName),
            value: formatContactDate(element.dateIso),
            isReadOnly: true,
        }));
        const relationships = contact.relationships.map((element) => m(TextField, {
            label: getContactRelationshipTypeToLabel(getRelationshipType(element), element.customTypeName),
            value: element.person,
            isReadOnly: true,
        }));
        return dates.length > 0 || relationships.length > 0
            ? m(".wrapping-row", [
                m(".dates.mt-l", dates.length > 0 ? [m(".h4", lang.get("dates_label")), m(".aggregateEditors", dates)] : null),
                m(".relationships.mt-l", relationships.length > 0 ? [m(".h4", lang.get("relationships_label")), m(".aggregateEditors", relationships)] : null),
            ])
            : null;
    }
    renderMailAddressesAndPhones(contact, onWriteMail) {
        const mailAddresses = contact.mailAddresses.map((element) => this.renderMailAddress(contact, element, onWriteMail));
        const phones = contact.phoneNumbers.map((element) => this.renderPhoneNumber(element));
        return mailAddresses.length > 0 || phones.length > 0
            ? m(".wrapping-row", [
                m(".mail.mt-l", mailAddresses.length > 0 ? [m(".h4", lang.get("email_label")), m(".aggregateEditors", [mailAddresses])] : null),
                m(".phone.mt-l", phones.length > 0 ? [m(".h4", lang.get("phone_label")), m(".aggregateEditors", [phones])] : null),
            ])
            : null;
    }
    renderComment(contact) {
        return contact.comment && contact.comment.trim().length > 0
            ? [m(".h4.mt-l", lang.get("comment_label")), m("p.mt-l.text-prewrap.text-break.selectable", contact.comment)]
            : null;
    }
    renderSocialId(contactSocialId) {
        const showButton = m(IconButton, {
            title: "showURL_alt",
            click: noOp,
            icon: "ArrowForward" /* Icons.ArrowForward */,
            size: 1 /* ButtonSize.Compact */,
        });
        return m(TextField, {
            label: getContactSocialTypeLabel(getContactSocialType(contactSocialId), contactSocialId.customTypeName),
            value: contactSocialId.socialId,
            isReadOnly: true,
            injectionsRight: () => m(`a[href=${getSocialUrl(contactSocialId)}][target=_blank]`, showButton),
        });
    }
    renderWebsite(website) {
        const showButton = m(IconButton, {
            title: "showURL_alt",
            click: noOp,
            icon: "ArrowForward" /* Icons.ArrowForward */,
            size: 1 /* ButtonSize.Compact */,
        });
        return m(TextField, {
            label: getContactCustomWebsiteTypeToLabel(downcast(website.type), website.customTypeName),
            value: website.url,
            isReadOnly: true,
            injectionsRight: () => m(`a[href=${getWebsiteUrl(website.url)}][target=_blank]`, showButton),
        });
    }
    renderMessengerHandle(messengerHandle) {
        const showButton = m(IconButton, {
            title: "showURL_alt",
            click: noOp,
            icon: "ArrowForward" /* Icons.ArrowForward */,
            size: 1 /* ButtonSize.Compact */,
        });
        return m(TextField, {
            label: getContactMessengerHandleTypeToLabel(downcast(messengerHandle.type), messengerHandle.customTypeName),
            value: messengerHandle.handle,
            isReadOnly: true,
            injectionsRight: () => m(`a[href=${getMessengerHandleUrl(messengerHandle)}][target=_blank]`, showButton),
        });
    }
    renderMailAddress(contact, address, onWriteMail) {
        const newMailButton = m(IconButton, {
            title: "sendMail_alt",
            click: () => onWriteMail({ name: `${contact.firstName} ${contact.lastName}`.trim(), address: address.address, contact: contact }),
            icon: "PencilSquare" /* Icons.PencilSquare */,
            size: 1 /* ButtonSize.Compact */,
        });
        return m(TextField, {
            label: getContactAddressTypeLabel(address.type, address.customTypeName),
            value: address.address,
            isReadOnly: true,
            injectionsRight: () => [newMailButton],
        });
    }
    renderPhoneNumber(phone) {
        const callButton = m(IconButton, {
            title: "callNumber_alt",
            click: () => null,
            icon: "Call" /* Icons.Call */,
            size: 1 /* ButtonSize.Compact */,
        });
        return m(TextField, {
            label: getContactPhoneNumberTypeLabel(phone.type, phone.customTypeName),
            value: phone.number,
            isReadOnly: true,
            injectionsRight: () => m(`a[href="tel:${phone.number}"][target=_blank]`, callButton),
        });
    }
    renderAddress(address) {
        let prepAddress;
        if (address.address.indexOf("\n") !== -1) {
            prepAddress = encodeURIComponent(address.address.split("\n").join(" "));
        }
        else {
            prepAddress = encodeURIComponent(address.address);
        }
        const showButton = m(IconButton, {
            title: "showAddress_alt",
            click: () => null,
            icon: "Pin" /* Icons.Pin */,
            size: 1 /* ButtonSize.Compact */,
        });
        return m(TextField, {
            label: getContactAddressTypeLabel(downcast(address.type), address.customTypeName),
            value: address.address,
            isReadOnly: true,
            type: "area" /* TextFieldType.Area */,
            injectionsRight: () => m(`a[href="https://www.openstreetmap.org/search?query=${prepAddress}"][target=_blank]`, showButton),
        });
    }
}
function insertBetween(array, spacer) {
    let ret = [];
    for (let e of array) {
        if (e != null) {
            if (ret.length > 0) {
                ret.push(spacer());
            }
            ret.push(e);
        }
    }
    return ret;
}
//# sourceMappingURL=ContactViewer.js.map