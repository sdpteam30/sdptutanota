import m from "mithril";
import { ListColumnWrapper } from "../../common/gui/ListColumnWrapper";
import { theme } from "../../common/gui/theme";
import ColumnEmptyMessageBox from "../../common/gui/base/ColumnEmptyMessageBox";
import { createInitialTemplateListIfAllowed } from "../templates/TemplateGroupUtils";
import { showTemplateEditor } from "./TemplateEditor";
import { BaseSearchBar } from "../../common/gui/base/BaseSearchBar.js";
import { lang } from "../../common/misc/LanguageViewModel.js";
import { IconButton } from "../../common/gui/base/IconButton.js";
export class DummyTemplateListView {
    searchQuery = "";
    view(vnode) {
        return m(ListColumnWrapper, {
            headerContent: m(".flex.flex-space-between.center-vertically.plr-l", m(BaseSearchBar, {
                text: this.searchQuery,
                onInput: (text) => (this.searchQuery = text),
                busy: false,
                onKeyDown: (e) => e.stopPropagation(),
                onClear: () => {
                    this.searchQuery = "";
                },
                placeholder: lang.get("searchTemplates_placeholder"),
            }), m(".mr-negative-s", m(IconButton, {
                title: "addTemplate_label",
                icon: "Add" /* Icons.Add */,
                click: () => {
                    // SettingsView will reroute to the folder for the newly created template list (if there is one)
                    createInitialTemplateListIfAllowed().then((groupRoot) => {
                        if (groupRoot) {
                            showTemplateEditor(null, groupRoot);
                        }
                    });
                },
            }))),
        }, m(".fill-absolute.overflow-hidden", m(ColumnEmptyMessageBox, {
            color: theme.list_message_bg,
            icon: "ListAlt" /* Icons.ListAlt */,
            message: "noEntries_msg",
        })));
    }
}
//# sourceMappingURL=DummyTemplateListView.js.map