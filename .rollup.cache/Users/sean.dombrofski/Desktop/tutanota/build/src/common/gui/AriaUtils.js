import { assertMainOrNodeBoot } from "../api/common/Env";
assertMainOrNodeBoot();
export function liveDataAttrs() {
    return {
        "aria-live": "polite" /* AriaLiveData.Polite */,
        "aria-atomic": "true",
    };
}
/**
 * construct spreadable landmark attributes for screen readers.
 * return value includes a hide-outline class that will be overridden if the selector
 * used to construct the element contains other classes.
 */
export function landmarkAttrs(role, label) {
    return {
        class: "hide-outline",
        role,
        tabindex: "-1" /* TabIndex.Programmatic */,
        "aria-label": label,
    };
}
//# sourceMappingURL=AriaUtils.js.map