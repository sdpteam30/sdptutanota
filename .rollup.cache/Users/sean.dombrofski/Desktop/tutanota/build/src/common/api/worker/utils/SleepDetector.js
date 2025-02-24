// exported for testing
/** How often do we check for sleep. */
export const CHECK_INTERVAL = 5000;
/** How much time should have passed for us to assume that the app was suspended. */
export const SLEEP_INTERVAL = 15000;
/**
 * Class for detecting suspension state of the app/device.
 * When the device is entering the sleep mode the browser would pause the page. For most of the app it looks like no time has passed at all but when there
 * are external factors e.g. websocket connection we might need to know whether it happens.
 *
 * We detect such situation by scheduling periodic timer and measuring the time in between.
 *
 * Currently is only capable of having one sleep action at a time.
 */
export class SleepDetector {
    scheduler;
    dateProvider;
    scheduledState = null;
    constructor(scheduler, dateProvider) {
        this.scheduler = scheduler;
        this.dateProvider = dateProvider;
    }
    start(onSleep) {
        this.stop();
        this.scheduledState = {
            scheduledId: this.scheduler.schedulePeriodic(() => this.check(), CHECK_INTERVAL),
            lastTime: this.dateProvider.now(),
            onSleep,
        };
    }
    check() {
        if (this.scheduledState == null)
            return;
        const now = this.dateProvider.now();
        if (now - this.scheduledState.lastTime > SLEEP_INTERVAL) {
            this.scheduledState.onSleep();
        }
        this.scheduledState.lastTime = now;
    }
    stop() {
        if (this.scheduledState) {
            this.scheduler.unschedulePeriodic(this.scheduledState.scheduledId);
            this.scheduledState = null;
        }
    }
}
//# sourceMappingURL=SleepDetector.js.map