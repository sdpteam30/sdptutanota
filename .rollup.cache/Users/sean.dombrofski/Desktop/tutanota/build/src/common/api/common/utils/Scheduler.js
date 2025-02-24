/**
 * setTimeout() only works on 32bit integers, it doesn't do what you expect on longer intervals. If you use Scheduler you should not
 * worry about it, mainly exported for tests.
 * */
export const SET_TIMEOUT_LIMIT = 0x7fffffff;
export class SchedulerImpl {
    dateProvider;
    systemTimeout;
    systemInterval;
    /**
     * This points from the originally scheduled timeout to the most recent timeout
     */
    bridgedTimeouts;
    constructor(dateProvider, systemTimeout, systemInterval) {
        this.dateProvider = dateProvider;
        this.systemTimeout = systemTimeout;
        this.systemInterval = systemInterval;
        this.bridgedTimeouts = new Map();
    }
    scheduleAt(callback, date) {
        let timeoutId;
        // Call the thunk and clean up timeout in the map
        const wrappedCallback = () => {
            this.bridgedTimeouts.delete(timeoutId);
            callback();
        };
        timeoutId = this.scheduleAtInternal(wrappedCallback, date);
        return timeoutId;
    }
    scheduleAfter(thunk, after) {
        const date = new Date(this.dateProvider.now() + after);
        return this.scheduleAt(thunk, date);
    }
    /** We have separate internal version which does not re-wrap the thunk. */
    scheduleAtInternal(thunk, date) {
        const now = this.dateProvider.now();
        const then = date.getTime();
        const diff = Math.max(then - now, 0);
        let timeoutId;
        if (diff > SET_TIMEOUT_LIMIT) {
            timeoutId = this.systemTimeout.setTimeout(() => {
                const newTimeoutId = this.scheduleAtInternal(thunk, date);
                this.bridgedTimeouts.set(timeoutId, newTimeoutId);
            }, SET_TIMEOUT_LIMIT);
        }
        else {
            timeoutId = this.systemTimeout.setTimeout(thunk, diff);
        }
        return timeoutId;
    }
    unscheduleTimeout(id) {
        const rescheduledId = this.bridgedTimeouts.get(id) || id;
        this.bridgedTimeouts.delete(rescheduledId);
        return this.systemTimeout.clearTimeout(rescheduledId);
    }
    schedulePeriodic(thunk, ms) {
        // Intervals bigger than 32 bit int will not work out-of-the-box and we do not want to implement bridging for them as this is a very rare case and is
        // usually a bug.
        if (ms > SET_TIMEOUT_LIMIT) {
            throw new Error("Attempting to schedule periodic task but the period is too big: " + ms);
        }
        return this.systemInterval.setInterval(thunk, ms);
    }
    unschedulePeriodic(id) {
        this.systemInterval.clearInterval(id);
    }
}
//# sourceMappingURL=Scheduler.js.map