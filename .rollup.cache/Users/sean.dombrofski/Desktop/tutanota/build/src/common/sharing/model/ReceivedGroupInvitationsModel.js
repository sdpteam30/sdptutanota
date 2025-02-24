import stream from "mithril/stream";
import { ReceivedGroupInvitationTypeRef } from "../../api/entities/sys/TypeRefs.js";
import { getInvitationGroupType, loadReceivedGroupInvitations } from "../GroupUtils";
import { getLetId, isSameId } from "../../api/common/utils/EntityUtils";
import { promiseMap } from "@tutao/tutanota-utils";
import { isUpdateForTypeRef } from "../../api/common/utils/EntityUpdateUtils.js";
export class ReceivedGroupInvitationsModel {
    groupType;
    eventController;
    entityClient;
    logins;
    invitations;
    constructor(groupType, eventController, entityClient, logins) {
        this.groupType = groupType;
        this.eventController = eventController;
        this.entityClient = entityClient;
        this.logins = logins;
        this.invitations = stream([]);
    }
    init() {
        this.eventController.addEntityListener(this.entityEventsReceived);
        loadReceivedGroupInvitations(this.logins.getUserController(), this.entityClient, this.groupType).then((invitations) => this.invitations(invitations.filter((invitation) => this.hasMatchingGroupType(invitation))));
    }
    dispose() {
        this.eventController.removeEntityListener(this.entityEventsReceived);
        this.invitations.end(true);
    }
    entityEventsReceived = (updates) => {
        return promiseMap(updates, (update) => {
            if (isUpdateForTypeRef(ReceivedGroupInvitationTypeRef, update)) {
                const updateId = [update.instanceListId, update.instanceId];
                if (update.operation === "0" /* OperationType.CREATE */) {
                    return this.entityClient.load(ReceivedGroupInvitationTypeRef, updateId).then((invitation) => {
                        if (this.hasMatchingGroupType(invitation)) {
                            this.invitations(this.invitations().concat(invitation));
                        }
                    });
                }
                else if (update.operation === "2" /* OperationType.DELETE */) {
                    this.invitations(this.invitations().filter((invitation) => !isSameId(getLetId(invitation), updateId)));
                }
            }
        });
    };
    hasMatchingGroupType(invitation) {
        return getInvitationGroupType(invitation) === this.groupType;
    }
}
//# sourceMappingURL=ReceivedGroupInvitationsModel.js.map