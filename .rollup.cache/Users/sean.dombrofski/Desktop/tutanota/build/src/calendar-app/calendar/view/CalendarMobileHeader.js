import m from "mithril";
import { IconButton } from "../../../common/gui/base/IconButton.js";
import { BaseMobileHeader } from "../../../common/gui/BaseMobileHeader.js";
import { OfflineIndicator } from "../../../common/gui/base/OfflineIndicator.js";
import { ProgressBar } from "../../../common/gui/base/ProgressBar.js";
import { getIconForViewType } from "../gui/CalendarGuiUtils.js";
import { MobileHeaderBackButton, MobileHeaderMenuButton, MobileHeaderTitle } from "../../../common/gui/MobileHeader.js";
import { attachDropdown } from "../../../common/gui/base/Dropdown.js";
import { lang } from "../../../common/misc/LanguageViewModel.js";
import { styles } from "../../../common/gui/styles.js";
import { theme } from "../../../common/gui/theme.js";
import { TodayIconButton } from "./TodayIconButton.js";
import { ExpanderButton } from "../../../common/gui/base/Expander.js";
import { isApp } from "../../../common/api/common/Env.js";
import { locator } from "../../../common/api/main/CommonLocator.js";
import { NavButton } from "../../../common/gui/base/NavButton.js";
import { CalendarViewType } from "../../../common/api/common/utils/CommonCalendarUtils.js";
import { client } from "../../../common/misc/ClientDetector.js";
/**
 * A special header that is used instead of {@link MobileHeader} but just for calendar.
 */
export class CalendarMobileHeader {
    view({ attrs }) {
        return m(BaseMobileHeader, {
            left: this.renderTopLeftButton(attrs),
            center: m(MobileHeaderTitle, {
                title: attrs.showExpandIcon
                    ? m(ExpanderButton, {
                        label: lang.makeTranslation(attrs.navConfiguration.title, attrs.navConfiguration.title),
                        isUnformattedLabel: true,
                        style: {
                            "padding-top": "inherit",
                            height: "inherit",
                            "min-height": "inherit",
                            "text-decoration": "none",
                        },
                        expanded: attrs.isDaySelectorExpanded,
                        color: theme.content_fg,
                        isBig: true,
                        isPropagatingEvents: true,
                        onExpandedChange: () => { },
                    })
                    : attrs.navConfiguration.title,
                bottom: m(OfflineIndicator, attrs.offlineIndicatorModel.getCurrentAttrs()),
                onTap: attrs.onTap,
            }),
            right: [
                this.renderDateNavigation(attrs),
                m(TodayIconButton, {
                    click: attrs.onToday,
                }),
                this.renderViewSelector(attrs),
                client.isCalendarApp()
                    ? this.renderSearchNavigationButton()
                    : m(IconButton, {
                        icon: "Add" /* Icons.Add */,
                        title: "newEvent_action",
                        click: attrs.onCreateEvent,
                    }),
            ],
            injections: m(ProgressBar, { progress: attrs.offlineIndicatorModel.getProgress() }),
        });
    }
    renderTopLeftButton(attrs) {
        if (attrs.viewType === CalendarViewType.AGENDA && history.state?.origin === CalendarViewType.MONTH) {
            return m(MobileHeaderBackButton, {
                backAction: () => {
                    const date = history.state.dateString ?? new Date().toISOString().substring(0, 10);
                    m.route.set("/calendar/:view/:date", {
                        view: CalendarViewType.MONTH,
                        date,
                    });
                },
            });
        }
        else if (styles.isUsingBottomNavigation() && styles.isDesktopLayout()) {
            return null;
        }
        return m(MobileHeaderMenuButton, { newsModel: attrs.newsModel, backAction: () => attrs.viewSlider.focusPreviousColumn() });
    }
    renderSearchNavigationButton() {
        if (locator.logins.isInternalUserLoggedIn()) {
            return m(".icon-button", m(NavButton, {
                label: "search_label",
                hideLabel: true,
                icon: () => "Search" /* BootIcons.Search */,
                href: "/search/calendar",
                centred: true,
                fillSpaceAround: false,
            }));
        }
        return null;
    }
    renderDateNavigation(attrs) {
        if (isApp() || !(styles.isSingleColumnLayout() || styles.isTwoColumnLayout())) {
            return null;
        }
        return m.fragment({}, [attrs.navConfiguration.back, attrs.navConfiguration.forward]);
    }
    renderViewSelector(attrs) {
        return m(IconButton, attachDropdown({
            mainButtonAttrs: {
                icon: getIconForViewType(attrs.viewType),
                title: "view_label",
            },
            childAttrs: () => {
                const calendarViewValues = [
                    {
                        name: "agenda_label",
                        value: CalendarViewType.AGENDA,
                    },
                    {
                        name: "day_label",
                        value: CalendarViewType.DAY,
                    },
                    {
                        name: "week_label",
                        value: CalendarViewType.WEEK,
                    },
                    {
                        name: "month_label",
                        value: CalendarViewType.MONTH,
                    },
                ];
                return calendarViewValues.map(({ name, value }) => ({
                    label: name,
                    selected: value === attrs.viewType,
                    icon: getIconForViewType(value),
                    click: () => attrs.onViewTypeSelected(value),
                }));
            },
        }));
    }
}
//# sourceMappingURL=CalendarMobileHeader.js.map