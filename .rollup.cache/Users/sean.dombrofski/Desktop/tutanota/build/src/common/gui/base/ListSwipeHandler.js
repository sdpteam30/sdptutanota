import { SwipeHandler } from "./SwipeHandler.js";
import { animations, DefaultAnimationTime, opacity, transform } from "../animation/Animations.js";
import { ease } from "../animation/Easing.js";
import { ACTION_DISTANCE } from "./ListUtils.js";
/** Detects swipe gestures for list elements. On mobile some lists have actions on swiping, e.g. deleting an email. */
export class ListSwipeHandler extends SwipeHandler {
    config;
    virtualElement = null;
    xoffset;
    constructor(touchArea, config) {
        super(touchArea);
        this.config = config;
    }
    onHorizontalDrag(xDelta, yDelta) {
        super.onHorizontalDrag(xDelta, yDelta);
        // get it *before* raf so that we don't pick an element after reset() again
        const ve = this.getVirtualElement();
        // Animate the row with following touch
        window.requestAnimationFrame(() => {
            // Do not animate the swipe gesture more than necessary
            this.xoffset = xDelta < 0 ? Math.max(xDelta, -ACTION_DISTANCE) : Math.min(xDelta, ACTION_DISTANCE);
            if (!this.isAnimating && ve && ve.domElement && ve.entity) {
                ve.domElement.style.transform = `translateX(${this.xoffset}px) translateY(${ve.top}px)`;
                this.config.domSwipeSpacerLeft().style.transform = `translateX(${this.xoffset - this.width()}px) translateY(${ve.top}px)`;
                this.config.domSwipeSpacerRight().style.transform = `
				translateX(${this.xoffset + this.width()}px) translateY(${ve.top}px)`;
            }
        });
    }
    onHorizontalGestureCompleted(delta) {
        if (this.virtualElement && this.virtualElement.entity && Math.abs(delta.x) > ACTION_DISTANCE) {
            // the gesture is completed
            return this.finish(this.virtualElement, this.virtualElement.entity, delta);
        }
        else {
            return this.reset(delta);
        }
    }
    async finish(virtualElement, entity, delta) {
        if (this.xoffset === 0) {
            return;
        }
        try {
            const listTargetPosition = this.xoffset < 0 ? -this.width() : this.width();
            await Promise.all([
                // animate swipe action to full width
                virtualElement.domElement &&
                    animations.add(virtualElement.domElement, transform("translateX" /* TransformEnum.TranslateX */, this.xoffset, listTargetPosition).chain("translateY" /* TransformEnum.TranslateY */, virtualElement.top, virtualElement.top), {
                        easing: ease.inOut,
                        duration: DefaultAnimationTime * 2,
                    }),
                animations.add(this.config.domSwipeSpacerLeft(), transform("translateX" /* TransformEnum.TranslateX */, this.xoffset - this.width(), listTargetPosition - this.width()).chain("translateY" /* TransformEnum.TranslateY */, virtualElement.top, virtualElement.top), {
                    easing: ease.inOut,
                    duration: DefaultAnimationTime * 2,
                }),
                animations.add(this.config.domSwipeSpacerRight(), transform("translateX" /* TransformEnum.TranslateX */, this.xoffset + this.width(), listTargetPosition + this.width()).chain("translateY" /* TransformEnum.TranslateY */, virtualElement.top, virtualElement.top), {
                    easing: ease.inOut,
                    duration: DefaultAnimationTime * 2,
                }),
            ]);
            this.xoffset = listTargetPosition;
            let swipeDecision;
            try {
                if (delta.x < 0) {
                    swipeDecision = await this.config.onSwipeLeft(entity);
                }
                else {
                    swipeDecision = await this.config.onSwipeRight(entity);
                }
            }
            catch (e) {
                console.error("rejection in swipe action", e);
                swipeDecision = 0 /* ListSwipeDecision.Cancel */;
            }
            if (swipeDecision === 0 /* ListSwipeDecision.Cancel */) {
                await this.reset(delta);
                return;
            }
            // fade out element
            this.xoffset = 0;
            if (virtualElement.domElement) {
                virtualElement.domElement.style.transform = `translateX(${this.xoffset}px) translateY(${virtualElement.top}px)`;
            }
            await Promise.all([
                animations.add(this.config.domSwipeSpacerLeft(), opacity(1, 0, true)),
                animations.add(this.config.domSwipeSpacerRight(), opacity(1, 0, true)),
            ]);
            // set swipe element to initial configuration
            // with different zoom levels Blink does weird things and shows parts of elements that it shouldn't so we shift them around by a pixel
            this.config.domSwipeSpacerLeft().style.transform = `translateX(${this.xoffset - this.width() - 1}px) translateY(${virtualElement.top}px)`;
            this.config.domSwipeSpacerRight().style.transform = `translateX(${this.xoffset + this.width() + 1}px) translateY(${virtualElement.top}px)`;
            this.config.domSwipeSpacerRight().style.opacity = "";
            this.config.domSwipeSpacerLeft().style.opacity = "";
        }
        finally {
            this.virtualElement = null;
        }
    }
    width() {
        return this.config.width();
    }
    getVirtualElement() {
        if (!this.virtualElement) {
            // touch coordinates are based on clientX so they are relative to the viewport and we need to adjust them by the position of the list
            this.virtualElement = this.config.getRowForPosition(this.startPos);
        }
        return this.virtualElement;
    }
    reset(delta) {
        try {
            if (this.xoffset !== 0) {
                const ve = this.virtualElement;
                if (ve && ve.domElement && ve.entity) {
                    return Promise.all([
                        animations.add(ve.domElement, transform("translateX" /* TransformEnum.TranslateX */, this.xoffset, 0).chain("translateY" /* TransformEnum.TranslateY */, ve.top, ve.top), {
                            easing: ease.inOut,
                        }),
                        animations.add(this.config.domSwipeSpacerLeft(), transform("translateX" /* TransformEnum.TranslateX */, this.xoffset - this.width(), -this.width()).chain("translateY" /* TransformEnum.TranslateY */, ve.top, ve.top), {
                            easing: ease.inOut,
                        }),
                        animations.add(this.config.domSwipeSpacerRight(), transform("translateX" /* TransformEnum.TranslateX */, this.xoffset + this.width(), this.width()).chain("translateY" /* TransformEnum.TranslateY */, ve.top, ve.top), {
                            easing: ease.inOut,
                        }),
                    ]);
                }
                this.xoffset = 0;
            }
        }
        finally {
            this.virtualElement = null;
        }
        return Promise.resolve();
    }
}
//# sourceMappingURL=ListSwipeHandler.js.map