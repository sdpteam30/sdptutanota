import m from "mithril";
import { lang } from "../../common/misc/LanguageViewModel";
import stream from "mithril/stream";
import { showProgressDialog } from "../../common/gui/dialogs/ProgressDialog";
import { TextField } from "../../common/gui/base/TextField.js";
import { attachDropdown } from "../../common/gui/base/Dropdown.js";
import { DropDownSelector } from "../../common/gui/base/DropDownSelector.js";
import { Dialog } from "../../common/gui/base/Dialog";
import { DesktopUpdateHelpLabel } from "./DesktopUpdateHelpLabel";
import { DesktopConfigKey } from "../../common/desktop/config/ConfigKeys";
import { getCurrentSpellcheckLanguageLabel, showSpellcheckLanguageDialog } from "../../common/gui/dialogs/SpellcheckLanguageDialog";
import { ifAllowedTutaLinks } from "../../common/gui/base/GuiUtils";
import { assertMainOrNode } from "../../common/api/common/Env";
import { locator } from "../../common/api/main/CommonLocator";
import { IconButton } from "../../common/gui/base/IconButton.js";
import { MoreInfoLink } from "../../common/misc/news/MoreInfoLink.js";
assertMainOrNode();
var DownloadLocationStrategy;
(function (DownloadLocationStrategy) {
    DownloadLocationStrategy[DownloadLocationStrategy["ALWAYS_ASK"] = 0] = "ALWAYS_ASK";
    DownloadLocationStrategy[DownloadLocationStrategy["CHOOSE_DIRECTORY"] = 1] = "CHOOSE_DIRECTORY";
})(DownloadLocationStrategy || (DownloadLocationStrategy = {}));
export class DesktopSettingsViewer {
    isDefaultMailtoHandler;
    defaultDownloadPath;
    runAsTrayApp;
    runOnStartup;
    spellCheckLang;
    isIntegrated;
    isAutoUpdateEnabled;
    showAutoUpdateOption;
    updateAvailable;
    mailExportMode;
    isPathDialogOpen = false;
    offlineStorageValue;
    constructor() {
        this.isDefaultMailtoHandler = stream(false);
        this.runAsTrayApp = stream(true);
        this.runOnStartup = stream(false);
        this.spellCheckLang = stream("");
        this.isIntegrated = stream(false);
        this.isAutoUpdateEnabled = stream(false);
        this.showAutoUpdateOption = true;
        this.updateAvailable = stream(false);
        this.mailExportMode = stream("msg"); // msg is just a dummy value here, it will be overwritten in requestDesktopConfig
        this.offlineStorageValue = stream(false);
    }
    oninit() {
        this.requestDesktopConfig();
    }
    view() {
        const setDefaultMailtoHandlerAttrs = {
            label: "defaultMailHandler_label",
            helpLabel: () => lang.get("defaultMailHandler_msg"),
            items: [
                {
                    name: lang.get("unregistered_label"),
                    value: false,
                },
                {
                    name: lang.get("registered_label"),
                    value: true,
                },
            ],
            selectedValue: this.isDefaultMailtoHandler(),
            selectionChangedHandler: (v) => {
                showProgressDialog("pleaseWait_msg", this.updateDefaultMailtoHandler(v)).then(() => {
                    this.isDefaultMailtoHandler(v);
                    m.redraw();
                });
            },
        };
        const setRunInBackgroundAttrs = {
            label: "runInBackground_action",
            helpLabel: () => {
                return ifAllowedTutaLinks(locator.logins, "https://tuta.com/faq#tray-desktop" /* InfoLink.RunInBackground */, (link) => [
                    m("span", lang.get("runInBackground_msg") + " "),
                    m(MoreInfoLink, { link: link }),
                ]);
            },
            items: [
                {
                    name: lang.get("yes_label"),
                    value: true,
                },
                {
                    name: lang.get("no_label"),
                    value: false,
                },
            ],
            selectedValue: this.runAsTrayApp(),
            selectionChangedHandler: (v) => {
                this.runAsTrayApp(v);
                this.setBooleanValue(DesktopConfigKey.runAsTrayApp, v);
            },
        };
        const setRunOnStartupAttrs = {
            label: "runOnStartup_action",
            items: [
                {
                    name: lang.get("yes_label"),
                    value: true,
                },
                {
                    name: lang.get("no_label"),
                    value: false,
                },
            ],
            selectedValue: this.runOnStartup(),
            selectionChangedHandler: (v) => {
                // this may take a while
                showProgressDialog("pleaseWait_msg", this.toggleAutoLaunchInNative(v)).then(() => {
                    this.runOnStartup(v);
                    m.redraw();
                });
            },
        };
        const editSpellcheckLanguageButtonAttrs = {
            title: "checkSpelling_action",
            click: () => showSpellcheckLanguageDialog().then((newLabel) => this.spellCheckLang(newLabel)),
            icon: "Edit" /* Icons.Edit */,
            size: 1 /* ButtonSize.Compact */,
        };
        const spellcheckLanguageAttrs = {
            label: "checkSpelling_action",
            value: this.spellCheckLang(),
            oninput: this.spellCheckLang,
            isReadOnly: true,
            injectionsRight: () => m(IconButton, editSpellcheckLanguageButtonAttrs),
            helpLabel: () => lang.get("requiresNewWindow_msg"),
        };
        const setDesktopIntegrationAttrs = {
            label: "desktopIntegration_label",
            items: [
                {
                    name: lang.get("activated_label"),
                    value: true,
                },
                {
                    name: lang.get("deactivated_label"),
                    value: false,
                },
            ],
            selectedValue: this.isIntegrated(),
            selectionChangedHandler: (v) => {
                showProgressDialog("pleaseWait_msg", this.updateDesktopIntegration(v))
                    .then(() => {
                    this.isIntegrated(v);
                    m.redraw();
                })
                    .catch((e) => Dialog.message("unknownError_msg", e.message));
            },
        };
        const setMailExportModeAttrs = {
            label: "mailExportMode_label",
            helpLabel: () => lang.get("mailExportModeHelp_msg"),
            items: [
                {
                    name: "EML",
                    value: "eml",
                },
                {
                    name: "MSG (Outlook)",
                    value: "msg",
                },
            ],
            selectedValue: this.mailExportMode(),
            selectionChangedHandler: (v) => {
                this.mailExportMode(v);
                this.setStringValue(DesktopConfigKey.mailExportMode, v);
            },
        };
        const updateHelpLabelAttrs = {
            updateAvailable: this.updateAvailable,
            manualUpdate: () => locator.desktopSettingsFacade.manualUpdate(),
        };
        const setAutoUpdateAttrs = {
            label: "autoUpdate_label",
            helpLabel: () => m(DesktopUpdateHelpLabel, updateHelpLabelAttrs),
            items: [
                {
                    name: lang.get("activated_label"),
                    value: true,
                },
                {
                    name: lang.get("deactivated_label"),
                    value: false,
                },
            ],
            selectedValue: this.isAutoUpdateEnabled(),
            selectionChangedHandler: (v) => {
                this.isAutoUpdateEnabled(v);
                this.setBooleanValue(DesktopConfigKey.enableAutoUpdate, v);
            },
        };
        const changeDefaultDownloadPathAttrs = attachDropdown({
            mainButtonAttrs: {
                title: "edit_action",
                icon: "Edit" /* Icons.Edit */,
                size: 1 /* ButtonSize.Compact */,
            },
            childAttrs: () => [
                {
                    label: "alwaysAsk_action",
                    click: () => this.setDefaultDownloadPath(DownloadLocationStrategy.ALWAYS_ASK),
                },
                {
                    label: "chooseDirectory_action",
                    click: () => this.setDefaultDownloadPath(DownloadLocationStrategy.CHOOSE_DIRECTORY),
                },
            ],
            showDropdown: () => !this.isPathDialogOpen,
            width: 200,
        });
        const defaultDownloadPathAttrs = {
            label: "defaultDownloadPath_label",
            value: this.defaultDownloadPath(),
            oninput: this.defaultDownloadPath,
            injectionsRight: () => m(IconButton, changeDefaultDownloadPathAttrs),
            isReadOnly: true,
        };
        return [
            m("#user-settings.fill-absolute.scroll.plr-l.pb-xl", [
                m(".h4.mt-l", lang.get("desktopSettings_label")),
                // spell check is done via OS on mac
                env.platformId === "darwin" ? null : m(TextField, spellcheckLanguageAttrs),
                // setting protocol handler via Electron does not work on Linux
                env.platformId === "linux" ? null : m(DropDownSelector, setDefaultMailtoHandlerAttrs),
                // mac doesn't really have run in background, you can just close a window
                env.platformId === "darwin" ? null : m(DropDownSelector, setRunInBackgroundAttrs),
                m(DropDownSelector, setRunOnStartupAttrs),
                m(TextField, defaultDownloadPathAttrs),
                m(DropDownSelector, setMailExportModeAttrs),
                // AppImage is kind of a portable install so we optionally add desktop icons etc
                env.platformId === "linux" ? m(DropDownSelector, setDesktopIntegrationAttrs) : null,
                this.showAutoUpdateOption ? m(DropDownSelector, setAutoUpdateAttrs) : null,
            ]),
        ];
    }
    toggleAutoLaunchInNative(enable) {
        return enable ? locator.desktopSettingsFacade.enableAutoLaunch() : locator.desktopSettingsFacade.disableAutoLaunch();
    }
    updateDefaultMailtoHandler(shouldBeDefaultMailtoHandler) {
        return shouldBeDefaultMailtoHandler ? locator.desktopSettingsFacade.registerMailto() : locator.desktopSettingsFacade.unregisterMailto();
    }
    updateDesktopIntegration(shouldIntegrate) {
        return shouldIntegrate ? locator.desktopSettingsFacade.integrateDesktop() : locator.desktopSettingsFacade.unIntegrateDesktop();
    }
    async requestDesktopConfig() {
        this.defaultDownloadPath = stream(lang.get("alwaysAsk_action"));
        const [integrationInfo, defaultDownloadPath, runAsTrayApp, showAutoUpdateOption, enableAutoUpdate, mailExportMode, spellcheckLabel] = await Promise.all([
            locator.desktopSettingsFacade.getIntegrationInfo(),
            locator.desktopSettingsFacade.getStringConfigValue(DesktopConfigKey.defaultDownloadPath),
            locator.desktopSettingsFacade.getBooleanConfigValue(DesktopConfigKey.runAsTrayApp),
            locator.desktopSettingsFacade.getBooleanConfigValue(DesktopConfigKey.showAutoUpdateOption),
            locator.desktopSettingsFacade.getBooleanConfigValue(DesktopConfigKey.enableAutoUpdate),
            locator.desktopSettingsFacade.getStringConfigValue(DesktopConfigKey.mailExportMode),
            getCurrentSpellcheckLanguageLabel(),
        ]);
        const { isMailtoHandler, isAutoLaunchEnabled, isIntegrated, isUpdateAvailable } = integrationInfo;
        this.isDefaultMailtoHandler(isMailtoHandler);
        this.defaultDownloadPath(defaultDownloadPath || lang.get("alwaysAsk_action"));
        this.runAsTrayApp(runAsTrayApp);
        this.runOnStartup(isAutoLaunchEnabled);
        this.isIntegrated(isIntegrated);
        this.showAutoUpdateOption = showAutoUpdateOption;
        this.isAutoUpdateEnabled(enableAutoUpdate);
        this.updateAvailable(isUpdateAvailable);
        this.mailExportMode(mailExportMode);
        this.spellCheckLang(spellcheckLabel);
        m.redraw();
    }
    async setBooleanValue(setting, value) {
        await locator.desktopSettingsFacade.setBooleanConfigValue(setting, value);
        m.redraw();
    }
    async setStringValue(setting, value) {
        await locator.desktopSettingsFacade.setStringConfigValue(setting, value);
        m.redraw();
    }
    async setDefaultDownloadPath(v) {
        this.isPathDialogOpen = true;
        let savePath;
        if (v === DownloadLocationStrategy.ALWAYS_ASK) {
            savePath = null;
        }
        else {
            savePath = await locator.fileApp.openFolderChooser();
        }
        this.defaultDownloadPath(savePath ?? lang.get("alwaysAsk_action"));
        await this.setStringValue(DesktopConfigKey.defaultDownloadPath, savePath);
        this.isPathDialogOpen = false;
    }
    onAppUpdateAvailable() {
        this.updateAvailable(true);
        m.redraw();
    }
    // this is all local for now
    entityEventsReceived = () => Promise.resolve();
}
//# sourceMappingURL=DesktopSettingsViewer.js.map