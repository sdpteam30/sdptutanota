import { size } from "../size";
/* Tool to detect swipe gestures on certain elements. */
export class SwipeHandler {
    /** uses clientX/clientY thus relative to view port */
    startPos;
    touchArea;
    animating;
    isAnimating = false;
    directionLock;
    constructor(touchArea) {
        this.startPos = {
            x: 0,
            y: 0,
        };
        this.touchArea = touchArea;
        this.animating = Promise.resolve();
        this.directionLock = null;
    }
    attach() {
        this.touchArea.addEventListener("touchstart", this.onTouchStart, { passive: true });
        // does invoke prevent default
        this.touchArea.addEventListener("touchmove", this.onTouchMove, { passive: false });
        this.touchArea.addEventListener("touchend", this.onTouchEnd, { passive: true });
    }
    detach() {
        this.touchArea.removeEventListener("touchstart", this.onTouchStart);
        this.touchArea.removeEventListener("touchmove", this.onTouchMove);
        this.touchArea.removeEventListener("touchend", this.onTouchEnd);
    }
    onTouchStart = (e) => {
        this.startPos = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
        };
    };
    onTouchMove = (e) => {
        let { x, y } = this.getDelta(e);
        // If we're either locked horizontally OR if we're not locked vertically but would like to lock horizontally, then lock horizontally
        if (this.directionLock === 0 /* DirectionLock.Horizontal */ ||
            (this.directionLock !== 1 /* DirectionLock.Vertical */ && Math.abs(x) > Math.abs(y) && Math.abs(x) > 14)) {
            this.directionLock = 0 /* DirectionLock.Horizontal */;
            // Do not scroll the list
            e.preventDefault();
            if (!this.isAnimating) {
                this.onHorizontalDrag(x, y);
            } // If we don't have a vertical lock yet but we would like to have it, lock vertically
        }
        else if (this.directionLock !== 1 /* DirectionLock.Vertical */ && Math.abs(y) > Math.abs(x) && Math.abs(y) > size.list_row_height) {
            this.directionLock = 1 /* DirectionLock.Vertical */;
            if (!this.isAnimating) {
                // Reset the row
                window.requestAnimationFrame(() => {
                    if (!this.isAnimating) {
                        this.reset({
                            x,
                            y,
                        });
                    }
                });
            }
        }
    };
    onTouchEnd = (e) => {
        this.gestureEnd(e);
    };
    gestureEnd(e) {
        const delta = this.getDelta(e);
        if (!this.isAnimating && this.directionLock === 0 /* DirectionLock.Horizontal */) {
            // Gesture is completed
            this.animating = this.onHorizontalGestureCompleted(delta);
            this.isAnimating = true;
        }
        else if (!this.isAnimating) {
            // Gesture is not completed, reset row
            this.animating = this.reset(delta);
            this.isAnimating = true;
        }
        this.animating.then(() => (this.isAnimating = false));
        this.directionLock = null;
    }
    onHorizontalDrag(xDelta, yDelta) {
        // noOp
    }
    onHorizontalGestureCompleted(delta) {
        // noOp
        return Promise.resolve();
    }
    reset(delta) {
        return Promise.resolve();
    }
    getDelta(e) {
        return {
            x: e.changedTouches[0].clientX - this.startPos.x,
            y: e.changedTouches[0].clientY - this.startPos.y,
        };
    }
}
//# sourceMappingURL=SwipeHandler.js.map