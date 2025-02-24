/**
 * Base (utility) class for top-level components. Will handle URL updates for you automatically and will only call {@link onNewUrl} when necessary.
 */
export class BaseTopLevelView {
    lastPath = "";
    oninit({ attrs }) {
        this.lastPath = attrs.requestedPath;
        this.onNewUrl(attrs.args, attrs.requestedPath);
    }
    onbeforeupdate({ attrs }) {
        // onupdate() is called on every re-render but we don't want to call onNewUrl all the time
        if (this.lastPath !== attrs.requestedPath) {
            this.lastPath = attrs.requestedPath;
            this.onNewUrl(attrs.args, attrs.requestedPath);
        }
    }
}
//# sourceMappingURL=BaseTopLevelView.js.map