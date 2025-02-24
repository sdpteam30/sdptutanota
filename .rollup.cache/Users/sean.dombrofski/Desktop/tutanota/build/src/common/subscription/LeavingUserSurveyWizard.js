import { createWizardDialog, wizardPageWrapper } from "../gui/base/WizardDialog.js";
import { LeavingUserSurveyCategoryPage, LeavingUserSurveyPageAttrs } from "./LeavingUserSurveyCategoryPage.js";
import { defer } from "@tutao/tutanota-utils";
import { LeavingUserSurveyReasonPage } from "./LeavingUserSurveyReasonPage.js";
export async function showLeavingUserSurveyWizard(showPriceCategory, showDowngradeMessage) {
    let category = null;
    let reason = null;
    let details = null;
    let submitted = false;
    const leavingUserSurveyData = {
        category,
        reason,
        details,
        submitted,
        showPriceCategory,
        showDowngradeMessage,
    };
    const wizardPages = [
        wizardPageWrapper(LeavingUserSurveyCategoryPage, new LeavingUserSurveyPageAttrs(leavingUserSurveyData)),
        wizardPageWrapper(LeavingUserSurveyReasonPage, new LeavingUserSurveyPageAttrs(leavingUserSurveyData)),
    ];
    const deferred = defer();
    const wizardBuilder = createWizardDialog(leavingUserSurveyData, wizardPages, async () => {
        deferred.resolve(leavingUserSurveyData);
    }, "EditLarge" /* DialogType.EditLarge */, "surveySkip_action");
    wizardBuilder.dialog.show();
    return deferred.promise;
}
//# sourceMappingURL=LeavingUserSurveyWizard.js.map