import m from "mithril";
import { AttendeeListEditor } from "./AttendeeListEditor.js";
import { locator } from "../../../../common/api/main/CommonLocator.js";
import { EventTimeEditor } from "./EventTimeEditor.js";
import { defaultCalendarColor } from "../../../../common/api/common/TutanotaConstants.js";
import { lang } from "../../../../common/misc/LanguageViewModel.js";
import { InfoBanner } from "../../../../common/gui/base/InfoBanner.js";
import { getSharedGroupName } from "../../../../common/sharing/GroupUtils.js";
import { RemindersEditor } from "../RemindersEditor.js";
import { SingleLineTextField } from "../../../../common/gui/base/SingleLineTextField.js";
import { px, size } from "../../../../common/gui/size.js";
import { Card } from "../../../../common/gui/base/Card.js";
import { Select } from "../../../../common/gui/base/Select.js";
import { Icon, IconSize } from "../../../../common/gui/base/Icon.js";
import { theme } from "../../../../common/gui/theme.js";
import { deepEqual } from "@tutao/tutanota-utils";
import { getColors } from "../../../../common/gui/base/Button.js";
import stream from "mithril/stream";
import { RepeatRuleEditor } from "./RepeatRuleEditor.js";
import { formatRepetitionEnd, formatRepetitionFrequency } from "../eventpopup/EventPreviewView.js";
import { DefaultAnimationTime } from "../../../../common/gui/animation/Animations.js";
import { SectionButton } from "../../../../common/gui/base/buttons/SectionButton.js";
export var EditorPages;
(function (EditorPages) {
    EditorPages[EditorPages["MAIN"] = 0] = "MAIN";
    EditorPages[EditorPages["REPEAT_RULES"] = 1] = "REPEAT_RULES";
    EditorPages[EditorPages["GUESTS"] = 2] = "GUESTS";
})(EditorPages || (EditorPages = {}));
/**
 * combines several semi-related editor components into a full editor for editing calendar events
 * to be displayed in a dialog.
 *
 * controls the enabling/disabling of certain editor components and the display of additional info
 * in the dialog depending on the type of the event being edited.
 */
