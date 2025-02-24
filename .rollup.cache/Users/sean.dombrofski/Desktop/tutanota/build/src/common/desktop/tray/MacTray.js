import { app } from "electron";
import os from "node:os";
import { getResourcePath } from "../resources";
export class MacTray {
    needsWindowListInMenu() {
        //MacOs Catalina started showing the window list on its own
        return Number(os.release().slice(0, 2)) < 19;
    }
    attachMenuToTray(m, tray) {
        app.dock.setMenu(m);
    }
    getPlatformMenuItems() {
        return [];
    }
    getTray(wm, icon) {
        if (!app.dock.isVisible()) {
            app.dock.show();
        }
        return null;
    }
    setBadge() {
        app.dock.bounce();
        app.dock.setBadge("●");
    }
    clearBadge() {
        app.dock.setBadge("");
    }
    getAppIconPathFromName(iconName) {
        return getResourcePath(`icons/${iconName}.icns`);
    }
}
//# sourceMappingURL=MacTray.js.map