/* generated file, don't edit. */
export class MobileContactsFacadeSendDispatcher {
    transport;
    constructor(transport) {
        this.transport = transport;
    }
    async findSuggestions(...args) {
        return this.transport.invokeNative("ipc", ["MobileContactsFacade", "findSuggestions", ...args]);
    }
    async saveContacts(...args) {
        return this.transport.invokeNative("ipc", ["MobileContactsFacade", "saveContacts", ...args]);
    }
    async syncContacts(...args) {
        return this.transport.invokeNative("ipc", ["MobileContactsFacade", "syncContacts", ...args]);
    }
    async getContactBooks(...args) {
        return this.transport.invokeNative("ipc", ["MobileContactsFacade", "getContactBooks", ...args]);
    }
    async getContactsInContactBook(...args) {
        return this.transport.invokeNative("ipc", ["MobileContactsFacade", "getContactsInContactBook", ...args]);
    }
    async deleteContacts(...args) {
        return this.transport.invokeNative("ipc", ["MobileContactsFacade", "deleteContacts", ...args]);
    }
    async isLocalStorageAvailable(...args) {
        return this.transport.invokeNative("ipc", ["MobileContactsFacade", "isLocalStorageAvailable", ...args]);
    }
    async findLocalMatches(...args) {
        return this.transport.invokeNative("ipc", ["MobileContactsFacade", "findLocalMatches", ...args]);
    }
    async deleteLocalContacts(...args) {
        return this.transport.invokeNative("ipc", ["MobileContactsFacade", "deleteLocalContacts", ...args]);
    }
}
//# sourceMappingURL=MobileContactsFacadeSendDispatcher.js.map