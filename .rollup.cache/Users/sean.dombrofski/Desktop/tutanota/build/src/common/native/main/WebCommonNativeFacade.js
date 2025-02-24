import { lang } from "../../misc/LanguageViewModel.js";
import { decodeBase64, noOp, ofClass } from "@tutao/tutanota-utils";
import { CancelledError } from "../../api/common/error/CancelledError.js";
import { UserError } from "../../api/main/UserError.js";
import m from "mithril";
import { Dialog } from "../../gui/base/Dialog.js";
import { AttachmentType, getAttachmentType } from "../../gui/AttachmentBubble.js";
import { showRequestPasswordDialog } from "../../misc/passwords/PasswordRequestDialog.js";
import { locator } from "../../api/main/CommonLocator.js";
import { AppType } from "../../misc/ClientConstants.js";
import { ContactTypeRef } from "../../api/entities/tutanota/TypeRefs.js";
import { isDesktop } from "../../api/common/Env";
import { HighestTierPlans } from "../../api/common/TutanotaConstants.js";
export class WebCommonNativeFacade {
    logins;
    mailboxModel;
    usageTestController;
    fileApp;
    pushService;
    fileImportHandler;
    openMailBox;
    openCalendar;
    appType;
    openSettings;
    constructor(logins, mailboxModel, usageTestController, fileApp, pushService, fileImportHandler, openMailBox, openCalendar, appType, openSettings) {
        this.logins = logins;
        this.mailboxModel = mailboxModel;
        this.usageTestController = usageTestController;
        this.fileApp = fileApp;
        this.pushService = pushService;
        this.fileImportHandler = fileImportHandler;
        this.openMailBox = openMailBox;
        this.openCalendar = openCalendar;
        this.appType = appType;
        this.openSettings = openSettings;
    }
    async openContactEditor(contactId) {
        await this.logins.waitForFullLogin();
        const { ContactEditor } = await import("../../../mail-app/contacts/ContactEditor.js");
        const decodedContactId = decodeBase64("utf-8", contactId);
        const idParts = decodedContactId.split("/");
        try {
            const contact = await locator.entityClient.load(ContactTypeRef, [idParts[0], idParts[1]]);
            const editor = new ContactEditor(locator.entityClient, contact);
            return editor.show();
        }
        catch (err) {
            console.error(err);
            return Dialog.message("contactNotFound_msg");
        }
    }
    /**
     * create a mail editor as requested from the native side, ie because a
     * mailto-link was clicked or the "Send as mail" option
     * in LibreOffice/Windows Explorer was used.
     *
     * if a mailtoUrl is given:
     *  * the other arguments will be ignored.
     *  * confidential will be set to false
     *
     */
    async createMailEditor(filesUris, text, addresses, subject, mailToUrlString) {
        const { newMailEditorFromTemplate, newMailtoUrlMailEditor } = await import("../../../mail-app/mail/editor/MailEditor.js");
        const signatureModule = await import("../../../mail-app/mail/signature/Signature");
        await this.logins.waitForPartialLogin();
        const mailboxDetails = await this.mailboxModel.getUserMailboxDetails();
        let editor;
        try {
            if (mailToUrlString) {
                editor = await newMailtoUrlMailEditor(mailToUrlString, false, mailboxDetails).catch(ofClass(CancelledError, noOp));
                if (!editor)
                    return;
                editor.show();
            }
            else {
                const fileApp = await this.fileApp();
                const files = await fileApp.getFilesMetaData(filesUris);
                const allFilesAreVCards = files.length > 0 && files.every((file) => getAttachmentType(file.mimeType) === AttachmentType.CONTACT);
                const allFilesAreICS = files.length > 0 && files.every((file) => getAttachmentType(file.mimeType) === AttachmentType.CALENDAR);
                const allFilesAreMail = files.length > 0 && files.every((file) => getAttachmentType(file.mimeType) === AttachmentType.MAIL);
                if (this.appType === AppType.Calendar) {
                    if (!allFilesAreICS) {
                        return Dialog.message("invalidCalendarFile_msg");
                    }
                    return this.handleFileImport(filesUris);
                }
                let willImport = false;
                if (allFilesAreVCards) {
                    willImport = await Dialog.choice("vcardInSharingFiles_msg", [
                        {
                            text: "import_action",
                            value: true,
                        },
                        { text: "attachFiles_action", value: false },
                    ]);
                }
                else if (allFilesAreICS) {
                    willImport = await Dialog.choice("icsInSharingFiles_msg", [
                        {
                            text: "import_action",
                            value: true,
                        },
                        { text: "attachFiles_action", value: false },
                    ]);
                }
                else if (isDesktop() && allFilesAreMail) {
                    // importing mails is currently only allowed on plan LEGEND and UNLIMITED
                    const currentPlanType = await locator.logins.getUserController().getPlanType();
                    const isHighestTierPlan = HighestTierPlans.includes(currentPlanType);
                    let importAction = {
                        text: "import_action",
                        value: true,
                    };
                    let attachFilesAction = {
                        text: "attachFiles_action",
                        value: false,
                    };
                    willImport = isHighestTierPlan && (await Dialog.choice("emlOrMboxInSharingFiles_msg", [importAction, attachFilesAction]));
                }
                if (willImport) {
                    await this.handleFileImport(filesUris);
                }
                else {
                    const address = (addresses && addresses[0]) || "";
                    const recipients = address
                        ? {
                            to: [
                                {
                                    name: "",
                                    address: address,
                                },
                            ],
                        }
                        : {};
                    editor = await newMailEditorFromTemplate(mailboxDetails, recipients, subject || (files.length > 0 ? files[0].name : ""), signatureModule.appendEmailSignature(text || "", this.logins.getUserController().props), files, undefined, undefined, true);
                    editor.show();
                }
            }
        }
        catch (e) {
            if (e instanceof UserError) {
                // noinspection ES6MissingAwait
                Dialog.message(lang.makeTranslation("error_msg", e.message));
            }
            throw e;
        }
    }
    async invalidateAlarms() {
        const pushService = await this.pushService();
        await pushService.reRegister();
    }
    async showAlertDialog(translationKey) {
        const { Dialog } = await import("../../gui/base/Dialog.js");
        return Dialog.message(translationKey);
    }
    async updateTheme() {
        await locator.themeController.reloadTheme();
    }
    /**
     * largely modeled after ChangePasswordOkAction, except that we're never changing the password with it and
     * don't support bcrypt for this one.
     */
    async promptForNewPassword(title, oldPassword) {
        const [{ Dialog }, { PasswordForm, PasswordModel }] = await Promise.all([import("../../gui/base/Dialog.js"), import("../../settings/PasswordForm.js")]);
        const model = new PasswordModel(this.usageTestController, this.logins, {
            checkOldPassword: false,
            enforceStrength: false,
        });
        return new Promise((resolve, reject) => {
            const changePasswordOkAction = async (dialog) => {
                const error = model.getErrorMessageId();
                if (error) {
                    Dialog.message(error);
                }
                else {
                    resolve(model.getNewPassword());
                    dialog.close();
                }
            };
            Dialog.showActionDialog({
                title: lang.makeTranslation(title, title),
                child: () => m(PasswordForm, { model }),
                validator: () => model.getErrorMessageId(),
                okAction: changePasswordOkAction,
                cancelAction: () => reject(new CancelledError("user cancelled operation")),
                allowCancel: true,
            });
        });
    }
    async promptForPassword(title) {
        const { Dialog } = await import("../../gui/base/Dialog.js");
        return new Promise((resolve, reject) => {
            const dialog = showRequestPasswordDialog({
                title: lang.makeTranslation(title, title),
                action: async (pw) => {
                    resolve(pw);
                    dialog.close();
                    return "";
                },
                cancel: {
                    textId: "cancel_action",
                    action: () => reject(new CancelledError("user cancelled operation")),
                },
            });
        });
    }
    /**
     * Parse and handle files given a list of files URI.
     * @param filesUris List of files URI to be parsed
     */
    async handleFileImport(filesUris) {
        // Since we might be handling calendar files, we must wait for full login
        await this.logins.waitForFullLogin();
        await this.fileImportHandler(filesUris);
    }
}
//# sourceMappingURL=WebCommonNativeFacade.js.map