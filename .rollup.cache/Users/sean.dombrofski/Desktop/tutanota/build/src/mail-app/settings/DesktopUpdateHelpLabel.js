import m from "mithril";
import { Icon } from "../../common/gui/base/Icon";
import { lang } from "../../common/misc/LanguageViewModel";
import { delay } from "@tutao/tutanota-utils";
export class DesktopUpdateHelpLabel {
    _waiting = false;
    _error = false;
    getActionLink({ updateAvailable, manualUpdate }) {
        if (this._waiting || this._error)
            return null;
        const onclick = async () => {
            if (updateAvailable()) {
                // install now (restarts the app)
                manualUpdate();
            }
            else if (!this._waiting) {
                // no update available & not currently waiting for check result -> check for update again
                this._waiting = true;
                const [hasUpdate] = await Promise.all([
                    manualUpdate(), // make sure there's at least some delay
                    // instant response tends to make users nervous
                    delay(500),
                ]);
                this._waiting = false;
                updateAvailable(hasUpdate);
                m.redraw();
            }
        };
        return m("span.text-break.pr-s", m("button.underline", {
            type: "button",
            href: "#",
            tabindex: "0",
            role: "button",
            onclick,
        }, lang.get(updateAvailable() ? "installNow_action" : "checkAgain_action")));
    }
    getLabel(updateAvailable) {
        let ret = "";
        if (updateAvailable()) {
            ret = lang.get("updateFound_label");
        }
        else if (this._error) {
            ret = lang.get("serviceUnavailable_msg");
        }
        else if (this._waiting) {
            ret = lang.get("checkingForUpdate_action");
        }
        else {
            ret = lang.get("noUpdateAvailable_msg");
        }
        return m("span.pr-s", ret + " ");
    }
    getIcon() {
        return this._waiting && !this._error
            ? m(Icon, {
                icon: "Progress" /* BootIcons.Progress */,
                class: "flex-center items-center icon-progress-tiny icon-progress",
            })
            : null;
    }
    view(vnode) {
        return m(".flex.items-center", [this.getLabel(vnode.attrs.updateAvailable), this.getActionLink(vnode.attrs), this.getIcon()]);
    }
}
//# sourceMappingURL=DesktopUpdateHelpLabel.js.map