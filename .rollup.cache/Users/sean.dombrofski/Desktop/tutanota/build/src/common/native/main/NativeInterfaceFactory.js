import { NativeInterfaceMain } from "./NativeInterfaceMain.js";
import { NativePushServiceApp } from "./NativePushServiceApp.js";
import { NativeFileApp } from "../common/FileApp.js";
import { isBrowser, isElectronClient } from "../../api/common/Env.js";
import { ProgrammingError } from "../../api/common/error/ProgrammingError.js";
import { deviceConfig } from "../../misc/DeviceConfig.js";
import { WebGlobalDispatcher } from "../common/generatedipc/WebGlobalDispatcher.js";
import { NativePushFacadeSendDispatcher } from "../common/generatedipc/NativePushFacadeSendDispatcher.js";
import { FileFacadeSendDispatcher } from "../common/generatedipc/FileFacadeSendDispatcher.js";
import { ExportFacadeSendDispatcher } from "../common/generatedipc/ExportFacadeSendDispatcher.js";
import { CommonSystemFacadeSendDispatcher } from "../common/generatedipc/CommonSystemFacadeSendDispatcher.js";
import { MobileSystemFacadeSendDispatcher } from "../common/generatedipc/MobileSystemFacadeSendDispatcher.js";
import { ThemeFacadeSendDispatcher } from "../common/generatedipc/ThemeFacadeSendDispatcher.js";
import { SearchTextInAppFacadeSendDispatcher } from "../common/generatedipc/SearchTextInAppFacadeSendDispatcher.js";
import { SettingsFacadeSendDispatcher } from "../common/generatedipc/SettingsFacadeSendDispatcher.js";
import { DesktopSystemFacadeSendDispatcher } from "../common/generatedipc/DesktopSystemFacadeSendDispatcher.js";
import { InterWindowEventFacadeSendDispatcher } from "../common/generatedipc/InterWindowEventFacadeSendDispatcher.js";
import { MobileContactsFacadeSendDispatcher } from "../common/generatedipc/MobileContactsFacadeSendDispatcher.js";
import { NativeCredentialsFacadeSendDispatcher } from "../common/generatedipc/NativeCredentialsFacadeSendDispatcher.js";
import { MobilePaymentsFacadeSendDispatcher } from "../common/generatedipc/MobilePaymentsFacadeSendDispatcher.js";
import { ExternalCalendarFacadeSendDispatcher } from "../common/generatedipc/ExternalCalendarFacadeSendDispatcher.js";
import { NativeMailImportFacadeSendDispatcher } from "../common/generatedipc/NativeMailImportFacadeSendDispatcher";
/**
 * @returns NativeInterfaces
 * @throws ProgrammingError when you try to call this in the web browser
 */
export function createNativeInterfaces(mobileFacade, desktopFacade, interWindowEventFacade, commonNativeFacade, cryptoFacade, calendarFacade, entityClient, logins, app) {
    if (isBrowser()) {
        throw new ProgrammingError("Tried to make native interfaces in non-native");
    }
    const dispatcher = new WebGlobalDispatcher(commonNativeFacade, desktopFacade, interWindowEventFacade, mobileFacade);
    const native = new NativeInterfaceMain(dispatcher);
    const nativePushFacadeSendDispatcher = new NativePushFacadeSendDispatcher(native);
    const pushService = new NativePushServiceApp(nativePushFacadeSendDispatcher, logins, cryptoFacade, entityClient, deviceConfig, calendarFacade, app);
    const fileApp = new NativeFileApp(new FileFacadeSendDispatcher(native), new ExportFacadeSendDispatcher(native));
    const commonSystemFacade = new CommonSystemFacadeSendDispatcher(native);
    const mobileSystemFacade = new MobileSystemFacadeSendDispatcher(native);
    const themeFacade = new ThemeFacadeSendDispatcher(native);
    const mobileContactsFacade = new MobileContactsFacadeSendDispatcher(native);
    const nativeCredentialsFacade = new NativeCredentialsFacadeSendDispatcher(native);
    const mobilePaymentsFacade = new MobilePaymentsFacadeSendDispatcher(native);
    const externalCalendarFacade = new ExternalCalendarFacadeSendDispatcher(native);
    return {
        native,
        fileApp,
        pushService,
        mobileSystemFacade,
        commonSystemFacade,
        themeFacade,
        mobileContactsFacade,
        nativeCredentialsFacade,
        mobilePaymentsFacade,
        externalCalendarFacade,
    };
}
export function createDesktopInterfaces(native) {
    if (!isElectronClient()) {
        throw new ProgrammingError("tried to create desktop interfaces in non-electron client");
    }
    return {
        searchTextFacade: new SearchTextInAppFacadeSendDispatcher(native),
        desktopSettingsFacade: new SettingsFacadeSendDispatcher(native),
        desktopSystemFacade: new DesktopSystemFacadeSendDispatcher(native),
        nativeMailImportFacade: new NativeMailImportFacadeSendDispatcher(native),
        interWindowEventSender: new InterWindowEventFacadeSendDispatcher(native),
        exportFacade: new ExportFacadeSendDispatcher(native),
    };
}
//# sourceMappingURL=NativeInterfaceFactory.js.map