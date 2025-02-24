import { DomainDnsStatus } from "../DomainDnsStatus";
import m from "mithril";
import { assertEnumValue, CustomDomainCheckResult } from "../../../common/api/common/TutanotaConstants";
import { lang } from "../../../common/misc/LanguageViewModel";
import { Dialog } from "../../../common/gui/base/Dialog";
import { emitWizardEvent } from "../../../common/gui/base/WizardDialog.js";
import { Button } from "../../../common/gui/base/Button.js";
import { assertMainOrNode } from "../../../common/api/common/Env";
import { downcast } from "@tutao/tutanota-utils";
import { Table } from "../../../common/gui/base/Table.js";
import { DnsRecordTable } from "./DnsRecordTable.js";
import { LoginButton } from "../../../common/gui/base/buttons/LoginButton.js";
import { MoreInfoLink } from "../../../common/misc/news/MoreInfoLink.js";
assertMainOrNode();
/** Wizard page which can verify DNS records for custom email domain. */
export class VerifyDnsRecordsPage {
    oncreate(vnode) {
        const data = vnode.attrs.data;
        data.domainStatus = new DomainDnsStatus(data.domain());
        _updateDnsStatus(data.domainStatus);
    }
    view(vnode) {
        const a = vnode.attrs;
        return [
            m("h4.mt-l.text-center", lang.get("verifyDNSRecords_title")),
            m("p", lang.get("verifyDNSRecords_msg")),
            a.data.domainStatus.status.isLoaded()
                ? m("", [
                    renderCheckResult(a.data.domainStatus),
                    m(".flex-center.full-width.pt-l.mb-l", m(LoginButton, {
                        label: "finish_action",
                        class: "small-login-button",
                        // We check if all DNS records are set correctly and let the user confirm before leaving if not
                        onclick: () => this._finishDialog(a.data, downcast(vnode)?.dom ?? null),
                    })),
                ])
                : m("", [
                    lang.get("loadingDNSRecords_msg"),
                    m(".flex-center.full-width.pt-l.mb-l", m(Button, {
                        type: "secondary" /* ButtonType.Secondary */,
                        label: "refresh_action",
                        click: () => _updateDnsStatus(a.data.domainStatus),
                    })),
                ]),
        ];
    }
    _finishDialog(data, dom) {
        const leaveUnfinishedDialogAttrs = {
            title: "quitSetup_title",
            child: {
                view: () => {
                    return [m("p", lang.get("quitDNSSetup_msg"))];
                },
            },
            okAction: (dialog) => {
                dialog.close();
                emitWizardEvent(dom, "closeWizardDialog" /* WizardEventType.CLOSE_DIALOG */);
            },
        };
        return _updateDnsStatus(data.domainStatus).then(() => {
            if (data.domainStatus.areRecordsFine()) {
                emitWizardEvent(dom, "showNextWizardDialogPage" /* WizardEventType.SHOW_NEXT_PAGE */); // The wizard will close the dialog as this is the last page
            }
            else {
                Dialog.showActionDialog(leaveUnfinishedDialogAttrs);
            }
        });
    }
}
function _updateDnsStatus(domainStatus) {
    return domainStatus.loadCurrentStatus().then(() => {
        m.redraw();
    });
}
function _getDisplayableRecordValue(record) {
    if (!record.value.endsWith(".") &&
        (record.type === "0" /* DnsRecordType.DNS_RECORD_TYPE_MX */ ||
            record.type === "2" /* DnsRecordType.DNS_RECORD_TYPE_CNAME_DKIM */ ||
            record.type === "4" /* DnsRecordType.DNS_RECORD_TYPE_CNAME_MTA_STS */)) {
        return record.value + ".";
    }
    return record.value;
}
export function createDnsRecordTableN(records, refreshButtonAttrs) {
    return m(Table, {
        columnHeading: ["type_label", "dnsRecordHostOrName_label", "dnsRecordValueOrPointsTo_label"],
        addButtonAttrs: refreshButtonAttrs,
        columnWidths: [".column-width-small" /* ColumnWidth.Small */, ".column-width-small" /* ColumnWidth.Small */, ".column-width-largest" /* ColumnWidth.Largest */],
        showActionButtonColumn: true,
        lines: records.map((r) => {
            return {
                cells: () => [
                    {
                        main: DnsRecordTable[r.record.type],
                    },
                    {
                        main: r.record.subdomain ? r.record.subdomain : "@",
                    },
                    {
                        main: r.record.value,
                        info: r.helpInfo,
                    },
                ],
            };
        }),
    });
}
export function renderCheckResult(domainStatus, hideRefreshButton = false) {
    const checkReturn = domainStatus.getLoadedCustomDomainCheckGetOut();
    const { requiredRecords, missingRecords, invalidRecords } = checkReturn;
    const checkResult = assertEnumValue(CustomDomainCheckResult, checkReturn.checkResult);
    if (checkResult === CustomDomainCheckResult.CUSTOM_DOMAIN_CHECK_RESULT_OK) {
        const validatedRecords = requiredRecords.map((record) => {
            const displayableRecordValue = _getDisplayableRecordValue(record);
            const helpInfo = [];
            let validatedRecord = null;
            for (let missingRecord of findDnsRecordInList(record, missingRecords)) {
                validatedRecord = record;
                if (record.type === "3" /* DnsRecordType.DNS_RECORD_TYPE_TXT_DMARC */) {
                    helpInfo.push(`${"\u2717" /* DnsRecordValidation.BAD */} ${lang.get("recommendedDNSValue_label")}: ${displayableRecordValue}`);
                }
                else {
                    helpInfo.push(`${"\u2717" /* DnsRecordValidation.BAD */} ${lang.get("addDNSValue_label")}: ${displayableRecordValue}`);
                }
            }
            for (let invalidRecord of findDnsRecordInList(record, invalidRecords)) {
                validatedRecord = record;
                // here we want to display the incorrect value!
                helpInfo.push(`${"\u2717" /* DnsRecordValidation.BAD */} ${lang.get("removeDNSValue_label")}: ${invalidRecord.value}`);
            }
            if (validatedRecord == null) {
                validatedRecord = record;
                helpInfo.push(`${"\u2713" /* DnsRecordValidation.OK */} ${lang.get("correctDNSValue_label")}`);
            }
            validatedRecord.value = displayableRecordValue;
            return {
                record: validatedRecord,
                helpInfo,
            };
        });
        return [
            m(".mt-m.mb-s", lang.get("setDnsRecords_msg")),
            createDnsRecordTableN(validatedRecords, hideRefreshButton
                ? null
                : {
                    title: "refresh_action",
                    icon: "Progress" /* BootIcons.Progress */,
                    size: 1 /* ButtonSize.Compact */,
                    click: () => _updateDnsStatus(domainStatus),
                }),
            m(MoreInfoLink, { link: "https://tuta.com/faq#custom-domain" /* InfoLink.DomainInfo */, class: "mt-m", isSmall: true }),
        ];
    }
    else {
        const errorMessageMap = {
            [CustomDomainCheckResult.CUSTOM_DOMAIN_CHECK_RESULT_OK]: "emptyString_msg",
            [CustomDomainCheckResult.CUSTOM_DOMAIN_CHECK_RESULT_DNS_LOOKUP_FAILED]: "customDomainErrorDnsLookupFailure_msg",
            [CustomDomainCheckResult.CUSTOM_DOMAIN_CHECK_RESULT_DOMAIN_NOT_FOUND]: "customDomainErrorDomainNotFound_msg",
            [CustomDomainCheckResult.CUSTOM_DOMAIN_CHECK_RESULT_NAMESERVER_NOT_FOUND]: "customDomainErrorNameserverNotFound_msg",
        };
        return lang.get(errorMessageMap[checkResult]);
    }
}
function findDnsRecordInList(record, recordList) {
    return recordList.filter((r) => r.type === record.type && r.subdomain === record.subdomain);
}
export class VerifyDnsRecordsPageAttrs {
    data;
    constructor(domainData) {
        this.data = domainData;
    }
    headerTitle() {
        return "domainSetup_title";
    }
    nextAction(showErrorDialog) {
        // No need to do anything, as we are leaving the wizard
        // The gui component will display a confirmation dialog if DNS configuration is not ok.
        // So it is ok not to have this dialog when called from elsewhere.
        return Promise.resolve(true);
    }
    isSkipAvailable() {
        return false;
    }
    isEnabled() {
        return true;
    }
}
//# sourceMappingURL=VerifyDnsRecordsPage.js.map