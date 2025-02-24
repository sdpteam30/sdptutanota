/**
 * Little helper to create your components from pure functions. No need to return objects, no need to define classes, no fear of shooting
 * yourself in the foot with object components.
 */
export function pureComponent(factory) {
    return {
        view(vnode) {
            return factory(vnode.attrs, vnode.children);
        },
    };
}
//# sourceMappingURL=PureComponent.js.map