import { noOp } from "@tutao/tutanota-utils";
import { Dialog } from "../base/Dialog.js";
import stream from "mithril/stream";
import { theme } from "../theme.js";
import m from "mithril";
import { client } from "../../misc/ClientDetector.js";
import { px, size } from "../size.js";
import { ProgrammingError } from "../../api/common/error/ProgrammingError.js";
import { windowFacade } from "../../misc/WindowFacade.js";
/**
 * Multipage dialog with transition animations.
 *
 * @example
 * enum UpgradePlanPages {
 *   PLAN,
 *   INVOICE,
 *   CONFIRM
 * }
 *
 * function renderContent(page, dialog, navigateToPage, goBack) {
 *     if(page === UpgradePlanPages.PLAN) {
 *         // return your component here for the "plan" page...
 *     }
 *
 *     // ... return your other pages
 * }
 *
 * function getLeftAction(page, dialog, navigateToPage, goBack) {
 * 		if(page === UpgradePlanPages.PLAN) {
 *			return {
 *				type: ButtonType.Secondary,
 *				click: () => dialog.close()
 *				label: () => "Close",
 *			}
 *		}
 *  	// ... handle other pages
 * }
 *
 * const dialog = new MultiPageDialog<UpgradePlanPages>()
 * 	 .buildDialog(renderContent, { getLeftAction, getPageTitle, getRightAction })
 *
 * dialog.show()
 *
 * @see ContentRenderer
 * @see DialogAction
 * @see DialogHeaderOptions
 * @see ButtonAttrs
 */
