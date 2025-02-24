import { PROGRESS_DONE } from "./ProgressBar.js";
import { styles } from "../styles.js";
/**
 * the offline indicator must take into account information
 * from multiple different sources:
 * * ws connection state (connected, not connected) from the worker
 * * login state (logged out, partial login, full login)
 * * sync progress
 * * last sync time
 *
 * the state necessary to determine the right indicator state from
 * previous updates from these information sources
 * is maintained in this class
 */
export class OfflineIndicatorViewModel {
    cacheStorage;
    loginListener;
    connectivityModel;
    logins;
    cb;
    lastProgress = PROGRESS_DONE;
    lastWsState = 0 /* WsConnectionState.connecting */;
    lastUpdate = null;
    /**
     * keeping this prevents flashing misleading states during login when
     * the full login succeeded but the ws connection attempt didn't
     * succeed or fail yet.
     * wsState is "connecting" both during first connect attempt and after we
     * disconnected.
     **/
    wsWasConnectedBefore = false;
    constructor(cacheStorage, loginListener, connectivityModel, logins, progressTracker, cb) {
        this.cacheStorage = cacheStorage;
        this.loginListener = loginListener;
        this.connectivityModel = connectivityModel;
        this.logins = logins;
        this.cb = cb;
        logins.waitForFullLogin().then(() => this.cb());
        this.setProgressUpdateStream(progressTracker.onProgressUpdate);
        this.setWsStateStream(this.connectivityModel.wsConnection());
    }
    setProgressUpdateStream(progressStream) {
        progressStream.map((progress) => this.onProgressUpdate(progress));
        this.onProgressUpdate(progressStream());
    }
    setWsStateStream(wsStream) {
        wsStream.map((state) => {
            this.onWsStateChange(state);
        });
        this.onWsStateChange(wsStream()).then();
    }
    onProgressUpdate(progress) {
        this.lastProgress = progress;
        this.cb();
    }
    async onWsStateChange(newState) {
        this.lastWsState = newState;
        if (newState !== 1 /* WsConnectionState.connected */) {
            const lastUpdate = await this.cacheStorage.getLastUpdateTime();
            switch (lastUpdate.type) {
                case "recorded":
                    this.lastUpdate = new Date(lastUpdate.time);
                    break;
                case "never":
                // We can get into uninitialized state after temporary login e.g. during signup
                // falls through
                case "uninitialized":
                    this.lastUpdate = null;
                    this.wsWasConnectedBefore = false;
                    break;
            }
        }
        else {
            this.wsWasConnectedBefore = true;
        }
        this.cb();
    }
    getCurrentAttrs() {
        const isSingleColumn = styles.isUsingBottomNavigation();
        if (this.logins.isFullyLoggedIn() && this.wsWasConnectedBefore) {
            if (this.lastWsState === 1 /* WsConnectionState.connected */) {
                // normal, full login with a connected websocket
                if (this.lastProgress < PROGRESS_DONE) {
                    return { state: 2 /* OfflineIndicatorState.Synchronizing */, progress: this.lastProgress, isSingleColumn };
                }
                else {
                    return { state: 3 /* OfflineIndicatorState.Online */, isSingleColumn };
                }
            }
            else {
                // normal, full login with a disconnected websocket
                return {
                    state: 0 /* OfflineIndicatorState.Offline */,
                    lastUpdate: this.lastUpdate,
                    reconnectAction: () => {
                        console.log("try reconnect ws");
                        this.connectivityModel.tryReconnect(true, true, 2000);
                    },
                    isSingleColumn,
                };
            }
        }
        else {
            // either not fully logged in or the websocket was not connected before
            // in cases where the indicator is visible, this is just offline login.
            if (this.loginListener.getFullLoginFailed()) {
                return {
                    state: 0 /* OfflineIndicatorState.Offline */,
                    lastUpdate: this.lastUpdate,
                    reconnectAction: () => {
                        console.log("try full login");
                        this.logins.retryAsyncLogin().finally(() => this.cb());
                    },
                    isSingleColumn,
                };
            }
            else {
                // partially logged in, but the last login attempt didn't fail yet
                return { state: 1 /* OfflineIndicatorState.Connecting */, isSingleColumn };
            }
        }
    }
    /*
     * get the current progress for sync operations
     */
    getProgress() {
        //getting the progress like this ensures that
        // the progress bar and sync percentage are consistent
        const a = this.getCurrentAttrs();
        return a.state === 2 /* OfflineIndicatorState.Synchronizing */ && this.logins?.isUserLoggedIn() ? a.progress : 1;
    }
}
//# sourceMappingURL=OfflineIndicatorViewModel.js.map