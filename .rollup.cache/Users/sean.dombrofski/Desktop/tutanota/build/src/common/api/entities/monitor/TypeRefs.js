import { create } from "../../common/utils/EntityUtils.js";
import { TypeRef } from "@tutao/tutanota-utils";
import { typeModels } from "./TypeModels.js";
export const ApprovalMailTypeRef = new TypeRef("monitor", "ApprovalMail");
export function createApprovalMail(values) {
    return Object.assign(create(typeModels.ApprovalMail, ApprovalMailTypeRef), values);
}
export const CounterValueTypeRef = new TypeRef("monitor", "CounterValue");
export function createCounterValue(values) {
    return Object.assign(create(typeModels.CounterValue, CounterValueTypeRef), values);
}
export const ErrorReportDataTypeRef = new TypeRef("monitor", "ErrorReportData");
export function createErrorReportData(values) {
    return Object.assign(create(typeModels.ErrorReportData, ErrorReportDataTypeRef), values);
}
export const ErrorReportFileTypeRef = new TypeRef("monitor", "ErrorReportFile");
export function createErrorReportFile(values) {
    return Object.assign(create(typeModels.ErrorReportFile, ErrorReportFileTypeRef), values);
}
export const ReadCounterDataTypeRef = new TypeRef("monitor", "ReadCounterData");
export function createReadCounterData(values) {
    return Object.assign(create(typeModels.ReadCounterData, ReadCounterDataTypeRef), values);
}
export const ReadCounterReturnTypeRef = new TypeRef("monitor", "ReadCounterReturn");
export function createReadCounterReturn(values) {
    return Object.assign(create(typeModels.ReadCounterReturn, ReadCounterReturnTypeRef), values);
}
export const ReportErrorInTypeRef = new TypeRef("monitor", "ReportErrorIn");
export function createReportErrorIn(values) {
    return Object.assign(create(typeModels.ReportErrorIn, ReportErrorInTypeRef), values);
}
export const WriteCounterDataTypeRef = new TypeRef("monitor", "WriteCounterData");
export function createWriteCounterData(values) {
    return Object.assign(create(typeModels.WriteCounterData, WriteCounterDataTypeRef), values);
}
//# sourceMappingURL=TypeRefs.js.map