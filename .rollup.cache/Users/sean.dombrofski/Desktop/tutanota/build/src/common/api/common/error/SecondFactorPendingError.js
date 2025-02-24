//@bundleInto:common-min
import { TutanotaError } from "@tutao/tutanota-error";
export class SecondFactorPendingError extends TutanotaError {
    data;
    constructor(sessionId, challenges, mailAddress) {
        super("SecondFactorPendingError", "");
        this.data = {
            sessionId,
            challenges,
            mailAddress,
        };
    }
}
//# sourceMappingURL=SecondFactorPendingError.js.map