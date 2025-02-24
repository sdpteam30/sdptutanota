import { getDayShifted, getStartOfDay } from "@tutao/tutanota-utils";
export class LocalTimeDateProvider {
    getStartOfDayShiftedBy(shiftByDays) {
        return getStartOfDay(getDayShifted(new Date(), shiftByDays));
    }
}
//# sourceMappingURL=DateProvider.js.map