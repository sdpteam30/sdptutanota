import { emitWizardEvent } from "../gui/base/WizardDialog.js";
import m from "mithril";
import { DropDownSelector } from "../gui/base/DropDownSelector.js";
import { lang } from "../misc/LanguageViewModel.js";
import { theme } from "../gui/theme.js";
import { SetupLeavingUserSurveyPage } from "./SetupLeavingUserSurveyPage.js";
export class LeavingUserSurveyCategoryPage {
    _dom = null;
    oncreate(vnode) {
        this._dom = vnode.dom;
    }
    view(vnode) {
        return m(SetupLeavingUserSurveyPage, {
            closeAction: () => this.showNextPage(),
            nextButtonLabel: "next_action",
            nextButtonEnabled: !vnode.attrs.data.category,
            image: "main",
            mainMessage: "surveyMainMessageDelete_label",
            secondaryMessage: vnode.attrs.data.showDowngradeMessage ? "surveySecondaryMessageDowngrade_label" : "surveySecondaryMessageDelete_label",
        }, [
            m(DropDownSelector, {
                style: { border: `2px solid ${theme.content_border}`, borderRadius: "6px", padding: "4px 8px" },
                doShowBorder: false,
                label: "surveyUnhappy_label",
                items: this.getCategoryDropdownItems(vnode.attrs.data.showPriceCategory),
                selectedValue: vnode.attrs.data.category,
                selectionChangedHandler: (category) => {
                    vnode.attrs.data.category = category;
                },
                dropdownWidth: 350,
            }),
            // this currently "mocks" the helplabel of the dropdown. We have to take another look once we decide on applying the dropdown styling to the entire app.
            m(".mlr-s.mt-xs", m("small", lang.get("cancellationConfirmation_msg"))),
        ]);
    }
    getCategoryDropdownItems(showPriceCategory) {
        const items = [
            {
                name: lang.get("experienceSamplingAnswer_label"),
                value: null,
            },
            {
                name: lang.get("surveyPrice_label"),
                value: "0",
            },
            {
                name: lang.get("surveyAccountProblems_label"),
                value: "1",
            },
            {
                name: lang.get("surveyMissingFeature_label"),
                value: "2",
            },
            {
                name: lang.get("surveyFeatureDesignProblems_label"),
                value: "3",
            },
            {
                name: lang.get("surveyOtherReason_label"),
                value: "4",
            },
        ];
        if (!showPriceCategory)
            items.splice(1, 1); // remove price category
        return items;
    }
    showNextPage() {
        if (this._dom) {
            emitWizardEvent(this._dom, "showNextWizardDialogPage" /* WizardEventType.SHOW_NEXT_PAGE */);
        }
    }
}
export class LeavingUserSurveyPageAttrs {
    data;
    constructor(leavingUserSurveyData) {
        this.data = leavingUserSurveyData;
    }
    headerTitle() {
        return "survey_label";
    }
    nextAction(showErrorDialog) {
        return Promise.resolve(this.data.category != null);
    }
    isSkipAvailable() {
        return false;
    }
    isEnabled() {
        return true;
    }
}
//# sourceMappingURL=LeavingUserSurveyCategoryPage.js.map