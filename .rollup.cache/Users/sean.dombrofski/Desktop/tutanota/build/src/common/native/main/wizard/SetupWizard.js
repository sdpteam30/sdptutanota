import { createWizardDialog, wizardPageWrapper } from "../../../gui/base/WizardDialog.js";
import { defer } from "@tutao/tutanota-utils";
import { SetupCongratulationsPage, SetupCongratulationsPageAttrs } from "./setupwizardpages/SetupCongraulationsPage.js";
import { SetupNotificationsPage, SetupNotificationsPageAttrs } from "./setupwizardpages/SetupNotificationsPage.js";
import { SetupThemePage, SetupThemePageAttrs } from "./setupwizardpages/SetupThemePage.js";
import { SetupContactsPage, SetupContactsPageAttrs } from "./setupwizardpages/SetupContactsPage.js";
import { SetupLockPage, SetupLockPageAttrs } from "./setupwizardpages/SetupLockPage.js";
import { locator } from "../../../api/main/CommonLocator.js";
export async function showSetupWizard(systemPermissionHandler, webMobileFacade, contactImporter, systemFacade, credentialsProvider, contactSyncManager, deviceConfig, allowContactSyncAndImport) {
    const permissionStatus = await systemPermissionHandler.queryPermissionsState([
        "0" /* PermissionType.Contacts */,
        "2" /* PermissionType.Notification */,
        "1" /* PermissionType.IgnoreBatteryOptimization */,
    ]);
    let wizardPages = [];
    wizardPages.push(wizardPageWrapper(SetupCongratulationsPage, new SetupCongratulationsPageAttrs()));
    wizardPages.push(wizardPageWrapper(SetupNotificationsPage, new SetupNotificationsPageAttrs({
        isNotificationPermissionGranted: permissionStatus.get("2" /* PermissionType.Notification */) ?? false,
        isBatteryPermissionGranted: permissionStatus.get("1" /* PermissionType.IgnoreBatteryOptimization */) ?? false,
    }, webMobileFacade.getIsAppVisible(), systemPermissionHandler)));
    wizardPages.push(wizardPageWrapper(SetupThemePage, new SetupThemePageAttrs()));
    if (allowContactSyncAndImport && contactSyncManager && contactImporter) {
        wizardPages.push(wizardPageWrapper(SetupContactsPage, new SetupContactsPageAttrs(contactSyncManager, contactImporter, systemFacade, allowContactSyncAndImport)));
    }
    wizardPages.push(wizardPageWrapper(SetupLockPage, new SetupLockPageAttrs(locator.systemFacade)));
    const deferred = defer();
    const wizardBuilder = createWizardDialog(null, wizardPages, async () => {
        deviceConfig.setIsSetupComplete(true);
        deferred.resolve();
    }, "EditSmall" /* DialogType.EditSmall */);
    wizardBuilder.dialog.show();
    return deferred.promise;
}
//# sourceMappingURL=SetupWizard.js.map