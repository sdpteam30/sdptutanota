import stream from "mithril/stream";
import { isOfflineError } from "../api/common/utils/ErrorUtils.js";
export var LoadingState;
(function (LoadingState) {
    /** We have not tried to load anything, or the loading is complete */
    LoadingState[LoadingState["Idle"] = 0] = "Idle";
    /** We are waiting for a resource to load */
    LoadingState[LoadingState["Loading"] = 1] = "Loading";
    /** We tried to load and got a `ConnectionError` */
    LoadingState[LoadingState["ConnectionLost"] = 2] = "ConnectionLost";
})(LoadingState || (LoadingState = {}));
/**
 * A utility to track the loaded state of some resource
 * Provides listeners for handling state changes
 */
export class LoadingStateTracker {
    state;
    loadingStateListener = null;
    constructor(initialState = LoadingState.Idle) {
        this.state = stream(initialState);
    }
    get() {
        return this.state();
    }
    isIdle() {
        return this.get() === LoadingState.Idle;
    }
    isLoading() {
        return this.get() === LoadingState.Loading;
    }
    isConnectionLost() {
        return this.get() === LoadingState.ConnectionLost;
    }
    set(state) {
        this.state(state);
    }
    setIdle() {
        this.set(LoadingState.Idle);
    }
    setLoading() {
        this.set(LoadingState.Loading);
    }
    setConnectionLost() {
        this.set(LoadingState.ConnectionLost);
    }
    /**
     * Follow the state of a promise.
     * While the promise is not resolved, this will be in `Loading` state
     * If the promise rejects with a `ConnectionError`, then it will finish in `ConnectionLost` state
     * Otherwise it will finish in `Idle` state
     */
    async trackPromise(promise) {
        this.set(LoadingState.Loading);
        let connectionLost = false;
        try {
            return await promise;
        }
        catch (e) {
            if (isOfflineError(e)) {
                connectionLost = true;
            }
            throw e;
        }
        finally {
            this.set(connectionLost ? LoadingState.ConnectionLost : LoadingState.Idle);
        }
    }
    setStateChangedListener(listener) {
        this.clearStateChangedListener();
        this.loadingStateListener = this.state.map(listener);
    }
    clearStateChangedListener() {
        if (this.loadingStateListener != null) {
            this.loadingStateListener.end(true);
            this.loadingStateListener = null;
        }
    }
}
//# sourceMappingURL=LoadingState.js.map