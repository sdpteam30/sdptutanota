import { AccountType, GroupType } from "../TutanotaConstants.js";
/**
 * Checks if the current user is an admin of the customer.
 * @return True if the user is an admin
 */
export function isGlobalAdmin(user) {
    if (isInternalUser(user)) {
        return user.memberships.some((m) => m.groupType === GroupType.Admin);
    }
    else {
        return false;
    }
}
/**
 * Provides the information if an internal user is logged in.
 * @return True if an internal user is logged in, false if no user or an external user is logged in.
 */
export function isInternalUser(user) {
    return user.accountType !== AccountType.EXTERNAL;
}
//# sourceMappingURL=UserUtils.js.map