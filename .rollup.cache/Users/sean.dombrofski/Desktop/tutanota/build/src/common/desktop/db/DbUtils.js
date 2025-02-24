import path from "node:path";
import { app } from "electron";
export function makeDbPath(dbName) {
    return path.join(app.getPath("userData"), `${dbName}.sqlite`);
}
//# sourceMappingURL=DbUtils.js.map