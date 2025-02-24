//@bundleInto:common-min
import { DbError } from "./DbError";
/**
 * Error used to indicate that there's insufficient space on the device.
 */
export class QuotaExceededError extends DbError {
    constructor(message, error) {
        super(message, error ?? undefined);
        this.name = "QuotaExceededError";
    }
}
//# sourceMappingURL=QuotaExceededError.js.map