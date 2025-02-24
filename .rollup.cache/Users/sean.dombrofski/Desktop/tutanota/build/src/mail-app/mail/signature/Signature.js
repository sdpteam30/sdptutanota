import { lang } from "../../../common/misc/LanguageViewModel";
import { htmlSanitizer } from "../../../common/misc/HtmlSanitizer";
import { assertMainOrNode } from "../../../common/api/common/Env";
import { LINE_BREAK } from "../../../common/mailFunctionality/SharedMailUtils.js";
assertMainOrNode();
export function getDefaultSignature() {
    // add one line break to the default signature to add one empty line between signature and body
    return (LINE_BREAK +
        htmlSanitizer.sanitizeHTML(lang.get("defaultEmailSignature_msg", {
            "{1}": `<a href=${"https://tuta.com/free-email" /* InfoLink.HomePageFreeSignup */}>${"https://tuta.com/free-email" /* InfoLink.HomePageFreeSignup */}</a>`,
        })).html);
}
export function getEmailSignature(tutanotaProperties) {
    // provide the user signature, even for shared mail groups
    const type = tutanotaProperties.emailSignatureType;
    if (type === "0" /* TutanotaConstants.EMAIL_SIGNATURE_TYPE_DEFAULT */) {
        return getDefaultSignature();
    }
    else if ("1" /* TutanotaConstants.EMAIL_SIGNATURE_TYPE_CUSTOM */ === type) {
        return tutanotaProperties.customEmailSignature;
    }
    else {
        return "";
    }
}
export function appendEmailSignature(body, properties) {
    const signature = getEmailSignature(properties);
    if (signature) {
        // ensure that signature is on the next line
        return body + LINE_BREAK + signature;
    }
    else {
        return body;
    }
}
export function prependEmailSignature(body, logins) {
    // add space between signature and existing body
    let bodyWithSignature = "";
    let signature = getEmailSignature(logins.getUserController().props);
    if (body) {
        bodyWithSignature = LINE_BREAK + LINE_BREAK + LINE_BREAK + body;
    }
    if (logins.getUserController().isInternalUser() && signature) {
        // ensure that signature is on the next line
        bodyWithSignature = LINE_BREAK + signature + bodyWithSignature;
    }
    return bodyWithSignature;
}
//# sourceMappingURL=Signature.js.map