//@bundleInto:common-min
import { TutanotaError } from "@tutao/tutanota-error";
export class MailImportError extends TutanotaError {
    data;
    constructor(data) {
        super("MailImportError", `Failed to import mails`);
        this.data = data;
    }
}
//# sourceMappingURL=MailImportError.js.map