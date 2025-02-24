import { migrateAllListElements } from "../StandardMigrations.js";
import { CalendarEventTypeRef } from "../../../entities/tutanota/TypeRefs.js";
export const sys118 = {
    app: "sys",
    version: 118,
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
//# sourceMappingURL=sys-v118.js.map