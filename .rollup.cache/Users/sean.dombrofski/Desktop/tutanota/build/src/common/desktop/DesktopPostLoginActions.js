export class DesktopPostLoginActions {
    wm;
    err;
    notifier;
    windowId;
    constructor(wm, err, notifier, windowId) {
        this.wm = wm;
        this.err = err;
        this.notifier = notifier;
        this.windowId = windowId;
    }
    async onPartialLoginSuccess({ userId }) {
        this.wm.get(this.windowId)?.setUserId(userId);
        await this.notifier.resolveGroupedNotification(userId);
    }
    async onFullLoginSuccess({ userId }) {
        this.wm.get(this.windowId)?.setUserId(userId);
        await this.err.sendErrorReport(this.windowId);
    }
}
//# sourceMappingURL=DesktopPostLoginActions.js.map