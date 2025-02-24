import m from "mithril";
import { SectionButton } from "../gui/base/buttons/SectionButton.js";
export class NoSolutionSectionButton {
    view({ attrs: { onClick } }) {
        return m(SectionButton, {
            text: "other_label",
            onclick: onClick,
        });
    }
}
//# sourceMappingURL=NoSolutionSectionButton.js.map