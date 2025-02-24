import { assertNotNull, downcast, isEmpty, neverNull } from "@tutao/tutanota-utils";
import { Dialog } from "../gui/base/Dialog";
import { locator } from "../api/main/CommonLocator";
import { BookingTypeRef } from "../api/entities/sys/TypeRefs.js";
import { GENERATED_MAX_ID } from "../api/common/utils/EntityUtils.js";
import { Const, NewBusinessPlans, NewPaidPlans, NewPersonalPlans } from "../api/common/TutanotaConstants.js";
import { ProgrammingError } from "../api/common/error/ProgrammingError.js";
/**
 * Opens a dialog which states that the function is not available in the Free subscription and provides an option to upgrade.
 */
export async function showNotAvailableForFreeDialog(acceptedPlans = NewPaidPlans) {
    const wizard = await import("../subscription/UpgradeSubscriptionWizard");
    const customerInfo = await locator.logins.getUserController().loadCustomerInfo();
    const businessPlanRequired = acceptedPlans.filter((plan) => NewBusinessPlans.includes(plan)).length === acceptedPlans.length &&
        NewPersonalPlans.includes(downcast(customerInfo.plan));
    const msg = businessPlanRequired ? "pricing.notSupportedByPersonalPlan_msg" : "newPaidPlanRequired_msg";
    await wizard.showUpgradeWizard(locator.logins, acceptedPlans, msg);
}
export function createNotAvailableForFreeClickHandler(acceptedPlans, click, available) {
    return (e, dom) => {
        if (!available()) {
            showNotAvailableForFreeDialog(acceptedPlans);
        }
        else {
            click(e, dom);
        }
    };
}
/**
 * Returns whether a paid subscriptino is active and shows one of the showNotAvailableForFreeDialog or subscription cancelled dialogs if needed.
 */
export async function checkPaidSubscription() {
    if (locator.logins.getUserController().isFreeAccount()) {
        showNotAvailableForFreeDialog();
        return false;
    }
    return true;
}
export async function showMoreStorageNeededOrderDialog(messageIdOrMessageFunction) {
    const userController = locator.logins.getUserController();
    if (!userController.isGlobalAdmin()) {
        return Dialog.message("insufficientStorageWarning_msg");
    }
    const confirmed = await Dialog.confirm(messageIdOrMessageFunction, "upgrade_action");
    if (confirmed) {
        if (userController.isFreeAccount()) {
            const wizard = await import("../subscription/UpgradeSubscriptionWizard");
            return wizard.showUpgradeWizard(locator.logins);
        }
        else {
            const usedStorage = Number(await locator.userManagementFacade.readUsedUserStorage(userController.user));
            const { getAvailableMatchingPlans } = await import("../subscription/SubscriptionUtils.js");
            const plansWithMoreStorage = await getAvailableMatchingPlans(locator.serviceExecutor, (config) => Number(config.storageGb) * Const.MEMORY_GB_FACTOR > usedStorage);
            if (isEmpty(plansWithMoreStorage)) {
                await Dialog.message(userController.isGlobalAdmin() ? "insufficientStorageAdmin_msg" : "insufficientStorageUser_msg");
            }
            else {
                await showPlanUpgradeRequiredDialog(plansWithMoreStorage);
            }
        }
    }
}
/**
 * @returns true if the needed plan has been ordered
 */
export async function showPlanUpgradeRequiredDialog(acceptedPlans, reason) {
    if (isEmpty(acceptedPlans)) {
        throw new ProgrammingError("no plans specified");
    }
    const userController = locator.logins.getUserController();
    if (userController.isFreeAccount()) {
        showNotAvailableForFreeDialog(acceptedPlans);
        return false;
    }
    else if (!userController.isGlobalAdmin()) {
        Dialog.message("contactAdmin_msg");
        return false;
    }
    else {
        if (reason == null) {
            // show generic reason if not supplied
            let customerInfo = await userController.loadCustomerInfo();
            const businessPlanRequired = acceptedPlans.filter((plan) => NewBusinessPlans.includes(plan)).length === acceptedPlans.length &&
                !NewBusinessPlans.includes(downcast(customerInfo.plan));
            reason = businessPlanRequired ? "pricing.notSupportedByPersonalPlan_msg" : "newPaidPlanRequired_msg";
        }
        await showSwitchPlanDialog(userController, acceptedPlans, reason);
        return acceptedPlans.includes(downcast(await userController.getPlanType()));
    }
}
export async function showUpgradeWizardOrSwitchSubscriptionDialog(userController) {
    if (userController.isFreeAccount()) {
        const { showUpgradeWizard } = await import("../subscription/UpgradeSubscriptionWizard");
        await showUpgradeWizard(locator.logins);
    }
    else {
        await showSwitchPlanDialog(userController, NewPaidPlans);
    }
}
async function showSwitchPlanDialog(userController, acceptedPlans, reason) {
    let customerInfo = await userController.loadCustomerInfo();
    const bookings = await locator.entityClient.loadRange(BookingTypeRef, neverNull(customerInfo.bookings).items, GENERATED_MAX_ID, 1, true);
    const { showSwitchDialog } = await import("../subscription/SwitchSubscriptionDialog");
    return showSwitchDialog(await userController.loadCustomer(), customerInfo, await userController.loadAccountingInfo(), assertNotNull(bookings[0]), acceptedPlans, reason ?? null);
}
//# sourceMappingURL=SubscriptionDialogs.js.map