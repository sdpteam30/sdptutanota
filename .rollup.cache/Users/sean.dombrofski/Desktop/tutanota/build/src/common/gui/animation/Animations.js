import { ease } from "./Easing";
import { downcast } from "@tutao/tutanota-utils";
import { hexToRgb } from "../base/Color";
import { assertMainOrNodeBoot } from "../../api/common/Env";
assertMainOrNodeBoot();
export const DefaultAnimationTime = 200; // ms
const InitializedOptions = {
    stagger: 0,
    delay: 0,
    easing: ease.linear,
    duration: DefaultAnimationTime,
};
class Animations {
    activeAnimations;
    _animate;
    constructor() {
        this.activeAnimations = [];
        this._animate = () => {
            let finished = [];
            let now = window.performance.now();
            for (let animation of this.activeAnimations) {
                animation.animateFrame(now);
                if (animation.isFinished()) {
                    finished.push(animation);
                }
            }
            for (let animation of finished) {
                this.activeAnimations.splice(this.activeAnimations.indexOf(animation), 1);
                if (animation.resolve) {
                    animation.resolve();
                }
            }
            if (this.activeAnimations.length > 0) {
                window.requestAnimationFrame(this._animate);
            }
        };
    }
    /**
     * Adds an animation that should be executed immediately. Returns a promise that resolves after the animation is complete.
     */
    add(targets, mutations, options) {
        const targetsArray = targets instanceof HTMLElement ? [targets] : Array.from(targets);
        let targetMutations;
        if (!(mutations instanceof Array)) {
            targetMutations = [mutations];
        }
        else {
            targetMutations = mutations;
        }
        let verifiedOptions = Animations.verifiyOptions(options);
        const willChange = targetMutations
            .map((mutation) => mutation.willChange())
            .filter((willChange) => willChange.length)
            .join(" ");
        for (const t of targetsArray) {
            t.style.willChange = willChange;
        }
        const animations = [];
        const promise = new Promise((resolve) => {
            let start = this.activeAnimations.length ? false : true;
            for (let i = 0; i < targetsArray.length; i++) {
                let delay = verifiedOptions.delay;
                if (verifiedOptions.stagger) {
                    delay += verifiedOptions.stagger * i;
                }
                const animation = new Animation(targetsArray[i], targetMutations, i === targetsArray.length - 1 ? resolve : null, delay, verifiedOptions.easing, verifiedOptions.duration);
                animations.push(animation);
                this.activeAnimations.push(animation);
            }
            if (start) {
                window.requestAnimationFrame(this._animate);
            }
        });
        const animationPromise = downcast(promise);
        animationPromise.animations = animations;
        return animationPromise;
    }
    cancel(animation) {
        this.activeAnimations.splice(this.activeAnimations.indexOf(animation), 1);
        if (animation.resolve) {
            animation.resolve();
        }
    }
    static verifiyOptions(options) {
        return Object.assign({}, InitializedOptions, options);
    }
}
export class Animation {
    target;
    mutations;
    resolve;
    duration;
    delay;
    animationStart;
    runTime;
    easing;
    constructor(target, mutations, resolve, delay, easing, duration = DefaultAnimationTime) {
        this.target = target;
        this.mutations = mutations;
        this.resolve = resolve;
        this.delay = delay;
        this.duration = duration;
        this.animationStart = null;
        this.runTime = null;
        this.easing = easing;
    }
    animateFrame(now) {
        if (this.animationStart == null)
            this.animationStart = now;
        this.runTime = Math.min(now - this.animationStart - this.delay, this.duration);
        if (this.runTime >= 0) {
            for (let m of this.mutations) {
                m.updateDom(this.target, this.runTime / this.duration, this.easing);
            }
        }
    }
    isFinished() {
        return this.runTime != null && this.runTime >= this.duration;
    }
}
export function transform(type, begin, end) {
    const values = {};
    values[type] = {
        begin,
        end,
    };
    let updateDom = function (target, percent, easing) {
        target.style.transform = buildTransformString(values, percent, easing);
    };
    const willChange = () => "transform";
    let chain = function (type, begin, end) {
        values[type] = {
            begin,
            end,
        };
        return {
            updateDom,
            chain,
            willChange,
        };
    };
    return {
        updateDom,
        chain,
        willChange,
    };
}
export function scroll(begin, end) {
    return {
        updateDom: function (target, percent, easing) {
            target.scrollTop = calculateValue(percent, begin, end, easing);
        },
        willChange: () => "",
    };
}
const TransformUnits = {
    ["translateX" /* TransformEnum.TranslateX */]: "px",
    ["translateY" /* TransformEnum.TranslateY */]: "px",
    ["rotateY" /* TransformEnum.RotateY */]: "deg",
    ["rotateZ" /* TransformEnum.RotateZ */]: "deg",
    ["scale" /* TransformEnum.Scale */]: "",
};
function buildTransformString(values, percent, easing) {
    let transform = [];
    let types = Object.keys(TransformUnits); // the order is important (e.g. 'rotateY(45deg) translateX(10px)' leads to other results than 'translateX(10px) rotateY(45deg)'
    for (let type of types) {
        if (values[type]) {
            let value = calculateValue(percent, values[type].begin, values[type].end, easing);
            transform.push(type + "(" + value + TransformUnits[type] + ")");
        }
    }
    return transform.join(" ");
}
/**
 * We use the alpha channel instead of using opacity for fading colors. Opacity changes are slow on mobile devices as they
 * effect the whole tree of the dom element with changing opacity.
 *
 * See http://stackoverflow.com/a/14677373 for a more detailed explanation.
 */
