import m from "mithril";
import { Dialog } from "./Dialog";
import { Icon, IconSize } from "./Icon";
import { theme } from "../theme";
import { lang } from "../../misc/LanguageViewModel";
import { Keys } from "../../api/common/TutanotaConstants";
import { assertMainOrNode } from "../../api/common/Env";
import { windowFacade } from "../../misc/WindowFacade.js";
assertMainOrNode();
// A WizardPage dispatches this event to inform the parent WizardDialogN to close the dialog
export function emitWizardEvent(dom, eventType) {
    if (dom) {
        const event = new Event(eventType, {
            bubbles: true,
            cancelable: true,
        });
        dom.dispatchEvent(event);
    }
}
class WizardDialog {
    _closeWizardDialogListener;
    _showNextWizardDialogPageListener;
    _showPreviousWizardDialogPageListener;
    wizardContentDom = null; // we need the wizard content dom to scroll to the top when redirecting to the next page
    oncreate(vnode) {
        // We listen for events triggered by the child WizardPages to close the dialog or show the next page
        const dom = vnode.dom;
        this._closeWizardDialogListener = (e) => {
            e.stopPropagation();
            vnode.attrs.closeAction();
        };
        this._showNextWizardDialogPageListener = (e) => {
            e.stopPropagation();
            if (vnode.attrs.currentPage) {
                vnode.attrs.currentPage.attrs.nextAction(true).then((ready) => {
                    if (ready) {
                        vnode.attrs.goToNextPageOrCloseWizard();
                        this.wizardContentDom?.scrollIntoView();
                    }
                });
            }
        };
        this._showPreviousWizardDialogPageListener = (e) => {
            e.stopPropagation();
            if (!vnode.attrs.currentPage?.attrs.preventGoBack) {
                vnode.attrs.goToPreviousPageOrClose();
                this.wizardContentDom?.scrollIntoView();
            }
        };
        dom.addEventListener("closeWizardDialog" /* WizardEventType.CLOSE_DIALOG */, this._closeWizardDialogListener);
        dom.addEventListener("showNextWizardDialogPage" /* WizardEventType.SHOW_NEXT_PAGE */, this._showNextWizardDialogPageListener);
        dom.addEventListener("showPreviousWizardDialogPage" /* WizardEventType.SHOW_PREVIOUS_PAGE */, this._showPreviousWizardDialogPageListener);
    }
    onremove(vnode) {
        const dom = vnode.dom;
        if (this._closeWizardDialogListener)
            dom.removeEventListener("closeWizardDialog" /* WizardEventType.CLOSE_DIALOG */, this._closeWizardDialogListener);
        if (this._showNextWizardDialogPageListener)
            dom.removeEventListener("showNextWizardDialogPage" /* WizardEventType.SHOW_NEXT_PAGE */, this._showNextWizardDialogPageListener);
        if (this._showPreviousWizardDialogPageListener)
            dom.removeEventListener("showPreviousWizardDialogPage" /* WizardEventType.SHOW_PREVIOUS_PAGE */, this._showPreviousWizardDialogPageListener);
    }
    view(vnode) {
        const a = vnode.attrs;
        const enabledPages = a._getEnabledPages();
        const selectedIndex = a.currentPage ? enabledPages.indexOf(a.currentPage) : -1;
        const visiblePages = enabledPages.filter((page) => !page.attrs.hidePagingButtonForPage);
        const lastIndex = visiblePages.length - 1;
        return m("#wizardDialogContent.pt", {
            oncreate: (vnode) => {
                this.wizardContentDom = vnode.dom;
            },
        }, [
            a.currentPage && a.currentPage.attrs.hideAllPagingButtons
                ? null
                : m("nav#wizard-paging.flex-space-around.center-vertically.mb-s.plr-2l", {
                    "aria-label": "Breadcrumb",
                }, visiblePages.map((p, index) => [
                    m(WizardPagingButton, {
                        pageIndex: index,
                        getSelectedPageIndex: () => selectedIndex,
                        isClickable: () => a.allowedToVisitPage(index, selectedIndex),
                        navigateBackHandler: (index) => a._goToPageAction(index),
                    }),
                    index === lastIndex ? null : m(".flex-grow", { class: this.getLineClass(index < selectedIndex) }),
                ])),
            a.currentPage ? a.currentPage.view() : null,
        ]);
    }
    getLineClass(isPreviousPage) {
        if (isPreviousPage) {
            return "wizard-breadcrumb-line-active";
        }
        else {
            return "wizard-breadcrumb-line";
        }
    }
}
export function wizardPageWrapper(component, attributes) {
    return {
        attrs: attributes,
        view: () => m(component, attributes),
    };
}
class WizardDialogAttrs {
    data;
    pages;
    currentPage;
    closeAction;
    cancelButtonText;
    _headerBarAttrs = {};
    get headerBarAttrs() {
        return this._headerBarAttrs;
    }
    // Idea for refactoring: make optional parameters into separate object
    constructor(data, pages, cancelButtonText = null, closeAction) {
        this.data = data;
        this.pages = pages;
        this.currentPage = pages.find((p) => p.attrs.isEnabled()) ?? null;
        this.closeAction = closeAction
            ? () => closeAction()
            : () => {
                return Promise.resolve();
            };
        this.cancelButtonText = cancelButtonText ?? "cancel_action";
        this.updateHeaderBarAttrs();
    }
    goToPreviousPageOrClose() {
        let currentPageIndex = this.currentPage ? this._getEnabledPages().indexOf(this.currentPage) : -1;
        if (!this.allowedToVisitPage(currentPageIndex - 1, currentPageIndex))
            return;
        if (currentPageIndex > 0) {
            this._goToPageAction(currentPageIndex - 1);
            m.redraw();
        }
        else {
            this.closeAction();
        }
    }
    updateHeaderBarAttrs() {
        let currentPageIndex = this.currentPage ? this._getEnabledPages().indexOf(this.currentPage) : -1;
        const backButtonAttrs = {
            label: currentPageIndex === 0 ? this.cancelButtonText : "back_action",
            click: () => this.goToPreviousPageOrClose(),
            type: "secondary" /* ButtonType.Secondary */,
        };
        const skipButtonAttrs = {
            label: "skip_action",
            click: () => this.goToNextPageOrCloseWizard(),
            type: "secondary" /* ButtonType.Secondary */,
        };
        // the wizard dialog has a reference to this._headerBarAttrs -> changing this object changes the dialog
        let source = {
            left: currentPageIndex >= 0 && this.allowedToVisitPage(currentPageIndex - 1, currentPageIndex) ? [backButtonAttrs] : [],
            right: () => this.currentPage &&
                this.currentPage.attrs.isSkipAvailable() &&
                this._getEnabledPages().indexOf(this.currentPage) !== this._getEnabledPages().length - 1
                ? [skipButtonAttrs]
                : [],
            middle: this.currentPage ? this.currentPage.attrs.headerTitle() : "emptyString_msg",
        };
        Object.assign(this._headerBarAttrs, source);
    }
    _getEnabledPages() {
        return this.pages.filter((p) => p.attrs.isEnabled());
    }
    _goToPageAction(targetIndex) {
        const pages = this._getEnabledPages();
        this.currentPage = pages[targetIndex];
        this.updateHeaderBarAttrs();
    }
    goToNextPageOrCloseWizard() {
        const pages = this._getEnabledPages();
        const currentIndex = this.currentPage ? pages.indexOf(this.currentPage) : -1;
        const lastIndex = pages.length - 1;
        let finalAction = currentIndex === lastIndex;
        if (finalAction) {
            this.closeAction();
        }
        else {
            this._goToPageAction(currentIndex < lastIndex ? currentIndex + 1 : lastIndex);
        }
    }
    /** returns whether it is allowed to visit the page specified by pageIndex depending on selectedPageIndex */
    allowedToVisitPage(pageIndex, selectedPageIndex) {
        if (pageIndex < 0 || selectedPageIndex < 0) {
            return true; // invalid values -> should not restrict here
        }
        const enabledPages = this._getEnabledPages();
        // page is only allowed to be visited if it was already visited and there is no later page that was already visited and does not allow to go back
        return (pageIndex < selectedPageIndex &&
            !enabledPages
                .filter((page, index) => {
                return index > pageIndex && index <= selectedPageIndex;
            })
                .some((page) => page.attrs.preventGoBack));
    }
}
//exported for old-style WizardDialog.js
export class WizardPagingButton {
    view(vnode) {
        const selectedPageIndex = vnode.attrs.getSelectedPageIndex();
        const pageIndex = vnode.attrs.pageIndex;
        const isClickable = vnode.attrs.isClickable();
        const nextIndex = (pageIndex + 1).toString();
        const isSelectedPage = selectedPageIndex === pageIndex;
        const isPreviousPage = pageIndex < selectedPageIndex;
        return m("button.button-icon.flex-center.items-center", {
            tabIndex: isClickable ? "0" /* TabIndex.Default */ : "-1" /* TabIndex.Programmatic */,
            "aria-disabled": isClickable.toString(),
            "aria-label": isClickable ? lang.get("previous_action") : nextIndex,
            "aria-current": isSelectedPage ? "step" : "false",
            "aria-live": isSelectedPage ? "polite" : "off",
            class: this.getClass(isSelectedPage, isPreviousPage),
            style: {
                cursor: isClickable ? "pointer" : "auto",
            },
            onclick: () => {
                if (isClickable) {
                    vnode.attrs.navigateBackHandler(pageIndex);
                }
            },
        }, isPreviousPage
            ? m(Icon, {
                icon: "Checkmark" /* Icons.Checkmark */,
                size: IconSize.Medium,
                style: {
                    fill: theme.content_bg,
                },
            })
            : nextIndex);
    }
    // Apply the correct styling based on the current page number
    getClass(isSelectedPage, isPreviousPage) {
        if (isSelectedPage) {
            return "wizard-breadcrumb-active";
        }
        else if (isPreviousPage) {
            return "wizard-breadcrumb-previous";
        }
        else {
            return "wizard-breadcrumb";
        }
    }
}
// Use to generate a new wizard
export function createWizardDialog(data, pages, closeAction = null, dialogType, cancelButtonText = null) {
    // We need the close action of the dialog before we can create the proper attributes
    let view = () => null;
    const child = {
        view: () => view(),
    };
    const unregisterCloseListener = windowFacade.addWindowCloseListener(() => { });
    const closeActionWrapper = async () => {
        if (closeAction) {
            await closeAction();
        }
        wizardDialog.close();
        unregisterCloseListener();
    };
    const wizardDialogAttrs = new WizardDialogAttrs(data, pages, cancelButtonText, closeActionWrapper);
    const wizardDialog = dialogType === "EditLarge" /* DialogType.EditLarge */
        ? Dialog.largeDialog(wizardDialogAttrs.headerBarAttrs, child)
        : Dialog.editSmallDialog(wizardDialogAttrs.headerBarAttrs, () => m(child));
    view = () => m(WizardDialog, wizardDialogAttrs);
    wizardDialog
        .addShortcut({
        key: Keys.ESC,
        exec: () => {
            confirmThenCleanup(() => wizardDialogAttrs.closeAction());
        },
        help: "close_alt",
    })
        .setCloseHandler(() => {
        // the dialogs popState handler will return false which prevents the wizard from being closed
        // we then close the wizard manually if the user confirms
        confirmThenCleanup(() => wizardDialogAttrs.closeAction());
    });
    return {
        dialog: wizardDialog,
        attrs: wizardDialogAttrs,
    };
}
async function confirmThenCleanup(closeAction) {
    const confirmed = await Dialog.confirm("closeWindowConfirmation_msg");
    if (confirmed) {
        closeAction();
    }
}
//# sourceMappingURL=WizardDialog.js.map