import m from "mithril";
import { lang } from "../../common/misc/LanguageViewModel";
import { LoginButton } from "../../common/gui/base/buttons/LoginButton";
import { mailLocator } from "../mailLocator.js";
import { isWebClient } from "../../common/api/common/Env.js";
/**
 * Settings viewer for mail import rendered only in the WebApp, Android and iOS.
 * See {@link DesktopMailImportSettingsViewer} for the Desktop client.
 */
export class WebMailImportSettingsViewer {
    constructor() { }
    view() {
        return m(".fill-absolute.scroll.plr-l.pb-xl", [m(".h4.mt-l", lang.get("mailImportSettings_label")), this.renderNoImportOnWebText()]);
    }
    renderNoImportOnWebText() {
        return [
            m(".flex-column.mt", m(".p", lang.get("mailImportNoImportOnWeb_label")), m(".flex-start.mt-l", m(LoginButton, {
                type: "FlexWidth" /* LoginButtonType.FlexWidth */,
                label: "mailImportDownloadDesktopClient_label",
                onclick: () => {
                    const desktopClientDownloadUri = "https://tuta.com#download";
                    if (isWebClient()) {
                        open(desktopClientDownloadUri);
                    }
                    else {
                        mailLocator.systemFacade.openLink(desktopClientDownloadUri);
                    }
                },
            })), m(".flex-v-center.full-width.mt-xl", m("img", {
                src: `${window.tutao.appState.prefixWithoutFile}/images/mail-import/email-import-webapp.svg`,
                alt: "",
                rel: "noreferrer",
                loading: "lazy",
                decoding: "async",
                class: "settings-illustration-large",
            }))),
        ];
    }
    async entityEventsReceived(updates) { }
}
//# sourceMappingURL=WebMailImportSettingsViewer.js.map