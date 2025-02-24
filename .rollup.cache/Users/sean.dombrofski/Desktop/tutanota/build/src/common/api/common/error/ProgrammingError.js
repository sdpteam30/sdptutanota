//@bundleInto:common-min
import { TutanotaError } from "@tutao/tutanota-error";
export class ProgrammingError extends TutanotaError {
    constructor(m) {
        super("ProgrammingError", m ?? "Unkown programming error");
    }
}
//# sourceMappingURL=ProgrammingError.js.map