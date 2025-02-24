import { create } from "../../common/utils/EntityUtils.js";
import { TypeRef } from "@tutao/tutanota-utils";
import { typeModels } from "./TypeModels.js";
export const UsageTestAssignmentTypeRef = new TypeRef("usage", "UsageTestAssignment");
export function createUsageTestAssignment(values) {
    return Object.assign(create(typeModels.UsageTestAssignment, UsageTestAssignmentTypeRef), values);
}
export const UsageTestAssignmentInTypeRef = new TypeRef("usage", "UsageTestAssignmentIn");
export function createUsageTestAssignmentIn(values) {
    return Object.assign(create(typeModels.UsageTestAssignmentIn, UsageTestAssignmentInTypeRef), values);
}
export const UsageTestAssignmentOutTypeRef = new TypeRef("usage", "UsageTestAssignmentOut");
export function createUsageTestAssignmentOut(values) {
    return Object.assign(create(typeModels.UsageTestAssignmentOut, UsageTestAssignmentOutTypeRef), values);
}
export const UsageTestMetricConfigTypeRef = new TypeRef("usage", "UsageTestMetricConfig");
export function createUsageTestMetricConfig(values) {
    return Object.assign(create(typeModels.UsageTestMetricConfig, UsageTestMetricConfigTypeRef), values);
}
export const UsageTestMetricConfigValueTypeRef = new TypeRef("usage", "UsageTestMetricConfigValue");
export function createUsageTestMetricConfigValue(values) {
    return Object.assign(create(typeModels.UsageTestMetricConfigValue, UsageTestMetricConfigValueTypeRef), values);
}
export const UsageTestMetricDataTypeRef = new TypeRef("usage", "UsageTestMetricData");
export function createUsageTestMetricData(values) {
    return Object.assign(create(typeModels.UsageTestMetricData, UsageTestMetricDataTypeRef), values);
}
export const UsageTestParticipationInTypeRef = new TypeRef("usage", "UsageTestParticipationIn");
export function createUsageTestParticipationIn(values) {
    return Object.assign(create(typeModels.UsageTestParticipationIn, UsageTestParticipationInTypeRef), values);
}
export const UsageTestStageTypeRef = new TypeRef("usage", "UsageTestStage");
export function createUsageTestStage(values) {
    return Object.assign(create(typeModels.UsageTestStage, UsageTestStageTypeRef), values);
}
//# sourceMappingURL=TypeRefs.js.map