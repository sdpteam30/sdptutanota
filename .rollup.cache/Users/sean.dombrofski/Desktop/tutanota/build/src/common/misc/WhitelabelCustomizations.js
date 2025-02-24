import { assertMainOrNodeBoot } from "../api/common/Env";
assertMainOrNodeBoot();
/**
 * window.whitelabelCustomizations is defined when the user has logged in via a whitelabel domain. index.js is rewritten to have the definition
 * this happens at WhitelabelResourceRewriter.java
 */
export function getWhitelabelCustomizations(window) {
    // @ts-ignore
    return window.whitelabelCustomizations;
}
export function getThemeCustomizations(whitelabelConfig) {
    return JSON.parse(whitelabelConfig.jsonTheme, (k, v) => (k === "__proto__" ? undefined : v));
}
//# sourceMappingURL=WhitelabelCustomizations.js.map