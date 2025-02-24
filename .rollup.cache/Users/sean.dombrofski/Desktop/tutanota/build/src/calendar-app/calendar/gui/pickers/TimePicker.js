import m from "mithril";
import { theme } from "../../../../common/gui/theme.js";
import { timeStringFromParts } from "../../../../common/misc/Formatter.js";
import { Time } from "../../../../common/calendar/date/Time.js";
import { Select } from "../../../../common/gui/base/Select.js";
import { SingleLineTextField } from "../../../../common/gui/base/SingleLineTextField.js";
import { isApp } from "../../../../common/api/common/Env.js";
import { px, size } from "../../../../common/gui/size.js";
import stream from "mithril/stream";
export class TimePicker {
    values;
    focused;
    isExpanded = false;
    oldValue;
    value;
    amPm;
    constructor({ attrs }) {
        this.focused = false;
        this.value = "";
        this.amPm = attrs.timeFormat === "1" /* TimeFormat.TWELVE_HOURS */;
        const times = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                times.push(timeStringFromParts(hour, minute, this.amPm));
            }
        }
        this.oldValue = attrs.time?.toString(false) ?? "--";
        this.values = times;
    }
    view({ attrs }) {
        if (attrs.time) {
            const timeAsString = attrs.time?.toString(this.amPm) ?? "";
            if (!this.focused) {
                this.value = timeAsString;
            }
        }
        if (isApp()) {
            return this.renderNativeTimePicker(attrs);
        }
        else {
            return this.renderCustomTimePicker(attrs);
        }
    }
    renderNativeTimePicker(attrs) {
        if (this.oldValue !== attrs.time?.toString(false)) {
            this.onSelected(attrs);
        }
        // input[type=time] wants time in 24h format, no matter what is actually displayed. Otherwise it will be empty.
        const timeAsString = attrs.time?.toString(false) ?? "";
        this.oldValue = timeAsString;
        this.value = timeAsString;
        const displayTime = attrs.time?.toString(this.amPm);
        return m(".rel", [
            m("input.fill-absolute.invisible.tutaui-button-outline", {
                disabled: attrs.disabled,
                type: "time" /* TextFieldType.Time */,
                style: {
                    zIndex: 1,
                    border: `2px solid ${theme.content_message_bg}`,
                    width: "auto",
                    height: "auto",
                    appearance: "none",
                    opacity: attrs.disabled ? 0.7 : 1.0,
                },
                value: this.value,
                oninput: (event) => {
                    const inputValue = event.target.value;
                    if (this.value === inputValue) {
                        return;
                    }
                    this.value = inputValue;
                    attrs.onTimeSelected(Time.parseFromString(inputValue));
                },
            }),
            m(".tutaui-button-outline", {
                class: attrs.classes?.join(" "),
                style: {
                    zIndex: "2",
                    position: "inherit",
                    borderColor: "transparent",
                    pointerEvents: "none",
                    padding: `${px(size.vpad_small)} 0`,
                    opacity: attrs.disabled ? 0.7 : 1.0,
                },
            }, displayTime),
        ]);
    }
    renderCustomTimePicker(attrs) {
        const options = this.values.map((time) => ({
            value: time,
            name: time,
            ariaValue: time,
        }));
        return m((Select), {
            onchange: (newValue) => {
                if (this.value === newValue.value) {
                    return;
                }
                this.value = newValue.value;
                this.onSelected(attrs);
                m.redraw.sync();
            },
            onclose: () => {
                this.isExpanded = false;
            },
            selected: { value: this.value, name: this.value, ariaValue: this.value },
            ariaLabel: attrs.ariaLabel,
            disabled: attrs.disabled,
            options: stream(options),
            noIcon: true,
            expanded: true,
            tabIndex: Number("-1" /* TabIndex.Programmatic */),
            renderDisplay: () => this.renderTimeSelectInput(attrs),
            renderOption: (option) => this.renderTimeOptions(option),
            keepFocus: true,
        });
    }
    renderTimeOptions(option) {
        return m("button.items-center.flex-grow", {
            class: "state-bg button-content dropdown-button pt-s pb-s button-min-height",
        }, option.name);
    }
    renderTimeSelectInput(attrs) {
        return m(SingleLineTextField, {
            classes: [...(attrs.classes ?? []), "tutaui-button-outline", "text-center", "border-content-message-bg"],
            value: this.value,
            oninput: (val) => {
                if (this.value === val) {
                    return;
                }
                this.value = val;
            },
            disabled: attrs.disabled,
            ariaLabel: attrs.ariaLabel,
            style: {
                textAlign: "center",
            },
            onclick: (e) => {
                e.stopImmediatePropagation();
                if (!this.isExpanded) {
                    ;
                    e.target.parentElement?.click();
                    this.isExpanded = true;
                }
            },
            onfocus: (event) => {
                this.focused = true;
                if (!this.isExpanded) {
                    ;
                    event.target.parentElement?.click();
                    this.isExpanded = true;
                }
            },
            onblur: (e) => {
                if (this.focused) {
                    this.onSelected(attrs);
                }
                e.redraw = false;
            },
            type: "text" /* TextFieldType.Text */,
        });
    }
    onSelected(attrs) {
        this.focused = false;
        attrs.onTimeSelected(Time.parseFromString(this.value));
    }
}
//# sourceMappingURL=TimePicker.js.map