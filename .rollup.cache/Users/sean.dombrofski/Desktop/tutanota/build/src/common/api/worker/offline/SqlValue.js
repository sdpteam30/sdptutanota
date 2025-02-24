import { mapObject } from "@tutao/tutanota-utils";
export function tagSqlObject(params) {
    return mapObject((p) => tagSqlValue(p), params);
}
export function tagSqlValue(param) {
    if (typeof param === "string") {
        return { type: "SqlStr" /* SqlType.String */, value: param };
    }
    else if (typeof param === "number") {
        return { type: "SqlNum" /* SqlType.Number */, value: param };
    }
    else if (param == null) {
        return { type: "SqlNull" /* SqlType.Null */, value: null };
    }
    else {
        return { type: "SqlBytes" /* SqlType.Bytes */, value: param };
    }
}
export function untagSqlValue(tagged) {
    return tagged.value;
}
export function untagSqlObject(tagged) {
    return mapObject((p) => p.value, tagged);
}
//# sourceMappingURL=SqlValue.js.map