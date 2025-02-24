import { createReadCounterData } from "../../../entities/monitor/TypeRefs.js";
import { assertWorkerOrNode } from "../../../common/Env.js";
import { CounterService } from "../../../entities/monitor/Services.js";
assertWorkerOrNode();
export class CounterFacade {
    serviceExecutor;
    constructor(serviceExecutor) {
        this.serviceExecutor = serviceExecutor;
    }
    async readCounterValue(counterType, rowName, columnName) {
        const counterData = createReadCounterData({
            counterType,
            rowName,
            columnName,
        });
        const counterReturn = await this.serviceExecutor.get(CounterService, counterData);
        return Number(counterReturn.counterValues[0].value);
    }
    async readAllCustomerCounterValues(counterType, customerId) {
        const counterData = createReadCounterData({
            counterType,
            rowName: customerId,
            columnName: null,
        });
        const counterReturn = await this.serviceExecutor.get(CounterService, counterData);
        return counterReturn.counterValues;
    }
}
//# sourceMappingURL=CounterFacade.js.map