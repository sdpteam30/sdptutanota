import { Header } from "../../../../common/gui/Header.js";
import { PaidFunctionResult } from "./CalendarSearchViewModel.js";
import { BaseTopLevelView } from "../../../../common/gui/BaseTopLevelView.js";
import { ViewColumn } from "../../../../common/gui/base/ViewColumn.js";
import { ViewSlider } from "../../../../common/gui/nav/ViewSlider.js";
import { assertNotNull, last, LazyLoaded, lazyMemoized, memoized, noOp, stringToBase64 } from "@tutao/tutanota-utils";
import m from "mithril";
import { SidebarSection } from "../../../../common/gui/SidebarSection.js";
import { NavButton } from "../../../../common/gui/base/NavButton.js";
import { px, size } from "../../../../common/gui/size.js";
import { lang } from "../../../../common/misc/LanguageViewModel.js";
import { BackgroundColumnLayout } from "../../../../common/gui/BackgroundColumnLayout.js";
import { theme } from "../../../../common/gui/theme.js";
import { DesktopListToolbar, DesktopViewerToolbar } from "../../../../common/gui/DesktopToolbars.js";
import { CalendarSearchListView } from "./CalendarSearchListView.js";
import { isSameId } from "../../../../common/api/common/utils/EntityUtils.js";
import { keyManager } from "../../../../common/misc/KeyManager.js";
import { styles } from "../../../../common/gui/styles.js";
import { BaseMobileHeader } from "../../../../common/gui/BaseMobileHeader.js";
import { MobileHeader } from "../../../../common/gui/MobileHeader.js";
import { searchBar } from "../CalendarSearchBar.js";
import { ProgressBar } from "../../../../common/gui/base/ProgressBar.js";
import ColumnEmptyMessageBox from "../../../../common/gui/base/ColumnEmptyMessageBox.js";
import { EventDetailsView, handleEventDeleteButtonClick, handleEventEditButtonClick, handleSendUpdatesClick, } from "../../view/EventDetailsView.js";
import { DropDownSelector } from "../../../../common/gui/base/DropDownSelector.js";
import { FeatureType, Keys } from "../../../../common/api/common/TutanotaConstants.js";
import { IconButton } from "../../../../common/gui/base/IconButton.js";
import { showNotAvailableForFreeDialog } from "../../../../common/misc/SubscriptionDialogs.js";
import { listSelectionKeyboardShortcuts } from "../../../../common/gui/base/ListUtils.js";
import { showProgressDialog } from "../../../../common/gui/dialogs/ProgressDialog.js";
import { getEventWithDefaultTimes, setNextHalfHour } from "../../../../common/api/common/utils/CommonCalendarUtils.js";
import { getSharedGroupName } from "../../../../common/sharing/GroupUtils.js";
import { Checkbox } from "../../../../common/gui/base/Checkbox.js";
import { MobileActionBar } from "../../../../common/gui/MobileActionBar.js";
import { assertMainOrNode } from "../../../../common/api/common/Env.js";
import { calendarLocator } from "../../../calendarLocator.js";
import { client } from "../../../../common/misc/ClientDetector.js";
import { CALENDAR_PREFIX } from "../../../../common/misc/RouteChange.js";
import { Dialog } from "../../../../common/gui/base/Dialog.js";
import { locator } from "../../../../common/api/main/CommonLocator.js";
import { extractContactIdFromEvent, isBirthdayEvent } from "../../../../common/calendar/date/CalendarUtils.js";
import { ContactCardViewer } from "../../../../mail-app/contacts/view/ContactCardViewer.js";
import { simulateMailToClick } from "../../gui/eventpopup/ContactPreviewView.js";
import { DatePicker } from "../../gui/pickers/DatePicker.js";
import { EventEditorDialog } from "../../gui/eventeditor-view/CalendarEventEditDialog.js";
assertMainOrNode();
export class CalendarSearchView extends BaseTopLevelView {
    resultListColumn;
    resultDetailsColumn;
    viewSlider;
    searchViewModel;
    contactModel;
    startOfTheWeekOffset;
    datePickerWarning = null;
    getSanitizedPreviewData = memoized((event) => new LazyLoaded(async () => {
        const calendars = await this.searchViewModel.getLazyCalendarInfos().getAsync();
        const eventPreviewModel = await calendarLocator.calendarEventPreviewModel(event, calendars);
        eventPreviewModel.sanitizeDescription().then(() => m.redraw());
        return eventPreviewModel;
    }).load());
    getContactPreviewData = memoized((id) => new LazyLoaded(async () => {
        const idParts = id.split("/");
        const contact = await this.contactModel.loadContactFromId([idParts[0], idParts[1]]);
        m.redraw();
        return contact;
    }).load());
    constructor(vnode) {
        super();
        this.searchViewModel = vnode.attrs.makeViewModel();
        this.contactModel = vnode.attrs.contactModel;
        this.startOfTheWeekOffset = this.searchViewModel.getStartOfTheWeekOffset();
        this.resultListColumn = new ViewColumn({
            view: () => {
                return m(BackgroundColumnLayout, {
                    backgroundColor: theme.navigation_bg,
                    desktopToolbar: () => m(DesktopListToolbar, [m(".button-height")]),
                    mobileHeader: () => this.renderMobileListHeader(vnode.attrs.header),
                    columnLayout: this.getResultColumnLayout(),
                });
            },
        }, 1 /* ColumnType.Background */, {
            minWidth: size.second_col_min_width,
            maxWidth: size.second_col_max_width,
            headerCenter: "searchResult_label",
        });
        this.resultDetailsColumn = new ViewColumn({
            view: () => this.renderDetailsView(vnode.attrs.header),
        }, 1 /* ColumnType.Background */, {
            minWidth: size.third_col_min_width,
            maxWidth: size.third_col_max_width,
        });
        this.viewSlider = new ViewSlider([this.resultListColumn, this.resultDetailsColumn], false);
    }
    getResultColumnLayout() {
        return m(CalendarSearchListView, {
            listModel: this.searchViewModel.listModel,
            onSingleSelection: (item) => {
                this.viewSlider.focus(this.resultDetailsColumn);
            },
            cancelCallback: () => {
                this.searchViewModel.sendStopLoadingSignal();
            },
            isFreeAccount: calendarLocator.logins.getUserController().isFreeAccount(),
        });
    }
    renderFilterSection() {
        return m(SidebarSection, { name: "filter_label" }, this.renderCalendarFilterSection());
    }
    oncreate() {
        this.searchViewModel.init();
        keyManager.registerShortcuts(this.shortcuts());
    }
    onremove() {
        this.searchViewModel.dispose();
        keyManager.unregisterShortcuts(this.shortcuts());
    }
    renderMobileListHeader(header) {
        return this.renderMobileListActionsHeader(header);
    }
    renderMobileListActionsHeader(header) {
        const rightActions = [];
        if (styles.isSingleColumnLayout()) {
            rightActions.push(this.renderHeaderRightView());
        }
        return m(BaseMobileHeader, {
            left: m(".icon-button", m(NavButton, {
                label: "back_action",
                hideLabel: true,
                icon: () => "Back" /* BootIcons.Back */,
                href: CALENDAR_PREFIX,
                centred: true,
                fillSpaceAround: false,
            })),
            right: rightActions,
            center: m(".flex-grow.flex.justify-center", m(searchBar, {
                placeholder: this.searchBarPlaceholder(),
                returnListener: () => this.resultListColumn.focus(),
            })),
            injections: m(ProgressBar, { progress: header.offlineIndicatorModel.getProgress() }),
        });
    }
    /** depending on the search and selection state we want to render a
     * (multi) mail viewer or a (multi) contact viewer or an event preview
     */
    renderDetailsView(header) {
        if (this.searchViewModel.listModel.isSelectionEmpty() && this.viewSlider.focusedColumn === this.resultDetailsColumn) {
            this.viewSlider.focus(this.resultListColumn);
            return null;
        }
        const selectedEvent = this.searchViewModel.getSelectedEvents()[0];
        return m(BackgroundColumnLayout, {
            backgroundColor: theme.navigation_bg,
            desktopToolbar: () => m(DesktopViewerToolbar, []),
            mobileHeader: () => m(MobileHeader, {
                ...header,
                backAction: () => this.viewSlider.focusPreviousColumn(),
                columnType: "other",
                title: "search_label",
                actions: null,
                multicolumnActions: () => [],
                primaryAction: () => this.renderHeaderRightView(),
            }),
            columnLayout: selectedEvent == null
                ? m(ColumnEmptyMessageBox, {
                    message: "noEventSelect_msg",
                    icon: "Calendar" /* BootIcons.Calendar */,
                    color: theme.content_message_bg,
                    backgroundColor: theme.navigation_bg,
                })
                : !this.getSanitizedPreviewData(selectedEvent).isLoaded()
                    ? null
                    : this.renderEventPreview(selectedEvent),
        });
    }
    renderEventPreview(event) {
        if (isBirthdayEvent(event.uid)) {
            const idParts = event._id[1].split("#");
            const contactId = extractContactIdFromEvent(last(idParts));
            if (contactId != null && this.getContactPreviewData(contactId).isLoaded()) {
                return this.renderContactPreview(this.getContactPreviewData(contactId).getSync());
            }
            return null;
        }
        else if (this.getSanitizedPreviewData(event).isLoaded()) {
            return this.renderEventDetails(event);
        }
        return null;
    }
    renderContactPreview(contact) {
        return m(".fill-absolute.flex.col.overflow-y-scroll", m(ContactCardViewer, {
            contact: contact,
            editAction: async (contact) => {
                if (!(await Dialog.confirm("openMailApp_msg", "yes_label")))
                    return;
                const query = `contactId=${stringToBase64(contact._id.join("/"))}`;
                calendarLocator.systemFacade.openMailApp(stringToBase64(query));
            },
            onWriteMail: (to) => simulateMailToClick(to.address),
            extendedActions: true,
        }));
    }
    renderEventDetails(selectedEvent) {
        return m(".height-100p.overflow-y-scroll.mb-l.fill-absolute.pb-l", m(".border-radius-big.flex.col.flex-grow.content-bg", {
            class: styles.isDesktopLayout() ? "mlr-l" : "mlr",
            style: {
                "min-width": styles.isDesktopLayout() ? px(size.third_col_min_width) : null,
                "max-width": styles.isDesktopLayout() ? px(size.third_col_max_width) : null,
            },
        }, m(EventDetailsView, {
            eventPreviewModel: assertNotNull(this.getSanitizedPreviewData(selectedEvent).getSync()),
        })));
    }
    renderSearchResultActions() {
        if (this.viewSlider.focusedColumn !== this.resultDetailsColumn)
            return null;
        const selectedEvent = this.searchViewModel.getSelectedEvents()[0];
        if (!selectedEvent) {
            this.viewSlider.focus(this.resultListColumn);
            return m(MobileActionBar, { actions: [] });
        }
        const previewModel = this.getSanitizedPreviewData(selectedEvent).getSync();
        const actions = [];
        if (previewModel) {
            if (previewModel.canSendUpdates) {
                actions.push({
                    icon: "Mail" /* BootIcons.Mail */,
                    title: "sendUpdates_label",
                    action: () => handleSendUpdatesClick(previewModel),
                });
            }
            if (previewModel.canEdit) {
                actions.push({
                    icon: "Edit" /* Icons.Edit */,
                    title: "edit_action",
                    action: (ev, receiver) => handleEventEditButtonClick(previewModel, ev, receiver),
                });
            }
            if (previewModel.canDelete) {
                actions.push({
                    icon: "Trash" /* Icons.Trash */,
                    title: "delete_action",
                    action: (ev, receiver) => handleEventDeleteButtonClick(previewModel, ev, receiver),
                });
            }
        }
        else {
            this.getSanitizedPreviewData(selectedEvent).load();
        }
        return actions.map((action) => m(IconButton, {
            title: action.title,
            icon: action.icon,
            click: action.action,
        }));
    }
    searchBarPlaceholder() {
        return lang.get("searchCalendar_placeholder");
    }
    renderCalendarFilterSection() {
        return [this.renderDateRangeSelection(), this.renderCalendarFilter(), this.renderRepeatingFilter()].map((row) => m(".folder-row.plr-button.content-fg", row));
    }
    getViewSlider() {
        return this.viewSlider;
    }
    renderHeaderRightView() {
        if (styles.isUsingBottomNavigation() && !client.isCalendarApp()) {
            return m(IconButton, {
                click: () => this.createNewEventDialog(),
                title: "newEvent_action",
                icon: "Add" /* Icons.Add */,
            });
        }
        else if (client.isCalendarApp()) {
            return m.fragment({}, [
                this.renderSearchResultActions(),
                m(IconButton, {
                    icon: "Filter" /* Icons.Filter */,
                    title: "filter_label",
                    click: () => {
                        const dialog = Dialog.editSmallDialog({
                            middle: "filter_label",
                            right: [
                                {
                                    label: "ok_action",
                                    click: () => {
                                        dialog.close();
                                    },
                                    type: "primary" /* ButtonType.Primary */,
                                },
                            ],
                        }, () => m(".pt-m.pb-ml", this.renderCalendarFilterSection()));
                        dialog.setFocusOnLoadFunction(noOp);
                        dialog.show();
                    },
                }),
            ]);
        }
    }
    renderDateRangeSelection() {
        const renderedHelpText = this.searchViewModel.warning === "startafterend"
            ? "startAfterEnd_label"
            : this.searchViewModel.warning === "long"
                ? "longSearchRange_msg"
                : this.searchViewModel.startDate == null
                    ? "unlimited_label"
                    : undefined;
        return m(".flex.col", m(".pl-s.flex-grow.flex-space-between.flex-column", m(DatePicker, {
            date: this.searchViewModel.startDate ?? undefined,
            onDateSelected: (date) => {
                if (this.searchViewModel.selectStartDate(date) != PaidFunctionResult.Success) {
                    showNotAvailableForFreeDialog();
                }
            },
            startOfTheWeekOffset: this.startOfTheWeekOffset,
            label: "dateFrom_label",
            nullSelectionText: renderedHelpText,
            rightAlignDropdown: true,
        })), m(".pl-s.flex-grow.flex-space-between.flex-column", m(DatePicker, {
            date: this.searchViewModel.endDate,
            onDateSelected: (date) => {
                if (this.searchViewModel.selectEndDate(date) != PaidFunctionResult.Success) {
                    showNotAvailableForFreeDialog();
                }
            },
            startOfTheWeekOffset: this.startOfTheWeekOffset,
            label: "dateTo_label",
            rightAlignDropdown: true,
        })));
    }
    shortcuts = lazyMemoized(() => [
        ...listSelectionKeyboardShortcuts(1 /* MultiselectMode.Enabled */, () => this.searchViewModel.listModel),
        {
            key: Keys.N,
            exec: () => {
                this.createNewEventDialog();
            },
            enabled: () => calendarLocator.logins.isInternalUserLoggedIn() && !calendarLocator.logins.isEnabled(FeatureType.ReplyOnly),
            help: "newMail_action",
        },
    ]);
    async onNewUrl(args, requestedPath) {
        // calling init here too because this is called very early in the lifecycle and onNewUrl won't work properly if init is called
        // afterwords
        await this.searchViewModel.init();
        this.searchViewModel.onNewUrl(args, requestedPath);
        this.invalidateBirthdayPreview();
        // redraw because init() is async
        m.redraw();
    }
    invalidateBirthdayPreview() {
        const selectedEvent = this.searchViewModel.getSelectedEvents()[0];
        if (!selectedEvent || !isBirthdayEvent(selectedEvent.uid)) {
            return;
        }
        const idParts = selectedEvent._id[1].split("#");
        const contactId = extractContactIdFromEvent(last(idParts));
        if (!contactId) {
            return;
        }
        this.getContactPreviewData(contactId).reload().then(m.redraw);
    }
    async createNewEventDialog() {
        const dateToUse = this.searchViewModel.startDate ? setNextHalfHour(new Date(this.searchViewModel.startDate)) : setNextHalfHour(new Date());
        // Disallow creation of events when there is no existing calendar
        const lazyCalendarInfo = this.searchViewModel.getLazyCalendarInfos();
        const calendarInfos = lazyCalendarInfo.isLoaded() ? lazyCalendarInfo.getSync() : lazyCalendarInfo.getAsync();
        if (calendarInfos instanceof Promise) {
            await showProgressDialog("pleaseWait_msg", calendarInfos);
        }
        const mailboxDetails = await calendarLocator.mailboxModel.getUserMailboxDetails();
        const mailboxProperties = await calendarLocator.mailboxModel.getMailboxProperties(mailboxDetails.mailboxGroupRoot);
        const model = await calendarLocator.calendarEventModel(0 /* CalendarOperation.Create */, getEventWithDefaultTimes(dateToUse), mailboxDetails, mailboxProperties, null);
        if (model) {
            const eventEditor = new EventEditorDialog();
            await eventEditor.showNewCalendarEventEditDialog(model);
        }
    }
    renderCalendarFilter() {
        if (this.searchViewModel.getLazyCalendarInfos().isLoaded() && this.searchViewModel.getUserHasNewPaidPlan().isLoaded()) {
            const calendarInfos = this.searchViewModel.getLazyCalendarInfos().getSync() ?? [];
            // Load user's calendar list
            const items = Array.from(calendarInfos.values()).map((ci) => ({
                name: getSharedGroupName(ci.groupInfo, locator.logins.getUserController(), true),
                value: ci,
            }));
            if (this.searchViewModel.getUserHasNewPaidPlan().getSync()) {
                const localCalendars = this.searchViewModel.getLocalCalendars().map((cal) => ({
                    name: cal.name,
                    value: cal.id,
                }));
                items.push(...localCalendars);
            }
            // Find the selected value after loading the available calendars
            const selectedValue = items.find((calendar) => {
                if (!calendar.value) {
                    return;
                }
                if (typeof calendar.value === "string") {
                    return calendar.value === this.searchViewModel.selectedCalendar;
                }
                // It isn't a string, so it can be only a Calendar Info
                const calendarValue = calendar.value;
                return isSameId([calendarValue.groupRoot.longEvents, calendarValue.groupRoot.shortEvents], this.searchViewModel.selectedCalendar);
            })?.value ?? null;
            return m(".ml-button", m(DropDownSelector, {
                label: "calendar_label",
                items: [{ name: lang.get("all_label"), value: null }, ...items],
                selectedValue,
                selectionChangedHandler: (value) => {
                    // value can be null if default option has been selected
                    this.searchViewModel.selectCalendar(value);
                },
            }));
        }
        else {
            return null;
        }
    }
    renderRepeatingFilter() {
        return m(".mlr-button", m(Checkbox, {
            label: () => lang.get("includeRepeatingEvents_action"),
            checked: this.searchViewModel.includeRepeatingEvents,
            onChecked: (value) => {
                this.searchViewModel.selectIncludeRepeatingEvents(value);
            },
        }));
    }
    view({ attrs }) {
        return m("#search.main-view", m(this.viewSlider, {
            header: m(Header, {
                searchBar: () => m(searchBar, {
                    placeholder: this.searchBarPlaceholder(),
                    returnListener: () => this.resultListColumn.focus(),
                }),
                ...attrs.header,
            }),
        }));
    }
}
//# sourceMappingURL=CalendarSearchView.js.map