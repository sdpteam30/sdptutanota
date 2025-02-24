//@bundleInto:common-min
import { TutanotaError } from "@tutao/tutanota-error";
export class ExportError extends TutanotaError {
    data;
    // data field is respected by the WorkerProtocol. Other fields might not be passed
    constructor(msg, data) {
        super("ExportError", msg);
        this.data = data;
    }
}
//# sourceMappingURL=ExportError.js.map