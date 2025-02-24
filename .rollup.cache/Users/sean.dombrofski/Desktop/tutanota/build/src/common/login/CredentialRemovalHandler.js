import { DeviceStorageUnavailableError } from "../api/common/error/DeviceStorageUnavailableError";
export class NoopCredentialRemovalHandler {
    async onCredentialsRemoved(_) { }
}
export class AppsCredentialRemovalHandler {
    pushApp;
    configFacade;
    appSpecificCredentialRemovalActions;
    constructor(pushApp, configFacade, appSpecificCredentialRemovalActions) {
        this.pushApp = pushApp;
        this.configFacade = configFacade;
        this.appSpecificCredentialRemovalActions = appSpecificCredentialRemovalActions;
    }
    async onCredentialsRemoved({ login, userId }) {
        await this.pushApp.invalidateAlarmsForUser(userId);
        try {
            await this.pushApp.removeUserFromNotifications(userId);
        }
        catch (e) {
            if (e instanceof DeviceStorageUnavailableError) {
                console.warn("Could not remove SSE data: ", e);
            }
            else {
                throw e;
            }
        }
        await this.configFacade.delete(userId);
        await this.appSpecificCredentialRemovalActions(login, userId);
    }
}
//# sourceMappingURL=CredentialRemovalHandler.js.map