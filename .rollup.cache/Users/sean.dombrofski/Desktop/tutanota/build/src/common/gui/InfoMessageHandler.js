import m from "mithril";
import { show as showNotificationOverlay } from "./base/NotificationOverlay";
import { lang } from "../misc/LanguageViewModel";
import { assertMainOrNode } from "../api/common/Env";
assertMainOrNode();
export class InfoMessageHandler {
    handleIndexStateUpdate;
    constructor(handleIndexStateUpdate) {
        this.handleIndexStateUpdate = handleIndexStateUpdate;
    }
    async onInfoMessage(message) {
        showNotificationOverlay({
            view: () => m("", lang.get(message.translationKey, message.args)),
        }, {
            label: "close_alt",
        }, []);
    }
    async onSearchIndexStateUpdate(state) {
        this.handleIndexStateUpdate(state);
    }
}
//# sourceMappingURL=InfoMessageHandler.js.map