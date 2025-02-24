import m from "mithril";
import { lang } from "../../../../misc/LanguageViewModel.js";
import { SetupPageLayout } from "./SetupPageLayout.js";
import { Dialog } from "../../../../gui/base/Dialog.js";
import { renderSettingsBannerButton } from "../../../../settings/SettingsBannerButton.js";
export class SetupContactsPage {
    view({ attrs }) {
        return m(SetupPageLayout, { image: "contacts" }, this.renderImportAndSyncButtons(attrs));
    }
    renderImportAndSyncButtons(attrs) {
        const isContactSyncEnabled = attrs.syncManager.isEnabled();
        return [
            m("p.mb-s", lang.get("importContacts_msg")),
            renderSettingsBannerButton("import_action", () => {
                attrs.contactImporter.importContactsFromDeviceSafely();
            }),
            m("p.mb-s", lang.get("allowContactSynchronization")),
            renderSettingsBannerButton(isContactSyncEnabled ? "activated_label" : "activate_action", () => {
                this.enableSync(attrs);
            }, isContactSyncEnabled, "mb-l"),
        ];
    }
    async enableSync(attrs) {
        const success = await attrs.syncManager.enableSync();
        if (!success) {
            await attrs.syncManager.disableSync();
            await Dialog.message("allowContactReadWrite_msg");
            await attrs.mobileSystemFacade.goToSettings();
        }
    }
}
export class SetupContactsPageAttrs {
    syncManager;
    contactImporter;
    mobileSystemFacade;
    allowContactSyncAndImport;
    hidePagingButtonForPage = false;
    data = null;
    constructor(syncManager, contactImporter, mobileSystemFacade, allowContactSyncAndImport) {
        this.syncManager = syncManager;
        this.contactImporter = contactImporter;
        this.mobileSystemFacade = mobileSystemFacade;
        this.allowContactSyncAndImport = allowContactSyncAndImport;
    }
    headerTitle() {
        return "contacts_label";
    }
    nextAction(showDialogs) {
        // next action not available for this page
        return Promise.resolve(true);
    }
    isSkipAvailable() {
        return false;
    }
    isEnabled() {
        return this.allowContactSyncAndImport;
    }
}
//# sourceMappingURL=SetupContactsPage.js.map