import path from "node:path";
export function getResourcePath(resource) {
    if (env.dist) {
        return path.join(process.resourcesPath, resource);
    }
    else {
        return path.join(process.cwd(), "build/desktop/resources", resource);
    }
}
//# sourceMappingURL=resources.js.map