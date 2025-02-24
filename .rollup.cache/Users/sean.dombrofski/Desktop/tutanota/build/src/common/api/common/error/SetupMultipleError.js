//@bundleInto:common-min
import { TutanotaError } from "@tutao/tutanota-error";
//Error cannot be serialized to be passed between worker and main thread
export class SetupMultipleError extends TutanotaError {
    errors;
    failedInstances;
    constructor(message, errors, instances) {
        super("SetupMultipleError", `${message}
Number of errors: ${errors.length}
First error: ${errors[0]}`);
        this.errors = errors;
        this.failedInstances = instances;
    }
}
//# sourceMappingURL=SetupMultipleError.js.map