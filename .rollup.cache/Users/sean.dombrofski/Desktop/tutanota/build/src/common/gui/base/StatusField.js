import m from "mithril";
import { lang } from "../../misc/LanguageViewModel";
import { assertMainOrNode } from "../../api/common/Env";
assertMainOrNode();
export class StatusField {
    view(vnode) {
        const { status } = vnode.attrs;
        if (!status)
            return null;
        return m("", lang.get(status.text));
    }
}
//# sourceMappingURL=StatusField.js.map