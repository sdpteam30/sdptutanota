/**
 * this receives inter window events and dispatches them to all other windows
 */
export class DesktopInterWindowEventFacade {
    window;
    wm;
    constructor(window, wm) {
        this.window = window;
        this.wm = wm;
    }
    async localUserDataInvalidated(userId) {
        await this.executeOnOthers((other) => other.interWindowEventSender.localUserDataInvalidated(userId));
    }
    async reloadDeviceConfig() {
        await this.executeOnOthers((other) => other.interWindowEventSender.reloadDeviceConfig());
    }
    async executeOnOthers(f) {
        const others = this.wm.getAll().filter((w) => w.id != this.window.id);
        for (const other of others) {
            await f(other);
        }
        return;
    }
}
//# sourceMappingURL=DesktopInterWindowEventFacade.js.map