/* generated file, don't edit. */
export class MobilePaymentsFacadeSendDispatcher {
    transport;
    constructor(transport) {
        this.transport = transport;
    }
    async requestSubscriptionToPlan(...args) {
        return this.transport.invokeNative("ipc", ["MobilePaymentsFacade", "requestSubscriptionToPlan", ...args]);
    }
    async getPlanPrices(...args) {
        return this.transport.invokeNative("ipc", ["MobilePaymentsFacade", "getPlanPrices", ...args]);
    }
    async showSubscriptionConfigView(...args) {
        return this.transport.invokeNative("ipc", ["MobilePaymentsFacade", "showSubscriptionConfigView", ...args]);
    }
    async queryAppStoreSubscriptionOwnership(...args) {
        return this.transport.invokeNative("ipc", ["MobilePaymentsFacade", "queryAppStoreSubscriptionOwnership", ...args]);
    }
    async isAppStoreRenewalEnabled(...args) {
        return this.transport.invokeNative("ipc", ["MobilePaymentsFacade", "isAppStoreRenewalEnabled", ...args]);
    }
}
//# sourceMappingURL=MobilePaymentsFacadeSendDispatcher.js.map