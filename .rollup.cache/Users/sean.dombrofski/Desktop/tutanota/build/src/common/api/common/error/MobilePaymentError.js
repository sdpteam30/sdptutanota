import { TutanotaError } from "@tutao/tutanota-error";
/**
 * An error related to mobile payments.
 */
export class MobilePaymentError extends TutanotaError {
    constructor(message) {
        super("MobilePaymentError", message);
    }
}
//# sourceMappingURL=MobilePaymentError.js.map