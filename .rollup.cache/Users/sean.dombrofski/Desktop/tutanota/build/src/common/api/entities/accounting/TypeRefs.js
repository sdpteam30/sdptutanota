import { create } from "../../common/utils/EntityUtils.js";
import { TypeRef } from "@tutao/tutanota-utils";
import { typeModels } from "./TypeModels.js";
export const CustomerAccountPostingTypeRef = new TypeRef("accounting", "CustomerAccountPosting");
export function createCustomerAccountPosting(values) {
    return Object.assign(create(typeModels.CustomerAccountPosting, CustomerAccountPostingTypeRef), values);
}
export const CustomerAccountReturnTypeRef = new TypeRef("accounting", "CustomerAccountReturn");
export function createCustomerAccountReturn(values) {
    return Object.assign(create(typeModels.CustomerAccountReturn, CustomerAccountReturnTypeRef), values);
}
//# sourceMappingURL=TypeRefs.js.map