import { SelectMailAddressForm } from "../../../common/settings/SelectMailAddressForm.js";
import m from "mithril";
import { getAliasLineAttrs } from "../../../common/settings/mailaddress/MailAddressTable.js";
import { CustomerTypeRef, GroupInfoTypeRef } from "../../../common/api/entities/sys/TypeRefs.js";
import { neverNull } from "@tutao/tutanota-utils";
import { Dialog } from "../../../common/gui/base/Dialog";
import { locator } from "../../../common/api/main/CommonLocator";
import { lang } from "../../../common/misc/LanguageViewModel";
import { Table } from "../../../common/gui/base/Table.js";
import { emitWizardEvent } from "../../../common/gui/base/WizardDialog.js";
import { showProgressDialog } from "../../../common/gui/dialogs/ProgressDialog";
import { InvalidDataError, LimitReachedError } from "../../../common/api/common/error/RestError";
import { assertMainOrNode } from "../../../common/api/common/Env";
import { UpgradeRequiredError } from "../../../common/api/main/UpgradeRequiredError.js";
import { showPlanUpgradeRequiredDialog } from "../../../common/misc/SubscriptionDialogs.js";
import { LoginButton } from "../../../common/gui/base/buttons/LoginButton.js";
assertMainOrNode();
/**
 * Part of the custom domain wizard where user can add mail addresses for the new domain.
 */
export class AddEmailAddressesPage {
    oncreate({ attrs }) {
        attrs.data.editAliasFormAttrs.model.init();
    }
    onremove({ attrs }) {
        // MailAddressTableModel.dispose is handled by the AddDomainWizard close action in order to allow going back and forth navigation within the wizard dialog.
    }
    view(vnode) {
        const a = vnode.attrs;
        const aliasesTableAttrs = {
            columnWidths: [".column-width-largest" /* ColumnWidth.Largest */],
            showActionButtonColumn: true,
            addButtonAttrs: null,
            lines: getAliasLineAttrs(a.data.editAliasFormAttrs).map((row) => {
                return {
                    actionButtonAttrs: row.actionButtonAttrs ?? null,
                    cells: row.cells,
                };
            }),
        };
        let domainInfo = { domain: a.data.domain(), isPaid: false };
        const mailFormAttrs = {
            selectedDomain: domainInfo,
            // it is a custom domain so it's not a special one
            availableDomains: [domainInfo],
            onValidationResult: (email, validationResult) => {
                if (validationResult.isValid) {
                    a.mailAddress = email;
                    a.errorMessageId = null;
                }
                else {
                    a.errorMessageId = validationResult.errorId;
                }
            },
            onDomainChanged: (domain) => (domainInfo = domain),
            onBusyStateChanged: (isBusy) => (a.isMailVerificationBusy = isBusy),
            injectionsRightButtonAttrs: {
                title: "addEmailAlias_label",
                icon: "Add" /* Icons.Add */,
                size: 1 /* ButtonSize.Compact */,
                click: () => vnode.attrs.addAliasFromInput().then(() => {
                    m.redraw();
                }),
            },
        };
        return m("", [
            m("h4.mt-l.text-center", lang.get("addCustomDomainAddresses_title")),
            m(".mt.mb", lang.get("addCustomDomainAddAdresses_msg")),
            m(SelectMailAddressForm, mailFormAttrs),
            locator.logins.getUserController().userGroupInfo.mailAddressAliases.length ? m(Table, aliasesTableAttrs) : null,
            m(".flex-center.full-width.pt-l.mb-l", m(LoginButton, {
                label: "next_action",
                class: "small-login-button",
                onclick: () => emitWizardEvent(vnode.dom, "showNextWizardDialogPage" /* WizardEventType.SHOW_NEXT_PAGE */),
            })),
        ]);
    }
}
export class AddEmailAddressesPageAttrs {
    data;
    mailAddress;
    errorMessageId;
    isMailVerificationBusy;
    constructor(domainData) {
        this.data = domainData;
        this.mailAddress = "";
        this.errorMessageId = "mailAddressNeutral_msg"; // we need to set this message id to prevent that an empty input is initially regarded as valid
        this.isMailVerificationBusy = false;
    }
    headerTitle() {
        return "domainSetup_title";
    }
    nextAction(showErrorDialog) {
        if (this.isMailVerificationBusy)
            return Promise.resolve(false);
        //We try to add an alias from the input field, if it is not empty and error dialogs are allowed
        if (showErrorDialog && this.errorMessageId) {
            //We already showed one error dialog if failing to add an alias from the input field.
            //The user has to clean the input field up before proceeding to the next page (even if there is already an alias)
            //We are done if we succeeded to add the alias
            return this.addAliasFromInput();
        }
        //Otherwise we check that there is either an alias or a user (or an alias for some other user) defined for the custom domain regardless of activation status
        const checkMailAddresses = Promise.resolve().then(() => {
            const hasAliases = locator.logins
                .getUserController()
                .userGroupInfo.mailAddressAliases.some((alias) => alias.mailAddress.endsWith(`@${this.data.domain()}`));
            if (hasAliases) {
                return true;
            }
            else {
                return locator.entityClient
                    .load(CustomerTypeRef, neverNull(locator.logins.getUserController().user.customer))
                    .then((customer) => locator.entityClient.loadAll(GroupInfoTypeRef, customer.userGroups))
                    .then((allUserGroupInfos) => {
                    return allUserGroupInfos.some((u) => neverNull(u.mailAddress).endsWith("@" + this.data.domain()) ||
                        u.mailAddressAliases.some((a) => neverNull(a.mailAddress).endsWith("@" + this.data.domain())));
                });
            }
        });
        return showProgressDialog("pleaseWait_msg", checkMailAddresses).then((nextAllowed) => {
            if (showErrorDialog && !nextAllowed)
                Dialog.message("enforceAliasSetup_msg");
            return nextAllowed;
        });
    }
    isSkipAvailable() {
        return true;
    }
    isEnabled() {
        return true;
    }
    /**
     * Try to add an alias from input field and return true if it succeeded
     */
    async addAliasFromInput() {
        const error = this.errorMessageId;
        if (error) {
            await Dialog.message(error);
            return false;
        }
        else {
            const mailAddressTableModel = this.data.editAliasFormAttrs.model;
            try {
                await showProgressDialog("pleaseWait_msg", 
                // Using default sender name for now
                mailAddressTableModel.addAlias(this.mailAddress, mailAddressTableModel.defaultSenderName()));
                return true;
            }
            catch (e) {
                if (e instanceof InvalidDataError) {
                    await Dialog.message("mailAddressNA_msg");
                }
                else if (e instanceof LimitReachedError) {
                    // ignore
                }
                else if (e instanceof UpgradeRequiredError) {
                    await showPlanUpgradeRequiredDialog(e.plans, e.message);
                }
                else {
                    throw e;
                }
                return false;
            }
        }
    }
}
//# sourceMappingURL=AddEmailAddressesPage.js.map