export class MultiPageDialog {
    currentPageStream;
    pageStackStream;
    isAnimating = stream(false);
    constructor(rootPage) {
        this.currentPageStream = stream(rootPage);
        this.pageStackStream = stream([rootPage]);
    }
    goBack = (to) => {
        if (this.isAnimating() || this.pageStackStream().length < 2) {
            return;
        }
        const tmp = this.pageStackStream();
        if (to !== undefined) {
            if (!this.pageStackStream().includes(to)) {
                console.error(new ProgrammingError("Cannot go back to a page that was never visited before."));
                return;
            }
            while (tmp[tmp.length - 1] !== to) {
                tmp.pop();
            }
        }
        else {
            tmp.pop();
        }
        this.pageStackStream(tmp);
        this.currentPageStream(tmp[tmp.length - 1]);
    };
    navigateToPage = (target) => {
        if (this.isAnimating()) {
            return;
        }
        const tmp = this.pageStackStream();
        tmp.push(target);
        this.currentPageStream(target);
        this.pageStackStream(tmp);
    };
    /**
     * Prepares dialog attributes and builds a MediumDialog returning it to the caller
     * @param renderContent
     * @param getLeftAction
     * @param getPageTitle
     * @param getRightAction
     */
    buildDialog(renderContent, { getLeftAction, getPageTitle, getRightAction }) {
        const dialog = Dialog.editMediumDialog({
            left: () => [getLeftAction?.(this.currentPageStream(), dialog, this.navigateToPage, this.goBack)].filter((item) => !!item),
            middle: getPageTitle(this.currentPageStream()),
            right: () => [getRightAction?.(this.currentPageStream(), dialog, this.navigateToPage, this.goBack)].filter((item) => !!item),
        }, (MultiPageDialogViewWrapper), {
            currentPageStream: this.currentPageStream,
            renderContent: (page) => renderContent(page(), dialog, this.navigateToPage, this.goBack),
            stackStream: this.pageStackStream,
            isAnimating: this.isAnimating,
        }, {
            height: "100%",
            "background-color": theme.navigation_bg,
        });
        if (client.isMobileDevice()) {
            // Prevent focusing text field automatically on mobile. It opens keyboard, and you don't see all details.
            dialog.setFocusOnLoadFunction(noOp);
        }
        return dialog;
    }
}
var SlideDirection;
(function (SlideDirection) {
    SlideDirection[SlideDirection["LEFT"] = 0] = "LEFT";
    SlideDirection[SlideDirection["RIGHT"] = 1] = "RIGHT";
})(SlideDirection || (SlideDirection = {}));
class MultiPageDialogViewWrapper {
    transitionPage = stream(null);
    dialogHeight = null;
    pageWidth = -1;
    translate = 0;
    pagesWrapperDomElement;
    // We can assume the stack size is one because we already enforce having a root page when initializing MultiPageDialog
    stackSize = 1;
    slideDirection = undefined;
    transitionClass = "";
    constructor(vnode) {
        vnode.attrs.stackStream.map((newStack) => {
            const newStackLength = newStack.length;
            if (newStackLength < this.stackSize && newStack.length > 0) {
                this.slideDirection = SlideDirection.LEFT;
                this.goBack(vnode);
                this.stackSize = newStackLength;
            }
            else if (newStackLength > this.stackSize) {
                this.slideDirection = SlideDirection.RIGHT;
                this.stackSize = newStackLength;
                this.transitionTo(vnode, newStack[newStackLength - 1]);
            }
        });
    }
    resizeListener = () => {
        this.setPageWidth(this.pagesWrapperDomElement);
        m.redraw();
    };
    setPageWidth(dom) {
        const parentElement = dom.parentElement;
        if (parentElement) {
            this.pageWidth = dom.parentElement.clientWidth - size.hpad_large * 2;
        }
        // Twice the page width plus the gap between pages (64px)
        dom.style.width = px(this.pageWidth * 2 + size.vpad_xxl);
    }
    onremove(vnode) {
        windowFacade.removeResizeListener(this.resizeListener);
        vnode.attrs.currentPageStream.end(true);
    }
    oncreate(vnode) {
        this.pagesWrapperDomElement = vnode.dom;
        vnode.dom.addEventListener("transitionend", () => {
            this.transitionClass = "";
            vnode.attrs.isAnimating(false);
            this.transitionPage(null);
            this.translate = 0;
            m.redraw();
        });
        windowFacade.addResizeListener(this.resizeListener);
    }
    onupdate(vnode) {
        const dom = vnode.dom;
        if (this.dialogHeight == null && dom.parentElement) {
            this.dialogHeight = dom.parentElement.clientHeight;
            vnode.dom.style.height = px(this.dialogHeight);
        }
        if (this.pageWidth == -1 && dom.parentElement) {
            this.setPageWidth(dom);
            m.redraw();
        }
    }
    wrap(children) {
        return m("", { style: { width: px(this.pageWidth) } }, children);
    }
    getFillerPage(currentPage, stack) {
        const page = this.slideDirection == SlideDirection.RIGHT ? stack[stack.length - 2] : this.transitionPage();
        return stream(page ?? currentPage);
    }
    renderPage(vnode) {
        const updatedStackSize = vnode.attrs.stackStream().length;
        const fillerPageStream = this.getFillerPage(vnode.attrs.currentPageStream(), vnode.attrs.stackStream());
        const pages = [this.wrap(vnode.attrs.renderContent(fillerPageStream)), this.wrap(vnode.attrs.renderContent(vnode.attrs.currentPageStream))];
        const isOnRootPage = this.transitionPage() == null && updatedStackSize >= 2;
        if (vnode.attrs.isAnimating() && !isOnRootPage) {
            return this.slideDirection === SlideDirection.RIGHT ? pages : pages.reverse();
        }
        return this.slideDirection === SlideDirection.RIGHT ? pages.reverse() : pages;
    }
    goBack(vnode) {
        this.tryScrollToTop();
        const target = vnode.attrs.currentPageStream();
        this.translate = -(this.pageWidth + size.vpad_xxl);
        m.redraw.sync();
        requestAnimationFrame(() => {
            vnode.attrs.isAnimating(true);
            this.transitionPage(target);
            this.transitionClass = "transition-transform";
            this.translate = 0;
        });
    }
    /**
     * Determines the parent element of the pages wrapper (which should be the dialog) and sets the `scrollTop` to `0`.
     * If the parent element is not found or does not include the `scroll` CSS class, nothing will happen.
     */
    tryScrollToTop() {
        const parentElement = this.pagesWrapperDomElement.parentElement;
        if (parentElement?.classList.contains("scroll")) {
            parentElement.scrollTop = 0;
        }
    }
    transitionTo(vnode, target) {
        this.tryScrollToTop();
        this.translate = 0;
        m.redraw.sync();
        requestAnimationFrame(() => {
            vnode.attrs.isAnimating(true);
            this.transitionPage(target);
            this.transitionClass = "transition-transform";
            this.translate = -(this.pageWidth + size.vpad_xxl);
        });
    }
    view(vnode) {
        return m(".flex.gap-vpad-xxl.fit-content", {
            class: this.transitionClass,
            style: {
                transform: `translateX(${this.translate}px)`,
            },
        }, this.renderPage(vnode));
    }
}
//# sourceMappingURL=MultiPageDialog.js.map