export function alpha(type, colorHex, begin, end) {
    let color = hexToRgb(colorHex);
    return {
        updateDom: function (target, percent, easing) {
            let alphaChannel = calculateValue(percent, begin, end, easing);
            if (type === "backgroundColor" /* AlphaEnum.BackgroundColor */) {
                target.style.backgroundColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${alphaChannel})`;
            }
            else if (type === "color" /* AlphaEnum.Color */) {
                target.style.color = `rgba(${color.r}, ${color.g}, ${color.b}, ${alphaChannel})`;
            }
        },
        willChange: () => "alpha",
    };
}
/**
 * Only use on small elements. You should use Alpha for fading large backgrounds which is way faster on mobiles.
 */
export function opacity(begin, end, keepValue) {
    let initialOpacity = null;
    return {
        updateDom: function (target, percent, easing) {
            if (percent === 0 && initialOpacity === null) {
                initialOpacity = target.style.opacity;
            }
            let opacity = calculateValue(percent, begin, end, easing);
            if (percent === 1 && !keepValue) {
                // on some elements the value hast to be set to the initial value because hover using opacity won't work otherwise.
                target.style.opacity = initialOpacity ? initialOpacity : "";
            }
            else {
                target.style.opacity = opacity + "";
            }
        },
        willChange: () => "opacity",
    };
}
export function height(begin, end) {
    return {
        updateDom: function (target, percent, easing) {
            target.style.height = calculateValue(percent, begin, end, easing) + "px";
        },
        willChange: () => "height",
    };
}
export function width(begin, end) {
    return {
        updateDom: function (target, percent, easing) {
            target.style.width = calculateValue(percent, begin, end, easing) + "px";
        },
        willChange: () => "width",
    };
}
export function fontSize(begin, end) {
    return {
        updateDom: function (target, percent, easing) {
            target.style.fontSize = calculateValue(percent, begin, end, easing) + "px";
        },
        willChange: () => "",
    };
}
function calculateValue(percent, begin, end, easing) {
    return (end - begin) * easing(percent) + begin;
}
export const animations = new Animations();
export function get(element) {
    if (!element)
        throw new Error("tried to update a non existing element");
    return element;
}
//# sourceMappingURL=Animations.js.map