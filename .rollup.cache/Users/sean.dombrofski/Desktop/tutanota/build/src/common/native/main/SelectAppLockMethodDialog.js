import { Dialog } from "../../gui/base/Dialog.js";
import m from "mithril";
import { lang } from "../../misc/LanguageViewModel.js";
import { RadioSelector } from "../../gui/base/RadioSelector.js";
import { CredentialAuthenticationError } from "../../api/common/error/CredentialAuthenticationError.js";
import { liveDataAttrs } from "../../gui/AriaUtils.js";
import { defer } from "@tutao/tutanota-utils";
import { CancelledError } from "../../api/common/error/CancelledError.js";
import { Keys } from "../../api/common/TutanotaConstants.js";
import { BaseButton } from "../../gui/base/buttons/BaseButton.js";
export async function showAppLockMethodDialog(mobileSystemFacade) {
    await AppLockMethodDialog.showAndWaitForSelection(mobileSystemFacade);
}
class AppLockMethodDialog {
    mobileSystemFacade;
    supportedModes;
    previousSelection;
    error;
    finished;
    dialog;
    /** @private */
    constructor(mobileSystemFacade, supportedModes, previousSelection) {
        this.mobileSystemFacade = mobileSystemFacade;
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
                    null,
                    m(SelectAppLockMethodView, {
                        class: "scroll pt plr-l height-100p",
                        error: this.error,
                        onConfirm: (mode) => this.onMethodSelected(mode),
                        supportedModes: this.supportedModes,
                        previousSelection: this.previousSelection,
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
    static async showAndWaitForSelection(mobileSystemFacade) {
        const supportedModes = await mobileSystemFacade.getSupportedAppLockMethods();
        const previousSelection = await mobileSystemFacade.getAppLockMethod();
        const credentialsDialog = new AppLockMethodDialog(mobileSystemFacade, supportedModes, previousSelection);
        credentialsDialog.dialog.show();
        await credentialsDialog.finished.promise;
    }
    async onMethodSelected(mode) {
        try {
            // Make sure that the user can actually use the method before we save it.
            // Example: on iOS Biometrics will be supported but before the first use the user must give the permission anyway.
            await this.mobileSystemFacade.enforceAppLock(mode);
            await this.mobileSystemFacade.setAppLockMethod(mode);
            this.dialog.close();
            this.finished.resolve();
        }
        catch (e) {
            if (e instanceof CredentialAuthenticationError) {
                this.error = e.message;
                m.redraw();
            }
            else if (e instanceof CancelledError) {
                // ignore. this can happen if we switch app pin -> device lock and the user cancels the pin prompt.
            }
            else {
                throw e;
            }
        }
    }
}
export class SelectAppLockMethodView {
    currentMethod;
    constructor({ attrs }) {
        this.currentMethod = attrs.previousSelection;
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
                    selectedOption: this.currentMethod,
                    onOptionSelected: (mode) => {
                        this.currentMethod = mode;
                        attrs.onModeSelected?.(mode);
                    },
                })),
            ]),
            onConfirm ? this.renderSelectButton(() => onConfirm(this.currentMethod)) : null,
        ];
    }
    getSupportedOptions(attrs) {
        const generateOption = (name, value) => ({
            name,
            value,
        });
        const options = [
            generateOption("credentialsEncryptionModeDeviceLock_label", "0" /* AppLockMethod.None */),
            generateOption("credentialsEncryptionModeDeviceCredentials_label", "1" /* AppLockMethod.SystemPassOrBiometrics */),
            generateOption("credentialsEncryptionModeBiometrics_label", "2" /* AppLockMethod.Biometrics */),
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
//# sourceMappingURL=SelectAppLockMethodDialog.js.map