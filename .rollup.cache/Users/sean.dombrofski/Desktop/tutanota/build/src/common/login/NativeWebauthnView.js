import m from "mithril";
import { DialogHeaderBar } from "../gui/base/DialogHeaderBar.js";
import { SecondFactorImage } from "../gui/base/icons/Icons.js";
import { progressIcon } from "../gui/base/Icon.js";
import { lang } from "../misc/LanguageViewModel.js";
/**
 * This is a special view which is not used by the web client
 * directly but is loaded remotely by desktop client in a dialog.
 * See DesktopWebauthnFacade.
 */
export class NativeWebauthnView {
    webauthn;
    nativeTransport;
    constructor(webauthn, nativeTransport) {
        this.webauthn = webauthn;
        this.nativeTransport = nativeTransport;
        this.view = this.view.bind(this);
        this.nativeTransport.init(this.webauthn);
    }
    updateUrl(args, requestedPath) { }
    view(vnode) {
        const headerBarAttrs = {
            left: [
                {
                    label: "cancel_action",
                    click: () => window.close(),
                    type: "secondary" /* ButtonType.Secondary */,
                },
            ],
            right: [],
            middle: "u2fSecurityKey_label",
        };
        return m(".mt.flex.col.flex-center.center", {
            style: {
                margin: "0 auto",
            },
        }, [
            m(".flex.col.justify-center", [
                m(DialogHeaderBar, headerBarAttrs),
                m(".flex-center.mt-s", m("img", { src: SecondFactorImage })),
                m(".mt.flex.col", [m(".flex.justify-center", [m(".mr-s", progressIcon()), m("", lang.get("waitingForU2f_msg"))])]),
            ]),
        ]);
    }
}
//# sourceMappingURL=NativeWebauthnView.js.map