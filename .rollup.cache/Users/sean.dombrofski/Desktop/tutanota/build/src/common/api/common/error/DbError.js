//@bundleInto:common-min
import { TutanotaError } from "@tutao/tutanota-error";
export class DbError extends TutanotaError {
    error;
    /**
     * A db error is thrown from indexeddb
     * @param message An information about the exception.
     * @param error The original error that was thrown.
     */
    constructor(message, error) {
        super("DbError", error ? message + `: ${error.name}, ${error.message}> ` + (error.stack ? error.stack : error.message) : message);
        this.error = error ?? null;
    }
}
//# sourceMappingURL=DbError.js.map