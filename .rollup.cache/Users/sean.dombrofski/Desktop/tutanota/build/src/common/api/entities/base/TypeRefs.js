import { create } from "../../common/utils/EntityUtils.js";
import { TypeRef } from "@tutao/tutanota-utils";
import { typeModels } from "./TypeModels.js";
export const PersistenceResourcePostReturnTypeRef = new TypeRef("base", "PersistenceResourcePostReturn");
export function createPersistenceResourcePostReturn(values) {
    return Object.assign(create(typeModels.PersistenceResourcePostReturn, PersistenceResourcePostReturnTypeRef), values);
}
//# sourceMappingURL=TypeRefs.js.map