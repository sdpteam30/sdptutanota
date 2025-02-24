import linkifyHtml from "linkifyjs/html";
/**
 * Replaces plain text links in the given text by html links. Already existing html links are not changed.
 * @param html The text to be checked for links.
 * @returns {string} The text with html links.
 */
export function urlify(html) {
    return linkifyHtml(html, {
        defaultProtocol: "https",
        attributes: {
            rel: "noopener noreferrer",
        },
        target: "_blank",
    });
}
//# sourceMappingURL=Urlifier.js.map