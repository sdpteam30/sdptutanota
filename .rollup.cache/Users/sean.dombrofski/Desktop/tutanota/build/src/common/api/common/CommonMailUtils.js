import { MailSetKind } from "./TutanotaConstants.js";
export function isSubfolderOfType(system, folder, type) {
    const systemFolder = system.getSystemFolderByType(type);
    return systemFolder != null && system.checkFolderForAncestor(folder, systemFolder._id);
}
/**
 * Returns true if given folder is the {@link MailSetKind.SPAM} or {@link MailSetKind.TRASH} folder, or a descendant of those folders.
 */
export function isSpamOrTrashFolder(system, folder) {
    // not using isOfTypeOrSubfolderOf because checking the type first is cheaper
    return (folder.folderType === MailSetKind.TRASH ||
        folder.folderType === MailSetKind.SPAM ||
        isSubfolderOfType(system, folder, MailSetKind.TRASH) ||
        isSubfolderOfType(system, folder, MailSetKind.SPAM));
}
export function isDraft(mail) {
    return mail.mailDetailsDraft != null;
}
export function getDisplayedSender(mail) {
    const realSender = mail.sender;
    return { address: realSender.address, name: realSender.name };
}
export function getMailBodyText(body) {
    return body.compressedText ?? body.text ?? "";
}
//# sourceMappingURL=CommonMailUtils.js.map