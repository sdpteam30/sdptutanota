import { assertMainOrNodeBoot } from "../api/common/Env";
assertMainOrNodeBoot();
export const Cat = {
    css: {
        name: "css",
        color: "orange",
    },
    mithril: {
        name: "mithril",
        color: "darkgreen",
    },
    error: {
        name: "error",
        color: "red",
    },
    info: {
        name: "info",
        color: "lightblue",
    },
    debug: {
        name: "debug",
        color: "#009688",
    },
};
const activeCategories = [];
export function enable(cat) {
    activeCategories.push(cat);
}
export function log(category, message, ...args) {
    if (activeCategories.indexOf(category) === -1)
        return;
    console.log("%c" + category.name, "color:" + category.color, message, ...args);
}
export function timer(category) {
    if (activeCategories.indexOf(category) === -1) {
        return function () { };
    }
    let start = window.performance.now();
    return function () {
        return Math.round(window.performance.now() - start);
    };
}
//# sourceMappingURL=Log.js.map