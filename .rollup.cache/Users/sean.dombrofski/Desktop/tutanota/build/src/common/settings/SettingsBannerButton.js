import m from "mithril";
import { BannerButton } from "../gui/base/buttons/BannerButton.js";
import { theme } from "../gui/theme.js";
/// Renders a banner button used in the onboarding wizard and notification permission dialog
export function renderSettingsBannerButton(text, onclick, isDisabled, classes) {
    return m(BannerButton, {
        text,
        borderColor: theme.content_accent,
        color: theme.content_accent,
        class: "b full-width button-content " + classes,
        click: (event, dom) => {
            onclick(event, dom);
        },
        disabled: isDisabled ?? undefined,
    });
}
//# sourceMappingURL=SettingsBannerButton.js.map