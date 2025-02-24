import m from "mithril";
import { px } from "../size";
import { landmarkAttrs } from "../AriaUtils";
import { assertMainOrNode } from "../../api/common/Env";
import { lang } from "../../misc/LanguageViewModel.js";
import { Button } from "./Button.js";
assertMainOrNode();
export class NotFoundPage {
    view() {
        return m(".main-view.flex.items-center.justify-center.mlr", {
            ...landmarkAttrs("main" /* AriaLandmarks.Main */),
            style: {
                "max-height": px(450),
            },
        }, m(".message.center.max-width-l", [
            m("h2", "404"),
            [
                m("p", lang.get("notFound404_msg")),
                m(Button, {
                    label: "back_action",
                    click: () => window.history.back(),
                    type: "primary" /* ButtonType.Primary */,
                }),
            ],
        ]));
    }
}
//# sourceMappingURL=NotFoundPage.js.map