import { exposeRemote } from "./WorkerProxy.js";
export function exposeNativeInterface(native) {
    return exposeRemote((request) => native.invokeNative(request.requestType, request.args));
}
//# sourceMappingURL=ExposeNativeInterface.js.map