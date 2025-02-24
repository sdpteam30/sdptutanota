import stream from "mithril/stream";
import { createDnsRecord } from "../../../common/api/entities/sys/TypeRefs.js";
import { AddEmailAddressesPage, AddEmailAddressesPageAttrs } from "./AddEmailAddressesPage";
import { DomainDnsStatus } from "../DomainDnsStatus";
import { VerifyOwnershipPage, VerifyOwnershipPageAttrs } from "./VerifyOwnershipPage";
import { VerifyDnsRecordsPage, VerifyDnsRecordsPageAttrs } from "./VerifyDnsRecordsPage";
import { EnterDomainPage, EnterDomainPageAttrs } from "./EnterDomainPage";
import { createWizardDialog, wizardPageWrapper } from "../../../common/gui/base/WizardDialog.js";
import { assertMainOrNode } from "../../../common/api/common/Env";
assertMainOrNode();
/** Shows a wizard for adding a custom email domain. */
export function showAddDomainWizard(domain, customerInfo, mailAddressTableModel) {
    let mailAddressTableExpanded = false;
    const domainData = {
        domain: stream(domain),
        customerInfo: customerInfo,
        // will be filled oncreate by the page
        // not actually spf, but the type TXT only matters here
        expectedVerificationRecord: createDnsRecord({ subdomain: null, type: "1" /* DnsRecordType.DNS_RECORD_TYPE_TXT_SPF */, value: "" }),
        editAliasFormAttrs: {
            model: mailAddressTableModel,
            expanded: mailAddressTableExpanded,
            onExpanded: (newExpanded) => (mailAddressTableExpanded = newExpanded),
        },
        domainStatus: new DomainDnsStatus(domain),
    };
    const wizardPages = [
        wizardPageWrapper(EnterDomainPage, new EnterDomainPageAttrs(domainData)),
        wizardPageWrapper(VerifyOwnershipPage, new VerifyOwnershipPageAttrs(domainData)),
        wizardPageWrapper(AddEmailAddressesPage, new AddEmailAddressesPageAttrs(domainData)),
        wizardPageWrapper(VerifyDnsRecordsPage, new VerifyDnsRecordsPageAttrs(domainData)),
    ];
    return new Promise((resolve) => {
        const wizardBuilder = createWizardDialog(domainData, wizardPages, () => {
            mailAddressTableModel.dispose();
            resolve();
            return Promise.resolve();
        }, "EditLarge" /* DialogType.EditLarge */);
        const wizard = wizardBuilder.dialog;
        const wizardAttrs = wizardBuilder.attrs;
        wizard.show();
        // we can skip the next two pages because we assume that the domain is already assigned if it was passed to the wizard
        if (domain.length) {
            wizardAttrs.goToNextPageOrCloseWizard();
            wizardAttrs.goToNextPageOrCloseWizard();
            if (wizardAttrs.currentPage) {
                // skip add email address page if an email address has been assigned
                wizardAttrs.currentPage.attrs.nextAction(false).then((ready) => {
                    if (ready)
                        wizardAttrs.goToNextPageOrCloseWizard();
                });
            }
        }
    });
}
//# sourceMappingURL=AddDomainWizard.js.map