export class CalendarEventEditView {
    timeFormat;
    startOfTheWeekOffset;
    defaultAlarms;
    transitionPage = null;
    hasAnimationEnded = true;
    pages = new Map();
    pagesWrapperDomElement;
    allowRenderMainPage = stream(true);
    dialogHeight = null;
    pageWidth = -1;
    translate = 0;
    constructor(vnode) {
        this.timeFormat = vnode.attrs.timeFormat;
        this.startOfTheWeekOffset = vnode.attrs.startOfTheWeekOffset;
        this.defaultAlarms = vnode.attrs.defaultAlarms;
        if (vnode.attrs.model.operation == 0 /* CalendarOperation.Create */) {
            const initialAlarms = vnode.attrs.defaultAlarms.get(vnode.attrs.model.editModels.whoModel.selectedCalendar.group._id) ?? [];
            vnode.attrs.model.editModels.alarmModel.addAll(initialAlarms);
        }
        this.pages.set(EditorPages.REPEAT_RULES, this.renderRepeatRulesPage);
        this.pages.set(EditorPages.GUESTS, this.renderGuestsPage);
        vnode.attrs.currentPage.map((page) => {
            this.hasAnimationEnded = false;
            if (page === EditorPages.MAIN) {
                this.allowRenderMainPage(true);
                this.translate = 0;
            }
        });
        this.allowRenderMainPage.map((allowRendering) => {
            return this.handleEditorStatus(allowRendering, vnode);
        });
    }
    onremove(vnode) {
        vnode.attrs.currentPage.end(true);
        this.allowRenderMainPage.end(true);
    }
    handleEditorStatus(allowRendering, vnode) {
        if (allowRendering && vnode.attrs.currentPage() === EditorPages.MAIN) {
            if (vnode.attrs.descriptionEditor.editor.domElement) {
                vnode.attrs.descriptionEditor.editor.domElement.tabIndex = Number("0" /* TabIndex.Default */);
            }
            return vnode.attrs.descriptionEditor.setEnabled(true);
        }
        if (vnode.attrs.descriptionEditor.editor.domElement) {
            vnode.attrs.descriptionEditor.editor.domElement.tabIndex = Number("-1" /* TabIndex.Programmatic */);
        }
        vnode.attrs.descriptionEditor.setEnabled(false);
    }
    oncreate(vnode) {
        this.pagesWrapperDomElement = vnode.dom;
        this.pagesWrapperDomElement.addEventListener("transitionend", () => {
            if (vnode.attrs.currentPage() !== EditorPages.MAIN) {
                setTimeout(() => {
                    this.allowRenderMainPage(false);
                }, DefaultAnimationTime);
                m.redraw();
                return;
            }
            this.transitionPage = vnode.attrs.currentPage();
            this.hasAnimationEnded = true;
            setTimeout(() => {
                this.allowRenderMainPage(true);
                m.redraw();
            }, DefaultAnimationTime);
        });
    }
    onupdate(vnode) {
        const dom = vnode.dom;
        if (this.dialogHeight == null && dom.parentElement) {
            this.dialogHeight = dom.parentElement.clientHeight;
            vnode.dom.style.height = px(this.dialogHeight);
        }
        if (this.pageWidth == -1 && dom.parentElement) {
            this.pageWidth = dom.parentElement.clientWidth - size.hpad_large * 2;
            vnode.dom.style.width = px(this.pageWidth * 2 + size.vpad_xxl);
            m.redraw();
        }
    }
    view(vnode) {
        return m(".flex.gap-vpad-xxl.fit-content.transition-transform", {
            style: {
                transform: `translateX(${this.translate}px)`,
            },
        }, [this.renderMainPage(vnode), this.renderPage(vnode)]);
    }
    renderPage(vnode) {
        if (this.hasAnimationEnded || this.transitionPage == null) {
            return this.pages.get(vnode.attrs.currentPage())?.apply(this, [vnode]);
        }
        return this.pages.get(this.transitionPage)?.apply(this, [vnode]);
    }
    renderGuestsPage({ attrs: { model, recipientsSearch } }) {
        return m(AttendeeListEditor, {
            recipientsSearch,
            logins: locator.logins,
            model,
            width: this.pageWidth,
        });
    }
    renderTitle(attrs) {
        const { model } = attrs;
        return m(Card, {
            style: {
                padding: "0",
            },
        }, m(SingleLineTextField, {
            value: model.editModels.summary.content,
            oninput: (newValue) => {
                model.editModels.summary.content = newValue;
            },
            ariaLabel: lang.get("title_placeholder"),
            placeholder: lang.get("title_placeholder"),
            disabled: !model.isFullyWritable(),
            style: {
                fontSize: px(size.font_size_base * 1.25), // Overriding the component style
            },
            type: "text" /* TextFieldType.Text */,
        }));
    }
    renderReadonlyMessage(attrs) {
        const { model } = attrs;
        const makeMessage = (message) => m(InfoBanner, {
            message: () => m(".small.selectable", lang.get(message)),
            icon: "People" /* Icons.People */,
            type: "info" /* BannerType.Info */,
            buttons: [],
        });
        switch (model.getReadonlyReason()) {
            case 0 /* ReadonlyReason.SHARED */:
                return makeMessage("cannotEditFullEvent_msg");
            case 1 /* ReadonlyReason.SINGLE_INSTANCE */:
                return makeMessage("cannotEditSingleInstance_msg");
            case 2 /* ReadonlyReason.NOT_ORGANIZER */:
                return makeMessage("cannotEditNotOrganizer_msg");
            case 3 /* ReadonlyReason.UNKNOWN */:
                return makeMessage("cannotEditEvent_msg");
            case 4 /* ReadonlyReason.NONE */:
                return null;
        }
    }
    renderEventTimeEditor(attrs) {
        const padding = px(size.vpad_small);
        return m(Card, { style: { padding: `${padding} 0 ${padding} ${padding}` } }, m(EventTimeEditor, {
            editModel: attrs.model.editModels.whenModel,
            timeFormat: this.timeFormat,
            startOfTheWeekOffset: this.startOfTheWeekOffset,
            disabled: !attrs.model.isFullyWritable(),
        }));
    }
    renderRepeatRuleNavButton({ model, navigationCallback }) {
        const repeatRuleText = this.getTranslatedRepeatRule(model.editModels.whenModel.result.repeatRule, model.editModels.whenModel.isAllDay);
        return m(SectionButton, {
            leftIcon: { icon: "Sync" /* Icons.Sync */, title: "calendarRepeating_label" },
            text: lang.makeTranslation(repeatRuleText, repeatRuleText),
            isDisabled: !model.canEditSeries(),
            onclick: () => {
                this.transitionTo(EditorPages.REPEAT_RULES, navigationCallback);
            },
        });
    }
    transitionTo(target, navigationCallback) {
        this.hasAnimationEnded = false;
        this.transitionPage = target;
        this.translate = -(this.pageWidth + size.vpad_xxl);
        navigationCallback(target);
    }
    renderGuestsNavButton({ navigationCallback, model }) {
        return m(SectionButton, {
            leftIcon: { icon: "People" /* Icons.People */, title: "calendarRepeating_label" },
            text: "guests_label",
            injectionRight: model.editModels.whoModel.guests.length > 0 ? m("span", model.editModels.whoModel.guests.length) : null,
            onclick: () => {
                this.transitionTo(EditorPages.GUESTS, navigationCallback);
            },
        });
    }
    renderCalendarPicker(vnode) {
        const { model, groupColors } = vnode.attrs;
        const availableCalendars = model.editModels.whoModel.getAvailableCalendars();
        const options = availableCalendars.map((calendarInfo) => {
            const name = getSharedGroupName(calendarInfo.groupInfo, model.userController, calendarInfo.shared);
            return {
                name,
                color: "#" + (groupColors.get(calendarInfo.group._id) ?? defaultCalendarColor),
                value: calendarInfo,
                ariaValue: name,
            };
        });
        const selectedCalendarInfo = model.editModels.whoModel.selectedCalendar;
        const selectedCalendarName = getSharedGroupName(selectedCalendarInfo.groupInfo, model.userController, selectedCalendarInfo.shared);
        let selected = {
            name: selectedCalendarName,
            color: "#" + (groupColors.get(selectedCalendarInfo.group._id) ?? defaultCalendarColor),
            value: model.editModels.whoModel.selectedCalendar,
            ariaValue: selectedCalendarName,
        };
        return m(Card, { style: { padding: "0" } }, m((Select), {
            onchange: (val) => {
                model.editModels.alarmModel.removeAll();
                model.editModels.alarmModel.addAll(this.defaultAlarms.get(val.value.group._id) ?? []);
                model.editModels.whoModel.selectedCalendar = val.value;
            },
            options: stream(options),
            expanded: true,
            selected,
            classes: ["button-min-height", "pl-vpad-s", "pr-vpad-s"],
            renderOption: (option) => this.renderCalendarOptions(option, deepEqual(option.value, selected.value), false),
            renderDisplay: (option) => this.renderCalendarOptions(option, false, true),
            ariaLabel: lang.get("calendar_label"),
            disabled: !model.canChangeCalendar() || availableCalendars.length < 2,
        }));
    }
    renderCalendarOptions(option, isSelected, isDisplay) {
        return m(".flex.items-center.gap-vpad-s.flex-grow", { class: `${isDisplay ? "" : "state-bg plr-button button-content dropdown-button pt-s pb-s button-min-height"}` }, [
            m("div", {
                style: {
                    width: px(size.hpad_large),
                    height: px(size.hpad_large),
                    borderRadius: "50%",
                    backgroundColor: option.color,
                    marginInline: px(size.vpad_xsm / 2),
                },
            }),
            m("span", { style: { color: isSelected ? theme.content_button_selected : undefined } }, option.name),
        ]);
    }
    renderRemindersEditor(vnode) {
        if (!vnode.attrs.model.editModels.alarmModel.canEditReminders)
            return null;
        const { alarmModel } = vnode.attrs.model.editModels;
        return m(Card, { classes: ["button-min-height", "flex", "items-center"] }, m(".flex.gap-vpad-s.items-start.flex-grow", [
            m(".flex", {
                class: alarmModel.alarms.length === 0 ? "items-center" : "items-start",
            }, [
                m(Icon, {
                    icon: "Clock" /* Icons.Clock */,
                    style: { fill: getColors("content" /* ButtonColor.Content */).button },
                    title: lang.get("reminderBeforeEvent_label"),
                    size: IconSize.Medium,
                }),
            ]),
            m(RemindersEditor, {
                alarms: alarmModel.alarms,
                addAlarm: alarmModel.addAlarm.bind(alarmModel),
                removeAlarm: alarmModel.removeAlarm.bind(alarmModel),
                label: "reminderBeforeEvent_label",
                useNewEditor: true,
            }),
        ]));
    }
    renderLocationField(vnode) {
        const { model } = vnode.attrs;
        return m(Card, {
            style: { padding: "0" },
        }, m(".flex.gap-vpad-s.items-center", m(SingleLineTextField, {
            value: model.editModels.location.content,
            oninput: (newValue) => {
                model.editModels.location.content = newValue;
            },
            classes: ["button-min-height"],
            ariaLabel: lang.get("location_label"),
            placeholder: lang.get("location_label"),
            disabled: !model.isFullyWritable(),
            leadingIcon: {
                icon: "Pin" /* Icons.Pin */,
                color: getColors("content" /* ButtonColor.Content */).button,
            },
            type: "text" /* TextFieldType.Text */,
        })));
    }
    renderDescriptionEditor(vnode) {
        return m(Card, {
            classes: ["child-text-editor", "rel"],
            style: {
                padding: "0",
            },
        }, [
            vnode.attrs.descriptionEditor.isEmpty() && !vnode.attrs.descriptionEditor.isActive()
                ? m("span.text-editor-placeholder", lang.get("description_label"))
                : null,
            m(vnode.attrs.descriptionEditor),
        ]);
    }
    renderMainPage(vnode) {
        return m(".pb.pt.flex.col.gap-vpad.fit-height.box-content", {
            style: {
                // The date picker dialogs have position: fixed, and they are fixed relative to the most recent ancestor with
                // a transform. So doing a no-op transform will make the dropdowns scroll with the dialog
                // without this, then the date picker dialogs will show at the same place on the screen regardless of whether the
                // editor has scrolled or not.
                // Ideally we could do this inside DatePicker itself, but the rendering breaks and the dialog appears below it's siblings
                // We also don't want to do this for all dialogs because it could potentially cause other issues
                transform: "translate(0)",
                color: theme.button_bubble_fg,
                "pointer-events": `${this.allowRenderMainPage() ? "auto" : "none"}`,
                width: px(this.pageWidth),
            },
        }, [
            this.allowRenderMainPage()
                ? m.fragment({}, [
                    this.renderReadonlyMessage(vnode.attrs),
                    this.renderTitle(vnode.attrs),
                    this.renderEventTimeEditor(vnode.attrs),
                    this.renderCalendarPicker(vnode),
                    this.renderRepeatRuleNavButton(vnode.attrs),
                    this.renderRemindersEditor(vnode),
                    this.renderGuestsNavButton(vnode.attrs),
                    this.renderLocationField(vnode),
                ])
                : null,
            this.renderDescriptionEditor(vnode),
        ]);
    }
    renderRepeatRulesPage({ attrs: { model, navigationCallback } }) {
        const { whenModel } = model.editModels;
        return m(RepeatRuleEditor, {
            model: whenModel,
            startOfTheWeekOffset: this.startOfTheWeekOffset,
            width: this.pageWidth,
            backAction: () => navigationCallback(EditorPages.MAIN),
        });
    }
    getTranslatedRepeatRule(rule, isAllDay) {
        if (rule == null)
            return lang.get("calendarRepeatIntervalNoRepeat_label");
        const frequency = formatRepetitionFrequency(rule);
        return frequency ? frequency + formatRepetitionEnd(rule, isAllDay) : lang.get("unknownRepetition_msg");
    }
}
//# sourceMappingURL=CalendarEventEditView.js.map