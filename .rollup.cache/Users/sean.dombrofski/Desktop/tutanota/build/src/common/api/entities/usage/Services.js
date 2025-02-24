import { UsageTestAssignmentInTypeRef } from "./TypeRefs.js";
import { UsageTestAssignmentOutTypeRef } from "./TypeRefs.js";
import { UsageTestParticipationInTypeRef } from "./TypeRefs.js";
export const UsageTestAssignmentService = Object.freeze({
    app: "usage",
    name: "UsageTestAssignmentService",
    get: null,
    post: { data: UsageTestAssignmentInTypeRef, return: UsageTestAssignmentOutTypeRef },
    put: { data: UsageTestAssignmentInTypeRef, return: UsageTestAssignmentOutTypeRef },
    delete: null,
});
export const UsageTestParticipationService = Object.freeze({
    app: "usage",
    name: "UsageTestParticipationService",
    get: null,
    post: { data: UsageTestParticipationInTypeRef, return: null },
    put: null,
    delete: null,
});
//# sourceMappingURL=Services.js.map