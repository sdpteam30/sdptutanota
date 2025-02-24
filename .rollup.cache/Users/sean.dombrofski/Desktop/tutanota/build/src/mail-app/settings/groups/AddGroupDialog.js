import m from "mithril";
import { BookingItemFeatureType, FeatureType, GroupType } from "../../../common/api/common/TutanotaConstants.js";
import { Dialog } from "../../../common/gui/base/Dialog.js";
import { SelectMailAddressForm } from "../../../common/settings/SelectMailAddressForm.js";
import { getGroupTypeDisplayName } from "../../../common/settings/groups/GroupDetailsView.js";
import { showProgressDialog } from "../../../common/gui/dialogs/ProgressDialog.js";
import { lang } from "../../../common/misc/LanguageViewModel.js";
import { showBuyDialog } from "../../../common/subscription/BuyDialog.js";
import { PreconditionFailedError } from "../../../common/api/common/error/RestError.js";
import { showPlanUpgradeRequiredDialog } from "../../../common/misc/SubscriptionDialogs.js";
import { TemplateGroupPreconditionFailedReason } from "../../../common/sharing/GroupUtils.js";
import { DropDownSelector } from "../../../common/gui/base/DropDownSelector.js";
import { TextField } from "../../../common/gui/base/TextField.js";
import { getFirstOrThrow, ofClass } from "@tutao/tutanota-utils";
import { locator } from "../../../common/api/main/CommonLocator.js";
import { assertMainOrNode } from "../../../common/api/common/Env.js";
import { getAvailableDomains } from "../../../common/settings/mailaddress/MailAddressesUtils.js";
import { getAvailablePlansWithTemplates, toFeatureType } from "../../../common/subscription/SubscriptionUtils.js";
import { MoreInfoLink } from "../../../common/misc/news/MoreInfoLink.js";
assertMainOrNode();
export class AddGroupDialog {
    view(vnode) {
        const { availableGroupTypes, groupType, availableDomains, onEmailChanged, onBusyStateChanged, selectedDomain, onDomainChanged } = vnode.attrs;
        return [
            availableGroupTypes.length > 1
                ? m(DropDownSelector, {
                    label: "groupType_label",
                    items: availableGroupTypes.map((t) => {
                        return {
                            name: getGroupTypeDisplayName(t),
                            value: t,
                        };
                    }),
                    selectedValue: groupType,
                    selectionChangedHandler: vnode.attrs.onGroupTypeChanged,
                })
                : null,
            m(TextField, {
                label: "name_label",
                value: vnode.attrs.name,
                oninput: vnode.attrs.onGroupNameChanged,
            }),
            groupType === GroupType.Mail
                ? m("", [
                    m(SelectMailAddressForm, {
                        selectedDomain,
                        availableDomains,
                        onValidationResult: onEmailChanged,
                        onBusyStateChanged,
                        onDomainChanged,
                    }),
                    m(".mt-m", ""),
                    m(MoreInfoLink, { link: "https://tuta.com/support/#shared-mailboxes" /* InfoLink.SharedMailboxes */, isSmall: true }),
                ])
                : m(""),
        ];
    }
}
export class AddGroupDialogViewModel {
    groupName;
    mailAddress;
    groupTypes;
    errorMessageId;
    availableDomains;
    selectedDomain;
    groupType;
    isVerifactionBusy;
    _groupManagementFacade;
    constructor(availableDomains, groupManagementFacade) {
        this.availableDomains = availableDomains;
        this._groupManagementFacade = groupManagementFacade;
        this.groupTypes = this.getAvailableGroupTypes();
        this.groupType = getFirstOrThrow(this.groupTypes);
        this.groupName = "";
        this.mailAddress = "";
        this.errorMessageId = "mailAddressNeutral_msg";
        this.isVerifactionBusy = false;
        this.selectedDomain = getFirstOrThrow(availableDomains);
    }
    createMailGroup() {
        return this._groupManagementFacade.createMailGroup(this.groupName, this.mailAddress);
    }
    validateAddGroupInput() {
        if (this.groupType === GroupType.Mail) {
            return this.errorMessageId;
        }
        else if (this.groupType === GroupType.Template || (this.groupType === GroupType.MailingList && this.groupName.trim() === "")) {
            return "enterName_msg";
        }
        else {
            return null;
        }
    }
    getAvailableGroupTypes() {
        if (locator.logins.isEnabled(FeatureType.WhitelabelChild)) {
            return [];
        }
        else {
            return [GroupType.Mail];
        }
    }
    onEmailChanged(email, validationResult) {
        this.errorMessageId = validationResult.errorId;
        if (validationResult.isValid) {
            this.mailAddress = email;
        }
    }
}
export function show() {
    getAvailableDomains(locator.logins).then((availableDomains) => {
        const viewModel = new AddGroupDialogViewModel(availableDomains, locator.groupManagementFacade);
        if (viewModel.getAvailableGroupTypes().length === 0)
            return Dialog.message("selectionNotAvailable_msg");
        let addGroupOkAction = async (dialog) => {
            if (viewModel.isVerifactionBusy)
                return;
            const errorId = viewModel.validateAddGroupInput();
            if (errorId) {
                Dialog.message(errorId);
                return;
            }
            const userController = locator.logins.getUserController();
            const planType = await userController.getPlanType();
            const useLegacyBookingItem = await userController.useLegacyBookingItem();
            if (viewModel.groupType === GroupType.Mail) {
                showProgressDialog("pleaseWait_msg", showBuyDialog({
                    featureType: useLegacyBookingItem ? toFeatureType(planType) : BookingItemFeatureType.SharedMailGroup,
                    bookingText: "sharedMailbox_label",
                    count: 1,
                    freeAmount: 0,
                    reactivate: false,
                }).then((accepted) => {
                    if (accepted) {
                        dialog.close();
                        return viewModel.createMailGroup();
                    }
                }));
            }
            else if (viewModel.groupType === GroupType.Template) {
                addTemplateGroup(viewModel.groupName).then((success) => {
                    if (success) {
                        dialog.close();
                    }
                });
            }
        };
        Dialog.showActionDialog({
            title: viewModel.groupType == GroupType.Mail ? "createSharedMailbox_label" : "addGroup_label",
            child: () => m(AddGroupDialog, {
                selectedDomain: viewModel.selectedDomain,
                groupType: viewModel.groupType,
                availableDomains: availableDomains,
                availableGroupTypes: viewModel.groupTypes,
                name: viewModel.groupName,
                onGroupNameChanged: (newName) => (viewModel.groupName = newName),
                onGroupTypeChanged: (newType) => (viewModel.groupType = newType),
                onEmailChanged: (mailAddress, validationResult) => viewModel.onEmailChanged(mailAddress, validationResult),
                onBusyStateChanged: (isBusy) => (viewModel.isVerifactionBusy = isBusy),
                onDomainChanged: (domain) => (viewModel.selectedDomain = domain),
            }),
            okAction: addGroupOkAction,
        });
    });
}
/**
 * @returns {Promise<boolean>} true if group was added, false otherwise
 */
function addTemplateGroup(name) {
    return showProgressDialog("pleaseWait_msg", locator.groupManagementFacade
        .createTemplateGroup(name)
        .then(() => true)
        .catch(ofClass(PreconditionFailedError, async (e) => {
        if (e.data === TemplateGroupPreconditionFailedReason.BUSINESS_FEATURE_REQUIRED ||
            e.data === TemplateGroupPreconditionFailedReason.UNLIMITED_REQUIRED) {
            const plans = await getAvailablePlansWithTemplates();
            showPlanUpgradeRequiredDialog(plans);
        }
        else {
            Dialog.message(lang.makeTranslation("confirm_msg", e.message));
        }
        return false;
    })));
}
//# sourceMappingURL=AddGroupDialog.js.map