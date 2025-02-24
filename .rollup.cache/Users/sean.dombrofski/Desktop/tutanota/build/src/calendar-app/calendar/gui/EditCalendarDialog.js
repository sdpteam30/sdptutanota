import { Dialog } from "../../../common/gui/base/Dialog.js";
import m from "mithril";
import stream from "mithril/stream";
import { TextField } from "../../../common/gui/base/TextField.js";
import { lang } from "../../../common/misc/LanguageViewModel.js";
import { deepEqual, isNotNull } from "@tutao/tutanota-utils";
import { isExternalCalendarType, isNormalCalendarType } from "../../../common/calendar/date/CalendarUtils.js";
import { RemindersEditor } from "./RemindersEditor.js";
import { checkURLString, isIcal } from "../../../common/calendar/import/ImportExportUtils.js";
import { locator } from "../../../common/api/main/CommonLocator.js";
import { DEFAULT_ERROR } from "../../../common/api/common/TutanotaConstants.js";
import { LoginButton } from "../../../common/gui/base/buttons/LoginButton.js";
import { ColorPickerView } from "../../../common/gui/base/colorPicker/ColorPickerView";
import { generateRandomColor } from "./CalendarGuiUtils.js";
export const defaultCalendarProperties = {
    name: "",
    color: "",
    alarms: [],
    sourceUrl: "",
};
export async function handleUrlSubscription(calendarModel, url) {
    if (!locator.logins.isFullyLoggedIn())
        return new Error("notFullyLoggedIn_msg");
    const externalIcalStr = await calendarModel.fetchExternalCalendar(url).catch((e) => e);
    if (externalIcalStr instanceof Error || externalIcalStr.trim() === "")
        return new Error("fetchingExternalCalendar_error");
    if (!isIcal(externalIcalStr))
        return new Error("invalidICal_error");
    return externalIcalStr;
}
function sourceUrlInputField(urlStream, errorMessageStream) {
    const errorMessage = errorMessageStream().trim();
    let helperMessage = "";
    if (urlStream().trim() === "")
        helperMessage = "E.g: https://tuta.com/ics/example.ics";
    else if (isNotNull(errorMessage) && errorMessage !== DEFAULT_ERROR)
        helperMessage = errorMessage;
    return m(TextField, {
        class: `pt pb ${helperMessage.length ? "" : "mb-small-line-height"}`,
        value: urlStream(),
        oninput: (url, inputElement) => {
            const assertionResult = checkURLString(url);
            urlStream(url);
            if (assertionResult instanceof URL) {
                errorMessageStream("");
                return;
            }
            errorMessageStream(lang.get(assertionResult));
        },
        label: "url_label",
        type: "url" /* TextFieldType.Url */,
        helpLabel: () => m("small.block.content-fg", helperMessage),
    });
}
function createEditCalendarComponent(nameStream, colorStream, shared, calendarType, alarms, urlStream, errorMessageStream) {
    return m.fragment({}, [
        m(TextField, {
            value: nameStream(),
            oninput: nameStream,
            label: "calendarName_label",
        }),
        m(".small.mt.mb-xs", lang.get("color_label")),
        m(ColorPickerView, {
            value: colorStream(),
            onselect: (color) => {
                colorStream(color);
            },
        }),
        !shared && isNormalCalendarType(calendarType)
            ? m(RemindersEditor, {
                alarms,
                addAlarm: (alarm) => {
                    alarms?.push(alarm);
                },
                removeAlarm: (alarm) => {
                    const index = alarms?.findIndex((a) => deepEqual(a, alarm));
                    if (index !== -1)
                        alarms?.splice(index, 1);
                },
                label: "calendarDefaultReminder_label",
                useNewEditor: false,
            })
            : null,
        isExternalCalendarType(calendarType) ? sourceUrlInputField(urlStream, errorMessageStream) : null,
    ]);
}
export function showCreateEditCalendarDialog({ calendarType, titleTextId, shared, okAction, okTextId, warningMessage, calendarProperties: { name, color, alarms, sourceUrl } = defaultCalendarProperties, isNewCalendar = true, calendarModel, }) {
    if (color !== "") {
        color = "#" + color;
    }
    else if (isNewCalendar && isExternalCalendarType(calendarType)) {
        color = generateRandomColor();
    }
    const nameStream = stream(name);
    const colorStream = stream(color);
    const urlStream = stream(sourceUrl ?? "");
    const errorMessageStream = stream(DEFAULT_ERROR);
    const externalCalendarValidator = async () => {
        const assertionResult = checkURLString(urlStream());
        if (!calendarModel)
            throw new Error("Missing model");
        if (assertionResult instanceof URL) {
            const externalCalendarResult = await handleUrlSubscription(calendarModel, urlStream());
            if (externalCalendarResult instanceof Error)
                return externalCalendarResult.message;
        }
        else {
            return assertionResult;
        }
        return null;
    };
    const doAction = async (dialog) => {
        okAction(dialog, {
            name: nameStream(),
            color: colorStream().substring(1),
            alarms,
            sourceUrl: urlStream().trim(),
        }, calendarModel);
    };
    const externalCalendarDialogProps = {
        title: "",
        child: {
            view: () => m(".flex.col", [
                m(".mt.mb.h6.b", lang.get(titleTextId)),
                warningMessage ? warningMessage() : null,
                sourceUrlInputField(urlStream, errorMessageStream),
                m(LoginButton, {
                    label: okTextId,
                    onclick: () => {
                        externalCalendarValidator()
                            .then((validatorResult) => {
                            if (validatorResult) {
                                Dialog.message(validatorResult);
                                return;
                            }
                            doAction(dialog);
                        })
                            .catch((e) => Dialog.message(lang.makeTranslation("error_message", e.message)));
                    },
                    class: errorMessageStream().trim() !== "" ? "mt-s no-hover button-bg" : "mt-s",
                    disabled: errorMessageStream().trim() !== "",
                }),
            ]),
        },
        okAction: null,
    };
    const dialog = Dialog.createActionDialog(Object.assign({
        allowOkWithReturn: true,
        okActionTextId: okTextId,
        title: titleTextId,
        child: {
            view: () => m(".flex.col", [
                warningMessage ? warningMessage() : null,
                createEditCalendarComponent(nameStream, colorStream, shared, calendarType, alarms, urlStream, errorMessageStream),
            ]),
        },
        okAction: doAction,
    }, isNewCalendar && isExternalCalendarType(calendarType) ? externalCalendarDialogProps : {}));
    dialog.show();
}
//# sourceMappingURL=EditCalendarDialog.js.map