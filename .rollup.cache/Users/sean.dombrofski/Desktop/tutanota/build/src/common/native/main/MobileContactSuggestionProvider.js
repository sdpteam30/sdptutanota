import { PermissionError } from "../../api/common/error/PermissionError";
export class MobileContactSuggestionProvider {
    mobileContactsFacade;
    gotPermissionError = false;
    constructor(mobileContactsFacade) {
        this.mobileContactsFacade = mobileContactsFacade;
    }
    async getContactSuggestions(query) {
        if (this.gotPermissionError) {
            return [];
        }
        try {
            return await this.mobileContactsFacade.findSuggestions(query);
        }
        catch (e) {
            if (e instanceof PermissionError) {
                this.gotPermissionError = true;
                return [];
            }
            else {
                throw e;
            }
        }
    }
}
//# sourceMappingURL=MobileContactSuggestionProvider.js.map