export let locator = new Proxy({}, {
    get: (_, property) => {
        throw new Error("Common locator must be initialized first");
    },
});
export function initCommonLocator(loc) {
    locator = loc;
}
//# sourceMappingURL=CommonLocator.js.map