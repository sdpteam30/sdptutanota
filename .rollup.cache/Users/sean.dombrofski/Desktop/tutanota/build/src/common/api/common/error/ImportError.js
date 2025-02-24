//@bundleInto:common-min
import { TutanotaError } from "@tutao/tutanota-error";
export class ImportError extends TutanotaError {
    data;
    constructor(error, message, numFailed) {
        super("ImportError", `${message}
Number of failed imports: ${numFailed} First error: ${error}`);
        this.data = {
            numFailed,
        };
    }
    get numFailed() {
        return this.data.numFailed;
    }
}
//# sourceMappingURL=ImportError.js.map