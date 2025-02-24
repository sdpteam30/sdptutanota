import { getRestriction, getSearchParameters } from "../../../mail-app/search/model/SearchUtils.js";
import m from "mithril";
import { memoizedWithHiddenArgument } from "@tutao/tutanota-utils";
export class SearchRouter {
    router;
    constructor(router) {
        this.router = router;
    }
    getRestriction = memoizedWithHiddenArgument(() => m.route.get(), getRestriction);
    routeTo(query, restriction, selectionKey = null) {
        const { path, params } = getSearchParameters(query, restriction, selectionKey);
        this.router.routeTo(path, params);
    }
}
//# sourceMappingURL=SearchRouter.js.map