import { TextField } from "../../gui/base/TextField.js";
import { Dialog } from "../../gui/base/Dialog";
import { showProgressDialog } from "../../gui/dialogs/ProgressDialog";
import { neverNull } from "@tutao/tutanota-utils";
import { PreconditionFailedError } from "../../api/common/error/RestError";
import { showNotAvailableForFreeDialog, showPlanUpgradeRequiredDialog } from "../../misc/SubscriptionDialogs";
import * as SetCustomDomainCertificateDialog from "../SetDomainCertificateDialog.js";
import { lang } from "../../misc/LanguageViewModel";
import m from "mithril";
import { PlanType } from "../../../common/api/common/TutanotaConstants";
import { formatDateTime } from "../../../common/misc/Formatter";
import { locator } from "../../../common/api/main/CommonLocator";
import { IconButton } from "../../../common/gui/base/IconButton.js";
import { getAvailablePlansWithWhitelabel } from "../../../common/subscription/SubscriptionUtils.js";
const FAILURE_LOCKED = "lock.locked";
const FAILURE_CONTACT_FORM_ACTIVE = "domain.contact_form_active";
export class WhitelabelBrandingDomainSettings {
    view(vnode) {
        const { customerInfo, certificateInfo, whitelabelDomain, isWhitelabelFeatureEnabled } = vnode.attrs;
        return m(TextField, {
            label: "whitelabelDomain_label",
            value: whitelabelDomain ? whitelabelDomain : lang.get("deactivated_label"),
            helpLabel: this.renderWhitelabelInfo(certificateInfo),
            isReadOnly: true,
            injectionsRight: () => m(".ml-between-s", [
                whitelabelDomain ? this.renderDeactivateButton(whitelabelDomain) : null,
                customerInfo ? this._renderEditButton(customerInfo, certificateInfo, isWhitelabelFeatureEnabled) : null,
            ]),
        });
    }
    renderDeactivateButton(whitelabelDomain) {
        return m(IconButton, {
            title: "deactivate_action",
            click: () => this.deactivate(whitelabelDomain),
            icon: "Cancel" /* Icons.Cancel */,
            size: 1 /* ButtonSize.Compact */,
        });
    }
    async deactivate(whitelabelDomain) {
        if (await Dialog.confirm("confirmDeactivateWhitelabelDomain_msg")) {
            try {
                return await showProgressDialog("pleaseWait_msg", locator.customerFacade.deleteCertificate(whitelabelDomain));
            }
            catch (e) {
                if (e instanceof PreconditionFailedError) {
                    if (e.data === FAILURE_LOCKED) {
                        return await Dialog.message("operationStillActive_msg");
                    }
                    else if (e.data === FAILURE_CONTACT_FORM_ACTIVE) {
                        return await Dialog.message(lang.getTranslation("domainStillHasContactForms_msg", { "{domain}": whitelabelDomain }));
                    }
                }
                throw e;
            }
        }
    }
    _renderEditButton(customerInfo, certificateInfo, isWhitelabelFeatureEnabled) {
        return m(IconButton, {
            title: "edit_action",
            click: () => this.edit(isWhitelabelFeatureEnabled, customerInfo),
            icon: "Edit" /* Icons.Edit */,
            size: 1 /* ButtonSize.Compact */,
        });
    }
    async edit(isWhitelabelFeatureEnabled, customerInfo) {
        if (locator.logins.getUserController().isFreeAccount()) {
            showNotAvailableForFreeDialog([PlanType.Unlimited]);
        }
        else {
            if (!isWhitelabelFeatureEnabled) {
                const plansWithWhitelabel = await getAvailablePlansWithWhitelabel();
                isWhitelabelFeatureEnabled = await showPlanUpgradeRequiredDialog(plansWithWhitelabel);
            }
            if (isWhitelabelFeatureEnabled) {
                SetCustomDomainCertificateDialog.show(customerInfo);
            }
        }
    }
    renderWhitelabelInfo(certificateInfo) {
        let components;
        if (certificateInfo) {
            switch (certificateInfo.state) {
                case "0" /* CertificateState.VALID */:
                    components = [
                        lang.get("certificateExpiryDate_label", {
                            "{date}": formatDateTime(neverNull(certificateInfo.expiryDate)),
                        }),
                        this.certificateTypeString(certificateInfo),
                    ];
                    break;
                case "1" /* CertificateState.VALIDATING */:
                    components = [lang.get("certificateStateProcessing_label")];
                    break;
                case "2" /* CertificateState.INVALID */:
                    components = [lang.get("certificateStateInvalid_label")];
                    break;
                default:
                    components = [lang.get("emptyString_msg")];
            }
        }
        else {
            components = [lang.get("emptyString_msg")];
        }
        return () => m(".flex", components.map((c) => m(".pr-s", c)));
    }
    certificateTypeString(certificateInfo) {
        switch (certificateInfo.type) {
            case "1" /* CertificateType.LETS_ENCRYPT */:
                return lang.get("certificateTypeAutomatic_label");
            case "0" /* CertificateType.MANUAL */:
                return lang.get("certificateTypeManual_label");
            default:
                return lang.get("emptyString_msg");
        }
    }
}
//# sourceMappingURL=WhitelabelBrandingDomainSettings.js.map