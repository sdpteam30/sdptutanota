/* generated file, don't edit. */
export class MobileFacadeReceiveDispatcher {
    facade;
    constructor(facade) {
        this.facade = facade;
    }
    async dispatch(method, arg) {
        switch (method) {
            case "handleBackPress": {
                return this.facade.handleBackPress();
            }
            case "visibilityChange": {
                const visibility = arg[0];
                return this.facade.visibilityChange(visibility);
            }
            case "keyboardSizeChanged": {
                const newSize = arg[0];
                return this.facade.keyboardSizeChanged(newSize);
            }
        }
    }
}
//# sourceMappingURL=MobileFacadeReceiveDispatcher.js.map