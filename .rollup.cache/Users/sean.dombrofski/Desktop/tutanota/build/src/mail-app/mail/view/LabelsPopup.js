import m from "mithril";
import { modal } from "../../../common/gui/base/Modal.js";
import { focusNext, focusPrevious } from "../../../common/misc/KeyManager.js";
import { BaseButton } from "../../../common/gui/base/buttons/BaseButton.js";
import { showDropdown } from "../../../common/gui/base/Dropdown.js";
import { size } from "../../../common/gui/size.js";
import { Icon, IconSize } from "../../../common/gui/base/Icon.js";
import { theme } from "../../../common/gui/theme.js";
import { Keys, MAX_LABELS_PER_MAIL } from "../../../common/api/common/TutanotaConstants.js";
import { getElementId } from "../../../common/api/common/utils/EntityUtils.js";
import { getLabelColor } from "../../../common/gui/base/Label.js";
import { lang } from "../../../common/misc/LanguageViewModel.js";
import { noOp } from "@tutao/tutanota-utils";
/**
 * Popup that displays assigned labels and allows changing them
 */
export class LabelsPopup {
    sourceElement;
    origin;
    width;
    labelsForMails;
    labels;
    onLabelsApplied;
    dom = null;
    isMaxLabelsReached;
    constructor(sourceElement, origin, width, labelsForMails, labels, onLabelsApplied) {
        this.sourceElement = sourceElement;
        this.origin = origin;
        this.width = width;
        this.labelsForMails = labelsForMails;
        this.labels = labels;
        this.onLabelsApplied = onLabelsApplied;
        this.view = this.view.bind(this);
        this.oncreate = this.oncreate.bind(this);
        this.isMaxLabelsReached = this.checkIsMaxLabelsReached();
    }
    async hideAnimation() { }
    onClose() {
        modal.remove(this);
    }
    shortcuts() {
        return this.shortCuts;
    }
    backgroundClick(e) {
        modal.remove(this);
    }
    popState(e) {
        return true;
    }
    callingElement() {
        return this.sourceElement;
    }
    view() {
        return m(".flex.col.elevated-bg.abs.dropdown-shadow.pt-s.border-radius", { tabindex: "-1" /* TabIndex.Programmatic */, role: "Menu" /* AriaRole.Menu */ }, [
            m(".pb-s.scroll", this.labels.map((labelState) => {
                const { label, state } = labelState;
                const color = theme.content_button;
                const canToggleLabel = state === 0 /* LabelState.Applied */ || state === 1 /* LabelState.AppliedToSome */ || !this.isMaxLabelsReached;
                const opacity = !canToggleLabel ? 0.5 : undefined;
                return m("label-item.flex.items-center.plr.state-bg.cursor-pointer", {
                    "data-labelid": getElementId(label),
                    role: "menuitemcheckbox" /* AriaRole.MenuItemCheckbox */,
                    tabindex: "0" /* TabIndex.Default */,
                    "aria-checked": ariaCheckedForState(state),
                    "aria-disabled": !canToggleLabel,
                    onclick: canToggleLabel ? () => this.toggleLabel(labelState) : noOp,
                }, [
                    m(Icon, {
                        icon: this.iconForState(state),
                        size: IconSize.Medium,
                        style: {
                            fill: getLabelColor(label.color),
                            opacity,
                        },
                    }),
                    m(".button-height.flex.items-center.ml.overflow-hidden", { style: { color, opacity } }, m(".text-ellipsis", label.name)),
                ]);
            })),
            this.isMaxLabelsReached && m(".small.center.pb-s", lang.get("maximumLabelsPerMailReached_msg")),
            m(BaseButton, {
                label: "apply_action",
                text: lang.get("apply_action"),
                class: "limit-width noselect bg-transparent button-height text-ellipsis content-accent-fg flex items-center plr-button button-content justify-center border-top state-bg",
                onclick: () => {
                    this.applyLabels();
                },
            }),
            m(BaseButton, {
                label: "close_alt",
                text: lang.get("close_alt"),
                class: "hidden-until-focus content-accent-fg button-content",
                onclick: () => {
                    modal.remove(this);
                },
            }),
        ]);
    }
    iconForState(state) {
        switch (state) {
            case 1 /* LabelState.AppliedToSome */:
                return "LabelPartial" /* Icons.LabelPartial */;
            case 0 /* LabelState.Applied */:
                return "Label" /* Icons.Label */;
            case 2 /* LabelState.NotApplied */:
                return "LabelOutline" /* Icons.LabelOutline */;
        }
    }
    checkIsMaxLabelsReached() {
        const { addedLabels, removedLabels } = this.getSortedLabels();
        if (addedLabels.length >= MAX_LABELS_PER_MAIL) {
            return true;
        }
        for (const [, labels] of this.labelsForMails) {
            const labelsOnMail = new Set(labels.map((label) => getElementId(label)));
            for (const label of removedLabels) {
                labelsOnMail.delete(getElementId(label));
            }
            if (labelsOnMail.size >= MAX_LABELS_PER_MAIL) {
                return true;
            }
            for (const label of addedLabels) {
                labelsOnMail.add(getElementId(label));
                if (labelsOnMail.size >= MAX_LABELS_PER_MAIL) {
                    return true;
                }
            }
        }
        return false;
    }
    getSortedLabels() {
        const removedLabels = [];
        const addedLabels = [];
        for (const { label, state } of this.labels) {
            if (state === 0 /* LabelState.Applied */) {
                addedLabels.push(label);
            }
            else if (state === 2 /* LabelState.NotApplied */) {
                removedLabels.push(label);
            }
        }
        return { addedLabels, removedLabels };
    }
    applyLabels() {
        const { addedLabels, removedLabels } = this.getSortedLabels();
        this.onLabelsApplied(addedLabels, removedLabels);
        modal.remove(this);
    }
    oncreate(vnode) {
        this.dom = vnode.dom;
        // restrict label height to showing maximum 6 labels to avoid overflow
        const displayedLabels = Math.min(this.labels.length, 6);
        const height = (displayedLabels + 1) * size.button_height + size.vpad_small * 2;
        showDropdown(this.origin, this.dom, height, this.width).then(() => {
            const firstLabel = vnode.dom.getElementsByTagName("label-item").item(0);
            if (firstLabel !== null) {
                ;
                firstLabel.focus();
            }
            else {
                ;
                vnode.dom.focus();
            }
        });
    }
    shortCuts = [
        {
            key: Keys.ESC,
            exec: () => this.onClose(),
            help: "close_alt",
        },
        {
            key: Keys.TAB,
            shift: true,
            exec: () => (this.dom ? focusPrevious(this.dom) : false),
            help: "selectPrevious_action",
        },
        {
            key: Keys.TAB,
            shift: false,
            exec: () => (this.dom ? focusNext(this.dom) : false),
            help: "selectNext_action",
        },
        {
            key: Keys.UP,
            exec: () => (this.dom ? focusPrevious(this.dom) : false),
            help: "selectPrevious_action",
        },
        {
            key: Keys.DOWN,
            exec: () => (this.dom ? focusNext(this.dom) : false),
            help: "selectNext_action",
        },
        {
            key: Keys.RETURN,
            exec: () => this.applyLabels(),
            help: "ok_action",
        },
        {
            key: Keys.SPACE,
            exec: () => {
                const labelId = document.activeElement?.getAttribute("data-labelid");
                if (labelId) {
                    const labelItem = this.labels.find((item) => getElementId(item.label) === labelId);
                    if (labelItem) {
                        this.toggleLabel(labelItem);
                    }
                }
                else {
                    return true;
                }
            },
            help: "ok_action",
        },
    ];
    show() {
        modal.displayUnique(this, false);
    }
    toggleLabel(labelState) {
        switch (labelState.state) {
            case 1 /* LabelState.AppliedToSome */:
                labelState.state = this.isMaxLabelsReached ? 2 /* LabelState.NotApplied */ : 0 /* LabelState.Applied */;
                break;
            case 2 /* LabelState.NotApplied */:
                labelState.state = 0 /* LabelState.Applied */;
                break;
            case 0 /* LabelState.Applied */:
                labelState.state = 2 /* LabelState.NotApplied */;
                break;
        }
        this.isMaxLabelsReached = this.checkIsMaxLabelsReached();
    }
}
function ariaCheckedForState(state) {
    switch (state) {
        case 0 /* LabelState.Applied */:
            return "true";
        case 1 /* LabelState.AppliedToSome */:
            return "mixed";
        case 2 /* LabelState.NotApplied */:
            return "false";
    }
}
//# sourceMappingURL=LabelsPopup.js.map