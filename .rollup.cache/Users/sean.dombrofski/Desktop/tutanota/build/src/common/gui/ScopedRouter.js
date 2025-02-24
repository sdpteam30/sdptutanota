import { throttleRoute } from "../misc/RouteChange.js";
import m from "mithril";
import { debounceStart } from "@tutao/tutanota-utils";
import { ProgrammingError } from "../api/common/error/ProgrammingError.js";
export class ThrottledRouter {
    throttledRoute = debounceStart(32, throttleRoute());
    getFullPath() {
        return m.route.get();
    }
    routeTo(path, params) {
        this.throttledRoute(path, params);
    }
}
/** router that is scoped to a specific prefix and will ignore the path changes outside of it */
export class ScopedRouter {
    router;
    scope;
    constructor(router, scope) {
        this.router = router;
        if (!scope.startsWith("/")) {
            throw new ProgrammingError(`Scope must start with a forward slash! got: ${scope}`);
        }
        if (scope.split("/").length > 2) {
            throw new ProgrammingError(`Does not support nested scopes yet. Easter egg! got: ${scope}`);
        }
        this.scope = scope.substring(1);
    }
    getFullPath() {
        return this.router.getFullPath();
    }
    routeTo(path, params) {
        if (routeMatchesPrefix(this.scope, this.router.getFullPath())) {
            this.router.routeTo(path, params);
        }
    }
}
export function routeMatchesPrefix(prefixWithoutLeadingSlash, route) {
    const { path } = m.parsePathname(route);
    return path.split("/")[1] === prefixWithoutLeadingSlash;
}
//# sourceMappingURL=ScopedRouter.js.map