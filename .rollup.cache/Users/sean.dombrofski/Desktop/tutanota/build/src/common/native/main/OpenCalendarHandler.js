import m from "mithril";
/**
 * Handles requests for opening calendar paths from native.
 */
export class OpenCalendarHandler {
    logins;
    constructor(logins) {
        this.logins = logins;
    }
    async openCalendar(userId) {
        if (this.logins.isUserLoggedIn() && this.logins.getUserController().user._id === userId) {
            m.route.set("/calendar/agenda");
        }
        else {
            m.route.set(`/login?noAutoLogin=false&userId=${userId}&requestedPath=${encodeURIComponent("/calendar/agenda")}`);
        }
    }
}
//# sourceMappingURL=OpenCalendarHandler.js.map