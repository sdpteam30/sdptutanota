import m from "mithril";
import { Dialog } from "../../gui/base/Dialog";
import { PasswordGenerator } from "./PasswordGenerator";
import { Button } from "../../gui/base/Button.js";
import { locator } from "../../api/main/CommonLocator";
import { px } from "../../gui/size";
import { copyToClipboard } from "../ClipboardUtils";
import { lang } from "../LanguageViewModel.js";
import { LoginButton } from "../../gui/base/buttons/LoginButton.js";
import { ExternalLink } from "../../gui/base/ExternalLink.js";
let dictionary = null;
/**
 * Show a dialog to generate a random passphrase
 * @returns a promise containing the generated password
 */
export async function showPasswordGeneratorDialog() {
    if (dictionary == null) {
        const appState = window.tutao.appState;
        const baseUrl = location.protocol + "//" + location.hostname + (location.port ? ":" + location.port : "") + appState.prefixWithoutFile;
        dictionary = await fetch(baseUrl + "/wordlibrary.json").then((response) => response.json());
    }
    let password = "";
    const pwGenerator = new PasswordGenerator(locator.random, dictionary);
    return new Promise((resolve) => {
        const insertPasswordOkAction = () => {
            resolve(password);
            dialog.close();
        };
        const updateAction = async () => {
            password = await pwGenerator.generateRandomPassphrase();
            m.redraw();
        };
        updateAction();
        const dialog = Dialog.showActionDialog({
            title: "passphrase_label",
            child: {
                view: () => m(PasswordGeneratorDialog, {
                    okAction: insertPasswordOkAction,
                    updateAction,
                    password,
                }),
            },
            okAction: null,
        });
    });
}
class PasswordGeneratorDialog {
    view(vnode) {
        const { updateAction, okAction, password } = vnode.attrs;
        return m("", [
            m(".editor-border.mt.flex.center-horizontally.center-vertically", {
                style: {
                    minHeight: px(65), // needs 65px for displaying two rows
                },
            }, m(".center.b.monospace", password)),
            m(".small.mt-xs", [
                lang.get("passphraseGeneratorHelp_msg"),
                " ",
                m(ExternalLink, {
                    href: "https://tuta.com/faq#passphrase-generator" /* InfoLink.PasswordGenerator */,
                    text: lang.get("faqEntry_label"),
                    isCompanySite: true,
                }),
            ]),
            m(".flex-end", [
                m(Button, {
                    label: "regeneratePassword_action",
                    click: () => updateAction(),
                    type: "secondary" /* ButtonType.Secondary */,
                }),
                m(Button, {
                    click: () => copyToClipboard(password),
                    label: "copy_action",
                    type: "secondary" /* ButtonType.Secondary */,
                }),
            ]),
            m(".flex", m(LoginButton, {
                label: "apply_action",
                onclick: () => okAction(),
            })),
        ]);
    }
}
//# sourceMappingURL=PasswordGeneratorDialog.js.map