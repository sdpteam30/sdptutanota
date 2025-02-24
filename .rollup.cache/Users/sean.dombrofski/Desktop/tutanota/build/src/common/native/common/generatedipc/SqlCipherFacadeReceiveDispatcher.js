/* generated file, don't edit. */
export class SqlCipherFacadeReceiveDispatcher {
    facade;
    constructor(facade) {
        this.facade = facade;
    }
    async dispatch(method, arg) {
        switch (method) {
            case "openDb": {
                const userId = arg[0];
                const dbKey = arg[1];
                return this.facade.openDb(userId, dbKey);
            }
            case "closeDb": {
                return this.facade.closeDb();
            }
            case "deleteDb": {
                const userId = arg[0];
                return this.facade.deleteDb(userId);
            }
            case "run": {
                const query = arg[0];
                const params = arg[1];
                return this.facade.run(query, params);
            }
            case "get": {
                const query = arg[0];
                const params = arg[1];
                return this.facade.get(query, params);
            }
            case "all": {
                const query = arg[0];
                const params = arg[1];
                return this.facade.all(query, params);
            }
            case "lockRangesDbAccess": {
                const listId = arg[0];
                return this.facade.lockRangesDbAccess(listId);
            }
            case "unlockRangesDbAccess": {
                const listId = arg[0];
                return this.facade.unlockRangesDbAccess(listId);
            }
        }
    }
}
//# sourceMappingURL=SqlCipherFacadeReceiveDispatcher.js.map