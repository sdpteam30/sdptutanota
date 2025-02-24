import { CredentialEncryptionMode } from "../misc/credentials/CredentialEncryptionMode.js";
export class NoOpAppLock {
    async enforce() { }
}
export class MobileAppLock {
    mobileSystemFacade;
    credentialsFacade;
    constructor(mobileSystemFacade, credentialsFacade) {
        this.mobileSystemFacade = mobileSystemFacade;
        this.credentialsFacade = credentialsFacade;
    }
    async enforce() {
        if ((await this.credentialsFacade.getCredentialEncryptionMode()) != CredentialEncryptionMode.DEVICE_LOCK) {
            // for migration: do not display the lock twice
            return;
        }
        return this.mobileSystemFacade.enforceAppLock(await this.mobileSystemFacade.getAppLockMethod());
    }
}
//# sourceMappingURL=AppLock.js.map