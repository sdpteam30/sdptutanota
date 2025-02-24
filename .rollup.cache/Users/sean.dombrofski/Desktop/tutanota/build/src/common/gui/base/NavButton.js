import m from "mithril";
import { handleUncaughtError } from "../../misc/ErrorHandler";
import { px, size } from "../size";
import { lazyStringValue, neverNull } from "@tutao/tutanota-utils";
import { Icon } from "./Icon";
import { theme } from "../theme";
import { styles } from "../styles";
import { lang } from "../../misc/LanguageViewModel";
import { Keys } from "../../api/common/TutanotaConstants";
import { isKeyPressed } from "../../misc/KeyManager";
import { assertMainOrNode, isDesktop } from "../../api/common/Env";
import { stateBgHover } from "../builtinThemes.js";
import { fileListToArray } from "../../api/common/utils/FileUtils.js";
assertMainOrNode();
export class NavButton {
    _domButton;
    _draggedOver;
    _dropCounter; // we also get drag enter/leave events from subelements, so we need to count to know when the drag leaves this button
    constructor() {
        this._draggedOver = false;
        this._dropCounter = 0;
    }
    view(vnode) {
        const a = vnode.attrs;
        const linkAttrs = this.createButtonAttributes(a);
        const icon = a.icon?.();
        const children = [
            a.leftInjection?.() ?? null,
            icon
                ? m(Icon, {
                    icon,
                    class: this._getIconClass(a),
                    style: {
                        fill: isNavButtonSelected(a) || this._draggedOver ? getColors(a.colors).button_selected : getColors(a.colors).button,
                    },
                })
                : null,
            !a.hideLabel ? m("span.label.click.text-ellipsis" + (!a.vertical && icon ? ".pl-m" : ""), lang.getTranslationText(a.label)) : null,
        ];
        // allow nav button without label for registration button on mobile devices
        if (this._isExternalUrl(a.href)) {
            return m(this._getNavButtonClass(a), linkAttrs, children);
        }
        else {
            return m(m.route.Link, linkAttrs, children);
        }
    }
    _getUrl(href) {
        return lazyStringValue(href);
    }
    _getNavButtonClass(a) {
        return ("a.nav-button.noselect.items-center.click.plr-button.no-text-decoration.button-height.border-radius" +
            (a.vertical ? ".col" : "") +
            (!a.centred ? ".flex-start" : ".flex-center") +
            (a.disableHoverBackground ? "" : ".state-bg") +
            (a.disabled ? ".no-hover" : "") +
            (a.fillSpaceAround ?? true ? ".flex-no-shrink" : ""));
    }
    _getIconClass(a) {
        const isSelected = isNavButtonSelected(a);
        if (a.colors === "header" /* NavButtonColor.Header */ && !styles.isDesktopLayout()) {
            return "flex-end items-center icon-xl" + (isSelected ? " selected" : "");
        }
        else if (a.small === true) {
            return "flex-center items-center icon" + (isSelected ? " selected" : "");
        }
        else {
            return "flex-center items-center icon-large" + (isSelected ? " selected" : "");
        }
    }
    _isExternalUrl(href) {
        let url = this._getUrl(href);
        return url != null ? url.indexOf("http") === 0 : false;
    }
    createButtonAttributes(a) {
        let attr = {
            role: "button",
            // role button for screen readers
            href: this._getUrl(a.href),
            style: {
                color: isNavButtonSelected(a) || this._draggedOver ? getColors(a.colors).button_selected : getColors(a.colors).button,
                "font-size": a.fontSize ? px(a.fontSize) : "",
                background: (isNavButtonSelected(a) && a.persistentBackground) || this._draggedOver ? stateBgHover : "",
            },
            title: lang.getTranslationText(a.label),
            target: this._isExternalUrl(a.href) ? "_blank" : undefined,
            selector: this._getNavButtonClass(a),
            onclick: (e) => this.click(e, a, e.target),
            onkeyup: (e, dom) => {
                if (isKeyPressed(e.key, Keys.SPACE)) {
                    this.click(e, a, dom);
                }
            },
            onfocus: a.onfocus,
            onblur: a.onblur,
            onkeydown: a.onkeydown,
            "data-testid": `btn:${lang.getTestId(a.label)}`,
        };
        if (a.dropHandler) {
            attr.ondragenter = (ev) => {
                this._dropCounter++;
                this._draggedOver = true;
                ev.preventDefault();
            };
            attr.ondragleave = (ev) => {
                this._dropCounter--;
                if (this._dropCounter === 0) {
                    this._draggedOver = false;
                }
                ev.preventDefault();
            };
            attr.ondragover = (ev) => {
                // needed to allow dropping
                ev.preventDefault();
            };
            attr.ondrop = (ev) => {
                this._dropCounter = 0;
                this._draggedOver = false;
                ev.preventDefault();
                ev.stopPropagation();
                if (ev.dataTransfer?.getData("Mail" /* DropType.Mail */)) {
                    let dropData = {
                        dropType: "Mail" /* DropType.Mail */,
                        mailId: ev.dataTransfer.getData("Mail" /* DropType.Mail */),
                    };
                    neverNull(a.dropHandler)(dropData);
                }
                else if (isDesktop() && ev.dataTransfer?.files && ev.dataTransfer.files.length > 0) {
                    neverNull(a.dropHandler)({
                        dropType: "ExternalFile" /* DropType.ExternalFile */,
                        files: fileListToArray(ev.dataTransfer.files),
                    });
                }
                else {
                    console.error("received onDrop DragEvent has invalid DropType or is unsupported on this platform!");
                }
            };
        }
        return attr;
    }
    click(event, a, dom) {
        if (!this._isExternalUrl(a.href)) {
            m.route.set(this._getUrl(a.href));
            try {
                if (a.click != null) {
                    a.click(event, dom);
                }
                event.preventDefault();
            }
            catch (e) {
                handleUncaughtError(e);
            }
        }
    }
    getHeight() {
        return size.button_height;
    }
}
function getColors(buttonColors) {
    switch (buttonColors) {
        case "header" /* NavButtonColor.Header */:
            return {
                button: styles.isDesktopLayout() ? theme.header_button : theme.content_accent,
                button_selected: styles.isDesktopLayout() ? theme.header_button_selected : theme.content_accent,
            };
        case "nav" /* NavButtonColor.Nav */:
            return {
                button: theme.navigation_button,
                button_selected: theme.navigation_button_selected,
            };
        default:
            // for nav buttons in the more dropdown menu
            return {
                button: theme.content_button,
                button_selected: theme.content_button_selected,
            };
    }
}
export function isNavButtonSelected(a) {
    if (typeof a.isSelectedPrefix === "boolean") {
        return a.isSelectedPrefix;
    }
    const selectedPrefix = a.isSelectedPrefix || lazyStringValue(a.href);
    return isSelectedPrefix(selectedPrefix);
}
export function isSelectedPrefix(href) {
    const current = m.route.get();
    // don't just check current.indexOf(buttonHref) because other buttons may also start with this href
    return href !== "" && (current === href || current.indexOf(href + "/") === 0 || current.indexOf(href + "?") === 0);
}
//# sourceMappingURL=NavButton.js.map