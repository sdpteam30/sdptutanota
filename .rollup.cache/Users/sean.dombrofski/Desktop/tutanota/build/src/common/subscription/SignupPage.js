import m from "mithril";
import { emitWizardEvent } from "../gui/base/WizardDialog.js";
import { SignupForm } from "./SignupForm";
import { getDisplayNameOfPlanType } from "./FeatureListProvider";
import { PlanType } from "../api/common/TutanotaConstants.js";
import { lang } from "../misc/LanguageViewModel.js";
export class SignupPage {
    dom;
    oncreate(vnode) {
        this.dom = vnode.dom;
    }
    view(vnode) {
        const data = vnode.attrs.data;
        const newAccountData = data.newAccountData;
        let mailAddress = undefined;
        if (newAccountData)
            mailAddress = newAccountData.mailAddress;
        return m(SignupForm, {
            onComplete: (newAccountData) => {
                if (newAccountData)
                    data.newAccountData = newAccountData;
                emitWizardEvent(this.dom, "showNextWizardDialogPage" /* WizardEventType.SHOW_NEXT_PAGE */);
            },
            onChangePlan: () => {
                emitWizardEvent(this.dom, "showPreviousWizardDialogPage" /* WizardEventType.SHOW_PREVIOUS_PAGE */);
            },
            isBusinessUse: data.options.businessUse,
            isPaidSubscription: () => data.type !== PlanType.Free,
            campaign: () => data.registrationDataId,
            prefilledMailAddress: mailAddress,
            readonly: !!newAccountData,
        });
    }
}
export class SignupPageAttrs {
    data;
    constructor(signupData) {
        this.data = signupData;
    }
    headerTitle() {
        const title = getDisplayNameOfPlanType(this.data.type);
        if (this.data.type === PlanType.Essential || this.data.type === PlanType.Advanced) {
            return lang.makeTranslation("signup_business", title + " Business");
        }
        else {
            return lang.makeTranslation("signup_title", title);
        }
    }
    nextAction(showErrorDialog) {
        // next action not available for this page
        return Promise.resolve(true);
    }
    isSkipAvailable() {
        return false;
    }
    isEnabled() {
        return true;
    }
}
//# sourceMappingURL=SignupPage.js.map