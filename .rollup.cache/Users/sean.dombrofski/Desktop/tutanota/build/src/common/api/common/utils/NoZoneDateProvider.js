import { ProgrammingError } from "../error/ProgrammingError.js";
export class NoZoneDateProvider {
    now() {
        return Date.now();
    }
    timeZone() {
        throw new ProgrammingError("timeZone is not available in worker");
    }
}
//# sourceMappingURL=NoZoneDateProvider.js.map