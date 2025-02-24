import m from "mithril";
import { Table } from "../../../common/gui/base/Table.js";
export const DnsRecordTable = Object.freeze({
    ["0" /* DnsRecordType.DNS_RECORD_TYPE_MX */]: "MX" /* ActualDnsRecordType.MX */,
    ["1" /* DnsRecordType.DNS_RECORD_TYPE_TXT_SPF */]: "TXT" /* ActualDnsRecordType.TXT */,
    ["2" /* DnsRecordType.DNS_RECORD_TYPE_CNAME_DKIM */]: "CNAME" /* ActualDnsRecordType.CNAME */,
    ["3" /* DnsRecordType.DNS_RECORD_TYPE_TXT_DMARC */]: "TXT" /* ActualDnsRecordType.TXT */,
    ["4" /* DnsRecordType.DNS_RECORD_TYPE_CNAME_MTA_STS */]: "CNAME" /* ActualDnsRecordType.CNAME */,
    ["5" /* DnsRecordType.DNS_RECORD_TYPE_TXT_VERIFY */]: "TXT" /* ActualDnsRecordType.TXT */,
});
export function createDnsRecordTable(records) {
    return m(Table, {
        columnHeading: ["type_label", "dnsRecordHostOrName_label"],
        columnWidths: [".column-width-small" /* ColumnWidth.Small */, ".column-width-largest" /* ColumnWidth.Largest */],
        showActionButtonColumn: false,
        lines: records.map((r) => ({
            cells: () => [{ main: DnsRecordTable[r.type] }, { main: r.subdomain ? r.subdomain : "@", info: [r.value] }],
        })),
    });
}
//# sourceMappingURL=DnsRecordTable.js.map