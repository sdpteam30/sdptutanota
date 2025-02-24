import { app, Menu, MenuItem, nativeImage } from "electron";
import { lang } from "../../misc/LanguageViewModel";
import { MacTray } from "./MacTray";
import { NonMacTray } from "./NonMacTray";
import { BuildConfigKey, DesktopConfigKey } from "../config/ConfigKeys";
import { log } from "../DesktopLog.js";
const platformTray = process.platform === "darwin" ? new MacTray() : new NonMacTray();
export class DesktopTray {
    _conf;
    _wm;
    _tray = null;
    _icon = null;
    constructor(config) {
        this._conf = config;
        this.getAppIcon();
        app.on("will-quit", this.destroy)
            .whenReady()
            .then(async () => {
            // Need this wrapper so that `create()` will be called
            await this.create();
        });
    }
    async create() {
        if (!this._wm)
            log.warn("Tray: No WM set before 'ready'!");
        const runAsTrayApp = await this._conf.getVar(DesktopConfigKey.runAsTrayApp);
        console.log("Create tray:" + runAsTrayApp);
        if (runAsTrayApp) {
            this._tray = platformTray.getTray(this._wm, await this.getAppIcon());
        }
    }
    destroy() {
        if (this._tray) {
            this._tray.destroy();
            console.log("Tray destroyed");
            this._tray = null;
        }
    }
    async update(notifier) {
        const runAsTrayApp = await this._conf.getVar(DesktopConfigKey.runAsTrayApp);
        if (!runAsTrayApp)
            return;
        const m = new Menu();
        m.append(new MenuItem({
            label: lang.get("openNewWindow_action"),
            click: () => {
                this._wm.newWindow(true);
            },
        }));
        if (platformTray.needsWindowListInMenu() && this._wm.getAll().length > 0) {
            m.append(new MenuItem({
                type: "separator",
            }));
            for (const w of this._wm.getAll()) {
                let label = w.getTitle();
                if (notifier.hasNotificationsForWindow(w)) {
                    label = "• " + label;
                }
                else {
                    label = label + "  ";
                }
                m.append(new MenuItem({
                    label: label,
                    click: () => w.show(),
                }));
            }
        }
        for (const mi of platformTray.getPlatformMenuItems()) {
            m.append(mi);
        }
        platformTray.attachMenuToTray(m, this._tray);
    }
    setBadge() {
        platformTray.setBadge();
    }
    clearBadge() {
        platformTray.clearBadge();
    }
    async getAppIcon() {
        if (!this._icon) {
            const iconName = await this._conf.getConst(BuildConfigKey.iconName);
            const iconPath = platformTray.getAppIconPathFromName(iconName);
            this._icon = nativeImage.createFromPath(iconPath);
        }
        return this._icon;
    }
    setWindowManager(wm) {
        this._wm = wm;
    }
}
//# sourceMappingURL=DesktopTray.js.map