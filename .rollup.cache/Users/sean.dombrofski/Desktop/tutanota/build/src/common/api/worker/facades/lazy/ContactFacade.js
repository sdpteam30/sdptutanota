import { assertWorkerOrNode } from "../../../common/Env.js";
import { SetupMultipleError } from "../../../common/error/SetupMultipleError.js";
import { ImportError } from "../../../common/error/ImportError.js";
assertWorkerOrNode();
export class ContactFacade {
    entityClient;
    constructor(entityClient) {
        this.entityClient = entityClient;
    }
    async importContactList(contacts, contactListId) {
        try {
            await this.entityClient.setupMultipleEntities(contactListId, contacts);
        }
        catch (e) {
            console.error(e);
            if (e instanceof SetupMultipleError) {
                console.error("Importing contacts failed", e);
                throw new ImportError(e.errors[0], "Could not import all contacts", e.failedInstances.length);
            }
            throw e;
        }
    }
}
//# sourceMappingURL=ContactFacade.js.map