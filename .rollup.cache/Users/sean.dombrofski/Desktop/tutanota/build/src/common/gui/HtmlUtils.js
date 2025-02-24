import { assertNotNull } from "@tutao/tutanota-utils";
import { assertMainOrNodeBoot } from "../api/common/Env";
assertMainOrNodeBoot();
export function applySafeAreaInsetMarginLR(element) {
    element.style.marginRight = "env(safe-area-inset-right)";
    element.style.marginLeft = "env(safe-area-inset-left)";
}
export function getSafeAreaInsetLeft() {
    return window.orientation === 90 ? "env(safe-area-inset-left)" : "";
}
export function getSafeAreaInsetRight() {
    return window.orientation === -90 ? "env(safe-area-inset-right)" : "";
}
/**
 * Only used for iOS. We need to go through CSS variable because getting env() directly does not work.
 * see https://benfrain.com/how-to-get-the-value-of-phone-notches-environment-variables-env-in-javascript-from-css/
 * We need to adjust bottom position because of the home button on iOS which shifts everything up.
 */
export function getSafeAreaInsetTop() {
    const bottomInsetString = getComputedStyle(assertNotNull(document?.body)).getPropertyValue("--safe-area-inset-top");
    return bottomInsetString ? parseInt(bottomInsetString.slice(0, -2)) : 0;
}
/**
 * Only used for iOS. We need to go through CSS variable because getting env() directly does not work.
 * see https://benfrain.com/how-to-get-the-value-of-phone-notches-environment-variables-env-in-javascript-from-css/
 * We need to adjust bottom position because of the home button on iOS which shifts everything up.
 */
export function getSafeAreaInsetBottom() {
    const bottomInsetString = getComputedStyle(assertNotNull(document?.body)).getPropertyValue("--safe-area-inset-bottom");
    return bottomInsetString ? parseInt(bottomInsetString.slice(0, -2)) : 0;
}
export function stringifyFragment(fragment) {
    let div = document.createElement("div");
    div.appendChild(fragment);
    return div.innerHTML;
}
//# sourceMappingURL=HtmlUtils.js.map