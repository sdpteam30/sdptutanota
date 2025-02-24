import { createMail } from "../../../common/api/entities/tutanota/TypeRefs.js";
import { LockedError, PreconditionFailedError } from "../../../common/api/common/error/RestError";
import { Dialog } from "../../../common/gui/base/Dialog";
import { locator } from "../../../common/api/main/CommonLocator";
import { isApp, isDesktop } from "../../../common/api/common/Env";
import { assertNotNull, endsWith, neverNull, noOp, promiseMap } from "@tutao/tutanota-utils";
import { EncryptionAuthStatus, getMailFolderType, MailSetKind, SYSTEM_GROUP_MAIL_ADDRESS, } from "../../../common/api/common/TutanotaConstants";
import { reportMailsAutomatically } from "./MailReportDialog";
import { lang } from "../../../common/misc/LanguageViewModel";
import { DomRectReadOnlyPolyfilled, Dropdown } from "../../../common/gui/base/Dropdown.js";
import { modal } from "../../../common/gui/base/Modal.js";
import { size } from "../../../common/gui/size.js";
import { PinchZoom } from "../../../common/gui/PinchZoom.js";
import { hasValidEncryptionAuthForTeamOrSystemMail } from "../../../common/mailFunctionality/SharedMailUtils.js";
import { mailLocator } from "../../mailLocator.js";
import { assertSystemFolderOfType, getFolderName, getIndentedFolderNameForDropdown, getMoveTargetFolderSystems } from "../model/MailUtils.js";
import { FontIcons } from "../../../common/gui/base/icons/FontIcons.js";
import { ProgrammingError } from "../../../common/api/common/error/ProgrammingError.js";
import { isOfTypeOrSubfolderOf, isSpamOrTrashFolder } from "../model/MailChecks.js";
export async function showDeleteConfirmationDialog(mails) {
    let trashMails = [];
    let moveMails = [];
    for (let mail of mails) {
        const folder = mailLocator.mailModel.getMailFolderForMail(mail);
        const folders = await mailLocator.mailModel.getMailboxFoldersForMail(mail);
        if (folders == null) {
            continue;
        }
        const isFinalDelete = folder && isSpamOrTrashFolder(folders, folder);
        if (isFinalDelete) {
            trashMails.push(mail);
        }
        else {
            moveMails.push(mail);
        }
    }
    let confirmationTextId = null;
    if (trashMails.length > 0) {
        if (moveMails.length > 0) {
            confirmationTextId = "finallyDeleteSelectedEmails_msg";
        }
        else {
            confirmationTextId = "finallyDeleteEmails_msg";
        }
    }
    if (confirmationTextId != null) {
        return Dialog.confirm(confirmationTextId, "ok_action");
    }
    else {
        return Promise.resolve(true);
    }
}
/**
 * @return whether emails were deleted
 */
export function promptAndDeleteMails(mailModel, mails, onConfirm) {
    return showDeleteConfirmationDialog(mails).then((confirmed) => {
        if (confirmed) {
            onConfirm();
            return mailModel
                .deleteMails(mails)
                .then(() => true)
                .catch((e) => {
                //LockedError should no longer be thrown!?!
                if (e instanceof PreconditionFailedError || e instanceof LockedError) {
                    return Dialog.message("operationStillActive_msg").then(() => false);
                }
                else {
                    throw e;
                }
            });
        }
        else {
            return Promise.resolve(false);
        }
    });
}
/**
 * Moves the mails and reports them as spam if the user or settings allow it.
 * @return whether mails were actually moved
 */
