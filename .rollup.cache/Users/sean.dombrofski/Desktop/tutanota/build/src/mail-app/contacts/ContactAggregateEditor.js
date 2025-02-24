import { TextField } from "../../common/gui/base/TextField.js";
import { lang } from "../../common/misc/LanguageViewModel";
import m from "mithril";
import { animations, height, opacity } from "../../common/gui/animation/Animations";
import { attachDropdown } from "../../common/gui/base/Dropdown.js";
import { IconButton } from "../../common/gui/base/IconButton.js";
export class ContactAggregateEditor {
    oncreate(vnode) {
        const animate = typeof vnode.attrs.animateCreate === "boolean" ? vnode.attrs.animateCreate : true;
        if (animate)
            this.animate(vnode.dom, true);
    }
    async onbeforeremove(vnode) {
        await this.animate(vnode.dom, false);
    }
    view(vnode) {
        const attrs = vnode.attrs;
        return m(".flex.items-center.child-grow", [
            m(TextField, {
                value: attrs.value,
                label: attrs.label,
                type: attrs.fieldType,
                autocapitalize: attrs.autocapitalizeTextField,
                helpLabel: () => lang.getTranslationText(attrs.helpLabel),
                injectionsRight: () => this._moreButtonFor(attrs),
                oninput: (value) => attrs.onUpdate(value),
            }),
            this._cancelButtonFor(attrs),
        ]);
    }
    _doesAllowCancel(attrs) {
        return typeof attrs.allowCancel === "boolean" ? attrs.allowCancel : true;
    }
    _cancelButtonFor(attrs) {
        if (this._doesAllowCancel(attrs)) {
            return m(IconButton, {
                title: "remove_action",
                click: () => attrs.cancelAction(),
                icon: "Cancel" /* Icons.Cancel */,
            });
        }
        else {
            // placeholder so that the text field does not jump around
            return m(".icon-button");
        }
    }
    _moreButtonFor(attrs) {
        return m(IconButton, attachDropdown({
            mainButtonAttrs: {
                title: "more_label",
                icon: "Expand" /* BootIcons.Expand */,
                size: 1 /* ButtonSize.Compact */,
            },
            childAttrs: () => attrs.typeLabels.map(([key, value]) => {
                return {
                    label: value,
                    click: () => attrs.onTypeSelected(key),
                };
            }),
        }));
    }
    animate(domElement, fadein) {
        let childHeight = domElement.offsetHeight;
        if (fadein) {
            domElement.style.opacity = "0";
        }
        const opacityP = animations.add(domElement, fadein ? opacity(0, 1, true) : opacity(1, 0, true));
        const heightP = animations.add(domElement, fadein ? height(0, childHeight) : height(childHeight, 0));
        heightP.then(() => {
            domElement.style.height = "";
        });
        return Promise.all([opacityP, heightP]);
    }
}
//# sourceMappingURL=ContactAggregateEditor.js.map