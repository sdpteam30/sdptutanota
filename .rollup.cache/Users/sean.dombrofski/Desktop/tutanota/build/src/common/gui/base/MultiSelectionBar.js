import m from "mithril";
import { IconButton } from "./IconButton.js";
export class MultiSelectionBar {
    view(vnode) {
        return m(".flex.items-center.justify-between.pl-s.pr-s", {
            style: {
                height: "100%",
            },
        }, [
            m(IconButton, {
                title: "cancel_action",
                click: vnode.attrs.selectNoneHandler,
                icon: "Cancel" /* Icons.Cancel */,
            }),
            m(".ml-s.b", vnode.attrs.text),
            vnode.children,
        ]);
    }
}
//# sourceMappingURL=MultiSelectionBar.js.map