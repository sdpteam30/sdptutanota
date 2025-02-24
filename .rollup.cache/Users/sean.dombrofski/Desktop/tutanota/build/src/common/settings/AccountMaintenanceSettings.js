import m from "mithril";
import { lang } from "../misc/LanguageViewModel.js";
import { DropDownSelector } from "../gui/base/DropDownSelector.js";
import { AuditLogEntryTypeRef, createSurveyData, CustomerPropertiesTypeRef, CustomerTypeRef, GroupInfoTypeRef, } from "../api/entities/sys/TypeRefs.js";
import { ExpandableTable } from "./ExpandableTable.js";
import { showProgressDialog } from "../gui/dialogs/ProgressDialog.js";
import { SettingsExpander } from "./SettingsExpander.js";
import { LoginButton } from "../gui/base/buttons/LoginButton.js";
import { showLeavingUserSurveyWizard } from "../subscription/LeavingUserSurveyWizard.js";
import { SURVEY_VERSION_NUMBER } from "../subscription/LeavingUserSurveyConstants.js";
import { showDeleteAccountDialog } from "../subscription/DeleteAccountDialog.js";
import stream from "mithril/stream";
import { LazyLoaded, neverNull, noOp, ofClass, promiseMap } from "@tutao/tutanota-utils";
import { GENERATED_MAX_ID } from "../api/common/utils/EntityUtils.js";
import { formatDateTime, formatDateTimeFromYesterdayOn } from "../misc/Formatter.js";
import { NotAuthorizedError } from "../api/common/error/RestError.js";
import { Dialog } from "../gui/base/Dialog.js";
import { isUpdateForTypeRef } from "../api/common/utils/EntityUpdateUtils.js";
import { locator } from "../api/main/CommonLocator.js";
export class AccountMaintenanceSettings {
    requirePasswordUpdateAfterReset = false;
    saveIpAddress = false;
    usageDataExpanded = stream(false);
    deleteAccountExpanded = stream(false);
    auditLogLines = [];
    auditLogLoaded = false;
    customer = null;
    customerInfo = new LazyLoaded(() => locator.logins.getUserController().loadCustomerInfo());
    customerProperties = new LazyLoaded(() => locator.entityClient
        .load(CustomerTypeRef, neverNull(locator.logins.getUserController().user.customer))
        .then((customer) => locator.entityClient.load(CustomerPropertiesTypeRef, neverNull(customer.properties))));
    constructor(vnode) {
        vnode.attrs.customerServerProperties.map((props) => {
            this.requirePasswordUpdateAfterReset = props.requirePasswordUpdateAfterReset;
            this.saveIpAddress = props.saveEncryptedIpAddressInSession;
        });
        this.customerProperties.getAsync().then(m.redraw);
        vnode.attrs.setOnUpdateHandler((updates) => this.handleEventUpdates(updates));
        this.view = this.view.bind(this);
        this.updateAuditLog();
    }
    view({ attrs }) {
        const auditLogTableAttrs = {
            columnHeading: ["action_label", "modified_label", "time_label"],
            columnWidths: [".column-width-largest" /* ColumnWidth.Largest */, ".column-width-largest" /* ColumnWidth.Largest */, ".column-width-small" /* ColumnWidth.Small */],
            showActionButtonColumn: true,
            lines: this.auditLogLines,
            addButtonAttrs: {
                title: "refresh_action",
                click: () => showProgressDialog("loading_msg", this.updateAuditLog()).then(() => m.redraw()),
                icon: "Progress" /* BootIcons.Progress */,
                size: 1 /* ButtonSize.Compact */,
            },
        };
        return [
            m(".mt-l", [
                m(".h4", lang.get("security_title")),
                m(DropDownSelector, {
                    label: "saveEncryptedIpAddress_title",
                    helpLabel: () => lang.get("saveEncryptedIpAddress_label"),
                    selectedValue: this.saveIpAddress,
                    selectionChangedHandler: (value) => {
                        const newProps = Object.assign({}, attrs.customerServerProperties(), {
                            saveEncryptedIpAddressInSession: value,
                        });
                        locator.entityClient.update(newProps);
                    },
                    items: [
                        {
                            name: lang.get("yes_label"),
                            value: true,
                        },
                        {
                            name: lang.get("no_label"),
                            value: false,
                        },
                    ],
                    dropdownWidth: 250,
                }),
                locator.logins.getUserController().isGlobalAdmin()
                    ? m("", [
                        locator.logins.getUserController().isPaidAccount()
                            ? m(DropDownSelector, {
                                label: "enforcePasswordUpdate_title",
                                helpLabel: () => lang.get("enforcePasswordUpdate_msg"),
                                selectedValue: this.requirePasswordUpdateAfterReset,
                                selectionChangedHandler: (value) => {
                                    const newProps = Object.assign({}, attrs.customerServerProperties(), {
                                        requirePasswordUpdateAfterReset: value,
                                    });
                                    locator.entityClient.update(newProps);
                                },
                                items: [
                                    {
                                        name: lang.get("yes_label"),
                                        value: true,
                                    },
                                    {
                                        name: lang.get("no_label"),
                                        value: false,
                                    },
                                ],
                                dropdownWidth: 250,
                            })
                            : null,
                        this.customer
                            ? m(".mt-l", m(ExpandableTable, {
                                title: "auditLog_title",
                                table: auditLogTableAttrs,
                                infoMsg: "auditLogInfo_msg",
                                onExpand: () => {
                                    // if the user did not load this when the view was created (i.e. due to a lost connection), attempt to reload it
                                    if (!this.auditLogLoaded) {
                                        showProgressDialog("loading_msg", this.updateAuditLog()).then(() => m.redraw());
                                    }
                                },
                            }))
                            : null,
                    ])
                    : null,
            ]),
            locator.logins.getUserController().isPaidAccount()
                ? m(SettingsExpander, {
                    title: "usageData_label",
                    expanded: this.usageDataExpanded,
                }, this.customerProperties.isLoaded()
                    ? m(DropDownSelector, {
                        label: "customerUsageDataOptOut_label",
                        items: [
                            {
                                name: lang.get("customerUsageDataGloballyDeactivated_label"),
                                value: true,
                            },
                            {
                                name: lang.get("customerUsageDataGloballyPossible_label"),
                                value: false,
                            },
                        ],
                        selectedValue: this.customerProperties.getSync().usageDataOptedOut,
                        selectionChangedHandler: (v) => {
                            if (this.customerProperties.isLoaded()) {
                                const customerProps = this.customerProperties.getSync();
                                customerProps.usageDataOptedOut = v;
                                locator.entityClient.update(customerProps);
                            }
                        },
                        dropdownWidth: 250,
                    })
                    : null)
                : null,
            m(".mb-l", m(SettingsExpander, {
                title: "adminDeleteAccount_action",
                buttonText: "adminDeleteAccount_action",
                expanded: this.deleteAccountExpanded,
            }, m(".flex-center", m("", {
                style: {
                    width: "200px",
                },
            }, m(LoginButton, {
                label: "adminDeleteAccount_action",
                onclick: () => {
                    const isPremium = locator.logins.getUserController().isPaidAccount();
                    showLeavingUserSurveyWizard(isPremium, false).then((reason) => {
                        if (reason.submitted && reason.category && reason.reason) {
                            const surveyData = createSurveyData({
                                category: reason.category,
                                details: reason.details,
                                reason: reason.reason,
                                version: SURVEY_VERSION_NUMBER,
                            });
                            showDeleteAccountDialog(surveyData);
                        }
                        else {
                            showDeleteAccountDialog();
                        }
                    });
                },
            }))))),
        ];
    }
    updateAuditLog() {
        return locator.logins
            .getUserController()
            .loadCustomer()
            .then((customer) => {
            this.customer = customer;
            return locator.entityClient
                .loadRange(AuditLogEntryTypeRef, neverNull(customer.auditLog).items, GENERATED_MAX_ID, 200, true)
                .then((auditLog) => {
                this.auditLogLoaded = true; // indicate that we do not need to reload the list again when we expand
                this.auditLogLines = auditLog.map((auditLogEntry) => {
                    return {
                        cells: [auditLogEntry.action, auditLogEntry.modifiedEntity, formatDateTimeFromYesterdayOn(auditLogEntry.date)],
                        actionButtonAttrs: {
                            title: "showMore_action",
                            icon: "More" /* Icons.More */,
                            click: () => this.showAuditLogDetails(auditLogEntry, customer),
                            size: 1 /* ButtonSize.Compact */,
                        },
                    };
                });
            })
                .finally(m.redraw);
        });
    }
    showAuditLogDetails(entry, customer) {
        let modifiedGroupInfo = stream();
        let groupInfo = stream();
        let groupInfoLoadingPromises = [];
        if (entry.modifiedGroupInfo) {
            groupInfoLoadingPromises.push(locator.entityClient
                .load(GroupInfoTypeRef, entry.modifiedGroupInfo)
                .then((gi) => {
                modifiedGroupInfo(gi);
            })
                .catch(ofClass(NotAuthorizedError, () => {
                // If the admin is removed from the free group, he does not have the permission to access the groupinfo of that group anymore
            })));
        }
        if (entry.groupInfo) {
            groupInfoLoadingPromises.push(locator.entityClient
                .load(GroupInfoTypeRef, entry.groupInfo)
                .then((gi) => {
                groupInfo(gi);
            })
                .catch(ofClass(NotAuthorizedError, () => {
                // If the admin is removed from the free group, he does not have the permission to access the groupinfo of that group anymore
            })));
        }
        Promise.all(groupInfoLoadingPromises).then(() => {
            const groupInfoValue = groupInfo();
            let dialog = Dialog.showActionDialog({
                title: "auditLog_title",
                child: {
                    view: () => m("table.pt", [
                        m("tr", [m("td", lang.get("action_label")), m("td.pl", entry.action)]),
                        m("tr", [m("td", lang.get("actor_label")), m("td.pl", entry.actorMailAddress)]),
                        m("tr", [m("td", lang.get("IpAddress_label")), m("td.pl", entry.actorIpAddress ? entry.actorIpAddress : "")]),
                        m("tr", [
                            m("td", lang.get("modified_label")),
                            m("td.pl", modifiedGroupInfo() && this.getGroupInfoDisplayText(modifiedGroupInfo())
                                ? this.getGroupInfoDisplayText(modifiedGroupInfo())
                                : entry.modifiedEntity),
                        ]),
                        groupInfoValue
                            ? m("tr", [
                                m("td", lang.get("group_label")),
                                m("td.pl", customer.adminGroup === groupInfoValue.group
                                    ? lang.get("globalAdmin_label")
                                    : this.getGroupInfoDisplayText(groupInfoValue)),
                            ])
                            : null,
                        m("tr", [m("td", lang.get("time_label")), m("td.pl", formatDateTime(entry.date))]),
                    ]),
                },
                allowOkWithReturn: true,
                okAction: () => dialog.close(),
                allowCancel: false,
            });
        });
    }
    getGroupInfoDisplayText(groupInfo) {
        if (groupInfo.name && groupInfo.mailAddress) {
            return groupInfo.name + " <" + groupInfo.mailAddress + ">";
        }
        else if (groupInfo.mailAddress) {
            return groupInfo.mailAddress;
        }
        else {
            return groupInfo.name;
        }
    }
    handleEventUpdates(updates) {
        return promiseMap(updates, (update) => {
            if (isUpdateForTypeRef(AuditLogEntryTypeRef, update)) {
                return this.updateAuditLog();
            }
            else if (isUpdateForTypeRef(CustomerPropertiesTypeRef, update)) {
                this.customerProperties.reset();
                this.customerProperties.getAsync().then(m.redraw);
            }
        }).then(noOp);
    }
}
//# sourceMappingURL=AccountMaintenanceSettings.js.map