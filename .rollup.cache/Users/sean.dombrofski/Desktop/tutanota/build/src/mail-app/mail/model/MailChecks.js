//@bundleInto:common
import { MailSetKind } from "../../../common/api/common/TutanotaConstants.js";
export function isSubfolderOfType(system, folder, type) {
    const systemFolder = system.getSystemFolderByType(type);
    return systemFolder != null && system.checkFolderForAncestor(folder, systemFolder._id);
}
export function isDraft(mail) {
    return mail.mailDetailsDraft != null;
}
export async function isMailInSpamOrTrash(mail, mailModel) {
    const folders = await mailModel.getMailboxFoldersForMail(mail);
    const mailFolder = folders?.getFolderByMail(mail);
    if (folders && mailFolder) {
        return isSpamOrTrashFolder(folders, mailFolder);
    }
    else {
        return false;
    }
}
/**
 * Returns true if given folder is the {@link MailFolderType.SPAM} or {@link MailFolderType.TRASH} folder, or a descendant of those folders.
 */
export function isSpamOrTrashFolder(system, folder) {
    // not using isOfTypeOrSubfolderOf because checking the type first is cheaper
    return (folder.folderType === MailSetKind.TRASH ||
        folder.folderType === MailSetKind.SPAM ||
        isSubfolderOfType(system, folder, MailSetKind.TRASH) ||
        isSubfolderOfType(system, folder, MailSetKind.SPAM));
}
export function isOfTypeOrSubfolderOf(system, folder, type) {
    return folder.folderType === type || isSubfolderOfType(system, folder, type);
}
//# sourceMappingURL=MailChecks.js.map