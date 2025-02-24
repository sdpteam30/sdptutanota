import m from "mithril";
import { px, size } from "../../gui/size";
import { Button } from "../../gui/base/Button.js";
import { createMail, createMailAddress } from "../../api/entities/tutanota/TypeRefs.js";
import { MailRow } from "../../../mail-app/mail/view/MailRow";
import { noOp } from "@tutao/tutanota-utils";
import { IconButton } from "../../gui/base/IconButton.js";
import { ToggleButton } from "../../gui/base/buttons/ToggleButton.js";
import { isApp, isDesktop } from "../../api/common/Env.js";
import { LoginButton } from "../../gui/base/buttons/LoginButton.js";
import { lang } from "../../misc/LanguageViewModel.js";
export const BUTTON_WIDTH = 270;
export class CustomColorEditorPreview {
    _mailRow;
    _mailRow2;
    toggleSelected = false;
    constructor() {
        this._mailRow = new MailRow(false, () => [], noOp);
        this._mailRow2 = new MailRow(false, () => [], noOp);
    }
    view() {
        return m(".editor-border.mt-l.flex.col", {
            style: {
                alignItems: "center",
            },
        }, [
            m(".pt", {
                style: {
                    width: px(BUTTON_WIDTH),
                },
            }, m(LoginButton, {
                label: isApp() || isDesktop() ? "addAccount_action" : "login_action",
                onclick: noOp,
            })),
            m(".pt", [
                m(Button, {
                    label: lang.makeTranslation("secondary", "Secondary"),
                    click: noOp,
                    type: "secondary" /* ButtonType.Secondary */,
                }),
                m(Button, {
                    label: lang.makeTranslation("primary", "Primary"),
                    click: noOp,
                    type: "primary" /* ButtonType.Primary */,
                }),
            ]),
            m(".pt", [
                m(IconButton, {
                    title: lang.makeTranslation("icon_button", "Icon button"),
                    icon: "Folder" /* Icons.Folder */,
                    click: noOp,
                }),
                m(ToggleButton, {
                    title: lang.makeTranslation("toggle_button", "Toggle button"),
                    icon: this.toggleSelected ? "Lock" /* Icons.Lock */ : "Unlock" /* Icons.Unlock */,
                    toggled: this.toggleSelected,
                    onToggled: () => (this.toggleSelected = !this.toggleSelected),
                }),
            ]),
            m(".pt", this.renderPreviewMailRow()),
        ]);
    }
    renderPreviewMailRow() {
        const mailTemplate = {
            receivedDate: new Date(),
            attachments: [],
            state: "2",
            mailDetails: null,
            authStatus: null,
            encryptionAuthStatus: null,
            method: "0",
            bucketKey: null,
            conversationEntry: ["listId", "conversationId"],
            differentEnvelopeSender: null,
            firstRecipient: null,
            listUnsubscribe: false,
            mailDetailsDraft: null,
            movedTime: null,
            phishingStatus: "0",
            recipientCount: "0",
            sets: [],
        };
        const mail = createMail({
            sender: createMailAddress({
                address: "m.mustermann@example.com",
                name: "Max Mustermann",
                contact: null,
            }),
            subject: "Mail 1",
            unread: false,
            replyType: "0",
            confidential: true,
            ...mailTemplate,
        });
        const mail2 = createMail({
            sender: createMailAddress({
                address: "m.mustermann@example.com",
                name: "Max Mustermann",
                contact: null,
            }),
            subject: "Mail 2",
            unread: true,
            replyType: "1",
            confidential: false,
            ...mailTemplate,
        });
        return m(".rel", {
            style: {
                width: px(size.second_col_max_width),
                height: px(size.list_row_height * 2),
            },
        }, [
            m(".list-row.pl.pr-l.odd-row", {
                oncreate: (vnode) => {
                    this._mailRow.domElement = vnode.dom;
                    requestAnimationFrame(() => this._mailRow.update(mail, false, false));
                },
            }, this._mailRow.render()),
            m(".list-row.pl.pr-l", {
                oncreate: (vnode) => {
                    this._mailRow2.domElement = vnode.dom;
                    requestAnimationFrame(() => this._mailRow2.update(mail2, true, false));
                },
                style: {
                    top: px(size.list_row_height),
                },
            }, this._mailRow2.render()),
        ]);
    }
}
//# sourceMappingURL=CustomColorEditorPreview.js.map