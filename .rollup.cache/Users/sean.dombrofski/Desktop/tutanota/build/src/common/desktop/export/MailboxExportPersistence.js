import { DesktopConfigKey } from "../config/ConfigKeys.js";
export class MailboxExportPersistence {
    conf;
    constructor(conf) {
        this.conf = conf;
    }
    async getStateForUser(userId) {
        return (await this.getMap())[userId];
    }
    async setStateForUser(state) {
        const map = await this.getMap();
        map[state.userId] = state;
        await this.conf.setVar(DesktopConfigKey.mailboxExportState, map);
    }
    async clearStateForUser(userId) {
        const map = await this.getMap();
        delete map[userId];
        await this.conf.setVar(DesktopConfigKey.mailboxExportState, map);
    }
    async getMap() {
        return await this.conf.getVar(DesktopConfigKey.mailboxExportState);
    }
}
//# sourceMappingURL=MailboxExportPersistence.js.map