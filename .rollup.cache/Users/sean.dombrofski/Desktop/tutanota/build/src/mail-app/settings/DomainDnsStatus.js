import { createCustomDomainCheckGetIn } from "../../common/api/entities/sys/TypeRefs.js";
import { CustomDomainCheckResult } from "../../common/api/common/TutanotaConstants";
import { LazyLoaded, noOp } from "@tutao/tutanota-utils";
import { lang } from "../../common/misc/LanguageViewModel";
import { assertMainOrNode } from "../../common/api/common/Env";
import { locator } from "../../common/api/main/CommonLocator";
import { CustomDomainCheckService } from "../../common/api/entities/sys/Services";
assertMainOrNode();
export class DomainDnsStatus {
    status;
    domain;
    constructor(cleanDomainName, customerId) {
        this.domain = cleanDomainName;
        this.status = new LazyLoaded(() => {
            let data = createCustomDomainCheckGetIn({
                domain: cleanDomainName,
                customer: customerId ?? null,
            });
            return locator.serviceExecutor.get(CustomDomainCheckService, data);
        });
    }
    getLoadedCustomDomainCheckGetOut() {
        return this.status.getLoaded();
    }
    /**
     * Only checks for the required records (MX and spf) to be fine.
     * We have this less strict check because one can already use the custom domain (with limitations) even if certain records like dmarc are not yet set properly.
     * We want to allow finishing the dialogs succesfully even if just these basic check pass.
     * @returns {boolean} true if records are fine.
     */
    areRecordsFine() {
        if (!this.status.isLoaded() || this.status.getLoaded().checkResult !== CustomDomainCheckResult.CUSTOM_DOMAIN_CHECK_RESULT_OK) {
            return false;
        }
        const requiredMissingRecords = this.status
            .getLoaded()
            .missingRecords.filter((r) => r.type === "0" /* DnsRecordType.DNS_RECORD_TYPE_MX */ || r.type === "1" /* DnsRecordType.DNS_RECORD_TYPE_TXT_SPF */);
        return !requiredMissingRecords.length;
    }
    /**
     * Checks that ALL records are fine. Even the ones that are only recommended.
     * We need this check on top of areRecordsFine() because we want to display if some records are not yet set correctly even if the domain can already be used.
     * @returns {boolean} true if all records are fine.
     */
    areAllRecordsFine() {
        return (this.status.isLoaded() &&
            this.status.getLoaded().checkResult === CustomDomainCheckResult.CUSTOM_DOMAIN_CHECK_RESULT_OK &&
            this.status.getLoaded().missingRecords.length === 0 &&
            this.status.getLoaded().invalidRecords.length === 0);
    }
    getDnsStatusInfo() {
        if (this.status.isLoaded()) {
            let result = this.status.getLoaded();
            if (result.checkResult === CustomDomainCheckResult.CUSTOM_DOMAIN_CHECK_RESULT_OK) {
                let mxOk = !result.missingRecords.some((r) => r.type === "0" /* DnsRecordType.DNS_RECORD_TYPE_MX */) &&
                    !result.invalidRecords.some((r) => r.type === "0" /* DnsRecordType.DNS_RECORD_TYPE_MX */);
                let spfOk = !result.missingRecords.some((r) => r.type === "1" /* DnsRecordType.DNS_RECORD_TYPE_TXT_SPF */) &&
                    !result.invalidRecords.some((r) => r.type === "1" /* DnsRecordType.DNS_RECORD_TYPE_TXT_SPF */);
                let dkimOk = !result.missingRecords.some((r) => r.type === "2" /* DnsRecordType.DNS_RECORD_TYPE_CNAME_DKIM */) &&
                    !result.invalidRecords.some((r) => r.type === "2" /* DnsRecordType.DNS_RECORD_TYPE_CNAME_DKIM */);
                let mtaStsOk = !result.missingRecords.some((r) => r.type === "4" /* DnsRecordType.DNS_RECORD_TYPE_CNAME_MTA_STS */) &&
                    !result.invalidRecords.some((r) => r.type === "4" /* DnsRecordType.DNS_RECORD_TYPE_CNAME_MTA_STS */);
                let dmarcWarn = result.missingRecords.find((r) => r.type === "3" /* DnsRecordType.DNS_RECORD_TYPE_TXT_DMARC */);
                let dmarcBad = result.invalidRecords.find((r) => r.type === "3" /* DnsRecordType.DNS_RECORD_TYPE_TXT_DMARC */);
                return ("MX " +
                    (mxOk ? "\u2713" /* DnsRecordValidation.OK */ : "\u2717" /* DnsRecordValidation.BAD */) +
                    ", SPF " +
                    (spfOk ? "\u2713" /* DnsRecordValidation.OK */ : "\u2717" /* DnsRecordValidation.BAD */) +
                    ", MTA-STS " +
                    (mtaStsOk ? "\u2713" /* DnsRecordValidation.OK */ : "\u2717" /* DnsRecordValidation.BAD */) +
                    ", DKIM " +
                    (dkimOk ? "\u2713" /* DnsRecordValidation.OK */ : "\u2717" /* DnsRecordValidation.BAD */) +
                    ", DMARC " +
                    (dmarcBad || dmarcWarn ? "\u2717" /* DnsRecordValidation.BAD */ : "\u2713" /* DnsRecordValidation.OK */));
            }
            else {
                return "DNS " + "\u2717" /* DnsRecordValidation.BAD */;
            }
        }
        else {
            return lang.get("loading_msg");
        }
    }
    loadCurrentStatus() {
        if (this.status.isLoaded()) {
            // keep the old status as long as checking again
            return this.status.reload().then(noOp);
        }
        else {
            return this.status.getAsync().then(noOp);
        }
    }
}
//# sourceMappingURL=DomainDnsStatus.js.map