import { isIOSApp } from "../../api/common/Env.js";
import { PermissionError } from "../../api/common/error/PermissionError.js";
import { Dialog } from "../../gui/base/Dialog.js";
export class SystemPermissionHandler {
    systemFacade;
    constructor(systemFacade) {
        this.systemFacade = systemFacade;
    }
    async queryPermissionsState(permissions) {
        const permissionsStatus = new Map();
        for (const permission of permissions) {
            permissionsStatus.set(permission, await this.hasPermission(permission));
        }
        return permissionsStatus;
    }
    async hasPermission(permission) {
        if (permission === "1" /* PermissionType.IgnoreBatteryOptimization */ && isIOSApp()) {
            return true;
        }
        return await this.systemFacade.hasPermission(permission);
    }
    async requestPermission(permission, deniedMessage) {
        try {
            await this.systemFacade.requestPermission(permission);
            return true;
        }
        catch (e) {
            if (e instanceof PermissionError) {
                console.warn("Permission denied for", permission);
                Dialog.confirm(deniedMessage).then((confirmed) => {
                    if (confirmed) {
                        this.systemFacade.goToSettings();
                    }
                });
                return false;
            }
            throw e;
        }
    }
}
//# sourceMappingURL=SystemPermissionHandler.js.map