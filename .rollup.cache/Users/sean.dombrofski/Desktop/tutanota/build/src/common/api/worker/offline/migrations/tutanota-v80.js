import { migrateAllListElements } from "../StandardMigrations";
import { CalendarEventTypeRef } from "../../../entities/tutanota/TypeRefs";
export const tutanota80 = {
    app: "tutanota",
    version: 80,
    async migrate(storage) {
        await migrateAllListElements(CalendarEventTypeRef, storage, [
            (calendarEvent) => {
                if (calendarEvent.repeatRule) {
                    calendarEvent.repeatRule.advancedRules = [];
                }
                return calendarEvent;
            },
        ]);
    },
};
//# sourceMappingURL=tutanota-v80.js.map