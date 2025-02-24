import { GroupKeyUpdateTypeRef, UserGroupKeyDistributionTypeRef, UserTypeRef, } from "../entities/sys/TypeRefs.js";
import { isAdminClient, isTest } from "../common/Env.js";
import { AccountType } from "../common/TutanotaConstants.js";
import { isSameTypeRefByAttr } from "@tutao/tutanota-utils";
import { isSameId } from "../common/utils/EntityUtils.js";
/** A bit of glue to distribute event bus events across the app. */
export class EventBusEventCoordinator {
    connectivityListener;
    mailFacade;
    userFacade;
    entityClient;
    eventController;
    configurationDatabase;
    keyRotationFacade;
    cacheManagementFacade;
    sendError;
    appSpecificBatchHandling;
    constructor(connectivityListener, mailFacade, userFacade, entityClient, eventController, configurationDatabase, keyRotationFacade, cacheManagementFacade, sendError, appSpecificBatchHandling) {
        this.connectivityListener = connectivityListener;
        this.mailFacade = mailFacade;
        this.userFacade = userFacade;
        this.entityClient = entityClient;
        this.eventController = eventController;
        this.configurationDatabase = configurationDatabase;
        this.keyRotationFacade = keyRotationFacade;
        this.cacheManagementFacade = cacheManagementFacade;
        this.sendError = sendError;
        this.appSpecificBatchHandling = appSpecificBatchHandling;
    }
    onWebsocketStateChanged(state) {
        this.connectivityListener.updateWebSocketState(state);
    }
    async onEntityEventsReceived(events, batchId, groupId) {
        await this.entityEventsReceived(events);
        await (await this.mailFacade()).entityEventsReceived(events);
        await this.eventController.onEntityUpdateReceived(events, groupId);
        // Call the indexer in this last step because now the processed event is stored and the indexer has a separate event queue that
        // shall not receive the event twice.
        if (!isTest() && !isAdminClient()) {
            const queuedBatch = { groupId, batchId, events };
            const configurationDatabase = await this.configurationDatabase();
            await configurationDatabase.onEntityEventsReceived(queuedBatch);
            this.appSpecificBatchHandling([queuedBatch]);
        }
    }
    /**
     * @param markers only phishing (not spam) marker will be sent as websocket updates
     */
    async onPhishingMarkersReceived(markers) {
        ;
        (await this.mailFacade()).phishingMarkersUpdateReceived(markers);
    }
    onError(tutanotaError) {
        this.sendError(tutanotaError);
    }
    onLeaderStatusChanged(leaderStatus) {
        this.connectivityListener.onLeaderStatusChanged(leaderStatus);
        if (!isAdminClient()) {
            const user = this.userFacade.getUser();
            if (leaderStatus.leaderStatus && user && user.accountType !== AccountType.EXTERNAL) {
                this.keyRotationFacade.processPendingKeyRotationsAndUpdates(user);
            }
            else {
                this.keyRotationFacade.reset();
            }
        }
    }
    onCounterChanged(counter) {
        this.eventController.onCountersUpdateReceived(counter);
    }
    async entityEventsReceived(data) {
        // This is a compromise to not add entityClient to UserFacade which would introduce a circular dep.
        const groupKeyUpdates = []; // GroupKeyUpdates all in the same list
        const user = this.userFacade.getUser();
        if (user == null)
            return;
        for (const update of data) {
            if (update.operation === "1" /* OperationType.UPDATE */ &&
                isSameTypeRefByAttr(UserTypeRef, update.application, update.type) &&
                isSameId(user._id, update.instanceId)) {
                await this.userFacade.updateUser(await this.entityClient.load(UserTypeRef, user._id));
            }
            else if ((update.operation === "0" /* OperationType.CREATE */ || update.operation === "1" /* OperationType.UPDATE */) &&
                isSameTypeRefByAttr(UserGroupKeyDistributionTypeRef, update.application, update.type) &&
                isSameId(user.userGroup.group, update.instanceId)) {
                await (await this.cacheManagementFacade()).tryUpdatingUserGroupKey();
            }
            else if (update.operation === "0" /* OperationType.CREATE */ && isSameTypeRefByAttr(GroupKeyUpdateTypeRef, update.application, update.type)) {
                groupKeyUpdates.push([update.instanceListId, update.instanceId]);
            }
        }
        await this.keyRotationFacade.updateGroupMemberships(groupKeyUpdates);
    }
}
//# sourceMappingURL=EventBusEventCoordinator.js.map