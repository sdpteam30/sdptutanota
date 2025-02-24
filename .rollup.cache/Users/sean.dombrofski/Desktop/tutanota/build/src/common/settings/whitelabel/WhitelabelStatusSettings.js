import { showPlanUpgradeRequiredDialog } from "../../misc/SubscriptionDialogs";
import { lang } from "../../misc/LanguageViewModel";
import m from "mithril";
import { TextField } from "../../gui/base/TextField.js";
import { IconButton } from "../../gui/base/IconButton.js";
import { getAvailablePlansWithWhitelabel } from "../../subscription/SubscriptionUtils.js";
export class WhitelabelStatusSettings {
    view({ attrs }) {
        const { isWhitelabelActive } = attrs;
        return m(TextField, {
            label: "state_label",
            value: isWhitelabelActive ? lang.get("active_label") : lang.get("deactivated_label"),
            isReadOnly: true,
            injectionsRight: () => (isWhitelabelActive ? null : this.renderEnable()),
        });
    }
    renderEnable() {
        return m(IconButton, {
            title: "whitelabelDomain_label",
            click: async () => {
                const plansWithWhitelabel = await getAvailablePlansWithWhitelabel();
                showPlanUpgradeRequiredDialog(plansWithWhitelabel);
            },
            icon: "Edit" /* Icons.Edit */,
            size: 1 /* ButtonSize.Compact */,
        });
    }
}
//# sourceMappingURL=WhitelabelStatusSettings.js.map