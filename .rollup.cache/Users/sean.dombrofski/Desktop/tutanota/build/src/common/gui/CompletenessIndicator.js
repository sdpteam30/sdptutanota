import m from "mithril";
import { theme } from "./theme.js";
export class CompletenessIndicator {
    view({ attrs }) {
        return m("", {
            class: attrs.class,
            style: {
                border: `1px solid ${theme.content_button}`,
                width: attrs.width ?? "100px",
                height: "10px",
            },
        }, m("", {
            style: {
                "background-color": theme.content_button,
                width: attrs.percentageCompleted + "%",
                height: "100%",
            },
        }));
    }
}
//# sourceMappingURL=CompletenessIndicator.js.map