import { Cat, log, timer } from "../misc/Log";
import { size } from "./size";
import { assertMainOrNodeBoot, isAdminClient, isTest } from "../api/common/Env";
import { windowFacade } from "../misc/WindowFacade";
import { theme } from "./theme";
import { assertNotNull, neverNull } from "@tutao/tutanota-utils";
import { client } from "../misc/ClientDetector";
assertMainOrNodeBoot();
/**
 * Writes all styles to a single dom <style>-tag
 */
class Styles {
    styles;
    initialized;
    bodyWidth;
    bodyHeight;
    styleSheets = new Map();
    constructor() {
        this.initialized = false;
        this.styles = new Map();
        this.bodyWidth = neverNull(document.body).offsetWidth;
        this.bodyHeight = neverNull(document.body).offsetHeight;
        windowFacade.addResizeListener((width, height) => {
            this.bodyWidth = width;
            this.bodyHeight = height;
        });
    }
    init(themeController) {
        if (this.initialized)
            return;
        this.initialized = true;
        this.updateDomStyles();
        themeController.observableThemeId.map(() => {
            this.updateDomStyles();
        });
    }
    getStyleSheetElement(id) {
        return assertNotNull(this.styleSheets.get(id)).cloneNode(true);
    }
    isDesktopLayout() {
        return this.bodyWidth >= size.desktop_layout_width;
    }
    isSingleColumnLayout() {
        return this.bodyWidth < size.two_column_layout_width;
    }
    isTwoColumnLayout() {
        return this.bodyWidth >= size.two_column_layout_width && this.bodyWidth < size.desktop_layout_width;
    }
    isUsingBottomNavigation() {
        return !isAdminClient() && (client.isMobileDevice() || !this.isDesktopLayout());
    }
    registerStyle(id, styleCreator) {
        if (!this.initialized && this.styles.has(id)) {
            throw new Error("duplicate style definition: " + id);
        }
        this.styles.set(id, styleCreator);
        if (this.initialized) {
            log(Cat.css, "update style", id, styleCreator(theme));
            this.updateDomStyle(id, styleCreator);
        }
    }
    updateStyle(id) {
        if (!this.initialized || !this.styles.has(id)) {
            throw new Error("cannot update nonexistent style " + id);
        }
        const creator = neverNull(this.styles.get(id));
        log(Cat.css, "update style", id, creator(theme));
        this.updateDomStyle(id, creator);
    }
    updateDomStyles() {
        // This is hacking but we currently import gui stuff from a lot of tested things
        if (isTest()) {
            return;
        }
        let time = timer(Cat.css);
        Array.from(this.styles.entries()).map((entry) => {
            this.updateDomStyle(entry[0], entry[1]);
        });
        log(Cat.css, "creation time", time());
    }
    updateDomStyle(id, styleCreator) {
        const styleSheet = this.getDomStyleSheet(`css-${id}`);
        styleSheet.textContent = toCss(styleCreator());
        this.styleSheets.set(id, styleSheet);
    }
    getDomStyleSheet(id) {
        let styleDomElement = document.getElementById(id);
        if (!styleDomElement) {
            styleDomElement = document.createElement("style");
            styleDomElement.setAttribute("type", "text/css");
            styleDomElement.id = id;
            styleDomElement = document.getElementsByTagName("head")[0].appendChild(styleDomElement);
        }
        return styleDomElement;
    }
}
function objectToCss(indent, key, o) {
    let cssString = `${indent}${key} { \n`;
    cssString += indent + toCss(o, indent + "  ");
    cssString += ` \n${indent}} \n`;
    return cssString;
}
function toCss(obj, indent = "") {
    let ret = Object.keys(obj)
        .map((key) => {
        if (obj[key] instanceof Array) {
            return obj[key]
                .map((o) => {
                return objectToCss(indent, key, o);
            })
                .join("\n");
        }
        else if (obj[key] instanceof Object) {
            return objectToCss(indent, key, obj[key]);
        }
        else {
            return `${indent}${key}: ${obj[key]};`;
        }
    })
        .join("\n");
    return ret;
}
export const styles = new Styles();
//# sourceMappingURL=styles.js.map