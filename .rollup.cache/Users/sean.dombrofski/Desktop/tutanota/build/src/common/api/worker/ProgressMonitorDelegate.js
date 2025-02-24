/** A wrapper that will send completed work remotely */
export class ProgressMonitorDelegate {
    progressTracker;
    totalWork;
    ref;
    constructor(progressTracker, totalWork) {
        this.progressTracker = progressTracker;
        this.totalWork = totalWork;
        this.ref = progressTracker.registerMonitor(totalWork);
    }
    async workDone(amount) {
        await this.progressTracker.workDoneForMonitor(await this.ref, amount);
    }
    async totalWorkDone(totalAmount) {
        await this.progressTracker.workDoneForMonitor(await this.ref, this.totalWork - totalAmount);
    }
    async completed() {
        await this.progressTracker.workDoneForMonitor(await this.ref, this.totalWork);
    }
}
//# sourceMappingURL=ProgressMonitorDelegate.js.map