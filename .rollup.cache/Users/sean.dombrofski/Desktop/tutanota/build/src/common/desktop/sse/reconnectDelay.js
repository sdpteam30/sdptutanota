const INITIAL_SSE_CONNECT_TIMEOUT_SEC = 60;
const MAX_SSE_CONNECT_TIMEOUT_SEC = 2400;
export class DesktopSseDelay {
    initialConnectionDelay() {
        return INITIAL_SSE_CONNECT_TIMEOUT_SEC * 1000;
    }
    reconnectDelay(attempt) {
        return Math.min(INITIAL_SSE_CONNECT_TIMEOUT_SEC * Math.pow(2, attempt), MAX_SSE_CONNECT_TIMEOUT_SEC) * 1000;
    }
}
//# sourceMappingURL=reconnectDelay.js.map