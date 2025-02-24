import { lang } from "../../misc/LanguageViewModel";
import { resolveMaybeLazy } from "@tutao/tutanota-utils";
import { assertMainOrNode } from "../common/Env";
import { TutanotaError } from "@tutao/tutanota-error";
assertMainOrNode();
export class UserError extends TutanotaError {
    constructor(message) {
        super("UserError", lang.getTranslationText(resolveMaybeLazy(message)));
    }
}
//# sourceMappingURL=UserError.js.map