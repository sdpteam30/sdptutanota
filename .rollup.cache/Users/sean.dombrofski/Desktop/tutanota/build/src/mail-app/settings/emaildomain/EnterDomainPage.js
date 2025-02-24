import m from "mithril";
import { TextField } from "../../../common/gui/base/TextField.js";
import { isDomainName } from "../../../common/misc/FormatValidator";
import { Dialog } from "../../../common/gui/base/Dialog";
import { lang } from "../../../common/misc/LanguageViewModel";
import { emitWizardEvent } from "../../../common/gui/base/WizardDialog.js";
import { assertMainOrNode } from "../../../common/api/common/Env";
import { LoginButton } from "../../../common/gui/base/buttons/LoginButton.js";
assertMainOrNode();
export class EnterDomainPage {
    dom = null;
    oncreate(vnode) {
        this.dom = vnode.dom;
    }
    view(vnode) {
        return m("", [
            m("h4.mt-l.text-center", lang.get("enterCustomDomain_title")),
            m(".mt", lang.get("enterDomainIntroduction_msg")),
            m(".mt", lang.get("enterDomainGetReady_msg")),
            m(TextField, {
                label: "customDomain_label",
                autocapitalize: "none" /* Autocapitalize.none */,
                value: vnode.attrs.data.domain(),
                oninput: vnode.attrs.data.domain,
                helpLabel: () => {
                    const domain = vnode.attrs.data.domain();
                    const errorMsg = validateDomain(domain);
                    if (errorMsg) {
                        return lang.get(errorMsg);
                    }
                    else {
                        return lang.get("enterDomainFieldHelp_label", {
                            "{domain}": domain.toLocaleLowerCase().trim(),
                        });
                    }
                },
            }),
            m(".flex-center.full-width.pt-l.mb-l", m(LoginButton, {
                label: "next_action",
                class: "small-login-button",
                onclick: () => emitWizardEvent(this.dom, "showNextWizardDialogPage" /* WizardEventType.SHOW_NEXT_PAGE */),
            })),
        ]);
    }
}
function validateDomain(domain) {
    let cleanDomainName = domain.toLocaleLowerCase().trim();
    if (!cleanDomainName.length) {
        return "customDomainNeutral_msg";
    }
    if (!isDomainName(cleanDomainName)) {
        return "customDomainInvalid_msg";
    }
    else {
        return null;
    }
}
export class EnterDomainPageAttrs {
    data;
    constructor(domainData) {
        this.data = domainData;
    }
    headerTitle() {
        return "domainSetup_title";
    }
    nextAction(showErrorDialog = true) {
        const errorMsg = validateDomain(this.data.domain());
        if (errorMsg) {
            return showErrorDialog ? Dialog.message(errorMsg).then(() => false) : Promise.resolve(false);
        }
        else {
            return Promise.resolve(true);
        }
    }
    isSkipAvailable() {
        return false;
    }
    isEnabled() {
        return true;
    }
}
//# sourceMappingURL=EnterDomainPage.js.map