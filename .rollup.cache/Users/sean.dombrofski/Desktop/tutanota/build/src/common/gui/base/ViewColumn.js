import m from "mithril";
import { landmarkAttrs } from "../AriaUtils";
import { resolveMaybeLazy } from "@tutao/tutanota-utils";
import { assertMainOrNode } from "../../api/common/Env";
import { lang } from "../../misc/LanguageViewModel.js";
assertMainOrNode();
export class ViewColumn {
    component;
    columnType;
    minWidth;
    maxWidth;
    headerCenter;
    ariaLabel;
    width;
    offset; // offset to the left
    // not private because used by ViewSlider
    domColumn = null;
    isInForeground;
    isVisible;
    ariaRole = null;
    /**
     * Create a view column.
     * @param component The component that is rendered as this column
     * @param columnType The type of the view column.
     * @param minWidth The minimum allowed width for the view column.
     * @param headerCenter returned in {@link getTitle}. Used in ARIA landmark unless overriden by {@link ariaLabel}
     * @param ariaLabel used in ARIA landmark
     * @param maxWidth The maximum allowed width for the view column.
     * @param headerCenter The title of the view column.
     * @param ariaLabel The label of the view column to be read by screen readers. Defaults to headerCenter if not specified.
     */
    constructor(component, columnType, { minWidth, maxWidth, 
    // note: headerCenter is a candidate for removal, ViewColumn is not responsible for the header. This is only useful as an ARIA description which we can already
    // provide separately. We should always require aria description instead.
    headerCenter, ariaLabel = () => lang.getTranslationText(this.getTitle()), }) {
        this.component = component;
        this.columnType = columnType;
        this.minWidth = minWidth;
        this.maxWidth = maxWidth;
        this.headerCenter = headerCenter || "emptyString_msg";
        this.ariaLabel = ariaLabel ?? null;
        this.width = minWidth;
        this.offset = 0;
        this.isInForeground = false;
        this.isVisible = false;
        // fixup for old-style components
        this.view = this.view.bind(this);
    }
    view() {
        const zIndex = !this.isVisible && this.columnType === 0 /* ColumnType.Foreground */ ? 200 /* LayerType.ForegroundMenu */ + 1 : "";
        const landmark = this.ariaRole ? landmarkAttrs(this.ariaRole, this.ariaLabel ? this.ariaLabel() : lang.getTranslationText(this.getTitle())) : {};
        return m(".view-column.fill-absolute", {
            ...landmark,
            "data-testid": lang.getTranslationText(this.getTitle()),
            inert: !this.isVisible && !this.isInForeground,
            oncreate: (vnode) => {
                this.domColumn = vnode.dom;
                this.domColumn.style.transform =
                    this.columnType === 0 /* ColumnType.Foreground */ ? "translateX(" + this.getOffsetForeground(this.isInForeground) + "px)" : "";
                if (this.ariaRole === "main" /* AriaLandmarks.Main */) {
                    this.focus();
                }
            },
            style: {
                zIndex,
                width: this.width + "px",
                left: this.offset + "px",
            },
        }, m(this.component));
    }
    getTitle() {
        return resolveMaybeLazy(this.headerCenter);
    }
    getOffsetForeground(foregroundState) {
        if (this.isVisible || foregroundState) {
            return 0;
        }
        else {
            return -this.width;
        }
    }
    focus() {
        this.domColumn?.focus();
    }
}
//# sourceMappingURL=ViewColumn.js.map