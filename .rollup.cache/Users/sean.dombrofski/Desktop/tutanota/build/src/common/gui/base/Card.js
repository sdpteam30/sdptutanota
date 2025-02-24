import m from "mithril";
/**
 * Simple card component
 * @see Component attributes: {CardAttrs}
 * @example
 * m(Card, {
 *     rootElementType: "section", // Changing the default root element
 *     classes: ["mt"], // Adding new styles
 *     style: {
 *         "font-size": px(size.font_size_base * 1.25) // Overriding the component style
 *     }
 * }, m("span", "Child span text")),
 */
export class Card {
    view({ attrs, children }) {
        return m(`${attrs.rootElementType ?? "div"}.tutaui-card-container${attrs.shouldDivide ? ".tutaui-card-container-divide" : ""}`, {
            class: attrs.classes?.join(" "),
            style: attrs.style,
        }, children);
    }
}
//# sourceMappingURL=Card.js.map