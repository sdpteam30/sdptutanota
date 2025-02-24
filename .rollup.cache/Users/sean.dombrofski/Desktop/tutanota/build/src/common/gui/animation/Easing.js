import { assertMainOrNodeBoot } from "../../api/common/Env";
assertMainOrNodeBoot();
const EasingType = {
    linear: 1,
    quad: 2,
    cubic: 3,
    quart: 4,
    quint: 5,
};
/*
 * Easings. Implemented as described in http://upshots.org/actionscript/jsas-understanding-easing
 * based on https://github.com/jquery/jquery-ui/blob/master/ui/effect.js#L1581
 *
 * @see: http://easings.net/
 * @see: http://robertpenner.com/easing/
 */
export const ease = {
    in: function (percent) {
        return Math.pow(percent, EasingType.cubic); // cubic
    },
    out: function (percent) {
        return 1 - ease.in(1 - percent);
    },
    inOut: function (percent) {
        return percent < 0.5 ? ease.in(percent * 2) / 2 : 1 - ease.in(percent * -2 + 2) / 2;
    },
    linear: function (percent) {
        return percent;
    },
};
//# sourceMappingURL=Easing.js.map