export async function moveMails({ mailboxModel, mailModel, mails, targetMailFolder, isReportable = true }) {
    const details = await mailModel.getMailboxDetailsForMailFolder(targetMailFolder);
    if (details == null || details.mailbox.folders == null) {
        return false;
    }
    const system = await mailModel.getMailboxFoldersForId(details.mailbox.folders._id);
    return mailModel
        .moveMails(mails, targetMailFolder)
        .then(async () => {
        if (isOfTypeOrSubfolderOf(system, targetMailFolder, MailSetKind.SPAM) && isReportable) {
            const reportableMails = mails.map((mail) => {
                // mails have just been moved
                const reportableMail = createMail(mail);
                reportableMail._id = mail._id;
                return reportableMail;
            });
            const mailboxDetails = await mailboxModel.getMailboxDetailsForMailGroup(assertNotNull(targetMailFolder._ownerGroup));
            await reportMailsAutomatically("1" /* MailReportType.SPAM */, mailboxModel, mailModel, mailboxDetails, reportableMails);
        }
        return true;
    })
        .catch((e) => {
        //LockedError should no longer be thrown!?!
        if (e instanceof LockedError || e instanceof PreconditionFailedError) {
            return Dialog.message("operationStillActive_msg").then(() => false);
        }
        else {
            throw e;
        }
    });
}
export function archiveMails(mails) {
    if (mails.length > 0) {
        // assume all mails in the array belong to the same Mailbox
        return mailLocator.mailModel.getMailboxFoldersForMail(mails[0]).then((folders) => {
            if (folders) {
                moveMails({
                    mailboxModel: locator.mailboxModel,
                    mailModel: mailLocator.mailModel,
                    mails: mails,
                    targetMailFolder: assertSystemFolderOfType(folders, MailSetKind.ARCHIVE),
                });
            }
        });
    }
    else {
        return Promise.resolve();
    }
}
export function moveToInbox(mails) {
    if (mails.length > 0) {
        // assume all mails in the array belong to the same Mailbox
        return mailLocator.mailModel.getMailboxFoldersForMail(mails[0]).then((folders) => {
            if (folders) {
                moveMails({
                    mailboxModel: locator.mailboxModel,
                    mailModel: mailLocator.mailModel,
                    mails: mails,
                    targetMailFolder: assertSystemFolderOfType(folders, MailSetKind.INBOX),
                });
            }
        });
    }
    else {
        return Promise.resolve();
    }
}
export function getFolderIconByType(folderType) {
    switch (folderType) {
        case MailSetKind.CUSTOM:
            return "Folder" /* Icons.Folder */;
        case MailSetKind.INBOX:
            return "Inbox" /* Icons.Inbox */;
        case MailSetKind.SENT:
            return "Send" /* Icons.Send */;
        case MailSetKind.TRASH:
            return "TrashBin" /* Icons.TrashBin */;
        case MailSetKind.ARCHIVE:
            return "Archive" /* Icons.Archive */;
        case MailSetKind.SPAM:
            return "Spam" /* Icons.Spam */;
        case MailSetKind.DRAFT:
            return "Draft" /* Icons.Draft */;
        default:
            return "Folder" /* Icons.Folder */;
    }
}
export function getFolderIcon(folder) {
    return getFolderIconByType(getMailFolderType(folder));
}
export function getMailFolderIcon(mail) {
    let folder = mailLocator.mailModel.getMailFolderForMail(mail);
    if (folder) {
        return getFolderIcon(folder);
    }
    else {
        return "Folder" /* Icons.Folder */;
    }
}
export function replaceCidsWithInlineImages(dom, inlineImages, onContext) {
    // all image tags which have cid attribute. The cid attribute has been set by the sanitizer for adding a default image.
    const imageElements = Array.from(dom.querySelectorAll("img[cid]"));
    if (dom.shadowRoot) {
        const shadowImageElements = Array.from(dom.shadowRoot.querySelectorAll("img[cid]"));
        imageElements.push(...shadowImageElements);
    }
    const elementsWithCid = [];
    for (const imageElement of imageElements) {
        const cid = imageElement.getAttribute("cid");
        if (cid) {
            const inlineImage = inlineImages.get(cid);
            if (inlineImage) {
                elementsWithCid.push(imageElement);
                imageElement.setAttribute("src", inlineImage.objectUrl);
                imageElement.classList.remove("tutanota-placeholder");
                if (isApp()) {
                    // Add long press action for apps
                    let timeoutId;
                    let startCoords;
                    imageElement.addEventListener("touchstart", (e) => {
                        const touch = e.touches[0];
                        if (!touch)
                            return;
                        startCoords = {
                            x: touch.clientX,
                            y: touch.clientY,
                        };
                        if (timeoutId)
                            clearTimeout(timeoutId);
                        timeoutId = setTimeout(() => {
                            onContext(inlineImage.cid, e, imageElement);
                        }, 800);
                    });
                    imageElement.addEventListener("touchmove", (e) => {
                        const touch = e.touches[0];
                        if (!touch || !startCoords || !timeoutId)
                            return;
                        if (Math.abs(touch.clientX - startCoords.x) > PinchZoom.DRAG_THRESHOLD ||
                            Math.abs(touch.clientY - startCoords.y) > PinchZoom.DRAG_THRESHOLD) {
                            clearTimeout(timeoutId);
                            timeoutId = null;
                        }
                    });
                    imageElement.addEventListener("touchend", () => {
                        if (timeoutId) {
                            clearTimeout(timeoutId);
                            timeoutId = null;
                        }
                    });
                }
                if (isDesktop()) {
                    // add right click action for desktop apps
                    imageElement.addEventListener("contextmenu", (e) => {
                        onContext(inlineImage.cid, e, imageElement);
                        e.preventDefault();
                    });
                }
            }
        }
    }
    return elementsWithCid;
}
export function replaceInlineImagesWithCids(dom) {
    const domClone = dom.cloneNode(true);
    const inlineImages = Array.from(domClone.querySelectorAll("img[cid]"));
    for (const inlineImage of inlineImages) {
        const cid = inlineImage.getAttribute("cid");
        inlineImage.setAttribute("src", "cid:" + (cid || ""));
        inlineImage.removeAttribute("cid");
    }
    return domClone;
}
export function createInlineImage(file) {
    const cid = Math.random().toString(30).substring(2);
    file.cid = cid;
    return createInlineImageReference(file, cid);
}
function createInlineImageReference(file, cid) {
    const blob = new Blob([file.data], {
        type: file.mimeType,
    });
    const objectUrl = URL.createObjectURL(blob);
    return {
        cid,
        objectUrl,
        blob,
    };
}
export async function loadInlineImages(fileController, attachments, referencedCids) {
    const filesToLoad = getReferencedAttachments(attachments, referencedCids);
    const inlineImages = new Map();
    return promiseMap(filesToLoad, async (file) => {
        let dataFile = await fileController.getAsDataFile(file);
        const { htmlSanitizer } = await import("../../../common/misc/HtmlSanitizer");
        dataFile = htmlSanitizer.sanitizeInlineAttachment(dataFile);
        const inlineImageReference = createInlineImageReference(dataFile, neverNull(file.cid));
        inlineImages.set(inlineImageReference.cid, inlineImageReference);
    }).then(() => inlineImages);
}
export function getReferencedAttachments(attachments, referencedCids) {
    return attachments.filter((file) => referencedCids.find((rcid) => file.cid === rcid));
}
export async function showMoveMailsDropdown(mailboxModel, model, origin, mails, opts) {
    const folders = await getMoveTargetFolderSystems(model, mails);
    await showMailFolderDropdown(origin, folders, (f) => moveMails({
        mailboxModel,
        mailModel: model,
        mails: mails,
        targetMailFolder: f.folder,
    }), opts);
}
export async function showMailFolderDropdown(origin, folders, onClick, opts) {
    const { width = 300, withBackground = false, onSelected = noOp } = opts ?? {};
    if (folders.length === 0)
        return;
    const folderButtons = folders.map((f) => ({
        // We need to pass in the raw folder name to avoid including it in searches
        label: lang.makeTranslation(`dropdown-folder:${getFolderName(f.folder)}`, lang.get("folderDepth_label", {
            "{folderName}": getFolderName(f.folder),
            "{depth}": f.level,
        })),
        text: lang.makeTranslation("folder_name", getIndentedFolderNameForDropdown(f)),
        click: () => {
            onSelected();
            onClick(f);
        },
        icon: getFolderIcon(f.folder),
    }));
    const dropdown = new Dropdown(() => folderButtons, width);
    dropdown.setOrigin(new DomRectReadOnlyPolyfilled(origin.left, origin.top, origin.width, origin.height));
    modal.displayUnique(dropdown, withBackground);
}
export function getConversationTitle(conversationViewModel) {
    if (!conversationViewModel.isFinished()) {
        return lang.getTranslation("loading_msg");
    }
    const numberOfEmails = conversationViewModel.conversationItems().length;
    if (numberOfEmails === 1) {
        return lang.getTranslation("oneEmail_label");
    }
    else {
        return lang.getTranslation("nbrOrEmails_label", { "{number}": numberOfEmails });
    }
}
export function getMoveMailBounds() {
    // just putting the move mail dropdown in the left side of the viewport with a bit of margin
    return new DomRectReadOnlyPolyfilled(size.hpad_large, size.vpad_large, 0, 0);
}
/**
 * NOTE: DOES NOT VERIFY IF THE MESSAGE IS AUTHENTIC - DO NOT USE THIS OUTSIDE OF THIS FILE OR FOR TESTING
 * @VisibleForTesting
 */
