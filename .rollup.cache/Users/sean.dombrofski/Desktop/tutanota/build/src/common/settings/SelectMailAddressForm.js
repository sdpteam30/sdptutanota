import m from "mithril";
import { lang } from "../misc/LanguageViewModel.js";
import { isMailAddress } from "../misc/FormatValidator.js";
import { AccessDeactivatedError } from "../api/common/error/RestError.js";
import { formatMailAddressFromParts } from "../misc/Formatter.js";
import { Icon } from "../gui/base/Icon.js";
import { locator } from "../api/main/CommonLocator.js";
import { assertMainOrNode } from "../api/common/Env.js";
import { px, size } from "../gui/size.js";
import { inputLineHeight, TextField } from "../gui/base/TextField.js";
import { attachDropdown } from "../gui/base/Dropdown.js";
import { IconButton } from "../gui/base/IconButton.js";
import { isTutaMailAddress } from "../mailFunctionality/SharedMailUtils.js";
assertMainOrNode();
const VALID_MESSAGE_ID = "mailAddressAvailable_msg";
export class SelectMailAddressForm {
    username;
    messageId;
    checkAddressTimeout;
    isVerificationBusy;
    lastAttrs;
    constructor({ attrs }) {
        this.lastAttrs = attrs;
        this.isVerificationBusy = false;
        this.checkAddressTimeout = null;
        this.username = "";
        this.messageId = "mailAddressNeutral_msg";
    }
    onupdate(vnode) {
        if (this.lastAttrs.selectedDomain.domain !== vnode.attrs.selectedDomain.domain) {
            this.verifyMailAddress(vnode.attrs);
        }
        this.lastAttrs = vnode.attrs;
    }
    view({ attrs }) {
        // this is a semi-good hack to reset the username after the user pressed "ok"
        // this behavior is not necessarily expected, e.g. if the user enters an invalid email address and presses "ok" we might not want to clear the
        // username field. we would need to find a way to clear the field from the outside to solve this.
        if (attrs.injectionsRightButtonAttrs?.click) {
            const originalCallback = attrs.injectionsRightButtonAttrs.click;
            attrs.injectionsRightButtonAttrs.click = (event, dom) => {
                originalCallback(event, dom);
                this.username = "";
                this.messageId = "mailAddressNeutral_msg";
            };
        }
        return m(TextField, {
            label: "mailAddress_label",
            value: this.username,
            alignRight: true,
            autocompleteAs: "new-password" /* Autocomplete.newPassword */,
            autocapitalize: "none" /* Autocapitalize.none */,
            helpLabel: () => this.addressHelpLabel(),
            fontSize: px(size.font_size_smaller),
            oninput: (value) => {
                this.username = value;
                this.verifyMailAddress(attrs);
            },
            injectionsRight: () => [
                m(".flex.items-end.align-self-end", {
                    style: {
                        "padding-bottom": "1px",
                        flex: "1 1 auto",
                        fontSize: px(size.font_size_smaller),
                        lineHeight: px(inputLineHeight),
                    },
                }, `@${attrs.selectedDomain.domain}`),
                attrs.availableDomains.length > 1
                    ? m(IconButton, attachDropdown({
                        mainButtonAttrs: {
                            title: "domain_label",
                            icon: "Expand" /* BootIcons.Expand */,
                            size: 1 /* ButtonSize.Compact */,
                        },
                        childAttrs: () => attrs.availableDomains.map((domain) => this.createDropdownItemAttrs(domain, attrs)),
                        showDropdown: () => true,
                        width: 250,
                    }))
                    : attrs.injectionsRightButtonAttrs
                        ? m(IconButton, attrs.injectionsRightButtonAttrs)
                        : null,
            ],
        });
    }
    getCleanMailAddress(attrs) {
        return formatMailAddressFromParts(this.username, attrs.selectedDomain.domain);
    }
    addressHelpLabel() {
        return this.isVerificationBusy
            ? m(".flex.items-center.mt-s", [this.progressIcon(), lang.get("mailAddressBusy_msg")])
            : m(".mt-s", lang.get(this.messageId ?? VALID_MESSAGE_ID));
    }
    progressIcon() {
        return m(Icon, {
            icon: "Progress" /* BootIcons.Progress */,
            class: "icon-progress mr-s",
        });
    }
    createDropdownItemAttrs(domainData, attrs) {
        return {
            label: lang.makeTranslation("domain", domainData.domain),
            click: () => {
                attrs.onDomainChanged(domainData);
            },
            icon: domainData.isPaid ? "Premium" /* BootIcons.Premium */ : undefined,
        };
    }
    onBusyStateChanged(isBusy, onBusyStateChanged) {
        this.isVerificationBusy = isBusy;
        onBusyStateChanged(isBusy);
        m.redraw();
    }
    onValidationFinished(email, validationResult, onValidationResult) {
        this.messageId = validationResult.errorId;
        onValidationResult(email, validationResult);
    }
    verifyMailAddress(attrs) {
        const { onValidationResult, onBusyStateChanged } = attrs;
        if (this.checkAddressTimeout)
            clearTimeout(this.checkAddressTimeout);
        const cleanMailAddress = this.getCleanMailAddress(attrs);
        const cleanUsername = this.username.trim().toLowerCase();
        if (cleanUsername === "") {
            this.onValidationFinished(cleanMailAddress, {
                isValid: false,
                errorId: "mailAddressNeutral_msg",
            }, onValidationResult);
            this.onBusyStateChanged(false, onBusyStateChanged);
            return;
        }
        else if (!isMailAddress(cleanMailAddress, true) || (isTutaMailAddress(cleanMailAddress) && cleanUsername.length < 3)) {
            this.onValidationFinished(cleanMailAddress, {
                isValid: false,
                errorId: "mailAddressInvalid_msg",
            }, onValidationResult);
            this.onBusyStateChanged(false, onBusyStateChanged);
            return;
        }
        this.onBusyStateChanged(true, onBusyStateChanged);
        this.checkAddressTimeout = setTimeout(async () => {
            if (this.getCleanMailAddress(attrs) !== cleanMailAddress)
                return;
            let result;
            try {
                const available = await locator.mailAddressFacade.isMailAddressAvailable(cleanMailAddress);
                result = available
                    ? { isValid: true, errorId: null }
                    : {
                        isValid: false,
                        errorId: attrs.mailAddressNAError ?? "mailAddressNA_msg",
                    };
            }
            catch (e) {
                if (e instanceof AccessDeactivatedError) {
                    result = { isValid: false, errorId: "mailAddressDelay_msg" };
                }
                else {
                    throw e;
                }
            }
            finally {
                if (this.getCleanMailAddress(attrs) === cleanMailAddress) {
                    this.onBusyStateChanged(false, onBusyStateChanged);
                }
            }
            if (this.getCleanMailAddress(attrs) === cleanMailAddress) {
                this.onValidationFinished(cleanMailAddress, result, onValidationResult);
            }
        }, 500);
    }
}
//# sourceMappingURL=SelectMailAddressForm.js.map