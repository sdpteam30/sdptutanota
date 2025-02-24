import m from "mithril";
import { showSupportDialog, showUpgradeDialog } from "./NavFunctions";
import { isIOSApp } from "../../api/common/Env";
import { LogoutUrl, SETTINGS_PREFIX } from "../../misc/RouteChange";
import { getSafeAreaInsetLeft } from "../HtmlUtils";
import { landmarkAttrs } from "../AriaUtils";
import { createDropdown } from "../base/Dropdown.js";
import { keyManager } from "../../misc/KeyManager";
import { CounterBadge } from "../base/CounterBadge.js";
import { px, size } from "../size.js";
import { theme } from "../theme.js";
import { showNewsDialog } from "../../misc/news/NewsDialog.js";
import { styles } from "../styles.js";
import { IconButton } from "../base/IconButton.js";
export class DrawerMenu {
    view(vnode) {
        const { logins, newsModel, desktopSystemFacade } = vnode.attrs;
        const liveNewsCount = newsModel.liveNewsIds.length;
        const isInternalUser = logins.isInternalUserLoggedIn();
        const isLoggedIn = logins.isUserLoggedIn();
        const userController = logins.getUserController();
        return m("drawer-menu.flex.col.items-center.pt.pb", {
            ...landmarkAttrs("contentinfo" /* AriaLandmarks.Contentinfo */, "drawer menu"),
            style: {
                "padding-left": getSafeAreaInsetLeft(),
                "border-top-right-radius": styles.isDesktopLayout() ? px(size.border_radius_larger) : "",
            },
        }, [
            m(".flex-grow"),
            isInternalUser && isLoggedIn
                ? m(".news-button", [
                    m(IconButton, {
                        icon: "Bulb" /* Icons.Bulb */,
                        title: "news_label",
                        click: () => showNewsDialog(newsModel),
                        colors: "drawernav" /* ButtonColor.DrawerNav */,
                    }),
                    liveNewsCount > 0
                        ? m(CounterBadge, {
                            count: liveNewsCount,
                            position: {
                                top: px(0),
                                right: px(3),
                            },
                            color: "white",
                            background: theme.list_accent_fg,
                        })
                        : null,
                ])
                : null,
            logins.isGlobalAdminUserLoggedIn() && userController.isPaidAccount()
                ? m(IconButton, {
                    icon: "Gift" /* Icons.Gift */,
                    title: "buyGiftCard_label",
                    click: () => {
                        m.route.set("/settings/subscription");
                        import("../../subscription/giftcards/PurchaseGiftCardDialog").then(({ showPurchaseGiftCardDialog }) => {
                            return showPurchaseGiftCardDialog();
                        });
                    },
                    colors: "drawernav" /* ButtonColor.DrawerNav */,
                })
                : null,
            desktopSystemFacade
                ? m(IconButton, {
                    icon: "NewWindow" /* Icons.NewWindow */,
                    title: "openNewWindow_action",
                    click: () => {
                        desktopSystemFacade.openNewWindow();
                    },
                    colors: "drawernav" /* ButtonColor.DrawerNav */,
                })
                : null,
            !isIOSApp() && isLoggedIn && userController.isFreeAccount()
                ? m(IconButton, {
                    icon: "Premium" /* BootIcons.Premium */,
                    title: "upgradePremium_label",
                    click: () => showUpgradeDialog(),
                    colors: "drawernav" /* ButtonColor.DrawerNav */,
                })
                : null,
            m(IconButton, {
                title: "showHelp_action",
                icon: "Help" /* BootIcons.Help */,
                click: (e, dom) => createDropdown({
                    width: 300,
                    lazyButtons: () => [
                        {
                            icon: "SpeechBubbleFill" /* Icons.SpeechBubbleFill */,
                            label: "supportMenu_label",
                            click: () => showSupportDialog(logins),
                        },
                        {
                            icon: "KeyboardFill" /* Icons.KeyboardFill */,
                            label: "keyboardShortcuts_title",
                            click: () => keyManager.openF1Help(true),
                        },
                    ],
                })(e, dom),
                colors: "drawernav" /* ButtonColor.DrawerNav */,
            }),
            isInternalUser
                ? m(IconButton, {
                    icon: "Settings" /* BootIcons.Settings */,
                    title: "settings_label",
                    click: () => m.route.set(SETTINGS_PREFIX),
                    colors: "drawernav" /* ButtonColor.DrawerNav */,
                })
                : null,
            m(IconButton, {
                icon: "Logout" /* BootIcons.Logout */,
                title: "switchAccount_action",
                click: () => m.route.set(LogoutUrl),
                colors: "drawernav" /* ButtonColor.DrawerNav */,
            }),
        ]);
    }
}
//# sourceMappingURL=DrawerMenu.js.map