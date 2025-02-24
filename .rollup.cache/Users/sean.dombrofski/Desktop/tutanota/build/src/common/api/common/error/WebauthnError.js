//@bundleInto:common-min
import { TutanotaError } from "@tutao/tutanota-error";
export class WebauthnError extends TutanotaError {
    constructor(error) {
        super("WebauthnError", `${error.name} ${String(error)}`);
    }
}
//# sourceMappingURL=WebauthnError.js.map