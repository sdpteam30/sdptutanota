import m from "mithril";
import { MailSetKind } from "../../../common/api/common/TutanotaConstants.js";
import { assertNotNull } from "@tutao/tutanota-utils";
import { assertSystemFolderOfType } from "../../mail/model/MailUtils.js";
import { getElementId } from "../../../common/api/common/utils/EntityUtils.js";
/**
 * Handles requests for opening mailbox paths from native.
 */
export class OpenMailboxHandler {
    logins;
    mailModel;
    mailboxModel;
    constructor(logins, mailModel, mailboxModel) {
        this.logins = logins;
        this.mailModel = mailModel;
        this.mailboxModel = mailboxModel;
    }
    async openMailbox(userId, mailAddress, requestedPath) {
        if (this.logins.isUserLoggedIn() && this.logins.getUserController().user._id === userId) {
            if (!requestedPath) {
                const [mailboxDetail] = await this.mailboxModel.getMailboxDetails();
                const folders = await this.mailModel.getMailboxFoldersForId(assertNotNull(mailboxDetail.mailbox.folders)._id);
                const inbox = assertSystemFolderOfType(folders, MailSetKind.INBOX);
                m.route.set("/mail/" + getElementId(inbox));
            }
            else {
                m.route.set("/mail" + requestedPath);
            }
        }
        else {
            if (!requestedPath) {
                m.route.set(`/login?noAutoLogin=false&userId=${userId}&loginWith=${mailAddress}`);
            }
            else {
                const fullRequestedPath = `/mail${requestedPath}`;
                m.route.set(`/login?noAutoLogin=false&userId=${userId}&loginWith=${mailAddress}&requestedPath=${encodeURIComponent(fullRequestedPath)}`);
            }
        }
    }
}
//# sourceMappingURL=OpenMailboxHandler.js.map