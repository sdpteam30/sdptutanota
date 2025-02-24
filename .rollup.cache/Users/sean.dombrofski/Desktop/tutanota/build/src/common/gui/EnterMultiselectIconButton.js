import { pureComponent } from "./base/PureComponent.js";
import m from "mithril";
import { IconButton } from "./base/IconButton.js";
export const EnterMultiselectIconButton = pureComponent(({ clickAction }) => m(IconButton, {
    icon: "AddCheckCirle" /* Icons.AddCheckCirle */,
    title: "selectMultiple_action",
    click: () => {
        clickAction();
    },
}));
//# sourceMappingURL=EnterMultiselectIconButton.js.map