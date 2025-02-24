import m from "mithril";
import { Dialog } from "../../common/gui/base/Dialog";
import { getStartOfTheWeekOffsetForUser } from "../../common/calendar/date/CalendarUtils";
import { TextField } from "../../common/gui/base/TextField.js";
import { lang } from "../../common/misc/LanguageViewModel";
import { Keys, OUT_OF_OFFICE_SUBJECT_PREFIX } from "../../common/api/common/TutanotaConstants";
import { Checkbox } from "../../common/gui/base/Checkbox.js";
import { px } from "../../common/gui/size";
import { getDefaultNotificationLabel } from "../../common/misc/OutOfOfficeNotificationUtils";
import { showPlanUpgradeRequiredDialog } from "../../common/misc/SubscriptionDialogs";
import { DropDownSelector } from "../../common/gui/base/DropDownSelector.js";
import { showUserError } from "../../common/misc/ErrorHandlerImpl";
import { locator } from "../../common/api/main/CommonLocator";
import { EditOutOfOfficeNotificationDialogModel } from "./EditOutOfOfficeNotificationDialogModel";
import { HtmlEditor } from "../../common/gui/editor/HtmlEditor";
import { UserError } from "../../common/api/main/UserError";
import { DatePicker } from "../../calendar-app/calendar/gui/pickers/DatePicker";
import { ofClass } from "@tutao/tutanota-utils";
import { UpgradeRequiredError } from "../../common/api/main/UpgradeRequiredError.js";
export function showEditOutOfOfficeNotificationDialog(outOfOfficeNotification) {
    const dialogModel = new EditOutOfOfficeNotificationDialogModel(outOfOfficeNotification, locator.entityClient, locator.logins.getUserController(), lang, locator.serviceExecutor);
    const organizationMessageEditor = new HtmlEditor("message_label")
        .setMinHeight(100)
        .showBorders()
        .setValue(dialogModel.organizationMessage())
        .enableToolbar();
    const defaultMessageEditor = new HtmlEditor("message_label").setMinHeight(100).showBorders().setValue(dialogModel.defaultMessage()).enableToolbar();
    const saveOutOfOfficeNotification = () => {
        dialogModel.organizationMessage(organizationMessageEditor.getValue());
        dialogModel.defaultMessage(defaultMessageEditor.getValue());
        dialogModel
            .saveOutOfOfficeNotification()
            .then(() => cancel())
            .catch(ofClass(UserError, (e) => showUserError(e)))
            .catch(ofClass(UpgradeRequiredError, (e) => {
            showPlanUpgradeRequiredDialog(e.plans);
        }));
    };
    function cancel() {
        dialog.close();
    }
    const dialogHeaderAttrs = {
        left: [
            {
                label: "cancel_action",
                click: cancel,
                type: "secondary" /* ButtonType.Secondary */,
            },
        ],
        right: [
            {
                label: "save_action",
                click: saveOutOfOfficeNotification,
                type: "primary" /* ButtonType.Primary */,
            },
        ],
        middle: "outOfOfficeNotification_title",
    };
    const dialog = Dialog.editDialog(dialogHeaderAttrs, EditOutOfOfficeNotificationDialog, {
        model: dialogModel,
        organizationMessageEditor,
        defaultMessageEditor,
    })
        .addShortcut({
        key: Keys.ESC,
        exec: cancel,
        help: "close_alt",
    })
        .addShortcut({
        key: Keys.S,
        ctrlOrCmd: true,
        exec: saveOutOfOfficeNotification,
        help: "save_action",
    });
    dialog.show();
}
class EditOutOfOfficeNotificationDialog {
    view(vnode) {
        const { model, defaultMessageEditor, organizationMessageEditor } = vnode.attrs;
        const defaultEnabled = model.isDefaultMessageEnabled();
        const organizationEnabled = model.isOrganizationMessageEnabled();
        const startOfTheWeekOffset = getStartOfTheWeekOffsetForUser(locator.logins.getUserController().userSettingsGroupRoot);
        return [
            this.renderEnabled(model),
            this.renderRecipients(model),
            m(".mt.flex-start", m(Checkbox, {
                label: () => lang.get("outOfOfficeTimeRange_msg"),
                checked: model.timeRangeEnabled(),
                onChecked: model.timeRangeEnabled,
                helpLabel: "outOfOfficeTimeRangeHelp_msg",
            })),
            model.timeRangeEnabled() ? this.renderTimeRangeSelector(model, startOfTheWeekOffset) : null,
            m(".mt-l", lang.get("outOfOfficeUnencrypted_msg")),
            organizationEnabled ? this.renderOrganizations(model, organizationMessageEditor) : null,
            defaultEnabled ? this.renderDefault(organizationEnabled, model, defaultMessageEditor) : null,
            m(".pb", ""),
        ];
    }
    renderEnabled(model) {
        const statusItems = [
            { name: lang.get("deactivated_label"), value: false },
            { name: lang.get("activated_label"), value: true },
        ];
        return m(DropDownSelector, {
            label: "state_label",
            items: statusItems,
            selectedValue: model.enabled(),
            selectionChangedHandler: model.enabled,
        });
    }
    renderDefault(organizationEnabled, model, defaultMessageEditor) {
        return [
            m(".h4.text-center.mt-l", getDefaultNotificationLabel(organizationEnabled)),
            m(TextField, {
                label: "subject_label",
                value: model.defaultSubject(),
                oninput: model.defaultSubject,
                injectionsLeft: () => m(".flex-no-grow-no-shrink-auto.pr-s", {
                    style: {
                        "line-height": px(24),
                        opacity: "1",
                    },
                }, OUT_OF_OFFICE_SUBJECT_PREFIX),
            }),
            m(defaultMessageEditor),
        ];
    }
    renderOrganizations(model, organizationMessageEditor) {
        return [
            m(".h4.text-center.mt-l", lang.get("outOfOfficeInternal_msg")),
            m(TextField, {
                label: "subject_label",
                value: model.organizationSubject(),
                oninput: model.organizationSubject,
                injectionsLeft: () => m(".flex-no-grow-no-shrink-auto.pr-s", {
                    style: {
                        "line-height": px(24),
                        opacity: "1",
                    },
                }, OUT_OF_OFFICE_SUBJECT_PREFIX),
            }),
            m(organizationMessageEditor),
        ];
    }
    renderRecipients(model) {
        const recipientItems = [
            { name: lang.get("everyone_label"), value: 0 /* RecipientMessageType.EXTERNAL_TO_EVERYONE */ },
            { name: lang.get("insideOutside_label"), value: 1 /* RecipientMessageType.INTERNAL_AND_EXTERNAL */ },
            { name: lang.get("insideOnly_label"), value: 2 /* RecipientMessageType.INTERNAL_ONLY */ },
        ];
        const recipientHelpLabel = () => {
            switch (model.recipientMessageTypes()) {
                case 0 /* RecipientMessageType.EXTERNAL_TO_EVERYONE */:
                    return lang.get("outOfOfficeRecipientsEveryoneHelp_label");
                case 1 /* RecipientMessageType.INTERNAL_AND_EXTERNAL */:
                    return lang.get("outOfOfficeRecipientsInternalExternalHelp_label");
                case 2 /* RecipientMessageType.INTERNAL_ONLY */:
                    return lang.get("outOfOfficeRecipientsInternalOnlyHelp_label");
                default:
                    return "";
            }
        };
        return m(DropDownSelector, {
            label: "outOfOfficeRecipients_label",
            items: recipientItems,
            selectedValue: model.recipientMessageTypes(),
            selectionChangedHandler: model.recipientMessageTypes,
            helpLabel: recipientHelpLabel,
        });
    }
    renderTimeRangeSelector(model, startOfTheWeekOffset) {
        return m(".flex.col", [
            m(DatePicker, {
                date: model.startDate(),
                onDateSelected: model.startDate,
                label: "dateFrom_label",
                nullSelectionText: "emptyString_msg",
                startOfTheWeekOffset,
            }),
            m(Checkbox, {
                label: () => lang.get("unlimited_label"),
                checked: model.indefiniteTimeRange(),
                onChecked: model.indefiniteTimeRange,
            }),
            !model.indefiniteTimeRange()
                ? m(DatePicker, {
                    date: model.endDate(),
                    onDateSelected: model.endDate,
                    label: "dateTo_label",
                    nullSelectionText: "emptyString_msg",
                    startOfTheWeekOffset,
                })
                : null,
        ]);
    }
}
//# sourceMappingURL=EditOutOfOfficeNotificationDialog.js.map