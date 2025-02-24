export class DesktopIntegratorWin32 {
    _electron;
    _registry;
    _autoRunKey;
    constructor(electron, registry) {
        this._electron = electron;
        this._registry = registry;
        this._autoRunKey = new registry({
            hive: registry.HKCU,
            key: "\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
        });
    }
    isAutoLaunchEnabled() {
        // can't promisify here because it screws with autoRunKeys 'this' semantics
        return new Promise((resolve, reject) => {
            this._autoRunKey.get(this._electron.app.name, (err, item) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(typeof item !== "undefined" && item !== null);
                }
            });
        }).catch(() => false);
    }
    async enableAutoLaunch() {
        if (!(await this.isAutoLaunchEnabled())) {
            // can't promisify here because it screws with autoRunKeys 'this' semantics
            return new Promise((resolve, reject) => {
                this._autoRunKey.set(this._electron.app.name, this._registry.REG_SZ, `${process.execPath} -a`, (err) => {
                    if (err) {
                        reject(err);
                    }
                    resolve();
                });
            });
        }
    }
    async disableAutoLaunch() {
        // can't promisify here because it screws with autoRunKeys 'this' semantics
        if (await this.isAutoLaunchEnabled()) {
            return new Promise((resolve, reject) => {
                this._autoRunKey.remove(this._electron.app.name, (err) => {
                    if (err) {
                        reject(err);
                    }
                    resolve();
                });
            });
        }
    }
    runIntegration(wm) {
        return Promise.resolve();
    }
    isIntegrated() {
        return Promise.resolve(true);
    }
    integrate() {
        return Promise.resolve();
    }
    unintegrate() {
        return Promise.resolve();
    }
}
//# sourceMappingURL=DesktopIntegratorWin32.js.map