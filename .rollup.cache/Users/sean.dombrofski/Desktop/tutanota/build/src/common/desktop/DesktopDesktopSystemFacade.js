export class DesktopDesktopSystemFacade {
    wm;
    window;
    sock;
    constructor(wm, window, sock) {
        this.wm = wm;
        this.window = window;
        this.sock = sock;
    }
    async focusApplicationWindow() {
        this.window.focus();
    }
    async openNewWindow() {
        await this.wm.newWindow(true);
    }
    async sendSocketMessage(message) {
        this.sock.sendSocketMessage(message);
    }
}
//# sourceMappingURL=DesktopDesktopSystemFacade.js.map