//@bundleInto:common-min
import { DbError } from "./DbError";
export class IndexingNotSupportedError extends DbError {
    constructor(message, error) {
        super(message, error);
        this.name = "IndexingNotSupportedError";
    }
}
//# sourceMappingURL=IndexingNotSupportedError.js.map