import m from "mithril";
import { assertMainOrNode, isApp } from "../../common/api/common/Env";
import { lang } from "../../common/misc/LanguageViewModel";
import { DropDownSelector } from "../../common/gui/base/DropDownSelector.js";
import { isUpdateForTypeRef } from "../../common/api/common/utils/EntityUpdateUtils.js";
import { locator } from "../../common/api/main/CommonLocator.js";
import { FeatureType } from "../../common/api/common/TutanotaConstants.js";
import { TutanotaPropertiesTypeRef } from "../../common/api/entities/tutanota/TypeRefs.js";
import { Button } from "../../common/gui/base/Button.js";
import { Dialog } from "../../common/gui/base/Dialog.js";
import { mailLocator } from "../mailLocator.js";
import { assert } from "@tutao/tutanota-utils";
assertMainOrNode();
export class ContactsSettingsViewer {
    noAutomaticContacts = false;
    constructor() {
        this.noAutomaticContacts = locator.logins.getUserController().props.noAutomaticContacts;
    }
    view() {
        return [
            m(".fill-absolute.scroll.plr-l.pb-xl", {
                role: "group",
            }, [
                m(".h4.mt-l", lang.get("contactsManagement_label")),
                this.renderImportContactsButton(),
                locator.logins.isEnabled(FeatureType.DisableContacts) ? null : this.renderAutoCreateContactsPreference(),
                this.renderContactsSyncDropdown(),
            ]),
        ];
    }
    renderAutoCreateContactsPreference() {
        return m(DropDownSelector, {
            label: "createContacts_label",
            helpLabel: () => lang.get("createContactsForRecipients_action"),
            items: [
                {
                    name: lang.get("activated_label"),
                    value: false,
                },
                {
                    name: lang.get("deactivated_label"),
                    value: true,
                },
            ],
            selectedValue: this.noAutomaticContacts,
            selectionChangedHandler: (v) => {
                locator.logins.getUserController().props.noAutomaticContacts = v;
                locator.entityClient.update(locator.logins.getUserController().props);
            },
            dropdownWidth: 250,
        });
    }
    renderImportContactsButton() {
        if (!isApp()) {
            return null;
        }
        return m(".flex.flex-space-between.items-center", [
            lang.get("importFromContactBook_label"),
            m(Button, {
                label: "import_action",
                click: () => this.importContactsFromDevice(),
                type: "primary" /* ButtonType.Primary */,
            }),
        ]);
    }
    renderContactsSyncDropdown() {
        if (!isApp())
            return null;
        return m(DropDownSelector, {
            label: "contactsSynchronization_label",
            helpLabel: () => lang.get("contactsSynchronizationWarning_msg"),
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
            selectedValue: mailLocator.nativeContactsSyncManager().isEnabled(),
            selectionChangedHandler: async (contactSyncEnabled) => {
                await this.onContactSyncSelectionChanged(contactSyncEnabled);
            },
            dropdownWidth: 250,
        });
    }
    async onContactSyncSelectionChanged(contactSyncEnabled) {
        assert(isApp(), "isApp");
        const syncManager = mailLocator.nativeContactsSyncManager();
        if (!contactSyncEnabled) {
            syncManager.disableSync();
        }
        else {
            const canSync = await syncManager.canSync();
            if (!canSync) {
                return;
            }
            await syncManager.enableSync();
            // We just enable if the synchronization started successfully
            const isSyncAllowed = await syncManager.syncContacts();
            if (!isSyncAllowed) {
                this.handleContactsSynchronizationFail();
            }
            m.redraw();
        }
    }
    updateTutaPropertiesSettings(props) {
        this.noAutomaticContacts = props.noAutomaticContacts;
    }
    async entityEventsReceived(updates) {
        for (const update of updates) {
            const { operation } = update;
            if (isUpdateForTypeRef(TutanotaPropertiesTypeRef, update) && operation === "1" /* OperationType.UPDATE */) {
                const props = await locator.entityClient.load(TutanotaPropertiesTypeRef, locator.logins.getUserController().props._id);
                this.updateTutaPropertiesSettings(props);
            }
        }
        m.redraw();
    }
    handleContactsSynchronizationFail() {
        mailLocator.nativeContactsSyncManager()?.disableSync();
        this.showContactsPermissionDialog();
    }
    async showContactsPermissionDialog() {
        await Dialog.message("allowContactReadWrite_msg");
        await locator.systemFacade.goToSettings();
    }
    async importContactsFromDevice() {
        const importer = await mailLocator.contactImporter();
        await importer.importContactsFromDeviceSafely();
    }
}
//# sourceMappingURL=ContactsSettingsViewer.js.map