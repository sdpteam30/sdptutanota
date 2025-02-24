import m from "mithril";
import { downcast, isEmpty, isSameTypeRef } from "@tutao/tutanota-utils";
import { px, size } from "../../../common/gui/size.js";
import { CalendarEventTypeRef } from "../../../common/api/entities/tutanota/TypeRefs.js";
import { lang } from "../../../common/misc/LanguageViewModel.js";
import { locator } from "../../../common/api/main/CommonLocator.js";
import { FULL_INDEXED_TIMESTAMP } from "../../../common/api/common/TutanotaConstants.js";
import { formatDate } from "../../../common/misc/Formatter.js";
import { formatEventDuration } from "../gui/CalendarGuiUtils.js";
import { getTimeZone } from "../../../common/calendar/date/CalendarUtils.js";
export class CalendarSearchBarOverlay {
    view({ attrs }) {
        const { state } = attrs;
        return [state.entities && !isEmpty(state.entities) && attrs.isQuickSearch && attrs.isFocused ? this.renderResults(state, attrs) : null];
    }
    renderResults(state, attrs) {
        return m("ul.list.click.mail-list", [
            state.entities.map((result) => {
                return m("li.plr-l.flex-v-center.", {
                    style: {
                        height: px(52),
                        "border-left": px(size.border_selection) + " solid transparent",
                    },
                    // avoid closing overlay before the click event can be received
                    onmousedown: (e) => e.preventDefault(),
                    onclick: () => attrs.selectResult(result),
                    class: state.selected === result ? "row-selected" : "",
                }, this.renderResult(state, result));
            }),
        ]);
    }
    renderResult(state, result) {
        let type = "_type" in result ? result._type : null;
        if (!type) {
            return this.renderShowMoreAction(downcast(result));
        }
        else if (isSameTypeRef(CalendarEventTypeRef, type)) {
            return this.renderCalendarEventResult(downcast(result));
        }
        else {
            return [];
        }
    }
    renderShowMoreAction(result) {
        // show more action
        let showMoreAction = result;
        let infoText;
        let indexInfo;
        if (showMoreAction.resultCount === 0) {
            infoText = lang.get("searchNoResults_msg");
            if (locator.logins.getUserController().isFreeAccount()) {
                indexInfo = lang.get("changeTimeFrame_msg");
            }
        }
        else if (showMoreAction.allowShowMore) {
            infoText = lang.get("showMore_action");
        }
        else {
            infoText = lang.get("moreResultsFound_msg", {
                "{1}": showMoreAction.resultCount - showMoreAction.shownCount,
            });
        }
        if (showMoreAction.indexTimestamp > FULL_INDEXED_TIMESTAMP && !indexInfo) {
            indexInfo = lang.get("searchedUntil_msg") + " " + formatDate(new Date(showMoreAction.indexTimestamp));
        }
        return indexInfo
            ? [m(".top.flex-center", infoText), m(".bottom.flex-center.small", indexInfo)]
            : m("li.plr-l.pt-s.pb-s.items-center.flex-center", m(".flex-center", infoText));
    }
    renderCalendarEventResult(event) {
        return [
            m(".top.flex-space-between", m(".name.text-ellipsis", { title: event.summary }, event.summary)),
            m(".bottom.flex-space-between", m("small.mail-address", formatEventDuration(event, getTimeZone(), false))),
        ];
    }
}
//# sourceMappingURL=CalendarSearchBarOverlay.js.map