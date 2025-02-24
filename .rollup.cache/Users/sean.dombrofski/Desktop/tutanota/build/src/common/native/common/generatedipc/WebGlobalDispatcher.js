/* generated file, don't edit. */
import { CommonNativeFacadeReceiveDispatcher } from "./CommonNativeFacadeReceiveDispatcher.js";
import { DesktopFacadeReceiveDispatcher } from "./DesktopFacadeReceiveDispatcher.js";
import { InterWindowEventFacadeReceiveDispatcher } from "./InterWindowEventFacadeReceiveDispatcher.js";
import { MobileFacadeReceiveDispatcher } from "./MobileFacadeReceiveDispatcher.js";
export class WebGlobalDispatcher {
    commonNativeFacade;
    desktopFacade;
    interWindowEventFacade;
    mobileFacade;
    constructor(commonNativeFacade, desktopFacade, interWindowEventFacade, mobileFacade) {
        this.commonNativeFacade = new CommonNativeFacadeReceiveDispatcher(commonNativeFacade);
        this.desktopFacade = new DesktopFacadeReceiveDispatcher(desktopFacade);
        this.interWindowEventFacade = new InterWindowEventFacadeReceiveDispatcher(interWindowEventFacade);
        this.mobileFacade = new MobileFacadeReceiveDispatcher(mobileFacade);
    }
    async dispatch(facadeName, methodName, args) {
        switch (facadeName) {
            case "CommonNativeFacade":
                return this.commonNativeFacade.dispatch(methodName, args);
            case "DesktopFacade":
                return this.desktopFacade.dispatch(methodName, args);
            case "InterWindowEventFacade":
                return this.interWindowEventFacade.dispatch(methodName, args);
            case "MobileFacade":
                return this.mobileFacade.dispatch(methodName, args);
            default:
                throw new Error("licc messed up! " + facadeName);
        }
    }
}
//# sourceMappingURL=WebGlobalDispatcher.js.map