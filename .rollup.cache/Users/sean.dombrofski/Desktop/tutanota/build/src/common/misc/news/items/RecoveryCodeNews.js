import m from "mithril";
import { lang } from "../../LanguageViewModel.js";
import { Button } from "../../../gui/base/Button.js";
import { Dialog } from "../../../gui/base/Dialog.js";
import { AccessBlockedError, NotAuthenticatedError } from "../../../api/common/error/RestError.js";
import { daysToMillis, LazyLoaded, noOp, ofClass } from "@tutao/tutanota-utils";
import { copyToClipboard } from "../../ClipboardUtils.js";
import { progressIcon } from "../../../gui/base/Icon.js";
import { isApp } from "../../../api/common/Env.js";
import { showRequestPasswordDialog } from "../../passwords/PasswordRequestDialog.js";
/**
 * News item that informs admin users about their recovery code.
 */
export class RecoveryCodeNews {
    newsModel;
    userController;
    recoverCodeFacade;
    recoveryCode = null;
    recoverCodeField = new LazyLoaded(async () => {
        const { RecoverCodeField } = await import("../../../settings/login/RecoverCodeDialog.js");
        m.redraw();
        return RecoverCodeField;
    });
    constructor(newsModel, userController, recoverCodeFacade) {
        this.newsModel = newsModel;
        this.userController = userController;
        this.recoverCodeFacade = recoverCodeFacade;
    }
    isShown(newsId) {
        const customerCreationTime = this.userController.userGroupInfo.created.getTime();
        return Promise.resolve(this.userController.isGlobalAdmin() && Date.now() - customerCreationTime > daysToMillis(14));
    }
    render(newsId) {
        const recoveryCode = this.recoveryCode;
        // toggle the load if it's not started yet
        this.recoverCodeField.getAsync();
        // Will (always) be null on the first call of render() since getAsync() was just called for the first time.
        // When the redraw is triggered in the load function, it will be populated and rendered correctly.
        const RecoverCodeField = this.recoverCodeField.getSync();
        return m(".full-width", [
            m(".h4", {
                style: {
                    "text-transform": "capitalize",
                },
            }, lang.get("recoveryCode_label")),
            m("", lang.get("recoveryCodeReminder_msg")),
            recoveryCode
                ? RecoverCodeField
                    ? m(RecoverCodeField, {
                        showMessage: false,
                        recoverCode: recoveryCode,
                        showButtons: false,
                    })
                    : m(".flex.justify-center", progressIcon())
                : null,
            m(".flex-end.flex-no-grow-no-shrink-auto.flex-wrap", [
                recoveryCode
                    ? [this.renderCopyButton(recoveryCode), this.renderPrintButton(), this.confirmButton(newsId)]
                    : [this.renderDoneButton(newsId), this.renderDisplayButton()],
            ]),
        ]);
    }
    renderDoneButton(newsId) {
        return m(Button, {
            label: "done_action",
            type: "secondary" /* ButtonType.Secondary */,
            click: () => Dialog.showActionDialog({
                type: "EditSmall" /* DialogType.EditSmall */,
                okAction: async (dialog) => {
                    dialog.close();
                    this.newsModel.acknowledgeNews(newsId.newsItemId).then(m.redraw);
                },
                title: "recoveryCode_label",
                allowCancel: true,
                child: () => m("p", lang.get("recoveryCodeConfirmation_msg")),
            }),
        });
    }
    renderPrintButton() {
        if (isApp() || typeof window.print !== "function") {
            return null;
        }
        return m(Button, {
            label: "print_action",
            type: "secondary" /* ButtonType.Secondary */,
            click: () => {
                window.print();
            },
        });
    }
    renderCopyButton(recoveryCode) {
        return m(Button, {
            label: "copy_action",
            type: "secondary" /* ButtonType.Secondary */,
            click: () => {
                copyToClipboard(recoveryCode);
            },
        });
    }
    renderDisplayButton() {
        return m(Button, {
            label: "recoveryCodeDisplay_action",
            click: async () => {
                this.getRecoverCodeDialogAfterPasswordVerification(this.userController);
            },
            type: "primary" /* ButtonType.Primary */,
        });
    }
    confirmButton(newsId) {
        return m(Button, {
            label: "paymentDataValidation_action",
            click: async () => {
                await this.newsModel.acknowledgeNews(newsId.newsItemId);
                m.redraw();
            },
            type: "primary" /* ButtonType.Primary */,
        });
    }
    getRecoverCodeDialogAfterPasswordVerification(userController) {
        const dialog = showRequestPasswordDialog({
            action: (pw) => {
                const hasRecoveryCode = !!userController.user.auth?.recoverCode;
                return (hasRecoveryCode ? this.recoverCodeFacade.getRecoverCodeHex(pw) : this.recoverCodeFacade.createRecoveryCode(pw))
                    .then((recoverCode) => {
                    dialog.close();
                    this.recoveryCode = recoverCode;
                    return "";
                })
                    .catch(ofClass(NotAuthenticatedError, () => lang.get("invalidPassword_msg")))
                    .catch(ofClass(AccessBlockedError, () => lang.get("tooManyAttempts_msg")))
                    .finally(m.redraw);
            },
            cancel: {
                textId: "cancel_action",
                action: noOp,
            },
        });
    }
}
//# sourceMappingURL=RecoveryCodeNews.js.map