import m from "mithril";
import { Button } from "../gui/base/Button.js";
import { LoginButton } from "../gui/base/buttons/LoginButton.js";
import { lang } from "../misc/LanguageViewModel.js";
export class CredentialsSelector {
    view(vnode) {
        const a = vnode.attrs;
        return a.credentials.map((c) => {
            const buttons = [];
            const onCredentialsDeleted = a.onCredentialsDeleted;
            buttons.push(m(LoginButton, {
                label: lang.makeTranslation("login_label", c.login),
                onclick: () => a.onCredentialsSelected(c),
            }));
            if (onCredentialsDeleted) {
                buttons.push(m(Button, {
                    label: "delete_action",
                    click: () => onCredentialsDeleted(c),
                    type: "secondary" /* ButtonType.Secondary */,
                }));
            }
            return m(".flex-space-between.pt.child-grow.last-child-fixed", buttons);
        });
    }
}
//# sourceMappingURL=CredentialsSelector.js.map