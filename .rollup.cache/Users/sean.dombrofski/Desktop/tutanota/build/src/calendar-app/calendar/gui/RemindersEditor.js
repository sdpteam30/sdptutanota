import m from "mithril";
import { TextField } from "../../../common/gui/base/TextField.js";
import { createAlarmIntervalItems, createCustomRepeatRuleUnitValues, humanDescriptionForAlarmInterval } from "./CalendarGuiUtils.js";
import { lang } from "../../../common/misc/LanguageViewModel.js";
import { IconButton } from "../../../common/gui/base/IconButton.js";
import { attachDropdown } from "../../../common/gui/base/Dropdown.js";
import { AlarmIntervalUnit } from "../../../common/calendar/date/CalendarUtils.js";
import { Dialog } from "../../../common/gui/base/Dialog.js";
import { DropDownSelector } from "../../../common/gui/base/DropDownSelector.js";
import { deepEqual } from "@tutao/tutanota-utils";
import { Select } from "../../../common/gui/base/Select.js";
import { Icon, IconSize } from "../../../common/gui/base/Icon.js";
import { BaseButton } from "../../../common/gui/base/buttons/BaseButton.js";
import { getColors } from "../../../common/gui/base/Button.js";
import stream from "mithril/stream";
export class RemindersEditor {
    view(vnode) {
        const { addAlarm, removeAlarm, alarms, useNewEditor } = vnode.attrs;
        const addNewAlarm = (newAlarm) => {
            const hasAlarm = alarms.find((alarm) => deepEqual(alarm, newAlarm));
            if (hasAlarm)
                return;
            addAlarm(newAlarm);
        };
        return useNewEditor ? this.renderNewEditor(alarms, removeAlarm, addNewAlarm, addAlarm) : this.renderOldEditor(alarms, removeAlarm, addNewAlarm, vnode);
    }
    renderOldEditor(alarms, removeAlarm, addNewAlarm, vnode) {
        const textFieldAttrs = alarms.map((a) => ({
            value: humanDescriptionForAlarmInterval(a, lang.languageTag),
            label: "emptyString_msg",
            isReadOnly: true,
            injectionsRight: () => m(IconButton, {
                title: "delete_action",
                icon: "Cancel" /* Icons.Cancel */,
                click: () => removeAlarm(a),
            }),
        }));
        textFieldAttrs.push({
            value: lang.get("add_action"),
            label: "emptyString_msg",
            isReadOnly: true,
            injectionsRight: () => m(IconButton, attachDropdown({
                mainButtonAttrs: {
                    title: "add_action",
                    icon: "Add" /* Icons.Add */,
                },
                childAttrs: () => [
                    ...createAlarmIntervalItems(lang.languageTag).map((i) => ({
                        label: lang.makeTranslation(i.name, i.name),
                        click: () => addNewAlarm(i.value),
                    })),
                    {
                        label: "calendarReminderIntervalDropdownCustomItem_label",
                        click: () => {
                            this.showCustomReminderIntervalDialog((value, unit) => {
                                addNewAlarm({
                                    value,
                                    unit,
                                });
                            });
                        },
                    },
                ],
            })),
        });
        textFieldAttrs[0].label = vnode.attrs.label;
        return m(".flex.col.flex-half.pl-s", textFieldAttrs.map((a) => m(TextField, a)));
    }
    renderNewEditor(alarms, removeAlarm, addNewAlarm, addAlarm) {
        const alarmOptions = createAlarmIntervalItems(lang.languageTag).map((alarm) => ({
            text: alarm.name,
            value: alarm.value,
            ariaValue: alarm.name,
        }));
        alarmOptions.push({
            text: lang.get("calendarReminderIntervalDropdownCustomItem_label"),
            ariaValue: lang.get("calendarReminderIntervalDropdownCustomItem_label"),
            value: { value: -1, unit: AlarmIntervalUnit.MINUTE },
        });
        const defaultSelected = {
            text: lang.get("addReminder_label"),
            value: { value: -2, unit: AlarmIntervalUnit.MINUTE },
            ariaValue: lang.get("addReminder_label"),
        };
        return m("ul.unstyled-list.flex.col.flex-grow.gap-vpad-s", [
            alarms.map((alarm) => m("li.flex.justify-between.flew-grow.items-center.gap-vpad-s", [
                m("span.flex.justify-between", humanDescriptionForAlarmInterval(alarm, lang.languageTag)),
                m(BaseButton, {
                    //This might not make sense in other languages, but is better than what we have now
                    label: lang.makeTranslation("delete_action", `${lang.get("delete_action")} ${humanDescriptionForAlarmInterval(alarm, lang.languageTag)}`),
                    onclick: () => removeAlarm(alarm),
                    class: "flex items-center",
                }, m(Icon, {
                    icon: "Cancel" /* Icons.Cancel */,
                    size: IconSize.Medium,
                    style: {
                        fill: getColors("content" /* ButtonColor.Content */).button,
                    },
                })),
            ])),
            m("li.items-center", m((Select), {
                ariaLabel: lang.get("calendarReminderIntervalValue_label"),
                selected: defaultSelected,
                options: stream(alarmOptions),
                renderOption: (option) => this.renderReminderOptions(option, false, false),
                renderDisplay: (option) => this.renderReminderOptions(option, alarms.length > 0, true),
                onchange: (newValue) => {
                    if (newValue.value.value === -1) {
                        // timeout needed to prevent the custom interval dialog to be closed by the key event triggered inside the select component
                        return setTimeout(() => {
                            this.showCustomReminderIntervalDialog((value, unit) => {
                                addNewAlarm({
                                    value,
                                    unit,
                                });
                            });
                        }, 0);
                    }
                    addAlarm(newValue.value);
                },
                expanded: true,
                iconColor: getColors("content" /* ButtonColor.Content */).button,
                noIcon: true,
            })),
        ]);
    }
    renderReminderOptions(option, hasAlarms, isDisplay) {
        return m("button.items-center.flex-grow", {
            tabIndex: isDisplay ? "-1" /* TabIndex.Programmatic */ : undefined,
            class: isDisplay ? `flex ${hasAlarms ? "text-fade" : ""}` : "state-bg button-content button-min-height dropdown-button pt-s pb-s",
        }, option.text);
    }
    showCustomReminderIntervalDialog(onAddAction) {
        let timeReminderValue = 0;
        let timeReminderUnit = AlarmIntervalUnit.MINUTE;
        Dialog.showActionDialog({
            title: "calendarReminderIntervalCustomDialog_title",
            allowOkWithReturn: true,
            child: {
                view: () => {
                    const unitItems = createCustomRepeatRuleUnitValues() ?? [];
                    return m(".flex full-width pt-s", [
                        m(TextField, {
                            type: "number" /* TextFieldType.Number */,
                            min: 0,
                            label: "calendarReminderIntervalValue_label",
                            value: timeReminderValue.toString(),
                            oninput: (v) => {
                                const time = Number.parseInt(v);
                                const isEmpty = v === "";
                                if (!Number.isNaN(time) || isEmpty)
                                    timeReminderValue = isEmpty ? 0 : Math.abs(time);
                            },
                            class: "flex-half no-appearance", //Removes the up/down arrow from input number. Pressing arrow up/down key still working
                        }),
                        m(DropDownSelector, {
                            label: "emptyString_msg",
                            selectedValue: timeReminderUnit,
                            items: unitItems,
                            class: "flex-half pl-s",
                            selectionChangedHandler: (selectedValue) => (timeReminderUnit = selectedValue),
                            disabled: false,
                        }),
                    ]);
                },
            },
            okActionTextId: "add_action",
            okAction: (dialog) => {
                onAddAction(timeReminderValue, timeReminderUnit);
                dialog.close();
            },
        });
    }
}
//# sourceMappingURL=RemindersEditor.js.map