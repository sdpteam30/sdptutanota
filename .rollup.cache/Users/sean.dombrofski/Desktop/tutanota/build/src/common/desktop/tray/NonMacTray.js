import { app, MenuItem, Tray } from "electron";
import { lang } from "../../misc/LanguageViewModel";
import { getResourcePath } from "../resources";
/**
 * This file provides the functionality used by DesktopTray on windows & linux.
 */
export class NonMacTray {
    attachMenuToTray(m, tray) {
        if (tray)
            tray.setContextMenu(m);
    }
    needsWindowListInMenu() {
        return true;
    }
    getPlatformMenuItems() {
        return [
            new MenuItem({
                type: "separator",
            }),
            new MenuItem({
                label: lang.get("quit_action"),
                accelerator: "CmdOrCtrl+Shift+Q",
                click: () => app.quit(),
            }),
        ];
    }
    getTray(wm, icon) {
        const tray = new Tray(icon);
        /*
        setting the context menu is necessary to prevent electron from segfaulting shortly after creating the tray.
        workaround from: https://github.com/electron/electron/issues/22137#issuecomment-586105622
        issue: https://github.com/electron/electron/issues/22215
     */
        tray.setContextMenu(null);
        tray.on("click", (ev) => {
            wm.getLastFocused(true);
        });
        return tray;
    }
    setBadge() { }
    clearBadge() { }
    getAppIconPathFromName(iconName) {
        return getResourcePath(`icons/${iconName}`);
    }
}
//# sourceMappingURL=NonMacTray.js.map