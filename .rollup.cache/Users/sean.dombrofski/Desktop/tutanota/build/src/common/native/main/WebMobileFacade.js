import m from "mithril";
import { assertMainOrNode } from "../../api/common/Env";
import { modal } from "../../gui/base/Modal";
import { CALENDAR_PREFIX, CONTACTS_PREFIX, SEARCH_PREFIX, SETTINGS_PREFIX } from "../../misc/RouteChange";
import { last } from "@tutao/tutanota-utils";
import { SECOND_MS } from "../../api/common/TutanotaConstants.js";
import { styles } from "../../gui/styles";
import stream from "mithril/stream";
import { CalendarViewType } from "../../api/common/utils/CommonCalendarUtils.js";
assertMainOrNode();
/**
 * Handles press of the android back button. Returns true if the action has been processed by the application.
 * False if the caller must handle the button press (quit the application)
 */
export class WebMobileFacade {
    connectivityModel;
    baseViewPrefix;
    disconnectTimeoutId;
    isAppVisible = stream(false);
    constructor(connectivityModel, baseViewPrefix) {
        this.connectivityModel = connectivityModel;
        this.baseViewPrefix = baseViewPrefix;
    }
    getIsAppVisible() {
        return this.isAppVisible;
    }
    async handleBackPress() {
        await Promise.resolve();
        const lastModalComponent = last(modal.components);
        if (lastModalComponent) {
            // first check if any modal dialog is visible
            lastModalComponent.component.onClose();
            return true;
        }
        else {
            // otherwise try to navigate back in the current view
            const viewSlider = window.tutao.currentView?.getViewSlider?.();
            const currentRoute = m.route.get();
            // If the sidebar is opened, close it
            if (viewSlider && viewSlider.isForegroundColumnFocused()) {
                viewSlider.focusNextColumn();
                return true;
            }
            else if (this.handlesBackButtonViaCurrentView()) {
                return true;
            }
            else if (viewSlider &&
                viewSlider.focusedColumn !== viewSlider.getMainColumn() &&
                styles.isSingleColumnLayout() &&
                viewSlider.isFocusPreviousPossible()) {
                // current view can navigate back, a region column is focused (not main) and is in singleColumnLayout
                viewSlider.focusPreviousColumn();
                return true;
            }
            else if (currentRoute.startsWith(CALENDAR_PREFIX)) {
                if (history.state?.origin === CalendarViewType.MONTH) {
                    const date = history.state.dateString ?? new Date().toISOString().substring(0, 10);
                    m.route.set("/calendar/:view/:date", {
                        view: CalendarViewType.MONTH,
                        date,
                    });
                    return true;
                }
                if (this.baseViewPrefix === CALENDAR_PREFIX) {
                    // we are at the main view and want to exit the app
                    return false;
                }
                else {
                    m.route.set(this.baseViewPrefix);
                    return true;
                }
            }
            else if (currentRoute.startsWith(CONTACTS_PREFIX) || currentRoute.startsWith(SETTINGS_PREFIX) || currentRoute.startsWith(SEARCH_PREFIX)) {
                // go back to mail or calendar from other paths
                m.route.set(this.baseViewPrefix);
                return true;
            }
            else {
                return false;
            }
        }
    }
    handlesBackButtonViaCurrentView() {
        const currentView = window.tutao.currentView;
        return currentView?.handleBackButton != null && currentView.handleBackButton();
    }
    async visibilityChange(visibility) {
        console.log("native visibility change", visibility);
        this.isAppVisible(visibility);
        if (visibility) {
            if (this.disconnectTimeoutId != null) {
                clearTimeout(this.disconnectTimeoutId);
                this.disconnectTimeoutId = null;
            }
            return this.connectivityModel.tryReconnect(false, true);
        }
        else {
            this.disconnectTimeoutId = setTimeout(() => {
                this.connectivityModel.close("pause" /* CloseEventBusOption.Pause */);
            }, 30 * SECOND_MS);
        }
    }
    async keyboardSizeChanged(newSize) {
        const { windowFacade } = await import("../../misc/WindowFacade.js");
        return windowFacade.onKeyboardSizeChanged(newSize);
    }
}
//# sourceMappingURL=WebMobileFacade.js.map