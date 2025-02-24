import { checkboxOpacity, scaleXHide, scaleXShow, selectableRowAnimParams, SelectableRowContainer, } from "../../../common/gui/SelectableRowContainer.js";
import { getContactListName } from "../../../common/contactsFunctionality/ContactUtils.js";
import { NBSP, noOp } from "@tutao/tutanota-utils";
import m from "mithril";
import { px, size } from "../../../common/gui/size.js";
export const shiftByForCheckbox = px(size.checkbox_size + size.hpad);
export const translateXShow = `translateX(${shiftByForCheckbox})`;
export const translateXHide = "translateX(0)";
export class ContactRow {
    onSelected;
    shouldShowCheckbox;
    top;
    domElement = null; // set from List
    entity;
    selectionUpdater;
    domName;
    domAddress;
    checkboxDom;
    checkboxWasVisible;
    constructor(onSelected, shouldShowCheckbox) {
        this.onSelected = onSelected;
        this.shouldShowCheckbox = shouldShowCheckbox;
        this.top = 0;
        this.entity = null;
        this.checkboxWasVisible = this.shouldShowCheckbox();
    }
    update(contact, selected, isInMultiSelect) {
        this.entity = contact;
        this.selectionUpdater(selected, isInMultiSelect);
        this.showCheckboxAnimated(this.shouldShowCheckbox() || isInMultiSelect);
        checkboxOpacity(this.checkboxDom, selected);
        this.checkboxDom.checked = selected && isInMultiSelect;
        this.domName.textContent = getContactListName(contact);
        this.domAddress.textContent = contact.mailAddresses && contact.mailAddresses.length > 0 ? contact.mailAddresses[0].address : NBSP;
    }
    /**
     * Only the structure is managed by mithril. We set all contents on our own (see update) in order to avoid the vdom overhead (not negligible on mobiles)
     */
    render() {
        return m(SelectableRowContainer, {
            oncreate: (vnode) => {
                Promise.resolve().then(() => this.showCheckbox(this.shouldShowCheckbox()));
            },
            onSelectedChangeRef: (updater) => (this.selectionUpdater = updater),
        }, m(".mt-xs.abs", [
            m("input.checkbox.list-checkbox", {
                type: "checkbox",
                style: {
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
            }),
        ]), m(".flex.col.overflow-hidden.flex-grow", [
            m(".text-ellipsis.badge-line-height", {
                oncreate: (vnode) => (this.domName = vnode.dom),
            }),
            m(".text-ellipsis.smaller.mt-xxs", {
                oncreate: (vnode) => (this.domAddress = vnode.dom),
            }),
        ]));
    }
    showCheckboxAnimated(show) {
        if (this.checkboxWasVisible === show)
            return;
        if (show) {
            this.domName.style.paddingRight = shiftByForCheckbox;
            this.domAddress.style.paddingRight = shiftByForCheckbox;
            this.checkboxDom.style.display = "";
            const nameAnim = this.domName.animate({ transform: [translateXHide, translateXShow] }, selectableRowAnimParams);
            const addressAnim = this.domAddress.animate({ transform: [translateXHide, translateXShow] }, selectableRowAnimParams);
            const checkboxAnim = this.checkboxDom.animate({ transform: [scaleXHide, scaleXShow] }, selectableRowAnimParams);
            Promise.all([nameAnim.finished, addressAnim.finished, checkboxAnim.finished]).then(() => {
                nameAnim.cancel();
                addressAnim.cancel();
                checkboxAnim.cancel();
                this.showCheckbox(show);
            }, noOp);
        }
        else {
            this.domName.style.paddingRight = "0";
            this.domAddress.style.paddingRight = "0";
            const nameAnim = this.domName.animate({ transform: [translateXShow, translateXHide] }, selectableRowAnimParams);
            const addressAnim = this.domAddress.animate({ transform: [translateXShow, translateXHide] }, selectableRowAnimParams);
            const checkboxAnim = this.checkboxDom.animate({ transform: [scaleXShow, scaleXHide] }, selectableRowAnimParams);
            Promise.all([nameAnim.finished, addressAnim.finished, checkboxAnim.finished]).then(() => {
                nameAnim.cancel();
                addressAnim.cancel();
                checkboxAnim.cancel();
                this.showCheckbox(show);
            }, noOp);
        }
        this.checkboxWasVisible = show;
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
        this.domAddress.style.transform = translate;
        this.domName.style.transform = translate;
        this.domAddress.style.paddingRight = padding;
        this.domName.style.paddingRight = padding;
        this.checkboxDom.style.transform = scale;
        // Stop the hidden checkbox from entering the tab index
        this.checkboxDom.style.display = show ? "" : "none";
    }
}
//# sourceMappingURL=ContactRow.js.map