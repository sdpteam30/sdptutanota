import m from "mithril";
import { assertNotNull } from "@tutao/tutanota-utils";
import { Button } from "../../../gui/base/Button.js";
import { lang } from "../../LanguageViewModel.js";
import { NotificationContentSelector } from "../../../../mail-app/settings/NotificationContentSelector.js";
import { isApp } from "../../../api/common/Env.js";
export class RichNotificationsNews {
    newsModel;
    pushApp;
    notificationMode = null;
    constructor(newsModel, pushApp) {
        this.newsModel = newsModel;
        this.pushApp = pushApp;
    }
    async isShown(_newsId) {
        return (isApp() &&
            this.pushApp != null &&
            (this.notificationMode = await this.pushApp.getExtendedNotificationMode()) != "2" /* ExtendedNotificationMode.SenderAndSubject */);
    }
    render(newsId) {
        // if we got here then we must have it
        const pushApp = assertNotNull(this.pushApp);
        return m(".full-width", [
            m(".h4", { style: { "text-transform": "capitalize" } }, lang.get("richNotifications_title")),
            m("p", lang.get("richNotificationsNewsItem_msg")),
            m(".max-width-s", m(NotificationContentSelector, {
                extendedNotificationMode: this.notificationMode ?? "0" /* ExtendedNotificationMode.NoSenderOrSubject */,
                onChange: (mode) => {
                    this.notificationMode = mode;
                    pushApp.setExtendedNotificationMode(mode);
                },
            })),
            m(".flex-end", m(Button, {
                label: "close_alt",
                click: () => this.acknowledge(newsId),
                type: "secondary" /* ButtonType.Secondary */,
            })),
        ]);
    }
    async acknowledge(newsId) {
        await this.newsModel.acknowledgeNews(newsId.newsItemId);
        m.redraw();
    }
}
//# sourceMappingURL=RichNotificationsNews.js.map