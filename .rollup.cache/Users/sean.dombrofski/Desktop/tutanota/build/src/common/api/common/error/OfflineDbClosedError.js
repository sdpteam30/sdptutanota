//@bundleInto:common-min
import { TutanotaError } from "@tutao/tutanota-error";
export class OfflineDbClosedError extends TutanotaError {
    constructor(msg) {
        super("OfflineDbClosedError", msg ?? "Offline db is closed");
    }
}
//# sourceMappingURL=OfflineDbClosedError.js.map