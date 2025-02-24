import { isSelectedPrefix } from "../gui/base/NavButton.js";
import { assertMainOrNode } from "../api/common/Env.js";
assertMainOrNode();
export class SettingsFolder {
    name;
    icon;
    path;
    viewerCreator;
    data;
    url;
    _isVisibleHandler;
    constructor(name, icon, path, viewerCreator, data) {
        this.name = name;
        this.icon = icon;
        this.path = path;
        this.viewerCreator = viewerCreator;
        this.data = data;
        this.url =
            typeof path === "string" ? `/settings/${encodeURIComponent(path)}` : `/settings/${encodeURIComponent(path.folder)}/${encodeURIComponent(path.id)}`;
        this._isVisibleHandler = () => true;
    }
    isActive() {
        return isSelectedPrefix(this.url);
    }
    isVisible() {
        return this._isVisibleHandler();
    }
    setIsVisibleHandler(isVisibleHandler) {
        this._isVisibleHandler = isVisibleHandler;
        return this;
    }
    get folder() {
        return typeof this.path === "string" ? null : this.path.folder;
    }
    get id() {
        return typeof this.path === "string" ? null : this.path.id;
    }
}
//# sourceMappingURL=SettingsFolder.js.map