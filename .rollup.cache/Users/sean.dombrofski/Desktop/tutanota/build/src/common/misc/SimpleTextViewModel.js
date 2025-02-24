import { noOp } from "@tutao/tutanota-utils";
/**
 * Text view model suitable for data entry that isn't rendered as HTML
 */
export class SimpleTextViewModel {
    text;
    uiUpdateCallback;
    constructor(text, uiUpdateCallback = noOp) {
        this.text = text;
        this.uiUpdateCallback = uiUpdateCallback;
    }
    set content(text) {
        this.text = text;
        this.uiUpdateCallback();
    }
    get content() {
        return this.text;
    }
}
//# sourceMappingURL=SimpleTextViewModel.js.map