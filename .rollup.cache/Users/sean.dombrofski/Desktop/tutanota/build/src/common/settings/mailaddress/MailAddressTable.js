import m from "mithril";
import { Dialog } from "../../gui/base/Dialog.js";
import { Table } from "../../gui/base/Table.js";
import { lang } from "../../misc/LanguageViewModel.js";
import { LimitReachedError } from "../../api/common/error/RestError.js";
import { ofClass } from "@tutao/tutanota-utils";
import { showProgressDialog } from "../../gui/dialogs/ProgressDialog.js";
import { ExpanderButton, ExpanderPanel } from "../../gui/base/Expander.js";
import { attachDropdown } from "../../gui/base/Dropdown.js";
import { showNotAvailableForFreeDialog, showPlanUpgradeRequiredDialog } from "../../misc/SubscriptionDialogs.js";
import { assertMainOrNode } from "../../api/common/Env.js";
import { AddressStatus } from "./MailAddressTableModel.js";
import { showAddAliasDialog } from "./AddAliasDialog.js";
import { locator } from "../../api/main/CommonLocator.js";
import { UpgradeRequiredError } from "../../api/main/UpgradeRequiredError.js";
assertMainOrNode();
/** Shows a table with all aliases and ability to enable/disable them, add more and set names. */
export class MailAddressTable {
    view({ attrs }) {
        const { model } = attrs;
        // If the table is expanded we need to init the model.
        // It is no-op to init multiple times so it's safe.
        if (attrs.expanded) {
            model.init();
        }
        const addAliasButtonAttrs = model.userCanModifyAliases()
            ? {
                title: "addEmailAlias_label",
                click: () => this.onAddAlias(attrs),
                icon: "Add" /* Icons.Add */,
                size: 1 /* ButtonSize.Compact */,
            }
            : null;
        return [
            m(".flex-space-between.items-center.mt-l.mb-s", [
                m(".h4", lang.get("mailAddresses_label")),
                m(ExpanderButton, {
                    label: "show_action",
                    expanded: attrs.expanded,
                    onExpandedChange: (v) => {
                        attrs.onExpanded(v);
                    },
                }),
            ]),
            m(ExpanderPanel, {
                expanded: attrs.expanded,
            }, m(Table, {
                columnHeading: ["mailAddress_label", "state_label"],
                columnWidths: [".column-width-largest" /* ColumnWidth.Largest */, ".column-width-small" /* ColumnWidth.Small */],
                showActionButtonColumn: true,
                addButtonAttrs: addAliasButtonAttrs,
                lines: getAliasLineAttrs(attrs),
            })),
            model.aliasCount
                ? [
                    m(".mt-s", lang.get("amountUsedAndActivatedOf_label", {
                        "{used}": model.aliasCount.usedAliases,
                        "{active}": model.aliasCount.enabledAliases,
                        "{totalAmount}": model.aliasCount.totalAliases,
                    })),
                    m(".small.mt-s", lang.get(model.aliasLimitIncludesCustomDomains() ? "mailAddressInfoLegacy_msg" : "mailAddressInfo_msg")),
                ]
                : null,
        ];
    }
    async onAddAlias(attrs) {
        const userController = locator.logins.getUserController();
        if (userController.isFreeAccount()) {
            showNotAvailableForFreeDialog();
        }
        else {
            const isNewPaidPlan = await userController.isNewPaidPlan();
            showAddAliasDialog(attrs.model, isNewPaidPlan);
        }
    }
}
function setNameDropdownButton(model, addressInfo) {
    return {
        label: "setSenderName_action",
        click: () => showSenderNameChangeDialog(model, addressInfo),
    };
}
function addressDropdownButtons(attrs, addressInfo) {
    switch (addressInfo.status) {
        case AddressStatus.Primary:
            return [setNameDropdownButton(attrs.model, addressInfo)];
        case AddressStatus.Alias: {
            const buttons = [setNameDropdownButton(attrs.model, addressInfo)];
            if (attrs.model.userCanModifyAliases()) {
                buttons.push({
                    label: "deactivate_action",
                    click: () => {
                        switchAliasStatus(addressInfo, attrs);
                    },
                });
            }
            return buttons;
        }
        case AddressStatus.DisabledAlias: {
            return attrs.model.userCanModifyAliases()
                ? [
                    {
                        label: "activate_action",
                        click: () => {
                            switchAliasStatus(addressInfo, attrs);
                        },
                    },
                ]
                : [];
        }
        case AddressStatus.Custom: {
            const buttons = [setNameDropdownButton(attrs.model, addressInfo)];
            if (attrs.model.userCanModifyAliases()) {
                buttons.push({
                    label: "delete_action",
                    click: () => {
                        switchAliasStatus(addressInfo, attrs);
                    },
                });
            }
            return buttons;
        }
    }
}
function statusLabel(addressInfo) {
    switch (addressInfo.status) {
        case AddressStatus.Primary:
            return lang.get("primaryMailAddress_label");
        case AddressStatus.Alias:
        case AddressStatus.Custom:
            return lang.get("activated_label");
        case AddressStatus.DisabledAlias:
            return lang.get("deactivated_label");
    }
}
export function getAliasLineAttrs(attrs) {
    return attrs.model.addresses().map((addressInfo) => {
        const dropdownButtons = addressDropdownButtons(attrs, addressInfo);
        // do not display the "more" button if there are no available actions
        const actionButtonAttrs = dropdownButtons.length === 0
            ? null
            : attachDropdown({
                mainButtonAttrs: {
                    title: "edit_action",
                    icon: "More" /* Icons.More */,
                    size: 1 /* ButtonSize.Compact */,
                },
                showDropdown: () => true,
                width: 250,
                childAttrs: () => dropdownButtons,
            });
        return {
            cells: () => [{ main: addressInfo.address, info: [addressInfo.name] }, { main: statusLabel(addressInfo) }],
            actionButtonAttrs: actionButtonAttrs,
        };
    });
}
async function switchAliasStatus(alias, attrs) {
    const deactivateOrDeleteAlias = alias.status !== AddressStatus.DisabledAlias;
    if (deactivateOrDeleteAlias) {
        // alias from custom domains will be deleted. Tutanota aliases will be deactivated
        const message = alias.status === AddressStatus.Custom ? "deleteAlias_msg" : "deactivateAlias_msg";
        const confirmed = await Dialog.confirm(lang.getTranslation(message, {
            "{1}": alias.address,
        }));
        if (!confirmed) {
            return;
        }
    }
    const updateModel = attrs.model
        .setAliasStatus(alias.address, !deactivateOrDeleteAlias)
        .catch(ofClass(LimitReachedError, () => attrs.model.handleTooManyAliases()))
        .catch(ofClass(UpgradeRequiredError, (e) => showPlanUpgradeRequiredDialog(e.plans, e.message)));
    await showProgressDialog("pleaseWait_msg", updateModel);
}
function showSenderNameChangeDialog(model, alias) {
    Dialog.showTextInputDialog({
        title: "edit_action",
        label: "mailName_label",
        infoMsgId: lang.makeTranslation("alias_addr", alias.address),
        defaultValue: alias.name,
    }).then((newName) => showProgressDialog("pleaseWait_msg", model.setAliasName(alias.address, newName)));
}
//# sourceMappingURL=MailAddressTable.js.map