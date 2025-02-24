import m from "mithril";
import { SetupPageLayout } from "./SetupPageLayout.js";
import { SelectAppLockMethodView } from "../../SelectAppLockMethodDialog.js";
import { CredentialAuthenticationError } from "../../../../api/common/error/CredentialAuthenticationError.js";
import { CancelledError } from "../../../../api/common/error/CancelledError.js";
export class SetupLockPage {
    view({ attrs }) {
        return m(SetupPageLayout, { image: "lock", buttonLabel: "finish_action" }, [
            m(SelectAppLockMethodView, {
                class: "mt",
                error: attrs.error,
                supportedModes: attrs.supportedModes,
                previousSelection: attrs.currentMode,
                onConfirm: null,
                onModeSelected: (mode) => (attrs.currentMode = mode),
            }),
        ]);
    }
}
export class SetupLockPageAttrs {
    mobileSystemFacade;
    hidePagingButtonForPage = false;
    data = null;
    error = null;
    supportedModes = [];
    currentMode = "0" /* AppLockMethod.None */;
    constructor(mobileSystemFacade) {
        this.mobileSystemFacade = mobileSystemFacade;
        mobileSystemFacade.getSupportedAppLockMethods().then((supportedMethods) => {
            this.supportedModes = supportedMethods;
            m.redraw();
        });
        this.mobileSystemFacade.getAppLockMethod().then((appLockMethod) => {
            this.currentMode = appLockMethod;
            m.redraw();
        });
    }
    headerTitle() {
        return "credentialsEncryptionMode_label";
    }
    async nextAction(showDialogs) {
        try {
            await this.mobileSystemFacade.enforceAppLock(this.currentMode);
            await this.mobileSystemFacade.setAppLockMethod(this.currentMode);
        }
        catch (e) {
            if (e instanceof CredentialAuthenticationError) {
                this.error = e.message;
                m.redraw();
                return false;
            }
            else if (e instanceof CancelledError) {
                // if the user cancels, is unrecognized by Face ID, enters an incorrect device password, etc., we should not close the dialog
                // and instead let them try again or choose a different encryption mode
                return false;
            }
            else {
                throw e;
            }
        }
        // next action not available for this page
        return true;
    }
    isSkipAvailable() {
        return false;
    }
    isEnabled() {
        return this.supportedModes.length > 1;
    }
}
//# sourceMappingURL=SetupLockPage.js.map