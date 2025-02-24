export class DesktopSearchTextInAppFacade {
    window;
    constructor(window) {
        this.window = window;
    }
    findInPage(searchTerm, forward, matchCase, findNext) {
        return this.window.findInPage(searchTerm, forward, matchCase, findNext);
    }
    async setSearchOverlayState(isFocused, force) {
        return this.window.setSearchOverlayState(isFocused, force);
    }
    async stopFindInPage() {
        return this.window.stopFindInPage();
    }
}
//# sourceMappingURL=DesktopSearchTextInAppFacade.js.map