import m from "mithril";
import { IconButton } from "../gui/base/IconButton.js";
import { TextField } from "../gui/base/TextField.js";
import { formatPrice } from "../subscription/PriceUtils.js";
import { Button } from "../gui/base/Button.js";
import { ListColumnWrapper } from "../gui/ListColumnWrapper.js";
import { lang } from "../misc/LanguageViewModel.js";
import { locator } from "../api/main/CommonLocator";
import { copyToClipboard } from "../misc/ClipboardUtils.js";
import { mailLocator } from "../../mail-app/mailLocator.js";
import { showSnackBar } from "../gui/base/SnackBar.js";
import { LazyLoaded } from "@tutao/tutanota-utils";
/**
 * Section in user settings to display the referral link and let users share it.
 */
export class AffiliateSettingsViewer {
    getIsShowingKpis;
    toggleKpiColumn;
    affiliateViewModel = new LazyLoaded(async () => await mailLocator.affiliateViewModel());
    domainConfig = locator.domainConfigProvider().getCurrentDomainConfig();
    constructor(getIsShowingKpis, toggleKpiColumn) {
        this.getIsShowingKpis = getIsShowingKpis;
        this.toggleKpiColumn = toggleKpiColumn;
    }
    oninit() {
        this.affiliateViewModel.getAsync().then((avm) => avm.load().finally(m.redraw));
    }
    view() {
        if (this.affiliateViewModel.isLoaded()) {
            const avm = this.affiliateViewModel.getSync();
            if (avm.isLoading) {
                return m(ListColumnWrapper, m("p", "Loading..."));
            }
            if (avm.data === null) {
                return m(ListColumnWrapper, m("p", "Error"));
            }
            const shareUrl = `${this.domainConfig.websiteBaseUrl}?t-src=${avm.data.promotionId}`;
            return m(ListColumnWrapper, m("section.fill-absolute.scroll.plr-l", m("h4.mt-l", lang.get("affiliateSettings_label")), m(TextField, {
                isReadOnly: true,
                label: "referralLink_label",
                value: shareUrl,
                injectionsRight: () => m(IconButton, {
                    title: "copy_action",
                    click: () => this.onCopyButtonClick(shareUrl),
                    icon: "Copy" /* Icons.Copy */,
                    size: 1 /* ButtonSize.Compact */,
                }),
            }), m(TextField, {
                isReadOnly: true,
                label: "affiliateSettingsAccumulated_label",
                helpLabel: () => lang.get("affiliateSettingsAccumulated_msg"),
                value: formatPrice(Number(avm.data.accumulatedCommission), true),
            }), m(TextField, {
                isReadOnly: true,
                label: "affiliateSettingsCredited_label",
                helpLabel: () => lang.get("affiliateSettingsCredited_msg"),
                value: formatPrice(Number(avm.data.creditedCommission), true),
            }), m(".flex.center-horizontally.mt-m", m(Button, {
                label: this.getIsShowingKpis() ? "affiliateSettingsHideKpis_label" : "affiliateSettingsShowKpis_label",
                type: "secondary" /* ButtonType.Secondary */,
                click: () => this.toggleKpiColumn(),
            }))));
        }
        else {
            return m("");
        }
    }
    onCopyButtonClick(shareUrl) {
        copyToClipboard(shareUrl).then(() => {
            showSnackBar({
                message: "linkCopied_msg",
                button: {
                    label: "close_alt",
                    click: () => { },
                },
            });
        });
    }
    async entityEventsReceived(updates) {
        // can be a noop because the referral code will never change once it was created
        // we trigger creation in the constructor if there is no code yet
    }
}
//# sourceMappingURL=AffiliateSettingsViewer.js.map