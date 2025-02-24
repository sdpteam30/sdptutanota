import { LazyLoaded } from "@tutao/tutanota-utils";
import stream from "mithril/stream";
export class ObservableLazyLoaded {
    defaultValue;
    lazyLoaded;
    stream = stream();
    constructor(loadFunction, defaultValue) {
        this.defaultValue = defaultValue;
        this.lazyLoaded = new LazyLoaded(async () => {
            const value = await loadFunction();
            this.stream(value);
            return value;
        }, defaultValue);
        this.stream(defaultValue);
    }
    getAsync() {
        return this.lazyLoaded.getAsync();
    }
    isLoaded() {
        return this.lazyLoaded.isLoaded();
    }
    getLoaded() {
        return this.lazyLoaded.getLoaded();
    }
    /** reset & reload the inner lazyLoaded without an observable default state unless loading fails */
    async reload() {
        try {
            return await this.lazyLoaded.reload();
        }
        catch (e) {
            this.lazyLoaded.reset();
            this.stream(this.defaultValue);
            return this.defaultValue;
        }
    }
    reset() {
        this.lazyLoaded.reset();
        this.stream(this.defaultValue);
    }
}
//# sourceMappingURL=ObservableLazyLoaded.js.map