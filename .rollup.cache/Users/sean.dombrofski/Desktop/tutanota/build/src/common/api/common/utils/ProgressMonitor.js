import { assertNotNull } from "@tutao/tutanota-utils";
/**
 * Class to calculate percentage of total work and report it back.
 * Call {@code workDone() or @code totalWorkDone()} for each work step and {@code completed()}
 * when you are done.
 */
export class ProgressMonitor {
    totalWork;
    updater;
    workCompleted;
    constructor(totalWork, updater) {
        this.totalWork = totalWork;
        this.updater = updater;
        this.workCompleted = 0;
    }
    workDone(amount) {
        this.workCompleted += amount;
        this.updater(this.percentage());
    }
    totalWorkDone(totalAmount) {
        this.workCompleted = totalAmount;
        this.updater(this.percentage());
    }
    percentage() {
        const result = (100 * this.workCompleted) / this.totalWork;
        return Math.min(100, result);
    }
    completed() {
        this.workCompleted = this.totalWork;
        this.updater(100);
    }
}
export class NoopProgressMonitor {
    workDone(amount) { }
    totalWorkDone(totalAmount) { }
    completed() { }
}
export function makeTrackedProgressMonitor(tracker, totalWork) {
    if (totalWork < 1)
        return new NoopProgressMonitor();
    const handle = tracker.registerMonitorSync(totalWork);
    return assertNotNull(tracker.getMonitor(handle));
}
//# sourceMappingURL=ProgressMonitor.js.map