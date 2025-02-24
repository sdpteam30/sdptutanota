import { assertEnumValue, CustomDomainTypeCount, CustomDomainValidationResult } from "../../../common/api/common/TutanotaConstants";
import m from "mithril";
import { showProgressDialog } from "../../../common/gui/dialogs/ProgressDialog";
import { lang } from "../../../common/misc/LanguageViewModel";
import { Dialog } from "../../../common/gui/base/Dialog";
import { emitWizardEvent } from "../../../common/gui/base/WizardDialog.js";
import { PreconditionFailedError } from "../../../common/api/common/error/RestError.js";
import { showPlanUpgradeRequiredDialog } from "../../../common/misc/SubscriptionDialogs.js";
import { downcast, isEmpty, ofClass } from "@tutao/tutanota-utils";
import { locator } from "../../../common/api/main/CommonLocator";
import { assertMainOrNode } from "../../../common/api/common/Env";
import { createDnsRecordTable } from "./DnsRecordTable.js";
import { getAvailableMatchingPlans } from "../../../common/subscription/SubscriptionUtils.js";
import { getCustomMailDomains } from "../../../common/api/common/utils/CustomerUtils.js";
import { LoginButton } from "../../../common/gui/base/buttons/LoginButton.js";
assertMainOrNode();
export var CustomDomainFailureReasons;
(function (CustomDomainFailureReasons) {
    CustomDomainFailureReasons["LIMIT_REACHED"] = "customdomainservice.limit_reached";
    CustomDomainFailureReasons["DOMAIN_IN_USE"] = "customdomainservice.domain_in_use";
})(CustomDomainFailureReasons || (CustomDomainFailureReasons = {}));
export class VerifyOwnershipPage {
    dom;
    oncreate(vnode) {
        this.dom = vnode.dom;
        // We expect that the page is created again each time when domain is changed so we only need to load it in oncreate.
        const { data } = vnode.attrs;
        locator.customerFacade.getDomainValidationRecord(data.domain()).then((recordValue) => {
            data.expectedVerificationRecord.value = recordValue;
            m.redraw();
        });
    }
    view(vnode) {
        const a = vnode.attrs;
        return [
            m("h4.mt-l.text-center", lang.get("verifyDomainOwnership_title")),
            m("p", lang.get("verifyDomainOwnershipExplanation_msg", {
                "{domain}": a.data.domain(),
            })),
            m("p", lang.get("verifyOwnershipTXTrecord_msg")),
            createDnsRecordTable([vnode.attrs.data.expectedVerificationRecord]),
            m(".flex-center.full-width.pt-l.mb-l", m(LoginButton, {
                label: "next_action",
                class: "small-login-button",
                onclick: () => emitWizardEvent(this.dom, "showNextWizardDialogPage" /* WizardEventType.SHOW_NEXT_PAGE */),
            })),
        ];
    }
}
export class VerifyOwnershipPageAttrs {
    data;
    constructor(domainData) {
        this.data = domainData;
    }
    headerTitle() {
        return "domainSetup_title";
    }
    nextAction(showErrorDialog = true) {
        return showProgressDialog("pleaseWait_msg", locator.customerFacade.addDomain(this.data.domain()).then((result) => {
            const validationResult = assertEnumValue(CustomDomainValidationResult, result.validationResult);
            if (validationResult === CustomDomainValidationResult.CUSTOM_DOMAIN_VALIDATION_RESULT_OK) {
                return null;
            }
            else if (validationResult === CustomDomainValidationResult.CUSTOM_DOMAIN_VALIDATION_RESULT_DOMAIN_NOT_AVAILABLE) {
                let customDomainInfos = getCustomMailDomains(this.data.customerInfo);
                //domain is already assigned to this account
                if (customDomainInfos.some((domainInfo) => domainInfo.domain === this.data.domain())) {
                    return null;
                }
                return () => lang.get("customDomainErrorDomainNotAvailable_msg");
            }
            else {
                const errorMessageMap = {
                    [CustomDomainValidationResult.CUSTOM_DOMAIN_VALIDATION_RESULT_OK]: "emptyString_msg",
                    [CustomDomainValidationResult.CUSTOM_DOMAIN_VALIDATION_RESULT_DNS_LOOKUP_FAILED]: "customDomainErrorDnsLookupFailure_msg",
                    [CustomDomainValidationResult.CUSTOM_DOMAIN_VALIDATION_RESULT_DOMAIN_NOT_FOUND]: "customDomainErrorDomainNotFound_msg",
                    [CustomDomainValidationResult.CUSTOM_DOMAIN_VALIDATION_RESULT_NAMESERVER_NOT_FOUND]: "customDomainErrorNameserverNotFound_msg",
                    [CustomDomainValidationResult.CUSTOM_DOMAIN_VALIDATION_RESULT_DOMAIN_NOT_AVAILABLE]: "customDomainErrorDomainNotAvailable_msg",
                    [CustomDomainValidationResult.CUSTOM_DOMAIN_VALIDATION_RESULT_VALIDATION_FAILED]: "customDomainErrorValidationFailed_msg",
                };
                return lang.makeTranslation("error_msg", lang.get(errorMessageMap[validationResult]) + //TODO correct to use? customDomainErrorOtherTxtRecords_msg
                    (result.invalidDnsRecords.length > 0
                        ? " " + lang.get("customDomainErrorOtherTxtRecords_msg") + "\n" + result.invalidDnsRecords.map((r) => r.value).join("\n")
                        : ""));
            }
        }))
            .then((message) => {
            if (message) {
                return showErrorDialog ? Dialog.message(downcast(message)).then(() => false) : false;
            }
            return true;
        })
            .catch(ofClass(PreconditionFailedError, async (e) => {
            if (e.data === CustomDomainFailureReasons.LIMIT_REACHED) {
                const nbrOfCustomDomains = this.data.customerInfo.domainInfos.filter((domainInfo) => domainInfo.whitelabelConfig == null).length;
                const plans = await getAvailableMatchingPlans(locator.serviceExecutor, (config) => {
                    if (config.customDomainType in CustomDomainTypeCount) {
                        const planDomains = CustomDomainTypeCount[config.customDomainType];
                        return planDomains === -1 || planDomains > nbrOfCustomDomains;
                    }
                    return false;
                });
                if (isEmpty(plans)) {
                    // shouldn't happen while we have the Unlimited plan...
                    Dialog.message("tooManyCustomDomains_msg");
                }
                else {
                    // ignore promise. always return false to not switch to next page.
                    showPlanUpgradeRequiredDialog(plans, "moreCustomDomainsRequired_msg");
                }
            }
            else {
                Dialog.message(lang.makeTranslation("error_msg", e.toString()));
            }
            return false;
        }));
    }
    isSkipAvailable() {
        return false;
    }
    isEnabled() {
        return true;
    }
}
//# sourceMappingURL=VerifyOwnershipPage.js.map