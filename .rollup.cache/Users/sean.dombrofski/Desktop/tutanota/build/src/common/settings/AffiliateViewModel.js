import { locator } from "../api/main/CommonLocator.js";
import { AffiliatePartnerKpiService } from "../api/entities/sys/Services.js";
/**
 * Class containing state of the affiliate model.
 */
export class AffiliateViewModel {
    constructor() { }
    get isLoading() {
        return this._isLoading;
    }
    get data() {
        return this._data;
    }
    serviceExecutor = locator.serviceExecutor;
    _data = null;
    _isLoading = true;
    async load() {
        try {
            this._data = await this.serviceExecutor.get(AffiliatePartnerKpiService, null);
        }
        finally {
            this._isLoading = false;
        }
    }
}
//# sourceMappingURL=AffiliateViewModel.js.map