export function isTutanotaTeamAddress(address) {
    return endsWith(address, "@tutao.de") || address === "no-reply@tutanota.de";
}
/**
 * Is this a tutao team member email or a system notification
 */
export function isTutanotaTeamMail(mail) {
    const { confidential, sender, state } = mail;
    return (confidential &&
        state === "2" /* MailState.RECEIVED */ &&
        hasValidEncryptionAuthForTeamOrSystemMail(mail) &&
        (sender.address === SYSTEM_GROUP_MAIL_ADDRESS || isTutanotaTeamAddress(sender.address)));
}
/**
 * Returns the confidential icon for the given mail which indicates either RSA or PQ encryption.
 * The caller must ensure that the mail is in a confidential state.
 */
export function getConfidentialIcon(mail) {
    if (!mail.confidential)
        throw new ProgrammingError("mail is not confidential");
    if (mail.encryptionAuthStatus == EncryptionAuthStatus.TUTACRYPT_AUTHENTICATION_SUCCEEDED ||
        mail.encryptionAuthStatus == EncryptionAuthStatus.TUTACRYPT_AUTHENTICATION_FAILED ||
        mail.encryptionAuthStatus == EncryptionAuthStatus.TUTACRYPT_SENDER) {
        return "PQLock" /* Icons.PQLock */;
    }
    else {
        return "Lock" /* Icons.Lock */;
    }
}
/**
 * Returns the confidential font icon for the given mail which indicates either RSA or PQ encryption.
 * The caller must ensure that the mail is in a confidential state.
 */
export function getConfidentialFontIcon(mail) {
    const confidentialIcon = getConfidentialIcon(mail);
    return confidentialIcon === "PQLock" /* Icons.PQLock */ ? FontIcons.PQConfidential : FontIcons.Confidential;
}
export function isMailContrastFixNeeded(editorDom) {
    return (Array.from(editorDom.querySelectorAll("*[style]"), (e) => e.style).some((s) => (s.color && s.color !== "inherit") || (s.backgroundColor && s.backgroundColor !== "inherit")) || editorDom.querySelectorAll("font[color]").length > 0);
}
//# sourceMappingURL=MailGuiUtils.js.map