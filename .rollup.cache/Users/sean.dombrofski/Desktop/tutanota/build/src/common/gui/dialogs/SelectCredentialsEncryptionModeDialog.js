import { CredentialEncryptionMode } from "../../misc/credentials/CredentialEncryptionMode.js";
import { Dialog } from "../base/Dialog";
import m from "mithril";
import { lang } from "../../misc/LanguageViewModel";
import { DialogHeaderBar } from "../base/DialogHeaderBar";
import { RadioSelector } from "../base/RadioSelector";
import { CredentialAuthenticationError } from "../../api/common/error/CredentialAuthenticationError";
import { KeyPermanentlyInvalidatedError } from "../../api/common/error/KeyPermanentlyInvalidatedError";
import { liveDataAttrs } from "../AriaUtils";
import { defer } from "@tutao/tutanota-utils";
import { windowFacade } from "../../misc/WindowFacade";
import { CancelledError } from "../../api/common/error/CancelledError.js";
import { Keys } from "../../api/common/TutanotaConstants.js";
import { BaseButton } from "../base/buttons/BaseButton.js";
export const DEFAULT_CREDENTIAL_ENCRYPTION_MODE = CredentialEncryptionMode.DEVICE_LOCK;
export async function showCredentialsEncryptionModeDialog(credentialsProvider) {
    await CredentialEncryptionMethodDialog.showAndWaitForSelection(credentialsProvider);
}
class CredentialEncryptionMethodDialog {
    credentialsProvider;
    supportedModes;
    previousSelection;
    error;
    finished;
    dialog;
    constructor(credentialsProvider, supportedModes, previousSelection) {
        this.credentialsProvider = credentialsProvider;
        this.supportedModes = supportedModes;
        this.previousSelection = previousSelection;
        this.error = null;
        this.finished = defer();
        this.dialog = new Dialog("EditMedium" /* DialogType.EditMedium */, {
            view: () => {
                // We need custom dialog because:
                // - We don't need large dialog
                // - We want our selector button in the body and not in the header and it must stick to the bottom of the dialog
                //   (large dialog scrolls its contents and that's *not* what we want for that button).
                return m("", [
                    // Only allow skipping if it's first time user selects mode (not from settings)
                    previousSelection == null
                        ? m(DialogHeaderBar, {
                            left: () => [
                                {
                                    label: "skip_action",
                                    click: () => this.onModeSelected(DEFAULT_CREDENTIAL_ENCRYPTION_MODE),
                                    type: "secondary" /* ButtonType.Secondary */,
                                },
                            ],
                        })
                        : null,
                    m(SelectCredentialsEncryptionModeView, {
                        class: "scroll pt plr-l height-100p",
                        error: this.error,
                        onConfirm: (mode) => this.onModeSelected(mode),
                        supportedModes: this.supportedModes,
                        previousSelection: this.previousSelection ?? DEFAULT_CREDENTIAL_ENCRYPTION_MODE,
                    }),
                ]);
            },
        }).addShortcut({
            help: "close_alt",
            key: Keys.ESC,
            exec: () => this.dialog.close(),
        });
        this.dialog.setCloseHandler(() => {
            this.finished.resolve();
            this.dialog.close();
        });
    }
    static async showAndWaitForSelection(credentialsProvider) {
        const supportedModes = await credentialsProvider.getSupportedEncryptionModes();
        const previousSelection = await credentialsProvider.getCredentialEncryptionMode();
        const credentialsDialog = new CredentialEncryptionMethodDialog(credentialsProvider, supportedModes, previousSelection);
        credentialsDialog.dialog.show();
        await credentialsDialog.finished.promise;
    }
    async onModeSelected(mode) {
        try {
            await this.credentialsProvider.setCredentialEncryptionMode(mode);
            this.dialog.close();
            this.finished.resolve();
        }
        catch (e) {
            if (e instanceof CredentialAuthenticationError) {
                this.error = e.message;
                m.redraw();
            }
            else if (e instanceof KeyPermanentlyInvalidatedError) {
                await this.credentialsProvider.clearCredentials(e);
                this.dialog.close();
                await Dialog.message("credentialsKeyInvalidated_msg");
                windowFacade.reload({});
            }
            else if (e instanceof CancelledError) {
                // if the user cancels, is unrecognized by Face ID, enters an incorrect device password, etc., we should not close the dialog
                // and instead let them try again or choose a different encryption mode
            }
            else {
                throw e;
            }
        }
    }
}
export class SelectCredentialsEncryptionModeView {
    currentMode;
    constructor({ attrs }) {
        this.currentMode = attrs.previousSelection;
    }
    view({ attrs }) {
        const options = this.getSupportedOptions(attrs);
        const { onConfirm } = attrs;
        return [
            m(".flex.col", {
                class: attrs.class,
            }, [
                attrs.error ? m(".small.center.statusTextColor.pb-s", liveDataAttrs(), attrs.error) : null,
                m("", lang.get("credentialsEncryptionModeSelection_msg")),
                m(".mt", m(RadioSelector, {
                    name: "credentialsEncryptionMode_label",
                    options,
                    selectedOption: this.currentMode,
                    onOptionSelected: (mode) => {
                        this.currentMode = mode;
                        attrs.onModeSelected?.(mode);
                    },
                })),
            ]),
            onConfirm ? this.renderSelectButton(() => onConfirm(this.currentMode)) : null,
        ];
    }
    getSupportedOptions(attrs) {
        const generateOption = (name, value) => ({
            name,
            value,
        });
        const options = [
            generateOption("credentialsEncryptionModeDeviceLock_label", CredentialEncryptionMode.DEVICE_LOCK),
            generateOption("credentialsEncryptionModeDeviceCredentials_label", CredentialEncryptionMode.SYSTEM_PASSWORD),
            generateOption("credentialsEncryptionModeBiometrics_label", CredentialEncryptionMode.BIOMETRICS),
            generateOption("credentialsEncryptionModeAppPassword_label", CredentialEncryptionMode.APP_PASSWORD),
        ];
        return options.filter((option) => attrs.supportedModes.includes(option.value));
    }
    renderSelectButton(onclick) {
        return m(BaseButton, {
            label: "ok_action",
            text: lang.get("ok_action"),
            class: "uppercase accent-bg full-width center b content-fg flash",
            style: {
                height: "60px",
            },
            onclick,
        });
    }
}
//# sourceMappingURL=SelectCredentialsEncryptionModeDialog.js.map