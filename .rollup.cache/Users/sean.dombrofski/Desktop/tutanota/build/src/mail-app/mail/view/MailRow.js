import { getMailFolderType, MailSetKind } from "../../../common/api/common/TutanotaConstants";
import { FontIcons } from "../../../common/gui/base/icons/FontIcons";
import { formatTimeOrDateOrYesterday } from "../../../common/misc/Formatter.js";
import m from "mithril";
import Badge from "../../../common/gui/base/Badge";
import { checkboxOpacity, scaleXHide, scaleXShow, selectableRowAnimParams, SelectableRowContainer, setVisibility, shouldAlwaysShowMultiselectCheckbox, } from "../../../common/gui/SelectableRowContainer.js";
import { px, size } from "../../../common/gui/size.js";
import { NBSP, noOp } from "@tutao/tutanota-utils";
import { companyTeamLabel } from "../../../common/misc/ClientConstants.js";
import { getConfidentialFontIcon, isTutanotaTeamMail } from "./MailGuiUtils.js";
import { mailLocator } from "../../mailLocator.js";
import { getSenderOrRecipientHeading } from "./MailViewerUtils.js";
import { getLabelColor } from "../../../common/gui/base/Label";
import { colorForBg } from "../../../common/gui/base/GuiUtils";
import { theme } from "../../../common/gui/theme";
const iconMap = {
    [MailSetKind.CUSTOM]: FontIcons.Folder,
    [MailSetKind.INBOX]: FontIcons.Inbox,
    [MailSetKind.SENT]: FontIcons.Sent,
    [MailSetKind.TRASH]: FontIcons.Trash,
    [MailSetKind.ARCHIVE]: FontIcons.Archive,
    [MailSetKind.SPAM]: FontIcons.Spam,
    [MailSetKind.DRAFT]: FontIcons.Draft,
    [MailSetKind.ALL]: FontIcons.Folder,
    [MailSetKind.LABEL]: FontIcons.Folder,
    [MailSetKind.Imported]: FontIcons.Folder,
};
export const MAIL_ROW_V_MARGIN = 3;
const shiftByForCheckbox = px(10);
const translateXHide = "translateX(0)";
const translateXShow = `translateX(${shiftByForCheckbox})`;
const ELLIPSIS = "\u2026";
const MAX_DISPLAYED_LABELS = 6;
export class MailRow {
    showFolderIcon;
    getLabelsForMail;
    onSelected;
    top;
    domElement = null;
    entity = null;
    subjectDom;
    senderDom;
    dateDom;
    iconsDom;
    unreadDom;
    teamLabelDom;
    labelsDom = [];
    moreLabelsIndicatorDom;
    checkboxDom;
    checkboxWasVisible = shouldAlwaysShowMultiselectCheckbox();
    selectionSetter;
    constructor(showFolderIcon, getLabelsForMail, onSelected) {
        this.showFolderIcon = showFolderIcon;
        this.getLabelsForMail = getLabelsForMail;
        this.onSelected = onSelected;
        this.top = 0;
        this.entity = null;
    }
    update(mail, selected, isInMultiSelect) {
        this.entity = mail;
        this.selectionSetter(selected, isInMultiSelect);
        this.checkboxDom.checked = isInMultiSelect && selected;
        this.iconsDom.textContent = this.iconsText(mail);
        this.dateDom.textContent = formatTimeOrDateOrYesterday(mail.receivedDate);
        this.senderDom.textContent = getSenderOrRecipientHeading(mail, true);
        this.subjectDom.textContent = mail.subject || NBSP;
        if (mail.unread) {
            this.unreadDom.classList.remove("hidden");
            this.subjectDom.classList.add("b");
            this.senderDom.classList.add("b");
        }
        else {
            this.unreadDom.classList.add("hidden");
            this.subjectDom.classList.remove("b");
            this.senderDom.classList.remove("b");
        }
        this.updateLabels(mail);
        setVisibility(this.teamLabelDom, isTutanotaTeamMail(mail));
        this.showCheckboxAnimated(shouldAlwaysShowMultiselectCheckbox() || isInMultiSelect);
        checkboxOpacity(this.checkboxDom, selected);
    }
    updateLabels(mail) {
        const labels = this.getLabelsForMail(mail);
        for (const [i, element] of this.labelsDom.entries()) {
            const label = labels[i];
            if (label) {
                element.style.display = "";
                element.style.backgroundColor = getLabelColor(label.color);
                element.style.color = colorForBg(label.color ?? theme.content_accent);
                element.textContent = label.name;
            }
            else {
                element.style.display = "none";
            }
        }
        this.moreLabelsIndicatorDom.style.display = labels.length > this.labelsDom.length ? "" : "none";
    }
    showCheckboxAnimated(show) {
        // this causes a slide animation where checkbox pops up and the text is shifted to make space for it.
        // we can't animate the width of the checkbox as it causes the layout shifts and is very slow so instead we change the padding of the text elements in
        // a single step and then shift them in an animation. The effect is almost the same as if we would expand/shrink the checkbox.
        // using requestAnimationFrame() because when we toggle it some elements might not be there yet. Could also for the end of the event loop too.
        // using web animations to be able to cancel them easily. Could probably use transition and listen for the end instead but it would be harder to
        // do the bookkeeping.
        // using noOp to catch rejection when the animation is cancelled
        const shouldShowCheckbox = show;
        if (this.checkboxWasVisible === shouldShowCheckbox)
            return;
        if (shouldShowCheckbox) {
            this.senderDom.style.paddingRight = shiftByForCheckbox;
            this.subjectDom.style.paddingRight = shiftByForCheckbox;
            const showTranslateTransform = { transform: [translateXHide, translateXShow] };
            const senderAnim = this.senderDom.animate(showTranslateTransform, selectableRowAnimParams);
            const subjectAnim = this.subjectDom.animate(showTranslateTransform, selectableRowAnimParams);
            const badgeAnim = this.teamLabelDom.animate(showTranslateTransform, selectableRowAnimParams);
            const checkboxAnim = this.checkboxDom.animate({ transform: [scaleXHide, scaleXShow] }, selectableRowAnimParams);
            Promise.all([senderAnim.finished, subjectAnim.finished, checkboxAnim.finished]).then(() => {
                this.showCheckbox(true);
                senderAnim.cancel();
                subjectAnim.cancel();
                badgeAnim.cancel();
                checkboxAnim.cancel();
            }, noOp);
        }
        else {
            this.senderDom.style.paddingRight = "0";
            this.subjectDom.style.paddingRight = "0";
            const hideTranslateTransform = { transform: [translateXShow, translateXHide] };
            const senderAnim = this.senderDom.animate(hideTranslateTransform, selectableRowAnimParams);
            const subjectAnim = this.subjectDom.animate(hideTranslateTransform, selectableRowAnimParams);
            const badgeAnim = this.teamLabelDom.animate(hideTranslateTransform, selectableRowAnimParams);
            const checkboxAnim = this.checkboxDom.animate({ transform: [scaleXShow, scaleXHide] }, selectableRowAnimParams);
            Promise.all([senderAnim.finished, subjectAnim.finished, checkboxAnim.finished]).then(() => {
                this.showCheckbox(false);
                senderAnim.cancel();
                subjectAnim.cancel();
                badgeAnim.cancel();
                checkboxAnim.cancel();
            }, noOp);
        }
        this.checkboxWasVisible = shouldShowCheckbox;
    }
    showCheckbox(show) {
        let translate;
        let scale;
        let padding;
        if (show) {
            translate = translateXShow;
            scale = scaleXShow;
            padding = shiftByForCheckbox;
        }
        else {
            translate = translateXHide;
            scale = scaleXHide;
            padding = "0";
        }
        this.senderDom.style.transform = translate;
        this.subjectDom.style.transform = translate;
        this.teamLabelDom.style.transform = translate;
        this.checkboxDom.style.transform = scale;
        this.senderDom.style.paddingRight = padding;
        this.subjectDom.style.paddingRight = padding;
        // we effectively remove it from interaction
        this.checkboxDom.disabled = !show;
        this.checkboxDom.tabIndex = show ? 0 : -1;
    }
    /**
     * Only the structure is managed by mithril. We set all contents on our own (see update) in order to avoid the vdom overhead (not negligible on mobiles)
     */
    render() {
        return m(SelectableRowContainer, {
            onSelectedChangeRef: (changer) => {
                this.selectionSetter = changer;
            },
            oncreate: (vnode) => {
                this.domElement = vnode.dom;
                // doing it right away to avoid visual glitch of it appearing/disappearing
                // but doing it at the end of the event loop because we touch other DOM elements too which might not be there yet
                Promise.resolve().then(() => this.showCheckbox(shouldAlwaysShowMultiselectCheckbox()));
            },
        }, [
            m(".flex.col.items-center.flex-no-grow.no-shrink.pt-xs.abs", m("input.checkbox.list-checkbox", {
                type: "checkbox",
                style: {
                    marginBottom: "7px",
                    transformOrigin: "left",
                },
                onclick: (e) => {
                    e.stopPropagation();
                    // e.redraw = false
                },
                onchange: () => {
                    if (this.entity)
                        this.onSelected(this.entity, this.checkboxDom.checked);
                },
                oncreate: (vnode) => {
                    this.checkboxDom = vnode.dom;
                    checkboxOpacity(this.checkboxDom, false);
                },
            }), m(".dot.bg-accent-fg.hidden", {
                style: {
                    marginTop: px(MAIL_ROW_V_MARGIN),
                },
                oncreate: (vnode) => (this.unreadDom = vnode.dom),
            })),
            m(".flex-grow.min-width-0", {
                style: {
                    marginLeft: px(size.checkbox_size + size.vpad_xs),
                },
            }, [
                m(".flex.badge-line-height", [
                    m(Badge, {
                        classes: ".small.mr-s",
                        oncreate: (vnode) => (this.teamLabelDom = vnode.dom),
                    }, companyTeamLabel),
                    m(".text-ellipsis", {
                        oncreate: (vnode) => (this.senderDom = vnode.dom),
                    }),
                    m(".flex.flex-grow-shrink-0.justify-end", {
                        style: {
                            minWidth: px(34), // so the moreLabelIndicator is visible on smaller screens
                        },
                    }, this.renderLabels(), this.renderLabelsMoreIndicator()),
                    m("small.text-ellipsis.flex-fixed", {
                        oncreate: (vnode) => (this.dateDom = vnode.dom),
                    }),
                ]),
                m(".flex.mt-xxs", [
                    m(".smaller.text-ellipsis", {
                        oncreate: (vnode) => (this.subjectDom = vnode.dom),
                    }),
                    m(".flex-grow"),
                    m("span.ion.ml-s.list-font-icons", {
                        oncreate: (vnode) => (this.iconsDom = vnode.dom),
                    }),
                ]),
            ]),
        ]);
    }
    renderLabelsMoreIndicator() {
        return m("span.smaller.text-center.text-ellipsis.border-radius-m", {
            style: {
                // in dark theme override saturation to aid readability. This is not relative but absolute saturation. We preserve the hue.
                border: `2px solid ${getLabelColor(theme.content_button)}`,
                color: getLabelColor(theme.content_button),
                padding: `0px ${size.vpad_xsm}px 1px`,
                marginRight: px(size.vpad_xsm),
                minWidth: px(16),
                lineHeight: px(8),
            },
            oncreate: (vnode) => {
                this.moreLabelsIndicatorDom = vnode.dom;
            },
        }, ELLIPSIS);
    }
    renderLabels() {
        return m(".flex.overflow-hidden", {
            style: {
                margin: `0 ${size.vpad_xsm}px`,
                columnGap: px(size.vpad_xsm),
                maxWidth: "fit-content",
            },
        }, Array(MAX_DISPLAYED_LABELS)
            .fill(0)
            .map((_, i) => 
        // Not using the regular Label component as we have too
        // many differences and list is a special case anyway.
        m("span.small.text-center.text-ellipsis.border-radius-m", {
            style: {
                padding: `2px ${size.vpad_xsm}px`,
                minWidth: "4ch",
                maxWidth: px(48),
                lineHeight: "100%",
                textOverflow: "'‥'",
            },
            oncreate: (vnode) => {
                this.labelsDom[i] = vnode.dom;
            },
        })));
    }
    iconsText(mail) {
        let iconText = "";
        if (this.showFolderIcon) {
            let folder = mailLocator.mailModel.getMailFolderForMail(mail);
            iconText += folder ? this.folderIcon(getMailFolderType(folder)) : "";
        }
        iconText += mail._errors ? FontIcons.Warning : "";
        if (mail.state === "0" /* MailState.DRAFT */) {
            iconText += FontIcons.Edit;
        }
        switch (mail.replyType) {
            case "1" /* ReplyType.REPLY */:
                iconText += FontIcons.Reply;
                break;
            case "2" /* ReplyType.FORWARD */:
                iconText += FontIcons.Forward;
                break;
            case "3" /* ReplyType.REPLY_FORWARD */:
                iconText += FontIcons.Reply;
                iconText += FontIcons.Forward;
                break;
        }
        if (mail.confidential) {
            iconText += getConfidentialFontIcon(mail);
        }
        if (mail.attachments.length > 0) {
            iconText += FontIcons.Attach;
        }
        return iconText;
    }
    folderIcon(type) {
        return iconMap[type];
    }
}
//# sourceMappingURL=MailRow.js.map