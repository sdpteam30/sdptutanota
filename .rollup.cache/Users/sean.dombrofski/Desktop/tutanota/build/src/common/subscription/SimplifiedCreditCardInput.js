import m from "mithril";
import { TextField } from "../gui/base/TextField.js";
import { lang } from "../misc/LanguageViewModel.js";
// changing the content (ie grouping) sets selection to the end, this restores it after the next redraw.
function restoreSelection(domInput) {
    const { selectionStart, selectionEnd, selectionDirection } = domInput;
    const isAtEnd = domInput.value.length === selectionStart;
    setTimeout(() => {
        const currentLength = domInput.value.length;
        // we're adding characters, so just re-using the index fails because at the time we set the selection, the string is longer than it was.
        // this mostly works, but fails in cases where we're adding stuff in the middle of the string.
        domInput.setSelectionRange(isAtEnd ? currentLength : selectionStart, isAtEnd ? currentLength : selectionEnd, selectionDirection ?? undefined);
    }, 0);
}
export class SimplifiedCreditCardInput {
    dateFieldLeft = false;
    numberFieldLeft = false;
    cvvFieldLeft = false;
    ccNumberDom = null;
    expDateDom = null;
    view(vnode) {
        let { viewModel } = vnode.attrs;
        return [
            m(TextField, {
                label: "creditCardNumber_label",
                helpLabel: () => this.renderCcNumberHelpLabel(viewModel),
                value: viewModel.creditCardNumber,
                oninput: (newValue) => {
                    viewModel.creditCardNumber = newValue;
                    restoreSelection(this.ccNumberDom);
                },
                onblur: () => (this.numberFieldLeft = true),
                autocompleteAs: "cc-number" /* Autocomplete.ccNumber */,
                onDomInputCreated: (dom) => (this.ccNumberDom = dom),
            }),
            m(TextField, {
                label: "creditCardExpirationDateWithFormat_label",
                value: viewModel.expirationDate,
                // we only show the hint if the field is not empty and not selected to avoid showing errors while the user is typing.
                helpLabel: () => (this.dateFieldLeft ? lang.get(viewModel.getExpirationDateErrorHint() ?? "emptyString_msg") : lang.get("emptyString_msg")),
                onblur: () => (this.dateFieldLeft = true),
                oninput: (newValue) => {
                    viewModel.expirationDate = newValue;
                    restoreSelection(this.expDateDom);
                },
                onDomInputCreated: (dom) => (this.expDateDom = dom),
                autocompleteAs: "cc-exp" /* Autocomplete.ccExp */,
            }),
            m(TextField, {
                label: lang.makeTranslation("cvv", viewModel.getCvvLabel()),
                value: viewModel.cvv,
                helpLabel: () => this.renderCvvNumberHelpLabel(viewModel),
                oninput: (newValue) => (viewModel.cvv = newValue),
                onblur: () => (this.cvvFieldLeft = true),
                autocompleteAs: "cc-csc" /* Autocomplete.ccCsc */,
            }),
        ];
    }
    renderCcNumberHelpLabel(model) {
        const hint = model.getCreditCardNumberHint();
        const error = model.getCreditCardNumberErrorHint();
        // we only draw the hint if the number field was entered & exited before
        if (this.numberFieldLeft) {
            if (hint) {
                return error ? lang.get("creditCardHintWithError_msg", { "{hint}": hint, "{errorText}": error }) : hint;
            }
            else {
                return error ? error : lang.get("emptyString_msg");
            }
        }
        else {
            return hint ?? lang.get("emptyString_msg");
        }
    }
    renderCvvNumberHelpLabel(model) {
        const cvvHint = model.getCvvHint();
        const cvvError = model.getCvvErrorHint();
        if (this.cvvFieldLeft) {
            if (cvvHint) {
                return cvvError ? lang.get("creditCardHintWithError_msg", { "{hint}": cvvHint, "{errorText}": cvvError }) : cvvHint;
            }
            else {
                return cvvError ? cvvError : lang.get("emptyString_msg");
            }
        }
        else {
            return cvvHint ?? lang.get("emptyString_msg");
        }
    }
}
//# sourceMappingURL=SimplifiedCreditCardInput.js.map