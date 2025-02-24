import { FeatureType } from "../../api/common/TutanotaConstants";
import { locator } from "../../api/main/CommonLocator.js";
/**
 * Opens the upgrade dialog.
 * The promise resolves, as soon as the dialog is closed. This can be caused either due to a successful upgrade or when the user just dismissed the dialog.
 */
export async function showUpgradeDialog() {
    await (await import("../../subscription/UpgradeSubscriptionWizard.js")).showUpgradeWizard(locator.logins);
}
export function showSupportDialog(logins) {
    import("../../support/SupportDialog.js").then((supportModule) => supportModule.showSupportDialog(logins));
}
export function isNewMailActionAvailable() {
    return locator.logins.isInternalUserLoggedIn() && !locator.logins.isEnabled(FeatureType.ReplyOnly);
}
//# sourceMappingURL=NavFunctions.js.map