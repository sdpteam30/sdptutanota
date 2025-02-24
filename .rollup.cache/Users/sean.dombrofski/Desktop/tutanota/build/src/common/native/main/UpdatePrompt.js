import m from "mithril";
import { lang } from "../../misc/LanguageViewModel";
import { assertMainOrNode } from "../../api/common/Env";
import { show } from "../../gui/base/NotificationOverlay";
assertMainOrNode();
export async function registerForUpdates(desktopSettingsFacade) {
    const updateInfo = await desktopSettingsFacade.getUpdateInfo();
    if (updateInfo) {
        let message = {
            view: () => m("", lang.get("updateAvailable_label", {
                "{version}": updateInfo.version,
            })),
        };
        show(message, {
            label: "postpone_action",
        }, [
            {
                label: "installNow_action",
                click: () => desktopSettingsFacade.manualUpdate(),
                type: "primary" /* ButtonType.Primary */,
            },
        ]);
    }
}
//# sourceMappingURL=UpdatePrompt.js.map