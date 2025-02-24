import { pureComponent } from "./base/PureComponent.js";
import { SelectAllCheckbox } from "./SelectAllCheckbox.js";
import m from "mithril";
import { BaseMobileHeader } from "./BaseMobileHeader.js";
import { IconButton } from "./base/IconButton.js";
import { lang } from "../misc/LanguageViewModel.js";
/** A special header that is used for multiselect state on mobile. */
export const MultiselectMobileHeader = pureComponent((attrs) => {
    const { selectAll, selectNone, selected, message } = attrs;
    return m(BaseMobileHeader, {
        left: m(SelectAllCheckbox, { selectNone, selectAll, selected }),
        center: m(".font-weight-600", lang.getTranslationText(message)),
        right: m(IconButton, {
            icon: "Cancel" /* Icons.Cancel */,
            title: "cancel_action",
            click: () => selectNone(),
        }),
    });
});
//# sourceMappingURL=MultiselectMobileHeader.js.map