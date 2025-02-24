import { noOp } from "@tutao/tutanota-utils";
export class SanitizedTextViewModel {
    text;
    sanitizer;
    uiUpdateCallback;
    sanitizedText = null;
    constructor(text, sanitizer, uiUpdateCallback = noOp) {
        this.text = text;
        this.sanitizer = sanitizer;
        this.uiUpdateCallback = uiUpdateCallback;
    }
    set content(v) {
        this.sanitizedText = null;
        this.text = v;
        this.uiUpdateCallback();
    }
    get content() {
        if (this.sanitizedText == null) {
            this.sanitizedText = this.sanitizer.sanitizeHTML(this.text, { blockExternalContent: false }).html;
        }
        return this.sanitizedText;
    }
}
//# sourceMappingURL=SanitizedTextViewModel.js.map