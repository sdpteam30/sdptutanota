import m from "mithril";
import { lang } from "../../../../common/misc/LanguageViewModel.js";
import { RepeatPeriod } from "../../../../common/api/common/TutanotaConstants.js";
import { DatePicker, PickerPosition } from "../pickers/DatePicker.js";
import { createCustomEndTypeOptions, createIntervalValues, createRepeatRuleOptions, customFrequenciesOptions } from "../CalendarGuiUtils.js";
import { px, size } from "../../../../common/gui/size.js";
import { Card } from "../../../../common/gui/base/Card.js";
import { RadioGroup } from "../../../../common/gui/base/RadioGroup.js";
import { InputMode, SingleLineTextField } from "../../../../common/gui/base/SingleLineTextField.js";
import { Select } from "../../../../common/gui/base/Select.js";
import stream from "mithril/stream";
import { Divider } from "../../../../common/gui/Divider.js";
import { theme } from "../../../../common/gui/theme.js";
import { isApp } from "../../../../common/api/common/Env.js";
export class RepeatRuleEditor {
    repeatRuleType = null;
    repeatInterval = 0;
    intervalOptions = stream([]);
    intervalExpanded = false;
    numberValues = createIntervalValues();
    occurrencesOptions = stream([]);
    occurrencesExpanded = false;
    repeatOccurrences;
    constructor({ attrs }) {
        if (attrs.model.repeatPeriod != null) {
            this.repeatRuleType = this.getRepeatType(attrs.model.repeatPeriod, attrs.model.repeatInterval, attrs.model.repeatEndType);
        }
        this.intervalOptions(this.numberValues);
        this.occurrencesOptions(this.numberValues);
        this.repeatInterval = attrs.model.repeatInterval;
        this.repeatOccurrences = attrs.model.repeatEndOccurrences;
    }
    getRepeatType(period, interval, endTime) {
        if (interval > 1 || endTime !== "0" /* EndType.Never */) {
            return "CUSTOM";
        }
        return period;
    }
    view({ attrs }) {
        const customRuleOptions = customFrequenciesOptions.map((option) => ({
            ...option,
            name: attrs.model.repeatInterval > 1 ? option.name.plural : option.name.singular,
        }));
        return m(".pb.pt.flex.col.gap-vpad.fit-height", {
            class: this.repeatRuleType === "CUSTOM" ? "box-content" : "",
            style: {
                width: px(attrs.width),
            },
        }, [
            m(Card, {
                style: {
                    padding: `${size.vpad}px`,
                },
            }, m(RadioGroup, {
                ariaLabel: "calendarRepeating_label",
                name: "calendarRepeating_label",
                options: createRepeatRuleOptions(),
                selectedOption: this.repeatRuleType,
                onOptionSelected: (option) => {
                    this.repeatRuleType = option;
                    if (option === "CUSTOM") {
                        attrs.model.repeatPeriod = attrs.model.repeatPeriod ?? RepeatPeriod.DAILY;
                    }
                    else {
                        attrs.model.repeatInterval = 1;
                        attrs.model.repeatEndType = "0" /* EndType.Never */;
                        attrs.model.repeatPeriod = option;
                        attrs.backAction();
                    }
                },
                classes: ["cursor-pointer"],
            })),
            this.renderFrequencyOptions(attrs, customRuleOptions),
            this.renderEndOptions(attrs),
        ]);
    }
    renderEndOptions(attrs) {
        if (this.repeatRuleType !== "CUSTOM") {
            return null;
        }
        return m(".flex.col", [
            m("small.uppercase.pb-s.b.text-ellipsis", { style: { color: theme.navigation_button } }, lang.get("calendarRepeatStopCondition_label")),
            m(Card, {
                style: {
                    padding: `${size.vpad}px`,
                },
                classes: ["flex", "col", "gap-vpad-s"],
            }, [
                m(RadioGroup, {
                    ariaLabel: "calendarRepeatStopCondition_label",
                    name: "calendarRepeatStopCondition_label",
                    options: createCustomEndTypeOptions(),
                    selectedOption: attrs.model.repeatEndType,
                    onOptionSelected: (option) => {
                        attrs.model.repeatEndType = option;
                    },
                    classes: ["cursor-pointer"],
                    injectionMap: this.buildInjections(attrs),
                }),
            ]),
        ]);
    }
    renderFrequencyOptions(attrs, customRuleOptions) {
        if (this.repeatRuleType !== "CUSTOM") {
            return null;
        }
        return m(".flex.col", [
            m("small.uppercase.pb-s.b.text-ellipsis", { style: { color: theme.navigation_button } }, lang.get("intervalFrequency_label")),
            m(Card, {
                style: {
                    padding: `0 0 ${size.vpad}px`,
                },
                classes: ["flex", "col"],
            }, [
                this.renderIntervalPicker(attrs),
                m(Divider, { color: theme.button_bubble_bg, style: { margin: `0 0 ${size.vpad}px` } }),
                m(RadioGroup, {
                    ariaLabel: "intervalFrequency_label",
                    name: "intervalFrequency_label",
                    options: customRuleOptions,
                    selectedOption: attrs.model.repeatPeriod,
                    onOptionSelected: (option) => {
                        this.updateCustomRule(attrs.model, { intervalFrequency: option });
                    },
                    classes: ["cursor-pointer", "capitalize", "pl-vpad-m", "pr-vpad-m"],
                }),
            ]),
        ]);
    }
    buildInjections(attrs) {
        const injectionMap = new Map();
        injectionMap.set("1" /* EndType.Count */, this.renderEndsPicker(attrs));
        injectionMap.set("2" /* EndType.UntilDate */, m(DatePicker, {
            date: attrs.model.repeatEndDateForDisplay,
            onDateSelected: (date) => date && (attrs.model.repeatEndDateForDisplay = date),
            label: "endDate_label",
            useInputButton: true,
            startOfTheWeekOffset: attrs.startOfTheWeekOffset,
            position: PickerPosition.TOP,
            classes: ["full-width", "flex-grow", attrs.model.repeatEndType !== "2" /* EndType.UntilDate */ ? "disabled" : ""],
        }));
        return injectionMap;
    }
    updateCustomRule(whenModel, customRule) {
        const { interval, intervalFrequency } = customRule;
        if (interval && !isNaN(interval)) {
            whenModel.repeatInterval = interval;
        }
        if (intervalFrequency) {
            whenModel.repeatPeriod = intervalFrequency;
        }
    }
    renderIntervalPicker(attrs) {
        return m((Select), {
            onchange: (newValue) => {
                if (this.repeatInterval === newValue.value) {
                    return;
                }
                this.repeatInterval = newValue.value;
                this.updateCustomRule(attrs.model, { interval: this.repeatInterval });
                m.redraw.sync();
            },
            onclose: () => {
                this.intervalExpanded = false;
                this.intervalOptions(this.numberValues);
            },
            selected: { value: this.repeatInterval, name: this.repeatInterval.toString(), ariaValue: this.repeatInterval.toString() },
            ariaLabel: lang.get("repeatsEvery_label"),
            options: this.intervalOptions,
            noIcon: true,
            expanded: true,
            tabIndex: isApp() ? Number("0" /* TabIndex.Default */) : Number("-1" /* TabIndex.Programmatic */),
            classes: ["no-appearance"],
            renderDisplay: () => m(SingleLineTextField, {
                classes: ["border-radius-bottom-0"],
                value: isNaN(this.repeatInterval) ? "" : this.repeatInterval.toString(),
                inputMode: isApp() ? InputMode.NONE : InputMode.TEXT,
                readonly: isApp(),
                oninput: (val) => {
                    if (val !== "" && this.repeatInterval === Number(val)) {
                        return;
                    }
                    this.repeatInterval = val === "" ? NaN : Number(val);
                    if (!isNaN(this.repeatInterval)) {
                        this.intervalOptions(this.numberValues.filter((opt) => opt.value.toString().startsWith(val)));
                        this.updateCustomRule(attrs.model, { interval: this.repeatInterval });
                    }
                    else {
                        this.intervalOptions(this.numberValues);
                    }
                },
                ariaLabel: lang.get("repeatsEvery_label"),
                onclick: (e) => {
                    e.stopImmediatePropagation();
                    if (!this.intervalExpanded) {
                        ;
                        e.target.parentElement?.click();
                        this.intervalExpanded = true;
                    }
                },
                onfocus: (event) => {
                    if (!this.intervalExpanded) {
                        ;
                        event.target.parentElement?.click();
                        this.intervalExpanded = true;
                    }
                },
                onblur: (event) => {
                    if (isNaN(this.repeatInterval)) {
                        this.repeatInterval = this.numberValues[0].value;
                        this.updateCustomRule(attrs.model, { interval: this.repeatInterval });
                    }
                    else if (this.repeatInterval === 0) {
                        this.repeatInterval = this.numberValues[0].value;
                        this.updateCustomRule(attrs.model, { interval: this.repeatInterval });
                    }
                },
                style: {
                    textAlign: "center",
                },
                max: 256,
                min: 1,
                type: "number" /* TextFieldType.Number */,
            }),
            renderOption: (option) => m("button.items-center.flex-grow", {
                class: "state-bg button-content dropdown-button pt-s pb-s button-min-height",
            }, option.name),
            keepFocus: true,
        });
    }
    renderEndsPicker(attrs) {
        return m((Select), {
            onchange: (newValue) => {
                if (this.repeatOccurrences === newValue.value) {
                    return;
                }
                this.repeatOccurrences = newValue.value;
                attrs.model.repeatEndOccurrences = newValue.value;
            },
            onclose: () => {
                this.occurrencesExpanded = false;
                this.occurrencesOptions(this.numberValues);
            },
            selected: { value: this.repeatOccurrences, name: this.repeatOccurrences.toString(), ariaValue: this.repeatOccurrences.toString() },
            ariaLabel: lang.get("occurrencesCount_label"),
            options: this.occurrencesOptions,
            noIcon: true,
            expanded: true,
            tabIndex: isApp() ? Number("0" /* TabIndex.Default */) : Number("-1" /* TabIndex.Programmatic */),
            classes: ["no-appearance"],
            renderDisplay: () => m(SingleLineTextField, {
                classes: ["tutaui-button-outline", "text-center", "border-content-message-bg"],
                value: isNaN(this.repeatOccurrences) ? "" : this.repeatOccurrences.toString(),
                inputMode: isApp() ? InputMode.NONE : InputMode.TEXT,
                readonly: isApp(),
                oninput: (val) => {
                    if (val !== "" && this.repeatOccurrences === Number(val)) {
                        return;
                    }
                    this.repeatOccurrences = val === "" ? NaN : Number(val);
                    if (!isNaN(this.repeatOccurrences)) {
                        this.occurrencesOptions(this.numberValues.filter((opt) => opt.value.toString().startsWith(val)));
                        attrs.model.repeatEndOccurrences = this.repeatOccurrences;
                    }
                    else {
                        this.occurrencesOptions(this.numberValues);
                    }
                },
                ariaLabel: lang.get("occurrencesCount_label"),
                style: {
                    textAlign: "center",
                },
                onclick: (e) => {
                    e.stopImmediatePropagation();
                    if (!this.occurrencesExpanded) {
                        ;
                        e.target.parentElement?.click();
                        this.occurrencesExpanded = true;
                    }
                },
                onfocus: (event) => {
                    if (!this.occurrencesExpanded) {
                        ;
                        event.target.parentElement?.click();
                        this.occurrencesExpanded = true;
                    }
                },
                onblur: (event) => {
                    if (isNaN(this.repeatOccurrences)) {
                        this.repeatOccurrences = this.numberValues[0].value;
                        attrs.model.repeatEndOccurrences = this.repeatOccurrences;
                    }
                    else if (this.repeatOccurrences === 0) {
                        this.repeatOccurrences = this.numberValues[0].value;
                        attrs.model.repeatEndOccurrences = this.repeatOccurrences;
                    }
                },
                max: 256,
                min: 1,
                type: "number" /* TextFieldType.Number */,
            }),
            renderOption: (option) => m("button.items-center.flex-grow", {
                class: "state-bg button-content dropdown-button pt-s pb-s button-min-height",
            }, option.name),
            keepFocus: true,
        });
    }
}
//# sourceMappingURL=RepeatRuleEditor.js.map