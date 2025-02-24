import { debounce } from "@tutao/tutanota-utils";
import { createUpdateSessionKeysPostIn, GroupKeyUpdateTypeRef } from "../../entities/sys/TypeRefs.js";
import { LockedError } from "../../common/error/RestError";
import { assertWorkerOrNode } from "../../common/Env";
import { UpdateSessionKeysService } from "../../entities/sys/Services";
import { resolveTypeReference } from "../../common/EntityFunctions.js";
assertWorkerOrNode();
export const UPDATE_SESSION_KEYS_SERVICE_DEBOUNCE_MS = 50;
/**
 * This queue collects updates for ownerEncSessionKeys and debounces the update request to the UpdateSessionKeysService,
 * in order to update as many instances in one request as possible.
 *
 * In case of LockedErrors it will retry. In case of other errors it will discard the update.
 * (The next time the instance session key is resolved using the bucket key a new update attempt will be made for those instances.)
 */
export class OwnerEncSessionKeysUpdateQueue {
    userFacade;
    serviceExecutor;
    updateInstanceSessionKeyQueue = [];
    invokeUpdateSessionKeyService;
    senderAuthStatusForMailInstance = null;
    constructor(userFacade, serviceExecutor, 
    // allow passing the timeout for testability
    debounceTimeoutMs = UPDATE_SESSION_KEYS_SERVICE_DEBOUNCE_MS) {
        this.userFacade = userFacade;
        this.serviceExecutor = serviceExecutor;
        this.invokeUpdateSessionKeyService = debounce(debounceTimeoutMs, () => this.sendUpdateRequest());
    }
    /**
     * Add the ownerEncSessionKey updates to the queue and debounce the update request.
     *
     * @param instanceSessionKeys all instanceSessionKeys from one bucketKey containing the ownerEncSessionKey as symEncSessionKey
     * @param typeModel of the main instance that we are updating session keys for
     */
    async updateInstanceSessionKeys(instanceSessionKeys, typeModel) {
        if (this.userFacade.isLeader()) {
            const groupKeyUpdateTypeModel = await resolveTypeReference(GroupKeyUpdateTypeRef);
            if (groupKeyUpdateTypeModel.id !== typeModel.id) {
                this.updateInstanceSessionKeyQueue.push(...instanceSessionKeys);
                this.invokeUpdateSessionKeyService();
            }
        }
    }
    async sendUpdateRequest() {
        const instanceSessionKeys = this.updateInstanceSessionKeyQueue;
        this.updateInstanceSessionKeyQueue = [];
        try {
            if (instanceSessionKeys.length > 0) {
                await this.postUpdateSessionKeysService(instanceSessionKeys);
            }
        }
        catch (e) {
            if (e instanceof LockedError) {
                this.updateInstanceSessionKeyQueue.push(...instanceSessionKeys);
                this.invokeUpdateSessionKeyService();
            }
            else {
                console.log("error during session key update:", e.name, instanceSessionKeys.length);
                throw e;
            }
        }
    }
    async postUpdateSessionKeysService(instanceSessionKeys) {
        const input = createUpdateSessionKeysPostIn({ ownerEncSessionKeys: instanceSessionKeys });
        await this.serviceExecutor.post(UpdateSessionKeysService, input);
    }
}
//# sourceMappingURL=OwnerEncSessionKeysUpdateQueue.js.map