import { Notification } from "electron";
export class ElectronNotificationFactory {
    isSupported() {
        return Notification.isSupported();
    }
    /**
     *
     * @param props
     * @param onClick this will get called with the result
     * @returns call this to dismiss the notification
     */
    makeNotification(props, onClick) {
        const { title, body, icon } = Object.assign({}, {
            body: "",
        }, props);
        const notification = new Notification({
            title,
            icon,
            body,
        })
            .on("click", () => onClick("click" /* NotificationResult.Click */))
            .on("close", () => onClick("close" /* NotificationResult.Close */));
        notification.show();
        // remove listeners before closing to distinguish from dismissal by user
        return () => notification.removeAllListeners().close();
    }
}
//# sourceMappingURL=NotificatonFactory.js.map