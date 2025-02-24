import { lang } from "../../misc/LanguageViewModel";
import { Dialog } from "../../gui/base/Dialog";
import { assertNotNull, contains, downcast, uint8ArrayToBase64, utf8Uint8ArrayToString } from "@tutao/tutanota-utils";
import { ALLOWED_IMAGE_FORMATS, MAX_LOGO_SIZE } from "../../../common/api/common/TutanotaConstants";
import m from "mithril";
import { TextField } from "../../gui/base/TextField.js";
import * as EditCustomColorsDialog from "./EditCustomColorsDialog";
import { CustomColorsEditorViewModel } from "./CustomColorsEditorViewModel";
import { locator } from "../../api/main/CommonLocator.js";
import { showFileChooser } from "../../file/FileController.js";
import { IconButton } from "../../gui/base/IconButton.js";
export class WhitelabelThemeSettings {
    view(vnode) {
        const { whitelabelData } = vnode.attrs;
        return [this.renderCustomColorsField(whitelabelData), this.renderCustomLogoField(whitelabelData)];
    }
    renderCustomColorsField(data) {
        return m(TextField, {
            label: "customColors_label",
            value: this.areCustomColorsDefined(data?.customTheme ?? null) ? lang.get("activated_label") : lang.get("deactivated_label"),
            isReadOnly: true,
            injectionsRight: () => (data ? this.renderCustomColorsFieldButtons(data) : null),
        });
    }
    renderCustomColorsFieldButtons(whitelabelData) {
        return [
            this.areCustomColorsDefined(whitelabelData.customTheme)
                ? m(IconButton, {
                    title: "deactivate_action",
                    click: () => this.deactivateCustomColors(whitelabelData),
                    icon: "Cancel" /* Icons.Cancel */,
                    size: 1 /* ButtonSize.Compact */,
                })
                : null,
            m(IconButton, {
                title: "edit_action",
                click: () => this.showCustomColorsDialog(whitelabelData),
                icon: "Edit" /* Icons.Edit */,
                size: 1 /* ButtonSize.Compact */,
            }),
        ];
    }
    async deactivateCustomColors({ customTheme, whitelabelConfig, whitelabelDomainInfo }) {
        const confirmed = await Dialog.confirm("confirmDeactivateCustomColors_msg");
        if (confirmed) {
            for (const key of Object.keys(customTheme)) {
                if (key !== "logo") {
                    delete downcast(customTheme)[key];
                }
            }
            this.saveCustomTheme(customTheme, whitelabelConfig, whitelabelDomainInfo);
            if (locator.logins.isWhitelabel()) {
                await locator.themeController.applyCustomizations(customTheme);
            }
        }
    }
    renderCustomLogoField(data) {
        const customLogoTextfieldAttrs = {
            label: "customLogo_label",
            helpLabel: () => lang.get("customLogoInfo_msg"),
            value: lang.get(data?.customTheme.logo != null ? "activated_label" : "deactivated_label"),
            isReadOnly: true,
            injectionsRight: () => (data ? this.renderCustomLogoFieldButtons(data) : null),
        };
        return m(TextField, customLogoTextfieldAttrs);
    }
    renderCustomLogoFieldButtons(whitelabelData) {
        return [
            whitelabelData.customTheme.logo
                ? m(IconButton, {
                    title: "deactivate_action",
                    click: async () => {
                        await this.deactivateCustomLogo(whitelabelData);
                    },
                    icon: "Cancel" /* Icons.Cancel */,
                    size: 1 /* ButtonSize.Compact */,
                })
                : null,
            m(IconButton, {
                title: "edit_action",
                click: () => this.editCustomLogo(whitelabelData),
                icon: "Edit" /* Icons.Edit */,
                size: 1 /* ButtonSize.Compact */,
            }),
        ];
    }
    async editCustomLogo({ customTheme, whitelabelConfig, whitelabelDomainInfo }) {
        const files = await showFileChooser(false);
        let extension = files[0].name.toLowerCase().substring(files[0].name.lastIndexOf(".") + 1);
        if (files[0].size > MAX_LOGO_SIZE || !contains(ALLOWED_IMAGE_FORMATS, extension)) {
            Dialog.message("customLogoInfo_msg");
        }
        else {
            let imageData;
            if (extension === "svg") {
                imageData = utf8Uint8ArrayToString(files[0].data);
            }
            else {
                const ext = extension === "jpeg" ? "jpg" : extension;
                const b64 = uint8ArrayToBase64(files[0].data);
                imageData = `<img src="data:image/${ext};base64,${b64}">`;
            }
            customTheme.logo = imageData;
            this.saveCustomTheme(customTheme, whitelabelConfig, whitelabelDomainInfo);
            if (locator.logins.isWhitelabel()) {
                await locator.themeController.applyCustomizations(customTheme);
            }
        }
    }
    async deactivateCustomLogo({ customTheme, whitelabelConfig, whitelabelDomainInfo }) {
        const confirmed = await Dialog.confirm("confirmDeactivateCustomLogo_msg");
        if (confirmed) {
            delete customTheme.logo;
            this.saveCustomTheme(customTheme, whitelabelConfig, whitelabelDomainInfo);
            if (locator.logins.isWhitelabel()) {
                await locator.themeController.applyCustomizations(customTheme);
            }
        }
    }
    async showCustomColorsDialog({ customTheme, whitelabelConfig, whitelabelDomainInfo }) {
        const currentTheme = locator.themeController.getCurrentTheme();
        const viewModel = new CustomColorsEditorViewModel(currentTheme, customTheme, whitelabelConfig, assertNotNull(whitelabelDomainInfo), locator.themeController, locator.entityClient, locator.logins);
        EditCustomColorsDialog.show(viewModel);
    }
    areCustomColorsDefined(theme) {
        if (theme) {
            return Object.keys(theme).some((key) => key !== "logo" &&
                // @ts-ignore
                theme?.[key]);
        }
        else {
            return false;
        }
    }
    saveCustomTheme(customTheme, whitelabelConfig, whitelabelDomainInfo) {
        whitelabelConfig.jsonTheme = JSON.stringify(customTheme);
        locator.entityClient.update(whitelabelConfig);
        customTheme.themeId = whitelabelDomainInfo.domain;
    }
}
//# sourceMappingURL=WhitelabelThemeSettings.js.map