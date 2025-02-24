import m from "mithril";
import { createContact, createContactMailAddress } from "../../../common/api/entities/tutanota/TypeRefs.js";
import { theme } from "../../../common/gui/theme.js";
import { Button } from "../../../common/gui/base/Button.js";
import { responsiveCardHMargin } from "../../../common/gui/cards.js";
import { ContactCardViewer } from "./ContactCardViewer.js";
import { lang } from "../../../common/misc/LanguageViewModel.js";
export class ContactListEntryViewer {
    view({ attrs }) {
        return m(".flex.flex-column", [
            m(".border-radius-big.rel", {
                class: responsiveCardHMargin(),
                style: {
                    backgroundColor: theme.content_bg,
                },
            }, m(".plr-l.pt.pb.mlr-safe-inset", m(".h2.selectable.text-break", attrs.entry.emailAddress))),
            m(".mt-l"),
            attrs.contacts.length >= 1
                ? attrs.contacts.map((contact) => m(ContactCardViewer, {
                    contact,
                    onWriteMail: attrs.onWriteMail,
                    editAction: attrs.contactEdit,
                    deleteAction: attrs.contactDelete,
                }))
                : m(".border-radius-big.rel", {
                    class: responsiveCardHMargin(),
                    style: {
                        backgroundColor: theme.content_bg,
                    },
                }, m(".plr-l.pt.pb.mlr-safe-inset", lang.get("noContactFound_msg"), m(Button, {
                    label: "createContact_action",
                    click: () => {
                        let newContact = createContact({
                            mailAddresses: [
                                createContactMailAddress({
                                    type: "1" /* ContactAddressType.WORK */,
                                    customTypeName: "",
                                    address: attrs.entry.emailAddress,
                                }),
                            ],
                            oldBirthdayAggregate: null,
                            addresses: [],
                            birthdayIso: null,
                            comment: "",
                            company: "",
                            firstName: "",
                            lastName: "",
                            nickname: null,
                            oldBirthdayDate: null,
                            phoneNumbers: [],
                            photo: null,
                            role: "",
                            presharedPassword: null,
                            socialIds: [],
                            title: null,
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
                        attrs.contactCreate(newContact);
                    },
                    type: "primary" /* ButtonType.Primary */,
                }))),
        ]);
    }
}
export function getContactListEntriesSelectionMessage(selectedEntities) {
    if (selectedEntities && selectedEntities.length > 0) {
        return lang.getTranslation("nbrOfEntriesSelected_msg", { "{nbr}": selectedEntities.length });
    }
    else {
        return lang.getTranslation("noSelection_msg");
    }
}
//# sourceMappingURL=ContactListEntryViewer.js.map