/**
 * This file contains the functions used to set up and tear down edit dialogs for calendar events.
 *
 * they're not responsible for upholding invariants or ensure valid events (CalendarEventModel.editModels
 * and CalendarEventEditView do that), but know what additional information to ask the user before saving
 * and which methods to call to save the changes.
 */
import { Dialog } from "../../../../common/gui/base/Dialog.js";
import { lang } from "../../../../common/misc/LanguageViewModel.js";
import { Keys } from "../../../../common/api/common/TutanotaConstants.js";
import { getStartOfTheWeekOffsetForUser, getTimeFormatForUser, parseAlarmInterval } from "../../../../common/calendar/date/CalendarUtils.js";
import { client } from "../../../../common/misc/ClientDetector.js";
import { assertNotNull, noOp } from "@tutao/tutanota-utils";
import { locator } from "../../../../common/api/main/CommonLocator.js";
import { CalendarEventEditView, EditorPages } from "./CalendarEventEditView.js";
import { askIfShouldSendCalendarUpdatesToAttendees } from "../CalendarGuiUtils.js";
import { ProgrammingError } from "../../../../common/api/common/error/ProgrammingError.js";
import { UpgradeRequiredError } from "../../../../common/api/main/UpgradeRequiredError.js";
import { showPlanUpgradeRequiredDialog } from "../../../../common/misc/SubscriptionDialogs.js";
import { convertTextToHtml } from "../../../../common/misc/Formatter.js";
import { UserError } from "../../../../common/api/main/UserError.js";
import { showUserError } from "../../../../common/misc/ErrorHandlerImpl.js";
import { theme } from "../../../../common/gui/theme.js";
import stream from "mithril/stream";
import { handleRatingByEvent } from "../../../../common/ratings/InAppRatingDialog.js";
export class EventEditorDialog {
    currentPage = stream(EditorPages.MAIN);
    dialog = null;
    headerDom = null;
    constructor() { }
    left() {
        if (this.currentPage() === EditorPages.MAIN) {
            return [
                {
                    label: "cancel_action",
                    click: () => this.dialog?.close(),
                    type: "secondary" /* ButtonType.Secondary */,
                },
            ];
        }
        return [
            {
                label: "back_action",
                click: () => this.currentPage(EditorPages.MAIN),
                type: "secondary" /* ButtonType.Secondary */,
            },
        ];
    }
    right(okAction) {
        if (this.currentPage() === EditorPages.MAIN) {
            return [
                {
                    label: "save_action",
                    click: (event, dom) => okAction(dom),
                    type: "primary" /* ButtonType.Primary */,
                },
            ];
        }
        return [];
    }
    /**
     * the generic way to open any calendar edit dialog. the caller should know what to do after the
     * dialog is closed.
     */
    async showCalendarEventEditDialog(model, responseMail, handler) {
        const recipientsSearch = await locator.recipientsSearchModel();
        const { HtmlEditor } = await import("../../../../common/gui/editor/HtmlEditor.js");
        const groupSettings = locator.logins.getUserController().userSettingsGroupRoot.groupSettings;
        const groupColors = groupSettings.reduce((acc, gc) => {
            acc.set(gc.group, gc.color);
            return acc;
        }, new Map());
        const defaultAlarms = groupSettings.reduce((acc, gc) => {
            acc.set(gc.group, gc.defaultAlarmsList.map((alarm) => parseAlarmInterval(alarm.trigger)));
            return acc;
        }, new Map());
        const descriptionText = convertTextToHtml(model.editModels.description.content);
        const descriptionEditor = new HtmlEditor()
            .setShowOutline(true)
            .setMinHeight(200)
            .setEnabled(true)
            // We only set it once, we don't viewModel on every change, that would be slow
            .setValue(descriptionText);
        const okAction = (dom) => {
            model.editModels.description.content = descriptionEditor.getTrimmedValue();
            handler(dom.getBoundingClientRect(), () => dialog.close());
        };
        const summary = model.editModels.summary.content;
        const heading = summary.trim().length > 0 ? lang.makeTranslation("summary", summary) : "createEvent_label";
        const navigationCallback = (targetPage) => {
            this.currentPage(targetPage);
        };
        const dialog = Dialog.editMediumDialog({
            left: this.left.bind(this),
            middle: heading,
            right: this.right.bind(this, okAction),
            create: (dom) => {
                this.headerDom = dom;
            },
        }, CalendarEventEditView, {
            model,
            recipientsSearch,
            descriptionEditor,
            startOfTheWeekOffset: getStartOfTheWeekOffsetForUser(locator.logins.getUserController().userSettingsGroupRoot),
            timeFormat: getTimeFormatForUser(locator.logins.getUserController().userSettingsGroupRoot),
            groupColors,
            defaultAlarms,
            navigationCallback,
            currentPage: this.currentPage,
        }, {
            height: "100%",
            "background-color": theme.navigation_bg,
        })
            .addShortcut({
            key: Keys.ESC,
            exec: () => dialog.close(),
            help: "close_alt",
        })
            .addShortcut({
            key: Keys.S,
            ctrlOrCmd: true,
            exec: () => okAction(assertNotNull(this.headerDom, "headerDom was null")),
            help: "save_action",
        });
        if (client.isMobileDevice()) {
            // Prevent focusing text field automatically on mobile. It opens keyboard and you don't see all details.
            dialog.setFocusOnLoadFunction(noOp);
        }
        this.dialog = dialog;
        dialog.show();
    }
    /**
     * show an edit dialog for an event that does not exist on the server yet (or anywhere else)
     *
     * will unconditionally send invites on save.
     * @param model the calendar event model used to edit and save the event
     */
    async showNewCalendarEventEditDialog(model) {
        let finished = false;
        const okAction = async (posRect, finish) => {
            /** new event, so we always want to send invites. */
            model.editModels.whoModel.shouldSendUpdates = true;
            if (finished) {
                return;
            }
            try {
                const result = await model.apply();
                if (result === 0 /* EventSaveResult.Saved */) {
                    finished = true;
                    finish();
                    await handleRatingByEvent();
                }
            }
            catch (e) {
                if (e instanceof UserError) {
                    // noinspection ES6MissingAwait
                    showUserError(e);
                }
                else if (e instanceof UpgradeRequiredError) {
                    await showPlanUpgradeRequiredDialog(e.plans);
                }
                else {
                    throw e;
                }
            }
        };
        return this.showCalendarEventEditDialog(model, null, okAction);
    }
    /**
     * show a dialog that allows to edit a calendar event that already exists.
     *
     * on save, will validate external passwords, account type and user intent before actually saving and sending updates/invites/cancellations.
     *
     * @param model the calendar event model used to edit & save the event
     * @param identity the identity of the event to edit
     * @param responseMail a mail containing an invite and/or update for this event in case we need to reply to the organizer
     */
    async showExistingCalendarEventEditDialog(model, identity, responseMail = null) {
        let finished = false;
        if (identity.uid == null) {
            throw new ProgrammingError("tried to edit existing event without uid, this is impossible for certain edit operations.");
        }
        const okAction = async (posRect, finish) => {
            if (finished || (await this.askUserIfUpdatesAreNeededOrCancel(model)) === 0 /* ConfirmationResult.Cancel */) {
                return;
            }
            try {
                const result = await model.apply();
                if (result === 0 /* EventSaveResult.Saved */ || result === 2 /* EventSaveResult.NotFound */) {
                    finished = true;
                    finish();
                    // Inform the user that the event was deleted, avoiding misunderstanding that the event was saved
                    if (result === 2 /* EventSaveResult.NotFound */)
                        Dialog.message("eventNoLongerExists_msg");
                }
            }
            catch (e) {
                if (e instanceof UserError) {
                    // noinspection ES6MissingAwait
                    showUserError(e);
                }
                else if (e instanceof UpgradeRequiredError) {
                    await showPlanUpgradeRequiredDialog(e.plans);
                }
                else {
                    throw e;
                }
            }
        };
        await this.showCalendarEventEditDialog(model, responseMail, okAction);
    }
    /** if there are update worthy changes on the model, ask the user what to do with them.
     * @returns {ConfirmationResult} Cancel if the whole process should be cancelled, Continue if the user selected whether to send updates and the saving
     * should proceed.
     * */
    async askUserIfUpdatesAreNeededOrCancel(model) {
        if (model.isAskingForUpdatesNeeded()) {
            switch (await askIfShouldSendCalendarUpdatesToAttendees()) {
                case "yes":
                    model.editModels.whoModel.shouldSendUpdates = true;
                    break;
                case "no":
                    break;
                case "cancel":
                    console.log("not saving event: user cancelled update sending.");
                    return 0 /* ConfirmationResult.Cancel */;
            }
        }
        return 1 /* ConfirmationResult.Continue */;
    }
}
//# sourceMappingURL=CalendarEventEditDialog.js.map