import { TutanotaError } from "@tutao/tutanota-error";
import { assertMainOrNode } from "../common/Env";
assertMainOrNode();
/**
 * Thrown when the user is trying to go over their plan limits.
 */
export class UpgradeRequiredError extends TutanotaError {
    message;
    plans;
    /**
     * @param message TranslationKey of a message for the user.
     * @param plans Array of AvailablePlanTypes the user can upgrade to in order to be able to do what they are trying to do.
     */
    constructor(message, plans) {
        super("UpgradeRequiredError", message);
        this.message = message;
        this.plans = plans;
    }
}
//# sourceMappingURL=UpgradeRequiredError.js.map