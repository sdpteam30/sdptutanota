import m from "mithril";
import stream from "mithril/stream";
import { lang, languageByCode } from "../../misc/LanguageViewModel";
import { ExpanderButton, ExpanderPanel } from "../../gui/base/Expander";
import { Table } from "../../gui/base/Table.js";
import { attachDropdown } from "../../gui/base/Dropdown.js";
import { downcast } from "@tutao/tutanota-utils";
export class WhitelabelNotificationEmailSettings {
    _notificationEmailsExpanded;
    constructor(vnode) {
        this._notificationEmailsExpanded = stream(false);
    }
    view(vnode) {
        const { onAddTemplate, onEditTemplate, onRemoveTemplate, notificationMailTemplates } = vnode.attrs;
        return this._renderNotificationEmailSettings(notificationMailTemplates, onAddTemplate, onEditTemplate, onRemoveTemplate);
    }
    _renderNotificationEmailSettings(notificationMailTemplates, onAddTemplate, onEditTemplate, onRemoveTemplate) {
        return [
            m(".flex-space-between.items-center.mt-l.mb-s", [
                m(".h4", lang.get("customNotificationEmails_label")),
                m(ExpanderButton, {
                    label: "show_action",
                    expanded: this._notificationEmailsExpanded(),
                    onExpandedChange: this._notificationEmailsExpanded,
                }),
            ]),
            m(ExpanderPanel, {
                expanded: this._notificationEmailsExpanded(),
            }, m(Table, {
                columnHeading: ["language_label", "subject_label"],
                columnWidths: [".column-width-largest" /* ColumnWidth.Largest */, ".column-width-largest" /* ColumnWidth.Largest */],
                showActionButtonColumn: true,
                addButtonAttrs: {
                    title: "add_action",
                    click: () => {
                        onAddTemplate();
                    },
                    icon: "Add" /* Icons.Add */,
                    size: 1 /* ButtonSize.Compact */,
                },
                lines: notificationMailTemplates.map((template) => {
                    const languageCode = downcast(template.language);
                    const langName = lang.get(languageByCode[languageCode].textId);
                    return {
                        cells: [langName, template.subject],
                        actionButtonAttrs: attachDropdown({
                            mainButtonAttrs: {
                                title: "edit_action",
                                icon: "Edit" /* Icons.Edit */,
                                size: 1 /* ButtonSize.Compact */,
                            },
                            childAttrs: () => [
                                {
                                    label: "edit_action",
                                    click: () => onEditTemplate(template),
                                },
                                {
                                    label: "remove_action",
                                    click: () => onRemoveTemplate(template),
                                },
                            ],
                        }),
                    };
                }),
            })),
            m(".small", lang.get("customNotificationEmailsHelp_msg")),
        ];
    }
}
//# sourceMappingURL=WhitelabelNotificationEmailSettings.js.map