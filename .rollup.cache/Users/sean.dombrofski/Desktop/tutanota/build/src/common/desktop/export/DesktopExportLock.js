/** A simple lock to prevent parallel mailbox export in multiple windows */
export class DesktopExportLock {
    locks = new Set();
    acquireLock(userId) {
        if (this.locks.has(userId)) {
            return 1 /* LockResult.AlreadyLocked */;
        }
        else {
            this.locks.add(userId);
            return 0 /* LockResult.LockAcquired */;
        }
    }
    unlock(userId) {
        this.locks.delete(userId);
    }
}
//# sourceMappingURL=DesktopExportLock.js.map