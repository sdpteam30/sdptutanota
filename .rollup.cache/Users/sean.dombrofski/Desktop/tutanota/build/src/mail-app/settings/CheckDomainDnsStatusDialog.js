import m from "mithril";
import { Dialog } from "../../common/gui/base/Dialog";
import { renderCheckResult } from "./emaildomain/VerifyDnsRecordsPage";
import { assertMainOrNode } from "../../common/api/common/Env";
assertMainOrNode();
/**
 * @pre domainStatus.status.isLoaded() == true
 */
export function showDnsCheckDialog(domainStatus) {
    let dialog = Dialog.showActionDialog({
        type: "EditLarger" /* DialogType.EditLarger */,
        title: "checkDnsRecords_action",
        okActionTextId: "checkAgain_action",
        cancelActionTextId: "close_alt",
        child: () => renderCheckResult(domainStatus, true),
        okAction: () => {
            domainStatus.loadCurrentStatus().then(() => {
                if (domainStatus.areRecordsFine()) {
                    dialog.close();
                }
                else {
                    m.redraw();
                }
            });
        },
    });
}
//# sourceMappingURL=CheckDomainDnsStatusDialog.js.map