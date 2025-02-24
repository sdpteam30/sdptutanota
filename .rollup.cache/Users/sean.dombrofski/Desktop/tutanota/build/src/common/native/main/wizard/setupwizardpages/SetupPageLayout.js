import { emitWizardEvent } from "../../../../gui/base/WizardDialog.js";
import m from "mithril";
import { LoginButton } from "../../../../gui/base/buttons/LoginButton.js";
export class SetupPageLayout {
    view({ attrs, children }) {
        return m("section.center.flex.flex-column.dialog-height-small.mt", [
            m("img.onboarding-logo.center-h", {
                src: `${window.tutao.appState.prefixWithoutFile}/images/onboarding-wizard/${attrs.image}.svg`,
                alt: "",
                rel: "noreferrer",
                loading: "lazy",
                decoding: "async",
                class: attrs.class,
            }),
            children,
            m(LoginButton, {
                label: attrs.buttonLabel ?? "next_action",
                class: "wizard-next-button",
                onclick: (_, dom) => {
                    emitWizardEvent(dom, "showNextWizardDialogPage" /* WizardEventType.SHOW_NEXT_PAGE */);
                },
            }),
        ]);
    }
}
//# sourceMappingURL=SetupPageLayout.js.map